"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) {
    throw new Error(`Refusing invitation integration test for non-demo project: ${activeProject || "missing"}`);
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

function documentName(path) {
  return `projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
}

function invitationCreateWrite(id, {
  teacherUid,
  teacherName = "Invite Teacher",
  studentId,
  studentUid,
  studentName = "Invite Student",
  expiresAt = new Date(Date.now() + 120000).toISOString(),
}) {
  return {
    update: {
      name: documentName(`liveLessonInvitations/${id}`),
      fields: {
        teacherUid: { stringValue: teacherUid },
        teacherName: { stringValue: teacherName },
        studentId: { stringValue: studentId },
        studentUid: { stringValue: studentUid },
        studentName: { stringValue: studentName },
        title: { stringValue: "Secure invitation" },
        status: { stringValue: "pending" },
        roomKey: { stringValue: id },
        createdAtIso: { stringValue: new Date().toISOString() },
        expiresAt: { timestampValue: expiresAt },
        respondedAt: { nullValue: null },
        cancelledAt: { nullValue: null },
        closedAt: { nullValue: null },
      },
    },
    currentDocument: { exists: false },
    updateTransforms: [
      { fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" },
    ],
  };
}

function statusUpdateWrite(id, status, timestampField) {
  return {
    update: {
      name: documentName(`liveLessonInvitations/${id}`),
      fields: {
        status: { stringValue: status },
      },
    },
    updateMask: { fieldPaths: ["status"] },
    updateTransforms: [
      { fieldPath: timestampField, setToServerValue: "REQUEST_TIME" },
    ],
  };
}

async function seedUsersAndStudents(suffix) {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const teacherToken = await createUserToken(`invite-teacher-${suffix}@example.com`);
  const otherTeacherToken = await createUserToken(`invite-other-teacher-${suffix}@example.com`);
  const studentToken = await createUserToken(`invite-student-${suffix}@example.com`);
  const outsideStudentToken = await createUserToken(`invite-outside-student-${suffix}@example.com`);
  const parentToken = await createUserToken(`invite-parent-${suffix}@example.com`);
  const teacherUid = tokenUid(teacherToken);
  const otherTeacherUid = tokenUid(otherTeacherToken);
  const studentUid = tokenUid(studentToken);
  const outsideStudentUid = tokenUid(outsideStudentToken);
  const parentUid = tokenUid(parentToken);

  await Promise.all([
    db.collection("users").doc(teacherUid).set({ role: "teacher", displayName: "Invite Teacher" }),
    db.collection("users").doc(otherTeacherUid).set({ role: "teacher", displayName: "Other Invite Teacher" }),
    db.collection("users").doc(studentUid).set({ role: "student", displayName: "Invite Student" }),
    db.collection("users").doc(outsideStudentUid).set({ role: "student", displayName: "Outside Student" }),
    db.collection("users").doc(parentUid).set({ role: "parent", displayName: "Invite Parent" }),
    db.collection("students").doc(`invite-own-${suffix}`).set({
      name: "Invite Student",
      teacher: "Invite Teacher",
      teacherUid,
      teacherUids: [teacherUid],
      linkedUserId: studentUid,
      studentUid,
      linkedParentId: parentUid,
      active: true,
    }),
    db.collection("students").doc(`invite-outside-${suffix}`).set({
      name: "Outside Student",
      teacher: "Other Invite Teacher",
      teacherUid: otherTeacherUid,
      teacherUids: [otherTeacherUid],
      linkedUserId: outsideStudentUid,
      studentUid: outsideStudentUid,
      active: true,
    }),
  ]);

  return {
    db,
    teacherToken,
    studentToken,
    parentToken,
    teacherUid,
    studentUid,
    outsideStudentUid,
    parentUid,
    ownStudentId: `invite-own-${suffix}`,
    outsideStudentId: `invite-outside-${suffix}`,
  };
}

test("invitation create rejects a parent UID and a student outside teacher scope", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("create");

  const valid = await firestoreCommitRequest(ctx.teacherToken, [
    invitationCreateWrite("invite-valid-own", {
      teacherUid: ctx.teacherUid,
      studentId: ctx.ownStudentId,
      studentUid: ctx.studentUid,
    }),
  ]);
  assert.equal(valid.status, 200, JSON.stringify(valid.body));

  const forgedParent = await firestoreCommitRequest(ctx.teacherToken, [
    invitationCreateWrite("invite-parent-forged", {
      teacherUid: ctx.teacherUid,
      studentId: ctx.ownStudentId,
      studentUid: ctx.parentUid,
    }),
  ]);
  assert.equal(forgedParent.status, 403, JSON.stringify(forgedParent.body));

  const outsideScope = await firestoreCommitRequest(ctx.teacherToken, [
    invitationCreateWrite("invite-outside-scope", {
      teacherUid: ctx.teacherUid,
      studentId: ctx.outsideStudentId,
      studentUid: ctx.outsideStudentUid,
      studentName: "Outside Student",
    }),
  ]);
  assert.equal(outsideScope.status, 403, JSON.stringify(outsideScope.body));
});

test("only the linked student can accept a live lesson invitation", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("accept");
  const future = admin.firestore.Timestamp.fromMillis(Date.now() + 120000);
  const created = admin.firestore.Timestamp.now();

  await Promise.all([
    ctx.db.collection("liveLessonInvitations").doc("invite-student-accept").set({
      teacherUid: ctx.teacherUid,
      teacherName: "Invite Teacher",
      studentId: ctx.ownStudentId,
      studentUid: ctx.studentUid,
      studentName: "Invite Student",
      title: "Secure invitation",
      status: "pending",
      roomKey: "invite-student-accept",
      createdAt: created,
      createdAtIso: created.toDate().toISOString(),
      expiresAt: future,
      respondedAt: null,
      cancelledAt: null,
      closedAt: null,
    }),
    ctx.db.collection("liveLessonInvitations").doc("invite-parent-accept").set({
      teacherUid: ctx.teacherUid,
      teacherName: "Invite Teacher",
      studentId: ctx.ownStudentId,
      studentUid: ctx.studentUid,
      studentName: "Invite Student",
      title: "Secure invitation",
      status: "pending",
      roomKey: "invite-parent-accept",
      createdAt: created,
      createdAtIso: created.toDate().toISOString(),
      expiresAt: future,
      respondedAt: null,
      cancelledAt: null,
      closedAt: null,
    }),
  ]);

  const studentAccept = await firestoreCommitRequest(ctx.studentToken, [
    statusUpdateWrite("invite-student-accept", "accepted", "respondedAt"),
  ]);
  assert.equal(studentAccept.status, 200, JSON.stringify(studentAccept.body));

  const parentAccept = await firestoreCommitRequest(ctx.parentToken, [
    statusUpdateWrite("invite-parent-accept", "accepted", "respondedAt"),
  ]);
  assert.equal(parentAccept.status, 403, JSON.stringify(parentAccept.body));
});

test("an expired invitation cannot be accepted", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("expired");
  const created = admin.firestore.Timestamp.fromMillis(Date.now() - 180000);
  const expired = admin.firestore.Timestamp.fromMillis(Date.now() - 60000);

  await ctx.db.collection("liveLessonInvitations").doc("invite-expired").set({
    teacherUid: ctx.teacherUid,
    teacherName: "Invite Teacher",
    studentId: ctx.ownStudentId,
    studentUid: ctx.studentUid,
    studentName: "Invite Student",
    title: "Expired invitation",
    status: "pending",
    roomKey: "invite-expired",
    createdAt: created,
    createdAtIso: created.toDate().toISOString(),
    expiresAt: expired,
    respondedAt: null,
    cancelledAt: null,
    closedAt: null,
  });

  const response = await firestoreCommitRequest(ctx.studentToken, [
    statusUpdateWrite("invite-expired", "accepted", "respondedAt"),
  ]);
  assert.equal(response.status, 403, JSON.stringify(response.body));
});

test("the inviting teacher can close an accepted waiting room", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("close");
  const created = admin.firestore.Timestamp.fromMillis(Date.now() - 60000);
  const respondedAt = admin.firestore.Timestamp.fromMillis(Date.now() - 30000);

  await ctx.db.collection("liveLessonInvitations").doc("invite-close").set({
    teacherUid: ctx.teacherUid,
    teacherName: "Invite Teacher",
    studentId: ctx.ownStudentId,
    studentUid: ctx.studentUid,
    studentName: "Invite Student",
    title: "Accepted invitation",
    status: "accepted",
    roomKey: "invite-close",
    createdAt: created,
    createdAtIso: created.toDate().toISOString(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 10000),
    respondedAt,
    cancelledAt: null,
    closedAt: null,
  });

  const close = await firestoreCommitRequest(ctx.teacherToken, [
    statusUpdateWrite("invite-close", "closed", "closedAt"),
  ]);
  assert.equal(close.status, 200, JSON.stringify(close.body));
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

function signalCreateWrite(invitationId, signalId, { type, sessionId, senderUid, senderRole, payload = {} }) {
  return {
    update: {
      name: documentName(`liveLessonInvitations/${invitationId}/signals/${signalId}`),
      fields: {
        type: { stringValue: type },
        sessionId: { stringValue: sessionId },
        senderUid: { stringValue: senderUid },
        senderRole: { stringValue: senderRole },
        payload: { stringValue: JSON.stringify(payload) },
        createdAtIso: { stringValue: new Date().toISOString() },
      },
    },
    currentDocument: { exists: false },
    updateTransforms: [
      { fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" },
    ],
  };
}

test("live lesson call signaling is restricted to the accepted teacher and student", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("signals");
  const created = admin.firestore.Timestamp.fromMillis(Date.now() - 30000);
  const respondedAt = admin.firestore.Timestamp.fromMillis(Date.now() - 20000);
  const invitationId = "invite-signals";

  await ctx.db.collection("liveLessonInvitations").doc(invitationId).set({
    teacherUid: ctx.teacherUid,
    teacherName: "Invite Teacher",
    studentId: ctx.ownStudentId,
    studentUid: ctx.studentUid,
    studentName: "Invite Student",
    title: "Accepted invitation",
    status: "accepted",
    roomKey: invitationId,
    createdAt: created,
    createdAtIso: created.toDate().toISOString(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 10000),
    respondedAt,
    cancelledAt: null,
    closedAt: null,
  });

  const teacherOffer = await firestoreCommitRequest(ctx.teacherToken, [
    signalCreateWrite(invitationId, "offer-1", {
      type: "offer",
      sessionId: "session-1",
      senderUid: ctx.teacherUid,
      senderRole: "teacher",
      payload: { type: "offer", sdp: "teacher-sdp" },
    }),
  ]);
  assert.equal(teacherOffer.status, 200, JSON.stringify(teacherOffer.body));

  const studentAnswer = await firestoreCommitRequest(ctx.studentToken, [
    signalCreateWrite(invitationId, "answer-1", {
      type: "answer",
      sessionId: "session-1",
      senderUid: ctx.studentUid,
      senderRole: "student",
      payload: { type: "answer", sdp: "student-sdp" },
    }),
  ]);
  assert.equal(studentAnswer.status, 200, JSON.stringify(studentAnswer.body));

  const parentCandidate = await firestoreCommitRequest(ctx.parentToken, [
    signalCreateWrite(invitationId, "parent-forged", {
      type: "candidate",
      sessionId: "session-1",
      senderUid: ctx.parentUid,
      senderRole: "student",
      payload: { candidate: "forged" },
    }),
  ]);
  assert.equal(parentCandidate.status, 403, JSON.stringify(parentCandidate.body));

  const studentRead = await firestoreDocumentRequest(
    ctx.studentToken,
    "GET",
    `liveLessonInvitations/${invitationId}/signals/offer-1`,
  );
  assert.equal(studentRead.status, 200, JSON.stringify(studentRead.body));

  const parentRead = await firestoreDocumentRequest(
    ctx.parentToken,
    "GET",
    `liveLessonInvitations/${invitationId}/signals/offer-1`,
  );
  assert.equal(parentRead.status, 403, JSON.stringify(parentRead.body));
});



function presenceWrite(invitationId, uid, role, online = true) {
  return {
    update: {
      name: documentName(`liveLessonInvitations/${invitationId}/presence/${uid}`),
      fields: {
        uid: { stringValue: uid },
        role: { stringValue: role },
        displayName: { stringValue: role === "teacher" ? "Invite Teacher" : "Invite Student" },
        online: { booleanValue: online },
        lastSeenIso: { stringValue: new Date().toISOString() },
      },
    },
    updateTransforms: [
      { fieldPath: "lastSeen", setToServerValue: "REQUEST_TIME" },
    ],
  };
}

test("live lesson presence is restricted to each accepted participant", async () => {
  requireSafeEmulatorEnvironment();
  const ctx = await seedUsersAndStudents("presence");
  const invitationId = "invite-presence";
  const created = admin.firestore.Timestamp.fromMillis(Date.now() - 30000);
  const respondedAt = admin.firestore.Timestamp.fromMillis(Date.now() - 20000);

  await ctx.db.collection("liveLessonInvitations").doc(invitationId).set({
    teacherUid: ctx.teacherUid,
    teacherName: "Invite Teacher",
    studentId: ctx.ownStudentId,
    studentUid: ctx.studentUid,
    studentName: "Invite Student",
    title: "Accepted invitation",
    status: "accepted",
    roomKey: invitationId,
    createdAt: created,
    createdAtIso: created.toDate().toISOString(),
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 10000),
    respondedAt,
    cancelledAt: null,
    closedAt: null,
  });

  const teacherPresence = await firestoreCommitRequest(ctx.teacherToken, [
    presenceWrite(invitationId, ctx.teacherUid, "teacher"),
  ]);
  assert.equal(teacherPresence.status, 200, JSON.stringify(teacherPresence.body));

  const studentPresence = await firestoreCommitRequest(ctx.studentToken, [
    presenceWrite(invitationId, ctx.studentUid, "student"),
  ]);
  assert.equal(studentPresence.status, 200, JSON.stringify(studentPresence.body));

  const parentPresence = await firestoreCommitRequest(ctx.parentToken, [
    presenceWrite(invitationId, ctx.parentUid, "student"),
  ]);
  assert.equal(parentPresence.status, 403, JSON.stringify(parentPresence.body));

  const studentReadsTeacher = await firestoreDocumentRequest(
    ctx.studentToken,
    "GET",
    `liveLessonInvitations/${invitationId}/presence/${ctx.teacherUid}`,
  );
  assert.equal(studentReadsTeacher.status, 200, JSON.stringify(studentReadsTeacher.body));

  const parentReadsTeacher = await firestoreDocumentRequest(
    ctx.parentToken,
    "GET",
    `liveLessonInvitations/${invitationId}/presence/${ctx.teacherUid}`,
  );
  assert.equal(parentReadsTeacher.status, 403, JSON.stringify(parentReadsTeacher.body));
});
