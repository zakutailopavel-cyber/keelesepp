// The daily reminder for „Päeva 5 minutit” (owner 2026-10-23): the student adds a repeating event to the calendar of
// his own phone — the phone reminds him every day at the time he chose and the event opens today's cards. Nothing is
// sent from the CRM and nothing about the student is in the file (only the page address).
import { localDate } from '../../utils/localDate.js';

export const REMINDER_TIMES = ['07:30', '12:00', '16:00', '18:00', '19:00', '20:00', '21:00'];
const pad = (value) => String(value).padStart(2, '0');
const stamp = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

export function dailyReminderIcs({ time = '19:00', url = '', today = localDate(), now = new Date() } = {}) {
  const [hours, minutes] = /^\d{2}:\d{2}$/.test(time) ? time.split(':') : ['19', '00'];
  const day = today.replaceAll('-', '');
  // a floating local time: the reminder stays at 19:00 wherever the phone is
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KeeleSepp//Paeva 5 minutit//ET', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:keelesepp-paeva-5-minutit-${hours}${minutes}@keelesepp`, `DTSTAMP:${stamp(now)}`,
    `DTSTART:${day}T${hours}${minutes}00`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
    'SUMMARY:KeeleSepp: päeva 5 minutit', `DESCRIPTION:Korda tänased kaardid: ${url}`, ...(url ? [`URL:${url}`] : []),
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:KeeleSepp: päeva 5 minutit', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
