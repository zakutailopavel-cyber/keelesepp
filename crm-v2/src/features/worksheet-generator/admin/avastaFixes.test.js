import { AVASTA_FIX_SHEETS, applyAvastaFixes } from './avastaFixes.js';

const fixes = {
  'a2b1-023:discover': {
    blocks: { q: { type: 'choice', before: { title: 'T', questions: [{ q: 'Vana', options: '*a\nb' }] }, after: { title: 'T', questions: [{ q: 'Uus', options: '*a\nb\nc' }] } } },
    meta: { 'goals.g_notice': ['vana eesmärk', 'uus eesmärk'] },
  },
};
const doc = (data, goal = 'vana eesmärk') => ({ meta: { title: 'X', goals: { g_notice: goal, g_read: 'jääb' } }, blocks: [{ id: 'intro', type: 'text', data: { text: 'õpetaja tekst' } }, { id: 'q', type: 'choice', look: { frame: 'line' }, data }] });

describe('Avasta fixes of 2026-10-12', () => {
  it('replaces a block that still equals the published version, keeping its look and the other blocks', () => {
    // the stored map may come back with its keys in another order
    const r = applyAvastaFixes('a2b1-023', 'discover', doc({ questions: [{ options: '*a\nb', q: 'Vana' }], title: 'T' }), fixes);
    expect(r.updated).toEqual(['q', 'meta:goals.g_notice']);
    expect(r.document.blocks[1]).toEqual({ id: 'q', type: 'choice', look: { frame: 'line' }, data: fixes['a2b1-023:discover'].blocks.q.after });
    expect(r.document.blocks[0].data.text).toBe('õpetaja tekst');
    expect(r.document.meta.goals).toEqual({ g_notice: 'uus eesmärk', g_read: 'jääb' });
  });

  it('leaves a block changed since (a teacher edit) and an already fixed one alone', () => {
    const edited = applyAvastaFixes('a2b1-023', 'discover', doc({ title: 'T', questions: [{ q: 'Õpetaja muutis', options: '*a\nb' }] }, 'õpetaja eesmärk'), fixes);
    expect(edited.updated).toEqual([]);
    expect(edited.skipped).toEqual(['q', 'meta:goals.g_notice']);
    const done = applyAvastaFixes('a2b1-023', 'discover', doc(fixes['a2b1-023:discover'].blocks.q.after, 'uus eesmärk'), fixes);
    expect(done.already).toEqual(['q', 'meta:goals.g_notice']);
    expect(applyAvastaFixes('a2b1-099', 'discover', doc({}), fixes).updated).toEqual([]);
  });

  it('covers the corrected B1 Avasta sheets and the three phases of module 1', () => {
    expect(AVASTA_FIX_SHEETS.filter((s) => s.phase === 'discover')).toHaveLength(49);
    expect(AVASTA_FIX_SHEETS).toContainEqual({ lessonId: 'a2b1-023', phase: 'discover' });
    expect(AVASTA_FIX_SHEETS).toContainEqual({ lessonId: 'a2b1-001', phase: 'practice' });
  });
});
