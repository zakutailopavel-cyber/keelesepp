"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "haldus.html"), "utf8");
const functionsSource = fs.readFileSync(path.join(root, "functions", "index.js"), "utf8");

test("lesson journal uses the protected idempotent server operation", () => {
  assert.match(html, /financeApiPost\('\/lessons\/journal'/);
  assert.match(functionsSource, /req\.path === "\/lessons\/journal"/);
  assert.match(functionsSource, /stableLessonDocumentId/);
  assert.match(functionsSource, /transaction\.set\(scheduleRef/);
  assert.match(functionsSource, /lessonCompletionCounterDelta/);
  assert.match(html, /financeApiPost\('\/lessons\/journal\/delete'/);
  assert.match(functionsSource, /req\.path === "\/lessons\/journal\/delete"/);
  assert.match(functionsSource, /action: "lesson\.deleted"/);
});

test("calendar keeps absence states and exposes quick completion", () => {
  assert.match(html, /quickCompleteLesson=\{quickCompleteLesson\}/);
  assert.match(html, /Märgi toimunuks/);
  assert.match(html, /Tänased lõpetamata tunnid/);
  assert.match(html, /Puudus_p/);
  assert.match(html, /Puudus_eta/);
  assert.doesNotMatch(html, /const scheduleStatus = lStatus==='Toimunud' \? 'Toimunud' : 'Planeeritud'/);
});

test("group attendance creates student lesson records instead of an external group lesson", () => {
  assert.match(html, /sourceKey:`group:\$\{modalEv\.groupId\}:\$\{modalEv\.groupLessonId\}`/);
  assert.match(html, /studentId:item\.student\.id/);
  assert.match(html, /Grupitund kanti õpilaste päevikutesse/);
  assert.match(html, /occurrenceStatuses:\{/);
});

test("calendar series cannot be deleted while several journal entries depend on it", () => {
  assert.match(html, /linkedLessonSnap\.size>1/);
  assert.match(html, /Säilita ajalugu ja tühista sari/);
  assert.doesNotMatch(html, /linkedLessonDoc\.ref\.delete\(\)/);
});

test("unbilled register displays the expected student price before invoicing", () => {
  assert.match(html, /expectedCentsForRow/);
  assert.match(html, /eeldatav/);
  assert.match(html, /hind puudub/);
  assert.match(html, /students=\{students\}/);
  assert.match(html, /tariffAssignments=\{tariffAssignments\}/);
});
