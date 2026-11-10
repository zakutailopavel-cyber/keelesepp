import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import Sheet from './engine/Sheet.jsx';
import AnswerKeyView from './AnswerKeyView.jsx';
import LiveWorksheetPage from './LiveWorksheetPage.jsx';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { AuthContext } from '../../app/AuthContext.jsx';
import { SCHEMA } from './engine/schema.js';
import { transcriptAccess, transcriptLines } from './engine/transcript.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const TRANSCRIPT = ['Grete: Tere, Sofia! Mul on väga kiire nädal.', 'Grete: Esmaspäeval käin ma võrkpallitrennis.', 'Sofia: Tore! Ma tulen ka.'].join('\n');
const listening = (id, extra = {}) => ({ id, type: 'listening', width: 'half', tone: 'sky', data: { title: 'Grete häälsõnum.', instruction: 'Kuula ja kirjuta.', audio: { src: 'https://example.invalid/grete.mp3' }, sentences: 'Grete käib [võrkpallitrennis].', transcript: TRANSCRIPT, ...extra } });
const docOf = (...blocks) => ({ schema: SCHEMA, id: 'd', meta: { title: 'Hobid' }, blocks });
const doc = docOf(listening('L'));

// the drawn page (the hidden measuring copy repeats every card)
const page = (container) => container.querySelector('.ws-page');
const showButton = () => screen.queryByRole('button', { name: 'Näita teksti' });
const region = () => screen.queryByRole('region', { name: 'Kuulamise tekst' });

describe('transcript model', () => {
  it('reads the speaker once per turn', () => {
    expect(transcriptLines(TRANSCRIPT)).toEqual([
      { speaker: 'Grete', text: 'Tere, Sofia! Mul on väga kiire nädal.', first: true },
      { speaker: 'Grete', text: 'Esmaspäeval käin ma võrkpallitrennis.', first: false },
      { speaker: 'Sofia', text: 'Tore! Ma tulen ka.', first: true },
    ]);
    // a plain sentence with a colon later on, a time and an empty line are no speakers
    expect(transcriptLines('Kell 7: äratus.\n\nTartus avatakse raamatukogu: uus maja.').map((l) => l.speaker)).toEqual(['', '']);
  });

  it('who may open the text', () => {
    expect(transcriptAccess({ role: 'staff' }).can).toBe(true);
    expect(transcriptAccess({ role: '' }).can).toBe(false);
    expect(transcriptAccess({ role: 'student', check: true })).toEqual({ can: false, why: 'check-first' });
    expect(transcriptAccess({ role: 'student', check: true, audioEnded: true }).can).toBe(false);
    expect(transcriptAccess({ role: 'student', check: true, submitted: true })).toEqual({ can: true, why: 'checked' });
    expect(transcriptAccess({ role: 'student', check: true, answersShown: true })).toEqual({ can: true, why: 'checked' });
    expect(transcriptAccess({ role: 'student', check: true, revealed: true })).toEqual({ can: true, why: 'teacher' });
    expect(transcriptAccess({ role: 'student', check: false })).toEqual({ can: false, why: 'listen-first' });
    expect(transcriptAccess({ role: 'student', check: false, audioEnded: true })).toEqual({ can: true, why: 'listened' });
  });
});

