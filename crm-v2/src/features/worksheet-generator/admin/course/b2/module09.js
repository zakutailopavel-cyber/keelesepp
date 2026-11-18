// B2 course (B1 → B2 roadmap), module 9 „Tervis ja eluviis” (b1b2-041…045), stage B1+/B2- (roadmap levelStage).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–7. Module goal (the learner): „Ma oskan oma tervise eest ise hoolt kanda: loen toidusilti,
// küsin apteegis õiget nõu, leian aja liikumiseks ja puhkuseks ning teen endale realistliku muutuse plaani”; module
// product „Minu 8 nädala muutus” (044 Kasuta, the S16 one-minute talk in 045). A themed module (MODULE.theme 'health',
// §7.1 rule 7): every lesson is about health from the learner's own angle, each with its own sub-topic and its own place
// in daily life — the shop, the pharmacy, the evening after work or school, the calendar. Not repeated from earlier
// modules: the doctor's appointment (module 2), sick leave (module 6), children's screen time and the clock change and
// sleep (module 5). No medical advice beyond the official recommendations; every fact has a source on the teacher page.
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 9).
// One format a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   041 facts    „Mida sinu ostukorv sinust räägib?”               health · food label      final negotiate: the family shop (S03)
//   042 infogap  „Kas apteeker teab paremini kui internet?”        health · pharmacy        final advise: an aunt's three worries (S05)
//   043 debate   „Õhtul väsinud: trenn või diivan?”                health · movement, rest  final decide: debate + vote (S17)
//   044 project  „Kaheksa nädalat: üks muutus, mis jääb püsima”    health · habit plan      final present: my 8-week change (S16)
//   045 exam     Kontroll 9 in Harno B2 form + „Minu 8 nädala muutus” as the S1 one-minute talk.
// Grammar line (roadmap module 9: soft advice with the conditional, causality, priorities, plan connectors) by discovery
// and spiralled: cause and effect — tänu millele, mille tõttu, seetõttu, mistõttu, mõjuma millele (041; back in 044's
// plan, 045); soft advice — võiksid, peaksid, tasuks, oleks parem, kui …, soovitaksin, kas sa ei tahaks (042, after
// module 7's 033 „võiksid”; back in the 043 debate and 045); preference and compromise — pigem … kui …, selle asemel et
// + da, mida …, seda … (043; back in 044 and 045); purpose and result — selleks et + da, et + conditional, muutuma /
// saama + translative (044, the change of state of the old module; back in 045). Level step-up towards B2-: homework texts
// 150–180 words (module 7: 120–150), the 044 plan as a coherent 160–180-word text (roadmap), nominal causes (une tõttu).
// The one long text of the module is the topic opener (041 station 2, ≈ 400 words, after a 12-minute hook). The course's
// cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js and the archetypes (LUGU, KUUL, AVAS, PROB, EKS). The v2 storyline
// version (Jaan's school menu, Markus's stress, the sugar tax) is in git history before 2026-11-19.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 9. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

