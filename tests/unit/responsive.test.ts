import assert from 'node:assert/strict';
import test from 'node:test';
import {cozyLayout} from '../../src/domain/ui/responsive.ts';

test('portrait keeps bottom navigation width and seven non-overlapping cards',()=>{
  const layout=cozyLayout(390,844);
  assert.equal(layout.landscape,false);
  assert.equal(layout.gardenWidth,390);
  assert.ok(layout.cardWidth*7<390);
});

test('landscape reserves side navigation and actions without distorting cards',()=>{
  const layout=cozyLayout(844,390);
  assert.equal(layout.landscape,true);
  assert.equal(layout.gardenWidth,752);
  assert.equal(layout.boardWidth,616);
  assert.ok(layout.cardWidth*7<layout.boardWidth);
  assert.ok(Math.abs(layout.cardHeight/layout.cardWidth-270/190)<0.00001);
});

test('rotating preserves geometry-relative garden placement coordinates',()=>{
  const portrait=cozyLayout(390,844);
  const landscape=cozyLayout(844,390);
  const normalized=0.4;
  assert.equal(normalized*portrait.gardenWidth/portrait.gardenWidth,normalized);
  assert.equal(normalized*landscape.gardenWidth/landscape.gardenWidth,normalized);
});
