// B2 course (B1 → B2 roadmap), module 10 „Suhted ja konfliktid” (b1b2-046…050), stage B1+/B2- (the module file is B2-:
// homework 140–180 words, the B2 opener and article lengths).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–7. Module goal (the learner): „Ma oskan oma suhetes pinget rahulikult lahendada: kirjeldan
// inimest õiglaselt, ütlen, mida tunnen ja miks, annan teiste sõnad täpselt edasi ja jõuan kokkuleppeni”; module product
// „Minu kokkuleppe kaart” (049 Kasuta, the S16 one-minute talk in 050). Relationships from the learner's own angle: his
// friends, money lent to a friend, a noisy house and its chat, a family that plans one summer. The learner may always
// choose a neutral or invented story; no personal disclosure is required. Not repeated from earlier modules: a colleague
// conflict at work (module 6), a complaint to a service (module 2), a rental deposit (module 4).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 10).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   046 facts    „Kas sul on sõber, kellele saad öösel kell kolm helistada?”  free time (friends)   final present: a friend's reference (S11)
//   047 case     „Sõber ei maksa 300 eurot tagasi — kuidas sellest rääkida?”  money                 final explain: talk with the friend (S13)
//   048 infogap  „Muusika kell 23 ja majagrupp keeb — kuidas tüli vahendada?”  neighbours            final advise: relay between neighbours (S05)
//   049 game     „Kaks õde ja üks apelsin: kuidas pere ühise plaani leiab?”    family (generations)  final negotiate: the family summer (S17)
//   050 exam     Kontroll 10 in Harno B2 form + „Minu kokkuleppe kaart” as the S16 one-minute talk.
// Grammar line of the roadmap (B2, docs/METHODOLOGY_STANDARD.md §5) by discovery and spiralled: character words and their
// derivation — adjective → noun (aus → ausus, kannatlik → kannatlikkus) and the opposite (eba-, -matu) (046; back in 050);
// feelings with cause and consequence (kuna, seetõttu, mistõttu) and the clitic -ki / -gi with the indefinite pronouns —
// isegi, keegi, mitte keegi, ei tulnudki (047; back in 048's voice message and 050); reported speech — ütles, et …; küsis,
// kas …; palus, et … / palus + da; väitis, et … with the quotative -vat of module 7 (048; back in 049's radio and 050);
// soft proposals and conditions — ma saan aru, et …; mis oleks, kui …; kas saaksime …; olen nõus tingimusel, et …
// (049, after module 7's conditional; back in 050). The one long text of the module is the topic opener (046 station 2,
// ≈ 330 words, after a 15-minute hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js (046 without g_listen: it has no recording) and the archetypes
// (LUGE, RÄÄK, KIRJ, PROJ, EKS) with the exam corners R1, W1, R2b, S2. The v2 storyline version (Vahtra 5, Tuul Logistika,
// Oskar and Rasmus, the mediated meeting) is in git history before 2026-11-19.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 10. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud loo.';

