import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveClassroomPage from './LiveClassroomPage.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderPage({ user, invitationService, studentRepository, path = '/live-classroom', callSignalService }) {
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
  return render(<AuthContext.Provider value={{ user }}><MemoryRouter initialEntries={[path]}><LiveClassroomPage invitationService={invitationService} studentRepository={studentRepository} callSignalService={signals} callPresenceService={presence} boardService={board} messagesRepository={messages} libraryRepository={library} worksheetHomework={homework} worksheetLibrary={library} recordingService={recording} /><LocationProbe /></MemoryRouter></AuthContext.Provider>);
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
    expect(await screen.findByRole('heading', { name: 'Live Classroom' })).toBeInTheDocument();
  });

  it('does not select an old accepted invitation as the teacher default room', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'accepted-old', studentName: 'Mari', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() - 60_000).toISOString() }]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository });
    expect(await screen.findByText('Kutsu õpilane tundi')).toBeInTheDocument();
    expect(screen.queryByText('Mari võttis kutse vastu.')).not.toBeInTheDocument();
  });

  it('clears a declined invitation id so the teacher can immediately start another lesson', async () => {
    const invitationService = { subscribeOutgoing: vi.fn((uid, onChange) => { onChange([{ id: 'declined-1', studentName: 'Mari', title: 'Eesti keel', status: 'declined', expiresAt: new Date(Date.now() + 60_000).toISOString() }]); return vi.fn(); }) };
    const studentRepository = { list: vi.fn().mockResolvedValue({ items: [] }) };
    renderPage({ user: { uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, invitationService, studentRepository, path: '/live-classroom?invitation=declined-1' });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/live-classroom'));
    expect(screen.getByTestId('location')).not.toHaveTextContent('invitation=');
    expect(screen.getByText('Kutsu õpilane tundi')).toBeInTheDocument();
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
    globalThis.confirm.mockRestore();
  });
});
