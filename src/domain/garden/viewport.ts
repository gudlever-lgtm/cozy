export type PanOffset={x:number;y:number};

/** Image and viewport share a center; zoom may expose no blank space. */
export function clampGardenOffset(offset:PanOffset,zoom:number,width:number,height:number):PanOffset {
  if(!Number.isFinite(zoom)||zoom<1||width<=0||height<=0)return {x:0,y:0};
  const maxX=(zoom-1)*width/2;
  const maxY=(zoom-1)*height/2;
  return {
    x:maxX===0?0:Math.max(-maxX,Math.min(maxX,offset.x)),
    y:maxY===0?0:Math.max(-maxY,Math.min(maxY,offset.y)),
  };
}
