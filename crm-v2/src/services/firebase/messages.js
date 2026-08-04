import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function timestampValue(value) {
  if (value?.toDate) return value.toDate().toISOString();
  return value || '';
}

function chunks(values = [], size = 10) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, index * size + size));
}

export function normalizeMessage(id, data = {}) {
  return {
    id,
    ...data,
    studentId: data.studentId || '',
    studentName: data.studentName || 'Vestlus',
    teacher: data.teacher || '',
    text: String(data.text || ''),
    fromUid: data.fromUid || '',
    fromName: data.fromName || 'Kasutaja',
    fromRole: data.fromRole || '',
    createdAt: timestampValue(data.createdAt || data.date),
    read: Boolean(data.read),
  };
}

function messageRecords(snapshot) {
  return snapshot.docs.map((item) => normalizeMessage(item.id, item.data()));
}

export const messagesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'messages'));
    return messageRecords(snapshot)
      .sort((a, b) => String(a.createdAt || a.date || '').localeCompare(String(b.createdAt || b.date || '')));
  },
  async listByStudentIds(studentIds = []) {
    if (!studentIds.length) return [];
    const { db } = requireFirebaseClient();
    const snapshots = await Promise.all(chunks([...new Set(studentIds.filter(Boolean))]).map((ids) => getDocs(query(collection(db, 'messages'), where('studentId', 'in', ids)))));
    return snapshots.flatMap(messageRecords).sort((a, b) => String(a.createdAt || a.date || '').localeCompare(String(b.createdAt || b.date || '')));
  },
  async send(data, user) {
    const studentId = String(data?.studentId || '').trim();
    const studentName = String(data?.studentName || '').trim();
    const text = String(data?.text || '').trim();
    if (!user?.uid) throw new Error('Kasutajat ei leitud. Logi uuesti sisse.');
    if (!studentId || !studentName) throw new Error('Vali sõnumi saaja.');
    if (!text) throw new Error('Kirjuta sõnum.');
    if (text.length > 4000) throw new Error('Sõnum võib olla kuni 4000 tähemärki.');
    const { db } = requireFirebaseClient();
    const createdAt = new Date().toISOString();
    const value = {
      studentId,
      studentName,
      teacher: String(data.teacher || '').trim(),
      text,
      fromUid: user.uid,
      fromName: user.displayName || user.email || 'Kasutaja',
      fromRole: user.roles?.[0] || '',
      createdAt,
      date: createdAt.slice(0, 10),
      read: false,
    };
    const reference = doc(collection(db, 'messages'));
    const batch = writeBatch(db);
    batch.set(reference, value);
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'message.sent',
      label: `Sõnum saadetud: ${studentName}`,
      studentId,
      studentName,
      byUid: user.uid,
      byName: user.displayName || user.email || 'Kasutaja',
      byRole: user.roles?.[0] || '',
      createdAt,
      date: createdAt.slice(0, 10),
      meta: { messageId: reference.id || '', textLength: text.length },
    });
    await batch.commit();
    return { id: reference.id, ...value };
  },
  async markRead(id) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'messages', id), { read: true });
  },
  async markConversationRead({ messages = [], userUid }) {
    const unreadIds = [...new Set(messages.filter((message) => message?.id && !message.read && message.fromUid !== userUid).map((message) => message.id))];
    if (!unreadIds.length) return 0;
    const { db } = requireFirebaseClient();
    for (const ids of chunks(unreadIds, 450)) {
      const batch = writeBatch(db);
      ids.forEach((id) => batch.update(doc(db, 'messages', id), { read: true }));
      await batch.commit();
    }
    return unreadIds.length;
  },
};
