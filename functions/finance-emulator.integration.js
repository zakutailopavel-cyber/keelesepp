"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";
let adminTokenPromise;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) {
    throw new Error(`Refusing finance integration test for non-demo project: ${activeProject || "missing"}`);
  }
  if (!AUTH_EMULATOR || !FIRESTORE_EMULATOR) {
    throw new Error("Auth and Firestore emulator hosts are required");
  }
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR)) {
    throw new Error(`Unsafe Auth emulator host: ${AUTH_EMULATOR}`);
  }
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR)) {
    throw new Error(`Unsafe Firestore emulator host: ${FIRESTORE_EMULATOR}`);
  }
}

function tokenUid(token) {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  return payload.user_id || payload.sub;
}

async function createAdminToken() {
  if (!adminTokenPromise) {
    adminTokenPromise = (async () => {
      const response = await fetch(
        `http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "zakutailo.pavel@gmail.com",
            password: "emulator-only-password",
            returnSecureToken: true,
          }),
        },
      );
      const body = await response.json();
      if (!response.ok || !body.idToken) {
        throw new Error(`Unable to create emulator admin token: ${response.status} ${JSON.stringify(body)}`);
      }
      return body.idToken;
    })();
  }
  return adminTokenPromise;
}

async function createUserToken(email) {
  const response = await fetch(
    `http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "emulator-only-password",
        returnSecureToken: true,
      }),
    },
  );
  const body = await response.json();
  if (!response.ok || !body.idToken) {
    throw new Error(`Unable to create emulator user token: ${response.status} ${JSON.stringify(body)}`);
  }
  return body.idToken;
}

