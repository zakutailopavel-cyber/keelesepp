import { formatsFor, groupSubjects, legacyGroupCandidates, lessonFormat, planForFormat, subjectFormatLabel, trackFormat } from './directionFormat.js';
import { directionPrice, directionRows, priceLabel } from './studentDirectionsModel.js';

// „Õppesuunad: individuaalne / grupp” (team 2026-11-18)
const groups = [{ id: 'g1', name: 'Eesti A2 õhtu', subject: 'Eesti keel', students: ['s1', 's2'] }];

describe('direction format: legacy data reads as before', () => {
  it('a track without a format is individual, unless the card is in a calendar group of that subject', () => {
    expect(trackFormat({ subject: 'Eesti keel' }, { student: { id: 's9', subject: 'Eesti keel' }, groups })).toEqual({ format: 'individual', inferred: false, groupId: '' });
    expect(trackFormat({ subject: 'Eesti keel' }, { student: { id: 's1', subject: 'Eesti keel' }, groups })).toEqual({ format: 'group', inferred: true, groupId: 'g1' });
    // a stored choice wins over the calendar group
    expect(trackFormat({ subject: 'Eesti keel', format: 'individual' }, { student: { id: 's1' }, groups }).format).toBe('individual');
    // two tracks of the subject: not „clearly” a group — both stay individual
    const twins = { id: 's2', enrollments: [{ subject: 'Eesti keel', teacher: 'A' }, { subject: 'Eesti keel', teacher: 'B' }] };
    expect(trackFormat(twins.enrollments[0], { student: twins, groups }).format).toBe('individual');
  });

  it('inferred groups never split the billing: only a stored group track or a group price does', () => {
    expect(groupSubjects({ id: 's1', subject: 'Eesti keel' }, null)).toEqual([]);
    expect(groupSubjects({ id: 's1', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Eesti keel', format: 'group' }] }, null)).toEqual(['Eesti keel']);
    expect(groupSubjects({ id: 's1', subject: 'Eesti keel' }, { groupPrices: { Matemaatika: { lessonPriceCents: 900 } } })).toEqual(['Matemaatika']);
    // an ended group track does not split
    expect(groupSubjects({ enrollments: [{ subject: 'Eesti keel', format: 'group', status: 'ended' }] }, null)).toEqual([]);
    expect(formatsFor({ enrollments: [{ subject: 'Eesti keel', format: 'group' }] }, null, 'Eesti keel')).toEqual(['individual', 'group']);
    expect(formatsFor({ subject: 'Eesti keel' }, null, 'Eesti keel')).toEqual(['individual']);
  });

  it('counts the legacy cards that read as „Grupp” (no writes)', () => {
    const students = [{ id: 's1', name: 'Mari', subject: 'Eesti keel' }, { id: 's2', name: 'Jaan', enrollments: [{ subject: 'Eesti keel', format: 'individual' }] }, { id: 's3', name: 'Ott', subject: 'Eesti keel' }];
    expect(legacyGroupCandidates(students, groups)).toEqual([{ studentId: 's1', name: 'Mari', subject: 'Eesti keel', groupId: 'g1' }]);
  });
});

describe('direction format: matching and fallback', () => {
  it('a calendar group lesson is a group lesson', () => {
    expect(lessonFormat({ groupId: 'g1' })).toBe('group');
    expect(lessonFormat({ scheduleId: 'w1' })).toBe('individual');
    expect(subjectFormatLabel('Eesti keel', 'group')).toBe('Eesti keel · grupp');
    expect(subjectFormatLabel('Eesti keel', 'individual')).toBe('Eesti keel');
  });

  it('group price, else the individual price with a fallback flag', () => {
    const plan = { lessonPriceCents: 2500, lessonMinutes: 60, groupPrices: { 'Eesti keel': { lessonPriceCents: 1200, lessonMinutes: 90 } } };
    expect(planForFormat(plan, plan, 'Eesti keel', 'group')).toEqual({ plan: { ...plan, lessonPriceCents: 1200, lessonMinutes: 90 }, fallback: false });
    expect(planForFormat(plan, plan, 'Matemaatika', 'group')).toEqual({ plan, fallback: true });
    expect(planForFormat(plan, plan, 'Eesti keel', 'individual')).toEqual({ plan, fallback: false });
    const student = { id: 's1', subject: 'Eesti keel' };
    expect(directionPrice(plan, 'Eesti keel', student, 'group')).toEqual({ kind: 'group', cents: 1200, minutes: 90 });
    expect(priceLabel(directionPrice({ lessonPriceCents: 2500 }, 'Eesti keel', student, 'group'))).toBe('25,00 € / 60 min (grupi hind puudub — arvel individuaalne hind)');
  });

  it('one subject in both formats: two rows, each with its own lessons and price', () => {
    const student = { id: 's5', name: 'Mari', subject: 'Eesti keel', enrollments: [{ id: 'i', subject: 'Eesti keel', teacher: 'Pavel' }, { id: 'g', subject: 'Eesti keel', teacher: 'Pavel', format: 'group', groupId: 'g1' }] };
    const plan = { lessonPriceCents: 2500, lessonMinutes: 60, groupPrices: { 'Eesti keel': { lessonPriceCents: 1500, lessonMinutes: 60 } } };
    const lessons = [{ id: 'l1', date: '2026-11-10', subject: 'Eesti keel', status: 'Toimunud' }, { id: 'l2', date: '2026-11-12', subject: 'Eesti keel', groupId: 'g1', status: 'Toimunud' }];
    const rows = directionRows({ student, lessons, plan, today: '2026-11-18' });
    expect(rows.map((row) => [row.format, row.lastLesson, row.price.cents])).toEqual([['individual', '2026-11-10', 2500], ['group', '2026-11-12', 1500]]);
  });
});
