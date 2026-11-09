"use strict";

// Incident 2026-11-09: a self-registered student whose card the teacher had made got a second card `self_<uid>`.
// The card is still created, but likely existing cards are listed for the administrator (never linked automatically).
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CREATED_WITH_POSSIBLE_EXISTING,
  likelyExistingCards,
  planParentChildBootstrap,
  planStudentAccountBootstrap,
  possibleExistingNotice,
  reviewClosedByBootstrap,
} = require("./account-bootstrap-core");

const teacherCard = { id: "card-stefania", name: "Stefania ", parentName: "Jelena Shabanova", linkedParentIds: ["parent-1"], parentEmail: "parent@example.test", active: true };
const ids = matches => matches.map(match => match.student.id);

test("the incident: first name with a trailing space, surname only as the parent's, Š = Sh", () => {
  const plan = planStudentAccountBootstrap({ uid: "kid-uid", email: "kid@example.test", emailVerified: true, displayName: "Stefania Šabanova", students: [teacherCard] });
  assert.equal(plan.status, "create");
  assert.equal(plan.source, "no_exact_match");
  assert.deepEqual(plan.possibleExisting.map(card => card.id), ["card-stefania"]);
  assert.deepEqual(plan.possibleExisting[0].matchReasons, ["surname"]);
});

test("case, diacritics and transliteration do not matter", () => {
  const cards = [
    { id: "a", name: "STEFÁNIA Shabanova" },
    { id: "b", name: "Liis Jõesaar" },
    { id: "c", name: "Daria Žukova" },
    { id: "d", name: "Мария Шабанова" },
  ];
  assert.deepEqual(ids(likelyExistingCards(cards, { name: "  stefania  šabanova " })), ["a"]);
  assert.deepEqual(ids(likelyExistingCards(cards, { name: "Liis Joesaar" })), ["b"]);
  assert.deepEqual(ids(likelyExistingCards(cards, { name: "Daria Zhukova" })), ["c"]);
  assert.deepEqual(ids(likelyExistingCards(cards, { name: "Mariia Shabanova" })), ["d"]);
});

test("a son and a mother: Shabanov matches the parent Shabanova", () => {
  const card = { id: "son", name: "Mark", parentName: "Jelena Shabanova" };
  assert.deepEqual(ids(likelyExistingCards([card], { name: "Mark Shabanov" })), ["son"]);
});

test("siblings with the same surname and parent are never suggested without the same first name", () => {
  const sibling = { id: "sister", name: "Stefania Shabanova", parentName: "Jelena Shabanova", parentEmail: "parent@example.test", phone: "+372 5555 1234" };
  // same surname, same parent, same parent e-mail and phone: another first name stays out
  assert.deepEqual(likelyExistingCards([sibling], { name: "Viktoria Shabanova", email: "parent@example.test", phone: "55551234" }), []);
  const plan = planStudentAccountBootstrap({ uid: "kid-2", email: "viktoria@example.test", displayName: "Viktoria Shabanova", students: [sibling] });
  assert.equal(plan.status, "create");
  assert.deepEqual(plan.possibleExisting, []);
});

test("the same first name alone, or with another surname, is not enough", () => {
  const cards = [{ id: "x", name: "Stefania" }, { id: "y", name: "Stefania Tamm", parentName: "Mari Tamm" }];
  assert.deepEqual(likelyExistingCards(cards, { name: "Stefania Šabanova" }), []);
  assert.deepEqual(likelyExistingCards(cards, { name: "Stefania" }), []);
});

test("the sign-up's e-mail or phone on the card counts together with the first name", () => {
  const cards = [
    { id: "by-phone", name: "Stefania", parentContacts: [{ name: "Jelena", phone: "+372 5123 4567" }] },
    { id: "by-email", name: "Stefania K.", parentEmail: "family@example.test" },
  ];
  const byPhone = likelyExistingCards(cards, { name: "Stefania", phone: "5123 4567" });
  assert.deepEqual(ids(byPhone), ["by-phone"]);
  assert.deepEqual(byPhone[0].reasons, ["phone"]);
  assert.deepEqual(ids(likelyExistingCards(cards, { name: "Stefania", email: " FAMILY@example.test" })), ["by-email"]);
});

test("archived, merged, trashed and already linked cards are left out", () => {
  const base = { name: "Stefania", parentName: "Jelena Shabanova" };
  const cards = [
    { id: "archived", ...base, active: false },
    { id: "merged", ...base, mergedIntoStudentId: "other" },
    { id: "trash", ...base, deletedAt: "2026-11-01" },
    { id: "parent-now", ...base, convertedToParent: true },
    { id: "own", ...base, linkedUserIds: ["kid-uid"] },
    { id: "live", ...base },
  ];
  assert.deepEqual(ids(likelyExistingCards(cards, { uid: "kid-uid", name: "Stefania Shabanova" })), ["live"]);
});

test("a parent's sign-up: the parent's surname finds the child card typed without a surname", () => {
  const plans = planParentChildBootstrap({
    uid: "new-parent", email: "other@example.test", emailVerified: true, displayName: "Jelena Šabanova",
    childNames: ["Stefania"], students: [teacherCard, { id: "sibling", name: "Viktoria", parentName: "Jelena Shabanova" }],
  });
  assert.equal(plans.length, 1);
  assert.equal(plans[0].status, "create");
  assert.deepEqual(plans[0].possibleExisting.map(card => card.id), ["card-stefania"]);
});

test("the administrator's notice carries the created card and the candidates, and the next sign-in does not close it", () => {
  const plan = { relationship: "student", ...planStudentAccountBootstrap({ uid: "kid-uid", displayName: "Stefania Šabanova", students: [teacherCard] }) };
  const notice = possibleExistingNotice(plan, "self_kid-uid");
  assert.equal(notice.reason, CREATED_WITH_POSSIBLE_EXISTING);
  assert.equal(notice.createdStudentId, "self_kid-uid");
  assert.equal(notice.createdStudentName, "Stefania Šabanova");
  assert.deepEqual(notice.candidateStudentIds, ["card-stefania"]);
  assert.equal(notice.relationship, "student");
  assert.equal(reviewClosedByBootstrap(notice), false);
  assert.equal(reviewClosedByBootstrap({ reason: "possible_existing_card" }), true);
  // no candidates or no card: no notice
  assert.equal(possibleExistingNotice({ ...plan, possibleExisting: [] }, "self_kid-uid"), null);
  assert.equal(possibleExistingNotice(plan, ""), null);
});
