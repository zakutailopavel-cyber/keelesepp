import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RoomWorksheetPanel from './RoomWorksheetPanel.jsx';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const worksheetDoc = {
  schema: SCHEMA, id: 'd', meta: { title: 'Minu päev', level: 'A2', goals: {} },
  blocks: [{ id: 'tf', type: 'truefalse', width: 'half', tone: 'green', data: { statements: [{ text: 'Päeval on pime.', answer: 'false' }] } }],
};
const invitation = { id: 'inv-1', roomKey: 'inv-1', studentId: 'st-1', studentName: 'Mari', title: 'Eesti keel' };
const user = { uid: 't-1', displayName: 'Õpetaja', roles: ['teacher'] };

function homeworkRepo() {
  const listeners = { room: null, one: null };
  return {
    listeners,
    subscribeRoomWorksheets: vi.fn((_q, onData) => { listeners.room = onData; onData([]); return () => {}; }),
    openWorksheetInRoom: vi.fn().mockResolvedValue({}),
    subscribeWorksheetAssignment: vi.fn((_id, onData) => { listeners.one = onData; return () => {}; }),
    setWorksheetLiveFocus: vi.fn(), saveWorksheetDraft: vi.fn().mockResolvedValue({}), submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(),
  };
}

describe('RoomWorksheetPanel', () => {
  it('lets the teacher open a studio worksheet in the room and then watch it live', async () => {
    const homework = homeworkRepo();
    const library = {
      list: vi.fn().mockResolvedValue({ curriculumLessons: [{ id: 'l-1', title: 'Minu päev', level: 'A2', worksheetDoc }, { id: 'l-2', title: 'Pilt', files: [] }] }),
      assign: vi.fn().mockResolvedValue({ count: 1, mode: 'worksheet', assignments: [{ id: 'as-9', studentId: 'st-1' }] }),
    };
    render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="teacher" user={user} homework={homework} library={library} /></MemoryRouter>);
    expect(homework.subscribeRoomWorksheets).toHaveBeenCalledWith({ studentId: 'st-1', roomKey: 'inv-1' }, expect.any(Function), expect.any(Function));
    const select = await screen.findByLabelText('Tööleht');
    await waitFor(() => expect(screen.getByRole('option', { name: 'A2 Minu päev' })).toBeInTheDocument());
    expect(screen.queryByRole('option', { name: /Pilt/ })).toBeNull();
    fireEvent.change(select, { target: { value: 'l-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ava tunnis' }));
    await waitFor(() => expect(homework.openWorksheetInRoom).toHaveBeenCalledWith({ assignmentId: 'as-9', roomKey: 'inv-1' }));
    expect(library.assign.mock.calls[0][0]).toMatchObject({ students: [{ id: 'st-1', name: 'Mari' }], note: 'Live Classroom: Eesti keel' });
    act(() => homework.listeners.room([{ id: 'as-9', studentId: 'st-1', title: 'Minu päev', answers: {}, worksheetDoc, status: 'new' }]));
    await waitFor(() => expect(homework.subscribeWorksheetAssignment).toHaveBeenCalledWith('as-9', expect.any(Function), expect.any(Function)));
  });

  it('shows the room worksheet inline to the student', async () => {
    const homework = homeworkRepo();
    const { container } = render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="student" user={{ uid: 's', roles: ['student'] }} homework={homework} library={{ list: vi.fn() }} /></MemoryRouter>);
    expect(screen.getByText('Kui õpetaja avab töölehe, ilmub see siia.')).toBeInTheDocument();
    act(() => homework.listeners.room([{ id: 'as-9', studentId: 'st-1', title: 'Minu päev', answers: {}, worksheetDoc, status: 'new' }]));
    expect(await screen.findByRole('region', { name: 'Minu päev' })).toBeInTheDocument();
    expect(container.querySelector('.ws-page')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Esita tööleht/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('reports a failing subscription instead of crashing the room', () => {
    const homework = { ...homeworkRepo(), subscribeRoomWorksheets: () => { throw new Error('Firebase ei ole seadistatud.'); } };
    render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="student" user={{ uid: 's' }} homework={homework} library={{ list: vi.fn() }} /></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Firebase ei ole seadistatud.');
  });
});
