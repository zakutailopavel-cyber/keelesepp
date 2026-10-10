/* global process */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { collectWorks } from '../admin/course/materialAudit.js';
import { SHEET_MINUTES, sheetMinutes } from '../../worksheet-studio/didactics/timeEstimate.js';
import { levelBand } from '../engine/lessonEnrichment.js';
import { ALL_VISUALS, artLevel, visualSrc } from './textbookArt.js';
import { OBJECT_KEYS, objectsForLesson, sceneSvg, topicBrief } from './topicArt.js';

const MAX_BLOCKS = 18;

describe('topic illustrations', () => {
  it('chooses three different known objects for every kind of lesson', () => {
    for (const title of ['Kohvikus', 'Kontroll 3', 'Grammatika: Rektsioon ja käändevalik', 'Midagi täiesti muud']) {
      const keys = objectsForLesson({ title, moduleTitle: 'B2 Tööelu', turn: 2 });
      expect(new Set(keys).size).toBe(3);
      keys.forEach((key) => expect(OBJECT_KEYS).toContain(key));
    }
    expect(objectsForLesson({ title: 'Kohvikus', moduleTitle: '' })[0]).toBe('cup');
  });

  it('draws a 3:2 picture in the art-bible palette with the lime accent on the main object', () => {
    const svg = sceneSvg(['cup', 'plate', 'receipt']);
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 1200 800"/);
    expect(svg).toContain('#C9F03D');
    expect(svg.match(/#[0-9A-F]{6}/gi).every((c) => ['#1E1E1E', '#FFFFFF', '#C9F03D', '#E8F9B0', '#D9D9D9'].includes(c.toUpperCase()))).toBe(true);
  });

  // WRITE_TOPIC_ART=1: one picture per lesson without a commissioned one, on the first sheet that still has time
  it('writes the pictures and their briefs on demand', () => {
    if (!process.env.WRITE_TOPIC_ART) return;
    const jsonPath = resolve(process.cwd(), 'src/features/worksheet-generator/art/visuals/topic-art.json');
    const publicDir = resolve(process.cwd(), 'public');
    const old = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const oldIds = new Set(old.map((v) => v.id));
    old.forEach((visual) => rmSync(`${publicDir}${visualSrc(visual)}`, { force: true }));
    const commissioned = new Set(ALL_VISUALS.filter((v) => !v.ext).map((v) => v.id.replace(/-(avasta|harjuta|kasuta)-\d+$/, '')));
    const strip = (doc) => ({ ...doc, blocks: doc.blocks.filter((b) => !oldIds.has(b.data?.artId) && !oldIds.has(b.data?.artFor)) });
    const briefs = [];
    const skipped = [];
    for (const work of collectWorks()) {
      Object.entries(work.lessons).forEach(([lessonId, docs], turn) => {
        if (commissioned.has(lessonId) || !artLevel(lessonId)) return;
        const byPhase = Object.fromEntries(docs.map((doc) => [doc.meta?.phase, strip(doc)]));
        const phase = ['discover', 'practice', 'transfer'].find((p) => byPhase[p] && sheetMinutes({ ...byPhase[p], blocks: [...byPhase[p].blocks, { type: 'image' }, { type: 'notice' }] }) <= SHEET_MINUTES.max && byPhase[p].blocks.length + 2 <= MAX_BLOCKS);
        if (!phase) { skipped.push(lessonId); return; }
        const doc = byPhase[phase];
        const brief = topicBrief({ lessonId, title: String(doc.meta?.title || '').replace(/\s+—\s+.*$/, ''), moduleTitle: work.title, band: levelBand(doc.meta?.level), phase, turn });
        const file = `${publicDir}${visualSrc(brief)}`;
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, sceneSvg(brief.objects, brief.id));
        briefs.push(brief);
      });
    }
    writeFileSync(jsonPath, `${JSON.stringify(briefs, null, 2)}\n`);
    if (process.env.TOPIC_ART_SKIPPED) writeFileSync(process.env.TOPIC_ART_SKIPPED, skipped.join('\n'));
    expect(briefs.length).toBeGreaterThan(0);
  }, 120000);
});
