import { existsSync, statSync } from 'node:fs';
import { ALL_VISUALS, artLevel, missingArt, scenePlace, visualSrc, withLessonArt } from './textbookArt.js';
import { COURSE_MODULES, moduleSheets } from '../admin/course/registry.js';

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
    expect(withArt.blocks.map((block) => block.type)).toEqual(['text', 'image', 'notice', 'gap']);
    expect(withArt.blocks[1]).toMatchObject({ span: 8, data: { artId: 'a2-001-avasta-1', aspect: '3:2', img: { src: '/textbook-art/a2/a2-001/a2-001-avasta-1.webp' } } });
    expect(withArt.blocks[2]).toMatchObject({ span: 4, data: { title: 'Vaata pilti', lines: 'Kus Anna ja Liis on?\nMida Anna Liisile ütleb?\nMida sina ütled, kui tutvustad ennast uues kohas?' } });
    expect(withLessonArt(withArt, 'a2-001', 'discover')).toBe(withArt);
    expect(missingArt(withArt, 'a2-001', 'discover')).toEqual([]);
    expect(withLessonArt(doc, 'a2-001', 'practice')).toBe(doc);
  });
});

describe('older sheets with a half-width picture', () => {
  it('get ⅔ width and the „Vaata pilti” card once; other sheets stay the same object', async () => {
    const { withArtLayout } = await import('./textbookArt.js');
    const old = { blocks: [{ id: 'p', type: 'image', width: 'half', data: { artId: 'a2-004-kasuta-1' } }, { id: 't', type: 'table', width: 'full', data: {} }] };
    const fixed = withArtLayout(old);
    expect(fixed.blocks.map((block) => [block.type, block.span])).toEqual([['image', 8], ['notice', 4], ['table', undefined]]);
    expect(fixed.blocks[1].data.lines).toBe('Mida Sofia teeninduslaual täidab?\nMida Liis kontrollib?\nMilliseid andmeid tuleb ankeeti kirjutada?');
    expect(withArtLayout(fixed)).toBe(fixed);
    const plain = { blocks: [{ id: 'x', type: 'text', data: {} }] };
    expect(withArtLayout(plain)).toBe(plain);
  });
});

describe('where a scene picture stands', () => {
  const visual = { id: 'a2-001-avasta-1', phase: 'discover', caption: 'c', alt: 'a', prompts: ['x'] };
  const types = (doc) => doc.blocks.map((block) => block.id);
  const task = (id, type, data = {}) => ({ id, type, width: 'full', data });
  const add = (blocks, brief = visual) => withLessonArt({ blocks }, 'a2-001', 'discover', [brief]);

  it('goes directly before the first speaking or writing task, tasks keep their order', () => {
    const blocks = [task('i', 'text', { text: 'Tere.' }), task('g', 'gaps'), task('s', 'speaking'), task('w', 'writing')];
    expect(types(add(blocks))).toEqual(['i', 'g', 'art_a2-001-avasta-1', 'artq_a2-001-avasta-1', 's', 'w']);
  });

  it('stays at the top when the task is first and when the sheet has no such task', () => {
    expect(types(add([task('s', 'speaking'), task('g', 'gaps')]))).toEqual(['art_a2-001-avasta-1', 'artq_a2-001-avasta-1', 's', 'g']);
    expect(types(add([task('i', 'text'), task('s', 'rolecards'), task('g', 'gaps')]))).toEqual(['i', 'art_a2-001-avasta-1', 'artq_a2-001-avasta-1', 's', 'g']);
    expect(types(add([task('i', 'text'), task('g', 'gaps')]))).toEqual(['i', 'art_a2-001-avasta-1', 'artq_a2-001-avasta-1', 'g']);
  });

  it('honours the place the brief names, first', () => {
    const blocks = [task('i', 'text'), task('g', 'gaps'), task('m', 'match'), task('s', 'speaking')];
    expect(scenePlace(blocks, { ...visual, place: 'm' })).toBe(2);
    expect(scenePlace(blocks, { ...visual, place: 'nothing' })).toBe(3);
    expect(types(add(blocks, { ...visual, place: 'g' })).slice(0, 4)).toEqual(['i', 'art_a2-001-avasta-1', 'artq_a2-001-avasta-1', 'g']);
  });

  it('comes before a block that talks about the picture', () => {
    const blocks = [task('i', 'text'), task('g', 'gaps'), task('r', 'reading', { instruction: 'Vaata pilti ja loe.' }), task('s', 'speaking')];
    expect(scenePlace(blocks, visual)).toBe(2);
    expect(scenePlace([task('i', 'text', { text: 'Vaata pilti.' }), task('g', 'gaps'), task('s', 'speaking')], visual)).toBe(1);
    // the teacher's note and a task with its own picture do not count
    expect(scenePlace([task('i', 'text'), task('g', 'gaps', { teacher: 'Näita pilti.' }), task('s', 'speaking')], visual)).toBe(2);
    expect(scenePlace([task('i', 'text'), task('p', 'picmatch', { title: 'Sõnad ja pildid' }), task('s', 'speaking')], visual)).toBe(2);
  });

  it('keeps a hint with its task, a half-width row whole and an exam part header above the picture', () => {
    const hint = { id: 'n', type: 'tip', width: 'full', data: {} };
    expect(scenePlace([task('i', 'text'), task('g', 'gaps'), hint, task('s', 'speaking')], visual)).toBe(2);
    const half = (id, type) => ({ id, type, width: 'half', span: 6, data: {} });
    expect(scenePlace([task('i', 'text'), task('g', 'gaps'), half('h', 'wordforms'), half('s', 'writing')], visual)).toBe(2);
    expect(scenePlace([task('g', 'gaps'), task('part', 'exampart'), task('s', 'speaking')], visual)).toBe(2);
  });

  it('on every course sheet: the picture comes before whatever talks about it, and is on the sheet once', () => {
    const talks = /\bpil(t|di|ti)/i;
    const skip = new Set(['teacher', 'explain', 'transcript', 'audio', 'img', 'alt', 'caption']);
    const read = (value) => (typeof value === 'string' ? value : Array.isArray(value) ? value.map(read).join(' ') : value && typeof value === 'object' ? Object.entries(value).filter(([key]) => !skip.has(key)).map(([, item]) => read(item)).join(' ') : '');
    const own = new Set(['image', 'picmatch', 'pictures', 'scenelabel', 'picrows']);
    const briefOf = new Map(ALL_VISUALS.map((brief) => [brief.id, brief]));
    for (const mod of COURSE_MODULES) {
      for (const [id, phases] of Object.entries(moduleSheets(mod))) {
        for (const [phase, doc] of Object.entries(phases)) {
          const at = doc.blocks.findIndex((block) => block.data?.artId);
          if (at < 0) continue;
          const artIds = doc.blocks.filter((block) => block.data?.artId).map((block) => block.data.artId);
          expect(new Set(artIds).size, `${id} ${phase}`).toBe(artIds.length);
          if (briefOf.get(doc.blocks[at].data.artId)?.place) continue;
          const early = doc.blocks.slice(0, at).filter((block) => !own.has(block.type) && !block.data?.img && !block.data?.artFor && talks.test(read(block.data)));
          // the first block of a sheet is the opening text the picture follows
          expect(early.filter((block) => block !== doc.blocks[0]).map((block) => block.id), `${id} ${phase}`).toEqual([]);
          // the picture and its card fill one row
          expect(doc.blocks[at + 1].data?.artFor, `${id} ${phase}`).toBe(doc.blocks[at].data.artId);
        }
      }
    }
    }, 240000);
});
