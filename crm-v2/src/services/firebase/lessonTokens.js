import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Lesson tokens of a card (functions/lesson-tokens-core.js): its lesson packages and their ledger. The administrator,
// finance and the card's own student / parent may read them (firestore.rules).
export function tokenSummary(packages = []) {
  const active = packages.filter((item) => item.status === 'active');
  const sum = (key) => active.reduce((n, item) => n + (Number(item[key]) || 0), 0);
  return { balance: sum('balanceCredits'), granted: sum('grantedCredits'), consumed: sum('consumedCredits'), packages: active.length };
}

// low balance: time to send the next package invoice
export const TOKENS_LOW = 2;

export const lessonTokensService = {
  async listByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentPackages'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },
  async ledgerByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'packageLedger'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },
};
