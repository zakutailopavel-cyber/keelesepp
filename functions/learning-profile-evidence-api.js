const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const SUPER_ADMIN_EMAIL = 'zakutailo.pavel@gmail.com';
const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 100;
const MAX_SESSION_LIMIT = 24;
const ROUTES = new Set(['support', 'core', 'advanced']);
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
  if (status >= 500) console.error('Learning profile evidence error:', error);
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

function cleanRouteBySkill(value) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  Object.entries(value).slice(0, 60).forEach(([rawSkillId, rawRoute]) => {
    const skillId = clean(rawSkillId, 120);
    const route = clean(rawRoute, 20);
    if (skillId && ROUTES.has(route)) result[skillId] = route;
  });
  return result;
}

function cleanLimit(value) {
  if (value === '' || value === null || value === undefined) return DEFAULT_LIMIT;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw httpError(400, 'Invalid evidence limit');
  return Math.min(number, MAX_LIMIT);
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
  return { ...student, id: snap.id };
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value.seconds !== undefined) return Number(value.seconds) * 1000;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function serializeValue(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeValue(item)]));
  }
  return value;
}

function projectEvidence(doc) {
  const data = doc.data ? doc.data() : doc;
  return serializeValue({
    id: doc.id || clean(data.id, 160),
    sessionId: clean(data.sessionId, 160),
    studentId: clean(data.studentId, 120),
    teacherUid: clean(data.teacherUid, 160),
    lessonBlueprintId: clean(data.lessonBlueprintId, 160),
    phaseId: clean(data.phaseId, 100),
    activityId: clean(data.activityId, 140),
    skillIds: cleanList(data.skillIds, 20, 120),
    vocabularyIds: cleanList(data.vocabularyIds, 20, 120),
    route: clean(data.route, 20),
    teacherJudgement: clean(data.teacherJudgement, 30),
    taskResult: data.taskResult === undefined ? null : data.taskResult,
    source: clean(data.source, 30),
    kind: clean(data.kind, 40),
    note: clean(data.note, 800),
    createdAt: data.createdAt || data.createdAtIso || null,
  });
}

function projectSession(doc) {
  const data = doc.data ? doc.data() : doc;
  const handoffText = data.handoff && typeof data.handoff === 'object' ? data.handoff.text : '';
  return serializeValue({
    id: doc.id || clean(data.id, 160),
    studentId: clean(data.studentId, 120),
    teacherUid: clean(data.teacherUid, 160),
    teacherName: clean(data.teacherName, 160),
    lessonBlueprintId: clean(data.lessonBlueprintId, 160),
    lessonTitle: clean(data.lessonTitle, 180),
    curriculumGoalIds: cleanList(data.curriculumGoalIds, 20, 160),
    cefrLevel: clean(data.cefrLevel, 20),
    status: clean(data.status, 30),
    currentIndex: Number.isInteger(Number(data.currentIndex)) ? Number(data.currentIndex) : null,
    currentPhaseId: clean(data.currentPhaseId, 100),
    currentActivityId: clean(data.currentActivityId, 140),
    routeBySkill: cleanRouteBySkill(data.routeBySkill),
    teacherNote: clean(data.teacherNote, 3000),
    handoffText: clean(handoffText, 6000),
    startedAt: data.startedAt || null,
    completedAt: data.completedAt || null,
    updatedAt: data.updatedAt || null,
  });
}

function selectLatestEvidence(items, limit = DEFAULT_LIMIT) {
  const bounded = cleanLimit(limit);
  return [...(Array.isArray(items) ? items : [])]
    .sort((left, right) => timestampMillis(right.createdAt || right.createdAtIso) - timestampMillis(left.createdAt || left.createdAtIso))
    .slice(0, bounded);
}

function selectProfileSessions(items, limit = MAX_SESSION_LIMIT) {
  const byId = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return;
    const projected = item.data ? projectSession(item) : projectSession(item);
    if (projected.id) byId.set(projected.id, projected);
  });
  return [...byId.values()]
    .sort((left, right) => timestampMillis(right.updatedAt || right.completedAt || right.startedAt)
      - timestampMillis(left.updatedAt || left.completedAt || left.startedAt))
    .slice(0, Math.max(1, Math.min(MAX_SESSION_LIMIT, Number(limit) || MAX_SESSION_LIMIT)));
}

async function loadProfileEvidence(actor, body) {
  const student = await authorizedStudent(actor, body.studentId);
  const limit = cleanLimit(body.limit);
  const evidenceSnap = await db.collection('learningEvidence').where('studentId', '==', student.id).get();
  const selected = selectLatestEvidence(evidenceSnap.docs.map(projectEvidence), limit);
  const sessionIds = cleanList(selected.map((item) => item.sessionId), MAX_LIMIT, 160);

  const activeSnap = await db.collection('learningSessions').where('studentId', '==', student.id).get();
  const activeDocs = activeSnap.docs.filter((item) => clean(item.data()?.status, 30) === 'active');

  let evidenceSessionDocs = [];
  if (sessionIds.length) {
    const refs = sessionIds.map((id) => db.collection('learningSessions').doc(id));
    evidenceSessionDocs = (await db.getAll(...refs))
      .filter((item) => item.exists && clean(item.data()?.studentId, 120) === student.id);
  }

  const sessions = selectProfileSessions([...activeDocs, ...evidenceSessionDocs]);
  return {
    student: {
      id: student.id,
      name: clean(student.name || student.fullName || 'Õpilane', 160),
      level: clean(student.level || student.cefrLevel, 20),
    },
    evidence: selected,
    sessions,
  };
}

const learningProfileEvidenceApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const actor = await requireStaffUser(req);
    const result = await loadProfileEvidence(actor, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = {
  learningProfileEvidenceApi,
  _test: {
    cleanLimit,
    cleanRouteBySkill,
    teacherNameMatches,
    timestampMillis,
    projectEvidence,
    projectSession,
    selectLatestEvidence,
    selectProfileSessions,
  },
};