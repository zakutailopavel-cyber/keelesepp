import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { applyErrorReview, dismissalEntry, errorKey, errorTopicKeys, feedbackEntry, withErrorReview } from './errorReview.js';
import { groupRecordings } from './lessonTimeline.js';
import { cardsFromErrors, homeworkFromAnalysis, parentNoteFromAnalysis } from './afterLesson.js';
import { errorsWorksheet } from './errorWorksheet.js';
import { LessonAi } from './TranscriptView.jsx';

const vend = { startMs: 61000, said: 'Mul on kaks vend.', corrected: 'Mul on kaks venda.', kind: 'vorm' };
const poe = { startMs: 90000, said: 'Ma lähen pood.', corrected: 'Ma lähen poodi.', kind: 'vorm', source: 'teacher' };
const order = { startMs: 120000, said: 'Õhtuti ma teen kodutööd.', corrected: 'Õhtuti teen ma kodutööd.', kind: 'sõnajärg' };
const analysis = {
  version: 7, errors: [vend, poe, order],
  focus: [
    { key: 'form', topic: 'Формы слов', count: 2, teacher: 1, examples: [{ said: vend.said, corrected: vend.corrected }, { said: poe.said, corrected: poe.corrected }] },
    { key: 'order', topic: 'Порядок слов', count: 1, teacher: 0, examples: [{ said: order.said, corrected: order.corrected }] },
  ],
};
const mark = (extra = {}) => ({ said: vend.said, corrected: vend.corrected, byUid: 't1', byName: 'Kati', at: '2026-11-04T10:00:00Z', ...extra });

describe('errorReview', () => {
  it('a stable short key per error', () => {
    expect(errorKey(vend)).toBe(errorKey({ ...vend }));
    expect(errorKey(vend)).not.toBe(errorKey({ ...vend, startMs: 61001 }));
    expect(errorKey(vend)).toMatch(/^e[0-9a-z]+$/);
  });

  it('counts the topics like the school Mac', () => {
    expect(errorTopicKeys(vend)).toEqual(['verb']); // „venda” ends like a verb form: the Mac's own heuristic
    expect(errorTopicKeys(order)).toEqual(['order']);
    expect(errorTopicKeys({ said: 'Ma lähen raamatukogu.', corrected: 'Ma lähen raamatukokku.', kind: 'vorm' })).toEqual(['cases']);
  });

  it('leaves dismissed errors out and counts the topics again; an undone mark counts nothing', () => {
    const reviewed = applyErrorReview(analysis, { [errorKey(vend)]: mark() });
    expect(reviewed.errors).toEqual([poe, order]);
    expect(reviewed.dismissedErrors).toHaveLength(1);
    expect(reviewed.dismissedErrors[0]).toMatchObject({ said: vend.said, key: errorKey(vend), review: { byName: 'Kati' } });
    expect(reviewed.focus[0]).toMatchObject({ key: 'form', count: 1, teacher: 1, examples: [{ said: poe.said }] });
    // a topic with nothing left is gone
    const noOrder = applyErrorReview(analysis, { [errorKey(order)]: mark({ said: order.said }) });
    expect(noOrder.focus.map((t) => t.key)).toEqual(['form']);
    expect(applyErrorReview(analysis, { [errorKey(vend)]: mark({ undoneAt: '2026-11-04T11:00:00Z' }) }).errors).toHaveLength(3);
    expect(applyErrorReview(analysis, {}).errors).toHaveLength(3);
  });

  it('applies to every user of the errors: homework, cards, parent note, worksheet, grouped lessons', () => {
    const recording = { id: 'inv_1', invitationId: 'inv', studentId: 's1', startedAt: '2026-11-04T10:00:00Z', status: 'done', transcript: [{ speaker: 'student', text: 'x' }], analysis, errorReview: { [errorKey(vend)]: mark(), [errorKey(poe)]: mark({ said: poe.said }) } };
    const [lesson] = groupRecordings([recording]);
    expect(lesson.analysis.errors).toEqual([order]);
    expect(lesson.analysisRaw).toBe(analysis);
    expect(withErrorReview(lesson)).toBe(lesson);
    expect(cardsFromErrors(lesson.analysis.errors).map((c) => c.word)).toEqual([order.corrected]);
    expect(homeworkFromAnalysis({ analysis: lesson.analysis, recording }).note).not.toContain('vend');
    expect(parentNoteFromAnalysis({ analysis: lesson.analysis })).toContain('parandasime 1 lauset');
    expect(errorsWorksheet({ errors: lesson.analysis.errors }).blocks[0].data.rows).toHaveLength(1);
  });

  it('the mark and the copy for the Mac', () => {
    const entry = dismissalEntry({ error: poe, reason: '  õige vorm ', user: { uid: 't1', displayName: 'Kati' }, at: '2026-11-04T10:00:00Z' });
    expect(entry).toEqual({ said: poe.said, corrected: poe.corrected, kind: 'vorm', source: 'teacher', startMs: 90000, reason: 'õige vorm', byUid: 't1', byName: 'Kati', at: '2026-11-04T10:00:00Z' });
    const copy = feedbackEntry({ entry, recording: { id: 'inv_1', language: 'et' } });
    expect(copy).toEqual({ said: poe.said, corrected: poe.corrected, kind: 'vorm', source: 'teacher', reason: 'õige vorm', byUid: 't1', byName: 'Kati', at: '2026-11-04T10:00:00Z', lang: 'et', recordingId: 'inv_1' });
  });
});

