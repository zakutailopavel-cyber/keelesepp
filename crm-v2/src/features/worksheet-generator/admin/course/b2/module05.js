// B2 course (B1 → B2 roadmap), module 5 „Arvamus ja põhjendamine” (b1b2-021…025), stage B2-.
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–4. Module goal (the learner): „Ma oskan oma arvamust öelda, põhjendada ja teise arvamusega
// viisakalt arvestada”; module product „Minu seisukoht” (025 Kasuta, the S1 one-minute talk).
// The topic is opinion and argument on real, current and non-divisive Estonian questions of the learner's own life: the
// clock change, the Christmas or New Year tree, a child's screen time, the daily trip to work or school.
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner answers in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 5).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   021 facts    „Kas kella keeramine lõpeb kunagi?”                   health   final present: a 1-minute radio answer (S16)
//   022 debate   „Päris kuusk või kunstkuusk?”                         nature   final decide: a debate with a vote (S17)
//   023 case     „Mitu tundi ekraani on lapsele liiga palju?”          family   final negotiate: three family rules (S17)
//   024 project  „Auto, buss või jalgsi: mis sinu teekond tegelikult maksab?”  money  final plan: my trip card (W15 home)
//   025 exam     Kontroll 5 in Harno B2 form + „Minu seisukoht” as the S1 one-minute talk.
// Grammar line (B12H, roadmap module 5) by discovery and spiralled: certainty and hedging — kindlasti, ilmselt,
// tõenäoliselt, võib-olla, vaevalt (no second negation), ma kahtlen, kas …, fact vs opinion (021; again 023 know box,
// 025); argument connectors with the verb second — esiteks, pealegi, näiteks, seega, järelikult, kokkuvõttes; sest / kuna
// keep the order (022; again 024, 025); concession and softening — kuigi …, (on) siiski / ometi without „aga”, olen
// osaliselt nõus, ma pakuksin, kas poleks parem, kas me võiksime (023; again 024 exam cards, 025); comparison — võrreldes
// + -ga, erinevalt + -st, seevastu, mida … seda, keskvõrre + kui, eelis / puudus (024; previewed in 023, again 025).
// The one long text of the module's teaching lessons is the topic opener (021 station 2, ≈ 340 words, after a 15-minute
// hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids and the goal keys g_vocab / g_read / g_notice / g_use (g_listen added like module 4). The v2 storyline
// version (the debate club, the Kalamaja tram) is in git history before 2026-11-18; the v3 file is in
// archive/v3/b2/module05.js, the v1 file in archive/v1/b2/module05.js.
import { B, tag, teach, withShapes } from '../blocks.js';
import { exitCheck, extension, homeTask, purpose, station } from '../stationBlocks.js';

// a talk with the teacher as the partner, done in the lesson (engine/inLesson.js), not a home recording
const inLesson = (block) => ({ ...block, inLesson: true });
// the lesson's grammar as the small subtitle under the title on every sheet
const grammar = (text) => ({
  discover: { label: '1 Avasta', slot: 1, subtitle: text },
  practice: { label: '2 Harjuta', slot: 2, subtitle: text },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: text },
});
// the home task card at the end of every lesson
const homework = (id, items) => B.phrasebank(id, [['Kodutöö', items]]);
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 5. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

