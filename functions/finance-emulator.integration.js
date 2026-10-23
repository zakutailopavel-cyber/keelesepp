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

test("finance role can read invoices without gaining student or mutation access", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const financeToken = await createUserToken("finance-reader@example.com");
  const financeUid = tokenUid(financeToken);

  await Promise.all([
    db.collection("users").doc(financeUid).set({
      role: "finance",
      displayName: "Finance Reader",
      email: "finance-reader@example.com",
    }),
    db.collection("invoices").doc("finance-readable-invoice").set({
      num: "KS-FINANCE-1",
      studentId: "finance-private-student",
      amountCents: 10000,
      balanceDueCents: 10000,
      status: "Ootel",
    }),
    db.collection("students").doc("finance-private-student").set({
      name: "Private Student",
      active: true,
    }),
    db.collection("studentRevenuePlans").doc("finance-private-student").set({
      studentId: "finance-private-student",
      studentName: "Private Student",
      lessonPriceCents: 2500,
      weeklyLessons: 2,
      currency: "EUR",
      active: true,
      updatedAt: "2026-08-04T12:00:00.000Z",
      updatedBy: "Admin",
      updatedByUid: "seed-admin",
    }),
  ]);

  const invoiceList = await firestoreQueryRequest(financeToken, "invoices");
  assert.equal(invoiceList.status, 200, JSON.stringify(invoiceList.body));
  assert.ok(invoiceList.body.some(item => item.document?.name.endsWith("/invoices/finance-readable-invoice")));

  const studentRead = await firestoreDocumentRequest(
    financeToken,
    "GET",
    "students/finance-private-student",
  );
  assert.equal(studentRead.status, 403, JSON.stringify(studentRead.body));

  const forecastList = await firestoreQueryRequest(financeToken, "studentRevenuePlans");
  assert.equal(forecastList.status, 200, JSON.stringify(forecastList.body));
  assert.ok(forecastList.body.some(item => item.document?.name.endsWith("/studentRevenuePlans/finance-private-student")));

  const forecastMutation = await firestoreDocumentRequest(
    financeToken,
    "PATCH",
    "studentRevenuePlans/finance-private-student?updateMask.fieldPaths=weeklyLessons",
    { fields: { weeklyLessons: { integerValue: "3" } } },
  );
  assert.equal(forecastMutation.status, 403, JSON.stringify(forecastMutation.body));

  const invoiceMutation = await firestoreDocumentRequest(
    financeToken,
    "PATCH",
    "invoices/finance-readable-invoice?updateMask.fieldPaths=status",
    { fields: { status: { stringValue: "Makstud" } } },
  );
  assert.equal(invoiceMutation.status, 403, JSON.stringify(invoiceMutation.body));

  const adminToken = await createAdminToken();
  const adminForecastWrite = await firestoreDocumentRequest(
    adminToken,
    "PATCH",
    "studentRevenuePlans/admin-forecast-student",
    {
      fields: {
        studentId: { stringValue: "admin-forecast-student" },
        studentName: { stringValue: "Admin Forecast Student" },
        lessonPriceCents: { integerValue: "3000" },
        weeklyLessons: { doubleValue: 1.5 },
        currency: { stringValue: "EUR" },
        active: { booleanValue: true },
        updatedAt: { stringValue: "2026-08-04T12:00:00.000Z" },
        updatedBy: { stringValue: "Admin" },
        updatedByUid: { stringValue: tokenUid(adminToken) },
      },
    },
  );
  assert.equal(adminForecastWrite.status, 200, JSON.stringify(adminForecastWrite.body));
  // „Pärast toimunud tunde” (billingMode actual) is a valid billing setting (Finance v3); anything else is not
  const planWith = (billingMode) => firestoreDocumentRequest(adminToken, "PATCH", "studentRevenuePlans/admin-forecast-student", {
    fields: {
      studentId: { stringValue: "admin-forecast-student" }, studentName: { stringValue: "Admin Forecast Student" },
      lessonPriceCents: { integerValue: "2500" }, weeklyLessons: { doubleValue: 1 }, currency: { stringValue: "EUR" },
      active: { booleanValue: true }, updatedAt: { stringValue: "2026-10-09T12:00:00.000Z" }, updatedBy: { stringValue: "Admin" },
      updatedByUid: { stringValue: tokenUid(adminToken) }, lessonMinutes: { integerValue: "60" }, billingMode: { stringValue: billingMode },
      chargeNoShow: { booleanValue: true }, validFrom: { stringValue: "2026-10-09" },
    },
  });
  assert.equal((await planWith("actual")).status, 200, "billingMode actual");
  assert.equal((await planWith("weekly")).status, 403, "unknown billingMode");
});

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

async function firestoreCommitRequest(token, writes) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ writes }),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function firestoreQueryRequest(token, collectionId, teacherUid) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          ...(teacherUid ? {
            where: {
              fieldFilter: {
                field: { fieldPath: "teacherUid" },
                op: "EQUAL",
                value: { stringValue: teacherUid },
              },
            },
          } : {}),
        },
      }),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function firestoreFieldQueryRequest(token, collectionId, fieldPath, op, value) {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          where: {
            fieldFilter: {
              field: { fieldPath },
              op,
              value,
            },
          },
        },
      }),
    },
  );
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

test("student portal reads only its linked profile, lessons, and unpaid invoices", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const studentToken = await createUserToken("yana-scope@example.com");
  const outsiderToken = await createUserToken("student-outsider@example.com");
  const studentUid = tokenUid(studentToken);
  const outsiderUid = tokenUid(outsiderToken);

  await Promise.all([
    db.collection("users").doc(studentUid).set({
      role: "student",
      displayName: "Yana Scope",
      email: "yana-scope@example.com",
    }),
    db.collection("users").doc(outsiderUid).set({
      role: "student",
      displayName: "Student Outsider",
      email: "student-outsider@example.com",
    }),
    db.collection("students").doc(studentUid).set({
      name: "Yana Scope",
      email: "yana-scope@example.com",
      linkedUserId: studentUid,
      studentUid,
      active: true,
    }),
    db.collection("students").doc(outsiderUid).set({
      name: "Student Outsider",
      email: "student-outsider@example.com",
      linkedUserId: outsiderUid,
      studentUid: outsiderUid,
      active: true,
    }),
    db.collection("lessons").doc("yana-lesson-2026-08-12").set({
      studentId: studentUid,
      studentName: "Yana Scope",
      date: "2026-08-12",
      duration: 60,
      status: "Toimunud",
    }),
    db.collection("lessons").doc("outsider-private-lesson").set({
      studentId: outsiderUid,
      studentName: "Student Outsider",
      date: "2026-08-12",
      duration: 60,
      status: "Toimunud",
    }),
    db.collection("invoices").doc("yana-unpaid-invoice").set({
      studentId: studentUid,
      studentName: "Yana Scope",
      num: "KS-2026-060",
      amount: 40,
      status: "Ootel",
      due: "2026-09-10",
    }),
    db.collection("invoices").doc("outsider-private-invoice").set({
      studentId: outsiderUid,
      studentName: "Student Outsider",
      num: "KS-PRIVATE",
      amount: 99,
      status: "Ootel",
      due: "2026-09-10",
    }),
  ]);

  const unscopedStudents = await firestoreQueryRequest(studentToken, "students");
  assert.equal(unscopedStudents.status, 403, JSON.stringify(unscopedStudents.body));
  const ownedStudents = await firestoreFieldQueryRequest(
    studentToken,
    "students",
    "linkedUserId",
    "EQUAL",
    { stringValue: studentUid },
  );
  assert.equal(ownedStudents.status, 200, JSON.stringify(ownedStudents.body));
  assert.deepEqual(
    ownedStudents.body.filter(item => item.document).map(item => item.document.name.split("/").pop()),
    [studentUid],
  );

  const unscopedLessons = await firestoreQueryRequest(studentToken, "lessons");
  assert.equal(unscopedLessons.status, 403, JSON.stringify(unscopedLessons.body));
  const ownedLessons = await firestoreFieldQueryRequest(
    studentToken,
    "lessons",
    "studentId",
    "IN",
    { arrayValue: { values: [{ stringValue: studentUid }] } },
  );
  assert.equal(ownedLessons.status, 200, JSON.stringify(ownedLessons.body));
  assert.deepEqual(
    ownedLessons.body.filter(item => item.document).map(item => item.document.name.split("/").pop()),
    ["yana-lesson-2026-08-12"],
  );

  const ownedInvoices = await firestoreFieldQueryRequest(
    studentToken,
    "invoices",
    "studentId",
    "IN",
    { arrayValue: { values: [{ stringValue: studentUid }] } },
  );
  assert.equal(ownedInvoices.status, 200, JSON.stringify(ownedInvoices.body));
  const invoice = ownedInvoices.body.find(item => item.document)?.document;
  assert.equal(invoice?.fields?.num?.stringValue, "KS-2026-060");
  assert.equal(invoice?.fields?.amount?.integerValue, "40");
  assert.equal(invoice?.fields?.status?.stringValue, "Ootel");
  assert.equal(invoice?.fields?.due?.stringValue, "2026-09-10");

  const foreignLesson = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "lessons/outsider-private-lesson",
  );
  assert.equal(foreignLesson.status, 403, JSON.stringify(foreignLesson.body));
  const foreignInvoice = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "invoices/outsider-private-invoice",
  );
  assert.equal(foreignInvoice.status, 403, JSON.stringify(foreignInvoice.body));
});

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

async function staffOperationsRequest(token, path, payload = {}) {
  const response = await fetch(
    `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/staffOperationsApi${path}`,
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

test("lesson journal is stable across retries and keeps calendar and counters in sync", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const teacherToken = await createUserToken("lesson-journal-teacher@example.com");
  const teacherUid = tokenUid(teacherToken);
  const studentId = "lesson-journal-student";
  const scheduleId = "lesson-journal-schedule";
  await Promise.all([
    db.collection("users").doc(teacherUid).set({
      role: "teacher",
      displayName: "Journal Teacher",
      email: "lesson-journal-teacher@example.com",
    }),
    db.collection("students").doc(studentId).set({
      name: "Journal Student",
      teacher: "Journal Teacher",
      teacherUid,
      packageUsed: 0,
      lessonsSinceInvoice: 0,
      lessonPrice: 40,
      active: true,
    }),
    db.collection("schedule").doc(scheduleId).set({
      studentId,
      studentName: "Journal Student",
      teacher: "Journal Teacher",
      teacherUid,
      date: "2026-08-26",
      time: "10:00",
      duration: 60,
      status: "Planeeritud",
    }),
  ]);
  const lesson = {
    studentId,
    studentName: "Journal Student",
    scheduleId,
    scheduleTime: "10:00",
    date: "2026-08-26",
    duration: 60,
    status: "Toimunud",
    topic: "",
    grade: 0,
    teacher: "Journal Teacher",
    teacherUid,
  };
  const firstPayload = {
    scheduleId,
    lesson,
    requestId: "emulator_lesson_journal_0001",
  };
  const first = await financeRequest(teacherToken, "/lessons/journal", firstPayload);
  assert.equal(first.status, 201, JSON.stringify(first.body));
  assert.equal(first.body.lesson.status, "Toimunud");
  assert.equal(first.body.lesson.topic, "");

  const retry = await financeRequest(teacherToken, "/lessons/journal", firstPayload);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.equal(retry.body.lessonId, first.body.lessonId);

  const secondRequest = await financeRequest(teacherToken, "/lessons/journal", {
    ...firstPayload,
    requestId: "emulator_lesson_journal_0002",
  });
  assert.equal(secondRequest.status, 201, JSON.stringify(secondRequest.body));
  assert.equal(secondRequest.body.lessonId, first.body.lessonId);
  assert.equal(secondRequest.body.counterDelta, 0);

  let [lessonSnap, scheduleSnap, studentSnap] = await Promise.all([
    db.collection("lessons").doc(first.body.lessonId).get(),
    db.collection("schedule").doc(scheduleId).get(),
    db.collection("students").doc(studentId).get(),
  ]);
  assert.equal(lessonSnap.data().billingStatus, "unbilled");
  assert.equal(scheduleSnap.data().status, "Toimunud");
  assert.equal(studentSnap.data().lessonsSinceInvoice, 1);
  assert.equal(studentSnap.data().packageUsed, 1);

  const absence = await financeRequest(teacherToken, "/lessons/journal", {
    lessonId: first.body.lessonId,
    scheduleId,
    lesson: { ...lesson, status: "Puudus_p" },
    requestId: "emulator_lesson_journal_0003",
  });
  assert.equal(absence.status, 201, JSON.stringify(absence.body));
  [lessonSnap, scheduleSnap, studentSnap] = await Promise.all([
    db.collection("lessons").doc(first.body.lessonId).get(),
    db.collection("schedule").doc(scheduleId).get(),
    db.collection("students").doc(studentId).get(),
  ]);
  assert.equal(lessonSnap.data().status, "Puudus_p");
  assert.equal(lessonSnap.data().billingStatus, "");
  assert.equal(scheduleSnap.data().status, "Puudus_p");
  assert.equal(studentSnap.data().lessonsSinceInvoice, 0);
  assert.equal(studentSnap.data().packageUsed, 0);

  const deletePayload = {
    lessonId: first.body.lessonId,
    requestId: "emulator_lesson_journal_delete_0001",
  };
  const deleted = await financeRequest(teacherToken, "/lessons/journal/delete", deletePayload);
  assert.equal(deleted.status, 201, JSON.stringify(deleted.body));
  assert.equal(deleted.body.deleted, true);
  const deleteRetry = await financeRequest(teacherToken, "/lessons/journal/delete", deletePayload);
  assert.equal(deleteRetry.status, 200, JSON.stringify(deleteRetry.body));
  assert.equal(deleteRetry.body.idempotent, true);
  [lessonSnap, scheduleSnap, studentSnap] = await Promise.all([
    db.collection("lessons").doc(first.body.lessonId).get(),
    db.collection("schedule").doc(scheduleId).get(),
    db.collection("students").doc(studentId).get(),
  ]);
  assert.equal(lessonSnap.exists, false);
  assert.equal(scheduleSnap.data().status, "Planeeritud");
  assert.equal(studentSnap.data().lessonsSinceInvoice, 0);

  // A v2 series has both recurring=true and a start date in date. Its result belongs to one day only.
  await db.collection("schedule").doc(scheduleId).set({ recurring: true, startDate: lesson.date }, { merge: true });
  const weekly = await financeRequest(teacherToken, "/lessons/journal", { ...firstPayload, requestId: "emulator_dated_weekly_0001" });
  assert.equal(weekly.status, 201, JSON.stringify(weekly.body));
  scheduleSnap = await db.collection("schedule").doc(scheduleId).get();
  assert.equal(scheduleSnap.data().status, "Planeeritud");
  assert.equal(scheduleSnap.data().occurrenceStatuses[lesson.date].lessonEntryId, weekly.body.lessonId);
  assert.equal(scheduleSnap.data().occurrenceStatuses[lesson.date].status, "Toimunud");
  // Completed lessons retain financial deletion protection. Clear it through the journal API.
  const weeklyAbsence = await financeRequest(teacherToken, "/lessons/journal", {
    lessonId: weekly.body.lessonId, scheduleId,
    lesson: { ...lesson, status: "Puudus_p" }, requestId: "emulator_dated_weekly_absence_0001",
  });
  assert.equal(weeklyAbsence.status, 201, JSON.stringify(weeklyAbsence.body));
  const weeklyDelete = await financeRequest(teacherToken, "/lessons/journal/delete", { lessonId: weekly.body.lessonId, requestId: "emulator_dated_weekly_delete_0001" });
  assert.equal(weeklyDelete.status, 201, JSON.stringify(weeklyDelete.body));
  scheduleSnap = await db.collection("schedule").doc(scheduleId).get();
  assert.equal(scheduleSnap.data().status, "Planeeritud");
  assert.equal(scheduleSnap.data().occurrenceStatuses[lesson.date], undefined);
});

test("one-click lesson completion commits attendance, homework, curriculum and follow-up together", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db=admin.firestore();
  const teacherToken=await createUserToken("one-click-teacher@example.com");
  const teacherUid=tokenUid(teacherToken);
  const studentId="one-click-student";
  const scheduleId="one-click-schedule";
  await Promise.all([
    db.collection("users").doc(teacherUid).set({role:"teacher",displayName:"One Click Teacher",email:"one-click-teacher@example.com"}),
    db.collection("students").doc(studentId).set({name:"One Click Student",teacher:"One Click Teacher",teacherUid,packageUsed:0,lessonsSinceInvoice:0,active:true}),
    db.collection("schedule").doc(scheduleId).set({studentId,studentName:"One Click Student",teacher:"One Click Teacher",teacherUid,date:"2026-09-23",time:"10:00",duration:60,status:"Planeeritud"}),
  ]);
  const payload={scheduleId,lesson:{studentId,studentName:"One Click Student",scheduleId,scheduleTime:"10:00",date:"2026-09-23",duration:60,status:"Toimunud",topic:"Igapäevaelu",grade:5,covered:"Harjutasime suulist väljendust",teacher:"One Click Teacher",teacherUid},completion:{attendanceStatus:"coming",homeworkTask:"Kirjuta viis lauset.",homeworkDue:"2026-09-30",nextCurriculumPlan:{languageId:"est",subject:"Eesti keel",level:"B1",topicId:"topic-2",topicName:"Töö ja õpingud",lessonIndex:1,lessonGoal:"Räägib oma tööst"},followUpTitle:"Saada lisasõnavara"},requestId:"emulator_one_click_completion_0001"};
  let lessonId="";
  try {
    const first=await financeRequest(teacherToken,"/lessons/journal",payload);
    assert.equal(first.status,201,JSON.stringify(first.body));
    lessonId=first.body.lessonId;
    const [lesson,schedule,student,homework,task]=await Promise.all([db.collection("lessons").doc(lessonId).get(),db.collection("schedule").doc(scheduleId).get(),db.collection("students").doc(studentId).get(),db.collection("homework").doc(`lesson-completion-${lessonId}`).get(),db.collection("tasks").doc(`lesson-follow-up-${lessonId}`).get()]);
    assert.equal(lesson.data().completionWorkflow.attendanceStatus,"coming");
    assert.equal(schedule.data().attendance[`${studentId}_2026-09-23`].status,"coming");
    assert.equal(student.data().curriculumPlan.topicId,"topic-2");
    assert.equal(homework.data().task,"Kirjuta viis lauset.");
    assert.equal(task.data().studentId,studentId);
    const retry=await financeRequest(teacherToken,"/lessons/journal",payload);
    assert.equal(retry.status,200,JSON.stringify(retry.body));
    assert.equal((await db.collection("homework").where("lessonId","==",lessonId).get()).size,1);
    assert.equal((await db.collection("tasks").where("lessonId","==",lessonId).get()).size,1);
  } finally {
    const refs=[
      db.collection("users").doc(teacherUid),
      db.collection("students").doc(studentId),
      db.collection("schedule").doc(scheduleId),
      db.collection("lessonJournalRequests").doc(payload.requestId),
    ];
    if (lessonId) refs.push(
      db.collection("lessons").doc(lessonId),
      db.collection("homework").doc(`lesson-completion-${lessonId}`),
      db.collection("tasks").doc(`lesson-follow-up-${lessonId}`),
    );
    await Promise.all(refs.map((ref)=>ref.delete()));
  }
});

