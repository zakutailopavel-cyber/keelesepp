import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import HomeworkPage from './HomeworkPage.jsx';
import DocWorksheetPlayer from '../worksheet-studio/DocWorksheetPlayer.jsx';
import LiveWorksheetView from '../worksheet-studio/LiveWorksheetView.jsx';
import { BLOCKS, answerProgress, checkDocument } from '../worksheet-studio/engine/registry.js';
import { normalizeSubmission } from '../../services/firebase/homework.js';
import { CASES, EXPECTED, answerRight, answerWrong, doc, fields, make, mount, ownAnswers, reviewShows } from '../../test/blockAnswerCases.jsx';

// The exercise blocks checked from the student's side, in the real screens (owner, 2026-10-13): the student opens the
// assigned sheet under „Kodutööd”, answers every answerable block through the UI, the answers are autosaved, she closes
// and reopens the sheet (resume), submits, sees ✓ / ✗ per item; the service receives exactly those answers and that
// score; the teacher opens the submission and sees every answer with its marks. Fake services only.

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// a few blocks are answered with one mistake, so the student and the teacher see ✗ next to ✓
const WRONG = ['gaps', 'truefalse', 'wordforms', 'errorfix'];
const marked = (block) => Boolean(BLOCKS[block.type].score) && CASES[block.type].marks !== false;

// One block of every answerable type. Each is first answered on a sheet of its own; what was typed into each field
// (or which drive was used) is replayed later in the student's real player.
function buildSheet() {
  const runs = [...EXPECTED.filter((t) => t !== 'diagram').map((t) => [t, null]), ...BLOCKS.diagram.variants.map((v) => ['diagram', v.variant])];
  const blocks = [];
  const scripts = {};
  const expected = {};
  runs.forEach(([type, variant]) => {
    const block = make(type, variant);
    const h = mount(block);
    answerRight(h, block);
    const wrong = WRONG.includes(type);
    if (wrong) answerWrong(h, block);
    scripts[block.id] = CASES[type].drive ? { drive: true, wrong } : { typed: fields(h.card()).map((f) => f.value) };
    Object.assign(expected, h.store.answers);
    h.unmount();
    blocks.push(block);
  });
  return { worksheetDoc: { ...doc(blocks), id: 'flow-doc' }, blocks, scripts, expected };
}

const cardOf = (id) => () => document.querySelector(`.ws-page [data-block="${id}"]`);

function answerInPlayer(blocks, scripts) {
  blocks.forEach((block) => {
    const card = cardOf(block.id);
    expect(card(), `${block.type}: on the student's sheet`).not.toBeNull();
    const s = scripts[block.id];
    if (s.drive) {
      CASES[block.type].drive(card, block);
      if (s.wrong) CASES[block.type].drive(card, block, { wrong: true });
      return;
    }
    s.typed.forEach((value, i) => fireEvent.change(fields(card())[i], { target: { value } }));
  });
}

// a tiny in-memory "Firestore" for one worksheet assignment
function fakeDb(worksheetDoc) {
  const state = { assignment: { id: 'wa-1', studentId: 'student-1', studentName: 'Mari', title: 'Kõik ülesanded', subject: 'Eesti keel', level: 'A2', status: 'new', answers: {}, worksheetDoc } };
  const repository = {
    listByStudentIds: vi.fn().mockResolvedValue([]),
    listSubmissionsByStudentIds: vi.fn(async () => (state.assignment.status === 'done' ? [normalizeSubmission(state.assignment.id, state.assignment, 'worksheet')] : [])),
    listWorksheetAssignmentsByStudentIds: vi.fn(async () => [{ ...state.assignment }]),
    saveWorksheetDraft: vi.fn(async ({ answers }) => { state.assignment = { ...state.assignment, status: 'in_progress', answers }; return {}; }),
    submitWorksheet: vi.fn(async ({ answers, score, errorLog }) => { state.assignment = { ...state.assignment, status: 'done', answers, score, errorLog, completedAt: '2026-10-13T09:00:00.000Z' }; return {}; }),
    saveSelfAssessment: vi.fn().mockResolvedValue({}),
    uploadRecording: vi.fn(),
    reviewSubmission: vi.fn().mockResolvedValue({}),
    saveSubmissionAnnotations: vi.fn(async ({ annotations }) => annotations),
  };
  const studentRepository = {
    list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari' }] }),
    listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari' }]),
  };
  return { state, repository, studentRepository };
}

const student = { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] };
const teacher = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
const page = (user, db) => render(<MemoryRouter><AuthContext.Provider value={{ user }}><HomeworkPage repository={db.repository} studentRepository={db.studentRepository} interactiveRepository={null} /></AuthContext.Provider></MemoryRouter>);

