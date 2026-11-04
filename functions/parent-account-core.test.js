"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parentPasswordLinkPlan, authInfoUids, authInfoOf } = require("./parent-account-core");

const parent = { uid: "p1", email: "Mari@Example.EE", displayName: "Mari" };

test("a parent account gets the link at its own login e-mail", () => {
  assert.deepEqual(parentPasswordLinkPlan({ authUser: parent, profile: { role: "parent", displayName: "Mari Tamm" } }), { uid: "p1", email: "mari@example.ee", name: "Mari Tamm" });
  assert.equal(parentPasswordLinkPlan({ authUser: parent, profile: { roles: ["parent"] } }).email, "mari@example.ee");
});

test("never a student, staff, the owner, a closed account or an account without e-mail", () => {
  assert.throws(() => parentPasswordLinkPlan({ authUser: null }), { status: 404 });
  assert.throws(() => parentPasswordLinkPlan({ authUser: parent, profile: { role: "student" } }), { status: 409, message: /ei ole lapsevanema/ });
  assert.throws(() => parentPasswordLinkPlan({ authUser: parent, profile: { role: "parent", roles: ["parent", "teacher"] } }), { status: 409, message: /Personali/ });
  assert.throws(() => parentPasswordLinkPlan({ authUser: { ...parent, customClaims: { roles: ["admin"] } }, profile: { role: "parent" } }), { status: 409 });
  assert.throws(() => parentPasswordLinkPlan({ authUser: parent, profile: { role: "parent" }, superAdminEmails: new Set(["mari@example.ee"]) }), { status: 409 });
  assert.throws(() => parentPasswordLinkPlan({ authUser: { ...parent, disabled: true }, profile: { role: "parent" } }), { status: 409, message: /suletud/ });
  assert.throws(() => parentPasswordLinkPlan({ authUser: { uid: "p1" }, profile: { role: "parent" } }), { status: 409, message: /e-posti/ });
});

test("auth-info takes 1–10 distinct account ids", () => {
  assert.deepEqual(authInfoUids([" a ", "a", "b"]), ["a", "b"]);
  assert.throws(() => authInfoUids([]), { status: 400 });
  assert.throws(() => authInfoUids("a"), { status: 400 });
  assert.throws(() => authInfoUids(Array.from({ length: 11 }, (_, i) => `u${i}`)), { status: 400 });
});

test("auth-info returns only the sign-in facts, never tokens, hashes, claims or phone", () => {
  const info = authInfoOf({
    uid: "p1", email: "Mari@Example.ee", emailVerified: true, disabled: false, phoneNumber: "+3725555", passwordHash: "secret", passwordSalt: "salt",
    customClaims: { roles: ["parent"] }, tokensValidAfterTime: "Mon, 01 Jan 2024 00:00:00 GMT",
    providerData: [{ providerId: "password", uid: "mari@example.ee" }, { providerId: "google.com", uid: "123", email: "mari@gmail.com" }],
    metadata: { creationTime: "Mon, 01 Jan 2024 00:00:00 GMT", lastSignInTime: "Tue, 03 Nov 2026 08:00:00 GMT", lastRefreshTime: null },
  });
  assert.deepEqual(info, { uid: "p1", found: true, email: "mari@example.ee", methods: ["password", "google"], emailVerified: true, disabled: false, createdAt: "2024-01-01T00:00:00.000Z", lastSignInAt: "2026-11-03T08:00:00.000Z", lastActiveAt: "" });
  assert.deepEqual(authInfoOf({ uid: "p2", providerData: [] }).methods, []);
});
