import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';
import { sampleDocument } from '../worksheet-studio/engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-now', roomKey: 'inv-now', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Eesti keel', status: 'accepted', respondedAt: new Date().toISOString() };
const assignment = (id, title, roomKey, openedAt) => ({ id, title, status: 'assigned', studentId: 's-1', liveRoomKey: roomKey, liveOpenedAt: openedAt, worksheetDoc: sampleDocument(), answers: {} });
const today = assignment('c1', 'Täna', 'inv-now', '2026-11-04T15:00:00.000Z');
const past = [
  today,
  assignment('b1', 'Eelmine', 'inv-old2', '2026-10-27T15:00:00.000Z'),
  assignment('a1', 'Vana', 'inv-old1', '2026-10-20T15:00:00.000Z'),
];

function services() {
  const pages = [
    { id: 'p1', title: 'Tööleht: Vana' }, { id: 'p2', title: 'Tööleht: Eelmine' }, { id: 'p3', title: 'Tund 20.10.2026' }, { id: 'p4', title: 'Tööleht: Täna' },
  ];
  return {
    board: {
      subscribePages: vi.fn((id, onChange) => { onChange(pages); return vi.fn(); }),
      subscribeElements: vi.fn((id, page, onChange) => { onChange([]); return vi.fn(); }),
      add: vi.fn(async () => 'e1'), update: vi.fn(async () => {}), remove: vi.fn(async () => {}), clear: vi.fn(async () => 0), addPage: vi.fn(async () => 'px'),
    },
    chat: { subscribeByStudent: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }), send: vi.fn() },
    library: { list: vi.fn().mockResolvedValue({ curriculumLessons: [] }), assign: vi.fn(), uploadFile: vi.fn() },
    homework: {
      subscribeRoomWorksheets: vi.fn((query, onChange) => { onChange([today]); return vi.fn(); }),
      subscribeStudentLiveWorksheets: vi.fn((id, onChange) => { onChange(past); return vi.fn(); }),
      subscribeWorksheetAssignment: vi.fn((id, onChange) => { onChange(past.find((item) => item.id === id) || today); return vi.fn(); }),
    },
    call: {
      signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
      presenceService: { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }) },
    },
    countdown: { subscribe: vi.fn((kind, id, onChange) => { onChange(null, {}); return vi.fn(); }), set: vi.fn() },
  };
}

function renderRoom(role, s) {
  const user = role === 'teacher' ? { uid: 'teach', displayName: 'Pavel', roles: ['teacher'] } : { uid: 'stud', displayName: 'Julia', roles: ['student'] };
  render(<MemoryRouter><LiveRoom invitation={invitation} role={role} user={user} callProps={s.call} boardService={s.board} messagesRepository={s.chat} library={s.library}
    worksheetProps={{ homework: s.homework, library: s.library }} recordingService={{ subscribeForStudent: vi.fn(() => vi.fn()) }} countdownService={s.countdown}
    streams={{ local: null, remote: null }} onLeave={vi.fn()} onEndLesson={vi.fn()} student={{ subject: 'Eesti keel', recordingConsent: false }} /></MemoryRouter>);
}

const tabs = () => within(screen.getByRole('tablist', { name: 'Tahvli lehed' })).getAllByRole('tab').map((tab) => tab.textContent);

describe('the student\'s worksheet tabs in the live lesson', () => {
  it('shows only this lesson\'s sheet; older sheets wait in „Varasemad tunnid” grouped by lesson date', async () => {
    renderRoom('student', services());
    await waitFor(() => expect(tabs()).toContain('Tööleht: Täna'));
    // board pages that are not worksheets stay as they are
    expect(tabs()).toEqual(['Tahvel', 'Tund 20.10.2026', 'Tööleht: Täna']);
    const older = screen.getByRole('combobox', { name: 'Varasemad tunnid' });
    const groups = [...older.querySelectorAll('optgroup')].map((group) => [group.label, [...group.querySelectorAll('option')].map((option) => option.textContent)]);
    expect(groups).toEqual([['27.10.2026', ['Eelmine']], ['20.10.2026', ['Vana']]]);
  });

  it('an older sheet opened from the list becomes a tab until the student closes it', async () => {
    renderRoom('student', services());
    const older = await screen.findByRole('combobox', { name: 'Varasemad tunnid' });
    act(() => { fireEvent.change(older, { target: { value: 'a1' } }); });
    expect(await screen.findByRole('tab', { name: 'Tööleht: Vana' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Tahvel' }));
    expect(screen.getByRole('tab', { name: 'Tööleht: Vana' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge „Tööleht: Vana”' }));
    expect(screen.queryByRole('tab', { name: 'Tööleht: Vana' })).toBeNull();
  });

  it('the teacher keeps every tab and has no dropdown', async () => {
    renderRoom('teacher', services());
    await waitFor(() => expect(tabs()).toContain('Tööleht: Vana'));
    expect(tabs()).toHaveLength(5);
    expect(screen.queryByRole('combobox', { name: 'Varasemad tunnid' })).toBeNull();
  });
});
