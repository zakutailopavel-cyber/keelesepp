"use strict";

// „Puuduvad andmed” (owner 2026-10-25): right after login (after „Teated”) a student or parent fills only what is
// missing on their card(s): suitable lesson times, contact e-mail / phone (an adult's own, a child's parent's), the
// parent's name, the preferred language for messages and a child's class or birth year. The administrator chooses in
// Seaded which items are asked and which of them block the CRM until filled, and sees on Õpilased which cards still
// miss what.
//
// Pure logic only: settings, what a card is missing, value validation, and the patch that fills ONLY missing fields.
// functions/missing-data-service.js loads the data and writes (staffOperationsApi /missing-data/*); the browser never
// decides what is missing — it renders the questions the server sends.

const { studentUidsOf, parentUidsOf } = require("./announcements-core");

const ITEMS = ["availability", "email", "phone", "parentName", "language", "grade"];
const MODES = ["required", "optional", "off"];
// owner 2026-10-25: Sobivad ajad + contact e-mail + language required, class for children required
const DEFAULT_SETTINGS = Object.freeze({ availability: "required", email: "required", phone: "optional", parentName: "optional", language: "required", grade: "required" });
const LANGUAGES = ["et", "ru", "en"];
const ADULT_GRADE = "Täiskasvanu";
const SLOT = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)-(0[89]|1[0-9]|2[01]):(00|30)$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const lower = (value) => clean(value).toLocaleLowerCase("et");

function statusError(status, message, extra = {}) {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, extra);
  return error;
}

function normalizeSettings(data = {}) {
  const items = data && typeof data.items === "object" && data.items ? data.items : {};
  return Object.fromEntries(ITEMS.map((item) => [item, MODES.includes(items[item]) ? items[item] : DEFAULT_SETTINGS[item]]));
}

// ---------- values ----------

const { isPlaceholderEmail } = require("./email-address-core");
const validEmail = (value) => EMAIL.test(clean(value, 200)) && !isPlaceholderEmail(value);
// a child's parent e-mail is never required (owner 2026-10-26: students typed made-up addresses to get past the form)
const requiredFor = (kind, items, settings) => items.filter((item) => settings[item] === "required" && !(item === "email" && kind === "child"));

// Estonian numbers without the country code (7–8 digits, 3…8 first) become +372…; international numbers keep their
// code (00 → +). Spaces, dashes, dots and brackets are dropped. Returns "" when it is not a phone number.
function normalizePhone(value) {
  let text = clean(value, 40).replace(/[\s().-]/g, "");
  if (text.startsWith("00")) text = `+${text.slice(2)}`;
  if (/^[3-8]\d{6,7}$/.test(text)) return `+372${text}`;
  if (/^\+372[3-8]\d{6,7}$/.test(text)) return text;
  if (/^\+(?!372)[1-9]\d{6,14}$/.test(text)) return text;
  return "";
}

// „5. klass” (1–12), „Täiskasvanu” → { grade } ; a birth year → { birthYear }
function gradeValue(value, year) {
  const text = clean(value, 40);
  if (!text) return null;
  if (lower(text) === lower(ADULT_GRADE)) return { grade: ADULT_GRADE };
  const klass = /^(\d{1,2})\.?\s*(klass)?$/i.exec(text);
  if (klass && Number(klass[1]) >= 1 && Number(klass[1]) <= 12 && !/^\d{4}$/.test(text)) return { grade: `${Number(klass[1])}. klass` };
  if (/^\d{4}$/.test(text)) {
    const born = Number(text);
    if (born >= year - 100 && born <= year - 3) return { birthYear: born };
  }
  return null;
}

function hasSlots(availability) {
  return Boolean(availability) && Array.isArray(availability.slots) && availability.slots.length > 0;
}

function cleanSlots(value = {}) {
  const slots = [...new Set((Array.isArray(value.slots) ? value.slots : []).map((slot) => clean(slot, 9)).filter((slot) => SLOT.test(slot)))].slice(0, 336);
  const preferred = [...new Set((Array.isArray(value.preferred) ? value.preferred : []).map((slot) => clean(slot, 9)).filter((slot) => slots.includes(slot)))];
  return { slots, preferred };
}

// ---------- what a card is ----------

const parentContacts = (card = {}) => [
  { name: card.parentName || card.guardianName, email: card.parentEmail || card.guardianEmail, phone: card.parentPhone || card.guardianPhone },
  ...(Array.isArray(card.parentContacts) ? card.parentContacts : []),
].map((item) => ({ name: clean(item?.name), email: clean(item?.email), phone: clean(item?.phone) }));

