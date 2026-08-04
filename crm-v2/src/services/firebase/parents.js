import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function clean(value) {
  return String(value || '').trim();
}

export function splitChildNames(value) {
  const unique = new Map();
  String(value || '').split(/[,\n;|]+/).map(clean).filter(Boolean).forEach((name) => {
    const key = name.toLocaleLowerCase('et');
    if (!unique.has(key)) unique.set(key, name);
  });
  return [...unique.values()];
}

export function parentReviewKey(value) {
  return splitChildNames(value).map((name) => name.toLocaleLowerCase('et')).join('|');
}

export function normalizeParent(id, data = {}) {
  return {
    id,
    ...data,
    displayName: clean(data.displayName || data.name),
    email: clean(data.email),
    phone: clean(data.phone || data.parentPhone),
    childName: clean(data.childName),
    preferredTeacher: clean(data.preferredTeacher || data.teacher),
    parentContactStatus: clean(data.parentContactStatus) || 'new',
    parentContactChannel: clean(data.parentContactChannel) || 'phone',
    parentNextContactAt: clean(data.parentNextContactAt),
    parentContactOwner: clean(data.parentContactOwner),
    parentContactNotes: clean(data.parentContactNotes),
    active: data.active !== false,
  };
}

function requireAdmin(user) {
  if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab lapsevanema andmeid muuta.');
}

function writeActivity(batch, db, type, label, parent, user, meta = {}) {
  const createdAt = new Date().toISOString();
  batch.set(doc(collection(db, 'activityLog')), {
    type,
    label,
    byUid: user.uid,
    byName: user.displayName || user.email || 'Administraator',
    byRole: 'admin',
    createdAt,
    date: createdAt.slice(0, 10),
    meta: { parentUid: parent.id || '', parentName: parent.displayName || '', ...meta },
  });
}

export const parentsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs
      .map((item) => normalizeParent(item.id, item.data()))
      .filter((parent) => parent.active && (parent.role === 'parent' || parent.parentRole === true || parent.roles?.includes('parent')))
      .sort((left, right) => (left.displayName || left.email).localeCompare(right.displayName || right.email, 'et', { sensitivity: 'base' }));
  },

  async updateCrm(parent, patch, user) {
    requireAdmin(user);
    if (!parent?.id) throw new Error('Lapsevanema kontot ei leitud.');
    const allowed = ['parentContactStatus', 'parentContactChannel', 'parentNextContactAt', 'parentContactOwner', 'parentContactNotes', 'phone'];
    const payload = Object.fromEntries(allowed.filter((key) => key in patch).map((key) => [key, clean(patch[key])]));
    payload.parentCrmUpdatedAt = new Date().toISOString();
    payload.parentCrmUpdatedBy = user.displayName || user.email || '';
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', parent.id), payload, { merge: true });
    writeActivity(batch, db, 'parent.crm_updated', `${parent.displayName || parent.email || 'Lapsevanema'} kontakt uuendatud`, parent, user, { fields: Object.keys(payload).filter((key) => !key.startsWith('parentCrm')) });
    await batch.commit();
    return normalizeParent(parent.id, { ...parent, ...payload });
  },

  async markReviewed(parent, user) {
    requireAdmin(user);
    if (!parent?.id) throw new Error('Lapsevanema kontot ei leitud.');
    const reviewedAt = new Date().toISOString();
    const payload = {
      parentReviewStatus: 'checked',
      parentReviewKey: parentReviewKey(parent.childName),
      parentReviewedAt: reviewedAt,
      parentReviewedBy: user.displayName || user.email || '',
    };
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', parent.id), payload, { merge: true });
    writeActivity(batch, db, 'parent.review_checked', `${parent.displayName || parent.email || 'Lapsevanem'} kontrollitud`, parent, user);
    await batch.commit();
    return payload;
  },

  async linkStudent(parent, student, user) {
    requireAdmin(user);
    if (!parent?.id || !student?.id) throw new Error('Lapsevanemat või õpilast ei leitud.');
    const existingParentId = student.linkedParentId || student.parentUid || student.guardianUid || '';
    if (existingParentId && existingParentId !== parent.id) throw new Error('Õpilane on juba seotud teise lapsevanema kontoga.');
    const childNames = splitChildNames(parent.childName);
    if (!childNames.some((name) => name.toLocaleLowerCase('et') === clean(student.name).toLocaleLowerCase('et'))) childNames.push(clean(student.name));
    const childName = childNames.filter(Boolean).join(', ');
    const linkedAt = new Date().toISOString();
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'students', student.id), {
      linkedParentId: parent.id,
      parentUid: parent.id,
      parentName: parent.displayName || '',
      parentEmail: parent.email || '',
      updatedAt: linkedAt,
    }, { merge: true });
    batch.set(doc(db, 'users', parent.id), {
      childName,
      parentReviewStatus: 'checked',
      parentReviewKey: parentReviewKey(childName),
      parentReviewedAt: linkedAt,
      parentReviewedBy: user.displayName || user.email || '',
    }, { merge: true });
    writeActivity(batch, db, 'parent.student_assigned', `${student.name || 'Õpilane'} seoti lapsevanemaga`, parent, user, { studentId: student.id, studentName: student.name || '' });
    await batch.commit();
    return { childName };
  },
};
