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

  it('an archived card is a candidate and merges; the state after the merge is shown and can be chosen', async () => {
    const service = { mergeStudents: vi.fn(async ({ keepActive }) => preview({
      names: ['Mia'], keepName: 'Mia', keep: { id: 'keep', name: 'Mia', active: true, accounts: [] }, source: { id: 'old', name: 'Mia', active: false, accounts: [] },
      activeAfter: keepActive ?? true,
      conflicts: [{ code: 'archived_source', label: '„Mia” on arhiveeritud — tunnid, arved, maksed ja ajalugu tulevad üle, tema õppesuunad märgitakse „Lõpetanud”' }],
    })) };
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'keep', name: 'Mia' }, { id: 'old', name: 'Mia', active: false }] }) };
    const onMerged = vi.fn();
    render(<MergeCardsModal open student={{ id: 'keep', name: 'Mia', active: true }} onClose={() => {}} onMerged={onMerged} service={service} students={students} />);
    const option = await screen.findByRole('radio', { name: /Mia.*arhiveeritud/ });
    await act(async () => { fireEvent.click(option); });
    expect(service.mergeStudents).toHaveBeenCalledWith({ keepId: 'keep', sourceId: 'old' });
    expect(await screen.findByText(/on arhiveeritud — tunnid, arved/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Aktiivne' })).toBeChecked();
    // the administrator may keep the merged card archived
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: 'Arhiveeritud' })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'keep', sourceId: 'old', keepActive: false });
    expect(await screen.findByRole('radio', { name: 'Arhiveeritud' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: /Kontrollisin eelvaadet/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Liida kaardid' })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'keep', sourceId: 'old', keepActive: false, apply: true, confirmed: true });
    expect(onMerged).toHaveBeenCalled();
  });

  it('on an ARCHIVED card: the search finds archived and active cards by name, old name, e-mail, phone or parent; the archived card can be the one kept', async () => {
    const service = { mergeStudents: vi.fn(async ({ keepId, sourceId }) => preview({
      names: ['Mia Saar'], keepName: 'Mia Saar', conflicts: [], activeAfter: false,
      keep: { id: keepId, name: 'Mia Saar', active: false, accounts: [] }, source: { id: sourceId, name: 'Mia Saar', active: false, accounts: [] },
    })) };
    const students = { list: vi.fn().mockResolvedValue({ items: [
      { id: 'here', name: 'Mia Saar', active: false },
      { id: 'old2', name: 'M. Saar', active: false, phone: '+372 5551 2345' },
      { id: 'alias', name: 'Kask', nameAliases: ['Mia Kask'], active: false },
      { id: 'mail', name: 'Lapsevanema kaart', parentEmail: 'ema@example.com', active: false },
      { id: 'act', name: 'Mia', active: true },
      { id: 'bin', name: 'Mia Saar', active: false, deletedAt: '2026-11-05T10:00:00.000Z' },
    ] }) };
    render(<MergeCardsModal open student={{ id: 'here', name: 'Mia Saar', active: false }} onClose={() => {}} onMerged={() => {}} service={service} students={students} />);
    // without a search: similar names, active and archived; a card in the trash is never offered
    await screen.findByRole('radio', { name: /M\. Saar.*arhiveeritud/ });
    const offered = () => screen.getAllByRole('radio').map((r) => r.closest('label').querySelector('strong').textContent);
    expect(offered().sort()).toEqual(['Kask', 'M. Saar', 'Mia']); // „Kask” by its earlier name „Mia Kask”
    const search = screen.getByRole('textbox', { name: 'Otsi kaarti' });
    fireEvent.change(search, { target: { value: '5551 2345' } });
    expect(offered()).toEqual(['M. Saar']);
    fireEvent.change(search, { target: { value: 'mia kask' } });
    expect(screen.getByRole('radio', { name: /Kask/ })).toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'ema@example' } });
    expect(screen.getByRole('radio', { name: /Lapsevanema kaart/ })).toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'Mia Saar' } });
    expect(screen.queryByRole('radio', { name: /Mia Saar/ })).toBeNull();
    expect(screen.getByText(/prügikastis olevaid kaarte liita ei saa/)).toBeInTheDocument();
    // archived + archived: keep this (archived) card, then the other one
    fireEvent.change(search, { target: { value: '5551' } });
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: /M\. Saar/ })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'here', sourceId: 'old2' });
    expect(await screen.findByRole('radio', { name: 'Arhiveeritud' })).toBeChecked();
    await act(async () => { fireEvent.click(screen.getByRole('radio', { name: /teine kaart · arhiveeritud/ })); });
    expect(service.mergeStudents).toHaveBeenLastCalledWith({ keepId: 'old2', sourceId: 'here' });
  });

  it('no archive choice when both cards are active', async () => {
    const service = { mergeStudents: vi.fn(async () => preview({ keep: { id: 'keep', name: 'Vlad', active: true, accounts: [] }, source: { id: 'self_v', name: 'Влад Повжик', active: true, accounts: [] }, activeAfter: true })) };
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'keep', name: 'Vlad' }, { id: 'self_v', name: 'Влад Повжик' }] }) };
    render(<MergeCardsModal open initialSourceId="self_v" student={{ id: 'keep', name: 'Vlad' }} onClose={() => {}} onMerged={() => {}} service={service} students={students} />);
    expect(await screen.findByText(/Töölehed: 2/)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Arhiveeritud' })).toBeNull();
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
