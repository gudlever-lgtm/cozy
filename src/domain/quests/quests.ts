import type {Ledger} from '../rewards/ledger.ts';

export type QuestEventKind='solitaire-win'|'three-win'|'mini-win'|'move';
export type QuestEvent={id:string;kind:QuestEventKind;at:string};
export type Quest={id:string;title:string;description:string;reward:number;progress:number;target:number;complete:boolean;claimed:boolean;category:'daily'|'weekly'|'milestone'};

export function addQuestEvent(events:QuestEvent[],event:QuestEvent):QuestEvent[]{
  if(!event.id||!['solitaire-win','three-win','mini-win','move'].includes(event.kind)||
    !Number.isFinite(Date.parse(event.at)))throw Error('Invalid quest event');
  return events.some(value=>value.id===event.id)?events:[...events,event];
}
export function validateQuestEvents(data:unknown):QuestEvent[]{
  if(!Array.isArray(data)||data.length>250000)throw Error('Invalid quest events');
  return data.reduce<QuestEvent[]>((events,value)=>{
    const next=addQuestEvent(events,value);
    if(next.length===events.length)throw Error('Duplicate quest event');
    return next;
  },[]);
}
const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const weekKey=(date:Date)=>{const monday=new Date(date.getFullYear(),date.getMonth(),date.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);return dayKey(monday);};

export function quests(ledger:Ledger,decorationCount:number,events:QuestEvent[]=[],now=new Date()):Quest[]{
  const currentDay=dayKey(now),currentWeek=weekKey(now);
  const today=events.filter(event=>dayKey(new Date(event.at))===currentDay);
  const week=events.filter(event=>weekKey(new Date(event.at))===currentWeek);
  const count=(list:QuestEvent[],kind:QuestEventKind)=>list.filter(event=>event.kind===kind).length;
  const ledgerWins=ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith('klondike-win-')||entry.id.startsWith('solitaire-win-'))).length;
  const ledgerMinis=ledger.entries.filter(entry=>entry.type==='earn'&&
    (entry.id.startsWith('memory-win-')||entry.id.startsWith('mini-glow-')||entry.id.startsWith('mini-season-'))).length;
  const definitions:{id:string;title:string;description:string;reward:number;progress:number;target:number;category:Quest['category']}[]=[
    {id:`daily-${currentDay}-win`,title:'En hyggelig sejr',description:'Vind én kabale i dag',reward:15,progress:count(today,'solitaire-win'),target:1,category:'daily'},
    {id:`daily-${currentDay}-mini`,title:'Små pauser',description:'Gennemfør to minispil i dag',reward:10,progress:count(today,'mini-win'),target:2,category:'daily'},
    {id:`daily-${currentDay}-moves`,title:'Kort på farten',description:'Udfør 20 lovlige korttræk i dag',reward:10,progress:count(today,'move'),target:20,category:'daily'},
    {id:`weekly-${currentWeek}-wins`,title:'Ugens kabaler',description:'Vind ti kabaler i denne uge',reward:75,progress:count(week,'solitaire-win'),target:10,category:'weekly'},
    {id:`weekly-${currentWeek}-mini`,title:'Ugens minispil',description:'Gennemfør 15 minispil i denne uge',reward:50,progress:count(week,'mini-win'),target:15,category:'weekly'},
    {id:`weekly-${currentWeek}-three`,title:'Tre korts udfordring',description:'Vind tre kabaler med tre trukne kort',reward:40,progress:count(week,'three-win'),target:3,category:'weekly'},
    {id:'first-solitaire',title:'Første kabale',description:'Gennemfør én kabale',reward:10,progress:ledgerWins,target:1,category:'milestone'},
    {id:'first-memory',title:'Hukommelsesmester',description:'Gennemfør ét minispil',reward:10,progress:ledgerMinis,target:1,category:'milestone'},
    {id:'garden-three',title:'Hyggelig have',description:'Placér tre dekorationer',reward:10,progress:decorationCount,target:3,category:'milestone'},
    ...[5,10,25,50,100].map(target=>({id:`wins-${target}`,title:`${target} kabalesejre`,description:`Gennemfør ${target} kabaler i alt`,reward:target*2,progress:ledgerWins,target,category:'milestone' as const})),
    ...[5,10,20].map(target=>({id:`garden-${target}`,title:`En blomstrende have · ${target}`,description:`Placér ${target} dekorationer i haven`,reward:target*3,progress:decorationCount,target,category:'milestone' as const})),
    {id:'mini-ten',title:'Minispilsmester',description:'Gennemfør ti minispil',reward:30,progress:ledgerMinis,target:10,category:'milestone'},
  ];
  return definitions.map(item=>({...item,complete:item.progress>=item.target,
    claimed:ledger.entries.some(entry=>entry.type==='earn'&&entry.id===`quest-${item.id}`)}));
}
