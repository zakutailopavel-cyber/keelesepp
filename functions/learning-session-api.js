const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const SUPER_ADMIN_EMAIL = 'zakutailo.pavel@gmail.com';
const REFERENCE_LESSON_ID = 'est-b1-city-problem-solving-01';
const ROUTES = new Set(['support', 'core', 'advanced']);
const JUDGEMENTS = new Set(['needs_help', 'managed', 'too_easy']);
const ALLOWED_ACTIONS = new Set(['start_or_resume', 'progress', 'judge', 'vocabulary', 'complete']);
const ALLOWED_ORIGINS = new Set([
  'https://keelesepp.vercel.app',
  'https://epkoolitus.ee',
  'https://www.epkoolitus.ee',
  'https://crm.epkoolitus.ee',
  'http://localhost:8080',
]);

function applyCors(req, res) {
  const origin = req.get('Origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('X-Content-Type-Options', 'nosniff');
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendError(res, error) {
  const status = error.status || 500;
  if (status >= 500) console.error('Learning session error:', error);
  res.status(status).json({ error: status >= 500 ? 'Internal error' : error.message });
}

function clean(value, max = 240) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanList(values, maxItems = 20, maxLength = 120) {
  return Array.from(new Set((Array.isArray(values) ? values : [])
    .map((value) => clean(value, maxLength))
    .filter(Boolean)))
    .slice(0, maxItems);
}

function cleanRoute(value) {
  const route = clean(value, 20);
  if (!ROUTES.has(route)) throw httpError(400, 'Invalid route');
  return route;
}

function cleanIndex(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 200) throw httpError(400, 'Invalid currentIndex');
  return number;
}

function cleanRequestId(value) {
  const requestId = clean(value, 120);
  if (!/^[A-Za-z0-9_-]{12,120}$/.test(requestId)) throw httpError(400, 'Valid requestId required');
  return requestId;
}

function normalizeScores(input = {}) {
  const output = {};
  for (const skill of ['vocabulary', 'grammar', 'speaking', 'reading', 'listening', 'writing']) {
    if (input[skill] === '' || input[skill] === null || input[skill] === undefined) continue;
    const value = Number(input[skill]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw httpError(400, `Invalid score for ${skill}`);
    output[skill] = Math.round(value);
  }
  return output;
}

function teacherNameMatches(left, right) {
  const a = clean(left, 160).toLowerCase();
  const b = clean(right, 160).toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  const alias = (value, pattern) => pattern.test(value);
  return (alias(a, /^pavel( .*)?$/) && alias(b, /^pavel( .*)?$/))
    || (alias(a, /^(jelena|elena)( .*)?$/) && alias(b, /^(jelena|elena)( .*)?$/))
    || (alias(a, /^(elizaveta|yelyzaveta)( .*)?$/) && alias(b, /^(elizaveta|yelyzaveta)( .*)?$/))
    || (alias(a, /^(angelina|anhelina)( .*)?$/) && alias(b, /^(angelina|anhelina)( .*)?$/));
}

async function requireStaffUser(req) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, 'Firebase ID token required');
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(match[1], true);
  } catch {
    throw httpError(401, 'Invalid Firebase ID token');
  }
  const profileSnap = await db.collection('users').doc(decoded.uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : {};
  if (profile.disabled === true || profile.status === 'disabled') throw httpError(403, 'Account disabled');
  const role = clean(profile.role || decoded.role, 40);
  const email = clean(decoded.email, 200).toLowerCase();
  const isAdmin = role === 'admin' || email === SUPER_ADMIN_EMAIL;
  if (!isAdmin && role !== 'teacher') throw httpError(403, 'Teacher or administrator access required');
  return {
    uid: decoded.uid,
    email,
    role: isAdmin ? 'admin' : 'teacher',
    isAdmin,
    name: clean(profile.displayName || profile.name || decoded.name || decoded.email, 160),
  };
}

