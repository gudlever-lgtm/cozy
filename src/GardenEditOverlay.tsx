import React, { useMemo, useRef } from "react";
import { Image, PanResponder, Text, View } from "react-native";
import { decorationImages, type DecorationId } from "./assets/decorations";
import { DECORATION_ANCHORS, decorationLayout } from "./presentation/decorations";
import type { Placement } from "./engine/world";

type Props = {
  owned: string[];
  placements: Placement[];
  width: number;
  height: number;
  language: "da" | "en";
  onPlace: (id: DecorationId, x: number, y: number) => void;
};
/** Editing only: drag purchased objects on an unzoomed garden surface.
 * Source coordinates are percentages and remain independent from device pixels.
 */
function DraggableDecoration({ id, position, width, height, language, onPlace }: {
  id: DecorationId;
  position: Placement | undefined;
  width: number;
  height: number;
  language: "da" | "en";
  onPlace: Props["onPlace"];
}) {
  const defaultPosition = DECORATION_ANCHORS[id];
  const x = position?.x ?? defaultPosition.x * 100;
  const y = position?.y ?? defaultPosition.y * 100;
  const start = useRef({ x, y });
  start.current = { x, y };
  const box = decorationLayout(id, width, height);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, g) => {
      const px = Math.min(95, Math.max(5, start.current.x + g.dx / Math.max(1, width) * 100));
      const py = Math.min(90, Math.max(10, start.current.y + g.dy / Math.max(1, height) * 100));
      if (Math.hypot(g.dx, g.dy) >= 5) onPlace(id, px, py);
    },
  }), [height, id, onPlace, width]);
  return (
    <View
      testID={"garden-edit-" + id}
      accessible
      accessibilityLabel={(language === "da" ? "Flyt " : "Move ") + id}
      style={{
        position: "absolute",
        left: Math.max(0, Math.min(width-box.width, width*x/100-box.width/2)),
        top: Math.max(0, Math.min(height-box.height, height*y/100-box.height)),
        width: box.width,
        height: box.height,
        borderRadius: 8,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#fff5b6",
        backgroundColor: "#fff5b611",
      }}
      {...responder.panHandlers}
    >
      <Image source={decorationImages[id]} resizeMode="contain" style={{width:"100%",height:"100%"}} />
    </View>
  );
}
export function GardenEditOverlay({owned,placements,width,height,language,onPlace}:Props) {
  if (width<=0||height<=0) return null;
  return <View testID="garden-edit-overlay" pointerEvents="box-none" style={{position:"absolute",left:0,right:0,top:0,bottom:0}}>
    {(Object.keys(decorationImages) as DecorationId[])
      .filter(id=>owned.includes(id))
      .map(id=><DraggableDecoration key={id} id={id} position={placements.find(p=>p.id===id)}
        width={width} height={height} language={language} onPlace={onPlace} />)}
    <View pointerEvents="none" style={{position:"absolute",left:10,bottom:8,backgroundColor:"#fff9e9e8",padding:8,borderRadius:10}}>
      <Text style={{color:"#315744",fontWeight:"600",fontSize:12}}>
        {language==="da"?"Træk dekorationerne for at flytte dem":"Drag decorations to move them"}
      </Text>
    </View>
  </View>;
}
