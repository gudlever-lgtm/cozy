import React, { useMemo, useRef } from "react";
import { Animated, PanResponder, Text, View } from "react-native";
import { decorationImages, type DecorationId } from "./assets/decorations";
import {
  DECORATION_ANCHORS,
  decorationLayout,
} from "./presentation/decorations";
import { useGardenCamera } from "./GardenViewport";
import { FurnitureLevelArtwork } from "./FurnitureLevelArtwork";
import { furnitureLevel, type Economy } from "./engine/world";
import { NewGardenArtwork } from "./NewGardenArtwork";
import type { Placement } from "./engine/world";

type Props = {
  owned: string[];
  placements: Placement[];
  width: number;
  height: number;
  language: "da" | "en";
  economy?: Economy;
  onPlace: (id: DecorationId, x: number, y: number) => void;
};
/** Editing only: drag purchased objects on a zoomable garden surface.
 * Source coordinates are percentages and remain independent from device pixels.
 */
function DraggableDecoration({
  id,
  position,
  width,
  height,
  language,
  economy,
  onPlace,
}: {
  id: DecorationId;
  position: Placement | undefined;
  width: number;
  height: number;
  language: "da" | "en";
  economy?: Economy;
  onPlace: Props["onPlace"];
}) {
  const { camera, draggingDecoration } = useGardenCamera();
  const box = decorationLayout(id, width, height);
  const x = position?.x ?? ((box.left + box.width / 2) / width) * 100;
  const y = position?.y ?? ((box.top + box.height) / height) * 100;
  const level = economy ? furnitureLevel(economy, id) : 1;
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const start = useRef({ x, y, zoom: 1, screenX: 0, screenY: 0 });
  const latest = useRef({ x, y, onPlace });
  latest.current = { x, y, onPlace };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (event) =>
          event.nativeEvent.touches.length < 2,
        onPanResponderGrant: (event) => {
          draggingDecoration.current = true;
          start.current = {
            x: latest.current.x,
            y: latest.current.y,
            zoom: camera.current.zoom,
            screenX: event.nativeEvent.pageX,
            screenY: event.nativeEvent.pageY,
          };
        },
        onPanResponderTerminationRequest: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event) => {
          drag.setValue({
            x:
              (event.nativeEvent.pageX - start.current.screenX) /
              start.current.zoom,
            y:
              (event.nativeEvent.pageY - start.current.screenY) /
              start.current.zoom,
          });
        },
        onPanResponderTerminate: () => {
          draggingDecoration.current = false;
          drag.setValue({ x: 0, y: 0 });
        },
        onPanResponderRelease: (event) => {
          const dx = event.nativeEvent.pageX - start.current.screenX;
          const dy = event.nativeEvent.pageY - start.current.screenY;
          draggingDecoration.current = false;
          drag.setValue({ x: 0, y: 0 });
          const px = Math.min(
            95,
            Math.max(
              5,
              start.current.x +
                (dx / start.current.zoom / Math.max(1, width)) * 100,
            ),
          );
          const py = Math.min(
            90,
            Math.max(
              10,
              start.current.y +
                (dy / start.current.zoom / Math.max(1, height)) * 100,
            ),
          );
          if (Math.hypot(dx, dy) >= 5) latest.current.onPlace(id, px, py);
        },
      }),
    [height, id, width, camera, draggingDecoration],
  );
  return (
    <Animated.View
      testID={"garden-edit-" + id}
      accessible
      accessibilityLabel={(language === "da" ? "Flyt " : "Move ") + id}
      style={{
        position: "absolute",
        left: Math.max(
          0,
          Math.min(width - box.width, (width * x) / 100 - box.width / 2),
        ),
        top: Math.max(
          0,
          Math.min(height - box.height, (height * y) / 100 - box.height),
        ),
        width: box.width,
        height: box.height,
        borderRadius: 8,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#fff5b6",
        backgroundColor: "#fff5b611",
        transform: drag.getTranslateTransform(),
      }}
      {...responder.panHandlers}
    >
      {id === "birdhouse" || id === "teaTable" ? (
        <NewGardenArtwork id={id} size={Math.min(box.width, box.height)} />
      ) : (
        <Animated.Image
          source={decorationImages[id]}
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      {level > 1 && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        >
          <FurnitureLevelArtwork id={id} level={level} />
        </View>
      )}
    </Animated.View>
  );
}
export function GardenEditOverlay({
  owned,
  placements,
  width,
  height,
  language,
  economy,
  onPlace,
}: Props) {
  if (width <= 0 || height <= 0) return null;
  return (
    <View
      testID="garden-edit-overlay"
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {(Object.keys(DECORATION_ANCHORS) as DecorationId[])
        .filter((id) => owned.includes(id))
        .map((id) => (
          <DraggableDecoration
            key={id}
            id={id}
            position={placements.find((p) => p.id === id)}
            width={width}
            height={height}
            language={language}
            economy={economy}
            onPlace={onPlace}
          />
        ))}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 10,
          bottom: 60,
          backgroundColor: "#fff9e9e8",
          padding: 8,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#315744", fontWeight: "600", fontSize: 12 }}>
          {language === "da"
            ? "Træk dekorationerne for at flytte dem"
            : "Drag decorations to move them"}
        </Text>
      </View>
    </View>
  );
}
