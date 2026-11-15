/** Target coordinates are percentages of the illustrated scene. */
export const hiddenObjects=[
  {name:'Sommerfugl',symbol:'🦋',x:14,y:13},
  {name:'Nøgle',symbol:'🗝️',x:72,y:18},
  {name:'Svamp',symbol:'🍄',x:31,y:66},
  {name:'Snegl',symbol:'🐌',x:59,y:85},
  {name:'Stjerne',symbol:'⭐',x:83,y:40},
  {name:'Jordbær',symbol:'🍓',x:22,y:46},
  {name:'Fjer',symbol:'🪶',x:48,y:29},
  {name:'Brev',symbol:'✉️',x:70,y:62},
  {name:'Klokke',symbol:'🔔',x:43,y:8},
  {name:'Hjerte',symbol:'💛',x:10,y:79},
  {name:'Mariehøne',symbol:'🐞',x:87,y:75},
  {name:'Bær',symbol:'🫐',x:44,y:51},
] as const;

export function hiddenTargetIds(round:number):number[]{
  const ids=hiddenObjects.map((_,index)=>index);
  let seed=round>>>0;
  for(let i=ids.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]];}
  return ids.slice(0,5);
}