async function firestoreDocumentRequest(token, method, documentPath, body) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${documentPath}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function financeRequest(token, path, payload) {
  const response = await fetch(
    `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/financeApi${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const body = await response.json();
  return { status: response.status, body };
}

test("lesson invoice and lesson credit stay atomic, idempotent, and auditable", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();

  await db.collection("students").doc("student-a").set({
    name: "Emulator Student",
    email: "student@example.com",
    parentName: "Emulator Parent",
    parentEmail: "parent@example.com",
    lessonPrice: 25,
    lessonsSinceInvoice: 2,
    active: true,
  });
  await Promise.all([
    db.collection("lessons").doc("lesson-a").set({
      studentId: "student-a",
      studentName: "Emulator Student",
      date: "2026-07-07",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
    db.collection("lessons").doc("lesson-b").set({
      studentId: "student-a",
      studentName: "Emulator Student",
      date: "2026-07-14",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
  ]);

  const invoicePayload = {
    studentId: "student-a",
    lessonIds: ["lesson-a", "lesson-b"],
    due: "2026-08-10",
    description: "Emulator lesson invoice",
    paymentReference: "EMULATOR-001",
    requestId: "emulator_invoice_0001",
  };
  const created = await financeRequest(token, "/invoices/from-lessons", invoicePayload);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.idempotent, false);
  assert.equal(created.body.invoice.amountCents, 5000);
  assert.deepEqual(created.body.invoice.lessonIds, ["lesson-a", "lesson-b"]);

  const [invoiceSnap, lessonASnap, lessonBSnap, studentSnap, invoiceAuditSnap] = await Promise.all([
    db.collection("invoices").doc(invoicePayload.requestId).get(),
    db.collection("lessons").doc("lesson-a").get(),
    db.collection("lessons").doc("lesson-b").get(),
    db.collection("students").doc("student-a").get(),
    db.collection("financialAudit").doc(invoicePayload.requestId).get(),
  ]);
  assert.equal(invoiceSnap.data().lines.length, 2);
  assert.equal(invoiceSnap.data().lineVersion, 1);
  assert.equal(lessonASnap.data().billingStatus, "invoiced");
  assert.equal(lessonBSnap.data().billingStatus, "invoiced");
  assert.equal(lessonASnap.data().invoiceId, invoicePayload.requestId);
  assert.equal(studentSnap.data().lessonsSinceInvoice, 0);
  assert.equal(invoiceAuditSnap.data().action, "invoice.created_from_lessons");

  const invoiceRetry = await financeRequest(token, "/invoices/from-lessons", invoicePayload);
  assert.equal(invoiceRetry.status, 200, JSON.stringify(invoiceRetry.body));
  assert.equal(invoiceRetry.body.idempotent, true);
  assert.equal((await db.collection("meta").doc("invoiceCounter").get()).data().seq, 1);

  const doubleBill = await financeRequest(token, "/invoices/from-lessons", {
    ...invoicePayload,
    lessonIds: ["lesson-a"],
    requestId: "emulator_invoice_0002",
  });
  assert.equal(doubleBill.status, 409);
  assert.match(doubleBill.body.error, /not currently billable/);

  const creditPayload = {
    invoiceId: invoicePayload.requestId,
    lessonId: "lesson-a",
    reason: "Emulator correction",
    requestId: "emulator_credit_0001",
  };
  const credited = await financeRequest(token, "/invoices/credit-lesson-line", creditPayload);
  assert.equal(credited.status, 201, JSON.stringify(credited.body));
  assert.equal(credited.body.idempotent, false);
  assert.equal(credited.body.creditNote.amountCents, 2500);
  assert.equal(credited.body.creditNote.lines[0].amountCents, -2500);

  const [creditedInvoiceSnap, creditedLessonSnap, remainingLessonSnap, creditNoteSnap, creditAuditSnap] = await Promise.all([
    db.collection("invoices").doc(invoicePayload.requestId).get(),
    db.collection("lessons").doc("lesson-a").get(),
    db.collection("lessons").doc("lesson-b").get(),
    db.collection("creditNotes").doc(creditPayload.requestId).get(),
    db.collection("financialAudit").doc(creditPayload.requestId).get(),
  ]);
  const creditedInvoice = creditedInvoiceSnap.data();
  assert.equal(creditedInvoice.amountCents, 5000);
  assert.equal(creditedInvoice.effectiveAmountCents, 2500);
  assert.equal(creditedInvoice.balanceDueCents, 2500);
  assert.deepEqual(creditedInvoice.correctedLessonIds, ["lesson-a"]);
  assert.equal(creditedLessonSnap.data().billingStatus, "credited");
  assert.equal(remainingLessonSnap.data().billingStatus, "invoiced");
  assert.equal(remainingLessonSnap.data().invoiceId, invoicePayload.requestId);
  assert.equal(creditNoteSnap.data().invoiceId, invoicePayload.requestId);
  assert.equal(creditNoteSnap.data().reason, creditPayload.reason);
  assert.equal(creditAuditSnap.data().action, "invoice.lesson_line_credited");

  const creditRetry = await financeRequest(token, "/invoices/credit-lesson-line", creditPayload);
  assert.equal(creditRetry.status, 200, JSON.stringify(creditRetry.body));
  assert.equal(creditRetry.body.idempotent, true);
  assert.equal((await db.collection("meta").doc("creditNoteCounter").get()).data().seq, 1);

  const duplicateCredit = await financeRequest(token, "/invoices/credit-lesson-line", {
    ...creditPayload,
    requestId: "emulator_credit_0002",
  });
  assert.equal(duplicateCredit.status, 409);
  assert.match(duplicateCredit.body.error, /not actively invoiced/);
});

test("versioned tariffs and assignments price invoice lines by lesson date", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();

  await db.collection("students").doc("student-tariff").set({
    name: "Tariff Student",
    email: "tariff-student@example.com",
    parentName: "Tariff Parent",
    parentEmail: "tariff-parent@example.com",
    lessonPrice: 20,
    lessonsSinceInvoice: 2,
    active: true,
  });
  await Promise.all([
    db.collection("lessons").doc("lesson-tariff-old").set({
      studentId: "student-tariff",
      studentName: "Tariff Student",
      date: "2026-07-07",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
    db.collection("lessons").doc("lesson-tariff-new").set({
      studentId: "student-tariff",
      studentName: "Tariff Student",
      date: "2026-07-21",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
  ]);

  const oldTariffPayload = {
    name: "Individual lesson July",
    unitPrice: 30,
    effectiveFrom: "2026-07-01",
    requestId: "emulator_tariff_0001",
  };
  const newTariffPayload = {
    name: "Individual lesson new price",
    unitPrice: 35,
    effectiveFrom: "2026-07-15",
    requestId: "emulator_tariff_0002",
  };
  const oldTariff = await financeRequest(token, "/tariffs", oldTariffPayload);
  const newTariff = await financeRequest(token, "/tariffs", newTariffPayload);
  assert.equal(oldTariff.status, 201, JSON.stringify(oldTariff.body));
  assert.equal(newTariff.status, 201, JSON.stringify(newTariff.body));
  assert.equal(oldTariff.body.tariff.unitPriceCents, 3000);
  assert.equal(newTariff.body.tariff.unitPriceCents, 3500);

  const oldAssignmentPayload = {
    studentId: "student-tariff",
    tariffId: oldTariffPayload.requestId,
    effectiveFrom: "2026-07-01",
    requestId: "emulator_assignment_0001",
  };
  const newAssignmentPayload = {
    studentId: "student-tariff",
    tariffId: newTariffPayload.requestId,
    effectiveFrom: "2026-07-15",
    requestId: "emulator_assignment_0002",
  };
  const oldAssignment = await financeRequest(
    token,
    "/students/tariff-assignments",
    oldAssignmentPayload,
  );
  const newAssignment = await financeRequest(
    token,
    "/students/tariff-assignments",
    newAssignmentPayload,
  );
  assert.equal(oldAssignment.status, 201, JSON.stringify(oldAssignment.body));
  assert.equal(newAssignment.status, 201, JSON.stringify(newAssignment.body));

  const oldAssignmentSnap = await db.collection("studentTariffAssignments")
    .doc(oldAssignmentPayload.requestId)
    .get();
  assert.equal(oldAssignmentSnap.data().effectiveUntil, "2026-07-14");
  assert.equal(oldAssignmentSnap.data().status, "superseded");
  assert.equal(oldAssignmentSnap.data().unitPriceCents, 3000);

  const adminTariffRead = await firestoreDocumentRequest(
    token,
    "GET",
    `tariffs/${oldTariffPayload.requestId}`,
  );
  assert.equal(adminTariffRead.status, 200, JSON.stringify(adminTariffRead.body));
  const clientTariffWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `tariffs/${oldTariffPayload.requestId}`,
    { fields: { name: { stringValue: "Forbidden client rewrite" } } },
  );
  assert.equal(clientTariffWrite.status, 403, JSON.stringify(clientTariffWrite.body));
  const clientAssignmentWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `studentTariffAssignments/${oldAssignmentPayload.requestId}`,
    { fields: { unitPriceCents: { integerValue: "1" } } },
  );
  assert.equal(clientAssignmentWrite.status, 403, JSON.stringify(clientAssignmentWrite.body));
  const nonAdminToken = await createUserToken("non-admin-tariff@example.com");
  const nonAdminTariffRead = await firestoreDocumentRequest(
    nonAdminToken,
    "GET",
    `tariffs/${oldTariffPayload.requestId}`,
  );
  assert.equal(nonAdminTariffRead.status, 403, JSON.stringify(nonAdminTariffRead.body));

  const retryAssignment = await financeRequest(
    token,
    "/students/tariff-assignments",
    newAssignmentPayload,
  );
  assert.equal(retryAssignment.status, 200, JSON.stringify(retryAssignment.body));
  assert.equal(retryAssignment.body.idempotent, true);

  const outOfOrderAssignment = await financeRequest(
    token,
    "/students/tariff-assignments",
    {
      ...oldAssignmentPayload,
      effectiveFrom: "2026-07-10",
      requestId: "emulator_assignment_0003",
    },
  );
  assert.equal(outOfOrderAssignment.status, 409);
  assert.match(outOfOrderAssignment.body.error, /must start after/);

  const invoicePayload = {
    studentId: "student-tariff",
    lessonIds: ["lesson-tariff-old", "lesson-tariff-new"],
    due: "2026-08-10",
    description: "",
    paymentReference: "TARIFF-001",
    requestId: "emulator_invoice_tariff_0001",
  };
  const created = await financeRequest(token, "/invoices/from-lessons", invoicePayload);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.invoice.amountCents, 6500);
  assert.equal(created.body.invoice.lessonPriceCents, 0);
  assert.equal(created.body.invoice.lineVersion, 2);
  assert.equal(created.body.invoice.pricingMode, "tariff_assignments_v1");
  assert.deepEqual(
    created.body.invoice.lines.map(line => [
      line.lessonId,
      line.unitPriceCents,
      line.tariffId,
      line.tariffAssignmentId,
    ]),
    [
      ["lesson-tariff-old", 3000, oldTariffPayload.requestId, oldAssignmentPayload.requestId],
      ["lesson-tariff-new", 3500, newTariffPayload.requestId, newAssignmentPayload.requestId],
    ],
  );

  const [
    oldLessonSnap,
    newLessonSnap,
    tariffStudentSnap,
    assignmentAuditSnap,
    invoiceAuditSnap,
  ] = await Promise.all([
    db.collection("lessons").doc("lesson-tariff-old").get(),
    db.collection("lessons").doc("lesson-tariff-new").get(),
    db.collection("students").doc("student-tariff").get(),
    db.collection("financialAudit").doc(newAssignmentPayload.requestId).get(),
    db.collection("financialAudit").doc(invoicePayload.requestId).get(),
  ]);
  assert.equal(oldLessonSnap.data().billedTariffId, oldTariffPayload.requestId);
  assert.equal(oldLessonSnap.data().billedAmountCents, 3000);
  assert.equal(newLessonSnap.data().billedTariffId, newTariffPayload.requestId);
  assert.equal(newLessonSnap.data().billedAmountCents, 3500);
  assert.equal(
    tariffStudentSnap.data().latestTariffAssignmentId,
    newAssignmentPayload.requestId,
  );
  assert.equal(tariffStudentSnap.data().latestTariffUnitPriceCents, 3500);
  assert.equal(assignmentAuditSnap.data().action, "student.tariff_assigned");
  assert.equal(invoiceAuditSnap.data().pricingMode, "tariff_assignments_v1");
});

test("package products issue balances and append immutable ledger movements", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();

  await db.collection("students").doc("student-package").set({
    name: "Package Student",
    email: "package-student@example.com",
    packageTotal: 6,
    packageUsed: 2,
    active: true,
  });

  const productPayload = {
    name: "Ten individual lessons",
    lessonCredits: 10,
    totalPrice: 250,
    effectiveFrom: "2026-07-01",
    requestId: "emulator_package_product_0001",
  };
  const productCreated = await financeRequest(token, "/package-products", productPayload);
  assert.equal(productCreated.status, 201, JSON.stringify(productCreated.body));
  assert.equal(productCreated.body.packageProduct.lessonCredits, 10);
  assert.equal(productCreated.body.packageProduct.priceCents, 25000);

  const productRetry = await financeRequest(token, "/package-products", productPayload);
  assert.equal(productRetry.status, 200, JSON.stringify(productRetry.body));
  assert.equal(productRetry.body.idempotent, true);

  const issuePayload = {
    studentId: "student-package",
    packageProductId: productPayload.requestId,
    issuedAt: "2026-07-28",
    requestId: "emulator_student_package_0001",
  };
  const issued = await financeRequest(token, "/student-packages", issuePayload);
  assert.equal(issued.status, 201, JSON.stringify(issued.body));
  assert.equal(issued.body.studentPackage.balanceCredits, 10);
  assert.equal(issued.body.studentPackage.grantedCredits, 10);

  const [
    issuedPackageSnap,
    grantLedgerSnap,
    issueAuditSnap,
    legacyStudentSnap,
  ] = await Promise.all([
    db.collection("studentPackages").doc(issuePayload.requestId).get(),
    db.collection("packageLedger").doc(issuePayload.requestId).get(),
    db.collection("financialAudit").doc(issuePayload.requestId).get(),
    db.collection("students").doc("student-package").get(),
  ]);
  assert.equal(issuedPackageSnap.data().ledgerEntryCount, 1);
  assert.equal(grantLedgerSnap.data().entryType, "grant");
  assert.equal(grantLedgerSnap.data().creditsDelta, 10);
  assert.equal(grantLedgerSnap.data().balanceBefore, 0);
  assert.equal(grantLedgerSnap.data().balanceAfter, 10);
  assert.equal(issueAuditSnap.data().action, "student.package_issued");
  assert.equal(legacyStudentSnap.data().packageTotal, 6);
  assert.equal(legacyStudentSnap.data().packageUsed, 2);

  const adjustmentPayload = {
    studentPackageId: issuePayload.requestId,
    creditsDelta: -3,
    reason: "Emulator manual correction",
    requestId: "emulator_package_adjust_0001",
  };
  const adjusted = await financeRequest(
    token,
    "/student-packages/adjust",
    adjustmentPayload,
  );
  assert.equal(adjusted.status, 201, JSON.stringify(adjusted.body));
  assert.equal(adjusted.body.ledgerEntry.balanceBefore, 10);
  assert.equal(adjusted.body.ledgerEntry.balanceAfter, 7);
  assert.equal(adjusted.body.studentPackage.balanceCredits, 7);

  const [
    adjustedPackageSnap,
    adjustmentLedgerSnap,
    adjustmentAuditSnap,
  ] = await Promise.all([
    db.collection("studentPackages").doc(issuePayload.requestId).get(),
    db.collection("packageLedger").doc(adjustmentPayload.requestId).get(),
    db.collection("financialAudit").doc(adjustmentPayload.requestId).get(),
  ]);
  assert.equal(adjustedPackageSnap.data().balanceCredits, 7);
  assert.equal(adjustedPackageSnap.data().adjustmentDebitCredits, 3);
  assert.equal(adjustedPackageSnap.data().ledgerEntryCount, 2);
  assert.equal(adjustmentLedgerSnap.data().creditsDelta, -3);
  assert.equal(adjustmentLedgerSnap.data().reason, adjustmentPayload.reason);
  assert.equal(adjustmentAuditSnap.data().action, "student.package_adjusted_debit");

  const adjustmentRetry = await financeRequest(
    token,
    "/student-packages/adjust",
    adjustmentPayload,
  );
  assert.equal(adjustmentRetry.status, 200, JSON.stringify(adjustmentRetry.body));
  assert.equal(adjustmentRetry.body.idempotent, true);
  assert.equal(
    (await db.collection("studentPackages").doc(issuePayload.requestId).get())
      .data().ledgerEntryCount,
    2,
  );

  const overdraft = await financeRequest(token, "/student-packages/adjust", {
    ...adjustmentPayload,
    creditsDelta: -8,
    requestId: "emulator_package_adjust_0002",
  });
  assert.equal(overdraft.status, 409, JSON.stringify(overdraft.body));
  assert.match(overdraft.body.error, /insufficient/);
  assert.equal(
    (await db.collection("studentPackages").doc(issuePayload.requestId).get())
      .data().balanceCredits,
    7,
  );
  assert.equal(
    (await db.collection("packageLedger").doc("emulator_package_adjust_0002").get())
      .exists,
    false,
  );

  const adminProductRead = await firestoreDocumentRequest(
    token,
    "GET",
    `packageProducts/${productPayload.requestId}`,
  );
  assert.equal(adminProductRead.status, 200, JSON.stringify(adminProductRead.body));
  const clientProductWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `packageProducts/${productPayload.requestId}`,
    { fields: { lessonCredits: { integerValue: "1" } } },
  );
  assert.equal(clientProductWrite.status, 403, JSON.stringify(clientProductWrite.body));
  const clientPackageWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `studentPackages/${issuePayload.requestId}`,
    { fields: { balanceCredits: { integerValue: "999" } } },
  );
  assert.equal(clientPackageWrite.status, 403, JSON.stringify(clientPackageWrite.body));
  const clientLedgerWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `packageLedger/${adjustmentPayload.requestId}`,
    { fields: { creditsDelta: { integerValue: "999" } } },
  );
  assert.equal(clientLedgerWrite.status, 403, JSON.stringify(clientLedgerWrite.body));

  const nonAdminToken = await createUserToken("non-admin-package@example.com");
  const nonAdminPackageRead = await firestoreDocumentRequest(
    nonAdminToken,
    "GET",
    `studentPackages/${issuePayload.requestId}`,
  );
  assert.equal(nonAdminPackageRead.status, 403, JSON.stringify(nonAdminPackageRead.body));
});

test("completed lessons consume one package credit and reversals append restoration", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const teacherToken = await createUserToken("package-teacher@example.com");
  const teacherClaims = JSON.parse(
    Buffer.from(teacherToken.split(".")[1], "base64url").toString("utf8"),
  );
  await db.collection("users").doc(teacherClaims.user_id).set({
    role: "teacher",
    displayName: "Package Teacher",
    email: "package-teacher@example.com",
  });
  await db.collection("students").doc("student-package-lesson").set({
    name: "Lesson Package Student",
    email: "lesson-package@example.com",
    packageTotal: 5,
    packageUsed: 2,
    lessonsSinceInvoice: 0,
    active: true,
  });

  const productPayload = {
    name: "One lesson package",
    lessonCredits: 1,
    totalPrice: 30,
    effectiveFrom: "2026-07-01",
    requestId: "emulator_lesson_package_product_0001",
  };
  const product = await financeRequest(adminToken, "/package-products", productPayload);
  assert.equal(product.status, 201, JSON.stringify(product.body));
  const issuePayload = {
    studentId: "student-package-lesson",
    packageProductId: productPayload.requestId,
    issuedAt: "2026-07-01",
    requestId: "emulator_lesson_package_issue_0001",
  };
  const issued = await financeRequest(adminToken, "/student-packages", issuePayload);
  assert.equal(issued.status, 201, JSON.stringify(issued.body));

  await db.collection("lessons").doc("lesson-package-cycle").set({
    studentId: "student-package-lesson",
    studentName: "Lesson Package Student",
    teacher: "Package Teacher",
    topic: "Package ledger lesson",
    date: "2026-07-28",
    status: "Toimunud",
    requestedStudentPackageId: issuePayload.requestId,
  });
  const consumePayload = {
    lessonId: "lesson-package-cycle",
    requestId: "emulator_lesson_package_consume_0001",
  };
  const consumed = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    consumePayload,
  );
  assert.equal(consumed.status, 201, JSON.stringify(consumed.body));
  assert.equal(consumed.body.changed, true);
  assert.equal(consumed.body.status, "consumed");
  assert.equal(consumed.body.balanceAfter, 0);
  assert.equal(consumed.body.cycle, 1);

  const [
    consumedPackageSnap,
    consumedLessonSnap,
    consumedStateSnap,
    consumedLedgerSnap,
    consumedAuditSnap,
    legacyStudentSnap,
  ] = await Promise.all([
    db.collection("studentPackages").doc(issuePayload.requestId).get(),
    db.collection("lessons").doc("lesson-package-cycle").get(),
    db.collection("lessonPackageStates").doc("lesson-package-cycle").get(),
    db.collection("packageLedger").doc(consumed.body.ledgerEntryId).get(),
    db.collection("financialAudit").doc(consumePayload.requestId).get(),
    db.collection("students").doc("student-package-lesson").get(),
  ]);
  assert.equal(consumedPackageSnap.data().balanceCredits, 0);
  assert.equal(consumedPackageSnap.data().consumedCredits, 1);
  assert.equal(consumedPackageSnap.data().status, "depleted");
  assert.equal(consumedLessonSnap.data().packageConsumptionStatus, "consumed");
  assert.equal(consumedLessonSnap.data().packageStudentPackageId, issuePayload.requestId);
  assert.equal(consumedStateSnap.data().status, "consumed");
  assert.equal(consumedStateSnap.data().cycle, 1);
  assert.equal(consumedLedgerSnap.data().entryType, "lesson_consumption");
  assert.equal(consumedLedgerSnap.data().creditsDelta, -1);
  assert.equal(consumedLedgerSnap.data().lessonId, "lesson-package-cycle");
  assert.equal(consumedAuditSnap.data().action, "lesson.package_credit_consumed");
  assert.equal(consumedAuditSnap.data().actor.role, "teacher");
  assert.equal(legacyStudentSnap.data().packageTotal, 5);
  assert.equal(legacyStudentSnap.data().packageUsed, 2);

  const consumeRetry = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    consumePayload,
  );
  assert.equal(consumeRetry.status, 200, JSON.stringify(consumeRetry.body));
  assert.equal(consumeRetry.body.idempotent, true);

  const duplicateSync = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    {
      lessonId: "lesson-package-cycle",
      requestId: "emulator_lesson_package_consume_0002",
    },
  );
  assert.equal(duplicateSync.status, 201, JSON.stringify(duplicateSync.body));
  assert.equal(duplicateSync.body.changed, false);
  assert.equal(duplicateSync.body.ledgerEntryId, consumed.body.ledgerEntryId);
  assert.equal(
    (await db.collection("studentPackages").doc(issuePayload.requestId).get())
      .data().ledgerEntryCount,
    2,
  );

  await db.collection("lessons").doc("lesson-package-cycle").update({
    status: "Puudus_p",
  });
  const restorePayload = {
    lessonId: "lesson-package-cycle",
    requestId: "emulator_lesson_package_restore_0001",
  };
  const restored = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    restorePayload,
  );
  assert.equal(restored.status, 201, JSON.stringify(restored.body));
  assert.equal(restored.body.changed, true);
  assert.equal(restored.body.status, "restored");
  assert.equal(restored.body.balanceAfter, 1);

  const [
    restoredPackageSnap,
    restoredStateSnap,
    restoredLedgerSnap,
    originalLedgerAfterRestore,
    restoredAuditSnap,
  ] = await Promise.all([
    db.collection("studentPackages").doc(issuePayload.requestId).get(),
    db.collection("lessonPackageStates").doc("lesson-package-cycle").get(),
    db.collection("packageLedger").doc(restored.body.ledgerEntryId).get(),
    db.collection("packageLedger").doc(consumed.body.ledgerEntryId).get(),
    db.collection("financialAudit").doc(restorePayload.requestId).get(),
  ]);
  assert.equal(restoredPackageSnap.data().balanceCredits, 1);
  assert.equal(restoredPackageSnap.data().consumedCredits, 0);
  assert.equal(restoredStateSnap.data().status, "restored");
  assert.equal(restoredLedgerSnap.data().entryType, "lesson_restoration");
  assert.equal(restoredLedgerSnap.data().creditsDelta, 1);
  assert.equal(restoredLedgerSnap.data().restoresLedgerEntryId, consumed.body.ledgerEntryId);
  assert.equal(originalLedgerAfterRestore.data().creditsDelta, -1);
  assert.equal(restoredAuditSnap.data().action, "lesson.package_credit_restored");

  await db.collection("lessons").doc("lesson-package-cycle").update({
    status: "Toimunud",
  });
  const secondCycle = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    {
      lessonId: "lesson-package-cycle",
      requestId: "emulator_lesson_package_consume_0003",
    },
  );
  assert.equal(secondCycle.status, 201, JSON.stringify(secondCycle.body));
  assert.equal(secondCycle.body.changed, true);
  assert.equal(secondCycle.body.cycle, 2);
  assert.notEqual(secondCycle.body.ledgerEntryId, consumed.body.ledgerEntryId);
  assert.equal(secondCycle.body.balanceAfter, 0);

  const doubleChargeAttempt = await financeRequest(
    adminToken,
    "/invoices/from-lessons",
    {
      studentId: "student-package-lesson",
      lessonIds: ["lesson-package-cycle"],
      due: "2026-08-10",
      description: "Must not invoice package-covered lesson",
      paymentReference: "PACKAGE-COVERED-001",
      requestId: "emulator_lesson_package_invoice_0001",
    },
  );
  assert.equal(doubleChargeAttempt.status, 409, JSON.stringify(doubleChargeAttempt.body));
  assert.match(doubleChargeAttempt.body.error, /not currently billable/);

  await db.collection("lessons").doc("lesson-package-no-credit").set({
    studentId: "student-package-lesson",
    studentName: "Lesson Package Student",
    teacher: "Package Teacher",
    topic: "No credit lesson",
    date: "2026-07-28",
    status: "Toimunud",
  });
  const noCredit = await financeRequest(
    teacherToken,
    "/lessons/package-consumption/sync",
    {
      lessonId: "lesson-package-no-credit",
      requestId: "emulator_lesson_package_attention_0001",
    },
  );
  assert.equal(noCredit.status, 201, JSON.stringify(noCredit.body));
  assert.equal(noCredit.body.changed, false);
  assert.equal(noCredit.body.status, "needs_attention");
  assert.match(noCredit.body.reason, /No eligible/);
  assert.equal(
    (await db.collection("lessons").doc("lesson-package-no-credit").get())
      .data().packageConsumptionStatus,
    "needs_attention",
  );
  assert.equal(
    (await db.collection("financialAudit")
      .doc("emulator_lesson_package_attention_0001").get()).exists,
    false,
  );

  const clientStateWrite = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "lessonPackageStates/lesson-package-cycle",
    { fields: { status: { stringValue: "restored" } } },
  );
  assert.equal(clientStateWrite.status, 403, JSON.stringify(clientStateWrite.body));
  const forgedLessonCreate = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "lessons/client-forged-package-lesson",
    {
      fields: {
        studentId: { stringValue: "student-package-lesson" },
        status: { stringValue: "Toimunud" },
        packageConsumptionStatus: { stringValue: "consumed" },
      },
    },
  );
  assert.equal(forgedLessonCreate.status, 403, JSON.stringify(forgedLessonCreate.body));
  const clientLessonDelete = await firestoreDocumentRequest(
    teacherToken,
    "DELETE",
    "lessons/lesson-package-cycle",
  );
  assert.equal(clientLessonDelete.status, 403, JSON.stringify(clientLessonDelete.body));
  const nonAdminStateRead = await firestoreDocumentRequest(
    teacherToken,
    "GET",
    "lessonPackageStates/lesson-package-cycle",
  );
  assert.equal(nonAdminStateRead.status, 403, JSON.stringify(nonAdminStateRead.body));
});

test("Live Classroom keeps the teacher desk private and scopes student interaction", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const teacherToken = await createUserToken("live-teacher@example.com");
  const otherTeacherToken = await createUserToken("live-other-teacher@example.com");
  const studentToken = await createUserToken("live-student@example.com");
  const outsiderToken = await createUserToken("live-outsider@example.com");
  const teacherUid = tokenUid(teacherToken);
  const otherTeacherUid = tokenUid(otherTeacherToken);
  const studentUid = tokenUid(studentToken);
  const outsiderUid = tokenUid(outsiderToken);

  await Promise.all([
    db.collection("users").doc(teacherUid).set({
      role: "teacher",
      displayName: "Live Teacher",
      email: "live-teacher@example.com",
    }),
    db.collection("users").doc(otherTeacherUid).set({
      role: "teacher",
      displayName: "Other Live Teacher",
      email: "live-other-teacher@example.com",
    }),
    db.collection("users").doc(studentUid).set({
      role: "student",
      displayName: "Live Student",
      email: "live-student@example.com",
    }),
    db.collection("users").doc(outsiderUid).set({
      role: "student",
      displayName: "Outside Student",
      email: "live-outsider@example.com",
    }),
    db.collection("students").doc("live-student-record").set({
      name: "Live Student",
      linkedUserId: studentUid,
      active: true,
    }),
    db.collection("students").doc("outside-student-record").set({
      name: "Outside Student",
      linkedUserId: outsiderUid,
      active: true,
    }),
  ]);

  const createRoom = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001",
    {
      fields: {
        title: { stringValue: "Secure lesson" },
        studentId: { stringValue: "live-student-record" },
        studentName: { stringValue: "Live Student" },
        teacherUid: { stringValue: teacherUid },
        teacherName: { stringValue: "Live Teacher" },
        status: { stringValue: "waiting" },
        sceneVersion: { integerValue: "1" },
        accessVersion: { integerValue: "1" },
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "welcome" },
              title: { stringValue: "Welcome" },
              body: { stringValue: "Published stage only" },
              version: { integerValue: "1" },
            },
          },
        },
        screenShare: {
          mapValue: {
            fields: {
              status: { stringValue: "idle" },
              shareId: { stringValue: "" },
            },
          },
        },
      },
    },
  );
  assert.equal(createRoom.status, 200, JSON.stringify(createRoom.body));

  const ownRoomRead = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "liveClassrooms/live-room-001",
  );
  assert.equal(ownRoomRead.status, 200, JSON.stringify(ownRoomRead.body));
  const outsiderRoomRead = await firestoreDocumentRequest(
    outsiderToken,
    "GET",
    "liveClassrooms/live-room-001",
  );
  assert.equal(outsiderRoomRead.status, 403, JSON.stringify(outsiderRoomRead.body));
  const otherTeacherRoomRead = await firestoreDocumentRequest(
    otherTeacherToken,
    "GET",
    "liveClassrooms/live-room-001",
  );
  assert.equal(
    otherTeacherRoomRead.status,
    403,
    JSON.stringify(otherTeacherRoomRead.body),
  );

  const presenceTimestamp = new Date().toISOString();
  const teacherPresenceBody = {
    fields: {
      classroomId: { stringValue: "live-room-001" },
      uid: { stringValue: teacherUid },
      role: { stringValue: "teacher" },
      displayName: { stringValue: "Live Teacher" },
      online: { booleanValue: true },
      lastSeen: { timestampValue: presenceTimestamp },
      lastSeenIso: { stringValue: presenceTimestamp },
    },
  };
  const teacherPresence = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${teacherUid}`,
    teacherPresenceBody,
  );
  assert.equal(teacherPresence.status, 200, JSON.stringify(teacherPresence.body));
  const studentReadsTeacherPresence = await firestoreDocumentRequest(
    studentToken,
    "GET",
    `liveClassrooms/live-room-001/presence/${teacherUid}`,
  );
  assert.equal(
    studentReadsTeacherPresence.status,
    200,
    JSON.stringify(studentReadsTeacherPresence.body),
  );
  const outsiderPresenceRead = await firestoreDocumentRequest(
    outsiderToken,
    "GET",
    `liveClassrooms/live-room-001/presence/${teacherUid}`,
  );
  assert.equal(outsiderPresenceRead.status, 403, JSON.stringify(outsiderPresenceRead.body));

  const studentPresenceBody = {
    fields: {
      classroomId: { stringValue: "live-room-001" },
      uid: { stringValue: studentUid },
      role: { stringValue: "student" },
      displayName: { stringValue: "Live Student" },
      online: { booleanValue: true },
      lastSeen: { timestampValue: presenceTimestamp },
      lastSeenIso: { stringValue: presenceTimestamp },
    },
  };
  const studentPresence = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${studentUid}`,
    studentPresenceBody,
  );
  assert.equal(studentPresence.status, 200, JSON.stringify(studentPresence.body));
  const futurePresenceTimestamp = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const forgedFuturePresence = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${studentUid}`,
    {
      fields: {
        ...studentPresenceBody.fields,
        lastSeen: { timestampValue: futurePresenceTimestamp },
        lastSeenIso: { stringValue: futurePresenceTimestamp },
      },
    },
  );
  assert.equal(
    forgedFuturePresence.status,
    403,
    JSON.stringify(forgedFuturePresence.body),
  );
  const forgedStudentPresence = await firestoreDocumentRequest(
    otherTeacherToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${otherTeacherUid}`,
    {
      fields: {
        ...studentPresenceBody.fields,
        uid: { stringValue: otherTeacherUid },
      },
    },
  );
  assert.equal(
    forgedStudentPresence.status,
    403,
    JSON.stringify(forgedStudentPresence.body),
  );
  const forgedPresenceRole = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${studentUid}`,
    {
      fields: {
        ...studentPresenceBody.fields,
        role: { stringValue: "teacher" },
      },
    },
  );
  assert.equal(forgedPresenceRole.status, 403, JSON.stringify(forgedPresenceRole.body));

  const studentRoomMutation = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    "liveClassrooms/live-room-001",
    { fields: { status: { stringValue: "ended" } } },
  );
  assert.equal(studentRoomMutation.status, 403, JSON.stringify(studentRoomMutation.body));

  const publishQuestion = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=status&updateMask.fieldPaths=sceneVersion",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "short_answer" },
              title: { stringValue: "Secure question" },
              body: { stringValue: "Write the answer" },
              version: { integerValue: "2" },
            },
          },
        },
        status: { stringValue: "live" },
        sceneVersion: { integerValue: "2" },
      },
    },
  );
  assert.equal(publishQuestion.status, 200, JSON.stringify(publishQuestion.body));
  const responseBody = {
    fields: {
      classroomId: { stringValue: "live-room-001" },
      sceneVersion: { integerValue: "2" },
      sceneType: { stringValue: "short_answer" },
      studentId: { stringValue: "live-student-record" },
      studentName: { stringValue: "Live Student" },
      studentUid: { stringValue: studentUid },
      answer: { stringValue: "Minu turvaline vastus" },
    },
  };
  const ownResponse = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    `liveClassrooms/live-room-001/responses/scene-2-${studentUid}`,
    responseBody,
  );
  assert.equal(ownResponse.status, 200, JSON.stringify(ownResponse.body));
  const outsiderResponse = await firestoreDocumentRequest(
    outsiderToken,
    "PATCH",
    `liveClassrooms/live-room-001/responses/scene-2-${outsiderUid}`,
    {
      fields: {
        ...responseBody.fields,
        studentUid: { stringValue: outsiderUid },
      },
    },
  );
  assert.equal(outsiderResponse.status, 403, JSON.stringify(outsiderResponse.body));

  const publishScreen = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=sceneVersion&updateMask.fieldPaths=screenShare",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "screen" },
              title: { stringValue: "Secure screen" },
              body: { stringValue: "Selected window only" },
              version: { integerValue: "3" },
            },
          },
        },
        sceneVersion: { integerValue: "3" },
        screenShare: {
          mapValue: {
            fields: {
              status: { stringValue: "active" },
              shareId: { stringValue: "share-secure-001" },
            },
          },
        },
      },
    },
  );
  assert.equal(publishScreen.status, 200, JSON.stringify(publishScreen.body));
  const teacherSignal = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001/signals/offer-001",
    {
      fields: {
        type: { stringValue: "offer" },
        payload: { stringValue: "{\"type\":\"offer\",\"sdp\":\"emulator\"}" },
        senderUid: { stringValue: teacherUid },
        senderRole: { stringValue: "teacher" },
        shareId: { stringValue: "share-secure-001" },
      },
    },
  );
  assert.equal(teacherSignal.status, 200, JSON.stringify(teacherSignal.body));
  const ownSignalRead = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "liveClassrooms/live-room-001/signals/offer-001",
  );
  assert.equal(ownSignalRead.status, 200, JSON.stringify(ownSignalRead.body));
  const outsiderSignalRead = await firestoreDocumentRequest(
    outsiderToken,
    "GET",
    "liveClassrooms/live-room-001/signals/offer-001",
  );
  assert.equal(outsiderSignalRead.status, 403, JSON.stringify(outsiderSignalRead.body));

  const endRoom = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=sceneVersion&updateMask.fieldPaths=screenShare&updateMask.fieldPaths=status",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "welcome" },
              title: { stringValue: "Lesson ended" },
              body: { stringValue: "Responses saved" },
              version: { integerValue: "4" },
            },
          },
        },
        sceneVersion: { integerValue: "4" },
        screenShare: {
          mapValue: {
            fields: {
              status: { stringValue: "idle" },
              shareId: { stringValue: "" },
            },
          },
        },
        status: { stringValue: "ended" },
      },
    },
  );
  assert.equal(endRoom.status, 200, JSON.stringify(endRoom.body));
  const reopenEndedRoom = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=status",
    { fields: { status: { stringValue: "live" } } },
  );
  assert.equal(reopenEndedRoom.status, 403, JSON.stringify(reopenEndedRoom.body));
  const endedRoomPresence = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    `liveClassrooms/live-room-001/presence/${studentUid}`,
    {
      fields: {
        ...studentPresenceBody.fields,
        lastSeen: { timestampValue: new Date().toISOString() },
        lastSeenIso: { stringValue: new Date().toISOString() },
      },
    },
  );
  assert.equal(endedRoomPresence.status, 403, JSON.stringify(endedRoomPresence.body));
});
