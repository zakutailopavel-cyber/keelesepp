import { AVASTA_FIX_LESSONS, applyAvastaFixes } from './avastaFixes.js';

const fixes = {
  'a2b1-023': {
    blocks: { q: { type: 'choice', before: { title: 'T', questions: [{ q: 'Vana', options: '*a\nb' }] }, after: { title: 'T', questions: [{ q: 'Uus', options: '*a\nb\nc' }] } } },
    meta: { 'goals.g_notice': ['vana eesmärk', 'uus eesmärk'] },
  },
};
const doc = (data, goal = 'vana eesmärk') => ({ meta: { title: 'X', goals: { g_notice: goal, g_read: 'jääb' } }, blocks: [{ id: 'intro', type: 'text', data: { text: 'õpetaja tekst' } }, { id: 'q', type: 'choice', look: { frame: 'line' }, data }] });

describe('Avasta fixes of 2026-10-12', () => {
  it('replaces a block that still equals the published version, keeping its look and the other blocks', () => {
    // the stored map may come back with its keys in another order
    const r = applyAvastaFixes('a2b1-023', doc({ questions: [{ options: '*a\nb', q: 'Vana' }], title: 'T' }), fixes);
    expect(r.updated).toEqual(['q', 'meta:goals.g_notice']);
    expect(r.document.blocks[1]).toEqual({ id: 'q', type: 'choice', look: { frame: 'line' }, data: fixes['a2b1-023'].blocks.q.after });
    expect(r.document.blocks[0].data.text).toBe('õpetaja tekst');
    expect(r.document.meta.goals).toEqual({ g_notice: 'uus eesmärk', g_read: 'jääb' });
  });

  it('leaves a block changed since (a teacher edit) and an already fixed one alone', () => {
    const edited = applyAvastaFixes('a2b1-023', doc({ title: 'T', questions: [{ q: 'Õpetaja muutis', options: '*a\nb' }] }, 'õpetaja eesmärk'), fixes);
    expect(edited.updated).toEqual([]);
    expect(edited.skipped).toEqual(['q', 'meta:goals.g_notice']);
    const done = applyAvastaFixes('a2b1-023', doc(fixes['a2b1-023'].blocks.q.after, 'uus eesmärk'), fixes);
    expect(done.already).toEqual(['q', 'meta:goals.g_notice']);
    expect(applyAvastaFixes('a2b1-099', doc({}), fixes).updated).toEqual([]);
  });

  it('covers the corrected B1 Avasta lessons', () => {
    expect(AVASTA_FIX_LESSONS.length).toBe(49);
    expect(AVASTA_FIX_LESSONS).toContain('a2b1-023');
  });
});
