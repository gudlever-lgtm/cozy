import { useCallback, useId } from "react";
import { Platform } from "react-native";

const REF_ATTRS = ["fill", "stroke", "filter", "clip-path", "mask"];

function rewriteIds(svg: Element, seed: string) {
  if (svg.getAttribute("data-uid") === seed) return;
  const idMap = new Map<string, string>();
  svg.querySelectorAll("[id]").forEach((el) => {
    const oldId = el.id;
    if (!oldId || idMap.has(oldId)) return;
    const newId = `${oldId}--${seed}`;
    idMap.set(oldId, newId);
    el.id = newId;
  });
  if (idMap.size === 0) return;
  svg.querySelectorAll("*").forEach((el) => {
    for (const attr of REF_ATTRS) {
      const val = el.getAttribute(attr);
      if (!val) continue;
      const match = /^url\(#(.+)\)$/.exec(val);
      if (match && idMap.has(match[1])) el.setAttribute(attr, `url(#${idMap.get(match[1])})`);
    }
  });
  svg.setAttribute("data-uid", seed);
}

/**
 * Ref callback (for the View wrapping an SVGR-rendered asset) that makes that asset's
 * internal gradient/filter ids unique to this one mounted component instance.
 *
 * Root cause this fixes: every mounted copy of the same source .svg reuses the exact
 * same ids (e.g. button-primary.svg's green-fill gradient is always id "...__c").
 * `fill="url(#...__c)"` is resolved against the whole HTML document, not scoped to one
 * <svg> — so when two copies of the same asset are in the DOM at once (confirmed: a
 * previous React Navigation screen stays mounted underneath the current one; Settings'
 * language/season pickers show several `primary`-variant CozyButtons together), the
 * reference can resolve to the wrong instance, which is what made the gradient render
 * intermittently washed-out. Native builds draw each <Svg> through isolated platform
 * draw calls with no shared DOM id-space, so this is a web-only concern.
 */
export function useUniqueSvgIdsRef(): (node: unknown) => void {
  const seed = useId();
  return useCallback(
    (node: unknown) => {
      if (Platform.OS !== "web" || !node) return;
      const container = node as { querySelectorAll?: (selector: string) => Iterable<Element> };
      if (!container.querySelectorAll) return;
      let index = 0;
      for (const svg of container.querySelectorAll("svg")) rewriteIds(svg, `${seed}-${index++}`);
    },
    [seed],
  );
}
