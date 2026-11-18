// B2 course (B1 → B2 roadmap), module 7 „Haridus ja õppimine” (b1b2-031…035), stage B2-.
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–4. Module goal (the learner): „Ma oskan oma ja oma pere õppimise üle ise otsustada: tean, kuidas
// Eesti koolitee käib, valin õppimisviisi, ameti ja raha”; module product „Minu õpitee järgmine samm” (034 Kasuta, the
// S16 one-minute talk in 035). Education from the learner's own angle: his child's or a young relative's school choice,
// his own way of learning, a new profession as an adult, who pays for his next course. Not repeated from earlier modules:
// study time and choosing a language course (module 1), a school or kindergarten note (module 4).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 7).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   031 case    „Gümnaasium või kutsekool — kes otsustab?”        family (a teen's school)  final advise: a friend's son (S11)
//   032 facts   „Kas sa oled visuaalne õppija? Müüdid ja tõde õppimisest”  learning          final explain: a relative's exam (S13)
//   033 debate  „Uus amet 45-aastaselt — julge samm või hilja?”    work (the only one)       final decide: debate + vote (S17)
//   034 quest   „Kes maksab sinu õppimise eest?”                   money                     final plan: my next step (W11)
//   035 exam    Kontroll 7 in Harno B2 form + „Minu õpitee järgmine samm” as the S16 one-minute talk.
// Grammar line (B2, docs/METHODOLOGY_STANDARD.md §5) by discovery and spiralled: government of verbs and adjectives in
// education — kandideerima kuhu, huvituma millest, sõltuma millest, keskenduma millele, valmistuma milleks, mures mille
// pärast (031, after module 4's 018; back in the 033 debate and 035); the quotative and source phrases — väidetakse,
// olevat, aitavat, uuringu järgi, teadlase sõnul (032; back in 033 and 035; taught fully in module 13); the conditional
// in kui-clauses for hypotheses and regret — kui ma õpiksin, oleksin alustanud (033, the roadmap's „условные
// конструкции”; back in the 034 letter); -mine / -ja nouns of official texts — õppepuhkuse kasutamine, õppija, taotleja
// (034, preview of module 12; back in 035). The one long text of the module is the topic opener (031 station 2, ≈ 380
// words, after a 12-minute hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js and the archetypes (PROB, AVAS, KUUL, LUGU, EKS). The v2 storyline
// version (Kase kool, Mia, Oskar, the board meeting) is in git history before 2026-11-18.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 7. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

