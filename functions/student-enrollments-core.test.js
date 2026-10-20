"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { subjectName, enrollmentsOf, mergeEnrollments, cardSubject } = require("./student-enrollments-core");

test("one subject name however it was typed", () => {
  assert.equal(subjectName("Inglise Keel"), "Inglise keel");
  assert.equal(subjectName(" matemaatika "), "Matemaatika");
  assert.equal(subjectName(""), "");
});

test("an old card's top-level subject is its one enrollment", () => {
  const [track] = enrollmentsOf({ subject: "Matemaatika", teacher: "Yelyzaveta", teacherUid: "y1", level: "7. klass" });
  assert.equal(track.subject, "Matemaatika");
  assert.equal(track.teacherUid, "y1");
  assert.equal(track.active, true);
});

test("merging a maths card into an Estonian card adds maths as a second subject", () => {
  const keep = { subject: "Eesti keel", teacher: "Pavel", teacherUid: "p1", teacherUids: ["p1"] };
  const source = { subject: "Matemaatika", teacher: "Yelyzaveta", teacherUid: "y1" };
  const result = mergeEnrollments(keep, source);
  assert.deepEqual(result.enrollments.map((item) => item.subject), ["Eesti keel", "Matemaatika"]);
  assert.deepEqual(result.added.map((item) => item.subject), ["Matemaatika"]);
  assert.deepEqual(result.teacherUids.sort(), ["p1", "y1"]);
});

test("a duplicate card of the same subject and teacher adds nothing, only fills what is missing", () => {
  const keep = { subject: "Eesti keel", teacher: "Pavel" };
  const source = { subject: "Eesti keel", teacher: "Pavel Zakutailo", teacherUid: "p1", level: "B1" };
  const result = mergeEnrollments(keep, source);
  assert.equal(result.enrollments.length, 1);
  assert.equal(result.added.length, 0);
  assert.equal(result.enrollments[0].teacherUid, "p1");
  assert.equal(result.enrollments[0].level, "B1");
});

test("the same subject with two different teachers stays two enrollments", () => {
  const result = mergeEnrollments({ subject: "Eesti keel", teacher: "Pavel", teacherUid: "p1" }, { subject: "Eesti keel", teacher: "Elena", teacherUid: "e1" });
  assert.equal(result.enrollments.length, 2);
});

test("a record without a subject belongs to the card's only subject", () => {
  assert.equal(cardSubject({ subject: "Matemaatika" }), "Matemaatika");
  assert.equal(cardSubject({ enrollments: [{ subject: "Eesti keel" }, { subject: "Matemaatika" }] }), "");
});

test("a teacher with a uid on one card and only a different name on the other stays a separate enrollment", () => {
  const result = mergeEnrollments({ subject: "Eesti keel", teacher: "Pavel", teacherUid: "p1" }, { subject: "Eesti keel", teacher: "Elena" });
  assert.equal(result.enrollments.length, 2);
  const empty = mergeEnrollments({ subject: "Eesti keel", teacher: "Elena Zakutailo" }, { subject: "Eesti keel", teacher: "" });
  assert.equal(empty.enrollments.length, 1);
});
