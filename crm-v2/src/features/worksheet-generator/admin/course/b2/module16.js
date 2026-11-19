// B2 course (B1 → B2 roadmap), module 16 „B2 grammatika integratsioon” (b1b2-076…080), stage B2- (roadmap levelStage;
// homework 160–200 words, the opener and the mock's article at B2 length, the grammar of the whole B2 line in use).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–13. The grammar module is not a month of rules (roadmap „attention”): every lesson is a real task
// with a product, the form is noticed in the input and then needed for the product. Module goal (the learner): „Ma kasutan
// keerukamat eesti keelt päris olukordades: kirjutan, miks peaks valima just mind, jutustan oma loo nii, et seda
// kuulatakse, kirjeldan ja juhendan lühidalt ning annan täpselt edasi, mida teised ütlesid”; module product „Minu B2
// tekstimapp” — the four texts of the module with one improved sentence each (079 Kasuta, the S1 one-minute talk in 080).
// One lesson, one real task of the learner's life (a learner without children, a flat or a pool gets a real alternative):
//   076 case     „Kaks tuba, nelikümmend huvilist: miks peaks omanik valima just sinu?”  home      final negotiate: the owner calls back (S04)
//   077 game     „Minu esimene kord Eestis: lugu, mida raadio tahab kuulda”             culture   final present: the radio story contest (S16)
//   078 infogap  „Esimest korda ujulas: mida reeglileht tegelikult ütleb?”              health    final advise: a friend's first visit (S05)
//   079 facts    „Mida koosolekul tegelikult öeldi? Kuulujutt, fakt ja viisakas palve”  family    final explain: tell the neighbour (S16) + „Minu B2 tekstimapp”
//   080 exam     Vahehindamine 4 — the full Harno B2 mock (L1–L4, R1, R2a, R2b, R3, R4, W1, W2a, S1, S2) on lessons 61–80,
//                with „Minu B2 tekstimapp” as the S1 talk.
// Grammar line of the roadmap kept lesson by lesson (docs/METHODOLOGY_STANDARD.md §5, grammarPlan 'complex-sentences' 076 +
// 077, 'nonfinite' 078, 'moods' 079), by discovery and spiralled: complex sentences and connectors — kuigi, ehkki, samal
// ajal kui, juhul kui, seetõttu, mistõttu, the verb right after seetõttu and after a fronted clause (076: a letter to a
// landlord, back in 077's story, 079's summary and 080); word order — verb second after a fronted time or place, the main
// clause after a subordinate one starts with the verb, emphasis at the start and new information at the end (077: a story
// for a radio contest, back in 078's review and 080); participles -v / -tav / -nud / -tud and the des-form in rules and
// descriptions (078: a pool's house rules and reviews, back in 079's product and 080); mood by function — the source
// (direktori sõnul), the quotative -vat for an unchecked claim, the impersonal for decisions, the conditional for a polite
// request (079: a parents' meeting, a rumour and a request; back in 080). Threads back: module 13's cause nouns and
// concession, module 15's fact / opinion / source (079). The one long text of the module's lessons is the topic opener
// (077 station 2, ≈ 320 words, after a 15-minute hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js (077 without g_listen: its recording trains g_read, as in modules 10
// and 13) and the archetypes of the plan's set {PROJ L→S, KIRJ L→W, RÄÄK R→S, LUGE R→W} in a new order (the letter
// first: KIRJ L→W, RÄÄK R→S, LUGE R→W, PROJ L→S; V5 still holds); exactly one exam corner a lesson (V12), the families the old module gave the course (V6): S2 (076,
// the owner's call), L3 (077, the winner's story), R3 (078, the participle gaps), L4 (079, the meeting). The v2 storyline version
// (Sofia's report on the Ülenurme warehouse, Kohvik Mets, Oskar's rye-bread story) is in git history before 2026-11-19.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 16. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud loo.';

export const MODULE = { id: 'b1b2-module-16', course: 'b2', title: 'B2 grammatika integratsioon', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });
// L1 as on the exam: every short clip is its own recording (tools/listening-audio, `questions[i].script`, one play
// button a clip); the block's transcript stays the whole text the teacher reads
const perClip = (block) => {
  const clips = String(block.data.transcript).split('\n').map((line) => line.replace(/^[^:]{1,20}:\s*/, '').trim()).filter(Boolean);
  return { ...block, data: { ...block.data, questions: block.data.questions.map((q, i) => ({ ...q, script: clips[i] })) } };
};

