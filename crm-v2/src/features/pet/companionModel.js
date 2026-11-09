// What the walking pet says, most important first. Pure: the component passes in what it knows.
// Every line is short, in the language being learned, with a Russian hint for younger learners.

const MIN = 60 * 1000;

function minutesUntil(time, now) {
  const [h, m] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return Math.round((d.getTime() - now) / MIN);
}

// `next`: students/nextStep.js — the one decider (owner 2026-11-09). The pet only says it in its own words: a lesson
// about to start is urgent, homework is a gentle nudge, practice points to „Täna”; else a tip.
const HOMEWORK_KEYS = ['overdue', 'due-soon', 'monologue', 'homework'];
export function companionHint({ now = Date.now(), invitation = null, next = null, petName = '', tipIndex = 0, lang = 'et', personal = [] }) {
  const en = lang === 'en';
  if (invitation) {
    return {
      key: `invite-${invitation.id}`, urgent: true,
      text: en ? `${invitation.teacherName || 'Your teacher'} invites you to a lesson! Press "Liitu tunniga".` : `${invitation.teacherName || 'Õpetaja'} kutsub sind tundi! Vajuta „Liitu tunniga”.`,
      hint: `${invitation.teacherName || 'Учитель'} приглашает тебя на урок! Нажми «Liitu tunniga».`,
    };
  }
  const inMin = next?.key === 'lesson' && next.lesson ? minutesUntil(next.lesson.time, now) : null;
  if (inMin !== null && inMin >= -5 && inMin <= 15) {
    const m = Math.max(0, inMin);
    return {
      key: `soon-${next.lesson.time}`, urgent: true, action: { label: 'Live Classroom', to: '/live-classroom' },
      text: m ? (en ? `Your lesson starts in ${m} min. The invitation will appear here.` : `Tund algab ${m} minuti pärast. Kutse ilmub siia.`) : (en ? 'Your lesson starts now. Wait for the invitation!' : 'Tund algab kohe. Oota kutset!'),
      hint: m ? `Урок через ${m} мин. Приглашение появится здесь.` : 'Урок начинается. Жди приглашение!',
    };
  }
  if (next && HOMEWORK_KEYS.includes(next.key)) {
    const late = next.key === 'overdue';
    return {
      key: `next-${next.key}-${next.title}`, urgent: false, action: { label: 'Ülesanded', to: next.to || '/homework' },
      text: en ? (late ? `"${next.title}" is late. Shall we do it now?` : `Next: "${next.title}". Shall we do it?`) : (late ? `„${next.title}” hilineb. Teeme kohe?` : `Järgmine: „${next.title}”. Teeme ära?`),
      hint: late ? `«${next.title}» просрочено. Сделаем сейчас?` : `Дальше: «${next.title}». Сделаем?`,
    };
  }
  if (next && ['review', 'sentences'].includes(next.key)) {
    return {
      key: `next-${next.key}`, urgent: false, action: { label: 'Harjuta', to: next.to || '/student/harjuta' },
      text: en ? 'A few minutes of practice are waiting in "Harjuta".' : 'Sind ootab „Harjuta” lühike harjutus.',
      hint: 'Тебя ждёт короткая тренировка в «Harjuta».',
    };
  }
  const tips = en ? [
    [`Hi! I'm ${petName}. Press me when you need help.`, `Привет! Я ${petName}. Нажми на меня, если нужна помощь.`],
    ['A little every day, and the language will come!', 'Каждый день понемногу — и язык придёт!'],
    ['Mistakes are part of learning. Keep going!', 'Ошибки — часть учёбы. Смело вперёд!'],
    ['You have already learned so much!', 'Ты уже столько выучил(а)!'],
    ['Every finished worksheet helps me grow!', 'Каждый сданный лист помогает мне расти!'],
  ] : [
    [`Tere! Mina olen ${petName}. Vajuta mulle, kui vajad abi.`, `Привет! Я ${petName}. Нажми на меня, если нужна помощь.`],
    ['Iga päev natuke — ja keel tuleb!', 'Каждый день понемногу — и язык придёт!'],
    ['Vead on õppimise osa. Julgelt edasi!', 'Ошибки — часть учёбы. Смело вперёд!'],
    ['Sa oled juba nii palju õppinud!', 'Ты уже столько выучил(а)!'],
    ['Räägi julgelt, isegi kui sõnu on vähe.', 'Говори смело, даже если слов пока мало.'],
    ['Iga tehtud tööleht aitab mul kasvada!', 'Каждый сданный лист помогает мне расти!'],
    ['Kui õpetaja kutsub tundi, annan sulle kohe märku.', 'Когда учитель позовёт на урок, я сразу дам знать.'],
    ['Tubli! Samm-sammult jõuad kaugele.', 'Молодец! Шаг за шагом дойдёшь далеко.'],
  ];
  // after the introduction, what the pet remembers about the learner comes before the general tips (petLife.js)
  const all = [tips[0], ...personal.map((p) => [p.text, p.hint]), ...tips.slice(1)];
  const [text, hint] = all[((tipIndex % all.length) + all.length) % all.length];
  return { key: `tip-${tipIndex}`, urgent: false, text, hint };
}

