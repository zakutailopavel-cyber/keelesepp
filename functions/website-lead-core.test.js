"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeWebsiteLead, throttleAllows, composeWebsiteLeadEmail, MAX_PER_HOUR } = require("./website-lead-core");

test("accepts a complete enquiry and normalises it", () => {
  const { lead } = normalizeWebsiteLead({ name: " Mari Maasikas ", email: "Mari@Example.EE", phone: "+372 5555 5555", language: "Eesti keel", level: "B1", message: "B1 eksam", locale: "ru" });
  assert.deepEqual(lead, { name: "Mari Maasikas", email: "mari@example.ee", phone: "+372 5555 5555", language: "Eesti keel", level: "B1", message: "B1 eksam", locale: "ru", page: "", source: "website-registration" });
});

test("rejects missing or broken required fields", () => {
  assert.deepEqual(normalizeWebsiteLead({ name: "M", email: "nope", language: "Saksa keel", phone: "12" }).errors, ["name", "email", "phone", "language"]);
});

test("unknown level and locale fall back safely", () => {
  const { lead } = normalizeWebsiteLead({ name: "Mari", email: "m@example.ee", language: "Inglise keel", level: "<script>", locale: "de" });
  assert.equal(lead.level, "Määramata");
  assert.equal(lead.locale, "et");
});

test("the hidden honeypot field marks bots", () => {
  assert.deepEqual(normalizeWebsiteLead({ name: "Bot", email: "b@example.com", language: "Eesti keel", website: "http://spam" }), { spam: true });
});

test("keeps a bounded level-test diagnostic with the lead", () => {
  const { lead } = normalizeWebsiteLead({
    name: "Mari", email: "m@example.ee", language: "Eesti keel", level: "B1", source: "level-test",
    assessment: { diagnosticId: "MEQ9-J636", score: 117, answered: 6, skills: { grammar: 81.7, vocabulary: -2, reading: 54, injected: 99 } },
  });
  assert.deepEqual(lead.assessment, { diagnosticId: "MEQ9-J636", score: 100, answered: 6, skills: { grammar: 82, vocabulary: 0, reading: 54 } });
  assert.equal(lead.source, "level-test");
});

test("at most a few enquiries per hour from one address", () => {
  const now = Date.now();
  assert.equal(throttleAllows(Array(MAX_PER_HOUR - 1).fill(now - 1000), now), true);
  assert.equal(throttleAllows(Array(MAX_PER_HOUR).fill(now - 1000), now), false);
  assert.equal(throttleAllows(Array(MAX_PER_HOUR).fill(now - 2 * 60 * 60 * 1000), now), true);
});

test("the e-mail to the school escapes visitor text and replies to the visitor", () => {
  const { lead } = normalizeWebsiteLead({ name: "Mari <b>", email: "m@example.ee", language: "Eesti keel", message: "<img src=x>" });
  const mail = composeWebsiteLeadEmail(lead);
  assert.equal(mail.to, "info@epkoolitus.ee");
  assert.equal(mail.replyTo, "m@example.ee");
  assert.match(mail.subject, /Uus päring kodulehelt: Eesti keel Määramata/);
  assert.ok(!mail.html.includes("<img src=x>"));
  assert.ok(mail.html.includes("&lt;img src=x&gt;"));
});
