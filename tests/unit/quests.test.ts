import test from 'node:test';
import assert from 'node:assert/strict';
import {addQuestEvent,quests,validateQuestEvents} from '../../src/domain/quests/quests.ts';
import {emptyLedger,record} from '../../src/domain/rewards/ledger.ts';

test('quests use actual completed events and do not claim on mere spending',()=>{
  let ledger=emptyLedger();
  assert.equal(quests(ledger,0).filter(q=>q.complete).length,0);
  ledger=record(ledger,{id:'memory-win-100',type:'earn',amount:5,reason:'Vendespil'});
  assert.equal(quests(ledger,0).find(q=>q.id==='first-memory')?.complete,true);
  assert.equal(quests(ledger,3).find(q=>q.id==='garden-three')?.complete,true);
  ledger=record(ledger,{id:'quest-first-memory',type:'earn',amount:10,reason:'Quest'});
  assert.equal(quests(ledger,3).find(q=>q.id==='first-memory')?.claimed,true);
  assert.equal(record(ledger,{id:'quest-first-memory',type:'earn',amount:10,reason:'Quest'}),ledger);
});

test('daily and weekly quests track events in their calendar periods',()=>{
  const now=new Date('2026-11-14T12:00:00Z');
  let events=[] as ReturnType<typeof addQuestEvent>;
  for(let i=0;i<20;i++)events=addQuestEvent(events,{id:`move-${i}`,kind:'move',at:'2026-11-14T10:00:00Z'});
  events=addQuestEvent(events,{id:'win-a',kind:'solitaire-win',at:'2026-11-14T10:00:00Z'});
  events=addQuestEvent(events,{id:'win-a',kind:'solitaire-win',at:'2026-11-14T10:00:00Z'});
  const all=quests(emptyLedger(),0,events,now);
  assert.equal(all.find(q=>q.id==='daily-2026-11-14-moves')?.complete,true);
  assert.equal(all.find(q=>q.id==='daily-2026-11-14-win')?.progress,1);
  assert.equal(all.find(q=>q.id==='weekly-2026-11-09-wins')?.progress,1);
  assert.equal(quests(emptyLedger(),0,events,new Date('2026-11-15T12:00:00Z')).find(q=>q.category==='daily'&&q.title==='En hyggelig sejr')?.progress,0);
  assert.equal(validateQuestEvents(events).length,21);
  assert.throws(()=>validateQuestEvents([...events,events[0]]),/Duplicate/);
});

test('claimed quests have stable period-specific reward ids',()=>{
  const now=new Date('2026-11-14T12:00:00Z');
  const events=[{id:'win-1',kind:'solitaire-win' as const,at:'2026-11-14T09:00:00Z'}];
  let ledger=emptyLedger();
  const quest=quests(ledger,0,events,now).find(q=>q.id==='daily-2026-11-14-win')!;
  assert.equal(quest.complete,true);
  ledger=record(ledger,{id:`quest-${quest.id}`,type:'earn',amount:quest.reward,reason:'Dagens opgave'});
  assert.equal(quests(ledger,0,events,now).find(q=>q.id===quest.id)?.claimed,true);
  assert.equal(quests(ledger,0,events,new Date('2026-11-15T12:00:00Z')).find(q=>q.title==='En hyggelig sejr')?.claimed,false);
});

test('daily golden-star bonus unlocks only after claiming three tasks',()=>{
  const now=new Date('2026-11-14T12:00:00Z');
  let ledger=emptyLedger();
  const bonus=()=>quests(ledger,0,[],now).find(q=>q.id==='daily-2026-11-14-bonus')!;
  assert.equal(bonus().progress,0);
  for(const id of ['daily-2026-11-14-win','daily-2026-11-14-mini','daily-2026-11-14-moves']){
    ledger=record(ledger,{id:`quest-${id}`,type:'earn',amount:10,reason:'Opgave'});
  }
  assert.equal(bonus().progress,3);assert.equal(bonus().complete,true);assert.equal(bonus().reward,20);
});
