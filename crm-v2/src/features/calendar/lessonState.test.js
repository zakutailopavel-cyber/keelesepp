import { lessonState } from './calendarView.js';

// the traffic light of a calendar lesson (team 2026-10-29): a cancelled record is red, not „held”
describe('lessonState', () => {
  it('held green, absent yellow, cancelled red, otherwise no ribbon', () => {
    expect(lessonState({ status: 'Planeeritud' })).toBe('planned');
    expect(lessonState({ status: 'Toimunud', lessonRecordId: 'r1' })).toBe('done');
    expect(lessonState({ lessonRecordId: 'r1' })).toBe('done');
    expect(lessonState({ status: 'Puudus_p', lessonRecordId: 'r1' })).toBe('absent');
    expect(lessonState({ status: 'Puudus_eta' })).toBe('absent');
    expect(lessonState({ status: 'Tühistatud', lessonRecordId: 'r1' })).toBe('cancelled');
    expect(lessonState({ lessonRecordId: 'r1', record: { status: 'Tühistatud' } })).toBe('cancelled');
  });
});

import { lessonMark } from './calendarView.js';
describe('lessonMark (owner 2026-10-29: a symbol per state in the corner)', () => {
  it('tells held, verified, school-covered, both absences, cancelled and unmarked apart', () => {
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Toimunud' } })).toBe('done');
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Toimunud', verified: true } })).toBe('verified');
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Toimunud', billingStatus: 'school_covered' } })).toBe('covered');
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Puudus_p' } })).toBe('absentNotified');
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Puudus_eta' } })).toBe('absentLate');
    expect(lessonMark({ lessonRecordId: 'r', record: { status: 'Tühistatud' } })).toBe('cancelled');
    expect(lessonMark({ status: 'Planeeritud', occurrenceDate: '2026-10-20' }, '2026-10-29')).toBe('unmarked');
    expect(lessonMark({ status: 'Planeeritud', occurrenceDate: '2026-10-30' }, '2026-10-29')).toBe('');
    expect(lessonMark({ status: 'Planeeritud', occurrenceDate: '2026-10-20', isGroup: true }, '2026-10-29')).toBe('');
  });
});
