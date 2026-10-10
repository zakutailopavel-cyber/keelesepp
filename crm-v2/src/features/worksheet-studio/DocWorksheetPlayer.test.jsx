/* global Blob */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import DocWorksheetPlayer, { DocWorksheetSubmissionPreview } from './DocWorksheetPlayer.jsx';
import { wordFromSelection } from './WordLookup.jsx';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const worksheetDoc = {
  schema: SCHEMA,
  id: 'doc-1',
  meta: { title: 'Minu päev', level: 'A2', goals: { g1: 'Saan aru lihtsatest väidetest.', g2: 'Räägin oma päevast.' } },
  blocks: [
    { id: 'tf', type: 'truefalse', width: 'half', tone: 'green', goal: 'g1', data: { title: 'Õige või vale?', statements: [{ text: 'Päeval on pime.', answer: 'false' }, { text: 'Hommikul ma ärkan.', answer: 'true' }] } },
    { id: 'sp', type: 'speaking', width: 'half', tone: 'green', goal: 'g2', data: { title: 'Räägi.', questions: 'Mis kell sa ärkad?', minSec: 30, maxSec: 60 } },
  ],
};

const assignment = (patch = {}) => ({ id: 'as-1', studentId: 'st-1', title: 'Minu päev', status: 'new', answers: {}, worksheetDoc, ...patch });
const repo = () => ({
  saveWorksheetDraft: vi.fn().mockResolvedValue({}),
  submitWorksheet: vi.fn().mockResolvedValue({}),
  saveSelfAssessment: vi.fn().mockResolvedValue({}),
  uploadRecording: vi.fn().mockResolvedValue({ url: 'https://files.example/rec.webm' }),
});

describe('structured worksheet player', () => {
  it('opens a Worksheet Studio assignment in the new design and submits a scored result per goal', async () => {
    const repository = repo();
    const onSubmitted = vi.fn();
    const { container } = render(<WorksheetPlayer assignment={assignment()} repository={repository} onClose={() => {}} onSubmitted={onSubmitted} />);
    expect(container.querySelector('.ws-page')).not.toBeNull();
    expect(screen.getByText('0/3 vastust')).toBeInTheDocument();
    // buttons per row: [Õige, Vale]; answer both statements wrongly
    const [firstTrue, , , secondFalse] = [...container.querySelectorAll('.ws-page .ws-tfbox')];
    fireEvent.click(firstTrue);
    fireEvent.click(secondFalse);
    window.confirm = vi.fn().mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: /Esita tööleht/ }));
    await waitFor(() => expect(repository.submitWorksheet).toHaveBeenCalledTimes(1));
    const payload = repository.submitWorksheet.mock.calls[0][0];
    expect(payload.assignmentId).toBe('as-1');
    expect(payload.answers).toEqual({ 'tf:0': 'true', 'tf:1': 'false' });
    expect(payload.score).toMatchObject({ correct: 0, total: 2, pct: 0, perGoal: { g1: { ok: 0, total: 2 } } });
    expect(payload.errorLog).toHaveLength(2);
    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText('Tulemus tunni eesmärkide kaupa')).toBeInTheDocument();
    expect(screen.getByText('salvestus puudub')).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalled();
  });

  it('uploads a local voice recording before saving the draft', async () => {
    const repository = repo();
    globalThis.fetch = vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob(['x'], { type: 'audio/webm' })) });
    render(<WorksheetPlayer assignment={assignment({ answers: { 'sp:audioUrl': 'blob:local-1', 'sp:seconds': 42 } })} repository={repository} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.saveWorksheetDraft).toHaveBeenCalledTimes(1));
    expect(repository.uploadRecording).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'st-1', assignmentId: 'as-1', blockId: 'sp' }));
    expect(repository.saveWorksheetDraft.mock.calls[0][0].answers).toEqual({ 'sp:audioUrl': 'https://files.example/rec.webm', 'sp:seconds': 42 });
    expect(await screen.findByText(/Salvestatud/)).toBeInTheDocument();
  });

  it('shows a submitted sheet read-only with the learner answers and marks', () => {
    const { container } = render(<WorksheetPlayer assignment={assignment({ status: 'done', answers: { 'tf:0': 'false', 'tf:1': 'false' }, score: { correct: 1, total: 2, pct: 50 } })} repository={repo()} readOnly onClose={() => {}} />);
    expect(screen.getByText('50% · 1/2 õiget')).toBeInTheDocument();
    expect(container.querySelectorAll('.ws-page .ws-tfbox.is-ok')).toHaveLength(1);
    expect(container.querySelectorAll('.ws-page .ws-tfbox.is-bad')).toHaveLength(1);
    expect([...container.querySelectorAll('.ws-page .ws-tfbox')].every((b) => b.disabled)).toBe(true);
    expect(screen.queryByRole('button', { name: /Esita tööleht/ })).toBeNull();
  });

  it('keeps legacy assignments on the v1 player', () => {
    render(<WorksheetPlayer assignment={{ id: 'old', title: 'Vana', answers: {}, worksheetData: { blocks: [{ id: 'b', type: 'text', text: 'Tere' }] }, files: [] }} repository={repo()} onClose={() => {}} />);
    expect(screen.getByText('Tere')).toBeInTheDocument();
    expect(document.querySelector('.ws-page')).toBeNull();
  });

  it('gives the teacher the recording and per-goal evidence in the review preview', () => {
    const { container } = render(<DocWorksheetSubmissionPreview worksheetDoc={worksheetDoc} answers={{ 'tf:0': 'false', 'tf:1': 'true', 'sp:audioUrl': 'https://files.example/rec.webm', 'sp:seconds': 41 }} />);
    expect(container.querySelector('.ws-page audio')?.getAttribute('src')).toBe('https://files.example/rec.webm');
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByText('salvestus 41 s — hindab õpetaja')).toBeInTheDocument();
  });

  it('a double-clicked word shows its forms and translation and is saved to the learner words', async () => {
    const wordService = { lookupStudentWord: vi.fn().mockResolvedValue({ word: 'ärkama', translation: 'просыпаться', saved: true, forms: { forms: [{ code: 'Sup', label: 'ma-tegevusnimi', value: 'ärkama' }, { code: 'Inf', label: 'da-tegevusnimi', value: 'ärgata' }, { code: 'IndPrSg3', label: 'kolmas isik', value: 'ärkab' }] } }) };
    const { container } = render(<DocWorksheetPlayer assignment={assignment()} repository={repo()} inline wordService={wordService} />);
    const original = globalThis.getSelection;
    globalThis.getSelection = () => ({ toString: () => 'ärkan.', rangeCount: 0 });
    fireEvent.doubleClick(container.querySelector('.ws-page [data-block="tf"]'));
    globalThis.getSelection = original;
    expect(wordService.lookupStudentWord).toHaveBeenCalledWith({ studentId: 'st-1', word: 'ärkan' });
    expect(await screen.findByText('просыпаться')).toBeInTheDocument();
    expect(screen.getByText('ärgata')).toBeInTheDocument();
    expect(screen.getByText('Lisatud sinu sõnavarasse.')).toBeInTheDocument();
  });

  it('takes one word from a selection, not phrases or empty text', () => {
    expect(wordFromSelection({ toString: () => ' „kodu”, ' })).toBe('kodu');
    expect(wordFromSelection({ toString: () => 'kaks sõna' })).toBe('');
    expect(wordFromSelection({ toString: () => '…' })).toBe('');
  });
});
