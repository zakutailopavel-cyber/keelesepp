"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./student-card-merge-core");

test("collections are sorted into learner, schedule, finance; history and per-card documents are never scanned", () => {
  assert.equal(core.kindOf("lessons"), "learner");
  assert.equal(core.kindOf("schedule"), "schedule");
  assert.equal(core.kindOf("invoices"), "finance");
  assert.equal(core.kindOf("payerCredits"), "finance");
  for (const name of ["activityLog", "financialAudit", "students", "users", "studentRevenuePlans", "whiteboards"]) assert.ok(core.NEVER.has(name), name);
});

test("parents of both cards are united; different parents are flagged", () => {
  const merged = core.mergeParents(
    { linkedParentId: "p1", parentName: "Ema", parentEmail: "Ema@Example.com" },
    { linkedParentIds: ["p2"], parentName: "Isa", parentEmail: "isa@example.com", parentContacts: [{ name: "Ema", email: "ema@example.com", phone: "555" }] },
  );
  assert.deepEqual(merged.linkedParentIds, ["p1", "p2"]);
  assert.equal(merged.linkedParentId, "p1");
  assert.deepEqual(merged.parentContacts.map((c) => [c.name, c.email, c.phone]), [["Ema", "ema@example.com", "555"], ["Isa", "isa@example.com", ""]]);
  assert.equal(merged.differ, true);
  const same = core.mergeParents({ linkedParentId: "p1" }, { parentUid: "p1" });
  assert.equal(same.differ, false);
  assert.equal(core.mergeParents({}, { linkedParentId: "p1" }).differ, false, "one side without a parent is no conflict");
});

test("profile patch fills only what the kept card lacks, joins notes, adds skills", () => {
  const patch = core.profilePatch(
    { name: "A", email: "", phone: "1", contactNotes: "x", skillMap: { a: 1 }, parentName: "Ema" },
    { name: "B", email: "b@example.com", phone: "2", grade: "7", contactNotes: "y", skillMap: { a: 5, b: 2 }, linkedUserId: "u", subject: "Matemaatika", parentName: "Isa", active: false },
  );
  assert.equal(patch.email, "b@example.com");
  assert.equal(patch.phone, undefined);
  assert.equal(patch.grade, "7");
  assert.match(patch.contactNotes, /^x\n— B: y$/);
  assert.deepEqual(patch.skillMap, { a: 1, b: 2 });
  for (const field of ["name", "linkedUserId", "subject", "parentName", "active"]) assert.equal(field in patch, false, field);
});

test("price: the other card's price becomes its subject's price; the same subject with two prices is a conflict", () => {
  const keep = { subject: "Inglise keel", teacher: "Anna" };
  const add = core.revenuePlanMerge({ keep, source: { subject: "Eesti keel" }, keepPlan: { lessonPriceCents: 2000 }, sourcePlan: { lessonPriceCents: 2500, lessonMinutes: 45 } });
  assert.equal(add.action, "addSubjectPrice");
  assert.deepEqual(add.patch.subjectPrices, { "Eesti keel": { lessonPriceCents: 2500, lessonMinutes: 45 } });
  const conflict = core.revenuePlanMerge({ keep, source: { subject: "Inglise keel" }, keepPlan: { lessonPriceCents: 2000 }, sourcePlan: { lessonPriceCents: 2500 } });
  assert.deepEqual([conflict.action, conflict.keepCents, conflict.sourceCents], ["conflict", 2000, 2500]);
  assert.equal(core.revenuePlanMerge({ keep, source: { subject: "Inglise keel" }, keepPlan: { lessonPriceCents: 2000 }, sourcePlan: { lessonPriceCents: 2000 } }).action, "same");
  assert.equal(core.revenuePlanMerge({ keep, source: {}, keepPlan: null, sourcePlan: { lessonPriceCents: 2000 } }).action, "copy");
  assert.equal(core.revenuePlanMerge({ keep, source: {}, keepPlan: { lessonPriceCents: 1 }, sourcePlan: null }).action, "none");
  const existing = core.revenuePlanMerge({ keep, source: { subject: "Matemaatika" }, keepPlan: { lessonPriceCents: 2000, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 } } }, sourcePlan: { lessonPriceCents: 2800 } });
  assert.equal(existing.action, "conflict");
});

