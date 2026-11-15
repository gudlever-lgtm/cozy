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
const greenhouseObjects=[
  {name:'Rød træhest',x:8,y:8},{name:'Modelskib',x:19,y:8},
  {name:'Vandkande',x:4,y:37},{name:'Lavendel',x:32,y:10},
  {name:'Sommerfugl i vinduet',x:70,y:19},{name:'Hængelanterne',x:64,y:6},
  {name:'Lille fugl',x:75,y:38},{name:'Gummistøvler',x:61,y:54},
  {name:'Blå tekande',x:78,y:44},{name:'Beskæresaks',x:84,y:48},
  {name:'Pindsvin',x:38,y:74},{name:'Jordbær',x:4,y:58},
  {name:'Lille nøgle',x:0,y:0},{name:'Foldet brev',x:0,y:0},
  {name:'Sommerfugl',x:0,y:0},{name:'Stjernevedhæng',x:0,y:0},{name:'Syknap',x:0,y:0},
] as const;
const bakeryObjects=[
  {name:'Julekrans',x:83,y:3},{name:'Halmstjerne',x:21,y:8},
  {name:'Rød træhest',x:30,y:27},{name:'Lille fugl',x:20,y:30},
  {name:'Lanterne',x:6,y:40},{name:'Kobberkedel',x:84,y:29},
  {name:'Vægtskål',x:62,y:31},{name:'Småkageforme',x:39,y:48},
  {name:'Piskeris',x:40,y:56},{name:'Sovende hund',x:81,y:60},
  {name:'Brødkurv',x:4,y:66},{name:'Julevanter',x:72,y:17},
  {name:'Lille nøgle',x:0,y:0},{name:'Foldet brev',x:0,y:0},
  {name:'Sommerfugl',x:0,y:0},{name:'Stjernevedhæng',x:0,y:0},{name:'Syknap',x:0,y:0},
] as const;
export const hiddenRoomCount=3;
export function hiddenRoomTitle(room:number):string{
  return ['Patchworkstuen','Blomsterdrivhuset','Vinterbageriet'][Math.min(hiddenRoomCount,Math.max(1,Math.trunc(room)))-1];
}
export function hiddenRoomObjects(room:number):ReadonlyArray<{name:string;x:number;y:number}>{
  return [hiddenObjects,greenhouseObjects,bakeryObjects][Math.min(hiddenRoomCount,Math.max(1,Math.trunc(room)))-1];
}
/** Each small prop has its own realistic surfaces, rather than arbitrary screen coordinates. */
const realisticAnchors=[
  [{x:38,y:24},{x:51,y:59},{x:69,y:67},{x:43,y:32}], // Key: bookcase or sewing table.
  [{x:43,y:62},{x:59,y:67},{x:75,y:75},{x:36,y:34}], // Letter: desk or bookshelf.
  [{x:12,y:18},{x:20,y:29},{x:9,y:37},{x:25,y:40}], // Butterfly: window and flowers.
  [{x:69,y:11},{x:82,y:14},{x:57,y:68},{x:73,y:72}], // Charm: quilts or sewing table.
  [{x:49,y:69},{x:68,y:66},{x:21,y:54},{x:79,y:74}], // Button: sewing materials and textiles.
] as const;
const greenhouseAnchors=[
  [{x:35,y:45},{x:81,y:54},{x:23,y:63},{x:45,y:61}],
  [{x:26,y:43},{x:58,y:51},{x:80,y:52},{x:18,y:19}],
  [{x:13,y:25},{x:70,y:20},{x:83,y:33},{x:18,y:40}],
  [{x:18,y:19},{x:49,y:54},{x:82,y:55},{x:31,y:46}],
  [{x:41,y:49},{x:78,y:53},{x:26,y:61},{x:55,y:53}],
] as const;
const bakeryAnchors=[
  [{x:42,y:48},{x:70,y:42},{x:35,y:31},{x:52,y:60}],
  [{x:34,y:44},{x:59,y:55},{x:71,y:39},{x:24,y:59}],
  [{x:13,y:20},{x:22,y:28},{x:52,y:11},{x:17,y:35}],
  [{x:58,y:48},{x:71,y:7},{x:42,y:62},{x:81,y:18}],
  [{x:41,y:72},{x:67,y:69},{x:26,y:74},{x:53,y:79}],
] as const;

export function hiddenObjectPosition(id:number,round:number,room=1):{x:number;y:number}{
  const objects=hiddenRoomObjects(room);
  if(!Number.isInteger(id)||id<0||id>=objects.length)throw Error('Invalid hidden object');
  if(!Number.isSafeInteger(round)||round<0)throw Error('Invalid round');
  if(id<movingObjectStart)return {x:objects[id].x,y:objects[id].y};
  const anchorSets=[realisticAnchors,greenhouseAnchors,bakeryAnchors][Math.min(hiddenRoomCount,Math.max(1,Math.trunc(room)))-1];
  const positions: Array<{x:number;y:number}>=objects.slice(0,movingObjectStart).map(object=>({x:object.x,y:object.y}));
  let result={x:50,y:50};
  // Place each small prop in a plausible spot without stacking it on another
  // prop or a prominent pre-illustrated object. Stable within the same round.
  for(let movingId=movingObjectStart;movingId<=id;movingId++){
    const anchors=anchorSets[movingId-movingObjectStart];
    const start=((round+movingId*7)>>>0)%anchors.length;
    const ordered=anchors.map((_,index)=>anchors[(start+index)%anchors.length]);
    const spacing=(position:{x:number;y:number},others:ReadonlyArray<{x:number;y:number}>)=>Math.min(Infinity,...others.map(other=>Math.hypot((position.x-other.x)*1.1,(position.y-other.y)*0.8)));
    const safe=ordered.find(position=>spacing(position,positions.slice(movingObjectStart))>=7&&spacing(position,positions.slice(0,movingObjectStart))>=3);
    result=safe??ordered.reduce((best,next)=>spacing(next,positions.slice(movingObjectStart))>spacing(best,positions.slice(movingObjectStart))?next:best);
    positions.push(result);
  }
  return result;
}

export function hiddenTargetIds(round:number,room=1):number[]{
  const ids=hiddenRoomObjects(room).map((_,index)=>index);
  let seed=round>>>0;
  for(let i=ids.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const j=seed%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]];}
  // Later rooms demand more of the tiny repositionable details.
  const moving=ids.filter(id=>id>=movingObjectStart).slice(0,room>=3?3:2);
  return [...moving,...ids.filter(id=>!moving.includes(id)).slice(0,5-moving.length)];
}
