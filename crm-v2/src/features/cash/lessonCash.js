// „Makstud sularahas” on a lesson (owner 2026-11-10). The server keeps the receipt (functions/cash-core.js
// lessonCashEntry: cashLedger, `source: "lesson"`, held by the teacher until „Sain kätte”); these helpers only name the
// lesson, read the amount and decide where the button shows. docs/ACCOUNTING.md „Sularaha tunni eest”.
import { lessonCashKey } from '../../services/firebase/financeApi.js';

// the lesson document's id — the same rule as lessons.js accountingLessonId and functions live-auto-mark-core.js
export function lessonCashLessonId(lesson = {}) {
  const { scheduleId, occurrenceDate, studentId } = lessonCashKey(lesson);
  return `schedule_${scheduleId}_${occurrenceDate}_${studentId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 240);
}

// „25”, „25,50”, „25.5 €” → cents; null when it is not a positive amount with at most two decimals
export function amountCents(text) {
  const value = String(text ?? '').replace(/\s|€/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const cents = Math.round(Number(value) * 100);
  return cents > 0 && cents <= 10000000 ? cents : null;
}

// cents → „25,00” for the input
export const amountText = (cents) => (Number(cents) > 0 ? (Number(cents) / 100).toFixed(2).replace('.', ',') : '');

// The button shows on a past 1:1 lesson that took place or is still unmarked, for its own teacher (an admin: any).
// Not on a group row, a cancelled lesson or a notified absence (nothing to pay for).
export function canMarkLessonCash(item = {}, { uid = '', isAdmin = false } = {}) {
  if (!item.studentId || item.isGroup || item.groupLessonId) return false;
  const status = item.record?.status || item.status || 'Planeeritud';
  if (!['Planeeritud', 'Toimunud', 'Puudus_eta'].includes(status)) return false;
  return isAdmin || (Boolean(uid) && item.teacherUid === uid);
}
