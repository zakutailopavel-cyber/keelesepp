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
  // teachers only mark lessons: no invoice is readable or editable for them, not even its description
  const description = await documentRequest(teacher, "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=desc", { fields: { desc: str("Täpsustatud selgitus") } });
  assert.equal(description.status, 403, JSON.stringify(description.body));
  const read = await documentRequest(teacher, "GET", "invoices/sec-admin-invoice");
  assert.equal(read.status, 403, JSON.stringify(read.body));
  // „Ei kuulu raamatupidamisse” goes through financeApi only (audit, lock, tombstones): no direct write, even by an admin
  const directMark = await documentRequest(await adminToken(), "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=accountingExcluded", { fields: { accountingExcluded: { booleanValue: true } } });
  assert.equal(directMark.status, 403, "the bookkeeping mark is not a direct write");
  const adminDescription = await documentRequest(await adminToken(), "PATCH", "invoices/sec-admin-invoice?updateMask.fieldPaths=desc", { fields: { desc: str("Täpsustatud selgitus") } });
  assert.equal(adminDescription.status, 200, JSON.stringify(adminDescription.body));
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

test("invoice e-mails are for the administrator; a teacher sends none, not even of their own students", async () => {
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

  const teacherUid = tokenUid(teacher);
  await Promise.all([
    db().collection("students").doc("sec-own-student").set({ name: "Own Student", teacher: "Second Teacher", teacherUid, teacherUids: [teacherUid], parentEmail: "own@example.com", active: true }),
    db().collection("invoices").doc("sec-own-invoice").set({ num: "KS-2026-995", studentId: "sec-own-student", parentEmail: "own@example.com", amountCents: 2500, status: "Ootel", date: "2026-10-01" }),
  ]);
  for (const route of ["/send", "/remind"]) {
    const own = await api("invoiceApi", teacher, route, { invoiceId: "sec-own-invoice" });
    assert.equal(own.status, 403, `${route} ${JSON.stringify(own.body)}`);
  }
  const queue = await documentRequest(teacher, "GET", "emailQueue");
  assert.equal(queue.status, 403, JSON.stringify(queue.body));
});

