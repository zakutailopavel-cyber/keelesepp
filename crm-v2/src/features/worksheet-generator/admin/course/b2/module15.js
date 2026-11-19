// B2 course (B1 → B2 roadmap), module 15 „Meedia, info ja kriitiline lugemine” (b1b2-071…075), stage B2- (homework
// 180–220 words, a step up from module 13's 160–200; the B2 opener and exam article lengths; the roadmap's reading line:
// fact / opinion, the author's position, the strength of an argument, a summary that does not distort).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–13. Module goal (the learner): „Ma oskan meediat lugeda nagu B2 lugeja: eristan fakti ja
// arvamust, leian autori seisukoha, hindan argumenti ja arvu ning teen kokkuvõtte, kus minu arvamus on eraldi”; module
// product „Minu meediamenüü” (074 Kasuta: where I read and listen in Estonian + four rules of my own; the S1 one-minute
// talk in 075). Media from the learner's own angle: the headlines in his feed, the comments under the news he reads, the
// influencer posts in his phone, the „average wage” in the news that is not his wage.
// Not repeated from module 12 (058: checking a news item before sharing, Pennycook & Rand, screenshots, old photos, a
// deepfake ad, forwarded voice messages): this module does not ask „is it true?” but „how is it said, by whom, with
// what evidence, who pays and what does the number hide?”. Not module 11's sales tricks (Black Friday): the advertising
// lesson is about recognising paid content and weighing its claims, not about prices.
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 15).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   071 game     „Sama uudis, neli pealkirja: kas pealkiri ütleb tõtt?”                 town     final present: defend a headline at the editors' meeting (S16)
//   072 debate   „Kommentaarium: sõnavabadus või sõimuväljak?”                          culture  final decide: the readers' council, argument cards (S17)
//   073 case     „„Minu lemmikkreem!” — kas see on soovitus või reklaam?”                money    final complain: a message to an influencer (W02 in class, W14 at home)
//   074 facts    „Keskmine palk on 2135 eurot — miks enamik teenib vähem?”              work     final plan: „Minu meediamenüü” + the summary plan
//   075 exam     Kontroll 15 in Harno B2 form + „Minu meediamenüü” as the S1 one-minute talk.
// Grammar line of the roadmap (071 „языковые маркеры уверенности и оценки”, 072 tone and word choice, 073 claim / reason /
// evidence, 074 the author's content apart from one's own view), by discovery and spiralled: how certain a claim is —
// kindlasti, tõenäoliselt, võib-olla, väidetavalt, kuuldavasti, and the evaluative words taas, koguni, alles, ainult (071;
// back in 072's radio call-in, 073's podcast and 075; module 5's 021 had kindlasti / ilmselt — here the step is the
// hearsay words and the evaluative words that turn a fact into an opinion); passing on the author's thought — autori sõnul / arvates, autor leiab /
// rõhutab / möönab, et …, the quotative olevat / toovat / ei muutvat (a step above module 7's väidetakse, olevat) (072;
// back in 073, 074's summary and 075); participles in an evaluation — makstud koostöö, tõestatud toime, kontrollitav
// väide, äratuntav reklaam, tõendamata, märgistamata (after B1 module 11's kasutatud auto) (073; back in 074 and 075);
// quantity and share — pool töötajatest, enamik töötajaid, iga teine, kaks kolmandikku, 6,2 protsendi võrra, and the
// summary frame artiklis käsitletakse … / minu arvates (074, after module 13's number comparison; back in 075). The one
// long text of the module is the topic opener (072 station 2, an opinion column of ≈ 330 words, after a 15-minute hook and
// pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js and the archetypes of COURSE_FINAL_SHAPE_B2 §4.1 row 15 (071 PROB
// L→S, 072 AVAS R→S, 073 KUUL L→W, 074 LUGU R→W, 075 EKS); exactly one exam corner a lesson (V12): L1 (071, five news
// items played once), R1 (072, seven questions on the column), L2 (073, the podcast heard twice with five questions),
// R2b (074, eight short answers on the chart and the news). The long writings (W13 072, W14 073, W15 074) are homework
// without a corner: V12 does not allow the same corner form (W2a / W2b) in two neighbouring lessons. Harno L2 must come back
// at most 3 modules after its last practice (finalShape V6), hence the podcast as L2. Inputs: radio news (071),
// the column and a radio call-in (072), a podcast and three posts (073), a chart, a news text and a voice message (074). The v2 storyline version (the Nõmme school kitchen rumour, Nõmme Teataja,
// „Päevateema”, Kaia Mägi) is in git history before 2026-11-19.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 15. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

