import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';
import { sampleDocument } from '../worksheet-studio/engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-1', roomKey: 'inv-1', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Inglise keel', status: 'accepted', respondedAt: new Date(Date.now() - 65_000).toISOString() };

function services({ messages = [], worksheets = [], lessons = [] } = {}) {
  let elements = [];
  let elementListener = () => {};
  let messageListener = () => {};
  let sheetListener = () => {};
  const board = {
    subscribePages: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }),
    subscribeElements: vi.fn((id, page, onChange) => { elementListener = onChange; onChange(elements); return vi.fn(); }),
    add: vi.fn(async (id, page, data) => { const created = { id: `e${elements.length + 1}`, ...data }; elements = [...elements, created]; elementListener(elements); return created.id; }),
    update: vi.fn(async () => {}),
    remove: vi.fn(async (id, page, elementId) => { elements = elements.filter((item) => item.id !== elementId); elementListener(elements); }),
    clear: vi.fn(async () => 0),
    addPage: vi.fn(async () => 'p1'),
  };
  const chat = {
    subscribeByStudent: vi.fn((id, onChange) => { messageListener = onChange; onChange(messages); return vi.fn(); }),
    send: vi.fn(async (data, user) => { messageListener([...messages, { id: 'm-new', text: data.text, fromUid: user.uid, fromName: user.displayName }]); }),
  };
  const library = { list: vi.fn().mockResolvedValue({ curriculumLessons: lessons }), assign: vi.fn(), uploadFile: vi.fn() };
  const homework = { subscribeRoomWorksheets: vi.fn((query, onChange) => { sheetListener = onChange; onChange(worksheets); return vi.fn(); }) };
  const call = {
    signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
    presenceService: { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn((id, onChange) => { onChange([{ role: 'student', uid: 'stud', lastSeenAt: new Date().toISOString(), online: true }]); return vi.fn(); }) },
  };
  return { board, chat, library, homework, call, pushSheet: (items) => sheetListener(items), pushMessages: (items) => messageListener(items) };
}

function renderRoom(role, s, extra = {}) {
  const user = role === 'teacher' ? { uid: 'teach', displayName: 'Pavel', roles: ['teacher'] } : { uid: 'stud', displayName: 'Julia', roles: ['student'] };
  const props = {
    invitation, role, user, callProps: s.call, boardService: s.board, messagesRepository: s.chat, library: s.library,
    worksheetProps: { homework: s.homework, library: s.library }, recordingService: { subscribeForStudent: vi.fn(() => vi.fn()) },
    streams: { local: null, remote: null }, onLeave: vi.fn(), onEndLesson: vi.fn(), student: { subject: 'Inglise keel', recordingConsent: false }, ...extra,
  };
  render(<MemoryRouter><LiveRoom {...props} /></MemoryRouter>);
  return props;
}

