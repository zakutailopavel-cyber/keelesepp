import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import LiveWorksheetPage from './LiveWorksheetPage.jsx';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const worksheetDoc = {
  schema: SCHEMA, id: 'd', meta: { title: 'Minu päev', goals: { g1: 'Saan aru väidetest.' } },
  blocks: [{ id: 'tf', type: 'truefalse', width: 'half', tone: 'green', goal: 'g1', data: { title: 'Õige või vale?', statements: [{ text: 'Päeval on pime.', answer: 'false' }, { text: 'Hommikul ma ärkan.', answer: 'true' }] } }],
};

describe('live worksheet lesson', () => {
  it('shows the learner answers as they arrive and lets the teacher point at a task', async () => {
    let push;
    const repository = {
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
    };
    const { container } = render(
      <MemoryRouter initialEntries={['/library/worksheets/live/as-1']}>
        <Routes><Route path="/library/worksheets/live/:assignmentId" element={<LiveWorksheetPage repository={repository} />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Ühendan tunniga…')).toBeInTheDocument();
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: {}, worksheetDoc, updatedAt: '2026-09-29T10:00:00Z' }));
    expect(await screen.findByText('Otse tunnis: Mari')).toBeInTheDocument();
    expect(screen.getByText('0/2 vastust')).toBeInTheDocument();
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: { 'tf:0': 'false' }, worksheetDoc }));
    expect(screen.getByText('1/2 vastust')).toBeInTheDocument();
    expect(container.querySelectorAll('.ws-page .ws-tfbox.is-ok')).toHaveLength(1);
    // the unanswered second statement is not marked wrong during the lesson
    expect(container.querySelectorAll('.ws-page .ws-tfbox.is-bad')).toHaveLength(0);
    fireEvent.click(container.querySelector('.ws-page [data-block="tf"]'));
    await waitFor(() => expect(repository.setWorksheetLiveFocus).toHaveBeenCalledWith({ assignmentId: 'as-1', blockId: 'tf' }));
    act(() => push({ id: 'as-1', status: 'in_progress', answers: {}, worksheetDoc, liveFocus: { blockId: 'tf' } }));
    expect(container.querySelector('.ws-page [data-block="tf"]').className).toContain('focused');
  });

  it('autosaves the learner answers and follows the task the teacher points at', async () => {
    vi.useFakeTimers();
    let push;
    const repository = {
      saveWorksheetDraft: vi.fn().mockResolvedValue({}),
      submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(),
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
    };
    const { container } = render(<WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Minu päev', status: 'new', answers: {}, worksheetDoc }} repository={repository} onClose={() => {}} />);
    fireEvent.click(container.querySelectorAll('.ws-page .ws-tfbox')[1]);
    expect(repository.saveWorksheetDraft).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(700); });
    expect(repository.saveWorksheetDraft).toHaveBeenCalledWith({ assignmentId: 'as-1', answers: { 'tf:0': 'false' } });
    act(() => push({ liveFocus: { blockId: 'tf' } }));
    expect(container.querySelector('.ws-page [data-block="tf"]').className).toContain('focused');
    vi.useRealTimers();
  });

  it('step mode: the teacher opens tasks one by one and shows the right answers; the learner sees only that', async () => {
    const doc2 = { ...worksheetDoc, blocks: [...worksheetDoc.blocks, { id: 'g', type: 'gaps', width: 'half', tone: 'blue', data: { title: 'Täienda', showBank: 'no', bank: '', sentences: 'Ma ärkan [hommikul].' } }] };
    let push;
    const repository = {
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
      setWorksheetLiveStep: vi.fn().mockResolvedValue({}),
      setWorksheetShown: vi.fn().mockResolvedValue([]),
    };
    const { container } = render(
      <MemoryRouter initialEntries={['/library/worksheets/live/as-1']}>
        <Routes><Route path="/library/worksheets/live/:assignmentId" element={<LiveWorksheetPage repository={repository} />} /></Routes>
      </MemoryRouter>,
    );
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: { 'tf:0': 'true', 'tf:1': 'true' }, worksheetDoc: doc2 }));
    const panel = await screen.findByRole('complementary', { name: 'Ülesanded' });
    expect(panel).toHaveTextContent('1/2');
    expect(panel.querySelector('li.is-mixed')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Samm-sammult' }));
    await waitFor(() => expect(repository.setWorksheetLiveStep).toHaveBeenCalledWith({ assignmentId: 'as-1', on: true, open: [] }));
    act(() => push({ id: 'as-1', status: 'in_progress', answers: {}, worksheetDoc: doc2, liveStep: { on: true, open: [] } }));
    expect(container.querySelector('.ws-page [data-block="g"]').className).toContain('is-live-closed');
    fireEvent.click(screen.getByRole('button', { name: /Ava järgmine/ }));
    await waitFor(() => expect(repository.setWorksheetLiveStep).toHaveBeenLastCalledWith({ assignmentId: 'as-1', on: true, open: ['tf'] }));
    expect(repository.setWorksheetLiveFocus).toHaveBeenCalledWith({ assignmentId: 'as-1', blockId: 'tf' });
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust: ülesanne 2' }));
    await waitFor(() => expect(repository.setWorksheetShown).toHaveBeenCalledWith({ assignmentId: 'as-1', shown: ['g'] }));
  });

  it('the learner sees only the opened tasks and the right answers the teacher shows', async () => {
    const doc2 = { ...worksheetDoc, blocks: [...worksheetDoc.blocks, { id: 'g', type: 'gaps', width: 'half', tone: 'blue', data: { title: 'Täienda', showBank: 'no', bank: '', sentences: 'Ma ärkan [hommikul|varahommikul].' } }] };
    let push;
    const repository = { saveWorksheetDraft: vi.fn(), submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(), subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }) };
    const { container } = render(<WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Minu päev', status: 'new', answers: { 'g:0.0': 'õhtul' }, worksheetDoc: doc2, liveStep: { on: true, open: ['g'] } }} repository={repository} onClose={() => {}} />);
    expect(container.querySelector('.ws-page [data-block="tf"]')).toBeNull();
    expect(container.querySelector('.ws-page [data-block="g"]')).not.toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Õpetaja avab ülesandeid ükshaaval');
    act(() => push({ liveStep: { on: true, open: ['g'] }, liveShown: ['g'] }));
    expect(container.querySelector('.ws-page .ws-live-answers')).toHaveTextContent('1) hommikul / varahommikul');
    expect(container.querySelector('.ws-page [data-block="g"] input').className).toContain('is-bad');
    act(() => push({ liveStep: { on: false, open: [] }, liveShown: [] }));
    expect(container.querySelector('.ws-page [data-block="tf"]')).not.toBeNull();
    expect(container.querySelector('.ws-page .ws-live-answers')).toBeNull();
  });
});
