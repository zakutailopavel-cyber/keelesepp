import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LessonCashButton from './LessonCashButton.jsx';
import { amountCents, canMarkLessonCash, lessonCashLessonId } from './lessonCash.js';
import { heldByOthers, isLessonCash, lessonLine, openReceipts } from './cashModel.js';

// „Makstud sularahas” (owner 2026-11-10; test data only)
const item = { id: 'sch-1', occurrenceId: 'sch-1|2026-11-09', occurrenceDate: '2026-11-09', studentId: 'stu-1', studentName: 'Test Õpilane', teacherUid: 't1', time: '16:00', status: 'Planeeritud' };

describe('lessonCash helpers', () => {
  it('names the lesson like the lesson document and reads amounts', () => {
    expect(lessonCashLessonId(item)).toBe('schedule_sch-1_2026-11-09_stu-1');
    expect(lessonCashLessonId({ scheduleId: 'sch-1', date: '2026-11-09', studentId: 'stu-1', id: 'lesson-doc' })).toBe('schedule_sch-1_2026-11-09_stu-1');
    expect(amountCents('25')).toBe(2500);
    expect(amountCents('25,5 €')).toBe(2550);
    expect(amountCents('0')).toBeNull();
    expect(amountCents('1,005')).toBeNull();
  });

  it('the button is for the lesson’s own teacher (an admin: any), 1:1, held or unmarked', () => {
    expect(canMarkLessonCash(item, { uid: 't1' })).toBe(true);
    expect(canMarkLessonCash(item, { uid: 't2' })).toBe(false);
    expect(canMarkLessonCash(item, { uid: 'a1', isAdmin: true })).toBe(true);
    expect(canMarkLessonCash({ ...item, isGroup: true }, { uid: 't1' })).toBe(false);
    expect(canMarkLessonCash({ ...item, record: { status: 'Puudus_p' } }, { uid: 't1' })).toBe(false);
    expect(canMarkLessonCash({ ...item, status: 'Tühistatud' }, { uid: 't1' })).toBe(false);
    expect(canMarkLessonCash({ ...item, record: { status: 'Toimunud' } }, { uid: 't1' })).toBe(true);
  });

  it('lesson cash is never an invoice to-do in Kassa; the admin sees who holds cash', () => {
    const lessonReceipt = { type: 'receipt', source: 'lesson', status: 'open', occurrenceDate: '2026-11-09', lessonTime: '16:00', subject: 'Eesti keel' };
    expect(isLessonCash(lessonReceipt)).toBe(true);
    expect(openReceipts([lessonReceipt, { type: 'receipt', status: 'open' }])).toHaveLength(1);
    expect(lessonLine(lessonReceipt)).toBe('tund 9.11 kell 16:00 · Eesti keel');
    expect(heldByOthers([{ uid: 'a1', cents: 900 }, { uid: 't1', cents: 2500 }, { uid: 't2', cents: 0 }, { uid: 't3', cents: 4000 }], 'a1').map((row) => row.uid)).toEqual(['t3', 't1']);
  });
});

describe('LessonCashButton', () => {
  it('opens with the lesson price, saves the cash and marks the lesson held', async () => {
    const api = {
      lessonCashInfo: vi.fn().mockResolvedValue({ priceCents: 3600, mark: null }),
      recordLessonCash: vi.fn().mockResolvedValue({ entry: { id: 'lessoncash_x', amountCents: 3000, status: 'open', receivedAt: '2026-11-10' } }),
    };
    const onChanged = vi.fn();
    const alsoMark = vi.fn().mockResolvedValue({});
    render(<LessonCashButton item={item} api={api} onChanged={onChanged} alsoMark={alsoMark} />);
    fireEvent.click(screen.getByRole('button', { name: 'Makstud sularahas: Test Õpilane' }));
    const amount = await screen.findByLabelText('Summa (€)');
    await waitFor(() => expect(amount).toHaveValue('36,00'));
    expect(api.lessonCashInfo).toHaveBeenCalledWith(item);
    expect(screen.getByText('Tunni hind: 36,00 €')).toBeInTheDocument();
    fireEvent.change(amount, { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Märkus (valikuline)'), { target: { value: 'ema maksis' } });
    expect(screen.getByLabelText(/Tund toimus/)).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Märgi makstuks' }));
    await waitFor(() => expect(api.recordLessonCash).toHaveBeenCalledWith(item, { amount: '30.00', note: 'ema maksis' }));
    await waitFor(() => expect(alsoMark).toHaveBeenCalledWith(item, 'Toimunud'));
    expect(onChanged).toHaveBeenCalledWith('schedule_sch-1_2026-11-09_stu-1', expect.objectContaining({ amountCents: 3000, canUndo: true }));
  });

  it('refuses an empty amount; the server’s refusal is shown', async () => {
    const api = { lessonCashInfo: vi.fn().mockResolvedValue({ priceCents: 0 }), recordLessonCash: vi.fn().mockRejectedValue(new Error('See ei ole sinu tund.')) };
    render(<LessonCashButton item={item} api={api} />);
    fireEvent.click(screen.getByRole('button', { name: /Makstud sularahas/ }));
    expect(await screen.findByText('Tunni hinda ei leitud — kirjuta summa.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Märgi makstuks' }));
    expect(api.recordLessonCash).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Summa (€)'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Märgi makstuks' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('See ei ole sinu tund.');
  });

  it('a marked lesson shows the sum; the teacher takes it back the same day', async () => {
    const api = { undoLessonCash: vi.fn().mockResolvedValue({}) };
    const onChanged = vi.fn();
    render(<LessonCashButton item={item} api={api} onChanged={onChanged} mark={{ id: 'lc', amountCents: 2500, status: 'open', receivedAt: '2026-11-10', canUndo: true }} />);
    fireEvent.click(screen.getByRole('button', { name: /^Makstud sularahas: Test Õpilane, 25,00/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Võta tagasi/ }));
    await waitFor(() => expect(api.undoLessonCash).toHaveBeenCalledWith(item));
    expect(onChanged).toHaveBeenCalledWith('schedule_sch-1_2026-11-09_stu-1', null);
  });

  it('after the hand-over there is no undo for the teacher', async () => {
    render(<LessonCashButton item={item} api={{}} mark={{ id: 'lc', amountCents: 2500, status: 'open', receivedAt: '2026-11-09', canUndo: false }} />);
    fireEvent.click(screen.getByRole('button', { name: /Makstud sularahas/ }));
    expect(await screen.findByText(/Märget saab muuta ainult admin/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Võta tagasi/ })).toBeNull();
  });
});
