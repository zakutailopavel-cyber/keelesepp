"use strict";

// The parent's „Konto” block on the Lapsevanemad page (owner + administrator Oleksiy, 2026-11-04). Pure helpers:
// - parentPasswordLinkPlan: „Saada parooli link” for a parent account (the same /accounts/invite route as the
//   student card, body { parentUid }). Only a parent account, never staff or the owner, and only to the account's
//   own login e-mail (the request carries no address).
// - authInfoUids / authInfoOf: the read-only /accounts/auth-info route. Only the sign-in facts the administrator
//   needs (login e-mail, sign-in methods, e-mail verified, disabled, created / last sign-in); no tokens, hashes,
//   claims or phone numbers.

const AUTH_INFO_LIMIT = 10;
const PROVIDERS = { password: "password", "google.com": "google" };

const fail = (status, message) => Object.assign(new Error(message), { status });
const listOf = value => (Array.isArray(value) ? value : []);

function accountRoles(profile = {}, authUser = {}) {
  return new Set([profile.role, ...listOf(profile.roles), authUser.customClaims?.role, ...listOf(authUser.customClaims?.roles)].filter(Boolean).map(String));
}

// authUser: the Firebase account (admin.auth().getUser), profile: users/{uid}, superAdminEmails: the owner's logins
function parentPasswordLinkPlan({ authUser, profile = {}, superAdminEmails = new Set() } = {}) {
  if (!authUser) throw fail(404, "Lapsevanema kontot ei leitud.");
  const email = String(authUser.email || "").trim().toLowerCase();
  const roles = accountRoles(profile, authUser);
  if (superAdminEmails.has(email) || roles.has("admin") || roles.has("teacher") || roles.has("finance")) throw fail(409, "Personali kontole siit parooli linki ei saadeta.");
  if (!roles.has("parent")) throw fail(409, "See konto ei ole lapsevanema konto.");
  if (authUser.disabled === true || profile.disabled === true || profile.active === false) throw fail(409, "Konto on suletud. Ava see enne parooli lingi saatmist.");
  if (!email) throw fail(409, "Kontol pole e-posti. Lisa e-post nupuga „Muuda”.");
  return { uid: String(authUser.uid || ""), email, name: String(profile.displayName || authUser.displayName || "").trim() };
}

function authInfoUids(value) {
  const uids = [...new Set(listOf(value).map(uid => String(uid || "").trim()).filter(uid => uid && uid.length <= 128 && !uid.includes("/")))];
  if (!uids.length) throw fail(400, "Konto puudub.");
  if (uids.length > AUTH_INFO_LIMIT) throw fail(400, `Korraga kuni ${AUTH_INFO_LIMIT} kontot.`);
  return uids;
}

const isoOf = value => {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? new Date(time).toISOString() : "";
};

// a Firebase UserRecord → only the fields the „Konto” block shows
function authInfoOf(user) {
  if (!user) return null;
  const methods = [...new Set(listOf(user.providerData).map(item => PROVIDERS[item?.providerId]).filter(Boolean))];
  if (user.passwordHash && !methods.includes("password")) methods.unshift("password");
  return {
    uid: String(user.uid || ""),
    found: true,
    email: String(user.email || "").toLowerCase(),
    methods,
    emailVerified: user.emailVerified === true,
    disabled: user.disabled === true,
    createdAt: isoOf(user.metadata?.creationTime),
    lastSignInAt: isoOf(user.metadata?.lastSignInTime),
    lastActiveAt: isoOf(user.metadata?.lastRefreshTime),
  };
}

module.exports = { AUTH_INFO_LIMIT, parentPasswordLinkPlan, authInfoUids, authInfoOf };
