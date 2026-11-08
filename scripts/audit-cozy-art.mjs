#!/usr/bin/env node
/**
 * Audit every bundled Cozy V3 image directly from WebP headers (no decoding deps).
 * Usage: node scripts/audit-cozy-art.mjs [--strict]
 * This checks technical integrity, dimensions and declared alpha channels; it
 * cannot replace visual review of bad cutout edges or hand-painted consistency.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = "assets/cozy-redesign/illustrations";
const strict = process.argv.includes("--strict");
const assets = [];
const problems = [];
const warnings = [];
function walk(folder) {
  for (const ent of readdirSync(folder, { withFileTypes: true })) {
    const p = join(folder, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".webp")) inspect(p);
  }
}
function inspect(file) {
  const data = readFileSync(file);
  const name = relative(root, file).replaceAll("\\", "/");
  if (data.length < 32 || data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP") {
    problems.push(name + ": invalid WebP header");
    return;
  }
  if (data.readUInt32LE(4) + 8 !== data.length) problems.push(name + ": inconsistent RIFF file length");
  const chunk = data.toString("ascii", 12, 16);
  let width = 0, height = 0, alpha = false;
  if (chunk === "VP8X") {
    alpha = Boolean(data[20] & 0x10);
    width = 1 + data.readUIntLE(24, 3);
    height = 1 + data.readUIntLE(27, 3);
  } else if (chunk === "VP8L") {
    if (data[20] !== 0x2f) problems.push(name + ": invalid lossless header");
    width = 1 + (data[21] | ((data[22] & 0x3f) << 8));
    height = 1 + ((data[22] >> 6) | (data[23] << 2) | ((data[24] & 0x0f) << 10));
    alpha = Boolean(data[24] & 0x10);
  } else if (chunk === "VP8 ") {
    const marker = data.subarray(23, 26).toString("hex");
    if (marker !== "9d012a") problems.push(name + ": missing lossy frame signature");
    width = data.readUInt16LE(26) & 0x3fff;
    height = data.readUInt16LE(28) & 0x3fff;
  } else {
    problems.push(name + ": unsupported WebP container " + chunk);
  }
  if (width < 24 || height < 24 || width > 4096 || height > 4096) problems.push(name + ": invalid canvas " + width + "x" + height);
  const category = name.split("/")[0];
  if (category !== "backgrounds" && !alpha) warnings.push(name + ": no alpha channel, inspect cutout background");
  if (category === "backgrounds" && width < 800) warnings.push(name + ": background might be too small for full-screen rendering");
  assets.push({ path: name, width, height, alpha, bytes: data.length, category });
}
walk(root);
const portrait = assets.find(a => a.path === "backgrounds/garden_home_spring.webp");
if (!portrait) problems.push("Missing active portrait garden background");
else if (portrait.width !== 941 || portrait.height !== 1672)
  problems.push("Portrait camera expects 941x1672 but bundled artwork is " + portrait.width + "x" + portrait.height);
const groups = Object.groupBy(assets, a => a.category);
const result = {
  total: assets.length,
  portraitGarden: portrait ? { width: portrait.width, height: portrait.height } : null,
  bytes: assets.reduce((n, a) => n + a.bytes, 0),
  groups: Object.fromEntries(Object.entries(groups).map(([key, values]) => [key, values.length])),
  problems, warnings,
};
console.log(JSON.stringify(result, null, 2));
if (assets.length !== 105) problems.push("Expected 105 individual Cozy graphics, found " + assets.length);
if (problems.length || (strict && warnings.length)) process.exitCode = 1;
