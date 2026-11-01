import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import { number, type Key } from "./i18n";
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
  const { t, i18n } = useTranslation(),
    [page, setPage] = useState(0),
    owned = save.economy.inventory,
    pages = Math.max(1, Math.ceil(owned.length / 4));
  const icon = (id: string) =>
    id.includes("card")
      ? "play"
      : id.includes("forest")
        ? "world"
        : id.includes("lantern")
          ? "glimmer"
          : "decorations";
  return (
    <View testID="inventory-panel" style={s.root}>
      <Text accessibilityRole="header" style={s.title}>
        {String(t("inventory"))}
      </Text>
      <View testID="compact-inventory" style={s.resources}>
        {Object.entries(save.economy.wallet).map(([key, value]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={
              String(t(key === "flowers" ? "flowersResource" : key)) +
              ": " +
              number(value, i18n.language)
            }
            onPress={() =>
              onInfo(
                String(t(key === "flowers" ? "flowersResource" : key)) +
                  ": " +
                  number(value, i18n.language),
              )
            }
            style={s.resource}
          >
            <GameIcon
              name={
                key === "glimmers"
                  ? "glimmer"
                  : key === "flowers"
                    ? "decorations"
                    : key
              }
              size={26}
            />
            <Text numberOfLines={1} adjustsFontSizeToFit style={s.amount}>
              {number(value, i18n.language)}
            </Text>
          </Pressable>
        ))}
      </View>
      {owned.length > 0 && (
        <>
          <Text style={s.caption}>
            {String(t("owned"))} · {owned.length} · {page + 1}/{pages}
          </Text>
          <View style={s.items}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("previousPage"))}
              disabled={page === 0}
              onPress={() => setPage((n) => n - 1)}
              style={[s.button, page === 0 && { opacity: 0.3 }]}
            >
              <Text style={s.arrow}>‹</Text>
            </Pressable>
            {owned.slice(page * 4, page * 4 + 4).map((id) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={String(t(id))}
                onPress={() => onInfo(String(t(id)))}
                style={s.button}
              >
                {id in decorationImages ? (
                  <DecorationArtwork id={id as DecorationId} size={40} />
                ) : (
                  <GameIcon name={icon(id)} size={30} />
                )}
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("nextPage"))}
              disabled={page + 1 >= pages}
              onPress={() => setPage((n) => n + 1)}
              style={[s.button, page + 1 >= pages && { opacity: 0.3 }]}
            >
              <Text style={s.arrow}>›</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0, padding: 6, gap: 6 },
  title: {
    height: 28,
    fontSize: 22,
    fontFamily: "serif",
    color: "#345b49",
    backgroundColor: "#fff8e9e6",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  resources: { flexDirection: "row", gap: 6 },
  resource: {
    flex: 1,
    minWidth: 0,
    height: 60,
    borderWidth: 1,
    borderColor: "#d2c295",
    borderRadius: 15,
    backgroundColor: "#fff7dfed",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  amount: { fontSize: 17, lineHeight: 20, fontWeight: "700", color: "#345b49" },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    color: "#345b49",
    backgroundColor: "#fff8e9e6",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  items: { flexDirection: "row", gap: 6, alignItems: "center" },
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d2c295",
    backgroundColor: "#fff7dfed",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { fontSize: 28, lineHeight: 32, color: "#345b49" },
});
