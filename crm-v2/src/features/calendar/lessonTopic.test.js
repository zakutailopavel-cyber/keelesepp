import { buildTopicCatalog, pickFromRecord, topicFromPick } from './lessonTopic.js';

const catalog = buildTopicCatalog([
  { id: 'b1-1', title: 'Minu päev', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
  { id: 'b1-2', title: 'Sagedus', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 2 },
]);

describe('lesson topic picked by the teacher', () => {
  it('a lesson, a module only, or nothing', () => {
    const module = catalog.levels[0].modules[0];
    expect(topicFromPick(catalog, { level: 'B1', module: module.key, lessonId: 'b1-2' }, 'x')).toMatchObject({ topic: 'Sagedus', topicLessonId: 'b1-2', notes: 'x' });
    expect(topicFromPick(catalog, { level: 'B1', module: module.key, lessonId: '' })).toMatchObject({ topic: module.label, topicModule: module.label, topicLessonId: '' });
    expect(topicFromPick(catalog, {})).toMatchObject({ topic: 'Individuaalne tund', topicLessonId: '' });
  });

  it('reads a stored record back into the picker', () => {
    const module = catalog.levels[0].modules[0];
    expect(pickFromRecord(catalog, { topicLessonId: 'b1-1' })).toEqual({ level: 'B1', module: module.key, lessonId: 'b1-1' });
    expect(pickFromRecord(catalog, { topicLevel: 'B1', topicModule: module.label })).toEqual({ level: 'B1', module: module.key, lessonId: '' });
  });

  it('shows a module-only topic once', async () => {
    const { topicLine } = await import('./lessonTopic.js');
    expect(topicLine({ topic: 'Igapäevaelu', topicLevel: 'B1', topicModule: 'Igapäevaelu' })).toBe('B1 · Igapäevaelu');
  });
});
