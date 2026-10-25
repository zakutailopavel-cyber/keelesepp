"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./missing-data-core");

const YEAR = 2026;
const S = core.DEFAULT_SETTINGS;
const times = { slots: ["Mon-16:00", "Mon-16:30"], preferred: [] };

test("settings: defaults, unknown values fall back", () => {
  assert.deepEqual(core.normalizeSettings({}), { ...S });
  assert.equal(core.normalizeSettings({ items: { phone: "required", email: "nope" } }).phone, "required");
  assert.equal(core.normalizeSettings({ items: { email: "nope" } }).email, "required");
  assert.equal(S.parentName, "optional");
});

test("values: e-mail, Estonian and international phones, class or birth year", () => {
  assert.equal(core.validEmail("mari@example.ee"), true);
  assert.equal(core.validEmail("mari@example"), false);
  assert.equal(core.normalizePhone("5123 4567"), "+37251234567");
  assert.equal(core.normalizePhone("+372 512-3456"), "+3725123456");
  assert.equal(core.normalizePhone("00358 40 123 4567"), "+358401234567");
  assert.equal(core.normalizePhone("+7 912 345 67 89"), "+79123456789");
  assert.equal(core.normalizePhone("12345"), "");
  assert.equal(core.normalizePhone("abc"), "");
  assert.deepEqual(core.gradeValue("5", YEAR), { grade: "5. klass" });
  assert.deepEqual(core.gradeValue("12. klass", YEAR), { grade: "12. klass" });
  assert.equal(core.gradeValue("13", YEAR), null);
  assert.deepEqual(core.gradeValue("2014", YEAR), { birthYear: 2014 });
  assert.equal(core.gradeValue("2025", YEAR), null);
  assert.deepEqual(core.gradeValue("täiskasvanu", YEAR), { grade: "Täiskasvanu" });
});

test("kind of a card: class, birth year, adult mark, parent link or contact, unknown", () => {
  assert.equal(core.cardKind({ grade: "5. klass" }, YEAR), "child");
  assert.equal(core.cardKind({ grade: "Täiskasvanu", linkedParentId: "p" }, YEAR), "adult");
  assert.equal(core.cardKind({ birthYear: 2000 }, YEAR), "adult");
  assert.equal(core.cardKind({ birthYear: 2015 }, YEAR), "child");
  assert.equal(core.cardKind({ linkedParentIds: ["p"] }, YEAR), "child");
  assert.equal(core.cardKind({ parentEmail: "ema@example.ee" }, YEAR), "child");
  assert.equal(core.cardKind({ linkedUserId: "s" }, YEAR), "unknown");
});

test("missing items: adult own contacts, child the parent's contacts and class", () => {
  const adult = core.cardStatus({ card: { grade: "Täiskasvanu", email: "a@b.ee" }, availability: null, parents: [] }, S, YEAR);
  assert.deepEqual(adult.missing, ["availability", "phone", "language"]);
  assert.deepEqual(adult.required, ["availability", "language"]);
  const child = core.cardStatus({ card: { linkedParentId: "p" }, availability: times, parents: [{ uid: "p", displayName: "Ema Tamm", email: "ema@x.ee", preferredLanguage: "ru" }] }, S, YEAR);
  assert.deepEqual(child.missing, ["phone", "grade"]);
  assert.deepEqual(child.required, ["grade"]);
  // a contact without an account counts as the parent's data
  const contact = core.cardStatus({ card: { grade: "3. klass", parentContacts: [{ name: "Isa Tamm", email: "isa@x.ee", phone: "+37255555555" }], preferredLanguage: "et" }, availability: times, parents: [] }, S, YEAR);
  assert.deepEqual(contact.missing, []);
  // switched off items are never asked
  const off = core.cardStatus({ card: { grade: "Täiskasvanu" }, availability: null, parents: [] }, { ...S, availability: "off", phone: "off" }, YEAR);
  assert.deepEqual(off.missing, ["email", "language"]);
  // unknown: grade decides; with grade off the card is read as an adult
  const unknown = core.cardStatus({ card: { linkedUserId: "s" }, availability: times, parents: [] }, S, YEAR);
  assert.equal(unknown.kind, "unknown");
  assert.deepEqual(unknown.variants.child, ["email", "phone", "parentName", "language", "grade"]);
  assert.equal(core.cardStatus({ card: { linkedUserId: "s" }, availability: times, parents: [] }, { ...S, grade: "off" }, YEAR).kind, "adult");
});

test("questions: a parent with two children answers per child; language and phone once on the profile", () => {
  const kids = [
    { id: "k1", name: "Mari", linkedParentId: "p1", grade: "4. klass" },
    { id: "k2", name: "Jüri", linkedParentId: "p1" },
  ];
  const facts = new Map(kids.map((card) => [card.id, { card, availability: card.id === "k1" ? times : null, parents: [] }]));
  const q = core.questionsFor({ uid: "p1", roles: [{ role: "parent", cards: kids }], profile: { displayName: "Ema Tamm", email: "ema@x.ee" } }, facts, S, YEAR);
  assert.deepEqual(q.cards.map((card) => [card.studentId, card.ask]), [["k2", ["availability", "grade"]]]);
  assert.deepEqual(q.profile.ask, ["phone", "language"]);
  assert.deepEqual(q.profile.required, ["language"]);
  assert.equal(core.blocks(q), true);
  // the parent's own language already known → the children do not miss it
  const q2 = core.questionsFor({ uid: "p1", roles: [{ role: "parent", cards: kids }], profile: { displayName: "Ema Tamm", email: "ema@x.ee", preferredLanguage: "ru", phone: "+3725" } }, facts, S, YEAR);
  assert.deepEqual(q2.profile.ask, []);
  // nothing required missing → no gate
  const q3 = core.questionsFor({ uid: "p1", roles: [{ role: "parent", cards: [kids[0]] }], profile: { displayName: "Ema Tamm", email: "ema@x.ee", preferredLanguage: "ru" } }, facts, S, YEAR);
  assert.equal(core.blocks(q3), false);
  assert.deepEqual(q3.profile.ask, ["phone"]);
});

