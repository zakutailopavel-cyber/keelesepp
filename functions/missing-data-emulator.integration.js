"use strict";

// „Puuduvad andmed” (owner 2026-10-25) against the real Firestore rules and staffOperationsApi (emulators): only the
// administrator reads / writes the setting and the audit records; a student or parent gets questions only for their
// own cards and the server writes only the missing fields of those cards (never others, never other students).
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing integration test for non-demo project: ${activeProject || "missing"}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR || "") || !/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR || "")) {
    throw new Error("Auth and Firestore emulator hosts are required");
  }
}

function db() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  return admin.firestore();
}

const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const mail = (role, name) => `miss-${role}-${name.replace(/\s+/g, "")}-${run}@example.com`.toLowerCase();
async function account(role, name) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mail(role, name), password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.idToken, JSON.stringify(body));
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url").toString("utf8")).user_id;
  await db().collection("users").doc(uid).set({ role, displayName: name, email: mail(role, name) });
  return { token: body.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const docUrl = (path) => `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
const put = (who, path, data) => fetch(docUrl(path), { method: "PATCH", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }) }).then((r) => r.status);
const get = (who, path) => fetch(docUrl(path), { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, path) => fetch(docUrl(path), { method: "DELETE", headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const list = (who, collection) => fetch(docUrl(collection), { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

async function api(who, path, payload = {}) {
  const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/staffOperationsApi/missing-data${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}


test("Puuduvad andmed: rules, own cards only, only missing fields, parent per child, audit, report", async () => {
  requireSafeEmulatorEnvironment();
  const boss = await account("admin", "Boss");
  const teacher = await account("teacher", "Opetaja");
  const kai = await account("student", "Kai");
  const parent = await account("parent", "Ema Tamm");
  const other = await account("student", "Teine");

  // settings: the administrator only, fixed keys and values
  assert.equal(await put(boss, "missingDataSettings/current", { items: { availability: "required", email: "required", phone: "optional", parentName: "optional", language: "required", grade: "required" }, updatedByUid: boss.uid }), 200, "admin saves settings");
  assert.equal(await put(boss, "missingDataSettings/current", { items: { email: "maybe" }, updatedByUid: boss.uid }), 403, "invalid mode");
  assert.equal(await put(boss, "missingDataSettings/current", { items: { salary: "off" }, updatedByUid: boss.uid }), 403, "unknown item");
  assert.equal(await put(boss, "missingDataSettings/other", { items: {}, updatedByUid: boss.uid }), 403, "one document");
  assert.equal(await put(teacher, "missingDataSettings/current", { items: {}, updatedByUid: teacher.uid }), 403, "teacher cannot");
  assert.equal(await put(kai, "missingDataSettings/current", { items: { email: "off" }, updatedByUid: kai.uid }), 403, "student cannot switch it off");
  assert.equal(await get(kai, "missingDataSettings/current"), 403);
  assert.equal(await get(boss, "missingDataSettings/current"), 200);

  // cards: Kai (own account, age unknown), the parent's two children, someone else's card
  const sk = `miss-k-${run}`; const s1 = `miss-c1-${run}`; const s2 = `miss-c2-${run}`; const so = `miss-o-${run}`;
  await db().collection("students").doc(sk).set({ name: "Kai", active: true, linkedUserId: kai.uid });
  await db().collection("students").doc(s1).set({ name: "Mari", active: true, grade: "4. klass", linkedParentId: parent.uid, teacher: "Opetaja" });
  await db().collection("students").doc(s2).set({ name: "Jüri", active: true, linkedParentIds: [parent.uid], email: "" });
  await db().collection("students").doc(so).set({ name: "Teine", active: true, grade: "Täiskasvanu", linkedUserId: other.uid, email: "teine@example.com" });
  await db().collection("studentAvailability").doc(s1).set({ studentId: s1, slots: ["Mon-17:00", "Mon-17:30"], preferred: [] });

  // what is asked: own cards only
  const kaiMine = await api(kai, "/mine");
  assert.equal(kaiMine.status, 200, JSON.stringify(kaiMine.body));
  assert.equal(kaiMine.body.blocks, true);
  assert.deepEqual(kaiMine.body.cards.map((card) => [card.studentId, card.kind]), [[sk, "unknown"]]);
  assert.equal(JSON.stringify(kaiMine.body).includes(so), false, "nothing about other learners");
  const parentMine = await api(parent, "/mine");
  assert.deepEqual(parentMine.body.cards.map((card) => [card.studentId, card.ask]).sort(), [[s2, ["availability", "grade"]]], "Mari has times and class; Jüri misses both");
  assert.deepEqual(parentMine.body.profile.ask, ["phone", "language"], "the parent answers phone and language once");
  assert.deepEqual((await api(teacher, "/mine")).body.cards, [], "staff are never asked");

  // writes: never another card, never a field that is not missing, required ones enforced, values checked
  assert.equal((await api(kai, "/save", { cards: { [so]: { email: "x@example.com" } } })).status, 403, "not her card");
  const missingRequired = await api(kai, "/save", { cards: { [sk]: { grade: "Täiskasvanu" } } });
  assert.equal(missingRequired.status, 400);
  assert.equal(missingRequired.body.details[sk].availability, "required");
  assert.equal((await api(kai, "/save", { cards: { [sk]: { grade: "Täiskasvanu", email: "nope", language: "et", availability: { slots: ["Tue-18:00"] } } } })).status, 400, "bad e-mail");
  const saved = await api(kai, "/save", { cards: { [sk]: { grade: "Täiskasvanu", email: "Kai@Example.com", phone: "5123 4567", language: "ru", availability: { slots: ["Tue-18:00", "Tue-18:30"], preferred: ["Tue-18:00"] }, name: "Hacked", teacher: "Keegi", linkedUserId: "x" } } });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  const kaiCard = (await db().collection("students").doc(sk).get()).data();
  assert.equal(kaiCard.name, "Kai", "other fields untouched");
  assert.equal(kaiCard.linkedUserId, kai.uid);
  assert.equal(kaiCard.teacher, undefined);
  assert.deepEqual([kaiCard.grade, kaiCard.email, kaiCard.phone, kaiCard.preferredLanguage], ["Täiskasvanu", "kai@example.com", "+37251234567", "ru"]);
  const kaiTimes = (await db().collection("studentAvailability").doc(sk).get()).data();
  assert.deepEqual([kaiTimes.slots, kaiTimes.preferred, kaiTimes.changedByUid, kaiTimes.changedByRole], [["Tue-18:00", "Tue-18:30"], ["Tue-18:00"], kai.uid, "student"]);
  assert.deepEqual((await api(kai, "/mine")).body.cards, [], "nothing missing any more");
  // filled values are never overwritten through this route
  await db().collection("students").doc(sk).update({ email: "" });
  await api(kai, "/save", { cards: { [sk]: { email: "new@example.com", phone: "+3725999999" } } });
  const again = (await db().collection("students").doc(sk).get()).data();
  assert.equal(again.email, "new@example.com");
  assert.equal(again.phone, "+37251234567", "phone stayed");

  // parent: per child + own profile; Mari's existing times untouched
  const parentSave = await api(parent, "/save", { cards: { [s2]: { grade: "2014", availability: { slots: ["Wed-16:00", "Wed-16:30"] } }, [s1]: { grade: "9. klass" } }, profile: { language: "ru", phone: "+358 40 123 4567" } });
  assert.equal(parentSave.status, 200, JSON.stringify(parentSave.body));
  assert.equal((await db().collection("students").doc(s2).get()).data().birthYear, 2014);
  assert.equal((await db().collection("students").doc(s1).get()).data().grade, "4. klass", "Mari's class not overwritten");
  const parentProfile = (await db().collection("users").doc(parent.uid).get()).data();
  assert.deepEqual([parentProfile.preferredLanguage, parentProfile.phone, parentProfile.role], ["ru", "+358401234567", "parent"]);
  assert.equal((await api(parent, "/mine")).body.blocks, false);

  // audit: who, when, before → after; admin reads and marks seen; nobody else writes or reads it
  const audits = await db().collection("missingDataSubmissions").where("byUid", "in", [kai.uid, parent.uid]).get();
  assert.equal(audits.size, 3);
  const parentAudit = audits.docs.find((doc) => doc.data().byUid === parent.uid);
  assert.deepEqual(parentAudit.data().changes.map((item) => `${item.target}:${item.field}`).sort(), ["availability:slots", "profile:phone", "profile:preferredLanguage", "student:birthYear"].sort());
  assert.equal(parentAudit.data().reviewedAt, "");
  const auditPath = `missingDataSubmissions/${parentAudit.id}`;
  assert.equal(await get(parent, auditPath), 403);
  assert.equal(await get(teacher, auditPath), 403);
  assert.equal(await put(parent, `missingDataSubmissions/miss-forged-${run}`, { byUid: parent.uid }), 403, "no forged audit");
  assert.equal(await put(boss, `missingDataSubmissions/miss-forged-${run}`, { byUid: boss.uid }), 403, "admin does not create them");
  assert.equal(await get(boss, auditPath), 200);
  const review = (extra) => fetch(`${docUrl(auditPath)}?updateMask.fieldPaths=reviewedAt&updateMask.fieldPaths=reviewedByUid&updateMask.fieldPaths=reviewedByName${extra.mask || ""}`, {
    method: "PATCH", headers: { Authorization: `Bearer ${extra.who.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(extra.data).map(([k, v]) => [k, enc(v)])) }),
  }).then((r) => r.status);
  assert.equal(await review({ who: boss, data: { reviewedAt: new Date().toISOString(), reviewedByUid: boss.uid, reviewedByName: "Boss", changes: [] }, mask: "&updateMask.fieldPaths=changes" }), 403, "the audit itself cannot change");
  assert.equal(await review({ who: teacher, data: { reviewedAt: new Date().toISOString(), reviewedByUid: teacher.uid, reviewedByName: "Opetaja" } }), 403);
  assert.equal(await review({ who: boss, data: { reviewedAt: new Date().toISOString(), reviewedByUid: boss.uid, reviewedByName: "Boss" } }), 200);
  assert.equal(await del(boss, auditPath), 403);

  // report: administrator only
  assert.equal((await api(kai, "/report")).status, 403);
  assert.equal((await api(teacher, "/report")).status, 403);
  const report = await api(boss, "/report");
  assert.equal(report.status, 200, JSON.stringify(report.body));
  const row = (id) => report.body.rows.find((item) => item.studentId === id);
  assert.deepEqual(row(s1).missing, [], "Mari: parent's e-mail, phone, language from the parent's profile");
  assert.equal(row(s1).account, "parent");
  assert.deepEqual(row(so).missing, ["availability", "phone", "language"]);
  assert.equal(row(so).wouldSee, true);

  // switching an item off stops asking it
  await db().collection("missingDataSettings").doc("current").set({ items: { availability: "off", email: "off", phone: "off", parentName: "off", language: "off", grade: "off" } });
  assert.deepEqual((await api(other, "/mine")).body.cards, []);
  await db().collection("missingDataSettings").doc("current").delete();
});
