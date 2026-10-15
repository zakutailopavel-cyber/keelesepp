"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parentInviteInput, parentInvitePlan, parentCardPatch } = require("./parent-invite-core");
const { composeInviteEmail } = require("./student-invite-core");

test("name and e-mail are required; the e-mail is lower-cased; cards are unique and at most 10", () => {
  assert.deepEqual(parentInviteInput({ email: " Mum@Mail.RU ", displayName: " Olga  Smirnova ", phone: "+372 5", studentIds: ["a", "a", "b", ""] }),
    { email: "mum@mail.ru", displayName: "Olga Smirnova", phone: "+372 5", studentIds: ["a", "b"] });
  assert.throws(() => parentInviteInput({ email: "mum@mail.ru" }), /nimi/);
  assert.throws(() => parentInviteInput({ email: "mum", displayName: "O" }), { status: 400 });
  assert.throws(() => parentInviteInput({ email: "m@x.ee", displayName: "O", studentIds: Array.from({ length: 11 }, (_, i) => `s${i}`) }), /10/);
  assert.deepEqual(parentInviteInput({ email: "m@x.ee", displayName: "O" }).studentIds, []);
});

test("a new e-mail gets a new account linked to every chosen card", () => {
  assert.deepEqual(parentInvitePlan({ cards: [{ id: "a", name: "Misha" }, { id: "b", name: "Anna" }] }), { action: "create", link: ["a", "b"] });
});

test("an existing parent login is linked only to the cards it is not on yet", () => {
  const plan = parentInvitePlan({ cards: [{ id: "a", linkedParentIds: ["mum"] }, { id: "b" }], existing: { uid: "mum" }, existingProfile: { role: "parent" } });
  assert.deepEqual(plan, { action: "existing", uid: "mum", link: ["b"] });
});

test("never a staff login, never the child's own login, never an archived card", () => {
  assert.throws(() => parentInvitePlan({ cards: [{ id: "a" }], existing: { uid: "t" }, existingProfile: { role: "teacher" } }), /töötaja/);
  assert.throws(() => parentInvitePlan({ cards: [{ id: "a" }], existing: { uid: "t" }, existingProfile: { role: "parent", roles: ["admin"] } }), /töötaja/);
  assert.throws(() => parentInvitePlan({ cards: [{ id: "a", name: "Misha", studentUid: "kid" }], existing: { uid: "kid" }, existingProfile: { role: "student" } }), /Misha enda konto/);
  assert.throws(() => parentInvitePlan({ cards: [{ id: "a", active: false }] }), { status: 404 });
  assert.throws(() => parentInvitePlan({ cards: [null] }), { status: 404 });
});

test("a card learns the parent's name and e-mail only where it has none", () => {
  const parent = { displayName: "Olga", email: "o@x.ee" };
  assert.deepEqual(parentCardPatch({}, parent), { parentName: "Olga", parentEmail: "o@x.ee" });
  assert.deepEqual(parentCardPatch({ parentName: "Igor", parentEmail: "i@x.ee" }, parent), {});
});

test("the parent's e-mail names the children", () => {
  const mail = composeInviteEmail({ name: "Olga", email: "o@x.ee", link: "l", children: ["Misha", "<Anna>"] });
  assert.match(mail.text, /Lapsed: Misha, <Anna>/);
  assert.match(mail.text, /Дети: Misha/);
  assert.match(mail.html, /Misha, &lt;Anna&gt;/);
  assert.doesNotMatch(composeInviteEmail({ email: "o@x.ee", link: "l" }).text, /Lapsed/);
});
