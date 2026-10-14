"use strict";

// Administrator edits a parent (owner 2026-10-14: „админ должен менять данные родителей”). The parent's name, e-mail
// and phone live in three places: the Firebase account (login e-mail, name), users/{uid} and the children's cards
// (parentName / parentEmail / payerEmail → new invoices). Pure helpers; the route is /accounts/parent-profile.
// Issued invoices are never changed (they keep the recipient they were sent to).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, max = 160) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const fail = (status, message) => Object.assign(new Error(message), { status });

function parentProfileInput({ displayName, email, phone }) {
  const next = { displayName: clean(displayName), email: clean(email, 254).toLowerCase(), phone: clean(phone, 40) };
  if (!next.displayName) throw fail(400, "Lapsevanema nimi on kohustuslik.");
  if (!next.email || !EMAIL_RE.test(next.email)) throw fail(400, "Sisesta korrektne e-posti aadress.");
  return next;
}

// A card value changes only where it still shows the parent's old value (or nothing): a card that names someone else
// (the other parent, a payer) keeps it.
function cardPatch(card = {}, before = {}, next = {}) {
  const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  const patch = {};
  if (!card.parentName || same(card.parentName, before.displayName)) {
    if (!same(card.parentName, next.displayName)) patch.parentName = next.displayName;
  }
  if (!card.parentEmail || same(card.parentEmail, before.email)) {
    if (!same(card.parentEmail, next.email)) patch.parentEmail = next.email;
  }
  if (card.payerEmail && same(card.payerEmail, before.email) && !same(card.payerEmail, next.email)) patch.payerEmail = next.email;
  return patch;
}

module.exports = { parentProfileInput, cardPatch };
