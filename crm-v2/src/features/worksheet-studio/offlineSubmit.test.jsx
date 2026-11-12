/* global setTimeout */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { OfflineWriteError, SUBMIT_OFFLINE_MESSAGE } from '../../services/firebase/offlineWrite.js';
import { readLocalAnswers, saveLocalAnswers, startAnswers } from './localAnswers.js';
import { SCHEMA } from './engine/schema.js';

// Fable review 2026-11-11: U4 (submit without network hung, answers lost) and U5 (an old tab undid a submitted sheet).
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const worksheetDoc = {
  schema: SCHEMA,
  id: 'doc-1',
  meta: { title: 'Minu päev', level: 'A2', goals: { g1: 'Saan aru lihtsatest väidetest.' } },
  blocks: [{ id: 'tf', type: 'truefalse', width: 'half', tone: 'green', goal: 'g1', data: { title: 'Õige või vale?', statements: [{ text: 'Päeval on pime.', answer: 'false' }, { text: 'Hommikul ma ärkan.', answer: 'true' }] } }],
};
const assignment = (patch = {}) => ({ id: 'as-off', studentId: 'st-1', title: 'Minu päev', status: 'new', answers: {}, worksheetDoc, ...patch });
const repo = () => ({
  saveWorksheetDraft: vi.fn().mockResolvedValue({}),
  submitWorksheet: vi.fn().mockResolvedValue({}),
  saveSelfAssessment: vi.fn().mockResolvedValue({}),
  uploadRecording: vi.fn(),
});
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };
const answerAll = (container) => {
  const boxes = container.querySelectorAll('.ws-page .ws-tfbox');
  fireEvent.click(boxes[1]);
  fireEvent.click(boxes[2]);
};
const esita = () => fireEvent.click(screen.getByRole('button', { name: /Esita tööleht/ }));
const setOnline = (value) => Object.defineProperty(globalThis.navigator, 'onLine', { value, configurable: true });

afterEach(() => { setOnline(true); });

describe('submitting a worksheet without network', () => {
  it('says so clearly, keeps the answers on the device and the late write still finishes the sheet once', async () => {
    const repository = repo();
    const late = deferred();
    repository.submitWorksheet = vi.fn()
      .mockRejectedValueOnce(new OfflineWriteError(SUBMIT_OFFLINE_MESSAGE, late.promise))
      .mockResolvedValue({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'true' }, score: { correct: 2, total: 2, pct: 100 }, alreadyDone: true });
    const onSubmitted = vi.fn();
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} onSubmitted={onSubmitted} />);
    answerAll(container);
    esita();
    expect(await screen.findByText(/Võrku pole – tööleht jäi esitamata/)).toBeInTheDocument();
    // the button no longer spins, the answers are on this device
    expect(screen.getByRole('button', { name: /Esita tööleht/ })).not.toBeDisabled();
    expect(readLocalAnswers('as-off').answers).toEqual({ 'tf:0': 'false', 'tf:1': 'true' });
    expect(onSubmitted).not.toHaveBeenCalled();
    // the network comes back and the queued write lands: the sheet is submitted, once
    await act(async () => { late.resolve({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'true' }, score: { correct: 2, total: 2, pct: 100 } }); });
    expect(await screen.findByText('Esitatud')).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(readLocalAnswers('as-off')).toBeNull();
    expect(screen.queryByText(/Võrku pole/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Esita tööleht/ })).toBeNull();
  });

  it('a retry after the late write landed shows the stored result and does not submit twice', async () => {
    const repository = repo();
    repository.submitWorksheet = vi.fn()
      .mockRejectedValueOnce(new OfflineWriteError(SUBMIT_OFFLINE_MESSAGE, new Promise(() => {})))
      .mockResolvedValueOnce({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'true' }, score: { correct: 2, total: 2, pct: 100 }, alreadyDone: true });
    const onSubmitted = vi.fn();
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} onSubmitted={onSubmitted} />);
    answerAll(container);
    esita();
    await screen.findByText(/Võrku pole/);
    esita();
    expect(await screen.findByText('Esitatud')).toBeInTheDocument();
    expect(screen.getByText(/100% · 2\/2 õiget/)).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });

  it('the browser knows it is offline: fails at once without calling the server', async () => {
    const repository = repo();
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} />);
    answerAll(container);
    setOnline(false);
    esita();
    expect(await screen.findByText(/Võrku pole – tööleht jäi esitamata/)).toBeInTheDocument();
    expect(repository.submitWorksheet).not.toHaveBeenCalled();
    expect(readLocalAnswers('as-off').answers).toEqual({ 'tf:0': 'false', 'tf:1': 'true' });
  });

  it('opens again with the answers kept on the device when they are newer than the stored ones', async () => {
    saveLocalAnswers('as-off', { 'tf:0': 'false' }, new Date('2026-11-12T10:00:00Z'));
    const repository = repo();
    const { container } = render(<WorksheetPlayer assignment={assignment({ status: 'in_progress', answers: {}, updatedAt: '2026-11-12T09:00:00Z' })} repository={repository} onClose={() => {}} />);
    expect(container.querySelectorAll('.ws-page .ws-tfbox')[1].className).toContain('on');
    // and saves them again
    await waitFor(() => expect(repository.saveWorksheetDraft).toHaveBeenCalledWith({ assignmentId: 'as-off', answers: { 'tf:0': 'false' } }), { timeout: 2000 });
  });

  it('the legacy v1 player fails clearly too and finishes when the late write lands', async () => {
    const repository = repo();
    const late = deferred();
    repository.submitWorksheet = vi.fn().mockRejectedValueOnce(new OfflineWriteError(SUBMIT_OFFLINE_MESSAGE, late.promise));
    const legacy = { id: 'as-v1', studentId: 'st-1', title: 'Vana leht', status: 'new', answers: {}, worksheetData: { blocks: [{ id: 'b1', type: 'fill', text: 'Ma [olen] kodus.' }] } };
    render(<WorksheetPlayer assignment={legacy} repository={repository} onClose={() => {}} />);
    const field = screen.getAllByRole('textbox')[0];
    fireEvent.change(field, { target: { value: 'olen' } });
    expect(readLocalAnswers('as-v1')).not.toBeNull();
    esita();
    expect(await screen.findByText(/Võrku pole – tööleht jäi esitamata/)).toBeInTheDocument();
    await act(async () => { late.resolve({ status: 'done' }); });
    expect(await screen.findByText('Esitatud')).toBeInTheDocument();
    expect(readLocalAnswers('as-v1')).toBeNull();
  });
});

