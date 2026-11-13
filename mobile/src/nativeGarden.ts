import {File, Paths} from 'expo-file-system';

const primary = () => new File(Paths.document, 'cozy-v3-garden.json');
const pending = () => new File(Paths.document, 'cozy-v3-garden.pending.json');
let writing:Promise<void>=Promise.resolve();

export async function readGarden(): Promise<number[]> {
  const file=primary();
  if(!file.exists)return [];
  const parsed:unknown=JSON.parse(await file.text());
  if(!parsed || typeof parsed!=='object' || !('version' in parsed) || parsed.version!==1 ||
    !('decorations' in parsed) || !Array.isArray(parsed.decorations) ||
    parsed.decorations.length>64 || parsed.decorations.some(n=>!Number.isInteger(n)||n<0||n>2))
    throw Error('Invalid garden save');
  return parsed.decorations as number[];
}

export async function writeGarden(decorations:number[]):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const temp=pending();
    temp.create({overwrite:true});
    await temp.write(JSON.stringify({version:1,decorations}));
    await temp.move(primary(),{overwrite:true});
  });
  return writing;
}
