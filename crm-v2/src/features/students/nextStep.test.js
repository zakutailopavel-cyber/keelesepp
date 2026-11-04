import { describe, expect, it } from 'vitest';
import { homeNotes, homeSections, lessonNow, newFeedback, nextStep, openWork } from './nextStep.js';

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

describe('nextStep: the full order (cabinet first screen, 2026-11-04)', () => {
  const monologue = { key: 'monologue-s-2026-11', kind: 'monologue', state: 'todo', title: 'Kuu monoloog · november 2026', due: '2026-11-30' };
  const farWork = { id: 'far', task: 'Kauge töö', due: '2026-11-20', status: 'Ootel' };
  const soonWork = { id: 'soon', task: 'Homne töö', due: '2026-11-03', status: 'Ootel' };
  const overdueWork = { id: 'old', task: 'Vana töö', due: '2026-10-30', status: 'Ootel' };
  const selfStudy = { id: 'ss', source: 'self_study', lessonId: 'b1-01', phase: 'discover', lessonTitle: 'Minu pere', status: 'new', assignedAt: '2026-11-01T10:00:00Z' };
  const base = { today, now: NOW };
  const everything = { ...base, occurrences: [lesson('15:20'), lesson('18:00')], homework: [overdueWork, soonWork, farWork], tasks: [monologue], words: [dueWord], assignments: [selfStudy] };
  const order = [];
  // drop the winner one by one and the next priority must win
  const peel = (input) => {
    const step = nextStep(input);
    order.push(step.key);
    if (step.key === 'lesson') return peel({ ...input, occurrences: input.occurrences.filter((item) => item.time !== '15:20') });
    if (step.key === 'overdue') return peel({ ...input, homework: input.homework.filter((item) => item.id !== 'old') });
    if (step.key === 'due-soon') return peel({ ...input, homework: input.homework.filter((item) => item.id !== 'soon') });
    if (step.key === 'lesson-today') return peel({ ...input, occurrences: [] });
    if (step.key === 'monologue') return peel({ ...input, tasks: [] });
    if (step.key === 'homework') return peel({ ...input, homework: [] });
    if (step.key === 'review') return peel({ ...input, words: [] });
    if (step.key === 'self-study') return peel({ ...input, assignments: [] });
    return step;
  };

  it('lesson now → overdue → due soon → lesson later today → monologue → other homework → words → self-study → done', () => {
    peel(everything);
    expect(order).toEqual(['lesson', 'overdue', 'due-soon', 'lesson-today', 'monologue', 'homework', 'review', 'self-study', 'done']);
  });

  it('each step has exactly one button and a place to go', () => {
    const steps = [
      nextStep({ ...base, homework: [soonWork] }),
      nextStep({ ...base, occurrences: [lesson('18:00')] }),
      nextStep({ ...base, tasks: [monologue] }),
      nextStep({ ...base, assignments: [selfStudy] }),
    ];
    expect(steps.map((step) => [step.key, step.button, step.to])).toEqual([
      ['due-soon', 'Tee ära', '/homework'],
      ['lesson-today', 'Vaata tunniplaani', '#tunniplaan'],
      ['monologue', 'Salvesta', '/homework'],
      ['self-study', 'Jätka', '/student/kursus'],
    ]);
    expect(steps[0].detail).toBe('Tähtaeg homme');
    expect(steps[1].title).toBe('Täna kell 18:00 on tund');
    expect(steps[3].title).toBe('Minu pere');
  });

  it('a recorded monologue, a cancelled or past lesson today and a finished self-study sheet are not next steps', () => {
    expect(nextStep({ ...base, tasks: [{ ...monologue, state: 'waiting' }] }).key).toBe('done');
    expect(nextStep({ ...base, occurrences: [lesson('18:00', { status: 'Tühistatud' }), lesson('09:00')] }).key).toBe('done');
    expect(nextStep({ ...base, assignments: [{ ...selfStudy, status: 'done' }] }).key).toBe('done');
  });

  it('homework due in three days is not „due soon”: a lesson later today comes first', () => {
    expect(nextStep({ ...base, homework: [{ ...soonWork, due: '2026-11-05' }], occurrences: [lesson('18:00')] }).key).toBe('lesson-today');
    expect(nextStep({ ...base, homework: [{ ...soonWork, due: '2026-11-04' }], occurrences: [lesson('18:00')] }).key).toBe('due-soon');
  });
});

describe('homeSections', () => {
  it('one row per section, counts only when something waits', () => {
    const rows = homeSections({ today, now: NOW, homework: [{ id: 'a', task: 'Tee', status: 'Ootel' }], words: [dueWord, { id: 's', word: 'Ma lähen.', translation: 'Sinu lause: x', box: 0, reviews: 1 }] });
    expect(rows.map((row) => row.key)).toEqual(['tasks', 'words', 'mistakes', 'boards', 'progress']);
    expect(Object.fromEntries(rows.map((row) => [row.key, row.count]))).toMatchObject({ tasks: 1, mistakes: 1, boards: 0, progress: 0 });
    expect(rows.find((row) => row.key === 'words').count).toBeGreaterThan(0);
    expect(homeSections({ today, now: NOW }).every((row) => row.count === 0)).toBe(true);
  });
  it('the monthly monologue counts as one open task', () => {
    const rows = homeSections({ today, now: NOW, tasks: [{ key: 'm', kind: 'monologue', state: 'todo', title: 'Kuu monoloog' }] });
    expect(rows[0].count).toBe(1);
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

describe('next step follows the order of the task list', () => {
  it('leads with the first lesson of a batch without deadlines, Avasta first, the test last', () => {
    const at = '2026-11-01T18:40:00.000Z';
    const sheet = (lessonId, phase, title) => ({ id: `${lessonId}-${phase}`, studentId: 's', lessonId, phase, lessonTitle: title, status: 'new', assignedAt: at, source: 'learning_library', worksheetDoc: { blocks: [{ id: 'b' }] } });
    const assignments = [sheet('b1b2-085', 'discover', 'Kontroll 17'), sheet('b1b2-034', 'practice', 'Ettepanek · Harjuta'), sheet('b1b2-034', 'discover', 'Ettepanek · Avasta')];
    expect(nextStep({ assignments, today: '2026-11-02', now: Date.parse('2026-11-02T10:00:00Z') }).title).toBe('Ettepanek');
    expect(openWork({ assignments }).map((task) => task.id.includes('b1b2-085'))).toEqual([false, false, true]);
    expect(openWork({ assignments })[0].id).toContain('b1b2-034-discover');
  });
});

