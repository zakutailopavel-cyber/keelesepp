// The teacher's introduction to the whole system (owner, 2026-10-10: „для учителей формат знакомства с системой …
// про все способности системы”). Estonian first, a short Russian line for teachers who think in Russian.
// `to` opens the page; `admin` / `finance` limit an item to those roles; `steps` are the „how to” in short.

export const FIRST_STEPS = [
  { id: 'student', et: 'Ava oma õpilase kaart ja vaata tema õpiteed', ru: 'Открой карточку ученика и посмотри его учебный путь', to: '/students' },
  { id: 'calendar', et: 'Lisa kalendrisse üks tund (ka korduv)', ru: 'Добавь урок в календарь (можно повторяющийся)', to: '/calendar' },
  { id: 'library', et: 'Ava Õppevaras tunni tööleht ja vaata selle kolme etappi', ru: 'Открой лист урока в Õppevara и посмотри три этапа', to: '/library' },
  { id: 'homework', et: 'Määra õpilasele tööleht kodutööks', ru: 'Задай ученику лист как домашнее задание', to: '/homework' },
  { id: 'live', et: 'Proovi Live Classroomi testõpilasega: kutse, tahvel, tööleht', ru: 'Попробуй Live Classroom с тестовым учеником: приглашение, доска, лист', to: '/live-classroom' },
  { id: 'held', et: 'Märgi tund kalendris toimunuks', ru: 'Отметь урок в календаре как проведённый', to: '/calendar' },
  { id: 'messages', et: 'Saada õpilasele või vanemale sõnum', ru: 'Отправь сообщение ученику или родителю', to: '/messages' },
  { id: 'settings', et: 'Ühenda Seadetes oma Google’i kalender', ru: 'Подключи в настройках свой Google-календарь', to: '/settings' },
];

