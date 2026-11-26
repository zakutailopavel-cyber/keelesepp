// B2 course (B1 → B2 roadmap), module 13 „Keskkond ja vastutustundlik elu” (b1b2-061…065), stage B2-.
// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25),
// built on the pattern of modules 11–12 (b2/module11.js, b2/module12.js). On the v3 station engine with the v4 task formats.
// Module goal (the learner): „Ma räägin keskkonnast oma elu kaudu ja otsustan koos teistega: mida meie maja prügiga teeb,
// kuidas meie köök vähem raiskab, mis on õiglane üleminek ja kuidas naabrid kuumalaine üle elavad.” Environment from the
// learner's own angle: his bin and the house board, his fridge and the weekend, the oil-shale exit of Ida-Virumaa (his
// region or his neighbours'), his stairwell in a heatwave. No slogans: every task weighs convenience, price, time and the
// environment. Nobody has to tell his real life: every task allows a typical or invented case.
//   Avasta  (4): station 1 — 061 the module's COLD TASK in writing (5 min, 5–7 sentences, no phrases; module 12 measured
//                speaking, module 13 measures writing; its parallel is 065_t_cold), 062–064 the 5-min „Parandatud
//                versioon” of the previous lesson's draft (data.revisionOf, v6 G16); station 2 the words (10 + 3 review
//                words from 3–15 lessons back, data.review, v6 G18), ONE input and one scheme — reading ≈ 470–500 words
//                with 3 inference questions (061 „Miks hea tahe jääb prügimajja?”, 063 „Kas üleminek saab olla
//                õiglane?”) or listening ≈ 3.5–4 min, 2 voices (062 „Köögiraadio”, 064 „Ohutusraadio”), a reading /
//                listening strategy line in the instruction.
//   Harjuta (4): the rule box (B1 one-line review, B2 step, one L1-contrast line „Vene keeles …”), one form task of 10
//                items that PRODUCES the rule box's bold forms (the choice is left open, the hint is the dictionary form,
//                never the answer; v6 G15), one second task of 8 rows, and the 10-min DRAFT of the home text in class.
//   Kasuta  (5): station 4 the main task — types modules 11–12 used least, one each (v6 G17): 061 ranking (a decision under
//                a budget), 062 info-gap (two half-cards), 063 debate (argument cards), 064 jigsaw (two halves of the
//                stairwell) — each with an „Abikaart” and a „Lisaväljakutse” (data.support / data.stretch, v6 G24) and
//                hidden information on the teacher's card (v5 G9); the EXIT 30–60 s of speech in the main task's skill
//                (v6 G14); the self-check with 3 criteria rated 0–1–2 and one own sentence as evidence; the home text
//                (finish the draft, ~140 / ~180 words, 1-min voice message, „Harjuta → moodul 13”); the analytic Harno B2
//                rubric with a borderline sample (v5 G10).
//   061 quest   „Pudel, purk ja banaanikoor: kuhu sinu prügi tegelikult läheb?”   reading  change and result (-ks, -mata, -nema)   ranking
//   062 facts   „Toit prügikastis: miks me ostame rohkem, kui jõuame ära süüa?”     radio    cause as a noun (tõttu, tänu), mistõttu  infogap
//   063 debate  „Põlevkivielekter lõpeb: millest elab Ida-Virumaa 2035. aastal?”    reading  -mine with a genitive, comparing numbers  debate
//   064 project „Toas on 30 kraadi: kas su kodu ja naabrid on kuumalaineks valmis?” radio    concession (vaatamata, ehkki, küll … kuid) jigsaw
//   065 exam    Kontroll 13: one sheet, 45 min, READING + WRITING (m11 R + W, m12 L + S — the controls alternate). It is a
//                two-skill control, not a full mock (the methodologist's decision for 040, 055 and 060: v6 §2 g, „B2,
//                lesson 5 of a module: 2 skills alternating”). Why R + W: module 12 tested listening and speaking; the
//                module's cold task is written (061_d_cold), so its parallel is written (065_t_cold); a waste bill and a
//                repair-or-buy article reach the learner as text and are answered by a letter.
// Real network (v6 G25): peer exchange 063_t_essay (a classmate answers with two stars and a wish), media log 062_t_note
// („Minu eesti keele võrgustik”), real document + link task 064_t_note (ilmateenistus.ee, a 3-item task — the page was
// not opened by the author). Mediation 064_t_note (the heat warning in plain words for an old neighbour); jigsaw 064; the
// peer feedback round 063 (v6 §2 l). Texts are adapted learning texts („KeeleSepp õppetekst”) without exact statistics
// (owner 2026-11-25); no story cast, no dictation, no „Kas teadsid?”.
// Module 12's last draft (the data request 059_t_request) is revised in 061's home task (three marked sentences into
// „Minu vead” in Harjuta): station 1 of 061 holds the cold task, and the Avasta sheet has no room for a second 5-min block
// (v5 G1: ≤ 4 blocks on a B2 Avasta) — the same decision as modules 11 and 12.
// Kept: lesson ids, the titles of 061 / 063 / 064 (062's title lost its exact figure), topics, the v4 formats; the v4
// lessons of 2026-11-19 are kept below as V4 and every block that is not on a v6 sheet is taken from there with retire()
// (hidden, id and learners' answers kept, old explanations in OLD_WHY). A kept id keeps its block type.
import { B, hide, tag, teach, why, withShapes } from '../blocks.js';
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

// the v4 lessons of 2026-11-19 („task-based”): the source of every block that is not on a v6 sheet
const V4 = {
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
        'Kui sulle tundub mõni toiduväide kahtlane, kuidas sa kontrollid, kas allikas on usaldusväärne, ja kust saad selle kinnitada?',
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
        'Kas lubaksid ilmarakendusel oma asukohta kasutada, et saada kuumahoiatus? Miks või miks mitte?',
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
};


// the v4 explanations of the retired blocks (shown with the hidden block, courseSheet.js withExplanations)
const OLD_WHY = {
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

// ---- v6 helpers (the same mechanisms as b2/module11.js and b2/module12.js) ------------------------------------------
// G18: the vocab block brings back three old words (3–15 lessons back); they are named on the sheet and used in the input
const withReview = (b, review) => ({ ...b, data: { ...b.data, title: `${b.data.title} Kordamiseks: ${review.join(', ')}.`, review } });
// G17 / G24: the main task of Kasuta — its type, the „Abikaart” (2–3 sentence starters) and the „Lisaväljakutse” line;
// both are printed on the learner's card too (the fold-out card is UI work, v6 §2 i)
const mainTask = (b, taskType, support, stretch, tags = {}) => tag({ ...b, data: { ...b.data, taskType, support, stretch } }, { main: true, level: 4, ...tags });
// G16: the 5-min „Parandatud versioon” that opens lessons 062–064 (replaces the warm-up statement, not an extra block)
const revision = (id, of, instruction) => {
  const b = B.writing(id, 'Parandatud versioon.', instruction, [3, 4]);
  return teach(tag({ ...b, data: { ...b.data, revisionOf: of } }, { task: 'W10' }),
    '„Parandatud versioon” (5 minutit, v6): õppija kirjutab ümber kolm lauset, mille sa eelmise tunni mustandis või kodutekstis märkisid (ainult märgi, ära paranda ise), ja ütleb ühe reaga, mis muutus. Kontrolli kohe: kas viga on parandatud? Korduv viga läheb õppija „Minu vead” nimekirja Harjutas. Kui õppija kodutööd ei teinud, parandab ta tunni mustandi kolm lauset.');
};
// G16: the in-class draft of the home text's first paragraph (≈ 10 min, feedback on one rubric criterion)
const draft = (id, title, instruction, criterion, range = [5, 7]) => teach(tag(B.writing(id, `Mustand tunnis: ${title} (10 minutit).`, instruction, range), { task: 'W11', level: 3 }),
  `Mustand tunnis, 10 minutit (v6): see on kodutöö esimene lõik. Tagasiside ainult ühele kriteeriumile — ${criterion}. Märgi kolm lauset (ära paranda): järgmise tunni alguses kirjutab õppija need ümber („Parandatud versioon”). Paaris: kaaslane loeb ja ütleb hindamisjuhendi selle rea järgi üht head ja üht parandust. Kui aega jääb vähe, piisab kolmest lausest.`);
// G14: the exit — 30–60 s of speech performing the lesson's can-do (the main task's skill), done in class
const exitTalk = (id, instruction, questions, note) => teach(tag(exitCheck(inLesson(B.speaking(id, 'Väljumine: 30 sekundit.', instruction, questions, [30, 60]))), { task: 'S11', fluency: true }),
  `Väljumiskontroll (v6 G14), 3 minutit: üks sooritus tunni oskusest, mitte vormiküsimused. Kuula, ära sega vahele. ${note} Lõpus üks tugevus ja üks parandus.`);
// G24: the self-check — three success criteria rated 0–1–2 and one own sentence as evidence
const selfCheck = (id, criteria, stamp, titleMore) => {
  const b = B.selfcheck(id, criteria, stamp, titleMore);
  return { ...b, data: { ...b.data, instruction: 'Hinda iga rida: 0 — veel mitte, 1 — osaliselt, 2 — jah. Kirjuta alla üks oma lause, mis seda tõendab.', criteria, evidence: true } };
};
// the home text: the draft finished at home + the 1-min voice message + Harjuta (v6 G18); the sheet gives few lines
const homeLines = (b, lines) => ({ ...b, data: { ...b.data, lines } });
// G25: the module's peer exchange (a classmate reads the product and answers) and media log („Minu eesti keele võrgustik”)
const peerReply = (b) => ({ ...b, data: { ...b.data, peerReply: 'Kursusekaaslane loeb arutluse ja vastab: kaks tugevat kohta ja üks soov (hindamisjuhendi järgi).', realAddressee: 'kursusekaaslane' } });
const mediaLog = (b) => ({ ...b, data: { ...b.data, mediaLog: true } });
// a control's rubric stays directly under the task it scores (courseSheet.js lessonOrder)
const keepPlace = (b) => ({ ...b, data: { ...b.data, keepPlace: true } });
// v5 G6: a lesson recording is heard twice
const twiceInLesson = (b) => ({ ...b, data: { ...b.data, plays: 2 } });
const HARJUTA = 'Harjuta → moodul 13: sõnad ja vormid (10 min).';

// the analytic Harno B2 writing rubric (v5 G10): four criteria, 0–3 points each, with level descriptors; the teacher's
// note holds a borderline sample with its scoring (the same rubric as modules 11–12, the grammar line names module 13)
const B2_WRITING = [
  ['Ülesande täitmine ja register', '3 — kõik sisupunktid on täidetud, adressaat ja toon sobivad, pikkus on ülesande piires; 2 — üks punkt on nõrk või toon kõigub; 1 — kaks punkti on puudu või toon ei sobi adressaadile; 0 — tekst ei vasta ülesandele'],
  ['Ülesehitus ja sidusus', '3 — lõigud, teemalaused ja mitmekesised sidendid, mõte liigub loogiliselt; 2 — lõigud on olemas, kuid sidendid korduvad; 1 — mõtete loetelu ilma lõikudeta; 0 — järjekorrast ei saa aru'],
  ['Sõnavara', '3 — täpne ja mitmekesine, kordusi väldib; 2 — piisav, mõni kordus või ebatäpne sõna; 1 — piiratud, sõnad korduvad, tähendus on kohati segane; 0 — sõnavara ei kanna sisu'],
  ['Grammatika ja õigekiri', '3 — liitlaused ja vormid (muutub …-ks, jääb …-mata, tõttu ja tänu, -mine omastavaga, vaatamata) on enamasti õiged; 2 — vigu on, kuid need ei takista mõistmist; 1 — vead takistavad kohati mõistmist; 0 — vead takistavad mõistmist pidevalt'],
];
const B2_WRITING_SHORT = ['3 kõik punktid, sobiv toon · 2 üks nõrk koht · 1 kaks puudu · 0 ei vasta', '3 lõigud ja mitmekesised sidendid · 2 sidendid korduvad · 1 loetelu · 0 segane', '3 täpne ja mitmekesine · 2 mõni kordus · 1 piiratud · 0 ei kanna sisu', '3 vead ei sega · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'];
const writingRubric = (id, title, sample) => {
  const b = B.rubricW2(id, title);
  return teach({ ...b, goal: 'g_use', data: { ...b.data, instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12. Kontrolli oma teksti enne saatmist.', criteria: B2_WRITING.map(([name], i) => ({ name, max: 3, hint: B2_WRITING_SHORT[i] })) } }, sample);
};

// why a v4 block left the sheet
const CUT_HOOK = 'v5/v6: station 1 is the cold task (061) or the 5-min „Parandatud versioon” (062–064); the hook text and the warm-up talk merged into it';
const CUT_INPUT = 'second input of the lesson (v5: one input per lesson)';
const CUT_STATS = 'exact statistics (owner 2026-11-25: adapted texts, no exact numbers) or a second input';
const CUT_DRILL = 'exit gaps → Harjuta (v6 G14: the exit is a 30–60-s performance of the can-do, not three form items)';
const CUT_EXTRA = 'extra task (v5: one product task in Kasuta; „Kui aega jääb” is in the teacher plan)';
const CUT_HOME = 'home card / voice task: the home text on the sheet carries the 1-min voice message and the Harjuta link (v5 §3, v6 G18)';
const CUT_OLDTASK = 'v4 task replaced by the v6 task of the same station (new id, other block type)';
const CUT_CONTROL = 'control is one sheet ≤ 10 blocks, reading + writing (v6 §2 g: B2 lesson 5 = 2 skills alternating; m12 was L + S)';
const RETIRE_WHY = {
  '061_d_open': CUT_STATS, '061_d_facts': CUT_STATS, '061_t_chat': CUT_INPUT, '061_t_sort': 'sorting drill (v5 §4: matching and sorting live in Harjuta, not on a B2 lesson sheet)', '061_t_meeting': CUT_OLDTASK,
  '062_d_chart': CUT_STATS, '062_d_text': CUT_STATS, '062_d_facts': CUT_STATS, '062_t_voice': 'v4 input (voice message, ≈ 60 s): the lesson\'s one input is now the radio 062_d_radio (v5: B2 listening 3–4 min, 2 voices)', '062_t_explain': CUT_OLDTASK,
  '063_d_radio': 'v4 input (radio with exact figures, ≈ 2.5 min): the lesson\'s one input is now the article 063_d_text (v5: inputs alternate reading / listening; owner: no exact statistics)', '063_d_know': CUT_STATS, '063_t_facts': CUT_INPUT,
  '064_d_clips': 'v4 input (five clips with exact figures): the lesson\'s one input is now the radio 064_d_radio (v5: B2 listening 3–4 min, 2 voices)', '064_d_know': CUT_STATS, '064_t_house': 'four neighbour cards: they are the two half-cards of the jigsaw 064_t_plan now (v5: ≤ 5 blocks on Kasuta)', '064_t_product': 'module product card: the in-class products are the drafts and the main tasks 061–064; the control is reading + writing (v6 §2 g)',
};
const reasonFor = (id) => RETIRE_WHY[id] || (/^065_/.test(id) ? CUT_CONTROL : /_d_(hook|talk)$/.test(id) ? CUT_HOOK : /_t_more$/.test(id) ? CUT_EXTRA
  : /_t_exit$/.test(id) ? CUT_DRILL : /_t_(home|homework|letter|essay|summary)$/.test(id) ? CUT_HOME : CUT_OLDTASK);

// a v4 block that left the sheet: hidden with its reason, its old explanation kept (v5 §4)
const V4_BLOCKS = Object.fromEntries(Object.values(V4).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const retire = (id) => {
  const b = V4_BLOCKS[id];
  if (!b) throw new Error(`module13: v4 plokki ${id} ei ole`);
  return hide(OLD_WHY[id] ? why(b, OLD_WHY[id]) : b, reasonFor(id));
};
// every v4 block of the lesson that is not on the v6 sheet goes, hidden, to the end of its own phase (a kept id must keep
// its block type)
const withRetired = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => {
  const used = new Map(['discover', 'practice', 'transfer'].flatMap((p) => (l[p] || []).map((b) => [b.id, b])));
  const phases = Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => {
    const old = (V4[id]?.[p] || []).filter((b) => !used.has(b.id)).map((b) => retire(b.id));
    return [p, [...(l[p] || []), ...old]];
  }));
  used.forEach((b, bid) => {
    if (V4_BLOCKS[bid] && V4_BLOCKS[bid].type !== b.type) throw new Error(`module13: ${bid} oli ${V4_BLOCKS[bid].type}, nüüd ${b.type}`);
  });
  return [id, { ...l, ...phases }];
}));

// the purpose of every task („kes, kellele, mis tulemus”, stations.js st-purpose) for the teacher page — not printed in the
// instruction (v6 §2 e, G22: the instruction stays ≤ 25 words)
const PURPOSE = {
  '061_d_cold': 'Õpetaja näeb mooduli alguses, kuidas sa praegu arvamust kirjutad.',
  '061_d_text': 'Tead pärast lugemist, miks inimesed ei sorteeri ja mis neid aitab.',
  '061_d_scheme': 'Skeem näitab, kuhu iga asi läheb ja kus on sinu maja takistus.',
  '061_p_forms': 'Ühistu teatest on aru saada, mis muutub ja mis jääb tegemata.',
  '061_p_fix': 'Naabrite sõnumid lähevad vestlusrühma ilma vigadeta.',
  '061_p_draft': 'Ettepaneku algus on valmis ja õpetaja märgib kolm lauset.',
  '061_t_rank': 'Juhatus teab, millised kolm muudatust elanikud kõigepealt tahavad.',
  '061_t_say': 'Näitad 30 sekundiga, et oskad otsust ja selle tulemust põhjendada.',
  '061_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '061_t_board': 'Juhatus saab konkreetse ettepaneku, mida koosolekul arutada.',
  '061_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '062_d_revise': 'Sinu ettepanek juhatusele saab paremaks ja sa näed oma vigu.',
  '062_d_radio': 'Kuuled spetsialistilt, miks toit raisku läheb ja mis aitab.',
  '062_d_scheme': 'Skeemist näed, mis toidu raiskamise põhjusele vastab ja mis sinu köögis aitab.',
  '062_p_forms': 'Köögi kokkuleppes on põhjused ja tagajärjed selgelt kirjas.',
  '062_p_cause': 'Oskad pika kuna-lause asemel öelda põhjuse lühidalt nimisõnaga.',
  '062_p_draft': 'Sõnumi esimene lõik on valmis ja õpetaja märgib kolm lauset.',
  '062_t_gap': 'Teil on koos plaan, et nädalavahetusel ei läheks toit raisku.',
  '062_t_say': 'Näitad 30 sekundiga, et oskad plaani ja selle põhjuse öelda.',
  '062_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '062_t_note': 'Kaaslased teavad, milline köögi kokkulepe sellest nädalast kehtib.',
  '062_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '063_d_revise': 'Sinu sõnum kaaslastele saab paremaks ja sa näed oma vigu.',
  '063_d_text': 'Tead pärast lugemist, mida üleminek eri inimestele tähendab.',
  '063_d_scheme': 'Skeem on sinu argumentide nimekiri aruteluks.',
  '063_p_mine': 'Arutelu märkmetes on lühikesed ja täpsed fraasid.',
  '063_p_nom': 'Oskad kõrvallause asemel kasutada -mine-sõna ja arve võrrelda.',
  '063_p_draft': 'Arutluse esimene lõik on valmis ja õpetaja märgib kolm lauset.',
  '063_t_debate': 'Paar jõuab ühise esimese sammuni, mida mõlemad toetavad.',
  '063_t_say': 'Näitad 30 sekundiga, et oskad oma lõplikku seisukohta põhjendada.',
  '063_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '063_t_essay': 'Kursusekaaslane loeb kaalutud arvamust ja vastab sulle.',
  '063_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '064_d_revise': 'Sinu arutlus saab paremaks ja sa näed oma vigu.',
  '064_d_radio': 'Kuuled päästjalt, mida kuumalaine ajal teha ja keda kontrollida.',
  '064_d_scheme': 'Skeem on sinu maja kuumaplaani kava.',
  '064_p_forms': 'Oskad öelda, mis juhtub hoolimata takistusest.',
  '064_p_fix': 'Naabrite sõnumid kuumalainest on õiged ja rahulikud.',
  '064_p_draft': 'Sõnumi esimene lõik on valmis ja õpetaja märgib kolm lauset.',
  '064_t_plan': 'Trepikojal on plaan: kes keda kontrollib ja millal.',
  '064_t_say': 'Näitad 30 sekundiga, et oskad plaani naabritele lühidalt öelda.',
  '064_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '064_t_note': 'Eakas naaber saab hoiatusest aru ja teab, mida ta teeb.',
  '064_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '065_d_read': 'Näitad, et saad arvamusartiklist aru ka ilma sõnaraamatuta.',
  '065_d_mc': 'Näitad, et saad aru ka sellest, mida autor otse ei ütle.',
  '065_t_cold': 'Näed, kuidas su kirjutamine on mooduli algusest muutunud.',
  '065_t_rubric': 'Näed, mille eest viie minuti arvamuse punktid tulevad.',
  '065_t_claim': 'Firma saab aru, miks arve ei ole õige, ja vastab sulle.',
  '065_t_wrubric': 'Näed, mille eest kirja punktid tulevad.',
};
const withPurposes = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { ...l, ...Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => [p, (l[p] || []).map((b) => (PURPOSE[b.id] ? { ...b, data: { ...b.data, purpose: PURPOSE[b.id] } } : b))])) }]));

