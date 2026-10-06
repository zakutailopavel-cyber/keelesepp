import { describe, expect, it } from 'vitest';
import { AVASTA_MODULE10_IDS, createAvastaModule10Document, upgradeAvastaModule10Document } from './avastaModule10.js';

describe('Avasta moodul 10', () => {
  it.each(AVASTA_MODULE10_IDS)('%s creates a complete 7–9 block Avasta', (lessonId) => {
    const doc = createAvastaModule10Document(lessonId);
    expect(doc.meta.level).toBe('B1');
    expect(doc.meta.module).toBe('Reisimine ja transport');
    expect(doc.blocks.length).toBeGreaterThanOrEqual(7);
    expect(doc.blocks.length).toBeLessThanOrEqual(9);
    expect(doc.blocks.some((block) => block.type === 'reading')).toBe(true);
    expect(doc.blocks.some((block) => block.type === 'notice')).toBe(true);
    expect(doc.blocks.at(-1).type).toBe('selfcheck');
  });

  it('uses 100+ word reading passages', () => {
    for (const lessonId of AVASTA_MODULE10_IDS) {
      const doc = createAvastaModule10Document(lessonId);
      const reading = doc.blocks.find((block) => block.type === 'reading');
      expect(reading.data.passage.trim().split(/\s+/).length).toBeGreaterThanOrEqual(100);
    }
  });

  it('upgrades existing content without deleting blocks', () => {
    const existing = {
      schema: 'keelesepp.worksheet/2',
      id: 'existing',
      meta: { title: 'Old', goals: {} },
      blocks: [
        { id: 'intro-old', type: 'choice', data: { title: 'Alusta', questions: [] } },
        { id: 'read-old', type: 'reading', data: { title: 'Loe', passage: 'Tekst', questions: 'Kes? [Mari]' } },
        { id: 'details-old', type: 'reading', data: { title: 'Detailid', passage: 'Tekst', questions: 'Kus? [kodus]' } },
        { id: 'speak-old', type: 'speaking', data: { title: 'Räägi' } },
        { id: 'self-old', type: 'selfcheck', data: { title: 'Kontrolli end' } },
      ],
    };
    const result = upgradeAvastaModule10Document('a2b1-046', existing);
    expect(result.document.blocks.map((block) => block.id)).toEqual(expect.arrayContaining(['intro-old', 'read-old', 'details-old', 'speak-old', 'self-old']));
    expect(result.after).toBe(9);
  });
});
