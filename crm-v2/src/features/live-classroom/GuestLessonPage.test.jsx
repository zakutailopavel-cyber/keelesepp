import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GuestLessonPage from './GuestLessonPage.jsx';

function setup({ status = 'accepted', current = null } = {}) {
  const guestService = {
    currentAccount: vi.fn(() => current),
    join: vi.fn().mockResolvedValue({ uid: 'guest_abc', invitationId: 'inv-1', studentName: 'Mykyta', teacherName: 'Anhelina', title: 'Eesti keel' }),
  };
  const invitationService = { subscribeIncoming: vi.fn((uid, onChange) => { onChange([{ id: 'inv-1', teacherUid: 't1', teacherName: 'Anhelina', studentId: 's1', studentUid: 'guest_abc', studentName: 'Mykyta', title: 'Eesti keel', status, roomKey: 'inv-1', expiresAt: new Date(Date.now() + 3600_000).toISOString() }]); return vi.fn(); }) };
  const board = {
    subscribePages: vi.fn((studentId, onChange) => { onChange([]); return vi.fn(); }),
    subscribeElements: vi.fn((studentId, pageId, onChange) => { onChange([]); return vi.fn(); }),
    add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn(), addPage: vi.fn(),
  };
  const signals = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
  const presence = { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }) };
  const homework = { subscribeRoomWorksheets: vi.fn((query, onChange) => { onChange([]); return vi.fn(); }) };
  const recording = { subscribeForStudent: vi.fn(() => vi.fn()), subscribeForInvitation: vi.fn(() => vi.fn()) };
  render(<MemoryRouter initialEntries={['/tund/abcdefghijklmnopqrstuvwxyz12']}><Routes><Route path="/tund/:token" element={<GuestLessonPage guestService={guestService} invitationService={invitationService} callSignalService={signals} callPresenceService={presence} boardService={board} worksheetHomework={homework} recordingService={recording} />} /></Routes></MemoryRouter>);
  return { guestService, invitationService };
}

describe('GuestLessonPage', () => {
  it('joins by the link and opens the lesson room without the card-wide chat and words', async () => {
    const { guestService, invitationService } = setup();
    await waitFor(() => expect(guestService.join).toHaveBeenCalledWith('abcdefghijklmnopqrstuvwxyz12'));
    expect(await screen.findByRole('region', { name: 'Tunniruum' })).toBeInTheDocument();
    expect(invitationService.subscribeIncoming).toHaveBeenCalledWith('guest_abc', expect.any(Function), expect.any(Function));
    expect(screen.queryByRole('button', { name: 'Vestlus' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sõnad/ })).not.toBeInTheDocument();
  });

  it('tells the student when the lesson is over', async () => {
    setup({ status: 'closed' });
    expect(await screen.findByText('Tund on lõppenud')).toBeInTheDocument();
  });

  it('asks before replacing a signed-in account on this browser', async () => {
    const current = { getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }) };
    const { guestService } = setup({ current });
    fireEvent.click(await screen.findByRole('button', { name: 'Ava tund õpilasena' }));
    await waitFor(() => expect(guestService.join).toHaveBeenCalled());
  });
});
