import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import {
  INVITATION_STATUS,
  noteServerTime,
  normalizeInvitation,
  studentAccountUid,
  timestampMillis,
} from '../../features/live-classroom/invitationModel.js';

const INVITATION_TTL_MS = 2 * 60 * 1000;
const clean = (value) => String(value ?? '').trim();

// Create and status changes go through the server (functions liveInvitationApi, 2026-11-28: the same checks used to
// sit in firestore.rules and took ~7 kB of its 256 kB limit). While the old rules are still live the browser falls
// back to the direct write when the function cannot be reached — a lesson must start even then.
const defaultInvitationUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/liveInvitationApi';
const invitationBaseUrl = () => String(import.meta.env.VITE_LIVE_INVITATION_API_URL || defaultInvitationUrl).replace(/\/$/, '');
const SERVER_TIMEOUT_MS = 8000;

// → the server's answer; null when the function is unreachable (network, timeout, 5xx, not deployed) → fall back;
// throws the server's own refusal (4xx with its Estonian message)
async function viaServer(path, body) {
  let response;
  try {
    const { auth } = requireFirebaseClient();
    if (!auth?.currentUser || !globalThis.fetch) return null;
    const token = await auth.currentUser.getIdToken();
    const controller = typeof globalThis.AbortController === 'function' ? new globalThis.AbortController() : null;
    const timer = controller ? globalThis.setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS) : null;
    try {
      response = await globalThis.fetch(`${invitationBaseUrl()}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...(controller ? { signal: controller.signal } : {}),
      });
    } finally {
      if (timer) globalThis.clearTimeout(timer);
    }
  } catch {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (response.ok && data) return data;
  const refusal = response.status >= 400 && response.status < 500 && data?.error && data.error !== 'Not found';
  if (refusal) throw new Error(data.error);
  return null;
}

function records(snapshot) {
  return snapshot.docs.map((item) => normalizeInvitation(item.id, item.data()));
}

function subscribe(field, uid, onChange, onError) {
  if (!uid) { onChange([]); return () => {}; }
  const { db } = requireFirebaseClient();
  let first = true;
  return onSnapshot(
    query(collection(db, 'liveLessonInvitations'), where(field, '==', uid)),
    (snapshot) => {
      // an invitation added after the first snapshot was just written: its server createdAt tells the server time
      if (!first && !snapshot.metadata.fromCache) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) noteServerTime(timestampMillis(change.doc.data().createdAt));
        });
      }
      first = false;
      onChange(records(snapshot));
    },
    onError,
  );
}

export const liveLessonInvitationsService = {
  subscribeIncoming(studentUid, onChange, onError) {
    return subscribe('studentUid', studentUid, onChange, onError);
  },

  subscribeOutgoing(teacherUid, onChange, onError) {
    return subscribe('teacherUid', teacherUid, onChange, onError);
  },

  // `roomKey`: a group room id when the student is invited into a group lesson (rules check the room's members)
  // `lesson`: { scheduleId, occurrenceDate } of the calendar lesson („Alusta tundi”) — the server marks it held when
  // the room closes with „märgi toimunuks” (functions/live-auto-mark.js)
  async create({ student, title, roomKey = '', lesson = null }, user) {
    if (!user?.uid || !user.roles?.some((role) => role === 'admin' || role === 'teacher')) throw new Error('Tunni saab alustada ainult õpetaja.');
    if (!student?.id || student.active === false) throw new Error('Vali aktiivne õpilane.');
    const studentUid = studentAccountUid(student);
    if (!studentUid) throw new Error('Õpilase kaart ei ole sisselogimiskontoga seotud. Seo konto enne tunni alustamist.');
    const lessonTitle = clean(title || student.subject || 'Õppetund').slice(0, 160);
    if (!lessonTitle) throw new Error('Tunni pealkiri on kohustuslik.');
    const { db } = requireFirebaseClient();
    const reference = doc(collection(db, 'liveLessonInvitations'));
    const createdAtIso = new Date().toISOString();
    const payload = {
      teacherUid: user.uid,
      teacherName: clean(user.displayName || user.email || 'Õpetaja').slice(0, 160),
      studentId: student.id,
      studentUid,
      studentName: clean(student.name || 'Õpilane').slice(0, 160),
      title: lessonTitle,
      status: INVITATION_STATUS.PENDING,
      roomKey: roomKey || reference.id,
      createdAt: serverTimestamp(),
      createdAtIso,
      expiresAt: Timestamp.fromMillis(Date.now() + INVITATION_TTL_MS),
      respondedAt: null,
      cancelledAt: null,
      closedAt: null,
      ...(lesson?.scheduleId && /^\d{4}-\d{2}-\d{2}$/.test(lesson.occurrenceDate || '') ? { scheduleId: String(lesson.scheduleId).slice(0, 200), occurrenceDate: lesson.occurrenceDate } : {}),
    };
    const served = await viaServer('/create', {
      id: reference.id, studentId: payload.studentId, studentUid, studentName: payload.studentName, teacherName: payload.teacherName,
      title: lessonTitle, roomKey: roomKey || '', ...(payload.scheduleId ? { scheduleId: payload.scheduleId, occurrenceDate: payload.occurrenceDate } : {}),
    });
    if (served?.id) return normalizeInvitation(served.id, served.invitation || {});
    const batch = writeBatch(db);
    batch.set(reference, payload);
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'live_lesson.invited',
      label: `Tunnikutsung saadetud: ${payload.studentName}`,
      studentId: payload.studentId,
      studentName: payload.studentName,
      byUid: user.uid,
      byName: payload.teacherName,
      byRole: user.roles?.[0] || 'teacher',
      createdAt: createdAtIso,
      date: createdAtIso.slice(0, 10),
      meta: { invitationId: reference.id, roomKey: roomKey || reference.id },
    });
    try {
      await batch.commit();
    } catch (error) {
      // the server did write it but its answer was lost: the same document is already there
      const existing = await getDoc(reference).catch(() => null);
      if (existing?.exists?.()) return normalizeInvitation(existing.id, existing.data());
      throw error;
    }
    return normalizeInvitation(reference.id, { ...payload, createdAt: createdAtIso });
  },

  // A test student (student card testStudent: true) has nobody to press „Liitu tunniga”: the teacher's room accepts the
  // invitation for them, so the teacher can try the lesson room, recording and transcript with their own voice.
  async acceptForTestStudent(invitationId) {
    if (await viaServer('/accept-test', { invitationId })) return;
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'liveLessonInvitations', invitationId), { status: INVITATION_STATUS.ACCEPTED, respondedAt: serverTimestamp() });
  },

  async respond(invitationId, decision, user) {
    if (!user?.uid) throw new Error('Logi uuesti sisse.');
    if (![INVITATION_STATUS.ACCEPTED, INVITATION_STATUS.DECLINED].includes(decision)) throw new Error('Tundmatu vastus tunnikutsele.');
    if (await viaServer('/respond', { invitationId, decision })) return;
    const { db } = requireFirebaseClient();
    const reference = doc(db, 'liveLessonInvitations', invitationId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Tunnikutsungit ei leitud.');
      const invitation = normalizeInvitation(snapshot.id, snapshot.data());
      if (invitation.studentUid !== user.uid) throw new Error('See tunnikutsung ei kuulu sinu kontole.');
      if (invitation.status === decision) return; // the server already did it, only its answer was lost
      if (invitation.expired) throw new Error('Tunnikutsung on aegunud. Palu õpetajal saata uus kutse.');
      if (invitation.status !== INVITATION_STATUS.PENDING) throw new Error('Tunnikutsele on juba vastatud.');
      transaction.update(reference, { status: decision, respondedAt: serverTimestamp() });
    });
  },

  async cancel(invitationId, user) {
    if (!user?.uid) throw new Error('Logi uuesti sisse.');
    if (await viaServer('/cancel', { invitationId })) return;
    const { db } = requireFirebaseClient();
    const reference = doc(db, 'liveLessonInvitations', invitationId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Tunnikutsungit ei leitud.');
      const invitation = normalizeInvitation(snapshot.id, snapshot.data());
      if (invitation.teacherUid !== user.uid && !user.roles?.includes('admin')) throw new Error('Ainult kutse saatnud õpetaja saab selle tühistada.');
      if (invitation.status === INVITATION_STATUS.CANCELLED) return;
      if (invitation.status !== INVITATION_STATUS.PENDING) throw new Error('Ainult ootel kutset saab tühistada.');
      transaction.update(reference, { status: INVITATION_STATUS.CANCELLED, cancelledAt: serverTimestamp() });
    });
  },

  // `endMark`: 'held' (the server marks the linked calendar lesson held) or 'skip'; left out → the server does nothing
  async close(invitationId, user, { endMark = '' } = {}) {
    if (!user?.uid) throw new Error('Logi uuesti sisse.');
    if (await viaServer('/close', { invitationId, ...(['held', 'skip'].includes(endMark) ? { endMark } : {}) })) return;
    const { db } = requireFirebaseClient();
    const reference = doc(db, 'liveLessonInvitations', invitationId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) throw new Error('Tunnikutsungit ei leitud.');
      const invitation = normalizeInvitation(snapshot.id, snapshot.data());
      if (invitation.teacherUid !== user.uid && !user.roles?.includes('admin')) throw new Error('Ainult kutse saatnud õpetaja saab ooteruumi lõpetada.');
      if (invitation.status === INVITATION_STATUS.CLOSED) return;
      if (invitation.status !== INVITATION_STATUS.ACCEPTED) throw new Error('Ainult vastu võetud ooteruumi saab lõpetada.');
      transaction.update(reference, { status: INVITATION_STATUS.CLOSED, closedAt: serverTimestamp(), ...(['held', 'skip'].includes(endMark) ? { endMark } : {}) });
    });
  },
};
