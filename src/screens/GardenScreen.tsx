import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { PREMIUM_MARMALADE, PREMIUM_MILLIE, PREMIUM_SCENE, PREMIUM_SEASON_BACKGROUNDS } from "../ui/theme/premiumArt";
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
import { CozyPanel } from "../ui/components/CozyPanel";
import { textColors } from "../ui/theme/colors";
import { gardenTokens } from "../ui/theme/layoutTokens";

// Candidate "Premium Art V1" raster backgrounds (assets/v3-premium/, see
// docs/PREMIUM_ART_IMPORT.md) replace the geometric SVG season scenes here. World
// coordinates (SCENE) now match the new art's own intrinsic pixel size exactly, so the
// existing pure camera/garden domain math (src/domain/garden) needs no changes — it
// only ever took the scene size as a parameter.
const SCENE = PREMIUM_SCENE;
const SEASON_ART: Record<Season, number> = PREMIUM_SEASON_BACKGROUNDS;

/**
 * Fullscreen garden world. Pan/pinch-zoom and decoration placement are driven by the
 * pure functions in src/domain/garden (camera.ts, garden.ts) — this component only
 * translates gestures into calls on that domain code and renders the result.
 *
 * Millie and Marmalade now render as the real illustrated character cutouts from the
 * premium pack instead of plain labeled markers.
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
  const seasonBackground = SEASON_ART[season];
  const characterSize = 130 * camera.zoom; // 1:1 aspect, see PREMIUM_CHARACTER_ASPECT
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
            <Image source={seasonBackground} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            {garden.characters
              .filter((c) => c.visible)
              .map((c) => (
                <Image
                  key={c.id}
                  source={c.id === "millie" ? PREMIUM_MILLIE : PREMIUM_MARMALADE}
                  resizeMode="contain"
                  accessibilityLabel={c.id === "millie" ? "Millie" : "Marmalade"}
                  style={{
                    position: "absolute",
                    left: c.x * SCENE.width * camera.zoom - characterSize / 2,
                    top: c.y * SCENE.height * camera.zoom - characterSize / 2,
                    width: characterSize,
                    height: characterSize,
                  }}
                />
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
        <View
          style={[
            styles.selectionToolbarWrap,
            {
              left: Math.min(Math.max(8, selectedScreen.x - 110), width - 228),
              top: Math.max(8, selectedScreen.y - 108),
            },
          ]}
        >
          <CozyPanel style={styles.selectionPanel}>
            <Text style={styles.selectionHint}>Tryk et nyt sted for at flytte</Text>
            <View style={styles.selectionActions}>
              <CozyIconButton
                icon={UndoIcon}
                accessibilityLabel="Rotér"
                longPressHint="Rotér 45°"
                onPress={() => setGarden((g) => (g ? rotateDecoration(g, selected.id, selected.rotation + 45).state : g))}
              />
              <CozyIconButton
                icon={CloseIcon}
                accessibilityLabel="Fjern"
                longPressHint="Fjern dekorationen"
                onPress={() => {
                  setGarden((g) => (g ? removeDecoration(g, selected.id).state : g));
                  setSelectedDecorationId(null);
                }}
              />
            </View>
          </CozyPanel>
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
  // A soft glow instead of a hard black rectangle — gold tone sampled from the
  // approved UI frames' own border color (#d2a44d), not an invented brand color.
  decorationSelected: {
    borderWidth: 3,
    borderColor: "#d2a44d",
    borderRadius: 999,
    shadowColor: "#d2a44d",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  selectionToolbarWrap: { position: "absolute", width: 220, zIndex: 5 },
  selectionPanel: { minHeight: 0 },
  selectionHint: { fontSize: 12, color: textColors.onLightPanel, textAlign: "center" },
  selectionActions: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
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
