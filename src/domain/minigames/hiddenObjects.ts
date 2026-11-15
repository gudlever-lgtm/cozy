/** Target coordinates are percentages of the illustrated scene. */
export const hiddenObjects=[
  {name:'Træhest',x:50,y:15},
  {name:'Saks',x:29,y:61},
  {name:'Kat i sofaen',x:11,y:43},
  {name:'Kat på gulvet',x:5,y:69},
  {name:'Kobberkedel',x:85,y:36},
  {name:'Garnkurven',x:29,y:52},
  {name:'Lyserød blomstervase',x:19,y:24},
  {name:'Hængelampe',x:50,y:2},
  {name:'Stjernetæppe',x:63,y:4},
  {name:'Lanterne',x:13,y:30},
  {name:'Stofkurv',x:81,y:78},
  {name:'Grøn blomstervase',x:73,y:54},
] as const;

export function hiddenTargetIds(round:number):number[]{
  const ids=hiddenObjects.map((_,index)=>index);
  let seed=round>>>0;
  for(let i=ids.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]];}
  return ids.slice(0,5);
}
