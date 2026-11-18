// B2 course (B1 → B2 roadmap), module 6 „Tööelu” (b1b2-026…030), stage B1+ (as the roadmap's levelStage; the v2 file said B2-).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–4. Module goal (the learner): „Ma oskan tööelus enda eest seista: räägin oma kogemusest,
// kontrollin lepingut, lahendan tüli ja kaalun oma väikest äri”; module product „Minu tööelu kaart” (030 Kasuta, the S16
// one-minute talk).
// A themed module (MODULE.theme 'work', §7.1 rule 7 and §7.3): every lesson is about work, each with its own sub-topic,
// and a learner without a job always has a real alternative (a summer job, volunteering, the course group, a flatmate).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 6).
// One format and one sub-topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   026 quest    „Kellena sa end viie aasta pärast näed?”        job search, CV, interview  final present: „Rääkige endast” (S16)
//   027 facts    „Kas sa kirjutaksid sellele lepingule alla?”    rights, contract, sick day final advise: a friend's contract (S13)
//   028 infogap  „Kolleeg hilineb jälle — kuidas sellest rääkida?”  colleagues, conflict   final negotiate: the talk (S05)
//   029 project  „Kas sinu oskusest saaks väike äri?”             own business, FIE          final plan: my idea card (S18)
//   030 exam     Kontroll 6 in Harno B2 form + „Minu tööelu kaart” as the S16 one-minute talk.
// Module 1 (003) already debated the four-day week and module 1 had the letter about study time: neither comes back here.
// Grammar line by discovery and spiralled: the essive -na for a role, a job and a time of life vs the translative -ks of
// change and aim (026, grammarPlan 'essive'; again 028 „kolleegina, vahetuse vanemana”, 030), comparison (pikem kui, kõige
// olulisem, sama … kui, eelistama mida millele; 027), fact instead of blame with the role in the essive (028), balancing
// connectors with the verb second (ühelt poolt … teiselt poolt, kuigi, siiski, samas; 029, spiralling module 5).
// The one long text of the module is the topic opener (026 station 2, ≈ 330 words, after a 15-minute hook and pre-taught
// words). The course's cast is not used. Ids and goal keys stay (g_vocab / g_read / g_notice / g_use; g_listen is added
// where a lesson now listens). The v2 storyline version (Sofia's Tartu warehouse) is in git history before 2026-11-18.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 6. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

