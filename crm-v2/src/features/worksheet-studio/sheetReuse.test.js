import { vi } from 'vitest';
import { searchLibrary } from './blockLibrary.js';
import { createBlock } from './engine/registry.js';
import { newDocument } from './engine/schema.js';
import {
  appendBlocks, applyLessonTemplate, applySheetTemplate, copyBlocksToPhase, filterTemplates, lessonsToLoad, lessonTemplatePlan,
  phaseEntries, removeBlock, standaloneEntries, targetLessons, templateRecord,
} from './sheetReuse.js';

const task = (type, patch = {}) => ({ ...createBlock(type), ...patch });
const sheet = (title, blocks, meta = {}) => { const d = newDocument(); return { ...d, meta: { ...d.meta, title, ...meta }, blocks }; };

class Conflict extends Error { constructor() { super('Seda töölehte muudeti vahepeal'); this.name = 'LessonWorksheetConflictError'; } }

describe('sheetReuse — blocks between sheets', () => {
  it('appends copies with new ids and brings the goals the blocks use', () => {
    const block = task('truefalse', { goal: 'g_read' });
    const target = sheet('Harjuta', [task('gaps')], { goals: { g_use: 'Kasutan.' } });
    const { doc, ids } = appendBlocks(target, [block], { goals: { g_read: 'Loen ja saan aru.', g_other: 'x' } });
    expect(doc.blocks).toHaveLength(2);
    expect(ids[0]).not.toBe(block.id);
    expect(doc.blocks[1]).toMatchObject({ type: 'truefalse', goal: 'g_read', id: ids[0] });
    expect(doc.meta.goals).toEqual({ g_use: 'Kasutan.', g_read: 'Loen ja saan aru.' });
    expect(removeBlock(doc, ids[0]).blocks).toHaveLength(1);
  });

  it('copies into an existing phase sheet as a draft with its updatedAt (conflict-checked)', async () => {
    const repository = {
      load: vi.fn().mockResolvedValue({ worksheetDoc: sheet('Harjuta', [task('gaps')]), worksheetDocUpdatedAt: 't1' }),
      saveDraft: vi.fn().mockResolvedValue({ worksheetDocVersion: 3 }),
    };
    const result = await copyBlocksToPhase({ repository, lessonId: 'l1', worksheetId: 'practice', blocks: [task('match')], user: { uid: 'u' } });
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    const input = repository.saveDraft.mock.calls[0][0];
    expect(input).toMatchObject({ lessonId: 'l1', worksheetId: 'practice', baseUpdatedAt: 't1' });
    expect(input.role).toBeUndefined();
    expect(input.worksheetDoc.blocks.map((b) => b.type)).toEqual(['gaps', 'match']);
    expect(repository).not.toHaveProperty('publish');
    expect(result.created).toBe(false);
  });

  it('creates a missing phase sheet with its role and slot, and reads again once after a conflict', async () => {
    const repository = {
      load: vi.fn()
        .mockRejectedValueOnce(new Error('Töölehte ei leitud.'))
        .mockResolvedValueOnce({ worksheetDoc: sheet('Õpik', [task('gaps')]), worksheetDocUpdatedAt: 't2' }),
      saveDraft: vi.fn().mockRejectedValueOnce(new Conflict()).mockResolvedValueOnce({}),
    };
    await copyBlocksToPhase({ repository, lessonId: 'l1', worksheetId: 'opik', blocks: [task('match')], lesson: { title: 'Pere', level: 'A2' } });
    const [first, second] = repository.saveDraft.mock.calls.map((c) => c[0]);
    expect(first).toMatchObject({ baseUpdatedAt: '', role: 'focus', slot: 4, displayLabel: 'Õpik', source: 'manual' });
    expect(first.worksheetDoc.meta.title).toBe('Pere');
    expect(second).toMatchObject({ baseUpdatedAt: 't2' });
    expect(second.worksheetDoc.blocks.map((b) => b.type)).toEqual(['gaps', 'match']);
  });

  it('gives up after a second conflict and passes other errors on', async () => {
    const repository = { load: vi.fn().mockResolvedValue({ worksheetDoc: sheet('A', []), worksheetDocUpdatedAt: 't' }), saveDraft: vi.fn().mockRejectedValue(new Conflict()) };
    await expect(copyBlocksToPhase({ repository, lessonId: 'l', worksheetId: 'discover', blocks: [task('gaps')] })).rejects.toThrow(/muudeti/);
    expect(repository.saveDraft).toHaveBeenCalledTimes(2);
    const denied = { load: vi.fn().mockRejectedValue(new Error('Missing or insufficient permissions.')), saveDraft: vi.fn() };
    await expect(copyBlocksToPhase({ repository: denied, lessonId: 'l', worksheetId: 'discover', blocks: [task('gaps')] })).rejects.toThrow(/permissions/);
    expect(denied.saveDraft).not.toHaveBeenCalled();
  });
});