export const MODULE = { id: 'b1b2-module-10', course: 'b2', title: 'Suhted ja konfliktid', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-046': {
    title: 'Kas sul on sõber, kellele saad öösel kell kolm helistada?',
    phases: grammar('Keel: omadus ja vastand — lahke → lahkus, sõbralik → sõbralikkus → ebasõbralik, tänama → tänamatu'),
    format: 'facts',
    topic: 'freetime',
    canDo: 'Ma kirjutan sõbrale soovituse, kus kirjeldan tema iseloomu tegude kaudu, ja võrdlen oma kogemust faktidega sõpruse ja üksilduse kohta; moodustan omadussõnast nimisõna ja vastandi (lahkus, sõbralikkus, ebasõbralik, tänamatu).',
    teacherPage: {
      goal: 'Ученик проверяет факты о дружбе и одиночестве, описывает человека через поступки и рекомендует друга; словообразование: aus → ausus → ebaaus, kannatlik → kannatamatu.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — только звонок без слабой стороны друга. Текст (станция 2) — дома, 6 вопросов в начале следующего урока.',
      hook: '«Представь: три часа ночи, у тебя беда. Кому ты звонишь? Что делает этого человека таким другом — одно качество и один поступок». Ответьте сами одной фразой, потом ученик. Можно назвать сестру, соседа или «пока никого» — это тоже честный ответ.',
      plan: [
        '0–4: крючок — кому я позвоню в три часа ночи, ученик отвечает сразу',
        '4–15: станция 1 — разговор о своих друзьях: как познакомились, что важно',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 6 вопросам, текст, проверка прогноза',
        '30–42: станция 3 — заметить в тексте → правило → характеристика подруги: 7 пропусков',
        '42–57: станция 4 — сообщение знакомой, звонок: три качества друга с примерами',
        '57–69: «Kui aega jääb» — игра «Угадай качество»',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: рекомендация, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Jeffrey A. Hall, «How many hours does it take to make a friend?», Journal of Social and Personal Relationships (онлайн 2018): около 50 часов — от знакомого к приятелю, около 90 — к другу, более 200 — к близкому другу; Joint Research Centre, EU Loneliness Survey 2022: 13 % одиноки всё или большую часть времени, 35 % — хотя бы иногда; WHO Commission on Social Connection, 30.06.2025: одиночество затрагивает каждого шестого, ≈ 871 000 смертей в год, чаще всего у подростков и молодых; Harvard Gazette (интервью с Robert Waldinger): исследование с 1938 г., 724 мужчины, удовлетворённость отношениями в 50 лет предсказывала здоровье в 80 лучше холестерина. В Эстонии 14 февраля — sõbrapäev. Подруга Кати, знакомая Мерле и её мама — учебные.',
      groups: 'Станция 1 — в парах. Прогноз и текст — каждый сам, сверка в паре. Станция 4: один — Мерле с вашей карточкой, другой рассказывает о друге; потом смена. В 1:1 Мерле — вы.',
      errors: [
        '«Ta on ausus» → «Ta on aus» / «Tema ausus …» (качество человека — прилагательное, качество как вещь — существительное).',
        '«kannatlikus» → «kannatlikkus» (-lik + -kus: два k).',
        '«mitteaus», «ebakannatlik» → «ebaaus», «kannatamatu» (у каждого слова свой антоним: eba- или -matu).',
        '«Ma hindan tema ausus» → «… tema ausust» (hindama — частичный объект).',
      ],
      notes: [
        'Формат — анализ фактов: сначала ученик гадает (сколько часов нужно, чтобы стать друзьями; кто одинок чаще), потом читает и проверяет. Одиночество — тема деликатная: ученик не обязан говорить о себе, можно о «человеке, которого знаю».',
        'Пенсионеру — друг юности или соседка; студенту — сосед по общежитию; маме в декрете — подруга с детской площадки; уставшему — коллега по смене (о работе только как пример друга). Рекомендация на станции 4 может быть о выдуманном человеке.',
        'Обратная связь, 2–3 цели: качество + поступок как доказательство («Ta on täpne: …»); форма существительного или антонима; смягчение слабой стороны («vahel natuke …, aga …»).',
      ],
    },
    discover: [
      station(B.text('046_d_hook', 'Kellele sa helistad?', 'Kell on kolm öösel ja sul on suur mure. Kellele sa helistad? Ütle kohe üks tema omadus ja üks asi, mida ta on sinu heaks teinud.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('046_d_talk', 'Minu sõbrad.', `Vasta igale küsimusele ja too näide. ${OWN_OR_INVENTED}`, [
        'Kuidas sa oma kõige vanema sõbraga tuttavaks said ja kuidas te üksteist toetate?',
        'Mis on sõbras sulle kõige tähtsam — ausus, otsekohesus või muu — ja mis häirib?',
        'Kas täiskasvanuna on uusi sõpru raskem leida? Miks?',
      ], [150, 210], ['Minu sõber on …: näiteks kord …', 'Mulle on kõige tähtsam …', 'Mind häirib, kui …']), 'Sinu enda sõbrad annavad tunni faktidele esimese võrdluse.'), { task: 'S01', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma sõbrast. Ära paranda; lõpus ütle üks omadussõna, mida õpilane vajas ja ei teadnud. Kui õpilane ütleb, et tal pole sõpru: „Kellega sa viimati pikalt rääkisid? Mis inimene ta on?”')),
      station(tag(B.vocab('046_d_vocab', 'Enne lugemist: sõnad.', ['usaldusväärne — надёжный', 'tähelepanelik — внимательный', 'aus — честный', 'kannatlik — терпеливый', 'hooliv — заботливый', 'üksildus — одиночество', 'tuttav — знакомый', 'usaldus — доверие', 'aega veetma — проводить время', 'toetama — поддерживать']), { topic: ['üksildus'] }), 2, 15),
      B.topicOpener('046_d_open', 'Moodul 10. Sõbrad ja üksildus: mida ütlevad uuringud?', [
        'Eestis on 14. veebruar sõbrapäev. Paljudes riikides on see armastajate päev, aga meil saadetakse kaarte ja kommi ka sõpradele, klassikaaslastele ja kolleegidele. See on hea põhjus küsida, kui palju sõpru inimene vajab ja kuidas sõprus üldse tekib. Lapsepõlves leiame sõbra liivakastist ja koolis istume temaga ühes pingis, kuid täiskasvanuna on päevad täis tööd ja kohustusi ning uus sõprus ei teki enam iseenesest.',
        'Ameerika uurija Jeffrey Hall küsis inimestelt, kui palju aega nad uute tuttavatega veetsid. Tema arvutuse järgi kulub umbes 50 tundi koos veedetud aega, et tuttavast saaks hea tuttav, umbes 90 tundi, et temast saaks sõber, ja üle 200 tunni, et temast saaks lähedane sõber. Tähtis ei ole ainult aeg, vaid ka see, mida koos tehakse: jutuajamine ja ühine tegevus loovad sidet rohkem kui lihtsalt samas ruumis istumine. Seepärast leiavad täiskasvanud uusi sõpru sageli kursusel, koorist, trennist või vabatahtlikust tööst: seal on kohtumine iganädalane harjumus.',
        'Euroopa Komisjoni esimese üleeuroopalise uuringu järgi tundis end viimase nelja nädala jooksul üksildasena kogu aeg või suurema osa ajast 13 protsenti Euroopa Liidu elanikest ja vähemalt aeg-ajalt rohkem kui kolmandik. Paljusid üllatas, et noored ei olnud vähem üksildased kui vanemad inimesed. Maailma Terviseorganisatsiooni 2025. aasta raporti järgi puudutab üksildus umbes iga kuuendat inimest maailmas ja kõige sagedamini noori. Raporti autorid seovad üksildust ligi 871 000 surmaga aastas.',
        'Üksi elamine ei tähenda veel üksildust. Üksildus tekib siis, kui inimesel ei ole kellegagi rääkida, kui midagi juhtub, ega kedagi, kes teda toetaks. Harvardi ülikoolis 1938. aastal alanud uuringus on sadu mehi ja hiljem ka nende peresid jälgitud üle kaheksakümne aasta. Uurijad leidsid, et see, kui rahul oli inimene viiekümneaastaselt oma suhetega, ennustas tema tervist kaheksakümneaastaselt paremini kui kolesterool. Uuringu juhi Robert Waldingeri sõnul ei loe sõprade arv, vaid suhete kvaliteet: kas sul on keegi, keda sa usaldad. Hea sõber ei pea olema iga päev sinu kõrval; tähtis on teadmine, et ta vastab, kui sa teda vajad.',
        'Selles moodulis räägid oma suhetest: kirjeldad inimest tema tegude järgi, ütled, mida tunned ja miks, annad naabrite sõnu edasi ja jõuad pere või sõpradega kokkuleppele. Oma loo võid alati ka välja mõelda.',
      ], 'Jeffrey A. Hall, ajakiri Journal of Social and Personal Relationships (2018); Euroopa Komisjoni Teadusuuringute Ühiskeskus, ELi üksilduse uuring 2022; Maailma Terviseorganisatsiooni sotsiaalse sidususe komisjoni raport (30.06.2025); Harvard Gazette, intervjuu Robert Waldingeriga', [
        'Kas sõbrapäeva tähistatakse ka sinu kodumaal? Mille poolest see erineb Eestist?',
        'Kus sina oled täiskasvanuna uusi sõpru leidnud? Kas 200 tundi tundub sulle palju või vähe?',
        'Miks võivad noored tunda end sama üksildasena kui vanemad inimesed?',
        'Mida võiks sinu maja, kursus või töökoht teha, et keegi ei jääks üksi?',
      ]),
      teach(tag(purpose(B.choice('046_d_facts', 'Arva ja kontrolli: mida ütlevad uuringud?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Mille poolest erineb 14. veebruar Eestis sellest päevast paljudes teistes riikides?', 'kaarte saadetakse ka sõpradele ja kolleegidele', 'seda tähistatakse märtsis', 'see on riigipüha ja vaba päev', 'kingitusi tehakse ainult lastele'],
        ['Mis loob uurija Jeffrey Halli järgi kahe inimese vahel kõige rohkem sidet?', 'jutuajamine ja ühine tegevus', 'lihtsalt samas ruumis istumine', 'sõnumite saatmine iga päev', 'ühine töökoht'],
        ['Miks leiavad täiskasvanud teksti järgi uusi sõpru sageli kursusel, koorist või trennist?', 'seal veedetakse regulaarselt aega ja tehakse midagi koos', 'seal on palju noori inimesi', 'need on alati tasuta', 'seal ei pea kellegagi rääkima'],
        ['Mis üllatas paljusid Euroopa Komisjoni uuringus, kus küsiti üksilduse kohta?', 'noored ei olnud vähem üksildased kui vanemad', 'üksildasi oli väga vähe', 'kõik tundsid end vahel üksi', 'vanemad inimesed olid kõige üksildasemad'],
        ['Mis ennustas Harvardi uuringus inimese tervist kaheksakümneaastaselt paremini kui kolesterool?', 'rahulolu oma suhetega viiekümneaastaselt', 'sõprade arv kahekümneaastaselt', 'sissetulek ja haridus', 'üksi või perega elamine'],
        ['Millise sõpruse liigi jaoks kulub Halli arvutuse järgi kõige rohkem koos veedetud aega?', 'lähedane sõber', 'hea tuttav', 'sõber töökohas', 'naaber trepikojas'],
        ['Miks ei tähenda üksi elamine teksti järgi veel üksildust?', 'üksildus tekib siis, kui pole kellegagi rääkida ega kedagi, kes toetaks', 'üksi elavad inimesed on alati õnnelikud', 'üksi elavad ainult noored', 'üksi elamine on Eestis haruldane'],
        ['Millise mõttega oleks teksti autor sõpruse ja üksilduse kohta kõige rohkem nõus?', 'tähtis ei ole sõprade arv, vaid see, kas on keegi, keda usaldad', 'üksi elav inimene on alati üksildane', 'sõprus tekib iseenesest, aega ei ole vaja', 'üksildus puudutab peamiselt eakaid'],
      ], 'full', 'g_read'), 'Näed, kas sinu kogemus ja arvamus sõprusest langevad kokku uuringutega.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja küsimused neljast valikust. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Küsi lõpuks: „Mis üllatas sind kõige rohkem?” Arv 200 tundi on hea arutelu algus: kui palju aega veedab õpilane praegu oma sõpradega?'),
    ],
    practice: [
      station(B.notice('046_p_notice', 'Märka: lahke → lahkus → ebasõbralik?', [
        'Tekstist: inimene tundis end **üksildasena** → see on **üksildus** · keegi, keda sa **usaldad** → **usaldus** · kui **rahul** oli inimene → **rahulolu**',
        '**Omadus kui asi** (nimisõna) lõpuga -us või -dus: lahke → **lahkus**, julge → **julgus**, üksildane → **üksildus**, otsekohene → **otsekohesus** · -lik muutub -likkus: sõbralik → **sõbralikkus**, ettevaatlik → **ettevaatlikkus**',
        '**Vastand eesliitega eba-**: sõbralik → **ebasõbralik**, õiglane → **ebaõiglane**, kindel → **ebakindel**, meeldiv → **ebameeldiv**',
        '**Vastand lõpuga -matu** (ma-tegevusnimest): tänama → **tänamatu**, mõtlema → **mõtlematu**, tähele panema → **tähelepanematu**',
        'Kontrolli kahe küsimusega: kas lause vajab **omadust** (Ta on julge.) või **asja** (Tema julgus on haruldane.)? Kas mõte on **positiivne** või **vastupidine**? Nimisõna käändub: imetlen tema **julgust**, imestan tema **sõbralikkuse** üle.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('046_p_forms', 'Sõbranna kirjutab oma sõbrast.', 'Otsusta, kas lause vajab omadust, asja või vastandit, ja kirjuta sulgudes olev sõna õiges vormis.', [
        'Kui Kati midagi lubab, teeb ta selle ka ära — tema [usaldusväärsus] on mulle kõige tähtsam. (usaldusväärne)',
        'Ta ei ole kunagi unustanud mu sünnipäeva; selline [tähelepanelikkus] on tänapäeval haruldane. (tähelepanelik)',
        'Ainult järjekorras on ta natuke [kannatamatu]: viis minutit ootamist ja ta hakkab närveerima. (kannatlik)',
        'Kui üks endine kolleeg tema kohta valesid levitas, tegi selline [ebaaus] käitumine talle väga haiget. (aus)',
        'Ta ei jäta kunagi koera kuuma autosse, sest ta ei ole [hoolimatu] inimene. (hoolima)',
        'Ma hindan väga tema [ausust], kuigi vahel võiks ta midagi ka ütlemata jätta. (aus)',
      ], '', 'full', 'g_notice'), 'Sõbranna saadab selle teksti üürileandjale; täpne sõna teeb kirjelduse usaldusväärseks.'), { task: 'G09' }),
      'Pärast iga rida küsi: „Kas siin on omadus, asi või vastand?” Viimane rida: hindama tahab osastavat (ausust). Lisa küsimus: „Kas sinul on mõni neist omadustest? Too näide.”'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('046_t_chat', 'Tuttav kirjutab sulle.', 'Loe sõnumeid: mida tahab Merle ema sinu sõbra kohta teada?', 'Merle', 'Sina', [
        ['A', 'Tere! Mu ema annab Tartus oma korteris ühe toa üürile. Sinu sõber Kati kandideerib. Kas sa tunned teda hästi?'],
        ['B', 'Tere! Jah, oleme sõbrad juba kaheksa aastat. Tutvusime ülikoolis ja elasime kaks aastat samas ühiselamus.'],
        ['A', 'Ema on 74 ja natuke ettevaatlik. Tal on kolm küsimust: kas Kati maksab õigel ajal, kas ta on vaikne ja kas temaga saab rääkida, kui midagi on valesti?'],
        ['B', 'Mõistlikud küsimused. Las ma mõtlen, mida ma Kati kohta tean.'],
        ['A', 'Eelmine üürnik jättis kaks kuud üüri maksmata ja kuulas öösiti valju muusikat. Pärast seda on emal halb enesetunne iga kord, kui keegi uus tuleb.'],
        ['B', 'Saan aru. Kati on hoopis teistsugune, aga ma räägin sulle näidetega, mitte ainult kiitusega.'],
        ['A', 'Ema palus ka kirjalikku soovitust, sest ta tahab seda rahulikult lugeda ja vajadusel uuesti üle vaadata. Kas saaksid selle reedeks saata?'],
        ['B', 'Muidugi. Homme näeme kohvikus, siis räägin lähemalt ja sa saad kõike küsida.'],
      ], 'g_read'), 'Sõnumitest näed, mida üürileandja tegelikult kardab; sellele vastad oma sõbra näidetega.'), { task: 'R12' }), 4, 15, { final: 'present' }),
      tag(purpose(B.profiles('046_t_card', 'Kui sa ei taha rääkida oma sõbrast: Kati kaart.', 'Loe Kati tegusid ja mõtle iga teo juurde omadus. Kasuta kaarti vestluses, kui ei taha rääkida päris inimesest.', [
        ['Kati (34), sinu sõber', ['maksab arved alati kuu esimesel päeval', 'aitas sul kolida ja tõi kõigile suppi', 'mäletab sinu ema sünnipäeva ja helistab talle', 'ütleb otse, kui talle midagi ei meeldi', 'jääb vahel hiljaks, aga annab alati ette teada', 'hoolitseb naabri kassi eest, kui naaber on ära'], []],
      ], '1', 'g_read'), 'Kaart annab tegelikud teod, mille järgi omadust tõestada.'), { task: 'R08' }),
      teach(tag(purpose(B.rolecards('046_t_call', 'Kohtu Merlega.', 'Räägi Merlele kohvikus oma sõbrast nii, et tema ema saaks otsustada: iga omadus koos näitega.',
        'Olukord: sinu sõber (päris või väljamõeldud) tahab üürida tuba vanemalt prouale.\nSinu eesmärk: vasta ema kolmele küsimusele — iga omadus koos teoga, mida sõber on teinud.\nPiirang: ole aus — nimeta ka üks nõrk külg, aga pehmelt.',
        'Merle kaart on õpetajal: ema kahtlused ja üks lisaküsimus.',
        ['Ta on väga usaldusväärne: näiteks kord …', 'Ta on tähelepanelik: ta märkab …', 'Tema suurim tugevus on …', 'Ausalt öeldes on ta vahel natuke …, aga …', 'Ma soovitan teda, sest …'], ['Aga kas ta …?', 'Kuidas sa seda tead?', 'Mis on tema nõrk külg?']), 'Tulemus: ema teab, kas ta võib sinu sõpra usaldada.'), { task: 'S11', level: 4 }),
      'Õpetaja kaart (Merle). Ütle ainult seda, mida küsitakse. Varjatud info: emal on kass ja ta tahab, et üürnik loomi armastaks; ema tahab, et keegi aitaks tal vahel poes käia; ema magab päeval tund aega. Takistused ükshaaval: 1) „Kõik sõbrad ütlevad oma sõbra kohta head. Too näide!” 2) „Kas tal on mõni halb harjumus?” 3) „Kas ta oleks nõus emal vahel poes abiks käima?” Õnnestunud, kui õpilane nimetab kolm omadust koos teoga, ütleb ühe nõrga külje pehmelt (vahel natuke …, aga …), kasutab vähemalt kaks nimisõna või vastandit (usaldusväärsus, kannatamatu) ja annab selge soovituse.'),
      extension(teach(tag(purpose(B.speaking('046_t_more', 'Mäng: arva omadus', 'Kirjelda ühte inimest (sõpra, naabrit või filmitegelast) ainult tema tegude kaudu, ilma omadussõnata. Paariline arvab omaduse ja ütleb selle ka nimisõnana.', [
        'Näide: „Ta ootas mind vihmas tund aega ega pahandanud.” → kannatlik, kannatlikkus.',
        'Igaüks kirjeldab kolm omadust: kaks positiivset ja ühe vastandi (eba- või -matu).',
      ], [120, 180], ['Kord ta …', 'Ta ei …-nud kunagi …', 'Kas ta on …? Siis on see …-us.']), 'Mäng näitab, et omadust tõestab tegu, ja harjutab sõnu ilma ettevalmistuseta.'), { task: 'G11', fluency: true }),
      'Kui aega jääb (12 min). Mängi kaasa: kirjelda ise kaks inimest tegude kaudu. Punkt: õige omadus + õige nimisõna (või vastand). Kui õpilane ütleb silti („ta on hea”), küsi: „Mida ta tegi?”'), 12),
      tag(exitCheck(purpose(B.gaps('046_t_exit', 'Kontrolli end: kolm sõna.', 'Kirjuta sulgudes olev sõna õiges vormis: omadus, asi või vastand.', [
        'Sõber hilineb alati ega vabanda kunagi — see on [hoolimatu] käitumine. (hoolima)',
        'Kõige rohkem hindan ma inimestes [ausust]. (aus)',
        'Uus naaber tundus alguses [ebaviisakas], aga tegelikult on ta lihtsalt häbelik. (viisakas)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas omadussõna, nimisõna ja vastand on käes.')), {}),
      purpose(B.selfcheck('046_t_self', ['Ma räägin oma sõpradest ja sellest, mis mulle sõpruses tähtis on.', 'Ma saan aru faktidest sõpruse ja üksilduse kohta ja võrdlen neid oma kogemusega.', 'Ma moodustan omadussõnast nimisõna ja vastandi: lahkus, sõbralikkus, ebasõbralik, tänamatu.', 'Ma kirjeldan inimest tema tegude kaudu ja soovitan teda.'], 'Sõber soovitatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('046_t_letter', 'Kodus: soovitus sõbrale.', 'Kirjuta kodus Merle emale 140–160 sõna: kes sa oled ja kui kaua sõpra tunned, tema kolm omadust koos näitega, üks nõrk külg ausalt, aga pehmelt, ja sinu soovitus. Kasuta vähemalt kolme nimisõna või vastandit (näiteks lahkus, sõbralikkus, ebakindel).', 'Lugupeetud proua …!', 'Lugupidamisega\n(sinu nimi)', [140, 160]), 'Merle ema loeb sinu kirja ja otsustab, kas annab toa sinu sõbrale.')), { task: 'W08', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('046_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: milline on hea sõber ja kas sina oled ise selline sõber.', [
        'Millised kolm omadust on sõbras kõige tähtsamad?',
        'Millise oma omaduse kallal tahaksid veel töötada?',
      ], [60, 120]), 'Õpetaja kuulab ja ütleb, kas omadussõnad ja nimisõnad on õiged.')), { task: 'S15' }),
      homework('046_t_homework', ['1. Soovitus sõbrale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-047': {
    title: 'Sõber ei maksa 300 eurot tagasi — kuidas sellest rääkida?',
    phases: grammar('Keel: tunne, põhjus ja tagajärg — kuna, seetõttu, mistõttu; -ki / -gi — isegi, keegi, ei tulnudki'),
    format: 'case',
    topic: 'money',
    canDo: 'Ma räägin rahamurest sõbraga nii, et suhe jääb alles: nimetan oma tunde täpselt, seon selle põhjuse ja tagajärjega (kuna, seetõttu, mistõttu), rõhutan sõnu -ki või -gi abil (isegi, ei tulnudki) ja kirjutan sõbrale selge, aga sõbraliku kirja.',
    teacherPage: {
      goal: 'Случай: подруга одолжила другу 300 € и три месяца ждёт. Ученик называет чувства, связывает причину и следствие (kuna, seetõttu, mistõttu), -ki/-gi, и договаривается с другом.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 предложения; станция 4 — голосовое и короткий разговор без графика выплат. Переписка (станция 2) — дома, вопросы в начале следующего урока.',
      hook: '«Хороший друг пишет: „Одолжи мне 300 евро, отдам в конце месяца.“ Что ты делаешь: даёшь всё, даёшь меньше или говоришь нет? И одна причина.» Голосуйте оба, вы — с короткой причиной. Не оценивайте выбор ученика.',
      plan: [
        '0–3: крючок — дать в долг или нет, ученик отвечает сразу',
        '3–10: станция 1 — разговор: деньги и дружба (своя, знакомая или выдуманная история)',
        '10–25: станция 2 — слова (2 мин), переписка Олеси и Игоря за три месяца, 6 вопросов: кто что чувствует и почему; «Kas teadsid?» об устном займе',
        '25–37: станция 3 — заметить isegi / -ki и kuna / seetõttu в переписке → правило → честное письмо Олеси: 7 предложений',
        '37–52: станция 4 — голосовое Игоря (6 пропусков), разговор с Игорем в кафе: чувства, договорённость о выплатах',
        '52–64: «Kui aega jääb» — ролевая игра: вежливо сказать «нет» другому знакомому',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо другу, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?»: võlaõigusseadus § 11 (договор можно заключить устно), tsiviilseadustiku üldosa seadus § 146 (срок давности требований из сделки — 3 года), Riigi Teataja; совет юриста фиксировать крупную сумму письменно — Maaleht, «Jurist soovitab: kui laenad suurema summa raha isegi sõbrale, tasub sõlmida kirjalik leping». Олеся, Игорь и переписка — учебные.',
      groups: 'Станция 1 — в парах. Переписку и вопросы — каждый сам, сверка в паре. Станция 4: один — Олеся (или своя история), другой — Игорь с вашей карточкой; потом смена. В 1:1 Игорь — вы.',
      errors: [
        '«Ma olin pettunud, kuna sa ei vastasid» → «… kuna sa ei vastanud» (отрицание прошедшего: ei + -nud).',
        '«Ta ei tulnudgi» → «Ta ei tulnudki» (после d, t, k, p, g, b, s, h — -ki; после гласных и l, m, n, r, v, j — -gi: keegi, temagi).',
        '«Keegi ei tea» / «Mitte keegi ei tea» — правильно; «Keegi teab» в значении «никто» — ошибка (в отрицании нужно ei).',
        '«Seetõttu ma ei kirjutanud» → в письменной речи «Seetõttu ei kirjutanud ma» (глагол вторым после наречия).',
      ],
      notes: [
        'Формат — реальный случай: деньги между друзьями. Ученик сам решает, говорить ли о своём опыте; есть всегда вариант «знакомая история» или выдуманная. Не спрашивайте о суммах и долгах самого ученика.',
        'Две стороны: на станции 4 ученик может быть и Игорем (тот, кто должен и кому стыдно). Студенту — долг соседу по комнате; пенсионеру — деньги внуку; маме в декрете — подруга, которой нужно на коляску.',
        'Обратная связь, 2–3 цели: чувство + причина + следствие в одном высказывании; -ki/-gi; я-сообщение вместо упрёка («Ma tundsin end …» вместо «Sa oled …»). В разговоре не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(B.text('047_d_hook', 'Annad või ei anna?', 'Hea sõber kirjutab: „Kas saaksid mulle laenata 300 eurot? Maksan kuu lõpus tagasi.” Mida sa teed: annad kogu summa, annad vähem või ütled ei? Ütle kohe ja lisa üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('047_d_talk', 'Raha ja sõprus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kas oled kunagi sõbrale või sugulasele raha laenanud või ise laenanud? Kuidas see lõppes?',
        'Mis tunne on oodata võlga, mida ei maksta — ja mis tunne on ise võlgu olla?',
        'Kas seal, kus sa üles kasvasid, laenatakse sõpradele raha sagedamini kui Eestis?',
      ], [150, 210], ['Ma tundsin end …, kuna …', 'Seetõttu …', 'Kord juhtus nii, et …']), 'Sinu kogemus või tuttava lugu annab tunni juhtumile esimese võrdluse.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lühike lugu (võib olla väljamõeldud). Ära küsi õpilase päris summasid. Lõpus ütle üks tunnet nimetav sõna, mida õpilane vajas.')),
      station(tag(B.vocab('047_d_vocab', 'Enne lugemist: sõnad.', ['laenama — одалживать (давать или брать в долг)', 'võlg — долг', 'tagasi maksma — возвращать (деньги)', 'pettunud — разочарованный', 'solvunud — обиженный', 'ärritunud — раздражённый', 'piinlik — неловко (стыдно)', 'süütunne — чувство вины', 'kergendus — облегчение', 'vältima — избегать']), { topic: ['süütunne', 'vältima'] }), 2, 15),
      tag(purpose(B.dialogue('047_d_chat', 'Olesja ja Igori sõnumid.', 'Sõbranna Olesja saatis sulle oma vestluse ja küsib: „Mida ma valesti tegin ja mida ma talle nüüd ütlen?” Loe sõnumeid.', 'Olesja', 'Igor', [
        ['A', '3. märts: Muidugi aitan! Kandsin sulle 300 eurot üle. Edu uue korteriga!'],
        ['B', 'Suur aitäh! Maksan kindlasti märtsi lõpus tagasi, sa oled tõeline sõber.'],
        ['A', '2. aprill: Tere! Kuidas uus korter on? Kas raha saaks juba tagasi? Mul on endal sel kuul hambaarst.'],
        ['B', 'Vabandust, palk tuli hiljem. Mais kindlasti!'],
        ['A', '20. mai: Igor, kas kõik on korras? Lubasid mais, aga raha ei tulnudki. Ma ei taha tülitada.'],
        ['B', 'Jah, jah, varsti.'],
        ['A', '15. juuni: Nägin pilte, et olid laupäeval kontserdil. Mulle sa isegi ei helista enam.'],
        ['B', 'Kas sa jälgid mind või? Keegi ei ole mulle nii palju kirjutanud! Ma ju ütlesin, et maksan.'],
      ], 'g_read'), 'Sõnumitest näed, kuidas kolme kuuga kasvas pinge; see on sinu nõu alus.'), { task: 'R07' }),
      teach(tag(purpose(B.choice('047_d_feel', 'Mida keegi tunneb ja miks?', 'Vali iga küsimuse juurde vastus, mis sõnumite põhjal kõige paremini sobib.', [
        ['Miks laenas Olesja Igorile raha?', 'Igor kolis uude korterisse ja vajas abi', 'Igor lubas maksta intressi', 'Olesjal oli raha üle', 'Igor oli talle varem laenanud'],
        ['Kuidas muutus Igori toon kolme kuuga?', 'tänulikust ärritunuks', 'ärritunust tänulikuks', 'see ei muutunud üldse', 'see muutus üha sõbralikumaks'],
        ['Miks vajas Olesja aprillis raha tagasi?', 'tal oli endal hambaarst', 'ta tahtis ise kontserdile minna', 'ta kolis samuti uude korterisse', 'pank nõudis temalt raha'],
        ['Mida tunneb Olesja tõenäoliselt juuni sõnumi ajal?', 'ta on pettunud ja solvunud', 'ta tunneb kergendust', 'tal on süütunne', 'ta on rõõmus ja uhke'],
        ['Miks võis Igor juunis nii teravalt vastata?', 'tal on piinlik ja ta tunneb end süüdi', 'ta on raha juba tagasi maksnud', 'ta ei mäleta laenu', 'Olesja solvas teda märtsis'],
        ['Mis oli Olesja juuni sõnumis kõige riskantsem?', 'etteheide kontserdi kohta, mis kõlab nagu jälgimine', 'kuupäev sõnumi alguses', 'see, et sõnum oli lühike', 'see, et ta ei nimetanud summat'],
      ], 'full', 'g_read'), 'Kui mõistad mõlema tundeid, oskad Olesjale nõu anda.'), { task: 'R02' }),
      'Pärast iga vastust küsi: „Kust sa seda näed?” Küsimused 4–6 on järeldused, mitte tsitaadid: õpilane põhjendab sõnumi tooniga. Lõpus: „Mida oleks Olesja pidanud juunis teisiti kirjutama?”'),
      B.know('047_d_know', ['Eesti seaduse järgi võib lepingu sõlmida ka suuliselt, nii et ka sõbrale suusõnal antud laen on laenuleping. Vaidluse korral tuleb aga tõendada, et raha anti laenuks: abiks on pangaülekanne ja sõnumid. Lepingust tuleneva nõude aegumistähtaeg on kolm aastat. Juristide nõuanne: suurema summa korral pange kokkulepe kirja — summa, tähtaeg ja maksegraafik.'], 'võlaõigusseadus § 11; tsiviilseadustiku üldosa seadus § 146 (Riigi Teataja); Maaleht, „Jurist soovitab: kui laenad suurema summa raha isegi sõbrale, tasub sõlmida kirjalik leping”', 'Kas teadsid? Suuline laen on ka leping'),
    ],
    practice: [
      station(B.notice('047_p_notice', 'Märka: isegi, keegi, ei tulnudki', [
        'Sõnumitest: Lubasid mais, aga raha **ei tulnudki**. · Mulle sa **isegi** ei helista enam. · **Keegi** ei ole mulle nii palju kirjutanud!',
        '**-ki / -gi** lisab rõhku. Pärast **k, p, t, g, b, d, s, h** → **-ki** (ei tulnud**ki**, ei maksnud**ki**); muidu **-gi** (tema**gi**, kuna**gi**, kee**gi**).',
        '1) **ei …-ki**: oodati, aga ei juhtunud: Ta **ei vastanudki**. · Jaatavas: juhtus, nagu karta oli: Ta **unustaski**. 2) **isegi / -gi** = isegi: **Temagi** (ka tema) teab seda.',
        '3) **keegi, miski / midagi, kunagi, kuskil**: määramatu inimene, asi, aeg, koht. Eituses: **mitte keegi**, **mitte midagi**, **mitte kunagi** + ei: Mitte keegi **ei** tea.',
        '**Tunne + põhjus + tagajärg**: **Kuna** keegi ei teatanudki, olin mures; **seetõttu** ei maganud ma terve öö. · Ta ei vastanud, **mistõttu** lõpetasin talle kirjutamise. (Pärast seetõttu on tegusõna kohe järgmine.)',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('047_p_ki', 'Olesja aus kiri.', 'Olesja kirjutab Igorile ausa kirja. Kirjuta iga lause ümber antud sõnaga nii, et mõte jääb samaks, aga tunne kõlab selgelt.', [
        ['Ma ootasin raha mais. Raha ei tulnud.', 'ei …-ki', 'Ma ootasin raha mais, aga see ei tulnudki.|Ma ootasin raha mais, aga raha ei tulnudki.'],
        ['Sa ei helistanud mulle. Sa ei helistanud ka minu sünnipäeval.', 'isegi', 'Sa ei helistanud mulle isegi minu sünnipäeval.|Sa ei helistanud isegi minu sünnipäeval.'],
        ['Ma ei ole sellest ühelegi inimesele rääkinud.', 'mitte kellelegi', 'Ma ei ole sellest mitte kellelegi rääkinud.|Ma pole sellest mitte kellelegi rääkinud.'],
        ['Ma olin pettunud. Põhjus: sa ei vastanud mu sõnumile.', 'kuna', 'Ma olin pettunud, kuna sa ei vastanud mu sõnumile.|Kuna sa ei vastanud mu sõnumile, olin ma pettunud.'],
        ['Ma ei saanud raha tagasi. Ma pidin hambaarsti edasi lükkama.', 'mistõttu', 'Ma ei saanud raha tagasi, mistõttu pidin hambaarsti edasi lükkama.|Ma ei saanud raha tagasi, mistõttu pidin ma hambaarsti edasi lükkama.'],
        ['Mul oli piinlik uuesti küsida. Ma ei kirjutanud kuu aega.', 'seetõttu', 'Mul oli piinlik uuesti küsida, seetõttu ei kirjutanud ma kuu aega.|Mul oli piinlik uuesti küsida. Seetõttu ei kirjutanud ma kuu aega.'],
        ['Ka sinu õde arvab, et sa peaksid mulle helistama.', '-gi', 'Sinu õdegi arvab, et sa peaksid mulle helistama.|Isegi sinu õde arvab, et sa peaksid mulle helistama.'],
      ], 'full', 'g_notice'), 'Igor loeb kirja ja saab aru, mida Olesja tundis ja miks — ilma solvanguta.'), { task: 'G05' }),
      'Pärast iga lauset küsi: „Mis tunne siin on ja mis on põhjus?” Rida 6: pärast seetõttu on tegusõna kohe teine (Seetõttu ei kirjutanud ma). Rida 7 on raskem: -gi liitub nimisõnaga (õdegi = isegi õde).'),
    ],
    transfer: [
      station(tag(purpose(B.listening('047_t_voice', 'Igori häälsõnum.', 'Igor saatis Olesjale häälsõnumi. Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Igor. Ma lugesin su sõnumit mitu korda. Vabandust, ma pean sulle ausalt rääkima.',
        'Ma tean, et sa vajasid seda raha ise ja et sul oli hambaarst. Just see teeb mulle kõige rohkem häbi.',
        'Aprilli alguses jäin ma töötuks. Firma koondas poole meie osakonnast ja ma ei julgenud sellest kellelegi rääkida.',
        'Mul oli nii piinlik, et ma ei vastanudki sulle. Iga kord, kui su nimi telefonis vilkus, tundsin süütunnet.',
        'Kontserdi pileti kinkis mulle õde sünnipäevaks. Ma saan aru, et see nägi halb välja.',
        'Nüüd on mul uus töö laos ja esimene palk tuleb juuli alguses.',
        'Ma pakun nii: maksan alates juulist iga kuu viiskümmend eurot, kuni kogu summa on tagasi makstud. Kui tahad, paneme selle kirja.',
        'Ma kartsin, et kui ma sulle helistan, pead sa mind valetajaks. Aga vaikimine oli veel hullem.',
        'Ma ei taha sind kaotada. Helista mulle, palun, kui oled valmis rääkima.',
      ], [
        'Igor jäi töötuks juba [aprilli alguses|aprillis], aga ei rääkinud sellest kellelegi.',
        'Igor ei vastanud sõnumitele, sest tal oli [piinlik|häbi].',
        'Kui Olesja nimi telefonis vilkus, tundis Igor iga kord [süütunnet].',
        'Kontserdi pileti oli Igorile sünnipäevaks kinkinud tema [õde].',
        'Praegu töötab Igor oma uues töökohas [laos].',
        'Igor pakub, et maksab alates juulist iga kuu [viiskümmend eurot|50 eurot|viiskümmend].',
      ], 'g_read'), 'Häälsõnum näitab teist poolt; ilma selleta oleks su jutt Igoriga ainult süüdistus.'), { task: 'L07' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('047_t_talk', 'Kohtu Igoriga.', 'Kohtu Igoriga kohvikus: ütle oma tunded ja nende põhjus, kuula teda ja leppige kokku, kuidas raha tagasi tuleb.',
        'Olukord: sa oled Olesja asemel (või sinu enda sarnane lugu); Igor saatis häälsõnumi ja te kohtute kohvikus.\nSinu eesmärk: ütle, mida tundsid ja miks (tunne + põhjus + tagajärg), kuula ja leppige kokku summa, kuupäevad ja kuidas edaspidi suhelda.\nPiirang: tahad hoida nii raha kui ka sõprust — ära süüdista, räägi endast.',
        'Igori kaart on õpetajal: tema hirm ja üks uus probleem.',
        ['Ma olin pettunud, kuna …', 'Seetõttu ma …', 'Kõige rohkem tegi haiget see, et sa isegi ei …', 'Ma tahan sind toetada, aga …', 'Mis oleks, kui …?', 'Paneme selle kirja: …'], ['Mul oli nii piinlik, et …', 'Ma olin ärritunud, sest …', 'Ma ei osanudki …', 'Kas sa annad mulle andeks?']), 'Tulemus: teil on kokkulepe ja sõprus jääb alles.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (Igor; õpilane võib valida ka Igori rolli, siis oled sina Olesja). Ütle ainult seda, mida küsitakse. Varjatud info: juuli palk on väiksem, juulis saad maksta ainult 30 eurot; kardad, et Olesja rääkis sinu võlast ühistele sõpradele; sul on tõesti häbi. Takistused ükshaaval: 1) „Kas sa rääkisid sellest teistele ka?” 2) „Juulis saan maksta ainult kolmkümmend.” 3) „Kas me oleme ikka sõbrad?” Õnnestunud, kui õpilane nimetab vähemalt kaks tunnet koos põhjusega (kuna, seetõttu, mistõttu), kasutab vähemalt kaks -ki/-gi vormi, ei süüdista (mina-laused) ja te lepite kokku summad ja kuupäevad.'),
      extension(teach(tag(purpose(B.speaking('047_t_more', 'Rollimäng: ütle viisakalt ei', 'Tuttav, kellega sa käid koos trennis, palub sult laenuks 500 eurot uue telefoni jaoks ja lubab kahe kuu pärast tagasi maksta. Ütle ei nii, et sõprus jääb. Õpetaja on tuttav ja proovib sind ümber veenda.', [
        'Kuidas ütled selgelt ei ja millega seda lühidalt põhjendad?',
        'Mida sa pakud raha asemel: nõu, abi või aega?',
        'Mida vastad, kui tuttav ütleb: „Aga sa ju laenasid Igorile!”',
      ], [120, 180], ['Mul on kahju, aga ma ei laena raha, kuna …', 'See ei ole sinu pärast, vaid …', 'Ma saan aidata hoopis …', 'Loodan, et sa saad aru.']), 'Kui oskad viisakalt ei öelda, ei pea sa sõprust ja raha valima.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Sina oled tuttav. Proovi kolm korda ümber veenda (vt kaart). Õnnestunud, kui õpilane ütleb ei vähemalt kaks korda eri sõnadega, põhjendab ühe lausega (kuna …), pakub ühe muu abi ega hakka valetama.'), 12),
      tag(exitCheck(purpose(B.gaps('047_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka sobiv sõna või vorm. Sulgudes on vihje.', [
        'Ma ootasin terve õhtu, aga ta ei [helistanudki]. (helistama + -ki)',
        'Ma otsisin võtmeid terve hommiku, aga neid ei olnud [kuskil|kusagil]. (kus + -gi)',
        'Ta ei maksnud raha õigel ajal tagasi, [mistõttu] pidin ise laenu võtma. (tagajärg, algab m-tähega)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas -ki/-gi ja tagajärje sõna on käes.')), {}),
      purpose(B.selfcheck('047_t_self', ['Ma räägin rahast ja sõprusest oma või väljamõeldud loo põhjal.', 'Ma saan sõnumitest ja häälsõnumist aru, mida kumbki pool tunneb ja miks.', 'Ma seon tunde põhjuse ja tagajärjega (kuna, seetõttu, mistõttu) ja rõhutan sõnu -ki või -gi abil.', 'Ma räägin sõbraga rahamurest nii, et kokkulepe sünnib ja sõprus jääb.'], 'Jutt räägitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('047_t_letter', 'Kodus: kiri sõbrale.', 'Kirjuta kodus Igorile (või oma loo inimesele) 140–160 sõna: mida sa tundsid ja miks, mis oli kõige raskem, mida sa tema häälsõnumist mõistsid ja millise kokkuleppe pakud (summa, kuupäevad). Kasuta sõnu kuna, seetõttu, mistõttu ja vähemalt kahte -ki/-gi vormi.', 'Tere, Igor!', 'Sinu sõber\n(sinu nimi)', [140, 160]), 'Igor saab kirjast aru, mida sa tunned, ja teab täpselt, mida kokku lepite.')), { task: 'W13', level: 3, harno: 'W1' }),
      tag(homeTask(purpose(B.speaking('047_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu reegel raha laenamiseks sõpradele — kas, kui palju ja miks.', [
        'Mida sa teed, kui sõber palub raha?',
        'Mis aitab sõprust hoida, kui võlg jääb maksmata?',
      ], [60, 120]), 'Õpetaja kuulab sinu reeglit ja ütleb, kas põhjus ja tagajärg on selged.')), { task: 'S15' }),
      homework('047_t_homework', ['1. Kiri sõbrale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-048': {
    title: 'Muusika kell 23 ja majagrupp keeb — kuidas tüli vahendada?',
    phases: grammar('Keel: kaudne kõne — ütles, et …; küsis, kas …; palus, et … / palus mul …-da; väitis, et … (-vat)'),
    format: 'infogap',
    topic: 'neighbours',
    canDo: 'Ma saan aru naabri häälsõnumist, annan kahe naabri sõnad teineteisele täpselt ja erapooletult edasi (ütles, et …; küsis, kas …; palus …; väitis, et …), tean, mida seadus öörahu kohta ütleb, ja kirjutan korteriühistu juhatusele kokkuvõtte koos ettepanekuga.',
    teacherPage: {
      goal: 'Инфогэп: ученик — член правления дома между двумя соседями. Понимает голосовое соседки, передаёт слова обеих сторон косвенной речью, знает закон о тишине и пишет правлению.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 сообщения; станция 4 — без текста о законе, только передача слов соседке и обратно. Голосовое (станция 2) — дома.',
      hook: '«23:15, тебе вставать в шесть. Наверху музыка и громкий смех. Что ты делаешь: ждёшь, стучишь в дверь, пишешь в чат дома или звонишь в полицию? Выбери и одна причина.» Голосуйте оба. Не оценивайте.',
      plan: [
        '0–3: крючок — музыка в 23:15, ученик выбирает сразу',
        '3–10: станция 1 — разговор: какие звуки мешают, был ли я сам «шумным соседом»',
        '10–25: станция 2 — слова (2 мин), прогноз «Что попросит соседка?», голосовое Людмилы дважды, 7 пропусков в косвенной речи',
        '25–37: станция 3 — заметить в своих пропусках «ütles, et / palus, et» → правило → 7 сообщений из чата дома для правления',
        '37–52: станция 4 — что говорит закон (6 коротких ответов), инфогэп: передать слова Людмилы соседу сверху (вы) и принести ответ',
        '52–64: «Kui aega jääb» — спокойное сообщение в чат дома',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо правлению, голосовое 1 минута, слова',
        '80–90: запас',
      ],
      sources: 'Текст станции 4: korrakaitseseadus § 56 lg 2 (Riigi Teataja): не в общественном месте с 22.00 до 6.00, в ночь перед выходным с 0.00 до 7.00 запрещено создавать длительный или повторяющийся шум, существенно мешающий другим; о дневном ремонте KorS часов не задаёт; общие правила дома принимает общее собрание собственников (korteriomandi- ja korteriühistuseadus). Людмила, соседи сверху и чат — учебные.',
      groups: 'Голосовое — каждый сам, сверка в паре. Инфогэп в группе: A — член правления, B — сосед сверху, C — Людмила; A ходит между B и C (они сидят в разных углах). В 1:1 вы играете обоих соседей по очереди.',
      errors: [
        '«Ta ütles, et ta töötas öösiti» → «… et ta töötab öösiti» (в эстонском время при пересказе не сдвигается, как и в русском).',
        '«Ta küsis, kas sa saaksid» → «Ta küsis, kas ma saaksin» (меняется лицо: sa → ma, ma → ta).',
        '«Ta palus mind rääkima» → «Ta palus mul rääkida» / «Ta palus, et ma räägiksin» (palus + kellel + da-инфинитив).',
        '«Ta küsis, et millal» → «Ta küsis, millal …» (вопросительное слово без «et»).',
      ],
      notes: [
        'Формат — инфогэп: у ученика только слова Людмилы; позицию соседей сверху знаете только вы. Он должен спросить, передать и вернуться — без этого задача не решается. Это и есть посредничество (CEFR B2 «mediating communication»).',
        'Ученику без своей квартиры: общежитие, частный дом и соседи через забор (собака, газонокосилка) — те же фразы. Пенсионеру — «я сам член правления дома»; маме — «наш ребёнок шумит». Ни одна сторона не «виновата»: не позволяйте ученику судить.',
        'Обратная связь, 2–3 цели: лицо и место при пересказе (ma → ta, siin → seal); kas / millal без et; нейтральные глаголы (ütles, palus, pakkus — не karjus, nõudis).',
      ],
    },
    discover: [
      station(B.text('048_d_hook', 'Mida sa teed?', 'Kell on 23.15, äratus helistab kell kuus. Ülemisel korrusel mängib muusika ja keegi naerab valjult. Mida sa teed: ootad, koputad uksele, kirjutad majagruppi või helistad politseisse? Vali kohe ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('048_d_talk', 'Helid minu kodus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Millised helid sinu kodus või tänaval sind segavad ja millised mitte?',
        'Kas oled ise kunagi naabreid seganud — remont, laps, koer, pidu? Kuidas nad reageerisid?',
        'Kuidas lahendatakse naabritülisid mõnes teises riigis, mida tead: räägitakse otse, kirjutatakse või kutsutakse politsei?',
      ], [150, 210], ['Mind segab, kui …', 'Olin väga ärritunud, kui …', 'Meil oli kombeks …']), 'Sinu enda kodu annab naabritülile esimese võrdluse.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu oma majast. Ära paranda. Kui õpilane elab eramajas: „Mis sind naabri juures segab — koer, muruniiduk, auto?”')),
      station(tag(B.vocab('048_d_vocab', 'Enne kuulamist: sõnad.', ['naaber — сосед', 'öörahu — ночная тишина', 'müra — шум', 'segama — мешать', 'kaebus — жалоба', 'korteriühistu — товарищество собственников', 'trepikoda — подъезд', 'vahendaja — посредник', 'erapooletu — беспристрастный', 'edasi andma — передавать']), { topic: ['öörahu', 'korteriühistu', 'vahendaja'] }), 2, 15),
      teach(tag(purpose(B.listening('048_d_voice', 'Naabri häälsõnum.', 'Sa oled korteriühistu juhatuse liige. Naaber teiselt korruselt saatis sulle häälsõnumi. Enne kuulamist arva: mida ta sinult palub? Siis kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Ljudmila. Ma elan teisel korrusel, korteris neli. Vabandust, et nii hilja sõnumi saadan.',
        'Ma töötan haiglas öövahetustes ja magan päeval, tavaliselt kella kaheksast kolmeni.',
        'Ma saan aru, et remonti on vaja teha ja et noored tahavad vahel pidu pidada. Ma ei ole ise ka kunagi vaikne naaber olnud.',
        'Viimased kaks nädalat on ülemisest korterist kostnud päeval puurimist ja õhtul valju muusikat, eriti reedeti. Ma ei saa magada ja mu enesetunne on väga halb.',
        'Ma käisin eile nende uksel, aga keegi ei tulnudki uksele. Siis kirjutasin majagruppi ja nüüd on seal juba nelikümmend sõnumit ja kõik on vihased.',
        'Üks naaber kirjutas, et ma olen lihtsalt tülinorija. See tegi väga haiget.',
        'Ma ei taha politseid kutsuda. Ma palun ainult, et remont oleks tööpäeviti kella kaheteistkümnest kuueni ja et reede õhtul pandaks muusika kella kümneks vaiksemaks.',
        'Kas sa saaksid nendega rääkida? Sind nad usaldavad. Aitäh!',
      ], [
        'Ljudmila ütles, et ta töötab haiglas [öövahetustes|öösiti|öövahetuses].',
        'Ta ütles, et magab päeval kella kaheksast kuni [kolmeni|kella kolmeni].',
        'Ta kurtis, et ülemisest korterist kostab päeval [puurimist|puurimine].',
        'Ta rääkis, et käis naabrite uksel, aga keegi ei tulnud [uksele|avama].',
        'Üks naaber olevat teda majagrupis nimetanud [tülinorijaks].',
        'Ljudmila palus, et remont oleks tööpäeviti kella kaheteistkümnest [kuueni|kella kuueni].',
        'Ta palus ka, et reede õhtul pandaks muusika [kella kümneks|kümneks] vaiksemaks.',
      ], 'g_read'), 'Su märkmed on Ljudmila sõnad kaudses kõnes — just neid viid ülemistele naabritele.'), { task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida ta palub?”; 2) esimene kuulamine — „Mis on tema suurim mure?”; 3) teine — lüngad; 4) detail: „Mis kell ta magab?”; 5) üks lause: „Kumba poolt sa praegu rohkem mõistad ja miks?” Ära lase õpilasel kohe kohut mõista.'),
    ],
    practice: [
      station(B.notice('048_p_notice', 'Märka: Ljudmila ütles, et …', [
        'Häälsõnumist: „**Ma** töötan haiglas.” → Ljudmila ütles, et **ta** töötab haiglas. · „Kas **sa** saaksid nendega rääkida?” → Ta küsis, kas **ma** saaksin nendega rääkida.',
        '**Väide**: ütles / rääkis / kirjutas, **et** … · **Küsimus**: küsis, **kas** … (jah-ei-küsimus) või küsis, **millal / miks / kes** … (ilma sõnata et) · **Palve**: palus, **et** ma räägiksin … või palus **mul** rääkida (da-tegevusnimi).',
        '**Aeg ei muutu**: „Ma magan päeval.” → Ta ütles, et ta **magab** päeval. Muutuvad **isik** (ma → ta, sa → ma, me → nad) ning **koht ja aeg** (siin → seal, täna → sel päeval, homme → järgmisel päeval).',
        'Kui sa väite eest ei vastuta või see võib olla vale, kasuta **-vat** (moodul 7): Naaber **väitis**, et uus elanik **olevat** hoolimatu.',
        '**Erapooletu vahendaja** kasutab neutraalseid tegusõnu: ütles, rääkis, palus, pakkus, küsis — mitte karjus, nõudis, ähvardas.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('048_p_report', 'Majagrupist juhatusele.', 'Juhatus palub sul majagrupi tüli kokku võtta. Anna iga sõnum kaudses kõnes edasi, alusta antud sõnadega.', [
        ['Ülemine naaber: „Me teeme remonti ainult kaks nädalat.”', 'Ülemine naaber kirjutas, et', 'Ülemine naaber kirjutas, et nad teevad remonti ainult kaks nädalat.'],
        ['Ljudmila: „Kas te saaksite reede õhtul muusika vaiksemaks panna?”', 'Ljudmila küsis, kas', 'Ljudmila küsis, kas nad saaksid reede õhtul muusika vaiksemaks panna.'],
        ['Esimese korruse naaber: „Ärge kirjutage siia keset ööd!”', 'Esimese korruse naaber palus, et', 'Esimese korruse naaber palus, et keegi ei kirjutaks sinna keset ööd.|Esimese korruse naaber palus, et nad ei kirjutaks sinna keset ööd.'],
        ['Kolmanda korruse naaber: „Ljudmila on lihtsalt tülinorija.” (Sina seda ei usu.)', 'Kolmanda korruse naaber väitis, et', 'Kolmanda korruse naaber väitis, et Ljudmila olevat lihtsalt tülinorija.'],
        ['Ljudmila: „Millal teie remont lõpeb?”', 'Ljudmila küsis, millal', 'Ljudmila küsis, millal nende remont lõpeb.'],
        ['Juhatuse esimees: „Ma tulen homme kell kuus teie juurde.”', 'Esimees kirjutas, et', 'Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus nende juurde.|Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus meie juurde.'],
        ['Ülemine naaber: „Helistage mulle otse, ärge kirjutage gruppi!”', 'Ülemine naaber palus', 'Ülemine naaber palus talle otse helistada ja mitte gruppi kirjutada.|Ülemine naaber palus, et talle helistataks otse ja gruppi ei kirjutataks.'],
      ], 'full', 'g_notice'), 'Juhatus näeb tüli rahulikult ja täpselt, ilma vihaste sõnadeta.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kes räägib ja kellele? Mis muutub: isik, koht, aeg?” Rida 4: õpilane ise ei usu väidet, seepärast -vat (olevat). Rida 6: homme → järgmisel päeval. Rida 7: palus + da-tegevusnimi või palus, et + tingiv.'),
    ],
    transfer: [
      station(B.text('048_t_rules', 'Mida ütleb seadus öörahu kohta?', 'Korrakaitseseaduse järgi on mujal kui avalikus kohas, näiteks korterites, kella 22.00-st kuni 6.00-ni keelatud tekitada kestvat või korduvat müra, mis teisi oluliselt häirib. Puhkepäevale eelneval ööl, näiteks reedest laupäeva vastu, kehtib see keeld kella 0.00-st kuni 7.00-ni. Päevase remondi kellaaegu see seadus ei määra, seepärast lepivad paljud majad need kokku oma kodukorras. Kui mure jääb, soovitatakse kõigepealt rääkida naabriga otse ja seejärel pöörduda korteriühistu juhatuse poole. Maja ühised reeglid võtab vastu korteriomanike üldkoosolek.\n\n*Allikas: korrakaitseseadus § 56 (Riigi Teataja); korteriomandi- ja korteriühistuseadus.*'), 4, 15, { final: 'advise' }),
      teach(tag(purpose(B.table('048_t_ask', 'Naabrid küsivad sinult.', 'Vasta teksti järgi 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Ülemine naaber: „Kas kolmapäeval kell 23 võib korteris veel valjult muusikat kuulata?” | [ei/ei või/ei tohi]',
        'Ljudmila: „Mis kell algab öörahu reedest laupäeva vastu?” | [kell 0.00/südaööl/keskööl/kell 0/kell kaksteist öösel]',
        'Teise korruse noormees: „Mis kell lõpeb öörahu pühapäeva hommikul?” | [kell 7.00/kell 7/kell seitse/seitsmel]',
        'Esimese korruse proua: „Kas korrakaitseseadus ütleb, mis kell päeval remonti teha võib?” | [ei/ei ütle/ei määra]',
        'Vanem härra: „Kelle poole pöörduda, kui otse rääkimine ei aidanud?” | [korteriühistu juhatuse poole/juhatuse poole/korteriühistu juhatus/juhatus]',
        'Uus elanik: „Kes võtab vastu maja ühised reeglid?” | [korteriomanike üldkoosolek/üldkoosolek]',
      ], 'g_read'), 'Kui tead reegleid, saad vahendada faktidega, mitte tunnetega.'), { task: 'R15', harno: 'R2b' }),
      'Eksaminurk (R2b): eksamil on 200–300-sõnaline teabetekst ja lühivastused 1–3 sõnaga. Siin on tekst lühem, sest põhitöö on vahendamine. Rõhuta: seadus ei aita, kui inimesed ei räägi.'),
      teach(tag(purpose(B.rolecards('048_t_relay', 'Vahenda naabrite vahel.', 'Mine ülemise korruse naabri juurde (õpetaja), anna Ljudmila sõnad edasi, küsi tema seisukohta ja vii vastus Ljudmilale tagasi.',
        'Kaart A (sina, juhatuse liige): Ljudmila häälsõnum on sinu märkmetes. Sa ei tea, mida ülemised naabrid arvavad.\nSinu eesmärk: anna Ljudmila sõnad erapooletult edasi (ütles, et …; palus, et …), saa teada nende seisukoht ja paku üks lahendus, mida mõlemad võiksid vastu võtta.\nPiirang: sa ei ole kohtunik — ära ütle, kellel on õigus.',
        'Kaart B (ülemine naaber) on õpetajal: tema põhjused ja üks asi, mida Ljudmila ei tea.',
        ['Ljudmila palus mul teile edasi öelda, et …', 'Ütlen otsekoheselt, aga rahulikult: …', 'Ta küsis, kas …', 'Kuidas teie seda näete?', 'Kas ma võin Ljudmilale öelda, et …?', 'Mis oleks, kui …?'], ['Ta ütles, et …, aga …', 'Me ei teadnudki, et …', 'Öelge talle, et …']), 'Tulemus: mõlemad naabrid teavad, mida teine tegelikult ütles, ja neil on üks ühine ettepanek.'), { task: 'S05', level: 4 }),
      'Õpetaja kaart B (ülemine naaber; seejärel mängi Ljudmilat). Varjatud info: peres on kuuekuune laps; vannitoas purunes toru ja kindlustus nõuab remondi lõpetamist kuu lõpuks; reede muusika oli isa neljakümnes sünnipäev, see oli ühekordne; te ei teadnud, et Ljudmila töötab öösiti; teid solvasid nelikümmend vihast sõnumit. Pakkumine, kui küsitakse: järgmisel nädalal puurite ainult 15–18. Takistused: 1) „Miks ta meile ise ei helistanud?” 2) „Me ei saa remonti peatada, kindlustus!” 3) Ljudmila rollis: „Kas nad ütlesid, et nad vabandavad?” Õnnestunud, kui õpilane annab edasi vähemalt neli lauset kaudses kõnes (sh üks küsimus ja üks palve), kasutab neutraalseid tegusõnu, ei mõista kohut ja viib tagasi ühe ühise ettepaneku.'),
      extension(teach(tag(purpose(B.speaking('048_t_more', 'Sõnavõtt majakoosolekul', 'Maja vestluses on nelikümmend vihast sõnumit ja juhatus kutsus kokku majakoosoleku. Räägi juhatuse liikmena koosolekul rahulikult 2–3 minutit. Ära süüdista kedagi ega kasuta silte.', [
        'Mida ütles ja palus Ljudmila ja mida ütlesid ülemised naabrid (kaudses kõnes)?',
        'Mida seadus öörahu kohta ütleb?',
        'Mis on järgmine samm: millal ja kus on koosolek?',
      ], [120, 180], ['Ljudmila palus mul edasi öelda, et …', 'Ülemised naabrid ütlesid, et …', 'Juhatus teeb ettepaneku, et …', 'Palun lõpetame vihaste sõnumite kirjutamise.']), 'Üks rahulik sõnavõtt võib peatada tüli, mis vestluses kasvab.'), { task: 'S16', level: 4 }),
      'Kui aega jääb (12 min). Kuula sõnavõttu nagu ülemine naaber ja nagu Ljudmila: kas kumbki tunneb end rünnatuna? Kontrolli: kaudne kõne, neutraalsed tegusõnad, konkreetne aeg ja koht, mitte ühtegi silti (tülinorija, hoolimatu).'), 12),
      tag(exitCheck(purpose(B.gaps('048_t_exit', 'Kontrolli end: kolm lauset kaudses kõnes.', 'Kirjuta lünka üks sõna.', [
        'Naaber küsis, [kas] me saaksime muusika vaiksemaks panna.',
        'Naaber ütles: „Mul on väike laps.” Naaber ütles, et [tal|temal] on väike laps.',
        'Ülemine naaber palus meil gruppi mitte [kirjutada]. (kirjutama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas küsimus, isik ja palve kaudses kõnes on käes.')), {}),
      purpose(B.selfcheck('048_t_self', ['Ma räägin, millised helid mind kodus segavad ja kuidas naabritülisid lahendatakse.', 'Ma saan naabri häälsõnumist aru ja tean, mida seadus öörahu kohta ütleb.', 'Ma annan teise sõnad kaudses kõnes edasi: ütles, et …; küsis, kas …; palus …; väitis, et …', 'Ma vahendan kahe naabri vahel erapooletult ja kirjutan juhatusele kokkuvõtte.'], 'Tüli vahendatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('048_t_letter', 'Kodus: kokkuvõte juhatusele.', 'Kirjuta kodus korteriühistu juhatusele 140–160 sõna: mis juhtus, mida ütles ja palus Ljudmila, mida ütlesid ülemised naabrid (kaudses kõnes, erapooletult), mida ütleb seadus ja sinu ettepanek kokkuleppeks. Ära kirjuta, kellel on õigus.', 'Lugupeetud juhatus!', 'Lugupidamisega\n(sinu nimi), korter …', [140, 160]), 'Juhatus saab sinu kirjast kahe poole täpse pildi ja otsustab, kuidas edasi.')), { task: 'W12', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('048_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa Ljudmilale trepikojas kohtudes räägiksid — mida ülemised naabrid ütlesid ja palusid ja mis on järgmine samm.', [
        'Mida nad ütlesid ja miks?',
        'Mida nad palusid ja mida pakkusid?',
      ], [60, 120]), 'Õpetaja kuulab, kas kaudne kõne on täpne ja toon erapooletu.')), { task: 'S15' }),
      homework('048_t_homework', ['1. Kokkuvõte juhatusele, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-049': {
    title: 'Kaks õde ja üks apelsin: kuidas pere ühise plaani leiab?',
    phases: grammar('Keel: pehme ettepanek ja tingimus — ma saan aru, et …; mis oleks, kui …?; kas saaksime …?; olen nõus tingimusel, et …'),
    format: 'game',
    topic: 'family',
    canDo: 'Ma räägin pere või sõpradega läbi ja jõuan konkreetse kokkuleppeni, sest tean, mille poolest erineb seisukoht huvist: näitan, et mõistan teist (ma saan aru, et …), pakun pehmelt (mis oleks, kui …; kas saaksime …) ja seon järeleandmise tingimusega (olen nõus tingimusel, et …).',
    teacherPage: {
      goal: 'Игра-переговоры: семья трёх поколений планирует одно лето. Ученик отличает позицию от интереса (радио), предлагает мягко условным наклонением и с условием и составляет свою «карточку договорённости».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 пропуска; станция 4 — один раунд игры без карточки условий, карточка договорённости — дома. Радио (станция 2) — дома.',
      hook: '«Две сестры спорят из-за последнего апельсина. Мама режет его пополам. Справедливо? Угадай: чего сёстры хотели на самом деле?» Ответьте оба. Не раскрывайте ответ — его даст радио (одной нужен сок, другой — корка для пирога).',
      plan: [
        '0–3: крючок — апельсин, ученик отвечает сразу',
        '3–10: станция 1 — разговор: из-за чего спорят в семье, кто уступает',
        '10–25: станция 2 — слова (2 мин), радио с семейным медиатором дважды, 6 вопросов; проверка догадки об апельсине',
        '25–37: станция 3 — заметить в радио «ma saan aru, et», «kui oleks küsinud» → правило → семейный спор о Рождестве: 7 пропусков',
        '37–52: станция 4 — три карточки интересов, игра в два раунда с карточкой нового условия, очки; начало «Minu kokkuleppe kaart»',
        '52–64: «Kui aega jääb» — ролевая игра: извиниться так, чтобы сработало',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо-договорённость, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио: история об апельсине — классический пример различия позиции и интереса из R. Fisher, W. Ury «Getting to Yes» (1981; приписывается Mary Parker Follett); Sotsiaalkindlustusamet «Perelepitus»: государственная семейная медиация бесплатна для расходящихся родителей, обе стороны подают заявление; perelepitaja прошёл не менее 160 часов базового обучения. Медиатор Тийна Каск, семья и карточки — учебные.',
      groups: 'Радио — каждый сам, сверка в паре. Игра в группе из трёх: каждый берёт одну карточку (бабушка, родитель, подросток); вы ведёте время, тянете карточку условия и считаете очки. В 1:1 ученик выбирает роль, вы играете остальные две.',
      errors: [
        '«Mis oleks, kui me läheme» → «Mis oleks, kui me läheksime» (в предложении-гипотезе — условное наклонение).',
        '«Olen nõus, tingimusel et» → «Olen nõus tingimusel, et …» (запятая перед et, как в juhul, kui); после tingimusel, et обычно изъявительное (sa teed), условное тоже встречается.',
        '«Ma saan aru, et sa oleksid väsinud» → «… et sa oled väsinud» (понимаю факт — изъявительное).',
        '«Kas me saame …» звучит как требование; «Kas me saaksime …?» — мягче.',
      ],
      notes: [
        'Формат — игра с очками: конкретная договорённость (кто, что, когда) — 3 очка, каждое «Ma saan aru, et …» — 1, каждая уступка с условием — 1. Карточка нового условия во втором раунде (машина в ремонте, бюджет меньше, бабушка заболела, фестиваль перенесли) заставляет договариваться заново.',
        'Ученику без семьи рядом: друзья планируют поездку или соседи — общий двор; пенсионер может играть бабушку — это его голос. Тема развода (perelepitus) — только факт из радио; не расспрашивайте о семье ученика.',
        'Обратная связь, 2–3 цели: условное наклонение в предложении; изъявительное после tingimusel, et и ma saan aru, et; конкретность («küll kuidagi» — не договорённость).',
      ],
    },
    discover: [
      station(B.text('049_d_hook', 'Üks apelsin, kaks õde', 'Kaks õde vaidlevad viimase apelsini pärast. Ema lõikab apelsini pooleks ja annab kummalegi poole. Kas see on õiglane lahendus? Arva: mida õed võisid tegelikult tahta? Ütle kohe oma arvamus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('049_d_talk', 'Mille üle peres vaieldakse?', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Mille üle teie peres (või sõbra peres) kõige sagedamini vaieldakse: pühad, puhkus, raha, kodutööd, vanavanemad?',
        'Kes teie peres tavaliselt järele annab ja kes otsustab? Kas see on õiglane?',
        'Kas sinu kodumaal on vanema põlvkonna sõnal peres suurem kaal kui Eestis?',
      ], [150, 210], ['Meil vaieldakse kõige rohkem …', 'Tavaliselt annab järele …, sest …', 'Minu arvates …']), 'Sinu pere või sõprade näide annab mängule päris tausta.'), { task: 'S09', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt (võib olla väljamõeldud pere). Ära küsi lahutuse ega päris tülide kohta. Lõpus ütle: „Pea meeles oma näidet — mängus kasutame seda.”')),
      station(tag(B.vocab('049_d_vocab', 'Enne kuulamist: sõnad.', ['kompromiss — компромисс', 'kokkulepe — договорённость', 'seisukoht — позиция', 'huvi — интерес (что на самом деле важно)', 'arvestama — считаться (с кем-то)', 'tingimus — условие', 'vastu tulema — идти навстречу', 'lahendus — решение', 'põlvkond — поколение', 'leppima — мириться (договариваться)']), { topic: ['huvi', 'põlvkond'] }), 2, 15),
      teach(tag(purpose(B.examListen('049_d_radio', 'Raadio: kuidas pere kokkuleppele jõuab?', 'Kuula raadiosaadet kaks korda ja vali õige vastus. Kas sinu arvamus apelsini kohta oli õige?', 'choice', [
        'Saatejuht: Tere! Pühad on lähedal ja paljudes peredes algab vaidlus: kus, kellega ja kui kaua. Stuudios on perelepitaja Tiina Kask. Tiina, kust alustada?',
        'Tiina: Ma alustan sageli ühe vana looga. Kaks õde vaidlevad apelsini pärast ja ema lõikab selle pooleks. Üks õde pressib oma poolest mahla ja viskab koore ära. Teine riivib koore kooki ja viskab sisu ära. Kui ema oleks küsinud, milleks neil apelsini vaja on, oleks kumbki saanud kõik, mida ta tegelikult tahtis.',
        'Saatejuht: Mida see lugu meile õpetab?',
        'Tiina: Et seisukoht ja huvi ei ole sama asi. Seisukoht on see, mida inimene nõuab: jõulud on meil! Huvi on see, miks ta seda nõuab: vanaema kardab üksi jääda, noor ema tahab, et laps saaks rahulikult magada. Kui me räägime huvidest, leiame tavaliselt rohkem lahendusi.',
        'Saatejuht: Kuidas seda praktikas teha?',
        'Tiina: Kõigepealt kuula ja ütle oma sõnadega, mida teine tahab: ma saan aru, et sulle on tähtis … Siis otsige koos vähemalt kolm varianti, enne kui midagi otsustate. Ja lõpuks leppige kokku täpselt: kes, mida ja millal. Lause „küll me kuidagi saame” ei ole kokkulepe.',
        'Saatejuht: Ja kui pere ise hakkama ei saa?',
        'Tiina: Siis võib appi kutsuda lepitaja. Eestis pakub Sotsiaalkindlustusamet lahku minevatele vanematele tasuta perelepitust, et nad saaksid lapse huvides kokku leppida. Perelepitaja on läbinud vähemalt sada kuuskümmend tundi koolitust. Lepitaja ei otsusta kellegi eest, ta aitab rääkida.',
        'Saatejuht: Üks nõuanne kuulajatele?',
        'Tiina: Küsi enne vaidlust: miks see sulle tähtis on? Ja vasta ise samale küsimusele.',
      ], [
        ['Miks oleks emal olnud perelepitaja arvates parem õdedelt kõigepealt küsida?', 'kumbki õde oleks saanud kõik, mida ta tegelikult vajas', 'ema oleks saanud apelsini endale', 'apelsin oleks jäänud tervikuks'],
        ['Mis on perelepitaja sõnul huvi ja mille poolest erineb see seisukohast?', 'põhjus, miks inimene midagi nõuab', 'see, mida inimene valjult nõuab', 'kompromiss, mille pere lõpuks leiab'],
        ['Mida tuleks perelepitaja järgi vaidluses teha kõige esimesena?', 'kuulata ja öelda oma sõnadega, mida teine tahab', 'otsustada kiiresti, kes on õiges', 'paluda vanaemal otsustada'],
        ['Mitu varianti soovitab perelepitaja koos leida, enne kui pere midagi otsustab?', 'vähemalt kolm', 'ainult ühe hea', 'nii palju, kui aega on'],
        ['Miks ei ole perelepitaja arvates lause „küll me kuidagi saame” veel kokkulepe?', 'selles pole öeldud, kes mida ja millal teeb', 'see on liiga ebaviisakas', 'see kõlab nagu käsk'],
        ['Kellele pakub Sotsiaalkindlustusamet Eestis raadiosaate järgi tasuta perelepitust?', 'lahku minevatele vanematele', 'kõigile tülis naabritele', 'ainult vanavanematele'],
      ], 'g_read'), 'Saade annab sulle mängu reegli: räägi huvidest, mitte seisukohtadest.'), { voice: 'interview', task: 'L02' }),
      'Kuulamise tsükkel: 1) prognoos (apelsin) on juba tehtud; 2) esimene kuulamine — „Mida õed tahtsid?”; 3) teine — valikvastused; 4) detail: „Mitu varianti?”; 5) üks lause: „Mis on sinu peres tavaline seisukoht ja mis on selle taga olev huvi?”'),
      B.know('049_d_know', ['Kui lahku minevad vanemad ei suuda lapse elu üle ise kokku leppida, pakub Sotsiaalkindlustusamet neile tasuta riiklikku perelepitust. Teenust saab taotleda siis, kui mõlemad vanemad on nõus ja esitavad taotluse. Perelepitaja on läbinud vähemalt 160 tundi baaskoolitust ja tal on kõrgharidus näiteks psühholoogias, õigusteaduses või sotsiaaltöös. Lepitaja ei otsusta pere eest: ta aitab vanematel kuulata ja leida lahenduse, mis arvestab lapse huvidega.'], 'Sotsiaalkindlustusamet, „Perelepitus” (sotsiaalkindlustusamet.ee)', 'Kas teadsid? Perelepitus Eestis'),
    ],
    practice: [
      station(B.notice('049_p_notice', 'Märka: kuidas pakkuda nii, et teine kuulab', [
        'Raadiost: „**Ma saan aru, et** sulle on tähtis …” · „Kui ema **oleks küsinud**, **oleks** kumbki **saanud** kõik.”',
        '**Näita, et mõistad** (kindel kõneviis, sest see on fakt): Ma saan aru, et sul **on** raske. · Mulle tundub, et sulle **on** tähtis …',
        '**Paku tingiva kõneviisiga** (pehmem kui käsk): **Mis oleks, kui** me **läheksime** …? · **Kas** me **saaksime** …? · Me **võiksime** proovida …',
        '**Järeleandmine tingimusega**: Olen nõus **tingimusel, et** sina **teed** … (tingimusel, et + tavaliselt kindel kõneviis) · **Juhul, kui** …, siis … · **Vastutasuks** ma …',
        '**Ära ütle**: Sa alati … · Ei, see ei sobi. → **Ütle**: See on minu jaoks keeruline, sest … Mis oleks, kui …?',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('049_p_mood', 'Jõulud: kus ja kellega?', 'Pere vaidleb, kus jõule veeta. Otsusta, kas lause vajab tingivat või kindlat kõneviisi, ja kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Mis oleks, kui me [veedaksime] jõululaupäeva meil ja esimese püha vanaema juures? (veetma)',
        'Kas me [saaksime] sõita juba reedel, et laps ei peaks õhtul autos magama? (saama)',
        'Ma saan aru, et sa [kardad] pühade ajal üksi jääda. (kartma)',
        'Olen nõus maale sõitma tingimusel, et sina [juhid|juhiksid] tagasiteel autot. (juhtima)',
        'Kui vanaema [tuleks] hoopis meile, ei peaks keegi kaheksa tundi sõitma. (tulema)',
        'Vastutasuks [võiksin] ma vanaemale enne pühi aias appi minna. (võima)',
        'Kui me oleksime varem rääkinud, [poleks|ei oleks] see tüli nii suureks läinud. (olema, eitus)',
      ], '', 'full', 'g_notice'), 'Õige vorm teeb ettepaneku pehmeks ja tingimuse selgeks; see on mängu põhivõte.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas see on fakt või ettepanek?” Fakt → kindel kõneviis (kardad, juhid), ettepanek või mõeldud olukord → tingiv (veedaksime, tuleks). Rida 7 on minevikus: oleks + -nud.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('049_t_cards', 'Kolm huvi, üks suvi.', 'Loe kaarte ja vali endale üks roll. Tõmba joon alla sellele, mis on sinu rolli tegelik huvi.', [
        ['Vanaema (68)', ['soov: kogu pere tuleb juulis kaheks nädalaks tema maakoju Võrumaale', 'põhjus: vanaisa suri talvel ja tal on raske üksi toime tulla', 'maja katus vajab parandamist ja aed on suur', 'tal ei ole autot, pood on viie kilomeetri kaugusel'], []],
        ['Lapsevanem (38)', ['soov: üks nädal mere ääres Pärnus', 'põhjus: raske tööaasta, ta tahab lihtsalt puhata, magada ja leida tasakaalu töö ja pere vahel', 'puhkust on juulis ainult kaks nädalat', 'pere suvine eelarve on 600 eurot'], []],
        ['Teismeline (15)', ['soov: jääda juulis linna', 'põhjus: 12. juulil on Tallinnas muusikafestival, kuhu lähevad kõik sõbrad', 'tal on suvetöö kohvikus kolmel päeval nädalas', 'maal on internet väga nõrk'], []],
      ], '3', 'g_read'), 'Kaardid näitavad seisukohtade taga olevaid huvisid; neid läheb mängus vaja.'), { task: 'R11', level: 3 }), 4, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('049_t_game', 'Läbirääkimismäng: üks suvi, kolm soovi.', 'Mängu lõpuks on teil kompromiss, mis arvestab iga põlvkonnaga. Punktid: konkreetne kokkulepe (kes, mida, millal) 3, iga „Ma saan aru, et …” 1, iga tingimusega järeleandmine 1.',
        'Sinu roll: vali üks kaart (vanaema, lapsevanem või teismeline).\nSinu eesmärk: saada see, mis sulle tegelikult tähtis on — mitte tingimata see, mida alguses nõudsid.\nTingimus: enne igat oma ettepanekut ütle, mida teine tahab (Ma saan aru, et …). Teises voorus muutub üks asi ja kokkulepet tuleb muuta.',
        'Teised rollid ja tingimuste kaardid on õpetajal.',
        ['Ma saan aru, et sulle on tähtis …', 'Mis oleks, kui …?', 'Kas me saaksime …?', 'Olen nõus tingimusel, et …', 'Vastutasuks ma …'], ['See on minu jaoks keeruline, sest …', 'Aga mis siis, kui …?', 'Hea, lepime kokku: …']), 'Tulemus: teie pere suveplaan, kus iga põlvkonna tegelik huvi on arvesse võetud.'), { task: 'S17', main: true, harno: 'S2' }),
      'Õpetaja kaart. Mängi rolle, mida õpilane ei valinud; ütle kõigepealt oma seisukoht, huvi ainult siis, kui küsitakse („Miks see sulle tähtis on?”). 2. voor — tõmba üks tingimus: 1) auto läheb remonti, ainult buss ja rong; 2) eelarve on 400, mitte 600 eurot; 3) vanaema kukkus ja ei saa kaks nädalat aias töötada; 4) festival lükati augustisse. Loe punktid kokku ja hääleta lõpus ka ise. Õnnestunud, kui kokkuleppes on kes, mida ja millal, iga roll saab oma huvi ja õpilane kasutab vähemalt kaks tingivat ettepanekut ja ühe „tingimusel, et”.'),
      tag(purpose(B.planning('049_t_plan', 'Minu kokkuleppe kaart.', 'Täida kaart ühe päris või väljamõeldud tüli kohta (sõber, naaber või pere).', [
        'Kes ja mille üle vaidlesid? Mis oli kummagi seisukoht? Kas oleks vaja vahendajat või lepitajat?',
        'Mis oli kummagi tegelik huvi (miks see talle tähtis oli)?',
        'Kolm varianti, mida võiks proovida.',
        'Meie kokkulepe: kes, mida ja millal? Mis saab, kui see ei toimi?',
      ], 3), 'Kaart jääb sulle: sellest räägid mooduli kontrollis ja selle järgi kirjutad kodus kirja.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('049_t_more', 'Rollimäng: vabanda nii, et see mõjub', 'Sa unustasid oma ema seitsmekümnenda sünnipäeva (või kirjutasid naabrile majagrupis teravalt). Õpetaja on solvunud pereliige või naaber. Vabanda ja paku, kuidas asja heastada; ära vabanda end välja („aga mul oli nii palju tööd”).', [
        'Mis täpselt oli valesti ja kuidas sa seda ütled ilma „aga”-ta?',
        'Kuidas näitad, et mõistad teise tunnet?',
        'Mis on sinu konkreetne samm ja mida teed edaspidi teisiti?',
      ], [120, 180], ['Mul on väga kahju, et …', 'See oli minu viga, ma ei olnud tähelepanelik.', 'Mul on süütunne, sest …', 'Ma saan aru, et sulle tegi haiget see, et …', 'Kas ma saaksin seda heastada nii, et …?']), 'Hea vabandus avab ukse kokkuleppele; halb vabandus teeb tüli suuremaks.'), { task: 'S19', level: 4 }),
      'Kui aega jääb (12 min). Ole solvunud, aga mitte vaenulik; sinu tingimus: „Olgu, aga tingimusel, et …”. Kui õpilane ütleb „aga” või süüdistab olukorda, ütle: „Kuulen õigustust, mitte vabandust.” Õnnestunud, kui vabandus nimetab teo, tunnistab teise tunnet (Ma saan aru, et …), on ilma „aga”-ta ja lõpeb konkreetse sammuga.'), 12),
      tag(exitCheck(purpose(B.gaps('049_t_exit', 'Kontrolli end: kolm ettepanekut.', 'Kirjuta sulgudes olev tegusõna õiges vormis: tingiv või kindel kõneviis.', [
        'Mis oleks, kui me [sõidaksime] seekord rongiga? (sõitma)',
        'Olen nõus tingimusel, et sina [pesed|peseksid] täna nõud. (pesema)',
        'Ma saan aru, et sa [oled] väsinud, aga see on mulle tähtis. (olema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tingiv ja kindel kõneviis ettepanekus on käes.')), {}),
      purpose(B.selfcheck('049_t_self', ['Ma räägin, mille üle peres või sõpradega vaieldakse.', 'Ma saan raadiost aru, mille poolest erineb seisukoht huvist.', 'Ma pakun pehmelt (mis oleks, kui …; kas saaksime …) ja seon järeleandmise tingimusega.', 'Ma jõuan läbirääkimisel konkreetse kokkuleppeni: kes, mida ja millal.'], 'Kokkulepe sõlmitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('049_t_letter', 'Kodus: kokkuleppe kiri.', 'Kirjuta kodus oma kokkuleppe kaardi inimesele (sõber, naaber või pereliige) 150–180 sõna: vabandus või tänu, kuidas sina tema huvi mõistad, mida pakud ja mis tingimusel ning konkreetne kokkulepe (kes, mida, millal). Kui lugu on välja mõeldud, kirjuta mõeldud inimesele.', 'Hea …!', 'Parimate soovidega\n(sinu nimi)', [150, 180]), 'Inimene saab kirjast aru, et sa mõistad teda, ja teab täpselt, milles te kokku leppisite.')), { task: 'W04', level: 3 }),
      tag(homeTask(purpose(B.speaking('049_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma kokkuleppe kaardi järgi: kes, mille üle, mis oli kummagi huvi ja milles kokku leppisite.', [
        'Mis oli seisukoht ja mis oli huvi?',
        'Milles te kokku leppisite ja mis tingimusel?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('049_t_homework', ['1. Kokkuleppe kiri, 150–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-050': {
    title: 'Kontroll 10 — suhted ja konfliktid',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 10, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 10, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 10, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid suhete ja konfliktide teemal, kirjutan naabrile umbes 140-sõnalise vabandus- ja ettepanekukirja ja 180-sõnalise arutluse ning räägin 1 minuti oma kokkuleppest; iseloomu sõnad, -ki/-gi, kaudne kõne ja pehme ettepanek on õiged.',
    // Kontroll 10 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2b; S1, S2). Own texts on the module's content: friends and character
    // (046), money and feelings (047), neighbours and reported speech (048), family and proposals (049); timed by the Harno
    // part headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('050_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('050_d_vocab', 'Tunnid 46–49: sõnad, mis aitavad', ['usaldusväärne — надёжный', 'üksildus — одиночество', 'võlg — долг', 'süütunne — чувство вины', 'öörahu — ночная тишина', 'neutraalne — нейтральный', 'erapooletu — беспристрастный', 'huvi — интерес', 'tingimus — условие', 'kokkulepe — договорённость'], '2'), { topic: ['öörahu', 'üksildus'] }),
      PART('050_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('050_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit tülidest ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Tüli ei ole katastroof', [
        '(A) Paljud meist on õppinud, et hea pere, sõprus või naabrus on see, kus ei tülitseta. Kui naaber teeb öösel lärmi, kannatame vaikides. Kui sõber ei maksa laenatud raha tagasi, lõpetame lihtsalt talle helistamise. Kui pühade plaan ei meeldi, noogutame ja oleme siis terve õhtu pahased. Minu arvates on selline vaikne kannatamine headele suhetele üks suurimaid ohte. Konflikt ise ei ole probleem. Probleem on see, kuidas me sellega toime tuleme.',
        '(B) Erimeelsused on paratamatud, sest inimestel on erinevad huvid. Öövahetuses töötav õde vajab päeval und, väikese lapsega pere peab vannitoa ära remontima, teismeline tahab olla sõpradega ja vanaema perega. Keegi neist ei ole halb ega ebausaldusväärne inimene, nad on lihtsalt eri põlvkondadest ja eri eluga. Kui me aga nimetame teist kohe tülinorijaks või isekaks, muutub huvide vaidlus iseloomu vaidluseks ja lahendust on palju raskem leida. Kes tunneb end rünnatuna, see enam ei kuula, vaid kaitseb ennast.',
        '(C) Seadus aitab ainult osaliselt. Korrakaitseseaduse järgi on korterites kella kümnest õhtul kuni kuueni hommikul keelatud kestev või korduv müra, mis teisi oluliselt häirib. Puhkepäevale eelneval ööl kehtib keeld keskööst kella seitsmeni. Seadus ei ütle aga, kui vali on liiga vali, ega aita kahel inimesel samas trepikojas edasi elada. Isegi kui naaber saab trahvi, jääb ta sinu naabriks. Seepärast on kokkulepe peaaegu alati parem kui võit. Kohtuvaidlus naabriga võib kesta kuid, aga kokkuleppe saab sõlmida ühe õhtuga trepikojas.',
        '(D) Eriti kergesti kasvavad tülid internetis. Psühholoog John Suler kirjeldas juba 2004. aastal nähtust, mida eesti keeles võiks nimetada võrgu pidurdamatuseks: ekraani taga ütleme asju, mida näost näkku kunagi ei ütleks. Me ei näe teise nägu ega kuule tema häält ja vastame kohe, vihaselt. Majagrupis võib ühest sõnumist mõne tunniga saada nelikümmend. Hea reegel on lihtne: kui sõnum on vihane, ära saada seda kohe, vaid helista või mine uksele.',
        '(E) Kui kaks poolt ise kokkuleppele ei jõua, võib appi kutsuda kolmanda, erapooletu inimese. Eestis pakub Sotsiaalkindlustusamet lahku minevatele vanematele tasuta perelepitust, et nad saaksid lapse huvides kokku leppida. Perelepitaja on läbinud vähemalt 160 tundi koolitust. Ta ei otsusta kellegi eest ega ütle, kellel on õigus; ta toetab mõlemat poolt rääkimisel ja kuulamisel. Sama põhimõte sobib ka naabritele: korteriühistu juhatuse liige või mõni rahulik naaber võib olla hea vahendaja.',
        '(F) Mida siis teha? Hea nõuanne on lihtne, aga seda on raske täita. Esiteks räägi varakult, kui mure on veel väike. Teiseks räägi oma tundest ja vajadusest, mitte teise iseloomust: lause „Ma ei saa magada, sest töötan öösiti” mõjub hoopis teisiti kui „Te olete hoolimatud”. Kolmandaks kuula ja korda oma sõnadega, mida teine ütles. Neljandaks otsige kompromissi ja leppige kokku konkreetselt: kes, mida ja millal; iga järeleandmine võiks tuua midagi vastutasuks. Viiendaks vaadake mõne nädala pärast üle, kas kokkulepe toimib, ja muutke seda, kui vaja. Kirja pandud kokkulepet on hiljem lihtsam meenutada kui sõnu, mida keegi täpselt ei mäleta.',
        '(G) Ma ei väida, et iga tüli saab lahendada. Mõnikord on mõistlik eemalduda ja mõni suhe ka lõpetada. Kuid enamik tülisid, mida me kardame, on tegelikult lahendatavad, kui keegi julgeb esimesena rahulikult rääkida. Selleks ei pea olema eriti julge ega osav. Piisab sellest, kui ütled, mida tunned, ja küsid, mida teine vajab. Tüli ei ole suhte lõpp. Sageli on see hoopis koht, kus suhe saab tugevamaks.',
        'Allikas: autori arvamus; faktid: korrakaitseseadus § 56; J. Suler, „The Online Disinhibition Effect” (2004); Sotsiaalkindlustusamet, „Perelepitus”.',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Tüli ei ole katastroof”?', 'tüli võib suhet tugevdada|tüli on lahendatav|konflikt ei ole probleem, probleem on see, kuidas sellega toime tulla'], ['Kas sina räägid tüli korral pigem kohe või ootad? Miks?']]),
      tag(B.choice('050_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida peab autor lõigu A järgi headele suhetele kõige ohtlikumaks?', 'vaikset kannatamist', 'valju tüli', 'trahve', 'liiga palju sõpru'],
        ['Mis juhtub lõigu B järgi, kui teist kohe sildistatakse?', 'huvide vaidlusest saab iseloomu vaidlus', 'lahendus leitakse kiiremini', 'teine hakkab rohkem kuulama', 'tüli lõpeb kohe'],
        ['Miks on kokkulepe lõigu C järgi parem kui võit?', 'naaber jääb ka pärast trahvi sinu naabriks', 'trahv on liiga väike', 'seadus keelab trahvid', 'politsei ei tule kunagi'],
        ['Mida soovitab autor teha vihase sõnumiga?', 'mitte seda kohe saata, vaid rääkida otse', 'saata see öösel', 'saata see kõigile', 'kustutada majagrupp'],
        ['Mida perelepitaja lõigu E järgi EI tee?', 'ei otsusta, kellel on õigus', 'ei kuula kumbagi poolt', 'ei räägi lapse huvidest', 'ei aita pooltel rääkida'],
        ['Millise väitega oleks artikli autor kõige tõenäolisemalt nõus?', 'enamik tülisid on lahendatavad, kui keegi alustab rahulikult', 'iga suhe tuleb igal juhul alles hoida', 'tülisid tuleb alati vältida', 'tüli lahendab alati seadus'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('050_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Paljud jätavad tüli asemel lihtsalt suhtlemise pooleli. | [A]',
        '2. Kõigil osapooltel võivad olla mõistlikud vajadused. | [B]',
        '3. Seadus ei määra, mis on liiga vali. | [C]',
        '4. Ekraani taga oleme julgemad ja teravamad. | [D]',
        '5. Lepitajal on pikk ettevalmistus. | [E]',
        '6. Kokkulepet tuleks hiljem kontrollida. | [F]',
        '7. Mõnikord on õige suhe lõpetada. | [G]',
        '8. Vihase sõnumi asemel on parem helistada või minna uksele. | [D]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('050_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Naaber kirjutab korteriühistu juhatusele. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri juhatusele', [
        'Lugupeetud juhatus!',
        'Kirjutan teile, sest meie trepikojas on viimasel ajal olnud pingeid. Kolmanda korruse naaber ütles mulle eile, et ta [töötab] (töötama) öösiti ja vajab päeval und. Ta küsis, kas me [saaksime|saame] (saama) remonti teha pärastlõunal.',
        'Kahjuks ei teadnud ma seda varem ja [keegi] (kes + -gi) ei olnud mulle sellest rääkinud. Naabri sõnul [olevat|on] (olema) majagrupis tema kohta kirjutatud väga teravaid asju. Selline käitumine on [ebaviisakas] (viisakas, vastand) ja ma mõistan, et tal on haiget.',
        'Mis oleks, kui me [leiaksime] (leidma) üheskoos aja, mis sobib kõigile? Olen nõus remonti lühendama tingimusel, et ka teised naabrid [arvestavad|arvestaksid] (arvestama) meie tähtajaga.',
        'Minu arvates on naabrite vahel kõige tähtsam [usaldus] (usaldama). Remont lõpeb niikuinii kahe nädala pärast. Ma ei ole selles majas kunagi kellegagi [tülitsenud] (tülitsema) ega taha seda ka nüüd. Ootan teie [vastust] (vastus).',
        'Lugupidamisega\nneljanda korruse elanik',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('050_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas ma naabriga leppisin', [
        'Kolm aastat tagasi kolisin uude korterisse ja esimesel nädalal koputas alumine naaber mu uksele. [[Ta ütles, et mu sammud kostavad tema magamistuppa.]]',
        'Ma olin solvunud, sest kõndisin oma kodus täiesti tavaliselt. [[Nädal aega ma teda trepikojas isegi ei tervitanud.]]',
        'Siis kirjutas ta majagruppi, et uus naaber ei arvesta kellegagi. [[Ma vastasin kohe ja väga teravalt.]]',
        'Järgmisel päeval kohtasime teineteist poes. [[Ta seisis üksi kassas ja otsis rahakotist münte.]]',
        'Ma aitasin tal kotid koju kanda ja trepil rääkis ta, et töötab öösiti haiglas. [[Alles siis sain aru, miks iga heli teda nii väga segab.]]',
        'Ostsin toolijalgadele vildist kleebised ja tema tõi mulle pirukaid. [[Nüüd on meil kokkulepe ja me käime vahel koos jalutamas.]]',
      ], ['Seepärast otsustasin kohe teise korterisse kolida.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('050_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled artikli autori nõuandega „räägi oma tundest, mitte teise iseloomust” nõus? Kirjuta 3–4 lauset: anna üks autori mõte kaudses kõnes edasi (autor kirjutab, et …), ütle oma arvamus ja too üks näide oma elust.', [3, 4], ['kirjutab, et', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('050_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('050_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 46–49. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('050_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Sõber palus, et vaataksid tema sõnumid enne saatmist üle. Igas sõnumis on üks viga: kirjuta see õigesti.', [
        ['Mu naaber on väga aus ja ma hindan tema ausus.', 'Mu naaber on väga aus ja ma hindan tema ausust.'],
        ['Ma ootasin terve kuu, aga raha ei tulnudgi.', 'Ma ootasin terve kuu, aga raha ei tulnudki.'],
        ['Naaber küsis, et kas me saaksime vaiksemalt olla.', 'Naaber küsis, kas me saaksime vaiksemalt olla.'],
        ['Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et ma töötan öösiti.', 'Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et ta töötab öösiti.|Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et tema töötab öösiti.'],
        ['Mis oleks, kui me läheme pühadeks vanaema juurde?', 'Mis oleks, kui me läheksime pühadeks vanaema juurde?|Mis oleks, kui läheksime pühadeks vanaema juurde?'],
        ['Ma saan aru, et sa oleksid väga väsinud.', 'Ma saan aru, et sa oled väga väsinud.|Saan aru, et sa oled väga väsinud.'],
      ]),
      B.transformation('050_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti, kasutades antud sõna või väljendit.', [
        ['Ta ei ole kannatlik.', 'kannatamatu', 'Ta on kannatamatu.'],
        ['Ma olin pettunud. Põhjus: sa ei helistanud.', 'kuna', 'Ma olin pettunud, kuna sa ei helistanud.|Kuna sa ei helistanud, olin ma pettunud.|Kuna sa ei helistanud, olin pettunud.'],
        ['Ühelegi inimesele ei meeldinud see plaan.', 'mitte kellelegi', 'See plaan ei meeldinud mitte kellelegi.|Mitte kellelegi ei meeldinud see plaan.'],
        ['Naaber: „Palun ärge puurige hommikul!”', 'palus mitte', 'Naaber palus hommikul mitte puurida.|Naaber palus mitte hommikul puurida.|Naaber palus meil hommikul mitte puurida.'],
        ['Lähme seekord mere äärde!', 'mis oleks, kui', 'Mis oleks, kui me läheksime seekord mere äärde?|Mis oleks, kui läheksime seekord mere äärde?'],
        ['Ma annan järele, aga sina pead nõud ära pesema.', 'tingimusel, et', 'Ma annan järele tingimusel, et sina pesed nõud ära.|Ma annan järele tingimusel, et sa pesed nõud ära.|Ma annan järele tingimusel, et sina peseksid nõud ära.|Ma annan järele tingimusel, et sa peseksid nõud ära.'],
      ]),
      PART('050_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('050_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet maja, raamatukogu, lasteaia ja kogukonnamaja elust, igaüht üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Korteriühistu teatab: vannitubade torude vahetus algab esmaspäeval. Müra tekitavaid töid tehakse ainult tööpäeviti kella üheksast viieni. Küsimuste korral helistage juhatuse esimehele.',
        '2. Linnaraamatukogu kutsub keelekohvikusse. Kohtume igal neljapäeval kell kuus teise korruse lugemissaalis. Kaasa ei ole vaja midagi, ainult head tuju. Osalemine on tasuta.',
        '3. Lasteaia lapsevanematele: jõulupeo aeg muutus. Pidu toimub reedel kell neli, mitte kell viis. Palume vanematel tuua kaasa oma tass, sest laual on soe mahl.',
        '4. Kogukonnamaja otsib vabatahtlikke, kes käiksid kord nädalas üksi elavate eakate juures külas. Esimene kohtumine on laupäeval kell üksteist. Registreeruda saab e-kirja teel.',
      ], [
        'Müra tekitavaid töid tehakse tööpäeviti kuni kella [viieni|viie|17ni].',
        'Küsimuste korral tuleb helistada juhatuse [esimehele|esimees].',
        'Keelekohvik toimub igal [neljapäeval|neljapäeviti].',
        'Lasteaia jõulupidu algab nüüd kell [neli|16].',
        'Jõulupeole tuleb kaasa võtta oma [tass].',
        'Vabatahtlikud käivad külas üksi elavate [eakate|vanurite] juures.',
      ]),
      tag(B.listening('050_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime naabritest. Stuudios on Peeter Lõhmus, kes on kaheksa aastat juhtinud ühe Tartu kortermaja korteriühistut. Peeter, mitu korterit teie majas on?',
        'Peeter: Kuuskümmend neli. See tähendab umbes sada kakskümmend inimest ja vähemalt kakskümmend koera.',
        'Saatejuht: Mille üle kõige rohkem kurdetakse?',
        'Peeter: Kõige sagedamini müra pärast, teisel kohal on parkimine. Talvel kurdetakse ka lume pärast, mis jääb maja ette.',
        'Saatejuht: Kuidas te tülisid lahendate?',
        'Peeter: Esimene reegel on, et ma ei vali poolt. Kõigepealt räägin kummagi naabriga eraldi ja kuulan. Alles siis kutsun nad kokku, tavaliselt meie maja keldris olevasse ruumi, mitte kellegi koju.',
        'Saatejuht: Miks just keldrisse?',
        'Peeter: Seal on neutraalne koht. Kui tüli arutatakse kellegi köögis, tunneb teine end külalisena ja ei julge kõike öelda.',
        'Saatejuht: Kas majagrupp aitab?',
        'Peeter: Majagrupis jagame ainult teateid. Tülid seal ei lahene, vaid kasvavad. Seepärast lepiti üldkoosolekul kokku, et kaebusi grupis ei arutata.',
        'Saatejuht: Mis on olnud teie kõige parem lahendus?',
        'Peeter: Üks pere tegi remonti ja alumine naaber töötas öösiti. Leppisime kokku, et puuritakse ainult pärastlõunal ja et remondi lõpus kutsub pere kõik naabrid õue kringlile.',
        'Saatejuht: Aitäh, Peeter!',
      ], [
        'Peetri juhitud majas on kokku [kuuskümmend neli|64] korterit.',
        'Kõige sagedamini kurdavad naabrid [müra] pärast.',
        'Teisel kohal kaebuste seas on [parkimine].',
        'Peetri esimene reegel on, et ta ei vali [poolt].',
        'Kõigepealt räägib Peeter kummagi naabriga [eraldi].',
        'Ühine kohtumine toimub tavaliselt maja [keldris].',
        'Peetri sõnul on keldriruum [neutraalne] koht.',
        'Majagrupis jagatakse Peetri majas ainult [teateid].',
        'Remondi lõpus kutsus pere kõik naabrid õue [kringlile].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('050_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Peetri majas elab umbes sada kakskümmend inimest.', true],
        ['Talvel kurdetakse Peetri majas kõige rohkem lume pärast.', false],
        ['Peeter otsustab tavaliselt kiiresti, kumb naaber on süüdi.', false],
        ['Enne ühist kohtumist kuulab Peeter mõlemat naabrit eraldi.', true],
        ['Peetri arvates on hea arutada tüli ühe naabri köögis.', false],
        ['Peetri sõnul aitab majagrupp tülisid kiiresti lahendada.', false],
        ['Kaebuste kohta grupis lepiti kokku üldkoosolekul.', true],
        ['Remondi ajal tohtis pere puurida ainult hommikul.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('050_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('050_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad naabrile vabandus- ja ettepanekukirja ning arutluse. Sõnavõtus esitled mooduli tulemust: oma kokkulepet, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own agreement, built in 046–049
      B.planning('050_t_product', 'Mooduli tulemus: minu kokkulepe.', 'Võta oma kokkuleppe kaart tunnist 49 ja lisa igale reale üks lause tundidest 46–48.', ['Kes on see inimene ja milline ta on? (tund 46: omadus + tegu)', 'Mida ma tundsin ja miks? (tund 47: kuna, seetõttu)', 'Mida tema ütles ja palus? (tund 48: ütles, et …; palus …)', 'Milles me kokku leppisime ja mis tingimusel? (tund 49: tingimusel, et …)']),
      PART('050_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('050_t_letter', 'Kirjutamine 1: kiri naabrile (umbes 140 sõna).', 'Sa kirjutasid eile majagruppi oma naabri kohta terava sõnumi, sest tema koer haukus öösel. Nüüd sa kahetsed. Kirjuta naabrile: vabanda, ütle, mida sa tundsid ja miks, anna edasi, mida teised naabrid sulle ütlesid, ja paku konkreetne lahendus.', 'Hea naaber!', 'Parimate soovidega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('050_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas naabritülisid tuleks lahendada pigem rangete reeglite ja trahvidega või vestluse ja lepitusega? Too mõlema poole argumendid, igaühele näide, ja sinu põhjendatud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3), { task: 'W14', harno: 'W2b' }),
      PART('050_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('050_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi 1 minut ühest kokkuleppest, milleni sa jõudsid (või mille välja mõtlesid). Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Kellega ja mille üle oli erimeelsus?', 'Mida kumbki tundis ja mis oli tema tegelik huvi?', 'Milles te kokku leppisite ja kas see toimib?', 'Paariline küsib: „Mida sa järgmine kord teisiti teeksid?”', 'Kas tülid on sinu arvates suhetele pigem kasulikud või kahjulikud? Miks?', 'Kas naabrite või pere tülidesse peaks sekkuma keegi kolmas? Põhjenda.'], [90, 180], ['Tahaksin rääkida ühest kokkuleppest …', 'Mõlemale oli tähtis …', 'Lõpuks leppisime kokku, et …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('050_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas igas kortermajas peaks olema kirjalik kodukord? Argumendid: siis teavad kõik reegleid ette; vaidluses saab viidata kokkuleppele, mitte tunnetele; korrakaitseseadus ei määra päevase remondi aegu. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas igas kortermajas peaks olema kirjalik kodukord? Argumendid: reeglid ei asenda omavahelist vestlust; pikka kodukorda ei loe keegi; liiga palju reegleid teeb naabrid üksteise suhtes valvsaks. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks meie majas …', 'Ma saan aru, et …, aga …'], ['Ma ei ole päris nõus, sest …', 'Vastutasuks võiksime …', 'Mis oleks, kui …?', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('050_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: vabandus, tunne ja põhjus, teiste sõnad kaudses kõnes, konkreetne lahendus, sobiv toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, selge järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: erimeelsus, huvid ja kokkulepe 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('050_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 10 läbitud'),
    ],
  },
}, {
  'b1b2-046': 'LUGE R→W', 'b1b2-047': 'RÄÄK R→S', 'b1b2-048': 'KIRJ L→W', 'b1b2-049': 'PROJ L→S', 'b1b2-050': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 046
  '046_d_facts': [
    '1. lõik: „meil saadetakse kaarte ja kommi ka sõpradele, klassikaaslastele ja kolleegidele”.',
    '2. lõik: „jutuajamine ja ühine tegevus loovad sidet rohkem kui lihtsalt samas ruumis istumine”.',
    '2. lõik: aeg ja ühine tegevus loovad sõprust — kursusel ja koorist on mõlemad olemas.',
    '3. lõik: „Paljusid üllatas, et noored ei olnud vähem üksildased kui vanemad inimesed.”',
    '4. lõik: rahulolu suhetega 50-aastaselt „ennustas tema tervist … paremini kui kolesterool”.',
    '2. lõik: „üle 200 tunni, et temast saaks lähedane sõber” — kõige rohkem aega.',
    '4. lõik: üksildus tekib, „kui inimesel ei ole kellegagi rääkida … ega kedagi, kes teda toetaks”.',
    '4. lõik: „ei loe sõprade arv, vaid suhete kvaliteet: kas sul on keegi, keda sa usaldad”.',
  ],
  '046_p_forms': [
    'Lause vajab asja (tema …): usaldusväärne → usaldusväärsus.',
    'selline + nimisõna: -lik → -likkus (kaks k-d): tähelepanelikkus.',
    'Mõte on vastupidine (hakkab närveerima): kannatama → kannatamatu.',
    'Käitumine oli vale: aus → ebaaus (vastand eesliitega eba-).',
    'ei ole + vastupidine omadus: hoolima → hoolimatu.',
    'hindama + osastav: ausus → ausust.',
  ],
  '046_t_exit': [
    'Käitumine ei arvesta teistega: hoolima → hoolimatu.',
    'hindama + osastav: aus → ausus → ausust.',
    'Alguses tundus vastupidine: viisakas → ebaviisakas.',
  ],
  // 047
  '047_d_feel': [
    'Olesja: „Edu uue korteriga!” — Igor kolis.',
    'Märtsis „Suur aitäh! … sa oled tõeline sõber”, juunis „Kas sa jälgid mind või?”.',
    'Olesja: „Mul on endal sel kuul hambaarst.”',
    'Olesja: „Mulle sa isegi ei helista enam” — pettumus ja solvumine.',
    'Terav vastus kaitseb: kes tunneb piinlikkust ja süüd, ründab sageli ise.',
    'Lause pildist ja kontserdist kõlab nagu jälgimine — Igor vastab: „Kas sa jälgid mind või?”',
  ],
  '047_p_ki': [
    'ei …-ki: oodati, aga ei juhtunud — ei tulnudki (pärast d-d -ki).',
    'isegi rõhutab: isegi sünnipäeval mitte.',
    'Eituses mitte keegi → mitte kellelegi (alaleütlev) + ei ole.',
    'kuna + põhjus; kui kuna-lause on ees, tuleb pealauses tegusõna kohe.',
    'mistõttu + tagajärg samas lauses.',
    'seetõttu + tagajärg; pärast seetõttu on tegusõna kohe: ei kirjutanud ma.',
    'ka tema = temagi / isegi tema / samuti: -gi liitub sõnaga, mida rõhutab (õdegi).',
  ],
  '047_t_voice': [
    'Igor: „Aprilli alguses jäin ma töötuks.”',
    'Igor: „Mul oli nii piinlik, et ma ei vastanudki sulle.”',
    'Igor: „tundsin süütunnet”.',
    'Igor: „Kontserdi pileti kinkis mulle õde sünnipäevaks.”',
    'Igor: „Nüüd on mul uus töö laos.”',
    'Igor: „maksan alates juulist iga kuu viiskümmend eurot”.',
  ],
  '047_t_exit': [
    'ei …-ki: oodati, aga ei juhtunud; helistanud + -ki.',
    'kus + -gi → kuskil / kusagil; eituses: ei olnud kuskil.',
    'Tagajärg samas lauses: mistõttu (siis tegusõna kohe: pidin).',
  ],
  // 048
  '048_d_voice': [
    'Ljudmila: „Ma töötan haiglas öövahetustes.”',
    'Ljudmila: „magan päeval, tavaliselt kella kaheksast kolmeni”.',
    'Ljudmila: „on ülemisest korterist kostnud päeval puurimist”.',
    'Ljudmila: „keegi ei tulnudki uksele”.',
    'Ljudmila: „Üks naaber kirjutas, et ma olen lihtsalt tülinorija” — kaudne kõneviis (olevat), sest see on teise väide.',
    'Ljudmila: „et remont oleks tööpäeviti kella kaheteistkümnest kuueni”.',
    'Ljudmila: „et reede õhtul pandaks muusika kella kümneks vaiksemaks”.',
  ],
  '048_p_report': [
    'Väide: kirjutas, et …; me → nad, aeg jääb samaks (teevad).',
    'Jah-ei-küsimus: küsis, kas …; te → nad (saaksid).',
    'Käsk → palus, et + tingiv eitus: ei kirjutaks; siia → sinna.',
    'Sina väidet ei usu → kaudne kõneviis: olevat.',
    'Küsisõnaga küsimus: küsis, millal … (ilma sõnata et); teie → nende.',
    'homme → järgmisel päeval; ma → ta.',
    'palus + da-tegevusnimi (helistada, mitte kirjutada) või palus, et + umbisikuline tingiv.',
  ],
  '048_t_ask': [
    'Tekst: kella 22.00-st kuni 6.00-ni on häiriv müra keelatud.',
    'Tekst: puhkepäevale eelneval ööl „kella 0.00-st kuni 7.00-ni”.',
    'Pühapäev on puhkepäev, laupäeva öö on enne seda: kuni 7.00.',
    'Tekst: „Päevase remondi kellaaegu see seadus ei määra.”',
    'Tekst: „seejärel pöörduda korteriühistu juhatuse poole”.',
    'Tekst: „Maja ühised reeglid võtab vastu korteriomanike üldkoosolek.”',
  ],
  '048_t_exit': [
    'Jah-ei-küsimus kaudses kõnes: küsis, kas …',
    'Isik muutub: mul → tal (mina → tema).',
    'palus kellel + da-tegevusnimi; eitus: mitte kirjutada.',
  ],
  // 049
  '049_d_radio': [
    'Tiina: „oleks kumbki saanud kõik, mida ta tegelikult tahtis”.',
    'Tiina: „Huvi on see, miks ta seda nõuab.”',
    'Tiina: „Kõigepealt kuula ja ütle oma sõnadega, mida teine tahab.”',
    'Tiina: „otsige koos vähemalt kolm varianti”.',
    'Tiina: kokku tuleb leppida „kes, mida ja millal”.',
    'Tiina: „lahku minevatele vanematele tasuta perelepitust”.',
  ],
  '049_p_mood': [
    'Mis oleks, kui + tingiv: veedaksime.',
    'Pehme küsimus tingivas: kas me saaksime.',
    'Ma saan aru, et + fakt kindlas kõneviisis: kardad.',
    'tingimusel, et + tavaliselt kindel kõneviis: juhid (tingiv juhiksid on samuti võimalik).',
    'Mõeldud olukord kui-lauses: tuleks (pealauses ei peaks).',
    'Pehme pakkumine tingivas: võiksin.',
    'Minevik, mõeldud olukord: oleks + -nud; eitus: poleks / ei oleks läinud.',
  ],
  '049_t_exit': [
    'Mis oleks, kui + tingiv: sõidaksime.',
    'tingimusel, et + tavaliselt kindel kõneviis: pesed (ka peseksid on võimalik).',
    'Ma saan aru, et + fakt: oled.',
  ],
  // 050
  '050_d_read': [
    '(A) ja (G): konflikt ei ole probleem — tüli võib suhte hoopis tugevamaks teha.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '050_d_mc': [
    '(A): „selline vaikne kannatamine headele suhetele üks suurimaid ohte”.',
    '(B): „muutub huvide vaidlus iseloomu vaidluseks”.',
    '(C): „Isegi kui naaber saab trahvi, jääb ta sinu naabriks.”',
    '(D): „ära saada seda kohe, vaid helista või mine uksele”.',
    '(E): lepitaja „ei otsusta kellegi eest ega ütle, kellel on õigus”.',
    '(G): „enamik tülisid … on tegelikult lahendatavad, kui keegi julgeb esimesena rahulikult rääkida”.',
  ],
  '050_d_para': [
    '(A): „lõpetame lihtsalt talle helistamise”.',
    '(B): „Keegi neist ei ole halb ega ebausaldusväärne inimene.”',
    '(C): „Seadus ei ütle aga, kui vali on liiga vali.”',
    '(D): „ekraani taga ütleme asju, mida näost näkku kunagi ei ütleks”.',
    '(E): „vähemalt 160 tundi koolitust”.',
    '(F): „vaadake mõne nädala pärast üle, kas kokkulepe toimib”.',
    '(G): „Mõnikord on mõistlik eemalduda ja mõni suhe ka lõpetada.”',
    '(D): „helista või mine uksele”.',
  ],
  '050_d_cloze': [
    'Kaudne kõne: aeg ei muutu — ta töötab (ta ütles: „Ma töötan.”).',
    'Kaudne küsimus: kas me saaksime (viisakas) või kas me saame.',
    'kes + -gi → keegi; eituses: keegi ei olnud rääkinud.',
    'Naabri sõnul + kaudne kõneviis olevat (kirjutaja ei vastuta) või tavaline on.',
    'Vastand eesliitega eba-: ebaviisakas (omadussõna, sest „käitumine on …”).',
    'Mis oleks, kui + tingiv: leiaksime.',
    'tingimusel, et + tavaliselt kindel kõneviis: arvestavad (ka arvestaksid).',
    'Kõige tähtsam on asi → nimisõna: usaldama → usaldus.',
    'ei ole + -nud: ei ole tülitsenud.',
    'ootama + osastav: vastust.',
  ],
  '050_d_bank': [
    'Naaber koputas → mida ta ütles: sammud kostavad.',
    'Solvunud → mida ta tegi: ei tervitanudki.',
    'Majagrupi sõnum → tema reaktsioon: vastas teravalt.',
    'Kohtusid poes → mida ta nägi: naaber üksi kassas.',
    'Naaber töötab öösiti → alles siis sai aru. Üle jääb „otsustasin kolida”, mis ei sobi loo lõpuga.',
    'Vildist kleebised ja pirukad → nüüd on kokkulepe.',
  ],
  '050_p_fix': [
    'hindama + osastav: ausust.',
    'Pärast d-d on -ki: ei tulnudki.',
    'Kaudne küsimus: küsis, kas … (ilma sõnata et).',
    'Kaudses kõnes muutub isik: ma → ta (töötab).',
    'Mis oleks, kui + tingiv: läheksime.',
    'Ma saan aru, et + fakt kindlas kõneviisis: oled.',
  ],
  '050_p_trans': [
    'ei ole kannatlik = on kannatamatu (vastand -matu).',
    'Põhjus: kuna sa ei helistanud.',
    'Eituses: mitte kellelegi … ei meeldinud.',
    'Palve kaudses kõnes: palus mitte + da-tegevusnimi (puurida).',
    'Ettepanek: mis oleks, kui + tingiv (läheksime).',
    'Järeleandmine tingimusega: tingimusel, et + tavaliselt kindel kõneviis (pesed).',
  ],
  '050_p_notes': [
    'Teade 1: „kella üheksast viieni”.',
    'Teade 1: „helistage juhatuse esimehele”.',
    'Teade 2: „igal neljapäeval kell kuus”.',
    'Teade 3: „Pidu toimub reedel kell neli, mitte kell viis.”',
    'Teade 3: „tuua kaasa oma tass”.',
    'Teade 4: „üksi elavate eakate juures külas”.',
  ],
  '050_p_listen': [
    'Peeter: „Kuuskümmend neli.”',
    'Peeter: „Kõige sagedamini müra pärast.”',
    'Peeter: „teisel kohal on parkimine”.',
    'Peeter: „ma ei vali poolt”.',
    'Peeter: „räägin kummagi naabriga eraldi”.',
    'Peeter: „meie maja keldris olevasse ruumi”.',
    'Peeter: „Seal on neutraalne koht.”',
    'Peeter: „Majagrupis jagame ainult teateid.”',
    'Peeter: „kutsub pere kõik naabrid õue kringlile”.',
  ],
  '050_p_tf': [
    'Õige: „umbes sada kakskümmend inimest”.',
    'Vale: kõige sagedamini kurdetakse müra pärast; lumi on talvine lisamure.',
    'Vale: „ma ei vali poolt”.',
    'Õige: „Kõigepealt räägin kummagi naabriga eraldi ja kuulan.”',
    'Vale: „mitte kellegi koju” — köögis tunneb teine end külalisena.',
    'Vale: „Tülid seal ei lahene, vaid kasvavad.”',
    'Õige: „lepiti üldkoosolekul kokku, et kaebusi grupis ei arutata”.',
    'Vale: „puuritakse ainult pärastlõunal”.',
  ],
};
