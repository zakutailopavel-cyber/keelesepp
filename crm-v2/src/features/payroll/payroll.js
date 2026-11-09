import { workTimeSummary } from '../../services/firebase/workTime.js';

export function payrollRows(teachers = [], sessions = [], programDays = []) {
  const teacherMap = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  sessions.forEach((session) => {
    if (!teacherMap.has(session.staffUid)) teacherMap.set(session.staffUid, { id: session.staffUid, name: session.staffName || 'Töötaja' });
  });
  programDays.forEach((day) => {
    if (!teacherMap.has(day.staffUid)) teacherMap.set(day.staffUid, { id: day.staffUid, name: day.staffName || 'Töötaja' });
  });
  return [...teacherMap.values()].map((teacher) => {
    const staffSessions = sessions.filter((session) => session.staffUid === teacher.id);
    const staffProgramDays = programDays.filter((day) => day.staffUid === teacher.id);
    const summary = workTimeSummary(staffSessions, staffProgramDays);
    return {
      teacher,
      sessions: staffSessions,
      programDays: staffProgramDays,
      summary,
      pendingCount: staffSessions.filter((session) => session.status === 'closed' && session.approvalStatus === 'pending').length,
      approvedCount: staffSessions.filter((session) => session.approvalStatus === 'approved').length,
      rejectedCount: staffSessions.filter((session) => session.approvalStatus === 'rejected').length,
      openCount: staffSessions.filter((session) => session.status === 'open').length,
    };
  }).filter((row) => row.sessions.length || row.programDays.length || Number(row.teacher.workHourlyRateCents || 0) > 0)
    .sort((left, right) => left.teacher.name.localeCompare(right.teacher.name, 'et'));
}

export function payrollTotals(rows = []) {
  return rows.reduce((total, row) => ({
    approvedMinutes: total.approvedMinutes + row.summary.approvedMinutes,
    pendingMinutes: total.pendingMinutes + row.summary.pendingMinutes,
    programMinutes: total.programMinutes + row.summary.programMinutes,
    approvedPayCents: total.approvedPayCents + row.summary.approvedPayCents,
    pendingCount: total.pendingCount + row.pendingCount,
    openCount: total.openCount + row.openCount,
  }), { approvedMinutes: 0, pendingMinutes: 0, programMinutes: 0, approvedPayCents: 0, pendingCount: 0, openCount: 0 });
}

// ── Väljamaksed (owner 2026-11-09: „one teacher-pay figure per month per teacher with a 'paid out' mark”) ──
// The pay is the approved work-time pay above (summary.approvedPayCents): server-measured clock-in / clock-out,
// approved by the administrator with the hourly rate snapshotted on each session — the audited basis of this page.
// The school has one rate per teacher (`users.workHourlyRateCents`, € / h), no per-lesson rate, so the lessons given
// (teachers/teacherLoad.js → businessReport withTeacherPay: the same rate × minutes of lessons given) are shown next to
// it as a check only; a gap of PAY_DIFF_WARN_CENTS or more is flagged, never silently replaced.
// A mark lives in `teacherPayouts/{month}_{teacherUid}` (admin writes, admin + bookkeeper read, never deleted; an undo
// sets status „cancelled” and the doc keeps an append-only `history`).
export const PAY_DIFF_WARN_CENTS = 500;
export const PAYOUT_METHODS = [['pank', 'Pangaülekanne'], ['sularaha', 'Sularaha'], ['muu', 'Muu']];
export const PAYOUT_NOTE_MAX = 500;
export const PAYOUT_HISTORY_MAX = 100;
export const payoutId = (month, teacherUid) => `${month}_${teacherUid}`;

// rows (payrollRows) + loadRows (teacherLoad for the same month, or null when it could not be read) + payouts (docs of
// the month) → Map teacherId → { workedMinutes, payableCents, lessons: { held, hours, payCents, rateCents } | null,
// diffCents, warn, payout (status „paid” only), paidDiffers }
export function payoutView(rows = [], loadRows = null, payouts = []) {
  const load = new Map((loadRows || []).map((row) => [row.id, row]));
  const paid = new Map(payouts.filter((item) => item.status === 'paid').map((item) => [item.teacherUid, item]));
  return new Map(rows.map((row) => {
    const lessonRow = load.get(row.teacher.id);
    const lessons = loadRows ? { held: lessonRow?.held || 0, hours: lessonRow?.hours || 0, payCents: lessonRow ? lessonRow.pay.payCents : null, rateCents: lessonRow?.pay.rateCents || null } : null;
    const payableCents = row.summary.approvedPayCents;
    const diffCents = lessons && lessons.payCents !== null ? payableCents - lessons.payCents : null;
    const payout = paid.get(row.teacher.id) || null;
    return [row.teacher.id, {
      workedMinutes: row.summary.approvedMinutes,
      payableCents,
      lessons,
      diffCents,
      warn: diffCents !== null && Math.abs(diffCents) >= PAY_DIFF_WARN_CENTS,
      payout,
      paidDiffers: Boolean(payout && payout.amountCents !== payableCents),
    }];
  }));
}

