const test = require("node:test");
const assert = require("node:assert/strict");
const { parentToStudentPlan } = require("./parent-to-student-core");

const card = { id: "card-1", name: "Veronika Bistrova", linkedParentIds: ["u1"], linkedParentId: "u1", parentUid: "u1", linkedUserIds: [], email: "" };

test("an adult registered as her own parent becomes the learner on her card", () => {
  const { studentPatch, userPatch, keepParent } = parentToStudentPlan({ uid: "u1", student: card, profile: { role: "parent", childName: "Veronika Bistrova" }, email: "Vero@Mail.com" });
  assert.equal(keepParent, false);
  assert.deepEqual(studentPatch.linkedParentIds, []);
  assert.equal(studentPatch.linkedParentId, null);
  assert.equal(studentPatch.parentUid, null);
  assert.deepEqual(studentPatch.linkedUserIds, ["u1"]);
  assert.equal(studentPatch.linkedUserId, "u1");
  assert.equal(studentPatch.studentUid, "u1");
  assert.equal(studentPatch.email, "vero@mail.com");
  assert.equal(userPatch.role, "student");
  assert.deepEqual(userPatch.roles, ["student"]);
  assert.equal(userPatch.childName, null);
  assert.deepEqual(userPatch.linkedStudentIds, ["card-1"]);
});

test("another parent of the card stays; a parent of other children keeps the parent role", () => {
  const student = { ...card, linkedParentIds: ["u1", "u2"], linkedUserId: "old", studentUid: "old", linkedUserIds: ["old"] };
  const { studentPatch, userPatch, keepParent } = parentToStudentPlan({ uid: "u1", student, profile: { role: "parent", roles: ["parent"] }, otherChildren: 1 });
  assert.equal(keepParent, true);
  assert.deepEqual(studentPatch.linkedParentIds, ["u2"]);
  assert.equal(studentPatch.linkedParentId, "u2");
  assert.deepEqual(studentPatch.linkedUserIds, ["old", "u1"]);
  assert.equal(studentPatch.linkedUserId, "old");
  assert.equal(userPatch.role, "parent");
  assert.deepEqual(userPatch.roles, ["parent", "student"]);
});

test("refuses a card the account is not a parent of, a staff account and an archived card", () => {
  assert.throws(() => parentToStudentPlan({ uid: "u9", student: card, profile: { role: "parent" } }), /ei ole selle kaardi lapsevanem/);
  assert.throws(() => parentToStudentPlan({ uid: "u1", student: card, profile: { role: "teacher" }, staffRoles: ["teacher", "admin"] }), /Töötaja/);
  assert.throws(() => parentToStudentPlan({ uid: "u1", student: { ...card, active: false }, profile: { role: "parent" } }), /ei ole aktiivne/);
});
