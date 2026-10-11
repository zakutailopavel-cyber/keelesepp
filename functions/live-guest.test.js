"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { guestExpiry, guestUrl, newToken, teacherMayInvite, tokenHash, validTokenShape, createGuestLink, joinGuestLink } = require("./live-guest");

// a tiny in-memory Firestore: enough for the link and the join
function fakeDb(initial = {}) {
  const store = new Map(Object.entries(initial));
  let counter = 0;
  const ref = (path) => ({
    id: path.split("/").pop(),
    path,
    async get() { return snap(path); },
  });
  const snap = (path) => ({ exists: store.has(path), data: () => store.get(path), id: path.split("/").pop() });
  const collection = (name) => ({ doc: (id) => ref(`${name}/${id || `auto${++counter}`}`) });
  return {
    store,
    collection,
    batch() {
      const ops = [];
      return { set: (r, v) => ops.push(() => store.set(r.path, v)), async commit() { ops.forEach((op) => op()); } };
    },
    async runTransaction(fn) {
      const ops = [];
      const result = await fn({
        get: async (r) => snap(r.path),
        update: (r, v) => ops.push(() => store.set(r.path, { ...store.get(r.path), ...v })),
        set: (r, v) => ops.push(() => store.set(r.path, v)),
        delete: (r) => ops.push(() => store.delete(r.path)),
      });
      ops.forEach((op) => op());
      return result;
    },
  };
}
const Timestamp = { fromMillis: (ms) => ({ toMillis: () => ms }) };
const FieldValue = { serverTimestamp: () => "SERVER_TIME" };
const allowed = (origin) => origin === "https://crm.epkoolitus.ee";

test("tokens are random, url-safe and stored only as a hash", () => {
  const a = newToken();
  assert.ok(validTokenShape(a));
  assert.notEqual(a, newToken());
  assert.equal(tokenHash(a).length, 64);
  assert.equal(validTokenShape("../etc"), false);
});

test("a link lives until the end of the Tallinn day, at least three hours", () => {
  const noon = Date.UTC(2026, 9, 11, 9, 0, 0); // 12:00 in Tallinn (EEST)
  assert.equal(guestExpiry(noon), Date.UTC(2026, 9, 11, 21, 0, 0));
  const late = Date.UTC(2026, 9, 11, 20, 30, 0); // 23:30 in Tallinn
  assert.equal(guestExpiry(late), late + 3 * 3600_000);
});

test("only the card's teacher or an admin may make a link; the url stays on the CRM", () => {
  assert.equal(teacherMayInvite({ teacherUids: ["t1"] }, { uid: "t1" }), true);
  assert.equal(teacherMayInvite({ teacherUid: "t2" }, { uid: "t1" }), false);
  assert.equal(teacherMayInvite({}, { uid: "a", isAdmin: true }), true);
  assert.equal(guestUrl("https://evil.example", "abc", allowed), "https://crm.epkoolitus.ee/tund/abc");
});

test("create → join: the guest becomes the invitation's student and gets a grant for this card only", async () => {
  const db = fakeDb({ "students/s1": { name: "Mykyta", subject: "Eesti keel", teacherUids: ["t1"], active: true } });
  const now = Date.UTC(2026, 9, 11, 9, 0, 0);
  const link = await createGuestLink({ db, Timestamp, FieldValue, actor: { uid: "t1", name: "Anhelina" }, studentId: "s1", title: "", origin: "https://crm.epkoolitus.ee", originAllowed: allowed, nowMs: now });
  const token = link.url.split("/tund/")[1];
  const invitation = db.store.get(`liveLessonInvitations/${link.invitationId}`);
  assert.equal(invitation.status, "pending");
  assert.equal(invitation.studentUid, "");
  assert.equal(invitation.title, "Eesti keel");
  assert.ok(!JSON.stringify([...db.store.values()].filter((v) => v.invitationId)).includes(token), "the raw token is not stored in the link record");

  const auth = { createCustomToken: async (uid, claims) => `custom:${uid}:${claims.liveInvitationId}` };
  const joined = await joinGuestLink({ db, Timestamp, FieldValue, auth, token, nowMs: now + 1000 });
  assert.match(joined.uid, /^guest_/);
  assert.equal(db.store.get(`liveLessonInvitations/${link.invitationId}`).status, "accepted");
  assert.equal(db.store.get(`liveLessonInvitations/${link.invitationId}`).studentUid, joined.uid);
  assert.deepEqual(db.store.get(`liveGuestGrants/${joined.uid}`).studentId, "s1");

  // the same browser rejoins with its uid; another device takes over and the first grant is removed
  const again = await joinGuestLink({ db, Timestamp, FieldValue, auth, token, guestUid: joined.uid, nowMs: now + 2000 });
  assert.equal(again.uid, joined.uid);
  const other = await joinGuestLink({ db, Timestamp, FieldValue, auth, token, nowMs: now + 3000 });
  assert.notEqual(other.uid, joined.uid);
  assert.equal(db.store.has(`liveGuestGrants/${joined.uid}`), false);
});

test("a cancelled, closed or expired lesson does not open", async () => {
  const db = fakeDb({ "students/s1": { name: "M", teacherUids: ["t1"] } });
  const now = Date.UTC(2026, 9, 11, 9, 0, 0);
  const link = await createGuestLink({ db, Timestamp, FieldValue, actor: { uid: "t1", name: "A" }, studentId: "s1", origin: "x", originAllowed: allowed, nowMs: now });
  const token = link.url.split("/tund/")[1];
  const auth = { createCustomToken: async () => "t" };
  await assert.rejects(joinGuestLink({ db, Timestamp, FieldValue, auth, token, nowMs: link.expiresAt + 1 }), /aegunud/);
  db.store.set(`liveLessonInvitations/${link.invitationId}`, { ...db.store.get(`liveLessonInvitations/${link.invitationId}`), status: "cancelled" });
  await assert.rejects(joinGuestLink({ db, Timestamp, FieldValue, auth, token, nowMs: now }), /tühistas/);
  await assert.rejects(createGuestLink({ db, Timestamp, FieldValue, actor: { uid: "t9" }, studentId: "s1", origin: "x", originAllowed: allowed, nowMs: now }), /ei ole sulle määratud/);
});
