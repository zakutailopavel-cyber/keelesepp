import { describe, expect, it } from 'vitest';
import a2DiagnosticProfile from '../fixtures/a2-001.generator-profile.json';
import referenceProfile from '../fixtures/a2b1-016.generator-profile.json';
import { editorFieldsToProfile, profileToEditorFields } from './editorFormat.js';
import {
  generatorProfileForLesson,
  generatorProfileReadiness,
  profileDraftForLesson,
  resolveGeneratorProfile,
} from './index.js';
import { scaffoldGeneratorProfile, sanitizeGeneratorProfile, validateGeneratorProfile } from './authoring.js';
import { generateLessonBundle } from '../engine/generator.js';
import roadmap from '../../curriculum/a2Roadmap.json';

const referenceLesson = {
  id: 'a2b1-016',
  title: 'Ajamäärused ja päevaplaan',
  levelStage: 'A2',
  roadmapKind: 'grammar',
  languageFocus: 'Ajamäärused',
  successCriteria: 'Kirjeldan päevaplaani.',
};

describe('generator profile authoring', () => {
  it('accepts the A2 diagnostic content pack and generates three five-task sheets', () => {
    const lesson = {
      id: 'a2-001',
      title: 'A2 lähtediagnostika',
      levelStage: 'A2',
      roadmapKind: 'integrated',
      languageFocus: 'olema, isikulised asesõnad, küsimused, arvud, kuupäevad, põhiinfo enda kohta',
      successCriteria: 'Õpilane annab arusaadavalt põhiandmed enda kohta.',
    };
    const readiness = validateGeneratorProfile(a2DiagnosticProfile, { lessonId: lesson.id, lesson });
    expect(readiness.ready).toBe(true);
    expect(readiness.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(readiness.catalog.discover.available).toBeGreaterThanOrEqual(5);
    expect(readiness.catalog.practice.available).toBeGreaterThanOrEqual(5);
    expect(readiness.catalog.transfer.available).toBeGreaterThanOrEqual(5);

    const generated = generateLessonBundle({
      lesson,
      profile: readiness.profile,
      seed: 'a2-001-reference-test',
      difficulty: 'core',
    });
    expect(generated.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(generated.sheets).toHaveLength(3);
    expect(generated.sheets.map((sheet) => sheet.phase)).toEqual(['discover', 'practice', 'transfer']);
    expect(generated.sheets.every((sheet) => sheet.worksheetDoc.blocks.length === 5)).toBe(true);
    const subtitles = {
      discover: 'Märka tähendust ja keelemustrit kontekstis.',
      practice: 'Harjuta sihtkeelt kontrollitud ülesannetes.',
      transfer: 'Kasuta sihtkeelt iseseisvas suhtluses.',
    };
    generated.sheets.forEach((sheet) => {
      const serialized = JSON.stringify(sheet.worksheetDoc);
      expect(serialized).not.toContain('Определить');
      expect(serialized).not.toContain('Ученик');
      expect(sheet.worksheetDoc.meta.subtitle).toBe(subtitles[sheet.phase]);
      expect(sheet.worksheetDoc.meta.canDo).toBe(a2DiagnosticProfile.successCriteria[0]);
    });
  });

  it('accepts the reference content pack through the same readiness gate used for authored lessons', () => {
    const result = validateGeneratorProfile(referenceProfile, { lessonId: referenceLesson.id, lesson: referenceLesson });
    expect(result.ready).toBe(true);
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(result.counts).toMatchObject({
      focuses: 4,
      vocabulary: 10,
      contexts: 3,
      sentences: 8,
      errorPairs: 3,
      translations: 4,
    });
    expect(result.catalog.discover.available).toBeGreaterThanOrEqual(5);
    expect(result.catalog.practice.available).toBeGreaterThanOrEqual(5);
    expect(result.catalog.transfer.available).toBeGreaterThanOrEqual(5);
  });

  it.each(['a2-002', 'a2-003', 'a2-004', 'a2-005', 'a2-006'])('registers %s as a ready curated Factory fallback', (lessonId) => {
    const lesson = roadmap.modules.flatMap((module) => module.lessons).find((item) => item.id === lessonId);
    const resolved = resolveGeneratorProfile(lessonId, lesson);
    expect(resolved.source).toBe('static');
    expect(resolved.ready).toBe(true);
    expect(resolved.profile.lessonId).toBe(lessonId);
    expect(resolved.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
  });

  it('creates a saveable but not-ready scaffold from roadmap lesson metadata', () => {
    const lesson = {
      id: 'b1-999',
      title: 'Minu arvamus',
      levelStage: 'B1',
      roadmapKind: 'communication',
      languageFocus: 'Põhjendamine',
      successCriteria: 'Õpilane põhjendab oma arvamust.',
    };
    const scaffold = scaffoldGeneratorProfile(lesson);
    const readiness = validateGeneratorProfile(scaffold, { lessonId: lesson.id, lesson });
    expect(scaffold).toMatchObject({
      schema: 'keelesepp.worksheet-generator-profile/1',
      lessonId: 'b1-999',
      level: 'B1',
      lessonKind: 'communication',
      title: 'Minu arvamus',
    });
    expect(scaffold.focuses[0]).toMatchObject({ id: 'lesson-focus', label: 'Põhjendamine' });
    expect(readiness.ready).toBe(false);
    expect(readiness.diagnostics.some((item) => item.code === 'PROFILE_VOCABULARY_LOW')).toBe(true);
  });

  it('sanitizes references and bounded profile fields instead of persisting arbitrary data', () => {
    const profile = sanitizeGeneratorProfile({
      lessonId: 'lesson-1',
      level: 'A2+',
      lessonKind: 'grammar',
      title: 'Test',
      focuses: [{ id: 'f1', type: 'grammar', label: 'Fookus' }],
      activeVocabulary: [{ id: 'v1', word: 'enne', translation: 'до', focusIds: ['f1', 'missing'] }],
      contexts: [{ id: 'c1', label: 'Kontekst' }],
      banks: {
        sentences: [{ id: 's1', focusIds: ['f1', 'missing'], contextIds: ['c1', 'missing'], text: 'Enne tööd puhkan.' }],
        errorPairs: [],
        translations: [],
        dialogues: [],
        speakingPrompts: [],
        writingPrompts: [],
      },
      successCriteria: ['Oskan.'],
      arbitrary: { shouldDisappear: true },
    }, { lessonId: 'lesson-1' });
    expect(profile.level).toBe('A2');
    expect(profile.activeVocabulary[0].focusIds).toEqual(['f1']);
    expect(profile.banks.sentences[0].focusIds).toEqual(['f1']);
    expect(profile.banks.sentences[0].contextIds).toEqual(['c1']);
    expect(profile.arbitrary).toBeUndefined();
  });

  it('sanitizes and preserves controlled transformation and listening banks', () => {
    const profile = sanitizeGeneratorProfile({
      lessonId: 'lesson-media',
      level: 'A2',
      lessonKind: 'listening',
      title: 'Media',
      focuses: [{ id: 'f1', type: 'listening', label: 'Fookus' }],
      activeVocabulary: [
        { id: 'v1', word: 'kodu', translation: 'дом', focusIds: ['f1'] },
        { id: 'v2', word: 'pood', translation: 'магазин', focusIds: ['f1'] },
        { id: 'v3', word: 'töö', translation: 'работа', focusIds: ['f1'] },
      ],
      contexts: [
        { id: 'c1', label: 'Üks' }, { id: 'c2', label: 'Kaks' }, { id: 'c3', label: 'Kolm' },
      ],
      banks: {
        sentences: Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, focusIds: ['f1'], contextIds: ['c1'], text: 'Kodu on siin.' })),
        errorPairs: [],
        translations: [],
        transformations: [{ id: 'tr1', focusIds: ['f1'], from: 'Ma olen kodus.', prompt: 'Kuhu?', answer: 'Ma lähen koju.' }],
        dialogues: [],
        listeningScripts: [{ id: 'ls1', focusIds: ['f1'], contextIds: ['c1'], title: 'Kuula', transcript: 'Kodu on poe kõrval.', sentences: 'Kodu on [poe] kõrval.' }],
        speakingPrompts: [],
        writingPrompts: [],
      },
      successCriteria: ['Ma saan aru.'],
    }, { lessonId: 'lesson-media' });
    expect(profile.banks.transformations).toEqual([expect.objectContaining({ id: 'tr1', answer: 'Ma lähen koju.' })]);
    expect(profile.banks.listeningScripts).toEqual([expect.objectContaining({ id: 'ls1', transcript: 'Kodu on poe kõrval.' })]);
  });

  it('sanitizes controlled functional reading documents', () => {
    const profile = sanitizeGeneratorProfile({
      lessonId: 'lesson-reading',
      level: 'A2',
      lessonKind: 'reading',
      title: 'Lugemine',
      focuses: [{ id: 'f1', type: 'reading', label: 'Praktiline info' }],
      activeVocabulary: [
        { id: 'v1', word: 'avatud', translation: 'открыто', focusIds: ['f1'] },
        { id: 'v2', word: 'suletud', translation: 'закрыто', focusIds: ['f1'] },
        { id: 'v3', word: 'peatus', translation: 'остановка', focusIds: ['f1'] },
      ],
      contexts: [{ id: 'c1', label: 'Teade' }, { id: 'c2', label: 'Silt' }, { id: 'c3', label: 'Graafik' }],
      banks: {
        sentences: Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, focusIds: ['f1'], contextIds: ['c1'], text: 'Peatus on avatud.' })),
        errorPairs: [], translations: [], transformations: [], dialogues: [], listeningScripts: [],
        readingDocuments: [{ id: 'rd1', focusIds: ['f1'], contextIds: ['c1'], title: 'Teade', passage: 'Pühapäeval on suletud.', questions: 'Kas pühapäeval saab sisse? [ei]\nMillal tuleb valida teine päev? [pühapäeval]\nMida tähendab suletud? [ei ole avatud]\nKas teade on praktiline info? [jah]\nMida inimene peab enne minekut kontrollima? [lahtiolekuaega]' }],
        speakingPrompts: [], writingPrompts: [],
      },
      successCriteria: ['Ma leian vajaliku info.'],
    }, { lessonId: 'lesson-reading' });
    expect(profile.banks.readingDocuments).toEqual([expect.objectContaining({ id: 'rd1', title: 'Teade' })]);
    expect(profile.banks.readingDocuments[0].questions.split('\n')).toHaveLength(5);
  });

  it('round-trips reference content without losing slots, aliases or dialogue bank', () => {
    const fields = profileToEditorFields(referenceProfile, referenceLesson);
    const parsed = editorFieldsToProfile(fields, { lesson: referenceLesson, baseProfile: referenceProfile });
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.profile.banks.dialogues).toEqual(referenceProfile.banks.dialogues);
    expect(parsed.profile.banks.sentences.find((item) => item.id === 's04').slots)
      .toEqual(referenceProfile.banks.sentences.find((item) => item.id === 's04').slots);
    expect(parsed.profile.focuses.find((item) => item.id === 'before-after').patterns)
      .toEqual(referenceProfile.focuses.find((item) => item.id === 'before-after').patterns);
  });

  it('prefers a ready embedded profile and keeps a static fallback while an embedded draft is incomplete', () => {
    const embedded = {
      ...referenceProfile,
      title: 'Embedded',
      activeVocabulary: referenceProfile.activeVocabulary.map((item) => ({ ...item })),
    };
    const readyLesson = { ...referenceLesson, generatorProfile: embedded };
    const ready = resolveGeneratorProfile(referenceLesson.id, readyLesson);
    expect(ready.ready).toBe(true);
    expect(ready.source).toBe('embedded');
    expect(generatorProfileForLesson(referenceLesson.id, readyLesson).title).toBe('Embedded');

    const draft = scaffoldGeneratorProfile(referenceLesson);
    const draftLesson = { ...referenceLesson, generatorProfile: draft };
    const resolvedDraft = resolveGeneratorProfile(referenceLesson.id, draftLesson);
    expect(resolvedDraft.ready).toBe(true);
    expect(resolvedDraft.source).toBe('static');
    expect(resolvedDraft.fallback).toBe(true);
    expect(resolvedDraft.embeddedDraft.ready).toBe(false);
    expect(profileDraftForLesson(referenceLesson.id, draftLesson).source).toBe('embedded');
    expect(generatorProfileReadiness(referenceLesson.id, draftLesson)).toMatchObject({
      supported: true,
      source: 'static',
      fallback: true,
    });
  });
});
