import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { gardenIllustrations } from "../src/assets/cozyGardenIllustrations";

test("all source vector garden assets are bundled in the repository", () => {
  for (const [name, xml] of Object.entries(gardenIllustrations)) {
    const asset = path.join(process.cwd(), "assets", "cozy-redesign", "vectors", name + ".svg");
    assert.ok(fs.existsSync(asset), "Missing vector graphic: " + asset);
    assert.equal(fs.readFileSync(asset, "utf8"), xml, "Embedded artwork differs from SVG: " + name);
    assert.match(xml, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.doesNotMatch(xml, /<text\b|<script\b|<image\b|xlink:href/g, "Art should not contain rendered copy, code, or external dependencies");
  }
});