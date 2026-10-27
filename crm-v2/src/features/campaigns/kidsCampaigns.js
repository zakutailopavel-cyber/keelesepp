// Three Sunday group campaigns for children (owner 2026-10-28: „3 кампании под 5–6, 6–7 и 8–9 лет с описанием учёбы,
// обложками для постов, текстами и всем остальным, чтобы завтра на собрании с админом обговорить”).
// Proposals to confirm at the meeting: time, price, place, teacher, start. Covers: public/campaign-art/kids-*.png
// (built by scripts/campaign-covers.mjs). Prices follow „Ärinäitajad”: a group of 5 × 12–15 € against a teacher's
// 10–12 € an hour.

const PHONE = '+372 5434 4155';
const EMAIL = 'info@epkoolitus.ee';
const art = (age, format, lang) => `/campaign-art/kids-${age}-${format}-${lang}.png`;
const steps = (list) => list.map((text) => ({ text, done: false }));

const COMMON_STEPS = [
  'KOOSOLEK: kinnita kellaaeg, hind, koht (klass / Zoom), õpetaja ja alguskuupäev',
  'Loo grupp lehel „Grupid” (5 kohta, vanus) ja seo kampaaniaga',
  'Vali „Grupid → Kellele pakkuda grupitunde” nimekirjast sobiva vanusega lapsed ja anna admini kõnedeks',
  'Paranda postitustes [koht] ja vajadusel hind / kellaaeg',
  'Postita Facebooki ja Instagrami (ET + RU), pilt kaasa',
  'Saada WhatsAppi sõnum olemasolevatele peredele',
  'Lisa kodulehele õppekava kirjeldus',
  'Paneta proovitunnid kalendrisse, märgi „Registreerunud”',
  '5 päeva enne algust: meeldetuletus „viimased kohad” + story',
  'Kui 3 last on koos — kinnita grupp ja saada peredele arve',
];

