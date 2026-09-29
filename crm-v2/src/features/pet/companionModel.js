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

export function companionHint({ now = Date.now(), invitation = null, todayLessons = [], dueToday = 0, overdue = 0, petName = '', tipIndex = 0, lang = 'et' }) {
  const en = lang === 'en';
  if (invitation) {
    return {
      key: `invite-${invitation.id}`, urgent: true,
      text: en ? `${invitation.teacherName || 'Your teacher'} invites you to a lesson! Press "Liitu tunniga".` : `${invitation.teacherName || 'Õpetaja'} kutsub sind tundi! Vajuta „Liitu tunniga”.`,
      hint: `${invitation.teacherName || 'Учитель'} приглашает тебя на урок! Нажми «Liitu tunniga».`,
    };
  }
  const soon = todayLessons
    .map((l) => ({ ...l, inMin: minutesUntil(l.time, now) }))
    .filter((l) => l.inMin !== null && l.inMin >= -5 && l.inMin <= 15)
    .sort((a, b) => a.inMin - b.inMin)[0];
  if (soon) {
    const m = Math.max(0, soon.inMin);
    return {
      key: `soon-${soon.time}`, urgent: true, action: { label: 'Live Classroom', to: '/live-classroom' },
      text: m ? (en ? `Your lesson starts in ${m} min. The invitation will appear here.` : `Tund algab ${m} minuti pärast. Kutse ilmub siia.`) : (en ? 'Your lesson starts now. Wait for the invitation!' : 'Tund algab kohe. Oota kutset!'),
      hint: m ? `Урок через ${m} мин. Приглашение появится здесь.` : 'Урок начинается. Жди приглашение!',
    };
  }
  if (overdue) {
    return {
      key: `overdue-${overdue}`, urgent: false, action: { label: 'Kodutööd', to: '/homework' },
      text: en ? `${overdue} homework ${overdue === 1 ? 'task is' : 'tasks are'} late. Shall we do it now?` : `${overdue} kodutöö${overdue === 1 ? '' : 'd'} hilinevad. Teeme kohe?`,
      hint: `Просрочено заданий: ${overdue}. Сделаем сейчас?`,
    };
  }
  if (dueToday) {
    return {
      key: `due-${dueToday}`, urgent: false, action: { label: 'Kodutööd', to: '/homework' },
      text: en ? 'Some homework is due today.' : 'Täna on kodutöö tähtaeg.',
      hint: 'Сегодня срок сдачи домашнего задания.',
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
  const [text, hint] = tips[((tipIndex % tips.length) + tips.length) % tips.length];
  return { key: `tip-${tipIndex}`, urgent: false, text, hint };
}

// First-visit tour for students: only steps whose target is on the page are shown.
export const TOUR_STEPS = [
  { target: '[data-tour="nav-/student"]', text: 'Siin on „Minu õpingud”: sinu tunnid, ülesanded ja mina.', hint: 'Здесь «Minu õpingud»: твои уроки, задания и я.' },
  { target: '[data-tour="nav-/homework"]', text: '„Kodutööd”: vajuta töölehele, et seda täita.', hint: '«Kodutööd»: нажми на лист, чтобы его заполнить.' },
  { target: '[data-tour="nav-/live-classroom"]', text: 'Siia tuled tundi. Kui õpetaja kutsub, annan märku!', hint: 'Сюда ты приходишь на урок. Когда учитель позовёт, я дам знать!' },
  { target: '[data-tour="nav-/messages"]', text: '„Suhtlus”: kirjuta õpetajale, kui midagi on segane.', hint: '«Suhtlus»: напиши учителю, если что-то непонятно.' },
  { target: '[data-tour="pet"]', text: 'Ja mina olen alati siin. Vajuta mulle, kui vajad abi!', hint: 'А я всегда здесь. Нажми на меня, если нужна помощь!' },
];

// One-time hints when the student first opens a page (the key is remembered per page).
export const PAGE_HINTS = {
  '/homework': { text: 'Vajuta töölehele, et seda täita. Vastused salvestuvad ise.', hint: 'Нажми на лист, чтобы его заполнить. Ответы сохраняются сами.' },
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
