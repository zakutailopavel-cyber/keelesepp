import { defaultMonth, factsForAdmin, monthFacts, monthOf, parentMessage, plainTopic, progressLines, reportLanguage } from './parentMonthReport.js';

const now = Date.parse('2026-11-04T12:00:00+02:00');
const err = (source = 'gec') => ({ said: 'x', corrected: 'y', source, kind: 'vorm' });
const errors = (gec, teacher = 0) => [...Array.from({ length: gec }, () => err()), ...Array.from({ length: teacher }, () => err('teacher'))];
const rec = (id, startedAt, analysis, transcript = [{ speaker: 'student', text: 'Ma elan Tallinnas.' }]) => ({ id, invitationId: `inv-${id}`, status: 'done', startedAt, language: 'et', transcript, analysis });

const fixture = {
  lessons: [
    { id: 'l1', date: '2026-10-05', status: 'Toimunud', topic: 'Pere ja kodu' },
    { id: 'l2', date: '2026-10-12', status: 'Toimunud', topic: 'Poes' },
    { id: 'l3', date: '2026-10-19', status: 'Puudus_eta', topic: 'Ilm' },
    { id: 'l4', date: '2026-10-26', status: 'Toimunud', topic: '' },
    { id: 'l5', date: '2026-09-28', status: 'Toimunud', topic: 'Tutvustus' },
    { id: 'l6', date: '2026-10-30', status: 'Planeeritud', topic: 'Tulevik' },
  ],
  assignments: [
    { lessonTitle: 'pere ja kodu', completedAt: '2026-10-06T10:00:00Z', status: 'done' },
    { lessonTitle: 'Kellaajad · Harjuta', assignedAt: '2026-10-20T10:00:00Z', status: 'new' },
    { lessonTitle: 'Vana teema', completedAt: '2026-09-02T10:00:00Z', status: 'done' },
  ],
  summaries: [{ id: 'inv-b', startedAt: '2026-10-26T09:00:00Z', pages: [{ id: 'p1', title: 'Leht 1' }, { id: 'p2', title: 'Tahvel' }, { id: 'p3', title: 'Minu päev' }] }],
  recordings: [
    rec('a', '2026-09-20T09:00:00Z', { checked: 25, errors: errors(10, 2), focus: [{ key: 'order', topic: 'Порядок слов', count: 6 }, { key: 'cases', topic: 'Падеж', count: 4 }] },
      [{ speaker: 'student', text: 'Ma käin koolis iga päev.' }]),
    rec('b', '2026-10-12T09:00:00Z', { checked: 15, errors: errors(3, 2), focus: [{ key: 'cases', topic: 'Падеж', count: 3 }, { key: 'order', topic: 'Порядок слов', count: 1 }, { key: 'verb', topic: 'Формы глагола', count: 1 }] },
      [{ speaker: 'student', text: 'Eile ma käisin koos emaga poes ja ostsin leiba. Jah.' }, { speaker: 'student', text: 'Я не знаю как это сказать по эстонски совсем никак вообще' }, { speaker: 'teacher', text: 'Väga hea, aga nüüd räägi mulle palun natuke pikemalt oma eilsest päevast ja perest.' }]),
    rec('c', '2026-10-26T09:00:00Z', { checked: 15, errors: errors(3, 1), focus: [{ key: 'cases', topic: 'Падеж', count: 2 }, { key: 'verb', topic: 'Формы глагола', count: 1 }] }),
  ],
  words: [
    { word: 'kass', translation: 'кот', createdAt: '2026-10-03T10:00:00Z' },
    { word: 'koer', translation: 'собака', createdAt: '2026-10-15T10:00:00Z' },
    { word: 'maja', translation: 'дом', createdAt: '2026-08-01T10:00:00Z' },
    { word: 'Ma lähen kooli.', translation: 'Sinu lause: Ma lähen koolis.', createdAt: '2026-10-15T10:00:00Z' },
  ],
  homework: [
    { due: '2026-10-08', status: 'Tehtud', submittedAt: '2026-10-07T18:00:00Z' },
    { due: '2026-10-15', status: 'Tehtud', submittedAt: '2026-10-17T18:00:00Z' },
    { due: '2026-10-22', status: 'Ootel' },
    { due: '2026-10-29', status: 'Suletud' },
    { due: '2026-09-29', status: 'Tehtud', submittedAt: '2026-09-28T18:00:00Z' },
  ],
};

