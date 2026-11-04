import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LessonBoardsCard from './LessonBoardsCard.jsx';
import { copyLessonKey, copyableElement, groupLessonCopies, isWorksheetPage, lessonCopyId, pagesToCopy } from './lessonBoards.js';
import { pageSelectionText, selectionText } from './selectionText.js';
import { saveGroupBoardCopies } from '../live-classroom/groupBoardCopies.js';

const at = (iso) => ({ toMillis: () => Date.parse(iso) });

describe('lesson board copies', () => {
  it('a stable copy id per lesson and page, and back to the lesson', () => {
    expect(lessonCopyId('inv-1', 0)).toBe('lb-inv-1-1');
    expect(lessonCopyId('a/b c', 2)).toBe('lb-abc-3');
    expect(copyLessonKey('lb-inv-1-12')).toBe('inv-1');
    expect(copyLessonKey('p1')).toBe('');
  });

  it('copies the lesson pages the teacher opened, never worksheet pages; only the main board when no page was used', () => {
    expect(isWorksheetPage({ id: 'ws-0a1b2c3d' })).toBe(true);
    expect(isWorksheetPage({ id: 'x', title: 'Tööleht: Minu päev' })).toBe(true);
    expect(pagesToCopy([{ id: 'p1', title: 'Tund 4.11' }, { id: 'ws-0a1b2c3d', title: 'Tööleht: X' }])).toEqual([{ id: 'p1', title: 'Tund 4.11' }]);
    expect(pagesToCopy([])).toEqual([{ id: '', title: 'Tahvel' }]);
    expect(pagesToCopy([{ id: 'ws-0a1b2c3d', title: 'Tööleht: X' }])).toEqual([]);
  });

  it('keeps only what the board rules allow, drops broken elements', () => {
    const stroke = { id: 'e1', type: 'stroke', points: [{ x: 1, y: 2 }], color: '#000', strokeWidth: 4, updatedByUid: 'u', lastClientId: 'c', revision: 7, junk: 1 };
    expect(copyableElement(stroke)).toEqual({ type: 'stroke', points: [{ x: 1, y: 2 }], color: '#000', strokeWidth: 4 });
    expect(copyableElement({ type: 'text', x: 0, y: 0, w: 100, h: 20, text: 'Tere', spans: [{ t: 'Tere', b: true }], color: '#111', fontSize: 18, byStaff: true }))
      .toEqual({ type: 'text', x: 0, y: 0, w: 100, h: 20, text: 'Tere', spans: [{ t: 'Tere', b: true }], color: '#111', fontSize: 18, byStaff: true });
    expect(copyableElement({ type: 'note', x: 0, y: 0, w: 1, h: 1, text: '', color: '#fff', bookmark: false })).toEqual({ type: 'note', x: 0, y: 0, w: 1, h: 1, text: '', color: '#fff' });
    expect(copyableElement({ type: 'image', x: 0, y: 0, w: 10, h: 10, url: 'http://x' })).toBeNull();
    expect(copyableElement({ type: 'stroke', points: [], color: '#000', strokeWidth: 4 })).toBeNull();
    expect(copyableElement({ type: 'video' })).toBeNull();
  });

  it('groups finished copies by lesson (and child), newest first, with the teacher', () => {
    const pages = [
      { id: 'lb-inv-1-2', studentId: 's1', isSnapshot: true, status: 'completed', title: 'Tund 2', order: 2, createdAt: at('2026-11-03T10:00:00Z'), updatedByName: 'Anna' },
      { id: 'lb-inv-1-1', studentId: 's1', isSnapshot: true, status: 'completed', title: 'Tund 1', order: 1, createdAt: at('2026-11-03T10:00:00Z'), updatedByName: 'Anna' },
      { id: 'lb-inv-2-1', studentId: 's1', isSnapshot: true, status: 'completed', title: 'Tahvel', order: 1, createdAt: at('2026-11-04T10:00:00Z'), updatedByName: 'Pavel' },
      { id: 'lb-inv-3-1', studentId: 's1', isSnapshot: true, status: 'active', title: 'pooleli', createdAt: at('2026-11-05T10:00:00Z') },
      { id: 'old-snap', studentId: 's1', isSnapshot: true, status: 'completed', title: 'v1' },
    ];
    const groups = groupLessonCopies(pages);
    expect(groups.map((group) => [group.key, group.teacher, group.pages.map((page) => page.title)])).toEqual([
      ['s1:inv-2', 'Pavel', ['Tahvel']],
      ['s1:inv-1', 'Anna', ['Tund 1', 'Tund 2']],
    ]);
  });

  it('the text chosen on the board, in reading order', () => {
    expect(selectionText([{ text: 'maailm', x: 50, y: 10 }, { text: ' Tere\n', x: 0, y: 10 }, { type: 'stroke' }, undefined])).toBe('Tere maailm');
    expect(pageSelectionText({ getSelection: () => ({ toString: () => '  Ma  elan ' }) })).toBe('Ma elan');
    expect(pageSelectionText({})).toBe('');
  });

  it('a group lesson is copied onto every member’s own board (main board + pages, no worksheets)', async () => {
    const copies = { save: vi.fn(async ({ studentId }) => [`${studentId}-copy`]) };
    const boardService = { listPages: vi.fn(async () => [{ id: 'g1', title: 'Leht 1' }, { id: 'ws-0a1b2c3d', title: 'Tööleht: X' }]) };
    const room = { title: 'B1 grupp', members: [{ studentId: 's1', studentUid: 'u1' }, { studentId: 's2', studentUid: 'u2' }, { studentUid: 'u3' }] };
    const saved = await saveGroupBoardCopies({ roomId: 'room-1', room, user: { uid: 't1' }, boardService, copies });
    expect(saved).toEqual(['s1-copy', 's2-copy']);
    expect(copies.save).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's2', sourceRoot: 'groupBoards', sourceId: 'room-1', lessonKey: 'room-1', titlePrefix: 'B1 grupp: ',
      pages: [{ id: '', title: 'Tahvel' }, { id: 'g1', title: 'Leht 1' }] }));
  });
});