export const KIDS_CAMPAIGNS = {
  kids56: {
    label: 'Eelkool 5–6 a',
    campaign: {
      title: 'Eelkool pühapäeviti (5–6-aastased)',
      kind: 'offer', status: 'preparing',
      startDate: '2026-11-01', endDate: '2026-11-15',
      audience: '5–6-aastased lapsed (lasteaia vanem rühm), peamiselt vene keelt kõnelevad pered, kes tahavad, et laps läheks kooli eesti keelega julgelt.',
      offer: 'ETTEPANEK (kinnitada): pühapäeviti kell 10.00–10.45, 1 kord nädalas, grupp 3–5 last. 12 € tund / 48 € kuus (4 tundi). Esimene tund proovitund tasuta. Algus 15.11.2026. Koht: [koht].',
      goal: 'Komplekteerida 1 grupp (5 last) 15. novembriks; vähemalt 3 last, et alustada.',
      targetSignups: 5, budgetCents: 5000,
      channels: ['facebook', 'instagram', 'whatsapp', 'website'],
      checklist: steps(COMMON_STEPS),
      notes: `ÕPPEKAVA / ПРОГРАММА (3 kuud, 12 tundi × 45 min)
Цель: ребёнок без страха понимает и говорит простое по-эстонски, знает буквы и звуки, готов к подготовительному году.
Темы: 1) Tere! Mina olen… 2) Värvid 3) Numbrid 1–10 4) Minu pere 5) Mänguasjad 6) Loomad 7) Toit 8) Riided ja ilm 9) Keha 10) Tähed A–M 11) Tähed N–Ü 12) Pidu: esinemine vanematele.
Урок: песенка-приветствие 5 мин → новые слова с картинками 10 → игра 10 → подвижная игра 5 → рабочий лист/поделка 10 → круг «что мы узнали» 5.
Через 3 месяца: понимает 20+ простых инструкций (istu, võta, näita, joonista), ~120 слов, считает до 10, говорит «Mina olen…, Mul on…, Mulle meeldib…», узнаёт буквы.
Родителям: после каждого урока — короткий отчёт и песенка/слова для дома (кабинет KeeleSepp).

ОБСУДИТЬ НА СОБРАНИИ: время 10:00? цена 12 €/45 мин (48 €/мес)? место (класс или Zoom — для 5–6 лучше очно)? учитель (Ангелина / Лиза)? старт 15.11? минимум 3 ребёнка? кто ведёт обзвон и сторис?
ЭКОНОМИКА: 5 детей × 12 € = 60 € за урок 45 мин; учитель ~8–9 € → школе ~51 € за урок (~200 € в месяц с группы). При 3 детях — ~27 € за урок.
КОНТАКТЫ В ПОСТАХ: ${PHONE}, ${EMAIL}.`,
      posts: [
        { channel: 'facebook', lang: 'et', postDate: '2026-11-01', imageUrl: art('56', 'square', 'et'), imageNote: 'Ruut 1080×1080 (ET).', text: `🎒 Eelkool pühapäeviti — eesti keel mänguga 5–6-aastastele

Laps läheb varsti kooli? Aitame tal alustada julgelt eesti keeles!

✅ Väike grupp — kuni 5 last
✅ Pühapäeviti kell 10.00, 45 minutit
✅ Mängud, laulud, pildid ja meisterdamine
✅ Tähed ja häälikud, numbrid 1–10, värvid, pere, loomad
✅ Pärast iga tundi lühike kokkuvõte vanematele

Esimene tund on proovitund — tasuta.
Algus 15. novembril. Hind 48 € kuus (4 tundi).
Kohti on ainult 5!

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-01', imageUrl: art('56', 'square', 'ru'), imageNote: 'Квадрат 1080×1080 (RU).', text: `🎒 Подготовишка по воскресеньям — эстонский в игре для детей 5–6 лет

Ребёнок скоро пойдёт в школу? Поможем начать уверенно на эстонском!

✅ Маленькая группа — до 5 детей
✅ По воскресеньям в 10:00, 45 минут
✅ Игры, песни, картинки и поделки
✅ Буквы и звуки, счёт до 10, цвета, семья, животные
✅ После каждого занятия — короткий отчёт для родителей

Первое занятие — пробное и бесплатное.
Старт 15 ноября. Стоимость 48 € в месяц (4 занятия).
Мест всего 5!

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'instagram', lang: 'et', postDate: '2026-11-02', imageUrl: art('56', 'square', 'et'), imageNote: 'Ruut (ET).', text: `Eelkool pühapäeviti 🎒
Eesti keel mänguga 5–6-aastastele · grupp kuni 5 last · proovitund tasuta.
Algus 15.11 · registreeru DM-is või ${PHONE} ✨
#eestikeel #eelkool #lasteaed #kooliks #keelesepp` },
        { channel: 'instagram', lang: 'ru', postDate: '2026-11-02', imageUrl: art('56', 'square', 'ru'), imageNote: 'Квадрат (RU).', text: `Подготовишка по воскресеньям 🎒
Эстонский в игре для детей 5–6 лет · группа до 5 детей · пробное занятие бесплатно.
Старт 15.11 · запись в директ или ${PHONE} ✨
#эстонскийязык #подготовкакшколе #эстонскийдлядетей #keelesepp` },
        { channel: 'whatsapp', lang: 'ru', postDate: '2026-11-03', imageUrl: art('56', 'story', 'ru'), imageNote: 'Вертикаль 1080×1920 — можно приложить к сообщению или в статус.', text: `Здравствуйте! Это школа KeeleSepp 😊
Открываем группу «Подготовишка» для детей 5–6 лет: эстонский язык в игре, по воскресеньям в 10:00, 45 минут, до 5 детей в группе. Буквы, звуки, счёт, песни и поделки — без стресса.
Первое занятие бесплатное, старт 15 ноября, 48 € в месяц.
Если интересно — ответьте «Да», и мы забронируем место для вашего ребёнка.` },
        { channel: 'whatsapp', lang: 'et', postDate: '2026-11-03', imageUrl: art('56', 'story', 'et'), imageNote: 'Püstine 1080×1920.', text: `Tere! Siin KeeleSepp 😊
Avame eelkooli grupi 5–6-aastastele: eesti keel mänguga, pühapäeviti kell 10.00, 45 minutit, kuni 5 last. Tähed, häälikud, numbrid, laulud ja meisterdamine.
Esimene tund on tasuta, algus 15. novembril, 48 € kuus.
Kui huvi on, vastake „Jah” — broneerime lapsele koha.` },
        { channel: 'website', lang: 'et', postDate: '2026-11-01', imageUrl: art('56', 'square', 'et'), imageNote: 'Kodulehe kaart / bänner.', text: `Eelkool pühapäeviti (5–6 a)
Eesti keel mänguga lastele, kes lähevad peagi kooli. Väike grupp (kuni 5 last), 45 minutit, pühapäeviti kell 10.00.

Mida õpime 3 kuuga: tervitamine ja enda tutvustamine, värvid, numbrid 1–10, pere, mänguasjad, loomad, toit, riided ja ilm, keha, tähed ja häälikud. Viimases tunnis väike esinemine vanematele.
Tunni käik: laul, uued sõnad piltidega, mäng, liikumine, tööleht või meisterdamine, kokkuvõte.
Tulemus: laps saab aru lihtsatest korraldustest, teab umbes 120 sõna, loeb kümneni ja oskab rääkida endast lihtsate lausetega.

Hind 48 € kuus (4 tundi). Proovitund tasuta. Registreerimine: ${PHONE}, ${EMAIL}.` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-10', imageUrl: art('56', 'story', 'ru'), imageNote: 'Сторис / напоминание.', text: `⏰ Последние места в «Подготовишке» для детей 5–6 лет!
Старт уже в это воскресенье, 15 ноября, в 10:00. Первое занятие бесплатно.
Запись: ${PHONE}` },
      ],
    },
  },

  kids67: {
    label: 'Kooliks valmis 6–7 a',
    campaign: {
      title: 'Kooliks valmis pühapäeviti (6–7-aastased)',
      kind: 'offer', status: 'preparing',
      startDate: '2026-11-01', endDate: '2026-11-15',
      audience: '6–7-aastased: lasteaia viimane aasta ja 1. klassi alustajad; pered, kelle laps läheb eesti kooli või eesti keele tundi ja vajab tuge lugemises, kirjutamises ja klassi keeles.',
      offer: 'ETTEPANEK (kinnitada): pühapäeviti kell 11.00–12.00, 1 kord nädalas, grupp 3–5 last. 15 € tund / 60 € kuus (4 tundi). Esimene tund proovitund tasuta. Algus 15.11.2026. Koht: [koht].',
      goal: 'Komplekteerida 1 grupp (5 last) 15. novembriks; vähemalt 3 last, et alustada.',
      targetSignups: 5, budgetCents: 5000,
      channels: ['facebook', 'instagram', 'whatsapp', 'website'],
      checklist: steps(COMMON_STEPS),
      notes: `ÕPPEKAVA / ПРОГРАММА (3 kuud, 12 tundi × 60 min)
Цель: ребёнок готов к 1 классу на эстонском — понимает учителя, читает слоги и короткие слова, пишет печатные буквы, говорит полными предложениями.
Темы: 1) Kool ja klass (классные команды) 2) Minu päev 3–6) Tähed ja häälikud → silbid → lühikesed sõnad 7) Numbrid 1–20, pluss/miinus, rohkem/vähem 8) Päevad ja nädal 9) Aastaajad 10) Muinasjutt: kuulame ja jutustame 11) Pildi kirjeldamine 12) «Minu esimene raamat» — показ родителям.
Урок: приветствие и календарь 5 мин → звук/буква дня 15 → чтение слогов и слов 10 → игра с числами 10 → письмо в тетради 10 → история или рассказ по картинке 10.
Через 3 месяца: читает слоги и короткие слова, пишет своё имя и все буквы, понимает 20+ классных инструкций (avage vihik, kirjutage, kuulake…), отвечает полными предложениями, ~250 слов.
Родителям: отчёт после урока и маленькое домашнее задание 10 минут в кабинете KeeleSepp.

