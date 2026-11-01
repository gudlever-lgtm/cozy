/** Presentation-only scheduling. No gameplay, quest or economy dependencies. */
export type LivingSeason = "spring" | "summer" | "autumn" | "winter";
export type AnimationQuality = "low" | "medium" | "high";
export type SpriteKind =
  "firefly" | "bird" | "butterfly" | "leaf" | "snowflake" | "rain" | "blossom";
export type Point = { x: number; y: number };
export type AmbientObject = {
  id: string;
  kind: SpriteKind;
  layer: "behindTrees" | "ambient";
  points: [Point, Point, Point, Point];
  duration: number;
  pause: number;
  delay: number;
  size: number;
  depth: number;
  rotation: number;
};
export const ACTIVE_LIMITS: Record<AnimationQuality, number> = {
  low: 16,
  medium: 24,
  high: 32,
};
export const LAYER_ORDER = [
  "background",
  "behindTrees",
  "foreground",
  "ambient",
  "controls",
] as const;
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function curve(points: AmbientObject["points"], t: number): Point {
  "worklet";
  const a = 1 - t;
  return {
    x:
      a * a * a * points[0].x +
      3 * a * a * t * points[1].x +
      3 * a * t * t * points[2].x +
      t * t * t * points[3].x,
    y:
      a * a * a * points[0].y +
      3 * a * a * t * points[1].y +
      3 * a * t * t * points[2].y +
      t * t * t * points[3].y,
  };
}
export function shouldAnimate(
  enabled: boolean,
  reducedMotion: boolean,
  appState: string,
): boolean {
  return enabled && !reducedMotion && appState === "active";
}
export function createAmbientObjects(
  season: LivingSeason,
  quality: AnimationQuality,
  intensity: number,
  seed = 721,
): AmbientObject[] {
  const random = seededRandom(seed),
    count = Math.max(0, Math.min(1, intensity));
  const plans: Record<LivingSeason, Record<AnimationQuality, SpriteKind[]>> = {
    spring: {
      low: ["bird", "butterfly", "blossom"],
      medium: [
        "bird",
        "butterfly",
        "butterfly",
        "blossom",
        "blossom",
        "blossom",
      ],
      high: [
        "bird",
        ...Array<SpriteKind>(3).fill("butterfly"),
        ...Array<SpriteKind>(5).fill("blossom"),
      ],
    },
    summer: {
      low: ["bird", ...Array<SpriteKind>(6).fill("firefly")],
      medium: ["bird", ...Array<SpriteKind>(8).fill("firefly")],
      high: ["bird", ...Array<SpriteKind>(12).fill("firefly")],
    },
    autumn: {
      low: [
        "bird",
        ...Array<SpriteKind>(3).fill("leaf"),
        ...Array<SpriteKind>(2).fill("rain"),
      ],
      medium: [
        "bird",
        ...Array<SpriteKind>(5).fill("leaf"),
        ...Array<SpriteKind>(6).fill("rain"),
      ],
      high: [
        "bird",
        ...Array<SpriteKind>(7).fill("leaf"),
        ...Array<SpriteKind>(9).fill("rain"),
      ],
    },
    winter: {
      low: Array<SpriteKind>(6).fill("snowflake"),
      medium: Array<SpriteKind>(12).fill("snowflake"),
      high: Array<SpriteKind>(20).fill("snowflake"),
    },
  };
  const plan = count === 0 ? [] : plans[season][quality];
  return plan.map((kind, i) => {
    const depth = 0.35 + random() * 0.65,
      x = random(),
      drift = (random() - 0.5) * 0.3;
    let points: AmbientObject["points"];
    if (kind === "bird")
      points = [
        { x: -0.08, y: 0.14 + random() * 0.06 },
        { x: 0.2, y: 0.06 + random() * 0.08 },
        { x: 0.68, y: 0.12 + random() * 0.08 },
        { x: 1.08, y: 0.14 + random() * 0.06 },
      ];
    else if (kind === "butterfly")
      points = [
        { x: 0.12 + random() * 0.3, y: 0.7 + random() * 0.15 },
        { x: 0.3, y: 0.35 + random() * 0.2 },
        { x: 0.65, y: 0.42 + random() * 0.2 },
        { x: 0.65 + random() * 0.2, y: 0.75 },
      ];
    else if (kind === "firefly")
      points = [
        { x, y: 0.52 + random() * 0.35 },
        { x: Math.max(0.04, x - 0.12), y: 0.42 + random() * 0.2 },
        { x: Math.min(0.96, x + 0.12), y: 0.5 + random() * 0.3 },
        {
          x: Math.max(0.04, Math.min(0.96, x + drift)),
          y: 0.52 + random() * 0.35,
        },
      ];
    else
      points = [
        { x, y: -0.08 - random() * 0.3 },
        { x: x + drift, y: 0.25 },
        { x: x - drift * 0.5, y: 0.65 },
        { x: x + drift, y: 1.1 },
      ];
    return {
      id: `${season}-${quality}-${i}`,
      kind,
      layer: kind === "bird" ? "behindTrees" : "ambient",
      points,
      duration:
        kind === "bird"
          ? 6500 + random() * 3500
          : kind === "rain"
            ? 4500 + depth * 4000
            : kind === "butterfly"
              ? 9000 + random() * 6000
              : 13000 + random() * 19000,
      pause:
        kind === "bird"
          ? 18000 + random() * 22000
          : kind === "butterfly"
            ? 3000 + random() * 5000
            : 1000 + random() * 4000,
      delay: random() * 12000,
      size:
        kind === "bird"
          ? 22
          : kind === "butterfly"
            ? 20
            : kind === "firefly"
              ? 14
              : kind === "rain"
                ? 14
                : kind === "leaf"
                  ? 15
                  : kind === "blossom"
                    ? 12
                    : 8,
      depth,
      rotation: (random() - 0.5) * 30,
    };
  });
}

export function imagePoint(
  point: Point,
  width: number,
  height: number,
  sourceWidth = 836,
  sourceHeight = 470,
): Point {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  return {
    x: (width - sourceWidth * scale) / 2 + point.x * sourceWidth * scale,
    y: (height - sourceHeight * scale) / 2 + point.y * sourceHeight * scale,
  };
}
export const LIGHT_ANCHORS: Record<LivingSeason, Point[]> = {
  spring: [
    { x: 0.7, y: 0.38 },
    { x: 0.81, y: 0.38 },
    { x: 0.95, y: 0.38 },
  ],
  summer: [
    { x: 0.24, y: 0.16 },
    { x: 0.7, y: 0.38 },
    { x: 0.81, y: 0.38 },
  ],
  autumn: [
    { x: 0.24, y: 0.16 },
    { x: 0.7, y: 0.38 },
    { x: 0.81, y: 0.38 },
  ],
  winter: [
    { x: 0.11, y: 0.65 },
    { x: 0.69, y: 0.38 },
    { x: 0.81, y: 0.38 },
    { x: 0.95, y: 0.4 },
  ],
};
