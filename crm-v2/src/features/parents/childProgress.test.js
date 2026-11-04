import { describe, expect, it } from 'vitest';
import { TASK_STATE } from '../homework/taskList.js';
import { childProgress, lastMonths, nowLearning, stepLight, tallinnDay, tallinnMonth } from './childProgress.js';

describe('Tallinn months', () => {
  it('puts a moment in its Tallinn day and month, whatever the browser zone', () => {
    // 31 Oct 22:30 UTC = 1 Nov 00:30 in Tallinn (winter, UTC+2)
    expect(tallinnDay('2026-10-31T22:30:00.000Z')).toBe('2026-11-01');
    expect(tallinnMonth('2026-10-31T22:30:00.000Z')).toBe('2026-11');
    // summer time (UTC+3): 30 Jun 21:30 UTC = 1 Jul 00:30
    expect(tallinnMonth('2026-06-30T21:30:00.000Z')).toBe('2026-07');
    expect(tallinnDay('2026-10-31')).toBe('2026-10-31');
    expect(tallinnDay({ toMillis: () => Date.parse('2026-10-31T22:30:00.000Z') })).toBe('2026-11-01');
    expect(tallinnDay({ seconds: Date.parse('2026-03-01T10:00:00Z') / 1000 })).toBe('2026-03-01');
    expect(tallinnDay('')).toBe('');
    expect(tallinnDay('not a date')).toBe('');
  });

  it('lists the last months across a year end', () => {
    expect(lastMonths('2026-02-10', 4)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });
});

describe('childProgress', () => {
  const today = '2026-11-04';

  it('no data: no points, every series left out (never drawn as zeros)', () => {
    const result = childProgress({ today });
    expect(result.points).toEqual([]);
    expect(result.series).toEqual({ lessons: false, homework: false, words: false, oskan: false });
  });

  it('counts held and missed lessons per month; future rows and other marks are not counted', () => {
    const result = childProgress({ today, lessons: [
      { date: '2026-09-02', status: 'Toimunud' }, { date: '2026-09-09' }, { date: '2026-09-16', status: 'Puudus_eta' },
      { date: '2026-10-07', status: 'Toimunud' }, { date: '2026-10-14', status: 'Puudus_p' }, { date: '2026-10-21', status: 'Tühistatud' },
      { date: '2026-11-20', status: 'Toimunud' },
    ] });
    expect(result.points.map((point) => [point.month, point.lessons, point.missed])).toEqual([['2026-09', 2, 1], ['2026-10', 1, 1], ['2026-11', 0, 0]]);
    expect(result.from).toBe('2026-09');
    expect(result.series.lessons).toBe(true);
    expect(result.series.words).toBe(false);
  });

  it('homework on time: by deadline month, done by the end of the deadline day (Tallinn), open deadlines not yet counted', () => {
    const tasks = [
      { due: '2026-10-05', state: TASK_STATE.WAITING, doneAt: '2026-10-05T20:59:00.000Z' }, // 22:59 Tallinn: on time
      { due: '2026-10-06', state: TASK_STATE.REVIEWED, doneAt: '2026-10-06T22:30:00.000Z' }, // 00:30 next day: late
      { due: '2026-10-07', state: TASK_STATE.TODO, doneAt: '' }, // never done
      { due: '2026-11-10', state: TASK_STATE.TODO }, // deadline still ahead
      { due: '', state: TASK_STATE.WAITING, doneAt: '2026-10-01' }, // no deadline
    ];
    const result = childProgress({ today, tasks });
    const october = result.points.find((point) => point.month === '2026-10');
    expect(october).toMatchObject({ homeworkDue: 3, homeworkOnTime: 1, homeworkPct: 33 });
    expect(result.points.find((point) => point.month === '2026-11').homeworkPct).toBeNull();
  });

  it('words: the dictionary total at each month end, „Sinu lause” cards left out', () => {
    const words = [
      { createdAt: '2026-08-10T10:00:00Z' }, { createdAt: '2026-09-30T21:30:00Z' }, // 1 Oct in Tallinn
      { createdAt: '2026-10-02T10:00:00Z' }, { createdAt: '2026-10-03T10:00:00Z', translation: 'Sinu lause: Ma lähen tööl.' },
    ];
    const result = childProgress({ today, words });
    expect(result.points.map((point) => [point.month, point.words])).toEqual([['2026-08', 1], ['2026-09', 1], ['2026-10', 3], ['2026-11', 3]]);
  });

  it('„Oskan”: a lesson step counts from the month its pooled result reaches 80 %', () => {
    const sheet = (completedAt, ok, total, extra = {}) => ({ status: 'done', completedAt, lessonTitle: 'Töö', worksheetDoc: { meta: { goals: { g_1: 'Ma oskan lugeda töökuulutust' } } }, score: { perGoal: { g_1: { ok, total } } }, ...extra });
    const assignments = [
      sheet('2026-09-10T10:00:00Z', 6, 10), sheet('2026-10-10T10:00:00Z', 10, 10),
      sheet('2026-10-12T10:00:00Z', 2, 10, { status: 'new' }), // not handed in: not counted
      { status: 'done', completedAt: '2026-10-12T10:00:00Z', worksheetDoc: { meta: { goals: { g_1: 'Õpilane mõistab teksti' } } }, score: { perGoal: { g_1: { ok: 10, total: 10 } } } }, // teacher goal, no canDo: left out
    ];
    const result = childProgress({ today, assignments });
    expect(result.points.map((point) => [point.month, point.oskan])).toEqual([['2026-09', 0], ['2026-10', 1], ['2026-11', 1]]);
  });

  it('trims empty months before the first data, keeps at most 6 months', () => {
    const lessons = ['2026-01-05', '2026-03-05', '2026-10-05'].map((date) => ({ date, status: 'Toimunud' }));
    const result = childProgress({ today, lessons });
    expect(result.points.map((point) => point.month)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'].slice(4));
  });

  it('one month of data gives one point (the card asks for 2)', () => {
    const result = childProgress({ today, lessons: [{ date: '2026-11-02', status: 'Toimunud' }] });
    expect(result.points).toHaveLength(1);
  });
});

describe('nowLearning and the traffic lights', () => {
  it('module of the latest held lesson with one, topics of the last 30 days without the generic one', () => {
    const result = nowLearning({ today: '2026-11-04', lessons: [
      { date: '2026-11-02', status: 'Toimunud', topic: 'Individuaalne tund' },
      { date: '2026-10-28', status: 'Toimunud', topic: 'Tööintervjuu', topicModule: 'Töö ja amet', topicLevel: 'B1' },
      { date: '2026-10-21', status: 'Puudus_p', topic: 'Vahele jäänud', topicModule: 'Muu' },
      { date: '2026-09-01', status: 'Toimunud', topic: 'Vana teema', topicModule: 'Tervis' },
    ] });
    expect(result).toMatchObject({ module: 'Töö ja amet', level: 'B1', topics: ['Tööintervjuu'], lessonsInMonth: 2 });
  });

  it('maps a result to Oskan / Harjutan / Kordame / not done', () => {
    expect([stepLight(85), stepLight(60), stepLight(20), stepLight(null)]).toEqual(['mastered', 'practise', 'review', 'todo']);
  });
});