ОБСУДИТЬ НА СОБРАНИИ: время 11:00? цена 15 €/60 мин (60 €/мес)? место? учитель? нужна ли тетрадь/пропись (кто печатает)? старт 15.11? минимум 3 ребёнка?
ЭКОНОМИКА: 5 детей × 15 € = 75 € за урок; учитель 10–12 € → школе ~63 € за урок (~250 € в месяц с группы). При 3 детях — ~33 €.
КОНТАКТЫ В ПОСТАХ: ${PHONE}, ${EMAIL}.`,
      posts: [
        { channel: 'facebook', lang: 'et', postDate: '2026-11-01', imageUrl: art('67', 'square', 'et'), imageNote: 'Ruut 1080×1080 (ET).', text: `✏️ Kooliks valmis — eesti keel 6–7-aastastele pühapäeviti

Laps alustab peagi 1. klassi? Aitame tal mõista õpetajat, lugeda ja kirjutada eesti keeles!

✅ Väike grupp — kuni 5 last
✅ Pühapäeviti kell 11.00, 60 minutit
✅ Tähed ja häälikud → silbid → esimesed sõnad
✅ Kirjutamine vihikusse, numbrid 1–20
✅ Klassi keel: „avage vihik”, „kuulake”, „kirjutage”
✅ Pärast iga tundi kokkuvõte ja väike kodutöö (10 min)