describe('Kuu kokkuvõte vanemale — data', () => {
  it('month helpers: default month, language, dates', () => {
    expect(defaultMonth(now)).toBe('2026-10');
    expect(defaultMonth(Date.parse('2026-11-18T12:00:00+02:00'))).toBe('2026-11');
    expect(defaultMonth(Date.parse('2026-01-03T12:00:00+02:00'))).toBe('2025-12');
    expect(reportLanguage({ preferredLanguage: 'uk' })).toBe('uk');
    expect(reportLanguage({ preferredLanguage: 'de' })).toBe('ru');
    expect(reportLanguage({})).toBe('ru');
    expect(monthOf('2026-10-31')).toBe('2026-10');
    expect(plainTopic('Kellaajad · Harjuta')).toBe('Kellaajad');
    expect(plainTopic('Leht 3')).toBe('');
  });

  it('counts only real data of the month', () => {
    const facts = monthFacts({ month: '2026-10', now, ...fixture });
    expect(facts.lessonsHeld).toBe(3);
    expect(facts.topics).toEqual(['Pere ja kodu', 'Poes', 'Kellaajad', 'Minu päev']);
    // October: (3 + 3) Mac errors / 30 checked = 20 %; September 10 / 25 = 40 %; the teacher's recasts are not counted
    expect(facts.errorShare).toEqual({ now: 20, prev: 40, checkedNow: 30, checkedPrev: 25 });
    // the Russian line and the teacher's line do not count
    expect(facts.longest).toEqual({ now: 9, prev: 5 });
    expect(facts.words).toEqual({ total: 3, newInMonth: 2 });
    expect(facts.homework).toEqual({ onTime: 1, total: 3 });
    expect(facts.improved.map((t) => t.key)).toEqual(['order']);
    expect(facts.focus.map((t) => [t.key, t.count])).toEqual([['cases', 5], ['verb', 2]]);
  });

  it('too few checked sentences: no share comparison, no improved topic without last month', () => {
    const facts = monthFacts({ month: '2026-10', now, recordings: fixture.recordings.slice(1, 2) });
    expect(facts.errorShare).toBeNull();
    expect(facts.improved).toEqual([]);
    expect(facts.checkedNow).toBe(15);
    expect(factsForAdmin(facts).join('\n')).toMatch(/võrdluseks on vaja mõlemas kuus ≥ 20 lauset/);
  });

  it('month to date counts only days up to today', () => {
    const facts = monthFacts({ month: '2026-11', now, lessons: [{ date: '2026-11-03', status: 'Toimunud' }, { date: '2026-11-20', status: 'Toimunud' }] });
    expect(facts).toMatchObject({ partial: true, until: '2026-11-04', lessonsHeld: 1, homework: null, longest: null, errorShare: null });
  });

  it('a share that went up is shown to the admin but not written to the parent as progress', () => {
    const facts = { ...monthFacts({ month: '2026-10', now, ...fixture }), errorShare: { now: 40, prev: 20, checkedNow: 30, checkedPrev: 25 } };
    expect(progressLines(facts, 'ru').join('\n')).not.toMatch(/Фраз с ошибками/);
  });
});

