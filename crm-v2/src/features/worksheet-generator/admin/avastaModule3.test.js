import { describe, expect, it } from 'vitest';
import { AVASTA_MODULE3_IDS, upgradeAvastaModule3Document } from './avastaModule3.js';

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

describe('Avasta moodul 3 quality upgrade', () => {
  it.each(AVASTA_MODULE3_IDS)('%s preserves base and reaches 9 blocks', (lessonId) => {
    const result = upgradeAvastaModule3Document(lessonId, baseDoc(lessonId));
    expect(result.before).toBe(5);
    expect(result.after).toBe(9);
    expect(result.document.blocks.map((item) => item.id)).toEqual(expect.arrayContaining(['intro', 'read', 'details', 'speak', 'check']));
    expect(result.document.blocks.at(-1).type).toBe('selfcheck');
    expect(result.document.meta.level).toBe('B1');
    expect(result.document.meta.module).toBe('Kodu, kohad ja linn');
  });

  it('is idempotent', () => {
    const first = upgradeAvastaModule3Document('a2b1-014', baseDoc('a2b1-014'));
    const second = upgradeAvastaModule3Document('a2b1-014', first.document);
    expect(second.added).toEqual([]);
    expect(second.after).toBe(9);
  });
});
