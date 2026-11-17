// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17): rules every v4 module keeps. A module is
// v4 when its lessons carry `format`; the sample is B1→B2 module 1 (b2/module01.js). The station gates themselves
// (exactly 4 stations, ≤ 75 min, exit check, teacher page) are in stations.js; these tests hold the rest of the contract:
//   hook first and short, no long text early, at most one long text, varied input, topics, cast as colour only,
//   the learner as the addressee, a home task and an exit check every lesson, an explanation for every scored item.
import { describe, expect, it } from 'vitest';
import { COURSE_MODULES, buildCourseSheet } from './registry.js';
import { castNames, words } from './academicValue.js';
import { stationsOf } from './stations.js';
import { answerKeyOf, explainedShare } from '../../../worksheet-studio/engine/answerKey.js';

const TASK_FORMATS = ['case', 'debate', 'quest', 'facts', 'infogap', 'project', 'game', 'exam'];
const TOPICS = ['languages', 'home', 'work', 'freetime', 'money', 'health', 'town', 'neighbours', 'family', 'learning', 'culture', 'nature'];
// the B1 / B2 cast beyond academicValue.js castNames (docs/COURSE_CAST.md), with case endings
const MORE_CAST = /(?<!\p{L})(?:Eha|Maret|Laura|Gert|Hendrik|Jelena|Kristjan|Krista|Ülle)(?:i|a|e)?(?:t|le|ga|l|lt|s|st|sse|ni|na|ks|ta)?(?!\p{L})/gu;
const PHASES = ['discover', 'practice', 'transfer'];
const HIDDEN = new Set(['teacher', 'explain', 'transcript', 'audio', 'station', 'purpose', 'instruction', 'title', 'heading', 'img', 'aspect', 'bubble', 'tipTitle', 'opener', 'source', 'know', 'exit', 'home']);
// what the learner must read to answer (the title, the one-line instruction and the purpose line are not counted)
const material = (b) => Object.entries(b.data || {}).filter(([k, v]) => !HIDDEN.has(k) && typeof v === 'string').map(([, v]) => v).join(' ');
const TEXTS = ['text', 'reading', 'insertion', 'cloze', 'profiles'];
const textWords = (b) => words(b.type === 'reading' || b.type === 'insertion' || b.type === 'cloze' ? b.data?.passage : b.type === 'profiles' ? JSON.stringify(b.data?.people || []) : b.data?.text);
const RESPONSE = ['speaking', 'table', 'choice', 'rolecards', 'speakcard'];
const INPUT_KIND = { listening: 'audio', examlisten: 'audio', chart: 'chart', text: 'text', insertion: 'text', reading: 'text', profiles: 'cards', dialogue: 'dialogue' };
const learnerText = (doc) => JSON.stringify((doc.blocks || []).map((b) => Object.fromEntries(Object.entries(b.data || {}).filter(([k]) => !['teacher', 'explain', 'transcript', 'audio'].includes(k)))));
const castIn = (text) => [...castNames(text), ...(text.match(MORE_CAST) || [])];

const V4 = COURSE_MODULES.filter((m) => Object.values(m.LESSONS).some((l) => l.format));

