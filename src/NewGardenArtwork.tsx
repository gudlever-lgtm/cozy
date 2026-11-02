import React from "react";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

/** Original, resolution-independent native illustration artwork for new garden furniture. */
export type NewGardenItem = "birdhouse" | "teaTable";
export function NewGardenArtwork({ id, size = 96 }: { id: NewGardenItem; size?: number }) {
  return <Svg viewBox="0 0 160 160" width={size} height={size}>
    {id === "birdhouse" ? <G>
      <Ellipse cx="80" cy="145" rx="37" ry="7" fill="#365b48" opacity=".18"/>
      <Rect x="75" y="65" width="11" height="77" rx="4" fill="#9b6548" stroke="#684837" strokeWidth="2"/>
      <Rect x="47" y="52" width="66" height="67" rx="6" fill="#efd7a4" stroke="#92664d" strokeWidth="4"/>
      <Path d="M38 61L80 19 122 61 112 64 80 35 48 64Z" fill="#a9685c" stroke="#714c46" strokeWidth="4" strokeLinejoin="round"/>
      <Path d="M53 66L80 40 107 66V112H53Z" fill="#f6ddaf" opacity=".65"/>
      <Circle cx="80" cy="83" r="16" fill="#593e36" stroke="#bf8b62" strokeWidth="5"/>
      <Rect x="65" y="108" width="30" height="6" rx="3" fill="#8e6444"/>
      <Path d="M50 120Q80 105 112 119" fill="none" stroke="#86a977" strokeWidth="5"/>
      {[54,72,95,109].map((x,i)=><G key={x}><Ellipse cx={x} cy={i%2?120:118} rx="5" ry="8" fill="#f5b9b9"/><Circle cx={x} cy={i%2?120:118} r="3" fill="#e8c679"/></G>)}
    </G> : <G>
      <Ellipse cx="80" cy="145" rx="63" ry="8" fill="#365b48" opacity=".18"/>
      <Path d="M34 85L29 139M126 85L131 139M55 89L58 140M105 89L102 140" fill="none" stroke="#795540" strokeWidth="8" strokeLinecap="round"/>
      <Ellipse cx="80" cy="85" rx="61" ry="20" fill="#b6805c" stroke="#6b4d3b" strokeWidth="5"/>
      <Ellipse cx="80" cy="81" rx="57" ry="15" fill="#f1d4a5"/>
      <Path d="M31 82Q80 95 129 82" fill="none" stroke="#f9eee0" strokeWidth="4" strokeDasharray="4 6"/>
      <Ellipse cx="83" cy="72" rx="23" ry="8" fill="#d9ab82" opacity=".5"/>
      <Path d="M68 62L70 47H97L100 62Q97 75 84 75 70 75 68 62Z" fill="#fffbec" stroke="#a77c67" strokeWidth="3"/>
      <Path d="M99 49Q115 46 110 59Q107 66 98 62" fill="none" stroke="#a77c67" strokeWidth="4"/>
      <Path d="M77 42Q72 32 80 26M89 42Q84 32 92 26" fill="none" stroke="#f8e6d5" strokeWidth="3" strokeLinecap="round"/>
      <Path d="M32 75Q44 54 53 73" fill="#8da77c" stroke="#5d835b" strokeWidth="3"/>
      <Circle cx="38" cy="66" r="5" fill="#e7a6af"/><Circle cx="48" cy="68" r="5" fill="#efc1b5"/>
    </G>}
  </Svg>;
}