async function authorizedStudent(actor, studentId) {
  const id = clean(studentId, 120);
  if (!id) throw httpError(400, 'studentId required');
  const snap = await db.collection('students').doc(id).get();
  if (!snap.exists) throw httpError(404, 'Student not found');
  const student = snap.data() || {};
  if (!actor.isAdmin) {
    const teacherUid = clean(student.teacherUid, 160);
    const assigned = teacherUid === actor.uid
      || (!teacherUid && teacherNameMatches(student.teacher, actor.name));
    if (!assigned) throw httpError(403, 'Student is outside teacher scope');
  }
  return { id: snap.id, ...student };
}

function serializeValue(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeValue(item)]));
  }
  return value;
}

function sessionResponse(doc) {
  return serializeValue({ id: doc.id, ...doc.data() });
}

function canMutateSession(actor, session) {
  return session.teacherUid === actor.uid;
}

function mergeRouteBySkill(current, skillIds, route) {
  const output = { ...(current && typeof current === 'object' ? current : {}) };
  for (const skillId of cleanList(skillIds, 20, 120)) output[skillId] = route;
  return output;
}

function mergeAssessedSkills(current, skillIds) {
  return cleanList([...(Array.isArray(current) ? current : []), ...cleanList(skillIds, 20, 120)], 60, 120);
}

function assertSameEvidenceIdentity(existing, session, sessionId) {
  if (existing.sessionId !== sessionId
    || existing.studentId !== session.studentId
    || existing.teacherUid !== session.teacherUid
    || existing.lessonBlueprintId !== session.lessonBlueprintId) {
    throw httpError(409, 'requestId is already used for different learning evidence');
  }
}

async function startOrResume(actor, body) {
  const student = await authorizedStudent(actor, body.studentId);
  const lessonBlueprintId = clean(body.lessonBlueprintId, 160);
  if (lessonBlueprintId !== REFERENCE_LESSON_ID) throw httpError(400, 'This release slice supports only the reference adaptive lesson');

  const snap = await db.collection('learningSessions').where('teacherUid', '==', actor.uid).get();
  const active = snap.docs
    .filter((doc) => {
      const data = doc.data();
      return data.status === 'active'
        && data.studentId === student.id
        && data.lessonBlueprintId === lessonBlueprintId;
    })
    .sort((left, right) => {
      const l = left.data().updatedAt?.toMillis?.() || left.data().startedAt?.toMillis?.() || 0;
      const r = right.data().updatedAt?.toMillis?.() || right.data().startedAt?.toMillis?.() || 0;
      return r - l;
    })[0];
  if (active) return { session: sessionResponse(active), resumed: true };

  const ref = db.collection('learningSessions').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const currentRoute = cleanRoute(body.currentRoute || 'core');
  const currentIndex = cleanIndex(body.currentIndex || 0);
  const skillIds = cleanList(body.skillIds, 20, 120);
  const data = {
    schemaVersion: 1,
    studentId: student.id,
    studentName: clean(student.name || student.fullName || 'Õpilane', 160),
    teacherUid: actor.uid,
    teacherName: actor.name,
    lessonBlueprintId,
    lessonTitle: clean(body.lessonTitle, 180) || 'Probleemi lahendamine linnas',
    curriculumGoalIds: cleanList(body.curriculumGoalIds, 20, 160),
    cefrLevel: clean(body.cefrLevel, 20),
    status: 'active',
    currentIndex,
    currentPhaseId: clean(body.currentPhaseId, 100) || 'diagnostic',
    currentActivityId: clean(body.currentActivityId, 140),
    currentRoute,
    routeBySkill: mergeRouteBySkill({}, skillIds, currentRoute),
    evidenceCount: 0,
    assessedSkillIds: [],
    teacherNote: '',
    handoff: null,
    startedAt: now,
    updatedAt: now,
  };
  await ref.create(data);
  const created = await ref.get();
  return { session: sessionResponse(created), resumed: false };
}

