// B2 course (B1 → B2 roadmap), module 14 „Ühiskond ja avalikud teenused” (b1b2-066…070), stage B2- (homework 160–200
// words, the B2 opener and article lengths, the official register: impersonal, verb government, modality, conditional).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–13. Module goal (the learner): „Ma oskan avalikes teenustes ja kohalikus elus ise hakkama saada:
// leian õige abi, osalen kogukonnas, tean oma kohustusi ja võimalusi ning teen vallale põhjendatud ettepaneku”; module
// product „Minu kodukoha teejuht” (069 Kasuta, the S1 one-minute talk in 070). Society from the learner's own angle: where
// he turns when an old parent can no longer cope alone, two hours of volunteering a week, what the citizenship law asks
// of him or his family, and a proposal to his own municipality. Real facts with sources on every page; politics neutral — the learner
// gives an opinion only on practical questions (roadmap „attention”: everyday civic life, not a political quarrel).
// Not repeated from earlier modules: where to turn in town, 1220 and the doctor's appointment (module 2), pharmacist vs
// internet and the 1220 call (module 9), retraining and Töötukassa (module 7), the e-state services (module 12), the
// clean-up day and food waste (module 13).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 14).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   066 quest    „Ema ei saa enam üksi hakkama: mida vald pakub?”                            family     final explain: meeting the social worker
//   067 infogap  „Kaks tundi nädalas: kas vabatahtlik töö sobiks sulle?”                     freetime   final decide: card A ↔ card B, own choice
//   068 case     „Kodakondsus: mida seadus nõuab — ja mida mitte?”                           languages  final advise: the counsellor's advice
//   069 project  „Pime tee bussipeatusse: kuidas teha vallale ettepanek, millele vastatakse?” town       final present: the pitch + „Minu kodukoha teejuht”
//   070 exam     Kontroll 14 in Harno B2 form + „Minu kodukoha teejuht” as the S1 one-minute talk.
// Grammar line of the roadmap (B2, docs/METHODOLOGY_STANDARD.md §5) by discovery and spiralled: the impersonal of official
// texts — present -takse / -dakse, past -ti / -di, perfect on -tud, negation ei -ta, total object in the nominative
// (066; back in 068's rules, 069's letter and 070); verb government of civic verbs — osalema milles, liituma millega,
// panustama millesse, huvituma millest, sõltuma millest, vastutama mille eest, pöörduma kelle poole (067; back in 068, 069,
// 070); obligation, permission and prohibition — peab, tuleb, on kohustatud, ei pea, ei tohi, võib, on vabastatud — and
// participles in rules (nõutud, sooritatud, kehtestatud) (068, the step above module 1's modal verbs; back in 069 and 070);
// the conditional of a proposal — maksaks, väheneks, riskiks oleks, the impersonal conditional paigaldataks (069; back in
// 070). The one long text of the module is the topic opener (066 station 2, ≈ 340 words, after a 15-minute hook and
// pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js and the archetype set (RÄÄK R→S, KIRJ L→W, LUGE R→W, PROJ L→S, EKS;
// 067 and 069 swapped, 068 and 069 swapped); exactly one exam corner a lesson (V12), never the same family twice in a row:
// R1 (066), W1 (067, the letter written at home: the radio as L3 took 27 % of the lesson), R2b (068), S1 (069). The
// voting-rights fact (069) is a „Mäletad” bridge to B1 module 15 (073). A first 066 on „112, 1220 or the family doctor”
// repeated modules 2 and 9 (av-fact-dup) and was replaced by the municipality's social services. The v2 storyline version
// (Viktor's closed doctor's office, Olena's course support, Pärna 12 and Igor, the Nõmme commission) is in git history
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

export const LESSONS = withShapes({
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
}, {
  'b1b2-066': 'RÄÄK R→S', 'b1b2-067': 'KIRJ L→W', 'b1b2-068': 'LUGE R→W', 'b1b2-069': 'PROJ L→S', 'b1b2-070': 'EKS',
});


// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
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
