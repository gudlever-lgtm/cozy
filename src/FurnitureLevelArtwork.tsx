import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import type { DecorationId } from "./assets/decorations";

/**
 * Original, transparent hand-drawn embellishments for owned furniture.
 * Level 1 is the original art; level 2 adds crafted florals/fabric;
 * level 3 adds golden details and warm glimmers. Nothing is purchased with real money.
 */
export function FurnitureLevelArtwork({ id, level }: { id: DecorationId; level: number }) {
  if (level < 2) return null;
  const gold = "#efce81";
  const cream = "#fff7dc";
  const rose = "#edb5b7";
  const leaf = "#80a97b";
  return (
    <Svg testID={"furniture-art-level-" + id} viewBox="0 0 120 120" width="100%" height="100%" pointerEvents="none">
      {(id === "bench" || id === "bridge") && (
        <G>
          {id === "bench" && <>
            <Rect x="30" y="56" rx="5" width="27" height="14" fill={rose} stroke={cream} strokeWidth="2"/>
            <Rect x="60" y="56" rx="5" width="27" height="14" fill="#bed6ad" stroke={cream} strokeWidth="2"/>
          </>}
          <Path d="M18 80 Q36 67 54 78 T100 79" stroke={leaf} strokeWidth="3" fill="none"/>
          {[28,51,72,94].map((x,i)=><G key={x}>
            <Circle cx={x} cy={i%2?76:80} r="5" fill={rose}/>
            <Circle cx={x} cy={i%2?76:80} r="2" fill={cream}/>
            <Ellipse cx={x-5} cy={i%2?82:86} rx="4" ry="2" fill={leaf} transform={`rotate(-30 ${x-5} ${i%2?82:86})`}/>
          </G>)}
        </G>
      )}
      {id === "flowers" && (
        <G>
          {[24,57,87].map((x,i)=><G key={x}>
            <Path d={`M${x} 96 Q${x-6} 74 ${x} 54`} fill="none" stroke={leaf} strokeWidth="3"/>
            {[0,1,2,3,4].map(j=><Ellipse key={j} cx={x} cy={54-i*3} rx="6" ry="11" fill={j%2?rose:"#e8d6a5"}
              transform={`rotate(${j*72} ${x} ${54-i*3})`}/>)}
            <Circle cx={x} cy={54-i*3} r="5" fill={gold}/>
          </G>)}
        </G>
      )}
      {id === "lantern" && (
        <G>
          <Ellipse cx="60" cy="65" rx="24" ry="28" fill={gold} opacity=".2"/>
          <Path d="M43 35 Q60 22 77 35" fill="none" stroke={gold} strokeWidth="4" strokeLinecap="round"/>
          <Circle cx="60" cy="54" r="9" fill={cream} opacity=".7"/>
        </G>
      )}
      {id === "forest" && (
        <G>
          <Path d="M35 88 Q60 77 85 88" fill="none" stroke={gold} strokeWidth="4"/>
          {[40,60,80].map(x=><Circle key={x} cx={x} cy={87} r="5" fill={rose}/>)}
        </G>
      )}
      {level >= 3 && (
        <G>
          <Path d="M19 25 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" fill={gold}/>
          <Path d="M100 15 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z" fill={cream}/>
          <Path d="M99 70 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z" fill={gold}/>
          <Circle cx="29" cy="24" r="2" fill={cream}/>
          <Circle cx="107" cy="52" r="2" fill={gold}/>
        </G>
      )}
    </Svg>
  );
}