test("expenses are admin-only and preserve corrections, voids, documents, and audit history", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const createId = "emulator_expense_create_0001";
  const payload = {
    expenseDate: "2026-08-04",
    category: "software",
    description: "Video lesson software",
    amount: 24.4,
    vatAmount: 4.4,
    paymentMethod: "card",
    requestId: createId,
  };
  const created = await financeRequest(adminToken, "/expenses", payload);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.expense.amountCents, 2440);
  assert.equal(created.body.expense.netAmountCents, 2000);

  const repeated = await financeRequest(adminToken, "/expenses", payload);
  assert.equal(repeated.status, 200, JSON.stringify(repeated.body));
  assert.equal(repeated.body.idempotent, true);

  const correctionId = "emulator_expense_correction_0001";
  const corrected = await financeRequest(adminToken, "/expenses/correct", {
    ...payload,
    expenseId: createId,
    amount: 30,
    vatAmount: 5,
    reason: "Corrected receipt total",
    requestId: correctionId,
  });
  assert.equal(corrected.status, 201, JSON.stringify(corrected.body));
  assert.equal(corrected.body.expense.correctsExpenseId, createId);
  assert.equal((await db.collection("expenses").doc(createId).get()).data().status, "corrected");

  const documentId = "emulator_expense_document_0001";
  const attached = await financeRequest(adminToken, "/expenses/documents", {
    expenseId: correctionId,
    requestId: documentId,
    storagePath: `financial/expenses/${correctionId}/${documentId}`,
    fileName: "receipt.pdf",
    contentType: "application/pdf",
    size: 1024,
  });
  assert.equal(attached.status, 201, JSON.stringify(attached.body));
  assert.equal(attached.body.expense.documentCount, 1);

  const voided = await financeRequest(adminToken, "/expenses/void", {
    expenseId: correctionId,
    reason: "Duplicate accounting entry",
    requestId: "emulator_expense_void_0001",
  });
  assert.equal(voided.status, 201, JSON.stringify(voided.body));
  assert.equal(voided.body.expense.status, "voided");

  const audits = await Promise.all([
    createId,
    correctionId,
    documentId,
    "emulator_expense_void_0001",
  ].map((id) => db.collection("financialAudit").doc(id).get()));
  assert.ok(audits.every((snapshot) => snapshot.exists));

  const directWrite = await firestoreDocumentRequest(
    adminToken,
    "PATCH",
    "expenses/browser-forged-expense",
    { fields: { status: { stringValue: "active" } } },
  );
  assert.equal(directWrite.status, 403, JSON.stringify(directWrite.body));

  const teacherToken = await createUserToken("expense-teacher@example.com");
  const teacherUid = tokenUid(teacherToken);
  await db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Expense Teacher" });
  const forbiddenRead = await firestoreDocumentRequest(teacherToken, "GET", `expenses/${createId}`);
  assert.equal(forbiddenRead.status, 403, JSON.stringify(forbiddenRead.body));
});

test("self-registration cannot forge staff roles and disabled accounts are rejected", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  const parentToken = await createUserToken("safe-parent@example.com");
  const parentUid = tokenUid(parentToken);
  const normalProfile = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    `users/${parentUid}`,
    {
      fields: {
        role: { stringValue: "parent" },
        displayName: { stringValue: "Safe Parent" },
        email: { stringValue: "safe-parent@example.com" },
        childName: { stringValue: "" },
        preferredTeacher: { stringValue: "Pavel" },
        createdAt: { stringValue: "2026-08-03" },
        termsAcceptedAt: { stringValue: "2026-08-10T08:35:00.000Z" },
        termsVersion: { stringValue: "2025-08-10" },
        // self-registration waits for an administrator (see account-approval-emulator.integration.js)
        approvalStatus: { stringValue: "pending" },
      },
    },
  );
  assert.equal(normalProfile.status, 200, JSON.stringify(normalProfile.body));
  const normalProfileRead = await firestoreDocumentRequest(
    parentToken,
    "GET",
    `users/${parentUid}`,
  );
  assert.equal(normalProfileRead.status, 200, JSON.stringify(normalProfileRead.body));

  const attackerToken = await createUserToken("role-attacker@example.com");
  const attackerUid = tokenUid(attackerToken);
  const forgedProfile = await firestoreDocumentRequest(
    attackerToken,
    "PATCH",
    `users/${attackerUid}`,
    {
      fields: {
        role: { stringValue: "student" },
        displayName: { stringValue: "Role Attacker" },
        email: { stringValue: "role-attacker@example.com" },
        createdAt: { stringValue: "2026-08-03" },
        isAdmin: { booleanValue: true },
        roles: { arrayValue: { values: [{ stringValue: "admin" }] } },
      },
    },
  );
  assert.equal(forgedProfile.status, 403, JSON.stringify(forgedProfile.body));

  await db.collection("users").doc(attackerUid).set({
    role: "student",
    displayName: "Role Attacker",
    email: "role-attacker@example.com",
    isAdmin: true,
    roles: ["admin"],
  });
  const forgedAdminCall = await financeRequest(attackerToken, "/tariffs", {
    name: "Forged tariff",
    unitPrice: 1,
    effectiveFrom: "2026-08-03",
    requestId: "forged_admin_request_001",
  });
  assert.equal(forgedAdminCall.status, 403, JSON.stringify(forgedAdminCall.body));

  const disabledToken = await createUserToken("disabled-admin@example.com");
  const disabledUid = tokenUid(disabledToken);
  await db.collection("users").doc(disabledUid).set({
    role: "admin",
    displayName: "Disabled Admin",
    email: "disabled-admin@example.com",
    disabled: true,
  });
  const disabledCall = await financeRequest(disabledToken, "/tariffs", {
    name: "Disabled tariff",
    unitPrice: 1,
    effectiveFrom: "2026-08-03",
    requestId: "disabled_admin_request_001",
  });
  assert.equal(disabledCall.status, 403, JSON.stringify(disabledCall.body));
  const disabledFirestoreRead = await firestoreDocumentRequest(
    disabledToken,
    "GET",
    `users/${disabledUid}`,
  );
  assert.equal(
    disabledFirestoreRead.status,
    403,
    JSON.stringify(disabledFirestoreRead.body),
  );
});

test("student writes keep teachers inside their assigned scope", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const teacherToken = await createUserToken("student-scope-pavel@example.com");
  const otherTeacherToken = await createUserToken("student-scope-elena@example.com");
  const parentToken = await createUserToken("student-scope-parent@example.com");
  const teacherUid = tokenUid(teacherToken);
  const otherTeacherUid = tokenUid(otherTeacherToken);
  const parentUid = tokenUid(parentToken);

  await Promise.all([
    db.collection("users").doc(teacherUid).set({
      role: "teacher",
      displayName: "Pavel Zakutailo",
      email: "student-scope-pavel@example.com",
    }),
    db.collection("users").doc(otherTeacherUid).set({
      role: "teacher",
      displayName: "Elena Zakutailo",
      email: "student-scope-elena@example.com",
    }),
    db.collection("users").doc(parentUid).set({
      role: "parent",
      displayName: "Scope Parent",
      email: "student-scope-parent@example.com",
    }),
  ]);

  const ownCreate = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "students/teacher-owned-student",
    {
      fields: {
        name: { stringValue: "Teacher Owned" },
        teacher: { stringValue: "Pavel" },
        active: { booleanValue: true },
      },
    },
  );
  assert.equal(ownCreate.status, 200, JSON.stringify(ownCreate.body));

  const foreignCreate = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "students/foreign-create-student",
    {
      fields: {
        name: { stringValue: "Foreign Create" },
        teacher: { stringValue: "Elena" },
        active: { booleanValue: true },
      },
    },
  );
  assert.equal(foreignCreate.status, 403, JSON.stringify(foreignCreate.body));

  const adminCreate = await firestoreDocumentRequest(
    adminToken,
    "PATCH",
    "students/other-teacher-student",
    {
      fields: {
        name: { stringValue: "Other Teacher Student" },
        teacher: { stringValue: "Elena Zakutailo" },
        linkedParentId: { stringValue: parentUid },
        active: { booleanValue: true },
      },
    },
  );
  assert.equal(adminCreate.status, 200, JSON.stringify(adminCreate.body));

  const ownUpdate = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "students/teacher-owned-student?updateMask.fieldPaths=phone",
    { fields: { phone: { stringValue: "+3725550001" } } },
  );
  assert.equal(ownUpdate.status, 200, JSON.stringify(ownUpdate.body));

  const reassignment = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "students/teacher-owned-student?updateMask.fieldPaths=teacher",
    { fields: { teacher: { stringValue: "Elena" } } },
  );
  assert.equal(reassignment.status, 403, JSON.stringify(reassignment.body));

  const foreignUpdate = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "students/other-teacher-student?updateMask.fieldPaths=phone",
    { fields: { phone: { stringValue: "+3725550002" } } },
  );
  assert.equal(foreignUpdate.status, 403, JSON.stringify(foreignUpdate.body));

  const otherTeacherUpdate = await firestoreDocumentRequest(
    otherTeacherToken,
    "PATCH",
    "students/other-teacher-student?updateMask.fieldPaths=phone",
    { fields: { phone: { stringValue: "+3725550003" } } },
  );
  assert.equal(otherTeacherUpdate.status, 200, JSON.stringify(otherTeacherUpdate.body));

  const linkedParentRead = await firestoreDocumentRequest(
    parentToken,
    "GET",
    "students/other-teacher-student",
  );
  assert.equal(linkedParentRead.status, 200, JSON.stringify(linkedParentRead.body));

  const parentOwnedCreate = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    "students/parent-created-student",
    {
      fields: {
        name: { stringValue: "Parent Created" },
        linkedParentId: { stringValue: parentUid },
        parentUid: { stringValue: parentUid },
        parentName: { stringValue: "Scope Parent" },
        parentEmail: { stringValue: "student-scope-parent@example.com" },
        teacher: { stringValue: "Pavel" },
        teacherUid: { stringValue: teacherUid },
        level: { stringValue: "A1" },
        targetLevel: { stringValue: "B1" },
        subject: { stringValue: "Eesti keel" },
        grade: { stringValue: "" },
        group: { stringValue: "" },
        phone: { stringValue: "" },
        email: { stringValue: "" },
        active: { booleanValue: true },
        packageTotal: { integerValue: "0" },
        packageUsed: { integerValue: "0" },
        contactStatus: { stringValue: "new" },
        contactOwner: { stringValue: "" },
        contactLastAt: { stringValue: "" },
        contactNotes: { stringValue: "" },
        createdAt: { stringValue: "2026-08-03" },
      },
    },
  );
  assert.equal(parentOwnedCreate.status, 403, JSON.stringify(parentOwnedCreate.body));

  const selfStudentCreate = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    "students/parent-self-student",
    {
      fields: {
        linkedUserId: { stringValue: parentUid },
        studentUid: { stringValue: parentUid },
        isSelfStudent: { booleanValue: true },
        parentAsStudent: { booleanValue: true },
        name: { stringValue: "Scope Parent" },
        email: { stringValue: "student-scope-parent@example.com" },
        phone: { stringValue: "" },
        level: { stringValue: "A1" },
        targetLevel: { stringValue: "B1" },
        teacher: { stringValue: "Pavel" },
        teacherUid: { stringValue: teacherUid },
        active: { booleanValue: true },
        packageTotal: { integerValue: "0" },
        packageUsed: { integerValue: "0" },
        subject: { stringValue: "Eesti keel" },
        grade: { stringValue: "Täiskasvanu" },
        group: { stringValue: "" },
        registrationSource: { stringValue: "parent-self-student" },
        profileStatus: { stringValue: "new" },
        contactStatus: { stringValue: "new" },
        contactOwner: { stringValue: "Pavel" },
        contactLastAt: { stringValue: "" },
        contactNotes: { stringValue: "Lapsevanem lisas enda õpingud" },
        createdAt: { stringValue: "2026-08-03" },
      },
    },
  );
  assert.equal(selfStudentCreate.status, 403, JSON.stringify(selfStudentCreate.body));

  const forgedPackageCreate = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    "students/parent-forged-package",
    {
      fields: {
        name: { stringValue: "Forged Package" },
        linkedParentId: { stringValue: parentUid },
        active: { booleanValue: true },
        packageTotal: { integerValue: "100" },
        packageUsed: { integerValue: "0" },
        createdAt: { stringValue: "2026-08-03" },
      },
    },
  );
  assert.equal(forgedPackageCreate.status, 403, JSON.stringify(forgedPackageCreate.body));

  const forgedTariffCreate = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    "students/parent-forged-tariff",
    {
      fields: {
        name: { stringValue: "Forged Tariff" },
        linkedParentId: { stringValue: parentUid },
        active: { booleanValue: true },
        packageTotal: { integerValue: "0" },
        packageUsed: { integerValue: "0" },
        latestTariffUnitPriceCents: { integerValue: "1" },
        createdAt: { stringValue: "2026-08-03" },
      },
    },
  );
  assert.equal(forgedTariffCreate.status, 403, JSON.stringify(forgedTariffCreate.body));

  const parentArchive = await firestoreDocumentRequest(
    parentToken,
    "PATCH",
    "students/other-teacher-student?updateMask.fieldPaths=active",
    { fields: { active: { booleanValue: false } } },
  );
  assert.equal(parentArchive.status, 403, JSON.stringify(parentArchive.body));
});

async function teacherScopeMigrationRequest(token, path, payload = {}) {
  const response = await fetch(
    `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/teacherScopeMigrationApi${path}`,
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

test("teacher UID migration API is admin-only and preview is non-mutating", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const attackerToken = await createUserToken("migration-attacker@example.com");
  const attackerUid = tokenUid(attackerToken);
  await db.collection("users").doc(attackerUid).set({
    role: "student",
    displayName: "Migration Attacker",
    email: "migration-attacker@example.com",
    roles: ["admin"],
    isAdmin: true,
  });

  const forbidden = await teacherScopeMigrationRequest(attackerToken, "/status");
  assert.equal(forbidden.status, 403, JSON.stringify(forbidden.body));

  const adminToken = await createAdminToken();
  const before = await db.collection("securityMigrations").doc("teacherUidV1").get();
  const preview = await teacherScopeMigrationRequest(adminToken, "/preview");
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.equal(typeof preview.body.readyToApply, "boolean");
  assert.ok(preview.body.summary?.students);
  const after = await db.collection("securityMigrations").doc("teacherUidV1").get();
  assert.equal(before.exists, false);
  assert.equal(after.exists, false);
});

test("teacher scope flag preserves legacy reads and then enforces teacher ownership", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const teacherToken = await createUserToken("scope-teacher@example.com");
  const otherTeacherToken = await createUserToken("scope-other@example.com");
  const teacherUid = tokenUid(teacherToken);
  const otherTeacherUid = tokenUid(otherTeacherToken);
  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Scope Teacher" }),
    db.collection("users").doc(otherTeacherUid).set({ role: "teacher", displayName: "Other Teacher" }),
    db.collection("students").doc("scope-own").set({ name: "Own", teacherUid }),
    db.collection("students").doc("scope-shared").set({
      name: "Shared",
      teacherUid: otherTeacherUid,
      teacherUids: [otherTeacherUid, teacherUid],
    }),
    db.collection("students").doc("scope-foreign").set({ name: "Foreign", teacherUid: otherTeacherUid }),
    db.collection("lessons").doc("scope-own").set({ studentId: "scope-own", teacherUid }),
    db.collection("lessons").doc("scope-foreign").set({ studentId: "scope-foreign", teacherUid: otherTeacherUid }),
    db.collection("schedule").doc("scope-own").set({ studentId: "scope-own", teacherUid }),
    db.collection("schedule").doc("scope-foreign").set({ studentId: "scope-foreign", teacherUid: otherTeacherUid }),
  ]);

  try {
    const legacyForeign = await firestoreDocumentRequest(teacherToken, "GET", "students/scope-foreign");
    assert.equal(legacyForeign.status, 200, JSON.stringify(legacyForeign.body));

    await db.collection("securityMigrations").doc("teacherUidV1").set({
      version: 1,
      backfillComplete: true,
      readEnforced: true,
    });

    const scopedCreate = await firestoreDocumentRequest(
      teacherToken,
      "PATCH",
      "students/scope-created",
      {
        fields: {
          name: { stringValue: "Scoped Create" },
          teacher: { stringValue: "Scope Teacher" },
          teacherUid: { stringValue: teacherUid },
          active: { booleanValue: true },
        },
      },
    );
    const foreignCreate = await firestoreDocumentRequest(
      teacherToken,
      "PATCH",
      "students/scope-foreign-create",
      {
        fields: {
          name: { stringValue: "Foreign Scoped Create" },
          teacher: { stringValue: "Other Teacher" },
          teacherUid: { stringValue: otherTeacherUid },
          active: { booleanValue: true },
        },
      },
    );
    assert.equal(scopedCreate.status, 200, JSON.stringify(scopedCreate.body));
    assert.equal(foreignCreate.status, 403, JSON.stringify(foreignCreate.body));

    for (const collectionName of ["students", "lessons", "schedule"]) {
      const own = await firestoreDocumentRequest(teacherToken, "GET", `${collectionName}/scope-own`);
      const foreign = await firestoreDocumentRequest(teacherToken, "GET", `${collectionName}/scope-foreign`);
      assert.equal(own.status, 200, `${collectionName}: ${JSON.stringify(own.body)}`);
      assert.equal(foreign.status, 403, `${collectionName}: ${JSON.stringify(foreign.body)}`);
    }

    const scopedQuery = await firestoreQueryRequest(teacherToken, "students", teacherUid);
    const sharedQuery = await firestoreFieldQueryRequest(
      teacherToken,
      "students",
      "teacherUids",
      "ARRAY_CONTAINS",
      { stringValue: teacherUid },
    );
    const broadQuery = await firestoreQueryRequest(teacherToken, "students");
    assert.equal(scopedQuery.status, 200, JSON.stringify(scopedQuery.body));
    assert.equal(sharedQuery.status, 200, JSON.stringify(sharedQuery.body));
    assert.equal(sharedQuery.body.filter((row) => row.document).length, 1, JSON.stringify(sharedQuery.body));
    assert.equal(broadQuery.status, 403, JSON.stringify(broadQuery.body));

    const migrationRead = await firestoreDocumentRequest(teacherToken, "GET", "securityMigrations/teacherUidV1");
    const migrationWrite = await firestoreDocumentRequest(teacherToken, "PATCH", "securityMigrations/teacherUidV1", {
      fields: { readEnforced: { booleanValue: false } },
    });
    assert.equal(migrationRead.status, 200, JSON.stringify(migrationRead.body));
    assert.equal(migrationWrite.status, 403, JSON.stringify(migrationWrite.body));
  } finally {
    await db.collection("securityMigrations").doc("teacherUidV1").delete();
  }
});

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

