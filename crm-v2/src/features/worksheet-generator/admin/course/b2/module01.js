// B2 course (B1 → B2 roadmap), module 1 „Igapäevaelu ja B1 lähtepunkt” (b1b2-001…005), stage B1+ (001: B1).
// Lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md, owner 2026-11-14; pilot B1 module 12): lessons 001–004 are
// 4–6 independent stations of 8–15 min, each with its own small input; any station can be skipped or reordered; no task of
// the module depends on another station. Every task has a purpose line; each lesson has one teacher page (teacherPage:
// goal, core 45-min path, alternative, short path, common errors, feedback targets).
// The frame stays (docs/COURSE_CAST.md): the course's world one year later. Sofia passed B1 in May; Liis offers her the
// lead of Tuul Logistika's new Tartu warehouse (Ringtee) if she reaches B2 by March. Keelekool Sõna (teacher Maret), head
// of personnel Eha Org, trainee Laura (logistics at the University of Tartu), night-shift leader Gert, coach Hendrik
// Ilves, Jelena (administrator, small son), Kristjan (sales); the team day in Pärnu chooses between a meeting-free
// Wednesday and a daily 15-minute morning meeting (module 5 refers back to it).
//   001 (diagnostic, B1) „B1 lähtediagnostika” — the four skills and pronunciation as stations; final: plan (a request to
//       Eha Org: course, schedule, what the learner promises; W13).
//   002 „Minu tavaline päev” — final: advise (a text for the new-employee guide, W05; Laura's questions).
//   003 „Aeg, sagedus ja lauseehitus” — final: decide (the team day's debate with argument cards, S17).
//   004 „Argipäev vs nädalavahetus” — final: negotiate (the learning-plan talk with Liis, S17).
//   005 Kontroll 1 — unchanged (design v2 / template v4 rules: an exam lesson is not a station lesson).
// No new grammar item: the module spirals the B1 core — the conditional for a polite request (001), linking words sest /
// kuna / kuigi / seetõttu / samas / enne kui / pärast seda kui (002), time, frequency and duration with the verb second
// after an adverbial (003), comparison — keskvõrre + kui, kõige, võrreldes + -ga, erinevalt + -st, mida … seda (004).
// Each teaching lesson has one notice → practice station (≤ 10 min) for its item, and its final task needs that item.
// Harno B2 formats met in situations: semi-formal letter W13 (001), short answers R15 (001), interview true/false L05 and
// a 1-minute talk at a meeting S16 (002), lecture gap notes L04, sentence bank R16 and argument cards S17 (003), radio
// multiple choice L02 and S17 (004). Mediation (003: Hendrik's talk passed on to Jelena) and online interaction (003
// team chat, 004 family chat) once each; pronunciation micro-tasks: quantity and õ / ö / ü (001, perception) and first-
// syllable stress (003, production). The previous version (design v2, template v4) is in git history (main before this PR).
import { B, tag, teach, withShapes } from '../blocks.js';
import { purpose, station } from '../stationBlocks.js';

// a talk with the teacher as the partner, done in the lesson (engine/inLesson.js), not a home recording
const inLesson = (block) => ({ ...block, inLesson: true });

export const MODULE = { id: 'b1b2-module-01', course: 'b2', title: 'Igapäevaelu ja B1 lähtepunkt', level: 'B1+', design: 'v3-stations', template: 'v4' };

