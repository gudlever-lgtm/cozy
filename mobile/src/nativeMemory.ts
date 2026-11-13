import {File,Paths} from 'expo-file-system';
import {decodeMemory} from '../../src/domain/minigames/memory';
import type {MemoryGame} from '../../src/domain/minigames/memory';
const active=()=>new File(Paths.document,'cozy-v3-memory.json');
const temp=()=>new File(Paths.document,'cozy-v3-memory.pending.json');
let writing:Promise<void>=Promise.resolve();
export async function readMemory():Promise<MemoryGame|null>{
  const file=active();return file.exists?decodeMemory(await file.text()):null;
}
export async function writeMemory(game:MemoryGame):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const file=temp();file.create({overwrite:true});
    await file.write(JSON.stringify(game));await file.move(active(),{overwrite:true});
  });
  return writing;
}