// month header: paid = every „paid” mark of the month; unpaid = the payable of the rows without one
export function payoutTotals(rows = [], view = new Map(), payouts = []) {
  const paidList = payouts.filter((item) => item.status === 'paid');
  const open = rows.map((row) => view.get(row.teacher.id)).filter((item) => item && !item.payout && item.payableCents > 0);
  return {
    paidCents: paidList.reduce((sum, item) => sum + Number(item.amountCents || 0), 0),
    paidCount: paidList.length,
    unpaidCents: open.reduce((sum, item) => sum + item.payableCents, 0),
    unpaidCount: open.length,
  };
}

// the mark form → { valid, errors, value: { amountCents, paidAt, method, note } }; amount in euros („820,50”)
export function validatePayout({ amount = '', paidAt = '', method = '', note = '' } = {}) {
  const errors = {};
  const text = String(amount).trim().replace(/\s/g, '');
  const amountCents = /^\d+(?:[.,]\d{1,2})?$/.test(text) ? Math.round(Number(text.replace(',', '.')) * 100) : NaN;
  if (!Number.isInteger(amountCents) || amountCents <= 0) errors.amount = 'Sisesta makstud summa.';
  else if (amountCents > 10000000) errors.amount = 'Summa on liiga suur.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt) || Number.isNaN(Date.parse(`${paidAt}T12:00:00Z`))) errors.paidAt = 'Vali maksmise kuupäev.';
  if (method && !PAYOUT_METHODS.some(([id]) => id === method)) errors.method = 'Tundmatu makseviis.';
  if (String(note).length > PAYOUT_NOTE_MAX) errors.note = `Märkus võib olla kuni ${PAYOUT_NOTE_MAX} märki.`;
  return { valid: !Object.keys(errors).length, errors, value: { amountCents, paidAt, method: method || '', note: String(note).trim() } };
}

const actor = (user) => ({ uid: user.uid, name: String(user.displayName || user.email || 'Administraator').slice(0, 160) });
const historyOf = (previous) => {
  const list = Array.isArray(previous?.history) ? previous.history : [];
  if (list.length >= PAYOUT_HISTORY_MAX) throw new Error('Selle kuu märkeid on liiga palju muudetud. Võta ühendust arendajaga.');
  return list;
};

// the stored doc of a „Märgi makstuks” (previous = the current doc or null; a „paid” one cannot be marked again)
export function markedPayout(previous, { teacher, month, value }, user, nowIso) {
  if (previous?.status === 'paid') throw new Error('See kuu on juba makstuks märgitud.');
  const by = actor(user);
  return {
    teacherUid: teacher.id, teacherName: String(teacher.name || '').slice(0, 160), month, status: 'paid',
    amountCents: value.amountCents, paidAt: value.paidAt, method: value.method, note: value.note,
    markedBy: by, markedAtIso: nowIso,
    history: [...historyOf(previous), { action: 'paid', amountCents: value.amountCents, paidAt: value.paidAt, method: value.method, note: value.note, byUid: by.uid, byName: by.name, atIso: nowIso }],
  };
}

// „Tühista märge”: the mark stays readable, status → „cancelled”, one more history line
export function cancelledPayout(previous, reason, user, nowIso) {
  if (previous?.status !== 'paid') throw new Error('Seda märget ei ole enam — laadi leht uuesti.');
  const by = actor(user);
  const note = String(reason || '').trim().slice(0, PAYOUT_NOTE_MAX);
  return {
    ...previous, status: 'cancelled', cancelledBy: by, cancelledAtIso: nowIso, cancelReason: note,
    history: [...historyOf(previous), { action: 'cancelled', amountCents: previous.amountCents, paidAt: previous.paidAt, method: previous.method || '', note, byUid: by.uid, byName: by.name, atIso: nowIso }],
  };
}

const csvCell = (value) => { const source = String(value ?? ''); return /[;"\n]/.test(source) ? `"${source.replace(/"/g, '""')}"` : source; };
const csvMoney = (cents) => (cents === null || cents === undefined ? '' : (Number(cents) / 100).toFixed(2).replace('.', ','));
const csvDate = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');

// „Laadi CSV”: one line per teacher of the month (Excel-friendly: BOM, „;”, decimal comma)
export function payoutCsv(month, rows = [], view = new Map()) {
  const lines = [['Kuu', 'Õpetaja', 'Kinnitatud tunnid (h)', 'Antud tunde (tk)', 'Antud tunde (h)', 'Väljamaksmisele (€)', 'Tundide järgi (€)', 'Makstud (€)', 'Makstud kuupäev', 'Makseviis']];
  rows.forEach((row) => {
    const item = view.get(row.teacher.id) || {};
    lines.push([month, row.teacher.name, (Number(item.workedMinutes || 0) / 60).toFixed(2).replace('.', ','), item.lessons ? item.lessons.held : '', item.lessons ? String(item.lessons.hours).replace('.', ',') : '', csvMoney(item.payableCents), csvMoney(item.lessons?.payCents), csvMoney(item.payout?.amountCents), csvDate(item.payout?.paidAt), (PAYOUT_METHODS.find(([id]) => id === item.payout?.method) || [])[1] || '']);
  });
  return `\uFEFF${lines.map((line) => line.map(csvCell).join(';')).join('\n')}`;
}
