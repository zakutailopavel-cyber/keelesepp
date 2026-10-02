import { describe, expect, it } from 'vitest';
import profile from '../fixtures/a2b1-016.generator-profile.json';
import { difficultySpec, orderActivitiesByDifficulty } from './difficulty.js';
import { createLessonDna, lessonDnaFingerprint, LESSON_DNA_SCHEMA } from './lessonDna.js';
import { generatorProfileForLesson, generatorProfileReadiness, listGeneratorProfiles } from '../profiles/index.js';

const lesson = { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2' };

describe('Lesson DNA and difficulty', () => {
  it('creates a canonical deterministic lesson DNA outside the worksheet document', () => {
    const dna = createLessonDna({
      lesson,
      profile,
      focusIds: ['before-after'],
      difficulty: 'challenge',
      mode: 'focus-worksheet',
      durationMinutes: 75,
      variant: 3,
      seed: 'dna-seed',
    });
    expect(dna).toMatchObject({
      schema: LESSON_DNA_SCHEMA,
      lessonId: 'a2b1-016',
      profileVersion: 1,
      level: 'A2',
      lessonKind: 'grammar',
      difficulty: 'challenge',
      mode: 'focus-worksheet',
      durationMinutes: 75,
      focusIds: ['before-after'],
      variant: 3,
      seed: 'dna-seed',
    });
    expect(dna.targetVocabularyIds).toHaveLength(profile.activeVocabulary.length);
    expect(dna.prioritySkills).toContain('grammar');
    expect(lessonDnaFingerprint(dna)).toBe(lessonDnaFingerprint({ ...dna }));
    expect(lessonDnaFingerprint({ ...dna, difficulty: 'support' })).not.toBe(lessonDnaFingerprint(dna));
  });

  it('changes scaffolding without introducing randomness', () => {
    const support = difficultySpec({ level: 'A2', mode: 'support', phase: 'transfer' });
    const core = difficultySpec({ level: 'A2', mode: 'core', phase: 'transfer' });
    const challenge = difficultySpec({ level: 'A2', mode: 'challenge', phase: 'transfer' });
    expect(support.showWordBank).toBe(true);
    expect(challenge.showWordBank).toBe(false);
    expect(support.distractorCount).toBeLessThan(core.distractorCount);
    expect(core.distractorCount).toBeLessThan(challenge.distractorCount);
    expect(support.speakingSeconds[0]).toBeLessThan(challenge.speakingSeconds[0]);
    expect(support.writingSentences[0]).toBeLessThan(challenge.writingSentences[0]);

    const activities = [
      { id: 'low', cognitiveLoad: 1 },
      { id: 'mid', cognitiveLoad: 3 },
      { id: 'high', cognitiveLoad: 5 },
    ];
    expect(orderActivitiesByDifficulty(activities, { level: 'A2', mode: 'support', seedOrder: activities }).map((item) => item.id)).toEqual(['low', 'mid', 'high']);
    expect(orderActivitiesByDifficulty(activities, { level: 'A2', mode: 'challenge', seedOrder: activities }).map((item) => item.id)).toEqual(['high', 'mid', 'low']);
  });

  it('resolves curated profiles through one registry', () => {
    expect(generatorProfileForLesson('a2b1-016')).toBe(profile);
    expect(generatorProfileForLesson('not-ready')).toBeNull();
    expect(generatorProfileReadiness('a2b1-016')).toMatchObject({ supported: true, profileVersion: 1, level: 'A2' });
    expect(generatorProfileReadiness('not-ready').supported).toBe(false);
    expect(listGeneratorProfiles().map((item) => item.lessonId)).toContain('a2b1-016');
  });
});
