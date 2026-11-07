/** Web is a local design-test target; distributed builds remain Android and iOS. */
module.exports = ({ config }) => ({
  ...config,
  ...(process.env.COZY_DESIGN_PREVIEW === "1"
    ? { platforms: ["ios", "android", "web"] }
    : {}),
});
