import {Alert, Linking, Platform} from 'react-native';
import appConfig from '../app.json';

const manifestUrl='https://dulmens.dk/downloads/cozy.json';
const apkUrl='https://dulmens.dk/downloads/cozy.apk';

export function compareVersions(a:string,b:string):number {
  const parse=(value:string)=>/^\d+\.\d+\.\d+$/.test(value)?value.split('.').map(Number):null;
  const left=parse(a),right=parse(b);
  if(!left||!right)throw new Error('Invalid version format');
  for(let index=0;index<3;index++)if(left[index]!==right[index])return Math.sign(left[index]-right[index]);
  return 0;
}

export async function checkForCozyUpdate(manual=false):Promise<void>{
  if(Platform.OS!=='android'){
    if(manual)Alert.alert('Opdateringer','APK-opdatering er kun til Android.');
    return;
  }
  try{
    const installed=appConfig.expo.version;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),7000);
    let response:Response;
    try{response=await fetch(`${manifestUrl}?t=${Date.now()}`,{signal:controller.signal,headers:{'Cache-Control':'no-cache'}});}
    finally{clearTimeout(timer);}
    if(!response.ok)throw new Error('Version file unavailable');
    const payload:unknown=await response.json();
    if(!payload||typeof payload!=='object')throw new Error('Invalid update manifest');
    const update=payload as {version?:unknown;apkUrl?:unknown};
    if(typeof update.version!=='string'||update.apkUrl!==apkUrl)throw new Error('Invalid update manifest');
    if(compareVersions(update.version,installed)<=0){
      if(manual)Alert.alert('Ingen opdatering',`Du bruger allerede version ${installed}.`);
      return;
    }
    Alert.alert('Ny version af Cozy Solitaire',`Version ${update.version} er klar (installeret: ${installed}). Vil du downloade APK-filen?`,[
      {text:'Senere',style:'cancel'},
      {text:'Download',onPress:()=>{void Linking.openURL(apkUrl).catch(()=>Alert.alert('Fejl','Kunne ikke åbne downloadlinket.'));}},
    ]);
  }catch{
    if(manual)Alert.alert('Opdatering ikke tilgængelig','Kunne ikke kontrollere versionen på dulmens.dk. Tjek internetforbindelsen og versionsfilen.');
  }
}
