import type {Ledger} from '../rewards/ledger.ts';
export type QuestId='first-solitaire'|'first-memory'|'garden-three';
export type Quest={id:QuestId;title:string;description:string;reward:number;complete:boolean;claimed:boolean};
export function quests(ledger:Ledger,decorationCount:number):Quest[]{
  const claimed=(id:QuestId)=>ledger.entries.some(e=>e.id===`quest-${id}`&&e.type==='earn');
  return [
    {id:'first-solitaire',title:'Første kabale',description:'Gennemfør én kabale',reward:10,
      complete:ledger.entries.some(e=>e.id.startsWith('klondike-win-')&&e.type==='earn'),claimed:claimed('first-solitaire')},
    {id:'first-memory',title:'Hukommelsesmester',description:'Gennemfør ét vendespil',reward:10,
      complete:ledger.entries.some(e=>e.id.startsWith('memory-win-')&&e.type==='earn'),claimed:claimed('first-memory')},
    {id:'garden-three',title:'Hyggelig have',description:'Placér tre dekorationer',reward:10,
      complete:decorationCount>=3,claimed:claimed('garden-three')},
  ];
}
