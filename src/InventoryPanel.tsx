import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import { resourceGains, type ResourceGain } from "./engine/world";
import { number } from "./i18n";
import { DecorationArtwork } from "./GardenDecorations";
import { decorationImages, type DecorationId } from "./assets/decorations";
import { GameIcon } from "./GameIcon";
export function InventoryPanel({
  save,
  onInfo,
}: {
  save: Save;
  onInfo: (text: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<"materials" | "owned">("materials"),
    [page, setPage] = useState(0),
    [recentPage, setRecentPage] = useState(0),
    [height, setHeight] = useState(220);
  const owned = [...new Set(save.economy.inventory)],
    pages = Math.max(1, Math.ceil(owned.length / 4)),
    gains = resourceGains(save.economy.gains);
  const compact = height < 200,
    rows = Math.max(
      1,
      Math.min(
        3,
        Math.floor((height - (compact ? 136 : 158)) / (compact ? 32 : 34)),
      ),
    ),
    recentPages = Math.max(1, Math.ceil(gains.length / rows)),
    shownPage = Math.min(recentPage, recentPages - 1);
  useEffect(() => setRecentPage(0), [gains[0]?.id]);
  const resource = (key: string) =>
    String(t(key === "flowers" ? "flowersResource" : key));
  const icon = (key: string) =>
    key === "glimmers" ? "glimmer" : key === "flowers" ? "decorations" : key;
  const source = (gain: ResourceGain) => {
    const [kind, id] = gain.id.split(":");
    if ((kind === "quest" || kind === "story") && id && i18n.exists(id))
      return String(t(id)).split(" · ").at(-1)!;
    const keys: Record<string, string> = {
      gather: "gather",
      solitaire: "play",
      hidden: "hidden",
      match: "match",
      tea: "tea",
      daily: "daily",
      festival: "festivals",
      achievement: "statistics",
    };
    return String(t(keys[kind] ?? "receivedMaterials"));
  };
  const gainText = (gain: ResourceGain) =>
    Object.entries(gain.amounts)
      .map(
        ([key, value]) => `+${number(value!, i18n.language)} ${resource(key)}`,
      )
      .join(" · ");
  const arrow = (back: boolean, disabled: boolean, action: () => void) => (
    <CozyPressable
      accessibilityRole="button"
      accessibilityLabel={String(t(back ? "previousPage" : "nextPage"))}
      onPress={action}
      disabled={disabled}
      hitSlop={6}
      style={[s.arrowButton, disabled && { opacity: 0.3 }]}
    >
      <Text style={s.arrow}>{back ? "‹" : "›"}</Text>
    </CozyPressable>
  );
  return (
    <View
      testID="inventory-panel"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={s.root}
    >
      <View style={[s.header, { height: 52 }]}>
        <Text accessibilityRole="header" numberOfLines={1} style={s.title}>
          {String(t("inventory"))}
        </Text>
        {(["materials", "owned"] as const).map((id) => (
          <CozyPressable
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={String(t(id))}
            accessibilityState={{ selected: tab === id }}
            onPress={() => setTab(id)}
            hitSlop={5}
            style={[s.tab, tab === id && s.selected]}
          >
            <Text style={[s.tabText, tab === id && { color: cozy.color.ink }]}>
              {String(t(id))}
            </Text>
          </CozyPressable>
        ))}
      </View>
      {tab === "materials" ? (
        <>
          <View testID="compact-inventory" style={s.resources}>
            {Object.entries(save.economy.wallet).map(([key, value]) => (
              <CozyPressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={
                  resource(key) + ": " + number(value, i18n.language)
                }
                onPress={() =>
                  onInfo(resource(key) + ": " + number(value, i18n.language))
                }
                style={[s.resource, { height: compact ? 56 : 64 }]}
              >
                <GameIcon name={icon(key)} size={compact ? 22 : 26} />
                <Text numberOfLines={1} adjustsFontSizeToFit style={s.amount}>
                  {number(value, i18n.language)}
                </Text>
                <Text numberOfLines={1} adjustsFontSizeToFit style={s.label}>
                  {resource(key)}
                </Text>
              </CozyPressable>
            ))}
          </View>
          <View style={[s.historyHeader, { height: compact ? 28 : 32 }]}>
            <Text style={s.caption}>{String(t("recentMaterials"))}</Text>
            {gains.length > 0 && (
              <>
                <Text style={s.label}>
                  {shownPage + 1}/{recentPages}
                </Text>
                {arrow(true, shownPage === 0, () =>
                  setRecentPage((p) => p - 1),
                )}
                {arrow(false, shownPage + 1 >= recentPages, () =>
                  setRecentPage((p) => p + 1),
                )}
              </>
            )}
          </View>
          {gains.length ? (
            <View testID="material-history" style={{ gap: 4 }}>
              {gains
                .slice(shownPage * rows, shownPage * rows + rows)
                .map((gain) => (
                  <CozyPressable
                    key={gain.id}
                    testID="material-gain-row"
                    accessibilityRole="button"
                    accessibilityLabel={source(gain) + ": " + gainText(gain)}
                    onPress={() => onInfo(source(gain) + ": " + gainText(gain))}
                    hitSlop={4}
                    style={[s.gain, { height: compact ? 28 : 30 }]}
                  >
                    <Text numberOfLines={1} style={s.source}>
                      {source(gain)}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 7 }}>
                      {Object.entries(gain.amounts).map(([key, n]) => (
                        <View
                          key={key}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <GameIcon name={icon(key)} size={18} />
                          <Text style={s.gainAmount}>
                            +{number(n!, i18n.language)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </CozyPressable>
                ))}
            </View>
          ) : (
            <Text style={s.empty}>{String(t("noRecentMaterials"))}</Text>
          )}
        </>
      ) : (
        <>
          <Text style={s.caption}>
            {String(t("owned"))} · {owned.length} · {page + 1}/{pages}
          </Text>
          <View style={s.items}>
            {arrow(true, page === 0, () => setPage((p) => p - 1))}
            {owned.slice(page * 4, page * 4 + 4).map((id) => (
              <CozyPressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={String(t(id))}
                onPress={() => onInfo(String(t(id)))}
                style={s.item}
              >
                {id in decorationImages ? (
                  <DecorationArtwork id={id as DecorationId} size={44} />
                ) : (
                  <GameIcon
                    name={id.includes("card") ? "play" : "decorations"}
                    size={36}
                  />
                )}
                <Text style={s.label} numberOfLines={2}>
                  {String(t(id))}
                </Text>
              </CozyPressable>
            ))}
            {arrow(false, page + 1 >= pages, () => setPage((p) => p + 1))}
          </View>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0, padding: 6, gap: 6 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: cozy.color.glass,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  title: { flex: 1, fontSize: 19, color: cozy.color.ink, fontWeight: "600" },
  tab: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: cozy.color.wood },
  tabText: { fontSize: 12, fontWeight: "600", color: cozy.color.ink },
  resources: { flexDirection: "row", gap: 6 },
  resource: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: cozy.color.border,
    borderRadius: 15,
    backgroundColor: "#fff7dfed",
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "700",
    color: cozy.color.ink,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    color: "#46624e",
    textAlign: "center",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: cozy.color.glass,
    borderRadius: 10,
    paddingHorizontal: 7,
  },
  caption: { flex: 1, fontSize: 12, fontWeight: "600", color: cozy.color.ink },
  arrowButton: {
    width: 38,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: { fontSize: 26, lineHeight: 28, color: cozy.color.ink },
  gain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: cozy.color.glass,
  },
  source: { flex: 1, fontSize: 11, color: cozy.color.ink },
  gainAmount: { fontSize: 11, fontWeight: "700", color: cozy.color.ink },
  empty: {
    backgroundColor: cozy.color.glass,
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    color: "#46624e",
  },
  items: { flexDirection: "row", alignItems: "center", gap: 6 },
  item: {
    flex: 1,
    minWidth: 0,
    height: 84,
    backgroundColor: cozy.color.glass,
    borderRadius: 12,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
