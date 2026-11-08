import { CozyPressable } from "./ui/CozyPressable";
import { UndoHelp } from "./ui/UndoHelp";
import { CozyPanel } from "./ui/CozyPanel";
import { CozyButton, Timber } from "./ui/CozyButton";
import { GardenHome } from "./ui/GardenHome";
import { GameToolbar } from "./ui/GameToolbar";
import { ResourceBadge } from "./ui/ResourceBadge";
import { cozy } from "./ui/theme";
import { cozyRedesignImages } from "./assets/cozyRedesignImages";
import { GardenBuildScreen } from "./GardenBuildScreen";
import { GardenMiniPair } from "./GardenMiniPair";
import { MiniGameHub } from "./MiniGameHub";
import {
  newSolitaire,
  solitaireTypes,
  type SolitaireKind,
} from "./engine/solitaire";
import { finishMini } from "./engine/miniProgress";
import { appStyles as st } from "./App.styles";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Modal,
  Image,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Platform,
  AppState,
  PanResponder,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  boardMetrics,
  fitSolitaireBoard,
  dropDestination,
  type DropRegion,
} from "./presentation/board";
import { StackCardPicker } from "./StackCardPicker";
import { JourneyRibbon } from "./JourneyRibbon";
import { MainMenu, type MenuDestination } from "./MainMenu";
import { MaterialRibbon } from "./MaterialRibbon";
import { InventoryPanel } from "./InventoryPanel";
import type { MiniSlot } from "./engine/miniProgress";
import { QuestJournal } from "./QuestJournal";
import type { QuestObjective } from "./presentation/quests";
import { ScreenPager } from "./ScreenPager";
import {
  IdleFirefly,
  measureHintNode,
  type IdleGuideSettings,
} from "./living/IdleFirefly";
import { solitaireIdleHint } from "./presentation/idleHints";
import { GameRewardLine } from "./GameRewardLine";
import { ForestGuide } from "./ForestGuide";
import { winnableGame } from "./engine/winnable";
import { HiddenTreasureEffects } from "./HiddenTreasureEffects";
import { GardenDecorations } from "./GardenDecorations";
import { GardenViewport } from "./GardenViewport";
import { GardenCollection } from "./GardenCollection";
import { GardenEditOverlay } from "./GardenEditOverlay";
import { TeaTime } from "./TeaTime";
import { GardenMatch } from "./GardenMatch";
import { MiniArtwork } from "./MiniArtwork";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { randomUUID } from "expo-crypto";
import { useTranslation } from "react-i18next";
import i18n, { type Key, number, date } from "./i18n";
import {
  canMove,
  newGame,
  isStuck,
  drawCards,
  move,
  undo,
  restart,
  hints,
  autoComplete,
  cardsAt,
  red,
  type Card,
  type Place,
  type Game,
} from "./engine/solitaire";
import {
  migrate,
  loadSave,
  setProfile,
  setAvatar,
  AVATARS,
  setLanguage,
  saveQueue,
  SAVE_KEY,
  deviceLanguage,
  reward,
  validateUsername,
  type Save,
} from "./engine/save";
import { upgrades, place, seasonAt, type Season } from "./engine/world";
import {
  newMatch,
  newTea,
  hasMatchMove,
  teaWon,
  treasures,
  hiddenWon,
} from "./engine/minigames";
import { Cottage, Portrait, Forest } from "./Art";
import { LivingWorldAnimationEngine } from "./living/LivingWorldAnimationEngine";
import { VictorySparkles } from "./living/VictorySparkles";
import { CharacterIdle } from "./living/CharacterIdle";
import {
  challenges,
  challengeGame,
  type ChallengeId,
} from "./engine/challenges";
import { FestivalDecorations } from "./FestivalDecorations";
import { WorldNavigator } from "./WorldNavigator";
import { WorldArt } from "./WorldArt";
import { CardArtwork } from "./CardArtwork";
import { enterArea, areaOwned, type AreaId } from "./engine/progression";
import {
  matchForLevel,
  teaForLevel,
  treasuresForLevel,
  type MiniLevel,
} from "./engine/session";
import { StrongScrollView as ScrollView } from "./StrongScrollView";
import type { LayoutChangeEvent } from "react-native";
import { GameIcon } from "./GameIcon";
import { Audio } from "./Audio";
import { cozyImages } from "./assets/images";

type Screen =
  | "world"
  | "garden"
  | "play"
  | "mini"
  | "quests"
  | "inventory"
  | "decorations"
  | "collection"
  | "statistics"
  | "settings";
