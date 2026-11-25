// B1 course (A2 → B1 roadmap), module 12 „Ilm, loodus ja keskkond” (a2b1-056…060), stage A2+/B1- (lessons 041–060).
// Rewritten to methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md, 2026-11-25; strictModulesV5.json) on the
// model of modules 1–11: one real communicative outcome a lesson, one input, ≤ 5 / 4 / 5 blocks a sheet and ≤ 15 a
// lesson, a 75-min core in exactly 4 stations (design v4 „task-based” on the v3 station engine,
// docs/COURSE_DESIGN_STATIONS.md §7); the module control is one sheet (≤ 10 blocks, ≈ 45 min). A2+/B1- stage: text
// 150–220 words, audio ≤ 2.5 min, writing 60–90 words, speech 90–120 s. Inputs alternate: listening (056, 058) and
// reading (057, 059). Every lesson has a written pair task right after its input and a second, free attempt of its
// outcome in Kasuta (both are blocks, so the time estimate counts them — module 11's estimate was 39–50 min).
//   056 infogap „Mis ilm nädalavahetusel tuleb?” — the module's COLD TASK first (90–120 s: weather and my plans, no
//               help), a radio forecast for the weekend (new recording, heard twice, 8 gap sentences), the pair's plan
//               from the forecast, and the language of change: läheb jahedamaks, muutub tuuliseks, jääb soojaks, tõuseb
//               kahekümne kraadini, oodatakse äikest; Harno W1a corner (a hiking club questionnaire). Outcome: a phone
//               call to a friend — which day and what time to go to the bog — with the visual „Nädalavahetuse ilm” and a
//               HIDDEN-INFORMATION card; second attempt: the real forecast of the learner's own town on ilmateenistus.ee
//               (the module's LINK TASK, https://www.ilmateenistus.ee).
//   057 project „Äike tuli varem” — ONE text, a hiker's blog post „Kuidas äike meid rabas kätte sai” (≈ 205 words), the
//               pair's timeline in sentences, and the narrative past: kui / enne kui / pärast seda, kui / samal ajal kui
//               with the verb straight after the clause, oli lubanud. Outcome: a 60–90-word post to a hiking group
//               without a given opening, with the six-picture story „Äike rabas”; the partner then asks about it.
//   058 case    „Pärast tormi” — the morning radio news on a storm (new recording, heard twice, 8 true/false, Harno L4
//               form), the pair's cause-and-result table, and cause and result: tugeva tuule tõttu, sest / kuna,
//               seepärast + verb, nii et. Outcome: a phone call to the insurer who refused part of the damage, with the
//               visual „Kahjuteade” and a hidden-information card; second attempt: the learner's own storm or power cut.
//   059 debate  „Mida 300 euroga teha?” — ONE text, a house forum with three neighbours' proposals (≈ 200 words) as the
//               model of opinion + reason + example, and verb government (nõustuma millega, loobuma millest, osalema
//               millel, hoolitsema mille eest). Outcome: the residents' meeting (Harno S1b) with the visual „Kolm
//               ettepanekut” and a hidden-information card; second attempt: the learner's own house or street.
//   060 EKS     Control 12 = the end of the A2+ stage (one sheet, 10 blocks, four skills): reading 8 p (a trail notice,
//               new), listening 6 p (the radio story on ticks — recording kept, locked), speaking 10 p — task 1 is the
//               PARALLEL NEW TASK of 056's cold task, task 2 a Harno-type phone call to a holiday house with hidden
//               information —, writing 8 p (advice to a friend); thresholds named one way. 060 was the first full mock
//               exam (three sheets, 37 blocks); the owner's plan keeps the mock exams for the B1 stage (080 / 089 / 090).
// The continuing story (Viktor's farm, Muki in the bog, Helgi, the insurer Egle, the Valgevase courtyard) is not used in
// this module: the people of the texts are made up and appear in one lesson only. The previous version — the pilot of the
// v3 „stations” design (owner 2026-11-09, docs/review/b1-m12-pilot.md) — is kept below as PILOT: every block of it that
// is not on a sheet any more is retired (hidden, id and learners' answers kept), and the practice engine
// (practice/engine/extract.js) still builds Harjuta items from its form tasks. Module 12 had no „Mäletad?” cards.
// Owner 2026-11-25: texts adapted to the level, facts need not be real or checked; the statistics opener 056_d_open and
// the „Kas teadsid?” card are off the sheets.
// B1 grammar here (METHODOLOGY_STANDARD §7, grammarPlan.js): the translative of change and the impersonal of forecasts
// (056), the narrative past with kui / enne kui / pärast seda, kui (057), cause and result (058, 'cause'), opinion +
// reason + example and verb government (059).
import { B, hide, tag, teach, why, withShapes } from '../blocks.js';
import { exitCheck, homeTask, purpose, station } from '../stationBlocks.js';

// the examiner's set with its own instruction (B.examiner's default wording is shared by every module: finalShape V7)
const withInstruction = (b, instruction) => ({ ...b, data: { ...b.data, instruction } });

export const MODULE = { id: 'a2b1-module-12', course: 'b1', title: 'Ilm, loodus ja keskkond', level: 'B1-', design: 'v3-stations', template: 'v4' };

// the lesson's grammar as the small subtitle under the title on every sheet
const grammar = (text) => ({
  discover: { label: '1 Avasta', slot: 1, subtitle: text },
  practice: { label: '2 Harjuta', slot: 2, subtitle: text },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: text },
});
// the home task card at the end of every lesson
const homework = (id, items) => B.phrasebank(id, [['Kodutöö', items]]);
const WORDS_HOME = 'Tunni sõnad: Harjuta → Sõnad (moodul 12). Korda neid seal iga päev paar minutit.';
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// one line for every block taken off the sheets by the v5 rewrite
const V5_CUT = 'v5 (2026-11-25): lehelt maha — tunni eelarve, üks sisend, tegelased, eksamirubriik ainult kontrollis';
const V5_DRILL = 'v5 (2026-11-25): drill Harjutasse — lehelt maha, ülesanded jäävad Harjuta harjutusteks';
const V5_MOCK = 'v5 (2026-11-25): täispikk proovieksam asendati ühe lehe kontrolliga (A2+ astme lõpp); proovieksamid on 080 / 089 / 090';
// a block beside another one on the page (two columns)
const half = (block) => ({ ...block, width: 'half', span: 6 });
// a recording in a lesson: heard twice (G6)
const twice = (block) => ({ ...block, data: { ...block.data, plays: 2 } });
// a recording in the control: heard twice and locked (G6)
const locked = (block) => ({ ...block, data: { ...block.data, plays: 2, lockPlays: true } });
// a writing form of n ruled lines: the picture stands directly above the task and both fit on one page
const rows = (block, n) => ({ ...block, data: { ...block.data, lines: n } });
// a made-up text or recording names its source like the readings („Allikas: KeeleSepa õppetekst”)
const ownText = (block) => ({ ...block, data: { ...block.data, source: 'KeeleSepa õppetekst' } });
// the thresholds, named one way everywhere (§2.9)
const THRESHOLDS = 'Harno: eksam on sooritatud alates 60 %-st. KeeleSepp: eksamiks valmis alates 70 %-st, meie sertifikaat alates 80 %-st (sisemine lävi).';

