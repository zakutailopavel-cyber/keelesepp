import { act, fireEvent, render, screen } from '@testing-library/react';
import MergeCardsModal from './MergeCardsModal.jsx';
import { nameLikeness } from './duplicateCandidates.js';

const preview = (overrides = {}) => ({
  applied: false,
  keep: { id: 'keep', name: 'Vlad', accounts: [] },
  source: { id: 'self_v', name: 'Влад Повжик', accounts: ['uid-v'] },
  names: ['Vlad', 'Влад Повжик'],
  keepName: 'Vlad',
  move: [
    { collection: 'worksheetAssignments', field: 'studentId', count: 2, kind: 'learner' },
    { collection: 'invoices', field: 'studentId', count: 1, kind: 'finance' },
  ],
  totals: { learner: 2, finance: 1 },
  documents: [{ collection: 'studentAvailability', action: 'copy', label: 'Sobivad ajad' }],
  price: { action: 'none' },
  conflicts: [{ code: 'parents', label: 'Kaartidel on erinevad lapsevanemad — mõlemad jäävad lapsega seotuks' }],
  parents: { accounts: ['p1', 'p2'], contacts: [] },
  skipped: [],
  ...overrides,
});

describe('merge student cards', () => {
  it('finds the same learner across alphabets and spellings', () => {
    expect(nameLikeness('Vlad', 'Влад Повжик')).toBeGreaterThan(0);
    expect(nameLikeness('Uljana Kazak', 'Ulyana Kazak')).toBe(4);
    expect(nameLikeness('Vlad', 'Mari Maasikas')).toBe(0);
  });

  it('previews everything that moves with conflicts, lets the admin pick the kept card and name, merges only after the check', async () => {
    const service = { mergeStudents: vi.fn(async ({ apply, keepId, sourceId }) => ({ ...preview(), applied: Boolean(apply), keep: { id: keepId, name: keepId === 'keep' ? 'Vlad' : 'Влад Повжик', accounts: [] }, source: { id: sourceId, name: sourceId === 'keep' ? 'Vlad' : 'Влад Повжик', accounts: [] } })) };
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'keep', name: 'Vlad' }, { id: 'self_v', name: 'Влад Повжик', linkedUserId: 'uid-v' }, { id: 'x', name: 'Mari' }] }) };
    const onMerged = vi.fn();
    render(<MergeCardsModal open student={{ id: 'keep', name: 'Vlad' }} onClose={() => {}} onMerged={onMerged} service={service} students={students} />);
    const option = await screen.findByRole('radio', { name: /Влад Повжик/ });
    expect(screen.queryByText('Mari')).toBeNull();
    await act(async () => { fireEvent.click(option); });
    expect(service.mergeStudents).toHaveBeenCalledWith({ keepId: 'keep', sourceId: 'self_v' });
    expect(await screen.findByText(/Töölehed: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Arved: 1 \(summad ja numbrid ei muutu\)/)).toBeInTheDocument();
    expect(screen.getByText(/Sobivad ajad: kopeeritakse/)).toBeInTheDocument();
    expect(screen.getByText(/erinevad lapsevanemad/)).toBeInTheDocument();
    const mergeButton = screen.getByRole('button', { name: 'Liida kaardid' });
    expect(mergeButton).toBeDisabled();
    // the other card stays, with its name
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: /teine kaart/ })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'self_v', sourceId: 'keep' });
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: 'Влад Повжик' })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'self_v', sourceId: 'keep', keepName: 'Влад Повжик' });
    fireEvent.click(await screen.findByRole('checkbox', { name: /Kontrollisin eelvaadet/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Liida kaardid' })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'self_v', sourceId: 'keep', keepName: 'Влад Повжик', apply: true, confirmed: true });
    expect(onMerged).toHaveBeenCalledWith(expect.objectContaining({ keepId: 'self_v', sourceId: 'keep' }));
  });

  it('opens straight on a proposed pair and shows the subject the other card brings', async () => {
    const service = { mergeStudents: vi.fn(async () => preview({ names: ['Milan'], keepName: 'Milan', conflicts: [], subjects: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Matemaatika', teacher: 'Yelyzaveta' }], addedSubjects: [{ subject: 'Matemaatika', teacher: 'Yelyzaveta' }], price: { action: 'addSubjectPrice', subject: 'Matemaatika', sourceCents: 2500 } })) };
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'keep', name: 'Milan' }, { id: 'math', name: 'Milan' }] }) };
    render(<MergeCardsModal open initialSourceId="math" student={{ id: 'keep', name: 'Milan' }} onClose={() => {}} onMerged={() => {}} service={service} students={students} />);
    expect(await screen.findByText(/uus õppesuund/)).toHaveTextContent('Matemaatika — Yelyzaveta');
    expect(screen.queryByRole('radiogroup', { name: 'Teine kaart' })).toBeNull();
    expect(screen.getByText(/Matemaatika 25,00 € lisatakse aine hinnaks/)).toBeInTheDocument();
    expect(screen.getByText(/Pärast liitmist on kaardil õppesuunad/)).toHaveTextContent('Eesti keel (Pavel), Matemaatika (Yelyzaveta)');
  });
});
