import { arrayUnion, collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { requireFirebaseClient } from './client.js';

// Team tasks (Ülesanded): the same `tasks` collection and field meanings as CRM v1, so both CRMs show the same tasks.
// v1 fields: title, assignedTo (canonical staff name), dueDate (YYYY-MM-DD), priority (high|normal|low),
// category (general|parent|payment|lesson|technical), status (open|in_progress|done), createdBy*, createdAt (date),
// done*, updated*, replies[] (last 30), lastReply*, lastReplySeenBy[]. Additive v2 fields: assignedToUid and
// openedByUids (who has opened the task, used for "new task for you" in the notification centre).
// Every change also writes an activityLog entry, like v1 does.

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Tallinn' }).format(new Date());
const nameOf = (user = {}) => String(user.displayName || user.email || '').trim();
const randomId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function activity(db, batch, user, type, label, meta) {
  const createdAt = new Date().toISOString();
  batch.set(doc(collection(db, 'activityLog')), {
    type,
    label,
    meta,
    studentId: '',
    studentName: '',
    byUid: user.uid,
    byName: nameOf(user),
    byRole: user.roles?.[0] || '',
    createdAt,
    date: createdAt.slice(0, 10),
  });
}

export function normalizeTask(id, data = {}) {
  return {
    ...data,
    id,
    title: String(data.title || ''),
    assignedTo: canonicalTeacherName(data.assignedTo),
    assignedToUid: data.assignedToUid || '',
    dueDate: String(data.dueDate || ''),
    priority: ['high', 'low'].includes(data.priority) ? data.priority : 'normal',
    category: data.category || 'general',
    status: ['in_progress', 'done'].includes(data.status) ? data.status : 'open',
    replies: Array.isArray(data.replies) ? data.replies : [],
    lastReplySeenBy: Array.isArray(data.lastReplySeenBy) ? data.lastReplySeenBy : [],
    openedByUids: Array.isArray(data.openedByUids) ? data.openedByUids : [],
  };
}

export const tasksService = {
  subscribe(onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, 'tasks'), (snapshot) => onChange(snapshot.docs.map((item) => normalizeTask(item.id, item.data()))), onError);
  },
  async create(data, user) {
    const title = String(data.title || '').trim();
    if (!title) throw new Error('Sisesta ülesande pealkiri.');
    const { db } = requireFirebaseClient();
    const reference = doc(collection(db, 'tasks'));
    const assignedTo = canonicalTeacherName(data.assignedTo || nameOf(user));
    const batch = writeBatch(db);
    batch.set(reference, {
      title,
      assignedTo,
      assignedToUid: data.assignedToUid || (data.assignedTo ? '' : user.uid),
      dueDate: data.dueDate || '',
      priority: data.priority || 'normal',
      category: data.category || 'general',
      status: 'open',
      createdByUid: user.uid,
      createdByName: nameOf(user),
      createdByRole: user.roles?.[0] || '',
      createdAt: today(),
      openedByUids: [user.uid],
    });
    activity(db, batch, user, 'task.created', 'Lisati ülesanne', { taskId: reference.id, taskTitle: title, assignedTo });
    await batch.commit();
    return reference.id;
  },
  // Same semantics as v1 updateTask: a status change also sets or clears done*.
  async update(task, patch, user) {
    const { db } = requireFirebaseClient();
    const next = { ...patch, updatedAt: new Date().toISOString(), updatedByUid: user.uid, updatedByName: nameOf(user) };
    if (Object.hasOwn(patch, 'assignedTo')) next.assignedTo = canonicalTeacherName(patch.assignedTo);
    if (Object.hasOwn(patch, 'status')) {
      const done = patch.status === 'done';
      next.doneAt = done ? today() : '';
      next.doneByUid = done ? user.uid : '';
      next.doneByName = done ? nameOf(user) : '';
    }
    const batch = writeBatch(db);
    batch.set(doc(db, 'tasks', task.id), next, { merge: true });
    const statusOnly = Object.keys(patch).length === 1 && Object.hasOwn(patch, 'status');
    if (statusOnly && patch.status === 'done') activity(db, batch, user, 'task.done', 'Ülesanne märgiti tehtuks', { taskId: task.id, taskTitle: task.title || '' });
    else if (statusOnly && task.status === 'done') activity(db, batch, user, 'task.reopened', 'Ülesanne avati uuesti', { taskId: task.id, taskTitle: task.title || '' });
    else activity(db, batch, user, 'task.updated', 'Uuendati ülesannet', { taskId: task.id, taskTitle: task.title || '', fields: Object.keys(patch).join(',') });
    await batch.commit();
  },
  async reply(task, text, user) {
    const clean = String(text || '').trim();
    if (!clean) throw new Error('Kirjuta vastus.');
    const { db } = requireFirebaseClient();
    const reply = { id: randomId(), text: clean, byUid: user.uid, byName: nameOf(user), createdAt: new Date().toISOString(), seenBy: [user.uid] };
    const batch = writeBatch(db);
    batch.set(doc(db, 'tasks', task.id), {
      replies: [...(task.replies || []), reply].slice(-30),
      lastReplyAt: reply.createdAt,
      lastReplyBy: reply.byName,
      lastReplyByUid: reply.byUid,
      lastReplyText: reply.text,
      lastReplySeenBy: [reply.byUid],
    }, { merge: true });
    activity(db, batch, user, 'task.reply', 'Ülesandele vastati', { taskId: task.id, taskTitle: task.title || '', reply: clean });
    await batch.commit();
  },
  // Opening a task marks its last reply as seen and the task itself as opened (no activityLog: it is a read receipt).
  async markSeen(task, user) {
    const replySeen = !task.lastReplyAt || task.lastReplySeenBy?.includes(user.uid);
    const opened = task.openedByUids?.includes(user.uid);
    if (replySeen && opened) return;
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'tasks', task.id), {
      ...(replySeen ? {} : { lastReplySeenBy: arrayUnion(user.uid) }),
      ...(opened ? {} : { openedByUids: arrayUnion(user.uid) }),
    }, { merge: true });
    await batch.commit();
  },
  async remove(task, user) {
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'tasks', task.id));
    activity(db, batch, user, 'task.deleted', 'Kustutati ülesanne', { taskId: task.id, taskTitle: task.title || '' });
    await batch.commit();
  },
};
