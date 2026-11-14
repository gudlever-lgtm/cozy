/** Stable dimension rules for portrait and landscape without changing game state. */
export function cozyLayout(width:number,height:number,cardSize:'small'|'normal'|'large'='normal'){
  const landscape=width>height;
  const gardenWidth=landscape?width-92:width;
  const boardWidth=landscape?gardenWidth-136:gardenWidth;
  const baseWidth=Math.min(66,(boardWidth-12)/7-0.7);
  const cardWidth=baseWidth*({small:0.81,normal:0.92,large:1}[cardSize]);
  const cardHeight=cardWidth*270/190;
  const tableauHeight=landscape?Math.max(cardHeight+95,height*0.5):Math.max(cardHeight+265,height*0.44);
  return {landscape,gardenWidth,boardWidth,cardWidth,cardHeight,tableauHeight};
}
