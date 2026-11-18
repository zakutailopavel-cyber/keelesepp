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
        'Kõige rohkem vaieldakse selle üle, mida tohib tagatisrahast kinni pidada. Seadus ütleb selgelt: üürnik ei vastuta hariliku kulumise eest, mis kaasneb tavalise elamisega. Kui seinavärv on viie aastaga tuhmunud või põrand veidi kulunud, ei pea üürnik seda kinni maksma. Kui aga üürnik on kapiukse katki teinud või seina sisse augu löönud, võib üürileandja nõuda kahju hüvitamist. Seepärast tasub nii sisse kolides kui ka välja kolides koostada üleandmisakt, lasta üürileandjal see allkirjaga kinnitada ja pildistada iga tuba. Kui kokkuleppele ei jõuta, võib vaidluse viia üürikomisjoni, kui see sinu omavalitsuses on, või kohtusse. Enamasti aitab aga juba see, kui üürnik kirjutab rahulikult ja selgelt, mis on tehtud, mis on harilik kulumine ja mida ta palub.',
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
      ], 'g_read'), 'Inimesed sinu ümber küsivad üürimise kohta; nüüd vastad seaduse ja arvudega.'), { task: 'R15' }),
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
      tag(purpose(B.writing('016_p_list', 'Minu nimekiri enne võtmete üleandmist.', 'Kirjuta 6 lauset: neli tööd, mille teed lõpuni, ja kaks, mida sa ei tee. Kasuta sõnu ära, üle, puhtaks või ei ja märgi iga lause järele, miks sihitis on täis või osa (lõpp, eitus, pooleli).', [6, 6], ['ära', 'üle', 'ei'], 2, 'g_notice'), 'Nimekirja järgi näed homme, et midagi ei jäänud kogemata tegemata.'), { task: 'W07', level: 3 }),
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
      teach(tag(homeTask(purpose(B.letter('016_t_reply', 'Vastus üürileandjale: tunnis algus, kodus lõpp.', 'Tunnis: plaan suuliselt ja kaks esimest lauset. Kodus: kiri lõpuni — mida te enne üleandmist tegite, miks tuhm sein on harilik kulumine, mitte kahju, millega sa ei nõustu ja mida nõuad (summa ja tähtaeg).', 'Lugupeetud üürileandja!', 'Lugupidamisega\n(sinu nimi)', [120, 150]), 'Üürileandja loeb sinu kirja ja otsustab, kui suure osa tagatisrahast ta tagasi maksab.')), { task: 'W13', main: true, harno: 'W1' }),
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
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi enne järgmist tundi ja annab ühe nõu.')), { task: 'S15' }),
      homework('016_t_homework', ['1. Kiri üürileandjale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-017': {
    title: 'Mida kool täpselt kirjutas?',
    phases: grammar('Keel: ma- ja da-tegevusnimi — peab olema kaasas, tuleb tasuda, ei tohi tuua, tasub võtta'),
    format: 'infogap',
    topic: 'family',
    canDo: 'Ma saan kuuldust aru kooli ja lasteaia teadetest ja räägin need pereliikmele lihtsalt edasi; pärast tegusõna ja väljendit valin õige tegevusnime (peab olema, tuleb tasuda, ei tohi tuua).',
    teacherPage: {
      goal: 'Ученик понимает голосовое классного руководителя и объявление детского сада, выбирает ma-/da-инфинитив и объясняет всё бабушке ребёнка (медиация, информационный пробел).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 ответа бабушке; станция 4 — вопросы бабушки и короткое объяснение без договорённости о неделе. Голосовое (станция 2) — дома.',
      hook: '«Ты когда-нибудь получал письмо из школы, садика или учреждения и не понял его до конца? Что ты сделал?» Ответьте сами коротко, потом ученик.',
      plan: [
        '0–10: станция 1 — крючок и разговор: кто в семье читает школьные сообщения, кому ты переводил',
        '10–25: станция 2 — слова (2 мин), прогноз «Что нужно ребёнку на экскурсию?», голосовое классного руководителя дважды, 7 пропусков, «Kas teadsid?» об электронном дневнике',
        '25–37: станция 3 — ma/da: заметить в голосовом → правило → бабушка звонит с вопросами: 7 ответов',
        '37–52: станция 4 — объявление детского сада, вопросы бабушки, объяснить и договориться, кто когда забирает ребёнка',
        '52–64: «Kui aega jääb» — ролевая игра: звонок воспитательнице',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: сообщение бабушке, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Голосовое классного руководителя и объявление детского сада — учебные тексты (ребёнок Пауль / Ева, школа и сад не названы). «Kas teadsid?»: e-päevik — электронные дневники eKool (ekool.eu) и Stuudium (stuudium.com), которыми пользуются школы Эстонии.',
      groups: 'Станция 1 — в парах. Голосовое — каждый сам, сверка в паре. Станция 4: пары «родитель — бабушка», второй получает вашу карточку бабушки; вы слушаете. В 1:1 бабушка — вы.',
      errors: [
        '«Lapsel peab olema kaasas nõusoleku» → «… nõusolek» (у «olema» нет объекта: это подлежащее).',
        '«Tuleb tasuma» → «Tuleb tasuda» (tuleb, on vaja, ei tohi, võib, tasub + da).',
        '«Ma lähen poodi osta» → «Ma lähen poodi ostma» (minema + ma — цель движения).',
        '«Tuleb allkirjastada nõusoleku» → «Tuleb allkirjastada nõusolek» (после «tuleb + da» полный объект в номинативе).',
      ],
      notes: [
        'Формат — информационный пробел: у ученика объявление детского сада, у вас (бабушка) — её неделя, её вопросы и одна проблема. Отвечайте только на вопросы. Ученику без детей: он забирает соседского ребёнка или объясняет объявление школы младшему брату; пенсионеру — роль бабушки меняется местами: он бабушка, вы — родитель.',
        'Обратная связь, 2–3 цели: ma/da после глагола; простые слова для бабушки; проверка «Kas sa said aru?». Во время объяснения не перебивать, 3 замечания в конце.',
      ],
    },
    discover: [
      station(B.text('017_d_hook', 'Kas said kõigest aru?', 'Mõtle viimasele korrale, kui said kooli, lasteaia või mõne ameti teate. Kas said kõigest aru? Mis oli kõige raskem: sõnad, pikad laused või see, mida pärast tegema pidid?'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('017_d_talk', 'Teated meie peres.', 'Vasta ja too näide oma elust.', [
        'Kes teie peres loeb kooli, lasteaia või ametite teateid? Miks just tema?',
        'Kas sa oled kunagi kellelegi eestikeelset teadet tõlkinud või seletanud? Kuidas läks?',
        'Mis on sinu arvates parem: kirjalik teade või õpetaja kõne? Miks?',
      ], [150, 210], ['Tavaliselt pean …', 'Ma tahan …', 'Mul on vaja …']), 'Sinu kogemus näitab, milliseid sõnu ja vorme teadetes vajad.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma kogemusest. Ära paranda; lõpus ütle, kas õpilane kasutas „pean …”, „tahan …” või „on vaja …” õigesti.')),
      station(tag(B.vocab('017_d_vocab', 'Enne kuulamist: sõnad.', ['õpetaja — учитель', 'lasteaed — детский сад', 'nõusolek — согласие', 'tasuma — оплачивать', 'kaasas — с собой', 'haige — больной', 'ei tohi — нельзя', 'teatama — сообщать', 'kool — школа', 'teade — объявление']), { topic: [] }), 2, 15),
      tag(purpose(B.listening('017_d_call', 'Klassijuhataja häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna või arv.', [
        'Õpetaja: Tere! Siin on Pauli klassijuhataja. Helistan õppekäigu pärast, sest kõik vanemad ei ole e-päevikut veel lugenud ja mõni küsimus on mitu korda tulnud.',
        'Õpetaja: Järgmisel neljapäeval sõidab meie klass Tartusse teaduskeskusesse. Buss väljub kooli eest täpselt kell kaheksa, nii et hiljaks jääda ei tohi. Tagasi oleme umbes kell neli, lapsed võivad siis ise koju minna või neile tullakse järele.',
        'Õpetaja: Õppekäik maksab kaksteist eurot. Selle tuleb tasuda esmaspäevaks, arve on e-päevikus.',
        'Õpetaja: Lapsel peab olema kaasas vanema allkirjaga nõusolek, ilma selleta ei saa ta bussi tulla. Nõusoleku leiate samuti e-päevikust, selle võib välja printida või käsitsi kirjutada.',
        'Õpetaja: Lõuna sööme Tartus, aga vett tasub kaasa võtta. Telefoni võib kaasa võtta, aga bussis seda kasutada ei tohi.',
        'Õpetaja: Kui laps jääb haigeks, tuleb sellest hommikul e-päevikus teatada. Haiget last palun õppekäigule ei saata.',
        'Õpetaja: Kui teil on küsimusi, võite mulle e-päevikus kirjutada või homme pärast tunde helistada. Aitäh ja head päeva!',
      ], [
        'Pauli klass sõidab õppekäigule Tartu teaduskeskusesse järgmisel [neljapäeval].',
        'Buss väljub kooli eest täpselt kell [kaheksa|8], nii et hiljaks jääda ei tohi.',
        'Õppekäik maksab iga lapse kohta [kaksteist|12] eurot ja arve on e-päevikus.',
        'Õppekäigu eest tuleb vanematel tasuda hiljemalt [esmaspäevaks].',
        'Bussi pääsemiseks peab lapsel olema kaasas vanema allkirjaga [nõusolek].',
        'Telefoni võib kaasa võtta, aga [bussis] ei tohi lapsed seda kasutada.',
        'Kui laps jääb haigeks, tuleb sellest hommikul teatada [e-päevikus].',
      ]), 'Märkmed näitavad, mida laps peab kaasa võtma ja mida ta ei tohi teha.'), { voice: 'interview', task: 'L04', harno: 'L3' }),
      B.know('017_d_know', ['Eesti koolid suhtlevad vanematega e-päeviku kaudu, näiteks eKoolis või Stuudiumis. Seal näeb lapsevanem hindeid, puudumisi, kodutöid ja kooli teateid ning saab õpetajale kirjutada. Teate saab tavaliselt ka telefoni, aga lugeda tuleb see ikka ise.'], 'e-päevikud eKool ja Stuudium, kasutusjuhendid vanematele', 'Kas teadsid? E-päevik'),
    ],
    practice: [
      station(B.notice('017_p_notice', 'Märka: peab olema või tuleb tasuda?', [
        'Õpetaja häälsõnumist: lapsel **peab** olema kaasas nõusolek · **hiljaks jääda ei tohi** · selle **tuleb tasuda** esmaspäevaks · vett **tasub** kaasa **võtta** · telefoni **võib** kaasa **võtta**',
        '**ma-tegevusnimi** (-ma): **pidama, hakkama, õppima, aitama, käima** ja liikumine eesmärgiga (**minema, tulema, jääma**): Peab **olema**. Lähen **ostma**. Hakkan **lugema**.',
        '**da-tegevusnimi** (-da, -ta, -a): **tahtma, võima, tohtima, saama, oskama, proovima, soovitama, unustama**: Võib **võtta**. Haiget last ei tohi lasteaeda **tuua**.',
        'Väljendid + **da**: **tuleb, on vaja, on keelatud, on lubatud, on parem, tasub**: Haigusest **tuleb teatada**. Vett **tasub võtta**.',
        'Pane tähele (tund 16): **tuleb / on vaja + da** järel on täissihitis nimetavas: **Tuleb allkirjastada nõusolek.** **On vaja tasuda arve.**',
      ], 'full'), 3, 12),
      purpose(B.transformation('017_p_note', 'Vanaema küsib telefonis.', 'Vanaema viib Pauli neljapäeval kooli. Vasta talle õpetaja teate järgi täislausega; kasuta antud sõna.', [
        ['Vanaema: „Kas Paul võib bussi juurde hiljem tulla?” (Õpetaja: hiljaks jääda ei tohi.)', 'ei tohi', 'Ei, ta ei tohi hiljaks jääda.|Ei, hiljaks jääda ei tohi.'],
        ['Vanaema: „Mis paber tal kaasas olema peab?” (Õpetaja: vanema allkirjaga nõusolek.)', 'peab', 'Tal peab olema kaasas vanema allkirjaga nõusolek.|Kaasas peab olema vanema allkirjaga nõusolek.'],
        ['Vanaema: „Kas telefoni tohib kaasa võtta?” (Õpetaja: jah, aga bussis mitte kasutada.)', 'võib', 'Jah, telefoni võib kaasa võtta.|Jah, ta võib telefoni kaasa võtta.'],
        ['Vanaema: „Kui palju ja millal tuleb maksta?” (Õpetaja: 12 eurot esmaspäevaks.)', 'tuleb', 'Esmaspäevaks tuleb maksta kaksteist eurot.|Kaksteist eurot tuleb maksta esmaspäevaks.'],
        ['Vanaema: „Kas talle on vaja süüa kaasa panna?” (Õpetaja: lõuna Tartus, vesi kaasa.)', 'tasub', 'Vett tasub kaasa võtta.|Talle tasub vett kaasa panna.'],
        ['Vanaema: „Kes nõusolekule alla kirjutab?” (Sina: mina, täna õhtul.)', 'pean', 'Mina pean täna õhtul nõusolekule alla kirjutama.|Täna õhtul pean mina nõusolekule alla kirjutama.'],
        ['Vanaema: „Mis siis, kui Paul jääb haigeks?” (Õpetaja: hommikul e-päevikus teatada.)', 'on vaja', 'Siis on vaja hommikul e-päevikus teatada.|Siis on vaja sellest hommikul e-päevikus teatada.'],
      ], 'full', 'g_notice'), 'Vanaema tahab kõike täpselt teada; sinu vastus peab olema lühike ja selge.'),
    ],
    transfer: [
      station(B.text('017_t_note', 'Lasteaia teade', 'Lasteaia teade lapsevanematele:\n\n• Detsembris on lasteaed avatud kella 7.00–18.00. 23.–31. detsembrini töötab ainult üks rühm; kas teie laps tuleb, sellest tuleb lasteaiaõpetajale teatada 10. detsembriks.\n\n• Haiget last (palavik, köha, kõhuvalu) ei tohi lasteaeda tuua.\n\n• Lapsel peavad kaasas olema soojad vahetusriided. Märjad kindad tuleb õhtul koju viia.\n\n• Jõulupidu on 19. detsembril kell 16. Vanemad ja vanavanemad on oodatud.\n\n• Lapse võib koju viia ainult see täiskasvanu, kes on lapsevanema avalduses kirjas.'), 4, 15, { final: 'explain' }),
      tag(purpose(B.table('017_t_mom', 'Vanaema küsib lasteaia kohta.', 'Vasta vanaema küsimustele lasteaia teate järgi lühidalt.', 'Vanaema küsimus, Sinu vastus', [
        '„Kas ma võin Eva ära viia, kui mind ei ole avalduses?” | [ei/ei tohi/ei, ainult avalduses olev täiskasvanu]',
        '„Mis kell lasteaed detsembris kinni läheb?” | [kell 18/18/kell kuus]',
        '„Kas Eva võib köhaga lasteaeda minna?” | [ei/ei tohi/ei, haiget last ei tohi tuua]',
        '„Millal on jõulupidu?” | [19. detsembril/19. detsembril kell 16/kell 16]',
        '„Mida peab Eval lasteaias kaasas olema?” | [soojad vahetusriided/vahetusriided]',
        '„Mis kuupäevaks tuleb teatada, kas Eva käib jõulude vahel lasteaias?” | [10. detsembriks/10. detsembriks lasteaiaõpetajale]',
      ], 'g_read'), 'Vanaema küsib just seda, millest teates aru ei saanud; sina vastad teate järgi.'), { task: 'R07' }),
      teach(tag(purpose(B.rolecards('017_t_talk', 'Seleta vanaemale.', 'Seleta vanaemale lasteaia teade lihtsate sõnadega ja leppige kokku, kes Evat detsembris toob ja viib.',
        'Olukord: vanaema aitab detsembris Evaga, aga ta ei loe eesti keelt hästi.\nSinu eesmärk: vanaema teab, mida ta peab, võib ja ei tohi teha, ning teil on kokku lepitud, kes Evat mis päeval viib.\nPiirang: vanaema plaanidest tead vähe; küsi temalt.',
        'Vanaema kaart on õpetajal: tema nädal, plaanid ja üks mure.',
        ['Teates on kirjas, et sa pead …', 'Sa ei tohi …', 'Sul on vaja …', 'Kas sa said aru, mida …?'], ['Aga ma tahan …', 'Kas ma võin …?', 'Mul ei ole aega …']), 'Tulemus: vanaema nädal Evaga, kus on toomine, viimine ja jõulupidu.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (vanaema; kui õpilasel pole last, siis naaber, kelle lapse ta lasteaiast toob). Ütle ainult seda, mida küsitakse. Varjatud info: sa ei ole avalduses kirjas; teisipäeviti töötad kella 17-ni; tahad 23. detsembril Eva enda juurde maale viia; Eval on praegu natuke köha. Takistused ükshaaval: 1) „Ma lähen ise Evale järele, mis siis?” 2) „Köha on väike, see ei ole ju haigus!” 3) „Teisipäeval ma kella kuueks ei jõua.” Õnnestunud, kui õpilane küsib vähemalt kolm küsimust, kasutab vähemalt neli tegevusnime õigesti (pead olema, ei tohi tuua, tuleb teatada …), pakub lahenduse (vanaema avaldusse, teisipäev ise) ja kontrollib, kas vanaema sai aru.'),
      extension(teach(tag(purpose(B.rolecards('017_t_more', 'Rollimäng: helista lasteaiaõpetajale', 'Helista lasteaiaõpetajale ja lepi kokku, mida teha.',
        'Olukord: Eva on hommikul palavikus, aga täna on lasteaia jõulupidu.\nSinu eesmärk: teatada, et Eva ei tule, ja saada teada, mida ta peost ilma jääb.\nPiirang: sa ei tea, kas pidu filmitakse.',
        'Lasteaiaõpetaja kaart on õpetajal: tema küsimused ja üks pakkumine.',
        ['Mul on vaja teatada, et …', 'Kas Eva võib …?', 'Mida ma pean tegema, et …?'], ['Kas tal on palavik?', 'Ta peab …', 'Tuleb …']), 'Telefonis pead ise küsima, sest õpetaja ei näe last.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled lasteaiaõpetaja. Küsi: mis Eval on, kaua ta kodus on, kas ta võtab ravimit. Pakkumine: pildid peost saadetakse e-päevikusse; kingituse võib hiljem ära viia. Õnnestunud, kui õpilane teatab puudumisest viisakalt, küsib kaks küsimust ja võtab kokku, mida ta peab tegema („Ma pean …, tuleb …”).'), 12),
      tag(exitCheck(purpose(B.gaps('017_t_exit', 'Kontrolli end: kolm tegevusnime.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Detsembris hakkab vanaema Evat teisipäeviti lasteaiast koju [tooma]. (tooma)',
        'Kui Eval on köha, võib vanaema temaga päeva kodus [olla]. (olema)',
        'Enne jõulupidu tasub Evale väike kingitus valmis [teha]. (tegema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas ma- ja da-tegevusnimi on käes.')), {}),
      purpose(B.selfcheck('017_t_self', ['Ma räägin, kes meie peres teateid loeb ja seletab.', 'Ma panen häälsõnumist kirja, mida tuleb teha ja mida ei tohi.', 'Ma valin pärast tegusõna ma- või da-tegevusnime (peab olema, ei tohi tuua).', 'Ma seletan pereliikmele kooli või lasteaia teate lihtsalt edasi.'], 'Teade selge', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('017_t_msg', 'Kodus: sõnum vanaemale.', 'Kirjuta kodus 120–150 sõna: lasteaia teade sinu enda sõnadega, nii et vanaema saab aru. Kasuta vorme pead, ei tohi ja tuleb.', 'Kallis vanaema!', 'Kallistan\n(sinu nimi)', [120, 150]), 'Vanaema loeb sinu sõnumit ja teab, mida ta detsembris teeb.')), { task: 'W12', level: 3 }),
      tag(homeTask(purpose(B.speaking('017_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa lapsena koolis pidid tegema ja mida ei tohtinud.', [
        'Mida pidid sa koolis alati kaasas kandma või tegema?',
        'Mida ei tohtinud koolis teha ja kas see reegel oli õige?',
      ], [60, 120]), 'Õpetaja kuulab sinu loo ja ütleb, kas tegevusnimed on õiged.')), { task: 'S15' }),
      homework('017_t_homework', ['1. Sõnum vanaemale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
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
      teach(tag(purpose(B.table('018_d_game', 'Mäng: arva hobi ära.', 'Kirjuta oma küsimused ja õpetaja vastused. Siis vahetate rollid ja lõpuks räägid oma päris hobist.', 'Minu küsimus, Jah / ei', [
        'Kas sa tegeled sellega õues? | ',
        'Kas see sõltub ilmast? | ',
        'Kas selleks on vaja teisi inimesi? | ',
        'Kas sa osaled selles hobis võistlustel? | ',
        'Minu küsimus: … | ',
        'Minu küsimus: … | ',
      ]), 'Mäng näitab, kui palju sa juba ütled õige käändega.'), { task: 'S01', fluency: true }),
      'Mõtle välja hobi (näiteks koorilaul, kalapüük, kudumine). Vasta ainult „jah” või „ei”. Punkt läheb küsijale iga õige rektsiooni eest (Kas sa tegeled sellega …? Kas see sõltub ilmast?). Pärast kahte vooru räägi 2–3 minutit oma päris hobist ja küsi õpilase oma kohta: „Millega sa vabal ajal kõige meelsamini tegeled? Mis sind selle juures huvitab?”'),
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
      // a group chat of five neighbours: a text with names (B.dialogue shows two speakers only)
      station(B.text('018_t_chat', 'Naabrite vestlus: kes otsib seltsi?', '**Rita:** Tere, naabrid! Meie koor otsib uusi lauljaid, eriti mehi. Harjutame neljapäeviti raamatukogus. Kas keegi tunneb huvi koorilaulu vastu?\n\n**Oleg:** Laulsin koolis kooris, aga nooti ei oska. Kas see on probleem?\n\n**Rita:** Üldse mitte. Peaasi, et osaled proovides regulaarselt.\n\n**Kaia:** Kas keegi tegeleb kudumisega? Tahaksin õppida sokke kuduma, aga üksi ei viitsi.\n\n**Aivar:** Laupäeval kogume poodides toiduabi peredele, kellel on raske. Kaks tundi, kogemust pole vaja. Aitan seal juba kolm aastat ja olen selle üle uhke.\n\n**Liina:** Olen ekraanidest väsinud. Kas keegi käib metsas matkamas? Sõltub ilmast, aga pühapäeviti oleks tore.\n\n**Oleg:** Liina, mina tulen! Olen rahul iga jalutuskäiguga.'), 4, 15, { final: 'present' }),
      tag(purpose(B.table('018_t_match', 'Pere küsib.', 'Vasta vestluse põhjal 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Sinu ema: „Mis päeval koor harjutab?” | [neljapäeviti/neljapäeval]',
        'Sinu vend: „Kas koori minekuks peab oskama noote lugeda?” | [ei/ei pea]',
        'Sinu sõbranna: „Mida tahab Kaia õppida?” | [sokke kuduma/kuduma/kudumist]',
        'Sinu poeg: „Kas toiduabi kogumiseks on vaja kogemust?” | [ei/ei ole/ei ole vaja]',
        'Sinu naaber: „Kui kaua Aivar on seal juba aidanud?” | [kolm aastat/3 aastat]',
        'Sinu kolleeg: „Millal tahaks Liina metsa matkama minna?” | [pühapäeviti/pühapäeval]',
      ], 'g_read'), 'Sinu pere küsib, kas mõni pakkumine sobib ka neile; sina vastad faktiga.'), { task: 'R11' }),
      inLesson(teach(tag(purpose(B.speaking('018_t_intro', 'Tutvusta end korraldajale.', 'Vali vestlusest üks pakkumine ja räägi selle korraldajale 2–3 minutit: kes sa oled, millega tegeled, mille vastu tunned huvi ja milles tahaksid osaleda. Siis vasta tema kahele küsimusele.', [
        'Kes sa oled ja millega sa vabal ajal tegeled?',
        'Mille vastu sa tunned huvi ja miks just see pakkumine?',
        'Milles sa oled varem osalenud ja mille üle oled uhke?',
        'Millega oled harjunud ja millega oled oma vabas ajas rahul?',
      ], [180, 240], ['Ma tegelen …', 'Olen huvitatud …-st', 'Olen harjunud …-ga', 'Olen uhke … üle']), 'Tulemus: korraldaja teab, kes sa oled, ja kutsub sind esimesele kohtumisele.'), { task: 'S16', main: true, level: 4, harno: 'S1' }),
      'Õpetaja on korraldaja (Rita, Aivar või Liina). Kuula segamata, siis küsi kaks küsimust: 1) „Millega sa saaksid meid aidata peale selle?” 2) „Kas sa saad tulla ka siis, kui …?” (aeg, mis õpilasele ei sobi). Mäng: iga õige rektsioon on punkt; loe punktid kokku ja ütle lõpus. Õnnestunud, kui tutvustuses on vähemalt neli rektsiooni, neist vähemalt kaks omadussõnaga (uhke, rahul, huvitatud, harjunud), ja õpilane vastab mõlemale küsimusele.')),
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
      purpose(B.selfcheck('018_t_self', ['Ma räägin oma hobist ja küsin teise hobi kohta.', 'Ma saan raadiost ja naabrite vestlusest aru, kes mida soovitab, otsib ja pakub.', 'Ma kasutan rektsiooni ka omadussõnadega: huvitatud millest, harjunud millega, uhke mille üle.', 'Ma tutvustan end korraldajale 2–3 minutiga.'], 'Mäng mängitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('018_t_mail', 'Kodus: kiri korraldajale.', 'Kirjuta kodus 120–150 sõna: kes sa oled, millest oled huvitatud, milles oled varem osalenud, millega oled harjunud ja üks küsimus.', 'Tere!', 'Parimate soovidega\n(sinu nimi)', [120, 150]), 'Korraldaja vastab ja kutsub sind esimesele kohtumisele.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('018_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mille vastu sa tunned huvi ja millega tahaksid järgmisel aastal tegeleda.', [
        'Mille vastu sa tunned huvi?',
        'Millega tahaksid järgmisel aastal tegeleda ja miks?',
      ], [60, 120]), 'Õpetaja kuulab sinu sõnumi ja ütleb, kas rektsioonid on õiged.')), { task: 'S15' }),
      homework('018_t_homework', ['1. Kiri korraldajale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-019': {
    title: 'Rong jäi ära — mida teha esimese tunni jooksul?',
    phases: grammar('Keel: kõik koos — sihitis, ma-/da-tegevusnimi ja rektsioon (Tuleb esitada kaebus. Pean tšekid alles hoidma. Pöördun vedaja poole.)'),
    format: 'project',
    topic: 'town',
    canDo: 'Ma kirjutan endale plaani, mida teha, kui rong või buss jääb ära või hilineb, ja räägin selle lähedasele; ühes lauses on sihitis, tegevusnimi ja rektsioon õiged (Pean vedajale kohe kaebuse esitama).',
    teacherPage: {
      goal: 'Ученик делает свой «план Б» на случай отменённого или опоздавшего поезда (права пассажира ЕС), применяя объект, ma/da-инфинитив и управление, и объясняет его близкому человеку.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 3 — правило и 4 ситуации; станция 4 — свой план устно, без договорённости с близким. Голосовые сообщения (станция 2) — дома.',
      hook: '«Твой поезд или автобус в другой город отменили. Что делаешь первым: звонишь, ищешь другой транспорт, пишешь перевозчику или ждёшь? Голосуем — и одна причина!» Голосуйте оба, вы — с короткой причиной.',
      plan: [
        '0–10: станция 1 — голосование и разговор «Твоя поездка, которая сорвалась»',
        '10–25: станция 2 — слова (2 мин), прогноз «Что положено пассажиру?», четыре голосовых сообщения дважды, 8 вопросов, три карточки «первый шаг», «Kas teadsid?» о правах пассажира поезда',
        '25–37: станция 3 — всё вместе: заметить в сообщениях → три вопроса (Mida? Kellele? Mida teha?) → 7 ситуаций: верный шаг и верная фраза',
        '37–52: станция 4 — свой план Б по карточкам станции 2, объяснить его бабушке, которая впервые едет поездом за границу',
        '52–64: «Kui aega jääb» — игра «Üks probleem, kaks sammu»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: инструкция близкому, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?» и карточки: Your Europe (Euroopa Liit), «Rongireisijate õigused» — более 60 минут опоздания: возврат денег или другой маршрут; компенсация 25 % (1–2 часа) и 50 % (2 часа и больше); еда, напитки и при необходимости гостиница; жалоба перевозчику в течение трёх месяцев, ответ в течение месяца; страна может сделать исключения для внутренних линий, но не для международных поездов. Надзор в Эстонии — Tarbijakaitse ja Tehnilise Järelevalve Amet. Голосовые сообщения — учебные.',
      groups: 'Голосование — все сразу. Сообщения — каждый сам, сверка в паре. План Б — каждый свой; объясняют друг другу в паре, второй играет бабушку с вашей карточкой. В 1:1 бабушка — вы.',
      errors: [
        '«Tuleb esitada kaebuse» → «Tuleb esitada kaebus» (после «tuleb + da» полный объект — номинатив).',
        '«Pean tšekid alles hoida» → «Pean tšekid alles hoidma» (pidama + ma).',
        '«Pöördun vedaja» → «Pöördun vedaja poole» (pöörduma kelle poole).',
        '«Vabandan hilinemist» → «Vabandan hilinemise pärast» (vabandama mille pärast).',
      ],
      notes: [
        'Формат — мини-проект: продукт — карточка «Minu plaan B», которую ученик забирает (фото в телефон, копия семье). Пенсионеру — план для себя; маме — поездка с ребёнком; студенту — автобус домой на выходные; уставшему после смены — три строки, не больше.',
        'Факты о правах пассажира даны по правилам ЕС для поездов; для автобусов и самолётов правила свои — не обещайте ученику точных сумм, пусть проверит условия перевозчика.',
        'Обратная связь, 2–3 цели: три формы в одном предложении («Pean vedajale kohe kaebuse esitama»); подсказка вопросом («Mida? Kellele? Kelle poole?»); в объяснении близкому не перебивать.',
      ],
    },
    discover: [
      station(B.text('019_d_hook', 'Hääleta kohe!', 'Sinu rong või buss teise linna jäi ära. Mida teed esimesena: helistad koju, otsid teist bussi, kirjutad vedajale või ootad jaamas? Vali üks ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('019_d_talk', 'Reis, mis läks teisiti.', 'Vasta ja too näide oma elust.', [
        'Kas sinu reis on kunagi ära jäänud või hilinenud? Mis juhtus ja milline mälestus sellest jäi?',
        'Kas said raha tagasi või abi? Kelle poole sa pöördusid?',
        'Kumb on sinu arvates parem otsus: oodata või kohe ise uus lahendus leida? Miks?',
      ], [150, 210], ['Ma pidin …', 'Ma pöördusin … poole', 'Kõigepealt …']), 'Sinu lugu näitab, mida sa juba tead ja mis sinu plaanist veel puudub.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu. Ära paranda; lõpus ütle, mida õpilane tegi oma loos kõige targemini.')),
      station(tag(B.vocab('019_d_vocab', 'Enne kuulamist: sõnad.', ['hilinema — опаздывать', 'ära jääma — отменяться', 'hüvitis — компенсация', 'pilet — билет', 'vedaja — перевозчик', 'reisija — пассажир', 'majutus — проживание', 'tšekk — чек', 'kaebus — жалоба', 'pöörduma — обращаться']), { topic: ['vedaja'] }), 2, 15),
      tag(purpose(B.examListen('019_d_voice', 'Neli häälsõnumit.', 'Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Ema: Tere, kallis! Isa rong Riiga jäi täna ära. Vedaja pani asemele bussi, aga see väljub alles kahe tunni pärast. Isa küsis, kas ta peab uue pileti ostma. Ei pea! Jaamas öeldi, et sama piletiga saab bussiga edasi sõita.',
        'Sõber: Tere! Mu rong jõudis Riiga kaks ja pool tundi hiljem. Lugesin, et hilinemise korral saab osa pileti hinnast tagasi. Kirjutasin vedajale juba kaebuse ja panin juurde pileti pildi. Vastus peaks tulema ühe kuu jooksul.',
        'Naaber: Tere, siin naaber! Meie öörong jäi ära ja pidime jaama lähedal hotellis ööbima. Vedaja maksis hotelli ja õhtusöögi eest, aga tšekid tuli alles hoida. Kas sa saaksid homme hommikul meie kassi eest hoolitseda? Varuvõti on ju sinu käes.',
        'Üliõpilane: Tere, siin Mihkel! Mu buss jäi ära ja ma jäin eksamile hiljaks. Õppejõud ütles, et pean talle e-kirja kirjutama ja selgitama, mis juhtus. Hea, et tegin piletist ja jaama teatest pildi, nüüd on mul tõend olemas! Õpetaja oli õnneks mõistev.',
      ], [
        ['Mida pani vedaja ärajäänud rongi asemele, et isa saaks Riiga sõita?', 'asendusbussi', 'järgmise päeva rongi', 'tasuta takso'],
        ['Kas isa peab asendusbussi jaoks uue pileti ostma?', 'ei, sama piletiga saab edasi sõita', 'jah, bussijuhi käest', 'jah, jaama kassast'],
        ['Kui palju hiljem jõudis sõbra rong lõpuks Riiga?', 'kaks ja pool tundi', 'pool tundi', 'täpselt ühe tunni'],
        ['Mida pani sõber vedajale saadetud kaebusele juurde?', 'pileti pildi', 'hotelli tšeki', 'jaama teate'],
        ['Mille eest maksis vedaja naabri perele pärast öörongi ärajäämist?', 'hotelli ja õhtusöögi eest', 'ainult pileti eest', 'takso eest koju'],
        ['Mida pidid naabrid hotelli ja söögi eest raha saamiseks alles hoidma?', 'tšekid', 'piletid', 'hotelli võtmed'],
        ['Mida palub naaber sinult homme hommikul teha, sest varuvõti on sinu käes?', 'kassi eest hoolitseda', 'neile jaama vastu tulla', 'hotelli helistada'],
        ['Mida peab üliõpilane pärast ärajäänud bussi õppejõu jaoks tegema?', 'kirjutama e-kirja ja selgitama, mis juhtus', 'tooma arsti tõendi', 'tulema järgmisel päeval uuesti'],
      ]), 'Vastused näitavad, mida inimesed esimesena tegid; see on sinu plaani alus.'), { task: 'L07', harno: 'L2' }),
      tag(purpose(B.profiles('019_d_cards', 'Kolm kaarti: mis on esimene samm?', 'Loe kaarte ja tõmba iga kaardi juures alla kõige tähtsam samm.', [
        ['Jaamas', ['Lase teenindajal kinnitada, kas sama pilet kehtib asendusbussis või järgmises rongis.', 'Tee pilt teatest või tablool olevast ajast.', 'Pika ootamise korral küsi süüa ja juua.'], []],
        ['Pärast reisi', ['Kirjuta vedajale kaebus kolme kuu jooksul.', 'Lisa pilet, kellaajad ja tšekid.', 'Vedaja peaks vastama ühe kuu jooksul.'], []],
        ['Kui vastust ei tule', ['Pöördu Tarbijakaitse ja Tehnilise Järelevalve Ameti poole.', 'Hoia kõik kirjad ja tšekid alles.', 'Kontrolli vedaja tingimusi: siseliinidel võivad reeglid olla teised.'], []],
      ], '3'), 'Kaardid näitavad, mida tehakse kõigepealt; sinu plaan tugineb neile.'), { task: 'R01' }),
      B.know('019_d_know', ['Euroopa Liidus on rongireisijal õigused. Kui jõuad sihtkohta üle 60 minuti hiljem, võid valida raha tagasi või edasisõidu teise ühendusega. Hilinemise eest on hüvitis: tund kuni kaks 25 % ja kaks tundi või rohkem 50 % pileti hinnast. Pika ootamise ajal peab vedaja pakkuma süüa ja juua, vajadusel ka majutust. Riik võib siseliinidele teha erandeid, rahvusvahelistele rongidele mitte.'], 'Euroopa Liit, Your Europe, „Rongireisijate õigused”', 'Kas teadsid? Rongireisija õigused'),
    ],
    practice: [
      station(B.notice('019_p_notice', 'Märka: mida, kellele, mida teha?', [
        'Sõnumitest: vedaja **pani** asemele **bussi** · isa küsis, kas ta **peab** uue **pileti ostma** · **kirjutasin** vedajale **kaebuse** · tšekid **tuli** alles **hoida** · **kassi eest hoolitseda**',
        '1) **Sihitis** (tund 16): töö jõuab lõpuni — **kirjutasin kaebuse**; eitus — **ei osta piletit**; **tuleb + da** — **tuleb esitada kaebus**',
        '2) **Tegevusnimi** (tund 17): **pean, lähen, hakkan** + **-ma** · **tuleb, võib, tasub, on vaja** + **-da**',
        '3) **Rektsioon** (tund 18): **pöörduma kelle poole** · **teatama kellele millest** · **hoolitsema kelle eest** · **vabandama mille pärast** · omadussõnad: **tänulik mille eest**, **rahul millega**',
        'Üks lause, kolm otsust: **Pean** kohe **vedajale kaebuse esitama** ja **tšekid alles hoidma.**',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.choice('019_p_steps', 'Õige samm, õige lause.', 'Vali iga olukorra juurde lause, mis on sisult ja vormilt õige.', [
        ['Rong jäi ära ja jaamas pakutakse asendusbussi. Mida küsid?', 'Kas sama pilet kehtib ka bussis?', 'Kas sama piletit kehtib ka bussis?', 'Kas pean bussis uut piletit ostma, kuigi kõik tasuta sõidavad?'],
        ['Jõudsid sihtkohta kaks tundi hiljem. Mis on järgmine samm?', 'Tuleb vedajale kaebus esitada.', 'Tuleb vedajale kaebuse esitada.', 'Tuleb vedajale kaebus esitama.'],
        ['Vedaja ei vasta kuu aega. Kelle poole pöördud?', 'Pöördun tarbijakaitse poole.', 'Pöördun tarbijakaitsele.', 'Pöördun tarbijakaitsest.'],
        ['Ootad jaamas juba kolm tundi. Mida küsid teenindajalt?', 'Kas reisijatele pakutakse süüa ja juua?', 'Kas reisijaid pakutakse süüa ja juua?', 'Kas reisijatele pakutakse sööma ja jooma?'],
        ['Pead vedaja kulul hotellis ööbima. Mida teed tšekkidega?', 'Hoian tšekid alles, et kulud tagasi nõuda.', 'Viskan tšekid ära, sest vedaja maksab niikuinii.', 'Annan tšekid kohe hotelli tagasi.'],
        ['Jäid ärajäänud bussi tõttu tööle hiljaks. Mida kirjutad juhile?', 'Vabandan hilinemise pärast ja selgitan, mis juhtus.', 'Vabandan hilinemist ja selgitan, mis juhtus.', 'Vabandan hilinemisega ja selgitan, mis juhtus.'],
        ['Naaber hoidis sinu varuvõtit ja toitis kassi. Mida ütled?', 'Olen sulle abi eest väga tänulik.', 'Olen sulle abiga väga tänulik.', 'Olen sinu abist väga tänulik.'],
      ], 'full', 'g_notice'), 'Hädas pole aega mõelda; õige samm ja õige lause peavad tulema kohe.'), { task: 'G02' }),
      'Pärast iga vastust küsi: „Miks teised kaks ei sobi?” Üks on vale sisult, teine vormilt (sihitis, tegevusnimi või rektsioon). Õpilane leiab reegli ise.'),
    ],
    transfer: [
      station(tag(purpose(B.planning('019_t_plan', 'Minu plaan B.', 'Täida oma plaan: kolm esimest sammu ja kellele teatad. Kasuta vorme pean …, tuleb …, pöördun … poole.', [
        'Kui reis jääb ära: mida pean jaamas kohe tegema ja keda teavitan?',
        'Mida tuleb alles hoida ja millest pilti teha?',
        'Kelle poole pöördun, kui vedaja ei vasta, ja kes hoolitseb kodus minu asjade eest?',
        'Minu kontaktid: vedaja klienditeenindus, majutus, keegi kodus.',
      ], 3), 'Plaan jääb sulle: tee sellest pilt ja saada see ka oma perele.'), { task: 'W11', level: 3 }), 4, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('019_t_explain', 'Seleta plaan vanaemale.', 'Seleta oma plaan vanaemale, kes sõidab esimest korda rongiga välismaale, ja leppige kokku, kes kelle eest hoolitseb.',
        'Olukord: sinu vanaema sõidab järgmisel nädalal rongiga Riiga ega ole kunagi üksi välismaal reisinud.\nSinu eesmärk: ta teab kolme esimest sammu, kui rong jääb ära, ja te olete kokku leppinud, kes temaga sel päeval ühendust hoiab.\nPiirang: tal on paberpilet ja vana mobiil ilma internetita.',
        'Vanaema kaart on õpetajal: tema küsimused ja üks mure.',
        ['Kõigepealt pead …', 'Sul tuleb …', 'Pöördu … poole.', 'Kes hoolitseb … eest?', 'Kas oled sellega rahul?'], ['Aga kui …?', 'Miks ma pean …?', 'Ma ei saa …']), 'Tulemus: vanaema teab sinu plaani ja oskab seda ise kasutada.'), { task: 'S03', main: true, level: 4 }),
      'Õpetaja kaart (vanaema; kui õpilasel pole vanaema, siis naaber või ema). Ütle ainult seda, mida küsitakse. Varjatud info: sa ei loe eesti ega läti keelt; sul on kohver ja haige põlv; sa ei taha kellelegi tüli teha ega küsida. Takistused ükshaaval: 1) „Ma lihtsalt ootan jaamas, küll keegi aitab.” 2) „Mobiilis mul internetti ei ole.” 3) „Kas ma pean siis ise ka kaebuse kirjutama?” Õnnestunud, kui õpilane seletab kolm sammu, kasutab sihitist, tegevusnime ja rektsiooni õigesti vähemalt neljas lauses ja te lepite kokku, kes vanaemaga sel päeval ühendust hoiab.'),
      extension(teach(tag(purpose(B.speaking('019_t_more', 'Mäng: üks probleem, kaks sammu', 'Õpetaja ütleb ühe probleemi. Sul on 30 sekundit: millised on kaks esimest sammu?', [
        'Öörong jäi ära. Asendusbuss on täis. Kohver jäi rongi peale.',
        'Kasuta vorme: pean …, tuleb …, pöördun … poole.',
      ], [120, 180], ['Kõigepealt pean …', 'Siis tuleb …', 'Ma pöördun … poole']), 'Kiire mäng harjutab kolme vormi korraga ilma ettevalmistuseta.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (10–12 min). Probleemid: öörong jäi ära; asendusbuss on täis; kohver jäi rongi peale; ühendus läks kaotsi, sest esimene rong hilines; lennuk hilineb kolm tundi; laps jäi teel haigeks. Iga õige vorm (sihitis, tegevusnimi, rektsioon) on punkt. Pärast kuut probleemi vahetage rollid.'), 12),
      tag(exitCheck(purpose(B.gaps('019_t_exit', 'Kontrolli end: kolm otsust.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Rongi hilinemise järel kirjutasin vedajale samal õhtul [kaebuse]. (kaebus)',
        'Hotellis ööbides pean ma kõik tšekid hoolikalt alles [hoidma]. (hoidma)',
        'Olen vedaja kiire [vastusega] väga rahul: raha tuli nädalaga. (vastus)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas sihitis, tegevusnimi ja rektsioon töötavad koos.')), {}),
      purpose(B.selfcheck('019_t_self', ['Ma räägin reisist, mis läks teisiti, ja mida ma tegin.', 'Ma saan sõnumitest aru, mis on esimene samm.', 'Ma kasutan ühes lauses sihitist, tegevusnime ja rektsiooni.', 'Ma koostan oma plaani B ja seletan selle lähedasele.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('019_t_guide', 'Kodus: juhend lähedasele.', 'Kirjuta kodus 120–150 sõna: mida teha, kui rong või buss jääb ära või hilineb. Kasuta vorme pead, tuleb ja pöördu … poole.', [10, 14], ['pead', 'tuleb', 'poole'], 3, 'g_use'), 'Lähedane hoiab juhendit alles ja teab reisil, mida teha.')), { task: 'W05', level: 3 }),
      tag(homeTask(purpose(B.speaking('019_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu kolm esimest sammu, kui reis jääb ära.', [
        'Mida pead kõigepealt tegema?',
        'Kelle poole pöördud ja mida hoiad alles?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja annab ühe nõu.')), { task: 'S15' }),
      homework('019_t_homework', ['1. Juhend lähedasele, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-020': {
    title: 'Vahehindamine 1 — tunnid 1–20',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Vahehindamine, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Vahehindamine, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Vahehindamine, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    // v4: the exam sheets are timed by their Harno part headers (timeEstimate.js harnoTimedMinutes, §7.3), not by the
    // block estimate
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid elu teemadel (lepingud ja teated, üürimine, huviring, reisimine), kirjutan umbes 140-sõnalise kaebuse ja 180-sõnalise arutluse ning räägin 1 minuti oma lahendatud murest; sihitis, tegevusnimi ja rektsioon on õiged.',
    // Vahehindamine 1 in Harno B2 form (owner 2026-11-17, round 2): two 90-minute lessons — reading (Avasta, 45 min) and
    // listening + the module's language part (Harjuta, 45 min); writing (60 min) and speaking with the module product
    // (Kasuta, 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same
    // task types (R1, R2a, R3, R4; L3 notes, L4; W1, W2b; S1, S2). Content: module 4 (object, ma- / da-infinitive, verb and
    // adjective government) inside real tasks: small print, the deposit letter, the choir, the train notice, the tenant adviser,
    // the rail complaint; module 3 woven in (the bank's phone-scam warning).
    discover: [
      B.tip('020_d_how', 'Vahehindamine: lugemine (eksami vormis, 45 minutit)', 'Vahehindamine kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      B.vocab('020_d_vocab', 'Tunnid 16–19: sõnad, mis aitavad', ['leping — договор', 'pilet — билет', 'hüvitis — компенсация', 'nõusolek — согласие', 'teade — объявление', 'hobi — хобби', 'vabatahtlik — доброволец', 'kaotama — терять', 'teatama — сообщать', 'pöörduma — обращаться'], '2'),
      PART('020_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Vahehindamise eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('020_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit. Vasta kahele küsimusele, siis lahenda osad 1 ja 2.', 'Miks me ei loe peenikest kirja?', [
        '(A) Enamik meist on kirjutanud alla lepingule, mida ta lõpuni ei lugenud. Üürileping, panga tingimused, rongipileti reeglid, kooli teade — kõik on pikad ja tunduvad igavad. Me loeme pealkirja, otsime üles hinna ja vajutame nuppu „nõustun”. Minu arvates ei ole see laiskus, vaid harjumus, mille oleme endale ise kasvatanud. Selle harjumuse eest maksame aga tihti rohkem, kui arvame: kas raha, aja või närvidega.',
        '(B) Esimene põhjus on tekstide pikkus. Paljud tingimused on kirjutatud juristidelt juristidele ja tavaline inimene ei saa neist kiiresti aru. Kui tekst on keeruline, loobume ja usaldame teist poolt. Enamasti läheb kõik hästi, aga probleemi korral selgub, et kõik oli kirjas. Lihtsalt meie ei lugenud seda ja nüüd ei saa enam midagi muuta. Teine pool ei ole meid petnud, ta on lihtsalt kirjutanud reeglid, mida me ei vaevunud läbi lugema. Allkiri tähendab, et oleme kõigega nõus, ka sellega, mida me ei lugenud.',
        '(C) Teine põhjus on keel. Kes alles õpib eesti keelt, sellele on ametlik tekst kaks korda raskem. Pikad laused, võõrad sõnad ja lühendid väsitavad juba esimesel leheküljel. Paljud kasutavad tõlkeprogrammi, mis tõlgib küll sõnad, kuid mitte alati tähendust. „Tuleb tasuda” ja „võib tasuda” erinevad vaid ühe sõna poolest, ometi on üks kohustus ja teine võimalus. Seepärast tasub just tegusõnu lugeda eriti tähelepanelikult. Sama kehtib eituse kohta: „ei ole vaja” ja „ei tohi” kõlavad sarnaselt, kuid tähendavad hoopis eri asju. Üks lubab sul midagi tegemata jätta, teine keelab selle.',
        '(D) Kolmas põhjus on kiirus. Teade tuleb telefoni, kui oleme bussis või poe järjekorras, ja me loeme sellest ainult kaks esimest rida. Kooli teatest jääb meelde kuupäev, aga mitte see, et lapsel peab olema kaasas nõusolek. Lasteaia teatest jääb meelde jõulupidu, aga mitte see, et haiget last ei tohi tuua. Hiljem imestame, miks keegi meile midagi ei öelnud. Tegelikult öeldi, aga me ei jõudnud lugemisega lõpuni. Tähtsad teated tasub seepärast avada alles siis, kui on paar rahulikku minutit, mitte poolel teel bussist välja.',
        '(E) Mida siis teha? Kõigepealt tasub igast tähtsast tekstist üles otsida kolm asja: mida pean tegema, mida ei tohi teha ja mis kuupäevaks. Need peituvad tavaliselt sõnades „peab”, „tuleb” ja „ei tohi” ning kuupäevades. Teiseks tasub julgelt küsida. Üürileandja, vedaja ja kool peavad oma tingimusi selgitama ning üks küsimus on palju odavam kui hilisem vaidlus.',
        '(F) Kolmandaks tasub alles hoida kõik, mis on paberil või ekraanil: lepingud, piletid, tšekid ja kirjad. Kui midagi läheb valesti, ei sõltu tulemus sellest, kes räägib valjemini, vaid sellest, kellel on tõend. Paljud on sellele lihtsale harjumusele hiljem väga tänulikud, sest üks foto või paberileht võib säästa sadu eurosid. Telefonis on selleks eraldi kaust kõige lihtsam lahendus: pilet, tšekk ja leping on alati käepärast ka siis, kui oled teel.',
        '(G) Mõni ütleb, et kõike ei jõua lugeda ja elu on selleks liiga lühike. Ma olen sellega osaliselt nõus. Kõike ei peagi lugema. Minu järeldus on lihtne. Kuid need tekstid, mis puudutavad sinu raha, sinu kodu ja sinu last, tasub lugeda rahulikult ja lõpuni, vajaduse korral ka sõnaraamatuga. Ülejäänud elu jaoks jääb siis aega küllalt ja ebameeldivaid üllatusi tuleb palju vähem. Ja kui midagi jääb segaseks, on alati õigus küsida, mida tekst täpselt tähendab, enne kui sellele oma nime alla kirjutad. Siis ei pea sa hiljem oma allkirja kahetsema.',
        'Allikas: autori arvamus.',
      ].join('\n\n'), [['Millised kolm asja tasub autori sõnul igast tähtsast tekstist üles otsida?', 'mida pean tegema, mida ei tohi teha ja mis kuupäevaks|kohustused, keelud ja tähtajad'], ['Millise teksti oled sina viimati lugemata alla kirjutanud? Mis juhtus?']]),
      tag(B.choice('020_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida teeb artikli alguse järgi enamik inimesi pika lepinguga?', 'Loeb pealkirja ja hinna ning nõustub.', 'Loeb selle kaks korda läbi.', 'Annab selle juristile lugeda.', 'Ei kirjuta sellele kunagi alla.'],
        ['Miks loobuvad paljud autori sõnul tingimuste lugemisest?', 'Tekst on keeruline ja kirjutatud juristidele.', 'Tingimused on alati inglise keeles.', 'Teine pool keelab neid lugeda.', 'Tingimusi ei ole kuskil näha.'],
        ['Mida tahab autor öelda näitega „tuleb tasuda” ja „võib tasuda”?', 'Üks sõna võib muuta kohustuse võimaluseks.', 'Tõlkeprogrammid tõlgivad alati õigesti.', 'Tasumine on alati kohustuslik.', 'Tegusõnu ei ole vaja lugeda.'],
        ['Mis jääb kiirel lugemisel kooli teatest sageli tähele panemata?', 'et lapsel peab olema kaasas nõusolek', 'õppekäigu kuupäev', 'kooli nimi', 'õpetaja telefoninumber'],
        ['Mida autor oma lugejatele EI soovita?', 'lasta tõlkeprogrammil kõik tekstid ära lugeda', 'otsida üles kohustused, keelud ja kuupäevad', 'küsida tingimuste kohta', 'hoida alles lepingud ja tšekid'],
        ['Mida tahab autor artikliga lugejale kõige rohkem öelda?', 'Raha, kodu ja last puudutavad tekstid tasub lugeda lõpuni.', 'Kõik tekstid tuleb alati lõpuni lugeda.', 'Lepinguid ei tohi kunagi allkirjastada.', 'Ametlikest tekstidest ei saa keeleõppija aru.'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('020_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Lugemata jäetud tingimused võivad minna kalliks. | [A]',
        '2. Probleemi korral selgub, et kõik oli tegelikult kirjas. | [B]',
        '3. Tõlkeprogramm ei anna alati edasi tähendust. | [C]',
        '4. Telefonist loetakse teatest sageli ainult algus. | [D]',
        '5. Kohustused ja keelud peituvad sageli tegusõnades. | [E]',
        '6. Vaidluses aitab rohkem tõend kui vali hääl. | [F]',
        '7. Küsimine maksab vähem kui hilisem vaidlus. | [E]',
        '8. Kõiki tekste ei pea lõpuni lugema. | [G]',
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
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('020_p_how', 'Vahehindamine: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('020_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 16–19. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('020_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Sõber palus sul sõnumid üle vaadata. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Õpetaja kirjutas, et lapsel peab olla kaasas nõusolek.', 'Õpetaja kirjutas, et lapsel peab olema kaasas nõusolek.'],
        ['Me ei leidnud võtmed ja pidime lukusepa kutsuma.', 'Me ei leidnud võtmeid ja pidime lukusepa kutsuma.'],
        ['Olen väga huvitatud teie koor.', 'Olen väga huvitatud teie koorist.'],
        ['Pöördusin vedaja, sest rong jäi ära.', 'Pöördusin vedaja poole, sest rong jäi ära.'],
        ['Tagatisraha tuleb tagasi maksma kahe nädala jooksul.', 'Tagatisraha tuleb tagasi maksta kahe nädala jooksul.'],
        ['Vanaema on väga rahul uus lasteaiaõpetaja.', 'Vanaema on väga rahul uue lasteaiaõpetajaga.|Vanaema on uue lasteaiaõpetajaga väga rahul.'],
      ]),
      B.transformation('020_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle sama mõte antud sõnadega.', [
        ['Lasteaias on keelatud haiget last tuua.', 'ei tohi', 'Haiget last ei tohi lasteaeda tuua.|Lasteaeda ei tohi haiget last tuua.'],
        ['Koorilaul huvitab mind väga.', 'olen huvitatud', 'Ma olen koorilaulust väga huvitatud.|Olen koorilaulust väga huvitatud.|Ma olen väga huvitatud koorilaulust.|Olen väga huvitatud koorilaulust.'],
        ['Üürileandja ütles: „Parandage kapiuks ära!”', 'pidin', 'Ma pidin kapiukse ära parandama.|Pidin kapiukse ära parandama.'],
        ['Kas matk toimub? See oleneb ilmast.', 'sõltub', 'Matk sõltub ilmast.|See sõltub ilmast.'],
        ['Mul on vaja minna jaama, sest tahan piletit osta.', 'lähen … ostma', 'Ma lähen jaama piletit ostma.|Lähen jaama piletit ostma.'],
        ['Ma pean vedajale hilinemisest rääkima.', 'teatama', 'Ma pean vedajale hilinemisest teatama.|Pean vedajale hilinemisest teatama.|Ma pean hilinemisest vedajale teatama.|Pean hilinemisest vedajale teatama.'],
      ]),
      PART('020_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Vahehindamise eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('020_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet, igaüht ainult üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu, reisijad! Kell üheksa väljuv rong Tartusse jääb tehnilise rikke tõttu ära. Reisijad saavad sõita asendusbussiga, mis väljub jaama eest kell üheksa kolmkümmend. Rongipiletid kehtivad ka bussis.',
        '2. Tähelepanu, maja elanikud! Kolmapäeval kella kümnest kolmeni ei ole majas sooja vett, sest keldris vahetatakse torusid.',
        '3. Raamatukogu vestlusring alustab uuesti oktoobris. Kohtume teisipäeviti kell kuus teise korruse saalis. Osalemine on tasuta.',
        '4. Pank hoiatab: petised helistavad pangatöötaja nimel. Meie töötaja ei küsi teilt kunagi telefoni teel PIN-koodi ega paroole. Kui kõne on kahtlane, pange toru ära ja teatage meile.',
      ], [
        'Ärajäänud rongi asemel väljub asendusbuss jaama eest kell [üheksa kolmkümmend|9.30|pool kümme].',
        'Reisijad võivad asendusbussis sõita samade [rongipiletitega|piletitega].',
        'Kolmapäeval kella kümnest kolmeni ei ole majas [sooja vett].',
        'Raamatukogu vestlusring kohtub alates oktoobrist [teisipäeviti|teisipäeval] kell kuus.',
        'Raamatukogu vestlusringis osalemine on kõigile [tasuta].',
        'Kui kõne tundub kahtlane, tuleb kohe toru [ära panna|ära panema].',
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
        ['Kui laps on seina peale joonistanud, ei pea üürnik midagi maksma.', false],
        ['Tagatisraha tuleb maksta korraga lepingu sõlmimise päeval.', false],
        ['Enamasti aitab juba rahulik kiri üürileandjale.', true],
        ['Nõustamise eest tuleb maksta tunnitasu.', false],
        ['Nõustaja räägib klientidega mitmes keeles.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('020_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('020_t_situation', 'Vahehindamine: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad vedajale kaebuse ja arutled kodu üle. Sõnavõtus esitled mooduli tulemust: üht oma päris muret, mille plaani paned enne kirja kaardile „Minu lahendatud mure”.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own case, built from 016–019
      B.planning('020_t_product', 'Mooduli tulemus: minu lahendatud mure.', 'Vali üks päris mure oma elust (üürileandja, kooli või lasteaia teade, klubi, ärajäänud reis) ja pane kirja oma plaan. Kasuta mooduli tundide tulemusi.', ['Mis juhtus ja mis on juba tehtud? (tund 16: täis- ja osasihitis)', 'Mida pead, tahad või ei tohi veel teha? (tund 17: ma- ja da-tegevusnimi)', 'Kelle poole pöördud, kes vastutab mille eest ja millega oled rahul? (tunnid 18–19: rektsioon)', 'Mis on sinu esimene samm sel nädalal ja kellele sa sellest räägid?']),
      PART('020_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; vahehindamise eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('020_t_letter', 'Kirjutamine 1: kaebus vedajale (umbes 140 sõna).', 'Sinu rong jõudis sihtkohta kaks ja pool tundi hiljem ja ooteajal ei pakutud midagi. Kirjuta vedajale: mis juhtus, mida see sulle tähendas, mida sa nõuad ja mida kirjale lisad.', 'Lugupeetud klienditeenindus!', 'Lugupidamisega', [125, 144]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('020_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Teema: kas noorel inimesel on Eestis mõistlikum kodu üürida või osta? Kirjuta arutlus: poolt- ja vastuargumendid, igaühele näide, ja lõpus oma järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 4), { task: 'W14', harno: 'W2b' }),
      PART('020_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; vahehindamise eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('020_t_present', 'Rääkimine 1: sõnavõtt koosolekul (1 minut).', 'Teemakaart: kursuse koosolekul räägib igaüks ühest murest, mille ta ise lahendas või lahendab. Mõtle 2 minutit oma kaardi „Minu lahendatud mure” järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mis juhtus ja mis on juba tehtud?', 'Mida pead veel tegema?', 'Kelle poole pöördusid ja kes aitas?', 'Mida soovitaksid teistele samas olukorras?', 'Kumb on sinu arvates parem: mure kohta helistada või kirjutada? Miks?', 'Mis sinu arvates teeb asjaajamise eesti keeles kõige raskemaks?'], [90, 120], ['Tahaksin rääkida ühest murest…', 'Kõigepealt pidin…', 'Pöördusin … poole, sest…']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('020_t_feedback', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas gümnaasiumis peaks olema kohustuslik vabatahtlik töö? Argumendid: noored saavad päris kogemuse; paljud leiavad endale hobi; kogukond saab abi. Lisa oma näide.', 'Kaart B (vastu). Teema: kas gümnaasiumis peaks olema kohustuslik vabatahtlik töö? Argumendid: vabatahtlik töö ei saa olla kohustuslik; noortel on niigi palju koormust; kasu on ainult siis, kui huvi on päris. Lisa oma näide.',
        ['Minu arvates…', 'Näiteks minu tuttav…', 'Ma saan aru, aga…'], ['Ma ei ole päris nõus, sest…', 'Teisalt…', 'Kas võiksime kokku leppida, et…?']), { task: 'S17', harno: 'S2' }),
      B.rubric('020_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kaebus: mis juhtus, nõue ja lisad, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Arutlus: poolt- ja vastuargumendid, näited ja järeldus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: mure, tehtud ja tegemata sammud ning abi 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin, reageerisin paarilisele, jõudsime kokkuleppele (15 punkti).']),
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
    'Õpetaja: „Järgmisel neljapäeval sõidab meie klass Tartusse teaduskeskusesse.”',
    'Õpetaja: „Buss väljub kooli eest täpselt kell kaheksa.”',
    'Õpetaja: „Õppekäik maksab kaksteist eurot.”',
    'Õpetaja: „Selle tuleb tasuda esmaspäevaks.”',
    'Õpetaja: „Lapsel peab olema kaasas vanema allkirjaga nõusolek.”',
    'Õpetaja: telefoni „bussis … kasutada ei tohi”.',
    'Õpetaja: „tuleb sellest hommikul e-päevikus teatada”.',
  ],
  '017_p_note': [
    'ei tohi + da-tegevusnimi: jääda (hiljaks jääma).',
    'pidama + ma-tegevusnimi: peab olema; nõusolek on olema-lause alus, seepärast nimetav.',
    'võima + da-tegevusnimi: võtta.',
    'tuleb + da-tegevusnimi: maksta.',
    'tasub + da-tegevusnimi: võtta; osa veest → osastav vett.',
    'pidama + ma-tegevusnimi: alla kirjutama.',
    'on vaja + da-tegevusnimi: teatada.',
  ],
  '017_t_mom': [
    'Teates: lapse võib viia „ainult see täiskasvanu, kes on lapsevanema avalduses kirjas”.',
    'Teates: detsembris on lasteaed avatud „kella 7.00–18.00”.',
    'Teates: „Haiget last (palavik, köha, kõhuvalu) ei tohi lasteaeda tuua.”',
    'Teates: „Jõulupidu on 19. detsembril kell 16.”',
    'Teates: „Lapsel peavad kaasas olema soojad vahetusriided.”',
    'Teates: sellest „tuleb lasteaiaõpetajale teatada 10. detsembriks”.',
  ],
  '017_t_exit': [
    'hakkama + ma-tegevusnimi: hakkab tooma.',
    'võima + da-tegevusnimi: võib olla.',
    'tasub + da-tegevusnimi: tasub teha.',
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
    'Ema: „Vedaja pani asemele bussi.”',
    'Ema: „sama piletiga saab bussiga edasi sõita”.',
    'Sõber: „Mu rong jõudis Riiga kaks ja pool tundi hiljem.”',
    'Sõber: „panin juurde pileti pildi”.',
    'Naaber: „Vedaja maksis hotelli ja õhtusöögi eest.”',
    'Naaber: „tšekid tuli alles hoida”.',
    'Naaber: „Kas sa saaksid … meie kassi eest hoolitseda?” — hoolitsema kelle eest.',
    'Mihkel: „pean talle e-kirja kirjutama ja selgitama, mis juhtus”.',
  ],
  '019_t_exit': [
    'Kaebus sai valmis → täissihitis omastavas: kaebuse.',
    'pidama + ma-tegevusnimi: pean hoidma.',
    'rahul millega → kaasaütlev: vastusega.',
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
    'kehtima: pilet on alus (nimetav), mitte sihitis; ja küsimus on päriselt vajalik.',
    'tuleb + da: esitada; tuleb-lause täissihitis on nimetavas: kaebus.',
    'pöörduma kelle poole → omastav + poole: tarbijakaitse poole.',
    'pakkuma kellele → alaleütlev reisijatele; pakkuma + mida: süüa ja juua (da-tegevusnimi).',
    'Tšekid on tõend: ilma nendeta kulusid tagasi ei saa.',
    'vabandama mille pärast → omastav + pärast: hilinemise pärast.',
    'tänulik mille eest → omastav + eest: abi eest.',
  ],
  '020_d_read': [
    '(E) lõik: „mida pean tegema, mida ei tohi teha ja mis kuupäevaks”.',
    'Sinu oma vastus: õpetaja vaatab, kas räägid päris juhtumist.',
  ],
  '020_d_mc': [
    '(A) lõik: „Me loeme pealkirja, otsime üles hinna ja vajutame nuppu „nõustun”.”',
    '(B) lõik: tingimused on „kirjutatud juristidelt juristidele”, keerulise teksti puhul loobume.',
    '(C) lõik: üks on kohustus ja teine võimalus, kuigi vahe on „vaid ühe sõna poolest”.',
    '(D) lõik: „aga mitte see, et lapsel peab olema kaasas nõusolek”.',
    '(C) lõik ütleb, et tõlkeprogramm ei anna alati tähendust edasi; autor seda ei soovita.',
    '(G) lõik: raha, kodu ja last puudutavad tekstid „tasub lugeda rahulikult ja lõpuni”.',
  ],
  '020_d_para': [
    '(A): „Selle harjumuse eest maksame aga tihti rohkem, kui arvame.”',
    '(B): „probleemi korral selgub, et kõik oli kirjas”.',
    '(C): tõlkeprogramm „tõlgib küll sõnad, kuid mitte alati tähendust”.',
    '(D): „me loeme sellest ainult kaks esimest rida”.',
    '(E): kohustused ja keelud „peituvad tavaliselt sõnades „peab”, „tuleb” ja „ei tohi””.',
    '(F): „ei sõltu tulemus sellest, kes räägib valjemini, vaid sellest, kellel on tõend”.',
    '(E): „üks küsimus on palju odavam kui hilisem vaidlus”.',
    '(G): „Kõike ei peagi lugema.”',
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
    'Teade 1: buss „väljub jaama eest kell üheksa kolmkümmend”.',
    'Teade 1: „Rongipiletid kehtivad ka bussis.”',
    'Teade 2: „ei ole majas sooja vett”.',
    'Teade 3: „Kohtume teisipäeviti kell kuus.”',
    'Teade 3: „Osalemine on tasuta.”',
    'Teade 4: „pange toru ära ja teatage meile”.',
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
    'Vale: lapse joonistus seinal „on see juba kahju”, selle eest võib üürileandja raha nõuda.',
    'Vale: „selle võib maksta ka kolmes osas”.',
    'Õige: „Enamasti aitab see.”',
    'Vale: „Meie nõustamine on tasuta.”',
    'Õige: „me räägime eesti, vene ja inglise keeles”.',
  ],
  '020_p_fix': [
    'pidama + ma-tegevusnimi: peab olema.',
    'Eitus → osastav: võtmeid.',
    'huvitatud millest → seestütlev: koorist.',
    'pöörduma kelle poole → omastav + poole: vedaja poole.',
    'tuleb + da-tegevusnimi: maksta.',
    'rahul millega → kaasaütlev: uue lasteaiaõpetajaga.',
  ],
  '020_p_trans': [
    'ei tohi + da-tegevusnimi: tuua; eituses osastav last.',
    'huvitatud millest → seestütlev: koorilaulust.',
    'pidama + ma: parandama; käsu nimetav kapiuks → tulemus omastavas kapiukse.',
    'sõltuma millest → seestütlev: ilmast.',
    'minema + eesmärk → ma-tegevusnimi: lähen ostma; osastav piletit (tegevus).',
    'teatama kellele millest: vedajale hilinemisest.',
  ],
};
