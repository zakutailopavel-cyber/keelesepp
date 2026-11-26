// B2 course (B1 → B2 roadmap), module 15 „Meedia, info ja kriitiline lugemine” (b1b2-071…075), stage B2-.
// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25),
// built on the pattern of modules 11–14 (b2/module11.js … b2/module14.js). On the v3 station engine with the v4 task formats.
// Module goal (the learner): „Ma loen ja kuulan meediat nagu B2 lugeja: eristan pealkirjas fakti, hinnangut ja oletust,
// annan autori mõtte edasi ja hoian oma arvamuse eraldi, tunnen ära varjatud reklaami ja tõendamata väite ning võtan
// arvudega uudise kokku nii, et see ei moonuta.” Media from the learner's own angle: the headline in his feed, the comment
// section under the news he reads, the influencer in his phone, the „average wage” that is not his wage. Not module 12's
// 058 („is it true?”, checking before sharing): this module asks „how is it said, by whom, with what evidence, who pays and
// what does the number hide?”.
//   Avasta  (4): station 1 — 071 the module's COLD TASK in writing (5 min, 5–7 sentences, no phrases; module 14 measured
//                speaking, module 15 measures writing; its parallel is 075_t_cold), 072–074 the 5-min „Parandatud versioon”
//                of the previous lesson's draft (data.revisionOf, v6 G16); station 2 the words (10 + 3 review words from
//                3–15 lessons back, data.review, v6 G18), ONE input — listening ≈ 3.5 min, 2 voices (071 „Meediatund”, 073
//                „Raha ja meie”) or reading ≈ 470–480 words with ≥ 3 inference questions (072 „Kommentaarium on elutuba,
//                mitte väljak”, 074 „Miks keskmine palk ei ole sinu palk?”) — and one scheme (071, 073, 074; 072's Avasta
//                holds the R1 corner instead).
//   Harjuta (4): the rule box (B1 one-line review, B2 step, one L1-contrast line „Vene keeles …”), one form task of 10
//                items that PRODUCES the rule box's bold forms (the choice is left open, the hint is the meaning or the
//                dictionary form, never the answer; v6 G15), one second task of 8 rows (074: the R4 sentence bank), and the
//                10-min DRAFT of the home text in class.
//   Kasuta  (5): station 4 the main task — types modules 12–14 did not use, one each (v6 G17): 071 roleplay (the
//                editors' meeting, the editor-in-chief's hidden information), 072 interview (the radio host asks the
//                readers' representative), 073 survey (three classmates, a one-minute overview), 074 presentation (the
//                wage news explained to colleagues; a mediation in content) — each with an „Abikaart” and a
//                „Lisaväljakutse” (data.support / data.stretch, v6 G24); the EXIT 30–60 s of speech in the main task's skill
//                (v6 G14); the self-check with 3 criteria rated 0–1–2 and one own sentence; the home text (finish the
//                draft, ~140 / ~180 words, 1-min voice message, „Harjuta → moodul 15”); the analytic Harno B2 rubric with a
//                borderline sample (v5 G10).
//   071 game   „Sama uudis, neli pealkirja: kas pealkiri ütleb tõtt?”            radio (L4)    tõenäoliselt, väidetavalt; taas, koguni   roleplay
//   072 debate „Kommentaarium: sõnavabadus või sõimuväljak?”                     reading (R1)  autori sõnul, möönab; -vat                 interview
//   073 case   „„Minu lemmikkreem!” — kas see on soovitus või reklaam?”          podcast (L2)  makstud, kontrollitav, tõendamata          survey
//   074 facts  „Keskmine palk tõusis — miks enamik teenib vähem?”                reading (R4)  pool töötajatest, enamik teenib, võrra     presentation
//   075 exam   Kontroll 15: one sheet, 45 min, READING + WRITING (m13 R + W, m14 L + S — the controls alternate). It is a
//              two-skill control, not a full mock (the methodologist's decision for 040, 055, 060, 065 and 070: v6 §2 g,
//              „B2, lesson 5 of a module: 2 skills alternating”). R4 (8 sentences + 1 extra) and R1 (8 questions on a
//              ≈ 480-word column); W1 = the true parallel of the written cold task, W2 = a W2a summary of a survey with
//              own comment (≈ 150 words in the 45-min control; ≈ 180 at the exam).
// Course-level repairs (final shape, docs/COURSE_FINAL_SHAPE_B2.md): the R1 corner (072) brings the R1 corners to 4; the
// R4 corner (074) and the control's R4 part add two R4 practices (module 14 left V6-gap-R4 and V6-corner-R1 open); the
// control's W2a adds a second W2a. Lead pairs as planned for module 15: PROB L→S, AVAS R→S, KUUL L→W, LUGU R→W.
// Real network (v6 G25): media log 071_t_mail („Minu eesti keele võrgustik”, ERR), peer exchange 072_t_reply (a
// classmate answers the opinion like a good commenter), real document + link task 073_t_mail (TTJA's guide for
// influencers, a 3-item task — the page was not opened by the author). Mediation in content 074 (colleagues misread a
// number); peer feedback round in every draft. Texts are adapted learning texts („KeeleSepp õppetekst”) without exact
// statistics (owner 2026-11-25; the v4 59 % click figure and the 2135 / 1753 € wages are gone); people in the
// recordings are invented and not the course cast (docs/COURSE_CAST.md); no dictation, no „Kas teadsid?”.
// Module 14's last draft (the proposal to the municipality, 069_p_draft / 069_t_mail) is revised in 071's home task
// (three marked sentences into „Minu vead” in Harjuta): station 1 of 071 holds the cold task and the Avasta sheet has
// no room for a second 5-min block (v5 G1: ≤ 4 blocks on a B2 Avasta) — the same decision as modules 11–14.
// Kept: lesson ids, titles (074 without the exact wage), topics and v4 formats; the v4 lessons of 2026-11-19 are kept below
// as V4 and every block that is not on a v6 sheet is taken from there with retire() (hidden, id and learners' answers
// kept, old explanations in OLD_WHY). A kept id keeps its block type.
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

// the v4 lessons of 2026-11-19 („task-based”): the source of every block that is not on a v6 sheet
const V4 = {
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
        'Kui valla leht kirjutab uuest teenusest või tänavavalgustusest, kas pealkiri ütleb, kellele see on ja mis on tähtaeg?',
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
};

// the v4 explanations of the retired blocks (shown with the hidden block, courseSheet.js withExplanations)
const OLD_WHY = {
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

// ---- v6 helpers (the same mechanisms as b2/module11.js … b2/module14.js) -------------------------------------------
// G18: the vocab block brings back three old words (3–15 lessons back); they are named on the sheet and used in the input
const withReview = (b, review) => ({ ...b, data: { ...b.data, title: `${b.data.title} Kordamiseks: ${review.join(', ')}.`, review } });
// G17 / G24: the main task of Kasuta — its type, the „Abikaart” (2–3 sentence starters) and the „Lisaväljakutse” line;
// both are printed on the learner's card too (the fold-out card is UI work, v6 §2 i)
const mainTask = (b, taskType, support, stretch, tags = {}) => tag({ ...b, data: { ...b.data, taskType, support, stretch } }, { main: true, level: 4, ...tags });
// G16: the 5-min „Parandatud versioon” that opens lessons 072–074 (replaces the warm-up statement, not an extra block)
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
const peerReply = (b) => ({ ...b, data: { ...b.data, peerReply: 'Kursusekaaslane loeb arvamuse ja vastab nagu hea kommentaator: üks argument poolt, üks vastu ja üks küsimus.', realAddressee: 'kursusekaaslane' } });
const mediaLog = (b) => ({ ...b, data: { ...b.data, mediaLog: true } });
// a control's rubric stays directly under the task it scores (courseSheet.js lessonOrder)
const keepPlace = (b) => ({ ...b, data: { ...b.data, keepPlace: true } });
// two blocks side by side on one row (the sheet's page balance)
const half = (b) => ({ ...b, width: 'half', span: 6 });
// v5 G6: a lesson recording is heard twice
const twiceInLesson = (b) => ({ ...b, data: { ...b.data, plays: 2 } });
const HARJUTA = 'Harjuta → moodul 15: sõnad ja vormid (10 min).';

// the analytic Harno B2 writing rubric (v5 G10): four criteria, 0–3 points each, with level descriptors; the teacher's
// note holds a borderline sample with its scoring (the same rubric as modules 11–14, the grammar line names module 15)
const B2_WRITING = [
  ['Ülesande täitmine ja register', '3 — kõik sisupunktid on täidetud, adressaat ja toon sobivad, pikkus on ülesande piires; 2 — üks punkt on nõrk või toon kõigub; 1 — kaks punkti on puudu või toon ei sobi adressaadile; 0 — tekst ei vasta ülesandele'],
  ['Ülesehitus ja sidusus', '3 — lõigud, teemalaused ja mitmekesised sidendid, mõte liigub loogiliselt; 2 — lõigud on olemas, kuid sidendid korduvad; 1 — mõtete loetelu ilma lõikudeta; 0 — järjekorrast ei saa aru'],
  ['Sõnavara', '3 — täpne ja mitmekesine, kordusi väldib; 2 — piisav, mõni kordus või ebatäpne sõna; 1 — piiratud, sõnad korduvad, tähendus on kohati segane; 0 — sõnavara ei kanna sisu'],
  ['Grammatika ja õigekiri', '3 — liitlaused ja vormid (tõenäoliselt suletakse, autori sõnul, olevat, makstud koostöö, tõendamata väide, pool töötajatest) on enamasti õiged; 2 — vigu on, kuid need ei takista mõistmist; 1 — vead takistavad kohati mõistmist; 0 — vead takistavad mõistmist pidevalt'],
];
const B2_WRITING_SHORT = ['3 kõik punktid, sobiv toon · 2 üks nõrk koht · 1 kaks puudu · 0 ei vasta', '3 lõigud ja mitmekesised sidendid · 2 sidendid korduvad · 1 loetelu · 0 segane', '3 täpne ja mitmekesine · 2 mõni kordus · 1 piiratud · 0 ei kanna sisu', '3 vead ei sega · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'];
const writingRubric = (id, title, sample) => {
  const b = B.rubricW2(id, title);
  return teach({ ...b, goal: 'g_use', data: { ...b.data, instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12. Kontrolli oma teksti enne saatmist.', criteria: B2_WRITING.map(([name], i) => ({ name, max: 3, hint: B2_WRITING_SHORT[i] })) } }, sample);
};

// why a v4 block left the sheet
const CUT_HOOK = 'v5/v6: station 1 is the cold task (071) or the 5-min „Parandatud versioon” (072–074); the hook text and the warm-up talk merged into it';
const CUT_INPUT = 'second input of the lesson (v5: one input per lesson)';
const CUT_STATS = '„Kas teadsid?” with exact statistics (owner 2026-11-25: adapted texts, no exact numbers; v5 §4: cut unless the task uses it)';
const CUT_DRILL = 'exit gaps → Harjuta (v6 G14: the exit is a 30–60-s performance of the can-do, not three form items)';
const CUT_EXTRA = 'extra task (v5: one product task in Kasuta; „Kui aega jääb” is in the teacher plan)';
const CUT_HOME = 'home card / voice task: the home text on the sheet carries the 1-min voice message and the Harjuta link (v5 §3, v6 G18)';
const CUT_OLDTASK = 'v4 task replaced by the v6 task of the same station (new id, other block type)';
const CUT_CONTROL = 'control is one sheet ≤ 10 blocks, reading + writing (v6 §2 g: B2 lesson 5 = 2 skills alternating; m14 was L + S)';
const RETIRE_WHY = {
  '071_d_know': CUT_STATS, '071_t_heads': 'sorting game (v5 §4: sorting lives in Harjuta, not on a B2 lesson sheet); the headline kinds are the scheme 071_d_scheme now',
  '072_d_open': 'v4 topic opener (≈ 330 words): the lesson\'s one input is now the longer column 072_d_text (v5: B2 reading 400–600 words with inference questions)', '072_t_radio': CUT_INPUT, '072_t_debate': 'v4 debate: the main task is now the radio interview 072_t_studio (v6 G17: types modules 12–14 used least)', '072_t_letter': CUT_OLDTASK,
  '073_d_talk': CUT_HOOK, '073_d_know': CUT_STATS, '073_t_posts': CUT_INPUT, '073_t_judge': 'three-post judgement: its criteria are the scheme 073_d_scheme and the form task now', '073_t_msg': 'in-class message: the main task is now the survey 073_t_survey (v6 G14: exit and main task speak), the message is the home text 073_t_mail', '073_t_essay': CUT_HOME,
  '074_d_chart': 'chart with exact national figures (owner 2026-11-25: no exact statistics); the numbers are an invented ten-person firm in the article 074_d_read', '074_d_text': 'v4 news text (≈ 80 words): the lesson\'s one input is now the article 074_d_read (v5: B2 reading 400–600 words)', '074_d_facts': CUT_INPUT, '074_t_voice': CUT_INPUT, '074_t_explain': CUT_OLDTASK, '074_t_menu': 'module product card „Minu meediamenüü”: the media log lives in 071_t_mail now (v6 G25 mediaLog)', '074_t_summary': CUT_HOME,
};
const reasonFor = (id) => RETIRE_WHY[id] || (/^075_/.test(id) ? CUT_CONTROL : /_d_(hook|talk)$/.test(id) ? CUT_HOOK : /_t_more$/.test(id) ? CUT_EXTRA
  : /_t_exit$/.test(id) ? CUT_DRILL : /_t_(home|homework|letter|essay|summary|news)$/.test(id) ? CUT_HOME : CUT_OLDTASK);

// a v4 block that left the sheet: hidden with its reason, its old explanation kept (v5 §4)
const V4_BLOCKS = Object.fromEntries(Object.values(V4).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const retire = (id) => {
  const b = V4_BLOCKS[id];
  if (!b) throw new Error(`module15: v4 plokki ${id} ei ole`);
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
    if (V4_BLOCKS[bid] && V4_BLOCKS[bid].type !== b.type) throw new Error(`module15: ${bid} oli ${V4_BLOCKS[bid].type}, nüüd ${b.type}`);
  });
  return [id, { ...l, ...phases }];
}));

// the purpose of every task („kes, kellele, mis tulemus”, stations.js st-purpose) for the teacher page — not printed in the
// instruction (v6 §2 e, G22: the instruction stays ≤ 25 words)
const PURPOSE = {
  '071_d_cold': 'Õpetaja näeb mooduli alguses, kuidas sa praegu arvamust kirjutad.',
  '071_d_scheme': 'Skeemist näed, kui kindel on pealkiri — see on sinu pealkirjamängu kaart.',
  '071_d_news': 'Kuuled toimetajalt, kuidas ühest uudisest saab neli eri pealkirja.',
  '071_p_forms': 'Sinu uudisnupus on selge, mida sa tead ja mida mitte.',
  '071_p_sure': 'Oskad eksitava pealkirja ausaks teha.',
  '071_p_draft': 'Kirja algus on valmis ja õpetaja märgib kolm lauset.',
  '071_t_meeting': 'Avalehele läheb pealkiri, mille eest sa julged vastutada.',
  '071_t_say': 'Näitad 30 sekundiga, et oskad ausat pealkirja kaitsta.',
  '071_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '071_t_mail': 'Toimetus saab kirja, mille põhjal ta saab pealkirja parandada.',
  '071_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '072_d_revise': 'Sinu kiri toimetusele saab paremaks ja sa näed oma vigu.',
  '072_d_text': 'Tead pärast lugemist, mida autor kommentaariumist arvab ja miks.',
  '072_d_pos': 'Näitad, et saad aru ka sellest, mida autor otse ei ütle.',
  '072_p_forms': 'Sinu kokkuvõttes on selge, kelle mõte on kelle oma.',
  '072_p_report': 'Oskad autori mõtet oma sõnadega täpselt edasi anda.',
  '072_p_draft': 'Arvamuse algus on valmis ja õpetaja märgib kolm lauset.',
  '072_t_studio': 'Raadio kuulajad saavad teada, mida lugejad kommentaariumist arvavad.',
  '072_t_say': 'Näitad 30 sekundiga, et hoiad autori mõtte ja oma mõtte lahus.',
  '072_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '072_t_reply': 'Portaal ja kursusekaaslane loevad sinu põhjendatud arvamust.',
  '072_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '073_d_revise': 'Sinu arvamus saab paremaks ja sa näed oma vigu.',
  '073_d_scheme': 'Skeemist näed, kas soovitus on tugev või ainult kiitus.',
  '073_d_pod': 'Kuuled juristilt, kuidas eristada soovitust reklaamist.',
  '073_p_part': 'Sinu hinnang postitusele on lühike ja täpne.',
  '073_p_fix': 'Postitused lähevad lehele ilma vigadeta.',
  '073_p_draft': 'Sõnumi algus on valmis ja õpetaja märgib kolm lauset.',
  '073_t_survey': 'Rühm saab teada, kuidas reklaam teid tegelikult mõjutab.',
  '073_t_say': 'Näitad 30 sekundiga, et oskad sõbrale varjatud reklaami seletada.',
  '073_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '073_t_mail': 'Mõjuisik saab viisaka, kuid selge sõnumi ja teab, mida muuta.',
  '073_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '074_d_revise': 'Sinu sõnum mõjuisikule saab paremaks ja sa näed oma vigu.',
  '074_d_read': 'Tead pärast lugemist, miks keskmine palk ei ole sinu palk.',
  '074_d_scheme': 'Skeem on sinu kokkuvõtte kava: kokkuvõte enne, arvamus eraldi.',
  '074_p_parts': 'Oskad arvud uudisest täpselt sõnadega edasi öelda.',
  '074_p_bank': 'Infolehe kokkuvõte on sidus ja lugeja saab sellest aru.',
  '074_p_draft': 'Kokkuvõtte algus on valmis ja õpetaja märgib kolm lauset.',
  '074_t_present': 'Kolleegid saavad aru, mida palgauudis tegelikult ütleb.',
  '074_t_say': 'Näitad 30 sekundiga, et oskad keskmise ja mediaani vahet seletada.',
  '074_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '074_t_report': 'Infolehe lugejad saavad kokkuvõtte, mis ei moonuta arve.',
  '074_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '075_d_bank': 'Näitad, et saad aru teksti ülesehitusest ja sidusast mõttest.',
  '075_d_mc': 'Näitad, et saad aru arvamusloost ja autori hoiakust.',
  '075_t_cold': 'Näed, kuidas su kirjutamine on mooduli algusest muutunud.',
  '075_t_rubric': 'Näed, mille eest viie minuti arvamuse punktid tulevad.',
  '075_t_summary': 'Kursuse ajalehe lugejad saavad kokkuvõtte ja sinu kommentaari.',
  '075_t_wrubric': 'Näed, mille eest kokkuvõtte punktid tulevad.',
};
const withPurposes = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { ...l, ...Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => [p, (l[p] || []).map((b) => (PURPOSE[b.id] ? { ...b, data: { ...b.data, purpose: PURPOSE[b.id] } } : b))])) }]));

