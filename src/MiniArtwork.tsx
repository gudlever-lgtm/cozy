import React from "react";
import Svg, { Circle, Ellipse, Path, Rect, G } from "react-native-svg";
/** Original native vector game pieces; no platform-dependent emoji glyphs. */
export function MiniArtwork({
  kind,
  value,
  size = 40,
}: {
  kind: "match" | "tea" | "treasure";
  value: number;
  size?: number;
}) {
  const colors = ["#d99baf", "#759b67", "#8b8dbb", "#dfbd69", "#bf89b1"];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {kind === "match" ? (
        value === 1 ? (
          <G>
            <Path
              d="M16 52Q26 30 47 12"
              stroke="#5d8055"
              strokeWidth="3"
              fill="none"
            />
            <Ellipse
              cx="24"
              cy="30"
              rx="8"
              ry="16"
              fill="#8fae77"
              transform="rotate(-30 24 30)"
            />
            <Ellipse
              cx="41"
              cy="34"
              rx="8"
              ry="16"
              fill="#6d965f"
              transform="rotate(40 41 34)"
            />
          </G>
        ) : value === 2 ? (
          <G>
            {[
              [22, 24],
              [40, 23],
              [31, 40],
            ].map(([x, y]) => (
              <G key={x}>
                <Circle cx={x} cy={y} r="12" fill="#8588ad" />
                <Circle cx={x - 3} cy={y - 4} r="3" fill="#b3b6d0" />
              </G>
            ))}
            <Path d="M27 13l5-7 4 8" stroke="#779565" strokeWidth="4" />
          </G>
        ) : (
          <G>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <Ellipse
                key={a}
                cx="32"
                cy="18"
                rx="9"
                ry="14"
                fill={colors[value]}
                transform={`rotate(${a} 32 32)`}
              />
            ))}
            <Circle cx="32" cy="32" r="9" fill="#f0d88c" />
            <Circle cx="29" cy="29" r="2" fill="#fff3bc" />
          </G>
        )
      ) : kind === "tea" ? (
        <G>
          <Ellipse cx="30" cy="52" rx="25" ry="5" fill="#d7c39d" />
          {value === 0 ? (
            <G>
              <Path d="M12 22H44V37Q44 51 28 51Q12 51 12 37Z" fill="#9ab19a" />
              <Path
                d="M44 25Q62 24 54 38H44"
                stroke="#718d72"
                strokeWidth="5"
                fill="none"
              />
              <Path
                d="M22 17Q15 10 24 5M34 17Q27 10 36 5"
                stroke="#ddd3ba"
                strokeWidth="3"
                fill="none"
              />
            </G>
          ) : (
            <G>
              <Path
                d="M14 31H48L42 51H20Z"
                fill={value === 1 ? "#c39c83" : "#e3b685"}
              />
              <Path
                d="M12 31Q8 17 23 18Q29 3 40 18Q54 18 50 31Z"
                fill={value === 1 ? "#e6bbc9" : "#f0dfb0"}
              />
              <Circle cx="32" cy="17" r="5" fill="#ae6f7c" />
            </G>
          )}
        </G>
      ) : (
        <G stroke="#997b50" strokeWidth="3" fill="#d9bb7c">
          {value === 0 ? (
            <G>
              <Circle cx="20" cy="20" r="11" />
              <Path d="M28 28L51 51M41 41l7-7M47 47l7-7" />
            </G>
          ) : value === 1 ? (
            <G>
              <Path d="M17 29Q17 55 32 57Q47 55 47 29Z" />
              <Path d="M13 29Q32 7 51 29Z" fill="#9f8562" />
              <Path d="M32 14V6" />
            </G>
          ) : value === 2 ? (
            <G fill="#dca9b5">
              <Path d="M32 26Q3 3 6 27Q7 42 32 31Q58 43 58 24Q58 7 32 26Z" />
              <Path d="M28 31L18 57L32 49L43 57L36 31Z" />
              <Circle cx="32" cy="28" r="7" />
            </G>
          ) : value === 3 ? (
            <G>
              <Ellipse cx="24" cy="19" rx="11" ry="15" />
              <Path d="M29 30L46 58" strokeWidth="7" />
            </G>
          ) : (
            <G>
              <Circle cx="32" cy="32" r="23" fill="#adc4ac" />
              {[
                [25, 25],
                [39, 25],
                [25, 39],
                [39, 39],
              ].map(([x, y]) => (
                <Circle key={`${x},${y}`} cx={x} cy={y} r="3" fill="#fff5d9" />
              ))}
            </G>
          )}
        </G>
      )}
    </Svg>
  );
}
