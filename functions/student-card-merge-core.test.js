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
  // the other card's billing mode / weekly lessons / no-show rule come with its subject when they differ (2026-11-06)
  const packaged = core.revenuePlanMerge({ keep, source: { subject: "Eesti keel" }, keepPlan: { lessonPriceCents: 2000, billingMode: "advance", weeklyLessons: 2 }, sourcePlan: { lessonPriceCents: 2500, billingMode: "package", weeklyLessons: 2, chargeNoShow: false } });
  assert.deepEqual(packaged.patch.subjectBilling, { "Eesti keel": { billingMode: "package", chargeNoShow: false } });
  assert.equal("subjectBilling" in add.patch, false);
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

// incident 2026-11-09: two different girls named Stefania were merged
test("different-person signals: the two Stefanias give signals for grade and subject + teacher", () => {
  const math = { name: "Stefania", grade: "10", subject: "Matemaatika", teacher: "Yelyzaveta Lukiianchuk", teacherUid: "y1", level: "10. klass" };
  const estonian = { name: "Stefania", grade: "12. klass", subject: "Eesti keel", teacher: "Pavel", teacherUid: "p1", level: "C1", parentName: "Jelena Shabanova", parentEmail: "jelena@example.com", linkedParentId: "par-j" };
  const signals = core.differentPersonSignals(math, estonian);
  assert.deepEqual(signals.map((s) => s.code), ["grade", "subject_teacher"], "no parent on one card is no parent signal; no surname to compare");
  const labels = signals.map((s) => s.label).join(" | ");
  assert.match(labels, /10\. klass ja 12\. klass/);
  assert.match(labels, /Matemaatika \(Yelyzaveta Lukiianchuk\) ja Eesti keel \(Pavel\)/);
});

test("different-person signals: surname, parents, birth year; the same child gives none", () => {
  const sig = (a, b) => core.differentPersonSignals(a, b).map((s) => s.code);
  assert.deepEqual(sig({ name: "Mari Maasikas" }, { name: "Mari Tamm" }), ["surname"]);
  assert.deepEqual(sig({ name: "Mari Maasikas" }, { name: "Mari" }), [], "one card has only a first name");
  assert.deepEqual(sig({ name: "Mari Maasikas (B1)" }, { name: "mari maasikas" }), []);
  assert.deepEqual(sig({ name: "Vlad Povzhik" }, { name: "Влад Повжик" }), [], "different alphabets are not compared");
  assert.deepEqual(sig({ name: "Ann Kask", nameAliases: ["Ann Tamm"] }, { name: "Ann Tamm" }), [], "an old name counts");
  assert.deepEqual(sig({ name: "A", linkedParentId: "p1" }, { name: "A", parentUid: "p2" }), ["parent"]);
  assert.deepEqual(sig({ name: "A", parentEmail: "ema@x.ee" }, { name: "A", parentEmail: "EMA@x.ee" }), []);
  assert.deepEqual(sig({ name: "A", parentName: "Jelena" }, { name: "A", parentName: "Olga" }), ["parent"]);
  assert.deepEqual(sig({ name: "A", linkedParentIds: ["p1", "p2"] }, { name: "A", linkedParentId: "p2" }), []);
  assert.deepEqual(sig({ name: "A", birthDate: "2010-04-01" }, { name: "A", birthYear: 2008 }), ["birth_year"]);
  assert.deepEqual(sig({ name: "A", personalCode: "61004010000" }, { name: "A", birthYear: 2010 }), []);
  // one child with two subjects but the same teacher, or the same subject with two teachers: no signal
  assert.deepEqual(sig({ name: "A", subject: "Eesti keel", teacher: "Pavel" }, { name: "A", subject: "Inglise keel", teacher: "Pavel Z" }), []);
  assert.deepEqual(sig({ name: "A", subject: "Eesti keel", teacher: "Pavel" }, { name: "A", subject: "Eesti keel", teacher: "Anna" }), []);
  assert.deepEqual(sig({ name: "A", subject: "Eesti keel", teacher: "Pavel" }, { name: "A" }), [], "a card with no subject names none");
  assert.deepEqual(sig({ name: "A", grade: "7" }, { name: "A", enrollments: [{ subject: "Matemaatika", level: "7. klass" }] }), []);
});

test("a moved lesson without a subject gets the other card's subject, also from an archived or multi-subject card", () => {
  assert.equal(core.sourceLessonSubject({ subject: "Matemaatika" }), "Matemaatika");
  assert.equal(core.sourceLessonSubject({ active: false, enrollments: [{ subject: "Matemaatika", active: false, status: "ended" }] }), "Matemaatika");
  assert.equal(core.sourceLessonSubject({ subject: "Matemaatika", enrollments: [{ subject: "Matemaatika" }, { subject: "Eesti keel" }] }), "Matemaatika");
  assert.equal(core.sourceLessonSubject({}), "", "no subject on the card: the lesson is left as it is");
});

test("undo records restore only what still holds the merge's value", () => {
  const entry = core.undoEntry("lessons/l1", { studentId: "src", subject: "Matemaatika", status: "Toimunud" }, { studentId: "keep", mergedFromStudentId: "src" }, "studentId");
  assert.deepEqual(entry.before, { studentId: "src" });
  assert.deepEqual(entry.absent, ["mergedFromStudentId"]);
  const back = core.revertFields({ studentId: "keep", mergedFromStudentId: "src", subject: "Matemaatika" }, entry);
  assert.equal(back.status, "revert");
  assert.deepEqual(back.set, { studentId: "src" });
  assert.deepEqual(back.remove, ["mergedFromStudentId"]);
  assert.equal(core.revertFields({ studentId: "src" }, entry).status, "done", "already back");
  assert.equal(core.revertFields({ studentId: "third" }, entry).status, "conflict", "moved elsewhere since: left alone");
  assert.equal(core.revertFields(null, entry).status, "missing");
  // a field changed after the merge stays and is reported
  const named = core.undoEntry("lessons/l2", { studentId: "src", studentName: "Stefania M" }, { studentId: "keep", studentName: "Stefania" }, "studentId");
  const partly = core.revertFields({ studentId: "keep", studentName: "Stefania Uus" }, named);
  assert.deepEqual(partly.set, { studentId: "src" });
  assert.deepEqual(partly.skipped, ["studentName"]);
  // id lists: the kept id leaves only when the record did not have it before
  const ids = { kind: "ids", path: "groups/g", field: "studentIds", keepId: "keep", sourceId: "src", hadKeep: false };
  assert.deepEqual(core.revertFields({ studentIds: ["x", "keep"] }, ids).set, { studentIds: ["x", "src"] });
  assert.deepEqual(core.revertFields({ studentIds: ["keep", "x"] }, { ...ids, hadKeep: true }).set, { studentIds: ["keep", "x", "src"] });
  assert.equal(core.revertFields({ studentIds: ["x", "src"] }, ids).status, "done");
  assert.ok(core.sameValue({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
  assert.ok(!core.sameValue([1, 2], [2, 1]));
});
