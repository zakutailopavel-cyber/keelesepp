"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const core = require("./announcements-core");

const base = (extra = {}) => core.normalizeAnnouncement("a1", {
  title: "Uus õppeaasta", body: "Tere!", audience: "both", activeFrom: "2026-10-20", activeTo: "2026-10-31",
  responseType: "read", status: "published", publishedAt: "2026-10-20T08:00:00.000Z", ...extra,
});
const mari = { id: "s1", name: "Mari", active: true, subject: "Eesti keel", level: "B1", linkedUserId: "stu1", linkedParentId: "par1" };
const juri = { id: "s2", name: "Jüri", active: true, enrollments: [{ subject: "Matemaatika", level: "7. klass" }, { subject: "Eesti keel", level: "A2" }], linkedParentIds: ["par1", "par2"] };
const old = { id: "s3", name: "Vana", active: false, linkedUserId: "stu3" };

test("normalize: unknown values fall back, lists are bounded, dates must be ISO days", () => {
  const item = core.normalizeAnnouncement("x", { audience: "all", responseType: "poll", status: "live", activeFrom: "20.10.2026", subjects: ["eesti KEEL", ""], question: { mode: "single", options: ["Jah", "Jah", "Ei"], allowOther: true } });
  assert.equal(item.audience, "both");
  assert.equal(item.responseType, "read");
  assert.equal(item.status, "draft");
  assert.equal(item.activeFrom, "");
  assert.deepEqual(item.subjects, ["Eesti keel"]);
  assert.deepEqual(item.question, { mode: "single", options: ["Jah", "Ei"], allowOther: true });
  assert.deepEqual(core.normalizeAnnouncement("x", { question: { mode: "text", options: ["a"], allowOther: true } }).question, { mode: "text", options: [], allowOther: false });
});

test("active window: published, from–to inclusive; drafts and archived never", () => {
  assert.equal(core.isActive(base(), "2026-10-19"), false);
  assert.equal(core.isActive(base(), "2026-10-20"), true);
  assert.equal(core.isActive(base(), "2026-10-31"), true);
  assert.equal(core.isActive(base(), "2026-11-01"), false);
  assert.equal(core.isVisible(base(), "2026-11-01"), true, "ended ones stay readable");
  assert.equal(core.isActive(base({ activeTo: "" }), "2027-05-01"), true, "no end date");
  assert.equal(core.isVisible(base({ status: "draft" }), "2026-10-25"), false);
  assert.equal(core.isVisible(base({ status: "archived" }), "2026-10-25"), false);
});

test("audience: subject + level on one enrollment, chosen students, inactive cards out", () => {
  assert.equal(core.cardMatches(base(), mari), true);
  assert.equal(core.cardMatches(base(), old), false);
  assert.equal(core.cardMatches(base({ subjects: ["Matemaatika"] }), mari), false);
  assert.equal(core.cardMatches(base({ subjects: ["Matemaatika"] }), juri), true);
  assert.equal(core.cardMatches(base({ subjects: ["Matemaatika"], levels: ["A2"] }), juri), false, "math is not A2");
  assert.equal(core.cardMatches(base({ subjects: ["Eesti keel"], levels: ["A2"] }), juri), true);
  assert.equal(core.cardMatches(base({ levels: ["B1"] }), mari), true);
  assert.equal(core.cardMatches(base({ studentIds: ["s2"] }), mari), false);
  assert.equal(core.cardMatches(base({ studentIds: ["s2"] }), juri), true);
  assert.equal(core.cardMatches(base(), { ...mari, convertedToParent: true }), false);
});

test("caller targets: student once, parent once for „Loetud”, per child otherwise; audience respected", () => {
  assert.deepEqual(core.targetsForCaller(base(), { uid: "stu1", role: "student", cards: [mari] }).map((t) => t.key), ["u_stu1"]);
  assert.deepEqual(core.targetsForCaller(base({ audience: "parents" }), { uid: "stu1", role: "student", cards: [mari] }), []);
  assert.deepEqual(core.targetsForCaller(base({ audience: "students" }), { uid: "par1", role: "parent", cards: [mari, juri] }), []);
  const read = core.targetsForCaller(base(), { uid: "par1", role: "parent", cards: [mari, juri] });
  assert.deepEqual(read.map((t) => [t.key, t.studentName]), [["p_par1", "Jüri, Mari"]]);
  const perChild = core.targetsForCaller(base({ responseType: "availability" }), { uid: "par1", role: "parent", cards: [mari, juri] });
  assert.deepEqual(perChild.map((t) => [t.key, t.studentId]), [["c_s2", "s2"], ["c_s1", "s1"]]);
  assert.deepEqual(core.targetsForCaller(base({ responseType: "question", subjects: ["Matemaatika"] }), { uid: "par1", role: "parent", cards: [mari, juri] }).map((t) => t.key), ["c_s2"]);
  assert.deepEqual(core.targetsForCaller(base(), { uid: "stu3", role: "student", cards: [old] }), []);
});

