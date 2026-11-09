import { describe, expect, it } from 'vitest';
import { B, why } from '../../worksheet-generator/admin/course/blocks.js';
import { extractCourseItems } from './extract.js';
import { buildLesson, sentenceKey } from './lesson.js';
import { coverageOf } from './coverage.js';
import { checkItem } from './items.js';

// a tiny course in the course files' own format (blocks.js builders)
const MOD = (id, index, lessons) => ({ MODULE: { id, title: `Moodul ${index}`, course: 'b1' }, LESSONS: lessons });
const course = [
  MOD('m1', 1, {
    'a2b1-001': {
      title: 'Üks',
      discover: [
        B.notice('n1', 'Märka: pean õppima, aga tahan õppida', ['…']),
        why(B.gaps('g1', 'Ma või da?', 'Kirjuta sulgudes olev tegusõna ma- või da-vormis.', [
          'Liis lubas Annaga soome keeles [rääkida] (rääkima).',
          'Anna peab enne eksamit palju [harjutama] (harjutama).',
        ]), ['Pärast „lubama” tuleb da-vorm.', 'Pärast „pidama” tuleb ma-vorm.']),
        B.wordorder('w1', 'Pane lause kokku.', 'Pane sõnad õigesse järjekorda.', ['Kuna päeval pole aega, õpib Anna õhtul.']),
        // a vocabulary gap without a form cue is not grammar practice
        B.gaps('g2', 'Sõnad.', 'Kirjuta sobiv sõna.', ['Ma joon hommikul [kohvi].'], '', 'full', 'g_vocab'),
        // an open model answer is not a key
        B.transformation('t0', 'Ütle teisiti.', 'Kirjuta lause ümber. Näidisvastus on üks võimalus.', [['Ilm on ilus.', 'väga', 'Täna on imeline ilm.']]),
      ],
      practice: [
        B.transformation('t1', 'Kaks lauset üheks.', 'Ühenda kaks lauset antud sõnaga.', [
          ['Anna on väsinud. Ta õppis öösel.', 'sest', 'Anna on väsinud, sest ta õppis öösel.'],
          ['Päeval pole aega. Anna õpib õhtul.', 'kuna', 'Kuna päeval pole aega, õpib Anna õhtul.'],
        ]),
        B.cloze('c1', 'Kiri.', 'Vali sobiv sõna.', 'Kiri', ['Ta huvitub {*joonistamisest|joonistamist|joonistamisele}. Ta õppis öösel, {*seepärast|sest|kuna} oli ta väsinud.']),
        B.errorfix('e1', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Kuna mul on kiire, ma õpin hommikul.', 'Kuna mul on kiire, õpin ma hommikul.']]),
      ],
    },
  }),
  MOD('m2', 2, {
    'a2b1-006': {
      title: 'Kaks',
      practice: [
        B.formtext('f1', 'Kiri.', 'Pane sulgudes olev sõna õigesse vormi.', 'Tere', ['Markus puudus kolmest [tunnist] (tund). Ta jäi [kursusest] (kursus) maha.']),
        B.wordforms('wf1', 'Vormid.', 'Kirjuta vorm.', [['õppima', 'Hilisõhtune … ei aita.', 'õppimine']]),
      ],
    },
  }),
];

describe('extractCourseItems — only items with verified answers', () => {
  const items = extractCourseItems('b1', course);
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));

  it('turns gaps with a form cue into form items with the base and the teacher’s explanation', () => {
    expect(byId['a2b1-001/g1/0.0']).toMatchObject({ type: 'form', level: 'B1', before: 'Liis lubas Annaga soome keeles', after: '.', base: 'rääkima', answers: ['rääkida'], grammar: ['infinitives'] });
    expect(byId['a2b1-001/g1/1.0'].explain.et).toBe('Pärast „pidama” tuleb ma-vorm.');
  });
  it('skips vocabulary gaps and open model answers', () => {
    expect(items.some((it) => it.source.blockId === 'g2')).toBe(false);
    expect(items.some((it) => it.source.blockId === 't0')).toBe(false);
  });
  it('word order → build; transformation / error fix → transform with tile orders', () => {
    expect(byId['a2b1-001/w1/0']).toMatchObject({ type: 'build', tiles: ['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul'], grammar: ['word-order'] });
    expect(byId['a2b1-001/t1/0']).toMatchObject({ type: 'transform', cue: 'sest', from: 'Anna on väsinud. Ta õppis öösel.' });
    expect(byId['a2b1-001/t1/0'].grammar).toContain('connectors');
    expect(byId['a2b1-001/e1/0']).toMatchObject({ type: 'transform', fix: true });
    expect(byId['a2b1-001/e1/0'].grammar).toContain('word-order');
  });
  it('cloze: same-word options → form, linking-word options → connector, the course options kept', () => {
    expect(byId['a2b1-001/c1/0']).toMatchObject({ type: 'form', answers: ['joonistamisest'], options: ['joonistamisest', 'joonistamist', 'joonistamisele'], before: 'Ta huvitub', after: '.' });
    expect(byId['a2b1-001/c1/1']).toMatchObject({ type: 'connector', answers: ['seepärast'], before: 'Ta õppis öösel,', after: 'oli ta väsinud.' });
  });
  it('formtext and wordforms keep the sentence around the gap and the module order', () => {
    expect(byId['a2b1-006/f1/1']).toMatchObject({ type: 'form', before: 'Ta jäi', after: 'maha.', base: 'kursus', answers: ['kursusest'], moduleIndex: 1 });
    expect(byId['a2b1-006/wf1/0']).toMatchObject({ before: 'Hilisõhtune', after: 'ei aita.', answers: ['õppimine'] });
  });
  it('every item’s own key passes its own check', () => {
    for (const it of items) {
      const response = it.type === 'build' ? { tiles: it.orders[0] } : it.options ? { option: it.answers[0] } : { text: it.answers[0] };
      expect(checkItem(it, response).verdict, it.id).toBe('correct');
    }
  });
});