async function getSession(actor, transaction, sessionId) {
  const id = clean(sessionId, 160);
  if (!id) throw httpError(400, 'sessionId required');
  const ref = db.collection('learningSessions').doc(id);
  const snap = transaction ? await transaction.get(ref) : await ref.get();
  if (!snap.exists) throw httpError(404, 'Learning session not found');
  const session = snap.data();
  if (!canMutateSession(actor, session)) throw httpError(403, 'Learning session belongs to a different teacher');
  return { ref, snap, session };
}

async function saveProgress(actor, body) {
  const { ref, session } = await getSession(actor, null, body.sessionId);
  if (session.status !== 'active') throw httpError(409, 'Learning session is not active');
  const currentRoute = cleanRoute(body.currentRoute || session.currentRoute || 'core');
  const skillIds = cleanList(body.skillIds, 20, 120);
  const update = {
    currentIndex: cleanIndex(body.currentIndex),
    currentPhaseId: clean(body.currentPhaseId, 100),
    currentActivityId: clean(body.currentActivityId, 140),
    currentRoute,
    routeBySkill: mergeRouteBySkill(session.routeBySkill, skillIds, currentRoute),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.update(update);
  const updated = await ref.get();
  return { session: sessionResponse(updated) };
}

async function appendTeacherEvidence(actor, body, kind) {
  const requestId = cleanRequestId(body.requestId);
  const evidenceRef = db.collection('learningEvidence').doc(requestId);
  const result = await db.runTransaction(async (transaction) => {
    const existingEvidence = await transaction.get(evidenceRef);
    const { ref: sessionRef, snap: sessionSnap, session } = await getSession(actor, transaction, body.sessionId);
    if (existingEvidence.exists) {
      assertSameEvidenceIdentity(existingEvidence.data(), session, sessionSnap.id);
      return { sessionId: sessionSnap.id, evidenceId: existingEvidence.id, idempotent: true };
    }
    if (session.status !== 'active') throw httpError(409, 'Learning session is not active');

    const route = cleanRoute(body.route || session.currentRoute || 'core');
    const nextRoute = cleanRoute(body.nextRoute || route);
    const skillIds = cleanList(body.skillIds, 20, 120);
    const vocabularyIds = kind === 'vocabulary_mark' ? cleanList([body.wordId], 1, 120) : [];
    let teacherJudgement = clean(body.teacherJudgement, 30);
    if (kind === 'vocabulary_mark') {
      const mark = clean(body.mark, 20);
      teacherJudgement = mark === 'weak' ? 'needs_help' : mark === 'known' ? 'managed' : '';
    }
    if (!JUDGEMENTS.has(teacherJudgement)) throw httpError(400, 'Invalid teacherJudgement');

    const eventSkillIds = kind === 'vocabulary_mark'
      ? cleanList(['vocabulary', ...skillIds], 20, 120)
      : skillIds;
    const now = admin.firestore.FieldValue.serverTimestamp();
    const evidence = {
      schemaVersion: 1,
      sessionId: sessionSnap.id,
      studentId: session.studentId,
      teacherUid: session.teacherUid,
      lessonBlueprintId: session.lessonBlueprintId,
      phaseId: clean(body.phaseId, 100),
      activityId: clean(body.activityId, 140),
      skillIds: eventSkillIds,
      vocabularyIds,
      route,
      teacherJudgement,
      source: 'teacher',
      kind,
      note: clean(body.note, 800),
      createdAt: now,
      createdAtIso: new Date().toISOString(),
    };
    transaction.create(evidenceRef, evidence);
    const update = {
      currentIndex: cleanIndex(body.currentIndex),
      currentPhaseId: clean(body.phaseId, 100),
      currentActivityId: clean(body.activityId, 140),
      currentRoute: nextRoute,
      routeBySkill: mergeRouteBySkill(session.routeBySkill, eventSkillIds, nextRoute),
      evidenceCount: (Number(session.evidenceCount) || 0) + 1,
      assessedSkillIds: mergeAssessedSkills(session.assessedSkillIds, eventSkillIds),
      lastEvidenceAt: now,
      updatedAt: now,
    };
    transaction.update(sessionRef, update);
    return { sessionId: sessionSnap.id, evidenceId: evidenceRef.id, idempotent: false };
  });
  const updated = await db.collection('learningSessions').doc(result.sessionId).get();
  return { session: sessionResponse(updated), evidenceId: result.evidenceId, idempotent: result.idempotent };
}

async function completeSession(actor, body) {
  const requestId = cleanRequestId(body.requestId);
  const scores = normalizeScores(body.scores || {});
  const result = await db.runTransaction(async (transaction) => {
    const { ref: sessionRef, snap: sessionSnap, session } = await getSession(actor, transaction, body.sessionId);
    if (session.status === 'completed') return { sessionId: sessionSnap.id, idempotent: true };
    if (session.status !== 'active') throw httpError(409, 'Only an active learning session can be completed');

    const route = cleanRoute(body.route || session.currentRoute || 'core');
    const scoreEntries = Object.entries(scores).map(([skillId, taskResult]) => ({
      skillId,
      taskResult,
      ref: db.collection('learningEvidence').doc(`${requestId}_${skillId}`),
    }));
    const existingEvidence = [];
    for (const entry of scoreEntries) existingEvidence.push(await transaction.get(entry.ref));
    existingEvidence.forEach((snap, index) => {
      if (snap.exists) assertSameEvidenceIdentity(snap.data(), session, sessionSnap.id);
    });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const addedSkills = [];
    let addedEvidence = 0;
    scoreEntries.forEach((entry, index) => {
      if (existingEvidence[index].exists) return;
      transaction.create(entry.ref, {
        schemaVersion: 1,
        sessionId: sessionSnap.id,
        studentId: session.studentId,
        teacherUid: session.teacherUid,
        lessonBlueprintId: session.lessonBlueprintId,
        phaseId: 'stage-4-exit',
        activityId: `summary-${entry.skillId}`,
        skillIds: [entry.skillId],
        vocabularyIds: [],
        route,
        taskResult: entry.taskResult,
        source: 'teacher',
        kind: 'summary_score',
        note: '',
        createdAt: now,
        createdAtIso: new Date().toISOString(),
      });
      addedSkills.push(entry.skillId);
      addedEvidence += 1;
    });

    const handoff = {
      schemaVersion: 1,
      text: clean(body.handoffText, 6000),
      generatedAtIso: new Date().toISOString(),
    };
    transaction.update(sessionRef, {
      status: 'completed',
      currentPhaseId: 'summary',
      currentActivityId: 'summary',
      currentRoute: route,
      evidenceCount: (Number(session.evidenceCount) || 0) + addedEvidence,
      assessedSkillIds: mergeAssessedSkills(session.assessedSkillIds, addedSkills),
      teacherNote: clean(body.teacherNote, 3000),
      handoff,
      completedAt: now,
      updatedAt: now,
    });
    return { sessionId: sessionSnap.id, idempotent: false };
  });
  const updated = await db.collection('learningSessions').doc(result.sessionId).get();
  return { session: sessionResponse(updated), idempotent: result.idempotent };
}

async function handleAction(actor, body) {
  const action = clean(body.action, 40);
  if (!ALLOWED_ACTIONS.has(action)) throw httpError(400, 'Unsupported learning session action');
  if (action === 'start_or_resume') return startOrResume(actor, body);
  if (action === 'progress') return saveProgress(actor, body);
  if (action === 'judge') return appendTeacherEvidence(actor, body, 'teacher_judgement');
  if (action === 'vocabulary') return appendTeacherEvidence(actor, body, 'vocabulary_mark');
  return completeSession(actor, body);
}

const learningSessionApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const actor = await requireStaffUser(req);
    const result = await handleAction(actor, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = {
  learningSessionApi,
  _test: {
    cleanList,
    cleanRoute,
    cleanIndex,
    cleanRequestId,
    normalizeScores,
    teacherNameMatches,
    mergeRouteBySkill,
    mergeAssessedSkills,
    assertSameEvidenceIdentity,
  },
};