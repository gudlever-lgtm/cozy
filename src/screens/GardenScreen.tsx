import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import GardenSpring from "../../assets/v3/backgrounds/garden-spring.svg";
import GardenSummer from "../../assets/v3/backgrounds/garden-summer.svg";
import GardenAutumn from "../../assets/v3/backgrounds/garden-autumn.svg";
import GardenWinter from "../../assets/v3/backgrounds/garden-winter.svg";
import HammerIcon from "../../assets/v3/icons/hammer.svg";
import CloseIcon from "../../assets/v3/icons/close.svg";
import UndoIcon from "../../assets/v3/icons/undo.svg";
import StarIcon from "../../assets/v3/icons/star.svg";
import { pan as panCamera, pinchZoom } from "../domain/garden/camera";
import {
  createGarden,
  currentSeason,
  moveDecoration,
  placeDecoration,
  removeDecoration,
  rotateDecoration,
} from "../domain/garden/garden";
import type { CameraBounds, CameraState, GardenState, Season } from "../domain/garden/types";
import { loadSavedGarden, saveGarden } from "../application/gardenPersistence";
import { DECORATION_ART, DECORATION_KINDS, decorationSizeFraction, type DecorationKind } from "../ui/theme/decorationCatalog";
import { CozyIconButton } from "../ui/components/CozyIconButton";
import { CozyHUDChip } from "../ui/components/CozyHUDChip";
import { textColors } from "../ui/theme/colors";
import { gardenTokens } from "../ui/theme/layoutTokens";

const SCENE = { width: 720, height: 1280 };
const SEASON_ART: Record<Season, React.FC<any>> = {
  spring: GardenSpring,
  summer: GardenSummer,
  autumn: GardenAutumn,
  winter: GardenWinter,
};

/**
 * Fullscreen garden world. Pan/pinch-zoom and decoration placement are driven by the
 * pure functions in src/domain/garden (camera.ts, garden.ts) — this component only
 * translates gestures into calls on that domain code and renders the result.
 *
 * Millie and Marmalade have no character illustrations in assets/v3/ (only animal
 * avatar icons exist there) — flagged in Stage 5.1. Rather than inventing character
 * art, they render as plain labeled markers until real art is supplied.
 *
 * Decoration repositioning is tap-to-place (select, then tap a new spot) rather than
 * drag-to-move, to avoid the gesture lived under both camera-pan and decoration-drag
 * at once; a true drag mode is reasonable follow-up work, noted in the Stage 5
 * report.
 */
