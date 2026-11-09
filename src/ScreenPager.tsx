import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { CozyPanel } from "./ui/CozyPanel";
import { cozyRedesignImages } from "./assets/cozyRedesignImages";
import { useTranslation } from "react-i18next";
import { pageGeometry } from "./presentation/paging";
/** Finite viewport pages: all items remain reachable without nesting a ScrollView. */
export function ScreenPager({
  title,
  items,
  id,
  actions,
  focusIndex,
}: {
  title: string;
  items: React.ReactNode[];
  id: string;
  actions?: React.ReactNode;
  focusIndex?: number;
}) {
  const window = useWindowDimensions(),
    { t } = useTranslation();
  const [bounds, setBounds] = useState({
    width: window.width,
    height: window.height - 58,
  });
  const [requested, setPage] = useState(0);
  const layout = pageGeometry(bounds.width, bounds.height, actions ? 44 : 38),
    pages = Math.max(1, Math.ceil(items.length / layout.perPage)),
    page = Math.min(requested, pages - 1);
  useEffect(() => {
    if (focusIndex !== undefined && focusIndex >= 0)
      setPage(Math.floor(focusIndex / layout.perPage));
  }, [focusIndex, layout.perPage]);
  return (
    <View
      testID={`${id}-pages`}
      style={styles.root}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0)
          setBounds((old) =>
            old.width === width && old.height === height
              ? old
              : { width, height },
          );
      }}
    >
      <CozyPanel
        ornaments={false}
        style={{
          height: actions ? 44 : 38,
          paddingHorizontal: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Image
          source={cozyRedesignImages.ui_flower_corner_blue_webp}
          style={styles.headerFlower}
          resizeMode="contain"
          accessible={false}
        />
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[styles.title, { flex: 1 }]}
        >
          {title}
        </Text>
        {actions}
      </CozyPanel>
      <View
        style={{
          height: layout.gridHeight,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {items
          .slice(page * layout.perPage, (page + 1) * layout.perPage)
          .map((item, i) => (
            <View
              key={page * layout.perPage + i}
              style={{
                width:
                  (bounds.width - 16 - (layout.columns - 1) * 8) /
                  layout.columns,
                height: layout.cardHeight,
              }}
            >
              {item}
            </View>
          ))}
      </View>
      <View style={styles.footer}>
        <CozyPressable
          accessibilityRole="button"
          accessibilityLabel={String(t("previousPage"))}
          accessibilityState={{ disabled: page === 0 }}
          disabled={page === 0}
          onPress={() => setPage(page - 1)}
          style={[styles.button, page === 0 && styles.disabled]}
        >
          <Text style={styles.arrow}>‹</Text>
        </CozyPressable>
        <Text style={styles.count}>
          {page + 1} / {pages}
        </Text>
        <CozyPressable
          accessibilityRole="button"
          accessibilityLabel={String(t("nextPage"))}
          accessibilityState={{ disabled: page + 1 >= pages }}
          disabled={page + 1 >= pages}
          onPress={() => setPage(page + 1)}
          style={[styles.button, page + 1 >= pages && styles.disabled]}
        >
          <Text style={styles.arrow}>›</Text>
        </CozyPressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0, padding: 8, gap: 8 },
  headerFlower: { width: 24, height: 24 },
  title: {
    height: 30,
    fontSize: 22,
    fontFamily: "serif",
    color: cozy.color.ink,
  },
  footer: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: "#fff5dd",
    borderWidth: 1,
    borderColor: "#cab58b",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.35 },
  arrow: { fontSize: 30, lineHeight: 34, color: "#355b45" },
  count: { fontSize: 14, color: "#355b45", fontWeight: "600" },
});
