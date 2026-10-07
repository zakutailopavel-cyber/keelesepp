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
