import {File,Paths} from 'expo-file-system';
export type Season='auto'|'spring'|'summer'|'autumn'|'winter';
export type CardStyle='illustrated'|'classic';
export type CozySettings={season:Season;cardStyle:CardStyle;doubleTap:boolean;drawPreference:1|3};
export const defaultSettings:CozySettings={season:'auto',cardStyle:'illustrated',doubleTap:true,drawPreference:1};
const valid=['auto','spring','summer','autumn','winter'];
const active=()=>new File(Paths.document,'cozy-v3-settings.json');
const pending=()=>new File(Paths.document,'cozy-v3-settings.pending.json');
let writing:Promise<void>=Promise.resolve();
export function validateSettings(data:unknown):CozySettings{
  if(!data||typeof data!=='object')throw Error('Invalid settings');
  const value=data as Record<string,unknown>;
  if(value.version!==1&&value.version!==2)throw Error('Invalid settings version');
  if(!valid.includes(value.season as string))throw Error('Invalid season');
  if(value.version===1)return {...defaultSettings,season:value.season as Season};
  if(!['illustrated','classic'].includes(value.cardStyle as string)||typeof value.doubleTap!=='boolean'||
    ![1,3].includes(value.drawPreference as number))throw Error('Invalid card settings');
  return {season:value.season as Season,cardStyle:value.cardStyle as CardStyle,
    doubleTap:value.doubleTap as boolean,drawPreference:value.drawPreference as 1|3};
}
export async function readSettings():Promise<CozySettings>{
  const file=active();return file.exists?validateSettings(JSON.parse(await file.text())):defaultSettings;
}
export async function writeSettings(settings:CozySettings):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const file=pending();file.create({overwrite:true});
    await file.write(JSON.stringify({version:2,...settings}));
    await file.move(active(),{overwrite:true});
  });return writing;
}