Esimene tund on proovitund — tasuta.
Algus 15. novembril. Hind 60 € kuus (4 tundi).

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-01', imageUrl: art('67', 'square', 'ru'), imageNote: 'Квадрат 1080×1080 (RU).', text: `✏️ Готов к школе — эстонский для детей 6–7 лет по воскресеньям

Ребёнок скоро идёт в 1 класс? Поможем понимать учителя, читать и писать по-эстонски!

✅ Маленькая группа — до 5 детей
✅ По воскресеньям в 11:00, 60 минут
✅ Буквы и звуки → слоги → первые слова
✅ Письмо в тетради, счёт до 20
✅ Язык класса: «avage vihik», «kuulake», «kirjutage»
✅ После каждого урока — отчёт и маленькое домашнее задание (10 минут)

Первое занятие — пробное и бесплатное.
Старт 15 ноября. Стоимость 60 € в месяц (4 занятия).

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'instagram', lang: 'et', postDate: '2026-11-02', imageUrl: art('67', 'square', 'et'), imageNote: 'Ruut (ET).', text: `Kooliks valmis ✏️
Eesti keel 6–7-aastastele: lugemine, kirjutamine, klassi keel · kuni 5 last · proovitund tasuta.
Algus 15.11 · DM või ${PHONE}
#eestikeel #1klass #kooliks #lugemaõppimine #keelesepp` },
        { channel: 'instagram', lang: 'ru', postDate: '2026-11-02', imageUrl: art('67', 'square', 'ru'), imageNote: 'Квадрат (RU).', text: `Готов к школе ✏️
Эстонский для детей 6–7 лет: чтение, письмо, язык класса · до 5 детей · пробное бесплатно.
Старт 15.11 · директ или ${PHONE}
#эстонскийязык #первоклассник #подготовкакшколе #keelesepp` },
        { channel: 'whatsapp', lang: 'ru', postDate: '2026-11-03', imageUrl: art('67', 'story', 'ru'), imageNote: 'Вертикаль 1080×1920.', text: `Здравствуйте! Это школа KeeleSepp 😊
Открываем группу «Готов к школе» для детей 6–7 лет: по воскресеньям в 11:00, 60 минут, до 5 детей. Учим понимать учителя по-эстонски, читать слоги и слова, писать буквы, считать до 20.
Первое занятие бесплатное, старт 15 ноября, 60 € в месяц.
Если интересно — ответьте «Да», и мы забронируем место.` },
        { channel: 'whatsapp', lang: 'et', postDate: '2026-11-03', imageUrl: art('67', 'story', 'et'), imageNote: 'Püstine 1080×1920.', text: `Tere! Siin KeeleSepp 😊
Avame grupi „Kooliks valmis” 6–7-aastastele: pühapäeviti kell 11.00, 60 minutit, kuni 5 last. Õpime mõistma õpetajat, lugema silpe ja sõnu, kirjutama tähti ja lugema kahekümneni.
Esimene tund on tasuta, algus 15. novembril, 60 € kuus.
Kui huvi on, vastake „Jah” — broneerime koha.` },
        { channel: 'website', lang: 'et', postDate: '2026-11-01', imageUrl: art('67', 'square', 'et'), imageNote: 'Kodulehe kaart / bänner.', text: `Kooliks valmis (6–7 a)
Eesti keel lastele, kes alustavad peagi 1. klassi. Väike grupp (kuni 5 last), 60 minutit, pühapäeviti kell 11.00.

Mida õpime 3 kuuga: klassi keel ja õpetaja korraldused, minu päev, tähed ja häälikud, silbid ja lühikesed sõnad, kirjutamine vihikusse, numbrid 1–20, nädalapäevad ja aastaajad, muinasjutu kuulamine ja jutustamine, pildi kirjeldamine. Lõpus „Minu esimene raamat”.
Tunni käik: tervitus ja kalender, päeva häälik ja täht, lugemine, numbrimäng, kirjutamine, jutt või pilt.
Tulemus: laps loeb silpe ja lühikesi sõnu, kirjutab oma nime ja tähti, saab aru vähemalt 20 klassi korraldusest ja vastab tervete lausetega.

Hind 60 € kuus (4 tundi). Proovitund tasuta. Registreerimine: ${PHONE}, ${EMAIL}.` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-10', imageUrl: art('67', 'story', 'ru'), imageNote: 'Сторис / напоминание.', text: `⏰ Последние места в группе «Готов к школе» (6–7 лет)!
Старт в воскресенье, 15 ноября, в 11:00. Первое занятие бесплатно.
Запись: ${PHONE}` },
      ],
    },
  },

  kids89: {
    label: 'Eesti keel 8–9 a',
    campaign: {
      title: 'Eesti keel 2.–3. klassile pühapäeviti (8–9-aastased)',
      kind: 'offer', status: 'preparing',
      startDate: '2026-11-01', endDate: '2026-11-15',
      audience: '8–9-aastased (2.–3. klass): lapsed eesti koolis või eesti keele tunnis, kes vajavad tuge lugemises, kirjutamises ja rääkimises; vene keelt kõnelevad pered.',
      offer: 'ETTEPANEK (kinnitada): pühapäeviti kell 12.15–13.15, 1 kord nädalas, grupp 3–5 last. 15 € tund / 60 € kuus (4 tundi). Esimene tund proovitund tasuta. Algus 15.11.2026. Koht: [koht].',
      goal: 'Komplekteerida 1 grupp (5 last) 15. novembriks; vähemalt 3 last, et alustada.',
      targetSignups: 5, budgetCents: 5000,
      channels: ['facebook', 'instagram', 'whatsapp', 'website'],
      checklist: steps(COMMON_STEPS),
      notes: `ÕPPEKAVA / ПРОГРАММА (3 kuud, 12 tundi × 60 min)
Цель: ребёнок уверенно читает и понимает школьные тексты, пишет связный короткий рассказ, не боится говорить; меньше стресса с домашними заданиями.
Темы: 1) Minu kool 2) Sõbrad ja mängud 3) Hobid 4) Linn ja tee kooli 5) Loodus ja loomad 6) Raamatud ja lood 7) Pühad (jõulud) 8) Söök ja tervis 9) Ilm ja aastaajad 10) Minu pere ja kodu 11) Projekt «Minu lemmikloom / hobi» 12) Esitlus vanematele.
Грамматика по-детски: ainsus ja mitmus; kus? kuhu? kust?; olevik ja lihtminevik (eile ma …); küsisõnad.
Урок: разговор-разминка 5 мин → чтение текста ~150 слов + вопросы 15 → грамматика в игре 10 → письмо 5–7 предложений 15 → мини-выступление 10 → итог 5.
Через 3 месяца: читает текст ~150 слов и отвечает на вопросы, пишет рассказ из 5–7 предложений, использует вопросы и прошедшее время, выступает 1 минуту.
Родителям: отчёт после урока; по просьбе — помощь со школьным заданием недели.

