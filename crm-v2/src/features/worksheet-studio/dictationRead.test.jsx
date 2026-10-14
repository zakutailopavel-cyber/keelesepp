import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import LiveWorksheetPage from './LiveWorksheetPage.jsx';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const worksheetDoc = {
  schema: SCHEMA, id: 'd', meta: { title: 'Minu päev' },
  blocks: [{ id: 'dict', type: 'dictation', width: 'full', tone: 'sky', data: { title: 'Etteütlus.', instruction: 'Kuula õpetajat ja kirjuta laused.', sentences: 'Hommikul lähen tööle.\nÕhtul loen raamatut.', lines: 2 } }],
};

describe('dictation in a live lesson', () => {
  it('the teacher has the sentences to read aloud right under the task', async () => {
    let push;
    const repository = { subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }), setWorksheetLiveFocus: vi.fn() };
    render(<MemoryRouter initialEntries={['/live/as-1']}><Routes><Route path="/live/:assignmentId" element={<LiveWorksheetPage repository={repository} />} /></Routes></MemoryRouter>);
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: {}, worksheetDoc, updatedAt: '2026-10-14T10:00:00Z' }));
    const note = await screen.findByRole('note', { name: 'Loe ette' });
    expect(within(note).getByText('Hommikul lähen tööle.')).toBeInTheDocument();
    expect(within(note).getByText('Õhtul loen raamatut.')).toBeInTheDocument();
  });

  it('the learner never sees them', () => {
    render(<WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Minu päev', status: 'new', answers: {}, worksheetDoc }} repository={{ saveWorksheetDraft: vi.fn() }} onClose={() => {}} />);
    expect(screen.queryByText('Hommikul lähen tööle.')).toBeNull();
    expect(screen.queryByRole('note', { name: 'Loe ette' })).toBeNull();
  });
});