export const MODULE = { id: 'b1b2-module-07', course: 'b2', title: 'Haridus ja õppimine', level: 'B1+', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-031': {
    title: 'Gümnaasium või kutsekool — kes otsustab?',
    phases: grammar('Keel: rektsioon — kandideerima kuhu, huvituma millest, sõltuma millest, valmistuma milleks, mures mille pärast'),
    format: 'case',
    topic: 'family',
    canDo: 'Ma loen ja räägin, kuidas Eesti koolitee käib, ja annan noorele või tema vanemale nõu, kas minna pärast põhikooli gümnaasiumi või kutsekooli; tegus- ja omadussõna järel kasutan õiget käänet (kandideerima kuhu, huvituma millest, mures mille pärast).',
    teacherPage: {
      goal: 'Ученик узнаёт путь в эстонской школе (гимназия, профшкола, учёба до 18 лет) и по телефону советует подруге, куда идти её сыну после 9 класса; управление глаголов.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки письма Никиты; станция 4 — голосовое и короткий совет без договорённости о следующем шаге. Текст (станция 2) — дома, вопросы к нему в начале следующего урока.',
      hook: '«Вспомни себя в 15 лет. Что ты выбрал после основной школы: учёбу дальше, работу, что-то другое? Кто принял решение — ты, родители или кто-то третий?» Ответьте сами одной фразой («Ma läksin …, sest …»), потом ученик. Первые 5 минут не исправлять.',
      plan: [
        '0–4: крючок — свой выбор в 15 лет, ученик отвечает сразу',
        '4–15: станция 1 — разговор о своей школе и о том, кто решал',
        '15–30: станция 2 — слова (2 мин), прогноз «Сколько выпускников 9 класса идут в гимназию?», текст, 6 вопросов людей',
        '30–42: станция 3 — заметить в тексте → правило → письмо Никиты в профшколу: 7 ошибок',
        '42–57: станция 4 — голосовое подруги Ольги, две карточки, совет по телефону',
        '57–69: «Kui aega jääb» — ролевая игра: день открытых дверей',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: сообщение Ольге, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: eesti.ee / Haridus- ja Teadusministeerium «Õppimiskohustus» (15.10.2025): учиться до 18 лет или до среднего / профессионального образования, приём в гимназии и профшколы до 31 августа; Statistikaamet 19.09.2025: из окончивших основную школу в 2020 г. 71 % пошли в гимназию, 25 % — в профессиональное среднее образование; в гимназию — 82 % девушек и 61 % юношей; HTM «Eestikeelsele haridusele üleminek»: с 2024 г. детсады, 1 и 4 классы, до 2030 г.; Töötukassa, minukarjaar.ee: карьерное консультирование бесплатно для всех. Голосовое Ольги, письмо Никиты и школа на дне открытых дверей — учебные сценарии.',
      groups: 'Станция 1 — в парах. Текст и вопросы — каждый сам, сверка в паре. Станция 4: один — Ольга с вашей карточкой, другой советует; потом смена. В 1:1 Ольга — вы.',
      errors: [
        '«Ta kandideerib ülikoolis» → «Ta kandideerib ülikooli» (kandideerima kuhu — сисеютлев, как astuma kuhu).',
        '«Ta huvitub autod» → «Ta huvitub autodest» (huvituma, sõltuma, unistama, loobuma — millest).',
        '«Ema on mures hinnete eest» → «… hinnete pärast» (беспокоиться о — mures mille pärast).',
        '«Valmistun eksamile» → «Valmistun eksamiks» (valmistuma milleks), но «keskendun eksamile» (keskenduma millele).',
      ],
      notes: [
        'Формат — реальный случай: сын подруги выбирает между гимназией и профшколой, мама и сын хотят разного. Ученику без детей: это его племянник, сосед или «ты сам, если бы тебе было 15 сегодня». Пенсионеру — внук. Студенту — свой недавний выбор.',
        'Переход на эстонский язык обучения — тема чувствительная. Только факты из текста (когда и с каких классов начался). Ученик может рассказать, как это у его семьи или знакомых; не оценивайте, не спорьте о политике, не просите мнения «за или против».',
        'Обратная связь, 2–3 цели: падеж после глагола и прилагательного (вопрос-подсказка «Kuhu? Millest? Milleks? Mille pärast?»); совет с причиной («Minu arvates sõltub see …, sest …»); вежливый тон с подругой. В совете по телефону не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(B.text('031_d_hook', 'Sinu valik 15-aastaselt', 'Mõtle ajale, kui olid viisteist. Mis oli sinu valik pärast põhikooli: edasi õppima, tööle või midagi muud? Kes selle otsuse tegi — sina, vanemad või keegi kolmas? Ütle kohe üks lause.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('031_d_talk', 'Minu koolitee.', 'Vasta igale küsimusele ja too näide oma elust.', [
        'Kus ja kui kaua sa koolis käisid? Mis sulle seal meeldis?',
        'Kas sinu otsus pärast põhikooli oli õige? Mida teeksid täna teisiti?',
        'Mis on Eesti koolis teisiti kui koolis, kus õppisid sina või sinu lapsed?',
      ], [150, 210], ['Ma õppisin …', 'Otsus sõltus …', 'Ma huvitusin …']), 'Sinu enda koolitee annab tunni juhtumile esimese näite.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma koolist. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas ja ei teadnud. Kui õpilasel on lapsed: „Mis koolis su laps käib ja mida ta pärast 9. klassi teha tahab?”')),
      station(tag(B.vocab('031_d_vocab', 'Enne lugemist: sõnad.', ['põhikool — основная школа (1–9 кл.)', 'gümnaasium — гимназия (10–12 кл.)', 'kutsekool — профессиональное училище', 'keskharidus — среднее образование', 'õppimiskohustus — обязанность учиться', 'kandideerima — поступать (подавать документы)', 'eriala — специальность', 'kõrgkool — высшее учебное заведение', 'huvituma — интересоваться', 'sõltuma — зависеть']), { topic: ['õppimiskohustus', 'keskharidus', 'kutsekool'] }), 2, 15),
      B.topicOpener('031_d_open', 'Moodul 7. Eesti koolitee: mis saab pärast 9. klassi?', [
        'Eesti laps läheb kooli tavaliselt seitsmeaastaselt. Põhikool kestab üheksa aastat ja on kõigile kohustuslik. Varem võis noor pärast põhikooli õppimise lõpetada, kuid 2025. aasta sügisest kehtib õppimiskohustus. See tähendab, et põhikooli lõpetanud noor peab õppimist jätkama, kuni ta saab 18-aastaseks või omandab kesk- või kutsehariduse. Kui noor ei jätka, peab tema elukoha omavalitsus aitama tal sobiva koha leida.',
        'Pärast põhikooli on kaks peamist teed. Gümnaasium kestab kolm aastat ja annab üldkeskhariduse; sealt minnakse tavaliselt edasi ülikooli või kõrgkooli. Kutsekoolis õpitakse ametit, näiteks kokaks, keevitajaks, logistikuks või IT-spetsialistiks, ja samal ajal saab omandada ka keskhariduse. Ka kutsekeskharidusega võib kõrgkooli kandideerida, kuigi seni on seda tehtud harvem. Statistikaameti andmetel jätkas 2020. aastal põhikooli lõpetanutest 71 protsenti õpinguid gümnaasiumis ja 25 protsenti kutsekeskhariduses. Tüdrukud valisid gümnaasiumi palju sagedamini kui poisid. Õppimist ei pea lõpetama ka täiskasvanuna: täiskasvanute gümnaasiumis saab keskhariduse omandada õhtuti või kaugõppes ning paljudes kutsekoolides õpivad koos noortega ka täiskasvanud.',
        'Valik ei ole lihtne, sest see sõltub paljudest asjadest: hinnetest, huvidest, pere arvamusest ja sellest, kui kaugel kool on. Viieteistkümneaastane ei tea sageli veel, millest ta päriselt huvitub. Seepärast korraldavad koolid avatud uste päevi ja Töötukassa karjäärinõustajad aitavad tasuta oma huve ja võimalusi kaardistada nii noortel kui ka täiskasvanutel. Gümnaasiumid ja kutsekoolid võtavad uusi õpilasi vastu kevadel ja suvel, vabu kohti võib olla kuni augusti lõpuni.',
        'Viimastel aastatel on Eesti koolis ka teisi muutusi. 2024. aasta sügisel algas üleminek eestikeelsele õppele: kõigepealt lasteaedades ning esimeses ja neljandas klassis, seejärel aasta-aastalt järgmistes klassides. Paljudes peredes on see toonud uusi küsimusi ja uusi harjumusi. Lapse hindeid, kodutöid ja kooli teateid näeb lapsevanem e-päevikus, näiteks eKoolis või Stuudiumis. Vähemalt kord aastas toimub koolis arenguvestlus, kus laps, vanem ja õpetaja lepivad kokku järgmise aasta eesmärgid.',
        'Selles moodulis räägid õppimisest enda vaatest: annad nõu noorele, kes valib kooli, uurid, kuidas inimene tegelikult õpib, arutled, kas täiskasvanuna tasub uut ametit õppida, ja leiad, kes võiks sinu järgmise kursuse eest maksta.',
      ], 'Haridus- ja Teadusministeerium, eesti.ee „Õppimiskohustus” (15.10.2025); Statistikaamet, „Viie aastaga jõuab Eesti kõrgkoolidesse 40% põhikooli lõpetajatest” (19.09.2025); Haridus- ja Teadusministeerium, „Eestikeelsele haridusele üleminek”; Töötukassa, minukarjaar.ee', [
        'Kuidas oli koolitee üles ehitatud sinu kodumaal või sinu lapsepõlves? Mis on Eestis teisiti?',
        'Mis sa arvad, miks valivad poisid kutsekooli sagedamini kui tüdrukud?',
        'Kas õppimiskohustus 18-aastaseks saamiseni on sinu arvates hea mõte? Miks?',
        'Kas üleminek eestikeelsele õppele puudutab sinu peret või tuttavaid? Kuidas neil on läinud?',
      ]),
      tag(purpose(B.table('031_d_read', 'Mida ütleb tekst?', 'Vasta igale küsimusele 1–3 sõnaga, nagu tekst ütleb.', 'Küsimus, Vastus', [
        'Naaber: „Mitu aastat kestab Eestis põhikool?” | [üheksa aastat/9 aastat/üheksa/9]',
        'Sõbranna: „Mu poeg on 16 ja lõpetab 9. klassi. Kas ta võib siis õppimise lõpetada?” | [ei/ei või/ei, õppimiskohustus/ei, kuni 18-aastaseks saamiseni]',
        'Kolleeg: „Mitu protsenti põhikooli lõpetanutest läks 2020. aastal gümnaasiumi?” | [71 protsenti/71/71 %/71%]',
        'Vanaema: „Kas kutsekoolist saab ka keskhariduse?” | [jah/jah, saab]',
        'Sinu laps: „Kes aitab mul tasuta oma huve kaardistada?” | [karjäärinõustajad/Töötukassa karjäärinõustajad/Töötukassa/karjäärinõustaja]',
        'Õde: „Kus näeb lapsevanem lapse hindeid ja kooli teateid?” | [e-päevikus/eKoolis või Stuudiumis/eKoolis/Stuudiumis]',
      ], 'g_read'), 'Inimesed sinu ümber küsivad Eesti kooli kohta; nüüd vastad faktiga.'), { task: 'R15', harno: 'R2b' }),
    ],
    practice: [
      station(B.notice('031_p_notice', 'Märka: kuhu, millest, milleks?', [
        'Tekstist: valik **sõltub** paljudest **asjadest** · noor ei tea veel, **millest** ta päriselt **huvitub** · kutsekeskharidusega võib **kõrgkooli kandideerida**',
        'Paljud tegusõnad tahavad kindlat käänet. Õpi need koos küsimusega: **kandideerima kuhu** (gümnaasiumi, kutsekooli, ülikooli) · **astuma kuhu** (kooli)',
        '**millest** (-st): **huvituma, sõltuma, unistama, loobuma** · **millele** (-le): **keskenduma** õppimisele · **milleks** (-ks): **valmistuma** eksamiks',
        'Omadussõnad: **mures** mille pärast (hinnete pärast) · **rahul** millega (valikuga) · **valmis** milleks (praktikaks) · **huvitatud** millest (tund 18)',
        'Kontrolli küsimusega: Kuhu ta kandideerib? Millest see sõltub? Milleks ta valmistub? Mille pärast oled mures?',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('031_p_letter', 'Nikita kiri kutsekoolile.', 'Naabri poeg Nikita kandideerib kutsekooli ja palub, et vaataksid tema motivatsioonikirja üle. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Kandideerin teie kool autotehniku erialale.', 'Kandideerin teie kooli autotehniku erialale.|Ma kandideerin teie kooli autotehniku erialale.'],
        ['Juba lapsest saati huvitun autode remont.', 'Juba lapsest saati huvitun autode remondist.|Juba lapsest saati huvitun ma autode remondist.'],
        ['Praegu keskendun põhikooli lõpetamine.', 'Praegu keskendun põhikooli lõpetamisele.|Praegu keskendun ma põhikooli lõpetamisele.'],
        ['Minu valik ei sõltu ainult hinded.', 'Minu valik ei sõltu ainult hinnetest.'],
        ['Ema oli alguses mures minu matemaatika hinnete eest.', 'Ema oli alguses mures minu matemaatika hinnete pärast.'],
        ['Olen valmis praktika ettevõttes ja pikkadeks päevadeks.', 'Olen valmis praktikaks ettevõttes ja pikkadeks päevadeks.|Ma olen valmis praktikaks ettevõttes ja pikkadeks päevadeks.'],
        ['Tulevikus unistan oma töökoda.', 'Tulevikus unistan oma töökojast.|Tulevikus unistan ma oma töökojast.'],
      ], 'full', 'g_notice'), 'Nikita saadab kirja reedel; ilma vigadeta jätab ta vastuvõtukomisjonile parema mulje.'), { task: 'G08' }),
      'Pärast iga rida küsi: „Mis küsimus siin on?” (Kuhu? Millest? Millele? Milleks? Mille pärast?). Nii tuleb reegel õpilaselt, mitte sinult. Real 6 on üks sõna juba õigesti (pikkadeks päevadeks) — see on vihje, mis vormi praktika vajab.'),
    ],
    transfer: [
      station(tag(purpose(B.listening('031_t_voice', 'Sõbranna häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Olga! Mul on sinult nõu vaja, sest me oleme kodus päris segaduses.',
        'Nikita lõpetab kevadel üheksanda klassi. Ta tahab minna kutsekooli autotehnikuks õppima, sest ta huvitub autodest juba lapsest saati.',
        'Mina olen natuke mures. Ma arvan, et gümnaasium annab rohkem võimalusi ja sealt saab pärast ülikooli minna.',
        'Nikita hinded on keskmised. Matemaatika on tal hea, aga eesti keel on raskem.',
        'Ta tahab ka võimalikult kiiresti oma raha teenida. Kutsekoolis on praktika ettevõttes ja tema parim sõber õpib juba seal.',
        'Kutsekool on teises linnas, bussiga tund aega. Gümnaasium on meie kodu lähedal.',
        'Kandideerida tuleb mais. Palun helista mulle, kui saad, ja ütle, mida sina arvad. Aitäh!',
      ], [
        'Nikita tahab kutsekoolis õppida [autotehnikuks], sest see on tema huvi juba lapsest saati.',
        'Olga arvates annab [gümnaasium] noorele rohkem võimalusi, sest sealt saab ülikooli minna.',
        'Nikita hinded on keskmised, aga tema kõige parem aine koolis on [matemaatika].',
        'Kutsekoolis on õpilastel [praktika] ettevõttes ja Nikita parim sõber õpib juba seal.',
        'Kutsekool on teises linnas ja bussiga kulub sinna iga päev [tund aega|üks tund|tund].',
        'Olga sõnul tuleb kutsekooli või gümnaasiumi kandideerida juba [mais].',
      ]), 'Märkmed näitavad, millest Nikita valik sõltub; neid vajad nõu andmiseks.'), { task: 'L03' }), 4, 15, { final: 'advise' }),
      purpose(B.profiles('031_t_cards', 'Kaks teed pärast 9. klassi.', 'Loe kaarte ja märgi, mis sobiks Nikitale ja mis mitte.', [
        ['Gümnaasium', ['Gümnaasium kestab kolm aastat ja annab üldkeskhariduse.', 'Seal õpitakse palju aineid: keeli, matemaatikat, loodus- ja ühiskonnaaineid.', 'Pärast gümnaasiumi minnakse tavaliselt edasi ülikooli või kõrgkooli.', 'Ametit gümnaasium ei anna, see tuleb hiljem eraldi õppida.'], []],
        ['Kutsekool', ['Kutsekoolis saab samal ajal nii ameti kui ka keskhariduse.', 'Praktika toimub ettevõttes, mõnel erialal õpitakse kohe töökohal.', 'Kutsekeskharidusega võib hiljem ka kõrgkooli kandideerida.', 'Pärast lõpetamist saab kohe oma ametis tööle minna.'], []],
      ], '2'), 'Kaardid aitavad sul nõu anda faktidega, mitte ainult tundega.'),
      teach(tag(purpose(B.rolecards('031_t_advice', 'Helista Olgale.', 'Helista Olgale tagasi, kuula tema muret ja leppige kokku, mida pere järgmisena teeb.',
        'Olukord: sinu sõbranna Olga ei tea, kas tema poeg peaks minema gümnaasiumi või kutsekooli.\nSinu eesmärk: Olga teab mõlema tee plusse ja miinuseid ning te lepite kokku ühe järgmise sammu.\nPiirang: otsus on pere oma; sina annad nõu, mitte käsku.',
        'Olga kaart on õpetajal: tema hirmud ja üks uudis.',
        ['Minu arvates sõltub see …', 'Kui ta huvitub …-st, siis …', 'Ära ole … pärast mures.', 'Kas te olete mõelnud …?'], ['Aga ma kardan, et …', 'Kas kutsekoolist saab …?', 'Ma ei ole rahul …']), 'Tulemus: Olga ja Nikita teavad, mida nad sel nädalal teevad.'), { task: 'S11', main: true, level: 4 }),
      'Õpetaja kaart (Olga; kui õpilasel on teismeline laps, võib see olla tema enda pere). Ütle ainult seda, mida küsitakse. Varjatud info: lõpetasid ise gümnaasiumi ja ülikooli, aga töötad müüjana; arvad, et kutsekool on „nõrkadele”; Nikita isa toetab kutsekooli; avatud uste päev on järgmisel laupäeval. Takistused ükshaaval: 1) „Aga kutsekoolist ei saa ju ülikooli!” 2) „Ta on alles viisteist, ta ei tea, mida tahab.” 3) „Bussiga tund aega iga päev — see on liiga raske.” Õnnestunud, kui õpilane nimetab mõlema tee vähemalt ühe plussi, parandab Olga vale arvamuse (kutsekeskharidusega saab kõrgkooli kandideerida), kasutab vähemalt neli rektsiooni (sõltub millest, huvitub millest, mures mille pärast, kandideerima kuhu) ja te lepite kokku ühe sammu.'),
      extension(teach(tag(purpose(B.rolecards('031_t_more', 'Rollimäng: avatud uste päeval', 'Küsi kooli esindajalt kõike, mida pere otsuseks vajab.',
        'Olukord: oled koos Olga ja Nikitaga kutsekooli avatud uste päeval.\nSinu eesmärk: saada teada praktika, õpilaskodu, edasiõppimise ja eesti keele toe kohta.\nPiirang: aega on kümme minutit, siis algab ringkäik.',
        'Kooli esindaja kaart on õpetajal: vastused ja üks üllatus.',
        ['Millest sõltub, kas …?', 'Kas pärast kooli saab kandideerida …?', 'Mida peab õpilane tegema, et …?'], ['Meie õpilased osalevad …', 'See sõltub …', 'Kahjuks …']), 'Avatud uste päeval saad vastused, mida ühelt kodulehelt ei leia.'), { task: 'S05', level: 4 }),
      'Kui aega jääb (12 min). Sina oled kooli esindaja (väljamõeldud kool). Vastused: praktika on teisest aastast ettevõttes; õpilaskodu on, koha peab taotlema augustiks; kutsekeskharidusega saab kandideerida kõrgkooli; eesti keele toeks on lisatunnid. Üllatus: autotehniku erialale on rohkem kandidaate kui kohti, seepärast on vestlus ja matemaatika test. Õnnestunud, kui õpilane küsib vähemalt neli küsimust, kasutab kolm rektsiooni ja võtab lõpus kokku, mida pere peab tegema.'), 12),
      tag(exitCheck(purpose(B.gaps('031_t_exit', 'Kontrolli end: kolm rektsiooni.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Minu õe tütar kandideerib sel kevadel Tartu [gümnaasiumi]. (gümnaasium)',
        'Tema valik sõltub eelkõige oma [huvidest] ja alles siis hinnetest. (huvid)',
        'Vanemad on poja [hinnete] pärast mures, aga poeg ise mitte. (hinded)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tegusõna järel tuleb õige kääne.')), {}),
      purpose(B.selfcheck('031_t_self', ['Ma räägin oma koolist ja sellest, kes mu koolitee üle otsustas.', 'Ma leian tekstist, kuidas Eesti koolitee käib: põhikool, gümnaasium, kutsekool, õppimiskohustus.', 'Ma kasutan õiget käänet: kandideerima kuhu, sõltuma millest, mures mille pärast.', 'Ma annan noorele või tema vanemale nõu ja lepin kokku järgmise sammu.'], 'Nõu antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('031_t_msg', 'Kodus: sõnum Olgale.', 'Kirjuta kodus 120–150 sõna: mida sa Nikitale soovitad ja miks, mis on kahe tee plussid ja mis on pere järgmine samm. Kasuta vähemalt nelja rektsiooni (kuhu, millest, milleks, mille pärast).', 'Kallis Olga!', 'Kallistan\n(sinu nimi)', [120, 150]), 'Olga loeb sinu sõnumit koos Nikitaga ja nad teevad otsuse.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('031_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa soovitad noorele, kes ei tea, kuhu pärast põhikooli edasi õppima minna.', [
        'Millest peaks valik sõltuma?',
        'Kelle poole tasub enne otsust pöörduda?',
      ], [60, 120]), 'Õpetaja kuulab sinu nõu ja ütleb, kas rektsioonid on õiged.')), { task: 'S15' }),
      homework('031_t_homework', ['1. Sõnum Olgale, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-032': {
    title: 'Kas sa oled visuaalne õppija? Müüdid ja tõde õppimisest',
    phases: grammar('Keel: kaudne kõneviis ja allikas — väidetakse, et …; see olevat …; uuringu järgi, teadlase sõnul'),
    format: 'facts',
    topic: 'learning',
    canDo: 'Ma saan kuuldust aru, mis on õppimise müüt ja mis uuringu tulemus, räägin, kust info pärineb, ja seletan sõbrale, kuidas eksamiks tõhusalt õppida; teiste väiteid edastan kaudse kõneviisiga (olevat, aitavat) ja allikaga (uuringu järgi).',
    teacherPage: {
      goal: 'Ученик на слух проверяет пять «истин» об учёбе, передаёт чужие слова косвенным наклонением (-vat) и с источником и объясняет родственнику, как готовиться к экзамену.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 «слуха»; станция 4 — чат и короткое объяснение без плана на три недели. Радио (станция 2) — дома, с прогнозом в тетради.',
      hook: '«Человек говорит: „Я визуал. Если я не вижу слово, оно не запоминается.“ Это про тебя? Как ты учишь новые слова?» Ответьте сами одной фразой, потом ученик. Ничего не объясняйте — ответ даст радио.',
      plan: [
        '0–3: крючок — «визуал ли ты?», ученик отвечает сразу',
        '3–10: станция 1 — разговор: как я учусь и что мне мешает',
        '10–25: станция 2 — слова (2 мин); прогноз карандашом: 5 утверждений «верно или неверно?»; радио — первое прослушивание: сколько мифов назвала исследовательница; второе: проверить прогноз; вопрос «Что ты завтра сделаешь иначе?»',
        '25–37: станция 3 — заметить в радио «olevat», «väidetakse», «… järgi» → правило → 7 «слухов» передать с дистанцией',
        '37–52: станция 4 — чат Дмитрия и его дочери; объяснить Дмитрию, что работает, и вместе составить план на три недели',
        '52–62: «Kui aega jääb» — игра «Разрушитель мифов»',
        '62–70: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '70–78: домашнее задание: совет Дмитрию, запись 1 минуты, слова',
        '78–90: запас',
      ],
      sources: 'Радио: Pashler, McDaniel, Rohrer & Bjork (2008) «Learning Styles: Concepts and Evidence» — нет доказательств, что обучение «под стиль» улучшает результат; Dunlosky, Rawson, Marsh, Nathan & Willingham (2013) «Improving Students’ Learning With Effective Learning Techniques» — 10 техник: самопроверка и распределённое повторение — высокая польза, перечитывание и подчёркивание — низкая; там же обзор Cepeda и др. (2006): 254 исследования, после распределённого повторения вспоминали 47 %, после сплошного — 37 %. Исследовательница Pille Org, чат Дмитрия и «слухи» станции 3 — учебные.',
      groups: 'Станция 1 — в парах. Прогноз — каждый сам, потом сравнить в паре до второго прослушивания. Станция 4: один — Дмитрий с вашей карточкой, другой объясняет; потом смена. В 1:1 Дмитрий — вы.',
      errors: [
        '«Ta olevab visuaalne õppija» → «Ta olevat …» (кауднe наклонение: основа ma-инфинитива + -vat, без лица).',
        '«Ma kuulsin, et kohv aitavat» → можно, но после «uuringu järgi / teadlase sõnul» глагол обычный: «Uuringu järgi aitab …».',
        'Отрицание: «See ei olevat tõsi» (ei + -vat), не «see ei ole olevat».',
        '«Teadlane sõnul» → «Teadlase sõnul» (sõnul, järgi, andmetel — после генитива).',
      ],
      notes: [
        'Формат — анализ фактов: пять утверждений об учёбе проверяются по исследованиям. Цикл аудирования: прогноз → общее понимание → проверка → детали → одна строка рефлексии.',
        'Студенту — экзамен в вузе; пенсионеру — экзамен на гражданство или по языку; маме — курс в декрете; уставшему после смены — 20 минут в день вместо четырёх часов в воскресенье (это его главный выигрыш). Если ученик спросит про «стили»: предпочтения есть, но подстройка под стиль результат не улучшает.',
        'Обратная связь, 2–3 цели: -vat-форма от ma-инфинитива; источник с генитивом (teadlase sõnul); причина и результат в совете («Kui kordad vahedega, jääb rohkem meelde»). На станции 4 не перебивать.',
      ],
    },
    discover: [
      station(B.text('032_d_hook', 'Kas see käib sinu kohta?', 'Üks inimene ütleb: „Ma olen visuaalne õppija. Kui ma sõna ei näe, ei jää see meelde.” Kas see käib ka sinu kohta? Kuidas sina uusi sõnu õpid? Vasta kohe ühe lausega.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('032_d_talk', 'Kuidas ma õpin.', 'Vasta ja too näide oma elust.', [
        'Millal sa viimati millekski valmistusid: eksamiks, juhilubade teooriaks või uueks tööks? Kuidas sa õppisid?',
        'Mis aitab sul sõnu või fakte kõige paremini meelde jätta?',
        'Mis on õppimises sinu arvates kõige suurem aja raiskamine?',
      ], [180, 240], ['Mina õpin nii, et …', 'Mulle aitab …', 'Minu arvates …']), 'Sinu harjumused on tunni esimene näide: pärast raadiot näed, kas need töötavad.'), { task: 'S01', fluency: true }),
      'Üks-ühele: räägi ka ise, kuidas sina õpid. Ära paranda ega hinda õppimisviise — vastuse annab raadio. Lõpus küsi: „Mida sa teed kõige sagedamini: loed üle, jooned alla või küsid endalt?”')),
      station(tag(B.vocab('032_d_vocab', 'Enne kuulamist: sõnad.', ['uuring — исследование', 'uurija — исследователь', 'müüt — миф', 'väide — утверждение', 'tõend — доказательство', 'meelde jätma — запоминать', 'meenutama — вспоминать', 'kordamine — повторение', 'üle lugema — перечитывать', 'allikas — источник']), { topic: ['müüt', 'meenutama'] }), 2, 15),
      teach(tag(purpose(B.examListen('032_d_radio', 'Raadio: müüdid ja tõde õppimisest.', 'Enne kuulamist arva iga väite kohta: õige või vale? Siis kuula kaks korda ja kontrolli. Allikas: Pashler jt (2008); Dunlosky jt (2013); Cepeda jt (2006).', 'truefalse', [
        'Saatejuht: Tere! Täna räägime õppimisest. Paljud usuvad õppimise kohta asju, mida uuringud ei kinnita. Stuudios on haridusteadlane Pille Org. Pille, alustame kõige tuntumast väitest: iga inimene olevat kas visuaalne või kuuldeõppija.',
        'Pille: Jah, seda väidetakse sageli. Eelistused on inimestel muidugi erinevad: üks vaatab meelsamini pilte, teine kuulab. Aga kui teadlased kontrollisid, kas õppija tulemus paraneb, kui õpetus sobib tema stiiliga, siis tõendeid selle kohta ei leitud. Pashleri ja tema kolleegide ülevaate järgi kahe tuhande kaheksandast aastast ei ole põhjust õppijaid stiilide järgi jagada.',
        'Saatejuht: Aga kuidas siis õppida?',
        'Pille: Ameerika psühholoog John Dunlosky ja tema kolleegid hindasid kahe tuhande kolmeteistkümnendal aastal kümmet õppimisviisi. Kõige vähem kasu oli ülelugemisest ja allajoonimisest. Need tunduvad tõhusad, sest tekst muutub tuttavaks, aga tuttav ei tähenda veel, et sa seda mäletad.',
        'Saatejuht: Ja mis aitas kõige rohkem?',
        'Pille: Kaks asja. Esiteks enda kontrollimine: pane raamat kinni ja proovi meenutada, kirjuta küsimused kaartidele või tee proovitest. Teiseks kordamine vahedega. Üle kahesaja viiekümne uuringu kokkuvõte näitas, et vahedega õppijad mäletasid keskmiselt nelikümmend seitse protsenti, ühe korraga õppijad aga kolmkümmend seitse protsenti.',
        'Saatejuht: Kas öösel enne eksamit õppimine siis ei tööta?',
        'Pille: Järgmisel hommikul võib see natuke aidata, aga nädala pärast on suur osa ununenud. Pealegi vajab mälu und. Parem on õppida pool tundi iga päev kui neli tundi korraga pühapäeval.',
        'Saatejuht: Üks lühike nõuanne kuulajatele?',
        'Pille: Ära loe kolm korda üle. Pane raamat kinni ja küsi endalt: mida ma just õppisin?',
        'Saatejuht: Aitäh, Pille!',
      ], [
        ['Uuringud näitasid, et õppija tulemus paraneb, kui õpetus sobib tema õpistiiliga.', false],
        ['Ülelugemine ja allajoonimine olid kümnest õppimisviisist kõige kasulikumad.', false],
        ['Vahedega õppijad mäletasid uuringutes keskmiselt rohkem kui need, kes õppisid ühe korraga.', true],
        ['Öösel enne eksamit õppimine hoiab teadmisi kõige kauem meeles.', false],
        ['Teadlane soovitab pärast lugemist raamatu kinni panna ja endalt küsida.', true],
      ], 'g_read'), 'Kuuled, millised sinu harjumused aitavad ja millised raiskavad aega.'), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamise tsükkel: 1) prognoos pliiatsiga enne kuulamist; 2) esimene kuulamine — „Mitu müüti ta nimetas?”; 3) teine kuulamine — kontrolli prognoosi; 4) detail: „Mis arvud olid 47 ja 37?”; 5) üks lause: „Mida sa homme teisiti teed?”'),
      B.know('032_d_know', ['Kordamine vahedega on üks paremini uuritud õppimise nähtusi. 254 uuringu kokkuvõttes mäletasid vahedega õppijad keskmiselt 47 protsenti õpitust, ühe korraga õppijad 37 protsenti. Uurijate soovitus: mida kauem tahad midagi mäletada, seda pikemad võivad olla vahed — näiteks nädala jaoks umbes üks päev, aasta jaoks üks-kaks kuud.'], 'Cepeda jt (2006), kokkuvõte artiklis Dunlosky jt, „Improving Students’ Learning With Effective Learning Techniques” (2013)', 'Kas teadsid? Kordamine vahedega'),
    ],
    practice: [
      station(B.notice('032_p_notice', 'Märka: kas see on tõde või keegi väidab?', [
        'Raadiost: iga inimene **olevat** kas visuaalne või kuuldeõppija · seda **väidetakse** sageli · **Pashleri ja tema kolleegide ülevaate järgi** ei ole põhjust õppijaid jagada',
        '**Kaudne kõneviis** (-vat): edastad teise inimese väidet ja ei vastuta selle eest: Kohv **aitavat** õppida. Ta **olevat** visuaalne õppija. Eitus: see **ei olevat** tõsi.',
        'Moodustus: ma-tegevusnimi, **-ma** asemel **-vat**: aitama → aita**vat** · olema → ole**vat** · tulema → tule**vat** · jääma → jää**vat** · saama → saa**vat**',
        'Allikas sõnaga: **uuringu järgi** · **teadlase sõnul** · **Statistikaameti andmetel** — siis on tegusõna tavaline: Uuringu järgi **aitab** kordamine.',
        'Vahe on kindluses: Ta **on** visuaalne õppija (sina tead) — Ta **olevat** visuaalne õppija (keegi ütles, sina ei tea). Kui tõendit ei ole, jääb väide müüdiks.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('032_p_rumour', 'Kuulujutt või uuring?', 'Sõber saatis sulle kuuldud „tarkusi”. Ütle iga väide edasi: kuulujutu puhul -vat-vormiga (sina selle eest ei vastuta), uuringu puhul allikaga (uuringu järgi, teadlase sõnul).', [
        ['Sõber: „Kohv enne eksamit aitab paremini mõelda.”', 'kuulujutt', 'Kohv enne eksamit aitavat paremini mõelda.|Sõbra sõnul aitavat kohv enne eksamit paremini mõelda.'],
        ['Kolleeg: „Täiskasvanu ei saa enam uut keelt hästi õppida.”', 'kuulujutt', 'Täiskasvanu ei saavat enam uut keelt hästi õppida.|Kolleegi sõnul ei saavat täiskasvanu enam uut keelt hästi õppida.'],
        ['Naaber: „Muusika taustal jätab inimene sõnad paremini meelde.”', 'kuulujutt', 'Muusika taustal jätvat inimene sõnad paremini meelde.|Naabri sõnul jätvat inimene muusika taustal sõnad paremini meelde.'],
        ['Ajakiri: „Inimene kasutab ainult kümme protsenti oma ajust.”', 'kuulujutt', 'Inimene kasutavat ainult kümme protsenti oma ajust.|Ajakirja järgi kasutavat inimene ainult kümme protsenti oma ajust.'],
        ['Vanaema: „Öösel õpitu on hommikul kindlalt peas.”', 'kuulujutt', 'Öösel õpitu olevat hommikul kindlalt peas.|Vanaema sõnul olevat öösel õpitu hommikul kindlalt peas.'],
        ['Uuring: kordamine vahedega aitab rohkem kui ühe korraga õppimine. (Kirjuta allikaga.)', 'uuring', 'Uuringu järgi aitab kordamine vahedega rohkem kui ühe korraga õppimine.|Uuringu järgi aitab vahedega kordamine rohkem kui ühe korraga õppimine.'],
        ['Teadlane raadios: sõnu tasub meenutada, mitte üle lugeda. (Kirjuta allikaga.)', 'uuring', 'Teadlase sõnul tasub sõnu meenutada, mitte üle lugeda.|Teadlase sõnul tasub sõnu meenutada, mitte neid üle lugeda.'],
      ], 'full', 'g_notice'), 'Kui edastad kuulujuttu, näitab vorm kohe, et sina selle eest ei vastuta.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas sina usud seda? Mida raadio ütles?” Õpilane vastab ühe lausega: „Väidetakse, et …, aga uuringu järgi …”. Read 6 ja 7 on allikaga: seal on tegusõna tavaline (aitab, annab).'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('032_t_chat', 'Dmitri ja tema tütre vestlus.', 'Enne lugemist arva: mida Dmitri õppimises valesti teeb? Siis loe ja kontrolli.', 'Dmitri', 'Alina', [
        ['A', 'Alina, mul on kolme nädala pärast B1-eksam. Ma loen õpikut juba kolmandat korda läbi.'],
        ['B', 'Ja kas jääb meelde?'],
        ['A', 'Lugedes tundub, et tean kõike. Aga kui keegi küsib, on pea tühi.'],
        ['B', 'Kuidas sa sõnu õpid?'],
        ['A', 'Jooni need rohelisega alla. Pühapäeval istun neli tundi järjest, muusika mängib ja kohvi on palju.'],
        ['B', 'Mu sõbranna ütles, et sa oled lihtsalt kuuldeõppija ja peaksid ainult kuulama.'],
        ['A', 'Võib-olla. Ma ei tea enam, mida teha. Tööl on vahetused ja õhtul on aega ainult pool tundi.'],
        ['B', 'Küsi kelleltki, kes on uuringuid lugenud. Mina ei oska aidata.'],
      ], 'g_read'), 'Vestlusest näed, mis Dmitri õppimises ei tööta; see on sinu nõu alus.'), { task: 'R13' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('032_t_explain', 'Seleta Dmitrile.', 'Seleta Dmitrile, mis tema õppimises ei tööta ja miks, ning tehke koos tema kolme nädala plaan.',
        'Olukord: Dmitri valmistub kolme nädala pärast B1-eksamiks ja õpib nii, nagu vestlusest näed.\nSinu eesmärk: Dmitri teab, millest loobuda ja mida teha, ning teil on kokku lepitud tema iga päeva plaan.\nPiirang: Dmitri usaldab rohkem uuringuid kui arvamusi, nii et ütle, kust info pärineb.',
        'Dmitri kaart on õpetajal: tema harjumused ja kaks kahtlust.',
        ['Uuringu järgi …', 'Väidetakse küll, et …, aga see on müüt, sest tõendeid ei ole.', 'Pane raamat kinni ja proovi meenutada.', 'Nii jätad sõnad paremini meelde, sest …', 'Tulemust saad mõõta väikese testiga.'], ['Aga sõbranna ütles, et …', 'Kas see tõesti töötab?', 'Mul ei ole aega …']), 'Tulemus: sinu sõbra või pereliikme plaan, mis põhineb uuringutel, mitte kuulujuttudel.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (Dmitri; kui õpilasele sobib paremini, on see tema enda või tema lapse eksam). Ütle ainult seda, mida küsitakse. Varjatud info: töötad vahetustes; kodus on lärm; telefonis on sõnakaartide äpp, mida sa pole kasutanud; usud, et oled „kuuldeõppija”. Takistused ükshaaval: 1) „Aga kui ma ülelugemisel tunnen, et kõik on selge?” 2) „Pool tundi päevas on liiga vähe!” 3) „Sõbranna ütles, et ma olevat kuuldeõppija.” Õnnestunud, kui õpilane nimetab vähemalt kaks tõhusat ja kaks vähe kasulikku viisi, ütleb vähemalt korra allika (uuringu järgi, teadlase sõnul), kasutab vähemalt kaks korda -vat-vormi ja te panete kokku iga päeva plaani.'),
      extension(teach(tag(purpose(B.speaking('032_t_more', 'Mäng: müüdimurdja', 'Õpetaja ütleb ühe väite. Sul on 30 sekundit: edasta väide -vat-vormiga ja ütle, mida sina sellest arvad ja miks.', [
        'Väited: kala söömine teeb targaks; vanemas eas ei jää midagi meelde; unes saab keelt õppida; kõige parem on õppida varahommikul.',
        'Alusta: Väidetakse, et … / Ta ütles, et see olevat …; lõpeta: Minu arvates …',
      ], [120, 180], ['Väidetakse, et …', 'See olevat …', 'Aga minu kogemus näitab …']), 'Kiire mäng harjutab -vat-vormi ja oma arvamust ilma ettevalmistuseta.'), { task: 'S19', fluency: true }),
      'Kui aega jääb (10 min). Ütle üks väide korraga, hoia aega (30 s). Punkt: õige -vat-vorm + oma arvamus ühe põhjusega. Pärast nelja väidet vahetage: õpilane ütleb väite, sina vastad. Need väited ei ole kontrollitud — ära ütle „õige / vale”, küsi hoopis: „Kust see info tuleb? Kuidas seda kontrollida?”'), 10),
      tag(exitCheck(purpose(B.gaps('032_t_exit', 'Kontrolli end: kolm kuulujuttu.', 'Kirjuta sulgudes olev tegusõna kaudse kõneviisi vormis (-vat).', [
        'Naaber ütles, et tema poeg [olevat] eksamiks juba täiesti valmis. (olema)',
        'Sõbranna kuulis kuskilt, et tume šokolaad [aitavat] paremini keskenduda. (aitama)',
        'Ajakirjas kirjutati, et unes [saavat] uusi sõnu õppida. (saama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kaudne kõneviis on käes.')), {}),
      purpose(B.selfcheck('032_t_self', ['Ma räägin, kuidas ma õpin ja mis mind aitab.', 'Ma saan raadiost aru, millised õppimisviisid uuringute järgi töötavad ja millised mitte.', 'Ma edastan teise inimese väite kaudse kõneviisiga (olevat, aitavat) ja nimetan allika.', 'Ma seletan sõbrale, kuidas eksamiks tõhusalt õppida.'], 'Müüdid murtud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('032_t_guide', 'Kodus: nõuanne Dmitrile.', 'Kirjuta kodus 120–150 sõna: Dmitri kolme nädala plaan — mida teha iga päev, et sõnu paremini meelde jätta, millest loobuda ja miks. Nimeta vähemalt kaks allikat (uuringu järgi, teadlase sõnul) ja kasuta vähemalt kord -vat-vormi.', [10, 14], ['järgi', 'sõnul', 'olevat'], 2, 'g_use'), 'Dmitri hoiab sinu plaani telefonis ja õpib kolm nädalat teisiti.')), { task: 'W05', level: 3 }),
      tag(homeTask(purpose(B.speaking('032_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa pärast seda tundi oma õppimises teisiti teed.', [
        'Millest sa loobud ja miks?',
        'Mida sa homme proovid?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja annab ühe nõu.')), { task: 'S15' }),
      homework('032_t_homework', ['1. Nõuanne Dmitrile, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-033': {
    title: 'Uus amet 45-aastaselt — julge samm või hilja?',
    phases: grammar('Keel: tingiv kõneviis kui-lauses — Kui ma õpiksin …, saaksin …; Kui ma oleksin varem alustanud, …'),
    format: 'debate',
    topic: 'work',
    canDo: 'Ma räägin, mida ma õpiksin, kui mul oleks aega ja raha, saan aru ametit vahetanud inimeste kogemusest ja kaitsen väitlusel oma seisukohta täiskasvanu ümberõppe kohta; oletusi ütlen kui-lausega tingivas kõneviisis.',
    teacherPage: {
      goal: 'Ученик слушает людей, сменивших профессию после 40, говорит о гипотезах условным наклонением и ведёт дебаты «Учиться новой профессии в 45?» с голосованием.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 3 — правило и 4 предложения Светланы; дебаты — по 2 аргумента. Подкаст (станция 2) — дома.',
      hook: '«Светлане 46. Двадцать лет она на кассе и хочет выучиться на бухгалтера. Это смелый шаг или уже поздно? Голосуем: смело, поздно или зависит — и одна причина!» Голосуйте оба, вы — с короткой причиной.',
      plan: [
        '0–3: крючок — голосование о Светлане, ученик отвечает сразу',
        '3–10: станция 1 — разговор о своей работе и мечте',
        '10–25: станция 2 — слова (2 мин), прогноз «Что было самым трудным?», подкаст дважды, 7 пропусков',
        '25–37: станция 3 — «Kui ma oleksin …» в подкасте → правило → 7 сомнений Светланы как предположения',
        '37–52: станция 4 — два слушателя в студии (за и против), 6 вопросов с выбором, карточки аргументов, дебаты, голосование',
        '52–64: «Kui aega jääb» — ролевая игра: ученик — карьерный консультант Светланы',
        '64–72: проверка на выходе, «Ma oskan …», 3 ошибки из дебатов',
        '72–80: домашнее задание: рассуждение, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Карточки: Statistikaamet, Tõetamm «Täiskasvanute elukestvas õppes osalemine» (2025: 23,8 % 25–64-летних учились на курсах или в школе за последние 4 недели; 65,7 % учились неформально — на работе, дома, с друзьями — за последние 12 месяцев); Töötukassa, minukarjaar.ee (карьерное консультирование бесплатно для всех желающих); Haridus- ja Teadusministeerium 12.10.2026 (бесплатные курсы примерно для 33 000 человек до конца 2027 г.). Подкаст «Teine algus», Алексей, Керсти, звонки Рейна и Татьяны, Светлана — учебные; учебные программы названы реальные (IT-süsteemide nooremspetsialist в профшколе; медсестра в Tartu Tervishoiu Kõrgkool, 3,5 года).',
      groups: 'Голосование — все сразу. Подкаст — каждый сам, сверка в паре. Дебаты: две команды по 1–2 человека, вы ведёте время и голосуете последним. В 1:1 вы берёте сторону, которую ученик не выбрал.',
      errors: [
        '«Kui mul on aega, ma õpiksin» → «Kui mul oleks aega, õpiksin ma …» (условное в обеих частях; после придаточного глагол сразу).',
        '«Kui ma oleks …» → «Kui ma oleksin …» (у «я» форма -ksin; «oleks» — для он/она или разговорно).',
        '«Kui ma oleksin varem alustasin» → «Kui ma oleksin varem alustanud» (прошедшее условное: oleks + -nud).',
        '«Sa võiksid minna nõustajale» → «Sa võiksid minna nõustaja juurde» (к человеку — kelle juurde).',
      ],
      notes: [
        'Формат — дебаты с голосованием. Голос в конце можно сменить, если назвать аргумент, который убедил. Ученику без работы: пенсионеру — «Mida sa õpiksid nüüd, pensionil?» (университет третьего возраста, курсы); маме в декрете — «Mida sa õpiksid, kui laps läheb lasteaeda?»; студенту — «Kas sa vahetaksid eriala?».',
        'Не обещайте ученику конкретных денег от Töötukassa: условия зависят от целевой группы, это проверяет консультант. Обратная связь, 2–3 цели: условное в kui-предложении; аргумент + пример или факт; порядок слов после придаточного. В дебатах не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(B.text('033_d_hook', 'Hääleta kohe!', 'Svetlana on 46. Ta on kakskümmend aastat kassas töötanud ja tahab nüüd raamatupidajaks õppida. Kas see on julge samm või juba hilja? Hääleta: julge, hilja või sõltub. Ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('033_d_talk', 'Minu töö ja minu unistus.', 'Vasta ja too näide oma elust.', [
        'Mis ametit sa teed või oled teinud? Kuidas sa selle juurde jõudsid?',
        'Mis sind tööelus praegu huvitab või väsitab: töökoormus, graafik või midagi muud?',
        'Kes sinu tuttavatest on täiskasvanuna ametit vahetanud? Kuidas tal läks?',
      ], [150, 210], ['Kui ma saaksin valida, …', 'Ma õpiksin …', 'Minu tuttav …']), 'Sinu enda töö või tuttava lugu annab väitluseks esimese näite.'), { task: 'S14', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu. Ära paranda; lõpus ütle, kas õpilane kasutas tingivat kõneviisi („Ma õpiksin …”). Kui õpilane ei tööta: „Mis ametit sa tahtsid lapsena teha? Mida sa õpiksid nüüd?”')),
      station(tag(B.vocab('033_d_vocab', 'Enne kuulamist: sõnad.', ['amet — профессия', 'ümberõpe — переобучение', 'kursus — курс', 'karjäärinõustaja — карьерный консультант', 'oskus — навык', 'kogemus — опыт', 'julgus — смелость', 'palk — зарплата', 'vahetama — менять', 'kahetsema — сожалеть']), { topic: ['ümberõpe', 'karjäärinõustaja'] }), 2, 15),
      tag(purpose(B.listening('033_d_podcast', 'Taskuhääling „Teine algus”.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Saatejuht: Tere tulemast saatesse „Teine algus”! Täna on minuga kaks inimest, kes vahetasid ametit pärast neljakümnendat eluaastat. Aleksei, sina olid kaua keevitaja.',
        'Aleksei: Jah, kakskümmend aastat tehases Narvas. Siis jäi selg haigeks ja ma sain aru, et pensionini ma seda tööd ei jaksa. Läksin Töötukassa karjäärinõustaja juurde. Ausalt öeldes ei uskunud ma, et sellest kasu on.',
        'Saatejuht: Aga oli?',
        'Aleksei: Oli. Nõustaja küsis, mida ma vabal ajal teen. Ütlesin, et parandan kõigi naabrite arvuteid. Nüüd õpin kutsekoolis IT-süsteemide nooremspetsialistiks. Kui ma oleksin kümme aastat varem alustanud, oleks olnud lihtsam, aga ma ei kahetse.',
        'Saatejuht: Kersti, sina olid lasteaiaõpetaja ja oled nüüd …',
        'Kersti: … õde. Õppisin kolm ja pool aastat tervishoiu kõrgkoolis, viimased kaks aastat töö kõrvalt. See oli raske. Lapsed olid teismelised ja õhtuti istusin raamatute taga.',
        'Saatejuht: Mis oli kõige raskem?',
        'Kersti: Kõige raskem oli julgus. Ma kartsin, et noorte kõrval olen liiga aeglane. Tegelikult aitas mind palju elukogemus: ma oskan haige inimesega rahulikult rääkida.',
        'Saatejuht: Mida te soovitaksite kuulajale, kes mõtleb samamoodi?',
        'Aleksei: Mine nõustaja juurde, see on tasuta. Ja ära mõtle, mida teised arvavad.',
        'Kersti: Arvuta enne läbi, kuidas sa raha ja ajaga hakkama saad. Kui pere ei toeta, on väga raske.',
        'Saatejuht: Aitäh mõlemale!',
      ], [
        'Pärast kahtkümmend aastat tehases loobus Aleksei keevitaja tööst, sest tal jäi [selg] haigeks.',
        'Karjäärinõustaja küsis kõigepealt, mida Aleksei pärast tööd ja [vabal ajal] teeb.',
        'Aleksei on juba aastaid tasuta parandanud kõigi naabrite [arvuteid].',
        'Kersti õppis kõrgkoolis kolm ja pool aastat, viimased kaks aastat [töö kõrvalt].',
        'Kersti sõnul oli täiskasvanuna õppimises kõige raskem asi [julgus].',
        'Uues töös haiglas aitas Kerstit kõige rohkem tema [elukogemus].',
        'Aleksei soovitab nõustaja juurde minna, sest karjäärinõustamine on [tasuta].',
      ], 'g_listen'), 'Kahe inimese päris kogemus annab väitluseks näite.'), { voice: 'interview', task: 'L04' }),
    ],
    practice: [
      station(B.notice('033_p_notice', 'Märka: kui …, siis …', [
        'Saatest: **Kui** ma **oleksin** kümme aastat varem **alustanud**, **oleks olnud** lihtsam. · Mida te **soovitaksite** kuulajale?',
        '**Tingiv kõneviis** — mõeldud, mitte päris olukord: tüvi + **-ksi-**: ma **õpiksin**, sa **läheksid**, ta **oleks**, me **saaksime**, nad **teeksid**.',
        '**Kui**-lauses ja pealauses on mõlemas tingiv: **Kui** mul **oleks** aega, **õpiksin** ma õeks. (Mitte: Kui mul on aega, õpiksin …) Kui-lause järel on tegusõna kohe.',
        'Minevikus (oleks + -nud): **Kui** ma **oleksin** varem **alustanud**, **oleksin** juba **lõpetanud**. Nii räägitakse kahetsusest või oletusest.',
        'Nõu: **võiksid**, **peaksid**, **oleks mõistlik** + da: Sa **võiksid** kõigepealt nõustaja juurde minna.',
      ], 'full'), 3, 12),
      teach(purpose(B.transformation('033_p_ifs', 'Mis siis, kui …?', 'Svetlana räägib, miks ta kõhkleb. Tee igast tõsiasjast oletus kui-lausega. Kasuta antud sõnu.', [
        ['Mul pole diplomit, seepärast ei saa ma kontoris töötada.', 'kui mul oleks', 'Kui mul oleks diplom, saaksin ma kontoris töötada.|Kui mul oleks diplom, saaksin kontoris töötada.'],
        ['Ma ei oska Excelit hästi, seepärast kardan arvutitööd.', 'kui ma oskaksin', 'Kui ma oskaksin Excelit hästi, ei kardaks ma arvutitööd.|Kui ma oskaksin Excelit hästi, ei kardaks arvutitööd.'],
        ['Mu lapsed on veel väikesed, seepärast pole mul õhtuti aega.', 'kui … oleksid', 'Kui mu lapsed oleksid suuremad, oleks mul õhtuti aega.|Kui mu lapsed ei oleks väikesed, oleks mul õhtuti aega.'],
        ['Ma ei käinud nõustaja juures ega teadnud oma võimalusi.', 'kui ma oleksin käinud', 'Kui ma oleksin nõustaja juures käinud, oleksin oma võimalusi teadnud.|Kui ma oleksin käinud nõustaja juures, oleksin teadnud oma võimalusi.'],
        ['Tööandja ei maksa kursuse eest, seepärast ma ei alusta.', 'kui tööandja maksaks', 'Kui tööandja maksaks kursuse eest, alustaksin ma.|Kui tööandja maksaks kursuse eest, alustaksin.'],
        ['Mu mees ei toeta mind, seepärast on mul raske otsustada.', 'kui … toetaks', 'Kui mu mees mind toetaks, oleks mul kergem otsustada.|Kui mu mees toetaks mind, oleks mul kergem otsustada.|Kui mu mees mind toetaks, ei oleks mul raske otsustada.'],
        ['Sa ei ole veel tasuta kursuste kohta küsinud. (Soovita Svetlanale.)', 'võiksid', 'Sa võiksid tasuta kursuste kohta küsida.|Sa võiksid küsida tasuta kursuste kohta.'],
      ], 'full', 'g_notice'), 'Svetlana kuuleb oma kahtlusi oletustena ja näeb, mida saab muuta.'),
      'Pärast iga lauset küsi: „Kas see on päris või mõeldud?” ja „Kus on tegusõna pärast kui-lauset?” Rida 4 on minevikus (oleksin käinud, oleksin teadnud) — kui õpilane ütleb „käiksin”, küsi: „Kas see oli eile või on homme?”'),
    ],
    transfer: [
      station(tag(purpose(B.examListen('033_t_calls', 'Kaks kuulajat stuudios.', 'Kuula kahte kuulajat kaks korda ja vali õige vastus.', 'choice', [
        'Saatejuht: Saate lõpus on stuudios kaks kuulajat. Rein, palun!',
        'Rein: Tere! Mina olen Rein, viiskümmend kaks aastat vana. Läksin kaks aastat tagasi kutsekooli elektrikuks õppima. Esimene aasta oli väga raske, sest õppisin õhtuti pärast tööd. Nüüd töötan elektrikuna ja teenin rohkem kui varem. Kui ma poleks õppima läinud, kardaksin praegu töö kaotamist.',
        'Saatejuht: Aitäh, Rein! Tatjana, palun.',
        'Tatjana: Tere! Mina alustasin neljakümne nelja aastaselt õe õpinguid, aga pidin poole aasta pärast lõpetama. Mu ema jäi haigeks ja ühe palgaga me hakkama ei saanud. Ma ei kahetse, et proovisin, aga ütlen ausalt: ilma pere ja raha toeta on see väga raske. Võib-olla proovin veel kord, kui lapsed on suuremad.',
        'Saatejuht: Aitäh mõlemale!',
      ], [
        ['Millal leidis Rein aega, et kutsekoolis elektrikuks õppida?', 'Ta õppis õhtuti pärast oma tööpäeva.', 'Ta õppis päeviti ja jättis töö pooleli.', 'Ta õppis ainult nädalavahetustel veebis.'],
        ['Kuidas tundis Rein end kutsekooli esimesel õppeaastal?', 'Esimene aasta oli tema jaoks väga raske.', 'Esimene aasta oli tema jaoks täiesti kerge.', 'Esimene aasta oli igav ja liiga lihtne.'],
        ['Mis on Reinu töös ja elus pärast õpinguid muutunud?', 'Ta töötab elektrikuna ja teenib rohkem.', 'Ta jäi pärast kooli hoopis töötuks.', 'Ta töötab ikka samal kohal kui varem.'],
        ['Kuidas lõppesid Tatjana õe õpingud, mida ta 44-aastaselt alustas?', 'Ta jättis õpingud poole aasta pärast pooleli.', 'Ta lõpetas õpingud edukalt ja töötab õena.', 'Ta vahetas õpingute ajal teise eriala vastu.'],
        ['Miks pidi Tatjana oma õpingud nii kiiresti katkestama?', 'Ema jäi haigeks ja ühest palgast ei piisanud.', 'Kool oli tema kodust liiga kaugel.', 'Õpingud olid tema jaoks liiga rasked.'],
        ['Mida arvab Tatjana nüüd sellest, et ta õppima läks?', 'Ta ei kahetse, et ta seda proovis.', 'Ta kahetseb väga, et ta seda proovis.', 'Ta ei taha enam kunagi õppida.'],
      ], 'g_listen'), 'Kaks kuulajat annavad väitluse kummalegi poolele päris näite.'), { voice: 'interview', task: 'L02' }), 4, 15, { final: 'decide' }),
      tag(purpose(B.profiles('033_t_cards', 'Kaart A: poolt.', 'Loe poolt-argumente. Kui oled poolt, vali kolm ja tõmba neile joon alla; kui vastu, mõtle, mida neile vastata.', [
        ['Poolt', ['2025. aastal õppis nelja nädala jooksul kursusel või koolis peaaegu iga neljas 25–64-aastane; aasta jooksul õppis tööl, kodus või sõpradega ligi kaks kolmandikku.', 'Töötukassa karjäärinõustamine on tasuta kõigile, kes seda soovivad.', 'Riik pakub 2027. aasta lõpuni tasuta tööalaseid koolitusi umbes 33 000 inimesele.', 'Elukogemus aitab uues töös, näiteks rahulikult inimestega rääkida.', 'Uus valdkond võib anda paindlikuma tööaja ja paremad töötingimused.', 'Allikas: Statistikaamet (2025); Töötukassa; Haridus- ja Teadusministeerium (12.10.2026).'], []],
      ], '1', 'g_read'), 'Kaart annab väitluseks faktid, mitte ainult tunded.'), { task: 'R01' }),
      tag(purpose(B.profiles('033_t_cons', 'Kaart B: vastu.', 'Loe vastuargumente. Kui oled vastu, vali kolm ja tõmba neile joon alla; kui poolt, mõtle, mida neile vastata.', [
        ['Vastu', ['Õppimise ajal võib pere sissetulek mitmeks aastaks väheneda.', 'Töö ja pere kõrvalt jääb õppimiseks vähe aega ja und.', 'Noorte kõrval õppides on vaja palju julgust ja kannatust.', 'Töö, pere ja õppimise vahel on raske tasakaalu leida.', 'Pensionini on umbes kakskümmend aastat — kas see tasub ära?', 'Sinu enda või tuttava näide: …'], []],
      ], '1', 'g_read'), 'Kui tead teise poole argumente, oskad neile väitluses kohe vastata.'), { task: 'R05' }),
      teach(tag(purpose(B.rolecards('033_t_debate', 'Väitlus ja hääletus.', 'Kas 45-aastaselt tasub uut ametit õppida? Vali pool, õpetaja kaitseb teist. Kumbki toob kolm argumenti ja küsib ühe küsimuse. Lõpus hääletate.',
        'Olukord: saate „Teine algus” kuulajate väitlus: kas 45-aastaselt tasub uut ametit õppida?\nSinu eesmärk: kaitsta oma poolt kolme argumendi ja näitega, vastata vastuargumendile ja põhjendada lõpus oma häält.\nTingimus: vähemalt üks argument on oletus kui-lausega („Kui inimene õpiks …, saaks ta …”), üks näide tuleb sinu enda või sinu tuttava elust.',
        'Õpetaja kaitseb teist poolt; tal on oma argumendid ja üks küsimus sulle.',
        ['Ühelt poolt …, teiselt poolt …', 'Kui inimene õpiks …, saaks ta …', 'Statistikaameti andmetel …', 'Ma hääletan poolt / vastu, sest …'], ['Ma ei ole päris nõus, sest …', 'Aga mis siis, kui …?', 'Sinu argument veenis mind, sest …']), 'Tulemus: sinu selge hääl ja lause, mis seda põhjendab.'), { task: 'S17', main: true, harno: 'S2' }),
      'Õpetaja kaart: kaitse poolt, mida õpilane ei valinud. Takistused ükshaaval: 1) „Kes maksab arved, kui pereema õpib?” 2) „Kui ta 50-aastaselt lõpetab, kas keegi võtab ta tööle?” 3) „Kas sinu tuttavate seas on keegi, kellel see õnnestus või ei õnnestunud?” Õnnestunud, kui: kolm argumenti, vähemalt kaks fakti või näidet (saatest, kuulajatelt või kaardilt), vastus sinu küsimusele, vähemalt kaks kui-lauset tingivas kõneviisis ja hääl ühe lausega. Hääleta lõpus ka ise. Ära paranda väitluse ajal; kolm märkust lõpus.'),
      extension(teach(tag(purpose(B.rolecards('033_t_more', 'Rollimäng: sina oled karjäärinõustaja', 'Küsi Svetlanalt tema oskuste ja huvide kohta ning paku talle kaks sammu.',
        'Olukord: Svetlana tuli Töötukassa karjäärinõustamisele ja ei tea, kas õppida raamatupidajaks.\nSinu eesmärk: saada teada tema oskused, huvid ja piirangud ning pakkuda kaks realistlikku sammu.\nPiirang: aega on kümme minutit; otsuse teeb Svetlana ise.',
        'Svetlana kaart on õpetajal: tema oskused ja üks hirm.',
        ['Mida te vabal ajal meelsasti teete?', 'Kui te õpiksite …, siis …', 'Te võiksite …'], ['Ma kardan, et …', 'Kui mul oleks …', 'Aga mis siis, kui …?']), 'Nõustaja rollis kuuled, kuidas head küsimused aitavad inimesel ise otsustada.'), { task: 'S09', level: 4 }),
      'Kui aega jääb (12 min). Sina oled Svetlana. Varjatud info: oled kassas töötades alati päeva aruanded õigesti teinud; oskad hästi suhelda; kardad arvutit; mees töötab Soomes ja on kodus ainult nädalavahetustel. Takistus: „Kui ma hakkama ei saa, olen kõigi ees naeruväärne.” Õnnestunud, kui õpilane küsib vähemalt neli küsimust, kasutab tingivat kõneviisi (te võiksite, kui te …-ksite) ja pakub kaks sammu.'), 12),
      tag(exitCheck(purpose(B.gaps('033_t_exit', 'Kontrolli end: kolm oletust.', 'Kirjuta sulgudes olev tegusõna tingiva kõneviisi vormis.', [
        'Kui mul oleks rohkem aega, [õpiksin] ma õhtuti programmeerimist. (õppima)',
        'Kui mu vend [oleks] noorem, läheks ta kohe ülikooli. (olema)',
        'Sa [võiksid] enne otsust karjäärinõustajaga rääkida. (võima)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tingiv kõneviis on käes.')), {}),
      purpose(B.selfcheck('033_t_self', ['Ma räägin oma tööst ja sellest, mida ma õpiksin.', 'Ma saan saatest aru, miks ja kuidas inimesed täiskasvanuna ametit vahetavad.', 'Ma ütlen oletuse kui-lausega tingivas kõneviisis (Kui ma …-ksin, …-ksin ma …).', 'Ma kaitsen väitlusel oma seisukohta ja põhjendan oma häält.'], 'Hääl antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('033_t_essay', 'Kodus: arutlus.', 'Kirjuta kodus 120–150 sõna: kas täiskasvanuna tasub uut ametit õppida? Üks poolt- ja üks vastuargument, igaühele näide, ja sinu järeldus. Kasuta vähemalt kahte kui-lauset.', [10, 14], ['kui', 'näiteks', 'kokkuvõttes'], 2, 'g_use'), 'Tekst on sinu B2-eksami arutluse harjutus; õpetaja annab tagasisidet argumentidele.')), { task: 'W14', level: 3 }),
      tag(homeTask(purpose(B.speaking('033_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa õpiksid, kui saaksid ühe aasta tasuta õppida, ja miks.', [
        'Mida sa õpiksid ja kus?',
        'Mis sinu elus siis muutuks?',
      ], [60, 120]), 'Õpetaja kuulab sinu unistust ja ütleb, kas tingiv kõneviis on õige.')), { task: 'S15' }),
      homework('033_t_homework', ['1. Arutlus, 120–150 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-034': {
    title: 'Kes maksab sinu õppimise eest?',
    phases: grammar('Keel: -mine ja -ja ametlikus tekstis — õppepuhkuse kasutamine, taotluse esitamine, õppija, taotleja'),
    format: 'quest',
    topic: 'money',
    canDo: 'Ma leian, kes võiks maksta minu järgmise kursuse või õpingute eest (õppepuhkus, koolituskulu maksusoodustus, Töötukassa, tasuta kursused), seletan ametliku lause lihtsalt ja kirjutan tööandjale õppepuhkuse taotluse; saan aru -mine- ja -ja-sõnadest ja kasutan neid.',
    teacherPage: {
      goal: 'Квест: что мне положено при учёбе (учебный отпуск, вычет, Töötukassa, бесплатные курсы), слова на -mine / -ja, мой план «следующий шаг» и письмо работодателю.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; пункт 3 — правило и 4 пропуска письма Марины; пункт 4 — только карточки и план в 3 строки. Чат (пункт 2) — дома, ответы на вопросы — в начале следующего урока.',
      hook: '«Представь: у тебя год и ноль евро. Что бы ты хотел выучить — язык, профессию, компьютер? Кто мог бы за это заплатить: ты, работодатель или государство?» Ответьте сами, потом ученик.',
      plan: [
        '0–3: крючок — год и ноль евро, ученик отвечает сразу',
        '3–10: пункт 1 — разговор: за какие курсы платил я или моя семья',
        '10–25: пункт 2 — слова (2 мин), прогноз «Сколько дней учебного отпуска положено?», чат коллег, 6 вопросов',
        '25–37: пункт 3 — -mine / -ja: заметить в цитатах из чата → правило → заявление Марины: 7 пропусков',
        '37–52: пункт 4 — четыре карточки «кто платит», мой план «следующий шаг», план письма и 2 первых предложения',
        '52–64: «Kui aega jääb» — ролевая игра: разговор с руководителем',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо работодателю, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Чат и карточки: täiskasvanute koolituse seadus § 13 (Riigi Teataja; HTM «Õppepuhkus ja koolituse rahastamine», 11.11.2026): учебный отпуск до 30 календарных дней в год, за 20 дней — средняя зарплата (формальное обучение и курсы для работы), ещё 15 дней на окончание — по минимальной ставке, сообщить работодателю минимум за 14 дней; Maksu- ja Tolliamet «Koolituskulu» (18.05.2026): расходы на обучение вычитаются вместе с подарками и пожертвованиями до 1200 € в год, обучающий должен быть зарегистрирован в EHIS; Töötukassa minukarjaar.ee «Tööta ja õpi»: koolituskaart работающим с устаревшими навыками или под угрозой потери работы, консультирование бесплатно; HTM 12.10.2026: бесплатные рабочие курсы примерно для 33 000 человек, 1786 курсов, до конца 2027 г., haridusportaal.edu.ee; Integratsiooni SA 11.12.2025: бесплатные курсы эстонского A1–B1.2 для постоянных жителей, проживших в Эстонии не менее 5 лет, и вернувшихся; HTM «Tasuta kõrgharidus»: очная учёба по эстоноязычной программе бесплатна. Марина, Тоомас и письмо — учебные.',
      groups: 'Крючок — все сразу. Чат и вопросы — каждый сам, сверка в паре. План — каждый свой; письмо начинают каждый сам. Ролевая игра: один — работник, другой — руководитель с вашей карточкой; в 1:1 руководитель — вы.',
      errors: [
        '«Õppepuhkuse kasutamine tuleb teatada» → «Õppepuhkuse kasutamisest tuleb teatada» (teatama millest).',
        '«õppijad» / «õpijad» → «õppijad» (-ja от основы ma-инфинитива: õppima → õppija).',
        '«Seoses õppimine» → «Seoses õppimisega» (seoses millega).',
        'В письме «Ma tahan puhkust» → «Palun võimaldada mulle õppepuhkust …» / «Kas oleks võimalik …?» (вежливо, тингив).',
      ],
      notes: [
        'Формат — квест: четыре контрольных пункта, в конце — личная карточка «Minu õpitee järgmine samm» (продукт модуля, она нужна на экзамене 035). Ученику без работы: письмо — карьерному консультанту Töötukassa с просьбой о встрече; пенсионеру — бесплатные курсы и библиотека; студенту — бесплатная учёба и вычет за курсы; маме в декрете — онлайн-курсы и курсы эстонского.',
        'Цифры не придумывайте и не обещайте: правила меняются. Если ученик спросит «а мне положено?», ответ: «Kontrolli ametlikult lehelt või küsi nõustajalt» — именно этому учит карточка «Kas teadsid?».',
        'Обратная связь, 2–3 цели: -mine / -ja формы и их падежи (õppimise ajal, seoses õppimisega); вежливая просьба в письме; ясные даты и сумма.',
      ],
    },
    discover: [
      station(B.text('034_d_hook', 'Kontrollpunkt 1: üks aasta ja null eurot', 'Kujuta ette: sul on üks aasta ja null eurot. Mida sa tahaksid õppida — keelt, ametit, arvutit või midagi muud? Kes võiks selle eest maksta: sina, tööandja või riik? Vasta kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('034_d_talk', 'Õppimine ja raha.', 'Vasta ja too näide oma elust.', [
        'Mis on kõige kallim kursus või kool, mille eest sina või su pere on maksnud? Kas see tasus ära?',
        'Kas sinu kodumaal maksab täiskasvanu õppimise eest riik, tööandja või inimene ise? Mis sa arvad, mis on õige?',
      ], [150, 210], ['Ma maksin …', 'Minu eest maksis …', 'See tasus ära, sest …']), 'Sinu kogemus näitab, mida sa juba tead ja mida pead veel teada saama.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt. Ära paranda. Kui õpilane ei tööta: „Kas sinu pere maksis sinu või sinu lapse kooli, kursuse või huviringi eest?”')),
      station(tag(B.vocab('034_d_vocab', 'Enne lugemist: sõnad.', ['õppepuhkus — учебный отпуск', 'koolitus — обучение (курсы)', 'koolituskulu — расходы на обучение', 'tuludeklaratsioon — налоговая декларация', 'maha arvama — вычитать', 'tööandja — работодатель', 'taotlus — заявление', 'taotlema — подавать заявление', 'teatama — сообщать', 'tasuta — бесплатно']), { topic: ['õppepuhkus', 'koolituskulu'] }), 2, 15),
      purpose(B.dialogue('034_d_chat', 'Kontrollpunkt 2: töökaaslaste vestlus.', 'Loe vestlust: kes võiks Marina kursuse eest maksta?', 'Marina', 'Toomas', [
        ['A', 'Toomas, ma tahan märtsis minna raamatupidamise kursusele, aga see maksab 900 eurot. Kas firma maksab?'],
        ['B', 'Küsi juhilt. Kui koolitus on tööga seotud, maksab firma sageli ise. Sul on igal juhul õigus õppepuhkusele.'],
        ['A', 'Õppepuhkusele? Mis asi see on?'],
        ['B', 'Vaata, siin on seaduses kirjas: kuni 30 kalendripäeva aastas. Kui õpid koolis või tööga seotud kursusel, saad 20 päeva eest oma keskmist palka. „Õppepuhkuse kasutamisest teatab töötaja tööandjale vähemalt 14 kalendripäeva ette.”'],
        ['A', 'Ja kui firma kursuse eest ei maksa?'],
        ['B', 'Siis saad kevadel tuludeklaratsioonis osa tulumaksust tagasi. Maksuameti lehel on kirjas: „Koolituskulude, kingituste ja annetuste mahaarvamine on lubatud kokku kuni 1200 euro ulatuses.”'],
        ['A', 'Aga mu vend on töötu. Kas tema peab kõik ise maksma?'],
        ['B', 'Ei pea. Kui ta on töötuna arvel, aitab Töötukassa karjäärinõustaja tal koolituse leida ja koolituse eest võib maksta Töötukassa.'],
      ], 'g_read'), 'Vestlusest saad teada, mis sulle õppides seaduse järgi kuulub.'),
      tag(purpose(B.table('034_d_route', 'Mis on vestluses kirjas?', 'Vasta vestluse järgi 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Mitu päeva õppepuhkust võib töötaja aastas saada? | [30/kuni 30/30 päeva/kuni 30 päeva/kuni 30 kalendripäeva]',
        'Mitme päeva eest makstakse õppepuhkuse ajal keskmist palka? | [20/20 päeva/kahekümne päeva]',
        'Kui mitu päeva ette tuleb tööandjale õppepuhkusest teatada? | [14/14 päeva/vähemalt 14/vähemalt 14 päeva/14 kalendripäeva]',
        'Kus saab koolituskulu eest osa raha tagasi? | [tuludeklaratsioonis/tuludeklaratsiooniga]',
        'Kui palju saab koolituskulusid koos kingituste ja annetustega aastas maha arvata? | [1200 eurot/kuni 1200 eurot/1200]',
        'Kelle poole peaks töötu vend kõigepealt pöörduma? | [karjäärinõustaja poole/Töötukassa karjäärinõustaja poole/Töötukassa poole/karjäärinõustaja/Töötukassa]',
      ], 'g_read'), 'Vastused on sinu kaardi esimesed read: mis sulle õppides kuulub.'), { task: 'R19' }),
    ],
    practice: [
      station(B.notice('034_p_notice', 'Kontrollpunkt 3: -mine ja -ja ametlikus keeles', [
        'Vestlusest: „**Õppepuhkuse kasutamisest** teatab **töötaja** **tööandjale** …” · „Koolituskulude … **mahaarvamine** on lubatud …”',
        '**-mine** — tegevus kui asi: õppi**ma** → õppi**mine**, kasuta**ma** → kasuta**mine**, taotle**ma** → taotle**mine**. Omastav **-mise**: õppimise, kasutamise; osastav **-mist**.',
        '**-ja** — tegija: õppima → õpp**ija**, töötama → tööta**ja**, andma → **andja** (tööandja), taotlema → taotle**ja**, nõustama → nõusta**ja**.',
        'Ametlik tekst eelistab nimisõna, sõbrale ütled tegusõnaga: **Taotluse esitamine toimub veebis.** → **Taotluse saad esitada veebis.**',
        'Käändes nagu nimisõna: **seoses õppimisega** · **kursuse lõpetamise järel** · **teatama** millest: **kasutamisest**',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('034_p_letter', 'Marina õppepuhkuse taotlus.', 'Marina kirjutab juhile ametliku taotluse. Kirjuta sulgudes olev tegusõna -mine- või -ja-sõnaks õiges vormis.', [
        'Seoses [õppimisega] raamatupidamise kursusel palun mulle õppepuhkust 10.–14. märtsini. (õppima)',
        'Kursuse [lõpetamise] järel saan teha ka meie osakonna raamatupidamise töid. (lõpetama)',
        'Koolitus on otseselt seotud minu tööülesannete [täitmisega]. (täitma)',
        'Lisan kirjale koolitusasutuse teatise ja kursuse [toimumise] ajad. (toimuma)',
        'Palun kinnitage õppepuhkuse [andmine] hiljemalt järgmiseks reedeks. (andma)',
        'Kursusel on kokku kaksteist [õppijat] Harjumaa eri firmadest. (õppima)',
        'Samal kursusel osaleb ka kaks [töötajat] meie laost. (töötama)',
      ], '', 'full', 'g_notice'), 'Ametlik kiri kõlab nii, nagu tööandja ootab; selleks peab vorm olema õige.'), { task: 'G09' }),
      'Pärast iga lauset küsi: „Kuidas sa ütleksid seda sõbrale?” (Seoses õppimisega → Kuna ma õpin …). Nii näeb õpilane, et sama mõtet saab öelda kahel viisil. Read 6 ja 7: pärast arvu ainsuse osastav (kaksteist õppijat, kaks töötajat).'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('034_t_cards', 'Kontrollpunkt 4: kes veel aitab?', 'Loe kaarte ja märgi, milline sobib sulle või sinu pereliikmele.', [
        ['Tasuta tööalased kursused', ['riik maksab 2027. aasta lõpuni umbes 33 000 inimese kursuse eest', 'eelkõige neile, kellel pole erialast haridust või kelle oskused on vananenud', 'info: haridusportaal.edu.ee'], []],
        ['Töötukassa', ['karjäärinõustamine on tasuta kõigile', 'koolituskaart töötajale, kelle oskused on vananenud või kes võib töö kaotada', 'töötuna arvel olijale koolitus Töötukassa kaudu'], []],
        ['Eesti keel', ['Integratsiooni Sihtasutuse kursused A1–B1.2 on tasuta', 'püsielanikule, kes on Eestis elanud vähemalt viis aastat', 'eesti keele majas Tallinnas ja Narvas või veebis'], []],
        ['Ülikool', ['täiskoormusega õpe eestikeelsel õppekaval on tasuta', 'osakoormusega õppes võib kool küsida tasu', 'õppemaksu võib tuludeklaratsioonis maha arvata'], []],
      ], '2'), 'Kaardid näitavad teid, mida sinu tuttavad ehk veel ei tea.'), { task: 'R07' }), 4, 15, { final: 'plan' }),
      B.know('034_t_know', ['Reeglid muutuvad, seepärast kontrolli enne otsust ametlikku lehte. Õppepuhkus on kirjas täiskasvanute koolituse seaduses, koolituskulu mahaarvamine Maksu- ja Tolliameti lehel, tasuta kursused haridusportaalis ja Töötukassa lehel. Koolituskulu saab maha arvata ainult siis, kui koolitaja on Eesti Hariduse Infosüsteemis registreeritud.'], 'täiskasvanute koolituse seadus § 13; Maksu- ja Tolliamet, „Koolituskulu” (18.05.2026); Haridus- ja Teadusministeerium, „Riik pakub tasuta tööalaseid koolitusi ligi 33 000 inimesele” (12.10.2026); Integratsiooni Sihtasutus (11.12.2025); Töötukassa, minukarjaar.ee', 'Kas teadsid? Kontrolli allikast'),
      teach(tag(purpose(B.planning('034_t_plan', 'Minu õpitee järgmine samm.', 'Täida oma kaart. Kasuta tunni vestlust ja kaarte. Kui sa ei tööta, kirjuta, kes sind aitab (Töötukassa, pere, tasuta kursus).', [
        'Mida ma tahan järgmisena õppida ja miks?',
        'Kus ja millal: kool, kursus või veeb; mitu nädalat?',
        'Kes maksab ja mis mulle seadusega kuulub (õppepuhkus, maksutagastus, tasuta koht)?',
        'Minu esimene samm sel nädalal, selle tähtaeg ja kellele ma sellest räägin?',
      ], 3), 'Kaart jääb sulle: sellest räägid mooduli kontrollis ja selle järgi kirjutad kodus kirja.'), { task: 'W11', level: 3 }),
      'Kaart on mooduli tulemus (vaja tunnis 035, sõnavõtt 1 minut). Kontrolli, et igal real oleks päris asi: kursuse nimi või valdkond, kuupäev, maksja. Väsinud õpilasele: kolm rida, mitte rohkem. Seejärel suuliselt kirja plaan ja kaks esimest lauset.'),
      extension(teach(tag(purpose(B.rolecards('034_t_more', 'Rollimäng: räägi juhiga', 'Räägi juhiga ja lepi kokku õppepuhkus ning see, kes maksab kursuse eest.',
        'Olukord: tahad märtsis minna viieks päevaks kursusele, mis on seotud sinu tööga; töökoormus on suur.\nSinu eesmärk: saada õppepuhkus ja vähemalt osa kursuse hinnast tööandjalt.\nPiirang: märts on firmas kiire kuu.',
        'Juhi kaart on õpetajal: tema mured ja üks pakkumine.',
        ['Seaduse järgi on mul õigus …', 'Kas oleks võimalik …?', 'Kursuse lõpetamise järel saaksin …'], ['Märtsis on meil …', 'Kui sa …, siis firma võiks …', 'Ma pean seda arutama …']), 'Juhiga kokkulepe säästab sind pikast kirjavahetusest.'), { task: 'S03', level: 4 }),
      'Kui aega jääb (12 min). Sina oled juht. Varjatud info: firma eelarves on koolituseks 500 eurot inimese kohta; märtsis on aastaaruanne; sa ei tea, et õppepuhkus on seaduses. Takistused ükshaaval: 1) „Märtsis ei saa keegi puhkusele minna.” (Tööandja võib õppepuhkuse edasi lükata ainult töökorraldusliku hädavajaduse korral.) 2) „Miks peaks firma sinu kursuse eest maksma?” 3) Paku: firma maksab poole, kui jääd firmasse veel aastaks. Õnnestunud, kui õpilane viitab seadusele (30 päeva, 20 päeva palgaga), pakub kompromissi, kasutab vähemalt kaks -mine-sõna (kursuse lõpetamise järel, õppimise ajal) ja lepib kokku kuupäevad ja summa.'), 12),
      tag(exitCheck(purpose(B.gaps('034_t_exit', 'Kontrolli end: kolm ametlikku sõna.', 'Kirjuta sulgudes olev tegusõna -mine- või -ja-sõnaks õiges vormis.', [
        'Õppepuhkuse [taotlemine] võttis veebis aega ainult viis minutit. (taotlema)',
        'Tasuta keelekursustel on igal aastal sadu uusi [õppijaid]. (õppima)',
        'Järgmisel nädalal räägin oma plaanist Töötukassa [nõustajaga]. (nõustama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas -mine- ja -ja-sõnad on käes.')), {}),
      purpose(B.selfcheck('034_t_self', ['Ma räägin, mida ma tahaksin õppida ja kes selle eest maksaks.', 'Ma leian vestlusest ja kaartidelt, mis mulle õppides kuulub: õppepuhkus, maksutagastus, tasuta kursused.', 'Ma saan aru -mine- ja -ja-sõnadest ja ütlen ametliku lause lihtsalt.', 'Ma kirjutan tööandjale õppepuhkuse taotluse.'], 'Rada läbitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      teach(tag(homeTask(purpose(B.letter('034_t_letter', 'Õppepuhkuse taotlus: tunnis algus, kodus lõpp.', 'Tunnis: plaan suuliselt ja kaks esimest lauset. Kodus: kiri tööandjale lõpuni — mida ja millal õpid, miks see on tööga seotud, mitu päeva õppepuhkust soovid ja kas firma võiks kursuse eest maksta. Kui sa ei tööta, kirjuta Töötukassa karjäärinõustajale ja palu kohtumist.', 'Lugupeetud …!', 'Lugupidamisega\n(sinu nimi)', [120, 150]), 'Juht loeb sinu kirja ja otsustab, kas ja kuidas firma sinu õppimist toetab.')), { task: 'W13', main: true, harno: 'W1' }),
      'Kodutöö. Järgmises tunnis loe kiri kui juht ja vasta suuliselt („Märtsis on meil küll kiire, aga …”). Tagasiside: -mine-sõnad (õppimise ajal, kursuse lõpetamise järel), viisakas palve tingivas kõneviisis (Kas oleks võimalik …?), selged kuupäevad ja summa.'),
      tag(homeTask(purpose(B.speaking('034_t_home', 'Kodus: sõnavõtt (1 minut).', 'Salvesta 1 minut nagu koosolekul: sinu õpitee järgmine samm.', [
        'Mida, kus ja millal sa õpid?',
        'Kes maksab ja mis on sinu esimene samm?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S16' }),
      homework('034_t_homework', ['1. Õppepuhkuse taotlus, 120–150 sõna (ülesanne lehel).', '2. Sõnavõtt 1 minut, salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-035': {
    title: 'Kontroll 7 — õppimine ja haridus',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 7, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 7, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 7, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid hariduse ja õppimise teemal, kirjutan umbes 140-sõnalise kirja ja 180-sõnalise kokkuvõtte andmetest ning räägin 1 minuti oma õpitee järgmisest sammust; rektsioon, kaudne ja tingiv kõneviis ning -mine-sõnad on õiged.',
    // Kontroll 7 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2a; S1, S2). Own texts on the module's content: the school choice after
    // grade 9 (031), how people learn (032), a new profession as an adult (033), who pays (034); timed by the Harno part
    // headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('035_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('035_d_vocab', 'Tunnid 31–34: sõnad, mis aitavad', ['gümnaasium — гимназия', 'kutsekool — профессиональное училище', 'kandideerima — поступать', 'uuring — исследование', 'meenutama — вспоминать', 'ümberõpe — переобучение', 'kogemus — опыт', 'kahetsema — сожалеть', 'tasuta — бесплатно', 'taotlus — заявление'], '2'), { topic: ['kutsekool', 'ümberõpe'] }),
      PART('035_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('035_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe arvamusartiklit ja vasta kahele küsimusele. Seejärel lahenda osad 1 ja 2.', 'Kutsekool ei ole plaan B', [
        '(A) Igal kevadel kuulen sama lauset: „Kui gümnaasiumi ei saa, läheb kutsekooli.” Nii räägivad vanemad, mõnikord ka õpetajad, ja lõpuks usuvad seda noored ise. Kutsekoolist on paljude silmis saanud varuplaan, koht neile, kellel „ei läinud hästi”. Minu arvates on see üks kõige kahjulikumaid müüte Eesti hariduses, sest see ei aita ei noori ega tööturgu. Kuulen seda lauset isegi täiskasvanutelt, kes on ise kunagi kutsekooli lõpetanud ja oma ametis edukad.',
        '(B) Numbrid näitavad, et valik on tõesti ühekülgne. Statistikaameti andmetel jätkas 2020. aastal põhikooli lõpetanutest 71 protsenti õpinguid gümnaasiumis ja 25 protsenti kutsekeskhariduses. Gümnaasiumi läks 82 protsenti tüdrukutest, kuid ainult 61 protsenti poistest. Kutsekooli läksid poisid rohkem kui kaks korda sagedamini kui tüdrukud. Kas poisid on tõesti nii palju vähem võimekad? Vaevalt. Need arvud ei ütle, et keegi valis valesti. Küll aga panevad nad küsima, kas noored valivad oma huvide järgi või selle järgi, mida peetakse „korralikuks”.',
        '(C) Mõnikord on põhjus lihtsalt teadmatus. Paljud vanemad ei tea, et kutsekoolis saab samal ajal omandada nii ameti kui ka keskhariduse ning et kutsekeskharidusega võib edasi kõrgkooli kandideerida. Nad mäletavad aega, mil kutsekool tähendas tõesti kitsast teed. Tänapäeva kutsekoolis õpitakse aga ka IT-süsteeme, logistikat ja tervishoiu erialasid ning praktika toimub päris ettevõtetes. Mõnel erialal õpitakse suur osa ajast otse töökohal, kus õpilane on juba päris meeskonna liige.',
        '(D) Teine põhjus on hirm. Viieteistkümneaastane ei tea sageli veel, millest ta päriselt huvitub, ja vanem kardab, et vale valik sulgeb uksed. Seepärast tundub gümnaasium turvaline: otsuse võib kolm aastat edasi lükata. Edasilükkamine ei ole aga alati turvaline. Kui noor istub kolm aastat tundides, mis teda ei huvita, võib ta õppimisest hoopis loobuda. Ma tean noori, kes vahetasid kooli alles pärast esimest gümnaasiumiaastat, kui olid juba kaotanud usu endasse. Viieteistkümneaastase elus on üks kaotatud aasta väga pikk aeg. Statistikaameti analüüsi järgi ei olnud viie aastaga keskharidust omandanud 18 protsenti tollastest põhikooli lõpetajatest.',
        '(E) Kolmandaks unustame, et kutsekool ei ole ainult noorte kool. Seal õpib ka palju täiskasvanuid, kes tulevad ametit vahetama või oskusi uuendama, sageli õhtuti või töö kõrvalt. Sageli on just täiskasvanud õpilased kõige motiveeritumad, sest nad teavad täpselt, miks nad õpivad. Mõni neist istub koolipingis juba teist või kolmandat korda ja ei häbene seda sugugi. Nende kõrval õppides näeb noor, et õppimine ei lõpe kunagi ja et viieteistkümneaastaselt tehtud valik ei ole valik kogu eluks.',
        '(F) Mida siis teha? Esiteks võiks iga pere enne otsust käia vähemalt ühe gümnaasiumi ja ühe kutsekooli avatud uste päeval. Teiseks tasub kasutada karjäärinõustajat: Töötukassa nõustamine on tasuta ja aitab noorel oma huve sõnadesse panna. Kolmandaks peaksid täiskasvanud oma sõnu valima. Lause „kui gümnaasiumi ei saa” ütleb lapsele, et üks tee on hea ja teine halb. Neljandaks võiksid koolid rohkem rääkida oma vilistlastest: kus nad täna töötavad ja kuidas nende tee on läinud.',
        '(G) Ma ei väida, et kutsekool sobib kõigile. Mõnele noorele on gümnaasium ja ülikool just õige tee. Iga amet, mida tehakse hästi ja hea meelega, väärib aga austust. Aga valik peaks sõltuma noore huvidest ja võimetest, mitte vanemate hirmust ega naabrite arvamusest. Kui me räägiksime kutseharidusest sama lugupidavalt kui ülikoolist, teeksid noored julgemaid ja paremaid otsuseid. Kutsekool ei ole plaan B. See on lihtsalt teine plaan.',
        'Allikas: autori arvamus; arvud: Statistikaamet (19.09.2025).',
      ].join('\n\n'), [['Mida tahab autor öelda lausega „Kutsekool ei ole plaan B”?', 'kutsekool on võrdne valik|kutsekool ei ole halvem valik|kutsekool on teine plaan, mitte halvem'], ['Millise tee valisid sina või valiks sinu laps? Miks?']]),
      tag(B.choice('035_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Milleks peavad paljud artikli alguse järgi kutsekooli?', 'varuplaaniks neile, kellel ei läinud hästi', 'kõige paremaks kooliks', 'kooliks ainult täiskasvanutele', 'kooliks, kus ei ole praktikat'],
        ['Mida näitavad lõigu B arvud autori sõnul?', 'et valik on ühekülgne', 'et noored valisid valesti', 'et kutsekoolides on liiga vähe kohti', 'et tüdrukud ei taha õppida'],
        ['Mida paljud vanemad lõigu C järgi ei tea?', 'et kutsekoolist saab ka keskhariduse', 'et gümnaasium kestab kolm aastat', 'et põhikool on kohustuslik', 'et kutsekoolis õpitakse ainult käsitööd'],
        ['Miks ei ole otsuse edasilükkamine autori arvates alati turvaline?', 'noor võib õppimisest loobuda', 'gümnaasiumis on liiga palju õpilasi', 'kutsekooli ei saa hiljem minna', 'gümnaasium on kallis'],
        ['Millist nõu autor lugejatele EI anna?', 'otsustada naabrite arvamuse järgi', 'käia avatud uste päevadel', 'kasutada karjäärinõustajat', 'valida sõnu hoolikalt'],
        ['Millega oleks autor kõige rohkem nõus?', 'valik peaks sõltuma noore huvidest, mitte hirmust', 'kõik noored peaksid minema kutsekooli', 'gümnaasium on alati parem valik', 'täiskasvanud ei peaks kutsekoolis õppima'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('035_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Kutsekoolist räägitakse kui varuplaanist. | [A]',
        '2. Poisid ja tüdrukud valivad erinevalt. | [B]',
        '3. Vanemate pilt kutsekoolist on vananenud. | [C]',
        '4. Kõik ei jõua viie aastaga keskhariduseni. | [D]',
        '5. Noored ja täiskasvanud õpivad samas koolis. | [E]',
        '6. Nõustamine aitab noorel oma huve sõnastada. | [F]',
        '7. Autor ei pea kutsekooli kõigile sobivaks. | [G]',
        '8. Gümnaasium tundub turvaline, sest otsuse saab edasi lükata. | [D]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.cloze('035_d_cloze', 'Osa 3: vali lünka sobiv vorm (10 punkti).', 'Täiskasvanud õppija kirjutab koolitusjuhile. Vali iga lünga neljast valikust see, mis sobib.', 'Kiri koolitusjuhile', [
        'Lugupeetud koolitusjuht!',
        'Kirjutan teile seoses {*õppimisega|õppima|õppides|õppimine} teie raamatupidamise kursusel. Olen kursusega väga {*rahul|rahulik|rahulolu|rahuldav}, eriti praktiliste ülesannetega.',
        'Paraku muutus minu töögraafik ja ma ei saa enam neljapäeviti {*tundidest|tunnid|tundidele|tundides} osa võtta. Kolleegi sõnul {*olevat|olema|olevad|olles} võimalik minna üle õhturühma.',
        'Kui see {*oleks|olema|olevat|olnud} võimalik, jätkaksin hea meelega teisipäeva õhtuti. Praegu valmistun hoolega {*lõpueksamiks|lõpueksamile|lõpueksamit|lõpueksami}.',
        'Kas õhturühma {*üleminek|üleminekut|üle minema|üleminekuga} maksab midagi lisaks? Õppepuhkuse {*taotlemiseks|taotlema|taotlemine|taotleja} vajan ka teie teatist.',
        'Palun andke teada, millest {*sõltub|sõltuma|sõltuvat|sõltunud} vaba koha saamine. Ootan teie {*vastust|vastuse|vastus|vastusega}.',
        'Lugupidamisega\nõppija Galina Smirnova',
      ].join('\n\n'), 'g_notice'), { task: 'R03', harno: 'R3' }),
      tag(B.gaps('035_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe Igori lugu „Kuidas ma 50-aastaselt uuesti kooli läksin”. Vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Viis aastat tagasi töötasin laos ja arvasin, et õppimine on minu jaoks läbi. [Siis suleti meie ladu ja ma jäin tööta.]',
        'Töötukassas soovitati mul minna karjäärinõustaja juurde. [Seal sain aru, et mu oskustest on rohkem kasu, kui arvasin.]',
        'Nõustaja küsis, mida ma vabal ajal teen. [Ütlesin, et parandan naabrite jalgrattaid ja muruniidukeid.]',
        'Nii jõudsin kutsekooli väikemootorite kursusele. [Esimesel päeval istusin klassis koos kaheksateistkümneaastastega.]',
        'Alguses oli mul piinlik. [Noored aga küsisid minult varsti nõu, sest mul oli kogemust.]',
        'Täna töötan oma töökojas. [Kui ma oleksin hirmu kuulanud, istuksin ikka veel kodus.]',
      ], ['Siis suleti meie ladu ja ma jäin tööta.', 'Seal sain aru, et mu oskustest on rohkem kasu, kui arvasin.', 'Ütlesin, et parandan naabrite jalgrattaid ja muruniidukeid.', 'Esimesel päeval istusin klassis koos kaheksateistkümneaastastega.', 'Noored aga küsisid minult varsti nõu, sest mul oli kogemust.', 'Kui ma oleksin hirmu kuulanud, istuksin ikka veel kodus.', 'Seepärast otsustasin, et kooli ma enam kunagi ei lähe.'], 'full', 'g_read'), { task: 'R16', harno: 'R4' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('035_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('035_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 31–34. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('035_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Tuttav saatis sulle oma sõnumid enne ärasaatmist. Igas sõnumis on üks viga: kirjuta sõnum õigesti.', [
        ['Mu tütar kandideerib sel kevadel kutsekoolis.', 'Mu tütar kandideerib sel kevadel kutsekooli.'],
        ['Õpetaja sõnul olema vahedega kordamine kõige tõhusam.', 'Õpetaja sõnul olevat vahedega kordamine kõige tõhusam.|Õpetaja sõnul on vahedega kordamine kõige tõhusam.'],
        ['Kui mul oleks aega, ma õpin õhtuti.', 'Kui mul oleks aega, õpiksin ma õhtuti.|Kui mul oleks aega, õpiksin õhtuti.'],
        ['Õppepuhkuse kasutamine tuleb tööandjale ette teatada.', 'Õppepuhkuse kasutamisest tuleb tööandjale ette teatada.'],
        ['Ma olen väga mures poja hinnete eest.', 'Ma olen väga mures poja hinnete pärast.|Olen väga mures poja hinnete pärast.'],
        ['Valmistun eksamile juba kolm nädalat.', 'Valmistun eksamiks juba kolm nädalat.|Ma valmistun eksamiks juba kolm nädalat.'],
      ]),
      B.transformation('035_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle sama mõte teisiti, kasutades antud sõnu.', [
        ['Väidetakse, et kohv aitab õppida.', 'aitavat', 'Kohv aitavat õppida.'],
        ['Mul ei ole diplomit, seepärast ei saa ma seda tööd.', 'kui mul oleks', 'Kui mul oleks diplom, saaksin ma selle töö.|Kui mul oleks diplom, saaksin selle töö.'],
        ['Taotluse esitamine toimub veebis.', 'saad esitada', 'Taotluse saad esitada veebis.|Sa saad taotluse esitada veebis.|Taotluse saad veebis esitada.|Sa saad taotluse veebis esitada.'],
        ['Autod pakuvad lapsele väga suurt huvi.', 'huvitub', 'Laps huvitub väga autodest.|Laps huvitub autodest väga.'],
        ['Otsus oleneb hinnetest ja huvidest.', 'sõltub', 'Otsus sõltub hinnetest ja huvidest.'],
        ['Inimesed, kes kursusel õpivad, saavad tunnistuse.', 'õppijad', 'Kursusel õppijad saavad tunnistuse.|Kursuse õppijad saavad tunnistuse.'],
      ]),
      PART('035_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('035_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuulad nelja lühikest teadet, igaüht ainult üks kord. Kirjuta igasse lünka 1–2 sõna.', [
        '1. Tähelepanu! Kutsekooli avatud uste päev on laupäeval kella kümnest kaheni. Noored ja nende vanemad saavad erialasid proovida ja õpetajatega rääkida. Eelregistreerimist ei ole vaja.',
        '2. Raamatukogu pakub eakatele tasuta arvutikursust. Kursus algab märtsis ja toimub kolmapäeviti kell üksteist. Kohti on kaksteist, registreeruda saab telefoni teel.',
        '3. Meeldetuletus maksumaksjale: tuludeklaratsiooni saab esitada alates viieteistkümnendast veebruarist. Koolituskulud on deklaratsioonis juba eeltäidetud, aga kontrollige need üle.',
        '4. Keelekool teatab: registreerimine tasuta eesti keele kursustele algab esmaspäeval kell kümme. Kohad täituvad kiiresti, seepärast valige enne oma keeleoskuse tase ja linn.',
      ], [
        'Kutsekooli avatud uste päev lõpeb kell [kaks|14|14.00].',
        'Avatud uste päevale ei ole vaja [eelregistreerimist|registreeruda].',
        'Raamatukogu arvutikursus toimub [kolmapäeviti|kolmapäeval] kell üksteist.',
        'Raamatukogu kursusele saab registreeruda [telefoni teel|telefonitsi|telefoniga].',
        'Tuludeklaratsioonis on koolituskulud juba [eeltäidetud].',
        'Enne registreerimist tasub valida oma keeleoskuse [tase|taset] ja linn.',
      ]),
      tag(B.listening('035_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime täiskasvanute õppimisest. Stuudios on karjäärinõustaja Piret Mets. Piret, kes teie juurde kõige sagedamini tuleb?',
        'Piret: Kõige rohkem tuleb neljakümne- kuni viiekümneaastaseid. Paljud on töötanud ühes kohas kaua ja tunnevad, et nende oskused on vananenud.',
        'Saatejuht: Millega te alustate?',
        'Piret: Ma küsin alati, mis inimesele vabal ajal meeldib. Hobist saab sageli alguse uus amet. Seejärel vaatame koos tööturu andmeid.',
        'Saatejuht: Mis on kõige suurem takistus?',
        'Piret: Hirm. Inimesed kardavad, et nad on liiga vanad. Minu kogemus näitab aga, et täiskasvanu õpib hästi, kui ta teab, milleks ta õpib.',
        'Saatejuht: Kuidas leida aega?',
        'Piret: Tuleb planeerida väikeste osade kaupa. Pool tundi iga päev on parem kui terve pühapäev. Töötajal on ka õigus õppepuhkusele, kuni kolmkümmend päeva aastas.',
        'Saatejuht: Ja raha?',
        'Piret: Paljud kursused on tasuta, teiste eest saab osa raha tuludeklaratsiooniga tagasi. Kõigepealt tasub aga küsida tööandjalt.',
        'Saatejuht: Kas nõustamine maksab midagi?',
        'Piret: Ei. Töötukassa karjäärinõustamine on tasuta kõigile. Aega saab broneerida veebis või telefoni teel.',
        'Saatejuht: Aitäh, Piret!',
      ], [
        'Paljud kliendid on töötanud ühes kohas [kaua|väga kaua].',
        'Paljud tunnevad, et nende oskused on [vananenud].',
        'Nõustaja küsib alati, mis inimesele [vabal ajal] meeldib.',
        'Nõustaja sõnul saab uus amet sageli alguse [hobist].',
        'Kõige suurem takistus on nõustaja sõnul [hirm].',
        'Täiskasvanu õpib hästi, kui ta teab, [milleks] ta õpib.',
        'Pool tundi iga päev on parem kui terve [pühapäev].',
        'Töötaja võib saada õppepuhkust kuni [kolmkümmend|30] päeva aastas.',
        'Nõustamisele saab aega broneerida veebis või [telefoni teel|telefonitsi|telefoniga].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('035_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Nõustaja klientide seas on kõige rohkem kahekümneaastaseid.', false],
        ['Nõustaja alustab vestlust küsimusega inimese vaba aja kohta.', true],
        ['Tööturu andmeid vaadatakse alles pärast vaba ajast rääkimist.', true],
        ['Nõustaja arvates õpivad täiskasvanud alati halvemini kui noored.', false],
        ['Nõustaja soovitab õppida korraga pikalt, näiteks terve pühapäeva.', false],
        ['Nõustaja sõnul ei saa töötaja õppimiseks töölt vaba aega võtta.', false],
        ['Raha asjus soovitab nõustaja kõigepealt pöörduda tööandja poole.', true],
        ['Karjäärinõustamise eest tuleb maksta väike tasu.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('035_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('035_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad kutsekoolile kirja ja teed joonise põhjal kokkuvõtte. Sõnavõtus esitled mooduli tulemust: oma õpitee järgmist sammu, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own next step, built in 031–034
      B.planning('035_t_product', 'Mooduli tulemus: minu õpitee järgmine samm.', 'Võta tunni 34 kaart ja täienda seda. Kasuta mooduli tundide tulemusi.', ['Mida ma järgmisena õpin ja miks just see? (tund 33: kui ma …-ksin, …)', 'Kuidas ma õpin, et see meelde jääks? (tund 32: uuringu järgi …)', 'Kes maksab ja mis mulle kuulub? (tund 34: õppepuhkus, koolituskulu, tasuta kursus)', 'Mis on minu esimene samm ja millest see sõltub? (tund 31: sõltub millest)']),
      PART('035_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja kokkuvõtte eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('035_t_letter', 'Kirjutamine 1: kiri kutsekoolile (umbes 140 sõna).', 'Sinu 15-aastane laps (või naabri laps, keda sa aitad) tahab kandideerida kutsekooli, aga teil on küsimusi. Kirjuta kooli vastuvõtukomisjonile: kes sa oled, millisele erialale laps kandideerib, mida tahad teada (praktika, õpilaskodu, edasiõppimine) ja palu kohtumist.', 'Lugupeetud vastuvõtukomisjon!', 'Lugupidamisega', [125, 144]), { task: 'W13', harno: 'W1' }),
      B.chart('035_t_chart', 'Kuhu läksid 2020. aasta põhikooli lõpetajad? (%)', { kind: 'bar', unit: '%', series: ['Kõik', 'Tüdrukud', 'Poisid'], rows: ['Gümnaasium | 71 | 82 | 61', 'Kutsekeskharidus | 25 | 15 | 35'], source: 'Statistikaamet, „Viie aastaga jõuab Eesti kõrgkoolidesse 40% põhikooli lõpetajatest” (19.09.2025)' }),
      tag(B.writing('035_t_summary', 'Kirjutamine 2: kokkuvõte andmetest (umbes 180 sõna).', 'Kirjuta joonise põhjal kokkuvõte: mis on peamine, kuidas erinevad tüdrukute ja poiste valikud ning sinu kommentaar — mis võiks olla põhjus ja kas sellega tuleks midagi teha.', [14, 18], ['joonisel', 'võrreldes', 'seevastu', 'minu arvates'], 3), { task: 'W15', harno: 'W2a' }),
      PART('035_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('035_t_present', 'Rääkimine 1: sõnavõtt kursuse koosolekul (1 minut).', 'Teemakaart: kursuse koosolekul räägib igaüks oma õpitee järgmisest sammust. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mida sa järgmisena õpid ja miks?', 'Kus, millal ja kes maksab?', 'Mis võib sind takistada ja mida siis teed?', 'Paariline küsib: „Kas sa ei karda, et aega ei jätku?”', 'Kas täiskasvanu peaks õppima töö kõrvalt või võtma õppimiseks vaba aasta? Mis on kummagi varjukülg?', 'Mis teeb täiskasvanuna õppimise kõige raskemaks?'], [90, 120], ['Tahaksin rääkida oma järgmisest sammust …', 'Kui kõik läheb plaani järgi, …', 'Minu õppimine sõltub …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('035_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas õppimiskohustus 18-aastaseks saamiseni on hea mõte? Argumendid: noor ei jää ilma hariduseta; Statistikaameti andmetel ei olnud viie aastaga keskharidust 18 protsendil põhikooli lõpetajatest; omavalitsus peab aitama sobiva koha leida. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas õppimiskohustus 18-aastaseks saamiseni on hea mõte? Argumendid: kohustus ei tekita huvi; mõni noor tahab kohe tööle minna ja raha teenida; koolid peavad leidma juurde kohti ja õpetajaid. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks minu tuttav …', 'Ma saan aru, aga …'], ['Ma ei ole päris nõus, sest …', 'Teisalt …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('035_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: kes sa oled, eriala, küsimused ja palve, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Kokkuvõte: peamine suundumus, võrdlus arvudega, üldistus ja oma põhjendatud kommentaar, umbes 180 sõna (15 punkti).', 'Sõnavõtt: järgmine samm, maksja ja takistus 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('035_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, kokkuvõte 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 7 läbitud'),
    ],
  },
}, {
  'b1b2-031': 'PROB R→S', 'b1b2-032': 'AVAS L→S', 'b1b2-033': 'KUUL L→W', 'b1b2-034': 'LUGU R→W', 'b1b2-035': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 031
  '031_d_read': [
    '1. lõik: „Põhikool kestab üheksa aastat ja on kõigile kohustuslik.”',
    '1. lõik: põhikooli lõpetanu peab õppima, „kuni ta saab 18-aastaseks või omandab kesk- või kutsehariduse”.',
    '2. lõik: „71 protsenti õpinguid gümnaasiumis”.',
    '2. lõik: kutsekoolis „saab omandada ka keskhariduse”.',
    '3. lõik: „Töötukassa karjäärinõustajad aitavad tasuta oma huve ja võimalusi kaardistada”.',
    '4. lõik: hindeid ja teateid näeb „e-päevikus, näiteks eKoolis või Stuudiumis”.',
  ],
  '031_p_letter': [
    'kandideerima kuhu → sisseütlev: teie kooli.',
    'huvituma millest → seestütlev: autode remondist.',
    'keskenduma millele → alaleütlev: lõpetamisele.',
    'sõltuma millest → seestütlev: hinnetest.',
    'mures mille pärast → omastav + pärast: hinnete pärast (mitte „eest”).',
    'valmis milleks → saav: praktikaks (nagu pikkadeks päevadeks).',
    'unistama millest → seestütlev: töökojast.',
  ],
  '031_t_voice': [
    'Olga: „Ta tahab minna kutsekooli autotehnikuks õppima.”',
    'Olga: „Ma arvan, et gümnaasium annab rohkem võimalusi.”',
    'Olga: „Matemaatika on tal hea.”',
    'Olga: „Kutsekoolis on praktika ettevõttes.”',
    'Olga: kutsekool on „bussiga tund aega”.',
    'Olga: „Kandideerida tuleb mais.”',
  ],
  '031_t_exit': [
    'kandideerima kuhu → sisseütlev: gümnaasiumi.',
    'sõltuma millest → seestütlev, mitmus: huvidest.',
    'mures mille pärast → omastav, mitmus: hinnete pärast.',
  ],
  // 032
  '032_d_radio': [
    'Vale: „tõendeid selle kohta ei leitud”.',
    'Vale: „Kõige vähem kasu oli ülelugemisest ja allajoonimisest.”',
    'Pille: vahedega õppijad mäletasid nelikümmend seitse protsenti, ühe korraga õppijad kolmkümmend seitse.',
    'Vale: „nädala pärast on suur osa ununenud”.',
    'Pille: „Pane raamat kinni ja küsi endalt …”',
  ],
  '032_p_rumour': [
    'aitama → aitavat: väide on sõbra oma, mitte sinu.',
    'Eitus kaudses kõneviisis: ei + -vat → ei saavat.',
    'jätma → jätvat (meelde jätma).',
    'kasutama → kasutavat.',
    'olema → olevat.',
    'Allikaga („uuringu järgi”) on tegusõna tavaline: aitab.',
    'Allikaga („teadlase sõnul”) on tegusõna tavaline: tasub meenutada.',
  ],
  '032_t_exit': [
    'olema → olevat (keegi teine väidab).',
    'aitama → aitavat.',
    'saama → saavat.',
  ],
  // 033
  '033_d_podcast': [
    'Aleksei: „Siis jäi selg haigeks.”',
    'Aleksei: „Nõustaja küsis, mida ma vabal ajal teen.”',
    'Aleksei: „parandan kõigi naabrite arvuteid”.',
    'Kersti: „viimased kaks aastat töö kõrvalt”.',
    'Kersti: „Kõige raskem oli julgus.”',
    'Kersti: „aitas mind palju elukogemus”.',
    'Aleksei: „Mine nõustaja juurde, see on tasuta.”',
  ],
  '033_t_calls': [
    'Rein: „õppisin õhtuti pärast tööd”.',
    'Rein: „Esimene aasta oli väga raske.”',
    'Rein: „Nüüd töötan elektrikuna ja teenin rohkem kui varem.”',
    'Tatjana: „pidin poole aasta pärast lõpetama”.',
    'Tatjana: „Mu ema jäi haigeks ja ühe palgaga me hakkama ei saanud.”',
    'Tatjana: „Ma ei kahetse, et proovisin.”',
  ],
  '033_p_ifs': [
    'Kui + tingiv (oleks), pealauses ka tingiv: saaksin; diplom on olema-lause alus (nimetav).',
    'Kui ma oskaksin …, ei kardaks ma … — eituses ei + -ks.',
    'Kui mu lapsed oleksid …, oleks mul … — mõlemas lauseosas tingiv.',
    'Minevik: oleksin käinud …, oleksin teadnud (oleks + -nud).',
    'Kui tööandja maksaks …, alustaksin.',
    'Kui mu mees toetaks …, oleks mul kergem (või: ei oleks raske).',
    'Nõu tingivas: sa võiksid + da-tegevusnimi (küsida).',
  ],
  '033_t_exit': [
    'Kui-lause tingivas → pealauses tingiv: õpiksin.',
    'Kui-lauses tingiv: oleks.',
    'Pehme nõu: võiksid.',
  ],
  // 034
  '034_d_route': [
    'Toomas: „kuni 30 kalendripäeva aastas”.',
    'Toomas: „saad 20 päeva eest oma keskmist palka”.',
    'Seadus: „vähemalt 14 kalendripäeva ette”.',
    'Toomas: „saad kevadel tuludeklaratsioonis osa tulumaksust tagasi”.',
    'Maksuamet: „kokku kuni 1200 euro ulatuses”.',
    'Toomas: „aitab Töötukassa karjäärinõustaja tal koolituse leida” — pöörduma kelle poole.',
  ],
  '034_p_letter': [
    'seoses millega → -mise + -ga: õppimisega.',
    '-mine omastavas + järel: lõpetamise järel.',
    'seotud millega → kaasaütlev: täitmisega.',
    'kursuse toimumise ajad → omastav: toimumise.',
    'kinnitage mida → -mine nimetavas (käsu järel täissihitis): andmine.',
    'Arvu järel ainsuse osastav: kaksteist õppijat (-ja: õppima → õppija).',
    'Arvu järel ainsuse osastav: kaks töötajat (töötama → töötaja).',
  ],
  '034_t_exit': [
    'taotlema → taotlemine (lause alus, nimetav).',
    'sadu + mitmuse osastav: õppijaid.',
    'nõustama → nõustaja; rääkima kellega → kaasaütlev: nõustajaga.',
  ],
  // 035
  '035_d_read': [
    '(G) lõik: kutsekool „on lihtsalt teine plaan” — mitte halvem valik.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '035_d_mc': [
    '(A) lõik: kutsekoolist on „saanud varuplaan, koht neile, kellel „ei läinud hästi””.',
    '(B) lõik: „Numbrid näitavad, et valik on tõesti ühekülgne.”',
    '(C) lõik: „kutsekoolis saab samal ajal omandada nii ameti kui ka keskhariduse”.',
    '(D) lõik: „võib ta õppimisest hoopis loobuda”.',
    '(G) lõik: valik ei tohiks sõltuda „naabrite arvamusest”; teisi soovitusi annab lõik F.',
    '(G) lõik: „valik peaks sõltuma noore huvidest ja võimetest, mitte vanemate hirmust”.',
  ],
  '035_d_para': [
    '(A): kutsekoolist on saanud „varuplaan”.',
    '(B): gümnaasiumi läks 82 % tüdrukutest ja 61 % poistest.',
    '(C): vanemad „mäletavad aega, mil kutsekool tähendas tõesti kitsast teed”.',
    '(D): 18 % ei olnud viie aastaga keskharidust omandanud.',
    '(E): „Seal õpib ka palju täiskasvanuid.”',
    '(F): nõustamine „aitab noorel oma huve sõnadesse panna”.',
    '(G): „Ma ei väida, et kutsekool sobib kõigile.”',
    '(D): „otsuse võib kolm aastat edasi lükata”.',
  ],
  '035_d_cloze': [
    'seoses millega → kaasaütlev: õppimisega.',
    'rahul millega: olen rahul (omadussõna).',
    'osa võtma millest → seestütlev: tundidest.',
    'Kolleegi sõnul + kaudne kõneviis: olevat.',
    'Kui-lauses tingiv: oleks (pealauses jätkaksin).',
    'valmistuma milleks → saav: eksamiks.',
    'Lause alus nimetavas: üleminek (maksab).',
    '-mine + saav (milleks?): taotlemiseks.',
    'Kaudne küsimus tavalise tegusõnaga: millest sõltub.',
    'ootama tahab osastavat: vastust.',
  ],
  '035_d_bank': [
    'Õppimine „läbi” → mis juhtus: ladu suleti.',
    'Karjäärinõustaja juurde → mida seal mõistis.',
    'Küsimus vaba aja kohta → vastus: parandan jalgrattaid.',
    'Kursusele jõudmine → esimene päev noorte keskel.',
    'Piinlik → aga noored küsisid nõu.',
    'Täna töökojas → kui ma oleksin hirmu kuulanud … Üle jääb lause „kooli ma enam ei lähe”, mis ei sobi loo mõttega.',
  ],
  '035_p_fix': [
    'kandideerima kuhu → sisseütlev: kutsekooli.',
    'Õpetaja sõnul + kaudne kõneviis olevat (või tavaline on); olema on tegevusnimi.',
    'Kui-lause tingivas → pealauses ka tingiv: õpiksin.',
    'teatama millest → seestütlev: kasutamisest.',
    'mures mille pärast → hinnete pärast.',
    'valmistuma milleks → saav: eksamiks.',
  ],
  '035_p_trans': [
    'Väidetakse, et … → kaudne kõneviis: aitavat.',
    'Kui mul oleks diplom, saaksin … — tingiv mõlemas osas.',
    'Ametlik -mine-lause → tegusõnaga: saad esitada.',
    'huvituma millest → seestütlev: autodest.',
    'sõltuma millest → seestütlev: hinnetest ja huvidest.',
    '-ja-sõna: kes õpivad → õppijad.',
  ],
  '035_p_notes': [
    'Teade 1: „kella kümnest kaheni”.',
    'Teade 1: „Eelregistreerimist ei ole vaja.”',
    'Teade 2: kursus toimub „kolmapäeviti kell üksteist”.',
    'Teade 2: „registreeruda saab telefoni teel”.',
    'Teade 3: „Koolituskulud on deklaratsioonis juba eeltäidetud.”',
    'Teade 4: „valige enne oma keeleoskuse tase ja linn”.',
  ],
  '035_p_listen': [
    'Piret: „Paljud on töötanud ühes kohas kaua.”',
    'Piret: „nende oskused on vananenud”.',
    'Piret: „mis inimesele vabal ajal meeldib”.',
    'Piret: „Hobist saab sageli alguse uus amet.”',
    'Piret: „Hirm.”',
    'Piret: „kui ta teab, milleks ta õpib”.',
    'Piret: „Pool tundi iga päev on parem kui terve pühapäev.”',
    'Piret: „kuni kolmkümmend päeva aastas”.',
    'Piret: „Aega saab broneerida veebis või telefoni teel.”',
  ],
  '035_p_tf': [
    'Vale: kõige rohkem tuleb „neljakümne- kuni viiekümneaastaseid”.',
    'Õige: „Ma küsin alati, mis inimesele vabal ajal meeldib.”',
    'Õige: „Seejärel vaatame koos tööturu andmeid.”',
    'Vale: „täiskasvanu õpib hästi, kui ta teab, milleks ta õpib”.',
    'Vale: „Pool tundi iga päev on parem kui terve pühapäev.”',
    'Vale: „Töötajal on ka õigus õppepuhkusele.”',
    'Õige: „Kõigepealt tasub aga küsida tööandjalt.”',
    'Vale: „karjäärinõustamine on tasuta kõigile”.',
  ],
};
