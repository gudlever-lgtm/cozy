import {File,Paths} from 'expo-file-system';
export type Season='auto'|'spring'|'summer'|'autumn'|'winter';
export type CardStyle='illustrated'|'classic';
export type CardSize='small'|'normal'|'large';
export type CardBackStyle='floral'|'autumn'|'winter';
export type AnimationSpeed='calm'|'normal'|'fast';
export type CozySettings={season:Season;cardStyle:CardStyle;doubleTap:boolean;drawPreference:1|3;
  cardSize:CardSize;cardBack:CardBackStyle;autoHints:boolean;animationSpeed:AnimationSpeed;autoMove:boolean};
export const defaultSettings:CozySettings={season:'auto',cardStyle:'illustrated',doubleTap:true,drawPreference:1,
  cardSize:'normal',cardBack:'floral',autoHints:false,animationSpeed:'normal',autoMove:true};
const valid=['auto','spring','summer','autumn','winter'];
const active=()=>new File(Paths.document,'cozy-v3-settings.json');
const pending=()=>new File(Paths.document,'cozy-v3-settings.pending.json');
let writing:Promise<void>=Promise.resolve();
export function validateSettings(data:unknown):CozySettings{
  if(!data||typeof data!=='object')throw Error('Invalid settings');
  const value=data as Record<string,unknown>;
  if(value.version!==1&&value.version!==2&&value.version!==3)throw Error('Invalid settings version');
  if(!valid.includes(value.season as string))throw Error('Invalid season');
  if(value.version===1)return {...defaultSettings,season:value.season as Season};
  if(!['illustrated','classic'].includes(value.cardStyle as string)||typeof value.doubleTap!=='boolean'||
    ![1,3].includes(value.drawPreference as number))throw Error('Invalid card settings');
  if(value.version===2)return {...defaultSettings,season:value.season as Season,cardStyle:value.cardStyle as CardStyle,
    doubleTap:value.doubleTap as boolean,drawPreference:value.drawPreference as 1|3};
  if(!['small','normal','large'].includes(value.cardSize as string)||
    !['floral','autumn','winter'].includes(value.cardBack as string)||
    !['calm','normal','fast'].includes(value.animationSpeed as string)||
    typeof value.autoHints!=='boolean'||typeof value.autoMove!=='boolean')throw Error('Invalid advanced settings');
  return {season:value.season as Season,cardStyle:value.cardStyle as CardStyle,
    doubleTap:value.doubleTap as boolean,drawPreference:value.drawPreference as 1|3,
    cardSize:value.cardSize as CardSize,cardBack:value.cardBack as CardBackStyle,
    autoHints:value.autoHints as boolean,animationSpeed:value.animationSpeed as AnimationSpeed,autoMove:value.autoMove as boolean};
}
export async function readSettings():Promise<CozySettings>{
  const file=active();return file.exists?validateSettings(JSON.parse(await file.text())):defaultSettings;
}
export async function writeSettings(settings:CozySettings):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const file=pending();file.create({overwrite:true});
    await file.write(JSON.stringify({version:3,...settings}));
    await file.move(active(),{overwrite:true});
  });return writing;
}
