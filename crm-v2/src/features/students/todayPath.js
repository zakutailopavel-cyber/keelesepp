// „Tänane tee” (owner 2026-10-12): one short daily path on the student's home instead of separate places —
// repeat words → do the homework or a sheet → play with the pet. Each step is done by what the student really did
// today (a word reviewed, work submitted or homework marked done, a pet game); the streak is the pet's learning streak.
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import { isDue } from '../vocabulary/wordsModel.js';

const dayOf = (value) => String(value || '').slice(0, 10);

export function todayPath({ words = [], homework = [], submissions = [], pet = null, today, now = Date.now() }) {
  const due = words.filter((word) => isDue(word, now)).length;
  const reviewed = words.filter((word) => dayOf(word.reviewedAt) === today).length;
  const open = homework.filter(isHomeworkOpen);
  const workToday = submissions.some((item) => dayOf(item.completedAt) === today)
    || homework.some((item) => item.status === 'Tehtud' && dayOf(item.doneAt || item.submittedAt || item.updatedAt) === today);
  const steps = [
    {
      key: 'words', label: 'Korda sõnu', to: '/student/sonavara', done: reviewed > 0,
      detail: reviewed ? `${reviewed} sõna korratud` : due ? `${due} sõna ootab` : words.length ? 'Harjuta tundide sõnu' : 'Vali tund ja õpi sõnu',
    },
    // no homework open: the step is a lesson of the course on one's own („Õpi ise”)
    open.length ? {
      key: 'work', label: 'Tee kodutöö', to: '/homework', done: workToday,
      detail: workToday ? 'Tehtud täna' : open[0].task || `${open.length} ootab`,
    } : {
      key: 'work', label: 'Õpi ise', to: '/student/kursus', done: workToday,
      detail: workToday ? 'Tehtud täna' : 'Tee üks leht kursusest',
    },
  ];
  if (pet?.kind && !pet.optedOut) {
    steps.push({ key: 'pet', label: `Mängi: ${pet.name || 'lemmik'}`, to: '/student/lemmik', done: dayOf(pet.playedAt) === today, detail: dayOf(pet.playedAt) === today ? 'Mängitud täna' : 'Teemamäng tunni sõnadega' });
  }
  return { steps, done: steps.filter((step) => step.done).length, total: steps.length };
}