describe('LiveRoom', () => {
  it('shows the lesson bar like the design: date title, subject, running timer, call and room buttons', () => {
    renderRoom('teacher', services());
    const bar = screen.getByRole('region', { name: 'Tunniruum' });
    expect(within(bar).getByText(/^Tund — \d\d\.\d\d\.\d{4}$/)).toBeInTheDocument();
    expect(within(bar).getAllByText('Inglise keel').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Tunni kestus')).toHaveTextContent(/00:01:0\d/);
    for (const name of [/Alusta kõnet/, 'Osalejad', 'Vestlus', /Materjalid/, /Ülesanded/, 'Võta tagasi', 'Tee uuesti']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Tahvli tööriistad' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Suurus' })).toBeInTheDocument();
    expect(screen.getByText('Julia')).toBeInTheDocument();
  });

  it('draws on the board and undoes / redoes from the top bar', async () => {
    const s = services();
    renderRoom('student', s);
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.pointerDown(svg, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 60, clientY: 60 });
    fireEvent.pointerUp(svg, { clientX: 60, clientY: 60 });
    await waitFor(() => expect(s.board.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ type: 'stroke', strokeWidth: 4 }), expect.objectContaining({ uid: 'stud' })));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Võta tagasi' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Võta tagasi' }));
    await waitFor(() => expect(s.board.remove).toHaveBeenCalledWith('s-1', null, 'e1'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tee uuesti' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Tee uuesti' }));
    await waitFor(() => expect(s.board.add).toHaveBeenCalledTimes(2));
  });

  it('XL makes the pen thicker', async () => {
    const s = services();
    renderRoom('student', s);
    fireEvent.click(screen.getByRole('button', { name: 'XL' }));
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.pointerDown(svg, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 60, clientY: 60 });
    fireEvent.pointerUp(svg, { clientX: 60, clientY: 60 });
    await waitFor(() => expect(s.board.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ strokeWidth: 14 }), expect.anything()));
  });

  it('chats with the student through the normal messages and counts new ones on the button', async () => {
    const s = services({ messages: [{ id: 'm1', text: 'Vana sõnum', fromUid: 'stud', fromName: 'Julia' }] });
    renderRoom('teacher', s);
    expect(screen.getByRole('button', { name: 'Vestlus' })).not.toHaveTextContent('1');
    act(() => s.pushMessages([{ id: 'm1', text: 'Vana sõnum', fromUid: 'stud', fromName: 'Julia' }, { id: 'm2', text: 'Ma ei saa aru', fromUid: 'stud', fromName: 'Julia' }]));
    expect(screen.getByRole('button', { name: 'Vestlus' })).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { name: 'Vestlus' }));
    const chat = screen.getByRole('region', { name: 'Vestlus' });
    expect(within(chat).getByText('Ma ei saa aru')).toBeInTheDocument();
    fireEvent.change(within(chat).getByLabelText('Sõnum'), { target: { value: 'Vaata tahvlit' } });
    await act(async () => { fireEvent.click(within(chat).getByRole('button', { name: 'Saada' })); });
    expect(s.chat.send).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's-1', studentName: 'Julia', text: 'Vaata tahvlit' }), expect.objectContaining({ uid: 'teach' }));
  });

  it('counts the first message of an empty conversation as new', () => {
    const s = services();
    renderRoom('teacher', s);
    act(() => s.pushMessages([{ id: 'm1', text: 'Tere', fromUid: 'stud', fromName: 'Julia' }]));
    expect(screen.getByRole('button', { name: 'Vestlus' })).toHaveTextContent('1');
  });

  it('puts a PDF material from Õppevara on the board', async () => {
    const s = services({ lessons: [{ id: 'l1', title: 'Present Simple', level: 'A2', files: [{ name: 'Leht.pdf', url: 'https://files.example/leht.pdf', type: 'application/pdf' }] }] });
    renderRoom('teacher', s);
    fireEvent.click(screen.getByRole('button', { name: /Materjalid/ }));
    const panel = screen.getByRole('region', { name: 'Materjalid' });
    await waitFor(() => expect(s.library.list).toHaveBeenCalled());
    await act(async () => { fireEvent.click(await within(panel).findByRole('button', { name: /Leht\.pdf/ }, { timeout: 4000 })); });
    await waitFor(() => expect(s.board.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ type: 'pdf', url: 'https://files.example/leht.pdf', name: 'Leht.pdf' }), expect.objectContaining({ uid: 'teach' })));
    expect(await screen.findByRole('status')).toHaveTextContent('„Leht.pdf” on tahvlil.');
  });

  it('opens the worksheet for the student as soon as the teacher opens it', async () => {
    const s = services();
    renderRoom('student', s);
    const sheet = () => screen.getByText('Ülesanded', { selector: 'strong' }).closest('.lr-sheet');
    expect(sheet()).not.toHaveClass('is-open');
    act(() => s.pushSheet([{ id: 'a1', title: 'Tööleht', status: 'assigned', studentId: 's-1', worksheetDoc: sampleDocument(), answers: {} }]));
    await waitFor(() => expect(sheet()).toHaveClass('is-open'));
  });

  it('a student has no materials button and cannot end the lesson', () => {
    renderRoom('student', services());
    expect(screen.queryByRole('button', { name: /Materjalid/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    expect(screen.queryByRole('menuitem', { name: 'Lõpeta tund' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Lahku tunniruumist' })).toBeInTheDocument();
  });
});
