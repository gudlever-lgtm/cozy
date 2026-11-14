import type {Ledger} from '../rewards/ledger.ts';

export const gardenChapters=[
  {id:0,title:'Hjemmehaven',requiredWins:0},
  {id:1,title:'Blomsterengen',requiredWins:5},
  {id:2,title:'Vinterlysningen',requiredWins:15},
] as const;

export function totalSolitaireWins(ledger:Ledger):number{
  return ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith('klondike-win-')||entry.id.startsWith('solitaire-win-'))).length;
}
export function unlockedChapter(ledger:Ledger,chapter:0|1|2):boolean{
  return totalSolitaireWins(ledger)>=gardenChapters[chapter].requiredWins;
}
export function specialDecorationUnlocked(ledger:Ledger,kind:3|4):boolean{
  const questId=kind===3?'quest-wins-5':'quest-garden-10';
  return ledger.entries.some(entry=>entry.id===questId&&entry.type==='earn');
}
