import React from "react";
import { ForestArtwork } from "./ForestArtwork";
import Svg, { Rect, Path, Circle, Ellipse, G } from "react-native-svg";
import { buildings, type AreaId } from "./engine/progression";
/** Original vector environments complement the supplied cottage illustration; never mockup crops. */
export function WorldArt({
  area,
  levels,
  season = "spring",
}: {
  area: AreaId;
  levels: Record<string, number>;
  season?: "spring" | "summer" | "autumn" | "winter";
}) {
  if (area === "forest")
    return <ForestArtwork season={season} levels={levels} />;
  const winter = area === "winterland" || season === "winter",
    river = area === "river",
    village = area === "village";
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
    >
      <>
        <Rect
          width="1000"
          height="620"
          fill={winter ? "#c2d0db" : river ? "#d7e8de" : "#e8dfc6"}
        />
        <Circle cx="780" cy="100" r="48" fill="#fff0bd" />
        <Path
          d="M0 290Q230 180 500 290Q740 170 1000 280V620H0Z"
          fill={winter ? "#b1c6bb" : "#b7c89b"}
        />
        <Path
          d="M0 390Q300 280 1000 380V620H0Z"
          fill={winter ? "#edf0e6" : "#b4c58d"}
        />
        {river ? (
          <Path
            d="M0 460Q300 300 520 420Q740 500 1000 300V620H0Z"
            fill="#9cbfc0"
          />
        ) : (
          <Path
            d="M300 620Q550 470 480 300L580 300Q680 470 620 620Z"
            fill={winter ? "#d4dfd9" : "#e5d1ab"}
          />
        )}
        {[60, 170, 890, 980].map((x, i) => (
          <G key={x}>
            <Path d={`M${x} 230v230`} stroke="#89765f" strokeWidth="15" />
            <Path
              d={`M${x} 80l-65 150h30l-55 110h180l-55-110h30Z`}
              fill={winter ? "#93afa1" : "#829e76"}
            />
            {winter && (
              <Path
                d={`M${x} 80l-45 104h25l-35 72`}
                stroke="#eef2e7"
                strokeWidth="12"
                fill="none"
              />
            )}
          </G>
        ))}
        {village &&
          [260, 450, 650].map((x, i) => (
            <G key={x}>
              <Rect
                x={x}
                y={240 + (i % 2) * 30}
                width="145"
                height="135"
                rx="7"
                fill={["#e9d2b2", "#ded9be", "#e3c2b2"][i]}
              />
              <Path
                d={`M${x - 15} ${245 + (i % 2) * 30}l88-90 88 90Z`}
                fill="#957266"
              />
              <Rect
                x={x + 52}
                y={300 + (i % 2) * 30}
                width="40"
                height="75"
                rx="18"
                fill="#71968b"
              />
              <Rect
                x={x + 15}
                y={275 + (i % 2) * 30}
                width="30"
                height="35"
                rx="10"
                fill="#efcc85"
              />
            </G>
          ))}
        {winter && (
          <>
            <Path
              d="M250 420Q500 280 760 420"
              stroke="#b69a76"
              strokeWidth="5"
              fill="none"
            />
            {[280, 400, 520, 640, 740].map((x, i) => (
              <G key={x}>
                <Circle
                  cx={x}
                  cy={390 - Math.sin(i) * 35}
                  r="13"
                  fill="#efd49b"
                />
                <Circle
                  cx={x}
                  cy={390 - Math.sin(i) * 35}
                  r="25"
                  fill="#f3dd9d"
                  opacity=".12"
                />
              </G>
            ))}
          </>
        )}
      </>
      {buildings
        .filter((b) => b.area === area && (levels[b.id] ?? 0) > 0)
        .map((b) => (
          <G
            key={b.id}
            transform={`translate(${b.x * 10 - 40},${b.y * 6.2 - 60})`}
          >
            <Ellipse
              cx="40"
              cy="100"
              rx="60"
              ry="12"
              fill="#526b54"
              opacity=".15"
            />
            {b.id === "pond" ? (
              <>
                <Ellipse cx="40" cy="72" rx="65" ry="30" fill="#88b2ab" />
                <Ellipse cx="50" cy="68" rx="18" ry="7" fill="#91ad77" />
                <Circle cx="51" cy="63" r="8" fill="#e4b3bf" />
              </>
            ) : b.id === "pier" ? (
              <>
                <Path d="M0 50H100V95H0Z" fill="#ba9a72" />
                {[15, 35, 55, 75, 95].map((x) => (
                  <Path
                    key={x}
                    d={`M${x} 50V95`}
                    stroke="#8c795d"
                    strokeWidth="2"
                  />
                ))}
              </>
            ) : (
              <>
                <Rect
                  y="20"
                  width="80"
                  height="80"
                  rx="6"
                  fill={winter ? "#c7d9d8" : "#e5c9a1"}
                />
                <Path
                  d="M-12 25L40-20L92 25Z"
                  fill={winter ? "#eff1e7" : "#91a18a"}
                />
                <Rect
                  x="12"
                  y="40"
                  width="22"
                  height="34"
                  rx="8"
                  fill="#f1d29a"
                />
                <Rect
                  x="46"
                  y="40"
                  width="22"
                  height="34"
                  rx="8"
                  fill="#f1d29a"
                />
                <Path d="M0 82H80" stroke="#b19a75" strokeWidth="5" />
              </>
            )}
            {(levels[b.id] ?? 0) >= 2 && (
              <Path
                d="M-15 102Q40 75 95 102"
                stroke="#7f9e72"
                strokeWidth="9"
                fill="none"
              />
            )}
            {(levels[b.id] ?? 0) >= 3 &&
              [0, 30, 60, 90].map((x) => (
                <Circle key={x} cx={x} cy="94" r="7" fill="#e2b3a6" />
              ))}
          </G>
        ))}
    </Svg>
  );
}