describe('LessonAi: „Pole viga”', () => {
  it('the teacher dismisses an error with a reason and undoes it', async () => {
    const service = {
      dismissError: vi.fn(async ({ error, reason, user }) => ({ key: errorKey(error), entry: dismissalEntry({ error, reason, user, at: '2026-11-04T10:00:00Z' }) })),
      restoreError: vi.fn(async ({ key }) => ({ key, undoneAt: '2026-11-04T11:00:00Z' })),
    };
    const onChanged = vi.fn();
    const recording = { id: 'inv_1', studentId: 's1', analysis };
    const { container } = render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 't1', displayName: 'Kati' } }}>
      <LessonAi analysis={analysis} recording={recording} reviewService={service} onChanged={onChanged} />
    </AuthContext.Provider></MemoryRouter>);
    expect(screen.getByText('Õpilase vead (3)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tee tööleht vigadest \(3\)/ })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Pole viga' })[0]);
    fireEvent.change(screen.getByLabelText('Põhjus (valikuline)'), { target: { value: 'õige vorm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kinnita „Pole viga”' }));
    await screen.findByText('Õpilase vead (2)');
    expect(service.dismissError).toHaveBeenCalledWith(expect.objectContaining({ recording, error: vend, reason: 'õige vorm' }));
    expect(onChanged).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Tee tööleht vigadest \(2\)/ })).toBeInTheDocument();
    const dismissed = container.querySelector('.lesson-ai__dismissed');
    expect(within(dismissed).getByText(/Märgitud „Pole viga” \(1\)/)).toBeInTheDocument();
    expect(within(dismissed).getByText(/Kati · .*„õige vorm”/)).toBeInTheDocument();
    fireEvent.click(within(dismissed).getByRole('button', { name: 'Taasta' }));
    await screen.findByText('Õpilase vead (3)');
    expect(service.restoreError).toHaveBeenCalledWith(expect.objectContaining({ recording, key: errorKey(vend) }));
    await waitFor(() => expect(container.querySelector('.lesson-ai__dismissed')).toBeNull());
  });

  it('without a signed-in user there is no button', () => {
    render(<MemoryRouter><LessonAi analysis={analysis} recording={{ id: 'inv_1' }} reviewService={{ dismissError: vi.fn() }} /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: 'Pole viga' })).toBeNull();
  });
});