describe('student flow: every answerable block in the real homework screens', () => {
  it('answer → autosave → close and reopen (resume) → submit → ✓/✗ → the teacher sees the same', async () => {
    const { worksheetDoc, blocks, scripts, expected } = buildSheet();
    const db = fakeDb(worksheetDoc);
    globalThis.confirm = vi.fn(() => true);
    const result = checkDocument(worksheetDoc, expected);
    const progress = answerProgress(worksheetDoc, expected);
    expect(result.score.pct).toBeLessThan(100);
    expect(result.score.pct).toBeGreaterThan(50);
    // everything the sheet asks for is answered (a wrong answer is an answer too)
    expect(progress.answered).toBe(progress.total);

    // the student opens the sheet from „Määratud töölehed”
    const view = page(student, db);
    fireEvent.click(await screen.findByRole('button', { name: /Kõik ülesanded/ }));
    expect(await screen.findByText(`0/${progress.total} vastust`)).toBeInTheDocument();
    answerInPlayer(blocks, scripts);
    expect(screen.getByText(new RegExp(`^${progress.answered}/${progress.total} vastust`))).toBeInTheDocument();

    // autosave: the service receives exactly what was answered
    await waitFor(() => expect(db.repository.saveWorksheetDraft).toHaveBeenLastCalledWith({ assignmentId: 'wa-1', answers: expected }), { timeout: 3000 });
    expect(await screen.findByText(/automaatselt salvestatud/)).toBeInTheDocument();

    // closes and reopens: the saved answers are back on the sheet
    fireEvent.click(screen.getByText('Sulge', { selector: 'button.button--secondary' }));
    await waitFor(() => expect(document.querySelector('.ws-doc-player')).toBeNull());
    fireEvent.click(await screen.findByRole('button', { name: /Kõik ülesanded/ }));
    expect(await screen.findByText(new RegExp(`^${progress.answered}/${progress.total} vastust`))).toBeInTheDocument();
    blocks.filter((b) => !CASES[b.type].drive).forEach((b) => {
      const typed = fields(cardOf(b.id)()).map((f) => f.value);
      expect(typed, `${b.type}: the saved answers are shown again`).toEqual(scripts[b.id].typed);
    });

    // submits at once: the resumed answers are exactly the saved ones, the score is the sheet's own check
    fireEvent.click(screen.getByRole('button', { name: /Esita tööleht/ }));
    await waitFor(() => expect(db.repository.submitWorksheet).toHaveBeenCalledTimes(1));
    const sent = db.repository.submitWorksheet.mock.calls[0][0];
    expect(sent.assignmentId).toBe('wa-1');
    expect(sent.answers).toEqual(expected);
    expect(sent.score).toEqual(result.score);
    const wrongIds = blocks.filter((b) => WRONG.includes(b.type)).map((b) => b.id);
    expect(sent.errorLog.length).toBeGreaterThanOrEqual(WRONG.length);
    wrongIds.forEach((id) => expect(sent.errorLog.some((e) => e.key.startsWith(`${id}:`)), `error logged for ${id}`).toBe(true));

    // the student sees the result and ✓ / ✗ per item
    expect(await screen.findByText(`${result.score.pct}% · ${result.score.correct}/${result.score.total} õiget`)).toBeInTheDocument();
    expect(screen.getByText('Esitatud')).toBeInTheDocument();
    blocks.forEach((b) => {
      const card = cardOf(b.id)();
      reviewShows(card, b, ownAnswers(expected, b.id));
      if (!marked(b)) return;
      if (WRONG.includes(b.type)) expect(card.querySelectorAll('.is-bad').length, `${b.type}: ✗ for the student`).toBeGreaterThan(0);
      else expect(card.querySelectorAll('.is-bad'), `${b.type}: no ✗`).toHaveLength(0);
      expect(card.querySelectorAll('.is-ok').length, `${b.type}: ✓ for the student`).toBeGreaterThan(0);
    });
    // the sheet is locked after submitting
    expect(screen.queryByRole('button', { name: /Esita tööleht/ })).toBeNull();
    view.unmount();

    // the teacher opens the submission (the stored assignment, mapped the way the service maps it)
    page(teacher, db);
    fireEvent.click(await screen.findByRole('button', { name: /Kõik ülesanded/ }));
    expect(await screen.findByText(`${result.score.correct}/${result.score.total} õiget`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Automaatselt tuvastatud vead \\(${sent.errorLog.length}\\)`))).toBeInTheDocument();
    blocks.forEach((b) => {
      const card = cardOf(b.id)();
      expect(card, `${b.type}: in the teacher's review`).not.toBeNull();
      reviewShows(card, b, ownAnswers(expected, b.id));
      if (!marked(b)) return;
      if (WRONG.includes(b.type)) expect(card.querySelectorAll('.is-bad').length, `${b.type}: ✗ for the teacher`).toBeGreaterThan(0);
      else expect(card.querySelectorAll('.is-bad'), `${b.type}: no ✗ for the teacher`).toHaveLength(0);
      expect(card.querySelectorAll('.is-ok').length, `${b.type}: ✓ for the teacher`).toBeGreaterThan(0);
    });
  }, 30000);
});

