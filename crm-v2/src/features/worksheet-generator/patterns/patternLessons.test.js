import { describe, expect, it } from 'vitest';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generateLessonBundle } from '../engine/generator.js';
import { createContentPackDraft, lessonGrammarPoints, LESSON_GRAMMAR_POINTS, suggestReusablePackIds } from '../factory/factory.js';
import { generatorProfileReadiness } from '../profiles/index.js';

const lessons = roadmap.modules.flatMap((module) => module.lessons);
const lessonOf = (id) => lessons.find((item) => item.id === id);
const PATTERN_LESSONS = Object.keys(LESSON_GRAMMAR_POINTS).filter((id) => lessonGrammarPoints(lessonOf(id)).length);
const blocksOf = (generated) => generated.sheets.flatMap((sheet) => sheet.worksheetDoc.blocks);

describe('lessons generated from grammar patterns (no hand-written pack)', () => {
  it.each(PATTERN_LESSONS)('%s is ready and gives three clean five-task sheets on every seed', (lessonId) => {
    const lesson = lessonOf(lessonId);
    const draft = createContentPackDraft(lesson);
    expect(draft.status).toBe('ready');
    expect(draft.source).toBe('patterns');
    expect(draft.grammarPoints).toEqual(LESSON_GRAMMAR_POINTS[lessonId]);
    expect(createContentPackDraft(lesson)).toEqual(draft);
    const ids = [...draft.profile.focuses, ...draft.profile.activeVocabulary, ...draft.profile.contexts, ...Object.values(draft.profile.banks).flat()].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(generatorProfileReadiness(lessonId, lesson).ready).toBe(true);
    for (const seed of ['a', 'b', 'c', 'd']) {
      const generated = generateLessonBundle({ lesson, profile: draft.profile, seed: `${lessonId}:${seed}` });
      expect(generated.diagnostics.filter((item) => item.severity === 'error'), seed).toEqual([]);
      expect(generated.sheets.map((sheet) => sheet.worksheetDoc.blocks.length)).toEqual([5, 5, 5]);
      blocksOf(generated).forEach((block) => {
        expect(block.data?.title || '').not.toMatch(/[А-Яа-яЁё]/);
        expect(block.data?.instruction || '').not.toMatch(/[А-Яа-яЁё]|[?!]\./);
        expect(block.data?.roleA || '').not.toMatch(/Koosta \S+ plaan/);
      });
    }
  });

  it('pattern gaps and choices use forms of one word with exactly one right answer', () => {
    let gaps = 0;
    let choices = 0;
    for (const lessonId of PATTERN_LESSONS) {
      const lesson = lessonOf(lessonId);
      const { profile } = createContentPackDraft(lesson);
      for (const seed of ['g1', 'g2', 'g3']) {
        blocksOf(generateLessonBundle({ lesson, profile, seed: `${lessonId}:${seed}` })).forEach((block) => {
          if (block.type === 'gaps' && block.data.instruction === 'Vali sõna õige vorm.') {
            const answers = [...block.data.sentences.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]);
            expect(answers.length).toBeGreaterThan(0);
            answers.forEach((answer) => expect(block.data.bank.split(', ')).toContain(answer));
            gaps += 1;
          }
          if (block.type === 'choice' && block.data.title === 'Vali lausesse sobiv vorm.') {
            block.data.questions.forEach((question) => {
              const options = question.options.split('\n');
              expect(options.filter((option) => option.startsWith('*'))).toHaveLength(1);
              expect(new Set(options.map((option) => option.replace('*', ''))).size).toBe(options.length);
              expect(question.q).toContain('___');
            });
            choices += 1;
          }
        });
      }
    }
    expect(gaps).toBeGreaterThan(0);
    expect(choices).toBeGreaterThan(0);
  });

  it('error repair pairs differ from the correct sentence in exactly one word', () => {
    for (const lessonId of PATTERN_LESSONS) {
      const { profile } = createContentPackDraft(lessonOf(lessonId));
      expect(profile.banks.errorPairs.length).toBeGreaterThanOrEqual(2);
      profile.banks.errorPairs.forEach((pair) => {
        const wrong = pair.wrong.split(' ');
        const correct = pair.correct.split(' ');
        expect(wrong.length).toBe(correct.length);
        expect(wrong.filter((word, index) => word !== correct[index])).toHaveLength(1);
      });
    }
  });

  it('curated local-case packs keep inner and outer case series separate', () => {
    const inner = createContentPackDraft(lessonOf('a2-017')).profile;
    const outer = createContentPackDraft(lessonOf('a2-018')).profile;
    expect(inner.focuses.map((item) => item.id)).toEqual(['inner-local-cases']);
    expect(outer.focuses.map((item) => item.id)).toEqual(['outer-local-cases']);
    expect(inner.banks.sentences.every((item) => !/(turul|turule|turult|tööl|tööle|töölt|arstil|arstile|arstilt)\b/.test(item.text))).toBe(true);
    expect(outer.banks.sentences.some((item) => /\b(tööl|tööle|töölt)\b/.test(item.text))).toBe(true);
    expect(outer.banks.transformations.map((item) => item.answer)).toEqual(expect.arrayContaining(['Ma lähen tööle.', 'Panen telefoni lauale.', 'Ta tuleb arstilt.']));
  });

  it('hand-written packs keep precedence and keyword guessing no longer hijacks pattern lessons', () => {
    expect(createContentPackDraft(lessonOf('a2-007')).source).toBeUndefined();
    expect(createContentPackDraft(lessonOf('a2-007')).selectedPackIds).toEqual(['possession-genitive']);
    expect(suggestReusablePackIds(lessonOf('a2-018'))).toEqual(['outer-local-cases']);
    expect(createContentPackDraft(lessonOf('a2-099')).status).toBe('missing-sources');
  });
});
