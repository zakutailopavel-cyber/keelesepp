import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { amountCents, canMarkLessonCash, cashPayerPriceCents, euroShort, lessonCashLessonId, toimusCashLabel, toimusUndo } from './lessonCash.js';
import { heldByOthers, isLessonCash, lessonLine, openReceipts } from './cashModel.js';
import QuickMarkButtons, { MarkUndoToast } from '../calendar/QuickMarkButtons.jsx';

// cash at the lesson (owner 2026-11-10 / 2026-11-11: one flow with „Toimus”; test data only)
const item = { id: 'sch-1', occurrenceId: 'sch-1|2026-11-09', occurrenceDate: '2026-11-09', studentId: 'stu-1', studentName: 'Test Õpilane', teacherUid: 't1', time: '16:00', status: 'Planeeritud', subject: 'Eesti keel', duration: 60 };
const payers = {
  'stu-1': { all: true, subjects: [], mainSubject: 'Eesti keel', main: { unitCents: 2500, minutes: 60 }, prices: { Matemaatika: { unitCents: 3000, minutes: 45 } } },
  'stu-2': { all: false, subjects: ['Inglise keel'], mainSubject: 'Eesti keel', main: { unitCents: 2000, minutes: 60 }, prices: {} },
};

describe('lessonCash helpers', () => {
  it('names the lesson like the lesson document and reads amounts', () => {
    expect(lessonCashLessonId(item)).toBe('schedule_sch-1_2026-11-09_stu-1');
    expect(lessonCashLessonId({ scheduleId: 'sch-1', date: '2026-11-09', studentId: 'stu-1', id: 'lesson-doc' })).toBe('schedule_sch-1_2026-11-09_stu-1');
    expect(amountCents('25')).toBe(2500);
    expect(amountCents('25,5 €')).toBe(2550);
    expect(amountCents('0')).toBeNull();
    expect(amountCents('1,005')).toBeNull();
    expect(euroShort(2500)).toBe('25 €');
    expect(euroShort(2550)).toBe('25,50 €');
    expect(toimusCashLabel(2500)).toBe('Toimus · makstud sularahas 25 €');
  });

  it('cash is for the lesson’s own teacher (an admin: any), 1:1, held or unmarked', () => {
    expect(canMarkLessonCash(item, { uid: 't1' })).toBe(true);
    expect(canMarkLessonCash(item, { uid: 't2' })).toBe(false);
    expect(canMarkLessonCash(item, { uid: 'a1', isAdmin: true })).toBe(true);
    expect(canMarkLessonCash({ ...item, isGroup: true }, { uid: 't1' })).toBe(false);
    expect(canMarkLessonCash({ ...item, record: { status: 'Puudus_p' } }, { uid: 't1' })).toBe(false);
    expect(canMarkLessonCash({ ...item, status: 'Tühistatud' }, { uid: 't1' })).toBe(false);
  });

  it('„Maksab sularahas”: the card’s subject decides; the price follows the subject and the length (server rule)', () => {
    expect(cashPayerPriceCents(payers, item)).toBe(2500);
    expect(cashPayerPriceCents(payers, { ...item, duration: 90 })).toBe(3750);
    expect(cashPayerPriceCents(payers, { ...item, subject: 'matemaatika', duration: 45 })).toBe(3000);
    expect(cashPayerPriceCents(payers, { ...item, subject: '' })).toBe(2500);
    expect(cashPayerPriceCents(payers, { ...item, studentId: 'stu-2' })).toBe(0);
    expect(cashPayerPriceCents(payers, { ...item, studentId: 'stu-2', subject: 'Inglise keel' })).toBe(2000);
    expect(cashPayerPriceCents(payers, { ...item, studentId: 'stu-9' })).toBe(0);
    expect(cashPayerPriceCents({}, item)).toBe(0);
  });

  it('lesson cash is never an invoice to-do in Kassa; the admin sees who holds cash', () => {
    const lessonReceipt = { type: 'receipt', source: 'lesson', status: 'open', occurrenceDate: '2026-11-09', lessonTime: '16:00', subject: 'Eesti keel' };
    expect(isLessonCash(lessonReceipt)).toBe(true);
    expect(openReceipts([lessonReceipt, { type: 'receipt', status: 'open' }])).toHaveLength(1);
    expect(lessonLine(lessonReceipt)).toBe('tund 9.11 kell 16:00 · Eesti keel');
    expect(heldByOthers([{ uid: 'a1', cents: 900 }, { uid: 't1', cents: 2500 }, { uid: 't2', cents: 0 }, { uid: 't3', cents: 4000 }], 'a1').map((row) => row.uid)).toEqual(['t3', 't1']);
  });
});

describe('Toimus with cash', () => {
  it('a cash-paying card’s button reads „Toimus · makstud sularahas 25 €”; others stay „Toimus ✓”', () => {
    const onMark = vi.fn();
    const { rerender } = render(<QuickMarkButtons item={item} onMark={onMark} cashCents={2500} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toimus · makstud sularahas 25 €: Test Õpilane' }));
    expect(onMark).toHaveBeenCalledWith(item, 'Toimunud');
    rerender(<QuickMarkButtons item={item} onMark={onMark} />);
    expect(screen.getByRole('button', { name: 'Toimus: Test Õpilane' })).toHaveTextContent('Toimus ✓');
    expect(screen.queryByText(/Sularahas/)).toBeNull();
  });

  it('paid toast: „Võta tagasi” takes back the cash first, then the mark', async () => {
    const calls = [];
    const cash = { record: vi.fn(), undo: vi.fn(async () => { calls.push('cash'); }) };
    const unmark = vi.fn(async () => { calls.push('mark'); });
    const undo = toimusUndo({ item, label: 'Test Õpilane: Toimus', unmark, cash, paidCents: 2500 });
    expect(undo.label).toBe('Test Õpilane: Toimus · makstud sularahas 25 €');
    expect(undo.action).toBeUndefined();
    await undo.run();
    expect(calls).toEqual(['cash', 'mark']);
  });

  it('plain toast offers „Maksis sularahas” (same server call, fixed amount); then the toast is the paid one', async () => {
    const cash = { record: vi.fn().mockResolvedValue(2500), undo: vi.fn().mockResolvedValue() };
    const unmark = vi.fn().mockResolvedValue();
    const onReplace = vi.fn();
    const onClose = vi.fn();
    const undo = toimusUndo({ item, label: 'Test Õpilane: Toimus', unmark, cash });
    render(<MarkUndoToast undo={undo} onClose={onClose} onReplace={onReplace} />);
    fireEvent.click(screen.getByRole('button', { name: /Maksis sularahas/ }));
    await waitFor(() => expect(onReplace).toHaveBeenCalled());
    expect(cash.record).toHaveBeenCalledWith(item);
    const next = onReplace.mock.calls[0][0];
    expect(next.label).toBe('Test Õpilane: Toimus · makstud sularahas 25 €');
    await next.run();
    expect(cash.undo).toHaveBeenCalledWith(item);
    expect(unmark).toHaveBeenCalled();
    expect(toimusUndo({ item, label: 'x', unmark, cash, offerCash: false }).action).toBeUndefined();
  });
});
