import type {DecorationPlacement} from './layout';

/** Gesture deltas are in screen pixels; the garden itself can be zoomed. */
export function moveGardenDecoration(item:DecorationPlacement,dx:number,dy:number,zoom:number,width:number,height:number):DecorationPlacement {
  if(!Number.isFinite(zoom)||zoom<=0||width<=0||height<=0||!Number.isFinite(dx)||!Number.isFinite(dy))return item;
  const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
  return {...item,x:clamp(item.x+dx/(zoom*width),0.04,0.94),y:clamp(item.y+dy/(zoom*height),0.08,0.91)};
}
