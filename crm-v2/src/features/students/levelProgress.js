// „Minu areng” (owner 2026-10-12): every student sees his own way from his level to his target level (both on his card)
// — how far he is, every skill against the bar, and at most three very concrete next steps. Evidence: the skills
// computed from his checked worksheets (autoSkills), speaking from his recorded lessons (petLessonStats), the
// teacher's grades on the card where the computed value is missing, and the course of the next level (held with the teacher).
import { AUTO_SKILLS } from './autoSkills.js';
import { skillTasksPath } from './skillTasks.js';

export { speakingFromStats } from './autoSkills.js';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const READY = 70; // a skill counts as ready for the next level from here
const norm = (value) => { const level = String(value || '').toUpperCase().replace(/[^ABC12]/g, '').slice(0, 2); return LEVELS.includes(level) ? level : ''; };

const ACTIONS = {
  Grammatika: { et: 'Harjuta iga päev „Minu vead”: sinu enda laused tundidest.', ru: 'Каждый день тренируй «Minu vead»: твои предложения с уроков.', to: '/student/vead' },
  Sõnavara: { et: 'Korda sõnakaarte iga päev 10 minutit.', ru: 'Повторяй карточки слов по 10 минут в день.', to: '/student/sonavara' },
  Lugemine: { et: 'Tee õpetaja antud lehtede tekstid ja küsimused lõpuni.', ru: 'Дочитывай тексты в листах от учителя и отвечай на вопросы.', to: skillTasksPath('Lugemine') },
  Kuulamine: { et: 'Tee kodutöö etteütlused ja kuulamisülesanded.', ru: 'Делай диктанты и задания на слух из домашки.', to: skillTasksPath('Kuulamine') },
  Kirjutamine: { et: 'Kirjuta kodutöö kirjad ja jutud lõpuni.', ru: 'Дописывай письма и рассказы в домашке.', to: skillTasksPath('Kirjutamine') },
  Rääkimine: { et: 'Räägi tunnis eesti keeles, ära mine üle vene keelele.', ru: 'Говори на уроке по-эстонски, не переходи на русский.', to: '/student' },
};
const FIRST = {
  Grammatika: 'üks Harjuta-leht', Sõnavara: 'üks sõnavara ülesanne', Lugemine: 'üks lugemisülesanne',
  Kuulamine: 'üks etteütlus', Kirjutamine: 'üks kirjutamisülesanne', Rääkimine: 'üks tund õpetajaga',
};

// the teacher's grades on the card („lugemine: 72”) by skill name
function teacherSkills(skillMap = {}) {
  const out = {};
  for (const [key, value] of Object.entries(skillMap || {})) {
    const skill = AUTO_SKILLS.find((name) => name.toLocaleLowerCase('et') === String(key).toLocaleLowerCase('et'));
    if (skill && Number.isFinite(Number(value))) out[skill] = Math.max(0, Math.min(100, Number(value)));
  }
  return out;
}

// where a card stands: the way from its level to its target and the course he works on now, the next level's (courses
// are named by the level they lead to: from A2 he takes „Eesti keel B1”). One rule for „Minu areng” and „Minu kursus”.
export function coursePath(level, target) {
  const from = norm(level) || 'A1';
  const to = norm(target) || LEVELS[Math.min(LEVELS.length - 1, LEVELS.indexOf(from) + 1)];
  const a = LEVELS.indexOf(from);
  const b = Math.max(a, LEVELS.indexOf(to));
  const reached = a >= b;
  return { from, to, a, b, reached, step: reached ? from : LEVELS[a + 1], levels: LEVELS.slice(a, b + 1), known: Boolean(norm(level)) };
}

// the same catalogue key for a card learning English: „English B1”
export const courseKeyFor = (step, subject = '') => (/inglise|english/i.test(subject) ? `English ${step}` : step);