// the radio talk of 071: a regional news editor on one news item and its four headlines (Harno B2 L4)
const RADIO_071 = [
  'Piret: Tere! Siin „Meediatund”, saade sellest, kuidas uudised sünnivad. Stuudios on maakonnaportaali toimetaja Urmas. Urmas, eelmisel nädalal ilmus ühest uudisest neli täiesti erinevat pealkirja. Mis juhtus?',
  'Urmas: Uudis ise oli lihtne. Linnavolikogu otsustas, et bussipilet kallineb märtsist viiskümmend senti. Pensionärid ja õpilased sõidavad edasi tasuta ning lisaraha eest ostetakse elektribussid, mis hakkavad õhtuti tihedamini käima. Neli portaali tegid sellest aga neli eri lugu.',
  'Piret: Loeme need ette. Esimene: „Bussipilet kallineb viiskümmend senti.”',
  'Urmas: See on puhas fakt. Igav, aga õige. Teine oli „Linn tõstab taas hindu — pensionär maksab kinni!”. Siin on kaks probleemi. Sõna „taas” ei ole fakt, vaid hinnang: see ütleb lugejale, et linn teeb jälle midagi halba. Ja teine pool on lihtsalt vale, sest pensionärid ei maksa üldse.',
  'Piret: Miks keegi sellise pealkirja kirjutab?',
  'Urmas: Klikkide pärast. Paljud loevad ainult pealkirja ja jagavad lugu edasi seda avamata. Vihane pealkiri levib kiiremini kui rahulik. Kolmas portaal kirjutas: „Kas buss muutub luksuseks?” Küsimärk tundub süütu, kuid see on oletus, mida keegi ei ole väitnud. Lugeja mäletab hiljem küsimust nagu vastust.',
  'Piret: Ja neljas?',
  'Urmas: „Volikogu: bussid hakkavad õhtuti tihedamini käima.” Ka see on tõsi ja allikas on kohe näha. Aga pealkiri valib ainult hea uudise ja jätab hinna välja. Täiesti neutraalset pealkirja ei olegi olemas: toimetaja valib alati, mida ta esile tõstab.',
  'Piret: Aga kas sõnad nagu „koguni” või „alles” on keelatud?',
  'Urmas: Ei ole. Need on täiesti tavalised eesti keele sõnad. Kuid uudise pealkirjas muudavad nad fakti arvamuseks. „Pilet kallineb viiskümmend senti” on teade. „Pilet kallineb koguni viiskümmend senti” ütleb juba, et see on palju. Kui toimetus tahab hinnangut anda, kirjutagu ta arvamuslugu ja pangu sinna oma nimi. Uudises peab lugeja ise otsustama, kas viiskümmend senti on palju või vähe.',
  'Piret: Kuidas teie toimetus otsustab, milline pealkiri läheb avalehele?',
  'Urmas: Meil on kolm küsimust. Kas pealkiri on tõsi? Kas sellest saab aru, kelle sõnad need on? Ja kas lugeja, kes loeb ainult pealkirja, saab õige pildi? Kui väide ei ole kinnitatud, kirjutame „väidetavalt” või nimetame, kes nii ütleb. Kui kahe allika jutt ei klapi, ootame enne avaldamist faktikontrolli.',
  'Piret: Kas te ise olete eksinud?',
  'Urmas: Muidugi. Eelmisel talvel kirjutasime, et raamatukogu suletakse. Tegelikult kolis raamatukogu kultuurimajja ja oli ainult kaks nädalat kinni. Me avaldasime paranduse samas kohas, kus oli olnud vale uudis, mitte kuskil lehe lõpus. Parandus ei ole häbi. Häbi on see, kui viga jäetakse parandamata.',
  'Piret: Kuulajad küsivad, kas kiirus ei ole tähtsam kui täpsus.',
  'Urmas: Kiirus on tähtis, aga usaldus on tähtsam. Kui portaal eksitab lugejat ühe korra, ta veel andestab. Kolmandal korral ta lahkub. Väikeses kohas on see eriti selge: meie lugejad tunnevad volikogu liikmeid ja valla sotsiaaltöötajat isiklikult ning ütlevad poes kohe, kui me midagi valesti kirjutasime.',
  'Piret: Mida soovitad kuulajale, kes ei ole ajakirjanik?',
  'Urmas: Ära jaga uudist ainult pealkirja põhjal. Ava lugu ja vaata kolme asja: kes ütleb, kas see on otsus või alles plaan ja kas pealkirjas on sõnu nagu „taas”, „koguni” või „alles”, mis lisavad hinnangut. Ja kui pealkiri lõpeb küsimärgiga, on vastus tavaliselt „ei”.',
  'Piret: Kas sa ise loed kommentaare oma lugude all?',
  'Urmas: Loen, kuigi mitte alati hea meelega. Kommentaaridest saan teada, mida lugeja pealkirjast valesti aru sai. Kui sama küsimus tuleb kümme korda, on viga tavaliselt meie pealkirjas, mitte lugejas.',
  'Piret: Aitäh, Urmas!',
];

// the podcast of 073: a consumer lawyer on recommendations and advertising (Harno B2 L2)
const PODCAST_073_V6 = [
  'Kaire: Tere tulemast saatesse „Raha ja meie”! Täna räägime sellest, kuidas eristada sõbra soovitust reklaamist. Stuudios on tarbijaõiguse jurist Toomas. Toomas, alustame lihtsast küsimusest: millal on postitus reklaam?',
  'Toomas: Siis, kui inimene saab postituse eest midagi vastu: raha, tasuta toote, soodustuse või kutse reisile. Seadus nõuab, et reklaam oleks äratuntav. Lugeja peab kohe aru saama, et tegemist on makstud koostööga. Varjatud reklaam on keelatud ka siis, kui see on kirjutatud väga isiklikult.',
  'Kaire: Paljud mõjuisikud märgivad koostöö postituse lõppu, kolmekümne teemaviite vahele.',
  'Toomas: See ei ole piisav. Märgis „reklaam” või „koostöö” peab olema postituse alguses või pildil, mitte peidetud. Videos tuleb seda öelda ka suuliselt, sest paljud ei loe teksti üldse. Mõjuisikud ütlevad mulle sageli, et märgistus vähendab vaatamisi. See võib olla tõsi, aga see ei muuda reeglit.',
  'Kaire: Oletame, et koostöö on märgitud. Kas siis on kõik korras?',
  'Toomas: Ei ole. Märgistus on alles pool asja. Teine pool on väide ise. Kui kreem „noorendab nahka tõestatult”, peab olema ka tõend: uuring, mitte ühe inimese kogemus. Kui toidulisand „ravib väsimust”, on see juba ravimi väide ja selle kohta kehtivad veel rangemad nõuded.',
  'Kaire: Aga kogemus on ju lubatud?',
  'Toomas: Muidugi. „Mina kasutan seda kreemi ja mulle meeldib” on hinnang. „See kreem toimib kõigil” on väide, mis vajab tõendit. Kuulaja peaks need kaks lauset alati lahus hoidma. Esimene ütleb midagi inimese kohta, teine toote kohta.',
  'Kaire: Kas mõjuisik vastutab ka siis, kui firma kirjutas teksti tema eest?',
  'Toomas: Jah. Vastutavad mõlemad: firma, kes reklaami tellis, ja inimene, kes selle avaldas. Mõjuisik ei saa öelda, et ta ainult kopeeris teksti. Kui ta ei tea, kas väide on tõene, peab ta küsima tõendit enne, mitte pärast avaldamist. Mõistlik mõjuisik loeb lepingu läbi ja jätab kahtlase lause välja, isegi kui see tähendab väiksemat tasu.',
  'Kaire: Kuidas on lood soodustuskoodidega? Mulle tundub, et need on igal pool.',
  'Toomas: Kood on tugev märk, et postituse taga on leping. Mõjuisik saab sageli iga ostu pealt väikese osa. See ei tähenda, et soovitus oleks vale, aga lugeja peab teadma, et soovitajal on rahaline huvi. Kui kood on olemas, aga märget „reklaam” ei ole, võib tarbija sellest teatada järelevalveametile.',
  'Kaire: Kas jälgijad ise ka märkavad?',
  'Toomas: Üha rohkem. Noored eriti: nad kirjutavad kommentaari „kas see on reklaam?” juba siis, kui pilt on liiga ilus. Ja huvitav on see, et ausalt märgitud postitusi usaldatakse pikemas plaanis rohkem. Jälgija andestab reklaami, aga ei andesta valet.',
  'Kaire: Kas lastele suunatud reklaamil on eraldi reeglid?',
  'Toomas: On küll. Laps ei oska reklaami nii hästi ära tunda kui täiskasvanu. Seepärast ei tohi reklaam lapse kogemusetust ära kasutada ega teda otse ostma kutsuda. Vanematel tasub lapsega koos vaadata, keda ta jälgib, ja küsida: kuidas sa tead, et see ei ole reklaam?',
  'Kaire: Ja kui ma olen juba ostnud ja toode ei vasta lubadusele?',
  'Toomas: Siis on sul tarbijana samad õigused nagu iga teise ostu puhul. Pöördu kõigepealt müüja poole ja kirjelda, mida lubati ja mis tegelikult juhtus. Hoia alles kuvatõmmis postitusest, sest postitusi muudetakse vahel hiljem. Kui müüja ei vasta, saab abi tarbijavaidluste komisjonist.',
  'Kaire: Mida soovitad kuulajale, kes tahab homme targemini osta?',
  'Toomas: Küsi kolm küsimust. Kas postituse eest maksti? Kas väide on kontrollitav? Ja kas sama asja ütleb ka keegi, kes selle eest raha ei saa? Kui vastus kolmandale küsimusele on „ei”, oota üks päev, enne kui ostad.',
  'Kaire: Aitäh, Toomas!',
];

