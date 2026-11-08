import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { cancelledPayout, markedPayout, payoutId } from '../../features/payroll/payroll.js';

// „Väljamaksed” on /finance/payroll (owner 2026-11-09): teacherPayouts/{month}_{teacherUid}. Only the administrator
// writes (firestore.rules: fixed keys, own uid, append-only history, never deleted); the bookkeeper may read.
// Every mark / undo also writes one activityLog line — without the amount: activityLog is readable by every teacher.
const monthLabel = (month) => new Intl.DateTimeFormat('et-EE', { month: 'long', year: 'numeric' }).format(new Date(`${month}-15T12:00:00Z`));

function logEntry(type, label, user, nowIso, meta) {
  return { type, label, byUid: user.uid, byName: user.displayName || user.email || 'Administraator', byRole: 'admin', createdAt: nowIso, date: nowIso.slice(0, 10), meta };
}

export const teacherPayoutsService = {
  async listMonth(month) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'teacherPayouts'), where('month', '==', month)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  },
  // value: validatePayout(...).value
  async mark({ teacher, month, value }, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab väljamakse märkida.');
    const { db } = requireFirebaseClient();
    const ref = doc(db, 'teacherPayouts', payoutId(month, teacher.id));
    const nowIso = new Date().toISOString();
    return runTransaction(db, async (tx) => {
      const current = await tx.get(ref);
      const data = markedPayout(current.exists() ? current.data() : null, { teacher, month, value }, user, nowIso);
      tx.set(ref, data);
      tx.set(doc(collection(db, 'activityLog')), logEntry('finance.teacher_payout_marked', `${teacher.name || 'Õpetaja'}: ${monthLabel(month)} töötasu märgiti makstuks`, user, nowIso, { teacherUid: teacher.id, month, payoutId: ref.id }));
      return { id: ref.id, ...data };
    });
  },
  async cancel({ teacherUid, teacherName, month, reason }, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab märke tühistada.');
    const { db } = requireFirebaseClient();
    const ref = doc(db, 'teacherPayouts', payoutId(month, teacherUid));
    const nowIso = new Date().toISOString();
    return runTransaction(db, async (tx) => {
      const current = await tx.get(ref);
      const data = cancelledPayout(current.exists() ? current.data() : null, reason, user, nowIso);
      tx.set(ref, data);
      tx.set(doc(collection(db, 'activityLog')), logEntry('finance.teacher_payout_cancelled', `${teacherName || 'Õpetaja'}: ${monthLabel(month)} väljamakse märge tühistati`, user, nowIso, { teacherUid, month, payoutId: ref.id }));
      return { id: ref.id, ...data };
    });
  },
};
