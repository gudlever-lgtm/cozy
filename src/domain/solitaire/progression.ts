import type {Ledger} from '../rewards/ledger';

export const solitaireModes = [
  {id:'classic',title:'Klondike · Ét kort',description:'Træk ét kort ad gangen',drawCount:1,maxPasses:null},
  {id:'three',title:'Klondike · Tre kort',description:'Træk tre kort ad gangen',drawCount:3,maxPasses:null},
  {id:'challenge',title:'Klondike · Udfordring',description:'Højst tre gennemløb',drawCount:3,maxPasses:3},
] as const;

export type SolitaireModeId=typeof solitaireModes[number]['id'];
export function winsForMode(ledger:Ledger,id:SolitaireModeId):number{
  return ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith(`solitaire-win-${id}-`) || (id==='classic'&&entry.id.startsWith('klondike-win-')))).length;
}
export function modeUnlocked(ledger:Ledger,index:number):boolean{
  return index===0||index===1||(index===2&&totalSolitaireWins(ledger)>=5);
}
export function totalSolitaireWins(ledger:Ledger):number{
  return ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith('solitaire-win-')||entry.id.startsWith('klondike-win-'))).length;
}
export function cardBackUnlocked(ledger:Ledger,back:'floral'|'autumn'|'winter'):boolean{
  return back==='floral'||totalSolitaireWins(ledger)>=(back==='autumn'?2:5);
}
export function activeModeIndex(drawCount:1|3,maxPasses:number|null):number{
  return maxPasses!==null?2:drawCount===3?1:0;
}