describe('the real course files', () => {
  const COURSES = ['a2', 'b1', 'b2', 'c1'];
  it.each(COURSES)('%s: items are checkable and the plan coverage is reported', async (c) => {
    const { MODULES } = await import(`../../worksheet-generator/admin/course/courseModules.${c}.js`);
    const items = extractCourseItems(c, MODULES);
    expect(items.length).toBeGreaterThan(1500);
    for (const it of items) {
      expect(it.answers.length, it.id).toBeGreaterThan(0);
      expect(it.answers.every((a) => a.trim()), it.id).toBe(true);
      if (it.options) expect(it.options, it.id).toContain(it.answers[0]);
      if (it.type === 'build') expect(it.orders[0].length, it.id).toBeGreaterThanOrEqual(3);
    }
    const cov = coverageOf(c, items);
    expect(cov.byType.build).toBeGreaterThan(100);
    expect(cov.byType.transform).toBeGreaterThan(300);
    expect(cov.plan.length).toBeGreaterThan(10);
  }, 60_000);
});

describe('buildLesson', () => {
  const items = extractCourseItems('b1', course);
  it('8–12 items, no sentence twice, easy → hard', () => {
    const big = Array.from({ length: 6 }, (_, k) => items.map((it) => ({ ...it, id: `${it.id}#${k}`, answers: it.answers.map((a) => `${a} ${k}`.replace(/\. (\d)$/, ' $1.')) }))).flat();
    const lesson = buildLesson({ pool: big, level: 'B1', seed: 's1' });
    expect(lesson.items.length).toBeGreaterThanOrEqual(8);
    expect(lesson.items.length).toBeLessThanOrEqual(12);
    const keys = lesson.items.map(sentenceKey);
    expect(new Set(keys).size).toBe(keys.length);
    expect(lesson.types.length).toBeGreaterThanOrEqual(2);
    const first = lesson.items.slice(0, 3).reduce((s, it) => s + it.difficulty, 0);
    const last = lesson.items.slice(-3).reduce((s, it) => s + it.difficulty, 0);
    expect(first).toBeLessThan(last);
  });
  it('a short pool gives a short lesson without duplicates', () => {
    // the word-order sentence is also a transformation's answer: it is used once
    const lesson = buildLesson({ pool: items, level: 'B1', seed: 's2' });
    expect(lesson.items).toHaveLength(items.length - 1);
    expect(buildLesson({ pool: items.slice(0, 5), level: 'B1', seed: 's2' }).short).toBe(true);
    expect(new Set(lesson.items.map(sentenceKey)).size).toBe(lesson.items.length);
  });
  it('is deterministic for a seed and mixes the tiles', () => {
    const a = buildLesson({ pool: items, level: 'B1', seed: 'same' });
    const b = buildLesson({ pool: items, level: 'B1', seed: 'same' });
    expect(a.items.map((it) => it.id)).toEqual(b.items.map((it) => it.id));
    const build = a.items.find((it) => it.type === 'build');
    expect(build.shown).toHaveLength(build.tiles.length);
    expect(build.shown.join(' ')).not.toBe(build.tiles.join(' '));
  });
});

describe('buildLesson on a real course', () => {
  it('module focus + spaced earlier grammar, weak points first, listening only with a voice', async () => {
    const { MODULES } = await import('../../worksheet-generator/admin/course/courseModules.b1.js');
    const pool = extractCourseItems('b1', MODULES);
    const moduleId = 'a2b1-module-08';
    const lesson = buildLesson({ pool, level: 'B1', moduleId, seed: 'r1', studentHistory: { wrong: { imperative: 3 } } });
    expect(lesson.items).toHaveLength(10);
    expect(lesson.items.filter((it) => !it.spaced).every((it) => it.moduleId === moduleId)).toBe(true);
    const spaced = lesson.items.filter((it) => it.spaced);
    expect(spaced.length).toBe(3);
    expect(spaced.every((it) => it.moduleIndex < 7)).toBe(true);
    expect(spaced.some((it) => it.grammar.includes('imperative'))).toBe(true);
    expect(lesson.items.some((it) => it.type === 'listen')).toBe(false);
    for (let i = 2; i < lesson.items.length; i += 1) {
      const [a, b, c] = lesson.items.slice(i - 2, i + 1).map((it) => it.type);
      expect(a === b && b === c).toBe(false);
    }
    const focused = buildLesson({ pool, level: 'B1', moduleId, grammarFocus: 'connectors', seed: 'r2', canListen: true, size: 12 });
    expect(focused.items).toHaveLength(12);
    expect(focused.items.filter((it) => !it.spaced).every((it) => it.grammar.includes('connectors'))).toBe(true);
    expect(focused.items.filter((it) => it.spaced).every((it) => !it.grammar.includes('connectors'))).toBe(true);
  }, 60_000);
});
