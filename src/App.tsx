import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Platform,
  AccessibilityInfo,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { randomUUID } from "expo-crypto";
import { useTranslation } from "react-i18next";
import i18n, { type Key, number, date } from "./i18n";
import {
  newGame,
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
  setProfile,
  setLanguage,
  saveQueue,
  SAVE_KEY,
  deviceLanguage,
  reward,
  validateUsername,
  type Save,
} from "./engine/save";
import {
  upgrades,
  quests,
  questProgress,
  claimQuest,
  transact,
  place,
  seasonAt,
  type UpgradeId,
  type Season,
} from "./engine/world";
import {
  newMatch,
  swapMatch,
  newTea,
  pour,
  teaWon,
  treasures,
  hiddenWon,
} from "./engine/minigames";
import { Cottage, NPC_ICON, Portrait, Forest } from "./Art";
import { Weather } from "./Weather";
import { Audio } from "./Audio";
import { symbols } from "./assets";
import { cozyImages } from "./assets/images";

type Screen =
  | "garden"
  | "play"
  | "mini"
  | "quests"
  | "inventory"
  | "decorations"
  | "statistics"
  | "settings";
const nav: { id: Screen; icon: string }[] = [
  { id: "garden", icon: "⌂" },
  { id: "play", icon: "♠" },
  { id: "mini", icon: "✿" },
  { id: "quests", icon: "☷" },
  { id: "inventory", icon: "▧" },
  { id: "decorations", icon: "❀" },
  { id: "statistics", icon: "↗" },
  { id: "settings", icon: "⚙" },
];
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
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [s, setS] = useState<Save | null>(null),
    [loadError, setLoadError] = useState(false),
    [writeError, setWriteError] = useState(false),
    [screen, setScreen] = useState<Screen>("garden");
  const [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [dialog, setDialog] = useState<"new" | "restart" | null>(null),
    [help, setHelp] = useState(false),
    [npc, setNpc] = useState<"millie" | "marmalade" | "pip" | null>(null),
    [placing, setPlacing] = useState<UpgradeId | null>(null),
    [nextDraw, setNextDraw] = useState<1 | 3>(1);
  const [location, setLocation] = useState<"cottage" | "forest">("cottage");
  const [sceneSize, setSceneSize] = useState({ width: 700, height: 410 });
  const [selected, setSelected] = useState<Place | null>(null),
    [hint, setHint] = useState<ReturnType<typeof hints>[number] | null>(null);
  const [mini, setMini] = useState<"match" | "hidden" | "tea" | null>(null),
    [miniId, setMiniId] = useState(uuid),
    [match, setMatch] = useState(newMatch),
    [matchSelected, setMatchSelected] = useState<number | null>(null),
    [tea, setTea] = useState(newTea),
    [teaSelected, setTeaSelected] = useState<number | null>(null),
    [found, setFound] = useState<string[]>([]);
  const dropTargets = useRef<Record<string, { node: View; place: Place }>>({});
  const update = useCallback(
    (fn: (v: Save) => Save) => setS((v) => (v ? fn(v) : v)),
    [],
  );
  const load = useCallback(async () => {
    try {
      const [raw, reduced] = await Promise.all([
        AsyncStorage.getItem(SAVE_KEY),
        AccessibilityInfo.isReduceMotionEnabled(),
      ]);
      const data = migrate(
        raw,
        uuid(),
        deviceLanguage(getLocales()[0]?.languageCode ?? "en"),
      );
      if (reduced) data.preferences.reducedMotion = true;
      await i18n.changeLanguage(data.preferences.language);
      if (data.profile) data.profile.lastPlayedAt = new Date().toISOString();
      setS(data);
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
    if (s)
      void write(s)
        .then(() => setWriteError(false))
        .catch(() => setWriteError(true));
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
    if (mini && miniDone) update((v) => reward(v, mini, miniId));
  }, [mini, miniDone, miniId, update]);
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
  const button = (
    label: string,
    onPress: () => void,
    disabled = false,
    quiet = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        st.button,
        quiet && st.quiet,
        disabled && st.disabled,
        pressed && { opacity: 0.65 },
      ]}
    >
      <Text style={[st.buttonText, quiet && { color: "#345b49" }]}>
        {label}
      </Text>
    </Pressable>
  );
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
  const language = s.preferences.language;
  const go = (id: Screen) => {
    setScreen(id);
    setMessage("");
    setHelp(false);
    setNpc(null);
    setPlacing(null);
    setSelected(null);
    setHint(null);
  };
  const pref = <K extends keyof Save["preferences"]>(
    key: K,
    value: Save["preferences"][K],
  ) =>
    update((v) => ({ ...v, preferences: { ...v.preferences, [key]: value } }));
  const applyGame = (fn: (g: Game) => Game) => {
    update((v) => ({ ...v, game: fn(v.game) }));
    setSelected(null);
    setHint(null);
  };
  function tap(place: Place) {
    if (selected) {
      const next = move(s!.game, selected, place);
      if (next !== s!.game) {
        applyGame(() => next);
        return;
      }
    }
    const c = cardsAt(s!.game, place);
    setSelected(c[0]?.up ? place : null);
  }
  function drop(from: Place, x: number, y: number) {
    for (const target of Object.values(dropTargets.current))
      target.node.measureInWindow((tx, ty, w, h) => {
        if (x >= tx && x <= tx + w && y >= ty && y <= ty + h)
          applyGame((g) => move(g, from, target.place));
      });
  }
  const cardWidth = Math.min(
    88,
    Math.floor((Math.min(width - (wide ? 302 : 32), 1036) - 24) / 7),
  );
  const cardHeight = cardWidth * 1.44;
  const isSelected = (p: Place) =>
    selected?.kind === p.kind &&
    (p.kind === "waste" ||
      (selected?.kind !== "waste" &&
        selected?.pile === p.pile &&
        selected?.index === p.index));
  const renderCard = (c: Card, p: Place, overlap = false) => (
    <Draggable
      key={c.id}
      enabled={c.up}
      onTap={() => tap(p)}
      onDrop={(x, y) => drop(p, x, y)}
      label={c.up ? cardName(c) : tt("faceDown")}
      style={{
        width: cardWidth,
        height: cardHeight,
        marginBottom: overlap
          ? -(cardHeight - Math.max(19, cardWidth * 0.38))
          : 0,
        zIndex: 1,
      }}
    >
      <View
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
        {c.up ? (
          <>
            <Text
              style={{
                color: red(c) ? "#a34f50" : "#294e43",
                fontSize: Math.max(13, cardWidth * 0.23),
                fontWeight: "700",
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
            <Text
              style={{
                color: red(c) ? "#a34f50" : "#294e43",
                fontSize: cardWidth * 0.42,
                alignSelf: "center",
              }}
            >
              {c.suit}
            </Text>
          </>
        ) : (
          <Text
            style={{
              color: "#e3d6a9",
              fontSize: cardWidth * 0.4,
              alignSelf: "center",
              marginTop: cardWidth * 0.3,
            }}
          >
            {s.economy.inventory.includes("cards") ? "✿" : "✦"}
          </Text>
        )}
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
      onLayout={() => {}}
      style={{ width: cardWidth, minHeight: cardHeight }}
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
      style={[st.scene, { height: wide ? 410 : 300 }]}
      onLayout={(e) => setSceneSize(e.nativeEvent.layout)}
      onStartShouldSetResponder={() => !!placing}
      onResponderRelease={(e) => {
        if (!placing) return;
        const { locationX, locationY } = e.nativeEvent;
        act((v) => ({
          ...v,
          placements: place(v.economy.inventory, v.placements, {
            id: placing,
            x: Math.max(5, Math.min(95, (locationX / sceneSize.width) * 100)),
            y: Math.max(10, Math.min(90, (locationY / sceneSize.height) * 100)),
          }),
        }));
        setPlacing(null);
      }}
    >
      {location === "forest" ? (
        <Forest season={season} />
      ) : (
        <Image
          source={cozyImages.seasons[season]}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
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
      <Weather
        season={season}
        intensity={s.preferences.weather}
        reduced={s.preferences.reducedMotion}
      />
      {!hidden &&
        s.placements.map((p) => (
          <Text
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: 30,
            }}
          >
            {upgrades.find((u) => u.id === p.id)?.icon}
          </Text>
        ))}
      {hidden
        ? treasures
            .filter((o) => !found.includes(o.id))
            .map((o) => (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={tt(o.id)}
                onPress={() => setFound((f) => [...new Set([...f, o.id])])}
                style={{
                  position: "absolute",
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>{symbols.treasures[o.id]}</Text>
              </Pressable>
            ))
        : null}
      <View style={st.sceneLabel}>
        <Text style={st.sceneLabelText}>
          {tt(season)} · {tt(s.preferences.time)}
        </Text>
      </View>
    </View>
  );
  if (!s.profile)
    return (
      <SafeAreaView style={st.root}>
        <ScrollView
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
    <SafeAreaView style={st.root}>
      <Audio music={s.preferences.music} sound={s.preferences.sound} />
      <View style={[st.shell, wide && { flexDirection: "row" }]}>
        {wide && (
          <View style={st.sidebar}>
            <Text style={st.logo}>♧</Text>
            <Text style={st.brand}>Cozy{"\n"}Solitaire</Text>
            <Text style={st.sideSubtitle}>{tt("tagline")}</Text>
            <View style={{ height: 24 }} />
            {nav.map((n) => (
              <Pressable
                key={n.id}
                accessibilityRole="button"
                accessibilityState={{ selected: screen === n.id }}
                onPress={() => go(n.id)}
                style={[st.nav, screen === n.id && st.navActive]}
              >
                <Text
                  style={[st.navText, screen === n.id && { color: "#f6f2e8" }]}
                >
                  {n.icon} {tt(n.id)}
                </Text>
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <Text style={st.small}>{tt("offline")}</Text>
          </View>
        )}
        <View style={st.main}>
          <View style={st.topbar}>
            <Text numberOfLines={1} style={st.player}>
              ☀ {s.profile.username}
            </Text>
            <View style={st.currency}>
              <Text style={st.currencyText}>
                ✦ {number(s.economy.wallet.glimmers, language)} {tt("glimmers")}
              </Text>
            </View>
          </View>
          {!wide && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 60 }}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}
            >
              {nav.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => go(n.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: screen === n.id }}
                  style={[st.mobileNav, screen === n.id && st.navActive]}
                >
                  <Text style={{ color: screen === n.id ? "#fff" : "#345b49" }}>
                    {n.icon} {tt(n.id)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
          <ScrollView
            contentContainerStyle={[st.content, wide && { padding: 32 }]}
            keyboardShouldPersistTaps="handled"
          >
            {screen === "garden" && (
              <>
                {heading(
                  tt("gardenTitle"),
                  tt("welcome", { username: s.profile.username }),
                )}
                {gardenScene()}
                {s.economy.inventory.includes("forest") && (
                  <View style={st.row}>
                    {button(
                      tt("cottage"),
                      () => setLocation("cottage"),
                      false,
                      location !== "cottage",
                    )}
                    {button(
                      tt("exploreForest"),
                      () => setLocation("forest"),
                      false,
                      location !== "forest",
                    )}
                  </View>
                )}
                <View style={st.row}>
                  {button("♠  " + tt("play"), () => go("play"))}
                  {button("✿  " + tt("mini"), () => go("mini"), false, true)}
                </View>
                <Text style={st.sectionTitle}>{tt("gardenSub")}</Text>
                <View style={st.tiles}>
                  {(["millie", "marmalade", "pip"] as const).map((n) => (
                    <Pressable
                      key={n}
                      style={st.npc}
                      accessibilityRole="button"
                      onPress={() => setNpc(n)}
                    >
                      {n === "pip" ? (
                        <Portrait animal={n} />
                      ) : (
                        <Image
                          source={cozyImages.characters[n]}
                          style={{ width: 80, height: 100 }}
                          resizeMode="contain"
                          accessibilityIgnoresInvertColors
                        />
                      )}
                      <Text style={st.label}>{tt(n)}</Text>
                      <Text style={st.small}>
                        {tt((n + "Hello") as Key, {
                          username: s.profile!.username,
                        })}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {npc && (
                  <View style={st.panel}>
                    <Text style={st.label}>{tt(npc)}</Text>
                    <Text style={st.subtitle}>
                      {tt((npc + "Hello") as Key, {
                        username: s.profile.username,
                      })}
                    </Text>
                    {button(tt("quests"), () => go("quests"))}
                  </View>
                )}
                <View style={st.panel}>
                  <Text style={st.small}>{tt("gatherHint")}</Text>
                  <View style={st.row}>
                    {button(
                      tt("gather"),
                      () =>
                        act((v) => ({
                          ...v,
                          counters: {
                            ...v.counters,
                            gather: v.counters.gather + 1,
                          },
                          economy: transact(v.economy, "gather:" + uuid(), {
                            wood: 1,
                            stone: 1,
                          }),
                        })),
                      false,
                      true,
                    )}
                    {button(
                      tt(
                        s.economy.receipts.includes(
                          "daily:" + new Date().toLocaleDateString("en-CA"),
                        )
                          ? "dailyDone"
                          : "daily",
                      ),
                      () =>
                        act((v) => ({
                          ...v,
                          economy: transact(
                            v.economy,
                            "daily:" + new Date().toLocaleDateString("en-CA"),
                            { glimmers: 10 },
                          ),
                        })),
                      s.economy.receipts.includes(
                        "daily:" + new Date().toLocaleDateString("en-CA"),
                      ),
                      true,
                    )}
                  </View>
                </View>
              </>
            )}
            {screen === "play" && (
              <>
                {heading(tt("play"), tt("moves", { count: s.game.moves }))}
                <View style={st.row}>
                  {button(
                    tt("undo"),
                    () => applyGame(undo),
                    !s.game.history.length,
                    true,
                  )}
                  {button(
                    tt("hint"),
                    () => {
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
                    },
                    false,
                    true,
                  )}
                  {button(tt("help"), () => setHelp(!help), false, true)}
                </View>
                {help && <Text style={st.rules}>{tt("solitaireRules")}</Text>}
                <View style={st.board}>
                  <Image
                    source={
                      season === "winter"
                        ? cozyImages.boards.winterSnow
                        : season === "autumn"
                          ? cozyImages.boards.autumnRain
                          : season === "summer"
                            ? cozyImages.boards.summerEvening
                            : cozyImages.seasons.spring
                    }
                    resizeMode="cover"
                    style={[
                      StyleSheet.absoluteFill,
                      { opacity: 0.15, borderRadius: 16 },
                    ]}
                  />

                  <View
                    style={[
                      st.row,
                      {
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "nowrap",
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <Pressable
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
                      <View style={{ width: cardWidth }}>
                        {s.game.waste.at(-1) ? (
                          renderCard(s.game.waste.at(-1)!, { kind: "waste" })
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
                      marginTop: 22,
                      minHeight: cardHeight + 180,
                    }}
                  >
                    {s.game.tableau.map((p, pile) =>
                      target(
                        { kind: "tableau", pile },
                        "t" + pile,
                        <View
                          pointerEvents="box-none"
                          style={{ paddingBottom: cardHeight }}
                        >
                          {p.map((c, index) =>
                            renderCard(
                              c,
                              { kind: "tableau", pile, index },
                              true,
                            ),
                          )}
                        </View>,
                      ),
                    )}
                  </View>
                </View>
                {s.game.won && (
                  <View style={st.panel}>
                    <Text style={st.sectionTitle}>{tt("victory")}</Text>
                    <Text style={st.subtitle}>{tt("victoryText")}</Text>
                  </View>
                )}
                <View style={st.row}>
                  {button(
                    tt("auto"),
                    () => applyGame(autoComplete),
                    false,
                    true,
                  )}
                  {button(
                    tt("restart"),
                    () => setDialog("restart"),
                    false,
                    true,
                  )}
                  {button(tt("newGame"), () => setDialog("new"), false, true)}
                  {button(tt("saveContinue"), () => go("garden"), false, true)}
                </View>
              </>
            )}
            {screen === "mini" && (
              <>
                {heading(
                  tt(mini ?? "mini"),
                  mini ? tt((mini + "Rules") as Key) : tt("currencyHint"),
                )}
                {!mini ? (
                  <View style={st.tiles}>
                    {(["match", "hidden", "tea"] as const).map((m, i) => (
                      <View key={m} style={st.npc}>
                        <Text style={{ fontSize: 48 }}>
                          {["🌸", "🔍", "🫖"][i]}
                        </Text>
                        <Text style={st.sectionTitle}>{tt(m)}</Text>
                        <Text style={st.small}>{tt((m + "Rules") as Key)}</Text>
                        {button(tt("continue"), () => {
                          setMini(m);
                          setMiniId(uuid());
                          setMatch(newMatch());
                          setFound([]);
                          setTea(newTea());
                          setTeaSelected(null);
                          setMatchSelected(null);
                        })}
                      </View>
                    ))}
                  </View>
                ) : (
                  <>
                    {mini === "match" && (
                      <>
                        <Text style={st.label}>
                          {tt("matchProgress", {
                            score: match.score,
                            target: match.target,
                            turns: match.turns,
                          })}
                        </Text>
                        <View style={st.matchGrid}>
                          {match.cells.map((v, i) => (
                            <Pressable
                              key={i}
                              disabled={miniDone || match.turns === 0}
                              accessibilityRole="button"
                              accessibilityLabel={`${symbols.match[v]} ${Math.floor(i / 6) + 1}, ${(i % 6) + 1}`}
                              accessibilityState={{
                                selected: matchSelected === i,
                              }}
                              onPress={() => {
                                if (matchSelected === null) setMatchSelected(i);
                                else {
                                  setMatch(swapMatch(match, matchSelected, i));
                                  setMatchSelected(null);
                                }
                              }}
                              style={[
                                st.matchCell,
                                matchSelected === i && st.selected,
                              ]}
                            >
                              <Text style={{ fontSize: 28 }}>
                                {symbols.match[v]}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                        {button(
                          tt("shuffle"),
                          () =>
                            setMatch((g) => ({
                              ...newMatch(),
                              score: g.score,
                              turns: g.turns,
                            })),
                          miniDone || match.turns === 0,
                          true,
                        )}
                        {!miniDone && match.turns === 0 && (
                          <Text style={st.label}>{tt("miniLost")}</Text>
                        )}
                      </>
                    )}
                    {mini === "hidden" && (
                      <>
                        {gardenScene(true)}
                        <View style={st.row}>
                          {treasures.map((o) => (
                            <Text
                              key={o.id}
                              style={[
                                st.chip,
                                found.includes(o.id) && {
                                  textDecorationLine: "line-through",
                                  opacity: 0.45,
                                },
                              ]}
                            >
                              {symbols.treasures[o.id]} {tt(o.id)}{" "}
                              {found.includes(o.id) ? "✓" : ""}
                            </Text>
                          ))}
                        </View>
                      </>
                    )}
                    {mini === "tea" && (
                      <View style={st.tiles}>
                        {tea.map((tray, i) => (
                          <Pressable
                            key={i}
                            disabled={miniDone}
                            accessibilityRole="button"
                            accessibilityLabel={tt("tray", { number: i + 1 })}
                            accessibilityState={{ selected: teaSelected === i }}
                            onPress={() => {
                              if (teaSelected === null) setTeaSelected(i);
                              else {
                                setTea(pour(tea, teaSelected, i));
                                setTeaSelected(null);
                              }
                            }}
                            style={[st.tray, teaSelected === i && st.selected]}
                          >
                            {Array.from({ length: 3 }, (_, j) => (
                              <Text
                                key={j}
                                style={{ fontSize: 36, height: 50 }}
                              >
                                {tray[2 - j] === undefined
                                  ? "·"
                                  : symbols.tea[tray[2 - j]]}
                              </Text>
                            ))}
                          </Pressable>
                        ))}
                      </View>
                    )}
                    {miniDone && (
                      <Text style={st.sectionTitle}>{tt("miniWon")}</Text>
                    )}
                    <View style={st.row}>
                      {button(
                        tt("replay"),
                        () => {
                          setMiniId(uuid());
                          setMatch(newMatch());
                          setTea(newTea());
                          setFound([]);
                          setTeaSelected(null);
                          setMatchSelected(null);
                        },
                        false,
                        true,
                      )}
                      {button(tt("back"), () => setMini(null), false, true)}
                    </View>
                  </>
                )}
              </>
            )}
            {screen === "quests" && (
              <>
                {heading(
                  tt("quests"),
                  tt("gardenIntro", { username: s.profile.username }),
                )}
                {quests.map((q) => {
                  const p = questProgress(
                      q.id,
                      s.counters,
                      s.economy.inventory,
                    ),
                    done = s.completed.includes(q.id),
                    locked = !q.requires.every((id) =>
                      s.completed.includes(id),
                    );
                  return (
                    <View
                      key={q.id}
                      style={[st.panel, locked && { opacity: 0.6 }]}
                    >
                      <Text style={st.eyebrow}>
                        {NPC_ICON[q.npc]} {tt(q.npc)}
                      </Text>
                      <Text style={st.sectionTitle}>{tt(q.id as Key)}</Text>
                      <Text style={st.subtitle}>
                        {tt((q.id + "Text") as Key)}
                      </Text>
                      <Text style={st.small}>
                        {tt("progress", p)} ·{" "}
                        {tt("questReward", { amount: q.reward.glimmers })}
                      </Text>
                      {button(
                        tt(
                          done ? "complete" : locked ? "lockedQuest" : "claim",
                        ),
                        () =>
                          update((v) => {
                            const result = claimQuest(
                              v.economy,
                              v.completed,
                              q.id,
                              v.counters,
                            );
                            return { ...v, ...result };
                          }),
                        done || locked || p.done < p.total,
                        true,
                      )}
                    </View>
                  );
                })}
              </>
            )}
            {screen === "decorations" && (
              <>
                {heading(tt("decorations"), tt("currencyHint"))}
                {placing && (
                  <>
                    <Text style={st.label}>{tt("placing")}</Text>
                    {gardenScene()}
                  </>
                )}
                <View style={st.tiles}>
                  {upgrades.map((u) => {
                    const owned = s.economy.inventory.includes(u.id);
                    return (
                      <View key={u.id} style={st.npc}>
                        <Text style={{ fontSize: 48 }}>{u.icon}</Text>
                        <Text style={st.sectionTitle}>{tt(u.id)}</Text>
                        {owned ? (
                          <>
                            {button(tt("owned"), () => {}, true, true)}
                            {u.id !== "cards" &&
                              button(
                                tt("place"),
                                () => setPlacing(u.id),
                                false,
                                true,
                              )}
                          </>
                        ) : (
                          button(
                            tt("buy", { cost: u.cost, wood: u.wood }),
                            () =>
                              act((v) => {
                                const economy = transact(
                                  v.economy,
                                  "buy:" + u.id,
                                  { glimmers: -u.cost, wood: -u.wood },
                                  u.id,
                                );
                                return {
                                  ...v,
                                  economy,
                                  placements:
                                    u.id === "cards"
                                      ? v.placements
                                      : place(economy.inventory, v.placements, {
                                          id: u.id,
                                          x: u.x,
                                          y: u.y,
                                        }),
                                };
                              }),
                            false,
                            true,
                          )
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            {screen === "inventory" && (
              <>
                {heading(tt("inventory"), tt("emptyInventory"))}
                <View style={st.tiles}>
                  {(
                    Object.keys(
                      s.economy.wallet,
                    ) as (keyof typeof s.economy.wallet)[]
                  ).map((r, i) => (
                    <View key={r} style={st.npc}>
                      <Text style={{ fontSize: 40 }}>
                        {["✦", "🪵", "🪨", "🌸", "🌱"][i]}
                      </Text>
                      <Text style={st.sectionTitle}>
                        {number(s.economy.wallet[r], language)}
                      </Text>
                      <Text style={st.small}>
                        {tt(r === "flowers" ? "flowersResource" : r)}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={st.row}>
                  {s.economy.inventory.map((id) => (
                    <Text key={id} style={st.chip}>
                      {tt(id as Key)}
                    </Text>
                  ))}
                </View>
              </>
            )}
            {screen === "statistics" && (
              <>
                {heading(tt("statsTitle"))}
                <View style={st.tiles}>
                  {[
                    ["wins", s.counters.solitaire],
                    ["played", s.attempts],
                    [
                      "miniWins",
                      s.counters.match + s.counters.hidden + s.counters.tea,
                    ],
                    ["questsDone", s.completed.length],
                  ].map(([key, value]) => (
                    <View key={key} style={st.npc}>
                      <Text style={st.title}>
                        {number(Number(value), language)}
                      </Text>
                      <Text style={st.small}>{tt(key as Key)}</Text>
                    </View>
                  ))}
                </View>
                <View style={st.panel}>
                  <Text style={st.sectionTitle}>✦ {tt("achievement")}</Text>
                  <Text style={st.subtitle}>{tt("achievementText")}</Text>
                  <Text style={st.label}>
                    {tt(
                      s.economy.receipts.includes("achievement:explorer")
                        ? "earned"
                        : "notYet",
                    )}
                  </Text>
                </View>
              </>
            )}
            {screen === "settings" && (
              <>
                {heading(tt("settings"))}
                <View style={st.panel}>
                  <Text style={st.sectionTitle}>{tt("profile")}</Text>
                  <TextInput
                    accessibilityLabel={tt("username")}
                    value={name}
                    onChangeText={setName}
                    maxLength={60}
                    style={st.input}
                  />
                  {button(
                    tt("rename"),
                    () => {
                      update((v) => setProfile(v, name, uuid()));
                      notify("saved");
                    },
                    !validateUsername(name),
                  )}
                  <Text style={st.small}>
                    {tt("created", {
                      date: date(s.profile.createdAt, language),
                    })}
                  </Text>
                  {button(
                    tt("statistics"),
                    () => go("statistics"),
                    false,
                    true,
                  )}
                </View>
                <View style={st.panel}>
                  <Text style={st.sectionTitle}>{tt("language")}</Text>
                  {chooseLanguage()}
                </View>
                <View style={st.panel}>
                  <Text style={st.sectionTitle}>{tt("season")}</Text>
                  <View style={st.row}>
                    {(
                      ["auto", "spring", "summer", "autumn", "winter"] as const
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
                      ["morning", "afternoon", "sunset", "evening"] as const
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
                  {(["reducedMotion", "sound", "music"] as const).map((x) => (
                    <View key={x} style={st.settingRow}>
                      <Text style={st.label}>{tt(x)}</Text>
                      {button(
                        tt(s.preferences[x] ? "on" : "off"),
                        () => pref(x, !s.preferences[x]),
                        false,
                        true,
                      )}
                    </View>
                  ))}
                </View>
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
                <Text style={st.small}>{tt("privacy")}</Text>
              </>
            )}
            {message && (
              <View accessibilityRole="alert" style={st.notice}>
                <Text style={st.subtitle}>{message}</Text>
                {button(tt("close"), () => setMessage(""), false, true)}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      {dialog && (
        <View style={st.overlay}>
          <View style={st.modal}>
            <Text style={st.sectionTitle}>
              {tt(dialog === "new" ? "confirmDeal" : "confirmRestart")}
            </Text>
            <View style={st.row}>
              {button(tt("cancel"), () => setDialog(null), false, true)}
              {button(tt("confirm"), () => {
                if (dialog === "new")
                  update((v) => ({
                    ...v,
                    game: newGame(uuid(), nextDraw),
                    attempts: v.attempts + 1,
                  }));
                else applyGame(restart);
                setDialog(null);
                setSelected(null);
              })}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
function Draggable({
  children,
  label,
  enabled,
  onTap,
  onDrop,
  style,
}: {
  children: React.ReactNode;
  label: string;
  enabled: boolean;
  onTap: () => void;
  onDrop: (x: number, y: number) => void;
  style: object;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const callbacks = useRef({ onTap, onDrop, enabled });
  callbacks.current = { onTap, onDrop, enabled };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => callbacks.current.enabled,
      onMoveShouldSetPanResponder: (_, g) =>
        callbacks.current.enabled && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        position.setValue({ x: 0, y: 0 });
        if (Math.abs(g.dx) + Math.abs(g.dy) < 10) callbacks.current.onTap();
        else callbacks.current.onDrop(g.moveX, g.moveY);
      },
      onPanResponderTerminate: () => position.setValue({ x: 0, y: 0 }),
    }),
  ).current;
  return (
    <Animated.View
      {...pan.panHandlers}
      style={[
        style,
        {
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
    </Animated.View>
  );
}
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f6f2e8" },
  shell: { flex: 1 },
  sidebar: {
    width: 238,
    padding: 24,
    backgroundColor: "#eeeddf",
    borderRightWidth: 1,
    borderColor: "#dedfcd",
  },
  logo: { fontSize: 48, color: "#3f6850" },
  brand: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    lineHeight: 35,
    color: "#254b3a",
  },
  sideSubtitle: {
    fontSize: 12,
    color: "#778371",
    marginTop: 14,
    lineHeight: 19,
  },
  nav: { padding: 12, borderRadius: 10, marginBottom: 5 },
  navActive: { backgroundColor: "#345b49" },
  navText: { fontSize: 14, color: "#556850" },
  main: { flex: 1 },
  topbar: {
    height: 64,
    borderBottomWidth: 1,
    borderColor: "#e6e4d7",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  player: { fontSize: 14, color: "#67745b", flexShrink: 1 },
  currency: {
    borderWidth: 1,
    borderColor: "#ddd3ad",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f4ecd1",
  },
  currencyText: { color: "#7f6a34", fontWeight: "600", fontSize: 13 },
  content: {
    padding: 16,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    paddingBottom: 60,
    gap: 18,
  },
  heading: { gap: 9, marginBottom: 4 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#8a946e",
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 34,
    color: "#2c4e3b",
    lineHeight: 42,
  },
  subtitle: { fontSize: 15, lineHeight: 24, color: "#69745e" },
  sectionTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 23,
    lineHeight: 30,
    color: "#34553f",
  },
  small: { fontSize: 13, lineHeight: 21, color: "#77816b" },
  label: {
    fontWeight: "600",
    fontSize: 15,
    color: "#455f45",
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#345b49",
    justifyContent: "center",
  },
  quiet: { backgroundColor: "#eeeddf", borderWidth: 1, borderColor: "#d9dfce" },
  buttonText: { fontWeight: "600", fontSize: 13, color: "#fffbed" },
  disabled: { opacity: 0.42 },
  scene: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#c5d3b2",
    borderWidth: 1,
    borderColor: "#d8deca",
  },
  sceneLabel: {
    position: "absolute",
    left: 16,
    bottom: 14,
    backgroundColor: "#fffbedda",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },
  sceneLabelText: { color: "#596b50", fontSize: 11 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  npc: {
    flexGrow: 1,
    flexBasis: 200,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1dfd0",
    backgroundColor: "#fcfaf2",
    gap: 10,
  },
  panel: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fcfaf2",
    borderWidth: 1,
    borderColor: "#e1dfd0",
    gap: 12,
  },
  mobileNav: {
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
    minHeight: 44,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c7d1bb",
    backgroundColor: "#fffef8",
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    color: "#345b49",
    maxWidth: 420,
    minHeight: 48,
  },
  onboarding: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 28,
  },
  welcomeArt: {
    width: "100%",
    maxWidth: 550,
    height: 420,
    borderRadius: 180,
    overflow: "hidden",
    flexShrink: 1,
  },
  welcome: { maxWidth: 460, gap: 18, padding: 16 },
  board: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#567b63",
    minHeight: 400,
  },
  card: {
    borderRadius: 6,
    backgroundColor: "#fff9eb",
    borderWidth: 1,
    borderColor: "#d2cfb8",
    padding: 4,
    shadowColor: "#162e21",
    shadowOpacity: 0.16,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardBack: {
    backgroundColor: "#2f5548",
    borderColor: "#c0b17f",
    borderWidth: 2,
  },
  selected: { borderWidth: 3, borderColor: "#e8b85c" },
  slot: {
    borderWidth: 1,
    borderColor: "#9ab09b",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  slotText: { color: "#afc2aa", fontSize: 24 },
  rules: {
    fontSize: 14,
    lineHeight: 23,
    color: "#52664d",
    backgroundColor: "#eceede",
    padding: 16,
    borderRadius: 12,
  },
  notice: {
    padding: 16,
    backgroundColor: "#eee4c8",
    borderRadius: 12,
    gap: 10,
  },
  chip: {
    padding: 12,
    backgroundColor: "#e9eddd",
    borderRadius: 12,
    color: "#566b4c",
    fontSize: 14,
  },
  matchGrid: {
    width: 312,
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
  },
  matchCell: {
    width: "16.666%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#f6f2e8",
    backgroundColor: "#e4ead7",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tray: {
    width: 95,
    minHeight: 175,
    borderWidth: 2,
    borderColor: "#c2cdb4",
    borderRadius: 18,
    backgroundColor: "#efdfc8",
    alignItems: "center",
    padding: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1b342a88",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#faf7ec",
    borderRadius: 20,
    padding: 28,
    maxWidth: 440,
    gap: 24,
  },
});