// First-visit tour for students: only steps whose target is on the page are shown.
export const TOUR_STEPS = [
  // phones: the menu is closed, so the tour points at the menu button instead of the items
  { target: '[data-tour="menu"]', text: 'Menüü on siin: tunnid, ülesanded, tund õpetajaga ja sõnumid.', hint: 'Меню здесь: уроки, домашки, урок с учителем и сообщения.' },
  { target: '[data-tour="nav-/student"]', text: 'Siin on „Täna”: mida täna teha, sinu tund ja mina.', hint: 'Здесь «Täna»: что сделать сегодня, твой урок и я.' },
  { target: '[data-tour="nav-/student/harjuta"]', text: '„Harjuta”: tänane harjutus ühe nupuga — sõnad, laused ja ülesanded.', hint: '«Harjuta»: тренировка на сегодня одной кнопкой.' },
  { target: '[data-tour="nav-/homework"]', text: '„Ülesanded”: kõik, mida õpetaja sulle andis.', hint: '«Ülesanded»: всё, что задал учитель.' },
  { target: '[data-tour="nav-/student/vead"]', text: '„Minu vead”: laused tunnist, mida harjutame, kuni need tulevad õigesti.', hint: '«Minu vead»: фразы с урока, которые тренируем, пока не получится.' },
  { target: '[data-tour="nav-/student/lemmik"]', text: 'Siin elan mina! Kui õpetaja kutsub tundi, annan märku igal lehel.', hint: 'Здесь живу я! Когда учитель позовёт на урок, я дам знать на любой странице.' },
  { target: '[data-tour="nav-/messages"]', text: '„Suhtlus”: kirjuta õpetajale, kui midagi on segane.', hint: '«Suhtlus»: напиши учителю, если что-то непонятно.' },
  { target: '[data-tour="pet"]', text: 'Ja siin olen mina. Iga päev on mul sulle üks väike palve.', hint: 'А вот и я. Каждый день у меня к тебе одна маленькая просьба.' },
];

// One-time hints when the student first opens a page (the key is remembered per page).
export const PAGE_HINTS = {
  '/homework': { text: 'Vajuta „Alusta”, et ülesannet teha. Vastused salvestuvad ise.', hint: 'Нажми «Alusta», чтобы сделать задание. Ответы сохраняются сами.' },
  '/live-classroom': { text: 'Kui tund algab, vajuta „Käivita video ja mikrofon”. Mina olen vaikselt.', hint: 'Когда урок начнётся, нажми «Käivita video ja mikrofon». Я буду тихо.' },
};

export function celebrationHint({ xp = 15, goals = 0, lang = 'et' }) {
  const en = lang === 'en';
  const goalText = goals ? (en ? ` and ${goals} lesson goal${goals === 1 ? '' : 's'}` : ` ja ${goals} tunni eesmärk${goals === 1 ? '' : 'i'}`) : '';
  return {
    key: `celebrate-${Date.now()}`, urgent: true, celebrate: true,
    text: en ? `Well done! Worksheet submitted${goalText}. +${xp} for me!` : `Tubli! Tööleht on esitatud${goalText}. +${xp} mulle!`,
    hint: `Молодец! Лист сдан${goals ? ` и выполнено целей: ${goals}` : ''}. +${xp} мне!`,
  };
}

// The pet is on these pages itself (PetLoop), and a lesson has its own (RoomPet): no second one walking around.
export const companionHere = (pathname = '') => !(pathname === '/student' || pathname === '/student/' || pathname.startsWith('/student/lemmik') || pathname.startsWith('/live-classroom'));

// Quiet (owner 2026-11-01): by itself the pet says at most one thing a session. Something new is the exception (a lesson
// invitation, a lesson about to start, a celebration: those do not pass through here), and a tap always answers.
export const mayAutoSpeak = ({ spokenKey = '', key = '' } = {}) => !spokenKey || spokenKey === key;
