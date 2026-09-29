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
    ['Your worksheets are in "Kodutööd". Answers save by themselves.', 'Твои листы в «Kodutööd». Ответы сохраняются сами.'],
    ['Every finished worksheet helps me grow!', 'Каждый сданный лист помогает мне расти!'],
  ] : [
    [`Tere! Mina olen ${petName}. Vajuta mulle, kui vajad abi.`, `Привет! Я ${petName}. Нажми на меня, если нужна помощь.`],
    ['Sinu töölehed on „Kodutööd” all. Vastused salvestuvad ise.', 'Твои листы в «Kodutööd». Ответы сохраняются сами.'],
    ['Iga tehtud tööleht aitab mul kasvada!', 'Каждый сданный лист помогает мне расти!'],
    ['Kui õpetaja kutsub tundi, annan sulle kohe märku.', 'Когда учитель позовёт на урок, я сразу дам знать.'],
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