// grade „N. klass” / birth year under 18 → child; „Täiskasvanu” / 18+ → adult; a parent link or contact → child;
// otherwise unknown (asked in the form: adult or a class)
function cardKind(card = {}, year = new Date().getFullYear()) {
  const grade = clean(card.grade, 40);
  if (/täiskasvan|adult|взросл/i.test(grade)) return "adult";
  const born = Number(card.birthYear);
  if (Number.isInteger(born) && born > 1900) return year - born >= 18 ? "adult" : "child";
  if (/klass|lasteaed|kindergarten|^\d{1,2}\.?$/i.test(grade)) return "child";
  if (card.adult === true) return "adult";
  if (parentUidsOf(card).length || parentContacts(card).some((item) => item.name || item.email || item.phone)) return "child";
  return "unknown";
}

const hasGrade = (card = {}) => Boolean(clean(card.grade, 40)) || (Number.isInteger(Number(card.birthYear)) && Number(card.birthYear) > 1900);

// facts = { card, availability, parents: [profile…] } (parents = the linked parent accounts' profiles)
// → for one kind ('adult' | 'child') the missing items in ITEMS order
function missingFor(kind, { card = {}, availability = null, parents = [] }) {
  const contacts = parentContacts(card);
  const parentEmailKnown = contacts.some((item) => validEmail(item.email)) || parents.some((profile) => validEmail(profile.email));
  const parentPhoneKnown = contacts.some((item) => item.phone) || parents.some((profile) => clean(profile.phone || profile.parentPhone));
  const parentNameKnown = contacts.some((item) => item.name) || parents.some((profile) => clean(profile.displayName || profile.name));
  const languageKnown = LANGUAGES.includes(card.preferredLanguage) || (kind === "child" && parents.some((profile) => LANGUAGES.includes(profile.preferredLanguage)));
  const missing = {
    availability: !hasSlots(availability),
    email: kind === "adult" ? !validEmail(card.email) : !parentEmailKnown,
    phone: kind === "adult" ? !clean(card.phone) : !parentPhoneKnown,
    parentName: kind === "child" && !parentNameKnown,
    language: !languageKnown,
    grade: kind === "child" && !hasGrade(card),
  };
  return ITEMS.filter((item) => missing[item]);
}

// one card for the administrator's list and for the gate: { kind, missing: [...], required: [...] } — for an unknown
// card the class question decides; the list shows the adult reading plus „grade”
function cardStatus(facts, settings = DEFAULT_SETTINGS, year = new Date().getFullYear()) {
  const kind = cardKind(facts.card, year);
  const on = (item) => settings[item] && settings[item] !== "off";
  const pick = (items) => items.filter(on);
  if (kind === "unknown" && !on("grade")) {
    const missing = pick(missingFor("adult", facts));
    return { kind: "adult", missing, required: missing.filter((item) => settings[item] === "required") };
  }
  if (kind === "unknown") {
    const adult = pick(missingFor("adult", facts));
    const child = pick(missingFor("child", facts));
    const missing = ITEMS.filter((item) => item === "grade" || adult.includes(item));
    return { kind, missing, required: missing.filter((item) => settings[item] === "required"), variants: { adult, child } };
  }
  const missing = pick(missingFor(kind, facts));
  return { kind, missing, required: requiredFor(kind, missing, settings) };
}

// ---------- the gate: what the caller is asked ----------

// caller = { uid, roles: [{ role: 'student' | 'parent', cards }], profile }; facts per card id
// → { cards: [{ studentId, studentName, role, kind, ask: { adult?, child? } | [...], required, values }], profile: { ask, required } }
// A parent answers the language once for themself (their profile); a student on their card.
function questionsFor(caller, factsById, settings, year = new Date().getFullYear()) {
  const cards = [];
  const seen = new Set();
  const parentItems = new Set();
  const profile = caller.profile || {};
  caller.roles.forEach(({ role, cards: list }) => list.forEach((card) => {
    if (seen.has(card.id) || !isLiveCard(card)) return;
    seen.add(card.id);
    const facts = factsById.get(card.id) || { card, availability: null, parents: [] };
    // the parent themself counts as a known parent of the card (their own profile is read fresh)
    const parents = role === "parent" ? [...facts.parents.filter((item) => item.uid !== caller.uid), { ...profile, uid: caller.uid }] : facts.parents;
    let status = cardStatus({ ...facts, parents }, settings, year);
    if (role === "parent" && status.kind === "unknown") status = cardStatus({ ...facts, parents, card: { ...card, adult: false, parentUid: caller.uid } }, settings, year);
    let ask = status.missing;
    // a parent answers their own language (and, for a child, their own phone) once, not per child
    if (role === "parent") {
      if (ask.includes("language")) parentItems.add("language");
      if (status.kind === "child" && ask.includes("phone")) parentItems.add("phone");
      ask = ask.filter((item) => !parentItems.has(item) || (item === "phone" && status.kind !== "child"));
    }
    const variants = status.variants && role === "student"
      ? { adult: status.variants.adult, child: status.variants.child }
      : null;
    if (!ask.length && !(variants && (variants.adult.length || variants.child.length))) return;
    cards.push({
      studentId: card.id,
      studentName: clean(card.name),
      role,
      kind: status.kind,
      ask,
      ...(variants ? { variants } : {}),
      required: [...new Set([...(variants ? [...variants.adult, ...variants.child] : ask)].filter((item) => settings[item] === "required"))],
      accountEmail: role === "student" ? clean(profile.email || caller.email) : "",
    });
  }));
  const profileAsk = ITEMS.filter((item) => parentItems.has(item));
  return {
    cards,
    profile: { ask: profileAsk, required: profileAsk.filter((item) => settings[item] === "required") },
    settings,
  };
}

