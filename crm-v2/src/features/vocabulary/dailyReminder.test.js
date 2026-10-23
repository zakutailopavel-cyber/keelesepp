import { describe, expect, it } from 'vitest';
import { dailyReminderIcs } from './dailyReminder.js';

describe('dailyReminderIcs', () => {
  it('is a daily repeating event at the chosen local time that opens today’s cards', () => {
    const ics = dailyReminderIcs({ time: '07:30', url: 'https://crm.example/student/sonavara?paev=1', today: '2026-10-23', now: new Date('2026-10-23T08:00:00Z') });
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain('DTSTART:20261023T073000\r\n');
    expect(ics).toContain('RRULE:FREQ=DAILY\r\n');
    expect(ics).toContain('URL:https://crm.example/student/sonavara?paev=1\r\n');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('DTSTAMP:20261023T080000Z');
  });
  it('falls back to 19:00 on a broken time', () => {
    expect(dailyReminderIcs({ time: 'x', today: '2026-10-23' })).toContain('DTSTART:20261023T190000');
  });
});
