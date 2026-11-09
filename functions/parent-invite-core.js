"use strict";

// „Lisa lapsevanem” (owner 2026-10-15: „дай админам возможность создавать аккаунты родителей”): the administrator
// creates a parent's login without a password and links it to the children's cards; the parent gets an e-mail with the
// link to set the password (the same mail as the student invite). Pure helpers; the route is /accounts/invite-parent
// in staffOperationsApi.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAFF = new Set(["admin", "teacher", "accountant", "owner"]);
const clean = (value, max = 160) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const fail = (status, message) => Object.assign(new Error(message), { status });

function parentInviteInput({ email, displayName, phone, studentIds } = {}) {
  const next = {
    email: clean(email, 254).toLowerCase(),
    displayName: clean(displayName),
    phone: clean(phone, 40),
    studentIds: [...new Set((Array.isArray(studentIds) ? studentIds : []).map((id) => clean(id, 180)).filter(Boolean))],
  };
  if (!next.displayName) throw fail(400, "Lapsevanema nimi on kohustuslik.");
  if (!next.email || !EMAIL_RE.test(next.email)) throw fail(400, "Sisesta lapsevanema korrektne e-posti aadress.");
  if (next.studentIds.length > 10) throw fail(400, "Korraga saab siduda kuni 10 last.");
  return next;
}

const accountIds = (card, keys, listKey) => [...new Set([...keys.map((key) => card[key]), ...(card[listKey] || [])].filter(Boolean))];
const studentIdsOf = (card) => accountIds(card, ["linkedUserId", "studentUid"], "linkedUserIds");
const parentIdsOf = (card) => accountIds(card, ["linkedParentId", "parentUid", "guardianUid"], "linkedParentIds");

// Which card an account may be linked to (Oleksiy 2026-11-06: „Невозможно добавить родителю архивированного
// ученика”). A parent may be linked to an active OR an archived card (the parent's „Minu pere” still shows only active
// cards); never to a card in the „Prügikast” (deletedAt / purgedAt, #1124) or a card merged into another one. A
// student's own login keeps the old rule: active cards only. Returns null or { status, message }.
function linkCardRefusal(card, relationship = "parent") {
  const name = clean(card?.name) || clean(card?.id) || "";
  if (!card) return { status: 404, message: "Õpilase kaarti ei leitud." };
  if (card.deletedAt || card.purgedAt) return { status: 409, message: `Õpilase kaart „${name}” on prügikastis. Taasta see enne sidumist.` };
  if (card.mergedInto || card.mergedIntoStudentId) return { status: 409, message: `Õpilase kaart „${name}” on liidetud teise kaardiga. Seo alles jäänud kaart.` };
  if (relationship !== "parent" && card.active === false) return { status: 404, message: "Aktiivset õpilase kaarti ei leitud." };
  return null;
}

// cards: [{ id, ...data }] of the chosen children; existing: the Firebase account with the e-mail (or null) and its
// users/{uid} profile. A new e-mail gets a new account; an existing parent (or a student who is also a parent) is
// linked to the cards it is not on yet and gets a new password link. Staff logins and a child's own login never.
function parentInvitePlan({ cards = [], existing = null, existingProfile = {} }) {
  // archived cards are accepted, cards in the trash / merged away are refused (linkCardRefusal)
  for (const card of cards) {
    const refusal = linkCardRefusal(card, "parent");
    if (refusal) throw fail(refusal.status, refusal.message);
  }
  if (!existing) return { action: "create", link: cards.map((card) => card.id) };
  const roles = [String(existingProfile.role || "").toLowerCase(), ...(existingProfile.roles || []).map((role) => String(role).toLowerCase())];
  if (roles.some((role) => STAFF.has(role))) throw fail(409, "See e-post on töötaja konto. Kasuta lapsevanema enda e-posti.");
  const own = cards.find((card) => studentIdsOf(card).includes(existing.uid));
  if (own) throw fail(409, `See e-post on õpilase ${own.name || ""} enda konto. Kasuta lapsevanema e-posti.`.replace("  ", " "));
  return { action: "existing", uid: existing.uid, link: cards.filter((card) => !parentIdsOf(card).includes(existing.uid)).map((card) => card.id) };
}

// the children's cards learn the parent's contact where they have none yet (new invoices go there)
function parentCardPatch(card = {}, parent = {}) {
  const patch = {};
  if (!clean(card.parentName)) patch.parentName = parent.displayName;
  if (!clean(card.parentEmail)) patch.parentEmail = parent.email;
  return patch;
}

module.exports = { linkCardRefusal, parentInviteInput, parentInvitePlan, parentCardPatch, parentIdsOf, studentIdsOf };
