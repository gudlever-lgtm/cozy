import {File,Paths} from 'expo-file-system';
import {validateQuestEvents} from '../../src/domain/quests/quests';
import type {QuestEvent} from '../../src/domain/quests/quests';

const active=()=>new File(Paths.document,'cozy-v3-quest-events.json');
const pending=()=>new File(Paths.document,'cozy-v3-quest-events.pending.json');
let writing:Promise<void>=Promise.resolve();

export async function readQuestEvents():Promise<QuestEvent[]>{
  const file=active();return file.exists?validateQuestEvents(JSON.parse(await file.text())):[];
}
export async function writeQuestEvents(events:QuestEvent[]):Promise<void>{
  writing=writing.catch(()=>{}).then(async()=>{
    const file=pending();file.create({overwrite:true});
    await file.write(JSON.stringify(events));await file.move(active(),{overwrite:true});
  });
  return writing;
}