describe('a sheet submitted elsewhere is never turned back to in progress (U5)', () => {
  it('an old tab learns from the subscription that the sheet is submitted and stops autosaving', async () => {
    const repository = repo();
    let push;
    repository.subscribeWorksheetAssignment = vi.fn((_id, onNext) => { push = onNext; return () => {}; });
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} />);
    act(() => push({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'true' }, score: { correct: 2, total: 2, pct: 100 } }));
    expect(await screen.findByText('Esitatud')).toBeInTheDocument();
    expect(container.querySelectorAll('.ws-page .ws-tfbox')).not.toHaveLength(0);
    await new Promise((resolve) => { setTimeout(resolve, 800); });
    expect(repository.saveWorksheetDraft).not.toHaveBeenCalled();
  });

  it('an autosave that finds the sheet submitted shows the submitted work instead', async () => {
    const repository = repo();
    repository.saveWorksheetDraft = vi.fn().mockResolvedValue({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'true' }, score: { correct: 2, total: 2, pct: 100 }, skipped: true });
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} />);
    fireEvent.click(container.querySelectorAll('.ws-page .ws-tfbox')[0]);
    expect(await screen.findByText('Esitatud', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getByText(/100% · 2\/2 õiget/)).toBeInTheDocument();
  });
});

describe('startAnswers', () => {
  it('prefers the newer copy, never for a submitted sheet or a read-only look', () => {
    saveLocalAnswers('x', { a: '1' }, new Date('2026-11-12T10:00:00Z'));
    expect(startAnswers({ id: 'x', status: 'in_progress', answers: { a: '0' }, updatedAt: '2026-11-12T11:00:00Z' })).toEqual({ answers: { a: '0' }, restored: false });
    expect(startAnswers({ id: 'x', status: 'in_progress', answers: { a: '0' }, updatedAt: '2026-11-12T09:00:00Z' })).toEqual({ answers: { a: '1' }, restored: true });
    expect(startAnswers({ id: 'x', status: 'in_progress', answers: { a: '0' } }, { readOnly: true })).toEqual({ answers: { a: '0' }, restored: false });
    expect(startAnswers({ id: 'x', status: 'done', answers: { a: '0' } })).toEqual({ answers: { a: '0' }, restored: false });
    // the submitted sheet clears the copy
    expect(readLocalAnswers('x')).toBeNull();
  });

  it('works when storage is blocked', () => {
    const spy = vi.spyOn(globalThis.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(startAnswers({ id: 'y', status: 'new', answers: { a: '0' } })).toEqual({ answers: { a: '0' }, restored: false });
    spy.mockRestore();
  });
});