test("questions: a student of unknown age gets both variants and the account e-mail as a hint", () => {
  const card = { id: "s1", name: "Kai", linkedUserId: "u1" };
  const q = core.questionsFor({ uid: "u1", roles: [{ role: "student", cards: [card] }], profile: { email: "kai@x.ee" } }, new Map([["s1", { card, availability: null, parents: [] }]]), S, YEAR);
  assert.equal(q.cards[0].kind, "unknown");
  assert.deepEqual(q.cards[0].variants.adult, ["availability", "email", "phone", "language"]);
  assert.equal(q.cards[0].accountEmail, "kai@x.ee");
  assert.deepEqual(q.cards[0].required, ["availability", "email", "language", "grade"]);
});

test("patch: only asked fields, validated, adult vs child targets, required ones enforced", () => {
  const adultQ = { studentId: "a", kind: "adult", role: "student", ask: ["availability", "email", "phone", "language"], required: ["availability", "email", "language"] };
  const ok = core.cardPatch(adultQ, { availability: { slots: ["Mon-16:00", "Mon-16:30", "Xyz-1"], preferred: ["Mon-16:00", "Tue-10:00"] }, email: "Kai@X.ee", phone: "5123 4567", language: "ru", name: "Hacker", teacher: "x" }, YEAR);
  assert.deepEqual(ok.errors, {});
  assert.deepEqual(ok.student, { email: "kai@x.ee", phone: "+37251234567", preferredLanguage: "ru" });
  assert.deepEqual(ok.availability, { slots: ["Mon-16:00", "Mon-16:30"], preferred: ["Mon-16:00"] });
  const bad = core.cardPatch(adultQ, { email: "nope", phone: "12", language: "de" }, YEAR);
  assert.deepEqual(bad.errors, { availability: "required", email: "email", phone: "phone", language: "language" });

  const childQ = { studentId: "c", kind: "child", role: "student", ask: ["email", "phone", "parentName", "grade"], required: ["email", "grade"] };
  const child = core.cardPatch(childQ, { email: "ema@x.ee", phone: "+358401234567", parentName: "Ema Tamm", grade: "2015" }, YEAR);
  assert.deepEqual(child.student, { birthYear: 2015, parentEmail: "ema@x.ee", parentPhone: "+358401234567", parentName: "Ema Tamm" });
  assert.equal(core.cardPatch(childQ, { email: "ema@x.ee", grade: "7", parentName: "Ema" }, YEAR).errors.parentName, "name");

  // unknown: „Täiskasvanu” → own e-mail; a class → the parent's e-mail
  const unknownQ = { studentId: "u", kind: "unknown", role: "student", ask: ["grade", "email"], variants: { adult: ["email"], child: ["email", "parentName"] }, required: ["grade", "email"] };
  assert.deepEqual(core.cardPatch(unknownQ, { grade: "Täiskasvanu", email: "me@x.ee" }, YEAR).student, { grade: "Täiskasvanu", email: "me@x.ee" });
  assert.deepEqual(core.cardPatch(unknownQ, { grade: "6. klass", email: "ema@x.ee", parentName: "Ema Tamm" }, YEAR).student, { grade: "6. klass", parentEmail: "ema@x.ee", parentName: "Ema Tamm" });
  assert.equal(core.cardPatch(unknownQ, { email: "me@x.ee" }, YEAR).errors.grade, "required");

  const profile = core.profilePatch({ ask: ["phone", "language"], required: ["language"] }, { phone: "", language: "en" });
  assert.deepEqual(profile, { profile: { preferredLanguage: "en" }, errors: {} });
  assert.deepEqual(core.profilePatch({ ask: ["language"], required: ["language"] }, {}).errors, { language: "required" });
});

test("report: who misses what, who has an account and would see the form", () => {
  const students = [
    { id: "a", name: "Aadu", grade: "Täiskasvanu", email: "a@x.ee", phone: "+3725", preferredLanguage: "et", linkedUserId: "ua" },
    { id: "b", name: "Bert", linkedParentId: "pb", grade: "5. klass" },
    { id: "c", name: "Cärolin", parentName: "Ema Tamm" },
    { id: "d", name: "Dead", active: false },
    { id: "e", name: "Eva", linkedUserId: "pending" },
  ];
  const users = new Map([["ua", { role: "student" }], ["pb", { role: "parent", displayName: "Isa", email: "isa@x.ee", preferredLanguage: "ru", phone: "+3726" }], ["pending", { role: "student", approvalStatus: "pending" }]]);
  const rows = core.reportRows(students, new Map([["a", times]]), users, S, YEAR);
  assert.deepEqual(rows.map((row) => [row.studentId, row.account, row.missing, row.wouldSee]), [
    ["a", "student", [], false],
    ["b", "parent", ["availability"], true],
    ["c", "none", ["availability", "email", "phone", "language", "grade"], false],
    ["e", "none", ["availability", "email", "phone", "language", "grade"], false],
  ]);
  const totals = core.reportTotals(rows);
  assert.equal(totals.cards, 4);
  assert.equal(totals.wouldSee, 1);
  assert.equal(totals.missingWithoutAccount, 2);
  assert.deepEqual(totals.items.availability, { cards: 3, withAccount: 1, withoutAccount: 2 });
});
