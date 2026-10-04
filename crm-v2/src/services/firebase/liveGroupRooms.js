import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { studentAccountUid } from '../../features/live-classroom/invitationModel.js';
import { liveLessonInvitationsService } from './liveLessonInvitations.js';

// Group lessons (owner, 2026-10-04): one room `liveGroupRooms/{roomId}` for a teacher and up to 4 students. Every
// student gets a normal invitation whose roomKey is the room id (so the usual invitation window and accept flow
// work); the call is a WebRTC mesh with signals addressed from one participant to another; the group board lives in
// `groupBoards/{roomId}`.
export const MAX_GROUP_STUDENTS = 4;
const clean = (value) => String(value ?? '').trim();

export const liveGroupRoomsService = {
  async create({ students, title }, user) {
    const chosen = (students || []).filter(Boolean);
    if (chosen.length < 1) throw new Error('Vali grupitunniks vähemalt üks õpilane.');
    if (chosen.length > MAX_GROUP_STUDENTS) throw new Error(`Grupitunnis saab olla kuni ${MAX_GROUP_STUDENTS} õpilast.`);
    const members = chosen.map((student) => {
      const studentUid = studentAccountUid(student);
      if (!studentUid) throw new Error(`${student.name || 'Õpilane'}: kaart ei ole kontoga seotud.`);
      return { studentId: student.id, studentUid, studentName: clean(student.name || 'Õpilane').slice(0, 160) };
    });
    const lessonTitle = clean(title || 'Grupitund').slice(0, 160) || 'Grupitund';
    const { db } = requireFirebaseClient();
    const reference = await addDoc(collection(db, 'liveGroupRooms'), {
      teacherUid: user.uid,
      teacherName: clean(user.displayName || user.email || 'Õpetaja').slice(0, 160),
      title: lessonTitle,
      memberUids: members.map((member) => member.studentUid),
      members,
      status: 'open',
      createdAt: serverTimestamp(),
      closedAt: null,
    });
    const invitations = [];
    for (const student of chosen) {
      invitations.push(await liveLessonInvitationsService.create({ student, title: lessonTitle, roomKey: reference.id }, user));
    }
    return { id: reference.id, invitations };
  },

  subscribe(roomId, onChange, onError) {
    if (!roomId) { onChange(null); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, 'liveGroupRooms', roomId), (snapshot) => onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null), onError);
  },

  // the teacher's open group rooms (to go back into one)
  subscribeTeacherOpen(uid, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'liveGroupRooms'), where('teacherUid', '==', uid), where('status', '==', 'open')),
      (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
  },

  async close(roomId) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'liveGroupRooms', roomId), { status: 'closed', closedAt: serverTimestamp() });
  },

  // signals addressed to me (mesh: one RTCPeerConnection per pair)
  subscribeSignals(roomId, uid, onSignal, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'liveGroupRooms', roomId, 'signals'), where('toUid', '==', uid)), (snapshot) => {
      snapshot.docChanges().forEach((change) => { if (change.type === 'added') onSignal({ id: change.doc.id, ...change.doc.data() }); });
    }, onError);
  },

  async sendSignal(roomId, { type, sessionId, fromUid, toUid, payload }) {
    const body = JSON.stringify(payload ?? {});
    if (body.length > 64000) throw new Error('Videokõne signaal on liiga suur.');
    const { db } = requireFirebaseClient();
    await addDoc(collection(db, 'liveGroupRooms', roomId, 'signals'), {
      type, sessionId, fromUid, toUid, payload: body, createdAt: serverTimestamp(), createdAtIso: new Date().toISOString(),
    });
  },

  // the group lesson chat
  subscribeMessages(roomId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, 'liveGroupRooms', roomId, 'messages'), (snapshot) => onChange(snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => String(a.createdAtIso || '').localeCompare(String(b.createdAtIso || '')))), onError);
  },

  async sendMessage(roomId, { text, user, name }) {
    const value = clean(text).slice(0, 2000);
    if (!value) return null;
    const { db } = requireFirebaseClient();
    return addDoc(collection(db, 'liveGroupRooms', roomId, 'messages'), {
      fromUid: user.uid, fromName: clean(name || user.displayName || 'Osaleja').slice(0, 160), text: value,
      createdAt: serverTimestamp(), createdAtIso: new Date().toISOString(),
    });
  },

  async heartbeat(roomId, { uid, role, displayName, online = true }) {
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'liveGroupRooms', roomId, 'presence', uid), {
      uid, role, displayName: clean(displayName).slice(0, 160), online: Boolean(online), lastSeen: serverTimestamp(), lastSeenIso: new Date().toISOString(),
    });
  },

  subscribePresence(roomId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, 'liveGroupRooms', roomId, 'presence'), (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
  },
};