test("the invoice PDF: the administrator and the invoice's own family, never a teacher or another family", async () => {
  requireSafeEmulatorEnvironment();
  const teacher = await account("sec-pdf-teacher@example.com", { role: "teacher", roles: ["teacher"], displayName: "Pdf Teacher" });
  const parent = await account("sec-pdf-parent@example.com", { role: "parent", roles: ["parent"] });
  const stranger = await account("sec-pdf-stranger@example.com", { role: "parent", roles: ["parent"] });
  await Promise.all([
    db().collection("students").doc("sec-pdf-student").set({ name: "Pdf Student", linkedParentIds: [tokenUid(parent)], active: true }),
    db().collection("invoices").doc("sec-pdf-invoice").set({ num: "KS-2026-990", studentId: "sec-pdf-student", studentName: "Pdf Student", amountCents: 2500, amount: 25, status: "Ootel", date: "2026-10-01", due: "2026-10-15", items: [{ description: "Keeletund", qty: 1, unitPrice: 25, amount: 25 }] }),
  ]);
  for (const [who, label] of [[teacher, "teacher"], [stranger, "another family"]]) {
    const refused = await api("invoiceApi", who, "/pdf", { invoiceId: "sec-pdf-invoice" });
    assert.equal(refused.status, 404, `${label}: ${JSON.stringify(refused.body)}`);
    assert.equal(refused.body.contentBase64, undefined);
  }
  const missing = await api("invoiceApi", parent, "/pdf", { invoiceId: "sec-no-such-invoice" });
  assert.equal(missing.status, 404, JSON.stringify(missing.body));
  const own = await api("invoiceApi", parent, "/pdf", { invoiceId: "sec-pdf-invoice" });
  assert.equal(own.status, 200, JSON.stringify(own.body));
  assert.equal(own.body.contentType, "application/pdf");
  assert.match(Buffer.from(own.body.contentBase64, "base64").subarray(0, 5).toString(), /^%PDF-/);
  const boss = await api("invoiceApi", await adminToken(), "/pdf", { invoiceId: "sec-pdf-invoice" });
  assert.equal(boss.status, 200, JSON.stringify(boss.body));
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

test("lesson tokens: the plan saves „Tunnipakett”; owed lessons are read by admin / finance only, not the card's parent", async () => {
  requireSafeEmulatorEnvironment();
  const adminUid = tokenUid(await adminToken());
  const plan = (billingMode) => ({ fields: {
    studentId: str("sec-tokens-student"), studentName: str("Paketi Laps"), lessonPriceCents: { integerValue: "2000" }, weeklyLessons: { integerValue: "2" },
    currency: str("EUR"), active: { booleanValue: true }, updatedAt: str("2026-10-29T10:00:00.000Z"), updatedByUid: str(adminUid), lessonMinutes: { integerValue: "60" }, billingMode: str(billingMode),
  } });
  const saved = await documentRequest(await adminToken(), "PATCH", "studentRevenuePlans/sec-tokens-student", plan("package"));
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  const unknown = await documentRequest(await adminToken(), "PATCH", "studentRevenuePlans/sec-tokens-student", plan("tokens"));
  assert.equal(unknown.status, 403, JSON.stringify(unknown.body));

  const parent = await account("sec-tokens-parent@example.com", { role: "parent", roles: ["parent"] });
  const other = await account("sec-tokens-other@example.com", { role: "parent", roles: ["parent"] });
  const finance = await account("sec-tokens-finance@example.com", { role: "finance", roles: ["finance"] });
  const teacher = await account("sec-tokens-teacher@example.com", { role: "teacher", roles: ["teacher"] });
  await Promise.all([
    db().collection("students").doc("sec-tokens-student").set({ name: "Paketi Laps", parentUid: tokenUid(parent), active: true }),
    db().collection("lessonPackageStates").doc("sec-tokens-lesson").set({ lessonId: "sec-tokens-lesson", studentId: "sec-tokens-student", status: "needs_attention", lessonDate: "2026-10-28" }),
  ]);
  // owner 2026-11-02: lessons left are seen by admin and the accountant only (review 2026-11-11: parents could read them)
  for (const [who, token, expected] of [["parent", parent, 403], ["finance", finance, 200], ["other parent", other, 403], ["teacher", teacher, 403]]) {
    const read = await documentRequest(token, "GET", "lessonPackageStates/sec-tokens-lesson");
    assert.equal(read.status, expected, `${who}: ${JSON.stringify(read.body)}`);
  }
  const write = await documentRequest(parent, "PATCH", "lessonPackageStates/sec-tokens-lesson", { fields: { status: str("cleared") } });
  assert.equal(write.status, 403, JSON.stringify(write.body));
});

// Review 2026-11-11 (B1, B2, B6, B7): lesson prices in finance activity entries, lessons left for families, a lesson
// created already billed, the invoice number counter.
test("finance activity entries are read by admin / finance only; other entries by staff", async () => {
  requireSafeEmulatorEnvironment();
  const admin = await adminToken();
  const teacher = await account("sec-act-teacher@example.com", { role: "teacher", roles: ["teacher"] });
  const finance = await account("sec-act-finance@example.com", { role: "finance", roles: ["finance"] });
  const parent = await account("sec-act-parent@example.com", { role: "parent", roles: ["parent"] });
  await Promise.all([
    db().collection("activityLog").doc("sec-act-plan").set({ type: "finance.revenue_plan_updated", label: "Plaan", meta: { lessonPriceCents: 2500 } }),
    db().collection("activityLog").doc("sec-act-invoice").set({ type: "invoice.created", label: "Arve" }),
    db().collection("activityLog").doc("sec-act-lesson").set({ type: "lesson.completed", label: "Tund" }),
    db().collection("activityLog").doc("sec-act-untyped").set({ label: "Vana kirje" }),
  ]);
  const cases = [
    ["teacher", teacher, "sec-act-plan", 403], ["teacher", teacher, "sec-act-invoice", 403], ["teacher", teacher, "sec-act-lesson", 200], ["teacher", teacher, "sec-act-untyped", 200],
    ["finance", finance, "sec-act-plan", 200], ["finance", finance, "sec-act-invoice", 200], ["finance", finance, "sec-act-lesson", 403],
    ["admin", admin, "sec-act-plan", 200], ["admin", admin, "sec-act-lesson", 200],
    ["parent", parent, "sec-act-plan", 403], ["parent", parent, "sec-act-lesson", 403],
  ];
  for (const [who, token, id, expected] of cases) {
    const read = await documentRequest(token, "GET", `activityLog/${id}`);
    assert.equal(read.status, expected, `${who} ${id}: ${JSON.stringify(read.body)}`);
  }
});

test("lesson packages and their ledger: admin / finance read them, the card's parent and student do not", async () => {
  requireSafeEmulatorEnvironment();
  const admin = await adminToken();
  const parent = await account("sec-pkg-parent@example.com", { role: "parent", roles: ["parent"] });
  const student = await account("sec-pkg-student@example.com", { role: "student", roles: ["student"] });
  const finance = await account("sec-pkg-finance@example.com", { role: "finance", roles: ["finance"] });
  await Promise.all([
    db().collection("students").doc("sec-pkg-student").set({ name: "Paketi Õpilane", parentUid: tokenUid(parent), linkedUserId: tokenUid(student), active: true }),
    db().collection("studentPackages").doc("sec-pkg-1").set({ studentId: "sec-pkg-student", balanceCredits: 3, status: "active" }),
    db().collection("packageLedger").doc("sec-pkg-ledger-1").set({ studentId: "sec-pkg-student", creditsDelta: -1 }),
  ]);
  for (const path of ["studentPackages/sec-pkg-1", "packageLedger/sec-pkg-ledger-1"]) {
    for (const [who, token, expected] of [["admin", admin, 200], ["finance", finance, 200], ["parent", parent, 403], ["student", student, 403]]) {
      const read = await documentRequest(token, "GET", path);
      assert.equal(read.status, expected, `${who} ${path}: ${JSON.stringify(read.body)}`);
    }
  }
});

test("a lesson cannot be created already billed, invoiced, paid, waived or checked", async () => {
  requireSafeEmulatorEnvironment();
  const admin = await adminToken();
  const teacher = await account("sec-create-teacher@example.com", { role: "teacher", roles: ["teacher"], displayName: "Loo Õpetaja" });
  const teacherUid = tokenUid(teacher);
  const lesson = (extra = {}) => ({ fields: {
    studentId: str("sec-create-student"), studentName: str("Mari"), teacherUid: str(teacherUid), teacher: str("Loo Õpetaja"),
    date: str("2026-12-17"), status: str("Toimunud"), duration: { integerValue: "60" }, accountingSource: str("crm_v2"), ...extra,
  } });
  const forged = {
    billingStatus: str("invoiced"), invoiceId: str("inv-1"), invoiceNum: str("KS-2026-001"), billedAmountCents: { integerValue: "2500" },
    directPaymentId: str("pay-1"), creditNoteId: str("cn-1"), bankTransactionId: str("bank-1"),
    billingWaived: { booleanValue: true }, verified: { booleanValue: true }, verifiedByUid: str(teacherUid),
  };
  for (const [key, value] of Object.entries(forged)) {
    const created = await documentRequest(teacher, "PATCH", `lessons/sec-create-${key}`, lesson({ [key]: value }));
    assert.equal(created.status, 403, `teacher with ${key}: ${JSON.stringify(created.body)}`);
  }
  const billedByAdmin = await documentRequest(admin, "PATCH", "lessons/sec-create-admin-billed", lesson({ invoiceId: str("inv-1") }));
  assert.equal(billedByAdmin.status, 403, JSON.stringify(billedByAdmin.body));
  const checkedByAdmin = await documentRequest(admin, "PATCH", "lessons/sec-create-admin-checked", lesson({ verified: { booleanValue: true } }));
  assert.equal(checkedByAdmin.status, 200, JSON.stringify(checkedByAdmin.body));
  const plain = await documentRequest(teacher, "PATCH", "lessons/sec-create-plain", lesson());
  assert.equal(plain.status, 200, JSON.stringify(plain.body));
});

test("the invoice number counter: only the server writes it, admin / finance read it", async () => {
  requireSafeEmulatorEnvironment();
  const admin = await adminToken();
  const teacher = await account("sec-counter-teacher@example.com", { role: "teacher", roles: ["teacher"] });
  const finance = await account("sec-counter-finance@example.com", { role: "finance", roles: ["finance"] });
  const before = await db().collection("meta").doc("invoiceCounter").get();
  if (!before.exists) await db().collection("meta").doc("invoiceCounter").set({ seq: 0 });
  for (const [who, token, expected] of [["admin", admin, 200], ["finance", finance, 200], ["teacher", teacher, 403]]) {
    const read = await documentRequest(token, "GET", "meta/invoiceCounter");
    assert.equal(read.status, expected, `${who} read: ${JSON.stringify(read.body)}`);
    const write = await documentRequest(token, "PATCH", "meta/invoiceCounter?updateMask.fieldPaths=seq", { fields: { seq: { integerValue: "1" } } });
    assert.equal(write.status, 403, `${who} write: ${JSON.stringify(write.body)}`);
  }
});