describe('live lesson: the student and the teacher on the same sheet', () => {
  it('the teacher sees the autosaved answers with marks only on answered fields; shown answers reach the student', async () => {
    const { worksheetDoc, blocks, scripts, expected } = buildSheet();
    const listeners = new Set();
    let current = { id: 'wa-live', studentId: 'student-1', studentName: 'Mari', title: 'Tund', status: 'new', answers: {}, worksheetDoc };
    const push = (patch) => { current = { ...current, ...patch }; act(() => listeners.forEach((fn) => fn(current))); };
    const repository = {
      subscribeWorksheetAssignment: (id, next) => { listeners.add(next); next(current); return () => listeners.delete(next); },
      saveWorksheetDraft: vi.fn(async ({ answers }) => { current = { ...current, status: 'in_progress', answers }; return {}; }),
      submitWorksheet: vi.fn().mockResolvedValue({}),
      saveSelfAssessment: vi.fn(),
      uploadRecording: vi.fn(),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
      saveSubmissionAnnotations: vi.fn(async ({ annotations }) => annotations),
    };

    // the student answers in the room (inline player)
    const player = render(<DocWorksheetPlayer assignment={current} repository={repository} inline />);
    answerInPlayer(blocks, scripts);
    await waitFor(() => expect(repository.saveWorksheetDraft).toHaveBeenLastCalledWith({ assignmentId: 'wa-live', answers: expected }), { timeout: 3000 });
    // nothing is marked for the student while the lesson runs
    expect(player.container.querySelectorAll('.ws-page .is-bad, .ws-page .is-ok')).toHaveLength(0);

    // the teacher shows the answers of the gaps task: the student sees its marks and the right answers
    const gaps = blocks.find((b) => b.type === 'gaps');
    push({ liveShown: [gaps.id] });
    const gapsCard = player.container.querySelector(`.ws-page [data-block="${gaps.id}"]`);
    await waitFor(() => expect(gapsCard.querySelectorAll('.is-bad').length).toBeGreaterThan(0));
    expect(gapsCard.querySelectorAll('.is-ok').length).toBeGreaterThan(0);
    expect(player.getAllByText('Õiged vastused:').length).toBeGreaterThan(0);
    const choice = blocks.find((b) => b.type === 'choice');
    expect(player.container.querySelectorAll(`.ws-page [data-block="${choice.id}"] .is-ok`)).toHaveLength(0);
    player.unmount();

    // the teacher's live view: every answer, marks on the answered fields, the counter
    const { container } = render(<MemoryRouter><LiveWorksheetView assignmentId="wa-live" repository={repository} /></MemoryRouter>);
    const progress = answerProgress(worksheetDoc, expected);
    expect(await screen.findByText(`${progress.answered}/${progress.total} vastust`)).toBeInTheDocument();
    blocks.forEach((b) => {
      const card = container.querySelector(`.ws-page [data-block="${b.id}"]`);
      reviewShows(card, b, ownAnswers(expected, b.id));
      if (!marked(b)) return;
      if (WRONG.includes(b.type)) expect(card.querySelectorAll('.is-bad').length, `${b.type}: ✗ live`).toBeGreaterThan(0);
      else expect(card.querySelectorAll('.is-bad'), `${b.type}: no ✗ live`).toHaveLength(0);
    });
  }, 30000);
});

describe('resume from an older copy of the assignment', () => {
  it('the player takes the stored answers and does not autosave the empty copy over them', async () => {
    const { worksheetDoc } = buildSheet();
    const gaps = worksheetDoc.blocks.find((b) => b.type === 'gaps');
    const stored = { [`${gaps.id}:0.0`]: 'hommikul', [`${gaps.id}:1.0`]: 'päeval' };
    const stale = { id: 'wa-old', studentId: 'student-1', title: 'Vana koopia', status: 'in_progress', answers: {}, worksheetDoc };
    const repository = {
      subscribeWorksheetAssignment: (id, next) => { next({ ...stale, answers: stored }); return () => {}; },
      saveWorksheetDraft: vi.fn().mockResolvedValue({}),
      submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(),
    };
    render(<DocWorksheetPlayer assignment={stale} repository={repository} onClose={() => {}} />);
    const card = cardOf(gaps.id);
    await waitFor(() => expect(fields(card()).map((f) => f.value).slice(0, 2)).toEqual(['hommikul', 'päeval']));
    // the next answer is added to the stored ones
    fireEvent.change(fields(card())[2], { target: { value: 'loen' } });
    await waitFor(() => expect(repository.saveWorksheetDraft).toHaveBeenLastCalledWith({ assignmentId: 'wa-old', answers: { ...stored, [`${gaps.id}:2.0`]: 'loen' } }), { timeout: 3000 });
  });
});
