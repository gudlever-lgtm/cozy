/** Four progressively larger gardens, each hiding five Lysglimt. */
export function glowTileCount(level:number):number{return 8+Math.min(4,Math.max(1,Math.trunc(level)))*4;}
export function glowTargets(round:number,level=1):number[]{
  const tiles=Array.from({length:glowTileCount(level)},(_,i)=>i);let seed=round>>>0;
  for(let i=tiles.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  return tiles.slice(0,5);
}
