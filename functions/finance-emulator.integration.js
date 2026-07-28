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