describe.each(V4.map((m) => [m.MODULE.id, m]))('design v4 task-based: %s', (_, mod) => {
  const ids = Object.keys(mod.LESSONS);
  const teaching = ids.filter((id) => !mod.LESSONS[id].assessment);
  const sheets = Object.fromEntries(ids.map((id) => [id, Object.fromEntries(PHASES.map((p) => [p, buildCourseSheet(mod, id, p)]))]));
  const stations = (id) => stationsOf(sheets[id]);

  it('format: every lesson from the menu, no two neighbours alike, teaching lessons all different', () => {
    const formats = ids.map((id) => mod.LESSONS[id].format);
    formats.forEach((f, i) => expect(TASK_FORMATS, ids[i]).toContain(f));
    formats.slice(1).forEach((f, i) => expect(f, `${ids[i]} → ${ids[i + 1]}`).not.toBe(formats[i]));
    expect(new Set(teaching.map((id) => mod.LESSONS[id].format)).size).toBe(teaching.length);
  });

  it('topics: one everyday topic a teaching lesson, all different, work at most once', () => {
    const topics = teaching.map((id) => mod.LESSONS[id].topic);
    topics.forEach((t, i) => expect(TOPICS, teaching[i]).toContain(t));
    expect(new Set(topics).size).toBe(topics.length);
    expect(topics.filter((t) => t === 'work').length).toBeLessThanOrEqual(1);
  });

  it('hook first: station 1 of every teaching lesson is ≤ 80 words of material and asks for a learner response', () => {
    for (const id of teaching) {
      const first = stations(id)[0];
      const n = first.blocks.reduce((sum, b) => sum + words(material(b)), 0);
      expect(n, `${id} station 1: ${n} words`).toBeLessThanOrEqual(80);
      expect(first.blocks.some((b) => RESPONSE.includes(b.type)), `${id} station 1 needs a speaking task, a vote or a game`).toBe(true);
    }
  });

  it('long texts: no text over 150 words in the first 15 minutes', () => {
    for (const id of teaching) {
      let start = 0;
      for (const s of stations(id)) {
        if (start < 15) s.blocks.filter((b) => TEXTS.includes(b.type)).forEach((b) => expect(textWords(b), `${id} ${b.id} starts at minute ${start}`).toBeLessThanOrEqual(150));
        start += s.minutes;
      }
    }
  });

  it('long texts: at most one text over 250 words a teaching lesson', () => {
    for (const id of teaching) {
      const long = Object.values(sheets[id]).flatMap((d) => d.blocks).filter((b) => TEXTS.includes(b.type) && textWords(b) > 250);
      expect(long.length, `${id}: ${long.map((b) => b.id).join(', ')}`).toBeLessThanOrEqual(1);
    }
  });

  it('input: at least 3 different kinds across the module (audio, chart, text, cards, dialogue)', () => {
    const kinds = new Set(teaching.flatMap((id) => Object.values(sheets[id]).flatMap((d) => d.blocks)).map((b) => INPUT_KIND[b.type]).filter(Boolean));
    expect(kinds.size, [...kinds].join(', ')).toBeGreaterThanOrEqual(3);
  });

  it('load: 4 stations a lesson, ≤ 75 station minutes of a 90-minute lesson', () => {
    for (const id of teaching) {
      const list = stations(id);
      expect(list.length, id).toBe(4);
      expect(list.reduce((n, s) => n + s.minutes, 0), id).toBeLessThanOrEqual(75);
    }
  });

  it('close: every teaching lesson ends with an exit check, „Ma oskan …”, a home voice message and a homework card', () => {
    for (const id of teaching) {
      const t = sheets[id].transfer.blocks;
      expect(t.filter((b) => b.data?.exit).length, `${id} exit check`).toBe(1);
      expect(t.some((b) => b.type === 'selfcheck' && /Ma oskan/.test(JSON.stringify(b.data))), `${id} self-check`).toBe(true);
      expect(t.some((b) => b.data?.home && b.type === 'speaking'), `${id} home voice message`).toBe(true);
      expect(t.some((b) => b.type === 'phrasebank' && /Kodutöö/.test(JSON.stringify(b.data?.sections || []))), `${id} homework card`).toBe(true);
    }
  });

  it('cast: colour only — at most one short model line in the whole module (≤ 2 mentions)', () => {
    const all = ids.flatMap((id) => Object.values(sheets[id]).flatMap((d) => castIn(learnerText(d))));
    expect(all.length, all.join(', ')).toBeLessThanOrEqual(2);
  });

  it('learner first: every final task speaks to the learner about his own life', () => {
    for (const id of teaching) {
      const final = stations(id).find((s) => s.final);
      const own = final.blocks.some((b) => /sinu|oma |sul |sa /iu.test(`${b.data?.purpose || ''} ${b.data?.instruction || ''} ${b.data?.roleA || ''}`));
      expect(own, id).toBe(true);
    }
  });

  it('teacher page: hook, minute plan, answer sources, plan B and a small-group note', () => {
    for (const id of teaching) {
      const page = sheets[id].discover.meta.teacherPage;
      expect(page.hook && page.plan.length >= 4 && page.sources && page.short && page.groups, id).toBeTruthy();
    }
  });

  it('explanations: every scored item has its „why”, one EXPLAIN line per key item', () => {
    const items = {};
    for (const id of ids) {
      for (const doc of Object.values(sheets[id])) {
        for (const task of answerKeyOf(doc)) {
          items[task.id] = task.items.length;
          if (task.items.some((it) => it.answer)) expect(explainedShare(task), `${id} ${task.id}`).toBe(1);
        }
      }
    }
    for (const [blockId, lines] of Object.entries(mod.EXPLAIN || {})) expect(lines.length, blockId).toBe(items[blockId]);
  });
});
