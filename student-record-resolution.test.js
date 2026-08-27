"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("./haldus-shared.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);

const { resolveStudentRecord, lessonJournalErrorGuidance } = context.window.HaldusShared;

test("lesson journal prefers the schedule student id over duplicate names", () => {
  const students = [
    { id: "archived", name: "Milan Grozovski", active: false, mergedIntoStudentId: "primary" },
    { id: "primary", name: "Milan Grozovski", active: true },
  ];
  assert.equal(resolveStudentRecord(students, { studentId: "primary", studentName: "Milan Grozovski" }).id, "primary");
});

test("lesson journal follows an archived duplicate to its primary profile", () => {
  const students = [
    { id: "archived", name: "Milan Grozovski", active: false, mergedIntoStudentId: "primary" },
    { id: "primary", name: "Milan Grozovski", active: true },
  ];
  assert.equal(resolveStudentRecord(students, { studentId: "archived", studentName: "Milan Grozovski" }).id, "primary");
});

test("name fallback is accepted only for one active canonical profile", () => {
  const one = [{ id: "primary", name: "Milan Grozovski", active: true }];
  const ambiguous = [...one, { id: "other", name: "Milan Grozovski", active: true }];
  assert.equal(resolveStudentRecord(one, { studentName: "Milan Grozovski" }).id, "primary");
  assert.equal(resolveStudentRecord(ambiguous, { studentName: "Milan Grozovski" }), null);
});

test("lesson journal errors explain the real corrective action", () => {
  assert.match(
    lessonJournalErrorGuidance("Schedule entry belongs to another student"),
    /ühendatud õpilasekaardiga/,
  );
  assert.match(
    lessonJournalErrorGuidance("Financial period 2026-08 is closed"),
    /finantsperiood on suletud/,
  );
});
