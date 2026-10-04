import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveClassroomPage from './LiveClassroomPage.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function groupFake(room = null) {
  return {
    create: vi.fn(async () => ({ id: 'room-1', invitations: [] })),
    subscribeTeacherOpen: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }),
    subscribe: vi.fn((id, onChange) => { onChange(room || { id, teacherUid: 'teacher-1', teacherName: 'Pavel', title: 'Grupitund', status: 'open', members: [{ studentUid: 'student-user-1', studentName: 'Mari' }, { studentUid: 'student-user-2', studentName: 'Jaan' }] }); return vi.fn(); }),
    subscribeSignals: vi.fn(() => vi.fn()), sendSignal: vi.fn(async () => {}),
    heartbeat: vi.fn(async () => {}), subscribePresence: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }),
    close: vi.fn(async () => {}),
    subscribeMessages: vi.fn((id, onChange) => { onChange([{ id: 'm1', fromUid: 'student-user-2', fromName: 'Jaan', text: 'Tere kõigile!', createdAtIso: '2026-10-04T10:00:00Z' }]); return vi.fn(); }),
    sendMessage: vi.fn(async () => ({ id: 'm2' })),
  };
}

function renderPage({ user, invitationService, studentRepository, path = '/live-classroom', callSignalService, groupService = groupFake() }) {
  const signals = callSignalService || { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
  const presence = {
    heartbeat: vi.fn().mockResolvedValue(undefined),
    markOffline: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }),
  };
  const board = {
    subscribePages: vi.fn((studentId, onChange) => { onChange([]); return vi.fn(); }),
    subscribeElements: vi.fn((studentId, pageId, onChange) => { onChange([]); return vi.fn(); }),
    add: vi.fn().mockResolvedValue('el-1'), update: vi.fn().mockResolvedValue(undefined), remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(0), addPage: vi.fn().mockResolvedValue('page-1'),
  };
  const messages = { subscribeByStudent: vi.fn((studentId, onChange) => { onChange([]); return vi.fn(); }), send: vi.fn().mockResolvedValue({}) };
  const library = { list: vi.fn().mockResolvedValue({ curriculumLessons: [] }), assign: vi.fn() };
  const homework = { subscribeRoomWorksheets: vi.fn((query, onChange) => { onChange([]); return vi.fn(); }) };
  const recording = { subscribeForStudent: vi.fn(() => vi.fn()), subscribeForInvitation: vi.fn(() => vi.fn()) };
  return render(<AuthContext.Provider value={{ user }}><MemoryRouter initialEntries={[path]}><LiveClassroomPage invitationService={invitationService} studentRepository={studentRepository} callSignalService={signals} callPresenceService={presence} boardService={board} messagesRepository={messages} libraryRepository={library} worksheetHomework={homework} worksheetLibrary={library} recordingService={recording} groupService={groupService} groupBoard={board} /><LocationProbe /></MemoryRouter></AuthContext.Provider>);
}