// theme: a themed module may give every lesson its theme's topic, each with its own sub-topic (§7.3, v4Tasks.test.js)
export const MODULE = { id: 'b1b2-module-06', course: 'b2', title: 'Tööelu', level: 'B1+', design: 'v3-stations', template: 'v4', theme: 'work' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-026': {
    title: 'Kellena sa end viie aasta pärast näed?',
    phases: grammar('Keel: olev ja saav kääne — töötan müüjana, alustasin praktikandina, tahan saada meistriks'),
    format: 'quest',
    topic: 'work',
    subtopic: 'job-search',
    canDo: 'Ma räägin oma töökogemusest (töötasin …na, alustasin …na) ja eesmärgist (tahan saada …ks), leian endale sobiva töökuulutuse ja vastan töövestlusel küsimusele „Rääkige endast”.',
    teacherPage: {
      goal: 'Ученик рассказывает о своём опыте (olev kääne -na) и цели (saav kääne -ks), выбирает вакансию и отвечает на собеседовании на «Расскажите о себе».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 2 вопроса; станция 3 — аудио, правило и 2 свои строки CV; станция 4 — выбор объявления и рассказ о себе 1 минута без вопросов работодателя. Текст (станция 2) — дома, вопросы к нему в начале следующего урока.',
      hook: '«Кем ты работал на своей первой работе — или за какое первое дело тебе заплатили или сказали спасибо? Кем хочешь работать через пять лет?» Ответьте сами одной фразой («Mina alustasin kelnerina»), потом ученик. Первые 5 минут не исправлять.',
      plan: [
        '0–4: крючок — первая работа и работа через пять лет, ученик отвечает сразу',
        '4–15: станция 1 — разговор: как я нашёл работу или учёбу, что для меня хорошая работа',
        '15–30: станция 2 — слова (2 мин), прогноз «Как в Эстонии ищут работу?», текст, 6 вопросов людей',
        '30–45: станция 3 — три пути на работу на слух (прогноз → общий смысл → 7 пропусков), заметить -na / -ks → правило → 4 своих строки CV, произношение',
        '45–60: станция 4 — четыре объявления, выбор, собеседование «Rääkige endast» 1–2 минуты и два вопроса',
        '60–72: «Kui aega jääb» — игра: три трудных вопроса на собеседовании',
        '72–78: проверка на выходе (3 предложения), «Ma oskan …», разбор 3 ошибок',
        '78–85: домашнее задание: сопроводительное письмо, запись 1 минуты, слова',
        '85–90: запас',
      ],
      sources: 'Текст станции 2: Statistikaamet, «Töötuse määr oli kolmandas kvartalis 7,9%» (2026); Eesti Töötukassa, karjäärinõustamine — бесплатно для всех: безработных, работающих, учащихся и пенсионеров (minukarjaar.ee). Испытательный срок — тема урока 027. Аудио «Kolm teed tööle» и объявления — учебные тексты.',
      groups: 'Станция 1 — в парах. Аудио — каждый сам, сверка в паре. Станция 4: каждый выбирает своё объявление, второй — работодатель с вашими двумя вопросами; в 1:1 работодатель — вы. Игра «Kui aega jääb» — по очереди, вы держите время.',
      errors: [
        '«Ma töötan müüjaks» → «Ma töötan müüjana» (работать кем — olev kääne -na).',
        '«Ma tahan saada meistrina» → «Ma tahan saada meistriks» (стать кем — saav kääne -ks).',
        '«Ma alustasin praktikantina» → «praktikandina» (-na / -ks присоединяются к родительному падежу: praktikant → praktikandi).',
        '«Kui ma olin laps, …» правильно, но короче и по-B2: «Lapsena …», «Tudengina …».',
      ],
      notes: [
        'Формат — маршрут из трёх контрольных точек: где искать работу (текст) → CV (аудио и правило) → объявление и собеседование. Ученик без работы: летняя работа, волонтёрство, работа по дому и уход за близкими тоже опыт — так и говорите. Пенсионеру подходит объявление библиотеки, маме в отпуске — удалённая служба поддержки, студенту — летний гид, уставшему начальнику смены — логистический планировщик.',
        'Произношение, 3 минуты на станции 3: ударение всегда на первом слоге и в длинной форме — MÜÜjana, PRAKtikandina, VAhetuse VAnemana. Сначала вы читаете две формы, ученик слушает, где ударение, потом читает свои строки CV.',
        'Обратная связь, 2–3 цели: -na (роль) / -ks (изменение, цель); форма от родительного падежа (õde → õena, tõlk → tõlgina); на собеседовании — конкретный пример вместо общих слов. В рассказе о себе не перебивать, 3 замечания в конце.',
      ],
    },
    discover: [
      station(B.text('026_d_hook', 'Esimene töö', 'Mis oli sinu esimene töö või ülesanne, mille eest said palka või kiitust? Kellena sa siis töötasid? Ja kellena tahaksid töötada viie aasta pärast?'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('026_d_talk', 'Minu tee tööni.', 'Vasta ja too näide oma elust.', [
        'Kuidas sa oma praeguse töö, kooli või tegevuse leidsid?',
        'Mis on sinu jaoks hea töö ja miks?',
      ], [150, 210], ['Praegu töötan …na', 'Leidsin selle …']), 'Sinu kogemus on tunni esimene näide ja sinu CV algus.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma esimesest tööst. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas. Kui õpilane ei tööta: „Kellena sa oled vabatahtlikult, suvel või kodus tegutsenud?” (lapsehoidja, abiline, vabatahtlik, hooldaja).')),
      station(tag(B.vocab('026_d_vocab', 'Enne lugemist: sõnad.', ['tööotsija — ищущий работу', 'kuulutus — объявление', 'kandideerima — подавать заявку на должность', 'ametikoht — должность', 'kogemus — опыт', 'töötus — безработица', 'karjäärinõustaja — карьерный консультант', 'kaaskiri — сопроводительное письмо', 'vestlus — беседа', 'katseaeg — испытательный срок']), { topic: ['kaaskiri', 'karjäärinõustaja'] }), 2, 15),
      B.topicOpener('026_d_open', 'Moodul 6. Töö Eestis: kuidas leida ja kuidas hoida?', [
        'Töö ei ole ainult palk. Töö annab päevale rütmi, toob uusi tuttavaid ja aitab keelt harjutada. Samas ei ole töö leidmine alati lihtne. Statistikaameti andmetel oli 2026. aasta kolmandas kvartalis Eestis töötuse määr 7,9 protsenti. Tõenäoliselt on kõige raskem neil, kes otsivad esimest tööd, kes on pärast pikka pausi tööle naasmas või kes tahavad ametit vahetada. Seepärast on tööotsijal kasulik teada, mida ta juba oskab ja kuidas seda teistele näidata.',
        'Kuidas tööd leida? Enamik töökuulutusi on internetis: tööportaalides, firmade kodulehtedel ja töötukassa iseteeninduses. Paljud töökohad täidetakse aga tuttavate kaudu, enne kui kuulutus üldse ilmub. Seepärast tasub oma soovist rääkida sõpradele, endistele kolleegidele ja naabritele. Töökuulutuses on tavaliselt kirjas ametikoht, ülesanded, nõuded, tööaeg ja palk. Kui palka ei ole kirjas, võib seda töövestlusel julgelt küsida. Kes ei tea, kust alustada, võib pöörduda töötukassa poole. Töötukassa karjäärinõustamine on tasuta kõigile: töötutele ja töötavatele, õppijatele ja ka pensioniealistele.',
        'Kandideerimiseks on tavaliselt vaja CV-d ja kaaskirja. CV on lühike, enamasti üks või kaks lehekülge. Töökogemus kirjutatakse alates viimasest töökohast: aeg, ametikoht, tööandja ja peamised ülesanded. Kaaskirjas selgitad, miks just see töö sind huvitab ja mida sa tööandjale pakud. Ka vabatahtlik töö, suvetöö, praktika ja kodus lähedase eest hoolitsemine on kogemus, mida võib kirja panna. Kes on kasvatanud lapsi või hooldanud vanemaid, oskab sageli planeerida ja rahulikuks jääda. Hea CV on lühike ja aus: ära kirjuta oskust, mida sul ei ole, aga ära unusta ka seda, mida sa tõesti oskad.',
        'Kui kuulutus sobib, kutsutakse sind töövestlusele. Sageli on esimene küsimus „Rääkige endast”. Hea vastus kestab üks-kaks minutit: kes sa oled, kellena oled töötanud, mida oskad ja miks soovid just seda tööd. Vaevalt jääb tööandjale meelde lause „ma olen täpne”, seepärast tasub rääkida konkreetsete näidetega: mitte üldiselt, vaid „vahetuse vanemana vastutasin selle eest, et kaup läks õigel ajal välja”. Pärast vestlust tasub küsida, millal otsus tehakse, ja mõni päev hiljem viisakalt meelde tuletada, kui vastust ei ole tulnud.',
        'Selles moodulis käid tööelu tee algusest lõpuni: räägid oma kogemusest, kontrollid töölepingut, lahendad tüli kolleegiga ja kaalud, kas sinu oskusest saaks väike äri.',
      ], 'Statistikaamet, „Töötuse määr oli kolmandas kvartalis 7,9%” (2026); Eesti Töötukassa, karjäärinõustamine', [
        'Kas sa oled kunagi CV-d või kaaskirja kirjutanud? Mis oli kõige raskem?',
        'Kuidas otsitakse tööd sinu kodumaal teisiti kui Eestis?',
        'Mida peaks tegema inimene, kes on pool aastat tööd otsinud ja midagi ei leia?',
        'Millised ametid on sinu arvates kümne aasta pärast Eestis kõige otsitumad?',
      ]),
      tag(purpose(B.table('026_d_read', 'Kontrollpunkt 1: kus ja kuidas tööd otsida?', 'Vasta igale küsimusele ühe-kahe sõnaga, nagu tekst ütleb.', 'Küsimus, Vastus', [
        'Naaber: „Kui suur oli Eestis töötuse määr 2026. aasta kolmandas kvartalis?” | [7,9 protsenti/7,9%/7,9 %/7,9]',
        'Pensionärist tuttav: „Kas töötukassa karjäärinõustamine on ka mulle tasuta?” | [jah/jah, kõigile/on]',
        'Õde: „Kuidas leida töökoht, mille kuulutust veel ei ole?” | [tuttavate kaudu/tuttavatelt/sõprade kaudu]',
        'Üliõpilane: „Millisest töökohast ma CV-s alustan?” | [viimasest/viimasest töökohast]',
        'Sõbranna: „Ma hoolitsesin kolm aastat kodus lapse eest. Kas võin selle CV-sse kirjutada?” | [jah/võib/jah, see on kogemus]',
        'Kolleeg: „Mida tasub pärast töövestlust küsida?” | [millal otsus tehakse/otsuse aega/millal otsustatakse]',
      ], 'g_read'), 'Inimesed sinu ümber küsivad töö otsimise kohta; nüüd vastad neile teksti järgi.'), { task: 'R15' }),
    ],
    practice: [
      station(tag(purpose(B.listening('026_p_paths', 'Kontrollpunkt 2: kolm teed tööle.', 'Kuula kaks korda ja kirjuta lünka üks sõna.', [
        'Oksana: Ma tulin Narva kakskümmend aastat tagasi. Alguses töötasin poes müüjana ja õhtuti õppisin eesti keelt. Viis aastat tagasi sain vahetuse vanemaks. Nüüd tahaksin saada laoplaneerijaks, sest lapsena armastasin ma matemaatikat ja plaane.',
        'Kevin: Mina olen üliõpilane. Eelmisel suvel olin muuseumis giidina ja talvel tegin vabatahtlikuna toidupangas tööd. Pärast ülikooli tahaksin saada õpetajaks. Praegu otsin osalise tööajaga kohta, sest õppimine on mulle tähtsam kui raha.',
        'Valentina: Mina olen pensionär. Kolmkümmend aastat töötasin raamatupidajana. Nüüd käin kaks korda nädalas raamatukogus abilisena ja aitan vanemaid inimesi arvutiga. Lapselapsed ütlevad naljaga, et vanaduses töötan ma IT-spetsialistina.',
      ], [
        'Kui Oksana kakskümmend aastat tagasi Narva tuli, töötas ta alguses poes [müüjana].',
        'Viis aastat tagasi sai Oksana oma laos vahetuse [vanemaks].',
        'Nüüd tahaks Oksana saada [laoplaneerijaks], sest ta armastab plaane.',
        'Eelmisel suvel töötas üliõpilane Kevin linna muuseumis [giidina].',
        'Talvel tegi Kevin toidupangas tööd [vabatahtlikuna] ja sai sealt kogemuse.',
        'Enne pensionile minekut töötas Valentina kolmkümmend aastat [raamatupidajana].',
        'Raamatukogus käib Valentina kaks korda nädalas [abilisena] ja aitab vanemaid inimesi.',
      ], 'g_notice'), 'Kolm päris teed tööle näitavad, kuidas oma kogemusest räägitakse.'), { task: 'L03' }), 3, 15),
      B.notice('026_p_notice', 'Märka: kellena? kelleks?', [
        'Kuulamisest: **lapsena** armastasin ma matemaatikat · vanaduses töötan ma **IT-spetsialistina** · pärast ülikooli tahaksin saada **õpetajaks**. Vaata oma lünki: kus on -na, kus -ks?',
        '**Olev kääne -na** — roll, amet või eluaeg: **kellena?** Töötan **kokana**. Olin laagris **kasvatajana**. **Lapsena**, **noorena**, **tudengina** = kui olin laps, noor, tudeng.',
        '**Saav kääne -ks** — muutus või eesmärk: **kelleks?** Sain **meistriks**. Tahan saada **õpetajaks**. Mind valiti **juhiks**. Õpin **õeks**.',
        'Mõlemad tehakse **omastavast**: kokk → koka → koka**na** / koka**ks** · praktikant → praktikandi → praktikandi**na** · õde → õe → õe**na** · tõlk → tõlgi → tõlgi**na**',
        'Tegusõna aitab: **olen, töötan, tegutsen, alustasin, käin** + -na · **saan, tahan saada, õpin, mind valiti, mind määrati** + -ks',
      ], 'full'),
      teach(tag(purpose(B.writing('026_p_mycv', 'Minu CV neli rida.', 'Kirjuta oma CV jaoks 4 lauset: kaks kogemust (-na), üks eluaeg (lapsena …) ja üks eesmärk (-ks). Kogemus võib olla ka vabatahtlik töö või kodus hoolitsemine.', [4, 4], ['töötasin', 'saada'], 1, 'g_notice'), 'Need neli lauset lähevad otse sinu CV-sse ja töövestlusele.'), { task: 'W07', level: 3 }),
      'Kontrolli iga lauset küsimusega „Kellena? Kelleks?”. Kui vorm on vale, ütle ainult: „Mis on omastav?” (õde → õe → õena, tõlk → tõlgi → tõlgina, abiline → abilise → abiliseks). Hääldus: loe üks lause ette, õpilane kordab oma lause; rõhk on alati esimesel silbil, ka pikas vormis nagu müüjana või praktikandina.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('026_t_ads', 'Kontrollpunkt 3: neli kuulutust.', 'Loe kuulutusi ja vali endale üks. Tõmba alla, mis sobib sulle ja mis mitte.', [
        ['Laoplaneerija, Narva', ['Täistööaeg, E–R kell 8–16.', 'Ootame inimest, kes on töötanud laos vähemalt kaks aastat, näiteks vahetuse vanemana.', 'Eesti keel suhtlustasemel, vene keel on eelis.', 'Pakume koolitust ja tasuta parkimist.'], []],
        ['Raamatukogu klienditeenindaja, Tartu', ['Osaline tööaeg, 20 tundi nädalas, ka laupäeviti.', 'Sobib ka pensionärile või üliõpilasele.', 'Aitad lugejaid arvutis ja e-teenustes.', 'Kogemus klienditeenindajana on eelis.'], []],
        ['Suvetöö: muuseumi giid, Tallinn', ['Juuni–august, graafik kokkuleppel.', 'Juhatad gruppe eesti, vene ja inglise keeles.', 'Enne tööd on kahenädalane koolitus.', 'Sobib tudengile, kogemust ei ole vaja.'], []],
        ['E-poe klienditugi, kaugtöö', ['25–30 tundi nädalas, paindlik tööaeg.', 'Vastad klientide kirjadele ja kõnedele.', 'Sobib ka lapsevanemale.', 'Vajalik on arvuti, rahulik meel ja hea kirjalik eesti keel.'], []],
      ], '2'), 'Valid kuulutuse, mis sobib sinu eluga; selle järgi räägid kohe töövestlusel.'), { task: 'R11' }), 4, 15, { final: 'present' }),
      teach(tag(purpose(B.rolecards('026_t_interview', 'Töövestlus: „Rääkige endast”.', 'Räägi 1–2 minutit endast valitud kuulutuse järgi ja vasta tööandja kahele küsimusele.',
        'Olukord: oled töövestlusel valitud kuulutuse järgi.\nSinu eesmärk: tööandja jätab sind meelde — kes sa oled, kellena oled töötanud, mida oskad ja miks tahad just seda tööd.\nPiirang: ühte kuulutuses nõutud asja sul ei ole; ütle, mis sul selle asemel on.',
        'Tööandja kaart on õpetajal: kaks küsimust ja üks kahtlus.',
        ['Olen töötanud …na …', 'Lapsena / tudengina …', 'Selle töö juures huvitab mind …', 'Tulevikus tahaksin saada …ks.'], ['Kellena olete varem töötanud?', 'Miks just meie?', 'Kus näete end viie aasta pärast?']), 'Tulemus: sinu esimene töövestlus eesti keeles on tehtud ja sa tead, mida veel harjutada.'), { task: 'S16', main: true, level: 4, harno: 'S1' }),
      'Õpetaja kaart: sina oled tööandja (kuulutus, mille õpilane valis). Kuula 1–2 minutit vahele segamata. Siis kaks küsimust: 1) „Kellena olete varem töötanud ja mis oli seal kõige raskem?” 2) „Kus näete end viie aasta pärast?” Üks kahtlus: „Teil ei ole ju … kogemust?” Õnnestunud, kui õpilane räägib vähemalt minuti, kasutab vähemalt kolm korda olevat käänet (-na) ja ühe korra saavat käänet (-ks) õigesti ja vastab kahtlusele rahulikult (mis tal on selle asemel). Lõpus kolm märkust, mitte rohkem.'),
      extension(teach(tag(purpose(B.speaking('026_t_more', 'Mäng: kolm rasket küsimust.', 'Õpetaja esitab kolm ootamatut küsimust. Sul on igaühe jaoks 30 sekundit mõtlemiseks ja 1 minut vastuseks.', [
        'Miks te oma eelmisest töökohast lahkusite?',
        'Mis on teie suurim nõrkus?',
        'Miks peaksime valima just teid, mitte kogenumat kandidaati?',
      ], [120, 180], ['Ausalt öeldes …', 'Õpin praegu …', 'Minu eelis on …']), 'Kui oled rasked küsimused ette läbi mõelnud, ei ehmata need sind päris vestlusel.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (12 min). Küsi üks küsimus korraga ja hoia aega. Pärast iga vastust üks nõuanne: kuidas öelda sama positiivsemalt (nõrkus → „Õpin …”, lahkumine → „Tahtsin areneda …”). Vastus ei pea olema õpilase päris lugu — see on harjutus.'), 12),
      tag(exitCheck(purpose(B.gaps('026_t_exit', 'Kontrolli end: kellena või kelleks?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Enne seda töötasin kaks aastat Sillamäe sadamas [kraanajuhina]. (kraanajuht)',
        'Viie aasta pärast tahaksin saada [laojuhatajaks]. (laojuhataja)',
        'Enne lapse sündi töötasin viis aastat Jõhvi haiglas [õena]. (õde)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas olev ja saav kääne on käes.')), {}),
      purpose(B.selfcheck('026_t_self', ['Ma räägin oma töökogemusest: kellena olen töötanud ja mida tegin.', 'Ma leian tekstist, kuidas Eestis tööd otsitakse ja kes aitab.', 'Ma eristan olevat ja saavat käänet (töötan müüjana / tahan saada meistriks).', 'Ma vastan töövestlusel küsimusele „Rääkige endast”.'], 'Vestlus tehtud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('026_t_letter', 'Kodus: kaaskiri.', 'Tunnis: plaan suuliselt. Kodus: kaaskiri valitud kuulutusele, 120–150 sõna — miks see töö sind huvitab, kellena oled töötanud või mida teinud, mida tööandjale pakud ja millal saad alustada.', 'Lugupeetud värbamisjuht!', 'Lugupidamisega\n(sinu nimi)', [120, 150]), 'Tööandja loeb kaaskirja enne CV-d; hea kiri toob sind vestlusele.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('026_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: milline töö sobiks sulle viie aasta pärast ja miks.', [
        'Kellena tahaksid viie aasta pärast töötada?',
        'Mida pead selleks õppima või tegema?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi enne järgmist tundi ja annab ühe nõu.')), { task: 'S15' }),
      homework('026_t_homework', ['1. Kaaskiri, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-027': {
    title: 'Kas sa kirjutaksid sellele lepingule alla?',
    phases: grammar('Keel: võrdlemine — lühem kui, kõige olulisem, sama pikk kui, eelistan kirjalikku lepingut suulisele'),
    format: 'facts',
    topic: 'work',
    subtopic: 'rights',
    canDo: 'Ma saan kuuldust aru, mida töölepingu seadus ütleb katseaja, puhkuse, haiguslehe ja ületundide kohta, võrdlen kahte tööpakkumist ja räägin sõbrale, mida enne lepingu allkirjastamist küsida.',
    teacherPage: {
      goal: 'Ученик понимает основные права по töölepingu seadus, сравнивает два предложения (keskvõrre, ülivõrre, eelistama) и советует другу, что спросить до подписания договора (медиация).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: угадайка (5 фактов); станция 3 — правило и 4 сравнения; станция 4 — договор друга и совет без расширения. Радио (станция 2) — дома, ответы угадайки — в начале следующего урока.',
      hook: '«Угадай: сколько может длиться испытательный срок? Сколько дней отпуска? Кто платит за первые дни болезни? Как оплачиваются сверхурочные? Как часто платят зарплату?» Ученик выбирает ответы сразу и вслух объясняет одну догадку; ответы — после радио.',
      plan: [
        '0–5: крючок — угадай 5 фактов о законе (выбор ответа)',
        '5–15: станция 1 — разговор: свой договор, что в нём важнее всего',
        '15–30: станция 2 — слова (2 мин), радио «Küsi juristilt» дважды: прогноз (угадайка) → общий смысл → проверка угадайки → 7 пропусков',
        '30–42: станция 3 — сравнение: заметить в радио → правило → два предложения работы: 7 сравнений',
        '42–57: станция 4 — договор друга: что законно, что нет; совет другу (медиация)',
        '57–69: «Kui aega jääb» — звонок юристу Tööinspektsioon',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо работодателю, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Töölepingu seadus (Riigi Teataja, действующая редакция 2026): § 5 — что должно быть в письменном договоре; § 6 — испытательный срок четыре месяца; § 33 — зарплата раз в месяц, если не договорились чаще; § 43 — полное время 40 часов в неделю; § 44 — сверхурочные: свободное время в том же объёме или 1,5-кратная оплата; § 55 — основной отпуск 28 календарных дней; § 96 — на испытательном сроке предупреждение минимум за 15 дней. Больничный: tervisekassa.ee «Haigushüvitis» — дни 1–3 не оплачиваются, 4–8 платит работодатель (70 %), с 9-го — Tervisekassa (70 %). Tööinspektsioon: бесплатная консультация юриста 640 6000 (пн–пт 9–15), jurist@ti.ee. Радио и договор Дениса — учебные тексты.',
      groups: 'Угадайка — каждый сам, потом сравниваете. Радио — каждый сам, сверка в паре. Станция 4: пары «советчик — Денис», второй получает вашу карточку Дениса. В 1:1 Денис — вы.',
      errors: [
        '«Neli kuud on lühem nagu kuus» → «lühem kui kuus» (после сравнительной степени — kui).',
        '«kõige pikem kui …» → «pikem kui …» или «kõige pikem» (превосходная степень без kui).',
        '«Ma eelistan kirjalik leping suuline» → «Ma eelistan kirjalikku lepingut suulisele» (eelistama mida — партитив, millele — аллатив).',
        '«sama pikem kui» → «sama pikk kui» (после sama — основная форма).',
      ],
      notes: [
        'Формат — анализ фактов: сначала мнение (голосование), потом закон (радио), потом настоящий документ. Это не юридическая консультация: в сложных случаях — Tööinspektsioon (640 6000) или töövaidluskomisjon (без госпошлины).',
        'Ученик без работы: договор подруги, сына или внука на летнюю работу; маме в отпуске — что спросить перед возвращением на работу (точные вопросы — в Tööinspektsioon). Тема «конверта» деликатная: не спрашивайте, работал ли ученик сам без договора; спросите про «знакомых».',
        'Обратная связь, 2–3 цели: keskvõrre + kui; eelistama mida millele; ясный совет (что спросить и у кого). Сначала подсказка («Kumb on pikem?»), рекаст — только если не исправил сам.',
      ],
    },
    discover: [
      station(tag(purpose(B.choice('027_d_vote', 'Arva ära: mida seadus lubab?', 'Vali kohe vastus, mida sa arvad. Pärast raadiot kontrolli ja paranda.', [
        ['Kui kaua võib Eestis kesta uue töötaja katseaeg?', 'kuni neli kuud', 'kuni kuus kuud', 'kuni aasta'],
        ['Mitu päeva põhipuhkust on töötajal õigus aastas saada?', '28 kalendripäeva', '21 kalendripäeva', '14 kalendripäeva'],
        ['Kes maksab haiguse esimese kolme päeva eest?', 'keegi ei maksa', 'tööandja', 'tervisekassa'],
        ['Kuidas makstakse ületunnitöö eest, kui on kokku lepitud raha?', '1,5-kordse tasuga', 'tavalise tasuga', 'kahekordse tasuga'],
        ['Kui tihti peab tööandja palka maksma?', 'vähemalt kord kuus', 'kord kahe kuu jooksul', 'kord kvartalis'],
      ], 'full', 'g_listen'), 'Sinu arvamus enne fakte: pärast raadiot näed, kus sa eksisid.'), { task: 'L10' }), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('027_d_talk', 'Minu leping.', 'Vasta ja too näide.', [
        'Kas sa lugesid oma viimase lepingu enne allkirjastamist läbi?',
        'Mis on lepingus sulle kõige olulisem?',
      ], [150, 210], ['Kõige olulisem on …', '… on tähtsam kui …']), 'Sinu kogemus näitab, mida lepingus esimesena vaadata.'), { task: 'S11', fluency: true }),
      'Üks-ühele: vasta ka ise. Leping võib olla töö-, üüri- või telefonileping. Kui õpilasel pole kunagi töölepingut olnud: „Mida sa küsiksid, kui sinu laps või sõber saaks esimese töölepingu?” Ära paranda, lõpus ütle üks võrdlus, mida õpilane kasutas.')),
      station(tag(B.vocab('027_d_vocab', 'Enne kuulamist: sõnad.', ['tööleping — трудовой договор', 'töötasu — заработная плата', 'puhkus — отпуск', 'haigusleht — больничный лист', 'hüvitis — пособие', 'ületunnid — сверхурочные часы', 'allkirjastama — подписывать', 'ümbrikupalk — зарплата в конверте', 'õigus — право', 'palgapäev — день выплаты зарплаты']), { topic: ['ümbrikupalk', 'haigusleht'] }), 2, 15),
      tag(purpose(B.listening('027_d_radio', 'Raadio: küsi juristilt.', 'Kuula kaks korda. Kontrolli oma vastuseid jaamas 1 ja kirjuta lünka 1–2 sõna või arv.', [
        'Saatejuht: Tere! Täna vastab kuulajate küsimustele töösuhete jurist Merike Pärn. Esimene kuulaja kirjutab: tööandja pakub lepingut, kus katseaeg on kuus kuud. Kas see on lubatud?',
        'Merike: Ei ole. Seaduse järgi kestab katseaeg kuni neli kuud. Lühemas ajas võib kokku leppida, pikemas mitte. Katseajal on lepingu lõpetamine lihtsam, aga ka siis on etteteatamise aeg vähemalt viisteist päeva.',
        'Saatejuht: Teine küsimus: kui palju puhkust töötajal on?',
        'Merike: Põhipuhkus on kakskümmend kaheksa kalendripäeva aastas. Rohkem võib kokku leppida, vähem mitte.',
        'Saatejuht: Kolmas kuulaja jäi haigeks. Kes maksab haiguspäevade eest?',
        'Merike: Esimese kolme päeva eest hüvitist ei maksta. Neljandast kaheksanda päevani maksab tööandja ja alates üheksandast päevast tervisekassa. Hüvitis on seitsekümmend protsenti keskmisest töötasust.',
        'Saatejuht: Ja ületunnid?',
        'Merike: Ületunnitöö eest saab vaba aega sama palju, kui tööd tehti. Kui on kokku lepitud raha, maksab tööandja poolteist korda tavalise tunnitasu.',
        'Saatejuht: Üks kuulaja küsib palgapäeva kohta.',
        'Merike: Palk tuleb maksta vähemalt kord kuus, kui ei ole kokku lepitud, et sagedamini.',
        'Saatejuht: Viimane kuulaja küsib, kas ümbrikupalk on nii halb, kui raha on kohe käes.',
        'Merike: Kirjalik leping ja ametlik palk on alati kindlamad kui ümbrikupalk. Ümbrikupalga pealt ei maksta makse, seega on haigushüvitis ja tulevane pension väiksemad või puuduvad sootuks. Kõige olulisem nõuanne: lugege leping enne allkirja läbi ja küsige julgelt. Tööinspektsiooni juristid nõustavad tasuta telefoni ja e-kirja teel.',
      ], [
        'Kui leping lõpetatakse katseajal, on etteteatamise aeg vähemalt [viisteist|15] päeva.',
        'Põhipuhkust võib kokku leppida rohkem, aga seaduse järgi mitte [vähem].',
        'Neljandast kaheksanda haiguspäevani maksab haigushüvitist [tööandja].',
        'Kui haigusleht kestab kauem, maksab hüvitist alates üheksandast päevast [tervisekassa].',
        'Haigushüvitis on juristi sõnul [seitsekümmend|70] protsenti keskmisest töötasust.',
        'Ümbrikupalga pealt ei maksta [makse|maksusid], seega kannatavad hüvitis ja pension.',
        'Tööinspektsiooni juristid nõustavad töötajaid telefoni ja e-kirja teel [tasuta].',
      ], 'g_listen'), 'Raadio kontrollib sinu oletusi ja annab faktid, mida vajad sõbrale nõu andes.'), { voice: 'interview', task: 'L04' }),
    ],
    practice: [
      station(B.notice('027_p_notice', 'Märka: kumb on parem?', [
        'Raadiost: kirjalik leping on alati **kindlam kui** ümbrikupalk · **kõige olulisem** nõuanne · **lühemas** ajas võib kokku leppida, **pikemas** mitte · **rohkem** võib kokku leppida, vähem mitte',
        '**Keskvõrre** (-m) + **kui**: pikk → **pikem**, kindel → **kindlam**, hea → **parem**, palju → **rohkem**; ka kus? kuhu?: kaugel → **kaugemal**: Uus töökoht on **kaugemal kui** vana.',
        '**Ülivõrre**: **kõige** + keskvõrre: **kõige kindlam**, **kõige parem** (ilma „kui”-ta).',
        'Võrdsus: **sama** + algvorm + **kui**: Palk on **sama suur kui** eelmisel aastal. Eitus: Uus leping ei ole **nii kindel kui** vana.',
        '**eelistama** mida (osastav) **millele** (alaleütlev): Tööle sõites eelistan **bussi autole**.',
        'Vastand: A palk on suurem, **seevastu** B katseaeg on lühem. **Erinevalt** pakkumisest A on B leping kirjalik.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('027_p_offers', 'Kaks pakkumist: võrdle.', 'Sõber sai kaks tööpakkumist. Kirjuta lünka võrdlus, mis sobib andmetega.', [
        'Palk: A 1200 €, B 1100 €. Pakkumises A on palk [suurem|kõrgem] kui pakkumises B.',
        'Katseaeg: A kuus kuud, B neli kuud. B katseaeg on [lühem] ja vastab seadusele.',
        'Põhipuhkus: mõlemas 28 päeva. Põhipuhkus on mõlemas pakkumises [sama] pikk.',
        'Ületunnitöö: A-s iga nädal, B-s harva. B-s on ületunnitööd [vähem] kui A-s.',
        'Vahetused: A pakub öövahetusi, B päevavahetusi. Ma eelistan päevavahetusi [öövahetustele].',
        'Asukoht: A on 3 km, B 12 km kaugusel. A on kodule [lähemal] kui B.',
        'Palgapäev: A-s kord kahe kuu jooksul, B-s kord kuus. B-s makstakse palka [sagedamini|tihedamini] kui A-s.',
        'Kolmas sõber sai pakkumise C, kus katseaeg on kaks kuud. Kolmest pakkumisest on C katseaeg [kõige lühem|lühim].',
      ], '', 'full', 'g_notice'), 'Kui võrdlus on täpne, näeb sõber kohe, kumb pakkumine on tema jaoks parem.'), { task: 'G13', harno: 'R3' }),
      'Pärast lünki küsi: „Kumma lepingu allkirjastaksid sina ja miks?” Õpilane vastab kahe võrdlusega (… on lühem kui …, kõige olulisem on …). Kui ta ütleb „parem nagu”, küsi: „Parem kui … või parem nagu …?”'),
      B.know('027_p_know', ['Puhkust ei planeerita viimasel minutil: tööandja koostab iga aasta kohta puhkuste ajakava ja teeb selle töötajatele teatavaks aasta esimese kvartali jooksul. Kes tahab suvel puhata, räägib sellest juba talvel. Töösuhete küsimustele leiab vastuseid ka Tööinspektsiooni portaalist Tööelu.'], 'töölepingu seadus § 69 (Riigi Teataja); Tööinspektsioon, Tööelu portaal, „Puhkuse ajakava”', 'Kas teadsid? Puhkuste ajakava'),
    ],
    transfer: [
      station(tag(purpose(B.reading('027_t_contract', 'Sõbra tööleping', 'Loe sõbra lepingu väljavõtet ja vasta oma sõnadega.', 'Denise tööleping', 'Sõber Denis saatis sulle pildi oma töölepingust ja küsib: „Kirjutan homme alla. Kas kõik on korras?”\n\nTÖÖLEPING (väljavõte)\n\n1. Töötaja töötab laotöötajana ja tema tööaeg on 40 tundi nädalas.\n\n2. Töötajal on tööle asumise päevast alates kuuekuuline katseaeg.\n\n3. Töötasu on 1100 eurot kuus ja see makstakse välja iga kahe kuu tagant.\n\n4. Töötaja põhipuhkus on 21 kalendripäeva iga töötatud aasta eest.\n\n5. Ületunnitöö hüvitatakse töötajale samas ulatuses vaba ajaga.\n\n6. Lisatasu kuni 300 eurot kuus makstakse sularahas ja seda lepingusse ei kirjutata.', [
        ['Mida Denis sinult palub ja millal ta tahab lepingule alla kirjutada?'],
        ['Milline lepingu punkt teeb sulle esimese lugemise järel kõige rohkem muret ja miks?'],
      ], 'g_read'), 'Sõber usaldab sind; enne nõu andmist pead lepingu ise läbi lugema.'), { task: 'R13' }), 4, 15, { final: 'advise' }),
      tag(purpose(B.table('027_t_check', 'Mis lepingus on valesti?', 'Otsusta iga punkti kohta raadio ja seaduse järgi: kas see on korras?', 'Lepingu punkt, Kas see on korras? (jah / ei)', [
        '1. Laotöötaja tööaeg on lepingu järgi 40 tundi nädalas. | [jah/on]',
        '2. Uue töötaja katseaeg kestab lepingu järgi kuus kuud. | [ei/ei ole]',
        '3. Palgapäev on lepingu järgi ainult iga kahe kuu tagant. | [ei/ei ole]',
        '4. Põhipuhkust on lepingu järgi 21 kalendripäeva aastas. | [ei/ei ole]',
        '5. Ületunnitöö hüvitatakse samas ulatuses vaba ajaga. | [jah/on]',
        '6. Lisatasu makstakse sularahas ja seda lepingusse ei kirjutata. | [ei/ei ole]',
      ], 'g_read'), 'Denis kirjutab homme alla; sinu kontroll näitab, milliseid punkte enne muuta.'), { task: 'R08' }),
      teach(tag(purpose(B.rolecards('027_t_advise', 'Anna sõbrale nõu.', 'Seleta sõbrale, mis tema lepingus on valesti, ja leppige kokku, mida ta enne allkirja tööandjalt küsib.',
        'Olukord: sõber tahab homme lepingule alla kirjutada ja küsib sinu arvamust.\nSinu eesmärk: sõber teab, millised punktid ei vasta seadusele, ja kirjutab üles kaks küsimust tööandjale.\nPiirang: sõber vajab tööd väga ja kardab küsida.',
        'Sõbra kaart on õpetajal: tema hirmud ja üks vastuväide.',
        ['Seaduse järgi …', 'See on pikem kui …', 'Kõige olulisem on …', 'Ma eelistaksin …', 'Küsi tööandjalt, kas …'], ['Aga kõik teevad nii!', 'Mis siis, kui nad mind ei võta?', 'Sularaha on ju parem!']), 'Tulemus: sõber teab, mida ta enne allkirja küsib, ega kirjuta alla lepingule, mis on tema kahjuks.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart: sina oled sõber Denis. Varjatud info: oled kaks kuud tööta olnud ja üür tuleb maksta; tööandja ütles suuliselt, et „katseaeg on lihtsalt formaalsus”; sulle meeldib mõte sularahast. Takistused ükshaaval: 1) „Aga kõik teevad nii!” 2) „Kui ma küsin, ei võta nad mind tööle.” 3) „Sularaha on ju parem — maksud jäävad mulle!” Õnnestunud, kui õpilane nimetab vähemalt kolm probleemi koos seadusega, kasutab vähemalt kolm võrdlust (pikem kui, kindlam kui, kõige olulisem, eelistan …), vastab sularaha kohta (haigushüvitis, pension) ja aitab sõnastada kaks küsimust tööandjale. Õpilane, kes ise ei tööta, sobib sellesse rolli hästi: tema on sõber, kes teab rohkem.'),
      extension(teach(tag(purpose(B.rolecards('027_t_more', 'Rollimäng: helista Tööinspektsiooni.', 'Helista Tööinspektsiooni nõustamistelefonile ja küsi oma küsimus.',
        'Olukord: vali üks — oled haiguslehel ja tööandja ei maksa hüvitist; tegid ületunde ja ei saanud midagi; tööandja tahab lepingu katseajal ilma etteteatamiseta lõpetada.\nSinu eesmärk: saada selge vastus ja teada, mida edasi teha.\nPiirang: küsi üks küsimus korraga, nagu Tööinspektsioon ise soovitab. Sul on õigus küsida.',
        'Juristi kaart on õpetajal.',
        ['Mul on küsimus …', 'Kas ma saan õigesti aru, et …?', 'Mida ma peaksin edasi tegema?'], ['Kas teil on kirjalik leping?', 'Mis kuupäeval …?', 'Seaduse järgi …']), 'Telefonis pead küsimuse selgelt sõnastama, muidu ei saa sa vastust.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled Tööinspektsiooni jurist (päriselt: 640 6000, E–R 9–15, jurist@ti.ee, tasuta). Küsi täpsustavaid küsimusi: kas leping on kirjalik, millal, kui palju. Vasta raadio faktide järgi; keerulisema küsimuse korral ütle: „Võite pöörduda töövaidluskomisjoni, see on riigilõivuta.” Õnnestunud, kui õpilane ütleb oma mure ühe-kahe lausega, kontrollib („Kas ma saan õigesti aru, et …?”) ja võtab kokku järgmise sammu.'), 12),
      tag(exitCheck(purpose(B.gaps('027_t_exit', 'Kontrolli end: võrdle.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Neli kuud katseaega on [lühem] kui pool aastat. (lühike)',
        'Ma eelistan kindlat palka suurele [lisatasule]. (lisatasu)',
        'Selles firmas on puhkus [pikem] kui seadus nõuab: kolmkümmend päeva. (pikk)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas võrdlemine on käes.')), {}),
      purpose(B.selfcheck('027_t_self', ['Ma saan raadiost aru, mida seadus ütleb katseaja, puhkuse, haiguslehe ja ületundide kohta.', 'Ma võrdlen kahte pakkumist (lühem kui, kõige olulisem, sama pikk kui).', 'Ma leian lepingust punktid, mis ei vasta seadusele.', 'Ma annan sõbrale nõu, mida enne allkirja küsida.'], 'Leping kontrollitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('027_t_letter', 'Kodus: kiri tööandjale enne allkirja.', 'Kirjuta kodus 120–150 sõna Denise või enda nimel: täna pakkumise eest, nimeta kaks punkti, mis ei vasta seadusele, ja palu need enne allkirjastamist parandada. Toon on viisakas ja kindel.', 'Lugupeetud personalijuht!', 'Lugupidamisega\n(sinu nimi)', [120, 150]), 'Tööandja loeb kirja ja parandab lepingu enne, kui keegi sellele alla kirjutab.')), { task: 'W13' }),
      tag(homeTask(purpose(B.speaking('027_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mis on töölepingus sinu jaoks kõige olulisem ja miks.', [
        'Mis on sulle kõige olulisem: palk, aeg, puhkus või kindlus?',
        'Mida sa enne allkirja kindlasti küsiksid?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi ja ütleb, kas võrdlused on õiged.')), { task: 'S15' }),
      homework('027_t_homework', ['1. Kiri tööandjale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-028': {
    title: 'Kolleeg hilineb jälle — kuidas sellest rääkida?',
    phases: grammar('Keel: fakt, mitte süüdistus · olev kääne rollis — kolleegina, vahetuse vanemana, sõbrana'),
    format: 'infogap',
    topic: 'work',
    subtopic: 'colleagues',
    canDo: 'Ma leian töövestlusest faktid ja süüdistused, räägin tülist faktide ja mina-sõnumiga, lepin teisega kokku lahenduse ja kirjutan kokkuleppest lühikese kokkuvõtte.',
    teacherPage: {
      goal: 'Ученик отличает факт от обвинения, говорит о конфликте «я-сообщением» и в своей роли (-na), договаривается о решении (информационный пробел) и пишет итог договорённости.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 3 — правило и 4 ситуации; станция 4 — разговор без расширения. Чат (станция 2) — дома.',
      hook: '«Согласен или нет: „Лучше промолчать, чем поссориться с коллегой“? Да, нет или зависит — и одна причина из жизни.» Голосуйте оба сразу, вы — с короткой причиной.',
      plan: [
        '0–4: крючок — голосование «молчать или говорить?»',
        '4–12: станция 1 — разговор: когда кто-то не делал свою часть (работа, учёба, дом)',
        '12–27: станция 2 — слова (2 мин), чат смены склада, факт или обвинение (6 строк), «Kas teadsid?» о töövaidluskomisjon',
        '27–39: станция 3 — заметить в чате → правило (факт, последствие, «я-сообщение», предложение, роль -na) → лучшая фраза в 6 ситуациях',
        '39–54: станция 4 — информационный пробел: разговор с коллегой (у вас скрытая причина), договорённость',
        '54–66: «Kui aega jääb» — разговор с руководителем',
        '66–73: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '73–80: домашнее задание: итог договорённости письмом, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Чат смены — учебный текст. «Kas teadsid?»: eesti.ee, «Töövaidlus» — обращение в töövaidluskomisjon освобождено от госпошлины, заявление рассматривается в течение 45 календарных дней; Tööinspektsioon, nõustamisteenus — бесплатно, 640 6000.',
      groups: 'Станция 1 — в парах. Чат — каждый сам, сверка в паре. Станция 4: один говорит о своей ситуации, другой получает вашу карточку (скрытая причина); потом меняются. В 1:1 вторая сторона — вы.',
      errors: [
        '«Sa jääd alati hiljaks!» → «Sel nädalal tulid sa kolm korda pärast kella kaheksat.» (факт вместо обобщения alati / kunagi).',
        '«Ma ütlen seda kolleegiks» → «kolleegina» (в роли — -na).',
        '«Sinu pärast pidin ma …» → «Seetõttu pidin ma …» (последствие без обвинения).',
        '«Kas sa saad …?» → мягче: «Kas sa saaksid …?» / «Kas me saaksime …?»',
      ],
      notes: [
        'Формат — информационный пробел: у ученика факты (даты, последствия), у вас — скрытая причина другого человека и одно встречное требование. Ученику без работы: тот же разговор с одногруппником, который не делает свою часть работы, или с соседом по квартире (карточка ситуации даёт три варианта).',
        'Обратная связь, 2–3 цели: факт вместо alati / kunagi; -na для роли; мягкая просьба (kas me saaksime). Во время разговора не перебивать, 3 замечания в конце.',
      ],
    },
    discover: [
      station(B.text('028_d_hook', 'Kas oled nõus?', '„Parem on vaikida kui kolleegiga tülli minna.” Kas oled nõus, osaliselt nõus või ei ole nõus? Ütle üks põhjus oma elust.'), 1, 12),
      inLesson(teach(tag(purpose(B.speaking('028_d_talk', 'Kui keegi ei tee oma osa.', 'Vasta ja too näide tööst, koolist või kodust.', [
        'Millal pidid sina kellegi teise töö ära tegema? Mida sa tegid?',
        'Kas ütled probleemist pigem otse või kirjutad sõnumi? Miks?',
      ], [150, 210], ['Kord juhtus nii, et …', 'Ma ütlesin otse …']), 'Sinu kogemus näitab, millised sõnad tülis aitavad ja millised teevad asja hullemaks.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu. Ära paranda; lõpus ütle, kas õpilane ütles mõne „alati” või „kunagi” — see on tunni teema.')),
      station(tag(B.vocab('028_d_vocab', 'Enne lugemist: sõnad.', ['vahetus — смена', 'vahetuse vanem — старший смены', 'hilinema — опаздывать', 'süüdistama — обвинять', 'fakt — факт', 'mõju — последствие', 'mure — забота', 'ettepanek — предложение', 'kompromiss — компромисс', 'pinge — напряжение']), { topic: ['süüdistama'] }), 2, 15),
      purpose(B.dialogue('028_d_chat', 'Laovahetuse vestlus', 'Loe vahetuse vanema ja kolleegi sõnumeid.', 'Olga (vahetuse vanem)', 'Rauno (kolleeg)', [
        ['A', 'Rauno, kas sa saad täna lõpuks õigel ajal tulla? Sa jääd alati hiljaks ja kogu vahetus kannatab.'],
        ['B', 'Alati? Eile olin ma kohal kell 7.55. Ja sina ei ütle kunagi aitäh, kui ma pärast kella kuut kaste laon.'],
        ['A', 'Esmaspäeval, teisipäeval ja neljapäeval tulid sa alles kell 8.15. Sel ajal pidid Aivar ja Natalja kahekesi kolm veokit tühjaks laadima.'],
        ['B', 'Sind ei huvita üldse, miks ma hilinen. Sa mõtled ainult graafikule.'],
        ['A', 'Mind huvitab, aga ma ei tea põhjust. Vahetuse vanemana pean ma vastutama, et kaup läheb kella üheksaks välja.'],
        ['B', 'Bussigraafik muutus. Varem tuli buss 7.35, nüüd tuleb 7.55 ja ma jõuan alles 8.15.'],
        ['A', 'Seda ma ei teadnud. Kas me saaksime homme pärast vahetust viis minutit rääkida? Võib-olla leiame lahenduse.'],
        ['B', 'Olgu. Ja vabandust, see „sind ei huvita” oli liiga palju.'],
      ]), 'Päris tüli algab sageli sõnumist; siin näed, mis teeb asja hullemaks ja mis aitab.'),
      tag(purpose(B.table('028_d_facts', 'Fakt või süüdistus?', 'Otsusta iga lause kohta: fakt (saab kontrollida) või süüdistus (üldistab ja hindab inimest).', 'Lause vestlusest, Fakt või süüdistus?', [
        '„Sa jääd alati hiljaks.” | [süüdistus]',
        '„Eile olin ma kohal kell 7.55.” | [fakt]',
        '„Sina ei ütle kunagi aitäh.” | [süüdistus]',
        '„Esmaspäeval, teisipäeval ja neljapäeval tulid sa alles kell 8.15.” | [fakt]',
        '„Sind ei huvita üldse, miks ma hilinen.” | [süüdistus]',
        '„Varem tuli buss 7.35, nüüd tuleb 7.55.” | [fakt]',
      ], 'g_read'), 'Kui näed vahet, tead, millega vestlust alustada ja millega mitte.'), { task: 'R06' }),
      B.know('028_d_know', ['Kui tüli ei ole kolleegiga, vaid tööandjaga — näiteks palga, puhkuse või lepingu lõpetamise pärast —, võib pöörduda töövaidluskomisjoni. Avaldus on riigilõivuta ja see vaadatakse läbi 45 kalendripäeva jooksul. Enne seda tasub küsida tasuta nõu Tööinspektsiooni juristilt (telefon 640 6000).'], 'eesti.ee, „Töövaidlus”; Tööinspektsioon, nõustamisteenus (ti.ee)', 'Kas teadsid? Töövaidluskomisjon'),
    ],
    practice: [
      station(B.notice('028_p_notice', 'Märka: kuidas öelda ilma süüdistuseta?', [
        'Vestlusest: süüdistus — Sa jääd **alati** hiljaks. · fakt — **Esmaspäeval, teisipäeval ja neljapäeval** tulid sa alles kell 8.15. · roll — **Vahetuse vanemana** pean ma vastutama … · palve — **Kas me saaksime** homme rääkida?',
        '**1. Fakt**: millal, mitu korda, mis kell — mitte **alati, kunagi, üldse**.',
        '**2. Mõju**: mis juhtus — **Seetõttu** pidid kaks inimest kolm veokit tühjaks laadima.',
        '**3. Mina-sõnum**: minu tunne või mure — **Mul on raske**, kui … · **Ma muretsen**, et … · **Ma kahtlen**, kas …',
        '**4. Ettepanek**: tingiv kõneviis — **Kas me saaksime** …? **Võib-olla** võiksid … Hea ettepanek on **kompromiss**: kumbki annab natuke järele ja **pinge** kaob.',
        '**Kellena sa räägid?** Olev kääne: **kolleegina**, **vahetuse vanemana**, **sõbrana**, **uue töötajana**: Ütlen seda **sõbrana**, mitte ülemusena.',
      ], 'full'), 3, 12),
      tag(purpose(B.choice('028_p_better', 'Mis lause aitab?', 'Vali iga olukorra jaoks lause, mis ütleb fakti või ettepaneku, ei süüdista ja on keeleliselt õige.', [
        ['Kolleeg jättis nädal aega oma tassid köögilauale.', 'Sel nädalal jäid köögis kolm korda sinu tassid lauale.', 'Sa ei pese kunagi oma tasse!', 'Sina oled meie köögis kõige laisem.'],
        ['Kursusekaaslane ei saatnud ühise esitluse oma osa tähtajaks.', 'Tähtaeg oli eile ja sinu osa ei ole veel kaustas.', 'Sind see esitlus üldse ei huvita.', 'Sa jätad alati kõik viimasele minutile.'],
        ['Sa oled vahetuse vanem ja pead kolleegile pausidest ütlema.', 'Vahetuse vanemana pean ütlema, et pause on päevas kaks.', 'Vahetuse vanemaks pean ütlema, et pause on päevas kaks.', 'Vahetuse vanem pean ütlema, et pause on päevas kaks.'],
        ['Kolleeg räägib telefonis nii valjusti, et sa ei kuule klienti.', 'Mul on raske klienti kuulda, kui kõrval räägitakse valjusti telefonis.', 'Sa karjud kogu aeg telefoni!', 'Kas sa saad lõpuks vait olla?'],
        ['Sa tahad pakkuda lahendust.', 'Kas me saaksime vahetuse algust veerand tundi hilisemaks nihutada?', 'Sa pead lihtsalt varem ärkama.', 'Las juht otsustab, mina ei tea.'],
        ['Sa räägid sõbraga, kes töötab samas firmas sinu ülemusena.', 'Ütlen seda sõbrana, mitte töötajana: sa näed väsinud välja.', 'Ütlen seda sõbraks, mitte töötajaks: sa näed väsinud välja.', 'Ütlen seda sõber, mitte töötaja: sa näed väsinud välja.'],
      ], 'full', 'g_notice'), 'Õige lause hoiab tööl head suhet; vale lause teeb väikesest murest tüli.'), { task: 'G14' }),
    ],
    transfer: [
      station(tag(purpose(B.reading('028_t_card', 'Sinu olukord', 'Vali üks olukord ja kirjuta enne rääkimist üles.', 'Kolm olukorda', 'Vali üks olukord:\n\nA) Töö: kolleeg tuli sel kuul viis korda hiljem ja sina tegid tema töö. Kahel päeval jäi sul lõunapaus vahele.\n\nB) Kool: kursusekaaslane, kellega teete koos esitlust, ei ole kahe nädala jooksul vastanud ja esitlus on reedel.\n\nC) Kodu: korterikaaslane ei vii prügi välja, kuigi lepiti kokku, et teeb seda esmaspäeviti ja neljapäeviti.', [
        ['Kaks fakti: millal ja mitu korda?'],
        ['Üks mõju: mis juhtus sinuga või teistega?'],
        ['Üks ettepanek: mida sa pakud?'],
      ], 'g_read'), 'Kui faktid on enne kirjas, ei lähe vestlus süüdistusteks.'), { task: 'R07' }), 4, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('028_t_talk', 'Räägi temaga.', 'Räägi teise inimesega oma olukorrast ja leppige kokku lahendus, mis sobib mõlemale.',
        'Olukord: valitud olukord A, B või C. Teine inimene ei tea veel, et see sind häirib.\nSinu eesmärk: rahulik kokkulepe — kes teeb mida ja millest alates.\nPiirang: sa ei tea, miks ta nii teeb; küsi temalt.',
        'Teise inimese kaart on õpetajal: tema põhjus ja üks vastunõue.',
        ['Ma tahaksin rääkida ühest asjast …', 'Sel nädalal … Seetõttu …', 'Mul on raske, kui …', 'Kas me saaksime …?', 'Kompromissina pakun …', 'Kolleegina / sõbrana …'], ['Aga sina ka …!', 'Ma ei teadnud, et …', 'Mul on põhjus: …']), 'Tulemus: kokkulepe, mille te mõlemad päriselt täidate.'), { task: 'S05', level: 4, harno: 'S2' }),
      'Õpetaja kaart (A: kolleeg, B: kursusekaaslane, C: korterikaaslane). Varjatud info: A — lasteaed avab alles kell 7.45 ja sa ei saa last varem viia; B — sinu vanaema on haiglas, telefon oli mitu päeva kinni; C — sa arvasid, et prügi viib see, kes viimasena köögist lahkub. Üks vastunõue: „Aga sina jätad ka …” (nõud, vahetuse kaardi, esitluse failid). Takistused ükshaaval: 1) alguses kaitse end („Kes sulle seda ütles?”); 2) kui õpilane ütleb „alati” või „kunagi”, solvu; 3) kui ta küsib põhjust, räägi. Õnnestunud, kui õpilane ütleb vähemalt kaks fakti ilma „alati / kunagi”-ta, ühe mina-sõnumi, küsib põhjust, ütleb oma rolli olevas käändes (-na) ja te jõuate kokkuleppele (kes, mida, millest alates).'),
      extension(teach(tag(purpose(B.rolecards('028_t_more', 'Rollimäng: juhi juures.', 'Kokkulepe ei pidanud. Räägi juhiga ja palu abi, ilma kolleegi süüdistamata.',
        'Olukord: kolleegiga tehtud kokkulepe ei ole kaks nädalat pidanud ja meeskonnas on pinge.\nSinu eesmärk: juht teab fakte ja te lepite kokku järgmise sammu.\nPiirang: sa ei taha, et kolleeg saaks karistuse.',
        'Juhi kaart on õpetajal.',
        ['Kolleegina pöördun teie poole, sest …', 'Faktid on sellised: …', 'Ma ei taha vaielda ega kedagi süüdistada, aga …'], ['Miks te kohe ei tulnud?', 'Mida te ise ette paneksite?']), 'Juht saab aidata ainult siis, kui ta teab fakte, mitte kuulujutte.'), { task: 'S10', level: 4 }),
      'Kui aega jääb (12 min). Sina oled juht. Varjatud info: sa tead, et bussigraafik muutus; vahetuse algust saab nihutada 15 minutit, aga ainult kogu vahetusel. Takistused: 1) „Miks te kohe ei tulnud?” 2) „Kas te tahate, et ma annan talle hoiatuse?” Õnnestunud, kui õpilane ütleb faktid, ei süüdista ja nõustub lahendusega või pakub oma.'), 12),
      tag(exitCheck(purpose(B.gaps('028_t_exit', 'Kontrolli end: roll ja muutus.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ütlen seda sulle praegu [kolleegina], mitte ülemusena, sest tahan aidata. (kolleeg)',
        'Uue [töötajana] ei teadnud ma esimesel nädalal veel kõiki maja reegleid. (töötaja)',
        'Pärast kolmekuulist koolitust valiti Natalja eelmisel kuul vahetuse [vanemaks]. (vanem)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas roll ja muutus on käes.')), {}),
      purpose(B.selfcheck('028_t_self', ['Ma eristan vestluses fakti ja süüdistust.', 'Ma ütlen mure nelja sammuga: fakt, mõju, tunne, ettepanek.', 'Ma ütlen, kellena ma räägin (kolleegina, sõbrana, vahetuse vanemana).', 'Ma lepin tüli korral kokku lahenduse, mis sobib mõlemale.'], 'Kokkulepe tehtud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('028_t_summary', 'Kodus: kokkuleppe kokkuvõte.', 'Kirjuta kodus 120–150 sõna: e-kiri inimesele, kellega täna rääkisid (kolleeg, kursusekaaslane või korterikaaslane). Võta kokku, mis juhtus (faktid), mida kumbki nüüd teeb ja millal te uuesti räägite. Ära süüdista.', 'Tere!', 'Parimat\n(sinu nimi)', [120, 150]), 'Kirjalik kokkuvõte hoiab kokkuleppe meeles ka siis, kui tuju on halb.')), { task: 'W12', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('028_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: olukord, kus lahendasid tüli rahulikult (tööl, koolis või kodus).', [
        'Mis juhtus ja millised faktid sa teisele inimesele ütlesid?',
        'Kuidas te lõpuks kokku leppisite ja kas kokkulepe pidas?',
      ], [60, 120]), 'Õpetaja kuulab sinu loo ja ütleb, kas räägid faktidega.')), { task: 'S15' }),
      homework('028_t_homework', ['1. Kokkuleppe kokkuvõte, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-029': {
    title: 'Kas sinu oskusest saaks väike äri?',
    phases: grammar('Keel: plussid ja miinused ühes lauses — ühelt poolt … teiselt poolt, kuigi, siiski, samas'),
    format: 'project',
    topic: 'work',
    subtopic: 'own-business',
    canDo: 'Ma saan intervjuust aru, kuidas väikeettevõtja alustas, võrdlen ettevõtluskontot ja FIE-d ning kirjutan oma idee plaani, kus seon vastandlikud mõtted (ühelt poolt … teiselt poolt, kuigi, siiski).',
    teacherPage: {
      goal: 'Ученик понимает интервью с маленьким предпринимателем, сравнивает ettevõtluskonto и FIE, связывает «за» и «против» (ühelt poolt … teiselt poolt, kuigi, siiski, samas) и пишет план своей идеи.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — интервью ещё раз (4 фразы) и правило; станция 4 — карточки, своя карточка идеи и представление 1 минута без вопросов «банка». Интервью (станция 2) — дома.',
      hook: '«Друг платит тебе 30 евро, чтобы ты сделал то, что умеешь лучше всего: торт, ремонт велосипеда, перевод письма, присмотр за ребёнком. Возьмёшь деньги? Почему?» Ответьте сами, потом ученик.',
      plan: [
        '0–4: крючок — 30 евро за то, что умеешь',
        '4–12: станция 1 — что я умею, хочу ли быть сам себе начальником',
        '12–24: станция 2 — слова (2 мин), интервью с кондитером из Йыхви дважды: прогноз → общий смысл → верно / неверно → одна строка «что меня удивило»',
        '24–36: станция 3 — интервью ещё раз: какую фразу сказала Татьяна (6) → правило (ühelt poolt … teiselt poolt и порядок слов, kuigi, siiski, samas) → 2 свои фразы об идее вслух (глагол вторым)',
        '36–51: станция 4 — две карточки (ettevõtluskonto и FIE), кому что подходит (6 человек), карточка своей идеи, представление плана 2 минуты, вопросы «банка»',
        '51–62: «Kui aega jääb» — мини-дебаты «Должно ли хобби остаться хобби?»',
        '62–70: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '70–78: домашнее задание: текст о своей идее, запись 1 минуты, слова',
        '78–90: запас',
      ],
      sources: 'Карточки: Maksu- ja Tolliamet, «Ettevõtluskonto» (emta.ee) — налог 20 % с поступившей суммы, банк сам перечисляет налог, расходы не вычитаются, при поступлениях больше 40 000 € в год нужно регистрироваться предпринимателем, открыть пока можно только в LHV; eesti.ee, «FIE-ks registreerimine» — госпошлина 20 €, ускоренная регистрация за один рабочий день, FIE отвечает всем личным имуществом. Интервью — учебный текст (кондитер Татьяна вымышленная).',
      groups: 'Станция 1 — в парах. Интервью — каждый сам, сверка в паре. Станция 4: каждый делает свою карточку, второй играет «работника банка» с вашими вопросами; в 1:1 банк — вы. Мини-дебаты — две стороны.',
      errors: [
        '«Ühelt poolt see on lihtne» → «Ühelt poolt on see lihtne» (после ühelt poolt / teiselt poolt / siiski / samas глагол на втором месте).',
        '«Kuigi on lihtne, aga …» → «Kuigi see on lihtne, …» (после kuigi не нужно aga).',
        '«teiselt küljelt» → «teiselt poolt».',
        '«Siiski ma proovin» → «Siiski proovin ma» (глагол вторым).',
      ],
      notes: [
        'Формат — мини-проект: продукт — карточка идеи (что, кому, цена, ettevõtluskonto или FIE, плюс, минус, первый шаг). Ученику, который не хочет своё дело: идея друга или подработка (частные уроки, вязание для ярмарки, ремонт) — тот же план. Пенсионеру — носки на ярмарку, маме — торты, студенту — репетиторство, начальнику смены — ремонт велосипедов по выходным.',
        'Налоговых советов сверх карточек не давайте: точные вопросы — в Maksu- ja Tolliamet. Произношение, 2 минуты: õ, ö, ü в словах äri, töö, tulu, võlg — ученик слышит, потом читает свою фразу.',
        'Обратная связь, 2–3 цели: глагол вторым после ühelt poolt / siiski / samas; kuigi без aga; конкретный первый шаг.',
      ],
    },
    discover: [
      station(B.text('029_d_hook', 'Kolmkümmend eurot', 'Sõber pakub sulle 30 eurot, et teeksid seda, mida oskad hästi: küpsetaksid tordi, parandaksid jalgratta, tõlgiksid kirja või hoiaksid last. Kas võtaksid raha? Miks?'), 1, 12),
      inLesson(teach(tag(purpose(B.speaking('029_d_talk', 'Mida ma oskan?', 'Vasta ja too näide.', [
        'Mida sa oskad nii hästi, et teised küsivad sinult abi?',
        'Kas tahaksid kunagi olla ise oma ülemus? Miks?',
      ], [150, 210], ['Mind kiidetakse, sest …', 'Ise oma ülemus …']), 'Sinu oskus on selle tunni projekti algus.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise, mida oskad ja kas oled selle eest raha saanud. Kui õpilane ütleb „ma ei oska midagi”, küsi: „Mida su sõbrad või pere sinult kõige sagedamini paluvad?”')),
      station(tag(B.vocab('029_d_vocab', 'Enne kuulamist: sõnad.', ['ettevõtja — предприниматель', 'ettevõtluskonto — предпринимательский счёт', 'tellimus — заказ', 'FIE — ИП (füüsilisest isikust ettevõtja)', 'tulu — доход', 'kulu — расход', 'maks — налог', 'riigilõiv — госпошлина', 'vara — имущество', 'loobuma — отказаться']), { topic: ['ettevõtluskonto', 'riigilõiv', 'FIE'] }), 2, 12),
      tag(purpose(B.examListen('029_d_baker', 'Raadio: tordid kodu köögist.', 'Kuula kaks korda: õige või vale?', 'truefalse', [
        'Saatejuht: Tere! Stuudios on Jõhvist pärit Tatjana, kes küpsetab torte oma kodus. Tatjana, kuidas see algas?',
        'Tatjana: Kuus aastat tagasi olin lapsega kodus ja küpsetasin sõbrannade sünnipäevadeks torte. Ühel päeval küsis tuttav, kas võiksin talle raha eest tordi teha. Nii see algas.',
        'Saatejuht: Kas pidite kohe ettevõtte looma?',
        'Tatjana: Ei. Alguses avasin ettevõtluskonto. See oli lihtne: klient maksab kontole ja pank kannab kakskümmend protsenti ise maksuametile. Muud pole vaja teha.',
        'Saatejuht: Kõlab ideaalselt.',
        'Tatjana: Ühelt poolt jah, teiselt poolt ei saa kulusid maha arvata. Ma ostan palju võid, koort ja šokolaadi, aga maksu maksin kogu summalt. Kui tellimusi tuli rohkem, läks ettevõtluskonto minu jaoks liiga kalliks.',
        'Saatejuht: Mis siis edasi sai?',
        'Tatjana: Registreerisin end FIE-ks. Riigilõiv oli kakskümmend eurot ja kõik käis ühe päevaga. Nüüd saan kulud maha arvata, kuigi raamatupidamisega on rohkem tööd. Samas tuleb meeles pidada, et FIE vastutab kogu oma varaga.',
        'Saatejuht: Mida soovitaksite neile, kes alles mõtlevad?',
        'Tatjana: Alustage väikselt. Kuigi alguses oli mul kuus vaid kolm-neli tellimust, ma siiski ei loobunud. Ja küsige julgelt raha: hea töö ei ole tasuta.',
        'Saatejuht: Aitäh, Tatjana!',
      ], [
        ['Tatjana hakkas raha eest torte küpsetama, kui ta oli lapsega kodus.', true],
        ['Ettevõtluskonto avamiseks pidi Tatjana end kõigepealt FIE-ks registreerima.', false],
        ['Ettevõtluskonto puhul kannab pank maksu ise maksuametile.', true],
        ['Ettevõtluskontol sai Tatjana või ja šokolaadi kulud maksust maha arvata.', false],
        ['FIE-ks registreerimine võttis Tatjanal mitu nädalat.', false],
        ['Tatjana soovitab alustada väikselt ja hea töö eest raha küsida.', true],
      ], 'g_listen'), 'Ühe päris tee lugu näitab, mida alustaja peab enne teadma.'), { voice: 'interview', task: 'L05', harno: 'L4' }),
    ],
    practice: [
      station(tag(purpose(B.choice('029_p_listen', 'Kuula veel kord: kuidas Tatjana ütles?', 'Kuula intervjuud veel kord ja vali lause, mille Tatjana tegelikult ütles.', [
        ['Mida ütles Tatjana ettevõtluskonto kohta?', 'Ühelt poolt jah, teiselt poolt ei saa kulusid maha arvata.', 'Ühelt poolt jah, teiselt poolt kulusid ei saa maha arvata.', 'Ühest küljest jah, aga kulusid maha ei arvata.'],
        ['Mis juhtus, kui tellimusi tuli rohkem?', 'Kui tellimusi tuli rohkem, läks ettevõtluskonto minu jaoks liiga kalliks.', 'Kui tellimusi tuli rohkem, ettevõtluskonto läks minu jaoks liiga kalliks.', 'Kuigi tellimusi tuli rohkem, läks ettevõtluskonto liiga kalliks.'],
        ['Mida ütles Tatjana FIE kohta?', 'Nüüd saan kulud maha arvata, kuigi raamatupidamisega on rohkem tööd.', 'Nüüd saan kulud maha arvata, aga kuigi raamatupidamisega on rohkem tööd.', 'Kuigi nüüd saan kulud maha arvata, aga raamatupidamisega on rohkem tööd.'],
        ['Mida tuleb FIE vastutuse kohta meeles pidada?', 'Samas tuleb meeles pidada, et FIE vastutab kogu oma varaga.', 'Samas meeles tuleb pidada, et FIE vastutab kogu oma varaga.', 'Siiski FIE ei vastuta oma varaga.'],
        ['Mis oli Tatjanal alguses?', 'Kuigi alguses oli mul kuus vaid kolm-neli tellimust, ma siiski ei loobunud.', 'Kuigi alguses oli mul kuus vaid kolm-neli tellimust, aga ma ei loobunud.', 'Alguses oli mul vähe tellimusi, siiski ma loobusin.'],
        ['Mida soovitab Tatjana alustajale?', 'Alustage väikselt ja küsige julgelt raha.', 'Alustage kohe suurelt ja ärge küsige raha.', 'Alustage väikselt, kuigi raha ei tasu küsida.'],
      ], 'full', 'g_listen'), 'Kuulates märkad, kuhu sidend ja tegusõna lauses lähevad; see on reegli võti.'), { task: 'G02' }), 3, 12),
      B.notice('029_p_notice', 'Märka: plussid ja miinused ühes lauses', [
        'Intervjuus kuulsid nelja sidendit: **ühelt poolt … teiselt poolt**, **kuigi**, **samas** ja **siiski**. Võrdle oma valikuid reegliga.',
        '**Ühelt poolt … teiselt poolt** — kaks külge: **Ühelt poolt on** see lihtne, **teiselt poolt maksad** kogu summalt. Pärast „ühelt poolt” ja „teiselt poolt” on tegusõna **teisel kohal**.',
        '**Kuigi** + kõrvallause, siis koma: **Kuigi** tulu on väike, proovin. Ilma „aga”-ta!',
        '**Siiski** / **ometi** — ikkagi, vaatamata sellele: Ilm oli halb. **Siiski läks** laat hästi.',
        '**Samas** — toob teise poole: Kodus töötada on mugav. **Samas on** raske end tööle sundida.',
      ], 'full'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('029_d_cards', 'Kaks teed: ettevõtluskonto või FIE?', 'Loe kaarte. Siis otsusta tabelis, kumb tee sobib igale inimesele.', [
        ['Ettevõtluskonto', ['Avad pangas (praegu ainult LHV-s).', 'Maks on 20 % igast summast, mis kontole laekub; pank kannab selle ise maksuametile.', 'Kulusid maha arvata ei saa.', 'Kui aastas laekub üle 40 000 euro, tuleb end registreerida ettevõtjaks.', 'Allikas: Maksu- ja Tolliamet, „Ettevõtluskonto”.'], []],
        ['FIE (füüsilisest isikust ettevõtja)', ['Registreerid end e-äriregistris; riigilõiv on 20 eurot, kiirmenetlus kestab ühe tööpäeva.', 'Kulud (materjal, tööriistad) saab maha arvata.', 'Pead pidama arvestust ja esitama deklaratsioone.', 'Vastutad kohustuste eest kogu oma isikliku varaga.', 'Allikas: eesti.ee, „FIE-ks registreerimine”.'], []],
      ], '2'), 'Kaks lühikest kaarti annavad faktid, mille järgi otsustad oma idee kohta.'), { task: 'R19' }), 4, 15, { final: 'plan' }),
      tag(purpose(B.table('029_d_who', 'Kellele mis sobib?', 'Vali iga inimese jaoks: ettevõtluskonto või FIE.', 'Inimene, Ettevõtluskonto või FIE?', [
        'Üliõpilane annab kaks korda kuus matemaatika eratunde; kulusid tal peaaegu ei ole. | [ettevõtluskonto]',
        'Pensionär koob talvel sokke ja müüb neid jõululaadal umbes 500 euro eest. | [ettevõtluskonto]',
        'Rattameister ostab igal kuul tööriistu ja varuosi tuhandete eurode eest. | [FIE]',
        'Fotograaf teenib aastas umbes 50 000 eurot. | [FIE]',
        'Tõlk tõlgib paar korda kuus naabritele kirju ega osta midagi juurde. | [ettevõtluskonto]',
        'Elektrik ostab kõik juhtmed ja lülitid ise ja need on kallid. | [FIE]',
      ], 'g_read'), 'Kui oskad teistele valida, oskad valida ka endale.'), { task: 'R01' }),
      tag(purpose(B.planning('029_t_idea', 'Minu idee kaart.', 'Täida kaart oma idee kohta. Kui sa ei taha oma äri, vali sõbra idee või kõrvalteenistus (eratunnid, käsitöö laadal, remont).', [
        'Mida ma pakun ja kellele?',
        'Mis hinnaga ja kui tihti?',
        'Ettevõtluskonto või FIE — ja miks?',
        'Üks pluss ja üks miinus (ühelt poolt …, teiselt poolt …)',
        'Minu esimene samm järgmisel nädalal',
      ], 2), 'Kaardist saab sinu plaan: esitled selle kohe ja kirjutad kodus lõpuni.'), { task: 'W11' }),
      teach(tag(purpose(B.rolecards('029_t_pitch', 'Esitle oma plaani.', 'Räägi umbes 2 minutit oma ideest kaardi järgi ja vasta kuulaja kahele küsimusele.',
        'Olukord: räägid oma ideest pangatöötajale või sõbrale, kes võiks olla sinu esimene klient.\nSinu eesmärk: ta saab aru, mida sa pakud, ja usub, et plaan töötab.\nPiirang: sul on alguses vähe raha.',
        'Kuulaja kaart on õpetajal: kaks küsimust ja üks kahtlus.',
        ['Minu idee on …', 'Ühelt poolt …, teiselt poolt …', 'Kuigi …, …', 'Ilmselt on alguses …', 'Minu esimene samm on …'], ['Kui palju sa kuus teenida loodad?', 'Miks just ettevõtluskonto või FIE?', 'Kas see ei ole lihtsalt hobi?']), 'Tulemus: plaan, mida keegi teine on kuulnud ja mille esimene samm on selge.'), { task: 'S18', level: 4 }),
      'Õpetaja kaart: sina oled pangatöötaja (või sõber). Kuula segamata. Küsi: 1) „Kui palju sa kuus teenida loodad ja kui palju kulub materjalile?” 2) „Miks just ettevõtluskonto või FIE?” Kahtlus: „Kas see ei ole lihtsalt hobi?” Õnnestunud, kui õpilane räägib umbes 2 minutit, kasutab vähemalt kolm sidendit (ühelt poolt … teiselt poolt, kuigi, siiski, samas) õigesti ja nimetab konkreetse esimese sammu.'),
      extension(teach(tag(purpose(B.speaking('029_t_more', 'Minidebatt: kas hobi peaks jääma hobiks?', 'Õpetaja võtab ühe poole, sina teise. Kumbki ütleb kaks argumenti, siis hääletate.', [
        'Poolt: hobi rõõm kaob, kui sellest saab kohustus.',
        'Vastu: hea töö eest on aus raha küsida.',
        'Sinu enda näide: …',
      ], [120, 180], ['Ühelt poolt …', 'Kuigi …', 'Siiski arvan …']), 'Kiire väitlus harjutab vastandlikke mõtteid ühes lauses.'), { task: 'S17' }),
      'Kui aega jääb (11 min). Võta pool, mida õpilane ei valinud. Iga õige sidend (ühelt poolt … teiselt poolt, kuigi, siiski, samas) on punkt. Lõpus hääletate; häält võib muuta, kui ütled, mis sind veenis.'), 11),
      tag(exitCheck(purpose(B.gaps('029_t_exit', 'Kontrolli end: plussid ja miinused.', 'Kirjuta lünka sobiv sõna: kuigi, siiski või teiselt.', [
        'Ühelt poolt on FIE-l rohkem vabadust, [teiselt] poolt vastutab ta kogu oma varaga.',
        '[Kuigi] maks on 20 protsenti, on ettevõtluskonto alustajale mugav.',
        'Kulud olid suured. [Siiski] ei loobunud ta oma ideest.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas vastandlikud mõtted lähevad ühte lausesse.')), {}),
      purpose(B.selfcheck('029_t_self', ['Ma saan intervjuust aru, kuidas väikeettevõtja alustas.', 'Ma võrdlen ettevõtluskontot ja FIE-d.', 'Ma ütlen plussi ja miinuse ühes lauses (ühelt poolt … teiselt poolt, kuigi, siiski).', 'Ma esitlen oma idee plaani.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('029_t_text', 'Kodus: minu idee.', 'Kirjuta kodus 120–150 sõna: mis on sinu idee, kellele see sobib, ettevõtluskonto või FIE ja miks, kaks plussi ja kaks miinust ning sinu otsus. Kasuta vähemalt kolme sidendit.', [10, 14], ['ühelt poolt', 'teiselt poolt', 'kuigi', 'siiski'], 3, 'g_use'), 'Kirjutatud plaan näitab, kas idee peab vastu ka paberil.')), { task: 'W14', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('029_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kas sa tahaksid olla ise oma ülemus? Miks?', [
        'Mis meeldiks sulle oma äri juures?',
        'Mis teeb sulle muret?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi ja ütleb, kas sidendid ja sõnajärg on õiged.')), { task: 'S15' }),
      homework('029_t_homework', ['1. Minu idee, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-030': {
    title: 'Kontroll 6 — tööelu',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 6, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 6, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 6, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid tööelu teemal (töö otsimine, leping, kolleegid, oma äri), kirjutan umbes 140-sõnalise kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma tööelu kaardist.',
    // Kontroll 6 in Harno B2 form (v4 module exam, as module 4's 020): two 90-minute lessons — reading (Avasta, 45 min) and
    // the module's language part + listening (Harjuta), writing (60 min) and speaking with the module product (Kasuta).
    // Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types (R1, R2a,
    // R3, R4; L3 notes, L4; W1, W2b; S1, S2). Content: module 6 (job search, the contract, a conflict, own business)
    // with module 5's argument words; the sheets are timed by their Harno part headers (timeEstimate.js, §7.3).
    discover: [
      B.tip('030_d_how', 'Kontroll 6: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning keeleosa koos kuulamisega, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      B.vocab('030_d_vocab', 'Tunnid 26–29: sõnad, mis aitavad', ['kuulutus — объявление', 'kandideerima — подавать заявку', 'kogemus — опыт', 'tööleping — трудовой договор', 'katseaeg — испытательный срок', 'ületunnid — сверхурочные часы', 'süüdistama — обвинять', 'kokku leppima — договориться', 'ettevõtja — предприниматель', 'tulu — доход'], '2'),
      PART('030_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('030_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe arvamusartiklit. Vasta kahele küsimusele ja lahenda siis osad 1 ja 2.', 'Üks elu, mitu ametit', [
        '(A) Minu vanaisa töötas nelikümmend aastat samas tehases. Ta alustas noorena õpipoisina, sai hiljem meistriks ja läks pensionile osakonna juhatajana. Tema jaoks oli see uhkuse asi: üks elu, üks töökoht. Minu põlvkonnas on teisiti. Paljud mu tuttavad on kolmekümnendaks eluaastaks töökohta neli-viis korda vahetanud ja mõni ka ametit. Kas see on hea või halb? Minu arvates mõlemat, aga rohkem siiski head.',
        '(B) Esimene põhjus on lihtne: maailm muutub kiiremini kui inimese karjäär. Ametid, mida vanaisa ajal ei olnud, on täna tavalised, ja mõni amet, mida ta tundis, on kadunud. Kes tahab töö kaotamise korral kiiresti uue leida, peab olema valmis õppima. Seepärast pakub töötukassa tasuta karjäärinõustamist kõigile: töötutele ja töötavatele, õppijatele ja ka pensioniealistele. Nõustaja ei otsi sulle tööd, vaid aitab aru saada, mida sa juba oskad ja mida tasub juurde õppida.',
        '(C) Teine põhjus on see, et töö peab sobima elu eri aegadega. Tudengina on hea töötada osalise tööajaga, lapsevanemana on paindlik tööaeg sageli tähtsam kui kõrgem palk ja vanemas eas tahab inimene teha midagi, mida ta päriselt naudib. Töökoha vahetamine ei tähenda alati, et inimene ei pea vastu. Mõnikord tähendab see lihtsalt, et tema elu on muutunud ja töö peab muutuma koos sellega. Minu ema näiteks läks pärast kolmeaastast lapsepuhkust tagasi tööle, aga mitte samasse kohta, sest vahetustega töö ei sobinud enam pere eluga.',
        '(D) Muutustel on siiski oma hind. Iga uus töökoht algab katseajaga, mis kestab seaduse järgi kuni neli kuud. Sel ajal on lepingu lõpetamine mõlemale poolele lihtsam, etteteatamise aeg on lühem ja paljud tunnevad end ebakindlalt. Uues kohas tuleb õppida tundma reegleid, kolleege ja seda, mida kunagi kirja ei panda: kes keedab hommikul kohvi ja keda ei tohi pärast kella viit enam segada. Kes vahetab töökohta liiga tihti, peab seda kõike ikka ja jälle uuesti õppima, ja see väsitab.',
        '(E) Kõige raskem ei ole minu kogemuse järgi töö ise, vaid suhted. Peaaegu igas meeskonnas tuleb ette tüli: keegi hilineb, keegi jätab oma osa tegemata, keegi räägib liiga valjusti. Vana töötaja teab, kellega ja kuidas rääkida. Uue töötajana kardad aga tihti midagi öelda ja vaikid. See on viga. Kui mure on väike, tasub sellest rahulikult rääkida, nimetada fakte ja mitte süüdistada. Väike mure, millest ei räägita, kasvab sageli suureks tüliks.',
        '(F) Paljud vahetavad töökohta ka sellepärast, et tahavad olla ise oma ülemus. Mõni alustab töö kõrvalt: küpsetab torte, annab eratunde või parandab naabrite jalgrattaid. Eestis on selleks lihtne võimalus, ettevõtluskonto, mille puhul pank kannab maksu ise maksuametile. Kui äri kasvab, saab end registreerida füüsilisest isikust ettevõtjaks. Ühelt poolt annab oma äri vabaduse, teiselt poolt ei maksa keegi puhkuse ajal palka ja kõik vead on sinu enda omad.',
        '(G) Kas ma soovitaksin oma lastel teha nagu vanaisa? Ei, aga ka mitte vastupidi. Ma soovitaksin neil lugeda enne iga allkirja leping läbi, sest neil on õigus küsida. Tülist tasub rääkida enne, kui see kasvab. Ja iga paari aasta tagant võiks endalt küsida: kellena ma praegu töötan ja kelleks ma tahan saada? Kui need kaks vastust on väga erinevad, on aeg midagi muuta. Kui need on sarnased, võib rahulikult jääda. Vanaisa oli õnnelik ühe töökohaga, sest see sobis tema eluga. Meie põlvkonnal on rohkem valikuid, ja see on suur eelis, kui me oskame neid kasutada.',
        'Allikas: autori arvamus.',
      ].join('\n\n'), [['Mida soovitab autor endalt iga paari aasta tagant küsida?', 'kellena ma praegu töötan ja kelleks ma tahan saada|kellena töötan ja kelleks tahan saada'], ['Kas sina oled töökohta või ametit vahetanud? Miks?']]),
      tag(B.choice('030_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Kuidas suhtus autori vanaisa sellesse, et ta töötas kogu elu ühes kohas?', 'Ta oli selle üle uhke.', 'Ta kahetses seda.', 'Ta ei mõelnud sellele.', 'Ta tahtis ise ametit vahetada.'],
        ['Mida teeb autori sõnul töötukassa karjäärinõustaja?', 'Aitab mõista, mida inimene oskab ja mida juurde õppida.', 'Otsib inimesele uue töökoha.', 'Annab nõu ainult töötutele.', 'Õpetab uue ameti tasuta selgeks.'],
        ['Mis on lapsevanemale autori sõnul sageli tähtsam kui kõrgem palk?', 'paindlik tööaeg', 'osaline tööaeg', 'kodu lähedus', 'pikk puhkus'],
        ['Miks tunnevad paljud end katseajal ebakindlalt?', 'Lepingu lõpetamine on siis lihtsam.', 'Katseajal ei maksta palka.', 'Katseaeg kestab terve aasta.', 'Katseajal ei tohi kolleegidega rääkida.'],
        ['Mida peab autor uues töökohas kõige raskemaks?', 'suhteid kolleegidega', 'tööülesandeid', 'pikki tööpäevi', 'uusi programme'],
        ['Mida tahab autor artikliga kõige rohkem öelda?', 'Töökoha vahetamine võib olla hea, kui seda tehakse teadlikult.', 'Kõik peaksid terve elu ühes kohas töötama.', 'Oma äri on alati parem kui palgatöö.', 'Noored vahetavad tööd, sest nad ei pea vastu.'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('030_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Autori arvates on töökoha vahetamisel rohkem häid kui halbu külgi. | [A]',
        '2. Ametid tekivad ja kaovad kiiremini, kui inimene jõuab karjääri teha. | [B]',
        '3. Töökoha vahetus võib tähendada, et inimese elu on muutunud. | [C]',
        '4. Uues kohas on reegleid, mida keegi kirja ei pane. | [D]',
        '5. Vaikimine võib väikese mure suureks teha. | [E]',
        '6. Oma ettevõtjale ei maksa keegi puhkuse ajal palka. | [F]',
        '7. Paljud alustavad oma äri praeguse töö kõrvalt. | [F]',
        '8. Kui praegune ja soovitud roll erinevad palju, tasub midagi muuta. | [G]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.cloze('030_d_cloze', 'Osa 3: vali lünka sobiv vorm (10 punkti).', 'Svetlana kirjutab kaaskirja. Vali iga lünga neljast valikust see, mis sobib.', 'Kaaskiri', [
        'Lugupeetud värbamisjuht!',
        'Kandideerin teie poe {*klienditeenindaja|klienditeenindajana|klienditeenindajaks|klienditeenindajat} ametikohale. Viimased neli aastat olen töötanud Narva laos {*vahetuse vanemana|vahetuse vanemaks|vahetuse vanem|vahetuse vanemat}, enne seda kaks aastat müüjana.',
        '{*Noorena|Nooreks|Noor|Noore} õppisin kokaks, aga mulle meeldib rohkem inimestega suhelda kui köögis olla. Teie kuulutuses on kirjas, et tööaeg on paindlik. See on mulle {*tähtsam|tähtis|kõige tähtsam|tähtsamat} kui kõrgem palk, sest mul on kaks last.',
        'Eelistan {*hommikust|hommikune|hommikuse|hommikusele} vahetust õhtusele, kuid vajaduse korral saan töötada ka nädalavahetusel. {*Kuigi|Siiski|Samas|Teiselt poolt} mul ei ole kosmeetika müügi kogemust, õpin kiiresti.',
        'Laos oli minu {*kõige|kõik|kõigi|kõigist} suurem ülesanne hoida meeskonnas rahu ja lahendada tülid ilma süüdistusteta. Mõne aasta pärast tahaksin saada poes {*osakonna juhiks|osakonna juhina|osakonna juht|osakonna juhti}.',
        'Saan tööle asuda {*kahe nädala|kaks nädalat|kahe nädalaga|kahte nädalat} pärast. Olen tänulik, kui {*leiate|leidma|leida|leidke} aega töövestluseks.',
        'Lugupidamisega\nSvetlana Ivanova',
      ].join('\n\n'), 'g_notice'), { task: 'R03', harno: 'R3' }),
      tag(B.gaps('030_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe Andrei lugu „Minu esimene nädal apteegis”. Vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Kui ma eelmisel kevadel apteeki tööle läksin, olin väga närvis. [Varem olin töötanud ainult laos ja kliente polnud ma kunagi teenindanud.]',
        'Esimesel päeval tutvustas juhataja mulle kolleege. [Kõik olid sõbralikud, kuid nimesid ei jäänud mulle meelde.]',
        'Kõige raskem oli see, et kliendid küsisid ravimite kohta väga palju. [Ma ei teadnud vastuseid ja pidin pidevalt kolleegidelt abi paluma.]',
        'Kolmandal päeval tekkis väike tüli. [Vanem kolleeg ütles, et ma jätan alati kassa korrastamata.]',
        'Ma ei vaikinud, vaid rääkisin temaga pärast tööd rahulikult. [Selgus, et keegi polnud mulle seda reeglit öelnudki.]',
        'Nüüd on mu katseaeg läbi ja ma tunnen end kindlalt. [Sellest kolleegist on saanud minu parim õpetaja.]',
      ], ['Varem olin töötanud ainult laos ja kliente polnud ma kunagi teenindanud.', 'Kõik olid sõbralikud, kuid nimesid ei jäänud mulle meelde.', 'Ma ei teadnud vastuseid ja pidin pidevalt kolleegidelt abi paluma.', 'Vanem kolleeg ütles, et ma jätan alati kassa korrastamata.', 'Selgus, et keegi polnud mulle seda reeglit öelnudki.', 'Sellest kolleegist on saanud minu parim õpetaja.', 'Seepärast otsustasin juba teisel päeval töölt lahkuda.'], 'full', 'g_read'), { task: 'R16', harno: 'R4' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('030_p_how', 'Kontroll 6: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('030_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on laused tundidest 26–29: CV, leping, tüli ja oma äri. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('030_p_fix', 'Keeleosa A: paranda enne saatmist (6 punkti).', 'Sõber palus sul oma sõnumid ja CV read üle vaadata. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Viis aastat töötasin ma laos vahetuse vanemaks.', 'Viis aastat töötasin ma laos vahetuse vanemana.|Viis aastat töötasin laos vahetuse vanemana.'],
        ['Pärast kursust tahan saada raamatupidajana.', 'Pärast kursust tahan saada raamatupidajaks.|Pärast kursust tahan ma saada raamatupidajaks.'],
        ['Neli kuud on lühem nagu kuus kuud.', 'Neli kuud on lühem kui kuus kuud.'],
        ['Ma eelistan kirjalik leping.', 'Ma eelistan kirjalikku lepingut.|Eelistan kirjalikku lepingut.'],
        ['Ühelt poolt see on lihtne, teiselt poolt kallis.', 'Ühelt poolt on see lihtne, teiselt poolt kallis.'],
        ['Kuigi tellimusi oli vähe, aga ta ei loobunud.', 'Kuigi tellimusi oli vähe, ta ei loobunud.|Kuigi tellimusi oli vähe, ei loobunud ta.'],
      ]),
      B.transformation('030_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle sama mõte teisiti, kasutades antud sõnu.', [
        ['Kui ma olin noor, töötasin ma Narvas müüjana.', 'noorena', 'Noorena töötasin Narvas müüjana.|Noorena töötasin ma Narvas müüjana.'],
        ['Ma olen uus töötaja ja ei tea veel reegleid.', 'uue töötajana', 'Uue töötajana ei tea ma veel reegleid.|Uue töötajana ei tea ma reegleid veel.'],
        ['Minu jaoks on palk tähtis, aga aeg on veel tähtsam.', 'tähtsam kui', 'Minu jaoks on aeg tähtsam kui palk.|Aeg on minu jaoks tähtsam kui palk.'],
        ['Kas sa saad homme minuga rääkida?', 'kas me saaksime', 'Kas me saaksime homme rääkida?|Kas me saaksime homme omavahel rääkida?'],
        ['Ettevõtluskonto on lihtne. Kulusid ei saa maha arvata.', 'kuigi', 'Kuigi ettevõtluskonto on lihtne, ei saa kulusid maha arvata.|Ettevõtluskonto on lihtne, kuigi kulusid ei saa maha arvata.|Kuigi ettevõtluskonto on lihtne, kulusid ei saa maha arvata.'],
        ['Mulle meeldib paindlik tööaeg rohkem kui kõrge palk.', 'eelistan', 'Ma eelistan paindlikku tööaega kõrgele palgale.|Eelistan paindlikku tööaega kõrgele palgale.'],
      ]),
      PART('030_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      tag(B.examListen('030_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja lühikest teadet; igaüht kuuled ainult üks kord. Vali igale küsimusele õige vastus kolmest.', 'choice', [
        '1. Tähelepanu, laotöötajad! Homme algab hommikune vahetus erandkorras kell seitse, mitte kaheksa, sest saabub kaks veokit. Lõunapaus on tavalisel ajal kell kaksteist.',
        '2. Linna raamatukogu kutsub: laupäeval kell kümme on raamatukogus CV-töötuba. Osalemine on tasuta, kaasa võta oma arvuti või telefon.',
        '3. Kaupluse teade: alates järgmisest kuust on kassas kaks vahetust, hommikune ja õhtune. Oma soovid kirjuta juhatajale reedeks.',
        '4. Tööinspektsioon tuletab meelde: nõustamistelefon töötab esmaspäevast reedeni kella üheksast kolmeni ja nõustamine on tasuta.',
      ], [
        ['Miks algab homne hommikune vahetus laos tavalisest varem?', 'saabub kaks veokit', 'lõunapaus jääb ära', 'laos on remont'],
        ['Mis kell on laotöötajatel homme lõunapaus?', 'kell kaksteist', 'kell üksteist', 'kell üks'],
        ['Mida tuleb raamatukogu CV-töötuppa kaasa võtta?', 'oma arvuti või telefon', 'paberil CV', 'osalustasu'],
        ['Mida peavad kaupluse töötajad reedeks tegema?', 'kirjutama juhatajale oma soovid', 'valima endale kassa', 'tulema koosolekule'],
        ['Millal töötab Tööinspektsiooni nõustamistelefon?', 'esmaspäevast reedeni kella 9–15', 'iga päev kella 9–15', 'ainult reedeti'],
        ['Kui palju maksab Tööinspektsiooni nõustamine?', 'see on tasuta', 'kümme eurot', 'esimene kord on tasuta'],
      ], 'g_read', 1), { task: 'L01', harno: 'L1' }),
      tag(B.listening('030_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Stuudios on karjäärinõustaja Signe Kask. Signe, kes teie juurde tulevad?',
        'Signe: Väga erinevad inimesed. Tuleb noori, kes ei tea, kelleks saada, aga ka viiekümneseid, kes on töö kaotanud või tahavad ametit vahetada. Viimasel ajal tuleb rohkem ka pensionäre.',
        'Saatejuht: Millega te alustate?',
        'Signe: Küsin, mida inimene on teinud. Tihti ütleb ta: „Ma olin ainult kodus lastega.” Siis küsin edasi ja selgub, et ta planeeris pere eelarvet, korraldas sünnipäevi ja aitas lastel õppida. See kõik on kogemus.',
        'Saatejuht: Mis on CV-s kõige sagedasem viga?',
        'Signe: Liiga pikk CV. Tööandja vaatab seda alguses vaid mõne minuti. Hea CV on üks-kaks lehekülge ja töökogemus algab viimasest kohast.',
        'Saatejuht: Ja töövestlus?',
        'Signe: Valmistuge küsimuseks „Rääkige endast”. Vastus võiks kesta umbes kaks minutit. Rääkige, kellena olete töötanud, mida oskate ja miks just see koht teid huvitab.',
        'Saatejuht: Mida teha, kui tööd ei leia kaua?',
        'Signe: Ärge jääge üksi. Rääkige tuttavatele, sest paljud kohad täidetakse enne, kui kuulutus ilmub. Ja kaaluge vabatahtlikku tööd: see annab kogemuse ja uusi tuttavaid.',
        'Saatejuht: Kas nõustamine maksab?',
        'Signe: Töötukassa karjäärinõustamine on tasuta kõigile, ka neile, kes praegu töötavad.',
        'Saatejuht: Aitäh, Signe!',
      ], [
        'Viimasel ajal tuleb nõustaja juurde rohkem [pensionäre].',
        'Kodus lastega olnud inimene planeeris näiteks pere [eelarvet].',
        'Nõustaja sõnul on CV-s kõige sagedasem viga liiga [pikk] CV.',
        'Hea CV on üks kuni [kaks|2] lehekülge.',
        'Töökogemus algab CV-s [viimasest] kohast.',
        'Vastus küsimusele „Rääkige endast” võiks kesta umbes [kaks minutit|2 minutit].',
        'Kui tööd kaua ei leia, tasub sellest rääkida [tuttavatele].',
        'Vabatahtlik töö annab [kogemuse|kogemust] ja uusi tuttavaid.',
        'Töötukassa karjäärinõustamine on tasuta [kõigile].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('030_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Nõustaja juurde tulevad ainult noored, kes otsivad esimest tööd.', false],
        ['Viiekümneaastased tulevad sageli siis, kui on töö kaotanud või tahavad ametit vahetada.', true],
        ['Nõustaja alustab sellest, et otsib inimesele sobiva kuulutuse.', false],
        ['Paljud ei pea oma kodust kogemust alguses päris kogemuseks.', true],
        ['Tööandja vaatab CV-d alguses vaid lühidalt.', true],
        ['Töövestlusel tasub rääkida ainult oma haridusest.', false],
        ['Paljud töökohad täidetakse enne, kui kuulutus ilmub.', true],
        ['Töötavad inimesed peavad nõustamise eest maksma.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('030_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (paranda – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('030_t_situation', 'Kontroll 6: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad tööandjale kirja ja arutled palgatöö ja oma äri üle. Sõnavõtus esitled mooduli tulemust: oma tööelu kaarti, mille paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own working life, built from 026–029
      B.planning('030_t_product', 'Mooduli tulemus: minu tööelu kaart.', 'Pane kirja oma tööelu kaart. Kasuta mooduli tundide tulemusi.', ['Kellena olen töötanud või mida teinud ja kelleks tahan saada? (tund 26: olev ja saav kääne)', 'Mis on lepingus minu jaoks kõige olulisem ja mida kindlasti küsin? (tund 27: võrdlemine)', 'Kuidas räägin tüli korral faktidega? Üks näide. (tund 28)', 'Kas ja millise kõrvalteenistuse või äri prooviksin — üks pluss ja üks miinus? (tund 29: ühelt poolt … teiselt poolt)']),
      PART('030_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('030_t_letter', 'Kirjutamine 1: kiri tööandjale (umbes 140 sõna).', 'Olid kaks nädalat haiguslehel ja said palgalehelt teada, et tööandja ei maksnud sulle haigushüvitist. Kirjuta tööandjale: mis juhtus, mida seadus ütleb, mida sa palud ja mida kirjale lisad.', 'Lugupeetud personalijuht!', 'Lugupidamisega', [125, 144]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('030_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Teema: kas palgatöö on kindlam kui oma väike äri? Kirjuta arutlus: poolt- ja vastuargumendid, igaühele näide, ja lõpus oma järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 4), { task: 'W14', harno: 'W2b' }),
      PART('030_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('030_t_present', 'Rääkimine 1: sõnavõtt koosolekul (1 minut).', 'Teemakaart: kursuse koosolekul räägib igaüks oma tööelust. Mõtle 2 minutit oma kaardi „Minu tööelu kaart” järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Kellena oled töötanud ja kelleks tahad saada?', 'Mis on lepingus sinu jaoks kõige olulisem?', 'Kuidas sa tüli korral räägid?', 'Kas prooviksid kunagi oma äri? Miks?', 'Mis on sinu arvates parem: üks töökoht terveks eluks või mitu ametit?', 'Mis teeb tööotsimise eesti keeles kõige raskemaks?'], [90, 120], ['Tahaksin rääkida oma tööteest …', 'Olen töötanud …na …', 'Kõige olulisem on mulle …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('030_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas töötaja peaks saama ise valida, mis kell tema tööpäev algab? Argumendid: inimesed on puhanumad ja teevad vähem vigu; lapsevanemal ja bussiga sõitjal on lihtsam; tüli hilinemise pärast jääb ära. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas töötaja peaks saama ise valida, mis kell tema tööpäev algab? Argumendid: laos, poes ja haiglas peab vahetus algama koos; kliendid ootavad kindlat aega; juhil on raskem tööd planeerida. Lisa oma näide.',
        ['Minu arvates…', 'Näiteks minu töökohas…', 'Ma saan aru, aga…'], ['Ma ei ole päris nõus, sest…', 'Teisalt…', 'Kas võiksime kokku leppida, et…?']), { task: 'S17', harno: 'S2' }),
      B.rubric('030_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: mis juhtus, mida seadus ütleb, palve ja lisad, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Arutlus: poolt- ja vastuargumendid, näited ja järeldus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: kogemus, eesmärk, leping, tüli või äri 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin, reageerisin paarilisele, jõudsime kokkuleppele (15 punkti).']),
      B.selfcheck('030_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Tööelu moodul tehtud'),
    ],
  },
}, {
  'b1b2-026': 'LUGE R→S', 'b1b2-027': 'RÄÄK L→S', 'b1b2-028': 'PROJ R→W', 'b1b2-029': 'KIRJ L→W', 'b1b2-030': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 026
  '026_d_read': [
    '1. lõik: töötuse määr oli 2026. aasta kolmandas kvartalis 7,9 protsenti (Statistikaamet).',
    '2. lõik: karjäärinõustamine on tasuta kõigile, „ka pensioniealistele”.',
    '2. lõik: „Paljud töökohad täidetakse aga tuttavate kaudu, enne kui kuulutus üldse ilmub.”',
    '3. lõik: töökogemus kirjutatakse „alates viimasest töökohast”.',
    '3. lõik: ka „kodus lähedase eest hoolitsemine on kogemus, mida võib kirja panna”.',
    '4. lõik: „Pärast vestlust tasub küsida, millal otsus tehakse.”',
  ],
  '026_p_paths': [
    'Oksana: „töötasin poes müüjana” — amet, olev kääne -na.',
    'Oksana: „sain vahetuse vanemaks” — muutus, saav kääne -ks.',
    'Oksana: „tahaksin saada laoplaneerijaks” — eesmärk, -ks.',
    'Kevin: „olin muuseumis giidina” — roll, -na.',
    'Kevin: „tegin vabatahtlikuna toidupangas tööd” — roll, -na.',
    'Valentina: „töötasin raamatupidajana” — amet, -na.',
    'Valentina: „käin … raamatukogus abilisena” — roll, -na.',
  ],
  '026_t_exit': [
    'töötama kellena → olev kääne; kraanajuht → kraanajuhi → kraanajuhina.',
    'saama kelleks → saav kääne: laojuhatajaks.',
    'töötama kellena → õde → õe (omastav) → õena.',
  ],
  // 027
  '027_d_vote': [
    'Jurist: „Seaduse järgi kestab katseaeg kuni neli kuud.” (töölepingu seadus § 6)',
    'Jurist: „Põhipuhkus on kakskümmend kaheksa kalendripäeva aastas.” (§ 55)',
    'Jurist: „Esimese kolme päeva eest hüvitist ei maksta.”',
    'Jurist: rahas „maksab tööandja poolteist korda tavalise tunnitasu” (§ 44).',
    'Jurist: „Palk tuleb maksta vähemalt kord kuus” (§ 33).',
  ],
  '027_d_radio': [
    'Jurist: „etteteatamise aeg vähemalt viisteist päeva” (§ 96).',
    'Jurist: „Rohkem võib kokku leppida, vähem mitte.”',
    'Jurist: „Neljandast kaheksanda päevani maksab tööandja.”',
    'Jurist: „alates üheksandast päevast tervisekassa”.',
    'Jurist: „Hüvitis on seitsekümmend protsenti keskmisest töötasust.”',
    'Jurist: „Ümbrikupalga pealt ei maksta makse.”',
    'Jurist: „Tööinspektsiooni juristid nõustavad tasuta.”',
  ],
  '027_p_offers': [
    '1200 > 1100 → keskvõrre + kui: suurem kui.',
    '4 < 6 kuud → lühike → lühem; neli kuud vastab seadusele.',
    'Võrdsus: sama + algvorm: sama pikk.',
    '„harva” on vähem kui „iga nädal”: palju → vähe → vähem kui.',
    'eelistama mida millele → alaleütlev, mitmus: öövahetustele.',
    'lähedal → lähemal (kus? keskvõrre).',
    'Kord kuus on tihemini kui kord kahe kuu jooksul: sageli → sagedamini kui.',
    'Kolmest kõige lühem → ülivõrre: kõige lühem (või lühim).',
  ],
  '027_t_check': [
    '40 tundi nädalas on täistööaeg (töölepingu seadus § 43).',
    'Katseaeg on kuni neli kuud; kuus kuud on liiga pikk (§ 6).',
    'Palgapäev on vähemalt kord kuus (§ 33).',
    'Põhipuhkus on 28 kalendripäeva, mitte 21 (§ 55).',
    'Ületunde võib hüvitada vaba ajaga samas ulatuses (§ 44).',
    'Lepinguta sularaha on ümbrikupalk: makse ei maksta, haigushüvitis ja pension kannatavad.',
  ],
  '027_t_exit': [
    'lühike → keskvõrre lühem + kui.',
    'eelistama mida millele → alaleütlev: lisatasule.',
    'pikk → keskvõrre pikem + kui.',
  ],
  // 028
  '028_d_facts': [
    '„alati” üldistab ja hindab inimest — süüdistus.',
    'Kellaaeg ja päev, mida saab kontrollida — fakt.',
    '„kunagi” üldistab — süüdistus.',
    'Kolm päeva ja kellaaeg — fakt.',
    'Räägib teise inimese mõtetest („sind ei huvita”) — süüdistus.',
    'Bussigraafiku muutus on kontrollitav — fakt.',
  ],
  '028_p_better': [
    'Fakt (sel nädalal, kolm korda) ilma „kunagi” ja hinnanguta.',
    'Fakt: tähtaeg ja kaust, mitte arvamus teise huvidest.',
    'Roll → olev kääne: vahetuse vanemana (mitte -ks ega algvorm).',
    'Mina-sõnum: minu raskus, mitte „sa karjud”.',
    'Ettepanek tingivas kõneviisis: Kas me saaksime …?',
    'Roll → olev kääne: sõbrana, töötajana.',
  ],
  '028_t_exit': [
    'Roll (kellena räägin?) → olev kääne: kolleegina.',
    'Roll (kellena?) → töötajana.',
    'valiti kelleks (muutus) → saav kääne: vanemaks.',
  ],
  // 029
  '029_d_baker': [
    'Tatjana: „Kuus aastat tagasi olin lapsega kodus ja küpsetasin … torte.”',
    'Vale: „Alguses avasin ettevõtluskonto”, FIE-ks registreeris ta hiljem.',
    'Tatjana: „pank kannab kakskümmend protsenti ise maksuametile”.',
    'Vale: „teiselt poolt ei saa kulusid maha arvata”.',
    'Vale: „kõik käis ühe päevaga”.',
    'Tatjana: „Alustage väikselt … küsige julgelt raha.”',
  ],
  '029_d_who': [
    'Väike tulu, kulusid peaaegu pole → ettevõtluskonto on kõige lihtsam.',
    'Väike tulu ja vähe kulusid → ettevõtluskonto.',
    'Suured kulud tuleb maha arvata → FIE.',
    'Üle 40 000 euro aastas → tuleb end registreerida ettevõtjaks (FIE).',
    'Kulusid ei ole, tulu on väike → ettevõtluskonto.',
    'Kallid materjalid = suured kulud → FIE, et need maha arvata.',
  ],
  '029_p_listen': [
    'Tatjana ütles: „Ühelt poolt jah, teiselt poolt ei saa …” — pärast „teiselt poolt” tegusõna teisel kohal.',
    'Kui-lause järel tuleb tegusõna: „… läks ettevõtluskonto …”.',
    'Kuigi-lause järel ei ole „aga”: „…, kuigi raamatupidamisega on rohkem tööd”.',
    '„Samas tuleb meeles pidada” — pärast „samas” tegusõna teisel kohal.',
    '„Kuigi …, ma siiski ei loobunud” — kuigi + siiski, ilma „aga”-ta.',
    'Tatjana: „Alustage väikselt … küsige julgelt raha.”',
  ],
  '029_t_exit': [
    'Paar: ühelt poolt … teiselt poolt.',
    'kuigi + kõrvallause (vastandus), siis pealause.',
    'siiski = vaatamata sellele; järgneb tegusõna: ei loobunud.',
  ],
  // 030
  '030_d_read': [
    '(G) lõik: „kellena ma praegu töötan ja kelleks ma tahan saada?”',
    'Sinu oma vastus: õpetaja vaatab, kas räägid päris kogemusest.',
  ],
  '030_d_mc': [
    '(A) lõik: „Tema jaoks oli see uhkuse asi.”',
    '(B) lõik: nõustaja „aitab aru saada, mida sa juba oskad ja mida tasub juurde õppida”.',
    '(C) lõik: „lapsevanemana on paindlik tööaeg sageli tähtsam kui kõrgem palk”.',
    '(D) lõik: „Sel ajal on lepingu lõpetamine mõlemale poolele lihtsam.”',
    '(E) lõik: „Kõige raskem ei ole … töö ise, vaid suhted.”',
    '(A) ja (G): vahetamine on „rohkem siiski head”, kui oskame valikuid kasutada.',
  ],
  '030_d_para': [
    '(A): „Minu arvates mõlemat, aga rohkem siiski head.”',
    '(B): „maailm muutub kiiremini kui inimese karjäär”.',
    '(C): „tähendab see lihtsalt, et tema elu on muutunud”.',
    '(D): „mida kunagi kirja ei panda”.',
    '(E): „Väike mure, millest ei räägita, kasvab sageli suureks tüliks.”',
    '(F): „ei maksa keegi puhkuse ajal palka”.',
    '(F): „Mõni alustab töö kõrvalt.”',
    '(G): „Kui need kaks vastust on väga erinevad, on aeg midagi muuta.”',
  ],
  '030_d_cloze': [
    'Kelle ametikohale? → omastav: klienditeenindaja.',
    'töötama kellena → olev kääne: vahetuse vanemana.',
    'Eluaeg (= kui olin noor) → noorena.',
    'Võrdlus „… kui kõrgem palk” → keskvõrre: tähtsam.',
    'eelistama mida → osastav: hommikust (vahetust).',
    'Vastandus kõrvallausega → kuigi (koma, ilma „aga”-ta).',
    'Ülivõrre: kõige suurem.',
    'saama kelleks → saav kääne: osakonna juhiks.',
    'Kaassõna pärast → omastav: kahe nädala pärast.',
    'Kui-lause: leiate (teie, tingimus tulevikus).',
  ],
  '030_d_bank': [
    'Närvis → miks: varem ainult laos, kliente polnud.',
    'Kolleegid → kuidas nad olid ja mis jäi meelde.',
    'Kliendid küsisid → ta ei teadnud vastuseid.',
    'Väike tüli → mida kolleeg ütles.',
    'Rääkis rahulikult → mis selgus.',
    'Kindel tunne → kolleegist sai õpetaja. Üle jääb lahkumine, mis ei sobi loo lõpuga.',
  ],
  '030_p_fix': [
    'töötama kellena → olev kääne: vahetuse vanemana.',
    'saama kelleks → saav kääne: raamatupidajaks.',
    'Keskvõrre + kui, mitte „nagu”.',
    'eelistama mida → osastav: kirjalikku lepingut.',
    'Pärast „ühelt poolt” tegusõna teisel kohal: on see.',
    'kuigi-lause järel pole „aga” vaja.',
  ],
  '030_p_trans': [
    '„Kui ma olin noor” = noorena; tegusõna teisel kohal: töötasin.',
    'Roll → uue töötajana; eitus teisel kohal: ei tea ma.',
    'tähtsam kui: keskvõrre + kui.',
    'Viisakas ettepanek: tingiv kõneviis saaksime.',
    'kuigi + kõrvallause, koma; pealauses tegusõna ees.',
    'eelistama mida (osastav) millele (alaleütlev): paindlikku tööaega kõrgele palgale.',
  ],
  '030_p_notes': [
    'Teade 1: vahetus algab varem, „sest saabub kaks veokit”.',
    'Teade 1: „Lõunapaus on tavalisel ajal kell kaksteist.”',
    'Teade 2: „kaasa võta oma arvuti või telefon”.',
    'Teade 3: „Oma soovid kirjuta juhatajale reedeks.”',
    'Teade 4: telefon töötab „esmaspäevast reedeni kella üheksast kolmeni”.',
    'Teade 4: „nõustamine on tasuta”.',
  ],
  '030_p_listen': [
    'Signe: „Viimasel ajal tuleb rohkem ka pensionäre.”',
    'Signe: „ta planeeris pere eelarvet”.',
    'Signe: „Liiga pikk CV.”',
    'Signe: „Hea CV on üks-kaks lehekülge.”',
    'Signe: „töökogemus algab viimasest kohast”.',
    'Signe: „Vastus võiks kesta umbes kaks minutit.”',
    'Signe: „Rääkige tuttavatele.”',
    'Signe: vabatahtlik töö „annab kogemuse ja uusi tuttavaid”.',
    'Signe: „tasuta kõigile, ka neile, kes praegu töötavad”.',
  ],
  '030_p_tf': [
    'Vale: tuleb ka viiekümneseid ja pensionäre.',
    'Õige: „viiekümneseid, kes on töö kaotanud või tahavad ametit vahetada”.',
    'Vale: ta alustab küsimusest, mida inimene on teinud.',
    'Õige: „Ma olin ainult kodus lastega” — inimene ei pea seda kogemuseks.',
    'Õige: „Tööandja vaatab seda alguses vaid mõne minuti.”',
    'Vale: rääkida tuleb, kellena oled töötanud, mida oskad ja miks see koht huvitab.',
    'Õige: „paljud kohad täidetakse enne, kui kuulutus ilmub”.',
    'Vale: „tasuta kõigile, ka neile, kes praegu töötavad”.',
  ],
};