export const MODULE = { id: 'b1b2-module-15', course: 'b2', title: 'Meedia, info ja kriitiline lugemine', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

// the podcast of 073 (three speakers; the people and the show are invented, the rules are real)
const PODCAST_073 = [
  'Saatejuht: Tere tulemast saatesse „Raha ja meie”! Täna räägime sellest, kuidas eristada sõbra soovitust reklaamist. Stuudios on tarbijaõiguse jurist Merike Toom ja mõjuisik Kärt Lepik, keda jälgib Instagramis umbes nelikümmend tuhat inimest.',
  'Merike: Reegel on lihtne. Kui inimene saab postituse eest raha, tasuta toote või muu hüve, on see reklaam. Reklaamiseaduse järgi peab reklaam olema selgelt eristatav ja varjatud reklaam on keelatud. Seepärast soovitan, et sõna „reklaam” või „koostöö” oleks kirjas juba postituse alguses, mitte kuskil kolmekümne teemaviite vahel.',
  'Kärt: Mina märgin koostööd alati. Aga ausalt öeldes ei meeldi see jälgijatele. Mulle tundub, et kui postituse alguses on sõna „reklaam”, vaatab seda umbes poole vähem inimesi.',
  'Saatejuht: Kas see tähendab, et märgistamata postitusi on palju?',
  'Merike: Neid on kindlasti rohkem, kui peaks. Tarbijakaitse ja Tehnilise Järelevalve Amet koostas koos turundajatega mõjuisikutele juhendi juba kahe tuhande kahekümnendal aastal. Kuid märgistus on alles pool asja. Teine pool on see, mida postituses väidetakse. Kui kreem „tõestatult noorendab nahka”, peab olema ka tõend: uuring, mitte ühe inimese kogemus.',
  'Kärt: Aga minu kogemus ongi minu sisu! Inimesed jälgivad mind sellepärast, et ma räägin ausalt.',
  'Merike: Kogemus on lubatud. Kuid „mina kasutan ja mulle meeldib” on teistsugune väide kui „see toimib kõigil”. Esimene on hinnang, teine vajab tõendit.',
  'Saatejuht: Mida soovitate kuulajale?',
  'Merike: Küsige kolm küsimust. Kas postituse eest maksti? Kas väide on kontrollitav? Ja kas sama asja ütleb ka keegi, kes selle eest raha ei saa?',
  'Kärt: Ja minu soovitus: jälgige neid, kes ütlevad ausalt ka siis, kui toode neile ei meeldinud.',
];

// the interview of 075 (Harno B2 L3 + L4): an invented teacher, real ERR services
const INTERVIEW_075 = [
  'Saatejuht: Tere! Täna räägime sellest, kuidas eesti keelt meedia abil õppida. Stuudios on täiskasvanute keeleõpetaja Tiina Saar. Tiina, mida te oma õppijatele kõigepealt soovitate?',
  'Tiina: Ma soovitan alustada väikselt: viisteist minutit päevas, aga iga päev. Parem viisteist minutit hommikul bussis kui kaks tundi pühapäeval, kui oled juba väsinud.',
  'Saatejuht: Ja mida nende viieteistkümne minutiga teha?',
  'Tiina: Esimene samm on uudised. Lugege üht lühikest uudist kaks korda: esimest korda ainult pealkirja ja esimest lõiku, teist korda tervet lugu. Siis küsige endalt, kas pealkiri ütles sama mis lugu.',
  'Saatejuht: Kas kuulamine on raskem kui lugemine?',
  'Tiina: Alguses kindlasti. Seepärast soovitan telesaateid, millel on subtiitrid. ETV otsesaadetele saab nüüd valida automaatsed subtiitrid. Need ei ole küll täiuslikud, kuid kuulmine ja lugemine toetavad teineteist.',
  'Saatejuht: Mida teha, kui sõnu on liiga palju?',
  'Tiina: Ärge kirjutage üles kõiki sõnu. Valige ühest loost kolm sõna, mis tulevad uudistes ikka ja jälle tagasi, näiteks „väidetavalt”, „otsus” või „uuring”. Nädala lõpuks on teil kakskümmend üks uut sõna.',
  'Saatejuht: Aga kui uudised on liiga rasked või liiga kurvad?',
  'Tiina: Siis valige teadusuudised või raadio vestlussaated. ERR Novaatori lood on sageli lühikesed ja selged, Vikerraadios on palju saateid, kus inimesed räägivad rahulikult. Kõige tähtsam on, et teema teid huvitaks.',
  'Saatejuht: Ja viimane küsimus: kuidas õppija teab, et ta on edasi jõudnud?',
  'Tiina: Kui ta märkab, et loeb uudist ja mõtleb mitte ainult sõnadele, vaid ka sellele, kes räägib ja miks. See on B2 lugeja.',
  'Saatejuht: Aitäh, Tiina!',
];

export const LESSONS = withShapes({
  'b1b2-071': {
    title: 'Sama uudis, neli pealkirja: kas pealkiri ütleb tõtt?',
    phases: grammar('Keel: kui kindel on väide — kindlasti, tõenäoliselt, võib-olla, väidetavalt, kuuldavasti; hinnangut toovad sõnad taas, koguni, alles, ainult'),
    format: 'game',
    topic: 'town',
    canDo: 'Ma saan kuuldust aru lühikestest raadiouudistest, eristan pealkirjas fakti, hinnangut ja oletust kindlust ja hinnangut näitavate sõnade järgi ning räägin toimetuse koosolekul 2 minutit, miks minu pealkiri on aus ja siiski huvitav.',
    teacherPage: {
      goal: 'Игра в заголовки: выпуск новостей один раз (L1), факт / оценка / предположение в заголовке, слова уверенности и оценки, защитить честный заголовок на летучке.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — сортировка 8 заголовков и защита своего заголовка 1 минута без возражений редактора. Радио (станция 2) — дома по записи, 5 вопросов в начале следующего урока.',
      hook: '«Два заголовка об одной новости: „Bussipilet kallineb 50 senti” и „Linn tõstab taas hindu — pensionär maksab kinni!”. На какой ты бы кликнул? Какой точнее?» Ответ — после радио: пенсионеры ездят бесплатно (второй заголовок ложный), а слово «taas» — оценка.',
      plan: [
        '0–3: крючок — два заголовка: на какой кликнуть, какой точнее',
        '3–10: станция 1 — разговор: откуда я беру новости, читаю ли дальше заголовка',
        '10–25: станция 2 — слова (2 мин), 1 минута на вопросы, выпуск новостей из 5 сообщений один раз (L1), «Kas teadsid?» о 59 % ссылок без клика',
        '25–37: станция 3 — заметить в новостях võib, ei kinnita, väidetavalt → лестница уверенности и слова-оценки → 7 предложений',
        '37–52: станция 4 — игра: 8 заголовков — факт, оценка или предположение; летучка: свой заголовок к новости об автобусе и защита 2 минуты против главного редактора',
        '52–64: «Kui aega jääb» — дуэль заголовков с учителем',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: заметка без оценки + своё мнение отдельно (180–200 слов), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Новости выпуска (Rannalinn, Järvemäe vald, keskturg, raamatukogu) и заголовки — учебные, выдуманные; это сказано ученику в задании («neli portaali»). Факт «Kas teadsid?»: Gabielkov, Ramachandran, Chaintreau, Legout, «Social Clicks: What and Who Gets Read on Twitter?» (ACM SIGMETRICS 2016): 59 % ссылок на новости пяти крупных изданий, которыми делились пользователи, ни разу не открыли. Медиа Эстонии для разговора: ERR (общественное, финансируется из госбюджета, есть русскоязычный портал rus.err.ee и канал ETV+), Postimees (Postimees Grupp), Delfi (Ekspress Grupp).',
      groups: 'Станция 1 — в парах. Радио — каждый сам, сверка в паре. Станция 4: сортировку делает каждый сам; на летучке один — дежурный редактор, второй — главный редактор с вашей карточкой; потом смена. В 1:1 главный редактор — вы.',
      errors: [
        '«Võib-olla turg suletakse suvel» → «Võib-olla suletakse turg suvel» (после наречия в начале — глагол вторым; оба варианта встречаются, но в письменной речи лучше инверсия).',
        '«Väidetavalt bussid hakkavad …» → «Väidetavalt hakkavad bussid …» (väidetavalt в начале — глагол вторым).',
        '«Tõenäoliselt see on tõsi» → «Tõenäoliselt on see tõsi».',
        '«Pilet kallineb koguni» в конце → «Pilet kallineb koguni 50 senti» (koguni стоит перед числом, которое оно оценивает).',
      ],
      notes: [
        'Формат — игра: ученик соревнуется с вами (кто точнее рассортирует, чей заголовок честнее и интереснее). Не спорьте о политике города: спорим о том, как сказано, а не о том, правильно ли подняли цену.',
        'Уставшему после смены — радио в машине и Telegram-каналы; студенту — лента в телефоне; пенсионеру — газета, ERR rus и телевизор; маме в декрете — родительские группы в Facebook. Любой источник годится, никого не стыдим.',
        'Обратная связь, 2–3 цели: глагол вторым после tõenäoliselt / väidetavalt / võib-olla; одно слово-оценка (taas, koguni) превращает факт в мнение; «võib» и «ei kinnita» — это не факт.',
      ],
    },
    discover: [
      station(B.text('071_d_hook', 'Kumba sa avaksid?', 'Kaks pealkirja samast uudisest: „Bussipilet kallineb 50 senti” ja „Linn tõstab taas hindu — pensionär maksab kinni!”. Kumma peale sa klikiksid? Kumb on täpsem? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('071_d_talk', 'Minu uudised.', 'Vasta ja too näide. Võid rääkida ka oma pere või sõprade harjumustest.', [
        'Kust sa tavaliselt uudiseid saad ja miks just sealt?',
        'Kas loed tavaliselt ainult pealkirja või avad ka kogu loo?',
        'Millisele pealkirjale klikkisid viimati ja kas lugu vastas sellele?',
      ], [150, 210], ['Uudiseid saan peamiselt …, sest …', 'Tavaliselt loen ainult pealkirja, aga …', 'Viimati klikkisin pealkirjale …, aga lugu …']), 'Sinu enda uudisevoog on tunni esimene näide.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise, kust sa uudiseid saad (ERR, Postimees, Delfi, ERR-i venekeelne portaal, Telegram, raadio autos). Ära hinda allikaid. Lõpus ütle üks sõna, mida õpilane vajas (pealkiri, portaal, voog).')),
      station(tag(B.vocab('071_d_vocab', 'Enne kuulamist: sõnad.', ['pealkiri — заголовок', 'väide — утверждение', 'fakt — факт', 'hinnang — оценка', 'oletus — предположение', 'allikas — источник', 'kinnitama — подтверждать', 'eksitama — вводить в заблуждение', 'toimetaja — редактор', 'avaldama — публиковать']), { topic: ['pealkiri', 'oletus'] }), 2, 15),
      teach(tag(purpose(B.examListen('071_d_news', 'Raadiouudised: viis lühikest uudist.', 'Loe enne küsimused läbi. Kuula uudiseid ainult üks kord nagu raadiost ja vali õige vastus.', 'choice', [
        '1. Kell on kaheksa, uudised. Rannalinna volikogu otsustas eile, et linnaliinide bussipilet kallineb esimesest märtsist ühelt eurolt viiekümnelt sendilt kahele eurole. Pensionärid ja õpilased sõidavad ka edaspidi tasuta. Linnavalitsuse sõnul kulub lisaraha kümne uue elektribussi ostmiseks, et bussid saaksid õhtuti käia iga viieteistkümne minuti järel. Opositsioon hääletas otsuse vastu.',
        '2. Sünoptikute sõnul võib nädalavahetusel Lõuna-Eestis sadada kuni kakskümmend sentimeetrit lund. Teedel on oodata libedust. Transpordiamet soovitab sõitu võimaluse korral edasi lükata ja enne teeleminekut teeolud üle kontrollida.',
        '3. Järvemäe valla perearstikeskus on alates järgmisest kuust avatud ka laupäeviti kella üheksast kolmeni. Vallavanema sõnul on see esialgu pooleaastane katse. Kui patsiente tuleb piisavalt, jääb laupäevane vastuvõtt püsima.',
        '4. Sotsiaalmeedias levib postitus, mille järgi suletakse Rannalinna keskturg juba tänavu suvel. Linnavalitsus seda ei kinnita: turu tuleviku üle alles arutatakse ja otsust ei ole tehtud. Volikogu komisjon arutab turu tulevikku kuu lõpus.',
        '5. Ja lõpuks parandus. Eilses uudises kirjutasime, et Rannalinna raamatukogu suletakse. Tegelikult kolib raamatukogu aprillis kultuurimajja ja on kolimise ajal kaks nädalat suletud. Vabandame oma kuulajate ees.',
      ], [
        ['Mis muutub uudise järgi Rannalinna linnaliinide bussisõidus alates esimesest märtsist?', 'tavaline pilet kallineb poole euro võrra', 'pensionärid hakkavad sõidu eest maksma', 'sõit muutub kõigile elanikele tasuta'],
        ['Milleks kavatseb linnavalitsus uudise järgi kasutada raha, mis tuleb kallimatest piletitest?', 'uute elektribusside ostmiseks ja tihedamaks õhtuseks graafikuks', 'opositsiooni ettepanekute elluviimiseks', 'pensionäride tasuta sõidu lõpetamiseks'],
        ['Mida soovitab Transpordiamet autojuhtidele nädalavahetuse lumesaju ja libeduse tõttu teha?', 'lükata sõit võimaluse korral edasi', 'jääda kindlasti kogu nädalavahetuseks koju', 'sõita Lõuna-Eestisse ainult rongiga'],
        ['Kui kindel on uudise järgi see, et Järvemäe perearstikeskuse laupäevane vastuvõtt jääb?', 'see on katse, mis võib jääda püsima', 'see jääb kindlasti alatiseks püsima', 'see algab alles järgmisel aastal'],
        ['Mida on uudise järgi praegu tegelikult teada Rannalinna keskturu sulgemise kohta?', 'see on sotsiaalmeedia väide, mida linn ei kinnita', 'volikogu otsustas turu eile sulgeda', 'turg suletakse kindlasti juba suvel'],
        ['Miks luges raadio toimetus uudistesaate lõpus kuulajatele ette paranduse?', 'eilne uudis raamatukogu sulgemisest oli vale', 'raamatukogu suletakse aprillis lõplikult', 'kultuurimaja suletakse kaheks nädalaks'],
      ], 'g_read', 1), 'Kuuled, mida uudis tegelikult ütleb — siis näed, mida pealkiri sellest teeb.'), { voice: 'news', task: 'L01', harno: 'L1' }),
      'Eksaminurk (L1): eksamil kuuleb lühikesi tekste ainult üks kord. Enne kuulamist 1 minut küsimuste lugemiseks: „Mida sa igast uudisest otsid?” Pärast küsi iga uudise kohta: „Kas see on fakt, plaan või kinnitamata väide?” (1 fakt + plaan, 2 prognoos, 3 katse, 4 kuulujutt, 5 parandus). Kui õpilane ei saanud aru, lase teist korda kuulata alles pärast vastamist.'),
      B.know('071_d_know', ['Prantsuse ja Ameerika teadlased uurisid 2016. aastal, kuidas Twitteris jagati viie suure väljaande uudiseid. Selgus, et 59 protsendil linkidest, mida lugejad ise jagasid, ei klikitud kordagi. Paljud jagavad uudist ainult pealkirja põhjal — seepärast on pealkirja sõnad nii tähtsad.'], 'Gabielkov jt, ACM SIGMETRICS konverents (2016)'),
    ],
    practice: [
      station(B.notice('071_p_notice', 'Märka: tõenäoliselt, väidetavalt, koguni', [
        'Uudistest: pilet **kallineb** (otsus on tehtud) · laupäevane vastuvõtt **võib jääda** püsima (võimalus) · postituse **järgi** suletakse turg, linn seda **ei kinnita** (kinnitamata väide)',
        '**Kindluse redel**: **kindlasti, kahtlemata** (ma tean) → **tõenäoliselt, ilmselt, arvatavasti** (peaaegu kindel) → **võib-olla, võimalik, et …; võib juhtuda** (ei tea) → **väidetavalt, kuuldavasti** (keegi teine ütleb, mina ei vastuta).',
        'Sõna lause alguses, tegusõna kohe järel: **Tõenäoliselt tuleb** homme lund. · **Väidetavalt kolib** pood ära.',
        '**Hinnangusõna teeb faktist arvamuse**: **taas** (jälle — ja see on halb), **koguni** (üllatavalt palju), **alles** (alles nüüd = liiga hilja), **ainult** (vähe), **kahjuks / õnneks**. Võrdle: „Arst võtab vastu laupäeval” (fakt) → „**Alles nüüd** võtab arst vastu laupäeval” (hinnang: liiga hilja).',
        'Uudise pealkiri ütleb fakti; hinnang on aus siis, kui on näha, kelle oma see on: „Opositsioon: linn tõstab hindu taas”.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('071_p_sure', 'Muuda väite kindlust.', 'Kirjuta lause ümber nii, nagu sulgudes palutakse. Muuda ainult kindlust või hinnangut, mitte sisu. Alusta antud sõnadega.', [
        ['Rannalinna keskturg suletakse juba tänavu suvel. (Sa ei tea, kas see on nii.)', 'Võib-olla …', 'Võib-olla suletakse Rannalinna keskturg juba tänavu suvel.|Võib-olla Rannalinna keskturg suletakse juba tänavu suvel.|Võib-olla suletakse keskturg juba tänavu suvel.'],
        ['Uued elektribussid hakkavad sügisest õhtuti tihedamini käima. (Seda väidab linn, sina ei tea.)', 'Väidetavalt …', 'Väidetavalt hakkavad uued elektribussid sügisest õhtuti tihedamini käima.|Väidetavalt hakkavad uued elektribussid õhtuti sügisest tihedamini käima.'],
        ['Nädalavahetuse lumi teeb Lõuna-Eesti teed libedaks. (Sa oled peaaegu kindel.)', 'Tõenäoliselt …', 'Tõenäoliselt teeb nädalavahetuse lumi Lõuna-Eesti teed libedaks.'],
        ['Linn tõstab taas hindu ja pensionär maksab kinni! (Jäta alles ainult tõene fakt.)', 'Linn …', 'Linn tõstab bussipileti hinda.|Linn tõstab piletihinda.|Linn tõstab hindu.|Linn tõstab bussipileti hinda kahe euroni.'],
        ['Linnaliinide bussipilet kallineb märtsist 50 senti. (Lisa hinnang: see on palju.)', 'Linnaliinide bussipilet kallineb märtsist …', 'Linnaliinide bussipilet kallineb märtsist koguni 50 senti.|Linnaliinide bussipilet kallineb märtsist koguni viiskümmend senti.'],
        ['Naabrid räägivad, et perearst võtab laupäeval vastu. (Ütle ühe sõnaga, et kuulsid seda teistelt.)', 'Kuuldavasti …', 'Kuuldavasti võtab perearst laupäeval vastu.|Kuuldavasti võtab perearst vastu laupäeval.|Kuuldavasti võtab perearst ka laupäeval vastu.'],
        ['Raamatukogu kolib aprillis kultuurimajja. (Lisa hinnang: see oleks pidanud juhtuma ammu.)', 'Alles …', 'Alles aprillis kolib raamatukogu kultuurimajja.|Alles aprillis kolib raamatukogu lõpuks kultuurimajja.'],
      ], 'full', 'g_notice'), 'Kui oskad kindlust muuta, kuuled ka seda, kui pealkiri teeb oletusest fakti.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Kui kindel on lause nüüd — 100, 70, 50 protsenti või on see kellegi teise väide?” Ridadel 1–3 ja 6–7: pärast algussõna tuleb tegusõna kohe (suletakse, hakkavad, teeb, võtab, kolib). Lisaküsimus: „Millist sõna kasutaksid, kui naaber räägib midagi, mida sa ei ole kontrollinud?”'),
    ],
    transfer: [
      station(teach(tag(purpose(B.categorize('071_t_heads', 'Pealkirjamäng: fakt, hinnang või oletus?', 'Need pealkirjad tegid neli portaali tänastest uudistest. Otsusta iga pealkirja kohta, mis see on, ja ole valmis põhjendama.', [
        ['Fakt allikaga', ['Bussipilet kallineb märtsist kahe euroni', 'Järvemäe perearst võtab katseks vastu ka laupäeviti', 'Sünoptik: Lõuna-Eestisse võib tulla kuni 20 cm lund']],
        ['Hinnang või liialdus', ['Linn tõstab taas hindu — pensionär maksab kinni!', 'Lumi halvab nädalavahetusel kogu Lõuna-Eesti', 'Alles nüüd: vald avab arstikeskuse ka laupäeval']],
        ['Oletus või kinnitamata väide', ['Keskturg suletakse juba suvel?', 'Kuuldavasti tõuseb bussipilet aasta pärast veel']],
      ], 'full', 'g_read'), 'Kui eristad fakti, hinnangut ja oletust, ei juhi pealkiri sind enam ninapidi.'), { task: 'R09' }),
      'Mäng õpetajaga: mõlemad sorteerite, siis võrdlete; punkt iga õige otsuse eest koos põhjusega. Raske koht: „Sünoptik: … võib tulla” on fakt allikaga — fakt on see, et sünoptik nii ütles, ja pealkiri ütleb, kelle sõnad need on. „Pensionär maksab kinni” on lisaks vale: pensionärid sõidavad tasuta.'), 4, 15, { final: 'present' }),
      teach(tag(purpose(B.rolecards('071_t_meeting', 'Toimetuse koosolek: milline pealkiri läheb avalehele?', 'Sa oled täna valvetoimetaja. Kirjuta bussiuudisele oma pealkiri (kuni 10 sõna) ja kaitse seda 2 minutit peatoimetaja ees, kes tahab rohkem klikke.',
        'Olukord: bussiuudis läheb portaali avalehele kümne minuti pärast. Peatoimetaja pakub pealkirja „Linn tõstab taas hindu — pensionär maksab kinni!”.\nSinu eesmärk: paku oma pealkiri, mis on aus ja huvitav; selgita, miks peatoimetaja pealkiri eksitab; leppige kokku üks pealkiri.\nPiirang: pealkiri ei tohi valetada, kuid võib olla huvitav.',
        'Peatoimetaja kaart on õpetajal: tema kolm vastuväidet.',
        ['Minu pealkiri on: …', 'Minu lahendus on pealkiri, mis …', 'See pealkiri eksitab, sest …', '„Taas” on hinnang, mitte fakt.', 'Pensionärid sõidavad ju tasuta.', 'Tõenäoliselt klikitakse ka siis, kui …'], ['Igav! Keegi ei kliki.', 'Aga hinnad ju tõusevad!', 'Konkurendil on juba hullem pealkiri.']), 'Tulemus: avalehele läheb pealkiri, mille eest sa julged vastutada.'), { task: 'S16', main: true, level: 4 }),
      'Õpetaja kaart (peatoimetaja). Ütle vastuväited ükshaaval: 1) „Igav! Keegi ei kliki „bussipileti” peale.” (Õpilane võib lisada huvitava fakti: uued elektribussid, buss iga 15 minuti järel.) 2) „Aga hinnad ju tõusevad — „taas” on tõsi!” (Viimati tõsteti … — me ei tea; „taas” on hinnang.) 3) „Konkurendil on juba hullem pealkiri.” Pakkumine, kui küsitakse: oled nõus, kui pealkirjas on üks arv. Õnnestunud, kui õpilane räägib 2 minutit, nimetab peatoimetaja pealkirjas kaks viga (vale fakt, hinnangusõna), kasutab kahte kindluse sõna ja te lepite kokku ühe ausa pealkirja (näiteks „Bussipilet kallineb 50 senti, õhtuti tuleb buss tihedamini”).'),
      extension(teach(tag(purpose(B.speaking('071_t_more', 'Pealkirjaduell', 'Õpetaja annab teile kolm igavat uudist. Kirjutage mõlemad igale uudisele pealkiri: aus, kuid huvitav. Siis võrrelge ja öelge, kumb on parem ja miks.', [
        'Mis on uudises fakt ja mis võiks lugejat huvitada?',
        'Kas sinu pealkirjas on hinnang või oletus? Kas see on aus?',
        'Kumb pealkiri on parem ja miks?',
      ], [120, 180], ['Minu pealkiri on …', 'Sinu pealkirjas on sõna …, mis on hinnang.', 'Tõenäoliselt klikitakse …', 'See on aus, sest …']), 'Mäng näitab, et aus pealkiri võib olla ka huvitav.'), { task: 'S12', level: 4 }),
      'Kui aega jääb (12 min). Uudised: 1) „Kooli söökla hakkab pakkuma ka taimetoitu kolm korda nädalas.” 2) „Linnaraamatukogu pikendab lahtiolekuaega neljapäeviti kella kaheksani.” 3) „Rannalinna rannas mõõdeti eile vee temperatuuriks 24 kraadi.” Kirjuta ka ise üks eksitav pealkiri ja lase õpilasel see parandada. Punkt ausa ja huvitava pealkirja eest; miinuspunkt hinnangusõna eest, millel pole allikat.'), 12),
      tag(exitCheck(purpose(B.gaps('071_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sobiv sõna.', [
        'Linn ei ole postitust kinnitanud, nii et [väidetavalt|kuuldavasti] suletakse turg suvel — aga keegi ei tea seda kindlalt.',
        'Volikogu otsus on tehtud, nii et pilet kallineb märtsist [kindlasti|kahtlemata].',
        'Pealkiri „Pilet kallineb [koguni] 50 senti” ei ole enam puhas fakt, sest üks sõna ütleb, et see on palju.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kindluse ja hinnangu sõnad on käes.')), {}),
      purpose(B.selfcheck('071_t_self', ['Ma räägin, kust ma uudiseid saan ja kuidas ma neid loen.', 'Ma saan aru üks kord kuuldud lühiuudistest.', 'Ma tunnen pealkirjas ära fakti, hinnangu ja oletuse (tõenäoliselt, väidetavalt, taas, koguni).', 'Ma kaitsen koosolekul ausat pealkirja 2 minutit.'], 'Pealkirjamäng mängitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('071_t_news', 'Kodus: üks sündmus, kaks teksti.', 'Vali üks päris või väljamõeldud sündmus oma linnast või vallast (uus bussiliin, remont, pood suleti). Kirjuta kodus 180–200 sõna: 1) uudisnupp ilma hinnanguta (umbes 110 sõna: mis, kus, millal, kelle sõnul); 2) eraldi lõik — sinu arvamus samast sündmusest (umbes 80 sõna). Kasuta vähemalt nelja kindluse või hinnangu sõna.', [14, 18], ['tõenäoliselt', 'väidetavalt', 'minu arvates', 'kahjuks', 'võib-olla'], 3, 'g_use'), 'Kui sa ise oskad fakti ja arvamust lahus hoida, näed kohe, kui keegi teine seda ei tee.')), { task: 'W12', level: 4 }),
      tag(homeTask(purpose(B.speaking('071_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kust sa uudiseid saad ja mida sa nüüdsest pealkirjas kontrollid.', [
        'Milline pealkiri sind viimati eksitas või üllatas?',
        'Mida sa nüüd kontrollid, enne kui pealkirja usud?',
      ], [60, 120]), 'Õpetaja kuulab, kas kindluse sõnad ja sõnajärg on õiged.')), { task: 'S15' }),
      homework('071_t_homework', ['1. Uudisnupp ja arvamus, kokku 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-072': {
    title: 'Kommentaarium: sõnavabadus või sõimuväljak?',
    phases: grammar('Keel: autori mõte edasi — autori sõnul, autor leiab / rõhutab / möönab, et …; kaudne kõneviis: olevat, toovat, ei muutvat'),
    format: 'debate',
    topic: 'culture',
    canDo: 'Ma loen arvamuslugu ja leian autori seisukoha, tooni ja eesmärgi, annan autori mõtte edasi (autori sõnul, autor möönab, et …, olevat) ning räägin argumendikaartidega arutelus, kuni jõuame ühise otsuseni, mida portaali kommentaariumiga teha.',
    teacherPage: {
      goal: 'Дебаты: колонка о комментариях под новостями, позиция, тон и цель автора (R1), передать мысль автора (sõnul, möönab, -vat), совет читателей решает по карточкам (S17).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: два комментария и 1 вопрос; станция 2 — колонка, только вопросы 1, 4, 7; станция 3 — правило и 4 строки; станция 4 — один раунд дебатов без радио.',
      hook: '«Под новостью „Bussipilet kallineb” два комментария: „Jälle need vargad volikogus!!!” и „Kahju, aga kui buss tuleb õhtul iga 15 minuti järel, olen nõus maksma.” Какой помогает обсуждению?» Связь с уроком 071: та же новость.',
      plan: [
        '0–3: крючок — два комментария: какой помогает обсуждению',
        '3–15: станция 1 — разговор: читаю ли я комментарии, писал ли сам, что делает комментарий хорошим',
        '15–30: станция 2 — слова (2 мин), колонка «Kommentaarium on elutuba, mitte väljak» (≈ 330 слов, страница темы модуля), 7 вопросов о позиции, тоне и цели (R1)',
        '30–42: станция 3 — заметить в колонке «Mõned ütlevad», «Ma mõistan», «Minu ettepanek» → правило: autori sõnul, möönab, -vat → 7 предложений',
        '42–57: станция 4 — радио «час слушателей»: два звонка о колонке, дважды, 6 пропусков (кто спорит с мыслью, кто с человеком); совет читателей: карточки A «строгий порядок» и B «свободное обсуждение», 8 минут, голосование, общее решение',
        '57–69: «Kui aega jääb» — прямой эфир: ответить автору в студии',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо читателя в редакцию 180–200 слов, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Колонка — учебный текст, автор выдуман (библиотекарь). Факт: Европейский суд по правам человека, Большая палата, Delfi AS v. Estonia (№ 64569/09), решение 16.06.2015, 15 голосов против 2: ответственность портала за оскорбительные анонимные комментарии (о паромной компании, 2006) не нарушает свободу слова; компенсация 320 евро. Конституция ЭР § 17: никого нельзя опорочивать (честь и доброе имя). Радиопередача и звонящие — учебные.',
      groups: 'Станция 1 — в парах. Колонку читает и радио слушает каждый сам, ответы сверяют в паре. Станция 4: каждый берёт карточку A или B, потом смена ролей; в мини-группе 3–4 человека — два «совета» и общее голосование. В 1:1 вторая карточка — ваша.',
      errors: [
        '«Autori sõnul ta leiab, et …» → «Autori sõnul …» или «Autor leiab, et …» (не два источника в одной фразе).',
        '«Autor möönab, et kommentaarium on halb» — möönma = признать правоту другой стороны частично; если автор просто критикует — kritiseerib / leiab.',
        '«Kommenteerija sõnul nimega kommenteerimine olevat ohtlik» → «… olevat nimega kommenteerimine ohtlik» (после kommenteerija sõnul глагол вторым).',
        '«ei oleva» / «ei olnud vat» → «ei olevat» (отрицание: ei + -vat).',
      ],
      notes: [
        'Формат — дебаты: голосование в начале и в конце («закрыть комментарии под новостями — да / нет / только под чувствительными»). Спорим о правилах, не о людях: это и есть навык урока.',
        'Уставшему — «читаю, но никогда не пишу» тоже позиция; студенту — Reddit и Discord; пенсионеру — комментарии на rus.err.ee или в Одноклассниках; маме в декрете — родительские форумы. Никто не обязан рассказывать, что он сам писал в интернете.',
        'Обратная связь, 2–3 цели: autori sõnul + глагол вторым; правильный глагол передачи (rõhutab / möönab / väidab); -vat для чужого утверждения, с которым ты не согласен.',
      ],
    },
    discover: [
      station(B.text('072_d_hook', 'Kaks kommentaari', 'Uudise „Bussipilet kallineb” all on kaks kommentaari: „Jälle need vargad volikogus!!!” ja „Kahju, aga kui buss tuleb õhtul iga 15 minuti järel, olen nõus maksma.” Kumb aitab arutelule kaasa? Ütle kohe.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('072_d_talk', 'Mina ja kommentaarid.', 'Vasta ja too näide. Sa ei pea rääkima, mida ise kirjutasid.', [
        'Kas sa loed uudiste all kommentaare ja miks?',
        'Kas oled kunagi ise mõne uudise all kommenteerinud?',
        'Mis teeb kommentaari sinu jaoks heaks või halvaks?',
      ], [150, 210], ['Kommentaare loen harva, sest …', 'Ise kommenteerin ainult siis, kui …', 'Hea kommentaar on selline, mis …']), 'Sinu kogemus kommentaaridega on arutelu esimene argument.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise. Kui õpilane ütleb, et ei loe kommentaare, küsi: „Miks? Mis sind eemale hoiab?” — see on juba seisukoht. Lõpus ütle üks sõna, mida õpilane vajas (kommentaarium, solvang, moderaator).')),
      station(tag(B.vocab('072_d_vocab', 'Enne lugemist: sõnad.', ['arvamuslugu — авторская колонка', 'seisukoht — позиция', 'toon — тон', 'eesmärk — цель', 'kommentaar — комментарий', 'sõnavabadus — свобода слова', 'vastutama — отвечать (за что-то)', 'möönma — признавать (частично)', 'rõhutama — подчёркивать', 'veenma — убеждать']), { topic: ['arvamuslugu', 'sõnavabadus'] }), 2, 15),
      B.topicOpener('072_d_open', 'Moodul 15. Arvamus: kommentaarium on elutuba, mitte väljak', [
        'Töötan raamatukogus ja juhin lugemisringi, nii et loen palju. Eesti suurte uudisportaalide kommentaariumides on iga päev tuhandeid kommentaare. Osa neist on targad: lugeja parandab ajakirjaniku viga, lisab oma kogemuse või küsib asja, mida loos ei olnud. Suur osa on aga midagi muud — solvangud, pooltõed ja samade inimeste lõputu vaidlus. Kui ma ühe uudise all kommentaare loen, tunnen end sageli nagu turuplatsil, kus võidab kõige valjem hääl. Kõige rohkem kurvastab mind see, et targad lugejad jäävad vait: nad loevad, raputavad pead ja lahkuvad.',
        'Kommentaarium ei ole siiski ainult lugejate asi. Euroopa Inimõiguste Kohus otsustas 2015. aastal kaasuses Delfi AS vs. Eesti, et uudisportaal võib vastutada ka anonüümsete lugejate solvavate kommentaaride eest, kui ta neid piisavalt kiiresti ei eemalda. Kohtuasi algas 2006. aastal ühe praamifirma kohta kirjutatud kommentaaridest ja portaal pidi maksma 320 eurot kahjutasu. Summa oli väike, aga põhimõte suur: kes kommentaariumi avab, peab selle eest ka hoolitsema.',
        'Mõned ütlevad, et kommentaaride piiramine oleks tsensuur. Ma mõistan seda hirmu. Sõnavabadus on demokraatia alus ja kommentaar on sageli ainus koht, kus tavaline inimene saab avalikult vastu vaielda. Kuid sõnavabadus ei tähenda õigust teist inimest sõimata. Ka põhiseadus kaitseb iga inimese au ja head nime. Inimene, keda kommentaariumis avalikult sõimatakse, ei ole sõnavabaduse kasutaja, vaid selle ohver.',
        'Minu ettepanek on lihtne. Kommentaarium jäägu alles, kuid olgu see pigem elutuba kui väljak: kommenteerida saab ainult oma nimega, iga kommentaari loeb enne avaldamist läbi moderaator ning õnnetuste ja haiguste uudiste all kommentaare ei avata. See maksab portaalile raha ja aeglustab arutelu. Kuid parem on kümme mõtestatud kommentaari kui tuhat karjumist. Hea kommentaarium on lugejate kogukond, mitte rahvahulk. Lugeja, kes kirjutab oma nimega, mõtleb enne, kui vajutab nuppu „Saada”. Ja kui ta kirjutab teravalt, kuid ausalt, on see just see arutelu, mida demokraatia vajab.',
        'Selles moodulis loed meediat nagu B2 lugeja: eraldad fakti ja arvamuse, leiad autori seisukoha, hindad argumenti ja arvu ning kirjutad kokkuvõtte, kus sinu enda arvamus on selgelt eraldi.',
      ], 'Autori arvamus (õppetekst); fakt: Euroopa Inimõiguste Kohtu suurkoja otsus Delfi AS vs. Eesti (16.06.2015); Eesti Vabariigi põhiseadus § 17', [
        'Kas oled lugenud kommentaari, mis muutis sinu arvamust? Mis seal oli?',
        'Kas kommentaaride sulgemine õnnetuste uudiste all on sinu arvates tsensuur või hoolivus?',
        'Kuidas arutletakse uudiste üle sinu kodumaal või keeles, milles sa uudiseid loed? Mis on seal teisiti kui Eestis?',
        'Kuidas muutuvad kommentaariumid sinu arvates järgmise kümne aasta jooksul?',
      ]),
      teach(tag(purpose(B.choice('072_d_pos', 'Autori seisukoht, toon ja eesmärk.', 'Vali iga küsimuse juurde arvamusloo põhjal üks õige vastus neljast.', [
        ['Mis on arvamusloo autori peamine seisukoht uudisportaalide kommentaariumi kohta?', 'kommentaarium jäägu alles, kuid range korraga', 'kõik kommentaariumid tuleb kohe sulgeda', 'kommentaariumis tohib kirjutada ilma piiranguteta', 'kommentaariumi eest vastutavad ainult lugejad'],
        ['Millise tooniga kirjeldab autor esimeses lõigus seda, milline on tänane kommentaarium?', 'kriitiliselt, kuid toob ka häid näiteid', 'vaimustunult ja ilma ühegi kriitikata', 'täiesti neutraalselt ja ilma hinnanguta', 'vihaselt ja ainult halbade näidetega'],
        ['Miks toob autor oma arvamusloo teises lõigus näiteks Delfi kohtuasja?', 'et näidata, et ka portaal vastutab kommentaaride eest', 'et kritiseerida Euroopa kohtu otsust', 'et rääkida praamifirma majanduslikest probleemidest', 'et näidata, et 320 eurot on suur summa'],
        ['Millega on autor kolmandas lõigus nende inimestega, kes kardavad tsensuuri, osaliselt nõus?', 'et sõnavabadus on tähtis ja kommentaar on sageli inimese hääl', 'et kommentaaride piiramine on alati tsensuur', 'et moderaator on portaali jaoks liiga kallis', 'et anonüümsed kommentaarid on kõige ausamad'],
        ['Mida tahab autor oma ettepanekus öelda võrdlusega „elutuba, mitte väljak”?', 'arutelu olgu rahulikum ja igaüks vastutagu oma sõnade eest', 'kommentaare tuleks kirjutada ainult kodus', 'kommentaariumis peaks olema rohkem inimesi', 'kommentaarium tuleks viia raamatukokku'],
        ['Millist puudust oma ettepanekus nimetab autor neljandas lõigus ise?', 'see maksab portaalile raha ja aeglustab arutelu', 'portaal kaotab selle tõttu kõik lugejad', 'riik peab hakkama kommentaare kontrollima', 'lugejad ei saa enam üldse kommenteerida'],
        ['Mis on selle arvamusloo peamine eesmärk, mida autor lugejatega saavutada tahab?', 'veenda lugejaid ja portaale kommentaariumi korda muutma', 'teatada lugejatele uuest seadusest', 'reklaamida üht kindlat uudisportaali', 'kirjeldada kohtuasja kõiki üksikasju'],
      ], 'full', 'g_read'), 'Kui tead, mida autor tahab ja kuidas ta seda ütleb, saad temaga päriselt vaielda.'), { task: 'R02', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on 500–600-sõnaline arvamuslugu ja küsimused valikvastustega. Siin lühem lugu, sama oskus: kõigepealt loe pealkirja ja viimast lõiku (seisukoht), siis tervet lugu. Küsi iga vastuse järel: „Milline lause seda näitab?” Küsimused 2, 5 ja 7 küsivad tooni ja eesmärki — vastust ei ole tekstis ühe lausena, see tuleb järeldada.'),
    ],
    practice: [
      station(B.notice('072_p_notice', 'Märka: autori sõnul, autor möönab', [
        'Arvamusloost: **Mõned ütlevad**, et piiramine oleks tsensuur. · **Ma mõistan** seda hirmu. · **Minu ettepanek on** lihtne.',
        '**Autori mõte edasi** (kokkuvõttes, kommentaaris): **autori sõnul / arvates / väitel** + lause, tegusõna teisel kohal: Autori arvates **on** kommentaarium turuplats. · **Autor leiab / väidab / rõhutab / möönab, et …** · **Autor teeb ettepaneku, et …**',
        'Tegusõna näitab, kuidas sina autorit mõistad: **rõhutab** = ütleb tähtsana · **möönab** = tunnistab osaliselt vastase õigust · **väidab** = ütleb, aga sina ei ole veel veendunud · **kahtleb, kas …** = ei ole kindel.',
        '**Kaudne kõneviis (-vat)**: see on teise inimese väide, mina selle eest ei vastuta. Vorm tuleb ma-tegevusnimest: olema → **olevat**, tooma → **toovat**, tulema → **tulevat**; eitus: **ei olevat**. Kommentaarid **toovat** portaalile lugejaid. · Sulgemine **ei olevat** tsensuur.',
        'Pärast „autor väidab, et …” ei ole -vat kohustuslik. Ilma ütlemise tegusõnata (**Moderaator olevat kallis.**) näitab -vat kõige selgemalt, et see on kellegi teise jutt.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('072_p_report', 'Anna mõte edasi.', 'Kirjuta lause ümber nii, et on selge: see on autori või kellegi teise mõte, mitte sinu oma. Alusta antud sõnadega.', [
        ['Autor: „Iga kommentaari peaks enne avaldamist lugema moderaator.”', 'Autori arvates …', 'Autori arvates peaks iga kommentaari enne avaldamist lugema moderaator.|Autori arvates peaks moderaator iga kommentaari enne avaldamist läbi lugema.|Autori arvates peaks moderaator lugema iga kommentaari enne avaldamist.'],
        ['Autor: „Jah, sõnavabadus on demokraatia alus.” (Ta tunnistab vastaste õigust.)', 'Autor möönab, et …', 'Autor möönab, et sõnavabadus on demokraatia alus.'],
        ['Autor: „Tähtis on see, et kes kommentaariumi avab, peab selle eest hoolitsema.”', 'Autor rõhutab, et …', 'Autor rõhutab, et kes kommentaariumi avab, peab selle eest hoolitsema.|Autor rõhutab, et kes kommentaariumi avab, peab selle eest ka hoolitsema.'],
        ['Kommenteerija: „Nimega kommenteerimine on ohtlik.” (Sa ei ole nõus — kasuta kaudset kõneviisi.)', 'Kommenteerija sõnul …', 'Kommenteerija sõnul olevat nimega kommenteerimine ohtlik.'],
        ['Portaal: „Moderaator maksab meile aastas kümneid tuhandeid eurosid.” (Sa ei ole kontrollinud.)', 'Portaali väitel …', 'Portaali väitel maksvat moderaator neile aastas kümneid tuhandeid eurosid.|Portaali väitel maksab moderaator neile aastas kümneid tuhandeid eurosid.'],
        ['Lugeja: „Kommentaarid ei muuda midagi.” (Anna edasi ilma tegusõnata „ütleb”.)', 'Kommentaarid …', 'Kommentaarid ei muutvat midagi.'],
        ['Lugeja: „Ma ei ole kindel, et moderaator suudab tuhandeid kommentaare läbi lugeda.”', 'Lugeja kahtleb, kas …', 'Lugeja kahtleb, kas moderaator suudab tuhandeid kommentaare läbi lugeda.|Lugeja kahtleb, kas moderaator jõuab tuhandeid kommentaare läbi lugeda.'],
      ], 'full', 'g_notice'), 'Kokkuvõttes ja vaidluses on selge, kelle mõte on kelle oma — nii ei pane keegi sulle sõnu suhu.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kas sina oled sellega nõus? Kas -vat näitab siin sinu kahtlust?” Read 4–6: -vat tuleb ma-tegevusnimest (olema → olevat, maksma → maksvat, muutma → muutvat). Rida 2: möönab, mitte rõhutab — autor tunnistab vastaste õigust. Rida 4: pärast „kommenteerija sõnul” tegusõna kohe (olevat).'),
    ],
    transfer: [
      station(teach(tag(purpose(B.listening('072_t_radio', 'Raadio kuulajate tund: kommentaarisõda eetris.', 'Kuula saadet kaks korda ja kirjuta igasse lünka 1–2 sõna. Märka: kes vaidleb mõttega ja kes ründab inimest?', [
        'Saatejuht: Tere, siin on kuulajate tund. Täna arutame arvamuslugu, mille järgi peaks kommentaarium olema elutuba, mitte väljak. Esimene helistaja on Tõnis Pärnust.',
        'Tõnis: Tere! Nimega kommenteerimine? Siis ei julge keegi enam tõtt öelda. See ongi tsensuur! Ja autor töötab ilmselt ise portaalis, muidugi kaitseb ta oma tööandjat.',
        'Saatejuht: Autor kirjutab, et töötab raamatukogus. Aga aitäh! Teine helistaja on Marje Tartust.',
        'Marje: Tere! Mina kirjutan alati oma nimega ja keegi pole mind selle eest karistanud. Ma arvan, et autor ei taha midagi keelata, ta tahab korda. Vaielda tuleb mõttega, mitte inimesega.',
        'Saatejuht: Tõnis on veel liinil. Tõnis, kas teil on Marjele vastus?',
        'Tõnis: Hea küll, üks päris küsimus. Kes maksab moderaatorile? Lõpuks tõstetakse ju tellimuse hinda ja maksame meie.',
        'Marje: See on päris argument. Võib-olla piisaks sellest, kui moderaator loeb ainult tundlike uudiste kommentaare, näiteks õnnetuste all.',
        'Saatejuht: Aitäh mõlemale! Kuulajate tund jätkub pärast uudiseid.',
      ], [
        'Saates arutatakse arvamuslugu, mille järgi peaks kommentaarium olema elutuba, mitte [väljak].',
        'Tõnise arvates on nimega kommenteerimine tegelikult [tsensuur].',
        'Tõnis väidab ilma ühegi tõendita, et autor töötab ise [portaalis].',
        'Marje sõnul ei taha autor midagi keelata, vaid tahab kommentaariumis [korda].',
        'Tõnise päris küsimus on, kes maksab [moderaatorile].',
        'Marje pakub, et moderaator loeks ainult [tundlike] uudiste kommentaare.',
      ], 'g_read'), 'Kuuled, milline argument on päris ja milline ainult rünnak inimese vastu — sellest algab sinu arutelu.'), { voice: 'interview', task: 'L03' }),
      'Pärast teist kuulamist küsi: „Milline Tõnise lause ründab inimest, mitte mõtet? Milline tema lause on päris argument?” (Rünnak: „autor töötab ilmselt ise portaalis”; argument: „kes maksab moderaatorile?”.) See on arutelu esimene reegel.'), 4, 15, { final: 'decide' }),
      teach(tag(purpose(B.rolecards('072_t_debate', 'Lugejate nõukogu: mida teha meie portaali kommentaariumiga?', 'Sa oled portaali lugejate nõukogus. Vali kaart A või B, ütle oma seisukoht ja kaks argumenti. Arutage 8 minutit ja jõudke ühise otsuseni.',
        'Kaart A (range kord). Seisukoht: kommenteerida saab ainult oma nimega ja iga kommentaari loeb enne moderaator. Argumendid: portaal on kohustatud solvangud eemaldama ja vastutab kommentaaride eest (Delfi kaasus, 2015); nimega kirjutades valib inimene sõnu hoolikamalt; solvangud peletavad targad lugejad eemale. Lisa oma näide.',
        'Kaart B (vaba arutelu). Seisukoht: kommentaarium jäägu avatuks, portaal kehtestab lihtsad reeglid ja eemaldab solvangud, millest lugejad teatavad. Argumendid: iga väike reeglite rikkumine ei vaja moderaatorit; nimega kommenteerimine võib olla ohtlik, näiteks töötajale, kes kritiseerib oma tööandjat; moderaator maksab ja aeglustab arutelu; anonüümne kommentaar on mõnikord ainus viis rääkida. Lisa oma näide.',
        ['Minu seisukoht on, et …', 'Autori sõnul …, aga mina leian, et …', 'Ma möönan, et …, kuid …', 'Näiteks …'], ['Kas sa väidad, et …?', 'Kas me võiksime kokku leppida, et …?', 'Meie ühine otsus on: …']), 'Tulemus: sina ja paariline otsustate, milline kord kommentaariumis kehtib — ja põhjendate seda.'), { task: 'S17', main: true, level: 4 }),
      'Õpetaja: hääletus alguses ja lõpus (sulgeda / jätta / sulgeda ainult tundlike uudiste all). Kui õpilane valis A, mängi B ja vastupidi. Teises voorus tõmba üks uudis: 1) „Portaal suleb kommentaarid pühade ajaks, sest moderaatorid on puhkusel.” 2) „Lugeja kaebas, et tema nimega kommentaar ilmus tööandja otsingus.” 3) „Uuringu järgi loeb kommentaare enamik lugejatest, kirjutab aga vähemus.” Õnnestunud, kui õpilane esitab kaks argumenti koos näitega, annab vähemalt korra edasi autori või sinu mõtte (autori sõnul, sa väidad, et …), möönab ühe vastaspoole argumendi ja te jõuate ühise otsuseni.'),
      extension(teach(tag(purpose(B.speaking('072_t_more', 'Raadio otse-eeter: vasta autorile', 'Raadio arutab arvamuslugu ja sina oled stuudios lugejate esindaja. Ütle lühidalt autori mõte, oma seisukoht, üks põhjus ja üks näide. Õpetaja on saatejuht.', [
        'Mida autor sinu arvates tegelikult tahab?',
        'Millega oled nõus ja millega mitte?',
        'Mida sa portaalile soovitad?',
      ], [120, 180], ['Tere, mina olen lugeja …-st.', 'Autori sõnul …', 'Ma möönan, et …, kuid …', 'Minu ettepanek on …']), 'Raadios on sul vähe aega: hea sõnavõtt hoiab autori mõtte ja sinu oma selgelt lahus.'), { task: 'S16', level: 4 }),
      'Kui aega jääb (12 min). Sina oled saatejuht: lase õpilasel rääkida 1–2 minutit, siis küsi kaks teravat küsimust: „Kas te ise kirjutate oma nimega?”, „Kas moderaator ei ole lihtsalt tsensor?”. Õnnestunud, kui kõnes on autori mõte (autori sõnul), oma seisukoht koos põhjuse ja näitega ning vastused on rahulikud.'), 12),
      tag(exitCheck(purpose(B.gaps('072_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka üks sobiv sõna.', [
        'Autor [möönab|tunnistab], et sõnavabadus on tähtis, kuid lisab, et see ei tähenda õigust sõimata.',
        'Kommenteerija sõnul [olevat] kogu arvamuslugu portaali reklaam — mina seda ei usu. (olema)',
        'Autori [sõnul|arvates|väitel] peaks kommentaarium jääma alles, kuid range korraga.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas oskad autori mõtet edasi anda.')), {}),
      purpose(B.selfcheck('072_t_self', ['Ma räägin, kuidas ma kommentaare loen ja kirjutan.', 'Ma leian arvamusloost autori seisukoha, tooni ja eesmärgi.', 'Ma annan autori mõtte edasi: autori sõnul, autor möönab, et …, olevat.', 'Ma jõuan argumendikaartidega arutelus ühise otsuseni.'], 'Lugejate nõukogu peetud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('072_t_letter', 'Kodus: lugejakiri toimetusele.', 'Kirjuta kodus portaali toimetusele 180–200 sõna vastuseks arvamusloole: autori seisukoht kahe lausega (autori sõnul, autor möönab), kas oled nõus ja miks, üks näide oma elust või väljamõeldud olukorrast ning üks konkreetne ettepanek kommentaariumi kohta. Anna autori mõte edasi vähemalt kolmel eri viisil.', 'Lugupeetud toimetus!', 'Lugupidamisega\n(sinu nimi), lugeja', [180, 200]), 'Toimetus näeb, et oled autorit täpselt lugenud ja sinu ettepanek on põhjendatud.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('072_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kas sina kommenteeriksid oma nimega ja miks.', [
        'Mida ütleb arvamusloo autor ja mida sina sellest arvad?',
        'Milline kord kommentaariumis oleks sinu jaoks õiglane?',
      ], [60, 120]), 'Õpetaja kuulab, kas autori ja sinu mõte on selgelt lahus.')), { task: 'S15' }),
      homework('072_t_homework', ['1. Lugejakiri toimetusele, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-073': {
    title: '„Minu lemmikkreem!” — kas see on soovitus või reklaam?',
    phases: grammar('Keel: kesksõnad hinnangus — makstud koostöö, tõestatud toime; kontrollitav väide, äratuntav reklaam; tõendamata, märgistamata'),
    format: 'case',
    topic: 'money',
    canDo: 'Ma saan aru taskuhäälingu arutelust mõjuisikute reklaami üle, hindan väite tugevust (väide, põhjus, tõend), kasutan hinnangus kesksõnu (makstud, tõendamata, kontrollitav) ning kirjutan mõjuisikule viisaka, kuid selge sõnumi.',
    teacherPage: {
      goal: 'Кейс: пост инфлюенсера — совет или реклама; подкаст с юристом и блогером (L2), причастия в оценке (makstud, tõendamata), разбор трёх постов и сообщение автору.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — подкаст один раз, только вопросы 1–4; станция 3 — правило и 4 пропуска; станция 4 — три поста и 4 вопроса, сообщение 3 предложения устно.',
      hook: '«Известная блогерша пишет: „Пользуюсь этим кремом месяц, кожа как новая! Ссылка в профиле, с кодом NAHK20 — на 20 % дешевле.” Это совет или реклама? По чему решаешь?» Ответ после подкаста: если за пост дали деньги, бесплатный товар или другую выгоду — это реклама; код скидки — сильный признак.',
      plan: [
        '0–3: крючок — совет или реклама?',
        '3–10: станция 1 — друг прислал пост («Куплю сразу!»): ответить ему; на кого я подписан, покупал ли по совету',
        '10–25: станция 2 — слова (2 мин), вопросы заранее, подкаст «Raha ja meie» дважды (≈ 2 мин), 5 вопросов с выбором (L2); «Kas teadsid?» — закон и кодекс этики',
        '25–37: станция 3 — заметить в подкасте varjatud, märgistamata, kontrollitav → правило -tud / -tav / -mata → 7 пропусков',
        '37–52: станция 4 — три поста в ленте: 6 вопросов (реклама? помечена? какой аргумент слабый?); сообщение автору поста 6–8 предложений',
        '52–64: «Kui aega jääb» — ролевая игра: друг хочет взять быстрый кредит, потому что так советовал блогер',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: рассуждение 180–200 слов (W2b), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Подкаст, его ведущий, юрист Мерике Тоом и блогер Кярт Лепик — учебные. Правила реальные: Reklaamiseadus — скрытая реклама (varjatud reklaam), которую при обычном внимании нельзя отличить, запрещена, реклама должна быть ясно отличима; TTJA вместе с Eesti Turundajate Liit выпустил в 2020 г. руководство для публикации рекламы в соцсетях (необязательное, для инфлюенсеров; Better Internet for Kids, EU); ESMA, «Finfluencers factsheet» для Эстонии (2026): помечать «Reklaam», «Tasustatud sisu», «Sponsoreeritud» или инструментом платформы. Кодекс журналистской этики: реклама и PR должны быть ясно отделены от журналистского материала (ERR, статья о сотрудничестве Postimees с порталом недвижимости, комментарий Марта Раудсаара). «Половина меньше просмотров» — личное мнение блогера, не факт: это слабый аргумент для разбора.',
      groups: 'Станция 1 — в парах. Подкаст — каждый сам, сверка в паре. Станция 4: вопросы каждый сам; сообщение каждый пишет своё, потом пара обменивается и отвечает за блогера. В 1:1 блогер — вы.',
      errors: [
        '«makstud koostööga» правильно; «makstuga koostööga» → -tud-причастие перед существительным не склоняется (makstud koostööst, tõendamata väitega).',
        '«kontrollitav väitega» → «kontrollitava väitega» (-tav склоняется как прилагательное).',
        '«Postitus jäi mitte märgistatud» → «Postitus jäi märgistamata» (jääma + -mata).',
        '«See on reklaam, sest ta on tuntud» — не довод: важно, получил ли он плату или выгоду.',
      ],
      notes: [
        'Формат — кейс: реальные правила, придуманные посты; ученик решает как потребитель, не как юрист. Не обсуждаем конкретных эстонских блогеров по имени.',
        'Уставшему — TikTok и YouTube в перерыве; студенту — Instagram; пенсионеру — реклама «чудо-средств» и биодобавок в Facebook и ТВ; маме в декрете — детские товары и «честные отзывы» мам. Быстрый кредит в посте 3 — частая ловушка; если ученику тема болезненна, говорите о «знакомом».',
        'Обратная связь, 2–3 цели: -tud / -mata не склоняются, -tav склоняется; «mulle meeldib» — оценка, «toimib kõigil» — утверждение, которому нужно доказательство; вежливый, но ясный тон в сообщении.',
      ],
    },
    discover: [
      station(B.text('073_d_hook', 'Soovitus või reklaam?', 'Tuntud blogija postitab: „Kasutan seda kreemi juba kuu aega ja mu nahk on nagu uus! Link on profiilis, koodiga NAHK20 saad 20 % soodsamalt.” Kas see on soovitus või reklaam? Mille järgi sa otsustad? Ütle kohe.'), 1, 10),
      inLesson(teach(tag(purpose(B.rolecards('073_d_talk', 'Sõber saatis sulle selle postituse.', 'Sõber kirjutas postituse juurde: „Ostan kohe!” Vasta talle: mida sa arvad ja kas oled ise midagi soovituse peale ostnud?',
        'Sinu sõber tahab kreemi kohe osta. Ütle, mida sa postitusest arvad, ja too näide oma elust.',
        'Sõbra kaart on õpetajal.',
        ['Ma ei ole kindel, sest …', 'Kord ostsin ka mina …'], ['Aga ta on nii aus!', 'Kood kehtib ainult täna!']), 'Sinu oma kogemus soovitustega on tunni juhtum number null.'), { task: 'S05', fluency: true }),
      'Üks-ühele: sina oled sõber („Ta on nii aus!”, „Kood kehtib ainult täna!”). Pärast küsi: „Keda sa ise jälgid? Mida oled soovituse peale ostnud?” Räägi ka ise, mida sa viimati soovituse peale ostsid. Ära küsi summasid. Kui õpilane sotsiaalmeediat ei kasuta, räägi telereklaamist ja „imeravimitest” ajalehes. Lõpus ütle üks sõna, mida õpilane vajas (mõjuisik, jälgija, soodustuskood).')),
      station(tag(B.vocab('073_d_vocab', 'Enne kuulamist: sõnad.', ['reklaam — реклама', 'mõjuisik — инфлюенсер', 'koostöö — сотрудничество', 'tasu — вознаграждение', 'märgistama — маркировать', 'varjatud — скрытый', 'tõend — доказательство', 'toime — действие (эффект)', 'usaldusväärne — надёжный', 'tarbija — потребитель']), { topic: ['mõjuisik'] }), 2, 15),
      teach(tag(purpose(B.examListen('073_d_pod', 'Taskuhääling „Raha ja meie”: kas iga postitus on reklaam?', 'Loe enne küsimused läbi. Kuula saadet kaks korda ja vali iga küsimuse juurde õige vastus.', 'choice', PODCAST_073, [
        ['Millal on mõjuisiku postitus juristi sõnul alati reklaam, isegi kui see on kirjutatud nagu sõbra soovitus?', 'kui ta sai selle eest raha, tasuta toote või muu hüve', 'kui tal on üle neljakümne tuhande jälgija', 'kui postituses on toote nimi ja pilt'],
        ['Kus peaks juristi soovitusel olema postituses kirjas sõna „reklaam” või „koostöö”?', 'kohe postituse alguses', 'teemaviidete lõpus', 'mõjuisiku profiili kirjelduses'],
        ['Millega põhjendab mõjuisik Kärt oma väidet, et jälgijatele reklaami märge ei meeldi?', 'oma muljega, et märgistatud postitust vaatab vähem inimesi', 'ühe ametliku uuringu tulemusega', 'jälgijate kirjadega, mida ta ette loeb'],
        ['Mis vahe on juristi sõnul postituse lausetel „mulle meeldib” ja „toimib kõigil”?', 'esimene on hinnang, teine vajab tõendit', 'esimene on keelatud, teine lubatud', 'mõlemad vajavad uuringut'],
        ['Mida soovitab jurist saate lõpus kuulajal iga soovituse juures endalt küsida?', 'kas maksti, kas väide on kontrollitav ja kas sõltumatu inimene ütleb sama', 'kui palju jälgijaid mõjuisikul on', 'kas toode on poes soodushinnaga'],
      ], 'g_read', 2), 'Kuuled, kus läheb piir soovituse ja reklaami vahel — ja kumma argument on tugevam.'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Eksaminurk (L2): eksamil on intervjuu kaks korda ja valikvastused. 1) küsimused läbi (1 min); 2) esimene kuulamine — „Mis on juristi reegel ühe lausega?”; 3) teine — vastused; 4) argumendi tugevus: „Kärt ütleb, et märgistatud postitust vaatab poole vähem inimesi. Kas see on fakt või tema mulje? Mis tõend puudub?” (Tal on „mulle tundub” — see on hinnang.) 5) „Mille poolest erinevad „mulle meeldib” ja „toimib kõigil”?”'),
      B.know('073_d_know', ['Reklaamiseadus keelab varjatud reklaami: reklaam peab olema selgelt eristatav ja tavaline inimene peab selle ära tundma. Ajakirjanduseetika koodeks nõuab, et reklaam ja suhtekorraldus oleksid lugejale ajakirjanduslikust tekstist selgelt eristatud. Reklaami järele valvab Tarbijakaitse ja Tehnilise Järelevalve Amet (TTJA), ajakirjanduse eetika üle otsustab Pressinõukogu.'], 'reklaamiseadus; Eesti ajakirjanduseetika koodeks (ERR); TTJA ja Eesti Turundajate Liidu juhend sotsiaalmeedias reklaami avaldamiseks (2020)'),
    ],
    practice: [
      station(B.notice('073_p_notice', 'Märka: makstud koostöö, tõendamata väide', [
        'Saatest: **varjatud** reklaam on keelatud · **märgistamata** postitused · kas väide on **kontrollitav** · kreem „**tõestatult** noorendab”',
        '**-tud / -dud** (asi on tehtud): maksma → **makstud** koostöö · varjama → **varjatud** reklaam · tõestama → **tõestatud** toime · kinnitama → **kinnitatud** fakt.',
        '**-tav / -dav** (asja saab teha): kontrollima → **kontrollitav** väide · usaldama → **usaldatav** allikas · ära tundma → **äratuntav** reklaam · eristama → **eristatav**.',
        '**-mata** (asja ei ole tehtud): **tõendamata** väide · **märgistamata** postitus · **kontrollimata** info. Lauses: Postitus **jäi märgistamata**.',
        'Käändes: **-tud** ja **-mata** jäävad nimisõna ees samaks: **makstud** koostööst, **tõendamata** väitega. **-tav** käändub nagu omadussõna: **kontrollitava** väitega, **usaldatavast** allikast.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('073_p_part', 'Hinda postitust ühe sõnaga.', 'Kirjuta sulgudes olevast tegusõnast kesksõna (-tud, -tav või -mata) õiges vormis.', [
        'Postitus oli tegelikult [makstud] koostöö, kuigi see ei olnud kuskil kirjas. (maksma)',
        'Kui reklaam ei ole tavalisele inimesele [äratuntav], on see varjatud reklaam. (ära tundma)',
        'Väide „aitab kõigil kaalust alla võtta” on [tõendamata], sest uuringut ei ole. (tõendama)',
        'Pärast kaebust pidi mõjuisik kõik [varjatud] reklaamid oma kontolt eemaldama. (varjama)',
        'Blogija kustutas postituse, mis oli jäänud [märgistamata]. (märgistama)',
        'Kreemi toime ei ole ühegi uuringuga [tõestatud]. (tõestama)',
        'Otsi postitusest [kontrollitavat] väidet, mitte ainult kiitust. (kontrollima)',
      ], '', 'full', 'g_notice'), 'Üks täpne kesksõna ütleb postituse kohta rohkem kui pikk lause.'), { task: 'G02' }),
      'Pärast iga rida küsi: „Kas asi on tehtud (-tud), saab teha (-tav) või ei ole tehtud (-mata)?” Rida 7: otsima + osastav → kontrollitavat (-tav käändub). Rida 5: jääma + -mata. Lisaküsimus: „Milline postitus sinu voos oli viimati märgistamata?”'),
    ],
    transfer: [
      station(teach(B.text('073_t_posts', 'Kolm postitust sinu voos', '**Postitus 1 (terviseblogija):** „Minu hommik algab selle vitamiinijoogiga! Energiat terveks päevaks. #hommik #tervis #energia … #koostöö” — sõna „koostöö” on alles kahekümne viienda teemaviite järel.\n\n**Postitus 2 (kodukokk):** „REKLAAM | Koostöös poeketiga: kolm õhtusööki pere jaoks alla 10 euro. Retseptid on allpool.”\n\n**Postitus 3 (rahablogija):** „Võtsin kiirlaenu viie minutiga ja ostsin uue telefoni! Laenu saavad kõik, ka ilma palgata. Link on profiilis.” Märget ei ole.'),
      'Loe postitused koos ette. Küsi enne küsimusi: „Millist neist sa usaldaksid kõige rohkem ja miks?” Kolmas postitus on ka sisult ohtlik: vastutustundlik laenuandja kontrollib sissetulekut.'), 4, 15, { final: 'complain' }),
      tag(purpose(B.choice('073_t_judge', 'Juhtum: kolm postitust.', 'Vali iga küsimuse juurde postituste põhjal üks õige vastus neljast.', [
        ['Mis on terviseblogija postituse 1 suurim probleem?', 'koostöö märge on peidetud teemaviidete lõppu', 'postituses ei ole joogi pilti ega hinda', 'vitamiinijoogi kvaliteet on halb', 'postitus on kirjutatud liiga lühidalt'],
        ['Miks on kodukoka postitus 2 reklaamina korrektne?', 'reklaami märge ja koostööpartner on kohe alguses', 'kõik retseptid on lugejatele täiesti tasuta', 'postitus on lühike ja seda on lihtne lugeda', 'kodukokk ei saanud koostöö eest raha'],
        ['Milline väide on rahablogija postituses 3 tõendamata ja ohtlik?', '„laenu saavad kõik, ka ilma palgata”', '„ostsin endale täna uue telefoni”', '„võtsin kiirlaenu viie minutiga”', '„link laenu juurde on profiilis”'],
        ['Milline argument on nendest neljast kõige nõrgem?', '„mulle meeldib, järelikult toimib see kõigil”', '„uuringus kontrolliti joogi mõju sajal inimesel”', '„toote koostis on pakendil täpselt kirjas”', '„jook on ka arsti soovitatud nimekirjas”'],
        ['Mida peaks mõjuisik tegema, kui ta sai toote tasuta?', 'märkima postituse alguses, et see on reklaam', 'mitte midagi, sest tasuta toode ei ole tasu', 'kirjutama toote nime suurte tähtedega', 'kustutama postituse ühe nädala pärast'],
        ['Kelle poole saad Eestis pöörduda, kui näed sotsiaalmeedias varjatud reklaami?', 'Tarbijakaitse ja Tehnilise Järelevalve Ametile', 'Statistikaametile või oma vallavalitsusele', 'oma pangale või mobiilioperaatorile', 'politseile või päästeametile'],
      ], 'full', 'g_read'), 'Kui tead, mis postituses on valesti, saad seda ka põhjendada.'), { task: 'R11' }),
      teach(tag(purpose(B.writing('073_t_msg', 'Sinu sõnum mõjuisikule', 'Vali postitus 1 või 3. Kirjuta autorile 6–8 lauset: mis on probleem, miks see sulle oluline on ja mida palud teha. Ole viisakas ja selge, kasuta kahte kesksõna.', [6, 8], ['märgistamata', 'tõendamata', 'makstud', 'palun'], 2, 'g_use'), 'Tulemus: sinu sõnum on selline, et autor ei saa seda lihtsalt kustutada.'), { task: 'W02', level: 3 }),
      'Õpetaja on mõjuisik ja vastab sõnumile: 1) „Ma ju märkisin, vaata lõpust!” 2) „Laen on täiesti seaduslik.” 3) „Sa oled lihtsalt kade.” Õpilane vastab suuliselt veel kahe lausega. Õnnestunud, kui sõnumis on probleem koos põhjendusega, üks konkreetne palve (märgi alguses, eemalda väide „kõik saavad laenu”), kaks kesksõna ja viisakas toon ka siis, kui vastus on terav.'),
      extension(teach(tag(purpose(B.speaking('073_t_more', 'Rollimäng: sõber tahab kiirlaenu', 'Sinu sõber nägi postitust 3 ja tahab homme kiirlaenu võtta, et osta uus sülearvuti. Räägi temaga: ära keela, aita tal ise otsustada. Õpetaja on sõber.', [
        'Mida sa postituse kohta ütled?',
        'Milliseid küsimusi soovitad sõbral enne laenu küsida?',
        'Mida pakud asemele?',
      ], [120, 180], ['Kas see oli makstud postitus?', 'See väide on tõendamata, sest …', 'Enne lepingut küsi …', 'Kui sa ootaksid kuu, siis …']), 'Kui oskad reklaami lahti võtta, aitad ka teistel paremini otsustada.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Sina oled sõber: „Ta on nii aus, ta ei valetaks!”, „Kõik võtavad laenu”, „Mul on telefon homme vaja”. Õnnestunud, kui õpilane ei moraliseeri, kasutab kahte kesksõna, nimetab ühe kontrollitava asja (kulukuse määr, tagasimakse summa) ja pakub ühe realistliku alternatiivi. Moodul 11 (järelmaks ja kiirlaen) aitab: küsi „Mida sa järelmaksu kohta mäletad?”'), 12),
      tag(exitCheck(purpose(B.gaps('073_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olevast tegusõnast kesksõna õiges vormis.', [
        'Kuu aega ei saanud keegi aru, et postitus oli [makstud] koostöö. (maksma)',
        'Kreemi kohta käiv väide jäi [tõendamata], sest ükski uuring seda ei toetanud. (tõendama)',
        'Hea väide on [kontrollitav]: allikas ja uuring on nimetatud. (kontrollima)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kesksõnad hinnangus on käes.')), {}),
      purpose(B.selfcheck('073_t_self', ['Ma räägin, kuidas mõjuisikud ja reklaam minu valikuid mõjutavad.', 'Ma saan aru arutelust ja eristan hinnangut ja tõendatud väidet.', 'Ma kasutan hinnangus kesksõnu: makstud, tõendamata, kontrollitav, märgistamata.', 'Ma kirjutan mõjuisikule viisaka, kuid selge sõnumi.'], 'Juhtum lahendatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('073_t_essay', 'Kodus: arutlus.', 'Kirjuta kodus arutlus 180–200 sõna: kas mõjuisik peaks koostööpostituse juures ütlema, kui palju talle maksti? Mõlema poole argumendid tõendi või näitega, sinu järeldus; kolm kesksõna.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3, 'g_use'), 'Sinu arutlus näitab, et oskad argumente kaaluda, mitte ainult arvamust öelda.')), { task: 'W14', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('073_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mille järgi sa nüüd tunned ära, et postitus on reklaam.', [
        'Mis on sinu kolm küsimust iga soovituse kohta?',
        'Milline postitus või reklaam on sind kunagi eksitanud?',
      ], [60, 120]), 'Õpetaja kuulab, kas sinu küsimused on täpsed ja kesksõnad õiged.')), { task: 'S15' }),
      homework('073_t_homework', ['1. Arutlus, 180–200 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-074': {
    title: 'Keskmine palk on 2135 eurot — miks enamik teenib vähem?',
    phases: grammar('Keel: hulk ja osa — pool töötajatest teenib, enamik töötajaid, iga teine, kaks kolmandikku, 6,2 protsendi võrra; kokkuvõte: artiklis käsitletakse …, minu arvates …'),
    format: 'facts',
    topic: 'work',
    canDo: 'Ma loen joonist ja uudist palkade kohta, mõistan keskmise ja mediaani vahet, väljendan hulka ja osa (pool töötajatest, enamik töötajaid, iga teine) ning kirjutan oma meediamenüü ja kokkuvõtte, mis ei moonuta arve ja kus minu arvamus on eraldi.',
    teacherPage: {
      goal: 'Анализ фактов: средняя зарплата и медиана (Statistikaamet), почему «средняя» не моя; доля и количество (pool töötajatest, iga teine); план сводки W2a и продукт «Minu meediamenüü».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — только диаграмма и вопросы 1–4; станция 3 — правило и 4 строки; станция 4 — объяснение родственнику 1 минута и меню медиа — 2 строки. Текст — дома.',
      hook: '«По данным Statistikaamet средняя зарплата брутто в начале 2026 года — 2135 евро. Половина работников получает больше или меньше?» Ответ: меньше — медиана 1753 €, то есть больше половины зарабатывают меньше средней. Никогда не спрашивайте зарплату ученика.',
      plan: [
        '0–10: станция 1 — крючок (половина больше или меньше средней?) и разговор: «средняя зарплата» в новостях и люди, которых я знаю; какой цифре я верю',
        '10–25: станция 2 — слова (2 мин), диаграмма (средняя, медиана, отрасли) и заметка «Eestlane teenib juba üle 2100 euro», 8 коротких ответов (R2b)',
        '25–37: станция 3 — заметить «pooled töötajad teenivad», «enamik töötajaid teenib» → правило доли и количества + начало сводки → 7 предложений',
        '37–52: станция 4 — голосовое тёти (6 пропусков), объяснить ей, почему «средняя» не её зарплата; план сводки и два первых предложения; «Minu meediamenüü»',
        '52–64: «Kui aega jääb» — игра «Обманывает ли цифра?»',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: сводка и реакция 180–220 слов (W2a), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Statistikaamet через ERR: I кв. 2026 средняя брутто 2135 € (+6,2 % за год), медиана 1753 € (+6 %); информация и связь 3821 €, финансы и страхование 3608 €, размещение и общепит 1337 €; 2025 год в среднем 2092 €. Определение медианы — Statistikaamet («palk, millest väiksemat ja suuremat palka teenib võrdselt sama palju töötajaid»). Вывод «большинство получает меньше средней» следует из медианы ниже средней. Заголовок заметки — учебный. ETV: автоматические субтитры в прямом эфире (ERR); ERR Novaator, Vikerraadio — сервисы ERR.',
      groups: 'Станция 1 — в парах. Диаграмма, текст и голосовое — каждый сам, сверка в паре. Станция 4: один объясняет, второй — тётя с вашей карточкой; меню медиа каждый пишет сам и читает вслух. В 1:1 родственник — вы.',
      errors: [
        '«Pool töötajad teenivad» → «Pool töötajatest teenib» (pool + elatiiv, глагол в единственном) или «Pooled töötajad teenivad».',
        '«Enamik töötajad teenivad» → «Enamik töötajaid teenib» / «Enamik töötajatest teenib».',
        '«Iga teine töötajad» → «Iga teine töötaja» (iga + единственное число).',
        '«6,2 protsenti võrra» → «6,2 protsendi võrra» (võrra + родительный).',
      ],
      notes: [
        'Формат — анализ фактов: сначала ученик гадает, потом читает данные. Деньги — тема личная: спрашиваем о «людях, которых ты знаешь», о профессии в целом, никогда о своей зарплате. Можно говорить о выдуманном родственнике.',
        'Уставшему — его отрасль (склад, производство) и «средняя» в новостях, которая его злит, — хороший повод; студенту — первая зарплата и подработка; пенсионеру — «средняя пенсия» тоже среднее; маме в декрете — родительское пособие считают от зарплаты. Продукт «Minu meediamenüü»: начинающему — 2 источника и 15 минут в день достаточно.',
        'Обратная связь, 2–3 цели: pool / enamik + elatiiv или partitiiv, глагол в единственном; «võrra» + родительный; в сводке сначала факты источника, потом отдельно «Minu arvates».',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('074_d_talk', 'Arva ära: kas pooled teenivad rohkem?', 'Keskmine brutopalk oli 2026. aasta alguses 2135 eurot kuus (allikas: Statistikaamet). Kas pooled töötajad teenivad rohkem või vähem? Arva kohe, siis vasta.', [
        'Kas uudiste „keskmine palk” kirjeldab inimesi, keda sa tead?',
        'Millist arvu uudistes sa viimati nägid ja kas sa seda uskusid?',
        'Mida sa teeksid, kui mõni arv uudises tunduks sulle vale?',
      ], [150, 210], ['Ma arvan, et pooled teenivad …', 'Minu tuttavad teenivad pigem …', 'Kui arv tundub vale, siis ma …']), 'Sinu tunne „see ei ole minu palk” on tunni esimene küsimus.'), { task: 'S14', fluency: true }),
      'Üks-ühele: lase õpilasel kõigepealt arvata (rohkem või vähem?), vastus tuleb uudisest. Räägi ka ise, millist arvu sa uudistes viimati ei uskunud. Ära küsi palka ega pensioni suurust. Lõpus ütle üks sõna, mida õpilane vajas (keskmine, brutopalk, maks).')), 1, 10),
      station(tag(B.vocab('074_d_vocab', 'Enne lugemist: sõnad.', ['keskmine — средний', 'mediaan — медиана', 'palk — зарплата', 'protsent — процент', 'enamik — большинство', 'kasv — рост', 'võrdlema — сравнивать', 'uudis — новость', 'kokkuvõte — резюме', 'järeldus — вывод']), { topic: ['mediaan'] }), 2, 15),
      B.chart('074_d_chart', 'Brutokuupalk Eestis 2026. aasta I kvartalis (eurot)', { kind: 'bar', unit: '€', series: '2026 I kvartal', rows: ['Info ja side | 3821', 'Finants ja kindlustus | 3608', 'Keskmine palk kokku | 2135', 'Mediaanpalk | 1753', 'Majutus ja toitlustus | 1337'], source: 'Statistikaamet (ERR, 2026)' }),
      B.text('074_d_text', 'Uudis: „Eestlane teenib juba üle 2100 euro”', 'Statistikaameti andmetel oli keskmine brutokuupalk 2026. aasta esimeses kvartalis 2135 eurot, mis on 6,2 protsenti rohkem kui aasta varem. Pealkiri paneb aga paljud lugejad kahtlema: miks on minu palk väiksem? Põhjus on selles, et keskmist tõstavad suured palgad. Mediaanpalk ehk palk, millest pooled töötajad teenivad rohkem ja pooled vähem, oli 1753 eurot. Infos ja sides teeniti keskmiselt 3821, majutuses ja toitlustuses 1337 eurot. Seega teenib enamik töötajaid keskmisest vähem. Ja brutopalgast läheb veel maha ka tulumaks.\n\n*Allikas: Statistikaamet (ERR, 2026).*'),
      teach(tag(purpose(B.table('074_d_facts', 'Märkmed kokkuvõtte jaoks.', 'Vasta joonise ja uudise järgi 1–3 sõna või arvuga. Need on sinu kokkuvõtte laused.', 'Küsimus, Vastus', [
        'Kui suur oli keskmine brutopalk kuus 2026. aasta I kvartalis? | [2135 eurot/2135/2135 €]',
        'Kui suur oli keskmise palga kasv aastaga? | [6,2 protsendi võrra/6,2/6,2 %/6,2 protsenti]',
        'Kui suur oli mediaanpalk? | [1753 eurot/1753/1753 €]',
        'Mitme euro võrra on keskmine palk mediaanpalgast suurem? | [382 eurot/382/382 euro võrra/382 €]',
        'Mitu korda teeniti infos ja sides rohkem kui majutuses ja toitlustuses? | [peaaegu kolm korda/umbes kolm korda/kolm korda/peaaegu 3 korda/umbes 3 korda/3 korda]',
        'Mis tõstab uudise järgi keskmist palka? | [suured palgad/suured palgad tõstavad]',
        'Kas enamik töötajaid teenib keskmisest rohkem või vähem? | [vähem/keskmisest vähem]',
        'Mis läheb uudise järgi brutopalgast veel maha? | [tulumaks/maks]',
      ], 'g_read'), 'Täpsed märkmed annavad sinu kokkuvõttele õiged arvud, mis ei moonuta tegelikkust.'), { task: 'R15', harno: 'R2b' }),
      'Eksaminurk (R2b): eksamil on 8 lühivastust 1–3 sõnaga teabeteksti kohta. Küsi pärast iga vastust: „Kust sa seda näed — jooniselt või uudisest?” Read 4 ja 5 on võrdlused (moodul 13: … võrra, … korda): need on kodus kokkuvõtte laused. Lõpus: „Kas sinu oletus tunni alguses oli õige? Miks on pealkiri „Eestlane teenib juba üle 2100 euro” eksitav?” (Pealkiri teeb keskmisest „tüüpilise eestlase”; õigem oleks: „Keskmine palk tõusis 2135 euroni, pooled teenivad alla 1753 euro”.)'),
    ],
    practice: [
      station(B.notice('074_p_notice', 'Märka: pooled töötajad teenivad, enamik teenib', [
        'Uudisest: **pooled töötajad teenivad** rohkem · **enamik töötajaid teenib** keskmisest vähem · palga **kasv** oli **6,2 protsenti** aastaga',
        '**Osa tervikust** + **seestütlev** (millest?), tegusõna **ainsuses**: **pool** vastajatest **usaldab** … · **kolmandik** lugejatest **loeb** … · **kaks kolmandikku** inimestest **vaatab** …',
        '**enamik** + osastav või seestütlev, tegusõna ainsuses: enamik **inimesi** / enamik **inimestest** **elab** linnas. · **pooled** + mitmuse nimetav ja mitmuse tegusõna: **pooled** inimesed **elavad** …',
        '**iga teine / iga kolmas** + ainsuse nimetav: **iga teine** eestlane **loeb** … · **protsent**: 40 **protsenti** lugejatest (arv + osastav ainsus) · **6,2 protsendi võrra** (võrra + omastav).',
        '**Kokkuvõtte raam**: **Artiklis käsitletakse** … · **Artikli järgi / Autori sõnul** … · **Artiklist selgub, et** … — ja alles uues lõigus: **Minu arvates** … · **Mulle jääb arusaamatuks, miks** …',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('074_p_parts', 'Kokkuvõtte laused täpseks.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Meie väikese küsitluse järgi, milles osales kuuskümmend inimest, loeb kolmandik [vastanutest] uudiseid ainult telefonist. (vastanud)',
        'Statistikaameti andmetel teenib pool [töötajatest] vähem kui 1753 eurot kuus. (töötajad)',
        'Kui pealkiri on eksitav, usub seda tõenäoliselt iga teine [lugeja]. (lugejad)',
        'Enamik [töötajaid|töötajatest] teenib keskmisest palgast vähem. (töötajad)',
        'Keskmine palk tõusis aastaga 6,2 [protsendi] võrra. (protsent)',
        'Meie küsitluses [usaldas] kaks kolmandikku vastanutest raadiouudiseid rohkem kui sotsiaalmeediat. (usaldama, minevik)',
        'Artiklis [käsitletakse] seda, miks keskmine palk tundub paljudele liiga suur. (käsitlema, umbisikuline olevik)',
      ], '', 'full', 'g_notice'), 'Kui hulk ja osa on õiged, ei moonuta sinu kokkuvõte ühtegi arvu.'), { task: 'G08' }),
      'Pärast iga rida küsi: „Kas tegusõna on ainsuses või mitmuses ja miks?” Rida 2: pool + seestütlev, tegusõna ainsuses (teenib). Rida 4: enamik + osastav või seestütlev. Rida 6: kaks kolmandikku … usaldas (ainsus). Lisaküsimus: „Ütle üks lause oma küsitluse kohta: mitu sinu tuttavat loeb uudiseid paberil?”'),
    ],
    transfer: [
      station(tag(purpose(B.listening('074_t_voice', 'Tädi häälsõnum.', 'Tädi luges uudist ja saatis sulle häälsõnumi. Kuula kaks korda ja kirjuta igasse lünka 1–2 sõna.', [
        'Tädi Valve: Tere, kullake! Lugesin just uudist, et eestlane teenib juba üle kahe tuhande saja euro kuus. Kuidas see võimalik on? Mina olen töötanud poes kassapidajana kakskümmend aastat ja saan kätte palju vähem. Ka minu naabrid, üks on bussijuht ja teine koristaja, ei teeni nii palju. Kas statistika valetab või petetakse meid tööl? Ja tütar ütles, et ka keskmine pension tõusis, aga minu pension tõuseb alati ainult natukene. Ma ei saa aru, miks selliseid numbreid üldse avaldatakse. Kui keskmine on nii suur, siis kus on need inimesed, kes nii palju teenivad? Minu tuttavate seas küll mitte ühtegi. Sina loed ju neid asju ja oskad arvudega ümber käia. Räägi mulle õhtul, kui sul aega on. Tahan sellest aru saada enne pühapäevast sünnipäeva, muidu lähen jälle onuga tülli. Tema ütleb alati, et kes vähe teenib, see vähe töötab, ja mina ei taha seda enam kuulata. Aitäh sulle juba ette!',
      ], [
        'Uudise järgi teenib eestlane juba üle [kahe tuhande saja|2100] euro kuus.',
        'Tädi on töötanud poes kassapidajana [kakskümmend|20] aastat.',
        'Tädi naabritest üks on bussijuht ja teine [koristaja].',
        'Tädi küsib, kas statistika [valetab] või petetakse neid tööl.',
        'Tütre sõnul on tõusnud ka keskmine [pension].',
        'Tädi tahab asjast aru saada enne pühapäevast [sünnipäeva].',
      ], 'g_read'), 'Kuuled, mis tädi tegelikult segadusse ajab — sellele vastad.'), { task: 'L07' }), 4, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('074_t_explain', 'Selgita tädile: miks keskmine ei ole tema palk?', 'Selgita tädile (või mõnele oma sugulasele) joonise ja uudise abil, mida näitavad keskmine ja mediaan ja miks pealkiri eksitab.',
        'Olukord: tädi on pahane, sest uudise pealkiri „Eestlane teenib juba üle 2100 euro” ei sobi tema eluga.\nSinu eesmärk: selgita kolme faktiga, miks enamik teenib keskmisest vähem; kasuta vähemalt kahte hulga või osa väljendit; ütle, milline pealkiri oleks aus.\nPiirang: ära küsi tema palka ja ära ütle „sa ei saa aru”.',
        'Tädi kaart on õpetajal: tema kolm küsimust.',
        ['Keskmist tõstavad …', 'Brutopalgast läheb veel maha …', 'Palga kasv ei tähenda, et …', 'Pool töötajatest teenib …', 'Enamik töötajaid …', 'Mediaan näitab …', 'Ausam pealkiri oleks: …'], ['Kas mind siis petetakse?', 'Miks nad siis keskmist üldse näitavad?', 'Kas pension on ka selline?']), 'Tulemus: tädi mõistab arvu ja sina oskad selle eest seista, et arv ei eksitaks.'), { task: 'S13', level: 4 }),
      'Õpetaja kaart (tädi; võib olla ka onu või vanaema). Küsimused ükshaaval: 1) „Kas mind siis petetakse?” (Ei: arv on õige, pealkiri eksitab.) 2) „Miks nad siis keskmist üldse näitavad?” (Keskmine näitab kogu palgasummat, mediaan tüüpilist töötajat — mõlemad on vajalikud.) 3) „Kas pension on ka selline?” (Ka keskmine pension on keskmine.) Õnnestunud, kui õpilane nimetab kolm fakti (2135, 1753, 3821 ja 1337), kasutab kahte hulga väljendit (pool töötajatest, enamik töötajaid) ja ütleb ausa pealkirja. Viimased 3 minutit: kokkuvõtte plaan (mida näitab joonis → kaks võrdlust → uus lõik: minu reaktsioon) ja kaks esimest lauset („Artiklis käsitletakse …”).'),
      teach(tag(purpose(B.planning('074_t_menu', 'Mooduli tulemus: minu meediamenüü.', 'Pane kirja oma eestikeelne meediamenüü ja kolm reeglit, mida sa nüüd kasutad. Igale reale üks lause. Sellest räägid kontrollis 1 minuti.', [
        'Kust ma loen ja kuulan eesti keeles ja kui sageli? (näiteks ERR-i uudised, Vikerraadio, ERR Novaator, ETV otsesaated automaatsete subtiitritega; ERR-i eelis on kättesaadavus — kõik on tasuta; 15 minutit päevas)',
        'Pealkiri: mida ma kontrollin, enne kui usun või jagan? (tund 71: fakt, hinnang, oletus)',
        'Autor ja reklaam: kuidas ma tunnen ära arvamusloo ja makstud koostöö? (tunnid 72 ja 73)',
        'Arv: mida ma küsin, kui uudises on keskmine või protsent? (tund 74)',
      ], 2), 'Sinu meediamenüü on sinu oma plaan, kuidas iga päev eesti keeles lugeda ja kuulata — ilma end petta laskmata.'), { task: 'W11', main: true, level: 4 }),
      'Kui õpilasel ei ole veel ühtegi eestikeelset allikat, alusta ühest: ERR-i uudiste üks lugu päevas või üks Vikerraadio saade nädalas. Küsi: „Millal päevas sul on 15 minutit?” (buss, lõuna, laps magab). ETV otsesaadetele saab valida automaatsed subtiitrid — näita, kust.'),
      extension(teach(tag(purpose(B.speaking('074_t_more', 'Mäng: kas arv eksitab?', 'Õpetaja annab sulle viis pealkirja arvudega. Ütle iga pealkirja kohta, kas arv võib eksitada, mida on vaja juurde teada ja kuidas pealkiri oleks ausam.', [
        'Mis arvust puudu on: võrdlus, algarv, allikas või mediaan?',
        'Kuidas sa pealkirja parandaksid?',
      ], [120, 180], ['See arv eksitab, sest …', 'Enne oli … ja nüüd on …', 'Ausam pealkiri oleks …', 'Pool …-st / enamik …']), 'Mäng näitab, et sama arv võib öelda väga erinevaid asju.'), { task: 'S12', level: 4 }),
      'Kui aega jääb (12 min). Pealkirjad: 1) „Kuritegude arv külas kasvas 50 protsenti!” (4 → 6). 2) „Iga teine lugeja usaldab meie portaali!” (küsitlus portaali enda lugejate seas). 3) „Bussipilet kallineb kolmandiku võrra” (1,50 → 2 €). 4) „Uus ravim vähendab riski poole võrra” (2 inimeselt 1000-st 1 inimeseni). 5) „Keskmine pension tõusis” (kui palju, kellele?). Punkt iga õige küsimuse eest; lisapunkt ausa pealkirja eest.'), 12),
      tag(exitCheck(purpose(B.gaps('074_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Meie kursuse küsitluse järgi kuulab pool [õppijatest] eestikeelset raadiot iga päev. (õppijad)',
        'Infos ja sides teeniti keskmiselt peaaegu kolm korda rohkem kui majutuses ja [toitlustuses]. (toitlustus)',
        'Selles artiklis [käsitletakse] keskmise ja mediaani vahet. (käsitlema, umbisikuline olevik)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas hulk, võrdlus ja kokkuvõtte algus on käes.')), {}),
      purpose(B.selfcheck('074_t_self', ['Ma räägin, millist arvu uudistes ma usun ja miks.', 'Ma loen joonist ja uudist ning eristan keskmist ja mediaani.', 'Ma väljendan hulka ja osa: pool töötajatest, enamik töötajaid, iga teine, 6,2 protsendi võrra.', 'Ma tean, kust ma eesti keeles loen ja kuulan, ja mida ma iga uudise juures kontrollin.'], 'Meediamenüü valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('074_t_summary', 'Kodus: kokkuvõte ja reaktsioon.', 'Kirjuta kodus 180–220 sõna. Esimene lõik: kokkuvõte, mis ei moonuta arve (keskmine, mediaan, palga kasv, kaks võrdlust), ilma oma arvamuseta. Teine lõik: sinu reaktsioon — kas pealkiri eksitas ja kuidas see peaks kõlama. Kasuta kolme hulga või osa väljendit.', [15, 20], ['artiklis käsitletakse', 'mediaan', 'enamik', 'minu arvates'], 3, 'g_use'), 'Sinu kokkuvõte näitab, et oskad arvud ja oma arvamuse lahus hoida.')), { task: 'W15', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('074_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma meediamenüüst: kust sa eesti keeles loed ja kuulad ning üks reegel, mida sa nüüd kasutad.', [
        'Kust ja millal sa eesti keeles loed või kuulad?',
        'Mida sa iga uudise juures nüüd kontrollid?',
      ], [60, 120]), 'Õpetaja kuulab ja annab nõu, kuidas sellest saab kontrolli sõnavõtt.')), { task: 'S15' }),
      homework('074_t_homework', ['1. Kokkuvõte ja reaktsioon, 180–220 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-075': {
    title: 'Kontroll 15 — meedia ja info',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 15, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 15, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 15, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid meedia teemal, kirjutan Pressinõukogule umbes 140-sõnalise kaebuse ja 180-sõnalise arutluse ning räägin 1 minuti oma meediamenüüst; kindluse sõnad, autori mõtte edasiandmine, kesksõnad ja hulga väljendid on õiged.',
    // Kontroll 15 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L1-type notes, L3, L4; W1, W2b; S1, S2). Own texts on the module's content: headlines and how fast
    // false news spreads (MIT 2018, new here), comments, paid content, numbers and public broadcasting (Riigikontroll on
    // ERR's funding); a school newspaper's fact check and a learner's media diet as new material; timed by the Harno part
    // headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('075_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('075_d_vocab', 'Tunnid 71–74: sõnad, mis aitavad', ['pealkiri — заголовок', 'hinnang — оценка', 'allikas — источник', 'seisukoht — позиция', 'möönma — признавать (частично)', 'reklaam — реклама', 'tõend — доказательство', 'keskmine — средний', 'mediaan — медиана', 'kokkuvõte — резюме'], '2'), { topic: ['mediaan', 'seisukoht'] }),
      PART('075_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('075_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Kas me loeme veel kaugemale kui pealkiri?', [
        '(A) Hommikul bussis või õhtul diivanil kerime telefonis uudisvoogu. Näeme pealkirja, pilti ja paari kommentaari, ning sageli piisab sellest, et arvamus on valmis. Lugu ennast me ei ava, sest järgmine pealkiri ootab juba ees. See ei ole laiskus, vaid meie aja harjumus: infot on rohkem, kui keegi jõuab läbi lugeda. Kuid just seetõttu on pealkirjal võim, mida tal varem ei olnud. Uuringud näitavad, et paljud jagavad uudist edasi isegi siis, kui nad on lugenud ainult pealkirja.',
        '(B) Kui kiiresti valeinfo liigub, näitas 2018. aastal ajakirjas Science avaldatud Massachusettsi Tehnoloogiainstituudi uuring. Teadlased vaatasid läbi umbes 126 000 lugu, mida oli Twitteris jaganud kolm miljonit inimest. Valeuudist jagati 70 protsenti tõenäolisemalt kui tõest uudist ja tõene lugu jõudis 1500 inimeseni umbes kuus korda aeglasemalt. Huvitav oli seegi, et valet ei levitanud peamiselt robotid, vaid inimesed. Mida rohkem jagamisi, seda rohkem näevad lugu ka need, kes ise midagi ei otsinud.',
        '(C) Miks? Uurijate sõnul on vale sageli uudsem ja tekitab tugevamaid tundeid: üllatust, hirmu või viha. Pealkiri, mis paneb meid vihastama, saab rohkem jagamisi kui pealkiri, mis lihtsalt teatab. Toimetused teavad seda ja kiusatus on suur, sest iga klikk tähendab reklaamiraha. Ka ausal toimetusel on raske vastu panna, kui konkurendi karjuv pealkiri kogub tunniga kümme korda rohkem lugejaid. Lugeja omakorda harjub sellega, et iga uudis on kas skandaal või ime.',
        '(D) Kuid probleem ei ole ainult vales. Sama fakti saab öelda mitmel viisil. „Bussipilet kallineb 50 senti” ja „Linn tõstab taas hindu” võivad rääkida samast otsusest, kuid teine pealkiri on juba hinnang. Ka arv võib eksitada, ilma et see oleks vale: keskmine palk on õige arv, kuid enamik töötajaid teenib sellest vähem. Hea toimetus näitab seepärast mõlemat, keskmist ja mediaani, ning ütleb ka seda, millisest arvust protsent on arvutatud. Kui pealkiri lubab „kasvu viiekümne protsendi võrra”, tasub küsida, kas kasvati neljalt kuuele või neljasajalt kuuesajale.',
        '(E) Kolmas oht on makstud sisu, mis näeb välja nagu uudis. Seadus nõuab, et reklaam oleks äratuntav, ja ajakirjanduseetika koodeks, et see oleks ajakirjandusest eraldi. Sotsiaalmeedias on piir aga sageli hägune: mõjuisiku „aus arvamus” võib olla makstud koostöö, mille märge on peidetud teemaviidete vahele. Ka uudisportaalides on sisuturundust, mis on küll märgitud, kuid kiirel lugejal jääb märge sageli märkamata. Lugeja ei pea olema jurist, et seda märgata: piisab, kui ta küsib, kas keegi sai selle teksti eest raha.',
        '(F) Avalik-õiguslik ringhääling peaks olema vastukaal: ERR ei edasta kommertsreklaami ja peab seaduse järgi olema tasakaalustatud. Samas sõltub ERR-i raha igal aastal poliitilisest otsusest ja Riigikontroll on leidnud, et selline rahastamine ei ole täiel määral kooskõlas sõltumatuse põhimõttega. Seegi on põhjus, miks lugejal tasub vaadata mitut allikat ja võrrelda, kuidas sama sündmust kirjeldavad avalik-õiguslik ringhääling, erameedia ja välismaa väljaanded. Keeleõppijale on avalik-õiguslikul meedial veel üks eelis: ERR teeb uudiseid eesti, vene ja inglise keeles, nii et sama sündmust saab võrrelda mitmes keeles.',
        '(G) Mida siis teha? Mitte loobuda uudistest, vaid lugeda aeglasemalt. Kolm küsimust aitavad peaaegu alati: kes seda ütleb, mis on tõend ja kes selle eest maksab. Kui neile ei ole vastust, on see uudise kohta juba vastus. Ja kui pealkiri ajab vihale, tasub enne jagamist lugeda ka teine lõik. Aeglane lugemine ei tähenda, et uudiseid tuleb lugeda vähem. See tähendab, et iga loetud uudis jätab meile rohkem. Nii saab ka tavalisest hommikusest uudisvoost hea harjutus.',
        'Allikas: autori arvamus; faktid: Vosoughi, Roy ja Aral, ajakiri Science (2018); reklaamiseadus; Eesti ajakirjanduseetika koodeks; Riigikontroll (ERR).',
      ].join('\n\n'), [['Mida tahab autor pealkirjaga „Kas me loeme veel kaugemale kui pealkiri?” öelda?', 'paljud loevad ainult pealkirja|pealkirjal on liiga suur võim|tuleb lugeda aeglasemalt ja kogu lugu'], ['Milline autori kolmest küsimusest on sinu jaoks kõige raskem ja miks?']]),
      tag(B.choice('075_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Kuidas selgitab autor lõigus A, miks paljud loevad ainult pealkirja?', 'infot on rohkem, kui keegi jõuab läbi lugeda', 'inimesed on laisad', 'lood on liiga pikad ja igavad', 'pealkirjad on alati õiged'],
        ['Mis oli lõigu B järgi uuringu üks tulemus?', 'tõene lugu jõudis 1500 inimeseni umbes kuus korda aeglasemalt', 'valeuudiseid levitasid peamiselt robotid', 'valeuudist jagati harvem kui tõest', 'uuringus vaadati läbi ainult sada lugu'],
        ['Miks jagatakse valet lõigu C järgi sagedamini?', 'see on uudsem ja tekitab tugevamaid tundeid', 'see on lühem', 'see on paremini kirjutatud', 'toimetused keelavad tõese loo jagamise'],
        ['Mida tahab autor öelda lõigus D keskmise palga näitega?', 'ka õige arv võib eksitada', 'statistika on alati vale', 'keskmine palk on liiga väike', 'pealkirjades ei tohi arve kasutada'],
        ['Mida möönab autor lõigus F ERR-i kohta?', 'ka ERR-i rahastamine ei ole täiesti sõltumatu', 'ERR edastab palju reklaami', 'ERR ei pea olema tasakaalustatud', 'ERR on parem kui kõik teised allikad'],
        ['Millist soovitust annaks autor lugejale kõige tõenäolisemalt?', 'küsida, kes räägib, mis on tõend ja kes maksab', 'uudiseid ei tasu enam lugeda', 'kõik pealkirjad valetavad', 'sotsiaalmeedia reklaam tuleks keelata'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('075_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Isegi riigi ringhäälingu raha sõltub poliitikute otsusest. | [F]',
        '2. Viha tekitav pealkiri leiab rohkem jagajaid. | [C]',
        '3. Me kujundame arvamuse, ilma et lugu avaksime. | [A]',
        '4. Valeinfot ei levitanud peamiselt masinad. | [B]',
        '5. Kui küsimustele ei ole vastust, ütleb see uudise kohta palju. | [G]',
        '6. Makstud sisu ja ajakirjanduse vahe ei ole alati selge. | [E]',
        '7. Kaks pealkirja võivad kirjeldada sama otsust erineva hinnanguga. | [D]',
        '8. Iga klikk toob väljaandele raha. | [C]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('075_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Lugeja kirjutab kohaliku portaali toimetusele. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri toimetusele', [
        'Lugupeetud toimetus!',
        'Kirjutan teile eilse uudise pärast. Pealkiri „Perearstikeskus suletakse!” ei vasta loole: keskus ei sulge uksi, vaid kolib uude majja. [Väidetavalt] (väitma, „keegi ütleb, et”) on paljud patsiendid juba hakanud uut arsti otsima.',
        'Teie loo [sõnul|järgi] (allikas) ei ole kolimise kuupäeva veel kinnitatud. Kuid pealkirjas oli see esitatud kui [kinnitatud] (kinnitama, kesksõna) fakt. Mõistan, et pealkiri peab olema huvitav. Möönan ka, et uudise sisu oli enamasti õige.',
        'Siiski oli pealkiri [eksitav] (eksitama, -v omadussõna). Meie küsitluses ütles pool [vastanutest] (vastanud), et luges ainult pealkirja. Iga [teine] (kaks, järgarv) neist arvas, et keskus kaob täiesti.',
        'Palun avaldage [parandus] (parandama, nimisõna) ja muutke pealkirja. Kommentaariumis levivad juba [tõendamata] (tõendama, -mata) väited, et vald [olevat] (olema, kaudne kõneviis) keskuse müünud.',
        'Ootan teie [vastust] (vastus).',
        'Lugupidamisega\nJärvemäe valla elanik',
        'Allikas: väljamõeldud lugejakiri (õppetekst).',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('075_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas meie kooli ajaleht faktikontrolli tegi', [
        'Eelmisel sügisel levis koolis jutt, et sööklas hakatakse pakkuma ainult taimetoitu. [[Mõne päevaga oli sellest kuulnud peaaegu iga õpilane.]]',
        'Meie kooli ajalehe toimetus otsustas jutu kontrollida. [[Kõigepealt küsisime, kust see väide üldse alguse sai.]]',
        'Selgus, et keegi oli näinud direktori kirja ainult poolikult. [[Tegelikult oli kirjas, et taimetoit lisatakse menüüsse kaks korda nädalas.]]',
        'Kirjutasime loo, kus oli ka direktori kommentaar. [[Pealkirjaks valisime „Sööklas tuleb juurde taimetoit, liha ei kao”.]]',
        'Loo all oli palju kommentaare ja mõned olid päris teravad. [[Vastasime neile rahulikult ja lisasime lingi direktori kirjale.]]',
        'Nüüd on meil toimetuses reegel. [[Enne avaldamist peab igal väitel olema vähemalt kaks allikat.]]',
      ], ['Seepärast otsustasime jutu kohta mitte midagi kirjutada.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('075_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus? Kirjuta 3–4 lauset: üks autori mõte (autori sõnul …), sinu arvamus ja näide oma elust. Kasuta üht kindluse sõna (tõenäoliselt, väidetavalt).', [3, 4], ['autori sõnul', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('075_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('075_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundide 71–74 teemadel. Paranda ja ütle teisiti nii, et lugeja saab sinust täpselt aru.', 'full'),
      B.errorfix('075_p_fix', 'Keeleosa A: paranda kommentaar enne saatmist (6 punkti).', 'Sõber palus, et vaataksid tema kommentaarid ja sõnumid enne saatmist üle. Igas lauses on üks viga: kirjuta lause õigesti.', [
        ['Väidetavalt bussipilet kallineb järgmisel aastal veel.', 'Väidetavalt kallineb bussipilet järgmisel aastal veel.'],
        ['Autori sõnul ta leiab, et kommentaarium peaks jääma alles.', 'Autori sõnul peaks kommentaarium jääma alles.|Autor leiab, et kommentaarium peaks jääma alles.|Autori sõnul peaks kommentaarium alles jääma.'],
        ['Kommenteerija väitel portaal ei olevat sõltumatu.', 'Kommenteerija väitel ei olevat portaal sõltumatu.'],
        ['See postitus oli makstuga koostöö, kuigi märget ei olnud.', 'See postitus oli makstud koostöö, kuigi märget ei olnud.'],
        ['Pool töötajad teenib keskmisest palgast vähem.', 'Pool töötajatest teenib keskmisest palgast vähem.|Pooled töötajad teenivad keskmisest palgast vähem.'],
        ['Keskmine palk tõusis aastaga 6,2 protsenti võrra.', 'Keskmine palk tõusis aastaga 6,2 protsendi võrra.|Keskmine palk tõusis aastaga 6,2 protsenti.'],
      ]),
      B.transformation('075_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte teisiti nii, et lause algab antud sõnadega.', [
        ['Ma olen peaaegu kindel, et homme tuleb lund.', 'Tõenäoliselt …', 'Tõenäoliselt tuleb homme lund.|Tõenäoliselt tuleb lund homme.'],
        ['Inimesed räägivad, et turg suletakse.', 'Kuuldavasti …', 'Kuuldavasti suletakse turg.|Kuuldavasti turg suletakse.'],
        ['Autor tunnistab, et vastastel on osaliselt õigus.', 'Autor möönab, et …', 'Autor möönab, et vastastel on osaliselt õigus.'],
        ['Keegi ei ole seda väidet tõendanud.', 'See väide on …', 'See väide on tõendamata.'],
        ['Reklaami peab saama ära tunda.', 'Reklaam peab olema …', 'Reklaam peab olema äratuntav.'],
        ['50 protsenti lugejatest loeb ainult pealkirja.', 'Pool …', 'Pool lugejatest loeb ainult pealkirja.|Pooled lugejad loevad ainult pealkirja.'],
      ]),
      PART('075_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('075_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet raadiost, raamatukogust, portaalist ja kohalikust ajalehest, igaüht üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Raadio teatab: homsest on hommikused uudised eetris pool tundi varem, kell kuus. Õhtune uudistesaade jääb muutmata. Kõiki saateid saab järele kuulata ka veebis.',
        '2. Linnaraamatukogu kutsub meediakoolitusele „Kuidas uudist kontrollida”. Koolitus toimub neljapäeval kell kuus ja on kõigile tasuta. Kohti on kakskümmend, registreeruda saab infolauas.',
        '3. Portaal teatab: alates esmaspäevast saab kommenteerida ainult sisse logitud kasutaja. Iga kommentaar ilmub pärast moderaatori kontrolli. Kommentaare saab lisada kella kaheksast kahekümne kaheni.',
        '4. Valla ajaleht palub vabandust: eelmises numbris oli lasteaia avamise kuupäev vale. Lasteaed avatakse mitte märtsis, vaid mais. Täpsem info on valla kodulehel.',
      ], [
        'Hommikused uudised algavad homsest kell [kuus|6].',
        'Kõiki raadiosaateid saab järele kuulata ka [veebis|internetis].',
        'Raamatukogu meediakoolitusele on kohti [kakskümmend|20].',
        'Portaalis saab nüüd kommenteerida ainult sisse [logitud] kasutaja.',
        'Portaali kommentaar ilmub alles pärast [moderaatori] kontrolli.',
        'Valla ajalehe järgi avatakse lasteaed hoopis [mais].',
      ]),
      tag(B.listening('075_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', INTERVIEW_075, [
        'Tiina Saar soovitab õppida meedia abil [viisteist|15] minutit päevas, aga iga päev.',
        'Uudist tuleks lugeda kaks korda: esimest korda pealkirja ja esimest [lõiku].',
        'Pärast lugemist tasub küsida, kas pealkiri ütles sama mis [lugu].',
        'Tiina sõnul on kuulamine alguses kindlasti [raskem] kui lugemine.',
        'ETV otsesaadetele saab nüüd valida automaatsed [subtiitrid].',
        'Ühest loost tuleks valida ainult [kolm|3] sõna, mis uudistes tagasi tulevad.',
        'Nädala lõpuks on õppijal Tiina arvutuse järgi [kakskümmend üks|21] uut sõna.',
        'Kui uudised on liiga kurvad, soovitab Tiina teadusuudiseid või raadio [vestlussaateid].',
        'B2 lugeja mõtleb ka sellele, kes räägib ja [miks].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('075_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Tiina Saar õpetab täiskasvanuid.', true],
        ['Tiina arvates on parem õppida kaks tundi pühapäeval kui veidi iga päev.', false],
        ['Esimesel lugemisel tuleks lugeda kogu lugu.', false],
        ['Automaatsed subtiitrid on Tiina sõnul täiuslikud.', false],
        ['Tiina soovitab kõiki uusi sõnu üles kirjutada.', false],
        ['Sõna „väidetavalt” on Tiina näide sõnast, mis uudistes tagasi tuleb.', true],
        ['Tiina sõnul on ERR Novaatori lood sageli lühikesed ja selged.', true],
        ['Tiina arvates on kõige tähtsam, et teema õppijat huvitaks.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('075_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('075_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad Pressinõukogule kaebuse ja arutluse. Sõnavõtus esitled mooduli tulemust: oma meediamenüüd, mille paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own media diet, built in 071–074
      B.planning('075_t_product', 'Mooduli tulemus: minu meediamenüü.', 'Võta oma meediamenüü tunnist 74 ja lisa igale reale üks lause, mis kasutab tunni keelt.', ['Kust ja millal ma eesti keeles loen ja kuulan? (tund 74: hulk ja osa — iga päev, kaks korda nädalas)', 'Pealkiri: mida ma kontrollin? (tund 71: tõenäoliselt, väidetavalt, taas)', 'Autor: kuidas ma tema mõtte edasi annan? (tund 72: autori sõnul, möönab)', 'Reklaam ja arv: mida ma küsin? (tunnid 73 ja 74: makstud, tõendamata; keskmine või mediaan)']),
      PART('075_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('075_t_letter', 'Kirjutamine 1: kaebus Pressinõukogule (umbes 140 sõna).', 'Sinu valla portaal avaldas pealkirja „Vald sulgeb noortekeskuse!”. Loos endas oli kirjas, et keskus kolib suveks teise majja ja avatakse sügisel uuesti. Toimetus ei vastanud sinu kirjale. Kirjuta Pressinõukogule: mis ilmus ja millal, mis on pealkirjas vale (fakt, hinnang või oletus), kuidas see inimesi mõjutas ja mida sa palud.', 'Lugupeetud Pressinõukogu!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('075_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas sotsiaalmeedia mõjuisikud peaksid oma postituste eest vastutama samamoodi nagu ajakirjanikud? Too mõlema poole argumendid, igaühele näide, ja sinu põhjendatud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3), { task: 'W14', harno: 'W2b' }),
      PART('075_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('075_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi keelekursuse seminaril 1 minut oma meediamenüüst. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Kust ja kui sageli sa eesti keeles loed ja kuulad?', 'Milline sinu reegel on kõige kasulikum ja miks?', 'Mida sa nüüd teistmoodi teed kui moodulit alustades?', 'Paariline küsib: „Kumba sa rohkem usaldad, raadiot või sotsiaalmeediat?”', 'Kas avalik-õiguslik ringhääling on sinu arvates vajalik? Miks?', 'Kas koolis peaks õpetama uudiste kontrollimist? Põhjenda.'], [90, 180], ['Minu meediamenüüs on …', 'Kõige kasulikum reegel on …, sest …', 'Varem lugesin …, nüüd …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('075_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas kõik uudised peaksid olema lugejale tasuta? Argumendid: info on demokraatia alus ja igaüks peab saama seda lugeda; tasulise loo asemel loetakse tasuta kuulujutte sotsiaalmeedias; ERR-i uudised on juba praegu kõigile avatud. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas kõik uudised peaksid olema lugejale tasuta? Argumendid: hea ajakirjandus maksab — ajakirjanikud, toimetajad, faktikontroll; tasuta uudis elab klikkidest ja see soosib karjuvaid pealkirju; tellija ootab kvaliteeti ja toimetus vastutab tema ees. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks mina loen …', 'Ma möönan, et …, kuid …'], ['Kas sa väidad, et …?', 'Tõenäoliselt …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('075_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kaebus: mis ilmus, mis on vale ja miks, mõju inimestele, selge palve, ametlik toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, selge järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: allikad, reeglid ja põhjendus 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, möönsin, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('075_t_self', ['Kirjutamine: … / 25 punkti (kaebus 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 15 läbitud'),
    ],
  },
}, {
  'b1b2-071': 'PROB L→S', 'b1b2-072': 'AVAS R→S', 'b1b2-073': 'KUUL L→W', 'b1b2-074': 'LUGU R→W', 'b1b2-075': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 071
  '071_d_news': [
    'Uudis 1: pilet kallineb 1,50 eurolt 2 eurole — 50 senti; pensionärid sõidavad ka edaspidi tasuta.',
    'Uudis 1: „lisaraha kulub kümne uue elektribussi ostmiseks, et bussid saaksid õhtuti käia iga viieteistkümne minuti järel”.',
    'Uudis 2: „soovitab sõitu võimaluse korral edasi lükata” — see on soovitus, mitte keeld.',
    'Uudis 3: „esialgu pooleaastane katse … kui patsiente tuleb piisavalt, jääb … püsima”.',
    'Uudis 4: „Linnavalitsus seda ei kinnita … otsust ei ole tehtud.”',
    'Uudis 5: „Tegelikult kolib raamatukogu …” — eilne uudis oli vale, toimetus parandab.',
  ],
  '071_p_sure': [
    'võib-olla = ma ei tea; pärast algussõna tuleb tegusõna (suletakse).',
    'väidetavalt = keegi teine väidab; tegusõna kohe järel: hakkavad.',
    'tõenäoliselt = peaaegu kindel; tegusõna teisel kohal: teeb.',
    '„taas” ja hüüumärk on hinnang; fakt on ainult see, et linn tõstab hinda.',
    'koguni = üllatavalt palju; see sõna on arvu ees.',
    'kuuldavasti = kuulsin teistelt; tegusõna kohe järel: võtab.',
    'alles = liiga hilja; sõna lause alguses, tegusõna teisel kohal: kolib.',
  ],
  '071_t_heads': [
    'Otsus on tehtud ja arv on täpne: fakt.',
    'Vald teatas katsest: fakt koos piiranguga („katseks”).',
    'Fakt on see, et sünoptik nii ütles; allikas on pealkirjas.',
    '„taas” on hinnang ja pensionärid ei maksa üldse — pealkiri on ka vale.',
    '„halvab kogu Lõuna-Eesti” on liialdus: prognoos ütles „võib sadada kuni 20 cm”.',
    '„Alles nüüd” ütleb, et see on liiga hilja — hinnang.',
    'Küsimärk ja kinnitamata postitus: linn ei ole seda kinnitanud.',
    '„kuuldavasti” — kellegi jutt, allikas puudub.',
  ],
  '071_t_exit': [
    'Keegi ei ole kinnitanud: väidetavalt või kuuldavasti.',
    'Otsus on tehtud: kindlasti / kahtlemata.',
    'koguni = palju; üks sõna teeb faktist hinnangu.',
  ],
  // 072
  '072_d_pos': [
    '4. lõik: „Kommentaarium jäägu alles, kuid … elutuba kui väljak.”',
    '1. lõik: „Osa neist on targad …”, kuid „suur osa on … solvangud” — kriitiline, aga mitte ainult negatiivne.',
    '2. lõik: „kes kommentaariumi avab, peab selle eest ka hoolitsema”.',
    '3. lõik: „Ma mõistan seda hirmu. Sõnavabadus on demokraatia alus …”',
    'Elutoas vesteldakse rahulikult ja tuntakse üksteist; väljakul karjub kõige valjem.',
    '4. lõik: „See maksab portaalile raha ja aeglustab arutelu.”',
    'Autor teeb ettepaneku ja põhjendab seda: ta tahab veenda.',
  ],
  '072_p_report': [
    'autori arvates + tegusõna teisel kohal: peaks.',
    'möönab = tunnistab osaliselt vastaste õigust.',
    'rõhutab = ütleb tähtsana; „Tähtis on see” näitab rõhku.',
    'Kaudne kõneviis: olema → olevat; pärast „kommenteerija sõnul” tegusõna kohe.',
    'maksma → maksvat: sina ei ole arvu kontrollinud (ka tavaline vorm on lubatud).',
    'Eitus kaudses kõneviisis: ei + muutvat.',
    'kahtlema, kas …: lugeja ei ole kindel.',
  ],
  '072_t_exit': [
    'möönab = tunnistab osaliselt (sõnavabadus on tähtis), kuid jääb oma seisukoha juurde.',
    'Kaudne kõneviis: olema → olevat — see on kommenteerija väide, mitte sinu oma.',
    'autori sõnul / arvates / väitel + tegusõna teisel kohal (peaks).',
  ],
  // 073
  '073_d_pod': [
    'Merike: „Kui inimene saab postituse eest raha, tasuta toote või muu hüve, on see reklaam.” Jälgijate arv ei loe.',
    'Merike: „juba postituse alguses, mitte kuskil kolmekümne teemaviite vahel”.',
    'Kärt: „Mulle tundub, et … vaatab seda umbes poole vähem inimesi” — see on tema mulje, mitte uuring.',
    'Merike: „Esimene on hinnang, teine vajab tõendit.”',
    'Merike: „Kas postituse eest maksti? Kas väide on kontrollitav? … kes selle eest raha ei saa?”',
  ],
  // 072 radio
  '072_t_radio': [
    'Saatejuht: „kommentaarium olema elutuba, mitte väljak”.',
    'Tõnis: „See ongi tsensuur!”',
    'Tõnis: „autor töötab ilmselt ise portaalis” — see on rünnak inimese vastu, tõend puudub (autor töötab raamatukogus).',
    'Marje: „autor ei taha midagi keelata, ta tahab korda”.',
    'Tõnis: „Kes maksab moderaatorile?” — see on päris argument.',
    'Marje: „moderaator loeb ainult tundlike uudiste kommentaare”.',
  ],
  '073_p_part': [
    'Koostöö eest on makstud: -tud-kesksõna makstud.',
    'Reklaami peab saama ära tunda: -tav → äratuntav.',
    'Keegi ei ole tõendanud: -mata → tõendamata.',
    'Reklaam oli varjatud (keegi varjas): -tud → varjatud.',
    'jääma + -mata: jäi märgistamata.',
    'ei ole tõestatud: -tud-kesksõna liitajavormis.',
    'otsima + osastav; -tav käändub: kontrollitavat.',
  ],
  '073_t_judge': [
    'Märge on olemas, aga 25 teemaviite järel — tavaline lugeja ei märka seda.',
    '„REKLAAM” on esimene sõna ja partner on nimetatud: reklaam on äratuntav.',
    'Väide „laenu saavad kõik, ka ilma palgata” on tõendamata ja eksitav: vastutustundlik laenuandja kontrollib sissetulekut.',
    'Ühe inimese kogemusest tehakse üldistus kõigi kohta — tõend puudub.',
    'Tasuta toode on ka hüve: postitus on reklaam ja tuleb märkida alguses.',
    'Reklaami järele valvab Tarbijakaitse ja Tehnilise Järelevalve Amet.',
  ],
  '073_t_exit': [
    'Keegi maksis koostöö eest: makstud.',
    'jääma + -mata: jäi tõendamata.',
    'Väidet saab kontrollida: -tav → kontrollitav.',
  ],
  // 074
  '074_d_facts': [
    'Uudis ja joonis: „keskmine brutokuupalk … 2135 eurot”.',
    'Uudis: „6,2 protsenti rohkem kui aasta varem”.',
    'Uudis ja joonis: mediaanpalk 1753 eurot.',
    '2135 − 1753 = 382 eurot.',
    '3821 : 1337 ≈ 2,9 — peaaegu kolm korda.',
    'Uudis: „keskmist tõstavad suured palgad”.',
    'Mediaan on keskmisest väiksem, seega teenib üle poole töötajatest keskmisest vähem.',
    'Uudis: „brutopalgast läheb veel maha ka tulumaks”.',
  ],
  '074_t_voice': [
    'Tädi: „eestlane teenib juba üle kahe tuhande saja euro kuus”.',
    'Tädi: „olen töötanud poes kassapidajana kakskümmend aastat”.',
    'Tädi: „üks on bussijuht ja teine koristaja”.',
    'Tädi: „Kas statistika valetab või petetakse meid tööl?”',
    'Tädi: „tütar ütles, et ka keskmine pension tõusis”.',
    'Tädi: „enne pühapäevast sünnipäeva”.',
  ],
  '074_p_parts': [
    'kolmandik + seestütlev: vastanutest.',
    'pool + seestütlev: töötajatest; tegusõna ainsuses.',
    'iga teine + ainsuse nimetav: lugeja.',
    'enamik + osastav või seestütlev: töötajaid / töötajatest.',
    'võrra + omastav: protsendi võrra.',
    'kaks kolmandikku … + tegusõna ainsuses, minevik: usaldas.',
    'Kokkuvõtte algus, umbisikuline olevik: käsitletakse.',
  ],
  '074_t_exit': [
    'pool + seestütlev: õppijatest.',
    'Võrdluses on mõlemad sektorid samas käändes: majutuses ja toitlustuses.',
    'Kokkuvõtte algus, umbisikuline olevik: käsitletakse.',
  ],
  // 075
  '075_d_read': [
    'Pealkiri küsib, kas loeme veel pealkirjast kaugemale: lõik A — paljud ei ava lugu, lõik G — loe aeglasemalt ja ka teine lõik.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '075_d_mc': [
    'Lõik A: „infot on rohkem, kui keegi jõuab läbi lugeda”.',
    'Lõik B: „tõene lugu jõudis 1500 inimeseni umbes kuus korda aeglasemalt”.',
    'Lõik C: vale on „uudsem ja tekitab tugevamaid tundeid”.',
    'Lõik D: „keskmine palk on õige arv, kuid enamik töötajaid teenib sellest vähem”.',
    'Lõik F: „Samas sõltub ERR-i raha … poliitilisest otsusest” — autor möönab nõrkust.',
    'Lõik G: autor soovitab küsida, „kes seda ütleb, mis on tõend ja kes selle eest maksab”.',
  ],
  '075_d_para': [
    'Lõik F: ERR-i raha „sõltub igal aastal poliitilisest otsusest”.',
    'Lõik C: „Pealkiri, mis paneb meid vihastama, saab rohkem jagamisi”.',
    'Lõik A: „sageli piisab sellest, et arvamus on valmis. Lugu ennast me ei ava.”',
    'Lõik B: „valet ei levitanud peamiselt robotid, vaid inimesed”.',
    'Lõik G: „Kui neile ei ole vastust, on see uudise kohta juba vastus.”',
    'Lõik E: „Sotsiaalmeedias on piir aga sageli hägune”.',
    'Lõik D: „võivad rääkida samast otsusest, kuid teine pealkiri on juba hinnang”.',
    'Lõik C: „iga klikk tähendab reklaamiraha”.',
  ],
  '075_d_cloze': [
    'väidetavalt = keegi väidab, aga kiri ei ole seda kontrollinud.',
    'Teie loo sõnul / järgi = allikas.',
    'kinnitama → kinnitatud fakt (-tud).',
    'eksitama → eksitav (mis eksitab).',
    'pool + seestütlev: vastanutest.',
    'iga teine + ainsus.',
    'parandama → parandus (nimisõna, avaldage mida? — parandus).',
    'tõendama → tõendamata väited.',
    'Kaudne kõneviis: vald olevat müünud — see on kommentaatorite väide.',
    'ootama + osastav: vastust.',
  ],
  '075_d_bank': [
    'Jutt levis kiiresti: „Mõne päevaga … peaaegu iga õpilane.”',
    'Kontrolli esimene samm: kust väide alguse sai.',
    'Selgub, mis kirjas tegelikult oli: taimetoit lisatakse, liha ei kao.',
    'Loo pealkiri: aus ja täpne.',
    'Kommentaaridele vastati rahulikult ja allikaga.',
    'Uus reegel: igal väitel kaks allikat. Üle jääb „mitte midagi kirjutada” — toimetus kirjutas.',
  ],
  '075_p_fix': [
    'Pärast „väidetavalt” lause alguses on tegusõna teisel kohal: kallineb bussipilet.',
    'Üks allikas korraga: autori sõnul … või autor leiab, et …',
    'Pärast „kommenteerija väitel” tuleb tegusõna kohe: ei olevat portaal.',
    '-tud-kesksõna nimisõna ees ei käändu: makstud koostöö.',
    'pool + seestütlev (töötajatest) ja tegusõna ainsuses; või pooled töötajad teenivad.',
    'võrra + omastav: 6,2 protsendi võrra.',
  ],
  '075_p_trans': [
    'tõenäoliselt = peaaegu kindel; tegusõna teisel kohal: tuleb.',
    'kuuldavasti = inimesed räägivad.',
    'möönab = tunnistab osaliselt vastase õigust.',
    'Keegi ei ole tõendanud: -mata → tõendamata.',
    'Mida saab ära tunda: -tav → äratuntav.',
    '50 protsenti = pool; pool + seestütlev, tegusõna ainsuses.',
  ],
  '075_p_notes': [
    'Teade 1: „pool tundi varem, kell kuus”.',
    'Teade 1: „saab järele kuulata ka veebis”.',
    'Teade 2: „Kohti on kakskümmend”.',
    'Teade 3: „ainult sisse logitud kasutaja”.',
    'Teade 3: „Iga kommentaar ilmub pärast moderaatori kontrolli.”',
    'Teade 4: „mitte märtsis, vaid mais”.',
  ],
  '075_p_listen': [
    'Tiina: „viisteist minutit päevas, aga iga päev”.',
    'Tiina: „esimest korda ainult pealkirja ja esimest lõiku”.',
    'Tiina: „kas pealkiri ütles sama mis lugu”.',
    'Tiina: „Alguses kindlasti” — kuulamine on raskem.',
    'Tiina: „ETV otsesaadetele saab nüüd valida automaatsed subtiitrid”.',
    'Tiina: „Valige ühest loost kolm sõna”.',
    'Tiina: „Nädala lõpuks on teil kakskümmend üks uut sõna” (7 × 3).',
    'Tiina: „valige teadusuudised või raadio vestlussaated”.',
    'Tiina: „mõtleb … ka sellele, kes räägib ja miks”.',
  ],
  '075_p_tf': [
    'Saatejuht: „täiskasvanute keeleõpetaja” — õige.',
    'Tiina: „Parem viisteist minutit … kui kaks tundi pühapäeval” — vale.',
    'Esimesel korral ainult pealkiri ja esimene lõik — vale.',
    '„Need ei ole küll täiuslikud” — vale.',
    '„Ärge kirjutage üles kõiki sõnu” — vale.',
    'Tiina näited: „väidetavalt”, „otsus”, „uuring” — õige.',
    '„ERR Novaatori lood on sageli lühikesed ja selged” — õige.',
    '„Kõige tähtsam on, et teema teid huvitaks” — õige.',
  ],
};