describe('Live Classroom invitation lifecycle', () => {
  it('lets a teacher select a linked student and send an invitation', async () => {
    const invitationService = {
      subscribeOutgoing: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }),
      create: vi.fn().mockResolvedValue({ id: 'invite-1' }),
    };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', active: true, studentUid: 'student-user-1', subject: 'Eesti keel', level: 'A2' }] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository });
    fireEvent.change(await screen.findByLabelText('Õpilane'), { target: { value: 'student-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kutsu õpilane tundi' }));
    await waitFor(() => expect(invitationService.create).toHaveBeenCalledWith(expect.objectContaining({ student: expect.objectContaining({ id: 'student-1' }), title: 'Eesti keel' }), expect.objectContaining({ uid: 'teacher-1' })));
  });

  it('opens as the teacher workspace: choosing a student opens their board to prepare the lesson before inviting', async () => {
    const invitationService = {
      subscribeOutgoing: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }),
      create: vi.fn().mockResolvedValue({ id: 'invite-1' }),
    };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', active: true, studentUid: 'student-user-1', subject: 'Eesti keel', level: 'A2' }] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository });
    expect(await screen.findByRole('region', { name: 'Tööruum' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Õpilase tahvel' })).not.toBeInTheDocument();
    fireEvent.change(await screen.findByLabelText('Õpilane'), { target: { value: 'student-1' } });
    expect(await screen.findByRole('img', { name: 'Õpilase tahvel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Materjalid/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tahvel' })).toBeInTheDocument();
  });

  it('invites a group of students into one group room with a group board', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [
      { id: 'student-1', name: 'Mari', active: true, studentUid: 'student-user-1', subject: 'Eesti keel', level: 'A2' },
      { id: 'student-2', name: 'Jaan', active: true, studentUid: 'student-user-2', subject: 'Eesti keel', level: 'A2' },
      { id: 'student-3', name: 'Liis', active: true, studentUid: 'student-user-3', subject: 'Eesti keel', level: 'B1' },
    ] }) };
    const groupService = groupFake();
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository, groupService });
    fireEvent.click(await screen.findByRole('button', { name: /Grupitund/ }));
    fireEvent.click(await screen.findByRole('checkbox', { name: /Mari/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Jaan/ }));
    fireEvent.click(screen.getByRole('button', { name: /Kutsu grupp tundi \(2\/4\)/ }));
    await waitFor(() => expect(groupService.create).toHaveBeenCalled());
    expect(groupService.create.mock.calls[0][0].students.map((item) => item.id).sort()).toEqual(['student-1', 'student-2']);
    expect(groupService.create.mock.calls[0][1]).toEqual(expect.objectContaining({ uid: 'teacher-1' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('group=room-1'));
    expect(await screen.findByRole('region', { name: 'Grupitund' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Õpilase tahvel' })).toBeInTheDocument();
    expect(screen.getByText('Mari')).toBeInTheDocument();
    expect(screen.getByText('Jaan')).toBeInTheDocument();
  });

  it('group lesson chat: everyone in the room reads and writes', async () => {
    const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-g1', roomKey: 'room-9', teacherName: 'Pavel', studentName: 'Mari', studentId: 's-1', title: 'Grupitund', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }) };
    const groupService = groupFake();
    renderPage({ user: { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, invitationService, studentRepository: {}, path: '/live-classroom?invitation=invite-g1', groupService });
    fireEvent.click(await screen.findByRole('button', { name: 'Vestlus' }));
    expect(screen.getByText('Tere kõigile!')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Sõnum' }), { target: { value: 'Tere, Jaan!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada' }));
    await waitFor(() => expect(groupService.sendMessage).toHaveBeenCalledWith('room-9', expect.objectContaining({ text: 'Tere, Jaan!', name: 'Mari' })));
  });

  it('a student who accepted a group invitation lands in the group room', async () => {
    const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-g1', roomKey: 'room-9', teacherName: 'Pavel', studentName: 'Mari', studentId: 's-1', title: 'Grupitund', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }) };
    const groupService = groupFake();
    renderPage({ user: { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, invitationService, studentRepository: {}, path: '/live-classroom?invitation=invite-g1', groupService });
    expect(await screen.findByRole('region', { name: 'Grupitund' })).toBeInTheDocument();
    expect(groupService.subscribe).toHaveBeenCalledWith('room-9', expect.any(Function), expect.any(Function));
    expect(screen.getByRole('button', { name: /Liitu kõnega/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lõpeta tund' })).not.toBeInTheDocument();
  });

  it('does not offer a student without a student account link', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', active: true, linkedParentId: 'parent-only' }] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository });
    expect(await screen.findByText('Kontoga seotud õpilasi ei ole')).toBeInTheDocument();
  });

  it('opens the full-screen lesson room for the student with the board and opt-in call', async () => {
    const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-1', teacherName: 'Pavel', studentName: 'Mari', studentId: 's-1', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }) };
    renderPage({ user: { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, invitationService, studentRepository: {}, path: '/live-classroom?invitation=invite-1' });
    expect(await screen.findByRole('region', { name: 'Tunniruum' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Liitu kõnega/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Õpilase tahvel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Materjalid/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lahku tunniruumist' }));
    expect(await screen.findByRole('region', { name: 'Minu tahvel' })).toBeInTheDocument();
  });

  it('without a lesson the student has their own board in Live Classroom', async () => {
    const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([]); return vi.fn(); }) };
    const studentRepository = { listSelf: vi.fn().mockResolvedValue([{ id: 's-1', name: 'Mari', subject: 'Eesti keel' }]) };
    renderPage({ user: { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, invitationService, studentRepository });
    expect(await screen.findByRole('region', { name: 'Minu tahvel' })).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Õpilase tahvel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uus leht' })).toBeInTheDocument();
    expect(studentRepository.listSelf).toHaveBeenCalledWith('student-user-1');
  });

  it('does not select an old accepted invitation as the teacher default room', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'accepted-old', studentName: 'Mari', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository });
    expect(await screen.findByRole('region', { name: 'Tööruum' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Tunniruum' })).not.toBeInTheDocument();
  });

  it('clears a declined invitation id so the teacher can immediately start another lesson', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'declined-1', studentName: 'Mari', title: 'Eesti keel', status: 'declined', expiresAt: new Date(Date.now() + 60_000).toISOString() }]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository, path: '/live-classroom?invitation=declined-1' });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/live-classroom'));
    expect(screen.getByTestId('location')).not.toHaveTextContent('invitation=');
    expect(screen.getByRole('region', { name: 'Tööruum' })).toBeInTheDocument();
  });

  it('ends the lesson from the room menu and releases the teacher for a new invitation', async () => {
    const invitationService = {
      subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'accepted-1', studentName: 'Mari', studentId: 's-1', teacherName: 'Pavel', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }), getById: vi.fn().mockResolvedValue({ id: 's-1', subject: 'Eesti keel', recordingConsent: false }) };
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository, path: '/live-classroom?invitation=accepted-1' });
    expect(await screen.findByRole('region', { name: 'Tunniruum' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alusta kõnet/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Materjalid/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Lõpeta tund' }));
    await waitFor(() => expect(invitationService.close).toHaveBeenCalledWith('accepted-1', expect.objectContaining({ uid: 'teacher-1' })));
    await waitFor(() => expect(screen.getByTestId('location')).not.toHaveTextContent('invitation='));
    // no calendar link for this room: the calendar opens filtered to the student to mark the lesson
    expect(screen.getByTestId('location')).toHaveTextContent('/calendar?student=s-1');
    globalThis.confirm.mockRestore();
  });

  it('after ending a room started from the calendar, opens that lesson to mark it held', async () => {
    globalThis.localStorage.setItem('keelesepp.liveLessonLinks', JSON.stringify({ 'accepted-2': 'sch-1:2026-10-04|2026-10-04' }));
    const invitationService = {
      subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'accepted-2', studentName: 'Mari', studentId: 's-1', teacherName: 'Pavel', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }), getById: vi.fn().mockResolvedValue({ id: 's-1' }) };
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository, path: '/live-classroom?invitation=accepted-2' });
    fireEvent.click(await screen.findByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Lõpeta tund' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/calendar?lesson=${encodeURIComponent('sch-1:2026-10-04|2026-10-04')}`));
    globalThis.confirm.mockRestore();
    globalThis.localStorage.clear();
  });
});
