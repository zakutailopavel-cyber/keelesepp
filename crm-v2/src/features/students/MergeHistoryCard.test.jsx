import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import MergeHistoryCard from './MergeHistoryCard.jsx';
import { UNMERGE_LEGACY_HINT, canUnmerge, unmergeMessage } from './mergeHistory.js';

const preview = {
  applied: false,
  keep: { id: 'est', name: 'Stefania' },
  source: { id: 'mat', name: 'Stefania' },
  revert: { lessons: 12, schedule: 1, invoices: 2 },
  accounts: 1,
  conflicts: [{ path: 'lessons/l1', fields: ['studentName'] }],
  keepFields: { restored: ['enrollments'], changedSince: [] },
  copies: [{ collection: 'studentAvailability', label: 'Sobivad ajad' }],
};

describe('„Võta ühendamine tagasi”', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('a merge with its record can be reversed; an old one cannot', () => {
    expect(canUnmerge({ mergeUndoVersion: 1, mergedInto: 'est' }, 'est')).toBe(true);
    expect(canUnmerge({ mergedInto: 'est' }, 'est')).toBe(false);
    expect(canUnmerge({ mergeUndoVersion: 1, mergedInto: 'other' }, 'est')).toBe(false);
    const text = unmergeMessage(preview);
    expect(text).toMatch(/tunnid 12, tunniplaan 1, arved 2/);
    expect(text).toMatch(/1 kirjet on pärast ühendamist muudetud/);
    expect(text).toMatch(/Sobivad ajad/);
    expect(text).toMatch(/Midagi ei kustutata/);
  });

  it('on the kept card: lists merged cards; asks, then reverses; an old merge shows the button disabled with the hint', async () => {
    const students = { getById: vi.fn(async (id) => (id === 'mat'
      ? { id: 'mat', name: 'Stefania', mergedInto: 'est', mergeUndoVersion: 1, mergedAt: '2026-11-09T09:00:00.000Z' }
      : { id: 'old', name: 'Eva', mergedInto: 'est' })) };
    const service = { unmergeStudents: vi.fn(async ({ apply }) => ({ ...preview, applied: Boolean(apply) })) };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const onUnmerged = vi.fn();
    render(<MergeHistoryCard student={{ id: 'est', name: 'Stefania', mergedStudentIds: ['mat', 'old'] }} students={students} service={service} onUnmerged={onUnmerged} />);
    expect(await screen.findByText(/„Eva” on liidetud sellesse kaarti/)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: /Võta ühendamine tagasi/ });
    expect(buttons).toHaveLength(2);
    expect(buttons[1]).toBeDisabled();
    expect(screen.getByText(UNMERGE_LEGACY_HINT)).toBeInTheDocument();
    await act(async () => { fireEvent.click(buttons[0]); });
    expect(service.unmergeStudents).toHaveBeenNthCalledWith(1, { sourceId: 'mat' });
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/saavad jälle kaheks eraldi kaardiks/));
    expect(service.unmergeStudents).toHaveBeenLastCalledWith({ sourceId: 'mat', apply: true, confirmed: true });
    expect(onUnmerged).toHaveBeenCalledWith(expect.objectContaining({ sourceId: 'mat', applied: true }));
    expect(screen.getByText(/Ühendamine on tagasi võetud/)).toBeInTheDocument();
  });

  it('on the merged-away card; cancelling the question writes nothing', async () => {
    const service = { unmergeStudents: vi.fn(async () => preview) };
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render(<MergeHistoryCard student={{ id: 'mat', name: 'Stefania', mergedInto: 'est', mergedIntoStudentName: 'Stefania (Eesti keel)', mergeUndoVersion: 1 }} students={{ getById: vi.fn() }} service={service} />);
    expect(screen.getByText(/See kaart on liidetud kaardiga „Stefania \(Eesti keel\)”/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Võta ühendamine tagasi/ })); });
    expect(service.unmergeStudents).toHaveBeenCalledTimes(1);
  });

  it('nothing for a card that was never merged', () => {
    const { container } = render(<MergeHistoryCard student={{ id: 'x', name: 'Mari' }} students={{ getById: vi.fn() }} service={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
