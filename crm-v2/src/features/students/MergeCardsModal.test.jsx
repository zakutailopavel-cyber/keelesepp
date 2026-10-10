import { act, fireEvent, render, screen } from '@testing-library/react';
import MergeCardsModal, { nameLikeness } from './MergeCardsModal.jsx';

describe('merge student cards', () => {
  it('finds the same learner across alphabets and spellings', () => {
    expect(nameLikeness('Vlad', 'Влад Повжик')).toBeGreaterThan(0);
    expect(nameLikeness('Uljana Kazak', 'Ulyana Kazak')).toBe(4);
    expect(nameLikeness('Vlad', 'Mari Maasikas')).toBe(0);
  });

  it('previews what moves, asks about finance, then merges into this card', async () => {
    const service = {
      mergeStudents: vi.fn(async ({ apply }) => ({
        applied: Boolean(apply), source: { accounts: ['uid-v'] }, move: [{ collection: 'worksheetAssignments', field: 'studentId', count: 2, kind: 'learner' }],
        waiting: [{ collection: 'invoices', field: 'studentId', count: 1, kind: 'finance' }], skipped: [],
      })),
    };
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'keep', name: 'Vlad' }, { id: 'self_v', name: 'Влад Повжик', linkedUserId: 'uid-v' }, { id: 'x', name: 'Mari' }] }) };
    const onMerged = vi.fn();
    render(<MergeCardsModal open student={{ id: 'keep', name: 'Vlad' }} onClose={() => {}} onMerged={onMerged} service={service} students={students} />);
    const option = await screen.findByRole('radio');
    expect(screen.getByText('Влад Повжик')).toBeInTheDocument();
    expect(screen.queryByText('Mari')).toBeNull();
    await act(async () => { fireEvent.click(option); });
    expect(service.mergeStudents).toHaveBeenCalledWith({ keepId: 'keep', sourceId: 'self_v' });
    expect(screen.getByText(/worksheetAssignments: 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Tõsta ka finantsid/));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Liida „Влад Повжик”/ })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'keep', sourceId: 'self_v', apply: true, includeFinance: true, includeSchedule: false });
    expect(onMerged).toHaveBeenCalled();
  });
});
