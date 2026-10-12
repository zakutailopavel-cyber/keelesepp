import { describe, expect, it } from 'vitest';
import { OPENERS, openerBlocks } from './avastaOpeners.js';
import { createAvastaModule4Document } from './avastaModule4.js';

const words = (text) => text.split(/\s+/).filter(Boolean).length;

describe('Avasta openers', () => {
  it('cover B1 lessons a2b1-016…050', () => {
    for (let n = 16; n <= 50; n += 1) expect(OPENERS[`a2b1-${String(n).padStart(3, '0')}`]).toBeTruthy();
  });

  it('are a real mini-situation with five true/false statements, not a two-question survey', () => {
    for (const [id, opener] of Object.entries(OPENERS)) {
      expect(words(opener.text), id).toBeGreaterThanOrEqual(35);
      expect(words(opener.text), id).toBeLessThanOrEqual(80);
      expect(opener.statements, id).toHaveLength(5);
      const wrong = opener.statements.filter(([, ok]) => !ok).length;
      expect(wrong, id).toBeGreaterThanOrEqual(2);
      expect(wrong, id).toBeLessThanOrEqual(3);
      expect(new Set(opener.statements.map(([text]) => text)).size, id).toBe(5);
    }
  });

  it('replace the old two-question intro at the start of the sheet', () => {
    const doc = createAvastaModule4Document('a2b1-016');
    expect(doc.blocks.slice(0, 2).map((block) => block.type)).toEqual(['text', 'truefalse']);
    expect(doc.blocks[1].data.statements).toHaveLength(5);
    expect(doc.blocks.some((block) => block.id === 'a2b1_016_av_intro')).toBe(false);
    expect(openerBlocks('a2b1-019')[0].data.text).toContain('kell kuus kokku?\n\nJaan:');
    expect(openerBlocks('a2-001')).toBeNull();
  });
});
