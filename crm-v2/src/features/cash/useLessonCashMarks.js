import { useCallback, useEffect, useMemo, useState } from 'react';
import { announceCashBoxChange } from '../../services/firebase/cashBox.js';
import { cashPayerPriceCents, lessonCashLessonId } from './lessonCash.js';

// Cash at the lesson for the marking screens (owner 2026-11-11: one flow with „Toimus”). Server-side
// (/cash/lesson/mine): `marks` — the actor's own lesson-cash marks (lessonId → mark; an admin every one) and `payers` —
// the „Maksab sularahas” cards the actor teaches, with their price. A failed read leaves both empty: „Toimus” is then
// the plain one and the toast still offers „Maksis sularahas”.
// → { marks, priceFor(item) (0 = not a cash payer), record(item) → cents, undo(item) }
export function useLessonCash(api, enabled = true) {
  const [state, setState] = useState({ marks: {}, payers: {} });
  useEffect(() => {
    if (!enabled || !api?.lessonCashMine) return undefined;
    let alive = true;
    Promise.resolve()
      .then(() => api.lessonCashMine())
      .then((result) => { if (alive) setState({ marks: result?.marks || {}, payers: result?.payers || {} }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [api, enabled]);
  const setMark = useCallback((lessonId, mark) => setState((current) => {
    const marks = { ...current.marks };
    if (mark) marks[lessonId] = mark; else delete marks[lessonId];
    return { ...current, marks };
  }), []);
  const priceFor = useCallback((item) => cashPayerPriceCents(state.payers, item), [state.payers]);
  const record = useCallback(async (item) => {
    const result = await api.recordLessonCash(item);
    const entry = result?.entry || {};
    setMark(lessonCashLessonId(item), { id: entry.id, amountCents: entry.amountCents, status: entry.status || 'open', receivedAt: entry.receivedAt, canUndo: true });
    announceCashBoxChange();
    return Number(entry.amountCents) || 0;
  }, [api, setMark]);
  const undo = useCallback(async (item) => {
    await api.undoLessonCash(item);
    setMark(lessonCashLessonId(item), null);
    announceCashBoxChange();
  }, [api, setMark]);
  return useMemo(() => ({ marks: state.marks, priceFor, record, undo }), [state.marks, priceFor, record, undo]);
}