const write = saveQueue(AsyncStorage);
const uuid = () => randomUUID();
const suitKeys = {
  "♠": "spades",
  "♥": "hearts",
  "♣": "clubs",
  "♦": "diamonds",
} as const;
const rankKeys = { 1: "ace", 11: "jack", 12: "queen", 13: "king" } as const;
export default function App() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const wide = width >= 900;
  const [s, setS] = useState<Save | null>(null),
    [loadError, setLoadError] = useState(false),
    [writeError, setWriteError] = useState(false),
    [screen, setScreen] = useState<Screen>("garden");
  const playing = screen === "play";
  const metrics = boardMetrics(
    width - insets.left - insets.right,
    height - insets.top - insets.bottom - 58,
  );
  const railWidth = metrics.rail;
  const [menuOpen, setMenuOpen] = useState(false);
  const [undoHelp, setUndoHelp] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "appearance" | "audio" | "rules"
  >("profile");
  const [worldManagement, setWorldManagement] = useState<{
    serial: number;
    section: "buildings" | "storyJournal";
  } | null>(null);
  const [nextSolitaire, setNextSolitaire] = useState<SolitaireKind>("klondike");
  const [miniHelp, setMiniHelp] = useState(false);
  const [questRequest, setQuestRequest] = useState(0);
  const [appearanceRequest, setAppearanceRequest] = useState(0);
  const [miniTarget, setMiniTarget] = useState<
    "match" | "hidden" | "tea" | null
  >(null);
  const [questFocus, setQuestFocus] = useState<string | null>(null);
  const [decorationFocus, setDecorationFocus] = useState<number | undefined>();
  const [gardenEditing, setGardenEditing] = useState(false);
  const [dealContentHeight, setDealContentHeight] = useState(160);
  const [dealError, setDealError] = useState<Key | null>(null);

  const [miniBounds, setMiniBounds] = useState({ width: 0, height: 0 });
  const [stackPile, setStackPile] = useState<number | null>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState<Place | null>(null);

  const [guaranteedDeal, setGuaranteedDeal] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  // Show a gentle one-time notification when a decoration is actually earned or bought.
  // The first loaded save establishes the baseline; old inventory is never announced.
  const knownGardenItems = useRef<string[] | null>(null);
  useEffect(() => {
    if (!s) return;
    const current = s.economy.inventory;
    if (knownGardenItems.current !== null) {
      const added = current.filter(
        (item) => !knownGardenItems.current!.includes(item),
      );
      const newDecoration = added.find((item) =>
        upgrades.some((u) => u.id === item && u.id !== "cards"),
      );
      if (newDecoration) {
        const names: Record<string, [string, string]> = {
          flowers: ["Blomsterbed", "Flower bed"],
          bench: ["Havebænk", "Garden bench"],
          bridge: ["Havebro", "Garden bridge"],
          lantern: ["Lanterne", "Lantern"],
          forest: ["Træer", "Trees"],
          birdhouse: ["Fuglehus", "Birdhouse"],
          teaTable: ["Tebord", "Tea table"],
        };
        const name =
          names[newDecoration]?.[s.preferences.language === "da" ? 0 : 1] ??
          newDecoration;
        setTip(
          s.preferences.language === "da"
            ? "✨ Ny dekoration: " + name
            : "✨ New decoration: " + name,
        );
      }
    }
    knownGardenItems.current = current;
  }, [s?.economy.inventory]);
  const checkBlockedAfterAction = useRef(false);
  useEffect(() => {
    if (!checkBlockedAfterAction.current || !s) return;
    checkBlockedAfterAction.current = false;
    if (isStuck(s.game)) setTip(String(i18n.t("solitaireNoMoves")));
  }, [s?.game]);
  const [challengeOpen, setChallengeOpen] = useState(false);
  useEffect(() => {
    if (!tip) return;
    const timer = setTimeout(() => setTip(null), 2500);
    return () => clearTimeout(timer);
  }, [tip]);
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeId | null>(
    null,
  );
  const [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [dialog, setDialog] = useState<"new" | "restart" | null>(null),
    [help, setHelp] = useState(false),
    [npc, setNpc] = useState<"millie" | "marmalade" | "pip" | null>(null),
    [nextDraw, setNextDraw] = useState<1 | 3>(3);
  useEffect(() => {
    if (!npc) return;
    const timer = setTimeout(() => setNpc(null), 2500);
    return () => clearTimeout(timer);
  }, [npc]);
  const location = s?.world.area ?? "cottage";
  const setLocation = (area: AreaId) => act((v) => enterArea(v, area));
  const [miniLevel, setMiniLevel] = useState<MiniLevel>(1);

  const [miniHub, setMiniHub] = useState(false);
  const [matchBusy, setMatchBusy] = useState(false);
  const [sceneSize, setSceneSize] = useState({ width: 700, height: 410 });
  const [selected, setSelected] = useState<Place | null>(null),
    [hint, setHint] = useState<ReturnType<typeof hints>[number] | null>(null);
  const [mini, setMini] = useState<"match" | "hidden" | "tea" | null>(null),
    [miniId, setMiniId] = useState(uuid),
    [match, setMatch] = useState(newMatch),
    [tea, setTea] = useState(newTea),
    [found, setFound] = useState<string[]>([]);
  useEffect(
    () => setDealError(null),
    [dialog, nextDraw, nextSolitaire, guaranteedDeal, pendingChallenge],
  );
  const activeMini = miniHub ? null : mini;
  const focused =
    playing ||
    screen === "garden" ||
    screen === "decorations" ||
    screen === "statistics" ||
    screen === "world" ||
    screen === "quests" ||
    screen === "inventory" ||
    screen === "settings" ||
    screen === "mini";
  const lastCardTap = useRef<{ id: string; time: number } | null>(null);
  const [idleActivity, setIdleActivity] = useState(0);
  const [touching, setTouching] = useState(false);
  const idleNodes = useRef<Record<string, View>>({});
  const dropTargets = useRef<Record<string, { node: View; place: Place }>>({});
  const update = useCallback(
    (fn: (v: Save) => Save) => setS((v) => (v ? fn(v) : v)),
    [],
  );
  const latestSave = useRef<Save | null>(null);
  latestSave.current = s;
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setTouching(false);
      setIdleActivity((n) => n + 1);
      if (state === "active" || !latestSave.current) return;
      const current = latestSave.current;
      const value = {
        ...current,
        profile: current.profile
          ? { ...current.profile, lastPlayedAt: new Date().toISOString() }
          : null,
      };
      latestSave.current = value;
      update((v) => ({
        ...v,
        profile: v.profile
          ? {
              ...v.profile,
              lastPlayedAt:
                value.profile?.lastPlayedAt ?? new Date().toISOString(),
            }
          : null,
      }));
      void write(value).catch(() => setWriteError(true));
    });
    return () => subscription.remove();
  }, []);
  const load = useCallback(async () => {
    try {
      const {
        save: data,
        recovered,
        reset,
      } = await loadSave(
        AsyncStorage,
        uuid(),
        deviceLanguage(getLocales()[0]?.languageCode ?? "en"),
      );
      // System reduced motion is observed live; do not latch it into a permanent manual preference.
      await i18n.changeLanguage(data.preferences.language);
      setMessage(
        reset
          ? String(i18n.t("saveReset"))
          : recovered
            ? String(i18n.t("backupRecovered"))
            : "",
      );
      if (data.profile) data.profile.lastPlayedAt = new Date().toISOString();
      setS(data);
      if (data.miniSession) {
        setMini(data.miniSession.kind);
        setMiniId(data.miniSession.id);
        setMiniLevel(data.miniSession.level);
        setMatch(data.miniSession.match);
        setTea(data.miniSession.tea);
        setFound(data.miniSession.found);
      }
      setName(data.profile?.username ?? "");
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load, update]);
  useEffect(() => {
    if (!s) return;
    const t = setTimeout(() => {
      void write(s)
        .then(() => setWriteError(false))
        .catch(() => setWriteError(true));
    }, 150);
    return () => clearTimeout(t);
  }, [s]);
  useEffect(() => {
    if (s?.game.won) update((v) => reward(v, "solitaire", v.game.id));
  }, [s?.game.won, s?.game.id, update]);
  const miniDone =
    mini === "match"
      ? match.score >= match.target
      : mini === "tea"
        ? teaWon(tea)
        : mini === "hidden"
          ? hiddenWon(found)
          : false;
  useEffect(() => {
    if (mini && miniDone) update((v) => reward(v, mini, miniId, miniLevel));
  }, [mini, miniDone, miniId, miniLevel, update]);
  useEffect(() => {
    if (!s) return;
    const miniSession = mini
      ? { id: miniId, kind: mini, level: miniLevel, match, tea, found }
      : null;
    update((v) =>
      JSON.stringify(v.miniSession) === JSON.stringify(miniSession)
        ? v
        : {
            ...v,
            miniSession,
            miniProgress: {
              ...v.miniProgress,
              slots: v.miniProgress.slots.map((slot) =>
                miniSession && slot.session.id === miniSession.id
                  ? { ...slot, session: miniSession }
                  : slot,
              ),
            },
          },
    );
  }, [!!s, mini, miniId, miniLevel, match, tea, found, update]);
  const tt = (key: Key, options?: Record<string, unknown>) =>
    String(t(key, options));
  const changeLanguage = (language: "da" | "en") => {
    setMessage("");
    void i18n.changeLanguage(language);
    update((v) => setLanguage(v, language));
  };
  const notify = (key: Key) => setMessage(tt(key));
  const act = (fn: (v: Save) => Save) => {
    try {
      update((v) => {
        try {
          return fn(v);
        } catch (e) {
          setMessage(tt((e as Error).message as Key));
          return v;
        }
      });
    } catch {
      notify("invalidTransaction");
    }
  };
  const cardName = (c: Card) =>
    tt("card", {
      rank:
        c.rank in rankKeys
          ? tt(rankKeys[c.rank as keyof typeof rankKeys])
          : number(c.rank, i18n.language),
      suit: tt(suitKeys[c.suit]),
    });
  const iconButton = (
    icon: string,
    label: string,
    onPress: () => void,
    disabled = false,
    selected = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={() => {
        setTip(label);
        onPress();
      }}
      onLongPress={() => setTip(label)}
      style={({ pressed }) => [
        st.iconButton,
        selected && st.navActive,
        disabled && st.disabled,
        pressed && { opacity: 0.65 },
      ]}
    >
      <Timber green={selected} />
      <GameIcon name={icon} color={cozy.color.cream} size={24} />
    </Pressable>
  );
  const button = (
    label: string,
    onPress: () => void,
    disabled = false,
    quiet = false,
    accessibilityLabel?: string,
    selected?: boolean,
  ) => {
    return (
      <CozyButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        quiet={quiet}
        selected={selected}
        accessibilityLabel={accessibilityLabel}
      />
    );
  };
  const heading = (title: string, sub?: string) => (
    <View style={st.heading}>
      <Text style={st.eyebrow}>COZY SOLITAIRE</Text>
      <Text accessibilityRole="header" style={st.title}>
        {title}
      </Text>
      {sub && <Text style={st.subtitle}>{sub}</Text>}
    </View>
  );
  const chooseLanguage = () => (
    <View style={st.row}>
      {button(
        "Dansk",
        () => changeLanguage("da"),
        false,
        i18n.language !== "da",
      )}
      {button(
        "English",
        () => changeLanguage("en"),
        false,
        i18n.language !== "en",
      )}
    </View>
  );
  if (loadError)
    return (
      <SafeAreaView style={st.root}>
        <View style={st.welcome}>
          {heading(tt("saveError"))}
          {button(tt("retry"), () => void load())}
        </View>
      </SafeAreaView>
    );
  if (!s)
    return (
      <SafeAreaView style={st.root}>
        <Text style={st.subtitle}>{tt("loading")}</Text>
      </SafeAreaView>
    );
  const season =
    s.preferences.season === "auto"
      ? seasonAt(new Date())
      : s.preferences.season;
  const worldSeason = location === "winterland" ? "winter" : season;
  const language = s.preferences.language;
  const go = (id: Screen) => {
    if (id !== "quests") setQuestFocus(null);
    if (id !== "world") {
      setAppearanceRequest(0);
      setWorldManagement(null);
    }
    if (id !== "mini") setMiniTarget(null);
    setMiniHelp(false);
    setMenuOpen(false);
    setTouching(false);
    if (id !== "decorations") setDecorationFocus(undefined);
    setMatchBusy(false);
    setStackPile(null);
    setChallengeOpen(false);
    setScreen(id === "decorations" ? "garden" : id);
    if (id === "decorations") {
      setLocation("cottage");
      setGardenEditing(true);
    } else if (id !== "garden") setGardenEditing(false);
    setMessage("");
    setHelp(false);
    setNpc(null);
    setSelected(null);
    setHint(null);
  };
  const idleSettings: IdleGuideSettings = {
    enabled: s.preferences.animations,
    reducedMotion: s.preferences.reducedMotion,
    activity: idleActivity,
    paused:
      menuOpen ||
      touching ||
      !!dragging ||
      !!dialog ||
      help ||
      miniHelp ||
      challengeOpen ||
      stackPile !== null ||
      !!message,
  };
  const idleRef = (id: string) => (node: View | null) => {
    if (node) idleNodes.current[id] = node;
    else delete idleNodes.current[id];
  };
  const solitaireGuide = async () => {
    const move = solitaireIdleHint(s.game);
    if (!move) {
      if (!s.game.won && (s.game.stock.length || s.game.waste.length)) {
        const stock = await measureHintNode(idleNodes.current.stock);
        return stock
          ? [{ x: stock.x + stock.width - 3, y: stock.y + stock.height * 0.5 }]
          : [];
      }
      return [];
    }
    const sourceNode =
      idleNodes.current["card:" + JSON.stringify(move.from)] ??
      (move.from.kind === "tableau"
        ? idleNodes.current["stack:" + move.from.pile]
        : undefined);
    const destinationNode =
      move.to.kind === "tableau"
        ? dropTargets.current["t" + move.to.pile]?.node
        : move.to.kind === "foundations"
          ? dropTargets.current["f" + move.to.pile]?.node
          : undefined;
    const [source, destination] = await Promise.all([
      measureHintNode(sourceNode),
      measureHintNode(destinationNode),
    ]);
    if (!source || !destination) return [];
    const sourcePoint = {
      x: source.x + source.width - 3,
      y: source.y + (move.from.kind === "tableau" ? 4 : source.height * 0.5),
    };
    const toY =
      move.to.kind === "tableau"
        ? (boardLayout.columns[move.to.pile].offsets[
            s.game.tableau[move.to.pile].length - 1
          ] ?? 0) +
          cardHeight * 0.5
        : cardHeight * 0.5;
    return [
      sourcePoint,
      { x: destination.x + destination.width - 3, y: destination.y + toY },
    ];
  };
  const earnMaterials = () => {
    go("play");
  };
  const openMini = (slot: MiniSlot) => {
    if (slot.done || slot.moves <= 0) return;
    const session = slot.session;
    setMini(session.kind);
    setMiniId(session.id);
    setMiniLevel(session.level);
    setMatch({ ...session.match, turns: slot.moves });
    setTea(session.tea);
    setFound(session.found);
    setMiniHub(false);
    go("mini");
  };
  const miniMoves =
    s?.miniProgress.slots.find((slot) => slot.session.id === miniId)?.moves ??
    0;
  const spendMiniMove = () =>
    update((v) => ({
      ...v,
      miniProgress: {
        ...v.miniProgress,
        slots: v.miniProgress.slots.map((slot) =>
          slot.session.id === miniId && slot.moves > 0
            ? { ...slot, moves: slot.moves - 1 }
            : slot,
        ),
      },
    }));
  const navigateMenu = (id: MenuDestination) => {
    if (
      id === "newDeal" ||
      id === "restartDeal" ||
      id === "rules" ||
      id === "challenge"
    ) {
      go("play");
      if (id === "newDeal") {
        setPendingChallenge(null);
        setDialog("new");
      } else if (id === "restartDeal") setDialog("restart");
      else if (id === "rules") setHelp(true);
      else setChallengeOpen(true);
      return;
    }

    if (id === "earn") {
      earnMaterials();
      return;
    }
    if (id === "forest") {
      setLocation("forest");
      go("garden");
      return;
    }
    if (id === "mini") {
      setMiniHub(true);
      go("mini");
      return;
    }
    if (id === "garden") {
      setLocation("cottage");
      setGardenEditing(false);
      go("garden");
      return;
    }
    go(id);
  };
  const pref = <K extends keyof Save["preferences"]>(
    key: K,
    value: Save["preferences"][K],
  ) =>
    update((v) => ({ ...v, preferences: { ...v.preferences, [key]: value } }));
  const applyGame = (fn: (g: Game) => Game) => {
    checkBlockedAfterAction.current = true;
    update((v) => ({ ...v, game: fn(v.game) }));
    setSelected(null);
    setHint(null);
  };
  function tap(place: Place) {
    const now = Date.now();
    const card = cardsAt(s!.game, place)[0];
    const doubleTap =
      !!card &&
      lastCardTap.current?.id === card.id &&
      now - lastCardTap.current.time <= 350;
    lastCardTap.current = card ? { id: card.id, time: now } : null;
    if (doubleTap && place.kind !== "foundations") {
      const pile = s!.game.foundations.findIndex((_, pile) =>
        canMove(s!.game, place, { kind: "foundations", pile }),
      );
      if (pile >= 0) {
        lastCardTap.current = null;
        applyGame((g) => move(g, place, { kind: "foundations", pile }));
        return;
      }
    }
    if (selected) {
      const next = move(s!.game, selected, place);
      if (next !== s!.game) {
        lastCardTap.current = null;
        applyGame(() => next);
        return;
      }
    }
    setSelected(card?.up ? place : null);
  }
  async function drop(
    from: Place,
    x: number,
    y: number,
    dx: number,
    dy: number,
  ) {
    const regions = await Promise.all(
      Object.values(dropTargets.current).map(
        (target) =>
          new Promise<DropRegion>((resolve) => {
            target.node.measureInWindow((tx, ty, w, h) =>
              resolve({
                place: target.place,
                x: tx,
                y: ty,
                width: w,
                height: h,
                cardHeight,
                landingY:
                  target.place.kind === "tableau"
                    ? ty +
                      (boardLayout.columns[target.place.pile].offsets[
                        s!.game.tableau[target.place.pile].length - 1
                      ] ?? 0)
                    : ty,
              }),
            );
          }),
      ),
    );
    // Measurement completes asynchronously; resolve against the latest saved game exactly once.
    update((v) => {
      if (v.game.id !== s!.game.id || v.game.moves !== s!.game.moves) return v;
      const source = regions.find(
        (r) =>
          r.place.kind === from.kind &&
          (from.kind === "waste" ||
            (r.place.kind !== "waste" && r.place.pile === from.pile)),
      );
      const originY = source
        ? source.y +
          (from.kind === "tableau"
            ? (boardLayout.columns[from.pile].offsets[
                from.index ?? s!.game.tableau[from.pile].length - 1
              ] ?? 0)
            : 0)
        : 0;
      const bounds = source
        ? {
            x: source.x + dx,
            y: originY + dy,
            width: cardWidth,
            height: cardHeight,
          }
        : undefined;
      const to = dropDestination(v.game, from, x, y, regions, bounds);
      return to ? { ...v, game: move(v.game, from, to) } : v;
    });
    setSelected(null);
    setHint(null);
  }
  const boardLayout = fitSolitaireBoard(
    boardSize.width || width - insets.left - insets.right - railWidth - 24,
    boardSize.height || height - insets.top - insets.bottom - 58 - 16 - 24,
    s.game.tableau,
  );
  const { cardWidth, cardHeight, tableauHeight } = boardLayout;
  const isSelected = (p: Place) =>
    selected?.kind === p.kind &&
    (p.kind === "waste" ||
      (selected?.kind !== "waste" &&
        selected?.pile === p.pile &&
        selected?.index === p.index));
  const renderCard = (c: Card, p: Place, overlap = false) => (
    <Draggable
      key={c.id}
      testID={`playing-card-${c.id}`}
      enabled={c.up}
      onTap={() => tap(p)}
      onDrop={(x, y, dx, dy) => drop(p, x, y, dx, dy)}
      onDragStart={() => {
        setDragging(p);
      }}
      onDragEnd={() => {
        setDragging(null);
      }}
      tail={
        p.kind === "tableau"
          ? s.game.tableau[p.pile]
              .map((card, index) => ({ card, index }))
              .filter(
                ({ index }) =>
                  index > (p.index ?? 0) &&
                  boardLayout.columns[p.pile].visibleIndices.includes(index),
              )
              .map(({ card, index }) => (
                <View
                  pointerEvents="none"
                  key={card.id}
                  style={[
                    st.card,
                    {
                      position: "absolute",
                      top:
                        boardLayout.columns[p.pile].offsets[index] -
                        boardLayout.columns[p.pile].offsets[p.index ?? 0],
                      width: cardWidth,
                      height: cardHeight,
                    },
                  ]}
                >
                  <CardArtwork card={card} theme={s.world.theme} />
                </View>
              ))
          : null
      }
      label={c.up ? cardName(c) : tt("faceDown")}
      style={{
        width: cardWidth,
        height: cardHeight,
        ...(overlap && p.kind === "tableau"
          ? {
              position: "absolute",
              top: boardLayout.columns[p.pile].offsets[p.index ?? 0],
            }
          : {}),
        zIndex:
          dragging && JSON.stringify(dragging) === JSON.stringify(p) ? 100 : 1,
        opacity:
          dragging?.kind === "tableau" &&
          p.kind === "tableau" &&
          dragging.pile === p.pile &&
          (p.index ?? 0) > (dragging.index ?? 0)
            ? 0
            : 1,
      }}
    >
      <View
        collapsable={false}
        ref={idleRef("card:" + JSON.stringify(p))}
        style={[
          st.card,
          { width: cardWidth, height: cardHeight },
          !c.up && st.cardBack,
          isSelected(p) && st.selected,
          hint &&
            JSON.stringify(hint.from) === JSON.stringify(p) &&
            st.selected,
        ]}
      >
        <CardArtwork card={c} theme={s.world.theme} />
        {overlap &&
          c.up &&
          p.kind === "tableau" &&
          (p.index ?? 0) < s.game.tableau[p.pile].length - 1 &&
          (() => {
            const strip =
              boardLayout.columns[p.pile].offsets[
                boardLayout.columns[p.pile].visibleIndices.find(
                  (index) => index > (p.index ?? 0),
                )!
              ] - boardLayout.columns[p.pile].offsets[p.index ?? 0];
            return (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 1,
                  right: 1,
                  height: strip,
                  backgroundColor: "#fff9eb",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: red(c) ? "#b53d4d" : "#18392f",
                    fontWeight: "700",
                    fontSize: Math.min(13, Math.max(5, strip - 1)),
                    lineHeight: Math.max(5, strip),
                    paddingLeft: 2,
                  }}
                >
                  {c.rank === 1
                    ? "A"
                    : c.rank === 11
                      ? "J"
                      : c.rank === 12
                        ? "Q"
                        : c.rank === 13
                          ? "K"
                          : c.rank}
                  {c.suit}
                </Text>
              </View>
            );
          })()}
      </View>
    </Draggable>
  );
  const target = (p: Place, key: string, children: React.ReactNode) => (
    <View
      key={key}
      ref={(node) => {
        if (node) dropTargets.current[key] = { node, place: p };
        else delete dropTargets.current[key];
      }}
      collapsable={false}
      style={{
        width: cardWidth,
        height: p.kind === "tableau" ? tableauHeight : cardHeight,
        zIndex:
          dragging?.kind === p.kind &&
          dragging?.kind !== "waste" &&
          p.kind !== "waste" &&
          dragging?.pile === p.pile
            ? 100
            : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tt(
          p.kind === "foundations" ? "foundation" : "tableau",
          { number: p.kind === "waste" ? 0 : p.pile + 1 },
        )}
        onPress={() => tap(p)}
        style={[
          st.slot,
          { width: cardWidth, height: cardHeight, position: "absolute" },
        ]}
      >
        <Text style={st.slotText}>{p.kind === "foundations" ? "A" : "♧"}</Text>
      </Pressable>
      {children}
    </View>
  );
  const gardenScene = (hidden = false) => (
    <View
      testID="garden-scene"
      style={[
        st.scene,
        { flex: 1, minHeight: 0, borderWidth: 0, borderRadius: 0 },
      ]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (
          !Number.isFinite(width) ||
          !Number.isFinite(height) ||
          width <= 0 ||
          height <= 0
        )
          return;
        setSceneSize((previous) =>
          previous.width === width && previous.height === height
            ? previous
            : { width, height },
        );
      }}
    >
      {location !== "cottage" ? (
        <WorldArt
          season={worldSeason}
          area={location}
          levels={s.world.buildings}
        />
      ) : (
        <Image
          source={
            !hidden && location === "cottage" && height > width && season === "spring"
              ? cozyImages.gardenPortrait
              : cozyImages.seasons[season]
          }
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
          testID="garden-background-image"
          resizeMode={hidden ? "cover" : "contain"}
          accessibilityIgnoresInvertColors
        />
      )}
      {!hidden && location === "cottage" && !gardenEditing && (
        <GardenDecorations
          owned={s.economy.inventory}
          placements={s.placements}
          economy={s.economy}
          width={sceneSize.width}
          height={sceneSize.height}
          enabled={s.preferences.animations}
          reducedMotion={s.preferences.reducedMotion}
        />
      )}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              s.preferences.time === "evening"
                ? "#19364e"
                : s.preferences.time === "sunset"
                  ? "#df9b65"
                  : s.preferences.time === "morning"
                    ? "#ffedb2"
                    : "transparent",
            opacity:
              s.preferences.time === "evening"
                ? 0.28
                : s.preferences.time === "sunset"
                  ? 0.16
                  : 0.08,
          },
        ]}
      />
      <LivingWorldAnimationEngine
        season={worldSeason}
        enabled={s.preferences.animations}
        quality={s.preferences.animationQuality}
        reducedMotion={s.preferences.reducedMotion}
        intensity={s.preferences.weather}
        width={sceneSize.width}
        height={sceneSize.height}
        time={s.preferences.time}
        cottageLights={location === "cottage"}
      />
      {hidden && (
        <IdleFirefly
          settings={{
            ...idleSettings,
            enabled: idleSettings.enabled && !miniDone,
          }}
          revision={found}
          resolve={() => {
            const next = treasuresForLevel(miniLevel, miniId).find(
              (o) => !found.includes(o.id),
            );
            return next
              ? [
                  {
                    x: (next.x * sceneSize.width) / 100 + 12,
                    y: (next.y * sceneSize.height) / 100 - 8,
                  },
                ]
              : [];
          }}
        />
      )}
      {hidden && (
        <HiddenTreasureEffects
          key={miniId}
          found={found}
          level={miniLevel}
          seed={miniId}
          width={sceneSize.width}
          height={sceneSize.height}
          season={worldSeason}
          quality={s.preferences.animationQuality}
          enabled={s.preferences.animations}
          reducedMotion={s.preferences.reducedMotion}
        />
      )}
      {!hidden && <FestivalDecorations events={s.world.events} />}
      {!hidden && location === "cottage" && gardenEditing && (
        <GardenEditOverlay
          economy={s.economy}
          owned={s.economy.inventory}
          placements={s.placements}
          width={sceneSize.width}
          height={sceneSize.height}
          language={language}
          onPlace={(id, x, y) =>
            act((v) => ({
              ...v,
              placements: place(v.economy.inventory, v.placements, {
                id,
                x,
                y,
              }),
            }))
          }
        />
      )}

      {hidden
        ? treasuresForLevel(miniLevel, miniId)
            .filter((o) => !found.includes(o.id))
            .map((o) => (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={tt(o.id)}
                onPress={() => {
                  if (!miniDone && miniMoves > 0 && !found.includes(o.id)) {
                    spendMiniMove();
                    setFound((f) => [...f, o.id]);
                  }
                }}
                style={{
                  position: "absolute",
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  width: 44,
                  height: 44,
                  transform: [{ translateX: -22 }, { translateY: -22 }],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View pointerEvents="none">
                  <MiniArtwork
                    kind="treasure"
                    value={treasures.findIndex((t) => t.id === o.id)}
                    size={30}
                  />
                </View>
              </Pressable>
            ))
        : null}
    </View>
  );
  if (!s.profile)
    return (
      <SafeAreaView style={st.root}>
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={[
            st.onboarding,
            wide && { flexDirection: "row" },
          ]}
        >
          <View style={st.welcomeArt}>
            <Cottage season={season} />
          </View>
          <View style={st.welcome}>
            {heading(tt("welcomeTitle"), tt("welcomeText"))}
            {!!message && (
              <Text accessibilityRole="alert" style={st.small}>
                {message}
              </Text>
            )}
            <Text style={st.label}>{tt("language")}</Text>
            {chooseLanguage()}
            <Text style={st.label}>{tt("username")}</Text>
            <TextInput
              accessibilityLabel={tt("username")}
              value={name}
              onChangeText={setName}
              maxLength={60}
              style={st.input}
              autoComplete="off"
              onSubmitEditing={() => {
                if (validateUsername(name))
                  update((v) => setProfile(v, name, uuid()));
              }}
            />
            <Text style={st.small}>{tt("usernameError")}</Text>
            {button(
              tt("confirmName"),
              () => update((v) => setProfile(v, name, uuid())),
              !validateUsername(name),
            )}
            <Text style={st.small}>{tt("privacy")}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      edges={screen === "garden" ? [] : ["top", "right", "bottom", "left"]}
      style={st.root}
      onTouchStart={() => {
        setTouching(true);
        setIdleActivity((n) => n + 1);
      }}
      onTouchEnd={(event) => {
        setTouching((event.nativeEvent.touches?.length ?? 0) > 0);
        setIdleActivity((n) => n + 1);
      }}
      onTouchCancel={() => {
        setTouching(false);
        setIdleActivity((n) => n + 1);
      }}
    >
      {undoHelp && (
        <UndoHelp
          visible
          onClose={() => setUndoHelp(false)}
          onEarn={() => {
            setUndoHelp(false);
            go("garden");
          }}
        />
      )}
      <Audio
        music={s.preferences.music}
        sound={s.preferences.sound}
        victoryId={s.game.won ? s.game.id : null}
      />
      {
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          testID="play-season-scene"
        >
          <Image
            source={cozyImages.seasons[season]}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
          />
          {screen !== "garden" &&
            !(screen === "mini" && activeMini === "hidden") && (
              <LivingWorldAnimationEngine
                season={season}
                enabled={s.preferences.animations}
                quality={s.preferences.animationQuality}
                reducedMotion={s.preferences.reducedMotion}
                intensity={s.preferences.weather}
                width={width}
                height={height}
                time={s.preferences.time}
                cottageLights
              />
            )}
        </View>
      }
      {screen !== "garden" &&
        screen !== "play" &&
        !(screen === "mini" && activeMini) && (
          <JourneyRibbon
            save={s}
            onNext={(id) => {
              if (id) {
                setQuestFocus(id);
                setQuestRequest((n) => n + 1);
                go("quests");
              } else go("world");
            }}
            onAppearance={() => {
              setAppearanceRequest((n) => n + 1);
              go("world");
            }}
          />
        )}
      <View style={st.shell}>
        <View style={st.main}>
          {writeError && (
            <View style={st.notice}>
              <Text>{tt("writeError")}</Text>
              {button(
                tt("retry"),
                () =>
                  void write(s)
                    .then(() => setWriteError(false))
                    .catch(() => {}),
              )}
            </View>
          )}
          <ScreenViewport fixed={focused}>
            {screen === "world" && (
              <WorldNavigator
                save={s}
                onUpdate={act}
                onNavigate={go}
                appearanceRequest={appearanceRequest}
                managementRequest={worldManagement}
                onQuest={(id) => {
                  setQuestFocus(id);
                  setQuestRequest((n) => n + 1);
                  go("quests");
                }}
              />
            )}
            {screen === "garden" &&
              (gardenEditing ? (
                <GardenBuildScreen
                  season={season}
                  save={s}
                  scene={gardenScene()}
                  onUpdate={act}
                  onDone={() => setGardenEditing(false)}
                />
              ) : (
                <GardenHome
                  season={season}
                  cottage={location === "cottage"}
                  save={s}
                  scene={gardenScene()}
                  onPlay={() => go("play")}
                  onBuild={() => setGardenEditing(true)}
                  onInventory={() => go("inventory")}
                  onMini={openMini}
                  onHelp={() => setTip(tt("miniProgressInfo"))}
                  onMillie={() => setNpc("millie")}
                  onMarmalade={() => setNpc("marmalade")}
                >
                  {location === "forest" && (
                    <ForestGuide
                      bottom={insets.bottom + (height > width ? 214 : 126)}
                      availableHeight={Math.max(
                        70,
                        height -
                          insets.top -
                          insets.bottom -
                          (height > width ? 340 : 245),
                      )}
                      save={s}
                      onUpdate={act}
                      onGather={earnMaterials}
                      onGame={(kind) => {
                        // Open the earnable game hub from forest objectives;
                        // returning to the same garden left the action inert.
                        setMiniHub(true);
                        go("mini");
                        setTip(tt("miniProgressInfo"));
                      }}
                      onManage={() => {
                        setWorldManagement({
                          serial: Date.now(),
                          section: "buildings",
                        });
                        go("world");
                      }}
                      onNext={() => go("world")}
                      onToast={setTip}
                    />
                  )}
                  {npc && (
                    <Modal
                      transparent
                      visible
                      animationType="fade"
                      onRequestClose={() => setNpc(null)}
                    >
                      <View style={st.overlay}>
                        <View style={st.modal}>
                          <Text style={st.label}>{tt(npc)}</Text>
                          <Text style={st.subtitle}>
                            {tt((npc + "Hello") as Key, {
                              username: s.profile.username,
                            })}
                          </Text>
                          <View style={st.row}>
                            {button(tt("quests"), () => go("quests"))}
                            {button(
                              tt("close"),
                              () => setNpc(null),
                              false,
                              true,
                            )}
                          </View>
                        </View>
                      </View>
                    </Modal>
                  )}
                </GardenHome>
              ))}
            {screen === "play" && (
              <View
                style={[st.playLayout, { flexDirection: "column", padding: 4 }]}
                testID="landscape-play-layout"
              >
                <View style={[st.playCenter, { zIndex: dragging ? 1000 : 1 }]}>
                  <View style={st.playStatus}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 10, color: cozy.color.honey }}
                      >
                        {tt((s.game.variant ?? "klondike") as Key)}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[st.small, { color: cozy.color.cream }]}
                      >
                        {tt("moves", { count: s.game.moves })}
                      </Text>
                    </View>
                    <ResourceBadge
                      icon="glimmer"
                      label={tt("glimmers")}
                      value={s.economy.wallet.glimmers}
                    />
                    <ResourceBadge
                      icon="undo"
                      label={tt("undoPoints")}
                      value={s.miniProgress.undo}
                    />
                  </View>
                  {s.game.won && (
                    <View
                      testID="solitaire-win-summary"
                      style={[st.panel, { padding: 8 }]}
                    >
                      <Text style={st.sectionTitle}>{tt("victory")}</Text>
                      <Text style={st.subtitle}>{tt("victoryText")}</Text>
                      <GameRewardLine
                        kind="solitaire"
                        level={s.game.draw === 3 ? 2 : 1}
                      />
                      <VictorySparkles
                        enabled={s.preferences.animations}
                        reducedMotion={s.preferences.reducedMotion}
                      />
                    </View>
                  )}
                  <View
                    style={{ flex: 1, minHeight: 0 }}
                    testID="card-board-viewport"
                    onLayout={(event) => {
                      const { width, height } = event.nativeEvent.layout;
                      if (width > 0 && height > 0)
                        setBoardSize((previous) =>
                          previous.width === width && previous.height === height
                            ? previous
                            : { width, height },
                        );
                    }}
                  >
                    <View
                      pointerEvents={s.game.won ? "none" : "auto"}
                      style={[st.board, s.game.won && { opacity: 0.16 }]}
                      testID="solitaire-board"
                    >
                      <IdleFirefly
                        settings={{
                          ...idleSettings,
                          enabled: idleSettings.enabled && !s.game.won,
                        }}
                        revision={s.game}
                        resolve={solitaireGuide}
                        absolute
                      />
                      <View
                        testID="board-ambience"
                        pointerEvents="none"
                        style={[
                          StyleSheet.absoluteFill,
                          { borderRadius: 16, overflow: "hidden", zIndex: 0 },
                        ]}
                      >
                        <LivingWorldAnimationEngine
                          surface="board"
                          season={season}
                          enabled={s.preferences.animations}
                          quality={s.preferences.animationQuality}
                          reducedMotion={s.preferences.reducedMotion}
                          intensity={s.preferences.weather}
                          width={
                            boardSize.width ||
                            width - insets.left - insets.right - railWidth - 24
                          }
                          height={
                            boardSize.height ||
                            height - insets.top - insets.bottom - 98
                          }
                          time={s.preferences.time}
                          cottageLights={false}
                        />
                      </View>
                      <View
                        style={[
                          st.row,
                          {
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "nowrap",
                            zIndex:
                              dragging?.kind === "waste" ||
                              dragging?.kind === "foundations"
                                ? 200
                                : 1,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: "row", gap: 5 }}>
                          <Pressable
                            ref={idleRef("stock")}
                            collapsable={false}
                            accessibilityRole="button"
                            accessibilityLabel={tt(
                              s.game.stock.length ? "draw" : "recycle",
                            )}
                            onPress={() => applyGame(drawCards)}
                            style={[
                              st.cardBack,
                              st.card,
                              {
                                width: cardWidth,
                                height: cardHeight,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={{ color: "#f0dfb8", fontSize: 25 }}>
                              {s.game.stock.length ? "✦" : "↻"}
                            </Text>
                            <Text style={{ color: "#f0dfb8" }}>
                              {s.game.stock.length}
                            </Text>
                          </Pressable>
                          <View
                            collapsable={false}
                            ref={(node) => {
                              if (node)
                                dropTargets.current.waste = {
                                  node,
                                  place: { kind: "waste" },
                                };
                              else delete dropTargets.current.waste;
                            }}
                            style={{ width: cardWidth }}
                          >
                            {s.game.waste.at(-1) ? (
                              renderCard(s.game.waste.at(-1)!, {
                                kind: "waste",
                              })
                            ) : (
                              <View
                                style={[
                                  st.slot,
                                  { width: cardWidth, height: cardHeight },
                                ]}
                              />
                            )}
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: 5 }}>
                          {s.game.foundations.map((p, pile) =>
                            target(
                              { kind: "foundations", pile },
                              "f" + pile,
                              p.at(-1)
                                ? renderCard(p.at(-1)!, {
                                    kind: "foundations",
                                    pile,
                                  })
                                : null,
                            ),
                          )}
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          zIndex: dragging?.kind === "tableau" ? 200 : 2,
                          marginTop: boardLayout.gap,
                          height: tableauHeight,
                        }}
                      >
                        {s.game.tableau.map((p, pile) =>
                          target(
                            { kind: "tableau", pile },
                            "t" + pile,
                            <View
                              pointerEvents="box-none"
                              style={{ height: tableauHeight }}
                            >
                              {boardLayout.columns[pile].visibleIndices.map(
                                (index) =>
                                  renderCard(
                                    p[index],
                                    { kind: "tableau", pile, index },
                                    true,
                                  ),
                              )}
                              {boardLayout.columns[pile].hiddenIndices.length >
                                0 && (
                                <Pressable
                                  ref={idleRef("stack:" + pile)}
                                  collapsable={false}
                                  testID={`stack-picker-${pile}`}
                                  accessibilityRole="button"
                                  accessibilityLabel={tt("showStack", {
                                    count:
                                      boardLayout.columns[pile].hiddenIndices
                                        .length,
                                  })}
                                  onPress={() => setStackPile(pile)}
                                  hitSlop={5}
                                  style={[
                                    {
                                      position: "absolute",
                                      right: 1,
                                      top:
                                        boardLayout.columns[pile].offsets[
                                          p.findIndex((c) => c.up)
                                        ] + 1,
                                      minWidth: 18,
                                      height: Math.min(
                                        18,
                                        boardLayout.columns[pile].offsets[
                                          p.length - 1
                                        ] -
                                          boardLayout.columns[pile].offsets[
                                            p.findIndex((c) => c.up)
                                          ] -
                                          1,
                                      ),
                                      borderRadius: 4,
                                      backgroundColor: "#d9c48a",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      zIndex: 5,
                                    },
                                    selected?.kind === "tableau" &&
                                      selected.pile === pile &&
                                      st.selected,
                                  ]}
                                >
                                  <Text
                                    allowFontScaling={false}
                                    style={{
                                      fontSize: 8,
                                      color: "#284d3c",
                                      fontWeight: "700",
                                    }}
                                  >
                                    +
                                    {
                                      boardLayout.columns[pile].hiddenIndices
                                        .length
                                    }
                                  </Text>
                                </Pressable>
                              )}
                            </View>,
                          ),
                        )}
                      </View>
                    </View>
                  </View>
                </View>
                <GameToolbar
                  onNew={() => {
                    setPendingChallenge(null);
                    setDialog("new");
                  }}
                  onUndo={() => {
                    if (!s.game.history.length) {
                      setTip(tt("noUndoMoves"));
                    } else if (s.miniProgress.undo === 0) {
                      setUndoHelp(true);
                    } else {
                      update((v) =>
                        v.game.history.length && v.miniProgress.undo > 0
                          ? {
                              ...v,
                              game: undo(v.game),
                              miniProgress: {
                                ...v.miniProgress,
                                undo: v.miniProgress.undo - 1,
                              },
                            }
                          : v,
                      );
                    }
                  }}
                  onHint={() => {
                    const h = hints(s.game)[0];
                    setHint(h ?? null);
                    setSelected(h?.from ?? null);
                    setMessage(
                      h
                        ? tt("hintText", {
                            card: cardName(cardsAt(s.game, h.from)[0]),
                            destination: tt(
                              h.to.kind === "foundations"
                                ? "foundation"
                                : "tableau",
                              {
                                number:
                                  h.to.kind === "waste" ? 0 : h.to.pile + 1,
                              },
                            ),
                          })
                        : tt("noHint"),
                    );
                  }}
                  onAuto={() => {
                    // Preview without changing player progress. A board with
                    // all cards exposed is not necessarily auto-finishable.
                    const completed = autoComplete(s.game);
                    if (completed === s.game || !completed.won) {
                      setTip(tt("autoNotReady"));
                      return;
                    }
                    applyGame(autoComplete);
                  }}
                  undo={s.miniProgress.undo}
                  canUndo={true}
                  canAuto={
                    !s.game.won &&
                    s.game.tableau.every((p) => p.every((c) => c.up)) &&
                    !s.game.stock.length &&
                    !s.game.waste.length
                  }
                />
              </View>
            )}
            {screen === "mini" && (
              <>
                {!activeMini ? (
                  <MiniGameHub
                    slots={s.miniProgress.slots}
                    onStart={openMini}
                    onResume={() => setMiniHub(false)}
                    saved={mini}
                  />
                ) : (
                  <View style={st.playLayout} testID="mini-play-layout">
                    <ScrollView
                      testID="mini-controls"
                      style={[st.playRail, { width: 56 }]}
                      contentContainerStyle={st.railContent}
                    >
                      {iconButton("hint", tt("help"), () => setMiniHelp(true))}
                      {activeMini === "match" &&
                        iconButton(
                          "auto",
                          tt("shuffle"),
                          () =>
                            setMatch((g) => ({
                              ...matchForLevel(miniLevel),
                              score: g.score,
                              turns: g.turns,
                            })),
                          miniDone || match.turns === 0 || matchBusy,
                        )}
                      {iconButton("close", tt("back"), () => {
                        setMatchBusy(false);
                        go("garden");
                      })}
                      {iconButton(
                        "close",
                        tt("finishMini"),
                        () => {
                          update((v) => ({
                            ...v,
                            miniProgress: finishMini(v.miniProgress, miniId),
                          }));
                          setMini(null);
                          go("garden");
                        },
                        !miniDone && miniMoves > 0,
                      )}
                    </ScrollView>
                    <View
                      style={{ flex: 1, minWidth: 0, minHeight: 0, gap: 4 }}
                    >
                      <View
                        testID="mini-status"
                        style={{
                          minHeight: 36,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: "#fff8e9f5",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Text
                          style={[st.label, { flexShrink: 1 }]}
                          numberOfLines={1}
                        >
                          {tt(activeMini)}
                        </Text>
                        <Text
                          accessibilityLiveRegion="polite"
                          style={[st.small, { flex: 1 }]}
                        >
                          {miniDone
                            ? tt("miniWon")
                            : activeMini === "match"
                              ? match.turns === 0
                                ? tt("miniLost")
                                : !hasMatchMove(match.cells)
                                  ? tt("matchNoMoves")
                                  : tt("matchProgress", {
                                      score: match.score,
                                      target: match.target,
                                      turns: match.turns,
                                    })
                              : activeMini === "hidden"
                                ? tt("hiddenProgress", { count: found.length })
                                : tt("teaGoal")}
                        </Text>
                      </View>
                      {
                        <View style={{ paddingHorizontal: 10 }}>
                          <GameRewardLine kind={activeMini} level={miniLevel} />
                        </View>
                      }
                      <MiniPlayArea
                        onLayout={(event) => {
                          const { width, height } = event.nativeEvent.layout;
                          setMiniBounds((old) =>
                            old.width === width && old.height === height
                              ? old
                              : { width, height },
                          );
                        }}
                      >
                        {activeMini === "match" && (
                          <>
                            <GardenMatch
                              game={match}
                              size={Math.min(
                                336,
                                (miniBounds.width || width - 88) - 16,
                                (miniBounds.height ||
                                  height - insets.top - insets.bottom - 126) -
                                  16,
                              )}
                              disabled={miniDone || miniMoves === 0}
                              reducedMotion={s.preferences.reducedMotion}
                              onChange={(next) => {
                                if (miniMoves > 0) {
                                  spendMiniMove();
                                  setMatch(next);
                                }
                              }}
                              onBusyChange={setMatchBusy}
                              idleGuide={idleSettings}
                            />
                          </>
                        )}
                        {activeMini === "hidden" && (
                          <>
                            {gardenScene(true)}
                            <View
                              testID="treasure-checklist"
                              style={{
                                flexDirection: "row",
                                gap: 4,
                                alignSelf: "stretch",
                                height: 44,
                                backgroundColor: "#fff8e9f5",
                                borderRadius: 12,
                              }}
                            >
                              {treasures.map((o, i) => (
                                <View
                                  key={o.id}
                                  accessible
                                  accessibilityLabel={
                                    tt(o.id) +
                                    (found.includes(o.id)
                                      ? " · " + tt("found")
                                      : "")
                                  }
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    opacity: found.includes(o.id) ? 0.5 : 1,
                                  }}
                                >
                                  <MiniArtwork
                                    kind="treasure"
                                    value={i}
                                    size={24}
                                  />
                                  <Text style={st.small}>
                                    {found.includes(o.id) ? "✓" : ""}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </>
                        )}
                        {activeMini === "tea" && (
                          <TeaTime
                            key={miniId}
                            game={tea}
                            disabled={miniDone || miniMoves === 0}
                            onChange={(next) => {
                              if (miniMoves > 0) {
                                spendMiniMove();
                                setTea(next);
                              }
                            }}
                            idleGuide={idleSettings}
                          />
                        )}
                      </MiniPlayArea>
                    </View>
                  </View>
                )}
              </>
            )}
            {screen === "quests" && (
              <QuestJournal
                key={questRequest}
                save={s}
                focusQuest={questFocus}
                onUpdate={act}
                onToast={setTip}
                onAction={(objective: QuestObjective) => {
                  if (objective.type === "upgrade") {
                    setDecorationFocus(
                      upgrades.findIndex((u) => u.id === objective.item),
                    );
                    go("decorations");
                    setTip(tt("questUnlockItem", { item: tt(objective.item) }));
                  } else if (objective.type === "solitaire") {
                    go("play");
                  } else if (objective.type === "gather") {
                    earnMaterials();
                    setTip(tt("gatherHint"));
                  } else {
                    go("garden");
                    setTip(tt("questChooseGame", { game: tt(objective.type) }));
                  }
                }}
              />
            )}
            {screen === "collection" && (
              <GardenCollection
                save={s}
                language={language}
                onPlay={(kind) => {
                  if (kind === "hidden" || kind === "tea") {
                    go("garden");
                    setTip(tt("miniProgressInfo"));
                  } else go("decorations");
                }}
              />
            )}
            {screen === "inventory" && (
              <InventoryPanel save={s} onInfo={setTip} />
            )}
            {screen === "statistics" && (
              <ScreenPager
                id="statistics"
                title={tt("statsTitle")}
                items={[
                  ...(
                    [
                      ["wins", s.counters.solitaire, "play"],
                      ["played", s.attempts, "play"],
                      [
                        "miniWins",
                        s.counters.match + s.counters.hidden + s.counters.tea,
                        "mini",
                      ],
                      ["questsDone", s.completed.length, "quests"],
                    ] as const
                  ).map(([key, value, icon]) => (
                    <CozyPressable
                      key={key}
                      style={st.fittedTile}
                      accessibilityRole="button"
                      accessibilityLabel={
                        tt(key) + ": " + number(value, language)
                      }
                      onPress={() =>
                        setTip(tt(key) + ": " + number(value, language))
                      }
                    >
                      <GameIcon name={icon} size={38} />
                      <View style={{ flex: 1 }}>
                        <Text style={st.resourceAmount}>
                          {number(value, language)}
                        </Text>
                        <Text style={st.fittedName} numberOfLines={2}>
                          {tt(key)}
                        </Text>
                      </View>
                    </CozyPressable>
                  )),
                  <CozyPressable
                    key="achievement"
                    style={st.fittedTile}
                    accessibilityRole="button"
                    accessibilityLabel={tt("achievement")}
                    onPress={() => setMessage(tt("achievementText"))}
                  >
                    <GameIcon name="challenge" size={38} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.fittedName} numberOfLines={2}>
                        {tt("achievement")}
                      </Text>
                      <Text style={st.small}>
                        {tt(
                          s.economy.receipts.includes("achievement:explorer")
                            ? "earned"
                            : "notYet",
                        )}
                      </Text>
                    </View>
                  </CozyPressable>,
                ]}
              />
            )}
            {screen === "settings" && (
              <View style={{ flex: 1, minHeight: 0, padding: 8, gap: 8 }}>
                <View style={{ gap: 8, flexShrink: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Image
                      source={cozyRedesignImages.ui_flower_corner_blue_webp}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                      accessible={false}
                    />
                  <Text
                    accessibilityRole="header"
                    style={[
                      st.sectionTitle,
                      {
                        color: cozy.color.cream,
                        textShadowColor: cozy.color.woodDark,
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      },
                    ]}
                  >
                    {tt("settings")}
                  </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    {(["profile", "appearance", "audio", "rules"] as const).map(
                      (tab) => (
                        <CozyButton
                          key={tab}
                          compact
                          quiet
                          role="tab"
                          label={tt(
                            tab === "appearance"
                              ? "appearanceShort"
                              : tab === "audio"
                                ? "audioShort"
                                : tab === "rules"
                                  ? "rulesShort"
                                  : "profileShort",
                          )}
                          accessibilityLabel={tt(
                            tab === "appearance"
                              ? "appearanceShortcut"
                              : tab === "audio"
                                ? "sound"
                                : tab === "rules"
                                  ? "drawSetting"
                                  : "profile",
                          )}
                          selected={settingsTab === tab}
                          onPress={() => setSettingsTab(tab)}
                          style={{ flex: 1, minWidth: 0 }}
                        />
                      ),
                    )}
                  </View>
                </View>
                <ScrollView
                  testID="settings-scroll"
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 8, gap: 8 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {settingsTab === "profile" && (
                    <View
                      style={{
                        flexDirection: width < 600 ? "column" : "row",
                        flexWrap: width < 600 ? "nowrap" : "wrap",
                        gap: 8,
                        alignItems: "stretch",
                      }}
                    >
                      <View
                        style={[
                          st.panel,
                          {
                            flex: width < 600 ? undefined : 1,
                            width: width < 600 ? "100%" : undefined,
                            minWidth: 180,
                            padding: 12,
                            gap: 8,
                          },
                        ]}
                      >
                        <Text style={st.label}>{tt("profile")}</Text>
                        <Text style={st.label}>{tt("chooseAvatar")}</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {AVATARS.map((avatar) => (
                            <CozyPressable
                              key={avatar}
                              testID={`avatar-option-${avatar}`}
                              accessibilityRole="button"
                              accessibilityLabel={`${tt("chooseAvatar")}: ${avatar}`}
                              accessibilityState={{
                                selected: s.profile?.avatar === avatar,
                              }}
                              onPress={() =>
                                update((v) => setAvatar(v, avatar))
                              }
                              style={[
                                st.iconButton,
                                { width: 44, height: 44 },
                                s.profile?.avatar === avatar && {
                                  borderColor: cozy.color.honey,
                                  borderWidth: 2,
                                },
                              ]}
                            >
                              <Text style={{ fontSize: 22 }}>{avatar}</Text>
                            </CozyPressable>
                          ))}
                        </View>

                        <TextInput
                          accessibilityLabel={tt("username")}
                          value={name}
                          onChangeText={setName}
                          maxLength={60}
                          style={[st.input, { padding: 8, minHeight: 44 }]}
                        />
                        <View style={st.row}>
                          {button(
                            tt("rename"),
                            () => {
                              update((v) => setProfile(v, name, uuid()));
                              notify("saved");
                            },
                            !validateUsername(name),
                          )}
                          {iconButton("statistics", tt("statistics"), () =>
                            go("statistics"),
                          )}
                        </View>
                        <Text style={st.small}>
                          {tt("created", {
                            date: date(s.profile.createdAt, language),
                          })}
                        </Text>
                      </View>
                      <View
                        style={[
                          st.panel,
                          {
                            flex: width < 600 ? undefined : 1,
                            width: width < 600 ? "100%" : undefined,
                            minWidth: 180,
                            padding: 12,
                            gap: 8,
                          },
                        ]}
                      >
                        <Text style={st.label}>{tt("language")}</Text>
                        {chooseLanguage()}
                        {button(
                          tt("privacyTitle"),
                          () => setMessage(tt("privacy")),
                          false,
                          true,
                        )}
                      </View>
                    </View>
                  )}
                  {settingsTab === "appearance" && (
                    <>
                      {button(
                        tt("appearanceShortcut"),
                        () => {
                          setAppearanceRequest((n) => n + 1);
                          go("world");
                        },
                        false,
                        true,
                      )}{" "}
                      <View style={st.panel}>
                        <Text style={st.sectionTitle}>{tt("season")}</Text>
                        <View style={st.row}>
                          {(
                            [
                              "auto",
                              "spring",
                              "summer",
                              "autumn",
                              "winter",
                            ] as const
                          ).map((x) => (
                            <React.Fragment key={x}>
                              {button(
                                tt(x === "auto" ? "automatic" : x),
                                () => pref("season", x),
                                false,
                                s.preferences.season !== x,
                              )}
                            </React.Fragment>
                          ))}
                        </View>
                        <Text style={st.label}>{tt("time")}</Text>
                        <View style={st.row}>
                          {(
                            [
                              "morning",
                              "afternoon",
                              "sunset",
                              "evening",
                            ] as const
                          ).map((x) => (
                            <React.Fragment key={x}>
                              {button(
                                tt(x),
                                () => pref("time", x),
                                false,
                                s.preferences.time !== x,
                              )}
                            </React.Fragment>
                          ))}
                        </View>
                        <Text style={st.label}>{tt("weather")}</Text>
                        <View style={st.row}>
                          {[0, 0.4, 1].map((x) => (
                            <React.Fragment key={x}>
                              {button(
                                number(x * 100, language) + "%",
                                () => pref("weather", x),
                                false,
                                s.preferences.weather !== x,
                              )}
                            </React.Fragment>
                          ))}
                        </View>
                        <Text style={st.label}>{tt("animationQuality")}</Text>
                        <View style={st.row}>
                          {(["low", "medium", "high"] as const).map(
                            (quality) => (
                              <React.Fragment key={quality}>
                                {button(
                                  tt(quality),
                                  () => pref("animationQuality", quality),
                                  false,
                                  s.preferences.animationQuality !== quality,
                                  tt("animationQuality") + ": " + tt(quality),
                                  s.preferences.animationQuality === quality,
                                )}
                              </React.Fragment>
                            ),
                          )}
                        </View>
                        {(["animations", "reducedMotion"] as const).map((x) => (
                          <View key={x} style={st.settingRow}>
                            <Text style={st.label}>{tt(x)}</Text>
                            {button(
                              tt(s.preferences[x] ? "on" : "off"),
                              () => pref(x, !s.preferences[x]),
                              false,
                              true,
                              tt(x) +
                                ": " +
                                tt(s.preferences[x] ? "on" : "off"),
                            )}
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                  {settingsTab === "audio" && (
                    <View style={st.panel}>
                      {(["sound", "music"] as const).map((key) => (
                        <View key={key} style={st.settingRow}>
                          <Text style={st.label}>{tt(key)}</Text>
                          {button(
                            tt(s.preferences[key] ? "on" : "off"),
                            () => pref(key, !s.preferences[key]),
                            false,
                            true,
                            tt(key) +
                              ": " +
                              tt(s.preferences[key] ? "on" : "off"),
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                  {settingsTab === "rules" && (
                    <>
                      {" "}
                      <View style={st.panel}>
                        <Text style={st.sectionTitle}>{tt("drawSetting")}</Text>
                        <View style={st.row}>
                          {button(
                            tt("drawOne"),
                            () => setNextDraw(1),
                            false,
                            nextDraw !== 1,
                          )}
                          {button(
                            tt("drawThree"),
                            () => setNextDraw(3),
                            false,
                            nextDraw !== 3,
                          )}
                        </View>
                      </View>
                      <Text style={st.rules}>{tt("solitaireRules")}</Text>
                    </>
                  )}
                </ScrollView>
              </View>
            )}
          </ScreenViewport>
        </View>
      </View>
      {!(screen === "garden" && gardenEditing) && (
        <View
          testID="main-tabs"
          style={[
            st.tabDock,
            screen === "garden"
              ? {
                  position: "absolute",
                  bottom: insets.bottom + 6,
                  left: insets.left + 6,
                  width: Math.min(520, width - insets.left - insets.right - 12),
                }
              : { maxWidth: 520, width: "96%", alignSelf: "center" },
          ]}
        >
          {(
            [
              { id: "garden", label: "⌂ " + tt("garden"), icon: "garden" },
              { id: "play", label: "♠ " + tt("play"), icon: "play" },
              { id: "mini", label: "✿ " + tt("mini"), icon: "match" },
              { id: "menu", label: tt("mainMenu"), icon: "menu" },
            ] as const
          ).map((item) => (
            <CozyButton
              key={item.id}
              label={height > width ? "" : item.id === "menu" ? tt("mainMenu") : tt(item.id)}
              icon={item.icon}
              accessibilityLabel={item.label}
              compact
              quiet
              selected={item.id === screen}
              style={{ flex: 1, minWidth: 0, paddingHorizontal: height > width ? 4 : 9 }}
              onPress={() => {
                if (item.id === "menu") setMenuOpen(true);
                else if (item.id === "mini") {
                  setMiniHub(true);
                  go("mini");
                } else {
                  if (item.id === "garden") setLocation("cottage");
                  go(item.id);
                }
              }}
            />
          ))}
        </View>
      )}
      {menuOpen && (
        <MainMenu
          visible={menuOpen}
          onClose={() => {
            setMenuOpen(false);
            setTouching(false);
          }}
          onNavigate={navigateMenu}
          forestUnlocked={areaOwned(s, "forest")}
        />
      )}
      <View
        testID="game-overlay-layer"
        pointerEvents="box-none"
        style={st.hudLayer}
      >
        {message && (
          <View
            testID="game-notice"
            accessibilityRole="alert"
            style={[st.notice, st.floatingNotice, { maxHeight: height * 0.55 }]}
          >
            <ScrollView nestedScrollEnabled contentContainerStyle={{ gap: 8 }}>
              <Text style={st.subtitle}>{message}</Text>
              {button(tt("close"), () => setMessage(""), false, true)}
            </ScrollView>
          </View>
        )}
        {tip && !message && (
          <Pressable
            testID="compact-tooltip"
            accessibilityRole="alert"
            onPress={() => setTip(null)}
            style={st.tooltip}
          >
            <Text style={st.subtitle}>{tip}</Text>
          </Pressable>
        )}
      </View>
      <Modal
        testID="game-dialog"
        transparent
        visible={
          !!(dialog || help || miniHelp || challengeOpen || stackPile !== null)
        }
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={() => {
          if (dialog) setDialog(null);
          else if (stackPile !== null) setStackPile(null);
          else {
            setHelp(false);
            setMiniHelp(false);
            setChallengeOpen(false);
          }
        }}
      >
        {!dialog && !help && !challengeOpen && stackPile !== null && (
          <View accessibilityViewIsModal style={[st.overlay, { padding: 8 }]}>
            <StackCardPicker
              cards={boardLayout.columns[stackPile].hiddenIndices.map(
                (index) => ({ index, card: s.game.tableau[stackPile][index] }),
              )}
              theme={s.world.theme}
              cardName={cardName}
              onClose={() => setStackPile(null)}
              onSelect={(index) => {
                const card = s.game.tableau[stackPile][index];
                setSelected({ kind: "tableau", pile: stackPile, index });
                setStackPile(null);
                setTip(cardName(card));
              }}
            />
          </View>
        )}
        {!dialog && (help || miniHelp || challengeOpen) && (
          <View accessibilityViewIsModal style={st.overlay}>
            <CozyPanel style={[st.modal, { height: "80%", maxHeight: "85%" }]}>
              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{ gap: 12, padding: 12 }}
              >
                {help || miniHelp ? (
                  <Text style={st.rules}>
                    {tt(
                      miniHelp && activeMini
                        ? ((activeMini + "Rules") as Key)
                        : "solitaireRules",
                    )}
                  </Text>
                ) : (
                  <View style={st.panel}>
                    <Text style={st.sectionTitle}>{tt("challengeTitle")}</Text>
                    <Text style={st.small}>{tt("challengeIntro")}</Text>
                    {challenges.map((c) => (
                      <View key={c.id} style={st.row}>
                        {button(
                          tt(("challenge_" + c.id) as Key),
                          () => {
                            setPendingChallenge(c.id);
                            setChallengeOpen(false);
                            setDialog("new");
                          },
                          false,
                          true,
                        )}
                        {s.world.challenges.includes(c.id) && (
                          <Text style={st.small}>
                            {tt("challengeCompleted")}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {button(
                  tt("close"),
                  () => {
                    setHelp(false);
                    setMiniHelp(false);
                    setChallengeOpen(false);
                  },
                  false,
                  true,
                )}
              </ScrollView>
            </CozyPanel>
          </View>
        )}
        {dialog && (
          <View accessibilityViewIsModal style={st.overlay}>
            <CozyPanel
              style={[
                st.modal,
                {
                  height: Math.min(
                    height - insets.top - insets.bottom - 32,
                    Math.max(160, dealContentHeight + 34),
                  ),
                  maxHeight: "94%",
                },
              ]}
            >
              <ScrollView
                testID="deal-dialog-scroll"
                onContentSizeChange={(_, h) =>
                  setDealContentHeight((previous) =>
                    previous === h ? previous : h,
                  )
                }
                contentContainerStyle={{ gap: 8 }}
              >
                <Text style={st.sectionTitle}>
                  {tt(
                    dialog === "new"
                      ? pendingChallenge
                        ? "challengeReplace"
                        : "confirmDeal"
                      : "confirmRestart",
                  )}
                </Text>
                {dialog === "new" && !pendingChallenge && (
                  <View>
                    {solitaireTypes.map((kind) => (
                      <React.Fragment key={kind.id}>
                        {button(
                          `${tt(kind.id)}${kind.id !== "klondike" && !s.miniProgress.keys.includes(kind.id) ? ` · ${tt("solitaireKeyAt", { count: kind.fireflies / 10 })}` : ""}`,
                          () => setNextSolitaire(kind.id),
                          kind.id !== "klondike" &&
                            !s.miniProgress.keys.includes(kind.id),
                          true,
                          undefined,
                          nextSolitaire === kind.id,
                        )}
                      </React.Fragment>
                    ))}
                    <Text style={st.small}>
                      {tt((nextSolitaire + "Rules") as Key)}
                    </Text>
                  </View>
                )}
                {dialog === "new" &&
                  !pendingChallenge &&
                  nextSolitaire === "klondike" && (
                    <View style={st.row}>
                      {button(
                        tt("randomDeal"),
                        () => setGuaranteedDeal(false),
                        false,
                        guaranteedDeal,
                        undefined,
                        !guaranteedDeal,
                      )}
                      {button(
                        tt("winnableDeal"),
                        () => setGuaranteedDeal(true),
                        false,
                        !guaranteedDeal,
                        undefined,
                        guaranteedDeal,
                      )}
                    </View>
                  )}
                {dialog === "new" && !pendingChallenge && (
                  <View style={st.row}>
                    {button(
                      tt("drawOne"),
                      () => setNextDraw(1),
                      false,
                      nextDraw !== 1,
                    )}
                    {button(
                      tt("drawThree"),
                      () => setNextDraw(3),
                      false,
                      nextDraw !== 3,
                    )}
                  </View>
                )}
                {dealError && (
                  <Text
                    testID="deal-error"
                    accessibilityRole="alert"
                    style={st.rules}
                  >
                    {tt(dealError)}
                  </Text>
                )}
                <View style={st.row}>
                  {button(tt("cancel"), () => setDialog(null), false, true)}
                  {button(tt("confirm"), () => {
                    if (dialog === "new") {
                      if (
                        guaranteedDeal &&
                        nextSolitaire === "klondike" &&
                        !pendingChallenge &&
                        s.miniProgress.deals <= 0 &&
                        !s.game.won
                      ) {
                        setDealError("needDealReward");
                        return;
                      }
                      if (
                        nextSolitaire !== "klondike" &&
                        !s.miniProgress.keys.includes(nextSolitaire)
                      ) {
                        setDealError("needFireflies");
                        return;
                      }
                      if (pendingChallenge && s.miniProgress.fireflies < 30) {
                        setDealError("needFireflies");
                        return;
                      }
                      update((v) => ({
                        ...v,
                        game: pendingChallenge
                          ? challengeGame(uuid(), pendingChallenge)
                          : nextSolitaire !== "klondike"
                            ? newSolitaire(uuid(), nextSolitaire, nextDraw)
                            : guaranteedDeal
                              ? winnableGame(uuid(), nextDraw, v.attempts - 1)
                              : newGame(uuid(), nextDraw),
                        miniProgress: {
                          ...v.miniProgress,
                          deals:
                            v.game.won ||
                            nextSolitaire !== "klondike" ||
                            !guaranteedDeal ||
                            pendingChallenge
                              ? v.miniProgress.deals
                              : Math.max(0, v.miniProgress.deals - 1),
                        },
                        attempts: v.attempts + 1,
                      }));
                    } else applyGame(restart);
                    setDialog(null);
                    setSelected(null);
                  })}
                </View>
              </ScrollView>
            </CozyPanel>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
function MiniPlayArea({
  onLayout,
  children,
}: {
  onLayout: (event: LayoutChangeEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <View
      testID="mini-play-area"
      onLayout={onLayout}
      style={{ flex: 1, minHeight: 0, minWidth: 0 }}
    >
      <View
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          gap: 6,
        }}
      >
        {children}
      </View>
    </View>
  );
}
/** Bound game scroll areas to the viewport; never nest them inside a disabled ScrollView. */
function ScreenViewport({
  fixed,
  children,
}: {
  fixed: boolean;
  children: React.ReactNode;
}) {
  if (fixed)
    return (
      <View testID="game-viewport" style={{ flex: 1, minHeight: 0 }}>
        {children}
      </View>
    );
  return (
    <ScrollView
      testID="screen-scroll"
      style={{ flex: 1, minHeight: 0 }}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[st.content, st.menuSheet]}
    >
      {children}
    </ScrollView>
  );
}
function Draggable({
  children,
  label,
  testID,
  enabled,
  onTap,
  onDrop,
  onDragStart,
  onDragEnd,
  tail,
  style,
}: {
  children: React.ReactNode;
  label: string;
  testID: string;
  enabled: boolean;
  onTap: () => void;
  onDrop: (x: number, y: number, dx: number, dy: number) => Promise<void>;
  onDragStart: () => void;
  onDragEnd: () => void;
  tail: React.ReactNode;
  style: object;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [lifted, setLifted] = useState(false);
  const callbacks = useRef({ onDrop, enabled, onDragStart, onDragEnd });
  callbacks.current = { onDrop, enabled, onDragStart, onDragEnd };
  const activeGesture = useRef(callbacks.current);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        callbacks.current.enabled && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
      onPanResponderGrant: () => {
        activeGesture.current = callbacks.current;
        setLifted(true);
        callbacks.current.onDragStart();
      },
      onPanResponderTerminationRequest: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        callbacks.current.enabled && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (event, g) => {
        const x = Number.isFinite(event.nativeEvent.pageX)
          ? event.nativeEvent.pageX
          : g.moveX;
        const y = Number.isFinite(event.nativeEvent.pageY)
          ? event.nativeEvent.pageY
          : g.moveY;
        void activeGesture.current
          .onDrop(
            x,
            y,
            Number.isFinite(g.x0) ? x - g.x0 : g.dx,
            Number.isFinite(g.y0) ? y - g.y0 : g.dy,
          )
          .finally(() => {
            requestAnimationFrame(() => {
              position.setValue({ x: 0, y: 0 });
              setLifted(false);
              callbacks.current.onDragEnd();
            });
          });
      },
      onPanResponderTerminate: () => {
        position.setValue({ x: 0, y: 0 });
        setLifted(false);
        callbacks.current.onDragEnd();
      },
    }),
  ).current;
  return (
    <Animated.View
      testID={testID}
      {...pan.panHandlers}
      style={[
        style,
        {
          zIndex: lifted ? 1000 : undefined,
          elevation: lifted ? 12 : 0,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onTap}
        disabled={!enabled}
      >
        {children}
      </Pressable>
      {lifted && tail}
    </Animated.View>
  );
}
