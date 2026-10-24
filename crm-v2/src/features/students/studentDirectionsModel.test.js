import { directionRows, priceLabel, statusOf, statusPatch, subjectPrice } from './studentDirectionsModel.js';

const today = '2026-10-24';
const student = {
  id: 's1', name: 'Milan', subject: 'Eesti keel', teacher: 'Pavel',
  enrollments: [
    { id: 'et', subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', level: 'A2', targetLevel: 'B1', active: true },
    { id: 'ma', subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1', level: '7. klass', active: true },
    { id: 'en', subject: 'Inglise keel', teacher: 'Anna', teacherUid: 'a1', active: true, status: 'paused' },
    { id: 'ru', subject: 'Vene keel', teacher: 'Olga', teacherUid: 'o1', active: false },
  ],
};

describe('student card directions', () => {
  it('derives „Käib” from lessons ahead, „Tunde pole plaanis” without them, and keeps paused / ended', () => {
    const schedule = [
      { id: 'w1', studentId: 's1', subject: 'Eesti keel', teacherUid: 'p1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '15:00' },
      { id: 'old', studentId: 's1', subject: 'Matemaatika', teacherUid: 'y1', date: '2026-10-01', time: '16:00' },
    ];
    const lessons = [{ id: 'l1', subject: 'Matemaatika', date: '2026-10-01', status: 'Toimunud' }];
    const rows = directionRows({ student, schedule, lessons, plan: { lessonPriceCents: 2000, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 45 } } }, today });
    expect(rows.map((r) => [r.subject, r.state])).toEqual([['Eesti keel', 'attending'], ['Matemaatika', 'unplanned'], ['Inglise keel', 'paused'], ['Vene keel', 'ended']]);
    expect(rows[0].stateLabel).toBe('Käib');
    expect(rows[0].next).toEqual({ date: '2026-10-26', time: '15:00', weekly: false });
    expect(rows[0].upcomingCount).toBe(8);
    expect(rows[1].lastLesson).toBe('2026-10-01');
    expect(rows[0].price).toEqual({ kind: 'card', cents: 2000, minutes: 60 });
    expect(rows[1].price).toEqual({ kind: 'own', cents: 2500, minutes: 45 });
    expect(rows[2].price.kind).toBe('same');
    expect(rows[0].shortLabel).toBe('ET');
  });

  it('labels prices and statuses', () => {
    expect(priceLabel({ kind: 'own', cents: 2550, minutes: 45 })).toBe('25,50 € / 45 min');
    expect(priceLabel({ kind: 'same', cents: 2000, minutes: 60 })).toBe('20,00 € / 60 min (kaardi hind)');
    expect(priceLabel({ kind: 'none' })).toBe('hind määramata');
    expect(subjectPrice(null, 'Eesti keel', student)).toEqual({ kind: 'none' });
    expect(statusOf({ active: false })).toBe('ended');
    expect(statusOf({ status: 'paused' })).toBe('paused');
    expect(statusPatch('ended')).toEqual({ status: 'ended', active: false });
    expect(statusPatch('active')).toEqual({ status: '', active: true });
  });

  it('a weekly series without dates counts as attending', () => {
    const rows = directionRows({ student: { id: 's2', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel' }] }, schedule: [{ id: 'w', day: 'Tue', time: '17:00' }], today });
    expect(rows[0].state).toBe('attending');
    expect(rows[0].next).toEqual({ date: '', time: '17:00', weekly: true });
  });
});
