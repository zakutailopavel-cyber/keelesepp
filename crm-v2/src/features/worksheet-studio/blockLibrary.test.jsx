import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { buildLibrary, parseQuery, searchLibrary, skillOf } from './blockLibrary.js';
import BlockLibraryPanel from './BlockLibraryPanel.jsx';
import { COURSE_MODULES, buildCourseSheet } from '../worksheet-generator/admin/course/registry.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

describe('Kogu — the course task library', () => {
  const entries = buildLibrary(COURSE_MODULES, buildCourseSheet);

  it('indexes every task block of the course with level, skill, topic and phase tags', () => {
    expect(entries.length).toBeGreaterThan(5000);
    const e = entries.find((x) => x.lessonId === 'a2-002' && x.block.type === 'speaking');
    expect(e.tags).toEqual(expect.arrayContaining(['a2', 'rääkimine', 'avasta']));
    expect(e.topic).toBe('A2 lähtepunkt ja eneseinfo');
    expect(entries.every((x) => x.block.type !== 'selfcheck' && x.block.type !== 'text')).toBe(true);
  });

  it('finds tasks by #tags and words, also with Russian skill names', () => {
    const family = searchLibrary(entries, '#a2 #rääkimine #pere', 1000);
    expect(family.total).toBeGreaterThan(3);
    expect(family.items.every((x) => x.level.startsWith('A2') && x.skill === 'rääkimine' && x.tags.some((t) => t.startsWith('pere')))).toBe(true);
    expect(searchLibrary(entries, '#a2 #говорение #семья', 1000).total).toBe(family.total);
    expect(parseQuery('#B1 tööintervjuu')).toEqual({ tags: ['b1'], terms: ['tööintervjuu'] });
  });

  it('a choice task trains what its goal says', () => {
    expect(skillOf({ type: 'choice', goal: 'g_notice' })).toBe('grammatika');
    expect(skillOf({ type: 'listening', goal: 'g_read' })).toBe('kuulamine');
  });

  it('the panel shows the hits and puts a task on the sheet', async () => {
    const onInsert = vi.fn();
    render(<BlockLibraryPanel level="A2" onInsert={onInsert} load={() => Promise.resolve(entries)} />);
    expect(await screen.findByText(/ülesannet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rääkimine' }));
    fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lehele' }));
    expect(onInsert).toHaveBeenCalledWith([expect.objectContaining({ type: expect.any(String) })], expect.objectContaining({ goals: expect.any(Object) }));
    expect(screen.getByRole('status')).toHaveTextContent('lisati lehele');
  });

  it('„Salvestatud lehed”: standalone sheets at once, phase sheets of the open lesson and of a named lesson, each read once', async () => {
    const sheet = (title, type, text) => ({ schema: 'keelesepp.worksheet/2', id: title, meta: { title, level: 'B1', goals: {} }, blocks: [{ id: `${title}-b`, type, data: { title: text, instruction: 'Vali.', statements: [] } }] });
    const saved = {
      listLessons: vi.fn().mockResolvedValue([
        { id: 's1', title: 'Oma leht', worksheetDoc: sheet('Oma leht', 'truefalse', 'Eraldi lehe ülesanne'), worksheetDocStatus: 'draft' },
        { id: 'cur', title: 'Praegune tund', type: 'lesson', worksheetPhases: { discover: {} } },
        { id: 'fam', title: 'Perekond', type: 'lesson', worksheetPhases: { practice: {} } },
      ]),
      loadLessonSheets: vi.fn().mockImplementation(async (id) => [{ worksheetId: id === 'cur' ? 'discover' : 'practice', worksheetDoc: sheet(id, 'truefalse', `Tunni ${id} ülesanne`), worksheetDocStatus: 'published' }]),
    };
    const onInsert = vi.fn();
    render(<BlockLibraryPanel onInsert={onInsert} load={() => Promise.resolve([])} saved={saved} currentLessonId="cur" />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvestatud lehed' }));
    expect(await screen.findByText('Eraldi lehe ülesanne')).toBeInTheDocument();
    expect(await screen.findByText('Tunni cur ülesanne')).toBeInTheDocument();
    expect(saved.loadLessonSheets).toHaveBeenCalledWith('cur');
    expect(saved.loadLessonSheets).not.toHaveBeenCalledWith('fam');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Otsi kogust' }), { target: { value: 'perekond' } });
    expect(await screen.findByText('Tunni fam ülesanne', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/Perekond · Harjuta · avaldatud/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tunni fam ülesanne/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lehele' }));
    expect(onInsert).toHaveBeenCalledWith([expect.objectContaining({ id: 'fam-b' })], { goals: {} });
    fireEvent.click(screen.getByRole('button', { name: 'Kursus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvestatud lehed' }));
    expect(saved.listLessons).toHaveBeenCalledTimes(1);
    expect(saved.loadLessonSheets.mock.calls.filter(([id]) => id === 'cur')).toHaveLength(1);
  });
});