export function levelProgress({ level, target, computed = [], skillMap = {}, courseByLevel = {}, subject = '', wordCounts = null }) {
  const { from, to, a, b, reached, step } = coursePath(level, target);
  const course = courseByLevel[courseKeyFor(step, subject)] || { done: 0, total: 0, next: null };
  const coursePct = course.total ? Math.round((course.done / course.total) * 100) : 0;

  const byComputed = Object.fromEntries(computed.map((row) => [row.skill, row]));
  const byTeacher = teacherSkills(skillMap);
  const skills = AUTO_SKILLS.map((skill) => {
    const pct = byComputed[skill]?.pct ?? byTeacher[skill] ?? null;
    const state = pct === null ? 'unknown' : pct >= READY ? 'ready' : pct >= 50 ? 'close' : 'weak';
    const basis = byComputed[skill]?.basis || (byTeacher[skill] !== undefined ? 'õpetaja hinnang' : '');
    // sheet tasks can be all right while none of his word cards is learned yet: not „Valmis” beside „0 sõna selgeks õpitud”
    if (skill === 'Sõnavara' && state === 'ready' && wordCounts?.words > 0 && !wordCounts.learned) return { skill, pct, state: 'close', note: 'sõnad veel õppimata', basis };
    return { skill, pct, state, basis };
  });
  const known = skills.filter((s) => s.pct !== null);
  const skillsAvg = known.length ? Math.round(known.reduce((n, s) => n + s.pct, 0) / known.length) : 0;
  // readiness for the next level: half the course, half the skills (unknown skills do not count yet)
  const readiness = reached ? 100 : Math.round(known.length ? (coursePct + skillsAvg) / 2 : coursePct / 2);
  const steps = b - a;
  const overall = reached ? 100 : Math.round((readiness / 100 / steps) * 100);
  const path = LEVELS.slice(a, b + 1).map((lvl, i) => ({
    level: lvl, state: i === 0 ? 'done' : lvl === step ? 'current' : 'todo', pct: lvl === step ? readiness : i === 0 ? 100 : 0, target: lvl === to,
  }));

  const hints = [];
  const allReady = known.length >= 4 && known.every((s) => s.state === 'ready');
  if (!reached && readiness >= 80 && allReady) {
    hints.push({ key: 'test', et: `Oled valmis tasemeks ${step}! Küsi õpetajalt tasemetesti.`, ru: `Ты готов к уровню ${step}! Попроси учителя о тесте уровня.`, to: '/messages' });
  }
  const weakest = known.filter((s) => s.pct < READY).sort((x, y) => x.pct - y.pct)[0];
  if (weakest) hints.push({ key: `skill-${weakest.skill}`, skill: weakest.skill, et: `${weakest.skill} ${weakest.pct}% → ${READY}%: ${ACTIONS[weakest.skill].et}`, ru: `${weakest.skill}: ${weakest.pct}% из ${READY}%. ${ACTIONS[weakest.skill].ru}`, to: ACTIONS[weakest.skill].to });
  const unknown = skills.find((s) => s.pct === null);
  if (unknown) hints.push({ key: `first-${unknown.skill}`, skill: unknown.skill, et: `${unknown.skill}: tee ${FIRST[unknown.skill]}, siis näed oma taset.`, ru: `${unknown.skill}: сделай ${unknownRu(unknown.skill)} — тогда увидишь свой уровень.`, to: ACTIONS[unknown.skill].to });
  if (!reached && course.next) hints.push({ key: 'course', et: `Kursus ${step}: ${course.done}/${course.total} tundi. Järgmises tunnis: ${course.next}.`, ru: `Курс ${step}: пройдено ${course.done} из ${course.total} уроков. На следующем уроке: ${course.next}.`, to: '/homework' });

  return { from, to, step, reached, readiness, overall, coursePct, course, skills, path, hints: hints.slice(0, 3) };
}

function unknownRu(skill) {
  return { Grammatika: 'один лист «Harjuta»', Sõnavara: 'одно задание на слова', Lugemine: 'одно задание на чтение', Kuulamine: 'один диктант', Kirjutamine: 'одно письменное задание', Rääkimine: 'один урок с учителем' }[skill];
}