export const LESSONS = withPurposes(withShapes(withRetired({
  'b1b2-061': {
    title: 'Pudel, purk ja banaanikoor: kuhu sinu prügi tegelikult läheb?',
    phases: grammar('Kordamine: muutub puhtaks · B2: muutub kompostiks, jääb sorteerimata, pudelist saab tooraine, segaprügi vähenes — ühistu vähendas'),
    format: 'quest',
    topic: 'home',
    canDo: 'Ma loen artiklit sellest, miks inimesed prügi ei sorteeri, arutlen paarilisega, millised kolm muudatust meie maja kõigepealt vajab, ja kirjutan juhatusele umbes 140-sõnalise ettepaneku; väljendan muutust ja tulemust (muutub kompostiks, jääb sorteerimata, vähenes).',
    teacherPage: {
      goal: 'Холодная задача письменно; статья о сортировке; -ks, -mata, -nema / -dama; решение в паре: три изменения для дома; дома предложение правлению 140 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: холодная задача (5 мин) — обязательно; статья — абзацы 1–5 и вопросы 1–5; станция 3 — правило и 10 предложений, черновик 3 предложения; решение — четыре карточки из шести, без скрытой информации.',
      hook: '«Väide: prügi sorteerimine peaks olema kohustuslik ja selle eest, kes ei sorteeri, tuleks trahvida.» Ученик пишет 5 минут, 5–7 предложений, без помощи. Это холодная задача модуля (письменно; модуль 12 мерил устную речь): не помогайте, не давайте фраз, не исправляйте; лист сохраните до 065. В уроке 065 ученик пишет параллельную задачу в тех же условиях (065_t_cold).',
      plan: [
        '0–5: станция 1 — холодная задача: 5 минут, 5–7 предложений; лист сохраните до 065',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: пробежать заголовок и первые фразы абзацев (1 мин), статья (6 мин), 7 вопросов, из них 3 на вывод (10 мин), схема «куда идёт вещь» (5 мин)',
        '30–52: станция 3 — -ks одной строкой (B1), B2: -ks, -mata, -nema / -dama; 10 предложений, исправить 8 сообщений соседей; черновик первого абзаца письма правлению (10 мин), обратная связь — содержание',
        '52–70: станция 4 — решение в паре: шесть изменений, денег на три; ранжировать и договориться; вы вносите скрытую информацию',
        '70–75: выход: 30 секунд правлению; самооценка 0–1–2 + своё предложение; домашнее задание: письмо 140 слов, голосовое 1 мин, Harjuta; три отмеченных предложения из запроса данных 059 — в «Minu vead»',
        'Kui aega jääb (75–90): ролевая игра «новый сосед бросает всё в смешанные отходы» — вы сосед, ученик говорит вежливо и предлагает помощь',
      ],
      sources: 'Статья «Miks hea tahe jääb prügimajja?» — учебный текст KeeleSepp без точной статистики (раньше: 437 / 381 млн упаковок, 378 кг, 40 %, 33 %, Haabersti −20 % — убраны). Общая основа: залоговая система (pandimärk, taaraautomaat), раздельный сбор биоотходов обязателен, смешанные отходы дороже вывозить, чем упаковку и биоотходы; пилот с контейнером у дома и инструкцией с картинками уменьшил смешанные отходы (ERR, 2024, без цифр). Карточки решения — учебные.',
      groups: 'Холодная задача и статья — каждый сам, вопросы на вывод сравнивают в паре. Черновик — каждый сам, партнёр читает по строке рубрики «Ülesande täitmine». Станция 4 — пары; в 1:1 вы — второй член правления.',
      errors: [
        '«Koored muutuvad kompost» → «kompostiks» (muutuma / jääma / minema / tegema + -ks: во что превращается).',
        '«Pudelist saab uueks pudeliks» → «Pudelist saab uus pudel» (X-st saab Y — Y в номинативе; X muutub Y-ks).',
        '«Jääb mitte sorteeritud» → «jääb sorteerimata» (русское «остаётся несортированным» = jääma + -mata).',
        '«Segaprügi vähendas» → «Segaprügi hulk vähenes» (-nema: меняется само; -dama: кто-то меняет что-то).',
      ],
      notes: [
        'Холодная задача — исходная точка модуля по письму. Отметьте: позиция в первой фразе, причина с примером, контраргумент, связки, 2–3 повторяющиеся ошибки. В 065 ученик пишет параллельную задачу (065_t_cold), вы сравниваете листы.',
        'Решение (v6 §2 d, ranking): нет «правильного» порядка, оценивается аргумент и договорённость. Ученику в частном доме — контейнеры у калитки и соседи по улице; в общежитии — кухня на этаже; пенсионеру — он сам член правления. Никого не стыдим за то, что не сортирует.',
        'Слова на повтор (korteriühistu из урока 48, kulu из 51, mugavus из 56) есть в статье: попросите ученика найти их и сказать, откуда он их знает.',
      ],
    },
    discover: [
      station(teach(tag(homeLines(B.writing('061_d_cold', 'Külm algus: arvamus viie minutiga.', 'Väide: „Prügi sorteerimine peaks olema kohustuslik ja sellele, kes ei sorteeri, tuleks teha trahv.” Kirjuta 5 minutit, 5–7 lauset: seisukoht, põhjus, näide, vastuargument.', [5, 7]), 12), { task: 'W14', harno: 'W2b' }),
      'Mooduli külm ülesanne (algtase), 5 minutit, kirjalikult (moodul 12 mõõtis rääkimist, moodul 13 mõõdab kirjutamist). Ära aita, ära anna fraase ega algust, ära paranda. Märgi üles: kas seisukoht on esimeses lauses, mitu põhjust, kas on näide, kas vastuargument tuleb, mitu sidendit (kuigi, seetõttu, samas …) ja 2–3 korduvat viga. Hoia leht alles: tunnis b1b2-065 kirjutab õppija paralleelse ülesande samades tingimustes (kontrolli kirjutamise 1. osa) ja te võrdlete.'), 1, 5),
      station(withReview(tag(B.vocab('061_d_vocab', 'Tunni sõnad.', ['jäätmed — отходы', 'pakend — упаковка', 'biojäätmed — биоотходы', 'pandipakend — тара с залогом', 'segaprügi — смешанный мусор', 'konteiner — контейнер', 'sorteerima — сортировать', 'ringlusse võtma — перерабатывать', 'tooraine — сырьё', 'prügivedu — вывоз мусора']), { topic: ['jäätmed', 'pakend', 'biojäätmed', 'pandipakend', 'segaprügi', 'tooraine', 'prügivedu', 'taaraautomaat', 'pandimärk'] }), ['korteriühistu', 'kulu', 'mugavus']), 2, 25),
      why(teach(tag(B.reading('061_d_text', 'Loe artiklit.', 'Silmitse 1 minut pealkirja ja lõikude esimesi lauseid. Siis loe ja vasta. Küsimustele 5–7 järelda ja näita lauset tekstist.', 'Miks hea tahe jääb prügimajja?', [
        'Peaaegu igas Eesti köögis on täna mitu prügikasti: üks pakenditele, teine toidujäätmetele, kolmas kõigele muule. Pandimärgiga pudelid ja purgid viiakse poodi tagasi ja enamik inimesi teeb seda pikemalt mõtlemata. Pudelist saab uus tooraine ja mõne kuu pärast on sama materjal jälle poeriiulil. Selles on Eesti üks Euroopa edukamaid riike. Teiste jäätmetega on lugu aga palju kehvem: suur osa pakenditest ja toidujäätmetest jääb ikka sorteerimata ja läheb segaprügi hulka.',
        'Miks on pudelitega lihtne ja kõige muuga raske? Vastus ei ole selles, et inimesed oleksid laisad. Pandisüsteem on üles ehitatud nii, et õige valik on ka kõige mugavam. Taaraautomaat on poes, kuhu inimene niikuinii läheb, ja iga pudeli eest saab väikese summa tagasi. Pakendikonteiner on aga sageli kodust kaugel, juhised on eri linnades erinevad ja keegi ei maksa sulle selle eest, et sa jogurtitopsi loputad. Kui hea tegu nõuab lisaaega ja keegi seda ei näe, jääb see sageli tegemata.',
        'Paljud kardavad ka eksida. Uuringute järgi loobuvad inimesed sorteerimisest sageli just sellepärast, et nad ei tea, kas rasvane pitsakarp on pakend või segaprügi. Kahtluse korral visatakse kõik ühte konteinerisse: siis vähemalt ei riku ma teiste tööd ära. Tegelikult on väike viga palju väiksem probleem kui terve sorteerimata kott. Pakendid läbivad sorteerimistehase, kus osa vigu parandatakse. Lisaks on juhised sageli ainult ühes keeles ja väikeses kirjas, nii et uus elanik ei leia neist vastust. Mõni naaber teeb siis nagu teised: kui konteineris on niikuinii kõik segamini, ei tundu oma pudeli sorteerimine enam mõttekas.',
        'Sorteerimata prügil on ka hind, mida maksavad kõik. Segaprügi vedu on kallim kui pakendite või biojäätmete vedu, sest segaprügi tuleb põletada. Kui maja konteiner on alati täis, tellib korteriühistu sagedasema veo ja kulu jagatakse kõigi korterite vahel. Nii maksab ka naaber, kes hoolikalt sorteerib, nende eest, kes seda ei tee. Biojäätmed aga muutuvad õige kogumise korral kompostiks või biogaasiks, millest saab kütust.',
        'Mõnes linnaosas tehtud katse näitab, mida mugavus muudab. Kui kortermajade juurde toodi pakendikonteiner ja trepikotta pandi lihtne pildiga juhis, vähenes segaprügi hulk juba mõne kuuga märgatavalt. Elanikud ei muutunud paremaks. Sorteerimine muutus lihtsamaks. Mõni maja vähendas oma kulusid veel sellega, et lepiti kokku suurte asjade äraveo päev: vana mööbel ei jää enam kuudeks hoovi seisma. Ka naabrid hakkasid omavahel rohkem rääkima, sest prügimaja ei olnud enam koht, kust kiiresti ära joostakse.',
        'Seega ei piisa sellest, kui inimesi ainult hoiatada või trahvida. Trahv võib küll lühikeseks ajaks aidata, kuid kui konteiner on endiselt kaugel, otsivad inimesed lihtsalt teise tee. Palju rohkem aitab, kui omavalitsus, vedaja ja korteriühistu teevad õige valiku lihtsaks: konteiner on maja juures, juhis on arusaadav ka neile kasutajatele, kes eesti keelt alles õpivad, ja tulemused on kõigile näha. Abiks võib olla ka linna rakendus, kust elanik saab kontrollida, kuhu mingi asi käib.',
        'Kas üksikinimene siis millegi eest ei vastuta? Vastutab küll. Kuid tema esimene samm ei pea olema täiuslik sorteerimine, vaid küsimus: mis on meie maja kõige suurem takistus? Kui vastus on teada, saab koosolekul teha ettepaneku, mis muudab rohkem kui ükski plakat.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Mis saab teksti järgi pandimärgiga pudelist, kui see viiakse poodi tagasi?', 'sellest saab uus tooraine'],
        ['Miks on pandisüsteemis õige valik ka kõige mugavam?', 'automaat on poes, kuhu niikuinii minnakse, ja raha tuleb tagasi'],
        ['Mida teevad paljud inimesed, kui nad ei tea, kuhu asi käib?', 'viskavad kõik ühte konteinerisse|viskavad kõik segaprügi hulka'],
        ['Miks on segaprügi vedu kallim kui pakendite vedu?', 'segaprügi tuleb põletada'],
        ['Miks maksab ka hoolikalt sorteeriv naaber teiste eest? Järelda.', 'sagedasema veo kulu jagatakse kõigi korterite vahel'],
        ['Mida tahab autor öelda lausetega „Elanikud ei muutunud paremaks. Sorteerimine muutus lihtsamaks.”? Järelda.', 'tulemus sõltub sellest, kui lihtsaks sorteerimine on tehtud, mitte inimeste iseloomust'],
        ['Miks ei usu autor, et trahv üksi aitab? Milline on tema hoiak?', 'kui konteiner on kaugel, otsitakse teine tee; õige valik tuleb teha lihtsaks'],
      ]), { task: 'R15', voice: 'article' }), 'Lugemine, umbes 25 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): enne lugemist vaatab õppija 1 minuti pealkirja ja lõikude esimesi lauseid ning ütleb, millest tekst räägib. Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Kordamise sõnad (korteriühistu, kulu, mugavus) on tekstis: lase need leida. Tekst on õppetekst ilma täpse statistikata.'), [
        '1. lõik: „Pudelist saab uus tooraine.”',
        '2. lõik: „Taaraautomaat on poes, kuhu inimene niikuinii läheb, ja iga pudeli eest saab väikese summa tagasi.”',
        '3. lõik: „Kahtluse korral visatakse kõik ühte konteinerisse.”',
        '4. lõik: „segaprügi tuleb põletada”.',
        'Järeldus 4. lõigust: ühistu „tellib … sagedasema veo ja kulu jagatakse kõigi korterite vahel”.',
        'Järeldus 5. lõigust: inimesed jäid samaks, muutus korraldus — konteiner ja juhis tegid sorteerimise lihtsaks.',
        'Järeldus 6. lõigust: „inimesed otsivad lihtsalt teise tee”; „Palju rohkem aitab, kui … teevad õige valiku lihtsaks.”',
      ]),
      teach(B.diagram('061_d_scheme', 'flow', { title: 'Skeem: kuhu asi läheb?', instruction: 'Kirjuta iga kasti juurde üks näide tekstist. Viimase kasti juurde kirjuta oma maja kõige suurem takistus.', nodes: 'Pudel pandimärgiga → taaraautomaat → uus tooraine\nPakend → pakendikonteiner → ringlusse\nKoored → biokonteiner → kompost või biogaas\nMis jääb sorteerimata → segaprügi → põletus, kallim vedu\nMinu maja takistus: …' }, 'full', 'g_read'),
        'Skeem on õppija otsuse alus jaamas 4: viimase kasti takistus (kaugus, juhis, ruum, hirm eksida) määrab, millise muudatuse ta valib esimeseks.'),
    ],
    practice: [
      station(teach(B.notice('061_p_notice', 'Märka: koored muutuvad kompostiks — pakend jääb sorteerimata', [
        'Artiklist: biojäätmed **muutuvad kompostiks** · suur osa **jääb sorteerimata** · pudelist **saab** uus tooraine · segaprügi hulk **vähenes** · maja **vähendas** kulusid',
        'Kordamine (B1): muutuma + -ks: hoov muutub puhtaks.',
        'B2, tulemus — muutuma, jääma, minema, tegema + -ks: kompost → **kompostiks**, kallis → **kallimaks**, puhas → **puhtamaks**, tühi → **tühjaks**',
        'B2, mida ei tehtud — jääma + -mata: **sorteerimata**, **viimata**, **loputamata**',
        'B2, muutub ise (-nema) või keegi muudab (-dama): hulk **vähenes** — ühistu **vähendas** hulka · olukord **paranes** — juhis **parandas** olukorda',
        'X-st saab Y (nimetav): pudelist saab uus pudel · võrdle: pudel **muutub** uueks pudeliks.',
        'Vene keeles „превращается в компост” (в + винительный) — eesti keeles saav kääne: muutub kompostiks; „остаётся несортированным” — jääb sorteerimata.',
      ], 'full'), 'Kordamine ühe minutiga (muutub puhtaks). Siis B2 samm: kolm tulemuse vormi ja -nema / -dama vahe. Lase õppijal leida artiklist kolm lauset ja öelda, kas asi muutub ise või keegi muudab seda. L1 rida: vene „в компост” ei ole eesti keeles „kompostisse”, vaid „kompostiks”.'), 3, 22),
      why(teach(tag(B.gaps('061_p_forms', 'Korteriühistu teade elanikele.', 'Kas vaja on tulemust (-ks), tegemata asja (-mata) või muutust (-nema / -dama)? Kirjuta sõna õiges vormis. Panka ei ole.', [
        'Hoovi tuleb biokonteiner ja koored muutuvad paari kuuga [kompostiks]. (kompost)',
        'Eelmisel aastal jäi meie majas suur osa pakenditest [sorteerimata]. (sorteerima)',
        'Kuna segaprügi on palju, läheb vedu järgmisest aastast [kallimaks]. (kallis)',
        'Pärast pakendikonteineri tulekut [vähenes] segaprügi hulk märgatavalt. (väike: muutus ise, minevik)',
        'Juhatus [vähendas] veokulusid, sest konteinerit tühjendatakse nüüd harvem. (väike: keegi muutis, minevik)',
        'Kogutud pudelitest ja purkidest [saab] uus tooraine. (saama, olevik)',
        'Pildiga juhis trepikojas [parandas] sorteerimist kõigis korterites. (parem: keegi muutis, minevik)',
        'Uus kaanega konteiner teeb hoovi suvel [puhtamaks]. (puhas, keskvõrre)',
        'Pudel, mis jääb poodi tagasi [viimata], ei saa uueks tooraineks. (viima)',
        'Pärast suurte asjade äraveo päeva jäi hoov lõpuks [tühjaks]. (tühi)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas siin on tulemus, tegemata asi või muutus? Kas asi muutub ise või keegi muudab?” Read 4–5 ja 7: -nema / -dama. Rida 6: X-st saab Y — tooraine on nimetavas. Lisaküsimus: „Mis jääb sinu majas kõige sagedamini sorteerimata?”'), [
        'muutuma + -ks: kompost → kompostiks.',
        'jääma + -mata: sorteerimata.',
        'minema + -ks keskvõrdes: kallis → kallimaks.',
        'Hulk muutub ise, minevik: vähenema → vähenes.',
        'Keegi muudab midagi, minevik: vähendama → vähendas.',
        'X-st saab Y: saab (Y = tooraine, nimetav).',
        'Miski muudab midagi, minevik: parandama → parandas.',
        'tegema + -ks keskvõrdes: puhas → puhtamaks.',
        'jääma + -mata: viimata.',
        'jääma + -ks: tühi → tühjaks.',
      ]),
      why(teach(tag(B.errorfix('061_p_fix', 'Naabrite sõnumid enne saatmist.', 'Naabrid kirjutavad maja vestlusrühma. Igas sõnumis on üks viga. Kirjuta sõnum õigesti.', [
        ['Kartulikoored muutuvad biokonteineris kompost.', 'Kartulikoored muutuvad biokonteineris kompostiks.'],
        ['Pool pakenditest jääb meie majas mitte sorteeritud.', 'Pool pakenditest jääb meie majas sorteerimata.'],
        ['Kogutud pudelist saab uueks pudeliks.', 'Kogutud pudelist saab uus pudel.|Kogutud pudel muutub uueks pudeliks.'],
        ['Pärast uut juhist segaprügi hulk vähendas.', 'Pärast uut juhist segaprügi hulk vähenes.|Pärast uut juhist vähenes segaprügi hulk.'],
        ['Juhatus vähenes eelmisel aastal prügiveo kulusid.', 'Juhatus vähendas eelmisel aastal prügiveo kulusid.'],
        ['Olukord meie hoovis on sel aastal parandanud.', 'Olukord meie hoovis on sel aastal paranenud.'],
        ['Prügivedu läheb järgmisel aastal kallis.', 'Prügivedu läheb järgmisel aastal kallimaks.'],
        ['Uus konteiner tegi meie hoov puhtamaks.', 'Uus konteiner tegi meie hoovi puhtamaks.'],
      ], 'full', 'g_notice'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis siin valesti on: kääne, vorm või tegusõna?” Read 4–6: kas asi muutub ise (-nema) või keegi muudab (-dama)? Rida 8: tegema millegi millekski — hoovi (osastav) puhtamaks (saav).'), [
        'muutuma + -ks: kompostiks.',
        'jääma + -mata: sorteerimata (mitte „mitte sorteeritud”).',
        'X-st saab Y nimetavas — või X muutub Y-ks.',
        'Hulk muutub ise: vähenes (vähendas vajab sihitist).',
        'Juhatus muudab midagi: vähendas kulusid.',
        'Olukord muutub ise: on paranenud.',
        'minema + -ks: kallimaks.',
        'tegema keda/mida millekski: hoovi puhtamaks.',
      ]),
      draft('061_p_draft', 'ettepaneku esimene lõik', 'Kirjuta juhatusele vähemalt 6 lauset: mis on praegu probleem ja mis muutub, kui midagi teha? Kasuta kolme tulemuse vormi.', 'Ülesande täitmine (probleem ja konkreetne ettepanek)', [6, 10]),
    ],
    transfer: [
      station(teach(mainTask(B.ideaCard('061_t_rank', 'Otsus: kolm muudatust meie majale (12–15 minutit).', 'Järjestage paarilisega kuus muudatust. Juhatusel on raha kolmeks. Leppige kokku kolm ja põhjendage iga valikut.', [
        'Teie maja segaprügi konteiner on alati täis, prügiveo arve kasvab ja hoovis seisab vana mööbel. Juhatus küsib elanikelt: millised kolm muudatust teha kõigepealt?',
        'Abikaart: Kõige tähtsam on …, sest siis väheneb … · Kui … jääb tegemata, läheb vedu kallimaks · Olen nõus, kui …',
        'Lisaväljakutse: ütle, mis on poole aasta pärast teisiti, ja leia üks samm, mis ei maksa midagi.',
      ], [
        'pakendikonteiner maja juurde',
        'biojäätmete konteiner kaanega',
        'pildiga sorteerimisjuhis kahes keeles trepikotta',
        'suurte asjade äraveo päev kord kuus',
        'prügimaja valgustus ja lukk',
        'naabrite infotund ja vestlusrühma meelespea',
      ], 'Kolm valitud muudatust järjekorras ja iga juurde üks lause: mis selle tulemusel muutub.', [180, 240]), 'ranking',
      ['Kõige tähtsam on …, sest siis väheneb …', 'Kui … jääb tegemata, läheb vedu kallimaks.', 'Olen nõus, kui …'],
      'Ütle, mis on poole aasta pärast teisiti, ja leia üks samm, mis ei maksa midagi.', { task: 'S12', fluency: true }),
      'Otsus (v6 §2 d, järjestamine): õigeid järjekordi ei ole — hinda põhjendust ja kokkulepet. Sina oled juhatuse teine liige. Varjatud info (ütle ükshaaval, kui paar on esimese järjekorra pannud): 1) „Vedaja ütles eile: pakendikonteineri annab ta tasuta, aga ainult lukustatud prügimajja.” (Õppijad peavad järjekorda muutma: valgustus ja lukk + pakendikonteiner koos.) 2) „Viienda korruse 80-aastane proua ütles, et ta ei jaksa hoovi teise otsa käia.” (Konteiner maja ukse lähedale või naabriabi.) Õnnestunud, kui õppija nimetab kolm muudatust järjekorras, põhjendab igat tulemusega (väheneb, muutub …-ks, jääb …-mata), reageerib uuele infole ja jõuab kokkuleppele. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 18, { final: 'decide' }),
      exitTalk('061_t_say', 'Ütle 30 sekundiga juhatusele, millised kolm muudatust te valisite ja mis nende tulemusel muutub.', ['Millised kolm muudatust te valisite?', 'Mis on poole aasta pärast teisiti?'], 'Kas õppija nimetab kolm muudatust järjekorras ja ütleb tulemuse vähemalt ühe -ks- või -mata-vormiga (hoov muutub puhtamaks, midagi ei jää sorteerimata)?'),
      teach(selfCheck('061_t_self', ['Leidsin artiklist põhjused ja järeldasin autori hoiaku.', 'Kasutasin tulemuse ja muutuse vorme (muutub kompostiks, jääb sorteerimata, vähenes).', 'Põhjendasin paarilisega kolme muudatuse järjekorda ja leppisime kokku.'], 'Otsus tehtud', 'Ma oskan muudatust ja selle tulemust põhjendada'),
        'Üks-ühele: sina oled paariline (juhatuse teine liige); õppija hindab kolmandat rida selle järgi, kas te jõudsite kokkuleppele.'),
      tag(homeTask(homeLines(B.examWriting('061_t_board', 'Kodus: ettepanek juhatusele (umbes 140 sõna).', `Lõpeta tunni mustand kirjaks (130–150 sõna). Pöördumist ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Kirjuta oma maja juhatusele, üürileandjale või ühiselamu juhatajale. Kasuta tunni otsust. Moodul 12: kirjuta oma andmepäringu (tund 59) kolm õpetaja märgitud lauset parandatult Harjutas „Minu vead” alla.',
        points: ['mis on praegu probleem (mis jääb sorteerimata, mis läheb kallimaks)', 'kolm muudatust tähtsuse järjekorras', 'mis nende tulemusel muutub (väheneb, muutub …-ks)', 'palve: arutada üldkoosolekul ja vastata kindlaks kuupäevaks'],
        words: [130, 150],
      }), 6)), { task: 'W13' }),
      writingRubric('061_t_rubric', 'Hindamisjuhend: ettepanek juhatusele (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Meie prügi on halb. Konteiner on alati täis ja pool prügist jääb mitte sorteeritud. Pange uus konteiner. Siis hoov muutub puhas. Vastake.” Hinnang: ülesanne 2 (probleem ja üks ettepanek on olemas, kuid kolm muudatust ja kuupäev puuduvad), ülesehitus 2 (järjekord on selge, sidendeid ei ole), sõnavara 2 (puuduvad segaprügi, prügivedu, kulu), grammatika 1 („jääb mitte sorteeritud” → jääb sorteerimata, „muutub puhas” → muutub puhtamaks); toon („Pange”, „Vastake”) on juhatusele liiga käskiv. Kui õppija lisab kolm muudatust järjekorras, viisaka palve (palun arutada, ootan vastust …) ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-062': {
    title: 'Toit prügikastis: miks me ostame rohkem, kui jõuame ära süüa?',
    phases: grammar('Kordamine: kuna oli soodushind, … · B2: soodushinna tõttu, tänu nimekirjale, selle tagajärjel, seetõttu ostame, …, mistõttu'),
    format: 'facts',
    topic: 'family',
    canDo: 'Ma saan aru umbes 4-minutilisest raadiosaatest toidu raiskamisest, küsin paariliselt infot ja lepin temaga kokku nädalavahetuse plaani ning kirjutan kaaslastele umbes 140-sõnalise köögi kokkuleppe; väljendan põhjust nimisõnaga (soodushinna tõttu, tänu nimekirjale) ja tagajärge (selle tagajärjel, mistõttu).',
    teacherPage: {
      goal: 'Радио о пищевых отходах; причина существительным (tõttu, tänu); инфолакуна: холодильник и план выходных; дома сообщение 140 слов + медиадневник.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — один раз и вопросы 1–7; станция 3 — правило и 10 предложений, черновик 3 предложения; инфолакуна без скрытой информации.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в черновике или письме правлению урока 061, и одной строкой говорит, что изменил. Вопрос, если есть время: «Что ты выбросил(а) последним — оно было испорчено или ещё съедобно?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (61)',
        '5–27: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: прочитать вопросы и предсказать ответы (2 мин), радио дважды (9 мин), 10 вопросов, из них 3 на вывод (5 мин), схема «причина — что помогает» (4 мин)',
        '27–50: станция 3 — kuna-предложение одной строкой (B1), B2: tõttu / tänu / selle tagajärjel / seetõttu / mistõttu; 10 предложений, 8 перефраз; черновик сообщения (10 мин), обратная связь — грамматика',
        '50–70: станция 4 — инфолакуна: у одного холодильник, у другого план выходных; не показывая карточки, составить план; вы вносите скрытую информацию',
        '70–75: выход: 30 секунд — план и причина; самооценка; домашнее задание: сообщение 140 слов + медиадневник, голосовое, Harjuta',
        'Kui aega jääb (75–90): игра «холодильник перед отпуском»: шесть продуктов, для каждого решение (съесть, заморозить, отдать, выбросить) с причиной',
      ],
      sources: 'Радио «Köögiraadio» — учебный текст KeeleSepp (ведущая Kristel и специалист Rasmus вымышлены), без точной статистики (раньше: 127 кг, 40 % / 24 %, 164 млн €, 4 млн кг — убраны). Общая основа: больше всего съедобной еды пропадает в домохозяйствах (Kliimaministeerium, план предотвращения пищевых отходов, 2023); «parim enne» — качество, «kõlblik kuni» — безопасность (Põllumajandus- ja Toiduamet); Toidupank собирает излишки магазинов; toidujagamise kapid есть в некоторых городах.',
      groups: 'Радио — каждый сам, вопросы на вывод сравнивают в паре. Черновик — каждый сам. Станция 4 — пары с карточками A и B (не показывать!); в 1:1 карточка B у вас.',
      errors: [
        '«Soodushind tõttu» → «soodushinna tõttu» (перед tõttu — родительный падеж).',
        '«Tänu nimekiri» / «tänu nimekirja» → «tänu nimekirjale» (tänu + аллатив, как русское «благодаря + дательный»).',
        '«Seetõttu me ostame vähem» → «Seetõttu ostame (me) vähem» (после seetõttu / selle tagajärjel глагол второй).',
        '«Naabri tõttu sain sooja toitu» → «Tänu naabrile …» (о хорошей причине — tänu).',
      ],
      notes: [
        'Инфолакуна (v6 §2 d, infogap): ученик должен спрашивать и объяснять, а не читать карточку. Еда — тема личная и денежная: не спрашивайте, сколько семья тратит; можно говорить о любой кухне (общежитие, родители, выдуманная семья).',
        'Студенту — общий холодильник; маме — детское пюре и остатки; пенсионеру — «раньше ничего не выбрасывали», это ценный опыт; уставшему — готовая еда и акции по дороге с работы.',
        'Слова на повтор (eelarve из урока 51, ostukorv из 52, uuring из 58) звучат в радио: попросите ученика поднять руку, когда услышит.',
      ],
    },
    discover: [
      station(revision('062_d_revise', 'b1b2-061', 'Kirjuta ümber kolm lauset, mille õpetaja sinu ettepanekus juhatusele märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('062_d_vocab', 'Tunni sõnad.', ['toidujäätmed — пищевые отходы', 'raiskama — тратить впустую', 'söödav — съедобный', 'halvaks minema — портиться', 'märgis — маркировка', 'kõlblik kuni — годен до', 'parim enne — лучше употребить до', 'ülejääk — остаток', 'külmutama — замораживать', 'annetama — жертвовать (отдавать даром)']), { topic: ['toidujäätmed', 'märgis', 'ülejääk', 'külmutama', 'parim enne', 'toidujagamise'] }), ['eelarve', 'ostukorv', 'uuring']), 2, 22),
      why(teach(tag(B.examListen('062_d_radio', 'Kuulamine: raadiosaade „Köögiraadio”.', 'Loe küsimused läbi ja ennusta vastused pliiatsiga. Kuula saadet kaks korda ja vali õige vastus.', 'choice', [
        'Kristel: Tere, siin „Köögiraadio”! Täna räägime toidust, mis jõuab prügikasti enne, kui keegi seda sööb. Stuudios on toiduohutuse spetsialist Rasmus. Rasmus, kus läheb kõige rohkem söödavat toitu raisku: poes, restoranis või kodus?',
        'Rasmus: Paljud arvavad, et poes. Tegelikult näitavad uuringud, et kõige suurem osa raisatud toidust tuleb kodudest. Poed on viimastel aastatel palju õppinud: osa toidust müüakse õhtul soodsamalt ja ülejääk annetatakse. Kodus ei näe keegi, mida me ära viskame, ja seetõttu ei märka me seda ka ise.',
        'Kristel: Miks me siis kodus nii palju ära viskame?',
        'Rasmus: Esimene põhjus on ostmine. Soodushinna tõttu paneme ostukorvi kolm pakki, kuigi vajame ühte. Kassas tundub, et säästsime raha, aga kui kaks pakki lähevad halvaks, ei säästnud me midagi. Teine põhjus on külmkapp: toit pannakse taha ja unustatakse sinna.',
        'Kristel: Ja kolmas?',
        'Rasmus: Kolmas on märgised. Paljud ei tee vahet „parim enne” ja „kõlblik kuni” vahel. „Parim enne” räägib kvaliteedist. Pärast seda kuupäeva võib küpsis olla vähem krõbe, aga seda võib süüa, kui pakend on terve ning toit näeb välja ja lõhnab normaalselt. „Kõlblik kuni” räägib ohutusest. Hakkliha või kala pärast seda kuupäeva enam ei sööda.',
        'Kristel: Nii et kui jogurt on paar päeva üle „parim enne” kuupäeva …',
        'Rasmus: … siis vaata, nuusuta ja maitse. Kui inimesed seda teavad, jõuab prügikasti palju vähem toitu. Ainult „kõlblik kuni” puhul ei tasu riskida.',
        'Kristel: Kuulajad küsivad sageli, kas toitu võib külmutada.',
        'Rasmus: Võib ja tasub. Leiba ja liha saab külmutada. Kõige parem on külmutada kohe, mitte viimasel päeval. Paljudes peredes on reede õhtu ülejääkide õhtu: süüakse ära kõik, mis nädala jooksul üle jäi. Tänu sellele lihtsale harjumusele väheneb raiskamine märgatavalt.',
        'Kristel: Aga kui toitu jääb ikkagi üle, näiteks pärast sünnipäeva?',
        'Rasmus: Siis anna edasi: naabrile, sõbrale, töökaaslasele. Mõnes linnas on toidujagamise kapid, kuhu võib panna pakendis toitu, mida teised saavad tasuta võtta. Poodide ülejäägi kogub Toidupank, kes jagab seda abivajajatele. Kodus tehtud toitu Toidupank tavaliselt vastu ei võta, sest selle ohutust ei saa kontrollida.',
        'Kristel: Kas lastega peres on raiskamist rohkem?',
        'Rasmus: Sageli küll, sest lapse maitse muutub iga nädalaga. Eile armastas ta jogurtit, täna mitte. Siin aitavad väiksemad portsjonid: pane taldrikule pigem vähem ja anna juurde, kui laps küsib. Ülejäänud toidu võib panna karpi ja süüa järgmisel päeval lõunaks. Paljud vanemad ütlevad, et tänu sellele on ka nende enda lõuna tööl odavam.',
        'Kristel: Ja poed? Kas nemad ei võiks rohkem teha?',
        'Rasmus: Võiksid. Paljud poed müüvad õhtul lühikese kuupäevaga toitu soodsamalt, aga suured pakid ja pakkumised „kolm ühe hinnaga” panevad meid ikka ostma rohkem, kui vajame. Seetõttu on ostja otsus lõpuks tähtsam kui poe reklaam.',
        'Kristel: Kas toidu raiskamine on ka raha küsimus?',
        'Rasmus: Väga suur. Iga ära visatud leib on ära visatud raha. Kui pere teeb nädala menüü ja ostunimekirja, jääb pere eelarvesse kuu lõpus märgatavalt rohkem raha. Ja kui toit läheb prügikasti, raiskame ka vett, energiat ja tööd, mis selle valmistamiseks kulus.',
        'Kristel: Mida soovitad inimesele, kes tahab homme alustada?',
        'Rasmus: Ära alusta suurest plaanist. Tee enne poodi minekut foto oma külmkapist. Poes vaata seda fotot, mitte reklaame. See võtab kümme sekundit, aga muudab kogu ostukorvi.',
        'Kristel: Aitäh, Rasmus!',
      ], [
        ['Kust tuleb Rasmuse sõnul kõige suurem osa raisatud toidust?', 'kodudest', 'poodidest', 'restoranidest', 'koolisööklatest'],
        ['Miks ei märka me Rasmuse sõnul ise, kui palju toitu kodus raisku läheb?', 'kodus ei näe keegi, mida ära visatakse', 'kodus visatakse ainult rikutud toitu', 'kodus ei ole prügikasti', 'kodus süüakse alati kõik ära'],
        ['Mis on Rasmuse sõnul toidu raiskamise esimene põhjus?', 'soodushinna tõttu ostetakse rohkem, kui vaja', 'toit on poes liiga kallis', 'külmkapid on liiga väikesed', 'pakendid on liiga suured'],
        ['Mida tähendab Rasmuse sõnul märgis „parim enne”?', 'kvaliteeti: pärast kuupäeva võib toitu sageli veel süüa', 'ohutust: pärast kuupäeva ei tohi toitu süüa', 'kuupäeva, millal toit valmistati', 'hinda, mis kehtib kuupäevani'],
        ['Mida ei tohi Rasmuse sõnul teha pärast „kõlblik kuni” kuupäeva?', 'süüa hakkliha või kala', 'süüa küpsiseid', 'toitu külmutada enne kuupäeva', 'toitu naabrile anda enne kuupäeva'],
        ['Millal on Rasmuse sõnul kõige parem toitu külmutada?', 'kohe, mitte viimasel päeval', 'viimasel päeval enne kuupäeva', 'alles pärast kuupäeva', 'ainult reede õhtul'],
        ['Miks ei võta Toidupank tavaliselt kodus tehtud toitu vastu?', 'selle ohutust ei saa kontrollida', 'seda on liiga palju', 'abivajajad ei taha seda', 'see ei mahu kappidesse'],
        ['Miks ei säästnud ostja Rasmuse arvates midagi, kuigi kassas tundus vastupidi? Järelda.', 'osa ostetud toidust läks halvaks ja raha läks prügikasti', 'soodushind oli tegelikult kõrgem', 'kassas tehti viga', 'ta ostis vale toote'],
        ['Mida tahab Rasmus öelda soovitusega teha enne poodi foto külmkapist? Järelda.', 'ostetakse seda, mida on vaja, mitte seda, mida reklaam pakub', 'külmkapp tuleb enne poodi koristada', 'poes tuleb kõik pildistada', 'fotot on vaja Toidupangale näitamiseks'],
        ['Milline on Rasmuse hoiak kogu saate jooksul? Järelda.', 'väikesed harjumused muudavad rohkem kui suured plaanid', 'toidu raiskamise eest vastutavad ainult poed', 'toidu raiskamist ei ole võimalik vähendada', 'kõik toidud tuleks kohe külmutada'],
      ], 'g_listen'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamine, umbes 22 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): õppija loeb küsimused, ennustab pliiatsiga ja kontrollib kuulates. Küsimused 8–10 on järeldusküsimused: küsi, millisele lausele vastus toetub. Kordamise sõnad (eelarve, ostukorv, uuring) on saates: lase õppijal käsi tõsta, kui ta neid kuuleb.'), [
        'Rasmus: „kõige suurem osa raisatud toidust tuleb kodudest”.',
        'Rasmus: „Kodus ei näe keegi, mida me ära viskame, ja seetõttu ei märka me seda ka ise.”',
        'Rasmus: „Soodushinna tõttu paneme ostukorvi kolm pakki, kuigi vajame ühte.”',
        'Rasmus: „„Parim enne” räägib kvaliteedist … seda võib süüa, kui pakend on terve …”',
        'Rasmus: „Hakkliha või kala pärast seda kuupäeva enam ei sööda.”',
        'Rasmus: „Kõige parem on külmutada kohe, mitte viimasel päeval.”',
        'Rasmus: „selle ohutust ei saa kontrollida”.',
        'Järeldus: „kui kaks pakki lähevad halvaks, ei säästnud me midagi”.',
        'Järeldus: „Poes vaata seda fotot, mitte reklaame.”',
        'Järeldus kogu saatest: „Ära alusta suurest plaanist”; foto, ülejääkide õhtu ja külmutamine on väikesed harjumused.',
      ]),
      teach(B.diagram('062_d_scheme', 'compare', { title: 'Skeem: miks toit raisku läheb — mis aitab?', instruction: 'Kuulates täida mõlemad pooled. Lisa kummalegi poole üks näide oma köögist.', left: 'Põhjus (… tõttu)', right: 'Mis aitab (tänu …)', leftItems: 'soodushind: kolm pakki ühe asemel\nunustatud toit külmkapi taga\n…\n…', rightItems: 'foto külmkapist enne poodi\n…\n…\n…' }, 'half', 'g_notice'),
        'Skeem täidetakse kuulates (teisel korral). Vasakule: soodushind, külmkapi tagumine riiul, märgiste segiajamine, liiga suur kogus peol. Paremale: foto ja nimekiri, ülejääkide õhtu, külmutamine kohe, edasiandmine (naaber, toidujagamise kapp, Toidupank poodidele). Skeem on õppija infolünga plaani alus.'),
    ],
    practice: [
      station(teach(B.notice('062_p_notice', 'Märka: soodushinna tõttu — tänu nimekirjale', [
        'Saatest: **soodushinna tõttu** paneme ostukorvi kolm pakki · **tänu sellele** harjumusele väheneb raiskamine · **seetõttu** ei märka me seda',
        'Kordamine (B1): kuna-lause: Kuna oli soodushind, ostsin kolm pakki.',
        'B2, põhjus nimisõnana: omastav + **tõttu** (halb või neutraalne põhjus): kuuma ilma tõttu · **tänu** + alaleütlev (hea põhjus): **tänu nimekirjale**, **tänu Toidupangale**',
        'B2, tagajärg uues lauses: **seetõttu** või **selle tagajärjel** + kohe tegusõna: Seetõttu **ostame** vähem. · samas lauses: …, **mistõttu** piim läks halvaks.',
        'Vene keeles „благодаря списку” (+ дательный) ja „из-за скидки” (+ родительный) — eesti keeles tänu nimekirjale (alaleütlev) ja soodushinna tõttu (omastav, tõttu järel).',
      ], 'full'), 'Kordamine ühe minutiga (kuna-lause). Siis B2 samm: põhjus nimisõnana (lühem, kirjalikum) ja tagajärg uues lauses tegusõnaga teisel kohal. Küsi iga näite juures: „Kas põhjus on hea või halb?” L1 rida: vene keeles on eessõna ees, eesti keeles on tõttu järel.'), 3, 23),
      why(teach(tag(B.gaps('062_p_forms', 'Meie köögi kokkulepe.', 'Kas põhjus on hea või halb? Kas tagajärg on uues lauses või samas? Kirjuta lünka õige sõna või vorm. Panka ei ole.', [
        'Kuuma ilma [tõttu] läks piim juba teisel päeval halvaks. (põhjus: hea või halb?)',
        '[Tänu] ostunimekirjale viskame nüüd vähem toitu ära. (põhjus: hea või halb?)',
        'Tänu [nimekirjale] ostame ainult seda, mida tõesti vajame. (nimekiri)',
        'Soodushinna [tõttu] ostsime kolm pakki jogurtit, kuigi vajasime ühte. (põhjus)',
        'Tänu [Toidupangale] jõuab poodide ülejääk abivajajateni. (Toidupank)',
        'Märgiseid ei mõistetud. [Selle tagajärjel] läks söödav toit prügikasti. (tagajärg uues lauses, kaks sõna)',
        'Külmkapp läks katki, [mistõttu] toit riknes. (tagajärg samas lauses)',
        'Eelmisel nädalal viskasime pool leiba ära. Seetõttu [ostame] nüüd väiksema pätsi. (ostma, olevik)',
        'Kodudes raisatakse kõige rohkem. [Seetõttu] tuleks alustada kodust. (tagajärg uues lauses, üks sõna)',
        'Tänu [naabrile] ei läinud sünnipäeva kook raisku. (naaber)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas põhjus on hea või halb? Kas tagajärg on uues lauses?” Read 1, 2, 4: tõttu või tänu sõltub põhjusest. Read 3, 5, 10: tänu + -le. Read 8–9: pärast seetõttu tuleb tegusõna kohe.'), [
        'Halb põhjus: omastav + tõttu.',
        'Hea põhjus: tänu + alaleütlev.',
        'tänu + alaleütlev: nimekiri → nimekirjale.',
        'Neutraalne põhjus, mis viis liigse ostuni: tõttu.',
        'tänu + alaleütlev: Toidupank → Toidupangale.',
        'Tagajärg uues lauses: selle tagajärjel + tegusõna (läks).',
        'Tagajärg samas lauses: koma + mistõttu.',
        'Pärast seetõttu on tegusõna kohe: ostame.',
        'Tagajärg uues lauses, üks sõna: seetõttu.',
        'tänu + alaleütlev: naaber → naabrile.',
      ]),
      why(teach(tag(B.transformation('062_p_cause', 'Kokkuleppe laused nimisõnaga.', 'Alusta antud sõnadega. Põhjus on nimisõna (tõttu, tänu) või tagajärg tuleb uues lauses.', [
        ['Kuna oli soodushind, ostsin kolm kotti kartuleid.', 'Soodushinna …', 'Soodushinna tõttu ostsin kolm kotti kartuleid.|Soodushinna tõttu ostsin ma kolm kotti kartuleid.'],
        ['Kuna sõber aitas, ei läinud peo toit raisku.', 'Tänu …', 'Tänu sõbrale ei läinud peo toit raisku.'],
        ['Kuna tööpäev oli pikk, jäi õhtusöök tegemata.', 'Pika tööpäeva …', 'Pika tööpäeva tõttu jäi õhtusöök tegemata.'],
        ['Me tegime nädala menüü. Nüüd jääb eelarvesse rohkem raha.', 'Tänu …', 'Tänu nädala menüüle jääb eelarvesse rohkem raha.'],
        ['Külmkapp oli liiga täis. Toit unustati taha.', 'Külmkapp oli liiga täis. Selle tagajärjel …', 'Külmkapp oli liiga täis. Selle tagajärjel unustati toit taha.'],
        ['Leib hakkas hallitama. Me viskasime selle ära.', 'Leib hakkas hallitama, mistõttu …', 'Leib hakkas hallitama, mistõttu me viskasime selle ära.|Leib hakkas hallitama, mistõttu viskasime selle ära.'],
        ['Pered ostavad liiga palju. Tuleb alustada kodudest.', 'Pered ostavad liiga palju. Seetõttu …', 'Pered ostavad liiga palju. Seetõttu tuleb alustada kodudest.|Pered ostavad liiga palju. Seetõttu tuleb kodudest alustada.'],
        ['Kuna majas on toidujagamise kapp, saavad naabrid ülejäägi kätte.', 'Tänu …', 'Tänu toidujagamise kapile saavad naabrid ülejäägi kätte.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Kokkuleppes on lühike põhjus nimisõnana täpsem kui pikk kuna-lause. Kontrolli: tõttu ees omastav (soodushinna, tööpäeva), tänu järel alaleütlev (sõbrale, menüüle, kapile), pärast selle tagajärjel ja seetõttu tegusõna kohe.'), [
        'Neutraalne põhjus: soodushinna tõttu; tegusõna kohe: ostsin.',
        'Hea põhjus: tänu sõbrale.',
        'Halb põhjus: pika tööpäeva tõttu.',
        'Hea põhjus: tänu nädala menüüle; tegusõna kohe: jääb.',
        'Tagajärg uues lauses: selle tagajärjel + tegusõna (unustati).',
        'Tagajärg samas lauses: …, mistõttu …',
        'Pärast seetõttu on tegusõna kohe: tuleb.',
        'Hea põhjus: tänu toidujagamise kapile.',
      ]),
      draft('062_p_draft', 'sõnumi esimene lõik', 'Kirjuta kaaslastele vähemalt 6 lauset: miks meie köögis toit raisku läheb ja mida me muudame? Kasuta kolme põhjuse või tagajärje väljendit.', 'Grammatika (tõttu, tänu + -le, tegusõna pärast seetõttu)', [6, 10]),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('062_t_gap', 'Infolünk: nädalavahetus ilma raiskamiseta (12–15 minutit).', 'Sinul on pool infost. Ära näita oma kaarti. Küsige teineteiselt ja koostage koos plaan: mida süüa, külmutada või ära anda.',
        'Kaart A — külmkapp reede õhtul:\nhakkliha, „kõlblik kuni” laupäev · pool pätsi leiba, „parim enne” eile · kolm pakki jogurtit, „parim enne” pühapäev · porgandid ja kapsas · avatud moosipurk · pool sünnipäevakooki\nAbikaart: Mille tõttu …? · Tänu …-le saame … · Selle tagajärjel …\nLisaväljakutse: leia üks toit toidujagamise kappi ja põhjenda, miks see sinna sobib.',
        'Kaart B — nädalavahetuse plaan:\nlaupäeval lõunaks tulevad kaks sõpra · laupäeva õhtul oled tööl kella kümneni · pühapäeva hommikul sõidate kaheks päevaks maale · sügavkülmikus on ruumi ühele karbile · naabril on kolm last ja nad armastavad kooki · sõbrad kinnitasid eile, et tulevad\nAbikaart: Mille tõttu …? · Tänu …-le saame … · Selle tagajärjel …\nLisaväljakutse: leia üks toit toidujagamise kappi ja põhjenda, miks see sinna sobib.',
        ['Mis sinu kaardil on?', 'Kuna …, siis …', 'Tänu sellele …'], ['Kas sul on …?', 'Selle tõttu …', 'Seetõttu …']), 'infogap',
      ['Mille tõttu …?', 'Tänu …-le saame …', 'Selle tagajärjel …'],
      'Leia üks toit toidujagamise kappi ja põhjenda, miks see sinna sobib.', { task: 'S05', fluency: true }),
      'Infolünk (v6 §2 d): kumbki teab pool. Õppijad peavad küsima ja seletama, kaarte näitamata. Üks-ühele: kaart B on sinul. Varjatud info (ütle viienda minuti lõpus): „Sõbrad helistasid: nad ei saa laupäeval tulla, nad tulevad hoopis pühapäeva õhtul.” (Aga pühapäeva hommikul sõidate maale — plaan tuleb muuta: hakkliha täna, kook naabrile, jogurt kaasa maale.) Õnnestunud, kui iga toidu kohta on otsus, vähemalt kolm otsust on põhjendatud põhjuse või tagajärjega (tõttu, tänu, selle tagajärjel, mistõttu), hakkliha ei jää pärast „kõlblik kuni” kuupäeva sööma ja paar reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'plan' }),
      exitTalk('062_t_say', 'Ütle 30 sekundiga, mida te nädalavahetusel toiduga teete ja miks. Kasuta üht tõttu- või tänu-väljendit.', ['Mida te teete kolme toiduga?', 'Mille tõttu just nii?'], 'Kas õppija ütleb plaani kolme toidu kohta ja põhjendab vähemalt üht põhjuse või tagajärje väljendiga (soodushinna tõttu, tänu naabrile, selle tagajärjel)?'),
      selfCheck('062_t_self', ['Sain raadiosaatest aru ja järeldasin spetsialisti hoiaku.', 'Kasutasin põhjust nimisõnaga ja tagajärge (tõttu, tänu, selle tagajärjel, mistõttu).', 'Küsisin ja seletasin kaarti näitamata ning tegime koos plaani.'], 'Plaan valmis', 'Ma oskan põhjust ja tagajärge selgelt öelda'),
      tag(homeTask(homeLines(mediaLog(B.examWriting('062_t_note', 'Kodus: köögi kokkulepe kaaslastele (umbes 140 sõna).', `Kirjuta tunni mustand sõnumiks lõpuni (130–150 sõna) ja täida meediapäevik. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Kirjuta korterikaaslastele, perele või ühiselamu köögi vestlusesse: mis meie köögis raisku läheb, mille tõttu ja milline kokkulepe sellest nädalast kehtib. Minu eesti keele võrgustik (meediapäevik): vali üks eestikeelne saade, taskuhääling või leht toidust või keskkonnast — näiteks ERR, https://www.err.ee. Kirjuta sõnumi alla kolm rida: mida kuulasid või lugesid, üks uus sõna ja üks lause selle kohta.',
        points: ['mis meie köögis kõige sagedamini raisku läheb', 'kaks põhjust (soodushinna tõttu, unustatud toit)', 'kolm kokkulepet (nimekiri, ülejääkide õhtu, külmutamine)', 'mis selle tagajärjel muutub (raha, aeg, vähem prügi)'],
        words: [130, 150],
      })), 6)), { task: 'W08' }),
      writingRubric('062_t_rubric', 'Hindamisjuhend: köögi kokkulepe (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Me viskame palju toitu. Soodushind tõttu me ostame palju. Tänu nimekiri see on parem. Seetõttu me ostame vähem. Okei?” Hinnang: ülesanne 2 (põhjus ja üks kokkulepe on olemas, kuid kolm kokkulepet ja tagajärg puuduvad), ülesehitus 2 (järjekord on selge, kuid lõike ja sidendeid on vähe), sõnavara 2 (puuduvad märgis, ülejääk, külmutama, raiskama), grammatika 1 („Soodushind tõttu” → soodushinna tõttu, „Tänu nimekiri” → tänu nimekirjale, „Seetõttu me ostame” → seetõttu ostame me). Kui õppija lisab kolm kokkulepet, tagajärje ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-063': {
    title: 'Põlevkivielekter lõpeb: millest elab Ida-Virumaa 2035. aastal?',
    phases: grammar('Kordamine: lugemine, õppimine · B2: töökohtade kadumine, enne koondamist, tehaste ehitamiseks; kaks korda kõrgem kui, … võrra väiksem'),
    format: 'debate',
    topic: 'work',
    canDo: 'Ma loen artiklit Ida-Virumaa üleminekust ja eri inimeste vaadetest, arutlen argumendikaardiga ja lepin paarilisega kokku ühise esimese sammu ning kirjutan kursusekaaslasele umbes 180-sõnalise arutluse; kasutan -mine-nimisõnu omastavaga ja võrdlen arve.',
    teacherPage: {
      goal: 'Статья о справедливом переходе Ида-Вирумаа; -mine с родительным, сравнение чисел; дебаты A / B, общий первый шаг; дома рассуждение 180 слов однокурснику.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); статья — абзацы 1–5 и вопросы 1–5; станция 3 — правило и 10 предложений, черновик 3 предложения; дебаты один раунд без новостной карточки.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три отмеченных предложения из сообщения урока 062 и одной строкой говорит, что изменил. Если есть время: «2035 — это слишком рано, вовремя или поздно? Одним словом и одной причиной».',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (62)',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: пробежать первые фразы абзацев и найти, чьи это голоса (1 мин), статья (7 мин), 7 вопросов, из них 3 на вывод (10 мин), схема «быстрее — постепенно» (5 мин)',
        '30–50: станция 3 — -mine одной строкой (B1), B2: родительный перед -mine, падежи -mine, сравнение чисел (korda, võrra, kui); 10 предложений, 8 перефраз; черновик рассуждения (10 мин), обратная связь — структура',
        '50–70: станция 4 — дебаты: карточки A и B, 6 минут, во втором раунде новость от вас (скрытая информация), общий первый шаг',
        '70–75: выход: 30 секунд — окончательная позиция и общий шаг; самооценка; домашнее задание: рассуждение 180 слов однокурснику, он отвечает «две звезды и пожелание»; голосовое; Harjuta',
        'Kui aega jääb (75–90): ролевая игра у консультанта Töötukassa — вы консультант, ученик называет три умения и одно желание учиться',
      ],
      sources: 'Статья «Kas üleminek saab olla õiglane?» — учебный текст KeeleSepp без точной статистики (раньше: 4000 работников, 11,6 % / 7,1 %, 340 млн €, до 2000 рабочих мест — убраны). Общая основа: Эстония прекращает производство электроэнергии из сланца в середине 2030-х (решение государства, цена выбросов CO₂ в ЕС), фонд справедливого перехода ЕС для Ида-Вирумаа, новые заводы и бизнес-парки, критика медленных решений (ERR, 2026); безработица в Ида-Вирумаа заметно выше средней по Эстонии. Люди в статье — собирательные, без имён.',
      groups: 'Статья — каждый сам, вопросы на вывод сравнивают в паре. Дебаты: пары A / B; в 1:1 ученик выбирает карточку, вы — другая сторона, во втором раунде меняетесь.',
      errors: [
        '«Elektri tootma lõpeb» → «Elektri tootmine lõpeb» (процесс как подлежащее — -mine).',
        '«Ma kardan töökohad kadumine» → «… töökohtade kadumist» (дополнение перед -mine — в родительном; kartma + частичный объект).',
        '«Sulgemine jaamade» → «jaamade sulgemine» (русское «закрытие станций» — в эстонском определение впереди).',
        '«Kaks korda kõrgem nagu …» → «kaks korda kõrgem kui …»; «10 protsenti väiksem» о разнице → «… võrra väiksem».',
      ],
      notes: [
        'Тема может быть личной: у ученика из Нарвы или Кохтла-Ярве в секторе могут работать он сам, муж, отец. Обе карточки уважительны. В начале скажите: «Мы спорим о порядке шагов, а не о людях». Ученику не из Ида-Вирумаа — свой край, где закрылся большой работодатель.',
        'Обмен с однокурсником (v6 G25): домашнее рассуждение уходит однокурснику, тот отвечает «две звезды и пожелание» по рубрике (в 1:1 — ученик другой группы или вы как «однокурсник» с рубрикой).',
        'Слова на повтор (kompromiss из урока 49, järeldus из 58, seisukoht из 60) есть в статье: попросите ученика найти их.',
      ],
    },
    discover: [
      station(revision('063_d_revise', 'b1b2-062', 'Kirjuta ümber kolm lauset, mille õpetaja sinu sõnumis kaaslastele märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('063_d_vocab', 'Tunni sõnad.', ['põlevkivi — горючий сланец', 'kaevandus — шахта (карьер)', 'tööstus — промышленность', 'heitmed — выбросы', 'töökoht — рабочее место', 'töötus — безработица', 'koondama — сокращать (работников)', 'ümberõpe — переобучение', 'üleminek — переход', 'õiglane — справедливый']), { topic: ['põlevkivi', 'kaevandus', 'heitmed', 'koondama', 'ümberõpe', 'üleminek', 'põlevkivielekter', 'automaatikatehnik', 'oskustööline'] }), ['kompromiss', 'järeldus', 'seisukoht']), 2, 25),
      why(teach(tag(B.reading('063_d_text', 'Loe artiklit.', 'Vaata enne lõikude esimesi lauseid ja leia, kelle hääled tekstis on (1 minut). Siis loe ja vasta. Küsimustele 5–7 järelda.', 'Kas üleminek saab olla õiglane?', [
        'Ida-Virumaal on põlevkivi olnud aastakümneid rohkem kui maavara. See on andnud tööd isale ja pojale, ehitanud linnu ja kujundanud inimeste uhkust. Nüüd on riik otsustanud, et põlevkivist elektri tootmine lõpeb järgmise kümnendi keskel. Põhjus on lihtne: heitmete eest tuleb Euroopas maksta üha rohkem ja põlevkivielekter on muutunud nii kalliks, et seda ostetakse üha harvem. Küsimus ei ole enam selles, kas tootmine lõpeb, vaid selles, kuidas üleminek inimeste jaoks välja näeb.',
        'Kaevanduses ja elektrijaamades töötab praegu mitu tuhat inimest. Palgad on seal piirkonna keskmisest märgatavalt kõrgemad. Paljudes peredes on kaevanduses või jaamas töötanud mitu põlvkonda ja töökoht on osa pere loost. Kui need töökohad kaovad, ei kao ainult sissetulek. Kaob ka põhjus, miks noored pered peaksid jääma Narva, Kohtla-Järvele või Sillamäele. Töötus on maakonnas juba praegu tunduvalt kõrgem kui Eestis keskmiselt, mõnel aastal peaaegu kaks korda. Seetõttu kardavad paljud, et töökohtade kadumine viib inimesed piirkonnast minema.',
        'Viiekümneaastane elektrik, kes on jaamas töötanud pool oma elu, ütleb, et ta ei karda tööd, vaid tundmatut. „Mulle räägitakse ümberõppest, aga keegi ei ütle, millise töö jaoks. Kolmekuuline kursus ei asenda kahtkümmend aastat kogemust.” Tema seisukoht on, et jaamu ei tohiks sulgeda enne, kui uued töökohad on päriselt olemas, mitte ainult paberil. Ta lisab, et tema vanuses inimesel on kodu, laen ja lapsed koolis, nii et kolimine ei ole lihtne.',
        'Kakskümmend aastat noorem automaatikatehnik, kes lõpetab kutsekooli, näeb olukorda teisiti. Tema kursuselt on mitmed saanud tööd uutes tehastes, mis on viimastel aastatel piirkonda ehitatud. „Elektrikut ja keevitajat on vaja ka uues tööstuses. Minu oskused ei kao.” Ta tunnistab siiski, et palk on uues tehases esialgu väiksem ja et paljud tema sõbrad on juba Tallinnasse või Soome kolinud. Tema arvates aitaks, kui kool ja tehased teeksid rohkem koostööd: praktika ajal näeks õpilane päris tööd ja tööandja näeks tulevast töötajat.',
        'Riik ja Euroopa Liit on piirkonnale lubanud suurt toetust. Raha eest ehitatakse ettevõtlusparke, toetatakse uute tehaste rajamist ja inimeste ümberõpet. Kriitikute sõnul on otsuste tegemine aga liiga aeglane ja mõni suur projekt on jäänud lubaduseks. Usaldusväärne on nende arvates ainult plaan, millel on tähtaeg ja vastutaja; kõik muu jääb kahtlaseks. Kohalik ettevõtja ütleb, et tal oleks vaja kümmet oskustöölist kohe, kuid koolitus kestab kaks aastat. „Raha ei loo usaldust. Usaldust loob tööleping.” Toetajad vastavad, et suured muutused ei toimu kunagi ühe aastaga ja et esimesed tulemused on juba näha: mõnes linnas on avatud uued töökojad ja kursused täiskasvanutele.',
        'Üleminekul on ka teine pool, millest räägitakse harvem. Kaevandamine on muutnud maastikku ja põhjavett ning õhk on mõnel pool olnud aastaid halvem kui mujal Eestis. Kui tootmine väheneb, muutub õhk puhtamaks ja piirkonna majandus ei sõltu enam ühest maavarast. Mõnda vana kaevandust kasutatakse juba praegu matka- ja puhkekohana, kuhu tuleb külastajaid ka teistest riikidest. Mõne uurija järeldus on, et Ida-Virumaa võib kümne aasta pärast olla mitmekesisem ja tervem kui praegu.',
        'Kas üleminek saab olla õiglane? Vastus sõltub sellest, kellelt seda küsitakse. Ilmselt ei leidu lahendust, mis sobiks kõigile. Kompromiss võiks olla selline: ümberõpe algab enne koondamist, mitte pärast seda, ja vanad jaamad suletakse alles siis, kui uued töökohad on samas piirkonnas olemas. See nõuab riigilt kiirust ja inimestelt julgust. Kui inimesed näevad, et otsuseid tehakse koos nendega, mitte nende eest, on ka raske muutus kergem vastu võtta.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Miks on põlevkivielekter teksti järgi muutunud kalliks?', 'heitmete eest tuleb maksta üha rohkem'],
        ['Mis kaob koos töökohtadega lisaks sissetulekule?', 'põhjus, miks noored pered peaksid piirkonda jääma'],
        ['Mida kardab viiekümneaastane elektrik kõige rohkem?', 'tundmatut|tundmatut, mitte tööd'],
        ['Miks ei arva noor automaatikatehnik, et tema oskused kaovad?', 'elektrikut ja keevitajat on vaja ka uues tööstuses'],
        ['Mida tahab ettevõtja öelda lausega „Usaldust loob tööleping”? Järelda.', 'lubadused ja raha ei piisa, inimesed usuvad päris töökohta'],
        ['Miks räägib autor ka ülemineku teisest poolest? Järelda.', 'et näidata, et üleminek toob ka kasu: puhtam õhk ja mitmekesisem majandus'],
        ['Milline on autori seisukoht? Millise kompromissi ta pakub?', 'ümberõpe enne koondamist; jaamad suletakse alles siis, kui uued töökohad on olemas'],
      ]), { task: 'R15', voice: 'article' }), 'Lugemine, umbes 25 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): enne lugemist leiab õppija lõikude esimestest lausetest, kelle hääled tekstis on (elektrik, noor tehnik, ettevõtja, riik, uurija). Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Kordamise sõnad (kompromiss, järeldus, seisukoht) on tekstis. Kui õppija on Ida-Virumaalt, küsi: „Kas tekst kirjeldab sinu linna õigesti?”'), [
        '1. lõik: „heitmete eest tuleb Euroopas maksta üha rohkem”.',
        '2. lõik: „Kaob ka põhjus, miks noored pered peaksid jääma …”',
        '3. lõik: „ta ei karda tööd, vaid tundmatut”.',
        '4. lõik: „Elektrikut ja keevitajat on vaja ka uues tööstuses.”',
        'Järeldus 5. lõigust: projektid on „jäänud lubaduseks”; usaldust loob päris leping, mitte lubatud raha.',
        'Järeldus 6. lõigust: „õhk muutub puhtamaks … majandus ei sõltu enam ühest maavarast” — autor näitab ka kasu.',
        'Järeldus 7. lõigust: „ümberõpe algab enne koondamist … jaamad suletakse alles siis, kui uued töökohad … on olemas”.',
      ]),
      teach(B.diagram('063_d_scheme', 'compare', { title: 'Skeem: kiiremini või järk-järgult?', instruction: 'Kirjuta mõlemale poolele argumendid tekstist. Lisa kummalegi poole üks oma näide.', left: 'Kiiremini (kaart A)', right: 'Järk-järgult (kaart B)', leftItems: 'heitmete hind kasvab\npuhtam õhk\n…\n…', rightItems: 'mitu tuhat hästi makstud töökohta\nkursus ei asenda kogemust\n…\n…' }, 'half', 'g_read'),
        'Skeem on õppija argumentide nimekiri jaamas 4. Vasakule: heitmete hind, puhtam õhk ja põhjavesi, mitmekesisem majandus, uued tehased vajavad töötajaid kohe. Paremale: hästi makstud töökohad, töötus kaks korda kõrgem, kursus ei asenda kogemust, projektid jäävad lubaduseks.'),
    ],
    practice: [
      station(teach(B.notice('063_p_notice', 'Märka: töökohtade kadumine — enne koondamist', [
        'Artiklist: elektri **tootmine** lõpeb · **töökohtade kadumine** viib inimesed minema · ümberõpe algab enne **koondamist** · otsuste **tegemine** on aeglane',
        'Kordamine (B1): -mine teeb tegusõnast tegevuse nime: lugema → lugemine.',
        'B2: sihitis läheb -mine ette omastavasse: ehitatakse tehaseid → **tehaste ehitamine** · palgad kasvavad → **palkade kasvamine**',
        'B2: -mine käändub: kardan töökohtade **kadumist** · raha tehaste **ehitamiseks** · räägime noorte **kolimisest**',
        'B2, arvude võrdlus: töötus on **kaks korda** kõrgem **kui** Eestis keskmiselt · palk on saja euro **võrra** väiksem · **võrreldes** eelmise aastaga',
        'Vene keeles „закрытие станций” (определение после) — eesti keeles laiend ette ja omastavasse: jaamade sulgemine.',
      ], 'full'), 'Kordamine ühe minutiga (lugemine). Siis B2 samm: omastav -mine ees, -mine käänded ja arvude võrdlus. Lase õppijal leida artiklist kolm -mine-sõna ja öelda, kes mida teeb. L1 rida: vene keeles on laiend järel (закрытие станций), eesti keeles ees (jaamade sulgemine).'), 3, 20),
      why(teach(tag(B.gaps('063_p_mine', 'Märkmed arutelu jaoks.', 'Kirjuta sulgudes olev sõna -mine-nimisõnana õiges vormis või lünka sobiv võrdluse sõna. Panka ei ole.', [
        'Vanade elektrijaamade [sulgemine] on riigi otsus, mitte ühe linna valik. (sulgema)',
        'Paljud kardavad hästi makstud [töökohtade kadumist]. (töökohad, kaduma)',
        'Ümberõpe peab algama juba enne [koondamist]. (koondama)',
        'Fondi raha kasutatakse uute [tehaste ehitamiseks]. (tehased, ehitama; milleks?)',
        'Raadios räägiti noorte [kolimisest] Tallinnasse ja Soome. (kolima; millest?)',
        'Põlevkivi [kaevandamine] on muutnud maastikku ja põhjavett. (kaevandama)',
        'Töötus on maakonnas peaaegu kaks [korda] kõrgem kui Eestis keskmiselt. (mitu …?)',
        'Uues tehases on palk esialgu saja euro [võrra] väiksem. (kui palju?)',
        '[Võrreldes] eelmise aastaga on uusi töökohti rohkem. (võrdlema)',
        'Ettevõtja sõnul on otsuste [tegemine] liiga aeglane. (tegema)',
      ], '', 'full', 'g_notice'), { task: 'G03' }),
      'Pärast iga rida küsi: „Kes mida teeb? Mis kääne siia sobib?” Rida 2: kartma + osastav (kadumist), laiend omastavas (töökohtade). Rida 4: milleks? → ehitamiseks. Read 7–9: arvude võrdlus (korda, võrra, võrreldes).'), [
        'Tegevus on alus: sulgema → sulgemine.',
        'kartma + osastav; laiend omastavas: töökohtade kadumist.',
        'enne + osastav: koondamist.',
        'Milleks? → saav kääne: tehaste ehitamiseks.',
        'Millest? → seestütlev: kolimisest.',
        'Tegevus on alus: kaevandamine.',
        'Mitu korda: kaks korda kõrgem kui …',
        'Vahe: saja euro võrra väiksem.',
        'võrreldes + kaasaütlev: võrreldes eelmise aastaga.',
        'Tegevus on alus: tegemine.',
      ]),
      why(teach(tag(B.transformation('063_p_nom', 'Arutelu laused lühemaks.', 'Alusta antud sõnadega. Kasuta -mine-sõna või arvude võrdlust.', [
        ['Kui jaamad suletakse, kaovad töökohad.', 'Jaamade …', 'Jaamade sulgemisel kaovad töökohad.|Jaamade sulgemise järel kaovad töökohad.|Jaamade sulgemine tähendab töökohtade kadumist.'],
        ['Kui palgad kasvavad, jäävad noored piirkonda.', 'Palkade …', 'Palkade kasvamise korral jäävad noored piirkonda.|Palkade kasvamisel jäävad noored piirkonda.'],
        ['Elektrit ei toodeta varsti enam põlevkivist.', 'Elektri tootmine …', 'Elektri tootmine põlevkivist lõpeb varsti.|Elektri tootmine põlevkivist lõpetatakse varsti.'],
        ['Paljud kardavad, et noored lahkuvad.', 'Paljud kardavad noorte …', 'Paljud kardavad noorte lahkumist.'],
        ['Inimesi tuleb ümber õpetada enne, kui neid koondatakse.', 'Ümberõpe peab algama enne …', 'Ümberõpe peab algama enne koondamist.|Ümberõpe peab algama enne inimeste koondamist.'],
        ['Maakonnas on töötuid kümme protsenti, Eestis keskmiselt viis.', 'Maakonnas on töötus kaks …', 'Maakonnas on töötus kaks korda kõrgem kui Eestis keskmiselt.'],
        ['Uues tehases saab ta 1500 eurot, vanas jaamas sai 1600.', 'Uues tehases on palk saja euro …', 'Uues tehases on palk saja euro võrra väiksem.|Uues tehases on palk saja euro võrra väiksem kui vanas jaamas.'],
        ['Tehaseid ehitatakse aeglaselt.', 'Tehaste …', 'Tehaste ehitamine on aeglane.|Tehaste ehitamine võtab aega.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Arutelus teeb -mine lause lühemaks ja ametlikumaks. Kontrolli: laiend omastavas ette (jaamade, palkade, noorte), õige kääne (sulgemisel, kasvamise korral, lahkumist, koondamist) ja võrdluses kui / võrra.'), [
        'kui jaamad suletakse → jaamade sulgemisel.',
        'kui palgad kasvavad → palkade kasvamise korral.',
        'ei toodeta → tootmine lõpeb.',
        'kartma + osastav: noorte lahkumist.',
        'enne + osastav: koondamist.',
        '10 ja 5: kaks korda kõrgem kui …',
        'Vahe 100 eurot: saja euro võrra väiksem.',
        'ehitatakse aeglaselt → tehaste ehitamine on aeglane.',
      ]),
      draft('063_p_draft', 'arutluse esimene lõik', 'Kirjuta 5–7 lauset: kas üleminek peaks olema kiire või järk-järguline? Seisukoht, põhjus ja näide. Kasuta kolme -mine-sõna.', 'Ülesehitus ja sidusus (seisukoht, põhjus, näide)'),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('063_t_debate', 'Arutelu: mida üleminekul kõigepealt teha? (12–15 minutit)', 'Vali kaart A või B. Ütle seisukoht ja kaks argumenti. Arutage 6 minutit ja jõudke ühise esimese sammuni.',
        'Kaart A (kiiremini). Seisukoht: põlevkivielektri tootmine tuleb lõpetada kiiresti ja raha suunata uutele tööstustele. Argumendid: heitmete hind kasvab iga aastaga; puhtam õhk on ka tervise küsimus; uued tehased vajavad töötajaid kohe. Lisa oma näide.\nAbikaart: Minu seisukoht on, et … · Võrreldes … on … · Tehaste ehitamine …\nLisaväljakutse: vasta partneri tugevaimale argumendile ja paku tingimus.',
        'Kaart B (järk-järgult). Seisukoht: jaamu ei tohi sulgeda enne, kui uued töökohad on päriselt olemas. Argumendid: mitu tuhat hästi makstud töökohta; töötus on juba praegu palju kõrgem kui Eestis keskmiselt; lubadus ei ole tööleping. Lisa oma näide.\nAbikaart: Minu seisukoht on, et … · Võrreldes … on … · Töökohtade kadumine …\nLisaväljakutse: vasta partneri tugevaimale argumendile ja paku tingimus.',
        ['Minu seisukoht on, et …', 'Võrreldes … on …', 'Kas me võiksime kokku leppida, et …?'], ['Ma saan aru, aga …', 'Töökohtade kadumine tähendab …', 'Meie ühine esimene samm on …']), 'debate',
      ['Minu seisukoht on, et …', 'Võrreldes … on …', 'Kas me võiksime kokku leppida, et …?'],
      'Vasta partneri tugevaimale argumendile ja paku tingimus.', { task: 'S17', harno: 'S2', fluency: true }),
      'Arutelu (v6 §2 d, väitlus): alguses ja lõpus hääletus (liiga vara / õigel ajal / liiga hilja). Üks-ühele: kui õppija valis A, mängi B ja vastupidi. Varjatud info (teise vooru alguses tõmba üks uudis ja ütle see): 1) „Uus tehas lükkas avamise kaks aastat edasi.” 2) „Kutsekool avab tasuta automaatikakursuse, töökoht on kursuse lõpus garanteeritud.” 3) „Talvel tõusis elektri hind kaks korda.” Õppijad peavad uudisele reageerima ja ühist sammu täpsustama. Õnnestunud, kui õppija esitab kaks argumenti näite või arvuga, kasutab vähemalt kolm -mine-sõna ja ühe arvude võrdluse ning te sõnastate ühise esimese sammu (näiteks: „Ümberõpe algab enne koondamist ja jaamad suletakse alles siis, kui …”). Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'negotiate' }),
      exitTalk('063_t_say', 'Ütle 30 sekundiga oma lõplik seisukoht ja teie ühine esimene samm. Kasuta üht -mine-sõna ja üht võrdlust.', ['Mis on sinu lõplik seisukoht?', 'Milles te kokku leppisite?'], 'Kas õppija ütleb seisukoha ja ühise sammu ning kasutab -mine-sõna omastavaga (jaamade sulgemine, töökohtade kadumine) ja võrdlust (kaks korda, … võrra)?'),
      selfCheck('063_t_self', ['Leidsin artiklist eri inimeste vaated ja järeldasin autori seisukoha.', 'Kasutasin -mine-sõnu omastavaga ja võrdlesin arve (kaks korda kõrgem kui, … võrra).', 'Kaitsesin oma seisukohta, reageerisin uudisele ja leppisime kokku esimese sammu.'], 'Arutelu peetud', 'Ma oskan seisukohta kaitsta ja kokku leppida'),
      teach(tag(homeTask(homeLines(peerReply(B.examWriting('063_t_essay', 'Kodus: arutlus kursusekaaslasele (umbes 180 sõna).', `Kirjuta tunni mustand arutluseks lõpuni (170–190 sõna). Pealkirja ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'arutlus', {
        situation: 'Kursuse uudiskiri kogub arvamusi teemal „Kas üleminek ilma põlevkivita saab olla õiglane?”. Võid kirjutada ka oma kodukohast, kus on kadunud mõni suur tööandja. Kursusekaaslane loeb sinu teksti ja vastab: kaks tugevat kohta ja üks soov.',
        points: ['seisukoht esimeses lõigus', 'kaks argumenti, igaühel näide või arv (võrdlusega)', 'vastuargument ja vastus sellele', 'järeldus: milline on õiglane esimene samm'],
        words: [170, 190],
      })), 6)), { task: 'W14' }),
        'Kaaslase vastus (v6 G25): õppija saadab arutluse kursusekaaslasele, kes vastab hindamisjuhendi järgi kahe tugeva koha ja ühe sooviga. Üks-ühele: kaaslane on teise rühma õppija või loed sina „kaaslasena” juhendi järgi; õppija parandab ühe koha soovi järgi.'),
      writingRubric('063_t_rubric', 'Hindamisjuhend: arutlus (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Minu arvates on üleminek halb. Töökohad kadumine on suur probleem. Töötus on kaks korda kõrgem nagu Eestis. Noored lähevad ära. Riik peab midagi tegema. Kokkuvõttes see ei ole õiglane.” Hinnang: ülesanne 2 (seisukoht ja argument on olemas, kuid vastuargument ja konkreetne esimene samm puuduvad), ülesehitus 2 (lõigud on, sidendid korduvad), sõnavara 2 (puuduvad ümberõpe, koondamine, tööstus), grammatika 1 („Töökohad kadumine” → töökohtade kadumine, „kaks korda kõrgem nagu” → kaks korda kõrgem kui). Kui õppija lisab vastuargumendi, esimese sammu ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-064': {
    title: 'Toas on 30 kraadi: kas su kodu ja naabrid on kuumalaineks valmis?',
    phases: grammar('Kordamine: kuigi …, siiski · B2: vaatamata kuumusele, vaatamata sellele, et …; ehkki …, oli; küll …, kuid; samas'),
    format: 'project',
    topic: 'health',
    canDo: 'Ma saan aru umbes 4-minutilisest raadiosaatest kuumalaine ohtudest, räägin paarilisega oma naabritest ja koostame trepikoja kuumaplaani ning kirjutan eakale naabrile umbes 140-sõnalise sõnumi, mis seletab lihtsas keeles kuumahoiatust; väljendan vastuväidet (vaatamata …, ehkki, küll …, kuid).',
    teacherPage: {
      goal: 'Радио о жаре; уступка (vaatamata, ehkki, küll … kuid); пазл: план подъезда из двух половин; дома сообщение пожилой соседке простым языком + ilmateenistus.ee.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — один раз и пропуски 1–7; станция 3 — правило и 10 предложений, черновик 3 предложения; пазл без скрытой информации.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три отмеченных предложения из рассуждения урока 063 (или из ответа однокурснику) и одной строкой говорит, что изменил. Если есть время: «Июль, третий день +30. Соседке 84, она два дня не выходит. Что ты делаешь первым?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (63)',
        '5–25: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: прочитать предложения с пропусками и найти ключевые слова (2 мин), радио дважды (9 мин), 10 пропусков (4 мин), схема плана (3 мин)',
        '25–47: станция 3 — kuigi … siiski одной строкой (модуль 5), B2: vaatamata + -le / sellele, et; ehkki; küll …, kuid; samas; 10 предложений, исправить 8 сообщений (со словами уроков 61–63); черновик сообщения соседке (10 мин), обратная связь — регистр и простой язык',
        '47–70: станция 4 — пазл: карточки A и B (по два соседа), не показывая, рассказать и составить план подъезда (кто, что, когда); вы — старшая по дому со скрытой информацией',
        '70–75: выход: 30 секунд — три шага плана; самооценка; домашнее задание: сообщение соседке 140 слов + три вещи с ilmateenistus.ee, голосовое, Harjuta',
        'Kui aega jääb (75–90): ролевая игра — звонок 112 о соседке с признаками теплового удара; вы — диспетчер',
      ],
      sources: 'Радио «Ohutusraadio» — учебный текст KeeleSepp (ведущая Liina и специалист Tarmo вымышлены), без точной статистики (раньше: >36 преждевременных смертей, +14–17 %, пороги 27 / 30 °C — убраны). Общая основа: предупреждения о жаре двух уровней (Keskkonnaagentuur вместе с Päästeamet и Terviseamet; ilmateenistus.ee, приложение), группы риска, признаки теплового удара и первая помощь, советы (вода, окна днём закрыты, проветривать ночью, вентилятор в очень жаркой комнате не охлаждает тело, связь с пожилыми, прохладные помещения) — Regions4Climate (2024) и Terviseamet.',
      groups: 'Радио — каждый сам, сверка в паре. Станция 4 — пары с карточками A и B (не показывать); в 1:1 карточка B у вас, вы же — старшая по дому.',
      errors: [
        '«Vaatamata kuumus» / «vaatamata kuumust» → «vaatamata kuumusele» (vaatamata + аллатив; русское «несмотря на жару» с винительным).',
        '«Vaatamata sellest, et …» → «Vaatamata sellele, et …» (калька с «несмотря на то, что»).',
        '«Ehkki oli palav, aga …» → «Ehkki oli palav, ei …» (после ehkki / kuigi без aga; главное предложение начинается с глагола).',
        '«Ventilaator küll töötab, ja …» → «… küll …, kuid …» (küll требует kuid / aga во второй части).',
      ],
      notes: [
        'Пазл (v6 §2 d, jigsaw): у каждого половина соседей; ученики рассказывают своими словами, а не читают карточку. Пенсионеру — он сам в группе риска: пусть план будет о нём и его соседях, без драматизма; маме — ребёнок до года тоже в группе риска; уставшему — работа на жаре.',
        'Посредничество (v6 §2 l) — домашнее сообщение: соседка не поняла предупреждение; ученик объясняет простыми словами, а не копирует текст сайта. Реальный документ (v6 G25): ilmateenistus.ee — автор страницу не открывал; проверьте сами перед уроком, где на сайте предупреждения.',
        'Слова на повтор (kontrollima из урока 57, vabatahtlik и teadetetahvel из 60) звучат в радио.',
      ],
    },
    discover: [
      station(revision('064_d_revise', 'b1b2-063', 'Sinu arutluses on kolm märgitud lauset. Kirjuta need parandatult ja lisa üks rida: mida muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('064_d_vocab', 'Tunni sõnad.', ['kuumalaine — волна жары', 'hoiatus — предупреждение', 'riskirühm — группа риска', 'eakas — пожилой', 'vedelik — жидкость', 'kuumarabandus — тепловой удар', 'jahutama — охлаждать', 'tuulutama — проветривать', 'kiirabi — скорая помощь', 'vaatamata — несмотря на']), { topic: ['kuumalaine', 'riskirühm', 'kuumarabandus', 'tuulutama', 'jahutama', 'kuumahoiatus', 'ilmaäpp', 'ventilaator'] }), ['kontrollima', 'vabatahtlik', 'teadetetahvel']), 2, 20),
      why(teach(tag(twiceInLesson(B.listening('064_d_radio', 'Kuulamine: raadiosaade „Ohutusraadio”.', 'Enne kuulamist loe laused ja leia võtmesõnad. Kuula kaks korda. Kirjuta igasse lünka 1–2 sõna.', [
        'Liina: Tere, siin „Ohutusraadio”! Suvi on ilus aeg, aga viimastel aastatel on Eestis üha sagedamini nädalaid, kui ka öösel ei lähe jahedaks. Stuudios on Päästeameti ennetusspetsialist Tarmo. Tarmo, kas kuumus on Eestis tõesti ohtlik?',
        'Tarmo: On küll. Paljud arvavad, et põhjamaal ei saa kuumus ohtlik olla. Vaatamata põhjamaisele kliimale tuleb meil kuumalaineid varasemast sagedamini ja need kestavad kauem. Kõige ohtlikum on see, kui ka öösel jääb toas üle kahekümne kraadi. Siis ei saa keha puhata.',
        'Liina: Kes on kõige suuremas ohus?',
        'Tarmo: Eakad, väikesed lapsed, lapseootel naised ja kroonilised haiged. Aga ka need, kes töötavad õues, näiteks ehitajad ja kullerid. Eakas inimene ei pruugi janu tunda, ehkki keha vajab vedelikku. Seepärast tuleb talle meelde tuletada, et ta jooks vett.',
        'Liina: Kuidas ma tean, et kuumalaine tuleb?',
        'Tarmo: Ilmateenistus annab hoiatuse. Hoiatusel on kaks taset: ohtlik ja väga ohtlik kuumus. Hoiatust näeb ilmateenistuse kodulehel ja ilmaäpis. Kui hoiatus tuleb, ära oota, vaid tee plaan valmis juba eelmisel õhtul.',
        'Liina: Mida see plaan kortermajas tähendab?',
        'Tarmo: Kõige tähtsamad on naabrid. Ametlik hoiatus küll jõuab telefoni, kuid ainult naaber märkab, et viienda korruse proua ei ole kaks päeva uksest välja tulnud. Hea mõte on panna trepikoja teadetetahvlile leht, kus on vabatahtlike nimed ja telefoninumbrid. Mõnes majas kirjutab keegi igal hommikul vestlusrühma: kas kõik on korras? Ja keegi kontrollib, kas kõik on vastanud.',
        'Liina: Ja kodus endas?',
        'Tarmo: Päeval hoia aknad ja kardinad kinni, eriti päikesepoolsel küljel. Tuuluta öösel ja varahommikul. Ventilaator küll liigutab õhku, kuid väga kuumas toas see keha ei jahuta. Kui kodus on liiga palav, mine mõneks tunniks jahedasse kohta: raamatukokku, kaubanduskeskusesse või linna jahedasse ruumi, kui selline on avatud.',
        'Liina: Aga kui inimene töötab õues, näiteks ehitusel?',
        'Tarmo: Siis tuleb tööandjaga kokku leppida. Raskem töö tehakse varahommikul, keskpäeval on pikem paus varjus ja vett peab olema piisavalt. Vaatamata sellele, et töö peab valmis saama, ei ole ükski tähtaeg tähtsam kui tervis. Kui töötajal tekib peavalu või iiveldus, peab ta kohe lõpetama.',
        'Liina: Ja väikesed lapsed?',
        'Tarmo: Last ei jäeta kunagi autosse, ka mitte paariks minutiks, sest auto läheb päikese käes väga kiiresti kuumaks. Lapsele pane heledad riided ja müts ning paku juua tihti, isegi kui ta ise ei küsi.',
        'Liina: Kuidas aru saada, et inimesel on kuumarabandus?',
        'Tarmo: Nahk on kuum ja kuiv, inimene on segaduses, tal on tugev peavalu ja süda lööb kiiresti. Siis tuleb tegutseda kohe. Vii ta jahedasse kohta, jahuta pead, kaela ja kaenlaaluseid märja rätikuga ja helista hädaabinumbrile üks-üks-kaks. Kui inimene on segaduses, ära anna talle juua, sest ta võib lämbuda.',
        'Liina: Kas sa soovitad konditsioneeri osta?',
        'Tarmo: Konditsioneer on küll kallis, kuid riskirühma inimesele võib see olla mõistlik. Samas aitavad ka odavad asjad: heledad kardinad, märg rätik, jahe dušš. Vaatamata sellele, et need tunduvad lihtsad, unustatakse need kuumaga kõige sagedamini.',
        'Liina: Mida soovitad kuulajale, kes tahab täna midagi teha?',
        'Tarmo: Kirjuta üles kolme naabri või sugulase number, keda kuumalaine ajal kontrollid. Ja helista neile juba täna, mitte siis, kui hoiatus on käes.',
        'Liina: Aitäh, Tarmo!',
      ], [
        'Tarmo sõnul on kõige ohtlikum see, kui toas jääb palavaks ka [öösel] ja keha ei saa puhata.',
        'Eakas inimene ei pruugi tunda [janu], kuigi tema keha vajab kuuma ilmaga rohkem vedelikku.',
        'Ilmateenistuse kuumahoiatusel on kaks [taset]: ohtlik ja väga ohtlik kuumus.',
        'Hoiatust näeb ilmateenistuse kodulehel ja [ilmaäpis|äpis], nii et plaani võib teha juba eelmisel õhtul.',
        'Ametlik hoiatus jõuab küll telefoni, kuid ainult [naaber] märkab, et eakas proua ei ole päevi välja tulnud.',
        'Trepikoja teadetetahvlile võib panna lehe vabatahtlike nimede ja [telefoninumbritega|numbritega], et igaüks teaks, kellele helistada.',
        'Päeval tuleb hoida aknad ja [kardinad] kinni, eriti korteri päikesepoolsel küljel.',
        'Väga kuumas toas õhku liigutav [ventilaator] Tarmo sõnul keha tegelikult ei jahuta.',
        'Kui inimene on kuumarabanduse tõttu segaduses, ei tohi talle anda [juua|vett], sest ta võib lämbuda.',
        'Tarmo soovitab naabritele või sugulastele helistada juba [täna], mitte alles hoiatuse ajal.',
      ], 'g_listen')), { voice: 'interview', task: 'L04', harno: 'L3' }),
      'Kuulamine, umbes 20 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): õppija loeb lüngaga laused, joonib võtmesõnad ja ennustab, mis sõna puudub. Eksaminurk (Harno B2 L3): 1–2 sõna, kirjaviga on viga, kui tähendus kaob. Kordamise sõnad (kontrollima, vabatahtlik, teadetetahvel) on saates.'), [
        'Tarmo: „kui ka öösel jääb toas üle kahekümne kraadi”.',
        'Tarmo: „Eakas inimene ei pruugi janu tunda, ehkki keha vajab vedelikku.”',
        'Tarmo: „Hoiatusel on kaks taset.”',
        'Tarmo: „ilmateenistuse kodulehel ja ilmaäpis”.',
        'Tarmo: „ainult naaber märkab …”.',
        'Tarmo: „leht, kus on vabatahtlike nimed ja telefoninumbrid”.',
        'Tarmo: „Päeval hoia aknad ja kardinad kinni.”',
        'Tarmo: „Ventilaator küll liigutab õhku, kuid väga kuumas toas see keha ei jahuta.”',
        'Tarmo: „Kui inimene on segaduses, ära anna talle juua.”',
        'Tarmo: „helista neile juba täna”.',
      ]),
      teach(B.diagram('064_d_scheme', 'flow', { title: 'Skeem: meie maja kuumaplaan', instruction: 'Kuulates kirjuta iga kasti juurde üks samm. Viimasesse kasti kirjuta, kes sinu majas on riskirühmas.', nodes: 'Hoiatus tuleb: kust ma seda näen?\nEelmisel õhtul: kes kontrollib keda?\nPäeval: aknad, kardinad, vesi\nÖösel: …\nKui keegi jääb haigeks: …\nMeie majas on riskirühmas: …' }, 'full', 'g_notice'),
        'Skeem täidetakse kuulates (teisel korral) ja on pusleülesande plaan: hoiatus (koduleht, äpp) → nimekiri ja numbrid teadetetahvlil → aknad ja kardinad päeval kinni, vesi → tuulutamine öösel → kuumarabanduse korral jahedasse, jahutada, 112, mitte juua anda segaduses inimesele.'),
    ],
    practice: [
      station(teach(B.notice('064_p_notice', 'Märka: vaatamata kuumusele', [
        'Saatest: **vaatamata põhjamaisele kliimale** tuleb kuumalaineid sagedamini · eakas ei tunne janu, **ehkki** keha vajab vedelikku · ventilaator **küll** liigutab õhku, **kuid** ei jahuta · **samas** aitavad odavad asjad',
        'Kordamine (moodul 5): kuigi …, siiski: Kuigi oli palav, jõi ta vähe vett.',
        'B2: **vaatamata** + alaleütlev: vaatamata **kuumusele**, vaatamata **hoiatusele** · terve lausega: vaatamata **sellele**, et …',
        'B2: **ehkki** = kuigi, kirjalikum. Pärast kõrvallauset tuleb pealauses tegusõna kohe: Ehkki aken oli lahti, **oli** toas palav. Sõna „aga” ei lisata.',
        'B2: **küll …, kuid** — tunnistad üht poolt ja ütled teise: Konditsioneer on küll kallis, kuid … · **samas** = teisalt.',
        'Vene keeles „несмотря на жару” (на + винительный) ja „несмотря на то, что” — eesti keeles vaatamata kuumusele (alaleütlev) ja vaatamata sellele, et … (mitte „sellest”).',
      ], 'full'), 'Kordamine ühe minutiga (kuigi …, siiski). Siis B2 samm: vaatamata + alaleütlev, ehkki koos tegusõnaga pealause alguses, küll …, kuid. Lase õppijal leida saatest (skeemi märkmetest) kaks lauset ja öelda, mida kõneleja tunnistab ja mida ta siiski ütleb. L1 rida: „несмотря на” + винительный → eesti keeles alaleütlev.'), 3, 22),
      why(teach(tag(B.gaps('064_p_forms', 'Maja vestlusrühm kuumalaine ajal.', 'Vali ise: vaatamata, ehkki, küll …, kuid või samas. Kirjuta lünka õige sõna või vorm. Panka ei ole.', [
        'Vaatamata [kuumusele] läks eakas naaber keskpäeval aeda. (kuumus)',
        'Vaatamata [hoiatusele] jättis keegi akna päeval lahti. (hoiatus)',
        'Vaatamata [sellele], et ventilaator töötas, oli toas 30 kraadi. (see)',
        '[Ehkki] öösel tuulutasime, oli hommikul ikka palav. (kirjalik kuigi)',
        'Ehkki aken jäi terve öö lahti, [oli] lapse toas hommikul 29 kraadi. (olema, minevik)',
        'Konditsioneer on [küll] kallis, kuid riskirühma inimesele võib see päästa elu. (tunnistad üht poolt)',
        'Ventilaator küll liigutab õhku, [kuid] keha see väga kuumas toas ei jahuta. (teine pool)',
        'Meie linnas on parke palju. [Samas] on kesklinnas varju vähe. (teisalt)',
        'Vaatamata põhjamaisele [kliimale] tuleb kuumalaineid varasemast sagedamini. (kliima)',
        'Ehkki ta oli väsinud, [helistas] ta igal hommikul eakale naabrile. (helistama, minevik)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Mida lause tunnistab ja mida ta siiski ütleb?” Read 1–3 ja 9: vaatamata + alaleütlev (kuumusele, hoiatusele, sellele, kliimale). Read 5 ja 10: pärast ehkki-lauset on tegusõna pealause alguses. Read 6–8: küll …, kuid ja samas.'), [
        'vaatamata + alaleütlev: kuumus → kuumusele.',
        'vaatamata + alaleütlev: hoiatus → hoiatusele.',
        'vaatamata sellele, et … (see → sellele).',
        'ehkki = kuigi, kirjalikum.',
        'Pärast ehkki-lauset on pealause tegusõna kohe: oli.',
        'küll …, kuid: tunnistad üht poolt.',
        'küll …, kuid: teine pool.',
        'samas = teisalt, uue lause algus.',
        'vaatamata + alaleütlev: kliima → kliimale.',
        'Pärast ehkki-lauset on tegusõna kohe: helistas.',
      ]),
      why(teach(tag(B.errorfix('064_p_fix', 'Naabrite sõnumid enne saatmist.', 'Need sõnumid on kuumalaine ajal maja vestlusrühmas. Igas on üks viga. Kirjuta sõnum õigesti.', [
        ['Vaatamata kuumus läksime pärastlõunal trenni.', 'Vaatamata kuumusele läksime pärastlõunal trenni.'],
        ['Vaatamata sellest, et hoiatati, jäi aken päeval lahti.', 'Vaatamata sellele, et hoiatati, jäi aken päeval lahti.'],
        ['Ehkki toas oli 30 kraadi, aga proua ei avanud öösel akent.', 'Ehkki toas oli 30 kraadi, ei avanud proua öösel akent.'],
        ['Ehkki oli juba öö, temperatuur ei langenud.', 'Ehkki oli juba öö, ei langenud temperatuur.'],
        ['Ventilaator küll töötab, ja tuba on ikka palav.', 'Ventilaator küll töötab, kuid tuba on ikka palav.|Ventilaator küll töötab, aga tuba on ikka palav.'],
        ['Kuumus tõttu ei saanud ma terve öö magada.', 'Kuumuse tõttu ei saanud ma terve öö magada.'],
        ['Juulis muutub meie lõunapoolne korter väga palav.', 'Juulis muutub meie lõunapoolne korter väga palavaks.'],
        ['Akende sulgema päeval aitab hoida tuba jahedana.', 'Akende sulgemine päeval aitab hoida tuba jahedana.'],
      ], 'full', 'g_notice'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis siin valesti on: kääne, sõnajärg või sõna?” Read 6–8 on varasematest tundidest (Varasemast): tõttu + omastav (62), muutuma + -ks (61), -mine (63).'), [
        'vaatamata + alaleütlev: kuumusele.',
        'Õige väljend: vaatamata sellele, et … (mitte sellest).',
        'Pärast ehkki-lauset ei ole sõna „aga”; pealause algab tegusõnaga: ei avanud.',
        'Pärast kõrvallauset on tegusõna kohe: ei langenud temperatuur.',
        'küll …, kuid (või aga): teine pool vajab vastandavat sidendit.',
        'tõttu + omastav: kuumuse tõttu (tund 62).',
        'muutuma + -ks: palavaks (tund 61).',
        'Tegevus on alus: sulgema → sulgemine (tund 63).',
      ]),
      draft('064_p_draft', 'sõnumi esimene lõik', 'Kirjuta eakale naabrile vähemalt 6 lauset lihtsas keeles: mida hoiatus tähendab ja mida ta homme teeb? Kasuta kahte vastuväite vormi.', 'Ülesande täitmine ja register (lihtne keel, sõbralik toon)', [6, 10]),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('064_t_plan', 'Pusle: trepikoja kuumaplaan (12–15 minutit).', 'Sul on pool infot naabrite kohta. Ära näita kaarti. Räägi oma naabritest ja koostage koos plaan: kes, mida ja millal teeb.',
        'Kaart A — naabrid 2. ja 3. korrusel:\npere 8-kuuse lapsega: laps magab päeval mitu tundi, isa töötab päeval ehitusel õues · öövahetuses töötaja: magab päeval kella üheksast neljani, aknad on päikese poole\nMaja reegel: trepikoja uks on öösel lukus.\nAbikaart: Minu naaber on ohus, sest … · Ehkki …, saab ta … · Vaatamata sellele, et …, …\nLisaväljakutse: leia üks samm, mis ei maksa midagi, ja üks, mis vajab maja raha.',
        'Kaart B — naabrid 4. ja 5. korrusel:\nproua (84): elab üksi, korter on lõunapoolne, ta ei kuule telefoni hästi · üliõpilane: on suvel kodus, autot ei ole, tahab aidata\nTeade: raamatukogu jahe saal on avatud iga päev kümnest kaheksani.\nAbikaart: Minu naaber on ohus, sest … · Ehkki …, saab ta … · Vaatamata sellele, et …, …\nLisaväljakutse: leia üks samm, mis ei maksa midagi, ja üks, mis vajab maja raha.',
        ['Minu kaardil on …', 'Ta on ohus, sest …', 'Ehkki …, …'], ['Kes saaks …?', 'Vaatamata sellele, et …', 'Lepime kokku: …']), 'jigsaw',
      ['Minu naaber on ohus, sest …', 'Ehkki …, saab ta …', 'Vaatamata sellele, et …, …'],
      'Leia üks samm, mis ei maksa midagi, ja üks, mis vajab maja raha.', { task: 'S10', fluency: true }),
      'Pusle (v6 §2 d): kumbki teab kahte naabrit; õppijad räägivad oma sõnadega ja panevad plaani kokku (vähemalt neli sammu: kes, mida, millal). Üks-ühele: kaart B on sinul. Sina oled ka maja vanem. Varjatud info (ütle ükshaaval): 1) „Proua ütles mulle, et ta ei taha, et teda iga päev segatakse.” (Õppija: kokkulepe — üks kõne kell 12 või märk uksel, mitte külaskäik.) 2) „Üliõpilane sõidab nädalavahetusel ära.” (Kes teda asendab?) Õnnestunud, kui plaanis on neli sammu, iga naabri risk on nimetatud, õppija kasutab vähemalt kaks vastuväite vormi (vaatamata …, ehkki, küll …, kuid) ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 23, { final: 'explain' }),
      exitTalk('064_t_say', 'Ütle 30 sekundiga naabritele teie plaani kolm sammu. Kasuta üht vastuväite vormi: vaatamata, ehkki või küll …, kuid.', ['Millised on plaani kolm sammu?', 'Kes on kõige suuremas ohus ja miks?'], 'Kas õppija ütleb kolm sammu (kes, mida, millal) ja kasutab vähemalt üht vastuväite vormi õigesti (vaatamata kuumusele, ehkki …, tegusõna kohe)?'),
      selfCheck('064_t_self', ['Sain raadiosaatest aru, mida kuumalaine ajal teha ja kes on ohus.', 'Kasutasin vastuväite vorme (vaatamata kuumusele, ehkki, küll …, kuid).', 'Rääkisin oma naabritest kaarti näitamata ja panime koos plaani kokku.'], 'Kuumaplaan valmis', 'Ma oskan naabritega kuumaplaani teha'),
      tag(homeTask(homeLines(B.examWriting('064_t_note', 'Kodus: sõnum eakale naabrile (umbes 140 sõna).', `Lõpeta tunni mustand sõnumiks (130–150 sõna). Algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Eakas naaber ei saanud kuumahoiatusest aru. Seleta lihtsas keeles, mida hoiatus tähendab ja mida ta teeb. Päris allikas: Riigi ilmateenistus (https://www.ilmateenistus.ee) — leia hoiatuste leht ja kirjuta üles kolm asja: kus hoiatusi jälgida, mida tähendab hoiatuse tase ja mida lubatakse homseks. Lisa need sõnumisse. Kui naaber annab nõusoleku, lisa tema number maja nimekirja.',
        points: ['mida hoiatus tähendab (lihtsas keeles, info ilmateenistuse lehelt)', 'mida ta päeval ja öösel kodus teeb', 'kuumarabanduse tunnused ja millal helistada 112', 'kes ja millal teda kontrollib (teie maja plaan)'],
        words: [130, 150],
      }), 6)), { task: 'W12' }),
      writingRubric('064_t_rubric', 'Hindamisjuhend: sõnum eakale naabrile (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Homme on kuumalaine hoiatus 1. tase. Vaatamata kuumus joo vett. Ehkki on palav, aga ära ava aken. Kui halb, helista. Head päeva!” Hinnang: ülesanne 2 (hoiatus ja üks nõuanne on olemas, kuid kuumarabanduse tunnused ja maja plaan puuduvad), ülesehitus 2 (lühikesed laused, järjekord on selge), sõnavara 2 (puuduvad tuulutama, kuumarabandus, kiirabi), grammatika 1 („Vaatamata kuumus” → vaatamata kuumusele, „Ehkki on palav, aga ära ava aken” → Ehkki on palav, ära ava päeval akent); register: „1. tase” jääb eakale arusaamatuks — seleta lihtsalt. Kui õppija lisab tunnused, plaani ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-065': {
    title: 'Kontroll 13 — keskkond ja vastutus',
    format: 'exam',
    assessment: true,
    canDo: 'Ma loen eksami vormis umbes 500-sõnalist arvamusartiklit asjade parandamisest ja lahendan selle ülesanded ning kirjutan kaks teksti: viie minutiga arvamuse samades tingimustes nagu mooduli alguses ja umbes 140-sõnalise kirja prügiveofirmale; Harno lävi on 60 %.',
    teacherPage: {
      goal: 'Контроль модуля 13 на одном листе, 45 минут: чтение (16 баллов) + письмо (18 баллов). Параллельная задача к холодной задаче урока 061 и письмо фирме по вывозу мусора с аналитической рубрикой.',
      core: [1], alt: 1,
      short: 'Если времени мало: чтение (22 мин) в классе, письмо 2 — дома в тех же условиях (без словаря, 20 минут).',
      hook: 'Почему чтение + письмо, а не полный пробный экзамен: решение методиста для 040, 055 и 060 — по v6 §2 g контроль B2 — два навыка по очереди (модуль 11 R + W, модуль 12 L + S, модуль 13 R + W); следующий полный пробный экзамен — 080. Холодная задача модуля письменная (061_d_cold), поэтому и параллельная задача письменная; счёт за вывоз мусора и статья «чинить или купить» приходят к ученику текстом, а отвечает он письмом (Harno B2 W1).',
      plan: [
        '0–2: инструкция, баллы и пороги (Harno 60 %, KeeleSepp 70 % и 80 %, ни одна часть не 0)',
        '2–24: чтение — статья ≈ 500 слов: часть 1 — 8 коротких ответов (1–3 слова), часть 2 — 8 вопросов с выбором, из них 3 на вывод',
        '24–29: письмо 1 — параллельная задача: 5 минут, 5–7 предложений, новое утверждение (те же условия, что 061_d_cold)',
        '29–45: письмо 2 — письмо фирме по вывозу мусора 130–150 слов, аналитическая рубрика 12 баллов',
      ],
      sources: 'Статья «Parandada, jagada või osta uus?» — учебный текст KeeleSepp (мнение автора), без точной статистики. Общая основа: требования ЕС к запасным частям и инструкциям по ремонту (право на ремонт), ремонтные кафе и прокат инструментов в библиотеках, приём электроники в пунктах сбора и магазинах бесплатно. Ситуация письма — учебная.',
      groups: 'Каждый сам, без словаря. Устная часть модуля проверяется в уроках (выходы 061–064).',
      errors: [
        'Varasemast (≈ 20 %, v6 §2 f): часть 1 вопросы 3 (kogukulu, урок 54) и 5 (vabatahtlikud, урок 60), часть 2 вопрос 4 (tellimus, урок 51) — 3 из 16 заданий чтения; в письме 2 — претензия с доказательством и сроком ответа (модуль 11, уроки 53 и 55).',
        'Сравнение с холодной задачей: положите рядом листы 061_d_cold и 065_t_cold (оба утверждения — «обязать и штрафовать») и назовите ученику одно развитие и один следующий шаг.',
      ],
      notes: [
        'Баллы: чтение 8 + 8 = 16; письмо 1 — 6 баллов по трём строкам 0/1/2; письмо 2 — 12 баллов (4 критерия × 0–3). Всего 34. Harno 60 % = 21, KeeleSepp 70 % = 24, 80 % = 28. Ни одна часть не может быть 0 баллов.',
      ],
    },
    // Methodology v5 + v6 (2026-11-26): one sheet, 45 minutes, ≤ 10 blocks, READING + WRITING; points add up (v6 G20: R 16
    // items = 16 points; W 6 + 12 = the rubrics' maxima), the no-zero rule is stated (G21), the reading is at least the
    // lessons' level (≈ 520 words, 3 inference questions), the cold → parallel writing is the same task (5 min, 5–7
    // sentences, „obligate and fine”) with a new statement. The v4 control (three sheets, 28 blocks, ≈ 167 min) stays hidden.
    discover: [
      B.text('065_d_intro', 'Kontroll 13: lugemine ja kirjutamine (45 minutit)', 'Kontrollis on kaks osaoskust. Lugemine (22 minutit): üks arvamusartikkel ja kaks ülesannet ilma sõnaraamatuta, 16 punkti. Kirjutamine (23 minutit): viie minutiga arvamus (6 punkti) ja kiri prügiveofirmale umbes 140 sõna (12 punkti) — kokku 18 punkti. Kokku 34 punkti. Harno: sooritatud alates 60 % (vähemalt 21 punkti) ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (24 punkti), meie tunnistus alates 80 % (28 punkti) — see on sisemine lävi.'),
      PART('065_d_rpart', 'R', { minutes: 22, points: 16, tasks: 2, note: 'Artikkel umbes 500 sõna: osa 1 lühivastused (8 punkti), osa 2 valikvastused (8 punkti). Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      why(tag(B.reading('065_d_read', 'Lugemine: arvamusartikkel. Osa 1 (8 punkti).', 'Loe artiklit (umbes 9 minutit). Vasta osa 1 küsimustele 1–3 sõnaga. Sõnaraamatut ei kasutata.', 'Parandada, jagada või osta uus?', [
        '(A) Kui veekeetja läheb katki, viskab enamik meist selle ära ja ostab uue. Põhjus on lihtne: uus maksab vähe ja parandamine tundub tülikas. Veel paarkümmend aastat tagasi oli teisiti: igas linnas oli kingsepp, kellassepp ja raadiomeister. Täna on neid järel vähe, sest paljud asjad on tehtud nii, et neid ei saagi avada. Minu arvates on aeg see harjumus uuesti läbi mõelda.',
        '(B) Esimene põhjus on keskkond. Iga asi, mis visatakse ära enne aega, muutub jäätmeteks, ja uue asja tootmiseks kulub jälle toorainet, vett ja energiat. Eriti kiiresti kasvab elektroonikajäätmete hulk. Telefon, mida kasutatakse viis aastat, tekitab vähem jäätmeid kui telefon, mida kasutatakse kaks aastat — aga ainult siis, kui keegi selle vahepeal ka parandab. Segaprügisse visatud vana seade on pealegi ohtlik: patareid ja akud võivad süttida ning mürgised ained ei tohi jõuda loodusesse.',
        '(C) Teine põhjus on raha. Kui arvutad ainult ostuhinda, tundub uus asi odav. Kui arvutad aga kogukulu kogu eluea jooksul, on pilt teine: odav asi läheb sageli kiiresti katki ja tuleb osta uuesti. Kvaliteetne asi, mida saab parandada, on pikas plaanis sageli soodsam. Odav jope, mis kestab ühe talve, maksab lõpuks rohkem kui kallim, mida saab kanda viis aastat ja vahepeal parandada. Sama kehtib tellimuste kohta: koos uue seadmega ostab inimene sageli ka uue tasulise teenuse, mida ta tegelikult ei vaja.',
        '(D) Kolmas põhjus on kogukond. Paljudes linnades tegutsevad parandustoad, kus vabatahtlikud aitavad tasuta parandada riideid, rattaid ja väikseid elektriseadmeid. Inimene õpib seal ise, kuidas asi töötab, ja kohtub naabritega. Mõnes raamatukogus saab laenutada mitte ainult raamatuid, vaid ka tööriistu, ja naabrid jagavad internetis asju, mida on vaja harva: puuri, redelit või telki. Paljud ütlevad, et parandustoast lahkudes on neil hea tunne: asi, mis oleks prügikasti läinud, töötab jälle, ja see on nende endi tehtud.',
        '(E) Kõik ei ole siiski nii lihtne. Mõnda toodet ei saa parandada, sest varuosi ei müüda või need on kallimad kui uus asi. Ka parandajaid on vähe ja nende töö on kallis, sest käsitööd ei saa teha kiiresti. Euroopa Liit on seetõttu hakanud tootjatelt nõudma, et varuosi ja parandusjuhiseid pakutaks pikema aja jooksul. Vaatamata sellele jääb lõplik otsus ostja kätte. Kui pood pakub uut seadet soodushinnaga ja parandaja ootab kaks nädalat, valib inimene sageli mugavama tee.',
        '(F) Mida siis teha? Enne ostu tasub küsida kolm küsimust: kas mul on seda tõesti vaja, kas saan seda laenata või jagada ja kas see on parandatav. Kui vastus on, et vajan ja parandada ei saa, ostan uue — ja eelistan sellist, millel on pikk garantii ja mille varuosi müüakse. Vana seadet ei viska ma segaprügisse, vaid viin elektroonikajäätmete kogumispunkti või poodi, kus see võetakse tasuta vastu.',
        '(G) Ma ei arva, et peaksime loobuma kõigest uuest. Kuid iga parandatud asi tähendab ühte asja vähem prügilas ja ühte head kogemust rohkem. Kui õpetame seda oskust oma lastele, kasvab põlvkond, kelle jaoks katkine asi ei ole veel prügi. Parandamine ei ole vaesuse märk, vaid oskus — ja oskused ei muutu kunagi jäätmeteks.',
        'Allikas: KeeleSepp õppetekst (autori arvamus).',
      ].join('\n\n'), [
        ['1. Mida teeb enamik inimesi, kui veekeetja läheb katki?', 'ostab uue|ostavad uue|ostab uue veekeetja'],
        ['2. Miks ei saa paljusid asju tänapäeval parandada?', 'neid ei saa avada|ei saa avada'],
        ['3. Mida peaks ostja arvutama lisaks ostuhinnale?', 'kogukulu|kogukulu kogu eluea jooksul'],
        ['4. Milliseid jäätmeid tekib teksti järgi üha rohkem?', 'elektroonikajäätmeid|elektroonikajäätmed|elektroonikat'],
        ['5. Kes aitavad parandustubades tasuta?', 'vabatahtlikud'],
        ['6. Mida saab mõnest raamatukogust laenutada peale raamatute?', 'tööriistu|tööriistad'],
        ['7. Mida nõuab Euroopa Liit tootjatelt pikema aja jooksul pakkuda?', 'varuosi ja parandusjuhiseid|varuosad ja parandusjuhised|varuosi'],
        ['8. Kuhu viib autor vana seadme, mida parandada ei saa?', 'kogumispunkti|elektroonikajäätmete kogumispunkti|poodi'],
      ]), { task: 'R15', harno: 'R2b' }), [
        '(A): „viskab enamik meist selle ära ja ostab uue”.',
        '(A): „paljud asjad on tehtud nii, et neid ei saagi avada”.',
        '(C): „Kui arvutad aga kogukulu kogu eluea jooksul …” (Varasemast: kogukulu, tund 54.)',
        '(B): „Eriti kiiresti kasvab elektroonikajäätmete hulk.”',
        '(D): „vabatahtlikud aitavad tasuta parandada”. (Varasemast: vabatahtlik, tund 60.)',
        '(D): „saab laenutada mitte ainult raamatuid, vaid ka tööriistu”.',
        '(E): „et varuosi ja parandusjuhiseid pakutaks pikema aja jooksul”.',
        '(F): „viin elektroonikajäätmete kogumispunkti või poodi”.',
      ]),
      why(tag(B.choice('065_d_mc', 'Osa 2: vali õige vastus (8 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida ütleb lõik A selle kohta, kuidas asjadega varem käituti?', 'linnades oli meistreid, kes asju parandasid', 'asju ei parandatud kunagi', 'kõik asjad olid odavad', 'katkist asja ei visatud kunagi ära'],
        ['Millal on lõigu B järgi kauem kasutatud telefon keskkonnale parem?', 'kui keegi seda vahepeal ka parandab', 'alati, ka siis, kui see on katki', 'kui see on kallim kui uus', 'kui seda kasutatakse ainult kodus'],
        ['Mida tähendab lõigu C järgi, et kvaliteetne asi on „pikas plaanis sageli soodsam”?', 'parandatav asi maksab kogu eluea jooksul vähem', 'kvaliteetne asi on poes odavam', 'kallis asi ei lähe kunagi katki', 'odava asja eest ei pea üldse maksma'],
        ['Millist viga teeb lõigu C järgi inimene, kes ostab uue seadme?', 'ta ostab sageli ka tasulise teenuse, mida ei vaja', 'ta maksab sularahas', 'ta unustab garantii küsida', 'ta ostab liiga vana mudeli'],
        ['Mida saab inimene lõigu D järgi parandustoas lisaks parandatud asjale?', 'ta õpib ise ja kohtub naabritega', 'ta saab uue asja tasuta', 'ta saab raha tagasi', 'ta saab tööd parandajana'],
        ['Miks valib inimene lõigu E järgi sageli uue asja, kuigi parandamine oleks võimalik? Järelda.', 'uus on soodushinnaga kohe käes, parandamine võtab aega', 'parandamine on alati kallim kui uus', 'seadus keelab vana asja parandada', 'parandaja ei taha tööd teha'],
        ['Miks soovitab autor enne ostu küsida kolm küsimust? Järelda.', 'et ost oleks teadlik otsus ja asju läheks vähem prügisse', 'et pood annaks allahindlust', 'et ostja saaks rohkem asju korraga osta', 'et parandajad saaksid rohkem tööd'],
        ['Millise mõttega nõustuks autor kõige tõenäolisemalt? Järelda.', 'parandamine on oskus, mis aitab nii raha kui ka keskkonda', 'uusi asju ei tohiks üldse osta', 'parandamine on vaeste inimeste mure', 'keskkonna eest vastutavad ainult tootjad'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }), [
        '(A): „igas linnas oli kingsepp, kellassepp ja raadiomeister”.',
        '(B): „aga ainult siis, kui keegi selle vahepeal ka parandab”.',
        '(C): „Kvaliteetne asi, mida saab parandada, on pikas plaanis sageli soodsam.”',
        '(C): „ostab inimene sageli ka uue tasulise teenuse, mida ta tegelikult ei vaja”. (Varasemast: tellimus, tund 51.)',
        '(D): „Inimene õpib seal ise … ja kohtub naabritega.”',
        'Järeldus (E) lõigust: „uut seadet soodushinnaga ja parandaja ootab kaks nädalat” — mugavam tee.',
        'Järeldus (F) lõigust: kolm küsimust (vaja, laenata, parandatav) teevad ostust otsuse.',
        'Järeldus (G) lõigust: „Parandamine ei ole vaesuse märk, vaid oskus”; (B) ja (C) — keskkond ja raha.',
      ]),
      PART('065_t_wpart', 'W', { minutes: 23, points: 18, tasks: 2, note: 'Kirjutamine 1 (5 minutit, 6 punkti): kolm rida 0–2 — samad tingimused nagu mooduli külmas alguses (tund 61). Kirjutamine 2 (umbes 18 minutit, 12 punkti): analüütiline juhend, neli kriteeriumi 0–3. Kontrolli tulemus: lugemine … / 16 + kirjutamine … / 18 = … / 34.' }),
      teach(tag(homeLines(B.writing('065_t_cold', 'Kirjutamine 1: arvamus viie minutiga (6 punkti).', 'Väide: „Toidupoed peaksid müümata söödava toidu ära andma ja poele, kes seda ei tee, tuleks teha trahv.” Kirjuta 5 minutit, 5–7 lauset: seisukoht, põhjus, näide, vastuargument.', [5, 7], [], 0, 'g_use'), 12), { task: 'W14', harno: 'W2b' }),
        'Mooduli paralleelne lõpuülesanne: samad tingimused nagu mooduli külmas alguses tunnis b1b2-061 (5 minutit, 5–7 lauset, fraase ega algust ei ole) ja sama väite tüüp („kohustada ja trahvida”), uus teema samast moodulist (toit, tund 62). Hinda kolme rea järgi 0–2 (hindamine all). Võrdle külma alguse lehega: ütle õppijale üks konkreetne areng ja üks järgmine samm.'),
      keepPlace(B.rubric('065_t_rubric', 'Hindamine: kirjutamine 1 (6 punkti).', 'Iga rida 0–2 punkti.', ['Seisukoht esimeses lauses, põhjus ja näide (0–2).', 'Vastuargument ja vastus sellele (0–2).', 'Keel: sidendid (kuigi …, siiski; seetõttu; vaatamata sellele, et) ja mooduli vormid (tõttu, tänu, -mine, -ks) (0–2).'])),
      tag(homeLines(B.examWriting('065_t_claim', 'Kirjutamine 2: kiri prügiveofirmale (umbes 140 sõna, 12 punkti).', 'Kirjuta 130–150 sõna. Pöördumist ja algust ei anta.', 'kiri', {
        situation: 'Prügiveofirma saatis teie majale arve, mis on kaks korda suurem kui tavaliselt. Põhjuseks on kirjas „ülekoormatud konteiner”. Tegelikult jäi konteiner kaks nädalat tühjendamata ja elanikel on sellest fotod. Kirjuta firma klienditeenindusele korteriühistu nimel.',
        points: ['mis juhtus ja millal (konteiner jäi tühjendamata)', 'miks arve ei ole sinu arvates õige (fotod, kuupäevad)', 'mida palud (arve parandamine) ja mis ajaks ootad vastust', 'üks ettepanek, mis vähendaks segaprügi (näiteks pakendikonteiner)'],
        words: [130, 150],
      }), 12), { task: 'W13', harno: 'W1' }),
      writingRubric('065_t_wrubric', 'Hindamine: kiri (12 punkti).', 'Hinda kirja nelja kriteeriumi järgi (0–3). Mooduli keel on grammatika kriteeriumi osa: tulemus ja muutus (61: jäi tühjendamata, muutus kallimaks), põhjus nimisõnaga (62: ülekoormuse tõttu, tänu fotodele), -mine omastavaga (63: arve parandamine, konteineri tühjendamine), vastuväide (64: vaatamata sellele, et …). Piiripealne näidis (7/12 ≈ 58 %): seisukoht ja palve on olemas, tõend ja tähtaeg puuduvad (ülesanne 2), sidendeid on vähe (2), sõnavara piisav (2), „konteiner jäi mitte tühjendatud”, „tänu fotod” (grammatika 1). Kontrolli tulemus = lugemine … / 16 + kirjutamine 1 … / 6 + kirjutamine 2 … / 12.'),
    ],
  },
}), {
  'b1b2-061': 'AVAS R→S', 'b1b2-062': 'KUUL L→S', 'b1b2-063': 'PROB R→S', 'b1b2-064': 'PROJ L→S', 'b1b2-065': 'EKS',
}));

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js). Since v6 the explanations travel with each block (why(block, lines)); this map is empty and
// kept for courseSheet.js withExplanations.
export const EXPLAIN = {};
