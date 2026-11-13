import {File, Paths} from 'expo-file-system';
import {decodeGarden,encodeGarden} from '../../src/domain/garden/layout';
import type {DecorationPlacement} from '../../src/domain/garden/layout';

const primary = () => new File(Paths.document, 'cozy-v3-garden.json');
const pending = () => new File(Paths.document, 'cozy-v3-garden.pending.json');
let writing:Promise<void>=Promise.resolve();

export async function readGarden(): Promise<DecorationPlacement[]> {
  const file=primary();
  if(!file.exists)return [];
  return decodeGarden(await file.text());
}

export async function writeGarden(decorations:DecorationPlacement[]):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const temp=pending();
    temp.create({overwrite:true});
    await temp.write(encodeGarden(decorations));
    await temp.move(primary(),{overwrite:true});
  });
  return writing;
}
