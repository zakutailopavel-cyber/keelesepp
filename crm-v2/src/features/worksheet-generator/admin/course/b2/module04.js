// B2 course (B1 → B2 roadmap), module 4 „Sihitis, ma-/da-infinitiiv ja rektsioon” (b1b2-016…020), stage B1+.
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// sample B1→B2 module 1. Module goal (the learner): „Ma oskan oma asja ajada: ütlen, mis on tehtud, mida pean ja tahan
// teha ning kelle poole pöörduda”; module product „Minu lahendatud mure” (020 Kasuta, the S16 one-minute talk).
// A grammar module kept a task module: the object, the ma-/da-infinitive and verb government serve real tasks of the
// learner's own life — the deposit after moving out, the doctor's note for a relative, a hobby club, a lost wallet.
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 4).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   016 case     „Kas tagatisraha tuleb tagasi?”          home (renting)     final complain: reply to the landlord (W13)
//   017 infogap  „Mida arst täpselt ütles?”               health             final explain: the doctor's note to mum (S13)
//   018 game     „Mille vastu sa huvi tunned?”            free time          final present: introduce yourself to a club (S16)
//   019 project  „Rahakott kadus — mida teha esimese tunni jooksul?”  town / documents  final plan: my SOS plan (S13)
//   020 exam     Vahehindamine 1 in Harno B2 form + „Minu lahendatud mure” as the S16 one-minute talk.
// Grammar line (B12H) by discovery and spiralled: total vs partial object incl. the nominative object after an
// imperative and „tuleb + da” (016; again 017 notice, 019), ma- vs da-infinitive after verbs and „tuleb / on vaja / ei
// tohi” (017; again 019), government of verbs and adjectives — huvi tundma mille vastu, osalema milles, tegelema
// millega, uhke mille üle (018; again 019), all three in one sentence (019). The one long text of the module is the
// topic opener (016 station 2, ≈ 330 words, after a 15-minute hook and pre-taught words). The course's cast is not used.
// Kept for the Õpik sheet of 016 (textbook/sihitis.json): lesson ids and the goal keys g_vocab / g_notice / g_use.
// Kept id of a reused recording: 016_t_voice (new script). The v3 file is in archive/v3/b2/module04.js, the v1 file in
// archive/v1/b2/module04.js; the v2 storyline version (the Riga presentation) is in git history before 2026-11-17.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 4. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