test("all targets for the report: only approved student / parent accounts; two parents share a child", () => {
  const users = new Map([
    ["stu1", { role: "student", displayName: "Mari M" }],
    ["par1", { role: "parent", displayName: "Ema" }],
    ["par2", { role: "parent", displayName: "Isa", approvalStatus: "pending" }],
    ["stu3", { role: "student" }],
  ]);
  const read = core.allTargets(base(), [mari, juri, old], users);
  assert.deepEqual(read.map((t) => t.key).sort(), ["p_par1", "u_stu1"]);
  assert.equal(read.find((t) => t.key === "p_par1").studentName, "Jüri, Mari");
  const times = core.allTargets(base({ responseType: "availability" }), [mari, juri], new Map([...users, ["par2", { role: "parent", displayName: "Isa" }]]));
  assert.deepEqual(times.map((t) => t.key).sort(), ["c_s1", "c_s2", "u_stu1"]);
  assert.deepEqual(times.find((t) => t.key === "c_s2").names, ["Ema", "Isa"]);
});

test("answers: read, free text, one choice, several choices, other", () => {
  assert.deepEqual(core.validateAnswer(base(), {}), { acknowledged: true });
  const text = base({ responseType: "question", question: { mode: "text" } });
  assert.throws(() => core.validateAnswer(text, { text: "  " }), /Vastus puudub/);
  assert.deepEqual(core.validateAnswer(text, { text: " Jah " }), { text: "Jah" });
  const single = base({ responseType: "question", question: { mode: "single", options: ["Jah", "Ei"], allowOther: true } });
  assert.deepEqual(core.validateAnswer(single, { choices: ["Ei"] }), { choices: ["Ei"], other: "" });
  assert.deepEqual(core.validateAnswer(single, { other: "Võib-olla" }), { choices: [], other: "Võib-olla" });
  assert.throws(() => core.validateAnswer(single, { choices: ["Jah", "Ei"] }), /üks/);
  assert.throws(() => core.validateAnswer(single, { choices: ["Jah"], other: "x" }), /üks/);
  assert.throws(() => core.validateAnswer(single, { choices: ["Hack"] }), /Tundmatu/);
  assert.throws(() => core.validateAnswer(single, {}), /Vali vastus/);
  const multi = base({ responseType: "question", question: { mode: "multiple", options: ["E", "T", "K"] } });
  assert.deepEqual(core.validateAnswer(multi, { choices: ["E", "K", "E"] }), { choices: ["E", "K"], other: "" });
  assert.throws(() => core.validateAnswer(multi, { choices: ["E"], other: "x" }), /ei ole lubatud/);
});

test("suitable times must be saved after publishing", () => {
  const ann = base({ responseType: "availability" });
  assert.throws(() => core.availabilitySnapshot(ann, null), /märkimata/);
  assert.throws(() => core.availabilitySnapshot(ann, { slots: ["Mon-17:00"], changedAt: "2026-10-19T10:00:00.000Z" }), /uuesti/);
  assert.deepEqual(core.availabilitySnapshot(ann, { slots: ["Mon-17:00", "Mon-17:30"], preferred: ["Mon-17:00", "Tue-09:00"], changedAt: "2026-10-21T10:00:00.000Z" }), { slots: ["Mon-17:00", "Mon-17:30"], preferred: ["Mon-17:00"] });
});

test("learner view: pending oldest first, answered and ended in the past list, no audience data", () => {
  const first = base({ activeFrom: "2026-10-18", studentIds: ["s1"], subjects: ["Eesti keel"] });
  const second = core.normalizeAnnouncement("a2", { title: "Küsimus", audience: "both", activeFrom: "2026-10-21", status: "published", responseType: "question", question: { mode: "text" } });
  const ended = core.normalizeAnnouncement("a3", { title: "Vana", audience: "both", activeFrom: "2026-09-01", activeTo: "2026-09-30", status: "published" });
  const done = core.normalizeAnnouncement("a4", { title: "Tehtud", audience: "both", activeFrom: "2026-10-01", status: "published" });
  const target = { key: "u_stu1", kind: "student", studentId: "s1", studentName: "Mari" };
  const view = core.learnerView([
    { announcement: second, target }, { announcement: first, target }, { announcement: ended, target },
    { announcement: done, target, response: { answer: { acknowledged: true }, answeredAt: "2026-10-02T10:00:00.000Z" } },
  ], "2026-10-24");
  assert.deepEqual(view.pending.map((item) => item.announcement.id), ["a1", "a2"]);
  assert.deepEqual(view.past.map((item) => item.announcement.id), ["a4", "a3"]);
  assert.equal("studentIds" in view.pending[0].announcement, false);
  assert.equal("subjects" in view.pending[0].announcement, false);
  assert.equal(view.past[0].response.answeredAt, "2026-10-02T10:00:00.000Z");
});

test("report rows: not answered first, answer as text", () => {
  const ann = base({ responseType: "question", question: { mode: "multiple", options: ["E", "T"], allowOther: true } });
  const rows = core.reportRows(ann, [
    { key: "u_a", kind: "student", names: ["Anna"], studentId: "s9", studentName: "Anna" },
    { key: "u_b", kind: "student", names: ["Berit"], studentId: "s8", studentName: "Berit" },
  ], new Map([["u_a", { answer: { choices: ["E"], other: "laupäev" }, answeredAt: "2026-10-22T09:00:00.000Z" }]]));
  assert.deepEqual(rows.map((row) => [row.key, row.answered, row.answerText]), [["u_b", false, ""], ["u_a", true, "E; Muu: laupäev"]]);
});
