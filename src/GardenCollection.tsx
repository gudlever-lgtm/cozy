import { cozy } from "./ui/theme";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { upgrades, furnitureLevel } from "./engine/world";
import type { Save } from "./engine/save";
import { DecorationArtwork } from "./GardenDecorations";
import type { DecorationId } from "./assets/decorations";

export function GardenCollection({
  save,
  language,
  onPlay,
}: {
  save: Save;
  language: "da" | "en";
  onPlay: (kind: "hidden" | "tea" | "decorations") => void;
}) {
  const da = language === "da";
  const items = upgrades.filter((item) => item.id !== "cards");
  const count = items.filter((item) =>
    save.economy.inventory.includes(item.id),
  ).length;
  const names: Record<string, [string, string]> = {
    flowers: ["Blomsterbed", "Flower bed"],
    bench: ["Havebænk", "Garden bench"],
    bridge: ["Havebro", "Garden bridge"],
    lantern: ["Lanterne", "Lantern"],
    forest: ["Træer", "Trees"],
    birdhouse: ["Fuglehus", "Birdhouse"],
    teaTable: ["Tebord", "Tea table"],
  };
  return (
    <View
      style={{ flex: 1, minHeight: 0, padding: 12, gap: 8 }}
      testID="garden-collection"
    >
      <Text
        accessibilityRole="header"
        style={{ fontSize: 22, fontWeight: "700", color: cozy.color.ink }}
      >
        {da ? "Havens samlealbum" : "Garden collection"}
      </Text>
      <Text style={{ fontSize: 14, color: "#536c57" }}>
        {count}/{items.length}{" "}
        {da ? "dekorationer samlet" : "decorations collected"}
      </Text>
      <View
        testID="collection-progress"
        style={{
          height: 10,
          borderRadius: 8,
          backgroundColor: "#deded4",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.round((count / items.length) * 100)}%`,
            backgroundColor: "#79a37b",
            borderRadius: 8,
          }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        testID="collection-next-goal"
        onPress={() =>
          onPlay(
            !save.economy.inventory.includes("birdhouse")
              ? "hidden"
              : !save.economy.inventory.includes("teaTable")
                ? "tea"
                : "decorations",
          )
        }
        style={{ padding: 12, borderRadius: 14, backgroundColor: "#e2efdc" }}
      >
        <Text style={{ fontWeight: "700", color: cozy.color.ink }}>
          {da ? "Dit næste mål" : "Your next goal"}
        </Text>
        <Text style={{ color: cozy.color.ink }}>
          {!save.economy.inventory.includes("birdhouse")
            ? da
              ? "Vind fuglehuset i Hidden Treasures"
              : "Earn the birdhouse in Hidden Treasures"
            : !save.economy.inventory.includes("teaTable")
              ? da
                ? "Vind tebordet i Tea Time"
                : "Earn the tea table in Tea Time"
              : da
                ? "Se flere dekorationer"
                : "Explore more decorations"}
        </Text>
      </Pressable>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          paddingBottom: 25,
        }}
      >
        {items.map((item) => {
          const owned = save.economy.inventory.includes(item.id);
          const level = furnitureLevel(save.economy, item.id);
          const source =
            item.id === "birdhouse"
              ? da
                ? "Vind efter 3 Hidden Treasures"
                : "Earn after 3 Hidden Treasures"
              : item.id === "teaTable"
                ? da
                  ? "Vind efter 3 Tea Time"
                  : "Earn after 3 Tea Time"
                : da
                  ? "Køb med optjente ressourcer"
                  : "Buy with earned resources";
          return (
            <View
              key={item.id}
              testID={"collection-" + item.id}
              style={{
                width: "47%",
                minWidth: 150,
                minHeight: 138,
                borderRadius: 18,
                padding: 11,
                borderWidth: 1,
                borderColor: owned ? "#d4ba8c" : "#d7d9d1",
                backgroundColor: owned ? "#fff8e9" : "#edece7",
                gap: 5,
              }}
            >
              <View style={{ alignItems: "center", opacity: owned ? 1 : 0.45 }}>
                <DecorationArtwork id={item.id as DecorationId} size={52} />
              </View>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  color: cozy.color.ink,
                }}
              >
                {names[item.id]?.[da ? 0 : 1] ?? item.id}
              </Text>
              <Text
                style={{ textAlign: "center", color: "#566b59", fontSize: 12 }}
              >
                {owned
                  ? (da ? "Samlet · Niveau " : "Collected · Level ") +
                    level +
                    "/3"
                  : source}
              </Text>
              {!owned &&
                (item.id === "birdhouse" || item.id === "teaTable") && (
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#536c57",
                    }}
                  >
                    {Math.min(
                      3,
                      item.id === "birdhouse"
                        ? save.counters.hidden
                        : save.counters.tea,
                    )}
                    /3
                    {da ? " spil gennemført" : " games completed"}
                  </Text>
                )}
              {!owned && (
                <Pressable
                  onPress={() =>
                    onPlay(
                      item.id === "birdhouse"
                        ? "hidden"
                        : item.id === "teaTable"
                          ? "tea"
                          : "decorations",
                    )
                  }
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: cozy.color.ink,
                      fontWeight: "700",
                    }}
                  >
                    {da ? "Find genstanden" : "Find this item"}
                  </Text>
                </Pressable>
              )}
              {!owned && (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    color: "#63735e",
                  }}
                >
                  {item.cost} ✨ · {item.wood} {da ? "træ" : "wood"}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
