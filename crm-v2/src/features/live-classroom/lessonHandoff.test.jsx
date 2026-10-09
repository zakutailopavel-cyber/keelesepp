import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LessonEndPanel from './LessonEndPanel.jsx';
import { handoffTopic, saveLessonHandoff, takeLessonHandoff, unfinishedSheets } from './lessonHandoff.js';

const memory = () => { const data = {}; return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } }; };
const KEY = 'sched-1:2026-10-09|2026-10-09';

describe('lesson handoff', () => {
  it('is used once, only for a valid lesson key and only while fresh', () => {
    const store = memory();
    saveLessonHandoff(KEY, { notes: '  Tubli! ', lessonIds: ['a', 'a', '', 'b'] }, store, 1000);
    saveLessonHandoff('bogus', { notes: 'x' }, store, 1000);
    expect(takeLessonHandoff('bogus', store, 1000)).toBeNull();
    expect(takeLessonHandoff(KEY, store, 2000)).toEqual({ notes: 'Tubli!', lessonIds: ['a', 'b'], savedAt: 1000 });
    expect(takeLessonHandoff(KEY, store, 2000)).toBeNull();
    saveLessonHandoff(KEY, {}, store, 0);
    expect(takeLessonHandoff(KEY, store, 13 * 3600 * 1000)).toBeNull();
  });

  it('takes the topic from the first worksheet in the catalogue, else the suggestion', () => {
    const catalog = { byId: new Map([['b', { id: 'b', title: 'B' }]]) };
    expect(handoffTopic(catalog, { lessonIds: ['x', 'b'] }, { id: 's' }).id).toBe('b');
    expect(handoffTopic(catalog, { lessonIds: ['x'] }, { id: 's' }).id).toBe('s');
    expect(handoffTopic(null, null, null)).toBeNull();
    expect(unfinishedSheets([{ id: 1, status: 'done' }, { id: 2, status: 'in_progress' }, { id: 3, completedAt: 'x' }]).map((s) => s.id)).toEqual([2]);
  });
});

describe('LessonEndPanel: closing the lesson', () => {
  const invitation = { id: 'inv-1', studentId: 's1', studentName: 'Mari' };
  const base = (extra = {}) => ({
    invitation, user: { uid: 't1' }, onEnd: vi.fn(),
    summaryService: { save: vi.fn(async () => ({})) },
    wordsService: { subscribeForStudent: vi.fn(() => () => {}) },
    homeworkService: { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn(async ({ task, worksheet }) => ({ id: 'h1', task, worksheetAssignmentId: worksheet.id })) },
    saveHandoff: vi.fn(),
    ...extra,
  });

  it('gives an unfinished worksheet as homework and hands the note and topics to the calendar', async () => {
    const props = base({ lessonKey: KEY, sheets: [{ id: 'w1', title: 'Minu päev', status: 'in_progress', lessonId: 'b1-1' }, { id: 'w2', title: 'Sagedus', status: 'done', lessonId: 'b1-2' }] });
    render(<LessonEndPanel {...props} />);
    expect(screen.getByText('Esitatud')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Anna kodutööks' }));
    await waitFor(() => expect(props.homeworkService.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({ task: 'Lõpeta tööleht „Minu päev”', worksheet: { id: 'w1', title: 'Minu päev' }, due: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })));
    expect(await screen.findByText('Kodutööks antud ✓')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Märgi tund kalendris toimunuks/ })).toBeChecked();
    fireEvent.change(screen.getByLabelText(/Sõnum õpilasele/), { target: { value: 'Tubli!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada kokkuvõte ja lõpeta tund' }));
    await waitFor(() => expect(props.onEnd).toHaveBeenCalled());
    expect(props.saveHandoff).toHaveBeenCalledWith(KEY, { notes: 'Tubli!', lessonIds: ['b1-1', 'b1-2'] });
  });

  it('does not mark the lesson when the teacher unticks it or the room did not start from the calendar', async () => {
    const props = base({ lessonKey: KEY });
    const { unmount } = render(<LessonEndPanel {...props} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Märgi tund kalendris toimunuks/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    expect(props.onEnd).toHaveBeenCalled();
    expect(props.saveHandoff).not.toHaveBeenCalled();
    unmount();
    const loose = base({ lessonKey: '' });
    render(<LessonEndPanel {...loose} />);
    expect(screen.getByText(/märgi see kalendris ise/)).toBeInTheDocument();
  });
});