// the gate blocks when something required is missing
function blocks(questions) {
  return questions.cards.some((card) => card.required.length) || questions.profile.required.length > 0;
}

// ---------- writing ----------

// The answer for one card → { kind, student: patch, availability: { slots, preferred } | null, errors: {} } with ONLY
// the asked (= missing) fields. An adult's contact is their own (email / phone), a child's the parent's
// (parentEmail / parentPhone / parentName); a parent's own phone and language go through profilePatch.
function cardPatch(question, answer = {}, year = new Date().getFullYear()) {
  const errors = {};
  const student = {};
  let availability = null;
  const graded = gradeValue(answer.grade, year);
  let kind = question.kind;
  let asked = question.ask;
  if (question.variants) {
    // an unknown card: the class answer decides between the adult and the child questions
    const adult = !graded || graded.grade === ADULT_GRADE || (graded.birthYear && year - graded.birthYear >= 18);
    kind = adult ? "adult" : "child";
    asked = [...new Set(["grade", ...(question.variants[kind] || [])])];
  }
  const required = new Set(question.required);
  if (kind === "child") required.delete("email");
  const need = (item, has) => { if (!has && required.has(item) && !errors[item]) errors[item] = "required"; };

  if (asked.includes("availability")) {
    const times = cleanSlots(answer.availability || {});
    if (times.slots.length) availability = times;
    need("availability", times.slots.length > 0);
  }
  if (asked.includes("grade")) {
    if (clean(answer.grade) && !graded) errors.grade = "grade";
    if (graded) Object.assign(student, graded);
    need("grade", Boolean(graded));
  }
  if (asked.includes("email")) {
    const email = clean(answer.email, 200).toLocaleLowerCase("et");
    if (email && !validEmail(email)) errors.email = "email";
    else if (email) student[kind === "adult" ? "email" : "parentEmail"] = email;
    need("email", Boolean(email));
  }
  if (asked.includes("phone")) {
    const phone = normalizePhone(answer.phone);
    if (clean(answer.phone) && !phone) errors.phone = "phone";
    else if (phone && kind === "adult") student.phone = phone;
    else if (phone) student.parentPhone = phone;
    need("phone", Boolean(phone));
  }
  if (asked.includes("parentName")) {
    const name = clean(answer.parentName, 120);
    if (name && name.split(/\s+/).length < 2) errors.parentName = "name";
    else if (name) student.parentName = name;
    need("parentName", Boolean(name));
  }
  if (asked.includes("language")) {
    const language = LANGUAGES.includes(answer.language) ? answer.language : "";
    if (clean(answer.language) && !language) errors.language = "language";
    if (language) student.preferredLanguage = language;
    need("language", Boolean(language));
  }
  return { kind, student, availability, errors };
}

// before/after for the audit: only the fields that change
function changes(target, id, before = {}, patch = {}) {
  return Object.entries(patch).map(([field, after]) => ({ target, id, field, before: before[field] ?? "", after }));
}

