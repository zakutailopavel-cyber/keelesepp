import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateCoreSheets: vi.fn().mockResolvedValue({ variant: 1 }), profileFor: vi.fn() }));
vi.mock('./lessonGeneration.js', () => ({ CORE_SHEETS: [{ id: 'discover' }, { id: 'practice' }, { id: 'transfer' }], generateCoreSheets: mocks.generateCoreSheets }));
vi.mock('../profiles/index.js', () => ({ generatorProfileForLesson: mocks.profileFor }));
vi.mock('../../../services/firebase/index.js', () => ({ lessonWorksheetsService: {}, levelVocabularyService: {} }));
vi.mock('../../worksheet-studio/quality.js', () => ({ analyzeWorksheet: (doc) => ({ ready: !doc.broken }) }));

import { generateModuleDrafts, prepareModule } from './moduleDrafts.js';

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

describe('prepare module', () => {
  it('publishes ready drafts, adds the picture to a published sheet, keeps sheets with quality errors as drafts', async () => {
    mocks.generateCoreSheets.mockClear();
    mocks.profileFor.mockReturnValue(null);
    const text = { id: 'i', type: 'text', data: {} };
    const sheets = {
      'a2-004': [
        { worksheetId: 'discover', worksheetDocStatus: 'draft', worksheetDoc: { blocks: [text] }, worksheetDocUpdatedAt: 'd1' },
        { worksheetId: 'practice', worksheetDocStatus: 'draft', worksheetDoc: { broken: true, blocks: [text] }, worksheetDocUpdatedAt: 'p1' },
        { worksheetId: 'transfer', worksheetDocStatus: 'published', worksheetDoc: { blocks: [text] }, worksheetDocUpdatedAt: 't1' },
      ],
      'a2-003': [{ worksheetId: 'discover', worksheetDocStatus: 'published', worksheetDoc: { blocks: [text] }, worksheetDocUpdatedAt: 'x' }],
    };
    const repository = { list: vi.fn((id) => Promise.resolve(sheets[id] || [])), publish: vi.fn().mockResolvedValue({}) };
    const result = await prepareModule({ lessons: [{ id: 'a2-003', worksheetPhases: { discover: {}, practice: {}, transfer: {} } }, { id: 'a2-004', worksheetPhases: { discover: {}, practice: {}, transfer: {} } }], user: { uid: 'a' }, repository, vocabularyRepository: { load: async () => ({ lexicon: [] }) } });
    expect(result).toMatchObject({ published: ['a2-004:discover'], pictured: ['a2-004:transfer'], notReady: ['a2-004:practice'], failed: [] });
    const transfer = repository.publish.mock.calls.find(([input]) => input.worksheetId === 'transfer')[0];
    expect(transfer.worksheetDoc.blocks.map((block) => block.type)).toEqual(['text', 'image', 'notice']);
    expect(transfer.baseUpdatedAt).toBe('t1');
    expect(repository.publish).not.toHaveBeenCalledWith(expect.objectContaining({ lessonId: 'a2-003' }));
  });
});
