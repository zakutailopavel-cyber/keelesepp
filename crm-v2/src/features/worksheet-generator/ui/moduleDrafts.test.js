import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateCoreSheets: vi.fn().mockResolvedValue({ variant: 1 }), profileFor: vi.fn() }));
vi.mock('./lessonGeneration.js', () => ({ CORE_SHEETS: [{ id: 'discover' }, { id: 'practice' }, { id: 'transfer' }], generateCoreSheets: mocks.generateCoreSheets }));
vi.mock('../profiles/index.js', () => ({ generatorProfileForLesson: mocks.profileFor }));
vi.mock('../../../services/firebase/index.js', () => ({ lessonWorksheetsService: {}, levelVocabularyService: {} }));

import { generateModuleDrafts } from './moduleDrafts.js';

describe('module drafts', () => {
  it('creates drafts only for lessons with a generator profile and no core sheet, never touching existing sheets', async () => {
    mocks.profileFor.mockImplementation((id) => (id === 'no-profile' ? null : { lessonId: id }));
    const repository = { list: vi.fn((id) => Promise.resolve(id === 'hidden-sheet' ? [{ worksheetId: 'discover' }] : [])) };
    const vocabularyRepository = { load: vi.fn().mockResolvedValue({ lexicon: [] }) };
    const result = await generateModuleDrafts({
      lessons: [
        { id: 'new-1' },
        { id: 'has-avasta', worksheetPhases: { discover: { publishedVersion: 3 } } },
        { id: 'no-profile' },
        { id: 'hidden-sheet' },
      ],
      user: { uid: 'admin' },
      repository,
      vocabularyRepository,
    });
    expect(result).toMatchObject({ created: ['new-1'], existing: ['has-avasta', 'hidden-sheet'], noProfile: ['no-profile'], failed: [] });
    expect(mocks.generateCoreSheets).toHaveBeenCalledTimes(1);
    expect(mocks.generateCoreSheets).toHaveBeenCalledWith(expect.objectContaining({ lessonId: 'new-1', difficulty: 'core' }));
  });
});
