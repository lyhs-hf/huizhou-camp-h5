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
import { frameProgress } from '../src/utils/frameProgress.mjs';
test('animation remains at its origin for an earlier frame, and settles after suspension', () => {
  assert.equal(frameProgress(980, 1000, 900), 0);
  assert.equal(frameProgress(1450, 1000, 900), .5);
  assert.equal(frameProgress(100000, 1000, 900), 1);
});
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

import { traceRelief } from '../src/utils/reliefTrace.mjs';
test('relief gold follows only the physical trajectory and retains gaps after cancellation',()=>{
  const branches=[0,40,80].map(y=>Array.from({length:101},(_,x)=>({x,y})));
  const coverage=[new Set(),new Set(),new Set()];
  assert.deepEqual(coverage.map(s=>s.size),[0,0,0]);
  traceRelief(branches,{x:10,y:0},{x:25,y:0},coverage);
  assert.ok(coverage[0].size>0&&coverage[0].size<40);
  assert.deepEqual(coverage.slice(1).map(s=>s.size),[0,0]);
  const first=[...coverage[0]];
  traceRelief(branches,{x:-30,y:-40},{x:-30,y:140},coverage);
  assert.deepEqual([...coverage[0]],first);
  traceRelief(branches,{x:80,y:0},{x:90,y:0},coverage);
  assert.equal(coverage[0].has(50),false);
  assert.deepEqual(coverage.slice(1).map(s=>s.size),[0,0]);
});
