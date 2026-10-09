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
  it('lets the teacher search the curriculum and the student\'s own sheets and put them on the board', async () => {
    const homework = { ...homeworkRepo(), adoptPreparedWorksheets: vi.fn().mockResolvedValue(0), listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([
      { id: 'own-1', studentId: 'st-1', title: 'Isiklik: perekond', status: 'new', worksheetDoc, source: 'student_private_worksheet' },
      { id: 'done-1', studentId: 'st-1', title: 'Valmis leht', status: 'done', worksheetDoc },
    ]) };
    const library = {
      list: vi.fn().mockResolvedValue({ curriculumLessons: [
        { id: 'l-1', title: 'Minu päev', level: 'A2', worksheetDoc },
        { id: 'l-2', title: 'Pilt', files: [] },
        { id: 'a2b1-017', title: 'Peab, võib ja saab', level: 'B1', roadmapManaged: true, roadmapModuleTitle: 'Aeg ja plaanid', roadmapLessonNumber: 17, worksheetPhases: { discover: { title: 'Avasta: peab, võib ja saab', publishedVersion: 1 }, practice: { version: 1, publishedVersion: 0 } } },
      ] }),
      assign: vi.fn().mockResolvedValue({ count: 1, mode: 'worksheet', assignments: [{ id: 'as-9', studentId: 'st-1' }] }),
    };
    const lessonWorksheets = { list: vi.fn().mockResolvedValue([{ worksheetId: 'discover', publishedWorksheetDoc: worksheetDoc, worksheetDocStatus: 'published' }]) };
    render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="teacher" user={user} homework={homework} library={library} lessonWorksheets={lessonWorksheets} /></MemoryRouter>);
    expect(homework.subscribeRoomWorksheets).toHaveBeenCalledWith({ studentId: 'st-1', roomKey: 'inv-1' }, expect.any(Function), expect.any(Function));
    expect(homework.adoptPreparedWorksheets).toHaveBeenCalledWith({ studentId: 'st-1', fromKey: 'prep_st-1', toKey: 'inv-1' });
    expect(await screen.findByRole('button', { name: 'Lisa tahvlile: Avasta: peab, võib ja saab' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Harjuta/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Pilt/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Otsi töölehte'), { target: { value: 'peab' } });
    expect(screen.queryByRole('button', { name: 'Lisa tahvlile: Minu päev' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Lisa tahvlile: Avasta: peab, võib ja saab' }));
    await waitFor(() => expect(homework.openWorksheetInRoom).toHaveBeenCalledWith({ assignmentId: 'as-9', roomKey: 'inv-1' }));
    expect(lessonWorksheets.list).toHaveBeenCalledWith('a2b1-017');
    expect(library.assign.mock.calls[0][0]).toMatchObject({ students: [{ id: 'st-1', name: 'Mari' }], note: 'Live Classroom: Eesti keel', item: { sourceId: 'a2b1-017', source: { publishedWorksheetDoc: worksheetDoc } } });
    fireEvent.click(screen.getByRole('tab', { name: /Õpilase töölehed \(1\)/ }));
    fireEvent.change(screen.getByLabelText('Otsi töölehte'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa tahvlile: Isiklik: perekond' }));
    await waitFor(() => expect(homework.openWorksheetInRoom).toHaveBeenCalledWith({ assignmentId: 'own-1', roomKey: 'inv-1' }));
    expect(library.assign).toHaveBeenCalledTimes(1);
    act(() => homework.listeners.room([{ id: 'as-9', studentId: 'st-1', title: 'Minu päev', answers: {}, worksheetDoc, status: 'new' }]));
    await waitFor(() => expect(homework.subscribeWorksheetAssignment).toHaveBeenCalledWith('as-9', expect.any(Function), expect.any(Function)));
  });

  it('shows the room worksheet inline to the student', async () => {
    const homework = homeworkRepo();
    const { container } = render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="student" user={{ uid: 's', roles: ['student'] }} homework={homework} library={{ list: vi.fn() }} /></MemoryRouter>);
    expect(screen.getByText('Kui õpetaja lisab töölehe, ilmub see tahvlile.')).toBeInTheDocument();
    act(() => homework.listeners.room([{ id: 'as-9', studentId: 'st-1', title: 'Minu päev', answers: {}, worksheetDoc, status: 'new' }]));
    expect(await screen.findByRole('region', { name: 'Minu päev' })).toBeInTheDocument();
    expect(container.querySelector('.ws-page')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Esita tööleht/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('reports a failing subscription instead of crashing the room', () => {
    const homework = { ...homeworkRepo(), subscribeRoomWorksheets: () => { throw new Error('Firebase ei ole seadistatud.'); } };
    render(<MemoryRouter><RoomWorksheetPanel invitation={invitation} role="student" user={{ uid: 's' }} homework={homework} library={{ list: vi.fn() }} /></MemoryRouter>);
    return screen.findByRole('alert').then((alert) => expect(alert).toHaveTextContent('Firebase ei ole seadistatud.'));
  });
});
