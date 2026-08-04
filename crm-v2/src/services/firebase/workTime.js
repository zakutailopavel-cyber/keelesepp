import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

const defaultStaffOperationsUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';

async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultStaffOperationsUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Tööaja päring ebaõnnestus.');
  return data;
}

function inMonth(item, month) {
  return !month || String(item.date || item.startedDate || item.startedAt || '').slice(0, 7) === month;
}

function records(snapshot, month) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => inMonth(item, month));
}

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
    const sessions = records(sessionSnapshot, month).sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || '')));
    const programDays = records(programSnapshot, month).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return { sessions, programDays, summary: workTimeSummary(sessions, programDays) };
  },
  async listAll(month = '') {
    const { db } = requireFirebaseClient();
    const [sessionSnapshot, programSnapshot] = await Promise.all([
      getDocs(collection(db, 'workSessions')),
      getDocs(collection(db, 'staffProgramDays')),
    ]);
    return {
      sessions: records(sessionSnapshot, month).sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || ''))),
      programDays: records(programSnapshot, month).sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    };
  },
  setHourlyRate(staffUid, hourlyRate) {
    return post('/rates', { staffUid, hourlyRate });
  },
  reviewSession(sessionId, decision, { reason = '', hourlyRate = '' } = {}) {
    const path = decision === 'reject' ? '/sessions/reject' : '/sessions/approve';
    return post(path, { sessionId, reason, hourlyRate });
  },
  adjustSession(sessionId, values) {
    return post('/sessions/adjust', { sessionId, ...values });
  },
};
