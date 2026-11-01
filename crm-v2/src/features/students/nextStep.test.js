import { describe, expect, it } from 'vitest';
import { homeNotes, lessonNow, newFeedback, nextStep, openWork } from './nextStep.js';

const NOW = new Date('2026-11-02T15:00:00').getTime();
const today = '2026-11-02';
const lesson = (time, extra = {}) => ({ occurrenceDate: today, time, duration: 60, status: 'Planeeritud', teacher: 'Tiina', ...extra });
const dueWord = { id: 'w', word: 'koer', translation: 'собака', box: 1, reviews: 2, dueAt: '2026-11-01T10:00:00.000Z', reviewedAt: '2026-10-30T10:00:00.000Z' };

describe('nextStep priority', () => {
  const all = { homework: [{ id: 'h', task: 'Kirjuta lauseid', due: '2026-10-30', status: 'Ootel' }], words: [dueWord], today, now: NOW };

  it('a lesson starting soon beats everything', () => {
    const step = nextStep({ ...all, occurrences: [lesson('15:20')] });
    expect(step).toMatchObject({ key: 'lesson', to: '/live-classroom', title: 'Tund algab kell 15:20' });
  });

  it('a lesson going on now is still the next step; a finished one, a far one or a cancelled one is not', () => {
    expect(nextStep({ ...all, occurrences: [lesson('14:30')] }).title).toBe('Tund käib praegu');
    expect(nextStep({ ...all, occurrences: [lesson('13:30')] }).key).toBe('overdue');
    expect(nextStep({ ...all, occurrences: [lesson('16:00')] }).key).toBe('overdue');
    expect(nextStep({ ...all, occurrences: [lesson('15:10', { status: 'Tühistatud' })] }).key).toBe('overdue');
  });

  it('overdue homework comes before open homework, the oldest first, in neutral words', () => {
    const step = nextStep({ today, now: NOW, homework: [
      { id: 'a', task: 'Uus töö', due: '2026-11-09', status: 'Ootel' },
      { id: 'b', task: 'Vana töö', due: '2026-10-20', status: 'Ootel' },
      { id: 'c', task: 'Vanem, aga tehtud', due: '2026-10-01', status: 'Tehtud' },
    ] });
    expect(step).toMatchObject({ key: 'overdue', title: 'Vana töö', to: '/homework' });
    expect(step.detail).toMatch(/^Tähtaeg oli .* kokku 2 ülesannet$/);
  });

  it('open homework comes before words; an assigned sheet counts, a sheet opened from the course does not', () => {
    expect(nextStep({ today, now: NOW, words: [dueWord], homework: [{ id: 'a', task: 'Tee töö', status: 'Ootel' }] })).toMatchObject({ key: 'homework', title: 'Tee töö' });
    expect(nextStep({ today, now: NOW, words: [dueWord], assignments: [{ id: 's', title: 'Tööleht', status: 'new', dueDate: '2026-11-05' }] }).key).toBe('homework');
    expect(nextStep({ today, now: NOW, words: [dueWord], assignments: [{ id: 's', title: 'Tööleht', status: 'new', source: 'self_study' }] }).key).toBe('review');
    expect(nextStep({ today, now: NOW, words: [dueWord], assignments: [{ id: 's', title: 'Tööleht', status: 'done' }] }).key).toBe('review');
  });

  it('due words, then done', () => {
    expect(nextStep({ today, now: NOW, words: [dueWord] })).toMatchObject({ key: 'review', button: 'Alusta' });
    expect(nextStep({ today, now: NOW })).toMatchObject({ key: 'done', to: '/student/kursus' });
    const reviewed = Array.from({ length: 5 }, (_, i) => ({ id: `w${i}`, word: `s${i}`, translation: 't', box: 2, reviews: 3, reviewedAt: `${today}T10:00:00.000Z`, dueAt: '2026-11-09T10:00:00.000Z' }));
    expect(nextStep({ today, now: NOW, words: reviewed }).key).toBe('done');
  });
});

describe('openWork', () => {
  it('a homework carrying its sheet is one task, not two', () => {
    const list = openWork({ homework: [{ id: 'h', task: 'Täida leht', status: 'Ootel', worksheetAssignmentId: 's' }], assignments: [{ id: 's', title: 'Leht', status: 'new' }] });
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Leht');
  });
});

describe('lessonNow', () => {
  it('finds nothing without a time', () => { expect(lessonNow([{ occurrenceDate: today }], NOW)).toBeNull(); });
});

describe('newFeedback', () => {
  const reviewed = (reviewedAt, extra = {}) => ({ id: reviewedAt, reviewStatus: 'reviewed', teacherGrade: 5, reviewedAt, ...extra });
  it('only what the teacher reviewed since the last look, and not older than two weeks', () => {
    const seen = new Date('2026-10-31T00:00:00').getTime();
    expect(newFeedback([reviewed('2026-11-01T10:00:00.000Z'), reviewed('2026-10-30T10:00:00.000Z')], seen, NOW)).toHaveLength(1);
    expect(newFeedback([reviewed('2026-09-01T10:00:00.000Z')], 0, NOW)).toHaveLength(0);
  });
  it('an automatic percentage is not teacher feedback', () => {
    expect(newFeedback([{ reviewStatus: 'reviewed', teacherGrade: '', teacherFeedback: '', percentage: 80, reviewedAt: '2026-11-01T10:00:00.000Z' }], 0, NOW)).toHaveLength(0);
  });
});

describe('homeNotes', () => {
  it('nothing when there is nothing', () => { expect(homeNotes()).toEqual([]); });
  it('one line each; availability only when the school asked', () => {
    const notes = homeNotes({
      feedback: [{ title: 'Minu pere' }], unpaidCents: 3000, money: () => '30 €',
      announcements: [{ announcement: { title: 'Vaheaeg', responseType: 'read' } }, { announcement: { title: 'Ajad', responseType: 'availability' } }],
    });
    expect(notes.map((note) => note.key)).toEqual(['feedback', 'announcement', 'invoice', 'availability']);
    expect(notes.map((note) => note.text)).toEqual(['Õpetaja vaatas üle: Minu pere', 'Uus teade: Vaheaeg', 'Tasumata arve: 30 €', 'Kool küsib, millal sulle tund sobib']);
    expect(homeNotes({ announcements: [{ announcement: { title: 'Vaheaeg', responseType: 'read' } }] }).map((note) => note.key)).toEqual(['announcement']);
  });
});
