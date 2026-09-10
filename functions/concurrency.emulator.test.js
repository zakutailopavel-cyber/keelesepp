"use strict";
// This file contains the exact concurrency tests used via emulator to prove the system's safety.
// These should be run against the local Firebase emulators (Auth, Firestore, Functions) during CI.

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";
let adminTokenPromise;

function isSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) return false;
  if (!AUTH_EMULATOR || !FIRESTORE_EMULATOR) return false;
  return true;
}

if (isSafeEmulatorEnvironment()) {
  if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

async function getAdminToken() {
  if (adminTokenPromise) return adminTokenPromise;
  adminTokenPromise = (async () => {
    const res = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `admin-${Date.now()}@example.com`, password: "password", returnSecureToken: true }),
    });
    const body = await res.json();
    const uid = body.localId;
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    const signRes = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: "password", returnSecureToken: true }),
    });
    const signBody = await signRes.json();
    return signBody.idToken;
  })();
  return adminTokenPromise;
}

async function callEndpoint(path, payload) {
  const token = await getAdminToken();
  const res = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ data: payload }),
  });
  return res.json();
}

test("concurrency: duplicate bankTransactions.externalId safety", async (t) => {
  if (!isSafeEmulatorEnvironment()) {
    t.skip("Skipping emulator tests because environment is not configured.");
    return;
  }
  const db = admin.firestore();

  const requestId1 = `test-concurrency-extid-1-${Date.now()}`;
  const requestId2 = `test-concurrency-extid-2-${Date.now()}`;
  const externalId = `ext-${Date.now()}`;

  const payload1 = {
    date: "2023-01-01",
    amount: "100.00",
    externalId,
    payerName: "John Doe",
    requestId: requestId1
  };
  const payload2 = {
    date: "2023-01-01",
    amount: "100.00",
    externalId,
    payerName: "John Doe",
    requestId: requestId2
  };

  const [res1, res2] = await Promise.all([
    callEndpoint("financeAllocateBankTransaction", payload1),
    callEndpoint("financeAllocateBankTransaction", payload2)
  ]);

  const successCount = [res1, res2].filter(r => r.result && r.result.bankTransaction).length;
  const conflictCount = [res1, res2].filter(r => r.error && (r.error.status === "ALREADY_EXISTS" || r.error.status === "ABORTED" || r.error.message.includes("externalId already exists"))).length;

  assert.equal(successCount, 1, "Exactly one transaction should succeed");
  assert.equal(conflictCount, 1, "Exactly one transaction should fail due to conflict");
});

test("concurrency: package consumption vs invoice creation safety", async (t) => {
  if (!isSafeEmulatorEnvironment()) {
    t.skip("Skipping emulator tests because environment is not configured.");
    return;
  }
  const db = admin.firestore();
  const studentId = `stu-sync-${Date.now()}`;
  const packageId = `pkg-sync-${Date.now()}`;
  const lessonId = `les-sync-${Date.now()}`;

  await db.collection("packages").doc(packageId).set({
    studentId,
    status: "active",
    lessonCount: 5,
    consumedCount: 0,
    priceCents: 50000
  });

  await db.collection("lessons").doc(lessonId).set({
    studentId,
    packageId,
    status: "held",
    billingStatus: "unbilled",
    date: "2023-01-02"
  });

  const requestId1 = `sync-pkg-${Date.now()}`;
  const requestId2 = `sync-inv-${Date.now()}`;

  const [res1, res2] = await Promise.all([
    callEndpoint("financeSyncLessonPackageConsumption", { lessonId, requestId: requestId1 }),
    callEndpoint("financeGenerateInvoiceFromLessons", { lessonIds: [lessonId], studentId, requestId: requestId2 })
  ]);

  const pkgSuccess = res1.result && res1.result.lesson && res1.result.lesson.billingStatus === "packaged";
  const invSuccess = res2.result && res2.result.invoice;

  assert.ok(!(pkgSuccess && invSuccess), "Both operations cannot succeed concurrently");
  assert.ok(pkgSuccess || invSuccess, "At least one operation should succeed");

  const finalLesson = await db.collection("lessons").doc(lessonId).get();
  assert.ok(["packaged", "billed"].includes(finalLesson.data().billingStatus), "Lesson should be cleanly packaged or billed");
});
