import { CozyPressable } from "./ui/CozyPressable";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

import { gardenCameraFit, gardenPanBy, gardenPanLimits } from "./presentation/gardenCamera";

const GardenCameraContext = createContext({
  camera: { current: { zoom: 1, x: 0, y: 0 } },
  draggingDecoration: { current: false },
  sceneScale: { current: 1 },
});
export const useGardenCamera = () => useContext(GardenCameraContext);

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.8;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const distance = (
  a: { pageX: number; pageY: number },
  b: { pageX: number; pageY: number },
) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);

/**
 * Native-only garden camera: one finger pans when zoomed in, two fingers pinch.
 * 100% fits the complete original artwork; lower zoom leaves a quiet frame.
 * The decorative scene is transformed together, maintaining sprite alignment.
 */
export function GardenViewport({
  children,
  language = "da",
  editing = false,
  controlsBottom = 8,
  controlsRight = 8,
  imageSize = { width: 836, height: 470 },
}: {
  children: React.ReactNode;
  language?: "da" | "en";
  editing?: boolean;
  controlsBottom?: number;
  controlsRight?: number;
  imageSize?: { width: number; height: number };
}) {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const fit = gardenCameraFit(bounds, imageSize);
  const sceneScale = useRef(0);
  const scale = useRef(new Animated.Value(0)).current;
  const dx = useRef(new Animated.Value(0)).current;
  const dy = useRef(new Animated.Value(0)).current;
  const camera = useRef({ zoom: 1, x: 0, y: 0 });
  const draggingDecoration = useRef(false);
  const cameraContext = useMemo(
    () => ({ camera, draggingDecoration, sceneScale }),
    [],
  );
  const start = useRef({ zoom: 1, x: 0, y: 0, pinch: 0, panX: 0, panY: 0 });
  const [, repaint] = useState(0);
  const commit = (zoom: number, x: number, y: number) => {
    const z = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const { x: maxX, y: maxY } = gardenPanLimits(bounds, imageSize, z);
    const next = {
      zoom: z,
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
    camera.current = next;
    sceneScale.current = fit * next.zoom;
    scale.setValue(sceneScale.current);
    dx.setValue(next.x);
    dy.setValue(next.y);
    repaint((v) => v + 1);
  };
  useEffect(() => {
    if (editing) commit(1, 0, 0);
  }, [editing]);
  useEffect(() => {
    const c = camera.current;
    commit(c.zoom, c.x, c.y);
  }, [bounds.width, bounds.height, imageSize.width, imageSize.height]);
  const respond = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: (evt) =>
          evt.nativeEvent.touches.length >= 2,
        onMoveShouldSetPanResponderCapture: (evt) =>
          evt.nativeEvent.touches.length >= 2,
        onStartShouldSetPanResponder: (evt) =>
          evt.nativeEvent.touches.length >= 2,
        onMoveShouldSetPanResponder: (evt, gesture) =>
          evt.nativeEvent.touches.length >= 2 ||
          (!draggingDecoration.current &&
            camera.current.zoom > 1.01 &&
            Math.hypot(gesture.dx, gesture.dy) > 5),
        onPanResponderGrant: (evt, gesture) => {
          const c = camera.current;
          const touches = evt.nativeEvent.touches;
          start.current = {
            ...c,
            // Capture the offset at the moment this responder wins the gesture;
            // it may already have moved before the first grant.
            panX: gesture.dx,
            panY: gesture.dy,
            pinch: touches.length >= 2 ? distance(touches[0], touches[1]) : 0,
          };
        },
        onPanResponderMove: (evt, gesture) => {
          const touches = evt.nativeEvent.touches;
          let base = start.current;
          if (touches.length >= 2 && base.pinch === 0) {
            base = start.current = {
              ...camera.current,
              pinch: distance(touches[0], touches[1]),
              panX: gesture.dx,
              panY: gesture.dy,
            };
          } else if (touches.length < 2 && base.pinch > 0) {
            base = start.current = {
              ...camera.current,
              pinch: 0,
              panX: gesture.dx,
              panY: gesture.dy,
            };
          }
          if (touches.length >= 2) {
            const d = distance(touches[0], touches[1]);
            const ratio = base.pinch > 0 ? d / base.pinch : 1;
            const z = clamp(base.zoom * ratio, MIN_ZOOM, MAX_ZOOM);
            const { x: maxX, y: maxY } = gardenPanLimits(bounds, imageSize, z);
            sceneScale.current = fit * z;
            scale.setValue(sceneScale.current);
            dx.setValue(clamp(base.x, -maxX, maxX));
            dy.setValue(clamp(base.y, -maxY, maxY));
            camera.current = {
              zoom: z,
              x: clamp(base.x, -maxX, maxX),
              y: clamp(base.y, -maxY, maxY),
            };
          } else if (camera.current.zoom > 1.01 && !draggingDecoration.current) {
            const z = camera.current.zoom;
            const pan = gardenPanBy(
              bounds, imageSize, z, base.x, base.y,
              gesture.dx - base.panX, gesture.dy - base.panY,
            );
            dx.setValue(pan.x);
            dy.setValue(pan.y);
            camera.current = { zoom: z, ...pan };
          }
        },
        onPanResponderRelease: () => repaint((v) => v + 1),
        onPanResponderTerminate: () => repaint((v) => v + 1),
      }),
    [
      bounds.width,
      bounds.height,
      imageSize.width,
      imageSize.height,
      fit,
      scale,
      dx,
      dy,
      editing,
    ],
  );
  return (
    <View
      testID="garden-viewport"
      style={styles.root}
      {...respond.panHandlers}
      onLayout={(e) => {
        // Copy native values before React can defer the state updater and release the event.
        const { width, height } = e.nativeEvent.layout;
        if (
          !Number.isFinite(width) ||
          !Number.isFinite(height) ||
          width <= 0 ||
          height <= 0
        )
          return;
        setBounds((previous) =>
          previous.width === width && previous.height === height
            ? previous
            : { width, height },
        );
      }}
    >
      <Animated.View
        testID="garden-camera-content"
        style={[
          {
            position: "absolute",
            width: imageSize.width,
            height: imageSize.height,
            left: (bounds.width - imageSize.width) / 2,
            top: (bounds.height - imageSize.height) / 2,
          },
          { transform: [{ translateX: dx }, { translateY: dy }, { scale }] },
        ]}
      >
        <GardenCameraContext.Provider value={cameraContext}>
          {children}
        </GardenCameraContext.Provider>
      </Animated.View>
      {camera.current.zoom > 1.01 && (
        <View
          testID="garden-pan-controls"
          pointerEvents="box-none"
          style={[
            styles.panControls,
            { bottom: controlsBottom + 52, right: controlsRight },
          ]}
        >
          {([
            ["left", "←", -48, 0, "Venstre", "Left"],
            ["up", "↑", 0, -48, "Op", "Up"],
            ["down", "↓", 0, 48, "Ned", "Down"],
            ["right", "→", 48, 0, "Højre", "Right"],
          ] as const).map(([id, symbol, stepX, stepY, da, en]) => (
            <CozyPressable
              key={id}
              testID={`garden-pan-${id}`}
              accessibilityRole="button"
              accessibilityLabel={language === "da" ? `Flyt udsnit ${da.toLowerCase()}` : `Pan ${en.toLowerCase()}`}
              onPress={() => {
                const c = camera.current;
                const pan = gardenPanBy(bounds, imageSize, c.zoom, c.x, c.y, stepX, stepY);
                commit(c.zoom, pan.x, pan.y);
              }}
              style={styles.panButton}
            >
              <Text style={styles.panSymbol}>{symbol}</Text>
            </CozyPressable>
          ))}
        </View>
      )}
      <View
        style={[
          styles.controls,
          { bottom: controlsBottom, right: controlsRight },
        ]}
        pointerEvents="box-none"
      >
        <CozyPressable
          testID="garden-zoom-in"
          accessibilityRole="button"
          accessibilityLabel={language === "da" ? "Zoom ind" : "Zoom in"}
          onPress={() =>
            commit(
              camera.current.zoom + 0.25,
              camera.current.x,
              camera.current.y,
            )
          }
          style={styles.button}
        >
          <Text style={styles.symbol}>+</Text>
        </CozyPressable>
        <CozyPressable
          testID="garden-reset-view"
          accessibilityRole="button"
          accessibilityLabel={
            language === "da" ? "Nulstil udsnit" : "Reset view"
          }
          onPress={() => commit(1, 0, 0)}
          style={styles.button}
        >
          <Text testID="garden-zoom-level" style={styles.small}>
            {Math.round(camera.current.zoom * 100)}%
          </Text>
        </CozyPressable>
        <CozyPressable
          testID="garden-zoom-out"
          accessibilityRole="button"
          accessibilityLabel={language === "da" ? "Zoom ud" : "Zoom out"}
          onPress={() =>
            commit(
              camera.current.zoom - 0.25,
              camera.current.x,
              camera.current.y,
            )
          }
          style={styles.button}
        >
          <Text style={styles.symbol}>−</Text>
        </CozyPressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "transparent",
  },
  panControls: {
    position: "absolute",
    flexDirection: "row",
    gap: 4,
    zIndex: 20,
  },
  panButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  panSymbol: { color: "#315744", fontSize: 25, fontWeight: "700" },
  controls: {
    position: "absolute",
    right: 8,
    bottom: 8,
    flexDirection: "row",
    gap: 4,
    zIndex: 20,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 17,
    backgroundColor: "#fff8e9ee",
    borderWidth: 1,
    borderColor: "#d8ba89",
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 27, color: "#315744", fontWeight: "600" },
  small: { fontSize: 13, color: "#315744", fontWeight: "600" },
});
