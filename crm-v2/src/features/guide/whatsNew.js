// „Mis uut” (owner 2026-10-27: „отчёт того, что появилось на сайте … при входе в систему, чтобы не беспокоить
// человека”): what changed in the CRM, shown once after signing in (until „Selge”), and kept on /uuendused.
// audience: 'admin' — only administrators; 'staff' — teachers and administrators. `to` opens the place in the CRM.
// A new release goes on top with a new id: everybody sees it once again.

export const RELEASES = [
  {
    id: '2026-10-27',
    date: '24.–27.10.2026',
    title: 'Что нового в KeeleSepp',
    todo: [
      { audience: 'admin', text: 'Разослать ссылку /ajad тем, у кого нет удобного времени: Õpilased → «Ilma ajata» (готовое сообщение ET + RU).', to: '/students?ajad=1' },
      { audience: 'admin', text: 'Обзвонить семьи для групп: задачи «Võta ühendust · …» в Ülesanded. Результат отметить в Grupid → «Kellele pakkuda grupitunde».', to: '/tasks' },
      { audience: 'admin', text: 'Привязать родителей, у которых нет карточки ребёнка (пустой кабинет): Uued kontod.', to: '/accounts' },
      { audience: 'admin', text: 'Решить, какие письма клиентам включить: Seaded → Kool → E-kirjad (сейчас все выключены).', to: '/settings?tab=kool' },
    ],
    sections: [
      {
        title: 'Календарь и расписание',
        items: [
          { audience: 'staff', where: 'Kalender → «Uus tund»', text: 'После выбора ученика — кнопки с его удобными свободными временами на 2 недели (★ самое удобное). Клик ставит дату и время.', to: '/calendar' },
          { audience: 'staff', where: 'Kalender → «Planeerija»', text: 'Раскладывает всех учеников по неделе. Без отмеченного времени берёт регулярное время прошлых уроков; учитывает учебный план (сколько уроков в неделю нужно).', to: '/calendar?planeerija=1' },
          { audience: 'staff', where: 'Kalender → «Ei saa tulla»', text: 'Родители и ученики могут просто сообщить «Ma ei tule». Учитель нажимает «Märgi puudumine».', to: '/calendar' },
          { audience: 'staff', where: 'Ссылка /ajad', text: 'Ответы по ссылке /ajad теперь видны в карточке ученика, в календаре, планировщике и группах.' },
        ],
      },
      {
        title: 'Ученики',
        items: [
          { audience: 'staff', where: 'Правый клик по имени ученика', text: 'Своё меню: карточка, переименовать (имя меняется везде), изменить, написать, календарь, лист, доска, контакты, архив. Меню браузера — Shift + правый клик.' },
          { audience: 'staff', where: 'Карточка → «Õppeplaan»', text: 'Учебный план: курс, цель, дата, рекомендации (что повторить, что дальше), темп — сколько уроков в неделю нужно.' },
          { audience: 'staff', where: 'Карточка → «Vaata õpilase silmadega»', text: 'Кабинет ученика так, как его видит ученик (только просмотр).' },
          { audience: 'staff', where: 'Карточка → «Tööd» → «Õpilase tegevused»', text: 'Всё, что ученик делал за 60 дней: входы, листы, слова, «Minu vead», домашка, уроки.' },
          { audience: 'staff', where: 'Õpilased → «Ilma ajata»', text: 'Кто ещё не отметил удобное время — с контактами и готовым сообщением.', to: '/students?ajad=1' },
        ],
      },
      {
        title: 'Группы',
        items: [
          { audience: 'staff', where: 'Grupid → название группы', text: 'Все участники с контактами и «Mis puudub»: время урока, места, кто согласился, архив, возраст, контакты.', to: '/groups' },
          { audience: 'admin', where: 'Grupid → «Kellele pakkuda grupitunde»', text: 'Все семьи в одном списке. Отметить → «Anna ühendust võtmiseks» создаёт задачи на обзвон; отдельно — добавить в группу.', to: '/groups' },
          { audience: 'staff', where: 'Grupid → «Täida»', text: 'Места, возрастная группа и подбор подходящих учеников и заявок.', to: '/groups' },
        ],
      },
      {
        title: 'Финансы',
        items: [
          { audience: 'admin', where: 'Finantsid → «Tulu ja prognoos»', text: 'Доход и прогноз по урокам календаря; период: месяц, 3, 6 месяцев, год.', to: '/finance' },
          { audience: 'admin', where: 'Finantsid → «Ärinäitajad»', text: 'Под графиком: сколько уроков прошло и пропущено, посещаемость, новые и ушедшие ученики, средняя цена урока, ученики без цены, разбивка по учителям (часы, ставка, зарплата учителя, сколько остаётся школе) и предметам — в сравнении с прошлым периодом. Сверху — прибыль после зарплат и постоянных расходов, по месяцам, точка безубыточности, прогноз на следующий месяц, вклад уроков владельца, таблица всех учеников; расходы меняются в «Püsikulud ja omanik».', to: '/finance' },
          { audience: 'admin', where: 'Finantsid → счёт', text: '«Meeldetuletus» есть у любого неоплаченного счёта, и до срока тоже.', to: '/finance' },
          { audience: 'admin', where: 'Raamatupidamine', text: 'Партнёр на 2110 / 1350 необязателен; поставщики и отчёт «Partnerid»; удобнее Päevaraamat и Pearaamat.', to: '/finance/raamatupidamine' },
        ],
      },
      {
        title: 'Маркетинг',
        items: [
          { audience: 'admin', where: 'Kampaaniad', text: 'Акции, рекламные кампании и мероприятия: предложение, даты, цель, тексты постов ET + RU с кнопкой «Kopeeri tekst», картинка, чек-лист, бюджет, заявки. «Täna postitada» — что выложить сегодня. Готовы три детские группы по воскресеньям (5–6, 6–7, 8–9 лет) с программой, обложками и текстами.', to: '/kampaaniad' },
        ],
      },
      {
        title: 'Листы и домашка',
        items: [
          { audience: 'staff', where: 'Оценка листов', text: 'Задания, сделанные на уроке (без ответов), и отмеченные «Ei hinnata» не портят оценку. Ответ к тексту засчитывается по смыслу.' },
          { audience: 'staff', where: 'Kodutööd', text: 'Имя ученика над заданием, сроки словами («Täna», «3 p hiljaks»), удобнее на телефоне.', to: '/homework' },
          { audience: 'staff', where: 'Live Classroom', text: 'Клик по заданию показывает ответы; «Näita õpilasele» / «Peida».', to: '/live-classroom' },
        ],
      },
      {
        title: 'Конструктор листов: блоки для детей',
        items: [
          { audience: 'staff', where: 'Конструктор → «Lastele»', text: 'Новые блоки: «Värvi pilt» (раскраска по номерам или свободно, 15 картинок, красить можно на экране), «Kirjuta järele» (прописи на школьной разлиновке, писать пальцем или стилусом), «Loenda ja kirjuta» (посчитай и напиши), «Leia ja märgi täht» (найди букву). Всё работает на экране, в Live Classroom и при печати.' },
        ],
      },
      {
        title: 'Настройки и исправления',
        items: [
          { audience: 'staff', where: 'Seaded', text: 'Вкладки: Minu konto, Minu töö (свои свободные часы, Google Calendar), Kool и Tehniline (админ).', to: '/settings' },
          { audience: 'staff', where: 'Исправлено', text: 'После полуночи сроки сдвигались на день; при входе второго члена семьи — «Ligipääs puudub»; ученика не спрашивают время повторно.' },
        ],
      },
    ],
  },
];

export const LATEST = RELEASES[0];
export const SEEN_KEY = (uid) => `keelesepp.whatsNew.seen.${uid || 'anon'}`;

const allowed = (item, isAdmin) => item.audience !== 'admin' || isAdmin;

// the release as this person should see it (a teacher without the admin's to-dos and admin-only items)
export function releaseFor(release, roles = []) {
  const isAdmin = roles.includes('admin');
  return {
    ...release,
    todo: (release.todo || []).filter((item) => allowed(item, isAdmin)),
    sections: release.sections.map((section) => ({ ...section, items: section.items.filter((item) => allowed(item, isAdmin)) })).filter((section) => section.items.length),
  };
}

export function seenRelease(uid, storage = globalThis.localStorage) {
  try { return storage?.getItem(SEEN_KEY(uid)) || ''; } catch { return ''; }
}
export function markSeen(uid, id = LATEST.id, storage = globalThis.localStorage) {
  try { storage?.setItem(SEEN_KEY(uid), id); } catch { /* storage blocked: the dialog may show again, nothing breaks */ }
}
