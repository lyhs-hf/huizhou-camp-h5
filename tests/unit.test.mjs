import test from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "../src/services/validation.mjs";
test("contact validation is precise and requires age", () => {
  assert.equal(validateLead("", ""), "请填写家长手机号");
  assert.equal(validateLead("123", "5–8岁"), "请填写正确的11位手机号");
  assert.equal(validateLead("13800000000", ""), "请选择孩子年龄段");
  assert.equal(validateLead("13800000000", "9–12岁"), "");
});

import { coverStroke } from '../src/utils/strokeCoverage.mjs';
test('continuous strokes cover sparse events without counting taps or distant strokes', () => {
  const samples = Array.from({length: 21}, (_, i) => ({x: i * 5, y: 0}));
  const covered = new Set();
  assert.equal(coverStroke(samples, {x:0,y:30}, {x:100,y:30}, 8, covered), 0);
  assert.ok(coverStroke(samples, {x:0,y:0}, {x:0,y:0}, 8, covered) < .15);
  assert.equal(coverStroke(samples, {x:0,y:0}, {x:100,y:0}, 8, covered), 1);
});
test('separate gestures retain covered material but never fill the untraced gap', () => {
  const samples = Array.from({length: 21}, (_, i) => ({x: i * 5, y: 0}));
  const covered = new Set();
  coverStroke(samples, {x:0,y:0}, {x:20,y:0}, 1, covered);
  coverStroke(samples, {x:80,y:0}, {x:100,y:0}, 1, covered);
  assert.equal(covered.has(10), false);
  assert.equal(covered.size, 10);
});
