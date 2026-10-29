import { cleanPerWeek, perWeekDraft, perWeekFields, perWeekKey, perWeekRows, perWeekText, perWeekValue } from './pollModel.js';
import { normalizeAvailability } from '../../services/firebase/studentAvailability.js';

// lessons a week per course (team 2026-10-29)
describe('lessons a week the learner wants', () => {
  it('keys a course by its slug, one field per course, one unnamed field without a subject', () => {
    expect(perWeekKey('Eesti keel')).toBe('eesti-keel');
    expect(perWeekKey('eesti  KEEL')).toBe('eesti-keel');
    expect(perWeekKey('Õigekiri')).toBe('oigekiri');
    expect(perWeekKey('')).toBe('default');
    expect(perWeekFields(['Eesti keel', 'Matemaatika', 'eesti keel'])).toEqual([{ key: 'eesti-keel', subject: 'Eesti keel' }, { key: 'matemaatika', subject: 'Matemaatika' }]);
    expect(perWeekFields([])).toEqual([{ key: 'default', subject: '' }]);
  });

  it('accepts only whole numbers 1–7 and at most 10 courses', () => {
    expect([perWeekValue('2'), perWeekValue(7), perWeekValue(0), perWeekValue(8), perWeekValue(1.5), perWeekValue('')]).toEqual([2, 7, null, null, null, null]);
    expect(cleanPerWeek({ 'eesti-keel': '3', matemaatika: 9, 'Bad key': 2, x: '' })).toEqual({ 'eesti-keel': 3 });
    expect(Object.keys(cleanPerWeek(Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`s${i}`, 1]))))).toHaveLength(10);
    expect(cleanPerWeek('2')).toEqual({});
    expect(normalizeAvailability('s1', { perWeek: { 'eesti-keel': 2, x: 0 } }).perWeek).toEqual({ 'eesti-keel': 2 });
  });

  it('reads the numbers with the card’s courses', () => {
    const subjects = ['Eesti keel', 'Matemaatika'];
    expect(perWeekText({ matemaatika: 1, 'eesti-keel': 2 }, subjects)).toBe('Eesti keel 2× · Matemaatika 1× nädalas');
    expect(perWeekText({ 'eesti-keel': 2 }, ['Eesti keel'])).toBe('Eesti keel 2× nädalas');
    expect(perWeekText({ default: 3 }, [])).toBe('3× nädalas');
    expect(perWeekText({}, subjects)).toBe('');
    // a teacher of maths sees only maths
    expect(perWeekText({ matemaatika: 1, 'eesti-keel': 2 }, ['Matemaatika'], { only: true })).toBe('Matemaatika 1× nädalas');
    // a number saved before the card got its subject belongs to its only course
    expect(perWeekRows({ default: 2 }, ['Eesti keel'])).toEqual([{ key: 'default', subject: 'Eesti keel', count: 2 }]);
    expect(perWeekDraft({ default: 2 }, ['Eesti keel'])).toEqual({ 'eesti-keel': '2' });
    expect(perWeekDraft({ matemaatika: 1 }, subjects)).toEqual({ 'eesti-keel': '', matemaatika: '1' });
  });
});