// ======================================================================== the pilot (design v3 „stations”, 2026-11-09)
// Kept for its ids: the blocks that are not on the v5 sheets are retired from here (retire(id, why) below).
const PILOT = {
  'a2b1-056': {
    title: 'Ilm muudab plaani',
    canDo: 'Ma kuulan raadio ilmateadet ja kirjutan pere vestlusesse 50–70-sõnalise teate, millal me ilma tõttu matkale läheme ja miks.',
    teacherPage: {
      goal: 'Ученик понимает на слух прогноз погоды (цифры, время, изменения) и письменно принимает решение, когда идти в поход, с обоснованием.',
      core: [2, 4, 5], alt: 3,
      short: 'Станция 2 (10 мин: прослушать один раз, заполнить пропуски) → станция 5 (15 мин). Станции 1, 3 и 4 — дома или на следующем уроке.',
      errors: [
        '«läheb jahe» вместо «läheb jahedaks» / «läheb jahedamaks» (изменение = транслатив -ks).',
        '«tõuseb kakskümmend kraadi» вместо «tõuseb kahekümne kraadini» (до какого градуса = терминатив -ni от родительного падежа).',
        '«oodatakse äike» вместо «oodatakse äikest» (безличная форма с партитивом).',
        '«kakskümmend kraadi soe» вместо «kakskümmend kraadi sooja».',
      ],
      notes: ['Станции независимы: каждая начинается со своего входного материала, порядок можно менять.', 'Финальное решение должно опираться на график (гроза 15–18, тени нет), а не на «мне так нравится».'],
    },
    discover: [
      station(B.topicOpener('056_d_open', 'Teema avaleht: ilm ja loodus Eestis', [
        'Eestis on neli aastaaega, aga ilm võib muutuda väga kiiresti. Meri teeb talve pehmemaks ja suve jahedamaks kui kaugel mandri sees. Ilmateateid ja ohuhoiatusi annab Keskkonnaagentuur, nende leht on ilmateenistus.ee.',
        'Keskkonnaagentuuri kliimanormi järgi on kõige soojem kuu juuli ja kõige külmem veebruar. Kliima on läinud soojemaks: viimase kolmekümne aasta keskmine temperatuur on üle ühe kraadi kõrgem kui varasemal ajal. Aastas sajab kõige rohkem augustis. Eesti soojarekord on Võrust: 11. augustil 1992 oli seal 35,6 kraadi sooja.',
        'Suvel on päevad väga pikad. Jaanipäeva paiku on Tallinnas valge üle 18 tunni ja ööd jäävad hämaraks: need on valged ööd. Detsembris kestab päev ainult umbes kuus tundi. Suvel tuleb tihti äikest, kõige rohkem juulis ja augustis, ja kõige sagedamini müristab Kagu-Eestis.',
        'Metsa all on üle poole Eesti maast. Eesti looduse eriline osa on sood ja rabad. Soomaa rahvuspargis tuleb igal kevadel suur üleujutus, mida nimetatakse viiendaks aastaajaks: siis liiguvad kohalikud paadiga. Rabades kasvavad jõhvikad ja murakad ning laudteed viivad matkaja üle märja sambla. Paljud matkarajad ja laudteed on rajanud riigimetsa haldaja RMK, nende kaardid leiab lehelt loodusegakoos.ee.',
        'Selles moodulis otsustad ilmateate järgi, millal matkale minna, jutustad äikesest rabas, seletad, mida torm kaasa tõi, ja lepid naabritega kokku ühe rohelise hooviprojekti. Mooduli lõpus teed esimese täispika proovieksami ja näed, milline eksami osa vajab veel kõige rohkem harjutamist.',
      ], 'Keskkonnaagentuur, ilmateenistus.ee: kliimanormid 1991–2020 ja kliimarekordid; R. Parg, „Tähelepanekuid uutest kliimanormidest” (Keskkonnaagentuur, 2021); Timeanddate, Tallinna päikesetõusu ja -loojangu tabel (2026); ERR, „Metsainventuur: Eesti metsa juurdekasv on aeglustunud” (10.6.2024); Keskkonnaagentuur, M. Kivisild, „Äikeseanalüüs 2023”; Wikipedia, „Soomaa National Park”; RMK', [
        'Mis sind Eesti ilmas kõige rohkem üllatas või võiks üllatada?',
        'Kuidas valged ööd ja pimedad talvepäevad sinu und või tuju mõjutavad?',
        'Kas sinu arvates on kliima muutumist Eestis juba näha? Mille järgi?',
        'Kuidas erineb suvi riigis, mida sa hästi tead, Eesti suvest?',
      ]), 1, 12),
      purpose(B.truefalse('056_d_notes', 'Kolleegi märkmed.', 'Loe avalehte. Kas kolleegi märge on õige või vale?', [
        ['Eestis on kõige külmem kuu jaanuar, sest siis on päevad kõige lühemad.', false],
        ['Meri teeb Eesti suve jahedamaks kui kaugel mandri sees.', true],
        ['Jaanipäeva ajal on Tallinnas valge rohkem kui kaheksateist tundi.', true],
        ['Detsembris on Tallinnas valge ainult umbes kuus tundi päevas.', true],
        ['Viimase kolmekümne aasta jooksul on Eesti kliima läinud külmemaks.', false],
        ['Kõige rohkem äikest on Eestis tavaliselt kevadel ja sügisel.', false],
        ['Ohuhoiatusi ja ilmateateid leiab Keskkonnaagentuuri lehelt ilmateenistus.ee.', true],
      ], 'full'), 'Sinu uus kolleeg kolis Tallinnasse ja kirjutas üles, mida ta Eesti ilmast kuulis. Kontrolli tema märkmeid, et ta ei valmistuks valeks ilmaks.'),
      teach(tag(purpose(B.speaking('056_d_colleague', 'Mida uus kolleeg peab teadma?', 'Õpetaja on uus kolleeg. Vasta tema küsimustele kolm minutit järjest ilma pikkade pausideta, ütle oma arvamus ja põhjenda seda.', [
        'Milline aastaaeg on Eestis kõige ilusam ja miks?',
        'Mida peaks uus inimene esimeseks talveks ostma?',
        'Kas valged ööd on sinu arvates pigem pluss või miinus?',
        'Kuhu tasub suvel minna, kui linnas on liiga palav?',
        'Mis on Eesti ilmas sinu meelest kõige raskem?',
      ], [180, 240], ['Minu arvates…, sest…', 'Talvel läheb vara pimedaks, seepärast…', 'Kindlasti osta…']), 'Sinu uus kolleeg kolis Tallinnasse soojemast riigist ja küsib lõunapausil nõu. Tulemus: ta teab, mida osta ja mida oodata.'), { task: 'S13', fluency: true }),
        'Üks-ühele: õpetaja on uus kolleeg (näiteks Hispaaniast) ja küsib päriselt edasi: „Aga miks?”, „Kas see on kallis?”, „Kus seda osta?”. Lõpus ütleb õpetaja, mida ta otsustas osta, ja õpilane kontrollib, kas see on mõistlik.'),
      station(tag(purpose(B.listening('056_d_radio', 'Ilmateade enne jaanipäeva.', 'Kuula ilmateadet kaks korda ja kirjuta igasse lünka number või kellaaeg.', [
        'Sünoptik: Tere hommikust! Jaanilaupäeva hommik on kogu Eestis veel palav ja päikeseline, sooja on kakskümmend kuus kraadi.',
        'Sünoptik: Keskpäeval jõuab läänest jahedam õhk. Kesk-Eestis algavad hoovihmad ja äike umbes kell kolm pärastlõunal ja kestavad kella kuueni.',
        'Sünoptik: Äikese ajal tugevneb tuul puhanguti kaheksateistkümne meetrini sekundis ja kohati sajab rahet.',
        'Sünoptik: Õhtuks läheb märgatavalt jahedamaks: kella kümne paiku on sooja ainult viisteist kraadi. Jaanitule ääres kulub ära soe kampsun.',
        'Sünoptik: Metsades on endiselt suur tuleoht, sest kolm nädalat ei ole korralikult sadanud. Grillida võib ainult selleks ette nähtud kohtades.',
        'Sünoptik: Jaanipäeval on vahelduva pilvisusega ja tuuline ilm, sooja kuni kaheksateist kraadi. Järgmine ilmateade tuleb kell kaksteist.',
      ], [
        'Jaanilaupäeva hommikul on sooja [26|kakskümmend kuus] kraadi.',
        'Kesk-Eestis algab äike umbes kell [kolm|3|15] pärastlõunal.',
        'Hoovihmad ja äike lõpevad umbes kell [kuus|6|18].',
        'Tuulepuhangud on äikese ajal kuni [18|kaheksateist] meetrit sekundis.',
        'Õhtul kell kümme on sooja ainult [15|viisteist] kraadi.',
        'Grillida võib ainult selleks ette nähtud kohtades, sest metsas on suur [tuleoht].',
        'Järgmine ilmateade tuleb kell [12|kaksteist].',
      ]), 'Pere sõidab jaanipäevaks maale ja küsib sinult, mis ilm tuleb. Kirjuta raadiost üles numbrid ja kellaajad, et saaksid neile täpselt vastata.'), { task: 'L10' }), 2, 12),
      tag(B.vocab('056_d_vocab', 'Tunni sõnad.', ['ilmateade — прогноз погоды', 'palav — жаркий', 'jahe — прохладный', 'äike — гроза', 'välk — молния', 'pilvine — облачный', 'tuul — ветер', 'niiske — влажный', 'kraad — градус', 'temperatuur — температура', 'hoiatus — предупреждение', 'muutuma — меняться']), {}),
      B.notice('056_d_notice', 'Märka: kuidas ilm muutub', [
        'Ilm **läheb** **jahedamaks** / **soojemaks** · taevas **läheb** **pilviseks** · õhtuks **läheb** **pimedaks**.',
        'Ilm **muutub** **tuuliseks** · ilm **jääb** **soojaks** · lõpus on **-ks** (saav kääne, moodul 7: jäin haigeks).',
        'Ilmateates: **oodatakse** äikest · **soovitatakse** võtta vihmajope · temperatuur **tõuseb** / **langeb** **viieteistkümne kraadini**.',
        'Kakskümmend kraadi **sooja** · kaks kraadi **külma** · tuul **kümme meetrit sekundis**.',
      ], 'full'),
    ],
    practice: [
      station(purpose(B.transformation('056_p_notes', 'Meteoroloogi märkmetest raadiolauseks.', 'Kirjuta iga märge täislauseks antud sõnaga, nii nagu raadios öeldakse.', [
        ['hommikul kaksteist kraadi, õhtuks juba kakskümmend kraadi', 'tõuseb', 'Õhtuks tõuseb temperatuur kahekümne kraadini.|Temperatuur tõuseb õhtuks kahekümne kraadini.'],
        ['pärastlõunal tuleb palju pilvi, päikest enam ei näe', 'läheb', 'Pärastlõunal läheb taevas pilviseks.|Pärastlõunaks läheb taevas pilviseks.'],
        ['õhtul on õhk palju jahedam kui päeval', 'läheb', 'Õhtul läheb jahedamaks.|Õhtuks läheb jahedamaks.|Õhtul läheb palju jahedamaks.|Õhtuks läheb palju jahedamaks.'],
        ['öösel tugev tuul saartel, meteoroloogid ootavad seda', 'oodatakse', 'Öösel oodatakse saartel tugevat tuult.|Saartel oodatakse öösel tugevat tuult.'],
        ['ilmateenistus: autojuhid peavad sõitma aeglasemalt', 'soovitatakse', 'Autojuhtidel soovitatakse sõita aeglasemalt.'],
        ['homme tugevneb tuul ja ilm ei ole enam vaikne', 'muutub', 'Homme muutub ilm tuuliseks.|Ilm muutub homme tuuliseks.'],
      ]), 'Sa oled kohaliku raadio suvepraktikant. Meteoroloog jättis lühikesed märkmed, sina kirjutad neist laused, mida diktor kell kaksteist ette loeb.'), 3, 10),
      tag(purpose(B.writing('056_p_reply', 'Vastus kuulaja kirjale.', 'Kuulaja küsib: „Kas laupäeval saab lastega Pirita rannas olla?” Vasta märkmete põhjal 5–7 lausega ja anna üks nõuanne. Kasuta vähemalt kahte muutuse vormi (läheb …-ks, muutub …-ks).', [5, 7], ['läheb', 'muutub', 'soovitan'], 2), 'Raadio veebilehele tuli kuulaja kiri. Praktikandina vastad sina, et pere saaks oma laupäeva plaanida.'), { task: 'W08', level: 3 }),
      station(teach(tag(purpose(B.examListen('056_p_radio', 'Eksaminurk: raadiosaade kuumusest ja äikesest (Harno B1 kuulamine 2)', 'Kuula saadet kaks korda. Vali igale küsimusele kolmest vastusest üks.', 'choice', [
        'Saatejuht: Tere, head kuulajad! Stuudios on päästja Kristi Laur. Kristi, nädala lõpuks lubatakse jälle palavat ilma ja äikest. Mida peaks inimene kõigepealt meeles pidama?',
        'Kristi: Palava ilmaga tuleb juua palju vett, ka siis, kui janu ei ole. Kella kaheteistkümne ja nelja vahel on päike kõige tugevam. Siis tasub olla varjus ja poes käia hommikul või õhtul.',
        'Saatejuht: Igal suvel räägitakse ka autodest.',
        'Kristi: Jah. Ärge jätke last ega koera palava ilmaga autosse, ka mitte viieks minutiks. Päikese käes läheb auto sees väga kiiresti kuumaks.',
        'Saatejuht: Aga äike? Kuidas aru saada, kui lähedal see on?',
        'Kristi: Kui välk lööb, lugege sekundeid kuni müristamiseni. Kolm sekundit on umbes üks kilomeeter. Kui vahe on alla kolmekümne sekundi, minge kohe varju.',
        'Saatejuht: Kus on kõige ohutum olla?',
        'Kristi: Majas või autos. Looduses ärge seiske üksiku puu all ega lagedal väljal. Veest tuleb kohe välja tulla, sest vesi juhib elektrit.',
        'Saatejuht: Ja millal võib jälle õue minna?',
        'Kristi: Oodake pool tundi pärast viimast müristamist. Äike võib tunduda möödas olevat, aga see võib tagasi tulla.',
        'Saatejuht: Aitäh, Kristi! Järgmises saates räägime sellest, kuidas valmistuda pikaks elektrikatkestuseks.',
      ], [
        ['Millal tuleb Kristi sõnul palava ilmaga vett juua?', 'ka siis, kui janu ei ole', 'ainult siis, kui on janu', 'ainult õhtul'],
        ['Millal on päike kõige tugevam?', 'kella kaheteistkümne ja nelja vahel', 'hommikul enne kümmet', 'õhtul pärast kuut'],
        ['Mida ei tohi palava ilmaga teha?', 'jätta koera autosse', 'käia õhtul poes', 'olla varjus'],
        ['Välgu ja müristamise vahe on üheksa sekundit. Kui kaugel on äike?', 'umbes kolme kilomeetri kaugusel', 'umbes üheksa kilomeetri kaugusel', 'äike on juba möödas'],
        ['Miks tuleb äikese ajal veest välja tulla?', 'vesi juhib elektrit', 'vesi läheb külmaks', 'vihm teeb vee mudaseks'],
        ['Millest räägitakse järgmises saates?', 'pikast elektrikatkestusest', 'kuumast ilmast linnas', 'äikesest mägedes'],
      ]), 'Harjutad Harno B1 kuulamise 2. osa: kuulad raadiosaadet nagu eksamil. Tulemus näitab, kas saad kuuest küsimusest vähemalt viis õigesti.'), { harno: 'L2' }),
      'Eksaminurk (Harno B1 kuulamine 2). Eksamil on üks raadiolugu ja kuus küsimust kolme vastusega. Strateegia: 1) loe enne kuulamist küsimused ja jooni alla võtmesõnad; 2) esimesel kuulamisel märgi, teisel kontrolli; 3) õige vastus ütleb sama mõtte teiste sõnadega. Küsimus 4 nõuab arvutamist (9 : 3 = 3 km) — see on eksamil tavaline lõks.'), 4, 12),
    ],
    transfer: [
      station(B.text('056_t_sit', 'Otsus: millal rappa?', 'Pere on jaanipäeval onu Viktori talus Kõrvemaal. Viktor tahab kõik viia rabamatkale: laudtee on neli kilomeetrit pikk ja matk kestab umbes kolm tundi. Rabas ei ole katust ega varju. Kaasa tulevad ka seitsmeaastane Mia ja vanaema Helgi. Viktor küsib sinult: mis kell minna? Vaata ilmaäppi, arutage Viktoriga ja kirjuta pere vestlusesse otsus.'), 5, 15, { final: 'decide' }),
      B.chart('056_t_app', 'Viktori ilmaäpp: Kõrvemaa, jaanipäev', { kind: 'bar', series: ['Temperatuur (kraadi)', 'Vihma võimalus (protsenti)'], rows: ['6–9 | 14 | 10', '9–12 | 18 | 10', '12–15 | 21 | 40', '15–18 | 19 | 80', '18–21 | 16 | 30'] }),
      teach(purpose(B.rolecards('056_t_talk', 'Viktor tahab minna pärastlõunal.', 'Sina vaatad äppi, õpetaja on onu Viktor. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: matk kestab umbes kolm tundi, rabas ei ole katust ega varju, kaasas on Mia ja vanaema Helgi.\nSinu eesmärk: leppida Viktoriga kokku matka aeg, mil keegi ei jää rabas äikese kätte.\nPiirang: sina tead ainult seda, mida näitab äpp; Viktori plaane sa ei tea.',
        'Viktori kaart on õpetajal: Viktoril on oma plaanid ja oma põhjused. Kuula, küsi ja leia kompromiss.',
        ['Äpi järgi läheb pärastlõunal…', 'Kella kolme paiku oodatakse…', 'Aga kui me läheme…?'], ['Hommikul ma niidan…', 'Hea küll, kui…', 'Lepime kokku, et…']), 'Viktor tahab minna pärastlõunal ja küsib sinu arvamust. Sina tead, mida äpp näitab, ja pead leidma aja, mil keegi ei jää rabas äikese kätte.'),
      'Üks-ühele, õpetaja kaart (Viktor). Varjatud info: hommikul kella kümneni niidad heina ja tahad minna kell üks; kahe kilomeetri pärast on vaatetorn, aga katust seal ei ole; Helgi kõnnib aeglaselt. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) „Hommikul ma ei saa, hein on vaja enne vihma ära niita!”; 2) „Need äpid eksivad niikuinii.”; 3) kui õpilane pakub kella 10.30: „Helgiga ei jõua me kolme tunniga tagasi.” Õnnestunud, kui: lepitakse kokku aeg (või lühem ring), mis lõpeb enne kella kolme, õpilane põhjendab seda äpi andmetega (äike 15–18, vihma võimalus 80) ja ütleb otsuse ühe lausega.'),
      tag(purpose(B.examWriting('056_t_message', 'Teade pere vestlusesse.', 'Kirjuta 50–70 sõnaga. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Pere vestlusgrupp „Jaanipäev Viktori juures”. Kõik ootavad otsust.',
        points: ['mis kell matk algab ja kus kohtutakse', 'miks just siis (ilm)', 'mida kaasa võtta', 'mis saab, kui ilm muutub'],
        words: [50, 70],
      }), 'Pere ootab otsust. Kirjuta vestlusesse teade, mille järgi igaüks teab, mis kell minna, miks just siis ja mida kaasa võtta.'), { main: true, level: 4 }),
    ],
  },

  'a2b1-057': {
    title: 'Äike rabas',
    canDo: 'Ma loen lühikesi tekste rabast, jutustan kui-lausetega, mis juhtus, ja kirjutan küla gruppi 70–90-sõnalise postituse, kuidas Muki kadus.',
    teacherPage: {
      goal: 'Ученик рассказывает о событиях в правильном порядке (kui, enne kui, pärast seda, kui; прошедшее время) и пишет понятное объявление о пропавшей собаке.',
      core: [2, 4, 5], alt: 1,
      short: 'Станция 2 (только задание с хронологией и 1 мин рассказа) → станция 5 (сразу пост, без обсуждения мест поиска).',
      errors: [
        '«Kui välk lõi, Viktor hakkas lugema» вместо «Kui välk lõi, hakkas Viktor lugema» (после придаточного глагол главного предложения сразу).',
        '«enne kui äike tuli» путают с «enne äikest» — оба верны, но после «enne kui» нужен глагол.',
        'Плюсквамперфект: «äike tuli varem, kui raadio lubas» → лучше «oli lubanud» (то, что было раньше).',
        '«läksime rabas» вместо «läksime rappa» (куда? — rappa).',
      ],
      notes: ['Таймлайн Виктора (станция 2) и пост (станция 5) независимы: на карточке станции 5 есть все факты.', 'Ранжирование мест поиска — настоящая задача: на всё есть два часа до темноты, успеть можно три места.'],
    },
    discover: [
      station(teach(tag(purpose(B.reading('057_d_bog', 'Eksaminurk: mis on raba? (Harno B1 lugemine 2)', 'Loe teksti ja vasta küsimustele lühidalt oma sõnadega.', 'Raba — looduse aeglane mälu', [
        'Raba on soo, mis saab vett ainult vihmast ja lumest. Seepärast on rabas vähe toitaineid ja seal kasvavad vaid vähesed taimed: turbasammal, väikesed männid, kanarbik, jõhvikad ja murakad. Turbasammal hoiab vett nagu suur käsn. Rabas pesitseb ka sookurg.',
        '',
        'Kui sammal sureb, ei lagune see märjas rabas lõpuni. Nii tekib turvas. Turbakiht kasvab umbes ühe millimeetri aastas, nii et meetri paksune kiht tekib umbes tuhande aastaga. Turbas säilib ka väga vana õietolm, mille järgi teadlased uurivad, milline oli kliima tuhandeid aastaid tagasi.',
        '',
        'Rabas tasub liikuda laudteel: see kaitseb pehmet sammalt ja ka matkajat, kelle jalg võib märga turbasse vajuda. Raba on täiesti lage. Kui tuleb äike, on inimene seal kõige kõrgem koht, seepärast tuleb taevast jälgida ja õigel ajal tagasi pöörduda.',
        '',
        'Allikas: Vikipeedia („Raba”, „Turvas”, „Eesti sood”); Päästeamet, äikese ohutusnõuanded.',
      ], [
        ['Kust saab raba vett?', 'ainult vihmast ja lumest|vihmast ja lumest|sademetest'],
        ['Miks kasvab rabas vähe taimi?', 'rabas on vähe toitaineid|vähe toitaineid'],
        ['Turbakiht on 30 sentimeetrit paks. Umbes kui vana see on?', 'umbes 300 aastat|300 aastat|kolmsada aastat|umbes kolmsada aastat'],
        ['Keda ja mida laudtee kaitseb?', 'sammalt ja matkajat|pehmet sammalt ja matkajat|matkajat ja sammalt'],
        ['Miks on äikese ajal rabas ohtlik?', 'raba on lage ja inimene on seal kõige kõrgem koht|inimene on kõige kõrgem koht|rabas ei ole varju'],
      ]), 'Sinu sõber tahab lastega esimest korda rappa minna ja küsib, mida seal teadma peab. Leia vastused, et saaksid talle selgitada — nii nagu eksami lugemisosas.'), { voice: 'popsci', harno: 'R2' }),
      'Eksaminurk (Harno B1 lugemine 2, artikkel). Eksamil on tekst pikem ja küsimustel kolm vastusevarianti; siin vastad oma sõnadega, sest nii on näha, kas said mõttest aru. Strateegia: loe kõigepealt küsimused, leia lõik, kus vastus on, ja ütle see oma sõnadega. Küsimus 3 nõuab arvutamist (30 cm ≈ 300 aastat).'), 1, 12),
      tag(B.vocab('057_d_vocab', 'Tunni sõnad.', ['raba — болото (верховое)', 'laudtee — деревянный настил', 'vaatetorn — смотровая башня', 'äike — гроза', 'kartma — бояться', 'leidma — находить', 'müristama — греметь', 'kiirustama — спешить', 'kukkuma — падать', 'märg — мокрый', 'kaduma — пропадать', 'otsima — искать']), { topic: ['laudtee', 'vaatetorn'] }),
      teach(tag(purpose(B.speaking('057_d_opinion', 'Raba: kaitsta või kasutada?', 'Õpetaja on ajakirjanik. Vasta tema küsimustele ja põhjenda oma arvamust.', [
        'Kas rabasid tuleks pigem kaitsta või kasutada, näiteks turba jaoks? Miks?',
        'Kas sa oled kunagi rabas või metsas matkal käinud? Mis sulle meeldis või ei meeldinud?',
        'Kas marjade korjamine kaitsealal peaks olema lubatud?',
        'Mis on sinu arvates parem: laudtee või metsik loodus ilma radadeta?',
      ], [90, 150], ['Minu arvates tuleks…, sest…', 'Teisest küljest…', 'Näiteks…']), 'Kohalik ajaleht kirjutab, kas lubada rabas turba kaevandamist, ja küsib elanike arvamust. Ajakirjanik paneb sinu vastuse lehte.'), { task: 'S02' }),
        'Üks-ühele: õpetaja on ajakirjanik, kirjutab vastuse üles ja loeb lõpus ette ühe lause „tsitaadina”. Õpilane kontrollib, kas see on täpne, ja parandab, kui ajakirjanik sai valesti aru.'),
      station(purpose(B.diagram('057_d_time', 'timeline', {
        title: 'Viktori märkmed: jaanipäev rabas',
        instruction: 'Kirjuta sulgudes olev tegusõna lihtminevikku.',
        nodes: '10.00 | Pere [lahkus] talust. (lahkuma)\n12.30 | Me [jõudsime] laudteele. (jõudma)\n13.00 | Oskar [ronis] vaatetorni. (ronima)\n13.05 | Välk [lõi], müristas 12 sekundi pärast. (lööma)\n13.10 | Hakkas sadama, me [kiirustasime] tagasi. (kiirustama)\n13.20 | Mia kummik [kukkus] sambla sisse. (kukkuma)\n13.40 | Metsa servas me [märkasime], et Muki on kadunud. (märkama)',
      }, 'full', 'g_notice'), 'Viktor kirjutas telefoni märkmed, et hiljem metsavahile täpselt öelda, mis juhtus. Tee märkmed korda: pane tegusõnad minevikku.'), 2, 12),
      B.notice('057_d_notice', 'Märka: kuidas lugu edasi viia', [
        '**Kui** välk lõi, **hakkas** Viktor sekundeid lugema. (pärast kui-lauset tuleb pealauses kohe tegusõna)',
        '**Enne kui** äike tuli, **jõudsid** nad vaatetorni juurde. · **Pärast seda, kui** hakkas sadama, **kiirustasid** nad tagasi.',
        '**Samal ajal kui** ema Miat aitas, **kukkus** kummik sambla sisse.',
        'Mis oli juba enne juhtunud? Äike tuli varem, kui raadio **oli lubanud**. (enneminevik, moodul 10)',
      ], 'full'),
      teach(tag(purpose(B.speaking('057_d_helgi', 'Vanaema helistab.', 'Õpetaja on vanaema Helgi. Jutusta märkmete järgi kolm minutit, mis juhtus. Kasuta vähemalt kolme lauset sõnadega kui, enne kui või pärast seda, kui.', [
        'Kuhu te läksite ja millal?',
        'Mis juhtus, kui välk lõi?',
        'Kas keegi sai viga?',
        'Mis Mukiga juhtus?',
      ], [180, 240], ['Kõigepealt…', 'Kui välk lõi, …', 'Pärast seda, kui…']), 'Vanaema Helgi ei olnud rabas ja on mures. Jutusta talle nii, et ta saab aru, kas keegi on viga saanud ja mis on Mukist teada.'), { task: 'S07', fluency: true }),
        'Üks-ühele: õpetaja on Helgi, katkestab vahel ja küsib „Oota, kas see oli enne või pärast vihma?”. Õpetaja loeb kokku kui-, enne kui- ja pärast seda, kui -laused ning ütleb lõpus, mitu oli õiges sõnajärjes.'),
    ],
    practice: [
      station(teach(purpose(B.adsmatch('057_p_board', 'Matkaraja infotahvel', 'Loe teateid A–F ja olukordi. Kirjuta iga olukorra juurde sobiva teate täht. Üks teade jääb üle.', [
        ['Laudtee remont', 'Raba laudtee teine kilomeeter on 1.–20. juulini remondis. Ringi saab minna metsarada pidi, see on 800 meetrit pikem.'],
        ['Lõkkekoht', 'Lõket võib teha ainult järve ääres lõkkekohas. Suure tuleohu ajal on lõkke tegemine keelatud kõikjal.'],
        ['Koeraga matkajale', 'Koer peab kogu rajal olema rihma otsas. Rabas pesitsevad linnud ja koer võib neid häirida.'],
        ['Vaatetorn', 'Äikese ajal ei tohi vaatetorni ronida. Tornis võib korraga olla kuni kümme inimest.'],
        ['Matk giidiga', 'Laupäeviti kell 10 algab parklast kahetunnine matk giidiga. Osalemine on tasuta, registreeru ette.'],
        ['Joogivesi', 'Rajal joogivett ei ole. Lähim pood on Aegviidus, seitsme kilomeetri kaugusel.'],
      ], [
        ['Marju tahab õhtul järve ääres vorste grillida, aga raadio ütles, et metsas on suur tuleoht.', 'B'],
        ['Toomas tahab minna rappa koos oma koeraga.', 'C'],
        ['Lapsed tahavad raba ülevalt näha, aga läänest tuleb tume pilv.', 'D'],
        ['Pille tahab rabast rohkem teada ja ei taha üksi minna.', 'E'],
        ['Kaks sõpra tahavad 10. juulil kogu laudtee läbi käia.', 'A'],
      ]), 'Matkajad küsivad infopunktis, mida nad oma plaaniga tegema peavad. Leia igale matkajale teade, mis tema küsimusele vastab (Harno B1 lugemise 1. osa vorm).'),
      'Harno B1 lugemise 1. osa vormis harjutus. Eksamil on teateid rohkem kui olukordi. Strateegia: loe kõigepealt olukorrad ja jooni alla, mida inimene tahab; siis otsi teatest sama mõtet teiste sõnadega. Üks-ühele: pärast vastamist küsib õpetaja iga vastuse kohta „Mis sõna teates sind aitas?”.'), 3, 10),
      station(purpose(B.transformation('057_p_join', 'Oskari häälsõnum tekstiks.', 'Ühenda kaks lauset üheks antud sõnaga. Pane tähele, kus on tegusõna.', [
        ['Välk lõi. Viktor hakkas kohe sekundeid lugema.', 'kui', 'Kui välk lõi, hakkas Viktor kohe sekundeid lugema.'],
        ['Me jõudsime vaatetorni juurde. Siis tuli äike.', 'enne kui', 'Me jõudsime vaatetorni juurde, enne kui äike tuli.|Enne kui äike tuli, jõudsime me vaatetorni juurde.|Enne kui äike tuli, jõudsime vaatetorni juurde.'],
        ['Hakkas tugevasti sadama. Me kiirustasime metsa poole.', 'pärast seda, kui', 'Pärast seda, kui hakkas tugevasti sadama, kiirustasime me metsa poole.|Pärast seda, kui hakkas tugevasti sadama, kiirustasime metsa poole.'],
        ['Ema aitas Miat. Samal ajal kukkus kummik sambla sisse.', 'samal ajal kui', 'Samal ajal kui ema Miat aitas, kukkus kummik sambla sisse.'],
        ['Me jõudsime metsa servale. Me märkasime, et Muki on kadunud.', 'kui', 'Kui me metsa servale jõudsime, märkasime, et Muki on kadunud.|Kui jõudsime metsa servale, märkasime, et Muki on kadunud.|Kui me jõudsime metsa servale, märkasime, et Muki on kadunud.'],
        ['Raadio lubas äikest alles kella kolme paiku. Äike tuli kaks tundi varem.', 'oli lubanud', 'Äike tuli kaks tundi varem, kui raadio oli lubanud.'],
      ]), 'Oskar dikteeris telefonile sõnumi klassi vestlusesse, aga telefon tegi sellest lühikesed katkised laused. Aita tal teha kahest lausest üks selge lause.'), 4, 8),
    ],
    transfer: [
      station(B.text('057_t_sit', 'Muki on kadunud', 'On jaanipäeva pärastlõuna. Äikese ajal kadus rabas Muki: väike pruun koer, punane kaelarihm, sildil omaniku number. Viimati nähti teda kell 13.20 Kõrve raba laudtee teise kilomeetri juures, kui hakkas tugevasti sadama. Muki kardab äikest ja ilutulestikku. Pere on otsinud kaks tundi. Naaber Ülo elab raba ääres ja tuli appi. Pärast arutelu kirjutab Oskar küla gruppi „Kõrvemaa elanikud”.'), 5, 15, { final: 'explain' }),
      teach(tag(purpose(B.ideaCard('057_t_search', 'Kust Mukit otsida?', 'Õpetaja on naaber Ülo. Arutage kuut kohta ja pange need järjekorda: kust kõigepealt, kust hiljem. Põhjendage.', 'Pimedani on kaks tundi. Selle ajaga jõuab läbi käia ainult kolm kohta.', [
        'laudtee teine kilomeeter, kus Muki kadus',
        'vana heinaküün metsa servas, kus on kuiv',
        'Kõrve järve rand',
        'Viktori talu: koer võib ise koju joosta',
        'maantee bussipeatus',
        'Ülo koera kuut naabritalus',
      ], 'kolm kohta õiges järjekorras ja kes kuhu läheb'), 'Naaber Ülo tunneb raba ümbrust ja tuli appi. Enne pimedat jõuab läbi käia ainult kolm kohta, seega peate otsustama, kust kõigepealt otsida.'), { task: 'S12', level: 4 }),
        'Üks-ühele, õpetaja kaart (Ülo). Varjatud info: äikest kartev koer otsib kuiva ja varjulist kohta; kell pool kolm nägi Ülo naine väikest pruuni koera heinaküüni juures (ütle ainult siis, kui õpilane küsib, kas keegi on Mukit näinud). Takistused: 1) Ülo tahab kõigepealt minna järve äärde („koerad armastavad vett”); 2) „Bussipeatus on mõttetu, sinna koer ei lähe.”; 3) „Mul on aega ainult tund.” Õnnestunud, kui: kolm kohta on järjekorras, heinaküün on esimeste seas, iga valik on põhjendatud ja on selge, kes kuhu läheb; õpilane ütleb plaani kolme lausega (kõigepealt…, siis…, kui…).'),
      tag(purpose(B.examWriting('057_t_post', 'Postitus küla gruppi.', 'Kirjuta 70–90 sõnaga. Kirjuta kõigist neljast punktist ja kasuta vähemalt kahte lauset sõnadega kui, enne kui või pärast seda, kui.', 'jutt', {
        situation: 'Küla grupp „Kõrvemaa elanikud”. Pealkiri: „Muki kadus äikese ajal rabas”.',
        points: ['mis juhtus ja millal', 'kus Mukit viimati nähti', 'milline Muki välja näeb ja mida ta kardab', 'mida teha, kui keegi ta leiab'],
        words: [70, 90], opening: 'Tere, head naabrid!', closing: 'Aitäh! Oskar',
      }), 'Küla inimesed ei tea Mukist midagi. Kirjuta postitus, mille järgi igaüks tunneb Muki ära, teab, kus ja millal ta kadus, ja oskab teada anda.'), { main: true, task: 'W05' }),
    ],
  },

  'a2b1-058': {
    title: 'Torm: miks ja mis siis?',
    canDo: 'Ma loen tormiuudist ja helistan kindlustusse: selgitan põhjuse ja tagajärjega (tormi tõttu, seepärast, nii et), miks kahju tuleb hüvitada.',
    teacherPage: {
      goal: 'Ученик связывает причину и следствие (sest, kuna, … tõttu, seepärast + глагол, nii et) и по телефону отстаивает своё требование к страховой.',
      core: [1, 5, 6], alt: 4,
      short: 'Станция 1 (правило и 6 предложений, 8 мин) → станция 6 с карточкой-заменой (станцию 5 пропустить).',
      errors: [
        '«seepärast me jäime koju» вместо «seepärast jäime me koju» (после seepärast / seetõttu глагол сразу).',
        '«Kuna elekter oli ära, sügavkülmik ei töötanud» вместо «…, ei töötanud sügavkülmik» (после придаточного — сразу глагол).',
        '«tugev tuule tõttu» вместо «tugeva tuule tõttu» (перед tõttu / pärast — родительный падеж с согласованием).',
        '«sest et» — это НЕ ошибка в эстонском, не исправлять.',
      ],
      notes: ['Единственная зависимость модуля: станция 6 (звонок) использует список убытков из станции 5 — обе на листе Kasuta; на карточке станции 6 список напечатан для тех, кто станцию 5 пропустил.', 'Станция 1 — сначала попытка (исправить письмо), правило уже на карточке «Märka».'],
    },
    discover: [
      station(B.notice('058_d_notice', 'Märka: põhjus ja tagajärg', [
        'Põhjus + lause: Puud murdusid, **sest** / **kuna** tuul oli väga tugev. **Kuna** tee oli kinni, **jäi** buss hiljaks. (pärast kuna-lauset tegusõna kohe)',
        'Põhjus + omastav: **tugeva tuule tõttu** · **tormi pärast** — omastav + tõttu / pärast.',
        'Tagajärg: Tee oli kinni, **seepärast** / **seetõttu** **jäi** buss hiljaks. (pärast seepärast tegusõna kohe)',
        'Tagajärg: Tuul murdis liini, **nii et** elektrit ei olnud.',
      ], 'full'), 1, 10),
      purpose(B.errorfix('058_d_fix', 'Viktori e-kiri vajab parandamist.', 'Igas lauses on üks viga sõnajärjes või vormis. Kirjuta lause õigesti.', [
        ['Tormi pärast et kukkus kask sauna katusele.', 'Tormi pärast kukkus kask sauna katusele.|Tormi tõttu kukkus kask sauna katusele.'],
        ['Kuna elekter oli ära, sügavkülmik ei töötanud.', 'Kuna elekter oli ära, ei töötanud sügavkülmik.'],
        ['Tee oli kinni, seepärast elektrimehed tulid alles õhtul.', 'Tee oli kinni, seepärast tulid elektrimehed alles õhtul.'],
        ['Tugev tuule tõttu murdus ka aed.', 'Tugeva tuule tõttu murdus ka aed.'],
        ['Pump ei töötanud, seetõttu majas ei olnud vett.', 'Pump ei töötanud, seetõttu ei olnud majas vett.'],
        ['Elektrikatkestuse pärast läks toit sügavkülmikus halb.', 'Elektrikatkestuse pärast läks toit sügavkülmikus halvaks.|Elektrikatkestuse tõttu läks toit sügavkülmikus halvaks.'],
      ]), 'Onu Viktor kirjutab kindlustusele ja palub sul enne saatmist vead parandada, et kiri oleks selge ja keegi ei saaks valesti aru.'),
      station(tag(purpose(B.reading('058_d_news', 'Öine torm uudistes.', 'Loe uudist ja vasta küsimustele lühidalt.', 'Öine torm murdis puid ja katkestas elektri', [
        'Jaanipäevale järgnenud ööl jõudis Läänemerelt Eestisse torm. Rannikul ulatusid tuulepuhangud kahekümne viie meetrini sekundis. Tugeva tuule tõttu murdusid paljudes kohtades puud, mis kukkusid teedele ja elektriliinidele. Tallinnas kukkus puu bussipeatuse katusele, aga keegi viga ei saanud. Rannikul tõusis meri ja mitu väikest sadamat suleti hommikuni. Paljud liinibussid sõitsid hilinemisega.',
        '',
        'Hommikuks oli ilma elektrita mitu tuhat kodu, kõige rohkem maapiirkondades. Võrguettevõtte sõnul kulub kõigi rikete parandamiseks vähemalt ööpäev, sest paljud teed on veel kinni.',
        '',
        'Päästjad said öö jooksul üle saja väljakutse. Kuna maanteel Aegviidu lähedal lebas suur kuusk, oli liiklus kaks tundi suletud.',
        '',
        'Päästjad soovitavad tormi järel mitte minna metsa ja mitte puudutada mahakukkunud elektrijuhtmeid. Kui elektrit ei ole, tasub külmiku ust võimalikult harva avada, nii et toit püsiks kauem külm.',
      ], [
        ['Miks murdusid puud?', 'tugeva tuule tõttu|tuul oli väga tugev|tormi tõttu'],
        ['Miks kulub rikete parandamiseks vähemalt ööpäev?', 'paljud teed on veel kinni|teed on kinni'],
        ['Miks oli maantee Aegviidu lähedal kaks tundi suletud?', 'maanteel lebas suur kuusk|teel oli kuusk|tee peal oli suur kuusk'],
        ['Mida ei tohi tormi järel teha?', 'minna metsa ja puudutada elektrijuhtmeid|minna metsa|puudutada mahakukkunud elektrijuhtmeid'],
        ['Miks tasub külmiku ust harva avada?', 'et toit püsiks kauem külm|nii püsib toit kauem külm'],
      ]), 'Sinu naaber ei loe eesti keeles uudiseid ja küsib hommikul, mis öösel juhtus ja kas täna saab tööle sõita. Leia vastused, et saaksid talle selgitada.'), { voice: 'news', task: 'R19' }), 2, 12),
      tag(B.vocab('058_d_vocab', 'Tunni sõnad.', ['torm — буря / шторм', 'kask — берёза', 'katus — крыша', 'elekter — электричество', 'rike — авария / поломка', 'sügavkülmik — морозильник', 'kahju — ущерб', 'kindlustus — страховка', 'põhjus — причина', 'tagajärg — последствие', 'tõttu — из-за', 'seepärast — поэтому']), { topic: ['sügavkülmik'] }),
      teach(tag(purpose(B.speaking('058_d_ready', 'Kas oled elektrikatkestuseks valmis?', 'Õpetaja on kolleeg, kes kolis maale. Vasta tema küsimustele kolm minutit järjest, ütle oma arvamus ja põhjenda.', [
        'Mida peaks iga pere elektrikatkestuseks kodus hoidma? Miks?',
        'Kas küünlad või taskulamp? Mis on sinu arvates parem?',
        'Kas sinu kodus on kunagi elekter pikalt ära olnud? Mis siis juhtus?',
        'Kes peaks pärast tormi aitama vanu inimesi: riik, vald või naabrid?',
      ], [180, 300], ['Minu arvates…, sest…', '… tõttu…', 'Seepärast soovitan…']), 'Sinu kolleeg kolis maale ja küsib, mida ta peaks tormideks koju varuma. Tulemus: ta teab, mida esimesena osta ja miks.'), { task: 'S02', fluency: true }),
        'Üks-ühele: õpetaja on kolleeg, kes kolis maale, ja kirjutab õpilase soovitused nimekirjana üles. Kui põhjus jääb ütlemata, küsib „Miks just see?”. Lõpus loeb õpetaja nimekirja ette ja õpilane paneb selle tähtsuse järjekorda.'),
    ],
    practice: [
      station(teach(tag(purpose(B.cloze('058_p_cloze', 'Eksaminurk: kuidas elektrita hakkama saada (Harno B1 lugemine 3)', 'Loe teksti ja vali igasse lünka sobiv sõna.', 'Kui elekter kaob', [
        'Pikk elektrikatkestus võib tulla igal aastaajal, {*näiteks|nagu|siis} tormi või tugeva lumesaju tõttu. Päästeamet soovitab hoida kodus vähemalt {*seitsmeks|seitsmes|seitse} päevaks joogivett, toitu ja vajalikke ravimeid.',
        '',
        'Valguseks on parem taskulamp kui küünal, {*sest|kuid|nii et} küünal võib põhjustada tulekahju. Kasulik on ka patareidega raadio: {*kui|kuigi|sest} mobiilivõrk ei tööta, saab raadiost kuulata olulisi teateid.',
        '',
        'Toit püsib külmikus kauem külm, kui ust {*avatakse|avada|avab} võimalikult harva. Enne tormi tasub telefonid täis laadida, {*nii et|sest|kuigi} need töötavad ka siis, kui voolu ei ole. Kui naabris elab vanem inimene, {*küsi|küsib|küsida}, kas ta vajab abi.',
        '',
        'Allikas: ERR, „Päästeamet soovitab valmistuda elektrita hakkama saamiseks” (16.12.2023); Päästeamet.',
      ]), 'Harjutad Harno B1 lugemise 3. osa: valid igasse lünka ühe sõna kolmest. Tekst on päriselt kasulik: nii soovitab Päästeamet pikaks elektrikatkestuseks valmistuda.'), { harno: 'R3a' }),
      'Eksaminurk (Harno B1 lugemine 3, valikutega lünktekst). Strateegia: loe kõigepealt kogu lause; mõtle, kas lünka on vaja sidesõna (sest, kui, nii et) või vormi (seitsmeks, avatakse); vali alles siis. Üks-ühele: õpetaja küsib kahe lünga juures, miks teised variandid ei sobi.'), 3, 10),
      station(teach(tag(purpose(B.ideaCard('058_p_fence', 'Kes parandab aia?', 'Õpetaja on naaber Ülo. Arutage võimalusi ja leppige kokku, kes mida teeb ja millal.', 'Ülo kuusk kukkus tormis Viktori aiale. Aed on kahe meetri pikkuselt katki ja Viktori lambad võivad välja pääseda.', [
        'Ülo parandab aia ise järgmisel nädalal',
        'Viktor parandab, Ülo maksab materjali eest',
        'kutsutakse meister, kulud jagatakse pooleks',
        'Viktor küsib kindlustusest',
        'ajutine võrk kohe, korralik aed hiljem',
      ], 'kes parandab, kes maksab ja millal aed on korras'), 'Naabri kuusk kukkus Viktori aiale ja lambad võivad välja pääseda. Te peate täna kokku leppima, kes aia parandab ja kes maksab, et naabrid tülli ei läheks.'), { task: 'S03', level: 4 }),
      'Üks-ühele, õpetaja kaart (Ülo). Varjatud info: Ülol on selg haige, ta võib maksta materjali eest, aga ise tööd teha ei saa; tal on kuurist võtta vana võrk. Takistused: 1) „Kuusk kukkus tormi tõttu, see ei ole minu süü.”; 2) meister saab tulla alles kahe nädala pärast; 3) „Miks ma pean kõik kinni maksma?” Õnnestunud, kui: on kokku lepitud ajutine lahendus täna (lambad ei pääse välja), kes parandab aia, kes mida maksab ja millal; õpilane kasutab vähemalt kaks põhjust ja ühe tagajärje (… tõttu, seepärast, nii et) ja kordab kokkulepet.'), 4, 10),
    ],
    transfer: [
      station(tag(purpose(B.listening('058_t_damage', 'Viktori häälsõnum: kahjude nimekiri.', 'Kuula Viktori sõnumit kaks korda ja kirjuta nimekirja igasse lünka üks või kaks sõna või number.', [
        'Viktor: Tere, Jaan! Siin Viktor. Kindlustus küsib kahjude nimekirja, palun pane see kirja.',
        'Viktor: Esiteks kukkus tormis vana kask sauna katusele. Katus on katki, seepärast sajab nüüd sauna sisse.',
        'Viktor: Teiseks ei olnud meil elektrit kolmkümmend tundi. Elektri puudumise tõttu läks sügavkülmikus kogu liha halvaks.',
        'Viktor: Kolmandaks ei töötanud pump, nii et majas ei olnud vett. Pärast elektri tulekut pump enam ei käivitunud, ilmselt läks see katki.',
        'Viktor: Ja naabri Ülo kuusk kukkus meie aiale, aga selle eest maksab Ülo ise, me juba leppisime kokku.',
        'Viktor: Kindlustuse omavastutus on sada eurot. Nad paluvad saata pildid ja nimekirja nädala jooksul. Aitäh!',
      ], [
        'Tormis kukkus vana kask Viktori [sauna] katusele.',
        'Katus on katki, seepärast sajab nüüd vihma [sauna sisse|sisse|sauna].',
        'Viktori talus ei olnud pärast tormi elektrit [30|kolmkümmend] tundi.',
        'Elektri puudumise tõttu läks sügavkülmikus [liha] halvaks.',
        'Pump ei töötanud, nii et kogu majas ei olnud [vett].',
        'Viktori kodukindlustuse omavastutus on [100|sada] eurot.',
        'Pildid ja kahjude nimekiri tuleb kindlustusele saata [nädala] jooksul.',
      ]), 'Viktor jättis häälsõnumi ja palus kahjud koos põhjustega kirja panna, sest kindlustus küsib nimekirja.'), { task: 'L04' }), 5, 12),
      tag(purpose(B.writing('058_t_helgi', 'Lühike sõnum Helgile.', 'Kirjuta Helgile 5–7 lauset: mis juhtus ja miks. Igas lauses on põhjus või tagajärg (sest, kuna, tõttu, seepärast, nii et).', [5, 7], ['tõttu', 'seepärast', 'kuna', 'nii et'], 2), 'Helgi on Viktori õde. Tal ei ole aega pikka häälsõnumit kuulata. Kirjuta talle lühike sõnum, et ta teaks, mis juhtus, ja ei muretseks.'), { task: 'W12', level: 3 }),
      station(B.text('058_t_sit', 'Kindlustus ütles „ei”', 'Viktor saatis kindlustusele kahjuteate. Täna tuli vastus: sauna katus hüvitatakse, aga sügavkülmiku toitu ja pumpa mitte, sest „need ei ole tormikahjud”. Lepingus on kirjas: „Hüvitame kahju, mis tekkis tormi otsesel mõjul. Elektrikatkestusest tingitud kahju hüvitame, kui katkestus kestis üle 24 tunni.” Viktor on pahane ja palub sinul kindlustusse helistada.'), 6, 15, { final: 'complain', needs: { from: 5, card: 'kask kukkus sauna katusele, katus on katki · elektrit ei olnud 30 tundi · sügavkülmikus läks liha halvaks · pump ei töötanud ja läks katki, majas ei olnud vett · omavastutus 100 eurot.' } }),
      B.phrasebank('058_t_phrases', [
        ['Kaebus', ['Ma ei ole teie otsusega nõus, sest…', 'Lepingu järgi …', 'Palun vaadake otsus uuesti üle.']],
        ['Põhjus ja tagajärg', ['Tormi tõttu kadus elekter 30 tundi.', 'Elekter oli ära, seepärast läks toit halvaks.', 'Kuna vool tuli tagasi, …, nii et …']],
        ['Kokkulepe', ['Mul ei ole praegu …, aga ma saan saata …', 'Kas te saate otsuse üle vaadata enne …?', 'Mida ma pean veel saatma?', 'Kas ma sain õigesti aru, et …?']],
      ]),
      teach(tag(purpose(B.phoneCards('058_t_call', 'Helista kindlustusse.', 'Sina oled Viktor, õpetaja on klienditeenindaja Egle. Sinu kaardil on olukord, eesmärk ja piirangud — mida ja kuidas öelda, otsusta ise. Väljendid leiad kastist.', 'Kodukaitse keeldus hüvitamast sügavkülmiku toitu ja pumpa: „need ei ole tormikahjud”. Kahjuteate number on KK-2318.', ['Viktor', [
        'Olukord: torm murdis liini, elektrit ei olnud 30 tundi; sügavkülmikus läks liha halvaks ja pump läks katki. Lepingu järgi hüvitatakse elektrikatkestuse kahju, kui katkestus kestis üle 24 tunni.',
        'Eesmärk: kindlustus hüvitab ka toidu ja pumba — või lubab vähemalt otsuse kindlaks päevaks üle vaadata.',
        'Piirang: sul on fotod ja kahjude nimekiri, aga elektriku kirjalikku hinnangut pumba kohta ei ole.',
        'Piirang: vastust on vaja enne reedet, sest siis pead uue pumba ostma.',
      ]], ['Klienditeenindaja Egle (õpetaja)', [
        'Egle teab asju, mida sina ei tea. Tema kaart on õpetajal. Kuula hoolikalt ja reageeri.',
      ]]), 'Sina oled Viktor. Kindlustus keeldus osa kahju hüvitamast. Helista ja selgita põhjuse ja tagajärjega, miks toit ja pump on tormikahju; tulemus on uus otsus või selge kokkulepe, mida saata.'), { main: true }),
      'Üks-ühele, õpetaja kaart (Egle). Varjatud info: otsuse tegi kahjukäsitleja ainult tormi kirjelduse põhjal; ülevaatamiseks on vaja tõendit katkestuse pikkuse kohta (võrguettevõtte katkestusteade sobib) ja pumba kohta elektriku hinnangut; tavaline ülevaatus võtab 10 tööpäeva, kiiremini ainult siis, kui klient põhjendab. Takistused (ükshaaval, oota reaktsiooni): 1) „Kas teil on elektriku kirjalik hinnang pumba kohta?” — õpilasel seda pole; 2) „Toidu eest võime maksta, pumba eest mitte.” (osaline hüvitis); 3) „Kahjuteade tuli liiga hilja, tähtaeg oli 3 päeva.” — tegelikult saatis Viktor teate järgmisel hommikul, õpilane peab vastu vaidlema. Õnnestunud, kui: Egle lubab otsuse kirjalikult üle vaadata kindlaks päevaks (enne reedet) või lepitakse kokku osaline hüvitis ja mida, kuhu ja mis ajaks saata; õpilane seletab põhjuse ja tagajärje (vähemalt kolm sidet), vaidleb viisakalt vastu ja kordab kokkulepet. Ära loe õpilasele seda kaarti ette.'),
    ],
  },

  'a2b1-059': {
    title: 'Roheline hoov: lepime kokku',
    canDo: 'Ma ütlen oma arvamuse koos põhjuse ja näitega ning lepin naabritega koosolekul kokku, mida meie hoovis 300 euroga ära teeme.',
    teacherPage: {
      goal: 'Ученик высказывает мнение по модели «мнение + причина + пример», вежливо соглашается и спорит и договаривается с соседями о плане в рамках бюджета.',
      core: [1, 2, 6], alt: 5,
      short: 'Станция 2 (только опрос председателя, 5 мин) → станция 6 (карточки предложений + договорённость).',
      errors: [
        '«Ma olen nõus sinu ettepanekust» вместо «… ettepanekuga» (nõus olema millega).',
        '«loobuma ühekordsed kotid» вместо «loobuma ühekordsetest kottidest» (loobuma millest).',
        '«osalema talgupäevale» вместо «osalema talgupäeval» (osalema millel).',
        '«Minu arvamus on, et…» — правильно, но звучит тяжело; лучше «Minu arvates…» / «Ma arvan, et…».',
      ],
      notes: ['Никого не нужно «опрашивать по трое»: на всех станциях партнёр — учитель с настоящей причиной (председатель, сосед с другим мнением).', 'Финал — экзаменационный формат Harno S1b, но с настоящим бюджетом: план должен уложиться в 300 евро.'],
    },
    discover: [
      station(tag(purpose(B.examListen('059_d_radio', 'Raadiointervjuu: prügi ja biojäätmed.', 'Kuula intervjuud kaks korda. Märgi, kas väide on õige või vale.', 'truefalse', [
        'Saatejuht: Tere! Täna räägime prügist. Stuudios on jäätmenõustaja Mailis Raudsepp. Mailis, paljud kuulajad küsivad, kas biojäätmeid peab tõesti eraldi koguma.',
        'Mailis: Jah. Alates 2024. aasta algusest on biojäätmete sorteerimine kohustuslik nii korter- kui ka eramajades.',
        'Saatejuht: Mis on biojäätmed?',
        'Mailis: Köögi- ja toidujäätmed: köögiviljade koored, toidujäägid, kohvipaks ja teekotid. Neid ei tohi panna kilekotti. Sobib paberkott või lihtsalt ämber, mille sisu kallatakse konteinerisse.',
        'Saatejuht: Aga kui majal on oma hoov?',
        'Mailis: Siis võib teha kompostikasti. Korteriühistu peab selle üle koos otsustama, sest hoov on ühine.',
        'Saatejuht: Kas sorteerimine aitab ka raha säästa?',
        'Mailis: Aitab küll. Kui inimesed sorteerivad, läheb segaprügi konteiner harvem täis ja seda tuleb harvem tühjendada. Prügiveo arve sõltub sellest, kui tihti konteinerit tühjendatakse.',
        'Saatejuht: Mis on kõige sagedasem viga?',
        'Mailis: Paljud panevad biojäätmed konteinerisse kilekotis. Kilekott ei lagune, seepärast rikub see kogu komposti. Teine viga on see, et pakendid visatakse segaprügisse, kuigi nende jaoks on oma konteiner.',
        'Saatejuht: Ja vanad riided?',
        'Mailis: Terved riided võib viia taaskasutuskeskusesse või panna jagamisriiulile. Segaprügisse lähevad ainult katkised ja määrdunud asjad.',
      ], [
        ['Biojäätmete sorteerimine on Eestis kohustuslik ainult eramajades, mitte korterites.', false],
        ['Kohvipaks ja kasutatud teekotid käivad samuti biojäätmete hulka.', true],
        ['Biojäätmeid võib viia konteinerisse ka tavalises kilekotis.', false],
        ['Kompostikasti tegemise üle ühisesse hoovi otsustavad naabrid koos.', true],
        ['Kui inimesed sorteerivad, tuleb segaprügi konteinerit harvem tühjendada.', true],
        ['Biojäätmete jaoks sobib ka paberkott või lihtsalt ämber.', true],
        ['Kilekott rikub kogu komposti, sest see ei lagune.', true],
        ['Ka terved ja puhtad vanad riided tuleb visata segaprügisse.', false],
      ]), 'Sinu majas vaieldakse, kas biojäätmeid peab eraldi koguma. Kuula, mida ütleb jäätmenõustaja, et saaksid naabritele õiget infot anda.'), { voice: 'interview' }), 1, 10),
      tag(B.vocab('059_d_vocab', 'Tunni sõnad.', ['keskkond — окружающая среда', 'keskkonnasõbralik — экологичный', 'prügi — мусор', 'sorteerima — сортировать', 'konteiner — контейнер', 'ettepanek — предложение', 'arvamus — мнение', 'kokkulepe — договорённость', 'hoolima millest — заботиться о чём', 'loobuma millest — отказываться от чего', 'osalema millel — участвовать в чём', 'nõustuma millega — соглашаться с чем']), { topic: ['sorteerima', 'konteiner'] }),
      station(B.notice('059_d_notice', 'Märka: arvamus, põhjus, näide', [
        'Arvamus: **Minu arvates** … · **Ma arvan, et** … · **Mulle tundub, et** …',
        'Põhjus ja näide: …, **sest** … · **Näiteks** meie majas …',
        'Nõustu ja kahtle viisakalt: **Olen sinuga nõus.** · **Jah, aga** … · **Ma ei ole päris kindel, kas** …',
        'Rektsioon: **hoolima** hoovi**st** · **loobuma** kottide**st** · **osalema** talgupäeva**l** · **nõustuma** ettepaneku**ga**.',
      ], 'full'), 2, 12),
      tag(purpose(B.wordforms('059_d_verbs', 'Laused koosolekuks.', 'Pane sõna sulgudes oleva küsimuse järgi õigesse vormi.', [
        ['see ettepanek', 'Ma ei ole päris nõus … (millega?)', 'selle ettepanekuga'],
        ['ühekordsed kotid', 'Paljud naabrid on juba loobunud … (millest?)', 'ühekordsetest kottidest'],
        ['laupäevane talgupäev', 'Kas sa osaled ka … (millel?)', 'laupäevasel talgupäeval'],
        ['meie ühine hoov', 'Me kõik peaksime rohkem hoolima … (millest?)', 'meie ühisest hoovist'],
        ['kompostikast', 'Kes hakkab hoolitsema … eest? (mille eest?)', 'kompostikasti'],
        ['prügikastide lõhn', 'Naabrid kaebasid juba kevadel … üle. (mille üle?)', 'prügikastide lõhna'],
      ], 'full', 'g_notice'), 'Enne koosolekut paned kirja oma laused. Kontrolli, et iga sõna saaks õige lõpu, siis saavad naabrid sinust kohe aru.'), { task: 'G08' }),
      teach(tag(purpose(B.speaking('059_d_board', 'Juhatuse liige küsib sinu arvamust.', 'Õpetaja on juhatuse liige Tiina. Ütle iga väite kohta oma arvamus, põhjus ja näide. Räägi kokku kolm minutit.', [
        'Hoovi peaks tegema kompostikasti.',
        'Iga korter peaks maksma prügi eest selle järgi, kui palju ta ära viskab.',
        'Hoovis ei tohiks autosid parkida, seal peaks olema ainult rohelus.',
        'Talgupäev on kohustuslik kõigile elanikele.',
        'Jagamisriiul trepikojas toob ainult rämpsu juurde.',
      ], [180, 240], ['Minu arvates…, sest…', 'Näiteks meie majas…', 'Jah, aga…']), 'Korteriühistu juhatuse liige Tiina valmistab koosolekut ette ja küsib iga elaniku arvamust. Tema märkmete järgi pannakse kokku koosoleku päevakord.'), { task: 'S11', fluency: true }),
        'Üks-ühele, õpetaja kaart (Tiina). Tiina kirjutab vastused päevakorra jaoks üles. Takistused: 1) „Aga kompost haiseb!”; 2) „Kes selle eest maksab?”; 3) „Eelmine jagamisriiul oli kuu ajaga rämpsu täis.” Õnnestunud, kui: iga väite kohta on arvamus, põhjus ja näide ning õpilane reageerib vastuväitele viisakalt (nõustub osaliselt või vaidleb põhjendusega).'),
    ],
    practice: [
      station(purpose(B.categorize('059_p_sort', 'Mis kuhu käib?', 'Pane iga asi õigesse konteinerisse.', [
        ['pakend', ['piimapakk', 'jogurtitops', 'klaaspurk']],
        ['biojäätmed', ['kartulikoored', 'kohvipaks']],
        ['paber ja papp', ['vana ajaleht']],
        ['segaprügi', ['katkine kruus']],
        ['ohtlikud jäätmed', ['vanad patareid']],
      ], 'full', 'g_vocab'), 'Uus naaber Joosep kolis just majja ega tea veel, mis kuhu käib. Aita tal asjad õigetesse konteineritesse panna.'), 3, 8),
      B.know('059_p_know', [
        '3. mail 2008 läks Eestis umbes 50 000 inimest ühel päeval metsadest ja teede äärest prügi koristama. Talgupäevast „Teeme ära!” kasvas hiljem ülemaailmne liikumine „Let’s Do It! World”.',
        'Alates 1. jaanuarist 2024 on biojäätmete sorteerimine kohustuslik nii korter- kui ka eramajades.',
      ], 'ERR, „Kadi Kenk: jäätmereform kui „Teeme Ära!” talgud 2.0” (14.12.2025); ERR, „Paljud ühistud ei täida biojäätmete sorteerimise kohustust” (2.3.2024)', 'Kas teadsid? Talgud ja prügi'),
      station(purpose(B.formtext('059_p_rules', 'Tiina teade trepikotta.', 'Pane sulgudes olev sõna sobivasse vormi.', 'Meie hoovi uued prügireeglid', [
        'Head naabrid, alates septembrist [pannakse] (panema) kõik biojäätmed maja taga olevasse pruuni konteinerisse.',
        'Kilekotte biokonteinerisse [ei panda] (mitte panema), sest need ei lagune kompostis.',
        'Pakendid [loputatakse] (loputama) enne äraviskamist veega üle ja suured pappkastid [murtakse] (murdma) kokku.',
        'Vanad riided ja raamatud võib viia trepikoja [jagamisriiulile] (jagamisriiul), kus naabrid saavad neid tasuta võtta.',
        'Patareisid prügikasti [ei visata] (mitte viskama), need viiakse lähima poe kogumiskasti.',
        'Täname kõiki, kes oma kodu ümbrusest [hoolivad] (hoolima) ja aitavad hoovi puhtana hoida!',
      ]), 'Juhatuse liige Tiina kirjutab trepikotta teate uute prügireeglite kohta. Ta palub sul vormid üle vaadata, enne kui teate välja paneb.'), 4, 8),
      station(tag(purpose(B.examWriting('059_p_invite', 'Kutse talgupäevale.', 'Kirjuta 60–80 sõnaga. Kirjuta kõigist neljast punktist.', 'kutse', {
        situation: 'Valgevase 7 ja 3 ühine hoov pärast tormi: oksad maas, aed katki, liivakast vana.',
        points: ['millal ja kus talgupäev toimub', 'mida koos tehakse', 'mida kaasa võtta', 'kuidas ennast kirja panna'],
        words: [60, 80], opening: 'Head naabrid!', closing: 'Kohtumiseni hoovis!',
      }), 'Talgupäevale tulevad ainult need, kes teavad, millal ja milleks. Kirjuta trepikoja uksele kutse, mille järgi igaüks oskab tulla ja kaasa aidata.'), { task: 'W03' }), 5, 10),
    ],
    transfer: [
      station(tag(purpose(B.profiles('059_t_ideas', 'Kolm ettepanekut.', 'Loe naabrite ettepanekuid. Mõtle, mis on iga ettepaneku pluss ja miinus.', [
        ['Leida, 3. korter', ['kompostikast ja kaks peenart', 'maksab 120 eurot', 'Leida hoolitseb peenarde eest', 'miinus: kompost võib suvel lõhnata']],
        ['Joosep, 12. korter', ['jagamisriiul trepikotta ja rattahoidja', 'maksab 250 eurot', 'riiuli teeb Joosep ise', 'miinus: rattahoidja on kallis']],
        ['Tiina, juhatus', ['uued pingid ja lilled maja ette', 'maksab 180 eurot', 'pingid toob pood kohale', 'miinus: lilli peab kogu suve kastma']],
      ], '3'), 'Koosolekul tuleb valida, mida 300 euroga teha. Loe enne kolme ettepanekut, et sinu arvamusel oleks põhjus.'), { task: 'R11' }), 6, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.ideaCard('059_t_meeting', 'Eksaminurk ja koosolek: leppige kokku (Harno B1 rääkimine 1b)', 'Õpetaja on naaber, kes eelistab teist ettepanekut. Ütle arvamus, põhjus ja näide ning leppige kokku üks plaan.', 'Valgevase 7 ja 3 ühistul on suveprojekti jaoks 300 eurot ja üks talgupäev. Kõike korraga osta ei saa.', [
        'kompostikast ja peenrad (120 €)',
        'jagamisriiul ja rattahoidja (250 €)',
        'pingid ja lilled (180 €)',
        'ainult jagamisriiul ilma rattahoidjata (40 €)',
        'talgupäeval kõik ise: oksad, aed, liivakast (0 €)',
      ], 'üks plaan, mis mahub 300 eurosse, ja kes mida teeb'), 'Valgevase 7 ja 3 elanikud peavad täna otsustama, mida 300 euro ja ühe talgupäevaga hoovis teha. Tulemus: üks plaan, mis mahub eelarvesse, ja kes mida teeb.'), { harno: 'S1b', main: true }),
      'Eksaminurk (Harno B1 rääkimine 1b, kokkulepe ideekaardiga, ~4 min). Eksamil arutavad kaks õpilast ja jõuavad ühe otsuseni; hinnatakse, kas mõlemad ütlevad arvamuse, põhjendavad ja jõuavad kokkuleppele. Üks-ühele, õpetaja kaart (naaber). Varjatud info: sul on raske kõndida ja sa tahad õues istuda, seepärast eelistad pinke; talgupäeval saad aidata ainult lillede istutamisega. Takistused: 1) „Kompost toob rotid hoovi.”; 2) kui õpilase plaan ületab 300 eurot: „Aga see on ju rohkem kui meie raha!”; 3) „Kes peenraid suvel kastab?” Õnnestunud, kui: üks plaan mahub 300 eurosse, mõlema soov on arvesse võetud ja õpilane kordab kokkulepet (mida, kui palju maksab, kes teeb). Hinda rääkimise skaala järgi (20 punkti).'),
    ],
  },

  'a2b1-060': {
    title: 'Proovieksam 1 — Harno B1',
    assessment: true,
    canDo: 'Ma sooritan esimese täispika proovieksami Harno B1 vormis ajapiiranguga: loen, kuulan, kirjutan ja räägin; vahekontrolli lävi on 60 % ja eesmärk 80 % igas osas.',
    discover: [
      B.text('060_d_intro', 'Proovieksam 1', 'Täna teed esimese täispika proovieksami Harno B1 vormis: lugemine (50 min, 33 punkti), kuulamine (umbes 30 min, 30 punkti), kirjutamine (35 min, 20 punkti) ja rääkimine (umbes 15 min, 20 punkti). See on kursuse vahekontroll. Kui mõnes osas jääb tulemus alla 60 % (lugemine alla 20, kuulamine alla 18, kirjutamine või rääkimine alla 12 punkti), teeb õpetaja sinuga moodulites 13–15 selle osa järeleaitamise plaani. Lõppeesmärk on vähemalt 80 % igas osas. Kõigepealt kordad mooduli sõnu ja vorme ning loed, kuidas pere suvi lõppes.'),
      tag(B.vocab('060_d_vocab', 'Mooduli võtmesõnad.', ['ilmateade — прогноз погоды', 'äike — гроза', 'jahe — прохладный', 'raba — болото', 'laudtee — деревянный настил', 'torm — буря / шторм', 'tõttu — из-за', 'seepärast — поэтому', 'keskkond — окружающая среда', 'sorteerima — сортировать', 'ettepanek — предложение', 'kokkulepe — договорённость']), { topic: ['laudtee', 'sorteerima'] }),
      B.choice('060_d_quiz', 'Mida sa moodulist mäletad?', 'Küsimused kordavad mooduli 12 lugusid ja vorme. Märgi igale küsimusele üks õige vastus kolmest.', [
        ['Mitu kraadi sooja oli jaanilaupäeva õhtul ilmateate järgi?', 'viisteist', 'kakskümmend kaheksa', 'kolmkümmend üks'],
        ['Miks grillis pere Viktori talus maja ees, mitte metsa ääres?', 'metsas oli suur tuleoht', 'metsas oli liiga palju sääski', 'maja ees oli parem vaade'],
        ['Kui kaugel oli äike, kui Viktor luges kaksteist sekundit?', 'umbes nelja kilomeetri kaugusel', 'umbes kaheteistkümne kilomeetri kaugusel', 'umbes kahe kilomeetri kaugusel'],
        ['Mis juhtus tormiööl Viktori saunaga?', 'kask kukkus katusele', 'saun põles maha', 'saun jäi vee alla'],
        ['Mitu tundi oli Viktori talu tormi järel ilma elektrita?', 'kolmkümmend', 'kaksteist', 'kaheksakümmend'],
        ['Kui suur on Viktori kodukindlustuse omavastutus?', 'sada eurot', 'tuhat eurot', 'null eurot'],
        ['Kui palju raha oli Valgevase maja ühistul suveprojekti jaoks?', 'kolmsada eurot', 'sada eurot', 'kolm tuhat eurot'],
        ['Mis sobib lausesse: Pärast äikest läheb õhtul palju …', 'jahedamaks', 'jahedam', 'jahedalt'],
        ['Mis sobib lausesse: Metsatee oli kinni, … sõitis Viktor rattaga.', 'seepärast', 'sest', 'tõttu'],
        ['Mis sobib lausesse: Kui välk lõi, … pere kohe tornist alla.', 'tuli', 'tulema', 'tulnud'],
      ], 'full', 'g_notice'),
      B.reading('060_d_story', 'Kuidas suvi lõppes.', 'Loe, mis sai Viktori saunast, Mukist ja Kalamaja hoovist. Vasta küsimustele lühidalt oma sõnadega.', 'Suvi pärast tormi', [
        'Juuli alguses sõitis kogu pere jälle Viktori tallu. Seekord ei tuldud puhkama, vaid tööle. Jaan ja naaber Ülo võtsid kase sauna katuselt maha ning Oskar korjas oksad kokku. Kindlustus maksis katuse eest ja kahe nädala pärast oli saunal uus plekk-katus. Viktor ostis pärast tormi väikese generaatori ja ütles naerdes, et järgmine torm teda enam ei üllata. Helgi kinkis talle ilmajaama, mis näitab temperatuuri ja tuule kiirust. Nüüd vaatab Viktor seda igal hommikul enne kohvi.',
        '',
        'Muki ei tahtnud alguses enam rappa minna. Kui Viktor talle laudteed näitas, istus koer maha ja vaatas kaua taevasse. Mia kuulutas, et Muki on nüüd pere kõige targem ilmateadustaja.',
        '',
        'Kalamajas peeti talgupäev juuli esimesel laupäeval. Kohale tuli kakskümmend kaks naabrit kahest majast. Hommikul koristati tormi oksad ja parandati aed, pärastlõunal ehitati Leida juhendamisel kompostikast. Joosep pani trepikotta jagamisriiuli ja juba esimesel nädalal leidis sealt uue kodu kolmkümmend raamatut.',
        '',
        'Kõige suurem üllatus oli see, et segaprügi konteiner ei olnud enam igal reedel täis. Tiina arvutas, et kui see nii jätkub, maksab maja prügiveo eest aastas umbes sada eurot vähem.',
        '',
        'Augusti alguses kuulas Sofia ilmateadet ja naeris. Raadio lubas jälle äikest. Seekord pani ta lihtsalt aknad kinni, keetis teed ja kordas eksamisõnu, sest kursuse proovieksam oli kahe nädala pärast.',
      ], [
        ['Miks pere juuli alguses tallu sõitis?', 'tööle|et sauna katust parandada|kaske katuselt maha võtta'],
        ['Kes võtsid kase sauna katuselt maha?', 'Jaan ja naaber Ülo|Jaan ja Ülo'],
        ['Mis on saunal nüüd?', 'uus plekk-katus|uus katus'],
        ['Mida tegi Muki, kui Viktor talle laudteed näitas?', 'istus maha ja vaatas kaua taevasse|istus maha ja vaatas taevasse'],
        ['Mida tehti talgupäeval pärastlõunal?', 'ehitati kompostikast'],
        ['Miks maksab maja nüüd prügiveo eest vähem?', 'segaprügi konteiner ei ole enam iga reede täis|segaprügi on vähem'],
        ['Mida teed sina, kui raadio lubab äikest? Miks?', ''],
      ]),
      B.categorize('060_d_sort', 'Mooduli sõnad neljas rühmas.', 'Kuhu sõna kõige paremini sobib: ilmateade, matk rabas, torm või roheline hoov? Pane iga sõna ühte veergu.', [
        ['ilmateade', ['temperatuur', 'pilvisus', 'hoovihm', 'kraad']],
        ['matk rabas', ['laudtee', 'vaatetorn', 'sammal', 'kummik']],
        ['torm', ['murdunud puu', 'elektrikatkestus', 'kahjuteade', 'omavastutus']],
        ['roheline hoov', ['kompostikast', 'jagamisriiul', 'talgud', 'peenar']],
      ], 'full', 'g_vocab'),
      B.crossword('060_d_cross', 'Ristsõna: ilm ja loodus.', 'Lahenda ristsõna vihjete abil. Iga vastus on üks sõna moodulist 12.', [
        ['Välk ja müristamine koos.', 'äike'], ['Väga soe, nagu juuli keskpäeval.', 'palav'], ['Märg ja pehme koht, kus kasvab turbasammal.', 'raba'], ['Puust tee üle märja raba.', 'laudtee'], ['Väga tugev tuul, mis murrab puid.', 'torm'],
        ['See on maja peal ja kaitseb vihma eest.', 'katus'], ['Koht, kust maal pumbaga vett saadakse.', 'kaev'], ['Osa kahjust, mida klient maksab ise.', 'omavastutus'], ['Päev, mil naabrid koos hoovi korda teevad.', 'talgud'], ['Kõik see, mis meid ümbritseb: õhk, vesi, loodus.', 'keskkond'],
      ], 'half', 'g_vocab'),
      B.transformation('060_d_trans', 'Muutus, aeg või põhjus.', 'Kirjuta lause ümber antud sõnaga. Mõtle, kas vaja on -ks-vormi, kui-lauset või põhjuse ja tagajärje sõna.', [
        ['Hommikul oli soe, aga õhtuks oli külm.', 'läks', 'Õhtuks läks külmaks.|Õhtul läks külmaks.'],
        ['Pärast vihma oli taevas jälle selge.', 'läks', 'Pärast vihma läks taevas jälle selgeks.'],
        ['Välk lõi. Muki jooksis kohe metsa.', 'kui', 'Kui välk lõi, jooksis Muki kohe metsa.'],
        ['Pere jõudis koju. Siis algas torm.', 'enne kui', 'Pere jõudis koju, enne kui torm algas.'],
        ['Puhus tugev tuul. Elekter kadus.', 'tõttu', 'Tugeva tuule tõttu kadus elekter.'],
        ['Pump ei töötanud. Majas ei olnud vett.', 'seepärast', 'Pump ei töötanud, seepärast ei olnud majas vett.'],
        ['Teed olid kinni. Elektrimehed tulid hilja.', 'kuna', 'Kuna teed olid kinni, tulid elektrimehed hilja.'],
        ['Naabrid koristasid hoovi. Hoov on nüüd puhas.', 'nii et', 'Naabrid koristasid hoovi, nii et hoov on nüüd puhas.'],
        ['Meteoroloogid ootavad homseks tugevat äikest.', 'oodatakse', 'Homseks oodatakse tugevat äikest.'],
        ['Inimesed teevad küla jaanituld järve ääres.', 'tehakse', 'Küla jaanituld tehakse järve ääres.'],
      ], 'full', 'g_notice'),
      B.errorfix('060_d_fix', 'Proovikirjade vead.', 'Need laused on õpilaste proovikirjadest. Igas lauses on üks viga; kirjuta lause õigesti.', [
        ['Eile oli väga palav, aga õhtul läks jahe.', 'Eile oli väga palav, aga õhtul läks jahedaks.'],
        ['Kui äike algas, me jooksime kiiresti tuppa.', 'Kui äike algas, jooksime me kiiresti tuppa.'],
        ['Tormi pärast et jäi meie maja ilma elektrita.', 'Tormi pärast jäi meie maja ilma elektrita.'],
        ['Tuul oli tugev, seepärast me jäime koju.', 'Tuul oli tugev, seepärast jäime me koju.'],
        ['Me läksime laupäeval rabas matkama.', 'Me läksime laupäeval rappa matkama.'],
        ['Ma olen nõus sinu ettepanekust.', 'Ma olen nõus sinu ettepanekuga.'],
        ['Temperatuur tõuseb homme kakskümmend viis kraadi.', 'Temperatuur tõuseb homme kahekümne viie kraadini.'],
        ['Pärast talgupäeva meie hoov on palju ilusam.', 'Pärast talgupäeva on meie hoov palju ilusam.'],
        ['Ma loobusin ühekordsed kotid juba eelmisel aastal.', 'Ma loobusin ühekordsetest kottidest juba eelmisel aastal.'],
        ['Äikese ajal ei tohi seista üksik puu all.', 'Äikese ajal ei tohi seista üksiku puu all.'],
      ], 'full', 'g_notice'),
      B.writing('060_d_write', 'Minu suvepäev looduses.', 'Kirjuta 8–10 lauset: milline oli sinu kõige meeldejäävam suvepäev looduses, milline oli ilm ja mis juhtus.', [8, 10], ['kui', 'seepärast', 'läks', 'ilm'], 3),
      // own instruction: B.examiner's fixed wording would repeat another module's instruction (final shape V7)
      teach(withInstruction(B.examiner('060_d_warm', 'ilm, loodus ja keskkond', [
        'Millist ilma sa kõige rohkem armastad ja millist üldse ei talu?',
        'Kuidas ilm sinu tuju ja nädalavahetuse plaane mõjutab?',
        'Kus sa Eestis looduses kõige meelsamini käid? Miks just seal?',
        'Mille poolest erineb kliima sinu kodumaal Eesti kliimast?',
        'Kas sinu arvates on talved ja suved viimastel aastatel muutunud? Mille järgi sa seda märkad?',
        'Kas linnas peaks olema rohkem parke ja vähem parklaid? Põhjenda.',
        'Mida saab üks pere teha, et keskkonda vähem koormata?',
      ]), 'Enne proovieksamit harjuta rääkimise esimest osa: eksamineerija küsib ilmast, loodusest ja keskkonnast. Igale küsimusele vasta paari-kolme lausega ning põhjenda oma mõtet näitega.'),
      'Üks-ühele: õpetaja on eksamineerija ega aita; mõnele vastusele küsib ta lisaks „Miks?” või ütleb vastupidise arvamuse. Lõpus küsib õpilane õpetajalt kaks küsimust samast teemast.'),
    ],
    practice: [
      B.examPart('060_p_rpart', 'R', { minutes: 50, points: 33, tasks: 4, note: 'Lugemisosa on Harno B1 vormis ja täispikkuses: neli ülesannet, 33 punkti. Vahekontrolli lävi on 20 punkti (60 %), eesmärk vähemalt 27 punkti (80 %).' }),
      tag(B.adsmatch('060_p_r1', 'Lugemine 1. Suvised tegevused.', 'Lugege olukordi ja kuulutusi. Kirjutage iga olukorra juurde sobiva kuulutuse täht; sama kuulutust võib kasutada mitu korda.', [
        ['Kanuumatk Soomaal', 'Juhendatud kanuumatk Raudna jõel kestab neli tundi. Sobib ka lastele alates kaheksandast eluaastast. Päästevestid ja veekindlad kotid on hinnas. Hind 35 € inimese kohta.'],
        ['Rabaretk koos giidiga', 'Õhtune retk Kõrve rabas algab kell 20 ja lõpeb päikeseloojangul vaatetornis. Giid räägib rabataimedest ja lindudest. Võtke kaasa kummikud ja sääsetõrjevahend. Osalemine on tasuta, registreerimine vajalik.'],
        ['Telkimisplats järve ääres', 'Telgiplats koos lõkkekoha ja välikäimlaga. Plats on tasuta, aga lõket tohib teha ainult siis, kui tuleoht ei ole suur. Koerad on rihma otsas teretulnud.'],
        ['Seenekursus algajatele', 'Kahepäevane kursus augusti lõpus: hommikul metsas seenel, pärastlõunal õpime seeni tundma ja neist süüa tegema. Hind 60 €, lõunasöök on hinnas.'],
        ['Rattamatk mööda rannikut', 'Kolmepäevane rattamatk Lahemaa rannikul, iga päev umbes 40 km. Pagas sõidab bussiga, teie sõidate kergelt. Rendirattad on olemas. Hind koos ööbimisega 220 €.'],
        ['Kalapüük paadilt', 'Peipsi järvel kalale koos kogenud kaluriga. Vajalikud load ja püügivahendid on hinnas. Paati mahub kuni viis inimest, hind 90 € paadi kohta.'],
      ], [
        ['Pere tahab koos kaheksa- ja kümneaastase lapsega veematkale minna.', 'A'],
        ['Õpetaja otsib tasuta õhtust retke, kus räägitakse lindudest.', 'B'],
        ['Noored tahavad nädalavahetusel järve ääres telgis ööbida.', 'C'],
        ['Pensionär tahab õppida metsas seeni tundma.', 'D'],
        ['Sõbrad tahavad mitu päeva rattaga sõita, aga ei taha kotte kaasas vedada.', 'E'],
        ['Viis kolleegi tahavad koos kala püüda.', 'F'],
        ['Mees tahab oma koeraga looduses telkida.', 'C'],
        ['Turist tahab näha päikeseloojangut vaatetornist.', 'B'],
        ['Naisel ei ole oma ratast, aga ta tahab rannikul rattamatkale minna.', 'E'],
      ]), { harno: 'R1' }),
      B.reading('060_p_r2text', 'Lugemine 2. Artikkel.', 'Lugege ajakirja artiklit mesilastest linnas. Valikküsimused on kohe artikli järel.', 'Mesilased Tallinna katustel', [
        'Mesilasi peetakse tavaliselt maal, kus on palju põlde ja aedu. Viimastel aastatel on aga mesitarud ilmunud ka Tallinna katustele ja hoovidesse. Linnamesinikke on Eestis veel vähe, kuid nende arv kasvab igal aastal.',
        '',
        'Miks just linnas? Linnas on sageli rohkem erinevaid õitsvaid taimi kui maal, sest parkides, aedades ja rõdudel kasvab palju lilli ja puid. Pärnad, vahtrad ja kastanid õitsevad eri ajal, nii et mesilastel on toitu terve suve. Maal on põldudel aga tihti ainult üks taim. Linnas on ka talv veidi soojem, mis aitab mesilastel külma üle elada.',
        '',
        'Mesinik Ain peab kolme mesitaru oma kontorihoone katusel. Tema sõnul ei sega mesilased inimesi, sest katusel lendavad nad kõrgel. Kõige rohkem kardavad mesilasi naabrid, kes ei ole neid kunagi lähedalt näinud.',
        '',
        'Aini sõnul on tema mett laboris kontrollitud ja see on sama puhas kui maamesi. Mesilased korjavad nektarit õitest, mitte tänavatolmust.',
        '',
        'Mesilased on looduses väga tähtsad, sest nad tolmeldavad taimi. Kui mesilasi ei ole, kasvab vähem õunu, marju ja köögivilju.',
        '',
        'Kes tahab ise mesinikuks hakata, peab kõigepealt õppima. Algajal on vaja kaitseriietust, tarusid ja natuke julgust. Mesinike seltsid korraldavad kursusi ja annavad nõu. Ain soovitab alustada ühest tarust ja enne seda naabritega rääkida. Tema sõnul on kõige parem viis naabreid veenda anda neile purk oma mett.',
      ], [['Pärast eksamit: kas mesitaru maja katusel on sinu arvates hea mõte? Miks?', '']]),
      tag(B.choice('060_p_r2', 'Lugemine 2. Valige õige vastus.', 'Märkige artikli põhjal igale küsimusele üks õige vastus kolmest.', [
        ['Kuhu on viimastel aastatel hakatud mesitarusid panema?', 'Tallinna katustele ja hoovidesse', 'ainult maale põldude äärde', 'ainult linnaparkidesse'],
        ['Miks on mesilastel linnas toitu terve suve?', 'linna taimed õitsevad eri ajal', 'linnas on alati soojem', 'linnas on suured põllud'],
        ['Miks ei sega Aini mesilased inimesi?', 'nad lendavad katusel kõrgel', 'neid on väga vähe', 'nad lendavad ainult öösel'],
        ['Kes kardavad mesilasi artikli järgi kõige rohkem?', 'naabrid, kes ei ole neid lähedalt näinud', 'kontori töötajad', 'teised mesinikud'],
        ['Mida ütleb Ain oma linnamee kohta?', 'see on sama puhas kui maamesi', 'see on kallim kui maamesi', 'see on magusam kui maamesi'],
        ['Mida soovitab Ain algajale mesinikule?', 'alustada ühest tarust ja rääkida naabritega', 'osta kohe palju tarusid', 'pidada mesilasi ainult maal'],
      ]), { harno: 'R2' }),
      tag(B.gaps('060_p_r3', 'Lugemine 3. Olena kiri.', 'Lugege Olena kirja sõbrannale. Kirjutage igasse lünka sobiv sõna pangast; kaks sõna jääb üle.', [
        'Tere, Irina! Meie esimene suvi Eestis on olnud väga [huvitav].',
        'Jaanipäeval kutsus Daria klassiõe pere meid oma [tallu] Saaremaale.',
        'Õhtul tehti mere ääres suur lõke, mille ümber kõik laulsid ja [tantsisid].',
        'Daria hüppas koos teiste lastega üle väikese [lõkke].',
        'Järgmisel päeval läksime rappa, kuigi ilmateade lubas [äikest].',
        'Rabas kõndisime pikal laudteel ja ronisime ka [vaatetorni].',
        'Äike tuli varem, nii et pidime kiiresti metsa [poole] jooksma.',
        'Kõik said märjaks, aga keegi ei [kartnud], sest pereisa rääkis naljakaid lugusid.',
        'Nüüd tean, et Eesti suvi on lühike, aga [valge] ja ilus.',
        'Kirjuta mulle, kuidas teie suvi on [läinud]! Kallistustega, Olena',
      ], ['lumine', 'tallu', 'kartnud', 'tantsisid', 'Kuigi', 'äikest', 'valge', 'huvitav', 'poole', 'lõkke', 'läinud', 'vaatetorni'], 'full', 'g_read'), { task: 'R04', harno: 'R3b' }),
      tag(B.gaps('060_p_r4', 'Lugemine 4. Teade matkajatele.', 'Tekstist on välja jäetud kaheksa lauseosa. Kirjutage iga lünga kohale sobiv osa pangast; kaks osa jääb üle.', [
        'Head külastajad! Kõrve raba matkarada on taas avatud, [sest tormis kahjustatud laudtee on parandatud].',
        'Rajal tuleb liikuda ainult laudteel, [kuna raba pinnas on pehme ja märg].',
        'Vaatetorni võib korraga ronida kuni kümme inimest, [nii et oodake vajadusel oma järjekorda].',
        'Lõket tohib teha ainult parkla juures, [kui tuleoht ei ole suur].',
        'Prügikaste rajal ei ole, [seega võtke oma prügi koju kaasa].',
        'Koerad peavad olema rihma otsas, [sest rabas pesitsevad linnud].',
        'Äikese ajal ärge ronige vaatetorni, [vaid minge kiiresti metsa alla].',
        'Kui leiate katkise laua, [teatage sellest külastuskeskusele].',
      ], ['vaid minge kiiresti metsa alla', 'kuigi rada on veel suletud', 'kui tuleoht ei ole suur', 'sest tormis kahjustatud laudtee on parandatud', 'teatage sellest külastuskeskusele', 'nii et koerad võivad vabalt joosta', 'kuna raba pinnas on pehme ja märg', 'seega võtke oma prügi koju kaasa', 'nii et oodake vajadusel oma järjekorda', 'sest rabas pesitsevad linnud'], 'full', 'g_read'), { harno: 'R4' }),
      B.examPart('060_p_lpart', 'L', { minutes: 30, points: 30, tasks: 4, note: 'Kuulamisosa: neli ülesannet, 30 punkti. Iga tekst kõlab kaks korda; enne kuulamist lugege küsimused läbi. Vahekontrolli lävi on 18 punkti (60 %), eesmärk vähemalt 24 punkti (80 %).' }),
      tag(B.examListen('060_p_l1', 'Kuulamine 1. Lühikesed tekstid.', 'Kuulake seitset lühikest teksti. Iga tekst kõlab kaks korda. Valige igale küsimusele õige vastus.', 'choice', [
        'Esimene tekst. Head reisijad! Tormi tõttu ei sõida täna praam Virtsust Kuivastusse. Järgmine praam väljub homme kell kuus hommikul.',
        'Teine tekst. Tere, siin Kõrve külastuskeskus. Teie broneeritud rabaretk toimub ilmast hoolimata. Võtke kaasa vihmajope.',
        'Kolmas tekst. Kallid kliendid! Täna on kõik grillid ja telgid aiapoes kakskümmend protsenti odavamad. Pakkumine kehtib pühapäevani.',
        'Neljas tekst. Ema, siin Oskar. Ma jäin bussist maha, sest trenn lõppes hiljem. Tulen järgmise bussiga, mis väljub kell seitse.',
        'Viies tekst. Tähelepanu! Kalarannas on täna ujumine keelatud, sest vees on leitud liiga palju baktereid.',
        'Kuues tekst. Tere, Leida! Siin Tiina. Talgupäev algab laupäeval kell kümme. Palun too kaasa reha, kindaid on meil piisavalt.',
        'Seitsmes tekst. Homme on Ida-Virumaal oodata kuni kolmkümmend kaks kraadi sooja. Päästeamet soovitab juua palju vett ja vältida keskpäeval päikest.',
      ], [
        ['Miks ei sõida täna praam Kuivastusse?', 'tormi tõttu', 'remondi tõttu', 'udu tõttu'],
        ['Mida peab rabaretkele kaasa võtma?', 'vihmajope', 'kummikud', 'toidu'],
        ['Mis on aiapoes täna odavam?', 'grillid ja telgid', 'lilled ja muld', 'jalgrattad'],
        ['Mis kell väljub buss, millega Oskar tuleb?', 'kell seitse', 'kell kuus', 'kell kaheksa'],
        ['Miks on Kalarannas täna ujumine keelatud?', 'vees on liiga palju baktereid', 'vesi on liiga külm', 'lained on liiga kõrged'],
        ['Mida peab Leida talgupäevale kaasa võtma?', 'reha', 'kindad', 'saia'],
        ['Mida soovitab päästeamet palava ilmaga?', 'juua palju vett', 'ujuda keskpäeval', 'sõita maale'],
      ]), { harno: 'L1', task: 'L01' }),
      tag(B.examListen('060_p_l2', 'Kuulamine 2. Raadiolugu.', 'Kuulake raadiolugu puukidest ja valige igale küsimusele üks õige vastus.', 'choice', [
        'Diktor: Head kuulajad! Suvel käivad paljud metsas, rabas ja aias. Koos sooja ilmaga on aktiivsed ka puugid. Eestis võib puuke kohata varakevadest hilissügiseni.',
        'Diktor: Puugid ei kuku puu otsast, nagu paljud arvavad. Nad ootavad kõrges rohus ja põõsastes ning haakuvad inimese riiete külge, kui ta mööda kõnnib.',
        'Diktor: Puugid võivad levitada kaht haigust: puukentsefaliiti ja borrelioosi. Puukentsefaliidi vastu saab end vaktsineerida, borrelioosi vastu vaktsiini ei ole.',
        'Diktor: Arstid soovitavad metsas kanda heledaid riideid, sest nendel on puuke kergem märgata. Püksid tasub panna sokkide sisse.',
        'Diktor: Pärast metsast tulekut tuleb kogu keha hoolikalt üle vaadata. Eriti tähelepanelik peab olema laste ja koertega.',
        'Diktor: Kui leiate puugi, eemaldage see pintsetiga aeglaselt ja ettevaatlikult. Seda kohta tasub järgmised nädalad jälgida. Kui nahale tekib suur punane laik või tõuseb palavik, minge perearsti juurde.',
        'Diktor: Puukide pärast ei tasu loodusest loobuda. Tähelepanu ja natuke ettevaatust aitavad terveks jääda.',
      ], [
        ['Millal võib Eestis puuke kohata?', 'varakevadest hilissügiseni', 'ainult juulis', 'kogu aasta läbi'],
        ['Kus puugid inimest ootavad?', 'kõrges rohus ja põõsastes', 'puude otsas', 'järvede vees'],
        ['Mille vastu saab end vaktsineerida?', 'puukentsefaliidi vastu', 'borrelioosi vastu', 'mõlema haiguse vastu'],
        ['Miks soovitatakse metsas kanda heledaid riideid?', 'nendel on puuke kergem märgata', 'need on palava ilmaga jahedamad', 'puugid kardavad heledat värvi'],
        ['Mida tuleb teha pärast metsast tulekut?', 'kogu keha hoolikalt üle vaadata', 'kohe arsti juurde minna', 'riided ära visata'],
        ['Millal tuleb pärast puugi eemaldamist arsti juurde minna?', 'kui tekib suur punane laik või palavik', 'kohe järgmisel päeval', 'ainult siis, kui puuk oli suur'],
      ]), { harno: 'L2' }),
      tag(B.listening('060_p_l3', 'Kuulamine 3. Telefonikõne.', 'Kuulake, kuidas Sofia broneerib telefonis puhkemaja. Täiendage lauseid ühe sõna või numbriga.', [
        'Kerttu: Tere, puhkemaja Kännu, Kerttu kuuleb.',
        'Sofia: Tere! Mina olen Sofia. Soovin broneerida maja augusti teiseks nädalavahetuseks.',
        'Kerttu: Mitmele inimesele?',
        'Sofia: Meid on neli: mina ja kolm kolleegi. Kas teil on vaba maja?',
        'Kerttu: Jah, Järvemaja on vaba. Seal on kuus voodikohta, saun ja paat. Üks öö maksab sada kakskümmend eurot.',
        'Sofia: Kas saun on hinna sees?',
        'Kerttu: Saun maksab lisaks kakskümmend eurot õhtu kohta. Puud on olemas.',
        'Sofia: Kas lõket tohib teha?',
        'Kerttu: Maja juures on lõkkeplats, aga kui päästeamet kuulutab välja suure tuleohu, on lõkke tegemine keelatud. Siis saate kasutada grilli.',
        'Sofia: Selge. Kuidas me kohale saame?',
        'Kerttu: Kõige parem on autoga. Viimased kolm kilomeetrit on kruusatee. Bussiga saab sõita Aegviiduni, sealt on maja juurde seitse kilomeetrit.',
        'Sofia: Kas meil on vaja midagi kaasa võtta?',
        'Kerttu: Voodipesu on hinnas, aga rätikud võtke kaasa. Ja kindlasti sääsetõrjevahend, sest maja on järve ääres.',
        'Sofia: Kuidas saab maksta?',
        'Kerttu: Saadan teile arve e-postiga. Pool summast tuleb maksta nädala jooksul, ülejäänu kohapeal.',
        'Sofia: Väga hea. Saadan teile oma e-posti aadressi sõnumiga.',
        'Kerttu: Sobib. Ootame teid!',
      ], [
        'Järvemajas on kokku [kuus|6] voodikohta.',
        'Üks öö Järvemajas maksab [120|sada kakskümmend] eurot.',
        'Saun maksab lisaks [20|kakskümmend] eurot õhtu kohta.',
        'Suure tuleohu ajal saab lõkke asemel kasutada [grilli].',
        'Viimased kolm kilomeetrit maja juurde on [kruusatee].',
        'Bussiga saab sõita kuni [Aegviiduni|Aegviidu].',
        'Rätikud tuleb kaasa võtta, voodipesu on [hinnas].',
        'Pool summast tuleb maksta ühe [nädala] jooksul.',
      ]), { harno: 'L3b' }),
      tag(B.examListen('060_p_l4', 'Kuulamine 4. Intervjuu.', 'Kuulake intervjuud metsavahiga ja otsustage iga väite kohta, kas see on õige või vale.', 'truefalse', [
        'Ülle: Tere! Täna on stuudios metsavaht Kalju, kes on Kõrvemaa metsades töötanud kakskümmend viis aastat. Kalju, milline on metsavahi tööpäev?',
        'Kalju: Tere! Igal hommikul sõidan autoga mööda metsateid ja vaatan, kas kõik on korras. Suvel kontrollin eriti lõkkeplatse, sest tuleoht on suur.',
        'Ülle: Kas inimesed teevad metsas ka keelatud lõkkeid?',
        'Kalju: Kahjuks küll. Enamik inimesi on mõistlikud, aga igal suvel leian paar lõket, mis on jäetud põlema. Ühest sellisest lõkkest võib alata suur metsatulekahju.',
        'Ülle: Mis on viimastel aastatel muutunud?',
        'Kalju: Tormid on tugevamad. Pärast jaanipäeva tormi koristasime kaks nädalat murdunud puid. Mõned matkarajad olid suletud kuu aega.',
        'Ülle: Kas inimesi käib metsas rohkem kui varem?',
        'Kalju: Palju rohkem. Eriti pärast seda, kui paljud hakkasid kodust tööd tegema. Metsas käiakse nüüd ka talvel.',
        'Ülle: Mis teile kõige rohkem meelehärmi teeb?',
        'Kalju: Prügi. Inimesed toovad metsa toitu ja jooke, aga tühje pakendeid koju ei vii. Iga kuu korjan metsateede äärest kümneid prügikotte.',
        'Ülle: Ja mis teeb rõõmu?',
        'Kalju: Lapsed. Kui koolid tulevad metsa õppima, küsivad lapsed nii palju, et päev saab läbi väga kiiresti. Ma usun, et laps, kes metsa tunneb, ei viska sinna prügi.',
        'Ülle: Mida soovitate matkajatele?',
        'Kalju: Vaadake enne minekut ilmateadet ja tuleohu infot. Ja jätke mets selliseks, nagu see oli enne teie tulekut.',
      ], [
        ['Kalju on metsavahina töötanud kakskümmend viis aastat.', true],
        ['Suvel kontrollib Kalju eriti hoolikalt lõkkeplatse.', true],
        ['Kalju arvates teeb enamik inimesi metsas keelatud lõkkeid.', false],
        ['Pärast jaanipäeva tormi olid mõned matkarajad kuu aega suletud.', true],
        ['Kalju sõnul käivad inimesed metsas nüüd vähem kui varem.', false],
        ['Talvel ei käi Kalju sõnul metsas enam keegi.', false],
        ['Kalju korjab iga kuu metsateede äärest palju prügi.', true],
        ['Kalju ei armasta, kui koolid tulevad metsa õppima.', false],
        ['Kalju soovitab enne metsa minekut vaadata ilmateadet ja tuleohu infot.', true],
      ]), { harno: 'L4' }),
      B.rubric('060_p_rcheck', 'Lugemisosa pärast: mis aitas?', 'Märgi pärast lugemisosa, mida sa tegid, ja kirjuta üks asi, mida järgmisel proovieksamil muudad.', ['Lugesin enne teksti küsimused või olukorrad ja jooni alla võtmesõnad.', 'Leidsin tekstist sama mõtte teiste sõnadega.', 'Jagasin aja: igale ülesandele umbes 12 minutit ja lõpus kontroll.', 'Raske lünga jätsin vahele ja tulin selle juurde hiljem tagasi.']),
      B.rubric('060_p_lcheck', 'Kuulamisosa pärast: mis aitas?', 'Märgi pärast kuulamisosa, mida sa tegid, ja kirjuta üks asi, mida järgmisel proovieksamil muudad.', ['Lugesin enne igat teksti küsimused ja valikud läbi.', 'Esimesel kuulamisel märkisin vastuse, teisel kontrollisin.', 'Numbrid, nimed ja hinnad kirjutasin kohe üles.', 'Kui vastus jäi kuulmata, läksin rahulikult edasi.']),
      B.rubric('060_p_points', 'Minu punktid: lugemine ja kuulamine.', 'Kirjuta oma punktid osade kaupa ja võrdle neid vahekontrolli ja eesmärgiga.', ['Lugemine: … / 33 (vahekontroll 20, eesmärk 27)', 'Kuulamine: … / 30 (vahekontroll 18, eesmärk 24)', 'Osa, kus jäin alla 60 %: …', 'Mida kordan moodulites 13–15: …']),
    ],
    transfer: [
      B.examPart('060_t_wpart', 'W', { minutes: 35, points: 20, tasks: 2, note: 'Kirjutage ilma sõnaraamatuta. Esimese ülesande eest saab 8 ja teise eest 12 punkti; vahekontrolli lävi on 12 punkti, eesmärk vähemalt 16 punkti.' }),
      tag(B.examWriting('060_t_w1', 'Kirjutamine 1. Küsimustik.', 'Linnavalitsus uurib, kuidas elanikud kasutavad parke ja rohealasid. Vastake küsimustikule; miks-küsimustele andke põhjus.', 'kusimustik', {
        situation: 'Te täidate linnavalitsuse küsimustikku rohealade kohta.',
        questions: ['Kui tihti te käite pargis või metsas?', 'Milline park või roheala on teie kodule kõige lähemal?', 'Mida te seal tavaliselt teete?', 'Mis teile selles kohas kõige rohkem meeldib? Miks?', 'Mis teile seal ei meeldi? Miks?', 'Kas te sorteerite oma prügi? Miks?', 'Kas te olete osalenud talgutel? Kus?', 'Mida tuleb teie arvates parkides muuta?', 'Kas te kasutate jalgratast või ühistransporti? Miks?', 'Kuidas te ise loodust hoiate?'],
      }), { harno: 'W1a' }),
      B.rubricW1('060_t_rw1', ['küsimused 1–3', 'küsimused 4–6', 'küsimused 7–8', 'küsimused 9–10']),
      tag(B.examWriting('060_t_w2', 'Kirjutamine 2. Isiklik kiri.', 'Kirjutage sõbrale umbes 100-sõnaline isiklik kiri ja käsitlege kõiki viit punkti.', 'kiri', {
        situation: 'Teie sõber Marko kirjutas, et läheb järgmisel nädalal esimest korda Eestis matkama, ja küsis teilt nõu.',
        points: ['kuhu Markol tasub minna ja miks', 'milline ilm võib Eestis suvel olla', 'mida kaasa võtta', 'millega looduses arvestada (prügi, lõke, äike)', 'üks lugu teie enda matkalt'],
        words: [90, 110], opening: 'Tere, Marko!',
      }), { harno: 'W2b' }),
      B.rubricW2('060_t_rw2'),
      B.examPart('060_t_spart', 'S', { minutes: 15, points: 20, tasks: 3, note: 'Rääkimine on kahekesi: sissejuhatus, esimene ülesanne (teemaküsimused ja kokkulepe) ning teine ülesanne (telefonikõne). Vahekontrolli lävi on 12 punkti, eesmärk 16.' }),
      tag(B.speaking('060_t_s0', 'Rääkimine. Sissejuhatus.', 'Eksamineerija esitab kolm lühikest küsimust teie enda kohta. Vastake igaühele kahe-kolme lausega.', ['Palun öelge oma nimi ja kus te elate.', 'Mis teile oma kodukoha juures meeldib?', 'Mida te eelmisel nädalavahetusel tegite?'], [120, 150]), { harno: 'S0' }),
      tag(B.speaking('060_t_s1', 'Rääkimine 1. Teemaküsimused „Ilm ja loodus”', 'Eksamineerija küsib ilma ja looduse kohta. Vastake põhjalikult: öelge oma mõte, põhjus ja näide.', ['Milline aastaaeg teile kõige rohkem meeldib? Miks?', 'Kuidas ilm teie tuju mõjutab?', 'Kus te looduses kõige meelsamini aega veedate?', 'Kas kliima on teie arvates muutunud? Kuidas te seda märkate?', 'Mida iga inimene saab teha, et loodust hoida?'], [120, 180]), { harno: 'S1a' }),
      teach(tag(B.ideaCard('060_t_s1b', 'Rääkimine 1. Kokkulepe.', 'Arutage ja leppige kokku, kuhu teie kursus suve lõpus ühepäevasele väljasõidule läheb. Lõpus peab olema üks ühine otsus.', 'Teie keelekursus teeb augusti lõpus ühe päeva väljasõidu. Bussi ja giidi jaoks on raha olemas, aga sõit ei tohi kesta üle kahe tunni.', ['rabamatk ja vaatetorn', 'saare külastus praamiga', 'muuseum ja vanalinn', 'kanuumatk jõel', 'talukülastus ja saun', 'rannapäev ja piknik'], 'Kuhu te lähete, mida seal teete ja miks just sinna?'), { harno: 'S1b' }),
      'Üks-ühele: õpetaja on teine eksaminand, kes eelistab alguses teist kohta; õpilane põhjendab ja jõuab kokkuleppele. Hinda: kas lõpus oli selge ühine otsus.'),
      teach(tag(B.phoneCards('060_t_s2', 'Rääkimine 2. Telefonikõne.', 'A helistab puhkemajja ja küsib infot, B on puhkemaja töötaja. Seejärel vahetage kaardid.', 'Te tahate oma perega veeta nädalavahetuse metsa ääres puhkemajas.', ['Helistaja', [
        'Tervitage ja öelge, miks helistate.', 'Küsige, kas maja on augusti viimasel nädalavahetusel vaba.', 'Küsige, kui palju maksab üks öö ja mis on hinnas.', 'Küsige, kas koera võib kaasa võtta.', 'Küsige, kuidas maja juurde saab.',
      ]], ['Puhkemaja töötaja', [
        'Maja on vaba, aga ainult laupäevast pühapäevani.', 'Üks öö maksab 90 eurot, saun ja voodipesu on hinnas.', 'Koer on lubatud, kui ta on rihma otsas.', 'Autoga saab maja ette, bussipeatus on kahe kilomeetri kaugusel.', 'Küsige helistaja nime ja telefoninumbrit.',
      ]]), { harno: 'S2' }),
      'Üks-ühele: õpetaja on puhkemaja töötaja (eksamineerija roll), siis vahetage. Hinda: kas kõik kaardi küsimused said küsitud ja vastatud.'),
      B.rubricSpeaking('060_t_rs', 'Hindamine: rääkimine (20 punkti).'),
      B.rubric('060_t_points', 'Minu punktid: kirjutamine ja rääkimine.', 'Kirjuta kirjutamise ja rääkimise punktid ning võrdle neid vahekontrolli ja eesmärgiga.', ['Kirjutamine: … / 20 (vahekontroll 12, eesmärk 16)', 'Rääkimine: … / 20 (vahekontroll 12, eesmärk 16)', 'Osa, kus jäin alla 60 %: …', 'Minu järeleaitamise plaan moodulites 13–15: …']),
      B.selfcheck('060_t_self', ['Ma tegin kõik neli eksamiosa ajapiiranguga.', 'Ma tean oma punkte igas osas ja võrdlen neid 60 % ja 80 % piiriga.', 'Ma tean, millist osa pean moodulites 13–15 kõige rohkem harjutama.', 'Ma kasutan eksamil mooduli vorme: -ks, kui-laused, põhjus ja tagajärg.'], 'Proovieksam 1 tehtud'),
    ],
  },
};

