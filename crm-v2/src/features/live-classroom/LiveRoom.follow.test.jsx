import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';

// the call's data channel is replaced by a controllable fake; everything else is the real room
const room = vi.hoisted(() => {
  const state = { listener: null, sent: [] };
  return {
    state,
    send: (message) => { state.sent.push(message); return true; },
    on: (listener) => { state.listener = listener; return () => { if (state.listener === listener) state.listener = null; }; },
  };
});
vi.mock('./useLiveCall.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useLiveCall: (options) => ({ ...actual.useLiveCall(options), roomChannelOpen: true, sendRoom: room.send, onRoomMessage: room.on }) };
});

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-1', roomKey: 'inv-1', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Inglise keel', status: 'accepted', respondedAt: new Date().toISOString() };

function boardService() {
  const pages = [{ id: 'p1', title: 'Tund 1', order: 1 }];
  return {
    subscribePages: vi.fn((id, onChange) => { onChange(pages); return vi.fn(); }),
    subscribeElements: vi.fn((id, page, onChange) => { onChange([]); return vi.fn(); }),
    add: vi.fn(async () => 'e1'), update: vi.fn(async () => {}), remove: vi.fn(async () => {}), clear: vi.fn(async () => 0),
    addPage: vi.fn(async () => 'p2'), renamePage: vi.fn(async () => {}),
  };
}

function renderRoom(role) {
  const user = role === 'teacher' ? { uid: 'teach', displayName: 'Pavel', roles: ['teacher'] } : { uid: 'stud', displayName: 'Julia', roles: ['student'] };
  const callProps = {
    signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
    presenceService: { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn(() => vi.fn()) },
    turnService: null,
  };
  render(<MemoryRouter><LiveRoom invitation={invitation} role={role} user={user} callProps={callProps} boardService={boardService()}
    messagesRepository={{ subscribeByStudent: vi.fn(() => vi.fn()), send: vi.fn() }} library={{ list: vi.fn().mockResolvedValue({ curriculumLessons: [] }) }}
    worksheetProps={{ homework: { subscribeRoomWorksheets: vi.fn(() => vi.fn()) } }} recordingService={{ subscribeForStudent: vi.fn(() => vi.fn()) }}
    streams={{ local: null, remote: null }} onLeave={vi.fn()} onEndLesson={vi.fn()} student={{ subject: 'Inglise keel', recordingConsent: false }} /></MemoryRouter>);
}
const tab = (name) => screen.getByRole('tab', { name });
const deliver = (message) => act(() => { room.state.listener?.(message); });

beforeEach(() => { room.state.listener = null; room.state.sent = []; });

