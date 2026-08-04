import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export function workTimeSummary(sessions = [], programDays = []) {
  const closed = sessions.filter((item) => item.status === 'closed');
  const approved = closed.filter((item) => item.approvalStatus === 'approved');
  return {
    approvedMinutes: approved.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0),
    pendingMinutes: closed.filter((item) => item.approvalStatus === 'pending').reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0),
    programMinutes: Math.round(programDays.reduce((sum, item) => sum + Number(item.activeSeconds || 0), 0) / 60),
    approvedPayCents: approved.reduce((sum, item) => sum + Number(item.payAmountCents || 0), 0),
    openSession: sessions.find((item) => item.status === 'open') || null,
  };
}

export const workTimeService = {
  async listByStaff(staffUid, month = '') {
    const { db } = requireFirebaseClient();
    const [sessionSnapshot, programSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'workSessions'), where('staffUid', '==', staffUid))),
      getDocs(query(collection(db, 'staffProgramDays'), where('staffUid', '==', staffUid))),
    ]);
    const inMonth = (item) => !month || String(item.date || item.startedDate || item.startedAt || '').slice(0, 7) === month;
    const sessions = sessionSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter(inMonth).sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || '')));
    const programDays = programSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter(inMonth).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return { sessions, programDays, summary: workTimeSummary(sessions, programDays) };
  },
};
