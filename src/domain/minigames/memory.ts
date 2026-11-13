/** Deterministic, offline 4-pair matching game. The UI controls mismatch timing. */
export type MemoryGame={version:1;round:number;tiles:number[];revealed:number[];matched:number[];turns:number};
export function newMemoryGame(round:number):MemoryGame{
  if(!Number.isSafeInteger(round)||round<0)throw Error('Invalid round');
  const tiles=[0,1,2,3,0,1,2,3];
  let seed=round>>>0;
  for(let i=tiles.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  return {version:1,round,tiles,revealed:[],matched:[],turns:0};
}
export function revealMemory(game:MemoryGame,index:number):MemoryGame{
  if(game.revealed.length===2 && game.tiles[game.revealed[0]]===game.tiles[game.revealed[1]])
    return revealMemory({...game,revealed:[]},index);
  if(!Number.isInteger(index)||index<0||index>=8||game.matched.includes(index)||
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
export function memoryWon(game:MemoryGame):boolean{return game.matched.length===8;}
export function decodeMemory(text:string):MemoryGame{
  const value=JSON.parse(text) as MemoryGame;
  if(!value||value.version!==1||!Number.isSafeInteger(value.round)||value.round<0||
    !Array.isArray(value.tiles)||value.tiles.length!==8||
    [0,1,2,3].some(n=>value.tiles.filter(x=>x===n).length!==2)||
    !Array.isArray(value.revealed)||value.revealed.length>2||
    !Array.isArray(value.matched)||value.matched.length>8||
    !Number.isSafeInteger(value.turns)||value.turns<0)throw Error('Invalid memory save');
  const indices=[...value.revealed,...value.matched];
  if(indices.some(i=>!Number.isInteger(i)||i<0||i>=8)||
    new Set(value.matched).size!==value.matched.length||
    value.matched.length%2!==0)throw Error('Invalid memory indices');
  return value;
}