describe('listening task: the text', () => {
  it('without a viewer role (thumbnails, edit) only the player is shown', () => {
    render(<Sheet doc={doc} mode="interactive" />);
    expect(showButton()).toBeNull();
    render(<Sheet doc={doc} mode="edit" transcripts={{ role: 'staff' }} />);
    expect(showButton()).toBeNull();
  });

  it('staff open and close it; the speaker is bold once per turn', () => {
    const { container } = render(<Sheet doc={doc} mode="review" transcripts={{ role: 'staff' }} />);
    const button = showButton();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(region()).toBeNull();
    fireEvent.click(button);
    const text = region();
    expect(screen.getByRole('button', { name: 'Peida tekst' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Peida tekst' }).getAttribute('aria-controls')).toBe(text.id);
    expect([...page(container).querySelectorAll('.ws-script-line b')].map((b) => b.textContent)).toEqual(['Grete:', 'Sofia:']);
    expect(text).toHaveTextContent('Esmaspäeval käin ma võrkpallitrennis.');
    fireEvent.click(screen.getByRole('button', { name: 'Peida tekst' }));
    expect(region()).toBeNull();
  });

  it('print: the button is screen-only and the text prints only when it was opened', () => {
    const { container } = render(<Sheet doc={doc} mode="print" transcripts={{ role: 'staff' }} />);
    expect(page(container).querySelector('.ws-script-text')).toBeNull();
    expect(page(container).querySelector('.ws-script-bar')).not.toBeNull();
    fireEvent.click(showButton());
    expect(page(container).querySelector('.ws-script-text')).not.toBeNull();
  });

  it('the learner: hidden while answering, there after the sheet is checked', () => {
    const { rerender } = render(<Sheet doc={doc} mode="interactive" answers={{}} transcripts={{ role: 'student' }} />);
    expect(showButton()).toBeNull();
    // playing to the end is not enough when the task has answers to check
    fireEvent.ended(document.querySelector('.ws-page audio'));
    expect(showButton()).toBeNull();
    rerender(<Sheet doc={doc} mode="review" answers={{}} transcripts={{ role: 'student', submitted: true }} />);
    expect(showButton()).not.toBeNull();
    expect(region()).toBeNull();
    // the teacher showed this task's right answers in the lesson: checked too
    rerender(<Sheet doc={doc} mode="interactive" answers={{}} transcripts={{ role: 'student', answersShown: ['L'] }} />);
    expect(showButton()).not.toBeNull();
  });

  it('the learner: a task with nothing to check opens its text after the recording was played to the end', () => {
    const open = docOf(listening('O', { sentences: '' }));
    render(<Sheet doc={open} mode="interactive" transcripts={{ role: 'student' }} />);
    expect(showButton()).toBeNull();
    fireEvent.ended(document.querySelector('.ws-page audio'));
    fireEvent.click(showButton());
    expect(region()).toHaveTextContent('Tore! Ma tulen ka.');
  });

  it('the exam listening task works the same way', () => {
    const exam = docOf({ id: 'E', type: 'examlisten', width: 'full', tone: 'sky', data: { title: 'Kuula.', instruction: '', mode: 'choice', plays: 2, audio: null, transcript: TRANSCRIPT, questions: [{ q: 'Kes helistab?', options: '*Grete\nSofia' }], statements: [], pairs: [] } });
    render(<Sheet doc={exam} mode="interactive" transcripts={{ role: 'student' }} />);
    expect(showButton()).toBeNull();
    render(<Sheet doc={exam} mode="review" transcripts={{ role: 'student', submitted: true }} />);
    expect(showButton()).not.toBeNull();
  });

  it('live: the teacher shows it to the learner; it opens on both screens and hides again', () => {
    const onLive = vi.fn();
    const { rerender } = render(<Sheet doc={doc} mode="review" transcripts={{ role: 'staff', revealed: [], onLive }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Näita õpilasele' }));
    expect(onLive).toHaveBeenCalledWith('L', true);
    rerender(<Sheet doc={doc} mode="review" transcripts={{ role: 'staff', revealed: ['L'], onLive }} />);
    expect(region()).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Peida õpilaselt' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Õpilane näeb teksti');
    fireEvent.click(screen.getByRole('button', { name: 'Peida õpilaselt' }));
    expect(onLive).toHaveBeenLastCalledWith('L', false);
  });

  it('the teacher key and the answer key view carry the text', () => {
    render(<AnswerKeyView doc={docOf(listening('L', { sentences: '' }))} />);
    const key = screen.getByRole('region', { name: 'Kuulamise tekst' });
    expect(within(key).getByText('Grete:')).toBeInTheDocument();
  });
});

describe('live lesson sync (assignment.liveTranscripts)', () => {
  it('the teacher clicks „Näita õpilasele”: the field is written, and the learner sees the text when it comes back', async () => {
    let pushTeacher;
    const teacherRepo = {
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { pushTeacher = onData; return () => {}; }),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
      setWorksheetTranscript: vi.fn().mockResolvedValue(['L']),
    };
    const teacher = { uid: 't1', displayName: 'Õpetaja', roles: ['teacher'] };
    render(
      <AuthContext.Provider value={{ user: teacher }}>
        <MemoryRouter initialEntries={['/live/as-1']}><Routes><Route path="/live/:assignmentId" element={<LiveWorksheetPage repository={teacherRepo} />} /></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    act(() => pushTeacher({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: {}, worksheetDoc: doc }));
    fireEvent.click(await screen.findByRole('button', { name: 'Näita õpilasele' }));
    await waitFor(() => expect(teacherRepo.setWorksheetTranscript).toHaveBeenCalledWith({ assignmentId: 'as-1', blockId: 'L', on: true, user: teacher }));
    // the click inside the task does not also point at the task
    expect(teacherRepo.setWorksheetLiveFocus).not.toHaveBeenCalled();
  });

  it('the learner player follows the field: open when shown, gone when hidden', async () => {
    let push;
    const repository = {
      saveWorksheetDraft: vi.fn().mockResolvedValue({}), submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(),
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
    };
    const { container } = render(
      <AuthContext.Provider value={{ user: { uid: 's1', roles: ['student'] } }}>
        <WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Hobid', status: 'in_progress', answers: {}, worksheetDoc: doc }} repository={repository} onClose={() => {}} />
      </AuthContext.Provider>,
    );
    expect(showButton()).toBeNull();
    act(() => push({ liveTranscripts: ['L'] }));
    expect(region()).toHaveTextContent('Tere, Sofia!');
    expect(within(page(container)).getByText('Õpetaja näitab sulle teksti.')).toBeInTheDocument();
    act(() => push({ liveTranscripts: [] }));
    expect(region()).toBeNull();
    expect(showButton()).toBeNull();
  });

  it('a teacher opening the learner sheet read-only sees the button at once', () => {
    render(
      <AuthContext.Provider value={{ user: { uid: 't1', roles: ['teacher'] } }}>
        <WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Hobid', status: 'in_progress', answers: {}, worksheetDoc: doc }} repository={{ subscribeWorksheetAssignment: () => () => {} }} readOnly onClose={() => {}} />
      </AuthContext.Provider>,
    );
    expect(showButton()).not.toBeNull();
  });
});
