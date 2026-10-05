import { a2CurriculumRecords } from './a2Curriculum.js';
import plans from './lessonPlanData.json';
import { c1LessonPlan, lessonCategory, roadmapLessonPlan } from './lessonPlans.js';

const module = { title: 'Pere', attention: 'Siduda sõnad reaalse olukorraga.' };

describe('lesson plans written into curriculum lesson descriptions', () => {
  it('builds a grammar plan from the lesson fields: goal, what to teach, timed steps, result', () => {
    const plan = roadmapLessonPlan(module, { kind: 'grammar', tag: 'Grammatika', goal: 'Автоматизировать глаголы', focus: 'olema; elama', practice: 'Подстановка; исправление ошибок; личные предложения.', success: '80% форм' });
    expect(plan).toContain('Цель урока: Автоматизировать глаголы.');
    expect(plan).toContain('Что учить: olema; elama.');
    expect(plan).toMatch(/3\. Тренировка \(20 мин\): Подстановка; исправление ошибок;/);
    expect(plan).toMatch(/4\. Применение \(18 мин\): Личные предложения;/);
    expect(plan).toContain('Результат: 80% форм.');
    expect(plan).toContain('На что обратить внимание в модуле: Siduda sõnad reaalse olukorraga.');
  });

  it('sorts diagnostic items into oral, understanding and writing; a single practice item is not repeated', () => {
    const diagnostic = roadmapLessonPlan(module, { tag: 'Diagnostika', kind: 'integrated', goal: 'x', focus: 'y', practice: 'Знакомство; чтение объявления; текст 40–60 слов о себе', success: 'z' });
    expect(diagnostic).toMatch(/Устная часть \(15 мин\): Знакомство;/);
    expect(diagnostic).toMatch(/Понимание и язык \(20 мин\): Чтение объявления;/);
    expect(diagnostic).toMatch(/Письмо \(15 мин\): Текст 40–60 слов о себе\./);
    const single = roadmapLessonPlan(module, { tag: 'Ситуации', kind: 'lesson', goal: 'x', focus: 'y', practice: 'Неверный счёт, задержка услуги', success: 'z' });
    expect(single.match(/Неверный счёт/g)).toHaveLength(1);
  });

  it('knows every lesson type and writes C1 plans for 2 × 45 minutes', () => {
    expect(['Kontroll', 'Большая проверка', 'Лексика', 'Аргументация', 'Suhtlus'].map((tag) => lessonCategory({ tag }))).toEqual(['assessment', 'assessment', 'vocabulary', 'argument', 'speaking']);
    const c1 = c1LessonPlan({ title: 'Identiteet', description: 'Eneseväljendus.' }, { kind: 'theme', typeText: 'Teemaline C1 keeleoskustund', focus: 'Täpsustada enesekirjeldust', hours: 2 });
    expect(c1).toContain('Ход урока (90 мин):');
    expect(c1).toContain('Что учить: Täpsustada enesekirjeldust.');
  });

  it('has a plan for all 380 lessons and the A2 installer writes it as the description', () => {
    expect(Object.keys(plans)).toHaveLength(380);
    expect(Object.values(plans).every((plan) => plan.description.includes('Ход урока'))).toBe(true);
    const [first] = a2CurriculumRecords();
    expect(first.description).toBe(plans[first.id].description);
    expect(first.descriptionSource).toBe('lesson-plan-v1');
  });
});