export const LESSONS = withPurposes(withShapes(withRetired({
  'b1b2-071': {
    title: 'Sama uudis, neli pealkirja: kas pealkiri ütleb tõtt?',
    phases: grammar('Kordamine: kindlasti, võib-olla · B2: tõenäoliselt, väidetavalt, kuuldavasti + tegusõna teisel kohal; hinnangusõnad taas, koguni, alles, ainult'),
    format: 'game',
    topic: 'town',
    canDo: 'Ma saan aru umbes 4-minutilisest raadiosaatest, kus toimetaja räägib ühe uudise neljast pealkirjast, kaitsen toimetuse koosolekul ausat pealkirja ja kirjutan toimetusele umbes 140-sõnalise kirja eksitava pealkirja kohta; kasutan kindluse ja hinnangu sõnu (tõenäoliselt, väidetavalt, taas, koguni).',
    teacherPage: {
      goal: 'Холодная задача письменно; радио о четырёх заголовках одной новости (Harno L4); слова уверенности и оценки, глагол вторым; летучка: защитить честный заголовок; дома письмо в редакцию 140 слов + медиадневник.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: холодная задача (5 мин) — обязательно; радио дважды, утверждения 1–6; станция 3 — правило и 10 пропусков, черновик 3 предложения; летучка без второй скрытой информации.',
      hook: '«Väide: uudisportaalid peaksid vastutama selle eest, et nende pealkirjad ei eksitaks lugejat.» Ученик пишет 5 минут, 5–7 предложений, без помощи. Это холодная задача модуля (письменно; модуль 14 мерил речь): не помогайте, не давайте фраз, не исправляйте; сохраните лист до 075. В уроке 075 ученик пишет параллельную задачу в тех же условиях (075_t_cold).',
      plan: [
        '0–5: станция 1 — холодная задача: 5 минут, 5–7 предложений; лист сохраните до 075',
        '5–27: станция 2 — 10 слов + 3 на повтор (2 мин), схема «насколько уверен заголовок» (читаем до прослушивания), стратегия: прочитать утверждения и предсказать (2 мин), радио дважды (9 мин), 10 утверждений «верно / неверно» (Harno L4), из них 3 на вывод',
        '27–47: станция 3 — kindlasti / võib-olla одной строкой (B1), B2: лестница уверенности, глагол вторым, слова-оценки; 10 пропусков, 8 честных заголовков; черновик письма в редакцию (10 мин), обратная связь — регистр',
        '47–67: станция 4 — летучка: ученик — дежурный редактор, вы — главный редактор со скрытой информацией',
        '67–75: выход: 30 секунд — почему мой заголовок честный; самооценка 0–1–2 + своё предложение; домашнее задание: письмо в редакцию 140 слов + медиадневник, голосовое 1 мин, Harjuta; три отмеченных предложения из предложения волости (069) — в «Minu vead»',
        'Kui aega jääb (75–90): дуэль заголовков — три скучные новости (столовая, библиотека, температура воды), у каждого честный и интересный заголовок, сравнить',
      ],
      sources: 'Радио «Meediatund» — учебный текст KeeleSepp (ведущая Piret и редактор Urmas вымышлены), без точной статистики (раньше: «59 % ссылок без клика» — убрано). Новость о билете (Rannalinn) и четыре заголовка — учебные. Общая основа: в Эстонии есть Пресс-совет (Pressinõukogu) и кодекс журналистской этики — исправление ошибки публикуется заметно; слова оценки и вопросительные заголовки — известные приёмы кликбейта.',
      groups: 'Холодная задача — каждый сам. Радио — каждый сам, утверждения на вывод сравнивают в паре. Черновик — каждый сам, партнёр читает по строке рубрики «Ülesande täitmine ja register». Станция 4 — пары: дежурный редактор и главный редактор с вашей карточкой, потом смена; в 1:1 главный редактор — вы.',
      errors: [
        '«Tõenäoliselt see on tõsi» → «Tõenäoliselt on see tõsi» (после наречия в начале — глагол вторым).',
        '«Väidetavalt turg suletakse suvel» → «Väidetavalt suletakse turg suvel».',
        '«Pilet kallineb 50 senti koguni» → «Pilet kallineb koguni 50 senti» (koguni стоит перед числом, которое оценивает).',
        '«Kuuldavasti» ≠ «kindlasti»: kuuldavasti = я слышал от других, сам не проверял.',
      ],
      notes: [
        'Летучка (v6 §2 d, roleplay): ученик не читает карточку вслух, а предлагает свой заголовок и спорит с вашими возражениями. Не спорьте о политике города: спорим о том, как сказано, а не о том, правильно ли подняли цену.',
        'Скрытая информация — в заметке под летучкой. Давайте её по одной, только после первого предложения ученика.',
        'Слова на повтор (pealkiri, kinnitama, faktikontroll из урока 58) звучат в радио: попросите ученика поднять руку, когда услышит.',
      ],
    },
    discover: [
      station(teach(tag(homeLines(B.writing('071_d_cold', 'Külm algus: arvamus viie minutiga.', 'Väide: „Uudisportaalid peaksid vastutama selle eest, et nende pealkirjad ei eksitaks lugejat.” Kirjuta 5 minutit, 5–7 lauset: seisukoht, põhjus, näide, vastuargument.', [5, 7]), 10), { task: 'W14' }),
        'Mooduli külm ülesanne (algtase), 5 minutit, kirjalikult (moodul 14 mõõtis rääkimist, moodul 15 mõõdab kirjutamist). Ära aita, ära anna fraase ega algust, ära paranda. Märgi üles: kas seisukoht on esimeses lauses, mitu põhjust, kas on näide, kas vastuargument tuleb, mitu sidendit (kuigi, seetõttu, samas …) ja 2–3 korduvat viga. Hoia leht alles: tunnis b1b2-075 kirjutab õppija paralleelse ülesande samades tingimustes (kontrolli kirjutamise 1. osa) ja te võrdlete.'), 1, 5),
      station(withReview(tag(B.vocab('071_d_vocab', 'Tunni sõnad.', ['hinnang — оценка', 'oletus — предположение', 'eksitama — вводить в заблуждение', 'toimetaja — редактор', 'toimetus — редакция', 'avaldama — публиковать', 'parandus — поправка (в новости)', 'usaldus — доверие', 'liialdama — преувеличивать', 'esile tõstma — выделять']), { topic: ['hinnang', 'oletus', 'toimetaja', 'toimetus', 'parandus', 'portaal', 'avaleht', 'faktikontroll', 'luksus'] }), ['pealkiri', 'kinnitama', 'faktikontroll']), 2, 22),
      teach(B.diagram('071_d_scheme', 'formula', { title: 'Skeem: kui kindel on pealkiri?', instruction: 'Loe skeem enne kuulamist läbi. Kuulates kirjuta igale reale üks pealkiri saatest. Viimasele reale kirjuta oma aus pealkiri.', nodes: 'Fakt allikaga: kindlasti, kelle sõnul | …\nHinnang: taas, koguni, alles, ainult | …\nOletus: võib-olla, küsimärk | …\nKinnitamata: väidetavalt, kuuldavasti | …\nMinu aus pealkiri: … | …' }, 'full', 'g_notice'),
        'Skeem on enne saadet ja on õppija pealkirjamängu kaart jaamas 4. Täidetud: fakt — „Bussipilet kallineb viiskümmend senti”, „Volikogu: bussid hakkavad õhtuti tihedamini käima” (tõsi, kuid jätab hinna välja); hinnang — „Linn tõstab taas hindu — pensionär maksab kinni!” (taas + vale fakt); oletus — „Kas buss muutub luksuseks?”; kinnitamata — toimetus kirjutab „väidetavalt”, kui väide ei ole kinnitatud.'),
      why(teach(tag(twiceInLesson(B.examListen('071_d_news', 'Kuulamine: raadiosaade „Meediatund”.', 'Loe väited läbi ja ennusta pliiatsiga. Kuula saadet kaks korda ja märgi, kas väide on õige või vale.', 'truefalse', RADIO_071, [
        ['Volikogu otsuse järgi hakkavad ka pensionärid bussisõidu eest maksma.', false],
        ['Kõik neli pealkirja rääkisid samast volikogu otsusest.', true],
        ['Toimetaja arvates on sõna „taas” pealkirjas hinnang, mitte fakt.', true],
        ['Toimetaja sõnul levib vihane pealkiri aeglasemalt kui rahulik.', false],
        ['Küsimärgiga pealkiri andis edasi kellegi teise väidet.', false],
        ['Neljas pealkiri oli tõene, kuid jättis osa uudisest välja.', true],
        ['Toimetaja järeldab, et päris erapooletut pealkirja ei olegi võimalik kirjutada.', true],
        ['Raamatukogu kohta avaldati parandus lehe lõpus väikese kirjaga.', false],
        ['Toimetaja arvates võib uudises hinnangut anda, kui see teeb pealkirja huvitavaks.', false],
        ['Toimetaja peab usaldust pikemas plaanis tähtsamaks kui kiirust.', true],
      ], 'g_listen')), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamine, umbes 22 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): õppija loeb väited, joonib võtmesõnad ja ennustab. Eksaminurk (Harno B2 kuulamine, osa 4): õige / vale. Väited 6, 7 ja 10 on järeldusväited: küsi, millisele lausele vastus toetub. Kordamise sõnad (pealkiri, kinnitama, faktikontroll) on saates.'), [
        'Vale: „Pensionärid ja õpilased sõidavad edasi tasuta.”',
        'Õige: „Neli portaali tegid sellest aga neli eri lugu.”',
        'Õige: „Sõna „taas” ei ole fakt, vaid hinnang.”',
        'Vale: „Vihane pealkiri levib kiiremini kui rahulik.”',
        'Vale: „see on oletus, mida keegi ei ole väitnud”.',
        'Õige (järeldus): „pealkiri valib ainult hea uudise ja jätab hinna välja”.',
        'Õige (järeldus): „Täiesti neutraalset pealkirja ei olegi olemas.”',
        'Vale: „avaldasime paranduse samas kohas, kus oli olnud vale uudis”.',
        'Vale: „Kui toimetus tahab hinnangut anda, kirjutagu ta arvamuslugu.”',
        'Õige (järeldus): „Kiirus on tähtis, aga usaldus on tähtsam.”',
      ]),
    ],
    practice: [
      station(teach(B.notice('071_p_notice', 'Märka: väidetavalt suletakse — koguni 50 senti', [
        'Saatest: „Kui väide ei ole kinnitatud, kirjutame „väidetavalt”.” · „Sõna „taas” ei ole fakt, vaid hinnang.” · „Kas buss muutub luksuseks?” on oletus.',
        'Kordamine (B1): kindlasti, võib-olla: Homme tuleb võib-olla lund.',
        'B2, kindluse redel: **kindlasti** (ma tean) → **tõenäoliselt** (peaaegu kindel) → **võib-olla** (ei tea) → **väidetavalt**, **kuuldavasti** (keegi teine ütleb, mina ei vastuta).',
        'B2, sõnajärg: kui see sõna on lause alguses, tuleb tegusõna kohe järel: Tõenäoliselt tuleb homme lund. · Väidetavalt kolib pood ära.',
        'B2, hinnangusõna teeb faktist arvamuse: **taas** (jälle — ja see on halb), **koguni** (üllatavalt palju), **alles** (liiga hilja), **ainult** (liiga vähe).',
        'Vene keeles „вероятно, магазин закроют” — eesti keeles tegusõna kohe teisel kohal: Tõenäoliselt suletakse pood.',
      ], 'full'), 'Kordamine ühe minutiga (kindlasti, võib-olla). Siis B2 samm: kindluse redel, tegusõna teisel kohal ja hinnangusõnad. Küsi iga näite juures: „Kui kindel see on — 100, 70, 50 protsenti või kellegi teise jutt?” L1 rida: vene keeles sõnajärg on vaba, eesti keeles tuleb tegusõna kohe teisena.'), 3, 20),
      why(teach(tag(B.gaps('071_p_forms', 'Uudisnupud raadiole.', 'Kui kindel on väide või milline on hinnang? Kirjuta lünka üks sõna. Sulgudes on tähendus. Panka ei ole.', [
        'Volikogu otsus on tehtud: pilet kallineb märtsist [kindlasti|kahtlemata]. (sa tead seda)',
        'Sünoptiku sõnul tuleb nädalavahetusel [tõenäoliselt|ilmselt|arvatavasti] lund. (peaaegu kindel)',
        'Perearst võtab [võib-olla] ka laupäeviti vastu, kuid otsust veel ei ole. (ei tea)',
        '[Väidetavalt|Kuuldavasti] suletakse turg juba suvel, kuid linn seda ei kinnita. (keegi teine ütleb)',
        '[Kuuldavasti|Väidetavalt] avatakse poe kõrval uus kohvik — nii rääkis naaber. (kuulsid teistelt)',
        'Linn tõstab [taas] hindu! (hinnang: see juhtub mitmendat korda)',
        'Pilet kallineb [koguni] viiskümmend senti. (hinnang: üllatavalt palju)',
        'Vald paigaldab tänavavalgustuse [alles] pärast teist õnnetust. (hinnang: liiga hilja)',
        'Uude bussi mahub [ainult] kakskümmend reisijat. (hinnang: liiga vähe)',
        '[Tõenäoliselt|Ilmselt] vastab vallavalitsus ettepanekule kuu aja jooksul. (peaaegu kindel)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kui kindel see on ja kes seda ütleb?” Read 1–3 ja 10: kindluse redel. Read 4–5: kellegi teise jutt (väidetavalt, kuuldavasti). Read 6–9: hinnangusõnad. Kontrolli sõnajärge: pärast algussõna tuleb tegusõna kohe (suletakse, avatakse, vastab).'), [
        'Otsus on tehtud: kindlasti.',
        'Peaaegu kindel: tõenäoliselt.',
        'Ei tea: võib-olla.',
        'Kinnitamata: väidetavalt (tegusõna kohe järel: suletakse).',
        'Kuuldud teistelt: kuuldavasti.',
        'Mitmendat korda ja halb: taas.',
        'Üllatavalt palju: koguni (arvu ees).',
        'Liiga hilja: alles.',
        'Liiga vähe: ainult.',
        'Peaaegu kindel: tõenäoliselt (tegusõna kohe järel: vastab).',
      ]),
      why(teach(tag(B.transformation('071_p_sure', 'Tee pealkiri ausaks.', 'Kirjuta pealkiri ümber nii, et see on aus: jäta hinnang välja või ütle, kelle väide see on. Alusta antud sõnadega.', [
        ['Linn tõstab taas hindu — pensionär maksab kinni!', 'Bussipilet …', 'Bussipilet kallineb viiskümmend senti.|Bussipilet kallineb märtsist viiskümmend senti.|Bussipilet kallineb märtsist 50 senti.'],
        ['Keskturg suletakse juba suvel! (linn ei kinnita)', 'Postituse järgi …', 'Postituse järgi suletakse keskturg juba suvel.|Postituse järgi suletakse keskturg suvel.|Postituse järgi suletakse turg juba suvel.'],
        ['Alles nüüd avab vald arstikeskuse laupäeval!', 'Vald …', 'Vald avab arstikeskuse ka laupäeval.|Vald avab arstikeskuse laupäeviti.|Vald avab arstikeskuse katseks laupäeviti.'],
        ['Lumi halvab kogu Lõuna-Eesti!', 'Sünoptik: …', 'Sünoptik: Lõuna-Eestisse võib tulla palju lund.|Sünoptik: Lõuna-Eestis võib sadada palju lund.|Sünoptik: Lõuna-Eestisse tuleb tõenäoliselt palju lund.'],
        ['Raamatukogu suletakse!', 'Raamatukogu …', 'Raamatukogu kolib kultuurimajja.|Raamatukogu on kaks nädalat suletud.|Raamatukogu kolib ja on kaks nädalat suletud.'],
        ['Kas vald unustas eakad? (vald avas uue päevakeskuse)', 'Vald …', 'Vald avas eakatele uue päevakeskuse.|Vald avas eakatele päevakeskuse.|Vald avas uue päevakeskuse.'],
        ['Koguni sada uut kodanikku! (sel aastal sai kodakondsuse sada inimest)', 'Sel aastal …', 'Sel aastal sai kodakondsuse sada inimest.|Sel aastal sai Eesti kodakondsuse sada inimest.|Sel aastal said kodakondsuse sada inimest.'],
        ['Vabatahtlikud päästavad taas küla! (vabatahtlikud kustutasid tulekahju)', 'Vabatahtlikud …', 'Vabatahtlikud kustutasid külas tulekahju.|Vabatahtlikud päästjad kustutasid külas tulekahju.|Vabatahtlikud kustutasid tulekahju.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Pärast iga rida küsi: „Mis oli pealkirjas hinnang ja mis oli vale?” Read 1, 3, 7, 8: hinnangusõna välja (taas, alles, koguni). Read 2 ja 4: ütle, kelle väide see on (postituse järgi, sünoptik). Read 5–6: küsimus või hirm asendub faktiga. Read 6–8 kordavad moodulit 14 (päevakeskus, kodakondsus, vabatahtlikud).'), [
        '„taas” ja vale fakt välja: bussipilet kallineb.',
        'Kinnitamata väide: ütle allikas (postituse järgi).',
        '„alles” välja: vald avab arstikeskuse ka laupäeval.',
        'Liialdus välja, allikas ette: sünoptik.',
        'Fakt: raamatukogu kolib.',
        'Küsimus → fakt: vald avas päevakeskuse.',
        '„koguni” välja: sada inimest sai kodakondsuse.',
        '„taas” välja: vabatahtlikud kustutasid tulekahju.',
      ]),
      draft('071_p_draft', 'kirja esimene lõik', 'Kirjuta toimetusele vähemalt 6 lauset: milline pealkiri sind eksitas, mis selles on hinnang või vale ja mida sa palud?', 'Ülesande täitmine ja register (viisakas, konkreetne)'),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('071_t_meeting', 'Toimetuse koosolek: milline pealkiri läheb avalehele? (12–15 minutit)', 'Sa oled valvetoimetaja. Kirjuta bussiuudisele aus ja huvitav pealkiri (kuni 10 sõna). Kaitse seda peatoimetaja ees ja leppige kokku.',
        'Kaart A — valvetoimetaja (sina):\nuudis: pilet kallineb märtsist 50 senti, pensionärid ja õpilased sõidavad edasi tasuta, õhtuti käib buss tihedamini · peatoimetaja tahab pealkirja „Linn tõstab taas hindu — pensionär maksab kinni!” · lugu läheb avalehele kümne minuti pärast\nAbikaart: Minu pealkiri on … · See pealkiri eksitab, sest … · Tõenäoliselt klikitakse ka siis, kui …\nLisaväljakutse: paku kaks pealkirja — üks lühike ja üks arvuga — ning ütle, kumb on ausam.',
        'Peatoimetaja kaart on õpetajal: kolm vastuväidet ja üks uus info.',
        [], []), 'roleplay',
      ['Minu pealkiri on …', 'See pealkiri eksitab, sest …', 'Tõenäoliselt klikitakse ka siis, kui …'],
      'Paku kaks pealkirja — üks lühike ja üks arvuga — ning ütle, kumb on ausam.', { task: 'S16', fluency: true }),
      'Toimetuse koosolek (v6 §2 d, roleplay). Sina oled peatoimetaja. Vastuväited ükshaaval: 1) „Igav! Keegi ei kliki bussipileti peale.” 2) „Aga hinnad ju tõusevad — „taas” on tõsi!” 3) „Konkurendil on juba hullem pealkiri.” Varjatud info (ütle pärast õppija esimest pakkumist): 1) „Linn saatis just teate: uued elektribussid tulevad alles sügisel, mitte märtsis.” (Õppija peab pealkirja muutma: ei tohi lubada tihedamat graafikut märtsist.) 2) „Üks lugeja kirjutas, et eelmine kord kirjutasime pensionäridest valesti.” (Õppija peab soovitama parandust.) Õnnestunud, kui õppija räägib 2 minutit, nimetab peatoimetaja pealkirjas kaks viga (vale fakt, hinnangusõna), kasutab kahte kindluse sõna, reageerib uuele infole ja te lepite kokku ühe ausa pealkirja (näiteks „Bussipilet kallineb 50 senti, sügisest tulevad elektribussid”). Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'present' }),
      exitTalk('071_t_say', 'Ütle 30 sekundiga peatoimetajale, miks sinu pealkiri on aus ja siiski huvitav.', ['Mis on sinu pealkiri?', 'Miks see ei eksita lugejat?'], 'Kas õppija ütleb pealkirja ja põhjuse ning kasutab vähemalt üht kindluse või hinnangu sõna õigesti (tõenäoliselt, väidetavalt, taas, koguni) ja tegusõna teisel kohal?'),
      keepPlace(selfCheck('071_t_self', ['Sain raadiosaatest aru ja järeldasin, mida toimetaja peab tähtsaks.', 'Kasutasin kindluse ja hinnangu sõnu (tõenäoliselt, väidetavalt, taas, koguni) ja tegusõna teisel kohal.', 'Kaitsesin koosolekul ausat pealkirja ja reageerisin uuele infole.'], 'Pealkiri kaitstud', 'Ma oskan eristada pealkirjas fakti, hinnangut ja oletust')),
      tag(homeTask(homeLines(mediaLog(B.examWriting('071_t_mail', 'Kodus: kiri toimetusele (umbes 140 sõna).', `Lõpeta tunni mustand kirjaks (130–150 sõna) ja täida meediapäevik. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Kirjuta portaali toimetusele pealkirjast, mis sind eksitas (päris või väljamõeldud). Minu eesti keele võrgustik (meediapäevik): vali üks eestikeelne uudisteportaal või saade, näiteks ERR, https://www.err.ee. Kirjuta kirja alla kolm rida: mida lugesid, üks uus sõna ja üks pealkiri, mis oli aus. Moodul 14: kirjuta oma ettepaneku vallale (tund 69) kolm õpetaja märgitud lauset parandatult Harjutas „Minu vead” alla.',
        points: ['milline pealkiri ja millise uudise kohta', 'mis selles on hinnang, oletus või vale', 'kuidas see lugejat eksitab (üks näide)', 'palve: parandada pealkiri ja üks aus ettepanek'],
        words: [130, 150],
      })), 6)), { task: 'W13' }),
      writingRubric('071_t_rubric', 'Hindamisjuhend: kiri toimetusele (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Teie pealkiri on vale. Pensionärid ei maksa. Tõenäoliselt te tahate klikke. Muutke kohe! See on häbi.” Hinnang: ülesanne 2 (pealkiri ja viga on olemas, kuid näide ja aus ettepanek puuduvad), ülesehitus 2 (järjekord on selge, sidendeid ei ole), sõnavara 2 (puuduvad hinnang, eksitama, parandus), grammatika 2 (vead ei takista mõistmist, kuid laused on väga lihtsad); toon („Muutke kohe!”, „See on häbi”) on toimetusele liiga käskiv. Kui õppija lisab näite, viisaka palve (palun kaaluge …) ja ausa pealkirja, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-072': {
    title: 'Kommentaarium: sõnavabadus või sõimuväljak?',
    phases: grammar('Kordamine: autor ütles, et … · B2: autori sõnul / arvates; autor leiab, rõhutab, möönab, kahtleb; kaudne kõneviis olevat, toovat, ei muutvat'),
    format: 'debate',
    topic: 'culture',
    canDo: 'Ma loen umbes 500-sõnalist arvamuslugu kommentaariumi kohta, leian autori seisukoha ja eesmärgi, annan raadiointervjuus autori mõtte edasi ja ütlen eraldi oma seisukoha ning kirjutan portaalile umbes 180-sõnalise arvamuse; kasutan autori mõtte edasiandmise vorme (autori sõnul, autor möönab, olevat).',
    teacherPage: {
      goal: 'Колонка о комментариях (≈ 500 слов, Harno R1, 3 вопроса на вывод); передать мысль автора (sõnul, möönab, -vat); радиоинтервью: ученик — представитель читателей; дома мнение 180 слов, однокурсник отвечает.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); колонка — абзацы A–E и вопросы 1–6; станция 3 — правило и 10 пропусков, черновик 3 предложения; интервью — три вопроса без скрытой информации.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в письме в редакцию (071), и одной строкой говорит, что изменил. Вопрос, если есть время: «Ты читаешь комментарии под новостями? Почему?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (71)',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: прочитать заголовок и последний абзац — где позиция автора? (1 мин), колонка (5 мин), 8 вопросов с выбором (Harno R1), из них 3 на вывод (12 мин), сверка в паре (5 мин)',
        '30–50: станция 3 — «ta ütles, et» одной строкой (B1), B2: autori sõnul / arvates, глаголы позиции, -vat; 10 пропусков, 8 пересказов; черновик мнения (10 мин), обратная связь — построение (мысль автора и моя отдельно)',
        '50–68: станция 4 — радиоинтервью: вы — ведущий, ученик — представитель читателей; новая информация в середине',
        '68–75: выход: 30 секунд — мысль автора и моя позиция отдельно; самооценка; домашнее задание: мнение 180 слов, однокурсник отвечает, голосовое, Harjuta',
        'Kui aega jääb (75–90): совет читателей — голосование «закрыть комментарии под новостями: да / нет / только под чувствительными» в начале и в конце',
      ],
      sources: 'Колонка «Kommentaarium on elutuba, mitte väljak» — учебный текст KeeleSepp (автор — библиотекарь, вымышлен). Факт: Европейский суд по правам человека, Delfi AS v. Estonia (2015): портал может отвечать за оскорбительные анонимные комментарии (сумма компенсации в тексте не называется). Конституция ЭР защищает честь и доброе имя. Радиоинтервью — учебное.',
      groups: 'Колонку и вопросы — каждый сам, вопросы на вывод сравнивают в паре. Черновик — каждый сам. Станция 4 — пары: ведущий с вашими вопросами и представитель читателей, потом смена; в 1:1 ведущий — вы.',
      errors: [
        '«Autori sõnul ta leiab, et …» → «Autori sõnul …» или «Autor leiab, et …» (не два источника в одной фразе).',
        '«Autor möönab, et kommentaarium on halb» — möönma = частично признать правоту другой стороны; если автор просто критикует — leiab / kritiseerib.',
        '«Kommenteerija sõnul nimega kirjutamine olevat ohtlik» → «… olevat nimega kirjutamine ohtlik» (после kommenteerija sõnul глагол вторым).',
        '«ei oleva» → «ei olevat» (отрицание: ei + -vat).',
      ],
      notes: [
        'Интервью (v6 §2 d, interview): ученик говорит по 30–60 секунд на вопрос, вы перебиваете один раз. Спорим о правилах, не о людях. Никто не обязан рассказывать, что он сам писал в интернете.',
        'Слова на повтор (seisukoht из урока 60, vastutama из 66, usaldusväärne из 57) есть в тексте и вопросах: попросите ученика найти их.',
      ],
    },
    discover: [
      station(half(revision('072_d_revise', 'b1b2-071', 'Kirjuta ümber kolm lauset, mille õpetaja sinu kirjas toimetusele märkis. Lisa üks rida: mida sa muutsid ja miks?')), 1, 5),
      station(half(withReview(tag(B.vocab('072_d_vocab', 'Tunni sõnad.', ['arvamuslugu — авторская колонка', 'toon — тон', 'eesmärk — цель', 'kommentaar — комментарий', 'sõnavabadus — свобода слова', 'solvang — оскорбление', 'möönma — признавать (частично)', 'rõhutama — подчёркивать', 'veenma — убеждать', 'moderaator — модератор']), { topic: ['arvamuslugu', 'kommentaar', 'kommentaarium', 'sõnavabadus', 'solvang', 'moderaator', 'tsensuur', 'varjunimi', 'turuplats'] }), ['seisukoht', 'vastutama', 'usaldusväärne'])), 2, 25),
      teach(tag(B.reading('072_d_text', 'Loe arvamuslugu.', 'Loe kõigepealt pealkiri ja viimane lõik: kus on autori seisukoht? Siis loe tervikuna ja vasta all olevatele küsimustele.', 'Kommentaarium on elutuba, mitte väljak', [
        '(A) Töötan raamatukogus ja juhin lugemisringi, nii et loen palju — ka seda, mida inimesed uudiste alla kirjutavad. Osa kommentaare on targad: lugeja parandab ajakirjaniku viga, lisab oma kogemuse või küsib asja, mida loos ei olnud. Suur osa on aga midagi muud: solvangud, pooltõed ja samade inimeste lõputu vaidlus. Kui ma ühe uudise all kommentaare loen, tunnen end sageli nagu turuplatsil, kus võidab kõige valjem hääl.',
        '(B) Kõige rohkem kurvastab mind see, et targad lugejad jäävad vait. Nad loevad, raputavad pead ja lahkuvad. Raamatukogu lugemisringis on vastupidi: inimesed vaidlevad tihti teravalt, kuid keegi ei sõima teist, sest kõik istuvad ühe laua taga ja teavad üksteise nimesid. Arvan, et just selles on vahe. Mõni lugeja on mulle hiljem öelnud, et tal oli kommentaariumi jaoks hea mõte, kuid ta ei julgenud seda kirjutada, sest kartis, et teda naeruvääristatakse. Nii kaotab arutelu just need hääled, mida kõige rohkem vaja oleks.',
        '(C) Kommentaarium ei ole siiski ainult lugejate asi. Euroopa Inimõiguste Kohus otsustas 2015. aastal Eestit puudutavas kohtuasjas, et uudisportaal võib vastutada ka anonüümsete lugejate solvavate kommentaaride eest, kui ta neid kiiresti ei eemalda. Kahjutasu oli väike, aga põhimõte suur: kes kommentaariumi avab, peab selle eest ka hoolitsema. Paljud portaalid muutsid pärast seda oma reegleid ja hakkasid kommentaare hoolikamalt jälgima.',
        '(D) Mõned ütlevad, et kommentaaride piiramine oleks tsensuur. Ma mõistan seda hirmu. Sõnavabadus on demokraatia alus ja kommentaar on sageli ainus koht, kus tavaline inimene saab avalikult vastu vaielda — näiteks volikogu otsusele või vallavalitsuse kavale. Kuid sõnavabadus ei tähenda õigust teist inimest sõimata. Ka põhiseadus kaitseb iga inimese au ja head nime. Inimene, keda avalikult sõimatakse, ei ole sõnavabaduse kasutaja, vaid selle ohver.',
        '(E) Minu ettepanek on lihtne. Kommentaarium jäägu alles, kuid olgu see pigem elutuba kui väljak: kommenteerida saab oma nimega, kommentaarid loeb enne avaldamist läbi moderaator ning õnnetuste ja haiguste uudiste all kommentaare ei avata. Ma möönan, et see maksab portaalile raha ja aeglustab arutelu. Kuid parem on kümme mõtestatud kommentaari kui tuhat karjumist.',
        '(F) Kas nimega kirjutamine hirmutab ausad inimesed eemale? Mõnikord kindlasti. Töötaja, kes kritiseerib oma tööandjat, võib vajada kaitset. Selliseks juhuks võiks portaal lubada kirjutada varjunime all, kui toimetus teab kirjutaja tegelikku nime. Ka sotsiaaltöötaja või õpetaja, kelle tööst uudises räägitakse, peaks saama vastata ilma, et teda kohe rünnataks.',
        '(G) Hea kommentaarium on lugejate kogukond, mitte rahvahulk. Lugeja, kes kirjutab oma nimega, mõtleb enne, kui vajutab nuppu „Saada”. Ja kui ta kirjutab teravalt, kuid ausalt, on see just see arutelu, mida demokraatia vajab. Ka toimetus võidab: kui kommentaarid on viisakad, julgevad lugejad rohkem kaasa rääkida ja portaal saab teada, mida inimesed tegelikult arvavad.',
        'Allikas: KeeleSepp õppetekst (autori arvamus).',
      ].join('\n\n'), []), { task: 'R13', voice: 'article' }),
        'Lugemine, umbes 25 minutit koos sõnade ja küsimustega. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): seekord „silmitse” — pealkiri ja viimane lõik ütlevad autori seisukoha enne kogu teksti. Kordamise sõnad (seisukoht, vastutama, usaldusväärne) on tekstis ja küsimustes. Tekst on õppetekst (umbes 470 sõna) ilma täpse statistikata.'),
      why(teach(tag(B.choice('072_d_pos', 'Eksaminurk: autori seisukoht ja eesmärk.', 'Vali iga küsimuse juurde arvamusloo põhjal üks õige vastus neljast. Küsimustele 2, 5 ja 8 järelda.', [
        ['Mida ütleb autor lõigus A kommentaaride kohta?', 'osa on kasulikud, kuid paljud solvavad või vaidlevad lõputult', 'kõik kommentaarid on kasutud', 'kommentaare kirjutavad peamiselt ajakirjanikud', 'kommentaare loeb väga vähe inimesi'],
        ['Miks toob autor lõigus B näiteks raamatukogu lugemisringi? Järelda.', 'et näidata, et nimi ja ühine laud muudavad vaidluse viisakamaks', 'et kutsuda lugejaid raamatukokku', 'et näidata, et raamatukogus ei vaielda üldse', 'et kritiseerida oma töökohta'],
        ['Mida otsustas kohus lõigu C järgi?', 'portaal võib vastutada ka anonüümsete solvavate kommentaaride eest', 'portaal peab kõik kommentaarid sulgema', 'anonüümne kommenteerimine on keelatud', 'portaal ei vastuta kunagi lugejate sõnade eest'],
        ['Millega on autor lõigus D nende inimestega, kes kardavad tsensuuri, osaliselt nõus?', 'sõnavabadus on tähtis ja kommentaar on sageli inimese hääl', 'kommentaaride piiramine on alati tsensuur', 'põhiseadus ei kaitse au ja head nime', 'solvang on samuti sõnavabadus'],
        ['Mida tahab autor öelda võrdlusega „elutuba, mitte väljak”? Järelda.', 'arutelu olgu rahulikum ja igaüks vastutagu oma sõnade eest', 'kommentaare tuleks kirjutada ainult kodus', 'kommentaariumis peaks olema rohkem inimesi', 'kommentaarium tuleks viia raamatukokku'],
        ['Millist puudust oma ettepanekus autor ise möönab?', 'see maksab portaalile raha ja aeglustab arutelu', 'portaal kaotab kõik lugejad', 'riik peab hakkama kommentaare kontrollima', 'lugejad ei saa enam üldse kommenteerida'],
        ['Kuidas aitaks autor lõigu F järgi töötajat, kes kardab oma nimega kirjutada?', 'ta võiks kirjutada varjunime all, kui toimetus teab tema nime', 'ta ei tohiks üldse kommenteerida', 'ta peaks kirjutama otse tööandjale', 'ta võiks kirjutada ilma igasuguste reegliteta'],
        ['Mis on arvamusloo peamine eesmärk? Järelda.', 'veenda lugejaid ja portaale kommentaariumi korda muutma', 'teatada lugejatele uuest seadusest', 'reklaamida üht usaldusväärset portaali', 'kirjeldada kohtuasja kõiki üksikasju'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      'Eksaminurk (Harno B2 lugemine, osa 1): kaheksa küsimust, neli valikut (eksamil seitse küsimust). Küsimused 2, 5 ja 8 on järeldusküsimused: nõua lauset, millele vastus toetub. Seisukoha sõna on küsimustes (seisukoht = kordamise sõna).'), [
        '(A): „Osa kommentaare on targad … Suur osa on aga … solvangud, pooltõed ja … lõputu vaidlus.”',
        'Järeldus (B): „keegi ei sõima teist, sest kõik istuvad ühe laua taga ja teavad üksteise nimesid”.',
        '(C): „uudisportaal võib vastutada ka anonüümsete lugejate solvavate kommentaaride eest”.',
        '(D): „Ma mõistan seda hirmu. Sõnavabadus on demokraatia alus …”',
        'Järeldus (E, G): elutoas räägitakse rahulikult ja nimega; „Lugeja, kes kirjutab oma nimega, mõtleb enne …”',
        '(E): „Ma möönan, et see maksab portaalile raha ja aeglustab arutelu.”',
        '(F): „võiks portaal lubada kirjutada varjunime all, kui toimetus teab kirjutaja tegelikku nime”.',
        'Järeldus (E–G): autor teeb ettepaneku ja veenab — „Minu ettepanek on lihtne.”',
      ]),
    ],
    practice: [
      station(teach(B.notice('072_p_notice', 'Märka: autori sõnul — see olevat tsensuur', [
        'Arvamusloost: „Mõned ütlevad, et piiramine oleks tsensuur.” · „Ma mõistan seda hirmu.” · „Ma möönan, et see maksab raha.”',
        'Kordamine (B1): ta ütles, et …: Autor ütles, et kommentaarium on turuplats.',
        'B2, kelle mõte?: **autori sõnul** / **autori arvates** + tegusõna teisel kohal: Autori arvates on kommentaarium turuplats.',
        'B2, tegusõna näitab hoiakut: autor **leiab** (arvab), **rõhutab** (peab väga tähtsaks), **möönab** (tunnistab osaliselt vastase õigust), **kahtleb** (ei ole kindel).',
        'B2, kaudne kõneviis = see on kellegi teise jutt: olema → **olevat**, tooma → **toovat**, muutma → **muutvat** · eitus: **ei olevat**.',
        'Vene keeles „якобы это цензура” — eesti keeles üks tegusõna vorm: See olevat tsensuur.',
      ], 'full'), 'Kordamine ühe minutiga (ta ütles, et …). Siis B2 samm: kelle mõte (autori sõnul), mis hoiak (leiab, rõhutab, möönab) ja kaudne kõneviis -vat. Küsi iga näite juures: „Kas sina oled sellega nõus?” L1 rida: vene „якобы” = eesti -vat.'), 3, 20),
      why(teach(tag(B.gaps('072_p_forms', 'Kes mida ütleb?', 'Kirjuta lünka üks või kaks sõna. Sulgudes on tegusõna algvorm või tähendus. Panka ei ole.', [
        'Autori [arvates|sõnul] peaks kommentaarium jääma alles. (kelle mõte?)',
        'Autor [möönab], et moderaator maksab portaalile raha. (osaliselt nõus vastasega)',
        'Autor [rõhutab], et kes kommentaariumi avab, peab selle eest hoolitsema. (peab väga tähtsaks)',
        'Autor [leiab|arvab], et kümme head kommentaari on parem kui tuhat karjumist. (tema arvamus)',
        'Lugeja [kahtleb], kas moderaator jõuab kõik kommentaarid läbi lugeda. (ei ole kindel)',
        'Kommenteerija sõnul [olevat] nimega kirjutamine ohtlik — mina seda ei usu. (olema)',
        'Kommentaarid [toovat] portaalile palju lugejaid, väidab toimetus. (tooma)',
        'Sulgemine [ei olevat] tsensuur, kirjutab üks lugeja. (olema, eitus)',
        'Lugeja väitel [muutvat] kommentaarid volikogu otsuseid. (muutma)',
        'Toimetuse [sõnul|väitel] loeb moderaator kommentaare iga päev. (kelle mõte?)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kelle mõte see on ja kas sina oled nõus?” Read 1 ja 10: sõnul / arvates + tegusõna teisel kohal. Read 2–5: hoiaku tegusõna. Read 6–9: -vat (olema → olevat, tooma → toovat, muutma → muutvat; eitus ei olevat).'), [
        'Kelle mõte: autori arvates (tegusõna kohe järel: peaks).',
        'Osaliselt nõus: möönab.',
        'Väga tähtis: rõhutab.',
        'Arvamus: leiab.',
        'Ei ole kindel: kahtleb, kas …',
        'Kellegi teise jutt: olevat.',
        'tooma → toovat.',
        'Eitus: ei olevat.',
        'muutma → muutvat.',
        'Kelle mõte: toimetuse sõnul (tegusõna kohe järel: loeb).',
      ]),
      why(teach(tag(B.transformation('072_p_report', 'Anna mõte edasi.', 'Kirjuta lause ümber nii, et on selge: see on autori või kellegi teise mõte, mitte sinu oma. Alusta antud sõnadega.', [
        ['Autor: „Iga kommentaari peaks enne avaldamist lugema moderaator.”', 'Autori arvates …', 'Autori arvates peaks iga kommentaari enne avaldamist lugema moderaator.|Autori arvates peaks moderaator iga kommentaari enne avaldamist läbi lugema.|Autori arvates peaks moderaator lugema iga kommentaari enne avaldamist.'],
        ['Autor: „Jah, sõnavabadus on demokraatia alus.” (Ta tunnistab vastaste õigust.)', 'Autor …', 'Autor möönab, et sõnavabadus on demokraatia alus.|Autor tunnistab, et sõnavabadus on demokraatia alus.|Autor nõustub, et sõnavabadus on demokraatia alus.'],
        ['Autor: „Tähtis on see, et portaal hoolitseb oma kommentaariumi eest.”', 'Autor …', 'Autor rõhutab, et portaal peab oma kommentaariumi eest hoolitsema.|Autor rõhutab, et portaal hoolitseb oma kommentaariumi eest.|Autor rõhutab, et portaal peaks kommentaariumi eest hoolitsema.'],
        ['Kommenteerija: „Nimega kommenteerimine on ohtlik.” (Sa ei ole nõus.)', 'Kommenteerija sõnul …', 'Kommenteerija sõnul olevat nimega kommenteerimine ohtlik.|Kommenteerija sõnul on nimega kommenteerimine ohtlik.|Kommenteerija sõnul olevat kommenteerimine nimega ohtlik.'],
        ['Lugeja: „Kommentaarid ei muuda midagi.” (Ära kasuta tegusõna „ütleb”.)', 'Kommentaarid …', 'Kommentaarid ei muutvat midagi.|Kommentaarid ei muutvat lugeja sõnul midagi.|Kommentaarid lugeja sõnul ei muutvat midagi.'],
        ['Lugeja: „Ma ei ole kindel, et moderaator suudab kõik kommentaarid läbi lugeda.”', 'Lugeja kahtleb, kas …', 'Lugeja kahtleb, kas moderaator suudab kõik kommentaarid läbi lugeda.|Lugeja kahtleb, kas moderaator jõuab kõik kommentaarid läbi lugeda.|Lugeja kahtleb, kas moderaator suudab kõiki kommentaare läbi lugeda.'],
        ['Toimetus: „Kommentaarium toob meile lugejaid.” (Sa ei ole kontrollinud.)', 'Toimetuse sõnul …', 'Toimetuse sõnul toovat kommentaarium neile lugejaid.|Toimetuse sõnul toob kommentaarium neile lugejaid.|Toimetuse sõnul toovat kommentaarium portaalile lugejaid.'],
        ['Volikogu liige: „Kommentaarides on palju valeinfot.” (Sa ei ole kontrollinud.)', 'Volikogu liikme väitel …', 'Volikogu liikme väitel olevat kommentaarides palju valeinfot.|Volikogu liikme väitel on kommentaarides palju valeinfot.|Volikogu liikme väitel leiduvat kommentaarides palju valeinfot.'],
      ], 'full', 'g_notice'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kas -vat näitab siin sinu kahtlust?” Read 4, 5, 7, 8: -vat (olevat, muutvat, toovat). Rida 2: möönab, mitte rõhutab — autor tunnistab vastaste õigust. Pärast „… sõnul / väitel” tuleb tegusõna kohe. Rida 8 kordab moodulit 14 (volikogu).'), [
        'autori arvates + tegusõna teisel kohal: peaks.',
        'Tunnistab vastaste õigust: möönab.',
        'Tähtis mõte: rõhutab.',
        'Sa ei ole nõus: olevat.',
        'Ilma „ütleb”-ta: ei muutvat.',
        'Ei ole kindel: kahtleb, kas …',
        'Kontrollimata: toovat.',
        'Kontrollimata: olevat.',
      ]),
      draft('072_p_draft', 'arvamuse esimene lõik', 'Kirjuta vähemalt 6 lauset: autori mõte kahe lausega (autori sõnul, autor möönab), siis sinu seisukoht ja põhjus.', 'Ülesehitus ja sidusus (autori mõte ja minu mõte lahus)'),
    ],
    transfer: [
      station(teach(mainTask(inLesson(B.speaking('072_t_studio', 'Raadiointervjuu: lugejate esindaja eetris (12–15 minutit).', 'Saatejuht küsitleb sind kui lugejate esindajat. Anna edasi autori mõte, ütle oma seisukoht ja vasta küsimustele.', [
        'Mida arvamusloo autor tegelikult tahab?',
        'Millega oled nõus ja millega mitte?',
        'Kas sina kirjutaksid kommentaari oma nimega? Miks?',
        'Mida soovitad portaalile, et kommentaarium oleks usaldusväärne?',
      ], [120, 180])), 'interview',
      ['Autori sõnul …, aga mina leian, et …', 'Ma möönan, et …, kuid …', 'Kommenteerijate väitel olevat …'],
      'Vasta ka saatejuhi vastuväitele: „Kas moderaator ei ole lihtsalt tsensor?”', { task: 'S14', fluency: true }),
      'Raadiointervjuu (v6 §2 d, interview). Sina oled saatejuht; õppija vastab igale küsimusele 30–60 sekundit. Varjatud info (ütle kolmanda küsimuse järel): 1) „Eile kirjutas üks lugeja oma nimega kriitilise kommentaari ja sai seejärel tööandjalt noomituse.” (Õppija peab oma seisukohta täpsustama — näiteks varjunimi, mida toimetus teab.) 2) „Portaal kaalub kommentaariumi sulgemist pühade ajaks, sest moderaatorid on puhkusel.” (Õppija ütleb, kas see on tsensuur või hoolivus.) Õnnestunud, kui õppija annab autori mõtte edasi (autori sõnul, möönab), hoiab oma seisukoha eraldi, kasutab vähemalt korra -vat-vormi ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 18, { final: 'decide' }),
      exitTalk('072_t_say', 'Anna 30 sekundiga edasi arvamusloo autori peamine mõte ja ütle eraldi oma seisukoht.', ['Mida autor arvab?', 'Mida arvad sina ja miks?'], 'Kas õppija hoiab autori mõtte ja oma mõtte lahus (autori sõnul … — mina leian …) ja kasutab vähemalt üht hoiaku tegusõna (rõhutab, möönab)?'),
      keepPlace(selfCheck('072_t_self', ['Leidsin arvamusloost autori seisukoha ja järeldasin tema eesmärgi.', 'Andsin autori mõtte edasi (autori sõnul, autor möönab, olevat).', 'Ütlesin intervjuus oma seisukoha eraldi ja reageerisin uuele infole.'], 'Intervjuu antud', 'Ma oskan autori mõtte ja oma mõtte lahus hoida')),
      tag(homeTask(homeLines(peerReply(B.examWriting('072_t_reply', 'Kodus: arvamus kommentaariumi kohta (umbes 180 sõna).', `Lõpeta tunni mustand arvamuseks (170–190 sõna). Algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'arvamus', {
        situation: 'Portaal kogub lugejate arvamusi küsimusele „Kas kommenteerida tohiks ainult oma nimega?”. Kirjuta oma arvamus. Saada see ka ühele kursusekaaslasele: ta vastab nagu hea kommentaator — üks argument sinu poolt, üks vastu ja üks küsimus.',
        points: ['autori seisukoht kahe lausega (autori sõnul, autor möönab)', 'sinu seisukoht ja kaks argumenti koos näitega', 'üks vastuargument ja vastus sellele', 'kokkuvõte ja üks ettepanek portaalile'],
        words: [170, 190],
      })), 6)), { task: 'W14' }),
      writingRubric('072_t_rubric', 'Hindamisjuhend: arvamus kommentaariumi kohta (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Autor ütleb, et kommentaarid on halvad. Mina arvan ka. Inimesed sõimavad. Nimega on parem. Aga mõni kardab. Portaal peab sulgema.” Hinnang: ülesanne 2 (seisukoht ja ettepanek on olemas, kuid näide ja vastus vastuargumendile puuduvad), ülesehitus 1 (mõtete loetelu, autori ja enda mõte segamini), sõnavara 2 (puuduvad möönma, solvang, moderaator), grammatika 2 (vead ei takista, kuid -vat ja „autori sõnul” puuduvad). Kui õppija eraldab autori mõtte (autori sõnul …, autor möönab …), lisab näite ja vastuargumendi, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-073': {
    title: '„Minu lemmikkreem!” — kas see on soovitus või reklaam?',
    phases: grammar('Kordamine: kasutatud auto (-tud) · B2: makstud koostöö, tõestatud toime; kontrollitav väide, äratuntav reklaam; tõendamata, märgistamata, kontrollimata'),
    format: 'case',
    topic: 'money',
    canDo: 'Ma saan aru umbes 4-minutilisest taskuhäälingust selle kohta, kuidas eristada soovitust reklaamist, küsitlen kaaslasi reklaami mõju kohta ja annan rühmale ülevaate ning kirjutan mõjuisikule umbes 140-sõnalise viisaka, kuid selge sõnumi; kasutan hinnangus kesksõnu (makstud koostöö, tõendamata väide, kontrollitav).',
    teacherPage: {
      goal: 'Подкаст юриста о рекламе у инфлюенсеров (Harno L2); причастия в оценке (makstud, tõestatud, kontrollitav, tõendamata); опрос однокурсников и обзор 1 мин; дома сообщение инфлюенсеру 140 слов по реальному документу TTJA.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); подкаст дважды, вопросы 1–5; станция 3 — правило и 10 пропусков, черновик 3 предложения; опрос — двух человек, обзор 30 секунд.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в мнении о комментариях (072), и одной строкой говорит, что изменил. Вопрос, если есть время: «Ты покупал(а) что-то по совету блогера?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (72)',
        '5–25: станция 2 — 10 слов + 3 на повтор (2 мин), схема «сильное ли утверждение» (читаем до прослушивания), стратегия: ключевые слова в вопросах (2 мин), подкаст дважды (9 мин), 8 вопросов с выбором (Harno L2)',
        '25–48: станция 3 — kasutatud auto одной строкой (B1), B2: -tud, -tav, -mata в оценке; 10 пропусков, 8 исправлений; черновик сообщения (10 мин), обратная связь — регистр (вежливо, но ясно)',
        '48–68: станция 4 — опрос: каждый спрашивает троих (4 вопроса), записывает ответы, обзор 1 минута группе; вы вносите новую информацию',
        '68–75: выход: 30 секунд — как узнать скрытую рекламу; самооценка; домашнее задание: сообщение инфлюенсеру 140 слов + реальный документ TTJA (3 пункта), голосовое, Harjuta',
        'Kui aega jääb (75–90): три поста (крем, витамины, кофейня) — ученик называет утверждение, доказательство и кто платит',
      ],
      sources: 'Подкаст «Raha ja meie» — учебный текст KeeleSepp (ведущая Kaire и юрист Toomas вымышлены). Общая основа: по закону о рекламе (reklaamiseadus) реклама должна быть узнаваемой, скрытая реклама запрещена; Tarbijakaitse ja Tehnilise Järelevalve Amet (TTJA) выпустил руководство для инфлюенсеров (автор страницу не открывал: ученик ищет её сам); утверждения о здоровье у пищевых добавок регулируются строже; детская реклама — отдельные правила; споры потребителей — tarbijavaidluste komisjon.',
      groups: 'Подкаст — каждый сам, ответы сравнивают в паре. Черновик — каждый сам. Станция 4 — все ходят по классу и опрашивают троих; в 1:1 опрашиваемые — вы и два человека из семьи или знакомых ученика (обзор — в следующем уроке), или вы отвечаете за трёх «типичных» людей.',
      errors: [
        '«makstatud koostöö» → «makstud koostöö» (maksma → makstud).',
        '«kontrollitud väide» (уже проверено) ≠ «kontrollitav väide» (можно проверить).',
        '«tõendamatu väide» → «tõendamata väide» (-mata = не сделано).',
        '«Makstud koostöö on vaja märgistada» → «Makstud koostööd on vaja märgistada» (частичный объект после vaja + da-инфинитив).',
      ],
      notes: [
        'Опрос (v6 §2 d, survey): ученик задаёт вопросы сам и потом обобщает (enamik, pool, kolm inimest kolmest) — это мост к уроку 074. Никто не обязан рассказывать, что он купил.',
        'Реальный документ (v6 §2 l): руководство TTJA для инфлюенсеров — ссылка в домашнем задании, на лист не копируется; 3 пункта: где должна стоять пометка, что считается выгодой, куда сообщить.',
        'Слова на повтор (märgis из урока 62, nõudma из 68, uuring из 58) звучат в подкасте: попросите ученика поднять руку.',
      ],
    },
    discover: [
      station(half(revision('073_d_revise', 'b1b2-072', 'Kirjuta ümber kolm lauset, mille õpetaja sinu arvamuses kommentaariumi kohta märkis. Lisa üks rida: mida sa muutsid ja miks?')), 1, 5),
      station(half(withReview(tag(B.vocab('073_d_vocab', 'Tunni sõnad.', ['reklaam — реклама', 'mõjuisik — инфлюенсер', 'koostöö — сотрудничество', 'jälgija — подписчик', 'märgistama — маркировать', 'varjatud — скрытый', 'tõestama — доказывать', 'toime — действие (эффект)', 'tarbija — потребитель', 'soodustus — скидка, льгота']), { topic: ['reklaam', 'mõjuisik', 'koostöö', 'jälgija', 'märgistama', 'teemaviide', 'soodustuskood', 'toidulisand', 'järelevalveamet'] }), ['märgis', 'nõudma', 'uuring'])), 2, 20),
      teach(B.diagram('073_d_scheme', 'flow', { title: 'Skeem: kas soovitus on tugev?', instruction: 'Loe skeem enne kuulamist läbi. Kuulates kirjuta iga kasti juurde märksõna. Viimasesse kasti kirjuta oma otsus ühe postituse kohta.', nodes: 'Väide: mida postitus lubab? …\nPõhjus: miks see nii peaks olema? …\nTõend: uuring või ainult kogemus? …\nKes maksab: märgis „reklaam”, kood, tasuta toode? …\nMinu otsus: soovitus, reklaam või varjatud reklaam? …' }, 'full', 'g_notice'),
        'Skeem on enne saadet ja on õppija küsitluse ja kodusõnumi kava. Täidetud: väide — „noorendab nahka tõestatult”, „toimib kõigil”; põhjus — mõjuisiku kogemus; tõend — uuring, mitte ühe inimese kogemus; kes maksab — raha, tasuta toode, soodustus, kutse reisile, kood; otsus — märgistamata kood = varjatud reklaam.'),
      why(teach(tag(twiceInLesson(B.examListen('073_d_pod', 'Kuulamine: taskuhääling „Raha ja meie”.', 'Loe küsimused läbi ja joonista alla võtmesõnad. Kuula saadet kaks korda. Vali õige vastus. Vastus on teiste sõnadega.', 'choice', PODCAST_073_V6, [
        ['1. Millal on postitus juristi sõnul reklaam?', 'kui autor saab selle eest mingi hüve', 'kui postituses on palju teemaviiteid', 'kui postitus on kirjutatud isiklikult'],
        ['2. Kus peab märge „reklaam” või „koostöö” olema?', 'kohe alguses või pildil nähtavas kohas', 'postituse lõpus teemaviidete vahel', 'ainult mõjuisiku profiilis'],
        ['3. Mida tähendab juristi sõnul, et märgistus on „alles pool asja”?', 'ka reklaami väide peab olema tõene ja tõendatud', 'märgistus on vabatahtlik', 'pool postitusest võib jääda märgistamata'],
        ['4. Mille poolest erineb lause „Mulle meeldib see kreem” lausest „See kreem toimib kõigil”?', 'esimene on isiklik hinnang, teine vajab tõendit', 'esimene on keelatud, teine lubatud', 'mõlemad vajavad uuringut'],
        ['5. Kes vastutab, kui firma kirjutas reklaami teksti mõjuisiku eest?', 'nii firma kui ka mõjuisik', 'ainult firma, kes teksti kirjutas', 'ainult jälgijad, kes postitust jagasid'],
        ['6. Mida näitab soodustuskood postituse all?', 'soovitajal on tõenäoliselt rahaline huvi', 'toode on kindlasti halb', 'postitus on kindlasti vale'],
        ['7. Miks usaldavad jälgijad ausalt märgitud postitusi pikemas plaanis rohkem?', 'aus märge näitab, et autor ei peida midagi', 'sellised postitused on lühemad', 'neis ei ole kunagi soodustuskoodi'],
        ['8. Mida soovitab jurist teha, kui toodet kiidavad ainult need, kes saavad selle eest raha?', 'oodata enne ostmist üks päev', 'osta kohe, enne kui soodustus lõpeb', 'kirjutada mõjuisikule kommentaar'],
      ], 'g_listen')), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamine, umbes 20 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): seekord „võtmesõnad” — õppija joonib küsimustes alla sõnad, mida kuulata. Eksaminurk (Harno B2 kuulamine, osa 2): kaheksa valikut, vastused on ümber sõnastatud. Küsimus 7 on järeldusküsimus. Kordamise sõnad (märgis, nõudma, uuring) on saates.'), [
        'Toomas: „Siis, kui inimene saab postituse eest midagi vastu: raha, tasuta toote, soodustuse või kutse reisile.”',
        'Toomas: „Märgis … peab olema postituse alguses või pildil, mitte peidetud.”',
        'Toomas: „Teine pool on väide ise … peab olema ka tõend.”',
        'Toomas: „„Mina kasutan … ja mulle meeldib” on hinnang. „See kreem toimib kõigil” on väide, mis vajab tõendit.”',
        'Toomas: „Vastutavad mõlemad: firma, kes reklaami tellis, ja inimene, kes selle avaldas.”',
        'Toomas: „Kood on tugev märk, et postituse taga on leping … soovitajal on rahaline huvi.”',
        'Järeldus: „Jälgija andestab reklaami, aga ei andesta valet.”',
        'Toomas: „Kui vastus kolmandale küsimusele on „ei”, oota üks päev, enne kui ostad.”',
      ]),
    ],
    practice: [
      station(teach(B.notice('073_p_notice', 'Märka: makstud koostöö — tõendamata väide', [
        'Saatest: lugeja peab aru saama, et tegemist on makstud koostööga · reklaam peab olema äratuntav · varjatud reklaam on keelatud',
        'Kordamine (B1): kasutatud auto, avatud uks (mis on tehtud: -tud / -dud).',
        'B2, mis on tehtud: **makstud** koostöö · **tõestatud** toime · **varjatud** reklaam',
        'B2, mida saab teha (-tav / -dav): **kontrollitav** väide · **äratuntav** reklaam — käändub nagu omadussõna: kontrollitava väite, äratuntavat märget',
        'B2, mida ei ole tehtud (-mata): **tõendamata** väide · **märgistamata** postitus · **kontrollimata** info',
        'Vene keeles „непроверенная информация”, „оплаченное сотрудничество” — eesti keeles kontrollimata info, makstud koostöö (nimisõna ees, ilma komata).',
      ], 'full'), 'Kordamine ühe minutiga (kasutatud auto). Siis B2 samm: kesksõna hinnangus — -tud (tehtud), -tav (saab teha), -mata (ei ole tehtud). Küsi iga näite juures: „On tehtud, saab teha või ei ole tehtud?” L1 rida: vene „не-” + причастие = eesti -mata.'), 3, 23),
      why(teach(tag(B.gaps('073_p_part', 'Postituse hinnang.', 'Kas vaja on -tud, -tav või -mata? Kirjuta sulgudes oleva tegusõna õige vorm. Panka ei ole.', [
        'See on [makstud] koostöö: mõjuisik sai postituse eest raha. (maksma)',
        'Kreemi toime ei ole [tõestatud], sest uuringut ei ole. (tõestama)',
        'Seadus nõuab, et reklaam oleks kohe [äratuntav]. (ära tundma)',
        'Hea väide on [kontrollitav]: igaüks saab selle üle vaadata. (kontrollima)',
        'Postitus jäi [märgistamata], kuigi all oli soodustuskood. (märgistama)',
        'Väide „toimib kõigil” on [tõendamata]: keegi ei ole seda uurinud. (tõendama)',
        '[Varjatud] reklaam on keelatud ka siis, kui tekst on väga isiklik. (varjama)',
        'Ära jaga [kontrollimata] infot edasi. (kontrollima)',
        'Jälgijad usaldavad ausalt [märgitud] postitusi rohkem. (märkima)',
        'Postituses ei olnud ühtegi [kontrollitavat] fakti. (kontrollima)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „On tehtud, saab teha või ei ole tehtud?” Read 1, 2, 7, 9: -tud (makstud, tõestatud, varjatud, märgitud). Read 3, 4, 10: -tav (äratuntav, kontrollitav, kontrollitavat — osastav pärast „ühtegi”). Read 5, 6, 8: -mata. Kolm rida sama vihjega (kontrollima) — vali vorm tähenduse järgi.'), [
        'On tehtud: makstud (maksma → makstud).',
        'On tehtud (eitus): tõestatud.',
        'Saab ära tunda: äratuntav.',
        'Saab kontrollida: kontrollitav.',
        'Ei ole tehtud: märgistamata.',
        'Ei ole tõendatud: tõendamata.',
        'On peidetud: varjatud.',
        'Ei ole kontrollitud: kontrollimata.',
        'On märgitud: märgitud (märkima → märgitud).',
        'Saab kontrollida, osastav: kontrollitavat.',
      ]),
      why(teach(tag(B.errorfix('073_p_fix', 'Postitused enne avaldamist.', 'Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Postituse alguses peab olema selgelt äratuntud märge „reklaam”.', 'Postituse alguses peab olema selgelt äratuntav märge „reklaam”.'],
        ['Kreemi toime on tõestamata, sest firma tegi kahe aasta pikkuse uuringu.', 'Kreemi toime on tõestatud, sest firma tegi kahe aasta pikkuse uuringu.'],
        ['Mõjuisik jättis koostöö märgistamatu.', 'Mõjuisik jättis koostöö märgistamata.'],
        ['See on kontrollitud väide: igaüks saab seda ise kontrollida.', 'See on kontrollitav väide: igaüks saab seda ise kontrollida.'],
        ['Ma ei usu kontrollimata infot, mida jagatakse ilma allikat.', 'Ma ei usu kontrollimata infot, mida jagatakse ilma allikata.'],
        ['Makstud koostöö on alati vaja märgistada.', 'Makstud koostööd on alati vaja märgistada.'],
        ['Ta kutsus jälgijaid toidupangas abiks käima ja vabatahtlike meeskonnale liituma.', 'Ta kutsus jälgijaid toidupangas abiks käima ja vabatahtlike meeskonnaga liituma.'],
        ['Seadus nõuab, et reklaam on äratuntav.', 'Seadus nõuab, et reklaam oleks äratuntav.'],
      ], 'full', 'g_notice'), { task: 'G06' }),
      'Pärast iga rida küsi: „Mis siin valesti on: -tud, -tav või -mata?” Read 7–8 on moodulist 14 (Varasemast): liituma millega (67), nõuab, et + tingiv (68).'), [
        'Saab ära tunda: äratuntav (mitte äratuntud).',
        'Uuring on tehtud: tõestatud.',
        '-mata: märgistamata.',
        'Saab kontrollida: kontrollitav.',
        'ilma + ilmaütlev: ilma allikata.',
        'vaja + da-tegevusnimi: osaline sihitis koostööd.',
        'liituma millega: meeskonnaga (tund 67).',
        'nõuab, et + tingiv: oleks (tund 68).',
      ]),
      draft('073_p_draft', 'sõnumi esimene lõik', 'Kirjuta mõjuisikule vähemalt 6 lauset: mida sa postituses märkasid ja miks see sind häiris? Kasuta kolme kesksõna.', 'Ülesande täitmine ja register (viisakas, kuid selge)'),
    ],
    transfer: [
      station(teach(mainTask(B.speaking('073_t_survey', 'Küsitlus: kas reklaam mõjutab meid? (12–15 minutit)', 'Küsi kolmelt kaaslaselt neli küsimust ja pane vastused kirja. Siis tee rühmale ühe minuti ülevaade.', [
        'Kas oled ostnud midagi mõjuisiku soovituse järgi? Mida?',
        'Kas märkasid, et see oli reklaam? Mille järgi?',
        'Millist väidet sa kontrollisid — või jätsid kontrollimata?',
        'Mis paneb sind soovitust usaldama?',
      ], [120, 180]), 'survey',
      ['Küsisin kolmelt inimeselt, kas …', 'Enamik vastas, et …, ainult üks …', 'Kõige rohkem üllatas mind see, et …'],
      'Võrdle tulemust saatega: kas sinu kaaslased tunnevad varjatud reklaami ära sama hästi kui jurist soovitab?', { task: 'S09', fluency: true }),
      'Küsitlus (v6 §2 d, survey). Igaüks küsib kolmelt (üks-ühele: sina ja kaks inimest õppija tuttavate seast — ülevaade järgmises tunnis — või vastad sina kolme tüüpilise inimese eest). Varjatud info (ütle ülevaadete ajal): „Eile selgus, et populaarne mõjuisik ei märgistanud vitamiinide postitust, kuigi sai iga ostu pealt raha.” (Õppija peab ütlema, mida see tähendab jälgijatele ja mida ta ise teeks.) Õnnestunud, kui õppija küsib kõik neli küsimust, teeb ühe minuti ülevaate (enamik, pool, üks kolmest), kasutab vähemalt kolme kesksõna (makstud, märgistamata, kontrollitav) ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'complain' }),
      exitTalk('073_t_say', 'Seleta 30 sekundiga sõbrale, kuidas ära tunda varjatud reklaami.', ['Mille järgi tunned reklaami ära?', 'Mida kontrollid enne ostmist?'], 'Kas õppija nimetab vähemalt kaks tunnust (märge, kood, tõendamata väide) ja kasutab kesksõnu õigesti (makstud, märgistamata, kontrollitav)?'),
      keepPlace(selfCheck('073_t_self', ['Sain taskuhäälingust aru ja järeldasin, miks aus märge on oluline.', 'Kasutasin hinnangus kesksõnu (makstud koostöö, tõendamata väide, kontrollitav).', 'Küsitlesin kaaslasi ja tegin ühe minuti ülevaate.'], 'Küsitlus tehtud', 'Ma oskan soovitust ja reklaami eristada')),
      tag(homeTask(homeLines(B.examWriting('073_t_mail', 'Kodus: sõnum mõjuisikule (umbes 140 sõna).', `Lõpeta tunni mustand sõnumiks (130–150 sõna). Pöördumist ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'sõnum', {
        situation: 'Mõjuisik, keda sa jälgid, kiitis toodet ilma märgiseta ja lisas soodustuskoodi. Kirjuta talle viisakas, kuid selge sõnum. Päris allikas: Tarbijakaitse ja Tehnilise Järelevalve Amet (https://www.ttja.ee) — leia mõjuisikute juhend ja kirjuta üles kolm asja: kus märge peab olema, mida loetakse tasuks ja kuhu tarbija saab teatada. Kasuta neid sõnumis.',
        points: ['milline postitus ja mida sa märkasid', 'miks see on probleem jälgijatele (kesksõnad: makstud, märgistamata, tõendamata)', 'mida ütleb juhend (kolm asja)', 'viisakas palve: mida ta võiks edaspidi teha'],
        words: [130, 150],
      }), 6)), { task: 'W13' }),
      writingRubric('073_t_rubric', 'Hindamisjuhend: sõnum mõjuisikule (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Sinu postitus on reklaam, aga sa ei kirjutanud. See on keelatud. Kood on ka. Kreem on tõestamata. Palun kirjuta reklaam.” Hinnang: ülesanne 2 (probleem ja palve on olemas, kuid juhendi kolm asja puuduvad), ülesehitus 2 (järjekord on selge, sidendeid on vähe), sõnavara 2 (puuduvad märgistama, koostöö, jälgija), grammatika 1 („kreem on tõestamata” — tõestamata on toime, mitte kreem; „sa ei kirjutanud” — mida?); toon on selge, kuid järsk. Kui õppija lisab juhendi info, seletab, miks see on jälgijatele oluline, ja kasutab kesksõnu õigesti, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-074': {
    title: 'Keskmine palk tõusis — miks enamik teenib vähem?',
    phases: grammar('Kordamine: kümme inimest, viis protsenti · B2: pool töötajatest, enamik töötajaid teenib, iga teine, viie protsendi võrra; artiklis käsitletakse …'),
    format: 'facts',
    topic: 'work',
    canDo: 'Ma loen umbes 500-sõnalist artiklit keskmisest palgast ja mediaanist, seletan kolleegidele, mida palgauudis tegelikult ütleb, ja kirjutan infolehele umbes 180-sõnalise kokkuvõtte, kus minu kommentaar on eraldi; kasutan hulga ja osa väljendeid (pool töötajatest, enamik töötajaid teenib, viie protsendi võrra).',
    teacherPage: {
      goal: 'Статья о средней зарплате и медиане (≈ 500 слов, 3 вопроса на вывод); количество и доля (pool töötajatest, enamik teenib, võrra); уголок Harno R4 — инфолисток, 8 предложений + 1 лишнее; презентация коллегам; дома резюме + комментарий 180 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); статья — абзацы A–D и вопросы 1–5; станция 3 — правило и 10 пропусков, R4 — 4 первых пропуска; презентация 1 минута без скрытой информации.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в сообщении инфлюенсеру (073), и одной строкой говорит, что изменил. Вопрос, если есть время: «Средняя зарплата в новостях — это твоя зарплата?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (73)',
        '5–28: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: найти в тексте три числа и сказать, что каждое значит (2 мин), статья (5 мин), 7 вопросов, из них 3 на вывод (8 мин), схема «резюме и мнение отдельно» (5 мин)',
        '28–50: станция 3 — число + партитив одной строкой (B1), B2: pool + -st, enamik + партитив + глагол в ед. ч., iga teine, võrra, artiklis käsitletakse; 10 пропусков; уголок Harno R4 (8 + 1 лишнее); черновик резюме (10 мин)',
        '50–68: станция 4 — презентация коллегам 1–2 минуты по схеме, вы — коллега со скрытой информацией и вопросом',
        '68–75: выход: 30 секунд — почему средняя зарплата может вводить в заблуждение; самооценка; домашнее задание: резюме + комментарий 180 слов, голосовое, Harjuta',
        'Kui aega jääb (75–90): ученик находит в новостях одно число и говорит, что оно показывает и чего не показывает',
      ],
      sources: 'Статья «Miks keskmine palk ei ole sinu palk?» — учебный текст KeeleSepp без точной статистики (раньше: Statistikaamet 2026, 2135 и 1753 € — убраны). Фирма из 10 человек — выдуманный пример. Общая основа: средняя брутто-зарплата обычно выше медианы, потому что небольшая доля высоких зарплат поднимает среднее; брутто до налогов; реальная зарплата зависит от роста цен; различия по регионам и отраслям.',
      groups: 'Статья и вопросы — каждый сам, вопросы на вывод сравнивают в паре. R4 — каждый сам. Черновик — каждый сам. Станция 4 — презентация группе или вам, один вопрос от слушателя; в 1:1 коллега — вы.',
      errors: [
        '«Enamik töötajad teenivad» → «Enamik töötajaid teenib» (enamik + партитив мн. ч., глагол в ед. ч.).',
        '«Pool töötajad» → «pool töötajatest» (часть целого: -st).',
        '«Palk kasvas viis protsendi võrra» → «… viie protsendi võrra» (võrra + родительный).',
        '«Artiklis räägitakse» — можно, но в резюме точнее «artiklis käsitletakse».',
      ],
      notes: [
        'Презентация (v6 §2 d, presentation; по сути медиация): ученик объясняет число коллегам, которые поняли заголовок неправильно. Не спрашивайте о зарплате ученика: пример — выдуманная фирма.',
        'Уголок Harno R4 (B2 lugemine, osa 4): целые предложения в пропуски, одно лишнее. Спросите, какое слово в соседнем предложении подсказывает ответ (seevastu, samas, põhjus).',
        'Слова на повтор (andmed из урока 59, õiglane из 63, eelarve из 69) есть в статье и на карточке.',
      ],
    },
    discover: [
      station(half(revision('074_d_revise', 'b1b2-073', 'Kirjuta ümber kolm lauset, mille õpetaja sinu sõnumis mõjuisikule märkis. Lisa üks rida: mida sa muutsid ja miks?')), 1, 5),
      station(half(withReview(tag(B.vocab('074_d_vocab', 'Tunni sõnad.', ['keskmine — средний', 'mediaan — медиана', 'protsent — процент', 'enamik — большинство', 'osakaal — доля', 'kasv — рост', 'võrdlema — сравнивать', 'kokkuvõte — резюме', 'moonutama — искажать', 'brutopalk — зарплата до налогов']), { topic: ['keskmine', 'mediaan', 'protsent', 'osakaal', 'brutopalk', 'mediaanpalk', 'kokkuvõte', 'infoleht', 'palgaaste'] }), ['andmed', 'õiglane', 'eelarve'])), 2, 23),
      why(teach(tag(B.reading('074_d_read', 'Loe artiklit.', 'Otsi kõigepealt tekstist kolm arvu: mida iga arv näitab? Siis loe tervikuna ja vasta lühidalt. Küsimustele 4, 6 ja 7 järelda.', 'Miks keskmine palk ei ole sinu palk?', [
        '(A) Iga kvartali lõpus ilmub uudis, et keskmine palk on jälle tõusnud. Paljud lugejad vaatavad seda arvu ja mõtlevad: „Mina teenin palju vähem. Kas minuga on midagi valesti?” Tavaliselt ei ole. Arv on õige, kuid see ei kirjelda tüüpilist töötajat. Et aru saada, miks, tasub vaadata, kuidas keskmine üldse arvutatakse.',
        '(B) Kujutame ette väikest firmat, kus töötab kümme inimest. Üheksa neist teenivad umbes tuhat viissada eurot kuus, juhataja aga kümme tuhat. Kui kõik palgad kokku liita ja kümnega jagada, saame keskmiseks umbes kaks tuhat nelisada eurot. Seda summat ei teeni firmas mitte keegi. Üheksa inimest kümnest teenib keskmisest vähem — ainult üks teenib palju rohkem. Kui juhataja palka tõstetakse, tõuseb ka firma keskmine, kuigi teiste palk ei muutu sentigi.',
        '(C) Seepärast kasutavad statistikud ka mediaani. Mediaan on palk, mis jääb täpselt keskele: pool töötajatest teenib vähem ja pool rohkem. Meie firmas on mediaan umbes tuhat viissada eurot ja see kirjeldab tavalise töötaja elu palju paremini. Kogu riigis on mediaanpalk tavaliselt mitusada eurot väiksem kui keskmine, sest väike osa töötajatest teenib väga suurt palka ja tõstab keskmist üles.',
        '(D) Uudises on oluline ka see, mida arv ei näita. Keskmine brutopalk on palk enne maksude maha arvamist, nii et kätte saab inimene vähem. Arv ei ütle ka, kas hinnad tõusid samal ajal kiiremini. Kui palk kasvas viis protsenti, aga toit ja üür läksid kallimaks kaheksa protsendi võrra, jääb inimesel tegelikult vähem raha kui aasta varem.',
        '(E) Suured erinevused on ka piirkondade ja alade vahel. Pealinnas ja infotehnoloogias on palgad tavaliselt kõrgemad, maal ning kaubanduses ja teeninduses madalamad. Iga teine pealkiri „Eestlane teenib juba üle … euro” jätab need erinevused välja. Nii tekib lugejal tunne, et ta jääb maha, kuigi ta teenib oma piirkonna kohta täiesti tavalist palka. Ka vanus mängib rolli: noor töötaja, kes alles alustab, teenib tavaliselt vähem kui kogenud kolleeg.',
        '(F) Kas see tähendab, et ajakirjanikud eksitavad meelega? Enamasti mitte. Keskmine on lühike ja lihtne arv, mis mahub pealkirja. Mõnikord on põhjus ka ajapuudus: uudis tuleb avaldada kiiresti ja pikka seletust ei jõua keegi kirjutada. Hea uudis näitab aga kahte arvu korraga, ütleb, kust andmed pärinevad, ja seletab, keda arv puudutab. Kui uudises on ainult üks arv ja palju emotsiooni, tasub olla ettevaatlik.',
        '(G) Lugejana võid küsida kolm küsimust: kas see on keskmine või mediaan, kas palk on enne või pärast makse ja kas arvestatud on hindade tõusu. Kui vastuseid uudisest ei leia, ära tee järeldusi oma elu kohta. Sinu pere eelarve sõltub sinu palgast ja kuludest, mitte riigi keskmisest. Kui tahad oma palka võrrelda, vaata pigem sama ala ja piirkonna mediaani — see annab ausama pildi.',
        'Allikas: KeeleSepp õppetekst (näidisfirma on välja mõeldud).',
      ].join('\n\n'), [
        ['1. Mida mõtlevad paljud lugejad, kui nad näevad keskmise palga uudist?', 'et nad teenivad vähem kui teised|et nendega on midagi valesti|mina teenin palju vähem'],
        ['2. Mitu inimest kümnest teenib näidisfirmas keskmisest vähem?', 'üheksa|üheksa inimest|üheksa kümnest'],
        ['3. Mis on mediaan?', 'palk, mis jääb täpselt keskele|pool teenib vähem ja pool rohkem|keskmine palk järjekorras'],
        ['4. Miks on mediaanpalk riigis tavaliselt väiksem kui keskmine? Järelda.', 'väike osa teenib väga palju ja tõstab keskmist|suured palgad tõstavad keskmist'],
        ['5. Mida ei näita brutopalk?', 'kui palju inimene pärast makse kätte saab|palka pärast makse'],
        ['6. Miks võib inimesel jääda vähem raha, kuigi palk kasvas? Järelda.', 'hinnad tõusid kiiremini kui palk|toit ja üür läksid rohkem kallimaks'],
        ['7. Mida teeb autori arvates hea uudis? Järelda.', 'näitab kahte arvu, nimetab allika ja seletab, keda arv puudutab|näitab kahte arvu ja ütleb allika'],
      ]), { task: 'R15', voice: 'article' }),
      'Lugemine, umbes 23 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): seekord „otsi” — enne lugemist leiab õppija kolm arvu ja ütleb, mida need näitavad. Küsimused 4, 6 ja 7 on järeldusküsimused. Kordamise sõnad (andmed, eelarve) on tekstis, õiglane esitluse kaardil. Tekst on õppetekst ilma täpse statistikata (umbes 480 sõna); näidisfirma on välja mõeldud.'), [
        '(A): „Mina teenin palju vähem. Kas minuga on midagi valesti?”',
        '(B): „Üheksa inimest kümnest teenib keskmisest vähem.”',
        '(C): „Mediaan on palk, mis jääb täpselt keskele: pool töötajatest teenib vähem ja pool rohkem.”',
        'Järeldus (C): „väike osa töötajatest teenib väga suurt palka ja tõstab keskmist üles”.',
        '(D): „Keskmine brutopalk on palk enne maksude maha arvamist, nii et kätte saab inimene vähem.”',
        'Järeldus (D): palk kasvas viis protsenti, hinnad kaheksa protsendi võrra.',
        'Järeldus (F): „Hea uudis näitab … kahte arvu korraga, ütleb, kust andmed pärinevad, ja seletab, keda arv puudutab.”',
      ]),
      teach(B.diagram('074_d_scheme', 'formula', { title: 'Skeem: kokkuvõte, mis ei moonuta', instruction: 'Kirjuta artikli põhjal iga rea juurde üks lause. Viimasele reale kirjuta eraldi oma arvamus.', nodes: 'Artiklis käsitletakse … | …\nKeskmine näitab … | mediaan näitab …\nArv ei näita … | …\nEnamik töötajaid … | …\nMinu arvates … (eraldi!) | …' }, 'full', 'g_notice'),
        'Skeem on esitluse ja kodukokkuvõtte kava: neli esimest rida on kokkuvõte (ilma hinnanguta), viimane rida on õppija arvamus. Täidetud: artiklis käsitletakse keskmise palga ja mediaani vahet; keskmine — kõik palgad kokku jagatud töötajate arvuga, mediaan — pool teenib vähem, pool rohkem; arv ei näita makse, hindade tõusu ega piirkondade erinevusi; enamik töötajaid teenib keskmisest vähem.'),
    ],
    practice: [
      station(teach(B.notice('074_p_notice', 'Märka: pool töötajatest — enamik teenib', [
        'Artiklist: pool töötajatest teenib vähem · üheksa inimest kümnest · iga teine pealkiri · kallimaks kaheksa protsendi võrra',
        'Kordamine (B1): arv + osastav: kümme inimest, viis protsenti.',
        'B2, osa tervikust: **pool**, **kolmandik** + -st: pool **töötajatest**, kolmandik **lugejatest** · **enamik** + osastav: enamik **töötajaid** · tegusõna ainsuses: Enamik töötajaid **teenib** vähem.',
        'B2, sagedus ja muutus: **iga teine** inimene · kasvas viis protsenti → kasvas **viie protsendi võrra** (omastav + võrra).',
        'B2, kokkuvõtte raam: **Artiklis käsitletakse** … · Autori sõnul … · **Minu arvates** … (eraldi lõigus).',
        'Vene keeles „большинство работников получают” (mitmus) — eesti keeles ainsus: Enamik töötajaid teenib.',
      ], 'full'), 'Kordamine ühe minutiga (kümme inimest). Siis B2 samm: osa tervikust (pool + -st, enamik + osastav ja tegusõna ainsuses), muutus (võrra) ja kokkuvõtte raam. Küsi iga näite juures: „Kas see on terve või osa?” L1 rida: vene mitmus — eesti ainsus.'), 3, 22),
      why(teach(tag(B.gaps('074_p_parts', 'Uudise arvud sõnadega.', 'Kirjuta sulgudes olev sõna õiges vormis. Panka ei ole.', [
        'Pool [töötajatest] teenib mediaanist vähem. (töötaja)',
        'Enamik [töötajaid] ei teeni keskmist palka. (töötaja)',
        'Enamik inimesi [teenib] vähem kui keskmine. (teenima, olevik)',
        'Kolmandik [lugejatest] loeb ainult pealkirja. (lugeja)',
        'Uudis ütleb, et [iga teine] eestlane elab linnas. (üks kahest)',
        'Palk kasvas [viie] protsendi võrra. (viis)',
        'Üür tõusis kaheksa [protsendi] võrra. (protsent)',
        '[Artiklis] käsitletakse keskmise palga ja mediaani vahet. (artikkel)',
        'Artiklis [käsitletakse] seda, mida keskmine ei näita. (käsitlema, umbisikuline)',
        '[Minu] arvates peaks uudis näitama kahte arvu. (mina)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas see on terve või osa?” Read 1 ja 4: pool / kolmandik + -st. Read 2–3: enamik + osastav, tegusõna ainsuses. Rida 5: iga teine + nimetav. Read 6–7: omastav + võrra. Read 8–10: kokkuvõtte raam (artiklis käsitletakse …, minu arvates …).'), [
        'pool + -st: töötajatest.',
        'enamik + osastav mitmus: töötajaid.',
        'enamik … + tegusõna ainsuses: teenib.',
        'kolmandik + -st: lugejatest.',
        'üks kahest: iga teine.',
        'võrra + omastav: viie.',
        'võrra + omastav: protsendi.',
        'kus? artiklis.',
        'umbisikuline: käsitletakse.',
        'minu arvates (oma arvamus eraldi).',
      ]),
      why(teach(tag(B.insertion('074_p_bank', 'Eksaminurk: kokkuvõte töötajate infolehes.', 'Loe kokkuvõtet. Vali igasse lünka sobiv lause. Üks lause jääb üle.', 'Infoleht: mida palgauudis tegelikult ütles?', [
        'Eelmisel nädalal kirjutasid mitu portaali, et keskmine palk on jälle tõusnud. [[Paljud meie töötajad küsisid seejärel, miks nende palk on sellest arvust väiksem.]] Selles kokkuvõttes vastame lühidalt.',
        'Artiklites käsitleti kahte arvu: keskmist palka ja mediaani. [[Keskmise arvutamiseks liidetakse kõik palgad kokku ja jagatakse töötajate arvuga.]] Mediaan on aga palk, millest pool töötajatest teenib vähem ja pool rohkem.',
        'Kui mõni inimene teenib väga suurt palka, tõuseb keskmine üles. [[Mediaan seevastu jääb peaaegu samaks.]] Seepärast kirjeldab mediaan tavalise töötaja palka paremini.',
        'Ka meie firmas on keskmine palk mediaanist kõrgem. [[Põhjus on see, et mõne spetsialisti palk on turu tõttu väga kõrge.]] See ei tähenda, et teised teeniksid halvasti.',
        'Uudises oli ka arv, mis näitas palga kasvu protsentides. [[Samas ei olnud kirjas, kui palju tõusid samal ajal hinnad.]] Ilma selleta ei saa öelda, kas inimestel jääb raha rohkem või vähem.',
        'Ajakirjanikud ei eksitanud meelega. [[Keskmine on lihtsalt lühike arv, mis mahub hästi pealkirja.]] Hea uudis näitab siiski kahte arvu korraga.',
        'Meie firma palgaastmed on kõigile töötajatele näha. [[Sel aastal tõusid need kõigis astmetes umbes sama palju.]] Küsimuste korral pöörduge personaliosakonna poole.',
        'Lõpuks üks soovitus. [[Enne kui teete uudise põhjal järeldusi oma palga kohta, lugege ka seda, mida arv ei näita.]] Iga arv vajab selgitust.',
      ], ['Seepärast otsustas juhatus kõigi töötajate palga järgmisest kuust kahekordistada.'], 'g_read'), { task: 'R16', harno: 'R4' }),
      'Eksaminurk (Harno B2 lugemine, osa 4): kaheksa lünka, üks lause üle. Küsi iga lünga juures, mis naaberlauses vihjab (küsisid → vastame; keskmine ja mediaan → arvutamine; tõuseb üles → seevastu; põhjus; ilma selleta → hinnad; ei eksitanud → lihtsalt; palgaastmed → tõusid; soovitus). Üleliigne lause on vale ka sisult: infoleht ei räägi palga kahekordistamisest.'), [
        '„küsisid” → järgmine lause: „Selles kokkuvõttes vastame.”',
        '„kahte arvu” → kuidas keskmist arvutatakse; järgmine lause: „Mediaan on aga …”',
        '„tõuseb keskmine üles” → „Mediaan seevastu jääb peaaegu samaks.”',
        '„keskmine on mediaanist kõrgem” → „Põhjus on see, et …”',
        '„palga kasvu” → „Samas ei olnud kirjas … hinnad”; järgmine lause: „Ilma selleta …”',
        '„ei eksitanud meelega” → „Keskmine on lihtsalt lühike arv …”',
        '„palgaastmed” → „Sel aastal tõusid need …”',
        '„üks soovitus” → „Enne kui teete … järeldusi …”',
      ]),
      draft('074_p_draft', 'kokkuvõtte esimene lõik', 'Kirjuta vähemalt 6 lauset: artiklis käsitletakse …, mis on keskmine ja mediaan, mida arv ei näita. Oma arvamus tuleb hiljem.', 'Ülesande täitmine (kokkuvõte ei moonuta, arvamus eraldi)'),
    ],
    transfer: [
      station(teach(mainTask(inLesson(B.speaking('074_t_present', 'Esitlus: mida palgauudis tegelikult ütleb? (12–15 minutit)', 'Kolleegid nägid pealkirja ja on pahased. Seleta 1–2 minutit skeemi järgi, mida uudis tegelikult ütleb. Vasta kahele küsimusele.', [
        'Mida pealkiri ütleb ja mida see välja jätab?',
        'Mis vahe on keskmisel ja mediaanil? Too näide.',
        'Mida arv ei näita (maksud, hinnad, piirkond)?',
        'Kolleeg küsib: „Kas on õiglane, et juhataja teenib kümme korda rohkem?” Mida vastad?',
      ], [120, 180])), 'presentation',
      ['Artiklis käsitletakse …', 'Enamik töötajaid teenib …, sest …', 'Minu arvates … (see on minu arvamus, mitte uudise oma)'],
      'Lisa esitlusse üks arv sõnadega (pool, enamik, … võrra) ja ütle, kust andmed pärinevad.', { task: 'S16', fluency: true }),
      'Esitlus (v6 §2 d, presentation; sisult vahendus: kolleegid said pealkirjast valesti aru). Sina oled kolleeg. Varjatud info (ütle pärast esitlust): „Meie firma infolehes on kirjas: keskmine palk tõusis sel aastal kuus protsenti, mediaan aga ainult kaks.” (Õppija peab seletama, mida see tähendab: suured palgad tõusid rohkem; enamik töötajaid sai väiksema tõusu.) Küsimus: „Kas see on õiglane?” — õppija hoiab kokkuvõtte ja oma arvamuse lahus. Õnnestunud, kui esitluses on kokkuvõte, keskmise ja mediaani vahe, üks asi, mida arv ei näita, ja eraldi arvamus; õppija kasutab vähemalt kolme hulga väljendit (pool töötajatest, enamik teenib, võrra) ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 18, { final: 'plan' }),
      exitTalk('074_t_say', 'Seleta 30 sekundiga, miks keskmine palk võib lugejat eksitada.', ['Mis vahe on keskmisel ja mediaanil?', 'Mida peaks lugeja enne järelduste tegemist küsima?'], 'Kas õppija seletab keskmise ja mediaani vahet ühe näitega ja kasutab vähemalt üht hulga väljendit (pool töötajatest, enamik teenib)?'),
      keepPlace(selfCheck('074_t_self', ['Sain artiklist aru ja järeldasin, miks keskmine võib eksitada.', 'Kasutasin hulga ja osa väljendeid (pool töötajatest, enamik teenib, viie protsendi võrra).', 'Seletasin esitluses uudist nii, et kokkuvõte ja minu arvamus olid lahus.'], 'Uudis seletatud', 'Ma oskan arvudega uudist õigesti kokku võtta')),
      tag(homeTask(homeLines(B.examWriting('074_t_report', 'Kodus: kokkuvõte ja kommentaar (umbes 180 sõna).', `Lõpeta tunni mustand kokkuvõtteks (170–190 sõna). Kommentaar on eraldi lõigus. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kokkuvõte', {
        situation: 'Kirjuta töökoha või kursuse infolehele kokkuvõte artiklist „Miks keskmine palk ei ole sinu palk?” ja eraldi lõigus oma kommentaar.',
        points: ['artiklis käsitletakse … (teema ja allikas)', 'keskmise ja mediaani vahe ning üks asi, mida arv ei näita', 'vähemalt kaks arvu sõnadega (pool, enamik, iga teine, … võrra)', 'eraldi lõik: minu arvates … ja üks näide'],
        words: [170, 190],
      }), 6)), { task: 'W15' }),
      writingRubric('074_t_rubric', 'Hindamisjuhend: kokkuvõte ja kommentaar (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Artikkel on palgast. Keskmine palk on vale arv. Enamik töötajad teenivad vähem. Ajakirjanikud valetavad. Mina teenin ka vähem.” Hinnang: ülesanne 1 (kokkuvõte moonutab: autor ei ütle, et arv on vale ega et ajakirjanikud valetavad; mediaan puudub), ülesehitus 2 (kokkuvõte ja arvamus on segamini), sõnavara 2 (puuduvad mediaan, brutopalk, käsitlema), grammatika 2 („enamik töötajad teenivad” → enamik töötajaid teenib). Kui õppija kirjutab kokkuvõtte ilma hinnanguta, lisab mediaani ja paneb oma arvamuse eraldi lõiku, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-075': {
    title: 'Kontroll 15 — meedia, info ja kriitiline lugemine',
    format: 'exam',
    assessment: true,
    canDo: 'Ma loen eksami vormis kaht meediateksti — lünkadega juhendit ja umbes 480-sõnalist arvamuslugu — ning lahendan nende ülesanded ja kirjutan kaks teksti: viie minutiga arvamuse samades tingimustes nagu mooduli alguses ja umbes 150-sõnalise kokkuvõtte küsitlusest koos kommentaariga; Harno lävi on 60 %.',
    teacherPage: {
      goal: 'Контроль модуля 15 на одном листе, 45 минут: чтение (16 баллов) + письмо (18 баллов). Параллельная задача к холодной задаче урока 071 и резюме опроса с комментарием (Harno W2a) с аналитической рубрикой.',
      core: [1], alt: 1,
      short: 'Если времени мало: чтение (22 мин) в классе, письмо 2 — дома в тех же условиях (без словаря, 18 минут).',
      hook: 'Почему чтение + письмо, а не полный пробный экзамен: решение методиста для 040, 055, 060, 065 и 070 — по v6 §2 g контроль B2 — два навыка по очереди (модуль 13 R + W, модуль 14 L + S, модуль 15 R + W); следующий полный пробный экзамен — 080. Холодная задача модуля письменная (071_d_cold), поэтому и параллельная задача письменная; заголовки, колонки, посты и цифры приходят к ученику текстом, и модуль учил писать резюме, где своё мнение отдельно.',
      plan: [
        '0–2: инструкция, баллы и пороги (Harno 60 %, KeeleSepp 70 % и 80 %, ни одна часть не 0)',
        '2–24: чтение — часть 1: текст с 8 пропусками целыми предложениями и одним лишним (Harno R4); часть 2: колонка ≈ 480 слов, 8 вопросов с выбором, из них 3 на вывод (Harno R1)',
        '24–29: письмо 1 — параллельная задача: 5 минут, 5–7 предложений, новое утверждение (те же условия, что 071_d_cold)',
        '29–45: письмо 2 — резюме опроса с комментарием 140–160 слов (Harno W2a; на экзамене ≈ 180 слов), аналитическая рубрика 12 баллов',
      ],
      sources: 'Тексты «Enne jagamist: kolm minutit» и «Kas me loeme veel kaugemale kui pealkiri?» — учебные тексты KeeleSepp (мнение автора), без точной статистики. Опрос 40 учащихся в письме 2 — выдуманный, числа учебные.',
      groups: 'Каждый сам, без словаря. Устная часть модуля проверяется в уроках (выходы 071–074).',
      errors: [
        'Varasemast (≈ 20 %, v6 §2 f): часть 1 пропуски 2, 3 и 5 повторяют модуль 12 (058: проверить новость перед тем, как поделиться — источник, дата, исправление), часть 2 вопрос 6 — модуль 14 (kogukond, vabatahtlikud päästjad, volikogu, урок 67). Это 4 из 16 заданий чтения; в письме 2 — сравнение долей (pool, enamik, iga neljas) из модуля 13 (сравнение чисел).',
        'Сравнение с холодной задачей: положите рядом листы 071_d_cold и 075_t_cold (оба утверждения — «X должны отвечать за то, чтобы … не вводили в заблуждение») и назовите ученику одно развитие и один следующий шаг.',
      ],
      notes: [
        'Баллы: чтение 8 + 8 = 16; письмо 1 — 6 баллов по трём строкам 0/1/2; письмо 2 — 12 баллов (4 критерия × 0–3). Всего 34. Harno 60 % = 21, KeeleSepp 70 % = 24, 80 % = 28. Ни одна часть не может быть 0 баллов.',
      ],
    },
    // Methodology v5 + v6 (2026-11-26): one sheet, 45 minutes, ≤ 10 blocks, READING + WRITING; points add up (v6 G20: R 8 + 8
    // items = 16 points; W 6 + 12 = the rubrics' maxima), the no-zero rule is stated (G21), the reading is at least the
    // lessons' level (R4 ≈ 360 words, R1 ≈ 480 words with 3 inference questions), the cold → parallel writing is the same
    // task (5 min, 5–7 sentences, „X should answer for not misleading”) with a new statement. The v4 control (three sheets,
    // 28 blocks, ≈ 167 min) stays hidden below.
    discover: [
      B.text('075_d_intro', 'Kontroll 15: lugemine ja kirjutamine (45 minutit)', 'Kontrollis on kaks osaoskust. Lugemine (22 minutit): kaks teksti ja kaks ülesannet ilma sõnaraamatuta, 16 punkti. Kirjutamine (23 minutit): viie minutiga arvamus (6 punkti) ja kokkuvõte küsitlusest koos kommentaariga umbes 150 sõna (12 punkti) — kokku 18 punkti. Kokku 34 punkti. Harno: sooritatud alates 60 % (vähemalt 21 punkti) ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (24 punkti), meie tunnistus alates 80 % (28 punkti) — see on sisemine lävi.'),
      PART('075_d_rpart', 'R', { minutes: 22, points: 16, tasks: 2, note: 'Osa 1: lüngad tervete lausetega, üks lause üle (8 punkti). Osa 2: arvamuslugu umbes 480 sõna, valikvastused (8 punkti). Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      why(tag(B.insertion('075_d_bank', 'Lugemine, osa 1: vali lünka lause (8 punkti).', 'Loe teksti. Vali igasse lünka sobiv lause. Üks lause jääb üle. Sõnaraamatut ei kasutata.', 'Enne jagamist: kolm minutit, mis hoiavad sinu nime puhtana', [
        'Sõber saadab sulle vestlusesse uudise: „Linnas suletakse homme kõik koolid!” Esimene soov on see kohe edasi saata, sest asi tundub tähtis. [[Just sel hetkel tasub aga võtta kolm minutit aega.]] Need kolm minutit võivad ära hoida suure segaduse.',
        'Esimene minut on allika jaoks. Vaata, kes uudise avaldas ja kas see on päris toimetus. [[Kui nime ei ole või see on sulle tundmatu, otsi sama uudist mõnest usaldusväärsest väljaandest.]] Kui seal sellest midagi ei räägita, on põhjust kahelda.',
        'Teine minut on kuupäeva jaoks. Paljud lood, mis sotsiaalmeedias ringlevad, on aastaid vanad. [[Vana uudis võib tänases olukorras olla täiesti eksitav.]] Näiteks koolid võisid olla suletud mõne tormi ajal, mis on ammu möödas.',
        'Kolmas minut on sõnade jaoks. Loe läbi kogu lugu, mitte ainult pealkiri. [[Sageli selgub, et pealkirjas on rohkem hirmu kui loos endas.]] Pane tähele sõnu nagu „väidetavalt”, „kuuldavasti” või „võib-olla”: need näitavad, et info ei ole kinnitatud.',
        'Mis siis, kui oled juba midagi valet jaganud? [[Ära kustuta postitust vaikselt, vaid kirjuta juurde, et info oli vale.]] Nii näevad ka need, kes juba lugesid, et asi on parandatud.',
        'Kas kõike peab kontrollima? Ilmselt mitte. Kui sõber kirjutab, et tal on uus koer, ei ole faktikontroll vajalik. [[Kontrollida tasub eelkõige seda, mis tekitab tugevat tunnet: viha, hirmu või suurt rõõmu.]] Just sellised lood levivad kõige kiiremini.',
        'Kohalikel uudistel on oma reegel. Kui keegi kirjutab prügiveo muutusest või uuest bussiliinist, vaata ka valla kodulehte. [[Ametlik teade on seal tavaliselt olemas juba enne, kui sellest sotsiaalmeedias räägitakse.]] Nii saad ka täpsed kuupäevad.',
        'Kolm minutit ei ole palju. [[Usaldus, mille kaotad ühe vale jagamisega, tuleb aga tagasi väga aeglaselt.]]',
      ], ['Seepärast soovitavad eksperdid jagada iga uudist vähemalt kolmes grupis korraga.'], 'g_read'), { task: 'R16', harno: 'R4' }), [
        '„Esimene soov on see kohe edasi saata” → „Just sel hetkel tasub aga …”; järgmine lause: „Need kolm minutit …”',
        '„kas see on päris toimetus” → „Kui nime ei ole …, otsi sama uudist …”; järgmine: „Kui seal sellest midagi ei räägita …” (Varasemast: tund 58.)',
        '„aastaid vanad” → „Vana uudis võib … olla eksitav”; järgmine: näide tormist. (Varasemast: tund 58.)',
        '„mitte ainult pealkiri” → „pealkirjas on rohkem hirmu kui loos”.',
        '„oled juba … jaganud” → „Ära kustuta … vaid kirjuta juurde …”; järgmine: „Nii näevad …” (Varasemast: tund 58.)',
        '„faktikontroll ei ole vajalik” → „Kontrollida tasub eelkõige …”; järgmine: „Just sellised lood …”',
        '„vaata ka valla kodulehte” → „Ametlik teade on seal …”; järgmine: „Nii saad ka täpsed kuupäevad.”',
        '„Kolm minutit ei ole palju.” → „Usaldus … tuleb aga tagasi väga aeglaselt.”',
      ]),
      tag(B.reading('075_d_read', 'Lugemine, osa 2: arvamuslugu.', 'Loe arvamuslugu (umbes 6 minutit). Siis vasta all olevatele küsimustele.', 'Kas me loeme veel kaugemale kui pealkiri?', [
        '(A) Töötan maakonnalehes juba kakskümmend aastat. Kui alustasin, luges inimene lehte hommikul kohvi kõrvale algusest lõpuni. Täna jõuab enamik meie lugejaid uudiseni telefonis, sotsiaalmeedia kaudu, ja paljud ei ava lugu üldse. Nad loevad pealkirja, vaatavad pilti ja kirjutavad kommentaari. Kas see on halb? Mitte tingimata, kuid see muudab nii ajakirjanikku kui ka lugejat.',
        '(B) Ajakirjaniku jaoks on kiusatus suur. Kui pealkiri on vihane või hirmutav, klikitakse sellele rohkem ja reklaamiandjad maksavad rohkem. Mõni toimetus on selle kiusatusega kaasa läinud. Ma ei süüdista neid täielikult: kohalik leht peab kuidagi ellu jääma. Kuid iga eksitav pealkiri võtab lugejalt natuke usaldust ja seda on hiljem väga raske tagasi võita.',
        '(C) Lugeja ei ole siiski ainult ohver. Me kõik valime, millele klikime. Kui jagame edasi lugu, mida me ise ei lugenud, aitame levitada ka viga. Paljusid uudiseid jagatakse ilma neid avamata. See tähendab, et pealkiri on sageli ainus asi, mida inimene teemast teab.',
        '(D) Mida siis teha? Meie toimetus otsustas mõni aasta tagasi, et pealkiri peab ütlema sama mis lugu, mitte rohkem. Kui väide ei ole kinnitatud, kirjutame seda ka pealkirja. Kui teeme vea, avaldame paranduse samas kohas, kus oli viga. Alguses kartsime, et lugejaid jääb vähemaks. Tegelikult juhtus vastupidi: tellijaid tuli juurde, sest inimesed hakkasid meid rohkem usaldama.',
        '(E) Kohalikul lehel on veel üks ülesanne, mida suured portaalid ei täida. Me kirjutame volikogu istungitest, kooli remondist, vabatahtlike päästjate tööst ja külaseltsi talgutest. Need lood ei too palju klikke, kuid ilma nendeta ei tea kogukond, mis tema ümber toimub. Kui kohalik ajakirjandus kaob, ei kao ainult leht, vaid ka koht, kus naabrid saavad üksteise mõtetest teada.',
        '(F) Ma ei arva, et peaksime telefoni ära viskama ja paberlehe juurde tagasi minema. Kuid ma soovitan igale lugejale üht väikest harjumust: enne kui jagad, loe läbi vähemalt esimene lõik. Kui sul selleks aega ei ole, ei ole sul ka aega lugu edasi saata.',
        '(G) Hea ajakirjandus ja hea lugeja vajavad teineteist. Ajakirjanik peab kirjutama ausalt, lugeja peab lugema tähelepanelikult. Kui üks neist kaob, kaotame mõlemad.',
        'Allikas: KeeleSepp õppetekst (autori arvamus).',
      ].join('\n\n'), [], 'g_read'), { task: 'R13' }),
      why(tag(B.choice('075_d_mc', 'Osa 2: vali õige vastus (8 punkti).', 'Vali iga küsimuse juurde arvamusloo põhjal üks õige vastus neljast.', [
        ['Kuidas on lugejate harjumused autori sõnul muutunud?', 'paljud loevad telefonis ainult pealkirja', 'inimesed loevad rohkem paberlehte', 'lugejad ei kirjuta enam kommentaare', 'keegi ei loe enam kohalikke uudiseid'],
        ['Miks on eksitav pealkiri lõigu B järgi toimetusele ahvatlev?', 'see toob rohkem klikke ja reklaamiraha', 'seadus nõuab seda', 'lugejad paluvad seda', 'seda on lihtsam kirjutada'],
        ['Mida tahab autor öelda lausega „Lugeja ei ole siiski ainult ohver”? Järelda.', 'ka lugeja vastutab selle eest, mida ta loeb ja jagab', 'lugejad on ajakirjanike vastu', 'lugeja ei saa midagi muuta', 'ajakirjanik on alati süüdi'],
        ['Mida otsustas autori toimetus pealkirjade kohta?', 'pealkiri ei tohi lubada rohkem, kui lugu ütleb', 'pealkirju enam ei kirjutata', 'iga pealkiri lõpeb küsimärgiga', 'pealkirju kirjutavad lugejad'],
        ['Mis juhtus pärast seda, kui toimetus hakkas pealkirju ausamalt kirjutama?', 'lehe tellijaid tuli juurde', 'lugejaid jäi vähemaks', 'reklaamiandjad lahkusid', 'leht suleti'],
        ['Miks on kohalik ajakirjandus autori arvates kogukonnale vajalik? Järelda.', 'see aitab elanikel teada, mis nende ümber toimub', 'see toob kõige rohkem klikke', 'see asendab volikogu istungeid', 'see kirjutab ainult kuulsatest inimestest'],
        ['Millise harjumuse soovitab autor igale lugejale?', 'enne jagamist lugeda läbi vähemalt esimene lõik', 'loobuda telefonist', 'tellida ainult paberleht', 'mitte kunagi kommenteerida'],
        ['Milline on autori üldine hoiak? Järelda.', 'ajakirjanik ja lugeja vastutavad koos hea ajakirjanduse eest', 'internet on ajakirjanduse lõpp', 'ainult ajakirjanikud on süüdi', 'lugejad ei vaja kohalikku lehte'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }), [
        '(A): „enamik meie lugejaid jõuab uudiseni telefonis … paljud ei ava lugu üldse. Nad loevad pealkirja …”',
        '(B): „klikitakse sellele rohkem ja reklaamiandjad maksavad rohkem”.',
        'Järeldus (C): „Me kõik valime, millele klikime … aitame levitada ka viga.”',
        '(D): „pealkiri peab ütlema sama mis lugu, mitte rohkem”.',
        '(D): „tellijaid tuli juurde, sest inimesed hakkasid meid rohkem usaldama”.',
        'Järeldus (E): „ilma nendeta ei tea kogukond, mis tema ümber toimub”. (Varasemast: kogukond, vabatahtlikud päästjad, volikogu — moodul 14, tund 67.)',
        '(F): „enne kui jagad, loe läbi vähemalt esimene lõik”.',
        'Järeldus (G): „Hea ajakirjandus ja hea lugeja vajavad teineteist … Kui üks neist kaob, kaotame mõlemad.”',
      ]),
      PART('075_t_wpart', 'W', { minutes: 23, points: 18, tasks: 2, note: 'Kirjutamine 1 (5 minutit, 6 punkti): kolm rida 0–2 — samad tingimused nagu mooduli külmas alguses (tund 71). Kirjutamine 2 (umbes 18 minutit, 12 punkti): analüütiline juhend, neli kriteeriumi 0–3. Kontrolli tulemus: lugemine … / 16 + kirjutamine … / 18 = … / 34.' }),
      teach(tag(homeLines(B.writing('075_t_cold', 'Kirjutamine 1: arvamus viie minutiga (6 punkti).', 'Väide: „Mõjuisikud peaksid vastutama selle eest, et nende postitused ei eksitaks jälgijaid.” Kirjuta 5 minutit, 5–7 lauset: seisukoht, põhjus, näide, vastuargument.', [5, 7], [], 0, 'g_use'), 10), { task: 'W14', harno: 'W2b' }),
        'Mooduli paralleelne lõpuülesanne: samad tingimused nagu mooduli külmas alguses tunnis b1b2-071 (5 minutit, 5–7 lauset, fraase ega algust ei ole) ja sama väite tüüp („X peaksid vastutama, et … ei eksitaks”), uus teema samast moodulist (mõjuisikud, tund 73). Hinda kolme rea järgi 0–2 (hindamine all). Võrdle külma alguse lehega: ütle õppijale üks konkreetne areng ja üks järgmine samm.'),
      keepPlace(B.rubric('075_t_rubric', 'Hindamine: kirjutamine 1 (6 punkti).', 'Iga rida 0–2 punkti.', ['Seisukoht esimeses lauses, põhjus ja näide (0–2).', 'Vastuargument ja vastus sellele (0–2).', 'Keel: sidendid (kuigi …, siiski; seetõttu; samas) ja mooduli vormid (tõenäoliselt, väidetavalt, autori sõnul, olevat, makstud, tõendamata, enamik) (0–2).'])),
      tag(homeLines(B.examWriting('075_t_summary', 'Kirjutamine 2: kokkuvõte küsitlusest ja kommentaar (umbes 150 sõna, 12 punkti).', 'Kirjuta 140–160 sõna: esimeses lõigus kokkuvõte, teises oma kommentaar. Algust ei anta.', 'kokkuvõte', {
        situation: 'Kursuse ajaleht küsitles 40 õppijat: „Kust sa uudiseid saad ja kas sa kontrollid neid?” Tulemused: sotsiaalmeediast 24 inimest, uudisportaalist 10, raadiost või telerist 6. Loeb sageli ainult pealkirja: 20 inimest. Kontrollib uudist enne jagamist: 10 inimest. Usaldab kõige rohkem kohalikku lehte: 15 inimest. Kirjuta ajalehele kokkuvõte ja eraldi oma kommentaar.',
        points: ['mida küsiti ja keda', 'kaks-kolm peamist tulemust sõnadega (enamik, pool, iga neljas)', 'mis on üllatav või murettekitav', 'eraldi lõik: minu arvates … ja üks soovitus lugejatele'],
        words: [140, 160],
      }), 12), { task: 'W15', harno: 'W2a' }),
      writingRubric('075_t_wrubric', 'Hindamine: kokkuvõte ja kommentaar (12 punkti).', 'Hinda teksti nelja kriteeriumi järgi (0–3). Mooduli keel on grammatika kriteeriumi osa: kindlus ja hinnang (71: tõenäoliselt, väidetavalt; ilma taas / koguni kokkuvõttes), kelle mõte (72: küsitluse järgi, vastanute sõnul), kesksõnad (73: kontrollimata info), hulk ja osa (74: pool vastanutest, enamik õppijaid saab, iga neljas). Piiripealne näidis (7/12 ≈ 58 %): tulemused on olemas, kuid kommentaar on kokkuvõttega segamini ja „koguni 24 inimest” toob hinnangu kokkuvõttesse (ülesanne 2), lõike ei ole (1), sõnavara piisav (2), „enamik õppijad saavad”, „pool vastanud” (grammatika 2). Kontrolli tulemus = lugemine … / 16 + kirjutamine 1 … / 6 + kirjutamine 2 … / 12.'),
    ],
  },
}), {
  'b1b2-071': 'PROB L→S', 'b1b2-072': 'AVAS R→S', 'b1b2-073': 'KUUL L→W', 'b1b2-074': 'LUGU R→W', 'b1b2-075': 'EKS',
}));

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js). Since v6 the explanations travel with each block (why(block, lines)); this map is empty and
// kept for courseSheet.js withExplanations.
export const EXPLAIN = {};