describe('sheetReuse — „Kogu” over saved sheets', () => {
  const lessons = [
    { id: 's1', title: 'Minu pere', level: 'A2', worksheetDoc: sheet('Minu pere', [task('truefalse', { goal: 'g_read', data: { ...createBlock('truefalse').data, title: 'Ema ja isa' } }), createBlock('text')], { level: 'A2', goals: { g_read: 'Loen.' } }), worksheetDocStatus: 'published' },
    { id: 'l1', title: 'Perekond ja kodu', level: 'B1', type: 'lesson', worksheetPhases: { discover: {}, practice: {} } },
    { id: 'l2', title: 'Töö ja amet', level: 'B1', type: 'lesson', worksheetPhases: { discover: {} } },
    { id: 'l3', title: 'Ilm', level: 'A2', type: 'lesson' },
  ];

  it('indexes the tasks of standalone sheets (not their plain text blocks) with source tags and goals', () => {
    const entries = standaloneEntries(lessons);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ source: 'saved', lessonId: 's1', status: 'avaldatud', goals: { g_read: 'Loen.' } });
    expect(entries[0].tags).toEqual(expect.arrayContaining(['a2', 'salvestatud', 'leht', 'truefalse']));
    expect(searchLibrary(entries, 'ema').total).toBe(1);
    expect(searchLibrary(entries, '#truefalse #a2').total).toBe(1);
    expect(searchLibrary(entries, '#b1').total).toBe(0);
  });

  it('indexes phase sheets with the phase tag and searches them by lesson, type and text', () => {
    const records = [
      { worksheetId: 'discover', worksheetDoc: sheet('x', [task('gaps')]), worksheetDocStatus: 'draft' },
      { worksheetId: 'opik', worksheetDoc: sheet('x', [task('match')]), worksheetDocStatus: 'published' },
    ];
    const entries = phaseEntries(lessons[1], records);
    expect(entries.map((e) => e.phase)).toEqual(['discover', 'opik']);
    expect(entries[0].sheetTitle).toBe('Perekond ja kodu · Avasta');
    expect(searchLibrary(entries, '#avasta perekond').total).toBe(1);
    expect(searchLibrary(entries, '#õpik #match').total).toBe(1);
    expect(entries.every((e) => e.key.startsWith('saved:l1:'))).toBe(true);
  });

  it('reads phase sheets only of the lessons a query names, at most 12, plus the open lesson', () => {
    expect(lessonsToLoad(lessons, '#b1 #rääkimine').lessons).toEqual([]);
    expect(lessonsToLoad(lessons, '', { always: ['l2'] }).lessons.map((l) => l.id)).toEqual(['l2']);
    expect(lessonsToLoad(lessons, 'perekond').lessons.map((l) => l.id)).toEqual(['l1']);
    expect(lessonsToLoad(lessons, '#a2 perekond').lessons).toEqual([]);
    const many = Array.from({ length: 30 }, (_, i) => ({ id: `m${i}`, title: `Teema ${i}`, worksheetPhases: { discover: {} } }));
    const plan = lessonsToLoad(many, 'teema');
    expect(plan.lessons).toHaveLength(12);
    expect(plan.more).toBe(18);
    expect(lessonsToLoad(lessons, 'ilm').lessons).toEqual([]); // no phase sheets → nothing to read
  });

  it('lists lessons a block can go to', () => {
    expect(targetLessons(lessons).items.map((l) => l.id)).toEqual(['l3', 'l1', 'l2']);
    expect(targetLessons(lessons, 'töö').items.map((l) => l.id)).toEqual(['l2']);
  });
});

