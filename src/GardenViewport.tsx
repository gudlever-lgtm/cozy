import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GardenCameraContext = createContext({
  camera: { current: { zoom: 1, x: 0, y: 0 } },
  draggingDecoration: { current: false },
});
export const useGardenCamera = () => useContext(GardenCameraContext);

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.8;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const distance = (
  a: { pageX: number; pageY: number },
  b: { pageX: number; pageY: number },
) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);

/**
 * Native-only garden camera: one finger pans when zoomed in, two fingers pinch.
 * Keeping scale >= 1 avoids blank space outside the illustrated garden.
 * The decorative scene is transformed together, maintaining sprite alignment.
 */
export function GardenViewport({
  children,
  language = "da",
  editing = false,
  controlsBottom = 8,
  controlsRight = 8,
}: {
  children: React.ReactNode;
  language?: "da" | "en";
  editing?: boolean;
  controlsBottom?: number;
  controlsRight?: number;
}) {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const scale = useRef(new Animated.Value(1)).current;
  const dx = useRef(new Animated.Value(0)).current;
  const dy = useRef(new Animated.Value(0)).current;
  const camera = useRef({ zoom: 1, x: 0, y: 0 });
  const draggingDecoration = useRef(false);
  const cameraContext = useMemo(() => ({ camera, draggingDecoration }), []);
  const start = useRef({ zoom: 1, x: 0, y: 0, pinch: 0, panX: 0, panY: 0 });
  const [, repaint] = useState(0);
  const commit = (zoom: number, x: number, y: number) => {
    const z = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const maxX = (bounds.width * (z - 1)) / 2;
    const maxY = (bounds.height * (z - 1)) / 2;
    const next = {
      zoom: z,
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
    camera.current = next;
    scale.setValue(next.zoom);
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
  }, [bounds.width, bounds.height]);
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
        onPanResponderGrant: (evt) => {
          const c = camera.current;
          const touches = evt.nativeEvent.touches;
          start.current = {
            ...c,
            panX: 0,
            panY: 0,
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
            const maxX = (bounds.width * (z - 1)) / 2;
            const maxY = (bounds.height * (z - 1)) / 2;
            scale.setValue(z);
            dx.setValue(clamp(base.x, -maxX, maxX));
            dy.setValue(clamp(base.y, -maxY, maxY));
            camera.current = {
              zoom: z,
              x: clamp(base.x, -maxX, maxX),
              y: clamp(base.y, -maxY, maxY),
            };
          } else if (camera.current.zoom > 1.01) {
            const z = camera.current.zoom;
            const maxX = (bounds.width * (z - 1)) / 2,
              maxY = (bounds.height * (z - 1)) / 2;
            const x = clamp(base.x + gesture.dx - base.panX, -maxX, maxX),
              y = clamp(base.y + gesture.dy - base.panY, -maxY, maxY);
            dx.setValue(x);
            dy.setValue(y);
            camera.current = { zoom: z, x, y };
          }
        },
        onPanResponderRelease: () => repaint((v) => v + 1),
        onPanResponderTerminate: () => repaint((v) => v + 1),
      }),
    [bounds.width, bounds.height, scale, dx, dy, editing],
  );
  return (
    <View
      testID="garden-viewport"
      style={styles.root}
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
          StyleSheet.absoluteFill,
          { transform: [{ translateX: dx }, { translateY: dy }, { scale }] },
        ]}
        {...respond.panHandlers}
      >
        <GardenCameraContext.Provider value={cameraContext}>
          {children}
        </GardenCameraContext.Provider>
      </Animated.View>
      <View
        style={[
          styles.controls,
          { bottom: controlsBottom, right: controlsRight },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
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
        </Pressable>
        <Pressable
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
        </Pressable>
        <Pressable
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
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", position: "relative" },
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
