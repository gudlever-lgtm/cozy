import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { CardArtwork } from "./CardArtwork";
import type { Card } from "./engine/solitaire";
import type { CardTheme } from "./engine/progression";
import { stackPickerGeometry } from "./presentation/stackPicker";
export function StackCardPicker({
  cards,
  theme,
  cardName,
  onSelect,
  onClose,
}: {
  cards: { card: Card; index: number }[];
  theme: CardTheme;
  cardName: (card: Card) => string;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation(),
    window = useWindowDimensions();
  const [bounds, setBounds] = useState({
    width: Math.min(1000, window.width * 0.96),
    height: window.height * 0.9,
  });
  const [requested, setPage] = useState(0),
    layout = stackPickerGeometry(bounds.width, bounds.height),
    pages = Math.max(1, Math.ceil(cards.length / layout.perPage)),
    page = Math.min(requested, pages - 1);
  return (
    <View
      testID="stack-card-picker"
      style={styles.dialog}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0)
          setBounds((old) =>
            old.width === width && old.height === height
              ? old
              : { width, height },
          );
      }}
    >
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={styles.title}
        >
          {String(t("stackTitle"))}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={String(t("close"))}
          onPress={onClose}
          style={styles.button}
        >
          <Text style={styles.arrow}>×</Text>
        </Pressable>
      </View>
      <View
        testID="stack-card-row"
        style={{
          height: layout.areaHeight,
          flexDirection: "row",
          gap: layout.gap,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cards
          .slice(page * layout.perPage, (page + 1) * layout.perPage)
          .map(({ card, index }) => (
            <Pressable
              key={card.id}
              testID={`stack-choice-${index}`}
              accessibilityRole="button"
              accessibilityLabel={cardName(card)}
              accessibilityHint={String(t("stackInstructions"))}
              onPress={() => onSelect(index)}
              style={{
                width: layout.cardWidth,
                height: layout.cardHeight,
                borderRadius: 8,
                backgroundColor: "#fff9eb",
                borderWidth: 1,
                borderColor: "#c9bb8e",
              }}
            >
              <View pointerEvents="none" style={{ flex: 1, padding: 2 }}>
                <CardArtwork card={card} theme={theme} />
              </View>
            </Pressable>
          ))}
      </View>
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={String(t("previousPage"))}
          accessibilityState={{ disabled: page === 0 }}
          disabled={page === 0}
          onPress={() => setPage(page - 1)}
          style={[styles.button, page === 0 && styles.disabled]}
        >
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.count}>
          {page + 1} / {pages}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={String(t("nextPage"))}
          accessibilityState={{ disabled: page + 1 >= pages }}
          disabled={page + 1 >= pages}
          onPress={() => setPage(page + 1)}
          style={[styles.button, page + 1 >= pages && styles.disabled]}
        >
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  dialog: {
    width: "98%",
    height: "94%",
    maxWidth: 1000,
    padding: 12,
    gap: 8,
    borderRadius: 22,
    backgroundColor: "#faf7ec",
    borderWidth: 1,
    borderColor: "#d6c396",
  },
  header: { height: 44, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 22, fontFamily: "serif", color: "#294d3b" },
  button: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#d0c3a2",
    backgroundColor: "#f1eddc",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { fontSize: 28, lineHeight: 32, color: "#345b49" },
  footer: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  count: { fontSize: 14, fontWeight: "600", color: "#345b49" },
  disabled: { opacity: 0.3 },
});
