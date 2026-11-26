// B2 course (B1 → B2 roadmap), module 14 „Ühiskond ja avalikud teenused” (b1b2-066…070), stage B2-.
// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25),
// built on the pattern of modules 11–13 (b2/module11.js … b2/module13.js). On the v3 station engine with the v4 task formats.
// Module goal (the learner): „Ma saan avalikes teenustes ja kohalikus elus ise hakkama: helistan vallale lähedase pärast,
// räägin oma kogukonna loost, seletan ametlikke nõudeid lihtsas keeles ja teen vallale ettepaneku, millele vastatakse.”
// Society from the learner's own angle: an old parent who no longer copes alone, two hours of volunteering a week, what
// the citizenship law asks (and what it does not), a dark road to the bus stop. Politics neutral: the learner gives an
// opinion only on practical questions. Nobody has to tell his real life: every task allows a typical or invented case.
//   Avasta  (4): station 1 — 066 the module's COLD TASK in speech (1 min to think, 1 min to speak, no phrases; module 13
//                measured writing, module 14 measures speaking; its parallel is 070_t_cold), 067–069 the 5-min
//                „Parandatud versioon” of the previous lesson's draft (data.revisionOf, v6 G16); station 2 the words
//                (10 + 3 review words from 3–15 lessons back, data.review, v6 G18), ONE input — reading ≈ 480–520 words
//                with ≥ 3 inference questions (066 „Kui vanem ei saa enam üksi hakkama”, 068 „Kodakondsus: mida seadus
//                nõuab — ja mida mitte?”) or listening ≈ 3.5–4 min, 2 voices (067 „Kogukonnatund”, 069 „Küsi vallalt”) —
//                and one scheme (067–069; 066's Avasta holds the cold task and the R1 corner instead).
//   Harjuta (4): the rule box (B1 one-line review, B2 step, one L1-contrast line „Vene keeles …”), one form task of 10
//                items that PRODUCES the rule box's bold forms (the choice is left open, the hint is the dictionary form or
//                the da-form, never the answer; v6 G15), one second task of 8 rows (068: the R4 sentence bank), and the
//                10-min DRAFT of the home text in class.
//   Kasuta  (5): station 4 the main task — types modules 11–13 used least, one each (v6 G17): 066 phone (a case card,
//                the social worker's hidden information), 067 narrative (a story told and questioned), 068 mediation
//                (the law in plain words for a relative), 069 project (a proposal to the commission) — each with an
//                „Abikaart” and a „Lisaväljakutse” (data.support / data.stretch, v6 G24); the EXIT 30–60 s of speech in
//                the main task's skill (v6 G14); the self-check with 3 criteria rated 0–1–2 and one own sentence; the home
//                text (finish the draft, ~140 / ~180 words, 1-min voice message, „Harjuta → moodul 14”); the analytic
//                Harno B2 rubric with a borderline sample (v5 G10).
//   066 quest    „Ema ei saa enam üksi hakkama: mida vald pakub?”                    reading  participle phrases, des-form     phone
//   067 infogap  „Kaks tundi nädalas: kas vabatahtlik töö sobiks sulle?”             radio    the ma-infinitive: -ma/-mas/-mast  narrative
//   068 case     „Kodakondsus: mida seadus nõuab — ja mida mitte?”                   reading  nõuab, et + conditional; eeldab    mediation
//   069 project  „Pime tee bussipeatusse: kuidas teha vallale ettepanek, millele vastatakse?” radio  impersonal conditional  project
//   070 exam     Kontroll 14: one sheet, 45 min, LISTENING + SPEAKING (m12 L + S, m13 R + W — the controls alternate). It
//                is a two-skill control, not a full mock (the methodologist's decision for 040, 055, 060 and 065: v6 §2 g,
//                „B2, lesson 5 of a module: 2 skills alternating”). Why L + S: module 13 tested reading and writing; the
//                module's cold task is spoken (066_d_cold), so its parallel is spoken (070_t_cold).
// Course-level repairs (final shape, docs/COURSE_FINAL_SHAPE_B2.md): 067 is a story lesson (LUGU; module 13 lost its
// LUGU), 066 holds an R1 corner (the 7-item, 3-option article questions) and 068 an R4 corner (whole sentences from a
// bank with one extra) — module 13 lost both; the four lead pairs R→S, L→S, R→W, L→W are all here (V5-pairs).
// Real network (v6 G25): media log 067_t_blog („Minu eesti keele võrgustik”), real document + link task 068_t_mail
// (Politsei- ja Piirivalveamet, a 3-item task — the page was not opened by the author), peer exchange 069_t_mail (a
// classmate answers the proposal). Mediation 068; peer feedback round 069. Texts are adapted learning texts („KeeleSepp
// õppetekst”) without exact statistics (owner 2026-11-25); people in the recordings are invented and not the course cast
// (docs/COURSE_CAST.md); no dictation, no „Kas teadsid?”.
// Module 13's last draft (the message to an old neighbour, 064_t_note) is revised in 066's home task (three marked
// sentences into „Minu vead” in Harjuta): station 1 of 066 holds the cold task and the Avasta sheet has no room for a
// second 5-min block (v5 G1: ≤ 4 blocks on a B2 Avasta) — the same decision as modules 11–13.
// Kept: lesson ids, titles, topics and v4 formats; the v4 lessons of 2026-11-19 are kept below as V4 and every block that
// is not on a v6 sheet is taken from there with retire() (hidden, id and learners' answers kept, old explanations in
// OLD_WHY). A kept id keeps its block type.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 14. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life (health, residence status and money are private)
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud inimese loost.';

