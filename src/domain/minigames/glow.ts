/** Four progressively larger gardens, each hiding five Lysglimt. */
export function glowTileCount(level:number):number{return 8+Math.min(4,Math.max(1,Math.trunc(level)))*4;}
export function glowTargets(round:number,level=1):number[]{
  const tiles=Array.from({length:glowTileCount(level)},(_,i)=>i);let seed=round>>>0;
  for(let i=tiles.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  return tiles.slice(0,5);
}

/** Deterministic scattered touch positions, avoiding straight rows and overlapping hotspots. */
export function glowPositions(round:number,level=1):{x:number;y:number;size:number}[]{
  const count=glowTileCount(level);
  let seed=(round^0x9e3779b9)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const points:{x:number;y:number;size:number}[]=[];
  for(let index=0;index<count;index++){
    let placed=false;
    for(let attempt=0;attempt<1100;attempt++){
      const x=3+random()*82;
      const y=3+random()*83;
      if(points.some(other=>Math.hypot((x-other.x)*3.1,(y-other.y)*3.4)<43))continue;
      points.push({x,y,size:18+Math.floor(random()*8)});placed=true;break;
    }
    // Preserve playability in unusually dense layouts, without overlapping items.
    if(!placed){
      const fallback=Array.from({length:24},(_,n)=>({x:4+(n%6)*15.8,y:4+Math.floor(n/6)*22}));
      const spot=fallback.find(p=>points.every(other=>Math.hypot((p.x-other.x)*3.1,(p.y-other.y)*3.4)>=40));
      if(!spot)throw Error('Unable to place Lysglimt hotspots');
      points.push({...spot,size:20});
    }
  }
  return points;
}
