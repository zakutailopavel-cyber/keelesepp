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

export function normalizedParentEmail(value) {
  return clean(value).toLocaleLowerCase('et');
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

  async createMissingStudent(parent, values, existingStudents, user) {
    requireAdmin(user);
    if (!parent?.id) throw new Error('Lapsevanema kontot ei leitud.');
    const name = clean(values?.name);
    const requestedNames = splitChildNames(parent.childName);
    if (!name || !requestedNames.some((item) => item.toLocaleLowerCase('et') === name.toLocaleLowerCase('et'))) {
      throw new Error('Vali laps registreeringul sisestatud nimede hulgast.');
    }
    const teacherUid = clean(values?.teacherUid);
    const teacher = clean(values?.teacher);
    if (!teacherUid || !teacher) throw new Error('Vali õpilasele õpetaja kasutajate kataloogist.');
    const duplicate = (existingStudents || []).some((student) => (
      student.active !== false
      && !student.convertedToParent
      && clean(student.name).toLocaleLowerCase('et') === name.toLocaleLowerCase('et')
    ));
    if (duplicate) throw new Error('Sama nimega aktiivne õpilase kaart on juba olemas. Seo olemasolev kaart.');

    const now = new Date().toISOString();
    const payload = {
      name,
      parentName: clean(parent.displayName),
      parentEmail: clean(parent.email),
      linkedParentId: parent.id,
      parentUid: parent.id,
      teacher,
      teacherUid,
      level: clean(values.level) || 'A1',
      targetLevel: clean(values.targetLevel) || 'B1',
      subject: clean(values.subject) || 'Eesti keel',
      grade: clean(values.grade),
      group: '',
      phone: '',
      email: '',
      active: true,
      packageTotal: 0,
      packageUsed: 0,
      contactStatus: 'new',
      contactOwner: user.displayName || user.email || '',
      contactLastAt: '',
      contactNotes: 'Loodud lapsevanema registreeringust CRM v2-s',
      registrationSource: 'parent-registration',
      profileStatus: 'new',
      createdAt: now.slice(0, 10),
    };
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const studentRef = doc(collection(db, 'students'));
    batch.set(studentRef, payload);
    batch.set(doc(db, 'users', parent.id), {
      parentReviewStatus: 'checked',
      parentReviewKey: parentReviewKey(parent.childName),
      parentReviewedAt: now,
      parentReviewedBy: user.displayName || user.email || '',
    }, { merge: true });
    writeActivity(batch, db, 'parent.student_created', `${name} õpilase kaart loodi`, parent, user, { studentId: studentRef.id, studentName: name, teacherUid });
    await batch.commit();
    return { id: studentRef.id, ...payload };
  },

  async mergeDuplicates(primary, duplicates, students, user) {
    requireAdmin(user);
    if (!primary?.id) throw new Error('Põhikontot ei leitud.');
    const secondary = (duplicates || []).filter((parent) => parent?.id && parent.id !== primary.id);
    if (!secondary.length) throw new Error('Ühendatavaid duplikaate ei leitud.');
    if (secondary.length > 20) throw new Error('Korraga saab ühendada kuni 20 duplikaati.');
    const email = normalizedParentEmail(primary.email);
    if (!email || secondary.some((parent) => normalizedParentEmail(parent.email) !== email)) {
      throw new Error('Ühendada saab ainult täpselt sama e-posti aadressiga lapsevanema kontosid.');
    }

    const duplicateIds = new Set(secondary.map((parent) => parent.id));
    const explicitlyLinkedStudents = (students || []).filter((student) => {
      const linkedParentId = student.linkedParentId || student.parentUid || student.guardianUid || '';
      return student?.id && duplicateIds.has(linkedParentId);
    });
    if (secondary.length + explicitlyLinkedStudents.length + 2 > 450) {
      throw new Error('Ühendamine puudutab liiga palju kirjeid. Jaga toiming väiksemateks osadeks.');
    }

    const allParents = [primary, ...secondary];
    const firstValue = (fields) => {
      for (const parent of allParents) {
        for (const field of fields) {
          const value = clean(parent[field]);
          if (value) return value;
        }
      }
      return '';
    };
    const childName = splitChildNames(allParents.flatMap((parent) => splitChildNames(parent.childName)).join(', ')).join(', ');
    const now = new Date().toISOString();
    const primaryPayload = {
      displayName: firstValue(['displayName', 'name']),
      email: clean(primary.email),
      phone: firstValue(['phone', 'parentPhone']),
      childName,
      parentReviewStatus: 'checked',
      parentReviewKey: parentReviewKey(childName),
      parentReviewedAt: now,
      parentReviewedBy: user.displayName || user.email || '',
      mergedDuplicateParentIds: [...new Set([...(primary.mergedDuplicateParentIds || []), ...secondary.map((parent) => parent.id)])],
      parentMergedAt: now,
      parentMergedBy: user.displayName || user.email || '',
    };
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', primary.id), primaryPayload, { merge: true });
    secondary.forEach((parent) => batch.set(doc(db, 'users', parent.id), {
      active: false,
      mergedIntoParentId: primary.id,
      mergedIntoParentName: primaryPayload.displayName,
      parentReviewStatus: 'merged',
      parentMergedAt: now,
      parentMergedBy: user.displayName || user.email || '',
    }, { merge: true }));
    explicitlyLinkedStudents.forEach((student) => batch.set(doc(db, 'students', student.id), {
      linkedParentId: primary.id,
      parentUid: primary.id,
      parentName: primaryPayload.displayName,
      parentEmail: primaryPayload.email,
      updatedAt: now,
    }, { merge: true }));
    writeActivity(batch, db, 'parent.duplicates_merged', `${secondary.length} lapsevanema duplikaati arhiveeriti`, primary, user, {
      duplicateParentIds: secondary.map((parent) => parent.id),
      duplicateCount: secondary.length,
      reassignedStudentCount: explicitlyLinkedStudents.length,
    });
    await batch.commit();
    return { duplicateCount: secondary.length, reassignedStudentCount: explicitlyLinkedStudents.length };
  },
};
