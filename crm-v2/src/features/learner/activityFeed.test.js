import { describe, expect, it } from 'vitest';
import { activityFeed, feedByDay } from './activityFeed.js';

const now = Date.parse('2026-10-27T15:00:00Z');

describe('Õpilase tegevused', () => {
  it('lists everything the student did, newest first, by day', () => {
    const feed = activityFeed({
      now,
      presence: { lastSeenAt: Date.parse('2026-10-27T14:00:00Z'), practice: { days: ['2026-10-26'], errorsDate: '2026-10-26', errorsPct: 80 } },
      words: [{ createdAt: '2026-10-25T10:00:00Z' }, { createdAt: '2026-10-25T10:05:00Z', reviewedAt: '2026-10-26T18:00:00Z' }],
      assignments: [
        { id: 'a1', source: 'self_study', title: 'Tund 1 · Avasta', assignedAt: '2026-10-24T09:00:00Z', status: 'in_progress', updatedAt: '2026-10-24T09:20:00Z', answers: { 'x:0': 'a', 'x:1': '' } },
        { id: 'a2', title: 'Kontroll', assignedAt: '2026-10-20T09:00:00Z', assignedByName: 'Pavel', status: 'done', completedAt: '2026-10-21T17:00:00Z', score: { correct: 8, total: 10 } },
      ],
      homework: [{ status: 'Tehtud', task: 'Õpik lk 5', submittedAt: '2026-10-22T16:00:00Z' }],
      lessons: [{ date: '2026-10-23', time: '12:00', status: 'Puudus_p' }, { date: '2026-06-01', status: 'Toimunud' }],
    });
    expect(feed.map((item) => item.text)).toEqual([
      'Oli KeeleSepas sees',
      'Kordas 1 sõna',
      'Kordas „Minu vead” · 80%',
      'Lisas 2 sõna „Minu sõnad”',
      'Täitis töölehte: Tund 1 · Avasta · 1 vastust',
      'Avas ise kursusel: Tund 1 · Avasta',
      'Puudus tunnist (teatas ette)',
      'Märkis kodutöö tehtuks: Õpik lk 5',
      'Esitas: Kontroll · 80%',
      'Sai töölehe: Kontroll',
    ]);
    expect(feedByDay(feed).map((group) => group.date)).toEqual(['2026-10-27', '2026-10-26', '2026-10-25', '2026-10-24', '2026-10-23', '2026-10-22', '2026-10-21', '2026-10-20']);
  });
});
