"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { shouldAnnounceHomework, homeworkRecipients, composeHomeworkEmail } = require("./homework-mail-core");

test("only homework given now is announced", () => {
  const now = Date.parse("2026-10-04T12:00:00Z");
  const base = { studentId: "s1", task: "Korda sõnu" };
  assert.equal(shouldAnnounceHomework({ ...base, createdAt: "2026-10-04T11:30:00Z" }, { nowMs: now }), true);
  assert.equal(shouldAnnounceHomework({ ...base, createdAt: "2026-10-04T09:00:00Z" }, { nowMs: now }), false, "old import");
  assert.equal(shouldAnnounceHomework({ ...base, date: "2026-10-04" }, { today: "2026-10-04", nowMs: now }), true);
  assert.equal(shouldAnnounceHomework({ ...base, date: "2026-09-01" }, { today: "2026-10-04", nowMs: now }), false);
  assert.equal(shouldAnnounceHomework({ ...base, date: "2026-10-04", notify: false }, { today: "2026-10-04" }), false);
  assert.equal(shouldAnnounceHomework({ studentId: "s1", task: " ", date: "2026-10-04" }, { today: "2026-10-04" }), false);
});

test("recipients: the student and the linked parents, deduplicated, valid e-mails only", () => {
  const card = { email: "Mari@Example.com", parentEmail: "ema@example.com", guardianEmail: "not-an-email" };
  assert.deepEqual(homeworkRecipients(card, { studentAccountEmails: ["mari@example.com"], parentAccountEmails: ["isa@example.com", "EMA@example.com"] }),
    { student: ["mari@example.com"], parents: ["ema@example.com", "isa@example.com"] });
  assert.deepEqual(homeworkRecipients({ ...card, homeworkEmailOptOut: true }), { student: [], parents: [] });
  assert.deepEqual(homeworkRecipients({ email: "", parentEmail: "same@example.com" }, { studentAccountEmails: ["same@example.com"] }),
    { student: ["same@example.com"], parents: [] }, "one person gets one e-mail");
});

test("the e-mail names the task, due date, board page and escapes HTML", () => {
  const mail = composeHomeworkEmail({
    homework: { task: "Kirjuta <5> lauset", due: "2026-10-11", teacherName: "Kati", boardPageTitle: "Tund 1" },
    student: { name: "Mari" }, to: ["ema@example.com"], audience: "parent",
  });
  assert.match(mail.subject, /Uus kodutöö: Mari/);
  assert.match(mail.text, /Tähtaeg: 2026-10-11/);
  assert.match(mail.text, /Tahvlileht: Tund 1/);
  assert.match(mail.text, /Mari sai uue kodutöö \(õpetaja Kati\)/);
  assert.match(mail.html, /Kirjuta &lt;5&gt; lauset/);
  assert.doesNotMatch(mail.html, /<5>/);
  assert.deepEqual(mail.to, ["ema@example.com"]);
});