describe('Kuu kokkuvõte vanemale — text', () => {
  const facts = monthFacts({ month: '2026-10', now, ...fixture });

  it('Russian (default): greeting, what we covered, progress, what next, closing — no gendered verbs', () => {
    const text = parentMessage({ facts, student: { name: 'Mia Tamm', parentName: 'Olga Tamm' } });
    expect(text).toBe([
      'Здравствуйте, Olga!',
      '',
      'Коротко об учёбе за месяц: октябрь 2026 — Mia Tamm.',
      'Уроков за месяц: 3.',
      '',
      'Что мы прошли:',
      '• Pere ja kodu',
      '• Poes',
      '• Kellaajad',
      '• Minu päev',
      '',
      'Как продвигаемся:',
      '• Фраз с ошибками стало меньше: 40 % → 20 % (по записям уроков).',
      '• Самая длинная фраза на уроке — 9 слов (в прошлом месяце — 5).',
      '• Меньше ошибок в теме: порядок слов в предложении.',
      '• В личном словаре 3 слова, за месяц добавлено 2.',
      '• Домашние задания сданы вовремя: 1 из 3.',
      '',
      'Над чем работаем дальше:',
      '• падежи после глаголов и мест (куда? где? откуда?)',
      '• формы глагола',
      '',
      'Если есть вопросы — пишите, с удовольствием ответим.',
      'С уважением, KeeleSepp',
    ].join('\n'));
    expect(text).not.toMatch(/(подтянулся|подтянулась|старался|старалась|он |она )/);
  });

  it('Estonian, English and Ukrainian from the same facts', () => {
    const et = parentMessage({ facts, student: { name: 'Mia', parentName: 'Olga' }, language: 'et' });
    expect(et).toMatch(/^Tere, Olga!/);
    expect(et).toMatch(/Tunde sel kuul: 3\./);
    expect(et).toMatch(/Vigadega lauseid on vähem: 40 % → 20 %/);
    expect(et).toMatch(/Millega edasi tegeleme:\n• käänded/);
    const en = parentMessage({ facts, student: { name: 'Mia' }, language: 'en' });
    expect(en).toMatch(/^Hello!/);
    expect(en).toMatch(/Lessons this month: 3\./);
    expect(en).toMatch(/Homework done on time: 1 of 3\./);
    const uk = parentMessage({ facts, student: { name: 'Mia', parentName: 'Olga' }, language: 'uk' });
    expect(uk).toMatch(/^Добрий день, Olga!/);
    expect(uk).toMatch(/Найдовше речення на уроці — 9 слів \(минулого місяця — 5\)\./);
  });

  it('a month without data says so and invents nothing', () => {
    const empty = monthFacts({ month: '2026-08', now });
    const text = parentMessage({ facts: empty, student: { name: 'Mia' }, language: 'ru' });
    expect(text).toBe(['Здравствуйте!', '', 'Коротко об учёбе за месяц: август 2026 — Mia.', 'В этом месяце уроков не было.', '', 'Над чем работаем дальше:', '• продолжаем по программе курса.', '', 'Если есть вопросы — пишите, с удовольствием ответим.', 'С уважением, KeeleSepp'].join('\n'));
  });

  it('never mentions the lesson balance or money', () => {
    const text = REPORT_ALL.map((language) => parentMessage({ facts, student: { name: 'Mia', lessonsLeft: 4, balance: 100 }, language })).join('\n');
    expect(text).not.toMatch(/€|EUR|остал|jäänud|left|залиш|баланс|saldo|balance/i);
  });

  it('without error topics the lesson steps still to practise are the next steps', () => {
    const sheets = [{ lessonTitle: 'Pere', status: 'done', completedAt: '2026-10-06T10:00:00Z', worksheetDoc: { meta: { goals: { g1: 'Ma räägin oma perest', g2: 'Ma loen lühikest teksti' } } }, score: { perGoal: { g1: { ok: 9, total: 10 }, g2: { ok: 2, total: 5 } } } }];
    const f = monthFacts({ month: '2026-10', now, assignments: sheets });
    expect(f.steps).toEqual(['Ma loen lühikest teksti']);
    expect(parentMessage({ facts: f, student: { name: 'Mia' }, language: 'ru' })).toMatch(/Над чем работаем дальше:\n• «Ma loen lühikest teksti»/);
  });
});

const REPORT_ALL = ['ru', 'et', 'en', 'uk'];
