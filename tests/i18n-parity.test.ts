import assert from "node:assert/strict";
import test from "node:test";
import { da } from "../src/i18n/da";
import { en } from "../src/i18n/en";

test("Danish and English have identical non-empty translation keys", () => {
  const danishKeys = Object.keys(da).sort();
  const englishKeys = Object.keys(en).sort();
  assert.deepEqual(danishKeys, englishKeys);
  for (const key of englishKeys) {
    const daText = da[key as keyof typeof da];
    const enText = en[key as keyof typeof en];
    assert.ok(typeof daText === "string" && daText.trim(), "Missing DA translation: " + key);
    assert.ok(typeof enText === "string" && enText.trim(), "Missing EN translation: " + key);
    const variables = (text: string) =>
      [...text.matchAll(/{{\s*([^{}]+?)\s*}}/g)].map((match) => match[1]).sort();
    assert.deepEqual(variables(daText), variables(enText), "Interpolation mismatch: " + key);
  }
});

test("Undo contextual feedback exists in both languages", () => {
  assert.match(da.noUndoMoves, /fortryde/i);
  assert.match(en.noUndoMoves, /undo/i);
});