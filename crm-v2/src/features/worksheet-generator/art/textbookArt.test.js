import { existsSync, statSync } from 'node:fs';
import { ALL_VISUALS, artLevel, missingArt, visualSrc, withLessonArt } from './textbookArt.js';

const publicDir = `${globalThis.process.cwd()}/public`;

describe('textbook illustrations', () => {
  it('every registered visual has its image file, within the size budget, and a caption and alt text', () => {
    expect(ALL_VISUALS.length).toBeGreaterThan(0);
    for (const visual of ALL_VISUALS) {
      const file = `${publicDir}${visualSrc(visual)}`;
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThanOrEqual(150 * 1024);
      expect(visual.caption && visual.alt && visual.learningJob, visual.id).toBeTruthy();
    }
  });

  it('puts the lesson picture after the opening text once and maps lesson ids to level folders', () => {
    expect([artLevel('a2-001'), artLevel('a2b1-016'), artLevel('b1b2-004'), artLevel('est-c1-010')]).toEqual(['a2', 'b1', 'b2', 'c1']);
    const doc = { blocks: [{ id: 'i', type: 'text', data: {} }, { id: 't', type: 'gap', data: {} }] };
    const withArt = withLessonArt(doc, 'a2-001', 'discover');
    expect(withArt.blocks.map((block) => block.type)).toEqual(['text', 'image', 'gap']);
    expect(withArt.blocks[1].data).toMatchObject({ artId: 'a2-001-avasta-1', aspect: '3:2', img: { src: '/textbook-art/a2/a2-001/a2-001-avasta-1.webp' } });
    expect(withLessonArt(withArt, 'a2-001', 'discover')).toBe(withArt);
    expect(missingArt(withArt, 'a2-001', 'discover')).toEqual([]);
    expect(withLessonArt(doc, 'a2-001', 'practice')).toBe(doc);
  });
});