// The times we already know for a card (owner 2026-10-27: „проверь, чтобы ученик при каждом входе не заполнял
// подходящие времена”): its own „Sobivad ajad”, else another card of the same person (a second subject), else the
// /ajad answer of that person (website enquiry: the learner's name, or the e-mail / phone of this card only).
const personKey = (value) => String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]/gu, " ").split(" ").filter((word) => word.length > 1).sort().join(" ");
const phoneKey = (value) => { const digits = String(value || "").replace(/\D/g, "").replace(/^372/, ""); return digits.length >= 7 ? digits.slice(-8) : ""; };
function knownTimes(card, { own = null, cards = [], ownById = new Map(), leads = [] } = {}) {
  if (hasSlots(own)) return own;
  const name = personKey(card.name);
  const sibling = cards.find((other) => other.id !== card.id && name && personKey(other.name) === name && hasSlots(ownById.get(other.id)));
  if (sibling) return ownById.get(sibling.id);
  const email = String(card.email || card.parentEmail || "").trim().toLowerCase();
  const phone = phoneKey(card.phone || card.parentPhone);
  const shared = (field, value) => cards.filter((other) => other.id !== card.id && personKey(other.name) !== name && value && (field === "email" ? String(other.email || other.parentEmail || "").trim().toLowerCase() === value : phoneKey(other.phone || other.parentPhone) === value)).length > 0;
  const lead = leads.filter((item) => item && item.source === "availability" && item.status !== "closed" && Array.isArray(item.slots) && item.slots.length)
    .find((item) => (name && personKey(item.name) === name)
      || (email && !shared("email", email) && String(item.email || "").trim().toLowerCase() === email)
      || (phone && !shared("phone", phone) && phoneKey(item.phone) === phone));
  return lead ? { slots: lead.slots, preferred: Array.isArray(lead.preferred) ? lead.preferred : [], source: "website-lead" } : own;
}

module.exports = {
  knownTimes,
  ITEMS, MODES, DEFAULT_SETTINGS, LANGUAGES, ADULT_GRADE,
  statusError, normalizeSettings, validEmail, normalizePhone, gradeValue, hasSlots, cleanSlots,
  cardKind, missingFor, cardStatus, questionsFor, blocks, cardPatch, changes, parentContacts,
  studentUidsOf, parentUidsOf,
};

// ---------- the administrator's list ----------

// an account that can log in and would see the form (the same test as the „Teated” report)
function accountOk(profile, role) {
  return Boolean(profile) && profile.disabled !== true && !["pending", "rejected"].includes(profile.approvalStatus)
    && (profile.role === role || (Array.isArray(profile.roles) && profile.roles.includes(role)));
}

const isLiveCard = (card = {}) => card.active !== false && card.convertedToParent !== true && card.archived !== true && !card.mergedInto && !card.mergedIntoStudentId;

// every live card → { studentId, name, teacher, kind, missing, required, account, wouldSee }
// account: 'student' | 'parent' | 'both' | 'none' (only accounts that can log in count)
function reportRows(students = [], availabilityById = new Map(), users = new Map(), settings = DEFAULT_SETTINGS, year = new Date().getFullYear()) {
  return students.filter(isLiveCard).map((card) => {
    const parents = parentUidsOf(card).map((uid) => ({ uid, ...(users.get(uid) || {}) })).filter((profile) => accountOk(profile, "parent"));
    const studentAccount = studentUidsOf(card).some((uid) => accountOk(users.get(uid), "student"));
    const status = cardStatus({ card, availability: availabilityById.get(card.id) || null, parents }, settings, year);
    const account = studentAccount && parents.length ? "both" : studentAccount ? "student" : parents.length ? "parent" : "none";
    return {
      studentId: clean(card.id, 128),
      name: clean(card.name),
      teacher: clean(card.teacher),
      kind: status.kind,
      missing: status.missing,
      required: status.required,
      account,
      wouldSee: account !== "none" && status.required.length > 0,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "et"));
}

function reportTotals(rows = []) {
  const items = Object.fromEntries(ITEMS.map((item) => [item, { cards: 0, withAccount: 0, withoutAccount: 0 }]));
  rows.forEach((row) => row.missing.forEach((item) => {
    items[item].cards += 1;
    items[item][row.account === "none" ? "withoutAccount" : "withAccount"] += 1;
  }));
  return {
    cards: rows.length,
    withMissing: rows.filter((row) => row.missing.length).length,
    wouldSee: rows.filter((row) => row.wouldSee).length,
    missingWithoutAccount: rows.filter((row) => row.missing.length && row.account === "none").length,
    items,
  };
}

module.exports.accountOk = accountOk;
module.exports.isLiveCard = isLiveCard;
module.exports.reportRows = reportRows;
module.exports.reportTotals = reportTotals;

// a parent's own answers (their profile): language and, for their children, their phone
function profilePatch(question = { ask: [], required: [] }, answer = {}) {
  const errors = {};
  const profile = {};
  const required = new Set(question.required || []);
  if ((question.ask || []).includes("language")) {
    const language = clean(answer.language, 4);
    if (LANGUAGES.includes(language)) profile.preferredLanguage = language;
    else if (language) errors.language = "language";
    else if (required.has("language")) errors.language = "required";
  }
  if ((question.ask || []).includes("phone")) {
    const phone = normalizePhone(answer.phone);
    if (phone) profile.phone = phone;
    else if (clean(answer.phone)) errors.phone = "phone";
    else if (required.has("phone")) errors.phone = "required";
  }
  return { profile, errors };
}
module.exports.profilePatch = profilePatch;
