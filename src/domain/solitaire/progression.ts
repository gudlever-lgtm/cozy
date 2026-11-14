import type {Ledger} from '../rewards/ledger';

export const solitaireModes = [
  {id:'classic',title:'Klondike · Klassisk',description:'Træk ét kort ad gangen',drawCount:1,maxPasses:null},
  {id:'three',title:'Klondike · Tre kort',description:'Træk tre kort ad gangen',drawCount:3,maxPasses:null},
  {id:'challenge',title:'Klondike · Udfordring',description:'Tre kort og højst tre gennemløb',drawCount:3,maxPasses:3},
] as const;

export type SolitaireModeId=typeof solitaireModes[number]['id'];
export function winsForMode(ledger:Ledger,id:SolitaireModeId):number{
  return ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith(`solitaire-win-${id}-`) || (id==='classic'&&entry.id.startsWith('klondike-win-')))).length;
}
export function modeUnlocked(ledger:Ledger,index:number):boolean{
  return index===0 || (index>0&&index<solitaireModes.length&&winsForMode(ledger,solitaireModes[index-1].id)>=5);
}
export function activeModeIndex(drawCount:1|3,maxPasses:number|null):number{
  return maxPasses!==null?2:drawCount===3?1:0;
}
