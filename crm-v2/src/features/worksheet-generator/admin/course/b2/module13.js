// B2 course (B1 → B2 roadmap), module 13 „Keskkond ja vastutustundlik elu” (b1b2-061…065), stage B2- (homework 160–200
// words, the B2 opener and article lengths, nominal style: -mine nouns, cause phrases with tõttu / tänu, vaatamata).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–10. Module goal (the learner): „Ma oskan keskkonnast rääkida oma elu kaudu: selgitan, mis saab
// meie prügist, toidust ja energiast ning miks, võrdlen lahendusi ja kirjutan probleemist lahenduseni”; module product
// „Minu kodu keskkonnaplaan” (064 Kasuta, the S16 one-minute talk in 065). Environment from the learner's own angle: his
// bin and the bottle deposit, his fridge and the food bank, the oil-shale exit of Ida-Virumaa (his region or his
// neighbours'), his flat and his old neighbour in a heatwave. Real facts with sources on every page; no slogans — every
// task makes the learner choose between convenience, price, time and the environment (roadmap „attention”).
// Not repeated from earlier modules: the bog hike (module 3), the real or artificial Christmas tree and the commute cost
// (module 5); not module 11's money topics (second-hand buying, electricity contracts).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 13).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   061 quest    „Pudel, purk ja banaanikoor: kuhu sinu prügi tegelikult läheb?”      home     final present: talk at the house meeting (S16)
//   062 facts    „127 kilo aastas: miks me toitu ära viskame?”                          family   final plan: the data summary (W15 → W2a at home)
//   063 debate   „Põlevkivielekter lõpeb: millest elab Ida-Virumaa 2035. aastal?”       work     final decide: argument cards, one joint position (S17)
//   064 project  „Toas on 30 kraadi: kas su kodu ja naabrid on kuumalaineks valmis?”    health   final plan: the stairwell heat plan + „Minu kodu keskkonnaplaan”
//   065 exam     Kontroll 13 in Harno B2 form + „Minu kodu keskkonnaplaan” as the S16 one-minute talk.
// Grammar line of the roadmap (B2, docs/METHODOLOGY_STANDARD.md §5) by discovery and spiralled: change of state and result
// — muutuma / jääma / minema / tegema + -ks, X-st saab Y, jääb sorteerimata, -nema verbs (vähenema, paranema) (061; back in
// 062's text, 064 and 065); cause and consequence a step above module 10's kuna-clause — the cause as a noun phrase
// (soodustuste tõttu, tänu Toidupangale, selle tagajärjel) and mistõttu / seetõttu with the verb second (062; back in 063's
// radio, 064 and 065); -mine nouns with a genitive object and comparison of numbers (põlevkivi kaevandamine, tootmise
// lõpetamine; 4,5 protsendipunkti võrra kõrgem, kaks korda rohkem kui) (063; back in 064's clips and 065); concession at
// B2 — vaatamata + alaleütlev / vaatamata sellele, et …; küll …, kuid; ehkki; samas — after module 5's kuigi … siiski, in the
// problem → causes → solutions → conclusion text (064; back in 065). The one long text of the module is the topic opener
// (061 station 2, ≈ 320 words, after a 10-minute hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js (061–064 without g_listen: as in module 10, a recording of a teaching
// lesson trains g_read, and every goal needs two tasks — lessonGoals.test.js) and the
// archetypes (AVAS R→S, LUGU R→W, PROB L→S, KUUL L→W, EKS); exactly one exam corner a lesson (V12): R1 (061), W2a (062, the
// summary written at home), W1 (063, the letter to a friend in Narva written at home: the radio — now gaps, so that 063
// and 064 do not open with the same two stations — would make the exam share 34 % of the lesson), L1 (064). The v2 storyline
// version (Viktor's farm and the Kõrvemaa wind farm, Tuul Logistika's 60 000 euros, the zero-waste week) is in git history
// before 2026-11-19.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 13. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud kodust.';

