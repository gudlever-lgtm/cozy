/** Five deterministic hidden flowers in a twelve-tile garden. */
export function glowTargets(round:number):number[]{
  const tiles=Array.from({length:12},(_,i)=>i);let seed=round>>>0;
  for(let i=tiles.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  return tiles.slice(0,5);
}