test("payment-order metadata is attached server-side and audited immutably", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  const invoiceId = "invoice-payment-document";
  await db.collection("invoices").doc(invoiceId).set({
    num: "KS-DOC-001",
    date: "2026-07-29",
    due: "2026-08-10",
    amountCents: 3000,
    amount: 30,
    paidAmountCents: 0,
    paidAmount: 0,
    balanceDueCents: 3000,
    balanceDue: 30,
    paymentStatus: "unpaid",
    status: "Ootel",
    studentId: "student-document",
    studentName: "Document Student",
  });
  const paymentPayload = {
    invoiceId,
    amount: 30,
    paidAt: "2026-07-29",
    method: "bank",
    reference: "KS-DOC-001",
    note: "Document test payment",
    requestId: "emulator_payment_document_payment_0001",
  };
  const paymentCreated = await financeRequest(token, "/payments", paymentPayload);
  assert.equal(paymentCreated.status, 201, JSON.stringify(paymentCreated.body));

  const documentPayload = {
    paymentId: paymentPayload.requestId,
    storagePath:
      `financial/payment-orders/${paymentPayload.requestId}/emulator_payment_document_file_0001`,
    fileName: "LHV payment order.pdf",
    contentType: "application/pdf",
    size: 45678,
    requestId: "emulator_payment_document_file_0001",
  };
  const attached = await financeRequest(token, "/payments/documents", documentPayload);
  assert.equal(attached.status, 201, JSON.stringify(attached.body));
  assert.equal(attached.body.document.paymentId, paymentPayload.requestId);
  assert.equal(attached.body.document.fileName, "LHV payment order.pdf");

  const [paymentSnap, auditSnap] = await Promise.all([
    db.collection("payments").doc(paymentPayload.requestId).get(),
    db.collection("financialAudit").doc(documentPayload.requestId).get(),
  ]);
  assert.equal(paymentSnap.data().documentCount, 1);
  assert.equal(paymentSnap.data().documents[0].storagePath, documentPayload.storagePath);
  assert.equal(auditSnap.data().action, "payment.document_attached");
  assert.equal(auditSnap.data().paymentId, paymentPayload.requestId);
  assert.equal(auditSnap.data().invoiceId, invoiceId);

  const retry = await financeRequest(token, "/payments/documents", documentPayload);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.equal(retry.body.idempotent, true);
  assert.equal((await db.collection("payments").doc(paymentPayload.requestId).get())
    .data().documents.length, 1);

  const wrongPath = await financeRequest(token, "/payments/documents", {
    ...documentPayload,
    storagePath: "lessons/student-document/not-financial.pdf",
    requestId: "emulator_payment_document_file_0002",
  });
  assert.equal(wrongPath.status, 400, JSON.stringify(wrongPath.body));

  const clientRewrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `payments/${paymentPayload.requestId}`,
    { fields: { documentCount: { integerValue: "99" } } },
  );
  assert.equal(clientRewrite.status, 403, JSON.stringify(clientRewrite.body));
});

test("payment lesson allocations are server-validated, versioned, and append-only", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  const invoiceId = "invoice-line-allocation";
  await db.collection("invoices").doc(invoiceId).set({
    num: "KS-LINE-001",
    date: "2026-07-29",
    due: "2026-08-10",
    amountCents: 6000,
    amount: 60,
    paidAmountCents: 0,
    paidAmount: 0,
    balanceDueCents: 6000,
    balanceDue: 60,
    paymentStatus: "unpaid",
    status: "Ootel",
    studentId: "student-line-allocation",
    studentName: "Allocation Student",
    lessonIds: ["line-lesson-a", "line-lesson-b"],
    lines: [
      { lessonId: "line-lesson-a", date: "2026-07-10", description: "First lesson", amountCents: 3000, amount: 30 },
      { lessonId: "line-lesson-b", date: "2026-07-17", description: "Second lesson", amountCents: 3000, amount: 30 },
    ],
  });
  const firstPayment = {
    invoiceId,
    amount: 30,
    paidAt: "2026-07-29",
    method: "bank",
    reference: "KS-LINE-001",
    requestId: "emulator_line_payment_0001",
  };
  assert.equal((await financeRequest(token, "/payments", firstPayment)).status, 201);

  const versionOne = {
    paymentId: firstPayment.requestId,
    allocations: [{ lessonId: "line-lesson-b", amount: 30 }],
    effectiveDate: "2026-07-29",
    reason: "",
    requestId: "emulator_line_allocation_0001",
  };
  const created = await financeRequest(token, "/payments/line-allocations", versionOne);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.allocation.version, 1);
  assert.equal(created.body.allocation.lines[0].lessonId, "line-lesson-b");
  assert.equal(created.body.allocation.unallocatedAmountCents, 0);

  const versionTwo = {
    ...versionOne,
    allocations: [{ lessonId: "line-lesson-a", amount: 30 }],
    effectiveDate: "2026-07-30",
    reason: "Bank reference confirmed the earlier lesson",
    requestId: "emulator_line_allocation_0002",
  };
  const corrected = await financeRequest(token, "/payments/line-allocations", versionTwo);
  assert.equal(corrected.status, 201, JSON.stringify(corrected.body));
  assert.equal(corrected.body.allocation.version, 2);
  assert.equal(corrected.body.allocation.supersedesAllocationId, versionOne.requestId);

  const [paymentSnap, firstVersionSnap, secondVersionSnap, auditSnap] = await Promise.all([
    db.collection("payments").doc(firstPayment.requestId).get(),
    db.collection("paymentLineAllocations").doc(versionOne.requestId).get(),
    db.collection("paymentLineAllocations").doc(versionTwo.requestId).get(),
    db.collection("financialAudit").doc(versionTwo.requestId).get(),
  ]);
  assert.equal(paymentSnap.data().lineAllocationId, versionTwo.requestId);
  assert.equal(paymentSnap.data().lineAllocationVersion, 2);
  assert.equal(firstVersionSnap.data().lines[0].lessonId, "line-lesson-b");
  assert.equal(secondVersionSnap.data().lines[0].lessonId, "line-lesson-a");
  assert.equal(auditSnap.data().action, "payment.line_allocation_corrected");

  const retry = await financeRequest(token, "/payments/line-allocations", versionTwo);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.equal(retry.body.idempotent, true);

  const directRewrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `paymentLineAllocations/${versionOne.requestId}`,
    { fields: { reason: { stringValue: "rewritten" } } },
  );
  assert.equal(directRewrite.status, 403, JSON.stringify(directRewrite.body));

  const secondPayment = {
    ...firstPayment,
    requestId: "emulator_line_payment_0002",
  };
  assert.equal((await financeRequest(token, "/payments", secondPayment)).status, 201);
  const overCapacity = await financeRequest(token, "/payments/line-allocations", {
    paymentId: secondPayment.requestId,
    allocations: [{ lessonId: "line-lesson-a", amount: 30 }],
    effectiveDate: "2026-07-30",
    reason: "",
    requestId: "emulator_line_allocation_0003",
  });
  assert.equal(overCapacity.status, 409, JSON.stringify(overCapacity.body));
  assert.match(overCapacity.body.error, /available amount/);
});

test("invoice-free lesson payments and student advances stay atomic and reversible", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  const studentId = "direct-payment-student";
  const lessonId = "direct-payment-lesson";
  const laterLessonId = "advance-payment-lesson";
  await Promise.all([
    db.collection("students").doc(studentId).set({
      name: "Direct Payment Student",
      active: true,
    }),
    db.collection("lessons").doc(lessonId).set({
      studentId,
      studentName: "Direct Payment Student",
      date: "2026-07-25",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
    db.collection("lessons").doc(laterLessonId).set({
      studentId,
      studentName: "Direct Payment Student",
      date: "2026-07-26",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
  ]);

  const missingStudent = await financeRequest(token, "/bank-transactions/allocate", {
    externalId: "DIRECT-MISSING-STUDENT",
    paidAt: "2026-07-25",
    payerName: "Direct Payer",
    reference: "Advance",
    amount: 10,
    allocations: [],
    lessonAllocations: [],
    requestId: "emulator_direct_missing_student",
  });
  assert.equal(missingStudent.status, 400, JSON.stringify(missingStudent.body));
  assert.match(missingStudent.body.error, /Student required for advance payment/);

  const bankRequestId = "emulator_direct_bank_0001";
  const allocated = await financeRequest(token, "/bank-transactions/allocate", {
    externalId: "DIRECT-BANK-001",
    paidAt: "2026-07-25",
    payerName: "Direct Payer",
    creditStudentId: studentId,
    reference: "Lessons and advance",
    amount: 50,
    allocations: [],
    lessonAllocations: [{ lessonId, amount: 30 }],
    note: "Invoice-free regular client payment",
    requestId: bankRequestId,
  });
  assert.equal(allocated.status, 201, JSON.stringify(allocated.body));
  assert.equal(allocated.body.directLessons.length, 1);
  assert.equal(allocated.body.payerCredit.amount, 20);
  const paymentId = `${bankRequestId}_l1`;

  let [bankSnap, creditSnap, lessonSnap, paymentSnap, auditSnap] = await Promise.all([
    db.collection("bankTransactions").doc(bankRequestId).get(),
    db.collection("payerCredits").doc(bankRequestId).get(),
    db.collection("lessons").doc(lessonId).get(),
    db.collection("payments").doc(paymentId).get(),
    db.collection("financialAudit").doc(bankRequestId).get(),
  ]);
  assert.equal(bankSnap.data().lessonAllocatedAmountCents, 3000);
  assert.equal(bankSnap.data().unappliedAmountCents, 2000);
  assert.equal(creditSnap.data().studentId, studentId);
  assert.equal(creditSnap.data().availableAmountCents, 2000);
  assert.equal(lessonSnap.data().billingStatus, "paid_directly");
  assert.equal(lessonSnap.data().directPaymentId, paymentId);
  assert.equal(paymentSnap.data().kind, "direct_lesson");
  assert.equal(paymentSnap.data().invoiceId, "");
  assert.equal(auditSnap.data().lessons[0].lessonId, lessonId);

  const directRewrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `lessons/${lessonId}?updateMask.fieldPaths=directPaymentAmountCents`,
    { fields: { directPaymentAmountCents: { integerValue: "1" } } },
  );
  assert.equal(directRewrite.status, 403, JSON.stringify(directRewrite.body));

  const voidPayload = {
    paymentId,
    reason: "Wrong lesson allocation",
    requestId: "emulator_direct_void_0001",
  };
  const voided = await financeRequest(token, "/payments/void", voidPayload);
  assert.equal(voided.status, 200, JSON.stringify(voided.body));
  assert.equal(voided.body.idempotent, false);
  const voidRetry = await financeRequest(token, "/payments/void", voidPayload);
  assert.equal(voidRetry.status, 200, JSON.stringify(voidRetry.body));
  assert.equal(voidRetry.body.idempotent, true);

  [bankSnap, creditSnap, lessonSnap, paymentSnap, auditSnap] = await Promise.all([
    db.collection("bankTransactions").doc(bankRequestId).get(),
    db.collection("payerCredits").doc(bankRequestId).get(),
    db.collection("lessons").doc(lessonId).get(),
    db.collection("payments").doc(paymentId).get(),
    db.collection("financialAudit").doc(voidPayload.requestId).get(),
  ]);
  assert.equal(bankSnap.data().allocatedAmountCents, 0);
  assert.equal(bankSnap.data().unappliedAmountCents, 5000);
  assert.equal(creditSnap.data().originalAmountCents, 5000);
  assert.equal(creditSnap.data().availableAmountCents, 5000);
  assert.equal(lessonSnap.data().billingStatus, "unbilled");
  assert.equal(lessonSnap.data().directPaymentId, undefined);
  assert.equal(paymentSnap.data().status, "voided");
  assert.equal(auditSnap.data().action, "direct_lesson_payment.voided");

  const creditApplication = await financeRequest(token, "/payer-credits/apply", {
    creditId: bankRequestId,
    allocations: [],
    lessonAllocations: [{ lessonId: laterLessonId, amount: 25 }],
    note: "Use advance for the next lesson",
    requestId: "emulator_direct_credit_apply_0001",
  });
  assert.equal(creditApplication.status, 201, JSON.stringify(creditApplication.body));
  const [appliedCreditSnap, laterLessonSnap, laterPaymentSnap] = await Promise.all([
    db.collection("payerCredits").doc(bankRequestId).get(),
    db.collection("lessons").doc(laterLessonId).get(),
    db.collection("payments").doc("emulator_direct_credit_apply_0001_l1").get(),
  ]);
  assert.equal(appliedCreditSnap.data().availableAmountCents, 2500);
  assert.equal(laterLessonSnap.data().billingStatus, "paid_directly");
  assert.equal(laterLessonSnap.data().sourceCreditId, bankRequestId);
  assert.equal(laterPaymentSnap.data().kind, "direct_lesson");
  assert.equal(laterPaymentSnap.data().sourceCreditId, bankRequestId);
});

test("monthly financial review is server-verified, versioned, idempotent, and immutable", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  const month = "2026-09";
  const lessonId = "period-review-lesson";
  const invoiceId = "period-review-invoice";
  const paymentId = "period-review-payment";
  const bankId = "period-review-bank";
  await Promise.all([
    db.collection("lessons").doc(lessonId).set({
      studentId: "period-review-student",
      studentName: "Review Student",
      date: "2026-09-05",
      status: "Toimunud",
      billingStatus: "unbilled",
    }),
    db.collection("bankTransactions").doc(bankId).set({
      paidAt: "2026-09-07",
      payerName: "Review Parent",
      amountCents: 3000,
      amount: 30,
      allocatedAmountCents: 0,
      allocatedAmount: 0,
      unappliedAmountCents: 3000,
      unappliedAmount: 30,
      status: "unapplied",
    }),
  ]);

  const blocked = await financeRequest(token, "/financial-periods/review", {
    month,
    requestId: "period_review_blocked_0001",
  });
  assert.equal(blocked.status, 409, JSON.stringify(blocked.body));
  assert.match(blocked.body.error, /blocking financial issue/);
  assert.equal((await db.collection("financialPeriods").doc(month).get()).exists, false);

  await Promise.all([
    db.collection("lessons").doc(lessonId).set({
      studentId: "period-review-student",
      studentName: "Review Student",
      date: "2026-09-05",
      status: "Toimunud",
      billingStatus: "invoiced",
      invoiceId,
      invoiceNum: "KS-REVIEW-001",
    }, { merge: true }),
    db.collection("invoices").doc(invoiceId).set({
      num: "KS-REVIEW-001",
      date: "2026-09-06",
      amountCents: 3000,
      amount: 30,
      paidAmountCents: 3000,
      paidAmount: 30,
      balanceDueCents: 0,
      balanceDue: 0,
      paymentStatus: "paid",
      status: "Makstud",
      lines: [{ lessonId, date: "2026-09-05", amountCents: 3000, amount: 30 }],
      lessonIds: [lessonId],
    }),
    db.collection("payments").doc(paymentId).set({
      invoiceId,
      invoiceNum: "KS-REVIEW-001",
      amountCents: 3000,
      amount: 30,
      paidAt: "2026-09-07",
      status: "active",
      method: "bank",
      bankTransactionId: bankId,
    }),
    db.collection("bankTransactions").doc(bankId).set({
      allocatedAmountCents: 3000,
      allocatedAmount: 30,
      unappliedAmountCents: 0,
      unappliedAmount: 0,
      status: "allocated",
    }, { merge: true }),
  ]);

  const payload = {
    month,
    requestId: "period_review_success_0001",
  };
  const reviewed = await financeRequest(token, "/financial-periods/review", payload);
  assert.equal(reviewed.status, 201, JSON.stringify(reviewed.body));
  assert.equal(reviewed.body.review.status, "reviewed");
  assert.equal(reviewed.body.review.summary.blockingIssueCount, 0);
  assert.equal(reviewed.body.review.summary.exactLessonLinkCount, 1);

  const [periodSnap, reviewSnap, auditSnap] = await Promise.all([
    db.collection("financialPeriods").doc(month).get(),
    db.collection("financialPeriodReviews").doc(payload.requestId).get(),
    db.collection("financialAudit").doc(payload.requestId).get(),
  ]);
  assert.equal(periodSnap.data().lastReviewId, payload.requestId);
  assert.equal(periodSnap.data().reviewVersion, 1);
  assert.equal(reviewSnap.data().fingerprint.length, 64);
  assert.equal(auditSnap.data().action, "financial_period.reviewed");

  const retry = await financeRequest(token, "/financial-periods/review", payload);
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.equal(retry.body.idempotent, true);
  assert.equal((await db.collection("financialPeriodReviews").get()).docs
    .filter(doc => doc.id === payload.requestId).length, 1);

  const clientOverwrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    `financialPeriods/${month}`,
    { fields: { status: { stringValue: "closed" } } },
  );
  assert.equal(clientOverwrite.status, 403, JSON.stringify(clientOverwrite.body));
});

