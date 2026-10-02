import { describe, expect, it } from 'vitest';
import referenceProfile from '../fixtures/a2b1-016.generator-profile.json';
import { editorFieldsToProfile, profileToEditorFields } from './editorFormat.js';
import {
  generatorProfileForLesson,
  generatorProfileReadiness,
  profileDraftForLesson,
  resolveGeneratorProfile,
} from './index.js';
import { scaffoldGeneratorProfile, sanitizeGeneratorProfile, validateGeneratorProfile } from './authoring.js';

const referenceLesson = {
  id: 'a2b1-016',
  title: 'Ajamäärused ja päevaplaan',
  levelStage: 'A2',
  roadmapKind: 'grammar',
  languageFocus: 'Ajamäärused',
  successCriteria: 'Kirjeldan päevaplaani.',
};

describe('generator profile authoring', () => {
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
