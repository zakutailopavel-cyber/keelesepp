import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateCoreSheets: vi.fn().mockResolvedValue({ variant: 1 }), profileFor: vi.fn() }));
vi.mock('./lessonGeneration.js', () => ({ CORE_SHEETS: [{ id: 'discover' }, { id: 'practice' }, { id: 'transfer' }], generateCoreSheets: mocks.generateCoreSheets }));
vi.mock('../profiles/index.js', () => ({ generatorProfileForLesson: mocks.profileFor }));
vi.mock('../../../services/firebase/index.js', () => ({ lessonWorksheetsService: {}, levelVocabularyService: {} }));

import { generateModuleDrafts } from './moduleDrafts.js';

describe('module drafts', () => {
  it('creates the missing drafts for lessons with a generator profile, never touching existing sheets', async () => {
    mocks.profileFor.mockImplementation((id) => (id === 'no-profile' ? null : { lessonId: id }));
    const all = [{ worksheetId: 'discover' }, { worksheetId: 'practice' }, { worksheetId: 'transfer' }];
    const repository = { list: vi.fn((id) => Promise.resolve(id === 'hidden-sheet' ? all : id === 'has-avasta' ? [{ worksheetId: 'discover' }] : [])) };
    const vocabularyRepository = { load: vi.fn().mockResolvedValue({ lexicon: [] }) };
    const result = await generateModuleDrafts({
      lessons: [
        { id: 'new-1' },
        { id: 'has-avasta', worksheetPhases: { discover: { publishedVersion: 3 } } },
        { id: 'complete', worksheetPhases: { discover: {}, practice: {}, transfer: {} } },
        { id: 'no-profile' },
        { id: 'hidden-sheet' },
      ],
      user: { uid: 'admin' },
      repository,
      vocabularyRepository,
    });
    expect(result).toMatchObject({ created: ['new-1'], completed: ['has-avasta'], existing: ['complete', 'hidden-sheet'], noProfile: ['no-profile'], failed: [] });
    expect(mocks.generateCoreSheets).toHaveBeenCalledTimes(2);
    expect(mocks.generateCoreSheets).toHaveBeenCalledWith(expect.objectContaining({ lessonId: 'has-avasta', onlyMissing: true }));
    expect(repository.list).not.toHaveBeenCalledWith('complete');
  });
});
