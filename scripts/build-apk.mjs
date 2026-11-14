#!/usr/bin/env node
/** Incremental local Android build, following the same Node/Gradle workflow as 3isacrowd.
 * Cozy uses Expo/React Native, so Expo prebuild replaces Capacitor sync.
 */
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,copyFileSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mobile=join(repo,'mobile');
const windows=process.platform==='win32';
const npm=windows?'npm.cmd':'npm';
const npx=windows?'npx.cmd':'npx';

function usage(){
  console.log('node scripts/build-apk.mjs [--platform apk|aab|ios] [--skip-pull] [--skip-install] [--fresh-install] [--force-prebuild] [--output PATH]');
}
export function options(args){
  const value={platform:'apk',skipPull:false,skipInstall:false,freshInstall:false,forcePrebuild:false,output:''};
  for(let i=0;i<args.length;i++){
    const arg=args[i];
    if(arg==='--help'){value.help=true;continue;}
    if(arg==='--platform'||arg==='--output'){
      if(!args[i+1])throw Error(`Missing value for ${arg}`);
      value[arg==='--platform'?'platform':'output']=args[++i];
    }else if(arg==='--skip-pull')value.skipPull=true;
    else if(arg==='--skip-install')value.skipInstall=true;
    else if(arg==='--fresh-install')value.freshInstall=true;
    else if(arg==='--force-prebuild')value.forcePrebuild=true;
    else throw Error(`Unknown option: ${arg}`);
  }
  if(!['apk','aab','ios'].includes(value.platform))throw Error('Platform must be apk, aab, or ios');
  if(value.skipInstall&&value.freshInstall)throw Error('Cannot combine --skip-install and --fresh-install');
  if(value.platform==='ios'&&value.output)throw Error('--output is only supported for local Android builds');
  return value;
}
function run(command,args,cwd=repo){
  console.log(`\n==> ${command} ${args.join(' ')}`);
  const result=spawnSync(command,args,{cwd,stdio:'inherit',shell:windows&&/\.cmd$|\.bat$/i.test(command)});
  if(result.error||result.status!==0)throw Error(`${command} failed (${result.error?.message??result.status})`);
}
function output(command,args,cwd=repo){
  const result=spawnSync(command,args,{cwd,encoding:'utf8',shell:windows&&/\.cmd$|\.bat$/i.test(command)});
  if(result.error||result.status!==0)throw Error(`Failed: ${command} ${args.join(' ')}`);
  return result.stdout.trim();
}
function fingerprint(files){
  const hash=createHash('sha256');
  for(const file of files){hash.update(file);hash.update(readFileSync(join(mobile,file)));}
  return hash.digest('hex');
}
function matches(file,hash){return existsSync(file)&&readFileSync(file,'utf8').trim()===hash;}
function requireAndroidSdk(){
  const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||
    (windows&&process.env.LOCALAPPDATA?join(process.env.LOCALAPPDATA,'Android','Sdk'):'');
  if(!sdk||!existsSync(sdk))throw Error('Android SDK not found. Configure ANDROID_HOME.');
  process.env.ANDROID_HOME=sdk;
  console.log(`Android SDK: ${sdk}`);
}
export function build(argv){
  const opt=options(argv);
  if(opt.help){usage();return;}
  if(!existsSync(join(mobile,'package-lock.json')))throw Error('Run inside the complete Cozy checkout.');
  if(!opt.skipPull){
    if(output('git',['status','--porcelain']))throw Error('Local changes found. Commit/stash them or pass --skip-pull; no files overwritten.');
    run('git',['pull','--ff-only','origin','main']);
  }
  const source=output('git',['rev-parse','--short','HEAD']);
  console.log(`Cozy ${source} — ${opt.platform.toUpperCase()} (incremental build)`);
  const modules=join(mobile,'node_modules');
  const installStamp=join(modules,'.cozy-package-lock.sha256');
  const dependencies=fingerprint(['package.json','package-lock.json']);
  if(opt.skipInstall){
    if(!existsSync(modules))throw Error('node_modules missing; remove --skip-install.');
  }else if(opt.freshInstall||!matches(installStamp,dependencies)){
    run(npm,['ci'],mobile);
    writeFileSync(installStamp,dependencies+'\n');
  }else console.log('==> npm dependencies unchanged — using installed packages');
  run(npm,['run','typecheck'],mobile);
  if(opt.platform==='ios'){
    run(npx,['--yes','eas-cli@latest','build','--platform','ios','--profile','production'],mobile);
    console.log('iOS build submitted to Expo EAS.');
    return;
  }
  requireAndroidSdk();
  const android=join(mobile,'android');
  const gradlew=join(android,windows?'gradlew.bat':'gradlew');
  const nativeStamp=join(android,'.cozy-native-config.sha256');
  const nativeConfig=fingerprint(['app.json','package.json','package-lock.json']);
  if(opt.forcePrebuild||!existsSync(gradlew)||!matches(nativeStamp,nativeConfig)){
    // Keep generated native files and Gradle caches; do not use `--clean`.
    run(npx,['--no-install','expo','prebuild','--platform','android','--no-install'],mobile);
    if(!existsSync(gradlew))throw Error('Expo prebuild did not generate the Android Gradle wrapper.');
    writeFileSync(nativeStamp,nativeConfig+'\n');
  }else console.log('==> Native config unchanged — skipping Expo prebuild');
  const task=opt.platform==='apk'?':app:assembleRelease':':app:bundleRelease';
  // Reuse Gradle daemon and task/build caches; release remains standalone and installable.
  run(gradlew,[task,'--build-cache'],android);
  const sourceArtifact=opt.platform==='apk'?
    join(android,'app','build','outputs','apk','release','app-release.apk'):
    join(android,'app','build','outputs','bundle','release','app-release.aab');
  if(!existsSync(sourceArtifact))throw Error(`Build succeeded without expected artifact: ${sourceArtifact}`);
  const destination=resolve(opt.output||join(homedir(),'Downloads',`cozy.${opt.platform}`));
  mkdirSync(dirname(destination),{recursive:true});
  copyFileSync(sourceArtifact,destination);
  console.log(`\n${opt.platform.toUpperCase()} built from ${source}: ${destination}`);
  console.log('Release signing and install/update behavior must be verified before distribution.');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{build(process.argv.slice(2));}catch(error){console.error(`Build stopped: ${error.message}`);process.exitCode=1;}
}
