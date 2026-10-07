import { describe, expect, it } from 'vitest';
import roadmap from '../../curriculum/a2Roadmap.json';
import { generateLessonBundle } from '../engine/generator.js';
import { REUSABLE_CONTENT_LIBRARY } from './contentLibrary.js';
import { createContentPackDraft, suggestReusablePackIds } from './factory.js';

const lessons = roadmap.modules.flatMap((module) => module.lessons);

describe('Content Pack Factory v1', () => {
  it.each(['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006', 'a2-007', 'a2-008', 'a2-009', 'a2-010', 'a2-011', 'a2-012', 'a2-013', 'a2-014', 'a2-015', 'a2-016', 'a2-017', 'a2-018', 'a2-019', 'a2-020', 'a2-021', 'a2-022', 'a2-023', 'a2-024', 'a2-025', 'a2-026', 'a2-027', 'a2-028', 'a2-029', 'a2-030', 'a2-031', 'a2-032', 'a2-033', 'a2-034', 'a2-035', 'a2-036', 'a2-037', 'a2-038', 'a2-039', 'a2-040', 'a2-041', 'a2-042', 'a2-043', 'a2-044', 'a2-045', 'a2-046', 'a2-047', 'a2-048', 'a2-049', 'a2-050', 'a2-046', 'a2-047', 'a2-048', 'a2-049', 'a2-050', 'a2-041', 'a2-042', 'a2-043', 'a2-044', 'a2-045'])('builds a ready, deterministic five-task bundle for %s', (lessonId) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    const first = createContentPackDraft(lesson);
    const second = createContentPackDraft(lesson);

    expect(first).toEqual(second);
    expect(first.status).toBe('ready');
    expect(first.readiness.ready).toBe(true);
    expect(first.readiness.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(first.profile.contexts.length).toBeGreaterThanOrEqual(3);
    ['discover', 'practice', 'transfer'].forEach((phase) => {
      expect(first.readiness.catalog[phase].available).toBeGreaterThanOrEqual(5);
    });

    const ids = [
      ...first.profile.focuses,
      ...first.profile.activeVocabulary,
      ...first.profile.contexts,
      ...Object.values(first.profile.banks).flat(),
    ].map((item) => item.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);

    const generated = generateLessonBundle({ lesson, profile: first.profile, seed: `${lessonId}:factory-test` });
    expect(generated.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(generated.sheets.map((sheet) => sheet.phase)).toEqual(['discover', 'practice', 'transfer']);
    expect(generated.sheets.every((sheet) => sheet.worksheetDoc.blocks.length === 5)).toBe(true);
    generated.sheets.forEach((sheet) => {
      expect(sheet.worksheetDoc.meta.subtitle).not.toMatch(/[А-Яа-яЁё]/);
      expect(sheet.worksheetDoc.meta.canDo).not.toMatch(/[А-Яа-яЁё]/);
      sheet.worksheetDoc.blocks.forEach((block) => {
        expect(block.data?.title || '').not.toMatch(/[А-Яа-яЁё]/);
        expect(block.data?.instruction || '').not.toMatch(/[А-Яа-яЁё]/);
      });
    });
  });

  it('uses the intended curated sources for each supported lesson', () => {
    const selections = ['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006'].map((lessonId) => {
      const lesson = lessons.find((item) => item.id === lessonId);
      return suggestReusablePackIds(lesson);
    });
    expect(selections[0]).toEqual(['introduction', 'basic-questions']);
    expect(selections[1]).toEqual(['olema-present', 'present-common-verbs']);
    expect(selections[2]).toEqual(['personal-info', 'numbers-dates']);
    expect(selections[3]).toHaveLength(6);
    expect(selections[4]).toEqual(['family-relations']);
    expect(new Set(selections.map((item) => item.join('|'))).size).toBe(5);
  });

  it('keeps A2-006 grounded in family relations and the kelle-pattern', () => {
    const lesson = lessons.find((item) => item.id === 'a2-006');
    const result = createContentPackDraft(lesson);

    expect(result.status).toBe('ready');
    expect(result.selectedPackIds).toEqual(['family-relations']);
    expect(result.profile.focuses).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'family-relations', patterns: expect.arrayContaining(['Kelle …?']) }),
    ]));
    expect(result.profile.activeVocabulary.map((item) => item.word)).toEqual(expect.arrayContaining([
      'ema', 'isa', 'õde', 'vend', 'abikaasa', 'vanemad', 'lapsed',
    ]));
    expect(result.profile.contexts.map((item) => item.id)).toEqual(['family-tree', 'family-photo', 'family-visit']);
    expect(result.profile.banks.sentences.some((item) => item.text.includes('Kelle tütar'))).toBe(true);
    expect(result.profile.banks.speakingPrompts).toHaveLength(2);
    expect(result.profile.banks.writingPrompts).toHaveLength(1);
  });

  it.each(['a2-007', 'a2-008', 'a2-009', 'a2-010', 'a2-011', 'a2-012', 'a2-013', 'a2-014', 'a2-015', 'a2-016', 'a2-017', 'a2-018', 'a2-019', 'a2-020', 'a2-021', 'a2-022', 'a2-023', 'a2-024', 'a2-025', 'a2-026', 'a2-027', 'a2-028', 'a2-029', 'a2-030', 'a2-031', 'a2-032', 'a2-033', 'a2-034', 'a2-035', 'a2-036', 'a2-037', 'a2-038', 'a2-039', 'a2-040'])('gives %s complete answer keys on every sheet across seeds', (lessonId) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    const { profile } = createContentPackDraft(lesson);
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const generated = generateLessonBundle({ lesson, profile, seed: `${lessonId}:${seed}` });
      expect(generated.diagnostics.filter((item) => item.severity === 'error'), seed).toEqual([]);
    }
  });

  it('every sentence of every pack contains a target word, so gap-fill always has an answer', () => {
    for (const id of Object.keys(REUSABLE_CONTENT_LIBRARY)) {
      const pack = REUSABLE_CONTENT_LIBRARY[id];
      const words = pack.vocabulary.map((item) => item.word.toLocaleLowerCase('et'));
      pack.sentences.forEach((sentence) => {
        const text = sentence.text.toLocaleLowerCase('et');
        expect(words.some((word) => new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[.,!?;:]|\\s|$)`, 'u').test(text)), `${id}: ${sentence.text}`).toBe(true);
      });
    }
  });

  it('module 2 uses the intended curated sources and keeps clock tasks out of A2-007…A2-009', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-007')).toEqual(['possession-genitive']);
    expect(pick('a2-008')).toEqual(['appearance-character']);
    expect(pick('a2-009')).toEqual(['people-profiles']);
    expect(pick('a2-010')).toEqual(['family-relations', 'possession-genitive', 'appearance-character', 'people-profiles']);
    for (const lessonId of ['a2-007', 'a2-008', 'a2-009']) {
      const lesson = lessons.find((item) => item.id === lessonId);
      const { profile } = createContentPackDraft(lesson);
      const generated = generateLessonBundle({ lesson, profile, seed: `${lessonId}:clock` });
      expect(generated.sheets.flatMap((sheet) => sheet.worksheetDoc.blocks.map((block) => block.type))).not.toContain('clock');
    }
    const a2007 = createContentPackDraft(lessons.find((item) => item.id === 'a2-007')).profile;
    expect(a2007.banks.sentences.some((item) => item.text.includes('Kelle kott'))).toBe(true);
    expect(a2007.banks.errorPairs.map((item) => item.correct)).toContain('See on minu venna auto.');
  });

  it('module 3 uses the intended curated sources; clock practice only where times belong', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-011')).toEqual(['daily-routine']);
    expect(pick('a2-012')).toEqual(['clock-time']);
    expect(pick('a2-013')).toEqual(['frequency']);
    expect(pick('a2-014')).toEqual(['week-plan']);
    expect(pick('a2-015')).toEqual(['daily-routine', 'clock-time', 'frequency', 'week-plan']);
    const clock = createContentPackDraft(lessons.find((item) => item.id === 'a2-012')).profile;
    expect(clock.banks.sentences.map((item) => item.text)).toContain('Tund algab kell kuus ja lõpeb kell pool kaheksa.');
    expect(clock.contexts.every((context) => context.times.length >= 3)).toBe(true);
    for (const lessonId of ['a2-013', 'a2-014']) {
      const profile = createContentPackDraft(lessons.find((item) => item.id === lessonId)).profile;
      expect(profile.contexts.every((context) => context.times.length === 0)).toBe(true);
    }
  });

  it('module 4 uses curated home/local-case sources, transformations and real listening input', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-016')).toEqual(['home-rooms']);
    expect(pick('a2-017')).toEqual(['inner-local-cases']);
    expect(pick('a2-018')).toEqual(['outer-local-cases']);
    expect(pick('a2-019')).toEqual(['neighbourhood']);
    expect(pick('a2-020')).toEqual(['home-rooms', 'inner-local-cases', 'outer-local-cases', 'neighbourhood']);

    const inner = createContentPackDraft(lessons.find((item) => item.id === 'a2-017')).profile;
    const outer = createContentPackDraft(lessons.find((item) => item.id === 'a2-018')).profile;
    const listening = createContentPackDraft(lessons.find((item) => item.id === 'a2-019')).profile;
    expect(inner.banks.transformations.length).toBeGreaterThanOrEqual(2);
    expect(outer.banks.transformations.length).toBeGreaterThanOrEqual(2);
    expect(listening.banks.listeningScripts.length).toBeGreaterThanOrEqual(2);

    const generated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-019'),
      profile: listening,
      seed: 'a2-019:listening-required',
    });
    const practiceTypes = generated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type);
    expect(practiceTypes).toContain('listening');
  });

  it('module 5 uses curated city, route, imperative and practical-reading sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-021')).toEqual(['city-places']);
    expect(pick('a2-022')).toEqual(['directions']);
    expect(pick('a2-023')).toEqual(['route-imperative']);
    expect(pick('a2-024')).toEqual(['city-practical-info']);
    expect(pick('a2-025')).toEqual(['city-places', 'directions', 'route-imperative', 'city-practical-info']);

    const imperative = createContentPackDraft(lessons.find((item) => item.id === 'a2-023')).profile;
    const reading = createContentPackDraft(lessons.find((item) => item.id === 'a2-024')).profile;
    expect(imperative.banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
    expect(imperative.banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(reading.banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(reading.banks.readingDocuments.every((doc) => doc.questions.split('\n').filter(Boolean).length >= 5)).toBe(true);

    const imperativeGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-023'),
      profile: imperative,
      seed: 'a2-023:listening-required',
    });
    expect(imperativeGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('listening');

    const readingGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-024'),
      profile: reading,
      seed: 'a2-024:reading-required',
    });
    const readingBlocks = readingGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.filter((block) => block.type === 'reading');
    expect(readingBlocks).toHaveLength(1);
    expect(readingBlocks[0].data.questions.split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('module 6 uses curated food, quantity, cafe and order-listening sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-026')).toEqual(['food-drink']);
    expect(pick('a2-027')).toEqual(['quantity-partitive']);
    expect(pick('a2-028')).toEqual(['cafe-order']);
    expect(pick('a2-029')).toEqual(['order-bill']);
    expect(pick('a2-030')).toEqual(['food-drink', 'quantity-partitive', 'cafe-order', 'order-bill']);

    const quantity = createContentPackDraft(lessons.find((item) => item.id === 'a2-027')).profile;
    const listening = createContentPackDraft(lessons.find((item) => item.id === 'a2-029')).profile;
    expect(quantity.banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(quantity.banks.errorPairs.length).toBeGreaterThanOrEqual(3);
    expect(listening.banks.listeningScripts.length).toBeGreaterThanOrEqual(2);

    const quantityGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-027'),
      profile: quantity,
      seed: 'a2-027:transformations',
    });
    expect(quantityGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('transformation');

    const listeningGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-029'),
      profile: listening,
      seed: 'a2-029:listening-required',
    });
    const listeningBlocks = listeningGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.filter((block) => block.type === 'listening');
    expect(listeningBlocks).toHaveLength(1);
    expect(listeningBlocks[0].data.transcript.length).toBeGreaterThan(100);
    expect(listeningBlocks[0].data.sentences.split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('module 7 uses curated shopping, prices, fitting and return-reading sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-031')).toEqual(['shopping-goods']);
    expect(pick('a2-032')).toEqual(['shopping-prices']);
    expect(pick('a2-033')).toEqual(['fitting-compare']);
    expect(pick('a2-034')).toEqual(['receipt-return']);
    expect(pick('a2-035')).toEqual(['shopping-goods', 'shopping-prices', 'fitting-compare', 'receipt-return']);

    const prices = createContentPackDraft(lessons.find((item) => item.id === 'a2-032')).profile;
    const reading = createContentPackDraft(lessons.find((item) => item.id === 'a2-034')).profile;
    expect(prices.banks.listeningScripts.length).toBeGreaterThanOrEqual(2);
    expect(prices.banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(reading.banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(reading.banks.readingDocuments.every((doc) => doc.questions.split('\n').filter(Boolean).length >= 5)).toBe(true);

    const pricesGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-032'),
      profile: prices,
      seed: 'a2-032:listening-required',
    });
    expect(pricesGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('listening');

    const readingGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-034'),
      profile: reading,
      seed: 'a2-034:reading-required',
    });
    const readingBlocks = readingGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.filter((block) => block.type === 'reading');
    expect(readingBlocks).toHaveLength(1);
    expect(readingBlocks[0].data.questions.split('\n').filter(Boolean).length).toBeGreaterThanOrEqual(5);
  });

  it('module 8 uses curated booking, modal, form-reading and phone-service sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-036')).toEqual(['appointment-booking']);
    expect(pick('a2-037')).toEqual(['service-modals']);
    expect(pick('a2-038')).toEqual(['forms-instructions']);
    expect(pick('a2-039')).toEqual(['phone-service']);
    expect(pick('a2-040')).toEqual(['appointment-booking', 'service-modals', 'forms-instructions', 'phone-service']);

    const modals = createContentPackDraft(lessons.find((item) => item.id === 'a2-037')).profile;
    const reading = createContentPackDraft(lessons.find((item) => item.id === 'a2-038')).profile;
    const phone = createContentPackDraft(lessons.find((item) => item.id === 'a2-039')).profile;
    expect(modals.banks.transformations.length).toBeGreaterThanOrEqual(4);
    expect(reading.banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(reading.banks.readingDocuments.every((doc) => doc.questions.split('\n').filter(Boolean).length >= 5)).toBe(true);
    expect(phone.banks.listeningScripts.length).toBeGreaterThanOrEqual(2);

    const readingGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-038'),
      profile: reading,
      seed: 'a2-038:reading-required',
    });
    expect(readingGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('reading');

    const phoneGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-039'),
      profile: phone,
      seed: 'a2-039:listening-required',
    });
    expect(phoneGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('listening');
  });

  it('module 9 uses curated symptom, state, doctor and safe practical-reading sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-041')).toEqual(['body-symptoms']);
    expect(pick('a2-042')).toEqual(['health-state-forms']);
    expect(pick('a2-043')).toEqual(['doctor-visit']);
    expect(pick('a2-044')).toEqual(['medicine-appointment-info']);
    expect(pick('a2-045')).toEqual(['body-symptoms', 'health-state-forms', 'doctor-visit', 'medicine-appointment-info']);

    const state = createContentPackDraft(lessons.find((item) => item.id === 'a2-042')).profile;
    const doctor = createContentPackDraft(lessons.find((item) => item.id === 'a2-043')).profile;
    const reading = createContentPackDraft(lessons.find((item) => item.id === 'a2-044')).profile;
    expect(state.banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(doctor.banks.listeningScripts.length).toBeGreaterThanOrEqual(1);
    expect(reading.banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(reading.banks.readingDocuments.every((doc) => doc.questions.split('\n').filter(Boolean).length >= 5)).toBe(true);
    expect(reading.banks.readingDocuments[0].passage).toContain('EI OLE PÄRIS RAVIMIJUHIS');

    const readingGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-044'),
      profile: reading,
      seed: 'a2-044:reading-required',
    });
    expect(readingGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('reading');
  });

  it('module 10 uses curated hobby, preference, invitation and event-reading sources', () => {
    const pick = (lessonId) => suggestReusablePackIds(lessons.find((item) => item.id === lessonId));
    expect(pick('a2-046')).toEqual(['hobby-leisure']);
    expect(pick('a2-047')).toEqual(['liking-preferences']);
    expect(pick('a2-048')).toEqual(['invitation-response']);
    expect(pick('a2-049')).toEqual(['events-tickets']);
    expect(pick('a2-050')).toEqual(['hobby-leisure', 'liking-preferences', 'invitation-response', 'events-tickets']);

    const liking = createContentPackDraft(lessons.find((item) => item.id === 'a2-047')).profile;
    const invitation = createContentPackDraft(lessons.find((item) => item.id === 'a2-048')).profile;
    const reading = createContentPackDraft(lessons.find((item) => item.id === 'a2-049')).profile;
    expect(liking.banks.transformations.length).toBeGreaterThanOrEqual(3);
    expect(invitation.banks.dialogues.length).toBeGreaterThanOrEqual(1);
    expect(reading.banks.readingDocuments.length).toBeGreaterThanOrEqual(2);
    expect(reading.banks.readingDocuments.every((doc) => doc.questions.split('\n').filter(Boolean).length >= 5)).toBe(true);

    const readingGenerated = generateLessonBundle({
      lesson: lessons.find((item) => item.id === 'a2-049'),
      profile: reading,
      seed: 'a2-049:reading-required',
    });
    expect(readingGenerated.sheets.find((sheet) => sheet.phase === 'practice').worksheetDoc.blocks.map((block) => block.type)).toContain('reading');
  });

  it('translation hints never reveal an accepted answer', () => {
    for (const lessonId of ['a2-007', 'a2-011', 'a2-012', 'a2-013']) {
      const lesson = lessons.find((item) => item.id === lessonId);
      const { profile } = createContentPackDraft(lesson);
      generateLessonBundle({ lesson, profile, seed: `${lessonId}:hint` }).sheets.flatMap((sheet) => sheet.worksheetDoc.blocks)
        .filter((block) => block.type === 'translation')
        .forEach((block) => block.data.rows.forEach((row) => expect(row.hint).toBe('')));
    }
  });

  it('meaning choices offer exactly one translation that fits', () => {
    for (const id of Object.keys(REUSABLE_CONTENT_LIBRARY)) {
      const translations = REUSABLE_CONTENT_LIBRARY[id].vocabulary.map((item) => item.translation);
      expect(new Set(translations).size, id).toBe(translations.length);
    }
  });

  it.each(['a2-007', 'a2-011', 'a2-013'])('%s gap choices never offer a second word of the same part of speech', (lessonId) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    const { profile } = createContentPackDraft(lesson);
    const typeOf = new Map(profile.activeVocabulary.map((item) => [item.word, item.lexicalType]));
    let checked = 0;
    for (let index = 0; index < 30; index += 1) {
      const generated = generateLessonBundle({ lesson, profile, seed: `${lessonId}:choice:${index}` });
      generated.sheets.flatMap((sheet) => sheet.worksheetDoc.blocks)
        .filter((block) => block.type === 'choice' && block.data.title === 'Vali lausesse sobiv vorm.')
        .flatMap((block) => block.data.questions)
        .forEach((question) => {
          const options = question.options.split('\n');
          const correct = options.find((option) => option.startsWith('*')).slice(1);
          options.filter((option) => !option.startsWith('*')).forEach((option) => expect(typeOf.get(option), `${question.q} ${option}`).not.toBe(typeOf.get(correct)));
          checked += 1;
        });
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('true/false items name the situation the learner judges against', () => {
    const lesson = lessons.find((item) => item.id === 'a2-009');
    const { profile } = createContentPackDraft(lesson);
    const labels = profile.contexts.map((item) => item.label);
    const blocks = generateLessonBundle({ lesson, profile, seed: 'a2-009:tf' }).sheets.flatMap((sheet) => sheet.worksheetDoc.blocks).filter((block) => block.type === 'truefalse');
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => expect(labels.some((label) => block.data.instruction.includes(`Olukord: ${label}.`))).toBe(true));
  });

  it('gap tasks hold several sentences, not one', () => {
    for (const lessonId of ['a2-003', 'a2-006', 'a2-011']) {
      const lesson = lessons.find((item) => item.id === lessonId);
      const { profile } = createContentPackDraft(lesson);
      for (const seed of ['g1', 'g2', 'g3', 'g4']) {
        generateLessonBundle({ lesson, profile, seed: `${lessonId}:${seed}` }).sheets.flatMap((sheet) => sheet.worksheetDoc.blocks)
          .filter((block) => block.type === 'gaps')
          .forEach((block) => {
            const lines = block.data.sentences.split('\n');
            expect(lines.length, `${lessonId} ${seed}`).toBeGreaterThanOrEqual(2);
            lines.forEach((line) => expect(line).toMatch(/\[[^\]]+\]/));
          });
      }
    }
  });

  it('reports missing sources and never invents or activates an unsupported profile', () => {
    const result = createContentPackDraft({ id: 'a2-099', title: 'A2 proovieksam' });
    expect(result.status).toBe('missing-sources');
    expect(result.profile).toBeNull();
    expect(result.missingSources).not.toEqual([]);
  });
});
