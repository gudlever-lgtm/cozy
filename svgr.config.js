// Fixes two real rendering bugs found during Stage 5 QA, both confirmed by comparing
// the actual DOM output of react-native-svg-transformer's default config against the
// source .svg files:
//
// 1. ID collisions across assets. The default config keeps each file's original
//    gradient/filter ids unchanged (e.g. "a", "b", "c"). Since react-native-svg
//    renders literal <svg> elements on web, those ids live in one shared DOM
//    id-space — when two different assets are on screen together (nearly always
//    true here), `url(#c)` in one asset can resolve to a *different* asset's element
//    with the same id, silently swapping in the wrong gradient. Confirmed on the
//    Solitaire screen: id="a" reused 9 times, id="b" 8 times across visible SVGs.
//    `prefixIds` namespaces every id by its source file, so cross-file collisions
//    can't happen; multiple on-screen copies of the very same file (e.g. 52 playing
//    cards sharing one face style) still share ids, which is harmless since their
//    gradient content is identical.
//
// 2. Dangling filter references. react-native-svg has no <filter>/<feGaussianBlur>
//    support, so @svgr/plugin-jsx (native: true) silently drops every <filter>
//    definition — but leaves `filter="url(#id)"` on the element that used it. Per
//    the SVG spec, a `filter` attribute referencing a missing element makes that
//    *whole element not render* — which was silently hiding the entire filled
//    body of every button/panel behind this one soft-shadow filter, not just the
//    shadow. (This was inconsistent before the prefixIds fix above, because a
//    colliding id sometimes accidentally pointed at *some* unrelated filter and
///   happened to render; after ids stopped colliding it failed consistently,
//    which is what surfaced it.) `removeAttrs` strips the dangling `filter`
//    attribute at build time — the visible shapes/colors are untouched; only the
//    (already-unsupported) drop-shadow effect is dropped.
module.exports = {
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            inlineStyles: { onlyMatchedOnce: false },
            removeViewBox: false,
            removeUnknownsAndDefaults: false,
            convertColors: false,
          },
        },
      },
      "prefixIds",
      { name: "removeAttrs", params: { attrs: "filter" } },
    ],
  },
};