describe('sheetReuse — templates', () => {
  const doc = sheet('Pere', [task('gaps'), task('match')], { level: 'A2' });

  it('makes a sheet / lesson template record without save stamps and checks it', () => {
    const record = templateRecord({ kind: 'sheet', title: '  Pere mall ', sheets: [{ phase: 'discover', doc: { ...doc, updatedAt: 'x', version: 4, status: 'published' } }] });
    expect(record).toMatchObject({ kind: 'sheet', title: 'Pere mall', level: 'A2' });
    expect(record.sheets[0]).toMatchObject({ phase: 'discover', label: 'Avasta' });
    expect(record.sheets[0].doc).not.toHaveProperty('updatedAt');
    expect(record.sheets[0].doc).not.toHaveProperty('status');
    expect(() => templateRecord({ kind: 'sheet', title: '', sheets: [{ doc }] })).toThrow(/nimi/);
    expect(() => templateRecord({ kind: 'sheet', title: 'x', sheets: [{ doc }, { doc }] })).toThrow(/üks leht/);
    expect(() => templateRecord({ kind: 'lesson', title: 'x', sheets: [{ doc: sheet('t', []) }] })).toThrow(/plokki/);
    const huge = sheet('Suur', [task('reading', { data: { passage: 'a'.repeat(950 * 1024) } })]);
    expect(() => templateRecord({ kind: 'sheet', title: 'x', sheets: [{ doc: huge }] })).toThrow(/liiga suur/);
  });

  it('applies a sheet template with the current id and new block ids', () => {
    const current = sheet('Vana', []);
    const next = applySheetTemplate(doc, current);
    expect(next.id).toBe(current.id);
    expect(next.meta.title).toBe('Pere');
    expect(next.blocks.map((b) => b.type)).toEqual(['gaps', 'match']);
    expect(next.blocks.some((b) => doc.blocks.some((o) => o.id === b.id))).toBe(false);
  });

  it('a lesson template fills only empty or missing phases and never overwrites a sheet with blocks', async () => {
    const template = { title: 'Tund', sheets: ['discover', 'practice', 'transfer', 'opik'].map((phase) => ({ phase, label: phase, doc })) };
    const existing = {
      discover: { worksheetDoc: sheet('a', [task('gaps')]) },
      practice: { worksheetDoc: sheet('b', [task('gaps')]), worksheetDocUpdatedAt: 't' },
      transfer: { worksheetDoc: sheet('c', []), worksheetDocUpdatedAt: 't3' },
      opik: null,
    };
    const plan = lessonTemplatePlan(template, existing, 'discover');
    expect(plan.map((r) => [r.phase, r.action])).toEqual([['discover', 'current'], ['practice', 'skip'], ['transfer', 'fill'], ['opik', 'fill']]);
    const repository = { saveDraft: vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('keelatud')) };
    const result = await applyLessonTemplate({ repository, lessonId: 'l1', plan, existing, user: { uid: 'u' } });
    expect(repository.saveDraft.mock.calls.map((c) => [c[0].worksheetId, c[0].baseUpdatedAt])).toEqual([['transfer', 't3'], ['opik', '']]);
    expect(repository.saveDraft.mock.calls[1][0]).toMatchObject({ role: 'focus', slot: 4 });
    expect(result).toEqual({ done: ['Kasuta'], failed: ['Õpik: keelatud'] });
  });

  it('filters templates by title, level and author', () => {
    const list = [{ title: 'Pere', level: 'A2', ownerName: 'Mari', kind: 'sheet' }, { title: 'Töö', level: 'B1', ownerName: 'Jaan', kind: 'lesson' }];
    expect(filterTemplates(list, 'b1').map((t) => t.title)).toEqual(['Töö']);
    expect(filterTemplates(list, 'terve tund').map((t) => t.title)).toEqual(['Töö']);
    expect(filterTemplates(list, '')).toHaveLength(2);
  });
});
