import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Seadme kontroll”: the student's last result on his own account (users/{uid}.deviceCheck, firestore.rules
// validDeviceCheck: { at, status, issues ≤ 12 known codes, browser ≤ 40 }) and what the teacher reads before a lesson.
// Staff may read any users document (rules: users read isStaff()); a teacher lists only his own invitations.

const cardUid = (data = {}) => data.linkedUserId || data.studentUid || (Array.isArray(data.linkedUserIds) ? data.linkedUserIds[0] : '') || '';

export const deviceCheckService = {
  async save(uid, record) {
    if (!uid || !record) return false;
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'users', uid), { deviceCheck: record }, { merge: true });
    return true;
  },

  /**
   * For the teacher: { deviceCheck|null, hadLiveLesson, hasAccount }.
   * `studentUid` saves the card read when the caller knows it (the live room's invitation).
   */
  async forStudent({ studentId = '', studentUid = '', teacherUid = '', admin = false } = {}) {
    if (!studentId && !studentUid) return null;
    const { db } = requireFirebaseClient();
    let uid = studentUid;
    if (!uid && studentId) {
      const card = await getDoc(doc(db, 'students', studentId));
      uid = card.exists() ? cardUid(card.data()) : '';
    }
    const [account, past] = await Promise.all([
      uid ? getDoc(doc(db, 'users', uid)).catch(() => null) : null,
      // an earlier finished live lesson; a teacher may list only his own invitations
      studentId && (admin || teacherUid)
        ? getDocs(query(collection(db, 'liveLessonInvitations'), ...[
          where('studentId', '==', studentId),
          ...(admin ? [] : [where('teacherUid', '==', teacherUid)]),
          where('status', '==', 'closed'),
          limit(1),
        ])).catch(() => null)
        : null,
    ]);
    const deviceCheck = account?.exists?.() ? account.data().deviceCheck || null : null;
    return { hasAccount: Boolean(uid), deviceCheck, hadLiveLesson: Boolean(past && !past.empty) };
  },
};