test("conflicts list names, parents, prices, teachers, levels, documents, pets and accounts", () => {
  const list = core.mergeConflicts({
    keep: { name: "Milan", subject: "Eesti keel", teacher: "Pavel", level: "A2", linkedUserId: "u1" },
    source: { name: "Milan G", enrollments: [{ subject: "Eesti keel", teacher: "Elena" }, { subject: "Inglise keel", teacher: "Anna" }], linkedUserId: "u2" },
    parents: { differ: true },
    plan: { action: "conflict", subject: "Eesti keel", keepCents: 2000, sourceCents: 2500 },
    singletons: [{ collection: "studentAvailability", action: "keep" }, { collection: "studentRevenuePlans", action: "keep" }, { collection: "whiteboards", action: "copy" }],
    pets: { keep: true, source: true },
  });
  assert.deepEqual(list.map((c) => c.code), ["name", "parents", "price", "teacher", "doc:studentAvailability", "pet", "accounts"]);
  assert.match(list[2].label, /20,00 €.*25,00 €/);
  const level = core.mergeConflicts({ keep: { subject: "Eesti keel", teacher: "Pavel", level: "A2" }, source: { subject: "Eesti keel", teacher: "Pavel Z", level: "B1" } });
  assert.deepEqual(level.map((c) => c.code), ["level"]);
});

test("input: two different cards required", () => {
  assert.throws(() => core.normalizedInput({ keepId: "a", sourceId: "a" }), /Two different/);
  assert.deepEqual(core.normalizedInput({ keepId: " a ", sourceId: "b", keepName: " Milan " }), { keepId: "a", sourceId: "b", keepName: "Milan" });
});

test("archived cards: the merged card is active when either card was, unless chosen; the choice is shown", () => {
  assert.equal(core.resultActive({ active: true }, { active: false }), true);
  assert.equal(core.resultActive({ active: false }, { active: true }), true);
  assert.equal(core.resultActive({ active: false }, { active: false }), false);
  assert.equal(core.resultActive({}, {}), true, "a card without the field is active");
  assert.equal(core.resultActive({ active: true }, { active: false }, false), false, "the administrator's choice wins");
  assert.equal(core.resultActive({ active: false }, { active: false }, true), true);
  const codes = (keep, source, activeAfter) => core.mergeConflicts({ keep, source, activeAfter }).map((c) => c.code);
  assert.deepEqual(codes({ name: "A", active: true }, { name: "A", active: false }, true), ["archived_source"]);
  assert.deepEqual(codes({ name: "A", active: false }, { name: "A", active: true }, true), ["archived_keep"]);
  assert.deepEqual(codes({ name: "A", active: false }, { name: "A", active: false }, false), ["archived_result"]);
  assert.deepEqual(codes({ name: "A", active: true }, { name: "A", active: true }, true), []);
});

test("the tracks of an archived other card come over as ended; its teacher gets no access back", () => {
  const { mergeEnrollments } = require("./student-enrollments-core");
  const keep = { active: true, subject: "Eesti keel", teacher: "Pavel", teacherUid: "p1", teacherUids: ["p1"] };
  const source = { active: false, enrollments: [{ subject: "Eesti keel", teacher: "Anna", teacherUid: "a1" }, { subject: "Matemaatika", teacher: "Yelyzaveta", teacherUid: "y1" }], teacherUids: ["a1", "y1"] };
  const merged = mergeEnrollments(keep, core.sourceForTracks(source, true));
  assert.deepEqual(merged.enrollments.map((t) => [t.subject, t.teacherUid, t.active, t.status || ""]), [
    ["Eesti keel", "p1", true, ""], ["Eesti keel", "a1", false, "ended"], ["Matemaatika", "y1", false, "ended"],
  ]);
  assert.deepEqual(merged.teacherUids, ["p1"]);
  // the same track on both cards stays as the kept card has it
  const twin = mergeEnrollments(keep, core.sourceForTracks({ active: false, subject: "Eesti keel", teacher: "Pavel Z", teacherUid: "p1" }, true));
  assert.deepEqual(twin.enrollments.map((t) => [t.subject, t.active, t.status || ""]), [["Eesti keel", true, ""]]);
  // an active other card, or an archived result, keeps the tracks as they are
  assert.equal(core.sourceForTracks({ ...source, active: true }, true).enrollments, source.enrollments);
  assert.equal(core.sourceForTracks(source, false), source);
});
