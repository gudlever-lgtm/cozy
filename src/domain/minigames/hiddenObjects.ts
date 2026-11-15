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
  {name:'Lille nøgle',x:0,y:0},
  {name:'Foldet brev',x:0,y:0},
  {name:'Sommerfugl',x:0,y:0},
  {name:'Stjernevedhæng',x:0,y:0},
  {name:'Syknap',x:0,y:0},
] as const;

export const movingObjectStart=12;
/** Each small prop has its own realistic surfaces, rather than arbitrary screen coordinates. */
const realisticAnchors=[
  [{x:38,y:24},{x:51,y:59},{x:69,y:67},{x:43,y:32}], // Key: bookcase or sewing table.
  [{x:43,y:62},{x:59,y:67},{x:75,y:75},{x:36,y:34}], // Letter: desk or bookshelf.
  [{x:12,y:18},{x:20,y:29},{x:9,y:37},{x:25,y:40}], // Butterfly: window and flowers.
  [{x:69,y:11},{x:82,y:14},{x:57,y:68},{x:73,y:72}], // Charm: quilts or sewing table.
  [{x:49,y:69},{x:68,y:66},{x:21,y:54},{x:79,y:74}], // Button: sewing materials and textiles.
] as const;

export function hiddenObjectPosition(id:number,round:number):{x:number;y:number}{
  if(!Number.isInteger(id)||id<0||id>=hiddenObjects.length)throw Error('Invalid hidden object');
  if(!Number.isSafeInteger(round)||round<0)throw Error('Invalid round');
  if(id<movingObjectStart)return {x:hiddenObjects[id].x,y:hiddenObjects[id].y};
  const anchors=realisticAnchors[id-movingObjectStart];
  const seed=(Math.imul(round>>>0,1664525)+Math.imul(id+1,1013904223))>>>0;
  return anchors[seed%anchors.length];
}

export function hiddenTargetIds(round:number):number[]{
  const ids=hiddenObjects.map((_,index)=>index);
  let seed=round>>>0;
  for(let i=ids.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]];}
  // Guarantee at least two repositionable props in each round.
  const moving=ids.filter(id=>id>=movingObjectStart).slice(0,2);
  return [...moving,...ids.filter(id=>!moving.includes(id)).slice(0,3)];
}
