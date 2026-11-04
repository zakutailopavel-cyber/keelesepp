import { band, coursePosition, estimateLevels, goalResult, skillEstimate } from './skillEstimate.js';

const now = Date.parse('2026-11-04T12:00:00Z');
const sheet = (id, completedAt, perGoal, extra = {}) => ({ id, status: 'done', completedAt, worksheetDoc: { blocks: [{ id: 'b' }] }, answers: { 'b:0': 'x' }, score: { correct: 1, total: 1, perGoal }, ...extra });
const errors = (n, source = 'gec') => Array.from({ length: n }, (_, i) => ({ said: `s${i}`, corrected: `c${i}`, source }));
const lesson = (startedAt, checked, errorCount, extra = []) => ({ status: 'done', startedAt, analysis: { checked, errors: [...errors(errorCount), ...extra] } });

// shaped like a real B1 learner (owner 2026-11-04): reading 85–100 %, ~40 % of checked sentences with an error,
// Estonian share 29–76 % per lesson
const fixture = {
  level: 'A2',
  target: 'B1',
  assignments: [
    sheet('r1', '2026-10-30T10:00:00Z', { g_read: { ok: 17, total: 20 } }),
    sheet('r2', '2026-10-20T10:00:00Z', { g_read: { ok: 10, total: 10 } }),
    sheet('r3', '2026-10-05T10:00:00Z', { g_read: { ok: 9, total: 10 } }),
    sheet('open', '', { g_read: { ok: 0, total: 10 } }, { status: 'new' }),
  ],
  lessons: [
    lesson('2026-11-02T15:00:00Z', 20, 8, errors(3, 'teacher')), // the teacher's own corrections are not the check
    lesson('2026-10-28T15:00:00Z', 15, 6),
    lesson('2026-10-20T15:00:00Z', 15, 6),
    lesson('2026-09-30T15:00:00Z', 20, 10),
    lesson('2026-09-25T15:00:00Z', 20, 10),
  ],
  stats: [
    { date: '2026-11-02T15:00:00Z', studentWords: 120, share: 29, longest: 6 },
    { date: '2026-10-28T15:00:00Z', studentWords: 200, share: 50, longest: 8 },
    { date: '2026-10-20T15:00:00Z', studentWords: 160, share: 76, longest: 10 },
    { date: '2026-10-21T15:00:00Z', studentWords: 5, share: 0, longest: 1 }, // hardly spoke: no evidence
  ],
  words: [
    ...Array.from({ length: 21 }, (_, i) => ({ word: `w${i}`, box: 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ word: `l${i}`, box: 3 })),
    { word: 'x', translation: 'Sinu lause: …', box: 5 }, // a mistake card, not a word
  ],
  now,
};
const byKey = (result) => Object.fromEntries(result.skills.map((s) => [s.key, s]));

