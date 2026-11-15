/** Four progressively larger, offline matching rounds. The UI controls mismatch timing. */
export type MemoryLevel=1|2|3|4;
export type MemoryGame={version:1;round:number;level:MemoryLevel;tiles:number[];revealed:number[];matched:number[];turns:number};
export function memoryPairCount(level:MemoryLevel):number{return 2+level*2;}
export function nextMemoryLevel(game:MemoryGame):MemoryLevel{return memoryWon(game)?Math.min(4,game.level+1) as MemoryLevel:game.level;}
export function newMemoryGame(round:number,level:MemoryLevel=1):MemoryGame{
  if(!Number.isSafeInteger(round)||round<0)throw Error('Invalid round');
  if(!Number.isInteger(level)||level<1||level>4)throw Error('Invalid memory level');
  const faces=Array.from({length:memoryPairCount(level)},(_,index)=>index);
  const tiles=[...faces,...faces];
  let seed=round>>>0;
  for(let i=tiles.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  return {version:1,round,level,tiles,revealed:[],matched:[],turns:0};
}
export function revealMemory(game:MemoryGame,index:number):MemoryGame{
  if(game.revealed.length===2 && game.tiles[game.revealed[0]]===game.tiles[game.revealed[1]])
    return revealMemory({...game,revealed:[]},index);
  if(!Number.isInteger(index)||index<0||index>=game.tiles.length||game.matched.includes(index)||
    game.revealed.includes(index)||game.revealed.length>=2)return game;
  const revealed=[...game.revealed,index];
  const match=revealed.length===2&&game.tiles[revealed[0]]===game.tiles[revealed[1]];
  return {...game,revealed,matched:match?[...game.matched,...revealed]:game.matched,
    turns:game.turns+(revealed.length===2?1:0)};
}
export function hideMismatch(game:MemoryGame):MemoryGame{
  return game.revealed.length===2&&game.tiles[game.revealed[0]]!==game.tiles[game.revealed[1]]?
    {...game,revealed:[]}:game;
}
export function memoryWon(game:MemoryGame):boolean{return game.matched.length===game.tiles.length;}
export function decodeMemory(text:string):MemoryGame{
  const value=JSON.parse(text) as MemoryGame;
  // Older installs stored only the original eight-card game.
  if(value&&value.level===undefined)value.level=1;
  const pairs=Number.isInteger(value?.level)&&value.level>=1&&value.level<=4?memoryPairCount(value.level):0;
  if(!value||value.version!==1||!Number.isSafeInteger(value.round)||value.round<0||
    !pairs||!Array.isArray(value.tiles)||value.tiles.length!==pairs*2||
    Array.from({length:pairs},(_,n)=>n).some(n=>value.tiles.filter(x=>x===n).length!==2)||
    !Array.isArray(value.revealed)||value.revealed.length>2||
    !Array.isArray(value.matched)||value.matched.length>pairs*2||
    !Number.isSafeInteger(value.turns)||value.turns<0)throw Error('Invalid memory save');
  const indices=[...value.revealed,...value.matched];
  if(indices.some(i=>!Number.isInteger(i)||i<0||i>=pairs*2)||
    new Set(value.matched).size!==value.matched.length||
    value.matched.length%2!==0)throw Error('Invalid memory indices');
  return value;
}
