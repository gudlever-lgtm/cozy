import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fitSolitaireBoard } from "../src/presentation/board";

test("seven solitaire columns fit compact portrait and landscape viewports", () => {
  const piles = Array.from({ length: 7 }, (_, index) =>
    Array.from({ length: index + 1 }, (_, position) => ({
      up: position === index,
    })),
  );
  for (const [width, height] of [
    [294, 385],
    [310, 300],
    [390, 520],
    [720, 315],
    [870, 500],
  ]) {
    const board = fitSolitaireBoard(width, height, piles);
    assert.ok(board.cardWidth >= 1);
    assert.ok(board.cardWidth * 7 + board.padding * 2 <= width);
    assert.ok(board.cardHeight * 2 + board.gap + board.padding * 2 <= height);
    for (const column of board.columns) {
      assert.ok(column.height <= board.tableauHeight + 1);
      assert.ok(column.visibleIndices.length > 0);
    }
  }
});

test("dragged cards raise their entire stack row above the neighboring row", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  assert.match(
    app,
    /dragging\?\.kind === "waste" \|\|\s+dragging\?\.kind === "foundations"/,
  );
  assert.match(app, /dragging\?\.kind === "tableau" \? 200 : 2/);
  assert.match(app, /zIndex: lifted \? 1000 : undefined/);
});

test("solitaire action icons stay sourced from separately bundled artwork", () => {
  const icon = readFileSync("src/GameIcon.tsx", "utf8");
  for (const name of ["new_game", "undo", "hint", "auto_finish"]) {
    assert.ok(icon.includes("cards_icon_" + name + "_webp"));
  }
});
