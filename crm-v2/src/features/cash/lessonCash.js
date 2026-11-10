// Cash at the lesson (owner 2026-11-10, one flow with „Toimus” since 2026-11-11). The server keeps the receipt
// (functions/cash-core.js lessonCashEntry: cashLedger, `source: "lesson"`, held by the teacher until „Sain kätte”) and
// computes the amount (the card's price for the lesson's subject and length); these helpers only name the lesson, find
// the card's cash setting and build the undo toast. docs/ACCOUNTING.md „Sularaha tunni eest”.
import { lessonCashKey } from '../../services/firebase/financeApi.js';

// the lesson document's id — the same rule as lessons.js accountingLessonId and functions live-auto-mark-core.js
export function lessonCashLessonId(lesson = {}) {
  const { scheduleId, occurrenceDate, studentId } = lessonCashKey(lesson);
  return `schedule_${scheduleId}_${occurrenceDate}_${studentId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 240);
}

// „25”, „25,50”, „25.5 €” → cents; null when it is not a positive amount with at most two decimals (Kassa: fix amount)
export function amountCents(text) {
  const value = String(text ?? '').replace(/\s|€/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const cents = Math.round(Number(value) * 100);
  return cents > 0 && cents <= 10000000 ? cents : null;
}

// cents → „25,00” for an input
export const amountText = (cents) => (Number(cents) > 0 ? (Number(cents) / 100).toFixed(2).replace('.', ',') : '');

// cents → „25 €” / „25,50 €” for a button
export const euroShort = (cents) => {
  const value = (Number(cents) || 0) / 100;
  return `${Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',')} €`;
};

// Cash can be taken for a past 1:1 lesson that took place or is still unmarked, by its own teacher (an admin: any).
// Not on a group row, a cancelled lesson or a notified absence (nothing to pay for).
export function canMarkLessonCash(item = {}, { uid = '', isAdmin = false } = {}) {
  if (!item.studentId || item.isGroup || item.groupLessonId) return false;
  const status = item.record?.status || item.status || 'Planeeritud';
  if (!['Planeeritud', 'Toimunud', 'Puudus_eta'].includes(status)) return false;
  return isAdmin || (Boolean(uid) && item.teacherUid === uid);
}

const sameSubject = (left, right) => String(left || '').trim().toLocaleLowerCase('et') === String(right || '').trim().toLocaleLowerCase('et');

// „Maksab sularahas” (student card, admin): payers = /cash/lesson/mine `payers` (studentId → { all, subjects,
// mainSubject, main: { unitCents, minutes }, prices }). → the lesson's cash in cents, 0 = this lesson is not paid in
// cash. The same rule as functions/cash-core.js paysCashFor + lessonCashPriceCents (the server's amount is the one kept).
export function cashPayerPriceCents(payers = {}, item = {}) {
  const payer = payers?.[item.studentId];
  if (!payer) return 0;
  const subject = String(item.subject || '').trim() || payer.mainSubject || '';
  if (!payer.all && !(payer.subjects || []).some((name) => sameSubject(name, subject))) return 0;
  const key = Object.keys(payer.prices || {}).find((name) => sameSubject(name, subject));
  const price = (key && payer.prices[key]?.unitCents ? payer.prices[key] : payer.main) || {};
  if (!(price.unitCents > 0)) return 0;
  const base = Number(price.minutes) || 60;
  const minutes = Number(item.duration) || base;
  return Math.round(price.unitCents * (minutes / base));
}

export const toimusCashLabel = (cents) => `Toimus · makstud sularahas ${euroShort(cents)}`;

/**
 * The undo toast after „Toimus” (QuickMarkButtons MarkUndoToast). `paidCents` > 0: the lesson was also paid in cash —
 * „Võta tagasi” takes back the cash first (server, same day while the teacher holds it), then the mark. Otherwise the
 * toast offers „Maksis sularahas” (the rare cash payment: the same server call, the same fixed amount), which turns
 * the toast into the paid one.
 * unmark(): removes the lesson's mark; cash: { record(item) → cents, undo(item) } (useLessonCash)
 */
export function toimusUndo({ item, label, unmark, cash, paidCents = 0, offerCash = true }) {
  if (paidCents > 0) {
    return {
      label: `${label} · makstud sularahas ${euroShort(paidCents)}`,
      run: async () => { await cash.undo(item); await unmark(); },
    };
  }
  return {
    label,
    run: unmark,
    ...(offerCash && cash ? {
      ms: 8000,
      action: {
        label: 'Maksis sularahas',
        run: async () => toimusUndo({ item, label, unmark, cash, paidCents: await cash.record(item) }),
      },
    } : {}),
  };
}
