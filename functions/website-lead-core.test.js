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

test("„Sobivad ajad”: the half hours that really suit the learner, a phone is enough", () => {
  const { normalizeWebsiteLead, composeWebsiteLeadEmail, slotSummary } = require("./website-lead-core");
  const result = normalizeWebsiteLead({ source: "availability", name: "Mari", phone: "+372 5555 5555", language: "Matemaatika", format: "online", lessonsPerWeek: 2,
    slots: ["Mon-16:00", "Mon-16:30", "Mon-17:00", "Wed-10:00", "Fri-25:00", "Xyz-10:00"], preferred: ["Mon-16:30", "Sun-12:00"] });
  assert.ok(result.lead, JSON.stringify(result));
  assert.deepEqual(result.lead.slots, ["Mon-16:00", "Mon-16:30", "Mon-17:00", "Wed-10:00"]);
  assert.deepEqual(result.lead.preferred, ["Mon-16:30"]);
  assert.equal(slotSummary(result.lead.slots, result.lead.preferred), "E 16:00–17:30 (★ 16:30–17:00); K 10:00–10:30");
  const mail = composeWebsiteLeadEmail(result.lead);
  assert.match(mail.subject, /^Sobivad ajad: Mari \(Matemaatika\)/);
  assert.equal(mail.replyTo, undefined);
  assert.deepEqual(normalizeWebsiteLead({ source: "availability", name: "Mari", language: "Eesti keel", slots: ["Mon-16:00"] }).errors, ["email"]);
  assert.deepEqual(normalizeWebsiteLead({ source: "availability", name: "Mari", phone: "55555555", language: "Eesti keel", slots: [] }).errors, ["slots"]);
});

test("„Sobivad ajad” for current students: only a name, a contact and the times", () => {
  const { normalizeWebsiteLead, composeWebsiteLeadEmail } = require("./website-lead-core");
  const result = normalizeWebsiteLead({ source: "availability", name: "Mari", phone: "55555555", slots: ["Mon-17:00", "Mon-17:30"] });
  assert.ok(result.lead, JSON.stringify(result));
  assert.equal(result.lead.lessonsPerWeek, undefined);
  assert.equal(result.lead.format, undefined);
  const mail = composeWebsiteLeadEmail(result.lead);
  assert.equal(mail.subject, "Sobivad ajad: Mari");
  assert.doesNotMatch(mail.text, /Tase|Tunde nädalas|Vorm|Keel:/);
});
