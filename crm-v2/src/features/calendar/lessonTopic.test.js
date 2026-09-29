import { buildTopicCatalog, INDIVIDUAL_TOPIC, suggestTopic, topicFields, topicLine } from './lessonTopic.js';

const lessons = [
  { id: 'b1-m1-1', title: 'Minu päev', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
  { id: 'b1-m1-2', title: 'Sagedus', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 2 },
  { id: 'b1-m2-1', title: 'Menüü', level: 'B1', roadmapModuleTitle: 'Toit', roadmapModuleNumber: 2, roadmapLessonNumber: 1 },
  { id: 'b1-test', title: 'Kontroll 1', level: 'B1', type: 'test', roadmapModuleTitle: 'Toit', roadmapModuleNumber: 2 },
  { id: 'a2-1', title: 'Tere', level: 'A2', roadmapModuleTitle: 'Algus', roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
];
const catalog = buildTopicCatalog(lessons);

describe('lesson topic from Õppevara', () => {
  it('builds level → theme → lesson in curriculum order, without tests', () => {
    expect(catalog.levels.map((level) => level.key)).toEqual(['A2', 'B1']);
    const b1 = catalog.levels.find((level) => level.key === 'B1');
    expect(b1.modules.map((module) => [module.label, module.lessons.map((lesson) => lesson.id)])).toEqual([
      ['Igapäevaelu', ['b1-m1-1', 'b1-m1-2']],
      ['Toit', ['b1-m2-1']],
    ]);
  });

  it('suggests the next lesson after the last one, crossing into the next theme', () => {
    expect(suggestTopic(catalog, { history: [{ topicLessonId: 'b1-m1-1' }] }).id).toBe('b1-m1-2');
    expect(suggestTopic(catalog, { history: [{ topicLessonId: 'b1-m1-2' }, { topicLessonId: 'b1-m1-1' }] }).id).toBe('b1-m2-1');
    expect(suggestTopic(catalog, { history: [{ topic: 'Individuaalne tund' }], studentLevel: 'B1' }).id).toBe('b1-m1-1');
    expect(suggestTopic(catalog, { studentLevel: 'A2' }).id).toBe('a2-1');
  });

  it('writes the chosen topic, or "Individuaalne tund" when nothing is chosen', () => {
    const picked = catalog.byId.get('b1-m2-1');
    expect(topicFields(picked, ' partitiivi harjutused ')).toEqual({ topic: 'Menüü', topicLevel: 'B1', topicModule: 'Toit', topicLessonId: 'b1-m2-1', notes: 'partitiivi harjutused' });
    expect(topicFields(null, 'kooli kodutöö').topic).toBe(INDIVIDUAL_TOPIC);
    expect(topicLine({ topic: 'Menüü', topicLevel: 'B1', topicModule: 'Toit' })).toBe('B1 · Toit · Menüü');
  });
});
