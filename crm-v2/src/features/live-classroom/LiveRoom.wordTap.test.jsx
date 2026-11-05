import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';
import { sampleDocument } from '../worksheet-studio/engine/sample.js';
import { preloadLiveClassroomParts } from './lazyParts.testkit.js';

// 2026-11-05 (owner, live lesson, student on Windows Chrome): „a double click / a tap on a word no longer opens the
// translation card”. The whole live room (student / teacher) with a worksheet page and the one pointer „Vali ja täida”
// (#1112): a student's double click and finger tap on a sheet word open the „Puuduta sõna” card and ask languageApi
// /own-word; never with the pen, never in an answer field; the teacher on the sheet keeps Viga / Märkus / Sõna.
const lookups = vi.hoisted(() => ({
  checkOwnWord: vi.fn(async ({ text }) => ({ status: 'ok', lemma: text, translation: 'перевод', words: [], forms: { line: '', forms: [] } })),
}));
vi.mock('../../services/firebase/wordTap.js', () => ({
  wordTapService: {
    checkOwnWord: (input) => lookups.checkOwnWord(input),
    preferredLanguage: async () => 'ru',
    words: { listForStudent: async () => [], add: async (input) => input, addStudentWord: async (input) => input },
  },
}));

beforeAll(() => preloadLiveClassroomParts(), 60000);

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-now', roomKey: 'inv-now', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Eesti keel', status: 'accepted', respondedAt: new Date().toISOString() };

function services() {
  const sheet = { id: 'c1', title: 'Täna', status: 'assigned', studentId: 's-1', liveRoomKey: 'inv-now', liveOpenedAt: '2026-11-05T15:00:00.000Z', worksheetDoc: sampleDocument(), answers: {} };
  const pages = [{ id: 'p4', title: 'Tööleht: Täna' }];
  return {
    board: {
      subscribePages: vi.fn((id, onChange) => { onChange(pages); return vi.fn(); }),
      subscribeElements: vi.fn((id, page, onChange) => { onChange([]); return vi.fn(); }),
      add: vi.fn(async () => 'e1'), update: vi.fn(async () => {}), remove: vi.fn(async () => {}), clear: vi.fn(async () => 0), addPage: vi.fn(async () => 'px'),
    },
    chat: { subscribeByStudent: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }), send: vi.fn() },
    library: { list: vi.fn().mockResolvedValue({ curriculumLessons: [] }), assign: vi.fn(), uploadFile: vi.fn() },
    homework: {
      subscribeRoomWorksheets: vi.fn((query, onChange) => { onChange([sheet]); return vi.fn(); }),
      subscribeStudentLiveWorksheets: vi.fn((id, onChange) => { onChange([sheet]); return vi.fn(); }),
      subscribeWorksheetAssignment: vi.fn((id, onChange) => { onChange(sheet); return vi.fn(); }),
      saveWorksheetDraft: vi.fn(async () => {}),
    },
    call: {
      signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
      presenceService: { heartbeat: vi.fn().mockResolvedValue(undefined), markOffline: vi.fn().mockResolvedValue(undefined), subscribe: vi.fn((id, onChange) => { onChange([]); return vi.fn(); }) },
    },
    countdown: { subscribe: vi.fn((kind, id, onChange) => { onChange(null, {}); return vi.fn(); }), set: vi.fn() },
  };
}

async function renderRoom(role = 'student') {
  const s = services();
  const user = role === 'student' ? { uid: 'stud', displayName: 'Julia', roles: ['student'] } : { uid: 't1', displayName: 'Pavel', roles: ['teacher'] };
  render(<MemoryRouter><LiveRoom invitation={invitation} role={role} user={user} callProps={s.call} boardService={s.board} messagesRepository={s.chat} library={s.library}
    worksheetProps={{ homework: s.homework, library: s.library }} recordingService={{ subscribeForStudent: vi.fn(() => vi.fn()) }} countdownService={s.countdown}
    streams={{ local: null, remote: null }} onLeave={vi.fn()} onEndLesson={vi.fn()} student={{ subject: 'Eesti keel', recordingConsent: false }} /></MemoryRouter>);
  await waitFor(() => expect(document.querySelector('.sb-underlay .ws-page textarea.ws-ruled')).not.toBeNull());
}