describe('LiveRoom: the student follows the teacher', () => {
  it('the teacher sends the open page and the pointer with its page', () => {
    renderRoom('teacher');
    expect(room.state.sent).toContainEqual({ t: 'page', pageId: '' });
    fireEvent.click(tab('Tund 1'));
    expect(room.state.sent.at(-1)).toEqual({ t: 'page', pageId: 'p1' });
    fireEvent.click(screen.getByRole('button', { name: 'Osuti' }));
    fireEvent.pointerMove(screen.getByRole('img', { name: 'Õpilase tahvel' }), { clientX: 40, clientY: 30 });
    expect(room.state.sent.at(-1)).toEqual({ t: 'ptr', x: 40, y: 30, pageId: 'p1' });
  });

  it('the student goes to the teacher’s page, sees the pointer there, can step away and come back', () => {
    renderRoom('student');
    deliver({ t: 'page', pageId: 'p1' });
    expect(tab('Tund 1')).toHaveAttribute('aria-selected', 'true');
    deliver({ t: 'ptr', x: 10, y: 20, pageId: 'p1' });
    expect(screen.getByTestId('teacher-pointer')).toBeInTheDocument();
    deliver({ t: 'ptr', off: true });
    expect(screen.queryByTestId('teacher-pointer')).toBeNull();

    fireEvent.click(tab('Tahvel'));
    fireEvent.click(screen.getByRole('button', { name: 'Mine õpetaja lehele' }));
    expect(tab('Tund 1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('button', { name: 'Mine õpetaja lehele' })).toBeNull();
  });

  it('with following switched off the student stays where they are', () => {
    renderRoom('student');
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Ära jälgi õpetaja lehte' }));
    deliver({ t: 'page', pageId: 'p1' });
    expect(tab('Tahvel')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Mine õpetaja lehele' })).toBeInTheDocument();
  });
});

describe('LiveRoom: the live board (owner 2026-10-23, „like Miro”)', () => {
  it('a line, a shape or a text being made shows on the other side before it is saved', () => {
    renderRoom('student');
    deliver({ t: 'd', pageId: '', draft: { type: 'stroke', points: [{ x: 1, y: 2 }, { x: 30, y: 40 }], color: '#1C2B3A', strokeWidth: 4 } });
    expect(screen.getByTestId('remote-draft').querySelector('path')).toHaveAttribute('d', 'M 1 2 L 30 40');
    deliver({ t: 'd', pageId: '', draft: null });
    expect(screen.queryByTestId('remote-draft')).toBeNull();
    // a draft on another page is not shown here
    deliver({ t: 'd', pageId: 'p1', draft: { type: 'shape', shape: 'rect', x: 0, y: 0, w: 10, h: 10 } });
    expect(screen.queryByTestId('remote-draft')).toBeNull();
  });

  it('the other side’s cursor carries their name', () => {
    renderRoom('student');
    deliver({ t: 'cur', pageId: '', x: 100, y: 50 });
    expect(screen.getByTestId('remote-cursor')).toHaveTextContent('Pavel');
    deliver({ t: 'cur', off: true });
    expect(screen.queryByTestId('remote-cursor')).toBeNull();
  });

  it('the teacher’s cursor goes to the student while it moves', () => {
    renderRoom('teacher');
    fireEvent.pointerMove(screen.getByRole('img', { name: 'Õpilase tahvel' }), { clientX: 40, clientY: 30 });
    expect(room.state.sent).toContainEqual({ t: 'cur', pageId: '', x: 40, y: 30, typing: false });
  });

  it('the teacher leads the view; the student follows until he moves the board himself', () => {
    const rect = vi.spyOn(globalThis.Element.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, width: 800, height: 500, right: 800, bottom: 500 });
    try {
      renderRoom('teacher');
      fireEvent.click(screen.getByRole('button', { name: 'Juhi vaadet: õpilane näeb sama kohta' }));
      const lead = room.state.sent.filter((message) => message.t === 'view').at(-1);
      expect(lead).toMatchObject({ t: 'view', pageId: '' });
      // the whole 800 × 500 screen of the teacher, in board units
      expect((lead.x2 - lead.x1) / (lead.y2 - lead.y1)).toBeCloseTo(800 / 500, 2);
      fireEvent.click(screen.getByRole('button', { name: 'Lõpeta vaate juhtimine' }));
      expect(room.state.sent.at(-1)).toEqual({ t: 'view', off: true });
    } finally { rect.mockRestore(); }
  });

  it('the student is brought to the teacher’s view and can come back after moving away', () => {
    const rect = vi.spyOn(globalThis.Element.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, width: 800, height: 500, right: 800, bottom: 500 });
    try {
      renderRoom('student');
      deliver({ t: 'view', pageId: '', x1: 100, y1: 100, x2: 500, y2: 350 });
      expect(screen.getByText('200%')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Vähenda' }));
      expect(screen.getByRole('button', { name: 'Jälgi õpetaja vaadet' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Jälgi õpetaja vaadet' }));
      expect(screen.getByText('200%')).toBeInTheDocument();
      deliver({ t: 'view', off: true });
      expect(screen.queryByRole('button', { name: 'Jälgi õpetaja vaadet' })).toBeNull();
    } finally { rect.mockRestore(); }
  });
});
