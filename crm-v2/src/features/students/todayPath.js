import { toIsoDate } from '../calendar/calendarView.js';
// „Täna” (owner 2026-10-12): a student has exactly four things to do — interactive tasks, words, my mistakes and the
// pet. Each step is done by what the student really did today (work submitted or a task marked done, a word reviewed,
// the mistakes drill, a pet game); the streak is the pet's learning streak.
import { TASK_STATE, mergeTasks } from '../homework/taskList.js';
import { isDue } from '../vocabulary/wordsModel.js';
import { dailyPlan } from '../vocabulary/dailyReview.js';

// a time from the server is UTC: the learner's own day (between midnight and 02:00 the UTC date is still yesterday)
const dayOf = (value) => { const s = String(value || ''); if (s.length <= 10) return s; const d = new Date(s); return Number.isNaN(d.getTime()) ? s.slice(0, 10) : toIsoDate(d); };
const ERROR_PREFIX = 'Sinu lause:';

export function todayPath({ words = [], homework = [], submissions = [], assignments = [], pet = null, offerPet = false, mistakesDoneToday = false, today, now = Date.now() }) {
  const own = words.filter((word) => !String(word.translation || '').startsWith(ERROR_PREFIX));
  const mistakes = words.length - own.length;
  const due = own.filter((word) => isDue(word, now)).length;
  const reviewed = own.filter((word) => dayOf(word.reviewedAt) === today).length;
  const daily = dailyPlan(words, { now, today });
  const openTasks = mergeTasks({ homework, assignments }).filter((task) => task.state === TASK_STATE.TODO).length;
  const workToday = submissions.some((item) => dayOf(item.completedAt) === today)
    || homework.some((item) => item.status === 'Tehtud' && dayOf(item.doneAt || item.submittedAt || item.updatedAt) === today);
  const steps = [
    {
      key: 'work', label: 'Tee ülesanded', to: '/homework', done: workToday || (!openTasks && homework.length + assignments.length > 0),
      detail: workToday ? 'Tehtud täna' : openTasks ? `${openTasks} ootab` : 'Uusi ülesandeid ei ole',
      // idle: nothing to do for this step today; the home page does not list a step that cannot be done
      idle: !workToday && !openTasks,
    },
    // „Päeva 5 minutit” (dailyReview.js): one tap starts about ten cards; done after five reviewed today
    {
      key: 'words', label: daily.count >= 2 ? 'Päeva 5 minutit' : 'Korda sõnu', to: daily.count >= 2 ? '/student/sonavara?paev=1' : '/student/sonavara', done: daily.done || (reviewed > 0 && daily.count < 2),
      detail: daily.done ? `${reviewed} sõna korratud` : daily.count >= 2 ? `${daily.count} kaarti${daily.forgotten ? ` · ${daily.forgotten} ununeb` : ''}` : reviewed ? `${reviewed} sõna korratud` : due ? `${due} sõna ootab` : own.length ? 'Kõik sõnad korratud' : 'Õpi tunni sõnu',
      idle: !daily.count && !reviewed,
    },
  ];
  if (mistakes) {
    steps.push({ key: 'mistakes', label: 'Minu vead', to: '/student/vead', done: mistakesDoneToday, detail: mistakesDoneToday ? 'Harjutatud täna' : `${mistakes} ${mistakes === 1 ? 'lause' : 'lauset'} tundidest` });
  }
  // no friend chosen yet (and not switched off): the step to the picker
  if (offerPet && !pet?.kind && !pet?.optedOut) {
    steps.push({ key: 'pet', label: 'Vali endale sõber', to: '/student/lemmik', done: false, detail: 'Õppesõber kasvab koos sinuga' });
  }
  if (pet?.kind && !pet.optedOut) {
    steps.push({ key: 'pet', label: `Mängi: ${pet.name || 'lemmik'}`, to: '/student/lemmik', done: dayOf(pet.playedAt) === today, detail: dayOf(pet.playedAt) === today ? 'Mängitud täna' : 'Teemamäng tunni sõnadega' });
  }
  return { steps, done: steps.filter((step) => step.done).length, total: steps.length };
}