export const MODULE = { id: 'b1b2-module-14', course: 'b2', title: 'Ühiskond ja avalikud teenused', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

// the radio interview of 067: a volunteer rescuer (gaps, Harno B2 L3)
const RADIO_067 = [
  'Saatejuht: Tere! Tartu Ülikooli värske uuringu järgi osaleb vabatahtlikus tegevuses iga neljas-viies Eesti elanik. Stuudios on Marju Tamm, kes on Lõuna-Eestis vabatahtlik päästja juba kuus aastat. Marju, kuidas sa selle juurde jõudsid?',
  'Marju: Meie külas põles ühel talvel maja ja kutselised päästjad olid alles kahekümne minuti pärast kohal. Pärast seda otsustasin, et liitun küla vabatahtliku komandoga. Päeval töötan raamatupidajana ühes tööstusettevõttes, väljakutsetel käin õhtuti ja nädalavahetustel. Kui tuleb tormihoiatus, oleme valmis juba ette.',
  'Saatejuht: Kas igaüks võib päästjaks hakata?',
  'Marju: Kõigepealt tuleb läbida koolitus ja tervis peab olema korras. Aga kõik ei pea tulle minema. Mina osalen peamiselt ennetustöös: käin eakate kodudes, kontrollin, kas suitsuandur töötab, ja räägin, kuidas ahju ohutult kütta. See töö sobib ka inimesele, kes ei jaksa raskeid voolikuid tassida.',
  'Saatejuht: Kui palju on Eestis vabatahtlikke päästjaid?',
  'Marju: Eelmisel aastal oli Eestis sada üheksateist vabatahtlikku komandot ja koos abidemineerijatega üle kolme tuhande vabatahtliku. Tavalisel päeval on valmis umbes kakssada viiskümmend vabatahtlikku päästjat. Maal jõuame tihti kohale enne kutselisi.',
  'Saatejuht: Mis on selle töö juures kõige raskem?',
  'Marju: Aeg. Kui öösel tuleb väljakutse, pean hommikul ikkagi tööle minema. Kõik sõltub sellest, kas pere ja tööandja on toetavad.',
  'Saatejuht: Mida ütleksid kuulajale, kes kahtleb?',
  'Marju: Alusta väikselt. Kui sul on kaks tundi nädalas, saad juba panustada. Ja keel ei ole takistus: meie komandos on ka venekeelseid liikmeid, kes õpivad eesti keelt koos meiega. Kevadel korraldasime külas talgud: sorteerisime prügi ja pandipakendite raha annetasime noorte päästeringile.',
  'Saatejuht: Aitäh, Marju!',
];

// the municipality's info hour of 069: how a resident makes a proposal (gaps)
const INFO_069 = [
  'Juhataja: Tere tulemast valla infotundi! Täna räägib valla jurist Kaie Lepp, kuidas elanik saab vallale ettepaneku teha.',
  'Kaie: Tere! Kõige lihtsam viis on kirjutada vallavalitsusele märgukiri ehk ettepanek. Seda võib teha iga inimene, ka see, kellel ei ole Eesti kodakondsust. Seaduse järgi tuleb märgukirjale vastata kolmekümne kalendripäeva jooksul. Kui küsimus on keeruline, võib vastamise aega pikendada, kuid mitte rohkem kui kahe kuuni.',
  'Kaie: Kirjutage lühidalt: mis on probleem, kus see on, keda see puudutab ja mida te pakute. Lisage foto või kaart. Hea ettepanek kõlab näiteks nii: „Kui tee äärde paigaldataks kuus valgustit, oleks lastel turvalisem. See maksaks umbes kaksteist tuhat eurot.” Ettepanek, kus on kaks lahendust ja nende hind, saab sageli kiiremini vastuse kui kiri, kus on ainult kriitika.',
  'Juhataja: Aga kui vald vastab „ei”?',
  'Kaie: Siis on teil teisigi teid. Seaduse järgi võib vähemalt üks protsent valla hääleõiguslikest elanikest algatada volikogu otsuse ja volikogu peab selle kolme kuu jooksul arutusele võtma. Allkirju saab koguda portaalis rahvaalgatus punkt ee. Riigikogule saab sealt saata kollektiivse pöördumise, kui sellel on vähemalt tuhat allkirja.',
  'Juhataja: Kas allkirjade kogumine on keeruline?',
  'Kaie: See võtab aega. Seepärast soovitan alustada naabritest ja kohalikust ajalehest. Ja ärge unustage kaasavat eelarvet: paljudes valdades ja linnades saavad elanikud ise ideid esitada ja nende poolt hääletada.',
];

// the v4 lessons of 2026-11-19 („task-based”): the source of every block that is not on a v6 sheet
const V4 = {
  'b1b2-066': {
    title: 'Ema ei saa enam üksi hakkama: mida vald pakub?',
    phases: grammar('Keel: umbisikuline tegumood ametlikus tekstis — abivajadust hinnatakse, teenust pakutakse, taotlust ei rahuldata; otsus tehti, tasu on muudetud'),
    format: 'quest',
    topic: 'family',
    canDo: 'Ma loen valla teavet sotsiaalteenuste kohta ja saan aru umbisikulisest ametlikust tekstist (abivajadust hinnatakse, kulud tasutakse), valin eakale inimesele sobiva teenuse ja räägin sotsiaaltöötajaga selgelt, mida ta vajab.',
    teacherPage: {
      goal: 'Квест: пожилой родственник не справляется один — соцработник, оценка нужд, услуги на дому, кнопка тревоги, дом ухода (реформа 2023); безличная форма; встреча с соцработником.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 2 — слова и 4 первых вопроса, текст — дома; станция 3 — правило и 4 строки; станция 4 — контрольная точка из 8 ситуаций и встреча 1 минута.',
      hook: '«Твоей маме (или соседке) 82. Она дважды падала, в магазин ходить не может, но в дом ухода не хочет. Кто должен помочь: семья, волость или она сама? Что ты сделаешь первым?» Ответьте оба. В конце урока ученик знает первый шаг: обратиться к соцработнику своего самоуправления.',
      plan: [
        '0–3: крючок — маме 82, кто помогает и что я делаю первым',
        '3–15: станция 1 — разговор: кому в моей семье нужна помощь, как заботились о пожилых там, где я вырос, что задача семьи и что — государства',
        '15–30: станция 2 — слова (2 мин), страница темы «Kes aitab, kui jõud lõpeb?» (≈ 330 слов), прогноз и 8 вопросов (R1)',
        '30–42: станция 3 — заметить в тексте безличные формы → правило → инфолисток волости: 7 трансформаций',
        '42–57: станция 4 — контрольная точка: 8 ситуаций → какая услуга; встреча с соцработником (учитель)',
        '57–69: «Kui aega jääb» — разговор с мамой, которая не хочет принимать помощь',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо соцработнику 160–180 слов, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Страница темы: Statistikaamet — около каждого пятого жителя Эстонии 65 лет и старше; Sotsiaalhoolekande seadus — социальную помощь организует местное самоуправление, нужда в помощи оценивается (koduteenus, sotsiaaltransport, isikliku abistaja teenus, üldhooldusteenus и др.); ERR, «Riigikogu kiitis heaks hooldusreformi» (12.2022): с 1 июля 2023 г. расходы на персонал по уходу в доме ухода оплачивает самоуправление, людям с доходом ниже средней пенсии по старости помогают и с остальной частью; средняя плата в 2023 г. при большой нужде в уходе — 1375 € в месяц; министр Сигне Рийсало — в первую очередь услуги на дому; ERR (2025) — после реформы спрос на услугу вырос. Кнопка тревоги (häirenupp) — «во многих самоуправлениях», условия и плата у каждого свои. Ситуации контрольной точки — учебные.',
      groups: 'Станция 1 — в парах. Текст и вопросы — каждый сам, сверка в паре. Контрольная точка — каждый сам, потом спор о двух спорных ситуациях. Встреча: один — родственник, второй — соцработник по вашей карточке; потом смена. В 1:1 соцработник — вы.',
      errors: [
        '«Abivajadust hinnatakse» — верно (частичный объект в партитиве); «Otsust tehakse kahe nädala jooksul» → «Otsus tehakse …» (полный объект в безличной форме — номинатив).',
        '«Taotlust ei rahuldatakse» → «Taotlust ei rahuldata» (отрицание: ei + -ta / -da).',
        '«Teenus oli muudetud eile» ≠ «Teenust muudeti eile» (muudeti — действие в прошлом; oli muudetud — состояние).',
        '«Ma pöördusin sotsiaaltöötajale» → «… sotsiaaltöötaja poole» (pöörduma kelle poole).',
      ],
      notes: [
        'Формат — квест: четыре контрольные точки (угадать, проверить факты, выбрать форму официального текста, подобрать услугу и поговорить с соцработником). Тема семейная и может быть тяжёлой: ученик говорит о маме, соседке или выдуманном человеке; не спрашивайте о болезнях и деньгах семьи.',
        'Уставшему после смены — «как помочь родителям, если я работаю сменами» (услуги на дому, кнопка тревоги); студенту — бабушка или сосед; пенсионеру — он может говорить о себе или о соседке, без драматизма: знать свои права полезно; маме в декрете — ребёнок и пожилой родитель одновременно.',
        'Обратная связь, 2–3 цели: -takse / -dakse; ei + -ta; номинатив полного объекта в безличной форме.',
      ],
    },
    discover: [
      station(B.text('066_d_hook', 'Mida sa teed esimesena?', 'Sinu ema (või naaber) on 82. Ta on kaks korda kukkunud ja poes käia ei jaksa, aga hooldekodusse minna ei taha. Kes peaks aitama: pere, vald või ta ise? Mida sa teed esimesena? Ütle kohe.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('066_d_talk', 'Abi minu peres ja kodukohas.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kes sinu peres või tuttavate seas vajab igapäevast abi?',
        'Kuidas hoolitseti eakate eest seal, kus sa üles kasvasid?',
        'Mis on sinu arvates pere ja mis valla ülesanne?',
      ], [120, 180], ['Minu tuttaval on vaja abi …', 'Seal, kus ma kasvasin, …', 'Minu arvates peaks pere …, vald aga …']), 'Sinu oma kogemus on tunni faktide esimene võrdlus.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise, kuidas sinu peres eakaid aidatakse. Ära küsi haiguste ega raha kohta. Lõpus ütle üks sõna, mida õpilane vajas (hooldama, üksi elama, koduteenus).')),
      station(tag(B.vocab('066_d_vocab', 'Enne lugemist: sõnad.', ['teenus — услуга', 'pöörduma — обращаться', 'abivajadus — потребность в помощи', 'sotsiaaltöötaja — соцработник', 'hooldus — уход', 'hooldekodu — дом ухода (престарелых)', 'eakas — пожилой', 'toetus — пособие (поддержка)', 'hindama — оценивать', 'taotlus — заявление']), { topic: ['abivajadus', 'sotsiaaltöötaja', 'hooldekodu'] }), 2, 15),
      B.topicOpener('066_d_open', 'Moodul 14. Kes aitab, kui jõud lõpeb?', [
        'Statistikaameti andmetel on umbes iga viies Eesti elanik vähemalt 65-aastane ja paljud eakad elavad üksi. Üksi elav eakas on kukkumise ja kuumalaine riskirühmas. Enamik tahab elada oma kodus nii kaua kui võimalik. Aga mis saab siis, kui inimene ei jaksa enam ise poes käia, kütta ega arsti juurde sõita ning lapsed elavad teises linnas või töötavad vahetustega?',
        'Sotsiaalhoolekande seaduse järgi korraldab abi kohalik omavalitsus ehk vald või linn. Esimene samm on lihtne: pöördutakse oma valla või linna sotsiaaltöötaja poole. Pöörduda võib inimene ise, tema laps, naaber või sõber. Seejärel hinnatakse abivajadust, sageli inimese kodus, ja lepitakse kokku, milline teenus sobib. Koduteenuse korral tuuakse eakale toit ja ravimid koju, aidatakse koristada ja kütta ning suvel vaadatakse, kas tal on piisavalt vedelikku. Paljudes valdades pakutakse ka häirenuppu: kui inimene kukub, vajutab ta nuppu ja abi kutsutakse kohe. Lisaks on sotsiaaltransport, päevakeskused ja isikliku abistaja teenus.',
        'Kui kodus enam hakkama ei saada, jääb üle hooldekodu. Varem maksid inimene ja tema pere hooldekodu koha eest peaaegu kõik ise ja see oli paljudele liiga kallis: 2023. aastal maksis suure hooldusvajadusega inimese koht keskmiselt 1375 eurot kuus. Alates 2023. aasta 1. juulist tasutakse hoolduspersonali kulud valla või linna eelarvest. Elamise ja toidu eest maksab inimene ise, kuid kui tema sissetulek on keskmisest vanaduspensionist väiksem, aidatakse teda ka selles osas.',
        'Reformi järel kasvas huvi hooldekodukohtade vastu kiiresti. Valdkonna minister rõhutas aga, et esimeses järjekorras tuleb eelistada koduteenuseid, sest kodus elamine on inimesele tavaliselt parem ja ühiskonnale odavam. Seega tasub sotsiaaltöötaja poole pöörduda varakult, mitte alles siis, kui olukord on juba kriitiline. Ka pere ei pea kõike üksi kandma: kui lähedane hoolitseb eaka eest iga päev ja jääb ise väsimusest haigeks, ei ole kellelgi sellest kasu. Abi küsimine ei ole nõrkus, vaid osa heast hoolitsusest.',
        'Selles moodulis vaatad ühiskonda oma elu kaudu: kust saada abi, kuidas teistega koos midagi ära teha, mida seadus nõuab ja kuidas teha vallale ettepanek, millele tuleb vastata.',
      ], 'Statistikaamet; sotsiaalhoolekande seadus; ERR, „Riigikogu kiitis heaks hooldusreformi” (2022) ja „Signe Riisalo: hooldereformi järel on nõudlus teenuse järele kasvanud” (2025)', [
        'Kas sinu vastus tunni alguses oli õige? Mis sind üllatas?',
        'Kuidas hoolitseti eakate eest seal, kus sa üles kasvasid? Mis on Eestis teisiti?',
        'Milline teenus oleks sinu perele või naabrile kõige kasulikum ja miks?',
        'Miks on koduteenus sageli parem kui hooldekodu — ja millal mitte?',
      ]),
      teach(tag(purpose(B.choice('066_d_facts', 'Arva ja kontrolli: kes aitab?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Kui suur osa Eesti elanikest on Statistikaameti andmetel praegu vähemalt 65 aastat vanad?', 'umbes iga viies Eesti elanik', 'umbes iga kümnes Eesti elanik', 'umbes pooled Eesti elanikud', 'umbes iga kolmas Eesti elanik'],
        ['Kes korraldab sotsiaalhoolekande seaduse järgi abi eakale, kes enam üksi kodus hakkama ei saa?', 'kohalik omavalitsus ehk inimese vald või linn', 'ainult inimese enda pere ja lapsed', 'inimese perearst oma nimistu kaudu', 'riik Töötukassa kaudu'],
        ['Kes võib teksti järgi eaka inimese pärast valla sotsiaaltöötaja poole pöörduda?', 'inimene ise, tema laps, naaber või sõber', 'ainult abi vajav inimene ise', 'ainult perearst või haigla arst', 'ainult Eesti kodakondsusega inimene'],
        ['Mis juhtub kõigepealt pärast seda, kui keegi on sotsiaaltöötaja poole pöördunud?', 'hinnatakse, millist abi inimene tegelikult vajab', 'inimene viiakse kohe hooldekodusse', 'inimene peab kohe maksma suure tasu', 'pere saab trahvi, et ei aidanud'],
        ['Milleks on teksti järgi häirenupp, mida pakutakse paljudes valdades?', 'et kukkunud inimene saaks kohe abi kutsuda', 'et eakas saaks poest toitu tellida', 'et eakas saaks arveid maksta', 'et eakas saaks arsti aega broneerida'],
        ['Mis muutus hooldekodu koha eest maksmisel alates 2023. aasta 1. juulist?', 'hoolduspersonali kulud tasub nüüd vald või linn', 'hooldekodu koht muutus kõigile tasuta', 'kogu tasu hakkas maksma riik', 'muutus ainult toidu ja elamise hind'],
        ['Mida rõhutas valdkonna minister pärast seda, kui huvi hooldekodude vastu kasvas?', 'esmalt tuleb eelistada koduteenuseid', 'kõik eakad peaksid minema hooldekodusse', 'pere ei pea enam eakaid aitama', 'valdades on sotsiaaltöötajaid liiga palju'],
        ['Millise mõttega oleks teksti autor kõige rohkem nõus?', 'abi tasub küsida varakult, enne kui olukord on kriitiline', 'vald aitab eakaid ainult hooldekodus', 'eakas peab ise kõigega hakkama saama', 'abi saab ainult siis, kui lapsed elavad lähedal'],
      ], 'full', 'g_read'), 'Näed, kas sinu pilt Eesti sotsiaalabist vastab faktidele.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja valikvastused. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine ja kontroll. Küsi lõpuks: „Mis oli sulle uus ja kellele sa sellest räägid?” Kui õpilane küsib oma valla kohta: vaata koos valla kodulehelt rubriiki „Sotsiaalabi” — teenused ja tasud on igas vallas veidi erinevad.'),
    ],
    practice: [
      station(B.notice('066_p_notice', 'Märka: abivajadust hinnatakse kodus', [
        'Tekstist: sotsiaaltöötaja poole **pöördutakse** · **hinnatakse** abivajadust · **tuuakse** eakale toit koju · abi **kutsutakse** kohe · hoolduspersonali kulud **tasutakse** valla eelarvest',
        '**Umbisikuline tegumood**: tegija on asutus, ametnik või „kõik inimesed” ja teda ei nimetata. **Olevik -takse / -dakse**: hinna**takse**, paku**takse**, too**dakse** · **minevik -ti / -di**: otsus **tehti**, tasu muude**ti** · **täisminevik on + -tud / -dud**: kord **on muudetud**.',
        '**Eitus**: olevikus **ei + -ta / -da**: Taotlust **ei rahuldata**, kui … · minevikus **ei + -tud / -dud**: Vaba kohta **ei leitud**.',
        '**Sihitis**: umbisikulises tegumoes on terve sihitis **nimetavas**: Vald teeb **otsuse** … → **Otsus** tehakse kahe nädala jooksul. · Osaline sihitis jääb osastavasse: abivajadust hinnatakse.',
        'Miks see on tähtis: valla teates kõlab umbisikuline neutraalselt ja viisakalt: „Teie taotlus vaadatakse läbi 30 päeva jooksul.” Kui tead vormi, saad aru ka teatest, kus tegijat ei ole.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('066_p_imp', 'Valla infoleht eakate peredele.', 'Vald kirjutab infolehe ametlikult, tegijat nimetamata. Kirjuta lause ümber umbisikulises tegumoes ja alusta antud sõnadega.', [
        ['Sotsiaaltöötaja hindab abivajadust inimese kodus, kui pere seda soovib.', 'Abivajadust …', 'Abivajadust hinnatakse inimese kodus, kui pere seda soovib.'],
        ['Vald teeb teenuse kohta otsuse kahe nädala jooksul pärast taotluse saamist.', 'Otsus …', 'Otsus tehakse kahe nädala jooksul pärast taotluse saamist.|Otsus teenuse kohta tehakse kahe nädala jooksul pärast taotluse saamist.'],
        ['Me ei rahulda taotlust, kui sellele ei ole lisatud perearsti tõendit.', 'Taotlust …', 'Taotlust ei rahuldata, kui sellele ei ole lisatud perearsti tõendit.'],
        ['Eelmisel aastal muutis vald koduteenuse tasu ja vähendas seda eakatele, kelle pension on väike.', 'Eelmisel aastal …', 'Eelmisel aastal muudeti koduteenuse tasu ja seda vähendati eakatele, kelle pension on väike.|Eelmisel aastal muudeti koduteenuse tasu ja vähendati seda eakatele, kelle pension on väike.'],
        ['Vald on avanud uue päevakeskuse, kus eakad saavad koos süüa ja suhelda.', 'Uus päevakeskus …', 'Uus päevakeskus on avatud, kus eakad saavad koos süüa ja suhelda.|Uus päevakeskus on avatud ja seal saavad eakad koos süüa ja suhelda.'],
      ], 'full', 'g_notice'), 'Valla infoleht on lühike ja selge, kui tead, millal tegijat ei nimetata.'), { task: 'G03' }),
      'Pärast iga rida küsi: „Kes seda tegelikult teeb ja miks teda ei nimetata?” Rida 2: otsus on nimetavas (terve sihitis umbisikulises). Rida 4: minevik muudeti, vähendati; võrdle „tasu oli muudetud” (seisund). Rida 5: täisminevik on avatud. Lisaküsimus: „Millist valla teadet oled sina näinud?”'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('066_t_chat', 'Õe ja venna sõnumid: mis emale sobiks?', 'Loe õe ja venna sõnumeid. Mida ema vajab ja mida ta ise veel teeb?', 'Õde', 'Vend', [
        ['A', 'Ema kukkus eile jälle köögis. Seekord läks hästi, aga ta lamas pool tundi põrandal, enne kui naaber kuulis.'],
        ['B', 'Ma ei saa iga päev Tartust sõita. Ja ema ütleb, et hooldekodusse ta ei lähe.'],
        ['A', 'Hooldekodu ei olegi vaja. Ta teeb ise süüa ja loeb, aga poodi ja puid tuua ta enam ei jaksa.'],
        ['B', 'Valla kodulehel on kirjas koduteenus ja häirenupp. Abivajadust hinnatakse kodus, tasu sõltub pensionist.'],
        ['A', 'Häirenupp oleks hea: kui ta kukub, kutsutakse abi kohe. Aga kas ta nõustub võõra inimesega?'],
        ['B', 'Räägime temaga koos. Mina helistan esmaspäeval sotsiaaltöötajale ja küsin aega.'],
      ], 'g_read'), 'Sõnumitest näed, mida pere tegelikult vajab — sellest räägid sotsiaaltöötajaga.'), { task: 'R12' }), 4, 15, { final: 'explain' }),
      tag(purpose(B.categorize('066_t_sort', 'Kontrollpunkt: milline teenus kellele?', 'Loe olukordi ja otsusta, milline valla teenus sobib igale inimesele kõige paremini. Ole valmis oma valikut põhjendama.', [
        ['Koduteenus', ['eakas mees ei jaksa enam ise poes käia ega puid tuppa tuua', 'naine tuli haiglast koju ja vajab kuu aega abi koristamisel']],
        ['Häirenupp', ['84-aastane naine elab üksi ja on talvel kaks korda kukkunud', 'pime mees elab üksi ja kardab öösel, et keegi ei kuule teda']],
        ['Sotsiaaltransport', ['ratastooliga inimene peab käima kaks korda nädalas haiglas protseduuril']],
        ['Päevakeskus', ['lesk on päeval väga üksildane, kuid saab veel ise liikuda', 'pensionär tahaks käia koos teistega võimlemas ja laulmas']],
        ['Hooldekodu', ['inimene vajab hooldust ööpäev läbi ja pere ei saa seda enam kodus pakkuda']],
      ], 'full', 'g_read'), 'Kui tead, mis teenus kellele sobib, oskad abi küsida täpselt.'), { task: 'R07' }),
      teach(tag(purpose(B.rolecards('066_t_meet', 'Kohtumine valla sotsiaaltöötajaga.', 'Sa tulid vallamajja oma lähedase (või väljamõeldud eaka naabri) pärast. Selgita sotsiaaltöötajale, mis on olukord ja mida ta vajab, küsi teenuste kohta ja lepi kokku järgmine samm. Õpetaja on sotsiaaltöötaja.',
        'Olukord: sinu lähedane või naaber elab üksi ega saa enam kõigega hakkama; sina töötad ja ei saa iga päev tema juures käia.\nSinu eesmärk: kirjelda 2 minutiga, mis on muutunud, mida ta veel ise teeb ja mida mitte; küsi kahe teenuse kohta ja lepi kokku, millal abivajadust hinnatakse.\nPiirang: sotsiaaltöötaja ei tunne seda inimest — too konkreetsed näited (kukkumine, pood, küte, ravimid).',
        'Sotsiaaltöötaja kaart on õpetajal: tema küsimused ja võimalused.',
        ['Pöördun teie poole oma … pärast.', 'Eelmisel nädalal pidime kiirabi kutsuma, sest …', 'Viimasel ajal on ta …', 'Ise saab ta veel …, aga …', 'Kas teie vallas pakutakse …?', 'Kui kaua otsust tehakse?', 'Millal saaksite tema juurde tulla?'], ['Kui vana ta on ja kellega koos elab?', 'Mida ta ise veel teeb?', 'Abivajadust hinnatakse kodus.']), 'Tulemus: sotsiaaltöötaja saab olukorrast kohe aru ja te lepite kokku järgmise sammu.'), { task: 'S10', main: true, level: 4 }),
      'Õpetaja kaart (valla sotsiaaltöötaja). Küsi järjest: 1) „Kes on inimene, kui vana, kas elab üksi?” 2) „Mida ta ise veel teeb, mida enam mitte?” 3) „Kas ta ise on abiga nõus?” Võimalused: koduteenus (2 korda nädalas, väike tasu sõltub sissetulekust), häirenupp, sotsiaaltransport; hooldekodu alles siis, kui kodus enam ei saa. Takistus: hindamiseks on vaja inimese enda nõusolekut. Õnnestunud, kui õpilane kirjeldab olukorda konkreetsete näidetega, küsib kahe teenuse kohta, kasutab kahte umbisikulist vormi ja lepib kokku hindamise aja.'),
      extension(teach(tag(purpose(B.speaking('066_t_more', 'Rollimäng: ema ei taha abi võtta', 'Sinu ema (õpetaja) ütleb: „Mulle ei ole kedagi vaja, ma saan ise hakkama!” Räägi temaga rahulikult: kuula, too näide ja paku üks väike samm.', [
        'Kuidas alustad nii, et ta ei solvu?',
        'Mida vastad, kui ta ütleb, et võõrast inimest ta koju ei taha?',
        'Millise väikese sammu pakud esimeseks?',
      ], [120, 180], ['Ma saan aru, et …', 'Mul oleks rahulikum, kui …', 'Vallas pakutakse …', 'Proovime alguses ainult …']), 'Abi on lihtsam vastu võtta, kui seda pakutakse austusega.'), { task: 'S13', level: 4 }),
      'Kui aega jääb (12 min). Sina oled ema (82, uhke ja iseseisev): „Ma ei ole invaliid!”, „Võõras inimene minu kodus? Ei!”, „See maksab kindlasti palju.” Pehmeneb, kui õpilane kuulab, toob konkreetse näite (kukkumine) ja pakub väikese sammu (häirenupp, poeabi kord nädalas, proovikuu). Õnnestunud, kui õpilane ei käsi, vaid veenab ja jõuab ühe sammuni.'), 12),
      tag(exitCheck(purpose(B.gaps('066_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev tegusõna umbisikulises vormis.', [
        'Eakate päevakeskuse uksed [suletakse] reedeti juba kell kolm. (sulgema, olevik)',
        'Eelmisel nädalal [muudeti] koduteenuse aegu, sest üks töötaja jäi haigeks. (muutma, minevik)',
        'Uusi kliente päevakeskusesse praegu [ei võeta]. (võtma, eitus olevikus)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas umbisikuline olevik, minevik ja eitus on käes.')), {}),
      purpose(B.selfcheck('066_t_self', ['Ma räägin, kes minu peres või kodukohas abi vajab.', 'Ma loen valla teavet sotsiaalteenuste kohta ja leian sealt vajaliku.', 'Ma kasutan umbisikulist tegumoodi: hinnatakse, pakutakse, tehti, ei rahuldata.', 'Ma selgitan sotsiaaltöötajale olukorda ja lepin kokku järgmise sammu.'], 'Kontrollpunktid läbitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('066_t_letter', 'Kodus: kiri sotsiaaltöötajale.', 'Kirjuta kodus oma valla või linna sotsiaaltöötajale 160–180 sõna (võid kirjutada väljamõeldud lähedase eest): kes vajab abi ja miks, mida ta veel ise teeb, millise teenuse kohta küsid, ja palu aega abivajaduse hindamiseks. Kasuta vähemalt nelja umbisikulist vormi (hinnatakse, pakutakse, tuuakse, ei saada).', 'Lugupeetud sotsiaaltöötaja!', 'Lugupidamisega\n(sinu nimi), telefon …', [160, 180]), 'Sotsiaaltöötaja saab kirjast kohe aru, kellele ja millist abi on vaja.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('066_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kuidas sinu peres või kodukohas eakaid aidatakse ja mida sa vallalt küsiksid.', [
        'Kes aitab praegu ja mis on raske?',
        'Millist valla teenust sa esimesena prooviksid?',
      ], [60, 90]), 'Õpetaja kuulab ja ütleb, kas umbisikulised vormid on õiged.')), { task: 'S15' }),
      homework('066_t_homework', ['1. Kiri sotsiaaltöötajale, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-067': {
    title: 'Kaks tundi nädalas: kas vabatahtlik töö sobiks sulle?',
    phases: grammar('Keel: tegusõna rektsioon — osalema milles, liituma millega, panustama millesse, huvituma millest, sõltuma millest, vastutama mille eest, pöörduma kelle poole'),
    format: 'infogap',
    topic: 'freetime',
    canDo: 'Ma saan aru vabatahtliku päästja raadiointervjuust, kasutan osalemise tegusõnu õige käändega (osalema milles, liituma millega, vastutama mille eest) ning leian infovahetuse abil endale sobiva vabatahtliku töö ja kirjutan koordinaatorile kandideerimiskirja.',
    teacherPage: {
      goal: 'Обмен информацией: добровольный спасатель (профилактика) или «Keelesõber»; управление глаголов (osalema milles, liituma millega, vastutama mille eest); своё дело на 2 часа в неделю.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — радио дважды, 4 первых пропуска; станция 3 — правило и 4 строки; станция 4 — обмен информацией без письменного плана (план — дома).',
      hook: '«Угадай: какая часть жителей Эстонии делает добровольную работу — каждый десятый, каждый четвёртый-пятый или половина? И делал ли ты когда-нибудь что-то бесплатно для других?» Ответ — в радио: каждый четвёртый-пятый (Тартуский университет, 2026). Если ученик назовёт «половина» — это тоже не глупо: в опросе 2019 г. с широким определением было 49 %; разница в методике.',
      plan: [
        '0–3: крючок — угадать долю волонтёров, вспомнить, помогал ли я бесплатно',
        '3–10: станция 1 — разговор: кому я помог в последний раз, были ли толоки там, где я вырос, что мешает помогать',
        '10–25: станция 2 — слова (2 мин), прогноз пропусков, радиоинтервью с добровольным спасателем дважды, 7 пропусков (L3)',
        '25–37: станция 3 — заметить в радио управление глаголов → правило → объявления портала волонтёров: 7 пропусков',
        '37–52: станция 4 — обмен информацией: у ученика карточка A (спасатель, профилактика), у вас B (Keelesõber); вопросы, таблица в голове, решение и план «Мои два часа в неделю»',
        '52–64: «Kui aega jääb» — первая встреча с координатором волонтёров',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо координатору 160–180 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио (текст свой, Марю Тамм — вымышленная): Tartu Ülikool, Kasearu jt, «Vabatahtlikud ja vabatahtlikkus Eestis. Hetkeolukord ja tulevikuväljavaated» (Siseministeeriumi tellimusel, 2026) — в волонтёрстве участвует каждый четвёртый-пятый житель, из новых иммигрантов 2020–2024 — 15 %; ERR, «Mullu hukkus tule- ja veeõnnetustes rekordiliselt vähe inimesi» (2026) — в 2025 г. 119 добровольных команд, 3165 добровольных спасателей и помощников-сапёров, в обычный день готовы ≈ 250 добровольцев; Riigi Teataja, требования к добровольным спасателям (обучение, здоровье; категории: профилактика, работа рядом со спасателем, самостоятельная работа). Карточка B: Integratsiooni Sihtasutus, программа «Keelesõber» — изучающий язык и волонтёр-ментор, встречи онлайн; в 2020–2024 участвовало 5365 человек.',
      groups: 'Радио — каждый сам, сверка в паре. Обмен информацией: в паре у одного карточка A, у другого B (ваша карточка B в заметке учителя); в группе 2+2. В 1:1 вы держите карточку B и отвечаете только на вопросы, заданные с правильным падежом (или переспрашиваете).',
      errors: [
        '«Osalen ennetustööl / ennetustööd» → «Osalen ennetustöös» (osalema — milles, -s; на мероприятиях можно и -l: osalen talgutel).',
        '«Liitun komandole» → «Liitun komandoga» (liituma — millega).',
        '«Vastutan ohutusest» → «Vastutan ohutuse eest» (отвечать за = vastutama mille eest).',
        '«Sõltub minu töögraafikut» → «Sõltub minu töögraafikust» (sõltuma — millest).',
      ],
      notes: [
        'Формат — обмен информацией: у каждого половина фактов; ученик спрашивает и сам решает. Никого не уговариваем стать волонтёром: решение «сейчас не могу, вот почему» — тоже результат, если оно аргументировано.',
        'Уставшему после смены — «2 часа в месяц» или онлайн-встречи Keelesõber; студенту — опыт для резюме; пенсионеру — профилактика в домах пожилых, ментор позже, когда сдаст B1; маме — онлайн с ребёнком рядом, библиотека.',
        'Обратная связь, 2–3 цели: падеж после глагола (milles, millega, mille eest, millest); вопрос с правильным падежом («Millega ma liituksin?»).',
      ],
    },
    discover: [
      station(B.text('067_d_hook', 'Arva ära', 'Kui suur osa Eesti elanikest teeb vabatahtlikku tööd: iga kümnes, iga neljas-viies või pooled? Ja kas sina oled kunagi teinud midagi tasuta teiste heaks? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('067_d_talk', 'Teiste aitamine minu elus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Keda sa viimati aitasid ilma tasuta?',
        'Kas seal, kus sa üles kasvasid, tehti talguid või ühist tööd?',
        'Mis takistab sul rohkem aitamast: aeg, keel või info?',
      ], [150, 210], ['Viimati aitasin …', 'Seal, kus ma kasvasin, …', 'Mind takistab …']), 'Sinu kogemus näitab, mis vabatahtlik töö sinu ellu sobiks.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise, keda sa viimati aitasid. Ära hinda, kui õpilane ei ole kunagi vabatahtlik olnud. Lõpus ütle üks sõna, mida õpilane vajas (talgud, ühendus, kogukond).')),
      station(tag(B.vocab('067_d_vocab', 'Enne kuulamist: sõnad.', ['vabatahtlik — доброволец', 'kogukond — сообщество', 'ühendus — объединение', 'osalema — участвовать', 'liituma — присоединяться', 'panustama — вносить вклад', 'vastutama — отвечать (за что)', 'koolitus — обучение', 'ennetama — предотвращать', 'suitsuandur — датчик дыма']), { topic: ['suitsuandur'] }), 2, 15),
      teach(tag(purpose(B.listening('067_d_radio', 'Raadiointervjuu: vabatahtlik päästja.', 'Enne kuulamist arva, mis lünka tuleb. Kuula intervjuud kaks korda ja kirjuta igasse lünka 1–2 sõna. Allikad: Tartu Ülikool (2026); ERR (2026).', RADIO_067, [
        'Uuringu järgi osaleb vabatahtlikus tegevuses iga [neljas-viies|neljas või viies] Eesti elanik.',
        'Marju liitus komandoga pärast seda, kui tema külas [põles maja|põles].',
        'Ennetustöös kontrollib Marju eakate kodudes, kas [suitsuandur] töötab.',
        'Eelmisel aastal oli Eestis kokku [sada üheksateist|119] vabatahtlikku komandot.',
        'Marju sõnul sõltub kõik sellest, kas pere ja [tööandja] on toetavad.',
      ], 'g_read'), 'Kuuled, mida vabatahtlik töö päriselt nõuab ja mida see annab — see on sinu otsuse alus.'), { voice: 'interview', task: 'L04' }),
      'Kuulamise tsükkel (Harno B2 kuulamise 3. osa vorm): 1) prognoos pliiatsiga; 2) esimene kuulamine — „Miks Marju liitus?”; 3) teine — lüngad; 4) üks lause: „Kas sinu kodukohas on vabatahtlik komando? Kui ei tea, kuidas seda kontrollida?” Kui õpilane pakub „pooled”, ütle: 2019. aasta uuringus oli 49 %, kuid seal küsiti laiemalt — arvud sõltuvad sellest, mida küsitakse.'),
      B.know('067_d_know', ['Tartu Ülikooli 2026. aasta uuringu järgi osaleb vabatahtlikus tegevuses iga neljas-viies Eesti elanik ja see osa on viimastel aastatel olnud üsna püsiv. Aastatel 2020–2024 Eestisse saabunud inimestest on vabatahtlikuna panustanud 15 protsenti, Eestisse tagasi pöördunutest 32 protsenti. Paljud alustavad sellest, mis on kodu lähedal: küla selts, kool, raamatukogu või keeleõppijate toetamine.'], 'Tartu Ülikool, „Vabatahtlikud ja vabatahtlikkus Eestis. Hetkeolukord ja tulevikuväljavaated” (2026, Siseministeeriumi tellimusel)', 'Kas teadsid? Kes on vabatahtlikud?'),
    ],
    practice: [
      station(B.notice('067_p_notice', 'Märka: liitun komandoga, osalen ennetustöös', [
        'Raadiost: **liitun** küla vabatahtliku **komandoga** · **osalen** peamiselt **ennetustöös** · kõik **sõltub sellest**, kas … · saad juba **panustada**',
        '**Iga tegusõna nõuab oma käänet** (rektsioon): **osalema** milles? (-s): osalen koolituses · **liituma** millega? (-ga): liitun ühendusega · **huvituma** millest? (-st): huvitun loodusest · **sõltuma** millest? (-st): sõltub ajast · **panustama** millesse? (-sse): panustan kogukonda',
        '**vastutama mille eest?** (omastav + eest): vastutan laste ohutuse eest · **pöörduma kelle poole?** (omastav + poole): pöördun koordinaatori poole (tund 66: perearsti poole pöördutakse esimesena)',
        'Vene keele lõks: участвовать **в** = osalema **milles** · отвечать **за** = vastutama **mille eest** (mitte millest) · зависеть **от** = sõltuma **millest** · присоединиться **к** = liituma **millega**.',
        'Õpi tegusõna koos küsimusega: mitte „osalema”, vaid „osalema milles?”. Nii on ka küsimus õige: „Millega ma liituksin? Mille eest ma vastutan?”',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('067_p_case', 'Vabatahtlike portaali kuulutused.', 'Vaata, mida tegusõna nõuab, ja kirjuta sulgudes olev sõna õiges vormis.', [
        'Toidupank otsib vabatahtlikke, kes tahavad osaleda poodide ülejäägi [kogumises] ja abivajajatele jagamises. (kogumine)',
        'Kui soovid meie [ühendusega] liituda, täida lühike ankeet. (ühendus)',
        'Talgujuht vastutab kogu päeva [ohutuse] eest. (ohutus)',
        'Kas sa huvitud [loodusest] ja oled valmis nädalavahetusel aitama? (loodus)',
        'Kohtumiste aeg sõltub sinu [töögraafikust]. (töögraafik)',
        'Küsimuste korral pöördu vabatahtlike [koordinaatori] poole. (koordinaator)',
        'Iga tund, mille sa [kogukonda] panustad, on meile oluline. (kogukond)',
      ], '', 'full', 'g_notice'), 'Kuulutusest saad õigesti aru ja vastad sellele vigadeta, kui tead tegusõna käänet.'), { task: 'G02' }),
      'Pärast iga rida küsi: „Mis küsimusele vastab lünk: milles, millega, mille eest, millest, kelle poole, millesse?” Read 3 ja 6: omastav + eest / poole. Lisaküsimus: „Millest sina huvitud ja millega võiksid liituda?”'),
    ],
    transfer: [
      station(teach(tag(purpose(B.rolecards('067_t_gap', 'Infovahetus: kaks võimalust, üks otsus.', 'Sinul on kaart A, õpetajal kaart B. Küsige teineteiselt puuduvat infot ja otsustage koos, kumb vabatahtlik töö sobib sulle ja miks.',
        'Kaart A: vabatahtlik päästja (ennetustöö).\nKes korraldab: kohalik vabatahtlik komando; Eestis on neid 119.\nMida teed: käid kodudes, kontrollid suitsuandureid, räägid ahju ja elektri ohutusest; tulekahju kustutama lähed ainult eraldi koolitusega.\nNõuded: koolitus enne alustamist, hea tervis.\nSul puudub info kaardi B kohta: kellele see sobib, kui palju aega võtab, kus kohtutakse, mida on vaja osata.',
        'Kaart B on õpetajal: Keelesõbra programm.',
        ['Kellele see programm sobib?', 'Millega ma peaksin liituma?', 'Kui palju aega see võtab?', 'Mille eest vabatahtlik vastutab?', 'Mina valiksin …, sest …', 'See sõltub minu …'], ['Programmis kohtuvad …', 'See sobib inimesele, kes …', 'Millega sa tahaksid liituda?']), 'Tulemus: tead kahte päris võimalust ja valid neist ühe, mis sobib sinu aja ja oskustega.'), { task: 'S05', level: 4 }),
      'Õpetaja kaart B (Keelesõber, Integratsiooni Sihtasutus): eesti keele õppija ja vabatahtlik mentor, kes räägib hästi eesti keelt, kohtuvad e-kanalite kaudu ja harjutavad rääkimist; sobib õppijale, kes oskab eesti keelt vähemalt algtasemel; aeg lepitakse kokku paaris (näiteks tund nädalas); osalemine on tasuta; aastatel 2020–2024 osales 5365 inimest; hiljem võib B1–B2 õppija ise aidata algajat. Vasta ainult küsimusele, mis on esitatud õige käändega (muidu küsi: „Millega?”). Sina küsid kaardi A kohta: „Mille eest ennetustöös vastutatakse?”, „Kas tulekahju juurde peab minema?” Lõpus küsi: „Kumb sobib sinu nädalasse ja miks?” Õnnestunud, kui õpilane küsib vähemalt neli küsimust õige rektsiooniga, võrdleb kahte võimalust aja ja oskuste järgi ning teeb põhjendatud valiku.'), 4, 15, { final: 'decide' }),
      tag(purpose(B.planning('067_t_plan', 'Minu kaks tundi nädalas.', 'Pane oma otsus kirja: igale reale üks lause, kus tegusõna nõuab õiget käänet.', [
        'Millega ma liitun või milles osalen?',
        'Mille eest ma seal vastutan ja mida õpin?',
        'Millest sõltub, kas mul on aega?',
        'Kelle poole ma pöördun ja millal?',
      ], 2), 'See plaan on sinu kandideerimiskirja tuum ja koordinaatorile vastus.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('067_t_more', 'Rollimäng: esimene kohtumine koordinaatoriga', 'Sa tulid oma valitud organisatsiooni esimesele kohtumisele. Tutvusta ennast koordinaatorile (õpetaja), ütle, millest sa huvitud, ja lepi kokku oma esimene ülesanne.', [
        'Kuidas ennast lühidalt tutvustad?',
        'Mida küsid aja, koolituse ja keele kohta?',
        'Mis on sinu esimene ülesanne ja millal?',
      ], [120, 180], ['Tere, minu nimi on … ja ma huvitun …', 'Kas ma saaksin osaleda …?', 'Mille eest vabatahtlik vastutab?', 'Mulle sobiks …']), 'Esimene kohtumine on kõige raskem samm — pärast seda on sul kindel ülesanne.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Sina oled koordinaator: küsi, miks ta tahab liituda, kui palju aega tal on ja kas ta on varem vabatahtlik olnud; ütle üks piirang (koolitus on kahel laupäeval järjest) ja paku kaks esimest ülesannet. Õnnestunud, kui õpilane tutvustab end, kasutab kolm tegusõna õige käändega ja lepib kokku esimese ülesande.'), 12),
      tag(exitCheck(purpose(B.gaps('067_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis: vaata, mida tegusõna nõuab.', [
        'Sel sügisel osalesin esimest korda esmaabi [koolituses]. (koolitus)',
        'Minu vend liitus vabatahtliku [komandoga] juba kaks aastat tagasi. (komando)',
        'Ennetustöös vastutab iga vabatahtlik oma [piirkonna] eest. (piirkond)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tegusõnade rektsioon on käes.')), {}),
      purpose(B.selfcheck('067_t_self', ['Ma räägin, keda ja kuidas ma aitan.', 'Ma saan raadiointervjuust aru, mida vabatahtlik töö nõuab.', 'Ma kasutan tegusõnu õige käändega: osalen koolituses, liitun ühendusega, vastutan ohutuse eest.', 'Ma küsin puuduvat infot ja valin endale sobiva vabatahtliku töö.'], 'Otsus tehtud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('067_t_letter', 'Kodus: kiri koordinaatorile.', 'Kirjuta kodus 160–180 sõna valitud organisatsiooni koordinaatorile: kes sa oled, miks tahad liituda, millest huvitud ja mida oskad, kui palju aega saad panustada ning üks küsimus. Kasuta vähemalt viit tegusõna õige käändega (osalema, liituma, vastutama, sõltuma, panustama).', 'Lugupeetud koordinaator!', 'Lugupidamisega\n(sinu nimi), telefon …', [160, 180]), 'Koordinaator näeb, et sa tead, millega liitud, ja kutsub sind kohtumisele.')), { task: 'W13', main: true, level: 4, harno: 'W1' }),
      tag(homeTask(purpose(B.speaking('067_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: millise vabatahtliku töö sa valisid ja miks just see sobib sinu ellu.', [
        'Millega sa liitud ja mida seal teed?',
        'Millest sõltub, kas sul on aega?',
      ], [60, 120]), 'Õpetaja kuulab ja ütleb, kas tegusõnade käänded on õiged.')), { task: 'S15' }),
      homework('067_t_homework', ['1. Kiri koordinaatorile, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-068': {
    title: 'Kodakondsus: mida seadus nõuab — ja mida mitte?',
    phases: grammar('Keel: kohustus, luba ja keeld — peab, tuleb, on kohustatud, ei pea, ei tohi, võib, on vabastatud; kesksõna reeglites (nõutud, sooritatud, registreeritud)'),
    format: 'case',
    topic: 'languages',
    canDo: 'Ma saan aru kodakondsuse taotlemise nõuetest, eristan kohustust, luba ja keeldu (peab, ei pea, ei tohi, on vabastatud), räägin nõustajana inimesele, mida ta peab tegema ja mida mitte, ning kirjutan sugulasele nõuandekirja.',
    teacherPage: {
      goal: 'Кейс: требования к натурализации (8/5 лет, B1, экзамен по Конституции, доход, адрес); обязанность, разрешение, запрет (ei pea ≠ ei tohi), причастия в правилах; совет по карточке.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок; станция 2 — чат и 4 первых вопроса таблицы; станция 3 — правило и 4 вопроса; станция 4 — одно сообщение из трёх, совет 1 минута.',
      hook: '«Верно или нет: чтобы получить гражданство Эстонии, каждый заявитель должен сдать экзамен по эстонскому языку». Ответ: неверно — кто получил основное, среднее или высшее образование на эстонском, освобождён. Не спорьте о политике гражданства: урок о том, что закон требует и чего нет.',
      plan: [
        '0–3: крючок — верно или неверно: «каждый заявитель сдаёт языковой экзамен»',
        '3–10: станция 1 — разговор: какой документ для меня в Эстонии важнее всего, кто из знакомых сдавал экзамены',
        '10–25: станция 2 — слова (2 мин), чат семьи «бабушка хочет гражданство», «Kas teadsid?» о требованиях, 7 ответов в таблице',
        '25–37: станция 3 — заметить peab / ei pea / on vabastatud → правило (ei pea ≠ ei tohi) → консультант отвечает: 7 пропусков',
        '37–52: станция 4 — три голосовых сообщения на линии консультаций (6 пропусков); ученик — консультант, вы — звонивший со своими вопросами; совет 2 минуты',
        '52–64: «Kui aega jääb» — звонок о регистрации на экзамен',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо родственнику с советом 160–180 слов (W1), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Integratsiooni Sihtasutus, «Kodakondsuse taotlemine» (integratsioon.ee, 2026): вид на жительство или право на проживание не менее 8 лет, из них 5 — постоянно (долгосрочный резидент или постоянное право проживания); экзамен по эстонскому B1 (не нужен, если основное, среднее или высшее образование на эстонском); экзамен по Конституции и Закону о гражданстве; постоянный законный доход; место жительства в регистре народонаселения; лояльность; PPA передаёт заявление правительству в течение 6 месяцев. Kodakondsuse seadus: при натурализации заявитель освобождается от прежнего гражданства (лицо без гражданства — не от чего). Экзамены — Harno, порядок сдачи не важен, результаты не истекают. Выборы: ERR, «Riigikohus: valimisõiguse piiramine polnud põhiseadusega vastuolus» (10.10.2025) — поправка принята Рийгикогу 26.03.2025 (93 «за»); граждане третьих стран не голосовали на местных выборах 2025 г., лица без гражданства голосовали в последний раз в 2025 г.; граждане ЕС голосуют. Люди на карточках — учебные.',
      groups: 'Чат, таблица и сообщения — каждый сам, сверка в паре. Станция 4: один — консультант, второй — звонивший (вопросы с вашей карточки), потом смена. В 1:1 звонивший — вы.',
      errors: [
        '«Sa ei tohi keeleeksamit teha» (запрещено!) → «Sa ei pea keeleeksamit tegema» (нет обязанности). ei pea + -ma, ei tohi + -da.',
        '«Tuleb esitama taotlus» → «Tuleb esitada taotlus» (tuleb + -da; peab + -ma).',
        '«Ta on vabastatud keeleeksam» → «… keeleeksamist» (vabastatud millest).',
        '«Nõutav dokumendid» → «nõutud dokumendid» / «nõutavad dokumendid» (причастие согласуется с существительным).',
      ],
      notes: [
        'Формат — кейс: три человека, у каждого своя ситуация; ученик решает, что каждому нужно. Статус проживания и гражданство — личные темы: ученик может говорить о выдуманном человеке, родственнике или о себе только если хочет. Политику (выборы, решения Рийгикогу) не обсуждаем — факты в «Kas teadsid?» нейтральны.',
        'Пенсионеру, который готовится к экзамену, этот урок нужнее всех: дайте ему роль консультанта для «Валентины» и спросите в конце: «Какой твой первый шаг?» Студенту — Артём (образование на эстонском); уставшему — «что сделать за 15 минут в неделю»; маме — дети до 15 лет получают гражданство по заявлению родителей (если спросит — см. Integratsiooni SA).',
        'Обратная связь, 2–3 цели: ei pea + -ma против ei tohi + -da; tuleb + -da; vabastatud millest.',
      ],
    },
    discover: [
      station(B.text('068_d_hook', 'Õige või vale?', '„Eesti kodakondsuse saamiseks peab iga taotleja tegema eesti keele eksami.” Kas see on õige või vale? Ütle kohe oma vastus ja üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('068_d_talk', 'Dokumendid ja keel minu elus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Milline dokument on sinu jaoks Eestis kõige tähtsam?',
        'Kas keegi sinu tuttavatest on teinud keele- või kodakondsuseksami?',
        'Mida tunned, kui pead ametlikku kirja lugema?',
      ], [150, 210], ['Minu jaoks on kõige tähtsam …', 'Minu tuttav …', 'Ametlikku kirja lugedes …']), 'Sinu kogemus näitab, milliseid reegleid sa juba tead.'), { task: 'S02', fluency: true }),
      'Üks-ühele: ära küsi õpilase passi värvi ega staatust. Kui ta räägib ise, kuula; kui ei, räägi tuttavast. Lõpus ütle üks sõna, mida õpilane vajas (elamisluba, taotlus, eksam sooritatud).')),
      station(tag(B.vocab('068_d_vocab', 'Enne lugemist: sõnad.', ['kodakondsus — гражданство', 'taotlema — ходатайствовать (подавать заявление)', 'elamisluba — вид на жительство', 'nõue — требование', 'sooritama — сдавать (экзамен) успешно', 'sissetulek — доход', 'vabastama — освобождать', 'seaduslik — законный', 'püsiv — постоянный', 'põhiseadus — конституция']), { topic: ['elamisluba'] }), 2, 15),
      tag(purpose(B.dialogue('068_d_chat', 'Pere vestlusgrupp: vanaema tahab kodakondsust.', 'Loe vanaema ja tütre sõnumeid: mida vanaema peab tegema ja mida mitte?', 'Vanaema (Narva)', 'Tütar (Tartu)', [
        ['A', 'Elan Eestis nelikümmend aastat ja mul on hall pass. Naabri sõnul on mul kodakondsuse taotlemiseks liiga hilja.'],
        ['B', 'Ei ole hilja, vanusepiirangut ei ole! Aga sa pead sooritama kaks eksamit: keeleeksami B1 ja põhiseaduse eksami.'],
        ['A', 'B1? Ma õppisin koolis eesti keelt, aga see oli vene kool. Kas sellest tõesti ei piisa?'],
        ['B', 'Ei piisa. Keeleeksamist on vabastatud need, kes said hariduse eesti keeles, näiteks sinu lapselaps.'],
        ['A', 'Kas ma pean millestki loobuma? Ma kardan, et jään ilma oma pensionita.'],
        ['B', 'Pension ei sõltu kodakondsusest. Sina ei pea millestki loobuma, sest sul ei ole teise riigi kodakondsust.'],
        ['A', 'Aga Venemaa kodanik? Ja kus need eksamid tehakse? Ma ei tahaks Tallinna sõita.'],
        ['B', 'Teise riigi kodanik peab oma senisest kodakondsusest vabastatud olema. Eksameid tehakse ka Ida-Virumaal, tasuta nõustamine on Integratsiooni Sihtasutuses.'],
      ], 'g_read'), 'Pere vestlusest näed, kuidas üks nõue mõjutab päris inimese otsust.'), { task: 'R01' }),
      B.know('068_d_know', ['Nõutud aeg on kaheksa aastat elamist Eestis elamisloa või elamisõigusega; viimase viie aasta jooksul peab inimesel olema pikaajalise elaniku elamisluba või alaline elamisõigus. Keeleeksami tase on B1, kuid see ei ole vajalik, kui inimene on omandanud põhi-, kesk- või kõrghariduse eesti keeles. Eraldi testiga kontrollitakse, kas taotleja tunneb Eesti põhiseadust ja kodakondsuse seadust. Taotlejal peab olema püsiv seaduslik sissetulek ja registreeritud elukoht. Politsei- ja Piirivalveamet saadab taotluse valitsusele kuue kuu jooksul.'], 'Integratsiooni Sihtasutus, „Kodakondsuse taotlemine” (2026); kodakondsuse seadus', 'Kas teadsid? Kodakondsuse nõuded'),
      teach(tag(purpose(B.table('068_d_case', 'Juhtum: mida vanaema peab tegema?', 'Vasta vestluse ja „Kas teadsid?” kasti põhjal 1–4 sõnaga.', 'Küsimus, Vastus', [
        'Mitu aastat peab taotleja olema elanud Eestis elamisloa või elamisõiguse alusel? | [kaheksa/8/vähemalt kaheksa/kaheksa aastat/8 aastat/vähemalt 8]',
        'Mitu eksamit peab vanaema sooritama? | [kaks/2/kaks eksamit]',
        'Mis taseme keeleeksami ta peab sooritama? | [B1/B1-taseme/B1-taseme eksami]',
        'Miks ei pea lapselaps keeleeksamit tegema? | [ta sai hariduse eesti keeles/haridus eesti keeles/ta on keeleeksamist vabastatud/ta õppis eesti koolis]',
        'Millest peab teise riigi kodanik enne vabastatud olema? | [senisest kodakondsusest/oma kodakondsusest/teise riigi kodakondsusest/kodakondsusest]',
        'Kus saab tasuta nõustamist ja kursusi? | [Integratsiooni Sihtasutuses/Integratsiooni Sihtasutus]',
        'Mis ajaga saadab PPA taotluse valitsusele? | [kuue kuu jooksul/kuus kuud/6 kuud/6 kuu jooksul]',
      ], 'g_read'), 'Kui tead nõudeid täpselt, ei pea sa uskuma naabri kuulujutte.'), { task: 'R15', harno: 'R2b' }),
      'Pärast iga vastust küsi: „Kas see on kohustus, võimalus või vabastus?” Rida 4: ta ei pea (mitte: ei tohi). Rida 5: vanaema ei pea millestki loobuma — ta on kodakondsuseta. Kui õpilane küsib valimiste kohta, ütle, et faktid on tunni 69 kastis — ainult faktid, ilma hinnanguta.'),
    ],
    practice: [
      station(B.notice('068_p_notice', 'Märka: tema ei pea keeleeksamit tegema', [
        'Vestlusest: sa **pead sooritama** kaks eksamit · tema **ei pea** keeleeksamit **tegema** · keeleeksamist **on vabastatud** need, kes … · kodanik **peab** … **vabastatud olema**',
        '**Kohustus**: **peab** + -ma (Taotleja peab sooritama …) · **tuleb** + -da (Taotlusele tuleb lisada … · Majas tuleb prügi sorteerida.) · **on kohustatud** + -ma (ametlik) · **on vaja** + -da. **Kohustust ei ole**: **ei pea** + -ma · **ei ole vaja** + -da · **on vabastatud** millest?',
        '**Luba**: **võib** + -da · **tohib** + -da · **on lubatud**. **Keeld**: **ei tohi** + -da · **on keelatud**.',
        '**Ei pea ≠ ei tohi!** Keeleeksamit **ei pea** tegema = kohustust ei ole. Eksamil **ei tohi** telefoni kasutada = see on keelatud.',
        '**Kesksõna reeglites** (-tud / -dud = tehtud või antud asi): **sooritatud** eksam, **registreeritud** elukoht, **nõutud** dokumendid, **kehtestatud** kord. Ametlikult: „Taotlusele tuleb lisada nõutud dokumendid.”',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.choice('068_p_modal', 'Nõustaja vastab küsimustele.', 'Otsusta, kas lauses on kohustus, luba, keeld või kohustuse puudumine, ja vali sobiv väljend.', [
        ['Inimene, kes lõpetas eesti õppekeelega gümnaasiumi, … keeleeksamist.', 'on vabastatud', 'ei tohi', 'on kohustatud'],
        ['Taotlusele … lisada kõik nõutud dokumendid, ka tõend seadusliku sissetuleku kohta.', 'tuleb', 'võib', 'ei pea'],
        ['Eksamiruumis … telefoni ega muid abivahendeid kasutada, isegi kui kirjutamine on raske.', 'ei tohi', 'ei pea', 'tuleb'],
        ['Kui esimene katse ei õnnestu, … eksamit järgmisel eksamipäeval veel kord teha.', 'võib', 'ei tohi', 'on vabastatud'],
        ['Kodakondsuseta inimene … millestki loobuma, sest tal ei ole teise riigi kodakondsust.', 'ei pea', 'ei tohi', 'peab'],
        ['Taotleja … olema elanud Eestis elamisloa alusel vähemalt kaheksa aastat, see on seaduse nõue.', 'peab', 'võib', 'ei pea'],
        ['Ametnik … oskama eesti keelt oma ametikohal nõutud tasemel, muidu ta seda tööd teha ei saa.', 'on kohustatud', 'on vabastatud', 'tohib'],
      ], 'full', 'g_notice'), 'Nõustaja vastus on aus ainult siis, kui kohustus, luba ja keeld on õigesti öeldud.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Kas see on kohustus, luba, keeld või vabastus?” Read 3 ja 5 on kõige olulisemad: ei pea ≠ ei tohi; rida 7: on kohustatud + -ma. Lisaküsimus: „Mida sinu töökohas või kodus ei tohi teha ja mida ei pea tegema?”'),
    ],
    transfer: [
      station(teach(tag(purpose(B.listening('068_t_voice', 'Nõustamisliini häälsõnumid.', 'Sa oled nõustaja ja kuulad kolme häälsõnumit kaks korda. Kirjuta igasse lünka 1–2 sõna või arv.', [
        'Valentina: Tere! Mina olen Valentina Narvast, olen kuuskümmend kolm aastat vana. Elan Eestis tuhande üheksasaja kaheksakümne viiendast aastast ja mul on hall pass. Töötasin kolmkümmend aastat põlevkivitööstuses, nüüd olen pensionil. Eesti keelt räägin umbes A2-tasemel. Tahaksin teada, kas ma pean kodakondsuse pärast oma pensioni pärast muretsema. Helistage mulle palun pärast kella kahte.',
        'Artjom: Tere, siin Artjom. Olen Venemaa kodanik, aga elan Tallinnas lapsest saati ja lõpetasin eesti õppekeelega gümnaasiumi. Mul on pikaajalise elaniku elamisluba. Kas ma pean keeleeksami tegema? Ja mis saab minu Venemaa passist? Kirjutage parem e-postiga, päeval olen tööl.',
        'Oksana: Tere! Olen Oksana Pärnust. Tulin Ukrainast kaks tuhat kakskümmend kaks ja mul on ajutine kaitse. Õpin praegu B1-kursusel ja mul on hotellis püsiv töökoht. Kas ma võiksin juba järgmisel aastal kodakondsust taotleda? Mul on vaba ainult esmaspäeval.',
      ], [
        'Valentina on elanud Eestis halli passiga juba aastast [1985|tuhat üheksasada kaheksakümmend viis].',
        'Valentina tahab nõustajalt teada, kas ta peab kodakondsuse pärast muretsema oma [pensioni] pärast.',
        'Artjom on Venemaa kodanik, kuid ta lõpetas Tallinnas eesti õppekeelega [gümnaasiumi].',
        'Kuna Artjom on päeval tööl, soovib ta nõustajalt vastust [e-postiga|e-posti teel|e-kirjaga].',
        'Oksana tuli Eestisse Ukrainast ajutise kaitse alusel aastal [2022|kaks tuhat kakskümmend kaks].',
        'Oksana tahaks teada, kas ta võiks kodakondsust taotleda juba järgmisel [aastal].',
      ], 'g_read'), 'Häälsõnumitest saad iga inimese kohta täpse info, millele sinu nõuanne toetub.'), { task: 'L07' }),
      'Kuulamise tsükkel: 1) esimene kuulamine — „Mida iga helistaja tahab teada?”; 2) teine — lüngad; 3) üks lause iga inimese kohta: „Mis on tema kõige tähtsam küsimus?” Inimesed on õppenäide; kui õpilane tahab rääkida oma olukorrast, võib ta võtta selle asemel enda või tuttava loo.'), 4, 15, { final: 'advise' }),
      teach(tag(purpose(B.rolecards('068_t_advise', 'Nõustaja vastuvõtt.', 'Sa oled nõustaja. Vali üks helistaja (või oma või tuttava olukord) ja ütle 2 minutiga: mida ta peab ja ei pea tegema ning mis on esimene samm.',
        'Olukord: helistaja tuli Integratsiooni Sihtasutuse nõustamisele ja ta on segaduses: tuttavad räägivad erinevat.\nSinu eesmärk: ütle 2 minutiga, mis on tema kohustused, millest ta on vabastatud ja mis on esimene samm; vasta tema kahele küsimusele.\nPiirang: ära luba midagi, mida seadus ei luba — kui ei tea, ütle, kust täpselt küsida.',
        'Inimese kaart on õpetajal: tema küsimused ja kahtlused.',
        ['Teie olukorras on kõige tähtsam nõue …', 'Te peate kõigepealt …', 'Keeleeksamit te ei pea tegema, sest …', 'Te olete vabastatud …', 'Ärge unustage, et …', 'Taotlusele tuleb lisada …', 'Teie esimene samm on …'], ['Kas ma pean …?', 'Kas ma tohin …?', 'Mis siis, kui …?']), 'Tulemus: inimene teab, mida ta peab tegema ja mida mitte, ja tal on üks selge järgmine samm.'), { task: 'S13', level: 4 }),
      'Õpetaja kaart (sina oled helistaja). Valentina küsib: „Kas ma pean Vene kodakondsuse võtma, et Eestis pensioni saada?” (Ei — pension ei sõltu kodakondsusest.) „Kas ma tohin eksamil sõnaraamatut kasutada?” (Ei.) Vastus: aeg on käes (40 aastat), vaja on B1 ja põhiseaduse eksam, millestki loobuma ei pea; esimene samm — nõustamine ja B1-kursus. Artjom küsib: „Kas ma pean keeleeksami tegema?” (Ei — haridus eesti keeles.) „Mida ma pean veel tegema?” (Põhiseaduse eksam; peab olema vabastatud Venemaa kodakondsusest.) Oksana küsib: „Kas ma võin kohe taotleda?” (Ei — kaheksa aasta elamise nõue ei ole veel täidetud; esmalt pikaajalise elaniku elamisluba; B1 aitab juba praegu.) Õnnestunud, kui õpilane kasutab vähemalt neli erinevat väljendit (peab, ei pea, ei tohi, on vabastatud, tuleb), ei aja segi „ei pea” ja „ei tohi” ning nimetab ühe esimese sammu.'),
      extension(teach(tag(purpose(B.speaking('068_t_more', 'Rollimäng: registreerimine eksamile', 'Helista eksamikeskusesse (õpetaja) ja küsi, kuidas registreeruda B1-eksamile või põhiseaduse eksamile: millal, kus, mida kaasa võtta ja mida ei tohi eksamile kaasa võtta.', [
        'Mida sa küsid aja ja koha kohta?',
        'Mida pead kaasa võtma?',
        'Mida eksamil teha ei tohi?',
      ], [120, 180], ['Ma sooviksin registreeruda …', 'Kas ma pean …?', 'Kas eksamil tohib …?', 'Mis saab, kui ma esimesel katsel läbi ei saa?']), 'Kui küsid ise, oled eksamipäevaks valmis ja ei karda üllatusi.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled eksamikeskuse töötaja; kuupäevad on õppenäide: „Järgmine eksam on 14. märtsil Jõhvis. Registreerida tuleb internetis vähemalt kuu aega ette. Kaasa tuleb võtta isikut tõendav dokument. Telefon tuleb välja lülitada; sõnaraamatut kasutada ei tohi.” Õnnestunud, kui õpilane küsib vähemalt neli küsimust ja kordab vastused üle (peab, ei tohi, tuleb).'), 12),
      tag(exitCheck(purpose(B.gaps('068_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka sobiv väljend: ei pea, ei tohi või tuleb.', [
        'Kui oled saanud keskhariduse eesti keeles, [ei pea] sa keeleeksamit tegema.',
        'Kirjutamise ajal [ei tohi] naabriga rääkida ega telefoni kasutada.',
        'Enne eksamit [tuleb] end internetis registreerida.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kohustus, keeld ja kohustuse puudumine on selged.')), {}),
      purpose(B.selfcheck('068_t_self', ['Ma räägin, millised dokumendid ja reeglid on minu elus olulised.', 'Ma saan aru kodakondsuse nõuetest ja leian neist vajaliku info.', 'Ma eristan kohustust, luba ja keeldu: peab, ei pea, ei tohi, on vabastatud.', 'Ma annan inimesele selge nõu, mida ta peab tegema ja mida mitte.'], 'Juhtum lahendatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('068_t_letter', 'Kodus: nõuanne kirjas.', 'Sugulane küsis: „Kas ma saaksin Eesti kodakondsuse?” Kirjuta talle kodus 160–180 sõna: nõuded (elamisluba, eksamid, seaduslik sissetulek), mida ta peab ja ei pea tegema, kust saab abi. Kasuta viit kohustuse, loa või keelu väljendit.', 'Tere, …!', 'Soovin sulle edu!\n(sinu nimi)', [160, 180]), 'Sinu sugulane saab täpse nõu, mitte kuulujutu.')), { task: 'W13', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('068_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida peab inimene Eestis tegema, et kodakondsust taotleda, ja mida ta ei pea tegema.', [
        'Mis on kolm kõige tähtsamat nõuet?',
        'Kes on millestki vabastatud ja miks?',
      ], [60, 120]), 'Õpetaja kuulab, kas „ei pea” ja „ei tohi” on õigesti kasutatud.')), { task: 'S15' }),
      homework('068_t_homework', ['1. Nõuanne kirjas, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-069': {
    title: 'Pime tee bussipeatusse: kuidas teha vallale ettepanek, millele vastatakse?',
    phases: grammar('Keel: tingiv kõneviis ettepanekus — see maksaks, oht väheneks, riskiks oleks; umbisikuline tingiv: valgustid paigaldataks, tee ehitataks'),
    format: 'project',
    topic: 'town',
    canDo: 'Ma saan aru, kuidas elanik saab vallale ettepaneku teha (märgukiri, allkirjad, kaasav eelarve), võrdlen kahte lahendust kulu ja riski järgi tingivas kõneviisis (see maksaks, paigaldataks, riskiks oleks), esitlen oma kodukoha probleemi lahendust ja kirjutan vallale ametliku ettepaneku.',
    teacherPage: {
      goal: 'Мини-проект: предложение волости (тёмная дорога или своя проблема); märgukiri, 1 %, rahvaalgatus.ee, kaasav eelarve; условное наклонение; презентация комиссии и «Minu kodukoha teejuht».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок; станция 2 — инфочас один раз, 4 пропуска; станция 3 — правило и 4 строки; станция 4 — три решения и презентация 1 минута без вопросов комиссии; продукт модуля — дома.',
      hook: '«Между твоим домом и автобусной остановкой 300 метров дороги без фонарей; зимой там темно уже в пять. Что ты делаешь: пишешь в волость, собираешь подписи соседей, говоришь с депутатом или ждёшь?» Голосуйте оба. В конце урока ученик знает, какой путь когда работает.',
      plan: [
        '0–3: крючок — тёмная дорога: что я делаю?',
        '3–10: станция 1 — разговор: что мешает на моей улице, писал ли я когда-нибудь в волость или город',
        '10–25: станция 2 — слова (2 мин), прогноз, инфочас юриста волости дважды, 7 пропусков',
        '25–37: станция 3 — заметить условное наклонение в инфочасе → правило → черновик предложения: 7 трансформаций',
        '37–52: станция 4 — три решения (цена, срок, риск), презентация комиссии 2–3 минуты и вопросы; «Minu kodukoha teejuht»',
        '52–64: «Kui aega jääb» — спор по карточкам: освещение или молодёжный центр (S17)',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: märgukiri волости 180–200 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Инфочас (текст свой, юрист Кайе Лепп — вымышленная): Märgukirjale ja selgitustaotlusele vastamise ning kollektiivse pöördumise esitamise seadus — ответ на märgukiri без промедления, не позже 30 календарных дней, в исключительных случаях до 2 месяцев; обратиться может любой человек; KOKS § 32 — инициатива не менее 1 % жителей волости с правом голоса (с 16 лет), с 2024 г. и в свободной форме, рассмотрение в течение 3 месяцев; rahvaalgatus.ee — коллективное обращение в Рийгикогу от 1000 подписей; kaasav eelarve — во многих самоуправлениях. Цены трёх решений — учебный пример (порядок величины), не смета. «Mäletad?» о выборах: ERR 10.10.2025 (поправка Рийгикогу 26.03.2025, решение Riigikohus); тот же факт — в B1 модуле 15 (073), поэтому здесь он мост, а не новость. Не обсуждаем, хорошо это или плохо: только то, что märgukiri доступен каждому.',
      groups: 'Инфочас — каждый сам, сверка в паре. Станция 4: в группе каждый выбирает своё решение и защищает его, остальные — комиссия; в 1:1 ученик презентует, вы — член комиссии.',
      errors: [
        '«Vald paigaldab valgustid, kui …» (обещание) → «Vald paigaldaks valgustid, kui …» (предложение, условие).',
        '«See maksaks umbes kaksteist tuhat eurot» — верно; «See maksab oleks …» — смешение форм.',
        '«Valgustid paigaldaks järgmisel aastal» (кто?) → «Valgustid paigaldataks järgmisel aastal» (безличное условное -taks).',
        '«Riskiks on, et …» → в предложении «Riskiks oleks, et …» (это ещё не произошло).',
      ],
      notes: [
        'Формат — проект: результат — предложение (проблема → два решения → выбор и причина) и продукт модуля «Minu kodukoha teejuht» из четырёх строк (уроки 66–69), с которым ученик выступит на контрольной 070.',
        'Тёмная дорога — пример; ученик может взять свою проблему (парковка у школы, шум, нет скамейки у остановки, детская площадка). В городе — «линнаосавалитсус»; в общежитии — администрация. Подчеркните: märgukiri может отправить каждый, гражданство не нужно.',
        'Обратная связь, 2–3 цели: -ks- в условном (maksaks, väheneks), безличное -taks / -daks; структура «проблема → решения → выбор».',
      ],
    },
    discover: [
      station(B.text('069_d_hook', 'Hääleta', 'Sinu kodu ja bussipeatuse vahel on 300 meetrit teed ilma tänavavalgustuseta. Talvel on seal kell viis juba pime. Mida sa teed: kirjutad vallale, kogud naabrite allkirju, räägid volikogu liikmega või ootad? Hääleta kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.table('069_d_talk', 'Minu kodukoha mured.', `Kirjuta kolm muret ja räägi neist. ${OWN_OR_INVENTED}`, 'Mis häirib?, Kus?, Kes peaks lahendama?', [
        '1. | |',
        '2. | |',
        '3. | |',
      ], 'g_vocab'), 'Sinu kodukoha mure võib saada selle tunni projektiks.'), { task: 'S14', fluency: true }),
      'Üks-ühele: õpilane kirjutab märksõnad ja räägib igast murest 2–3 lauset; sina räägid ühe mure oma tänavalt. Küsi: „Kas oled kunagi vallale või linnale kirjutanud?” Kui õpilane ütleb „vald ei kuula niikuinii”, ära vaidle — tunni lõpuks näeb ta, millal kuulatakse. Lõpus ütle üks sõna, mida õpilane vajas (tänavavalgustus, kõnnitee, ülekäigurada).')),
      station(tag(B.vocab('069_d_vocab', 'Enne kuulamist: sõnad.', ['ettepanek — предложение', 'vallavalitsus — управа волости', 'volikogu — совет (самоуправления)', 'pöördumine — обращение', 'allkiri — подпись', 'eelarve — бюджет', 'kulu — расход', 'tähtaeg — срок', 'lahendus — решение', 'tänavavalgustus — уличное освещение']), { topic: ['tänavavalgustus'] }), 2, 15),
      teach(tag(purpose(B.listening('069_d_info', 'Valla infotund: kuidas teha ettepanekut?', 'Enne kuulamist arva, mis lünka tuleb. Kuula infotundi kaks korda ja kirjuta igasse lünka 1–2 sõna.', INFO_069, [
        'Märgukirja võib vallale saata iga inimene, ka see, kellel ei ole Eesti [kodakondsust].',
        'Seaduse järgi tuleb märgukirjale vastata [kolmekümne|30] kalendripäeva jooksul.',
        'Keerulise küsimuse korral võib vastamise aega pikendada kuni kahe [kuuni].',
        'Juristi soovitusel võiks ettepanekule lisada foto või [kaardi].',
        'Volikogu otsust saab algatada vähemalt üks [protsent] valla hääleõiguslikest elanikest.',
        'Riigikogule saab kollektiivse pöördumise saata, kui sellel on vähemalt [tuhat|1000] allkirja.',
        'Kaasavas eelarves saavad elanikud ise ideid esitada ja nende poolt [hääletada].',
      ], 'g_read'), 'Kuuled, millised teed on sul päriselt olemas ja millal vald peab vastama.'), { voice: 'news', task: 'L03' }),
      'Kuulamise tsükkel: 1) prognoos pliiatsiga; 2) esimene kuulamine — „Milliseid teid jurist nimetab?” (märgukiri, 1 % algatus, rahvaalgatus.ee, kaasav eelarve); 3) teine — lüngad; 4) üks lause: „Milline tee sobib sinu murele ja miks?” Rõhuta: märgukirja võib saata igaüks, kodakondsust ei ole vaja.'),
    ],
    practice: [
      station(B.notice('069_p_notice', 'Märka: see maksaks umbes …', [
        'Infotunnist: kui tee äärde **paigaldataks** kuus valgustit, **oleks** lastel turvalisem · see **maksaks** umbes kaksteist tuhat eurot',
        '**Tingiv kõneviis** = ettepanek või võimalus, mitte veel tegelikkus: tegusõna + **-ks-**: maksa**ks**, väheneks, oleks, võiks; mitmus: maksaksid, oleksid.',
        '**Umbisikuline tingiv -taks / -daks** (kes teeb, ei ole tähtis: vald, firma): paigalda**taks**, ehita**taks**, too**daks** (tund 66: suunatakse → siin suunataks).',
        '**Ettepaneku laused**: Teen ettepaneku, et vald **paigaldaks** … · Lahendus A **maksaks** … · **Riskiks oleks**, et … · Kui …, **väheneks** …',
        'Võrdle: Vald **paigaldab** valgustid (otsus on tehtud). → Vald **paigaldaks** valgustid, kui raha jätkuks (ettepanek, tingimus). · Kui peatuse juurde **toodaks** konteinerid, **saaks** prügi kohe sorteerida.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('069_p_cond', 'Ettepaneku mustand viisakamaks.', 'Mustandis on kõik nagu otsustatud. Kirjuta lause ümber tingivas kõneviisis ja alusta antud sõnadega.', [
        ['Vald paneb tee äärde kuus valgustit ja tänavavalgustus põleb talvel kella kuuest kaheksani.', 'Teen ettepaneku, et vald …', 'Teen ettepaneku, et vald paneks tee äärde kuus valgustit ja tänavavalgustus põleks talvel kella kuuest kaheksani.'],
        ['Valgustid maksavad umbes kaksteist tuhat eurot ja see kulu jääb järgmise aasta eelarvesse.', 'Valgustid …', 'Valgustid maksaksid umbes kaksteist tuhat eurot ja see kulu jääks järgmise aasta eelarvesse.'],
        ['Kõnnitee ehitatakse järgmisel suvel, kui tähtaeg ei muutu.', 'Kõnnitee …', 'Kõnnitee ehitataks järgmisel suvel, kui tähtaeg ei muutuks.'],
        ['Kui bussipeatus tuuakse kahesaja meetri võrra lähemale, on laste koolitee lühem.', 'Kui bussipeatus …', 'Kui bussipeatus toodaks kahesaja meetri võrra lähemale, oleks laste koolitee lühem.'],
        ['Selle lahenduse risk on see, et töö venib talve ja tähtaeg lükkub edasi.', 'Riskiks …', 'Riskiks oleks see, et töö veniks talve ja tähtaeg lükkuks edasi.|Riskiks oleks, et töö veniks talve ja tähtaeg lükkuks edasi.'],
        ['Helkurid on odavad, aga need ei lahenda pimeda tee probleemi.', 'Helkurid …', 'Helkurid oleksid odavad, aga need ei lahendaks pimeda tee probleemi.|Helkurid oleksid odavad, kuid need ei lahendaks pimeda tee probleemi.'],
        ['Me võime naabritega pöördumisele allkirju koguda ja selle vallale saata.', 'Me …', 'Me võiksime naabritega pöördumisele allkirju koguda ja selle vallale saata.|Me võiksime koos naabritega pöördumisele allkirju koguda ja selle vallale saata.'],
      ], 'full', 'g_notice'), 'Tingiv kõneviis teeb ettepanekust viisaka ja ausa: see on idee, mitte nõudmine.'), { task: 'G06' }),
      'Pärast iga rida küsi: „Kas see on juba otsustatud või alles ettepanek?” Rida 3 ja 4: umbisikuline tingiv -taks / -daks (ehitataks, toodaks). Rida 6: kaks tegusõna, mõlemad tingivas. Lisaküsimus: „Mis maksaks sinu tänaval kõige vähem ja aitaks kõige rohkem?”'),
      B.know('069_p_vote', ['Mäletad, B1-kursusel rääkisime valimisõigusest: Riigikogu muutis märtsis 2025 põhiseadust ja nüüd on kohalikel valimistel hääleõigus Eesti ja Euroopa Liidu kodanikel. Riigikohtu hinnangul ei ole see muudatus põhiseadusega vastuolus. Ettepaneku tegemiseks ei ole hääleõigust vaja: märgukirja võib vallale saata iga inimene, ka ilma kodakondsuseta.'], 'ERR, „Riigikohus: valimisõiguse piiramine polnud põhiseadusega vastuolus” (10.10.2025); märgukirjale ja selgitustaotlusele vastamise ning kollektiivse pöördumise esitamise seadus', 'Mäletad? Hääleõigus ja ettepanek'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('069_t_options', 'Kolm lahendust pimedale teele.', 'Loe kolme lahenduse kaarti. Võrdle hinda, aega ja riski: millise valiksid sina?', [
        ['A. Tänavavalgustus (6 posti)', ['hinnanguliselt umbes 12 000 eurot', 'vald saab selle teha alles järgmise aasta eelarvest', 'püsiv lahendus kõigile; LED-valgustid kulutavad vähe elektrit ja vähendavad heitmeid'], []],
        ['B. Bussipeatus 200 meetrit lähemale', ['hinnanguliselt umbes 3000 eurot', 'otsustab ühistranspordikeskus koos vallaga, võtab aega', 'osa naabreid peab kõndima kaugemale'], []],
        ['C. Helkurid ja taskulambid kooliõpilastele', ['umbes 300 eurot', 'saab teha kohe ja raha ei raisata', 'pimedus jääb alles'], []],
      ], '3', 'g_read'), 'Kaardid annavad sulle numbrid, millega oma valikut põhjendad.'), { task: 'R11', level: 3 }), 4, 15, { final: 'present' }),
      teach(tag(purpose(B.rolecards('069_t_pitch', 'Projekt: esitle ettepanekut valla komisjonile.', 'Vali oma kodukoha probleem (või pime tee kaartidelt). Esitle 2–3 minutit: probleem, kaks lahendust kulu ja riski järgi, sinu valik ja põhjus; siis vasta komisjoni küsimustele. Õpetaja on komisjoni liige.',
        'Olukord: valla komisjon kuulab elanike ettepanekuid enne järgmise aasta eelarvet; ettepanekute tähtaeg on täna ja sul on 3 minutit.\nSinu eesmärk: probleem (kus, keda puudutab) → kaks lahendust (hind, aeg, risk) → sinu valik ja põhjus; vasta kahele küsimusele.\nPiirang: ära nõua — paku tingivas kõneviisis ja ütle ka oma lahenduse nõrk koht.',
        'Komisjoni liikme kaart on õpetajal: tema kolm küsimust.',
        ['Probleem puudutab eelkõige …', 'Lahendus A maksaks …, kuid …', 'Vaatamata kulule …', 'Õiglane oleks, kui …', 'Kui …, väheneks …', 'Riskiks oleks, et …', 'Teen ettepaneku, et vald …', 'Esimese sammuna võiks …'], ['Kust raha tuleks?', 'Mis juhtuks, kui …?', 'Kas naabrid toetavad?']), 'Tulemus: komisjon teab, mida sa pakud, mis see maksaks ja miks just see lahendus.'), { task: 'S16', main: true, level: 4, harno: 'S1' }),
      'Õpetaja kaart (komisjoni liige, sõbralik, kuid täpne). Küsimused ükshaaval: 1) „Kust raha tuleks, kui tänavune eelarve on juba jagatud?” (hea vastus: järgmise aasta eelarve, kaasav eelarve, etappideks jagamine); 2) „Mis juhtuks, kui me ei teeks midagi?”; 3) „Kas naabrid toetavad — kas teil on allkirju?” Õnnestunud, kui õpilane räägib 2–3 minutit, nimetab kaks lahendust koos hinna ja riskiga, kasutab vähemalt neli tingiva vormi (maksaks, oleks, paigaldataks, väheneks) ja vastab kahele küsimusele rahulikult.'),
      tag(purpose(B.planning('069_t_product', 'Mooduli tulemus: minu kodukoha teejuht.', 'Täida oma kodukoha teejuht: igale reale üks lause tundidest 66–69. Sellest räägid mooduli kontrollis 1 minuti.', [
        'Abi (tund 66): kuhu ma pöördun tervisemurega öösel ja tööpäeval? Üks lause umbisikulises vormis.',
        'Osalemine (tund 67): millega ma liitun või milles osalen? Õige kääne.',
        'Õigused ja kohustused (tund 68): mida ma pean, võin ja ei pea tegema?',
        'Ettepanek (tund 69): mida ma oma vallale pakun? Üks lause tingivas kõneviisis.',
      ], 3), 'Teejuht jääb sulle: see on sinu mooduli tulemus ja kontrolli sõnavõtu alus.'), { task: 'W02', level: 3 }),
      extension(teach(tag(purpose(B.speaking('069_t_more', 'Arutelu: kuhu läheb kaasava eelarve raha?', 'Vallal on kaasavas eelarves raha ainult ühele ideele. Vali seisukoht A või B, too kaks argumenti ja näide, arutage õpetajaga ning jõudke ühise ettepanekuni.', [
        'A: tänavavalgustus pimedale teele — talvel on kell viis juba pime, lapsed käivad seal iga päev, lahendus jääks aastateks.',
        'B: noortekeskus laupäeviti lahti — noortel ei ole nädalavahetusel kuskil koos olla, see maksaks vähem, vabatahtlikud on valmis aitama.',
        'Milline on teie ühine ettepanek ja miks?',
      ], [120, 180], ['Minu ettepanek on …', 'See maksaks …, kuid …', 'Ma saan aru, aga …', 'Kas võiksime kokku leppida, et …?']), 'Tulemus: te jõuate ühise ettepanekuni, mida mõlemad saavad vallale põhjendada.'), { task: 'S17', level: 4 }),
      'Kui aega jääb (12 min). Kui õpilane valib A, oled sina B, ja vastupidi. Teises voorus tõmba uudis: „Vald saab riigilt lisaraha liiklusohutuseks” või „Noortekeskuse juhataja lahkub”. Õnnestunud, kui õpilane esitab kaks argumenti koos näitega, kasutab vähemalt kolme tingiva vormi ja te sõnastate ühise ettepaneku (näiteks: valgustus sel aastal, noortekeskus järgmise aasta ideede seas).'), 12),
      tag(exitCheck(purpose(B.gaps('069_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev tegusõna tingiva kõneviisi vormis.', [
        'Kui tänavale [paigaldataks] valgustid, oleks õhtul palju turvalisem. (paigaldama, umbisikuline)',
        'Uus kõnnitee [maksaks] vallale umbes kümme tuhat eurot. (maksma)',
        'Teen ettepaneku, et vald [arutaks] seda küsimust juba järgmisel koosolekul. (arutama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas ettepaneku tingiv kõneviis on käes.')), {}),
      purpose(B.selfcheck('069_t_self', ['Ma räägin oma kodukoha murest ja sellest, keda see puudutab.', 'Ma saan aru, kuidas elanik saab vallale ettepaneku teha ja millal vald peab vastama.', 'Ma kasutan ettepanekus tingivat kõneviisi: maksaks, oleks, paigaldataks, riskiks oleks.', 'Ma esitlen lahendust komisjonile ja vastan küsimustele.'], 'Ettepanek esitletud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('069_t_letter', 'Kodus: märgukiri vallale.', 'Kirjuta kodus oma vallale või linnale märgukiri 180–200 sõna: probleem (kus ja keda see puudutab), kaks lahendust kulu ja riski järgi, sinu valik koos põhjusega ja palve vastata seaduse järgi 30 päeva jooksul. Kasuta vähemalt viit tingiva kõneviisi vormi.', 'Lugupeetud vallavalitsus!', 'Lugupidamisega\n(sinu nimi, aadress, e-post)', [180, 200]), 'Vallavalitsus saab kirja, millele on lihtne ja kohustuslik vastata.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('069_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma kodukoha teejuhi järgi: neli asja, mida sa nüüd tead ja teed.', [
        'Mis on sinu teejuhis kõige kasulikum ja miks?',
        'Mida sa vallale pakud ja mis see maksaks?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('069_t_homework', ['1. Märgukiri vallale, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-070': {
    title: 'Kontroll 14 — ühiskond ja avalikud teenused',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 14, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 14, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 14, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid ühiskonna ja avalike teenuste teemal, kirjutan vallavalitsusele umbes 140-sõnalise kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma kodukoha teejuhist; umbisikuline tegumood, rektsioon, kohustuse väljendid ja tingiv kõneviis on õiged.',
    // Kontroll 14 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2b; S1, S2). Own texts on the module's content: social services (066),
    // volunteering (067), rules and duties (068), the proposal to the municipality (069), plus a village library that
    // became a community room and a family carer's interview (social services of 066 from the carer's side); timed by the
    // Harno part headers.
    discover: [
      B.tip('070_d_how', 'Kontroll: lugemine (Harno B2 vormis, 45 minutit)', 'See kontroll võtab kaks tundi. Täna loed ja kuulad ning teed keeleosa; järgmises tunnis kirjutad ja räägid. Lugemisosas on neli ülesannet nagu Harno B2 eksamil, ainult lühemalt. Sõnaraamatut ei kasutata.', 'full'),
      tag(B.vocab('070_d_vocab', 'Tunnid 66–69: sõnad, mis aitavad', ['pöörduma — обращаться', 'sotsiaaltöötaja — соцработник', 'vabatahtlik — доброволец', 'osalema — участвовать', 'vastutama — отвечать (за что)', 'kodakondsus — гражданство', 'nõue — требование', 'ettepanek — предложение', 'volikogu — совет (самоуправления)', 'eelarve — бюджет'], '2'), { topic: ['sotsiaaltöötaja'] }),
      PART('070_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('070_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit kohalikust elust ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Kohalik elu ei ole ainult volikogu asi', [
        '(A) Paljud inimesed ütlevad, et kohalik elu on poliitikute asi: neli aastat korraga otsustab volikogu ja elanik saab ainult oodata. See on mugav mõte, kuid see ei ole tõsi. Igal nädalal tehakse vallas otsuseid, mis puudutavad meie teid, lasteaedu, raamatukogusid ja bussiaegu. Kes neist teada saab ja oma arvamuse ütleb, mõjutab tulemust rohkem, kui arvatakse. Volikogu istungid on avalikud, nende päevakorrad ja otsused ilmuvad valla kodulehel ning paljudes valdades saab istungeid ka otse vaadata.',
        '(B) Kõige lihtsam tee on märgukiri. Seda võib vallale saata iga inimene, ka see, kellel ei ole Eesti kodakondsust ega õigust valimistel hääletada. Seadus kohustab ametnikke vastama kolmekümne päeva jooksul. Vastus ei pruugi olla „jah”, kuid vähemalt saab elanik teada, miks midagi ei tehta, ja see on juba teadmine, millega edasi minna. Märgukirja võib saata e-postiga, paberil või valla iseteeninduses ning selleks ei ole vaja juristi abi.',
        '(C) Kirja mõju sõltub sellest, kuidas see on kirjutatud. Kiri, kus on ainult viha, pannakse sageli kõrvale. Kiri, kus on kirjas probleem, koht, inimesed, keda see puudutab, ja kaks võimalikku lahendust koos hinnaga, jõuab palju tõenäolisemalt eelarve aruteluni. Ametnik ei pea siis ise lahendust välja mõtlema, ta saab seda kohe hinnata. Abiks on ka foto, kaart või naabrite lühike küsitlus: need näitavad, et probleem ei ole ühe inimese tuju, vaid paljude igapäevane mure.',
        '(D) Üksik kiri on aga nõrgem kui naabrite ühine hääl. Kui vähemalt üks protsent valla hääleõiguslikest elanikest teeb ettepaneku, peab volikogu selle kolme kuu jooksul arutusele võtma. Paljudes valdades on ka kaasav eelarve, kus elanikud ise ideid esitavad ja nende poolt hääletavad. Nii on Eestis tekkinud mänguväljakuid, terviseradu ja külaplatse, mida keegi ülevalt ei käskinud ehitada. Tihti võidab hääletuse mitte kõige suurem, vaid kõige paremini selgitatud idee, sest naabrid näevad, kellele see kasu toob.',
        '(E) Osalemine ei tähenda ainult kirju ja allkirju. Tartu Ülikooli uuringu järgi osaleb vabatahtlikus tegevuses iga neljas-viies Eesti elanik. Üle kolme tuhande inimese on vabatahtlikud päästjad, kes jõuavad maal õnnetuse juurde sageli enne kutselisi. Teised juhendavad noori, aitavad raamatukogus eakaid arvutiga või räägivad keeleõppijaga eesti keelt. Selline töö ei vaja volikogu otsust, vaid ainult kahte vaba tundi nädalas. Paljud vabatahtlikud ütlevad, et said ise vähemalt sama palju, kui andsid: uusi tuttavaid, oskusi ja tunde, et nende kodukohas on nende jaoks koht.',
        '(F) Muidugi ei ole kõigil võrdselt aega ega jõudu. Vahetustega töötav inimene, väikese lapse ema või eakas, kellel on raske kõndida, ei saa iga kuu talgutel käia. Seepärast on oluline, et osalemise viise oleks palju ja et need oleksid lihtsad: ettepaneku saab saata internetis, keelesõbraga kohtuda veebis ja valla infotunni võib järele vaadata. Kui osalemine on raske, osalevad ainult need, kellel on niigi kõige rohkem aega. Siis kuuleb vald ainult osa elanike häält ja otsused sobivad vaid neile.',
        '(G) Kohalik elu ei parane sellest, et keegi ootab paremat volikogu. See paraneb siis, kui elanikud ütlevad, mis neid häirib, ja pakuvad, mida teha. Vald peab kuulama ja vastama, elanik peab küsima ja pakkuma. Kumbki pool ei saa seda tööd teise eest ära teha. Kui järgmine kord tundub, et „niikuinii ei muutu midagi”, tasub enne loobumist küsida: kas ma olen oma ettepaneku kirja pannud, naabritega rääkinud ja vastust oodanud? Sageli algab muutus just sellest ühest kirjast.',
        'Allikas: autori arvamus; faktid: märgukirjale ja selgitustaotlusele vastamise ning kollektiivse pöördumise esitamise seadus; kohaliku omavalitsuse korralduse seadus § 32; Tartu Ülikool (2026); ERR (2026).',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Kohalik elu ei ole ainult volikogu asi”?', 'ka elanikud mõjutavad kohalikku elu|elanik saab ise osaleda ja pakkuda|kohalikku elu teevad nii vald kui ka elanikud'], ['Milline osalemise viis sobiks sinu ellu kõige paremini ja miks?']]),
      tag(B.choice('070_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali artikli põhjal iga küsimuse juurde üks õige vastus.', [
        ['Millist levinud mõtet autor lõigus A ümber lükkab?', 'et elanik saab ainult oodata, kuni volikogu otsustab', 'et vallas tehakse otsuseid harva', 'et raamatukogud on tähtsamad kui teed', 'et poliitikud ei tee midagi'],
        ['Mis on lõigu B järgi märgukirja eelis, isegi kui vastus on „ei”?', 'elanik saab teada, miks midagi ei tehta', 'vald peab raha kohe eraldama', 'kirjale vastatakse ühe päevaga', 'kirja võivad saata ainult kodanikud'],
        ['Milline kiri jõuab lõigu C järgi tõenäolisemalt eelarve aruteluni?', 'kiri, kus on probleem ja kaks lahendust koos hinnaga', 'kiri, kus on palju emotsioone', 'kiri, kus on ainult kriitika', 'kiri, mille on kirjutanud ametnik'],
        ['Mis juhtub lõigu D järgi, kui ühe protsendi hääleõiguslike elanike ettepanek on koos?', 'volikogu peab selle kolme kuu jooksul arutusele võtma', 'ettepanek kehtib kohe', 'vald korraldab uued valimised', 'Riigikogu teeb otsuse'],
        ['Miks peab lõigu F järgi osalemise viise olema palju?', 'sest kõigil ei ole sama palju aega ja jõudu', 'sest vald tahab rohkem kirju', 'sest talgud on keelatud', 'sest internet ei tööta maal'],
        ['Milline mõte võtab artikli kõige paremini kokku?', 'vald peab kuulama ja vastama, elanik peab küsima ja pakkuma', 'kohalik elu paraneb ainult uue volikoguga', 'vabatahtlik töö vajab alati volikogu luba', 'märgukiri on mõttetu'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('070_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Mõnesse lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Hästi ette valmistatud ettepanekut on ametnikul lihtsam hinnata. | [C]',
        '2. Kirjutada võib ka inimene, kes valimistel ei hääleta. | [B]',
        '3. Mõned rajatised on sündinud elanike endi ideedest. | [D]',
        '4. Kui osaleda on keeruline, jäävad paljud kõrvale. | [F]',
        '5. Teiste aitamiseks ei pea ootama kellegi luba. | [E]',
        '6. Vastutus kohaliku elu eest on jagatud kahe poole vahel. | [G]',
        '7. Igapäevased otsused puudutavad elanike elu pidevalt, mitte ainult valimiste ajal. | [A]',
        '8. Abi võib maal tulla kiiremini kui kutselistelt. | [E]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('070_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Raamatukogu lugeja kirjutab vallavalitsusele. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri vallavalitsusele', [
        'Lugupeetud vallavalitsus!',
        'Kirjutan teile külaraamatukogu lahtiolekuaegade pärast. Valla lehes teatati, et alates jaanuarist [suletakse] (sulgema, umbisikuline olevik) raamatukogu laupäeviti. Otsust [ei arutatud] (arutama, umbisikuline minevik, eitus) elanikega.',
        'Mina osalen raamatukogu [digiõppes] (digiõpe) vabatahtliku juhendajana ja aitan eakaid nende [küsimustega] (küsimus, mitmus). Paljud neist töötavad nädala sees ega saa tulla, sest nende aeg sõltub [töögraafikust] (töögraafik). Laupäev on neile ainus võimalus.',
        'Ma saan aru, et vallal [tuleb] (kohustus) raha kokku hoida. Samas [ei pea] (kohustust ei ole) raamatukogu olema avatud viis päeva järjest.',
        'Teen ettepaneku, et raamatukogu [oleks] (olema, tingiv) suletud hoopis esmaspäeviti. Nii [väheneks] (vähenema, tingiv) kulu sama palju, kuid töötavad inimesed ei jääks ilma. Ootan teie [vastust] (vastus) seaduse järgi kolmekümne päeva jooksul.',
        'Lugupidamisega\nraamatukogu lugeja ja vabatahtlik',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('070_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas raamatukogust sai küla elutuba', [
        'Meie külas oli raamatukogu, kuhu käis nädalas vaid paar lugejat. [[Vald hakkas arutama, kas seda on üldse vaja.]]',
        'Mõned külaelanikud otsustasid, et nad ei jää ootama. [[Nad kirjutasid vallale ettepaneku ja kogusid sellele allkirju.]]',
        'Ettepanekus oli kirjas, et raamatukogu võiks olla ka koht, kus inimesed kohtuvad. [[Vald vastas kuu aja pärast ja lubas proovida üks aasta.]]',
        'Esimesena avati keeletuba, kus vabatahtlikud räägivad õppijatega eesti keelt. [[Varsti tulid juurde ka eakate arvutitund ja laste kodutööklubi.]]',
        'Alguses olid kõik vabatahtlikud väga väsinud. [[Vaatamata sellele ei loobunud keegi, sest tulijaid oli iga nädalaga rohkem.]]',
        'Aasta lõpus käis raamatukogus juba sada inimest nädalas. [[Nüüd nimetatakse seda küla elutoaks.]]',
      ], ['Seepärast otsustas vald raamatukogu kohe sulgeda.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('070_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus? Kirjuta 3–4 lauset: üks autori mõte (autori sõnul …), sinu arvamus ja näide oma kodukohast. Kasuta ühte tingiva kõneviisi vormi (oleks, võiks).', [3, 4], ['autori sõnul', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('070_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kõigepealt keeleosa: parandad sõnumeid ja ütled mõtte teisiti. Siis kuulamine nagu Harno B2 eksamil, lühemalt: teateid kuuled ühe korra, intervjuud kaks korda ja õige-vale väidete jaoks veel kolmandat korda.', 'full'),
      B.tip('070_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Sõnumid ja laused on tundide 66–69 teemadel: arstiabi, vabatahtlik töö, reeglid ja ettepanek vallale. Paranda ja ütle teisiti nii, et lugeja saab sinust täpselt aru.', 'full'),
      B.errorfix('070_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Tuttav palus, et vaataksid tema sõnumid enne saatmist üle. Igas sõnumis on üks viga: kirjuta see õigesti.', [
        ['Perearstikeskuse teates oli kirjas, et uusi patsiente praegu ei võetakse.', 'Perearstikeskuse teates oli kirjas, et uusi patsiente praegu ei võeta.'],
        ['Patsienti suunatakse vajaduse korral eriarsti juurde.', 'Patsient suunatakse vajaduse korral eriarsti juurde.'],
        ['Mu õde liitus eelmisel kuul vabatahtlike päästjatele.', 'Mu õde liitus eelmisel kuul vabatahtlike päästjatega.'],
        ['Talgujuht vastutab kõigi osalejate ohutusest.', 'Talgujuht vastutab kõigi osalejate ohutuse eest.'],
        ['Kuna ta lõpetas eesti gümnaasiumi, ei tohi ta keeleeksamit teha.', 'Kuna ta lõpetas eesti gümnaasiumi, ei pea ta keeleeksamit tegema.'],
        ['Teen ettepaneku, et vald paigaldab tänavale valgustid, kui raha jätkub.', 'Teen ettepaneku, et vald paigaldaks tänavale valgustid, kui raha jätkub.|Teen ettepaneku, et vald paigaldaks tänavale valgustid, kui raha jätkuks.'],
      ]),
      B.transformation('070_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti ja alusta antud sõnadega.', [
        ['Vald sulges eelmisel aastal kaks bussipeatust.', 'Eelmisel aastal …', 'Eelmisel aastal suleti kaks bussipeatust.|Eelmisel aastal suleti vallas kaks bussipeatust.'],
        ['Õde ei pikenda retsepte telefoni teel.', 'Retsepte …', 'Retsepte ei pikendata telefoni teel.'],
        ['Mul on huvi looduse vastu ja ma tahan aidata.', 'Ma huvitun …', 'Ma huvitun loodusest ja tahan aidata.|Ma huvitun loodusest ja ma tahan aidata.'],
        ['Kohustust keeleeksamit teha tal ei ole.', 'Ta ei …', 'Ta ei pea keeleeksamit tegema.'],
        ['Kui vald ehitaks kõnnitee, oleks laste koolitee ohutum.', 'Kui kõnnitee …', 'Kui kõnnitee ehitataks, oleks laste koolitee ohutum.'],
        ['Selle lahenduse risk on, et töö venib.', 'Riskiks …', 'Riskiks oleks, et töö veniks.|Riskiks oleks see, et töö veniks.'],
      ]),
      PART('070_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('070_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet raamatukogu, päästeameti, valla ja linna sotsiaalosakonna elust, igaüht ühe korra. Kirjuta lünka 1–2 sõna.', [
        '1. Hea lugeja! Raamatukogu on remondi tõttu suletud kuni kümnenda detsembrini. Raamatuid saab sel ajal tagastada kultuurimaja fuajees asuvasse kasti.',
        '2. Päästeamet tuletab meelde: igas kodus peab olema töötav suitsuandur. Kui soovite, et vabatahtlik päästja tuleks teie koju tasuta nõustama, helistage infotelefonile.',
        '3. Vallavalitsus teatab: kaasava eelarve ideid saab esitada kuni märtsi lõpuni. Igal elanikul, kes on vähemalt neliteist aastat vana, on õigus hääletada.',
        '4. Linna sotsiaalosakond teatab: eakate päevakeskus on nüüdsest avatud ka laupäeviti kella kümnest kaheni. Lõunasöögi soovist tuleb teatada eelmisel päeval.',
      ], [
        'Remondi tõttu on raamatukogu lugejatele suletud kuni kümnenda [detsembrini].',
        'Remondi ajal saab laenatud raamatuid tagastada kultuurimaja [fuajees|fuajeesse] asuvasse kasti.',
        'Päästeameti sõnul peab igas kodus olema vähemalt üks töötav [suitsuandur].',
        'Vabatahtlik päästja tuleb soovi korral inimese koju nõustama [tasuta].',
        'Kaasava eelarve hääletusel võivad osaleda kõik elanikud alates [neljateistkümnest|14|neljateistkümnendast] eluaastast.',
        'Linna eakate päevakeskus on nüüdsest avatud ka [laupäeviti|laupäeval].',
      ]),
      tag(B.listening('070_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime omastehooldajatest ehk inimestest, kes hoolitsevad oma lähedase eest. Stuudios on Irina Sepp Kohtla-Järvelt, kelle ema on kaheksakümmend seitse aastat vana. Irina, kuidas see kõik algas?',
        'Irina: Kolm aastat tagasi kukkus ema talvel kodus ja murdis käe. Pärast haiglat ei saanud ta enam üksi poes käia ega ahju kütta. Mina töötan poes vahetustega ja elan teises linnaosas.',
        'Saatejuht: Mida te tegite?',
        'Irina: Alguses käisin iga päev pärast tööd ema juures. Kahe kuu pärast olin nii väsinud, et jäin ise haigeks. Siis soovitas üks kolleeg pöörduda linna sotsiaaltöötaja poole.',
        'Saatejuht: Kuidas see läks?',
        'Irina: Sotsiaaltöötaja tuli ema juurde koju ja hindas, mida ta veel ise teeb. Ema oli alguses vastu, ta ütles, et võõrast inimest ta koju ei taha. Kokkuleppele jõudsime alles teisel kohtumisel.',
        'Saatejuht: Millist abi te saite?',
        'Irina: Kaks korda nädalas käib ema juures koduhooldaja, kes toob toitu ja koristab. Lisaks sai ema häirenupu. Eelmisel talvel kukkus ta jälle, vajutas nuppu ja kiirabi oli kohal kahekümne minutiga.',
        'Saatejuht: Kas see maksab palju?',
        'Irina: Koduteenuse eest maksab ema väikest tasu, mis sõltub tema pensionist. Häirenupu eest maksab linn. Kõige suurem muutus on aga see, et mul on jälle oma elu: käin ema juures kolm korda nädalas ja me räägime muust kui haigustest.',
        'Saatejuht: Mida te soovitate teistele?',
        'Irina: Ärge oodake, kuni ise läbi põlete. Abi küsimine ei ole nõrkus.',
        'Saatejuht: Aitäh, Irina!',
      ], [
        'Irina Sepa ema on praegu [kaheksakümmend seitse|87] aastat vana.',
        'Kolm aastat tagasi kukkus ema talvel kodus ja murdis [käe].',
        'Irina ise töötab poes ja tal on [vahetustega|vahetustega töö] töö.',
        'Kahe kuu pärast oli Irina nii väsinud, et jäi ise [haigeks].',
        'Sotsiaaltöötaja poole pöörduda soovitas Irinale üks tema [kolleeg|kolleegidest].',
        'Emaga jõuti kokkuleppele alles [teisel] kohtumisel.',
        'Koduhooldaja käib ema juures nädalas [kaks korda|kaks].',
        'Pärast häirenupu vajutamist oli kiirabi kohal [kahekümne minutiga|20 minutiga].',
        'Koduteenuse tasu suurus sõltub ema [pensionist].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('070_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Irina ema kukkus kodus esimest korda kolm aastat tagasi talvel.', true],
        ['Irina elab emaga samas korteris ja saab teda aidata iga päev.', false],
        ['Alguses käis Irina ema juures iga päev pärast tööd.', true],
        ['Ema oli koduhooldaja tulekuga kohe esimesel kohtumisel nõus.', false],
        ['Koduhooldaja toob emale toitu ja koristab tema korteris.', true],
        ['Häirenupu eest maksab Irina igal kuul oma palgast.', false],
        ['Praegu käib Irina ema juures jälle iga päev pärast tööd.', false],
        ['Irina arvates ei ole abi küsimine nõrkus, vaid tark samm.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('070_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('070_t_situation', 'Kontroll: kirjutamine ja rääkimine (Harno B2 vormis)', 'Selles tunnis on Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühemalt. Kirjutad vallavalitsusele kirja ja arutluse. Sõnavõtus esitled mooduli tulemust: oma kodukoha teejuhti, mille paned kõigepealt kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own guide, built in 066–069
      B.planning('070_t_product', 'Mooduli tulemus: minu kodukoha teejuht.', 'Võta oma teejuht tunnist 69 ja lisa igale reale üks lause, kus on tunni keel.', ['Abi: kuhu pöördutakse öösel ja kuhu tööpäeval? (tund 66: umbisikuline)', 'Osalemine: millega ma liitun ja mille eest vastutan? (tund 67: rektsioon)', 'Kohustused: mida ma pean ja mida ei pea tegema? (tund 68: peab, ei pea, ei tohi)', 'Ettepanek: mida vald võiks teha ja mis see maksaks? (tund 69: tingiv)']),
      PART('070_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('070_t_letter', 'Kirjutamine 1: kiri vallavalitsusele (umbes 140 sõna).', 'Vald otsustas, et bussiliin, millega sinu küla eakad käivad perearsti juures, sõidab edaspidi ainult kaks korda nädalas. Kirjuta vallavalitsusele: kuidas otsus sinu küla inimesi mõjutab, too kaks konkreetset näidet, paku üks lahendus tingivas kõneviisis ja palu vastust.', 'Lugupeetud vallavalitsus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('070_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas iga täiskasvanu peaks andma aastas vähemalt mõne päeva vabatahtlikku tööd? Too mõlema poole argumendid, igaühele näide, ja sinu põhjendatud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'seega'], 3), { task: 'W14', harno: 'W2b' }),
      PART('070_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('070_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi valla uute elanike infopäeval 1 minut oma kodukoha teejuhist. Mõtle 2 minutit oma teejuhi järgi, räägi 1 minut, siis vasta küsimustele.', ['Mida peaks uus elanik kõigepealt teadma?', 'Mis on sinu teejuhis kõige kasulikum ja miks?', 'Kuidas saab uus elanik kogukonnaga liituda?', 'Kuulaja küsib: „Mida teha, kui vald ei vasta?”', 'Milline avalik teenus vajaks sinu kodukohas kõige rohkem parandamist? Miks?', 'Kumb aitab kodukohal rohkem: hea vallavalitsus või aktiivsed elanikud? Põhjenda.'], [90, 180], ['Minu teejuhis on neli asja …', 'Kõigepealt tasub teada, et …', 'Kui vald ei vasta, …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('070_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas vald peaks maksma oma vabatahtlikele päästjatele iga väljakutse eest väikest tasu? Argumendid: vabatahtlikud ohverdavad oma aega ja und; tasu aitaks leida uusi liikmeid; maal jõuavad nemad õnnetuse juurde sageli esimesena. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas vald peaks maksma oma vabatahtlikele päästjatele iga väljakutse eest väikest tasu? Argumendid: vabatahtlik töö on vabatahtlik just seetõttu, et selle eest ei maksta; valla eelarves ei jätku raha teedele ja koolidele; parem oleks osta komandole uus varustus. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks meie külas …', 'Kui vald maksaks …, siis …'], ['Ma ei ole päris nõus, sest …', 'Teisest küljest …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('070_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: mõju kirjeldatud, kaks näidet, lahendus tingivas kõneviisis, palve vastata, sobiv toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, selge järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: neli asja ja põhjendus 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('070_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 14 läbitud'),
    ],
  },
};


// the v4 explanations of the retired blocks (shown with the hidden block, courseSheet.js withExplanations)
const OLD_WHY = {
  // 066
  '066_d_facts': [
    '1. lõik: „umbes iga viies Eesti elanik on vähemalt 65-aastane”.',
    '2. lõik: „Sotsiaalhoolekande seaduse järgi korraldab abi kohalik omavalitsus ehk vald või linn.”',
    '2. lõik: „Pöörduda võib inimene ise, tema laps, naaber või sõber.”',
    '2. lõik: „Seejärel hinnatakse abivajadust, sageli inimese kodus.”',
    '2. lõik: „kui inimene kukub, vajutab ta nuppu ja abi kutsutakse kohe”.',
    '3. lõik: „Alates 2023. aasta 1. juulist tasutakse hoolduspersonali kulud valla või linna eelarvest.”',
    '4. lõik: „esimeses järjekorras tuleb eelistada koduteenuseid”.',
    '4. lõik: „tasub sotsiaaltöötaja poole pöörduda varakult, mitte alles siis, kui olukord on juba kriitiline”.',
  ],
  '066_p_imp': [
    'hindama → hinnatakse (olevik); osaline sihitis abivajadust jääb osastavasse.',
    'tegema → tehakse; terve sihitis on umbisikulises nimetavas: otsus.',
    'Eitus olevikus: ei + -ta → ei rahuldata.',
    'Minevik: muutma → muudeti, vähendama → vähendati.',
    'Täisminevik: on + -tud → on avatud; päevakeskus on nimetavas.',
  ],
  '066_t_sort': [
    'Poes käimine ja küte kodus → koduteenus.',
    'Ajutine abi kodus pärast haiglat → koduteenus.',
    'Üksi elav inimene, kes kukub → häirenupp: abi kutsutakse kohe.',
    'Kardab, et keegi ei kuule → häirenupp.',
    'Regulaarne sõit haiglasse ratastooliga → sotsiaaltransport.',
    'Üksildane, kuid liigub ise → päevakeskus: seltskond ja tegevus.',
    'Tahab koos teistega võimelda ja laulda → päevakeskus.',
    'Ööpäevane hooldus, mida kodus ei saa pakkuda → hooldekodu.',
  ],
  '066_t_exit': [
    'sulgema → suletakse (olevik).',
    'muutma → muudeti (minevik).',
    'Eitus olevikus: ei + -ta → ei võeta.',
  ],
  // 067
  '067_d_radio': [
    'Saatejuht: „osaleb vabatahtlikus tegevuses iga neljas-viies Eesti elanik”.',
    'Marju: „Meie külas põles ühel talvel maja.”',
    'Marju: „kontrollin, kas suitsuandur töötab”.',
    'Marju: „oli Eestis sada üheksateist vabatahtlikku komandot”.',
    'Marju: „Kõik sõltub sellest, kas pere ja tööandja on toetavad.”',
  ],
  '067_p_case': [
    'osalema milles? → kogumises (seesütlev).',
    'liituma millega? → ühendusega (kaasaütlev).',
    'vastutama mille eest? → ohutuse eest (omastav + eest).',
    'huvituma millest? → loodusest (seestütlev).',
    'sõltuma millest? → töögraafikust (seestütlev).',
    'pöörduma kelle poole? → koordinaatori poole (omastav + poole).',
    'panustama millesse? → kogukonda (sisseütlev).',
  ],
  '067_t_exit': [
    'osalema milles? → koolituses.',
    'liituma millega? → komandoga.',
    'vastutama mille eest? → piirkonna eest.',
  ],
  // 068
  '068_d_case': [
    '„Kas teadsid?”: „vähemalt kaheksa aastat”.',
    'Tütar: „sa pead sooritama kaks eksamit: keeleeksami B1 ja põhiseaduse eksami”.',
    'Tütar: „keeleeksami B1”.',
    'Tütar: vabastatud on need, „kes said hariduse eesti keeles, näiteks sinu lapselaps”.',
    'Tütar: „Teise riigi kodanik peab oma senisest kodakondsusest vabastatud olema.”',
    'Tütar: „tasuta nõustamine on Integratsiooni Sihtasutuses”.',
    '„Kas teadsid?”: PPA saadab taotluse valitsusele „kuue kuu jooksul”.',
  ],
  '068_p_modal': [
    'Haridus eesti keeles → kohustusest vaba: on vabastatud (millest? keeleeksamist).',
    'Kohustus ametlikus juhendis: tuleb + -da (lisada); „võib” oleks ainult luba.',
    'Keeld: ei tohi + -da (kasutada).',
    'Luba: võib + -da (teha).',
    'Kohustust ei ole: ei pea + -ma (loobuma).',
    'Kohustus: peab + olema (seaduse nõue).',
    'Ametlik kohustus: on kohustatud + -ma (oskama).',
  ],
  '068_t_voice': [
    'Valentina: „Elan Eestis tuhande üheksasaja kaheksakümne viiendast aastast.”',
    'Valentina: „kas ma pean … oma pensioni pärast muretsema”.',
    'Artjom: „lõpetasin eesti õppekeelega gümnaasiumi”.',
    'Artjom: „Kirjutage parem e-postiga, päeval olen tööl.”',
    'Oksana: „Tulin Ukrainast kaks tuhat kakskümmend kaks.”',
    'Oksana: „Kas ma võiksin juba järgmisel aastal kodakondsust taotleda?”',
  ],
  '068_t_exit': [
    'Kohustust ei ole: ei pea + -ma (tegema).',
    'Keeld: ei tohi + -da (rääkida).',
    'Kohustus: tuleb + -da (registreerida).',
  ],
  // 069
  '069_d_info': [
    'Kaie: „ka see, kellel ei ole Eesti kodakondsust”.',
    'Kaie: „tuleb märgukirjale vastata kolmekümne kalendripäeva jooksul”.',
    'Kaie: „mitte rohkem kui kahe kuuni”.',
    'Kaie: „Lisage foto või kaart.”',
    'Kaie: „vähemalt üks protsent valla hääleõiguslikest elanikest”.',
    'Kaie: „kui sellel on vähemalt tuhat allkirja”.',
    'Kaie: elanikud „saavad ise ideid esitada ja nende poolt hääletada”.',
  ],
  '069_p_cond': [
    'Ettepanek: et vald + tingiv (paneks, põleks).',
    'Mitmus tingivas: maksaksid; ka teine tegusõna: jääks.',
    'Umbisikuline tingiv: ehitatakse → ehitataks; tingimus: ei muutuks.',
    'Mõlemad tegusõnad tingivas: toodaks (umbisikuline) ja oleks.',
    'Riskiks oleks …; ka teised tegusõnad tingivas: veniks, lükkuks.',
    'Kaks tegusõna tingivas: oleksid, ei lahendaks.',
    'võima → võiksime (viisakas võimalus).',
  ],
  '069_t_exit': [
    'Umbisikuline tingiv: paigaldama → paigaldataks.',
    'Tingiv: maksma → maksaks.',
    'Ettepanek: et vald + tingiv (arutaks).',
  ],
  // 070
  '070_d_read': [
    '(A) ja (G): elanikud mõjutavad kohalikku elu ise; vald ja elanik teevad mõlemad oma osa.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '070_d_mc': [
    '(A): „elanik saab ainult oodata … See on mugav mõte, kuid see ei ole tõsi.”',
    '(B): „vähemalt saab elanik teada, miks midagi ei tehta”.',
    '(C): kiri, kus on probleem ja „kaks võimalikku lahendust koos hinnaga, jõuab palju tõenäolisemalt eelarve aruteluni”.',
    '(D): „peab volikogu selle kolme kuu jooksul arutusele võtma”.',
    '(F): „ei ole kõigil võrdselt aega ega jõudu”.',
    '(G): kokkuvõte — „Vald peab kuulama ja vastama, elanik peab küsima ja pakkuma.”',
  ],
  '070_d_para': [
    '(C): „Ametnik ei pea siis ise lahendust välja mõtlema, ta saab seda kohe hinnata.”',
    '(B): „ka see, kellel ei ole … õigust valimistel hääletada”.',
    '(D): „mänguväljakuid, terviseradu ja külaplatse, mida keegi ülevalt ei käskinud ehitada”.',
    '(F): „Kui osalemine on raske, osalevad ainult need, kellel on niigi kõige rohkem aega.”',
    '(E): „Selline töö ei vaja volikogu otsust.”',
    '(G): „Kumbki pool ei saa seda tööd teise eest ära teha.”',
    '(A): „Igal nädalal tehakse vallas otsuseid, mis puudutavad meie teid …”',
    '(E): päästjad „jõuavad maal õnnetuse juurde sageli enne kutselisi”.',
  ],
  '070_d_cloze': [
    'Umbisikuline olevik: sulgema → suletakse.',
    'Umbisikuline minevik, eitus: ei + -tud → ei arutatud.',
    'osalema milles? → digiõppes.',
    'aitama millega? → küsimustega (mitmus).',
    'sõltuma millest? → töögraafikust.',
    'Kohustus: tuleb + -da (hoida).',
    'Kohustust ei ole: ei pea + -ma (olema).',
    'Ettepanek: et raamatukogu + tingiv (oleks).',
    'Tingiv: vähenema → väheneks.',
    'ootama + osastav: vastust.',
  ],
  '070_d_bank': [
    'Vähe lugejaid → vald hakkas arutama, kas raamatukogu on vaja.',
    'Ei jää ootama → kirjutasid ettepaneku ja kogusid allkirju.',
    'Ettepanek → vald vastas kuu aja pärast ja lubas proovida.',
    'Avati keeletuba → varsti tulid juurde teised tegevused.',
    'Vabatahtlikud olid väsinud → vaatamata sellele ei loobunud keegi.',
    'Sada inimest nädalas → nüüd nimetatakse seda küla elutoaks. Üle jääb „vald otsustas raamatukogu kohe sulgeda”, mis on loo vastand.',
  ],
  '070_p_fix': [
    'Eitus olevikus: ei + -ta → ei võeta.',
    'Umbisikulises on terve sihitis nimetavas: patsient suunatakse.',
    'liituma millega? → päästjatega.',
    'vastutama mille eest? → ohutuse eest.',
    'Haridus eesti keeles → kohustust ei ole: ei pea + tegema (mitte: ei tohi).',
    'Ettepanek: et vald + tingiv → paigaldaks.',
  ],
  '070_p_trans': [
    'Tegija (vald) ei ole tähtis: umbisikuline minevik suleti.',
    'Eitus olevikus: ei pikendata.',
    'huvituma millest? → loodusest.',
    'Kohustust ei ole: ei pea + -ma.',
    'Umbisikuline tingiv: ehitataks.',
    'Ettepanekus on risk alles võimalik: riskiks oleks, et … veniks.',
  ],
  '070_p_notes': [
    'Teade 1: „suletud kuni kümnenda detsembrini”.',
    'Teade 1: „kultuurimaja fuajees asuvasse kasti”.',
    'Teade 2: „igas kodus peab olema töötav suitsuandur”.',
    'Teade 2: vabatahtlik päästja tuleb „tasuta nõustama”.',
    'Teade 3: „Igal elanikul, kes on vähemalt neliteist aastat vana, on õigus hääletada.”',
    'Teade 4: päevakeskus „on nüüdsest avatud ka laupäeviti”.',
  ],
  '070_p_listen': [
    'Saatejuht: ema „on kaheksakümmend seitse aastat vana”.',
    'Irina: ema „kukkus talvel kodus ja murdis käe”.',
    'Irina: „Mina töötan poes vahetustega.”',
    'Irina: „olin nii väsinud, et jäin ise haigeks”.',
    'Irina: „soovitas üks kolleeg pöörduda linna sotsiaaltöötaja poole”.',
    'Irina: „Kokkuleppele jõudsime alles teisel kohtumisel.”',
    'Irina: „Kaks korda nädalas käib ema juures koduhooldaja.”',
    'Irina: „kiirabi oli kohal kahekümne minutiga”.',
    'Irina: tasu „sõltub tema pensionist”.',
  ],
  '070_p_tf': [
    'Õige: „Kolm aastat tagasi kukkus ema talvel kodus.”',
    'Vale: Irina „elab teises linnaosas”.',
    'Õige: „Alguses käisin iga päev pärast tööd ema juures.”',
    'Vale: „Ema oli alguses vastu … Kokkuleppele jõudsime alles teisel kohtumisel.”',
    'Õige: koduhooldaja „toob toitu ja koristab”.',
    'Vale: „Häirenupu eest maksab linn.”',
    'Vale: „käin ema juures kolm korda nädalas”.',
    'Õige: „Abi küsimine ei ole nõrkus.”',
  ],
};

// ---- v6 helpers (the same mechanisms as b2/module11.js … b2/module13.js) -------------------------------------------
// G18: the vocab block brings back three old words (3–15 lessons back); they are named on the sheet and used in the input
const withReview = (b, review) => ({ ...b, data: { ...b.data, title: `${b.data.title} Kordamiseks: ${review.join(', ')}.`, review } });
// G17 / G24: the main task of Kasuta — its type, the „Abikaart” (2–3 sentence starters) and the „Lisaväljakutse” line;
// both are printed on the learner's card too (the fold-out card is UI work, v6 §2 i)
const mainTask = (b, taskType, support, stretch, tags = {}) => tag({ ...b, data: { ...b.data, taskType, support, stretch } }, { main: true, level: 4, ...tags });
// G16: the 5-min „Parandatud versioon” that opens lessons 067–069 (replaces the warm-up statement, not an extra block)
const revision = (id, of, instruction) => {
  const b = B.writing(id, 'Parandatud versioon.', instruction, [3, 4]);
  return teach(tag({ ...b, data: { ...b.data, revisionOf: of } }, { task: 'W10' }),
    '„Parandatud versioon” (5 minutit, v6): õppija kirjutab ümber kolm lauset, mille sa eelmise tunni mustandis või kodutekstis märkisid (ainult märgi, ära paranda ise), ja ütleb ühe reaga, mis muutus. Kontrolli kohe: kas viga on parandatud? Korduv viga läheb õppija „Minu vead” nimekirja Harjutas. Kui õppija kodutööd ei teinud, parandab ta tunni mustandi kolm lauset.');
};
// G16: the in-class draft of the home text's first paragraph (≈ 10 min, feedback on one rubric criterion)
const draft = (id, title, instruction, criterion, range = [6, 10]) => teach(tag(B.writing(id, `Mustand tunnis: ${title} (10 minutit).`, instruction, range), { task: 'W11', level: 3 }),
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
const peerReply = (b) => ({ ...b, data: { ...b.data, peerReply: 'Kursusekaaslane loeb ettepaneku ja vastab: kaks tugevat kohta ja üks soov (hindamisjuhendi järgi).', realAddressee: 'kursusekaaslane' } });
const mediaLog = (b) => ({ ...b, data: { ...b.data, mediaLog: true } });
// a control's rubric stays directly under the task it scores (courseSheet.js lessonOrder)
const keepPlace = (b) => ({ ...b, data: { ...b.data, keepPlace: true } });
// a control's recordings are locked; short clips are heard once (each clip its own file), the interview twice
const once = (b) => ({ ...b, data: { ...b.data, plays: 1, lockPlays: true } });
const twice = (b) => ({ ...b, data: { ...b.data, plays: 2, lockPlays: true } });
const perClip = (block) => {
  const clips = String(block.data.transcript).split('\n').map((line) => line.replace(/^[^:]{1,20}:\s*/, '').trim()).filter(Boolean);
  return { ...block, data: { ...block.data, questions: block.data.questions.map((q, i) => ({ ...q, script: clips[i] })) } };
};
// two blocks side by side on one row (the sheet's page balance)
const half = (b) => ({ ...b, width: 'half', span: 6 });
// v5 G6: a lesson recording is heard twice
const twiceInLesson = (b) => ({ ...b, data: { ...b.data, plays: 2 } });
const HARJUTA = 'Harjuta → moodul 14: sõnad ja vormid (10 min).';

// the analytic Harno B2 writing rubric (v5 G10): four criteria, 0–3 points each, with level descriptors; the teacher's
// note holds a borderline sample with its scoring (the same rubric as modules 11–13, the grammar line names module 14)
const B2_WRITING = [
  ['Ülesande täitmine ja register', '3 — kõik sisupunktid on täidetud, adressaat ja toon sobivad, pikkus on ülesande piires; 2 — üks punkt on nõrk või toon kõigub; 1 — kaks punkti on puudu või toon ei sobi adressaadile; 0 — tekst ei vasta ülesandele'],
  ['Ülesehitus ja sidusus', '3 — lõigud, teemalaused ja mitmekesised sidendid, mõte liigub loogiliselt; 2 — lõigud on olemas, kuid sidendid korduvad; 1 — mõtete loetelu ilma lõikudeta; 0 — järjekorrast ei saa aru'],
  ['Sõnavara', '3 — täpne ja mitmekesine, kordusi väldib; 2 — piisav, mõni kordus või ebatäpne sõna; 1 — piiratud, sõnad korduvad, tähendus on kohati segane; 0 — sõnavara ei kanna sisu'],
  ['Grammatika ja õigekiri', '3 — liitlaused ja vormid (üksi elav, taotlust esitades, käin aitamas, nõuab, et … oskaks, paigaldataks) on enamasti õiged; 2 — vigu on, kuid need ei takista mõistmist; 1 — vead takistavad kohati mõistmist; 0 — vead takistavad mõistmist pidevalt'],
];
const B2_WRITING_SHORT = ['3 kõik punktid, sobiv toon · 2 üks nõrk koht · 1 kaks puudu · 0 ei vasta', '3 lõigud ja mitmekesised sidendid · 2 sidendid korduvad · 1 loetelu · 0 segane', '3 täpne ja mitmekesine · 2 mõni kordus · 1 piiratud · 0 ei kanna sisu', '3 vead ei sega · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'];
const writingRubric = (id, title, sample) => {
  const b = B.rubricW2(id, title);
  return teach({ ...b, goal: 'g_use', data: { ...b.data, instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12. Kontrolli oma teksti enne saatmist.', criteria: B2_WRITING.map(([name], i) => ({ name, max: 3, hint: B2_WRITING_SHORT[i] })) } }, sample);
};
// the control's discussion: four criteria 0–3 (as module 12's control)
const SPEAKING_14 = [
  ['Ülesande täitmine ja suhtlus', '3 seisukoht kohe, reageerib partnerile ja uuele infole, jõuab ühise seisukohani · 2 üks neist nõrk · 1 räägib, aga ei reageeri · 0 ei vasta ülesandele'],
  ['Sujuvus ja ülesehitus', '3 räägib sujuvalt, põhjendab ja seob mõtted · 2 pausid ei sega · 1 pausid segavad kohati · 0 üksikud sõnad'],
  ['Sõnavara', '3 täpne ja mitmekesine (mooduli sõnad) · 2 piisav, mõni kordus · 1 piiratud · 0 ei kanna sisu'],
  ['Grammatika ja hääldus', '3 vead ei sega (kesksõna, ma-tegevusnimi, et + tingiv, paigaldataks) · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'],
];

// why a v4 block left the sheet
const CUT_HOOK = 'v5/v6: station 1 is the cold task (066) or the 5-min „Parandatud versioon” (067–069); the hook text and the warm-up talk merged into it';
const CUT_INPUT = 'second input of the lesson (v5: one input per lesson)';
const CUT_STATS = 'exact statistics (owner 2026-11-25: adapted texts, no exact numbers) or a second input';
const CUT_DRILL = 'exit gaps → Harjuta (v6 G14: the exit is a 30–60-s performance of the can-do, not three form items)';
const CUT_EXTRA = 'extra task (v5: one product task in Kasuta; „Kui aega jääb” is in the teacher plan)';
const CUT_HOME = 'home card / voice task: the home text on the sheet carries the 1-min voice message and the Harjuta link (v5 §3, v6 G18)';
const CUT_OLDTASK = 'v4 task replaced by the v6 task of the same station (new id, other block type)';
const CUT_CONTROL = 'control is one sheet ≤ 10 blocks, listening + speaking (v6 §2 g: B2 lesson 5 = 2 skills alternating; m13 was R + W)';
const RETIRE_WHY = {
  '066_d_open': CUT_STATS, '066_d_facts': CUT_STATS, '066_t_chat': CUT_INPUT, '066_t_sort': 'sorting drill (v5 §4: matching and sorting live in Harjuta, not on a B2 lesson sheet)', '066_p_imp': 'the impersonal of official texts was module 12\'s grammar (056, 058); module 14 takes the next B2 step, participle phrases and the des-form (066_p_forms, 066_p_short)',
  '067_d_radio': 'v4 input (an interview with exact figures, ≈ 2 min): the lesson\'s one input is now the story radio 067_d_pod (v5: B2 listening 3–4 min, 2 voices)', '067_d_know': CUT_STATS, '067_p_case': 'verb government was module 2\'s B2 step (006); module 14\'s story lesson takes the ma-infinitive cases (067_p_forms)', '067_t_gap': 'v4 info gap: the main task of the story lesson is now the narrative 067_t_story (v6 G17: types modules 11–13 used least)', '067_t_plan': CUT_OLDTASK,
  '068_d_chat': 'v4 input (a family chat): the lesson\'s one input is now the article 068_d_text (v5: B2 reading 400–600 words with inference questions)', '068_d_know': CUT_STATS, '068_d_case': CUT_INPUT, '068_p_modal': 'modal ladder (module 4, 017, 042): the B2 step is now the requirement „nõuab, et + tingiv” (068_p_forms)', '068_t_voice': CUT_INPUT,
  '069_d_talk': CUT_HOOK, '069_p_vote': '„Kas teadsid?”-type tip (v5 §4: cut unless the task uses it)', '069_t_options': 'three solution cards: they are the project card 069_t_project now (v5: ≤ 5 blocks on Kasuta)', '069_t_pitch': CUT_OLDTASK, '069_t_product': 'module product card „Minu kodukoha teejuht”: the in-class products are the drafts and the main tasks 066–069; the control is listening + speaking (v6 §2 g)',
};
const reasonFor = (id) => RETIRE_WHY[id] || (/^070_/.test(id) ? CUT_CONTROL : /_d_(hook|talk)$/.test(id) ? CUT_HOOK : /_t_more$/.test(id) ? CUT_EXTRA
  : /_t_exit$/.test(id) ? CUT_DRILL : /_t_(home|homework|letter|essay|summary)$/.test(id) ? CUT_HOME : CUT_OLDTASK);

// a v4 block that left the sheet: hidden with its reason, its old explanation kept (v5 §4)
const V4_BLOCKS = Object.fromEntries(Object.values(V4).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const retire = (id) => {
  const b = V4_BLOCKS[id];
  if (!b) throw new Error(`module14: v4 plokki ${id} ei ole`);
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
    if (V4_BLOCKS[bid] && V4_BLOCKS[bid].type !== b.type) throw new Error(`module14: ${bid} oli ${V4_BLOCKS[bid].type}, nüüd ${b.type}`);
  });
  return [id, { ...l, ...phases }];
}));

// the purpose of every task („kes, kellele, mis tulemus”, stations.js st-purpose) for the teacher page — not printed in the
// instruction (v6 §2 e, G22: the instruction stays ≤ 25 words)
const PURPOSE = {
  '066_d_cold': 'Õpetaja kuuleb mooduli alguses, kuidas sa praegu arvamust ütled.',
  '066_d_text': 'Tead pärast lugemist, kuhu pöörduda, kui lähedane vajab abi.',
  '066_d_mc': 'Näitad, et saad aru ka sellest, mida autor otse ei ütle.',
  '066_p_forms': 'Valla teate laused on lühikesed ja täpsed.',
  '066_p_short': 'Oskad pika kes-lause asemel öelda sama lühemalt.',
  '066_p_draft': 'Kirja algus on valmis ja õpetaja märgib kolm lauset.',
  '066_t_meet': 'Sotsiaaltöötaja teab, kes vajab abi, ja te lepite kokku järgmise sammu.',
  '066_t_say': 'Näitad 30 sekundiga, et oskad kokkulepet pereliikmele edasi öelda.',
  '066_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '066_t_mail': 'Sotsiaaltöötaja saab kirja, mille põhjal ta saab abi korraldada.',
  '066_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '067_d_revise': 'Sinu kiri sotsiaaltöötajale saab paremaks ja sa näed oma vigu.',
  '067_d_scheme': 'Skeemist näed, kuidas lugu areneb — see on sinu loo plaan.',
  '067_d_pod': 'Kuuled, kuidas üks inimene vabatahtlikuks sattus ja mida see talle andis.',
  '067_p_forms': 'Sinu loos on selge, kuhu sa läksid, kus käid ja kust tulid.',
  '067_p_fix': 'Vabatahtlike lood lähevad lehele ilma vigadeta.',
  '067_p_draft': 'Loo algus on valmis ja õpetaja märgib kolm lauset.',
  '067_t_story': 'Paariline kuuleb sinu lugu ja saab küsida, mis edasi juhtus.',
  '067_t_say': 'Näitad 30 sekundiga, et oskad loo pöördepunkti jutustada.',
  '067_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '067_t_blog': 'Vabatahtlike lehe lugejad saavad teada, kuidas sina kogukonnas osaled.',
  '067_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '068_d_revise': 'Sinu lugu saab paremaks ja sa näed oma vigu.',
  '068_d_text': 'Tead pärast lugemist, mida seadus nõuab ja mis on lihtsalt kuulujutt.',
  '068_d_scheme': 'Skeemist näed korraga nõuded, erandid ja selle, mida ei nõuta.',
  '068_p_forms': 'Oskad nõuet täpselt edasi öelda: seadus nõuab, et …',
  '068_p_bank': 'Foorumi vastus on sidus ja lugeja saab sellest aru.',
  '068_p_draft': 'Sõnumi algus on valmis ja õpetaja märgib kolm lauset.',
  '068_t_advise': 'Sugulane saab aru, mida ta peab tegema ja mida mitte.',
  '068_t_say': 'Näitad 30 sekundiga, et oskad ühe nõude lihtsalt ära seletada.',
  '068_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '068_t_mail': 'Sugulane saab sõnumi, mille järgi ta teab järgmist sammu.',
  '068_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '069_d_revise': 'Sinu sõnum sugulasele saab paremaks ja sa näed oma vigu.',
  '069_d_scheme': 'Skeem on sinu ettepaneku kava: koht, tõend, kaks lahendust ja palve vallale.',
  '069_d_info': 'Kuuled valla nõunikult, millisele ettepanekule vastatakse.',
  '069_p_forms': 'Ettepanekus on selge, mida vald teeks ja mis siis muutuks.',
  '069_p_cond': 'Ettepaneku laused kõlavad viisakalt ja ametlikult.',
  '069_p_draft': 'Ettepaneku algus on valmis ja õpetaja märgib kolm lauset.',
  '069_t_project': 'Komisjon kuuleb teie ettepanekut ja valib, mis läheb kaasavasse eelarvesse.',
  '069_t_say': 'Näitad 30 sekundiga, et oskad ettepaneku tuuma esitleda.',
  '069_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '069_t_mail': 'Vald saab ettepaneku, millele saab vastata, ja kursusekaaslane vastab sulle.',
  '069_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '070_p_clips': 'Näitad, et saad lühiteatest aru, kui kuuled seda üks kord.',
  '070_p_talk': 'Näitad, et saad intervjuust aru ka siis, kui vastus on teiste sõnadega.',
  '070_t_cold': 'Näed, kuidas su rääkimine on mooduli algusest muutunud.',
  '070_t_rubric': 'Näed, mille eest ühe minuti arvamuse punktid tulevad.',
  '070_t_debate': 'Paar jõuab arutelus ühise seisukohani.',
  '070_t_srubric': 'Näed, mille eest arutelu punktid tulevad.',
};
const withPurposes = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { ...l, ...Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => [p, (l[p] || []).map((b) => (PURPOSE[b.id] ? { ...b, data: { ...b.data, purpose: PURPOSE[b.id] } } : b))])) }]));

export const LESSONS = withPurposes(withShapes(withRetired({
  'b1b2-066': {
    title: 'Ema ei saa enam üksi hakkama: mida vald pakub?',
    phases: grammar('Kordamine: ema, kes elab üksi · B2: üksi elav ema, valla pakutav teenus, hinnatud abivajadus; taotlust esitades, kriisi ootamata'),
    format: 'quest',
    topic: 'family',
    canDo: 'Ma loen artiklit sellest, kuidas vald eakat inimest aitab, helistan valla sotsiaaltöötajale lähedase pärast ja lepin kokku järgmise sammu ning kirjutan sotsiaaltöötajale umbes 140-sõnalise kirja; kasutan kesksõnafraase ja des-vormi (üksi elav ema, valla pakutav teenus, taotlust esitades).',
    teacherPage: {
      goal: 'Холодная задача устно; статья о социальных услугах волости; причастные обороты и des-форма; звонок соцработнику по карточке случая; дома письмо соцработнику 140 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: холодная задача (2 мин) — обязательно; статья — абзацы A–D и вопросы 1–4; станция 3 — правило и 10 предложений, черновик 3 предложения; звонок без второй скрытой информации.',
      hook: '«Väide: eakate vanemate eest peaksid hoolitsema eelkõige nende lapsed, mitte vald.» Ученик думает 1 минуту и говорит 1 минуту, без помощи. Это холодная задача модуля (устно; модуль 13 мерил письмо): не помогайте, не давайте фраз, не исправляйте; запишите заметки (или запись) и сохраните до 070. В уроке 070 ученик говорит параллельную задачу в тех же условиях (070_t_cold).',
      plan: [
        '0–5: станция 1 — холодная задача: 1 минута подумать, 1 минута говорить; заметки сохраните до 070',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: пробежать заголовок и начала абзацев (1 мин), статья (6 мин), 7 вопросов с выбором (Harno R1), из них 3 на вывод (10 мин), обсуждение выводов в паре (5 мин)',
        '30–52: станция 3 — kes-предложение одной строкой (B1), B2: причастный оборот (üksi elav, valla pakutav, hinnatud) и des-форма; 10 предложений, 8 сокращений; черновик письма (10 мин), обратная связь — содержание и тон',
        '52–70: станция 4 — звонок соцработнику: ученик по карточке случая, вы — соцработник со скрытой информацией',
        '70–75: выход: 30 секунд брату или сестре — о чём договорились; самооценка 0–1–2 + своё предложение; домашнее задание: письмо 140 слов, голосовое 1 мин, Harjuta; три отмеченных предложения из сообщения соседке (064) — в «Minu vead»',
        'Kui aega jääb (75–90): ролевая игра «мама говорит: мне никто не нужен» — ученик уговаривает начать с маленькой услуги',
      ],
      sources: 'Статья «Kui vanem ei saa enam üksi hakkama» — учебный текст KeeleSepp без точной статистики. Общая основа: по закону о социальном обеспечении сначала отвечает семья, волость помогает, когда семьи не хватает; оценка потребности в помощи на дому; услуги: koduteenus, häirenupp, päevakeskus, место в доме ухода; частичная оплата зависит от дохода и прейскуранта волости; после реформы 2023 г. доля волости за место в доме ухода выросла (без цифр). Карточка случая — учебная.',
      groups: 'Холодная задача — каждый сам (в группе по очереди, остальные пишут свои заметки). Статья и вопросы — каждый сам, вопросы на вывод сравнивают в паре. Черновик — каждый сам, партнёр читает по строке рубрики «Ülesande täitmine ja register». Станция 4 — один звонит, второй слушает и отмечает три вопроса; в 1:1 соцработник — вы.',
      errors: [
        '«Ema, kes elav üksi» / «üksi elab ema» → «üksi elav ema» (kes elab → elav; оборот стоит перед существительным, без запятой).',
        '«Vald pakutav teenus» → «valla pakutav teenus» (кто предлагает — в родительном падеже: valla, sotsiaaltöötaja).',
        '«Taotlust esitamisel lisa volitus» → «Taotlust esitades lisa volitus» или «Taotluse esitamisel …» (des-форма — тот же деятель, что в главном предложении).',
        '«Ilma ootama» → «ootamata» (русское «не дожидаясь» = -mata).',
      ],
      notes: [
        'Звонок (v6 §2 d, phone; кейс): ученик не читает карточку вслух, а описывает ситуацию своими словами и задаёт три вопроса. Тема личная: никто не обязан рассказывать о своей семье — карточка выдуманная. Ученику без родителей в Эстонии — соседка или тётя; пенсионеру — «я звоню за себя»; студенту — бабушка в деревне.',
        'Скрытая информация — в заметке под звонком. Не давайте сразу всё: ученик должен уточнять (Kas ma sain õigesti aru, et …?).',
        'Слова на повтор (volitus из урока 56, e-teenus из 56, sissetulek из 51) есть в статье: попросите ученика найти их и сказать, откуда он их знает.',
      ],
    },
    discover: [
      station(teach(tag(inLesson(B.speaking('066_d_cold', 'Külm algus: arvamus ühe minutiga.', 'Väide: „Eakate vanemate eest peaksid hoolitsema eelkõige nende lapsed, mitte vald.” Mõtle 1 minut. Räägi 1 minut: seisukoht, põhjus, näide, vastuargument.', [
        'Kas oled väitega nõus? Miks?',
        'Too üks näide oma elust, tuttava elust või riigist, mida sa hästi tead.',
        'Mida ütleks keegi, kes arvab teisiti?',
      ], [60, 90])), { task: 'S11', fluency: true }),
      'Mooduli külm ülesanne (algtase), 2 minutit, suuliselt (moodul 13 mõõtis kirjutamist, moodul 14 mõõdab rääkimist). Ära aita, ära anna fraase ega algust, ära paranda. Märgi üles: kas seisukoht on esimeses lauses, mitu põhjust, kas on näide, kas vastuargument tuleb, mitu sidendit (kuigi, seetõttu, samas …), pausid ja 2–3 korduvat viga. Hoia märkmed (või salvestus) alles: tunnis b1b2-070 räägib õppija paralleelse ülesande samades tingimustes (kontrolli rääkimise 1. osa) ja te võrdlete.'), 1, 5),
      station(withReview(tag(B.vocab('066_d_vocab', 'Tunni sõnad.', ['sotsiaaltöötaja — соцработник', 'pöörduma (kelle poole) — обращаться (к кому)', 'abivajadus — потребность в помощи', 'hindama — оценивать', 'koduteenus — помощь на дому', 'hooldaja — сиделка, помощник по уходу', 'häirenupp — тревожная кнопка', 'hooldekodu — дом ухода', 'omaosalus — собственный взнос (доплата)', 'vastutama (mille eest) — отвечать (за что)']), { topic: ['sotsiaaltöötaja', 'abivajadus', 'koduteenus', 'hooldaja', 'häirenupp', 'hooldekodu', 'omaosalus', 'toimetulek', 'päevakeskus'] }), ['volitus', 'e-teenus', 'sissetulek']), 2, 25),
      teach(tag(B.reading('066_d_text', 'Loe artiklit.', 'Silmitse 1 minut pealkirja ja lõikude algusi. Siis loe artiklit ja vasta all olevatele küsimustele.', 'Kui vanem ei saa enam üksi hakkama', [
        '(A) Eesti elanikkond vananeb ja enamik eakaid tahab elada oma kodus nii kaua kui võimalik. Sageli märkavad lapsed alles juhuslikult, et üksi elav ema ei käi enam poes, unustab ravimid või ei julge talvel trepist alla minna. Esimene mõte on tihti hooldekodu, kuid see ei ole ainus ega alati parim lahendus. Seaduse järgi vastutab inimese toimetuleku eest esmajoones tema pere, ent vallal on kohustus aidata, kui perest üksi ei piisa.',
        '(B) Kust alustada? Paljud pered ootavad liiga kaua, sest nad ei tea, kelle poole pöörduda, või kardavad, et abi küsimine on häbiasi. Esimene samm on pöörduda oma valla või linna sotsiaaltöötaja poole. Seda võib teha telefoni teel, e-kirjaga või e-teenuse kaudu. Kui ema ise helistada ei saa, võib seda teha laps, kuid ema nõusolek on vajalik. Sageli küsitakse volitust: dokumenti, millega ema lubab lapsel enda eest asju ajada. Taotlust esitades tasub kohe kirja panna, millega inimene enam hakkama ei saa ja kes teda praegu aitab.',
        '(C) Seejärel hinnatakse abivajadust. Sotsiaaltöötaja tuleb tavaliselt koju ja vaatab, mida inimene veel ise teeb: kas ta suudab süüa teha, end pesta, ravimeid võtta ja arveid maksta. Hindamine ei ole eksam ega kontroll, vaid vestlus. Selle eesmärk on leida lahendus, mis toetab inimese iseseisvust, mitte ei võta seda ära. Hinnatud abivajaduse põhjal lepitakse kokku teenus ja selle maht. Hea on, kui hindamise juures on ka pereliige: ema ei pruugi võõrale tunnistada, et ta on viimasel ajal mitu korda kukkunud või söömata jätnud.',
        '(D) Valla pakutavaid teenuseid on mitut liiki. Koduteenuse puhul käib hooldaja mõned korrad nädalas kodus: toob toidu, aitab koristada või saadab arsti juurde. Häirenupp on käe peal kantav nupp, millele vajutades saab üksi elav eakas kiiresti abi kutsuda, näiteks kui ta on kukkunud. Mõnes kohas on päevakeskus, kus saab süüa, suhelda ja liikuda. Mõni vald korraldab ka transporti, et eakas jõuaks arsti juurde või poodi ilma lähedaste abita. Kui kodus elamine ei ole enam turvaline, aitab vald leida koha hooldekodus.',
        '(E) Teenused ei ole alati tasuta. Sageli maksab inimene osa ise. Selle omaosaluse suurus sõltub tema sissetulekust ja valla hinnakirjast. Hooldekodu koha puhul on viimastel aastatel valla osa suurenenud, nii et pere ei pea kõike ise kandma. Summad on igas vallas erinevad, seepärast tasub küsida hinnad kirjalikult ja neid võrrelda. Kui pere sissetulek on väike, võib vald osa tasust kanda või pakkuda toetust; seda tuleb aga eraldi taotleda.',
        '(F) Kõige raskem ei ole aga sageli paberitöö, vaid vestlus kodus. Paljud eakad ütlevad, et nad ei vaja abi, sest nad ei taha olla kellelegi koormaks. Sotsiaaltöötajate sõnul aitab, kui pere ei otsusta eaka eest, vaid koos temaga. Esimene teenus võib olla väike, näiteks toidu koju toomine kaks korda nädalas. Kui ema näeb, et võõras abistaja ei võta temalt kodu ära, on järgmine samm kergem. Sageli tuleb pärast esimest kuud ema ise küsima, kas hooldaja võiks käia ka kolmandal päeval.',
        '(G) Abi küsimine ei ole nõrkus. Kuumalaine, libedus või gripihooaeg on üksi elavale eakale suurem oht kui teistele, sest ta kuulub riskirühma. Kui naaber, laps ja sotsiaaltöötaja teavad üksteisest, ei pea keegi kriisi ootamata üksi hakkama saama ning kiirabi kutsutakse õigel ajal.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), []), { task: 'R13', voice: 'article' }),
      'Lugemine, umbes 27 minutit koos sõnade ja küsimustega. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): enne lugemist vaatab õppija 1 minuti pealkirja ja lõikude algusi ning ütleb, millest tekst räägib. Kordamise sõnad (volitus, e-teenus, sissetulek) on tekstis: lase need leida. Tekst on õppetekst ilma täpse statistikata; summad ja teenused erinevad valla kaupa.'),
      why(teach(tag(B.choice('066_d_mc', 'Eksaminurk: vali õige vastus.', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus kolmest. Küsimustele 3, 6 ja 7 järelda.', [
        ['Mida märkavad lapsed lõigu A järgi sageli alles juhuslikult?', 'et ema ei saa enam igapäevaste asjadega üksi hakkama', 'et ema tahab kolida hooldekodusse', 'et ema on vallale ise helistanud'],
        ['Mida on lõigu B järgi vaja, kui laps pöördub ema eest valla poole?', 'ema nõusolekut ja sageli volitust', 'arsti tõendit ja passi', 'ainult lapse enda isikukoodi'],
        ['Mida tahab autor öelda lausega „Hindamine ei ole eksam ega kontroll, vaid vestlus”? Järelda.', 'eesmärk on koos leida sobiv abi, mitte inimest hinnata ega karistada', 'sotsiaaltöötaja kontrollib, kas korter on puhas', 'eakas peab vastama küsimustele kirjalikult'],
        ['Milleks on lõigu D järgi häirenupp?', 'et kukkunud või haige eakas saaks kiiresti abi kutsuda', 'et hooldaja teaks, millal uks avada', 'et eakas saaks poes maksta'],
        ['Millest sõltub lõigu E järgi omaosaluse suurus?', 'inimese sissetulekust ja valla hinnakirjast', 'ainult teenuse kestusest', 'sellest, kui kaugel inimene vallamajast elab'],
        ['Miks soovitavad sotsiaaltöötajad lõigu F järgi alustada väikesest teenusest? Järelda.', 'eakas harjub abiga ega tunne, et temalt võetakse iseseisvus', 'väike teenus on alati tasuta', 'suurt teenust ei saa kohe taotleda'],
        ['Milline on autori hoiak abi küsimise suhtes? Järelda.', 'abi küsimine on mõistlik ja aitab ohtu vältida', 'abi tuleks küsida ainult viimases hädas', 'pere peaks kõik ise ära tegema'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      'Eksaminurk (Harno B2 lugemine, osa 1): seitse valikvastust kolmest. Küsimused 3, 6 ja 7 on järeldusküsimused: nõua lauset, millele vastus toetub. Arutelu paaris (5 min): „Kas sinu kodumaal hoolitseb eakate eest pere või riik? Mida võiks Eesti sealt õppida — või vastupidi?”'), [
        '(A): „üksi elav ema ei käi enam poes, unustab ravimid või ei julge talvel trepist alla minna”.',
        '(B): „ema nõusolek on vajalik. Sageli küsitakse volitust”.',
        'Järeldus (C): „Selle eesmärk on leida lahendus, mis toetab inimese iseseisvust.”',
        '(D): „saab üksi elav eakas kiiresti abi kutsuda, näiteks kui ta on kukkunud”.',
        '(E): „omaosaluse suurus sõltub tema sissetulekust ja valla hinnakirjast”.',
        'Järeldus (F): „Kui ema näeb, et võõras abistaja ei võta temalt kodu ära, on järgmine samm kergem.”',
        'Järeldus (G): „Abi küsimine ei ole nõrkus.”',
      ]),
    ],
    practice: [
      station(teach(B.notice('066_p_notice', 'Märka: üksi elav ema — valla pakutav teenus', [
        'Artiklist: **üksi elav** ema · **valla pakutavad** teenused · **hinnatud** abivajaduse põhjal · **taotlust esitades** · nupp, millele **vajutades** · kriisi **ootamata**',
        'Kordamine (B1): kes-lause: ema, kes elab üksi; teenus, mida vald pakub.',
        'B2, kes-lause → kesksõna (ees, ilma komata): kes elab → **elav**, kes vajab → **vajav** · keda hooldatakse → **hooldatav**',
        'B2, mida keegi teeb → omastav + -tav: mida vald pakub → **valla pakutav** · mida tehti → -tud: mida hinnati → **hinnatud**, mis lepiti kokku → **kokku lepitud**',
        'B2, kui-lause → des-vorm (tegija on sama): Kui esitad taotluse, lisa volitus → Taotlust **esitades** lisa volitus. · ilma et ootaks → **ootamata**',
        'Vene keeles „живущая одна мать”, „подавая заявление”, „не дожидаясь” — eesti keeles üksi elav ema, taotlust esitades, ootamata (ilma komata).',
      ], 'full'), 'Kordamine ühe minutiga (kes-lause). Siis B2 samm: kes-lause muutub kesksõnaks, mida-lause omastav + -tav või -tud, kui-lause des-vormiks. Lase õppijal leida artiklist kolm sellist fraasi ja öelda need pika kes-lausena. L1 rida: vene keeles on sama vorm, kuid eesti keeles koma ei panda.'), 3, 20),
      why(teach(tag(B.gaps('066_p_forms', 'Valla teade eakate perele.', 'Kas on vaja kesksõna (-v, -tav, -tud), des-vormi või -mata? Kirjuta sõna õiges vormis. Panka ei ole.', [
        'Meie üksi [elav] ema ei julge talvel enam trepist alla minna. (elama)',
        'Abi [vajav] naaber võib ise helistada või paluda, et lähedane helistaks. (vajama)',
        'Koduteenus on [valla pakutav] teenus, mille eest maksab inimene osa ise. (vald, pakkuma)',
        'Sotsiaaltöötaja [hinnatud] abivajaduse põhjal lepitakse kokku teenuse maht. (hindama)',
        'Taotlust [esitades] lisa kindlasti ema volitus. (esitama)',
        'Käe peal olevale nupule [vajutades] saab eakas kohe abi kutsuda. (vajutama)',
        'Pöördu sotsiaaltöötaja poole kriisi [ootamata]. (ootama)',
        'Ära allkirjasta volitust seda enne [lugemata]. (lugema)',
        'Kodus [hooldatav] inimene vajab abi ka siis, kui hooldaja on haige. (hooldama)',
        'Eelmisel nädalal [kokku lepitud] koduteenus algab esmaspäeval. (kokku leppima)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kes teeb? Kas tegija on sama mis pealauses?” Read 1, 2, 9: kes-lause → -v / -tav. Rida 3: kes pakub? — vald → valla pakutav. Read 4, 10: -tud. Read 5–6: des-vorm (sama tegija). Read 7–8: -mata.'), [
        'kes elab → elav.',
        'kes vajab → vajav.',
        'mida vald pakub → valla pakutav (omastav + -tav).',
        'mida sotsiaaltöötaja hindas → sotsiaaltöötaja hinnatud.',
        'kui esitad (sama tegija) → esitades.',
        'kui vajutad (sama tegija) → vajutades.',
        'ilma et ootaks → ootamata.',
        'ilma et loeks → lugemata.',
        'keda kodus hooldatakse → hooldatav.',
        'mis lepiti kokku → kokku lepitud.',
      ]),
      why(teach(tag(B.transformation('066_p_short', 'Valla teate laused lühemaks.', 'Alusta antud sõnadega. Kasuta kes-lause asemel kesksõna ja kui-lause asemel des-vormi.', [
        ['Inimene, kes elab üksi, võib tellida häirenupu.', 'Üksi …', 'Üksi elav inimene võib tellida häirenupu.'],
        ['Teenus, mida vald pakub, ei ole alati tasuta.', 'Valla …', 'Valla pakutav teenus ei ole alati tasuta.'],
        ['Kui täidad taotlust, kirjuta, millega ema hakkama ei saa.', 'Taotlust …', 'Taotlust täites kirjuta, millega ema hakkama ei saa.'],
        ['Abivajadus, mida hinnati kodus, oli suurem, kui pere arvas.', 'Kodus …', 'Kodus hinnatud abivajadus oli suurem, kui pere arvas.'],
        ['Eakas, kes on kukkunud, saab abi kutsuda nii, et vajutab nupule.', 'Kukkunud eakas …', 'Kukkunud eakas saab abi kutsuda nupule vajutades.'],
        ['Ta kirjutas alla volitusele ja ei lugenud seda.', 'Ta kirjutas …', 'Ta kirjutas volitusele alla seda lugemata.|Ta kirjutas alla volitusele seda lugemata.'],
        ['Hooldaja, kes käib kodus, toob toidu ja aitab koristada.', 'Kodus …', 'Kodus käiv hooldaja toob toidu ja aitab koristada.'],
        ['Kui räägid sotsiaaltöötajaga, ole aus.', 'Sotsiaaltöötajaga …', 'Sotsiaaltöötajaga rääkides ole aus.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Valla teates on lühike kesksõnafraas täpsem kui pikk kes-lause. Kontrolli: kesksõna seisab nimisõna ees ilma komata; des-vormi tegija on sama mis pealauses (rida 5: eakas kutsub ja eakas vajutab).'), [
        'kes elab üksi → üksi elav.',
        'mida vald pakub → valla pakutav.',
        'kui täidad → täites.',
        'mida hinnati kodus → kodus hinnatud.',
        'nii, et vajutab → vajutades.',
        'ja ei lugenud → lugemata.',
        'kes käib kodus → kodus käiv.',
        'kui räägid → rääkides.',
      ]),
      draft('066_p_draft', 'kirja esimene lõik', 'Kirjuta sotsiaaltöötajale vähemalt 6 lauset: kes vajab abi, millega ta enam hakkama ei saa ja mida te palute?', 'Ülesande täitmine ja register (viisakas, konkreetne)', [8, 12]),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('066_t_meet', 'Telefonikõne: abi emale (12–15 minutit).', 'Helista valla sotsiaaltöötajale. Kirjelda olukorda oma sõnadega, küsi kolm küsimust ja lepi kokku järgmine samm.',
        'Kaart A — sinu ema (78):\nelab üksi kortermaja 3. korrusel, liftita · kukkus eelmisel kuul vannitoas, abi tuli alles hommikul · unustab vahel ravimid · ei taha hooldekodusse · sina elad teises linnas ja käid tal kord kuus · pension on väike\nAbikaart: Helistan seoses oma emaga, kes … · Kas valla pakutav …? · Kas ma sain õigesti aru, et …?\nLisaväljakutse: küsi, mis maksab ema ja mis vald, ning lepi kokku, mida teed, kui ema keeldub.',
        'Sotsiaaltöötaja kaart on õpetajal: teenused, ooteajad ja kaks uut infot.',
        [], []), 'phone',
      ['Helistan seoses oma emaga, kes …', 'Kas valla pakutav … sobiks talle?', 'Kas ma sain õigesti aru, et …?'],
      'Küsi, mis maksab ema ja mis vald, ning lepi kokku, mida teed, kui ema keeldub.', { task: 'S04', fluency: true }),
      'Telefonikõne (v6 §2 d, phone; juhtum). Sina oled valla sotsiaaltöötaja. Alguses küsi: „Kellega ma räägin ja kelle pärast te helistate?” Varjatud info (ütle ükshaaval, kui õppija küsib teenuste kohta): 1) „Koduteenusele on järjekord umbes kuu aega, häirenupu saab paigaldada juba järgmisel nädalal.” (Õppija peab otsustama, mis kõigepealt.) 2) „Abivajaduse hindamiseks tulen koju, aga teie ema peab ise kohal olema ja nõus olema. Kas ta teab, et te helistate?” (Õppija peab tunnistama, et ema ei tea, ja leppima kokku, kes temaga räägib.) Õnnestunud, kui õppija kirjeldab olukorda oma sõnadega (mitte kaarti ette lugedes), küsib vähemalt kolm küsimust, kontrollib arusaamist ja lepib kokku järgmise sammu (kuupäev, kes helistab emale). Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 18, { final: 'negotiate' }),
      exitTalk('066_t_say', 'Ütle 30 sekundiga õele või vennale, mida sa sotsiaaltöötajaga kokku leppisid ja mis on järgmine samm.', ['Mida sotsiaaltöötaja pakkus?', 'Mis on järgmine samm ja kes selle teeb?'], 'Kas õppija ütleb kokkuleppe ja järgmise sammu ning kasutab vähemalt üht mooduli vormi (valla pakutav, hinnatud abivajadus, ema ootamata)?'),
      keepPlace(selfCheck('066_t_self', ['Leidsin artiklist, kuhu pöörduda, ja järeldasin autori hoiaku.', 'Kasutasin kesksõnafraase ja des-vormi (üksi elav, valla pakutav, taotlust esitades).', 'Kirjeldasin telefonis olukorda oma sõnadega ja leppisin kokku järgmise sammu.'], 'Kõne tehtud', 'Ma oskan vallalt lähedasele abi küsida')),
      tag(homeTask(homeLines(B.examWriting('066_t_mail', 'Kodus: kiri sotsiaaltöötajale (umbes 140 sõna).', `Lõpeta tunni mustand kirjaks (130–150 sõna). Pöördumist ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Kirjuta valla sotsiaaltöötajale pärast telefonikõnet. Kasuta kõne kokkulepet. Moodul 13: kirjuta oma sõnumi eakale naabrile (tund 64) kolm õpetaja märgitud lauset parandatult Harjutas „Minu vead” alla.',
        points: ['kes vajab abi ja millega ta enam üksi hakkama ei saa', 'mida te telefonis kokku leppisite', 'kaks küsimust (teenuse hind, ooteaeg või volitus)', 'palve: kinnitada koduse visiidi aeg'],
        words: [130, 150],
      }), 6)), { task: 'W13' }),
      writingRubric('066_t_rubric', 'Hindamisjuhend: kiri sotsiaaltöötajale (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Minu ema, kes elav üksi, vajab abi. Ta kukkus. Andke häirenupp. Kui palju see maksab? Vastake kiiresti.” Hinnang: ülesanne 2 (abivajaja ja üks küsimus on olemas, kuid kokkulepe ja visiidi palve puuduvad), ülesehitus 2 (järjekord on selge, sidendeid ei ole), sõnavara 2 (puuduvad abivajadus, koduteenus, omaosalus), grammatika 1 („ema, kes elav” → üksi elav ema / ema, kes elab üksi); toon („Andke”, „Vastake kiiresti”) on ametlikule adressaadile liiga käskiv. Kui õppija lisab kokkuleppe, viisaka palve (palun kinnitage …) ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-067': {
    title: 'Kaks tundi nädalas: kas vabatahtlik töö sobiks sulle?',
    phases: grammar('Kordamine: hakkasin käima · B2: läksin aitama, käin aitamas, tulin aitamast, jäin magamata — kuhu, kus, kust'),
    format: 'infogap',
    topic: 'freetime',
    canDo: 'Ma saan aru umbes 4-minutilisest raadiosaatest, kus inimene jutustab, kuidas ta vabatahtlikuks sattus, jutustan paarilisele loo sellest, kuidas keegi aitas, ja vastan tema küsimustele ning kirjutan vabatahtlike lehele umbes 180-sõnalise loo; kasutan ma-tegevusnime vorme (läksin aitama, käin aitamas, tulin aitamast).',
    teacherPage: {
      goal: 'Урок-история: радио о волонтёре; ma-инфинитив (-ma / -mas / -mast / -mata); рассказ в паре по схеме; дома история 180 слов + медиадневник.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — дважды, утверждения 1–6; станция 3 — правило и 10 предложений, черновик 3 предложения; рассказ — один раз, без второй попытки.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в письме соцработнику (066), и одной строкой говорит, что изменил. Вопрос, если есть время: «Кто тебе последний раз помог без денег — и ты ему?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (66)',
        '5–27: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: прочитать утверждения и предсказать (2 мин), радио дважды (9 мин), 10 утверждений «верно / неверно» (Harno L4), из них 3 на вывод; схема истории заполняется при втором прослушивании',
        '27–50: станция 3 — hakkama + ma одной строкой (B1), B2: -ma (куда), -mas (где, в каком деле), -mast (откуда), -mata; 10 предложений, 8 исправлений; черновик истории (10 мин), обратная связь — построение (поворот истории)',
        '50–70: станция 4 — рассказ: каждый рассказывает 2 минуты по схеме, партнёр задаёт два вопроса, потом смена; вторая попытка с другим партнёром короче и без схемы',
        '70–75: выход: 30 секунд — поворот истории; самооценка; домашнее задание: история 180 слов + медиадневник, голосовое, Harjuta',
        'Kui aega jääb (75–90): «Kaks tundi nädalas» — каждый выбирает из трёх объявлений (toidupank, päästekomando, raamatukogu digiabi) и говорит, куда пошёл бы и почему',
      ],
      sources: 'Радио «Kogukonnatund» — учебный текст KeeleSepp (ведущая Kersti и волонтёр Margus вымышлены), без точной статистики (раньше: «каждый четвёртый-пятый», 119 команд, 3000 волонтёров — убраны). Общая основа: продуктовый банк (Toidupank) раздаёт излишки магазинов; добровольные спасатели в Эстонии занимаются и профилактикой (проверка дымовых датчиков, безопасная топка печи); волонтёрский опыт помогает при поиске работы.',
      groups: 'Радио — каждый сам, утверждения на вывод сравнивают в паре. Черновик — каждый сам. Станция 4 — пары: рассказчик и слушатель с двумя вопросами, потом смена; вторая попытка — с новым партнёром. В 1:1 слушатель — вы (вы тоже рассказываете короткую историю как образец после ученика, не до него).',
      errors: [
        '«Ma käin toidupangas aitama» → «… aitamas» (käima + -mas: где и в каком деле).',
        '«Hakkasin vabatahtlikuna töötamas» → «… töötama» (hakkama + -ma).',
        '«Ta keeldus abi vastu võtma» → «… vastu võtmast» (keelduma + -mast).',
        '«Tulin just pakke jagamisest» → «Tulin just pakke jagamast» (tulema + -mast: откуда, с какого дела).',
      ],
      notes: [
        'Рассказ (v6 §2 d, narrative): история должна иметь поворот («ja siis …»). Никто не обязан рассказывать о своей жизни: можно о соседе, о родственнике или выдуманную. Пенсионеру — «как раньше помогали друг другу в деревне»; студенту — помощь соседу по общежитию; маме — кто помог с ребёнком.',
        'Слова на повтор (ülejääk из урока 62, ümberõpe и koondama из 63) звучат в радио: попросите ученика поднять руку, когда услышит.',
      ],
    },
    discover: [
      station(half(revision('067_d_revise', 'b1b2-066', 'Kirjuta ümber kolm lauset, mille õpetaja sinu kirjas sotsiaaltöötajale märkis. Lisa üks rida: mida sa muutsid ja miks?')), 1, 5),
      station(half(withReview(tag(B.vocab('067_d_vocab', 'Tunni sõnad.', ['vabatahtlik töö — волонтёрская работа', 'kogukond — сообщество', 'panustama (millesse) — вносить вклад', 'liituma (millega) — присоединиться', 'koordinaator — координатор', 'koolitus — обучение', 'ennetustöö — профилактика', 'päästekomando — спасательная команда', 'sattuma — попасть (случайно)', 'osalema (milles) — участвовать (в чём)']), { topic: ['vabatahtlik', 'kogukond', 'koordinaator', 'ennetustöö', 'päästekomando', 'toidupank', 'suitsuandur'] }), ['ülejääk', 'ümberõpe', 'koondama'])), 2, 22),
      teach(B.diagram('067_d_scheme', 'flow', { title: 'Skeem: kuidas lugu areneb', instruction: 'Teisel kuulamisel kirjuta iga kasti juurde märksõna. Viimasesse kasti kirjuta oma loo algus.', nodes: 'Olukord: kes, kus, millal? …\nProbleem: mis oli raske? …\nPööre: mis juhtus ootamatult? …\nMis edasi? Kuhu ta hakkas käima? …\nTulemus: mis muutus tema elus? …\nÕppetund: mida ta soovitab? …\nMinu lugu algab nii: …' }, 'full', 'g_notice'),
        'Skeem on enne saadet: esimesel kuulamisel lahendab õppija õige/vale, teisel paneb kirja loo osad. Olukord: koondamine, töötu, ümberõpe alles sügisel. Probleem: tunne, et ta ei ole kellelegi vajalik. Pööre: naabri toidupakk → jäi kolmeks tunniks aitama. Edasi: toidupank igal laupäeval, päästekomando ennetustöö. Tulemus: vanahärra päästetud, töökoht. Õppetund: „Ära oota, kuni sul on palju aega.” Skeem on õppija enda loo plaan jaamas 4.'),
      why(teach(tag(twiceInLesson(B.examListen('067_d_pod', 'Kuulamine: raadiosaade „Kogukonnatund”.', 'Loe väited läbi ja ennusta pliiatsiga. Kuula saadet kaks korda ja märgi, kas väide on õige või vale.', 'truefalse', [
        'Kersti: Tere, siin „Kogukonnatund”! Täna räägime vabatahtlikust tööst, aga mitte numbritest, vaid ühest loost. Stuudios on Margus, kes käib igal laupäeval toidupangas abiks ja osaleb juba kolm aastat oma küla päästekomando töös. Margus, kuidas see kõik algas?',
        'Margus: Ausalt öeldes sattusin sinna juhuslikult. Neli aastat tagasi koondati mind tehasest, kus olin töötanud viisteist aastat. Olin töötu ja istusin päevad otsa kodus. Ümberõppe kursus algas alles sügisel ja mul oli tunne, et ma ei ole kellelegi vajalik.',
        'Kersti: Mis siis juhtus?',
        'Margus: Naaber, eakas proua, palus mul ühel laupäeval toidupangast tema toidupakk ära tuua, sest ta ei jaksanud ise minna. Läksin pakki tooma ja jäin sinna kolmeks tunniks. Koordinaator küsis, kas ma saaksin aidata kaste tõsta, sest üks vabatahtlik oli haigeks jäänud. Ütlesin jah. Sellest päevast hakkasin seal igal laupäeval käima.',
        'Kersti: Mida sa seal täpsemalt teed?',
        'Margus: Poed annetavad toidu, mille kuupäev on lähedal, ja meie sorteerime selle ülejäägi. Mis on söödav, pakitakse peredele. Mis on halvaks läinud, läheb biojäätmetesse. Hommikuti olen tavaliselt laos kaste sorteerimas, pärastlõunal käin pakke välja jagamas. Mulle meeldib, et toit ei lähe raisku ja keegi saab sellest kõhu täis.',
        'Kersti: Aga kuidas sa päästjaks said?',
        'Margus: Toidupangas kohtusin mehega, kes oli meie küla päästekomando liige. Ta rääkis, et neil on vaja inimesi ennetustöö jaoks: käiakse eakate kodudes suitsuandureid kontrollimas ja räägitakse, kuidas ahju ohutult kütta. Ma ei olnud kunagi midagi sellist teinud, aga läksin koolitusele. Koolitusel sain teada, et igaüks ei pea tulle minema. Ennetustöö on sama tähtis.',
        'Kersti: Kas mõni lugu on eriti meelde jäänud?',
        'Margus: On küll. Esimesel talvel käisin ühe vanahärra juures suitsuandurit vahetamas. Tema vana andur ei töötanud juba aastaid, sest patarei oli tühi. Panin uue anduri lakke ja seletasin, kuidas seda kontrollida. Kaks kuud hiljem helistas ta mulle: öösel oli ahju juures tuli lahti läinud, andur hakkas piiksuma ja ta jõudis õue. Maja sai kahjustada, aga mees jäi ellu. Pärast seda kõnet istusin autos ega suutnud tükk aega midagi öelda.',
        'Kersti: See on tugev lugu. Mida vabatahtlik töö sulle andis?',
        'Margus: Esiteks tunde, et ma olen vajalik. Teiseks töökoha. Pärast ümberõpet kandideerisin laotöötajaks ja intervjuul küsiti, mida ma olen viimasel ajal teinud. Rääkisin toidupangast. Juht ütles, et vabatahtlik töö näitab, et inimene on usaldusväärne ja oskab meeskonnas töötada. Sain koha.',
        'Kersti: Kas vabatahtlik töö ei võta liiga palju aega?',
        'Margus: Võib võtta, kui ise piire ei pane. Mõni aeg tagasi lõpetasin öiste väljakutsete võtmise, sest pean hommikul tööl olema. Nüüd käin laupäeviti toidupangas ja kord kuus eakaid külastamas. Kaks tundi nädalas on täiesti piisav.',
        'Kersti: Mida soovitad kuulajale, kes kahtleb?',
        'Margus: Ära oota, kuni sul on palju aega. Mine ühel laupäeval kohale ja vaata. Kui ei meeldi, võid alati loobuda. Mina läksin ju ainult ühte pakki tooma.',
        'Kersti: Aitäh, Margus!',
      ], [
        ['Margus hakkas vabatahtlikuks ajal, mil ta tundis end kasutuna.', true],
        ['Esimest korda läks Margus toidupanka selleks, et endale toitu saada.', false],
        ['Margus jäi esimesel päeval aitama, sest üks vabatahtlik oli haige.', true],
        ['Toidupangas visatakse kogu toit, mille kuupäev on lähedal, kohe ära.', false],
        ['Küla päästekomando ennetustöö tähendab peamiselt tulekahjude kustutamist.', false],
        ['Koolitusel mõistis Margus, et päästjana saab kasulik olla ka tulle minemata.', true],
        ['Vanahärra pääses tulest tänu andurile, mille Margus oli paigaldanud.', true],
        ['Margus sai töökoha, kuigi intervjuul vabatahtlikust tööst ei räägitud.', false],
        ['Margus võtab praegu endiselt vastu ka öiseid väljakutseid.', false],
        ['Marguse arvates tuleb enne vabatahtlikuks hakkamist leida palju vaba aega.', false],
      ], 'g_listen')), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamine, umbes 22 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): õppija loeb väited, joonib võtmesõnad ja ennustab. Eksaminurk (Harno B2 kuulamine, osa 4): õige / vale. Väited 1, 6 ja 10 on järeldusväited: küsi, millisele lausele vastus toetub. Kordamise sõnad (ülejääk, ümberõpe, koondama) on saates: lase õppijal käsi tõsta, kui ta neid kuuleb.'), [
        'Õige: „Olin töötu … mul oli tunne, et ma ei ole kellelegi vajalik.”',
        'Vale: naaber palus tal „toidupangast tema toidupakk ära tuua”.',
        'Õige: „üks vabatahtlik oli haigeks jäänud”.',
        'Vale: „Mis on söödav, pakitakse peredele.”',
        'Vale: ennetustöö = „käiakse eakate kodudes suitsuandureid kontrollimas”.',
        'Õige: „igaüks ei pea tulle minema. Ennetustöö on sama tähtis.”',
        'Õige: „andur hakkas piiksuma ja ta jõudis õue”.',
        'Vale: „Rääkisin toidupangast. … Sain koha.”',
        'Vale: „lõpetasin öiste väljakutsete võtmise”.',
        'Vale (järeldus): „Ära oota, kuni sul on palju aega.”',
      ]),
    ],
    practice: [
      station(teach(B.notice('067_p_notice', 'Märka: läksin aitama — käin aitamas — tulin aitamast', [
        'Saatest: **läksin** pakki **tooma** · **hakkasin** seal **käima** · olen laos kaste **sorteerimas** · käin pakke **jagamas** · käisin suitsuandurit **vahetamas**',
        'Kordamine (B1): hakkama + -ma: hakkasin õppima.',
        'B2, -ma (kuhu? mis eesmärgil?): minema, tulema, jääma, hakkama + **-ma**: läksin **aitama**, jäin **ootama**',
        'B2, -mas (kus? mis tegevuses?): käima, olema + **-mas**: käin **aitamas**, olin **sorteerimas**',
        'B2, -mast (kust? millest?): tulema, keelduma + **-mast**: tulin **jagamast**, ta keeldus abi vastu **võtmast**',
        'B2, -mata (mida ei tehtud): jäin **magamata** (moodul 13: jääb sorteerimata).',
        'Vene keeles „пошёл помогать”, „хожу помогать”, „пришёл с работы” — eesti keeles kolm vormi: läksin aitama, käin aitamas, tulin aitamast.',
      ], 'full'), 'Kordamine ühe minutiga (hakkasin õppima). Siis B2 samm: ma-tegevusnimi kolmes kohas — kuhu (-ma), kus (-mas), kust (-mast) — ja -mata. Lase õppijal leida skeemi märkmetest kolm lauset ja küsida: kuhu, kus või kust? L1 rida: vene keeles on üks infinitiiv, eesti keeles kolm vormi.'), 3, 23),
      why(teach(tag(B.gaps('067_p_forms', 'Vabatahtlike lood lehele.', 'Kuhu, kus, kust või mida ei tehtud? Kirjuta tegusõna õiges vormis: -ma, -mas, -mast või -mata. Panka ei ole.', [
        'Pärast koondamist hakkasin igal laupäeval toidupangas [käima]. (käia)',
        'Hommikuti olen tavaliselt laos kaste [sorteerimas]. (sorteerima)',
        'Pärastlõunal käin peredele pakke välja [jagamas]. (jagama)',
        'Eile käisin ühe vanahärra juures suitsuandurit [vahetamas]. (vahetama)',
        'Naaber palus, et ma läheksin tema toidupakki ära [tooma]. (tuua)',
        'Koordinaator küsis, kas ma jääksin veel tunniks [aitama]. (aidata)',
        'Tulin just toidupangast pakke [jagamast] ja olen väga väsinud. (jagama)',
        'Vanahärra keeldus alguses uut andurit vastu [võtmast]. (võtma)',
        'Pärast öist väljakutset jäin peaaegu terve öö [magamata]. (magama)',
        'Ära jää [ootama], kuni sul on palju vaba aega. (oodata)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kuhu, kus või kust?” Read 1, 5, 6, 10: -ma (hakkama, minema, jääma). Read 2–4: -mas (olema, käima). Read 7–8: -mast (tulema, keelduma). Rida 9: -mata. Vihje on da-vorm, kui vastus on -ma-vorm (käia → käima).'), [
        'hakkama + -ma: käima.',
        'olema + -mas (mis tegevuses?): sorteerimas.',
        'käima + -mas: jagamas.',
        'käima + -mas: vahetamas.',
        'minema + -ma (mis eesmärgil?): tooma.',
        'jääma + -ma: aitama.',
        'tulema + -mast (kust?): jagamast.',
        'keelduma + -mast: võtmast.',
        'jääma + -mata (mida ei tehtud): magamata.',
        'jääma + -ma: ootama.',
      ]),
      why(teach(tag(B.errorfix('067_p_fix', 'Lood enne avaldamist.', 'Need lood lähevad vabatahtlike lehele. Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Laupäeviti käin koos naabriga toidupangas pakke kokku panemas ja aitama.', 'Laupäeviti käin koos naabriga toidupangas pakke kokku panemas ja aitamas.'],
        ['Pärast ümberõppe kursust hakkasin raamatukogus kord nädalas eakaid arvutiga aitamas.', 'Pärast ümberõppe kursust hakkasin raamatukogus kord nädalas eakaid arvutiga aitama.'],
        ['Ta tuli just päästjate koolitusel ja rääkis meile kõigest, mida seal õppis.', 'Ta tuli just päästjate koolituselt ja rääkis meile kõigest, mida seal õppis.'],
        ['Üksi elav proua keeldus alguses vabatahtlike abi vastu võtma.', 'Üksi elav proua keeldus alguses vabatahtlike abi vastu võtmast.'],
        ['Eelmisel laupäeval läksime kogu majaga talgutele prügi koristamas.', 'Eelmisel laupäeval läksime kogu majaga talgutele prügi koristama.'],
        ['Olin terve päeva toidupangas abivajajatele pakke jagama.', 'Olin terve päeva toidupangas abivajajatele pakke jagamas.'],
        ['Kuuma ilm tõttu käisime iga päev üksi elavaid eakaid kontrollimas.', 'Kuuma ilma tõttu käisime iga päev üksi elavaid eakaid kontrollimas.'],
        ['Poodidest tulnud toit jäi laupäeval sorteerimata ja läks halb.', 'Poodidest tulnud toit jäi laupäeval sorteerimata ja läks halvaks.'],
      ], 'full', 'g_notice'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis siin valesti on: kuhu, kus või kust?” Rida 3: tulema kust → koolituselt (seestütlev/alaltütlev). Read 7–8 on moodulist 13 (Varasemast): tõttu + omastav (62), minema + -ks (61).'), [
        'käima + -mas: aitamas.',
        'hakkama + -ma: aitama.',
        'tulema kust: koolituselt.',
        'keelduma + -mast: võtmast.',
        'minema kuhu + -ma: talgutele koristama.',
        'olema + -mas: jagamas.',
        'tõttu + omastav: ilma tõttu (tund 62).',
        'minema + -ks: halvaks (tund 61).',
      ]),
      draft('067_p_draft', 'loo esimene lõik', 'Kirjuta vähemalt 6 lauset: kes, kus ja millal, mis oli raske ja mis juhtus ootamatult? Kasuta kolme ma-tegevusnime vormi.', 'Ülesehitus ja sidusus (olukord → pööre)'),
    ],
    transfer: [
      station(teach(mainTask(B.speaking('067_t_story', 'Jutustus: kord, kui keegi aitas (12–15 minutit).', 'Jutusta paarilisele 2 minutit lugu skeemi järgi. Paariline küsib kaks küsimust. Siis vahetage. Teine kord jutusta uuele paarilisele ilma skeemita.', [
        'Olukord: kes, kus ja millal?',
        'Mis oli raske ja mis juhtus ootamatult?',
        'Kuhu sa (või tema) pärast seda käima hakkasid?',
        'Mis muutus ja mida sa sellest õppisid?',
        'Mis sa arvad, kas seal, kus sa üles kasvasid, aidatakse naabreid rohkem või vähem kui Eestis? Miks?',
      ], [120, 180]), 'narrative',
      ['Kõik algas sellest, et …', 'Ja siis juhtus midagi ootamatut: …', 'Sellest ajast käin …-mas.'],
      'Jutusta loo lõpp kahest vaatenurgast: sinu ja selle inimese oma, keda aidati.', { task: 'S07', fluency: true }),
      'Jutustus (v6 §2 d, narrative). Lugu võib olla õppija, tuttava või väljamõeldud inimese oma. Kuulaja küsib kaks küsimust (Mis siis edasi juhtus? Miks sa just nii tegid?). Teine katse uue paarilisega, lühemalt ja skeemita (kordamine variatsiooniga, v5 §2). Üks-ühele: sina oled kuulaja; pärast õppija lugu jutusta ise lühike lugu (mitte enne). Õnnestunud, kui lool on olukord, pööre ja tulemus, õppija kasutab vähemalt kolme ma-tegevusnime vormi (läksin aitama, käin aitamas, tulin …-mast) ja vastab kahele küsimusele. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'present' }),
      exitTalk('067_t_say', 'Jutusta 30 sekundiga oma loo pööre: mis juhtus ootamatult ja kuhu sa pärast seda käima hakkasid.', ['Mis juhtus ootamatult?', 'Mis pärast seda muutus?'], 'Kas lool on pööre (ja siis …) ja kas õppija kasutab vähemalt üht -ma-, -mas- või -mast-vormi õigesti?'),
      keepPlace(selfCheck('067_t_self', ['Sain raadiosaatest aru ja järeldasin, mida jutustaja soovitab.', 'Kasutasin ma-tegevusnime vorme (läksin aitama, käin aitamas, tulin aitamast).', 'Jutustasin loo, kus on olukord, pööre ja tulemus, ning vastasin küsimustele.'], 'Lugu jutustatud', 'Ma oskan oma kogukonna loo jutustada')),
      tag(homeTask(homeLines(mediaLog(B.examWriting('067_t_blog', 'Kodus: lugu vabatahtlike lehele (umbes 180 sõna).', `Lõpeta tunni mustand looks (170–190 sõna) ja täida meediapäevik. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'jutt', {
        situation: 'Valla vabatahtlike leht kogub lugusid „Kuidas ma kogukonda sattusin”. Kirjuta oma, tuttava või väljamõeldud inimese lugu. Minu eesti keele võrgustik (meediapäevik): vali üks eestikeelne saade või leht kogukonnast või vabatahtlikust tööst — näiteks ERR, https://www.err.ee. Kirjuta loo alla kolm rida: mida kuulasid või lugesid, üks uus sõna ja üks lause selle kohta.',
        points: ['olukord: kes, kus ja millal', 'mis oli raske ja mis oli pööre', 'kuhu sa (või tema) pärast seda käima hakkasid ja mida seal tehakse', 'mis muutus ja mida soovitad lugejale'],
        words: [170, 190],
      })), 6)), { task: 'W05' }),
      writingRubric('067_t_rubric', 'Hindamisjuhend: lugu vabatahtlike lehele (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Mina olen vabatahtlik. Ma käin toidupangas aitama. See on hea. Inimesed on rõõmsad. Ma hakkasin seal töötamas eelmisel aastal. Tulge ka!” Hinnang: ülesanne 2 (on koht ja kutse, kuid pööre ja muutus puuduvad), ülesehitus 1 (mõtete loetelu, lugu ei arene: olukord → pööre → tulemus puudub), sõnavara 2 (puuduvad kogukond, koordinaator, panustama), grammatika 2 („käin aitama” → käin aitamas, „hakkasin töötamas” → hakkasin töötama, kuid vead ei takista mõistmist). Kui õppija lisab pöörde (Ja siis …), muutuse ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-068': {
    title: 'Kodakondsus: mida seadus nõuab — ja mida mitte?',
    phases: grammar('Kordamine: peab, ei pea, ei tohi · B2: seadus nõuab, et taotleja oskaks; eeldab keeleoskust; on eksamist vabastatud; ei ole nõutav'),
    format: 'case',
    topic: 'languages',
    canDo: 'Ma loen artiklit kodakondsuse nõuetest, eristan nõuet, erandit ja kuulujuttu, seletan sugulasele lihtsas keeles, mida seadus nõuab ja mida mitte, ning kirjutan talle umbes 140-sõnalise sõnumi päris allika põhjal; kasutan nõude väljendeid (nõuab, et … oskaks; eeldab; on vabastatud).',
    teacherPage: {
      goal: 'Статья о гражданстве; nõuab, et + условное, eeldab, on vabastatud; медиация: объяснить родственнику простыми словами; дома сообщение 140 слов по реальному источнику.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); статья — абзацы A–E и вопросы 1–5; станция 3 — правило и 10 предложений, черновик 3 предложения; медиация без второй скрытой информации.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в истории (067), и одной строкой говорит, что изменил. Вопрос, если есть время: «Какой слух о гражданстве или экзамене ты слышал(а)?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (67)',
        '5–28: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: найти (scan) в тексте три требования и одно исключение (2 мин), статья (6 мин), 7 вопросов, из них 3 на вывод (8 мин), схема «требует — не требует — исключения» (5 мин)',
        '28–50: станция 3 — peab / ei pea / ei tohi одной строкой (B1), B2: nõuab, et + условное, eeldab + партитив, on vabastatud + -st, ei ole nõutav; 10 предложений; уголок Harno R4 — ответ на форуме, 5 пропусков целыми предложениями, одно лишнее; черновик сообщения (10 мин), обратная связь — регистр (простой язык)',
        '50–70: станция 4 — медиация: родственник прочитал официальный текст и запутался; ученик объясняет простыми словами; вы вносите скрытую информацию',
        '70–75: выход: 30 секунд — одно требование простыми словами; самооценка; домашнее задание: сообщение 140 слов по реальной странице PPA (3 пункта), голосовое, Harjuta',
        'Kui aega jääb (75–90): «Слух или правда?» — вы читаете 5 утверждений из «разговоров знакомых», ученик решает и ссылается на абзац статьи',
      ],
      sources: 'Статья «Kodakondsus: mida seadus nõuab — ja mida mitte?» — учебный текст KeeleSepp на основе закона о гражданстве (Kodakondsuse seadus) без процентов и количеств заявлений: 8 лет законного проживания, из них последние 5 — постоянно; постоянный законный доход; экзамен по эстонскому B1 и экзамен по конституции и закону о гражданстве (можно пользоваться текстом закона); освобождение от языкового экзамена при образовании на эстонском; частичные освобождения по здоровью; присяга; как правило — отказ от прежнего гражданства; за ребёнка до 15 лет ходатайствует родитель. Подробности меняются — ученик сверяет на странице Politsei- ja Piirivalveamet (автор страницу не открывал). Тема политически чувствительная: обсуждаем только практическую сторону, мнение о политике не спрашиваем.',
      groups: 'Статья и вопросы — каждый сам, вопросы на вывод сравнивают в паре. R4 — каждый сам. Черновик — каждый сам. Станция 4 — пары: один объясняет, второй — родственник с карточкой B; потом смена. В 1:1 родственник — вы.',
      errors: [
        '«Seadus nõuab, et taotleja oskab B1» → «… et taotleja oskaks eesti keelt B1-tasemel» (требование: et + условное наклонение).',
        '«Eeldab keeleoskus» → «eeldab keeleoskust» (eeldama + партитив).',
        '«Ta on vabastatud eksamit» → «… eksamist» (vabastatud + -st, как русское «освобождён от»).',
        '«Ei tohi teha eksamit» в значении «не обязан» → «ei pea eksamit tegema» (ei tohi = запрещено, ei pea = не обязательно).',
      ],
      notes: [
        'Медиация (v6 §2 l, mediation): ученик не читает текст вслух, а объясняет своими словами и проверяет, понял ли родственник («Kas see on nüüd selge?»). Никто не обязан говорить о своём статусе: карточка — выдуманный двоюродный брат.',
        'Уголок Harno R4 (B2 lugemine, osa 4): целые предложения в пропуски, одно лишнее. Спросите: какое слово в соседнем предложении подсказывает ответ (seepärast, see, samas)?',
        'Слова на повтор (tõend и tingimused из урока 53, usaldusväärne из 57) есть в статье: попросите ученика найти их.',
      ],
    },
    discover: [
      station(revision('068_d_revise', 'b1b2-067', 'Kirjuta ümber kolm lauset, mille õpetaja sinu loos märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('068_d_vocab', 'Tunni sõnad.', ['kodakondsus — гражданство', 'elamisluba — вид на жительство', 'taotleja — заявитель', 'nõudma — требовать', 'eeldama (mida) — предполагать, требовать (что)', 'sooritama (eksamit) — сдавать (экзамен)', 'põhiseadus — конституция', 'vabastama (millest) — освобождать (от чего)', 'ametlik — официальный', 'menetlus — рассмотрение (дела)']), { topic: ['kodakondsus', 'elamisluba', 'taotleja', 'põhiseadus', 'menetlus', 'truudusvanne', 'kuulujutt'] }), ['tõend', 'tingimused', 'usaldusväärne']), 2, 23),
      why(teach(tag(B.reading('068_d_text', 'Loe artiklit.', 'Otsi kõigepealt tekstist kolm nõuet ja üks erand. Siis loe tervikuna ja vasta. Küsimustele 5–7 järelda.', 'Kodakondsus: mida seadus nõuab — ja mida mitte?', [
        '(A) Paljud inimesed, kes on Eestis elanud aastaid, mõtlevad ühel hetkel kodakondsusele. Põhjuseid on mitu: soov valida riigikogu valimistel, reisida lihtsamalt või lihtsalt tunne, et see riik on juba kodu. Samas liigub sõprade ja sugulaste seas palju kuulujutte. Kõige sagedamini kuuleb kahte väidet: et eksam on võimatult raske ja et taotlemiseks peab eesti keelt oskama täiuslikult. Kumbki ei ole päris tõsi.',
        '(B) Mida seadus siis tegelikult nõuab? Esiteks eeldab kodakondsuse taotlemine pikka seaduslikku elamist Eestis: taotleja peab olema elanud siin elamisloa või elamisõiguse alusel vähemalt kaheksa aastat, neist viimased viis alaliselt. Teiseks nõuab seadus, et taotlejal oleks püsiv seaduslik sissetulek, millest ta suudab end ja oma pere ülal pidada. Kolmandaks peab ta sooritama kaks eksamit. Lisaks peab taotleja elukoht olema Eestis registreeritud ja tema isikut tõendavad dokumendid peavad olema kehtivad.',
        '(C) Esimene neist on eesti keele eksam B1-tasemel. See ei ole kirjanduse ega grammatika eksam, vaid igapäevase keele eksam: taotleja peaks oskama lugeda teadet, kirjutada lühikest kirja, saada aru kuulutusest ja rääkida oma elust. Teine on põhiseaduse ja kodakondsuse seaduse tundmise eksam. Selle jaoks on olemas küsimuste kogu ja seadusetekst, mida võib eksamil kasutada. Seega ei nõuta paragrahvide pähe õppimist, vaid oskust leida vastus tekstist.',
        '(D) Seadus näeb ette ka erandeid. Keeleeksamit ei pea sooritama inimene, kes on omandanud eesti keeles põhi-, kesk- või kõrghariduse. Teatud terviseprobleemidega inimene võib olla eksamitest osaliselt või täielikult vabastatud. Eakamad taotlejad saavad mõnel juhul sooritada eksami ainult suuliselt. Need erandid ei kehti iseenesest: vabastuse saamiseks tuleb esitada tõend.',
        '(E) Mida seadus ei nõua? Taotleja ei pea olema Eestis sündinud ega olema abielus Eesti kodanikuga. Ta ei pea omama kinnisvara ega töötama riigiametis. Samuti ei nõuta, et ta räägiks aktsendita. Küll aga tuleb arvestada sellega, et Eesti kodanikuks saades tuleb üldjuhul loobuda senisest kodakondsusest. See on sageli kõige raskem otsus, sest see puudutab peret, pärandit ja reisimist.',
        '(F) Kuidas taotlus käib? Taotluse saab esitada Politsei- ja Piirivalveametile. Menetlus võtab mitu kuud ja vahepeal võidakse küsida lisadokumente, näiteks tõendit sissetuleku kohta. Seepärast tasub paberid enne taotlemist korda ajada. Pärast positiivset otsust annab taotleja truudusvande ehk lubaduse järgida põhiseadust. Lapse puhul on kord teistsugune: alla viieteistaastase lapse eest võib taotluse esitada vanem.',
        '(G) Kokkuvõtteks: tingimused on selged, kuid ajamahukad. Kes seda teed kaalub, peaks alustama ametlikust ja usaldusväärsest allikast, mitte tuttavate jutust, ning plaanima keeleõppe ja eksamid aegsasti: kõigepealt keeleõpe, siis eksamid ja alles seejärel taotlus. Paljudele ei ole suurim takistus mitte eksam ise, vaid hirm selle ees.',
        'Allikas: KeeleSepp õppetekst (täpsed ja kehtivad nõuded: Politsei- ja Piirivalveamet).',
      ].join('\n\n'), [
        ['Milliseid kaht kuulujuttu autor artikli alguses nimetab?', 'eksam on liiga raske ja keel peab olema täiuslik|eksam on võimatult raske; keelt peab oskama täiuslikult'],
        ['Kui kaua peab taotleja olema Eestis seaduslikult elanud?', 'vähemalt kaheksa aastat, viimased viis alaliselt|vähemalt kaheksa aastat'],
        ['Mida tohib põhiseaduse eksamil kasutada?', 'küsimuste kogu ja seaduseteksti|seaduseteksti'],
        ['Kes ei pea keeleeksamit sooritama?', 'kes on omandanud hariduse eesti keeles|kes on õppinud eesti keeles koolis või ülikoolis'],
        ['Miks nimetab autor senisest kodakondsusest loobumist kõige raskemaks otsuseks? Järelda.', 'see puudutab peret, pärandit ja reisimist'],
        ['Mida tahab autor öelda lausega „suurim takistus ei ole eksam ise, vaid hirm selle ees”? Järelda.', 'nõuded on täidetavad, kui end ette valmistada ja usaldusväärset infot kasutada'],
        ['Milline on autori hoiak tuttavate jutu suhtes? Järelda.', 'sellele ei tasu loota, info tuleb kontrollida usaldusväärsest allikast'],
      ]), { task: 'R15', voice: 'article' }),
      'Lugemine, umbes 23 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): seekord „otsi” — enne lugemist otsib õppija 2 minutiga kolm nõuet ja ühe erandi. Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Kordamise sõnad (tõend, tingimused, usaldusväärne) on tekstis. Teema on tundlik: räägime ainult praktilisest küljest, poliitilist arvamust ei küsi. Seaduse üksikasjad muutuvad: tekst on õppetekst, kehtivad nõuded on PPA lehel (kodutöö).'), [
        '(A): „eksam on võimatult raske ja … eesti keelt oskama täiuslikult. Kumbki ei ole päris tõsi.”',
        '(B): „vähemalt kaheksa aastat, neist viimased viis alaliselt”.',
        '(C): „on olemas küsimuste kogu ja seadusetekst, mida võib eksamil kasutada”.',
        '(D): „Keeleeksamit ei pea sooritama inimene, kes on omandanud eesti keeles põhi-, kesk- või kõrghariduse.”',
        'Järeldus (E): loobumine „puudutab peret, pärandit ja reisimist”.',
        'Järeldus (G): nõuded on „selged, kuid ajamahukad”; plaan ja usaldusväärne info vähendavad hirmu.',
        'Järeldus (G): „peaks alustama ametlikust ja usaldusväärsest allikast, mitte tuttavate jutust”.',
      ]),
      teach(B.diagram('068_d_scheme', 'formula', { title: 'Skeem: nõue, erand või kuulujutt?', instruction: 'Kirjuta artikli põhjal iga rea juurde üks lause. Viimasele reale kirjuta üks kuulujutt, mida oled kuulnud.', nodes: 'Seadus nõuab, et … | …\nSeadus eeldab … | …\nErand: … on vabastatud … | …\nSeadus ei nõua, et … | …\nTuleb arvestada, et … | …\nKuulujutt, mis ei ole tõsi: … | …' }, 'full', 'g_notice'),
        'Skeem on vahenduse plaan jaamas 4: vasak pool on ametlik keel, parem pool lihtne keel (Seadus nõuab, et taotleja oskaks B1-tasemel → Sa pead eesti keelt nii palju oskama, et saad teatest ja kirjast aru). Nõuded: 8 aastat (5 alaliselt), sissetulek, kaks eksamit; erandid: haridus eesti keeles, tervis (tõendiga); ei nõua: sünd Eestis, abielu, kinnisvara, aktsendita kõne; arvesta: senisest kodakondsusest loobumine.'),
    ],
    practice: [
      station(teach(B.notice('068_p_notice', 'Märka: seadus nõuab, et taotleja oskaks', [
        'Artiklist: seadus **nõuab, et** taotlejal **oleks** püsiv sissetulek · taotlemine **eeldab** pikka elamist · inimene võib olla eksamitest **vabastatud** · ei **nõuta**, et ta **räägiks** aktsendita',
        'Kordamine (B1): peab, tuleb, ei pea, ei tohi: Taotleja peab eksami sooritama.',
        'B2, nõue kõrvallausega: **nõuab, et** + tingiv: et taotleja **oskaks**, **elaks**, **sooritaks** · eitus: ei nõua, et ta **räägiks** aktsendita',
        'B2, nõue nimisõnaga: **eeldab** + osastav: eeldab **keeleoskust**, **elamist** · **on nõutav** / **ei ole nõutav**',
        'B2, erand: **on vabastatud** + -st: on **eksamist** vabastatud · lihtsas keeles: ei pea eksamit tegema (mitte: ei tohi).',
        'Vene keeles „закон требует, чтобы заявитель знал” (чтобы + прошедшее время) — eesti keeles nõuab, et taotleja oskaks (et + tingiv kõneviis).',
      ], 'full'), 'Kordamine ühe minutiga (peab, ei pea, ei tohi). Siis B2 samm: ametlik nõue — nõuab, et + tingiv; eeldab + osastav; on vabastatud + -st. Küsi iga näite juures: „Kuidas ütleksid seda sugulasele lihtsalt?” L1 rida: vene „чтобы” + minevik = eesti „et” + tingiv.'), 3, 22),
      why(teach(tag(B.gaps('068_p_forms', 'Nõuded lühidalt.', 'Kas lause vajab tingivat kõneviisi, osastavat, -st-lõpu või ei pea / ei tohi? Kirjuta lünka õige vorm. Panka ei ole.', [
        'Seadus nõuab, et taotleja [oskaks] eesti keelt vähemalt B1-tasemel. (oskama)',
        'Samuti nõutakse, et taotleja [elaks] Eestis seaduslikult vähemalt kaheksa aastat. (elama)',
        'Seadus nõuab, et taotleja [sooritaks] ka põhiseaduse eksami. (sooritama)',
        'Kodakondsus eeldab püsivat [sissetulekut]. (sissetulek)',
        'Taotlemine eeldab ka [keeleoskust]. (keeleoskus)',
        'Eesti keeles gümnaasiumi lõpetanud inimene on keeleeksamist [vabastatud]. (vabastama)',
        'Tervise tõttu võib inimene olla [eksamist] osaliselt vabastatud. (eksam)',
        'Seadus ei nõua, et taotleja [räägiks] ilma aktsendita. (rääkima)',
        'Taotleja [ei pea] olema Eestis sündinud. (kohustus puudub: kaks sõna)',
        'Eksamil [ei tohi] kasutada telefoni. (keeld: kaks sõna)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas see on nõue, erand või keeld?” Read 1–3 ja 8: nõuab, et + tingiv (-ks). Read 4–5: eeldab + osastav. Read 6–7: vabastatud + -st. Read 9–10: ei pea (vabadus) ≠ ei tohi (keeld).'), [
        'nõuab, et + tingiv: oskaks.',
        'nõutakse, et + tingiv: elaks.',
        'nõuab, et + tingiv: sooritaks.',
        'eeldama + osastav: sissetulekut.',
        'eeldama + osastav: keeleoskust.',
        'olema vabastatud (millest).',
        'vabastatud + -st: eksamist.',
        'ei nõua, et + tingiv: räägiks.',
        'Kohustust ei ole: ei pea.',
        'Keeld: ei tohi.',
      ]),
      why(teach(tag(B.insertion('068_p_bank', 'Eksaminurk: foorumi vastus.', 'Loe foorumi vastust. Vali igasse lünka sobiv lause. Üks lause jääb üle.', 'Vastus foorumis: „Kas ma pean eksamiks kõik paragrahvid pähe õppima?”', [
        'Tere! Mul oli sama hirm kaks aastat tagasi. [[Tegelikult ei pea paragrahve üldse pähe õppima.]] Põhiseaduse eksamil on laual seadusetekst ja sina pead oskama sealt vastuse leida.',
        'Mina alustasin küsimuste kogust, mis on avalikult kättesaadav. [[Lugesin iga päev kümme küsimust ja otsisin vastused seadusest.]] Kahe kuu pärast leidsin õige koha juba paari minutiga.',
        'Keeleeksamiga oli teisiti. [[Seal aitas kõige rohkem see, et rääkisin iga päev eesti keeles.]] Käisin raamatukogu vestlusringis ja kuulasin hommikuti raadiot.',
        'Kõige rohkem kartsin suulist osa. [[Selgus aga, et küsimused olid igapäevaelust: töö, pere ja kodukoht.]] Eksamineerija oli rahulik ja kordas küsimust, kui ma kohe aru ei saanud.',
        'Ühe asjaga ole siiski ettevaatlik. [[Ära usalda foorumi juttu, vaid kontrolli nõudeid ametlikult lehelt.]] Nõuded võivad muutuda ja iga inimese olukord on veidi erinev.',
      ], ['Eksamil võib kasutada ka sõnaraamatut ja telefoni.'], 'g_read'), { task: 'R16', harno: 'R4' }),
      'Eksaminurk (Harno B2 lugemine, osa 4): terved laused lünkadesse, üks üleliigne. Küsi iga lünga juures, mis naaberlauses vihjab (sama hirm → tegelikult; küsimuste kogu → lugesin küsimusi; teisiti → seal aitas …). Üleliigne lause on vale ka sisult: telefoni ei tohi kasutada (vt 068_p_forms rida 10).'), [
        'Hirm → „Tegelikult ei pea …”: järgmine lause seletab, miks (seadusetekst on laual).',
        '„küsimuste kogust” → „Lugesin iga päev kümme küsimust …”; järgmine lause räägib tulemusest.',
        '„Keeleeksamiga oli teisiti” → „Seal aitas …”; järgmine lause nimetab vestlusringi ja raadio.',
        '„kartsin suulist osa” → „Selgus aga, et …”.',
        '„ole ettevaatlik” → „Ära usalda foorumi juttu …”; järgmine lause: nõuded võivad muutuda.',
      ]),
      draft('068_p_draft', 'sõnumi esimene lõik', 'Kirjuta nõbule vähemalt 6 lauset lihtsas keeles: mida seadus nõuab, mida mitte ja mis on tema järgmine samm?', 'Ülesande täitmine ja register (lihtne keel, sõbralik toon)'),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('068_t_advise', 'Vahendus: seleta nõudeid nõbule (12–15 minutit).', 'Nõbu luges ametlikku teksti ja on segaduses. Seleta talle lihtsas keeles nõuded, erandid ja järgmine samm. Kontrolli, kas ta sai aru.',
        'Kaart A — sina:\nsa lugesid artiklit ja tead nõudeid; sinu nõbu elab Eestis kümme aastat ja tahab kodakondsust\nAbikaart: Lihtsalt öeldes tähendab see, et sa pead … · Seadus ei nõua, et sa … · Kas see on nüüd selge?\nLisaväljakutse: seleta üks nõue nii ametlikus kui ka lihtsas keeles ning ütle, kust ta saab kontrollida.',
        'Kaart B — nõbu (õpetaja või paariline):\n„Sõber ütles, et pean põhiseaduse pähe õppima.” · „Mul on aktsent — kas see on probleem?” · „Mida tähendab „eeldab püsivat sissetulekut”?” · Kaks uut infot on õpetajal.',
        [], []), 'mediation',
      ['Lihtsalt öeldes tähendab see, et sa pead …', 'Seadus ei nõua, et sa …', 'Kas see on nüüd selge?'],
      'Seleta üks nõue nii ametlikus kui ka lihtsas keeles ning ütle, kust ta saab kontrollida.', { task: 'S13', fluency: true }),
      'Vahendus (v6 §2 l, mediation): õppija ei loe teksti ette, vaid seletab oma sõnadega ja kontrollib arusaamist. Sina oled nõbu (paaris: paariline kaardiga B). Varjatud info (ütle ükshaaval): 1) „Ma lõpetasin siin eesti õppekeelega gümnaasiumi.” (Õppija peab märkama erandit: keeleeksamit ei pea tegema, kuid tõend on vaja.) 2) „Ma ei taha oma praegusest passist loobuda.” (Õppija seletab rahulikult, et üldjuhul tuleb loobuda, ja soovitab kontrollida ametlikult lehelt — ilma poliitilise hinnanguta.) Õnnestunud, kui õppija seletab vähemalt kolm nõuet lihtsas keeles, eristab „ei pea” ja „ei tohi”, reageerib uuele infole ja nimetab usaldusväärse allika. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'advise' }),
      exitTalk('068_t_say', 'Seleta 30 sekundiga ühte nõuet nii, nagu räägiksid sõbrale, kes ei tea ametlikke sõnu.', ['Mida seadus nõuab?', 'Mida see tähendab lihtsas keeles?', 'Mis sa arvad, miks on keeleoskus nõuete hulgas? Kas mõnes teises riigis, mida sa tead, on sarnane nõue?'], 'Kas õppija nimetab nõude ja seletab selle lihtsas keeles (pead / ei pea), ilma et loeks teksti ette?'),
      keepPlace(selfCheck('068_t_self', ['Leidsin artiklist nõuded ja erandid ning eristasin neid kuulujuttudest.', 'Kasutasin nõude väljendeid (nõuab, et … oskaks; eeldab keeleoskust; on vabastatud).', 'Seletasin ametlikku teksti lihtsas keeles ja kontrollisin, kas mind mõisteti.'], 'Nõuded seletatud', 'Ma oskan ametlikku teksti lihtsas keeles seletada')),
      tag(homeTask(homeLines(B.examWriting('068_t_mail', 'Kodus: sõnum nõbule (umbes 140 sõna).', `Lõpeta tunni mustand sõnumiks (130–150 sõna). Algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Nõbu palus kirjalikku kokkuvõtet. Päris allikas: Politsei- ja Piirivalveamet (https://www.politsei.ee) — leia kodakondsuse taotlemise leht ja kirjuta üles kolm asja: kus taotlust saab esitada, milliseid dokumente küsitakse ja kui kaua menetlus kestab. Lisa need sõnumisse ja kirjuta, et info on sealt.',
        points: ['mida seadus nõuab (lihtsas keeles)', 'mida seadus ei nõua (üks kuulujutt ümber lükatud)', 'tema erand või küsimus, mida ta peab ise kontrollima', 'järgmine samm ja ametliku lehe info (kolm asja)'],
        words: [130, 150],
      }), 6)), { task: 'W12' }),
      writingRubric('068_t_rubric', 'Hindamisjuhend: sõnum nõbule (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Seadus nõuab, et sa oskad eesti keel B1. Ka eksam põhiseadus. Sa ei tohi aktsent. Vaata internet. Edu!” Hinnang: ülesanne 2 (kaks nõuet on olemas, kuid järgmine samm ja ametliku lehe info puuduvad), ülesehitus 2 (lühikesed laused, järjekord on selge), sõnavara 2 (puuduvad taotlema, erand, menetlus), grammatika 1 („nõuab, et sa oskad” → et sa oskaksid, „eesti keel” → eesti keelt); sisuviga: „Sa ei tohi aktsent” — seadus ei nõua aktsendita kõnet (ei pea ≠ ei tohi). Kui õppija lisab erandi, järgmise sammu ja allika ning parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-069': {
    title: 'Pime tee bussipeatusse: kuidas teha vallale ettepanek, millele vastatakse?',
    phases: grammar('Kordamine: kui oleks valgus, oleks ohutum · B2: teen ettepaneku, et vald paigaldaks; valgustid paigaldataks, kõnnitee ehitataks; selle asemel et …, võiks'),
    format: 'project',
    topic: 'town',
    canDo: 'Ma saan aru umbes 4-minutilisest raadiosaatest sellest, millisele ettepanekule vald vastab, koostan paarilisega oma kodukoha probleemi kohta ettepaneku kahe lahenduse ja kogukuluga, esitlen seda komisjonile ning kirjutan vallale umbes 180-sõnalise ettepaneku; kasutan tingivat kõneviisi (vald paigaldaks, valgustid paigaldataks, oht väheneks).',
    teacherPage: {
      goal: 'Радио о предложениях волости; безличное условное (paigaldataks); проект в паре: два решения, общая стоимость, питч комиссии; дома предложение 180 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — дважды, пропуски 1–7; станция 3 — правило и 10 предложений, черновик 3 предложения; проект — одна проблема, два решения, питч 1 минута без вопроса комиссии.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в сообщении двоюродному брату (068), и одной строкой говорит, что изменил. Вопрос, если есть время: «Что в твоём дворе или на улице ты изменил(а) бы первым?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (68)',
        '5–25: станция 2 — 10 слов + 3 на повтор (2 мин), схема предложения (читаем до прослушивания), стратегия: проверить предсказания по ключевым словам; радио дважды (9 мин), 10 пропусков по 1–2 слова (Harno L3)',
        '25–47: станция 3 — kui …, oleks одной строкой (B1), B2: личное условное (vald paigaldaks) и безличное (paigaldataks, ehitataks, toodaks), selle asemel et …, võiks; 10 предложений, 8 перефраз; черновик предложения (10 мин), обратная связь — грамматика (условное)',
        '47–70: станция 4 — проект в паре: проблема, кого касается, доказательство, два решения с общей стоимостью, выбор; питч 1 минута комиссии (вы), один вопрос',
        '70–75: выход: 30 секунд — суть предложения; самооценка; домашнее задание: предложение волости 180 слов, однокурсник отвечает «две звезды и пожелание», голосовое, Harjuta',
        'Kui aega jääb (75–90): «Комиссия голосует» — пары слушают питчи друг друга и голосуют по двум критериям: польза для группы риска и общая стоимость',
      ],
      sources: 'Радио «Küsi vallalt» — учебный текст KeeleSepp (ведущая Triinu и советник Jaanus вымышлены). Общая основа: на официальное обращение учреждение отвечает, как правило, в течение 30 дней (закон об ответах на обращения — märgukirjad ja selgitustaotlused); kaasav eelarve — часть бюджета волости, которую распределяют жители голосованием; анонимное обращение не рассматривается. Деревня «Kase küla» вымышлена.',
      groups: 'Радио — каждый сам, ответы сравнивают в паре. Черновик — каждый сам. Станция 4 — пары готовят одно предложение (12 мин), потом питч 1 минута; в группе остальные — комиссия. В 1:1 вы — комиссия и вторая половина пары (вы предлагаете второе решение).',
      errors: [
        '«Teen ettepaneku, et vald paigaldab valgustid» → «… et vald paigaldaks valgustid» (предложение: et + условное).',
        '«Valgustid paigaldaksid sügisel» (= они сами установили бы) → «Valgustid paigaldataks sügisel» (безличное условное: -taks / -daks).',
        '«Kui valgustid paigaldataks, oht väheneb» → «… väheneks oht» (обе части условные; глагол второй после придаточного).',
        '«Selle asemel ehitada kõnnitee» → «Selle asemel, et ehitada kõnnitee, võiks …» (selle asemel, et + da).',
      ],
      notes: [
        'Проект (v6 §2 d, project): продукт — предложение с двумя решениями и общей стоимостью (строительство + уход + электричество), не «жалоба». Пусть пары выбирают свою проблему; если нет идеи — тёмная дорога к остановке из радио.',
        'Справедливость и группа риска — главные аргументы: спросите, кому решение поможет больше всего и не обидит ли оно другие деревни.',
        'Слова на повтор (kogukulu из урока 54, õiglane из 63, riskirühm из 64) звучат в радио: попросите ученика поднять руку.',
      ],
    },
    discover: [
      station(half(revision('069_d_revise', 'b1b2-068', 'Kirjuta ümber kolm lauset, mille õpetaja sinu sõnumis nõbule märkis. Lisa üks rida: mida sa muutsid ja miks?')), 1, 5),
      station(half(withReview(tag(B.vocab('069_d_vocab', 'Tunni sõnad.', ['ettepanek — предложение', 'vallavalitsus — управа волости', 'volikogu — совет (волости)', 'pöördumine — обращение', 'allkiri — подпись', 'kaasav eelarve — бюджет участия', 'tänavavalgustus — уличное освещение', 'kõnnitee — тротуар', 'paigaldama — устанавливать', 'hääletama — голосовать']), { topic: ['ettepanek', 'vallavalitsus', 'volikogu', 'pöördumine', 'kaasav eelarve', 'tänavavalgustus', 'kõnnitee', 'märgukiri'] }), ['kogukulu', 'õiglane', 'riskirühm'])), 2, 20),
      teach(B.diagram('069_d_scheme', 'flow', { title: 'Skeem: ettepanek, millele vastatakse', instruction: 'Enne kuulamist loe skeem läbi. Kuulates kirjuta iga kasti juurde märksõna. Viimasesse kasti kirjuta oma kodukoha probleem.', nodes: 'Koht ja probleem: kus ja mis? …\nKeda see puudutab (riskirühm)? …\nTõend: fotod, kaart, allkirjad, kuupäevad …\nKaks lahendust ja kogukulu: …\nPalve: mida ja mis ajaks? …\nMinu kodukoha probleem: …' }, 'full', 'g_notice'),
        'Skeem on enne saadet ja on õppija projekti plaan jaamas 4. Täidetud: Kase küla tee bussipeatusse, pime → koolilapsed ja eakad → fotod, kaart, 20 pere allkirjad, kuupäevad → valgustus kogu teele (kallis) või päikesepaneeliga valgustid ohtlikule lõigule (odavam), kõnnitee (kõige kallim); kogukulu = ehitus + hooldus + elekter → palun vastake, kas ja millal.'),
      why(teach(tag(twiceInLesson(B.listening('069_d_info', 'Kuulamine: vallaraadio „Küsi vallalt”.', 'Loe laused läbi ja ennusta puuduvad sõnad. Kuula saadet kaks korda. Kirjuta igasse lünka 1–2 sõna.', [
        'Triinu: Tere, siin vallaraadio saade „Küsi vallalt”! Kuulajad küsivad sageli, miks nende kiri vallale vastuseta jääb. Stuudios on vallavalitsuse arendusnõunik Jaanus. Jaanus, kas vald tõesti ei vasta?',
        'Jaanus: Vastab ikka. Seadus nõuab, et ametlikule pöördumisele vastataks üldjuhul kolmekümne päeva jooksul. Aga vastus võib olla väga lühike, kui kirjast ei saa aru, mida inimene tegelikult soovib. Kiri „Meie küla on unustatud” on mõistetav, kuid selle peale ei saa vald midagi otsustada.',
        'Triinu: Milline on siis hea ettepanek?',
        'Jaanus: Hea ettepanek algab konkreetsest kohast ja probleemist. Näiteks: „Kase külast viib bussipeatusse kilomeetrine tee, millel ei ole valgustust. Talvel käivad seal pimedas koolilapsed ja eakad.” Siis on kohe selge, kus probleem on ja keda see puudutab.',
        'Triinu: Ja mis tuleb edasi?',
        'Jaanus: Tõend. Fotod, kaart ja naabrite allkirjad. Kui ettepanekule on alla kirjutanud kakskümmend peret, näeb volikogu, et see ei ole ühe inimese mure. Väga hea on, kui kirjas on ka kuupäevad: millal juhtus ohtlik olukord või millal buss hommikul peatub.',
        'Triinu: Kas elanik peab ise teadma, mis lahendus maksab?',
        'Jaanus: Täpselt ei pea, aga see aitab. Kui elanik on võrrelnud kahte lahendust, on otsustajal palju lihtsam. Näiteks tänavavalgustus kogu teele oleks kallis. Päikesepaneeliga valgustid ainult kõige ohtlikumale lõigule maksaksid vähem. Kõnnitee ehitamine oleks kõige kallim. Kui kirjas on mõeldud ka kogukulule, see tähendab, et peale ehitamise on arvestatud ka hoolduse ja elektriga, siis võetakse ettepanekut tõsiselt.',
        'Triinu: Kuulajad küsivad ka, kas on õiglane, et ühe küla tee saab valgustuse ja teise oma mitte.',
        'Jaanus: Hea küsimus. Seepärast tasub ettepanekus kirjutada, miks just see koht on kõige ohtlikum. Riskirühmad — lapsed, eakad, ratastooliga inimesed — on otsustamisel tähtis argument. Vahel on õiglasem alustada odavamast lahendusest mitmes kohas korraga.',
        'Triinu: Mis on kaasav eelarve?',
        'Jaanus: Kaasav eelarve on osa valla eelarvest, mille kasutamise üle otsustavad elanikud ise. Sügisel saab esitada ideid ja hiljem hääletavad kõik elanikud. Eelmisel aastal võitis näiteks idee panna pakendikonteinerid kolme bussipeatuse juurde. Kaasava eelarve idee peab olema kõigile avatud ja selle peab saama ellu viia ühe aasta jooksul.',
        'Triinu: Kas ettepaneku võib saata ka e-kirjaga?',
        'Jaanus: Võib. Kirjuta valla üldaadressile ja märgi pealkirja, et tegemist on ettepanekuga. Lisa oma nimi ja kontakt, sest anonüümsele kirjale vald ei vasta. Ja ära unusta lõppu palvet: palun vastake, kas ja millal saab probleemi lahendada.',
        'Triinu: Mida soovitad kuulajale, kes tahab täna alustada?',
        'Jaanus: Räägi kõigepealt naabritega. Kui kolm-neli peret on ühel meelel, kirjutage koos. Üks hästi läbimõeldud kiri on parem kui kümme vihast kommentaari sotsiaalmeedias.',
        'Triinu: Aitäh, Jaanus!',
      ], [
        'Ametlikule pöördumisele vastab vald üldjuhul [kolmekümne päeva|30 päeva|kuu] jooksul.',
        'Kui kirjas on ainult lause „Meie küla on unustatud”, ei saa vald selle peale midagi [otsustada].',
        'Jaanuse sõnul algab hea ettepanek alati konkreetsest [kohast] ja probleemist, mitte üldisest kurtmisest.',
        'Kase küla pimedal teel käivad talvel hommikuti bussi peale koolilapsed ja [eakad].',
        'Fotod, kaart ja naabrite [allkirjad] on tõend, mis näitab volikogule, et mure on paljudel.',
        'Päikesepaneeliga valgustid ohtlikule lõigule [maksaksid vähem|oleksid odavamad].',
        'Kolmest lahendusest oleks kõige kallim [kõnnitee|kõnnitee ehitamine], mida ka hooldada tuleb.',
        'Kogukulu hulka kuuluvad ehitamise kõrval ka hooldus ja [elekter].',
        'Kaasava eelarve idee peab olema kõigile avatud ja selle peab saama ellu viia ühe [aasta] jooksul.',
        'Kirjale tuleb lisada nimi ja kontakt, sest anonüümsele kirjale vald [ei vasta|ei vasta üldse].',
      ], 'g_listen')), { voice: 'interview', task: 'L04', harno: 'L3' }),
      'Kuulamine, umbes 20 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): seekord „kontrolli” — õppija kirjutab ennustused pliiatsiga ja kontrollib neid kuulates. Eksaminurk (Harno B2 kuulamine, osa 3): 10 lünka, 1–2 sõna. Kordamise sõnad (kogukulu, õiglane, riskirühm) on saates.'), [
        'Jaanus: „üldjuhul kolmekümne päeva jooksul”.',
        'Jaanus: „selle peale ei saa vald midagi otsustada”.',
        'Jaanus: „Hea ettepanek algab konkreetsest kohast ja probleemist.”',
        'Jaanus: „käivad seal pimedas koolilapsed ja eakad”.',
        'Jaanus: „Fotod, kaart ja naabrite allkirjad.”',
        'Jaanus: „Päikesepaneeliga valgustid … maksaksid vähem.”',
        'Jaanus: „Kõnnitee ehitamine oleks kõige kallim.”',
        'Jaanus: „arvestatud ka hoolduse ja elektriga”.',
        'Jaanus: „selle peab saama ellu viia ühe aasta jooksul”.',
        'Jaanus: „anonüümsele kirjale vald ei vasta”.',
      ]),
    ],
    practice: [
      station(teach(B.notice('069_p_notice', 'Märka: vald paigaldaks — valgustid paigaldataks', [
        'Saatest: valgustid **maksaksid** vähem · kõnnitee ehitamine **oleks** kõige kallim · seadus nõuab, et pöördumisele **vastataks**',
        'Kordamine (B1): kui …, siis …: Kui teel oleks valgus, oleks ohutum.',
        'B2, ettepanek, tegija on nimetatud: Teen ettepaneku, et vald **paigaldaks** valgustid. · Valgustid **maksaksid** vähem.',
        'B2, umbisikuline tingiv (tegija ei ole tähtis): valgustid **paigaldataks** sügisel · kõnnitee **ehitataks** järgmisel aastal · konteinerid **toodaks** peatuse juurde',
        'B2, tulemus ja asendus: kui valgustid paigaldataks, **väheneks** oht · selle asemel, et ehitada kõnnitee, **võiks** alustada valgustitest.',
        'Vene keeles „чтобы установили” või „было бы установлено” — eesti keeles üks sõna: paigaldataks (-taks / -daks).',
      ], 'full'), 'Kordamine ühe minutiga (kui …, oleks). Siis B2 samm: tingiv kõneviis ettepanekus — tegijaga (vald paigaldaks) ja ilma (paigaldataks). Küsi iga näite juures: „Kas tegija on tähtis?” L1 rida: vene keeles kaks sõna, eesti keeles üks lõpp -taks / -daks.'), 3, 22),
      why(teach(tag(B.gaps('069_p_forms', 'Meie ettepanek vallale.', 'Kas tegija on nimetatud või mitte? Kirjuta tegusõna tingiva kõneviisi vormis: isikuga või umbisikuline (-taks / -daks). Panka ei ole.', [
        'Teeme ettepaneku, et vald [paigaldaks] tee äärde valgustid. (paigaldama; tegija: vald)',
        'Valgustid [paigaldataks] juba enne talve. (paigaldama; tegijat ei nimetata)',
        'Kõnnitee [ehitataks] alles järgmisel aastal. (ehitama; tegijat ei nimetata)',
        'Kui teele tuleks valgus, [väheneks] õnnetuste oht. (vähenema)',
        'Päikesepaneeliga valgustid [maksaksid] vähem kui tavaline tänavavalgustus. (maksma)',
        'Pakendikonteinerid [toodaks] bussipeatuse juurde kevadel. (tooma; tegijat ei nimetata)',
        'Selle asemel, et ehitada kallis kõnnitee, [võiks] alustada valgustitest. (võima)',
        'Kui see [oleks] võimalik, sooviksime vastust kuu aja jooksul. (olema)',
        'Seadus nõuab, et pöördumisele [vastataks] kolmekümne päeva jooksul. (vastama; tegijat ei nimetata)',
        'Kui lahendus [tehtaks] koos naabritega, oleks see õiglasem. (tegema; tegijat ei nimetata)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas tegija on tähtis või mitte?” Read 1, 5, 7: tingiv isikuga. Read 2, 3, 6, 9, 10: umbisikuline tingiv (-taks / -daks; tooma → toodaks, tegema → tehtaks). Read 4 ja 8: kui-lause ja tulemus.'), [
        'Tegija on vald: paigaldaks.',
        'Tegijat ei nimetata: paigaldataks.',
        'Tegijat ei nimetata: ehitataks.',
        'Tulemus tingivas: väheneks.',
        'Valgustid ise maksavad: maksaksid (mitmus).',
        'tooma → toodaks.',
        'selle asemel, et …, võiks.',
        'kui + tingiv: oleks.',
        'vastama → vastataks.',
        'tegema → tehtaks.',
      ]),
      why(teach(tag(B.transformation('069_p_cond', 'Ettepaneku laused ametlikuks.', 'Alusta antud sõnadega. Kasuta tingivat kõneviisi.', [
        ['Vald peab valgustid paigaldama.', 'Teeme ettepaneku, et …', 'Teeme ettepaneku, et vald paigaldaks valgustid.|Teeme ettepaneku, et vald paigaldaks tee äärde valgustid.|Teeme ettepaneku, et valgustid paigaldataks.'],
        ['Ehitage meie külla kõnnitee!', 'Palume kaaluda, kas …', 'Palume kaaluda, kas meie külla ehitataks kõnnitee.|Palume kaaluda, kas meie külla saaks ehitada kõnnitee.|Palume kaaluda, kas vald ehitaks meie külla kõnnitee.'],
        ['Kui on valgus, on lastel ohutum.', 'Kui oleks …', 'Kui oleks valgus, oleks lastel ohutum.|Kui oleks valgus, oleks lastel ohutum käia.|Kui oleks valgustus, oleks lastel ohutum.'],
        ['Valgustid maksavad vähem kui kõnnitee.', 'Valgustid …', 'Valgustid maksaksid vähem kui kõnnitee.|Valgustid läheksid maksma vähem kui kõnnitee.|Valgustid oleksid odavamad kui kõnnitee.'],
        ['Kõnnitee asemel võib alustada valgustitest.', 'Selle asemel, et …', 'Selle asemel, et ehitada kõnnitee, võiks alustada valgustitest.|Selle asemel, et kõnniteed ehitada, võiks alustada valgustitest.|Selle asemel, et ehitada kõnnitee, võiks vald alustada valgustitest.'],
        ['Konteinerid tuuakse bussipeatuse juurde.', 'Meie ettepanek on, et …', 'Meie ettepanek on, et konteinerid toodaks bussipeatuse juurde.|Meie ettepanek on, et vald tooks konteinerid bussipeatuse juurde.|Meie ettepanek on, et bussipeatuse juurde toodaks konteinerid.'],
        ['Vastake meile kuu aja jooksul.', 'Oleksime tänulikud, kui …', 'Oleksime tänulikud, kui vastaksite meile kuu aja jooksul.|Oleksime tänulikud, kui te vastaksite meile kuu aja jooksul.|Oleksime tänulikud, kui meile vastataks kuu aja jooksul.'],
        ['Kui teeme seda koos naabritega, on see õiglasem.', 'Kui seda …', 'Kui seda tehtaks koos naabritega, oleks see õiglasem.|Kui seda teeksime koos naabritega, oleks see õiglasem.|Kui seda teeks vald koos naabritega, oleks see õiglasem.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Ettepanekus on tingiv kõneviis viisakam kui käsk ja täpsem kui „peab”. Kontrolli: pärast kui-lauset tuleb pealauses tegusõna kohe (Kui oleks valgus, oleks …); umbisikuline tingiv lõpeb -taks / -daks.'), [
        'Käsk → ettepanek: et vald paigaldaks (või: et paigaldataks).',
        'Käsk → viisakas küsimus: kas ehitataks.',
        'Mõlemad pooled tingivas: oleks …, oleks.',
        'Võrdlus tingivas: maksaksid.',
        'selle asemel, et + da …, võiks.',
        'Tegija ei ole tähtis: toodaks.',
        'Käsk → viisakas palve: kui vastaksite.',
        'Umbisikuline tingiv: tehtaks; tulemus: oleks.',
      ]),
      draft('069_p_draft', 'ettepaneku esimene lõik', 'Kirjuta vallale vähemalt 6 lauset: kus on probleem, keda see puudutab ja mida te ette panete? Kasuta kolme tingiva vormi.', 'Grammatika (tingiv kõneviis: paigaldaks, paigaldataks, väheneks)'),
    ],
    transfer: [
      station(teach(mainTask(B.ideaCard('069_t_project', 'Projekt: meie ettepanek vallale (15–18 minutit).', 'Valige paaris kodukoha probleem ja kaks lahendust. Võrrelge kogukulu ja kasu. Esitlege komisjonile 1 minut ja vastake küsimusele.', [
        'Komisjon (õpetaja) kuulab ettepanekuid ja valib ühe, mis läheb kaasavasse eelarvesse. Probleem: pime tee bussipeatusse, kooli juures pole kõnniteed, konteinerid on alati täis, mänguväljak on katki — või teie oma.',
        'Abikaart: Teeme ettepaneku, et … · Kui … paigaldataks, väheneks … · Selle asemel, et …, võiks …',
        'Lisaväljakutse: vasta komisjoni vastuväitele „See ei ole teiste külade suhtes õiglane”.',
      ], [
        'koht ja probleem',
        'keda see puudutab (riskirühm)',
        'tõend: fotod, allkirjad, kuupäevad',
        'lahendus A ja selle kogukulu',
        'lahendus B ja selle kogukulu',
        'meie valik ja miks',
      ], 'Ühe minuti esitlus ja märkmed: probleem, tõend, kaks lahendust, valik ja palve.', [180, 240]), 'project',
      ['Teeme ettepaneku, et …', 'Kui … paigaldataks, väheneks …', 'Selle asemel, et …, võiks …'],
      'Vasta komisjoni vastuväitele „See ei ole teiste külade suhtes õiglane”.', { task: 'S16', fluency: true }),
      'Projekt (v6 §2 d, project): paar valmistab 12 minutit, siis esitlus 1 minut ja üks komisjoni küsimus. Sina oled komisjon. Varjatud info (ütle pärast esitlust): „Selle aasta kaasava eelarve raha jätkub ainult ühele odavamale lahendusele.” (Paar peab valiku üle kaaluma või põhjendama, miks kallim lahendus on pikas plaanis soodsam — kogukulu.) Küsimus: „Keda teie lahendus aitab kõige rohkem ja kas see on õiglane teiste külade suhtes?” Õnnestunud, kui esitluses on koht, tõend, kaks lahendust koos kogukuluga, valik ja palve, õppija kasutab vähemalt kolme tingiva vormi (paigaldaks, paigaldataks, väheneks, võiks) ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 23, { final: 'decide' }),
      exitTalk('069_t_say', 'Ütle 30 sekundiga oma ettepaneku tuum: probleem, tõend ja lahendus, mida vald teeks.', ['Mis on probleem ja keda see puudutab?', 'Mida vald teeks ja mis siis muutuks?'], 'Kas õppija nimetab probleemi, tõendi ja lahenduse ning kasutab vähemalt üht tingiva vormi (paigaldaks, paigaldataks, väheneks)?'),
      keepPlace(selfCheck('069_t_self', ['Sain raadiosaatest aru, millisele ettepanekule vald vastab.', 'Kasutasin tingivat kõneviisi (vald paigaldaks, valgustid paigaldataks, oht väheneks).', 'Esitlesime ettepanekut kahe lahenduse ja kogukuluga ning vastasime küsimusele.'], 'Ettepanek esitletud', 'Ma oskan vallale ettepaneku teha')),
      teach(tag(homeTask(homeLines(peerReply(B.examWriting('069_t_mail', 'Kodus: ettepanek vallale (umbes 180 sõna).', `Lõpeta tunni mustand ettepanekuks (170–190 sõna). Pöördumist ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Kirjuta oma valla või linna vallavalitsusele tunni projekti põhjal. Saada ettepanek ka ühele kursusekaaslasele: ta vastab kahe tugeva koha ja ühe sooviga hindamisjuhendi järgi.',
        points: ['koht ja probleem ning keda see puudutab', 'tõend (fotod, allkirjad, kuupäevad)', 'kaks lahendust ja nende kogukulu, teie valik', 'palve: vastata, kas ja millal probleemi saab lahendada'],
        words: [170, 190],
      })), 6)), { task: 'W14' }),
      'Kaaslase vastus (v6 G25): kursusekaaslane loeb ettepanekut ja vastab hindamisjuhendi järgi kahe tugeva koha ja ühe sooviga. Üks-ühele: vastajaks on teise rühma õppija (õpetaja vahendab, nimed ära) või õpetaja vastab komisjoni liikmena ja õppija vastab omakorda ühe eakaaslase ettepanekule kursuse näidiste seast.'),
      writingRubric('069_t_rubric', 'Hindamisjuhend: ettepanek vallale (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Meie tee on pime. See on ohtlik. Vald peab panema valgus. Kui valgustid paigaldaksid, lapsed on ohutum. Me ootame.” Hinnang: ülesanne 2 (probleem ja üks lahendus on olemas, kuid tõend, teine lahendus ja kogukulu puuduvad), ülesehitus 2 (järjekord on selge, sidendeid on vähe), sõnavara 2 (puuduvad ettepanek, kõnnitee, kogukulu, riskirühm), grammatika 1 („Vald peab panema valgus” → teeme ettepaneku, et vald paigaldaks valgustid; „valgustid paigaldaksid” → paigaldataks; „lapsed on ohutum” → oleks lastel ohutum). Kui õppija lisab tõendi, teise lahenduse ja viisaka palve ning parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-070': {
    title: 'Kontroll 14 — ühiskond ja avalikud teenused',
    format: 'exam',
    assessment: true,
    canDo: 'Ma saan eksami vormis aru kaheksast lühiteatest, mida kuulen üks kord, ja umbes kolmeminutilisest intervjuust ning räägin: ühe minuti arvamuse samades tingimustes nagu mooduli alguses ja arutelu, kus jõuan partneriga ühise seisukohani; Harno lävi on 60 %.',
    teacherPage: {
      goal: 'Контроль модуля 14 на одном листе, 45 минут: аудирование (16 баллов) + говорение (18 баллов). Параллельная задача к холодной задаче урока 066 и обсуждение с аналитической рубрикой.',
      core: [1], alt: 1,
      short: 'Если времени мало: аудирование (20 мин) в классе со всеми; говорение — парами в следующем уроке в тех же условиях (без подготовки дома).',
      hook: 'Почему аудирование + говорение, а не полный пробный экзамен: решение методиста для 040, 055, 060 и 065 — по v6 §2 g контроль B2 — два навыка по очереди (модуль 12 L + S, модуль 13 R + W, модуль 14 L + S); следующий полный пробный экзамен — 080. Холодная задача модуля устная (066_d_cold), поэтому и параллельная задача устная; объявления волости, библиотеки и спасателей приходят к ученику на слух, а с волостью и соседями он договаривается устно.',
      plan: [
        '0–2: инструкция, баллы и пороги (Harno 60 %, KeeleSepp 70 % и 80 %, ни одна часть не 0)',
        '2–11: аудирование 1 — восемь коротких объявлений по 35–45 секунд, каждое один раз, 8 вопросов с выбором (Harno L1)',
        '11–22: аудирование 2 — интервью ≈ 3 минуты дважды, 8 вопросов с выбором; варианты ответа сформулированы другими словами (Harno L2)',
        '22–45: говорение парами: 1 — параллельная задача (1 мин подумать, 1 мин говорить, новое утверждение того же типа); 2 — обсуждение по карточкам A / B, 4 минуты, общая позиция; вы вносите новую информацию',
      ],
      sources: 'Объявления и интервью — учебные тексты KeeleSepp (Sandra и Mati вымышлены). Общая основа: соцработник волости и оценка помощи на дому, продуктовый банк и волонтёры, бесплатная консультация спасателей по безопасности дома, kaasav eelarve, предупреждение о жаре, вывоз мусора в праздники, шкаф для обмена едой.',
      groups: 'Аудирование — все вместе, без словаря, запись заблокирована (объявления — 1 раз, интервью — 2 раза). Говорение — парами, остальные ждут вне класса или читают; в 1:1 партнёр — вы.',
      errors: [
        'Varasemast (≈ 20 %, v6 §2 f): объявление 5 — предупреждение о жаре (урок 64), объявление 6 — вывоз мусора и сортировка (урок 61), объявление 8 — шкаф обмена едой (урок 62); в интервью вопрос 7 — volitus (урок 56). Это 4 из 16 заданий аудирования.',
        'Сравнение с холодной задачей: положите рядом заметки (или запись) 066_d_cold и 070_t_cold (оба утверждения — «кто отвечает: люди сами или волость») и назовите ученику одно развитие и один следующий шаг.',
      ],
      notes: [
        'Баллы: аудирование 8 + 8 = 16; говорение 1 — 6 баллов по трём строкам 0/1/2; говорение 2 — 12 баллов (4 критерия × 0–3). Всего 34. Harno 60 % = 21, KeeleSepp 70 % = 24, 80 % = 28. Ни одна часть не может быть 0 баллов.',
      ],
    },
    // Methodology v5 + v6 (2026-11-26): one sheet, 45 minutes, ≤ 10 blocks, LISTENING + SPEAKING; points add up (v6 G20:
    // L 8 + 8 items = 16 points; S 6 + 12 = the rubrics' maxima), the no-zero rule is stated (G21), the level is at least
    // the lessons' (the interview ≈ 3 min ≥ 150 s, its options paraphrased; clips 35–45 s heard once), the cold → parallel
    // speaking is the same task with a new statement of the same type. The v4 full control (three sheets, 28 blocks) stays
    // hidden below.
    discover: [
      B.text('070_d_intro', 'Kontroll 14: kuulamine ja rääkimine (45 minutit)', 'Kontrollis on kaks osaoskust. Kuulamine (umbes 20 minutit): kaheksa lühiteadet, igaüht kuuled üks kord, ja intervjuu, mida kuuled kaks korda, kokku 16 punkti. Rääkimine (umbes 25 minutit, paaris): ühe minuti arvamus (6 punkti) ja arutelu (12 punkti) — kokku 18 punkti. Kokku 34 punkti. Harno: sooritatud alates 60 % (vähemalt 21 punkti) ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (24 punkti), meie tunnistus alates 80 % (28 punkti) — see on sisemine lävi.'),
      PART('070_d_lpart', 'L', { minutes: 20, points: 16, tasks: 2, note: 'Kuulamine 1: kaheksa lühiteadet, igaüks üks kord (8 punkti). Kuulamine 2: intervjuu kaks korda, 8 valikvastust (8 punkti). Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      why(teach(tag(once(perClip(B.examListen('070_p_clips', 'Kuulamine 1: kaheksa lühiteadet (8 punkti).', 'Loe enne küsimus. Iga teadet kuuled ainult üks kord. Vali õige vastus.', 'choice', [
        'Head vallaelanikud! Valla sotsiaaltöötaja võtab elanikke vastu esmaspäeviti ja kolmapäeviti vallamajas kella üheksast kaheteistkümneni. Kui teie lähedane vajab abi, kuid ei saa ise vallamajja tulla, helistage meile ja leppige kokku aeg koduseks külastuseks. Abivajaduse hindamine kodus on tasuta ja võtab tavaliselt umbes tunni. Palume, et lähedane oleks külastuse ajal kodus ja teaks, miks sotsiaaltöötaja tuleb. Taotluse võib esitada ka valla kodulehel või saata e-postiga. Kui taotluse esitab lähedane, lisage palun ka volitus. Küsimuste korral helistage valla infotelefonil tööpäeviti.',
        'Toidupank otsib vabatahtlikke laupäevasteks vahetusteks. Vahetus kestab kolm tundi, hommikul kella kümnest üheni. Vabatahtlikud sorteerivad poodidest tulnud toitu ja panevad peredele pakke kokku. Eelnevat kogemust ei ole vaja, kõik vajalik õpetatakse kohapeal. Palume kaasa võtta kinnised jalanõud, sest laos liiguvad kärud ja kastid. Vabatahtlik peab olema vähemalt kuusteist aastat vana. Registreeru meie kodulehel või helista koordinaatorile. Iga vahetuse lõpus joome koos teed ja arutame, mis läks hästi. Ootame ka neid, kes saavad tulla ainult kord kuus.',
        'Linnaraamatukogu teatab: kodakondsuseksamiks valmistuv vestlusring alustab uuesti oktoobri alguses. Kohtume teisipäeviti kell kuus õhtul raamatukogu teisel korrusel. Ringis arutame põhiseaduse küsimusi ja harjutame eksami suulist osa. Osalemine on tasuta, kuid kohti on ainult kakskümmend, seepärast palume end eelnevalt kirja panna infoletis või telefoni teel. Kaasa võib võtta oma küsimused. Seadusetekste ja sõnaraamatuid saab kohapeal laenutada. Vestlusringi juhib vabatahtlik, kes on ise kodakondsuseksami mõne aasta eest sooritanud.',
        'Kaasava eelarve hääletus algab esmaspäeval ja kestab kaks nädalat. Hääletada saavad kõik vähemalt neljateistaastased valla elanikud. Igal elanikul on kolm häält, mille ta võib anda kolmele erinevale ideele. Hääletada saab valla kodulehel või raamatukogus, kus on avatud arvuti ja abistaja. Selle aasta ideede seas on kergliiklustee, mänguväljak ja valgustus bussipeatuste juures. Võitnud idee viiakse ellu järgmise aasta jooksul. Tulemused avaldatakse valla kodulehel ja vallalehes kohe pärast hääletuse lõppu. Küsimuste korral pöörduge vallamajja.',
        'Ilmateenistus on andnud kuumahoiatuse: järgmistel päevadel tõuseb temperatuur üle kolmekümne kraadi ja ka öösel ei jahtu õhk märgatavalt. Vald palub naabritel ja lähedastel helistada üksi elavatele eakatele vähemalt kord päevas. Valla päevakeskus on jahedaks puhkekohaks avatud kella kümnest kuueni. Kui inimesel on tugev peavalu ja ta on segaduses, helistage kohe hädaabinumbril üks-üks-kaks. Hoidke päeval aknad ja kardinad kinni, jooge piisavalt vett ja ärge jätke lapsi ega loomi autosse. Tuulutage tube öösel ja varahommikul.',
        'Tähelepanu, korteriühistute elanikud! Pühade tõttu muutub järgmisel nädalal prügiveo graafik. Segaprügi viiakse ära neljapäeva asemel laupäeval. Pakendikonteinerite tühjendamine jääb samaks. Palume pakendid sorteerida ja kastid enne konteinerisse panemist kokku murda, et konteiner ei saaks enne veopäeva täis. Suuri esemeid, näiteks vana mööblit, konteineri kõrvale jätta ei tohi. Nende jaoks on jäätmejaamas eraldi tasuta päev järgmisel kuul. Täpse graafiku leiate prügiveofirma kodulehelt ja trepikoja teadetetahvlilt.',
        'Päästeamet pakub üksi elavatele eakatele ja lastega peredele tasuta kodunõustamist. Päästja tuleb koju, kontrollib suitsuanduri ja ahju ning annab nõu, kuidas kodu ohutumaks teha. Vajaduse korral paigaldatakse uus suitsuandur kohe ja tasuta. Nõustamine kestab umbes pool tundi ja selle käigus võite küsida kõike, mis puudutab kodu ohutust. Aja saab kokku leppida päästeala infotelefonil või valla sotsiaaltöötaja kaudu. Päästjal on alati kaasas töötõend, mida võite paluda näha. Päästja ei küsi kunagi raha ega müü midagi, ka mitte uut andurit. Kui keegi seda teeb, helistage hädaabinumbril.',
        'Meie kaubanduskeskuse ees on nüüd toidujagamise kapp. Kappi võib panna söödavat toitu, mida ise ära ei jõua süüa: suletud pakendis toitu, puu- ja köögivilju ning leiba. Kodus valmistatud toitu ja avatud pakendeid kappi panna ei tohi, sest nende ohutust ei saa kontrollida. Samuti ei tohi kappi jätta toitu, mille „kõlblik kuni” kuupäev on möödas. Kapist võib igaüks võtta tasuta. Kappi puhastavad vabatahtlikud iga päev. Palume panna toidu kappi korralikult ja kirjutada pakile, millal see kappi pandi. Nii ei lähe toit raisku.',
      ], [
        ['1. Mida peab lähedane tegema, kui abivajaja ei saa ise sotsiaaltöötaja juurde vallamajja tulla?', 'helistama ja leppima kokku kodukülastuse', 'saatma vallale arsti tõendi', 'tulema vallamajja tema eest ilma kokkuleppeta', 'ootama, kuni sotsiaaltöötaja ise helistab'],
        ['2. Mida peab toidupanga vabatahtlik laupäevasele vahetusele kindlasti kaasa võtma?', 'jalanõud, mis on eest kinni', 'tõendi varasema kogemuse kohta', 'oma toidukarbid', 'kärud ja kastid'],
        ['3. Mida peab tegema inimene, kes tahab raamatukogu vestlusringis osaleda?', 'end eelnevalt kirja panema', 'maksma osalemistasu', 'tooma kaasa oma sõnaraamatu', 'sooritama enne keeleeksami'],
        ['4. Kes tohib teate järgi kaasava eelarve hääletusel oma hääle anda?', 'iga valla elanik alates neljateistkümnendast eluaastast', 'ainult täiskasvanud kodanikud', 'ainult need, kes on esitanud idee', 'kõik, kes elavad bussipeatuse lähedal'],
        ['5. Mida palub vald kuumahoiatuse ajal naabritel ja lähedastel kõigepealt teha?', 'üksi elavale eakale iga päev helistada', 'aknad päeval lahti hoida', 'päevakeskusesse ise süüa tuua', 'eakad kohe haiglasse viia'],
        ['6. Mis muutub pühade tõttu järgmisel nädalal korteriühistute prügiveos?', 'segaprügi viiakse ära teisel päeval', 'pakendikonteinereid tühjendatakse harvem', 'vana mööbli võib panna konteineri kõrvale', 'prügivedu läheb kallimaks'],
        ['7. Mida võid paluda päästjal teha, kes tuli sinu juurde kodunõustamisele?', 'näidata oma töötõendit', 'tuua kaasa uue ahju', 'maksta anduri eest sularahas', 'kontrollida ka naabri korterit'],
        ['8. Millist toitu ei tohi kaubanduskeskuse ees olevasse toidujagamise kappi panna?', 'kodus tehtud toitu', 'puuvilju ja köögivilju', 'suletud pakendis toitu', 'leiba'],
      ], 'g_listen', 1))), { task: 'L02', harno: 'L1' }),
      'Kuulamine 1 nagu Harno B2 eksamil: iga teade 35–45 sekundit, kuulatakse üks kord, salvestis on lukus. Lase õppijatel enne iga teadet küsimus läbi lugeda (10 sekundit). Vastused on teiste sõnadega kui teates (kinnised jalanõud → jalanõud, mis on eest kinni; vähemalt neljateistaastased → alates neljateistkümnendast eluaastast; kodus valmistatud → kodus tehtud). Varasemast: teated 5, 6 ja 8 kordavad mooduli 13 teemasid.'), [
        'Teade 1: „helistage meile ja leppige kokku aeg koduseks külastuseks”.',
        'Teade 2: „Palume kaasa võtta kinnised jalanõud.”',
        'Teade 3: „palume end eelnevalt kirja panna infoletis või telefoni teel”.',
        'Teade 4: „Hääletada saavad kõik vähemalt neljateistaastased valla elanikud.”',
        'Teade 5: „helistada üksi elavatele eakatele vähemalt kord päevas”. (Varasemast: tund 64.)',
        'Teade 6: „Segaprügi viiakse ära neljapäeva asemel laupäeval.” (Varasemast: tund 61.)',
        'Teade 7: „Päästjal on alati kaasas töötõend, mida võite paluda näha.”',
        'Teade 8: „Kodus valmistatud toitu … kappi panna ei tohi.” (Varasemast: tund 62.)',
      ]),
      why(teach(tag(twice(B.examListen('070_p_talk', 'Kuulamine 2: raadiointervjuu (8 punkti).', 'Loe küsimused läbi. Kuula intervjuud kaks korda. Vali õige vastus. Vastus on teiste sõnadega kui intervjuus.', 'choice', [
        'Sandra: Tere! Täna on stuudios Mati, kes on kaks aastat hoolitsenud oma isa eest, kes elab maal üksi. Mati, kuidas see algas?',
        'Mati: Isa kukkus talvel õues ja murdis käe. Haiglast tuli ta koju, aga ise ta enam puid tuppa tuua ega poes käia ei saanud. Mina elan linnas ja käin tööl, nii et esimesed nädalad sõitsin iga päev pärast tööd tema juurde. See ei olnud kaua võimalik. Ma olin väsinud, tööl tegin vigu ja isa tundis, et ta on mulle koormaks.',
        'Sandra: Kelle poole sa siis pöördusid?',
        'Mati: Helistasin valla sotsiaaltöötajale. Ausalt öeldes kartsin, et nad tahavad isa kohe hooldekodusse saata. Tegelikult oli vastupidi. Sotsiaaltöötaja tuli koju, rääkis isaga tund aega ja küsis, mida ta ise veel teha tahab. Isa tahtis kindlasti oma koju jääda. Ta ütles, et seal on tema aed, tema raamatud ja tema naabrid, ja ma sain aru, et see on talle tähtsam kui mugavus.',
        'Sandra: Mis lahenduse te leidsite?',
        'Mati: Kaks korda nädalas käib nüüd hooldaja, kes toob toidu ja aitab koristada. Isa sai ka häirenupu. Esimesel kuul ta seda kanda ei tahtnud, ütles, et see on vanade inimeste asi. Aga kui ta ühel õhtul jälle libedal trepil kukkus, vajutas ta nupule ja abi tuli poole tunniga. Pärast seda pole ta nuppu kordagi käest võtnud.',
        'Sandra: Kas see kõik on tasuta? Paljud kuulajad küsivad just seda.',
        'Mati: Mitte päris. Isa maksab teenuse eest väikese summa, mis sõltub tema pensionist. Ülejäänu maksab vald. Mulle oli üllatus, kui palju paberitööd on, aga sotsiaaltöötaja aitas ja selgitas iga dokumenti lihtsate sõnadega. Ma pidin vormistama ainult volituse, et saaksin isa eest asju ajada.',
        'Sandra: Mis on olnud kõige raskem? Kas raha või paberid?',
        'Mati: Mitte raha ega paberid, vaid süütunne. Mul oli tunne, et hea poeg peaks kõike ise tegema. Alles hiljem sain aru, et kui ma oleksin end täiesti ära väsitanud, ei oleks sellest kasu olnud kellelegi, ka isale mitte.',
        'Sandra: Mida soovitad kuulajatele, kes on samas olukorras?',
        'Mati: Ära oota, kuni juhtub midagi halba. Helista vallale juba siis, kui märkad, et vanem hakkab vaevaliselt hakkama saama. Ja räägi kõigepealt vanema endaga, mitte tema selja taga. Kui ta tunneb, et otsus on tema oma, võtab ta abi palju kergemini vastu. Minu isa ütleb nüüd naabritele, et häirenupp oli tema enda idee.',
        'Sandra: Aitäh, Mati!',
      ], [
        ['1. Miks hakkas Mati isa ühel talvel kõrvalist abi vajama?', 'pärast õnnetust ei saanud ta igapäevaste töödega enam üksi hakkama', 'ta kolis linna poja juurde', 'ta jäi pensionile', 'tal tekkis probleem rahaga'],
        ['2. Mida kartis Mati kõige rohkem enne valla sotsiaaltöötajale helistamist?', 'et isa saadetakse kodust ära hooldekodusse', 'et vald ei vasta talle', 'et ta peab ise kogu raha maksma', 'et isa ei taha temaga rääkida'],
        ['3. Kuidas toimus Mati sõnul tema isa abivajaduse hindamine?', 'sotsiaaltöötaja rääkis isaga tema kodus', 'isa pidi vallamajas täitma pika ankeedi', 'Mati rääkis sotsiaaltöötajaga telefoni teel', 'arst saatis vallale tõendi'],
        ['4. Mida teeb hooldaja, kes nüüd isa juures regulaarselt käib?', 'käib kaks korda nädalas, toob süüa ja aitab koristada', 'elab isaga koos', 'viib isa iga päev päevakeskusesse', 'tuleb ainult siis, kui isa nupule vajutab'],
        ['5. Miks hakkas isa häirenuppu pidevalt kandma?', 'nupp aitas tal pärast uut kukkumist kiiresti abi saada', 'sotsiaaltöötaja nõudis seda', 'poeg veenis teda kuu aega', 'nupp oli tasuta'],
        ['6. Kes maksab Mati sõnul hooldaja teenuse ja häirenupu eest?', 'isa maksab osa ja ülejäänu maksab vald', 'kõik maksab Mati', 'teenus on täiesti tasuta', 'kõik maksab haigekassa'],
        ['7. Mida pidi Mati paberitöö käigus ise vormistama?', 'dokumendi, mis lubab tal isa nimel asju ajada', 'isa uue elamisloa', 'taotluse hooldekodu kohale', 'lepingu hooldajaga'],
        ['8. Mida tahab Mati öelda oma süütunde kohta? Järelda.', 'abi vastuvõtmine aitab kogu peret, ka hooldajat ennast', 'hea poeg peab kõik ise tegema', 'vald peaks perele süütunde eest maksma', 'isa ei olnud abiga rahul'],
      ], 'g_listen')), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamine 2 (≈ 3 minutit, kaks korda, salvestis lukus). Kõik õiged vastused on ümbersõnastatud (vastuse sõnad ei ole intervjuus sõna-sõnalt: murdis käe → õnnetus; volitus → dokument, mis lubab asju ajada). Küsimus 8 on järeldusküsimus. Varasemast: küsimus 7 (volitus, tund 56). Kontrolli taset: salvestis on pikem kui tundide klipid (v6 G20).'), [
        'Mati: „Isa kukkus … ja murdis käe … ise ta enam puid tuppa tuua ega poes käia ei saanud.”',
        'Mati: „kartsin, et nad tahavad isa kohe hooldekodusse saata”.',
        'Mati: „Sotsiaaltöötaja tuli koju, rääkis isaga tund aega.”',
        'Mati: „Kaks korda nädalas käib nüüd hooldaja, kes toob toidu ja aitab koristada.”',
        'Mati: „kui ta … kukkus, vajutas ta nupule ja abi tuli poole tunniga”.',
        'Mati: „Isa maksab … väikese summa … Ülejäänu maksab vald.”',
        'Mati: „Ma pidin vormistama ainult volituse.” (Varasemast: volitus, tund 56.)',
        'Järeldus: „kui ma oleksin end täiesti ära väsitanud, ei oleks sellest kasu olnud kellelegi”.',
      ]),
      PART('070_t_spart', 'S', { minutes: 25, points: 18, tasks: 2, note: 'Rääkimine 1 (6 punkti): kolm rida 0–2 — samad tingimused nagu mooduli külmas alguses (tund 66). Rääkimine 2 (12 punkti): analüütiline juhend, neli kriteeriumi 0–3. Kontrolli tulemus: kuulamine … / 16 + rääkimine … / 18 = … / 34.' }),
      teach(tag(inLesson(B.speaking('070_t_cold', 'Rääkimine 1: arvamus ühe minutiga (6 punkti).', 'Väide: „Kodutänava ohutuse ja korra eest peaksid hoolitsema eelkõige elanikud ise, mitte vald.” Mõtle 1 minut. Räägi 1 minut: seisukoht, põhjus, näide, vastuargument.', [
        'Kas oled väitega nõus? Miks?',
        'Too üks näide oma kodukohast või mõnest teisest riigist.',
        'Mida ütleks keegi, kes arvab teisiti?',
      ], [60, 90], '', 'g_use')), { task: 'S11', harno: 'S1', fluency: true }),
      'Mooduli paralleelne lõpuülesanne: samad tingimused nagu mooduli külmas alguses tunnis b1b2-066 (1 minut mõtlemiseks, 1 minut rääkimiseks, fraase ega algust ei ole) ja sama väite tüüp („kes vastutab: inimesed ise või vald”), uus teema samast moodulist (kodukoht, tund 69). Hinda kolme rea järgi 0–2 (hindamine all). Võrdle külma alguse märkmetega: ütle õppijale üks konkreetne areng ja üks järgmine samm.'),
      keepPlace(B.rubric('070_t_rubric', 'Hindamine: rääkimine 1 (6 punkti).', 'Iga rida 0–2 punkti.', ['Seisukoht esimeses lauses, põhjus ja näide (0–2).', 'Vastuargument ja vastus sellele (0–2).', 'Keel: sidendid (kuigi …, siiski; seetõttu; samas) ja mooduli vormid (üksi elav, käin aitamas, nõuab, et …, paigaldataks) (0–2).'])),
      B.planning('070_t_prep', 'Rääkimine 2: ettevalmistus (1 minut).', 'Loe oma kaarti. Kirjuta märksõnadega kaks argumenti ja üks näide. Punkte selle eest ei anta.', ['Minu seisukoht:', 'Argumendid ja näide:', 'Mida ma võin partnerile järele anda (tingimusel, et …)?'], 2),
      teach(tag(B.rolecards('070_t_debate', 'Rääkimine 2: arutelu argumendikaartidega (4 minutit, 12 punkti).', 'Lugege oma kaarti. Öelge alguses oma seisukoht. Arutage 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A. Teema: kas vald peaks maksma vabatahtlikele päästjatele iga väljakutse eest väikest tasu? Sina oled pigem poolt: vabatahtlikud annavad oma aega ja und; tasu aitaks leida uusi liikmeid; maal jõuavad nad sageli kohale enne kutselisi. Lisa üks oma näide.',
        'Kaart B. Sina oled pigem vastu: vabatahtlik töö on väärtuslik just seetõttu, et selle eest ei maksta; valla raha kuluks parem varustusele ja koolitusele; tasu võib tekitada tüli, kes saab ja kes mitte. Lisa üks oma näide.',
        ['Minu arvates peaks …, sest …', 'Ma saan aru, mida sa mõtled, aga …', 'Kas me võiksime kokku leppida, et …?'],
        ['Ma ei ole päris nõus, sest …', 'Näiteks …', 'Olgu, aga ainult tingimusel, et …']), { task: 'S17', harno: 'S2' }),
      'Arutelu 4 minutit (paaris; üks-ühele oled sina partner). Varjatud info (ütle teise minuti lõpus): „Vallal on järgmiseks aastaks raha kas uueks päästeautoks või tasuks vabatahtlikele, mitte mõlemaks.” Õppijad peavad sellele reageerima ja jõudma ühise seisukohani (näiteks: auto nüüd, tasu asemel koolitus ja tunnustus). Hinda all oleva juhendiga (4 × 0–3).'),
      keepPlace(teach({ ...B.rubricSpeaking('070_t_srubric', 'Hindamine: rääkimine 2 (12 punkti).'), goal: 'g_use', data: { ...B.rubricSpeaking('070_t_srubric').data, title: 'Hindamine: rääkimine 2 (12 punkti).', instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12.', criteria: SPEAKING_14.map(([name, hint]) => ({ name, max: 3, hint })) } },
        'Hinda arutelu nelja kriteeriumi järgi (0–3). Piiripealne näidis (≈ 7/12): õppija ütleb seisukoha ja ühe põhjuse, aga ei reageeri partneri argumendile ega uuele infole (ülesanne 1), räägib pausidega (2), sõnavara on piisav (2), vead ei takista (2). Mooduli keel on grammatika kriteeriumi osa: kesksõnad (vabatahtlik päästja, väljakutse eest makstav tasu), ma-tegevusnimi (käivad kustutamas), et + tingiv (nõuab, et vald maksaks), umbisikuline tingiv (raha kulutataks). Kontrolli tulemus = kuulamine … / 16 + rääkimine 1 … / 6 + rääkimine 2 … / 12.')),
    ],
  },
}), {
  'b1b2-066': 'RÄÄK R→S', 'b1b2-067': 'LUGU L→S', 'b1b2-068': 'LUGE R→W', 'b1b2-069': 'KIRJ L→W', 'b1b2-070': 'EKS',
}));

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js). Since v6 the explanations travel with each block (why(block, lines)); this map is empty and
// kept for courseSheet.js withExplanations.
export const EXPLAIN = {};