export const MODULE = { id: 'b1b2-module-13', course: 'b2', title: 'Keskkond ja vastutustundlik elu', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

// the radio debate of 063: heard twice for the true / false statements (Harno B2 L4)
const RADIO_063 = [
  'Saatejuht: Tere hommikust! Eesti on otsustanud, et põlevkivist elektri tootmine lõpeb kahe tuhande kolmekümne viiendaks aastaks ja põlevkivi kasutamine energeetikas kahe tuhande neljakümnendaks aastaks. Mida see tähendab Ida-Virumaale? Stuudios on energiamajanduse uurija Reet Laur ja Narva kutsekooli õpetaja Sergei Ivanov, kes töötas varem kakskümmend aastat elektrijaamas.',
  'Reet: Põlevkivist elektri tootmine on muutunud väga kalliks. Euroopa Liidus tuleb iga tonni süsihappegaasi eest maksta ja põlevkivielektri heitmed on suured. Seetõttu ei ole see enam ammu turul konkurentsivõimeline. Küsimus ei ole selles, kas tootmine lõpeb, vaid selles, kui hästi me selleks valmis oleme.',
  'Sergei: Ma ei vaidle numbritega. Aga põlevkivisektoris töötab praegu umbes neli tuhat inimest ja see on Ida-Virumaal üks paremini makstud töid. Kui need töökohad kaovad, ei kao ainult palk. Kaob ka põhjus, miks noored peaksid siia jääma.',
  'Saatejuht: Ida-Virumaa töötuse määr oli kahe tuhande kahekümne kuuenda aasta esimeses kvartalis üksteist koma kuus protsenti, Eestis keskmiselt seitse koma üks. Reet, kas see vahe kasvab?',
  'Reet: Oht on olemas. Seepärast saab Eesti Euroopa Liidu õiglase ülemineku fondist umbes kolmsada nelikümmend miljonit eurot, peamiselt Ida-Virumaale. Narvas avati kahe tuhande kahekümne viiendal aastal Euroopa esimene suur haruldaste muldmetallide magnetite tehas ja ehitatakse ettevõtlusparke, kuhu võib lähiaastatel tulla kuni kaks tuhat uut töökohta.',
  'Sergei: Kuni kaks tuhat on ilus number, aga see on lubadus, mitte tööleping. Tehaste ehitamine võtab aega ja paljud projektid on jäänud paberile. Viiekümneaastasele kaevurile ei piisa ka kolmekuulisest kursusest. Tema ümberõpe peab olema tasuline ja seotud konkreetse töökohaga.',
  'Reet: Selles olen nõus. Ümberõpe peab algama enne koondamist, mitte pärast seda. Samas on üleminekul ka teine pool: õhk Ida-Virumaal muutub puhtamaks ja uued tööstused ei ole enam sõltuvad ühest maavarast.',
  'Saatejuht: Sergei, mida teie oma õpilastele ütlete?',
  'Sergei: Ma ütlen, et elektrikut, keevitajat ja automaatikatehnikut on vaja ka uues tööstuses. Nende oskused ei kao. Kuid ma ütlen ka ausalt, et riik peab kiiremini tegutsema, muidu kolivad noored Tallinnasse või Soome.',
  'Saatejuht: Aitäh mõlemale!',
];

export const LESSONS = withShapes({
  'b1b2-061': {
    title: 'Pudel, purk ja banaanikoor: kuhu sinu prügi tegelikult läheb?',
    phases: grammar('Keel: muutus ja tulemus — muutub kompostiks, jääb sorteerimata, läheb kallimaks, pudelist saab tooraine; vähenema, paranema'),
    format: 'quest',
    topic: 'home',
    canDo: 'Ma selgitan, mis saab minu kodu jäätmetest ja pandipakendist, väljendan muutust ja tulemust (muutub kompostiks, jääb sorteerimata, vähenes) ning räägin majakoosolekul 2 minutit, kuidas meie maja võiks paremini sorteerida.',
    teacherPage: {
      goal: 'Квест: угадать долю возвращённой тары, проверить факты о мусоре, форма изменения (kompostiks, sorteerimata, vähenes), разложить мусор и выступить на собрании дома.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — сортировка 8 вещей и выступление 1 минута без возражений соседа. Текст (станция 2) — дома, 8 вопросов в начале следующего урока.',
      hook: '«В 2025 году в магазины Эстонии попало 437 миллионов бутылок и банок с залогом. Сколько вернули: половину, три четверти или больше восьми из десяти? И сколько мусорных вёдер у тебя на кухне?» Угадайте оба, ответ — в тексте (381 млн, почти 9 из 10).',
      plan: [
        '0–4: крючок — угадать, сколько тары возвращают, и сосчитать свои вёдра',
        '4–15: станция 1 — разговор: что быстрее всего наполняется дома, куда я несу бутылки, как сортировали там, где я вырос',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 8 вопросам, текст, проверка прогноза (R1)',
        '30–42: станция 3 — заметить в тексте → правило -ks, jääb …-mata, -nema → объявление товарищества: 7 пропусков',
        '42–57: станция 4 — чат дома (кто выступит на собрании?), контрольная точка «мусорный домик»: 8 вещей в правильный контейнер; выступление на собрании 2 минуты, возражения соседа',
        '57–69: «Kui aega jääb» — ролевая игра: новый сосед кидает всё в смешанные отходы',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо правлению 160–180 слов, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Eesti Pandipakend, доклад Kaupo Karba (Kliimaministeerium, март 2026): в 2025 г. на рынок 437 млн упаковок, собрано 381 млн, с 2005 г. собрано 6,2 млрд, 600 магазинов с автоматом; залог 10 центов; ERR, «Inimesi hoiab prügi sorteerimast sageli hirm valesti sorteerimise ees» (24.03.2024): ≈ 378 кг отходов на человека в год, сортируется ≈ 40 %, пилот в Хааберсти — у 10 товариществ смешанные отходы −≈20 % за полгода, слова Joosep Vimm; Riigikontroll (2024): в 2022 г. переработано 33 % бытовых отходов, цель ЕС 55 % (2025) и 60 % (2030); Keskkonnaamet: раздельный сбор биоотходов обязателен везде с конца 2023 г.; ERR: отдельно собирают лишь около четверти биоотходов. Сортировка в станции 4 — по общим правилам; местные правила могут отличаться (стекло в некоторых городах — отдельный контейнер).',
      groups: 'Станция 1 — в парах. Прогноз и текст — каждый сам, сверка в паре. Станция 4: сортировку делает каждый сам, выступает один, второй — сосед с вашей карточкой возражений; потом смена. В 1:1 сосед — вы.',
      errors: [
        '«Prügi muutub kompost» → «Prügi muutub kompostiks» (muutuma, jääma, minema + -ks: во что превращается).',
        '«Pudelist saab uueks pudeliks» → «Pudelist saab uus pudel» (X-st saab Y — Y в номинативе; X muutub Y-ks).',
        '«Pool prügist jääb mitte sorteeritud» → «… jääb sorteerimata» (jääma + -mata: чего не сделали).',
        '«Segaprügi vähendas» → «Segaprügi hulk vähenes» (vähenema — уменьшается само; vähendama — кто-то уменьшает что-то).',
      ],
      notes: [
        'Формат — квест: четыре контрольные точки, у каждой — решение ученика (угадать, проверить, выбрать форму, выбрать контейнер и убедить соседей). Без лозунгов: в каждой точке спросите «а удобно ли это, сколько стоит, сколько времени?».',
        'Ученику в частном доме — свой компост и контейнеры у калитки; в общежитии — кухня на этаже; пенсионеру — «я сам председатель товарищества» или соседка по лестнице; уставшему после смены — «что легче всего, чтобы не думать вечером». Никого не стыдим за то, что не сортирует.',
        'Обратная связь, 2–3 цели: -ks после muutuma / jääma / minema; jääb …-mata; vähenema или vähendama.',
      ],
    },
    discover: [
      station(B.text('061_d_hook', 'Arva ära', 'Eesti poodidesse jõudis 2025. aastal 437 miljonit pandiga pudelit ja purki. Mitu neist toodi tagasi: pool, kolm neljandikku või üle kaheksa kümnest? Ja mitu prügikasti on sinu köögis? Ütle kohe.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('061_d_talk', 'Prügi minu kodus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Mis läheb sinu kodus kõige kiiremini täis ja miks?',
        'Kuhu viid pudelid ja purgid ning mida pandirahaga teed?',
        'Kuidas sorteeriti seal, kus sa üles kasvasid?',
      ], [150, 210], ['Meil läheb kõige kiiremini täis …', 'Pandiraha …', 'Seal, kus ma üles kasvasin, …']), 'Sinu enda prügikast on tunni faktide esimene võrdlus.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise oma köögist. Ära paranda ega hinda, kes sorteerib. Lõpus ütle üks sõna, mida õpilane vajas (pakend, biojäätmed, taaraautomaat).')),
      station(tag(B.vocab('061_d_vocab', 'Enne lugemist: sõnad.', ['jäätmed — отходы', 'pakend — упаковка', 'biojäätmed — биоотходы', 'pandipakend — тара с залогом', 'pant — залог', 'konteiner — контейнер', 'ringlusse võtma — перерабатывать', 'sorteerima — сортировать', 'prügila — свалка', 'tooraine — сырьё']), { topic: ['biojäätmed', 'pandipakend'] }), 2, 15),
      B.topicOpener('061_d_open', 'Moodul 13. Kuhu läheb meie prügi?', [
        'Eesti Pandipakend on kogunud pudeleid ja purke juba üle kahekümne aasta ja kokku üle kuue miljardi. Ainuüksi 2025. aastal jõudis poodidesse 437 miljonit pandipakendit ja tagasi toodi 381 miljonit ehk peaaegu üheksa kümnest. Pandimärgiga pudeli või purgi eest saab tagasi kümme senti ja taaraautomaat on umbes kuuesajas poes. Kogutud plastpudelid purustatakse ja neist saab uus tooraine, purgid sulatatakse ümber. Nii jõuab sama materjal mõne kuu pärast tagasi poeriiulile. Sarnane süsteem töötab ka Soomes, Rootsis, Saksamaal ja Leedus; Lätis käivitati see hiljem.',
        'Teiste jäätmetega läheb kehvemini. Iga Eesti elanik tekitab aastas umbes 378 kilogrammi jäätmeid, kuid kodudes sorteeritakse neist ainult umbes 40 protsenti. Riigikontrolli andmetel võeti 2022. aastal olmejäätmetest ringlusse vaid kolmandik, kuigi Euroopa Liit nõuab juba praegu 55 protsenti ja hiljem veelgi rohkem. See, mis jääb sorteerimata, läheb põletusse või prügilasse. Sellest ei saa enam uut pakendit ega komposti, ja mida rohkem segaprügi on, seda kallimaks läheb lõpuks prügivedu kõigile.',
        'Alates 2023. aasta lõpust tuleb biojäätmeid ehk toidujääke ja koori koguda eraldi kogu Eestis. Eraldi kogutud biojäätmed muutuvad kompostiks või biogaasiks, kuid praegu kogutakse eraldi ainult umbes neljandik neist. Eramajas võib biojäätmeid ka ise kompostida, kortermajas on selleks hoovis eraldi konteiner. Hea näide tuli Tallinna Haabersti linnaosast: kui kümme korteriühistut said maja juurde pakendikonteineri, vähenes nende segaprügi hulk poole aastaga peaaegu viiendiku võrra.',
        'Miks inimesed siis ei sorteeri? Ministeeriumi ametnike sõnul kardavad paljud, et teevad valesti. Juhised on eri omavalitsustes erinevad, sest igal vallal ja linnal on oma süsteem, ja konteinerid on sageli kodust kaugel. Tallinna abilinnapea Joosep Vimm on öelnud, et mida lähemal ja mugavam sorteerimine on, seda paremini inimesed sorteerivad. Teisisõnu ei sõltu tulemus ainult sellest, kui keskkonnateadlik inimene on, vaid ka sellest, kui lihtsaks on õige valik tehtud. Kui konteiner on maja juures ja juhis on arusaadav, ei pea keegi pikalt mõtlema.',
        'Selles moodulis vaatad keskkonda oma elu kaudu: oma prügikasti, külmkappi, kodu elektrit ja suvist kuumust. Igas tunnis valid ise, mis on sinu jaoks mõistlik: mugavus, hind, aeg või keskkond.',
      ], 'Eesti Pandipakend (Kaupo Karba ettekanne, Kliimaministeerium, märts 2026); ERR, „Inimesi hoiab prügi sorteerimast sageli hirm valesti sorteerimise ees” (24.03.2024); Riigikontroll, olmejäätmete järelaudit (2024); Keskkonnaamet, „Kohaliku omavalitsuse jäätmehooldus”', [
        'Kas sinu oletus pandipakendi kohta oli õige? Mis sind üllatas?',
        'Kuidas sorteeritakse prügi sinu kodumaal või seal, kus sa üles kasvasid? Mida võiks Eesti sealt õppida?',
        'Mis on sinu majas või tänaval sorteerimise kõige suurem takistus: kaugus, ruum, aeg või midagi muud?',
        'Kas pandisüsteemi võiks laiendada ka klaaspurkidele ja veinipudelitele? Miks?',
      ]),
      teach(tag(purpose(B.choice('061_d_facts', 'Arva ja kontrolli: mis saab meie prügist?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Kui suur osa 2025. aastal müüdud pandipakenditest toodi tagasi?', 'peaaegu üheksa kümnest', 'umbes pool', 'kolm neljandikku', 'kõik pakendid'],
        ['Miks on pandipakendiga lugu teistsugune kui teiste jäätmetega?', 'pandipakendist saab uus tooraine, aga suur osa muust prügist jääb sorteerimata', 'pandipakendit ei tohi sorteerida', 'teisi jäätmeid on vähem kui pandipakendeid', 'muud jäätmed lähevad kõik kompostiks'],
        ['Kuidas oli 2022. aasta tulemus võrreldes Euroopa Liidu nõudega?', 'ringlusse võeti kolmandik, nõutakse 55 protsenti', 'nõue oli juba täidetud', 'ringlusse võeti 40 protsenti, nõutakse 50', 'Euroopa Liit ei ole midagi nõudnud'],
        ['Mis juhtub teksti järgi jäätmetega, mis jäävad sorteerimata?', 'need lähevad põletusse või prügilasse', 'neist tehakse uued pudelid', 'need muutuvad kompostiks', 'need saadetakse tagasi poodi'],
        ['Mis muutus Haabersti korteriühistutes pärast pakendikonteineri tulekut?', 'segaprügi hulk vähenes peaaegu viiendiku võrra', 'prügivedu läks kaks korda kallimaks', 'biojäätmeid hakati ise kompostima', 'elanikud hakkasid rohkem pudeleid ostma'],
        ['Mis on ministeeriumi ametnike sõnul üks peamisi põhjusi, miks inimesed ei sorteeri?', 'nad kardavad, et teevad valesti', 'neil ei ole prügikotte', 'sorteerimine on keelatud', 'nad ei tea, mis on pakend'],
        ['Mida tähendab abilinnapea mõte sorteerimise kohta lihtsate sõnadega?', 'kui konteiner on kodu lähedal ja mugav, sorteeritakse rohkem', 'inimesi tuleb trahvida', 'sorteerimine sõltub ainult palgast', 'konteinereid on liiga palju'],
        ['Millise väitega oleks teksti autor kõige rohkem nõus?', 'sorteerimine sõltub nii inimesest kui ka sellest, kui lihtsaks see on tehtud', 'Eesti sorteerib juba piisavalt hästi', 'pandisüsteem ei ole midagi muutnud', 'biojäätmeid ei ole mõtet eraldi koguda'],
      ], 'full', 'g_read'), 'Näed, kas sinu pilt Eesti prügist vastab faktidele.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja küsimused valikvastustega. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Küsi lõpuks: „Mis number üllatas kõige rohkem ja miks?” Arvud on hea arutelu algus: 378 kg — kui palju see on sinu peres nädalas?'),
    ],
    practice: [
      station(B.notice('061_p_notice', 'Märka: biojäätmed muutuvad kompostiks', [
        'Tekstist: biojäätmed **muutuvad kompostiks** · mis **jääb sorteerimata** · segaprügi hulk **vähenes** · pandipakendist **saab** uus tooraine',
        '**muutuma, jääma, minema, tegema + -ks** (saav kääne) näitab tulemust: Koor muutub mullaks. · Konteiner jäi tühjaks. · Prügivedu läheb kallimaks. · Uus konteiner teeb hoovi puhtamaks.',
        '**X-st saab Y** — Y jääb nimetavasse: Pudelist **saab** uus **pudel**. · Kartulikoortest **saab** **biogaas**. (Aga: Koored **muutuvad biogaasiks**.)',
        '**jääma + -mata** = mida ei tehtud: pool prügist **jääb sorteerimata**; pudel **jäi tagasi viimata**.',
        '**-nema** = asi muutub ise: suur → **suurenema**, väike → **vähenema**, parem → **paranema**, kallis → **kallinema**. Kui keegi muudab midagi, siis **-dama**: Ühistu **vähendas** prügi hulka. Prügi hulk **vähenes**.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('061_p_forms', 'Korteriühistu teade elanikele.', 'Otsusta, kas lause vajab tulemust (-ks), tegemata asja (-mata) või muutust (-nema), ja kirjuta sulgudes olev sõna õiges vormis.', [
        'Hoovi tuleb biokonteiner: toidujäätmed muutuvad paari kuuga [kompostiks]. (kompost)',
        'Eelmisel aastal jäi meie majas suur osa pakenditest [sorteerimata]. (sorteerima)',
        'Kuna segaprügi on palju, läheb prügivedu järgmisest aastast [kallimaks]. (kallis)',
        'Pärast pakendikonteineri tulekut [vähenes] naabermaja segaprügi hulk viiendiku võrra. (väike, minevikus)',
        'Kogutud pudelitest ja purkidest [saab] uus tooraine. (saama, olevikus)',
        'Viimastel aastatel on sorteerimine Eestis veidi [paranenud]. (parem, täisminevik)',
        'Uus valgusti teeb prügimaja õhtul [turvalisemaks]. (turvaline, keskvõrre)',
      ], '', 'full', 'g_notice'), 'Ühistu teade on selge ainult siis, kui on aru saada, mis muutub ja mis jääb tegemata.'), { task: 'G02' }),
      'Pärast iga rida küsi: „Kas siin on tulemus, tegemata asi või muutus?” Rida 5: pudelitest saab — tooraine on nimetavas. Lisaküsimus: „Mis jääb sinu majas kõige sagedamini sorteerimata?”'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('061_t_chat', 'Sinu maja vestlusgrupp.', 'Loe naabrite sõnumeid: mis on probleem ja kes peaks järgmisel koosolekul rääkima?', 'Malle (3. korrus)', 'Andres (1. korrus)', [
        ['A', 'Segaprügi konteiner on jälle täis ja kotid on maas. Keegi viskas sinna kolm suurt pappkasti.'],
        ['B', 'Mitte mina. Aga meil pole ju pakendikonteinerit — kuhu ma siis pean karbid viima?'],
        ['A', 'Lähim pakendikonteiner on poe juures, poole kilomeetri kaugusel. Talvel ma sinna küll ei käi.'],
        ['B', 'Prügiveo arve läks ka kallimaks. Kas me maksame nüüd teiste laiskuse eest?'],
        ['A', 'Ma ei usu, et keegi on laisk. Pigem pole lihtsalt kohta, kuhu sorteeritud prügi panna.'],
        ['B', 'Üldkoosolek on järgmisel neljapäeval. Kas keegi teeb seal ettepaneku?'],
        ['A', 'Mina ei oska hästi koosolekul rääkida. Äkki keegi noorem?'],
        ['B', 'Mul on neljapäeval õhtune vahetus. Kas sina saaksid tulla ja rääkida?'],
      ], 'g_read'), 'Naabrite sõnumitest näed sinu maja päris probleemi — sellest räägid koosolekul.'), { task: 'R12' }), 4, 15, { final: 'present' }),
      tag(purpose(B.categorize('061_t_sort', 'Kontrollpunkt: prügimaja.', 'Sa viid kodust välja kaheksa asja. Vaata märgist ja otsusta, kuhu iga asi läheb.', [
        ['Taaraautomaat', ['tühi limonaadipudel pandimärgiga', 'õllepurk pandimärgiga']],
        ['Pakendikonteiner', ['tühi jogurtitops', 'šampoonipudel ilma pandimärgita']],
        ['Biojäätmed', ['kartulikoored', 'kohvipaks koos paberfiltriga']],
        ['Segaolmejäätmed', ['katkine portselankruus']],
        ['Ohtlikud jäätmed (pood, apteek või jäätmejaam)', ['tühjaks saanud patarei']],
      ], 'full', 'g_vocab'), 'Kui tead, kuhu asi läheb, saad seda ka naabritele selgitada.'), { task: 'R07' }),
      teach(tag(purpose(B.rolecards('061_t_meeting', 'Majakoosolek: kuidas meie maja paremini sorteerib?', 'Räägi oma maja (või ühiselamu) koosolekul 2 minutit: mis on praegu, mis muutub ja mida sa pakud.',
        'Olukord: sinu maja segaprügi konteiner on alati täis, pakendid ja koored lähevad sinna sisse; maja juures on ainult üks konteiner.\nSinu eesmärk: räägi 2 minutit — mis on probleem, mis muutub, kui midagi teha, ja kaks konkreetset ettepanekut. Vasta naabri vastuväidetele.\nPiirang: ära süüdista kedagi, räägi faktidest.',
        'Naabri kaart on õpetajal: tema kolm kahtlust.',
        ['Praegu jääb suur osa prügist sorteerimata, sest …', 'Kui tuleb pakendikonteiner, väheneb …', 'Ma teen ettepaneku, et …', 'Siis muutub meie hoov …-ks', 'Teises majas vähenes segaprügi …'], ['Aga kes selle eest maksab?', 'Biokonteiner hakkab haisema!', 'Mina olen 80, ma ei jaksa …']), 'Tulemus: maja teab, mida sa pakud ja miks see neile kasulik on.'), { task: 'S16', main: true, level: 4 }),
      'Õpetaja kaart (naaber, 80-aastane). Ütle oma kahtlused ükshaaval: 1) „Kes maksab? Prügivedu läheb ju kallimaks!” (Vastus, kui õpilane selle leiab: pakendite vedu on sageli soodsam kui segaprügi vedu, aga küsige ühistult hinnad.) 2) „Biokonteiner hakkab suvel haisema ja toob rotid.” 3) „Mul on põlv haige, ma ei jaksa kolme konteineri juurde käia.” Pakkumine, kui küsitakse: oled nõus, kui trepikojas on sorteerimisjuhis kahes keeles. Õnnestunud, kui õpilane räägib 2 minutit, nimetab probleemi ja kaks ettepanekut, kasutab vähemalt kolm muutuse vormi (muutub …-ks, jääb …-mata, väheneb) ja vastab kahele kahtlusele rahulikult.'),
      extension(teach(tag(purpose(B.speaking('061_t_more', 'Rollimäng: uus naaber viskab kõik ühte konteinerisse', 'Uus naaber viskab pudelid, koored ja kastid segaprügi hulka. Räägi temaga trepikojas viisakalt: ta ei ole halb inimene, ta lihtsalt ei tea. Õpetaja on naaber.', [
        'Kuidas alustad nii, et ta ei solvu?',
        'Mida selgitad lühidalt: kuhu mis läheb ja miks?',
        'Mida pakud: juhis, abi või midagi muud?',
      ], [120, 180], ['Tere! Kas teil on hetk aega?', 'Meil on siin nii, et …', 'Pudelitest saab …, kui …', 'Kui soovite, võin …']), 'Üks rahulik jutt trepikojas muudab rohkem kui vihane teade.'), { task: 'S13', level: 4 }),
      'Kui aega jääb (12 min). Sina oled uus naaber (kolis eile, töötab vahetustega, ei oska veel eesti keelt hästi). Vastused: „Mul ei ole aega”, „Minu eelmises kodus oli ainult üks konteiner”, „Kus need konteinerid üldse on?”. Õnnestunud, kui õpilane ei õpeta ülevalt alla, selgitab kaks asja koos põhjusega ja pakub konkreetset abi.'), 12),
      tag(exitCheck(purpose(B.gaps('061_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kui pudel jääb tagasi [viimata], ei saa sellest uut toorainet. (viima)',
        'Õunakoored muutuvad paari kuuga [mullaks]. (muld)',
        'Pärast konteineri tulekut [vähenes] segaprügi hulk märgatavalt. (väike, minevikus)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tulemus, tegemata asi ja muutus on käes.')), {}),
      purpose(B.selfcheck('061_t_self', ['Ma räägin, kuidas minu kodus jäätmeid sorteeritakse.', 'Ma saan aru faktidest pandipakendi ja jäätmete kohta ja võrdlen neid oma kogemusega.', 'Ma väljendan muutust ja tulemust: muutub kompostiks, jääb sorteerimata, vähenes.', 'Ma räägin majakoosolekul 2 minutit ja teen konkreetse ettepaneku.'], 'Prügimaja läbitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('061_t_letter', 'Kodus: kiri ühistu juhatusele.', 'Kirjuta kodus oma maja juhatusele, üürileandjale või ühiselamu juhatajale 160–180 sõna: mis on praegu probleem, mis muutuks, kui …, kaks konkreetset ettepanekut (näiteks pakendikonteiner, sorteerimisjuhis kahes keeles) ja palve vastata. Kasuta vähemalt nelja muutuse vormi (muutub …-ks, jääb …-mata, väheneb, paraneb).', 'Lugupeetud juhatus!', 'Lugupidamisega\n(sinu nimi), korter …', [160, 180]), 'Juhatus näeb, et sinu ettepanek on konkreetne ja kasulik kogu majale.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('061_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kuidas sinu kodus jäätmeid sorteeritakse ja mida sa järgmisel kuul muudad.', [
        'Mis läheb sinu kodus praegu valesse kohta?',
        'Mida sa muudad ja mis sellest saab?',
      ], [60, 120]), 'Õpetaja kuulab ja ütleb, kas muutuse vormid on õiged.')), { task: 'S15' }),
      homework('061_t_homework', ['1. Kiri juhatusele, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-062': {
    title: '127 kilo aastas: miks me toitu ära viskame?',
    phases: grammar('Keel: põhjus nimisõnaga — soodustuste tõttu, tänu Toidupangale, selle tagajärjel; mistõttu ja seetõttu (tegusõna teisel kohal)'),
    format: 'facts',
    topic: 'family',
    canDo: 'Ma loen joonist ja teksti toidu raiskamise kohta, väljendan põhjust ja tagajärge nimisõnaga (soodustuste tõttu, tänu Toidupangale, selle tagajärjel) ning kirjutan andmetest 180–200-sõnalise kokkuvõtte koos oma kommentaariga.',
    teacherPage: {
      goal: 'Анализ фактов: где пропадает еда (диаграмма), почему и что помогает (сроки, Toidupank); причина существительным (tõttu, tänu); план сводки данных W2a.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — только диаграмма и 3 первых вопроса; станция 3 — правило и 4 строки; станция 4 — объяснение диаграммы соседу по квартире без плана сводки. Текст — дома.',
      hook: '«Угадай: где в Эстонии выбрасывают больше всего ещё съедобной еды — в магазинах, в ресторанах, на полях и фермах или дома?» Голосуйте оба. Ответ — на диаграмме: дома (40 %).',
      plan: [
        '0–3: крючок — где пропадает больше всего еды, ученик голосует',
        '3–10: станция 1 — разговор: что я выбросил последним и почему',
        '10–25: станция 2 — слова (2 мин), диаграмма и текст «Toit, mis ei pidanud prügikasti minema» (с «parim enne» и «kõlblik kuni»), 7 заметок для сводки (R2b)',
        '25–37: станция 3 — заметить в тексте tõttu / tänu / selle tagajärjel → правило → 7 предложений: причина существительным',
        '37–52: станция 4 — голосовое соседа по квартире (6 пропусков), объяснить ему диаграмму — он не верит; в конце план сводки и первые два предложения',
        '52–64: «Kui aega jääb» — игра «Холодильник перед отпуском»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: сводка данных 180–200 слов (W2a), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Диаграмма и текст: Kliimaministeerium, «Toidujäätmete tekke vältimise kava» (2023), по исследованию SEI Tallinn и Eesti Maaülikool (Piirsalu jt 2021, данные 2020): ≈ 167 000 т пищевых отходов в год, 127 кг на жителя; почти половина — в домохозяйствах; из пропавшей съедобной еды (≈ 84 000 т, ≈ 164 млн €) дома 40 %, торговля 24 %, первичное производство 23 %, общепит 9 %, пищевая промышленность 4 %; цель ООН 12.3 — к 2030 г. вдвое меньше пищевых отходов в торговле и потреблении на человека. Toidupank: ERR, Katarina Papp (2026) — в 2025 г. ≈ 4 млн кг еды, более 15 000 человек в неделю. «Parim enne» / «kõlblik kuni»: Põllumajandus- ja Toiduamet.',
      groups: 'Станция 1 — в парах. Диаграмма, текст и голосовое — каждый сам, сверка в паре. Станция 4: один объясняет, другой — сосед-скептик Кристо с вашей карточкой; потом смена. В 1:1 скептик — вы.',
      errors: [
        '«Soodustus tõttu» → «Soodustuste tõttu» / «soodustuse tõttu» (перед tõttu и tänu — родительный падеж).',
        '«Tänu Toidupank» → «Tänu Toidupangale» (tänu + аллатив: кому/чему спасибо).',
        '«Seetõttu me ostame vähem» → «Seetõttu ostame me vähem» (после seetõttu глагол второй).',
        '«Ilma tõttu jäi kõik söömata hea» → tõttu обычно о плохой или нейтральной причине; о хорошей — tänu.',
      ],
      notes: [
        'Формат — анализ фактов: сначала ученик гадает, потом читает данные. Еда — тема личная и денежная: не спрашивайте, сколько семья тратит; «что я выбросил» можно рассказать о любой кухне (общежитие, родители, выдуманная семья).',
        'Студенту — общая кухня и общий холодильник; маме в декрете — детское пюре и остатки; пенсионеру — «раньше ничего не выбрасывали», это ценный опыт, пусть расскажет; уставшему — готовая еда и акции в магазине по дороге с работы.',
        'Обратная связь, 2–3 цели: родительный перед tõttu / tänu (и tänu + -le в «tänu kellele»); глагол вторым после seetõttu / selle tagajärjel; на графике — не просто числа, а сравнение (kaks korda rohkem, suurim osa).',
      ],
    },
    discover: [
      station(B.text('062_d_hook', 'Kus läheb toit raisku?', 'Arva: kus visatakse Eestis kõige rohkem veel söödavat toitu ära — poodides, restoranides, põldudel ja farmides või kodudes? Hääleta kohe ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('062_d_talk', 'Minu külmkapp.', 'Vasta ja too näide. Võid rääkida oma, vanemate või väljamõeldud köögist.', [
        'Mida sa viimati ära viskasid: kas see oli riknenud või veel söödav?',
        'Kas sul on poes ostunimekiri või ostad soodustuse järgi?',
        'Mida tegid sinu vanavanemad toiduga, mis üle jäi?',
      ], [150, 210], ['Viimati viskasin ära …, sest …', 'Tavaliselt ostan …', 'Minu vanaema …']), 'Sinu külmkapp on tunni andmete esimene võrdlus.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise, mida sa viimati ära viskasid. Ära küsi summasid ega hinda. Lõpus ütle üks sõna, mida õpilane vajas (riknema, hallitama, üle jääma).')),
      station(tag(B.vocab('062_d_vocab', 'Enne lugemist: sõnad.', ['toidujäätmed — пищевые отходы', 'raiskama — тратить впустую', 'söödav — съедобный', 'halvaks minema — портиться', 'kõlblik kuni — годен до', 'märgis — маркировка', 'soodustus — скидка (акция)', 'ülejääk — остаток', 'annetama — жертвовать (отдавать даром)', 'abivajaja — нуждающийся']), { topic: ['toidujäätmed'] }), 2, 15),
      B.chart('062_d_chart', 'Kus läheb Eestis söödav toit raisku? (protsenti kogu raisatud toidust)', { kind: 'bar', unit: '%', series: '2020', rows: ['Kodud | 40', 'Kaubandus | 24', 'Põllud ja farmid | 23', 'Toitlustus | 9', 'Toidutööstus | 4'], source: 'SEI Tallinn ja Eesti Maaülikool (2021), Kliimaministeeriumi toidujäätmete tekke vältimise kava (2023)' }),
      B.text('062_d_text', 'Toit, mis ei pidanud prügikasti minema', 'Eestis tekib aastas umbes 127 kilogrammi toidujäätmeid iga elaniku kohta. Osa neist, näiteks luud ja koored, ei ole söödav, kuid ligi pool on toit, mis oleks võinud jõuda taldrikule. Selle väärtus on umbes 164 miljonit eurot aastas.\n\nUurijate sõnul ostame sageli soodustuste tõttu rohkem, kui jõuame ära süüa. Nagu moodulis 9 nägid, ajavad paljud segi kaks märgist: „parim enne” näitab kvaliteeti, „kõlblik kuni” aga ohutust. Selle tagajärjel läheb prügikasti ka toit, mis ei ole veel halvaks läinud.\n\nOsa toidust saab päästa: poed annetavad ülejäägi Toidupangale ja tänu sellele jõuab see abivajajateni — 2025. aastal umbes neli miljonit kilogrammi.\n\n*Allikas: Kliimaministeerium (2023); Põllumajandus- ja Toiduamet; ERR (2026).*'),
      teach(tag(purpose(B.table('062_d_facts', 'Märkmed kokkuvõtte jaoks.', 'Vasta joonise ja teksti järgi 1–3 sõna või arvuga. Need on sinu kodutöö laused.', 'Küsimus, Vastus', [
        'Kus raisatakse joonise järgi Eestis kõige rohkem söödavat toitu? | [kodudes/kodus/kodudes, 40 %/kodud]',
        'Mitme protsendipunkti võrra on kodude osa suurem kui kaubanduse osa? | [16/16 võrra/kuueteistkümne]',
        'Mitu korda suurem on põldude ja farmide osa kui toidutööstuse osa? | [umbes kuus korda/kuus korda/6 korda/umbes 6 korda/kuus]',
        'Kui palju toidujäätmeid tekib aastas ühe Eesti elaniku kohta? | [127 kilogrammi/127 kg/127]',
        'Mille tõttu ostame uurijate sõnul rohkem, kui jõuame ära süüa? | [soodustuste tõttu/soodustuste/soodustused]',
        'Kumb kuupäev näitab ohutust ja keelab toitu pärast seda süüa? | [kõlblik kuni/„kõlblik kuni”]',
        'Kui palju poodide ülejääki jõudis 2025. aastal Toidupanga kaudu abivajajateni? | [neli miljonit kilogrammi/4 miljonit kg/neli miljonit kg/4 miljonit kilogrammi/4 000 000 kg]',
      ], 'g_read'), 'Täpsed märkmed annavad sinu kokkuvõttele õiged arvud ja põhjused.'), { task: 'R15' }),
      'Küsi pärast iga vastust: „Kust sa seda näed — jooniselt või tekstist?” Read 2 ja 3 on võrdlused (40 ja 24, 23 ja 4): need on kodus kokkuvõtte laused. Lõpus: „Kas sinu oletus tunni alguses oli õige?” Selgita „parim enne” ja „kõlblik kuni” vahe ka suuliselt: hakkliha pärast „kõlblik kuni” — ainult ära visata.'),
    ],
    practice: [
      station(B.notice('062_p_notice', 'Märka: soodustuste tõttu, tänu Toidupangale', [
        'Tekstist: ostame **soodustuste tõttu** rohkem · **selle tagajärjel** läheb prügikasti ka toit, mis ei ole veel halvaks läinud · **tänu sellele** jõuab ülejääk abivajajateni',
        '**Põhjus nimisõnana** (kirjakeeles lühem kui kuna-lause): **omastav + tõttu**: halva ilma tõttu, soodustuste tõttu · **tänu + alaleütlev**: tänu naabritele, tänu poodidele, kes toitu annetavad (hea põhjus).',
        'Võrdle: **Kuna** tuli torm, jäi laev sadamasse. → **Tormi tõttu** jäi laev sadamasse.',
        '**Tagajärg uues lauses**: **seetõttu**, **selle tagajärjel**, **seega** + tegusõna kohe järgmisena: Selle tagajärjel **läheb** toit raisku. · **Samas lauses**: …, **mistõttu** toit läks halvaks.',
        'Hea põhjuse kohta ütle **tänu**, mitte tõttu: **Tänu naabrile** sain haigena sooja toitu (mitte: naabri tõttu …).',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('062_p_cause', 'Kokkuvõtte laused lühemaks.', 'Kirjuta lause ümber nii, et põhjus on nimisõna (tõttu või tänu) või tagajärg algab antud sõnaga. Alusta antud sõnadega.', [
        ['Kuna poes oli soodustus, ostsin kolm kotti kartuleid.', 'Soodustuse …', 'Soodustuse tõttu ostsin kolm kotti kartuleid.|Soodustuse tõttu ostsin ma kolm kotti kartuleid.'],
        ['Kuna ilm oli kuum, läks piim halvaks.', 'Kuuma ilma …', 'Kuuma ilma tõttu läks piim halvaks.'],
        ['Toidupank aitab, seepärast saavad abivajajad süüa.', 'Tänu …', 'Tänu Toidupangale saavad abivajajad süüa.'],
        ['Me tegime ostunimekirja, seepärast viskasime vähem ära.', 'Tänu …', 'Tänu ostunimekirjale viskasime vähem ära.|Tänu ostunimekirjale viskasime me vähem ära.|Tänu ostunimekirjale viskasime vähem toitu ära.'],
        ['Inimesed ei mõista märgiseid. Tagajärg: söödav toit läheb prügikasti.', 'Selle tagajärjel …', 'Selle tagajärjel läheb söödav toit prügikasti.'],
        ['Külmkapp läks katki. Toit riknes.', '…, mistõttu …', 'Külmkapp läks katki, mistõttu toit riknes.|Külmkapp läks katki, mistõttu toit läks halvaks.'],
        ['Kodudes raisatakse kõige rohkem. Kodudest tuleks alustada.', 'Seetõttu …', 'Seetõttu tuleks alustada kodudest.|Seetõttu tuleks kodudest alustada.'],
      ], 'full', 'g_notice'), 'Kokkuvõttes on lühike põhjus nimisõnana täpsem kui pikk kuna-lause.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Kas põhjus on hea või halb? Kas siia sobib tõttu või tänu?” Ridadel 5 ja 7: pärast selle tagajärjel ja seetõttu tuleb tegusõna kohe (läheb, tuleks).'),
    ],
    transfer: [
      station(tag(purpose(B.listening('062_t_voice', 'Korterikaaslase häälsõnum.', 'Korterikaaslane Kristo nägi joonist sinu külmkapi uksel ja saatis häälsõnumi. Kuula kaks korda ja kirjuta igasse lünka 1–2 sõna.', [
        'Kristo: Tere! Nägin, et panid külmkapi uksele mingi joonise toidu raiskamisest. Ausalt öeldes ei usu ma, et see meid puudutab, sest meie ei viska ju peaaegu midagi ära.',
        'Okei, eelmisel nädalal läks prügikasti pool pätsi leiba, sest see hakkas hallitama. Ja purk hapukoort, mille „kõlblik kuni” kuupäev oli pühapäeval. Ma ei julgenud seda esmaspäeval enam süüa.',
        'Eile ostsin poest kolm pakki jogurtit, sest need olid soodushinnaga, ja nüüd ei mahu külmkappi enam midagi. Mu ema ütleb alati, et tema noorusajal ei visatud midagi ära. Aga temal oli aega iga päev süüa teha, mina töötan vahetustega ja ostan seda, mis on parajasti soodne.',
        'Väidetavalt viskavad kõige rohkem toitu ära hoopis poed, mitte kodud. Kui sul on mõni hea mõte, kuidas me vähem ära viskaksime, siis räägi. Ainult ära palu mul iga päev süüa teha! Räägime õhtul, kui ma koju jõuan. Mul on täna vahetus kella kümneni.',
      ], [
        'Kristo arvab, et toidu raiskamise joonis ei puuduta nende [kodu|korterit|kööki].',
        'Eelmisel nädalal läks nende köögis prügikasti pool pätsi [leiba].',
        'Leib läks prügikasti, sest see oli hakanud [hallitama].',
        'Hapukoore „kõlblik kuni” kuupäev oli [pühapäeval|pühapäev].',
        'Kristo ostis eile soodushinnaga kolm pakki [jogurtit].',
        'Kristo arvab, et kõige rohkem toitu viskavad ära hoopis [poed|kauplused].',
      ], 'g_read'), 'Kuuled, mida korterikaaslane tegelikult arvab ja mida ta ära viskas — see on sinu jutu alus.'), { task: 'L07' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('062_t_explain', 'Selgita joonist kahtlejale.', 'Sinu korterikaaslane (või pereliige) ei usu, et ka teie kodus raisatakse toitu. Selgita joonist, teksti ja tema enda häälsõnumit nii, et ta muudab oma arvamust.',
        'Olukord: Kristo tuli koju; külmkapi uksel on joonis „Kus läheb Eestis söödav toit raisku?”. Ta ütleb: „Meie küll midagi ära ei viska.”\nSinu eesmärk: selgita kolm fakti joonisest ja tekstist, ütle kaks põhjust (tõttu, tänu) ja paku üks muudatus teie köögis.\nPiirang: ära moraliseeri — räägi numbritest ja oma kogemusest.',
        'Kahtleja kaart on õpetajal: tema kolm vastuväidet.',
        ['Jooniselt on näha, et kõige suurem osa …', 'Kodude osa on … võrra suurem kui …', 'Soodustuste tõttu …', 'Selle tagajärjel …', 'Mis oleks, kui me …?', 'Üleliigse toidu võiksime annetada …'], ['Meie küll ei viska!', 'See on ju ainult natuke.', 'Väidetavalt viskavad kõige rohkem poed!']), 'Tulemus: kahtleja näeb, et numbrid puudutavad ka teie kööki, ja te lepite kokku ühe muudatuse.'), { task: 'S13', level: 4 }),
      'Õpetaja kaart (korterikaaslane Kristo). Vastuväited ükshaaval: 1) „Meie küll midagi ära ei viska.” (Õpilane teab häälsõnumist: leib, hapukoor, kolm pakki jogurtit soodushinnaga.) 2) „127 kilo on ju aastas, see on natuke.” (127 kg ≈ 2,4 kg nädalas.) 3) „Väidetavalt viskavad kõige rohkem poed!” (Joonis: kodud 40 %, kaubandus 24 %.) Õnnestunud, kui õpilane nimetab kolm fakti joonisest või tekstist koos võrdlusega, kasutab vähemalt kaks põhjuse või tagajärje väljendit (tõttu, tänu, selle tagajärjel, mistõttu) ja te lepite kokku ühe muudatuse (ostunimekiri, sügavkülmik, ülejääkide õhtu). Viimased 3 minutit: õpilane paneb plaani kirja (joonis → kaks põhjust → kommentaar → järeldus) ja kirjutab kaks esimest lauset.'),
      extension(teach(tag(purpose(B.speaking('062_t_more', 'Mäng: külmkapp enne puhkust', 'Homme sõidad nädalaks ära. Õpetaja ütleb, mis külmkapis on. Otsusta iga asja kohta: söön täna, külmutan, annan abivajajale või naabrile või viskan ära — ja põhjenda.', [
        'Mida teed iga asjaga ja miks?',
        'Milline otsus oli kõige raskem?',
      ], [120, 180], ['… tõttu panen selle …', 'Tänu sügavkülmikule …', '„Parim enne” tähendab, et …', 'Seetõttu annan selle …']), 'Mäng näitab, et iga otsus on valik mugavuse, raha ja keskkonna vahel.'), { task: 'S12', level: 4 }),
      'Kui aega jääb (12 min). Loe ette 6 asja: hapukoor (kõlblik kuni homme), leib (parim enne eile), hakkliha (kõlblik kuni täna), pool kotti porgandeid, avatud moosipurk, kolm banaani. Punkt iga õige otsuse eest koos põhjusega (tõttu / tänu / seetõttu). Hakkliha pärast „kõlblik kuni” kuupäeva — ainult ära visata; kui õpilane eksib, viita „Kas teadsid?” kastile.'), 12),
      tag(exitCheck(purpose(B.gaps('062_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Kogu nädala kestnud kuuma ilma [tõttu] läks meie külmkapis halvaks ka piim, mille „kõlblik kuni” oli alles homme.',
        'Tänu [Toidupangale] said eelmisel talvel sajad abivajajad poodide ülejäägist sooja toitu. (Toidupank)',
        'Peo jaoks ostsime liiga palju süüa, [mistõttu] pool söödavast salatist läks hommikul prügikasti.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas põhjus ja tagajärg nimisõna ja sidesõnaga on käes.')), {}),
      purpose(B.selfcheck('062_t_self', ['Ma räägin, mida minu kodus ära visatakse ja miks.', 'Ma loen joonist ja teksti ning võrdlen arve (kaks korda, … võrra).', 'Ma väljendan põhjust nimisõnaga: soodustuste tõttu, tänu Toidupangale, selle tagajärjel.', 'Ma selgitan andmeid inimesele, kes neid ei usu.'], 'Andmed loetud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('062_t_summary', 'Kodus: kokkuvõte andmetest ja sinu kommentaar.', 'Kodus 180–200 sõna. Plaan: mida joonis näitab (kaks võrdlust) → kaks põhjust → sinu kommentaar → järeldus. Kasuta kolme põhjuse või tagajärje väljendit.', [14, 18], ['joonisel', 'tõttu', 'tänu', 'selle tagajärjel', 'minu arvates'], 3, 'g_use'), 'Sinu kokkuvõte näitab, et oskad andmeid lugeda ja neid oma eluga siduda.')), { task: 'W15', main: true, level: 4, harno: 'W2a' }),
      tag(homeTask(purpose(B.speaking('062_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks muudatus, mida sa oma köögis järgmisel nädalal proovid, ja miks.', [
        'Mis sinu kodus kõige sagedamini raisku läheb ja mille tõttu?',
        'Mida sa teed teisiti ja mis selle tagajärjel muutub?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja küsib järgmises tunnis, kuidas läks.')), { task: 'S15' }),
      homework('062_t_homework', ['1. Kokkuvõte andmetest, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-063': {
    title: 'Põlevkivielekter lõpeb: millest elab Ida-Virumaa 2035. aastal?',
    phases: grammar('Keel: -mine-nimisõna ja võrdlus — elektri tootmine, töökohtade kadumine, tehaste ehitamiseks; … võrra kõrgem, kaks korda rohkem kui'),
    format: 'debate',
    topic: 'work',
    canDo: 'Ma saan kuuldust aru raadioarutelust põlevkivist loobumise üle, räägin -mine-nimisõnade ja arvude võrdlusega (töökohtade kadumine, 4,5 protsendipunkti võrra kõrgem) ning jõuan argumendikaartidega arutelus ühise seisukohani, mida Ida-Virumaa üleminekus kõigepealt teha.',
    teacherPage: {
      goal: 'Дебаты: конец сланцевой электроэнергии и справедливый переход Ида-Вирумаа; радио двух гостей, -mine и сравнение чисел, общая позиция по карточкам (S17).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 2 — радио дважды, только 4 первых утверждения; станция 3 — правило и 4 пропуска; станция 4 — один раунд дебатов без карточки нового условия.',
      hook: '«Эстония решила прекратить производство электричества из сланца к 2035 году. Это слишком рано, вовремя или слишком поздно? Голосуй и назови одну причину.» Голосуйте оба, вы — последним. Не спорьте с выбором ученика: спор будет на станции 4.',
      plan: [
        '0–3: крючок — голосование: 2035 — рано, вовремя или поздно?',
        '3–10: станция 1 — разговор: энергетика и работа в моей жизни и в моём городе',
        '10–25: станция 2 — слова (2 мин), прогноз пропусков, радиодискуссия дважды, 8 пропусков (L3); «Kas teadsid?» о фонде справедливого перехода',
        '25–37: станция 3 — заметить в радио -mine и võrra → правило → 7 пропусков',
        '37–52: станция 4 — 3 минуты: факт, мнение или обещание (6 фраз); карточки аргументов A и B, дебаты 8 минут, повторное голосование, общая позиция',
        '52–64: «Kui aega jääb» — ролевая игра у консультанта Töötukassa: что я умею и чему научусь',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: ответ другу из Нарвы 160–180 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио (тексты свои, гости вымышленные — Reet Laur, Sergei Ivanov): Европейская комиссия, представительство в Эстонии (10.10.2022): 354 млн € на отказ от сланца в энергетике Ида-Вирумаа, цель — прекратить производство электроэнергии из сланца к 2035 г. и использование сланца в энергетике к 2040 г.; ERR, «Ida-Virumaal peetakse õiglase ülemineku fondi mõju regioonile kasulikuks» (04.01.2026): 340 млн € (≈ 353 млн с техпомощью), магнитный завод в Нарве, бизнес-парки — до 2000 новых рабочих мест, критика (Teet Kuusmik, Ahti Asmann); Kutsekoda/OSKA (19.02.2026): в сланцевом секторе ≈ 4000 работников из ≈ 44 000 занятых в Ида-Вирумаа (IV кв. 2024); Statistikaamet через ERR: безработица I кв. 2026 — Ида-Вирумаа 11,6 %, Эстония 7,1 %. Цена выбросов CO₂ в ЕС делает сланцевую электроэнергию дорогой (EU ETS).',
      groups: 'Радио — каждый сам, сверка в паре. Дебаты: в группе две команды (A и B) по 1–2 человека, вы ведёте время и голосование; в 1:1 ученик выбирает карточку, вы — другая сторона, во втором раунде меняетесь.',
      errors: [
        '«Elektri tootma lõpeb» → «Elektri tootmine lõpeb» (процесс как подлежащее — -mine).',
        '«Ma kardan töökohad kadumine» → «… töökohtade kadumist» (объект при -mine — в родительном; kartma + osastav).',
        '«4,5 protsenti kõrgem» → «4,5 protsendipunkti võrra kõrgem» (разница процентов — protsendipunkt; на сколько — võrra).',
        '«Kaks korda rohkem kui …» — правильно; «kaks korda suurem» тоже; но не «kaks korda rohkem nagu …» (сравнение — kui).',
      ],
      notes: [
        'Формат — дебаты с голосованием в начале и в конце. Тема может быть личной: у ученика из Нарвы или Кохтла-Ярве в сланцевом секторе могут работать он сам, муж, отец. Поэтому обе карточки уважительны, никто не «за закрытие любой ценой»; в начале скажите: «Мы спорим о порядке шагов, а не о людях».',
        'Ученику не из Ида-Вирумаа — тот же вопрос о своём крае (закрылся завод, уехали люди); студенту — где он будет работать после учёбы; пенсионеру — дети и внуки, которые уехали или остались; маме в декрете — садик и школа, если семьи уезжают.',
        'Обратная связь, 2–3 цели: -mine-существительное с родительным объектом (töökohtade kadumine); võrra / korda / kui при сравнении чисел; аргумент + пример + вывод, а не лозунг.',
      ],
    },
    discover: [
      station(B.text('063_d_hook', 'Hääleta', 'Eesti on otsustanud lõpetada põlevkivist elektri tootmise 2035. aastaks. Kas see on sinu arvates liiga vara, õigel ajal või liiga hilja? Hääleta kohe ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('063_d_talk', 'Energia ja töö minu elus.', 'Vasta ja too näide. Võid rääkida oma, tuttava või väljamõeldud loo.', [
        'Kas keegi sinu tuttavatest töötab energeetikas või tehases?',
        'Kust tuleb sinu kodu elekter ja soojus?',
        'Miks noored jäävad kodulinna või lahkuvad sealt?',
      ], [150, 210], ['Minu tuttav töötab …', 'Ma arvan, et meie elekter …', 'Noored lahkuvad, sest …']), 'Sinu linn ja tuttavad on arutelu esimene näide.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise. Kui õpilase pere töötab sektoris, ära küsi palka ega koondamise üksikasju; ütle: „Räägime piirkonnast, mitte sinu perest, kui sa nii eelistad.” Lõpus ütle üks sõna, mida õpilane vajas (kaevandus, elektrijaam, koondama).')),
      station(tag(B.vocab('063_d_vocab', 'Enne kuulamist: sõnad.', ['põlevkivi — горючий сланец', 'kaevandus — шахта (карьер)', 'tööstus — промышленность', 'heitmed — выбросы', 'töökoht — рабочее место', 'töötus — безработица', 'koondama — сокращать (работников)', 'ümberõpe — переобучение', 'üleminek — переход', 'õiglane — справедливый']), { topic: ['põlevkivi', 'üleminek'] }), 2, 15),
      teach(tag(purpose(B.listening('063_d_radio', 'Raadioarutelu: Ida-Virumaa pärast põlevkivi.', 'Enne kuulamist arva, mis lünka tuleb. Kuula arutelu kaks korda ja kirjuta igasse lünka 1–2 sõna.', RADIO_063, [
        'Reet Lauri sõnul on põlevkivist elektri tootmine muutunud heitmete hinna tõttu väga [kalliks].',
        'Sergei sõnul kaob koos töökohtadega ka põhjus, miks [noored] peaksid Ida-Virumaale jääma.',
        'Põlevkivisektoris töötab praegu kokku umbes [neli tuhat|4000|neli tuhat inimest] inimest.',
        'Eesti saab Euroopa Liidu õiglase ülemineku [fondist] umbes kolmsada nelikümmend miljonit eurot.',
        'Narvas avati 2025. aastal haruldaste muldmetallide [magnetite] tehas.',
        'Ettevõtlusparkidesse võib Reet Lauri sõnul tulla lähiaastatel kuni [kaks tuhat|2000] uut töökohta.',
        'Sergei arvates on kahe tuhande töökoha arv praegu alles lubadus, mitte [tööleping|leping].',
        'Reet Lauri sõnul peab kaevurite [ümberõpe] algama juba enne koondamist, mitte pärast seda.',
      ], 'g_read'), 'Kuuled mõlemat poolt ja saad arvud ja argumendid, mida arutelus kasutad.'), { voice: 'interview', task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos pliiatsiga; 2) esimene kuulamine — „Mis on kummagi külalise peamine mure?”; 3) teine — lüngad; 4) detail: „Mis arvud olid 11,6 ja 7,1?”; 5) üks lause: „Kumma argument oli sinu jaoks tugevam ja miks?” Kui õpilane on Ida-Virumaalt, küsi: „Kas raadio kirjeldas sinu linna õigesti?”'),
      B.know('063_d_know', ['Õiglase ülemineku fond on Euroopa Liidu fond piirkondadele, kus kliimapoliitika tõttu kaovad vanad tööstused. Eesti saab sellest umbes 340 miljonit eurot, peamiselt Ida-Virumaale — elaniku kohta rohkem kui ükski teine liikmesriik. Raha eest ehitatakse ettevõtlusparke, toetatakse uusi tehaseid, näiteks Narva magnetitehast, ja inimeste ümberõpet. Kriitikute sõnul on otsused olnud aeglased ja mitu suurt projekti on jäänud paberile.'], 'ERR, „Ida-Virumaal peetakse õiglase ülemineku fondi mõju regioonile kasulikuks” (04.01.2026); Euroopa Komisjoni esindus Eestis (10.10.2022)', 'Kas teadsid? Õiglase ülemineku fond'),
    ],
    practice: [
      station(B.notice('063_p_notice', 'Märka: tootmine lõpeb, ehitamine võtab aega', [
        'Raadiost: põlevkivist elektri **tootmine** lõpeb · tehaste **ehitamine** võtab aega · ümberõpe peab algama enne **koondamist**',
        '**-mine** teeb tegusõnast tegevuse nime: tootma → **tootmine**, ehitama → **ehitamine**. Sihitis tuleb ette **omastavas**: **tehaste** ehitamine, **palkade** maksmine, **noorte** kolimine.',
        '-mine käändub nagu nimisõna: kardan hindade **tõusmist** · raha maja **soojustamiseks** · räägime **kolimisest** · enne **koondamist**.',
        '**Arvude võrdlus**: 11,6 % on **4,5 protsendipunkti võrra** kõrgem kui 7,1 % (vahe) · uus kursus kestab **kaks korda kauem kui** vana (mitu korda) · **võrreldes** Eesti keskmisega on töötus kõrgem.',
        'Miks see on tähtis: arutelus ja kirjas teeb -mine lause lühemaks ja ametlikumaks: „Kui palgad kasvavad, …” → „Palkade **kasvamise** korral …”',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('063_p_mine', 'Märkmed arutelu jaoks.', 'Kirjuta sulgudes olev tegusõna -mine-nimisõnana õiges vormis või lünka sobiv võrdluse sõna.', [
        'Vanade elektrijaamade [sulgemine] on riigi otsus, mitte ühe linna või inimese valik. (sulgema)',
        'Paljud Narva ja Kohtla-Järve elanikud kardavad eelkõige hästi makstud töökohtade [kadumist]. (kaduma)',
        'Uue tehase [avamine] andis paljudele Narva noortele lootust, et kodulinnas on tulevikku. (avama)',
        'Töötukassa võib koondatud töötajale maksta uue eriala [õppimise] eest. (õppima)',
        'Ida-Virumaal on töötuse määr 4,5 protsendipunkti [võrra] kõrgem kui Eestis keskmiselt.',
        'Põlevkivi [kaevandamise] lõpp muudab mõne aastaga kogu piirkonna elu. (kaevandama)',
        'Noorte [lahkumise] vältimiseks on piirkonnas vaja häid töökohti ja koole. (lahkuma)',
      ], '', 'full', 'g_notice'), 'Täpsed märkmed annavad sulle arutelus lühikesed ja tugevad laused.'), { task: 'G03' }),
      'Pärast iga rida küsi: „Kes mida teeb? Mis on tegevuse nimi ja mis kääne siia sobib?” Rida 2: kartma + osastav (kadumist); rida 4: maksma mille eest (õppimise eest); rida 7: milleks? → vältimiseks, kelle lahkumise.'),
    ],
    transfer: [
      station(teach(tag(purpose(B.choice('063_t_facts', 'Enne arutelu: fakt, arvamus või lubadus?', 'Neid lauseid kuuled Ida-Virumaa üleminekust raadios ja sotsiaalmeedias. Otsusta iga lause kohta, mis see on.', [
        ['„Eesti saab Euroopa Liidu õiglase ülemineku fondist umbes 340 miljonit eurot.”', 'fakt, mida saab allikast kontrollida', 'arvamus', 'lubadus või plaan'],
        ['„Narva ettevõtlusparkidesse tuleb lähiaastatel kuni kaks tuhat uut töökohta.”', 'lubadus või plaan', 'fakt, mida saab allikast kontrollida', 'arvamus'],
        ['„Ida-Virumaa noored kolivad niikuinii kõik Tallinnasse või Soome.”', 'arvamus', 'fakt, mida saab allikast kontrollida', 'lubadus või plaan'],
        ['„Töötuse määr oli Ida-Virumaal 2026. aasta esimeses kvartalis 11,6 protsenti.”', 'fakt, mida saab allikast kontrollida', 'arvamus', 'lubadus või plaan'],
        ['„Kogu see fond on lihtsalt Euroopa raha raiskamine ja keegi ei saa sellest kasu.”', 'arvamus', 'fakt, mida saab allikast kontrollida', 'lubadus või plaan'],
        ['„Põlevkivist elektri tootmine lõpetatakse Eestis 2035. aastaks.”', 'lubadus või plaan', 'arvamus', 'fakt, mida saab allikast kontrollida'],
      ], 'full', 'g_read'), 'Arutelus kaalub tõendiga fakt usaldusväärsest allikast rohkem kui arvamus; lubadusele küsi tähtaega.'), { task: 'R02' }),
      'Pärast iga lauset küsi: „Kuidas sa seda kontrolliksid?” Rida 2 ja 6: tulevik — need on plaanid, mitte veel faktid (kuigi 2035 on riigi otsus). Rida 3 ja 5: üldistus „kõik”, „keegi ei” — arvamuse tunnus. Kasuta 3 minutit, siis arutelu.'), 4, 15, { final: 'decide' }),
      teach(tag(purpose(B.rolecards('063_t_debate', 'Arutelu: mida Ida-Virumaa üleminekus kõigepealt teha?', 'Vali kaart A või B, ütle oma seisukoht ja kaks argumenti. Arutage 8 minutit ja jõudke ühise seisukohani: mis on esimene samm.',
        'Kaart A (kiiremini). Seisukoht: põlevkivielektri tootmine tuleb lõpetada kiiresti ja kogu raha suunata uutele tööstustele. Argumendid: heitmete hind teeb põlevkivielektri iga aastaga kallimaks; puhtam õhk on ka tervise küsimus; uued tööstused vähendavad piirkonna sõltuvust ühest maavarast; uued tehased (näiteks magnetitehas) vajavad töötajaid kohe. Lisa oma näide.',
        'Kaart B (järk-järgult). Seisukoht: jaamu ei tohi sulgeda enne, kui uued töökohad on päriselt olemas. Argumendid: sektoris töötab umbes 4000 inimest ja need on piirkonna parimad palgad; töötus on Ida-Virumaal juba 4,5 protsendipunkti võrra kõrgem kui Eestis keskmiselt; „kuni 2000 töökohta” on lubadus, mitte leping. Lisa oma näide.',
        ['Minu seisukoht on, et …', 'Esiteks …, teiseks …', 'Näiteks minu linnas …', 'Võrreldes … on …', 'Põlevkivi kaevandamise lõpp tähendab …'], ['Ma saan aru, aga …', 'Kas me võiksime kokku leppida, et …?', 'Mõlemale sobiks …', 'Meie ühine seisukoht on: …']), 'Tulemus: sina ja paariline nimetate ühe esimese sammu, mida mõlemad toetate — ja põhjendate seda numbritega.'), { task: 'S17', main: true, level: 4 }),
      'Õpetaja: alguses ja lõpus hääletus (liiga vara / õigel ajal / liiga hilja). Kui õpilane valis A, mängi B ja vastupidi. Teises voorus tõmba üks uudis: 1) „Uus tehas lükkas avamise kaks aastat edasi.” 2) „Elektri hind tõusis talvel kaks korda.” 3) „Narva kutsekool avab tasuta automaatikatehniku kursuse 200 inimesele.” Õnnestunud, kui õpilane esitab kaks argumenti koos näite või arvuga, kasutab vähemalt kolm -mine-nimisõna ja ühe arvude võrdluse ning te sõnastate ühise esimese sammu (näiteks: „Ümberõpe algab enne koondamist ja jaamad suletakse alles siis, kui …”).'),
      extension(teach(tag(purpose(B.speaking('063_t_more', 'Rollimäng: Töötukassa nõustaja juures', 'Sa oled 50-aastane elektrijaama töötaja (või sina ise oma praeguse tööga). Sinu töökoht kaob kahe aasta pärast. Räägi Töötukassa karjäärinõustajaga (õpetaja): mida sa oskad, mida tahaksid õppida ja mis sind hirmutab.', [
        'Millised sinu oskused on vajalikud ka uues töökohas?',
        'Mida sa tahaksid õppida ja kui kaua?',
        'Mida sa nõustajalt küsid?',
      ], [120, 180], ['Ma oskan …', 'Mind huvitaks … õppimine', 'Kui palju aega võtab koolitus?', 'Kas Töötukassa maksab koolituse eest?']), 'Kui oskad oma oskusi nimetada, on üleminek sinu enda plaan, mitte ainult uudis.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Sina oled nõustaja: küsi oskuste, keelte ja juhiluba kohta; paku kaks võimalust (automaatika kursus, keevitaja kutseeksam) ja ütle üks piirang (kursus on Jõhvis kolm korda nädalas). Õnnestunud, kui õpilane nimetab kolm oskust, ühe õppimise soovi -mine-nimisõnaga ja küsib kaks täpsustavat küsimust.'), 12),
      tag(exitCheck(purpose(B.gaps('063_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Täiskasvanuna uue eriala [õppimine] võtab aega, kuid avab uusi võimalusi. (õppima)',
        'Sel aastal on meie automaatikakursusel kümne inimese [võrra] rohkem õppijaid kui eelmisel aastal.',
        'Uues tehases on töötajaid peaaegu kaks [korda] rohkem kui vanas elektrijaamas.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas -mine-nimisõna ja arvude võrdlus on käes.')), {}),
      purpose(B.selfcheck('063_t_self', ['Ma räägin, kuidas energia ja töö on seotud minu linna või tuttavate eluga.', 'Ma saan raadioarutelust aru, mida kumbki pool arvab ja milliste arvudega.', 'Ma kasutan -mine-nimisõnu ja võrdlen arve: töökohtade kadumine, … võrra kõrgem, kaks korda rohkem.', 'Ma jõuan argumendikaartidega arutelus ühise seisukohani.'], 'Arutelu peetud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('063_t_letter', 'Kodus: vastus sõbrale Narvas.', 'Sõber kirjutas: „Mind koondatakse jaamast kahe aasta pärast. Kas kolida Tallinna või jääda Narva?” Kirjuta kodus talle 160–180 sõna: mida sa tema olukorrast mõistad, kaks fakti tunnist (arvude võrdlusega), mõlema valiku üks pluss ja üks miinus ning sinu nõuanne. Kasuta vähemalt kolme -mine-nimisõna.', 'Tere, …!', 'Sinu sõber\n(sinu nimi)', [160, 180]), 'Sõber saab sinult ausa nõu, mis põhineb faktidel, mitte kuulujuttudel.')), { task: 'W13', level: 4, harno: 'W1' }),
      tag(homeTask(purpose(B.speaking('063_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mis peaks sinu arvates juhtuma Ida-Virumaal (või sinu kodukohas) enne, kui vana tööstus lõpeb.', [
        'Mis on sinu arvates esimene samm ja miks?',
        'Milline arv või fakt toetab sinu mõtet?',
      ], [60, 120]), 'Õpetaja kuulab, kas su argument on selge ja -mine-nimisõnad õiged.')), { task: 'S15' }),
      homework('063_t_homework', ['1. Vastus sõbrale, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-064': {
    title: 'Toas on 30 kraadi: kas su kodu ja naabrid on kuumalaineks valmis?',
    phases: grammar('Keel: vastuväide ja järeleandmine — vaatamata kuumusele, vaatamata sellele, et …; küll …, kuid; ehkki; samas'),
    format: 'project',
    topic: 'health',
    canDo: 'Ma saan aru ilmahoiatusest ja ametite lühiteadetest, mida kuumalaine ajal teha, koostan naabritega trepikoja kuumaplaani ja kirjutan 180–200-sõnalise teksti „probleem → põhjused → lahendused → järeldus”, kus kasutan vastuväidet (vaatamata …, küll …, kuid, ehkki).',
    teacherPage: {
      goal: 'Мини-проект: план подъезда на время жары; пять объявлений один раз (L1), уступка B2 (vaatamata, küll … kuid, ehkki), продукт модуля «Minu kodu keskkonnaplaan».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — объявления можно включить второй раз, 3 вопроса; станция 3 — правило и 4 исправления; станция 4 — план подъезда устно без продукта модуля (продукт — дома).',
      hook: '«Июль, третий день подряд +30. Твоя соседка, ей 84, два дня не выходит и не берёт трубку. Что ты делаешь первым?» Ответьте оба. Правильного ответа нет, но в конце урока ученик будет знать, что делать (звонок, вода, прохлада, 112).',
      plan: [
        '0–3: крючок — соседке 84, жара, что делаю первым',
        '3–10: станция 1 — разговор: где мне жарко летом, как я охлаждаюсь, как было там, где я вырос',
        '10–25: станция 2 — слова (2 мин), прогноз, пять объявлений один раз (L1), 5 вопросов; «Kas teadsid?» об уровнях предупреждения',
        '25–37: станция 3 — заметить в объявлениях vaatamata / ehkki / küll … kuid → правило → 7 сообщений соседей исправить',
        '37–52: станция 4 — карточки соседей, план подъезда: кто, что, когда; начало «Minu kodu keskkonnaplaan»',
        '52–64: «Kui aega jääb» — ролевая игра: звонок 112 о соседке',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: текст «проблема → решения» 180–200 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Объявления (тексты свои): «Kuum ilm: kuidas see mõjutab suremust ja kuidas varajaste surmade arvu vähendada?» (Regions4Climate, klab.ee, 2024): предупреждения даёт Keskkonnaagentuur вместе с Päästeamet и Terviseamet; уровень 1 «ohtlik» — макс. ≥ 27 °C три дня и больше или средняя ≥ 20 °C, уровень 2 «väga ohtlik» — ≥ 30 °C / ≥ 25 °C; в пяти крупнейших городах в среднем более 36 преждевременных смертей в год; при ≥ 27 °C три дня смертность +14–17 %; в 1951–2021 волн жары стало как минимум вдвое больше; признаки теплового удара и первая помощь; советы (вода, без кофе и алкоголя, окна днём закрыты, связь с пожилыми). Прохладный зал в библиотеке — учебный пример (такие залы советует тот же документ: «jahutuskeskused»). Предупреждения: ilmateenistus.ee и приложение ILM+.',
      groups: 'Объявления — каждый сам, сверка в паре. Станция 4: группа — жители одного подъезда (каждый берёт карточку соседа, ученик — организатор); в 1:1 вы — старшая по дому, остальных соседей ученик представляет по карточкам.',
      errors: [
        '«Vaatamata kuumus» / «vaatamata kuumust» → «vaatamata kuumusele» (vaatamata + аллатив: чему вопреки).',
        '«Vaatamata sellest, et …» → «Vaatamata sellele, et …» (калька с «несмотря на то»).',
        '«Ehkki oli palav, aga …» → «Ehkki oli palav, ei …» (ehkki / kuigi без aga; главное предложение начинается с глагола).',
        '«Küll on kallis, aga …» — можно; в письменном тексте лучше «Konditsioneer on küll kallis, kuid …».',
      ],
      notes: [
        'Формат — проект: итог — план подъезда (кто проверяет соседку, где вода, кто звонит) и личный продукт модуля «Minu kodu keskkonnaplaan» из четырёх строк (уроки 61–64), с которым ученик выступит на контрольной 065.',
        'Ученику в частном доме — улица или соседи по даче; в общежитии — этаж; пенсионеру — он сам в группе риска: пусть план будет о нём и его соседях, без драматизма; маме — ребёнок до года тоже в группе риска; уставшему — работа на жаре (стройка, склад).',
        'Обратная связь, 2–3 цели: vaatamata + -le / vaatamata sellele, et; глагол сразу после уступительного придаточного; структура «проблема → причины → решения → вывод».',
      ],
    },
    discover: [
      station(B.text('064_d_hook', 'Mida sa teed esimesena?', 'Juuli, kolmas päev järjest 30 kraadi sooja. Sinu 84-aastane naaber ei ole kaks päeva õue tulnud ega vasta telefonile. Mida sa teed esimesena? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('064_d_talk', 'Kuumus minu elus.', 'Vasta ja too näide. Võid rääkida oma, tuttava või väljamõeldud kodust.', [
        'Kus on sul suvel kõige palavam: kodus, tööl või bussis?',
        'Kuidas sa ennast ja oma kodu jahutad?',
        'Kuidas tuldi kuumaga toime seal, kus sa üles kasvasid?',
      ], [150, 210], ['Kõige palavam on mul …', 'Ma jahutan … / Ma otsin varju …', 'Seal, kus ma üles kasvasin, …']), 'Sinu kodu ja töö on tunni projekti esimene näide.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise, kus sul suvel palav on. Ära paranda. Lõpus ütle üks sõna, mida õpilane vajas (palav, lämbe, tuulutama, ventilaator).')),
      station(tag(B.vocab('064_d_vocab', 'Enne kuulamist: sõnad.', ['kuumalaine — волна жары', 'hoiatus — предупреждение', 'riskirühm — группа риска', 'eakas — пожилой', 'vedelik — жидкость', 'kuumarabandus — тепловой удар', 'jahutama — охлаждать', 'vari — тень', 'kiirabi — скорая помощь', 'vaatamata — несмотря на']), { topic: ['kuumalaine', 'riskirühm'] }), 2, 15),
      teach(tag(purpose(B.examListen('064_d_clips', 'Viis lühikest teadet kuumalainest.', 'Loe enne küsimused läbi. Kuula viit teadet ainult üks kord nagu eksamil ja vali õige vastus. Allikad: Keskkonnaagentuur, Terviseamet, Päästeamet; uuring Regions4Climate (2024).', 'choice', [
        '1. Riigi ilmateenistus annab kuumahoiatuse. Homsest kuni reedeni tõuseb õhutemperatuur Ida- ja Lõuna-Eestis kahekümne kaheksa kuni kolmekümne ühe kraadini. Kuna kuum ilm kestab vähemalt kolm päeva, on tegemist esimese taseme ehk ohtliku kuumaga. Ehkki öösel läheb veidi jahedamaks, ei lange temperatuur linnades alla kahekümne kraadi. Hoiatusi saab jälgida ilmateenistuse kodulehel ja riiklikus ilmaäpis.',
        '2. Terviseamet tuletab meelde: kuuma ilmaga joo regulaarselt vett, ka siis, kui janu ei ole. Väldi kohvi ja alkoholi, sest need viivad kehast vedelikku välja. Hoia päeval aknad ja kardinad kinni ning tuuluta tube öösel. Ära tee sporti kõige kuumemal ajal: kuumarabandus võib tabada ka väga heas vormis inimest.',
        '3. Linnavalitsus teatab: kuumalaine ajal on keskraamatukogu esimese korruse jahe saal avatud kõigile iga päev kella kümnest kaheksani. Saal on küll väike, kuid seal on joogivesi ja istekohad. Eakad, kes ei saa ise tulla, võivad helistada linna sotsiaalosakonda: vabatahtlikud toovad neile vett koju.',
        '4. Uuringu järgi sureb kuumalainete ajal Eesti viies suurimas linnas igal aastal keskmiselt üle kolmekümne kuue inimese varem, kui nad oleksid surnud. Kui temperatuur on kolm päeva järjest vähemalt kakskümmend seitse kraadi, suureneb suremus neliteist kuni seitseteist protsenti. Vaatamata põhjamaisele kliimale on kuumalaineid Eestis viimase seitsmekümne aastaga tulnud vähemalt kaks korda rohkem.',
        '5. Päästeamet palub: küsi kuumalaine ajal järele, kuidas läheb sinu eakal naabril või sugulasel. Kuumarabandus võib küll tunduda tavalise väsimusena, kuid see on eluohtlik. Kui inimese nahk on kuum ja kuiv, tal on tugev peavalu ja ta ei higista, vii ta jahedasse kohta, jahuta tema pead ja kaenlaaluseid märja rätikuga ning helista hädaabinumbrile üks-üks-kaks.',
      ], [
        ['Miks annab ilmateenistus selle nädala kuumast ilmast esimese taseme hoiatuse?', 'kuum ilm kestab vähemalt kolm päeva', 'temperatuur tõuseb üle 35 kraadi', 'öösel tuleb äike ja vihm'],
        ['Kus saab ilmateenistuse teate järgi kuumahoiatusi pidevalt jälgida?', 'ilmateenistuse kodulehel ja riiklikus ilmaäpis', 'ainult raadiouudistes', 'linnavalitsuse infotelefonil'],
        ['Mida soovitab Terviseamet kuuma ilmaga päeval oma kodus teha?', 'hoida aknad ja kardinad kinni', 'tuulutada tube keskpäeval', 'juua janu korral kohvi'],
        ['Kes saab linna teate järgi kuumalaine ajal vabatahtlikelt abi koju?', 'eakad, kes ei saa ise jahedasse saali tulla', 'kõik raamatukogu lugejad', 'ainult väikeste lastega pered'],
        ['Mis juhtub uuringu järgi, kui on kolm päeva järjest vähemalt 27 kraadi?', 'suremus suureneb 14–17 protsenti', 'suremus suureneb kaks korda', 'haiglad suletakse'],
        ['Mida tuleb Päästeameti järgi teha, kui eakal naabril on kuumarabanduse tunnused?', 'viia ta jahedasse, jahutada ja helistada 112', 'anda talle kohvi ja lasta magada', 'oodata, kuni ta hakkab higistama'],
      ], 'g_read', 1), 'Kui saad teadetest esimesel korral aru, tead kuumalaine ajal, mida teha.'), { voice: 'news', task: 'L01', harno: 'L1' }),
      'Eksaminurk (L1): eksamil kuuleb lühikesi teateid ainult üks kord. Enne kuulamist 1 minut küsimuste lugemiseks: „Mida sa igast teatest otsid?” Pärast: „Milline teade oli sinu jaoks kõige kasulikum?” Kui õpilane ei saanud aru, lase teist korda kuulata alles pärast vastamist — ja võrdle.'),
      B.know('064_d_know', ['Eestis on kuumal ilmal kaks hoiatustaset. Ohtlik kuum (1. tase): kõige kõrgem õhutemperatuur on vähemalt 27 kraadi kolm päeva järjest või ööpäeva keskmine vähemalt 20 kraadi. Väga ohtlik kuum (2. tase): vähemalt 30 kraadi või ööpäeva keskmine vähemalt 25 kraadi. Riskirühmas on eakad, väikesed lapsed, lapseootel naised ja kroonilised haiged. Hoiatusi annab Keskkonnaagentuur koos Päästeameti ja Terviseametiga; neid näeb ilmateenistuse kodulehel ja rakenduses ILM+.'], '„Kuum ilm: kuidas see mõjutab suremust ja kuidas varajaste surmade arvu vähendada?” (Regions4Climate, 2024)', 'Kas teadsid? Kaks kuumahoiatuse taset'),
    ],
    practice: [
      station(B.notice('064_p_notice', 'Märka: vaatamata kuumusele', [
        'Teadetest: **Ehkki** öösel läheb jahedamaks, **ei lange** temperatuur … · Saal on **küll** väike, **kuid** seal on vesi · **Vaatamata põhjamaisele kliimale** on kuumalaineid rohkem',
        '**vaatamata + alaleütlev** (millele?): vaatamata **kuumusele**, vaatamata **hoiatusele** (eakas naaber läks vaatamata hoiatusele õue) · terve lausega: **vaatamata sellele, et** oli palav, … (mitte: vaatamata sellest).',
        '**ehkki = kuigi** (moodul 5), kirjalikum: **Ehkki** ventilaator töötas, **ei saanud** laps magada. Pärast kõrvallauset on tegusõna kohe esimene; **aga** ei lisata.',
        '**küll …, kuid** näitab, et tunnistad teist poolt: Ventilaator **küll** jahutab, **kuid** vedelikku tuleb ikka juua. · Konditsioneer on **küll** kallis, **kuid** see päästab elu. · **samas** = teisalt: Linn on roheline. **Samas** on parke kesklinnas vähe.',
        'Tekstis „probleem → lahendus” aitab vastuväide näidata, et oled mõelnud ka teisele poolele: **Vaatamata sellele, et** riskirühm on suur, ei tea paljud kuumarabanduse tunnuseid. **Ehkki** öösel tuulutame, on päeval vaja ka vedelikku ja varju.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('064_p_fix', 'Naabrite sõnumid enne saatmist.', 'Naabrid kirjutavad maja vestlusesse kuumalainest. Igas sõnumis on üks viga: kirjuta sõnum õigesti.', [
        ['Vaatamata kuumus läksime pärastlõunal trenni.', 'Vaatamata kuumusele läksime pärastlõunal trenni.'],
        ['Vaatamata sellest, et hoiatati, jättis keegi lapse autosse.', 'Vaatamata sellele, et hoiatati, jättis keegi lapse autosse.'],
        ['Ehkki toas oli 30 kraadi, aga eakas proua Aino ei avanud aknaid.', 'Ehkki toas oli 30 kraadi, ei avanud eakas proua Aino aknaid.'],
        ['Vaatamata sellele, et oli palav, ta ei joonud päeval piisavalt vedelikku.', 'Vaatamata sellele, et oli palav, ei joonud ta päeval piisavalt vedelikku.'],
        ['Akende sulgema päeval aitab hoida tuba jahedana.', 'Akende sulgemine päeval aitab hoida tuba jahedana.'],
        ['Juulis muutub meie lõunapoolne korter väga palav.', 'Juulis muutub meie lõunapoolne korter väga palavaks.'],
        ['Kuumus tõttu ei saanud ma terve öö magada.', 'Kuumuse tõttu ei saanud ma terve öö magada.|Kuumuse tõttu ei saanud ma terve öö magada!'],
      ], 'full', 'g_notice'), 'Õige sõnum on selge ja rahulik — maja vestlus aitab, mitte ei tekita paanikat.'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis siin valesti on: kääne, sõnajärg või sõna?” Read 5–7 on varasematest tundidest: -mine (63), -ks (61), tõttu + omastav (62). Lisaküsimus: „Kirjuta üks oma lause: vaatamata …”'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('064_t_house', 'Sinu trepikoda kuumalaine ajal.', 'Loe naabrite kaarte. Mõtle iga inimese juurde: mis on tema risk ja mida ta vajab?', [
        ['Proua Aino (84), 5. korrus', ['elab üksi ja kõnnib kepiga', 'korter on lõunapoolne, eelmisel suvel oli toas 31 kraadi', 'telefoni ta sageli ei kuule'], []],
        ['Pere 8-kuuse lapsega, 2. korrus', ['laps magab päeval kaks korda', 'isa töötab päeval ehitusel õues'], []],
        ['Öövahetuses töötaja, 3. korrus', ['magab päeval kella üheksast neljani', 'aknad on hoovi poole'], []],
        ['Üliõpilane, 4. korrus', ['on suvel kodus, autot ei ole', 'tahab aidata, kui keegi palub'], []],
      ], '2', 'g_read'), 'Kaardid näitavad, kes on riskirühmas ja kes saab aidata.'), { task: 'R11', level: 3 }), 4, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('064_t_plan', 'Projekt: meie trepikoja kuumaplaan.', 'Sa korraldad oma trepikoja kuumaplaani. Lepi vanemaga (õpetaja) kokku: kes, mida ja millal teeb, kui tuleb kuumahoiatus.',
        'Olukord: ilmateenistus andis homseks esimese taseme kuumahoiatuse; sinu trepikojas elavad kaartidel olevad naabrid.\nSinu eesmärk: plaan, kus on vähemalt neli sammu (kes, mida, millal), ja üks lause igale naabrile, miks see talle oluline on.\nPiirang: maja vanem kahtleb — vasta talle vastuväitega (vaatamata …, küll …, kuid).',
        'Maja vanema kaart on õpetajal: tema kahtlused ja üks hea idee.',
        ['Ehkki hoiatus on alles homme, …', 'Proua Aino on riskirühmas, sest …', 'Öösel tuulutame trepikoda ja päeval …', 'Erilist tähelepanu vajab …', 'Õues püsime varjus ja kiirabi number on …', 'Igaühel peab olema piisavalt vedelikku: …', 'Üliõpilane võiks …', 'Vaatamata sellele, et …, on vaja …', 'Lepime kokku: …'], ['Igaüks vastutab ise enda eest!', 'Kas see ei ole liiga palju vaeva?', 'Mul on üks idee: …']), 'Tulemus: sinu trepikoja plaan neljast sammust, mille võid päriselt majja üles panna.'), { task: 'S12', level: 4 }),
      'Õpetaja kaart (maja vanem, 60). Kahtlused ükshaaval: 1) „Igaüks vastutab ise enda eest.” 2) „Proua Aino ei taha, et teda segatakse.” 3) „Kes kontrollib, et keegi midagi teeb?” Hea idee, kui õpilane küsib: trepikoja ukse kõrvale paberleht telefoninumbritega ja maja vestlusesse igapäevane „kõik korras?” sõnum kell 12. Õnnestunud, kui plaanis on neli sammu (kes, mida, millal), iga naabri risk on nimetatud, õpilane kasutab kaks vastuväite vormi (vaatamata …, küll …, kuid, ehkki) ja te lepite plaani kokku.'),
      tag(purpose(B.planning('064_t_product', 'Mooduli tulemus: minu kodu keskkonnaplaan.', 'Täida oma kodu plaan: igale reale üks lause tundidest 61–64. Sellest räägid mooduli kontrollis 1 minuti.', [
        'Prügi (tund 61): mis minu kodus muutub? Mis ei jää enam sorteerimata?',
        'Toit (tund 62): mille tõttu ma toitu raiskan ja mida teen teisiti?',
        'Energia ja töö (tund 63): mida ma arvan üleminekust ja milline arv mind veenis?',
        'Kuumus ja ohutus (tund 64): kuidas ma kodu jahutan ja kes minu ümber on riskirühmas? Üks lause sõnaga vaatamata.',
      ], 3), 'Plaan jääb sulle: see on sinu mooduli tulemus ja kontrolli sõnavõtu alus.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('064_t_more', 'Rollimäng: helista 112', 'Proua Aino on segaduses, nahk on kuum ja kuiv, ta ei higista — see võib olla kuumarabandus. Helista hädaabinumbrile 112 (õpetaja on häirekeskuse töötaja).', [
        'Mis on inimese seisund ja kui vana ta on?',
        'Mis on täpne aadress ja korrus?',
        'Mida sa oled juba teinud ja mida töötaja palub sul teha?',
      ], [120, 180], ['Helistan, sest minu naaber …', 'Aadress on …, viies korrus.', 'Ma viisin ta varju …', 'Kas kiirabi on juba teel?']), 'Selge kõne hädaabinumbrile võib päästa elu.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled häirekeskuse töötaja: küsi järjest — mis juhtus, aadress, kas hingab, kas on teadvusel, vanus. Anna juhis: „Jahutage pead ja kaenlaaluseid, ärge andke juua, kui ta on segaduses, jääge liinile.” Õnnestunud, kui õpilane ütleb aadressi ja seisundi kohe alguses, vastab lühidalt ja kordab juhise üle.'), 12),
      tag(exitCheck(purpose(B.gaps('064_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Vaatamata [kuumusele] läks eakas naaber, kes kuulub riskirühma, keskpäeval aeda kurke kastma. (kuumus)',
        'Vaatamata [sellele], et ilmateenistus hoiatas juba eile, ei olnud meie trepikojas keegi valmis.',
        'Ehkki aken oli terve öö lahti, [oli] lapse toas hommikul ikka 29 kraadi. (olema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas vastuväide (vaatamata, ehkki) on käes.')), {}),
      purpose(B.selfcheck('064_t_self', ['Ma räägin, kuidas ma kuumaga toime tulen.', 'Ma saan aru lühikestest teadetest kuumalaine kohta, isegi kui kuulen neid ainult üks kord.', 'Ma väljendan vastuväidet: vaatamata kuumusele, vaatamata sellele, et …; küll …, kuid; ehkki.', 'Ma koostan naabritega kuumaplaani: kes on riskirühmas, kuidas kodu jahutada ja mida teha kuumarabanduse korral.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('064_t_essay', 'Kodus: kuumalaine linnas — probleem ja lahendused.', 'Kodus 180–200 sõna maja või linna lehte: sissejuhatus, probleem (kellele kuumus on ohtlik), kaks põhjust, kaks lahendust, järeldus. Kasuta kahte vastuväite vormi (vaatamata, küll …, kuid, ehkki).', [14, 18], ['probleem', 'põhjus', 'lahendus', 'vaatamata', 'kokkuvõttes'], 3, 'g_use'), 'Sinu tekst aitab naabritel ja linnal järgmiseks suveks valmis olla.')), { task: 'W14', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('064_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma kodu keskkonnaplaani järgi: neli asja, mida sa teed, ja üks, mis on raske.', [
        'Mis on sinu plaanis kõige tähtsam ja miks?',
        'Mis on raske, ja miks sa seda vaatamata sellele teed?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('064_t_homework', ['1. Tekst „probleem ja lahendused”, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-065': {
    title: 'Kontroll 13 — keskkond ja vastutus',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 13, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 13, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 13, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid keskkonna ja vastutuse teemal, kirjutan maja juhatusele umbes 140-sõnalise kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma kodu keskkonnaplaanist; muutuse vormid, põhjus nimisõnaga, -mine-nimisõnad ja vastuväide on õiged.',
    // Kontroll 13 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2b; S1, S2). Own texts on the module's content: waste and the deposit (061),
    // food waste and the food bank (062), the energy transition (063), heat and neighbours (064), plus a village clean-up day
    // (talgupäev) and a house renovation as new material; timed by the Harno part headers (timeEstimate.js
    // harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('065_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('065_d_vocab', 'Tunnid 61–64: sõnad, mis aitavad', ['pandipakend — тара с залогом', 'biojäätmed — биоотходы', 'sorteerima — сортировать', 'raiskama — тратить впустую', 'söödav — съедобный', 'heitmed — выбросы', 'üleminek — переход', 'ümberõpe — переобучение', 'kuumalaine — волна жары', 'riskirühm — группа риска'], '2'), { topic: ['pandipakend', 'kuumalaine'] }),
      PART('065_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('065_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit vastutusest ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Mina või riik? Mõlemad', [
        '(A) Kui räägime keskkonnast, kuuleme sageli kahte vastandlikku mõtet. Üks ütleb, et iga pudel loeb ja muutus algab iseendast. Teine küsib, mida muudab üks pudel, kui elektrijaam paiskab õhku miljoneid tonne heitmeid. Mõlemas on tõtt, kuid kumbki üksi ei vii kuhugi. Kes usub ainult esimest, tunneb peagi süüd iga kilekoti pärast. Kes usub ainult teist, ei tee midagi ja ootab, et keegi teine probleemi lahendaks. Minu arvates ei ole küsimus selles, kas vastutab inimene või riik, vaid selles, kumb teeb mida.',
        '(B) Vaatame pandipakendit. Eestis tuuakse tagasi peaaegu üheksa pudelit ja purki kümnest. See ei juhtu sellepärast, et eestlased oleksid erakordselt keskkonnateadlikud. See juhtub tänu süsteemile: pant on väike, kuid tuntav, ja taaraautomaat on poes, kuhu me niikuinii läheme. Kui hea valik on lihtne, teeb enamik inimesi selle ilma pika mõtlemiseta. Sama süsteem toimib ka mitmes teises riigis, näiteks Soomes ja Saksamaal. Süsteemi lõi aga seadus, mitte üksikud ostjad, ja seda haldab organisatsioon, mille eest maksavad joogitootjad.',
        '(C) Teiste jäätmetega on lugu teine. Kodudes sorteeritakse vaid umbes 40 protsenti prügist ja paljud kardavad, et teevad valesti. Samas näitas Tallinna Haabersti katse, et kui maja juurde toodi pakendikonteiner, vähenes segaprügi hulk poole aastaga peaaegu viiendiku võrra. Inimesed ei muutunud paremaks. Sorteerimine muutus lihtsamaks. Kui konteiner on kaugel, jääb hea tahe sageli lihtsalt heaks tahteks. Seega on omavalitsuse ja korteriühistu ülesanne panna konteiner sinna, kus inimesed niikuinii käivad.',
        '(D) Toiduga on vastutus rohkem meie endi käes. Kõige suurem osa raisatud toidust tuleb Eestis kodudest: ostame liiga palju, unustame toidu külmkappi ega tee vahet kuupäevadel „parim enne” ja „kõlblik kuni”. Raisatud toit tähendab ka raisatud raha, vett ja energiat. Siiski ei saa unustada, et poe soodustused panevad meid ostma rohkem, kui jõuame ära süüa. Õiglane oleks, kui ka kaupmees vastutaks: paljud poed annavad müümata jäänud toidu juba Toidupangale, kuid seda võiks teha veel rohkem.',
        '(E) Energia puhul ei saa üks inimene peaaegu midagi otsustada. Kodanik ei sulge elektrijaama ega ehita uut tehast. Põlevkivist elektri tootmise lõpetamine on riigi otsus ja selle hinda maksavad kõigepealt Ida-Virumaa inimesed, kelle töökohad kaovad. Seepärast peab riik tagama, et üleminek oleks õiglane: ümberõpe algab enne koondamist, mitte pärast seda, ja uued töökohad tulevad samasse piirkonda. Õiglase ülemineku fond on hea algus, kuid raha üksi ei loo usaldust.',
        '(F) Kuumalainete puhul on rollid jällegi segatud. Kuumalaineid on viimastel aastakümnetel tulnud vähemalt kaks korda rohkem kui varem. Kliima soojenemist ei peata ükski maja üksi, kuid kuumuse tagajärgi saab vähendada väga lähedalt. Linn võib istutada puid, kasutada heledamat teekatet ja avada kuumalaine ajal jahedaid ruume. Kuid ainult naaber märkab, et viienda korruse eakas proua ei ole kaks päeva õue tulnud ega vasta telefonile. Ükski ametlik hoiatus ei asenda koputust tema uksele.',
        '(G) Seega ei ole õige küsimus „mina või riik”, vaid „mina ja riik”. Minu ülesanne on teha seda, mis on minu lähedal: tuua pudel tagasi, osta nimekirja järgi ja küsida naabrilt, kuidas ta end tunneb. Riigi, linna ja ettevõtete ülesanne on teha hea valik lihtsaks ja odavaks. Ja kui nad seda ei tee, on kodaniku ülesanne seda nõuda: kirjutada juhatusele, rääkida koosolekul ja valida inimesi, kes võtavad probleemi tõsiselt.',
        'Allikas: autori arvamus; faktid: Eesti Pandipakend (2026); ERR (24.03.2024); Kliimaministeerium, toidujäätmete tekke vältimise kava (2023); Euroopa Komisjon (2022); Regions4Climate (2024).',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Mina või riik? Mõlemad”?', 'vastutavad nii inimene kui ka riik|vastutus on jagatud|inimene teeb, mis on lähedal, riik teeb hea valiku lihtsaks'], ['Kuidas jagaksid sina vastutust: mida saad oma elus teha ise ja mida peaks tegema keegi teine? Miks?']]),
      tag(B.choice('065_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida arvab autor lõigu A järgi kahest vastandlikust lausest?', 'mõlemas on tõtt, kuid kumbki üksi ei vii kuhugi', 'esimene on õige, teine vale', 'teine on õige, esimene vale', 'mõlemad on valed'],
        ['Miks tuuakse lõigu B järgi pandipakendeid nii palju tagasi?', 'süsteem teeb tagasitoomise lihtsaks ja pant motiveerib', 'eestlased on teistest keskkonnateadlikumad', 'pant on väga suur', 'seadus karistab neid, kes pudeleid ei too'],
        ['Mida näitab lõigu C järgi Haabersti katse?', 'inimesed sorteerivad rohkem, kui see on lihtsam', 'inimesed muutusid paremaks', 'pakendikonteinerid on liiga kallid', 'segaprügi hulk ei muutunud'],
        ['Kelle vastutust toob autor lõigus D esile lisaks kodudele?', 'kaupmeeste oma', 'põllumeeste oma', 'Toidupanga oma', 'koolide oma'],
        ['Mida peab riik lõigu E järgi üleminekul tagama?', 'et ümberõpe algaks enne koondamist', 'et elektrijaamad töötaksid edasi', 'et kõik kolisid Tallinnasse', 'et elektri hind langeks'],
        ['Millise väitega oleks autor kõige tõenäolisemalt nõus?', 'inimene teeb seda, mis on lähedal, ja riik teeb hea valiku lihtsaks', 'keskkonna eest vastutab ainult riik', 'üks inimene ei saa midagi muuta', 'kodanik ei pea riigilt midagi nõudma'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('065_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Muutus ei tulnud inimeste iseloomust, vaid paremast korraldusest. | [C]',
        '2. Üksikinimene ei saa energiasüsteemi kohta otsustada. | [E]',
        '3. Ostlemist mõjutavad ka poe pakkumised. | [D]',
        '4. Tagasitoomise koht on seal, kus me igal juhul käime. | [B]',
        '5. Kui võim ei tee head valikut lihtsaks, võib kodanik seda nõuda. | [G]',
        '6. Ohus olevat inimest märkab kõige kiiremini keegi tema lähedal. | [F]',
        '7. Autor küsib, kes millise ülesande enda peale võtab. | [A]',
        '8. Muutuse hinda maksab kõige rohkem üks piirkond. | [E]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('065_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Elanik kirjutab korteriühistu juhatusele. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri juhatusele', [
        'Lugupeetud juhatus!',
        'Kirjutan teile meie maja prügimaja pärast. Viimasel ajal on segaprügi konteiner alati täis ja suur osa pakenditest jääb [sorteerimata] (sorteerima). Selle [tõttu] (põhjus, halb) maksame igal kuul prügiveo eest rohkem.',
        'Naabermajas tuli eelmisel aastal hoovi pakendikonteiner ja nende segaprügi hulk [vähenes] (väike, muutus minevikus). Ka meie hoov võiks muutuda [puhtamaks] (puhas, keskvõrre). Kui biojäätmed kogutakse eraldi, muutuvad need [kompostiks] (kompost).',
        '[Tänu] (hea põhjus) pandisüsteemile toovad paljud naabrid pudelid juba poodi tagasi. Konteinerite [paigaldamine] (paigaldama) ei ole kallis ja aitaks kõiki.',
        '[Vaatamata] (= kuigi) sellele, et mõned naabrid kardavad haisu, on biokonteiner suvel kaanega ja seda tühjendatakse sageli. Teen ettepaneku arutada konteinerite [tellimist] (tellima; arutama + osastav) järgmisel üldkoosolekul. Ootan teie [vastust] (vastus).',
        'Lugupidamisega\nkolmanda korruse elanik',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('065_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas meie küla talgupäeva korraldas', [
        'Eelmisel kevadel märkasime, et küla taga metsa servas on vana prügihunnik. [[Seal olid autorehvid, katkine külmkapp ja kümneid kilekotte.]]',
        'Vald ütles, et neil ei ole sel aastal koristamiseks raha. [[Siis otsustasime, et teeme selle ise ära.]]',
        'Panime talgupäeva kirja üleriigilisse talgukalendrisse ja kutsusime kogu küla. [[Mõne päevaga registreerus üle neljakümne inimese.]]',
        'Talgupäeva hommikul sadas vihma ja kartsime, et keegi ei tule. [[Vaatamata vihmale tulid kohale peaaegu kõik, ka lapsed ja vanavanemad.]]',
        'Kolme tunniga oli metsaserv puhas. [[Tänu vallale viidi prügi järgmisel päeval jäätmejaama.]]',
        'Pärast talguid sõime koos suppi ja leppisime kokku järgmise aasta plaani. [[Nüüd on talgupäev meie küla traditsioon.]]',
      ], ['Seepärast otsustasime prügi metsa jätta.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('065_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus? Kirjuta 3–4 lauset: üks autori mõte (autori sõnul …), sinu arvamus ja näide oma elust. Kasuta ühte vastuväite vormi (küll …, kuid; vaatamata).', [3, 4], ['autori sõnul', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('065_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('065_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundide 61–64 teemadel. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('065_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Naaber palus, et vaataksid tema sõnumid enne saatmist üle. Igas sõnumis on üks viga: kirjuta see õigesti.', [
        ['Meie hoovi biokonteineris muutuvad kartulikoored kahe kuuga kompost.', 'Meie hoovi biokonteineris muutuvad kartulikoored kahe kuuga kompostiks.'],
        ['Kahjuks jääb meie majas pool prügist ikka veel mitte sorteeritud.', 'Kahjuks jääb meie majas pool prügist ikka veel sorteerimata.'],
        ['Tänu Toidupank said meie linnaosas eelmisel talvel kakskümmend peret süüa.', 'Tänu Toidupangale said meie linnaosas eelmisel talvel kakskümmend peret süüa.'],
        ['Eelmisel kuul viskasime liiga palju ära. Seetõttu me ostame nüüd ainult nimekirja järgi.', 'Eelmisel kuul viskasime liiga palju ära. Seetõttu ostame me nüüd ainult nimekirja järgi.|Eelmisel kuul viskasime liiga palju ära. Seetõttu ostame nüüd ainult nimekirja järgi.'],
        ['Paljud Ida-Virumaa elanikud kardavad hästi makstud töökohad kadumine.', 'Paljud Ida-Virumaa elanikud kardavad hästi makstud töökohtade kadumist.'],
        ['Vaatamata kuumus läks meie eakas naaber keskpäeval aeda.', 'Vaatamata kuumusele läks meie eakas naaber keskpäeval aeda.'],
      ]),
      B.transformation('065_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti, alusta antud sõnadega.', [
        ['Kuna sadas tugevalt, jäi talgupäev ära.', 'Tugeva vihma …', 'Tugeva vihma tõttu jäi talgupäev ära.'],
        ['Pakendikonteiner tuli maja juurde. Segaprügi on nüüd vähem.', 'Segaprügi hulk …', 'Segaprügi hulk vähenes.|Segaprügi hulk on vähenenud.|Segaprügi hulk väheneb.'],
        ['Kui jaamad suletakse, kaovad töökohad.', 'Jaamade …', 'Jaamade sulgemine tähendab töökohtade kadumist.|Jaamade sulgemisel kaovad töökohad.|Jaamade sulgemise järel kaovad töökohad.'],
        ['Kuigi hoiatati, läks ta keskpäeval jooksma.', 'Vaatamata …', 'Vaatamata hoiatusele läks ta keskpäeval jooksma.|Vaatamata sellele, et hoiatati, läks ta keskpäeval jooksma.'],
        ['Toit, mida keegi ei söönud, läks prügikasti.', 'Toit jäi …', 'Toit jäi söömata.|Toit jäi söömata ja läks prügikasti.'],
        ['Konditsioneer on kallis. Aga see päästab elu.', '… küll …', 'Konditsioneer on küll kallis, kuid see päästab elu.|Konditsioneer on küll kallis, aga see päästab elu.|Konditsioneer küll on kallis, kuid see päästab elu.'],
      ]),
      PART('065_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('065_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet poe, jäätmejaama, Toidupanga ja linna elust, igaüht üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Lugupeetud kliendid! Meie poe taaraautomaat on remondis kuni neljapäevani. Pandipakendeid võtame sel ajal vastu infoleti juures, kuid korraga kõige rohkem kakskümmend pudelit või purki.',
        '2. Jäätmejaam teatab: laupäeval sõidab ohtlike jäätmete kogumisauto läbi viie küla. Auto juurde võib tuua vanu patareisid, värve ja ravimeid. Autorehve sel päeval vastu ei võeta.',
        '3. Toidupank otsib vabatahtlikke, kes aitaksid reedeti poodidest toitu kokku koguda. Vaja on juhiluba ja kahte vaba tundi pärastlõunal. Registreeruda saab telefoni teel.',
        '4. Linnavalitsus kutsub elanikke kevadistele puude istutamise talgutele. Talgud toimuvad pühapäeval kell kümme pargi läänepoolses osas. Labidad ja kindad on kohapeal, kaasa võtke ainult joogivesi.',
      ], [
        'Poe taaraautomaat on remondis ja töötab jälle alles pärast [neljapäeva|neljapäevast].',
        'Infoleti juures võetakse remondi ajal korraga vastu kuni [kakskümmend|20] pakendit.',
        'Ohtlike jäätmete kogumisauto juurde ei tohi laupäeval tuua vanu [autorehve|rehve].',
        'Toidupanga vabatahtlikul, kes kogub reedeti toitu, peab olema [juhiluba|juhtimisõigus].',
        'Kevadised puude istutamise talgud toimuvad pühapäeval pargi [läänepoolses] osas.',
        'Labidad ja kindad on kohapeal, talgutele tuleb kaasa võtta ainult [joogivesi|vesi].',
      ]),
      tag(B.listening('065_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime sellest, kuidas vana kortermaja muutub säästlikumaks. Stuudios on Tarvo Kask, kes juhib Narvas ühe viiekorruselise maja korteriühistut. Tarvo, millal teie maja renoveeriti?',
        'Tarvo: Kaks aastat tagasi. Maja on ehitatud 1974. aastal ja selles on kuuskümmend korterit.',
        'Saatejuht: Mis oli kõige suurem probleem?',
        'Tarvo: Talvel oli korterites külm, aga küttearved olid ikkagi suured. Soojus läks lihtsalt seinte ja vanade akende kaudu tänavale.',
        'Saatejuht: Mida te tegite?',
        'Tarvo: Soojustasime seinad ja katuse, vahetasime aknad ja paigaldasime uue ventilatsiooni. Töö kestis kaheksa kuud.',
        'Saatejuht: Kuidas te raha leidsite?',
        'Tarvo: Osa sellest tuli riigi renoveerimistoetusest, ülejäänu jaoks võtsime pangalaenu. Kõige raskem ei olnud raha, vaid inimeste veenmine. Esimesel koosolekul oli vastu peaaegu pool maja.',
        'Saatejuht: Ja mis neid veenis?',
        'Tarvo: Arvutus. Näitasime, kui palju igaüks laenu eest maksab ja kui palju küttelt säästab. Pärast renoveerimist kulub meie majal küttele umbes poole vähem soojust.',
        'Saatejuht: Kas suvel on nüüd palavam?',
        'Tarvo: Vastupidi. Tänu uuele ventilatsioonile ja soojustusele püsib suvel korterites jahedam. Vanemad elanikud on selle üle eriti rõõmsad.',
        'Saatejuht: Aitäh, Tarvo!',
      ], [
        'Tarvo juhitud viiekorruseline kortermaja on ehitatud aastal [1974|tuhat üheksasada seitsekümmend neli].',
        'Selles Narva kortermajas on kokku [kuuskümmend|60] korterit.',
        'Enne renoveerimist läks soojus seinte ja vanade [akende] kaudu tänavale.',
        'Renoveerimise ajal soojustati maja seinad ja [katus] ning vahetati aknad.',
        'Renoveerimistöö kestis Tarvo sõnul kokku [kaheksa|8] kuud.',
        'Ülejäänud raha jaoks võttis korteriühistu lisaks toetusele [pangalaenu|laenu].',
        'Kõige raskem ei olnud Tarvo sõnul raha leidmine, vaid inimeste [veenmine].',
        'Pärast renoveerimist kulub majal küttele umbes [poole] vähem soojust.',
        'Tänu uuele ventilatsioonile ja soojustusele on suvel korterites [jahedam].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('065_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Tarvo maja renoveeriti kaks aastat tagasi.', true],
        ['Enne renoveerimist olid küttearved väikesed.', false],
        ['Renoveerimisel vahetati ka maja aknad.', true],
        ['Kogu raha tuli riigi toetusest.', false],
        ['Esimesel koosolekul olid kõik elanikud renoveerimise poolt.', false],
        ['Inimesi veenis arvutus, kui palju igaüks säästab.', true],
        ['Pärast renoveerimist on suvel korterites palavam.', false],
        ['Eakad elanikud on jahedama suve üle rõõmsad.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('065_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('065_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad maja juhatusele kirja ja arutluse. Sõnavõtus esitled mooduli tulemust: oma kodu keskkonnaplaani, mille paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own plan, built in 061–064
      B.planning('065_t_product', 'Mooduli tulemus: minu kodu keskkonnaplaan.', 'Võta oma keskkonnaplaan tunnist 64 ja lisa igale reale üks lause, mis kasutab tunni keelt.', ['Prügi: mis muutub ja mis ei jää enam sorteerimata? (tund 61: -ks, -mata)', 'Toit: mille tõttu ma raiskasin ja mis aitab? (tund 62: tõttu, tänu)', 'Energia: mida ma üleminekust arvan? (tund 63: -mine, arvude võrdlus)', 'Kuumus: mida ma teen, vaatamata sellele, et …? (tund 64: vaatamata, küll …, kuid)']),
      PART('065_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('065_t_letter', 'Kirjutamine 1: kiri maja juhatusele (umbes 140 sõna).', 'Juhatus otsustas, et biojäätmete konteinerit maja juurde ei tule, sest see olevat kallis ja haisevat. Kirjuta juhatusele: ütle, millega sa ei ole nõus ja miks, too kaks fakti, vasta ühele kahtlusele (küll …, kuid; vaatamata …) ja tee konkreetne ettepanek.', 'Lugupeetud juhatus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('065_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas toidupoed peaksid olema kohustatud müümata jäänud söödava toidu annetama? Too mõlema poole argumendid, igaühele näide, ja sinu põhjendatud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3), { task: 'W14', harno: 'W2b' }),
      PART('065_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('065_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi majakoosolekul 1 minut oma kodu keskkonnaplaanist. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Mis on sinu plaanis neli sammu?', 'Milline samm on kõige raskem ja miks teed seda siiski?', 'Mida peaks sinu arvates tegema maja või linn?', 'Paariline küsib: „Mis sind kõige rohkem veenis?”', 'Kas üksikinimese valikud muudavad keskkonna jaoks midagi? Miks?', 'Kas riik peaks keskkonnasõbralikke valikuid rohkem toetama või hoopis kohustama? Põhjenda.'], [90, 180], ['Minu kodu plaanis on neli sammu …', 'Kõige raskem on …, vaatamata sellele …', 'Ma teen ettepaneku, et maja …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('065_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas pandisüsteem peaks hõlmama ka klaaspurke ja veinipudeleid? Argumendid: pandipakendist tuuakse tagasi peaaegu üheksa kümnest; klaas on raske ja ohtlik, kui see jääb loodusesse; süsteem on juba olemas ja inimesed tunnevad seda. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas pandisüsteem peaks hõlmama ka klaaspurke ja veinipudeleid? Argumendid: suurem pant teeb toidu ja joogi kallimaks; taaraautomaadid on juba praegu sageli täis; klaasi saab panna ka pakendikonteinerisse. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks minu kodus …', 'Küll …, kuid …'], ['Ma ei ole päris nõus, sest …', 'Vaatamata sellele, et …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('065_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: seisukoht ja põhjus, kaks fakti, vastus kahtlusele, konkreetne ettepanek, sobiv toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, selge järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: neli sammu ja põhjendus 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('065_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 13 läbitud'),
    ],
  },
}, {
  'b1b2-061': 'AVAS R→S', 'b1b2-062': 'LUGU R→W', 'b1b2-063': 'PROB L→S', 'b1b2-064': 'KUUL L→W', 'b1b2-065': 'EKS',
});


// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 061
  '061_d_facts': [
    '1. lõik: 437 miljonist toodi tagasi 381 miljonit — „peaaegu üheksa kümnest”.',
    '1. ja 2. lõik: „Pandipakendist ei saa prügi”, aga muust prügist sorteeritakse ainult umbes 40 protsenti.',
    '2. lõik: 2022. aastal võeti ringlusse „vaid kolmandik”, Euroopa Liit nõuab 55 protsenti — tulemus jääb nõudest maha.',
    '2. lõik: „See, mis jääb sorteerimata, läheb põletusse või prügilasse.”',
    '3. lõik: „vähenes nende segaprügi hulk poole aastaga peaaegu viiendiku võrra”.',
    '4. lõik: „kardavad paljud, et teevad valesti”.',
    '4. lõik: „mida lähemal ja mugavam sorteerimine on, seda paremini inimesed sorteerivad”.',
    'Tekst näitab mõlemat: inimeste hirmu ja kaugeid konteinereid ning seda, et lihtne süsteem (pant, konteiner maja juures) töötab.',
  ],
  '061_p_forms': [
    'muutuma + saav kääne (-ks): kompost → kompostiks.',
    'jääma + -mata: mida ei tehtud — sorteerimata.',
    'minema + -ks keskvõrdes: kallis → kallimaks.',
    'Muutus ilma tegijata, minevik: vähenema → vähenes.',
    'X-st saab Y: tooraine on nimetavas, tegusõna ainsuses — saab.',
    'Muutus ilma tegijata, täisminevik: paranema → on paranenud.',
    'tegema + -ks: teeb millekski — turvalisemaks (keskvõrre + -ks).',
  ],
  '061_t_sort': [
    'Pandimärk = pant: pudel läheb taaraautomaati, raha tuleb tagasi.',
    'Pandimärgiga purk läheb samuti taaraautomaati.',
    'Tühi plastist toidupakend ilma pandita läheb pakendikonteinerisse.',
    'Pandimärgita pudel on pakend: pakendikonteiner.',
    'Koored on toidujäätmed: biojäätmed.',
    'Kohvipaks ja paberfilter lagunevad: biojäätmed.',
    'Portselan ei ole pakend ega klaaspakend: segaolmejäätmed.',
    'Patarei sisaldab ohtlikke aineid: poe kogumiskast või jäätmejaam.',
  ],
  '061_t_exit': [
    'jääma + -mata: pudel jääb tagasi viimata.',
    'muutuma + -ks: muld → mullaks.',
    'Muutus ilma tegijata, minevik: vähenes.',
  ],
  // 062
  '062_d_facts': [
    'Joonis: kodud 40 protsenti — kõige suurem osa.',
    '40 − 24 = 16: kodude osa on 16 protsendipunkti võrra suurem.',
    '23 : 4 ≈ 6: umbes kuus korda.',
    'Tekst: „umbes 127 kilogrammi toidujäätmeid iga elaniku kohta”.',
    'Tekst: „ostame sageli soodustuste tõttu rohkem, kui jõuame ära süüa”.',
    'Tekst: „kõlblik kuni” näitab ohutust; „parim enne” näitab kvaliteeti.',
    'Tekst: „2025. aastal umbes neli miljonit kilogrammi”.',
  ],
  '062_p_cause': [
    'Halb või neutraalne põhjus: omastav + tõttu; pärast seda tegusõna (ostsin).',
    'kuum ilm → kuuma ilma tõttu; tegusõna kohe järgmisena: läks.',
    'Hea põhjus: tänu + alaleütlev (Toidupangale).',
    'Hea põhjus: tänu ostunimekirjale; tegusõna teisel kohal: viskasime.',
    'Tagajärg uues lauses: selle tagajärjel + tegusõna (läheb).',
    'Tagajärg samas lauses: koma + mistõttu.',
    'Pärast seetõttu on tegusõna kohe järgmine: tuleks.',
  ],
  '062_t_voice': [
    'Kristo: „ei usu ma, et see meid puudutab, sest meie ei viska ju peaaegu midagi ära”.',
    'Kristo: „läks prügikasti pool pätsi leiba”.',
    'Kristo: leib „hakkas hallitama”.',
    'Kristo: „mille „kõlblik kuni” kuupäev oli pühapäeval”.',
    'Kristo: „ostsin poest kolm pakki jogurtit, sest need olid soodushinnaga”.',
    'Kristo: „Väidetavalt viskavad kõige rohkem toitu ära hoopis poed” — joonise järgi on see vale (kodud 40 %).',
  ],
  '062_t_exit': [
    'Halb põhjus: omastav + tõttu (kuuma ilma tõttu).',
    'tänu + alaleütlev: Toidupangale.',
    'Tagajärg samas lauses: …, mistõttu …',
  ],
  // 063
  '063_d_radio': [
    'Reet: põlevkivist elektri tootmine „on muutunud väga kalliks” — muutuma + -ks.',
    'Sergei: „Kaob ka põhjus, miks noored peaksid siia jääma.”',
    'Sergei: „töötab praegu umbes neli tuhat inimest”.',
    'Reet: „Euroopa Liidu õiglase ülemineku fondist”.',
    'Reet: „haruldaste muldmetallide magnetite tehas”.',
    'Reet: „võib lähiaastatel tulla kuni kaks tuhat uut töökohta”.',
    'Sergei: „see on lubadus, mitte tööleping”.',
    'Reet: „Ümberõpe peab algama enne koondamist, mitte pärast seda.”',
  ],
  '063_p_mine': [
    'Tegevus on alus: sulgema → sulgemine (nimetav).',
    'kartma + osastav: kadumine → kadumist.',
    'Tegevus on alus: avama → avamine (nimetav).',
    'maksma mille eest: õppimine → õppimise eest.',
    'Vahe kahe arvu vahel: … protsendipunkti võrra kõrgem.',
    'Kelle/mille lõpp? omastav: kaevandamise lõpp.',
    'Milleks? vältimiseks — kelle lahkumise vältimiseks (omastav).',
  ],
  '063_t_facts': [
    'Arv ja allikas (ERR, Euroopa Komisjon): seda saab kontrollida — fakt.',
    '„tuleb lähiaastatel kuni …” räägib tulevikust: see on lubadus või plaan, mitte veel fakt.',
    '„niikuinii kõik” on üldistus ilma arvuta: arvamus.',
    'Arv, aeg ja allikas (Statistikaamet): fakt.',
    '„raiskamine”, „keegi ei saa kasu” on hinnang ja üldistus: arvamus.',
    'Riigi otsus tuleviku kohta: plaan — kas see täitub, selgub alles 2035. aastal.',
  ],
  '063_t_exit': [
    'Tegevus on alus: õppima → õppimine.',
    'Vahe: kümne inimese võrra rohkem.',
    'Mitu korda: kaks korda rohkem kui …',
  ],
  // 064
  '064_d_clips': [
    'Teade 1: „Kuna kuum ilm kestab vähemalt kolm päeva, on tegemist esimese taseme … kuumaga.”',
    'Teade 1: „Hoiatusi saab jälgida ilmateenistuse kodulehel ja riiklikus ilmaäpis.”',
    'Teade 2: „Hoia päeval aknad ja kardinad kinni ning tuuluta tube öösel.”',
    'Teade 3: „Eakad, kes ei saa ise tulla … vabatahtlikud toovad neile vett koju.”',
    'Teade 4: „suureneb suremus neliteist kuni seitseteist protsenti”.',
    'Teade 5: vii jahedasse, jahuta pead ja kaenlaaluseid, helista 112.',
  ],
  '064_p_fix': [
    'vaatamata + alaleütlev: kuumusele.',
    'Õige väljend: vaatamata sellele, et … (mitte sellest).',
    'pärast ehkki- või kuigi-lauset ei ole sõna „aga”; pealause algab tegusõnaga: ei avanud.',
    'Pärast kõrvallauset on tegusõna kohe: ei joonud ta.',
    'Tegevus on alus: sulgema → sulgemine (tund 63).',
    'muutuma + -ks: palavaks (tund 61).',
    'tõttu + omastav: kuumuse tõttu (tund 62).',
  ],
  '064_t_exit': [
    'vaatamata + alaleütlev: kuumusele.',
    'Väljend: vaatamata sellele, et …',
    'Pärast ehkki-lauset on tegusõna kohe: oli.',
  ],
  // 065
  '065_d_read': [
    '(A) ja (G): õige küsimus ei ole „mina või riik”, vaid „mina ja riik” — kumbki teeb oma osa.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '065_d_mc': [
    '(A): „Mõlemas on tõtt, kuid kumbki üksi ei vii kuhugi.”',
    '(B): „See juhtub tänu süsteemile: pant on väike, kuid tuntav, ja taaraautomaat on poes.”',
    '(C): „Inimesed ei muutunud paremaks. Sorteerimine muutus lihtsamaks.”',
    '(D): „Õiglane oleks, kui ka kaupmees vastutaks.”',
    '(E): „ümberõpe algab enne koondamist, mitte pärast seda”.',
    '(G): „Minu ülesanne on teha seda, mis on minu lähedal … Riigi, linna ja ettevõtete ülesanne on teha hea valik lihtsaks.”',
  ],
  '065_d_para': [
    '(C): „Inimesed ei muutunud paremaks. Sorteerimine muutus lihtsamaks.”',
    '(E): „Kodanik ei sulge elektrijaama ega ehita uut tehast.”',
    '(D): „poe soodustused panevad meid ostma rohkem”.',
    '(B): „taaraautomaat on poes, kuhu me niikuinii läheme”.',
    '(G): „Ja kui nad seda ei tee, on kodaniku ülesanne seda nõuda.”',
    '(F): „ainult naaber märkab, et viienda korruse proua ei ole kaks päeva õue tulnud”.',
    '(A): „Küsimus on selles, kumb teeb mida.”',
    '(E): „selle hinna maksavad kõigepealt Ida-Virumaa inimesed”.',
  ],
  '065_d_cloze': [
    'jääma + -mata: jääb sorteerimata.',
    'Halb põhjus: selle tõttu.',
    'Muutus ilma tegijata, minevik: vähenes.',
    'muutuma + -ks keskvõrdes: puhtamaks.',
    'muutuma + -ks: kompost → kompostiks.',
    'Hea põhjus: tänu pandisüsteemile.',
    'Tegevus on alus: paigaldama → paigaldamine.',
    'vaatamata sellele, et …',
    'arutama + osastav: tellimine → tellimist.',
    'ootama + osastav: vastust.',
  ],
  '065_d_bank': [
    'Prügihunnik → mis seal oli: rehvid, külmkapp, kotid.',
    'Vallal ei ole raha → siis teeme ise.',
    'Kutsusime küla → mitu inimest registreerus.',
    'Kartsime vihma pärast → vaatamata vihmale tulid kõik.',
    'Metsaserv puhas → mis sai prügist. Üle jääb „otsustasime prügi metsa jätta”, mis on loo vastand.',
    'Leppisime kokku järgmise aasta → talgupäev on traditsioon.',
  ],
  '065_p_fix': [
    'muutuma + -ks: kompostiks.',
    'jääma + -mata: sorteerimata.',
    'tänu + alaleütlev: Toidupangale.',
    'Pärast seetõttu on tegusõna kohe: ostame.',
    'kartma + osastav; sihitis -mine ees omastavas: töökohtade kadumist.',
    'vaatamata + alaleütlev: kuumusele.',
  ],
  '065_p_trans': [
    'Halb põhjus nimisõnana: tugeva vihma tõttu; tegusõna kohe: jäi.',
    'Muutus ilma tegijata: vähenes / on vähenenud.',
    'Tegevus nimisõnana: jaamade sulgemine; sihitis omastavas.',
    'kuigi → vaatamata hoiatusele / vaatamata sellele, et …',
    'jääma + -mata: jäi söömata.',
    'küll …, kuid: tunnistad ühte poolt ja ütled teise.',
  ],
  '065_p_notes': [
    'Teade 1: „remondis kuni neljapäevani”.',
    'Teade 1: „korraga kõige rohkem kakskümmend pudelit või purki”.',
    'Teade 2: „Autorehve sel päeval vastu ei võeta.”',
    'Teade 3: „Vaja on juhiluba”.',
    'Teade 4: „pargi läänepoolses osas”.',
    'Teade 4: „kaasa võtke ainult joogivesi”.',
  ],
  '065_p_listen': [
    'Tarvo: „Maja on ehitatud 1974. aastal.”',
    'Tarvo: „selles on kuuskümmend korterit”.',
    'Tarvo: „Soojus läks lihtsalt seinte ja vanade akende kaudu tänavale.”',
    'Tarvo: „Soojustasime seinad ja katuse”.',
    'Tarvo: „Töö kestis kaheksa kuud.”',
    'Tarvo: „ülejäänu jaoks võtsime pangalaenu”.',
    'Tarvo: „Kõige raskem ei olnud raha, vaid inimeste veenmine.”',
    'Tarvo: „kulub meie majal küttele umbes poole vähem soojust”.',
    'Tarvo: „püsib suvel korterites jahedam”.',
  ],
  '065_p_tf': [
    'Õige: „Kaks aastat tagasi.”',
    'Vale: „küttearved olid ikkagi suured”.',
    'Õige: „vahetasime aknad”.',
    'Vale: osa tuli toetusest, ülejäänu pangalaenust.',
    'Vale: „oli vastu peaaegu pool maja”.',
    'Õige: „Näitasime, kui palju igaüks … säästab.”',
    'Vale: „püsib suvel korterites jahedam”.',
    'Õige: „Vanemad elanikud on selle üle eriti rõõmsad.”',
  ],
};