test("a reviewed month exports, closes, locks historical writes, and accepts dated corrections", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  const month = "2024-02";

  const review = await financeRequest(token, "/financial-periods/review", {
    month,
    requestId: "period_close_review_0001",
  });
  assert.equal(review.status, 201, JSON.stringify(review.body));
  assert.equal(review.body.review.summary.blockingIssueCount, 0);

  const exported = await financeRequest(token, "/financial-periods/export", {
    month,
    requestId: "period_close_export_0001",
  });
  assert.equal(exported.status, 201, JSON.stringify(exported.body));
  assert.equal(exported.body.export.status, "archived");
  assert.equal(exported.body.export.evidenceFingerprint.length, 64);

  const closed = await financeRequest(token, "/financial-periods/close", {
    month,
    reason: "Emulator accounting close",
    requestId: "period_close_success_0001",
  });
  assert.equal(closed.status, 201, JSON.stringify(closed.body));
  assert.equal(closed.body.closure.status, "closed");

  const [periodSnap, closureSnap, firstLockSnap, lastLockSnap] = await Promise.all([
    db.collection("financialPeriods").doc(month).get(),
    db.collection("financialPeriodClosures").doc("period_close_success_0001").get(),
    db.collection("financialLockedDates").doc("2024-02-01").get(),
    db.collection("financialLockedDates").doc("2024-02-29").get(),
  ]);
  assert.equal(periodSnap.data().status, "closed");
  assert.equal(closureSnap.data().exportId, "period_close_export_0001");
  assert.equal(firstLockSnap.data().month, month);
  assert.equal(lastLockSnap.data().month, month);

  const browserLessonWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    "lessons/period-close-forged-lesson",
    {
      fields: {
        date: { stringValue: "2024-02-12" },
        status: { stringValue: "Toimunud" },
        studentId: { stringValue: "period-close-student" },
        studentName: { stringValue: "Closed History Student" },
      },
    },
  );
  assert.equal(browserLessonWrite.status, 403, JSON.stringify(browserLessonWrite.body));

  const trustedExpenseWrite = await financeRequest(token, "/expenses", {
    expenseDate: "2024-02-12",
    category: "software",
    description: "Must not rewrite closed history",
    amount: 10,
    vatAmount: 0,
    paymentMethod: "card",
    requestId: "period_close_blocked_expense_0001",
  });
  assert.equal(trustedExpenseWrite.status, 409, JSON.stringify(trustedExpenseWrite.body));
  assert.match(trustedExpenseWrite.body.error, /is closed/);

  const correction = await financeRequest(token, "/financial-periods/corrections", {
    sourceMonth: month,
    effectiveDate: "2026-08-04",
    type: "expense",
    description: "Late receipt correction",
    amountDelta: "10.00",
    vatDelta: "0.00",
    reason: "Received after the historical period was closed",
    requestId: "period_close_correction_0001",
  });
  assert.equal(correction.status, 201, JSON.stringify(correction.body));
  assert.equal(correction.body.correction.sourceMonth, month);
  assert.equal(correction.body.correction.effectiveDate, "2026-08-04");
  assert.equal(correction.body.correction.amountDeltaCents, 1000);

  const analytics = await financeRequest(token, "/financial-analytics/preview", {
    month: "2026-08",
  });
  assert.equal(analytics.status, 200, JSON.stringify(analytics.body));
  assert.equal(analytics.body.snapshot.schemaVersion, "financial_analytics_v1");
  assert.equal(analytics.body.snapshot.month, "2026-08");
  assert.ok(Array.isArray(analytics.body.snapshot.trend));
  assert.ok(Array.isArray(analytics.body.snapshot.agedDebt.rows));
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
      // the room's teacher teaches this student: homework and messages of a student are for their own teacher only
      teacher: "Live Teacher",
      teacherUid,
      teacherUids: [teacherUid],
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
  const historyTimestamp = new Date().toISOString();
  const historyBody = {
    fields: {
      classroomId: { stringValue: "live-room-001" },
      sceneVersion: { integerValue: "2" },
      eventType: { stringValue: "scene_published" },
      scene: {
        mapValue: {
          fields: {
            type: { stringValue: "short_answer" },
            title: { stringValue: "Secure question" },
            body: { stringValue: "Write the answer" },
            version: { integerValue: "2" },
          },
        },
      },
      studentId: { stringValue: "live-student-record" },
      studentName: { stringValue: "Live Student" },
      teacherUid: { stringValue: teacherUid },
      teacherName: { stringValue: "Live Teacher" },
      createdAt: { timestampValue: historyTimestamp },
      createdAtIso: { stringValue: historyTimestamp },
    },
  };
  const teacherCreatesHistory = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001/scenes/scene-2",
    historyBody,
  );
  assert.equal(
    teacherCreatesHistory.status,
    200,
    JSON.stringify(teacherCreatesHistory.body),
  );
  const studentReadsHistory = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "liveClassrooms/live-room-001/scenes/scene-2",
  );
  assert.equal(studentReadsHistory.status, 200, JSON.stringify(studentReadsHistory.body));
  const outsiderReadsHistory = await firestoreDocumentRequest(
    outsiderToken,
    "GET",
    "liveClassrooms/live-room-001/scenes/scene-2",
  );
  assert.equal(outsiderReadsHistory.status, 403, JSON.stringify(outsiderReadsHistory.body));
  const studentCreatesHistory = await firestoreDocumentRequest(
    studentToken,
    "PATCH",
    "liveClassrooms/live-room-001/scenes/scene-2-forged",
    historyBody,
  );
  assert.equal(
    studentCreatesHistory.status,
    403,
    JSON.stringify(studentCreatesHistory.body),
  );
  const teacherChangesHistory = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001/scenes/scene-2",
    {
      fields: {
        ...historyBody.fields,
        eventType: { stringValue: "lesson_ended" },
      },
    },
  );
  assert.equal(
    teacherChangesHistory.status,
    403,
    JSON.stringify(teacherChangesHistory.body),
  );
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

  const externalMaterialLink = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=sceneVersion",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "short_answer" },
              title: { stringValue: "Unsafe link" },
              body: { stringValue: "Must be rejected" },
              version: { integerValue: "3" },
              actionUrl: { stringValue: "https://evil.example/answer-key" },
            },
          },
        },
        sceneVersion: { integerValue: "3" },
      },
    },
  );
  assert.equal(
    externalMaterialLink.status,
    403,
    JSON.stringify(externalMaterialLink.body),
  );

  const leakedAnswerKey = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=sceneVersion",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "short_answer" },
              title: { stringValue: "Unsafe payload" },
              body: { stringValue: "Must be rejected" },
              version: { integerValue: "3" },
              answerKey: { stringValue: "private" },
            },
          },
        },
        sceneVersion: { integerValue: "3" },
      },
    },
  );
  assert.equal(leakedAnswerKey.status, 403, JSON.stringify(leakedAnswerKey.body));

  const jumpedSceneVersion = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=activeScene&updateMask.fieldPaths=sceneVersion",
    {
      fields: {
        activeScene: {
          mapValue: {
            fields: {
              type: { stringValue: "message" },
              title: { stringValue: "Skipped version" },
              body: { stringValue: "Must be rejected" },
              version: { integerValue: "4" },
            },
          },
        },
        sceneVersion: { integerValue: "4" },
      },
    },
  );
  assert.equal(jumpedSceneVersion.status, 403, JSON.stringify(jumpedSceneVersion.body));

  const librarySceneFields = {
    type: { stringValue: "short_answer" },
    title: { stringValue: "Library task" },
    body: { stringValue: "Write a public answer" },
    version: { integerValue: "3" },
    source: {
      mapValue: {
        fields: {
          kind: { stringValue: "exercise" },
          id: { stringValue: "exercise-001" },
          type: { stringValue: "exercise" },
        },
      },
    },
    actionUrl: {
      stringValue:
        "/haldus-exercises/?exercise=exercise-001&student=live-student-record",
    },
  };
  const libraryHistoryTimestamp = new Date().toISOString();
  const publishLibraryMaterial = await firestoreCommitRequest(
    teacherToken,
    [
      {
        update: {
          name:
            `projects/${PROJECT_ID}/databases/(default)/documents/liveClassrooms/live-room-001`,
          fields: {
            activeScene: { mapValue: { fields: librarySceneFields } },
            sceneVersion: { integerValue: "3" },
          },
        },
        updateMask: { fieldPaths: ["activeScene", "sceneVersion"] },
        currentDocument: { exists: true },
      },
      {
        update: {
          name:
            `projects/${PROJECT_ID}/databases/(default)/documents/liveClassrooms/live-room-001/scenes/scene-3`,
          fields: {
            classroomId: { stringValue: "live-room-001" },
            sceneVersion: { integerValue: "3" },
            eventType: { stringValue: "material_published" },
            scene: { mapValue: { fields: librarySceneFields } },
            studentId: { stringValue: "live-student-record" },
            studentName: { stringValue: "Live Student" },
            teacherUid: { stringValue: teacherUid },
            teacherName: { stringValue: "Live Teacher" },
            createdAt: { timestampValue: libraryHistoryTimestamp },
            createdAtIso: { stringValue: libraryHistoryTimestamp },
          },
        },
        currentDocument: { exists: false },
      },
    ],
  );
  assert.equal(
    publishLibraryMaterial.status,
    200,
    JSON.stringify(publishLibraryMaterial.body),
  );

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
              version: { integerValue: "4" },
            },
          },
        },
        sceneVersion: { integerValue: "4" },
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

  const endTimestamp = new Date().toISOString();
  const endedSceneFields = {
    type: { stringValue: "welcome" },
    title: { stringValue: "Lesson ended" },
    body: { stringValue: "Summary saved to the student cabinet" },
    version: { integerValue: "5" },
  };
  const lessonSummaryFields = {
    teacherComment: { stringValue: "Practised the past tense and speaking." },
    achievedGoals: {
      arrayValue: {
        values: [
          { stringValue: "Builds a past-tense sentence" },
          { stringValue: "Uses the new vocabulary" },
        ],
      },
    },
    nextHomework: { stringValue: "Complete exercise 4." },
    homeworkDue: { stringValue: "2026-08-05" },
    homeworkId: { stringValue: "live-classroom-live-room-001" },
  };
  const endRoom = await firestoreCommitRequest(
    teacherToken,
    [
      {
        update: {
          name:
            `projects/${PROJECT_ID}/databases/(default)/documents/liveClassrooms/live-room-001`,
          fields: {
            activeScene: { mapValue: { fields: endedSceneFields } },
            sceneVersion: { integerValue: "5" },
            screenShare: {
              mapValue: {
                fields: {
                  status: { stringValue: "idle" },
                  shareId: { stringValue: "" },
                },
              },
            },
            status: { stringValue: "ended" },
            endedAt: { timestampValue: endTimestamp },
            lessonSummary: { mapValue: { fields: lessonSummaryFields } },
            summaryVersion: { integerValue: "1" },
          },
        },
        updateMask: {
          fieldPaths: [
            "activeScene",
            "sceneVersion",
            "screenShare",
            "status",
            "endedAt",
            "lessonSummary",
            "summaryVersion",
          ],
        },
        currentDocument: { exists: true },
      },
      {
        update: {
          name:
            `projects/${PROJECT_ID}/databases/(default)/documents/liveClassrooms/live-room-001/scenes/scene-5`,
          fields: {
            classroomId: { stringValue: "live-room-001" },
            sceneVersion: { integerValue: "5" },
            eventType: { stringValue: "lesson_ended" },
            scene: { mapValue: { fields: endedSceneFields } },
            studentId: { stringValue: "live-student-record" },
            studentName: { stringValue: "Live Student" },
            teacherUid: { stringValue: teacherUid },
            teacherName: { stringValue: "Live Teacher" },
            createdAt: { timestampValue: endTimestamp },
            createdAtIso: { stringValue: endTimestamp },
          },
        },
        currentDocument: { exists: false },
      },
      {
        update: {
          name:
            `projects/${PROJECT_ID}/databases/(default)/documents/homework/live-classroom-live-room-001`,
          fields: {
            studentId: { stringValue: "live-student-record" },
            studentName: { stringValue: "Live Student" },
            task: { stringValue: "Complete exercise 4." },
            due: { stringValue: "2026-08-05" },
            status: { stringValue: "Ootel" },
            sourceType: { stringValue: "live_classroom" },
            sourceRoomId: { stringValue: "live-room-001" },
            teacherUid: { stringValue: teacherUid },
            teacherName: { stringValue: "Live Teacher" },
            createdByUid: { stringValue: teacherUid },
            createdAt: { timestampValue: endTimestamp },
            createdAtIso: { stringValue: endTimestamp },
          },
        },
        currentDocument: { exists: false },
      },
    ],
  );
  assert.equal(endRoom.status, 200, JSON.stringify(endRoom.body));
  const studentEndedRoomRead = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "liveClassrooms/live-room-001",
  );
  assert.equal(
    studentEndedRoomRead.status,
    200,
    JSON.stringify(studentEndedRoomRead.body),
  );
  assert.equal(
    studentEndedRoomRead.body.fields.lessonSummary.mapValue.fields.homeworkId
      .stringValue,
    "live-classroom-live-room-001",
  );
  const studentHomeworkRead = await firestoreDocumentRequest(
    studentToken,
    "GET",
    "homework/live-classroom-live-room-001",
  );
  assert.equal(
    studentHomeworkRead.status,
    200,
    JSON.stringify(studentHomeworkRead.body),
  );
  const mutateEndedSummary = await firestoreDocumentRequest(
    teacherToken,
    "PATCH",
    "liveClassrooms/live-room-001?updateMask.fieldPaths=lessonSummary",
    {
      fields: {
        lessonSummary: {
          mapValue: {
            fields: {
              ...lessonSummaryFields,
              teacherComment: { stringValue: "Changed after completion" },
            },
          },
        },
      },
    },
  );
  assert.equal(
    mutateEndedSummary.status,
    403,
    JSON.stringify(mutateEndedSummary.body),
  );
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

test("calendar OAuth credentials and deferred sync operations stay server-only", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  await Promise.all([
    db.collection("calendarConnections").doc("teacher-calendar-private").set({
      connected: true,
      refreshToken: "emulator-secret",
      writeEnabled: true,
    }),
    db.collection("calendarSyncOutbox").doc("delete-schedule-private").set({
      action: "delete",
      teacherUid: "teacher-calendar-private",
      eventId: "google-event-private",
    }),
  ]);

  const connectionRead = await firestoreDocumentRequest(
    token,
    "GET",
    "calendarConnections/teacher-calendar-private",
  );
  assert.equal(connectionRead.status, 403, JSON.stringify(connectionRead.body));
  const outboxRead = await firestoreDocumentRequest(
    token,
    "GET",
    "calendarSyncOutbox/delete-schedule-private",
  );
  assert.equal(outboxRead.status, 403, JSON.stringify(outboxRead.body));
  const forgedOutboxWrite = await firestoreDocumentRequest(
    token,
    "PATCH",
    "calendarSyncOutbox/delete-schedule-forged",
    {
      fields: {
        action: { stringValue: "delete" },
        teacherUid: { stringValue: "victim" },
        eventId: { stringValue: "victim-event" },
      },
    },
  );
  assert.equal(forgedOutboxWrite.status, 403, JSON.stringify(forgedOutboxWrite.body));
});

test("staff work time is server-owned, approved for payroll, and audited", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const ownerToken = await createAdminToken();
  const staffToken = await createUserToken("work-time-admin@example.com");
  const staffUid = tokenUid(staffToken);
  await db.collection("users").doc(staffUid).set({
    displayName: "Emulator Admin",
    email: "work-time-admin@example.com",
    role: "admin",
  });

  const clockedIn = await staffOperationsRequest(staffToken, "/clock-in", {
    note: "Morning administration",
  });
  assert.equal(clockedIn.status, 201, JSON.stringify(clockedIn.body));
  assert.equal(clockedIn.body.session.staffUid, staffUid);
  assert.equal(clockedIn.body.session.status, "open");
  const sessionId = clockedIn.body.session.id;

  const retry = await staffOperationsRequest(staffToken, "/clock-in", {});
  assert.equal(retry.status, 200, JSON.stringify(retry.body));
  assert.equal(retry.body.idempotent, true);
  assert.equal(retry.body.session.id, sessionId);

  const forgedBrowserWrite = await firestoreDocumentRequest(
    staffToken,
    "PATCH",
    `workSessions/${sessionId}?updateMask.fieldPaths=durationMinutes`,
    { fields: { durationMinutes: { integerValue: "999" } } },
  );
  assert.equal(forgedBrowserWrite.status, 403, JSON.stringify(forgedBrowserWrite.body));

  const clockedOut = await staffOperationsRequest(staffToken, "/clock-out", {
    breakMinutes: 0,
    note: "Morning administration completed",
  });
  assert.equal(clockedOut.status, 200, JSON.stringify(clockedOut.body));
  assert.equal(clockedOut.body.session.status, "closed");
  assert.equal(clockedOut.body.session.approvalStatus, "pending");

  const rate = await staffOperationsRequest(ownerToken, "/rates", {
    staffUid,
    hourlyRate: "15.50",
  });
  assert.equal(rate.status, 200, JSON.stringify(rate.body));
  assert.equal(rate.body.hourlyRateCents, 1550);

  const approved = await staffOperationsRequest(ownerToken, "/sessions/approve", {
    sessionId,
  });
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  assert.equal(approved.body.session.approvalStatus, "approved");
  assert.equal(approved.body.session.hourlyRateCents, 1550);

  const [sessionSnap, pointerSnap, auditSnap] = await Promise.all([
    db.collection("workSessions").doc(sessionId).get(),
    db.collection("workSessionOpen").doc(staffUid).get(),
    db.collection("workTimeAudit").where("sessionId", "==", sessionId).get(),
  ]);
  assert.equal(sessionSnap.data().approvalStatus, "approved");
  assert.equal(pointerSnap.exists, false);
  assert.ok(auditSnap.size >= 3);
  assert.deepEqual(
    new Set(auditSnap.docs.map(doc => doc.data().action)),
    new Set(["clock_in", "clock_out", "session_approved"]),
  );
});

