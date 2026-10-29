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