export const LESSONS = withShapes({
  'b1b2-001': {
    title: 'B1 lähtediagnostika',
    canDo: 'Ma näitan, mida oskan B1-tasemel: loen ja kuulan lühikesi tekste, räägin oma tööst ja kirjutan personalijuhile 120–150-sõnalise poolametliku palve.',
    // entry diagnostic: measured at B1 (the course itself starts at B1+)
    level: 'B1',
    teacherPage: {
      goal: 'Диагностика B1 по четырём навыкам и произношению; в финале ученик пишет полуофициальную просьбу с условным наклонением (tingiv kõneviis).',
      core: [2, 3, 6], alt: 5,
      short: 'Станция 2 (только произношение и три вопроса, 8 мин) → станция 6 (письмо; закончить дома). Станции 1, 3, 4 и 5 — дома или на следующем уроке.',
      errors: [
        '«Kas te saaks…?» вместо «Kas te saaksite…?» (к «вы» — форма на -ksite).',
        '«Ma tahan / Ma tahaks» в письме начальнику звучит слишком прямо или разговорно → «Ma sooviksin…», «Kas oleks võimalik…?».',
        'Долгота меняет смысл: «sada» (сто) ≠ «saada» (отправь), «koli» ≠ «kooli», «lina» ≠ «linna».',
        '«Tere, Eha!» в такой просьбе слишком неформально → «Lugupeetud Eha Org!» … «Lugupidamisega».',
      ],
      notes: [
        'Станции независимы, порядок можно менять. Отмечайте результат каждой станции в карте навыков: чтение (1, 4), аудирование (3), говорение и произношение (2), письмо (6), грамматика (5).',
        'Обратная связь, 2–3 цели: условное наклонение в просьбе; глагол сразу после придаточного; долгота гласных. На станции 5 сначала подсказка (повторите ошибку с вопросительной интонацией, метаязыковая подсказка «-ksite?»), рекаст — только если ученик не исправил сам. На станции 2 и в финале не перебивайте: не больше трёх замечаний в конце, письмо комментируйте по тем же целям.',
      ],
    },
    discover: [
      station(B.topicOpener('001_d_open', 'Moodul 1. Elu rütm: mida näitavad uuringud?', [
        'Kuhu kaob meie aeg? Sellele küsimusele otsib Statistikaamet vastust iga kümne aasta tagant. Viimases ajakasutuse uuringus aastatel 2019–2021 pidasid tuhanded vähemalt kümneaastased inimesed päevikut ja märkisid sinna kõik oma tegevused. Päevikut täitsid eri vanuse, hariduse ja elukorraldusega inimesed. Seejärel arvutati iga tegevuse keskmine aeg kõigi inimeste ja kõigi päevade kohta. Sellepärast on tasulise töö keskmine aeg ainult 3,3 tundi ööpäevas: arvesse lähevad ka lapsed, pensionärid ja töötud ning nädalavahetused ja puhkused.',
        'Kõige suurem muutus on toimunud kodus. Kahekümne aastaga on naiste aeg majapidamisele ja perele vähenenud ligi poolteist tundi päevas, meestel veidi vähem kui pool tundi. Eriti palju aega on vabanenud köögis: naised teevad süüa üle poole tunni vähem kui varem. Pesemine, triikimine ja riiete parandamine võtavad nüüd alla kümne minuti päevas. Statistikaameti analüütiku arvates aitasid sellele kaasa poolvalmistoidud, toidukullerid ja kodutehnika. Ainult ehitamine ja remont on jäänud peamiselt meeste tööks. Tasulist ja tasuta tööd kokku teevad naised ja mehed nüüd peaaegu võrdselt, kuid kodutöödele ja perele kulutavad naised endiselt umbes kolmandiku võrra rohkem aega kui mehed.',
        'Toidu valmistamine võtab vähem aega, söömine aga rohkem: laua taga veedetakse nüüd umbes kümme minutit päevas kauem kui kakskümmend aastat tagasi. Nädalavahetusel istutakse laua taga veidi kauem kui nädala sees. Kõige rahulikumalt söövad vanemaealised, kes kulutavad söömisele keskmiselt poolteist tundi päevas.',
        'Muutunud on ka keeled, mida igapäevaelus kasutatakse. 2021. aasta rahvaloenduse järgi oskab 76 % Eesti elanikest vähemalt üht võõrkeelt ja üle kolmandiku võõrkeeleoskajatest räägib kahte võõrkeelt. Noorte seas on pilt eriti selge: mõnda võõrkeelt valdab neist 90 %. Piirkonniti on vahed suured: Viimsi vallas on võõrkeeleoskajate osa üle kahe korra suurem kui Narvas. Vanemate inimeste seas on rohkem vene ja soome keele oskajaid, noorte seas on need keeled asendunud inglise keelega.',
        'Selles moodulis vaatad oma päeva nende numbrite taustal: kuidas sina oma aega kasutad, mis segab keskendumist ja millal on kõige parem õppida. Samuti mõtled, kuidas keeled sinu päevas vahelduvad. Mooduli lõpus on kontroll B2-eksami vormis.',
      ], 'Statistikaamet, ajakasutuse uuring 2019–2021: „Mehe kodu on maailm, naise maailm on kodu?” (20.12.2022) ja „Andmed paljastavad. Suur ülevaade Eesti inimeste tervislikust ajakasutusest” (17.01.2023); Statistikaamet, „Rahvaloendus. 76% Eesti rahvastikust oskab mõnda võõrkeelt” (16.11.2022).', [
        'Milline arv sind kõige rohkem üllatas ja miks?',
        'Kuidas muutub kodutööde jagamine sinu arvates järgmise kahekümne aasta pärast?',
        'Kuidas jagatakse kodutöid riigis, mida sa hästi tead: kas samamoodi nagu Eestis?',
        'Mitut keelt sa igapäevaelus kasutad ja millal sa keelt vahetad?',
      ]), 1, 12),
      tag(purpose(B.table('001_d_notes', 'Liisi slaid „Kuhu kaob meie aeg?”', 'Loe avalehte ja täida slaidi tabel ühe või kahe sõnaga.', 'Teema, Mida avaleht ütleb?', [
        'Ajakasutuse uuring | toimub iga [kümne] aasta tagant',
        'Naiste aeg kodutöödele | on kahekümne aastaga [vähenenud|lühenenud] ligi poolteist tundi päevas',
        'Söögitegemine | võtab nüüd [vähem] aega kui varem',
        'Söömine laua taga | võtab nüüd [rohkem|kauem] aega kui varem',
        'Ehitamine ja remont | on endiselt peamiselt [meeste] töö',
        'Võõrkeeleoskus noorte seas | on [suurem|kõrgem|parem] kui kogu rahvastiku seas',
      ], 'g_read'), 'Liis teeb tiimipäevaks slaidi „Kuhu kaob meie aeg?”. Ta palub sul tabeli avalehe järgi täita, et slaidil poleks ühtki valet väidet.'), { task: 'R08' }),
      station(B.text('001_d_goal', 'Moodul 1: aasta hiljem', 'On möödunud aasta. Sofia sooritas mais B1-eksami ja töötab endiselt Tuul Logistikas. Kevadel avab firma Tartus Ringtee ääres uue lao ja Liis pakub Sofiale selle projekti juhtimist: Sofiast võiks saada projektijuht. Projektijuht peab läbirääkimisi ehitajate, linnavalitsuse ja klientidega eesti keeles, seepärast on vaja märtsiks B2-taset. Firma maksaks kursuse eest ja osa tunde võiks teha tööajal. Kõigepealt teeb Sofia keelekoolis Sõna lähtediagnostika. Sina teed sama: õpetaja Maret kontrollib kõigepealt, kas sa kuuled pikka ja lühikest häälikut, ja küsib siis sinu töö ja plaanide kohta.'), 2, 14),
      tag(B.vocab('001_d_vocab', 'Tunni sõnad.', ['eesmärk — цель', 'oskus — навык', 'tugevus — сильная сторона', 'nõrkus — слабое место', 'võimalus — возможность', 'projektijuht — руководитель проекта', 'läbirääkimised — переговоры', 'diagnostika — диагностика', 'tingimus — условие', 'palve — просьба']), { topic: ['projektijuht', 'diagnostika'] }),
      teach(tag(purpose(B.choice('001_d_sounds', 'Kas kuuled vahet?', 'Õpetaja ütleb igast paarist ühe sõna. Vali sõna, mida kuulsid. Siis ütle mõlemad sõnad ise.', [
        ['Esimene rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'saada', 'sada', 'saata'],
        ['Teine rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'kooli', 'koli', 'kolli'],
        ['Kolmas rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'lina', 'linna', 'Liina'],
        ['Neljas rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'tüli', 'tuli', 'tõi'],
        ['Viies rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'töö', 'too', 'tõu'],
        ['Kuues rida: õpetaja ütleb ühe sõna. Millise sõna sa kuulsid?', 'mõtte', 'mõte', 'mõõde'],
      ], 'full', 'g_listen'), 'Maret kontrollib diagnostikas ka hääldust: kas sa kuuled lühikest ja pikka häälikut ning õ, ö ja ü vahet. Nii teab ta, mida tundides harjutada.'), { task: 'L01' }),
      'Üks-ühele: loe igast reast võtmesõna (1 saada, 2 kooli, 3 lina, 4 tüli, 5 töö, 6 mõtte) üks kord tavalises tempos, ilma rõhutamata. Pärast valikut ütleb õpilane rea kõik sõnad ise; märgi kaardile, kas pikkus (lühike, pikk, ülipikk) ja õ / ö / ü tulevad välja. Kokku 4 minutit.'),
      inLesson(teach(tag(purpose(B.speaking('001_d_talk', 'Diagnostika suuline osa.', 'Õpetaja on Maret, sinu vestluskaaslane. Vasta igale küsimusele järjest ja ilma pikkade pausideta: arvamus, põhjus ja näide. Kokku räägid umbes neli minutit.', [
        'Mida sa praegu tööl või koolis teed ja kus sa eesti keelt kasutad?',
        'Milline keeleoskus on sinu tugevus ja milline nõrkus? Too näide.',
        'Miks on täiskasvanul sinu arvates raskem keelt õppida kui lapsel?',
        'Kas tööl peaks rääkima ainult eesti keeles või võib keelt vahetada? Põhjenda.',
        'Mida sa sooviksid järgmise poole aastaga õppida?',
      ], [180, 240], ['Minu tugevus on…, sest…', 'Minu arvates…', 'Ma sooviksin…']), 'Keelekooli õpetaja Maret paneb vestluse järgi kirja sinu tugevused ja nõrkused, et soovitada sulle sobivat kursust.'), { task: 'S01', fluency: true }),
      'Üks-ühele: õpetaja on Maret ja küsib päriselt edasi („Miks?”, „Too näide.”). Ära paranda vestluse ajal. Lõpus ütle kolm asja: üks tugevus, üks nõrkus ja üks kursuse soovitus; märgi kaardile, kas õpilane räägib lausete kaupa või tervete mõtetena.')),
    ],
    practice: [
      station(tag(purpose(B.listening('001_p_call', 'Sofia helistab keelekooli.', 'Kuula kõnet kaks korda ja kirjuta lünka üks või kaks sõna või number.', [
        'Maret: Keelekool Sõna, tere! Maret kuuleb.',
        'Sofia: Tere, Maret! Siin Sofia. Ma käisin teie kursusel eelmisel aastal.',
        'Maret: Sofia, tere! Muidugi mäletan. Kuidas läks B1-eksam?',
        'Sofia: Sain hakkama! Nüüd sooviksin minna edasi B2-tasemele. Kas ma saaksin teha lähtediagnostika?',
        'Maret: Jah, muidugi. Diagnostika toimub teisipäeviti ja neljapäeviti kell kümme.',
        'Sofia: Kahjuks olen hommikuti tööl. Kas oleks võimalik tulla pärast tööd?',
        'Maret: Neljapäeval kell viis on üks aeg vaba. Kas see sobiks?',
        'Sofia: See sobiks suurepäraselt. Kui kaua diagnostika kestab?',
        'Maret: Umbes kaks ja pool tundi. Kirjalik osa on arvutis, suuline osa on minuga.',
        'Maret: Suulises osas räägime sinu tööst ja plaanidest. Lõpus on üks telefonikõne rollimänguna.',
        'Sofia: Väga hea. Kas tulemuse saan kohe teada?',
        'Maret: Tulemuse ja oskuste kaardi saadan sulle järgmisel päeval.',
        'Sofia: Kas ma peaksin midagi kaasa võtma?',
        'Maret: Palun võta kaasa isikut tõendav dokument ja oma B1-tunnistus.',
        'Sofia: Selge. Kas te võiksite saata mulle aja ka meiliga?',
        'Maret: Saadan kohe. Diagnostika maksab nelikümmend eurot, arve saadame firmale.',
        'Sofia: Suur aitäh! Näeme neljapäeval.',
      ], [
        'Sofia käis Mareti kursusel [eelmisel aastal].',
        'Tavaliselt toimub diagnostika teisipäeviti ja neljapäeviti kell [kümme|10].',
        'Sofia tuleb diagnostikale neljapäeval kell [viis|5].',
        'Diagnostika kestab umbes [kaks ja pool tundi|2,5 tundi].',
        'Suulise osa lõpus on üks telefonikõne [rollimänguna].',
        'Kaasa tuleb võtta isikut tõendav dokument ja [B1-tunnistus].',
        'Diagnostika arve saadetakse [firmale].',
      ]), 'Sofia räägib telefonis ega jõua ise kirjutada. Ta palub sul teha märkmed, et diagnostika aeg, kestus ja kaasavõetavad asjad oleksid kalendris õigesti kirjas.'), { task: 'L10' }), 3, 10),
      station(tag(purpose(B.reading('001_p_census', 'Uudis: mitu keelt, mitu emakeelt?', 'Loe uudist ja vasta lühidalt oma sõnadega. Viimasele küsimusele vasta oma arvamusega.', 'Kaks emakeelt ja eesti keel võõrkeelena', [
        'Rahvaloendusel sai 2021. aastal esimest korda märkida kaks emakeelt. Kahe emakeelega inimesi on Eestis ligikaudu 2 % rahvastikust. Kõige sagedamini märgiti kaheks emakeeleks eesti ja vene keel, teisel kohal oli eesti ja inglise keele paar. Emakeele võis ka ise sisse kirjutada: paarsada inimest märkis oma emakeeleks mõne murdekeele. Lisaks elab Eestis üle tuhande viipekeele kasutaja.',
        '',
        'Loendus näitas ka, kes oskab eesti keelt võõrkeelena. Eestis elavate soomlaste seas on eesti keele oskajaid üle poole, venelaste seas umbes pooled. Samas ei oska 40 % Eestis elavatest venelastest ühtki teist keelt peale emakeele.',
        '',
        'Keeleoskus sõltub ka vanusest. Eesti keelt oskab noortest üle 90 %, vanematest inimestest vähem. Vene keelega on lugu vastupidi: seda oskab enamik vanemaealisi, aga noortest ainult umbes pooled. Noorte seas on vene keele koha võtnud inglise keel.',
        '',
        'Allikas: Statistikaamet, „Eestis kõneldakse 243 emakeelt” (13.03.2023) ja „Rahvaloendus. 76% Eesti rahvastikust oskab mõnda võõrkeelt” (16.11.2022).',
      ], [
        ['Mis oli 2021. aasta loendusel uut?', 'sai märkida kaks emakeelt|võis märkida kaks emakeelt|kaks emakeelt'],
        ['Kas kahe emakeelega inimesi on Eestis palju või vähe?', 'vähe|vähe, umbes 2 %|vähe, ligikaudu 2 protsenti'],
        ['Millised kaks keelt märgiti kõige sagedamini kaheks emakeeleks?', 'eesti ja vene keel|eesti ja vene'],
        ['Kumbade seas on eesti keele oskajaid rohkem, Eestis elavate soomlaste või venelaste seas?', 'soomlaste seas|soomlaste|soomlased'],
        ['Kumba keelt oskavad noored rohkem, eesti või vene keelt?', 'eesti keelt|eesti'],
        ['Miks on noorte ja vanemate keeleoskus sinu arvates nii erinev?'],
      ]), 'Sinu tuttav kirjutab lõputööd mitmekeelsusest ja küsib, mida rahvaloendus keelte kohta näitas. Leia uudisest vastused, et saaksid talle lühidalt selgitada.'), { voice: 'news', task: 'R15' }), 4, 10),
      station(B.notice('001_p_notice', 'Märka: viisakas palve', ['Otse: **Saada** mulle arve! → Viisakalt: **Kas te saaksite** mulle arve saata?', 'Tingiv kõneviis: tüvi + **-ksi-**: ma **saaksin**, sa **saaksid**, te **saaksite**; ta-vorm on lühike: **saaks**', 'Viisakad algused: **Kas te võiksite** …? · **Ma sooviksin** … · **Oleks tore, kui** … · **Kas oleks võimalik** …?', 'Eitus: ma **ei saaks**, see **ei oleks** (= poleks) võimalik'], 'full'), 5, 10),
      purpose(B.transformation('001_p_polite', 'Ütle viisakamalt.', 'Tee otsesest lausest viisakas palve. Kasuta antud sõnu.', [
        ['Saada mulle arve veel täna.', 'kas te saaksite', 'Kas te saaksite mulle arve veel täna saata?|Kas te saaksite mulle veel täna arve saata?'],
        ['Helista mulle homme hommikul tagasi.', 'kas sa võiksid', 'Kas sa võiksid mulle homme hommikul tagasi helistada?'],
        ['Ma tahan kursust tööajal teha.', 'ma tahaksin', 'Ma tahaksin kursust tööajal teha.|Ma tahaksin teha kursust tööajal.'],
        ['Me tahame koosoleku reedele lükata.', 'kas oleks võimalik', 'Kas oleks võimalik koosolek reedele lükata?|Kas oleks võimalik lükata koosolek reedele?'],
        ['Firma maksab minu kursuse eest.', 'oleks tore, kui', 'Oleks tore, kui firma maksaks minu kursuse eest.'],
        ['Aita mind selle pika kirjaga.', 'kas sa aitaksid', 'Kas sa aitaksid mind selle pika kirjaga?'],
        ['Ma soovin diagnostika kohta rohkem infot.', 'ma sooviksin', 'Ma sooviksin diagnostika kohta rohkem infot.'],
      ], 'full', 'g_use'), 'Sofia kirjutab sel nädalal palju palveid: personalijuhile, keelekooli ja kolleegidele. Tee tema otsesed laused viisakaks, et keegi ei tunneks end käsutatuna.'),
    ],
    transfer: [
      station(B.text('001_t_sit', 'Palve personalijuhile', 'Diagnostika on tehtud. Mareti kokkuvõte: tugevused on lugemine ja rääkimine, nõrkused kirjutamine ja kuulamine; soovitus on B2-kursus kaks korda nädalas. Kursus maksab 480 eurot ja kestab 12 nädalat, 4 tundi nädalas. Tuul Logistika koolituskorra tingimused: firma maksab keelekursusest kuni 80 protsenti ja kuni pool kursuse ajast võib olla tööaeg, kui juht on nõus. Palve tuleb saata personalijuhile Eha Orgile kirjalikult: kursus, hind, ajakava, eesmärk ja kasu projektijuhi tööle, näiteks läbirääkimistel. Eha vastab kolme tööpäeva jooksul.'), 6, 15, { final: 'plan' }),
      teach(tag(purpose(B.letter('001_t_mail', 'Kiri personalijuhile.', 'Kirjuta Ehale poolametlik kiri: mis kursus, millal ja miks see on tööks vajalik, mida sa ise lubad ja mida palud firmalt (vähemalt kaks viisakat palvet).', 'Lugupeetud Eha Org!', 'Lugupidamisega\nSofia', [120, 150]), 'Eha Org otsustab sinu kirja põhjal, kas firma maksab kursuse eest ja annab õppimiseks tööaega. Kirjuta nii, et tal oleks otsuseks kõik vajalik ühes kirjas.'), { task: 'W13', main: true }),
      'Üks-ühele: õpetaja loeb kirja kui Eha ja vastab suuliselt otsusega („Firma maksab …, aga …”). Tagasiside samadel eesmärkidel: tingiv kõneviis palvetes, sobiv pöördumine ja lõpp, plaan on selge (mis, millal, kui palju). Kui aega jääb väheks, kirjuta kiri kodus lõpuni.'),
    ],
  },

  'b1b2-002': {
    title: 'Minu tavaline päev',
    canDo: 'Ma kuulan, kuidas kolleegid oma tööpäeva kirjeldavad, ja kirjutan uuele töötajale 110–140-sõnalise juhendi teksti, kus seon laused vähemalt kuue sidesõnaga.',
    teacherPage: {
      goal: 'Ученик понимает на слух рассказы коллег о рабочем дне и пишет для новичка связный текст-совет с союзами причины, следствия, уступки и времени.',
      core: [2, 4, 5], alt: 3,
      short: 'Станция 2 (только 4 предложения, 5 мин) → станция 5 (текст для справочника).',
      errors: [
        '«Kuna kõik helistavad korraga, hommik on pingeline» → «…, on hommik pingeline» (после придаточного глагол сразу).',
        '«Kuigi ta on väsinud, aga ta töötab edasi» → без «aga» (в эстонском «хотя… но» не сочетаются).',
        '«Seetõttu ma vajan vaikust» → «Seetõttu vajan ma vaikust» (глагол на втором месте).',
        '«Sest ma olin haige, ma ei tulnud» → «Kuna ma olin haige, ei tulnud ma…» (предложение с причиной в начале — kuna, не sest).',
      ],
      notes: [
        'Обратная связь, 2–3 цели: порядок слов после союза или наречия (seetõttu, kuna-lause); разнообразие союзов; ясный совет новичку. На станции 2 — подсказки (повторите ошибку, спросите «Kus on tegusõna?»), рекаст только если не исправил сам. Во время выступления (станция 4) не перебивайте, не больше трёх замечаний в конце.',
        'Станция 4 — беглость: одна минута, учитель держит время, повторять выступление не нужно.',
      ],
    },
    discover: [
      station(tag(purpose(B.examListen('002_d_markus', 'Markuse häälsõnum.', 'Kuula Markuse häälsõnumit kaks korda ja ühenda aeg või teema sellega, mida Markus teeb.', 'match', [
        'Markus: Tere, Liis! Küsimustiku asemel räägin oma päevast lühidalt telefoni.',
        'Markus: Minu päev algab vara, sest esimesed autod lahkuvad laost juba kell kuus.',
        'Markus: Enne kui kontorisse lähen, käin alati laos ja räägin autojuhtidega.',
        'Markus: Kella kaheksast kümneni vastan klientide kõnedele. Samal ajal kontrollin, kus autod on.',
        'Markus: See on päeva kõige pingelisem osa, kuna kõik helistavad korraga.',
        'Markus: Lõuna ajal püüan vähemalt pool tundi arvutist eemal olla, kuigi see ei õnnestu alati.',
        'Markus: Pärastlõunal planeerin järgmise päeva sõidud. Seetõttu vajan vaikust.',
        'Markus: Kahjuks on avatud kontoris vaikust harva. Kolleegid räägivad, telefon heliseb.',
        'Markus: Pärast seda kui viimane auto on tagasi, lähen koju. Tavaliselt on kell siis kuus.',
        'Markus: Minu soov tiimipäevaks: üks vaikne tuba, kus saaks rahulikult planeerida. Aitäh!',
      ], [
        ['kell kuus hommikul', 'esimesed autod lahkuvad laost'],
        ['enne kontorisse minekut', 'räägib laos autojuhtidega'],
        ['kella kaheksast kümneni', 'vastab klientide kõnedele'],
        ['päeva kõige pingelisem osa', 'hommik, sest kõik helistavad korraga'],
        ['pärastlõunal', 'planeerib järgmise päeva sõite'],
        ['avatud kontoris', 'vaikust on kahjuks harva'],
        ['soov tiimipäevaks', 'üks vaikne tuba rahulikuks planeerimiseks'],
      ]), 'Liis koondab tiimipäeva küsitluse vastused ühte tabelisse, millest saab hiljem ka uue töötaja juhend. Markus vastas häälsõnumiga, nii et sina paned tema päeva tabelisse kirja.'), {}), 1, 10),
      tag(B.vocab('002_d_vocab', 'Tunni sõnad.', ['harjumus — привычка', 'tähtaeg — срок', 'koosolek — совещание', 'keskenduma — сосредоточиться', 'segama — мешать', 'pingeline — напряжённый', 'kuigi — хотя', 'seetõttu — поэтому', 'samas — в то же время', 'juhend — справочник']), {}),
      station(B.notice('002_d_notice', 'Märka: kuidas lauseid siduda?', ['Põhjus: **sest** (lause keskel) · **kuna** (ka lause alguses): **Kuna** kõik helistavad korraga, **on** hommik pingeline.', 'Vastand: **kuigi**, **kuid**, **samas**: Mõni koosolek on kasulik, **samas** mõni kestab liiga kaua.', 'Tagajärg: **seetõttu**, **seepärast**, **nii et**: **Seetõttu vajan** ma vaikust. (tegusõna teisel kohal!)', 'Aeg: **enne kui**, **pärast seda kui**, **samal ajal kui**: **Enne kui** arvuti avan, joon kohvi.'], 'full'), 2, 10),
      purpose(B.gaps('002_d_link', 'Uudiskirja laused.', 'Kirjuta igasse lünka sobiv sidesõna kastist. Üks sõna jääb üle.', [
        '[Kuna] laos töötatakse ka öösel, on hommikuks kõik kaubad juba pakitud.',
        'Jelena jõuab tööle alati õigel ajal, [kuigi] tema buss sõidab harva.',
        'Liis tahab tiimipäeva hästi ette valmistada, [seetõttu] saatis ta kõigile küsimustiku.',
        '[Enne kui] Anna arvuti sulgeb, kontrollib ta homsed tähtajad.',
        '[Pärast seda kui] koosolek lõppes, saatis Sofia kliendile kokkuvõtte.',
        'Kontoris on hommikul lärmakas, [sest|kuna] kõik helistavad korraga.',
        'Uus ühine päevik on mugav, [samas] peab kõik sinna kohe kirja panema.',
        'Eile tuli Soomest palju autosid, [nii et] öine vahetus jäi tööle kauemaks.',
      ], ['sest', 'kuna', 'kuigi', 'seetõttu', 'samas', 'enne kui', 'pärast seda kui', 'nii et', 'samal ajal kui'], 'full', 'g_notice'), 'Liis paneb küsitluse vastustest kokku tiimipäeva uudiskirja. Aita tal laused siduda nii, et lugeja näeb põhjust, tagajärge ja järjekorda.'),
    ],
    practice: [
      station(tag(purpose(B.listening('002_p_gert', 'Intervjuu: öine vahetus.', 'Kuula intervjuud kaks korda ja kirjuta lünka 1–3 sõna.', [
        'Liis: Gert, sinu päev on teistsugune kui meil. Millal see algab?',
        'Gert: Minu päev algab siis, kui teie oma lõpetate. Laos töötan öövahetuses kella kümnest õhtul kuueni hommikul.',
        'Liis: Mida sa enne tööd teed?',
        'Gert: Enne kui tööle tulen, magan kolm-neli tundi. Seejärel söön perega õhtust.',
        'Liis: Mis on öö kõige pingelisem osa?',
        'Gert: Kella kahest neljani, kuna siis tulevad suured autod Soomest. Samal ajal peame laadima meie oma autosid.',
        'Liis: Kuidas sa väsimusega toime tuled?',
        'Gert: Kuigi töötan öösel juba kaheksa aastat, on talvel ikka raske. Seetõttu joon palju vett ja liigun palju.',
        'Liis: Mis sind tööl kõige rohkem segab?',
        'Gert: Kõige rohkem segab see, et päevane vahetus jätab info ainult paberile. Sageli ei leia ma seda üles.',
        'Liis: Mida sa tiimipäevalt ootad?',
        'Gert: Ma sooviksin, et öö- ja päevavahetus räägiksid omavahel rohkem. Näiteks võiksime kasutada ühist veebipõhist päevikut.',
        'Liis: Ja mis on sinu töö juures parim?',
        'Gert: Öösel on laos rahulik. Kui hommikul viimane auto lahkub, tean, et olen midagi ära teinud.',
      ], [
        'Gert töötab öövahetuses kella [kümnest|22st] õhtul kuueni hommikul.',
        'Enne tööd magab ta [kolm-neli tundi|3–4 tundi].',
        'Öö kõige pingelisem aeg on kella [kahest neljani|2–4].',
        'Siis tulevad suured autod [Soomest].',
        'Väsimuse vastu joob ta palju [vett].',
        'Päevane vahetus jätab info ainult [paberile].',
        'Gert sooviks ühist veebipõhist [päevikut].',
      ], 'g_listen'), 'Liis teeb uudiskirja jaoks intervjuu laojuhi Gertiga. Pane kirja faktid, et uudiskirjas ei oleks ühtki valet kellaaega.'), { task: 'L03' }), 3, 12),
      tag(purpose(B.writing('002_p_night', 'Lugu uudiskirja: öine vahetus.', 'Kirjuta kuue minutiga uudiskirja 5–6 lauset Gerti ööst. Seo laused sidesõnadega.', [5, 6], ['kuna', 'kuigi', 'seetõttu', 'pärast seda kui'], 2, 'g_notice'), 'Päevased töötajad ei tea, mis laos öösel toimub. Kirjuta neile uudiskirja lühike lugu, mis läheb hiljem ka uue töötaja juhendisse, et nad mõistaksid, miks info peab olema ühes kohas.'), { task: 'W02', level: 3, fluency: true }),
      station(tag(purpose(B.examListen('002_p_office', 'Raadiointervjuu: kuidas avatud kontoris keskenduda?', 'Kuula intervjuud kaks korda. Märgi, kas väide on õige või vale.', 'truefalse', [
        'Saatejuht: Tere! Paljudes firmades töötatakse avatud kontoris. Stuudios on töökeskkonna nõustaja Piret Lõhmus. Piret, miks on avatud kontoris nii raske keskenduda?',
        'Piret: Peamine põhjus on hääled. Kõige rohkem ei sega mitte masinate müra, vaid teiste inimeste jutt, sest aju tahab kuuldud lauseid mõista. Kui kolleeg räägib kõrval telefonis, kuulame tahes-tahtmata kaasa.',
        'Saatejuht: Kas kõrvaklapid aitavad?',
        'Piret: Lühikeseks ajaks aitavad küll. Aga kui inimene istub terve päeva klappidega, ei julge kolleegid temalt enam midagi küsida ja meeskond suhtleb vähem.',
        'Saatejuht: Mida siis teha?',
        'Piret: Esiteks tasub kokku leppida vaiksed tunnid, näiteks hommikupoolikul, kui kontoris ei peeta kõnesid ega koosolekuid. Teiseks võiks olla üks väike tuba, kuhu saab minna keskendumist nõudva töö või privaatse vestluse jaoks.',
        'Saatejuht: Kas avatud kontoril on ka plusse?',
        'Piret: Kindlasti. Uus töötaja õpib seal kiiremini, sest ta kuuleb, kuidas kogenud kolleegid probleeme lahendavad. Ja lihtsa küsimuse saab kohe ära küsida, ei pea kirjutama ega ootama.',
        'Saatejuht: Mis on kõige sagedasem viga?',
        'Piret: See, et reeglid kirjutatakse üles, aga keegi ei pea neist kinni, kõige vähem juhid. Kui juht ise räägib vaiksel tunnil valjult telefonis, kaob kogu mõte.',
        'Saatejuht: Aitäh, Piret!',
      ], [
        ['Nõustaja sõnul segavad avatud kontoris kõige rohkem masinate hääled.', false],
        ['Teiste inimeste jutt segab, sest aju püüab kuuldud lauseid mõista.', true],
        ['Kui inimene istub terve päeva kõrvaklappidega, võib meeskond vähem suhelda.', true],
        ['Vaiksel tunnil võib kontoris pidada lühikesi koosolekuid.', false],
        ['Avatud kontoris õpib uus töötaja kiiremini, sest ta kuuleb kogenud kolleege.', true],
        ['Nõustaja arvates on kõige sagedasem viga see, et reegleid ei kirjutata üles.', false],
      ], 'g_listen'), 'Tiimipäeval arutatakse, milliseid uusi harjumusi kontoris proovida, et tähelepanu paremini hoida. Kuula nõustaja intervjuud, et sinu ettepanek põhineks asjatundja nõuannetel.'), { voice: 'interview', task: 'L05' }), 4, 15),
      inLesson(teach(tag(purpose(B.speaking('002_p_talk', 'Sõnavõtt tiimipäeval: kuidas meil paremini keskenduda?', 'Õpetaja juhatab koosolekut ja on sinu vestluskaaslane. Mõtle üks minut, siis räägi üks minut: probleem, põhjus ja üks ettepanek. Lõpus vasta juhataja küsimusele.', [
        'Milline katkestus segab sinu meelest kontoris kõige rohkem keskendumist?',
        'Miks on see probleem kogu meeskonnale?',
        'Millise reegli sa ettepanekuna teeksid?',
        'Mis võib selle reegli juures raskeks osutuda?',
      ], [60, 120], ['Minu arvates segab kõige rohkem…', 'Kuna…, siis…', 'Seetõttu teen ettepaneku…']), 'Liis kogub tiimipäeval ettepanekuid, kuidas kontoris rahulikumalt töötada. Sinu üheminutiline sõnavõtt läheb koosoleku protokolli.'), { task: 'S16', fluency: true }),
      'Üks-ühele: õpetaja on koosoleku juhataja Liis ja näitab aega (üks minut). Ära katkesta. Pärast sõnavõttu küsi üks päris küsimus, näiteks „Kes jälgib, et reeglist kinni peetakse?”. Lõpus kuni kolm märkust: sidesõnad, tegusõna koht, kas ettepanek oli selge.')),
    ],
    transfer: [
      station(B.text('002_t_sit', 'Praktikant Laura', 'Esmaspäeval alustab Tuul Logistikas praktikant Laura. Ta õpib Tartu ülikoolis logistikat ja võib kevadel jääda tööle uude Tartu lattu. Liis palus Sofial olla Laura juhendaja. Laura tahab kohe õiged harjumused omandada ja kirjutas juba tiimi vestlusesse küsimused: „Mis kell tööpäev algab? Millega peaksin hommikul alustama? Millal on kõige kiirem aeg? Kas kirjadele peab vastama ka õhtul?” Selle asemel et igale küsimusele eraldi vastata, kirjutad uue töötaja juhendisse teksti „Tavaline päev kliendihalduses”. Kirjelda Sofia päeva või oma tööpäeva.'), 5, 15, { final: 'advise' }),
      B.know('002_t_know', ['Mitmes riigis on töötaja õigus pärast tööaega töökirjadele mitte vastata kirjas seaduses või ametlikus juhendis. Prantsusmaal peavad suuremad ettevõtted alates 2017. aastast kehtestama reeglid, millal töötaja võib olla kättesaamatu. Iirimaal kehtib alates 2021. aastast selle kohta tegevusjuhend ja Kanada Ontario provintsis peavad tööandjad alates 2022. aastast kirja panema oma reeglid töövälise suhtluse kohta.'], 'Prantsusmaa töökoodeks, artikkel L2242-17 (2017); Iirimaa töösuhete komisjoni tegevusjuhend töövälise kättesaamatuse kohta (2021); Kanada Ontario provintsi tööstandardite seadus, osa VII.0.1 (2022)', 'Kas teadsid? Õigus mitte vastata'),
      teach(tag(purpose(B.examWriting('002_t_guide', 'Tekst uue töötaja juhendisse.', 'Kirjuta 110–140 sõna. Kirjuta kõigist neljast punktist ja kasuta vähemalt kuut eri sidesõna.', 'jutt', {
        situation: 'Uue töötaja juhend, peatükk „Tavaline päev kliendihalduses”. Lugeja on Laura ja kõik järgmised uued töötajad.',
        points: ['mis kell päev algab ja millest alustada', 'mis on päeva kõige kiirem aeg ja miks', 'kuidas kirjade, kõnede ja tähtaegadega toime tulla', 'kaks nõuannet uuele töötajale'],
        words: [110, 140],
      }), 'Laura ja kõik järgmised uued töötajad loevad juhendit esimesel päeval. Kirjuta nii, et nad teavad, mis neid ees ootab ja kuidas päevaga toime tulla.'), { main: true, task: 'W05' }),
      'Üks-ühele: õpetaja loeb teksti kui Laura ja küsib ühe täpsustava küsimuse („Aga kui klient helistab kell viis?”). Tagasiside samadel eesmärkidel: vähemalt kuus eri sidesõna, tegusõna koht pärast seetõttu / kuna-lauset, kaks selget nõuannet.'),
    ],
  },

  'b1b2-003': {
    title: 'Aeg, sagedus ja lauseehitus',
    canDo: 'Ma kuulan lühikest loengut, räägin oma nädalarütmist ja lepin argumendikaartidega kokku ühise seisukoha; aja- või sagedusväljendi järel panen tegusõna teisele kohale.',
    teacherPage: {
      goal: 'Ученик говорит о частоте, времени и длительности (глагол на втором месте после наречия), передаёт коллеге суть лекции и договаривается в споре с карточками аргументов.',
      core: [2, 4, 5], alt: 3,
      short: 'Станция 2 (только порядок слов, 5 мин) → станция 5 (спор и решение).',
      errors: [
        '«Kolmapäeviti paljud töötavad kodus» → «Kolmapäeviti töötavad paljud kodus» (после наречия времени глагол на втором месте).',
        '«kaheksa tunnid», «kakskümmend minutid» → «kaheksa tundi», «kakskümmend minutit» (после числа — партитив ед. ч.).',
        '«kaks korda nädalal» → «kaks korda nädalas».',
        'Ударение: «kolmaPÄEviti», «nädalavaHEtusel» → всегда на первом слоге: «KOLmapäeviti», «NÄdalavahetusel».',
      ],
      notes: [
        'Произношение (станция 2, 3 мин): ученик читает собранные предложения вслух; вы слушаете ударение на первом слоге и долгие гласные. Сначала дайте услышать (прочитайте одно предложение сами), потом ученик.',
        'Медиация (станция 4): ответ Елене должен быть коротким и полезным — три мысли из лекции и один совет, не пересказ всей лекции.',
        'Обратная связь, 2–3 цели: глагол на втором месте после наречия; партитив после числа; аргумент + пример в споре. В споре не перебивайте, не больше трёх замечаний в конце.',
      ],
    },
    discover: [
      station(tag(purpose(B.profiles('003_d_team', 'Kolm nädalarütmi.', 'Loe kaarte ja kirjuta lünka sobiv aja- või sagedusväljend.', [
        ['Markus', ['logistik', 'käib laos igal hommikul kell 7', 'koosolekutel 6 tundi nädalas', 'puhkab harva terve nädalavahetuse'], ['[Igal hommikul|Iga päev] käib Markus laos.', 'Koosolekutel istub ta [kuus tundi|6 tundi] nädalas.']],
        ['Jelena', ['administraator', 'on kontoris iga tööpäev kell 8–16', 'tellib kontorisse kaupa kord kuus', 'teeb lõunapausi alati kell 12'], ['Kontoris on Jelena [iga tööpäev|igal tööpäeval].', 'Kaupa tellib ta [kord kuus|üks kord kuus].']],
        ['Kristjan', ['müügijuht', 'on kliendi juures 2–3 päeva nädalas', 'kirjutab aruande iga teine reede', 'käib kontoris aeg-ajalt'], ['Kliendi juures on Kristjan [kaks-kolm päeva|2–3 päeva] nädalas.', 'Aruande kirjutab ta [iga teine reede|igal teisel reedel].']],
      ], '3', 'g_notice'), 'Koolitaja Hendrik paneb tiimipäeva slaidile kolme kolleegi nädalarütmi. Kirjuta kaartide põhjal laused, mida ta saab slaidil näidata.'), { task: 'G03' }), 1, 12),
      tag(B.vocab('003_d_vocab', 'Tunni sõnad.', ['sagedus — частота', 'kestus — продолжительность', 'aeg-ajalt — время от времени', 'harva — редко', 'kolmapäeviti — по средам', 'keskmiselt — в среднем', 'tähelepanu — внимание', 'katkestus — помеха', 'rütm — ритм', 'ettepanek — предложение']), { topic: ['kolmapäeviti'] }),
      teach(tag(purpose(B.speaking('003_d_talk', 'Minu nädalarütm.', 'Õpetaja on sinu vestluskaaslane tiimipäeval. Vasta küsimustele kokku kahe ja poole minutiga ja alusta iga vastust aja- või sagedusväljendiga.', [
        'Mida sa teed iga päev ja mida ainult aeg-ajalt?',
        'Kui tihti sa töö- või kooliposti vaatad? Kas see on sinu arvates liiga tihti?',
        'Kui kaua suudad sa ühele asjale keskenduda ja mis sind segab?',
        'Mis on sinu arvates parem: iga päev lühike koosolek või üks pikem koosolek nädalas?',
      ], [150, 210], ['Kolmapäeviti…', 'Kord nädalas…', 'Tavaliselt…, umbes kakskümmend minutit']), 'Hendrik alustab tiimipäeva lühikese vestlusringiga, et igaüks näeks, kui erinev on kolleegide nädal. Tulemus: sa oskad oma nädalat kiiresti ja täpselt kirjeldada.'), { task: 'S02', fluency: true }),
      'Üks-ühele: õpetaja on kolleeg tiimipäeval, hoiab aega (kaks minutit) ja vastab ka ise ühele küsimusele. Ära paranda vestluse ajal; lõpus ütle, mitu vastust algas aja- või sagedusväljendiga ja kas tegusõna oli teisel kohal.'),
      station(B.notice('003_d_notice', 'Märka: kui tihti, millal, kui kaua?', ['Kui tihti? **iga päev**, **kord nädalas**, **kaks korda kuus**, **aeg-ajalt**, **harva**, **mitte kunagi** (ei … kunagi)', 'Millal? **kolmapäeviti** (= iga kolmapäev), **õhtuti**, **nädalavahetusel**, **iga teine reede**', 'Kui kaua? **kaheksa tundi**, **kakskümmend minutit** (arv + osastav), **terve päeva**, **nädal aega**', 'Sõnajärg: määrus lause alguses → tegusõna **teisel kohal**: **Kolmapäeviti töötavad** paljud kodus.', 'Hääldus: rõhk on alati sõna **esimesel silbil**, ka pikkades sõnades nagu kolmapäeviti ja nädalavahetusel.'], 'full'), 2, 10),
      teach(purpose(B.wordorder('003_d_order', 'Alusta ajaväljendiga!', 'Pane sõnad õigesse järjekorda ja alusta ajaväljendiga. Siis loe laused valjusti: rõhk on sõna esimesel silbil.', [
        'Kolmapäeviti töötavad paljud meie kolleegid rahulikult kodus.',
        'Kord nädalas peab Liis kogu tiimiga pikema koosoleku.',
        'Õhtuti pärast kella kuut ei vaata Sofia enam tööposti.',
        'Aeg-ajalt sõidab Gert koos autojuhtidega ise Soome.',
        'Nädalavahetusel ei loe Anna kunagi oma tööposti.',
        'Kaks nädalat panid kõik töötajad oma tööaja täpselt kirja.',
        'Reedeti lahkub Laura kontorist juba kell kolm.',
      ], 'full'), 'Hendriku slaidil on kolleegide nädalaplaani laused segamini. Pane need korda ja loe ette nii, nagu Hendrik neid tiimile ette loeks.'),
      'Hääldus, 3 minutit: loe kõigepealt üks lause ise ette (kuulamine enne rääkimist), siis loeb õpilane kõik laused. Kuula rõhku esimesel silbil ja pikki täishäälikuid (kolmapäeviti, nädalavahetusel, aeg-ajalt). Paranda vihjega („Kus on rõhk?”), mitte kohe ise öeldes.'),
    ],
    practice: [
      station(tag(purpose(B.insertion('003_p_insert', 'Jelena blogi: koosolekuvaba kolmapäev.', 'Pane igasse lünka sobiv lause. Üks lause jääb üle.', 'Minu koosolekuvaba kolmapäev', [
        'Minu eelmises töökohas proovisime ühel sügisel uut korda: kolmapäeviti ei toimunud ühtegi sisemist koosolekut. [[Alguses tundus see mulle natuke imelik, sest olin harjunud nädala planeerimisega.]] Esimesel kolmapäeval vaatasin postkasti peaaegu iga kümne minuti järel. [[Siis otsustasin avada postkasti ainult enne lõunat ja enne koju minekut.]]',
        '',
        'Teisel nädalal läks juba palju paremini. [[Hommikul tegin kaks tundi järjest ainult ühte asja ja keegi ei seganud.]] Koostasin selle ajaga uue tellimuste tabeli. [[Varem võttis selline töö mul terve nädala.]]',
        '',
        'Muidugi ei olnud kõik ideaalne. [[Ühel kolmapäeval helistas klient, kes vajas kiiresti abi.]] Aitasin teda kohe ja jätkasin pärast kõnet oma tööd.',
        '',
        'Kas soovitan koosolekuvaba päeva teistele? Jah, aga ühe tingimusega. [[Kõik peavad sellest reeglist kinni pidama, ka juhid.]]',
      ], ['Kolmapäeviti on poodides ja kohvikutes tavaliselt vähem inimesi kui reedeti.']), 'Jelena saatis tiimile oma vana blogipostituse, aga kopeerimisel kukkusid kuus lauset välja. Pane need tagasi, et kolleegid saaksid enne arutelu tema kogemust lugeda.'), { task: 'R16' }), 3, 10),
      station(tag(purpose(B.listening('003_p_hendrik', 'Hendriku loeng.', 'Hendrik räägib tähelepanust ja tutvustab teadusuuringuid. Kuula kaks korda ja täida märkmed: kirjuta lünka 1–3 sõna. Allikas: G. Mark, „Attention Span” (2023); California Ülikooli (Irvine) intervjuu Gloria Markiga (11.05.2023).', [
        'Hendrik: Head kolleegid! Räägin teile lühidalt, mida teadus ütleb meie tähelepanu kohta.',
        'Hendrik: Ameerika teadlane Gloria Mark California ülikoolist on üle kahekümne aasta mõõtnud, kui kaua inimesed ühele ekraanile keskenduvad.',
        'Hendrik: Kahe tuhande neljandal aastal oli see keskmiselt kaks ja pool minutit. Kahe tuhande kaheteistkümnendaks aastaks oli aeg lühenenud seitsmekümne viie sekundini.',
        'Hendrik: Viimastel aastatel on keskmine olnud ainult nelikümmend seitse sekundit. Siis vahetab inimene akent, rakendust või seadet.',
        'Hendrik: Ühe tööprojekti juures püsitakse keskmiselt umbes kümme ja pool minutit, siis minnakse millegi muu juurde.',
        'Hendrik: Kui töö katkeb, kulub keskmiselt umbes kakskümmend viis minutit, enne kui inimene algse töö juurde tagasi jõuab.',
        'Hendrik: Huvitav on see, et me segame ennast ise sama sageli, kui teised meid segavad.',
        'Hendrik: Mida teha? Esiteks soovitan vaadata postkasti kindlatel aegadel, näiteks kolm korda päevas.',
        'Hendrik: Teiseks: Marki uuringute järgi on enamikul inimestel kõige parem keskendumisaeg hommikupoolikul. Teine tipp on pärastlõunal kella kahe ja kolme vahel.',
        'Hendrik: Seepärast tasub rasked ülesanded panna just nendele tundidele ja koosolekud muule ajale.',
        'Hendrik: Kolmandaks: lühike koosolek on parem kui pikk. Viieteistminutilisel koosolekul ei istuta, vaid seistakse.',
        'Hendrik: Samas ei sobi üks lahendus kõigile. Laotöötajad ja müügijuhid vajavad teistsugust rütmi.',
        'Hendrik: Seepärast peab iga tiim ise kokku leppima, mis talle sobib. Seda teemegi pärast lõunat.',
      ], [
        'Gloria Marki esimeses uuringus 2004. aastal keskendusid inimesed ühele ekraanile keskmiselt [kaks ja pool|2,5] minutit.',
        'Viimastel aastatel on keskmine aeg, mil inimene ühe ekraani juures püsib, ainult [nelikümmend seitse|47] sekundit.',
        'Kui töö katkeb, kulub algse töö juurde tagasi jõudmiseks keskmiselt umbes [kakskümmend viis|25] minutit.',
        'Hendriku sõnul segame me ennast [ise] täpselt sama sageli, kui kolleegid ja teised inimesed meid segavad.',
        'Hendrik soovitab vaadata postkasti kindlatel aegadel, näiteks [kolm korda|3 korda] päevas.',
        'Hommikupooliku järel on enamikul inimestel teine keskendumise tipp pärastlõunal kella kahe ja [kolme] vahel.',
        'Viieteistminutilisel koosolekul ei istuta Hendriku soovituse järgi toolidel, vaid [seistakse].',
      ]), 'Kolleeg Jelena ei saanud tiimipäevale tulla ja palus sul Hendriku loengust märkmeid teha. Kirjuta üles arvud ja nõuanded, et saaksid talle täpselt edasi anda.'), { voice: 'expert', task: 'L04' }), 4, 15),
      tag(purpose(B.writing('003_p_jelena', 'Vastus Jelenale tiimi vestluses.', 'Jelena kirjutab tiimi vestlusesse: „Mul oli laps haige. Mis oli loengus kasulik?” Vasta 5–6 lausega: kolm tähtsamat mõtet ja üks nõuanne meie tiimile.', [5, 6], ['keskmiselt', 'minutit', 'seepärast'], 2), 'Jelena peab homme oma tööpäeva planeerima ega jõua loengut kuulata. Anna talle lühidalt edasi, mis on kasulik, et ta ei peaks ise kõike otsima.'), { task: 'W12', level: 3 }),
    ],
    transfer: [
      station(B.text('003_t_sit', 'Pärastlõuna: otsus', 'Pärast lõunat arutab tiim Pärnus kahte ettepanekut: koosolekuvaba kolmapäev või iga päev viieteistminutiline hommikukoosolek. Lõpuks peab tiim valima ühe variandi või leidma kompromissi, mida jaanuarist kolm kuud proovitakse. Sina kaitsed koosolekuvaba kolmapäeva, õpetaja hommikukoosolekut.'), 5, 15, { final: 'decide' }),
      purpose(B.profiles('003_t_cards', 'Kaks ettepanekut.', 'Loe kaarte. Joonista ring ümber ühe plussi ja ühe miinuse, mis on sinu arvates kõige tähtsamad.', [
        ['A: koosolekuvaba kolmapäev', ['kolmapäeviti ei toimu ühtegi sisemist koosolekut', 'kiiretele kõnedele vastab üks valvetöötaja', 'katse kestab kolm kuud', 'pluss: terve päev rahulikku tööd, tähtajad ei jää viimasele minutile', 'miinus: teistel päevadel võib koosolekuid olla rohkem', 'miinus: laotöötajatele vaikne päev ei sobi'], []],
        ['B: iga päev lühike hommikukoosolek', ['iga tööpäev kell 8.45 kohvinurgas, 15 minutit', 'igaüks ütleb kolme lausega, mida ta teeb ja millist abi vajab', 'Gert jätab hommikuks öövahetuse kokkuvõtte', 'pluss: kõik teavad, mis toimub', 'miinus: viisteist minutit päevas teeb nädalas üle tunni', 'miinus: kaugtöö päeval peab koosolek olema videos'], []],
      ], '2'), 'Hendrik jagab kaks ettepanekukaarti, et arutelu põhineks faktidel. Vali enne arutelu, milline argument on sinu jaoks kõige kaalukam.'),
      teach(tag(purpose(B.rolecards('003_t_debate', 'Arutelu: kumb variant?', 'Õpetaja kaitseb hommikukoosolekut, sina koosolekuvaba kolmapäeva. Mida ja kuidas öelda, otsusta ise. Jõudke ühise otsuseni.',
        'Olukord: tiim peab täna valima, kuidas jaanuarist kolm kuud töötatakse.\nSinu eesmärk: kaitsta koosolekuvaba kolmapäeva ja jõuda ühise otsuseni, mida kõik saavad proovida.\nPiirang: kliendid helistavad ka kolmapäeval ja Gerti laotiim töötab vahetustega.',
        'Õpetaja kaart: tal on oma argumendid ja oma mure. Kuula, vasta argumendiga ja paku kompromiss.',
        ['Kolmapäeviti saaksime…', 'Kuigi…, on…', 'Mis oleks, kui…?'], ['Iga päev kell 8.45…', 'Samas ei sobi see…', 'Lepime kokku, et…']), 'Tiim peab täna otsustama, kuidas jaanuarist kolm kuud töötatakse. Tulemus: üks ühine otsus, mille Sofia saab Liisile ettepanekuna saata.'), { task: 'S17', main: true }),
      'Üks-ühele, õpetaja kaart (kaitseb hommikukoosolekut, eelistab igapäevast lühikest kokkusaamist). Varjatud info: kolmapäeva hommikul helistavad Pärnu kliendid kõige rohkem; praktikant Laura vajab iga päev infot, mida teha; Gerti paberil jäetud öised märkmed lähevad kaduma. Takistused (ükshaaval, oota reaktsiooni): 1) „Kliendid ei oota kolmapäevani!”; 2) „Laura on uus — kuidas ta ilma hommikukoosolekuta teab, mida teha?”; 3) „Viisteist minutit venib alati pooleks tunniks.” Õnnestunud, kui: on üks ühine otsus (A, B või kompromiss, näiteks koosolekuvaba kolmapäeva hommik ja teistel päevadel 15-minutiline seisukoosolek), on öeldud, kuidas kolme kuu pärast tulemust kontrollitakse, õpilane kasutab vähemalt kolme aja- või sagedusväljendit tegusõnaga teisel kohal ja ütleb otsuse ühe lausega.'),
    ],
  },

  'b1b2-004': {
    title: 'Argipäev vs nädalavahetus',
    canDo: 'Ma loen kolleegide kogemust ja lepin juhiga oma õppeplaani kokku: võrdlen kahte võimalust vähemalt kolmes punktis ja põhjendan, miks üks sobib mulle paremini.',
    teacherPage: {
      goal: 'Ученик сравнивает два варианта (keskvõrre + kui, kõige, võrreldes + -ga, erinevalt + -st) и договаривается с руководителем о реалистичном учебном плане.',
      core: [2, 4, 6], alt: 5,
      short: 'Станция 2 (только 4 предложения, 5 мин) → станция 6 (разговор с Лийс).',
      errors: [
        '«rohkem paindlik» → «paindlikum» (сравнительная степень одним словом, калька с «более гибкий»).',
        '«võrreldes Liisile» → «võrreldes Liisiga» (võrreldes + -ga).',
        '«kasulikum nagu üks pikk tund» → «kasulikum kui …» (при сравнении — kui, не nagu).',
        '«kõige parim» → «parim» или «kõige parem».',
      ],
      notes: [
        'Обратная связь, 2–3 цели: формы сравнения; три пункта сравнения (время, цена, усталость); итог договорённости в трёх строках. На станции 2 — подсказки, рекаст только если ученик не исправил сам. В разговоре с Лийс не перебивайте; не больше трёх замечаний в конце.',
        'Станция 5 — онлайн-общение (семейный чат): ответ короткий, по делу, с одним сравнением в каждом предложении.',
      ],
    },
    discover: [
      station(B.text('004_d_two', 'Argipäev või nädalavahetus?', 'Liis: Minu argipäevad on pikad ja õhtul olen nii väsinud, et ma ei suudaks enam midagi uut õppida. Laupäeva hommik on mu nädala kõige rahulikum aeg: kodu on vaikne ja pea on värske. Prantsuse keele kursusel käisin laupäeviti, kuigi pidin loobuma pikkadest nädalavahetuse reisidest.\n\nMarkus: Minul on vastupidi. Argipäeviti on mu tööaeg paindlikum kui Liisil, sest planeerin sõite ise. Nädalavahetustel pildistan pulmi ja sünnipäevi, nii et vaba laupäev on mul harva. Inglise keele kursusel käisin teisipäeva ja neljapäeva õhtuti: tunnid olid lühemad, aga sagedamini. Halvim oli see, et pärast rasket päeva jätsin aeg-ajalt tunni vahele.'), 1, 12),
      purpose(B.diagram('004_d_venn', 'venn', { title: 'Liis ja Markus.', instruction: 'Täida skeem tekstist. Kirjuta lünka üks või kaks sõna.', left: 'Liis', right: 'Markus', leftItems: 'õppis [laupäeviti|nädalavahetusel]\nõhtul liiga [väsinud]\nloobus [reisidest]', both: 'käisid [keelekursusel|kursusel]', rightItems: 'õppis [argipäeva|tööpäeva] õhtuti\nnädalavahetusel [pildistab]\ntunnid olid [sagedamini|lühemad]' }, 'full', 'g_read'), 'Sofia küsis kolleegidelt nõu, millal õppida. Pane nende kogemus skeemile, et Sofia näeks erinevusi ühe pilguga.'),
      tag(B.vocab('004_d_vocab', 'Tunni sõnad.', ['argipäev — будний день', 'nädalavahetus — выходные', 'paindlik — гибкий', 'kohustus — обязанность', 'eelistama — предпочитать', 'loobuma — отказываться', 'võrreldes — по сравнению', 'erinevalt — в отличие от', 'kasulik — полезный', 'kinni pidama — придерживаться']), {}),
      station(B.notice('004_d_notice', 'Märka: kuidas võrrelda?', ['Keskvõrre + **kui**: õhtune tund oli **lühem kui** laupäevane. (lühike → **lühem**, hea → **parem**)', 'Ülivõrre: **kõige** + keskvõrre: **kõige rahulikum** aeg; lühike vorm: **parim**, **halvim**', '**Võrreldes** + **-ga**: **võrreldes Liisiga** on Markuse tööaeg paindlikum.', '**Erinevalt** + **-st**: **erinevalt Liisist** õppis Markus õhtuti.', '**Mida** + keskvõrre, **seda** + keskvõrre: **mida** sagedamini, **seda** parem.'], 'full'), 2, 10),
      purpose(B.errorfix('004_d_fix', 'Paranda võrdlus.', 'Igas lauses on üks võrdlemise viga. Kirjuta lause õigesti.', [
        ['Laupäevane tund kestab neli tundi ja on palju pikem kui õhtune tunnist.', 'Laupäevane tund kestab neli tundi ja on palju pikem kui õhtune tund.'],
        ['Markus planeerib sõite ise, seepärast on tema tööaeg rohkem paindlik kui Liisi tööaeg.', 'Markus planeerib sõite ise, seepärast on tema tööaeg paindlikum kui Liisi tööaeg.'],
        ['Võrreldes Liisile on Markuse nädalavahetus pulmade ja sünnipäevade tõttu palju kiirem.', 'Võrreldes Liisiga on Markuse nädalavahetus pulmade ja sünnipäevade tõttu palju kiirem.'],
        ['Erinevalt Liisiga käis Markus keelekursusel teisipäeva ja neljapäeva õhtuti.', 'Erinevalt Liisist käis Markus keelekursusel teisipäeva ja neljapäeva õhtuti.'],
        ['Laupäeva hommik on Liisi nädala kõige rahulik aeg, sest kodu on siis vaikne.', 'Laupäeva hommik on Liisi nädala kõige rahulikum aeg, sest kodu on siis vaikne.'],
        ['Mida sagedamini sa uusi sõnu kordad, see paremini jäävad need meelde.', 'Mida sagedamini sa uusi sõnu kordad, seda paremini jäävad need meelde.'],
        ['Liisi arvates on lühike tund mitu korda nädalas kasulikum nagu üks pikk tund laupäeval.', 'Liisi arvates on lühike tund mitu korda nädalas kasulikum kui üks pikk tund laupäeval.'],
      ]), 'Sofia kirjutas kolleegide vastustest Liisile kokkuvõtte, aga võrdlustes on vead. Paranda need, enne kui ta kokkuvõtte ära saadab.'),
      station(teach(tag(purpose(B.speaking('004_d_week', 'Kumb sobib sulle?', 'Õpetaja on sinu vestluskaaslane. Räägi kahe minuti jooksul ilma pikkade pausideta: võrdle oma argipäeva ja nädalavahetust.', [
        'Kumb on sinu jaoks pingelisem, argipäev või nädalavahetus? Kui palju kohustusi sul siis on?',
        'Kumba sa õppimiseks eelistad, argipäeva õhtut või laupäeva hommikut? Miks?',
        'Kas lühemad tunnid sagedamini on sinu arvates paremad kui üks pikk tund?',
        'Kas sinu nädal sarnaneb rohkem Liisi või Markuse nädalaga?',
      ], [120, 180], ['… on … kui…', 'Võrreldes …-ga…', 'Mida…, seda…']), 'Enne kui valid kursuse, pead teadma oma rütmi. Õpetaja küsib nagu sõber, kes ise kursust otsib, ja võrdleb oma nädalat sinu omaga.'), { task: 'S11', fluency: true }),
      'Üks-ühele: õpetaja on sõber, kes ka kursust otsib, ja kirjeldab lühidalt oma nädalat. Hoia aega (kaks minutit), ära paranda; lõpus ütle, mitu võrdlust õpilane tegi.'), 3, 8),
    ],
    practice: [
      station(tag(purpose(B.examListen('004_p_expert', 'Raadiosaade: kuidas töö kõrvalt õppida?', 'Kuula saadet kaks korda ja vali igale küsimusele õige vastus.', 'choice', [
        'Saatejuht: Tere! Paljud täiskasvanud tahavad õppida, aga ei tea, kuidas seda töö kõrvalt teha. Stuudios on täiskasvanuhariduse nõustaja Tiiu Saar. Tiiu, mis on kõige levinum viga?',
        'Tiiu: Inimesed teevad liiga suure plaani. Jaanuaris lubatakse õppida iga päev kaks tundi, aga veebruaris on plaan unustatud, sest töö ja pere kohustused ei kao kuhugi. Parem on väike plaan, mida jaksad ka väsinuna täita. Siis muutub õppimine harjumuseks.',
        'Saatejuht: Kumb on parem, õhtune või nädalavahetuse kursus?',
        'Tiiu: Ühte õiget vastust ei ole. Õhtune kursus on sagedasem ja lühem, see aitab mälu. Nädalavahetusel on inimene värskem, aga nädal on pikk ja vahepeal ununeb palju.',
        'Saatejuht: Mida teha, et ei ununeks?',
        'Tiiu: Korrata lühidalt, aga tihti: kümme-viisteist minutit päevas on kasulikum kui kaks tundi pühapäeval. Ja korrata tasub nii, et ennast kontrollid, mitte ainult ei loe teksti uuesti läbi.',
        'Saatejuht: Kuidas töö ja õppimine kokku sobitada?',
        'Tiiu: Rääkige oma juhiga. Paljud tööandjad toetavad õppimist, kui töötaja oskab selgitada, kuidas uus oskus tööd aitab. Kirjutage kokkulepe üles: eesmärk, aeg ja kuidas tulemust kontrollite.',
        'Saatejuht: Ja kui midagi läheb valesti?',
        'Tiiu: Siis ärge loobuge, vaid muutke plaani. Haigus või kiire kuu ei ole ebaõnnestumine. Tähtis on see, et kolme kuu pärast õpite ikka veel.',
        'Saatejuht: Aitäh, Tiiu!',
      ], [
        ['Mis on nõustaja sõnul kõige levinum viga, mida täiskasvanud õppijad töö kõrvalt teevad?', 'ta teeb alguses liiga suure plaani', 'ta teeb alguses liiga väikese plaani', 'ta valib liiga kalli kursuse'],
        ['Miks aitab õhtune keelekursus nõustaja sõnul paremini meelde jätta kui nädalavahetuse kursus?', 'tunnid on lühemad ja neid on nädalas sagedamini', 'õhtul on inimene pärast tööd kõige värskem', 'õhtusel kursusel on vähem õppijaid ja rohkem aega'],
        ['Mis on nõustaja arvates nädalavahetuse kursuse kõige suurem puudus võrreldes õhtuse kursusega?', 'pika nädala jooksul ununeb tundide vahel palju', 'nädalavahetusel on inimene alati väsinud', 'laupäevased tunnid on liiga lühikesed'],
        ['Kuidas tasub nõustaja arvates uusi sõnu ja grammatikat korrata, et need ei ununeks?', 'lühidalt ja tihti, nii et ennast ise kontrollid', 'kord nädalas kaks tundi järjest pühapäeval', 'õpikut ja vanu tekste mitu korda läbi lugedes'],
        ['Millal toetab tööandja nõustaja sõnul töötaja õppimist kõige meelsamini ja kõige paremini?', 'kui töötaja oskab selgitada, kuidas uus oskus tööd aitab', 'kui töötaja õpib ainult tööajal ja kontoris', 'kui kursus on töötajale täiesti tasuta'],
        ['Mida soovitab nõustaja teha siis, kui õppimise plaan haiguse või kiire kuu tõttu ei tööta?', 'plaani muuta, aga mitte õppimisest loobuda', 'kursus pooleli jätta ja puhata', 'oodata uue plaaniga järgmise aastani'],
      ]), 'Enne vestlust juhiga tahad teada, mida asjatundja õppimise aja kohta soovitab. Kuula raadiosaadet, et sinu plaan oleks realistlik.'), { voice: 'interview', task: 'L02' }), 4, 12),
      station(B.text('004_p_offer', 'Ema küsib pere vestluses', 'Keelekool Sõna pakub kahte B2-kursust. Õhtukursus toimub argipäeva õhtul, teisipäeviti ja neljapäeviti kell 17.30–19, kestab 12 nädalat ja maksab 480 eurot. Laupäevane kursus toimub laupäeviti kella kümnest kahani, kestab 10 nädalat ja maksab 420 eurot.\n\nHelgi kirjutab pere vestlusesse: „Sofia, kas sa oled juba kursuse valinud? Mina olen õpetaja ja tean, et lühike tund mitu korda nädalas on kasulikum kui üks pikk tund. Aga hommikuti oled sa alati rõõmsam kui õhtuti. Kumma sa valid ja miks?”'), 5, 12),
      tag(purpose(B.writing('004_p_reply', 'Vastus emale pere vestluses.', 'Vasta Helgile 5–6 lausega: võrdle kahte kursust vähemalt kolmes punktis (aeg, hind, väsimus) ja ütle, kumma sa valiksid.', [5, 6], ['kui', 'kõige', 'võrreldes', 'erinevalt'], 2, 'g_notice'), 'Helgi muretseb ja tahab teada, millise kursuse sa valid. Vasta talle pere vestluses nii, et ta näeb, et otsus on läbi mõeldud.'), { task: 'W08', level: 3 }),
    ],
    transfer: [
      station(B.text('004_t_sit', 'Õppeplaani vestlus Liisiga', 'Reedel kell kolm on Sofial vestlus Liisiga. Eha kinnitas, et firma maksab kursuse eest 80 protsenti. Tartu lao projekt algab jaanuaris ja märtsis on esimesed läbirääkimised linnavalitsusega. Tööajal võib õppida kaks tundi nädalas. Liis tahab teada, millise kursuse Sofia valib, millal ta õpib ja kuidas tulemust kontrollitakse. Vestluse lõpus panevad nad kokkuleppe kolme reaga kirja: eesmärk, ajakava ja kontroll. Enne projektijuhi tööd tahab Sofia esitada Liisile ka ühe palve. Sinu ülesanne on sama: lepi oma õppeplaan juhiga kokku.'), 6, 15, { final: 'negotiate' }),
      B.know('004_t_know', ['Õppimiseks ei pea alati puhkust kulutama. Eesti seaduse järgi võib töötaja koolituses osalemiseks saada tööandjalt õppepuhkust 30 kalendripäeva aastas.', 'Kui koolitus on tasemeõpe (näiteks kutsekool või ülikool) või tööga seotud enesetäiendamine, maksab tööandja 20 kalendripäeva eest keskmist töötasu. Huvikoolituse puhul seda kohustust ei ole.'], 'Euroopa Komisjon, Eurydice „Eesti: täiskasvanuharidus” (Eurypedia, 8. peatükk); täiskasvanute koolituse seadus (Riigi Teataja)', 'Kas teadsid? Õppepuhkus'),
      teach(tag(purpose(B.rolecards('004_t_talk', 'Õppeplaani vestlus.', 'Õpetaja on juht Liis. Mida ja kuidas öelda, otsusta ise. Lõpus sõnastage kokkulepe kolme reaga.',
        'Olukord: sul on kaks kursusevarianti (õhtune või laupäevane), kiire töö ja väsitavad argipäeva õhtud.\nSinu eesmärk: leppida juhiga kokku õppeplaan, mida suudad kolm kuud järgida: mis kursus, millal, kui tihti ja kuidas tulemust kontrollitakse.\nPiirang: sa ei taha kaotada kõiki laupäevi, sest nädalavahetusel käid ema juures Tartus.',
        'Liisi kaart on õpetajal: tal on oma tingimused. Kuula, võrdle ja leia kompromiss.',
        ['Võrreldes õhtukursusega…', 'Erinevalt laupäevasest kursusest…', 'Kas oleks võimalik…?', 'Minu eesmärk on…'], ['Miks just see variant?', 'Kuidas me teame, et…?', 'Lepime kokku, et…']), 'Liis tahab enne projekti algust teada, kuidas sa B2-tasemeni jõuad. Tulemus: üks õppeplaan, mida juht toetab ja mida sa jaksad kolm kuud järgida.'), { task: 'S17', main: true }),
      'Üks-ühele, õpetaja kaart (Liis). Liis eelistab plaani, mis arvestab õppija tugevusi ja nõrkusi. Varjatud info: pärast tiimipäeva on neljapäeva pärastlõunal vähem koosolekuid, seal sobivad kaks tööaja tundi; jaanuarist peab Sofia teisipäeviti Tartus olema; Liis tahab, et Sofia teeks veebruaris B2 proovieksami, sest märtsis algavad läbirääkimised. Takistused (ükshaaval, oota reaktsiooni): 1) „Teisipäeviti oled jaanuarist Tartus — kuidas sa õhtukursusele jõuad?”; 2) „Laupäevane kursus on odavam, aga kas sa jaksad nädalavahetusel neli tundi järjest?”; 3) „Kuidas ma tean, et sa märtsiks valmis oled?” Õnnestunud, kui: on kokku lepitud kursus (või kombinatsioon, näiteks laupäevane kursus ja neljapäeva pärastlõunal iseseisev kordamine), ajakava ja kontroll (proovieksam veebruaris, kokkuvõte iga kolme kuu tagant); õpilane võrdleb vähemalt kolmes punktis (… kui, võrreldes …-ga, kõige) ja sõnastab kokkuleppe kolme reaga.'),
    ],
  },

  'b1b2-005': {
    title: 'Kontroll 1 — igapäevaelu',
    assessment: true,
    canDo: 'Ma lahendan eksami vormis lugemis- ja kuulamisülesandeid, kirjutan umbes 140-sõnalise kirja ja 180-sõnalise arutluse ning esinen koosolekul 1 minuti.',
    discover: [
      B.text('005_d_intro', 'Kordamine enne kontrolli', 'See leht kordab tunde 1–4: sidusus, aeg ja sagedus, sõnajärg, võrdlemine. Tee kõik ülesanded ilma abita ja märgi kahtlased kohad.'),
      B.vocab('005_d_vocab', 'Mooduli 1 põhisõnad', ['kõigepealt — сначала', 'seejärel — затем', 'kuigi — хотя', 'kuna — так как', 'võrreldes — по сравнению', 'samas — однако, в то же время', 'seetõttu — поэтому', 'korda nädalas — раз в неделю', 'aeg-ajalt — время от времени', 'pingeline — напряжённый'], '2'),
      B.reading('005_d_read', 'Lugemisosa.', 'Loe tekst ja vasta. Mõned küsimused nõuavad järeldust.', 'Aeglane elu linnas',
        'Viimastel aastatel räägitakse üha sagedamini aeglasest elust. Selle liikumise mõte on lihtne: me ei pea kogu aeg kiirustama. Aeglase elu pooldajad soovitavad teha korraga ainult üht asja, süüa rahulikult laua taga ja veeta rohkem aega looduses. Tallinnas elav Anneli otsustas proovida aeglast elu terve kuu. Kõigepealt kustutas ta telefonist sotsiaalmeedia rakendused. Seejärel hakkas ta tööle sõitma jalgrattaga, kuigi see võttis bussiga võrreldes kümme minutit kauem aega. Õhtuti ei vaadanud ta enam telerit, vaid luges raamatuid või kohtus sõpradega.\n\nEsimene nädal oli raske. Anneli tundis, et jääb millestki ilma, ja haaras harjumusest pidevalt telefoni järele. Teisel nädalal muutus olukord paremaks. Ta märkas, et magab sügavamalt ja ärkab puhanumana. Tööl suutis ta paremini keskenduda, sest ei vaadanud iga paari minuti tagant teateid. Kuu lõpuks oli Anneli lugenud viis raamatut, kuigi varem luges ta aastas vaid kaks-kolm.\n\nSamas ütleb Anneli, et kõike ta ei jätka. Sotsiaalmeedia on talle vajalik tööks ja sõpradega suhtlemiseks. Nüüd kasutab ta seda aga ainult kaks korda päevas kindlal ajal. Jalgrattaga sõidab ta edasi, välja arvatud vihmaste päevadel. Anneli arvates ei tähenda aeglane elu vähem tööd, vaid teadlikumaid valikuid. Tema eeskujul proovis aeglast elu ka kaks kolleegi. Üks neist loobus juba teisel päeval, teine aga jätkab siiani ja on sellega väga rahul.\n\nPsühholoogid kiidavad selliseid katseid, kuid hoiatavad liiga suurte lubaduste eest. Kui inimene muudab korraga kõike, väsib ta kiiresti ja loobub. Palju targem on alustada ühest väikesest harjumusest, näiteks õhtusest jalutuskäigust ilma telefonita, ja lisada uusi alles siis, kui esimene on muutunud loomulikuks. Nii jääb muutus püsima ka pärast katse lõppu.',
        [['Mis on aeglase elu põhimõte?', 'me ei pea kogu aeg kiirustama'], ['Mida tegi Anneli kõigepealt?', 'kustutas sotsiaalmeedia rakendused'], ['Miks oli esimene nädal raske?', 'tundis, et jääb millestki ilma'], ['Mis muutus teisel nädalal?', 'magas sügavamalt, keskendus paremini'], ['Mitu raamatut luges ta kuu jooksul?', 'viis|5'], ['Miks ta sotsiaalmeediat täiesti ei jäta?', 'see on vajalik tööks ja suhtlemiseks'], ['Mida tähendab Anneli arvates aeglane elu?', 'teadlikumaid valikuid'], ['Miks hoiatavad psühholoogid liiga suurte lubaduste eest?', 'inimene väsib kiiresti ja loobub|kui muuta kõike korraga, ei jaksa']]),
      B.gaps('005_d_gram', 'Kümme grammatikapunkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', ['Eile [sõitsin] (sõitma) tööle rattaga.', 'Ma käin [kaks korda] (kaks kord) nädalas ujumas.', '[Laupäeviti] (laupäev) magan kauem.', 'Ma olen Tallinnas elanud [viis aastat] (viis aasta).', 'Rattaga võtab tee [kauem] (kaua) aega.', 'See oli kuu [kõige raskem] (raske) nädal.', 'Ta ütles, et [loeb] (lugema) nüüd rohkem.', 'Võrreldes [bussiga] (buss) on ratas tervislikum.', 'Kui mul oleks aega, [loeksin] (lugema) rohkem.', 'Telefoni [kasutatakse] (kasutama) liiga palju.']),
      B.wordorder('005_d_order', 'Sõnajärg.', 'Pane laused kokku.', ['Õhtuti loeb Anneli nüüd raamatuid.', 'Esimesel nädalal haaras ta sageli telefoni järele.', 'Kuu lõpuks oli ta lugenud viis raamatut.', 'Vihmastel päevadel sõidab ta bussiga.', 'Nüüd kasutab ta sotsiaalmeediat kaks korda päevas.', 'Kuigi esimene nädal oli raske, ei andnud ta alla.', 'Võrreldes eelmise kuuga magab Anneli nüüd paremini.', 'Hommikuti joob ta kohvi ilma telefonita.', 'Nädalavahetusel käib ta perega metsas jalutamas.', 'Seetõttu on tal rohkem aega iseendale.']),
      B.translation('005_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta loomulik eestikeelne lause.', ['Сначала она удалила приложения.', 'Хотя первая неделя была трудной, она не сдалась.', 'По сравнению с автобусом велосипед медленнее.', 'Теперь она пользуется соцсетями два раза в день.', 'Если бы у меня было время, я бы читал больше.', 'По выходным она гуляет в лесу.', 'Самое трудное — не брать телефон по утрам.', 'Так как она ездит на велосипеде, она реже болеет.', 'Через месяц она прочитала пять книг.', 'Медленная жизнь означает осознанный выбор.']),
      B.speaking('005_d_mono', 'Monoloog 2–3 minutit.', 'Kas sina tahaksid elada aeglasemalt? Räägi ilma tekstita.', ['Milline on sinu elutempo praegu?', 'Mida muudaksid ja miks?', 'Mis takistab?'], [120, 180]),
      B.writing('005_d_write', 'Kordamise tekst.', 'Kirjuta 6–8 lauset: üks kuu ilma millegita (telefon, auto, kohv…). Mis muutuks?', [6, 8], ['kõigepealt', 'kuigi', 'võrreldes', 'seetõttu'], 3),
      B.errorfix('005_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Kuigi oli raske, aga ta jätkas.', 'Kuigi oli raske, jätkas ta. | Kuigi oli raske, ta jätkas.'], ['Ta sõidab rattaga kolm korda nädalal.', 'Ta sõidab rattaga kolm korda nädalas.'], ['Võrreldes buss on ratas aeglasem.', 'Võrreldes bussiga on ratas aeglasem.'], ['Õhtuti loeb ta raamatud.', 'Õhtuti loeb ta raamatuid.'], ['See oli kõige raskem nädal kuus.', 'See oli kuu kõige raskem nädal.'], ['Kuu lõpuks ta oli lugenud viis raamatut.', 'Kuu lõpuks oli ta lugenud viis raamatut.'], ['Ta kustutas telefonist kõik rakendusi.', 'Ta kustutas telefonist kõik rakendused.'], ['Vihmasel päeval ta sõidab bussiga tööle.', 'Vihmasel päeval sõidab ta bussiga tööle.'], ['Nüüd ta kasutab sotsiaalmeedia ainult õhtul.', 'Nüüd kasutab ta sotsiaalmeediat ainult õhtul.'], ['Aeglane elu tähendab teadlikud valikud.', 'Aeglane elu tähendab teadlikke valikuid.']]),
    ],
    // Harno format check, reading and listening (owner 2026-10-13): a long article with 4-option questions and
    // statements ↔ paragraphs, an option cloze, a sentence bank with one extra, short notices and a radio interview
    practice: [
      B.tip('005_p_how', 'Kontrolltöö: lugemine ja kuulamine (eksami vormis)', 'See leht on nagu Harno eksami lugemise ja kuulamise osa. Lugemises on neli osa, kuulamises kolm. Teateid loeb õpetaja üks kord, intervjuud kaks korda. Tee kõik ilma sõnaraamatuta.', 'full'),
      B.reading('005_p_read', 'Lugemine 1: artikkel.', 'Loe arvamusartiklit. Vasta kahele küsimusele, siis tee osad 1 ja 2.', 'Ajapuudus – meie aja haigus?', [
        '(A) Kui küsida inimestelt, mis on nende igapäevaelu suurim mure, vastavad paljud lühidalt: aega ei ole. Kuhu see aeg siis kaob? Statistikaamet uurib seda iga kümne aasta tagant. Viimases ajakasutuse uuringus aastatel 2019–2021 pidasid tuhanded inimesed päevikut, kuhu nad märkisid kõik oma tegevused. Uuringu järgi kulub tasulisele tööle keskmiselt 3,3 tundi ööpäevas. See arv tundub väike, kuid selles on arvestatud kõiki päevi ja kõiki inimesi alates kümnendast eluaastast, ka õpilasi, pensionäre, nädalavahetusi ja puhkusi. Täiskohaga töötaja tööpäev on muidugi palju pikem. Kui lisada sellele veel sõit, kodutööd ja uni, ei jää vaba aega kuigi palju. Seepärast ei tasu keskmist arvu oma nädalaga otse võrrelda: see näitab pigem, kuidas muutub kogu ühiskond, kui seda, kuidas elab üks konkreetne inimene.',
        '(B) Huvitav on see, et kodus kulub meil praegu vähem aega kui varem. Kakskümmend aastat tagasi valmistasid naised süüa keskmiselt 95 minutit päevas, nüüd 57 minutit. Riiete pesemisele ja triikimisele kulus neil toona 32 minutit päevas, nüüd vaid 7. Abiks on olnud poolvalmistoidud, toidukullerid ja kodutehnika. Ka vaba aega on kahekümne aastaga juurde tulnud. Probleem ei ole seega ainult aja hulgas, vaid selles, kuidas me oma aega kasutame ja tajume.',
        '(C) Üks põhjus on ekraanid. Ameerika teadlane Gloria Mark on üle kahekümne aasta mõõtnud, kui kaua inimesed ühele aknale või rakendusele keskenduvad. 2004. aastal oli see keskmiselt kaks ja pool minutit, viimastel aastatel aga vähem kui minut. Iga hüpe võtab vaid hetke, kuid päeva peale kogunevad need tundideks. Paljud ei märkagi seda, sest telefon on alati käepärast. Õhtul tundub, et vaba aega ei olnudki, sest see kadus märkamatult väikeste tükkidena.',
        '(D) Teine põhjus on see, et me tahame liiga palju korraga. Lapsed käivad kolmes trennis, täiskasvanud õpivad keeli ja jõusaalis tuleb käia vähemalt kolm korda nädalas. Paljud planeerivad oma nädalavahetuse sama tihedaks kui tööpäeva: laupäeva hommikul turg, päeval remont, õhtul külalised. Nii muutub puhkus järjekordseks ülesandeks, mille saab nimekirjast maha tõmmata. Ka lastel on nädal sageli nii täis, et nad ei teagi enam, mis tunne on igavleda. Huvitav on see, et keegi ei plaani seda meelega. Iga trenn, kursus ja kohtumine tundub eraldi võttes mõistlik ja kasulik. Alles nädala lõpus selgub, et kõik need head asjad kokku ei jäta enam ruumi ei puhkusele ega ootamatustele.',
        '(E) Mida siis teha? Minu arvates tasub alustada väikestest muudatustest. Esiteks võiks iga nädal jätta ühe õhtu täiesti tühjaks. Teiseks tasub telefon õhtul teise tuppa jätta. Kolmandaks on kasulik paar korda aastas üle vaadata, millised kohustused on päriselt olulised ja millest võiks loobuda. Töökohtades võiks kokku leppida, et õhtul saadetud kiri võib oodata hommikuni. Seadus on siin töötaja poolel: töölepingu seaduse järgi peab töötajal jääma iga 24 tunni jooksul vähemalt 11 tundi järjestikust puhkeaega.',
        '(F) Aeglasem elu ei tähenda laiskust. Vastupidi, puhanud inimene teeb tööl vähem vigu ja suudab paremini keskenduda. Uneeksperdid soovitavad täiskasvanule 7–9 tundi und ning ajakasutuse uuringu järgi tuleb see aeg Eesti inimestel keskmiselt täis. Puhkus ei ole tasu, mille peab enne välja teenima, vaid töö ja elu loomulik osa, nagu toit või uni. Kõige raskem on minu kogemuse järgi esimene samm: lubada endale, et mõnikord ei pea midagi tegema. Ajapuudus ei ole haigus, mis tuleb väljastpoolt. Suure osa sellest loome ise ja seepärast saame selle ka ise ravida.',
        'Allikas: Statistikaamet, ajakasutuse uuring 2019–2021 (ajakasutuse leht; „Mehe kodu on maailm, naise maailm on kodu?”, 20.12.2022; „Andmed paljastavad. Suur ülevaade Eesti inimeste tervislikust ajakasutusest”, 17.01.2023); G. Mark, „Attention Span” (2023); töölepingu seadus, § 51 (Riigi Teataja).',
      ].join('\n\n'), [['Miks kulub kodutöödele praegu vähem aega kui varem?', 'poolvalmistoidud, toidukullerid ja kodutehnika|tänu poolvalmistoitudele, kulleritele ja tehnikale'], ['Kuidas mõjub puhkus autori sõnul tööle?', 'vähem vigu|keskendub paremini|töö läheb paremini'], ['Mida sina arvad: milline autori nõuanne sobiks sulle? Miks?']]),
      B.choice('005_p_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali artikli põhjal õige vastus.', [
        ['Mis on artikli järgi paljude inimeste suurim mure?', 'et neil ei jätku aega', 'et töönädal on liiga pikk', 'et poodides on pikad järjekorrad', 'et lapsed käivad liiga paljudes trennides'],
        ['Mida näitab ajakasutuse uuring kodutööde kohta?', 'Neile kulub vähem aega kui kakskümmend aastat tagasi.', 'Neile kulub rohkem aega kui kakskümmend aastat tagasi.', 'Kodutööde aeg ei ole kahekümne aastaga muutunud.', 'Kodutöid teevad nüüd peamiselt mehed.'],
        ['Miks tundub ekraani kasutajale õhtul, et vaba aega ei olnud?', 'Lühikesed hetked ekraani ees kogunevad tundideks.', 'Ta peab õhtul töökirjadele vastama.', 'Iga rakendus võtab umbes tunni.', 'Ta kasutab ekraane ainult õhtuti.'],
        ['Mida tähendab lause „Puhkus muutub järjekordseks ülesandeks”?', 'Ka vaba aeg planeeritakse liiga täis.', 'Inimesed töötavad ka puhkuse ajal.', 'Puhkusel tuleb teha palju kodutöid.', 'Puhkus tundub inimestele liiga igav.'],
        ['Milline järgmistest EI OLE autori soovitus?', 'loobuda trennidest täielikult', 'jätta üks õhtu nädalas tühjaks', 'jätta telefon õhtul teise tuppa', 'vaadata kohustused aeg-ajalt üle'],
        ['Mis on artikli peamine mõte?', 'Ajapuudus sõltub sellest, kuidas me aega kasutame.', 'Eesti inimesed töötavad teistest rohkem.', 'Telefoni ei tohiks üldse kasutada.', 'Laiskus on tänapäeval suur probleem.'],
      ], 'full', 'g_read'),
      B.table('005_p_para', 'Osa 2: väide ja lõik (8 punkti).', 'Loe väiteid 1–8. Kirjuta, millises artikli lõigus (A–F) see mõte on. Ühte lõiku võib sobida kaks väidet.', 'Väide, Lõik', [
        '1. Varem võttis igapäevane majapidamine rohkem aega. | [B]',
        '2. Vaba aeg kaob väikeste tükkidena. | [C]',
        '3. Puhanud töötaja teeb oma tööd paremini. | [F]',
        '4. Uuringu keskmine tööaeg on lühike, sest arvestatud on kõiki päevi ja inimesi. | [A]',
        '5. Inimesed tahavad vabal ajal liiga palju jõuda. | [D]',
        '6. Muutusi tasub alustada väikestest sammudest. | [E]',
        '7. Kõige raskem on lubada endale tegevusetust. | [F]',
        '8. Tihe graafik on ka lastel. | [D]',
      ], 'g_read'),
      B.cloze('005_p_cloze', 'Osa 3: vali lünka sobiv vorm (9 punkti).', 'Igas lüngas on neli valikut. Vali õige.', 'Minu uus hommik', [
        'Veel aasta tagasi algas minu hommik alati ühtemoodi. Äratuskell helises {*kell kuus|kell kuuel|kella kuus|kuus kell} ja ma haarasin kohe telefoni. Enne kui ma {*jõudsin|jõuan|jõudma|jõudnud} hambad pesta, olin lugenud kõik uudised. Tööle jõudsin tavaliselt väsinuna, {*kuigi|sest|nii et|kuna} olin maganud kaheksa tundi.',
        'Ühel päeval otsustasin midagi muuta. Nüüd jätan telefoni õhtul {*kööki|köögis|köögist|köök} ja loen enne magamaminekut raamatut. Hommikuti käin {*kaks korda|kaks kord|kahte korda|kahe korra} nädalas jooksmas. Tööle sõidan {*rattaga|ratas|rattas|rattale}, kui ilm lubab.',
        'Võrreldes eelmise aastaga olen palju {*rahulikum|rahulik|rahulikem|kõige rahulikum}. {*Esmaspäeviti|Esmaspäev|Esmaspäeva|Esmaspäevani} on mul endiselt kiire, aga isegi siis leian hommikul viisteist minutit kohvi jaoks. Kolleeg ütles hiljuti, et ma näen nüüd {*värskem|värske|värskeim|värskemalt} välja kui varem.',
      ].join('\n\n')),
      B.gaps('005_p_bank', 'Osa 4: vali lause (6 punkti).', 'Vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Uus kolleeg Marek tuli meie meeskonda kevadel. [Esimestel nädalatel jäi ta iga päev tööle hiljaks.]',
        'Ta elas linnast väljas ja sõitis bussiga, mis oli tihti täis. [Ühel hommikul rääkis ta oma murest juhile.]',
        'Juht ei olnud vihane. [Ta pakkus Marekule paindlikku tööaega.]',
        'Nüüd alustab Marek tööd kell kümme ja lõpetab kell kuus. [Nii väldib ta hommikust tipptundi.]',
        'Kaks päeva nädalas töötab ta kodus. [Neil päevadel jõuab ta ka lapsega trenni minna.]',
        'Marek ütleb, et tema töö on nüüd parem kui varem. [Ta ei pea enam kiirustama ja teeb vähem vigu.]',
      ], ['Esimestel nädalatel jäi ta iga päev tööle hiljaks.', 'Ühel hommikul rääkis ta oma murest juhile.', 'Ta pakkus Marekule paindlikku tööaega.', 'Nii väldib ta hommikust tipptundi.', 'Neil päevadel jõuab ta ka lapsega trenni minna.', 'Ta ei pea enam kiirustama ja teeb vähem vigu.', 'Seepärast otsustas ta töölt lahkuda.'], 'full', 'g_read'),
      B.errorfix('005_p_fix', 'Leia ja paranda viga.', 'Kirjuta lause õigesti.', [['Pärast ujumist ma joon alati kuuma tee.', 'Pärast ujumist ma joon alati kuuma teed. | Pärast ujumist joon ma alati kuuma teed.'], ['Ma käin kolm korda nädalal ujumas.', 'Ma käin kolm korda nädalas ujumas.'], ['Laupäev on rohkem rahulik kui reede.', 'Laupäev on rahulikum kui reede.'], ['Kuigi sadas vihma, aga ma läksin jalgsi.', 'Kuigi sadas vihma, läksin jalgsi. | Kuigi sadas vihma, läksin ma jalgsi. | Kuigi sadas vihma, ma läksin jalgsi.'], ['Ma olen siin elanud kaks aastat tagasi.', 'Ma olen siin elanud kaks aastat. | Ma olen siin elanud juba kaks aastat.'], ['Võrreldes minu vend olen ma pikem.', 'Võrreldes oma vennaga olen ma pikem. | Võrreldes minu vennaga olen ma pikem.'], ['Me kohtume aeg-ajalt kohvikus nädalavahetusel ja räägime palju.', 'Me kohtume nädalavahetusel aeg-ajalt kohvikus ja räägime palju. | Aeg-ajalt kohtume me nädalavahetusel kohvikus ja räägime palju.'], ['Kuna rong hilines, ma jäin koosolekule hiljaks.', 'Kuna rong hilines, jäin ma koosolekule hiljaks. | Kuna rong hilines, jäin koosolekule hiljaks.'], ['See on minu kõige lemmik päev.', 'See on minu lemmikpäev. | See on minu kõige armsam päev.'], ['Ta töötab rohkem tunde kui mina töötan nädalas.', 'Ta töötab nädalas rohkem tunde kui mina.']]),
      B.transformation('005_p_trans', 'Teisenda.', 'Kirjuta lause antud sõnaga.', [['Ma olin väsinud. Ma läksin trenni.', 'kuigi', 'Kuigi olin väsinud, läksin trenni. | Kuigi ma olin väsinud, läksin trenni. | Kuigi ma olin väsinud, läksin ma trenni.'], ['Buss ei sõitnud. Ma võtsin takso.', 'kuna', 'Kuna buss ei sõitnud, võtsin takso.'], ['Tööpäev on pingeline. Pühapäev on rahulik.', 'samas', 'Tööpäev on pingeline, samas pühapäev on rahulik.'], ['Ma ujun esmaspäeval ja neljapäeval.', 'korda nädalas', 'Ma ujun kaks korda nädalas.'], ['Ratas on aeglasem. Buss on kiirem.', 'võrreldes', 'Võrreldes bussiga on ratas aeglasem.'], ['Ma lõpetan töö. Ma lähen jooksma.', 'kõigepealt … seejärel', 'Kõigepealt lõpetan töö, seejärel lähen jooksma. | Kõigepealt lõpetan ma töö, seejärel lähen jooksma.'], ['Ma loen raamatut.', 'alusta: Õhtuti', 'Õhtuti loen raamatut. | Õhtuti loen ma raamatut.'], ['Päev oli pikk. Ma olin rahul.', 'kuigi', 'Kuigi päev oli pikk, olin rahul. | Kuigi päev oli pikk, olin ma rahul.'], ['Tööpäevad on pingelised. Nädalavahetus on rahulik.', 'keskvõrre + kui', 'Nädalavahetus on rahulikum kui tööpäevad.'], ['Rong hilines. Ma jäin hiljaks.', 'seetõttu', 'Rong hilines, seetõttu jäin hiljaks. | Rong hilines, seetõttu jäin ma hiljaks.']]),
      B.listening('005_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Õpetaja loeb iga teate üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Head reisijad! Homsest sõidab buss number kaheksa hommikuti iga kümne minuti järel, mitte enam iga veerand tunni järel.',
        '2. Tere, siin hambaarst Mets. Teie aeg on homme kell üheksa, aga palun tulge kümme minutit varem, et täita ankeet.',
        '3. Spordiklubi teatab: laupäevane joogatund jääb ära, sest treener on haige. Pühapäeval toimub tund tavapäraselt.',
        '4. Tähelepanu! Raamatukogu on remondi tõttu kogu järgmise nädala suletud. Raamatuid saab tagastada maja ees olevasse kasti.',
      ], [
        'Buss number kaheksa sõidab hommikuti iga [kümne minuti|10 minuti] järel.',
        'Hambaarsti juurde tuleks tulla kümme minutit [varem].',
        'Enne vastuvõttu tuleb täita [ankeet|ankeeti].',
        'Laupäevane joogatund jääb ära, sest treener on [haige].',
        'Raamatukogu on järgmisel nädalal suletud [remondi] tõttu.',
        'Raamatuid saab tagastada maja ees olevasse [kasti].',
      ]),
      B.listening('005_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Õpetaja loeb intervjuu kaks korda. Kirjuta lünka 1–2 sõna. Allikas: Statistikaamet, „Andmed paljastavad. Suur ülevaade Eesti inimeste tervislikust ajakasutusest” (17.01.2023).', [
        'Saatejuht: Tere, kuulajad! Täna räägime unest. Stuudios on unearst Merike Kask. Merike, kui palju me tegelikult magame?',
        'Merike: Statistikaameti ajakasutuse uuringu järgi magavad kahekümne viie kuni kuuekümne nelja aastased keskmiselt umbes kaheksa ja pool tundi ööpäevas. Selles on ka uinumise aeg ja päevased uinakud. Uneeksperdid soovitavad täiskasvanule seitse kuni üheksa tundi, nii et keskmiselt on meil magamisega üsna hästi.',
        'Saatejuht: Ja nädalavahetusel?',
        'Merike: Nädalavahetusel aga rütm muutub. Pühapäeviti magatakse uuringu järgi keskmiselt tund ja kümme minutit kauem kui tööpäevadel. Paljud arvavad, et nii saab une tagasi teha, aga see ei ole päris nii. Kui laupäeval ärkad kell kümme, on pühapäeva õhtul raske magama jääda ja esmaspäev algab jälle väsinult.',
        'Saatejuht: Mis on kõige suurem unevaras?',
        'Merike: Kindlasti ekraanid. Telefoni sinine valgus ütleb ajule, et on veel päev. Soovitan panna telefoni käest vähemalt tund aega enne magamaminekut. Ka õhtune töö arvutis on probleem, sest aju ei saa puhata.',
        'Saatejuht: Kas lõunauinak on hea mõte?',
        'Merike: Lühike uinak, umbes kakskümmend minutit, on täiesti normaalne. Pikem uinak võib aga öist und segada.',
        'Saatejuht: Kas kohv on ka probleem?',
        'Merike: Hommikune kohv ei ole. Aga pärast kella kolme tasub kohvi asemel juua vett või taimeteed, sest kofeiin mõjub kehas veel mitu tundi.',
        'Saatejuht: Mida soovitate inimestele, kes töötavad vahetustega?',
        'Merike: Neil on kõige raskem. Oluline on, et magamistuba oleks pime ja vaikne. Pärast öövahetust aitab ka see, kui koduteel kanda päikeseprille. Kui võimalik, ei tohiks vahetused muutuda iga nädal.',
        'Saatejuht: Ja lõpuks üks lihtne nõuanne kõigile?',
        'Merike: Minge magama ja ärgake iga päev samal ajal, ka nädalavahetusel. Juba kahe nädalaga on vahe tunda.',
        'Saatejuht: Suur aitäh, Merike! Järgmisel nädalal räägime sellest, kuidas toit und mõjutab.',
      ], [
        'Saate külaline on [unearst|arst].',
        'Keskmiselt on Eesti inimestel magamisega arsti sõnul üsna [hästi].',
        'Pühapäeviti magatakse keskmiselt tund ja [kümme minutit|10 minutit] kauem kui tööpäevadel.',
        'Pärast pikka und laupäeval on pühapäeva õhtul raske [magama jääda|uinuda].',
        'Kõige suurem unevaras on arsti arvates [ekraanid|telefon].',
        'Telefon tuleks käest panna vähemalt [tund aega|tund] enne magamaminekut.',
        'Pärast kella kolme võiks kohvi asemel juua [vett|taimeteed].',
        'Kofeiin mõjub kehas veel [mitu tundi].',
        'Vahetustega töötaja magamistuba peaks olema pime ja [vaikne].',
      ]),
      B.truefalse('005_p_tf', 'Kuulamine 3: õige või vale? (10 punkti)', 'Õpetaja loeb intervjuu veel kord. Märgi, kas väide on õige või vale.', [
        ['Soovituslik uneaeg on seitse kuni üheksa tundi.', true], ['Nädalavahetusel saab arsti sõnul une täiesti tagasi teha.', false],
        ['Pikk uni laupäeval võib muuta esmaspäeva raskeks.', true], ['Hommikune kohv segab arsti arvates und.', false],
        ['Telefoni valgus paneb aju arvama, et on päev.', true], ['Vahetustega töötajatel on uneprobleeme vähem kui teistel.', false],
        ['Arst soovitab nädalavahetusel ärgata hiljem kui tööpäeval.', false], ['Järgmine saade räägib toidu mõjust unele.', true],
        ['Kofeiini mõju kestab mitu tundi.', true], ['Arsti meelest aitab une heaks ka kohv enne magamaminekut.', false],
      ], 'full'),
      B.examiner('005_p_say', 'minu igapäevaelu, ajakasutus ja keeled', ['Milline on sinu tavaline tööpäev või koolipäev?', 'Mis võtab sinu nädalas kõige rohkem aega ja miks?', 'Kuidas jagatakse kodutöid sinu peres?', 'Mitut keelt sa igapäevaelus kasutad ja kus?', 'Kas töökirjadele peaks vastama ka õhtul ja nädalavahetusel?', 'Kumb on sinu arvates parem: viis lühemat või neli pikemat tööpäeva nädalas?', 'Kuidas erineb elurütm Eestis ja sinu kodumaal?'], 'B2', [60, 180]),
    ],
    // Harno format check, writing and speaking: a semi-formal letter of ~140 words, an argument of ~180 words with
    // pros and cons, a 1-minute speech at a meeting after 2 minutes' preparation and a discussion with argument cards
    transfer: [
      B.text('005_t_situation', 'Lõpuülesanne (eksami vormis)', 'See leht on nagu Harno eksami kirjutamise ja rääkimise osa. Kohalik raadio teeb saadet „Kuidas me elame?”. Sa kirjutad raadiole, arutled ja esined.'),
      B.reading('005_t_read', 'Loe raadio kutset.', 'Loe ja vasta.', 'Raadio otsib saatekülalisi',
        'Raadio Kodu otsib järgmisesse saatesse kolme inimest, kes on valmis rääkima oma igapäevaelust. Saate teema on „Kuidas me elame 2026. aastal?”. Meid huvitab, milline on teie tavaline nädal, kuidas veedate nädalavahetusi ja mis on viimastel aastatel teie elus muutunud. Eriti ootame inimesi, kes on hiljuti kolinud, vahetanud töökohta või muutnud oma elurütmi.\n\nSaade salvestatakse järgmise kuu esimesel kolmapäeval kell kaksteist meie stuudios Pärnu maanteel. Salvestus kestab umbes nelikümmend minutit ja saade läheb eetrisse sama nädala laupäeval. Kõik saatekülalised saavad tänutäheks kaks kinopiletit. Kui soovite osaleda, kirjutage meile hiljemalt järgmise reede õhtuks. Kirjutage lühidalt, kes te olete, milline on teie elu praegu ja miks olete just teie hea saatekülaline. Valime külalised välja kirjade põhjal ja võtame teiega ühendust telefoni teel. Kui te ei saa stuudiosse tulla, on võimalik anda intervjuu ka telefoni teel.\n\nEelmistes saadetes rääkisid oma elust näiteks noor ema, kes kolis Tartust maale, ja pensionär, kes õppis seitsmekümneaastaselt ujuma. Kuulajad kirjutasid pärast saadet, et just sellised lood annavad julgust ka teistele. Saatejuht ütleb, et kõige huvitavamad on tavalised inimesed, sest nende lugudes tunneb iga kuulaja ennast ära. Seetõttu ei pea te olema kuulus, et saatesse tulla. Piisab sellest, et teil on lugu, mida jagada, ja natuke julgust. Ootame teie kirju!\n\nSaate toimetaja lisab, et kirja võib kirjutada ka lihtsas keeles. Tähtis ei ole täiuslik grammatika, vaid huvitav ja aus lugu. Kui teie emakeel ei ole eesti keel, on see meie jaoks pigem pluss, sest kuulajad tahavad teada, kuidas eri taustaga inimesed Eestis elavad. Kõik kirjad loeb läbi saatejuht ise.',
        [['Miks on saatejuhi arvates tavalised inimesed kõige huvitavamad?', 'nende lugudes tunneb iga kuulaja ennast ära'], ['Mitut inimest raadio otsib?', 'kolme|kolm|3'], ['Keda ootavad nad eriti?', 'inimesi, kes on kolinud, vahetanud tööd või muutnud elurütmi'], ['Millal salvestatakse saade?', 'järgmise kuu esimesel kolmapäeval kell kaksteist'], ['Mida saavad külalised?', 'kaks kinopiletit'], ['Mis on kirja tähtaeg?', 'järgmise reede õhtu'], ['Mida teha, kui ei saa stuudiosse tulla?', 'anda intervjuu telefoni teel']]),
      B.planning('005_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad.', ['Kiri: kes ma olen, mis minu elus muutus, miks see kuulajaid huvitab?', 'Arutlus: kaks argumenti poolt, kaks vastu, näited ja minu seisukoht.']),
      B.letter('005_t_letter', 'Kirjutamine 1: kiri raadiole (umbes 140 sõna).', 'Kirjuta saate toimetajale: kes sa oled, mis sinu igapäevaelus viimasel ajal muutus ja miks see kuulajaid huvitaks.', 'Lugupeetud saate toimetaja!', 'Lugupidamisega', [125, 144]),
      B.letter('005_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta raadio veebilehele arutlus. Too kaks argumenti poolt ja kaks vastu, igaühele näide, ning lõpus oma seisukoht.', 'Kas nutitelefon võtab meie vaba aja?', 'Kokkuvõttes…', [170, 190]),
      B.speaking('005_t_mono', 'Rääkimine 1: sõnavõtt koosolekul (1 minut).', 'Teemakaart: töökohas arutatakse paindlikku tööaega. Mõtle 2 minutit, räägi 1 minut, siis vasta paarilise küsimusele.', ['Milline on praegu töötajate tööaeg?', 'Mis on paindliku tööaja kaks eelist?', 'Mis võib olla probleem?', 'Mida sa ettepanekuna soovitad?'], [90, 120], ['Tahaksin rääkida…', 'Esiteks… teiseks…', 'Seetõttu teen ettepaneku…']),
      B.rolecards('005_t_cards', 'Rääkimine 2: arutelu argumendikaartidega.', 'Öelge kõigepealt oma arvamus. Siis arutage 4 minutit ja leppige kokku ühine seisukoht.',
        'Kaart A (poolt). Teema: kas meie töökohas peaks koosolekul olema telefonid keelatud? Argumendid: koosolekud on lühemad; inimesed kuulavad üksteist; tehakse vähem vigu. Lisa oma näide.', 'Kaart B (vastu). Teema: kas meie töökohas peaks koosolekul olema telefonid keelatud? Argumendid: kiire kõne võib jääda vastamata; täiskasvanuid ei pea kontrollima; telefonis on kalender ja märkmed. Lisa oma näide.',
        ['Minu arvates…', 'Näiteks meie meeskonnas…', 'Ma saan aru, aga…'], ['Ma ei ole päris nõus, sest…', 'Teisalt…', 'Kas võiksime kokku leppida, et…?']),
      B.rubric('005_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: kõik kolm punkti, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Arutlus: poolt ja vastu, näited, oma seisukoht, umbes 180 sõna (15 punkti).', 'Sõnavõtt: selge algus ja lõpp, 1 minut, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin, reageerisin paarilisele, jõudsime kokkuleppele (15 punkti).']),
      B.selfcheck('005_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60% (30 / 50) ja üheski osas mitte 0 punkti.', 'Ma tean, mida järgmises moodulis harjutada.'], 'Moodul 1 tehtud'),
    ],
  },
}, {
  'b1b2-001': 'LUGU R→W', 'b1b2-002': 'KUUL L→W', 'b1b2-003': 'AVAS L→S', 'b1b2-004': 'PROB R→S', 'b1b2-005': 'EKS',
});
