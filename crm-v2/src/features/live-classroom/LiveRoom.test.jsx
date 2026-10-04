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
  let pages = [];
  let pageListener = () => {};
  let messageListener = () => {};
  let sheetListener = () => {};
  const board = {
    subscribePages: vi.fn((id, onChange) => { pageListener = onChange; onChange(pages); return vi.fn(); }),
    subscribeElements: vi.fn((id, page, onChange) => { elementListener = onChange; onChange(elements); return vi.fn(); }),
    add: vi.fn(async (id, page, data) => { const created = { id: `e${elements.length + 1}`, ...data }; elements = [...elements, created]; elementListener(elements); return created.id; }),
    update: vi.fn(async () => {}),
    remove: vi.fn(async (id, page, elementId) => { elements = elements.filter((item) => item.id !== elementId); elementListener(elements); }),
    clear: vi.fn(async () => 0),
    addPage: vi.fn(async (id, title) => { const pageId = `p${pages.length + 1}`; pages = [...pages, { id: pageId, title }]; pageListener(pages); return pageId; }),
  };
  const chat = {
    subscribeByStudent: vi.fn((id, onChange) => { messageListener = onChange; onChange(messages); return vi.fn(); }),
    send: vi.fn(async (data, user) => { messageListener([...messages, { id: 'm-new', text: data.text, fromUid: user.uid, fromName: user.displayName }]); }),
  };
  const library = { list: vi.fn().mockResolvedValue({ curriculumLessons: lessons }), assign: vi.fn(), uploadFile: vi.fn() };
  const homework = {
    subscribeRoomWorksheets: vi.fn((query, onChange) => { sheetListener = onChange; onChange(worksheets); return vi.fn(); }),
    subscribeWorksheetAssignment: vi.fn((id, onChange) => { onChange({ id, title: 'Minevik', status: 'assigned', worksheetDoc: sampleDocument(), answers: {} }); return vi.fn(); }),
  };
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

  it('opens camera and microphone settings from „Rohkem” for the student too', () => {
    renderRoom('student', services());
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Kaamera ja mikrofon' }));
    const drawer = screen.getByRole('region', { name: 'Kaamera ja mikrofon' });
    expect(within(drawer).getByText(/Seadmed ilmuvad, kui kõne on alanud/)).toBeInTheDocument();
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

  it('puts the opened worksheet on the board as its own page: the teacher creates it, both switch to it', async () => {
    const s = services();
    renderRoom('teacher', s);
    act(() => s.pushSheet([{ id: 'a1', title: 'Minevik', status: 'assigned', studentId: 's-1', worksheetDoc: sampleDocument(), answers: {} }]));
    await waitFor(() => expect(s.board.addPage).toHaveBeenCalledWith('s-1', 'Tööleht: Minevik', 1, expect.objectContaining({ uid: 'teach' })));
    expect(await screen.findByRole('tab', { name: 'Tööleht: Minevik' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Täida töölehte' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('.sb-underlay')).not.toBeNull();
    expect(document.querySelector('.lr-sheet')).toBeNull();
  });

  it('the student switches to the worksheet page as soon as it exists and never creates it', async () => {
    const s = services();
    renderRoom('student', s);
    act(() => s.pushSheet([{ id: 'a1', title: 'Minevik', status: 'assigned', studentId: 's-1', worksheetDoc: sampleDocument(), answers: {} }]));
    expect(s.board.addPage).not.toHaveBeenCalled();
    await act(async () => { await s.board.addPage('s-1', 'Tööleht: Minevik', 1, { uid: 'teach' }); });
    expect(await screen.findByRole('tab', { name: 'Tööleht: Minevik' })).toHaveAttribute('aria-selected', 'true');
    expect(document.querySelector('.sb-underlay')).not.toBeNull();
  });

  it('a student has no materials button and cannot end the lesson', () => {
    renderRoom('student', services());
    expect(screen.queryByRole('button', { name: /Materjalid/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    expect(screen.queryByRole('menuitem', { name: 'Lõpeta tund' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Lahku tunniruumist' })).toBeInTheDocument();
  });
});

describe('LiveRoom words', () => {
  it('opens „Sõnad” and the teacher adds a word for this lesson', async () => {
    const wordsService = { subscribeForStudent: vi.fn((id, onData) => { onData([]); return vi.fn(); }), add: vi.fn(async () => ({})), remove: vi.fn() };
    renderRoom('teacher', services(), { wordsService });
    fireEvent.click(screen.getByRole('button', { name: /Sõnad/ }));
    const drawer = screen.getByRole('region', { name: 'Sõnad' });
    fireEvent.change(within(drawer).getByLabelText('Sõna või väljend'), { target: { value: 'kass' } });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Lisa sõnastikku' }));
    await waitFor(() => expect(wordsService.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's-1', invitationId: 'inv-1', word: 'kass' })));
  });
});

describe('LiveRoom homework', () => {
  it('the teacher gives homework from the lesson with the open board page', async () => {
    const s = services();
    await s.board.addPage('s-1', 'Tund 1');
    const homeworkService = { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn(async (input) => ({ id: 'h1', task: input.task, due: input.due, boardPageTitle: input.boardPage?.title })) };
    renderRoom('teacher', s, { homeworkService });
    fireEvent.click(screen.getByRole('tab', { name: 'Tund 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Anna kodutöö' }));
    const drawer = screen.getByRole('region', { name: 'Kodutöö' });
    fireEvent.click(within(drawer).getByRole('button', { name: /Korda tunni sõnu/ }));
    fireEvent.click(within(drawer).getByRole('checkbox', { name: /Lisa tahvlileht „Tund 1”/ }));
    fireEvent.click(within(drawer).getByRole('button', { name: 'Anna kodutöö' }));
    await waitFor(() => expect(homeworkService.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({
      invitation: expect.objectContaining({ id: 'inv-1' }), task: expect.stringContaining('Korda tunni sõnu'), boardPage: { id: 'p1', title: 'Tund 1' }, worksheet: null,
    })));
    expect(await within(drawer).findByText(/Tahvlileht „Tund 1”/)).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Selles tunnis antud (1)' })).toBeInTheDocument();
  });
});

describe('LiveRoom lesson end', () => {
  it('sends the summary with the lesson pages, words and homework, then ends the lesson', async () => {
    const s = services();
    await s.board.addPage('s-1', 'Tund 1');
    const summaryService = { save: vi.fn(async () => ({})) };
    const wordsService = { subscribeForStudent: vi.fn((id, onData) => { onData([{ id: 'w1', invitationId: 'inv-1', word: 'kass' }, { id: 'w0', invitationId: 'old', word: 'vana' }]); return vi.fn(); }) };
    const homeworkService = { listForLesson: vi.fn(async () => [{ id: 'h1', task: 'Korda sõnu' }]) };
    const props = renderRoom('teacher', s, { summaryService, wordsService, homeworkService });
    fireEvent.click(screen.getByRole('tab', { name: 'Tund 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Lõpeta tund' }));
    const drawer = screen.getByRole('region', { name: 'Tunni lõpp' });
    expect(within(drawer).getByText('kass')).toBeInTheDocument();
    expect(within(drawer).queryByText(/vana/)).toBeNull();
    expect(await within(drawer).findByText('Korda sõnu')).toBeInTheDocument();
    fireEvent.change(within(drawer).getByLabelText(/Sõnum õpilasele/), { target: { value: 'Tubli!' } });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Saada kokkuvõte ja lõpeta tund' }));
    await waitFor(() => expect(props.onEndLesson).toHaveBeenCalledWith({ confirmed: true }));
    expect(summaryService.save).toHaveBeenCalledWith(expect.objectContaining({ note: 'Tubli!', pages: [{ id: 'p1', title: 'Tund 1' }], subject: 'Inglise keel', invitation: expect.objectContaining({ id: 'inv-1' }) }));
  });

  it('a failed summary does not end the lesson but offers to end without it', async () => {
    const summaryService = { save: vi.fn(async () => { throw new Error('Võrk puudub.'); }) };
    const props = renderRoom('teacher', services(), { summaryService, wordsService: { subscribeForStudent: vi.fn(() => vi.fn()) }, homeworkService: { listForLesson: vi.fn(async () => []) } });
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Lõpeta tund' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saada kokkuvõte ja lõpeta tund' }));
    expect(await screen.findByText(/Võrk puudub\. Võid tunni lõpetada ka ilma kokkuvõtteta/)).toBeInTheDocument();
    expect(props.onEndLesson).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    expect(props.onEndLesson).toHaveBeenCalledWith({ confirmed: true });
  });
});

describe('LiveRoom: the student’s pet', () => {
  it('says hello and cheers for a new word and homework of this lesson', async () => {
    let pushWords = () => {};
    let pushHomework = () => {};
    const petRepository = { get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okas', wearing: { hat: 'cap' } }) };
    const wordsService = { subscribeForStudent: vi.fn((id, onData) => { pushWords = onData; onData([{ id: 'old', invitationId: 'inv-0', word: 'vana' }]); return vi.fn(); }) };
    const homeworkService = { subscribeForLesson: vi.fn((query, onData) => { pushHomework = onData; onData([]); return vi.fn(); }), listForLesson: vi.fn(async () => []) };
    renderRoom('student', services(), { petRepository, wordsService, homeworkService });
    expect(await screen.findByText('Tere! Okas on ka tunnis.')).toBeInTheDocument();
    act(() => pushWords([{ id: 'old', invitationId: 'inv-0', word: 'vana' }, { id: 'w1', invitationId: 'inv-1', word: 'kass', translation: 'кошка' }]));
    expect(await screen.findByText('Uus sõna: kass!')).toBeInTheDocument();
    expect(screen.getByText('Новое слово: kass — кошка')).toBeInTheDocument();
    act(() => pushHomework([{ id: 'h1', task: 'Korda sõnu' }]));
    expect(await screen.findByText('Õpetaja andis kodutöö. Teeme koos!')).toBeInTheDocument();
    expect(homeworkService.subscribeForLesson).toHaveBeenCalledWith({ studentId: 's-1', invitationId: 'inv-1' }, expect.any(Function), expect.any(Function));
  });

  it('is not there for the teacher or a student without a pet', async () => {
    const petRepository = { get: vi.fn().mockResolvedValue(null) };
    renderRoom('student', services(), { petRepository });
    await waitFor(() => expect(petRepository.get).toHaveBeenCalled());
    expect(screen.queryByText(/on ka tunnis/)).toBeNull();
  });
});
