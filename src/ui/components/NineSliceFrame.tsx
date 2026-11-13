import React from "react";
import { Image, Platform, View, type ImageSourcePropType, type ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";
import { useUniqueSvgIdsRef } from "./useUniqueSvgIds";
import { nineSliceScale } from "../theme/nineSliceGeometry";

export interface NineSliceFrameProps {
  readonly Source: React.FC<SvgProps>;
  readonly intrinsicWidth: number;
  readonly intrinsicHeight: number;
  /** Distance (in the source SVG's own units) from each edge that must stay
   * un-stretched to avoid distorting corner ornaments/border radius. Set
   * insetTop/insetBottom to 0 for a horizontal-only 3-slice (e.g. a pill bar
   * whose height never changes). */
  readonly insetLeft: number;
  readonly insetRight: number;
  readonly insetTop: number;
  readonly insetBottom: number;
  readonly width: number;
  readonly height: number;
  readonly style?: ViewStyle;
}

/**
 * Real 9-slice (or 3-slice, when insetTop/insetBottom are 0) rendering of an approved
 * SVG asset: corners/caps are drawn at a uniform scale derived from `width` (so their
 * proportions never distort), only the flat edge strips and center stretch
 * (preserveAspectRatio="none") to reach the target size. This samples the real asset
 * file via `viewBox` sub-regions — it never redraws or replaces approved artwork.
 */
export function NineSliceFrame({
  Source,
  intrinsicWidth: W,
  intrinsicHeight: H,
  insetLeft: L,
  insetRight: R,
  insetTop: T,
  insetBottom: B,
  width,
  height,
  style,
}: NineSliceFrameProps) {
  // One seed for the whole frame: all nine pieces are slices of the very same source
  // file and are meant to share identical gradient colors, so they may share ids with
  // each other — only a DIFFERENT NineSliceFrame instance (another panel, the tab bar)
  // must not collide with this one. See useUniqueSvgIds.ts for the underlying bug.
  const uidRef = useUniqueSvgIdsRef();
  const rasterSource = (Source as React.FC<SvgProps> & { rasterSource?: ImageSourcePropType }).rasterSource;

  // Uniform scale derived from width keeps corner ornaments proportioned exactly as
  // they'd look if the whole asset were scaled by width — never squashed or enlarged
  // relative to the rest of the frame.
  // Content-sized panels may be shorter than both ornaments combined. Without
  // this cap, their top and bottom rows overlap and the painted center vanishes.
  const scale = nineSliceScale(width, W, height, T, B);
  const sL = L * scale;
  const sR = R * scale;
  const sT = T * scale;
  const sB = B * scale;

  const midSrcW = W - L - R;
  const midSrcH = H - T - B;
  const midW = Math.max(0, width - sL - sR);
  const midH = Math.max(0, height - sT - sB);

  const piece = (
    key: string,
    x: number,
    y: number,
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    outW: number,
    outH: number,
    stretch: boolean,
  ) => {
    if (outW <= 0 || outH <= 0 || srcW <= 0 || srcH <= 0) return null;
    return (
      <View key={key} ref={uidRef} style={{ position: "absolute", left: x, top: y, width: outW, height: outH, overflow: "hidden" }}>
        {Platform.OS !== "web" && rasterSource ? (
          <Image
            source={rasterSource}
            resizeMode="stretch"
            style={{
              position: "absolute",
              width: W * outW / srcW,
              height: H * outH / srcH,
              left: -srcX * outW / srcW,
              top: -srcY * outH / srcH,
            }}
          />
        ) : (
          <Source width={outW} height={outH} viewBox={`${srcX} ${srcY} ${srcW} ${srcH}`} preserveAspectRatio={stretch ? "none" : "xMidYMid meet"} />
        )}
      </View>
    );
  };

  return (
    <View style={[{ width, height }, style]} pointerEvents="none">
      {piece("tl", 0, 0, 0, 0, L, T, sL, sT, false)}
      {piece("tm", sL, 0, L, 0, midSrcW, T, midW, sT, true)}
      {piece("tr", width - sR, 0, W - R, 0, R, T, sR, sT, false)}
      {piece("ml", 0, sT, 0, T, L, midSrcH, sL, midH, true)}
      {piece("mm", sL, sT, L, T, midSrcW, midSrcH, midW, midH, true)}
      {piece("mr", width - sR, sT, W - R, T, R, midSrcH, sR, midH, true)}
      {piece("bl", 0, height - sB, 0, H - B, L, B, sL, sB, false)}
      {piece("bm", sL, height - sB, L, H - B, midSrcW, B, midW, sB, true)}
      {piece("br", width - sR, height - sB, W - R, H - B, R, B, sR, sB, false)}
    </View>
  );
}
