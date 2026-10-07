import { collection, doc, getDocs, query, runTransaction, updateDoc, where, writeBatch } from 'firebase/firestore';
import { financeApi } from './financeApi.js';
import { requireFirebaseClient } from './client.js';
import { canonicalTeacherName } from '../../utils/teachers.js';

export function normalizeLesson(id, data = {}) {
  return {
    id,
    ...data,
    studentId: String(data.studentId || '').trim(),
    studentName: String(data.studentName || '').trim(),
    teacher: canonicalTeacherName(data.teacher),
    date: String(data.date || '').trim(),
    status: data.status || '',
    billingStatus: data.billingStatus || '',
  };
}

function newestFirst(left, right) {
  return `${right.date || ''}:${right.id || ''}`.localeCompare(`${left.date || ''}:${left.id || ''}`);
}

function accountingLessonId(source, occurrenceDate, studentId) {
  return `${source}_${occurrenceDate}_${studentId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 240);
}

export const lessonsService = {
  // Finance v2: exception for one "Puudus, ei teatanud" lesson — not charged on the next monthly invoice (admin only)
  async setBillingWaived(lessonId, waived, user) {
    const { db } = requireFirebaseClient();
    const value = { billingWaived: Boolean(waived), billingWaivedBy: user?.displayName || user?.email || '', billingWaivedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'lessons', lessonId), value);
    return value;
  },
  async listForBilling() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'lessons'));
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
  async listForCalendar(filters = {}) {
    const { db } = requireFirebaseClient();
    const reference = collection(db, 'lessons');
    const snapshot = await getDocs(filters.teacherUid ? query(reference, where('teacherUid', '==', filters.teacherUid)) : reference);
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
  // details: { topic, topicLevel, topicModule, topicLessonId, notes, status } from the calendar lesson panel
  async completeFromSchedule(event, user, details = {}) {
    const occurrenceDate = String(event?.occurrenceDate || event?.date || '').trim();
    if (!event?.id || !event?.studentId || !/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) throw new Error('Tunni seos on vigane.');
    const { db } = requireFirebaseClient();
    const id = accountingLessonId(`schedule_${event.id}`, occurrenceDate, event.studentId);
    const lessonRef = doc(db, 'lessons', id);
    return runTransaction(db, async (batch) => {
      const existing = await batch.get(lessonRef);
      if (existing.exists()) return normalizeLesson(existing.id, existing.data());
      const createdAt = new Date().toISOString();
      const value = {
        scheduleId: event.id,
        occurrenceDate,
        studentId: event.studentId,
        studentName: event.studentName || '',
        teacher: canonicalTeacherName(event.teacher || user?.displayName),
        teacherUid: event.teacherUid || user?.uid || '',
        subject: event.subject || 'Eesti keel',
        topic: details.topic || event.topic || '',
        topicLevel: details.topicLevel || '',
        topicModule: details.topicModule || '',
        topicLessonId: details.topicLessonId || '',
        notes: String(details.notes || '').slice(0, 1000),
        date: occurrenceDate,
        time: event.time || '',
        duration: Math.max(5, Number(event.duration) || 60),
        status: ['Toimunud', 'Puudus_eta', 'Puudus_p'].includes(details.status) ? details.status : 'Toimunud',
        accountingSource: 'crm_v2',
        createdAt,
        createdByUid: user?.uid || '',
        createdByName: user?.displayName || user?.email || '',
      };
      batch.set(lessonRef, value);
      if (!event.recurring) batch.set(doc(db, 'schedule', event.id), { status: value.status, updatedAtIso: createdAt }, { merge: true });
      batch.set(doc(collection(db, 'activityLog')), {
        type: 'lesson.completed',
        label: `${event.studentName || 'Õpilane'} tund märgitud toimunuks`,
        studentId: event.studentId,
        studentName: event.studentName || '',
        byUid: user?.uid || '',
        byName: user?.displayName || user?.email || '',
        byRole: user?.roles?.[0] || '',
        createdAt,
        date: occurrenceDate,
        meta: { lessonId: id, scheduleId: event.id },
    });
    return normalizeLesson(id, value);
    });
  },
  // Fix a mark made by mistake from the calendar: another status (held / absent) or back to "planned".
  // A lesson already on an invoice or in a closed period is refused by the rules; that is corrected in Finantsid.
  async changeMark(record, status, user, { scheduleRecurring = true } = {}) {
    if (!record?.id) throw new Error('Tunni märget ei leitud.');
    if (!['Toimunud', 'Puudus_eta', 'Puudus_p'].includes(status)) throw new Error('Vigane staatus.');
    if (record.invoiceId || record.billingStatus) throw new Error('Tund on juba arvel: paranda see Finantsides.');
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const batch = writeBatch(db);
    // a checked lesson whose mark changes has to be checked again
    const unverify = record.verified ? { verified: false, verifiedAt: now, verifiedByUid: user?.uid || '', verifiedByName: user?.displayName || user?.email || '' } : {};
    batch.update(doc(db, 'lessons', record.id), { status, ...unverify, updatedAt: now, updatedByUid: user?.uid || '', updatedByName: user?.displayName || user?.email || '' });
    if (record.scheduleId && !scheduleRecurring) batch.set(doc(db, 'schedule', record.scheduleId), { status, updatedAtIso: now }, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'lesson.mark_changed', label: `${record.studentName || 'Õpilane'} tunni märge muudetud`, studentId: record.studentId || '', studentName: record.studentName || '',
      byUid: user?.uid || '', byName: user?.displayName || user?.email || '', byRole: user?.roles?.[0] || '', createdAt: now, date: record.date || '',
      meta: { lessonId: record.id, scheduleId: record.scheduleId || '', from: record.status || '', to: status },
    });
    await batch.commit();
    return { ...record, status, ...(record.verified ? { verified: false } : {}) };
  },
  // The teacher changes the topic (level / module / lesson) or the note of a marked lesson; the student and the parent
  // see it. Billing is not affected (status, date and length stay).
  async updateDetails(record, details = {}, user) {
    if (!record?.id) throw new Error('Tunni märget ei leitud.');
    const { db } = requireFirebaseClient();
    const clean = (value, max) => String(value ?? '').trim().slice(0, max);
    const value = {
      topic: clean(details.topic, 300),
      topicLevel: clean(details.topicLevel, 40),
      topicModule: clean(details.topicModule, 300),
      topicLessonId: clean(details.topicLessonId, 160),
      notes: clean(details.notes, 1000),
      updatedAt: new Date().toISOString(),
      updatedByUid: user?.uid || '',
      updatedByName: user?.displayName || user?.email || '',
    };
    await updateDoc(doc(db, 'lessons', record.id), value);
    return { ...record, ...value };
  },
  // Admin: a held lesson is marked "held and checked" (or the check is taken back). Billing is not affected.
  async setVerified(record, verified, user) {
    if (!record?.id) throw new Error('Tunni märget ei leitud.');
    if (verified && record.status && record.status !== 'Toimunud') throw new Error('Kontrollituks saab märkida ainult toimunud tunni.');
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const value = { verified: Boolean(verified), verifiedAt: now, verifiedByUid: user?.uid || '', verifiedByName: user?.displayName || user?.email || '' };
    const batch = writeBatch(db);
    batch.update(doc(db, 'lessons', record.id), value);
    batch.set(doc(collection(db, 'activityLog')), {
      type: verified ? 'lesson.verified' : 'lesson.unverified', label: `${record.studentName || 'Õpilane'} tund ${verified ? 'märgitud kontrollituks' : 'pole enam kontrollitud'}`,
      studentId: record.studentId || '', studentName: record.studentName || '', byUid: user?.uid || '', byName: user?.displayName || user?.email || '',
      byRole: user?.roles?.[0] || '', createdAt: now, date: record.date || '', meta: { lessonId: record.id },
    });
    await batch.commit();
    return { ...record, ...value };
  },
  // Remove the mark: the lesson is planned again. Marks written by CRM v2 are removed here; older marks may carry
  // package/counter bookkeeping, so they go through the server journal, which reverses it.
  async removeMark(record, user, { scheduleRecurring = true } = {}) {
    if (!record?.id) throw new Error('Tunni märget ei leitud.');
    if (record.invoiceId || record.billingStatus) throw new Error('Tund on juba arvel: paranda see Finantsides.');
    if (record.accountingSource !== 'crm_v2') {
      await financeApi.deleteLessonJournal(record.id);
      return;
    }
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'lessons', record.id));
    if (record.scheduleId && !scheduleRecurring) batch.set(doc(db, 'schedule', record.scheduleId), { status: 'Planeeritud', updatedAtIso: now }, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'lesson.mark_removed', label: `${record.studentName || 'Õpilane'} tunni märge eemaldatud`, studentId: record.studentId || '', studentName: record.studentName || '',
      byUid: user?.uid || '', byName: user?.displayName || user?.email || '', byRole: user?.roles?.[0] || '', createdAt: now, date: record.date || '',
      meta: { lessonId: record.id, scheduleId: record.scheduleId || '', from: record.status || '' },
    });
    await batch.commit();
  },
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'lessons'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
};