// a text node of the visible sheet with a plain word in it, and the browser's caret on that word
function sheetWord(skip = 0) {
  let left = skip;
  const walker = document.createTreeWalker(document.querySelector('.sb-underlay .ws-page'), globalThis.NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const match = /[A-Za-zÕÄÖÜõäöü]{4,}/.exec(node.textContent || '');
    if (!match || parent.closest('input, textarea, select, button, a, label, [role="button"], [contenteditable="true"], [draggable="true"]')) continue;
    if (left > 0) { left -= 1; continue; }
    document.caretRangeFromPoint = () => ({ startContainer: node, startOffset: match.index + 1 });
    return { node, element: parent, word: match[0] };
  }
  throw new Error('no word on the sheet');
}

function doubleClick(element) {
  act(() => {
    fireEvent.pointerDown(element, { pointerType: 'mouse', button: 0, clientX: 30, clientY: 30 });
    fireEvent.mouseDown(element, { button: 0, detail: 1 });
    fireEvent.pointerUp(element, { pointerType: 'mouse', button: 0, clientX: 30, clientY: 30 });
    fireEvent.mouseUp(element, { button: 0 });
    fireEvent.click(element, { detail: 1 });
    fireEvent.pointerDown(element, { pointerType: 'mouse', button: 0, clientX: 30, clientY: 30 });
    fireEvent.mouseDown(element, { button: 0, detail: 2 });
    fireEvent.pointerUp(element, { pointerType: 'mouse', button: 0, clientX: 30, clientY: 30 });
    fireEvent.mouseUp(element, { button: 0 });
    fireEvent.click(element, { detail: 2 });
    fireEvent.doubleClick(element, { clientX: 30, clientY: 30 });
  });
}

function tap(element) {
  act(() => {
    fireEvent.pointerDown(element, { pointerType: 'touch', isPrimary: true, pointerId: 7, button: 0, clientX: 30, clientY: 30 });
    fireEvent.pointerUp(element, { pointerType: 'touch', isPrimary: true, pointerId: 7, button: 0, clientX: 31, clientY: 30 });
  });
}

const card = () => document.querySelector('.sb-word-tap');

afterEach(() => { delete document.caretRangeFromPoint; lookups.checkOwnWord.mockClear(); });

describe('„Puuduta sõna” in the live room (worksheet page, „Vali ja täida”)', () => {
  it('student: a double click on a sheet word opens the card and asks the lookup service', async () => {
    await renderRoom('student');
    expect(document.querySelector('.sb-dock [aria-pressed="true"]')).toHaveAttribute('aria-label', 'Vali ja täida');
    const { element, word } = sheetWord();
    doubleClick(element);
    await waitFor(() => expect(card()).not.toBeNull());
    await waitFor(() => expect(lookups.checkOwnWord).toHaveBeenCalledWith(expect.objectContaining({ text: word, lang: 'et' })));
  });

  it('student: a finger tap on a sheet word opens the card', async () => {
    await renderRoom('student');
    // another word than the double-click test (one lookup per word and session)
    const { element, word } = sheetWord(1);
    tap(element);
    await waitFor(() => expect(card()).not.toBeNull());
    await waitFor(() => expect(lookups.checkOwnWord).toHaveBeenCalledWith(expect.objectContaining({ text: word })));
  });

  it('teacher: on the sheet the double click stays with the sheet’s own Viga / Märkus / Sõna (no board card)', async () => {
    await renderRoom('teacher');
    const { element } = sheetWord(2);
    doubleClick(element);
    await act(async () => { await new Promise((resolve) => globalThis.setTimeout(resolve, 10)); });
    expect(card()).toBeNull();
  });

  it('not while drawing with the pen, and not in an answer field', async () => {
    await renderRoom('student');
    const { element } = sheetWord(3);
    fireEvent.click(document.querySelector('.sb-dock [aria-label="Pliiats"]'));
    doubleClick(element);
    tap(element);
    await act(async () => { await new Promise((resolve) => globalThis.setTimeout(resolve, 10)); });
    expect(card()).toBeNull();
    fireEvent.click(document.querySelector('.sb-dock [aria-label="Vali ja täida"]'));
    const field = document.querySelector('.sb-underlay .ws-page textarea.ws-ruled');
    doubleClick(field);
    await act(async () => { await new Promise((resolve) => globalThis.setTimeout(resolve, 10)); });
    expect(card()).toBeNull();
    expect(lookups.checkOwnWord).not.toHaveBeenCalled();
  });
});