export function GardenScreen() {
  const { width, height } = useWindowDimensions();
  const bounds: CameraBounds = useMemo(
    () => ({
      viewport: { width, height },
      scene: SCENE,
      minZoom: gardenTokens.zoomMin,
      maxZoom: gardenTokens.zoomMaxProposed,
    }),
    [width, height],
  );

  const [garden, setGarden] = useState<GardenState | null>(null);
  const [buildMode, setBuildMode] = useState(false);
  const [selectedKind, setSelectedKind] = useState<DecorationKind | null>(null);
  const [selectedDecorationId, setSelectedDecorationId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSavedGarden().then((saved) => {
      if (cancelled) return;
      setGarden(saved ?? createGarden(bounds));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (garden) saveGarden(garden);
  }, [garden]);

  const cameraRef = useRef<CameraState | null>(null);
  cameraRef.current = garden?.camera ?? null;
  const gestureStartCamera = useRef<CameraState | null>(null);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .onBegin(() => {
          gestureStartCamera.current = cameraRef.current;
        })
        .onUpdate((e) => {
          if (!gestureStartCamera.current) return;
          const next = panCamera(gestureStartCamera.current, { x: e.translationX, y: e.translationY }, bounds);
          setGarden((g) => (g ? { ...g, camera: next } : g));
        }),
    [bounds],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin(() => {
          gestureStartCamera.current = cameraRef.current;
        })
        .onUpdate((e) => {
          if (!gestureStartCamera.current) return;
          const next = pinchZoom(gestureStartCamera.current, { x: e.focalX, y: e.focalY }, e.scale, bounds);
          setGarden((g) => (g ? { ...g, camera: next } : g));
        }),
    [bounds],
  );

  const size = decorationSizeFraction(SCENE.width, SCENE.height);

  const handleTapAt = (screenX: number, screenY: number) => {
    const camera = cameraRef.current;
    if (!camera || !garden) return;
    const sceneX = camera.offsetX + screenX / camera.zoom;
    const sceneY = camera.offsetY + screenY / camera.zoom;
    const normX = sceneX / SCENE.width;
    const normY = sceneY / SCENE.height;

    if (buildMode && selectedKind) {
      const id = `${selectedKind}-${Date.now()}`;
      const result = placeDecoration(garden, { id, kind: selectedKind, x: normX, y: normY, rotation: 0 }, size);
      if (result.ok) setGarden(result.state);
      return;
    }

    if (selectedDecorationId) {
      const result = moveDecoration(garden, selectedDecorationId, normX, normY, size);
      if (result.ok) setGarden(result.state);
      setSelectedDecorationId(null);
      return;
    }

    const hit = [...garden.decorations].reverse().find((d) => {
      const halfW = size.width / 2;
      const halfH = size.height / 2;
      return normX >= d.x - halfW && normX <= d.x + halfW && normY >= d.y - halfH && normY <= d.y + halfH;
    });
    setSelectedDecorationId(hit?.id ?? null);
  };

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .maxDuration(300)
        .onEnd((e) => handleTapAt(e.x, e.y)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [garden, buildMode, selectedKind, selectedDecorationId, bounds],
  );

  const composedGesture = Gesture.Race(tapGesture, Gesture.Simultaneous(panGesture, pinchGesture));

  if (!garden) return <View style={styles.container} />;

  const camera = garden.camera;
  const season = currentSeason(garden, new Date());
  const SeasonArt = SEASON_ART[season];
  const toScreen = (normX: number, normY: number) => ({
    x: (normX * SCENE.width - camera.offsetX) * camera.zoom,
    y: (normY * SCENE.height - camera.offsetY) * camera.zoom,
  });

  const selected = garden.decorations.find((d) => d.id === selectedDecorationId) ?? null;
  const selectedScreen = selected ? toScreen(selected.x, selected.y) : null;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.canvas}>
          <View
            style={{
              position: "absolute",
              left: -camera.offsetX * camera.zoom,
              top: -camera.offsetY * camera.zoom,
              width: SCENE.width * camera.zoom,
              height: SCENE.height * camera.zoom,
            }}
          >
            <SeasonArt width="100%" height="100%" />
            {garden.characters
              .filter((c) => c.visible)
              .map((c) => (
                <View
                  key={c.id}
                  style={[styles.characterMarker, { left: c.x * SCENE.width * camera.zoom - 22, top: c.y * SCENE.height * camera.zoom - 22 }]}
                >
                  <Text style={styles.characterLabel}>{c.id === "millie" ? "Millie" : "Marmalade"}</Text>
                </View>
              ))}
            {garden.decorations.map((d) => {
              const Art = DECORATION_ART[d.kind as DecorationKind];
              const w = size.width * SCENE.width * camera.zoom;
              const h = size.height * SCENE.height * camera.zoom;
              const selectedStyle = d.id === selectedDecorationId ? styles.decorationSelected : undefined;
              return (
                <View
                  key={d.id}
                  style={[
                    { position: "absolute", left: d.x * SCENE.width * camera.zoom - w / 2, top: d.y * SCENE.height * camera.zoom - h / 2, width: w, height: h },
                    selectedStyle,
                    { transform: [{ rotate: `${d.rotation}deg` }] },
                  ]}
                >
                  <Art width="100%" height="100%" />
                </View>
              );
            })}
          </View>
        </View>
      </GestureDetector>

      {selected && selectedScreen ? (
        <View style={[styles.selectionToolbar, { left: Math.max(8, selectedScreen.x - 60), top: Math.max(8, selectedScreen.y - 64) }]}>
          <CozyIconButton icon={UndoIcon} accessibilityLabel="Rotate" onPress={() => setGarden((g) => (g ? rotateDecoration(g, selected.id, selected.rotation + 45).state : g))} />
          <CozyIconButton icon={CloseIcon} accessibilityLabel="Remove" onPress={() => {
            setGarden((g) => (g ? removeDecoration(g, selected.id).state : g));
            setSelectedDecorationId(null);
          }} />
        </View>
      ) : null}

      <SafeAreaView style={styles.hud} pointerEvents="box-none" edges={["top"]}>
        <View style={styles.hudRow} pointerEvents="box-none">
          <CozyHUDChip icon={StarIcon} value={0} label="Lysglimt" />
          <CozyIconButton
            icon={HammerIcon}
            accessibilityLabel={buildMode ? "Exit build mode" : "Build mode"}
            longPressHint="Place and arrange decorations"
            selected={buildMode}
            onPress={() => {
              setBuildMode((v) => !v);
              setSelectedKind(null);
              setSelectedDecorationId(null);
            }}
          />
        </View>
      </SafeAreaView>

      {buildMode ? (
        <View style={styles.palette} pointerEvents="box-none">
          {DECORATION_KINDS.map((kind) => {
            const Art = DECORATION_ART[kind];
            const active = kind === selectedKind;
            return (
              <Pressable
                key={kind}
                onPress={() => setSelectedKind(kind)}
                accessibilityRole="button"
                accessibilityLabel={kind}
                accessibilityState={{ selected: active }}
                style={[styles.paletteItem, active ? styles.paletteItemActive : null]}
              >
                <Art width={36} height={36} />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  canvas: { flex: 1, overflow: "hidden" },
  hud: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5 },
  // Settings lives in MainScreen's own top-right header overlay — keep this row on the
  // left so the two HUD overlays never collide.
  hudRow: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 12, gap: 10 },
  characterMarker: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    borderColor: textColors.onLightPanel,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  characterLabel: { fontSize: 9, fontWeight: "700", color: textColors.onLightPanel, textAlign: "center" },
  decorationSelected: { borderWidth: 2, borderColor: textColors.onLightPanel, borderRadius: 8 },
  selectionToolbar: { position: "absolute", flexDirection: "row", gap: 8, zIndex: 5 },
  palette: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 96,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 10,
    zIndex: 5,
  },
  paletteItem: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  paletteItemActive: { backgroundColor: "rgba(0,0,0,0.08)" },
});