ОБСУДИТЬ НА СОБРАНИИ: время 12:15? цена 15 €/60 мин? место? учитель? брать ли задания из школы детей? старт 15.11? минимум 3 ребёнка?
ЭКОНОМИКА: 5 детей × 15 € = 75 € за урок; учитель 10–12 € → школе ~63 € за урок (~250 € в месяц с группы).
ВСЕ ТРИ ГРУППЫ ВМЕСТЕ (по 5 детей): ~700 € в месяц школе сверх зарплаты учителя — покрывает больше половины постоянных расходов (1 150 €).
КОНТАКТЫ В ПОСТАХ: ${PHONE}, ${EMAIL}.`,
      posts: [
        { channel: 'facebook', lang: 'et', postDate: '2026-11-01', imageUrl: art('89', 'square', 'et'), imageNote: 'Ruut 1080×1080 (ET).', text: `📚 Eesti keel 2.–3. klassile — pühapäeviti

Kas lapsel on koolis eesti keelega raske? Lugemine, kirjutamine ja rääkimine muutuvad meil julgemaks!

✅ Väike grupp — kuni 5 last (8–9 a)
✅ Pühapäeviti kell 12.15, 60 minutit
✅ Tekstide lugemine ja mõistmine
✅ Lausete ja lühikese jutu kirjutamine
✅ Grammatika mänguliselt: kus? kuhu? kust?, eile ja täna
✅ Rääkimine ja väike esinemine
✅ Kokkuvõte vanematele pärast iga tundi

Esimene tund on proovitund — tasuta.
Algus 15. novembril. Hind 60 € kuus (4 tundi).

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-01', imageUrl: art('89', 'square', 'ru'), imageNote: 'Квадрат 1080×1080 (RU).', text: `📚 Эстонский для 2–3 класса — по воскресеньям