test("active program time is measured by server heartbeats and cannot be forged", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const staffToken = await createUserToken("active-program-admin@example.com");
  const staffUid = tokenUid(staffToken);
  await db.collection("users").doc(staffUid).set({
    displayName: "Active Program Admin",
    email: "active-program-admin@example.com",
    role: "admin",
  });

  const first = await staffOperationsRequest(staffToken, "/activity/heartbeat", {
    pageInstanceId: "emulator_page_one",
    area: "crm",
  });
  assert.equal(first.status, 200, JSON.stringify(first.body));
  assert.equal(first.body.activeSeconds, 0);
  assert.equal(first.body.creditedSeconds, 0);

  await db.collection("staffProgramPresence").doc(staffUid).set({
    staffUid,
    date: first.body.date,
    lastHeartbeatAt: new Date(Date.now() - 30_000).toISOString(),
    lastPageInstanceId: "emulator_page_one",
    lastArea: "crm",
  });
  const second = await staffOperationsRequest(staffToken, "/activity/heartbeat", {
    pageInstanceId: "emulator_page_two",
    area: "learning-library",
  });
  assert.equal(second.status, 200, JSON.stringify(second.body));
  assert.ok(second.body.creditedSeconds >= 25 && second.body.creditedSeconds <= 60);

  const dayId = `${staffUid}_${first.body.date}`;
  const daySnap = await db.collection("staffProgramDays").doc(dayId).get();
  assert.equal(daySnap.data().staffUid, staffUid);
  assert.equal(daySnap.data().heartbeatCount, 2);
  assert.equal(daySnap.data().activeSeconds, second.body.creditedSeconds);

  const ownRead = await firestoreDocumentRequest(staffToken, "GET", `staffProgramDays/${dayId}`);
  assert.equal(ownRead.status, 200, JSON.stringify(ownRead.body));
  const forgedBrowserWrite = await firestoreDocumentRequest(
    staffToken,
    "PATCH",
    `staffProgramDays/${dayId}?updateMask.fieldPaths=activeSeconds`,
    { fields: { activeSeconds: { integerValue: "999999" } } },
  );
  assert.equal(forgedBrowserWrite.status, 403, JSON.stringify(forgedBrowserWrite.body));
  const privatePointerRead = await firestoreDocumentRequest(
    staffToken,
    "GET",
    `staffProgramPresence/${staffUid}`,
  );
  assert.equal(privatePointerRead.status, 403, JSON.stringify(privatePointerRead.body));
});

test("owner assistant refreshes operational alerts without an external AI", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const ownerToken = await createAdminToken();
  await Promise.all([
    db.collection("invoices").doc("assistant-overdue-invoice").set({
      num: "KS-ASSISTANT-1",
      due: "2020-01-01",
      status: "Ootel",
      amountCents: 5000,
      balanceDueCents: 5000,
    }),
    db.collection("tasks").doc("assistant-overdue-task").set({
      title: "Emulator overdue task",
      due: "2020-01-01",
      status: "active",
    }),
  ]);

  const refreshed = await staffOperationsRequest(ownerToken, "/assistant/refresh");
  assert.equal(refreshed.status, 200, JSON.stringify(refreshed.body));
  assert.ok(refreshed.body.activeCount >= 2);

  const [invoiceAlert, taskAlert] = await Promise.all([
    db.collection("assistantAlerts").doc("invoice_assistant-overdue-invoice").get(),
    db.collection("assistantAlerts").doc("task_assistant-overdue-task").get(),
  ]);
  assert.equal(invoiceAlert.data().active, true);
  assert.equal(invoiceAlert.data().category, "invoice");
  assert.equal(taskAlert.data().active, true);
  assert.equal(taskAlert.data().category, "task");

  const nonAdminToken = await createUserToken("assistant-teacher@example.com");
  const nonAdminUid = tokenUid(nonAdminToken);
  await db.collection("users").doc(nonAdminUid).set({
    displayName: "Assistant Teacher",
    email: "assistant-teacher@example.com",
    role: "teacher",
  });
  const forbiddenRefresh = await staffOperationsRequest(nonAdminToken, "/assistant/refresh");
  assert.equal(forbiddenRefresh.status, 403, JSON.stringify(forbiddenRefresh.body));
});

// Last in the file: apply moves prices of every seeded student, so no earlier test sees the change.
test("lesson prices move off student cards into admin-only plans (admin only, repeatable)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("price-card-only").set({ name: "Card Price", active: true, lessonPrice: 30, weeklyLessons: 2 }),
    db.collection("students").doc("price-both").set({ name: "Both Prices", active: true, lessonPrice: 20, revenuePlanUpdatedAt: "2026-09-01" }),
    db.collection("studentRevenuePlans").doc("price-both").set({ studentId: "price-both", studentName: "Both Prices", lessonPriceCents: 2600, weeklyLessons: 1, currency: "EUR", active: true, updatedAt: "2026-09-01T00:00:00.000Z", updatedByUid: "seed-admin" }),
  ]);

  const outsiderToken = await createUserToken("price-outsider@example.com");
  const forbidden = await financeRequest(outsiderToken, "/students/price-privacy/preview", {});
  assert.equal(forbidden.status, 403, JSON.stringify(forbidden.body));

  const adminToken = await createAdminToken();
  const preview = await financeRequest(adminToken, "/students/price-privacy/preview", {});
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.equal(preview.body.applied, false);
  assert.ok(preview.body.actions.some(action => action.studentId === "price-card-only" && action.createPlan));
  assert.equal((await db.collection("students").doc("price-card-only").get()).data().lessonPrice, 30);

  const applied = await financeRequest(adminToken, "/students/price-privacy/apply", {});
  assert.equal(applied.status, 200, JSON.stringify(applied.body));
  assert.equal(applied.body.applied, true);

  const cardOnly = (await db.collection("students").doc("price-card-only").get()).data();
  assert.equal("lessonPrice" in cardOnly, false);
  assert.equal("weeklyLessons" in cardOnly, false);
  const createdPlan = (await db.collection("studentRevenuePlans").doc("price-card-only").get()).data();
  assert.equal(createdPlan.lessonPriceCents, 3000);
  assert.equal(createdPlan.weeklyLessons, 2);
  const both = (await db.collection("students").doc("price-both").get()).data();
  assert.equal("lessonPrice" in both, false);
  assert.equal((await db.collection("studentRevenuePlans").doc("price-both").get()).data().lessonPriceCents, 2600);

  const again = await financeRequest(adminToken, "/students/price-privacy/preview", {});
  assert.equal(again.body.actions.some(action => action.studentId.startsWith("price-")), false);
});

test("permanent duplicate merge moves the child's data and deletes the duplicate card", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("dup-main").set({ name: "Liisa Kask", active: true, parentEmail: "kask@example.com" }),
    db.collection("students").doc("dup-extra").set({ name: "Liisa Kask", active: true, parentEmail: "kask@example.com", phone: "5551234" }),
    db.collection("homework").doc("dup-homework").set({ studentId: "dup-extra", title: "Kodutöö" }),
    db.collection("lessonRecordings").doc("dup-recording").set({ studentId: "dup-extra", status: "done" }),
    db.collection("studentRevenuePlans").doc("dup-extra").set({ studentId: "dup-extra", studentName: "Liisa Kask", lessonPriceCents: 2500, weeklyLessons: 1, currency: "EUR", active: true, updatedAt: "2026-09-01T00:00:00.000Z", updatedByUid: "seed-admin" }),
  ]);
  const adminToken = await createAdminToken();

  const wrongName = await staffOperationsRequest(adminToken, "/students/merge", { primaryStudentId: "dup-main", duplicateStudentIds: ["dup-extra"], requestId: "dup-merge-wrong", permanent: true, confirmName: "Liisa" });
  assert.equal(wrongName.status, 400, JSON.stringify(wrongName.body));
  assert.equal((await db.collection("students").doc("dup-extra").get()).exists, true);

  const merged = await staffOperationsRequest(adminToken, "/students/merge", { primaryStudentId: "dup-main", duplicateStudentIds: ["dup-extra"], requestId: "dup-merge-ok", permanent: true, confirmName: " liisa  kask " });
  assert.equal(merged.status, 201, JSON.stringify(merged.body));
  assert.equal((await db.collection("students").doc("dup-extra").get()).exists, false);
  assert.equal((await db.collection("studentRevenuePlans").doc("dup-extra").get()).exists, false);
  assert.equal((await db.collection("studentRevenuePlans").doc("dup-main").get()).data().lessonPriceCents, 2500);
  assert.equal((await db.collection("homework").doc("dup-homework").get()).data().studentId, "dup-main");
  assert.equal((await db.collection("lessonRecordings").doc("dup-recording").get()).data().studentId, "dup-main");
  const log = await db.collection("activityLog").doc("student-merge-dup-merge-ok").get();
  assert.equal(log.data().permanent, true);
  assert.deepEqual(log.data().duplicateStudentNames, ["Liisa Kask"]);

  const repeat = await staffOperationsRequest(adminToken, "/students/merge", { primaryStudentId: "dup-main", duplicateStudentIds: ["dup-extra"], requestId: "dup-merge-ok", permanent: true, confirmName: "Liisa Kask" });
  assert.equal(repeat.status, 200, JSON.stringify(repeat.body));
  assert.equal(repeat.body.idempotent, true);
});

test("previously archived duplicates are finished off and deleted", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("old-main").set({ name: "", active: true }),
    db.collection("students").doc("old-dup").set({ name: "Vana Duplikaat", active: false, mergedIntoStudentId: "old-main" }),
    db.collection("homework").doc("old-dup-homework").set({ studentId: "old-dup", title: "Unustatud" }),
  ]);
  const adminToken = await createAdminToken();
  const preview = await staffOperationsRequest(adminToken, "/students/merged/purge/preview", {});
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.ok(preview.body.items.some(item => item.id === "old-dup" && item.mainId === "old-main"));
  assert.equal((await db.collection("students").doc("old-dup").get()).exists, true);

  const applied = await staffOperationsRequest(adminToken, "/students/merged/purge", {});
  assert.equal(applied.status, 200, JSON.stringify(applied.body));
  assert.ok(applied.body.deleted >= 1);
  assert.equal((await db.collection("students").doc("old-dup").get()).exists, false);
  assert.equal((await db.collection("homework").doc("old-dup-homework").get()).data().studentId, "old-main");
});

test("monthly plan invoice is priced from the private plan and issued once per month", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("monthly-student").set({ name: "Kuu Õpilane", active: true, parentEmail: "kuu@example.com" }),
    db.collection("studentRevenuePlans").doc("monthly-student").set({ studentId: "monthly-student", studentName: "Kuu Õpilane", lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 1, billingMode: "current", currency: "EUR", active: true, updatedAt: "2026-09-01T00:00:00.000Z", updatedByUid: "seed-admin" }),
  ]);
  const adminToken = await createAdminToken();
  // manualInvoiceApi checks roles on the profile (the super-admin e-mail alone is not enough there)
  await db.collection("users").doc(tokenUid(adminToken)).set({ roles: ["admin"], role: "admin", email: "zakutailo.pavel@gmail.com" }, { merge: true });
  const call = (body) => fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/manualInvoiceApi/monthly`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (response) => ({ status: response.status, body: await response.json() }));

  const body = { studentId: "monthly-student", month: "2031-10", due: "2031-10-10", plannedUnits: 4, correctionUnits: -1, correctionNote: "1 puudumine", lessonPriceCents: 1 };
  const created = await call(body);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.invoice.amountCents, 7500);
  assert.equal(created.body.invoice.planMonth, "2031-10");
  assert.equal(created.body.invoice.lines.length, 2);

  const again = await call({ ...body, plannedUnits: 8 });
  assert.equal(again.status, 200, JSON.stringify(again.body));
  assert.equal(again.body.idempotent, true);
  assert.equal(again.body.invoice.amountCents, 7500);

  const noPrice = await call({ ...body, studentId: "price-card-only-missing", month: "2031-11" });
  assert.equal(noPrice.status, 404, JSON.stringify(noPrice.body));
});

test("manual invoice dialog: CRM origin is allowed and active students (active: true) are listed", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("invoice-list-active").set({ name: "Arve Aktiivne", active: true, parentName: "Ema" }),
    db.collection("students").doc("invoice-list-archived").set({ name: "Arve Arhiiv", active: false }),
    db.collection("students").doc("invoice-list-parent").set({ name: "Arve Vanem", active: true, convertedToParent: true }),
  ]);
  const adminToken = await createAdminToken();
  await db.collection("users").doc(tokenUid(adminToken)).set({ roles: ["admin"], role: "admin", email: "zakutailo.pavel@gmail.com" }, { merge: true });
  const url = `http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/manualInvoiceApi/students`;
  const preflight = await fetch(url, { method: "OPTIONS", headers: { Origin: "https://crm.epkoolitus.ee", "Access-Control-Request-Method": "POST" } });
  assert.equal(preflight.headers.get("access-control-allow-origin"), "https://crm.epkoolitus.ee");
  const response = await fetch(url, { method: "POST", headers: { Origin: "https://crm.epkoolitus.ee", Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }, body: "{}" });
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  const ids = body.students.map((student) => student.id);
  assert.ok(ids.includes("invoice-list-active"));
  assert.ok(!ids.includes("invoice-list-archived"));
  assert.ok(!ids.includes("invoice-list-parent"));
  assert.equal(body.students.find((student) => student.id === "invoice-list-active").hint, "Ema");
});

test("manual invoice: the owner (super admin by e-mail) may invoice without an admin role on the profile", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const profile = db.collection("users").doc(tokenUid(adminToken));
  const before = await profile.get();
  await profile.set({ email: "zakutailo.pavel@gmail.com", displayName: "Pavel Zakutailo" });
  try {
    const response = await fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/manualInvoiceApi/students`, {
      method: "POST",
      headers: { Origin: "https://crm.epkoolitus.ee", Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: "{}",
    });
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.ok(Array.isArray(body.students));
  } finally {
    if (before.exists) await profile.set(before.data()); else await profile.delete();
  }
});

test("automatic payment reminders are off until an admin switches them on", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await db.collection("financeSettings").doc("reminders").delete();
  const adminToken = await createAdminToken();
  const call = (body) => fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/invoiceApi/reminder-settings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (response) => ({ status: response.status, body: await response.json() }));
  assert.deepEqual((await call({})).body, { autoEnabled: false });
  assert.deepEqual((await call({ autoEnabled: true })).body, { autoEnabled: true });
  assert.deepEqual((await call({ autoEnabled: false })).body, { autoEnabled: false });
  const stored = await db.collection("financeSettings").doc("reminders").get();
  assert.equal(stored.data().autoEnabled, false);
  assert.equal(stored.data().updatedByEmail, "zakutailo.pavel@gmail.com");
});

test("lesson tokens: an invoice for N lessons, credited after payment, consumed and given back by the lesson marks", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const studentId = "tokens-student";
  await Promise.all([
    db.collection("students").doc(studentId).set({ name: "Paketi Õpilane", subject: "Eesti keel", active: true, parentName: "Paketi Ema", parentEmail: "pakett@example.com" }),
    db.collection("studentRevenuePlans").doc(studentId).set({ studentId, studentName: "Paketi Õpilane", lessonPriceCents: 2000, lessonMinutes: 60, weeklyLessons: 2, billingMode: "package", currency: "EUR", active: true, updatedAt: "2026-09-01T00:00:00.000Z", updatedByUid: "seed-admin" }),
  ]);
  const adminToken = await createAdminToken();
  await db.collection("users").doc(tokenUid(adminToken)).set({ roles: ["admin"], role: "admin", email: "zakutailo.pavel@gmail.com" }, { merge: true });
  const post = (fn, path, body) => fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/${fn}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (response) => ({ status: response.status, body: await response.json() }));
  const waitFor = async (read, check, label) => {
    for (let i = 0; i < 60; i += 1) {
      const value = await read();
      if (check(value)) return value;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`timed out: ${label}`);
  };
  const balance = async () => (await db.collection("studentPackages").doc("tokens_tokens-invoice-0001").get()).data()?.balanceCredits;

  // 1. the invoice: 9 lessons at the plan price (the request's price is never used)
  const created = await post("manualInvoiceApi", "/create-tokens", { studentId, lessons: 9, due: "2031-10-10", requestId: "tokens-invoice-0001", lessonPriceCents: 1 });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.invoice.amountCents, 18000);
  assert.equal(created.body.invoice.tokenCredits, 9);
  assert.equal(created.body.invoice.tokenStatus, "pending");
  assert.equal(created.body.invoice.payerEmail, "pakett@example.com");

  // 2. not paid yet: nothing is credited
  const early = await post("financeApi", "/invoices/tokens/credit", { invoiceId: "tokens-invoice-0001" });
  assert.equal(early.status, 409, JSON.stringify(early.body));

  // a lesson held while the payment was on its way: the package covers it when it is credited
  await db.collection("lessons").doc("tokens-lesson-0").set({ studentId, studentName: "Paketi Õpilane", date: "2031-09-30", status: "Toimunud", teacherUid: "t1", accountingSource: "crm_v2" });
  // 3. paid (as a recorded payment leaves it) → the administrator confirms → 9 credits, once
  await db.collection("invoices").doc("tokens-invoice-0001").set({ status: "Makstud", paymentStatus: "paid", paidAmountCents: 18000, balanceDueCents: 0 }, { merge: true });
  const credited = await post("financeApi", "/invoices/tokens/credit", { invoiceId: "tokens-invoice-0001" });
  assert.equal(credited.status, 201, JSON.stringify(credited.body));
  assert.equal(credited.body.studentPackage.balanceCredits, 9);
  assert.equal(credited.body.backlog.consumed, 1);
  assert.equal(await balance(), 8);
  const again = await post("financeApi", "/invoices/tokens/credit", { invoiceId: "tokens-invoice-0001" });
  assert.equal(again.status, 200);
  assert.equal(again.body.idempotent, true);
  assert.equal((await db.collection("invoices").doc("tokens-invoice-0001").get()).data().tokenStatus, "credited");

  // 4. a held lesson takes one credit (the trigger), a no-show without notice too, a notified absence does not
  const lesson = db.collection("lessons").doc("tokens-lesson-1");
  await lesson.set({ studentId, studentName: "Paketi Õpilane", date: "2031-10-01", status: "Toimunud", teacherUid: "t1", accountingSource: "crm_v2" });
  await waitFor(balance, (b) => b === 7, "held lesson consumed");
  await lesson.set({ status: "Puudus_p" }, { merge: true });
  await waitFor(balance, (b) => b === 8, "notified absence gives the credit back");
  await lesson.set({ status: "Puudus_eta" }, { merge: true });
  await waitFor(balance, (b) => b === 7, "no-show without notice consumed");

  // 5. a removed mark (crm-v2 deletes the lesson) gives the credit back and the lesson is not recreated
  await lesson.delete();
  await waitFor(balance, (b) => b === 8, "removed mark restored");
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal((await lesson.get()).exists, false);

  // 6. the ledger has the grant, three consumptions and two restorations
  const ledger = (await db.collection("packageLedger").where("studentPackageId", "==", "tokens_tokens-invoice-0001").get()).docs.map((doc) => doc.data().entryType).sort();
  assert.deepEqual(ledger, ["grant", "lesson_consumption", "lesson_consumption", "lesson_consumption", "lesson_restoration", "lesson_restoration"]);
});

