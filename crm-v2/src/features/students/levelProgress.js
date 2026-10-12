// „Minu areng” (owner 2026-10-12): every student sees his own way from his level to his target level (both on his card)
// — how far he is, every skill against the bar, and at most three very concrete next steps. Evidence: the skills
// computed from his checked worksheets (autoSkills), speaking from his recorded lessons (petLessonStats), the
// teacher's grades on the card where the computed value is missing, and the course of the next level („Õpi ise”).
import { AUTO_SKILLS } from './autoSkills.js';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const READY = 70; // a skill counts as ready for the next level from here
const norm = (value) => String(value || '').toUpperCase().replace(/[^ABC12]/g, '').slice(0, 2);

const ACTIONS = {
  Grammatika: { et: 'Tee „Õpi ise” Harjuta-lehti: vormid ja lauseehitus.', ru: 'Делай листы «Harjuta» в «Õpi ise»: формы и порядок слов.', to: '/student/kursus' },
  Sõnavara: { et: 'Korda sõnakaarte iga päev 10 minutit.', ru: 'Повторяй карточки слов по 10 минут в день.', to: '/student/sonavara' },
  Lugemine: { et: 'Loe Avasta-lehtede tekste ja vasta küsimustele.', ru: 'Читай тексты в листах «Avasta» и отвечай на вопросы.', to: '/student/kursus' },
  Kuulamine: { et: 'Tee Harjuta-lehtede etteütlusi.', ru: 'Делай диктанты в листах «Harjuta».', to: '/student/kursus' },
  Kirjutamine: { et: 'Kirjuta Kasuta-lehtede kirjad ja jutud lõpuni.', ru: 'Дописывай письма и рассказы в листах «Kasuta».', to: '/student/kursus' },
  Rääkimine: { et: 'Räägi tunnis eesti keeles, ära mine üle vene keelele.', ru: 'Говори на уроке по-эстонски, не переходи на русский.', to: '/student' },
};
const FIRST = {
  Grammatika: 'üks Harjuta-leht', Sõnavara: 'üks sõnavara ülesanne', Lugemine: 'üks lugemisülesanne',
  Kuulamine: 'üks etteütlus', Kirjutamine: 'üks kirjutamisülesanne', Rääkimine: 'üks Live Classroomi tund',
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

// speaking from the lesson stats the student can read: the share of Estonian in what he said
export function speakingFromStats(stats = []) {
  const list = stats.filter((s) => Number(s?.studentWords) >= 20 && Number.isFinite(Number(s?.share)));
  if (!list.length) return null;
  return { skill: 'Rääkimine', pct: Math.round(list.reduce((n, s) => n + Number(s.share), 0) / list.length), basis: `${list.length} ${list.length === 1 ? 'tund' : 'tundi'}` };
}

export function levelProgress({ level, target, computed = [], skillMap = {}, courseByLevel = {} }) {
  const from = norm(level) || 'A1';
  const to = norm(target) || LEVELS[Math.min(LEVELS.length - 1, LEVELS.indexOf(from) + 1)];
  const a = Math.max(0, LEVELS.indexOf(from));
  const b = Math.max(a, LEVELS.indexOf(to));
  const reached = a >= b;
  const step = reached ? from : LEVELS[a + 1]; // the course he works on now: the next level's
  const course = courseByLevel[step] || { done: 0, total: 0, next: null };
  const coursePct = course.total ? Math.round((course.done / course.total) * 100) : 0;

  const byComputed = Object.fromEntries(computed.map((row) => [row.skill, row]));
  const byTeacher = teacherSkills(skillMap);
  const skills = AUTO_SKILLS.map((skill) => {
    const pct = byComputed[skill]?.pct ?? byTeacher[skill] ?? null;
    const state = pct === null ? 'unknown' : pct >= READY ? 'ready' : pct >= 50 ? 'close' : 'weak';
    return { skill, pct, state, basis: byComputed[skill]?.basis || (byTeacher[skill] !== undefined ? 'õpetaja hinnang' : '') };
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
  const allReady = known.length >= 4 && known.every((s) => s.pct >= READY);
  if (!reached && readiness >= 80 && allReady) {
    hints.push({ key: 'test', et: `Oled valmis tasemeks ${step}! Küsi õpetajalt tasemetesti.`, ru: `Ты готов к уровню ${step}! Попроси учителя о тесте уровня.`, to: '/messages' });
  }
  const weakest = known.filter((s) => s.pct < READY).sort((x, y) => x.pct - y.pct)[0];
  if (weakest) hints.push({ key: `skill-${weakest.skill}`, skill: weakest.skill, et: `${weakest.skill} ${weakest.pct}% → ${READY}%: ${ACTIONS[weakest.skill].et}`, ru: `${weakest.skill}: ${weakest.pct}% из ${READY}%. ${ACTIONS[weakest.skill].ru}`, to: ACTIONS[weakest.skill].to });
  const unknown = skills.find((s) => s.pct === null);
  if (unknown) hints.push({ key: `first-${unknown.skill}`, skill: unknown.skill, et: `${unknown.skill}: tee ${FIRST[unknown.skill]}, siis näed oma taset.`, ru: `${unknown.skill}: сделай ${unknownRu(unknown.skill)} — тогда увидишь свой уровень.`, to: ACTIONS[unknown.skill].to });
  if (!reached && course.next) hints.push({ key: 'course', et: `Kursus ${step}: ${course.done}/${course.total} tundi. Järgmine: ${course.next}.`, ru: `Курс ${step}: пройдено ${course.done} из ${course.total} уроков. Дальше: ${course.next}.`, to: '/student/kursus' });

  return { from, to, step, reached, readiness, overall, coursePct, course, skills, path, hints: hints.slice(0, 3) };
}

function unknownRu(skill) {
  return { Grammatika: 'один лист «Harjuta»', Sõnavara: 'одно задание на слова', Lugemine: 'одно задание на чтение', Kuulamine: 'один диктант', Kirjutamine: 'одно письменное задание', Rääkimine: 'один урок в Live Classroom' }[skill];
}
