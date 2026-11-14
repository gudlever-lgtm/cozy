export type DecorationPlacement = {id:string; kind:0|1|2|3|4; x:number; y:number; chapter?:0|1|2};
export const MAX_DECORATIONS = 64;
const valid = (p:DecorationPlacement) => typeof p.id==='string' && p.id.length>0 &&
  [0,1,2,3,4].includes(p.kind) && (p.chapter===undefined||[0,1,2].includes(p.chapter)) && Number.isFinite(p.x) && Number.isFinite(p.y) &&
  p.x>=0 && p.x<=1 && p.y>=0 && p.y<=1;

export function decodeGarden(serialized:string):DecorationPlacement[] {
  const data:unknown=JSON.parse(serialized);
  if(!data || typeof data!=='object' || !('version' in data) || !('decorations' in data) ||
    !Array.isArray(data.decorations) || data.decorations.length>MAX_DECORATIONS)throw Error('Invalid garden save');
  if(data.version===1){
    if(data.decorations.some(n=>!Number.isInteger(n)||n<0||n>2))throw Error('Invalid legacy garden save');
    return (data.decorations as Array<0|1|2>).map((kind,index)=>({id:`legacy-${index}`,kind,
      x:Math.min(0.95,0.12+(index%4)*0.19),y:Math.min(0.95,0.38+Math.floor(index/4)*0.16)}));
  }
  if(data.version!==2 || data.decorations.some((p:DecorationPlacement)=>!p||!valid(p)))throw Error('Invalid garden save');
  const items=data.decorations as DecorationPlacement[];
  if(new Set(items.map(p=>p.id)).size!==items.length)throw Error('Duplicate decoration');
  return items;
}

export function encodeGarden(items:DecorationPlacement[]):string {
  if(items.length>MAX_DECORATIONS || items.some(p=>!valid(p)) ||
    new Set(items.map(p=>p.id)).size!==items.length)throw Error('Invalid garden layout');
  return JSON.stringify({version:2,decorations:items});
}