export const LESSONS = withShapes({
  'b1b2-076': {
    title: 'Kaks tuba, nelikümmend huvilist: miks peaks omanik valima just sinu?',
    phases: grammar('Keel: liitlause ja sidendid — kuigi, ehkki, samal ajal kui, juhul kui, seetõttu, mistõttu; tegusõna kohe pärast seetõttu ja pärast kõrvallauset'),
    format: 'case',
    topic: 'home',
    canDo: 'Ma kirjutan korteri omanikule 160–200-sõnalise tutvustava kirja, miks sobin üürnikuks, ja lepin telefonis tingimused kokku; seon põhjuse, vastanduse, tingimuse, aja ja tagajärje vähemalt kuue sidendiga (kuigi, ehkki, samal ajal kui, juhul kui, seetõttu, mistõttu).',
    teacherPage: {
      goal: 'Кейс: 40 желающих на одну квартиру. Радиосовет маклера, связки (kuigi, juhul kui, seetõttu …), выбор сильной фразы, звонок хозяйки и договорённость; письмо W1 — дома.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 2 — радио один раз, 4 пропуска из 7; станция 3 — правило и 4 строки; станция 4 — три пары фраз из шести и звонок хозяйки только с одним сомнением.',
      hook: '«Объявление: двухкомнатная квартира, 520 евро, свободна с марта. Хозяйка просит: „Напишите пару предложений о себе”. За первый день ей написали 40 человек. Какое твоё первое предложение?» Ученик отвечает сразу, вы — после него. «Я бы написал только „Квартира ещё свободна?”» — тоже честный ответ: радио на станции 2 объяснит, почему так не работает.',
      plan: [
        '0–3: крючок — первое предложение письма хозяйке, ученик отвечает сразу',
        '3–10: станция 1 — разговор: как я нашёл своё жильё, что для меня важно, как ищут жильё там, где я вырос',
        '10–25: станция 2 — слова (2 мин), радиосовет маклера дважды, 7 пропусков (L3b); «Kas teadsid?» о рынке аренды 2026',
        '25–37: станция 3 — заметить в радио kuigi / juhul kui / seetõttu → правило → 7 пар предложений соединить связкой',
        '37–52: станция 4 — шесть пар начала письма: какую фразу хозяйка запомнит; хозяйка звонит — договориться о просмотре и двух условиях',
        '52–64: «Kui aega jääb» — игра «три объявления, один выбор»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо хозяйке 160–200 слов (W1), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио (тексты свои, маклер Тийна Оя — учебная): ERR, «Tudengitele sobivaid kortereid on turul vähem ja üürihinnad kõrgemad» (август 2026): предложение квартир примерно на 7 % меньше, чем в 2025 г., при том же спросе (Karl-Villiam Vaserik, Uus Maa), одно- или двухкомнатная квартира 400–650 € в месяц, в общежитии TalTech 150 студентов в очереди. Советы о письме (кто ты, почему эта квартира, честно о собаке и ребёнке) — общая практика, не закон; о залоге и договоре этот урок не говорит (это было в модуле 4).',
      groups: 'Станция 1 — в парах. Радио — каждый сам, сверка в паре. Станция 4: фразы — каждый сам, потом спорим, почему; звонок: один — арендатор, второй — хозяйка с вашей карточкой, потом смена. В 1:1 хозяйка — вы.',
      errors: [
        '«Kuigi mul on koer, aga ta on vaikne» → «Kuigi mul on koer, on ta vaikne» (после kuigi-предложения нет aga; главное предложение начинается с глагола).',
        '«Seetõttu ma otsin uut kodu» → «Seetõttu otsin ma uut kodu» (после seetõttu, seega глагол сразу вторым).',
        '«Juhul kui te soovite, ma saadan …» → «Juhul kui soovite, saadan …» (после придаточного — сначала глагол).',
        '«Samal ajal, kui …» — запятая не нужна внутри связки: «samal ajal kui» пишется без запятой, запятая — перед всей связкой.',
      ],
      notes: [
        'Формат — кейс: реальный рынок аренды, реальная задача. Никто не обязан рассказывать о своих доходах: «у меня стабильная работа» можно сказать о выдуманной ситуации. Студенту — комната или общежитие; пенсионеру — переезд ближе к детям; маме — квартира рядом со школой или садиком; уставшему после смены — «как написать коротко и чтобы ответили».',
        'Обратная связь, 2–3 цели: глагол сразу после seetõttu и после придаточного; нет aga после kuigi / ehkki; связка по смыслу (juhul kui — условие, samal ajal kui — время и контраст, mistõttu — следствие).',
      ],
    },
    discover: [
      station(B.text('076_d_hook', 'Kirjuta omanikule', 'Kuulutus: kahetoaline korter, 520 eurot kuus, vaba märtsist. Omanik palub: „Kirjutage paar lauset endast.” Esimese päevaga kirjutas talle 40 huvilist. Mis on sinu esimene lause? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('076_d_talk', 'Kodu otsimine minu elus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kuidas sa oma praeguse kodu leidsid?',
        'Mis on sulle kodu valides kõige tähtsam?',
        'Kuidas otsitakse korterit seal, kus sa üles kasvasid?',
      ], [150, 210], ['Leidsin oma kodu …', 'Mulle sobib kodu, kus …, sest …', 'Seal, kus ma üles kasvasin, …']), 'Sinu enda kogemus on kirja esimene materjal.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise, kuidas sa kodu leidsid. Ära küsi palka ega üüri suurust. Lõpus ütle üks sõna, mida õpilane vajas (üürima, kuulutus, üürileandja).')),
      station(tag(B.vocab('076_d_vocab', 'Enne kuulamist: sõnad.', ['üürima — снимать (жильё)', 'üürileandja — арендодатель', 'üürnik — квартиросъёмщик', 'kuulutus — объявление', 'sobima — подходить', 'usaldusväärne — надёжный', 'tutvustama — представлять', 'tingimus — условие', 'kuigi — хотя', 'juhul kui — в случае если']), { topic: ['üürnik', 'üürileandja'] }), 2, 15),
      teach(tag(purpose(B.listening('076_d_radio', 'Raadionõuanne: kuidas kirjutada üürileandjale.', 'Enne kuulamist arva, mis lünka tuleb. Kuula kaks korda ja kirjuta igasse lünka 1–2 sõna.', [
        'Saatejuht: Hea üürikorteri leidmine on jälle raskem. Stuudios on kinnisvaramaakler Tiina Oja. Tiina, mis turul toimub?',
        'Tiina: Tänavu on üürikortereid pakkumisel umbes seitse protsenti vähem kui eelmisel aastal, kuid huvilisi on sama palju. Seetõttu saab hea kuulutus juba esimesel päeval kümneid kirju. Ühe- või kahetoaline korter maksab suuremates linnades tavaliselt nelisada kuni kuussada viiskümmend eurot kuus.',
        'Saatejuht: Mida omanik kirjast otsib?',
        'Tiina: Kolme asja: kes sa oled, miks sa just seda korterit tahad ja kas sinuga on lihtne. Kuigi kiri peab olema lühike, ei tohi see olla ainult „Tere, kas korter on veel vaba?”. Sellisele kirjale omanik tavaliselt ei vastagi.',
        'Saatejuht: Aga kui mul on koer või väike laps?',
        'Tiina: Ütle see kohe ausalt ja lisa lahendus. Näiteks: koer on täiskasvanud ja harjunud korteris elama. Juhul kui omanik soovib, võib lepingusse lisada tingimuse. Ehkki see võib mõne omaniku eemale peletada, säästab ausus mõlema aega.',
        'Saatejuht: Ja viimane nõuanne?',
        'Tiina: Kirjuta nagu inimene, mitte nagu ankeet. Seo laused kokku: mitte „Ma töötan. Mul on palk. Ma olen rahulik.”, vaid „Kuna töötan kolmandat aastat samas kohas, on mu sissetulek kindel.” Samal ajal kui teised saadavad ühe rea, saadad sina pildi endast.',
      ], [
        'Tiina sõnul on tänavu üürikortereid pakkumisel umbes [seitse|7] protsenti vähem kui mullu.',
        'Ühe- või kahetoaline korter maksab tavaliselt nelisada kuni [kuussada viiskümmend|650] eurot kuus.',
        'Omanik tahab kirjast teada, kes sa oled, miks just see korter ja kas sinuga on [lihtne].',
        'Kirjale „Kas korter on veel vaba?” omanik Tiina sõnul tavaliselt [ei vastagi|ei vasta].',
        'Koerast või väikesest lapsest tuleb omanikule kirjutada kohe [ausalt].',
        'Kui oled kohe aus, säästad Tiina sõnul mõlema [aega].',
        'Tiina soovitab kirjutada nagu inimene, mitte nagu [ankeet].',
      ], 'g_read'), 'Kuuled, mida omanik kirjast päriselt otsib — see on sinu kirja plaan.'), { voice: 'interview', task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos pliiatsiga; 2) esimene kuulamine — „Mis on Tiina kolm küsimust?”; 3) teine — lüngad; 4) „Milline nõuanne on sinu jaoks uus?” Kui õpilasel ei ole koera ega last, küsi: „Mis võiks omanikku sinu puhul muretsema panna?” (töö öösel, õppimine, kolimine sügisel).'),
      B.know('076_d_know', ['2026. aasta augustis oli üliõpilastele sobivaid üürikortereid pakkumisel umbes seitse protsenti vähem kui aasta varem, kuigi huvilisi oli sama palju. Ühe- või kahetoaline korter maksis 400–650 eurot kuus. Tallinna Tehnikaülikooli ühiselamu kohta ootas järjekorras 150 tudengit, kuigi varasematel aastatel järjekorda praktiliselt ei olnud.'], 'ERR, „Tudengitele sobivaid kortereid on turul vähem ja üürihinnad kõrgemad” (august 2026)', 'Kas teadsid? Üüriturg 2026'),
    ],
    practice: [
      station(B.notice('076_p_notice', 'Märka: kuigi kiri peab olema lühike, ei tohi …', [
        'Raadiost: **Kuigi** kiri peab olema lühike, **ei tohi** see olla ainult üks rida · **Seetõttu saab** hea kuulutus kümneid kirju · **Juhul kui** omanik soovib, võib lisada tingimuse · **Samal ajal kui** teised saadavad ühe rea, **saadad** sina pildi endast',
        '**Vastandus**: **kuigi / ehkki** + kõrvallause (ehkki on kirjalikum) — pärast seda ei tule sõna „aga”. **Põhjus**: **kuna** lause alguses, **sest** pärast pealauset.',
        '**Tingimus**: **juhul kui** on täpsem ja ametlikum kui „kui”: **Juhul kui** maja on vaikne, sobib see ka öösel töötajale.',
        '**Aeg ja vastandus korraga**: **samal ajal kui**: Samal ajal kui linnas on kõik kallis, on äärelinnas korterid odavamad.',
        '**Tagajärg**: **seetõttu / seega** + kohe tegusõna: Seetõttu **on** mul kiire. · **…, mistõttu** + kõrvallause samas lauses: Korter on kesklinnas, mistõttu auto pole vajalik.',
        '**Sõnajärg**: kui kõrvallause on ees, algab pealause tegusõnaga: Kuigi korter on väike, **on** see valge ja vaikne.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('076_p_link', 'Kirja laused kokku.', 'Ühenda kaks lauset antud sidendiga. Alusta antud sõnadega ja pane tegusõna õigele kohale.', [
        ['Mul on väike koer. Ta on vaikne ja harjunud korteris elama.', 'Kuigi …', 'Kuigi mul on väike koer, on ta vaikne ja harjunud korteris elama.'],
        ['Töötan samas kohas kolmandat aastat. Minu sissetulek on kindel.', 'Kuna …', 'Kuna töötan samas kohas kolmandat aastat, on minu sissetulek kindel.|Kuna ma töötan samas kohas kolmandat aastat, on mu sissetulek kindel.'],
        ['Te soovite soovitust. Ma saadan eelmise omaniku telefoninumbri.', 'Juhul kui …', 'Juhul kui soovite soovitust, saadan eelmise omaniku telefoninumbri.|Juhul kui te soovite soovitust, saadan eelmise omaniku telefoninumbri.'],
        ['Praegune korter müüakse maha. Ma otsin uut kodu.', 'Praegune korter …, mistõttu …', 'Praegune korter müüakse maha, mistõttu ma otsin uut kodu.|Praegune korter müüakse maha, mistõttu otsin ma uut kodu.'],
        ['Mu laps käib lähedal koolis. See asukoht sobib meile hästi.', 'Mu laps käib lähedal koolis. Seetõttu …', 'Mu laps käib lähedal koolis. Seetõttu sobib see asukoht meile hästi.|Mu laps käib lähedal koolis. Seetõttu sobib meile see asukoht hästi.'],
        ['Otsin korterit. Samal ajal elan ajutiselt sõbra juures.', 'Samal ajal kui …', 'Samal ajal kui otsin korterit, elan ajutiselt sõbra juures.|Samal ajal kui ma otsin korterit, elan ajutiselt sõbra juures.'],
        ['Majas ei ole lifti. Teine korrus sobib ka minu emale.', 'Ehkki …', 'Ehkki majas ei ole lifti, sobib teine korrus ka minu emale.|Ehkki majas lifti ei ole, sobib teine korrus ka minu emale.'],
      ], 'full', 'g_notice'), 'Seotud laused näitavad omanikule mõtlevat inimest, mitte ankeeti.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Mis seos siin on: vastandus, põhjus, tingimus, aeg või tagajärg? Kus on tegusõna?” Ridadel 1, 3, 6 ja 7 algab pealause tegusõnaga; real 5 tuleb tegusõna kohe pärast seetõttu. Lisaküsimus: „Kirjuta üks lause oma kirja jaoks sõnaga juhul kui.”'),
    ],
    transfer: [
      station(teach(tag(purpose(B.cloze('076_t_draft', 'Kirja mustand: vali sidend.', 'See on ühe üürniku kiri omanikule. Vali igasse lünka sidend, mis teeb mõtte selgeks.', 'Kiri omanikule', [
        'Tere, proua Tamm!',
        'Kirjutan teile kuulutuse pärast, {*kuna|kuigi|samal ajal kui|juhul kui} otsin kodu endale ja oma pojale. Töötan meditsiiniõena lähedal haiglas, {*mistõttu|kuigi|ehkki|juhul kui} sobib teie korteri asukoht meile väga hästi.',
        'Mul on üks väike koer. {*Kuigi|Kuna|Seetõttu|Juhul kui} ta on alles kolmeaastane, on ta rahulik ja harjunud korteris elama. {*Juhul kui|Kuigi|Mistõttu|Samal ajal kui} soovite, võite temaga enne tutvuda.',
        '{*Samal ajal kui|Seetõttu|Kuigi|Mistõttu} otsin uut kodu, elan ajutiselt õe juures. {*Seetõttu|Kuigi|Ehkki|Juhul kui} saaksin kolida juba märtsi alguses.',
        '{*Ehkki|Kuna|Seetõttu|Mistõttu} mul ei ole eelmise üürileandja soovitust paberil, võin anda teile tema telefoninumbri. Oleksin tänulik, kui saaksin korterit sel nädalal vaadata.',
        'Lugupidamisega\nSvetlana Petrova',
      ].join('\n\n'), 'g_read'), 'Mustand näitab, kuidas üks sidend muudab kirja selgeks — ja annab sulle kodutöö näidise.'), { task: 'R03' }),
      'Nagu eksami lugemise osas 3 (seal 12 lünka ja neli valikut): õpilane loeb kõigepealt terve lause ja ütleb, mis seos on vaja: põhjus, vastandus, tingimus, aeg või tagajärg. Pärast küsi: „Mis teeb Svetlana kirjast hea kirja?” (kes ta on, miks see korter, aus koera kohta, pakkumine, viisakas palve). Kasuta 5 minutit, siis kõne.'), 4, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('076_t_call', 'Omanik helistab: leppige tingimused kokku.', 'Omanik luges sinu kirja ja helistab. Tal on kaks kahtlust. Lepi temaga kokku, millal sa korterit vaatad ja millistel tingimustel üürid.',
        'Olukord: sa kirjutasid omanikule, ta helistab tagasi; tal on veel kümme huvilist.\nSinu eesmärk: lepi kokku vaatamise aeg ja kaks tingimust, mis sobivad mõlemale.\nPiirang: ole aus ja seo laused sidenditega (kuigi, juhul kui, seetõttu).',
        'Omaniku kaart on õpetajal: tema kahtlused ja üks pakkumine.',
        ['Kuigi …, …', 'Juhul kui teile sobib, …', 'Seetõttu …', 'Samal ajal kui …', 'Kas me võiksime kokku leppida, et …?'], ['Mul on üks kahtlus: …', 'Mis saab siis, kui …?', 'Olgu, ma olen nõus, kui …']), 'Tulemus: sul on vaatamise aeg ja kaks tingimust, millega oled sina ja omanik rahul.'), { task: 'S04', level: 4, harno: 'S2' }),
      'Eksaminurk (S2): eksamil jõuab paar olukorras ühise lahenduseni ja reageerib teise mõttele. Õpetaja kaart (omanik, 62, elab samas majas). Kahtlused ükshaaval: 1) „Te kirjutasite, et võib-olla kolite sügisel. Ma tahaksin vähemalt aastast lepingut.” 2) „Eelmine üürnik jättis nõud ja prahi maha. Kuidas ma tean, et teiega nii ei juhtu?” 3) Vaatamine sobib ainult homme kell 12 (õpilane on tööl — ta peab pakkuma teise aja). Pakkumine, kui õpilane küsib: „Kui toote kaasa eelmise omaniku kontakti, võime lepingu kohe sõlmida.” Õnnestunud, kui õpilane vastab mõlemale kahtlusele sidendiga (kuigi …, juhul kui …), pakub oma aja ja te lepite kokku kaks tingimust.'),
      extension(teach(tag(purpose(B.speaking('076_t_more', 'Mäng: kolm kuulutust, üks valik', 'Õpetaja loeb ette kolm kuulutust. Vali üks ja põhjenda sidenditega, miks just see ja millise tingimusega oleksid nõus.', [
        'Millise korteri valid ja miks?',
        'Mis on iga korteri suurim puudus?',
        'Millise tingimusega oleksid nõus kallima korteriga?',
      ], [120, 180], ['Kuigi … on odavam, …', 'Juhul kui …, valin …', 'Samal ajal kui …', 'Seetõttu …']), 'Mäng näitab, kuidas sidendid aitavad otsust selgelt põhjendada.'), { task: 'S12', level: 4 }),
      'Kui aega jääb (12 min). Loe ette: A) 480 eurot, üks tuba kesklinnas, 4. korrus ilma liftita; B) 560 eurot, kaks tuba, bussiga 25 minutit kesklinna, lemmikloomad lubatud; C) 450 eurot, kaks tuba, remont pooleli, omanik elab kõrval. Pärast valikut esita üks vastuväide („Aga lift?”, „Aga buss hommikul?”). Punkt iga sidendi eest, mis on õige ja õige sõnajärjega.'), 12),
      tag(exitCheck(purpose(B.gaps('076_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna.', [
        'Kuigi korter oli väike ja üür üsna kõrge, [meeldis] see üürnikule kohe. (meeldima, minevik)',
        'Juhul [kui] soovite, saadan teile oma tööandja ja eelmise üürileandja soovituse.',
        'Minu töökoht on maja lähedal. [Seetõttu|Seega] ei vaja ma usaldusväärse üürnikuna autokohta.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas sidendid ja sõnajärg on käes.')), {}),
      purpose(B.selfcheck('076_t_self', ['Ma räägin, kuidas ma kodu otsin või leidsin.', 'Ma saan raadionõuandest aru, mida üürileandja kirjast otsib.', 'Ma seon laused sidenditega: kuigi, ehkki, samal ajal kui, juhul kui, seetõttu, mistõttu.', 'Ma lepin telefonis tingimused kokku nii, et need sobivad mõlemale.'], 'Kiri plaanitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('076_t_letter', 'Kodus: kiri korteri omanikule.', 'Kirjuta kodus omanikule 160–200 sõna: kes sa oled, miks just see korter, mis võib omanikku muretsema panna, sinu lahendus ja palve korterit vaadata. Kasuta vähemalt kuut sidendit.', 'Tere, …!', 'Lugupidamisega\n(sinu nimi), telefon …', [160, 200]), 'Omanik näeb sinu kirjast inimest, kellega on lihtne kokku leppida.')), { task: 'W13', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('076_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: milline on sinu unistuste kodu ja millise tingimusega oleksid nõus vähemaga.', [
        'Mis peab sinu kodus kindlasti olema ja miks?',
        'Millest oleksid nõus loobuma, juhul kui hind on parem?',
      ], [60, 120]), 'Õpetaja kuulab, kas sidendid ja tegusõna koht on õiged.')), { task: 'S15' }),
      homework('076_t_homework', ['1. Kiri omanikule, 160–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-077': {
    title: 'Minu esimene kord Eestis: lugu, mida raadio tahab kuulda',
    phases: grammar('Keel: sõnajärg — tegusõna teisel kohal (Siis nägin ma …), pealause pärast kõrvallauset (Kui ma sauna astusin, oli …), rõhk lause alguses (Alles hiljem sain ma aru …)'),
    format: 'game',
    topic: 'culture',
    canDo: 'Ma loen teksti Eesti tavadest, mis uustulnukaid üllatavad, ja jutustan raadio lugude võistlusel 1–2 minutit oma esimesest korrast (saunas, jaanipäeval, laulupeol või mujal) nii, et tegusõna on õigel kohal ja tähtis info on lause alguses või lõpus.',
    teacherPage: {
      goal: 'Игра: соревнование историй с учителем. Текст темы о том, что удивляет новичков в Эстонии (R1), порядок слов и акцент, рассказ на радиоконкурс 1–2 минуты.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: игра «правда или выдумка» и 1 вопрос; станция 2 — только 4 вопроса, текст дома; станция 3 — правило и 4 строки; станция 4 — запись один раз и рассказ 1 минута без жюри.',
      hook: 'Расскажите две короткие истории о своём «первом разе» (в Эстонии или в другой стране): одна правда, другая выдумка. Ученик задаёт два вопроса и угадывает. Если угадал — очко ученику, если нет — вам. Затем его очередь: «Что тебя удивило в Эстонии в первый раз?» Счёт ведите до конца урока.',
      plan: [
        '0–5: крючок — две истории учителя, правда или выдумка, первое очко',
        '5–15: станция 1 — разговор: что удивило меня в Эстонии, где и когда это было, что я понял',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 7 вопросам, текст темы «Esimest korda Eestis: mis üllatab?», проверка прогноза (R1)',
        '30–42: станция 3 — заметить в тексте порядок слов → правило → 7 предложений истории с ошибкой порядка слов исправить',
        '42–57: станция 4 — история прошлогоднего победителя (6 пропусков, L3), затем рассказ ученика на радиоконкурс, вы — жюри, потом наоборот',
        '57–69: «Kui aega jääb» — дебаты по карточкам: привыкать к местным обычаям или сохранять свои',
        '69–76: проверка на выходе, «Ma oskan …», итог игры',
        '76–83: домашнее задание: история 180–200 слов на сайт конкурса, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст темы (свой): UNESCO, «Smoke sauna tradition in Võromaa» — в списке нематериального наследия с 2014 г. (9.COM); традиция праздников песни и танца стран Балтии — шедевр нематериального наследия UNESCO с 2003 г. (в списке с 2008 г.); праздник песни и танца «Iseoma» прошёл 3–6 июля 2025 г. в Таллинне (Laulu- ja Tantsupeo SA); 23 июня — Võidupüha, государственный праздник и выходной (Pühade ja tähtpäevade seadus). Прыжки через костёр «на счастье и здоровье» — народный обычай. Рассказ победителя (Ольга) — учебный.',
      groups: 'Станция 1 — в парах. Текст — каждый сам, сверка в паре. Станция 4: каждый рассказывает свою историю, остальные — жюри с карточкой оценки (3 очка: порядок слов, акцент, конец истории). В 1:1 вы рассказываете свою историю тоже, ученик — жюри.',
      errors: [
        '«Siis ma nägin …» → «Siis nägin ma …» (после обстоятельства в начале глагол вторым).',
        '«Kui ma astusin saunast välja, kõik naabrid seisid aias» → «Kui ma saunast välja astusin, seisid kõik naabrid aias» (в придаточном глагол ближе к концу; главное — с глагола).',
        '«Alles hiljem ma sain aru» → «Alles hiljem sain ma aru» (выделенное слово в начале — глагол сразу за ним).',
        '«Keegi rääkis minuga mitte» → «Keegi ei rääkinud minuga» (отрицание — ei перед глаголом).',
      ],
      notes: [
        'Формат — игра: счёт учитель — ученик идёт весь урок (крючок, прогноз, станция 3 — очко за каждое верное предложение, конкурс историй). Проигрывать учителю не стыдно, это игра.',
        'История может быть выдуманной или не об Эстонии («первый раз в другой стране», «первый день на новой работе»). Пенсионеру — первая поездка, первая работа; студенту — первый день в университете; маме — первый визит к семейному врачу с ребёнком; уставшему — короткая версия на 1 минуту.',
        'Обратная связь, 2–3 цели: глагол вторым после времени и места; главное предложение после придаточного — с глагола; самое важное — в конец или в начало с alles / isegi.',
      ],
    },
    discover: [
      station(B.text('077_d_hook', 'Mäng: tõsi või välja mõeldud?', 'Õpetaja jutustab kaks lühikest lugu oma esimesest korrast. Üks on tõsi, teine välja mõeldud. Küsi kaks küsimust ja arva ära. Siis räägi sina.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('077_d_talk', 'Minu esimene kord.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Mis sind Eestis esimesel aastal üllatas?',
        'Millal ja kus see juhtus?',
        'Mida sa sellest õppisid?',
      ], [150, 210], ['Esimesel aastal üllatas mind …', 'Siis nägin ma …', 'Alles hiljem sain aru, et …']), 'Sinu üllatus on tunni loo esimene mustand.'), { task: 'S07', fluency: true }),
      'Õpetaja kaks lugu (näide): 1) „Esimest korda suitsusaunas Võrumaal jäi mu selg nõest mustaks ja keegi ei öelnud mulle midagi.” (tõsi) 2) „Jaanilaupäeval hüppasin üle lõkke ja kaotasin kinga tulle.” (välja mõeldud). Kasuta oma päris lugusid, kui saad. Lõpus ütle üks sõna, mida õpilane vajas (üllatama, piinlik, harjuma).')),
      station(tag(B.vocab('077_d_vocab', 'Enne lugemist: sõnad.', ['tava — обычай', 'traditsioon — традиция', 'suitsusaun — баня по-чёрному', 'leil — пар (в бане)', 'lõke — костёр', 'laulupidu — праздник песни', 'üllatama — удивлять', 'piinlik — неловко', 'vaikus — тишина', 'harjuma — привыкать']), { topic: ['suitsusaun'] }), 2, 15),
      B.topicOpener('077_d_open', 'Moodul 16. Esimest korda Eestis: mis üllatab?', [
        'Uude riiki kolides ei ole kõige raskem sageli keel, vaid tavad, mida keegi ette ei ütle. Kohalikud ei pane neid tähelegi, sest nad on nendega üles kasvanud. Uustulnukas aga seisab esimest korda saunas, jaanitule ääres või laulupeo väljakul ega tea, mis on viisakas ja mis mitte. Just sellistest hetkedest sünnivad lood, mida räägitakse veel aastaid hiljem.',
        'Paljude jaoks algab Eesti kultuur saunast. Võrumaa suitsusauna traditsioon kanti 2014. aastal UNESCO inimkonna vaimse kultuuripärandi nimekirja. Sellisel saunal puudub korsten, nii et ruum on enne pesemist tundide kaupa suitsu täis ja seinad on tahmast mustad. Saunas ollakse sageli alasti, vihtlemiseks kasutatakse kasevihta ja leili visatakse nii palju, kui kõik jaksavad. Pärast leili joostakse järve või talvel lumme. Eestlase jaoks on see puhkus, uustulnukale esimesel korral paras katsumus.',
        'Teine suur üllatus on jaanipäev. Kahekümne kolmas juuni on võidupüha ja vaba päev, õhtul süüdatakse üle Eesti jaanilõkked ja paljud linlased sõidavad maale. Linnad jäävad nii tühjaks, et mõni uustulnukas arvab, et midagi on juhtunud. Lõkke ääres süüakse, lauldakse ja hüpatakse üle tule, sest vana uskumuse järgi toob see õnne ja tervist.',
        'Kolmas kogemus, millest räägitakse aastaid, on laulupidu. Laulu- ja tantsupeo traditsioon on alates 2003. aastast UNESCO vaimse kultuuripärandi meistriteos koos Läti ja Leeduga. 2025. aasta juulis laulsid ja tantsisid Tallinnas taas kümned tuhanded inimesed. Paljud, kes on seda näinud, ütlevad, et alles laulukaare all said nad aru, miks on laul eestlastele nii tähtis.',
        'Kõik üllatused ei ole aga pidulikud. Bussipeatuses seistakse üksteisest kaugel, võõrale naeratatakse harva ja vaikus vestluse keskel ei ole piinlik. Poes ei küsi müüja, kuidas sul läheb, ja naaber võib aastaid ainult noogutada. Esimesel aastal tundub see paljudele külmusena. Hiljem harjutakse ja mõni hakkab vaikust isegi hindama, sest selle taga on sageli lugupidamine, mitte ükskõiksus.',
        'Selles moodulis kasutad keerukamat eesti keelt päris olukordades: kirjutad, miks peaks valima just sind, jutustad oma loo, kirjeldad ja juhendad lühidalt ning annad täpselt edasi, mida teised ütlesid.',
      ], 'UNESCO, Võromaa suitsusaunakombestik inimkonna vaimse kultuuripärandi nimekirjas (2014); UNESCO, Balti riikide laulu- ja tantsupidude traditsioon (2003, nimekirjas 2008); Laulu- ja Tantsupeo SA, laulu- ja tantsupidu „Iseoma” (2025); pühade ja tähtpäevade seadus', [
        'Milline neist tavadest üllatas sind kõige rohkem või üllataks? Miks?',
        'Millised tavad sinu kodumaal või seal, kus sa üles kasvasid, üllataksid eestlast?',
        'Kas vaikus vestluse ajal on sinu jaoks piinlik? Too näide.',
        'Mida peaks uustulnukale Eestis kohe alguses ütlema, et ta ei satuks piinlikku olukorda?',
      ]),
      teach(tag(purpose(B.choice('077_d_facts', 'Arva ja kontrolli: mis uustulnukat üllatab?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Miks on uustulnukal teksti järgi raske Eesti tavadega toime tulla?', 'kohalikud ei märka oma tavasid ega räägi neist ette', 'tavadest on Eestis keelatud võõrastega rääkida', 'tavad muutuvad Eestis peaaegu igal aastal', 'uustulnukad ei taha kohalikke tavasid õppida'],
        ['Mis teeb suitsusauna teksti järgi teistsuguseks kui tavaline saun?', 'sellel ei ole korstnat ja ruum on enne suitsu täis', 'seal ei kasutata kunagi kasevihta ega leili', 'seda köetakse ainult elektriga ja väga lühidalt', 'sinna ei tohi minna rohkem kui kaks inimest'],
        ['Mis juhtus teksti järgi Võrumaa suitsusaunaga 2014. aastal?', 'selle traditsioon kanti UNESCO pärandi nimekirja', 'Võrumaal ehitati esimene uus suitsusaun', 'suitsusaunad keelati suuremates linnades', 'suitsusaunad muutusid turistidele tasuliseks'],
        ['Miks võib uustulnukale jaanipäeval tunduda, et midagi on juhtunud?', 'linnad jäävad tühjaks, sest paljud sõidavad maale', 'tänavatel on jaanipäeval palju politseinikke', 'kõik poed on terve nädala jooksul kinni', 'raadios räägitakse ainult ilmahoiatustest'],
        ['Miks hüpatakse vana uskumuse järgi jaanipäeval üle lõkke?', 'see toob hüppajale õnne ja tervist', 'see on Eestis seadusega kohustuslik', 'nii kustutatakse lõke enne ööd ära', 'nii näidatakse, kes on kõige julgem'],
        ['Mida ütlevad paljud, kes on laulupidu oma silmaga näinud?', 'alles seal said nad aru, miks laul on eestlastele tähtis', 'pidu oli neile liiga pikk ja väsitav', 'nad tundsid kõiki laule juba ette', 'nad ei saanud aru, miks seal nii palju inimesi on'],
        ['Kuidas muutub paljude uustulnukate suhtumine eestlaste vaikusesse?', 'alguses tundub vaikus külm, hiljem hakatakse seda hindama', 'vaikusega ei harju uustulnukad kunagi', 'vaikus muutub aastatega aina piinlikumaks', 'vaikus häirib ainult eestlasi endid'],
      ], 'full', 'g_read'), 'Näed, kas sinu pilt Eesti tavadest vastab tekstile — ja leiad oma loo teema.'), { task: 'R13' }),
      'Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Iga õige prognoos on mängus punkt õpilasele. Lõpus küsi: „Milline lõik on sinu lugu?”'),
    ],
    practice: [
      station(B.notice('077_p_notice', 'Märka: alles laulukaare all said nad aru', [
        'Tekstist: **Esimesel aastal tundub** see paljudele külmusena · **Hiljem harjutakse** · **alles laulukaare all said** nad aru · **Uude riiki kolides ei ole** kõige raskem keel',
        '**Tegusõna teisel kohal**: kui lause algab aja-, koha- või muu määrusega, tuleb tegusõna kohe teisena ja alus pärast seda: **Hommikul ärkasin ma** vara. · **Saunas viskas** naaber kohe leili.',
        '**Pealause pärast kõrvallauset** algab tegusõnaga: Kui ma bussist **välja tulin**, **sadas** lund.',
        '**Kõrvallauses** (et, kui, kuna, sest järel) sõnajärge ei pöörata: …, kui **ma koju jõudsin** (mitte: kui jõudsin ma koju).',
        '**Rõhk**: rõhutatud sõna lause algusesse, uus ja tähtis info lause lõppu: **Alles hiljem** mõistsin … · **Isegi** vaikust hakkasin hindama. · Laulupeol laulsin **esimest korda elus eesti keeles**. · Võrdle: Laulupidu üllatas mind. → Mind üllatas **laulupidu** (uus info lõpus).',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('077_p_order', 'Loo laused enne eetrit.', 'Igas loo lauses on sõnajärje viga. Kirjuta lause õigesti.', [
        ['Kolmekümneaastasena ma nägin esimest korda lund.', 'Kolmekümneaastasena nägin ma esimest korda lund.|Kolmekümneaastasena nägin esimest korda lund.'],
        ['Jaanipäeval me sõitsime sõprade juurde Saaremaale.', 'Jaanipäeval sõitsime me sõprade juurde Saaremaale.|Jaanipäeval sõitsime sõprade juurde Saaremaale.'],
        ['Kui ma suitsusaunast välja astusin, kõik naabrid seisid aias.', 'Kui ma suitsusaunast välja astusin, seisid kõik naabrid aias.|Kui ma suitsusaunast välja astusin, seisid aias kõik naabrid.'],
        ['Alles kuu aega hiljem ma sain aru, et naaber oli lihtsalt häbelik.', 'Alles kuu aega hiljem sain ma aru, et naaber oli lihtsalt häbelik.|Alles kuu aega hiljem sain aru, et naaber oli lihtsalt häbelik.'],
        ['Bussipeatuses keegi ei rääkinud minuga.', 'Bussipeatuses ei rääkinud minuga keegi.|Bussipeatuses ei rääkinud keegi minuga.'],
        ['Kuigi ma ei mõistnud sõnu, ma hakkasin laulupeol nutma.', 'Kuigi ma ei mõistnud sõnu, hakkasin ma laulupeol nutma.|Kuigi ma sõnu ei mõistnud, hakkasin ma laulupeol nutma.|Kuigi ma ei mõistnud sõnu, hakkasin laulupeol nutma.'],
        ['Kui me kohale jõudsime, jaanilõke oli juba põlenud.', 'Kui me kohale jõudsime, oli jaanilõke juba põlenud.|Kui me kohale jõudsime, oli jaanilõke juba ära põlenud.'],
      ], 'full', 'g_notice'), 'Õige sõnajärg hoiab kuulaja loos: ta teab, mis juhtus kõigepealt ja mis on tähtis.'), { task: 'G06' }),
      'Mäng: iga õige lause on punkt õpilasele, iga vale — punkt õpetajale. Pärast iga rida küsi: „Mis on lause alguses ja kus on tegusõna?” Ridadel 3, 6 ja 7 algab pealause pärast kõrvallauset tegusõnaga; real 5 tuleb eitus ja tegusõna kohe pärast kohta, keegi lõppu.'),
    ],
    transfer: [
      station(tag(purpose(B.listening('077_t_story', 'Eelmise aasta võitja lugu.', 'Raadio lugude võistluse eelmise aasta võitja loeb oma loo ette. Kuula kaks korda ja kirjuta igasse lünka 1–2 sõna.', [
        'Jutustaja: Minu nimi on Olga ja minu esimene kord oli suitsusaunas. Kolisin Eestisse kaheksa aastat tagasi ja töötasin Võrumaal laos. Ühel laupäeval kutsus kolleeg mind koos perega sauna. Kuna ma ei tahtnud viisakusest keelduda, ütlesin kohe jah.',
        'Saun oli metsas järve ääres. Kui me kohale jõudsime, oli see juba mitu tundi köetud. Uksest sisse astudes ei näinud ma alguses midagi, sest seinad olid täiesti mustad. Siis viskas kolleegi isa leili ja mul hakkas kõrvadel nii palav, et istusin kohe põrandale.',
        'Mitte keegi ei naernud. Vanaema ütles ainult, et põrandal ongi kõige parem koht. Pärast sauna jooksid kõik järve, ka mina. Alles hiljem sain aru, et see oli nende peres suur au, sest võõraid nende sauna tavaliselt ei kutsuta. Nüüd käin seal igal talvel.',
      ], [
        'Olga ütles kolleegi kutsele kohe jah, sest ta ei tahtnud viisakusest [keelduda].',
        'Suitsusauna astudes ei näinud Olga alguses midagi, sest seinad olid täiesti [mustad].',
        'Kui kolleegi isa leili viskas, istus Olga kuumuse pärast kohe [põrandale].',
        'Keegi ei naernud ja vanaema ütles, et seal ongi kõige parem [koht].',
        'Alles hiljem mõistis Olga, et kutse oli selles peres suur [au].',
        'Nüüd käib Olga kolleegi pere suitsusaunas igal [talvel].',
      ], 'g_read'), 'Kuuled, kuidas hea lugu on üles ehitatud — algus, üllatus ja see, mida mõistetakse alles hiljem.'), { task: 'L03', harno: 'L3' }), 4, 15, { final: 'present' }),
      teach(tag(purpose(B.rolecards('077_t_contest', 'Lugude võistlus: räägi oma lugu raadios.', 'Räägi raadio lugude võistlusel 1–2 minutit oma esimesest korrast Eestis või mõnes uues kohas. Õpetaja on žürii: ta kuulab, annab punkte ja küsib ühe küsimuse.',
        'Olukord: raadio otsib lugusid teemal „Minu esimene kord”; võitja lugu loetakse eetris ette.\nSinu eesmärk: räägi 1–2 minutit nii, et žürii kuulab lõpuni — kus ja millal, mis juhtus ja mida mõistsid alles hiljem.\nPiirang: alusta vähemalt viit lauset aja või kohaga.',
        'Žürii kaart on õpetajal: kolm punkti ja üks küsimus.',
        ['Esimest korda …', 'Kui ma …, oli …', 'Siis …', 'Alles hiljem sain ma aru, et …'], ['Mis oli kõige raskem hetk?', 'Kas räägiksid sellest hetkest veel?', 'Minu hinnang: …']), 'Tulemus: sinu lugu on valmis — žürii kuulab seda lõpuni ja teab, mis oli sinu jaoks tähtis.'), { task: 'S16', main: true, level: 4 }),
      'Žürii kaart (3 punkti): 1) vähemalt viis lauset algavad aja või kohaga ja tegusõna on teisel kohal; 2) vähemalt üks „Kui …, …” lause, kus pealause algab tegusõnaga; 3) lõpus on mõte, mida mõisteti alles hiljem (alles, isegi). Seejärel räägi sina oma lugu ja õpilane on žürii. Mängu võidab see, kellel on lõpuks rohkem punkte. Kui õpilasel ei ole lugu Eestist, sobib esimene päev uuel tööl, uues koolis või teises riigis.'),
      extension(teach(tag(purpose(B.rolecards('077_t_more', 'Arutelu: kohaneda või jääda oma tavade juurde?', 'Vali kaart A või B. Arutage 6 minutit ja jõudke ühise seisukohani: mida peaks uustulnuk kohalikest tavadest üle võtma ja mida võib jätta.',
        'Kaart A (kohaneda). Argumendid: kes käib suitsusaunas, viskab leili, istub jaanilõkke ääres ja käib laulupeol, leiab kiiremini sõpru ja keele; kohalikud tavad aitavad mõista eestlaste vaikust ja huumorit; lastel on koolis lihtsam. Lisa oma näide.',
        'Kaart B (oma tavad alles). Argumendid: oma pühad ja keel annavad kindlustunnet; kahel kultuuril elav laps on rikkam; Eesti seadus lubab koolis ka oma emakeele ja kultuuri õpet. Lisa oma näide.',
        ['Minu seisukoht on, et …', 'Kui ma esimest korda suitsusauna või laulupeole …, sain aru …', 'Kohalik traditsioon …', 'Alles hiljem …'], ['Ma saan aru, aga …', 'Kas võiksime kokku leppida, et …?', 'Ühine seisukoht võiks olla …']), 'Arutelu näitab, et oskad oma loost kasvanud seisukohta kaitsta ja kompromissini jõuda.'), { task: 'S17', level: 4 }),
      'Kui aega jääb (12 min). Kui õpilane valis A, mängi B ja vastupidi. Tavad ei ole „õiged” ega „valed” — vaidleme valikute üle, mitte inimeste üle. Õnnestunud, kui õpilane esitab kaks argumenti näitega (sobib tema enda lugu), alustab vähemalt kahte lauset aja- või kohamäärusega, reageerib kaks korda sinu mõttele ja te jõuate ühise seisukohani (näiteks: „Proovida tasub kõike, oma tavad jäävad ka alles”).'), 12),
      tag(exitCheck(purpose(B.gaps('077_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Kui ma esimest korda hommikul linnabussi astusin, [oli] seal täiesti vaikne. (olema)',
        'Alles teise aasta kevadel [hakkasin] ma eestlaste vaikust tõeliselt mõistma. (hakkama)',
        'Jaanilaupäeval [sõitsime] me kogu perega maale, et jaanilõkke ääres istuda. (sõitma)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tegusõna on õigel kohal.')), {}),
      purpose(B.selfcheck('077_t_self', ['Ma räägin, mis mind Eestis või uues kohas üllatas.', 'Ma saan aru tekstist Eesti tavade kohta ja kontrollin oma oletusi.', 'Ma panen tegusõna õigele kohale: pärast aega ja kohta teisena, pärast kõrvallauset esimesena.', 'Ma jutustan 1–2 minutit loo, mida teised kuulavad lõpuni.'], 'Lugu räägitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('077_t_write', 'Kodus: lugu võistluse kodulehele.', 'Kirjuta kodus oma lugu 180–200 sõna raadio kodulehele: kus ja millal, mis juhtus ja mida mõistsid alles hiljem. Alusta viit lauset aja või kohaga ja pane tegusõna teisele kohale.', [14, 18], ['esimest korda', 'siis', 'kui', 'alles hiljem'], 3, 'g_use'), 'Sinu lugu jõuab kirjas ka nende kuulajateni, kes raadiot ei kuulnud.')), { task: 'W05', level: 4 }),
      tag(homeTask(purpose(B.speaking('077_t_home', 'Kodus: salvesta oma lugu.', 'Salvesta oma lugu raadio jaoks, 1–2 minutit.', [
        'Mis oli sinu loos kõige tähtsam hetk?',
        'Mida sa alles hiljem mõistsid?',
      ], [60, 180]), 'Õpetaja kuulab, kas tegusõna on õigel kohal ja tähtis info lõpus.')), { task: 'S15' }),
      homework('077_t_homework', ['1. Lugu võistluse kodulehele, 180–200 sõna (ülesanne lehel).', '2. Salvesta oma lugu, 1–2 minutit (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-078': {
    title: 'Esimest korda ujulas: mida reeglileht tegelikult ütleb?',
    phases: grammar('Keel: kesksõnad ja des-vorm — kehtiv pilet, lukustatav kapp, kogenud ujuja, pestud keha; duši all käies, saunas istudes'),
    format: 'infogap',
    topic: 'health',
    canDo: 'Ma saan aru ujula või spordikeskuse kodukorrast ja arvustustest, annan sõbrale nõu, kuidas esimest korda minna, ja kirjutan 180–200-sõnalise arvustuse spordikohast; kasutan kesksõnu (-v, -tav, -nud, -tud) ja des-vormi, et kirjeldus oleks lühike ja täpne.',
    teacherPage: {
      goal: 'Инфообмен: правила бассейна (R2a) и два отзыва; причастия -v / -tav / -nud / -tud и des-форма; совет другу, который идёт в бассейн первый раз; отзыв — дома.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — правила и 4 вопроса из 7; станция 3 — правило и 4 строки; станция 4 — один отзыв и совет другу только по двум его проблемам.',
      hook: '«В эстонских школах начальное обучение плаванию обязательно. Какая часть учеников сегодня сдаёт тест на 200 метров: каждый четвёртый, примерно половина или почти все? А ты умеешь плавать?» Ответ — примерно половина (ERR, 2026). Не умеешь плавать — нормальный ответ: многие взрослые не научились в школе.',
      plan: [
        '0–3: крючок — какая часть учеников сдаёт тест по плаванию, ученик отвечает сразу',
        '3–10: станция 1 — разговор: где я научился плавать, где я сейчас двигаюсь, что смутило меня в новом спортивном месте',
        '10–25: станция 2 — слова (2 мин), правила бассейна (шесть разделов A–F), 7 вопросов друга → раздел (R2a); «Kas teadsid?» о плавании в школе',
        '25–37: станция 3 — заметить в правилах причастия и des-форму → правило → 7 предложений отзыва: причастие или des-форма',
        '37–52: станция 4 — два отзыва о том же бассейне; друг (учитель) спрашивает совета: у него свой план и свои страхи, ученик даёт три совета (S2)',
        '52–64: «Kui aega jääb» — решение: кому из четырёх отдать бесплатное место на курсе плавания',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: отзыв о спортивном месте 180–200 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Правила бассейна и отзывы — учебные тексты по типичным правилам эстонских бассейнов (мыться без купальника, шапочка, дети до 10 лет — со взрослым). Факт: ERR / Vikerraadio, «Ujula kaugus koolist mõjutab laste ujumisoskust» (2026): начальное обучение плаванию обязательно, но тест (200 м, комплексный) сдаёт примерно половина учеников; Eesti Ujumisliit хочет, чтобы плавать умели около 90 % учеников 1–3 классов; результат зависит от расстояния до бассейна; многие взрослые не научились плавать в школе, спрос на курсы для взрослых большой.',
      groups: 'Станция 1 — в парах. Правила — каждый сам, сверка в паре. Станция 4: настоящий инфообмен — у одного правила и отзывы, у другого карточка друга (план и страхи), не показывать друг другу. В 1:1 друг — вы.',
      errors: [
        '«Ostud pilet» → «ostetud pilet» (-tud: что сделано; от ostma — ostetud).',
        '«Lukustav kapp» → «lukustatav kapp» (-tav: что можно запереть; -v: что само делает — kehtiv pilet).',
        '«Duši all käides vesi on soe» → «Duši all käies peseb inimene …» (у des-формы и предложения один деятель).',
        '«Kogenenud treener» → «kogenud treener» (-nud от kogema: kogenud).',
      ],
      notes: [
        'Формат — инфообмен: у ученика правила и отзывы, у учителя — план и страхи друга. Тема телесная (мыться без купальника): говорим спокойно и по-деловому, это правило гигиены, а не стыд. Ученику, который не ходит в бассейн, — спортзал, каток или лыжная трасса: те же правила, те же причастия.',
        'Пенсионеру — аквааэробика и скидки; маме — бассейн с ребёнком; студенту — спортклуб университета; уставшему после смены — сауна после работы.',
        'Обратная связь, 2–3 цели: -tud / -tav / -v / -nud по смыслу; des-форма с тем же деятелем; короткое описание вместо придаточного.',
      ],
    },
    discover: [
      station(B.text('078_d_hook', 'Arva ära', 'Eesti koolides on ujumise algõpe kohustuslik. Kui suur osa õpilastest läbib praegu 200-meetrise ujumise testi: iga neljas, umbes pool või peaaegu kõik? Ja kas sina oskad ujuda? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('078_d_talk', 'Vesi ja liikumine minu elus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kus ja kuidas sa ujuma õppisid, kui õppisid?',
        'Kus sa praegu liigud või sporti teed?',
        'Mis ajas sind uues spordikohas segadusse?',
      ], [150, 210], ['Ma õppisin ujuma …', 'Praegu käin …', 'Esimest korda …']), 'Sinu kogemus näitab, mida esimest korda tulnud inimene vajab.'), { task: 'S02', fluency: true }),
      'Üks-ühele: vastus on „umbes pool” (ERR, 2026). Räägi ka ise. Ära küsi tervise ega keha kohta. Lõpus ütle üks sõna, mida õpilane vajas (riietusruum, ujumismüts, kapp).')),
      station(tag(B.vocab('078_d_vocab', 'Enne lugemist: sõnad.', ['ujula — бассейн (здание)', 'bassein — бассейн (ванна)', 'riietusruum — раздевалка', 'pesema — мыть', 'kapp — шкафчик', 'kehtiv — действующий', 'lubatud — разрешённый', 'keelatud — запрещённый', 'arvustus — отзыв', 'algaja — начинающий']), { topic: ['riietusruum'] }), 2, 15),
      B.text('078_d_rules', 'Linna ujula kodukord (lühendatud)', '**A** Ujulasse pääseb kehtiva pileti või kuukaardiga. Kassast ostetud pilet kehtib kaks tundi, kuukaart terve kalendrikuu. Ujula on avatud iga päev kella seitsmest kümneni õhtul.\n\n**B** Riided, jalanõud ja kotid jäetakse riietusruumis lukustatavasse kappi. Kapi võtit kantakse kogu aeg randmel. Kaotatud võtme eest tuleb maksata viis eurot.\n\n**C** Enne basseini minekut pestakse end duši all ilma ujumisriieteta. Pestud keha hoiab vee puhtana ja kloori on vaja vähem.\n\n**D** Basseinis on ujumismüts kohustuslik kõigile. Pikad juuksed seotakse kinni. Mütsi saab osta infoletist.\n\n**E** Alla kümneaastane laps ujub ainult koos täiskasvanuga. Sügavas osas ujuvad ainult ujuda oskavad inimesed, algajad jäävad madalasse ossa või ujuvad treeneriga.\n\n**F** Basseini ääres joostes võib märjal põrandal kukkuda. Klaaspudelid ja toit on basseinialal keelatud, joogivett saab infoletist.'),
      teach(tag(purpose(B.table('078_d_match', 'Sõbra küsimused ja kodukord.', 'Sõber küsib sinult. Leia iga küsimuse jaoks kodukorra lõik (A–F), kus on vastus. Üks lõik sobib kahele küsimusele.', 'Küsimus, Lõik', [
        '1. Kas ma võin oma vee klaaspudelis kaasa võtta? | [F]',
        '2. Kuhu ma oma telefoni ja jope panen? | [B]',
        '3. Kas ma pean enne vette minekut pesema? | [C]',
        '4. Mu tütar on kaheksa. Kas ta võib üksi ujuda? | [E]',
        '5. Kui kaua mu pilet kehtib? | [A]',
        '6. Mul on lühikesed juuksed. Kas mütsi on ikka vaja? | [D]',
        '7. Ma ei oska hästi ujuda. Kuhu ma minna võin? | [E]',
      ], 'g_read'), 'Leiad kiiresti õige reegli — nii saad sõbrale kindla vastuse anda.'), { task: 'R14' }),
      'Nagu eksami lugemise osas 2a (seal 8 väidet): õpilane joonib lõigus alla sõna, mis vastuse annab (klaaspudelid, kapp, duši all). Küsimus 7: sügavasse ossa ainult ujuda oskavad, algajad madalasse ossa.'),
      B.know('078_d_know', ['Ujumise algõpe on Eesti koolides kohustuslik, kuid 200-meetrise ujumise testi läbib praegu ainult umbes pool õpilastest. Eesti Ujumisliit soovib, et ujuda oskaks umbes 90 protsenti 1.–3. klassi lastest. Tulemus sõltub palju sellest, kui kaugel on kool ujulast. Paljud täiskasvanud ei õppinud koolis ujuma ja täiskasvanute kursuste järele on suur nõudlus.'], 'ERR, „Ujula kaugus koolist mõjutab laste ujumisoskust” (2026)', 'Kas teadsid? Ujumisoskus Eestis'),
    ],
    practice: [
      station(B.notice('078_p_notice', 'Märka: kehtiv pilet, pestud keha', [
        'Kodukorrast: **kehtiva** pileti · kassast **ostetud** pilet · **lukustatavasse** kappi · **pestud** keha · ujuda **oskavad** inimesed · basseini ääres **joostes**',
        '**-v** = mis teeb või toimib (tegev, olevik): kehtiv pilet (pilet, mis kehtib), **kasvav** järjekord, **töötav** ema.',
        '**-tav** = mida saab või tuleb teha (umbisikuline): lukustatav kapp (kapp, mida saab lukustada), **loetav** kiri, **pestav** riie.',
        '**-nud** = kes on midagi teinud: **kogenud** ujuja, **külmunud** käed · **-tud** = mida on tehtud: ostetud pilet, **kaotatud** võti.',
        '**des-vorm** = samal ajal kui tegija teeb midagi: duši all **käies**, saunas **istudes**, riietusruumis **olles**. Tegija on sama mis lauses: Saunas istudes **jõin** ma vett. (Mitte: Saunas istudes oli vesi külm.)',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('078_p_short', 'Arvustus lühemaks.', 'Kirjuta sulgudes olev tegusõna kesksõna või des-vormina, nii et lause jääb lühike ja selge.', [
        'Riietusruumi [unustatud] rätik oli järgmisel päeval infoletis alles. (unustama)',
        'Pool tundi [ujunud] mees läks otse sooja sauna. (ujuma)',
        'Algajatele [soovitatav] kursus toimub hommikuti kella seitsmest. (soovitama)',
        'Kassa ees [ootavad] inimesed võivad vahepeal istuda pingil. (ootama)',
        'Duši alla [minnes] võta oma šampoon ja rätik kaasa. (minema)',
        '[Ujudes] unustasin kõik oma mured ja päeva väsimuse. (ujuma)',
        'Internetist [ostetud|ostetav] pilet on kassas müüdavast odavam. (ostma)',
      ], '', 'full', 'g_notice'), 'Lühike lause teeb arvustuse loetavaks — lugeja leiab kiiresti, mis on tähtis.'), { task: 'G02', harno: 'R3' }),
      'Eksaminurk (R3): eksamil on tekst ja 12 lünka, kus vorm või väljend tuleb valida lause järgi. Pärast iga rida küsi: „Kas tegija teeb ise (-v, -nud) või tehakse temaga midagi (-tav, -tud)? Kas see toimub samal ajal (des)?” Real 7 sobivad mõlemad: ostetud (juba ostetud) ja ostetav (mida ostetakse). Lisaküsimus: „Kirjelda üht kohta, kus sa käid, ühe kesksõnaga.”'),
    ],
    transfer: [
      station(tag(purpose(B.reading('078_t_reviews', 'Kaks arvustust samast ujulast.', 'Loe arvustusi ja vasta igale küsimusele 1–3 sõnaga.', 'Kaks arvustust samast ujulast', '★★★★★ „Puhas ja rahulik ujula. Soojendatud väikeses basseinis on lastega mõnus ja kogenud treenerid aitavad ka täiskasvanuid, kes alles õpivad ujuma. Hommikul kella seitsmest üheksani on vett palju ja inimesi vähe. Saunas istudes saab vaadata aknast parki.” — Kaja, 41\n\n★★☆☆☆ „Riietusruum on kitsas ja õhtuti on kõik lukustatavad kapid kinni. Kassast ostetud pilet maksab 9 eurot, internetist ostes 7. Seda ei öelnud mulle keegi! Saun on hea, kuid see suletakse juba kell 21, kuigi ujula on avatud kella kümneni.” — Andrus, 28', [
        ['Mis ajal on arvustuste järgi kõige parem ujumas käia?', 'hommikul|hommikuti|varahommikul'],
        ['Kellele sobib Kaja arvates eriti hästi väike soojendatud bassein?', 'lastele|lastega peredele|lastega'],
        ['Mis võib juhtuda inimesega, kes tuleb ujulasse õhtul?', 'kapp ei ole vaba|kõik kapid on kinni|kappe pole'],
        ['Mitu eurot säästab, kui ostab pileti internetist?', 'kaks eurot|2 eurot|kaks|2'],
        ['Kui kaua on ujula veel lahti pärast sauna sulgemist?', 'üks tund|tund|1 tund|tunni'],
      ], 'g_read'), 'Arvustustest saad infot, mida kodukorras ei ole — hinnad ja parimad ajad.'), { task: 'R15', level: 3 }), 4, 15, { final: 'advise' }),
      teach(tag(purpose(B.rolecards('078_t_info', 'Infolünk: sõber läheb esimest korda ujulasse.', 'Sinu sõber (õpetaja) läheb homme esimest korda ujulasse ja küsib sinult kohvipausil nõu. Sul on kodukord ja arvustused, temal on oma plaan. Küsi, mida ta vajab, ja anna nõu.',
        'Olukord: sul on lehel kodukord (A–F) ja kaks arvustust; sõbra plaani sa ei tea.\nSinu eesmärk: saa teada, millal, kellega ja miks ta läheb ning mida ta kardab, ja anna kolm nõuannet, mis talle päriselt sobivad.\nPiirang: kirjelda lühidalt — kasuta vähemalt kolme kesksõna või des-vormi.',
        'Sõbra kaart on õpetajal: tema plaan ja mured.',
        ['Millal sa minna tahad?', 'Internetist ostetud pilet …', 'Duši all käies …', 'Soovitan …, sest …', 'Lapsega ujudes …'], ['Ma mõtlesin minna …', 'Aga mis siis, kui …?', 'Kas see on kohustuslik?']), 'Tulemus: sõber teab, millal minna, mida kaasa võtta ja mida karta pole vaja.'), { task: 'S05', level: 4 }),
      'Infolünk: sinu käes on info, mida õpilasel ei ole. Õpetaja kaart (sõber). Plaan: homme kell 18.30, koos 7-aastase pojaga, pärast tööd (töö lõpeb kell 18). Mured, ütle ükshaaval: 1) „Mul ei ole ujumismütsi, mul on lühikesed juuksed.” (D: kohustuslik) 2) „Kas ma pean tõesti duši all ilma ujumisriieteta pesema? Mulle on see piinlik.” (C: jah — see on hügieeni reegel; rahulik selgitus) 3) „Poeg tahab ise ujuda, ta ütleb, et oskab.” (E: alla 10 aasta ainult koos täiskasvanuga) 4) „Kui palju pilet maksab?” (arvustus: kassast 9, internetist 7 eurot) 5) Kui õpilane küsib aja kohta: õhtul on kapid kinni → nädalavahetuse hommik. Õnnestunud, kui õpilane küsib vähemalt kolm küsimust, annab kolm nõuannet koos põhjusega ja kasutab kolme kesksõna või des-vormi.'),
      extension(teach(tag(purpose(B.speaking('078_t_more', 'Otsusta: kellele tasuta ujumiskursus?', 'Linn pakub täiskasvanute ujumiskursusele 20 tasuta kohta, soovijaid on sada. Õpetaja loeb ette neli soovijat. Otsusta, kes kohad saavad, ja põhjenda.', [
        'Kellele sa koha annaksid ja miks?',
        'Kellele mitte ja kuidas sa seda talle viisakalt ütleksid?',
        'Mis peaks olema kursuse reegel, et tasuta kohalt ära ei jäädaks?',
      ], [120, 180], ['Ujuda mitteoskav lapsevanem …', 'Algajatele mõeldud kursus …', 'Kursusele registreerunud inimene …', 'Puudumise korral …']), 'Otsus näitab, et oskad kaaluda ja põhjendada, kellele piiratud võimalus antakse.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Neli soovijat: 1) 35-aastane isa, kelle kaks last käivad suvel järve ääres; 2) 68-aastane pensionär, arst soovitas ujumist seljavalu vastu; 3) 22-aastane tudeng, kes tahab päästjaks õppida; 4) 45-aastane naine, kes ei õppinud koolis ujuma, sest ujula oli kaugel. Õnnestunud, kui õpilane põhjendab iga otsust, kasutab kolme kesksõna või des-vormi ja sõnastab ühe reegli (näiteks: kahe põhjuseta puudumise järel antakse koht järgmisele).'), 12),
      tag(exitCheck(purpose(B.gaps('078_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Treeneri [kirjutatud] harjutuste kava ripub riietusruumi seinal. (kirjutama)',
        'Kitsas riietusruumis [olles] hoia oma kapi võtit kogu aeg randmel. (olema)',
        'Algajatele [mõeldud] hommikusel kursusel on bassein madal ja vesi soe. (mõtlema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kesksõna ja des-vorm on käes.')), {}),
      purpose(B.selfcheck('078_t_self', ['Ma räägin, kus ja kuidas ma liigun või ujun.', 'Ma leian kodukorrast kiiresti reegli, mis vastab küsimusele.', 'Ma kasutan kesksõnu ja des-vormi: kehtiv, lukustatav, kogenud, ostetud, duši all käies.', 'Ma annan sõbrale nõu, mis sobib just tema plaaniga.'], 'Nõu antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('078_t_review', 'Kodus: arvustus spordikohast.', 'Kirjuta kodus 180–200-sõnaline arvustus spordikohast, mida tunned: mis seal on, mis on hea, mis segab ja kellele sa seda soovitad. Kasuta vähemalt viit kesksõna või des-vormi.', [14, 18], ['soovitan', 'kuid', 'kokkuvõttes'], 2, 'g_use'), 'Sinu arvustus aitab järgmist külastajat, kes tuleb sinna esimest korda.')), { task: 'W05', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('078_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kirjelda kohta, kus sa liigud või puhkad, nii et sõber leiab sinna ja teab reegleid.', [
        'Kus see koht on ja mis seal on?',
        'Mida peab esimest korda tulnud inimene teadma?',
      ], [60, 120]), 'Õpetaja kuulab, kas kesksõnad ja des-vorm on õiged.')), { task: 'S15' }),
      homework('078_t_homework', ['1. Arvustus spordikohast, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-079': {
    title: 'Mida koosolekul tegelikult öeldi? Kuulujutt, fakt ja viisakas palve',
    phases: grammar('Keel: kõneviis funktsiooni järgi — allikaga ja kaudne kõne (direktori sõnul …, kursus olevat …), umbisikuline (otsustati, lepiti kokku), tingiv palve (Kas te saaksite …?)'),
    format: 'facts',
    topic: 'family',
    canDo: 'Ma saan aru lastevanemate koosolekust, eristan fakti ja kuulujuttu, annan teiste sõnad täpselt edasi (direktori sõnul …, väidetavalt olevat …) ning räägin naabrile 1–2 minutit, mis otsustati, ja esitan koolile viisaka palve tingivas kõneviisis.',
    teacherPage: {
      goal: 'Анализ фактов: родительское собрание о переходе на эстонский язык обучения (L4), слух против факта; источник, -vat, безличная форма, вежливая просьба; рассказ соседу и продукт модуля.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — запись один раз, 4 утверждения из 7; станция 3 — правило и 4 строки; станция 4 — рассказ соседу 1 минута без нового слуха; продукт — дома.',
      hook: '«В родительском чате написали: „Слышала, что со следующего года родной язык в школе вообще не будут преподавать!” Что ты делаешь: пересылаешь дальше, спрашиваешь, откуда информация, или пишешь в школу? Голосуй и скажи почему.» Ответ закона — на станции 2: если у 10 учеников один родной язык, школа даёт уроки языка и культуры.',
      plan: [
        '0–3: крючок — слух в родительском чате, ученик голосует',
        '3–10: станция 1 — разговор: на каком собрании я был, откуда я беру информацию, верил ли я слуху',
        '10–25: станция 2 — слова (2 мин), запись собрания дважды, 7 утверждений «верно / неверно» (L4); «Kas teadsid?» о законе 2022 г.',
        '25–37: станция 3 — заметить: direktori sõnul, otsustati, -vat, Kas te saaksite → правило → 7 предложений передать',
        '37–52: станция 4 — сообщения соседки, которая не пришла; зайти к ней и рассказать 1–2 минуты: три факта с источником, один слух опровергнут, одна просьба к школе; «Minu B2 tekstimapp»',
        '52–64: «Kui aega jääb» — ролевая игра: остановить слух вежливо',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: сводка для родителей 160–200 слов, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'ERR, «Riigikogu kiitis heaks eestikeelsele õppele ülemineku» (12.12.2022): 62 за, 16 против; детские сады, 1 и 4 классы — с 2024/2025 учебного года, основная школа — до 2029/2030 учебного года (Haridus- ja Teadusministeerium), 12 класс — 2032/2033; если у не менее 10 учеников один родной или домашний язык, им положено обучение языку и культуре; учителя — эстонский на уровне C1 как квалификационное требование с 1.08.2024. Собрание, школа, директор, курсы для родителей, помощь по средам — учебные (типичные меры школ), это сказано ученику как пример.',
      groups: 'Запись — каждый сам, сверка в паре. Станция 4: один рассказывает «соседке», второй — соседка с вашей карточкой (новый слух); потом смена. В 1:1 соседка — вы.',
      errors: [
        '«Direktor sõnul …» → «Direktori sõnul …» (kelle sõnul — родительный падеж).',
        '«Kursus olevat tasuta, ütles direktor» — если источник надёжный и назван, -vat не нужен: «Direktori sõnul on kursus tasuta».',
        '«Me otsustati» → «Otsustati» или «Me otsustasime» (в безличной форме нет подлежащего).',
        '«Saatke mulle!» к учителю → «Kas te saaksite mulle saata …?» (условное наклонение = вежливость).',
      ],
      notes: [
        'Формат — анализ фактов: что сказано, кем, и чем это подтверждено. Тема чувствительная для русскоязычных семей. Мы не спорим, хорош ли переход; мы учимся точно передавать, что сказано, и отличать факт от слуха. Скажите это в начале урока.',
        'Ученику без детей: «соседка попросила тебя сходить вместо неё» — роль та же; пенсионеру — внук; студенту — младший брат или собрание курса; уставшему после смены — сосед тоже работает в смену, он поймёт.',
        'Обратная связь, 2–3 цели: kelle sõnul + источник; -vat только для непроверенного; Kas te saaksite …? вместо приказа.',
      ],
    },
    discover: [
      station(B.text('079_d_hook', 'Hääleta', 'Vanemate vestlusgrupis kirjutati: „Kuulsin, et järgmisest aastast emakeelt koolis enam üldse ei õpetata!” Mida sa teed: jagad edasi, küsid, kust see info pärit on, või kirjutad koolile? Hääleta kohe ja ütle, miks.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('079_d_talk', 'Koosolekud ja kuulujutud minu elus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Millisel koosolekul sa viimati käisid?',
        'Kust sa saad infot oma lapse, maja või töö kohta?',
        'Kas oled kunagi uskunud kuulujuttu, mis osutus valeks?',
      ], [150, 210], ['Viimati käisin …', 'Infot saan …', 'Kord kuulsin, et …']), 'Sinu kogemus näitab, kui kiiresti kuulujutt levib.'), { task: 'S09', fluency: true }),
      'Üks-ühele: ütle alguses: „Me ei arutle, kas üleminek on hea või halb; me harjutame täpselt edasi andma, mida öeldi.” Räägi ka ise. Lõpus ütle üks sõna, mida õpilane vajas (koosolek, kuulujutt, allikas).')),
      station(tag(B.vocab('079_d_vocab', 'Enne kuulamist: sõnad.', ['koosolek — собрание', 'lapsevanem — родитель', 'otsus — решение', 'kuulujutt — слух', 'allikas — источник', 'kinnitama — подтверждать', 'üleminek — переход', 'õppekeel — язык обучения', 'emakeel — родной язык', 'palve — просьба']), { topic: ['õppekeel', 'kuulujutt'] }), 2, 15),
      teach(tag(purpose(B.examListen('079_d_meeting', 'Lastevanemate koosolek: mida direktor ütles?', 'Kuula koosoleku lõiku kaks korda. Otsusta iga väite kohta: õige või vale.', 'truefalse', [
        'Direktor: Tere õhtust, head lapsevanemad! Alustan kõige tähtsamast. Nagu teate, otsustas Riigikogu kahe tuhande kahekümne teise aasta detsembris, et Eesti koolid lähevad järk-järgult üle eestikeelsele õppele. Lasteaiad ning esimene ja neljas klass alustasid juba kahe tuhande kahekümne neljanda aasta sügisel. Põhikoolis peavad kõik klassid õppima eesti keeles kahe tuhande kahekümne üheksanda aasta sügisest.',
        'Lapsevanem: Vestlusgrupis kirjutati, et emakeelt enam üldse ei õpetata. Kas see on tõsi?',
        'Direktor: Ei ole. Seadus ütleb, et kui vähemalt kümnel õpilasel on sama emakeel või kodukeel, saavad nad keele- ja kultuuriõpet. Meie koolis alustame sellega oktoobris, kaks korda nädalas.',
        'Lapsevanem: Aga kui laps ei saa matemaatikast eesti keeles aru?',
        'Direktor: Selleks on meil kaks lahendust. Esiteks on igal kolmapäeval pärast tunde õpiabi, kus õpetaja seletab teemat uuesti ja aeglasemalt. Teiseks otsustati õpetajate koosolekul, et uued sõnad saadetakse koju kakskeelse sõnastikuna, et ka vanemad saaksid aidata.',
        'Lapsevanem: Kas lapsevanematele on ka kursusi?',
        'Direktor: Jah. Koostöös linnaga algab novembris kooli majas tasuta eesti keele kursus lapsevanematele, kohti on kakskümmend. Registreerida saab klassijuhataja kaudu kuni järgmise reedeni.',
        'Lapsevanem: Ja kas see vastab tõele, et kõik õpetajad vahetatakse välja?',
        'Direktor: Ei. Enamik meie õpetajaid on vajaliku keeleeksami juba teinud ja kolm õpetajat õpivad praegu. Ja veel üks palve: kui kuulete midagi, mis teid muretsema paneb, küsige otse minult või klassijuhatajalt. Kuulujutud levivad kiiremini kui tõde.',
      ], [
        ['Direktori sõnul otsustas Riigikogu eestikeelsele õppele ülemineku 2022. aasta detsembris.', true],
        ['Esimene ja neljas klass alustavad direktori sõnul eestikeelset õpet alles järgmisel sügisel.', false],
        ['Direktor kinnitas vestlusgrupi kuulujuttu, et emakeelt koolis enam ei õpetata.', false],
        ['Emakeele ja kultuuri tunnid algavad selles koolis oktoobris kaks korda nädalas.', true],
        ['Õpiabi tunnid on koolis igal kolmapäeval hommikul enne esimest tundi.', false],
        ['Õpetajate koosolekul otsustati saata uued sõnad koju kakskeelse sõnastikuna.', true],
        ['Direktori sõnul peavad õpetajad, kes alles õpivad, koolist lahkuma.', false],
      ], 'g_read'), 'Kuuled ise, mida koosolekul öeldi — ja saad kuulujutule vastata faktiga.'), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Eksaminurk (L4): eksamil on 12 väidet ja intervjuu kahe inimesega. Enne kuulamist joonib õpilane väidetes alla võtmesõnad (millal? kes? mitu?). Pärast küsi iga vale väite kohta: „Mida tegelikult öeldi?” — see on tunni grammatika: „Direktori sõnul …”.'),
      B.know('079_d_know', ['Riigikogu võttis eestikeelsele õppele ülemineku seaduse vastu 12. detsembril 2022 (62 poolt, 16 vastu). Lasteaiad ning 1. ja 4. klass läksid eesti keelele üle 2024/2025. õppeaastal, põhikool lõpetab ülemineku 2029/2030. õppeaastaks ja 12. klass 2032/2033. õppeaastal. Kui vähemalt kümnel õpilasel on sama emakeel või kodukeel, on neil õigus keele- ja kultuuriõppele.'], 'ERR, „Riigikogu kiitis heaks eestikeelsele õppele ülemineku” (12.12.2022); Haridus- ja Teadusministeerium, üleminek eestikeelsele õppele', 'Kas teadsid? Üleminek eestikeelsele õppele'),
    ],
    practice: [
      station(B.notice('079_p_notice', 'Märka: direktori sõnul, otsustati, kas te saaksite', [
        'Koosolekult: **kirjutati**, et emakeelt **ei õpetata** · **otsustati** õpetajate koosolekul · uued sõnad **saadetakse** koju · kas see vastab tõele, et õpetajad **vahetatakse** välja?',
        '**Kes ütles?** Info koos usaldusväärse allikaga: **direktori sõnul** algab kursus novembris · **direktor ütles, et** kursus algab novembris.',
        '**Kaudne kõneviis (-vat)** = kuuldud, kontrollimata: Söökla **olevat** remondis. · Buss **väljuvat** varem. · Eitus: **ei olevat**, **ei väljuvat**.',
        '**Umbisikuline** = tegija pole tähtis, tähtis on otsus: koosolekul **otsustati**, **lepiti kokku**, nimekiri **saadetakse** reedel.',
        '**Tingiv viisakas palve**: **Kas te saaksite** …? · **Oleksin tänulik, kui** … · **Kas oleks võimalik** …? (Mitte käsk: „Saatke!”)',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('079_p_report', 'Ütle edasi nii, nagu see oli.', 'Kirjuta lause ümber antud vormis: allikaga, kaudses kõneviisis, umbisikuliselt või viisaka palvena. Alusta antud sõnadega.', [
        ['Direktor: „Õpiabi on igal kolmapäeval.”', 'Direktori sõnul …', 'Direktori sõnul on õpiabi igal kolmapäeval.|Direktori sõnul on igal kolmapäeval õpiabi.'],
        ['Vestlusgrupis kirjutati: „Vanemate kursus on tasuline.” (sa ei ole kindel)', 'Vanemate kursus …', 'Vanemate kursus olevat tasuline.'],
        ['Keegi ütles poes: „Järgmisest kuust koolibussi enam ei ole.” (sa ei ole kindel)', 'Järgmisest kuust …', 'Järgmisest kuust koolibussi enam ei olevat.|Järgmisest kuust ei olevat koolibussi enam.'],
        ['Koosolekul me otsustasime, et klassiõhtu on mais.', 'Koosolekul otsustati …', 'Koosolekul otsustati, et klassiõhtu on mais.|Koosolekul otsustati, et klassiõhtu toimub mais.'],
        ['Klassijuhataja saadab kursuse osalejate nimekirja reedel.', 'Osalejate nimekiri …', 'Osalejate nimekiri saadetakse reedel.|Osalejate nimekiri saadetakse välja reedel.'],
        ['Saatke mulle sõnastik e-postiga!', 'Kas te …', 'Kas te saaksite mulle sõnastiku e-postiga saata?|Kas te saaksite saata mulle sõnastiku e-postiga?|Kas te saaksite mulle sõnastiku e-posti teel saata?|Kas te saaksite sõnastiku mulle e-postiga saata?'],
        ['Lapsevanem: „Ma ei tea, kus kursus toimub.”', 'Lapsevanem ütles, et …', 'Lapsevanem ütles, et ta ei tea, kus kursus toimub.|Lapsevanem ütles, et tema ei tea, kus kursus toimub.'],
      ], 'full', 'g_notice'), 'Kui annad edasi täpselt, kes mida ütles, ei sünni sinust uut kuulujuttu.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Kas info on kindel (allikaga) või kuuldud (-vat)? Kas tegija on tähtis?” Ridadel 2 ja 3 ei ole õpilane kindel — seepärast -vat; real 1 on allikas teada — -vat ei ole vaja. Moodul 15: fakt, arvamus ja allikas — siin samad küsimused suuliselt.'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('079_t_chat', 'Naabri sõnumid.', 'Naaber ei saanud koosolekule tulla. Loe tema sõnumeid: mida ta on kuulnud ja mida ta sinult ootab?', 'Naaber', 'Sina', [
        ['A', 'Tere! Kuidas koosolek läks? Ma ei saanud tulla, mul oli õhtune vahetus.'],
        ['B', 'Tere! Läks hästi, tegelikult palju rahulikumalt, kui ma kartsin.'],
        ['A', 'Vestlusgrupis kirjutati, et emakeele tunnid kaotatakse ja et kursus vanematele maksab sada eurot. Kas see on tõsi?'],
        ['B', 'Oota, ma räägin kohe. Osa sellest on vale.'],
        ['A', 'Minu poeg ei saa matemaatikast eesti keeles aru. Ma ei tea, kelle poole pöörduda.'],
        ['B', 'Selle kohta öeldi midagi kasulikku. Tulen kümne minuti pärast sinu juurde.'],
        ['A', 'Aitäh! Ja kas sa saaksid mind ka kursusele kirja panna? Ma ei tea, kuidas seda teha.'],
      ], 'g_read'), 'Naabri sõnumitest näed, millised kuulujutud tuleb faktidega asendada.'), { task: 'R12' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('079_t_retell', 'Räägi naabrile: mis koosolekul tegelikult öeldi.', 'Räägi naabrile (õpetaja) 1–2 minutit, mis koosolekul öeldi ja otsustati: kolm fakti allikaga, üks kuulujutt ümber lükatud ja üks viisakas palve, mille sa koolile tema eest esitad.',
        'Olukord: naaber ei saanud koosolekule tulla ja on vestlusgrupis kuulujutte lugenud; sina olid koosolekul.\nSinu eesmärk: räägi 1–2 minutit nii, et naaber teab, mis on fakt ja mis kuulujutt, ning mida ta saab kohe teha.\nPiirang: ära ütle lihtsalt „kõik on hästi” — anna täpselt edasi, kes mida ütles.',
        'Naabri kaart on õpetajal: tema mured ja üks uus kuulujutt.',
        ['Direktori sõnul …', 'Koosolekul otsustati, et …', 'Vestlusgrupis kirjutati, et …, aga tegelikult …', 'See olevat …, aga ma kontrollin.', 'Usaldusväärne allikas on …', 'Kas sa tahaksid, et ma …?'], ['Aga ma kuulsin, et …', 'Kust sa seda tead?', 'Kas sa saaksid …?']), 'Tulemus: naaber teab fakte ja järgmist sammu, kuulujutt jääb sinu juures pidama.'), { task: 'S16', main: true, level: 4 }),
      'Õpetaja kaart (naaber, töötab vahetustega, poeg 4. klassis). Ütle ükshaaval: 1) „Kas emakeele tunnid tõesti kaovad?” (vale — keele- ja kultuuriõpe algab oktoobris) 2) „Kursus maksab sada eurot?” (vale — tasuta, 20 kohta, registreerimine klassijuhataja kaudu kuni reedeni) 3) Uus kuulujutt: „Kuulsin, et õpiabi on ainult eesti lastele.” (koosolekul seda ei öeldud — õpilane peaks ütlema: „Seda ei öeldud; küsin klassijuhatajalt.”) Õnnestunud, kui õpilane annab kolm fakti allikaga (direktori sõnul …), lükkab ühe kuulujutu ümber, kasutab ühe -vat-vormi kontrollimata info kohta ja sõnastab palve koolile tingivas kõneviisis.'),
      tag(purpose(B.planning('079_t_product', 'Mooduli tulemus: minu B2 tekstimapp.', 'Täida oma tekstimapp: igale reale üks lause oma tekstist tundidest 76–79 ja üks parandus, mida nüüd teisiti teed. Sellest räägid vahehindamisel 1 minuti.', [
        'Kiri omanikule (tund 76): üks lause kahe sidendiga (kuigi …, juhul kui …).',
        'Minu lugu (tund 77): üks lause, mis algab aja või kohaga ja kus tegusõna on teisel kohal.',
        'Arvustus (tund 78): üks lühike lause kesksõna või des-vormiga.',
        'Koosolek (tund 79): üks lause allikaga ja üks viisakas palve.',
      ], 3), 'Tekstimapp jääb sulle: see näitab, mida sa B2 keeles juba teha oskad.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('079_t_more', 'Rollimäng: peata kuulujutt viisakalt', 'Vestlusgrupis kirjutab üks lapsevanem (õpetaja) uue kuulujutu. Vasta talle suuliselt nii, et ta ei solvu: küsi allikat ja anna fakt.', [
        'Kuidas alustad, et ta ei solvu?',
        'Millise fakti ja allika annad?',
        'Mida pakud: kas küsite koos koolilt?',
      ], [120, 180], ['Ma saan aru, et see teeb muret, aga …', 'Kust sa seda kuulsid?', 'Direktori sõnul …', 'Kas me võiksime koos küsida …?']), 'Rahulik vastus peatab kuulujutu kiiremini kui vihane kommentaar.'), { task: 'S13', level: 4 }),
      'Kui aega jääb (12 min). Sina oled ärevil lapsevanem: „Kuulsin, et järgmisest aastast pannakse kaks klassi kokku ja klassis on 36 last!” Kui õpilane küsib allikat: „Üks ema rääkis poes.” Õnnestunud, kui õpilane ei naeruväärista, küsib allikat, eristab kindla info ja kuuldu (-vat) ning pakub koos koolilt küsida.'), 12),
      tag(exitCheck(purpose(B.gaps('079_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sõna õiges vormis.', [
        'Klassijuhataja [sõnul] algab ekskursioon kell kaheksa.',
        'Kuuldavasti [olevat] kooli söökla järgmisel kuul remondis. (olema)',
        'Kas te [saaksite] mulle koosoleku kokkuvõtte saata? (saama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas allikas, kaudne kõne ja viisakas palve on käes.')), {}),
      purpose(B.selfcheck('079_t_self', ['Ma räägin, kust ma infot saan ja kuidas ma seda kontrollin.', 'Ma saan koosolekust aru ja eristan fakti ja kuulujuttu.', 'Ma annan edasi, kes mida ütles: direktori sõnul …, olevat …, otsustati …', 'Ma räägin naabrile 1–2 minutit, mis otsustati, ja esitan viisaka palve.'], 'Edasi antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('079_t_letter', 'Kodus: kokkuvõte neile, kes ei saanud tulla.', 'Kirjuta kodus 160–200 sõna klassi vestlusgruppi või e-kirjana: mis otsustati, kes mida ütles (allikaga), milline kuulujutt ei vasta tõele ja üks viisakas palve koolile. Kui sul last koolis ei ole, kirjuta oma maja, kursuse või töö koosolekust.', 'Head lapsevanemad!', 'Parimate soovidega\n(sinu nimi)', [160, 200]), 'Need, kes ei saanud tulla, teavad sinu kirja järgi täpselt, mis on otsustatud.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('079_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma tekstimapi järgi: milline neljast tekstist oli sulle kõige vajalikum ja mida sa nüüd teisiti teed.', [
        'Milline tekst oli kõige vajalikum ja miks?',
        'Mis on sinu keeles nüüd parem kui mooduli alguses?',
      ], [60, 120]), 'See on vahehindamise sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('079_t_homework', ['1. Kokkuvõte koosolekust, 160–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-080': {
    title: 'Vahehindamine 4 — tunnid 61–80',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Vahehindamine 4, 1. tund: lugemine (60 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Vahehindamine 4, 1.–2. tund: keeleosa ja kuulamine (55 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Vahehindamine 4, 2.–3. tund: kuulamise osa 1, lugemise osa 2b, kirjutamine ja rääkimine (95 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma sooritan proovieksami Harno B2 vormis tundide 61–80 oskustega (teemad: keskkond, ühiskond ja osalemine, meedia ja info, vaba aeg ja kultuur): kuulamine (lühiteated, jutusaade, intervjuu lünkadega, õige või vale), lugemine (valikvastused, väide ja lõik, lühivastused, valiklüngad, lauselüngad), kiri (umbes 140 sõna) ja andmete kokkuvõte (umbes 180 sõna), sõnavõtt oma tekstimapist ja paarisarutelu; igas osas vähemalt 60 %, eesmärk 80 %.',
    // Vahehindamine 4, the second full Harno B2 mock of the course (COURSE_FINAL_SHAPE_B2.md §4: 080 PROOV, all four parts
    // timed with B.examPart), built like 060: reading R1 + R2a (one opinion article), R3, R4 (Lugemine, 60 min); the language
    // part (lessons 61–79: change and result, cause nouns, -mine, concession, connectors, word order, participles and the
    // des-form, mood by function) and listening L2–L4 (Kuulamine, 15 + 40 min); L1, R2b, writing W1 + W2a and speaking S1 + S2
    // (80 + 20 min). Own texts on the areas of modules 13–16 (environment, society and taking part, media and sources, free
    // time and culture); real facts with their sources; timed by the Harno part headers (timeEstimate.js harnoTimedMinutes).
    discover: [
      B.tip('080_d_how', 'Vahehindamine: lugemine (eksami vormis, 60 minutit)', 'Vahehindamine 4 on täielik proovieksam Harno B2 vormis ja kordab tunde 61–80. Esimeses osas on lugemine, siis keeleosa ja kuulamine, lõpuks kirjutamine ja rääkimine. Tee kõik ilma sõnaraamatuta. Läbitud: igas osas vähemalt 60 %, eesmärk 80 %.', 'full'),
      tag(B.vocab('080_d_vocab', 'Tunnid 61–79: sõnad, mis aitavad', ['vaba aeg — свободное время', 'kättesaadav — доступный', 'osalema — участвовать', 'vabatahtlik — доброволец', 'huviring — кружок', 'takistus — препятствие', 'kuulujutt — слух', 'allikas — источник', 'tingimus — условие', 'arvustus — отзыв'], '2'), { topic: ['huviring'] }),
      PART('080_d_rpart', 'R', { minutes: 60, points: 43, tasks: 5, note: 'Lugemisosa Harno B2 vormis: osa 1 (7), osa 2a (8), osa 3 (12) ja osa 4 (8) siin, osa 2b (8) kirjutamise lehe alguses — kokku 43 punkti. Eesmärk on vähemalt 35 punkti (80 %).' }),
      B.reading('080_d_read', 'Lugemine: arvamusartikkel.', 'Loe arvamusartiklit vaba aja kohta ja vasta kõigepealt kahele küsimusele. Lugemise osad 1 ja 2a käivad sama teksti kohta.', 'Vaba aeg — luksus või kõigi õigus?', [
        '**A** Kui küsida inimestelt, mida nad vabal ajal teevad, kuuleme sageli lühikest vastust: „Puhkan.” Selle sõna taga võib olla väga erinev elu. Ühele tähendab puhkus diivanit ja telefoni, teisele kooriproovi, kolmandale metsas kõndimist või ujulas käimist. Neljas ei puhka üldse, sest tal on kaks tööd ja kolm last. Minu arvates ei ole küsimus selles, kas vaba aeg peab olema kasulik, vaid selles, kas igaühel on üldse võimalus valida.',
        '**B** Eesti on väike riik, kus kultuurisündmusi on palju. Viljandi pärimusmuusika festivalil oli 2025. aastal nelja päevaga umbes 38 000 külastust ja laulupeol astuvad üles kümned tuhanded lauljad ja tantsijad. Suvel ei jõua keegi kõike näha. Samal ajal on paljudes väikestes kohtades õhtuti kinni nii raamatukogu kui ka spordisaal, sest neil ei ole töötajaid ega raha. Rikkalik valik pealinnas ei tähenda, et valik oleks olemas ka kahesaja elanikuga külas, kust viimane buss väljub kell kuus.',
        '**C** Teine takistus on raha. Pilet, trenn ja huviring maksavad ning pere, kus on kolm last, peab arvestama iga eurot. Kuigi paljud omavalitsused toetavad laste huviharidust, ei kata toetus alati kõike: vaja on ka varustust, sõitu ja vanema aega. Jalgpallisaapad, suusad või viiul võivad maksta rohkem kui terve aasta trenn. Seetõttu jääb osa lapsi koju mitte sellepärast, et neil puudub huvi, vaid sellepärast, et vanemad ei jõua maksta või viia.',
        '**D** Kolmas takistus on nähtamatu: harjumus ja keel. Uustulnukas ei tea sageli, kuhu minna, ja kardab, et ei saa aru. Sotsiaalministeeriumi analüüsi järgi tegi 2024. aastal vähemalt korra vabatahtlikku tööd umbes veerand Eesti elanikest, kuid viimastel aastatel saabunud sisserändajatest ainult 15 protsenti. Ometi on just ühine tegevus — talgud, koor, spordiklubi — koht, kus keel ja sõbrad tulevad otsekui iseenesest.',
        '**E** Mõni ütleb, et vaba aeg on igaühe enda asi ja riik ei pea sellesse sekkuma. Ta lisab, et kes tahab, see leiab alati aega ja raha. Selles on tõtt: kedagi ei saa sundida kooris laulma ega matkama. Kuid ühiskond maksab ka tegemata jätmise eest. Ujumine on hea näide. Koolides on ujumise algõpe kohustuslik, ometi läbib ujumise testi ainult umbes pool õpilastest, sest ujula on paljudest koolidest kaugel. Laps, kes ei oska ujuda, on suvel järve ääres ohus, ja see ei ole enam ainult tema pere mure. Sama kehtib üksildase eaka kohta, kes ei käi kuskil ja jääb haigeks kodus, kus keegi teda ei märka.',
        '**F** Mida siis teha? Lahendused ei pea olema kallid. Esiteks võiks vaba aja võimalused olla nähtavad: üks lihtne kalender, kus on kirjas kõik valla tasuta üritused ja ringid, soovi korral ka vene ja inglise keeles. Teiseks võiksid kool, raamatukogu ja spordiklubi kasutada sama maja ja sama bussi, nii et lapsel ei oleks vaja pärast tunde linna sõita. Kolmandaks tasuks toetada neid, kes korraldavad vabatahtlikult: ilma nendeta ei toimuks paljusid külapäevi ega võistlusi. Neljandaks võiks iga uustulnuk saada esimesel aastal kutse mõnda ringi või klubisse koos inimesega, kes teda seal ootab.',
        '**G** Vaba aeg ei ole luksus, mida saab endale lubada alles siis, kui kõik muu on tehtud. See on aeg, mil inimene puhkab, õpib ja leiab teised inimesed. Just seal sünnib usaldus, mida ükski seadus ei loo. Kui me tahame, et kõik tunneksid end Eestis kodus, peab ka vaba aeg olema kõigile kättesaadav — mitte ainult neile, kellel on raha, auto ja julgust.',
        'Allikas: autori arvamus; faktid: ERR (Viljandi folk, 2026; ujumisoskus, 2026), Sotsiaalministeerium, „Vabatahtlikud ja vabatahtlikkus Eestis” (2026, Eesti tööjõu-uuring 2024).',
      ].join('\n\n'), [
        ['Mis on autori arvates vaba aja juures kõige tähtsam küsimus?', 'kas igaühel on võimalus valida|võimalus valida|kas kõigil on võimalus valida'],
        ['Miks on sinu arvates vaba aeg mõnele kättesaadav ja teisele mitte? Mida arvad, mis sinu kodukohas aitaks? Too näide.'],
      ]),
      tag(B.choice('080_d_mc', 'Lugemine 1: valikvastused (7 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus.', [
        ['Mida tahab autor lõigus A näidata erinevate puhkajate näitega?', 'et „puhkus” tähendab eri inimestele eri asju', 'kritiseerida inimesi, kes vaatavad telefoni', 'kiita koorilauljaid', 'selgitada, kuidas õigesti puhata'],
        ['Mida tahab autor öelda lõigu B viimase lausega?', 'suur valik pealinnas ei aita väikese küla elanikku', 'külades on rohkem üritusi kui linnas', 'bussid sõidavad külla liiga sageli', 'festivalid peaksid toimuma külades'],
        ['Miks jääb lõigu C järgi osa lapsi huviringist välja, kuigi neil on huvi?', 'vanemad ei jõua maksta või last viia', 'lastel ei ole huvi', 'omavalitsused keelavad huviringid', 'huviringid on ainult täiskasvanutele'],
        ['Mida näitab lõigus D toodud võrdlus uustulnukate ja teiste elanike vahel?', 'uustulnukad osalevad ühises tegevuses harvem kui teised elanikud', 'uustulnukad teevad vabatahtlikku tööd kõige rohkem', 'vabatahtlik töö on Eestis keelatud', 'kõik elanikud teevad vabatahtlikku tööd'],
        ['Miks toob autor lõigus E näite ujumisest?', 'näidata, et tegemata jätmisel on hind kogu ühiskonnale', 'kiita koolide ujumistunde', 'soovitada lastel järve äärde mitte minna', 'tõestada, et ujulaid on piisavalt'],
        ['Milline lõigu F ettepanek vähendab kõige rohkem takistust lastel, kes elavad linnast kaugel?', 'kool, raamatukogu ja klubi kasutavad sama maja ja bussi', 'tasuta kalender kolmes keeles', 'vabatahtlike toetamine', 'uute festivalide korraldamine'],
        ['Mis on autori peamine järeldus artikli viimases lõigus?', 'vaba aeg peab olema kättesaadav kõigile, mitte ainult jõukatele', 'vaba aega tuleb endale lubada alles pärast tööd', 'vaba aeg on igaühe enda mure', 'kõik peaksid kooris laulma'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('080_d_para', 'Lugemine 2a: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Sõit ja varustus maksavad lisaks pileti hinnale. | [C]',
        '2. Inimest ei saa kohustada vaba aega teatud viisil veetma. | [E]',
        '3. Ühine tegevus aitab uustulnukal keelt õppida ja sõpru leida. | [D]',
        '4. Mõnel inimesel ei jää vaba aega üldse. | [A]',
        '5. Info vabadest võimalustest peaks olema ühes kohas. | [F]',
        '6. Kultuurisündmused on riigis ebaühtlaselt jaotunud. | [B]',
        '7. Vaba aeg aitab inimesel tunda end osana ühiskonnast. | [G]',
        '8. Paljud üritused sõltuvad inimestest, kes töötavad tasuta. | [F]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('080_d_cloze', 'Lugemine 3: pane sõna õigesse vormi (12 punkti).', 'Loe kirja. Kirjuta lünka sobiv sõna: sulgudes on sõna algvorm või vihje, mida lause vajab.', 'Ettepanek raamatukogule', [
        'Tere, lugupeetud raamatukogu juhataja!',
        'Kirjutan teile, [kuna|sest] (põhjus) meie linnaosas ei ole kohta, kus eesti keelt õppivad täiskasvanud saaksid vabalt rääkida. [Kuigi|Ehkki] (vastandus) kursusi on palju, jääb vestluse harjutamiseks aega vähe.',
        'Teen ettepaneku korraldada raamatukogus kord nädalas keelekohvik. [Eelmisel] (eelmine) sügisel käisin sarnases keelekohvikus Tartus ja nägin, kui palju see aitab. Osalejad [olid] (olema, minevik) väga erineva taustaga, kuid kõik rääkisid ainult eesti keeles.',
        'Kohvikut juhiks vabatahtlik, eesti keelt emakeelena [rääkiv] (rääkima, kesksõna) inimene. Juhul kui raamatukogu [nõustub] (nõustuma), võiksime alustada juba veebruaris. Ruumi kasutamise eest [vastutaksin] (vastutama, tingiv, mina) mina.',
        'Mitu naabrit on juba huvi tundnud. Ühe naabri [sõnul] (sõna) võiks kohvik alata kell kuus. Paljud neist töötavad päeval, [mistõttu] (tagajärg) sobiks kõige paremini teisipäeva õhtu. Kohvikus [räägitakse] (rääkima, umbisikuline olevik) igal korral ühel teemal: näiteks vaba aeg, kodu või tervis.',
        'Kohtudes [harjutame] (harjutama, meie) ka viisakaid väljendeid. [Oleksin] (olema, tingiv, mina) väga tänulik, kui saaksite mulle vastata kahe nädala jooksul.',
        'Lugupidamisega\nkeelekursuse õppija',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('080_d_sent', 'Lugemine 4: lause lünka (8 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Minu esimene laulupidu', [
        'Kolisin Eestisse viis aastat tagasi ja laulupeost teadsin ainult seda, mida olin näinud televiisorist. Mulle tundus see kauge ja natuke võõras. [[Arvasin, et see on pidu ainult neile, kes on siin sündinud.]] Kolleeg aga ütles, et pean seda Eesti traditsiooni vähemalt korra oma silmaga nägema.',
        'Esimesel suvel ma ei läinud. Töötasin vahetustega ja piletid olid kallid. [[Teisel korral ei olnud mul enam vabandusi.]] Kolleeg ostis meile kahele piletid ja ütles, et võtab mu lihtsalt kaasa.',
        'Lauluväljakule jõudes nägin, kui palju rahvast seal oli. Inimesed istusid tekkidel, sõid võileibu ja ajasid juttu. [[Keegi ei kiirustanud, kuigi rahvast oli kümneid tuhandeid.]] Kolleeg selgitas mulle, et paljud koorid on harjutanud terve aasta.',
        'Kui esimene suur koor laulukaare alla tuli, jäi väljak vaikseks. [[Mõne sekundi pärast hakkasid kõik korraga laulma.]] Ma ei mõistnud sõnu, aga tundsin, kuidas mul tõusid ihukarvad püsti.',
        'Ühel hetkel märkasin, et minu kõrval istuv vanem naine nuttis. Küsisin vaikselt, kas kõik on korras. [[Ta naeratas ja ütles, et nutab igal laulupeol ühe ja sama laulu ajal.]] Hiljem sain teada, et see laul on paljude eestlaste jaoks väga tähtis.',
        'Õhtul koju sõites ei rääkinud me kolleegiga peaaegu üldse. Mõlemad mõtlesime oma mõtteid. [[See vaikus ei olnud piinlik, vaid hea.]] Kodus otsisin üles laulu sõnad ja tõlkisin need sõnaraamatuga.',
        'Järgmisel sügisel astusin oma linna segakoori. Alguses kartsin, et ei oska noote ega hääldust. [[Dirigent ütles, et kõige tähtsam on tulla ja kuulata.]] Esimesel proovil laulsin peaaegu sosinal.',
        'Nüüd harjutame juba järgmiseks peoks. Kas ma jõuan laulukaare alla, ei tea ma veel. [[Aga ma tean, et seekord ei ole ma enam ainult pealtvaataja.]] Ja seda tunnet ei saa televiisorist.',
      ], ['Pärast pidu otsustasin, et ma laulupeole enam kunagi ei lähe.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('080_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas vaba aeg peab olema kõigile kättesaadav? Kirjuta 3–4 lauset: üks autori mõte allikaga (autori sõnul …), sinu arvamus, üks takistus ja näide, kuidas sinu kodukohas osaletakse.', [3, 4], ['autori sõnul', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening L2–L4 in Harno B2 form
    practice: [
      B.tip('080_p_how', 'Vahehindamine: keeleosa ja kuulamine (55 minutit)', 'Kõigepealt keeleosa (15 minutit): parandad päris sõnumeid ja ütled mõtte teisiti. Siis kuulamine nagu Harno B2 eksamil: jutusaadet ja intervjuud kuuled kaks korda, intervjuud kolmandat korda õige-vale väidete jaoks. Kuulamise osa 1 (lühiteated, kuuled üks kord) on viimase lehe alguses.', 'full'),
      B.tip('080_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on laused tundidest 61–79. Paranda ja ütle teisiti nii, et lugeja saab sinust aru.', 'full'),
      B.errorfix('080_p_fix', 'Keeleosa A: paranda enne saatmist (6 punkti).', 'Sõber palus, et vaataksid tema laused enne saatmist üle. Igas lauses on üks viga: kirjuta lause õigesti.', [
        ['Kuigi üüritav korter on väike, aga see on väga valge ja vaikne.', 'Kuigi üüritav korter on väike, on see väga valge ja vaikne.'],
        ['Pere kasvas. Seetõttu me üürime nüüd suuremat korterit.', 'Pere kasvas. Seetõttu üürime me nüüd suuremat korterit.|Pere kasvas. Seetõttu üürime nüüd suuremat korterit.'],
        ['Kui ma jõudsin koju, ma helistasin emale.', 'Kui ma koju jõudsin, helistasin ma emale.|Kui ma koju jõudsin, helistasin emale.'],
        ['Kassast ostud pilet kehtib kaks tundi.', 'Kassast ostetud pilet kehtib kaks tundi.'],
        ['Direktor sõnul algab kursus novembris.', 'Direktori sõnul algab kursus novembris.'],
        ['Vaatamata vihm tulid talgutele peaaegu kõik.', 'Vaatamata vihmale tulid talgutele peaaegu kõik.'],
      ]),
      B.transformation('080_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Kirjuta iga lause mõte ümber, kasutades sulgudes antud sõna või vormi.', [
        ['Mul on koer. Üürileandja on sellega nõus.', 'kuigi', 'Kuigi mul on koer, on üürileandja sellega nõus.'],
        ['Ma mõistsin seda alles kevadel.', 'Alles kevadel …', 'Alles kevadel mõistsin ma seda.|Alles kevadel mõistsin seda.'],
        ['Kui ma ujusin, mõtlesin homsele tööle.', 'des-vorm', 'Ujudes mõtlesin homsele tööle.|Ujudes mõtlesin ma homsele tööle.'],
        ['Naabrid kuulsid: „Prügivedu läheb kallimaks.” (ei ole kindel)', 'kaudne kõneviis', 'Prügivedu minevat kallimaks.'],
        ['Saatke mulle koosoleku kokkuvõte!', 'viisakas palve', 'Kas te saaksite mulle koosoleku kokkuvõtte saata?|Kas te saaksite saata mulle koosoleku kokkuvõtte?|Kas saaksite mulle koosoleku kokkuvõtte saata?'],
        ['Kuna tuli tugev torm, jäi kontsert ära.', 'tõttu', 'Tugeva tormi tõttu jäi kontsert ära.'],
      ]),
      PART('080_p_lpart', 'L', { minutes: 40, points: 34, tasks: 4, note: 'Kuulamisosa Harno B2 vormis: osad 2–4 siin, osa 1 viimase lehe alguses — neli ülesannet, 34 punkti. Eesmärk on vähemalt 28 punkti (80 %).' }),
      tag(B.examListen('080_p_show', 'Kuulamine 2: jutusaade „Kas raamatukogu on veel vajalik?” (6 punkti).', 'Kuula jutusaadet kaks korda. Enne esimest kuulamist loe küsimused läbi. Vali igale küsimusele üks õige vastus kolmest.', 'choice', [
        'Saatejuht: Tere! Kui kõik raamatud on telefonis, kas raamatukogu on siis veel vajalik? Stuudios on väikelinna raamatukogu juhataja Maie ja tudeng Karel, kes ütleb, et ei ole raamatukogus käinud kümme aastat. Karel, miks?',
        'Karel: Ausalt öeldes ei ole mul põhjust. E-raamatud laenutan telefoni ja õppimiseks vajaliku leian internetist. Raamatukogu on minu jaoks koht, kus käis mu vanaema.',
        'Maie: Aga kas tead, kus sa need e-raamatud laenutad? Raamatukogu kaudu. Paljud ei märka, et ka telefonis on raamatukogu teenus.',
        'Saatejuht: Maie, kes teie juures praegu käivad?',
        'Maie: Kõige rohkem eakad ja lapsed. Pärast kooli tulevad lapsed, kes ootavad vanemaid. Hommikuti käivad emad väikeste lastega lugemistunnis. Ja üha rohkem tuleb inimesi, kes vajavad abi e-teenustega.',
        'Karel: Seda ma ei teadnud. Kas see tähendab, et raamatukogu on tegelikult rohkem nagu kogukonnakeskus?',
        'Maie: Täpselt. Meie juures on ka keelekohvik, kus eesti keelt õppivad täiskasvanud räägivad kord nädalas. Eelmisel aastal käis seal üle kolmekümne inimese.',
        'Saatejuht: Karel, kas sa läheksid nüüd sinna?',
        'Karel: Võib-olla. Kui seal oleks vaikne koht, kus õppida, ja internet töötaks hästi, siis küll. Ühiselamus on õhtuti väga lärmakas.',
        'Maie: Tule! Lugemissaal on avatud õhtul kella kaheksani.',
        'Saatejuht: Aitäh mõlemale!',
      ], [
        ['Miks ei ole Karel saatejuhi sõnul kümme aastat raamatukogus käinud?', 'tal ei ole olnud põhjust', 'raamatukogu on kaugel', 'ta ei loe üldse'],
        ['Mida tahab Maie öelda, kui ta küsib, kus Karel e-raamatud laenutab?', 'ka e-raamatud tulevad raamatukogu kaudu', 'e-raamatud on ebaseaduslikud', 'e-raamatud on kallid'],
        ['Kes käivad Maie sõnul raamatukogus hommikuti?', 'emad väikeste lastega', 'tudengid', 'pensionärid lehti lugemas'],
        ['Millise järelduseni jõuab Karel saate keskel?', 'raamatukogu on rohkem nagu kogukonnakeskus', 'raamatukogu tuleks sulgeda', 'raamatukogu on ainult lastele'],
        ['Mitu inimest käis eelmisel aastal keelekohvikus?', 'üle kolmekümne', 'umbes kümme', 'üle saja'],
        ['Mis tingimusel läheks Karel raamatukokku?', 'kui seal oleks vaikne õppimiskoht ja hea internet', 'kui seal oleks kohvik', 'kui seal oleks rohkem e-raamatuid'],
      ], 'g_read'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      tag(B.listening('080_p_listen', 'Kuulamine 3: raadiointervjuu (10 punkti).', 'Kuula intervjuud külapäeva korraldajaga kaks korda. Kirjuta igasse lünka üks või kaks sõna.', [
        'Saatejuht: Tere! Stuudios on Rein Kask, kes korraldab juba kümnendat aastat ühes Lõuna-Eesti külas suvist külapäeva. Rein, kuidas see algas?',
        'Rein: Kümme aastat tagasi suleti meie küla kool. Inimesed hakkasid ütlema, et küla sureb välja. Siis kutsusime kokku kõik, kes tahtsid midagi teha, ja tuli üheksa inimest.',
        'Saatejuht: Ja mis teil nüüd on?',
        'Rein: Külapäev on alati augusti esimesel laupäeval. Eelmisel aastal käis seal umbes neljasada inimest, kuigi külas elab ainult sada kakskümmend.',
        'Saatejuht: Kes seda kõike teevad?',
        'Rein: Ainult vabatahtlikud. Meil on umbes nelikümmend abilist, kõige noorem on kaheteistkümne- ja kõige vanem kaheksakümneaastane. Igaüks teeb seda, mida oskab: üks küpsetab, teine parandab lava, kolmas õpetab lastele vanu mänge.',
        'Saatejuht: Kust tuleb raha?',
        'Rein: Väike toetus tuleb vallast, ülejäänu kogume ise. Pilet maksab viis eurot, lapsed ja pensionärid saavad tasuta. Kõige suurem kulu on helitehnika.',
        'Saatejuht: Mis on olnud kõige raskem?',
        'Rein: Ilm. Kolm aastat tagasi sadas terve päeva vihma ja me pidime kõik vanasse koolimajja kolima. Aga just see päev on paljudele kõige paremini meelde jäänud, sest kõik pidid koos tantsima väikeses saalis.',
        'Saatejuht: Ja kas küla elab?',
        'Rein: Elab. Eelmisel aastal kolis külla kaks uut peret. Üks pere ütles, et otsustas külapäeval, kus nad tahavad elada.',
        'Saatejuht: Aitäh, Rein!',
      ], [
        'Rein korraldab külapäeva juba [kümnendat|10.] aastat.',
        'Kümme aastat tagasi suleti külas [kool|küla kool].',
        'Esimesele koosolekule tuli kokku [üheksa|9] inimest.',
        'Külapäev toimub alati augusti esimesel [laupäeval].',
        'Eelmisel aastal käis külapäeval umbes [nelisada|400] inimest.',
        'Kõige vanem vabatahtlik abiline on [kaheksakümneaastane|80-aastane].',
        'Lisaks valla toetusele koguvad korraldajad ülejäänud raha [ise].',
        'Korraldajate kõige suurem kulu on [helitehnika].',
        'Kolm aastat tagasi tuli vihma tõttu kõik viia vanasse [koolimajja|kooli].',
        'Eelmisel aastal kolis külla elama kaks uut [peret].',
      ], 'g_read'), { task: 'L04', harno: 'L3' }),
      tag(B.truefalse('080_p_tf', 'Kuulamine 4: õige või vale? (12 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Reinu sõnul sai külapäev alguse pärast seda, kui külas suleti kool.', true],
        ['Esimesel koosolekul, kus külapäeva arutati, oli kohal peaaegu kogu küla.', false],
        ['Külapäeval osaleb Reinu sõnul rohkem inimesi, kui külas tegelikult elab.', true],
        ['Külapäeva korraldab igal aastal valla palgaline meeskond koos kooliga.', false],
        ['Vabatahtlike abiliste seas on nii kooliealisi noori kui ka eakaid inimesi.', true],
        ['Vabatahtlikud abilised teevad külapäeval sama tööd, mida neile ette öeldakse.', false],
        ['Külapäeva kulud maksab vald oma eelarvest täies ulatuses.', false],
        ['Lapsed ja pensionärid ei pea külapäeva pileti eest midagi maksma.', true],
        ['Korraldajate kõige suurem kulu on toit, mida külalistele pakutakse.', false],
        ['Vihmane külapäev kolm aastat tagasi jäi paljudele eriti hästi meelde.', true],
        ['Vihmase ilma tõttu jäi kolm aastat tagasi tantsimine sootuks ära.', false],
        ['Üks külla kolinud pere otsustas oma uue elukoha just külapäeval.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.writing('080_p_say', 'Kirjuta kuuldust (5–6 lauset).', 'Võta intervjuu kokku: kuidas külapäev algas, kes seda teevad ja mis on olnud raske. Kasuta üht allikaga lauset (Reinu sõnul …) ja kirjuta, kas sinu kodukohas oleks sellist päeva vaja.', [5, 6], ['sõnul', 'vabatahtlik', 'kuigi'], 2),
      B.rubric('080_p_score', 'Minu punktid.', 'Loe kokku oma punktid. Igas osas on vaja vähemalt 60 %.', ['Lugemine (leht 1): osa 1 … / 7, osa 2a … / 8, osa 3 … / 12, osa 4 … / 8 (osa 2b on kirjutamise lehel).', 'Keeleosa: … / 12 (paranda 6, ütle teisiti 6).', 'Kuulamine: osa 2 … / 6, osa 3 … / 10, osa 4 … / 12 (osa 1 on viimase lehe alguses) — kokku koos osaga 1 … / 34.', 'Läbitud: igas osas vähemalt 60 %, eesmärk 80 %.']),
    ],
    // listening part 1, reading part 2b, then writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('080_t_situation', 'Vahehindamine: lühiteated, lugemise osa 2b, kirjutamine ja rääkimine', 'Kõigepealt kuulad kuut lühiteadet (kuulamise osa 1, kuuled üks kord). Siis loed spordikeskuse teadet ja vastad küsimustele (lugemise osa 2b). Seejärel kirjutad spordikeskusele kirja ja kokkuvõtte andmetest ning räägid oma tekstimapist ja arutled paariga.'),
      tag(perClip(B.examListen('080_t_clips', 'Kuulamine 1: kuus lühiteadet (6 punkti).', 'Kuulad kuut lühikest teadet. Iga teadet kuuled ainult üks kord. Vali igale küsimusele üks õige vastus kolmest.', 'choice', [
        'Teadustaja: Esimene teade. Linnaraamatukogu keelekohvik kolib alates jaanuarist teisele korrusele. Kohvik toimub endiselt neljapäeviti kella kuuest seitsmeni. Osalemine on tasuta, kuid palume kõigil huvilistel end eelnevalt raamatukogu kodulehel registreerida, sest kohti on kakskümmend.',
        'Teadustaja: Teine teade. Rahvamaja otsib vabatahtlikke jõululaada korraldamiseks. Vaja on abilisi lavale, kohvikusse ja parkimisse. Abiliste koosolek on järgmisel teisipäeval kell kuusteist. Kõik abilised saavad laadapäeval tasuta lõunasöögi.',
        'Teadustaja: Kolmas teade. Ilmateenistus teatab: nädalavahetusel on oodata tugevat lumesadu ja tuult. Linna jõulukontsert kolitakse seetõttu kesklinna väljakult kontserdimajja. Juba ostetud piletid kehtivad uues kohas.',
        'Teadustaja: Neljas teade. Spordikeskuse ujula on remondi tõttu suletud kuni veebruari lõpuni. Sel ajal toimuvad laste ujumistunnid naaberlinna ujulas. Kooli buss väljub spordikeskuse eest iga päev kell neliteist.',
        'Teadustaja: Viies teade. Korteriühistu tuletab omanikele ja üürnikele meelde: prügimaja uks lukustatakse alates esmaspäevast. Uue võtme saab kätte juhatuse esimehe käest neljapäeval kella viiest seitsmeni. Võtme eest tuleb maksata viis eurot.',
        'Teadustaja: Kuues teade. Linnavalitsus hoiatab: sotsiaalmeedias levib kuulujutt, et linnaujula suletakse alatiseks. See ei vasta tõele. Ujula avatakse pärast remonti märtsis ja hinnad jäävad samaks.',
      ], [
        ['Mis muutub linnaraamatukogu keelekohvikus teate järgi alates jaanuarist?', 'see toimub teisel korrusel', 'see muutub tasuliseks', 'see toimub teistel päevadel'],
        ['Mida saavad teate järgi kõik rahvamaja jõululaada vabatahtlikud abilised?', 'tasuta lõunasöögi', 'tasuta pileti kontserdile', 'väikese palga'],
        ['Mis juhtub ilmateenistuse hoiatuse tõttu linna jõulukontserdiga?', 'see toimub kontserdimajas', 'see jääb sootuks ära', 'see lükatakse kevadesse'],
        ['Kus toimuvad spordikeskuse teate järgi laste ujumistunnid remondi ajal?', 'naaberlinna ujulas', 'spordikeskuse saalis', 'kooli võimlas'],
        ['Mida peab korteriühistu elanik tegema, et prügimaja uut võtit saada?', 'minema neljapäeval esimehe juurde', 'kirjutama juhatusele e-kirja', 'ootama kirja postkastis'],
        ['Mida ütleb linnavalitsus sotsiaalmeedias leviva kuulujutu kohta linnaujulast?', 'ujula avatakse pärast remonti märtsis', 'ujula suletakse alatiseks', 'hinnad tõusevad märtsis'],
      ], 'g_read', 1)), { task: 'L01', harno: 'L1' }),
      B.text('080_t_notice', 'Lugemine 2b: spordikeskuse teade', 'Head külastajad!\n\nSpordikeskuse ujula suletakse 2. detsembrist kuni veebruari lõpuni. Remondi käigus vahetatakse basseini veepuhastussüsteem, mis on töötanud üle kahekümne aasta, ja uuendatakse riietusruumid. Saun ja jõusaal jäävad avatuks tavapärase graafiku järgi.\n\nRemondi ajal on ujula kuukaardid peatatud. Kaardi kasutamata päevad lisatakse automaatselt pärast ujula avamist, seega ei pea te selle pärast meile kirjutama. Kui soovite raha tagasi, esitage avaldus infoletis või kodulehel kuni 15. detsembrini.\n\nLaste ujumistunnid jätkuvad naaberlinna ujulas. Lapsi viib sinna spordikeskuse buss, mis väljub iga päev kell neliteist meie maja eest. Bussisõit on tasuta, kuid lapsevanem peab lapse eelmisel päeval registreerima. Alla seitsmeaastane laps sõidab bussis ainult koos täiskasvanuga.\n\nTäiskasvanute vesiaeroobika toimub remondi ajal saalis ilma veeta. Treener kinnitas, et harjutused sobivad ka algajatele ja eakatele.\n\nUus ujula avatakse märtsis. Avamispäeval on ujumine kõigile tasuta. Vabandame ebamugavuste pärast ja täname kannatlikkuse eest!\n\nSpordikeskuse juhatus'),
      tag(B.table('080_t_ask', 'Lugemine 2b: lühivastused (8 punkti).', 'Vasta teate järgi igale küsimusele 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Mida vahetatakse remondi käigus basseinis? | [veepuhastussüsteem/veepuhastussüsteemi/puhastussüsteem]',
        'Mis jääb remondi ajal tavapäraselt avatuks? | [saun ja jõusaal/jõusaal ja saun]',
        'Mis juhtub kuukaardi kasutamata päevadega? | [lisatakse/lisatakse automaatselt/need lisatakse]',
        'Mis kuupäevani saab esitada avalduse raha tagasi saamiseks? | [15. detsembrini/viieteistkümnenda detsembrini]',
        'Kus toimuvad remondi ajal laste ujumistunnid? | [naaberlinna ujulas/naaberlinnas]',
        'Millal peab lapsevanem lapse bussi registreerima? | [eelmisel päeval/päev varem]',
        'Kus toimub remondi ajal vesiaeroobika? | [saalis/saalis ilma veeta]',
        'Mis on ujula avamispäeval kõigile tasuta? | [ujumine]',
      ], 'g_read'), { task: 'R15', harno: 'R2b' }),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's four texts, collected in 079
      B.planning('080_t_product', 'Mooduli tulemus: minu B2 tekstimapp.', 'Võta oma tekstimapp tunnist 79 ja kontrolli igal real üht lauset: kas see on nüüd õige ja selge?', ['Kiri omanikule (tund 76): sidendid kuigi, juhul kui, seetõttu.', 'Minu lugu (tund 77): tegusõna teisel kohal, rõhk alguses või lõpus.', 'Arvustus (tund 78): kesksõna või des-vorm.', 'Koosoleku kokkuvõte (tund 79): allikas, -vat ja viisakas palve.']),
      PART('080_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja kokkuvõtte eest 15 punkti; eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('080_t_letter', 'Kirjutamine 1: kiri spordikeskusele (umbes 140 sõna).', 'Sinu laps (või sugulase laps) on kuueaastane ja peab ujumistundi sõitma bussiga. Kirjuta juhatusele: mis sulle teates muret teeb, kaks küsimust ja konkreetne ettepanek viisaka palvena.', 'Lugupeetud juhatus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      B.chart('080_t_data', 'Kes tegi 2024. aastal vabatahtlikku tööd? (% rühmast, vähemalt korra aastas)', { kind: 'bar', unit: '%', series: '2024', rows: ['Eesti elanikud kokku | 25', 'Eestisse tagasi pöördunud inimesed | 32', '2020–2024 saabunud sisserändajad | 15'], source: 'Sotsiaalministeerium, „Vabatahtlikud ja vabatahtlikkus Eestis. Hetkeolukord ja tulevikuväljavaated” (2026), Eesti tööjõu-uuring 2024' }),
      tag(B.writing('080_t_summary', 'Kirjutamine 2: kokkuvõte ja kommentaar (umbes 180 sõna).', 'Kirjuta keelekursuse uudiskirja joonise põhjal kokkuvõte: mida arvud näitavad, kaks olulisemat erinevust rühmade vahel ning sinu kommentaar koos näitega, miks uustulnukad osalevad harvem ja mis võiks aidata.', [12, 14], ['võrreldes', 'samas', 'protsenti', 'seetõttu', 'kokkuvõttes'], 4), { task: 'W15', harno: 'W2a' }),
      PART('080_t_spart', 'S', { minutes: 20, points: 25, tasks: 2, note: 'Rääkimine Harno B2 vormis. Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('080_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: keelekursuse seminaril tutvustab igaüks oma B2 tekstimappi. Mõtle 2 minutit oma tekstimapi järgi, räägi 1 minut, siis vasta küsimustele.', ['Millised neli teksti on sinu mapis ja kellele need on kirjutatud?', 'Milline tekst oli sulle päriselt kõige vajalikum? Miks?', 'Mida sa oma keeles nüüd teisiti teed?', 'Paariline küsib: „Kuidas sa eristad fakti ja kuulujuttu?”', 'Kas kirjutamine on sinu arvates tähtsam kui rääkimine? Põhjenda.', 'Mida peaks keelekursus tegema, et õppijad julgeksid rohkem rääkida? Põhjenda.'], [90, 180], ['Tahaksin tutvustada oma tekstimappi …', 'Kõige vajalikum oli mulle …, sest …', 'Kui varem kirjutasin …, siis nüüd …', 'Seepärast soovitan …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('080_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas muuseumid ja kontserdid peaksid olema lastele ja pensionäridele tasuta? Argumendid: piletihind hoiab paljusid peresid kultuurist eemal; laps, kes käib muuseumis, käib seal ka täiskasvanuna; pensionäridel on aega, kuid sageli mitte raha. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas muuseumid ja kontserdid peaksid olema lastele ja pensionäridele tasuta? Argumendid: muuseumid vajavad piletiraha, et näitusi teha; tasuta asja ei hinnata; parem on soodushind või üks tasuta päev kuus. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks minu linnas …', 'Kuigi …, …'], ['Ma ei ole päris nõus, sest …', 'Juhul kui …, siis …', 'Kas võiksime kokku leppida, et …?', 'Ühine seisukoht võiks olla …']), { task: 'S17', harno: 'S2' }),
      B.rubric('080_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi punktid. Igas osas on vaja vähemalt 60 %.', ['Kuulamine 1: … / 6 (lisa kuulamise lehe punktidele).', 'Lugemine 2b: … / 8 (lisa lugemise lehe punktidele).', 'Kiri: mure ja põhjus, kaks küsimust, konkreetne ettepanek, viisakas palve, sobiv toon, umbes 140 sõna (10 punkti).', 'Kokkuvõte: üldistus andmetest, kaks erinevust numbritega, põhjendatud kommentaar näitega, umbes 180 sõna (15 punkti).', 'Sõnavõtt: neli teksti ja põhjendus 1 minutiga, vastus küsimustele (10 punkti).', 'Arutelu: argumendid näidetega, reageerimine paarilisele, ühine seisukoht (15 punkti).']),
      B.selfcheck('080_t_self', ['Lugemine: … / 43 punkti; kuulamine: … / 34 punkti.', 'Kirjutamine: … / 25 punkti (kiri 10, kokkuvõte 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Ma tean, mida enne kursuse viimast moodulit korrata.'], 'Vahehindamine 4 tehtud'),
    ],
  },
}, {
  'b1b2-076': 'KIRJ L→W', 'b1b2-077': 'RÄÄK R→S', 'b1b2-078': 'LUGE R→W', 'b1b2-079': 'PROJ L→S', 'b1b2-080': 'PROOV',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 076
  '076_d_radio': [
    'Tiina: „pakkumisel umbes seitse protsenti vähem kui eelmisel aastal”.',
    'Tiina: „nelisada kuni kuussada viiskümmend eurot kuus”.',
    'Tiina: „kes sa oled, miks sa just seda korterit tahad ja kas sinuga on lihtne”.',
    'Tiina: „Sellisele kirjale omanik tavaliselt ei vastagi.”',
    'Tiina: „Ütle see kohe ausalt ja lisa lahendus.”',
    'Tiina: „säästab ausus mõlema aega”.',
    'Tiina: „Kirjuta nagu inimene, mitte nagu ankeet.”',
  ],
  '076_p_link': [
    'Vastandus: kuigi + kõrvallause; pealause algab tegusõnaga (on), ilma sõnata „aga”.',
    'Põhjus lause alguses: kuna …, pealause algab tegusõnaga (on).',
    'Tingimus: juhul kui …, pealause algab tegusõnaga (saadan).',
    'Tagajärg samas lauses: koma + mistõttu.',
    'Pärast seetõttu tuleb tegusõna kohe (sobib).',
    'Aeg ja vastandus: samal ajal kui …, pealause algab tegusõnaga (elan).',
    'Vastandus: ehkki = kuigi; pealause algab tegusõnaga (sobib).',
  ],
  '076_t_draft': [
    'Põhjus: otsin kodu — sellepärast kirjutan (kuna).',
    'Tagajärg: töö on lähedal, seega sobib asukoht (mistõttu).',
    'Vastandus: noor koer, aga rahulik (kuigi).',
    'Tingimus: kui soovite, võite tutvuda (juhul kui).',
    'Samal ajal: otsin kodu ja elan õe juures (samal ajal kui).',
    'Tagajärg uues lauses: elan ajutiselt, seega saan kiiresti kolida (seetõttu + tegusõna).',
    'Vastandus: soovitust paberil ei ole, aga telefoninumber on (ehkki).',
  ],
  '076_t_exit': [
    'Pärast kuigi-lauset algab pealause tegusõnaga: meeldis.',
    'Tingimuse sidend: juhul kui.',
    'Tagajärg uues lauses: seetõttu (või seega) ja kohe tegusõna (ei vaja).',
  ],
  // 077
  '077_d_facts': [
    '1. lõik: „Kohalikud ei pane neid tähelegi” ja tavad, „mida keegi ette ei ütle”.',
    '2. lõik: „Sellisel saunal puudub korsten” — ruum on enne pesemist suitsu täis.',
    '2. lõik: „Võrumaa suitsusauna traditsioon kanti 2014. aastal UNESCO … nimekirja.”',
    '3. lõik: „Linnad jäävad nii tühjaks, et mõni uustulnukas arvab, et midagi on juhtunud.”',
    '3. lõik: „vana uskumuse järgi toob see õnne ja tervist”.',
    '4. lõik: „alles laulukaare all said nad aru, miks on laul eestlastele nii tähtis”.',
    '5. lõik: „Esimesel aastal tundub see paljudele külmusena. Hiljem harjutakse …”',
  ],
  '077_p_order': [
    'Ajamäärus alguses → tegusõna teisel kohal: nägin (ma).',
    'Ajamäärus alguses → tegusõna kohe järgmisena: sõitsime.',
    'Kui-lauses on tegusõna lõpus (astusin), pealause algab tegusõnaga (seisid).',
    'Rõhutatud „alles kuu aega hiljem” alguses → tegusõna kohe: sain.',
    'Kohamäärus alguses → kohe ei + tegusõna (ei rääkinud); tähtis info (keegi) lõpus.',
    'Kuigi-lause ees → pealause algab tegusõnaga: hakkasin.',
    'Kui-lauses on tegusõna lõpus (jõudsime), pealause algab tegusõnaga (oli).',
  ],
  '077_t_story': [
    'Olga: „Kuna ma ei tahtnud viisakusest keelduda, ütlesin kohe jah.”',
    'Olga: „ei näinud ma alguses midagi, sest seinad olid täiesti mustad”.',
    'Olga: „mul hakkas kõrvadel nii palav, et istusin kohe põrandale”.',
    'Vanaema: „põrandal ongi kõige parem koht”.',
    'Olga: „Alles hiljem sain aru, et see oli nende peres suur au”.',
    'Olga: „Nüüd käin seal igal talvel.”',
  ],
  '077_t_exit': [
    'Pärast kui-lauset algab pealause tegusõnaga: oli.',
    'Rõhutatud „alles kevadel” alguses → tegusõna kohe: hakkasin.',
    'Ajamäärus alguses → tegusõna teisel kohal: sõitsime.',
  ],
  // 078
  '078_d_match': [
    'F: „Klaaspudelid ja toit on basseinialal keelatud.”',
    'B: „Riided ja jalanõud jäetakse lukustatavasse kappi.”',
    'C: „Enne basseini minekut pestakse end duši all ilma ujumisriieteta.”',
    'E: „Alla kümneaastane laps ujub ainult koos täiskasvanuga.”',
    'A: „Kassast ostetud pilet kehtib kaks tundi.”',
    'D: „Basseinis on ujumismüts kohustuslik” — kõigile, ka lühikeste juustega.',
    'E: „Sügavas osas ujuvad ainult ujuda oskavad inimesed” — algaja jääb madalasse ossa.',
  ],
  '078_p_short': [
    '-tud: mida on tehtud — unustama → unustatud rätik.',
    '-nud: kes on ise midagi teinud — ujuma → ujunud mees.',
    '-tav: mida soovitatakse — soovitatav kursus.',
    '-v: kes teeb praegu — ootama → ootavad inimesed.',
    'des-vorm: samal ajal, tegija on sama (sina) — minnes.',
    'des-vorm: samal ajal, tegija on sama (mina) — ujudes.',
    '-tud (juba ostetud) või -tav (mida ostetakse) — mõlemad sobivad.',
  ],
  '078_t_reviews': [
    'Kaja: „Hommikul kella seitsmest üheksani on vett palju ja inimesi vähe.”',
    'Kaja: „Soojendatud väikeses basseinis on lastega mõnus”.',
    'Andrus: „õhtuti on kõik lukustatavad kapid kinni” — riideid ei ole kuhugi panna.',
    'Andrus: kassas 9 eurot, internetist 7 — vahe on kaks eurot.',
    'Andrus: saun suletakse kell 21, ujula on avatud kella kümneni — üks tund.',
  ],
  '078_t_exit': [
    '-tud: mida treener on kirjutanud — kirjutatud kava.',
    'des-vorm: samal ajal, kui sa oled riietusruumis — olles.',
    '-tud: mõtlema → mõeldud (kellele mõeldud).',
  ],
  // 079
  '079_d_meeting': [
    'Õige: „otsustas Riigikogu kahe tuhande kahekümne teise aasta detsembris”.',
    'Vale: „alustasid juba kahe tuhande kahekümne neljanda aasta sügisel”.',
    'Vale: direktor ütles „Ei ole” — keele- ja kultuuriõpe jätkub.',
    'Õige: „Meie koolis alustame sellega oktoobris.”',
    'Vale: õpiabi on „pärast tunde”.',
    'Õige: „uued sõnad saadetakse koju kakskeelse sõnastikuna”.',
    'Vale: „Ei. Enamik … on eksami juba teinud ja kolm õpetajat õpivad praegu.”',
  ],
  '079_p_report': [
    'Allikas on teada: kelle sõnul (omastav) ja tavaline kõneviis.',
    'Kontrollimata info: kaudne kõneviis -vat (olevat).',
    'Kontrollimata eitus: ei olevat.',
    'Otsus, tegija pole tähtis: umbisikuline otsustati.',
    'Tegija pole tähtis: umbisikuline olevik saadetakse.',
    'Käsk → viisakas palve: Kas te saaksite …?',
    'Kaudne kõne: ütles, et … ta ei tea (isik muutub).',
  ],
  '079_t_exit': [
    'Allikas: kelle sõnul — klassijuhataja sõnul.',
    'Kuuldud, kontrollimata: olevat.',
    'Viisakas palve: tingiv kõneviis saaksite.',
  ],
  // 080
  '080_d_read': [
    '(A): „küsimus … on selles, kas igaühel on üldse võimalus valida”.',
    'Sinu oma vastus: õpetaja vaatab, kas tood näite.',
  ],
  '080_d_mc': [
    '(A): diivan, kooriproov, mets, ujula — „puhkus” on igaühele erinev.',
    '(B): „Rikkalik valik pealinnas ei tähenda, et valik oleks olemas ka … külas.”',
    '(C): „vanemad ei jõua maksta või viia”.',
    '(D): umbes veerand elanikest, sisserändajatest ainult 15 protsenti.',
    '(E): „ühiskond maksab ka tegemata jätmise eest”.',
    '(F): „sama maja ja sama bussi, nii et lapsel ei oleks vaja … linna sõita”.',
    '(G): „mitte ainult neile, kellel on raha, auto ja julgust”.',
  ],
  '080_d_para': [
    '(C): „vaja on ka varustust, sõitu ja vanema aega”.',
    '(E): „kedagi ei saa sundida kooris laulma ega matkama”.',
    '(D): ühine tegevus on „koht, kus keel ja sõbrad tulevad”.',
    '(A): „Neljas ei puhka üldse, sest tal on kaks tööd ja kolm last.”',
    '(F): „üks lihtne kalender, kus on kirjas kõik … üritused ja ringid”.',
    '(B): festival ja laulupidu, aga väikestes kohtades on kõik õhtuti kinni.',
    '(G): „kui me tahame, et kõik tunneksid end Eestis kodus”.',
    '(F): „ilma nendeta ei toimuks paljusid külapäevi ega võistlusi”.',
  ],
  '080_d_cloze': [
    'Põhjus pealause järel: kuna (või sest).',
    'Vastandus: kuigi (ehkki) kursusi on palju, jääb aega vähe.',
    'Millal? alalütlev: eelmisel sügisel.',
    'Mitmuse alus (osalejad) → olid.',
    '-v kesksõna: inimene, kes räägib → rääkiv.',
    'Juhul kui + kindla kõneviisi olevik: nõustub.',
    'Pakkumine tingivas: vastutaksin (vastutama mille eest).',
    'Allikas: kelle sõnul — naabri sõnul.',
    'Tagajärg: töötavad päeval, mistõttu sobib õhtu.',
    'Tegija pole tähtis, plaan: umbisikuline olevik räägitakse.',
    'des-vormi ja pealause tegija on sama (meie): harjutame.',
    'Viisakas palve: oleksin tänulik, kui …',
  ],
  '080_d_sent': [
    'Võõras pidu → arvasin, et see on ainult siin sündinutele.',
    'Esimesel suvel ei läinud → teisel korral vabandusi enam ei olnud.',
    'Palju rahvast, kõik rahulikud → keegi ei kiirustanud.',
    'Väljak jäi vaikseks → siis hakkasid kõik laulma.',
    'Küsisin, kas kõik on korras → ta naeratas ja selgitas.',
    'Ei rääkinud peaaegu üldse → vaikus oli hea.',
    'Kartsin, et ei oska → dirigent rahustas.',
    'Ei tea, kas jõuan laulukaare alla → aga ma ei ole enam pealtvaataja. Üle jääb „ei lähe enam kunagi”, mis on loo vastand.',
  ],
  '080_p_fix': [
    'Pärast kuigi-lauset ei ole „aga”; pealause algab tegusõnaga (on).',
    'Pärast seetõttu tuleb tegusõna kohe: otsime.',
    'Kui-lauses on tegusõna lõpus (jõudsin), pealause algab tegusõnaga (helistasin).',
    'ostma → ostetud (-tud: mida on ostetud).',
    'kelle sõnul: omastav — direktori.',
    'vaatamata + alaleütlev: vihmale (tund 64).',
  ],
  '080_p_trans': [
    'Vastandus: kuigi …, pealause algab tegusõnaga.',
    'Rõhutatud „alles kevadel” alguses → tegusõna kohe: mõistsin.',
    'des-vorm: samal ajal, tegija sama — ujudes.',
    'Kontrollimata info: kaudne kõneviis — minevat.',
    'Käsk → viisakas palve tingivas: Kas te saaksite …?',
    'Põhjus nimisõnaga: omastav ja tõttu (tund 62).',
  ],
  '080_p_show': [
    'Karel: „Ausalt öeldes ei ole mul põhjust.”',
    'Maie: e-raamatud laenutatakse „raamatukogu kaudu”.',
    'Maie: „Hommikuti käivad emad väikeste lastega lugemistunnis.”',
    'Karel: „raamatukogu on tegelikult rohkem nagu kogukonnakeskus”.',
    'Maie: „käis seal üle kolmekümne inimese”.',
    'Karel: „Kui seal oleks vaikne koht, kus õppida, ja internet töötaks hästi, siis küll.”',
  ],
  '080_p_listen': [
    'Rein: „juba kümnendat aastat”.',
    'Rein: „suleti meie küla kool”.',
    'Rein: „tuli üheksa inimest”.',
    'Rein: „augusti esimesel laupäeval”.',
    'Rein: „käis seal umbes neljasada inimest”.',
    'Rein: „kõige vanem kaheksakümneaastane”.',
    'Rein: „ülejäänu kogume ise”.',
    'Rein: „Kõige suurem kulu on helitehnika.”',
    'Rein: „pidime kõik vanasse koolimajja kolima”.',
    'Rein: „kolis külla kaks uut peret”.',
  ],
  '080_p_tf': [
    'Õige: „Kümme aastat tagasi suleti meie küla kool … Siis kutsusime kokku …”',
    'Vale: „tuli üheksa inimest”.',
    'Õige: umbes 400 külastajat, külas elab 120.',
    'Vale: „Ainult vabatahtlikud.”',
    'Õige: noorim on 12-, vanim 80-aastane.',
    'Vale: „Igaüks teeb seda, mida oskab.”',
    'Vale: vallast tuleb väike toetus, ülejäänu kogutakse ise.',
    'Õige: „lapsed ja pensionärid saavad tasuta”.',
    'Vale: „Kõige suurem kulu on helitehnika.”',
    'Õige: „just see päev on paljudele kõige paremini meelde jäänud”.',
    'Vale: „kõik pidid koos tantsima väikeses saalis”.',
    'Õige: „Üks pere ütles, et otsustas külapäeval, kus nad tahavad elada.”',
  ],
  '080_t_clips': [
    'Teade 1: „kolib alates jaanuarist teisele korrusele”.',
    'Teade 2: „Kõik abilised saavad laadapäeval tasuta lõunasöögi.”',
    'Teade 3: „kolitakse … kesklinna väljakult kontserdimajja”.',
    'Teade 4: „toimuvad laste ujumistunnid naaberlinna ujulas”.',
    'Teade 5: „Uue võtme saab kätte juhatuse esimehe käest neljapäeval”.',
    'Teade 6: „Ujula avatakse pärast remonti märtsis.”',
  ],
  '080_t_ask': [
    '„vahetatakse basseini veepuhastussüsteem”.',
    '„Saun ja jõusaal jäävad avatuks”.',
    '„Kaardi kasutamata päevad lisatakse automaatselt”.',
    '„esitage avaldus … kuni 15. detsembrini”.',
    '„Laste ujumistunnid jätkuvad naaberlinna ujulas.”',
    '„lapsevanem peab lapse eelmisel päeval registreerima”.',
    '„vesiaeroobika toimub remondi ajal saalis ilma veeta”.',
    '„Avamispäeval on ujumine kõigile tasuta.”',
  ],
};
