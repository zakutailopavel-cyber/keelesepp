import { dayPart, lifeLines, nextLesson, season, seasonalWear } from './petLife.js';
import { roomContents, roomSvg } from './petRoom.js';

const at = (y, mo, d, h = 12, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime();

describe('pet life', () => {
  it('knows the time of day and the season', () => {
    expect(dayPart(at(2026, 10, 10, 7))).toBe('morning');
    expect(dayPart(at(2026, 10, 10, 13))).toBe('day');
    expect(dayPart(at(2026, 10, 10, 20))).toBe('evening');
    expect(dayPart(at(2026, 10, 10, 23))).toBe('night');
    expect(dayPart(at(2026, 10, 10, 3))).toBe('night');
    expect(season(at(2026, 12, 4))).toBe('christmas');
    expect(season(at(2027, 1, 6))).toBe('christmas');
    expect(season(at(2027, 1, 7))).toBe('winter');
    expect(season(at(2026, 4, 1))).toBe('spring');
    expect(season(at(2026, 7, 1))).toBe('summer');
    expect(season(at(2026, 10, 10))).toBe('autumn');
  });

  it('puts on a seasonal hat only when the pet wears none', () => {
    expect(seasonalWear({}, { now: at(2026, 12, 20) }).hat).toBe('santa');
    expect(seasonalWear({ hat: 'crown' }, { now: at(2026, 12, 20) }).hat).toBe('crown');
    expect(seasonalWear({}, { now: at(2026, 10, 10, 23), asleep: true }).hat).toBe('nightcap');
    expect(seasonalWear({}, { now: at(2026, 10, 10, 13) }).hat).toBeUndefined();
  });

  it('finds the next lesson that has not started', () => {
    const now = at(2026, 10, 10, 15);
    const list = [
      { occurrenceDate: '2026-10-10', time: '14:00', teacher: 'Kati' },
      { occurrenceDate: '2026-10-12', time: '17:00', teacher: 'Mari Maasikas', status: 'Tühistatud' },
      { occurrenceDate: '2026-10-11', time: '10:00', teacher: 'Mari Maasikas' },
    ];
    expect(nextLesson(list, now)).toMatchObject({ occurrenceDate: '2026-10-11', time: '10:00' });
  });

  it('remembers the learner: away days, the next lesson, his own sentence, his words', () => {
    const now = at(2026, 10, 10, 8);
    const lines = lifeLines({
      now, lastSeenAt: now - 4 * 864e5,
      lesson: { occurrenceDate: '2026-10-11', time: '10:00', teacher: 'Mari Maasikas' },
      speech: [{ date: '2026-10-08T10:00:00Z', practice: [{ said: 'ma läks poodi', corrected: 'ma läksin poodi' }] }],
      words: [{ word: 'koer', translation: 'собака', box: 1 }],
    });
    expect(lines.map((l) => l.key)).toEqual(['missed', 'morning', 'lesson', 'said', 'word', 'season']);
    expect(lines[0].text).toBe('Ma igatsesin sind! Sind polnud 4 päeva.');
    expect(lines[2].text).toBe('Järgmine tund on homme kell 10:00. Mari ootab sind!');
    expect(lines[3].text).toContain('„ma läksin poodi”');
    expect(lines[4].hint).toBe('Помнишь слово «koer»? Это «собака».');
    expect(lifeLines({ now: at(2026, 10, 10, 13) }).map((l) => l.key)).toEqual(['season']);
  });
});

describe('pet room', () => {
  it('grows with learning and keeps within its limits', () => {
    expect(roomContents({})).toEqual({ books: 0, diplomas: 0, cups: 0, plant: 0 });
    expect(roomContents({ learnedWords: 40, homework: 5, submissions: 4, goals: 2, streak: 8 })).toEqual({ books: 24, diplomas: 3, cups: 2, plant: 3 });
    const svg = roomSvg({ progress: { learnedWords: 3, goals: 1 }, now: at(2026, 12, 20, 23) });
    expect(svg).toContain('Toas: 3 raamatut, 0 diplomit, 1 karikat');
    expect(svg).toContain('room-snow');
  });
});