test("cash box: a teacher takes cash, hands it over, an admin links it to the invoice; a voided payment reopens it", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const adminUid = tokenUid(adminToken);
  const teacherToken = await createUserToken("cash-teacher@example.com");
  const teacherUid = tokenUid(teacherToken);
  const otherToken = await createUserToken("cash-other-teacher@example.com");
  const otherUid = tokenUid(otherToken);
  await Promise.all([
    db.collection("users").doc(adminUid).set({ role: "admin", displayName: "Pavel Admin", email: "zakutailo.pavel@gmail.com" }, { merge: true }),
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Cash Teacher", email: "cash-teacher@example.com" }),
    db.collection("users").doc(otherUid).set({ role: "teacher", displayName: "Other Teacher", email: "cash-other-teacher@example.com" }),
    db.collection("students").doc("cash-student").set({ name: "Cash Student", parentName: "Cash Parent", teacherUid, active: true, payerMethod: "cash" }),
    db.collection("invoices").doc("cash-invoice").set({
      num: "KS-CASH-001", date: "2026-10-01", due: "2026-10-10", amountCents: 6000, amount: 60, paidAmountCents: 0, paidAmount: 0,
      balanceDueCents: 6000, balanceDue: 60, paymentStatus: "unpaid", status: "Ootel", studentId: "cash-student", studentName: "Cash Student",
    }),
  ]);

  // a teacher of another student cannot record cash for this one
  const foreign = await financeRequest(otherToken, "/cash/receipts", { studentId: "cash-student", amount: 60, receivedAt: "2026-10-15", requestId: "emulator_cash_foreign_0001" });
  assert.equal(foreign.status, 403, JSON.stringify(foreign.body));

  const receipt = await financeRequest(teacherToken, "/cash/receipts", { studentId: "cash-student", amount: 60, receivedAt: "2026-10-15", note: "oktoober", requestId: "emulator_cash_receipt_0001" });
  assert.equal(receipt.status, 201, JSON.stringify(receipt.body));
  const again = await financeRequest(teacherToken, "/cash/receipts", { studentId: "cash-student", amount: 60, receivedAt: "2026-10-15", requestId: "emulator_cash_receipt_0001" });
  assert.equal(again.status, 200);

  // the teacher sees only their part; cannot hand over more than they hold
  let mine = await financeRequest(teacherToken, "/cash/summary", {});
  assert.equal(mine.status, 200, JSON.stringify(mine.body));
  assert.equal(mine.body.balances[0].cents, 6000);
  const tooMuch = await financeRequest(teacherToken, "/cash/handover", { toUid: adminUid, amount: 70, requestId: "emulator_cash_handover_0000" });
  assert.equal(tooMuch.status, 409, JSON.stringify(tooMuch.body));
  const handover = await financeRequest(teacherToken, "/cash/handover", { toUid: adminUid, amount: 60, handedAt: "2026-10-16", requestId: "emulator_cash_handover_0001" });
  assert.equal(handover.status, 201, JSON.stringify(handover.body));
  mine = await financeRequest(teacherToken, "/cash/summary", {});
  assert.equal(mine.body.balances[0].cents, 0);

  // the teacher cannot link money to an invoice; the admin can
  const teacherAllocate = await financeRequest(teacherToken, "/cash/allocate", { receiptId: "emulator_cash_receipt_0001", invoiceId: "cash-invoice" });
  assert.equal(teacherAllocate.status, 403);
  const allocated = await financeRequest(adminToken, "/cash/allocate", { receiptId: "emulator_cash_receipt_0001", invoiceId: "cash-invoice" });
  assert.equal(allocated.status, 201, JSON.stringify(allocated.body));
  const payment = (await db.collection("payments").doc(allocated.body.payment.id).get()).data();
  assert.equal(payment.method, "cash");
  assert.equal(payment.receivedBy.uid, teacherUid);
  assert.equal((await db.collection("invoices").doc("cash-invoice").get()).data().status, "Makstud");
  assert.equal((await db.collection("cashLedger").doc("emulator_cash_receipt_0001").get()).data().status, "allocated");
  const all = await financeRequest(adminToken, "/cash/summary", {});
  assert.equal(all.body.balances.find(row => row.uid === adminUid).cents, 6000);

  // voiding the payment leaves the money in the box and opens the receipt again
  const voided = await financeRequest(adminToken, "/payments/void", { paymentId: allocated.body.payment.id, reason: "vale arve", requestId: "emulator_cash_void_payment_0001" });
  assert.equal(voided.status, 200, JSON.stringify(voided.body));
  assert.equal((await db.collection("cashLedger").doc("emulator_cash_receipt_0001").get()).data().status, "open");

  // a cash payment typed by the admin names who took the money and enters that person's box
  const direct = await financeRequest(adminToken, "/payments", { invoiceId: "cash-invoice", amount: 60, paidAt: "2026-10-17", method: "cash", receivedByUid: otherUid, requestId: "emulator_cash_direct_payment_0001" });
  assert.equal(direct.status, 201, JSON.stringify(direct.body));
  const directReceipt = (await db.collection("cashLedger").doc("cashpay_emulator_cash_direct_payment_0001").get()).data();
  assert.equal(directReceipt.holderUid, otherUid);
  assert.equal(directReceipt.status, "allocated");

  // clients never write the ledger
  const clientWrite = await firestoreDocumentRequest(adminToken, "PATCH", "cashLedger/emulator_cash_receipt_0001?updateMask.fieldPaths=amountCents", { fields: { amountCents: { integerValue: "1" } } });
  assert.equal(clientWrite.status, 403);
});

test("„Kooli kulul”: an admin marks a package lesson as paid by the school and the credit comes back", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  await db.collection("students").doc("student-school-covered").set({ name: "School Covered Student", lessonsSinceInvoice: 0, active: true });
  const product = await financeRequest(adminToken, "/package-products", { name: "Two lessons", lessonCredits: 2, totalPrice: 60, effectiveFrom: "2026-07-01", requestId: "emulator_school_covered_product_0001" });
  assert.equal(product.status, 201, JSON.stringify(product.body));
  const issued = await financeRequest(adminToken, "/student-packages", { studentId: "student-school-covered", packageProductId: "emulator_school_covered_product_0001", issuedAt: "2026-07-01", requestId: "emulator_school_covered_issue_0001" });
  assert.equal(issued.status, 201, JSON.stringify(issued.body));
  await db.collection("lessons").doc("lesson-school-covered").set({ studentId: "student-school-covered", studentName: "School Covered Student", date: "2026-07-29", status: "Toimunud", requestedStudentPackageId: "emulator_school_covered_issue_0001" });
  const consumed = await financeRequest(adminToken, "/lessons/package-consumption/sync", { lessonId: "lesson-school-covered", requestId: "emulator_school_covered_consume_0001" });
  assert.equal(consumed.body.status, "consumed", JSON.stringify(consumed.body));
  assert.equal(consumed.body.balanceAfter, 1);

  const noReason = await financeRequest(adminToken, "/lessons/billing-disposition", { lessonId: "lesson-school-covered", billingStatus: "school_covered", reason: "", requestId: "emulator_school_covered_mark_0000" });
  assert.equal(noReason.status, 400, JSON.stringify(noReason.body));
  const marked = await financeRequest(adminToken, "/lessons/billing-disposition", { lessonId: "lesson-school-covered", billingStatus: "school_covered", reason: "õpetaja hilines", requestId: "emulator_school_covered_mark_0001" });
  assert.ok([200, 201].includes(marked.status), JSON.stringify(marked.body));
  const restored = await financeRequest(adminToken, "/lessons/package-consumption/sync", { lessonId: "lesson-school-covered", requestId: "emulator_school_covered_restore_0001" });
  assert.equal(restored.body.status, "restored", JSON.stringify(restored.body));
  assert.equal(restored.body.balanceAfter, 2);
  const [lessonSnap, auditSnap] = await Promise.all([
    db.collection("lessons").doc("lesson-school-covered").get(),
    db.collection("financialAudit").doc("emulator_school_covered_mark_0001").get(),
  ]);
  assert.equal(lessonSnap.data().status, "Toimunud");
  assert.equal(lessonSnap.data().billingStatus, "school_covered");
  assert.equal(lessonSnap.data().billingDispositionReason, "õpetaja hilines");
  assert.equal(auditSnap.data().afterBillingStatus, "school_covered");
});

test("one card, two subjects: one monthly invoice with a line per subject at its own price (owner 2026-10-20)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  await Promise.all([
    db.collection("students").doc("two-subjects").set({ name: "Kahe Aine Laps", active: true, subject: "Eesti keel", parentEmail: "pere@example.com",
      enrollments: [{ subject: "Eesti keel", teacher: "Pavel" }, { subject: "Matemaatika", teacher: "Yelyzaveta" }] }),
    db.collection("studentRevenuePlans").doc("two-subjects").set({ studentId: "two-subjects", studentName: "Kahe Aine Laps", lessonPriceCents: 2000, lessonMinutes: 60, weeklyLessons: 2, billingMode: "current", currency: "EUR", active: true, updatedAt: "2026-10-01T00:00:00.000Z", updatedByUid: "seed-admin",
      subjectPrices: { Matemaatika: { lessonPriceCents: 2800, lessonMinutes: 45 } } }),
  ]);
  const adminToken = await createAdminToken();
  await db.collection("users").doc(tokenUid(adminToken)).set({ roles: ["admin"], role: "admin", email: "zakutailo.pavel@gmail.com" }, { merge: true });
  const call = (path, body) => fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/manualInvoiceApi${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  }).then(async (response) => ({ status: response.status, body: await response.json() }));
  const created = await call("/monthly-combined", { month: "2031-12", due: "2031-12-10", items: [
    { studentId: "two-subjects", subject: "Eesti keel", plannedUnits: 4, correctionUnits: 0 },
    { studentId: "two-subjects", subject: "Matemaatika", plannedUnits: 3, correctionUnits: 0 },
  ] });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const invoice = created.body.invoice;
  assert.equal(invoice.amountCents, 4 * 2000 + 3 * 2800);
  assert.deepEqual(invoice.studentIds, ["two-subjects"]);
  assert.deepEqual(invoice.lines.map((line) => line.subject), ["Eesti keel", "Matemaatika"]);
  assert.match(invoice.lines[1].description, /^Matemaatika: Tunnid/);
  // the same card cannot be billed for the month again, and one subject alone gets its own price
  const again = await call("/monthly", { studentId: "two-subjects", month: "2031-12", due: "2031-12-10", plannedUnits: 2, subject: "Matemaatika" });
  assert.equal(again.status, 200, JSON.stringify(again.body));
  assert.equal(again.body.idempotent, true);
  const single = await call("/monthly", { studentId: "two-subjects", month: "2032-01", due: "2032-01-10", plannedUnits: 2, subject: "Matemaatika" });
  assert.equal(single.status, 201, JSON.stringify(single.body));
  assert.equal(single.body.invoice.amountCents, 2 * 2800);
  assert.equal(single.body.invoice.subject, "Matemaatika");
});

test("one bank payment pays two invoices of a child and remembers the payer's account (owner 2026-10-21)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const token = await createAdminToken();
  await Promise.all([
    db.collection("students").doc("bank-memory-child").set({ name: "Mälu Laps", active: true }),
    db.collection("invoices").doc("bank-memory-inv-a").set({ num: "KS-2031-901", studentId: "bank-memory-child", studentName: "Mälu Laps", amountCents: 4500, amount: 45, balanceDueCents: 4500, balanceDue: 45, paidAmountCents: 0, paidAmount: 0, status: "Saadetud", date: "2031-10-01" }),
    db.collection("invoices").doc("bank-memory-inv-b").set({ num: "KS-2031-902", studentId: "bank-memory-child", studentName: "Mälu Laps", amountCents: 3000, amount: 30, balanceDueCents: 3000, balanceDue: 30, paidAmountCents: 0, paidAmount: 0, status: "Saadetud", date: "2031-10-02" }),
  ]);
  const allocated = await financeRequest(token, "/bank-transactions/allocate", {
    externalId: "MEMORY-001", paidAt: "2031-10-05", payerName: "Ema Mälu", payerAccount: "EE12 7700 0000 1111", reference: "Ülekanne",
    amount: 75, allocations: [{ invoiceId: "bank-memory-inv-a", amount: 45 }, { invoiceId: "bank-memory-inv-b", amount: 30 }], lessonAllocations: [],
    requestId: "emulator_bank_memory_0001",
  });
  assert.equal(allocated.status, 201, JSON.stringify(allocated.body));
  const bank = (await db.collection("bankTransactions").doc("emulator_bank_memory_0001").get()).data();
  assert.equal(bank.payerAccount, "EE12770000001111");
  assert.deepEqual(bank.paidStudentIds, ["bank-memory-child"]);
  assert.equal(bank.allocatedAmountCents, 7500);
  for (const id of ["bank-memory-inv-a", "bank-memory-inv-b"]) {
    const invoice = (await db.collection("invoices").doc(id).get()).data();
    assert.equal(invoice.balanceDueCents, 0, `${id} ${JSON.stringify(invoice)}`);
  }
});

test("bookkeeping: documents become numbered entries once, manual entries balance, corrections are stornos (owner 2026-10-22)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  await db.collection("invoices").doc("acc-invoice-1").set({ num: "KS-2026-901", date: "2026-09-01", amountCents: 10000, amount: 100, status: "Ootel", studentName: "Raamatupidamise test" });
  await db.collection("payments").doc("acc-payment-1").set({ invoiceId: "acc-invoice-1", invoiceNum: "KS-2026-901", paidAt: "2026-09-02", amountCents: 5000, amount: 50, method: "bank", status: "active" });

  const synced = await financeRequest(adminToken, "/accounting/sync", {});
  assert.equal(synced.status, 200, JSON.stringify(synced.body));
  const invoiceEntry = (await db.collection("accountingEntries").doc("auto_invoice_acc-invoice-1").get()).data();
  assert.match(invoiceEntry.number, /^2026-\d{4}$/);
  assert.deepEqual(invoiceEntry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["1200", 10000, 0], ["3000", 0, 10000]]);
  assert.equal(invoiceEntry.documentRef, "KS-2026-901");
  assert.ok((await db.collection("accountingEntries").doc("auto_payment_acc-payment-1").get()).exists);
  assert.ok((await db.collection("accountingAccounts").doc("3060").get()).exists, "the chart is seeded");
  const again = await financeRequest(adminToken, "/accounting/sync", {});
  assert.equal(again.body.created, 0, "a second sync creates nothing");

  const salary = { date: "2026-09-30", description: "Septembri palk", documentRef: "Palgaleht 09/2026", lines: [{ account: "4710", debitCents: 120000 }, { account: "2210", creditCents: 120000 }] };
  const manual = await financeRequest(adminToken, "/accounting/entries", { entry: salary, requestId: "acc_manual_0001" });
  assert.equal(manual.status, 201, JSON.stringify(manual.body));
  const repeated = await financeRequest(adminToken, "/accounting/entries", { entry: salary, requestId: "acc_manual_0001" });
  assert.equal(repeated.body.entry.number, manual.body.entry.number);
  const unbalanced = await financeRequest(adminToken, "/accounting/entries", { entry: { ...salary, lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 90 }] }, requestId: "acc_manual_0002" });
  assert.equal(unbalanced.status, 400, JSON.stringify(unbalanced.body));

  const storno = await financeRequest(adminToken, "/accounting/entries/reverse", { entryId: manual.body.entry.id, date: "2026-10-01", reason: "vale summa", requestId: "acc_reverse_0001" });
  assert.equal(storno.status, 201, JSON.stringify(storno.body));
  assert.deepEqual(storno.body.entry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["4710", 0, 120000], ["2210", 120000, 0]]);
  assert.equal((await db.collection("accountingEntries").doc(manual.body.entry.id).get()).data().reversedBy, storno.body.entry.id);
  const twice = await financeRequest(adminToken, "/accounting/entries/reverse", { entryId: manual.body.entry.id, date: "2026-10-01", reason: "uuesti", requestId: "acc_reverse_0002" });
  assert.equal(twice.status, 400, JSON.stringify(twice.body));
  const autoStorno = await financeRequest(adminToken, "/accounting/entries/reverse", { entryId: "auto_invoice_acc-invoice-1", date: "2026-10-01", reason: "x", requestId: "acc_reverse_0003" });
  assert.equal(autoStorno.status, 409, JSON.stringify(autoStorno.body));

  const opening = await financeRequest(adminToken, "/accounting/opening", { balances: [{ account: "1010", debitCents: 50000 }, { account: "2970", creditCents: 50000 }], requestId: "acc_opening_0001" });
  assert.equal(opening.status, 201, JSON.stringify(opening.body));
  assert.equal(opening.body.entry.date, "2026-01-01");
  const secondOpening = await financeRequest(adminToken, "/accounting/opening", { balances: [{ account: "1010", debitCents: 100 }, { account: "2970", creditCents: 100 }], requestId: "acc_opening_0002" });
  assert.equal(secondOpening.status, 409, JSON.stringify(secondOpening.body));
});