// theme: a themed module may give every lesson its theme's topic, each with its own sub-topic (§7.3, v4Tasks.test.js)
export const MODULE = { id: 'b1b2-module-09', course: 'b2', title: 'Tervis ja eluviis', level: 'B2-', design: 'v3-stations', template: 'v4', theme: 'health' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-041': {
    title: 'Mida sinu ostukorv sinust räägib?',
    phases: grammar('Keel: põhjus ja tagajärg — tänu millele, mille tõttu, seetõttu, mistõttu, mõjuma millele'),
    format: 'facts',
    topic: 'health',
    subtopic: 'food',
    canDo: 'Ma loen toidusilti ja tervisenumbreid, seon harjumuse ja selle tagajärje (tänu millele, mille tõttu, mistõttu, mõjuma millele) ning lepin pereliikmega poes kokku, mida me teisiti ostame.',
    teacherPage: {
      goal: 'Ученик читает цифры TAI о питании и этикетку, связывает привычку и последствие (tänu / tõttu / mistõttu) и в магазине договаривается с членом семьи, что купить.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 предложения; станция 4 — две этикетки и короткая договорённость без всех возражений. Текст (станция 2) — дома, вопросы к нему в начале следующего урока.',
      hook: '«Угадай: в стаканчике йогурта (150 г) 18 граммов сахара. Один кусочек сахара — около 4 граммов. Сколько кусочков: 2, 4 или 6? И что ты покупаешь каждую неделю?» Ответ: 4–5 кусочков. Ответьте сами, потом ученик. Этикетку не объясняйте — это работа станции 4.',
      plan: [
        '0–4: крючок — йогурт и сахар, ученик угадывает сразу',
        '4–15: станция 1 — разговор: моя корзина, кто дома решает, что я читаю на упаковке',
        '15–30: станция 2 — слова (2 мин), прогноз «Сколько граммов овощей в день съедает взрослый в Эстонии?», текст темы, 6 вопросов людей',
        '30–42: станция 3 — заметить tänu / tõttu / mistõttu в тексте → правило → 7 привычек и последствий',
        '42–57: станция 4 — голосовое из магазина (5 пропусков), две этикетки мюсли, разговор с членом семьи, договорённость',
        '57–69: «Kui aega jääb» — игра «Надпись на упаковке: что проверить?»',
        '69–77: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '77–85: домашнее задание: сводка графика, запись 1 минуты, слова',
        '85–90: запас',
      ],
      sources: 'Текст станции 2 и график: Tervise Arengu Instituut, «Rahvastiku tervise aastaraamat 2026», гл. 3.3.3 (TKU 2024: 16–64-летние съедают в день в среднем 233 г овощей и 192 г фруктов и ягод; не меньше 300 г овощей — 32,2 %, не меньше 200 г фруктов — 47,4 %; доля не менялась 10 лет) и гл. 3.2 (TKU 2024: 44 % занимаются оздоровительным спортом не реже 2 раз в неделю; рекомендация 150–300 мин в неделю); WHO «Salt reduction» (взрослым меньше 5 г соли в день; большая часть — из хлеба и готовой еды); agri.ee «Toidumärgistusest tarbijale» (kõlblik kuni — срок безопасности, parim enne — срок качества); регламент ЕС 1169/2011 (ингредиенты по убыванию массы, аллергены выделены, пищевая ценность на 100 г). Этикетки мюсли и йогурта и голосовое из магазина — учебные.',
      groups: 'Станция 1 — в парах. Текст и вопросы — каждый сам, сверка в паре. Станция 4: один — покупатель, другой — член семьи с вашей карточкой; потом смена. В 1:1 член семьи — вы.',
      errors: [
        '«Tänu halva une …» → «Halva une tõttu …» (плохая причина — tõttu после генитива; tänu — хорошая и стоит впереди: tänu jalutuskäigule).',
        '«Tänu jalutuskäigu» → «Tänu jalutuskäigule» (tänu + алатив -le).',
        '«…, mistõttu olen väsinud» — правильно; отдельное предложение «Mistõttu olen väsinud.» — нельзя: новое предложение начинается с «Seetõttu …» и глаголом на втором месте.',
        '«Suhkur mõjub tervist» → «Suhkur mõjub tervisele» (mõjuma millele).',
      ],
      notes: [
        'Формат — анализ фактов: цифры TAI и этикетка. Не обсуждайте вес и диеты самого ученика; речь о покупках и привычках семьи. Ученику, который живёт один: «член семьи» — сосед по квартире, взрослый сын или подруга, с которой он ходит в магазин. Пенсионеру — внук, который просит сладкое.',
        'Не давайте медицинских советов. Если ученик спрашивает про диабет, аллергию или диету — «Küsi perearstilt või helista 1220» (это тема урока 042). Цифры — только из источников выше.',
        'Обратная связь, 2–3 цели: tänu (хорошее, -le) / tõttu (плохое, генитив); mistõttu и seetõttu с правильным порядком слов; mõjuma millele. В разговоре в магазине не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('041_d_talk', 'Arva kohe! Minu ostukorv.', 'Vasta kohe esimesele küsimusele, siis teistele; too näide oma elust.', [
        'Jogurtitopsis (150 g) on 18 grammi suhkrut, üks suhkrutükk on umbes 4 grammi. Mitu tükki on topsis: kaks, neli või kuus?',
        'Mida sa ostad peaaegu iga nädal ja kes sinu kodus otsustab?',
        'Mida sa pakendilt loed: hinda, kuupäeva või koostist?',
        'Mis on sinu toidus viimastel aastatel muutunud ja miks?',
      ], [150, 210], ['Ma ostan …', 'Pakendilt vaatan …', 'Tänu sellele …']), 'Sinu ostukorv on tunni esimene näide: pärast teksti näed, mida numbrid selle kohta ütlevad.'), { task: 'S09', fluency: true }),
      'Üks-ühele: alusta jogurtist — õpilane arvab kohe (õige: 4–5 tükki). Siis räägi ka ise, mida sina ostad. Ära paranda ega hinda kellegi toitu. Lõpus küsi: „Kas sa võrdled poes kahte toodet või võtad selle, mida alati?” Kui õpilane elab üksi: „Kellega sa koos poes käid või kellele sa toitu ostad?”')), 1, 15),
      station(tag(B.vocab('041_d_vocab', 'Enne lugemist: sõnad.', ['harjumus — привычка', 'tagajärg — последствие', 'mõju — влияние', 'mõjuma — влиять (на что)', 'toitumine — питание', 'koostis — состав', 'säilimisaeg — срок годности', 'soovitus — рекомендация', 'eelistama — предпочитать', 'tasakaal — баланс']), { topic: ['toitumine', 'koostis', 'säilimisaeg'] }), 2, 15),
      B.topicOpener('041_d_open', 'Moodul 9. Tervis algab poest, mitte apteegist', [
        'Tervis ei sünni ainult arsti juures. Suure osa sellest teeme ise iga päev: poes, köögis, bussipeatusest koju kõndides ja õhtul, kui otsustame, kas minna magama või vaadata veel üks osa sarja. Tervise Arengu Instituut (TAI) kogub regulaarselt andmeid selle kohta, kuidas Eesti inimesed söövad, liiguvad ja puhkavad. Numbrid ei ole kellegi süüdistamiseks. Need näitavad, kus on harjumuse muutmisest kõige rohkem kasu.',
        'Võtame köögiviljad. TAI 2026. aasta ülevaate järgi sõid Eesti täiskasvanud päevas keskmiselt 233 grammi köögivilju ja 192 grammi puuvilju või marju. Vähemalt 300 grammi köögivilju sõi päevas ainult umbes kolmandik täiskasvanutest ja see näitaja ei ole kümne aasta jooksul palju muutunud. Köögiviljad annavad vitamiine ja kiudaineid ning tekitavad täiskõhutunde, mistõttu aitavad need hoida normaalset kehakaalu. Samal ajal sööme sageli liiga palju soola. Maailma Terviseorganisatsiooni soovituse järgi peaks täiskasvanu sööma vähem kui viis grammi soola päevas, see on umbes üks teelusikatäis. Suur osa soolast ei tule soolatopsist, vaid leivast, vorstist ja valmistoidust.',
        'Seepärast tasub poes pakend ümber pöörata. Koostisosad on pakendil kahanevas järjekorras: mida eespool on suhkur, seda rohkem seda tootes on. Allergeenid, näiteks piim, pähklid või nisu, on koostises esile tõstetud. Toitumisalane teave näitab, kui palju on sajas grammis energiat, rasva, suhkrut ja soola. Nii saab võrrelda ka eri suurusega pakendeid. Kuupäevi on kaks: „kõlblik kuni” on ohutuse tähtaeg ja pärast seda toodet süüa ei tohi; „parim enne” näitab kvaliteeti ja õigesti hoitud toode võib ka hiljem kõlblik olla.',
        'Toidust üksi ei piisa. TAI andmetel harrastab vähemalt kaks korda nädalas tervisesporti 44 protsenti täiskasvanutest ja need, kes liiguvad regulaarselt, hindavad oma tervist sagedamini heaks. Liikumist soovitatakse koguda nädalas 150–300 minutit ning igasugune liikumine loeb: ka jalgsi tööle minek või kiire jalutuskäik poodi.',
        'Selles moodulis räägid tervisest enda vaatest: loed toidusilti ja lepid pereliikmega kokku, mida osta, küsid apteegis õiget nõu, otsustad, kas väsinuna minna trenni või puhata, ja teed endale kaheksa nädala plaani ühe harjumuse muutmiseks.',
      ], 'Tervise Arengu Instituut, „Rahvastiku tervise aastaraamat 2026” (ptk 3.2 ja 3.3.3); Maailma Terviseorganisatsioon, soola soovitus; agri.ee, „Toidumärgistusest tarbijale”', [
        'Kui palju köögivilju sina päevas sööd: rohkem või vähem kui 233 grammi?',
        'Mis sind poes rohkem mõjutab: hind, harjumus või pakendi info?',
        'Kas Eestis on tervislikult süüa lihtsam või raskem kui seal, kus sa üles kasvasid? Miks?',
      ]),
      tag(purpose(B.table('041_d_read', 'Mida ütleb tekst?', 'Vasta igale küsimusele 1–3 sõnaga, nagu tekst ütleb.', 'Küsimus, Vastus', [
        'Naaber: „Kui palju köögivilju sööb Eesti täiskasvanu päevas keskmiselt?” | [233 grammi/233 g/233]',
        'Kolleeg: „Kui suur osa täiskasvanutest sööb päevas vähemalt 300 grammi köögivilju?” | [umbes kolmandik/kolmandik/üks kolmandik]',
        'Ema: „Kui palju soola võiks täiskasvanu päevas kõige rohkem süüa?” | [vähem kui viis grammi/alla viie grammi/alla 5 grammi/vähem kui 5 grammi/üks teelusikatäis]',
        'Sinu laps: „Kust tuleb suur osa soolast, kui me ise soola ei lisa?” | [leivast, vorstist ja valmistoidust/leivast/valmistoidust/vorstist/leivast ja vorstist]',
        'Sõbranna: „Kas jogurti võib süüa päev pärast „kõlblik kuni” kuupäeva?” | [ei/ei tohi/ei, ei tohi]',
        'Vend: „Kuidas võrrelda kahte eri suurusega pakendit?” | [sajas grammis/saja grammi järgi/100 grammi järgi/toitumisalase teabe järgi]',
      ], 'g_read'), 'Inimesed sinu ümber küsivad toidu kohta; nüüd vastad faktiga, mitte arvamusega.'), { task: 'R15', harno: 'R2b' }),
    ],
    practice: [
      station(B.notice('041_p_notice', 'Märka: miks ja mis siis?', [
        'Tekstist: köögiviljad tekitavad täiskõhutunde, **mistõttu** aitavad need hoida normaalset kehakaalu · **Seepärast** tasub poes pakend ümber pöörata.',
        '**Põhjus nimisõnaga**: **tänu** + -le — hea tagajärg: **Tänu** jalutuskäigu**le** magan paremini. · omastav + **tõttu** — halb või neutraalne: Halva une **tõttu** olen väsinud.',
        'Tegusõnast saab nimisõna: magan vähe → **vähese une tõttu** · käin jalgsi → **tänu jalgsi käimisele** · joon õhtul kohvi → **õhtuse kohvi tõttu**.',
        '**Tagajärg lausega**: …, **mistõttu** + kõrvallause (koma ees): …, mistõttu olen õhtul väsinud. · Uus lause: **Seetõttu / Seepärast** + tegusõna kohe: Seetõttu **ostan** vähem vorsti.',
        '**mõjuma millele**: Liikumine mõjub tuju**le**. · **põhjustama mida**: Stress põhjustab peavalu. · **viima milleni**: Halb uni viib väsimuse**ni**.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('041_p_links', 'Harjumus ja tagajärg.', 'Seo kaks lauset üheks antud sõnaga. Enne mõtle: kas tagajärg on hea (tänu) või halb (tõttu)?', [
        ['Ma joon õhtul kohvi. Ma ei saa hästi magama.', 'tõttu', 'Õhtuse kohvi tõttu ei saa ma hästi magama.|Õhtuse kohvi tõttu ma ei saa hästi magama.'],
        ['Ma käin iga päev jalgsi tööle. Mu tuju on parem.', 'tänu', 'Tänu jalgsi käimisele on mu tuju parem.'],
        ['Ma söön lõunaks ainult saia. Kella kolmeks olen jälle näljane.', 'mistõttu', 'Ma söön lõunaks ainult saia, mistõttu olen kella kolmeks jälle näljane.'],
        ['Vanaema loeb nüüd pakendeid. Ta ostab vähem soolast vorsti.', 'seetõttu', 'Vanaema loeb nüüd pakendeid, seetõttu ostab ta vähem soolast vorsti.|Vanaema loeb nüüd pakendeid. Seetõttu ostab ta vähem soolast vorsti.'],
        ['Mu vend magab öösiti ainult viis tundi. Ta on tööl hajameelne.', 'tõttu', 'Vähese une tõttu on mu vend tööl hajameelne.|Lühikese une tõttu on mu vend tööl hajameelne.'],
        ['Me sööme õhtul koos laua ääres. Lapsed räägivad meile oma päevast.', 'tänu', 'Tänu ühisele õhtusöögile räägivad lapsed meile oma päevast.'],
        ['Magusad joogid on halvad hammastele ja kehakaalule.', 'mõjuma', 'Magusad joogid mõjuvad hammastele ja kehakaalule halvasti.|Magusad joogid mõjuvad halvasti hammastele ja kehakaalule.'],
      ], 'full', 'g_notice'), 'Kui oskad harjumuse ja tagajärje ühte lausesse panna, on sinu põhjendus poes, arsti juures ja eksamil selge.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas tagajärg on hea või halb?” Nii valib õpilane ise tänu või tõttu. Rida 5: tegusõnast saab nimisõna (magab vähe → vähese une tõttu) — see on B2 samm; kui raske, luba „Sellepärast, et ta magab vähe, …” ja näita siis lühemat varianti.'),
    ],
    transfer: [
      station(tag(purpose(B.listening('041_t_voice', 'Häälsõnum poest.', 'Pereliige helistas poest ja jättis sõnumi. Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, ma olen poes ja seisan müsliriiuli juures!',
        'Müsli A „Hommikurõõm” on täna kampaanias: kolm pakki kahe hinnaga.',
        'Lapsed tahavad ainult seda maasikatega, teist nad ei söö.',
        'Aga sa ütlesid ju, et hommikul peaks olema vähem suhkrut. Kas see „Kaer ja seemned” on parem? Pakk on suurem ja ka kallim.',
        'Ja veel: vanaema palus osta midagi, milles ei ole nisu, sest tal on nisu allergia.',
        'Helista mulle kümne minuti jooksul, ma olen varsti kassas.',
      ], [
        'Müsli A „Hommikurõõm” on täna poes kampaanias: [kolm|3] pakki kahe hinnaga.',
        'Lapsed tahavad hommikuks ainult sellist müslit, milles on [maasikad|maasikaid].',
        'Pereliikme sõnul on müsli B „Kaer ja seemned” pakk suurem ja [kallim].',
        'Allergia tõttu ei tohi vanaema süüa sellist toitu, milles on [nisu].',
        'Pereliige on varsti kassas ja ootab sinu kõnet [kümne minuti|10 minuti] jooksul.',
        'Kõige suurem mure on pereliikme arvates see, et hommikusöögis on liiga palju [suhkrut].',
      ], 'g_read'), 'Häälsõnumist saad teada, millest pere valik sõltub: hind, maitse ja vanaema allergia.'), { task: 'L06', level: 3 }), 4, 15, { final: 'negotiate' }),
      tag(purpose(B.profiles('041_t_labels', 'Kaks müslit poeriiulil.', 'Võrdle silte: mis on sajas grammis erinev, mis on koostises esimesel kohal ja kumb on kilo kohta odavam?', [
        ['Müsli A „Hommikurõõm”, 375 g, 2,49 €', ['Koostis: KAERAhelbed, suhkur, NISUhelbed, palmirasv, kuivatatud maasikad (2%), sool.', '100 g: energia 430 kcal, rasv 14 g, suhkrud 24 g, kiudained 5 g, sool 0,6 g.', 'Esiküljel: „Päris maasikatega!”', 'Kilohind 6,64 €. Parim enne 03.2027.'], []],
        ['Müsli B „Kaer ja seemned”, 500 g, 3,19 €', ['Koostis: KAERAhelbed (70%), päevalilleseemned, rosinad, linaseemned, kaneel.', '100 g: energia 390 kcal, rasv 9 g, suhkrud 10 g, kiudained 9 g, sool 0,02 g.', 'Esiküljel: „Ilma lisatud suhkruta”', 'Kilohind 6,38 €. Parim enne 01.2027.', 'Allikas: väljamõeldud näidistooted; sildi reeglid agri.ee, „Toidumärgistusest tarbijale”.'], []],
      ], '2', 'g_read'), 'Kaks silti annavad sulle numbrid, millega pereliiget veenda.'), { task: 'R08', level: 3 }),
      teach(tag(purpose(B.rolecards('041_t_shop', 'Poes: leppige kokku.', 'Oled pereliikmega poes. Tema tahab müslit A, sina kaalud B-d. Leppige kokku, mis korvi läheb, ja põhjenda oma ettepanekut numbritega.',
        'Olukord: oled koos pereliikmega (laps, abikaasa, ema või korterinaaber) poes hommikusöögiriiuli juures.\nSinu eesmärk: lepite kokku, mida ostate, ja sina põhjendad oma ettepanekut vähemalt kahe numbriga sildilt.\nPiirang: pereliige ei taha „tervisetoitu” ja pere eelarve on väike; käsk ei tööta, kokkulepe töötab.',
        'Pereliikme kaart on õpetajal: tema harjumus ja kolm vastuväidet.',
        ['Vaata, sajas grammis on …', 'Tänu kiudainetele …', 'Suhkru tõttu …', 'Kilohind on tegelikult …', 'Kviitungilt näeme pärast, kui palju me säästsime.', 'Mis siis, kui me …?'], ['Aga see on maitsev!', 'Mul ei ole aega silte lugeda.', 'Olgu, aga siis …']), 'Tulemus: teil on kokkulepe, mis sobib nii tervisele, rahakotile kui ka maitsele.'), { task: 'S03', main: true, level: 4 }),
      'Õpetaja kaart (pereliige; kui õpilasel on lapsed, võib see olla tema laps). Ütle ainult seda, mida küsitakse. Varjatud info: sööd müslit A juba aastaid; sulle meeldivad maasikad; arvad, et „ilma lisatud suhkruta” tähendab „ilma suhkruta”. Takistused ükshaaval: 1) „B on kallim!” (tavahinnaga on B kilo kohta odavam: 6,38 € vs 6,64 €; kampaaniaga „kolm kahe hinnaga” on A küll odavam, aga A-s on nisu ja vanaema seda süüa ei tohi). 2) „B-s on ka suhkrut, 10 grammi — kus on loogika?” (rosinate suhkur, mitte lisatud). 3) „Ma ei hakka igal hommikul seemneid närima.” Õnnestunud, kui õpilane võrdleb vähemalt kahte numbrit sajas grammis, parandab ühe vale arvamuse, kasutab vähemalt kaks põhjuse või tagajärje väljendit (tänu, tõttu, mistõttu) ja te lepite kokku (näiteks segate pooleks või lisate maasikad ise).'),
      extension(teach(tag(purpose(B.speaking('041_t_more', 'Mäng: mida sa sildilt kontrolliksid?', 'Õpetaja ütleb ühe pakendil oleva lause. Sul on 30 sekundit: ütle, mida sa sildilt kontrolliksid ja mis võib olla selle toote tagajärg sinu päevale.', [
        'Laused: „Light”; „Ilma lisatud suhkruta”; „Täisteraga”; „Kodune maitse”; „Rikas valgu poolest”; „Parim enne eilne kuupäev”.',
        'Alusta: Kõigepealt vaataksin …; lõpeta: … tõttu / tänu …',
      ], [120, 180], ['Kõigepealt vaataksin …', 'Kui …, siis …', '… tõttu …']), 'Kiire mäng õpetab poes sama küsimuse: mida see lause tegelikult tähendab?'), { task: 'S19', fluency: true }),
      'Kui aega jääb (12 min). Ütle üks lause korraga, hoia aega (30 s). Punkt: üks konkreetne asi sildilt (100 g, koostise esimene koht, kuupäev) + üks põhjuse või tagajärje väljend. Viimane lause on lõks: „parim enne” eilne kuupäev ei tähenda, et toode on riknenud — kontrolli lõhna ja välimust. Vahetage: õpilane loeb lause, sina vastad.'), 12),
      tag(exitCheck(purpose(B.gaps('041_t_exit', 'Kontrolli end: kolm põhjust.', 'Kirjuta lünka sobiv sõna või sulgudes oleva sõna õige vorm.', [
        '[Tänu] igapäevasele jalutuskäigule magan ma nüüd paremini. (tänu / tõttu)',
        'Vähese une [tõttu] on mul tööl raske keskenduda. (tänu / tõttu)',
        'Liigne sool mõjub halvasti [vererõhule]. (vererõhk)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas põhjus ja tagajärg on käes.')), {}),
      purpose(B.selfcheck('041_t_self', ['Ma räägin oma ostukorvist ja toiduharjumustest.', 'Ma leian tekstist ja sildilt, mida numbrid tähendavad: sajas grammis, koostis, kõlblik kuni, parim enne.', 'Ma seon harjumuse ja tagajärje: tänu millele, mille tõttu, mistõttu, mõjub millele.', 'Ma lepin pereliikmega kokku, mida osta, ja põhjendan numbritega.'], 'Silt loetud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      B.chart('041_t_chart', 'Kui palju sööme ja milline on võrdluspiir? (grammi päevas, 16–64-aastased, 2024)', { kind: 'bar', unit: 'g', series: ['Sööme keskmiselt', 'Võrdluspiir TAI ülevaates'], rows: ['Köögiviljad | 233 | 300', 'Puuviljad ja marjad | 192 | 200'], source: 'Tervise Arengu Instituut, „Rahvastiku tervise aastaraamat 2026”, ptk 3.3.3 (TKU 2024)' }),
      tag(homeTask(purpose(B.writing('041_t_summary', 'Kodus: kokkuvõte joonisest.', 'Kirjuta kodus joonise põhjal 150–170 sõna: peamine suundumus, võrdlus, protsendid (300 g köögivilju sõi 32,2 %, 200 g puuvilju 47,4 %) ja sinu kommentaar põhjuste ning lahenduste kohta.', [11, 15], ['joonisel', 'võrreldes', 'tõttu', 'mistõttu'], 3, 'g_use'), 'Kokkuvõte andmetest on Harno B2 kirjutamise teine ülesanne; nüüd teed selle oma päris teemaga.')), { task: 'W15', level: 3 }),
      tag(homeTask(purpose(B.speaking('041_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks asi, mida sa oma ostukorvis muudad, ja mis on selle tagajärg.', [
        'Mida sa ostad edaspidi teisiti?',
        'Mis on selle hea tagajärg sulle või sinu perele?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja ütleb, kas põhjus ja tagajärg on õiges vormis.')), { task: 'S15' }),
      homework('041_t_homework', ['1. Kokkuvõte joonisest, 150–170 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-042': {
    title: 'Kas apteeker teab paremini kui internet?',
    phases: grammar('Keel: pehme nõuanne — võiksid, peaksid, tasuks, oleks parem, kui …, soovitaksin, kas sa ei tahaks …?'),
    format: 'infogap',
    topic: 'health',
    subtopic: 'pharmacy',
    canDo: 'Ma räägin pereliikmega ja annan talle pehmet, realistlikku nõu tingiva kõneviisiga (võiksid, tasuks, oleks parem, kui …); enne seda saan kuuldust aru apteekri nõuannetest ja häälsõnumist ning leian koos teisega puuduva info (ravim teise inimese eest, 1220, gripivaktsiin apteegis, vanad ravimid).',
    teacherPage: {
      goal: 'Ученик слушает радио «Аптекарь отвечает» и голосовое тёти, по двум карточкам находит недостающее и мягко советует условным наклонением; без медицинских советов — куда обратиться и что положено.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 фразы из семейного чата; станция 4 — голосовое и совет тёте без расширения. Радио (станция 2) — дома, вопросы в начале следующего урока.',
      hook: '«Сосед говорит: „У меня насморк и болит горло. Куплю антибиотик — он быстро поможет.“ Что ты ему ответишь? a) Хорошая идея. b) Спроси сначала аптекаря или позвони 1220. c) Ничего не делай.» Ученик выбирает и говорит одну фразу. Не объясняйте — ответ даст радио.',
      plan: [
        '0–3: крючок — сосед и антибиотик, ученик отвечает сразу',
        '3–12: станция 1 — разговор: у кого я спрашиваю совет, когда болею; аптека здесь и на родине',
        '12–27: станция 2 — слова (2 мин), прогноз «О чём спросят слушатели?», радио дважды, 5 вопросов с выбором',
        '27–39: станция 3 — заметить в радио «võiksite», «tasuks», «oleks parem» → правило → 7 «слишком прямых» сообщений из семейного чата смягчить',
        '39–54: станция 4 — голосовое тёти Тамары, карточка аптеки у ученика, карточка Тамары у вас: найти недостающее и дать три совета',
        '54–66: «Kui aega jääb» — звонок на 1220: описать, кто болен и что случилось',
        '66–74: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '74–82: домашнее задание: письмо Тамаре, запись 1 минуты, слова',
        '82–90: запас',
      ],
      sources: 'Радио и карточки: Tervisekassa «Digiretsept» (покупая лекарство другому, покупатель показывает свой документ с фото и личным кодом и называет личный код пациента; рецепт должен быть открытым или с доверенностью — проверяется в terviseportaal); Tervisekassa «Perearsti nõuandetelefon 1220» (по-эстонски и по-русски круглосуточно, по-английски 9–17; при угрозе жизни — 112); Ravimiamet «Gripivaktsiinide kättesaadavus 2026/2027» и vaktsineeriapteegis.ee (прививка от гриппа у семейного врача, в кабинетах вакцинации и во многих аптеках, время бронируется на сайте); Tervisekassa 13.10.2025 (группам риска, в т. ч. старше 60 и беременным, бесплатно, остальным — до 30 € по прейскуранту); Ravimiamet: антибиотики не лечат вирусные болезни; Südameapteek «Aegunud tableti mõju on ettearvamatu» (просроченные лекарства — не в мусор, а в пункт опасных отходов или в аптеку). Аптекарь Merle Kask, слушатели, тётя Тамара и карточки — учебные.',
      groups: 'Станция 1 — в парах. Радио — каждый сам, сверка в паре. Станция 4: у одного карточка аптеки, у другого — карточка Тамары; потом смена. В 1:1 Тамара — вы.',
      errors: [
        '«Sa võiks minna» → «Sa võiksid minna» (у «ты» окончание -ksid; «võiks» — для он/она или разговорно).',
        '«Sa peaksid minna» → «Sa peaksid minema» (pidama + ma-инфинитив; võiksid / tasuks + da: võiksid minna).',
        '«Oleks parem, kui sa küsid» → «Oleks parem, kui sa küsiksid» (после «oleks parem, kui» тоже условное).',
        '«Ma soovitan sulle, et sa helistad» → «Ma soovitaksin sul helistada» (мягче и короче: soovitama kellel + da).',
      ],
      notes: [
        'Формат — информационный пробел: у ученика карточка с правилами аптеки, у вас — то, чего Тамара в голосовом не сказала. Ученику без пожилых родственников: Тамара — соседка или мама подруги. Пенсионеру: он сам может быть Тамарой — тогда поменяйтесь ролями.',
        'Безопасность: ученик не советует лекарства и дозы. Правильный совет урока — куда обратиться (аптекарь, 1220, семейный врач, 112) и что взять с собой. Если ученик рассказывает о своей болезни — выслушайте и предложите 1220 или семейного врача.',
        'Обратная связь, 2–3 цели: форма -ksid и инфинитив после неё (võiksid minna, peaksid minema); «oleks parem, kui» + условное; вежливый тон с пожилым человеком.',
      ],
    },
    discover: [
      station(B.text('042_d_hook', 'Mida sa vastad?', 'Naaber ütleb: „Mul on nohu ja kurk valutab. Ostan antibiootikumi, see aitab kiiresti.” Mida sa vastad? a) Hea mõte. b) Küsi enne apteekrilt või helista 1220. c) Ära tee midagi. Vali ja ütle üks lause.'), 1, 9),
      inLesson(teach(tag(purpose(B.speaking('042_d_talk', 'Kui keegi jääb haigeks.', 'Vasta ja too näide oma elust.', [
        'Kelle käest sa küsid nõu, kui jääd haigeks: internetist, emalt või apteekrilt?',
        'Mis on apteegis Eestis teisiti kui seal, kus sa üles kasvasid?',
      ], [150, 210], ['Kõigepealt ma …', 'Minu kodumaal …', 'Apteeker võiks …']), 'Sinu kogemus näitab, mida sa juba tead ja mida raadiost veel kuuled.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise. Ära anna ravinõu ega hinda ravimeid. Lõpus küsi: „Kas sa oled kunagi ostnud ravimi teisele inimesele või käinud apteegis vaktsineerimas?”')),
      station(tag(B.vocab('042_d_vocab', 'Enne kuulamist: sõnad.', ['apteeker — фармацевт', 'retseptiravim — рецептурное лекарство', 'ravim — лекарство', 'pakend — упаковка', 'isikukood — личный код', 'volitus — доверенность', 'vaktsineerima — делать прививку', 'retsept — рецепт', 'nõuandetelefon — телефон консультации', 'mure — забота (беспокойство)']), { topic: ['retseptiravim', 'nõuandetelefon'] }), 2, 15),
      teach(tag(purpose(B.examListen('042_d_radio', 'Raadio: apteeker vastab.', 'Enne kuulamist arva: mida kuulajad küsivad? Siis kuula kaks korda ja vali õige vastus.', 'choice', [
        'Saatejuht: Tere! Saates „Tervise tund” vastab täna kuulajate küsimustele apteeker Merle Kask. Esimene kuulaja on juba liinil. Helju, palun!',
        'Helju: Tere! Mu mees on seitsekümmend kaks ja tal valutab jalg, ta ei saa ise apteeki minna. Perearst kirjutas talle retsepti. Kas mina võin selle ravimi välja osta?',
        'Apteeker Merle: Võite küll. Võtke kaasa oma isikut tõendav dokument, näiteks ID-kaart või pass, ja öelge apteekrile oma mehe isikukood. Retsept peab olema avalik või peab teil olema volitus. Seda saab kontrollida terviseportaalis.',
        'Saatejuht: Järgmine helistaja on Kaire.',
        'Kaire: Tere! Minu poeg on viieaastane ja tal on kolm päeva nohu. Naaber ütles, et ostku ma antibiootikumi, siis läheb kiiremini üle. Kas see on õige?',
        'Apteeker Merle: Ma saan teie murest aru, aga antibiootikum ei ravi viirushaigust, ja nohu on tavaliselt viirus. Pealegi on antibiootikumid retseptiravimid. Kui olete mures, võiksite helistada perearsti nõuandetelefonile 1220. Seal vastatakse ööpäev läbi eesti ja vene keeles. Kui lapsel on raske hingata, helistage kohe 112.',
        'Saatejuht: Ja kolmas kuulaja, Sergei.',
        'Sergei: Tere! Ma töötan vahetustes ja perearsti juurde on raske aega saada. Kas gripi vastu saab vaktsineerida ka apteegis?',
        'Apteeker Merle: Saab. Paljudes apteekides üle Eesti vaktsineeritakse sügisel gripi vastu ja aja saab broneerida internetis. Riskirühmadele, näiteks eakatele ja rasedatele, on vaktsiin tasuta, teistele maksab see kuni umbes kolmkümmend eurot. Teie puhul tasuks aeg kohe broneerida, sest õhtused ajad lähevad kiiresti.',
        'Saatejuht: Merle, üks küsimus ka minult. Mida teha vanade ravimitega, mis kapis aeguvad?',
        'Apteeker Merle: Prügikasti ega kraanikaussi neid visata ei tohi. Viige need ohtlike jäätmete kogumispunkti või küsige oma apteegist, kas nad võtavad need vastu. Ja üks soovitus kõigile: enne uue ravimi, ka käsimüügiravimi võtmist lugege pakendi infolehte. Kui midagi jääb segaseks, oleks parem apteekrilt küsida kui internetist otsida.',
        'Saatejuht: Aitäh, Merle!',
      ], [
        ['Mida peab Helju apteeki kaasa võtma, et oma mehe retseptiravim välja osta?', 'oma isikut tõendava dokumendi ja teadma mehe isikukoodi', 'mehe ID-kaardi ja perearsti kirja', 'ainult paberil retsepti'],
        ['Mis tingimusel saab Helju ravimi välja osta, kui retsept on mehe nimel?', 'retsept on avalik või tal on volitus', 'mees helistab enne apteeki', 'perearst tuleb ise apteeki kaasa'],
        ['Miks ei soovita apteeker Kaire viieaastasele pojale nohu korral antibiootikumi?', 'nohu on tavaliselt viirus ja antibiootikum seda ei ravi', 'antibiootikum on lastele liiga kallis', 'poeg on alles liiga väike'],
        ['Kuhu võiks Kaire apteekri sõnul kõigepealt helistada, kui ta on lapse pärast mures?', 'perearsti nõuandetelefonile 1220', 'kohe häirekeskusesse 112', 'oma naabrile'],
        ['Mida saab vahetustega töötav Sergei apteegis teha, kui perearsti juurde on raske aega saada?', 'gripi vastu vaktsineerida, kui ta aja broneerib', 'retseptita antibiootikumi osta', 'perearsti vastuvõtule registreeruda'],
        ['Mida tuleb apteekri sõnul teha kodus aegunud ravimitega, mida enam vaja ei ole?', 'viia kogumispunkti või küsida apteegist, kas need võetakse vastu', 'visata need prügikasti', 'lasta need kraanikausist alla'],
      ], 'g_listen'), 'Kuuled, kust saad õige nõu ja mida sul apteegis vaja on.'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamise tsükkel: 1) prognoos — „Mida inimesed apteekrilt küsivad?”; 2) esimene kuulamine — mitu helistajat ja mis teemal; 3) teine kuulamine — küsimused; 4) üks lause: „Mida sina enne ei teadnud?” Ära anna ravinõu; kui õpilane küsib „mis ravim aitab?”, vasta: „Seda küsi apteekrilt või 1220-st.”'),
    ],
    practice: [
      station(B.notice('042_p_notice', 'Märka: käsk või nõuanne?', [
        'Raadiost: Kui olete mures, **võiksite** helistada 1220. · Teie puhul **tasuks** aeg kohe broneerida. · **Oleks parem** apteekrilt küsida kui internetist otsida.',
        '**Käsk** (Helista! Osta!) kõlab sõbrale, vanemale inimesele või võõrale sageli liiga järsult. **Tingiv kõneviis** teeb nõuande pehmeks ja jätab valiku teisele.',
        'sa **võiksid** + **da** (helistada) · sa **peaksid** + **ma** (minema) — tugevam · **tasuks** + **da** (broneerida) — see on kasulik · **ma soovitaksin** (sul) + **da** (lugeda)',
        '**Oleks parem, kui** + tingiv: Oleks parem, kui sa **küsiksid** apteekrilt. · **Oleks parem** + da: Oleks parem apteekrilt küsida.',
        'Küsimusena veel pehmem: **Kas sa ei tahaks** …? · **Äkki** sa helista**ksid** …?',
        'Ka ametlikus asjas: kui ostad retseptiravimit teise inimese eest, **tasuks** teada tema isikukoodi; kui retsept ei ole avalik, **oleks parem** teha enne volitus.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('042_p_soft', 'Liiga otse? Ütle pehmemalt.', 'Pereliikmed kirjutavad perevestlusse liiga järsult. Kirjuta iga sõnum pehme nõuandena antud sõnaga; pöördumine ja põhjus jäävad samaks.', [
        ['Ema, sul on kolm päeva köha, mine kohe arsti juurde!', 'võiksid', 'Ema, sa võiksid arsti juurde minna.|Ema, sa võiksid kohe arsti juurde minna.'],
        ['Isa, ära joo pärast kella viit enam kohvi!', 'oleks parem, kui', 'Isa, oleks parem, kui sa pärast kella viit enam kohvi ei jooks.'],
        ['Loe pakendi infolehte läbi, enne kui tableti võtad!', 'tasuks', 'Enne tableti võtmist tasuks pakendi infoleht läbi lugeda.|Tasuks pakendi infoleht läbi lugeda, enne kui tableti võtad.'],
        ['Öösel ei ole perearst tööl, helista 1220!', 'soovitaksin', 'Öösel ei ole perearst tööl, ma soovitaksin sul helistada 1220.'],
        ['Sa oled üle kuuekümne, broneeri gripivaktsiini aeg!', 'kas sa ei tahaks', 'Sa oled üle kuuekümne, kas sa ei tahaks gripivaktsiini aega broneerida?'],
        ['Vii vanad tabletid kogumispunkti, mitte prügikasti!', 'peaksid', 'Sa peaksid vanad tabletid kogumispunkti viima, mitte prügikasti.'],
        ['Pane käsimüügiravimid lastele kättesaamatusse kohta!', 'äkki', 'Äkki paneksid käsimüügiravimid lastele kättesaamatusse kohta?|Äkki sa paneksid käsimüügiravimid lastele kättesaamatusse kohta?'],
      ], 'full', 'g_notice'), 'Pehme nõuande peale ei solvu keegi ja seda kuulatakse.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kellele sa seda ütled — emale, sõbrale, võõrale? Kas see on nüüd viisakas?” Rida 6: peaksid + ma-tegevusnimi (viima), mitte viia. Kui õpilane kirjutab „võiks”, küsi: „Kellele — sinule või talle?”'),
    ],
    transfer: [
      station(tag(purpose(B.listening('042_t_voice', 'Tädi Tamara häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Tamara! Vabandust, et nii hilja helistan, aga mul on kodus kolm muret.',
        'Esiteks: perearst kirjutas mulle uue vererõhuravimi, aga ma ei saa praegu ise apteeki minna, sest põlv valutab.',
        'Kas sina saaksid selle homme välja osta? Oma isikukoodi saadan sulle sõnumiga.',
        'Teiseks: naabrinaine ütles, et gripisüst maksab kolmkümmend eurot ja et apteegis seda ei tehta. Ma olen kuuskümmend kaheksa. Kas see on tõsi?',
        'Ja kolmandaks: kapis on mul terve kast vanu tablette, mõned on kaks aastat aegunud. Kas ma võin need lihtsalt prügikasti visata?',
        'Helista mulle homme hommikul, ma olen kodus. Aitäh, kullake!',
      ], [
        'Perearst kirjutas Tamarale uue [vererõhuravimi|ravimi].',
        'Tamara ei saa ise apteeki minna, sest tal valutab [põlv].',
        'Tamara saadab sulle oma [isikukoodi] sõnumiga.',
        'Naabrinaise sõnul maksab gripisüst [kolmkümmend eurot|30 eurot|kolmkümmend].',
        'Tamara on [kuuskümmend kaheksa|68] aastat vana.',
        'Mõned tabletid kapis on juba [kaks aastat|2 aastat] aegunud.',
      ], 'g_listen'), 'Märkmed näitavad, mida Tamara vajab; nendega lähed infovahetusse.'), { task: 'L07', level: 3 }), 4, 15, { final: 'advise' }),
      tag(purpose(B.profiles('042_t_card', 'Sinu kaart: apteegi info.', 'Loe kaarti. Mõtle: milline rida vastab Tamara mõnele murele ja mida sa veel ei tea?', [
        ['Apteegi info', ['Retseptiravimi teisele inimesele ostmiseks: oma ID-kaart või pass ja patsiendi isikukood; retsept peab olema avalik või peab olema volitus (terviseportaal).', 'Gripi vastu vaktsineeritakse paljudes apteekides; aeg broneeritakse internetis. Riskirühmadele (näiteks eakatele) on vaktsiin tasuta, teistele kuni umbes 30 eurot.', 'Aegunud ravimeid ei visata prügikasti: ohtlike jäätmete kogumispunkt või apteek (küsi enne).', 'Enne iga ravimi võtmist loe pakendi infolehte; kui midagi on segane, küsi apteekrilt või helista 1220 (ööpäev läbi eesti ja vene keeles).', 'Allikas: Tervisekassa, „Digiretsept” ja „Perearsti nõuandetelefon 1220”; Ravimiamet (2026); Tervisekassa (13.10.2025).'], []],
      ], '1', 'g_read'), 'Kaart on sinu pool infost; teise poole saad Tamaralt küsimustega.'), { task: 'R07' }),
      tag(purpose(B.table('042_t_notes', 'Enne kõnet: kolm muret.', 'Täida tabel häälsõnumi ja kaardi põhjal: mis on mure, mida kaart ütleb ja mida pead Tamaralt veel küsima.', 'Mure, Mida kaart ütleb?, Mida pean Tamaralt küsima?', [
        'Vererõhuravim |  | ',
        'Gripisüst |  | ',
        'Vanad tabletid |  | ',
      ], 'g_read'), 'Kolm rida on sinu kõne plaan: tead, mida öelda ja mida küsida.'), { task: 'W07' }),
      teach(tag(purpose(B.rolecards('042_t_gap', 'Infovahetus: aita Tamarat.', 'Helista Tamarale. Küsi, mida häälsõnumis ei olnud, ütle, mida sinu kaart ütleb, ja anna kolm pehmet nõuannet eri vormidega.',
        'Olukord: Tamara (sinu tädi, ema sõbranna või naaber) jättis sulle häälsõnumi kolme murega; sinul on apteegi infokaart.\nSinu eesmärk: saad teada, mida Tamara täpselt vajab, ja te lepite kokku, kes mida homme teeb.\nPiirang: sa ei ole arst — ravimi ega annuse kohta nõu ei anna.',
        'Tamara kaart on õpetajal: mida ta häälsõnumis ei öelnud.',
        ['Sa võiksid …', 'Oleks parem, kui sa …', 'Kas sa ei tahaks …?', 'Selleks on vaja …', 'Seda ma ei tea, aga apteeker või 1220 teab.'], ['Aga naabrinaine ütles …', 'Ma ei oska internetis …', 'Kas sa saaksid …?']), 'Tulemus: Tamara teab, mida homme teha, ja keegi ei viska ravimeid prügikasti.'), { task: 'S05', main: true, level: 4 }),
      'Õpetaja kaart (Tamara; kui õpilane on ise pensionär, vahetage rollid). Ütle ainult seda, mida küsitakse. Varjatud info: retsept ei ole avalik ja volitust ei ole; ID-kaardiga sa internetis ei oska; tasuta gripisüsti kohta sa ei teadnud (oled üle 60, kuulud riskirühma); vanu tablette on terve kast. Takistused ükshaaval: 1) „Mis asi see volitus on? Ma ei oska!” (lahendus: õpilane aitab terviseportaalis või küsib apteegist) 2) „Naabrinaine ütles, et apteegis ei tehta.” 3) „Kast on raske, ma ei jaksa seda kuhugi viia.” Õnnestunud, kui õpilane küsib vähemalt kolm küsimust, ütleb kõik kolm vajalikku fakti, kasutab vähemalt kolm eri pehmet vormi (võiksid, oleks parem, kui …, kas sa ei tahaks) ja te lepite kokku, kes mida teeb.'),
      extension(teach(tag(purpose(B.speaking('042_t_more', 'Rollimäng: helista 1220', 'Kell on 23 ja sinu pereliige on haige. Helista nõuandetelefonile ja kirjelda olukorda: õpetaja on õde ja küsib. Lõpus korda üle, mida õde soovitas.', [
        'Kes on haige, kui vana ta on ja mis juhtus?',
        'Millest alates see kestab ja mida te juba tegite?',
        'Mida õde soovitas ja millal te jälle helistate?',
      ], [120, 180], ['Helistan oma … pärast.', 'Alates eilsest on tal …', 'Kas ma sain õigesti aru, et …?']), 'Kui oskad seda kõnet eesti keeles, ei pea sa öösel tõlki otsima.'), { task: 'S04', level: 4 }),
      'Kui aega jääb (12 min). Sina oled 1220 õde. Küsi: kes on haige ja kui vana, mis juhtus ja millal algas, temperatuur, kas joob ja kas hingamine on kerge, mis ravimeid on võtnud. Ravinõu ära anna; ütle üldiselt: „Jälgige teda; kui hingamine läheb raskeks või olukord halveneb, helistage 112.” Õnnestunud, kui õpilane vastab täislausetega, ütleb ajad ja numbrid selgelt ja kordab lõpus üle, mida õde soovitas.'), 12),
      tag(exitCheck(purpose(B.gaps('042_t_exit', 'Kontrolli end: kolm pehmet nõuannet.', 'Kirjuta sulgudes olev tegusõna tingiva kõneviisi vormis.', [
        'Kui sa ei tea, kas see käsimüügiravim sobib, [võiksid] enne apteekrilt nõu küsida. (võima)',
        'Oleks parem, kui sa vanu tablette kodus prügikasti ega kraanikaussi ei [viskaks]. (viskama)',
        'Õhtused ajad lähevad kiiresti, seepärast [tasuks] gripivaktsiini aeg kohe broneerida. (tasuma)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas pehme nõuanne on käes.')), {}),
      purpose(B.selfcheck('042_t_self', ['Ma räägin, kust ma haigena nõu küsin.', 'Ma saan raadiost ja häälsõnumist aru, mida apteegis vaja on ja kuhu helistada.', 'Ma annan pehmet nõu: võiksid, peaksid, tasuks, oleks parem, kui …', 'Ma leian koos teisega puuduva info ja lepin kokku, kes mida teeb.'], 'Nõu antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('042_t_letter', 'Kodus: kiri Tamarale.', 'Kirjuta kodus 150–170 sõna: mida said Tamara kolme mure kohta teada, mida ise homme teed, ja kolm-neli pehmet nõuannet eri vormidega. Ravimi ega annuse kohta nõu ära anna.', 'Kallis Tamara!', 'Kallistan\n(sinu nimi)', [150, 170]), 'Tamara hoiab kirja käekotis ja teab, mida apteegis öelda.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('042_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa teed, kui pereliige jääb öösel haigeks — kuhu helistad ja mida ütled.', [
        'Kellele sa helistad ja millal?',
        'Mida sa kõigepealt ütled?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja ütleb, kas tingiv kõneviis on õige.')), { task: 'S15' }),
      homework('042_t_homework', ['1. Kiri Tamarale, 150–170 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-043': {
    title: 'Õhtul väsinud: trenn või diivan?',
    phases: grammar('Keel: eelistus ja kompromiss — pigem … kui …, selle asemel et + da, mida …, seda …'),
    format: 'debate',
    topic: 'health',
    subtopic: 'movement-rest',
    canDo: 'Ma räägin, kuidas ma liigun ja puhkan, loen liikumissoovitusi ja numbreid, kaitsen väitlusel oma seisukohta (trenn või puhkus) ja pakun kompromissi; eelistust ütlen pigem … kui …, selle asemel et ja mida …, seda ….',
    teacherPage: {
      goal: 'Ученик читает рекомендации TAI о движении и отдыхе, спорит «устал вечером: тренировка или отдых?», предлагает компромисс и голосует; pigem … kui, selle asemel et, mida …, seda.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 3 — правило и 4 строки форума; дебаты — по 2 аргумента и компромисс. Текст и проверка (станция 2) — дома.',
      hook: '«Пятница, семь вечера. Ты устал: работа, учёба или ребёнок забрали все силы. Что выбираешь: тренировка, прогулка или диван? Голосуй и скажи одну причину!» Голосуйте оба, вы — с короткой причиной.',
      plan: [
        '0–3: крючок — голосование, ученик отвечает сразу',
        '3–13: станция 1 — разговор: сколько я двигаюсь и как отдыхаю',
        '13–28: станция 2 — слова (2 мин), прогноз карандашом: 6 утверждений «верно или нет?», текст, проверка',
        '28–40: станция 3 — заметить «pigem … kui», «selle asemel et», «mida …, seda» → правило → пост на форуме: 7 ошибок',
        '40–55: станция 4 — два слушателя на радио (6 пропусков: «сразу двигаться» и «сначала отдых»), дебаты, компромисс, голосование',
        '55–67: «Kui aega jääb» — игра «30 секунд, одно решение»',
        '67–75: проверка на выходе, «Ma oskan …», 3 ошибки из дебатов',
        '75–83: домашнее задание: рассуждение, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст и карточки: Tervise Arengu Instituut, «Rahvastiku tervise aastaraamat 2026», гл. 3.2 (рекомендация: 150–300 мин умеренной или 75–150 мин интенсивной нагрузки в неделю, силовые упражнения 2–3 раза в неделю, не меньше 30 мин в день или две паузы по 15 мин, «любое движение считается»; TKU 2024: 44 % 16–64-летних занимаются оздоровительным спортом не реже 2 раз в неделю, 26 % — раз в месяц или реже; хорошее здоровье по самооценке — 70,3 % у регулярно двигающихся и 51,1 % у остальных); TAI «Eesti riiklikud toitumise, liikumise ja uneaja soovitused» (2025: большинству взрослых подходит 7–9 часов сна). Звонки Тийны и Олега — учебные; их аргументы — мнения, а не данные.',
      groups: 'Голосование — все сразу. Текст и проверка — каждый сам, сверка в паре. Дебаты: две команды по 1–2 человека, вы ведёте время и голосуете последним. В 1:1 вы берёте сторону, которую ученик не выбрал.',
      errors: [
        '«Selle asemel et istuma» → «Selle asemel et istuda» (после selle asemel et — da-инфинитив).',
        '«Mida rohkem ma liigun, see paremini» → «…, seda paremini» (mida …, seda … и в обеих частях сравнительная степень).',
        '«Pigem ma jalutan kui jooksma» → «Pigem jalutan kui jooksen» (обе части в одной форме).',
        '«Eelistan magamine trennile» → «Eelistan und / magamist trennile» (eelistama mida millele — партитив + алатив).',
      ],
      notes: [
        'Формат — дебаты с голосованием. Голос в конце можно сменить, если назвать аргумент, который убедил. Ученику без работы: вечер после учёбы, после дня с ребёнком или после дачи; пенсионеру — «утро или вечер?», маме в декрете — «когда ребёнок спит: спать или двигаться?».',
        'Не превращайте урок в фитнес-совет: это спор о приоритетах. Если ученик говорит о боли или болезни — «Küsi perearstilt» и не спорьте. Обратная связь, 2–3 цели: pigem … kui с одинаковыми формами; selle asemel et + da; mida …, seda + сравнительная степень. В дебатах не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(B.text('043_d_hook', 'Hääleta kohe!', 'On reede õhtu, kell seitse. Oled väsinud: töö, kool või laps on võtnud kogu jõu. Mida valid: trenn, jalutuskäik või diivan? Hääleta kohe ja ütle üks põhjus. Või on sul kompromiss?'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('043_d_talk', 'Minu nädal.', 'Vasta ja too näide oma elust.', [
        'Kui palju sa nädalas liigud: kõnnid, sõidad rattaga, teed trenni?',
        'Mis on sinu päeva suurim koormus ja mis aitab sul pärast seda päriselt puhata?',
      ], [150, 210], ['Pigem …', 'Mulle aitab …', 'Selle asemel et …']), 'Sinu enda nädal annab väitluseks esimese näite.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise oma nädalast. Ära paranda; lõpus ütle, kas õpilane kasutas sõna „pigem”. Kui õpilane ei tööta: „Mis väsitab sind kõige rohkem: inimesed, müra või see, et päeval ei liigu?”')),
      station(tag(B.vocab('043_d_vocab', 'Enne lugemist: sõnad.', ['liikuma — двигаться', 'tervisesport — оздоровительный спорт', 'mõõdukas — умеренный', 'koormus — нагрузка', 'taastuma — восстанавливаться', 'väsimus — усталость', 'pigem — скорее (предпочтительно)', 'kompromiss — компромисс', 'seisukoht — позиция', 'vahele jätma — пропускать']), { topic: ['tervisesport', 'taastuma'] }), 2, 15),
      B.text('043_d_facts', 'Liikumine ja puhkus: mida ütlevad soovitused ja numbrid?', 'Riiklike soovituste järgi võiks täiskasvanu koguda nädalas 150–300 minutit mõõdukat liikumist, kas või kiiret kõndi. Kui pikk trenn päeva ei mahu, võib pool tundi jagada kaheks 15-minutiliseks pausiks: pigem kümme minutit kui mitte midagi. Selle asemel et õhtul tund aega istuda, võib minna poodi jalgsi. TAI andmetel teeb vähemalt kaks korda nädalas tervisesporti 44 % 16–64-aastastest, iga neljas aga liigub sel eesmärgil kord kuus või harvem. Mida regulaarsemalt inimene liigub, seda paremaks ta oma tervist sageli hindab (70 % versus 51 %). Ka uni on tervise osa: keha taastub öösel ja väsimus ei kao ilma uneta; enamikule täiskasvanutele sobib 7–9 tundi. *Allikas: TAI, „Rahvastiku tervise aastaraamat 2026”; TAI, riiklikud soovitused (2025).*'),
      tag(purpose(B.truefalse('043_d_check', 'Arva enne, kontrolli pärast.', 'Enne lugemist märgi pliiatsiga: õige või vale? Siis loe teksti ja kontrolli.', [
        ['Tervise jaoks loeb ainult pikk trenn spordiklubis.', false],
        ['Pool tundi liikumist võib jagada kaheks lühemaks pausiks.', true],
        ['Enamik Eesti täiskasvanuid teeb tervisesporti vähemalt kaks korda nädalas.', false],
        ['Iga neljas täiskasvanu liigub tervise nimel kord kuus või veel harvem.', true],
        ['Regulaarselt liikujad hindavad oma tervist sagedamini heaks kui teised.', true],
        ['Soovituste järgi piisab enamikule täiskasvanutele viiest tunnist unest.', false],
      ], 'full', 'g_read'), 'Näed, kas sinu arvamus liikumisest on numbritega kooskõlas; need numbrid lähevad väitlusse.'), { task: 'R13' }),
    ],
    practice: [
      station(B.notice('043_p_notice', 'Märka: mida ma eelistan?', [
        'Tekstist: **Pigem** kümme minutit **kui** mitte midagi. · **Selle asemel et** õhtul tund aega **istuda**, võib minna poodi jalgsi. · **Mida** regulaarsemalt inimene liigub, **seda** paremaks ta oma tervist sageli hindab.',
        '**Pigem** A **kui** B — eelistus: Täna **pigem ujun kui sõidan rattaga**. Mõlemad pooled on samas vormis (ujun — sõidan; saunaõhtut — trenni).',
        '**Selle asemel et** + **da**-tegevusnimi: Selle asemel et bussiga **sõita**, lähen jalgsi. (mitte: sõitma)',
        '**Mida** + keskvõrre …, **seda** + keskvõrre …: **Mida varem** ma magama lähen, **seda erksam** olen hommikul. · **Mida pikem** päev, **seda lühem** trenn.',
        '**eelistama** mida (osastav) millele (-le): Eelistan **jalutuskäiku trennile**. · Kompromiss: **Kui** mitte trenn, **siis vähemalt** jalutuskäik.',
        'Kompromiss väsimuse korral: **pigem** mõõdukas jalutuskäik **kui** raske tervisesport pärast suurt koormust — **mida** paremini keha taastub, **seda** kergem on homme. Minu seisukoht: liikumine jah, sundimine ei.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.errorfix('043_p_fix', 'Foorumipostitus enne saatmist.', 'Keegi kirjutas foorumisse oma õhtustest valikutest. Igas reas on üks viga: kirjuta rida õigesti.', [
        ['Selle asemel et diivanil istuma, lähen õue.', 'Selle asemel et diivanil istuda, lähen õue.|Selle asemel et istuda diivanil, lähen õue.|Selle asemel et diivanil istuda, lähen ma õue.'],
        ['Mida rohkem ma liigun, see paremini ma magan.', 'Mida rohkem ma liigun, seda paremini ma magan.'],
        ['Mida väsinud ma olen, seda kauem ma telefoni vaatan.', 'Mida väsinum ma olen, seda kauem ma telefoni vaatan.'],
        ['Pigem ma jalutan kui jooksma.', 'Pigem ma jalutan kui jooksen.|Ma pigem jalutan kui jooksen.|Pigem jalutan kui jooksen.'],
        ['Pärast öövahetust eelistan ma magamine trennile.', 'Pärast öövahetust eelistan ma magamist trennile.|Pärast öövahetust eelistan magamist trennile.|Pärast öövahetust eelistan ma und trennile.'],
        ['Selle asemel trenni minna helistasin sõbrale ja läksime jalutama.', 'Selle asemel et trenni minna, helistasin sõbrale ja läksime jalutama.|Selle asemel et trenni minna, helistasin ma sõbrale ja läksime jalutama.'],
        ['Eelistan pigem lühikest jalutuskäiku kui pikk trenn.', 'Eelistan pigem lühikest jalutuskäiku kui pikka trenni.|Eelistan lühikest jalutuskäiku pigem kui pikka trenni.'],
      ], 'full', 'g_notice'), 'Postitust loevad võõrad; ilma vigadeta on sinu arvamus veenvam.'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis on siin eelistus ja mis kompromiss?” Rida 7: pigem … kui … — mõlemad pooled samas käändes (jalutuskäiku — trenni). Kui jääb aega, palu õpilasel kirjutada üks oma lause iga mustriga.'),
    ],
    transfer: [
      station(tag(purpose(B.listening('043_t_callers', 'Raadio: kaks külalist, kaks vastust.', 'Raadiosaade küsib: „Väsinud pärast päeva — trenn või diivan?” Kuula kahte külalist kaks korda ja kirjuta lünka 1–2 sõna. Siis otsusta, kumma argumendid sobivad sulle.', [
        'Saatejuht: Täna on stuudios kaks külalist ja üks küsimus: väsinud pärast päeva — trenn või diivan? Alustab Tiina.',
        'Tiina: Mina teen nii: kui tulen õhtul väsinuna koju, panen kohe tossud jalga ja lähen pooleks tunniks välja. Esimesed kümme minutit on rasked, pärast on pea selgem kui diivanil. Ja harjumus tekkis just sellest, et ma ei jätnud vahele. Kui jätad ühe õhtu vahele, on järgmisel õhtul veel raskem minna.',
        'Saatejuht: Aitäh! Oleg, sina arvad teisiti.',
        'Oleg: Tiinal on päevatöö. Mina tulen öövahetusest hommikul kell seitse. Kui ma siis veel jooksma lähen, olen terve päeva nagu udus. Minu keha vajab kõigepealt und, mitte uut koormust. Ja kui trenn muutub kohustuseks, kaob rõõm ära. Ma eelistan vabal päeval pikka matka kolmele lühikesele sunniviisilisele ringile. Pärast sauna või head raamatut taastun ma paremini kui jõusaalis.',
        'Saatejuht: Kas teie kahe vahel on ka kompromiss?',
        'Tiina: Öövahetuse järel ei peagi jooksma. Ka kiire jalutuskäik poodi on liikumine.',
        'Oleg: Siis olgu nii: pärast öövahetust uni, vabal päeval matk ja tööpäeviti jalgsi poodi.',
      ], [
        'Kui Tiina tuleb õhtul väsinuna koju, läheb ta kohe [pooleks tunniks|30 minutiks] õue.',
        'Tiina sõnul on jalutuskäigu juures rasked ainult esimesed [kümme minutit|10 minutit].',
        'Oleg tuleb öövahetusest koju alles hommikul kell [seitse|7] ega jaksa siis joosta.',
        'Pärast öövahetust vajab Olegi keha tema sõnul kõigepealt [und], mitte uut koormust.',
        'Lühikeste sunniviisiliste ringide asemel eelistab Oleg vabal päeval pikka [matka].',
        'Saate lõpus leitud kompromissi järgi käib Oleg tööpäeviti [jalgsi] poodi.',
      ], 'g_read'), 'Kahe päris eluga inimese argumendid annavad väitlusele mõlemad pooled.'), { voice: 'interview', task: 'L03' }), 4, 15, { final: 'decide' }),
      teach(tag(purpose(B.rolecards('043_t_debate', 'Väitlus, kompromiss ja hääletus.', 'Kas väsinuna tasub end liikuma sundida? Vali pool, õpetaja kaitseb teist. Kumbki toob kolm argumenti ja küsib ühe küsimuse. Lõpus pakute kompromissi ja hääletate.',
        'Olukord: tervisekuu väitlus „Õhtul väsinud: trenn või puhkus?”.\nSinu eesmärk: kaitsta oma seisukohta kolme argumendi ja näitega, vastata vastuargumendile, pakkuda lõpus kompromiss ja põhjendada oma häält.\nTingimus: vähemalt kord „pigem … kui …” ja kord „mida …, seda …”; üks näide tuleb sinu enda või tuttava elust.',
        'Õpetaja kaitseb teist poolt; tal on oma argumendid ja üks küsimus sulle.',
        ['Ma eelistan pigem …', 'Mida …, seda …', 'Selle asemel et …, võiks …', 'TAI andmetel …', 'Kompromiss oleks …'], ['Ma ei ole päris nõus, sest …', 'Aga mis siis, kui …?', 'Olgu, aga vähemalt …']), 'Tulemus: sinu selge hääl, kompromiss ja lause, mis neid põhjendab.'), { task: 'S17', main: true }),
      'Õpetaja kaart: kaitse poolt, mida õpilane ei valinud. Takistused ükshaaval: 1) „Kes öövahetusest tuleb, see ei jaksa — kas sa tahad, et ta trennis kukuks?” 2) „Puhkus on lihtsalt laiskuse ilus nimi.” 3) „Kas sinu tuttavate seas on keegi, kes hakkas liikuma väsinuna ja jäi selle juurde?” Õnnestunud, kui: kolm argumenti, vähemalt kaks fakti või näidet (tekstist, raadiost, oma elust), vastus sinu küsimusele, „pigem … kui …” ja „mida …, seda …”, kompromiss (näiteks: pärast öövahetust uni, vabal päeval jalutuskäik) ja hääl ühe lausega. Hääleta lõpus ka ise. Ära paranda väitluse ajal; kolm märkust lõpus.'),
      extension(teach(tag(purpose(B.speaking('043_t_more', 'Mäng: 30 sekundit, üks lahendus', 'Õpetaja nimetab inimese. Sul on 30 sekundit, et pakkuda talle realistlik liikumise või puhkuse lahendus.', [
        'Inimesed: öövahetusest tulnud vahetuse juht; beebiga ema; 65-aastane, kellel põlv valutab; tudeng eksaminädalal; kontoritöötaja, kes istub üheksa tundi; uustulnuk, kes alles kohaneb uue linnaga.',
        'Alusta: Selle asemel et …, võiks ta …; lõpeta: Mida …, seda …',
      ], [120, 180], ['Selle asemel et …', 'Pigem … kui …', 'Mida …, seda …']), 'Kiire mäng näitab, et hea lahendus sobib inimese päris eluga.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (12 min). Nimeta üks inimene korraga, hoia aega (30 s). Punkt: lahendus sobib inimese olukorraga (põlvevaluga inimene ei jookse; beebiga ema saab jalutada lapsevankriga) + üks tunni muster. Pärast viit inimest vahetage: õpilane nimetab inimese, sina vastad.'), 12),
      tag(exitCheck(purpose(B.gaps('043_t_exit', 'Kontrolli end: kolm valikut.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Täna ma pigem jalutan kui [jooksen]. (jooksma)',
        'Selle asemel et õhtul telefoni [vaadata], loen raamatut. (vaatama)',
        'Mida rohkem ma päeval mõõdukalt liigun, seda [paremini] ma öösel magan. (hästi)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas eelistuse mustrid on käes.')), {}),
      purpose(B.selfcheck('043_t_self', ['Ma räägin, kuidas ma liigun ja puhkan.', 'Ma loen liikumissoovitusi ja numbreid ning kontrollin oma arvamust.', 'Ma ütlen eelistuse ja kompromissi: pigem … kui …, selle asemel et …, mida …, seda …', 'Ma kaitsen väitlusel oma seisukohta ja pakun kompromissi.'], 'Hääl antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('043_t_essay', 'Kodus: arutlus.', 'Kirjuta kodus 150–180 sõna: kas väsinuna tasub end liikuma sundida? Üks poolt- ja üks vastuargument, igaühele näide, kompromiss ja sinu järeldus. Kasuta „pigem … kui …” ja „mida …, seda …”.', [11, 15], ['pigem', 'seda', 'näiteks', 'kokkuvõttes'], 3, 'g_use'), 'Tekst on sinu B2-eksami arutluse harjutus; õpetaja annab tagasisidet argumentidele.')), { task: 'W14', level: 3, harno: 'W2b' }),
      tag(homeTask(purpose(B.speaking('043_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu hea puhkeõhtu — mida sa teed ja mida jätad ära.', [
        'Mida sa pigem teed kui …?',
        'Mis juhtub, kui jätad selle ära?',
      ], [60, 120]), 'Õpetaja kuulab sinu õhtut ja ütleb, kas eelistuse mustrid on õiged.')), { task: 'S15' }),
      homework('043_t_homework', ['1. Arutlus, 150–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-044': {
    title: 'Kaheksa nädalat: üks muutus, mis jääb püsima',
    phases: grammar('Keel: eesmärk ja tulemus — selleks et + da, et + tingiv (et ma ei unustaks), muutuma / saama + -ks'),
    format: 'project',
    topic: 'health',
    subtopic: 'habit-plan',
    canDo: 'Ma saan raadiost aru, kuidas harjumus tekib, teen endale kaheksa nädala plaani ühe muutuse jaoks (probleem → eesmärk → sammud → tulemus) ja esitlen seda; eesmärki ütlen selleks et- ja et-lausega, tulemust muutuma / saama + saav kääne.',
    teacherPage: {
      goal: 'Проект: ученик слушает интервью о том, как формируется привычка, составляет свой план «8 недель — одно изменение» и представляет его; selleks et, et + условное, muutuma / saama + -ks.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 пропуска; станция 4 — один образец, план в 3 строки и рассказ за 1 минуту. Радио (станция 2) — дома.',
      hook: '«Вспомни одно дело, которое ты начинал и бросал: спорт, меньше сладкого, ложиться раньше, эстонский каждый день. Что случилось на третьей неделе?» Ответьте сами одной фразой, потом ученик.',
      plan: [
        '0–3: крючок — третья неделя, ученик отвечает сразу',
        '3–13: станция 1 — разговор: что помогало удержать привычку, кто поддерживает',
        '13–28: станция 2 — слова (2 мин), прогноз «Сколько дней нужно, чтобы привычка стала автоматической?», интервью дважды, 5 пропусков',
        '28–40: станция 3 — заметить «et ma ei saaks», «muutus harjumuseks» → правило → план слушателя: 7 пропусков',
        '40–55: станция 4 — три образца, свой план «Minu 8 nädala muutus», рассказ партнёру 2 минуты и договорённость о контрольном дне',
        '55–67: «Kui aega jääb» — игра «План Б»',
        '67–75: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '75–83: домашнее задание: текст плана 160–180 слов, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Интервью: Lally, van Jaarsveld, Potts & Wardle (2010) «How are habits formed: Modelling habit formation in the real world», European Journal of Social Psychology (University College London; 96 участников; в среднем 66 дней до автоматизма, разброс 18–254 дня; один пропущенный день не мешал); Tartu Maraton — 63 км Otepää–Elva и 31 км классикой (tartumaraton.ee). Слушатель Руслан и исследовательница Piia Lepp — учебные. Образцы планов — учебные.',
      groups: 'Станция 1 — в парах. Интервью — каждый сам, сверка в паре. План — каждый свой; рассказ: один рассказывает, другой — партнёр по здоровью с вашими тремя вопросами; потом смена. В 1:1 партнёр — вы.',
      errors: [
        '«Selleks et ma liigun rohkem» → «Selleks et rohkem liikuda» (selleks et + da, когда делает тот же человек) или «et ma rohkem liiguksin».',
        '«Panen meeldetuletuse, et ma ei unusta» → «…, et ma ei unustaks» (цель с et — условное наклонение).',
        '«Kõndimine muutus harjumus» → «… muutus harjumuseks» (muutuma millekski — транслатив -ks).',
        '«Ma sain tugev» → «Ma sain tugevamaks» (saama / jääma / muutuma + -ks).',
      ],
      notes: [
        'Формат — мини-проект: продукт модуля — карточка «Minu 8 nädala muutus» (она нужна на экзамене 045, выступление 1 минута). Изменение выбирает ученик: еда, движение, сон, отдых, телефон вечером или что-то своё. Не про вес и не про лечение.',
        'Уставшему после смены: шаг очень маленький (10 минут после работы); маме: шаг привязан к сну ребёнка; пенсионеру: шаг с подругой или в группе; студенту: шаг в сессию. Проверьте реалистичность вопросом «Что ты сделаешь в плохой день?»',
        'Обратная связь, 2–3 цели: selleks et + da / et + условное; транслатив после muutuma / saama; план как связный текст (сначала, seetõttu, kahe nädala pärast), а не список.',
      ],
    },
    discover: [
      station(B.text('044_d_hook', 'Kolmas nädal', 'Mõtle ühele asjale, mida oled alustanud ja pooleli jätnud: trenn, vähem suhkrut, varem magama, eesti keel iga päev. Mis juhtus kolmandal nädalal? Ütle kohe üks lause.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('044_d_talk', 'Minu katsed.', 'Vasta ja too näide oma elust.', [
        'Mis aitas sul mõnda harjumust hoida ja mis segas?',
        'Kes sind toetab, kui tahad midagi muuta? Mis oli sinu suurim tagasilöök?',
      ], [150, 210], ['Kolmandal nädalal …', 'Selleks et …', 'Mind aitas …']), 'Sinu enda kogemus näitab, millest sinu plaan peab alguse saama.'), { task: 'S01', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu, kus jätsid midagi pooleli. Ära paranda ega hinda. Lõpus küsi: „Mis oli see päev, kui sa loobusid — mis juhtus?” Kui õpilasel ei ole ühtegi katset: „Mida su pereliige või sõber proovis?”')),
      station(tag(B.vocab('044_d_vocab', 'Enne kuulamist: sõnad.', ['eesmärk — цель', 'samm — шаг', 'kava — план', 'püsima — сохраняться (держаться)', 'meeldetuletus — напоминание', 'tagasilöök — неудача (откат)', 'toetama — поддерживать', 'mõõtma — измерять', 'tulemus — результат', 'loobuma — отказываться (бросать)']), { topic: ['meeldetuletus', 'tagasilöök'] }), 2, 15),
      teach(tag(purpose(B.listening('044_d_radio', 'Raadio: kuidas harjumus tekib?', 'Enne kuulamist arva: mitu päeva kulub, enne kui uus tegevus muutub harjumuseks? Siis kuula kaks korda ja kirjuta lünka 1–2 sõna. Allikas: Lally jt (2010), Londoni ülikool.', [
        'Saatejuht: Tere! Jaanuaris lubavad paljud endale uut elu, aga veebruaris on lubadus kadunud. Miks? Stuudios on terviseteadlane Piia Lepp ja kuulaja Ruslan Narvast.',
        'Piia: Tere! Londoni ülikooli teadlased jälgisid kahe tuhande kümnendal aastal üle üheksakümne inimese, kes tahtsid endale uut harjumust. Keskmiselt kulus kuuskümmend kuus päeva, enne kui tegevus muutus automaatseks. Ühel inimesel kulus kaheksateist päeva, teisel üle kahesaja.',
        'Saatejuht: Seega umbes kaks kuud.',
        'Piia: Umbes. Ja hea uudis: kui üks päev vahele jäi, ei rikkunud see tulemust. Tähtis on järgmisel päeval jätkata, siis harjumus püsib.',
        'Saatejuht: Ruslan, mis on sinu lugu?',
        'Ruslan: Ma olen vahetuse juht. Neli aastat tagasi olin pärast tööd nii väsinud, et istusin ainult teleri ees. Arst ütles, et vererõhk on kõrge. Ma ei hakanud kohe jooksma. Ma lubasin endale ainult kakskümmend minutit kõndimist pärast iga vahetust.',
        'Piia: See on täpselt õige. Uue sammu tasub siduda vana harjumusega: pärast tööd, pärast hommikukohvi.',
        'Ruslan: Kolmandal nädalal tahtsin loobuda. Siis panin telefoni meeldetuletuse ja kutsusin naabri kaasa, et ma ei saaks enam vabandusi otsida. Kahe kuu pärast muutus kõndimine harjumuseks. Mullu sõitsin Tartu Maratonil kolmkümmend üks kilomeetrit.',
        'Saatejuht: Mis on teie nõuanne kuulajatele?',
        'Piia: Alustage väga väikesest. Kirjutage oma kava üles: millal ja kus te seda teete. Märkige iga päev kalendrisse, nii saate tulemust ka mõõta.',
        'Ruslan: Ja ärge oodake esmaspäeva. Alustage täna.',
      ], [
        'Keskmiselt kulus [kuuskümmend kuus|66] päeva, enne kui uus tegevus muutus automaatseks.',
        'Arst ütles Ruslanile neli aastat tagasi, et tema [vererõhk] on kõrge.',
        'Ruslan lubas endale pärast iga vahetust kakskümmend minutit [kõndimist|kõndida].',
        'Kolmandal nädalal pani Ruslan telefoni [meeldetuletuse] ja kutsus naabri kaasa.',
        'Mullu sõitis Ruslan Tartu Maratonil [kolmkümmend üks|31] kilomeetrit.',
      ], 'g_read'), 'Kuuled, kui kaua harjumus tegelikult võtab ja mis aitab kolmandast nädalast üle.'), { voice: 'interview', task: 'L04', harno: 'L3' }),
      'Kuulamise tsükkel: 1) prognoos — „Mitu päeva?” (kirjuta number tahvlile); 2) esimene kuulamine — kas prognoos oli õige; 3) teine kuulamine — lüngad; 4) üks lause: „Mis on minu vana harjumus, millega uue sammu siduda?” Ruslani lugu on Narvast — kui õpilane on ise Narvast, küsi, kus ta seal kõnniks.'),
    ],
    practice: [
      station(B.notice('044_p_notice', 'Märka: milleks ja mis tuleb välja?', [
        'Raadiost: panin meeldetuletuse, **et** ma ei **saaks** vabandusi otsida · kõndimine **muutus harjumuseks** · tegevus **muutus automaatseks**',
        '**Eesmärk tegevusnimega** (sama tegija): **selleks et** + **da**: Panen jalanõud ukse juurde, **selleks et** hommikul kohe õue **minna**.',
        '**Eesmärk kõrvallausega**: **et** + **tingiv**, eriti eitusega: Panen äratuskella, **et** ma ei **magaks** sisse. · Palun naabrit, **et** ta mind **toetaks**. (tegija võib olla teine)',
        '**Tulemus — saav kääne (-ks)**: muutuma / saama / jääma **millekski**: Kõndimine **muutus harjumuseks**. Ma **sain tugevamaks**. Ta **jäi haigeks**. · muutma **mida millekski**: Muudan õhtu **rahulikumaks**.',
        'Kolmandal nädalal tuleb sageli pettumus ja tahaks loobuda — just siis aitab kava, et harjumus püsiks. Plaani ajasõnad: **esimesel nädalal**, **kahe nädala pärast**, **hiljemalt** märtsiks, **iga** päev pärast tööd.',
        'Kava kirjas: Märgin iga päeva kalendrisse, **et** saaksin tulemust **mõõta**. · Kui tuleb tagasilöök, **ei muutu** ma **laisaks**, vaid jätkan.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('044_p_plan', 'Ühe kuulaja kaheksa nädala plaan.', 'Kuulaja saatis saatele oma plaani. Kirjuta sulgudes olev sõna õiges vormis.', [
        'Selleks et rohkem [liikuda], lähen bussist üks peatus varem maha. (liikuma)',
        'Panen telefoni meeldetuletuse, et ma õhtust jalutuskäiku ei [unustaks]. (unustama)',
        'Palun õde, et ta mulle iga pühapäev [helistaks]. (helistama)',
        'Kuue nädala pärast peaks jalutamine olema muutunud [loomulikuks]. (loomulik)',
        'Loodan, et mu põlved saavad suveks [paremaks]. (hea, keskvõrre)',
        'Kui üks päev vahele jääb, ei jää ma [kurvaks], vaid jätkan järgmisel päeval. (kurb)',
        'Selleks et tulemust [näha], märgin iga käidud päeva kalendrisse. (nägema)',
      ], '', 'full', 'g_notice'), 'Õiges vormis plaan on selge sulle endale ja sellele, kes sind toetab.'), { task: 'G13' }),
      'Pärast iga lauset küsi: „Kas see on eesmärk või tulemus?” Read 1 ja 7: sama tegija → selleks et + da; read 2 ja 3: et + tingiv (rida 3: tegija on teine — õde). Read 4–6: -ks. Kui õpilane kirjutab „unustan”, küsi: „Kas see on päris või soov?”'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('044_t_samples', 'Kolm plaani: mis on realistlik?', 'Loe kolme plaani. Milline on kõige realistlikum ja miks? Mida muudaksid teistes?', [
        ['Vahetustega töötaja', ['Probleem: pärast vahetust ainult teler, seetõttu selg valutab.', 'Samm: 10 minutit kõndimist kohe pärast tööd, enne koju minekut.', 'Tugi: kolleeg kõnnib kaasa.'], []],
        ['Lapsega kodus', ['Probleem: magan vähe, mistõttu söön õhtul magusat.', 'Samm: kui laps magab, puhkan ka ise 20 minutit, mitte ei korista.', 'Tugi: abikaasa võtab õhtuti lapse kella üheksani.'], []],
        ['Pensionär', ['Probleem: talvel istun palju kodus.', 'Samm: iga päev pärast lõunat ring ümber maja; kolmapäeval külastan sõbrannat ja teeme koos kepikõnni.', 'Tugi: sõbranna tuleb mulle järele, kui ma ei tule.'], []],
      ], '3', 'g_read'), 'Teiste plaanid näitavad, kui väike võib olla hea esimene samm.'), { task: 'R11', level: 3 }), 4, 15, { final: 'present' }),
      teach(tag(purpose(B.planning('044_t_plan', 'Minu 8 nädala muutus.', 'Vali üks muutus (toit, liikumine, uni, puhkus või midagi muud) ja kirjuta igale reale üks konkreetne lause. Kui sul on vähe aega, vali väga väike samm.', [
        'Probleem: mis mind praegu segab ja mis on selle tagajärg? (… tõttu, mistõttu …)',
        'Eesmärk: mis on kaheksa nädala pärast teisiti? (… muutub …-ks)',
        'Sammud: mida, millal ja kus teen esimesel, neljandal ja kaheksandal nädalal? (selleks et …)',
        'Tugi ja tagasilöök: kes mind toetab ja mida teen, kui üks päev jääb vahele või tahan loobuda? (et ma ei …)',
        'Mõõtmine: kuidas ma tean, et muutus on püsima jäänud?',
      ], 3), 'Kaart jääb sulle: sellest räägid mooduli kontrollis ja selle järgi kirjutad kodus teksti.'), { task: 'W11', level: 3 }),
      'Kaart on mooduli tulemus (vaja tunnis 045, sõnavõtt 1 minut). Kontrolli, et igal real oleks päris asi: kellaaeg, koht, inimene, number. Küsi iga sammu kohta: „Mida sa teed halval päeval?” Väsinud õpilasele: kolm rida (probleem, samm, tugi), mitte rohkem.'),
      teach(tag(purpose(B.rolecards('044_t_present', 'Esitle oma plaani.', 'Esitle plaani tervisepartnerile 2 minutiga. Partner küsib kolm küsimust; leppige kokku, millal ta sinult küsib, kuidas läheb.',
        'Olukord: oled tervisekuu kohtumisel ja esitled oma kaheksa nädala plaani tervisepartnerile (sõber, pereliige või õpetaja).\nSinu eesmärk: partner saab aru probleemist, eesmärgist, sammudest ja mõõtmisest ning te lepite kokku ühe kontrollpäeva.\nPiirang: aega on 2 minutit; plaan peab sobima sinu päris eluga.',
        'Tervisepartneri kaart on õpetajal: kolm küsimust ja üks kahtlus.',
        ['Minu probleem on …, mistõttu …', 'Selleks et …, hakkan …', 'Kaheksa nädala pärast on … muutunud …-ks.', 'Kui üks päev jääb vahele, …'], ['Kas see on realistlik, kui …?', 'Kuidas sa seda mõõdad?', 'Millal ma sinult küsin, kuidas läheb?']), 'Tulemus: sinu plaanil on tunnistaja ja kontrollpäev kalendris.'), { task: 'S16', main: true, level: 4 }),
      'Õpetaja kaart (tervisepartner). Küsimused ükshaaval: 1) „Mis juhtub kolmandal nädalal, kui motivatsioon kaob?” 2) „Kuidas sa tead kaheksa nädala pärast, et see õnnestus?” 3) „Mida sa teed päeval, kui oled haige või väsinud?” Kahtlus: „Kas see ei ole liiga palju korraga?” Õnnestunud, kui õpilane räägib 2 minutit plaani kõik osad läbi, kasutab vähemalt korra selleks et + da, et + tingiv ja muutuma / saama + -ks, vastab kõigile küsimustele ja te panete kalendrisse kontrollpäeva (näiteks kolme nädala pärast).'),
      extension(teach(tag(purpose(B.speaking('044_t_more', 'Mäng: plaan B', 'Õpetaja ütleb takistuse. Sul on 30 sekundit, et öelda, mida sa siis teed, nii et plaan ei katke.', [
        'Takistused: sajab paduvihma; trenn tühistati; buss hilines ja jõudsid koju alles õhtul; said ootamatult öövahetuse; laps jäi haigeks; sõber kutsub sünnipäevale; oled puhkusel teises linnas; kalender jäi koju ja meeldetuletust ei tule.',
        'Alusta: Kui …, siis …; lõpeta: …, et ma ei …',
        'Lõpuks: mis sa arvad, miks on Eestis paljudel raske uut harjumust hoida — kas asi on ilmas, töös või milleski muus?',
      ], [120, 180], ['Kui …, siis …', 'Selleks et …', '…, et ma ei …']), 'Plaan B on see, mis hoiab muutuse elus ka halval nädalal.'), { task: 'S14', fluency: true }),
      'Kui aega jääb (12 min). Ütle üks takistus korraga, hoia aega (30 s). Punkt: plaan B sobib õpilase sammuga (mitte „siis jätan vahele”) + üks eesmärgi muster. Pärast kuut takistust vahetage: õpilane ütleb takistuse sinu plaanile, sina vastad.'), 12),
      tag(exitCheck(purpose(B.gaps('044_t_exit', 'Kontrolli end: eesmärk ja tulemus.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Selleks et õhtul paremini [magada], lülitan ekraanid kell kümme välja. (magama)',
        'Kirjutan plaani külmkapi uksele, et ma seda ei [unustaks]. (unustama)',
        'Kahe kuu pärast muutus õhtune jalutuskäik mulle [lemmiktegevuseks]. (lemmiktegevus)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas eesmärgi ja tulemuse vormid on käes.')), {}),
      purpose(B.selfcheck('044_t_self', ['Ma räägin, mis aitas mul harjumust hoida ja mis segas.', 'Ma saan raadiost aru, kui kaua harjumus tekib ja mis aitab.', 'Ma ütlen eesmärgi ja tulemuse: selleks et + da, et + tingiv, muutuma / saama + -ks.', 'Ma esitlen oma kaheksa nädala plaani ja vastan küsimustele.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('044_t_text', 'Kodus: minu kaheksa nädala plaan.', 'Kirjuta kodus 160–180 sõna: sinu plaan sidusa tekstina, mitte nimekirjana — probleem ja selle tagajärg, eesmärk, sammud nädalate kaupa, tugi ja plaan B ning oodatav tulemus. Kasuta selleks et-lauset, et-lauset tingivas kõneviisis ja muutuma / saama + -ks.', [12, 16], ['selleks et', 'muutub', 'esimesel nädalal', 'tulemus'], 3, 'g_use'), 'Tekst on sinu leping iseendaga; õpetaja vaatab, kas see on sidus ja realistlik.')), { task: 'W05', level: 3 }),
      tag(homeTask(purpose(B.speaking('044_t_home', 'Kodus: sõnavõtt (1 minut).', 'Salvesta 1 minut nagu kohtumisel: minu kaheksa nädala muutus.', [
        'Mis on probleem ja mis on eesmärk?',
        'Mis on sinu esimene samm ja kes sind toetab?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S16' }),
      homework('044_t_homework', ['1. Minu kaheksa nädala plaan, 160–180 sõna (ülesanne lehel).', '2. Sõnavõtt 1 minut, salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-045': {
    title: 'Kontroll 9 — tervis ja eluviis',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 9, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 9, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 9, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid tervise ja eluviisi teemal, kirjutan umbes 140-sõnalise kirja ja 180-sõnalise kokkuvõtte andmetest ning räägin 1 minuti oma kaheksa nädala muutusest; põhjus ja tagajärg, pehme nõuanne, eelistus ja eesmärk on õiges vormis.',
    // Kontroll 9 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). As in module 5 (B2-, recognition ≤ 0.38 of a sheet, didacticCheck.js): R3 is a form text (the word in
    // the right form), the reading sheet ends with a 3–4-sentence answer to the author, the notices are gap notes. Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L1, L3, L4; W1, W2a; S1, S2). Own texts on the module's theme: the sauna (opinion article), food
    // labels (sentence bank), a sports club letter (cloze), sitting and movement (interview); timed by the Harno part
    // headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('045_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad, ja lõpus lühike vastus autorile. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('045_d_vocab', 'Tunnid 41–44: sõnad, mis aitavad', ['koostis — состав', 'tagajärg — последствие', 'apteeker — фармацевт', 'retseptiravim — рецептурное лекарство', 'pigem — скорее', 'kompromiss — компромисс', 'taastuma — восстанавливаться', 'eesmärk — цель', 'meeldetuletus — напоминание', 'püsima — сохраняться'], '2'), { topic: ['koostis', 'meeldetuletus'] }),
      PART('045_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('045_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit saunast ja vasta kahele küsimusele. Siis lahenda selle teksti põhjal osad 1 ja 2.', 'Saun ei ole ainult pesemine', [
        '(A) Kui küsida eestlaselt, mis teeb teda õnnelikuks, nimetab ta üsna kindlasti sauna. Paljudes peredes on saun iga laupäeva kindel osa: köetakse ahi, minnakse lavale, visatakse leili ja tullakse välja jahutama. Paljud mäletavad lapsepõlvest vanaema sauna, kus vihtlemine ja jutuajamine kestsid tunde. Võõrale võib see tunduda lihtsalt pesemisena. Minu arvates on saun aga midagi enamat: see on koht, kus keha ja pea saavad korraga puhata. Ometi räägime saunast harva tõsiselt, justkui oleks see liiga tavaline asi, et sellele mõelda.',
        '(B) Saunakombed on Eestis vana ja elav traditsioon. 2014. aastal kanti Vana-Võromaa suitsusaunakombestik UNESCO inimkonna vaimse kultuuripärandi esindusnimekirja. Suitsusaunas ei ole korstnat: suits jääb kütmise ajal ruumi ja lastakse enne saunaskäiku välja. Võromaal ei ole saun olnud ainult pesemiskoht. Seal on tehtud vihtu, suitsutatud liha ja hoolitsetud haigete eest. Kombestik elab edasi just seepärast, et pered kasutavad oma sauna ikka veel iga nädal.',
        '(C) Viimastel aastatel on saunast hakanud rääkima ka teadlased. Soome uurijad jälgisid umbes kahte tuhandet keskealist meest üle kahekümne aasta. 2015. aastal avaldatud tulemuste järgi oli neil, kes käisid saunas neli kuni seitse korda nädalas, südamehaigustesse suremise risk väiksem kui neil, kes käisid kord nädalas. See on huvitav, kuid ei tõesta, et saun ise inimesi tervemaks teeb. Võib-olla on sagedased saunaskäijad lihtsalt rahulikuma eluga ja neil on rohkem vaba aega. Ka uuringu autorid kutsusid üles tegema lisauuringuid.',
        '(D) Saunaga on seotud ka palju müüte. Sageli öeldakse, et saunas „higistad mürgid välja”. Higi koosneb aga peamiselt veest ja soolast; keha puhastavad maks ja neerud. Teine levinud müüt on, et saun ravib külmetust. Kui palavik on juba üleval, ei ole kuum leiliruum hea mõte, sest keha vajab puhkust. Kolmas ohtlik harjumus on õlu leiliruumis. Alkohol ja kuumus koos koormavad südant ning suurendavad uppumise ohtu, kui pärast sauna minnakse järve.',
        '(E) Tänapäeva linnas on saun muutunud. Uutes kortermajades on sageli väike elektrisaun, mida köetakse vaid paarkümmend minutit. Teised külastavad rahvarohket avalikku sauna või spaad, kus saun on vaba aja osa nagu kino või kohvik. Mõned sõbrad on mulle tunnistanud, et nende korterisaun on aastaid olnud panipaik. Ma saan aru: kiire elu juures tundub poolteist tundi saunas luksus. Just seepärast on see aga vajalik. Mõni ehitab saunaskäigu ümber terve õhtu: jalutuskäik, saun ja lõpuks teetass. Teisele piisab kümnest minutist pärast trenni. Mõlemad on õiged, kui need annavad puhkust, mitte uut kohustust.',
        '(F) Saunas ei vaadata telefoni ega kella. Seal räägitakse ja vaikitakse koos. Paljud ütlevad, et parimad pereotsused on tehtud saunalaval ja et pärast sauna tuleb uni kergemini. Kui rääkida stressist ja puhkusest, siis vähe on kohti, kus tänapäeva inimene on nii täielikult võrgust väljas. Saun on Eestis olnud ka koht, kus võõrad saavad sõpradeks. Mitu Eestisse kolinud uustulnukat on mulle öelnud, et alles esimene ühine saunaõhtu aitas neil kohaneda ja tegi nad kohalikega lähedasemaks. Ma ei tea paremat viisi, kuidas külalisele Eestit tutvustada: see elamus jätab kauemaks mulje kui ükski muuseum.',
        '(G) Ma ei väida, et saun sobib kõigile. Kellel on südamehaigus või kõrge vererõhk, peaks enne kuuma leili arstiga nõu pidama. Ka lapsed ja eakad vajavad mahedamat sauna. Aga kui tervis lubab, võiks saunast saada mitte pühade erand, vaid tavaline nädala osa. Tervis ei ole ainult numbrid ja ravimid. See on ka laupäevaõhtune leil ja hea jutt.',
        'Allikas: autori arvamus; UNESCO vaimse kultuuripärandi esindusnimekiri (2014); Soome uuring, Laukkanen jt (2015).',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Saun ei ole ainult pesemine”?', 'saun on ka puhkus|saun on puhkus kehale ja peale|saun on midagi enamat kui pesemine'], ['Mis on sinu jaoks parim puhkus pärast rasket nädalat? Miks?']]),
      tag(B.choice('045_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida arvab autor lõigu A järgi saunast?', 'see on midagi enamat kui pesemine', 'see on ainult pesemiskoht', 'see on võõrastele liiga keeruline', 'see on Eestist kadumas'],
        ['Mis hoiab lõigu B järgi suitsusaunakombestikku elus?', 'pered kasutavad oma sauna ikka iga nädal', 'Võromaale ehitatakse palju uusi saunu', 'turistid käivad seal sageli', 'kombestik on kirjas seaduses'],
        ['Kuidas suhtub autor Soome uuringusse?', 'tulemus on huvitav, kuid ei tõesta, et saun ise teeb tervemaks', 'uuring tõestab, et saun ravib südant', 'uuring on vale ja see tuleks unustada', 'uuringus osalesid ainult sportlased'],
        ['Mida ütleb lõik D higistamise kohta?', 'higi on peamiselt vesi ja sool, keha puhastavad maks ja neerud', 'higiga lähevad välja kõik mürgid', 'higistamine ravib külmetust', 'higistada tuleb vähemalt tund'],
        ['Mida mõtleb autor lõigus E lausega „Just seepärast on see aga vajalik”?', 'mida kiirem on elu, seda rohkem on puhkust vaja', 'korterisaun on hea panipaik', 'spaa on parem kui kodusaun', 'saunas tuleb olla vähemalt kaks tundi'],
        ['Millise mõttega nõustuks artikli autor kõige tõenäolisemalt?', 'kui tervis lubab, võiks saun olla iga nädala osa', 'saun sobib kõigile ilma eranditeta', 'saunas võib rahulikult õlut juua', 'saun on ainult pühade jaoks'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('045_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Saunas ollakse ilma telefonita. | [F]',
        '2. Üks Eesti saunakomme on maailma vaimse pärandi nimekirjas. | [B]',
        '3. Seos ei pruugi tähendada põhjust. | [C]',
        '4. Alkohol ja leil on koos ohtlikud. | [D]',
        '5. Osa korterisaunu ei kasutata saunana. | [E]',
        '6. Haige inimene peaks enne arstiga rääkima. | [G]',
        '7. Saunast räägitakse vähe, sest see tundub tavaline. | [A]',
        '8. Palavikuga ei ole kuum leiliruum hea mõte. | [D]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('045_d_form', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Spordiklubi liige kirjutab klubile. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri spordiklubile', [
        'Tere!',
        'Kirjutan teile seoses oma [liikmelisusega] (liikmelisus). Olen käinud teie klubis kaks aastat ja just tänu teie [treeneritele] (treener) hakkasin regulaarselt liikuma.',
        'Paraku sain jaanuarist öövahetused, mistõttu ma ei jõua enam õhtustesse [rühmadesse] (rühm). Kas oleks võimalik oma kaart kaheks kuuks [peatada] (peatama)?',
        'Selle asemel et täishinda [maksta] (maksma), [eelistaksin|eelistan] (eelistama) hommikust paketti, mis on odavam.',
        'Perearsti sõnul [peaksin] (pidama) ma pärast vahetust pigem ujuma kui [raskusi] (raskus) tõstma.',
        'Loodan, et kahe kuu pärast on ujumine mulle [harjumuseks] (harjumus) [muutunud] (muutuma) ja öövahetused ei ole enam nii väsitavad. Lisan kirjale viimase makse kviitungi.',
        'Lugupidamisega\nklubi liige Natalja Ivanova',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('045_d_bank', 'Osa 4: lause lünka (6 punkti).', 'Tekstist on välja võetud kuus lauset. Vali igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas meie pere hakkas silte lugema', [
        'Veel mullu ostsin poest seda, mida lapsed tahtsid. [[Silte ma ei lugenud, sest mul polnud aega.]] Korvi läks see, mis oli soodne ja tuttav.',
        'Siis tuli tütar koolist ja rääkis, et nende tunnis võrreldi jogurteid. [[Ühes topsis oli suhkrut rohkem kui tükis koogis.]] Ma ei uskunud teda ja läksin ise poodi kontrollima. [[Tal oli õigus: suhkur oli koostises teisel kohal.]]',
        'Sellest päevast hakkasime poes mängima sildidetektiivi. [[Iga pereliige valib ühe toote ja loeb sildi teistele ette.]] Võidab see, kes leiab kõige rohkem soola või suhkrut.',
        'Alguses kulus poes pool tundi rohkem. [[Kuu aja pärast teadsime oma lemmiktooteid aga peast.]] Nüüd võrdleme silte ainult siis, kui ostame midagi uut.',
        'Kõige rohkem üllatas mind leib. [[Kuna sööme leiba iga päev, saame sealt palju soola.]] Nüüd ostame leiba, milles on soola vähem, ja lapsed ei ole erinevust märganud.',
      ], ['Seepärast ostame nüüd ainult kõige kallimaid tooteid.'], 'g_read'), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition, as in module 5)
      tag(B.writing('045_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus, et saun võiks olla iga nädala osa? Kirjuta 3–4 lauset: tunnista üht autori mõtet, vaidle viisakalt vastu või toeta teda ja too üks näide oma elust.', [3, 4], ['pigem', 'tänu', 'kuigi'], 1), { task: 'W08' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('045_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: lühikesi teateid kuuled ainult üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('045_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 41–44. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('045_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Sõbrad palusid sul oma tervisesõnumid enne saatmist üle vaadata. Igas sõnumis on üks viga: kirjuta see õigesti.', [
        ['Halva une tänu olen tööl väsinud.', 'Halva une tõttu olen tööl väsinud.|Halva une tõttu olen ma tööl väsinud.'],
        ['Suhkur mõjub tervist halvasti.', 'Suhkur mõjub tervisele halvasti.|Suhkur mõjub halvasti tervisele.'],
        ['Sa võiks enne ravimi võtmist infolehte lugeda.', 'Sa võiksid enne ravimi võtmist infolehte lugeda.|Sa võiksid enne ravimi võtmist infolehe läbi lugeda.'],
        ['Selle asemel et istuma, lähen õhtul jalutama.', 'Selle asemel et istuda, lähen õhtul jalutama.|Selle asemel et istuda, lähen ma õhtul jalutama.'],
        ['Mida rohkem ma kõnnin, see kergem on hommikul ärgata.', 'Mida rohkem ma kõnnin, seda kergem on hommikul ärgata.'],
        ['Panen meeldetuletuse, et ma ei unustan trenni.', 'Panen meeldetuletuse, et ma trenni ei unustaks.|Panen meeldetuletuse, et ma ei unustaks trenni.'],
      ]),
      B.transformation('045_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte ümber nii, et kasutad antud sõna.', [
        ['Ma magan halvasti, sest joon õhtul kohvi.', 'tõttu', 'Õhtuse kohvi tõttu magan ma halvasti.|Õhtuse kohvi tõttu magan halvasti.|Õhtul joodud kohvi tõttu magan ma halvasti.'],
        ['Mine arsti juurde!', 'võiksid', 'Sa võiksid arsti juurde minna.|Sa võiksid minna arsti juurde.|Võiksid arsti juurde minna.'],
        ['Ma ei taha joosta. Ma eelistan jalutada.', 'pigem … kui', 'Ma pigem jalutan kui jooksen.|Pigem jalutan kui jooksen.|Ma jalutan pigem kui jooksen.'],
        ['Panen jalanõud ukse juurde. Tahan hommikul kohe õue minna.', 'selleks et', 'Panen jalanõud ukse juurde, selleks et hommikul kohe õue minna.|Ma panen jalanõud ukse juurde, selleks et hommikul kohe õue minna.|Selleks et hommikul kohe õue minna, panen jalanõud ukse juurde.'],
        ['Kõndimisest sai kahe kuuga harjumus.', 'muutus', 'Kõndimine muutus kahe kuuga harjumuseks.|Kahe kuuga muutus kõndimine harjumuseks.'],
        ['Ma loen nüüd silte. Ma ostan vähem soola.', 'tänu', 'Tänu siltide lugemisele ostan ma vähem soola.|Tänu siltide lugemisele ostan vähem soola.|Tänu sellele, et ma loen nüüd silte, ostan ma vähem soola.'],
      ]),
      PART('045_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      tag(B.listening('045_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuulad kuut lühikest teadet, igaüht ainult üks kord. Kirjuta lünka 1–2 sõna või arv.', [
        '1. Teade apteegis. Head kliendid! Alates esmaspäevast saab meie apteegis gripi vastu vaktsineerida teisipäeviti ja neljapäeviti kella kolmest seitsmeni. Aja saab broneerida meie kodulehel. Ilma broneeringuta vaktsineerime ainult siis, kui on vabu aegu.',
        '2. Raadiouudis. Tartu Maratoni registreerimine algab esmaspäeval. Lisaks kuuekümne kolme kilomeetri distantsile saab valida kolmekümne ühe kilomeetri sõidu. Lastele on oma lühikesed distantsid. Kes registreerub varem, maksab vähem.',
        '3. Teade spordikeskuses. Tähelepanu! Ujula on hooldustööde tõttu suletud kuni kahekümnenda kuupäevani. Jõusaal ja saun on avatud tavapäraselt. Ujula kuukaardi omanikele pikendatakse kaarti nädala võrra.',
        '4. Automaatvastaja. Tere! Olete helistanud perearstikeskusesse. Kui vajate nõu ööpäev läbi, helistage perearsti nõuandetelefonile üks kaks kaks null. Eluohtliku olukorra korral helistage üks üks kaks. Retsepti pikendamiseks vajutage üks.',
        '5. Raamatukogu teade. Neljapäeval kell kuus on raamatukogus loeng „Kuidas lugeda toidusilti”. Esineb toitumisnõustaja. Sissepääs on tasuta, aga kohti on kolmkümmend, seepärast palume eelnevalt registreeruda.',
        '6. Teade bussipeatuses. Linnaosa terviseklubi kutsub kõiki eakaid kolmapäeviti kepikõnnile. Kogunemine on kell kümme pargi väravas. Kepid saab kohapeal laenata ja osalemine on tasuta.',
      ], [
        'Apteegis vaktsineeritakse gripi vastu teisipäeviti ja [neljapäeviti|neljapäeval] kella kolmest seitsmeni.',
        'Peale pika distantsi saab Tartu Maratonil sõita ka [kolmkümmend üks|31] kilomeetrit.',
        'Spordikeskuses on hooldustööde tõttu suletud ainult [ujula].',
        'Nõu ööpäev läbi saab perearsti nõuandetelefonilt [1220|üks kaks kaks null].',
        'Toidusildi loengule tuleb eelnevalt registreeruda, sest kohti on [kolmkümmend|30].',
        'Kepikõnni kepid saab kohapeal [laenata|tasuta laenata].',
      ], 'g_listen'), { task: 'L06', harno: 'L1' }),
      tag(B.listening('045_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime istumisest. Stuudios on liikumisnõustaja Kaia Rebane. Kaia, kui palju me istume?',
        'Kaia: Paljud istuvad päevas kaheksa kuni kümme tundi: tööl, autos ja õhtul teleri ees. Keha ei ole selleks loodud.',
        'Saatejuht: Kas õhtune trenn seda ei paranda?',
        'Kaia: Trenn on väga kasulik, aga ka see ei kaota pika istumise mõju täielikult. Seepärast soovitan iga tunni järel püsti tõusta ja paar minutit liikuda.',
        'Saatejuht: Kuidas seda meeles pidada?',
        'Kaia: Kõige lihtsam on telefoni meeldetuletus. Telefonikõnesid võib pidada seistes ja lõunapausil tasuks minna õue.',
        'Saatejuht: Aga kui inimene ütleb, et tal ei ole trenniks aega?',
        'Kaia: Siis alustagu väikesest. Riiklike soovituste järgi on täiskasvanul hea olla iga päev vähemalt pool tundi aktiivne. Selle võib jagada kaheks viieteistminutiliseks pausiks. Igasugune liikumine loeb, ka trepist käimine.',
        'Saatejuht: Ja lihasharjutused?',
        'Kaia: Neid võiks teha kaks kuni kolm korda nädalas. Selleks ei ole vaja jõusaali: piisab oma keharaskusest või veepudelitest.',
        'Saatejuht: Mis on kõige sagedasem viga?',
        'Kaia: Inimesed alustavad liiga suurelt. Esimesel nädalal jooksevad iga päev, teisel on jalad valusad ja kolmandal on kõik läbi.',
        'Saatejuht: Üks nõuanne lõpuks?',
        'Kaia: Ärge küsige, kas teil on aega trenniks. Küsige, mitu korda te täna püsti tõusite.',
      ], [
        'Paljud inimesed istuvad päevas [kaheksa kuni kümme|8–10|8-10] tundi.',
        'Õhtune trenn ei kaota pika istumise [mõju] täielikult.',
        'Nõustaja soovitab iga [tunni] järel püsti tõusta.',
        'Kõige lihtsam on panna telefoni [meeldetuletus|meeldetuletuse].',
        'Lõunapausil tasuks minna [õue].',
        'Täiskasvanul on hea olla iga päev vähemalt [pool tundi|30 minutit] aktiivne.',
        'Pool tundi võib jagada kaheks [viieteistminutiliseks|15-minutiliseks] pausiks.',
        'Lihasharjutusi võiks teha [kaks kuni kolm|2–3|2-3] korda nädalas.',
        'Kõige sagedasem viga on alustada liiga [suurelt].',
      ], 'g_listen'), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('045_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Liikumisnõustaja sõnul on inimese keha loodud selleks, et päevas kaua istuda.', false],
        ['Kui inimene käib õhtul trennis, kaob pika istumise mõju täielikult.', false],
        ['Nõustaja arvates võib tööl telefonikõnesid pidada ka seistes.', true],
        ['Kes ütleb, et tal pole trenniks aega, võiks alustada väikesest sammust.', true],
        ['Trepist käimine ei ole nõustaja arvates veel päris liikumine.', false],
        ['Lihasharjutuste tegemiseks on nõustaja sõnul kindlasti vaja jõusaali.', false],
        ['Kes alustab liiga suurelt, sellel saab kõik sageli kolmandal nädalal läbi.', true],
        ['Nõustaja soovitab lugeda, mitu korda sa päeva jooksul püsti tõused.', true],
      ], 'full', 'g_listen'), { task: 'L05', harno: 'L4' }),
      B.rubric('045_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('045_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad korteriühistule kirja ja teed joonise põhjal kokkuvõtte. Sõnavõtus esitled mooduli tulemust: oma kaheksa nädala muutust, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own 8-week change, built in 041–044
      B.planning('045_t_product', 'Mooduli tulemus: minu kaheksa nädala muutus.', 'Täienda tunnis 44 tehtud kaarti ja lisa igale reale üks asi teistest tundidest.', ['Mis on minu probleem ja selle tagajärg? (tund 41: … tõttu, mistõttu …)', 'Kelle käest ma vajadusel nõu küsin? (tund 42: apteeker, 1220, perearst)', 'Mida ma pigem teen kui …? (tund 43: pigem … kui …, selle asemel et …)', 'Mis on minu sammud ja tulemus? (tund 44: selleks et …, … muutub …-ks)']),
      PART('045_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja kokkuvõtte eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('045_t_letter', 'Kirjutamine 1: kiri korteriühistule (umbes 140 sõna).', 'Sinu maja korteriühistu plaanib hoovi väikest välijõusaali. Ehitus tõstab mõneks ajaks igakuist makset. Ühistu küsib elanike arvamust. Kirjuta juhatusele: kes sa oled, kas toetad plaani ja miks, üks mure ja üks ettepanek.', 'Lugupeetud korteriühistu juhatus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      B.chart('045_t_chart', 'Kui paljud koolilapsed söövad iga päev köögi- ja puuvilju? (%, 2022)', { kind: 'bar', unit: '%', series: ['11-aastased', '15-aastased'], rows: ['Köögiviljad | 35 | 27', 'Puuviljad | 44 | 29'], source: 'Tervise Arengu Instituut, „Rahvastiku tervise aastaraamat 2026”, ptk 3.3.3 (HBSC 2022)' }),
      tag(B.writing('045_t_summary', 'Kirjutamine 2: kokkuvõte andmetest (umbes 180 sõna).', 'Kirjuta joonise põhjal kokkuvõte: mis on peamine, kuidas erinevad 11- ja 15-aastased ning köögi- ja puuviljad (võrdluseks: uuringu riikide keskmine köögiviljade puhul oli 38 %) ja sinu hinnang — mis võiks olla põhjus ja mida tasuks teha.', [14, 18], ['joonisel', 'võrreldes', 'seevastu', 'minu arvates'], 3), { task: 'W15', harno: 'W2a' }),
      PART('045_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('045_t_present', 'Rääkimine 1: sõnavõtt tervisekuu kohtumisel (1 minut).', 'Teemakaart: tervisekuu kohtumisel räägib igaüks oma kaheksa nädala muutusest. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mis on sinu muutus ja miks just see?', 'Mida teed esimesel ja kaheksandal nädalal?', 'Mis võib segada ja mida siis teed?', 'Paariline küsib: „Kuidas sa tead, et see õnnestus?”', 'Kes vastutab sinu arvates tervise eest rohkem: inimene ise või riik? Miks?', 'Mis on sinu arvates Eestis tervislikult elamisel kõige raskem?'], [90, 180], ['Tahaksin rääkida oma muutusest …', 'Selleks et …, hakkasin …', 'Kaheksa nädala pärast …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('045_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas toidupakendi esiküljele peaks tulema lihtne värviline hinne (näiteks A–E)? Argumendid: poes on vähe aega ja silt on keeruline; värv on arusaadav ka lapsele ja võõrkeelsele ostjale; Prantsusmaal on selline märk kasutusel alates 2017. aastast. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas toidupakendi esiküljele peaks tulema lihtne värviline hinne (näiteks A–E)? Argumendid: üks täht lihtsustab liiga palju; tootja võib muuta retsepti ainult hinde pärast; tähtis info (koostis, allergeenid) on niikuinii tagaküljel. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks minu peres …', 'Ma saan aru, aga …'], ['Ma ei ole päris nõus, sest …', 'Teisalt …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('045_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: kes sa oled, seisukoht ja põhjus, mure ja ettepanek, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Kokkuvõte: peamine suundumus, võrdlus arvudega, üldistus ja oma põhjendatud kommentaar, umbes 180 sõna (15 punkti).', 'Sõnavõtt: muutus, sammud ja takistus 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('045_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, kokkuvõte 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 9 läbitud'),
    ],
  },
}, {
  'b1b2-041': 'LUGU R→W', 'b1b2-042': 'KUUL L→W', 'b1b2-043': 'AVAS R→S', 'b1b2-044': 'PROB L→S', 'b1b2-045': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 041
  '041_d_read': [
    '2. lõik: „sõid … päevas keskmiselt 233 grammi köögivilju”.',
    '2. lõik: „Vähemalt 300 grammi köögivilju sõi päevas ainult umbes kolmandik täiskasvanutest”.',
    '2. lõik: „vähem kui viis grammi soola päevas, see on umbes üks teelusikatäis”.',
    '2. lõik: soola tuleb „leivast, vorstist ja valmistoidust”.',
    '3. lõik: „kõlblik kuni” on ohutuse tähtaeg — pärast seda „toodet süüa ei tohi”.',
    '3. lõik: teave „sajas grammis” — nii saab võrrelda ka eri suurusega pakendeid.',
  ],
  '041_p_links': [
    'Halb tagajärg → omastav + tõttu; magama ei saa → verb kohe pärast algust (V2): ei saa ma.',
    'Hea tagajärg → tänu + alaleütlev: jalgsi käimisele.',
    'mistõttu → koma ees, kõrvallause: mistõttu olen …',
    'Seetõttu algab uue lause või lauseosa; tegusõna kohe järel: ostab ta.',
    'Tegusõnast nimisõna: magab vähe → vähese une tõttu (halb tagajärg).',
    'Hea tagajärg → tänu ühisele õhtusöögile.',
    'mõjuma millele → alaleütlev: hammastele ja kehakaalule.',
  ],
  '041_t_exit': [
    'Hea tagajärg (magan paremini) → tänu + -le.',
    'Halb tagajärg (raske keskenduda) → une tõttu.',
    'mõjuma millele → alaleütlev: vererõhule.',
  ],
  '041_t_voice': [
    'Sõnum: „kolm pakki kahe hinnaga”.',
    'Sõnum: „Lapsed tahavad ainult seda maasikatega”.',
    'Sõnum: „Pakk on suurem ja ka kallim.”',
    'Sõnum: vanaemal „on nisu allergia”.',
    'Sõnum: „Helista mulle kümne minuti jooksul”.',
    'Sõnum: „sa ütlesid ju, et hommikul peaks olema vähem suhkrut”.',
  ],
  // 042
  '042_d_radio': [
    'Apteeker: „Võtke kaasa oma isikut tõendav dokument … ja öelge … oma mehe isikukood.”',
    'Apteeker: „Retsept peab olema avalik või peab teil olema volitus.”',
    'Apteeker: „antibiootikum ei ravi viirushaigust, ja nohu on tavaliselt viirus”.',
    'Apteeker: „võiksite helistada perearsti nõuandetelefonile 1220”; 112 on siis, kui on raske hingata.',
    'Apteeker: „Paljudes apteekides … vaktsineeritakse sügisel gripi vastu ja aja saab broneerida internetis.”',
    'Apteeker: „Viige need ohtlike jäätmete kogumispunkti või küsige oma apteegist”.',
  ],
  '042_p_soft': [
    'võiksid + da-tegevusnimi: minna.',
    'Oleks parem, kui + tingiv; eitus: ei jooks.',
    'tasuks + da-tegevusnimi: lugeda.',
    'soovitaksin (sul) + da-tegevusnimi: helistada.',
    'Kas sa ei tahaks + da-tegevusnimi: broneerida? — küsimus jätab valiku.',
    'peaksid + ma-tegevusnimi: viima.',
    'Äkki + tingiv: paneksid.',
  ],
  '042_t_voice': [
    'Tamara: „perearst kirjutas mulle uue vererõhuravimi”.',
    'Tamara: „põlv valutab”.',
    'Tamara: „Oma isikukoodi saadan sulle sõnumiga.”',
    'Tamara: „gripisüst maksab kolmkümmend eurot”.',
    'Tamara: „Ma olen kuuskümmend kaheksa.”',
    'Tamara: „mõned on kaks aastat aegunud”.',
  ],
  '042_t_exit': [
    'sina → võiksid (+ küsida).',
    'Oleks parem, kui + tingiv; eitus: ei viskaks.',
    'Isikuta pehme nõuanne: tasuks + da.',
  ],
  // 043
  '043_d_check': [
    'Vale: „pigem kümme minutit kui mitte midagi” ja poodi võib minna ka jalgsi.',
    'Õige: „võib pool tundi jagada kaheks 15-minutiliseks pausiks”.',
    'Vale: 44 % ei ole enamik.',
    'Õige: „iga neljas aga liigub sel eesmärgil kord kuus või harvem”.',
    'Õige: „70 % versus 51 %”.',
    'Vale: „enamikule täiskasvanutele sobib 7–9 tundi”.',
  ],
  '043_p_fix': [
    'selle asemel et + da-tegevusnimi: istuda.',
    'mida …, seda … (mitte „see”).',
    'mida + keskvõrre: väsinum.',
    'pigem … kui … — mõlemad pooled samas vormis: jalutan — jooksen.',
    'eelistama mida → osastav: magamist (või und).',
    'Lauseühend on „selle asemel et” — „et” ei jää ära.',
    'pigem … kui … — samas käändes: lühikest jalutuskäiku — pikka trenni.',
  ],
  '043_t_callers': [
    'Tiina: „lähen pooleks tunniks välja”.',
    'Tiina: „Esimesed kümme minutit on rasked”.',
    'Oleg: „tulen öövahetusest hommikul kell seitse”.',
    'Oleg: „Minu keha vajab kõigepealt und”.',
    'Oleg: „Ma eelistan vabal päeval pikka matka”.',
    'Oleg: „tööpäeviti jalgsi poodi”.',
  ],
  '043_t_exit': [
    'pigem jalutan kui jooksen — mõlemad pooled samas vormis.',
    'selle asemel et + da-tegevusnimi: vaadata.',
    'mida rohkem …, seda + keskvõrre: paremini.',
  ],
  // 044
  '044_d_radio': [
    'Piia: „Keskmiselt kulus kuuskümmend kuus päeva”.',
    'Ruslan: „Arst ütles, et vererõhk on kõrge.”',
    'Ruslan: „kakskümmend minutit kõndimist pärast iga vahetust”.',
    'Ruslan: „panin telefoni meeldetuletuse”.',
    'Ruslan: „sõitsin Tartu Maratonil kolmkümmend üks kilomeetrit”.',
  ],
  '044_p_plan': [
    'selleks et + da (sama tegija): liikuda.',
    'et + tingiv, eitus: ei unustaks.',
    'et + tingiv, teine tegija (õde): helistaks.',
    'muutuma millekski → saav: loomulikuks.',
    'saama + saav, keskvõrre: hea → parem → paremaks.',
    'jääma + saav: kurvaks.',
    'selleks et + da: näha.',
  ],
  '044_t_exit': [
    'selleks et + da-tegevusnimi: magada.',
    'et + tingiv, eitus: ei unustaks.',
    'muutuma millekski → saav: lemmiktegevuseks.',
  ],
  // 045
  '045_d_read': [
    '(A) ja (F)–(G): saun on koht, kus „keha ja pea saavad korraga puhata” — midagi enamat kui pesemine.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '045_d_mc': [
    '(A): „Minu arvates on saun aga midagi enamat”.',
    '(B): „Kombestik elab edasi just seepärast, et pered kasutavad oma sauna ikka veel iga nädal.”',
    '(C): „See on huvitav, kuid ei tõesta, et saun ise inimesi tervemaks teeb.”',
    '(D): „Higi koosneb aga peamiselt veest ja soolast; keha puhastavad maks ja neerud.”',
    '(E): kiire elu juures tundub saun luksus — „Just seepärast on see aga vajalik.”',
    '(G): „kui tervis lubab, võiks saunast saada … tavaline nädala osa”.',
  ],
  '045_d_para': [
    '(F): „Saunas ei vaadata telefoni ega kella.”',
    '(B): suitsusaunakombestik on UNESCO esindusnimekirjas.',
    '(C): uuring „ei tõesta, et saun ise inimesi tervemaks teeb”.',
    '(D): „Alkohol ja kuumus koos koormavad südant”.',
    '(E): korterisaun on „aastaid olnud panipaik”.',
    '(G): südamehaigusega inimene „peaks enne kuuma leili arstiga nõu pidama”.',
    '(A): „justkui oleks see liiga tavaline asi, et sellele mõelda”.',
    '(D): „Kui palavik on juba üleval, ei ole kuum leiliruum hea mõte”.',
  ],
  '045_d_form': [
    'seoses millega → kaasaütlev: liikmelisusega.',
    'tänu + alaleütlev, mitmus: treeneritele.',
    'jõudma kuhu → sisseütlev, mitmus: rühmadesse.',
    'Kas oleks võimalik + da-tegevusnimi: peatada.',
    'selle asemel et + da-tegevusnimi: maksta.',
    'Viisakas soov tingivas: eelistaksin (ka „eelistan” on õige).',
    'Arsti sõnul + mina-vorm tingivas: peaksin (+ ma-tegevusnimi ujuma).',
    'tõstma mida → osastav, mitmus: raskusi.',
    'muutuma millekski → saav: harjumuseks.',
    'on + -nud (täisminevik): on muutunud.',
  ],
  '045_d_bank': [
    'Ostsin, mida lapsed tahtsid → silte ei lugenud.',
    'Tunnis võrreldi jogurteid → mida leiti.',
    'Läksin kontrollima → tal oli õigus.',
    'Mäng „sildidetektiiv” → kuidas seda mängitakse.',
    'Alguses kulus aega → kuu pärast teadsime peast.',
    'Üllatas leib → miks: palju soola. Üle jääb lause „ainult kõige kallimaid tooteid”, mis ei sobi loo mõttega.',
  ],
  '045_p_fix': [
    'Halb põhjus → tõttu (mitte tänu).',
    'mõjuma millele → alaleütlev: tervisele.',
    'sina-vorm tingivas: võiksid.',
    'selle asemel et + da: istuda.',
    'mida …, seda … (mitte „see”).',
    'Eesmärk et-lausega → tingiv: ei unustaks.',
  ],
  '045_p_trans': [
    'sest joon kohvi → õhtuse kohvi tõttu.',
    'Käsk → pehme nõuanne: võiksid minna.',
    'Eelistus: pigem jalutan kui jooksen.',
    'Sama tegija → selleks et + da: minna.',
    'muutuma millekski → saav: harjumuseks.',
    'Hea tagajärg → tänu siltide lugemisele.',
  ],
  '045_p_notes': [
    'Teade 1: „teisipäeviti ja neljapäeviti kella kolmest seitsmeni”.',
    'Teade 2: „Lisaks kuuekümne kolme kilomeetri distantsile saab valida kolmekümne ühe kilomeetri sõidu.”',
    'Teade 3: „Ujula on hooldustööde tõttu suletud”.',
    'Teade 4: „nõuandetelefonile üks kaks kaks null”.',
    'Teade 5: „kohti on kolmkümmend, seepärast palume eelnevalt registreeruda”.',
    'Teade 6: „Kepid saab kohapeal laenata ja osalemine on tasuta.”',
  ],
  '045_p_listen': [
    'Kaia: „Paljud istuvad päevas kaheksa kuni kümme tundi”.',
    'Kaia: „ei kaota pika istumise mõju täielikult”.',
    'Kaia: „iga tunni järel püsti tõusta”.',
    'Kaia: „Kõige lihtsam on telefoni meeldetuletus.”',
    'Kaia: „lõunapausil tasuks minna õue”.',
    'Kaia: „iga päev vähemalt pool tundi aktiivne”.',
    'Kaia: „kaheks viieteistminutiliseks pausiks”.',
    'Kaia: „kaks kuni kolm korda nädalas”.',
    'Kaia: „Inimesed alustavad liiga suurelt.”',
  ],
  '045_p_tf': [
    'Vale: „Keha ei ole selleks loodud.”',
    'Vale: trenn „ei kaota pika istumise mõju täielikult”.',
    'Õige: „Telefonikõnesid võib pidada seistes”.',
    'Õige: „Siis alustagu väikesest.”',
    'Vale: „Igasugune liikumine loeb, ka trepist käimine.”',
    'Vale: „Selleks ei ole vaja jõusaali”.',
    'Õige: „teisel on jalad valusad ja kolmandal on kõik läbi”.',
    'Õige: „Küsige, mitu korda te täna püsti tõusite.”',
  ],
};