export const MODULE = { id: 'b1b2-module-05', course: 'b2', title: 'Arvamus ja põhjendamine', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-021': {
    title: 'Kas kella keeramine lõpeb kunagi?',
    phases: grammar('Keel: kui kindel ma olen — kindlasti, ilmselt, tõenäoliselt, võib-olla, vaevalt; mulle tundub; ma kahtlen, kas …'),
    format: 'facts',
    topic: 'health',
    canDo: 'Ma eristan tekstis fakti, arvamust ja ennustust ning räägin raadioküsitluses 1 minuti, mida arvan kella keeramisest: näitan, kui kindel ma olen (kindlasti, ilmselt, vaevalt), ja toon kaks põhjust.',
    teacherPage: {
      goal: 'Ученик отличает факт от мнения и прогноза в тексте о переводе часов, выражает степень уверенности (kindlasti, ilmselt, vaevalt, ma kahtlen, kas) и говорит 1 минуту своё мнение для радиоопроса.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и голосование; станция 2 — только слова и абзацы 2–3 текста, остальное дома; станция 3 — шкала уверенности и 4 ответа; станция 4 — опрос один раз и ответ радио без вопросов журналиста.',
      hook: '«В последнее воскресенье октября часы перевели на час назад. Ты заметил? Как ты спал? Голосуем: отменить перевод часов — да, нет, всё равно?» Проголосуйте сами первым одной фразой («Ma olen kindlasti poolt, sest …»), потом ученик. Первые 5 минут не исправлять.',
      plan: [
        '0–4: крючок — голосование «kas kella keeramine tuleks lõpetada?» и одна фраза о своём сне',
        '4–15: станция 1 — разговор: сон после перевода часов, смена, ребёнок, утро или вечер',
        '15–30: станция 2 — слова (2 мин), прогноз «Почему часы до сих пор переводят?», текст темы, 7 высказываний: факт, мнение или прогноз',
        '30–42: станция 3 — заметить в тексте → шкала уверенности → ответить другу так уверенно, как позволяют факты → 4 своих прогноза',
        '42–57: станция 4 — радиоопрос (4 голоса): кто что думает и насколько уверен; свой ответ радио 1–2 минуты',
        '57–69: «Kui aega jääb» — мини-дебаты: летнее или зимнее время навсегда?',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: комментарий 120–150 слов, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Еврокомиссия (публичный опрос 2018: 4,6 млн ответов, 84 % за отмену перевода часов), Европарламент (26.03.2019: 410 за, 192 против), ERR (2018: правительство и комиссия Рийгикогу по делам ЕС за отмену и постоянное летнее время; 28.05.2026: министры Балтии за летнее время, Финляндия — за зимнее, решения в ближайшее время не ждут; исследования связывают перевод часов с риском инфаркта, недосыпом и худшей концентрацией), ERR, «Ratas: kellakeeramise lõpetamist tuleb tõsiselt kaaluda» (2018) и timeanddate.com (Эстония не переводила часы в 2000–2001, вернула летнее время в 2002). Радиоопрос — учебный сценарий.',
      groups: 'Голосование — все сразу, руки. Станция 1 — в парах. Опрос — каждый сам, сверка в паре. Ответ радио: один — журналист с вашими двумя вопросами, другой отвечает; в 1:1 журналист — вы.',
      errors: [
        '«Vaevalt see ei juhtu» → «Vaevalt see juhtub» (vaevalt уже отрицание; второе «ei» меняет смысл).',
        '«Võib olla jääb suveaeg» в значении «может быть» → «Võib-olla jääb suveaeg» (наречие пишется через дефис).',
        '«Ma kahtlen, et …» → «Ma kahtlen, kas …» (после kahtlema — kas).',
        '«Mulle tundub, et 84 % on poolt» → факт не «кажется»: «Küsitluse järgi …», «ERR-i andmetel …»; мнение — «mulle tundub, minu arvates».',
      ],
      notes: [
        'Формат — анализ фактов: в тексте смешаны факты, мнения и прогнозы. Ночная смена: в ночь перевода часов смена длится на час дольше или короче — это главный аргумент уставшего ученика. Маме: режим сна ребёнка. Пенсионеру: часы в доме, лекарства по времени. Студенту: светлые вечера после лекций.',
        'Многие ученики помнят, что в России перевод часов отменили в 2011 году, а в 2014 году перешли на постоянное зимнее время: спросите «Kas see oli sinu arvates hea otsus?» — личный опыт сильнее любого текста.',
        'Обратная связь, 2–3 цели: слово уверенности соответствует фактам; vaevalt без второго отрицания; факт с источником, мнение — с «minu arvates / mulle tundub». На станции 3 сначала подсказка («Kui kindel sa tegelikult oled?»), рекаст — только если ученик не исправил сам.',
      ],
    },
    discover: [
      station(B.text('021_d_hook', 'Kell keerati tagasi', 'Oktoobri viimasel pühapäeval keerati kella tund aega tagasi. Kas märkasid? Kuidas sa sel nädalal magasid? Hääleta: kas kella keeramine tuleks lõpetada — jah, ei või ükskõik? Ütle ka, kui kindel sa oled.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('021_d_talk', 'Minu uni ja kellaaeg.', 'Vasta igale küsimusele ja too üks näide oma elust.', [
        'Kas sinu uni märkab kella keeramist?',
        'Kellele on see kõige raskem: lapsele, vahetustega töötajale või eakale? Miks?',
        'Kumb meeldib sulle rohkem: pikk suveõhtu või valge talvehommik?',
      ], [150, 210], ['Mulle tundub, et …', 'Ma olen kindel, et …', 'Ma ei ole kindel, kas …']), 'Sinu kogemus annab tunni küsimusele esimese näite.'), { task: 'S02', fluency: true }),
      'Üks-ühele: hääletage mõlemad ja rääkige ka ise lühidalt oma unest. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas ja ei teadnud. Kui õpilane töötab öösiti: „Mis juhtus sinu vahetusega sel ööl, kui kella keerati?”')),
      station(tag(B.vocab('021_d_vocab', 'Enne lugemist: sõnad.', ['kella keerama — переводить часы', 'suveaeg — летнее время', 'uni — сон', 'fakt — факт', 'kindlasti — непременно', 'ilmselt — по-видимому', 'tõenäoliselt — вероятно', 'vaevalt — вряд ли', 'kahtlema — сомневаться', 'ennustama — предсказывать']), { topic: ['kella keerama', 'suveaeg'] }), 2, 15),
      B.topicOpener('021_d_open', 'Moodul 5. Kas kella keeramine lõpeb?', [
        'Kaks korda aastas keerame kella: märtsi viimasel pühapäeval tund aega edasi ja oktoobri viimasel pühapäeval tund aega tagasi. Suveaeg annab pikad heledad õhtud, talveaeg ehk tavaline aeg valgemad hommikud. Paljud ei märka muutust üldse, teised magavad pärast seda terve nädala halvasti. Kõige raskem on see väikestele lastele, kes ei tea kellast midagi, ja inimestele, kes töötavad vahetustega: öine vahetus on sel ööl tund aega pikem või lühem. Uuringud seostavad kella keeramist unepuuduse, halvema keskendumise ja isegi suurema infarktiriskiga, sest see segab meie ööpäevarütmi ehk keha sisemist kella.',
        'Euroopa Liit on kella keeramise lõpetamist arutanud juba aastaid. 2018. aastal vastas Euroopa Komisjoni küsitlusele 4,6 miljonit inimest ja 84 protsenti neist soovis kella keeramise lõpetada. Euroopa Parlament hääletas 2019. aasta märtsis samuti lõpetamise poolt. Otsust ei ole aga siiani tehtud, sest riigid ei suuda kokku leppida, kumb aeg jääb: suve- või talveaeg. Lõunas tahetakse pigem pikki suveõhtuid, põhjas valgeid talvehommikuid, ja keegi ei taha, et naabritega tekiks tunnine vahe.',
        'Eesti on proovinud ka ilma kella keeramiseta elada. 2000. ja 2001. aastal kella ei keeratud, kuid 2002. aastal võeti suveaeg tagasi, sest erinev aeg naabritega tegi asjaajamise keeruliseks. Eesti valitsus toetab kella keeramise lõpetamist ja eelistab püsivat suveaega. Soome tahab aga jääda talveajale. Kuna Tallinn ja Helsingi on tihedalt seotud, ei taha Eesti Soomest erinevat aega. Ministrite sõnul ei ole lähiajal otsust oodata.',
        'Mis saab edasi? Mõni ütleb, et kella keeramine kaob kindlasti, sest inimesed on sellest väsinud. Teised kahtlevad, kas kõik riigid kunagi kokku lepivad. Ilmselt keerame kella veel mõne aasta ja vaevalt see muutub enne, kui naabrid on ühel meelel. Tõenäoliselt jääb vaidlus ka pärast otsust: hommikuinimene tahab valgeid hommikuid, õhtuinimene pikki õhtuid. Ja võib-olla on just see kõige parem näide sellest, et ühel küsimusel võib olla mitu head vastust.',
        'Selles moodulis õpid oma arvamust ütlema ja põhjendama: kui kindel sa oled, millised on sinu argumendid, kuidas viisakalt vastu vaielda ja kuidas kahte lahendust võrrelda. Teemad on päris Eesti vaidlused: kellaaeg, jõulukuusk, laste ekraaniaeg ja teekond tööle.',
      ], 'Euroopa Komisjon, avalik konsultatsioon suveaja kohta (2018); Euroopa Parlament, hääletus 26.03.2019; ERR, „Komisjon: Eesti toetab kellakeeramise lõpetamist ja püsivat suveaega” (2018) ja „Kellakeeramise lõppu Eestis pole Soome pärast lähiajal näha” (28.05.2026); ERR, „Ratas: kellakeeramise lõpetamist tuleb tõsiselt kaaluda” (2018), Eesti aeg 2000–2002', [
        'Kas sina hääletaksid suve- või talveaja poolt? Miks?',
        'Mis sa arvad, miks ei ole riigid siiani kokku leppinud?',
        'Kas sinu kodumaal keeratakse kella? Kas see on sinu arvates hea?',
        'Kui kindel sa oled, et Eesti lõpetab kella keeramise kümne aasta jooksul?',
      ]),
      tag(purpose(B.categorize('021_d_kind', 'Fakt, arvamus või ennustus?', 'Loe iga lauset ja otsusta: kas see on kontrollitav fakt, kellegi arvamus või ennustus tuleviku kohta? Pane iga lause õigesse kasti.', [
        ['Fakt', ['Euroopa Parlament hääletas 2019. aastal kella keeramise lõpetamise poolt.', '2000. ja 2001. aastal Eestis kella ei keeratud.', 'Komisjoni küsitluses soovis 84 protsenti vastanutest kella keeramise lõpetada.']],
        ['Arvamus', ['Suveaeg on parem, sest pärast tööd on rohkem valget aega.', 'Kella keeramine on mõttetu vana harjumus.']],
        ['Ennustus', ['Kella keeramine kaob kindlasti, sest inimesed on sellest väsinud.', 'Vaevalt see muutub enne, kui naabrid on ühel meelel.']],
      ], 'full', 'g_read'),'Kui eristad fakti arvamusest, ei lase sa end uudistes ega vaidluses eksitada.'), { task: 'R13' }),
    ],
    practice: [
      station(B.notice('021_p_notice', 'Märka: kui kindel kirjutaja on?', [
        'Tekstist: kella keeramine kaob **kindlasti** · teised **kahtlevad, kas** kõik riigid kokku lepivad · **ilmselt** keerame kella veel mõne aasta · **vaevalt** see muutub · **tõenäoliselt** jääb vaidlus',
        'Kindluse skaala: **kindlasti, kahtlemata** (100 %) → **ilmselt, tõenäoliselt** (umbes 80 %) → **võib-olla, vist** (50 %) → **vaevalt, ma kahtlen, kas …** (umbes 10 %) → **kindlasti mitte** (0 %).',
        '**Vaevalt** on juba eitus: Vaevalt see **muutub**. (mitte: vaevalt see ei muutu)',
        '**Ma kahtlen, kas** … : Ma kahtlen, **kas** riigid kokku lepivad. (mitte: kahtlen, et …)',
        'Lause alguses tuleb tegusõna tavaliselt kohe järele: **Ilmselt keerame** kella veel. **Võib-olla jääb** suveaeg. **võib-olla** = может быть; **võib olla** = может быть чем-то: See **võib olla** hea mõte.',
        'Fakt vajab allikat: **küsitluse järgi, ERR-i andmetel**. Arvamus: **minu arvates, mulle tundub, ma leian**.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.choice('021_p_sure', 'Sõber on liiga kindel.', 'Sõber kirjutab kõike väga kindlalt. Vali vastus, mis sobib faktidega ja on õiges vormis.', [
        ['Fakt: riigid ei ole seitsme aastaga kokku leppinud. Sõber: „Järgmisel aastal enam kella ei keerata!”', 'Vaevalt lõpeb kella keeramine juba järgmisel aastal.', 'Kindlasti lõpeb kella keeramine järgmisel aastal.', 'Vaevalt ei lõpe kella keeramine järgmisel aastal.'],
        ['Fakt: Eesti eelistab suveaega, Soome talveaega. Sõber: „Mis aeg meile lõpuks jääb?”', 'Ma ei ole kindel: võib-olla suveaeg, võib-olla talveaeg.', 'Kindlasti jääb meile talveaeg.', 'Võib olla jääb kindlasti suveaeg.'],
        ['Fakt: 84 protsenti vastanutest soovis lõpetamist. Sõber: „Kella keeramine ei sega kedagi.”', 'Ilmselt segab see paljusid, sest enamik soovis lõpetamist.', 'Vaevalt on keegi kella keeramise vastu.', 'Ma kahtlen, kas keegi küsitlusele üldse vastas.'],
        ['Fakt: uuringud seostavad kella keeramist unepuudusega. Sõber: „Uni ei muutu sellest üldse.”', 'Ma kahtlen, kas see on tõsi: uuringud näitavad muud.', 'Ma kahtlen, et see on tõsi: uuringud näitavad muud.', 'Kindlasti on sul õigus.'],
        ['Fakt: 2000. ja 2001. aastal Eestis kella ei keeratud. Sõber: „Eestis on kella alati keeratud.”', 'Kindlasti mitte: 2000. ja 2001. aastal seda ei tehtud.', 'Ilmselt on sul õigus.', 'Vaevalt ei keeratud.'],
        ['Sa ei tea, mida ministrid järgmisel aastal teevad. Sõber: „Järgmisel aastal tehakse otsus!”', 'Võib-olla räägitakse sellest jälle, aga ma ei ole kindel.', 'Kindlasti tehakse otsus järgmisel aastal.', 'Vaevalt ei räägita sellest.'],
      ], 'full', 'g_notice'), 'Sõber saab vastuse, mis on täpselt nii kindel, kui faktid lubavad.'), { task: 'G13' }),
      'Pärast iga vastust küsi: „Kui kindel sa tegelikult oled? Mis fakt seda näitab?” Kui õpilane valib kahekordse eituse (vaevalt ei …), ütle ainult: „Vaevalt on juba ei.”'),
      tag(purpose(B.writing('021_p_mine', 'Minu ennustused.', 'Kirjuta 4 lauset: mis sinu elus või linnas järgmise viie aasta jooksul kindlasti, ilmselt, võib-olla ja vaevalt muutub. Pane tegusõna kindlussõna järele.', [4, 4], ['kindlasti', 'ilmselt', 'vaevalt'], 2, 'g_notice'), 'Sinu ennustused on esimesed laused sinu raadiovastuseks.'), { task: 'W02', level: 3 }),
    ],
    transfer: [
      station(tag(purpose(B.examListen('021_t_radio', 'Raadio tänavaküsitlus.', 'Kuula kaks korda: mida arvab iga inimene ja kui kindel ta on?', 'choice', [
        'Reporter: Tere! Pühapäeval keerati kella. Küsime möödujatelt: kas kella keeramine tuleks lõpetada?',
        'Mees: Kindlasti! Töötan vahetustega ja eelmisel nädalal kestis minu öine vahetus tund aega kauem. Pärast seda olin kaks päeva nagu udus. Ma ei saa aru, miks me seda ikka veel teeme.',
        'Naine: Mul on kaheaastane laps ja tema ei tea kellast midagi. Ta ärkab nüüd kell viis, mitte kell kuus. Ma arvan, et kella keeramine tuleks lõpetada, aga ilmselt läheb selleks veel aastaid.',
        'Pensionär: Mina olen sellega harjunud, mulle on see ükskõik. Vaevalt see üldse muutub, sellest räägitakse juba kakskümmend aastat. Ma kahtlen, kas poliitikud kunagi kokku lepivad.',
        'Üliõpilane: Mina hääletaksin suveaja poolt. Mulle meeldivad pikad õhtud, siis jõuan pärast loenguid veel õue. Võib-olla on talveaeg tervisele parem, aga ma ei ole selles kindel.',
        'Reporter: Aitäh! Arvamusi on täpselt nii palju kui vastajaid.',
      ], [
        ['Kuidas mõjus kella keeramine vahetustega töötajale?', 'Tema öine vahetus oli tund aega pikem ja ta oli väsinud.', 'Ta ei märganud muutust üldse.', 'Ta jäi selle pärast tööle hiljaks.'],
        ['Kui kindel on vahetustega töötaja, et kella keeramine tuleks lõpetada?', 'täiesti kindel', 'ei ole kindel', 'kahtleb selles'],
        ['Mis muutus väikese lapse ema kodus pärast kella keeramist?', 'Laps ärkab tund aega varem.', 'Laps magab hommikul kauem.', 'Laps ei maga enam lõunaund.'],
        ['Millal lõpeb ema arvates kella keeramine?', 'ilmselt alles mitme aasta pärast', 'kindlasti järgmisel aastal', 'mitte kunagi'],
        ['Mida arvab pensionär poliitikute kokkuleppest?', 'Ta kahtleb, kas nad kunagi kokku lepivad.', 'Ta on kindel, et muutus tuleb kohe.', 'Ta tahab kindlasti talveaega.'],
        ['Miks eelistab üliõpilane suveaega?', 'Ta jõuab pärast loenguid veel õue.', 'Talveaeg on tema arvates kindlasti tervisele halb.', 'Ta ärkab hommikul hea meelega vara.'],
      ], 'g_read'), 'Kuuled, kuidas teised oma arvamust põhjendavad; kohe vastad raadiole ise.'), { voice: 'interview', task: 'L02' }), 4, 15, { final: 'present' }),
      inLesson(teach(tag(purpose(B.speaking('021_t_say', 'Raadio küsib sinult.', 'Reporter peatab sind tänaval. Räägi 1–2 minutit: mida sa kella keeramisest arvad, kui kindel sa oled, kaks põhjust oma elust ja üks kahtlus. Siis vasta reporteri kahele küsimusele.', [
        'Kas kella keeramine tuleks lõpetada? Kui kindel sa oled?',
        'Millised kaks põhjust tulevad sinu elust?',
        'Milles sa kahtled?',
        'Kumb aeg peaks jääma: suve- või talveaeg?',
      ], [120, 180], ['Ma olen kindlasti …', 'Ilmselt …', 'Ma kahtlen, kas …', 'Vaevalt …']), 'Tulemus: sinu arvamus on raadios selge — kuulaja teab, mida sa arvad, miks ja kui kindel sa oled.'), { task: 'S16', main: true, level: 4, harno: 'S1' }),
      'Õpetaja on reporter. Kuula segamata, siis küsi kaks küsimust: 1) „Aga kui Soome jääb talveajale — kas siis ka?” 2) „Kust sa tead, et see on tervisele halb?” (õpilane peab eristama fakti ja arvamust). Õnnestunud, kui on selge seisukoht, vähemalt kolm erinevat kindlussõna (kindlasti, ilmselt, vaevalt, ma kahtlen, kas …), kaks põhjust oma elust ja üks fakt koos allikaga („küsitluse järgi …”).')),
      extension(teach(tag(purpose(B.rolecards('021_t_more', 'Mini-väitlus: suveaeg või talveaeg igaveseks?', 'Vali pool ja veena teist: kumb aeg peaks Eestisse igaveseks jääma?',
        'Sinu pool: püsiv suveaeg.\nArgumendid: pikad heledad õhtud; rohkem aega õues pärast tööd; Eesti valitsus eelistab seda.\nLisa üks näide oma elust.',
        'Sinu pool: püsiv talveaeg.\nArgumendid: valged hommikud; uneuurijate arvates parem ööpäevarütmile; sama aeg Soomega.\nLisa üks näide oma elust.',
        ['Ma olen kindel, et …', 'Ilmselt …', 'Sinu argument on hea, aga …'], ['Ma kahtlen, kas …', 'Vaevalt …', 'Tõenäoliselt …']), 'Kiire väitlus näitab, kas oskad oma kindlust ka vastase ees hoida.'), { task: 'S11', level: 4 }),
      'Kui aega jääb (12 min). Õpilane valib poole, sina võtad teise. Kaks vooru: kumbki 1 minut argumente, siis 3 minutit vaba vaidlust. Takistus: „Soomega erinev aeg — kas see on sinu arvates probleem?” Õnnestunud, kui õpilane ütleb vähemalt ühe kahtluse (ma kahtlen, kas …) ja ühe ennustuse (ilmselt / vaevalt).'), 12),
      tag(exitCheck(purpose(B.gaps('021_t_exit', 'Kontrolli end: kui kindel?', 'Kirjuta lünka kindlussõna: lause alguses on öeldud, kui kindel kõneleja on.', [
        'Kindlus umbes 10 %: riigid ei ole seitsme aastaga kokku leppinud, nii et [vaevalt] tuleb otsus juba sel talvel.',
        'Kindlus 100 %: küsitluse järgi soovis lõpetamist 84 protsenti vastanutest — see on [kindlasti|kahtlemata] suur enamus.',
        'Kahtlus: ma [kahtlen], kas kõik Euroopa riigid kunagi sama kellaaja valivad.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kindlussõnad on käes.')), {}),
      purpose(B.selfcheck('021_t_self', ['Ma räägin, kuidas kella keeramine minu und ja päeva mõjutab.', 'Ma eristan tekstis fakti, arvamust ja ennustust.', 'Ma näitan sõnadega, kui kindel ma olen (kindlasti, ilmselt, vaevalt, ma kahtlen, kas …).', 'Ma ütlen raadiole 1–2 minutiga oma arvamuse ja kaks põhjust.'], 'Arvamus selge', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('021_t_comment', 'Kodus: kommentaar uudise alla.', 'Kirjuta kodus 120–150 sõna uudisportaali kommentaariumisse: kas kella keeramine tuleks lõpetada ja kumb aeg peaks jääma. Too üks fakt koos allikaga, kaks põhjust oma elust ja näita, kui kindel sa oled.', [10, 14], ['kindlasti', 'ilmselt', 'vaevalt'], 2, 'g_use'), 'Teised lugejad näevad, et sinu arvamus põhineb faktidel, mitte ainult tundel.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('021_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks asi sinu linnas või elus, mis järgmise viie aasta jooksul kindlasti muutub, ja üks, mis vaevalt muutub.', [
        'Mis kindlasti muutub ja miks sa selles kindel oled?',
        'Mis vaevalt muutub ja miks?',
      ], [60, 120]), 'Õpetaja kuulab sinu ennustused ja ütleb, kas kindlussõnad on õiges kohas.')), { task: 'S15' }),
      homework('021_t_homework', ['1. Kommentaar uudise alla, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-022': {
    title: 'Päris kuusk või kunstkuusk?',
    phases: grammar('Keel: argumendi ehitus — esiteks, pealegi, näiteks, seega, järelikult, kokkuvõttes; tegusõna teisel kohal'),
    format: 'debate',
    topic: 'nature',
    canDo: 'Ma kuulan väitlust ja panen kirja argumendi osad, väitlen päris ja kunstkuuse üle ning kirjutan arutluse, kus argument on üles ehitatud nii: seisukoht → põhjus → näide → järeldus (esiteks, pealegi, seega).',
    teacherPage: {
      goal: 'Ученик слушает радиодебаты о ёлке, строит аргумент «позиция → причина → пример → вывод» со связками (esiteks, pealegi, seega) и глаголом вторым, спорит и голосует.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и голосование; станция 2 — радио один раз и 4 первых пропуска; станция 3 — правило и 4 предложения; станция 4 — одна карточка-аргумент и голосование без второго раунда.',
      hook: '«Декабрь почти здесь. У тебя дома будет ёлка — к Рождеству или к Новому году? Живая, искусственная или никакой? Поднимите руку и скажите одну причину.» Начните сами: «Meil on kunstkuusk, sest …». Уважительно к обеим традициям: у многих русскоязычных семей это новогодняя ёлка.',
      plan: [
        '0–4: крючок — голосование рукой и одна причина',
        '4–10: станция 1 — разговор: ёлка в детстве и сейчас, кто дома решает',
        '10–25: станция 2 — слова (2 мин), прогноз «Какая ёлка экологичнее?», радиодебаты дважды, мост аргументов: 8 пропусков',
        '25–37: станция 3 — связки и порядок слов: заметить в радио → правило → другу связать мысли (6 предложений) → свой аргумент из 4 предложений',
        '37–52: станция 4 — факты (график Carbon Trust и цены RMK) и 5 ответов противнику фактом, дебаты: два аргумента, вопрос противника, голосование; план рассуждения и 2 первых предложения',
        '52–64: «Kui aega jääb» — мини-дебаты: запретить ли новогодний фейерверк?',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: рассуждение 150–180 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'График: Carbon Trust (Великобритания; BBC, 2016): искусственная ёлка 2 м ≈ 40 кг CO2-экв. (производство), живая ≈ 3,5 кг, если её сожгли или сделали щепу, ≈ 16 кг, если на свалке; искусственную стоит использовать около 10 лет. Цены: RMK, право рубки ели в гослесу (прайс от 07.11.2025: до 1 м — 3 €, 1,1–2 м — 8 €, 2,1–3 м — 13 €), продажа с конца ноября до конца года; ERR: на ёлочных базарах — от 15 €. Радиодебаты — учебный сценарий (Март и Кайди — вымышленные).',
      groups: 'Голосование — все. Радио — каждый сам, сверка в паре. Дебаты: две команды по 1–2 человека, каждая со своей карточкой; вы — ведущий и судья голосования. В 1:1 противник — вы.',
      errors: [
        '«Esiteks, päris kuusk on …» → «Esiteks on päris kuusk …» (без запятой, глагол на втором месте).',
        '«Seega me ostame kunstkuuse» → в письменном тексте «Seega ostame (me) kunstkuuse»: после связки в начале — глагол.',
        '«Sest ta lõhnab hästi.» отдельным предложением → «…, sest ta lõhnab hästi» (sest и kuna не начинают ответ-предложение и не меняют порядок слов).',
        '«Pealegi» в значении «но» → pealegi добавляет аргумент той же стороны; против — aga, kuid.',
      ],
      notes: [
        'Формат — дебаты с голосованием: в конце каждый голосует и говорит, какой аргумент его убедил. Кто без ёлки: «Kas sinu peres on mõni teine traditsioon? Kumba kuuske sa sõbrale soovitaksid?» Маме: безопасность для малыша и кошки; пенсионеру: традиция и запах; студенту: цена и маленькая комната.',
        'Обратная связь, 2–3 цели: глагол после связки; все четыре части аргумента; пример из жизни, а не «sest see on hea». Во время дебатов не перебивать, 3 замечания после голосования.',
      ],
    },
    discover: [
      // the hook is the talk's own first question (the lesson keeps 16 blocks)
      station(inLesson(teach(tag(purpose(B.speaking('022_d_talk', 'Kuusk koju?', 'Detsember on peaaegu käes. Kas sinu kodus on jõulukuusk või uusaastakuusk? Päris, kunstlik või üldse mitte? Hääleta käega ja ütle üks põhjus. Siis vasta küsimustele.', [
        'Milline kuusk oli sinu lapsepõlve kodus ja kes selle tõi?',
        'Kes teie peres otsustab, milline kuusk tuleb?',
        'Mis on sulle kuuse juures kõige tähtsam: lõhn, hind või mugavus?',
      ], [150, 210], ['Meil on …, sest …', 'Esiteks …', 'Minu jaoks on kõige tähtsam …']), 'Sinu enda põhjused on tänase väitluse esimesed argumendid.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise oma pere kuusest. Ära paranda; kirjuta tahvlile õpilase kaks põhjust — need tulevad jaamas 4 tagasi.')), 1, 10),
      station(tag(B.vocab('022_d_vocab', 'Enne kuulamist: sõnad.', ['päris kuusk — живая ёлка', 'kunstkuusk — искусственная ёлка', 'okkad — хвоя', 'lõhn — запах', 'traditsioon — традиция', 'jalajälg — (углеродный) след', 'prügila — свалка', 'otsustama — решать', 'argument — аргумент', 'järeldus — вывод']), { topic: ['kunstkuusk', 'jalajälg'] }), 2, 15),
      tag(purpose(B.listening('022_d_radio', 'Raadioväitlus: kuusk metsast või poest?', 'Kuula kaks korda ja täida argumendisild: kirjuta lünka 1–2 sõna või arv.', [
        'Saatejuht: Tere! Detsembris vaidlevad paljud pered sama küsimuse üle: kas tuua koju päris kuusk või panna üles kunstkuusk? Stuudios on metsandustudeng Mart ja disainipoe omanik Kaidi.',
        'Mart: Mina olen päris kuuse poolt. Esiteks kasvab kuusk Eesti metsas, kunstkuusk aga tuuakse tavaliselt Aasiast. Pealegi on päris kuuse jalajälg väike, kui see tehakse pärast pühi hakkpuiduks. Näiteks saab riigimetsast kahemeetrise kuuse raieõiguse kaheksa euroga. Seega ei ole päris kuusk ka kallis.',
        'Kaidi: Mina arvan teisiti. Hea kunstkuusk teenib perel kümme aastat või kauemgi. Esiteks ei pea igal aastal metsas ega kuuseturul käima. Teiseks ei kuku okkad põrandale ja väikese lapse või koera jaoks on see ohutum. Järelikult on kunstkuusk mugav ja pika aja peale ka mõistlik.',
        'Mart: Aga kunstkuusk on plastist. Kui see visatakse ära juba kolme aasta pärast, on kahju loodusele suur.',
        'Kaidi: Nõus. Seepärast tuleb osta kvaliteetne kuusk ja seda kaua kasutada. Kokkuvõttes oleneb kõik sellest, kui kaua sa oma kuuske kasutad.',
        'Saatejuht: Aitäh! Kuulajad, hääletage meie kodulehel!',
      ], [
        'Mart on [päris kuuse] poolt.',
        'Marti esimene põhjus: kuusk kasvab Eesti [metsas].',
        'Kunstkuusk tuuakse Marti sõnul tavaliselt [Aasiast].',
        'Päris kuuse jalajälg on väike, kui see tehakse pärast pühi [hakkpuiduks].',
        'Marti näide: kahemeetrise kuuse raieõigus maksab riigimetsas [kaheksa|8] eurot.',
        'Kaidi sõnul teenib hea kunstkuusk perel [kümme|10] aastat või kauem.',
        'Kunstkuuse eelis on see, et [okkad] ei kuku põrandale.',
        'Kaidi järeldus: kunstkuusk on [mugav] ja pika aja peale mõistlik.',
      ], 'g_read'), 'Argumendisild näitab, millest koosneb tugev argument; kohe ehitad sama silla ise.'), { voice: 'interview', task: 'L04' }),
    ],
    practice: [
      station(B.notice('022_p_notice', 'Märka: kuidas argument koos püsib?', [
        'Raadiost: **Esiteks kasvab** kuusk Eesti metsas · **Pealegi on** päris kuuse jalajälg väike · **Näiteks saab** riigimetsast … · **Seega ei ole** päris kuusk kallis · **Järelikult on** kunstkuusk mugav',
        'Argumendisild: **seisukoht** (Mina olen … poolt) → **põhjus** (esiteks, teiseks, pealegi, lisaks) → **näide** (näiteks, minu kogemuse põhjal) → **järeldus** (seega, järelikult, seetõttu, kokkuvõttes).',
        'Kui sidesõna on lause alguses, tuleb tegusõna kohe järele: **Seega ei ole** see kallis. **Pealegi kukuvad** okkad maha. (Kõnes kuuled ka „Seega see ei ole …”, kirjas pane tegusõna teiseks.)',
        '**sest** ja **kuna** sõnajärge ei muuda: …, **sest** kuusk **kasvab** Eestis. **Kuna** okkad **kukuvad**, valime kunstkuuse.',
        '**pealegi** lisab sama poole argumendi; **aga, kuid** pööravad vastu.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('022_p_link', 'Sõber valmistub väitluseks.', 'Sõbra märkmetes on kaks mõtet. Kirjuta teine lause nii, et see algab antud sõnaga.', [
        ['Päris kuusk lõhnab metsa järele. → Selle raieõigus on odav.', 'pealegi', 'Pealegi on selle raieõigus odav.|Pealegi on raieõigus odav.'],
        ['Kunstkuusk teenib kümme aastat. → Igal aastal ei pea uut ostma.', 'seega', 'Seega ei pea igal aastal uut ostma.|Seega ei pea igal aastal uut kuuske ostma.|Seega ei pea me igal aastal uut ostma.'],
        ['Päris kuuse okkad kukuvad. → Meil oli jaanuaris kogu põrand okkaid täis.', 'näiteks', 'Näiteks oli meil jaanuaris kogu põrand okkaid täis.|Näiteks oli jaanuaris meil kogu põrand okkaid täis.'],
        ['Kunstkuusk on plastist. → See ei lagune looduses.', 'järelikult', 'Järelikult ei lagune see looduses.'],
        ['Meie kassile meeldib kuuse otsa ronida. → Me valime väikese kunstkuuse.', 'seetõttu', 'Seetõttu valime me väikese kunstkuuse.|Seetõttu valime väikese kunstkuuse.'],
        ['Mõlemal kuusel on head ja halvad küljed. → Kõik oleneb perest.', 'kokkuvõttes', 'Kokkuvõttes oleneb kõik perest.'],
      ], 'full', 'g_notice'), 'Sõbra mõtted on seotud ja sõnajärg õige — tema argument kannab.'), { task: 'G05' }),
      'Kui õpilane kirjutab „Seega see ei ole …”, ära paranda kohe: küsi „Mis sõna tuleb kirjas kohe sidesõna järel?”'),
      tag(purpose(B.writing('022_p_bridge', 'Minu argument.', 'Ehita oma argument 4 lausega: seisukoht, põhjus (esiteks), näide (näiteks) ja järeldus (seega). Sidesõna järel pane tegusõna teisele kohale.', [4, 4], ['esiteks', 'näiteks', 'seega'], 3, 'g_notice'), 'Sinu neljast lausest saab väitluse esimene argument, mille ütled vastasele.'), { task: 'W11', level: 3 }),
    ],
    transfer: [
      station(B.chart('022_t_facts', 'Kuuse jalajälg (kg CO₂ ekvivalenti, 2-meetrine kuusk)', { kind: 'bar', unit: 'kg', series: 'CO₂', rows: ['Kunstkuusk (valmistamine) | 40', 'Päris kuusk prügilas | 16', 'Päris kuusk hakkpuiduks või ahju | 3,5'], source: 'Carbon Trust (Suurbritannia), BBC, 2016' }), 4, 15, { final: 'decide' }),
      B.know('022_t_know', ['Riigimetsast saab jõulukuuse raieõiguse (loa ise üks kuusk maha võtta) osta RMK kaudu novembri lõpust aasta lõpuni. 2025. aasta hinnad olid kuni meetrise kuuse eest 3 eurot, 1,1–2-meetrise eest 8 eurot ja 2,1–3-meetrise eest 13 eurot. Kuuse võib võtta ainult kaardil märgitud kohtadest, näiteks elektriliini alt. Kuuseturul maksab kuusk tavaliselt alates 15 eurost.'], 'RMK jõulukuuskede hinnakiri (07.11.2025); ERR', 'Kas teadsid? Kuusk riigimetsast'),
      tag(purpose(B.table('022_t_evidence', 'Faktid väitluseks.', 'Vastane ütleb midagi. Leia joonisest või kastist fakt, millega vastata, ja kirjuta see lühidalt.', 'Vastane ütleb, Sinu fakt', [
        '„Päris kuusk on kallis, see maksab vähemalt kakskümmend eurot.” | [3–13 eurot/raieõigus 3–13 eurot/8 eurot/riigimetsas 3–13 eurot/15 eurot/alates 15 eurost]',
        '„Kunstkuusk on loodusele alati parem kui päris kuusk.” | [40 kg/kunstkuusk 40 kg/40 kg ja 3,5 kg/3,5 kg/3,5 ja 40 kg]',
        '„Prügilasse viidud päris kuusk on sama halb kui kunstkuusk.” | [16 kg/16 ja 40 kg/16 kg ja 40 kg/40 ja 16 kg]',
        '„Metsast võib kuuse võtta igalt poolt, kust tahad.” | [ainult kaardil märgitud kohtadest/kaardil märgitud kohtadest/elektriliini alt]',
        '„Kuuse saab RMK-lt osta ainult jõululaupäeval.” | [novembri lõpust aasta lõpuni/novembri lõpust]',
      ], 'g_read'), 'Fakt koos arvuga teeb sinu väitluse argumendi tugevaks.'), { task: 'R08' }),
      inLesson(teach(tag(purpose(B.rolecards('022_t_debate', 'Väitlus: kumb kuusk sel aastal?', 'Vali pool ja räägi 2 minutit: kaks argumenti silla järgi (põhjus → näide → järeldus). Siis vasta vastase küsimusele ja hääletage.',
        'Päris kuuse pool.\nFaktid: jalajälg hakkpuiduna 3,5 kg; raieõigus 3–13 eurot; Eesti metsast.\nLisa oma näide ja üks argument, mida faktides ei ole.',
        'Kunstkuuse pool.\nFaktid: üks kuusk 10 aastat; okkad ei kuku; ohutum lapsele ja loomale.\nLisa oma näide ja üks argument, mida faktides ei ole.',
        ['Esiteks …', 'Pealegi …', 'Näiteks …', 'Seega …'], ['Ma saan aru, aga …', 'Järelikult …', 'Kokkuvõttes …']), 'Tulemus: hääletus näitab, kumb argument oli tugevam — ja sinu pere saab sel aastal põhjendatud kuuseotsuse.'), { task: 'S17', level: 4 }),
      'Õpetaja on vastane (õpilase valitud poole vastu). Kumbki räägib 2 minutit, siis küsib teiselt ühe küsimuse: „Mis on sinu näide?” või „Kust sa seda tead?”. Takistus kunstkuuse vastu: „Aga kui see läheb kolme aasta pärast prügilasse?”; päris kuuse vastu: „Aga okkad ja kass?” Lõpus hääletage ja öelge, milline argument veenis. Õnnestunud, kui õpilase argumendis on kõik neli osa, vähemalt kolm sidesõna ja tegusõna on sidesõna järel teisel kohal.')),
      teach(tag(homeTask(purpose(B.writing('022_t_essay', 'Arutlus: päris kuusk või kunstkuusk? Tunnis plaan, kodus lõpp.', 'Tunnis: plaan ja kaks esimest lauset. Kodus 150–180 sõna: mõlema poole argumendid, igaühele näide, ja lõpus sinu järeldus. Kasuta sidesõnu esiteks, pealegi, näiteks, seega ja kokkuvõttes.', [12, 16], ['esiteks', 'pealegi', 'näiteks', 'seega', 'kokkuvõttes'], 4, 'g_use'), 'Sinu pere või sõbrad loevad arutlust ja teevad oma kuuseotsuse.')), { task: 'W14', main: true, harno: 'W2b' }),
      'Kodutöö. Järgmises tunnis loe arutlus ette; õpetaja on „kahtleja” ja küsib ühe näite kohta: „Kas see on fakt või arvamus?” Tagasiside: argumendi neli osa, sidesõna järel tegusõna, iga poole näide, järeldus, mis tuleb argumentidest.'),
      extension(teach(tag(purpose(B.speaking('022_t_more', 'Mini-väitlus: kas uusaasta ilutulestik tuleks keelata?', 'Vali pool ja too üks argument silla järgi: põhjus, näide ja järeldus.', [
        'Kellele teeb ilutulestik rõõmu ja kellele mitte?',
        'Mis on sinu kogemus aastavahetusel?',
        'Mis oleks sinu ettepanek linnale?',
      ], [120, 180], ['Esiteks …', 'Näiteks …', 'Seega …']), 'Kiire väitlus uuel teemal näitab, et argumendisild töötab igal pool.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (12 min). Argumendid, kui õpilasel neid napib: poolt — lemmikloomad kardavad, prügi tänaval, õnnetused; vastu — traditsioon, laste rõõm, üks kord aastas. Kumbki 1 minut, siis vaba vaidlus. Fakte ära lisa: siin harjutame argumendi ehitust, mitte seadust.'), 12),
      tag(exitCheck(purpose(B.gaps('022_t_exit', 'Kontrolli end: sidesõna ja sõnajärg.', 'Kirjuta lünka sidesõna, mis sobib lause alguses nimetatud argumendi osaga. Vaata, mis sõna tuleb kohe pärast seda.', [
        'Järeldus — meie korter on väike. [Seega|Järelikult|Seetõttu] sobib meile kõige paremini väike kuusk laual.',
        'Veel üks põhjus — päris kuusk on pärit Eesti metsast. [Pealegi|Lisaks] lõhnab see terve kuu.',
        'Näide — kunstkuuske saab kaua kasutada. [Näiteks] on meie oma juba kaksteist aastat vana.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas argumendi sidesõnad on käes.')), {}),
      purpose(B.selfcheck('022_t_self', ['Ma räägin oma pere kuusetraditsioonist.', 'Ma panen kuuldud väitlusest kirja seisukoha, põhjuse, näite ja järelduse.', 'Ma seon argumendi sidesõnadega ja panen tegusõna teisele kohale (Seega ei ole …).', 'Ma väitlen ja hääletan põhjendatult.'], 'Argument kannab', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.speaking('022_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks argument sinu valitud kuuse poolt — põhjus, näide ja järeldus.', [
        'Milline kuusk ja miks?',
        'Mis on sinu näide ja mis sellest järeldub?',
      ], [60, 120]), 'Õpetaja kuulab sinu argumenti ja ütleb, kas kõik neli osa on olemas.')), { task: 'S15' }),
      homework('022_t_homework', ['1. Arutlus, 150–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-023': {
    title: 'Mitu tundi ekraani on lapsele liiga palju?',
    phases: grammar('Keel: viisakas vastuväide — kuigi …, on siiski …; olen osaliselt nõus; ma pakuksin; kas poleks parem …?'),
    format: 'case',
    topic: 'family',
    canDo: 'Ma loen pere vestlust laste ekraaniaja üle, vaidlen viisakalt vastu (kuigi …, siiski; olen osaliselt nõus) ja lepin pereliikmetega suuliselt kokku ühised ekraanireeglid (ma pakuksin, kas poleks parem …).',
    teacherPage: {
      goal: 'Ученик понимает семейный спор об экранном времени, возражает вежливо (kuigi …, siiski; olen osaliselt nõus) и договаривается о трёх правилах (ma pakuksin, kas poleks).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок (угадать своё экранное время); станция 2 — чат и 3 первых вопроса; станция 3 — правило и 4 исправления; станция 4 — голосовое один раз, переговоры без письменного договора (3 правила устно).',
      hook: '«Сколько часов в день ты смотришь в экран — телефон, компьютер, телевизор? Сначала угадай, потом посмотри в телефоне (Ekraaniaeg / Digital Wellbeing).» Покажите своё число первым. Ученик без смартфона угадывает про телевизор.',
      plan: [
        '0–4: крючок — угадать и проверить своё экранное время',
        '4–10: станция 1 — разговор: экраны в моей семье, правила в детстве',
        '10–25: станция 2 — слова (2 мин), семейный чат (бабушка, мама, папа, тётя), 6 вопросов: кто что думает и почему; «Kas teadsid?» о рекомендации ВОЗ',
        '25–37: станция 3 — заметить в чате → правило kuigi / siiski / ometi и смягчение → исправить резкий ответ брата (6 предложений) → свой ответ бабушке',
        '37–52: станция 4 — голосовое сестры, семейный совет: договориться о трёх правилах (учитель — бабушка), записать договорённость',
        '52–64: «Kui aega jääb» — ролевая игра: телефон в спальне подростка ночью',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо сестре 120–150 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?»: ВОЗ, рекомендации по физической активности, сидячему поведению и сну детей до 5 лет (24.04.2019): детям до 2 лет экранное время не рекомендуется, 2–4 года — не больше часа в день, меньше — лучше. Чат и голосовое — учебные тексты (семья вымышленная).',
      groups: 'Станция 1 — в парах. Чат — каждый сам, сверка в паре. Семейный совет: 2–3 человека в разных ролях (мама, бабушка, папа) с вашими карточками, ученик ведёт; в 1:1 бабушка — вы.',
      errors: [
        '«Kuigi telefon on mugav, aga …» → «Kuigi telefon on mugav, on sellel siiski …» (kuigi без aga).',
        '«Kuigi …, mul on vaja …» → «Kuigi …, on mul vaja …» (после придаточного главное предложение начинается с глагола).',
        '«Ma pakuks», «kas me võiks» → «ma pakuksin», «kas me võiksime» (условное наклонение с личным окончанием).',
        '«Sa ei saa aru!» → «Ma saan sinust aru, kuid …» (сначала признать мнение, потом возразить).',
      ],
      notes: [
        'Формат — реальный случай: семья спорит, ученик помогает договориться. Без детей: тётя или дядя, крёстный, старший брат, сосед. Пенсионеру — роль бабушки меняется местами: он бабушка, вы — мама. Уставшему после смены — его собственный телефон вечером: «Kas sina jõuad ise ilma telefonita magama minna?».',
        'Обратная связь, 2–3 цели: kuigi + siiski / ometi без «aga» и с глаголом в начале главного предложения; смягчение (pakuksin, kas poleks, võiksime); сначала признать мнение собеседника. В переговорах не перебивать, 3 замечания в конце.',
      ],
    },
    discover: [
      // the hook is the talk's own first question (the lesson keeps 16 blocks)
      station(inLesson(teach(tag(purpose(B.speaking('023_d_talk', 'Arva ära: minu ekraaniaeg.', 'Mitu tundi päevas vaatad sina ekraani: telefoni, arvutit ja telerit kokku? Arva kõigepealt, siis vaata telefonist ekraaniaega. Kas number üllatas sind? Siis vasta küsimustele.', [
        'Kes teie peres vaatab kõige rohkem ekraani ja mis on selle peamine põhjus?',
        'Kas sinu lapsepõlves oli kodus ekraanireegleid ja kes need reeglid tegi?',
        'Mis on sinu arvates ekraanil lapse jaoks head ja mis võib olla halb?',
      ], [150, 210], ['Meie peres vaatab kõige rohkem ekraani …', 'Kuigi ekraan on mugav, on sellel siiski …', 'Minu arvates on lapse jaoks kõige tähtsam …']), 'Sinu pere kogemus on tunni juhtumi esimene näide.'), { task: 'S01', fluency: true }),
      'Üks-ühele: näita oma ekraaniaega esimesena. Ära paranda; lõpus ütle üks lause, mida õpilane ütles kõige viisakamalt.')), 1, 10),
      station(tag(B.vocab('023_d_vocab', 'Enne lugemist: sõnad.', ['ekraaniaeg — экранное время', 'nutiseade — смарт-устройство', 'multikas — мультик', 'reegel — правило', 'kokkulepe — договорённость', 'kuigi — хотя', 'siiski — всё же', 'ometi — тем не менее', 'osaliselt nõus — частично согласен', 'vaidlema — спорить']), { topic: ['ekraaniaeg', 'kokkulepe'] }), 2, 15),
      // a family chat of four: a text with names (B.dialogue shows two speakers only)
      B.text('023_d_chat', 'Pere vestlusgrupp: kas tahvel lauale?', '**Vanaema Galina:** Eile õhtusöögi ajal vaatas Miša jälle tahvlist multikaid. Kolmeaastane laps ei peaks ju ekraani vaatama!\n\n**Ema Olga:** Kuigi ma saan sinust aru, on mul siiski vaja vahel rahulikult süüa teha. Pool tundi multikaid ei ole maailma lõpp.\n\n**Isa Andres:** Olen osaliselt nõus. Pool tundi on okei, aga mitte söögilaua taga.\n\n**Tädi Kati:** Kas poleks mõistlikum leppida kokku kindlas ajas? Näiteks ainult pärast lõunaund.\n\n**Vanaema Galina:** Ja teie ise? Andres vaatab söögi ajal ometi uudiseid.\n\n**Isa Andres:** Õige. Ma pakuksin, et söögi ajal on telefonid ja tahvel kõik kapis.'),
      tag(purpose(B.choice('023_d_who', 'Kes mida arvab?', 'Vali vestluse põhjal iga küsimuse juurde üks õige vastus neljast.', [
        ['Mille üle on vanaema eile õhtul pere vestlusgrupis nii väga mures?', 'Kolmeaastane Miša vaatas õhtusöögi ajal jälle tahvlist multikaid.', 'Miša ei taha õhtul üldse süüa ega magama minna.', 'Ema vaatab ise liiga palju telefoni ja ei mängi lapsega.', 'Tädi on lubanud lapsele kingiks uue tahvli osta.'],
        ['Miks lubab ema oma kolmeaastasel pojal õhtuti vahel multikaid vaadata?', 'Tal on vaja vahel rahulikult süüa teha.', 'Ta arvab, et multikad õpetavad lapsele kiiresti eesti keelt.', 'Vanaema palus tal lapsele iga õhtu multikaid näidata.', 'Lasteaias soovitati lapsele õhtuti ekraani näidata.'],
        ['Millega on isa vanaema mõtetest nõus ja millega mitte?', 'Pool tundi on tema arvates okei, aga mitte söögilaua taga.', 'Ta on vanaemaga täiesti nõus, et ekraani ei tohi üldse olla.', 'Ta arvab, et laps võib vaadata nii palju, kui tahab.', 'Ta tahab, et laps vaataks multikaid ainult hommikul.'],
        ['Mida pakub tädi Kati kogu perele, et vaidlus lõppeks?', 'Leppida kokku kindlas ajas, näiteks ainult pärast lõunaund.', 'Müüa tahvel ära ja osta lapsele raamatuid.', 'Lasta lapsel multikaid vaadata ainult vanaema juures.', 'Küsida enne otsust nõu lasteaiaõpetajalt.'],
        ['Mida heidab vanaema vestluse lõpus lapse vanematele ette?', 'Isa vaatab ise söögi ajal uudiseid.', 'Ema ei tee õhtul piisavalt tervislikku toitu.', 'Vanemad ei luba vanaemal lapsega õues käia.', 'Tädi kingib lapsele liiga palju mänguasju.'],
        ['Mis on isa ettepanek kogu perele vestluse kõige lõpus?', 'Söögi ajal on kõik telefonid ja tahvel kapis.', 'Laps vaatab ekraani ainult õhtul enne magamaminekut.', 'Ainult täiskasvanud võivad söögi ajal telefoni kasutada.', 'Iga pereliige otsustab oma ekraaniaja ise.'],
      ], 'full', 'g_read'), 'Enne kui oma arvamuse ütled, tead täpselt, mida igaüks arvab ja miks.'), { task: 'R12' }),
      B.know('023_d_know', ['Maailma Terviseorganisatsiooni (WHO) soovituse järgi ei ole alla kaheaastasele lapsele ekraaniaeg soovitatav. Kahe- kuni neljaaastase lapse ekraaniaeg võiks olla kõige rohkem üks tund päevas, ja mida vähem, seda parem. Ekraani asemel soovitab WHO liikumist, mängu ja ettelugemist.'], 'WHO, soovitused alla viieaastaste laste liikumise, istumise ja une kohta (24.04.2019)', 'Kas teadsid? WHO soovitus'),
    ],
    practice: [
      station(B.notice('023_p_notice', 'Märka: kuidas vaielda nii, et tüli ei tule?', [
        'Vestlusest: **Kuigi** ma saan sinust aru, **on** mul **siiski** vaja … · **Olen osaliselt nõus.** · **Kas poleks** mõistlikum …? · Andres vaatab **ometi** uudiseid · **Ma pakuksin**, et …',
        '**kuigi** + kõrvallause, siis pealause, mis algab tegusõnaga: **Kuigi** pool tundi on lühike, **on see siiski** liiga palju. **aga** ei ole vaja (mitte: Kuigi …, aga …).',
        '**siiski** ja **ometi** = всё же, тем не менее: Telefon on mugav. **Siiski ei peaks** see olema söögilaual.',
        'Pehmenda tingiva kõneviisiga: ma **pakuksin**, et … · **kas poleks** parem …? · **kas me võiksime** …? · **oleks hea**, kui me **räägiksime** …',
        'Kõigepealt tunnista teise arvamust: **Ma saan sinust aru, kuid** … · **Selles on sul õigus, samas** … · **Olen osaliselt nõus.**',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('023_p_fix', 'Vend kirjutab liiga teravalt.', 'Sinu vend tahab vanaemale vastata, aga igas reas on üks viga. Kirjuta rida õigesti ja viisakalt.', [
        ['Kuigi sul on õigus, aga ema vajab ka puhkust.', 'Kuigi sul on õigus, vajab ema siiski ka puhkust.|Kuigi sul on õigus, vajab ema ka puhkust.|Kuigi sul on õigus, vajab ema ometi ka puhkust.'],
        ['Kuigi multikad on lühikesed, need väsitavad last.', 'Kuigi multikad on lühikesed, väsitavad need last.|Kuigi multikad on lühikesed, väsitavad need siiski last.'],
        ['Ma pakuks, et teeme nädalavahetusel ekraanivaba päeva.', 'Ma pakuksin, et teeme nädalavahetusel ekraanivaba päeva.|Pakuksin, et teeme nädalavahetusel ekraanivaba päeva.'],
        ['Kas poleks parem, kui me räägime sellest enne koos?', 'Kas poleks parem, kui me räägiksime sellest enne koos?|Kas poleks parem, kui räägiksime sellest enne koos?'],
        ['Ma olen osaline nõus, aga söögi ajal võiks telefon olla kapis.', 'Ma olen osaliselt nõus, aga söögi ajal võiks telefon olla kapis.|Olen osaliselt nõus, aga söögi ajal võiks telefon olla kapis.'],
        ['Kas me võiks proovida üht nädalat ilma tahvlita?', 'Kas me võiksime proovida üht nädalat ilma tahvlita?|Kas me võiksime proovida ühte nädalat ilma tahvlita?|Kas võiksime proovida üht nädalat ilma tahvlita?'],
      ], 'full', 'g_notice'), 'Vanaema loeb vastust ja tunneb, et teda kuulati — tüli ei tule.'), { task: 'G06' }),
      'Paranduse järel küsi: „Kuidas vanaema seda lauset kuuleb: teravalt või viisakalt?” Kui õpilane jätab „kuigi … aga”, ütle ainult: „Kuigi juba ütleb aga.”'),
      tag(purpose(B.writing('023_p_mine', 'Minu vastus vanaemale.', 'Kirjuta pere vestlusesse 3 lauset: tunnista vanaema mõtet, vaidle vastu kuigi-lausega ja tee pehme ettepanek (ma pakuksin / kas poleks parem).', [3, 3], ['kuigi', 'siiski', 'pakuksin'], 2, 'g_notice'), 'Sinu vastus aitab perel rahulikult edasi rääkida.'), { task: 'W12', level: 3 }),
    ],
    transfer: [
      station(tag(purpose(B.listening('023_t_voice', 'Õe häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna või arv.', [
        'Olga: Tere! Kas sul on hetk aega? Meie pere vestlusgrupis läks eile päris tuliseks. Ema arvab, et Miša ei tohi tahvlit üldse näha, Andres tahab söögi ajal uudiseid vaadata ja mina olen kahe tule vahel.',
        'Ausalt öeldes vaatab Miša praegu ekraani umbes kaks tundi päevas: hommikul pool tundi, kui ma duši all käin, ja õhtul poolteist tundi, kui ma süüa teen. Ma tean, et WHO soovitab kõige rohkem ühe tunni. Aga kuidas ma siis süüa teen?',
        'Pühapäeval tuleme kõik sinu juurde lõunale. Kas sa aitaksid meil kokku leppida? Sina oskad rahulikult rääkida ja sind kuulavad kõik. Mõtle palun välja kolm reeglit, mis sobiksid nii emale kui ka mulle. Aitäh, kallis!',
      ], [
        'Pere vestlusgrupis läks eile päris [tuliseks].',
        'Olga tunneb, et ta on nagu kahe [tule] vahel.',
        'Miša vaatab praegu ekraani umbes [kaks|2] tundi päevas.',
        'Õhtul vaatab Miša ekraani poolteist tundi, kui ema [süüa] teeb.',
        'Pühapäeval tuleb kogu pere sinu juurde [lõunale].',
        'Olga palub sul välja mõelda [kolm|3] reeglit.',
      ], 'g_read'), 'Märkmed näitavad, mis on õe tegelik mure ja mida sinult oodatakse.'), { task: 'L07' }), 4, 15, { final: 'negotiate' }),
      inLesson(teach(tag(purpose(B.rolecards('023_t_council', 'Pere nõupidamine: kolm ekraanireeglit.', 'Sa juhid pere pühapäevast nõupidamist. Kuula teist, vaidle viisakalt vastu ja leppige kokku kolm reeglit.',
        'Olukord: Miša (3) vaatab ekraani kaks tundi päevas; vanaema tahab null minutit, ema vähemalt pool tundi õhtul.\nSinu eesmärk: kolm reeglit, millega kõik on nõus (millal, kui kaua, kus mitte).\nPiirang: kasuta vähemalt kaks kuigi-lauset ja kaks pehmet ettepanekut.',
        'Vanaema kaart on õpetajal: tema seisukoht, üks argument ja üks üllatus.',
        ['Ma saan sinust aru, kuid …', 'Kuigi …, on siiski …', 'Ma pakuksin, et …', 'Kas poleks parem, kui …?'], ['Aga lapsele on see kahjulik!', 'Meie ajal …', 'Olgu, ma olen osaliselt nõus …']), 'Tulemus: sinu pere kolm ühist ekraanireeglit (millal, kui kaua, kus mitte), mida kõik on nõus pidama; need lähevad sinu kodusesse kirja Olgale.'), { task: 'S17', main: true, level: 4, harno: 'S2' }),
      'Õpetaja kaart (vanaema; kui õpilane on ise vanavanem, vahetage rollid: tema on vanaema, sina Olga). Seisukoht: kolmeaastane ei peaks ekraani nägema. Argument: „Meie ajal mängisid lapsed õues.” Üllatus (ütle poole vestluse pealt): sa vaatad ise iga õhtu kaks sarja ja Miša istub sinu kõrval. Takistused ükshaaval: 1) „Pool tundi on ka liiga palju!” 2) „Multikad on vene või inglise keeles, laps ei õpi eesti keelt.” 3) „Kes siis reegleid kontrollib?” Õnnestunud, kui õpilane tunnistab vanaema mõtet, kasutab kaks kuigi-lauset ja kaks pehmet ettepanekut ning te lepite kokku kolm reeglit: aeg, kestus ja koht.')),
      extension(teach(tag(purpose(B.speaking('023_t_more', 'Rollimäng: telefon öösel teismelise toas?', 'Õpetaja on 14-aastane, kes vaatab öösel telefoni ja on hommikul väsinud. Räägi temaga ja leppige kokku, kus telefon öösel on — ilma tülita.', [
        'Mida sa temas mõistad ja ütled seda kõigepealt?',
        'Mis on sinu ettepanek ja kuidas sa selle pehmelt ütled?',
        'Mida teete, kui telefon on tema äratuskell?',
      ], [120, 180], ['Kuigi ma saan aru, et …', 'Kas poleks parem …?', 'Ma pakuksin …']), 'Teismelisega räägid samamoodi kui vanaemaga: kõigepealt tunnista, siis paku.'), { task: 'S10', level: 4 }),
      'Kui aega jääb (12 min). Sina oled 14-aastane. Argumendid: „Kõik mu sõbrad kirjutavad õhtul”, „Telefon on minu äratuskell”, „Sina vaatad ka voodis telefoni”. Pakkumine lõpus: telefon on öösel köögis, kui saan vana äratuskella. Õnnestunud, kui õpilane ei käsi, vaid pakub (kas poleks, ma pakuksin) ja kasutab ühe kuigi-lause.'), 12),
      tag(exitCheck(purpose(B.gaps('023_t_exit', 'Kontrolli end: viisakas vastuväide.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Kuigi ma saan sinust aru, [olen] ma ekraaniaja koha pealt siiski teist meelt. (olema)',
        'Ma [pakuksin], et pühapäeviti on meil terve päev ekraanivaba. (pakkuma)',
        'Kas me [võiksime] proovida üht kuud ilma õhtuse teleta? (võima)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kuigi-lause ja tingiv kõneviis on käes.')), {}),
      purpose(B.selfcheck('023_t_self', ['Ma räägin, kuidas ekraane minu peres kasutatakse.', 'Ma saan pere vestlusest aru, kes mida arvab ja miks.', 'Ma vaidlen viisakalt vastu: kuigi …, siiski; olen osaliselt nõus.', 'Ma lepin pereliikmetega kokku ühised reeglid.'], 'Kokkulepe olemas', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('023_t_letter', 'Kodus: kiri õele.', 'Kirjuta kodus Olgale (või sõbrale, kelle peres on sama mure) 140–160 sõna: millest sa aru said, millega sa ei ole nõus ja miks ning kolm reeglit, mida pakud. Kasuta sõnu kuigi ja siiski ning tingivat kõneviisi.', 'Kallis Olga!', 'Kallistan\n(sinu nimi)', [140, 160]), 'Olga saab sinu kirjast rahuliku plaani ja teab, et sa oled tema poolel, kuigi sa ei ole kõiges nõus.')), { task: 'W04', level: 3 }),
      tag(homeTask(purpose(B.speaking('023_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks ekraanireegel, mida sa ise järgmisel nädalal proovid, ja miks — kuigi see on raske.', [
        'Mis reegli sa endale võtad?',
        'Miks on see raske ja miks sa seda siiski proovid?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja küsib järgmises tunnis, kuidas läks.')), { task: 'S15' }),
      homework('023_t_homework', ['1. Kiri õele, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-024': {
    title: 'Auto, buss või jalgsi: mis sinu teekond tegelikult maksab?',
    phases: grammar('Keel: võrdlemine — võrreldes bussiga, erinevalt autost, seevastu, mida kaugemal, seda kallim; eelis ja puudus'),
    format: 'project',
    topic: 'money',
    canDo: 'Ma kuulan inimeste lugusid ja loen joonist, võrdlen oma teekonna kahte võimalust nelja kriteeriumi järgi (võrreldes …-ga, erinevalt …-st, seevastu, mida …, seda …) ja kirjutan andmete kokkuvõtte koos oma järeldusega.',
    teacherPage: {
      goal: 'Ученик читает статистику поездок на работу (2003 → 2023), сравнивает два варианта своего пути по 4 критериям (võrreldes, erinevalt, seevastu, mida … seda) и выбирает.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок — два числа своего пути; станция 2 — радио один раз и 4 пропуска; станция 3 — правило и 4 предложения; станция 4 — график и 2 вопроса, таблица сравнения и устное решение без вопросов скептика.',
      hook: '«Как ты сегодня сюда добрался? Сколько минут и сколько примерно евро это стоило?» Запишите на доске свои два числа, потом числа ученика, и сравните одной фразой: «Võrreldes sinuga sõidan ma kauem».',
      plan: [
        '0–4: крючок — два числа своего пути на доске',
        '4–10: станция 1 — таблица «мой путь вчера», сравнение с учителем',
        '10–25: станция 2 — слова (2 мин), прогноз «Что выбирают люди: машину, автобус или ноги?», радио: три человека (Нарва, Тарту, Харьюмаа) дважды, 6 пропусков',
        '25–37: станция 3 — сравнение: заметить в радио → правило → коллега сравнивает автобус и машину: 7 пропусков → 4 своих предложения-сравнения',
        '37–52: станция 4 — график Статистикаамета 2003/2023 и 5 вопросов; проект «Minu teekond»: два варианта × 4 критерия, решение, объяснить учителю-скептику; план вывода и 2 первых предложения',
        '52–64: «Kui aega jääb» — игра «Kumb võidab?»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: вывод по данным 150–180 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'График: Statistikaamet, tööjõu-uuring (новость «Fewer and fewer people are commuting on foot and by public transport…», данные 2003 и 2023): на машине 25 % → 46,9 %, общественным транспортом 29,9 % → 17,8 %, пешком 27,3 % → 14,6 %; живущих ближе 2 км от работы — 32,2 % → 22,6 %. Истории трёх людей — учебные тексты; цены не выдумываем — ученик считает свои.',
      groups: 'Таблица крючка — каждый сам, сравнение в паре. Радио — каждый сам, сверка в паре. Проект — каждый свой путь; в паре второй — «скептик» с вашими двумя вопросами. В 1:1 скептик — вы.',
      errors: [
        '«Võrreldes buss» → «Võrreldes bussiga» (võrreldes + -ga).',
        '«Erinevalt autoga» → «Erinevalt autost» (erinevalt + -st).',
        '«Mida kaugem, seda kallis» → «Mida kaugemal, seda kallim» (mida … seda — две сравнительные формы).',
        '«Buss on odavam nagu auto» → «Buss on odavam kui auto» (сравнение — kui, не nagu).',
      ],
      notes: [
        'Формат — мини-проект: продукт — карточка «Minu teekond» (два варианта, 4 критерия, решение). Кто не работает: путь в языковую школу, в магазин, к врачу или к внукам. Цены не выдумываем: ученик считает свои (литр топлива на своей заправке, билет в своём городе).',
        'Обратная связь, 2–3 цели: падеж после võrreldes / erinevalt; mida … seda с двумя сравнительными; решение с причиной. На станции 3 сначала подсказка («Millega võrdled? Millest erineb?»), рекаст — только если ученик не исправил сам.',
      ],
    },
    discover: [
      // the hook is the table's own instruction (the lesson keeps 16 blocks)
      station(teach(tag(purpose(B.table('024_d_trip', 'Kuidas sa siia tulid?', 'Kuidas sa täna siia tulid? (Kui tund on veebis: kuidas sa eile tööle, kooli või poodi läksid?) Mitu minutit see võttis ja umbes mitu eurot maksis? Kirjuta oma numbrid tabelisse ja võrdle õpetajaga ühe lausega.', 'Küsimus, Mina, Õpetaja', [
        'Kuidas ma liikusin? |  | ',
        'Mitu minutit see võttis? |  | ',
        'Mitu eurot see umbes maksis? |  | ',
        'Mis oli kõige mugavam või ebamugavam? |  | ',
      ]), 'Sinu numbrid on tunni esimesed andmed: täna võrdled just nendega.'), { task: 'S09', fluency: true }),
      'Täida ka oma veerg ja ütle esimesena: „Võrreldes sinuga sõidan ma …”. Siis küsi: „Kas sa oled selle teekonnaga rahul?” Ära paranda; kirjuta tahvlile õpilase kaks numbrit — need tulevad jaamas 4 tagasi.'), 1, 10),
      station(tag(B.vocab('024_d_vocab', 'Enne kuulamist: sõnad.', ['teekond — путь', 'tööle sõitma — ездить на работу', 'kütus — топливо', 'ummik — пробка', 'parkimine — парковка', 'sõiduplaan — расписание', 'eelis — преимущество', 'puudus — недостаток', 'erinevalt — в отличие от', 'seevastu — напротив']), { topic: ['teekond', 'ummik', 'eelis'] }), 2, 15),
      tag(purpose(B.listening('024_d_radio', 'Raadio: kolm teekonda.', 'Kuula kaks korda: mida iga inimene võrdleb ja mille kasuks ta otsustab? Kirjuta lünka 1–2 sõna või arv.', [
        'Saatejuht: Kuidas teie tööle või kooli jõuate? Täna räägivad sellest kolm kuulajat.',
        'Sergei: Elan Narvas ja töötan tehases kolme kilomeetri kaugusel. Varem sõitsin autoga, nüüd käin jalgsi või rattaga. Erinevalt autost ei pea ma kütuse ja parkimise peale mõtlema. Talvel on muidugi külm ja pime, seevastu suvel on teekond päeva parim osa.',
        'Kertu: Õpin Tartus ja elan ühikas. Bussiga jõuan ülikooli viieteist minutiga, rattaga kümnega. Võrreldes bussiga on ratas kiirem ja tasuta, aga vihma käes jõuan loengusse märjana. Mida külmemaks läheb, seda sagedamini valin bussi.',
        'Tõnu: Elan Sauel ja töötan Tallinna kesklinnas. Autoga võtab teekond hommikuses ummikus peaaegu tund aega, rongiga veerand tundi ja jalutuskäik jaama veel kümme minutit. Võrreldes autoga säästan rongiga palju raha. Seevastu pean elama sõiduplaani järgi: kui rong läks, siis läks.',
        'Saatejuht: Kolm kuulajat, kolm valikut. Aga kuidas sina liigud?',
      ], [
        'Sergei tehas on tema kodust [kolme|3] kilomeetri kaugusel.',
        'Erinevalt autost ei pea Sergei mõtlema kütuse ja [parkimise] peale.',
        'Rattaga jõuab Kertu ülikooli [kümne|10] minutiga, bussiga viieteistkümnega.',
        'Kui ilm läheb külmemaks, valib Kertu sagedamini [bussi].',
        'Autoga võtab Tõnu teekond hommikuses [ummikus] peaaegu tund aega.',
        'Rongi puudus on Tõnu jaoks see, et tuleb elada [sõiduplaani] järgi.',
      ], 'g_read'), 'Kolm päris elu näidet näitavad, mida inimesed teekonna valikul võrdlevad.'), { voice: 'interview', task: 'L03' }),
    ],
    practice: [
      station(B.notice('024_p_notice', 'Märka: kuidas kahte asja võrrelda?', [
        'Raadiost: **Võrreldes bussiga** on ratas kiirem · **Erinevalt autost** ei pea ma kütuse peale mõtlema · **seevastu** suvel on teekond päeva parim osa · **Mida külmemaks** läheb, **seda sagedamini** valin bussi',
        '**võrreldes** + kaasaütlev (-ga): võrreldes **autoga**, võrreldes **eelmise aastaga**',
        '**erinevalt** + seestütlev (-st): erinevalt **bussist**, erinevalt **minust**',
        '**seevastu** = напротив, teine pool: Auto on kiire. **Seevastu on** buss odav. (tegusõna kohe järel)',
        '**mida** + keskvõrre …, **seda** + keskvõrre: **Mida** kaugemal elad, **seda** rohkem maksad.',
        'Keskvõrre + **kui**: Rong on kiirem **kui** auto. **eelis** (+) ja **puudus** (−): Ratta eelis on hind, puudus on vihm.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('024_p_forms', 'Kolleeg kaalub: buss või auto?', 'Kolleeg võrdleb oma kaht teekonda. Kirjuta sulgudes olev sõna õiges vormis.', [
        'Võrreldes [autoga] võtab bussisõit mul hommikul kakskümmend minutit rohkem aega. (auto)',
        'Erinevalt [bussist] saan autoga lapse otse lasteaia ukse ette viia. (buss)',
        'Auto on mugav, seevastu on bussipilet palju [odavam] kui kütus ja parkimine. (odav)',
        'Mida varem ma kodust lahkun, seda [lühem] on hommikune ummik. (lühike)',
        'Mida rohkem ma jalgsi käin, seda [paremini] ma öösel magan. (hästi)',
        'Erinevalt minu [naabrist] ei ole mul talvel autole sooja garaaži. (naaber)',
        'Võrreldes eelmise [aastaga] maksan kütuse eest nüüd rohkem. (aasta)',
      ], '', 'full', 'g_notice'), 'Kolleeg näeb kahe võimaluse eeliseid ja puudusi ühe pilguga.'), { task: 'G02' }),
      'Enne kontrolli küsi iga lünga juures: „Millega võrdled? Millest erineb?” Nii tuleb kääne õpilaselt, mitte sinult.'),
      teach(tag(purpose(B.writing('024_p_mine', 'Minu kaks teekonda.', 'Kirjuta 4 lauset oma kahest päris teekonna võimalusest: üks võrreldes-lause, üks erinevalt-lause, üks seevastu-lause ja üks mida … seda-lause.', [4, 4], ['võrreldes', 'erinevalt', 'seevastu', 'mida'], 3, 'g_notice'), 'Sinu neli lauset on projekti „Minu teekond” mustand.'), { task: 'W03', level: 3 }),
      'Loe laused ette ja loe kokku, mitu eri võrdlusvormi on õiged (eesmärk: neli). Paranda ainult üks viga: küsi „Millega võrdled? Millest erineb?”.'),
    ],
    transfer: [
      station(B.chart('024_t_chart', 'Kuidas Eestis tööl käiakse (protsenti töötajatest)', { kind: 'bar', unit: '%', series: ['2003', '2023'], rows: ['Autoga | 25 | 46,9', 'Ühistranspordiga | 29,9 | 17,8', 'Jalgsi | 27,3 | 14,6'], source: 'Statistikaamet, tööjõu-uuring 2003 ja 2023' }), 4, 15, { final: 'plan' }),
      tag(purpose(B.table('024_t_data', 'Mida joonis näitab?', 'Enne oma projekti vaata, kuidas Eesti liigub. Vasta joonise põhjal lühidalt.', 'Küsimus, Vastus', [
        'Kas autoga tööl käijaid oli 2023. aastal rohkem või vähem kui 2003. aastal? | [rohkem/palju rohkem]',
        'Kumb oli 2003. aastal populaarsem: ühistransport või auto? | [ühistransport]',
        'Mitu protsenti töötajatest käis 2023. aastal tööl jalgsi? | [14,6/14,6 %/umbes 15]',
        'Kumma osa langes kahekümne aastaga rohkem: jalgsi või ühistranspordiga käijate? | [jalgsi/jalgsi käijate]',
        'Mitu korda rohkem inimesi käis 2023. aastal tööl autoga kui ühistranspordiga? | [umbes 2,5 korda/2,5 korda/kaks ja pool korda/üle kahe korra]',
      ], 'g_read'), 'Arvud näitavad, kas sinu valik on Eestis tavaline või erand.'), { task: 'R15' }),
      tag(purpose(B.table('024_t_project', 'Projekt: minu teekond.', 'Vali oma igapäevaseks teekonnaks kaks päris võimalust ja võrdle neid nelja kriteeriumi järgi. Märgi rea lõppu, kumb võidab.', 'Kriteerium, Võimalus 1, Võimalus 2, Kumb võidab?', [
        'Aeg (minutit ühes suunas, ummik) |  |  | ',
        'Raha (kütus, pilet, parkimine: eurot kuus) |  |  | ',
        'Tervis ja liikumine |  |  | ',
        'Mugavus (ilm, sõiduplaan, eelis ja puudus) |  |  | ',
      ]), 'Tulemus: sinu kaart „Minu teekond”, mille järgi otsustad, kuidas järgmisel kuul liigud.'), { task: 'W01', level: 3 }),
      inLesson(teach(tag(purpose(B.rolecards('024_t_explain', 'Seleta oma valikut kahtlejale.', 'Räägi 2–3 minutit: mida sa võrdlesid, mis on kummagi võimaluse eelis ja puudus ning mille kasuks sa otsustad. Siis vasta kahtleja kahele küsimusele.',
        'Sina: oma projekti kaardiga.\nSinu eesmärk: kahtleja nõustub, et sinu valik on põhjendatud.\nKasuta vähemalt kolme kriteeriumi ja nelja võrdlusvormi.',
        'Kahtleja kaart on õpetajal: tema kaks küsimust.',
        ['Võrreldes …-ga …', 'Erinevalt …-st …', 'Seevastu …', 'Mida …, seda …', 'Seega valin …'], ['Aga talvel?', 'Kas sa arvestasid ka …?', 'Olgu, ma olen nõus, kuigi …']), 'Tulemus: sinu otsus on põhjendatud ja sa tead, mida järgmisel kuul proovid.'), { task: 'S12', level: 4 }),
      'Õpetaja on kahtleja. Kuula segamata, siis küsi: 1) „Aga talvel? Kas sinu otsus jääb samaks?” 2) „Kas sa arvestasid ka parkimist või pileti hinda?” Õnnestunud, kui õpilane võrdleb vähemalt kolme kriteeriumi, kasutab võrreldes-, erinevalt- ja mida … seda-lauset õigesti ja teeb selge otsuse põhjusega.')),
      teach(tag(homeTask(purpose(B.writing('024_t_summary', 'Andmed ja minu järeldus: tunnis plaan, kodus lõpp.', 'Tunnis: plaan ja kaks esimest lauset. Kodus 150–180 sõna: mida näitab Statistikaameti joonis (2003 ja 2023), mis võiks olla muutuse põhjus, kuidas sinu teekond sellega võrreldes on ja mida sa järgmisel kuul teisiti teed.', [12, 16], ['võrreldes', 'erinevalt', 'seevastu', 'mida'], 3, 'g_use'), 'Sinu kokkuvõte näitab, et oskad andmeid lugeda ja oma elu nendega võrrelda.')), { task: 'W15', main: true, harno: 'W2a' }),
      'Kodutöö. Järgmises tunnis loe kokkuvõte ette; õpetaja küsib: „Kas see on joonisel või on see sinu arvamus?” Tagasiside: arvud õigesti (2003 → 2023), võrdlusvormid, põhjus kui oletus (ilmselt, võib-olla — tund 21), selge järeldus.'),
      extension(teach(tag(purpose(B.speaking('024_t_more', 'Mäng: kumb võidab?', 'Õpetaja ütleb kaks asja. Sul on 30 sekundit: võrdle neid kahe lausega ja ütle, kumb võidab.', [
        'Rong või buss Tallinnast Tartusse?',
        'Elada tööle lähedal või looduse lähedal?',
        'Oma auto või rendiauto kord kuus?',
      ], [120, 180], ['Võrreldes …-ga …', 'Erinevalt …-st …', 'Mida …, seda …']), 'Kiire mäng harjutab võrdlust ilma ettevalmistuseta.'), { task: 'S05', fluency: true }),
      'Kui aega jääb (12 min). Paarid: rong või buss Tartusse; elektriauto või bensiiniauto; elada linnas või maal; taksoäpp või oma auto; kõndida või sõita trammiga kaks peatust. Iga õige võrdlusvorm on punkt, otsus põhjusega veel üks punkt. Pärast viit paari vahetage rollid: õpilane annab ülesande.'), 12),
      tag(exitCheck(purpose(B.gaps('024_t_exit', 'Kontrolli end: kolm võrdlust.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Erinevalt [rongist] sõidab buss ka meie külla. (rong)',
        'Võrreldes eelmise [kuuga] kõnnin nüüd iga päev rohkem. (kuu)',
        'Mida rohkem ma kõnnin, seda [vähem] ma väsinud olen. (vähe)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas võrdlusvormid on käes.')), {}),
      purpose(B.selfcheck('024_t_self', ['Ma räägin oma teekonnast numbritega.', 'Ma saan aru inimeste lugudest ja joonisest ning võrdlen neid.', 'Ma võrdlen kahte asja: võrreldes …-ga, erinevalt …-st, seevastu, mida …, seda …', 'Ma teen põhjendatud plaani oma teekonna kohta.'], 'Teekond valitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.speaking('024_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu teekond täna ja kümme aastat tagasi — mis on teisiti ja mis on parem?', [
        'Kuidas sa kümme aastat tagasi liikusid?',
        'Mis on võrreldes sellega teisiti ja kumb on parem?',
      ], [60, 120]), 'Õpetaja kuulab sinu võrdlust ja ütleb, kas võrdlusvormid on õiged.')), { task: 'S15' }),
      homework('024_t_homework', ['1. Andmete kokkuvõte ja järeldus, 150–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-025': {
    title: 'Kontroll 5 — minu seisukoht',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Mooduli kontroll, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Mooduli kontroll, 1. tund: keeleosa ja kuulamine (45 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Mooduli kontroll, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    // v4: the exam sheets are timed by their Harno part headers (timeEstimate.js harnoTimedMinutes, §7.3), not by the
    // block estimate
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid arvamuste ja vaidluste teemal, kirjutan umbes 140-sõnalise poolametliku kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma seisukohast; kasutan kindlussõnu, sidesõnu, kuigi-lauset ja võrdlust.',
    // Kontroll 5 in Harno B2 form, written new (owner 2026-11-18): two 90-minute lessons — reading (Avasta, 45 min) and the
    // module's language part + listening (Harjuta, 12 + 30 min); writing (60 min) and speaking with the module product
    // (Kasuta, 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same
    // task types (R1, R2a, R3, R4; L3 notes, L4; W1, W2b; S1, S2). Content: module 5 (certainty, argument connectors,
    // concession and softening, comparison) inside real tasks: arguing online and at the kitchen table, a letter to the
    // local paper about a cycle path, the clock change and RMK Christmas tree notices, a debate coach on the radio, a bus
    // stop letter, the cycle path vs public transport essay, the learner's own position, the sports hall vs the library.
    discover: [
      B.tip('025_d_how', 'Mooduli kontroll: lugemine (eksami vormis, 45 minutit)', 'Mooduli kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning keeleosa ja kuulamine, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      B.vocab('025_d_vocab', 'Tunnid 21–24: sõnad, mis aitavad', ['seisukoht — позиция', 'arvamus — мнение', 'argument — аргумент', 'järeldus — вывод', 'kahtlema — сомневаться', 'vaidlema — спорить', 'kompromiss — компромисс', 'eelis — преимущество', 'puudus — недостаток', 'võrdlema — сравнивать'], '2'),
      PART('025_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Mooduli kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('025_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit vaidlemisest. Vasta kõigepealt kahele küsimusele, siis lahenda osad 1 ja 2.', 'Miks me kommentaariumis vaidleme halvemini kui köögilaua taga?', [
        '(A) Igaüks meist on seda näinud. Uudise all on sada kommentaari ja juba kolmandas kirjutab keegi, et teised on rumalad. Kümnendas ei räägita enam uudisest, vaid sellest, kes on noor ja kes vana, kes elab linnas ja kes maal. Köögilaua taga vaidleme samade teemade üle palju rahulikumalt: kas kella keeramine tuleks lõpetada, milline kuusk tuua koju või kui kaua võib laps telefoni vaadata. Sama inimene, kes köögis kuulab ja küsib, võib kommentaariumis olla terav ja kiire. Miks see nii on? Minu arvates ei ole põhjus selles, et internetis kirjutavad halvemad inimesed. Põhjus on selles, kuidas vestlus on üles ehitatud.',
        '(B) Esiteks ei näe me kommentaariumis teise inimese nägu. Köögis märkame kohe, kui sõber solvub või kui tal on raske. Siis muudame tooni, küsime üle või teeme nalja. Ekraanil seda märki ei ole. Pealegi kirjutame tihti kiiresti, telefonist ja poolel teel. Seega jääb lausest alles ainult kõige teravam osa: see, mis meid vihastas. Hiljem loeme oma kommentaari uuesti ja imestame, kes selle kirjutas.',
        '(C) Teiseks ei kirjuta me kommentaariumis ainult teisele inimesele, vaid publikule. Köögis tahame sõbraga kokkuleppele jõuda või vähemalt teda mõista. Avalikus vaidluses tahame tihti hoopis võita ja näidata teistele, et meil on õigus. Kuigi selline vaidlus võib olla huvitav, ei muuda see kellegi arvamust. Vaevalt on keegi kunagi kirjutanud: „Aitäh, sa veensid mind, ma mõtlen nüüd teisiti.” Publiku ees on taganemine piinlik, köögis aga on see lihtsalt tark otsus.',
        '(D) Kolmandaks on internetis kerge segi ajada fakti ja arvamust. Kui sõber ütleb köögis, et kella keeramine on tervisele kahjulik, küsime: „Kust sa seda tead?” Kommentaariumis küsitakse seda harva. Arvamus, mida korratakse sada korda, hakkab tunduma faktina. Erinevalt köögist ei ole seal kedagi, kes ütleks rahulikult: „Oota, kontrollime järele.” Nii võib vale arv jõuda tuhandete lugejateni, enne kui keegi märkab, et sellel puudub allikas.',
        '(E) Kas see tähendab, et kommentaariumid tuleks sulgeda? Ma kahtlen, kas see aitaks. Paljud väljaanded on kommentaare juba piiranud või nõuavad sisselogimist, ometi kolib vaidlus lihtsalt sotsiaalmeediasse. Pealegi on avalik arutelu ühiskonnale vajalik: seal kuuleb ka neid, keda köögilaua taha ei kutsutud. Ilma selleta teaksime üksteise muredest palju vähem. Probleem ei ole seega selles, et inimesed vaidlevad, vaid selles, kuidas nad seda teevad, ja seda saab igaüks ise muuta.',
        '(F) Ma pakuksin hoopis lihtsat reeglit, mida igaüks saab endale seada. Enne kui vajutad nuppu „saada”, loe oma kommentaar uuesti läbi ja küsi: kas ma ütleksin seda samamoodi inimesele, kes istub minu vastas? Kui ei, muuda üht sõna. Mida rahulikum on esimene lause, seda suurem on võimalus, et ka vastus on rahulik. Kahe minuti töö võib säästa terve õhtu pahameelt. Teine lihtne harjumus on alustada sellest, millega oled nõus. Lause „Selles on sul õigus, kuid …” ei tee sind nõrgemaks, vaid näitab, et sa kuulasid.',
        '(G) Kokkuvõttes ei ole internet vaidlemist halvemaks teinud. See on lihtsalt näidanud, kui palju sõltub sellest, kas me näeme teist inimest. Köögilaua taga oskame vaielda nii, et pärast saab koos teed juua. Seda oskust tasub kaasa võtta ka ekraani taha, isegi kui kommentaari kirjutamine võtab siis paar minutit rohkem aega. Võib-olla ei veena me sellega kedagi, kuid vähemalt jääb vestlus inimlikuks. Ja kes teab, ehk loeb mõni vaikne lugeja just meie rahulikku kommentaari ning mõtleb oma arvamuse üle uuesti järele.',
        'Allikas: autori arvamus.',
      ].join('\n\n'), [['Milliseid kolme põhjust nimetab autor, miks me internetis halvemini vaidleme?', 'me ei näe teise nägu, kirjutame publikule ja ajame segi fakti ja arvamuse|ei näe nägu, kirjutame publikule, fakt ja arvamus lähevad segi'], ['Kas sina ütled internetis asju teisiti kui näost näkku? Too üks näide.']]),
      tag(B.choice('025_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mis juhtub autori sõnul kommentaariumis tihti juba alguses?', 'Keegi nimetab teisi rumalaks.', 'Kõik nõustuvad uudisega.', 'Toimetaja kustutab kommentaarid.', 'Inimesed kirjutavad pikki analüüse.'],
        ['Miks muudame köögis vaidlemisel tooni?', 'Me näeme, et teine solvub või et tal on raske.', 'Köögis on vaiksem kui mujal.', 'Sõber on alati meiega nõus.', 'Köögis ei tohi vaielda.'],
        ['Mis on autori arvates avaliku vaidluse eesmärk sageli?', 'võita ja näidata teistele, et meil on õigus', 'teist inimest paremini mõista', 'sõbraga kokkuleppele jõuda', 'uut teavet saada'],
        ['Mida tahab autor öelda lausega „Oota, kontrollime järele”?', 'Köögis küsitakse fakti järele, kommentaariumis harva.', 'Kõik faktid internetis on valed.', 'Köögis ei räägita kunagi faktidest.', 'Toimetus peab kõik kommentaarid üle kontrollima.'],
        ['Mida arvab autor kommentaariumide sulgemisest?', 'Ta kahtleb, kas see aitaks.', 'Ta on kindlasti selle poolt.', 'Ta arvab, et kõik väljaanded on seda juba teinud.', 'Ta soovitab sulgeda ka sotsiaalmeedia.'],
        ['Mida soovitab autor igaühele?', 'lugeda kommentaar enne saatmist uuesti läbi', 'mitte kunagi kommenteerida', 'kirjutada ainult sisselogituna', 'vaielda ainult köögilaua taga'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('025_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Probleem ei ole inimestes, vaid vestluse ülesehituses. | [A]',
        '2. Kiirustades jääb lausest alles kõige teravam osa. | [B]',
        '3. Avalik vaidlus ei muuda tavaliselt kellegi arvamust. | [C]',
        '4. Korduv arvamus võib hakata tunduma faktina. | [D]',
        '5. Kommentaaride piiramine ei lõpeta vaidlust. | [E]',
        '6. Avalikus arutelus kuuleb ka neid, keda muidu ei kuulataks. | [E]',
        '7. Rahulik algus toob tõenäoliselt rahuliku vastuse. | [F]',
        '8. Köögilaua oskus tasub kaasa võtta ka ekraani taha. | [G]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('025_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Elanik kirjutab vallalehele uue rattatee kohta. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Lugejakiri: miks ma olen rattatee poolt', [
        'Lugupeetud toimetus!',
        'Lugesin teie lehest, et vald kaalub Pargi tänavale rattatee ehitamist. Olen [kindlasti] (kindel) selle poolt ja tahaksin selgitada, miks.',
        'Esiteks [kasutavad] (kasutama) seda tänavat iga hommik sajad koolilapsed. Praegu ei ole seal isegi korralikku kõnniteed. Võrreldes [naabervallaga] (naabervald) on meil rattateid väga vähe. Erinevalt [linnast] (linn) ei sõida meil buss iga poole tunni tagant, nii et paljud pered sõidavad igale poole autoga.',
        'Mõned naabrid kardavad, et uus tee võtab ära parkimiskohti. Kuigi ma saan sellest murest aru, on laste ohutus siiski [tähtsam] (tähtis). Mida [rohkem] (palju) lapsi rattaga kooli sõidab, seda [vähem] (vähe) autosid on hommikul kooli ees.',
        'Ma [pakuksin|pakun] (pakkuma), et vald [korraldaks|korraldab] (korraldama) enne otsust avaliku arutelu. Vaevalt leiab rattatee kõigi toetuse, aga arutelul saavad kõik vähemalt oma mure välja öelda. Ootan arutelu [kuupäeva] (kuupäev) vallalehest.',
        'Lugupidamisega\nPargi tänava elanik Igor Tamm',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('025_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe Natalja lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas ma õppisin eesti keeles vaidlema', [
        'Kui ma Eestisse kolisin, ei julgenud ma eesti keeles kunagi vastu vaielda. [[Kui kolleegid koosolekul midagi arutasid, noogutasin lihtsalt kaasa.]]',
        'Ühel päeval muudeti minu tööaega minult küsimata. [[Olin nii pahane, et ei saanud öösel magada.]]',
        'Järgmisel hommikul kirjutasin paberile kolm lauset. [[Esimene ütles, mida ma arvan, teine miks ja kolmas, mida ma pakun.]]',
        'Koosolekul mu hääl värises, kuid lugesin oma laused ette. [[Juht kuulas ja küsis, kas ma oleksin kompromissiga nõus.]]',
        'Lõpuks leppisime kokku, et uus graafik kehtib ainult kaks kuud. [[Pärast seda vaatame koos üle, kas see töötab.]]',
        'Nüüd ma enam ei karda oma arvamust öelda. [[Tean, et viisakas vastuväide ei tee kedagi vaenlaseks.]]',
      ], ['Seepärast otsustasin töökohta vahetada ja koosolekutel enam üldse mitte käia.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('025_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled artikli autori reegliga „loe enne saatmist uuesti läbi” nõus? Kirjuta 3–4 lauset: tunnista üht autori mõtet, vaidle viisakalt vastu või toeta teda ja too üks näide oma elust.', [3, 4], ['kuigi', 'näiteks'], 1, 'g_read'), { task: 'W08' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('025_p_how', 'Mooduli kontroll: keeleosa ja kuulamine (45 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris kommentaare ja ütled mõtte teisiti.', 'full'),
      B.tip('025_p_kpart', 'Keeleosa (12 minutit, 12 punkti)', 'Need on päris laused vaidlustest ja arutlustest nagu tundides 21–24. Paranda ja ütle teisiti nii, et lugeja saab sinust aru ja keegi ei solvu.', 'full'),
      B.errorfix('025_p_fix', 'Keeleosa A: paranda enne saatmist (6 punkti).', 'Sõber palus sul oma kommentaarid üle vaadata. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Vaevalt kella keeramine ei lõpe järgmisel aastal.', 'Vaevalt kella keeramine järgmisel aastal lõpeb.|Vaevalt lõpeb kella keeramine järgmisel aastal.'],
        ['Ma kahtlen, et naabrid on rattateega nõus.', 'Ma kahtlen, kas naabrid on rattateega nõus.|Kahtlen, kas naabrid on rattateega nõus.'],
        ['Esiteks, päris kuusk on pärit Eesti metsast.', 'Esiteks on päris kuusk pärit Eesti metsast.'],
        ['Kuigi ekraan on mugav, aga väikesele lapsele on see liiga palju.', 'Kuigi ekraan on mugav, on see väikesele lapsele siiski liiga palju.|Kuigi ekraan on mugav, on see väikesele lapsele liiga palju.'],
        ['Võrreldes bussi on rong palju kiirem.', 'Võrreldes bussiga on rong palju kiirem.'],
        ['Erinevalt minu vennaga sõidan ma tööle rattaga.', 'Erinevalt minu vennast sõidan ma tööle rattaga.|Erinevalt vennast sõidan ma tööle rattaga.'],
      ]),
      B.transformation('025_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Kirjuta sama mõte uuesti nii, et kasutad antud sõna või sõnu.', [
        ['Ma ei usu, et vald selle tee sel aastal valmis ehitab.', 'vaevalt', 'Vaevalt vald selle tee sel aastal valmis ehitab.|Vaevalt ehitab vald selle tee sel aastal valmis.'],
        ['Telefon on mugav, aga söögi ajal ei peaks see laual olema.', 'kuigi', 'Kuigi telefon on mugav, ei peaks see söögi ajal laual olema.|Kuigi telefon on mugav, ei peaks see siiski söögi ajal laual olema.'],
        ['Buss on odavam. Auto on kiirem.', 'seevastu', 'Buss on odavam. Seevastu on auto kiirem.|Buss on odavam, seevastu on auto kiirem.'],
        ['Kui elad kaugemal, maksad sõidu eest rohkem.', 'mida … seda', 'Mida kaugemal elad, seda rohkem maksad sõidu eest.|Mida kaugemal sa elad, seda rohkem sa sõidu eest maksad.|Mida kaugemal elad, seda rohkem sõidu eest maksad.|Mida kaugemal sa elad, seda rohkem maksad sõidu eest.'],
        ['Lähme parem rongiga.', 'kas poleks', 'Kas poleks parem rongiga minna?|Kas poleks parem minna rongiga?|Kas poleks parem, kui läheksime rongiga?|Kas poleks parem, kui me läheksime rongiga?'],
        ['Kunstkuusk teenib kümme aastat, nii et uut pole vaja osta.', 'seega', 'Kunstkuusk teenib kümme aastat. Seega ei ole vaja uut osta.|Kunstkuusk teenib kümme aastat, seega ei ole vaja uut osta.|Kunstkuusk teenib kümme aastat. Seega pole vaja uut osta.|Kunstkuusk teenib kümme aastat, seega pole vaja uut osta.'],
      ]),
      PART('025_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Mooduli kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('025_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet, igaüht ainult üks kord. Kirjuta lünka 1–2 sõna või arv.', [
        '1. Tähelepanu! Pühapäeva öösel keeratakse kella: kell neli keeratakse tund aega tagasi kella kolmele. Ärge unustage keerata ka seinakella ja auto kella.',
        '2. Riigimetsast saab jõulukuuse raieõiguse osta veebist või mobiiliäpist alates novembri lõpust. Hind sõltub kuuse kõrgusest. Kuuse võib võtta ainult kaardil märgitud kohtadest.',
        '3. Linnaraamatukogu väitlusõhtu teemal „Kas linn vajab rohkem rattateid?” toimub neljapäeval kell kuus õhtul. Osalemine on tasuta, kohti on nelikümmend.',
        '4. Tähelepanu, bussisõitjad! Alates esmaspäevast sõidab liin number seitse tipptunnil iga kümne minuti tagant. Pärast kella kümmet õhtul väljub buss kord tunnis.',
      ], [
        'Pühapäeva öösel keeratakse kell neljalt tagasi kella [kolmele|3].',
        'Jõulukuuse raieõiguse hind sõltub kuuse [kõrgusest].',
        'Kuuse võib võtta ainult [kaardil] märgitud kohtadest.',
        'Väitlusõhtul arutatakse, kas linn vajab rohkem [rattateid].',
        'Raamatukogu väitlusõhtul on [nelikümmend|40] kohta.',
        'Tipptunnil sõidab liin seitse iga [kümne|10] minuti tagant.',
      ]),
      tag(B.listening('025_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime vaidlemisest. Stuudios on väitlustreener Riina Põld. Riina, miks on vaidlemine nii raske?',
        'Riina: Sest me ajame segi vaidluse ja tüli. Tülis tahame võita, vaidluses aga leida parima lahenduse. Kui see vahe on selge, läheb kõik kergemini.',
        'Saatejuht: Kuidas head argumenti ära tunda?',
        'Riina: Heal argumendil on neli osa: seisukoht, põhjus, näide ja järeldus. Kõige sagedamini jääb puudu näide. Ilma näiteta jääb argument õhku rippuma.',
        'Saatejuht: Mida teha, kui vastane räägib väga enesekindlalt?',
        'Riina: Enesekindlus ei ole veel tõend. Küsige rahulikult: „Kust te seda teate?” Tavaliselt selgub, et fakt on tegelikult arvamus.',
        'Saatejuht: Kas vastuvaidlemine ei ole ebaviisakas?',
        'Riina: Ei ole, kui alustate sellest, millega olete nõus. Näiteks: „Kuigi ma mõtlen teisiti, on teil õigus, et …” Siis kuulab teine teid palju meelsamini.',
        'Saatejuht: Kas vaidlemist saab õppida ka täiskasvanuna?',
        'Riina: Kindlasti! Meie õhtustes ringides on inimesi kahekümnest kaheksakümne aastani. Kõige vanem osaleja on pensionär, kes harjutab ringis keeleeksamiks.',
        'Saatejuht: Mida soovitate kuulajatele?',
        'Riina: Enne vastamist lugege mõttes kolmeni. Mida rahulikum on teie esimene lause, seda paremini teid kuulatakse.',
        'Saatejuht: Aitäh, Riina!',
      ], [
        'Riina sõnul ajame sageli segi vaidluse ja [tüli].',
        'Vaidluses tahame Riina sõnul leida parima [lahenduse].',
        'Heal argumendil on [neli|4] osa.',
        'Kõige sagedamini jääb argumendist puudu [näide].',
        'Enesekindlus ei ole Riina sõnul veel [tõend].',
        'Vastaselt tasub rahulikult küsida, kust ta seda [teab].',
        'Vastuvaidlemist tasub alustada sellest, millega oled [nõus].',
        'Riina ringides on inimesi kahekümnest [kaheksakümne|80] aastani.',
        'Enne vastamist soovitab Riina lugeda mõttes [kolmeni|3].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('025_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Riina arvates on vaidlemine raske, sest inimestel ei ole piisavalt fakte.', false],
        ['Heal argumendil on Riina sõnul kaks osa: seisukoht ja järeldus.', false],
        ['Riina sõnul on argumendis kõige tähtsam leida vastase vead.', false],
        ['Riina arvates tasub enesekindla kõneleja sõnu uskuda ilma küsimata.', false],
        ['Riina näite järgi võib viisakas vastuväide alata sõnadega „Kuigi ma mõtlen teisiti …”.', true],
        ['Riina õhtustes ringides käib väga eri vanuses inimesi.', true],
        ['Kõige vanem ringi osaleja on pensionär, kes harjutab keeleeksamiks.', true],
        ['Riina soovitab vastata vastasele kohe, et ta ei jõuaks edasi rääkida.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('025_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (paranda – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('025_t_situation', 'Mooduli kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad linnavalitsusele kirja ja arutled selle üle, kuidas linnas liikuda. Sõnavõtus esitled mooduli tulemust: oma seisukohta ühes päris küsimuses, mille paned enne kirja kaardile „Minu seisukoht”.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own position, built from 021–024
      B.planning('025_t_product', 'Mooduli tulemus: minu seisukoht.', 'Vali üks päris küsimus oma elust või linnast, mille üle inimesed vaidlevad (kellaaeg, kuusk, ekraan, teekond või oma teema), ja pane kirja oma seisukoht. Kasuta mooduli tundide tulemusi.', ['Küsimus ja minu seisukoht: kui kindel ma olen? (tund 21: kindlasti, ilmselt, vaevalt)', 'Kaks argumenti: põhjus, näide ja järeldus (tund 22: esiteks, pealegi, seega)', 'Teise poole argument ja minu viisakas vastus (tund 23: kuigi …, siiski)', 'Kahe lahenduse võrdlus ja minu ettepanek (tund 24: võrreldes, erinevalt, mida … seda)']),
      PART('025_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; mooduli kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('025_t_letter', 'Kirjutamine 1: kiri linnavalitsusele (umbes 140 sõna).', 'Linn plaanib sulgeda sinu kodu lähedal oleva bussipeatuse, sest seda kasutab vähe inimesi. Kirjuta linnavalitsuse transpordiosakonnale: kes sa oled ja kuidas peatust kasutad, miks sa ei ole otsusega nõus, mida pakud ja mida küsid.', 'Lugupeetud transpordiosakond!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('025_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Teema: kas linn peaks rohkem raha panema rattateedele või ühistranspordile? Kirjuta arutlus: poolt- ja vastuargumendid, igaühele näide, ja lõpus oma järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 4), { task: 'W14', harno: 'W2b' }),
      PART('025_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; mooduli kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('025_t_present', 'Rääkimine 1: sõnavõtt väitlusõhtul (1 minut).', 'Teemakaart: raamatukogu väitlusõhtul ütleb iga osaleja oma seisukoha. Mõtle 2 minutit oma kaardi „Minu seisukoht” järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mis on sinu küsimus ja seisukoht?', 'Kui kindel sa oled ja miks?', 'Millised on sinu kaks argumenti?', 'Mida ütleb teine pool ja mida sa talle vastad?', 'Kas arvamust on kergem muuta köögilaua taga või internetis? Miks?', 'Kas sinu arvates peaks rohkem inimesi avalikel aruteludel osalema? Miks?'], [90, 180], ['Minu seisukoht on …', 'Esiteks …, pealegi …', 'Kuigi …, on siiski …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('025_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A. Teema: vallal on raha kas uueks spordihalliks või raamatukogu uuendamiseks. Sina oled spordihalli poolt. Argumendid: noored liiguvad vähe; talvel ei ole kuskil trenni teha; võistlused toovad valda külalisi. Lisa oma näide.',
        'Kaart B. Teema: vallal on raha kas uueks spordihalliks või raamatukogu uuendamiseks. Sina oled raamatukogu poolt. Argumendid: sobib kõigile vanustele; noortel on vaja õppimiskohta ja eakatel kohtumiskohta; hoone on vana ja külm. Lisa oma näide ja esita üks täpsustav küsimus.',
        ['Võrreldes raamatukoguga …', 'Esiteks …', 'Kas poleks mõistlik …?'], ['Kuigi …, on siiski …', 'Erinevalt spordihallist …', 'Olen osaliselt nõus …']), { task: 'S17', harno: 'S2' }),
      B.rubric('025_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: kõik neli punkti, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Arutlus: poolt- ja vastuargumendid, näited ja järeldus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: seisukoht ja kindlus, kaks argumenti, vastus teisele poolele 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin, võrdlesin, vaidlesin viisakalt ja jõudsime kokkuleppele (15 punkti).']),
      B.selfcheck('025_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne tööelu moodulit korrata.'], 'Moodul 5 tehtud'),
    ],
  },
}, {
  'b1b2-021': 'AVAS L→S', 'b1b2-022': 'KUUL L→W', 'b1b2-023': 'PROB R→S', 'b1b2-024': 'LUGU R→W', 'b1b2-025': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 021
  '021_d_kind': [
    'Toimunud sündmus, mida saab kontrollida (Euroopa Parlamendi hääletus 2019): fakt.',
    'Kontrollitav sündmus minevikus (2000–2001): fakt.',
    'Küsitluse tulemus koos allikaga (Euroopa Komisjon, 84 %): fakt.',
    '„parem” on hinnang ja „sest …” selle põhjendus: arvamus.',
    '„mõttetu” on hinnang, mida ei saa kontrollida: arvamus.',
    '„kaob kindlasti” räägib tulevikust: see on ennustus, kuigi kõlab kindlalt.',
    '„Vaevalt see muutub” räägib tulevikust: ennustus.',
  ],
  '021_p_sure': [
    'Fakt (kokkulepet pole) lubab ainult väikest kindlust: vaevalt + jaatav tegusõna (lõpeb).',
    'Kaks eri soovi, otsust pole: ausalt „ma ei ole kindel”, võib-olla kokku kirjutatult ja sidekriipsuga.',
    '84 % näitab enamikku: ilmselt (umbes 80 %); „vaevalt keegi” läheb faktiga vastuollu.',
    'kahtlema järel tuleb kas: „Ma kahtlen, kas …”, mitte „kahtlen, et …”.',
    'Fakt näitab, et sõber eksib: kindlasti mitte (0 %).',
    'Tulevik on teadmata: võib-olla … aga ma ei ole kindel; „vaevalt ei” on kahekordne eitus.',
  ],
  '021_t_radio': [
    'Töötaja: „minu öine vahetus kestis tund aega kauem … olin kaks päeva nagu udus”.',
    'Ta alustab sõnaga „Kindlasti!” — täiesti kindel.',
    'Ema: laps „ärkab nüüd kell viis, mitte kell kuus” — tund varem.',
    'Ema: „ilmselt läheb selleks veel aastaid”.',
    'Pensionär: „Ma kahtlen, kas poliitikud kunagi kokku lepivad.”',
    'Üliõpilane: „siis jõuan pärast loenguid veel õue”; talveaja kohta ütleb ta „võib-olla … ma ei ole kindel”.',
  ],
  '021_t_exit': [
    'Kokkulepet ei ole → väike kindlus: vaevalt + jaatav tegusõna (tuleb).',
    '84 % on fakt suure enamuse kohta → kindlasti.',
    'Kahtlus → ma kahtlen, kas …',
  ],
  // 022
  '022_d_radio': [
    'Mart: „Mina olen päris kuuse poolt.” (seisukoht)',
    'Mart: „Esiteks kasvab kuusk Eesti metsas.” (põhjus)',
    'Mart: „kunstkuusk aga tuuakse tavaliselt Aasiast”.',
    'Mart: jalajälg on väike, „kui see tehakse pärast pühi hakkpuiduks”.',
    'Mart: „Näiteks saab riigimetsast kahemeetrise kuuse raieõiguse kaheksa euroga.” (näide)',
    'Kaidi: „Hea kunstkuusk teenib perel kümme aastat või kauemgi.”',
    'Kaidi: „Teiseks ei kuku okkad põrandale.”',
    'Kaidi: „Järelikult on kunstkuusk mugav …” (järeldus)',
  ],
  '022_t_evidence': [
    'Kast: riigimetsa raieõigus maksab 3–13 eurot (kuni 2 m — 8 eurot).',
    'Joonis: kunstkuusk 40 kg, päris kuusk hakkpuiduna 3,5 kg — kunstkuusk ei ole alati parem.',
    'Joonis: päris kuusk prügilas 16 kg, kunstkuusk 40 kg — ka siis on vahe üle kahe korra.',
    'Kast: „Kuuse võib võtta ainult kaardil märgitud kohtadest, näiteks elektriliini alt.”',
    'Kast: raieõigust saab osta „novembri lõpust aasta lõpuni”.',
  ],
  '022_p_link': [
    'pealegi lisab sama poole argumendi; sidesõna järel tegusõna: Pealegi on …',
    'seega toob järelduse; tegusõna teisel kohal: Seega ei pea …',
    'näiteks toob näite; Näiteks oli meil …',
    'järelikult = seega; Järelikult ei lagune …',
    'seetõttu = sellepärast; Seetõttu valime (me) …',
    'kokkuvõttes lõpetab arutluse; Kokkuvõttes oleneb …',
  ],
  '022_t_exit': [
    'Väike korter → järeldus: seega; tegusõna teisel kohal (Seega sobib …).',
    'Lisa sama poole argument: pealegi (Pealegi lõhnab …).',
    'Konkreetne juhtum oma elust: näiteks (Näiteks on …).',
  ],
  // 023
  '023_d_who': [
    'Vanaema: „Eile õhtusöögi ajal vaatas Miša jälle tahvlist multikaid.”',
    'Olga: „on mul siiski vaja vahel rahulikult süüa teha”.',
    'Andres: „Pool tundi on okei, aga mitte söögilaua taga.”',
    'Kati: „Kas poleks mõistlikum leppida kokku kindlas ajas?”',
    'Vanaema: „Andres vaatab söögi ajal ometi uudiseid.”',
    'Andres: „söögi ajal on telefonid ja tahvel kõik kapis”.',
  ],
  '023_p_fix': [
    'kuigi ja aga ei käi koos; pealause algab tegusõnaga: Kuigi …, vajab ema (siiski) …',
    'Pärast kuigi-lauset tuleb tegusõna kohe: …, väsitavad need last.',
    'Tingiv kõneviis, mina-vorm: pakuksin.',
    'kui-lauses samuti tingiv kõneviis: räägiksime.',
    'osaliselt (määrsõna) nõus, mitte osaline.',
    'Tingiv kõneviis, meie-vorm: võiksime.',
  ],
  '023_t_voice': [
    'Olga: „Meie pere vestlusgrupis läks eile päris tuliseks.”',
    'Olga: „mina olen kahe tule vahel”.',
    'Olga: Miša vaatab ekraani „umbes kaks tundi päevas”.',
    'Olga: „õhtul poolteist tundi, kui ma süüa teen”.',
    'Olga: „Pühapäeval tuleme kõik sinu juurde lõunale.”',
    'Olga: „Mõtle palun välja kolm reeglit.”',
  ],
  '023_t_exit': [
    'Pärast kuigi-lauset algab pealause tegusõnaga: olen ma …',
    'Tingiv kõneviis, mina-vorm: pakuksin.',
    'Tingiv kõneviis, meie-vorm: võiksime.',
  ],
  // 024
  '024_d_radio': [
    'Sergei: „töötan tehases kolme kilomeetri kaugusel”.',
    'Sergei: „Erinevalt autost ei pea ma kütuse ja parkimise peale mõtlema.”',
    'Kertu: „Bussiga jõuan ülikooli viieteist minutiga, rattaga kümnega.”',
    'Kertu: „Mida külmemaks läheb, seda sagedamini valin bussi.”',
    'Tõnu: „Autoga võtab teekond hommikuses ummikus peaaegu tund aega.”',
    'Tõnu: „Seevastu pean elama sõiduplaani järgi.”',
  ],
  '024_t_data': [
    'Joonis: auto 25 % (2003) → 46,9 % (2023).',
    'Joonis: 2003 ühistransport 29,9 %, auto 25 %.',
    'Joonis: jalgsi 2023 — 14,6 %.',
    'Jalgsi 27,3 → 14,6 (−12,7), ühistransport 29,9 → 17,8 (−12,1): jalgsi käijate osa langes veidi rohkem.',
    '46,9 : 17,8 ≈ 2,6 — umbes kaks ja pool korda.',
  ],
  '024_p_forms': [
    'võrreldes + kaasaütlev: autoga.',
    'erinevalt + seestütlev: bussist.',
    'Keskvõrre + kui: odavam kui …',
    'mida … seda + keskvõrre: lühike → lühem.',
    'mida … seda + keskvõrre; hästi → paremini.',
    'erinevalt + seestütlev: naabrist.',
    'võrreldes + kaasaütlev: eelmise aastaga.',
  ],
  '024_t_exit': [
    'erinevalt + seestütlev: rongist.',
    'võrreldes + kaasaütlev: eelmise kuuga.',
    'mida rohkem …, seda + keskvõrre: vähe → vähem.',
  ],
  // 025
  '025_d_read': [
    'Lõigud B, C ja D: me ei näe teise nägu, kirjutame publikule ja ajame segi fakti ja arvamuse.',
    'Isiklik vastus: õige on iga konkreetne näide, kus on öeldud, mis olukord see oli ja mis oli teisiti.',
  ],
  '025_d_mc': [
    'A: „juba kolmandas kirjutab keegi, et teised on rumalad”.',
    'B: „Köögis märkame kohe, kui sõber solvub või kui tal on raske. Siis muudame tooni.”',
    'C: „Avalikus vaidluses tahame tihti hoopis võita ja näidata teistele, et meil on õigus.”',
    'D: köögis küsime „Kust sa seda tead?”, kommentaariumis „küsitakse seda harva”.',
    'E: „Ma kahtlen, kas see aitaks.”',
    'F: „loe oma kommentaar uuesti läbi”.',
  ],
  '025_d_para': [
    'A: „Põhjus on selles, kuidas vestlus on üles ehitatud.”',
    'B: „Seega jääb lausest alles ainult kõige teravam osa.”',
    'C: „ei muuda see kellegi arvamust”.',
    'D: „Arvamus, mida korratakse sada korda, hakkab tunduma faktina.”',
    'E: kommentaare on piiratud, „ometi kolib vaidlus lihtsalt sotsiaalmeediasse”.',
    'E: „seal kuuleb ka neid, keda köögilaua taha ei kutsutud”.',
    'F: „Mida rahulikum on esimene lause, seda suurem on võimalus, et ka vastus on rahulik.”',
    'G: „Seda oskust tasub kaasa võtta ka ekraani taha.”',
  ],
  '025_d_cloze': [
    'Olen … poolt: kindlusmäärsõna kindel → kindlasti.',
    'Esiteks + tegusõna teisel kohal; alus „koolilapsed” on mitmuses: kasutavad.',
    'võrreldes + kaasaütlev: naabervallaga.',
    'erinevalt + seestütlev: linnast.',
    'Kahest asjast tähtsam: keskvõrre tähtis → tähtsam.',
    'mida + keskvõrre: palju → rohkem.',
    'seda + keskvõrre: vähe → vähem.',
    'Pehme ettepanek: tingiv kõneviis pakuksin (viisakam); ka „pakun” on õige.',
    'et-lauses ettepaneku järel sobib tingiv kõneviis korraldaks (ka „korraldab” on õige).',
    'ootama + osastav: kuupäeva.',
  ],
  '025_d_bank': [
    'Ta ei julgenud vaielda → koosolekul ainult noogutas.',
    'Tööaeg muudeti küsimata → ta oli pahane ega saanud magada.',
    '„kolm lauset” → esimene, teine ja kolmas lause.',
    'Ta luges laused ette → juht kuulas ja pakkus kompromissi.',
    '„ainult kaks kuud” → pärast seda vaadatakse üle.',
    'Ta ei karda enam → viisakas vastuväide ei tee vaenlaseks.',
  ],
  '025_p_fix': [
    'vaevalt on juba eitus: tegusõna jaatav (lõpeb).',
    'kahtlema järel kas, mitte et.',
    'Esiteks ilma komata ja tegusõna kohe järel: Esiteks on …',
    'kuigi ja aga ei käi koos; pealause algab tegusõnaga: on see …',
    'võrreldes + kaasaütlev: bussiga.',
    'erinevalt + seestütlev: vennast.',
  ],
  '025_p_trans': [
    '„ei usu” → vaevalt + jaatav tegusõna.',
    'aga → kuigi-lause; pealause algab tegusõnaga: Kuigi …, ei peaks see …',
    'seevastu toob vastanduse; tegusõna kohe järel: Seevastu on …',
    'Kui … rohkem → Mida kaugemal …, seda rohkem …',
    'Pehme ettepanek küsimusena: Kas poleks parem …?',
    'nii et → seega; tegusõna teisel kohal: Seega ei ole / pole …',
  ],
  '025_p_notes': [
    'Teade 1: „kell neli keeratakse tund aega tagasi kella kolmele”.',
    'Teade 2: „Hind sõltub kuuse kõrgusest.”',
    'Teade 2: „ainult kaardil märgitud kohtadest”.',
    'Teade 3: teema on „Kas linn vajab rohkem rattateid?”.',
    'Teade 3: „kohti on nelikümmend”.',
    'Teade 4: „tipptunnil iga kümne minuti tagant”.',
  ],
  '025_p_listen': [
    'Riina: „me ajame segi vaidluse ja tüli”.',
    'Riina: „vaidluses aga leida parima lahenduse”.',
    'Riina: „Heal argumendil on neli osa.”',
    'Riina: „Kõige sagedamini jääb puudu näide.”',
    'Riina: „Enesekindlus ei ole veel tõend.”',
    'Riina: „Küsige rahulikult: „Kust te seda teate?””',
    'Riina: „kui alustate sellest, millega olete nõus”.',
    'Riina: „inimesi kahekümnest kaheksakümne aastani”.',
    'Riina: „lugege mõttes kolmeni”.',
  ],
  '025_p_tf': [
    'Vale: Riina sõnul on raske, sest „me ajame segi vaidluse ja tüli”.',
    'Vale: osi on neli (seisukoht, põhjus, näide, järeldus).',
    'Vale: Riina räägib argumendi neljast osast ja näitest, mitte vastase vigadest.',
    'Vale: „Enesekindlus ei ole veel tõend. Küsige rahulikult: „Kust te seda teate?””',
    'Õige: Riina näide on „Kuigi ma mõtlen teisiti, on teil õigus, et …”.',
    'Õige: ringides on inimesi kahekümnest kaheksakümne aastani.',
    'Õige: vanim osaleja on pensionär, kes „harjutab ringis keeleeksamiks”.',
    'Vale: ta soovitab enne vastamist lugeda mõttes kolmeni.',
  ],
};
