import { describe, expect, it } from 'vitest';
import { AVASTA_MODULE1_IDS, upgradeAvastaModule1Document } from './avastaModule1.js';

const baseDoc = (id) => ({
  schema: 'keelesepp.worksheet/2',
  id: `ws-${id}`,
  meta: { title: 'Vana pealkiri', level: 'A2', goals: { old: 'Olemasolev eesmärk' } },
  blocks: [
    { id: 'intro', type: 'text', width: 'full', span: 12, tone: 'white', data: { heading: 'Alusta', text: 'Soojendus' } },
    { id: 'read', type: 'reading', width: 'full', span: 12, tone: 'cream', data: { title: 'Loe', passage: 'Tekst', questions: 'Kes? [Mari]' } },
    { id: 'details', type: 'reading', width: 'full', span: 12, tone: 'cream', data: { title: 'Detailid', passage: 'Tekst', questions: 'Kus? [kodus]' } },
    { id: 'speak', type: 'speaking', width: 'full', span: 12, tone: 'green', data: { title: 'Räägi' } },
    { id: 'check', type: 'selfcheck', width: 'full', span: 12, tone: 'sky', data: { title: 'Kontrolli end' } },
  ],
});

describe('Avasta moodul 1 quality upgrade', () => {
  it.each(AVASTA_MODULE1_IDS)('%s keeps the good base and reaches exactly 9 blocks', (lessonId) => {
    const original = baseDoc(lessonId);
    const result = upgradeAvastaModule1Document(lessonId, original);
    expect(result.before).toBe(5);
    expect(result.after).toBe(9);
    expect(result.document.blocks.map((item) => item.id)).toEqual(expect.arrayContaining(['intro', 'read', 'details', 'speak', 'check']));
    expect(result.document.blocks.at(-1).type).toBe('selfcheck');
    expect(result.document.meta.level).toBe('B1');
    expect(result.document.meta.module).toBe('A2 lähtepunkt ja igapäevaelu');
    expect(Object.keys(result.document.meta.goals).length).toBeGreaterThanOrEqual(5);
  });

  it('is idempotent and does not add the same quality blocks twice', () => {
    const first = upgradeAvastaModule1Document('a2b1-002', baseDoc('a2b1-002'));
    const second = upgradeAvastaModule1Document('a2b1-002', first.document);
    expect(second.added).toEqual([]);
    expect(second.after).toBe(9);
  });

  it('refuses to create an overlong sheet instead of silently exceeding 9 blocks', () => {
    const doc = baseDoc('a2b1-001');
    doc.blocks.splice(3, 0, { id: 'extra', type: 'image', width: 'half', span: 6, tone: 'white', data: { img: null } });
    expect(() => upgradeAvastaModule1Document('a2b1-001', doc)).toThrow(/9 plokki/);
  });
});
