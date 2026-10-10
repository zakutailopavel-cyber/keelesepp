"use strict";

// Security review 2026-10-10 (finance): invoices are made by the finance functions, a teacher cannot redirect an
// invoice or mail every unpaid invoice, an unverified e-mail does not open someone's invoice, a server-journal
// lesson's status changes only through the journal, one calendar lesson is not billed twice.
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

const tokenUid = (token) => JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).user_id;

async function signUp(email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`signUp failed: ${JSON.stringify(body)}`);
  return body.idToken;
}

async function signIn(email) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  if (!response.ok || !body.idToken) throw new Error(`signIn failed: ${JSON.stringify(body)}`);
  return body.idToken;
}

async function account(email, profile) {
  let token;
  try { token = await signUp(email); } catch { token = await signIn(email); }
  await db().collection("users").doc(tokenUid(token)).set({ email, displayName: profile.displayName || email, ...profile });
  return token;
}

const adminToken = () => account("zakutailo.pavel@gmail.com", { role: "admin", roles: ["admin"], displayName: "Pavel Zakutailo" });

async function documentRequest(token, method, path, body) {
  const response = await fetch(`http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function api(fn, token, path, payload = {}) {
  const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/${fn}${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const str = (value) => ({ stringValue: value });

test("a teacher cannot create an invoice directly or redirect one; the administrator can create", async () => {
  requireSafeEmulatorEnvironment();
  const teacher = await account("sec-teacher@example.com", { role: "teacher", roles: ["teacher"], displayName: "Sec Teacher" });
  const created = await documentRequest(teacher, "PATCH", "invoices/sec-forged-invoice", {
    fields: { num: str("KS-2026-999"), amount: { integerValue: "500" }, payerEmail: str("victim@example.com"), status: str("Ootel"), date: str("2026-10-10") },
  });
  assert.equal(created.status, 403, JSON.stringify(created.body));

  const adminCreated = await documentRequest(await adminToken(), "PATCH", "invoices/sec-admin-invoice", {
    fields: { num: str("KS-2026-998"), amount: { integerValue: "40" }, status: str("Ootel"), date: str("2026-10-10"), desc: str("Käsitsi") },
  });
  assert.equal(adminCreated.status, 200, JSON.stringify(adminCreated.body));

  const redirect = await documentRequest(teacher, "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=payerEmail", { fields: { payerEmail: str("victim@example.com") } });
  assert.equal(redirect.status, 403, JSON.stringify(redirect.body));
  const renumber = await documentRequest(teacher, "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=num", { fields: { num: str("KS-2026-001") } });
  assert.equal(renumber.status, 403, JSON.stringify(renumber.body));
  const description = await documentRequest(teacher, "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=desc", { fields: { desc: str("Täpsustatud selgitus") } });
  assert.equal(description.status, 200, JSON.stringify(description.body));
});

test("an unverified e-mail does not open an invoice addressed to it; a verified one does", async () => {
  requireSafeEmulatorEnvironment();
  const email = "sec-payer@example.com";
  let payer = await account(email, { role: "parent", roles: ["parent"] });
  await db().collection("invoices").doc("sec-payer-invoice").set({ num: "KS-2026-997", payerEmail: email, payerEmailLower: email, amountCents: 1000, status: "Ootel", date: "2026-10-01" });
  const unverified = await documentRequest(payer, "GET", "invoices/sec-payer-invoice");
  assert.equal(unverified.status, 403, JSON.stringify(unverified.body));
  await admin.auth().updateUser(tokenUid(payer), { emailVerified: true });
  payer = await signIn(email);
  const verified = await documentRequest(payer, "GET", "invoices/sec-payer-invoice");
  assert.equal(verified.status, 200, JSON.stringify(verified.body));
});

test("batch reminders are for the administrator; a teacher sends only invoices of their own students", async () => {
  requireSafeEmulatorEnvironment();
  const teacher = await account("sec-teacher2@example.com", { role: "teacher", roles: ["teacher"], displayName: "Second Teacher" });
  const overdue = await api("invoiceApi", teacher, "/overdue-reminders", { force: true });
  assert.equal(overdue.status, 403, JSON.stringify(overdue.body));
  const monthly = await api("invoiceApi", teacher, "/monthly-reminders", { force: true });
  assert.equal(monthly.status, 403, JSON.stringify(monthly.body));

  await Promise.all([
    db().collection("students").doc("sec-other-student").set({ name: "Other Student", teacher: "Kati Kask", teacherUid: "someone-else", parentEmail: "other@example.com", active: true }),
    db().collection("invoices").doc("sec-other-invoice").set({ num: "KS-2026-996", studentId: "sec-other-student", parentEmail: "other@example.com", amountCents: 2500, status: "Ootel", date: "2026-10-01" }),
  ]);
  const send = await api("invoiceApi", teacher, "/send", { invoiceId: "sec-other-invoice" });
  assert.equal(send.status, 403, JSON.stringify(send.body));
});

test("the status of a server-journal lesson changes only through the journal", async () => {
  requireSafeEmulatorEnvironment();
  const token = await adminToken();
  await Promise.all([
    db().collection("lessons").doc("sec-journal-lesson").set({ studentId: "sec-s1", date: "2026-10-05", status: "Puudus_p", billingStatus: "", accountingSource: "lesson_journal_v2", teacherUid: "x" }),
    db().collection("lessons").doc("sec-crm-lesson").set({ studentId: "sec-s1", date: "2026-10-06", status: "Puudus_p", billingStatus: "", accountingSource: "crm_v2", teacherUid: "x" }),
  ]);
  const journal = await documentRequest(token, "PATCH", "lessons/sec-journal-lesson?updateMask.fieldPaths=status", { fields: { status: str("Toimunud") } });
  assert.equal(journal.status, 403, JSON.stringify(journal.body));
  const crm = await documentRequest(token, "PATCH", "lessons/sec-crm-lesson?updateMask.fieldPaths=status", { fields: { status: str("Toimunud") } });
  assert.equal(crm.status, 200, JSON.stringify(crm.body));
});

test("two records of the same calendar lesson are not billed", async () => {
  requireSafeEmulatorEnvironment();
  const token = await adminToken();
  await db().collection("students").doc("sec-dup-student").set({ name: "Dup Student", lessonPrice: 25, parentEmail: "dup@example.com", active: true });
  await Promise.all([
    db().collection("lessons").doc("schedule_sec-slot_2026-09-14_sec-dup-student").set({ studentId: "sec-dup-student", scheduleId: "sec-slot", date: "2026-09-14", status: "Toimunud", billingStatus: "unbilled" }),
    db().collection("lessons").doc("scheduled_sec_dup_server").set({ studentId: "sec-dup-student", scheduleId: "sec-slot", date: "2026-09-14", status: "Toimunud", billingStatus: "unbilled" }),
  ]);
  const result = await api("financeApi", token, "/invoices/from-lessons", {
    studentId: "sec-dup-student", lessonIds: ["schedule_sec-slot_2026-09-14_sec-dup-student"], due: "2026-10-20", requestId: "sec_dup_invoice_0001",
  });
  assert.equal(result.status, 409, JSON.stringify(result.body));
  assert.match(result.body.error, /duplicates another record/);
});
