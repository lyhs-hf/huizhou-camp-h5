import test from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "../src/services/validation.mjs";
test("contact validation is precise and requires age", () => {
  assert.equal(validateLead("", ""), "请填写家长手机号");
  assert.equal(validateLead("123", "5–8岁"), "请填写正确的11位手机号");
  assert.equal(validateLead("13800000000", ""), "请选择孩子年龄段");
  assert.equal(validateLead("13800000000", "9–12岁"), "");
});