test("INF 3: personal codes are admin-only, a parent's link fills them, the report builds the e-MTA XML (owner 2026-10-22)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  await db.collection("students").doc("inf3-student").set({ name: "Mia Maksutest", parentName: "Kati Maksutest" });
  await db.collection("invoices").doc("inf3-invoice").set({ num: "KS-2025-777", studentId: "inf3-student", date: "2025-03-01", amountCents: 12000, status: "Makstud" });
  await db.collection("payments").doc("inf3-payment").set({ invoiceId: "inf3-invoice", studentId: "inf3-student", paidAt: "2025-03-05", amountCents: 12000, method: "bank", status: "active", payerName: "Kati Maksutest" });

  const invalid = await financeRequest(adminToken, "/tax/identity", { studentId: "inf3-student", identity: { studentCode: "49403136527" } });
  assert.equal(invalid.status, 400, JSON.stringify(invalid.body));
  const saved = await financeRequest(adminToken, "/tax/identity", { studentId: "inf3-student", identity: { studentCode: "49403136526", trainingType: 3 } });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));

  const link = await financeRequest(adminToken, "/tax/form-link", { studentId: "inf3-student" });
  assert.equal(link.status, 201, JSON.stringify(link.body));
  const token = link.body.url.split("/maksuandmed/")[1];
  const form = (path, body) => fetch(`http://${FUNCTIONS_EMULATOR}/${PROJECT_ID}/us-central1/taxFormApi${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() }));
  const info = await form("/info", { token });
  assert.equal(info.status, 200, JSON.stringify(info.body));
  assert.equal(info.body.studentFirstName, "Mia");
  assert.equal((await form("/info", { token: "x".repeat(32) })).status, 404);
  const noConsent = await form("/submit", { token, payerName: "Kati Maksutest", payerCode: "37605030299", studentCode: "49403136526" });
  assert.equal(noConsent.status, 400);
  const submitted = await form("/submit", { token, payerName: "Kati Maksutest", payerCode: "37605030299", studentCode: "49403136526", consent: true });
  assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
  const identity = (await db.collection("taxIdentities").doc("inf3-student").get()).data();
  assert.equal(identity.payerCode, "37605030299");
  assert.equal(identity.trainingType, 3, "the parent's form keeps the school's training type");

  const report = await financeRequest(adminToken, "/tax/inf3", { year: 2025 });
  assert.equal(report.status, 200, JSON.stringify(report.body));
  const row = report.body.rows.find((r) => r.studentId === "inf3-student");
  assert.equal(row.amountCents, 12000);
  assert.equal(row.ready, true);
  assert.match(report.body.xml, /<koolitusmaksja_isikukood>37605030299<\/koolitusmaksja_isikukood>/);
  assert.match(report.body.xml, /<koolituse_liik>3<\/koolituse_liik>/);

  // a second child of the same parent gets the parent's code without entering it again
  await db.collection("students").doc("inf3-student").set({ linkedParentId: "inf3-parent" }, { merge: true });
  await db.collection("students").doc("inf3-sibling").set({ name: "Oskar Maksutest", linkedParentId: "inf3-parent" });
  await financeRequest(adminToken, "/tax/identity", { studentId: "inf3-student", identity: { studentCode: "49403136526", payerCode: "37605030299", payerName: "Kati Maksutest", trainingType: 3 } });
  await db.collection("invoices").doc("inf3-invoice-2").set({ num: "KS-2025-778", studentId: "inf3-sibling", date: "2025-04-01", amountCents: 5000, status: "Makstud" });
  await db.collection("payments").doc("inf3-payment-2").set({ invoiceId: "inf3-invoice-2", studentId: "inf3-sibling", paidAt: "2025-04-05", amountCents: 5000, method: "bank", status: "active" });
  const sibling = (await financeRequest(adminToken, "/tax/inf3", { year: 2025 })).body.rows.find((r) => r.studentId === "inf3-sibling");
  assert.equal(sibling.payerCode, "37605030299");
  assert.equal(sibling.payerFromParent, true);
  assert.deepEqual(sibling.problems, ["Õpilase isikukood puudub"]);
});

test("suppliers and purchase invoices book OA / VM entries; corrections keep a history; the accounting lock stops edits (the accountant 2026-10-23)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const lines = (entry) => entry.lines.map((l) => [l.account, l.debitCents, l.creditCents]);

  const supplier = await financeRequest(adminToken, "/suppliers", { supplier: { name: "Senty Studio OÜ", regCode: "14500001", iban: "EE38 2200 2210 2014 5685", defaultAccount: "4210" }, requestId: "supplier_create_0001" });
  assert.equal(supplier.status, 201, JSON.stringify(supplier.body));
  const supplierId = supplier.body.supplier.id;
  assert.equal(supplier.body.supplier.iban, "EE382200221020145685");
  const duplicateSupplier = await financeRequest(adminToken, "/suppliers", { supplier: { name: "Senty kaks", regCode: "14500001" }, requestId: "supplier_create_0002" });
  assert.equal(duplicateSupplier.status, 409, JSON.stringify(duplicateSupplier.body));
  const renamed = await financeRequest(adminToken, "/suppliers", { supplierId, supplier: { name: "Senty Studio OÜ", regCode: "14500001", email: "arved@senty.test", defaultAccount: "4210" } });
  assert.equal(renamed.status, 201, JSON.stringify(renamed.body));
  assert.equal((await db.collection("suppliers").doc(supplierId).get()).data().email, "arved@senty.test");

  const invoiceValues = { supplierId, documentNumber: "1575", date: "2027-03-01", dueDate: "2027-03-15", lines: [{ account: "4210", description: "Ruumide rent märts", amountCents: 30000, vatCents: 5000 }] };
  const created = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: invoiceValues, requestId: "purchase_create_0001" });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const invoiceId = created.body.purchaseInvoice.id;
  const oa = (await db.collection("accountingEntries").doc(`auto_purchase-invoice_${invoiceId}`).get()).data();
  assert.deepEqual(lines(oa), [["4210", 30000, 0], ["2110", 0, 30000]], "not VAT registered: no 2311 line");
  assert.equal(oa.documentType, "purchaseInvoice");
  assert.equal(oa.documentRef, "1575");
  assert.match(oa.number, /^2027-\d{4}$/);
  const again = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: invoiceValues, requestId: "purchase_create_0001" });
  assert.equal(again.status, 200, "the same request is idempotent");
  const duplicate = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: invoiceValues, requestId: "purchase_create_0002" });
  assert.equal(duplicate.status, 409, "the same supplier invoice is not entered twice");

  // the document is corrected while the period is open: the invoice and its OA entry change together, with history
  const edited = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoiceId: invoiceId, purchaseInvoice: { ...invoiceValues, lines: [...invoiceValues.lines, { account: "4330", description: "Kontoritarbed", amountCents: 1220 }] }, reason: "unustatud rida", requestId: "purchase_edit_0001" });
  assert.equal(edited.status, 201, JSON.stringify(edited.body));
  const oaEdited = (await db.collection("accountingEntries").doc(`auto_purchase-invoice_${invoiceId}`).get()).data();
  assert.deepEqual(lines(oaEdited), [["4210", 30000, 0], ["4330", 1220, 0], ["2110", 0, 31220]]);
  assert.equal(oaEdited.number, oa.number, "the entry keeps its number");
  assert.equal(oaEdited.history.length, 1);
  assert.equal(oaEdited.history[0].before.lines.length, 2);

  const paid = await financeRequest(adminToken, "/purchase-invoices/pay", { purchaseInvoiceId: invoiceId, payment: { date: "2027-03-10", amountCents: 31220, method: "bank" }, requestId: "purchase_pay_0001" });
  assert.equal(paid.status, 201, JSON.stringify(paid.body));
  assert.equal(paid.body.purchaseInvoice.status, "paid");
  assert.deepEqual(lines(paid.body.entry), [["2110", 31220, 0], ["1010", 0, 31220]]);
  assert.equal(paid.body.entry.documentType, "supplierPayment");
  const overpaid = await financeRequest(adminToken, "/purchase-invoices/pay", { purchaseInvoiceId: invoiceId, payment: { date: "2027-03-11", amountCents: 100 }, requestId: "purchase_pay_0002" });
  assert.equal(overpaid.status, 409, JSON.stringify(overpaid.body));
  const cannotVoidPaid = await financeRequest(adminToken, "/purchase-invoices/void", { purchaseInvoiceId: invoiceId, reason: "x", requestId: "purchase_void_0001" });
  assert.equal(cannotVoidPaid.status, 409);
  const removed = await financeRequest(adminToken, "/purchase-invoices/payment/remove", { purchaseInvoiceId: invoiceId, paymentId: paid.body.purchaseInvoice.payments[0].id, reason: "vale kuupäev", requestId: "purchase_unpay_0001" });
  assert.equal(removed.status, 201, JSON.stringify(removed.body));
  assert.equal(removed.body.purchaseInvoice.status, "unpaid");
  assert.equal((await db.collection("accountingEntries").doc(paid.body.entry.id).get()).data().deleted, true, "the VM entry stays as a tombstone");

  // paid on the spot (card): the invoice and its payment in one go
  const card = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: { supplierId, documentNumber: "K-9", date: "2027-03-02", lines: [{ account: "4320", description: "Zoom", amountCents: 1499 }] }, paidNow: { method: "card" }, requestId: "purchase_create_0003" });
  assert.equal(card.status, 201, JSON.stringify(card.body));
  assert.equal(card.body.purchaseInvoice.status, "paid");
  assert.deepEqual(card.body.entries.map((e) => e.documentType), ["purchaseInvoice", "supplierPayment"]);

  // manual entry: edit with history, delete as a tombstone, an automatic entry: override of its lines
  const manual = await financeRequest(adminToken, "/accounting/entries", { entry: { date: "2027-03-31", description: "Märtsi palk", documentRef: "PL 03", lines: [{ account: "4710", debitCents: 1000 }, { account: "2210", creditCents: 1000 }] }, requestId: "acc_manual_2027_0001" });
  assert.equal(manual.status, 201, JSON.stringify(manual.body));
  const manualId = manual.body.entry.id;
  const fixed = await financeRequest(adminToken, "/accounting/entries/update", { entryId: manualId, entry: { date: "2027-03-31", description: "Märtsi palk", documentRef: "PL 03", lines: [{ account: "4710", debitCents: 1500 }, { account: "2210", creditCents: 1500 }] }, requestId: "acc_update_0001" });
  assert.equal(fixed.status, 201, JSON.stringify(fixed.body));
  const fixedEntry = (await db.collection("accountingEntries").doc(manualId).get()).data();
  assert.equal(fixedEntry.totalCents, 1500);
  assert.equal(fixedEntry.history[0].before.lines[0].debitCents, 1000);
  assert.equal(fixedEntry.history[0].by.email, "zakutailo.pavel@gmail.com");
  assert.ok((await db.collection("financialAudit").doc("acc_update_0001").get()).exists);

  const overrideNoReason = await financeRequest(adminToken, "/accounting/entries/update", { entryId: `auto_purchase-invoice_${invoiceId}`, entry: { description: "Senty Studio OÜ", lines: [{ account: "4220", debitCents: 31220 }, { account: "2110", creditCents: 31220 }] }, requestId: "acc_update_0002" });
  assert.equal(overrideNoReason.status, 400, JSON.stringify(overrideNoReason.body));
  const override = await financeRequest(adminToken, "/accounting/entries/update", { entryId: `auto_purchase-invoice_${invoiceId}`, entry: { description: "Senty Studio OÜ", lines: [{ account: "4210", debitCents: 31220 }, { account: "2110", creditCents: 31220 }] }, reason: "kõik on rent", requestId: "acc_update_0003" });
  assert.equal(override.status, 201, JSON.stringify(override.body));
  const overridden = (await db.collection("accountingEntries").doc(`auto_purchase-invoice_${invoiceId}`).get()).data();
  assert.equal(overridden.documentRef, "1575", "the source document stays linked");
  assert.equal(overridden.override.reason, "kõik on rent");
  assert.equal(overridden.original.lines.length, 3);
  const autoDelete = await financeRequest(adminToken, "/accounting/entries/delete", { entryId: `auto_purchase-invoice_${invoiceId}`, reason: "x", requestId: "acc_delete_0001" });
  assert.equal(autoDelete.status, 409, JSON.stringify(autoDelete.body));

  // „Sulge periood kuni 31.03.2027”: no edit, no delete, no new document in March; a correcting entry after it works
  const locked = await financeRequest(adminToken, "/accounting/lock", { lockedThrough: "2027-03-31" });
  assert.equal(locked.status, 200, JSON.stringify(locked.body));
  const lockedEdit = await financeRequest(adminToken, "/accounting/entries/update", { entryId: manualId, entry: { date: "2027-03-31", description: "Märtsi palk", documentRef: "PL 03", lines: [{ account: "4710", debitCents: 1 }, { account: "2210", creditCents: 1 }] }, requestId: "acc_update_0004" });
  assert.equal(lockedEdit.status, 409, JSON.stringify(lockedEdit.body));
  const lockedDelete = await financeRequest(adminToken, "/accounting/entries/delete", { entryId: manualId, reason: "x", requestId: "acc_delete_0002" });
  assert.equal(lockedDelete.status, 409, JSON.stringify(lockedDelete.body));
  const lockedInvoice = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: { ...invoiceValues, documentNumber: "1576" }, requestId: "purchase_create_0004" });
  assert.equal(lockedInvoice.status, 409, JSON.stringify(lockedInvoice.body));
  const correction = await financeRequest(adminToken, "/accounting/entries/reverse", { entryId: manualId, date: "2027-04-01", reason: "palk oli vale", requestId: "acc_reverse_2027_0001" });
  assert.equal(correction.status, 201, JSON.stringify(correction.body));
  const reopenWithoutReason = await financeRequest(adminToken, "/accounting/lock", { lockedThrough: "" });
  assert.equal(reopenWithoutReason.status, 400, JSON.stringify(reopenWithoutReason.body));
  const reopened = await financeRequest(adminToken, "/accounting/lock", { lockedThrough: "", reason: "emulaatori test" });
  assert.equal(reopened.status, 200, JSON.stringify(reopened.body));

  // a deleted manual entry stays as a tombstone with its history
  const another = await financeRequest(adminToken, "/accounting/entries", { entry: { date: "2027-04-02", description: "Vale kanne", documentRef: "X", lines: [{ account: "4710", debitCents: 10 }, { account: "2210", creditCents: 10 }] }, requestId: "acc_manual_2027_0002" });
  const deleted = await financeRequest(adminToken, "/accounting/entries/delete", { entryId: another.body.entry.id, reason: "topelt", requestId: "acc_delete_0003" });
  assert.equal(deleted.status, 201, JSON.stringify(deleted.body));
  const tombstone = (await db.collection("accountingEntries").doc(another.body.entry.id).get()).data();
  assert.equal(tombstone.deleted, true);
  assert.equal(tombstone.history[0].action, "delete");
  assert.equal(tombstone.number, another.body.entry.number, "the number is never reused");

  // void an unpaid invoice while open: its OA entry becomes a tombstone
  const voidable = await financeRequest(adminToken, "/purchase-invoices", { purchaseInvoice: { ...invoiceValues, documentNumber: "1599", date: "2027-04-03", dueDate: "2027-04-10" }, requestId: "purchase_create_0005" });
  const voided = await financeRequest(adminToken, "/purchase-invoices/void", { purchaseInvoiceId: voidable.body.purchaseInvoice.id, reason: "tarnija saatis kaks korda", requestId: "purchase_void_0002" });
  assert.equal(voided.status, 201, JSON.stringify(voided.body));
  assert.equal((await db.collection("accountingEntries").doc(voidable.body.purchaseInvoice.entryId).get()).data().deleted, true);

  // the browser never writes suppliers, purchase invoices, the lock or entries
  for (const path of [`suppliers/${supplierId}`, `purchaseInvoices/${invoiceId}`, "accountingSettings/lock", `accountingEntries/${manualId}`]) {
    const direct = await firestoreDocumentRequest(adminToken, "PATCH", path, { fields: { name: { stringValue: "forged" } } });
    assert.equal(direct.status, 403, `${path} ${JSON.stringify(direct.body)}`);
  }
  const teacherToken = await createUserToken("purchase-teacher@example.com");
  await db.collection("users").doc(tokenUid(teacherToken)).set({ role: "teacher", displayName: "Purchase Teacher" });
  assert.equal((await firestoreDocumentRequest(teacherToken, "GET", `purchaseInvoices/${invoiceId}`)).status, 403);
  assert.equal((await financeRequest(teacherToken, "/suppliers", { supplier: { name: "X" }, requestId: "supplier_create_0099" })).status, 403);
});

test("„Asenda konto” moves an account in many entries with history and audit, refuses a locked period, is idempotent and undoable (the accountant 2026-10-23)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const make = async (date, n) => {
    const created = await financeRequest(adminToken, "/accounting/entries", { entry: { date, description: `Müük ${n}`, documentRef: `M-${n}`, lines: [{ account: "1010", debitCents: 1000 * n }, { account: "3060", creditCents: 1000 * n }] }, requestId: `acc_replace_make_000${n}` });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    return created.body.entry.id;
  };
  const january = await make("2028-01-15", 1);
  const feb1 = await make("2028-02-01", 2);
  const feb2 = await make("2028-02-02", 3);
  const accountsOf = async (id) => (await db.collection("accountingEntries").doc(id).get()).data().lines.map((l) => l.account);

  const noReason = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "3000", entryIds: [feb1], requestId: "acc_replace_0000" });
  assert.equal(noReason.status, 400, JSON.stringify(noReason.body));
  assert.equal((await financeRequest(adminToken, "/accounting/lock", { lockedThrough: "2028-01-31" })).status, 200);
  // one entry in the locked period refuses the whole request: nothing changes
  const refused = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "3000", entryIds: [january, feb1, feb2], reason: "müügitulu 3000", requestId: "acc_replace_0001" });
  assert.equal(refused.status, 409, JSON.stringify(refused.body));
  assert.deepEqual(await accountsOf(feb1), ["1010", "3060"]);

  const replaced = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "3000", entryIds: [feb1, feb2], reason: "müügitulu 3000", requestId: "acc_replace_0002" });
  assert.equal(replaced.status, 201, JSON.stringify(replaced.body));
  assert.equal(replaced.body.changed.length, 2);
  assert.deepEqual(replaced.body.changed[0].lineIndexes, [1]);
  const moved = (await db.collection("accountingEntries").doc(feb1).get()).data();
  assert.deepEqual(moved.lines.map((l) => l.account), ["1010", "3000"]);
  assert.equal(moved.history.at(-1).reason, "müügitulu 3000");
  assert.equal(moved.history.at(-1).before.lines[1].account, "3060");
  const audit = (await db.collection("financialAudit").doc(`acc_replace_0002_${feb1}`).get()).data();
  assert.equal(audit.batch, "replace-account");
  assert.equal(audit.fromAccount, "3060");
  // the same request again changes nothing
  const again = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "3000", entryIds: [feb1, feb2], reason: "müügitulu 3000", requestId: "acc_replace_0002" });
  assert.equal(again.status, 200, JSON.stringify(again.body));
  assert.equal(again.body.idempotent, true);
  assert.equal((await db.collection("accountingEntries").doc(feb1).get()).data().history.length, moved.history.length);
  // undo (Ctrl+Z): exactly the moved lines go back, recorded in the history
  const undo = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3000", toAccount: "3060", targets: replaced.body.changed.map((c) => ({ entryId: c.entryId, lineIndexes: c.lineIndexes })), reason: "Tagasivõtmine (Ctrl+Z)", requestId: "acc_replace_0003" });
  assert.equal(undo.status, 201, JSON.stringify(undo.body));
  assert.deepEqual(await accountsOf(feb2), ["1010", "3060"]);
  assert.equal((await db.collection("accountingEntries").doc(feb2).get()).data().history.length, 2);
  const closed = await financeRequest(adminToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "9999", entryIds: [feb1], reason: "x", requestId: "acc_replace_0004" });
  assert.equal(closed.status, 400, JSON.stringify(closed.body));
  assert.equal((await financeRequest(adminToken, "/accounting/lock", { lockedThrough: "", reason: "emulaatori test" })).status, 200);
  const teacherToken = await createUserToken("replace-teacher@example.com");
  await db.collection("users").doc(tokenUid(teacherToken)).set({ role: "teacher", displayName: "Replace Teacher" });
  assert.equal((await financeRequest(teacherToken, "/accounting/entries/replace-account", { fromAccount: "3060", toAccount: "3000", entryIds: [feb1], reason: "x", requestId: "acc_replace_0005" })).status, 403);
});

test("a whole invoice is credited, or credited and reissued with a corrected amount or payer (owner 2026-10-23)", async () => {
  requireSafeEmulatorEnvironment();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const adminToken = await createAdminToken();
  const base = { date: "2026-09-01", due: "2026-09-10", status: "Ootel", billingMode: "manual_charge_v1", studentId: "fix-student", studentName: "Paranduse Õpilane", payerName: "Ema Tamm", payerEmail: "ema@example.com", subject: "Eesti keel", amountCents: 16000, amount: 160, balanceDueCents: 16000, balanceDue: 160, paymentStatus: "unpaid", lines: [{ type: "manual_charge", description: "Septembri tunnid", amountCents: 16000, amount: 160 }] };
  await Promise.all([
    db.collection("invoices").doc("fix-credit").set({ ...base, num: "KS-2026-801" }),
    db.collection("invoices").doc("fix-correct").set({ ...base, num: "KS-2026-802", emailStatus: "sent", emailSentAt: "2026-09-01T09:00:00.000Z" }),
    db.collection("invoices").doc("fix-cancelled").set({ ...base, num: "KS-2026-803", status: "Tühistatud", cancelledAt: "2026-09-05T09:00:00.000Z" }),
    db.collection("invoices").doc("fix-paid").set({ ...base, num: "KS-2026-804" }),
    db.collection("payments").doc("fix-paid-payment").set({ invoiceId: "fix-paid", amountCents: 5000, amount: 50, paidAt: "2026-09-05", method: "bank", status: "active" }),
    db.collection("invoices").doc("fix-tokens").set({ ...base, num: "KS-2026-805", billingMode: "lesson_tokens_v1", tokenStatus: "pending", tokenCredits: 8 }),
    db.collection("invoices").doc("fix-lessons").set({ ...base, num: "KS-2026-806", billingMode: "lesson_invoice_v1", amountCents: 5000, amount: 50, balanceDueCents: 5000, lessonIds: ["fix-lesson-a", "fix-lesson-b"], lines: [{ lessonId: "fix-lesson-a", date: "2026-08-03", description: "Tund", amountCents: 2500, amount: 25 }, { lessonId: "fix-lesson-b", date: "2026-08-10", description: "Tund", amountCents: 2500, amount: 25 }] }),
    db.collection("lessons").doc("fix-lesson-a").set({ studentId: "fix-student", date: "2026-08-03", status: "Toimunud", billingStatus: "invoiced", invoiceId: "fix-lessons" }),
    db.collection("lessons").doc("fix-lesson-b").set({ studentId: "fix-student", date: "2026-08-10", status: "Toimunud", billingStatus: "invoiced", invoiceId: "fix-lessons" }),
  ]);

  // only an administrator
  const teacherToken = await createUserToken("fix-teacher@example.com");
  await db.collection("users").doc(tokenUid(teacherToken)).set({ role: "teacher", email: "fix-teacher@example.com" });
  const forbidden = await financeRequest(teacherToken, "/invoices/credit-full", { invoiceId: "fix-credit", reason: "Vale arve perele", requestId: "fix_credit_teacher_01" });
  assert.equal(forbidden.status, 403, JSON.stringify(forbidden.body));
  const forbiddenFix = await financeRequest(teacherToken, "/invoices/correct", { invoiceId: "fix-correct", amount: 140, reason: "Vale summa arvel", requestId: "fix_correct_teacher_01" });
  assert.equal(forbiddenFix.status, 403, JSON.stringify(forbiddenFix.body));

  // A. the whole invoice: one credit note, the invoice keeps its amount, idempotent
  const shortReason = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-credit", reason: "lühike", requestId: "fix_credit_short_01" });
  assert.equal(shortReason.status, 400, JSON.stringify(shortReason.body));
  const creditPayload = { invoiceId: "fix-credit", reason: "Arve koostati valele perele", requestId: "fix_credit_full_0001" };
  const credited = await financeRequest(adminToken, "/invoices/credit-full", creditPayload);
  assert.equal(credited.status, 201, JSON.stringify(credited.body));
  assert.equal(credited.body.creditNote.amountCents, 16000);
  assert.match(credited.body.creditNote.num, /^KN-\d{4}-\d{3}$/);
  const creditedInvoice = (await db.collection("invoices").doc("fix-credit").get()).data();
  assert.equal(creditedInvoice.amountCents, 16000, "the issued amount is never overwritten");
  assert.equal(creditedInvoice.effectiveAmountCents, 0);
  assert.equal(creditedInvoice.balanceDueCents, 0);
  assert.equal(creditedInvoice.status, "Krediteeritud");
  assert.deepEqual(creditedInvoice.creditNoteIds, ["fix_credit_full_0001"]);
  const creditAudit = (await db.collection("financialAudit").doc("fix_credit_full_0001").get()).data();
  assert.equal(creditAudit.action, "invoice.fully_credited");
  assert.equal(creditAudit.reason, creditPayload.reason);
  assert.equal(creditAudit.actor.email, "zakutailo.pavel@gmail.com");
  const creditRetry = await financeRequest(adminToken, "/invoices/credit-full", creditPayload);
  assert.equal(creditRetry.status, 200, JSON.stringify(creditRetry.body));
  assert.equal(creditRetry.body.idempotent, true);
  const reused = await financeRequest(adminToken, "/invoices/credit-full", { ...creditPayload, reason: "Teine põhjus samale päringule" });
  assert.equal(reused.status, 409, JSON.stringify(reused.body));
  const twice = await financeRequest(adminToken, "/invoices/credit-full", { ...creditPayload, requestId: "fix_credit_full_0002" });
  assert.equal(twice.status, 409, JSON.stringify(twice.body));
  assert.match(twice.body.error, /täielikult krediteeritud/);
  const cancelled = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-cancelled", reason: "Arve koostati valele perele", requestId: "fix_credit_full_0003" });
  assert.equal(cancelled.status, 409, JSON.stringify(cancelled.body));
  assert.match(cancelled.body.error, /Tühistatud/);
  const paid = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-paid", reason: "Arve koostati valele perele", requestId: "fix_credit_full_0004" });
  assert.equal(paid.status, 409, JSON.stringify(paid.body));
  assert.match(paid.body.error, /laekumisi/);
  // a package invoice that has not given lessons yet never will
  const tokens = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-tokens", reason: "Pakett ei olnud vajalik", requestId: "fix_credit_full_0005" });
  assert.equal(tokens.status, 201, JSON.stringify(tokens.body));
  assert.equal((await db.collection("invoices").doc("fix-tokens").get()).data().tokenStatus, "voided");
  const lateTokens = await financeRequest(adminToken, "/invoices/tokens/credit", { invoiceId: "fix-tokens" });
  assert.equal(lateTokens.status, 409, JSON.stringify(lateTokens.body));

  // B. amount and payer: a full credit note + a new invoice with the next number, linked both ways
  const counterBefore = Number((await db.collection("meta").doc("invoiceCounter").get()).data()?.seq || 0);
  const nothing = await financeRequest(adminToken, "/invoices/correct", { invoiceId: "fix-correct", reason: "Midagi ei muutu siin", requestId: "fix_correct_none_01" });
  assert.equal(nothing.status, 400, JSON.stringify(nothing.body));
  const correctPayload = { invoiceId: "fix-correct", amount: 140, payer: { payerName: "Firma OÜ", payerRegCode: "12345678", payerEmail: "arved@firma.ee" }, due: "2031-11-10", reason: "Summa ja maksja olid valed", requestId: "fix_correct_00001" };
  const corrected = await financeRequest(adminToken, "/invoices/correct", correctPayload);
  assert.equal(corrected.status, 201, JSON.stringify(corrected.body));
  const newId = corrected.body.invoice.id;
  assert.equal(newId, "correction_fix_correct_00001");
  assert.equal(corrected.body.creditNote.amountCents, 16000);
  const [oldInvoice, newInvoice, counterAfter] = await Promise.all([
    db.collection("invoices").doc("fix-correct").get().then((snap) => snap.data()),
    db.collection("invoices").doc(newId).get().then((snap) => snap.data()),
    db.collection("meta").doc("invoiceCounter").get().then((snap) => snap.data().seq),
  ]);
  assert.equal(oldInvoice.amountCents, 16000);
  assert.equal(oldInvoice.status, "Krediteeritud");
  assert.equal(oldInvoice.correctionStatus, "corrected");
  assert.equal(oldInvoice.correctedBy.invoiceId, newId);
  assert.equal(oldInvoice.emailStatus, "sent", "the old invoice keeps its delivery history");
  assert.equal(newInvoice.correctionOf.invoiceId, "fix-correct");
  assert.equal(newInvoice.correctionOf.creditNoteId, "fix_correct_00001");
  assert.equal(newInvoice.amountCents, 14000);
  assert.equal(newInvoice.balanceDueCents, 14000);
  assert.equal(newInvoice.payerName, "Firma OÜ");
  assert.equal(newInvoice.payerRegCode, "12345678");
  assert.equal(newInvoice.subject, "Eesti keel");
  assert.equal(newInvoice.due, "2031-11-10");
  assert.equal(newInvoice.emailStatus, "", "the family gets the new invoice as a new document");
  assert.equal(newInvoice.num, `KS-${newInvoice.date.slice(0, 4)}-${String(counterAfter).padStart(3, "0")}`);
  assert.equal(counterAfter, counterBefore + 1);
  assert.equal((await db.collection("financialAudit").doc(newId).get()).data().action, "invoice.created_correction");
  const correctRetry = await financeRequest(adminToken, "/invoices/correct", correctPayload);
  assert.equal(correctRetry.status, 200, JSON.stringify(correctRetry.body));
  assert.equal(correctRetry.body.idempotent, true);
  assert.equal(correctRetry.body.invoice.id, newId);
  assert.equal((await db.collection("meta").doc("invoiceCounter").get()).data().seq, counterAfter);
  const again = await financeRequest(adminToken, "/invoices/correct", { ...correctPayload, requestId: "fix_correct_00002" });
  assert.equal(again.status, 409, JSON.stringify(again.body));

  // lesson lines: the amount comes from the tariff (refused here), the payer can change and the lessons follow
  const lessonAmount = await financeRequest(adminToken, "/invoices/correct", { invoiceId: "fix-lessons", amount: 40, reason: "Vale summa arvel", requestId: "fix_correct_00003" });
  assert.equal(lessonAmount.status, 409, JSON.stringify(lessonAmount.body));
  const lessonPayer = await financeRequest(adminToken, "/invoices/correct", { invoiceId: "fix-lessons", payer: { payerName: "Isa Tamm" }, reason: "Maksja on isa, mitte ema", requestId: "fix_correct_00004" });
  assert.equal(lessonPayer.status, 201, JSON.stringify(lessonPayer.body));
  const movedLesson = (await db.collection("lessons").doc("fix-lesson-a").get()).data();
  assert.equal(movedLesson.invoiceId, "correction_fix_correct_00004");
  assert.equal(movedLesson.billingStatus, "invoiced");
  assert.deepEqual(movedLesson.previousInvoiceIds, ["fix-lessons"]);

  // old debts that „Tühista” cannot close (lead 2026-10-23, shaped like KS-2026-030 / -049 / -050 / -004): no
  // billingMode, euros only, lessons linked by lessonIds (no billingStatus on the lesson), failed e-mail, a closed month
  await Promise.all([
    db.collection("invoices").doc("fix-legacy-ids").set({ num: "KS-2026-830", date: "2026-03-02", due: "2026-03-12", status: "Ootel", studentName: "Jegor", parentName: "Jegori ema", amount: 56, lessonIds: ["fix-old-1", "fix-old-2"], emailStatus: "failed" }),
    db.collection("lessons").doc("fix-old-1").set({ studentName: "Jegor", date: "2026-02-20", status: "Toimunud", invoiceId: "fix-legacy-ids" }),
    db.collection("lessons").doc("fix-old-2").set({ studentName: "Jegor", date: "2026-02-27", status: "Toimunud", invoiceId: "fix-legacy-ids" }),
    db.collection("financialLockedDates").doc("2026-02-20").set({ month: "2026-02" }),
    db.collection("invoices").doc("fix-legacy-partly").set({ num: "KS-2026-804b", date: "2026-01-20", due: "2026-01-30", status: "Ootel", studentName: "Hanna", amount: 60, amountCents: 6000, creditedAmountCents: 2000, effectiveAmountCents: 4000, balanceDueCents: 4000, correctedLessonIds: ["fix-h1"], lessonIds: ["fix-h1", "fix-h2"], lines: [{ lessonId: "fix-h1", date: "2026-01-05", amountCents: 2000 }, { lessonId: "fix-h2", date: "2026-01-12", amountCents: 4000 }] }),
    db.collection("lessons").doc("fix-h1").set({ studentName: "Hanna", date: "2026-01-05", status: "Toimunud", invoiceId: "fix-legacy-partly", billingStatus: "credited" }),
    db.collection("lessons").doc("fix-h2").set({ studentName: "Hanna", date: "2026-01-12", status: "Toimunud", invoiceId: "fix-legacy-partly", billingStatus: "invoiced" }),
  ]);
  const legacyIds = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-legacy-ids", reason: "Vana võlg suletakse omaniku otsusel", requestId: "fix_credit_legacy_01" });
  assert.equal(legacyIds.status, 201, JSON.stringify(legacyIds.body));
  assert.equal(legacyIds.body.creditNote.amountCents, 5600);
  assert.equal(legacyIds.body.creditNote.payerName, "Jegori ema");
  const legacyInvoice = (await db.collection("invoices").doc("fix-legacy-ids").get()).data();
  assert.equal(legacyInvoice.amount, 56, "the old invoice keeps its amount");
  assert.equal(legacyInvoice.balanceDueCents, 0);
  assert.equal(legacyInvoice.status, "Krediteeritud");
  assert.equal((await db.collection("lessons").doc("fix-old-1").get()).data().billingStatus, "credited");
  assert.equal((await db.collection("lessons").doc("fix-old-2").get()).data().creditNoteId, "fix_credit_legacy_01");
  const legacyPartly = await financeRequest(adminToken, "/invoices/credit-full", { invoiceId: "fix-legacy-partly", reason: "Vana võlg suletakse omaniku otsusel", requestId: "fix_credit_legacy_02" });
  assert.equal(legacyPartly.status, 201, JSON.stringify(legacyPartly.body));
  assert.equal(legacyPartly.body.creditNote.amountCents, 4000, "only the part not credited before");
  const partlyInvoice = (await db.collection("invoices").doc("fix-legacy-partly").get()).data();
  assert.equal(partlyInvoice.creditedAmountCents, 6000);
  assert.deepEqual(partlyInvoice.correctedLessonIds, ["fix-h1", "fix-h2"]);
  assert.equal((await db.collection("lessons").doc("fix-h1").get()).data().creditNoteId, undefined, "an earlier credited lesson is left alone");
  assert.equal((await db.collection("lessons").doc("fix-h2").get()).data().billingStatus, "credited");

  // bookkeeping: each document becomes its own automatic entry
  const synced = await financeRequest(adminToken, "/accounting/sync", {});
  assert.equal(synced.status, 200, JSON.stringify(synced.body));
  const creditEntry = (await db.collection("accountingEntries").doc("auto_credit-note_fix_credit_full_0001").get()).data();
  assert.deepEqual(creditEntry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["3000", 16000, 0], ["1200", 0, 16000]]);
  const correctionCreditEntry = (await db.collection("accountingEntries").doc("auto_credit-note_fix_correct_00001").get()).data();
  assert.equal(correctionCreditEntry.totalCents, 16000);
  const newInvoiceEntry = (await db.collection("accountingEntries").doc(`auto_invoice_${newId}`).get()).data();
  assert.deepEqual(newInvoiceEntry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["1200", 14000, 0], ["3000", 0, 14000]]);
  assert.equal(newInvoiceEntry.documentRef, newInvoice.num);
});
