import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, vi } from 'vitest';
import LiveRoom from './LiveRoom.jsx';
import { sampleDocument } from '../worksheet-studio/engine/sample.js';
import { ANSWER_FONT_KEY } from '../worksheet-studio/answerFont.js';
import { beforeAll as preloadBeforeAll } from 'vitest';
import { preloadLiveClassroomParts } from './lazyParts.testkit.js';

// 2026-11-05 (owner, 1:1 lesson): the student could not type into the sheet's writing task „Kodutöö: Kirjuta arvamus”
// under the teacher's spotlight. The student's side of the room, the default tool on a sheet page („Täida töölehte”):
// every kind of answer field takes the typing — with the õ ä ö ü bar, with each answer font, and after a press on the
// board whose release the drawing layer never saw.
preloadBeforeAll(() => preloadLiveClassroomParts(), 60000);

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

const invitation = { id: 'inv-now', roomKey: 'inv-now', studentId: 's-1', studentName: 'Julia', teacherName: 'Pavel', title: 'Eesti keel', status: 'accepted', respondedAt: new Date().toISOString() };
function sheetDoc() {
  const doc = sampleDocument();
  const writing = doc.blocks.find((block) => block.id === 'b6');
  writing.data = { ...writing.data, title: 'Kodutöö: Kirjuta arvamus (100–120 sõna)', minSent: 6, maxSent: 12 };
  const translation = { id: 'b8', type: 'translation', width: 'half', tone: 'cream', data: { title: 'Tõlgi eesti keelde.', instruction: '', rows: [{ source: 'Я живу в Таллине.', hint: '' }] } };
  return { ...doc, blocks: [...doc.blocks, translation] };
}

function services() {
  const sheet = { id: 'c1', title: 'Täna', status: 'assigned', studentId: 's-1', liveRoomKey: 'inv-now', liveOpenedAt: '2026-11-05T15:00:00.000Z', worksheetDoc: sheetDoc(), answers: {}, liveFocus: { blockId: 'b6' } };
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

async function renderStudentRoom() {
  const s = services();
  const user = { uid: 'stud', displayName: 'Julia', roles: ['student'] };
  render(<MemoryRouter><LiveRoom invitation={invitation} role="student" user={user} callProps={s.call} boardService={s.board} messagesRepository={s.chat} library={s.library}
    worksheetProps={{ homework: s.homework, library: s.library }} recordingService={{ subscribeForStudent: vi.fn(() => vi.fn()) }} countdownService={s.countdown}
    streams={{ local: null, remote: null }} onLeave={vi.fn()} onEndLesson={vi.fn()} student={{ subject: 'Eesti keel', recordingConsent: false }} /></MemoryRouter>);
  await waitFor(() => expect(document.querySelector('.sb-underlay .ws-page textarea.ws-ruled')).not.toBeNull());
  return s;
}

// the visible page of the sheet (not the hidden measuring copy)
const onSheet = (selector) => document.querySelector(`.sb-underlay .ws-page ${selector}`);
const writingField = () => onSheet('[data-block="b6"] textarea.ws-ruled');
const gapField = () => onSheet('[data-block="b4"] input');
const openField = () => onSheet('[data-block="b8"] input, [data-block="b8"] textarea');

// a click into the field as a browser does it, then typing (the field is controlled: the value comes back from state)
function typeInto(field, text) {
  act(() => {
    fireEvent.pointerDown(field, { pointerType: 'mouse', button: 0 });
    fireEvent.mouseDown(field);
    field.focus();
    fireEvent.pointerUp(field, { pointerType: 'mouse', button: 0 });
    fireEvent.mouseUp(field);
    fireEvent.click(field);
  });
  expect(document.activeElement).toBe(field);
  const select = new globalThis.Event('selectstart', { bubbles: true, cancelable: true });
  field.dispatchEvent(select);
  expect(select.defaultPrevented).toBe(false);
  fireEvent.change(field, { target: { value: text } });
}

afterEach(() => { try { globalThis.localStorage?.removeItem?.(ANSWER_FONT_KEY); } catch { /* no storage */ } });

describe('typing into worksheet answers on the live board (student)', () => {
  it('the default tool on the sheet page is „Täida töölehte” and the spotlit writing task takes the text', async () => {
    await renderStudentRoom();
    expect(document.querySelector('.sb-dock [aria-pressed="true"]')).toHaveAttribute('aria-label', 'Täida töölehte');
    expect(writingField().closest('.ws-card')).toHaveClass('focused');
    expect(writingField().readOnly).toBe(false);
    typeInto(writingField(), 'Mina arvan nii. See on hea.');
    await waitFor(() => expect(writingField().value).toBe('Mina arvan nii. See on hea.'));
    expect(writingField().closest('.ws-card').textContent).toMatch(/Lauseid: 2 \/ 6–12/);
  });

  it('gaps and open answers take the text too', async () => {
    await renderStudentRoom();
    typeInto(gapField(), 'hommikul');
    await waitFor(() => expect(gapField().value).toBe('hommikul'));
    typeInto(openField(), 'Ma elan Tallinnas.');
    await waitFor(() => expect(openField().value).toBe('Ma elan Tallinnas.'));
  });

  it('the õ ä ö ü bar puts a letter into the writing field and the field keeps the focus', async () => {
    await renderStudentRoom();
    typeInto(writingField(), 'Mu');
    await waitFor(() => expect(writingField().value).toBe('Mu'));
    const bar = await waitFor(() => { const node = document.querySelector('.sb-letters'); expect(node).not.toBeNull(); return node; });
    writingField().setSelectionRange(2, 2);
    const key = [...bar.querySelectorAll('button')].find((button) => button.textContent === 'ü');
    const down = new globalThis.MouseEvent('mousedown', { bubbles: true, cancelable: true });
    key.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    act(() => { fireEvent.click(key); });
    await waitFor(() => expect(writingField().value).toBe('Muü'));
    expect(document.activeElement).toBe(writingField());
  });

  it.each(['plain', 'hand', 'serif', 'large'])('with the answer font „%s” the writing field takes the text', async (font) => {
    try { globalThis.localStorage?.setItem?.(ANSWER_FONT_KEY, font); } catch { /* no storage */ }
    await renderStudentRoom();
    typeInto(writingField(), 'Tere.');
    await waitFor(() => expect(writingField().value).toBe('Tere.'));
  });

  it('after a press on the board released off the drawing layer, the block is gone and the field takes the text', async () => {
    await renderStudentRoom();
    fireEvent.click(document.querySelector('.sb-dock [aria-label="Pliiats"]') || document.querySelector('.sb-dock [aria-label="Vali"]'));
    const svg = document.querySelector('svg[aria-label="Õpilase tahvel"]');
    fireEvent.pointerDown(svg, { clientX: 20, clientY: 20, button: 0 });
    expect(document.documentElement.classList.contains('sb-drawing')).toBe(true);
    // released over the dock: the drawing layer never sees it
    fireEvent.pointerUp(document.querySelector('.sb-dock'), { clientX: 20, clientY: 900 });
    await waitFor(() => expect(document.documentElement.classList.contains('sb-drawing')).toBe(false));
    fireEvent.click(document.querySelector('.sb-dock [aria-label="Täida töölehte"]'));
    typeInto(writingField(), 'Tagasi tööle.');
    await waitFor(() => expect(writingField().value).toBe('Tagasi tööle.'));
  });
});
