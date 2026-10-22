import { monthlyReport } from './monthlyReport.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const day = (n) => new Date(now - n * 86400000).toISOString();

describe('Kuu aruanne vanemale (owner 2026-10-23)', () => {
  it('lessons, words, the month\'s steps, homework and what comes next — in Estonian and Russian', () => {
    const text = monthlyReport({
      now, student: { name: 'Mia' },
      lessons: [{ date: day(3), status: 'Toimunud' }, { date: day(10), status: 'Toimunud' }, { date: day(12), status: 'Puudus_eta' }, { date: day(50), status: 'Toimunud' }],
      words: [{ word: 'kass', translation: 'кот', box: 3, reviewedAt: day(2), createdAt: day(20) }, { word: 'koer', translation: 'собака', box: 1, createdAt: day(60) }],
      assignments: [{ lessonTitle: 'Pere', status: 'done', completedAt: day(4), worksheetDoc: { meta: { goals: { g1: 'Ma räägin oma perest', g2: 'Ma loen lühikest teksti' } } }, score: { perGoal: { g1: { ok: 9, total: 10 }, g2: { ok: 2, total: 5 } } } }],
      homework: [{ createdAt: day(5), status: 'Tehtud' }, { createdAt: day(6), status: 'Ootel' }],
    });
    expect(text).toBe([
      'Kuu kokkuvõte · oktoober 2026 · Mia',
      'Tunde: 2 (puudumisi 1).',
      'Sõnad: 1 selgeks õpitud sel kuul, kokku 1; uusi sõnu 1.',
      'Tundide sammud: 1/2 selge.',
      'Kodutööd: 1/2 tehtud, 1 pooleli.',
      'Järgmisel kuul harjutame: Ma loen lühikest teksti.',
      '',
      'Итоги месяца · октябрь 2026 · Mia',
      'Уроков: 2 (пропусков 1).',
      'Слова: в этом месяце выучено 1, всего 1; новых слов 1.',
      'Шаги уроков: усвоено 1 из 2.',
      'Домашние задания: выполнено 1 из 2, 1 в процессе.',
      'В следующем месяце работаем над: Ma loen lühikest teksti.',
    ].join('\n'));
  });
});
