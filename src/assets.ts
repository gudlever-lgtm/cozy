export { AMBIENT_SPRITES } from "./assets/ambient";
export { cozyImages } from "./assets/images";
// Static manifest: imported seasonal art plus original local vector art, icons and audio.
export const assets = {
  audio: {
    music: require("../assets/music.wav"),
    nature: require("../assets/nature.wav"),
  },
  icon: require("../assets/icon.png"),
  splash: require("../assets/splash.png"),
};
export const symbols = {
  match: ["🌸", "🌿", "🫐", "🌼", "🌷"],
  tea: ["🫖", "🧁", "🍰"],
  treasures: { key: "🗝", acorn: "🌰", ribbon: "🎀", spoon: "🥄", button: "🔘" },
};
