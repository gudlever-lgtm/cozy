import React from "react";
import { View } from "react-native";
import { ArtIcon } from "./ArtIcon";
import { CardArtwork } from "./CardArtwork";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";
/** Consistent native line icons for the compact game dock and contextual controls. */
export function GameIcon({
  name,
  size = 32,
  color = "#345b49",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const original: Record<string, string> = {
    glimmer: "glimmer",
    wood: "wood",
    stone: "stone",
    seeds: "seeds",
    garden: "garden",
    world: "world",
    mini: "flowers",
    quests: "quests",
    inventory: "seeds",
    decorations: "flowers",
    statistics: "star",
    settings: "settings",
    music: "music",
    sound: "sound",
    undo: "undo",
    hint: "hint",
    help: "quests",
    auto: "shuffle",
    restart: "undo",
    gather: "wood",
    gift: "star",
    challenge: "star",
  };
  if (original[name]) return <ArtIcon name={original[name]} size={size} />;
  if (name === "play" || name === "newGame")
    return (
      <View pointerEvents="none" style={{ width: size, height: size * 1.15 }}>
        <CardArtwork
          card={{ id: "icon", rank: 1, suit: "♠", up: true }}
          theme="botanical"
        />
      </View>
    );
  const paths: Record<string, string> = {
    menu: "M4 6h16M4 12h16M4 18h16",
    wood: "M5 5h14v14H5zM8 5v14M13 5v14M17 5v14",
    stone: "M3 16l4-11 11-2 4 13-7 5-12-5",
    seeds: "M12 21V8M12 12Q1 10 5 3q9 0 7 9M12 16Q23 14 19 7q-9 0-7 9",
    garden: "M3 11L12 3l9 8M5 10v11h14V10M9 21v-7h6v7",
    world: "M3 5l6-2 6 3 6-2v15l-6 2-6-3-6 2V5M9 3v15M15 6v15",
    play: "M9 3h10v15H9zM5 7H3v14h11v-2M14 6l-3 5 3 3 3-3-3-5",
    mini: "M12 4v16M4 12h16M6 6l12 12M6 18L18 6",
    quests: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
    inventory: "M5 8h14l2 13H3L5 8M8 8V6a4 4 0 018 0v2",
    decorations: "M12 21V10M12 14Q1 15 4 5q8 0 8 9M12 16q11 1 8-9-8 0-8 9",
    statistics: "M4 20V12M10 20V8M16 20V3M2 21h20",
    settings: "M9 3h6l1 4 4 1 1 6-4 2-1 4H9l-1-4-4-1-1-6 4-2 2-4",
    undo: "M8 4L3 9l5 5M3 9h11a6 6 0 010 12",
    hint: "M9 18h6M10 21h4M8 14a7 7 0 118 0l-1 2H9l-1-2",
    help: "M9 8a3 3 0 116 0c0 3-3 2-3 6M12 18v1",
    auto: "M4 17L17 4M13 3l1 4 4 1M6 12l2 3 3 1M18 14l1 3 3 1",
    restart: "M4 10a8 8 0 118 10M4 3v7h7",
    newGame: "M5 3h14v18H5zM8 12h8M12 8v8",
    gather: "M4 20l9-9M11 4q7-3 10 3l-7 7-7-7 4-3M3 18l3 3",
    gift: "M3 9h18v12H3zM2 6h20v4H2zM12 6v15M12 6C1 8 5-3 12 6M12 6c11 2 7-9 0 0",
    friend: "M5 21v-3a7 7 0 0114 0v3M8 6a4 4 0 108 0 4 4 0 00-8 0",
    challenge:
      "M7 3h10v5a5 5 0 01-10 0V3M7 5H3v3q0 5 5 5M17 5h4v3q0 5-5 5M12 13v6M7 21h10",
    close: "M5 5l14 14M19 5L5 19",
    glimmer: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={paths[name] ?? paths.help} />
        {name === "settings" && <Circle cx="12" cy="12" r="3" />}
      </G>
    </Svg>
  );
}