it('„Tunni tahvlid”: the student opens a lesson page read-only', async () => {
  const pages = [{ id: 'lb-inv-1-1', studentId: 's1', isSnapshot: true, status: 'completed', title: 'Tund 3.11', order: 1, createdAt: at('2026-11-03T10:00:00Z'), updatedByName: 'Anna' }];
  const service = {
    subscribe: vi.fn((id, onData) => { onData(id === 's1' ? pages : []); return () => {}; }),
    listElements: vi.fn(async () => [
      { id: 'e1', type: 'text', x: 10, y: 10, w: 200, h: 30, text: 'Ma elan Tallinnas', color: '#111', fontSize: 18 },
      { id: 'e2', type: 'stroke', points: [{ x: 0, y: 0 }, { x: 40, y: 40 }], color: '#c00', strokeWidth: 4 },
    ]),
  };
  render(<LessonBoardsCard studentIds={['s1', 's2']} service={service} />);
  expect(screen.getByRole('heading', { name: 'Tunni tahvlid' })).toBeInTheDocument();
  expect(screen.getByText(/Anna · 1 leht/)).toBeInTheDocument();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Tund 3.11' })); });
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/Seda saab ainult vaadata/)).toBeInTheDocument();
  expect(await within(dialog).findByRole('img', { name: /ainult vaatamiseks/ })).toBeInTheDocument();
  expect(within(dialog).getByText('Ma elan Tallinnas')).toBeInTheDocument();
  expect(service.listElements).toHaveBeenCalledWith('s1', 'lb-inv-1-1');
  // nothing to edit: no tools, no inputs
  expect(within(dialog).queryByRole('textbox')).toBeNull();
  expect(within(dialog).queryByRole('toolbar')).toBeNull();
});

it('„Tunni tahvlid” is empty before the first lesson', () => {
  render(<LessonBoardsCard studentIds={['s1']} service={{ subscribe: (id, onData) => { onData([]); return () => {}; } }} />);
  expect(screen.getByText('Tunni tahvleid veel ei ole')).toBeInTheDocument();
});
