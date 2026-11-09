#!/usr/bin/env node
/**
 * Cozy graphic usage audit: actual WebP dimensions, manifest integrity,
 * component references and design-sensitive presentation rules.
 *
 * npm run audit:graphics
 * Reports: work/graphic-audit/{report.json,report.md}
 *
 * This is a source/asset audit, not a substitute for Android screenshot QA.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = process.cwd();
const OUT = resolve(ROOT, "work/graphic-audit");
const issues = [];
const notes = [];
const add = (level, category, detail, file = "") =>
  (level === "error" ? issues : notes).push({ level, category, file, detail });
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

function listSource(dir, found = []) {
  if (!existsSync(dir)) return found;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) listSource(full, found);
    else if (/\.tsx?$/.test(item.name)) found.push(full);
  }
  return found;
}

function webp(file) {
  const b = readFileSync(file);
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" ||
      b.toString("ascii", 8, 12) !== "WEBP")
    throw Error("Not a valid RIFF WebP");
  const chunk = b.toString("ascii", 12, 16);
  let width, height, alpha = false;
  if (chunk === "VP8X") {
    width = b.readUIntLE(24, 3) + 1;
    height = b.readUIntLE(27, 3) + 1;
    alpha = !!(b[20] & 0x10);
  } else if (chunk === "VP8L") {
    width = 1 + (b[21] | (b[22] & 63) << 8);
    height = 1 + ((b[22] >> 6) | b[23] << 2 | (b[24] & 15) << 10);
    alpha = !!(b[24] & 0x10);
  } else if (chunk === "VP8 ") {
    width = b.readUInt16LE(26) & 0x3fff;
    height = b.readUInt16LE(28) & 0x3fff;
  } else throw Error("Unsupported WebP chunk " + chunk);
  if (!width || !height || width > 8192 || height > 8192)
    throw Error("Out-of-range image size " + width + "x" + height);
  return { width, height, alpha, ratio: Number((width / height).toFixed(3)), bytes: b.length };
}

const manifest = read("src/assets/cozyRedesignImages.ts");
const entries = [...manifest.matchAll(/"([a-zA-Z0-9_]+)":\s*require\("([^"]+\.webp)"\)/g)]
  .map((m) => ({ key: m[1], source: m[2] }));
const keys = new Set(entries.map((x) => x.key));
if (entries.length === 0) add("error", "manifest", "No WebP entries parsed");
if (keys.size !== entries.length) add("error", "manifest", "Duplicate artwork keys");
const sources = listSource(resolve(ROOT, "src"));
const usages = new Map();
for (const file of sources) {
  const name = file.slice(ROOT.length + 1).replaceAll("\\", "/");
  if (name === "src/assets/cozyRedesignImages.ts") continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/cozyRedesignImages\.([a-zA-Z0-9_]+)/g)) {
    if (!keys.has(m[1])) add("error", "missing-reference", "Unknown artwork " + m[1], name);
    else usages.set(m[1], [...(usages.get(m[1]) ?? []), name]);
  }
}
const assets = [];
for (const entry of entries) {
  const file = resolve(ROOT, "src/assets", entry.source);
  if (!existsSync(file)) {
    add("error", "missing-file", entry.source, entry.key);
    continue;
  }
  try {
    const info = webp(file);
    const category = entry.key.split("_")[0];
    assets.push({ ...entry, category, ...info, usedBy: [...new Set(usages.get(entry.key) ?? [])] });
    if (category === "backgrounds" && info.width < 800)
      add("warning", "resolution", "Fullscreen image may lack pixel density: " + info.width, entry.key);
    if ((category === "characters" || category === "decorations" || category === "cards") && !info.alpha)
      add("warning", "alpha", "Transparent illustration lacks alpha flag; check cutout", entry.key);
  } catch (e) {
    add("error", "format", String(e.message ?? e), entry.key);
  }
}
// Representative required assets; absence breaks a screen even if unused-by-static-reference.
for (const key of [
  "ui_button_wood_webp", "ui_button_paper_webp", "ui_button_green_webp",
  "ui_panel_small_webp", "ui_panel_wide_webp",
  "cards_icon_new_game_webp", "cards_icon_undo_webp",
  "cards_icon_hint_webp", "cards_icon_auto_finish_webp",
  "characters_millie_idle_webp", "characters_marmalade_idle_webp",
  "backgrounds_garden_home_spring_webp",
]) if (!keys.has(key)) add("error", "required-art", "Required graphic is not bundled", key);

for (const a of assets) {
  if (a.category === "ui" && a.key.startsWith("ui_button_") && a.ratio < 2)
    add("error", "aspect", "Woodland button should be landscape shaped; image ratio " + a.ratio, a.key);
  if (a.usedBy.length === 0)
    add("info", "unused", "Bundled but not statically referenced (may be reserved)", a.key);
}

// Design-sensitive cross-checks: fail only on clear incompatibilities.
const button = read("src/ui/CozyButton.tsx");
const menu = read("src/MainMenu.tsx");
const game = read("src/ui/GameToolbar.tsx");
const panel = read("src/ui/CozyPanel.tsx");
for (const variant of ["bottomTab", "toolbarAction", "menuCard", "dialogChoice"])
  if (!button.includes(variant)) add("error", "button-variant", "Missing named layout", variant);
if (!button.includes('resizeMode="stretch"'))
  add("warning", "artwork-transform", "Button rendering mode changed; review edges", "src/ui/CozyButton.tsx");
else
  add("warning", "artwork-transform", "Illustrated WebP buttons are stretched to container; verify aspect ratio at 320px and 390px", "src/ui/CozyButton.tsx");
if (!menu.includes('variant="menuCard"'))
  add("error", "menu-binding", "Menu is not using menuCard layout", "src/MainMenu.tsx");
if (!game.includes('variant="toolbarAction"'))
  add("error", "toolbar-binding", "Solitaire buttons are not using toolbarAction", "src/ui/GameToolbar.tsx");
if (!panel.includes("ui_flower_corner_left_webp") || !panel.includes("ui_flower_corner_right_webp"))
  add("error", "panel-binding", "Floral panel corner images are missing", "src/ui/CozyPanel.tsx");
if (button.includes("...cozy.shadow"))
  add("warning", "shadow", "Transparent button may cast a rectangular shadow", "src/ui/CozyButton.tsx");
if (!button.includes("numberOfLines={2}"))
  add("error", "text-overflow", "Button label has no two-line limit", "src/ui/CozyButton.tsx");
if (!button.includes("minimumFontScale"))
  add("warning", "text-overflow", "No font scaling fallback for long Danish labels", "src/ui/CozyButton.tsx");

const group = Object.fromEntries(
  [...new Set(assets.map((a) => a.category))].sort()
    .map((cat) => [cat, assets.filter((a) => a.category === cat).length]),
);
const report = {
  generatedAt: new Date().toISOString(),
  assets: assets.length, manifestEntries: entries.length,
  errors: issues.length, warnings: notes.filter((x) => x.level === "warning").length,
  groups: group, findings: [...issues, ...notes],
  artwork: assets,
};
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
const table = (rows) => rows.map((a) =>
  "| " + [a.key, a.width + "×" + a.height, a.ratio, a.usedBy.join(", ") || "—"].join(" | ") + " |").join("\n");
const md = [
  "# Cozy graphic usage audit",
  "",
  `**Assets:** ${assets.length} · **Errors:** ${report.errors} · **Warnings:** ${report.warnings}`,
  "",
  "## Findings",
  ...report.findings.filter((x) => x.level !== "info").map((x) =>
    `- **${x.level.toUpperCase()}** ${x.category}: ${x.file} — ${x.detail}`),
  "",
  "## UI assets and owners",
  "| Asset key | Native dimensions | Aspect ratio | Referenced from |",
  "|---|---|---:|---|",
  table(assets.filter((a) => a.category === "ui" || a.key.startsWith("cards_icon_"))),
  "",
  "This metadata audit cannot prove visual fidelity, safe-area placement, cropped transparent margins, or touch quality. Run the Playwright design screenshots and Android device tests as separate gates.",
].join("\n");
writeFileSync(join(OUT, "report.md"), md + "\n");
console.log(`Graphic audit: ${report.assets} assets, ${report.errors} errors, ${report.warnings} warnings`);
if (issues.length) process.exitCode = 1;
