"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { inviteEmailAddress, invitePlan, composeInviteEmail } = require("./student-invite-core");

test("the e-mail is required, trimmed and lower-cased", () => {
  assert.equal(inviteEmailAddress("  Misha.S@Mail.RU "), "misha.s@mail.ru");
  assert.throws(() => inviteEmailAddress(""), { status: 400 });
  assert.throws(() => inviteEmailAddress("misha"), { status: 400 });
});

test("a card without a student account gets a new account", () => {
  assert.deepEqual(invitePlan({ student: { name: "Mihhail Smirnov" }, email: "m@x.ee", parentIds: ["mum"] }), { action: "create" });
});

test("the student's own account on the card gets a new password link", () => {
  assert.deepEqual(invitePlan({ student: { name: "M" }, email: "m@x.ee", existing: { uid: "u1" }, studentIds: ["u1"] }), { action: "resend", uid: "u1" });
});

test("never a second account, never the parent's login, never someone else's account", () => {
  assert.throws(() => invitePlan({ student: { name: "M" }, email: "m@x.ee", existing: { uid: "mum" }, parentIds: ["mum"] }), /lapsevanema/);
  assert.throws(() => invitePlan({ student: { name: "M" }, email: "m@x.ee", existing: { uid: "other" } }), { status: 409 });
  assert.throws(() => invitePlan({ student: { name: "M" }, email: "new@x.ee", studentIds: ["u1"] }), /juba õpilase konto/);
  assert.throws(() => invitePlan({ student: { name: "M", active: false }, email: "m@x.ee" }), { status: 404 });
  assert.throws(() => invitePlan({ student: null, email: "m@x.ee" }), { status: 404 });
});

test("the e-mail has the link and the login in Estonian and Russian, and escapes the name", () => {
  const mail = composeInviteEmail({ name: "Mihhail <b>", email: "m@x.ee", link: "https://example.test/reset?oobCode=1&x=2" });
  assert.equal(mail.to, "m@x.ee");
  assert.match(mail.text, /Määra endale parool/);
  assert.match(mail.text, /Задайте пароль/);
  assert.match(mail.text, /oobCode=1&x=2/);
  assert.match(mail.html, /oobCode=1&amp;x=2/);
  assert.doesNotMatch(mail.html, /<b>/);
  assert.match(composeInviteEmail({ email: "m@x.ee", link: "l", resend: true }).subject, /uus parool/);
});