describe('skillEstimate', () => {
  it('band: 0 below low, 100 at high, linear between', () => {
    expect(band(30, 40, 85)).toBe(0);
    expect(band(85, 40, 85)).toBe(100);
    expect(band(62.5, 40, 85)).toBe(50);
    expect(band(120, 40, 85)).toBe(100);
  });

  it('the fixture learner: reading near the top, grammar and speaking in the middle, listening „vähe andmeid”', () => {
    const result = skillEstimate(fixture);
    const s = byKey(result);
    expect(result).toMatchObject({ from: 'A2', to: 'B1', step: 'B1', steps: 1, reached: false });
    // reading: 36 / 40 = 90 % right → above 85 → 100 %
    expect(s.reading).toMatchObject({ pct: 100, enough: true, points: 3 });
    expect(s.reading.basis).toBe('3 töölehte · 40 vastust · õigeid 90%');
    // grammar: last 5 lessons, 90 checked, 40 with an error (44 %) → 56 % without → (56 − 30) / 50 = 52 %
    expect(s.grammar).toMatchObject({ pct: 52, points: 5 });
    expect(s.grammar.basis).toBe('5 tundi · 90 kontrollitud lauset · veaga 44%');
    // speaking: share 29–76 (avg 52) → 37 % of its band; longest ~8 of 12 words (B1) → 50 %; 0.7 · 37 + 0.3 · 50 = 41
    expect(s.speaking).toMatchObject({ pct: 41, points: 3 });
    expect(s.speaking.basis).toBe('3 tundi · eesti keeles 29–76% (keskm. 52%) · keskm. 160 sõna tunnis · pikim lause ~8 sõna');
    // vocabulary: no sheet part; 9 of 30 word cards learned (30 %) → (30 − 10) / 50 = 40 %
    expect(s.vocabulary).toMatchObject({ pct: 40, enough: true });
    expect(s.vocabulary.basis).toBe('30 kaarti · selgeks õpitud 9');
    expect(s.listening).toMatchObject({ pct: null, enough: false, points: 0 });
    // average of the four skills with data
    expect(result.average).toBe(Math.round((100 + 52 + 41 + 40) / 4));
    expect(result.enoughSkills).toBe(4);
  });

  it('trend: the same estimate with the data of 4 weeks ago', () => {
    const s = byKey(skillEstimate(fixture));
    // 4 weeks ago: two lessons, 40 checked, 20 with an error → 50 % → 40 %; now 52 %
    expect(s.grammar.trend).toBe(12);
    // 4 weeks ago only one reading sheet: too little then, so no trend
    expect(s.reading.trend).toBeNull();
    expect(s.speaking.trend).toBeNull();
  });

  it('too few data points: „vähe andmeid” instead of a number', () => {
    const result = skillEstimate({ ...fixture, assignments: fixture.assignments.slice(0, 1), lessons: fixture.lessons.slice(0, 1), stats: fixture.stats.slice(0, 1), words: fixture.words.slice(0, 10) });
    expect(result.skills.every((s) => s.pct === null)).toBe(true);
    expect(result.average).toBeNull();
  });

  it('two level steps halve each skill; a reached target is 100 %', () => {
    const two = byKey(skillEstimate({ ...fixture, target: 'B2' }));
    expect(two.reading.pct).toBe(50);
    expect(two.grammar.pct).toBe(26);
    const reached = skillEstimate({ ...fixture, level: 'B1', target: 'B1' });
    expect(reached.reached).toBe(true);
    expect(byKey(reached).reading.pct).toBe(100);
  });

  it('a stored score that still looks broken is left out', () => {
    expect(goalResult(sheet('a', '2026-10-01', { g_read: { ok: 12, total: 10 } }), 'g_read')).toBeNull();
    expect(goalResult({ status: 'done', answers: { a: 1 }, score: { correct: 0, total: 28, perGoal: { g_read: { ok: 0, total: 8 } } } }, 'g_read')).toBeNull();
    expect(goalResult(sheet('b', '2026-10-01', { g_read: { ok: 4, total: 8 } }), 'g_read')).toEqual({ ok: 4, total: 8, at: Date.parse('2026-10-01') });
  });

  it('only the newest sheets count (window of 8)', () => {
    const old = Array.from({ length: 8 }, (_, i) => sheet(`o${i}`, `2026-08-0${i + 1}T10:00:00Z`, { g_read: { ok: 0, total: 5 } }));
    const fresh = Array.from({ length: 8 }, (_, i) => sheet(`f${i}`, `2026-10-1${i}T10:00:00Z`, { g_read: { ok: 5, total: 5 } }));
    expect(byKey(skillEstimate({ ...fixture, assignments: [...old, ...fresh] })).reading.pct).toBe(100);
  });

  it('speaking falls back to the analysis of a lesson without stats', () => {
    const lessons = [0, 1].map((i) => ({ status: 'done', startedAt: `2026-10-2${i}T15:00:00Z`, analysis: { checked: 0, errors: [], speech: { words: 100, langWords: 90 } } }));
    const s = byKey(skillEstimate({ ...fixture, stats: [], lessons }));
    // share 90 → top of the band, no sentence length known
    expect(s.speaking.pct).toBe(100);
  });
});

describe('estimateLevels', () => {
  it('takes the Estonian track, else the card', () => {
    expect(estimateLevels({ level: 'A1', targetLevel: 'A2' })).toMatchObject({ level: 'A1', target: 'A2' });
    expect(estimateLevels({ level: 'A1', enrollments: [{ subject: 'Inglise keel', level: 'B2', targetLevel: 'C1' }, { subject: 'Eesti keel', level: 'A2', targetLevel: 'B1' }] })).toMatchObject({ level: 'A2', target: 'B1' });
  });
});

describe('coursePosition', () => {
  it('lessons done (three sheets or held with the teacher) of the course he works on', () => {
    const curriculum = [1, 2, 3, 4].map((n) => ({ id: `b1-${n}`, title: `Tund ${n}`, level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: n }));
    const done = ['discover', 'practice', 'transfer'].map((phase) => ({ lessonId: 'b1-2', phase, status: 'done' }));
    const pos = coursePosition({ curriculum, assignments: done, lessons: [{ topicLessonId: 'b1-1', status: 'Toimunud' }], step: 'B1' });
    expect(pos).toMatchObject({ key: 'B1', done: 2, total: 4, pct: 50 });
    expect(coursePosition({ curriculum, step: 'B2' })).toBeNull();
    expect(coursePosition({ curriculum: [], step: 'B1' })).toBeNull();
  });
});
