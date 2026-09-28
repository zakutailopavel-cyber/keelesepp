import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveClassroomPage from './LiveClassroomPage.jsx';

function renderPage({ user, invitationService, studentRepository, path = '/live-classroom' }) {
  return render(<AuthContext.Provider value={{ user }}><MemoryRouter initialEntries={[path]}><LiveClassroomPage invitationService={invitationService} studentRepository={studentRepository} /></MemoryRouter></AuthContext.Provider>);
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

  it('shows the same accepted waiting room to the student', async () => {
    const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'invite-1', teacherName: 'Pavel', studentName: 'Mari', title: 'Eesti keel', status: 'accepted', expiresAt: new Date(Date.now() + 60_000).toISOString() }]); return vi.fn(); }) };
    renderPage({ user: { uid: 'student-user-1', displayName: 'Mari', roles: ['student'] }, invitationService, studentRepository: {}, path: '/live-classroom?invitation=invite-1' });
    expect(await screen.findByText('Pavel valmistab tunniruumi ette.')).toBeInTheDocument();
    expect(screen.getByText('Ühenduse sild on loodud')).toBeInTheDocument();
  });
});
