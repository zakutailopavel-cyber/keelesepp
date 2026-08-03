"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { collectTrustedRoles, isDisabledProfile } = require("./auth-core");

test("client profile privilege aliases never grant staff access", () => {
  const roles = collectTrustedRoles({
    role: "student",
    roles: ["admin"],
    isAdmin: true,
    teacherRole: true,
    isTeacher: true,
  });
  assert.deepEqual([...roles], ["student"]);
});

test("signed custom claims can provide trusted multi-role access", () => {
  const roles = collectTrustedRoles(
    { role: "parent", roles: ["admin"] },
    { roles: ["teacher", "finance"] },
  );
  assert.deepEqual([...roles], ["parent", "teacher", "finance"]);
});

test("only an explicit boolean disabled flag blocks the profile", () => {
  assert.equal(isDisabledProfile({ disabled: true }), true);
  assert.equal(isDisabledProfile({ disabled: false }), false);
  assert.equal(isDisabledProfile({ disabled: "true" }), false);
});