export const MODULE = { id: 'b1b2-module-04', course: 'b2', title: 'Sihitis, ma-/da-infinitiiv ja rektsioon', level: 'B1+', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-016': {
    title: 'Kas tagatisraha tuleb tagasi?',
    phases: grammar('Keel: täis- ja osasihitis — Pesime aknad ära. Aknaid me ei pesnud. Alles peseme aknaid.'),
    format: 'case',
    topic: 'home',
    canDo: 'Ma räägin, mis on kodus tehtud ja mis pooleli, ning kirjutan üürileandjale kirja, kus vaidlen tagatisraha kinnipidamise vastu; täis- ja osasihitis on õiged.',
    teacherPage: {
      goal: 'Ученик понимает правила аренды (залог, обычный износ), различает полный и частичный объект и пишет арендодателю, почему залог надо вернуть.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 2 вопроса; станция 3 — правило и прослушивание, список устно; станция 4 — голосовое и план ответа без двух предложений. Текст (станция 2) — дома, вопросы к нему в начале следующего урока.',
      hook: '«Ты съезжаешь со съёмной квартиры и завтра отдаёшь ключи. Что ты обязательно сделаешь до этого? Что не будешь делать?» Ответьте сами одной фразой («Ma pesen aknad ära»), потом ученик. Первые 5 минут не исправлять.',
      plan: [
        '0–4: крючок — что сделать до передачи ключей, ученик отвечает сразу',
        '4–15: станция 1 — разговор о своём жилье и переездах',
        '15–30: станция 2 — слова (2 мин), прогноз «Сколько людей в Эстонии живут в своём жилье?», текст, 6 вопросов людей, ответ другу, который завтра съезжает (3 предложения)',
        '30–42: станция 3 — заметить в тексте → правило → «сделано или нет?» на слух → свой список перед передачей ключей',
        '42–57: станция 4 — голосовое арендодателя, план ответа и 2 первых предложения письма',
        '57–69: «Kui aega jääb» — ролевая игра: договориться с арендодателем о сумме',
        '69–76: проверка на выходе (3 предложения), «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Eurostat (EU-SILC 2025: в своём жилье 79,7 %, в ЕС 68,5 %, рыночная аренда 8,5 %), Maa- ja Ruumiamet и Statistikaamet (цены и зарплата 2025), Võlaõigusseadus § 308 (залог до трёх месячных плат, можно тремя частями) и § 334 lg 2 (обычный износ — не ответственность жильца). Голосовое арендодателя — учебный сценарий.',
      groups: 'Станция 1 — в парах. Прослушивание — каждый сам, сверка в паре. Станция 4: план ответа в паре, предложения каждый пишет сам. Ролевая игра: один — жилец, другой — арендодатель с вашей карточкой; в 1:1 арендодатель — вы.',
      errors: [
        '«Me ei pesnud aknad» → «Me ei pesnud aknaid» (при отрицании всегда частичный объект).',
        '«Ma parandasin kapiust ära» → «Ma parandasin kapiukse ära» (действие закончено — генитив).',
        '«Palun parandage kapiukse» → «Palun parandage kapiuks» (после повелительного наклонения и «tuleb + da» полный объект — номинатив).',
        '«Ma ootan teie vastuse» → «Ma ootan teie vastust» (ootama, otsima, aitama — всегда партитив).',
      ],
      notes: [
        'Формат — реальный случай: ученик съезжает, арендодатель хочет оставить себе 300 € из 600 € залога. Кто живёт в своей квартире: «Ты сдаёшь квартиру сыну или помогаешь подруге с переездом» — тот же спор с другой стороны.',
        'Цены в тексте — по Таллину; ученику из Нарвы или Ида-Вирумаа задайте вопрос «Kuidas on sinu linnas: kas inimesed üürivad või ostavad?» — его опыт важнее таллинских цифр.',
        'Сюжет станций связан, но станции не зависят друг от друга: в станции 3 жилец уже починил дверцу шкафа — в голосовом арендодатель об этом не знает. Если ученик заметит — отлично, это его главный аргумент.',
        'Обратная связь, 2–3 цели: полный / частичный объект (завершённость, отрицание); ясная просьба (сумма и срок); вежливый, но твёрдый тон. На станции 3 — сначала подсказка («Kas töö sai valmis?»), рекаст — только если не исправил сам.',
      ],
    },
    discover: [
      station(B.text('016_d_hook', 'Võtmed homme ära', 'Kujuta ette: kolid üürikorterist välja ja annad homme võtmed üle. Mida sa enne kindlasti ära teed? Mida jätad tegemata? Ütle kaks asja.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('016_d_talk', 'Minu kodu ja kolimised.', 'Vasta igale küsimusele ja too üks näide oma elust.', [
        'Kas sa elad üürikorteris, oma kodus või kellegi juures? Miks just nii?',
        'Kui tihti oled sa elus kolinud? Mis oli kolimisel kõige raskem?',
        'Mis on sinu arvates parem: kodu üürida või osta? Miks?',
      ], [150, 210], ['Ma elan …', 'Kõige raskem oli …', 'Minu arvates …']), 'Sinu enda kogemus annab tunni juhtumile esimese näite.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma kolimisest. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas ja ei teadnud. Kui õpilane elab oma kodus: „Kas sa oled kunagi korterit välja üürinud või sõbral kolida aidanud?”')),
      station(tag(B.vocab('016_d_vocab', 'Enne lugemist: sõnad.', ['üürnik — квартиросъёмщик', 'üürileandja — арендодатель', 'leping — договор', 'tagatisraha — залог', 'harilik kulumine — обычный износ', 'kahju — ущерб', 'kolima — переезжать', 'kinni pidama — удерживать', 'nõudma — требовать', 'vaidlus — спор']), { topic: ['üürileandja', 'tagatisraha', 'harilik kulumine'] }), 2, 15),
      B.topicOpener('016_d_open', 'Moodul 4. Kodu Eestis: oma või üüritud?', [
        'Eesti on omanike maa. Euroopa Liidu statistikaameti Eurostati andmetel elas 2025. aastal oma kodus peaaegu 80 protsenti Eesti elanikest, Euroopa Liidus keskmiselt aga umbes kaks kolmandikku. Turuhinnaga üürikorteris elas Eestis vaid iga kaheteistkümnes inimene. Paljud ostavad kodu laenuga ja maksavad seda pangale tagasi kakskümmend või kolmkümmend aastat. Oma kodu tähendab paljudele kindlust: keegi ei saa üüri tõsta ega lepingut lõpetada.',
        'Üürikorterit vajavad siiski paljud: noored, üliõpilased, uued töötajad ja need, kes on alles Eestisse kolinud. Kodu ostmine on kalliks läinud. Maa- ja Ruumiameti andmetel maksis kasutatud korteri ruutmeeter Tallinnas 2025. aastal keskmiselt 2871 eurot, Tallinna keskmine brutopalk oli Statistikaameti andmetel 2451 eurot kuus. Kogu kuupalga eest ei saaks pealinnas osta isegi ühte ruutmeetrit. Seepärast üüritakse sageli mitu aastat, enne kui on kogutud raha sissemakseks.',
        'Üürimisel on oma reeglid ja need on kirjas võlaõigusseaduses. Lepingu sõlmimisel võib üürileandja küsida tagatisraha. See on raha, mis tagab, et üürnik maksab üüri ja hoiab korteri korras. Seaduse järgi võib tagatisraha olla kuni kolme kuu üür ja üürnik võib selle maksta kolmes osas. Kui üürileping lõpeb, annab üürnik korteri tagasi ja üürileandja maksab tagatisraha tagasi, kui tal ei ole üürniku vastu nõudeid.',
        'Kõige rohkem vaieldakse selle üle, mida tohib tagatisrahast kinni pidada. Seadus ütleb selgelt: üürnik ei vastuta hariliku kulumise eest, mis kaasneb tavalise elamisega. Kui seinavärv on viie aastaga tuhmunud või põrand veidi kulunud, ei pea üürnik seda kinni maksma. Kui aga üürnik on kapiukse katki teinud või seina sisse augu löönud, võib üürileandja nõuda kahju hüvitamist. Seepärast tasub nii sisse kolides kui ka välja kolides koostada üleandmisakt ja pildistada iga tuba. Kui kokkuleppele ei jõuta, võib vaidluse viia üürikomisjoni, kui see sinu omavalitsuses on, või kohtusse. Enamasti aitab aga juba see, kui üürnik kirjutab rahulikult ja selgelt, mis on tehtud, mis on harilik kulumine ja mida ta palub.',
        'Selles moodulis ajad oma asju üürileandja, arsti, klubi ja ametiga. Ütled, mis on tehtud ja mis mitte, mida pead ja tahad teha ning kelle poole pöörduda.',
      ], 'Eurostat, EU-SILC andmed eluaseme omandi kohta (2025); Maa- ja Ruumiamet, korteriturg 2025 (ERR, 25.07.2025); Statistikaamet, keskmine palk 2025 (05.03.2026); võlaõigusseadus § 308 ja § 334 (Riigi Teataja)', [
        'Kas sinu kodumaal on tavalisem kodu üürida või osta? Miks?',
        'Mis sa arvad, miks ostavad Eesti inimesed kodu nii sageli laenuga?',
        'Kas sul on kunagi olnud üürileandja või üürnikuga vaidlust? Kuidas see lõppes?',
        'Mida sa teeksid, kui üürileandja ei taha tagatisraha tagasi maksta?',
      ]),
      tag(purpose(B.table('016_d_read', 'Mida ütleb tekst?', 'Vasta igale küsimusele ühe-kahe sõnaga, nagu tekst ütleb.', 'Küsimus, Vastus', [
        'Sõber: „Kas Eestis elab rohkem inimesi oma kodus või üürikorteris?” | [oma kodus/omas kodus]',
        'Kolleeg: „Kas Tallinnas saab kuupalga eest osta ühe ruutmeetri kasutatud korterit?” | [ei/ei saa]',
        'Õde: „Kui suur võib tagatisraha seaduse järgi kõige rohkem olla?” | [kolme kuu üür/kuni kolme kuu üür/kolm kuud/kolme kuu üüri suurune]',
        'Naaber: „Kas tagatisraha tuleb maksta korraga?” | [ei/ei pea/kolmes osas/võib maksta kolmes osas]',
        'Sõbranna: „Seinavärv on viie aastaga tuhmunud. Kas pean selle kinni maksma?” | [ei/ei pea]',
        'Poeg: „Kuhu saab viia vaidluse, kui üürileandjaga kokkuleppele ei jõua?” | [üürikomisjoni/kohtusse/üürikomisjoni või kohtusse]',
      ], 'g_read'), 'Inimesed sinu ümber küsivad üürimise kohta; nüüd vastad seaduse ja arvudega.'), { task: 'R15', harno: 'R2b' }),
      tag(purpose(B.writing('016_d_friend', 'Sõber küsib nõu.', 'Sõber kolib homme välja ja kirjutab sulle: „Mida ma pean enne võtmete üleandmist tegema, et tagatisraha tagasi saada?” Vasta talle 3 lausega teksti põhjal.', [3, 3], ['kulumine', 'tuba'], 1, 'g_read'), 'Sõber saab sinu vastusest kolm selget sammu ja hoiab oma raha alles.'), { task: 'W02', level: 3 }),
    ],
    practice: [
      station(B.notice('016_p_notice', 'Märka: kogu töö või ainult osa?', [
        'Tekstist: üürnik **on kapiukse katki teinud** · **pildistada iga tuba** · üürnik **ei pea seda kinni maksma**',
        'Kui üürileping lõpeb, on üleandmine tähtis päev: üürileandja võib nõuda kahju hüvitamist, aga hariliku kulumise eest ei tohi ta tagatisraha kinni pidada. Selge nimekiri aitab vältida vaidlust.',
        '**Täissihitis** — tegevus jõuab lõpuni, sageli koos sõnaga **ära, üle, valmis, puhtaks, katki**: Pesin **akna** ära. Värvisime **seinad** üle.',
        'Ainsuses on täissihitis omastavas (**akna, kapiukse**), mitmuses nimetavas (**aknad, seinad**). Käsu ning **tuleb / on vaja + da** järel on see nimetavas: **Parandage kapiuks** ära! **Tuleb maksta üür.**',
        '**Osasihitis** (osastav): 1) **eitus** — Me **ei pesnud aknaid**. 2) tegevus on **pooleli** — Ma alles **pesen põrandat**. 3) **osa või määramata hulk** — Ostsin **värvi**.',
        'Alati osastavaga: **ootama, otsima, armastama, aitama, kartma**: Ootan **teie vastust**.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.examListen('016_p_done', 'Kuula: kas töö on tehtud?', 'Kuula üürniku juttu ja vali iga töö kohta õige vastus.', 'choice', [
        'Esmaspäeval pesime köögis kõik aknad ära.',
        'Teisipäeval värvisime magamistoa seinu, aga värv sai otsa.',
        'Kapiukse parandasin kolmapäeval ära, nüüd sulgub see jälle hästi.',
        'Vannitoa vuuke me veel ei puhastanud, sest puhastusvahend oli poes otsas.',
        'Neljapäeval viisime vana diivani prügimäele.',
        'Reedel pesin parajasti põrandat, kui üürileandja uksele koputas.',
        'Võtmed otsisime lõpuks diivani alt üles.',
      ], [
        ['Kas üürnik on köögi aknad enne üleandmist juba puhtaks pesnud?', 'jah, lõpuni', 'alles pooleli', 'ei ole tehtud'],
        ['Kas magamistoa seinad on enne võtmete üleandmist üle värvitud?', 'alles pooleli', 'jah, lõpuni', 'ei ole tehtud'],
        ['Kas magamistoa katkine kapiuks on nüüd lõpuni ära parandatud?', 'jah, lõpuni', 'alles pooleli', 'ei ole tehtud'],
        ['Kas vannitoa tumedad vuugid on enne üleandmist puhtaks tehtud?', 'ei ole tehtud', 'jah, lõpuni', 'alles pooleli'],
        ['Kas vana katkine diivan on korterist juba ära viidud?', 'jah, lõpuni', 'alles pooleli', 'ei ole tehtud'],
        ['Kas põrand oli juba pestud, kui üürileandja uksele koputas?', 'alles pooleli', 'jah, lõpuni', 'ei ole tehtud'],
        ['Kas kadunud võtmed on lõpuks diivani alt üles leitud?', 'jah, lõpuni', 'alles pooleli', 'ei ole tehtud'],
      ], 'g_listen'), 'Üürileandja küsib, mis on valmis; sina kuuled vormist, kas töö on lõpetatud.'), { task: 'L01' }),
      'Pärast kuulamist küsi iga vastuse juurde: „Mis sõna sulle seda ütles?” (ära, üles, ei, alles, osastav -t / -id / -u). Nii tuleb reegel õpilaselt, mitte sinult.'),
      tag(purpose(B.writing('016_p_list', 'Minu nimekiri enne võtmete üleandmist.', 'Kirjuta 6 lauset: neli tööd, mille teed lõpuni, ja kaks, mida sa ei tee. Kasuta sõnu ära, üle, puhtaks või ei ja märgi iga lause järele, miks sihitis on täis või osa (lõpp, eitus, pooleli).', [6, 6], ['ära', 'üle', 'ei'], 2, 'g_notice'), 'Nimekirja järgi näed homme, et midagi ei jäänud kogemata tegemata.'), { task: 'G02', level: 3 }),
    ],
    transfer: [
      station(tag(purpose(B.listening('016_t_voice', 'Üürileandja häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna või arv.', [
        'Tere, siin teie üürileandja Kask. Loodan, et kolimine läks hästi ja uues kodus on kõik korras. Käisin eile korteris ja vaatasin kõik toad koos üleandmise nimekirjaga üle.',
        'Köök ja aknad on väga puhtad, aitäh selle eest. Ka võtmed olid kõik alles. Aga mul on kolm muret, millest pean teile rääkima, enne kui tagatisraha tagasi kannan.',
        'Esiteks on elutoa sein kulunud ja tuhm, seepärast tuleb kogu tuba üle värvida. See maksab umbes sada viiskümmend eurot.',
        'Teiseks on magamistoa kapiuks katki ja ei sulgu korralikult. Uus uks maksab koos paigaldamisega kaheksakümmend eurot.',
        'Kolmandaks on vannitoa vuugid tumedad, eriti duši juures. Puhastusfirma küsib selle eest seitsekümmend eurot.',
        'Kokku jätan tagatisrahast endale kolmsada eurot ja ülejäänud kolmsada kannan teile järgmisel nädalal üle. Uued üürnikud kolivad sisse juba kuu alguses, seepärast tahan remondiga kiiresti valmis saada.',
        'Kui teil on küsimusi või te ei ole millegagi nõus, kirjutage mulle sel nädalal. Pilte saan vajaduse korral ka saata. Head päeva!',
      ], [
        'Üürileandja kiidab sõnumis, et köök ja [aknad] on väga puhtad.',
        'Üürileandja arvates tuleb kogu elutuba enne uusi üürnikke üle [värvida].',
        'Elutoa seinte värvimine maksab tema sõnul umbes [150|sada viiskümmend] eurot.',
        'Magamistoa uus kapiuks maksab üürileandja sõnul [80|kaheksakümmend] eurot.',
        'Vannitoa [vuugid] on tema sõnul nii tumedad, et vaja on puhastusfirmat.',
        'Kokku tahab üürileandja tagatisrahast endale kinni pidada [300|kolmsada] eurot.',
      ], 'g_listen'), 'Märkmed näitavad, mille eest üürileandja tahab raha kinni pidada; neid vajad vastuseks.'), { task: 'L03' }), 4, 15, { final: 'complain' }),
      teach(tag(purpose(B.letter('016_t_reply', 'Vastus üürileandjale: tunnis algus, kodus lõpp.', 'Tunnis: plaan suuliselt ja kaks esimest lauset. Kodus: kiri lõpuni — mida te enne üleandmist tegite, miks tuhm sein on harilik kulumine, mitte kahju, millega sa ei nõustu ja mida nõuad (summa ja tähtaeg).', 'Lugupeetud üürileandja!', 'Lugupidamisega\n(sinu nimi)', [120, 150]), 'Üürileandja loeb sinu kirja ja otsustab, kui suure osa tagatisrahast ta tagasi maksab.'), { task: 'W13', main: true }),
      'Kodutöö. Järgmises tunnis loe kiri kui üürileandja ja vasta suuliselt („Aga kapiuks oli ju katki …”). Tagasiside: täis- ja osasihitis (parandasime kapiukse ära, seina me katki ei teinud), harilik kulumine kui argument, selge palve (summa ja tähtaeg), viisakas, kuid kindel toon.'),
      extension(teach(tag(purpose(B.rolecards('016_t_more', 'Rollimäng: lepi üürileandjaga kokku', 'Räägi üürileandjaga ja saa tagasi nii suur osa tagatisrahast kui võimalik.',
        'Olukord: üürileandja tahab tagatisrahast 300 eurot endale jätta.\nSinu eesmärk: saada 600 eurost tagasi vähemalt 500.\nPiirang: sul on sissekolimise päeva pildid, aga üleandmisakti te ei koostanud.',
        'Üürileandja kaart on õpetajal: tema arvamus ja üks pakkumine.',
        ['Me parandasime … ära.', 'Ma ei ole nõus, sest …', 'See on harilik kulumine.', 'Kas oleks võimalik …?'], ['Kahjuks …', 'Ma võin pakkuda …', 'Pildid näitavad …']), 'Kokkulepe säästab sind pikast vaidlusest ja üürikomisjonist.'), { task: 'S10', level: 4 }),
      'Kui aega jääb (12 min). Sina oled üürileandja. Varjatud info: korteris elati neli aastat; sein on sinu arvates „liiga tuhm uutele üürnikele”; sa ei tea, et üürnik parandas kapiukse; vuugid on tõesti tumedad. Takistused ükshaaval: 1) „Seina tuleb värvida, muidu ei saa korterit näidata.” 2) „Üleandmisakti ei ole — kuidas te tõestate?” 3) Paku vuukide eest 50 eurot kinni pidada. Õnnestunud, kui õpilane nimetab hariliku kulumise reegli, kasutab vähemalt kolm sihitist õigesti ja lepib kokku summa ning tähtaja.'), 12),
      tag(exitCheck(purpose(B.gaps('016_t_exit', 'Kontrolli end: kolm sihitist.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Me parandasime eelmisel nädalal magamistoa katkise [kapiukse] ise ära. (kapiuks)',
        'Elutoa [seinu] me üle ei värvinud, sest tuhm värv on harilik kulumine. (seinad)',
        'Ootan teie [vastust] ja ülejäänud tagatisraha hiljemalt järgmiseks reedeks. (vastus)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas täis- ja osasihitis on käes.')), {}),
      purpose(B.selfcheck('016_t_self', ['Ma räägin oma kodust ja kolimistest.', 'Ma leian tekstist üürimise reeglid: tagatisraha ja harilik kulumine.', 'Ma kuulen ja ütlen, kas töö on tehtud või pooleli (pesin aknad ära / pesin aknaid).', 'Ma kirjutan üürileandjale, millega ma ei nõustu ja mida palun.'], 'Juhtum lahendatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.speaking('016_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa enne kolimist kindlasti ära teed ja mida mitte.', [
        'Mida sa enne võtmete üleandmist lõpuni teed?',
        'Millest sa üürileandjaga kindlasti räägid?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi enne järgmist tundi ja annab ühe nõu.')), { task: 'S15', fluency: true }),
      homework('016_t_homework', ['1. Kiri üürileandjale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-017': {
    title: 'Mida arst täpselt ütles?',
    phases: grammar('Keel: ma- ja da-tegevusnimi — pead võtma, tuleb võtta, ei tohi minna, soovitan juua'),
    format: 'infogap',
    topic: 'health',
    canDo: 'Ma saan kuuldust aru õe või arsti nõuannetest ja räägin need pereliikmele lihtsalt edasi; pärast tegusõna ja väljendit valin õige tegevusnime (pead võtma, tuleb võtta, ei tohi minna).',
    teacherPage: {
      goal: 'Ученик понимает советы медсестры линии 1220, выбирает ma-/da-инфинитив и объясняет маме записку врача (медиация, информационный пробел).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 фразы; станция 4 — вопросы мамы и короткое объяснение без договорённости о дне. Звонок (станция 2) — дома, заметки на следующем уроке.',
      hook: '«Вспомни последний раз у врача или звонок в регистратуру. Ты понял всё? Что было самым трудным: слова, скорость или что потом делать?» Ответьте сами коротко, потом ученик.',
      plan: [
        '0–10: станция 1 — крючок и разговор: врач, аптека, кому ты переводил',
        '10–25: станция 2 — слова (2 мин), прогноз «Что посоветует медсестра?», звонок на 1220 дважды, 7 пропусков, «Kas teadsid?»',
        '25–37: станция 3 — ma/da: заметить в звонке → правило → мама звонит с вопросами: 7 ответов по советам медсестры',
        '37–52: станция 4 — записка врача, вопросы мамы, объяснение и договорённость о её завтрашнем дне',
        '52–64: «Kui aega jääb» — ролевая игра: звонок на 1220 ночью',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: сообщение маме, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Звонок — учебный текст, советы общие (не медицинская рекомендация). «Kas teadsid?»: Tervisekassa, terviseportaal.ee «Perearstiabi» — 1220 круглосуточно на эстонском и русском, на английском каждый день 15–17; линия не начинает лечение и не выписывает первичный рецепт; при угрозе жизни 112. Записка врача — учебный сценарий.',
      groups: 'Станция 1 — в парах. Звонок — каждый сам, сверка в паре. Станция 4: пары «ребёнок — мама», второй получает вашу карточку мамы; вы слушаете. В 1:1 мама — вы.',
      errors: [
        '«Ma pean võtta» → «Ma pean võtma» (pidama + ma-tegevusnimi).',
        '«Tuleb võtma» → «Tuleb võtta» (tuleb, on vaja, ei tohi, võib, tasub + da).',
        '«Ma lähen apteeki osta» → «Ma lähen apteeki ostma» (minema + ma — цель движения).',
        '«Tuleb osta ravimi» → «Tuleb osta ravim» (после «tuleb + da» полный объект в номинативе).',
      ],
      notes: [
        'Формат — информационный пробел: у ученика записка врача, у вас (мама) — её день: работа, планы на выходные, чего у неё нет дома. Отвечайте только на вопросы. Если маме объяснять некому — вы сосед, которого ученик отвёз к врачу.',
        'Пенсионеру, который сам ходит к врачу, поменяйте роли: записка — его собственная, он объясняет её вам (мужу, соседке или взрослому сыну), а вы задаёте вопросы мамы. Маме в декрете ближе расширение «Kui aega jääb» — звонок на 1220 ночью из-за температуры ребёнка.',
        'Медицинских советов от себя не даём: всё внутри учебного сценария. Обратная связь, 2–3 цели: ma/da после глагола; простые слова для мамы; проверка «Kas sa said aru?». Во время объяснения не перебивать, 3 замечания в конце.',
      ],
    },
    discover: [
      station(B.text('017_d_hook', 'Kas said kõigest aru?', 'Mõtle viimasele korrale, kui käisid arsti juures või helistasid perearstikeskusesse. Kas said kõigest aru? Mis oli kõige raskem: sõnad, kiirus või see, mida pärast tegema pidid?'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('017_d_talk', 'Arst, apteek ja mina.', 'Vasta ja too näide oma elust.', [
        'Kuhu sa pöördud, kui jääd haigeks või vererõhk tõuseb: perearsti juurde, apteeki või internetti? Miks?',
        'Kas sa oled kunagi kellelegi arsti juures tõlkinud või seletanud? Kuidas läks?',
        'Mis on sinu arvates Eestis arsti juurde pääsemisel kõige raskem?',
      ], [150, 210], ['Tavaliselt pean …', 'Ma tahan …', 'Mul on vaja …']), 'Sinu kogemus näitab, milliseid sõnu ja vorme arsti juures vajad.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma kogemusest. Ära paranda; lõpus ütle, kas õpilane kasutas „pean …”, „tahan …” või „on vaja …” õigesti.')),
      station(tag(B.vocab('017_d_vocab', 'Enne kuulamist: sõnad.', ['palavik — температура', 'ravim — лекарство', 'tablett — таблетка', 'apteek — аптека', 'vererõhk — давление', 'mõõtma — измерять', 'keelatud — запрещено', 'soovitama — советовать', 'nõuandeliin — линия консультаций', 'vastuvõtt — приём (у врача)']), { topic: ['nõuandeliin'] }), 2, 15),
      tag(purpose(B.listening('017_d_call', 'Kõne nõuandeliinile 1220.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna või arv.', [
        'Õde: Perearsti nõuandeliin, tere! Mina olen õde Merike. Kuidas saan aidata?',
        'Helistaja: Tere! Mu emal on kolmandat päeva palavik ja köha. Ta on seitsekümmend kaks aastat vana.',
        'Õde: Kui kõrge on palavik? Kas te mõõtsite seda täna?',
        'Helistaja: Hommikul oli kolmkümmend kaheksa ja pool.',
        'Õde: Kas tal on raske hingata või valu rinnus?',
        'Helistaja: Ei ole, aga ta on väga väsinud ega taha süüa.',
        'Õde: Selge. Praegu peab ta palju puhkama ja jooma päevas vähemalt kaks liitrit vett või teed. Palaviku vastu võib võtta tabletti, aga mitte rohkem, kui pakendil on kirjas.',
        'Helistaja: Kas ta võib laupäeval sauna minna? Ta käib igal laupäeval.',
        'Õde: Ei, palavikuga on saun keelatud. Ka poodi ei tasu minna, et teisi mitte nakatada.',
        'Helistaja: Millal peab ta arsti juurde minema?',
        'Õde: Kui palavik ei lange kahe päeva jooksul, tuleb perearstile helistada ja aeg broneerida. Kui tal hakkab väga raske hingata, helistage kohe 112.',
        'Helistaja: Aitäh! Ma lähen kohe apteeki talle ravimit ostma.',
        'Õde: Palun. Soovin emale kiiret paranemist!',
      ], [
        'Ema on haige olnud juba [kolm päeva|3 päeva|kolmandat päeva].',
        'Hommikul oli emal palavik [38,5|kolmkümmend kaheksa ja pool] kraadi.',
        'Õe sõnul peab ema palju puhkama ja päevas vähemalt kaks liitrit [jooma].',
        'Palavikuga ei tohi ema [sauna] minna.',
        'Kui palavik ei lange [kahe päeva] jooksul, tuleb perearstile helistada.',
        'Väga raske hingamise korral tuleb kohe helistada numbrile [112].',
        'Helistaja läheb apteeki emale [ravimit] ostma.',
      ]), 'Märkmed näitavad, mida ema peab tegema ja mida ta ei tohi.'), { voice: 'interview', task: 'L04', harno: 'L3' }),
      B.know('017_d_know', ['Perearsti nõuandetelefon 1220 töötab ööpäev läbi. Õed ja arstid nõustavad eesti ja vene keeles, inglise keeles iga päev kella 15–17. Nõuandeliin ei alusta ravi ega kirjuta esmast retsepti. Kui elu on ohus, helista hädaabinumbrile 112.'], 'Tervisekassa; terviseportaal.ee, „Perearstiabi”', 'Kas teadsid? Nõuandeliin 1220'),
    ],
    practice: [
      station(B.notice('017_p_notice', 'Märka: pean minema või tuleb minna?', [
        'Kõnest nõuandeliinile: ta **peab** palju **puhkama** · palavikuga **on** saun **keelatud** · poodi **ei tasu minna** · **tuleb** perearstile **helistada** · ma **lähen** apteeki ravimit **ostma**',
        '**ma-tegevusnimi** (-ma): **pidama, hakkama, õppima, aitama, käima** ja liikumine eesmärgiga (**minema, tulema, jääma**): Pean **jooma**. Lähen **ostma**. Hakkan **võtma**.',
        '**da-tegevusnimi** (-da, -ta, -a): **tahtma, võima, tohtima, saama, oskama, proovima, soovitama, unustama**: Võid **võtta**. Ei tohi **minna**.',
        'Väljendid + **da**: **tuleb, on vaja, on keelatud, on lubatud, on parem, tasub**: Tabletti **tuleb võtta** pärast sööki. Pärast vastuvõttu **on vaja** vererõhku **mõõta**.',
        'Pane tähele (tund 16): **tuleb / on vaja + da** järel on täissihitis nimetavas: **Tuleb osta ravim.** **On vaja broneerida aeg.**',
      ], 'full'), 3, 12),
      purpose(B.transformation('017_p_note', 'Ema küsib telefonis.', 'Vasta emale õe nõuande järgi täislausega; kasuta antud sõna.', [
        ['Ema: „Kas ma võin homme tööle minna?” (Õde: palavikuga mitte.)', 'ei tohi', 'Ei, palavikuga ei tohi sa tööle minna.|Ei, sa ei tohi palavikuga tööle minna.'],
        ['Ema: „Mida ma praegu tegema pean?” (Õde: palju puhata.)', 'pead', 'Sa pead praegu palju puhkama.|Praegu pead sa palju puhkama.'],
        ['Ema: „Kas palavikutabletti tohib võtta?” (Õde: jah, pakendi järgi.)', 'võid', 'Jah, sa võid tabletti võtta pakendi järgi.|Jah, pakendi järgi võid sa tabletti võtta.'],
        ['Ema: „Kui palju ma jooma pean?” (Õde: vähemalt kaks liitrit päevas.)', 'tuleb', 'Päevas tuleb juua vähemalt kaks liitrit.|Sul tuleb juua vähemalt kaks liitrit päevas.'],
        ['Ema: „Laupäeval on ju saun!” (Õde: palavikuga saun keelatud.)', 'ei tohi', 'Palavikuga ei tohi sa sauna minna.|Sa ei tohi palavikuga sauna minna.'],
        ['Ema: „Kes mulle ravimi toob?” (Sina: apteeki, kohe.)', 'lähen', 'Ma lähen kohe apteeki sulle ravimit ostma.|Ma lähen kohe apteeki ravimit ostma.'],
        ['Ema: „Millal ma arstile helistan?” (Õde: kui palavik kahe päevaga ei lange.)', 'on vaja', 'Kui palavik kahe päevaga ei lange, on vaja arstile helistada.|Arstile on vaja helistada, kui palavik kahe päevaga ei lange.'],
      ], 'full', 'g_notice'), 'Ema on haige ja segaduses; sinu vastus peab olema lühike ja täpne.'),
    ],
    transfer: [
      station(B.text('017_t_note', 'Arsti märge emale', 'Perearst kirjutas sinu emale (68) pärast vastuvõttu. Retsept on digiretseptina, apteegis tuleb näidata ID-kaarti:\n\n\n• Kõrge vererõhk. Ravim: 1 tablett iga päev hommikul, alati samal ajal.\n\n• Vererõhku mõõta hommikul ja õhtul, tulemused kirja panna.\n\n• Vähem soola, iga päev 30 minutit kõndida.\n\n• Saun on kuu aega keelatud.\n\n• Uus aeg 3 nädala pärast, kaasa vererõhu tabel.\n\n• Kui pea valutab väga või käsi jääb nõrgaks: kohe 112.'), 4, 15, { final: 'explain' }),
      tag(purpose(B.table('017_t_mom', 'Ema küsib vererõhu kohta.', 'Vasta ema küsimustele arsti märke järgi lühidalt.', 'Ema küsimus, Sinu vastus', [
        '„Kas ma võin tableti võtta õhtul?” | [ei/ei, hommikul/hommikul]',
        '„Millal ma pean vererõhku mõõtma?” | [hommikul ja õhtul/hommikul ja õhtul mõõta]',
        '„Kas ma võin laupäeval sauna minna?” | [ei/ei tohi/ei, kuu aega mitte]',
        '„Kui kaua ma pean iga päev kõndima?” | [30 minutit/pool tundi/30 min]',
        '„Mida ma pean uuele vastuvõtule kaasa võtma?” | [vererõhu tabeli/tabeli/vererõhu tabel]',
        '„Mida ma teen, kui pea väga valutab?” | [helistan 112/helista 112/112]',
      ], 'g_read'), 'Ema küsib just seda, mida ta arsti juures ei kuulnud; sina vastad märke järgi.'), { task: 'R07' }),
      teach(tag(purpose(B.rolecards('017_t_talk', 'Seleta emale.', 'Seleta emale arsti märge lihtsate sõnadega ja leppige kokku tema homne päev.',
        'Olukord: ema ei kuulnud arsti juures hästi ja märge on tema jaoks liiga lühike.\nSinu eesmärk: ema teab, mida ta peab, võib ja ei tohi teha, ning teil on kokku lepitud tema homne päev.\nPiirang: ema plaanidest tead vähe; küsi temalt.',
        'Ema kaart on õpetajal: tema päev, plaanid ja üks mure.',
        ['Arst ütles, et sa pead …', 'Sa ei tohi …', 'Sul on vaja …', 'Kas sa said aru, mida …?'], ['Aga ma tahan …', 'Kas ma võin …?', 'Mul ei ole aega …']), 'Tulemus: ema homne päev, kus on ravim, mõõtmine ja kõnd.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (ema; kui õpilasel pole ema lähedal, siis naaber, kelle ta arsti juurde viis). Ütle ainult seda, mida küsitakse. Varjatud info: hommikul kell kuus oled juba bussis teel tööle (koristaja), tablett jääb koju; laupäeval on sünnipäev maal ja seal köetakse sauna; vererõhumõõtjat sul ei ole; soolast kurki sööd iga päev. Takistused ükshaaval: 1) „Ma ei jõua hommikul tabletti võtta.” 2) „Sauna ma ikka lähen, natukene!” 3) „Mõõtjat mul ei ole, kust ma selle saan?” Õnnestunud, kui õpilane küsib vähemalt kolm küsimust, kasutab vähemalt neli tegevusnime õigesti (pead võtma, ei tohi minna, tuleb mõõta …), pakub lahenduse (tablett kotti, mõõtja apteegist) ja kontrollib, kas ema sai aru.'),
      extension(teach(tag(purpose(B.rolecards('017_t_more', 'Rollimäng: helista numbrile 1220', 'Helista nõuandeliinile ja saa teada, mida teha.',
        'Olukord: sinu lapsel või partneril on öösel kõrge palavik.\nSinu eesmärk: saada õelt selge nõu ja teada, millal minna arsti juurde.\nPiirang: täpset palavikku sa ei tea, termomeeter on teises toas.',
        'Õe kaart on õpetajal: tema küsimused ja nõuanded.',
        ['Mul on vaja nõu …', 'Kas ta võib …?', 'Mida ma pean tegema, kui …?'], ['Kas tal on raske hingata?', 'Ta peab …', 'Tuleb …']), 'Telefonis pead ise küsima, sest õde ei näe haiget.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled õde. Küsi: vanus, palavik (palu mõõta), hingamine, joomine. Nõu: juua, puhata, palavikualandaja pakendi järgi; kui palavik ei lange või hingamine läheb raskeks, perearsti juurde; väga raske hingamise korral 112. Õnnestunud, kui õpilane küsib kolm küsimust ja võtab nõu lõpus kokku („Ta peab …, ei tohi …, tuleb …”).'), 12),
      tag(exitCheck(purpose(B.gaps('017_t_exit', 'Kontrolli end: kolm tegevusnime.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Arsti sõnul pead sa nüüd iga päev vähemalt pool tundi [kõndima]. (kõndima)',
        'Kõrge palavikuga ei tohi tööle ega poodi teiste inimeste sekka [minna]. (minema)',
        'Kui palavik homseks ei lange, tuleb perearstile kohe [helistada]. (helistama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas ma- ja da-tegevusnimi on käes.')), {}),
      purpose(B.selfcheck('017_t_self', ['Ma räägin oma kogemusest arsti juures.', 'Ma panen kõnest kirja, mida tuleb teha ja mida ei tohi.', 'Ma valin pärast tegusõna ma- või da-tegevusnime (pead võtma, ei tohi minna).', 'Ma seletan pereliikmele arsti märke lihtsalt edasi.'], 'Arsti jutt selge', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(purpose(B.writing('017_t_msg', 'Kodus: sõnum emale.', 'Kirjuta kodus 120–150 sõna: arsti märge sinu enda sõnadega, nii et ema saab aru. Kasuta vorme pead, ei tohi ja tuleb.', [8, 10], ['pead', 'ei tohi', 'tuleb'], 3, 'g_use'), 'Ema loeb sinu sõnumit ja teab, mida ta homme teeb.'), { task: 'W12', level: 3 }),
      tag(homeTask(purpose(B.speaking('017_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida soovitad sõbrale, kes on külmetunud.', [
        'Mida ta peab tegema ja mida ei tohi?',
        'Millal tuleb arsti juurde minna?',
      ], [60, 120]), 'Õpetaja kuulab sinu nõuanded ja ütleb, kas tegevusnimed on õiged.')), { task: 'S15', fluency: true }),
      homework('017_t_homework', ['1. Sõnum emale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-018': {
    title: 'Mille vastu sa huvi tunned?',
    phases: grammar('Keel: tegus- ja omadussõna rektsioon — huvi tundma mille vastu, osalema milles, tegelema millega, huvitatud millest, harjunud millega, uhke mille üle'),
    format: 'game',
    topic: 'freetime',
    canDo: 'Ma räägin oma huvidest, leian naabrite sõnumitest endale sobiva koha ja tutvustan end selle juhile; tegusõna ja omadussõna järel kasutan õiget käänet (huvi tundma mille vastu, osalema milles, tegelema millega).',
    teacherPage: {
      goal: 'Ученик в игре и в чате соседей говорит о хобби и добровольной работе с правильным управлением (millest, milles, millega) и представляет себя руководителю клуба.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: игра — один раунд; станция 3 — правило и 4 строки письма Олега; станция 4 — выбор предложения из чата и представление без вопросов организатора. Радио (станция 2) — дома, вопросы к нему на следующем уроке.',
      hook: '«Угадай моё хобби! У тебя десять вопросов, я отвечаю только „да“ или „нет“.» Задумайте хобби (например, хоровое пение или рыбалку). Ученик спрашивает: «Kas sa tegeled sellega õues?», «Kas see sõltub ilmast?». Потом роли меняются. Очки на доске.',
      plan: [
        '0–10: станция 1 — игра «Arva ära!» (два раунда, очки), потом 2–3 минуты о своём настоящем хобби',
        '10–25: станция 2 — слова (2 мин), прогноз «Что посоветует координатор?», радио дважды, верно / неверно, «Kas teadsid?» о певческом празднике',
        '25–37: станция 3 — управление глаголов и прилагательных: заметить в радио → правило → письмо Олега в хор: 7 ошибок, кто быстрее (очки)',
        '37–52: станция 4 — чат соседей, 6 вопросов семьи, выбор предложения, представление себя организатору 1–2 минуты и два его вопроса (очки за управление)',
        '52–62: «Kui aega jääb» — мини-дебаты: нужно ли отдавать ребёнка в кружок?',
        '62–70: проверка на выходе, «Ma oskan …», итог очков игры',
        '70–78: домашнее задание: письмо руководителю, запись 1 минуты, слова',
        '78–90: запас',
      ],
      sources: '«Kas teadsid?»: первый всеэстонский певческий праздник — 1869, Тарту; традиция праздников песни и танца — в списке нематериального наследия ЮНЕСКО (2008). Радио и чат соседей — учебные тексты (координатор — вымышленное лицо, советы общие).',
      groups: 'Игра — две команды по 1–2 человека, вы ведёте счёт. Радио и чат — каждый сам, сверка в паре. Представление — по очереди, другой играет организатора с вашими двумя вопросами. В 1:1 организатор — вы.',
      errors: [
        '«Ma huvitun ajalugu» → «Ma huvitun ajaloost» (huvituma millest).',
        '«Ma tunnen huvi ajaloost» → «Ma tunnen huvi ajaloo vastu» (huvi tundma mille vastu).',
        '«Ma osalen koori» → «Ma osalen kooris» / «Ma laulan kooris» (osalema milles).',
        '«Ma aitan vanaemale» → «Ma aitan vanaema» (aitama keda — партитив).',
      ],
      notes: [
        'Формат — игра: очки за каждое правильное управление в крючке, турнире и представлении; кто проиграл, рассказывает один факт о себе. Пенсионеру подходят хор и кружки при библиотеке, маме — места, куда можно прийти с ребёнком, уставшему после смены — разовая помощь на два часа.',
        'Обратная связь, 2–3 цели: падеж после глагола; вопрос-подсказка «Millest? Milles? Millega?» вместо готового ответа; в представлении не перебивать, не больше трёх замечаний в конце.',
      ],
    },
    discover: [
      station(B.text('018_d_hook', 'Arva ära!', 'Õpetaja mõtles ühe hobi välja. Sul on kümme küsimust, millele ta vastab ainult „jah” või „ei”. Näiteks: Kas sa tegeled sellega õues? Kas see sõltub ilmast? Kas selleks on vaja teisi inimesi? Siis mõtled sina ühe hobi välja.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('018_d_game', 'Mäng: arva hobi ära.', 'Küsi kuni kümme küsimust, siis vahetate rollid. Lõpuks räägi oma päris hobist.', [
        'Millega sa vabal ajal kõige meelsamini tegeled?',
        'Mis sind selle juures kõige rohkem huvitab?',
        'Kas oled kunagi mõne hobi vastu huvi kaotanud? Miks?',
      ], [150, 210], ['Kas sa tegeled …?', 'Kas see sõltub …?', 'Kas sa osaled …?']), 'Mäng näitab, kui palju sa juba ütled õige käändega.'), { task: 'S01', fluency: true }),
      'Mõtle välja hobi (näiteks koorilaul, kalapüük, kudumine). Vasta ainult „jah” või „ei”. Punkt läheb küsijale iga õige rektsiooni eest (Kas sa tegeled sellega …? Kas see sõltub ilmast?). Pärast kahte vooru räägi 2–3 minutit oma päris hobist ja küsi õpilase oma kohta.')),
      station(tag(B.vocab('018_d_vocab', 'Enne kuulamist: sõnad.', ['huvi tundma — интересоваться', 'tegelema — заниматься', 'osalema — участвовать', 'sõltuma — зависеть', 'uhke olema — гордиться', 'rahul olema — быть довольным', 'aitama — помогать', 'vabatahtlik — доброволец', 'hobi — хобби', 'koor — хор']), { topic: ['hobi'] }), 2, 15),
      tag(purpose(B.examListen('018_d_radio', 'Raadio: kuidas leida hobi ja seltskonda?', 'Kuula kaks korda: õige või vale?', 'truefalse', [
        'Saatejuht: Tere! Paljud ütlevad, et pärast tööd pole jõudu millegagi tegeleda. Stuudios on vabatahtlike koordinaator Margit Lepp. Margit, kust alustada?',
        'Margit: Kõigepealt mõelge, mille vastu te päriselt huvi tunnete. Kui hobi sõltub ainult tahtejõust, jääb see kiiresti soiku. Parem on alustada millestki, mida teete koos teistega.',
        'Saatejuht: Miks just koos teistega?',
        'Margit: Sest siis ootab keegi teid. Kui osalete kooris või matkaringis, ei jää te õhtul diivanile. Uued tuttavad aitavad ka keelt harjutada.',
        'Saatejuht: Aga kui aega on väga vähe?',
        'Margit: Siis sobib ühekordne vabatahtlik töö. Näiteks saab kaks tundi aidata toidu kogumisel või raamatukogus lastele ette lugeda. Keegi ei nõua, et tuleksite iga nädal.',
        'Saatejuht: Kas vabatahtlikuks võib tulla ka inimene, kes räägib eesti keelt veel vigadega?',
        'Margit: Muidugi! Paljud meie vabatahtlikud alles õpivad keelt. Nad on uhked iga eestikeelse vestluse üle. Tähtis on tahtmine, mitte täiuslik grammatika.',
        'Saatejuht: Ja kui hobi enam ei meeldi?',
        'Margit: Siis proovige midagi muud. Hobi ei pea kestma terve elu. Andke aga igale asjale vähemalt kuu aega, sest alguses on kõik võõras.',
        'Saatejuht: Aitäh, Margit!',
      ], [
        ['Koordinaatori sõnul jääb hobi kiiresti soiku, kui see sõltub ainult tahtejõust.', true],
        ['Koordinaator soovitab alustada hobist, mida saab teha täiesti üksi kodus.', false],
        ['Koos teistega on lihtsam jätkata, sest keegi ootab sind ja sa ei jää diivanile.', true],
        ['Ühekordne vabatahtlik töö tähendab, et pead tulema kohale iga nädal.', false],
        ['Vabatahtlikuks võib tulla ka inimene, kes räägib eesti keelt veel vigadega.', true],
        ['Koordinaatori arvates peab hobi kestma terve elu, muidu pole sellel mõtet.', false],
      ], 'g_read'), 'Asjatundja nõu aitab valida hobi, mida jaksad ka väsinuna jätkata.'), { voice: 'interview', task: 'L05' }),
      B.know('018_d_know', ['Eesti esimene üldlaulupidu peeti 1869. aastal Tartus. Üldlaulupidu peetakse tavaliselt iga viie aasta järel ja selleks harjutavad koorid ja tantsurühmad üle kogu Eesti terve aasta. Paljud neist ootavad uusi liikmeid ka täiskasvanute seast.'], 'Eesti Laulu- ja Tantsupeo SA, laulupidude ajalugu', 'Kas teadsid? Laulupidu'),
    ],
    practice: [
      station(B.notice('018_p_notice', 'Märka: mille vastu, milles, millega?', [
        'Raadiost: mõelge, **mille vastu** te päriselt **huvi tunnete** · hobi **sõltub** ainult **tahtejõust** · kui **osalete kooris** · pole jõudu **millegagi tegeleda** · nad on **uhked** iga eestikeelse **vestluse üle**',
        'Paljud tegusõnad tahavad kindlat käänet. Õpi need koos küsimusega: **huvituma millest**, **sõltuma millest** (-st) · **osalema milles** (-s; aga koosolekul, talgutel) · **tegelema millega** (-ga)',
        'Kaassõnaga: **huvi tundma mille vastu** · **vastutama mille eest** · **pöörduma kelle poole** (omastav + kaassõna)',
        '**Omadussõnad** tahavad samuti käänet: **uhke** mille üle · **rahul** millega · **huvitatud** millest · **harjunud** millega · **tänulik** mille eest · **vihane** kelle peale',
        '**aitama keda** — osastav: aitan **naabrit**, aitan **vanaema**',
        'Kontrolli küsimusega: Millest sa huvitud? Milles sa osaled? Millega sa tegeled? Mille üle oled uhke?',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('018_p_fix', 'Oleg kirjutab koorijuhile.', 'Enne saatmist palub naaber Oleg sinult abi. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Olen juba ammu huvitatud koorilaul.', 'Olen juba ammu huvitatud koorilaulust.|Ma olen juba ammu huvitatud koorilaulust.'],
        ['Koolis osalesin igal aastal laulupidu.', 'Koolis osalesin igal aastal laulupeol.|Koolis osalesin ma igal aastal laulupeol.'],
        ['Praegu tegelen rohkem jalgratas.', 'Praegu tegelen rohkem jalgrattaga.|Praegu tegelen ma rohkem jalgrattaga.'],
        ['Olen harjunud varajane ärkamine, seega sobib mulle ka hommikune proov.', 'Olen harjunud varajase ärkamisega, seega sobib mulle ka hommikune proov.'],
        ['Olen väga uhke oma tütar, kes laulab lastekooris.', 'Olen väga uhke oma tütre üle, kes laulab lastekooris.'],
        ['Kas proovide aeg sõltub kontserdid?', 'Kas proovide aeg sõltub kontsertidest?'],
        ['Olen tänulik teie kutse eest ja ootan teie vastus.', 'Olen tänulik teie kutse eest ja ootan teie vastust.'],
      ], 'full', 'g_notice'), 'Oleg saadab kirja juba täna; ilma vigadeta võetakse ta kohe koori.'), { task: 'G08' }),
      'Mäng: kumb leiab vea kiiremini ja ütleb õige küsimuse („Millest? Milles? Mille üle? Millega?”). Iga õige parandus on punkt; omadussõna rida (huvitatud, harjunud, uhke, tänulik) on kaks punkti.'),
    ],
    transfer: [
      station(B.text('018_t_chat', 'Naabrite vestlus: kes otsib seltsi?', '**Rita:** Tere, naabrid! Meie koor otsib uusi lauljaid, eriti mehi. Harjutame neljapäeviti raamatukogus. Kas keegi tunneb huvi koorilaulu vastu?\n\n**Oleg:** Laulsin koolis kooris, aga nooti ei oska. Kas see on probleem?\n\n**Rita:** Üldse mitte. Peaasi, et osaled proovides regulaarselt.\n\n**Kaia:** Kas keegi tegeleb kudumisega? Tahaksin õppida sokke kuduma, aga üksi ei viitsi.\n\n**Aivar:** Laupäeval kogume poodides toiduabi peredele, kellel on raske. Kaks tundi, kogemust pole vaja. Aitan seal juba kolm aastat ja olen selle üle uhke.\n\n**Liina:** Olen ekraanidest väsinud. Kas keegi käib metsas matkamas? Sõltub ilmast, aga pühapäeviti oleks tore.\n\n**Oleg:** Liina, mina tulen! Olen rahul iga jalutuskäiguga.'), 4, 15, { final: 'present' }),
      tag(purpose(B.table('018_t_match', 'Pere küsib.', 'Vasta vestluse põhjal 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Sinu ema: „Mis päeval koor harjutab?” | [neljapäeviti/neljapäeval]',
        'Sinu vend: „Kas koori minekuks peab oskama noote lugeda?” | [ei/ei pea]',
        'Sinu sõbranna: „Mida tahab Kaia õppida?” | [sokke kuduma/kuduma/kudumist]',
        'Sinu poeg: „Kas toiduabi kogumiseks on vaja kogemust?” | [ei/ei ole/ei ole vaja]',
        'Sinu naaber: „Kui kaua Aivar on seal juba aidanud?” | [kolm aastat/3 aastat]',
        'Sinu kolleeg: „Millal tahaks Liina metsa matkama minna?” | [pühapäeviti/pühapäeval]',
      ], 'g_read'), 'Sinu pere küsib, kas mõni pakkumine sobib ka neile; sina vastad faktiga.'), { task: 'R11' }),
      teach(tag(purpose(B.speaking('018_t_intro', 'Tutvusta end korraldajale.', 'Vali vestlusest üks pakkumine ja räägi selle korraldajale 1–2 minutit: kes sa oled, millega tegeled, mille vastu tunned huvi ja milles tahaksid osaleda. Siis vasta tema kahele küsimusele.', [
        'Kes sa oled ja millega sa vabal ajal tegeled?',
        'Mille vastu sa tunned huvi ja miks just see pakkumine?',
        'Milles sa oled varem osalenud ja mille üle oled uhke?',
        'Millega oled harjunud ja millega oled oma vabas ajas rahul?',
      ], [120, 180], ['Ma tegelen …', 'Olen huvitatud …-st', 'Olen harjunud …-ga', 'Olen uhke … üle']), 'Tulemus: korraldaja teab, kes sa oled, ja kutsub sind esimesele kohtumisele.'), { task: 'S16', main: true, level: 4, harno: 'S1' }),
      'Õpetaja on korraldaja (Rita, Aivar või Liina). Kuula segamata, siis küsi kaks küsimust: 1) „Millega sa saaksid meid aidata peale selle?” 2) „Kas sa saad tulla ka siis, kui …?” (aeg, mis õpilasele ei sobi). Mäng: iga õige rektsioon on punkt; loe punktid kokku ja ütle lõpus. Õnnestunud, kui tutvustuses on vähemalt neli rektsiooni, neist vähemalt kaks omadussõnaga (uhke, rahul, huvitatud, harjunud), ja õpilane vastab mõlemale küsimusele.'),
      extension(teach(tag(purpose(B.speaking('018_t_more', 'Mini-väitlus: kas laps peab huviringis käima?', 'Vali pool: laps peab käima huviringis või laps otsustab ise. Too kaks põhjust ja üks näide.', [
        'Millest sõltub, kas laps tahab trennis käia?',
        'Kas vanemad peaksid lapse eest otsustama? Miks?',
        'Millega sina lapsena tegelesid ja mille üle oled täna rõõmus?',
      ], [120, 180], ['Minu arvates sõltub see …', 'Laps peaks ise osalema …', 'Ma olen tänulik … eest']), 'Mini-väitlus näitab, kas rektsioon püsib ka siis, kui mõtled sisule.'), { task: 'S17', fluency: true }),
      'Kui aega jääb (10 min). Võta vastupidine pool. Üks vastuargument: „Kui laps ise valib, istub ta ainult ekraani ees.” Lõpus ütleb kumbki, mis teise argumendis oli kõige tugevam. Õpilasele, kellel lapsi ei ole: „Kas täiskasvanu peab hobi juurde jääma, kui see enam ei meeldi?”'), 10),
      tag(exitCheck(purpose(B.gaps('018_t_exit', 'Kontrolli end: kolm rektsiooni.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Isa tunneb juba noorusest saadik [kalapüügi] vastu suurt huvi. (kalapüük)',
        'Treener on meie uue [võistkonnaga] väga rahul ja kiidab meid. (võistkond)',
        'Kas sa tegeled [spordiga] ka talvel, kui väljas on pime ja külm? (sport)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas rektsioon on käes.')), {}),
      purpose(B.selfcheck('018_t_self', ['Ma räägin oma hobist ja küsin teise hobi kohta.', 'Ma saan raadiost ja naabrite vestlusest aru, kes mida soovitab, otsib ja pakub.', 'Ma kasutan rektsiooni ka omadussõnadega: huvitatud millest, harjunud millega, uhke mille üle.', 'Ma tutvustan end korraldajale 1–2 minutiga.'], 'Mäng mängitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(purpose(B.writing('018_t_mail', 'Kodus: kiri korraldajale.', 'Kirjuta kodus 120–150 sõna: kes sa oled, millest oled huvitatud, milles oled varem osalenud, millega oled harjunud ja üks küsimus.', [8, 10], ['huvitatud', 'osalen', 'harjunud'], 2, 'g_use'), 'Korraldaja vastab ja kutsub sind esimesele kohtumisele.'), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('018_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mille vastu sa tunned huvi ja millega tahaksid järgmisel aastal tegeleda.', [
        'Mille vastu sa tunned huvi?',
        'Millega tahaksid järgmisel aastal tegeleda ja miks?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi ja ütleb, kas rektsioonid on õiged.')), { task: 'S15', fluency: true }),
      homework('018_t_homework', ['1. Kiri korraldajale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-019': {
    title: 'Rahakott kadus — mida teha esimese tunni jooksul?',
    phases: grammar('Keel: kõik koos — sihitis, ma-/da-tegevusnimi ja rektsioon (Pean kaardi sulgema. Tuleb teatada politseile. Pöördun panga poole.)'),
    format: 'project',
    topic: 'town',
    canDo: 'Ma kirjutan endale plaani, mida teha, kui dokument, pangakaart või võtmed kaovad, ja räägin selle lähedasele; ühes lauses on sihitis, tegevusnimi ja rektsioon õiged (Pean kohe pangale teatama ja kaardi sulgema).',
    teacherPage: {
      goal: 'Ученик делает свой «SOS-план» на случай потери документа, карты или ключей, применяя объект, ma/da-инфинитив и управление, и объясняет его близкому человеку.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 3 — правило и 4 ситуации; станция 4 — свой SOS-план устно, без договорённости с близким. Голосовые сообщения (станция 2) — дома.',
      hook: '«Что хуже всего потерять: ID-карту, банковскую карту, ключи от квартиры или телефон? Голосуем — и одна причина!» Голосуйте оба, вы — с короткой причиной.',
      plan: [
        '0–10: станция 1 — голосование и разговор «Что ты терял и что делал?»',
        '10–25: станция 2 — слова (2 мин), прогноз «Что делают первым?», четыре голосовых сообщения дважды, 8 вопросов, три карточки «первый шаг», «Kas teadsid?»',
        '25–37: станция 3 — всё вместе: заметить в сообщениях → три вопроса (Mida? Kellele? Mida teha?) → 7 ситуаций: верный шаг и верная фраза',
        '37–52: станция 4 — свой SOS-план по карточкам станции 2, объяснить его близкому и договориться о запасном ключе',
        '52–64: «Kui aega jääb» — игра «Üks probleem, kaks sammu»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: инструкция близкому, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?» и карточка документа: ERR, «Politseisse viidud kaotatud isikut tõendav dokument kaotab kehtivuse» (слова PPA). Голосовые сообщения, карточки банка и ключей — учебные общие советы: точные шаги и номер своего банка ученик проверяет дома (ничего не придумываем).',
      groups: 'Голосование — все сразу. Сообщения — каждый сам, сверка в паре. SOS-план — каждый свой; объясняют друг другу в паре, второй играет близкого с вашей карточкой. В 1:1 близкий — вы.',
      errors: [
        '«Pean sulgema kaart» → «Pean kaardi sulgema» (действие до конца — генитив; pidama + ma).',
        '«Tuleb teatada politseid» → «Tuleb teatada politseile» (teatama kellele, millest).',
        '«Pöördun pank» → «Pöördun panga poole» (pöörduma kelle poole).',
        '«Ma ei leidnud võtmed» → «Ma ei leidnud võtmeid» (отрицание → партитив).',
      ],
      notes: [
        'Формат — мини-проект: продукт — карточка «Minu SOS-plaan», которую ученик забирает (фото в телефон, копия семье). Пенсионеру — план для себя и соседа; маме — план семьи; студенту — общежитие; уставшему после смены — три строки, не больше.',
        'Обратная связь, 2–3 цели: три формы в одном предложении («Pean kohe pangale teatama ja kaardi sulgema»); подсказка вопросом («Mida? Kellele? Millest?»); в объяснении близкому не перебивать.',
      ],
    },
    discover: [
      station(B.text('019_d_hook', 'Hääleta kohe!', 'Mis oleks kõige hullem kaotada: ID-kaart, pangakaart, korteri võtmed või telefon? Vali üks ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('019_d_talk', 'Kas sa oled midagi kaotanud?', 'Vasta ja too näide oma elust.', [
        'Mida sa oled kunagi kaotanud? Mis juhtus ja mida sa tegid?',
        'Kas sa leidsid selle üles? Kes sind aitas?',
        'Kuidas sa oma dokumente ja võtmeid praegu hoiad?',
      ], [150, 210], ['Ma kaotasin …', 'Ma pidin …', 'Ma pöördusin … poole']), 'Sinu lugu näitab, mida sa juba tead ja mis sinu plaanist veel puudub.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu. Ära paranda; lõpus ütle, mida õpilane tegi oma loos kõige targemini.')),
      station(tag(B.vocab('019_d_vocab', 'Enne kuulamist: sõnad.', ['kaotama — терять', 'sulgema — заблокировать (закрыть)', 'teatama — сообщать', 'pöörduma — обращаться', 'kehtetu — недействительный', 'taotlema — подавать заявление', 'varastama — красть', 'välja vahetama — заменить', 'võti — ключ', 'hoolitsema — заботиться']), { topic: [] }), 2, 15),
      tag(purpose(B.examListen('019_d_voice', 'Neli häälsõnumit.', 'Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Naaber: Tere, siin naaber teiselt korruselt. Mul juhtus täna üks rumal lugu: kaotasin poes korteri võtmed. Ma ei leidnud neid ei poest ega tänavalt. Nüüd pean üürileandjale teatama ja luku välja vahetama. Kas sa saaksid täna õhtul minu kassi eest hoolitseda? Varuvõti on ju sinu käes. Ma tulen alles hilja, sest pean enne lukuseppa ootama.',
        'Sõber: Tere! Bussis varastati mu rahakott. Seal olid ID-kaart ja pangakaart. Pangakaardi sulgesin kohe pangaäpis ära ja raha ei jõudnud keegi võtta, sest märkasin vargust juba järgmises peatuses. ID-kaardi kaotusest tuleb politseile teatada, siis see tunnistatakse kehtetuks. Homme lähen uut taotlema. Õnneks olin bussikaardi juba varem telefoni pannud, nii et sain koju sõita.',
        'Ema: Tere, kallis! Isa leidis oma passi lõpuks üles, see oli vana jope taskus. Aga ta oli kaotusest juba teatanud. Nüüd ei saa ta seda passi enam kasutada ja peab uue taotlema. Järgmine kord vaatame enne kõik taskud ja kapid hoolikalt läbi, alles siis teatame. Kallistan!',
        'Üliõpilane: Tere, siin Mihkel! Jätsin ühiselamu toa võtme tuppa ja uks lukustus. Valvur ütles, et kõigepealt tuleb kirjutada ühiselamu administraatorile ja minna siis isikut tõendava dokumendiga valvelauda. Varuvõti maksab kümme eurot. Õnneks oli pass mul taskus!',
      ], [
        ['Kus kaotas naaber teiselt korruselt oma korteri võtmed ära?', 'poes', 'tänaval', 'bussis'],
        ['Kellele peab naaber võtmete kaotusest kõigepealt ja kindlasti teatama?', 'üürileandjale', 'politseile', 'pangale'],
        ['Mida palub naaber sinult täna õhtul teha, sest varuvõti on sinu käes?', 'tema kassi eest hoolitseda', 'luku välja vahetada', 'tema võtmeid otsida'],
        ['Mida tegi sõber kohe pärast seda, kui tema rahakott bussis varastati?', 'sulges pangakaardi pangaäpis', 'läks kohe politseisse', 'taotles uue ID-kaardi'],
        ['Mis juhtub ID-kaardiga, kui selle kaotusest või vargusest politseile teatada?', 'see tunnistatakse kehtetuks', 'selle saab tasuta tagasi', 'see saadetakse koju'],
        ['Kust leidis isa oma kadunud passi lõpuks pärast pikka otsimist üles?', 'vana jope taskust', 'auto istme alt', 'politseijaoskonnast'],
        ['Miks ei saa isa oma leitud passi enam reisil ega mujal kasutada?', 'ta oli kaotusest juba teatanud', 'pass oli märjaks saanud', 'passi kehtivus oli läbi'],
        ['Mida peab üliõpilane kõigepealt tegema, et oma tuppa tagasi saada?', 'kirjutama ühiselamu administraatorile', 'kutsuma lukuseppa', 'helistama politseisse'],
      ]), 'Vastused näitavad, mida inimesed esimesena tegid; see on sinu plaani alus.'), { task: 'L07', harno: 'L2' }),
      tag(purpose(B.profiles('019_d_cards', 'Kolm kaarti: mis on esimene samm?', 'Loe kaarte ja tõmba iga kaardi juures alla kõige tähtsam samm.', [
        ['Dokument (ID-kaart, pass)', ['Teata kaotusest Politsei- ja Piirivalveametile.', 'Kadunuks teatatud dokument tunnistatakse kehtetuks, ka kui see hiljem leitakse.', 'Taotle uus dokument.', 'Leitud võõra dokumendi vii politseisse.'], []],
        ['Pangakaart', ['Sulge kaart kohe pangaäpis või panga kaudu.', 'Vaata konto väljavõte üle: kas keegi on midagi ostnud?', 'Telli uus kaart.'], []],
        ['Võtmed', ['Teata üürileandjale või korteriühistule.', 'Vaheta lukk välja, kui võtmete juures oli aadress või nimi.', 'Hoia varuvõtit inimese juures, keda usaldad.'], []],
      ], '3'), 'Kaardid näitavad, mida tehakse kõigepealt; sinu plaan tugineb neile.'), { task: 'R01' }),
      B.know('019_d_know', ['Kui kadunud isikut tõendav dokument viiakse politseisse, kaotab see kehtivuse ja omanik peab taotlema uue. Politsei- ja Piirivalveameti sõnul ei ole kaotatud dokumendi kasutamine enam turvaline. Kui leiad kellegi dokumendi, vii see politseisse; selle pilti ei tasu sotsiaalmeediasse panna.'], 'ERR, „Politseisse viidud kaotatud isikut tõendav dokument kaotab kehtivuse”', 'Kas teadsid? Leitud dokument'),
    ],
    practice: [
      station(B.notice('019_p_notice', 'Märka: mida, kellele, mida teha?', [
        'Sõnumitest: pean **üürileandjale teatama** ja **luku välja vahetama** · **Pangakaardi sulgesin** kohe ära · **ID-kaardi kaotusest tuleb** politseile **teatada**',
        '1) **Sihitis** (tund 16): töö jõuab lõpuni — **sulgesin kaardi**; eitus — **ei leidnud võtmeid**; **tuleb + da** — **tuleb sulgeda kaart**',
        '2) **Tegevusnimi** (tund 17): **pean, lähen, hakkan** + **-ma** · **tuleb, võib, tasub, on vaja** + **-da**',
        '3) **Rektsioon** (tund 18): **teatama kellele millest** · **pöörduma kelle poole** · **hoolitsema kelle eest** · **vastutama mille eest** · omadussõnad: **tänulik mille eest**, **harjunud millega**',
        'Üks lause, kolm otsust: **Pean** kohe **pangale teatama** ja **kaardi sulgema.**',
        'Pane tähele: varastatud dokument on kehtetu alles siis, kui kaotusest teatad. Varuvõtit hoia inimese juures, kes selle eest hoolitseb.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.choice('019_p_steps', 'Õige samm, õige lause.', 'Vali iga olukorra juurde lause, mis on sisult ja vormilt õige.', [
        ['Bussis varastati rahakott koos pangakaardiga. Mida teed kõigepealt?', 'Pean kohe pangakaardi sulgema.', 'Pean kohe pangakaart sulgema.', 'Pean kohe pangakaardi sulgeda.'],
        ['Leidsid tänavalt võõra ID-kaardi. Mida sa sellega teed?', 'Viin selle politseisse.', 'Panen selle pildi sotsiaalmeediasse.', 'Viin seda politseisse.'],
        ['Kaotasid üürikorteri võtmed. Kelle poole pöördud?', 'Pöördun üürileandja poole.', 'Pöördun üürileandjale.', 'Pöördun üürileandjast.'],
        ['Pass on kadunud ja reis on kahe nädala pärast. Mis on esimene samm?', 'Tuleb kaotusest teatada.', 'Tuleb kaotusest teatama.', 'Tuleb kaotust teatada.'],
        ['Lähed nädalaks ära. Mida palud naabrilt?', 'Kas sa saaksid meie kassi eest hoolitseda?', 'Kas sa saaksid meie kassi hoolitseda?', 'Kas sa saaksid meie kassist hoolitseda?'],
        ['Rahakott leiti, aga ID-kaart oli juba kehtetuks tunnistatud. Mis nüüd?', 'Vana kaarti ei saa enam kasutada, tuleb taotleda uus.', 'Vana kaarti saab jälle kasutada, sest see leiti.', 'Vana kaart hakkab jälle kehtima, kui viid selle politseisse.'],
        ['Naaber hoidis sinu varuvõtit ja aitas sind hädas. Mida ütled?', 'Olen sulle abi eest väga tänulik.', 'Olen sulle abiga väga tänulik.', 'Olen sinu abist väga tänulik.'],
      ], 'full', 'g_notice'), 'Hädas pole aega mõelda; õige samm ja õige lause peavad tulema kohe.'), { task: 'G03' }),
      'Pärast iga vastust küsi: „Miks teised kaks ei sobi?” Üks on vale sisult, teine vormilt (sihitis, tegevusnimi või rektsioon). Õpilane leiab reegli ise.'),
    ],
    transfer: [
      station(tag(purpose(B.planning('019_t_plan', 'Minu SOS-plaan.', 'Täida oma plaan: kolm esimest sammu ja kellele teatad. Kasuta vorme pean …, tuleb …, pöördun … poole.', [
        'Kui kaob dokument: mida pean tegema ja kellele teatan?',
        'Kui kaob pangakaart: mida tuleb kohe teha?',
        'Kui kaovad võtmed: kelle poole pöördun ja kes vastutab varuvõtme eest?',
        'Minu kontaktid: pank, üürileandja või ühistu, lähedane inimene.',
      ], 3), 'Plaan jääb sulle: tee sellest pilt ja saada see ka oma perele.'), { task: 'W11', level: 3 }), 4, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('019_t_explain', 'Seleta plaan lähedasele.', 'Seleta oma plaan lähedasele ja leppige kokku, kes kelle eest vastutab.',
        'Olukord: sinu lähedane kolis hiljuti Eestisse ega tea veel, kuidas siin asju aetakse.\nSinu eesmärk: ta teab kolme esimest sammu ja te olete kokku leppinud, kelle juures on varuvõti.\nPiirang: tal ei ole veel Eesti ID-kaarti, ainult pass.',
        'Lähedase kaart on õpetajal: tema küsimused ja üks mure.',
        ['Kõigepealt pead …', 'Sul tuleb …', 'Pöördu … poole.', 'Kes vastutab … eest?', 'Oled sellega harjunud?'], ['Aga kui …?', 'Miks ma pean …?', 'Ma ei saa …']), 'Tulemus: lähedane teab sinu plaani ja oskab seda ise kasutada.'), { task: 'S03', main: true, level: 4 }),
      'Õpetaja kaart (lähedane: vend, ema või sõber). Ütle ainult seda, mida küsitakse. Varjatud info: sul on ainult pass ja pangakaart; eesti keelt sa veel ei loe; elad üürikorteris ja üürileandja räägib ainult eesti keelt. Takistused ükshaaval: 1) „Miks ma pean politseile teatama, kui pass võib ju leiduda?” 2) „Pangaäppi mul ei ole.” 3) „Kelle juures võiks varuvõti olla?” Õnnestunud, kui õpilane seletab kolm sammu, kasutab sihitist, tegevusnime ja rektsiooni õigesti vähemalt neljas lauses ja te lepite varuvõtme kokku.'),
      extension(teach(tag(purpose(B.speaking('019_t_more', 'Mäng: üks probleem, kaks sammu', 'Õpetaja ütleb ühe probleemi. Sul on 30 sekundit: millised on kaks esimest sammu?', [
        'Pangaautomaat ei andnud kaarti tagasi. Pakk ei jõudnud pakiautomaati. Laps kaotas koolis bussikaardi.',
        'Kasuta vorme: pean …, tuleb …, pöördun … poole.',
      ], [120, 180], ['Kõigepealt pean …', 'Siis tuleb …', 'Ma pöördun … poole']), 'Kiire mäng harjutab kolme vormi korraga ilma ettevalmistuseta.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (10–12 min). Probleemid: pangaautomaat ei andnud kaarti tagasi; pakk ei jõudnud pakiautomaati; laps kaotas bussikaardi; rattalukk on katki; naabri vesi tilgub sinu lakke; jalgratas varastati hoovist. Iga õige vorm (sihitis, tegevusnimi, rektsioon) on punkt. Pärast kuut probleemi vahetage rollid.'), 12),
      tag(exitCheck(purpose(B.gaps('019_t_exit', 'Kontrolli end: kolm otsust.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Pangakaardi kaotusest tuleb kohe ja ilma viivituseta oma [pangale] teatada. (pank)',
        'Vana pass on nüüd kehtetu, nii et ma pean homme uut passi [taotlema]. (taotlema)',
        'Otsisin terve õhtu, aga kahjuks ma ei leidnud oma [võtmeid] üles. (võtmed)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas sihitis, tegevusnimi ja rektsioon töötavad koos.')), {}),
      purpose(B.selfcheck('019_t_self', ['Ma räägin, mida ma kunagi kaotasin ja mida tegin.', 'Ma saan sõnumitest aru, mis on esimene samm.', 'Ma kasutan ühes lauses sihitist, tegevusnime ja rektsiooni.', 'Ma koostan oma SOS-plaani ja seletan selle lähedasele.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(purpose(B.writing('019_t_guide', 'Kodus: juhend lähedasele.', 'Kirjuta kodus 120–150 sõna: mida teha Eestis, kui kaob dokument, pangakaart või võtmed. Kasuta vorme pead, tuleb ja pöördu … poole.', [8, 10], ['pead', 'tuleb', 'poole'], 3, 'g_use'), 'Lähedane hoiab juhendit alles ja teab, mida hädaolukorras teha.'), { task: 'W05', level: 3 }),
      tag(homeTask(purpose(B.speaking('019_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu kolm esimest sammu, kui rahakott kaob.', [
        'Mida pead kõigepealt tegema?',
        'Kellele teatad ja kelle poole pöördud?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja annab ühe nõu.')), { task: 'S15', fluency: true }),
      homework('019_t_homework', ['1. Juhend lähedasele, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-020': {
    title: 'Vahehindamine 1 — tunnid 1–20',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Vahehindamine, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Vahehindamine, 1. tund: kuulamine ja keeleosa (45 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Vahehindamine, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    // the reading and the listening + language sheets are exam parts timed by their Harno headers (45 min each); the
    // sheet estimator counts a 520-word article and a twice-heard interview at ≈ 20 min, so they are marked short
    shortSheet: ['discover', 'practice'],
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid elu teemadel (arst, üürimine, huviring, kadunud asjad), kirjutan umbes 140-sõnalise kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma lahendatud murest; sihitis, tegevusnimi ja rektsioon on õiged.',
    // Vahehindamine 1 in Harno B2 form (owner 2026-11-17, round 2): two 90-minute lessons — reading (Avasta, 45 min) and
    // listening + the module's language part (Harjuta, 45 min); writing (60 min) and speaking with the module product
    // (Kasuta, 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same
    // task types (R1, R2a, R3, R4; L3 notes, L4; W1, W2b; S1, S2). Content: module 4 (object, ma- / da-infinitive, verb and
    // adjective government) inside real tasks, with modules 2–3 woven in (doctor's appointment, lost passport, phone scam).
    discover: [
      B.tip('020_d_how', 'Vahehindamine: lugemine (eksami vormis, 45 minutit)', 'Vahehindamine kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      B.vocab('020_d_vocab', 'Tunnid 16–19: sõnad, mis aitavad', ['leping — договор', 'ravim — лекарство', 'apteek — аптека', 'retsept — рецепт', 'vastuvõtt — приём (у врача)', 'hobi — хобби', 'vabatahtlik — доброволец', 'kaotama — терять', 'teatama — сообщать', 'pöörduma — обращаться'], '2'),
      PART('020_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Vahehindamise eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('020_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit. Vasta kahele küsimusele, siis lahenda osad 1 ja 2.', 'Miks me ei küsi arstilt üle?', [
        '(A) Paljud meist tunnevad seda olukorda. Istud arsti vastas, arst räägib kiiresti ja kasutab sõnu, mida sa päris täpselt ei mõista. Sa noogutad, ütled „jah, selge” ja lahkud kabinetist. Ukse taga saad aru, et ei tea, mitu korda päevas pead ravimit võtma või kas tohid homme tööle minna. Miks me ei küsi üle? Minu arvates ei ole põhjus ainult keeles. Sama juhtub ka paljude eestlastega, kes räägivad arstiga oma emakeeles.',
        '(B) Esimene põhjus on aeg. Vastuvõtt kestab tavaliselt vaid mõnikümmend minutit ja patsient tunneb, et arstil on kiire. Keegi ei taha olla see, kes võtab teise inimese aega. Seepärast jäetakse küsimused küsimata ja loodetakse, et kodus selgub kõik iseenesest. Tegelikult kulub ühele lisaküsimusele vähem kui minut, aga valesti võetud ravim võib maksta nädalaid tervist. Ka arsti aeg kulub hiljem rohkem, kui patsient peab samal põhjusel uuesti tulema.',
        '(C) Teine põhjus on häbi. Täiskasvanu ei taha tunnistada, et ta millestki aru ei saanud. Eriti raske on see neil, kes alles õpivad eesti keelt ja kardavad, et neid peetakse rumalaks. Arstid ütlevad aga, et nemad on just rahul patsiendiga, kes küsib. Siis on neil kindlus, et patsient teab, mida teha. Arsti jaoks ei ole küsimus nõrkuse märk, vaid koostöö algus. Vaikiv patsient on talle palju suurem mure kui see, kes küsib kolm korda üle, sest vaikimisest ei saa aru, kas juhised jõudsid kohale.',
        '(D) Kolmas põhjus on see, et me ei valmistu. Enne vastuvõttu tasub kirja panna kolm küsimust: mis mul on, mida pean tegema ja millal pean uuesti tulema. Kasulik on kaasa võtta ka nimekiri ravimitest, mida juba võtad. Kui sul on raske kõike meelde jätta, võid paluda, et arst kirjutaks juhised üles, või võtta kaasa pereliikme. Paljud on oma lähedasele sellise abi eest väga tänulikud, sest neli kõrva kuulevad rohkem kui kaks.',
        '(E) Abi saab ka pärast vastuvõttu. Kui küsimus tekib õhtul või öösel, võib helistada perearsti nõuandetelefonile 1220, kus vastatakse ka vene keeles. Apteeker selgitab, kuidas ravimit võtta ja mida ei tohi sellega koos süüa ega juua. Ravimi pakendis on infoleht, mida tasub enne esimest tabletti läbi lugeda. Kui midagi jääb segaseks, ei maksa arvata, vaid tuleb küsida. Arvamine on arsti juures kõige kallim viga. Parem on küsida kaks korda kui võtta ravimit valesti terve nädala.',
        '(F) Üle küsimine on oskus, mida saab harjutada nagu iga teist oskust. Lihtsad laused aitavad: „Kas te saaksite seda korrata?”, „Kas ma sain õigesti aru, et pean …?”, „Mida ma ei tohi teha?”. Kes on nende lausetega harjunud, tunneb end arsti juures palju kindlamalt. Hea on neid kodus valjusti harjutada, näiteks pereliikme või sõbraga. Lõpuks ei sõltu meie tervis ainult arstist, vaid ka sellest, kas me julgeme küsida.',
        '(G) Mõni ütleb, et tänapäeval saab kõik vastused internetist ja arstilt pole vaja midagi üle küsida. Tõsi, internetist leiab palju teavet, kuid see ei tea sinu ajalugu, sinu teisi ravimeid ega seda, mida arst sinu kehas nägi. Üks foorumi nõuanne võib ühele inimesele sobida ja teisele hoopis kahju teha. Seepärast kasutan mina internetti ainult selleks, et oma küsimused paremini sõnastada. Vastuse annab ikka see, kes mind päriselt läbi vaatas. Kui pärast vastuvõttu tekib uus küsimus, kirjutan selle üles ja küsin järgmisel korral või helistan nõuandetelefonile, mitte ei otsi lõputult foorumitest kinnitust oma hirmudele.',
        'Allikas: Tervisekassa ja terviseportaal.ee, „Perearstiabi” (nõuandetelefon 1220); muu on autori arvamus.',
      ].join('\n\n'), [['Kuhu võib artikli järgi helistada ka öösel?', 'nõuandetelefonile 1220|nõuandetelefonile|1220|numbrile 1220'], ['Mida sina küsiksid arstilt kindlasti? Miks?']]),
      tag(B.choice('020_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mis juhtub artikli alguses paljude patsientidega?', 'Nad lahkuvad kabinetist, aga ei tea, mida teha.', 'Nad ei saa arsti juurde aega.', 'Nad räägivad arstiga vales keeles.', 'Nad küsivad arstilt liiga palju.'],
        ['Miks ei küsita autori sõnul üle aja pärast?', 'Ei taheta võtta arsti ja teiste aega.', 'Vastuvõtt maksab iga minuti eest.', 'Arst ei luba küsimusi esitada.', 'Küsimused võtavad tunde.'],
        ['Mida arvavad arstid patsiendist, kes küsib?', 'Nad on temaga rahul.', 'Nad peavad teda rumalaks.', 'Nad arvavad, et ta ei usalda neid.', 'Nad paluvad tal küsimused kirja panna.'],
        ['Mida soovitab autor teha enne vastuvõttu?', 'panna kirja kolm küsimust', 'lugeda internetist diagnooside kohta', 'tulla vastuvõtule tund aega varem', 'helistada enne nõuandetelefonile'],
        ['Milline järgmistest EI OLE artikli järgi abi pärast vastuvõttu?', 'arsti isiklik telefoninumber', 'nõuandetelefon 1220', 'apteeker', 'ravimi infoleht'],
        ['Mida tahab autor artikliga lugejale kõige rohkem öelda?', 'Üle küsida tasub ja seda saab õppida.', 'Arstid räägivad liiga kiiresti.', 'Ravimeid ei tohi võtta ilma infoleheta.', 'Keel on arsti juures kõige suurem probleem.'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('020_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Mõnda lõiku sobib kaks väidet, mõnda mitte ühtegi.', 'Väide, Lõik', [
        '1. Ka emakeelt rääkivad inimesed ei saa arstist alati aru. | [A]',
        '2. Üks lisaküsimus võtab vähem aega kui vea parandamine. | [B]',
        '3. Keeleõppijad kardavad, et neid peetakse rumalaks. | [C]',
        '4. Vastuvõtule võib kaasa võtta pereliikme. | [D]',
        '5. Apteeker räägib, mida ravimiga koos ei tohi süüa ega juua. | [E]',
        '6. Kindlad laused aitavad arsti juures julgemalt tunda. | [F]',
        '7. Küsimus ei ole arsti silmis nõrkus. | [C]',
        '8. Ravimi infolehte tasub lugeda enne esimest tabletti. | [E]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.cloze('020_d_cloze', 'Osa 3: vali lünka sobiv vorm (10 punkti).', 'Üürnik vastab üürileandjale tagatisraha asjus. Vali iga lünga neljast valikust see, mis sobib.', 'Kiri üürileandjale', [
        'Lugupeetud üürileandja!',
        'Tänan teid {*kiire vastuse|kiiret vastust|kiire vastusega|kiirele vastusele} eest. Andsime korteri eelmisel reedel üle ja olime kogu üürilepingu ajal teie abiga väga {*rahul|rahuldav|rahulikult|rahulolu}.',
        'Teie sõnumis on kirjas, et soovite tagatisrahast kinni pidada kakssada eurot. Kahjuks ma ei saa {*sellega|seda|selle|sellest} nõustuda. Elutoa seina me üle ei {*värvinud|värvisime|värvima|värvida}, sest värv oli viie aastaga lihtsalt tuhmunud. Seaduse järgi ei vastuta üürnik hariliku {*kulumise|kulumist|kulumisega|kulumine} eest.',
        'Magamistoa {*kapiukse|kapiust|kapiuksega|kapiuksest} parandasime juba märtsis ise ära ja saatsime teile ka pildi. Vannitoa vuugid on tõesti tumedad. Selle eest olen nõus {*maksma|maksmine|maksan|makstes} viiskümmend eurot.',
        'Palun kandke ülejäänud {*raha|rahast|rahaga|rahal} üle hiljemalt järgmisel reedel. Olen väga {*huvitatud|huvitav|huvitatult|huvitus} sellest, et lahendaksime asja rahulikult.',
        'Ootan teie {*vastust|vastuse|vastus|vastusega}.',
        'Lugupidamisega\nüürnik Anton Mägi',
      ].join('\n\n'), 'g_notice'), { task: 'R03', harno: 'R3' }),
      tag(B.gaps('020_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe Aleksandri lugu „Kuidas ma koori leidsin”. Vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Kui ma kolm aastat tagasi Tartusse kolisin, ei tundnud ma siin peaaegu kedagi. [Õhtud möödusid enamasti telefoni ja teleri ees.]',
        'Ühel päeval nägin raamatukogu seinal kuulutust. [Segakoor otsis uusi lauljaid, eriti mehi.]',
        'Alguses kartsin, et minu eesti keel ei ole piisavalt hea. [Koorijuht ütles aga, et tähtis on tahtmine, mitte grammatika.]',
        'Esimestes proovides sain laulusõnadest vaevu aru. [Nüüd tean neid peast ja oskan paljude sõnade tähendust seletada.]',
        'Kõige rohkem olen uhke meie suvise kontserdi üle. [Laulsime vabaõhulaval ja publikus istus ka minu pere.]',
        'Koor ei ole mulle ainult hobi. [Sealt olen leidnud sõbrad, kellega käin ka matkamas ja teatris.]',
      ], ['Õhtud möödusid enamasti telefoni ja teleri ees.', 'Segakoor otsis uusi lauljaid, eriti mehi.', 'Koorijuht ütles aga, et tähtis on tahtmine, mitte grammatika.', 'Nüüd tean neid peast ja oskan paljude sõnade tähendust seletada.', 'Laulsime vabaõhulaval ja publikus istus ka minu pere.', 'Sealt olen leidnud sõbrad, kellega käin ka matkamas ja teatris.', 'Seepärast otsustasin koorist lahkuda ja hakata üksi laulma.'], 'full', 'g_read'), { task: 'R16', harno: 'R4' }),
    ],
    // listening in Harno B2 form (notices heard once, an interview twice + true / false) and the module's language part
    practice: [
      B.tip('020_p_how', 'Vahehindamine: kuulamine ja keeleosa (45 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Keeleosas parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      PART('020_p_lpart', 'L', { minutes: 30, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 40 minutit): kolm ülesannet, 23 punkti. Vahehindamise eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('020_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet, igaüht ainult üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Apteek teatab: alates esmaspäevast oleme avatud iga päev kella kaheksast kahekümne kaheni. Retseptiravimi saamiseks võtke kaasa isikut tõendav dokument.',
        '2. Tähelepanu, maja elanikud! Kolmapäeval kella kümnest kolmeni ei ole majas sooja vett, sest keldris vahetatakse torusid.',
        '3. Raamatukogu vestlusring alustab uuesti oktoobris. Kohtume teisipäeviti kell kuus teise korruse saalis. Osalemine on tasuta.',
        '4. Pank hoiatab: meie töötaja ei küsi teilt kunagi telefoni teel PIN-koodi ega paroole. Kui keegi küsib, katkestage kõne ja teatage meile.',
      ], [
        'Apteek on avatud iga päev kella [kaheksast|8-st] kahekümne kaheni.',
        'Retseptiravimi saamiseks tuleb kaasa võtta [isikut tõendav dokument|dokument].',
        'Kolmapäeval ei ole majas [sooja vett].',
        'Raamatukogu vestlusring kohtub [teisipäeviti|teisipäeval] kell kuus.',
        'Vestlusringis osalemine on [tasuta].',
        'Kui keegi küsib telefonis PIN-koodi, tuleb kõne [katkestada|lõpetada].',
      ]),
      tag(B.listening('020_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime üürimisest. Stuudios on üürnike nõustaja Kai Rand. Kai, millega inimesed teie poole kõige sagedamini pöörduvad?',
        'Kai: Kõige rohkem küsitakse tagatisraha kohta. Inimesed kolivad välja ja üürileandja ei taha raha tagasi maksta või peab suure osa kinni.',
        'Saatejuht: Mida peaks üürnik tegema juba sisse kolides?',
        'Kai: Kõige tähtsam on üleandmisakt. Kirjutage üles, mis on katki, ja pildistage iga tuba. Ilma piltideta on hiljem väga raske midagi tõestada.',
        'Saatejuht: Ja kui sein on lihtsalt vana?',
        'Kai: Siis on see harilik kulumine ja selle eest üürnik ei vastuta. Aga kui laps on seina peale joonistanud, on see juba kahju.',
        'Saatejuht: Kui suur võib tagatisraha olla?',
        'Kai: Seaduse järgi kuni kolme kuu üür. Paljud ei tea, et selle võib maksta ka kolmes osas.',
        'Saatejuht: Mida teha, kui kokkuleppele ei jõuta?',
        'Kai: Kõigepealt kirjutage üürileandjale rahulik kiri: mida tegite, millega ei nõustu ja mida palute. Enamasti aitab see. Kui ei aita, võib pöörduda üürikomisjoni või kohtusse.',
        'Saatejuht: Kas teie juurde võib tulla ka vene keelt rääkiv üürnik?',
        'Kai: Muidugi. Meie nõustamine on tasuta ja me räägime eesti, vene ja inglise keeles. Aega saab broneerida meie kodulehel.',
        'Saatejuht: Aitäh, Kai!',
      ], [
        'Nõustajalt küsitakse kõige rohkem [tagatisraha] kohta.',
        'Sisse kolides on kõige tähtsam [üleandmisakt].',
        'Nõustaja sõnul tuleb iga tuba [pildistada].',
        'Vana sein on [harilik kulumine], selle eest üürnik ei vastuta.',
        'Kui laps on seina peale joonistanud, on see [kahju].',
        'Tagatisraha võib olla kuni [kolme kuu|3 kuu] üür.',
        'Tagatisraha võib maksta ka kolmes [osas].',
        'Esimene samm vaidluses on üürileandjale [rahulik] kiri.',
        'Nõustaja juurde saab aja broneerida [kodulehel].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('020_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Kõige sagedamini pöördutakse nõustaja poole tagatisraha pärast.', true],
        ['Nõustaja arvates piisab korteri üleandmisel suulisest kokkuleppest.', false],
        ['Vana tuhm sein on üürniku süü ja ta peab selle kinni maksma.', false],
        ['Lapse joonistused seinal on kahju, mitte harilik kulumine.', true],
        ['Tagatisraha tuleb maksta korraga lepingu sõlmimise päeval.', false],
        ['Enamasti aitab juba rahulik kiri üürileandjale.', true],
        ['Nõustamise eest tuleb maksta tunnitasu.', false],
        ['Nõustaja juurde saab aja broneerida kodulehel.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.tip('020_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 16–19. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('020_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Sõber palus sul sõnumid üle vaadata. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Arst ütles, et ma pean võtta tabletti hommikul.', 'Arst ütles, et ma pean võtma tabletti hommikul.|Arst ütles, et ma pean tabletti hommikul võtma.|Arst ütles, et pean tabletti hommikul võtma.'],
        ['Me ei leidnud võtmed ja pidime lukusepa kutsuma.', 'Me ei leidnud võtmeid ja pidime lukusepa kutsuma.'],
        ['Olen väga huvitatud teie koor.', 'Olen väga huvitatud teie koorist.'],
        ['Pöördusin pank, sest kaart oli varastatud.', 'Pöördusin panga poole, sest kaart oli varastatud.'],
        ['Tagatisraha tuleb tagasi maksma kahe nädala jooksul.', 'Tagatisraha tuleb tagasi maksta kahe nädala jooksul.'],
        ['Vanaema on väga rahul uus arst.', 'Vanaema on väga rahul uue arstiga.|Vanaema on uue arstiga väga rahul.'],
      ]),
      B.transformation('020_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle sama mõte antud sõnadega.', [
        ['Arst keelas mul raskusi tõsta.', 'ei tohi', 'Ma ei tohi raskusi tõsta.|Mina ei tohi raskusi tõsta.'],
        ['Koorilaul huvitab mind väga.', 'olen huvitatud', 'Ma olen koorilaulust väga huvitatud.|Olen koorilaulust väga huvitatud.|Ma olen väga huvitatud koorilaulust.|Olen väga huvitatud koorilaulust.'],
        ['Üürileandja ütles: „Parandage kapiuks ära!”', 'pidin', 'Ma pidin kapiukse ära parandama.|Pidin kapiukse ära parandama.'],
        ['Kas matk toimub? See oleneb ilmast.', 'sõltub', 'Matk sõltub ilmast.|See sõltub ilmast.'],
        ['Mul on vaja minna apteeki, sest tahan ravimit osta.', 'lähen … ostma', 'Ma lähen apteeki ravimit ostma.|Lähen apteeki ravimit ostma.'],
        ['Ma pean politseile kaotusest rääkima.', 'teatama', 'Ma pean politseile kaotusest teatama.|Pean politseile kaotusest teatama.|Ma pean kaotusest politseile teatama.|Pean kaotusest politseile teatama.'],
      ]),
      B.rubric('020_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('020_t_situation', 'Vahehindamine: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad perearstikeskusele ja arutled kodu üle. Sõnavõtus esitled mooduli tulemust: üht oma päris muret, mille plaani paned enne kirja kaardile „Minu lahendatud mure”.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own case, built from 016–019
      B.planning('020_t_product', 'Mooduli tulemus: minu lahendatud mure.', 'Vali üks päris mure oma elust (üürileandja, arst, klubi, kadunud dokument või võtmed) ja pane kirja oma plaan. Kasuta mooduli tundide tulemusi.', ['Mis juhtus ja mis on juba tehtud? (tund 16: täis- ja osasihitis)', 'Mida pead, tahad või ei tohi veel teha? (tund 17: ma- ja da-tegevusnimi)', 'Kelle poole pöördud, kes vastutab mille eest ja millega oled rahul? (tunnid 18–19: rektsioon)', 'Mis on sinu esimene samm sel nädalal ja kellele sa sellest räägid?']),
      PART('020_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; vahehindamise eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('020_t_letter', 'Kirjutamine 1: kiri perearstikeskusele (umbes 140 sõna).', 'Perearstikeskus viis sinu vastuvõtu tööpäeva hommikusse, kui sa tulla ei saa. Kirjuta: miks sa ei saa tulla, mida sul on vaja (retsepti pikendamine ja üks küsimus ravimi kohta) ja palu uus aeg.', 'Lugupeetud perearstikeskus!', 'Lugupidamisega', [125, 144]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('020_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Teema: kas noorel inimesel on Eestis mõistlikum kodu üürida või osta? Kirjuta arutlus: poolt- ja vastuargumendid, igaühele näide, ja lõpus oma järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 4), { task: 'W14', harno: 'W2b' }),
      PART('020_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; vahehindamise eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('020_t_present', 'Rääkimine 1: sõnavõtt koosolekul (1 minut).', 'Teemakaart: kursuse koosolekul räägib igaüks ühest murest, mille ta ise lahendas või lahendab. Mõtle 2 minutit oma kaardi „Minu lahendatud mure” järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mis juhtus ja mis on juba tehtud?', 'Mida pead veel tegema?', 'Kelle poole pöördusid ja kes aitas?', 'Mida soovitaksid teistele samas olukorras?', 'Kumb on sinu arvates parem: mure kohta helistada või kirjutada? Miks?', 'Mis sinu arvates teeb asjaajamise eesti keeles kõige raskemaks?'], [90, 120], ['Tahaksin rääkida ühest murest…', 'Kõigepealt pidin…', 'Pöördusin … poole, sest…']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('020_t_feedback', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas gümnaasiumis peaks olema kohustuslik vabatahtlik töö? Argumendid: noored saavad päris kogemuse; paljud leiavad endale hobi; kogukond saab abi. Lisa oma näide.', 'Kaart B (vastu). Teema: kas gümnaasiumis peaks olema kohustuslik vabatahtlik töö? Argumendid: vabatahtlik töö ei saa olla kohustuslik; noortel on niigi palju koormust; kasu on ainult siis, kui huvi on päris. Lisa oma näide.',
        ['Minu arvates…', 'Näiteks minu tuttav…', 'Ma saan aru, aga…'], ['Ma ei ole päris nõus, sest…', 'Teisalt…', 'Kas võiksime kokku leppida, et…?']), { task: 'S17', harno: 'S2' }),
      B.rubric('020_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: põhjus, vajadus ja palve uue aja kohta, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Arutlus: poolt- ja vastuargumendid, näited ja järeldus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: mure, tehtud ja tegemata sammud ning abi 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin, reageerisin paarilisele, jõudsime kokkuleppele (15 punkti).']),
      B.selfcheck('020_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne B1+ mooduleid korrata.'], 'B1 alus valmis'),
    ],
  },
}, {
  'b1b2-016': 'KIRJ R→W', 'b1b2-017': 'PROB L→S', 'b1b2-018': 'RÄÄK R→S', 'b1b2-019': 'PROJ L→W', 'b1b2-020': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 016
  '016_d_read': [
    '1. lõik: oma kodus elab „peaaegu 80 protsenti” elanikest, turuhinnaga üüril vaid iga kaheteistkümnes.',
    '2. lõik: „Kogu kuupalga eest ei saaks pealinnas osta isegi ühte ruutmeetrit” (2871 € > 2451 €).',
    '3. lõik: tagatisraha võib olla „kuni kolme kuu üür” (võlaõigusseadus § 308).',
    '3. lõik: üürnik „võib selle maksta kolmes osas”.',
    '4. lõik: tuhmunud seinavärv on harilik kulumine — üürnik selle eest ei vastuta (§ 334).',
    '4. lõik: vaidluse võib viia „üürikomisjoni, kui see sinu omavalitsuses on, või kohtusse”.',
  ],
  '016_p_done': [
    '„pesime … aknad ära” — mitmuse nimetav + ära: töö on lõpuni tehtud.',
    '„värvisime … seinu” — osastav ja „värv sai otsa”: töö jäi pooleli.',
    '„Kapiukse parandasin … ära” — omastav + ära: valmis.',
    '„vuuke me veel ei puhastanud” — eitus, osastav: tegemata.',
    '„viisime vana diivani prügimäele” — omastav: diivan on ära viidud.',
    '„pesin parajasti põrandat, kui …” — osastav ja „parajasti”: töö käis veel.',
    '„Võtmed otsisime … üles” — üles + nimetav: võtmed on leitud.',
  ],
  '016_t_voice': [
    'Sõnumis: „Köök ja aknad on väga puhtad.”',
    'Sõnumis: „tuleb kogu tuba üle värvida” — tuleb + da-tegevusnimi.',
    'Sõnumis: värvimine „maksab umbes sada viiskümmend eurot”.',
    'Sõnumis: „Uus uks maksab kaheksakümmend eurot.”',
    'Sõnumis: „vannitoa vuugid on tumedad”.',
    'Sõnumis: „jätan tagatisrahast endale kolmsada eurot”.',
  ],
  '016_t_exit': [
    'Töö on lõpuni tehtud (ära) → ainsuse omastav: kapiukse.',
    'Eitus (ei värvinud) → osastav, mitmus: seinu.',
    'ootama tahab alati osastavat: vastust.',
  ],
  // 017
  '017_d_call': [
    'Helistaja: emal on „kolmandat päeva palavik ja köha”.',
    'Helistaja: „Hommikul oli kolmkümmend kaheksa ja pool.”',
    'Õde: „peab ta palju puhkama ja jooma” — pidama + ma-tegevusnimi.',
    'Õde: „palavikuga on saun keelatud” = sauna ei tohi minna.',
    'Õde: „Kui palavik ei lange kahe päeva jooksul …”',
    'Õde: „Kui tal hakkab väga raske hingata, helistage kohe 112.”',
    'Helistaja: „Ma lähen kohe apteeki talle ravimit ostma.”',
  ],
  '017_p_note': [
    'ei tohi + da-tegevusnimi: minna („palavikuga mitte” = ei tohi).',
    'pidama + ma-tegevusnimi: pead puhkama.',
    'võima + da-tegevusnimi: võtta; osa ravimist, mitte tervik → osastav tabletti.',
    'tuleb + da-tegevusnimi: juua.',
    'ei tohi + da-tegevusnimi: minna; kuhu? → sauna.',
    'minema + eesmärk → ma-tegevusnimi: lähen ostma.',
    'on vaja + da-tegevusnimi: helistada.',
  ],
  '017_t_mom': [
    'Märkes: tablett „iga päev hommikul, alati samal ajal” — mitte õhtul.',
    'Märkes: „Vererõhku mõõta hommikul ja õhtul.”',
    'Märkes: „Saun on kuu aega keelatud.”',
    'Märkes: „iga päev 30 minutit kõndida”.',
    'Märkes: „Uus aeg 3 nädala pärast, kaasa vererõhu tabel.”',
    'Märkes: „Kui pea valutab väga … kohe 112.”',
  ],
  '017_t_exit': [
    'pidama + ma-tegevusnimi: pead kõndima.',
    'ei tohi + da-tegevusnimi: minna.',
    'tuleb + da-tegevusnimi: helistada.',
  ],
  // 018
  '018_d_radio': [
    'Margit: „Kui hobi sõltub ainult tahtejõust, jääb see kiiresti soiku.”',
    'Vale: ta soovitab alustada „millestki, mida teete koos teistega”.',
    'Margit: „Sest siis ootab keegi teid … ei jää te õhtul diivanile.”',
    'Vale: „Keegi ei nõua, et tuleksite iga nädal.”',
    'Margit: „Muidugi! Paljud meie vabatahtlikud alles õpivad keelt.”',
    'Vale: „Hobi ei pea kestma terve elu.”',
  ],
  '018_t_match': [
    'Rita: „Harjutame neljapäeviti raamatukogus.”',
    'Rita Olegile: noote lugeda ei pea oskama — „Üldse mitte.”',
    'Kaia: „Tahaksin õppida sokke kuduma.”',
    'Aivar: „kogemust pole vaja”.',
    'Aivar: „Aitan seal juba kolm aastat.”',
    'Liina: „pühapäeviti oleks tore”.',
  ],
  '018_t_exit': [
    'huvi tundma mille vastu → omastav + vastu: kalapüügi vastu.',
    'rahul millega → kaasaütlev: võistkonnaga.',
    'tegelema millega → kaasaütlev: spordiga.',
  ],
  // 019
  '019_d_voice': [
    'Naaber: „kaotasin poes korteri võtmed”.',
    'Naaber: „pean üürileandjale teatama” — teatama kellele.',
    'Naaber: „Kas sa saaksid … minu kassi eest hoolitseda?” — hoolitsema kelle eest.',
    'Sõber: „Pangakaardi sulgesin kohe pangaäpis ära.” Politseisse ja uue kaardi järele läheb ta alles hiljem.',
    'Sõber: „ID-kaardi kaotusest tuleb politseile teatada, siis see tunnistatakse kehtetuks.”',
    'Ema: pass „oli vana jope taskus”.',
    'Ema: „ta oli kaotusest juba teatanud” — teatatud dokument on kehtetu.',
    'Mihkel: „kõigepealt tuleb kirjutada ühiselamu administraatorile”.',
  ],
  '019_t_exit': [
    'teatama kellele → alaleütlev: pangale.',
    'pidama + ma-tegevusnimi: pean taotlema.',
    'Eitus → osastav, mitmus: võtmeid.',
  ],
  // 020
  '018_p_fix': [
    'huvitatud millest → seestütlev: koorilaulust.',
    'osalema + üritus alalütlevas (nagu koosolekul, talgutel): laulupeol.',
    'tegelema millega → kaasaütlev: jalgrattaga.',
    'harjunud millega → kaasaütlev: varajase ärkamisega.',
    'uhke kelle üle → omastav + üle: tütre üle.',
    'sõltuma millest → seestütlev, mitmus: kontsertidest.',
    'ootama tahab alati osastavat: vastust.',
  ],
  '019_p_steps': [
    'Kõigepealt sulge kaart; pidama + ma: sulgema, terve kaart → omastav pangakaardi.',
    'Leitud dokument viiakse politseisse; tulemus → täissihitis selle (mitte seda); pilti ei panda internetti.',
    'pöörduma kelle poole → omastav + poole: üürileandja poole.',
    'tuleb + da: teatada; teatama millest → seestütlev: kaotusest.',
    'hoolitsema kelle eest → omastav + eest: kassi eest.',
    'Kehtetuks tunnistatud dokument ei hakka enam kehtima, ka kui see leitakse.',
    'tänulik mille eest → omastav + eest: abi eest.',
  ],
  '020_d_read': [
    '(E) lõik: õhtul või öösel „võib helistada perearsti nõuandetelefonile 1220”.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad.',
  ],
  '020_d_mc': [
    '(A) lõik: „Sa noogutad … ja lahkud kabinetist” — ja ukse taga ei tea, mida teha.',
    '(B) lõik: „Keegi ei taha olla see, kes võtab teise inimese aega.”',
    '(C) lõik: arstid „on just rahul patsiendiga, kes küsib”.',
    '(D) lõik: „Enne vastuvõttu tasub kirja panna kolm küsimust.”',
    '(E) lõik nimetab nõuandetelefoni, apteekrit ja infolehte; arsti isiklikku numbrit mitte.',
    '(F) lõik ja kogu artikkel: üle küsimine on oskus, mida saab harjutada.',
  ],
  '020_d_para': [
    '(A): „Sama juhtub ka paljude eestlastega, kes räägivad arstiga oma emakeeles.”',
    '(B): lisaküsimus võtab alla minuti, valesti võetud ravim aga nädalaid.',
    '(C): keeleõppijad „kardavad, et neid peetakse rumalaks”.',
    '(D): „võtta kaasa pereliikme”.',
    '(E): apteeker selgitab, „mida ei tohi sellega koos süüa ega juua”.',
    '(F): lausetega harjunud inimene „tunneb end arsti juures palju kindlamalt”.',
    '(C): „Arsti jaoks ei ole küsimus nõrkuse märk.”',
    '(E): infolehte „tasub enne esimest tabletti läbi lugeda”.',
  ],
  '020_d_cloze': [
    'tänama mille eest → omastav + eest: kiire vastuse eest.',
    'rahul millega: teie abiga olime rahul (omadussõna).',
    'nõustuma millega → kaasaütlev: sellega.',
    'Eitus lihtminevikus: ei värvinud.',
    'vastutama mille eest → omastav + eest: hariliku kulumise eest.',
    'Töö sai valmis (ära) → täissihitis omastavas: kapiukse.',
    'nõus olema + ma-tegevusnimi: maksma.',
    'Käsk (kandke üle) → täissihitis nimetavas: raha.',
    'huvitatud millest: sellest, et … → huvitatud.',
    'ootama tahab osastavat: vastust.',
  ],
  '020_d_bank': [
    'Üksi uues linnas → õhtud telefoni ja teleri ees.',
    'Kuulutus → mida see kuulutas: koor otsis lauljaid.',
    'Hirm keele pärast → koorijuht rahustas: tähtis on tahtmine.',
    'Alguses vaevu → nüüd tean peast: võrdlus enne ja pärast.',
    'Uhke kontserdi üle → kontserdi kirjeldus.',
    'Mitte ainult hobi → sõbrad ka väljaspool koori. Üle jääb lause lahkumisest, mis ei sobi loo mõttega.',
  ],
  '020_p_notes': [
    'Teade 1: „avatud iga päev kella kaheksast kahekümne kaheni”.',
    'Teade 1: „võtke kaasa isikut tõendav dokument”.',
    'Teade 2: „ei ole majas sooja vett”.',
    'Teade 3: „Kohtume teisipäeviti kell kuus.”',
    'Teade 3: „Osalemine on tasuta.”',
    'Teade 4: „katkestage kõne ja teatage meile”.',
  ],
  '020_p_listen': [
    'Kai: „Kõige rohkem küsitakse tagatisraha kohta.”',
    'Kai: „Kõige tähtsam on üleandmisakt.”',
    'Kai: „pildistage iga tuba”.',
    'Kai: vana sein on „harilik kulumine”.',
    'Kai: lapse joonistus seinal „on see juba kahju”.',
    'Kai: „Seaduse järgi kuni kolme kuu üür.”',
    'Kai: „selle võib maksta ka kolmes osas”.',
    'Kai: „Kõigepealt kirjutage üürileandjale rahulik kiri.”',
    'Kai: „Aega saab broneerida meie kodulehel.”',
  ],
  '020_p_tf': [
    'Õige: „Kõige rohkem küsitakse tagatisraha kohta.”',
    'Vale: tuleb koostada üleandmisakt ja pildistada iga tuba.',
    'Vale: vana sein on harilik kulumine, selle eest üürnik ei vastuta.',
    'Õige: „kui laps on seina peale joonistanud, on see juba kahju”.',
    'Vale: „selle võib maksta ka kolmes osas”.',
    'Õige: „Enamasti aitab see.”',
    'Vale: „Meie nõustamine on tasuta.”',
    'Õige: „Aega saab broneerida meie kodulehel.”',
  ],
  '020_p_fix': [
    'pidama + ma-tegevusnimi: pean võtma.',
    'Eitus → osastav: võtmeid.',
    'huvitatud millest → seestütlev: koorist.',
    'pöörduma kelle poole → omastav + poole: panga poole.',
    'tuleb + da-tegevusnimi: maksta.',
    'rahul millega → kaasaütlev: uue arstiga.',
  ],
  '020_p_trans': [
    'ei tohi + da-tegevusnimi: tõsta; eituses osastav raskusi.',
    'huvitatud millest → seestütlev: koorilaulust.',
    'pidama + ma: parandama; käsu nimetav kapiuks → tulemus omastavas kapiukse.',
    'sõltuma millest → seestütlev: ilmast.',
    'minema + eesmärk → ma-tegevusnimi: lähen ostma; osa → ravimit.',
    'teatama kellele millest: politseile kaotusest.',
  ],
};
