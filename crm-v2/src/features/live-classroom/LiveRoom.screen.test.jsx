import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';
import { beforeAll as preloadBeforeAll } from 'vitest';
import { preloadLiveClassroomParts } from './lazyParts.testkit.js';

// the room's views and panels are lazy: load them once, so the tests wait for behaviour, not for module loading
preloadBeforeAll(() => preloadLiveClassroomParts(), 60000);

// the real call hook, with the other side's screen share switched on and off from the test
const share = vi.hoisted(() => ({ remoteScreen: { active: false, stream: null }, canShareScreen: false, listeners: new Set() }));
vi.mock('./useLiveCall.js', async (importOriginal) => {
  const actual = await importOriginal();
  const { useEffect, useState } = await import('react');
  return {
    ...actual,
    useLiveCall: (options) => {
      const call = actual.useLiveCall(options);
      const [, setTick] = useState(0);
      useEffect(() => { const bump = () => setTick((n) => n + 1); share.listeners.add(bump); return () => share.listeners.delete(bump); }, []);
      return { ...call, remoteScreen: share.remoteScreen, canShareScreen: share.canShareScreen };
    },
  };
});
const setShare = (remoteScreen) => act(() => { share.remoteScreen = remoteScreen; share.listeners.forEach((bump) => bump()); });

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-1', roomKey: 'inv-1', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Inglise keel', status: 'accepted', respondedAt: new Date().toISOString() };
const boardService = () => ({
  subscribePages: vi.fn((id, onChange) => { onChange([{ id: 'p1', title: 'Tund 1', order: 1 }]); return vi.fn(); }),
  subscribeElements: vi.fn((id, page, onChange) => { onChange([]); return vi.fn(); }),
  add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn(), addPage: vi.fn(), renamePage: vi.fn(),
});
function renderRoom(role) {
  const user = role === 'teacher' ? { uid: 'teach', displayName: 'Pavel', roles: ['teacher'] } : { uid: 'stud', displayName: 'Julia', roles: ['student'] };
  const callProps = {
    signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
    presenceService: { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn(() => vi.fn()) },
    turnService: null,
  };
  return render(<MemoryRouter><LiveRoom invitation={invitation} role={role} user={user} callProps={callProps} boardService={boardService()}
    messagesRepository={{ subscribeByStudent: vi.fn(() => vi.fn()), send: vi.fn() }} library={{ list: vi.fn().mockResolvedValue({ curriculumLessons: [] }) }}
    worksheetProps={{ homework: { subscribeRoomWorksheets: vi.fn(() => vi.fn()) } }} recordingService={{ subscribeForStudent: vi.fn(() => vi.fn()) }}
    streams={{ local: null, remote: null }} onLeave={vi.fn()} onEndLesson={vi.fn()} student={{ subject: 'Inglise keel', recordingConsent: false }} /></MemoryRouter>);
}

beforeEach(() => { share.remoteScreen = { active: false, stream: null }; share.canShareScreen = false; globalThis.localStorage.clear(); });

describe('LiveRoom: the other side shares its screen', () => {
  it('the student sees the teacher’s screen big, can switch to the board and back; the layout returns when it ends', () => {
    renderRoom('student');
    expect(screen.queryByRole('group', { name: 'Põhivaade' })).toBeNull();
    expect(screen.getByRole('group', { name: 'Video: Pavel' })).toBeInTheDocument();

    setShare({ active: true, stream: { id: 'screen' } });
    const stage = screen.getByRole('region', { name: 'Pavel jagab ekraani' });
    expect(stage.className).not.toContain('is-hidden');
    expect(stage.querySelector('video').srcObject).toEqual({ id: 'screen' });
    expect(screen.getByRole('button', { name: 'Täisekraan' })).toBeInTheDocument();
    // the camera stays in its own small window
    expect(screen.getByRole('group', { name: 'Video: Pavel' })).toHaveTextContent('jagab ekraani');
    expect(screen.getByRole('button', { name: 'Ekraan' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Tahvel' }));
    expect(screen.getByRole('button', { name: 'Tahvel' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('.lr-screen').className).toContain('is-hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Ekraan' }));
    expect(document.querySelector('.lr-screen').className).not.toContain('is-hidden');

    setShare({ active: false, stream: null });
    expect(document.querySelector('.lr-screen')).toBeNull();
    expect(screen.queryByRole('group', { name: 'Põhivaade' })).toBeNull();
  });

  it('a new share opens on the screen again even if the board was chosen last time', () => {
    renderRoom('teacher');
    setShare({ active: true, stream: { id: 's1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tahvel' }));
    setShare({ active: false, stream: null });
    setShare({ active: true, stream: { id: 's2' } });
    expect(screen.getByRole('button', { name: 'Ekraan' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('region', { name: 'Julia jagab ekraani' }).className).not.toContain('is-hidden');
  });

  it('the own and the other side’s picture are separate windows', () => {
    renderRoom('teacher');
    expect(screen.getByRole('group', { name: 'Video: Julia' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Video: sina' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Peida oma pilt' }));
    expect(screen.getByRole('button', { name: 'Näita oma pilti' })).toBeInTheDocument();
  });
});
