import {File,Paths} from 'expo-file-system';
export type Season='auto'|'spring'|'summer'|'autumn'|'winter';
const valid=['auto','spring','summer','autumn','winter'];
const active=()=>new File(Paths.document,'cozy-v3-settings.json');
const pending=()=>new File(Paths.document,'cozy-v3-settings.pending.json');
let writing:Promise<void>=Promise.resolve();
export async function readSettings():Promise<Season>{
  const file=active();if(!file.exists)return 'auto';
  const data=JSON.parse(await file.text()) as {version:number;season:Season};
  if(data?.version!==1||!valid.includes(data.season))throw Error('Invalid settings');
  return data.season;
}
export async function writeSettings(season:Season):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const file=pending();file.create({overwrite:true});
    await file.write(JSON.stringify({version:1,season}));
    await file.move(active(),{overwrite:true});
  });return writing;
}
