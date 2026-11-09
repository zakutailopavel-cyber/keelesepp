import { describe, expect, it } from 'vitest';
import { homeNotes, homeworkQueue, lessonNow, newFeedback, nextStep, openWork, todaySteps } from './nextStep.js';

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


describe('todaySteps: the „Täna” flow (owner 2026-11-09)', () => {
  const ownSentence = { id: 's1', word: 'Ma lähen kooli.', translation: 'Sinu lause: Ma lähen koolis.', box: 0, reviews: 0 };
  const monologue = { key: 'monologue-s-2026-11', kind: 'monologue', state: 'todo', title: 'Kuu monoloog · november 2026', due: '2026-11-30', to: '/student/monoloog' };
  const keys = (result, state) => result.steps.filter((step) => !state || step.state === state).map((step) => step.key);

  it('orders homework → words → sentences → course and skips steps with nothing to do', () => {
    const all = todaySteps({ today, now: NOW, homework: [{ id: 'h', task: 'Kirjuta', status: 'Ootel' }], words: [dueWord], sentences: { available: true, own: 0 }, selfStudent: true });
    expect(keys(all)).toEqual(['homework', 'words', 'sentences', 'course']);
    expect(keys(all, 'todo')).toEqual(['homework', 'words', 'sentences', 'course']);
    const empty = todaySteps({ today, now: NOW });
    expect(keys(empty, 'todo')).toEqual([]);
    expect(keys(empty, 'empty')).toEqual(['homework', 'words', 'sentences']);
    expect(empty.finished).toBe(false);
    // the course step exists only on a self-study card
    expect(keys(todaySteps({ today, now: NOW, words: [dueWord] }))).not.toContain('course');
  });

  it('ticks steps by what happened today or by the stored tick; all done → finished', () => {
    const base = { today, now: NOW, homework: [{ id: 'h', task: 'Kirjuta', status: 'Ootel' }], words: [dueWord], sentences: { available: true, own: 0 } };
    expect(keys(todaySteps({ ...base, done: ['words'] }), 'done')).toEqual(['words']);
    const submitted = todaySteps({ ...base, homework: [], submissions: [{ completedAt: `${today}T12:00:00` }], done: ['words', 'sentences'] });
    expect(keys(submitted, 'done')).toEqual(['homework', 'words', 'sentences']);
    expect(submitted.finished).toBe(true);
    expect(submitted.todo).toEqual([]);
  });

  it('own wrong sentences go to the sentences step, not to the word cards', () => {
    const result = todaySteps({ today, now: NOW, words: [ownSentence], sentences: { available: false, own: 1 } });
    expect(result.steps.find((step) => step.key === 'words').state).toBe('empty');
    expect(result.steps.find((step) => step.key === 'sentences')).toMatchObject({ state: 'todo', detail: '1 sinu lause tunnist + harjutused' });
  });

  it('a lesson now is an interrupt above the steps', () => {
    const result = todaySteps({ today, now: NOW, occurrences: [lesson('15:10')], words: [dueWord] });
    expect(result.live).toMatchObject({ time: '15:10' });
    expect(keys(result, 'todo')).toEqual(['words']);
  });

  it('the daily goal is about ten minutes and the estimate adds up the steps to do', () => {
    const result = todaySteps({ today, now: NOW, words: [dueWord], sentences: { available: true, own: 0 } });
    expect(result.goal).toBe(10);
    expect(result.minutes).toBe(result.todo.reduce((sum, step) => sum + step.minutes, 0));
  });

  it('the monthly monologue is in the homework queue after due-soon work (the bug: it never showed when tasks were not passed)', () => {
    const queue = homeworkQueue({ today, homework: [{ id: 'far', task: 'Kauge', due: '2026-11-20', status: 'Ootel' }, { id: 'old', task: 'Vana', due: '2026-10-30', status: 'Ootel' }, { id: 'soon', task: 'Homne', due: '2026-11-03', status: 'Ootel' }], tasks: [monologue] });
    expect(queue.map((task) => task.kind)).toEqual(['overdue', 'due-soon', 'monologue', 'homework']);
    expect(queue[2].to).toBe('/student/monoloog');
    expect(todaySteps({ today, now: NOW, tasks: [monologue] }).steps[0]).toMatchObject({ key: 'homework', state: 'todo', to: '/student/monoloog' });
    expect(nextStep({ today, now: NOW, tasks: [monologue] })).toMatchObject({ key: 'monologue', to: '/student/monoloog' });
  });
});

describe('nextStep after the words: the sentence practice', () => {
  it('comes after due words and before the self-study course; a ticked step is not next', () => {
    expect(nextStep({ today, now: NOW, sentences: { available: true, own: 0 } }).key).toBe('sentences');
    expect(nextStep({ today, now: NOW, words: [dueWord], sentences: { available: true, own: 0 } }).key).toBe('review');
    expect(nextStep({ today, now: NOW, sentences: { available: true, own: 0 }, done: ['sentences'] }).key).toBe('done');
    expect(nextStep({ today, now: NOW, words: [dueWord], done: ['words'] }).key).toBe('done');
  });
});