export const GUIDE_SECTIONS = [
  {
    id: 'start', title: 'Alustamine', ru: 'С чего начать',
    items: [
      { title: 'Ülevaade', to: '/', et: 'Avaleht näitab tänaseid ja lähipäevade tunde, ootel ülesandeid ja teateid.', ru: 'Главная: уроки на сегодня и ближайшие дни, задачи и уведомления.' },
      { title: 'Seaded', to: '/settings', et: 'Sinu andmed, parooli taastamine ja Google’i kalendri ühendus. Administraator saab siit avada õpilase või vanema vaate ja logida sisse testõpilasena.', ru: 'Твои данные, сброс пароля, подключение Google-календаря. Админ может открыть вид ученика/родителя и войти тестовым учеником.' },
      { title: 'Teated', et: 'Kella ikoon üleval näitab uusi kodutöid, sõnumeid ja muudatusi.', ru: 'Колокольчик вверху: новые домашки, сообщения и изменения.' },
    ],
  },
  {
    id: 'people', title: 'Õpilased, vanemad ja grupid', ru: 'Ученики, родители и группы',
    items: [
      { title: 'Õpilased', to: '/students', et: 'Kõik sinu õpilased. Kaardil on kontaktid, keel ja tase, õpitee (järgmine tund), oskuste profiil, tundide analüüs, sõnavara ja töölehed.', ru: 'Все твои ученики. В карточке: контакты, уровень, учебный путь (следующий урок), профиль навыков, анализ уроков, словарь и листы.',
        steps: ['Otsi õpilast nime järgi üleval otsingus.', 'Vahekaardil „Õpitee” näed, mis tund on järgmine.', '„Tunnianalüüs” näitab salvestatud tunni kokkuvõtet: kui palju õpilane rääkis, vead ja soovitused.', '„Sõnad” on õpilase isiklik sõnavara, mida ta harjutab kaartidega.'] },
      { title: 'Lapsevanemad', to: '/parents', et: 'Vanemate kontaktid ja seos lastega. Vanem näeb oma lapse tunde, kodutöid ja arveid.', ru: 'Контакты родителей и связь с детьми. Родитель видит уроки, домашки и счета ребёнка.' },
      { title: 'Grupid', to: '/groups', et: 'Grupi koosseis, õpetaja ja iganädalane tunniplaan. Grupitund toimub Live Classroomis kuni nelja õpilasega.', ru: 'Состав группы, учитель и расписание. Групповой урок в Live Classroom — до 4 учеников.' },
      { title: 'Uued kontod', to: '/accounts', admin: true, et: 'Iseregistreerunud õpilased ja vanemad saavad ligipääsu alles pärast administraatori kinnitust.', ru: 'Самостоятельно зарегистрированные получают доступ только после подтверждения админом.' },
      { title: 'Päringud', to: '/leads', et: 'Kodulehe registreerumised ja tasemetesti tulemused ühes järjekorras.', ru: 'Заявки с сайта и результаты теста уровня в одной очереди.' },
    ],
  },
  {
    id: 'calendar', title: 'Kalender ja tunniplaan', ru: 'Календарь и расписание',
    items: [
      { title: 'Kalender', to: '/calendar', et: 'Tundide lisamine, muutmine ja kordumine. Värvid näitavad sinu saadavust: punane aeg on blokeeritud.', ru: 'Добавление, изменение и повторение уроков. Цвета показывают доступность: красное время занято.',
        steps: ['Klõpsa vabale ajale ja vali õpilane või grupp.', 'Korduva tunni jaoks vali „kordub iga nädal”.', 'Kui paned oma tunni punasele ajale, küsib süsteem kinnitust — see on lubatud ainult sinu enda tunnile.', 'Pärast tundi märgi tund toimunuks; sellest sõltuvad aruandlus ja arved.'] },
      { title: 'Google’i kalender', to: '/settings', et: 'Kui ühendad Google’i kalendri, ilmuvad KeeleSepa tunnid ka sinu telefoni kalendrisse.', ru: 'Подключи Google-календарь — уроки KeeleSepp появятся и в телефоне.' },
      { title: 'Ülesanded', to: '/tasks', et: 'Meeskonna ülesanded, tähtajad ja arutelu (näiteks „helista vanemale”, „valmista test”).', ru: 'Задачи команды, сроки и обсуждение.' },
    ],
  },
  {
    id: 'live', title: 'Tund otse: Live Classroom', ru: 'Урок онлайн: Live Classroom',
    items: [
      { title: 'Kutse ja ühendus', to: '/live-classroom', et: 'Vali õpilane ja vajuta „Kutsu õpilane tundi”. Õpilane näeb kutset kohe ekraanil ja vajutab „Liitu tunniga”. Kutse kehtib 2 minutit; kui õpilane ei jõua, saada uus.', ru: 'Выбери ученика и нажми «Kutsu õpilane tundi». Ученик видит приглашение и нажимает «Liitu tunniga». Действует 2 минуты — если не успел, отправь новое.' },
      { title: 'Video, heli ja ekraan', et: 'Toas on video, mikrofon, ekraani jagamine ja seadmete valik. Kõne tööriistariba on üleval.', ru: 'В комнате видео, микрофон, демонстрация экрана и выбор устройств — панель вверху.' },
      { title: 'Tahvel', et: 'Ühine tahvel: pliiats, marker, kujundid, tekst, kleepmärkmed, pildid ja PDF. Suumi puuteplaadiga kahe sõrmega; liigu käe-tööriistaga.', ru: 'Общая доска: ручка, маркер, фигуры, текст, стикеры, картинки и PDF. Масштаб — двумя пальцами на тачпаде, перемещение — рукой.' },
      { title: 'Tööleht tahvlil', et: 'Ava „Töölehed” ja vali tunni leht. Näed õpilase vastuseid reaalajas, ✓ ja ✗ ilmuvad kohe. Saad avada ülesandeid ükshaaval, näidata õigeid vastuseid ja lisada lehele märkusi.', ru: '«Töölehed» → выбери лист урока. Ответы ученика видны сразу, ✓ и ✗ появляются мгновенно. Можно открывать задания по одному, показывать правильные ответы и делать пометки.',
        steps: ['Klõpsa ülesandel — see süttib ka õpilase lehel.', '„Samm-sammult” režiimis avad ülesandeid ükshaaval.', 'Märgi tekst või vastus, et lisada viga või kommentaar — õpilane näeb seda kohe.'] },
      { title: 'Paranda lehte tunni ajal', et: 'Kui ülesandes on viga, vajuta „Paranda lehte” ja tee tekstil topeltklõps. Parandus läheb ainult selle õpilase lehele ja ta näeb seda kohe.', ru: 'Если в задании ошибка — «Paranda lehte» и двойной клик по тексту. Исправление только у этого ученика и сразу видно.' },
      { title: 'Sõnad ja materjalid', et: '„Sõnad” paneelil lisad tunni sõnu õpilase sõnavarasse. „Materjalid” toob tahvlile pildid, PDF-id ja Õppevara.', ru: 'Панель «Sõnad» — добавляешь слова урока в словарь ученика. «Materjalid» — картинки, PDF и Õppevara на доску.' },
      { title: 'Salvestus ja tunnianalüüs', et: 'Kui õpilane on andnud nõusoleku, saad tunni salvestada. Pärast tundi tehakse tekst ja analüüs: kui palju õpilane rääkis, tüüpilised vead ja soovitused.', ru: 'Если ученик дал согласие — урок можно записать. После урока: текст и анализ (сколько говорил ученик, ошибки, советы).' },
      { title: 'Grupitund ja tunni lõpp', et: 'Grupitunnis kutsud mitu õpilast samasse tuppa. Tunni lõpus saad anda kodutöö ja kalender pakub tunni märkimist toimunuks.', ru: 'В групповом уроке — несколько учеников в одной комнате. В конце — домашка и отметка урока в календаре.' },
    ],
  },
  {
    id: 'library', title: 'Õppevara ja töölehed', ru: 'Учебные материалы и листы',
    items: [
      { title: 'Kursused ja tunnid', to: '/library', et: 'Valmis õpiteed: A2 → B1, B1 → B2 ja B2 → C1. Igal tunnil on kolm töölehte: Avasta, Harjuta ja Kasuta (40–55 minutit).', ru: 'Готовые курсы A2→B1, B1→B2, B2→C1. У каждого урока три листа: Avasta, Harjuta, Kasuta (40–55 мин).' },
      { title: 'Töölehe konstruktor', et: 'Lehte saab muuta: „✎ Muuda lehte”, siis topeltklõps tekstil. Lisa ülesandeid, pilte ja kuulamise heli (eesti hääled). „Hinda EKI-ga” näitab teksti taset.', ru: 'Лист можно менять: «✎ Muuda lehte», двойной клик по тексту. Добавляй задания, картинки и аудио (эстонские голоса). «Hinda EKI-ga» показывает уровень текста.' },
      { title: 'Õpiku vaade ja PDF', et: 'Töölehed saab välja printida või salvestada PDF-ina.', ru: 'Листы можно распечатать или сохранить в PDF.' },
    ],
  },
  {
    id: 'homework', title: 'Kodutööd', ru: 'Домашние задания',
    items: [
      { title: 'Kodutööd', to: '/homework', et: 'Määra õpilasele tööleht või ülesanne. Õpilane täidab selle telefonis või arvutis; näed vastuseid, tulemust ja saad lisada märkusi.', ru: 'Задай ученику лист или задание. Он выполняет на телефоне или компьютере; ты видишь ответы, результат и можешь оставить пометки.' },
    ],
  },
  {
    id: 'communication', title: 'Suhtlus', ru: 'Общение',
    items: [
      { title: 'Suhtlus', to: '/messages', et: 'Sõnumid õpilaste, vanemate ja kolleegidega ühes kohas. Lugemata sõnumite arv on menüüs.', ru: 'Сообщения ученикам, родителям и коллегам. Непрочитанные — в меню.' },
    ],
  },
  {
    id: 'money', title: 'Arved ja raha', ru: 'Счета и деньги', finance: true,
    items: [
      { title: 'Finantsid', to: '/finance', finance: true, et: 'Kuu vaade: tunnid, arved ja laekumised. Arve juures on näha saatmise olek (saatmata, saadetud, meeldetuletus). Vale arve saab tühistada põhjendusega (vähemalt 10 märki).', ru: 'Месяц: уроки, счета и оплаты. У счёта виден статус отправки. Ошибочный счёт можно отменить с причиной (от 10 символов).' },
      { title: 'Palk ja kulud', to: '/finance/payroll', admin: true, et: 'Tööaeg, tunnitasu ja kulude register (administraatorile).', ru: 'Рабочее время, ставка и расходы (для админа).' },
    ],
  },
  {
    id: 'student-view', title: 'Mida näeb õpilane', ru: 'Что видит ученик',
    items: [
      { title: 'Minu õpingud', et: 'Õpilane näeb oma tunde, kodutöid, tahvlit ja sõnu. Tema abiline (lemmikloom) tutvustab menüüd ja tuletab meelde kodutöid.', ru: 'Ученик видит свои уроки, домашки, доску и слова. Помощник-питомец показывает меню и напоминает о домашках.' },
      { title: 'Topeltklõps sõnal', et: 'Kui õpilane teeb töölehel sõnal topeltklõpsu, näeb ta sõna põhivorme ja tõlget ning sõna lisandub tema sõnavarasse.', ru: 'Двойной клик по слову в листе — ученик видит основные формы и перевод, слово сохраняется в его словарь.' },
      { title: 'Proovi ise', to: '/settings', admin: true, et: 'Administraator saab Seadetes avada „Ava testõpilasena” ja proovida kõike õpilase silmadega.', ru: 'Админ: Seaded → «Ava testõpilasena» и попробовать всё глазами ученика.' },
    ],
  },
];

// what this user may see: admin-only and finance-only items are hidden from other roles
export function visibleGuide(roles = []) {
  const admin = roles.includes('admin');
  const finance = admin || roles.includes('finance');
  return GUIDE_SECTIONS
    .filter((section) => !section.finance || finance)
    .map((section) => ({ ...section, items: section.items.filter((item) => (!item.admin || admin) && (!item.finance || finance)) }))
    .filter((section) => section.items.length);
}

// search over titles and both languages
export function searchGuide(sections, query = '') {
  const q = String(query).trim().toLocaleLowerCase('et');
  if (!q) return sections;
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => [item.title, item.et, item.ru, ...(item.steps || [])].join(' ').toLocaleLowerCase('et').includes(q)) }))
    .filter((section) => section.items.length);
}