Ребёнку тяжело с эстонским в школе? У нас чтение, письмо и разговор становятся увереннее!

✅ Маленькая группа — до 5 детей (8–9 лет)
✅ По воскресеньям в 12:15, 60 минут
✅ Читаем и понимаем тексты
✅ Пишем предложения и короткий рассказ
✅ Грамматика в игре: kus? kuhu? kust?, вчера и сегодня
✅ Говорим и выступаем
✅ Отчёт родителям после каждого урока

Первое занятие — пробное и бесплатное.
Старт 15 ноября. Стоимость 60 € в месяц (4 занятия).

📞 ${PHONE} · ✉️ ${EMAIL}` },
        { channel: 'instagram', lang: 'et', postDate: '2026-11-02', imageUrl: art('89', 'square', 'et'), imageNote: 'Ruut (ET).', text: `Eesti keel 2.–3. klassile 📚
Lugemine, kirjutamine ja julge rääkimine · 8–9 a · kuni 5 last · proovitund tasuta.
Algus 15.11 · DM või ${PHONE}
#eestikeel #algkool #eestikeellastele #keelesepp` },
        { channel: 'instagram', lang: 'ru', postDate: '2026-11-02', imageUrl: art('89', 'square', 'ru'), imageNote: 'Квадрат (RU).', text: `Эстонский для 2–3 класса 📚
Чтение, письмо и смелая речь · 8–9 лет · до 5 детей · пробное бесплатно.
Старт 15.11 · директ или ${PHONE}
#эстонскийязык #эстонскийдлядетей #школаэстония #keelesepp` },
        { channel: 'whatsapp', lang: 'ru', postDate: '2026-11-03', imageUrl: art('89', 'story', 'ru'), imageNote: 'Вертикаль 1080×1920.', text: `Здравствуйте! Это школа KeeleSepp 😊
Открываем группу эстонского для детей 8–9 лет (2–3 класс): по воскресеньям в 12:15, 60 минут, до 5 детей. Чтение и понимание текстов, письмо, грамматика в игре, разговор — чтобы в школе было легче.
Первое занятие бесплатное, старт 15 ноября, 60 € в месяц.
Если интересно — ответьте «Да», и мы забронируем место.` },
        { channel: 'whatsapp', lang: 'et', postDate: '2026-11-03', imageUrl: art('89', 'story', 'et'), imageNote: 'Püstine 1080×1920.', text: `Tere! Siin KeeleSepp 😊
Avame eesti keele grupi 8–9-aastastele (2.–3. klass): pühapäeviti kell 12.15, 60 minutit, kuni 5 last. Lugemine ja tekstist arusaamine, kirjutamine, grammatika mänguga ja rääkimine — et koolis oleks kergem.
Esimene tund on tasuta, algus 15. novembril, 60 € kuus.
Kui huvi on, vastake „Jah” — broneerime koha.` },
        { channel: 'website', lang: 'et', postDate: '2026-11-01', imageUrl: art('89', 'square', 'et'), imageNote: 'Kodulehe kaart / bänner.', text: `Eesti keel 2.–3. klassile (8–9 a)
Tugi lastele, kes õpivad eesti koolis või eesti keele tunnis. Väike grupp (kuni 5 last), 60 minutit, pühapäeviti kell 12.15.

Mida õpime 3 kuuga: minu kool, sõbrad, hobid, linn, loodus, raamatud, pühad, söök, ilm, pere. Grammatika lapse moodi: ainsus ja mitmus, kus? kuhu? kust?, olevik ja lihtminevik, küsisõnad. Lõpus projekt ja esinemine vanematele.
Tunni käik: vestlus, teksti lugemine ja küsimused, grammatikamäng, kirjutamine, väike esinemine.
Tulemus: laps loeb umbes 150-sõnalist teksti ja vastab küsimustele, kirjutab 5–7-lauselise jutu ning räägib minuti oma teemal.

Hind 60 € kuus (4 tundi). Proovitund tasuta. Registreerimine: ${PHONE}, ${EMAIL}.` },
        { channel: 'facebook', lang: 'ru', postDate: '2026-11-10', imageUrl: art('89', 'story', 'ru'), imageNote: 'Сторис / напоминание.', text: `⏰ Последние места в группе эстонского для 2–3 класса (8–9 лет)!
Старт в воскресенье, 15 ноября, в 12:15. Первое занятие бесплатно.
Запись: ${PHONE}` },
      ],
    },
  },
};
