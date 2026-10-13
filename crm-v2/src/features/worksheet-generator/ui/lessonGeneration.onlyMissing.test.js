import { vi } from 'vitest';
import profile from '../fixtures/a2b1-016.generator-profile.json';
import { generateCoreSheets } from './lessonGeneration.js';

describe('generateCoreSheets onlyMissing', () => {
  it('leaves an existing (hand-made, published) phase untouched and saves only the missing ones', async () => {
    const repository = { saveDraft: vi.fn().mockResolvedValue({}) };
    await generateCoreSheets({
      repository,
      lessonId: 'a2b1-016',
      lesson: { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', title: 'Ajamäärused ja päevaplaan' },
      profile,
      sheets: [{ worksheetId: 'discover', worksheetDocStatus: 'published', worksheetDocVersion: 5 }],
      levelVocabulary: { lexicon: [] },
      difficulty: 'core',
      user: { uid: 'admin' },
      onlyMissing: true,
    });
    expect(repository.saveDraft.mock.calls.map(([input]) => input.worksheetId)).toEqual(['practice', 'transfer']);
  });
});

describe('course sheets are never replaced by the generator', () => {
  const lesson = { id: 'a2b1-016', tag: 'Грамматика', levelStage: 'A2', title: 'Ajamäärused ja päevaplaan' };
  const courseSheet = { worksheetId: 'practice', worksheetDocStatus: 'published', publishedWorksheetDoc: { id: 'ws_a2b1-016_practice', blocks: [{ id: 'b' }] } };

  it('recognises a sheet published from the course code by its document id', async () => {
    const { isCourseSheet } = await import('./lessonGeneration.js');
    expect(isCourseSheet(courseSheet, 'a2b1-016')).toBe(true);
    expect(isCourseSheet({ worksheetId: 'practice', worksheetDoc: { id: 'ws_gen_123' } }, 'a2b1-016')).toBe(false);
  });

  it('a full regeneration keeps the course sheet and writes only the other phases', async () => {
    const repository = { saveDraft: vi.fn().mockResolvedValue({}) };
    await generateCoreSheets({ repository, lessonId: 'a2b1-016', lesson, profile, sheets: [courseSheet], levelVocabulary: { lexicon: [] }, difficulty: 'core', user: { uid: 'admin' } });
    expect(repository.saveDraft.mock.calls.map(([input]) => input.worksheetId)).toEqual(['discover', 'transfer']);
  });

  it('„Ainult see leht” refuses a course sheet', async () => {
    const { previewCoreSheet, COURSE_SHEET_KEPT } = await import('./lessonGeneration.js');
    expect(() => previewCoreSheet({ lessonId: 'a2b1-016', lesson, profile, sheets: [courseSheet], levelVocabulary: { lexicon: [] }, difficulty: 'core', worksheetId: 'practice' })).toThrow(COURSE_SHEET_KEPT);
  });
});
