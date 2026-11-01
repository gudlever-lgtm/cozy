import React from "react";
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import type { Season } from "./engine/world";
export function Cottage({
  season = "spring",
  time = "afternoon",
}: {
  season?: Season;
  time?: string;
}) {
  const night = time === "evening";
  const sky = night ? "#233c53" : time === "sunset" ? "#f3c5ad" : "#dcebe0";
  const grass = {
    spring: "#b4cc99",
    summer: "#a5bf8a",
    autumn: "#c7b279",
    winter: "#e1e8dd",
  }[season];
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky} />
          <Stop offset="1" stopColor={night ? "#5b6b78" : "#f4edd7"} />
        </LinearGradient>
      </Defs>
      <Rect width="1000" height="620" fill="url(#sky)" />
      <Circle
        cx="790"
        cy="100"
        r="42"
        fill={night ? "#fff5ce" : "#fff3bc"}
        opacity=".85"
      />
      <Path
        d="M0 280Q140 130 300 270Q540 100 760 260Q920 150 1000 240V620H0Z"
        fill="#98b59b"
      />
      <Path d="M0 350Q170 230 400 340Q700 200 1000 330V620H0Z" fill={grass} />
      <Path
        d="M1000 370Q690 340 780 450Q840 540 600 620H1000Z"
        fill="#9bbdbb"
      />
      <Path
        d="M450 360Q550 440 490 510Q450 550 390 620H620Q560 530 570 470Q600 400 540 360Z"
        fill="#e6d4ad"
      />
      {[80, 160, 850, 935, 15].map((x, i) => (
        <G key={x}>
          <Path d={`M${x} 200V420`} stroke="#89775b" strokeWidth="17" />
          <Ellipse
            cx={x}
            cy={220 + (i % 2) * 30}
            rx="65"
            ry="93"
            fill={
              season === "autumn"
                ? "#b78b59"
                : season === "winter"
                  ? "#b8cbbb"
                  : "#6d9371"
            }
          />
          <Ellipse
            cx={x - 20}
            cy="215"
            rx="35"
            ry="65"
            fill={season === "autumn" ? "#d5aa6f" : "#91af87"}
          />
        </G>
      ))}
      <Ellipse
        cx="490"
        cy="411"
        rx="210"
        ry="28"
        fill="#54705b"
        opacity=".12"
      />
      <Rect x="345" y="233" width="290" height="178" rx="9" fill="#f1dec0" />
      <Path d="M315 252L486 110L663 252Z" fill="#8d695e" />
      <Path
        d="M324 248L486 117L654 248"
        fill="none"
        stroke="#b48b76"
        strokeWidth="12"
      />
      <Rect x="570" y="126" width="32" height="77" fill="#aa8470" />
      <Path
        d="M578 105Q559 88 584 68Q610 48 591 29"
        stroke="#fff9eb"
        strokeWidth="15"
        fill="none"
        opacity=".55"
      />
      <Path d="M454 411V310Q489 265 524 310V411" fill="#759085" />
      <Circle cx="509" cy="355" r="4" fill="#e3c58a" />
      {[373, 553].map((x) => (
        <G key={x}>
          <Rect x={x} y="285" width="51" height="59" rx="20" fill="#9b7b60" />
          <Rect
            x={x + 5}
            y="290"
            width="41"
            height="49"
            rx="16"
            fill={night ? "#ffda8c" : "#b6ccca"}
          />
          <Path
            d={`M${x + 25} 290V340M${x + 5} 315H${x + 46}`}
            stroke="#f3e6cc"
            strokeWidth="4"
          />
        </G>
      ))}
      <Circle cx="487" cy="220" r="24" fill="#e9d4ad" />
      <Circle cx="487" cy="220" r="17" fill="#b7c9bf" />
      <Path d="M470 220H504M487 203V237" stroke="#f5e7cb" strokeWidth="4" />
      <Path d="M328 411H655" stroke="#b89878" strokeWidth="10" />
      {[285, 310, 650, 680].map((x, i) => (
        <G key={x}>
          <Ellipse
            cx={x}
            cy={400 + (i % 2) * 20}
            rx="25"
            ry="22"
            fill="#7d9c70"
          />
          {[0, 1, 2].map((j) => (
            <Circle
              key={j}
              cx={x - 12 + j * 12}
              cy={384 + (i % 2) * 20 - (j % 2) * 10}
              r="8"
              fill={
                season === "winter"
                  ? "#fff6e5"
                  : ["#dca5a4", "#e8c77b", "#eee3b8"][j]
              }
            />
          ))}
        </G>
      ))}
      <Path
        d="M50 495Q170 460 255 500M690 570Q800 540 950 560"
        stroke="#95ac7e"
        strokeWidth="5"
        fill="none"
      />
      {[70, 240, 730, 910, 120, 660].map((x, i) => (
        <G key={x}>
          <Path
            d={`M${x} ${510 + (i % 3) * 20}v-18`}
            stroke="#648569"
            strokeWidth="3"
          />
          <Circle
            cx={x}
            cy={490 + (i % 3) * 20}
            r="6"
            fill={season === "winter" ? "#fff" : i % 2 ? "#edc48d" : "#e8b9ad"}
          />
        </G>
      ))}
      {season === "winter" && (
        <>
          <Path
            d="M320 248L486 112L659 249L625 247L486 141L349 253Z"
            fill="#f5f2e6"
          />
          <Path
            d="M20 445Q200 399 315 442M665 465Q800 423 990 460"
            stroke="#f3f3e8"
            strokeWidth="18"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}
export const NPC_ICON = { millie: "🐇", marmalade: "🐈", pip: "🦔" };

export function Portrait({
  animal,
}: {
  animal: "millie" | "marmalade" | "pip";
}) {
  const rabbit = animal === "millie",
    cat = animal === "marmalade";
  return (
    <Svg
      width={76}
      height={76}
      viewBox="0 0 100 100"
      accessibilityElementsHidden
    >
      <Circle
        cx="50"
        cy="50"
        r="48"
        fill={rabbit ? "#e8ead9" : cat ? "#f3e3c9" : "#e2e8dc"}
      />
      {rabbit ? (
        <>
          <Ellipse cx="35" cy="25" rx="10" ry="22" fill="#d4c7ad" />
          <Ellipse cx="63" cy="25" rx="10" ry="22" fill="#d4c7ad" />
          <Ellipse cx="35" cy="25" rx="4" ry="16" fill="#dcaeab" />
          <Ellipse cx="63" cy="25" rx="4" ry="16" fill="#dcaeab" />
        </>
      ) : cat ? (
        <>
          <Path d="M20 49L22 17L44 37M57 37L79 17L81 51" fill="#c5935f" />
          <Path d="M26 36L27 24L37 37M65 37L75 25L75 40" fill="#e2b2a3" />
        </>
      ) : (
        <Path
          d="M15 58L8 45L20 40L15 27L32 29L36 15L49 23L60 13L68 28L85 25L82 41L94 49L83 62Z"
          fill="#917960"
        />
      )}
      <Ellipse
        cx="50"
        cy="60"
        rx="32"
        ry="29"
        fill={rabbit ? "#dfd3ba" : cat ? "#d9a669" : "#cfbea2"}
      />
      <Ellipse cx="38" cy="58" rx="3" ry="4" fill="#3c493c" />
      <Ellipse cx="64" cy="58" rx="3" ry="4" fill="#3c493c" />
      <Path d="M46 66Q50 62 54 66L50 71Z" fill="#a77772" />
      <Path
        d="M50 71Q44 78 40 72M50 71Q56 78 61 72"
        fill="none"
        stroke="#806b59"
        strokeWidth="2"
      />
      <Ellipse cx="29" cy="68" rx="6" ry="3" fill="#dca9a0" opacity=".7" />
      <Ellipse cx="72" cy="68" rx="6" ry="3" fill="#dca9a0" opacity=".7" />
      {cat && (
        <Path
          d="M44 34L46 44M54 34L53 44M20 65L5 61M20 71L6 73M80 65L94 61M80 71L94 74"
          stroke="#9e764f"
          strokeWidth="2"
        />
      )}
      <Path
        d="M35 87Q50 77 66 87"
        stroke="#8caa88"
        strokeWidth="8"
        fill="none"
      />
    </Svg>
  );
}

export function Forest({ season = "spring" }: { season?: Season }) {
  const winter = season === "winter",
    autumn = season === "autumn";
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect width="1000" height="620" fill={winter ? "#dce5df" : "#c1d3be"} />
      <Circle cx="550" cy="100" r="100" fill="#f5e8b8" opacity=".4" />
      <Path
        d="M0 300Q400 170 1000 320V620H0Z"
        fill={winter ? "#e6eade" : autumn ? "#b8ab7d" : "#a9bf8e"}
      />
      <Path
        d="M650 300Q430 400 580 460Q750 500 470 620H670Q870 500 660 430Q520 400 710 300Z"
        fill="#96b6b0"
      />
      {[30, 155, 290, 770, 900, 990].map((x, i) => (
        <G key={x}>
          <Path d={`M${x} 100V490`} stroke="#84795c" strokeWidth="22" />
          <Path
            d={`M${x} ${30 + (i % 2) * 40}l-90 190h40l-70 110h240l-70-110h40Z`}
            fill={winter ? "#a6bdac" : autumn ? "#9ca074" : "#729572"}
          />
          <Path
            d={`M${x} ${40 + (i % 2) * 40}l-50 130h25l-35 80`}
            stroke={winter ? "#edf1e6" : "#8fad80"}
            strokeWidth="12"
            fill="none"
          />
        </G>
      ))}
      <Path
        d="M505 470Q610 435 720 468M502 482L500 443M722 483L722 444"
        stroke="#a58b66"
        strokeWidth="16"
        fill="none"
      />
      {[90, 230, 820].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy="520" rx="22" ry="10" fill="#8eaa79" />
          <Rect x={x - 3} y="494" width="6" height="22" fill="#e6d6b5" />
          <Path d={`M${x - 17} 496Q${x} 468 ${x + 17} 496Z`} fill="#c79b83" />
        </G>
      ))}
      <Path d="M285 495Q350 470 410 495" stroke="#e4d8b8" strokeWidth="28" />
      <Path
        d="M310 484l-15 25M350 480l-15 27M390 486l-15 25"
        stroke="#c5ae8e"
        strokeWidth="4"
      />
    </Svg>
  );
}