// The blocks of PILOT that are off the sheets: retire(id, why) takes one out of PILOT without its station marker (the
// „Jaam n · … · m min” heading belongs to the pilot's sheet) and hides it — its id and the learners' answers stay.
const PILOT_BLOCKS = Object.fromEntries(Object.values(PILOT).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const TITLE_FIELD = { text: 'heading', chart: 'chartTitle' };
function unstation(b) {
  if (!b.data?.station) return b;
  const { station: st, ...data } = b.data;
  const field = TITLE_FIELD[b.type] || 'title';
  data[field] = st.title;
  ['text', 'instruction'].forEach((k) => {
    if (typeof data[k] === 'string') data[k] = data[k].replace(/\n\n\*\*Kui jätsid jaama \d+ vahele, kasuta seda kaarti:\*\*[\s\S]*$/, '');
  });
  return { ...b, data };
}
const retire = (id, reason) => {
  const b = PILOT_BLOCKS[id];
  if (!b) throw new Error(`moodul 12: vana plokk ${id} puudub`);
  return hide(unstation(b), reason);
};

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 056 infogap: the weekend forecast (change -ks, impersonal)
  'a2b1-056': {
    title: 'Mis ilm nädalavahetusel tuleb?',
    phases: grammar('Keel: läheb jahedamaks · jääb soojaks · tõuseb 22 kraadini · oodatakse äikest'),
    format: 'infogap',
    topic: 'nature',
    canDo: 'Ma saan aru ilmateatest, räägin, kuidas ilm muutub, ja lepin sõbraga kokku, millal matkale minna.',
    teacherPage: {
      goal: 'Ученик понимает радиопрогноз на выходные (цифры, время, изменения) и по прогнозу договаривается с другом, когда идти в поход: läheb jahedamaks, oodatakse äikest.',
      core: [1, 2, 4], alt: 3,
      short: 'Пункт 1 (холодный старт, 90–120 секунд) → радиопрогноз (2 раза, 8 предложений с пропусками) и план в паре → пункт 4: звонок другу по картинке «Nädalavahetuse ilm» со скрытой информацией. Пункт 3 — дома в «Harjuta».',
      hook: 'Пункт 1 — ХОЛОДНАЯ задача модуля 12: ученик 90–120 секунд без помощи рассказывает, какая погода ему нравится и как погода меняла его планы. Не помогайте и не исправляйте; запишите три заметки (сколько предложений, связки ja / aga / sest / kui, формы: läheb …-ks, kraadi sooja, oodatakse). Контроль (урок 60) начнётся параллельной задачей — сравните.',
      plan: [
        '0–8: пункт 1 — холодный старт «Ilm ja minu plaanid» 90–120 с без помощи; три заметки учителя',
        '8–25: пункт 2 — слова (2 мин), радиопрогноз на выходные (2 раза; изменение погоды в контексте), 8 предложений с пропусками (Harno L3b), в паре письменно план «Aeg — Ilm — Mida teha?» и устно 3 вопроса: что меняется в воскресенье, когда гроза, какой день выбрать',
        '25–40: пункт 3 — заметить → правило (läheb / muutub / jääb + -ks; tõuseb kahekümne kraadini; kümme kraadi sooja; oodatakse äikest) → Eksaminurk R3a (штормовое предупреждение, 8 пропусков с выбором) → письмо другу 8–10 предложений',
        '40–65: пункт 4 — звонок другу по картинке «Nädalavahetuse ilm»: день и время похода в болото; у друга скрытая информация; вторая попытка без фраз — настоящий прогноз своего города на ilmateenistus.ee',
        '65–72: проверка на выходе (3 пункта), «Ma oskan …», домашнее задание (сообщение другу + голосовое сообщение 1 мин)',
        'Kui aega jääb (10 мин, только в плане учителя): ученик сравнивает погоду в Эстонии и у себя на родине (когда жарко, когда темно, сколько градусов)',
        '72–90: запас',
      ],
      sources: 'Радиопрогноз (пункт 2) и картинка «Nädalavahetuse ilm» — учебные, синоптик и цифры выдуманы; проверять не нужно (владелец 2026-11-25). Вторая попытка — настоящий сайт ilmateenistus.ee (https://www.ilmateenistus.ee).',
      groups: 'Пункт 4 в паре: A звонит и предлагает время, у B своя карточка с планами (A её не видит); потом смена ролей. Один на один вы — друг со скрытой информацией.',
      errors: [
        '«läheb jahe» вместо «läheb jahedaks» / «läheb jahedamaks» (изменение = saav kääne -ks).',
        '«tõuseb kakskümmend kraadi» вместо «tõuseb kahekümne kraadini» (до какого градуса — родительный падеж + -ni).',
        '«oodatakse äike» вместо «oodatakse äikest» (безличная форма + osastav).',
        '«kakskümmend kraadi soe» вместо «kakskümmend kraadi sooja».',
      ],
      notes: [
        'Холодный старт и урок 60 — пара «до / после»: те же три заметки, похожая тема. Сохраните заметки в карточке ученика.',
        'Обратная связь, 2 цели: -ks для изменения погоды и kraadini / kraadi sooja. Сначала подсказка, рекаст только если не исправил сам.',
      ],
    },
    discover: [
      station(teach(tag(purpose(half(B.speaking('056_d_colleague', 'Külm start: ilm ja minu plaanid', 'Räägi 90–120 sekundit ilma abita ja ilma märkmeteta. Vead on lubatud.', [
        'Milline ilm sulle meeldib? Kuidas ilm sinu nädalavahetuse plaane muudab? Kas ilm on sinu plaani kunagi rikkunud?',
      ], [90, 120])), 'Tunnis 60 on sarnane ülesanne: siis näed, kui palju rohkem sa oskad.'), { task: 'S02', level: 4, fluency: true }),
      'Külm ülesanne (mooduli 12 algus, ilma toeta). Ära aita, ära paranda, ära küsi lisaküsimusi. Märgi õpilase kaardile kolm asja: 1) mitu lauset ta ütles; 2) kas laused on seotud (ja, aga, sest, kui); 3) vormid: muutus (läheb soojaks, läks külmaks), temperatuur (kakskümmend kraadi sooja), umbisikuline (oodatakse). Hoia märkmed alles: tunnis 60 on paralleelne uus ülesanne ja te võrdlete.'), 1, 8),
      station(tag(half(B.vocab('056_d_vocab', 'Tunni sõnad.', ['ilmateade — прогноз погоды', 'äike — гроза', 'tuul — ветер', 'kraad — градус', 'pilvine — облачный', 'jahe — прохладный', 'hoiatus — предупреждение', 'muutuma — меняться'], '2')), {}), 2, 17),
      tag(purpose(why(ownText(twice(B.listening('056_d_radio', 'Raadio: nädalavahetuse ilm.', 'Loe enne laused läbi. Siis kuula kaks korda ja kirjuta igasse lünka üks sõna või number.', [
        'Saatejuht: Tere hommikust! On reede, kell on kaheksa ja nüüd räägime nädalavahetuse ilmast. Stuudios on sünoptik Marko Lepp. Marko, kas laupäeval saab looduses olla?',
        'Sünoptik: Saab küll. Laupäeva hommik on päikeseline, aga jahe, ainult kümme kraadi sooja. Päeval läheb kiiresti soojemaks ja pärastlõunal tõuseb temperatuur kahekümne kahe kraadini. Tuul on nõrk.',
        'Saatejuht: Kõlab hästi. Aga pühapäev?',
        'Sünoptik: Pühapäeval ilm muutub. Hommik on veel soe ja vaikne, aga lõuna paiku läheb taevas läänest pilviseks. Kella kahe ja viie vahel oodatakse hoovihmu ja äikest. Äikese ajal tugevneb tuul puhanguti viieteistkümne meetrini sekundis.',
        'Saatejuht: Kas see on ohtlik?',
        'Sünoptik: Keskkonnaagentuur annab pühapäevaks kollase hoiatuse. Kes tahab metsa või rappa minna, peaks minema hommikul ja olema tagasi enne kella kahte. Lagedal kohal ei tasu äikese ajal olla.',
        'Saatejuht: Ja õhtu?',
        'Sünoptik: Pärast äikest läheb märgatavalt jahedamaks. Õhtul on sooja ainult kaksteist kraadi ja öö jääb vihmaseks. Esmaspäeval sajab terve päeva.',
        'Saatejuht: Mida sa kuulajatele soovitad?',
        'Sünoptik: Laupäev on nädalavahetuse parim päev. Kui plaanite pühapäevaks matka, vaadake enne minekut veel kord ilmateadet, sest äikese aeg võib muutuda.',
        'Saatejuht: Aitäh, Marko! Järgmine ilmateade tuleb kell kaksteist.',
      ], [
        'Laupäeva hommikul on sooja ainult [kümme|10] kraadi.',
        'Laupäeva pärastlõunal tõuseb temperatuur [22|kahekümne kahe|kakskümmend kaks] kraadini.',
        'Pühapäeval lõuna paiku läheb taevas läänest [pilviseks].',
        'Hoovihmu ja äikest oodatakse kella kahe ja [viie|5] vahel.',
        'Äikese ajal on tuulepuhangud kuni [15|viisteist] meetrit sekundis.',
        'Pühapäevaks annab Keskkonnaagentuur kollase [hoiatuse].',
        'Pärast äikest läheb õhtul märgatavalt [jahedamaks].',
      ], 'g_read'))), [
        'Sünoptik: „ainult kümme kraadi sooja”.',
        'Sünoptik: „tõuseb temperatuur kahekümne kahe kraadini”.',
        'Sünoptik: „lõuna paiku läheb taevas läänest pilviseks”.',
        'Sünoptik: „Kella kahe ja viie vahel oodatakse hoovihmu ja äikest.”',
        'Sünoptik: „viieteistkümne meetrini sekundis”.',
        'Sünoptik: „annab pühapäevaks kollase hoiatuse”.',
        'Sünoptik: „Pärast äikest läheb märgatavalt jahedamaks.”',
      ]), 'Kuuled, mis ilm tuleb ja kuidas see muutub. Eksamil (Harno B1 kuulamine 3b) on sama ülesanne.'), { task: 'L04' }),
      teach(tag(purpose(B.table('056_d_plan', 'Paaris: plaan ilmateate järgi.', 'Kirjutage koos igasse ritta terve lause. Siis öelge, kumma päeva valite.', 'Aeg, Mis ilm siis on?, Mida on hea teha?', [
        'Laupäeva hommik |  | ',
        'Laupäeva pärastlõuna |  | ',
        'Pühapäeval kell 14–17 |  | ',
        'Pühapäeva õhtu |  | ',
      ], 'g_read'), 'Teie plaan on tunni lõpu kõne materjal.'), { task: 'L06' }),
      'Paarid kirjutavad koos 6–8 minutit, üks kirjutab, teine dikteerib, poole pealt vahetavad. Siis küsivad teineteiselt suuliselt: „Mis pühapäeval muutub? Millal oodatakse äikest? Kumba päeva sina valid ja miks?”. Kontrolli, et ilma lahtris on muutuse vorm (läheb soojemaks, läheb pilviseks, jääb vihmaseks). Üks-ühele: õpilane kirjutab, sina küsid iga rea juures „Miks?”.'),
      retire('056_d_open', V5_CUT),
      retire('056_d_notes', V5_CUT),
    ],
    practice: [
      station(B.notice('056_d_notice', 'Märka: kuidas ilm muutub', [
        'Raadiost: päeval **läheb** kiiresti **soojemaks** · taevas **läheb pilviseks** · pärast äikest **läheb jahedamaks** · öö **jääb vihmaseks** · pühapäeval ilm **muutub**',
        'Muutus: **läheb / muutub / jääb** + **-ks** (saav kääne): jahe → läheb **jahedaks**, jahedam → läheb **jahedamaks** · tuuline → muutub **tuuliseks** · soe → jääb **soojaks**',
        'Temperatuur **tõuseb / langeb** + omastav + **-ni**: kahekümne kahe kraadi**ni** · kümne kraadi**ni** · aga: **kümme kraadi sooja** · **kaks kraadi külma**',
        'Ilmateates umbisikuline tegumood: **oodatakse** äikest (osastav) · **soovitatakse** minna hommikul · **antakse** hoiatus',
      ], 'full'), 3, 15),
      teach(tag(purpose(why(ownText(B.cloze('056_p_cloze', 'Eksaminurk: ilmahoiatus (Harno B1 lugemine 3a)', 'Loe hoiatust ja vali igasse lünka sobiv sõna.', 'Kollane hoiatus: äike pühapäeval', [
        'Pühapäeval {*oodatakse|ootab|oodata} Kesk-Eestis äikest ja hoovihmu. Hommik on veel soe, aga lõuna paiku läheb taevas {*pilviseks|pilvine|pilvisena}. Äikese ajal tugevneb tuul viieteistkümne {*meetrini|meetrit|meetriks} sekundis.',
        '',
        'Kui plaanite matka, minge {*hommikul|hommik|hommikuks} ja olge tagasi enne kella kahte. Äikese ajal ärge seiske üksiku puu all, {*sest|kuigi|nii et} välk lööb sageli kõrgesse kohta.',
        '',
        'Pärast äikest läheb õhk palju {*jahedamaks|jahedam|jahedalt}: õhtul on sooja ainult kaksteist {*kraadi|kraad|kraadini}. Öö {*jääb|jäävad|jääma} vihmaseks, seepärast võtke kaasa soe jope.',
      ])), [
        'umbisikuline: oodatakse äikest.',
        'läheb + -ks: pilviseks.',
        'tugevneb + omastav + -ni: meetrini.',
        'Millal? → hommikul.',
        'Põhjus: sest.',
        'läheb + -ks: jahedamaks.',
        'arv + osastav: kaksteist kraadi.',
        'öö (ainsus) jääb + -ks: jääb vihmaseks.',
      ]), 'Harjutad Harno B1 lugemise 3. osa: valid igasse lünka ühe sõna kolmest. Kaheksa lünka näitavad ka, kas ilmateate vormid on käes.'), { task: 'R03', harno: 'R3a' }),
      'Eksaminurk (Harno B1 lugemine 3a, valikutega lünktekst, ~8 min). Strateegia: 1) loe kõigepealt kogu lause; 2) mõtle, kas lünka on vaja vormi (pilviseks, meetrini, kraadi) või sidesõna (sest); 3) vali alles siis. Üks-ühele: õpetaja küsib kahe lünga juures, miks teised variandid ei sobi.'),
      tag(purpose(rows(B.writing('056_p_reply', 'Kirjuta terved laused.', 'Sõber tuleb sel nädalal külla. Kirjuta talle 8–10 lauset: mis ilm sinu linnas on, kuidas see muutub ja mida koos teha.', [8, 10]), 6), 'Oma laused on sinu kõne materjal tunni lõpus.'), { task: 'W04' }),
      retire('056_p_notes', V5_DRILL),
      retire('056_p_radio', V5_CUT),
    ],
    transfer: [
      station(teach(tag(purpose(B.phoneCards('056_t_plan', 'Kõne sõbrale: millal rappa?', 'Vaata ilmaäppi üleval. A helistab sõbrale ja teeb ettepaneku, B on sõber ja vaatab oma kaarti. Leppige kokku päev ja kellaaeg. Siis vahetage rollid.',
        'Te tahate nädalavahetusel minna Kõrve rappa. Matk kestab umbes kolm tundi ja rabas ei ole varju.',
        ['Helistaja', [
          'Sina tead ilmaäpi järgi, mis ilm laupäeval ja pühapäeval tuleb.',
          'Sinu eesmärk: matk, mille ajal ei tule äikest ega tugevat vihma.',
          'Sul on laupäeval kella 12-ni töö.',
        ]], ['Sõber', [
          'Sul on pühapäeval kell 16 sünnipäev.',
          'Sa ei taha minna väga vara, enne kella 9.',
          'Sinu auto on laupäeval kella 13-ni hoolduses.',
        ]], [120, 240]), 'Pärast kõnet teate, mis päeval ja mis kell te lähete ning miks just siis.'), { task: 'S05', main: true, level: 4 }),
      'Infolünk telefonis nagu Harno B1 rääkimise 2. osas. Üks-ühele: sina oled sõber. Varjatud info: pühapäeval kell 16 on sul sünnipäev ja enne seda tahad sa veel koju jõuda; laupäeval saad sa auto alles kell 13; sa ei ole kunagi rabas käinud ja kardad äikest. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) „Läheme pühapäeval kell üksteist, siis saab kaua magada!”; 2) „Laupäeva hommikul ei saa, auto on hoolduses.”; 3) „Kas laupäeva õhtul ei ole liiga hilja?” Õnnestunud, kui õpilane ütleb ilmaäpi järgi, mis ilm millal tuleb (pühapäeval kella kahe ja viie vahel oodatakse äikest, laupäeva pärastlõunal on soe ja vaikne), pakub sobiva aja (laupäeval kell 13.30–16.30) ja kordab kokkuleppe üle. Teine katse ilma fraasideta (järgmine ülesanne): õpilane vaatab päris ilmateadet.'), 4, 25, { final: 'decide' }),
      teach(tag(purpose(B.speaking('056_t_real', 'Päris ilm: minu homne päev', 'Ava telefonis Keskkonnaagentuuri ilmateenistuse leht ilmateenistus.ee (https://www.ilmateenistus.ee) ja vaata oma linna homset ilma. Räägi paarilisele 90–120 sekundit ilma fraasideta.', [
        'Mis ilm on homme hommikul ja õhtul?',
        'Kas oodatakse vihma, tuult või äikest? Millal?',
        'Mida sa homme teed ja mida sa ilma tõttu muudad?',
      ], [90, 120]), 'Päris leht: loed eesti keeles päris ilmateadet ja plaanid selle järgi oma päeva.'), { task: 'S13', level: 4, fluency: true }),
      'Seosülesanne (päris allikas). Õpilane avab lehe ise; kui telefoni ei ole, näita lehte oma ekraanilt. Üks-ühele: sina vaatad oma linna ilma ja räägid kõigepealt kolm lauset, siis õpilane; küsi üks lisaküsimus („Kas sa võtad vihmavarju kaasa?”). Ära paranda kõne ajal, märgi üks vorm, mida pärast koos parandate.'),
      tag(exitCheck(why(purpose(B.gaps('056_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Pühapäeval lõuna paiku läheb taevas [pilviseks] (pilvine).',
        'Laupäeva pärastlõunal tõuseb temperatuur kahekümne kahe [kraadini] (kraad).',
        'Pühapäeval kella kahe ja viie vahel [oodatakse] äikest (ootama).',
      ], '', 'full', 'g_vocab'), 'Kolm lauset näitavad, kas ilmateate vormid on käes.'), ['läheb + -ks: pilviseks.', 'tõuseb + -ni: kraadini.', 'umbisikuline: oodatakse.'])), {}),
      purpose(B.selfcheck('056_t_self', ['Ma ütlen, kuidas ilm muutub: läheb jahedamaks, muutub tuuliseks, jääb soojaks.', 'Ma ütlen temperatuuri: tõuseb kahekümne kraadini, kümme kraadi sooja.', 'Ma saan aru raadio ilmateatest: numbrid, kellaajad ja hoiatus.', 'Ma lepin ilmateate järgi kokku, millal matkale minna.'], 'Matkapäev valitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('056_t_home', 'Kodus: sõnum sõbrale.', 'Kirjuta sõbrale 5–7 lauset: mis päeval ja mis kell te lähete ja miks. Saada ka 1-minutiline häälsõnum.', [5, 7]), 'Sõber teab plaani ja õpetaja kuuleb, kas ilma vormid tulid õigesti.')), { task: 'W02' }),
      retire('056_t_sit', V5_CUT),
      retire('056_t_app', V5_CUT),
      retire('056_t_talk', V5_CUT),
      retire('056_t_message', V5_CUT),
    ],
  },

  // ---------------------------------------------------------------- 057 project: the storm came early (narrative past, kui-clauses)
  'a2b1-057': {
    title: 'Äike tuli varem',
    phases: grammar('Keel: Kui välk lõi, pöörasime tagasi · enne kui · pärast seda, kui'),
    format: 'project',
    topic: 'freetime',
    canDo: 'Ma loen matkaloo, jutustan sündmused õiges järjekorras (kui, enne kui, pärast seda, kui) ja kirjutan matkagrupile postituse, mis juhtus ja mida ma sellest õppisin.',
    teacherPage: {
      goal: 'Ученик читает рассказ о походе, пересказывает события по порядку (kui, enne kui, pärast seda, kui — глагол сразу после придаточного) и пишет пост группе туристов.',
      core: [1, 2, 4], alt: 3,
      short: 'Пункт 1 → текст «Kuidas äike meid rabas kätte sai» и 8 вопросов, в паре — события по порядку → пункт 4: пост 60–90 слов по картинке «Äike rabas» без данного начала, партнёр задаёт вопросы. Пункт 3 — дома в «Harjuta».',
      hook: '«Kas sind on kunagi looduses vihm, torm või äike üllatanud?» Сначала ответьте сами (2–3 предложения), потом ученик. Вопрос из урока 56 без записей: как меняется погода в воскресенье (läheb pilviseks, oodatakse äikest).',
      plan: [
        '0–8: пункт 1 — погода, которая удивила; одно предложение с -ks (повторение урока 56)',
        '8–25: пункт 2 — слова, блог «Kuidas äike meid rabas kätte sai» (≈ 205 слов), 8 вопросов, в паре письменно: события по порядку (Kui …, Pärast seda, kui …), потом пересказ по очереди',
        '25–40: пункт 3 — заметить → правило (kui / enne kui / pärast seda, kui / samal ajal kui + глагол сразу в главном предложении; enne + omastav; oli lubanud) → 8 соединений → план своей истории в паре (рассказать вслух) → 8–10 своих предложений',
        '40–65: пункт 4 — пост в группу туристов 60–90 слов без данного начала по картинке «Äike rabas» или о своей прогулке (15 мин); чтение вслух, партнёр — другой турист, задаёт два вопроса; вторая попытка — дописать недостающее',
        '65–72: проверка на выходе, «Ma oskan …», домашнее задание (пост начисто + запись своей истории 60–90 с)',
        'Kui aega jääb (10 мин, только в плане учителя): ученик рассказывает, какая природа и погода опасны у него на родине и что там делают',
        '72–90: запас',
      ],
      sources: 'Блог (пункт 2) и картинка «Äike rabas» — учебные, автор и события выдуманы; проверять не нужно (владелец 2026-11-25).',
      groups: 'Пункт 2 в паре: A пишет первые три строки таблицы, B — последние три, потом рассказывают по очереди. Пункт 4: каждый пишет сам, потом читает партнёру. Один на один вы — турист из группы, который задаёт вопросы.',
      errors: [
        '«Kui välk lõi, me pöörasime tagasi» вместо «Kui välk lõi, pöörasime me tagasi» (после придаточного глагол главного предложения сразу).',
        '«enne kui äikest» вместо «enne äikest» или «enne kui äike tuli» (после enne kui нужен глагол).',
        '«Äike tuli varem, kui ilmateade lubas» → лучше «oli lubanud» (то, что было раньше).',
        '«läksime rabas» вместо «läksime rappa» (куда? — rappa).',
      ],
      notes: [
        'Пост — продукт урока: в нём место и время, три события по порядку (два kui-предложения), как вернулись и один совет.',
        'Обратная связь, 2 цели: порядок слов после kui-предложения и прошедшее время. Сначала подсказка, рекаст только если не исправил сам.',
      ],
    },
    discover: [
      station(teach(tag(purpose(half(B.speaking('057_d_opinion', 'Kas ilm on sind looduses üllatanud?', 'Vasta paarilisele kahe-kolme lausega. Siis vahetage: paariline räägib, sina küsid.', [
        'Kas sind on kunagi looduses vihm, torm või äike üllatanud? Mis juhtus?',
        'Ütle ilma märkmeteta üks lause eelmisest tunnist: kuidas ilm pühapäeval muutub?',
      ], [70, 90])), 'Sinu kogemus on tänase tunni algus: lõpus kirjutad oma matkaloo.'), { task: 'S01', fluency: true }),
      'Üks-ühele: räägi kõigepealt oma lugu ilmast looduses (2–3 lauset), siis küsi õpilaselt üks lisaküsimus („Mis sa siis tegid?”). Ära paranda.'), 1, 8),
      station(tag(half(B.vocab('057_d_vocab', 'Tunni sõnad.', ['matk — поход', 'laudtee — деревянный настил', 'vaatetorn — смотровая башня', 'raba — болото', 'välk — молния', 'müristama — греметь', 'tagasi pöörama — повернуть назад', 'kiirustama — спешить', 'kukkuma — падать', 'märg — мокрый'], '2')), { topic: ['laudtee', 'vaatetorn'] }), 2, 17),
      tag(purpose(why(ownText(B.reading('057_d_bog', 'Matkaja blogi.', 'Loe teksti. Vasta igale küsimusele 1–5 sõnaga.', 'Kuidas äike meid rabas kätte sai', [
        'Eelmisel laupäeval läksime sõbranna Katiga Kõrve rappa. Ilmateade lubas äikest alles õhtul, nii et me ei kiirustanud. Kui me kell kümme parklasse jõudsime, paistis päike ja oli palav. Võtsime kaasa võileivad, vee ja fotoaparaadi, aga vihmajoped jäid autosse.',
        '',
        'Kõigepealt kõndisime mööda laudteed vaatetornini. See on umbes kaks kilomeetrit. Tornist paistis kogu raba: väikesed järved, männid ja kaugel mets. Samal ajal kui ma tornis pilte tegin, märkas Kati läänes tumedat pilve. Me arvasime, et see läheb mööda.',
        '',
        'Pärast seda, kui me tornist alla tulime, lõi esimene välk. Ma lugesin sekundeid: müristas alles kaheteistkümne sekundi pärast. Äike oli umbes nelja kilomeetri kaugusel. Raba on lage koht, seal ei ole ühtegi suurt puud ega maja. Me pöörasime kohe tagasi. Kati kartis väga, aga ma ütlesin, et peame lihtsalt rahulikult ja kiiresti kõndima.',
        '',
        'Enne kui me metsa servale jõudsime, hakkas tugevasti sadama. Laudtee läks libedaks ja me pidime aeglaselt kõndima. Tee peal nägime teisi matkajaid, kes jooksid samuti parkla poole. Kui me lõpuks autosse istusime, olime täiesti märjad, aga terved.',
        '',
        'Hiljem kodus lugesin, et äike tuli kolm tundi varem, kui ilmateade oli lubanud. Nüüd vaatan alati enne matka ilmaradarit ja võtan kaasa vihmajope. Ja kui taevas läheb tumedaks, ei oota ma enam, vaid pööran kohe tagasi.',
        '',
        'Kristel, blogi „Matkasaapad”',
      ], [
        ['Miks nad hommikul ei kiirustanud?', 'ilmateade lubas äikest alles õhtul|äike pidi tulema õhtul|äikest lubati õhtul'],
        ['Mis ilm oli, kui nad parklasse jõudsid?', 'paistis päike ja oli palav|päikeseline ja palav|palav'],
        ['Mida märkas Kati, samal ajal kui kirjutaja tornis pilte tegi?', 'tumedat pilve läänes|tumedat pilve|tumeda pilve'],
        ['Kui kaugel oli äike esimese välgu ajal?', 'umbes nelja kilomeetri kaugusel|neli kilomeetrit|4 km|nelja kilomeetri kaugusel'],
        ['Miks on äike rabas ohtlik?', 'raba on lage koht|raba on lage|seal ei ole puid ega maja'],
        ['Mis juhtus, enne kui nad metsa servale jõudsid?', 'hakkas tugevasti sadama|hakkas sadama'],
        ['Miks pidid nad aeglaselt kõndima?', 'laudtee läks libedaks|laudtee oli libe'],
        ['Mida teeb kirjutaja nüüd enne matka?', 'vaatab ilmaradarit ja võtab vihmajope|vaatab ilmaradarit|vaatab ilmaradarit ja võtab kaasa vihmajope'],
      ])), [
        'Esimene lõik: „Ilmateade lubas äikest alles õhtul, nii et me ei kiirustanud.”',
        'Esimene lõik: „paistis päike ja oli palav”.',
        'Teine lõik: „märkas Kati läänes tumedat pilve”.',
        'Kolmas lõik: „Äike oli umbes nelja kilomeetri kaugusel.”',
        'Kolmas lõik: „Raba on lage koht, seal ei ole ühtegi suurt puud ega maja.”',
        'Neljas lõik: „Enne kui me metsa servale jõudsime, hakkas tugevasti sadama.”',
        'Neljas lõik: „Laudtee läks libedaks”.',
        'Viies lõik: „Nüüd vaatan alati enne matka ilmaradarit ja võtan kaasa vihmajope.”',
      ]), 'Enne kui sa oma loo kirjutad, loed, kuidas teine matkaja jutustab, mis juhtus ja mis järjekorras. Eksamil (Harno B1 lugemine 2) on samuti üks pikem tekst ja küsimused.'), { task: 'R15', harno: 'R2', voice: 'forum' }),
      teach(tag(purpose(B.table('057_d_order', 'Paaris: mis juhtus ja mis siis?', 'Kirjutage koos teksti järgi iga rea lõppu, mis juhtus. Kirjutage terve lause minevikus.', 'Algus, Mis juhtus?', [
        'Kui nad parklasse jõudsid, | ',
        'Samal ajal kui kirjutaja tornis pilte tegi, | ',
        'Pärast seda, kui nad tornist alla tulid, | ',
        'Kui müristas kaheteistkümne sekundi pärast, | ',
        'Enne kui nad metsa servale jõudsid, | ',
        'Kui nad lõpuks autosse istusid, | ',
      ], 'g_notice'), 'Teie ühine järjekord on loo selgroog: selle järgi jutustad ja kirjutad hiljem oma loo.'), { task: 'G02' }),
      'Paarid kirjutavad koos 6–8 minutit: A kirjutab kolm esimest rida, B kolm viimast, siis loevad kordamööda kogu loo ette. Kontrolli sõnajärge: pärast kui-lauset tuleb tegusõna kohe (Kui nad parklasse jõudsid, paistis päike). Üks-ühele: õpilane kirjutab, sina loed kaks rida valesti („… , me pöörasime tagasi”) ja õpilane parandab.'),
      teach(tag(purpose(B.speaking('057_d_retell', 'Jutustage kordamööda.', 'Jutustage tabeli järgi, mis matkal juhtus. A alustab, B jätkab pärast esimest välku. Siis öelge oma arvamus.', [
        'Mis juhtus enne esimest välku?',
        'Mis juhtus pärast seda, kui välk lõi?',
        'Mida tegid Kristel ja Kati õigesti ja mida valesti?',
      ], [90, 120], '', 'g_read'), 'Jutustad teise matkaja loo õiges järjekorras ja ütled, mida temalt õppida.'), { task: 'S07', fluency: true }),
      'Üks-ühele: õpilane jutustab kogu loo, sina küsid vahel „Oota, kas see oli enne või pärast vihma?”. Lõpus ütleb kumbki, mida Kristel ja Kati oleksid võinud teisiti teha.'),
      retire('057_d_time', V5_CUT),
    ],
    practice: [
      station(B.notice('057_d_notice', 'Märka: kuidas lugu edasi viia', [
        'Tekstist: **Kui** me parklasse jõudsime, **paistis** päike. · **Samal ajal kui** ma pilte tegin, **märkas** Kati pilve. · **Pärast seda, kui** me alla tulime, **lõi** välk. · **Enne kui** me metsa jõudsime, **hakkas** sadama.',
        'Kõrvallause on ees → pealauses tuleb **tegusõna kohe**: Kui välk lõi, **pöörasime** me tagasi. (mitte: …, me pöörasime)',
        '**enne kui** + tegusõna (enne kui äike tuli) · **enne** + omastav (enne äikest) · **pärast seda, kui** + tegusõna · **pärast** + omastav (pärast vihma)',
        'Mis oli juba varem juhtunud? Äike tuli varem, kui ilmateade **oli lubanud**. (enneminevik, moodul 10)',
      ], 'full'), 3, 15),
      tag(purpose(why(B.transformation('057_p_join', 'Üks lause kahest.', 'Ühenda kaks lauset üheks antud sõnaga. Pane tähele, kus on tegusõna.', [
        ['Välk lõi. Me hakkasime kohe sekundeid lugema.', 'kui', 'Kui välk lõi, hakkasime kohe sekundeid lugema.'],
        ['Me jõudsime torni juurde. Siis tuli äike.', 'enne kui', 'Me jõudsime torni juurde, enne kui äike tuli.'],
        ['Hakkas sadama. Me kiirustasime metsa poole.', 'pärast seda, kui', 'Pärast seda, kui hakkas sadama, kiirustasime metsa poole.'],
        ['Isa tegi pilte. Samal ajal märkas laps pilve.', 'samal ajal kui', 'Samal ajal kui isa pilte tegi, märkas laps pilve.'],
        ['Me jõudsime metsa. Rada oli vee all.', 'kui', 'Kui me metsa jõudsime, oli rada vee all.'],
        ['Raadio lubas äikest õhtul. Äike tuli varem.', 'oli lubanud', 'Äike tuli varem, kui raadio oli lubanud.'],
        ['Me istusime autosse. Vihm lõppes.', 'kui', 'Kui me autosse istusime, lõppes vihm.'],
        ['Me jõime teed. Siis sõitsime koju.', 'pärast seda, kui', 'Pärast seda, kui me teed jõime, sõitsime koju.'],
      ]), [
        'Kui-lause ees → tegusõna kohe: hakkasime.',
        'enne kui + tegusõna lõpus: tuli.',
        'Pärast seda, kui … → tegusõna kohe: kiirustasime.',
        'Samal ajal kui … → tegusõna kohe: märkas.',
        'Kui-lause ees → tegusõna kohe: oli.',
        'Varasem asi: oli lubanud.',
        'Kui-lause ees → lõppes.',
        'Pärast seda, kui … → sõitsime.',
      ]), 'Kaheksa lauset näitavad, kas loo sõnajärg on käes.'), { task: 'G05' }),
      teach(tag(purpose(B.planning('057_p_plan', 'Paaris: minu loo plaan.', 'Kirjuta igale küsimusele paar märksõna. Siis jutusta paarilisele ja paariline küsib ühe küsimuse.', [
        'Kus ja millal see oli?',
        'Mis oli plaan?',
        'Mis juhtus, kui ilm muutus?',
        'Mis juhtus pärast seda?',
        'Kuidas see lõppes ja mida sa õppisid?',
      ], 3), 'Plaan aitab sul oma lugu õiges järjekorras jutustada ja kirjutada.'), { task: 'W11' }),
      'Paarid kirjutavad märksõnad (3 min) ja jutustavad siis oma loo plaani järgi (1–2 min igaüks); kuulaja küsib: „Ja mis siis juhtus?”. Üks-ühele: õpilane jutustab, sina küsid ühe lisaküsimuse ja märgid ühe kui-lause, kus tegusõna oli valel kohal.'),
      tag(purpose(rows(B.writing('057_p_sent', 'Kirjuta terved laused.', 'Kirjuta 8–10 lauset ühest oma matkast või jalutuskäigust, kus ilm muutus: mis juhtus kõigepealt, mis siis ja mis lõpuks.', [8, 10]), 11), 'Oma laused on sinu postituse materjal.'), { task: 'W05' }),
      retire('057_d_helgi', V5_CUT),
      retire('057_p_board', V5_CUT),
    ],
    transfer: [
      station(teach(tag(purpose(rows(B.writing('057_t_blog', 'Postitus matkagrupile „Matkame Eestis”.', 'Kirjuta 8–11 lauset (60–90 sõna) ilma antud alguseta: kus ja millal, mis juhtus, kuidas tagasi saite, mida soovitad.', [8, 11]), 8), 'Teised matkajad saavad teada, mis juhtus ja mida õppida.'), { task: 'W06', main: true, level: 4 }),
      'Mooduli vaba kirjutamine (ilma antud alguse ja fraasideta). Õpilane kirjutab 15 minutit ilma abita (pildiloo „Äike rabas” järgi — kell 10 parklas, kell 11 vaatetornis, kell 11.20 tume pilv, kell 11.30 välk ja 12 sekundit, kell 11.50 vihm ja libe laudtee, kell 12.30 märjad autos — või oma matka järgi). Siis loeb paarilisele (või sulle) ette; kuulaja on teine matkaja ja küsib kaks küsimust, millele postituses vastust ei ole („Kas te kartsite?”, „Mida sa järgmisel korral teisiti teed?”) — õpilane vastab ilma postituseta. Teine katse: õpilane lisab postitusse ühe puuduva asja (kellaaeg, nõuanne). Kontrolli: koht ja aeg, vähemalt kaks kui-, enne kui- või pärast seda, kui -lauset õige sõnajärjega, üks nõuanne. Parandatud versioon on kodutöö.'), 4, 25, { final: 'explain' }),
      tag(exitCheck(why(purpose(B.gaps('057_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Kui välk lõi, [pöörasime] me kohe tagasi (pöörama).',
        'Enne kui me metsa jõudsime, [hakkas] tugevasti sadama (hakkama).',
        'Äike tuli varem, kui ilmateade oli [lubanud] (lubama).',
      ], '', 'full', 'g_vocab'), 'Kolm lauset näitavad, kas loo vormid on käes.'), ['Kui-lause ees → tegusõna kohe: pöörasime.', 'Enne kui … → hakkas.', 'enneminevik: oli lubanud.'])), {}),
      purpose(B.selfcheck('057_t_self', ['Ma jutustan õiges järjekorras: kui, enne kui, pärast seda, kui, samal ajal kui.', 'Ma panen tegusõna õigesse kohta: Kui välk lõi, pöörasime me tagasi.', 'Ma saan aru matkaloost ja leian, mis juhtus enne ja mis pärast.', 'Ma kirjutan postituse: mis juhtus ja mida sellest õppida.'], 'Lugu jutustatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.speaking('057_t_rec', 'Kodus: minu matkalugu.', 'Jutusta oma lugu ilma postitust vaatamata ja salvesta 60–90 sekundit.', [
        'Kus ja millal see oli?',
        'Mis juhtus, kui ilm muutus?',
        'Mis juhtus pärast seda?',
        'Mida sa sellest õppisid?',
      ], [60, 90]), 'Õpetaja kuulab, kas tegusõna on pärast kui-lauset õiges kohas.')), { task: 'S15', fluency: true }),
      homework('057_t_homework', ['1. Paranda postitus õpetaja märkuste järgi ja kirjuta puhtalt.', '2. Salvesta oma matkalugu (ülesanne üleval).', '3. Kirjuta vihikusse viis lauset: Kui …, … ; Enne kui …, … ; Pärast seda, kui …, … .', `4. ${WORDS_HOME}`, NO_RECORDING]),
      retire('057_t_post', 'v5 (2026-11-25): postitus on nüüd kirjutamisplokk 057_t_blog (pilt ja ülesanne samal lehel)'),
      retire('057_t_sit', V5_CUT),
      retire('057_t_search', V5_CUT),
    ],
  },

  // ---------------------------------------------------------------- 058 case: after the storm (cause and result)
  'a2b1-058': {
    title: 'Pärast tormi',
    phases: grammar('Keel: tugeva tuule tõttu · kuna · seepärast jäid bussid hiljaks · nii et'),
    format: 'case',
    topic: 'home',
    canDo: 'Ma saan aru tormiuudisest, seletan põhjust ja tagajärge ja helistan kindlustusse, kui osa kahjust jäi hüvitamata.',
    teacherPage: {
      goal: 'Ученик понимает радионовость о буре и по телефону со страховой объясняет причину и следствие (tormi tõttu, kuna, seepärast, nii et), чтобы ущерб возместили.',
      core: [1, 2, 4], alt: 3,
      short: 'Пункт 1 → новости по радио (2 раза, 8 вопросов с выбором) и таблица «причина — следствие» в паре → пункт 4: звонок в страховую по картинке «Kahjuteade» со скрытой информацией. Пункт 3 — дома в «Harjuta».',
      hook: '«Kas sinu kodus on kunagi elekter või vesi pikalt ära olnud?» Сначала ответьте сами (2–3 предложения), потом ученик. Вопрос из урока 57 без записей: одно предложение с kui (Kui välk lõi, …).',
      plan: [
        '0–8: пункт 1 — отключение света или воды; одно предложение с kui (повторение урока 57)',
        '8–25: пункт 2 — слова, утренние новости о буре (2 раза, 8 вопросов с выбором, Eksaminurk Harno L2), в паре письменно таблица «причина — следствие» и устно 3 вопроса',
        '25–40: пункт 3 — заметить → правило (tõttu / pärast + omastav; sest, kuna; seepärast / seetõttu + глагол сразу; nii et) → 8 форм в предложениях → 9–11 своих предложений',
        '40–65: пункт 4 — звонок в страховую по картинке «Kahjuteade»: крышу сарая возмещают, еду и насос нет; у сотрудника скрытая информация; вторая попытка без фраз — своя буря или отключение света',
        '65–72: проверка на выходе, «Ma oskan …», домашнее задание (письмо в страховую + голосовое сообщение 1 мин)',
        'Kui aega jääb (10 мин, только в плане учителя): ученик рассказывает, к какой непогоде готовятся у него на родине и что держат дома',
        '72–90: запас',
      ],
      sources: 'Новости (пункт 2) и картинка «Kahjuteade» — учебные, страховая, договор и суммы выдуманы; проверять не нужно (владелец 2026-11-25).',
      groups: 'Пункт 4 в паре: A — клиент, B — сотрудник страховой (карточки на листе); потом смена ролей и своя история. Один на один вы — сотрудник со скрытой информацией.',
      errors: [
        '«seepärast me jäime koju» вместо «seepärast jäime me koju» (после seepärast / seetõttu глагол сразу).',
        '«Kuna elekter oli ära, sügavkülmik ei töötanud» вместо «…, ei töötanud sügavkülmik» (после придаточного — сразу глагол).',
        '«tugev tuule tõttu» вместо «tugeva tuule tõttu» (перед tõttu / pärast — родительный падеж с согласованием).',
        '«sest et» — это НЕ ошибка в эстонском, не исправлять.',
      ],
      notes: [
        'Звонок — продукт урока: в нём что случилось, причина и следствие (минимум три связи), одно ясное требование и договорённость.',
        'Обратная связь, 2 цели: tõttu с родительным падежом и порядок слов после seepärast / kuna. Сначала подсказка, рекаст только если не исправил сам.',
      ],
    },
    discover: [
      station(teach(tag(purpose(half(B.speaking('058_d_ready', 'Mida sa teed, kui elekter kaob?', 'Vasta paarilisele kahe-kolme lausega. Siis vahetage: paariline räägib, sina küsid.', [
        'Mida sa teed, kui elekter on terve päeva ära?',
        'Üks lause eelmisest tunnist: mis juhtus, kui välk lõi?',
      ], [70, 90])), 'Sinu kogemus on tunni algus: lõpus helistad kindlustusse.'), { task: 'S14', fluency: true }),
      'Üks-ühele: räägi kõigepealt oma kogemusest elektrikatkestusega (2–3 lauset), siis küsi õpilaselt üks lisaküsimus („Mida sa siis tegid?”). Ära paranda.'), 1, 8),
      station(tag(half(B.vocab('058_d_vocab', 'Tunni sõnad.', ['torm — буря', 'elekter — электричество', 'rike — авария', 'kahju — ущерб', 'kindlustus — страховка', 'hüvitama — возмещать', 'põhjus — причина', 'tagajärg — последствие'], '2')), { topic: ['hüvitama', 'rike'] }), 2, 17),
      tag(purpose(why(ownText(B.examListen('058_d_radio', 'Raadiouudised: öine torm.', 'Kuula kaks korda. Märgi, kas väide on õige või vale.', 'truefalse', [
        'Diktor: Head kuulajad, kell on seitse ja algavad uudised. Öösel jõudis Läänemerelt Eestisse tugev torm. Meie reporter Kaarel Mänd on Lääne-Virumaal.',
        'Reporter: Tere! Siin oli öösel väga tuuline. Tuulepuhangud ulatusid rannikul kahekümne viie meetrini sekundis. Tugeva tuule tõttu murdusid paljud puud ja kukkusid teedele ning elektriliinidele.',
        'Diktor: Kui paljudel inimestel ei ole praegu elektrit?',
        'Reporter: Hommikul oli ilma elektrita umbes kaheksa tuhat kodu, enamasti maal. Võrguettevõtte sõnul võtab parandamine aega vähemalt ööpäeva, sest paljud teed on veel kinni.',
        'Diktor: Kas keegi sai viga?',
        'Reporter: Õnneks mitte. Päästjad said öö jooksul üle saja väljakutse. Ühes külas kukkus suur kask maja katusele, aga pere magas teises toas.',
        'Diktor: Kuidas on lood liiklusega?',
        'Reporter: Maanteel Rakvere lähedal lebas suur kuusk, seepärast oli tee kaks tundi suletud. Mitu bussi jäi hiljaks. Ka praamid ei sõitnud öösel tormi tõttu.',
        'Diktor: Mida päästjad soovitavad?',
        'Reporter: Täna ei tasu metsa minna, sest puud võivad veel kukkuda. Mahakukkunud elektrijuhtmeid ei tohi puudutada. Kui elektrit ei ole, avage külmiku ust võimalikult harva, nii et toit püsiks kauem külm.',
        'Diktor: Aitäh, Kaarel! Õhtuks tuul nõrgeneb.',
      ], [
        ['Tugev torm jõudis Eestisse öösel.', true],
        ['Paljud puud murdusid tugeva vihma tõttu.', false],
        ['Hommikul oli ilma elektrita umbes kaheksa tuhat kodu.', true],
        ['Elektri parandamine võtab aega ainult paar tundi.', false],
        ['Tormis sai üks pere raskelt viga.', false],
        ['Maantee oli suletud, sest teel lebas suur kuusk.', true],
        ['Päästjad soovitavad täna metsa mitte minna.', true],
        ['Külmiku ust tasub avada tihti, et toit jahtuks.', false],
      ])), [
        'Diktor: „Öösel jõudis Läänemerelt Eestisse tugev torm.”',
        'Reporter: „Tugeva tuule tõttu murdusid paljud puud”.',
        'Reporter: „umbes kaheksa tuhat kodu”.',
        'Reporter: „sest paljud teed on veel kinni”.',
        'Reporter: „Õnneks mitte.”',
        'Reporter: „lebas suur kuusk, seepärast oli tee kaks tundi suletud”.',
        'Reporter: „Täna ei tasu metsa minna”.',
        'Reporter: „nii et toit püsiks kauem külm”.',
      ]), 'Kuuled, mis tormis juhtus ja miks (Harno B1 kuulamine 4).'), { task: 'L05', harno: 'L4', voice: 'news' }),
      teach(tag(purpose(B.table('058_d_why', 'Paaris: põhjus ja tagajärg.', 'Kirjutage põhjus (tõttu, sest) või tagajärg (seepärast, nii et).', 'Mis juhtus?, Põhjus või tagajärg', [
        'Puud kukkusid elektriliinidele. | ',
        'Teel lebas suur kuusk. | ',
        'Elektrit ei ole. | ',
      ], 'g_read'), 'Teie tabel on hea kõne materjal.'), { task: 'L11' }),
      'Paarid kirjutavad koos 6–8 minutit, iga rida terve lausega; siis küsivad suuliselt: „Mis juhtus öösel ja miks? Milline tagajärg oli kõige suurem?” (… , seepärast murdusid puud. Tugeva tuule tõttu … Teel lebas kuusk, seepärast oli tee suletud.). Üks-ühele: õpilane kirjutab, sina loed iga rea põhjuse ja õpilane ütleb tagajärje suuliselt enne kirjutamist.'),
      retire('058_d_news', V5_CUT),
    ],
    practice: [
      station(B.notice('058_d_notice', 'Märka: põhjus ja tagajärg', [
        'Uudisest: **tugeva tuule tõttu** murdusid puud · tee oli suletud, **seepärast** jäid bussid hiljaks · parandamine võtab aega, **sest** teed on kinni · avage ust harva, **nii et** toit püsiks külm',
        'Põhjus + lause: **sest** / **kuna**: **Kuna** tee oli kinni, **jäi** buss hiljaks. (pärast kuna-lauset tegusõna kohe)',
        'Põhjus + omastav: **tugeva tuule tõttu** · **tormi pärast** (omastav + tõttu / pärast)',
        'Tagajärg: **seepärast** / **seetõttu** + tegusõna kohe: …, seepärast **jäid** bussid hiljaks. · **nii et** + tavaline sõnajärg: …, nii et toit läks halvaks.',
      ], 'full'), 3, 15),
      tag(purpose(why(B.gaps('058_p_forms', 'Põhjus ja tagajärg lauses.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Puud murdusid [tugeva] tuule tõttu (tugev).',
        'Kuna tee oli kinni, [jäid] bussid hiljaks (jääma).',
        'Teel lebas kuusk, seepärast [oli] tee kaks tundi suletud (olema).',
        'Elektrit ei olnud, nii et toit [läks] halvaks (minema).',
        'Praamid ei sõitnud öösel [tormi] tõttu (torm).',
        'Kuna elekter oli ära, ei [töötanud] sügavkülmik (töötama).',
        'Pump läks katki, seetõttu [ostsime] uue (ostma).',
        'Elektrikatkestuse tõttu läks liha [halvaks] (halb).',
      ], '', 'full', 'g_notice'), [
        'omastav + tõttu: tugeva tuule.',
        'Kuna-lause ees → tegusõna kohe: jäid.',
        'seepärast → tegusõna kohe: oli.',
        'nii et + tavaline sõnajärg: toit läks.',
        'omastav + tõttu: tormi.',
        'Kuna-lause ees → tegusõna kohe: ei töötanud.',
        'seetõttu → tegusõna kohe: ostsime.',
        'läks + -ks: halvaks.',
      ]), 'Kaheksa lauset näitavad, kas põhjus ja tagajärg on käes.'), { task: 'G13' }),
      tag(purpose(rows(B.writing('058_t_helgi', 'Kirjuta terved laused.', 'Sõber ei olnud öösel Eestis. Kirjuta talle 9–11 lauset: mis tormis juhtus ja miks. Igas lauses põhjus või tagajärg.', [9, 11]), 10), 'Oma laused on sinu kõne materjal tunni lõpus.'), { task: 'W12' }),
      retire('058_d_fix', V5_DRILL),
      retire('058_p_cloze', V5_CUT),
      retire('058_p_fence', V5_CUT),
    ],
    transfer: [
      station(teach(tag(purpose(B.phoneCards('058_t_call', 'Kõne kindlustusse: toit ja pump', 'Vaata kahjuteadet üleval. A on klient ja helistab kindlustusse, B on klienditeenindaja. Siis vahetage rollid.',
        'Torm murdis teie suvekodu juures elektriliini. Kindlustus hüvitab kuuri katuse, aga toitu ja pumpa mitte: „need ei ole tormikahjud”.',
        ['Klient', [
          'Kahjuteade KK-2318: elektrit ei olnud 30 tundi.',
          'Lepingu järgi hüvitatakse elektrikatkestuse kahju, kui katkestus kestis üle 24 tunni.',
          'Sinu eesmärk: kindlustus hüvitab ka toidu ja pumba või vaatab otsuse kindlaks päevaks üle.',
          'Sul on fotod, aga elektriku kirjalikku hinnangut ei ole.',
        ]], ['Klienditeenindaja', [
          'Otsus tehti ainult tormi kirjelduse põhjal.',
          'Ülevaatamiseks on vaja võrguettevõtte katkestusteadet.',
          'Pumba kohta on vaja elektriku hinnangut.',
          'Tavaline ülevaatus võtab 10 tööpäeva.',
        ]], [120, 240]), 'Pärast kõnet on teil kokkulepe: mida kindlustus hüvitab või mida ja mis ajaks sa saadad.'), { task: 'S04', main: true, level: 4 }),
      'Telefonikõne nagu Harno B1 rääkimise 2. osas. Üks-ühele: sina oled klienditeenindaja. Varjatud info: otsuse tegi kahjukäsitleja ainult tormi kirjelduse põhjal; võrguettevõtte katkestusteade on internetis olemas ja sobib tõendiks; kui klient põhjendab, saab ülevaatuse teha 3 tööpäevaga. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) „Kas teil on elektriku kirjalik hinnang pumba kohta?” — õpilasel seda ei ole; 2) „Toidu eest võime maksta, pumba eest mitte.”; 3) „Kahjuteade tuli liiga hilja, tähtaeg oli 3 päeva.” — teade saadeti järgmisel hommikul, õpilane peab viisakalt vastu vaidlema. Õnnestunud, kui õpilane seletab põhjuse ja tagajärje (vähemalt kolm sidet: tormi tõttu, kuna, seepärast, nii et), vaidleb viisakalt vastu ja kordab kokkuleppe üle (mida, kuhu ja mis päevaks saata). Teine katse ilma fraasideta: järgmine ülesanne.'), 4, 25, { final: 'complain' }),
      teach(tag(purpose(B.speaking('058_t_own', 'Sinu lugu: torm või elektrikatkestus.', 'Räägi paarilisele 90–120 sekundit ilma fraasideta. Paariline küsib lõpus ühe küsimuse.', [
        'Millal ilm või elektrikatkestus sinu plaane muutis?',
        'Mis oli põhjus ja millised olid tagajärjed? Kas see oli sarnane uudise tormiga?',
        'Kes aitas ja mida sa järgmisel korral teisiti teed?',
      ], [90, 120]), 'Räägid oma loo põhjuse ja tagajärjega: nii saab kuulaja aru, mis juhtus ja miks.'), { task: 'S06', level: 4, fluency: true }),
      'Üks-ühele: õpilane räägib, sina küsid ühe lisaküsimuse („Kas sa olid selleks valmis?”). Õnnestunud, kui loos on vähemalt kaks põhjuse ja tagajärje sidet ja selge järjekord.'),
      tag(exitCheck(why(purpose(B.gaps('058_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Tugeva [tuule] tõttu murdusid paljud puud (tuul).',
        'Tee oli kinni, seepärast [jäid] bussid hiljaks (jääma).',
        'Elektrit ei olnud 30 tundi, nii et toit läks [halvaks] (halb).',
      ], '', 'full', 'g_vocab'), 'Kolm lauset näitavad, kas põhjus ja tagajärg on käes.'), ['omastav + tõttu: tuule.', 'seepärast → tegusõna kohe: jäid.', 'läks + -ks: halvaks.'])), {}),
      purpose(B.selfcheck('058_t_self', ['Ma ütlen põhjuse: tugeva tuule tõttu, sest, kuna.', 'Ma ütlen tagajärje: seepärast jäid bussid hiljaks, nii et toit läks halvaks.', 'Ma saan aru raadiouudisest tormi kohta.', 'Ma helistan kindlustusse ja selgitan, miks kahju tuleb hüvitada.'], 'Kahju selgitatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('058_t_home', 'Kodus: e-kiri kindlustusele.', 'Kirjuta kindlustusele 7–9 lauset: mis juhtus, miks ja mida sa palud. Saada ka 1-minutiline häälsõnum.', [7, 9]), 'Kirjalik kaebus on tõend: kindlustus näeb põhjuse, tagajärje ja sinu soovi.')), { task: 'W13' }),
      retire('058_t_damage', V5_CUT),
      retire('058_t_sit', V5_CUT),
      retire('058_t_phrases', V5_CUT),
    ],
  },

  // ---------------------------------------------------------------- 059 debate: 300 euros for the courtyard (opinion, verb government)
  'a2b1-059': {
    title: 'Mida 300 euroga teha?',
    phases: grammar('Keel: Minu arvates … , sest … Näiteks … · nõustun ettepanekuga · loobume lilledest · osalen talgupäeval'),
    format: 'debate',
    topic: 'neighbours',
    canDo: 'Ma loen naabrite arvamusi, ütlen oma arvamuse koos põhjuse ja näitega (nõustun, loobume, osalen) ja lepin koosolekul kokku, mida meie hoovis 300 euroga teha.',
    teacherPage: {
      goal: 'Ученик читает мнения соседей и сам высказывает мнение по модели «мнение + причина + пример» (nõustuma millega, loobuma millest), договаривается о плане на 300 евро.',
      core: [1, 2, 4], alt: 3,
      short: 'Пункт 1 → форум дома (3 предложения соседей, 8 вопросов), в паре таблица «мнение — причина — пример» → пункт 4: собрание по картинке «Kolm ettepanekut» (Harno S1b) со скрытой информацией. Пункт 3 — дома в «Harjuta».',
      hook: '«Mis sulle sinu maja hoovis või tänaval meeldib ja mis mitte?» Сначала ответьте сами (2–3 предложения), потом ученик. Вопрос из урока 58 без записей: одно предложение с tõttu или seepärast.',
      plan: [
        '0–8: пункт 1 — что нравится и не нравится у дома; одно предложение с tõttu / seepärast (повторение урока 58)',
        '8–25: пункт 2 — слова, форум дома «Kase 12: 300 eurot hoovi jaoks» (≈ 200 слов), 8 вопросов, в паре письменно таблица «Arvamus — Põhjus — Näide», устно 3 вопроса',
        '25–40: пункт 3 — заметить → правило (Minu arvates / Ma arvan, et / Mulle tundub, et + sest + Näiteks; nõustuma millega, loobuma millest, osalema millel, hoolitsema mille eest) → 8 форм → своё предложение для форума 8–11 предложений',
        '40–65: пункт 4 — собрание жильцов по картинке «Kolm ettepanekut» (Harno S1b): один план в пределах 300 евро; у соседа скрытая информация; вторая попытка без фраз — свой дом, улица или работа (в той же карточке)',
        '65–72: проверка на выходе, «Ma oskan …», домашнее задание (ответы как на экзамене, запись 90–120 с)',
        'Kui aega jääb (10 мин, только в плане учителя): ученик рассказывает, как соседи договариваются у него на родине и есть ли там talgud',
        '72–90: запас',
      ],
      sources: 'Форум (пункт 2) и картинка «Kolm ettepanekut» — учебные, дом, соседи и цены выдуманы; проверять не нужно (владелец 2026-11-25).',
      groups: 'Пункт 4 в паре: A и B — соседи, каждый сначала выбирает своё предложение (не показывает), потом договариваются; потом своя тема. Один на один вы — сосед со скрытой информацией.',
      errors: [
        '«Ma olen nõus sinu ettepanekust» вместо «… ettepanekuga» (nõus olema / nõustuma millega).',
        '«loobuma ühekordsed kotid» вместо «loobuma ühekordsetest kottidest» (loobuma millest).',
        '«osalema talgupäevale» вместо «osalema talgupäeval» (osalema millel).',
        '«Minu arvamus on, et …» — правильно, но тяжело; лучше «Minu arvates …» / «Ma arvan, et …».',
      ],
      notes: [
        'Собрание — продукт урока: у каждого мнение, причина и пример, реакция на чужое мнение и один план в пределах бюджета.',
        'Обратная связь, 2 цели: падеж после nõustuma / loobuma / osalema и модель «мнение + причина + пример». Сначала подсказка, рекаст только если не исправил сам.',
      ],
    },
    discover: [
      station(teach(tag(purpose(half(B.speaking('059_d_board', 'Mis sinu kodu ümber on hästi?', 'Vasta paarilisele kahe-kolme lausega. Siis vahetage: paariline räägib, sina küsid.', [
        'Mis sulle sinu maja hoovis või tänaval meeldib ja mis mitte?',
        'Ütle ilma märkmeteta üks lause eelmisest tunnist: mis juhtus tormi tõttu?',
      ], [70, 90])), 'Sinu kodu on tänase tunni algus: lõpus lepid naabritega kokku, mida hoovis teha.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi kõigepealt oma kodu ümbrusest (2–3 lauset), siis küsi õpilaselt üks lisaküsimus („Mida sa muudaksid?”). Ära paranda.'), 1, 8),
      station(tag(half(B.vocab('059_d_vocab', 'Tunni sõnad.', ['ettepanek — предложение', 'arvamus — мнение', 'kokkulepe — договорённость', 'eelarve — бюджет', 'keskkond — окружающая среда', 'talgud — толока', 'nõustuma millega — соглашаться с чем', 'loobuma millest — отказываться от чего', 'osalema millel — участвовать в чём', 'hoolima millest — заботиться о чём'], '2')), { topic: ['talgud'] }), 2, 17),
      tag(purpose(why(ownText(B.reading('059_d_forum', 'Maja foorum.', 'Loe teksti. Vasta igale küsimusele 1–5 sõnaga.', 'Kase 12: 300 eurot hoovi jaoks', [
        'Juhatus: Head naabrid! Meie korteriühistul on suveks 300 eurot hoovi jaoks ja üks talgupäev. Kirjutage oma ettepanek siia reedeni.',
        '',
        'Leida, 3. korter: Minu arvates on kõige parem kompostikast ja kaks peenart. See maksab umbes 120 eurot. Biojäätmeid peab nüüd niikuinii eraldi koguma ja kompostist saame peenardele mulda. Näiteks naabermajas kasvatavad lapsed juba tomateid ja maasikaid. Mina hoolitsen peenarde eest.',
        '',
        'Joosep, 12. korter: Ma ei ole päris nõus. Kompost võib suvel haiseda. Ma arvan, et vaja on rattahoidjat, sest praegu seisavad rattad trepikojas ja keegi ei pääse mööda. Näiteks eile kukkus üks laps trepikojas ratta otsa. Rattahoidja maksab 250 eurot. Kui raha jääb puudu, võiksime loobuda uutest lilledest.',
        '',
        'Tiina, 7. korter: Mulle tundub, et me unustame vanemad naabrid. Hoovis ei ole ühtegi pinki. Kaks pinki maksavad 180 eurot. Näiteks proua Kask on 85-aastane ega saa kaua seista. Talgupäeval osalen hea meelega, aga raskeid asju ma tõsta ei saa.',
        '',
        'Juhatus: Aitäh! Arutame kõiki ettepanekuid koosolekul neljapäeval kell 18.',
      ], [
        ['Kui palju raha on korteriühistul hoovi jaoks?', '300 eurot|kolmsada eurot|300'],
        ['Miks tahab Leida kompostikasti?', 'biojäätmeid peab eraldi koguma|kompostist saab peenardele mulda|kompostist saab mulda'],
        ['Millise näite toob Leida naabermajast?', 'lapsed kasvatavad tomateid ja maasikaid|lapsed kasvatavad tomateid|seal kasvatatakse tomateid ja maasikaid'],
        ['Miks ei ole Joosep Leidaga päris nõus?', 'kompost võib suvel haiseda|kompost haiseb'],
        ['Miks on Joosepi arvates vaja rattahoidjat?', 'rattad seisavad trepikojas|keegi ei pääse mööda|rattad on trepikojas'],
        ['Millest võiks Joosepi arvates loobuda?', 'uutest lilledest|lilledest'],
        ['Kelle peale mõtleb Tiina?', 'vanemate naabrite peale|vanemad naabrid|vanemate naabrite'],
        ['Kui palju maksavad kompostikast ja pingid kokku?', '300 eurot|kolmsada eurot|300'],
      ])), [
        'Juhatus: „Meie korteriühistul on suveks 300 eurot hoovi jaoks”.',
        'Leida: „Biojäätmeid peab nüüd niikuinii eraldi koguma ja kompostist saame peenardele mulda.”',
        'Leida: „Näiteks naabermajas kasvatavad lapsed juba tomateid ja maasikaid.”',
        'Joosep: „Kompost võib suvel haiseda.”',
        'Joosep: „praegu seisavad rattad trepikojas ja keegi ei pääse mööda”.',
        'Joosep: „võiksime loobuda uutest lilledest”.',
        'Tiina: „me unustame vanemad naabrid”.',
        '120 eurot + 180 eurot = 300 eurot.',
      ]), 'Enne kui sa koosolekul räägid, loed, mida naabrid pakuvad, miks ja milliste näidetega.'), { task: 'R12', voice: 'forum' }),
      teach(tag(purpose(B.table('059_d_find', 'Paaris: arvamus, põhjus, näide.', 'Kirjutage koos iga naabri kohta lühike lause: mida ta tahab, miks ja mis näite ta toob. Viimasesse ritta kirjutage oma ettepanek.', 'Kes?, Arvamus, Põhjus, Näide', [
        'Leida |  |  | ',
        'Joosep |  |  | ',
        'Tiina |  |  | ',
        'Meie |  |  | ',
      ], 'g_read'), 'Teie tabel näitab, kuidas hea arvamus on üles ehitatud, ja annab koosolekuks sinu enda ettepaneku.'), { task: 'R11' }),
      'Paarid kirjutavad koos 6–8 minutit. Viimases reas peavad nad ise kokku leppima ühe ettepaneku koos põhjuse ja näitega. Üks-ühele: õpilane kirjutab kolm rida, viimase rea mõtlete koos välja.'),
      teach(tag(purpose(B.speaking('059_d_ask', 'Kellega sa nõustud? Küsi paarilisel.', 'Küsi paarilisel foorumi järgi. B vastab terve lausega: arvamus, põhjus ja näide. Siis vahetage.', [
        'Kelle ettepanekuga sa nõustud ja miks?',
        'Millest võiks teie hoovis loobuda?',
        'Mis on sinu oma ettepanek? Too üks näide.',
      ], [90, 120], '', 'g_read'), 'Ütled foorumi järgi, kellega nõustud ja miks, ning tood näite.'), { task: 'S03', fluency: true }),
      'Üks-ühele: sina küsid kaks küsimust, siis küsib õpilane sinult kaks. Teisel ringil ütled sa ühe vea („Joosep tahab kompostikasti”) ja õpilane parandab sind foorumi järgi.'),
      retire('059_d_radio', V5_CUT),
    ],
    practice: [
      station(B.notice('059_d_notice', 'Märka: arvamus, põhjus, näide', [
        'Foorumist: **Minu arvates** on kõige parem … · **Ma arvan, et** vaja on … , **sest** … · **Näiteks** naabermajas … · **Mulle tundub, et** … · **Ma ei ole päris nõus.**',
        'Nõustu ja kahtle viisakalt: **Olen sinuga nõus.** · **Jah, aga** … · **Ma ei ole päris kindel, kas** …',
        'Tegusõna ja kääne: **nõustuma** ettepaneku**ga** (millega?) · **loobuma** **lilledest** (millest?) · **osalema** talgupäeva**l** (millel?) · **hoolitsema** peenarde **eest** (mille eest?) · **hoolima** hoovi**st** (millest?)',
      ], 'full'), 3, 15),
      tag(purpose(why(B.wordforms('059_d_verbs', 'Laused koosolekuks.', 'Pane sõna sulgudes oleva küsimuse järgi õigesse vormi.', [
        ['see ettepanek', 'Ma ei ole päris nõus … (millega?)', 'selle ettepanekuga'],
        ['uued lilled', 'Kui raha jääb puudu, võiksime loobuda … (millest?)', 'uutest lilledest'],
        ['laupäevane talgupäev', 'Kas sa osaled ka … (millel?)', 'laupäevasel talgupäeval'],
        ['meie ühine hoov', 'Me kõik peaksime rohkem hoolima … (millest?)', 'meie ühisest hoovist'],
        ['peenrad', 'Leida hoolitseb … eest. (mille eest?)', 'peenarde'],
        ['prügikastide lõhn', 'Naabrid kaebasid juba kevadel … üle. (mille üle?)', 'prügikastide lõhna'],
        ['Joosepi mõte', 'Kas sa nõustud … ? (millega?)', 'Joosepi mõttega'],
        ['ühekordsed kotid', 'Meie maja on juba loobunud … (millest?)', 'ühekordsetest kottidest'],
      ], 'full', 'g_notice'), [
        'nõus olema millega → -ga: selle ettepanekuga.',
        'loobuma millest → -st: uutest lilledest.',
        'osalema millel → -l: laupäevasel talgupäeval.',
        'hoolima millest → -st: meie ühisest hoovist.',
        'hoolitsema mille eest → omastav: peenarde.',
        'kaebama mille üle → omastav: lõhna.',
        'nõustuma millega → -ga: Joosepi mõttega.',
        'loobuma millest → -st: ühekordsetest kottidest.',
      ]), 'Kontrolli, et iga sõna saaks õige lõpu, siis saavad naabrid sinust kohe aru.'), { task: 'G08' }),
      tag(purpose(rows(B.writing('059_p_sent', 'Kirjuta terved laused: minu ettepanek.', 'Kirjuta foorumisse oma ettepanek 8–11 lausega: mida sa pakud, miks, üks näide ja mida sa ise talgupäeval teed. Kasuta vähemalt kahte tegusõna kastist „Märka”.', [8, 11]), 7), 'Sinu ettepanek on koosoleku materjal: sa tead, mida tahad ja miks.'), { task: 'W08' }),
      retire('059_p_sort', V5_DRILL),
      retire('059_p_know', V5_CUT),
      retire('059_p_rules', V5_DRILL),
      retire('059_p_invite', V5_CUT),
    ],
    transfer: [
      station(teach(tag(purpose(B.ideaCard('059_t_meeting', 'Koosolek: mida 300 euroga teha?', 'Vaata pilti üleval. A ja B on naabrid: arvamus, põhjus ja näide; lõpus üks plaan 300 euro piires. Siis teie oma maja.',
        'Kase 12 korteriühistul on hoovi jaoks 300 eurot ja üks talgupäev. Kõike korraga osta ei saa.',
        ['kompostikast ja kaks peenart (120 €)', 'rattahoidja (250 €)', 'kaks pinki (180 €)', 'jagamisriiul trepikotta (40 €)', 'talgupäeval kõik ise: oksad, aed, liivakast (0 €)'],
        'üks plaan, mis mahub 300 eurosse, ja kes mida teeb', [120, 240]), 'Pärast koosolekut on teil üks plaan: mida ostate, kui palju see maksab ja kes mida teeb.'), { task: 'S03', harno: 'S1b', main: true, level: 4 }),
      'Kokkulepe ideekaardiga nagu Harno B1 rääkimise 1b osas (~4 min). Üks-ühele: sina oled naaber. Varjatud info: sul on raske kõndida ja sa tahad õues istuda, seepärast eelistad pinke; sinu lapselaps sõidab iga päev rattaga kooli; talgupäeval saad aidata ainult lillede istutamisega. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) „Kompost toob rotid hoovi.”; 2) kui õpilase plaan ületab 300 eurot: „Aga see on ju rohkem kui meie raha!”; 3) „Kes peenraid suvel kastab?” Õnnestunud, kui üks plaan mahub 300 eurosse, mõlema soov on arvesse võetud, õpilane ütleb arvamuse, põhjuse ja näite ning kordab kokkuleppe üle (mida, kui palju maksab, kes teeb). Teine katse ilma fraasideta (lehel „Siis teie oma maja”): kumbki pakub midagi oma maja, tänava või töökoha jaoks; teine kahtleb ühe korra („Ma ei ole päris kindel, kas see on vajalik.”) ja te lepite kokku.'), 4, 25, { final: 'negotiate' }),
      tag(exitCheck(why(purpose(B.gaps('059_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma olen sinu [ettepanekuga] nõus, sest pingid on vajalikud (ettepanek).',
        'Kui raha jääb puudu, loobume [rattahoidjast] (rattahoidja).',
        'Laupäeval osalen ka mina [talgupäeval] (talgupäev).',
      ], '', 'full', 'g_vocab'), 'Kolm lauset koosolekult: kas tegusõna ja õige lõpp on käes?'), ['nõus millega → -ga: ettepanekuga.', 'loobuma millest → -st: rattahoidjast.', 'osalema millel → -l: talgupäeval.'])), {}),
      purpose(B.selfcheck('059_t_self', ['Ma ütlen arvamuse, põhjuse ja näite: Minu arvates …, sest … Näiteks …', 'Ma kasutan õiget käänet: nõustun ettepanekuga, loobume lilledest, osalen talgupäeval.', 'Ma saan aru naabrite arvamustest foorumis.', 'Ma lepin koosolekul kokku ühe plaani, mis mahub eelarvesse.'], 'Plaan kokku lepitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.speaking('059_t_rec', 'Kodus: vasta nagu eksamil.', 'Vasta igale küsimusele kahe-kolme lausega ja salvesta kokku 90–120 sekundit.', [
        'Mida võiks muuta sinu maja hoovis, tänaval või töökohas?',
        'Miks see on sinu arvates vajalik?',
        'Too üks näide: kellele see aitab?',
        'Kas su naabrid on sellega nõus? Miks?',
        'Kas talgud on sinu arvates hea mõte? Miks?',
        'Mida saab üks pere teha, et keskkonda hoida?',
      ], [90, 120]), 'Nii küsib eksamineerija kodu ja keskkonna kohta: õpetaja ütleb, kas arvamus, põhjus ja näide tulid välja.')), { task: 'S15', fluency: true }),
      homework('059_t_homework', ['1. Kirjuta koosoleku kokkulepe üles: mida ostate, kui palju see maksab ja kes mida teeb.', '2. Vasta eksami küsimustele ja salvesta (ülesanne üleval).', '3. Kirjuta vihikusse kuus lauset tegusõnadega nõustuma, loobuma, osalema, hoolitsema, hoolima, kaebama.', `4. ${WORDS_HOME}`, NO_RECORDING]),
      retire('059_t_ideas', V5_CUT),
    ],
  },

  // ---------------------------------------------------------------- 060 control 12 (one sheet): the end of the A2+ stage, four skills
  'a2b1-060': {
    title: 'Kontroll 12: ilm, loodus ja keskkond',
    format: 'exam',
    assessment: true,
    canDo: 'Ma loen artiklit rabast, saan aru raadioloost, räägin ilma abita, kuidas ilm minu plaane muutis, broneerin telefonis puhkemaja ja kirjutan sõbrale nõuande.',
    discover: [
      B.examPart('060_p_rpart', 'R', { part: 'Lugemine', minutes: 12, points: 8, tasks: 1, target: 60, note: `See on mooduli 12 kontroll ja A2+ astme lõpp (tunnid 41–60): neli osa, umbes 45 minutit, ilma sõnaraamatuta. ${THRESHOLDS}` }),
      tag(why(ownText(B.reading('060_p_r2text', 'Lugemine. Artikkel rabast.', 'Loe artiklit. Kirjuta igale küsimusele lühike vastus (1–5 sõna).', 'Raba — märg maa, mis mäletab', [
        'Umbes viiendik Eesti maast on soo. Raba on soo, mis saab vett ainult vihmast ja lumest. Seepärast on rabas vähe toitaineid ja seal kasvavad ainult vähesed taimed: turbasammal, väikesed männid, kanarbik, jõhvikad ja murakad.',
        '',
        'Turbasammal hoiab vett nagu suur käsn. Kui sammal sureb, ei lagune see märjas rabas lõpuni. Nii tekib turvas. Turbakiht kasvab umbes ühe millimeetri aastas, nii et meetri paksune kiht tekib umbes tuhande aastaga.',
        '',
        'Rabad on looduse jaoks väga tähtsad. Need hoiavad vett ja puhastavad seda. Kuival suvel annavad rabad vett ka jõgedele ja kaevudele. Lisaks hoiab turvas maa sees palju süsinikku, seepärast aitavad rabad kliimat kaitsta.',
        '',
        'Rabas tasub liikuda ainult laudteel. Pehme sammal saab jalgade all kergesti kahjustada ja jalg võib märga turbasse vajuda. Äikese ajal ei ole rabas varju, seepärast tuleb enne matka ilmateadet vaadata. Rabas on ka palju sääski, nii et putukatõrjevahend tasub kaasa võtta. Kõige ilusam on raba varahommikul, kui udu on veel madalal.',
      ], [
        ['Kust saab raba vett?', 'ainult vihmast ja lumest|vihmast ja lumest'],
        ['Miks kasvab rabas vähe taimi?', 'rabas on vähe toitaineid|vähe toitaineid'],
        ['Millega võrreldakse turbasammalt?', 'käsnaga|suure käsnaga'],
        ['Kuidas tekib turvas?', 'sammal ei lagune lõpuni|surnud sammal ei lagune märjas rabas lõpuni|sammal ei lagune'],
        ['Turbakiht on 30 sentimeetrit paks. Umbes kui vana see on?', 'umbes 300 aastat|300 aastat|kolmsada aastat'],
        ['Mida annavad rabad kuival suvel jõgedele?', 'vett'],
        ['Miks aitavad rabad kliimat kaitsta?', 'turvas hoiab süsinikku|turvas hoiab maa sees palju süsinikku'],
        ['Miks tasub rabas liikuda ainult laudteel?', 'sammal saab kergesti kahjustada|et sammalt mitte kahjustada|jalg võib turbasse vajuda'],
      ])), [
        'Esimene lõik: „Raba on soo, mis saab vett ainult vihmast ja lumest.”',
        'Esimene lõik: „Seepärast on rabas vähe toitaineid”.',
        'Teine lõik: „Turbasammal hoiab vett nagu suur käsn.”',
        'Teine lõik: „Kui sammal sureb, ei lagune see märjas rabas lõpuni. Nii tekib turvas.”',
        'Teine lõik: üks millimeeter aastas → 300 mm ≈ 300 aastat.',
        'Kolmas lõik: „Kuival suvel annavad rabad vett ka jõgedele”.',
        'Kolmas lõik: „turvas hoiab maa sees palju süsinikku”.',
        'Viimane lõik: „Pehme sammal saab jalgade all kergesti kahjustada”.',
      ]), { task: 'R19', harno: 'R2', voice: 'popsci' }),
      B.examPart('060_p_lpart', 'L', { part: 'Kuulamine', minutes: 10, points: 8, tasks: 1, target: 60, note: 'Kuulad kaks korda.' }),
      tag(why(locked(B.examListen('060_p_l2', 'Kuulamine. Raadiolugu puukidest.', 'Kuula kaks korda. Märgi, kas väide on õige või vale.', 'truefalse', PILOT_BLOCKS['060_p_l2'].data.transcript, [
        ['Eestis võib puuke kohata varakevadest hilissügiseni.', true],
        ['Puugid kukuvad inimese peale puu otsast.', false],
        ['Puukentsefaliidi vastu saab end vaktsineerida.', true],
        ['Ka borrelioosi vastu on vaktsiin olemas.', false],
        ['Metsas soovitatakse kanda tumedaid riideid.', false],
        ['Püksid tasub metsas panna sokkide sisse.', true],
        ['Pärast metsast tulekut tuleb kogu keha üle vaadata.', true],
        ['Puukide pärast tasub loodusest loobuda.', false],
      ])), [
        'Diktor: „Eestis võib puuke kohata varakevadest hilissügiseni.”',
        'Diktor: „Puugid ei kuku puu otsast, nagu paljud arvavad.”',
        'Diktor: „Puukentsefaliidi vastu saab end vaktsineerida”.',
        'Diktor: „borrelioosi vastu vaktsiini ei ole”.',
        'Diktor: „soovitavad metsas kanda heledaid riideid”.',
        'Diktor: „Püksid tasub panna sokkide sisse.”',
        'Diktor: „tuleb kogu keha hoolikalt üle vaadata”.',
        'Diktor: „Puukide pärast ei tasu loodusest loobuda.”',
      ]), { harno: 'L4', task: 'L05' }),
      half(B.examPart('060_t_wpart', 'W', { part: 'Kirjutamine', minutes: 12, points: 8, tasks: 1, target: 60, note: 'Üks kiri, 60–90 sõna, kõik neli punkti.' })),
      tag(teach(half(rows(B.writing('060_t_w', 'Kirjutamine. Nõuanne sõbrale.', 'Sõber tuleb Eestisse matkama. Kirjuta talle 60–90 sõna: kuhu minna, mis ilma oodata, üks lugu oma matkalt, millega arvestada.', [8, 11]), 8)), 'Punktid: iga sisupunkt 1 (kokku 4: koht ja põhjus, ilm ja mida kaasa võtta, oma lugu kui- või enne kui -lausega, äike / prügi / lõke), keel ja vorm 0–4 (muutus -ks, kui-lause õige sõnajärjega, põhjus ja tagajärg, selge kiri).'), { harno: 'W2b', task: 'W04' }),
      half(B.examPart('060_t_spart', 'S', { part: 'Rääkimine', minutes: 15, points: 10, tasks: 2, target: 60, note: 'Üks-ühele. Ülesanne 1 on ilma abita; ülesanne 2 on telefonikõne õpetajaga.' })),
      teach(tag(half(B.speaking('060_t_s1', 'Rääkimine 1. Ilm ja minu plaanid.', 'Räägi 90–120 sekundit ilma abita ja ilma märkmeteta.', [
        'Räägi ühest päevast või nädalavahetusest, kui ilm muutis sinu plaane: mis oli plaan, mis ilm tuli, mida sa tegid ja mida sa järgmisel korral teisiti teed?',
      ], [90, 120])), { harno: 'S1a', level: 4 }),
      'Paralleelne uus ülesanne (tunni 56 külm start): sama hindamine, sarnane teema. Ära aita ega paranda. Märgi samad kolm asja (mitu lauset, sidesõnad, vormid: läheb …-ks, kraadi sooja / kraadini, oodatakse, kui-lause sõnajärg, tõttu / seepärast) ja võrdle tunni 56 märkmetega. Punktid 0–5: sisu ja seotus 0–2, sõnavara 0–1, vormid 0–2.'),
      teach(tag(B.phoneCards('060_t_s2', 'Rääkimine 2. Telefonikõne: puhkemaja.', 'Helista puhkemajja, õpetaja on töötaja. Räägi umbes 4 minutit.',
        'Teie kursus (6 inimest) tahab augusti viimasel nädalavahetusel puhkemajja Kõrve raba lähedal. Raha on 400 eurot.',
        ['Helistaja (sina)', [
          'Eesmärk: maja kaheks ööks kuuele inimesele.',
          'Vaja teada: hind, mis on hinnas, kuidas kohale saab.',
          'Kaasas on koer ja üks inimene, kes ei saa kaua kõndida.',
          'Kui midagi ei sobi, leia koos töötajaga lahendus.',
        ]], ['Puhkemaja töötaja (õpetaja)', [
          'Töötaja kaart on õpetajal.',
        ]], [180, 300]), { harno: 'S2', task: 'S04' }),
      'Telefonikõne nagu Harno B1 rääkimise 2. osas (umbes 4 minutit). Õpetaja on puhkemaja töötaja. Varjatud info: Metsamaja on vaba ainult laupäevast pühapäevani (üks öö, 140 €); kaheks ööks on vaba Järvemaja (kuus voodikohta, 170 € öö, saun 25 € õhtu); koer on lubatud 10 € lisatasuga; bussipeatus on kolme kilomeetri kaugusel, aga töötaja saab tulla autoga vastu 15 € eest; voodipesu on hinnas, rätikud võtke kaasa. Ootamatu vastus: „Metsamaja on reede õhtul juba broneeritud.” Punktid 0–5: küsib hinda, mis on hinnas ja teed 0–2, reageerib ootamatule infole ja leiab lahenduse eelarve piires (Järvemaja 2 ööd + saun + koer = 375–390 €, buss + vastusõit) 0–1, vormid (kui-lause, tõttu / sest, -ks) 0–1, kordab kokkuleppe üle 0–1.'),
      teach(half(B.table('060_t_profile', 'Minu tulemus.', 'Kirjuta punktid ja protsent. Rääkimise reas võrdle tunniga 56.', 'Osa, Minu punktid, Minu %, Mis paranes?', [
        'Lugemine (8 p) |  |  | ',
        'Kuulamine (8 p) |  |  | ',
        'Kirjutamine (8 p) |  |  | ',
        'Rääkimine (10 p) |  |  | ',
      ])), 'Õpetajale: rääkimise rea viimases lahtris on tunni 56 külma stardi ja selle tunni rääkimise 1 võrdlus (kolm märget). Kokku 34 punkti: 60 % ≈ 20,4, 70 % ≈ 23,8, 80 % ≈ 27,2 punkti. See on A2+ astme lõpp: kui mõni osa jääb alla 60 %, anna selle osa tund kodutööks uuesti (lugemine → tunnid 57 ja 59, kuulamine → tunnid 56 ja 58, rääkimine → tunnid 56, 58 ja 59, kirjutamine → tunnid 57 ja 58).'),
      retire('060_d_intro', V5_MOCK),
      retire('060_d_vocab', V5_MOCK),
      retire('060_d_quiz', V5_DRILL),
      retire('060_d_story', V5_CUT),
      retire('060_d_sort', V5_DRILL),
      retire('060_d_cross', V5_DRILL),
      retire('060_d_trans', V5_DRILL),
      retire('060_d_fix', V5_DRILL),
      retire('060_d_write', V5_MOCK),
      retire('060_d_warm', V5_MOCK),
    ],
    practice: [
      retire('060_p_r1', V5_MOCK),
      retire('060_p_r2', V5_MOCK),
      retire('060_p_r3', V5_MOCK),
      retire('060_p_r4', V5_MOCK),
      retire('060_p_l1', V5_CUT),
      retire('060_p_l3', V5_CUT),
      retire('060_p_l4', V5_MOCK),
      retire('060_p_rcheck', V5_MOCK),
      retire('060_p_lcheck', V5_MOCK),
      retire('060_p_points', V5_MOCK),
    ],
    transfer: [
      retire('060_t_w2', 'v5 (2026-11-25): kontrolli kiri on nüüd kirjutamisplokk 060_t_w (üks leht)'),
      retire('060_t_w1', V5_MOCK),
      retire('060_t_rw1', V5_MOCK),
      retire('060_t_rw2', V5_MOCK),
      retire('060_t_s0', V5_MOCK),
      retire('060_t_s1b', V5_MOCK),
      retire('060_t_rs', V5_MOCK),
      retire('060_t_points', V5_MOCK),
      retire('060_t_self', V5_MOCK),
    ],
  },
}, {
  'a2b1-056': 'KUUL L→S', 'a2b1-057': 'LUGU R→W', 'a2b1-058': 'AVAS L→S', 'a2b1-059': 'RÄÄK R→S', 'a2b1-060': 'EKS',
});
