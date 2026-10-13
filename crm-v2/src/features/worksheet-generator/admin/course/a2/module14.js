// A2 course (A1 → A2 roadmap), module 14 „Õppimine, kool ja keel”, stage A2. All five lessons a2-066…a2-070
// (068 tahan / proovin + da, hakkan + ma; 070 the module check in the Harno A2 form). All three phases: Avasta → Harjuta → Kasuta.
// The course and the timetable (kus? kuhu? kust? with study words, esmaspäeviti, kaks korda nädalas), asking for help
// in Estonian (käskiv kõneviis sina / teie, „Kas te saaksite…?”) and a two-week study plan (tahan + da, pean / hakkan
// + ma, frequency markers). Cast: Anna, Viktor, Liis, Markus, Sofia, Jaan.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-14', course: 'a2', title: 'Õppimine, kool ja keel', level: 'A2' };

const TR = (id, rows) => B.translation(id, 'Tõlgi.', 'Kirjuta eesti keeles.', rows);
const D = (id, rows) => B.dictation(id, 'Etteütlus.', 'Kuula ja kirjuta laused.', rows);

export const LESSONS = {
  'a2-066': {
    title: 'Õppimine ja kursus',
    canDo: 'Ma räägin oma eesti keele kursusest vähemalt kuue lausega: kus ja millal on tunnid, mida me teeme ja miks ma õpin.',
    discover: [
      B.text('066_d_situation', 'Uus kursus', 'Anna kolis Tallinna. Ta töötab kontoris ja tahab eesti keelt paremini rääkida. Täna on tema esimene päev keelekursusel. Klassis on kaheksa õpilast. Õpetaja nimi on Liis.'),
      B.truefalse('066_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Anna elab nüüd Tallinnas.', true], ['Anna töötab koolis.', false], ['Täna on Anna esimene tund.', true], ['Klassis on kümme õpilast.', false], ['Õpetaja nimi on Liis.', true],
      ]),
      B.vocab('066_d_vocab', 'Kursuse sõnad', ['kursus — курс', 'tund — урок', 'õpetaja — учитель', 'õpilane — ученик', 'ülesanne — задание', 'kodutöö — домашнее задание', 'test — тест', 'oskus — умение, навык', 'tunniplaan — расписание', 'õpik — учебник', 'harjutama — упражняться', 'kestma — длиться']),
      B.reading('066_d_read', 'Loe: Anna kursus.', 'Loe tekst ja vasta küsimustele.', 'Minu keelekursus',
        'Ma käin eesti keele kursusel kaks korda nädalas. Tunnid on esmaspäeviti ja kolmapäeviti kella kuuest kella poole kaheksani. Kursus toimub keelekoolis kesklinnas. Ma lähen kursusele kohe pärast tööd. Meie õpetaja Liis räägib tunnis ainult eesti keelt. Alguses oli see raske, aga nüüd saan juba palju aru. Tunnis loeme tekste, kuulame dialooge ja räägime paaris. Kodutöö on tavaliselt kirjutada lühike tekst. Iga kuu lõpus on test. Kõige raskem on minu jaoks kuulamine, sest inimesed räägivad kiiresti. Kõige rohkem meeldib mulle rääkimine. Minu pinginaaber on Andrei. Ta on pärit Ukrainast ja töötab laos. Andrei kirjutab väga hästi, aga räägib vähe. Mina räägin palju, aga teen kirjutades vigu. Nii me aitame teineteist. Kursus kestab neli kuud. Ma õpin eesti keelt, sest tahan tööl klientidega eesti keeles rääkida. Pärast tundi joome Andreiga vahel kohvi.',
        [['Mitu korda nädalas on Annal tund?', 'kaks korda|kaks korda nädalas|2 korda'], ['Kui kaua kestab üks tund?', 'poolteist tundi|1,5 tundi|90 minutit'], ['Millal Anna kursusele läheb?', 'pärast tööd|kohe pärast tööd'], ['Mida õpilased tunnis teevad?', 'loevad, kuulavad ja räägivad|loevad tekste, kuulavad dialooge ja räägivad paaris'], ['Miks on kuulamine Annale raske?', 'inimesed räägivad kiiresti'], ['Miks Anna eesti keelt õpib?', 'tahab tööl klientidega eesti keeles rääkida|et tööl klientidega rääkida']]),
      B.table('066_d_find', 'Leia tekstist.', 'Kirjuta tekstist õige vorm.', 'Küsimus, Tekstis', [
        'Kus? (kursus) | [kursusel]', 'Kuhu? (kursus) | [kursusele]', 'Kus? (tund) | [tunnis]', 'Millal? (iga esmaspäev) | [esmaspäeviti]', 'Millal? (pärast + töö) | [pärast tööd]', 'Kui tihti? | [kaks korda nädalas]',
      ], 'g_notice'),
      B.notice('066_d_notice', 'Märka: kus? kuhu? kust?', [
        'Ma käin **kursusel** / **tunnis** / **koolis**. (kus?)', 'Ma lähen **kursusele** / **tundi** / **kooli**. (kuhu?)', 'Ma tulen **kursuselt** / **tunnist** / **koolist**. (kust?)', '**esmaspäeviti** = iga esmaspäev; **kaks korda nädalas**, **kord kuus**',
      ], 'full'),
      B.categorize('066_d_sort', 'Kus, kuhu või kust?', 'Sorteeri vormid.', [
        ['Kus?', ['kursusel', 'tunnis', 'koolis', 'raamatukogus']], ['Kuhu?', ['kursusele', 'tundi', 'kooli', 'raamatukokku']], ['Kust?', ['kursuselt', 'tunnist', 'koolist', 'raamatukogust']],
      ], 'full', 'g_notice'),
      B.match('066_d_match', 'Mis see on?', 'Ühenda sõna ja selgitus.', [
        ['kodutöö', 'ülesanne, mida teed kodus'], ['tunniplaan', 'millal ja kus tunnid on'], ['test', 'kontroll, kas sa oskad'], ['õpik', 'raamat, mida kasutad tunnis'], ['õpetaja', 'inimene, kes õpetab'], ['oskus', 'mida sa juba oskad teha'],
      ]),
      B.gaps('066_d_gaps', 'Minu kursus.', 'Täida lüngad. Kaks sõna jääb üle.', [
        'Ma käin eesti keele [kursusel].', 'Täna lähen ma [tundi] kell kuus.', 'Õpetaja annab meile [kodutöö].', 'Kuu lõpus on [test].', 'Tunnid on [esmaspäeviti] ja kolmapäeviti.', 'Kõige raskem [ülesanne] on kuulamine.',
      ], ['kursusel', 'kursusele', 'tundi', 'tunnis', 'kodutöö', 'test', 'esmaspäeviti', 'ülesanne']),
      B.wordorder('066_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Ma käin kursusel kaks korda nädalas.', 'Pärast tööd lähen ma tundi.', 'Tunnis räägime palju paaris.', 'Iga kuu lõpus on test.', 'Kursus kestab neli kuud.',
      ]),
      B.errorfix('066_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma käin eesti keele kursusele.', 'Ma käin eesti keele kursusel.'], ['Ma õpin eesti keel.', 'Ma õpin eesti keelt.'], ['Mul on tund kaks kord nädalas.', 'Mul on tund kaks korda nädalas.'], ['Ma lähen tunnis kell kuus.', 'Ma lähen tundi kell kuus.'], ['Kõige raske on kuulamine.', 'Kõige raskem on kuulamine.'],
      ]),
      TR('066_d_tr', ['Я хожу на курсы эстонского языка.', 'Уроки по понедельникам и средам.', 'После работы я иду на урок.', 'Самое трудное для меня — аудирование.', 'Курс длится четыре месяца.']),
      D('066_d_dict', ['Ma käin keelekursusel.', 'Tund algab kell kuus.', 'Kodutöö on lühike tekst.', 'Iga kuu lõpus on test.', 'Kõige raskem on kuulamine.']),
      B.speaking('066_d_say', 'Minu õppimine.', 'Räägi paarilisele oma eesti keele õppimisest.', ['Kus ja millal sa eesti keelt õpid?', 'Mitu korda nädalas on sul tund?', 'Mis on kõige raskem?'], [60, 120], ['Ma käin kursusel…', 'Tunnid on…', 'Kõige raskem on…']),
      B.writing('066_d_write', 'Minu kursus.', 'Kirjuta 5–7 lauset oma eesti keele tundidest.', [5, 7], ['kursusel', 'tundi', 'kaks korda nädalas', 'kõige raskem'], 2),
      B.selfcheck('066_d_self', ['Ma tean 12 kursuse sõna.', 'Ma ütlen, kus ja millal mu tunnid on.', 'Ma eristan: kursusel, kursusele, kursuselt.', 'Ma räägin oma õppimisest.'], 'Kursus algas'),
    ],
    practice: [
      B.crossword('066_p_recall', 'Mäletad sõnu?', 'Kirjuta sõnad vihjete järgi.', [
        ['Raamat, mida kasutad tunnis.', 'õpik'], ['Ülesanne, mida teed kodus.', 'kodutöö'], ['Inimene, kes õpetab.', 'õpetaja'], ['Kontroll kuu lõpus.', 'test'], ['Inimene, kes õpib kursusel.', 'õpilane'], ['Siit näed, millal tunnid on.', 'tunniplaan'],
      ]),
      B.wordforms('066_p_forms', 'Kus? Kuhu? Kust?', 'Kirjuta sõna õiges vormis.', [
        ['kursus', 'kus?', 'kursusel'], ['kursus', 'kuhu?', 'kursusele'], ['tund', 'kuhu?', 'tundi'], ['tund', 'kust?', 'tunnist'], ['kool', 'kus?', 'koolis'], ['raamatukogu', 'kuhu?', 'raamatukokku; raamatukogusse'],
      ]),
      B.notice('066_p_timetable', 'Keelekool „Sõna”: tunniplaan', [
        'A2 grupp: esmaspäeviti ja kolmapäeviti 18.00–19.30, klass 12', 'A1 grupp: teisipäeviti ja neljapäeviti 10.00–11.30, klass 5', 'Vestlusklubi: laupäeviti 11.00–12.00, raamatukogus', 'Test: iga kuu viimasel kolmapäeval',
      ], 'full', 'g_read'),
      B.truefalse('066_p_tf', 'Vaata tunniplaani.', 'Loe tunniplaani. Õige või vale?', [
        ['A2 grupil on tund kaks korda nädalas.', true], ['A1 grupp õpib õhtuti.', false], ['A2 tund kestab poolteist tundi.', true], ['Vestlusklubi on klassis 12.', false], ['Test on üks kord kuus.', true],
      ], 'full'),
      B.listening('066_p_listen', 'Teade kursusel.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, head õpilased! Mul on teile mõned teated.',
        'Järgmisel nädalal on tunniplaan natuke teistsugune. Esmaspäeval tundi ei ole, sest koolis on remont.',
        'Tund on hoopis teisipäeval, samal ajal, kell kuus.',
        'Kolmapäeval kirjutame testi. Test kestab üks tund. Palun võtke kaasa pliiats ja õpik.',
        'Kodutöö on lugeda tekst leheküljel kakskümmend kaks.',
        'Reedel läheme koos raamatukokku. Kohtume raamatukogu ees kell viis.',
        'Kui te ei saa tulla, kirjutage mulle e-kiri. Aitäh ja head nädalat!',
      ], ['Esmaspäeval ei ole tundi, sest koolis on [remont].', 'Teisipäeval algab tund kell [kuus|6|18].', 'Kolmapäeval on [test|testi].', 'Kaasa tuleb võtta pliiats ja [õpik|õpiku].', 'Kodutöö on leheküljel [kakskümmend kaks|22].', 'Reedel kohtutakse raamatukogu [ees].', 'Kui ei saa tulla, tuleb saata [e-kiri|e-kirja].']),
      B.gaps('066_p_gaps', 'Kus, kuhu või kust?', 'Vali õige vorm. Üks sõna jääb üle.', [
        'Anna käib iga nädal [kursusel].', 'Pärast tööd läheb ta [kursusele].', 'Kell pool kaheksa tuleb ta [kursuselt] koju.', 'Andrei on praegu [tunnis].', 'Kas sa tuled homme [tundi]?', 'Liis tuleb [tunnist] hilja koju.',
      ], ['kursusel', 'kursusele', 'kursuselt', 'tunnis', 'tundi', 'tunnist', 'kooli']),
      B.choice('066_p_choice', 'Kui tihti?', 'Vali sobiv vastus.', [
        ['Tund on igal esmaspäeval ja neljapäeval. Kui tihti?', 'kaks korda nädalas', 'üks kord nädalas', 'iga päev'],
        ['Test on iga kuu lõpus. Kui tihti?', 'kord kuus', 'kaks korda kuus', 'kord aastas'],
        ['Markus õpib sõnu esmaspäevast pühapäevani. Kui tihti?', 'iga päev', 'nädalavahetusel', 'esmaspäeviti'],
        ['Sofia käib vestlusklubis ainult laupäeviti. Kui tihti?', 'kord nädalas', 'iga päev', 'kaks korda nädalas'],
        ['Tunnid on teisipäeviti ja reedeti. Millal?', 'teisipäeval ja reedel', 'teisipäevast reedeni', 'ainult reedel'],
        ['Kursus kestab septembrist detsembrini. Kui kaua?', 'neli kuud', 'neli nädalat', 'kaks kuud'],
      ], 'full', 'g_vocab'),
      B.transformation('066_p_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Mul on tund igal esmaspäeval.', 'esmaspäeviti', 'Mul on tund esmaspäeviti.|Esmaspäeviti on mul tund.'],
        ['Ma käin tunnis esmaspäeval ja kolmapäeval.', 'kaks korda', 'Ma käin tunnis kaks korda nädalas.|Kaks korda nädalas käin ma tunnis.'],
        ['Tund algab kell kuus ja lõpeb kell pool kaheksa.', 'kestab', 'Tund kestab poolteist tundi.|Tund kestab kella kuuest kella poole kaheksani.'],
        ['Ma olin tunnis. Nüüd lähen koju.', 'tulen', 'Ma tulen tunnist.|Ma tulen tunnist koju.'],
        ['Kuulamine on väga raske. Teised osad on lihtsamad.', 'kõige raskem', 'Kõige raskem on kuulamine.|Kuulamine on kõige raskem.'],
      ]),
      B.errorfix('066_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Pärast töö ma lähen kursusele.', 'Pärast tööd lähen ma kursusele.|Pärast tööd ma lähen kursusele.'], ['Ma tulen kursusel koju.', 'Ma tulen kursuselt koju.'], ['Õpetaja räägib tunnis ainult eesti keelt keeles.', 'Õpetaja räägib tunnis ainult eesti keelt.|Õpetaja räägib tunnis ainult eesti keeles.'], ['Kursus kestab neli kuu.', 'Kursus kestab neli kuud.'], ['Mul on kodutöö iga päevas.', 'Mul on kodutöö iga päev.'],
      ]),
      B.wordorder('066_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Esmaspäeviti on mul eesti keele tund.', 'Kolmapäeval kirjutame testi.', 'Pärast tundi joome koos kohvi.', 'Kodutöö on lugeda üks tekst.', 'Kas sa tuled homme tundi?',
      ]),
      TR('066_p_tr', ['Я иду на урок.', 'Я возвращаюсь с курсов в восемь.', 'Урок длится полтора часа.', 'Тест раз в месяц.', 'Возьмите, пожалуйста, учебник.']),
      D('066_p_dict', ['Ma lähen kursusele.', 'Tund kestab poolteist tundi.', 'Test on kord kuus.', 'Võtke kaasa õpik.', 'Kohtume raamatukogu ees.']),
      B.writing('066_p_write', 'Minu õppimisnädal.', 'Kirjuta 6–8 lauset: millal, kus ja mida sa sel nädalal õpid.', [6, 8], ['kursusel', 'tundi', 'kaks korda nädalas', 'kodutöö'], 3),
      B.speaking('066_p_say', 'Küsi paarilise kohta.', 'Küsi paariliselt tema õppimise kohta. Siis vahetage.', ['Kus sa eesti keelt õpid?', 'Mitu korda nädalas on sul tund?', 'Kui kaua üks tund kestab?', 'Mis on kodutöö?'], [60, 90]),
      B.selfcheck('066_p_self', ['Ma kasutan vorme kursusel, kursusele, kursuselt.', 'Ma ütlen, kui tihti mul tund on.', 'Ma saan aru õpetaja teatest.', 'Ma kirjutan oma õppimisnädalast.'], 'Tunniplaan on selge'),
    ],
    transfer: [
      B.text('066_t_situation', 'Uus olukord', 'Sinu sõber Jaan tahab ka eesti keelt õppida. Ta küsib sinu kursuse kohta. Loe keelekooli kuulutust ja aita teda.'),
      B.reading('066_t_ad', 'Loe kuulutust.', 'Loe ja vasta küsimustele.', 'Keelekool „Sõna” kutsub!',
        'Uued eesti keele kursused algavad 2. oktoobril! A1 grupp õpib teisipäeviti ja neljapäeviti kell 10–11.30. A2 grupp õpib esmaspäeviti ja kolmapäeviti kell 18–19.30. Kursus kestab neli kuud ja maksab 240 eurot. Grupis on kuni kümme õpilast. Tundides räägime palju, sest rääkimine on kõige tähtsam. Iga nädal on väike kodutöö. Kursuse lõpus on test ja iga õpilane saab tunnistuse. Kui sa ei tea oma taset, tule enne kursust tasuta testile. Test on 25. septembril kell 17. Laupäeviti on raamatukogus vestlusklubi kõigile õpilastele. Registreeru meie kodulehel või helista numbril 5123 4567. Ootame sind!',
        [['Millal kursused algavad?', '2. oktoobril|teisel oktoobril'], ['Millises grupis saab õppida pärast tööd?', 'A2|A2 grupis'], ['Kui palju maksab kursus ühes kuus?', '60 eurot|kuuskümmend eurot'], ['Mida saab õpilane kursuse lõpus?', 'tunnistuse|tunnistus'], ['Mida peab tegema, kui sa ei tea oma taset?', 'tulema tasuta testile|tegema testi'], ['Kuidas saab registreeruda?', 'kodulehel või telefoniga|kodulehel|helistada']]),
      B.gaps('066_t_gaps', 'Jaani küsimused.', 'Kirjuta küsimusse sobiv sõna. Kaks sõna jääb üle.', [
        '[Mitu] korda nädalas on tunnid?', '[Kus] kursus toimub?', '[Kui] palju kursus maksab?', 'Kas tunnis on palju [kodutööd]?', '[Millal] on tasuta test?', 'Mis [kell] tund algab?',
      ], ['mitu', 'kus', 'kui', 'kodutööd', 'millal', 'kell', 'kuhu', 'kodutöö']),
      B.table('066_t_form', 'Registreerimisvorm.', 'Täida vorm enda andmetega.', 'Küsimus, Sinu vastus', [
        'Ees- ja perekonnanimi | ', 'Telefon või e-post | ', 'Grupp (A1 või A2) | ', 'Millal sul on aega õppida? | ', 'Miks sa eesti keelt õpid? | ',
      ]),
      B.wordorder('066_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'A2 grupp õpib esmaspäeviti ja kolmapäeviti.', 'Kursus kestab neli kuud.', 'Enne kursust on tasuta test.', 'Laupäeviti on raamatukogus vestlusklubi.', 'Registreeru kodulehel või telefoniga.',
      ]),
      TR('066_t_tr', ['Курс начинается второго октября.', 'Группа учится по вечерам.', 'В конце курса каждый получает сертификат.', 'Я хожу в разговорный клуб.', 'Зарегистрируйся на сайте.']),
      B.rolecards('066_t_roles', 'Jaan küsib kursuse kohta.', 'Rääkige 2–3 minutit. Siis vahetage rollid.',
        'Sa käid kursusel. Vasta Jaani küsimustele: millal, kus, kui kaua, mida tunnis teete.', 'Sa oled Jaan. Küsi vähemalt viis küsimust kursuse kohta.',
        ['Tunnid on…', 'Kursus kestab…', 'Tunnis me…'], ['Mitu korda nädalas…?', 'Kui palju see maksab?', 'Kas kodutöid on palju?']),
      B.letter('066_t_msg', 'Sõnum Jaanile.', 'Kirjuta Jaanile: millal ja kus on A2 kursus, kuidas registreeruda.', 'Tere, Jaan!', 'Edu!', [30, 50]),
      B.speaking('066_t_mono', 'Minu kursus.', 'Räägi 1–2 minutit oma õppimisest.', ['Kus ja millal sa õpid?', 'Mida te tunnis teete?', 'Mis on kõige raskem ja miks?', 'Mis on sinu eesmärk?'], [60, 120]),
      B.writing('066_t_write', 'Minu nädal.', 'Kirjuta 5–7 lauset: millal sa sel nädalal tööl ja tunnis oled.', [5, 7], ['esmaspäeval', 'kursusel', 'tundi', 'pärast tööd'], 3),
      B.selfcheck('066_t_self', ['Ma oskan kasutada kursuse sõnu uues olukorras.', 'Ma oskan leida kuulutusest aja, hinna ja koha.', 'Ma oskan öelda, kus ja millal tund on: kursusel, tundi, esmaspäeviti.', 'Ma oskan sõbrale oma kursust tutvustada.'], 'Jaan tuleb ka'),
    ],
  },

  'a2-067': {
    title: 'Ma ei saa aru',
    canDo: 'Ma palun abi, kui ma ei saa aru, ja kasutan eesti keeles vähemalt nelja küsimust: palun korrake, mida tähendab…, kuidas öeldakse…, kas saate näite tuua.',
    discover: [
      B.text('067_d_situation', 'Esimene päev tööl', 'Andrei alustab tööd uues laos. Juhataja Mari selgitab tööd väga kiiresti. Andrei saab aru ainult pooltest sõnadest. Ta ei taha rääkida vene keeles. Ta küsib uuesti eesti keeles.'),
      B.truefalse('067_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Andrei on tööl esimest päeva.', true], ['Mari räägib aeglaselt.', false], ['Andrei saab pooltest sõnadest aru.', true], ['Andrei küsib vene keeles.', false], ['Mari on Andrei juhataja.', true],
      ]),
      B.vocab('067_d_vocab', 'Abi küsimise sõnad', ['aru saama — понимать', 'kordama — повторять', 'selgitama — объяснять', 'tähendama — значить', 'näide — пример', 'aeglaselt — медленно', 'valjemini — громче', 'ütlema — сказать', 'kirjutama — писать', 'näitama — показывать']),
      B.reading('067_d_read', 'Loe: Mari ja Andrei laos.', 'Loe dialoogi ja vasta küsimustele.', 'Laos',
        'Mari: Andrei, palun pane need kastid riiulile. Rasked kastid lähevad alla, kerged üles.\nAndrei: Vabandust, ma ei saanud aru. Palun korrake aeglasemalt.\nMari: Muidugi. Rasked kastid pane alumisele riiulile.\nAndrei: Mida tähendab „alumine”?\nMari: Alumine tähendab, et see on all, mitte üleval.\nAndrei: Aa, selge. Aga mida ma pärast teen?\nMari: Pärast kontrolli saatelehte.\nAndrei: Kuidas seda sõna kirjutatakse?\nMari: Saateleht, ühe sõnana. Siin on üks saateleht.\nAndrei: Kas te saate näite tuua? Mida ma pean kontrollima?\nMari: Vaata, siin on kirjas kümme kasti. Loe kastid üle. Kui kaste on kümme, on kõik korras.\nAndrei: Nüüd saan aru. Aitäh, et te nii hästi selgitasite!\nMari: Pole tänu väärt. Küsi alati, kui midagi on segane.',
        [['Kuhu peab Andrei rasked kastid panema?', 'alumisele riiulile|alla'], ['Miks palub Andrei korrata?', 'ta ei saanud aru'], ['Mis sõna Andrei alguses ei tea?', 'alumine'], ['Mida peab Andrei pärast tegema?', 'kontrollima saatelehte|lugema kastid üle'], ['Kuidas Mari näite toob?', 'ta näitab saatelehte|näitab, et seal on kümme kasti'], ['Kas Mari ütleb Andreile „sina” või „teie”?', 'sina']]),
      B.categorize('067_d_find', 'Leia dialoogist.', 'Mida inimene vajab? Sorteeri küsimused.', [
        ['Ma ei kuulnud hästi', ['Palun korrake.', 'Palun rääkige aeglasemalt.']], ['Ma ei tea sõna', ['Mida tähendab „alumine”?', 'Kuidas öeldakse eesti keeles „окно”?']], ['Ma tahan näidet', ['Kas te saate näite tuua?', 'Palun näidake.']], ['Ma ei tea kirjapilti', ['Kuidas seda sõna kirjutatakse?', 'Palun kirjutage tahvlile.']],
      ], 'full', 'g_use'),
      B.notice('067_d_notice', 'Märka: sina või teie?', [
        'Sõbrale: **Korda**, palun! **Räägi** aeglasemalt!', 'Õpetajale, võõrale: **Korrake**, palun! **Rääkige** aeglasemalt!', 'kirjuta → **kirjutage**, selgita → **selgitage**, näita → **näidake**', 'Viisakam: **Kas te saaksite** korrata? (+ da-vorm)',
      ], 'full'),
      B.wordforms('067_d_forms', 'Sina ja teie.', 'Kirjuta käskiv vorm.', [
        ['kordama', 'sina', 'korda'], ['kordama', 'teie', 'korrake'], ['rääkima', 'teie', 'rääkige'], ['kirjutama', 'sina', 'kirjuta'], ['selgitama', 'teie', 'selgitage'], ['näitama', 'teie', 'näidake'],
      ]),
      B.gaps('067_d_gaps', 'Täida küsimused.', 'Kirjuta lünka sobiv sõna. Kolm sõna jääb üle.', [
        'Vabandust, ma ei [saanud] aru.', 'Palun [korrake] veel üks kord.', 'Mida [tähendab] see sõna?', 'Kuidas [öeldakse] eesti keeles „окно”?', 'Kas te saate [näite] tuua?', 'Palun rääkige [aeglasemalt].',
      ], ['saanud', 'sain', 'korrake', 'kordan', 'tähendab', 'öeldakse', 'näite', 'näide', 'aeglasemalt']),
      B.transformation('067_d_polite', 'Küsi viisakamalt.', 'Kirjuta küsimus „Kas te saaksite…?” abil.', [
        ['Korrake!', 'Kas te saaksite…?', 'Kas te saaksite korrata?'], ['Rääkige aeglasemalt!', 'Kas te saaksite…?', 'Kas te saaksite aeglasemalt rääkida?'], ['Tooge näide!', 'Kas te saaksite…?', 'Kas te saaksite näite tuua?'], ['Selgitage veel kord!', 'Kas te saaksite…?', 'Kas te saaksite veel kord selgitada?'], ['Kirjutage see sõna tahvlile!', 'Kas te saaksite…?', 'Kas te saaksite selle sõna tahvlile kirjutada?'],
      ]),
      B.errorfix('067_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei saan aru.', 'Ma ei saa aru.'], ['Kuidas ütleb eesti keeles „окно”?', 'Kuidas öeldakse eesti keeles „окно”?'], ['Palun räägige aeglasemalt.', 'Palun rääkige aeglasemalt.'], ['Kas te saate näide tuua?', 'Kas te saate näite tuua?'], ['Ma ei sain aru.', 'Ma ei saanud aru.'],
      ]),
      B.dialogue('067_d_dialog', 'Tunnis.', 'Täida dialoog.', 'Anna', 'Õpetaja', [
        ['B', 'Täna loeme teksti leheküljel kolmkümmend.'], ['A', 'Vabandust, ma ei [saanud] aru. Mis leheküljel?'], ['B', 'Leheküljel kolmkümmend.'],
        ['A', 'Aitäh! Mida [tähendab] sõna „pealkiri”?'], ['B', 'Pealkiri on teksti nimi. See on kõige üleval.'],
        ['A', 'Kas te [saaksite] selle tahvlile kirjutada?'], ['B', 'Muidugi. Palun.'], ['A', 'Kuidas [öeldakse] eesti keeles „абзац”?'], ['B', 'Lõik.'], ['A', 'Suur [aitäh]!'],
      ]),
      B.wordorder('067_d_order', 'Pane küsimus kokku.', 'Kirjuta küsimused õigesti.', [
        'Vabandust, ma ei saanud aru.', 'Palun rääkige natuke aeglasemalt.', 'Mida see sõna tähendab?', 'Kuidas seda sõna kirjutatakse?', 'Kas te saaksite näite tuua?',
      ]),
      B.listening('067_d_listen', 'Telefonikõne keelekooli.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Keelekool „Sõna”, tere!', '— Tere! Ma tahan küsida kursuse kohta. Vabandust, kas te saaksite natuke aeglasemalt rääkida?',
        '— Muidugi. Uus kursus algab esmaspäeval kell kuus.', '— Mis kell? Palun korrake.', '— Kell kuus õhtul. Klass on teisel korrusel.',
        '— Mida tähendab „korrus”?', '— Korrus on maja tase. Esimene korrus on all, teine korrus on üleval.',
        '— Aa, selge. Kuidas teie kooli nime kirjutatakse?', '— Sõna, s-õ-n-a. Kas teil on veel küsimusi?', '— Ei, aitäh! Head päeva!',
      ], ['Kursus algab [esmaspäeval].', 'Tund algab kell [kuus|6|18].', 'Helistaja palub [korrata|korrata kellaaega].', 'Klass on teisel [korrusel].', 'Helistaja küsib, kuidas kirjutatakse kooli [nime|nimi].']),
      D('067_d_dict', ['Vabandust, ma ei saanud aru.', 'Palun korrake.', 'Mida see sõna tähendab?', 'Kuidas öeldakse eesti keeles „окно”?', 'Kas te saate näite tuua?']),
      B.speaking('067_d_say', 'Kuidas sa küsid?', 'Räägi paarilisele: mida sa teed, kui ei saa aru?', ['Mida sa ütled, kui inimene räägib kiiresti?', 'Kuidas sa küsid uue sõna kohta?', 'Kas sa küsid tööl või poes uuesti?'], [45, 90]),
      B.writing('067_d_write', 'Minu küsimused.', 'Kirjuta 5–7 küsimust, mida saad tunnis õpetajale esitada.', [5, 7], ['korrake', 'tähendab', 'öeldakse', 'näite'], 3),
      B.selfcheck('067_d_self', ['Ma palun korrata ja aeglasemalt rääkida.', 'Ma küsin, mida sõna tähendab.', 'Ma eristan: korda / korrake.', 'Ma küsin viisakalt: Kas te saaksite…?'], 'Küsimine on julge'),
    ],
    practice: [
      B.match('067_p_recall', 'Mäletad?', 'Ühenda küsimuse algus ja lõpp.', [
        ['Palun', 'korrake veel üks kord.'], ['Mida', 'tähendab see sõna?'], ['Kuidas öeldakse', 'eesti keeles „ручка”?'], ['Kas te saate', 'näite tuua?'], ['Kuidas seda', 'sõna kirjutatakse?'], ['Palun rääkige', 'natuke aeglasemalt.'],
      ], 'full', 'g_use'),
      B.wordforms('067_p_forms', 'Sina või teie?', 'Kirjuta käskiv vorm.', [
        ['lugema', 'teie', 'lugege'], ['tulema', 'teie', 'tulge'], ['ütlema', 'sina', 'ütle'], ['ütlema', 'teie', 'öelge'], ['vaatama', 'teie', 'vaadake'], ['kuulama', 'sina', 'kuula'],
      ]),
      B.gaps('067_p_gaps', 'Kumb vorm?', 'Õpilane räägib õpetajaga. Vali õige vorm.', [
        'Õpetaja, palun [korrake] see lause.', 'Palun [kirjutage] see sõna tahvlile.', 'Palun [selgitage] veel kord.', 'Palun [näidake] pildil.', 'Palun [rääkige] natuke valjemini.',
      ], ['korrake', 'korda', 'kirjutage', 'kirjuta', 'selgitage', 'selgita', 'näidake', 'näita', 'rääkige', 'räägi']),
      B.listening('067_p_listen', 'Õpetaja juhised.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere hommikust! Täna kirjutame lühikese testi.',
        'Võtke palun pliiats ja paber. Telefonid pange kotti.',
        '— Vabandust, kas te saaksite korrata? Mida me võtame?',
        '— Pliiatsi ja paberi. Test kestab kakskümmend minutit.',
        'Esimeses ülesandes kuulate dialoogi kaks korda. Teises ülesandes loete teksti ja vastate küsimustele.',
        '— Mida tähendab „vastama”?',
        '— Vastama tähendab, et kirjutate vastuse. Näiteks: küsimus on „Kus sa elad?” ja vastus on „Tartus”.',
        'Kui te ei saa sõnast aru, tõstke käsi. Sõnaraamatut kasutada ei tohi. Edu!',
      ], ['Täna kirjutavad õpilased [testi|test].', 'Telefonid tuleb panna [kotti].', 'Test kestab [kakskümmend|20] minutit.', 'Esimeses ülesandes kuulatakse [dialoogi|dialoog].', 'Teises ülesandes loetakse [teksti|tekst].', 'Kui ei saa aru, tuleb tõsta [käsi|kätt].', '[Sõnaraamatut|Sõnaraamat] kasutada ei tohi.']),
      B.choice('067_p_choice', 'Mida öelda?', 'Vali kõige parem lause.', [
        ['Arst räägib väga kiiresti.', 'Vabandust, palun rääkige aeglasemalt.', 'Rääkige kiiremini, palun.', 'Aitäh, kõik on selge.'],
        ['Kolleeg kasutab sõna, mida sa ei tea.', 'Mida see sõna tähendab?', 'Kuidas sa seda kirjutad?', 'Kas sa saad kiiremini rääkida?'],
        ['Sa ei kuulnud telefonis numbrit.', 'Palun korrake numbrit.', 'Palun kirjutage tahvlile.', 'Kuidas öeldakse „number”?'],
        ['Sa ei tea, kuidas see asi eesti keeles on.', 'Kuidas öeldakse seda eesti keeles?', 'Mida tähendab see eesti sõna?', 'Kas te saate korrata?'],
        ['Õpetaja selgitab reeglit, aga sa ei saa aru.', 'Kas te saate näite tuua?', 'Ma ei taha seda õppida.', 'Palun rääkige valjemini.'],
        ['Sõber räägib, aga ümberringi on lärm.', 'Räägi valjemini, palun!', 'Mida tähendab „lärm”?', 'Kas sa saad näite tuua?'],
      ], 'full', 'g_use'),
      B.transformation('067_p_trans', 'Sõbrale või võõrale?', 'Kirjuta lause teise inimese jaoks.', [
        ['Korda, palun! (sõbrale)', 'võõrale', 'Korrake, palun!'], ['Rääkige aeglasemalt! (võõrale)', 'sõbrale', 'Räägi aeglasemalt!'], ['Näita, palun! (sõbrale)', 'võõrale', 'Näidake, palun!'], ['Kirjutage see üles! (võõrale)', 'sõbrale', 'Kirjuta see üles!'], ['Kas sa saad näite tuua? (sõbrale)', 'võõrale', 'Kas te saate näite tuua?|Kas te saaksite näite tuua?'],
      ]),
      B.errorfix('067_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palun korrata.', 'Palun korrake.|Palun korda.'], ['Ma ei saa aru teie.', 'Ma ei saa teist aru.'], ['Kas te saaksite korrake?', 'Kas te saaksite korrata?'], ['Palun kirjutad tahvlile.', 'Palun kirjutage tahvlile.|Palun kirjuta tahvlile.'], ['Ma ei tea, mis see tähendab sõna.', 'Ma ei tea, mida see sõna tähendab.'],
      ]),
      B.dialogue('067_p_dialog', 'Telefonikõne.', 'Täida dialoog.', 'Anna', 'Registratuur', [
        ['B', 'Tere! Perearstikeskus, kuulan.'], ['A', 'Tere! Vabandust, ma ei [saanud] aru. Palun [korrake].'], ['B', 'Perearstikeskus. Kuidas saan aidata?'],
        ['A', 'Mul on vaja aega arsti juurde. Palun rääkige [aeglasemalt], ma õpin eesti keelt.'], ['B', 'Muidugi. Kas teil on saatekiri?'],
        ['A', 'Mida [tähendab] „saatekiri”?'], ['B', 'See on paber, mille annab teine arst. Teil seda vaja ei ole.'],
        ['A', 'Selge. Kas te [saaksite] aja sõnumiga saata?'], ['B', 'Jah, saadan kohe.'], ['A', 'Suur [aitäh]!'],
      ]),
      B.wordorder('067_p_order', 'Pane küsimus kokku.', 'Kirjuta küsimused õigesti.', [
        'Kas te saaksite natuke aeglasemalt rääkida?', 'Mida see sõna eesti keeles tähendab?', 'Kuidas seda sõna kirjutatakse?', 'Kas te saate ühe näite tuua?', 'Kuidas öeldakse eesti keeles „ручка”?',
      ]),
      TR('067_p_tr', ['Я вас не понимаю.', 'Не могли бы вы повторить?', 'Как это пишется?', 'Покажите, пожалуйста.', 'Говори громче, пожалуйста!']),
      D('067_p_dict', ['Palun rääkige valjemini.', 'Ma ei saa teist aru.', 'Kas te saaksite korrata?', 'Palun näidake pildil.', 'Kuidas seda kirjutatakse?']),
      B.writing('067_p_write', 'Kiri kursusekaaslasele.', 'Kirjuta 6–8 lauset: mida teha tunnis, kui ei saa aru.', [6, 8], ['palun korrake', 'mida tähendab', 'kuidas öeldakse', 'näide'], 3),
      B.speaking('067_p_say', 'Mängi läbi.', 'Paariline räägib kiiresti ja kasutab raskeid sõnu. Küsi.', ['Paariline räägib oma tööst.', 'Sina küsid: korda, tähendus, kirjapilt, näide.', 'Siis vahetage.'], [60, 90], ['Palun korrake.', 'Mida tähendab…?', 'Kuidas seda kirjutatakse?']),
      B.selfcheck('067_p_self', ['Ma moodustan käskiva vormi: korda, korrake.', 'Ma küsin viisakalt: Kas te saaksite…?', 'Ma parandan küsimuse vead.', 'Ma saan aru õpetaja juhistest.'], 'Küsin ja saan aru'),
    ],
    transfer: [
      B.text('067_t_situation', 'Uus olukord', 'Anna alustab tööd uues kontoris. Kolleeg Siim selgitab talle arvutiprogrammi. Ta räägib kiiresti ja kasutab palju uusi sõnu.'),
      B.reading('067_t_read', 'Loe Anna kirja.', 'Loe kirja ja vasta küsimustele.', 'Tere, Siim!',
        'Aitäh, et sa mulle täna programmi selgitasid. Kahjuks ma ei saanud kõigest aru, sest sa rääkisid väga kiiresti. Mul on mõned küsimused. Mida tähendab sõna „salvestama”? Kas see on sama mis „save”? Ma ei leidnud ka nuppu „Saada”. Kus see on? Ja kuidas öeldakse eesti keeles „отчёт”? Ma pean homme selle kirjutama. Kas sa saaksid mulle homme hommikul veel kord näidata? Ma tulen tööle kell kaheksa. Kui sul on aega, joome koos kohvi ja sa näitad mulle. Aitäh ette! Anna',
        [['Miks ei saanud Anna kõigest aru?', 'Siim rääkis kiiresti|ta rääkis väga kiiresti'], ['Millise sõna tähendust Anna küsib?', 'salvestama'], ['Mida Anna ei leidnud?', 'nuppu „Saada”|nuppu Saada|nuppu'], ['Millal peaks Siim uuesti näitama?', 'homme hommikul|homme kell kaheksa'], ['Mida Anna pakub?', 'koos kohvi juua|kohvi'], ['Kas Anna kirjutab viisakalt? Miks?', 'jah, ta tänab|jah, ta ütleb aitäh']]),
      B.cloze('067_t_cloze', 'Vestlus apteegis.', 'Vali igasse lünka sobiv sõna.', 'Apteegis', [
        'Apteeker: Võtke seda rohtu kaks korda päevas pärast sööki.',
        'Anna: Vabandust, ma ei {*saanud|sain|saama} aru. Palun {*korrake|kordama|kordan} aeglasemalt.',
        'Apteeker: Kaks korda päevas. Hommikul ja õhtul.',
        'Anna: Mida {*tähendab|tähenda|tähendama} „pärast sööki”?',
        'Apteeker: Kõigepealt sööte ja siis võtate rohtu.',
        'Anna: Kas te {*saaksite|saaksin|saan} selle paberile kirjutada?',
        'Apteeker: Muidugi. Kas teil on veel küsimusi?',
        'Anna: Kuidas {*öeldakse|ütleb|ütlema} eesti keeles „таблетка”?',
        'Apteeker: Tablett. See on lihtne!',
      ]),
      B.wordorder('067_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Kas sa saaksid mulle homme uuesti näidata?', 'Ma ei leidnud nuppu „Saada”.', 'Mida tähendab sõna „salvestama”?', 'Kahjuks ma ei saanud kõigest aru.', 'Palun kirjutage see paberile.',
      ]),
      TR('067_t_tr', ['Извините, я не всё понял.', 'Что значит слово «сохранить»?', 'Можешь показать мне ещё раз?', 'Как по-эстонски «отчёт»?', 'Спасибо заранее!']),
      D('067_t_dict', ['Ma ei saanud kõigest aru.', 'Kas sa saaksid uuesti näidata?', 'Mida tähendab salvestama?', 'Palun kirjutage paberile.', 'Aitäh ette!']),
      B.planning('067_t_plan', 'Enne vestlust.', 'Mõtle läbi ja kirjuta märksõnad.', ['Milliseid sõnu sa ei tea?', 'Mida sa palud korrata?', 'Millist näidet sa vajad?', 'Kuidas sa tänad?']),
      B.rolecards('067_t_roles', 'Siim selgitab.', 'Rääkige 2–3 minutit. Siis vahetage rollid.',
        'Sa oled Siim. Selgita kiiresti, kuidas printerit kasutada. Kasuta raskeid sõnu.', 'Sa oled Anna. Kasuta vähemalt nelja küsimust: kordamine, tähendus, sõna, näide.',
        ['Kõigepealt vajuta…', 'Siis vali…', 'Lõpuks…'], ['Palun korda.', 'Mida tähendab…?', 'Kuidas öeldakse…?', 'Kas sa saad näite tuua?']),
      B.letter('067_t_msg', 'Kiri õpetajale.', 'Sa ei saanud kodutööst aru. Kirjuta õpetajale ja küsi kolm küsimust.', 'Tere, õpetaja!', 'Tänan ette!', [30, 50]),
      B.speaking('067_t_mono', 'Minu nõuanded.', 'Räägi 1–2 minutit: mida teha, kui ei saa eesti keelest aru?', ['Kas sa küsid uuesti?', 'Millist küsimust kasutad kõige rohkem?', 'Kas sa kasutad telefoni sõnaraamatut?', 'Mis aitab sind kõige rohkem?'], [60, 120]),
      B.writing('067_t_write', 'Nõuanded uuele õpilasele.', 'Kirjuta 5–7 lauset: kuidas tunnis abi küsida.', [5, 7], ['palun korrake', 'mida tähendab', 'kuidas öeldakse', 'näide'], 3),
      B.selfcheck('067_t_self', ['Ma oskan kasutada abi küsimise sõnu: korrata, tähendab, näide.', 'Ma oskan leida kirjast, mida inimene ei mõistnud.', 'Ma oskan valida sina- või teie-vormi: korda / korrake.', 'Ma oskan vestluses kasutada nelja küsimust ilma vene keeleta.'], 'Ma ei jää vait'),
    ],
  },

  'a2-068': {
    title: 'Ma tahan õppida / hakkan õppima',
    canDo: 'Ma räägin oma õppimise eesmärgist ja plaanist mustritega tahan / proovin + da-vorm ja hakkan + ma-vorm ning moodustan vähemalt 8 sagedast ühendit 10-st õigesti.',
    discover: [
      B.text('068_d_situation', 'Uued eesmärgid', 'Jaanuaris istuvad Anna ja Jaan kohvikus. Mõlemal on uus eesmärk: sooritada suvel A2 eksam. Anna ütleb: „Ma hakkan iga päev lugema.” Jaan naerab: „Mina proovin rääkida ainult eesti keeles!”'),
      B.vocab('068_d_vocab', 'Eesmärk ja õppimine', ['eesmärk — цель', 'hakkama (hakkan + ma) — начинать', 'proovima (proovin + da) — пробовать', 'tahtma (tahan + da) — хотеть', 'õppima — учить(ся)', 'lugema — читать', 'kuulama — слушать', 'kirjutama — писать', 'eksam — экзамен', 'sooritama — сдавать (экзамен)', 'unustama — забывать', 'meelde jätma — запоминать'], '2'),
      B.reading('068_d_read', 'Loe: Anna plaan.', 'Loe teksti ja vasta küsimustele.', 'Minu eesmärk',
        'Minu eesmärk on sooritada juunis A2 eksam. Ma tahan eesti keeles paremini rääkida ja kirjutada. Tööl kontoris pean ma klientidega suhtlema. Mõnikord ma ei saa aru, mida nad küsivad. Seepärast hakkan ma iga päev eesti keelt õppima. Hommikul bussis hakkan kuulama eesti raadiot. Õhtul proovin lugeda lühikesi uudiseid. Uued sõnad kirjutan vihikusse. Ma unustan sõnad kiiresti. Seepärast proovin neid kohe lauses kasutada. Laupäeviti hakkan käima keelekohvikus. Seal saab rääkida eestlastega. Ma ei taha enam vigu karta. Ma tahan julgelt rääkida! Kuu pärast proovin teha proovieksami. Siis näen, mida pean veel harjutama.',
        [['Mis on Anna eesmärk?', 'sooritada A2 eksam|sooritada juunis A2 eksam|A2 eksam'], ['Miks on eesti keel tööl vajalik?', 'ta peab klientidega suhtlema|ta suhtleb klientidega'], ['Mida hakkab Anna bussis tegema?', 'kuulama eesti raadiot|kuulama raadiot'], ['Mida proovib Anna õhtul teha?', 'lugeda lühikesi uudiseid|lugeda uudiseid'], ['Kus saab Anna eestlastega rääkida?', 'keelekohvikus'], ['Mida teeb Anna kuu pärast?', 'proovieksami|ta teeb proovieksami']]),
      B.notice('068_d_notice', 'Märka: kolm mustrit', ['**tahan** + da: Ma tahan **rääkida**. Ma tahan eksami **sooritada**.', '**proovin** + da: Ma proovin **lugeda** uudiseid.', '**hakkan** + ma: Ma hakkan raadiot **kuulama**. (= alustan)', 'Meeles: **pean** + ma (pean harjutama), **oskan / saan** + da', 'hakkan = alustan; proovin = teen katse; tahan = mul on soov'], 'full'),
      B.wordforms('068_d_forms', 'da-vorm', 'Kirjuta tegusõna da-vormis.', [
        ['lugema', 'ma tahan …', 'lugeda'], ['kuulama', 'ma proovin …', 'kuulata'], ['kirjutama', 'ma tahan …', 'kirjutada'], ['rääkima', 'ma proovin …', 'rääkida'],
        ['sooritama', 'ma tahan eksami …', 'sooritada'], ['tegema', 'ma proovin …', 'teha'], ['jätma', 'ma proovin meelde …', 'jätta'],
      ]),
      B.choice('068_d_choice', 'ma-vorm või da-vorm?', 'Vali lausesse sobiv vorm.', [
        ['Ma hakkan iga päev ___.', 'lugema', 'lugeda', 'loen'], ['Ma proovin eesti keeles ___.', 'rääkida', 'rääkima', 'räägin'], ['Jaan tahab eksami ___.', 'sooritada', 'sooritama', 'sooritab'],
        ['Homsest hakkame raadiot ___.', 'kuulama', 'kuulata', 'kuulame'], ['Ma ___ uusi sõnu meelde jätta.', 'proovin', 'hakkan', 'pean'], ['Ma ___ päevikut kirjutama.', 'hakkan', 'tahan', 'proovin'],
      ], 'full', 'g_notice'),
      B.match('068_d_mean', 'Mis see tähendab?', 'Ühenda lause ja tähendus.', [
        ['Ma hakkan lugema.', 'Ma alustan lugemist.'], ['Ma proovin lugeda.', 'Ma teen katse.'], ['Ma tahan lugeda.', 'Mul on soov.'],
        ['Ma pean lugema.', 'See on minu kohustus.'], ['Ma oskan lugeda.', 'Mul on see oskus.'], ['Ma ei pea lugema.', 'See ei ole vajalik.'],
      ], 'full', 'g_notice'),
      B.manymatch('068_d_plan', 'Probleem ja lahendus.', 'Ühenda probleem ja sobiv plaan.', ['Ma unustan sõnad kiiresti.', 'Ma ei saa raadiost aru.', 'Ma kardan rääkida.', 'Mul on vähe aega.', 'Ma teen kirjas palju vigu.'], ['Ma hakkan sõnu kaartidelt kordama.', 'Ma proovin kuulata aeglast raadiot.', 'Ma hakkan käima keelekohvikus.', 'Ma proovin õppida bussis 15 minutit.', 'Ma tahan saada õpetajalt tagasisidet.'], 'full', 'g_use'),
      B.gaps('068_d_gaps', 'Jaani plaan.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Jaan tahab eesti keeles julgemalt [rääkida] (rääkima).', 'Ta hakkab iga päev raadiot [kuulama] (kuulama).', 'Ta proovib uusi sõnu meelde [jätta] (jätma).', 'Õhtuti hakkab ta päevikut [kirjutama] (kirjutama).',
        'Ta tahab juunis eksami [sooritada] (sooritama).', 'Ta proovib tööl vähem vene keeles [rääkida] (rääkima).',
      ]),
      B.transformation('068_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma loen iga päev.', 'hakkan', 'Ma hakkan iga päev lugema.'], ['Ma räägin eesti keeles.', 'proovin', 'Ma proovin eesti keeles rääkida.|Ma proovin rääkida eesti keeles.'], ['Ma sooritan eksami.', 'tahan', 'Ma tahan eksami sooritada.'],
        ['Ma kuulan raadiot.', 'hakkan', 'Ma hakkan raadiot kuulama.'], ['Ma kirjutan e-kirja eesti keeles.', 'proovin', 'Ma proovin e-kirja eesti keeles kirjutada.|Ma proovin kirjutada e-kirja eesti keeles.'], ['Ma jätan sõnad meelde.', 'tahan', 'Ma tahan sõnad meelde jätta.'],
      ]),
      B.cloze('068_d_cloze', 'Jaani sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Ma mõtlesin sinu plaani peale. Ka mina hakkan iga päev {*õppima|õppida|õpin}. Hommikul proovin uudiseid {*lugeda|lugema|loen}.',
        '',
        'Õhtul hakkan {*kuulama|kuulata|kuulan} eesti laule. Laupäeval tahan keelekohvikusse {*tulla|tulema|tulen}. Kas me {*saame|peame|hakkame} koos minna?',
        '',
        'Ma {*unustan|unustama|unustada} sõnad kiiresti, aga ma ei {*taha|tahan|tahtma} lõpetada. Jaan',
      ]),
      B.translation('068_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я начну читать каждый день.', 'Я попробую говорить по-эстонски.', 'Я хочу сдать экзамен.', 'Я быстро забываю слова.', 'Моя цель — говорить смелее.']),
      B.dictation('068_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu eesmärk on eksam.', 'Ma hakkan iga päev lugema.', 'Ma proovin rääkida eesti keeles.', 'Ma tahan eksami sooritada.', 'Ma ei taha sõnu unustada.']),
      B.speaking('068_d_say', 'Minu eesmärk.', 'Räägi paarilisele oma keeleõppe eesmärgist.', ['Mis on sinu eesmärk?', 'Mida sa hakkad tegema?', 'Mida sa proovid teha?', 'Mida sa tahad hästi osata?'], [60, 90], ['Ma tahan …-da.', 'Ma hakkan …-ma.', 'Ma proovin …-da.']),
      B.writing('068_d_write', 'Minu kolm eesmärki.', 'Kirjuta 6–8 lauset: mida sa tahad, hakkad ja proovid teha.', [6, 8], ['tahan', 'hakkan', 'proovin'], 3),
      B.selfcheck('068_d_self', ['Ma tean: tahan / proovin + da, hakkan + ma.', 'Ma tean, mis vahe on: hakkan, proovin, tahan.', 'Ma leian tekstist eesmärgi ja plaani.', 'Ma räägin oma eesmärgist.'], 'Eesmärk on olemas'),
    ],
    practice: [
      B.crossword('068_p_cross', 'Õppimise sõnad.', 'Kirjuta sõna vihje järgi.', [['цель', 'eesmärk'], ['Seda teed raamatuga.', 'lugema'], ['Seda teed raadioga.', 'kuulama'], ['„meelde jätma” vastand', 'unustama'], ['Test kursuse lõpus', 'eksam'], ['Ma … proovieksami. (proovima)', 'proovin']]),
      B.categorize('068_p_sort', 'Mis vorm järgneb?', 'Pane tegusõnad õigesse rühma.', [['+ ma-vorm (lugema)', ['hakkan', 'pean', 'lähen']], ['+ da-vorm (lugeda)', ['tahan', 'proovin', 'oskan', 'saan']]], 'full', 'g_notice'),
      B.gaps('068_p_gaps', 'Viktori plaan.', 'Kirjuta sulgudes olev tegusõna ma- või da-vormis.', [
        'Viktor hakkab esmaspäeviti kursusel [käima] (käima).', 'Ta tahab naabritest paremini aru [saada] (saama).', 'Ta proovib iga päev ühte laulu [kuulata] (kuulama).', 'Poes hakkab ta müüjatega eesti keeles [rääkima] (rääkima).',
        'Ta proovib kümme sõna päevas meelde [jätta] (jätma).', 'Ta ei taha vanu sõnu [unustada] (unustama).', 'Aasta pärast tahab ta eksami [sooritada] (sooritama).',
      ]),
      B.reading('068_p_read', 'Loe: kolm õpilast.', 'Loe teksti ja vasta küsimustele.', 'Meie eesmärgid', [
        'Sofia: Minu eesmärk on rääkida ülikoolis ainult eesti keeles. Ma hakkan iga päev lõunal kursusekaaslastega eesti keeles rääkima. Õhtul proovin vaadata eesti seriaale. Nii kuulen palju uusi sõnu.',
        'Markus: Mina tahan kirjutada ilma vigadeta. Ma hakkan iga nädal kirjutama ühe lühikese teksti. Õpetaja kontrollib seda. Sõnad kirjutan kaartidele ja proovin need meelde jätta.',
        'Oksana: Minu tütar Mia käib eesti lasteaias. Ma tahan tema kasvatajaga ise rääkida. Ma hakkan käima keelekohvikus kaks korda nädalas. Ma proovin tütrega ka eesti raamatuid lugeda. Tütar on minu parim õpetaja!',
      ], [['Kus tahab Sofia eesti keelt rääkida?', 'ülikoolis'], ['Mida hakkab Sofia lõunal tegema?', 'kursusekaaslastega eesti keeles rääkima|eesti keeles rääkima'], ['Mida tahab Markus?', 'kirjutada ilma vigadeta'], ['Kes kontrollib Markuse teksti?', 'õpetaja'], ['Kellega tahab Oksana rääkida?', 'tütre kasvatajaga|Mia kasvatajaga|kasvatajaga'], ['Kui tihti hakkab Oksana keelekohvikus käima?', 'kaks korda nädalas']]),
      B.truefalse('068_p_tf', 'Õige või vale?', 'Loe teksti uuesti.', [['Sofia proovib vaadata eesti seriaale.', true], ['Markus tahab rohkem rääkida.', false], ['Markus kirjutab sõnad kaartidele.', true], ['Oksana tütar käib vene lasteaias.', false], ['Oksana proovib tütrega raamatuid lugeda.', true]]),
      B.table('068_p_table', 'Kes mida teeb?', 'Kirjuta tekstist tegusõna õiges vormis.', 'Inimene, hakkab … (ma-vorm), proovib … (da-vorm)', [
        'Sofia | [rääkima] | [vaadata]', 'Markus | [kirjutama] | [meelde jätta/jätta]', 'Oksana | [käima] | [lugeda]',
      ], 'g_notice'),
      B.listening('068_p_listen', 'Kuulamine. Õpetaja nõuanded.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen õpetaja Liis.', 'Kui te tahate eksami sooritada, peate harjutama iga päev.', 'Hakake kuulama eesti raadiot vähemalt kümme minutit päevas.', 'Proovige lugeda lastele mõeldud raamatuid. Need on lihtsad.',
        'Uued sõnad kirjutage kaartidele.', 'Ärge kartke vigu teha. Vigadest me õpime!',
      ], ['Harjutada tuleb iga [päev].', 'Raadiot tuleb kuulata vähemalt [kümme|10] minutit päevas.', 'Lihtsad on lastele mõeldud [raamatud].', 'Uued sõnad tuleb kirjutada [kaartidele].', 'Vigu ei pea [kartma].', 'Vigadest me [õpime].']),
      B.errorfix('068_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma hakkan lugeda iga päev.', 'Ma hakkan iga päev lugema.|Ma hakkan lugema iga päev.'], ['Ta tahab eksam sooritama.', 'Ta tahab eksami sooritada.'], ['Me proovime rääkima ainult eesti keeles.', 'Me proovime rääkida ainult eesti keeles.|Me proovime ainult eesti keeles rääkida.'],
        ['Nad hakkavad kursusel käia.', 'Nad hakkavad kursusel käima.'], ['Ma ei taha unustama sõnu.', 'Ma ei taha sõnu unustada.'], ['Ma lähen keelekohvikusse rääkida.', 'Ma lähen keelekohvikusse rääkima.'],
      ]),
      B.wordorder('068_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma hakkan iga päev raadiot kuulama.', 'Ta proovib lugeda lihtsaid raamatuid.', 'Me tahame juunis eksami sooritada.', 'Sofia hakkab ülikoolis eesti keelt rääkima.', 'Ma proovin uued sõnad meelde jätta.']),
      B.dictation('068_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Hakake kuulama eesti raadiot.', 'Proovige lugeda lihtsaid raamatuid.', 'Ma hakkan käima keelekohvikus.', 'Ta tahab ilma vigadeta kirjutada.', 'Ärge kartke vigu teha.']),
      B.speaking('068_p_say', 'Kes mida teeb?', 'Räägi tekstist: Sofia, Markuse ja Oksana plaanid.', ['Mida Sofia tahab?', 'Mida Markus hakkab tegema?', 'Mida Oksana proovib?', 'Kelle plaan sulle meeldib? Miks?'], [60, 90]),
      B.rolecards('068_p_roles', 'Õppimise nõuanne.', 'A räägib probleemist, B annab nõu. Siis vahetage.',
        'Sul on keeleõppes probleem: sõnad, kuulamine või rääkimine. Räägi sellest.', 'Kuula ja anna kaks nõu: Proovi…! Hakka…!',
        ['Ma ei saa aru…', 'Ma unustan…', 'Mida ma pean tegema?'], ['Proovi …-da!', 'Hakka …-ma!', 'Mina hakkasin ka…']),
      B.writing('068_p_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 5–7 lauset: mida sa hakkad tegema ja mida proovid.', [5, 7], ['hakkan', 'proovin', 'tahan'], 2),
      B.selfcheck('068_p_self', ['Ma valin ma- või da-vormi õigesti.', 'Ma saan aru teiste õppimise plaanist.', 'Ma parandan vea: hakkan lugeda → hakkan lugema.', 'Ma annan sõbrale nõu.'], 'Vormid on selged'),
    ],
    transfer: [
      B.text('068_t_situation', 'Uus olukord', 'Sinu naaber Viktor on pensionär. Ta tahab hakata eesti keelt õppima, aga ta ei tea, kust alustada. Aega tal on, aga raha on vähe. Raamatukogus on uus kuulutus. Aita Viktoril valida ja teha eesmärkide kaart.'),
      B.reading('068_t_ad', 'Loe raamatukogu kuulutust.', 'Loe kuulutust ja vasta küsimustele.', 'Õpi eesti keelt raamatukogus!',
        'Tartu linnaraamatukogu kutsub kõiki eesti keelt õppima! Esmaspäeviti kell 18 on keelekohvik. Seal saab rääkida eestlastega ja proovida uusi sõnu. Keelekohvik on tasuta. Kolmapäeviti kell 17 on raamatuklubi algajatele. Me loeme koos lühikesi raamatuid ja räägime neist. Raamatu saad raamatukogust. Reedeti kell 16 on filmiõhtu. Filmid on eesti keeles, eesti subtiitritega. Kui sa tahad õppida kodus, proovi meie veebikursust. Seal on igal nädalal uued harjutused. Veebikursus maksab 10 eurot kuus. Kõikidele üritustele tuleb registreeruda. Registreeru infoletis või telefonil. Tule ja hakka julgelt rääkima!',
        [['Mis päeval on keelekohvik?', 'esmaspäeviti|esmaspäeval'], ['Kui palju keelekohvik maksab?', 'tasuta|see on tasuta'], ['Kellele on raamatuklubi?', 'algajatele'], ['Mis keeles on filmide subtiitrid?', 'eesti keeles'], ['Kui palju maksab veebikursus?', '10 eurot kuus|kümme eurot kuus|10 eurot'], ['Kus saab registreeruda?', 'infoletis või telefonil|infoletis|telefonil']]),
      B.choice('068_t_choice', 'Mis sobib?', 'Vali igale inimesele sobiv võimalus.', [
        ['Viktor tahab rääkida, aga tal pole raha.', 'keelekohvik', 'veebikursus', 'filmiõhtu'], ['Liis armastab lugeda.', 'raamatuklubi', 'keelekohvik', 'filmiõhtu'],
        ['Jaan töötab õhtuti ja tahab õppida kodus.', 'veebikursus', 'raamatuklubi', 'keelekohvik'], ['Kati tahab vaadata filme eesti keeles.', 'filmiõhtu', 'raamatuklubi', 'veebikursus'],
        ['Olga on vaba ainult kolmapäeval.', 'raamatuklubi', 'keelekohvik', 'filmiõhtu'],
      ], 'full', 'g_read'),
      B.transformation('068_t_trans', 'Viktori plaan.', 'Kirjuta lause antud sõnaga.', [
        ['Viktor räägib naabritega.', 'hakkab', 'Viktor hakkab naabritega rääkima.'], ['Ta loeb raamatut.', 'proovib', 'Ta proovib raamatut lugeda.'], ['Ta mõistab uudiseid.', 'tahab', 'Ta tahab uudiseid mõista.'],
        ['Ta käib keelekohvikus.', 'hakkab', 'Ta hakkab keelekohvikus käima.'], ['Ta vaatab filme eesti keeles.', 'proovib', 'Ta proovib filme eesti keeles vaadata.|Ta proovib vaadata filme eesti keeles.'],
      ]),
      B.errorfix('068_t_fix', 'Kontrolli Viktori sõnumit.', 'Viktori sõnumis on vead. Kirjuta lause õigesti.', [
        ['Ma hakkan õppida eesti keelt.', 'Ma hakkan eesti keelt õppima.|Ma hakkan õppima eesti keelt.'], ['Ma tahan naabritest aru saama.', 'Ma tahan naabritest aru saada.'], ['Me proovime iga päev kirjutama.', 'Me proovime iga päev kirjutada.'],
        ['Kas sa hakkad raamatuklubis käia?', 'Kas sa hakkad raamatuklubis käima?'], ['Ma tahan eksam sooritada.', 'Ma tahan eksami sooritada.'],
      ]),
      B.translation('068_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я начну ходить в языковое кафе.', 'Попробуй читать короткие книги.', 'Он хочет понимать соседей.', 'Это бесплатно.', 'Моя цель — сдать экзамен.']),
      B.table('068_t_card', 'Viktori eesmärkide kaart.', 'Täida kaart Viktori jaoks.', 'Küsimus, Viktori vastus', ['Mis on eesmärk? | ', 'Mida ta hakkab tegema? | ', 'Mida ta proovib? | ', 'Kui tihti? | ', 'Kuidas ta kontrollib, et õppimine aitab? | ']),
      B.planning('068_t_plan', 'Enne kirja.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mida Viktor tahab?', 'Mis võimalus talle sobib ja miks?', 'Mida ta hakkab tegema ja kui tihti?', 'Mida ta proovib?']),
      B.letter('068_t_letter', 'Kiri Viktorile.', 'Kirjuta Viktorile 40–60 sõna: mis talle sobib ja miks.', 'Tere, Viktor!', 'Edu!', [40, 60]),
      B.writing('068_t_goal', 'Minu eesmärkide kaart.', 'Kirjuta oma eesmärgid 6–8 lausega: tahan, hakkan, proovin.', [6, 8], ['tahan', 'hakkan', 'proovin', 'eesmärk'], 3),
      B.speaking('068_t_say', 'Räägi grupile.', 'Räägi grupile oma eesmärgist ja plaanist 1–2 minutit.', ['Mis on sinu eesmärk?', 'Mida sa hakkad tegema?', 'Mida sa proovid?', 'Kuidas sa kontrollid?'], [60, 120]),
      B.rubric('068_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas Viktorile on valik ja põhjus (sest…).', 'tahan / proovin + da ja hakkan + ma on õiged.', 'Eesmärgid on konkreetsed: mida, millal, kui tihti.', 'Suuline plaan on selge ja kestab umbes minuti.']),
      B.selfcheck('068_t_self', ['Ma leian kuulutusest õppimise võimalused.', 'Ma valin sõbrale sobiva võimaluse ja põhjendan.', 'Ma kirjutan oma eesmärgid.', 'Ma räägin grupile oma plaanist.'], 'Plaan on tehtud'),
    ],
  },

  'a2-069': {
    title: 'Minu keeleõppe plaan',
    canDo: 'Ma kirjutan oma kahe nädala keeleõppe plaani 80–100 sõnaga ja kasutan vähemalt viit ajamarkerit (iga päev, kaks korda nädalas…).',
    discover: [
      B.text('069_d_situation', 'Oksana plaan', 'Oksana õpib eesti keelt juba pool aastat. Lugemisest saab ta hästi aru, aga rääkimine on raske. Kahe nädala pärast on tal tööintervjuu eesti keeles. Oksana teeb endale plaani.'),
      B.truefalse('069_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Oksana õpib eesti keelt kaks kuud.', false], ['Lugemine on Oksanale lihtsam kui rääkimine.', true], ['Oksanal on varsti tööintervjuu.', true], ['Intervjuu on vene keeles.', false], ['Oksana teeb õppimiseks plaani.', true],
      ]),
      B.vocab('069_d_vocab', 'Plaani sõnad', ['plaan — план', 'eesmärk — цель', 'harjutama — тренировать', 'kordama — повторять', 'iga päev — каждый день', 'kaks korda nädalas — два раза в неделю', 'kõige raskem — самое трудное', 'paremini — лучше', 'hääldus — произношение', 'sõnavara — словарный запас', 'salvestama — записывать', 'kontrollima — проверять']),
      B.reading('069_d_read', 'Loe: Oksana plaan.', 'Loe plaani ja vasta küsimustele.', 'Minu kahe nädala plaan',
        'Minu eesmärk: kahe nädala pärast räägin tööintervjuul julgelt eesti keeles. Kõige raskem on minu jaoks rääkimine. Lugemine ja kirjutamine on lihtsamad. Seepärast tahan rohkem rääkida. Iga päev kordan kümme uut sõna. Hommikul bussis kuulan eesti raadiot kümme minutit. Kaks korda nädalas, teisipäeval ja reedel, räägin naabri Katiga eesti keeles. Me joome koos kohvi ja ta küsib minult intervjuu küsimusi. Igal õhtul loen ühe lühikese uudise. Siis räägin valjusti, millest see on. Nädalavahetusel salvestan oma häält telefoni. Ma kuulan, kuidas ma hääldan. Pühapäeval kontrollin, mida ma tegin. Kui ma ei teinud kõike, ma ei muretse, vaid jätkan. Pärast kahte nädalat tahan rääkida paremini ja kiiremini.',
        [['Mis on Oksana eesmärk?', 'rääkida intervjuul julgelt eesti keeles|rääkida intervjuul eesti keeles'], ['Miks tahab Oksana rohkem rääkida?', 'rääkimine on kõige raskem|see on kõige raskem'], ['Mida teeb Oksana iga päev?', 'kordab kümme sõna|kordab sõnu'], ['Kellega ja kui tihti räägib Oksana eesti keeles?', 'Katiga kaks korda nädalas|naabriga kaks korda nädalas|Katiga'], ['Miks salvestab Oksana oma häält?', 'et kuulata, kuidas ta hääldab|et kontrollida hääldust'], ['Mida teeb Oksana, kui ta ei teinud kõike?', 'ei muretse ja jätkab|jätkab']]),
      B.crossword('069_d_words', 'Plaani sõnad.', 'Kirjuta sõnad vihjete järgi.', [
        ['Mida sa tahad saavutada?', 'eesmärk'], ['Kuidas sa sõnu ütled.', 'hääldus'], ['Kõik sõnad, mida sa tead.', 'sõnavara'], ['Õpid uuesti, et mitte unustada.', 'kordama'], ['Paberil on kirjas, mida ja millal teed.', 'plaan'],
      ]),
      B.table('069_d_find', 'Leia tekstist.', 'Kirjuta tekstist ajamarker.', 'Kui tihti või millal?, Mida Oksana teeb?', [
        '[iga päev] | kordab kümme uut sõna', '[hommikul bussis/hommikul] | kuulab raadiot', '[kaks korda nädalas] | räägib Katiga', '[igal õhtul] | loeb uudise', '[nädalavahetusel] | salvestab oma häält', '[pühapäeval] | kontrollib, mida tegi',
      ], 'g_notice'),
      B.notice('069_d_notice', 'Märka: plaani laused', [
        '**tahan** + da: tahan **rääkida**, tahan **õppida**', '**pean / hakkan** + ma: pean **kordama**, hakkan **lugema**', '**iga päev**, **igal õhtul**, **kaks korda nädalas**, **nädalavahetusel**', '**Kõige raskem** on…, tahan rääkida **paremini**',
      ], 'full'),
      B.categorize('069_d_sort', 'Kui tihti?', 'Sorteeri ajamarkerid.', [
        ['Väga tihti', ['iga päev', 'igal hommikul', 'igal õhtul']], ['Mõnikord', ['kaks korda nädalas', 'nädalavahetusel', 'esmaspäeviti']], ['Harva', ['kord kuus', 'kord aastas']],
      ], 'full', 'g_vocab'),
      B.gaps('069_d_gaps', 'Tahan, pean või hakkan?', 'Kirjuta tegusõna õiges vormis.', [
        'Ma tahan paremini [rääkida] (rääkima).', 'Ma pean iga päev sõnu [kordama] (kordama).', 'Ma hakkan õhtuti uudiseid [lugema] (lugema).', 'Ma tahan eesti filme [vaadata] (vaatama).', 'Ma tahan iga päev raadiot [kuulata] (kuulama).', 'Ma pean rohkem [harjutama] (harjutama).',
      ]),
      B.choice('069_d_choice', 'Mis on hea plaan?', 'Vali kõige konkreetsem lause.', [
        ['Eesmärk', 'Kahe nädala pärast tutvustan ennast intervjuul.', 'Ma tahan eesti keelt hästi osata.', 'Eesti keel on ilus keel.'],
        ['Sõnad', 'Iga päev kordan kümme uut sõna.', 'Vahel õpin natuke sõnu.', 'Sõnad on väga tähtsad.'],
        ['Rääkimine', 'Kaks korda nädalas räägin Katiga.', 'Ma räägin vahel kellegagi.', 'Rääkimine on kõige raskem.'],
        ['Kuulamine', 'Igal hommikul kuulan bussis raadiot.', 'Ma kuulan, kui aega on.', 'Kuulamine on huvitav.'],
        ['Kontroll', 'Pühapäeval kontrollin, mida tegin.', 'Ma loodan, et kõik läheb hästi.', 'Ma ei kontrolli midagi.'],
      ], 'full', 'g_read'),
      B.wordorder('069_d_order', 'Pane plaan kokku.', 'Kirjuta laused õigesti.', [
        'Iga päev kordan kümme uut sõna.', 'Igal õhtul loen ühe lühikese uudise.', 'Kaks korda nädalas räägin Katiga.', 'Nädalavahetusel salvestan oma häält.', 'Kõige raskem on minu jaoks rääkimine.',
      ]),
      B.errorfix('069_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma tahan rääkima paremini.', 'Ma tahan paremini rääkida.|Ma tahan rääkida paremini.'], ['Ma pean kordada sõnad.', 'Ma pean sõnu kordama.|Ma pean sõnad kordama.'], ['Iga päeval ma loen.', 'Iga päev ma loen.|Iga päev loen ma.'], ['Kaks kord nädalas ma räägin.', 'Kaks korda nädalas ma räägin.|Kaks korda nädalas räägin ma.'], ['Ma hakkan lugeda uudiseid.', 'Ma hakkan uudiseid lugema.|Ma hakkan lugema uudiseid.'],
      ]),
      TR('069_d_tr', ['Каждый день я повторяю десять слов.', 'Два раза в неделю я говорю с соседкой.', 'Самое трудное — говорение.', 'Я хочу говорить лучше.', 'В воскресенье я проверяю план.']),
      D('069_d_dict', ['Iga päev kordan sõnu.', 'Igal õhtul loen uudise.', 'Kõige raskem on rääkimine.', 'Ma tahan rääkida paremini.', 'Pühapäeval kontrollin plaani.']),
      B.speaking('069_d_say', 'Kuidas sina õpid?', 'Räägi paarilisele, kuidas sa praegu eesti keelt õpid.', ['Mida sa teed iga päev?', 'Mida sa teed kaks korda nädalas?', 'Mis on sinu jaoks kõige raskem?'], [60, 120]),
      B.writing('069_d_write', 'Minu esimene plaan.', 'Kirjuta 6–8 lauset: mida ja kui tihti sa järgmisel nädalal õpid.', [6, 8], ['iga päev', 'kaks korda nädalas', 'tahan', 'pean'], 3),
      B.selfcheck('069_d_self', ['Ma leian tekstist ajamarkerid.', 'Ma tean: tahan + da, pean / hakkan + ma.', 'Ma eristan konkreetset ja üldist plaani.', 'Ma kirjutan oma esimese plaani.'], 'Plaan on alanud'),
    ],
    practice: [
      B.match('069_p_recall', 'Mäletad Oksana plaani?', 'Ühenda aeg ja tegevus.', [
        ['iga päev', 'kordab kümme sõna'], ['hommikul bussis', 'kuulab raadiot'], ['kaks korda nädalas', 'räägib Katiga'], ['igal õhtul', 'loeb uudise'], ['nädalavahetusel', 'salvestab oma häält'], ['pühapäeval', 'kontrollib plaani'],
      ], 'full', 'g_read'),
      B.wordforms('069_p_forms', 'Ma- või da-vorm?', 'Kirjuta tegusõna õiges vormis.', [
        ['lugema', 'tahan …', 'lugeda'], ['kuulama', 'pean …', 'kuulama'], ['vaatama', 'tahan …', 'vaadata'], ['kirjutama', 'hakkan …', 'kirjutama'], ['harjutama', 'tahan …', 'harjutada'], ['õppima', 'hakkan …', 'õppima'],
      ]),
      B.gaps('069_p_gaps', 'Kui tihti?', 'Täida lüngad. Kaks sõna jääb üle.', [
        'Ma kordan sõnu [iga] päev.', 'Ma räägin Sofiaga kaks [korda] nädalas.', '[Igal] õhtul loen uudiseid.', '[Nädalavahetusel] vaatan eesti filmi.', 'Test on [kord] kuus.', 'Ma käin tunnis [esmaspäeviti].',
      ], ['iga', 'igal', 'korda', 'kord', 'nädalavahetusel', 'nädalavahetus', 'esmaspäeviti', 'esmaspäev']),
      B.reading('069_p_read', 'Loe: Sergei plaan.', 'Loe tekst ja vasta küsimustele.', 'Sergei plaan',
        'Sergei elab Narvas ja töötab bussijuhina. Ta tahab teha A2 eksami juuni alguses. Tal on vähe aega, sest ta töötab vahetustega. Seepärast tegi ta väga lihtsa plaani. Tööpäevadel kuulab ta bussis pausi ajal eesti raadiot. Pärast tööd õpib ta veerand tundi uusi sõnu telefonis. Kaks korda nädalas käib ta õhtul keelekursusel. Kõige raskem on talle kirjutamine. Seepärast kirjutab ta igal laupäeval ühe lühikese kirja oma õpetajale. Õpetaja parandab vead ja saadab kirja tagasi. Pühapäeval Sergei puhkab ja ei õpi üldse. Iga kuu lõpus teeb ta proovitesti internetis. Viimases testis sai ta seitsekümmend punkti sajast.',
        [['Miks on Sergeil vähe aega?', 'ta töötab vahetustega'], ['Mida teeb Sergei pausi ajal?', 'kuulab raadiot|kuulab eesti raadiot'], ['Kui kaua õpib ta pärast tööd sõnu?', 'veerand tundi|15 minutit'], ['Mis on Sergeile kõige raskem?', 'kirjutamine'], ['Mida ta selle vastu teeb?', 'kirjutab igal laupäeval kirja õpetajale|kirjutab kirja õpetajale'], ['Kui tihti teeb Sergei proovitesti?', 'kord kuus|iga kuu lõpus']]),
      B.transformation('069_p_trans', 'Tee plaan konkreetseks.', 'Kirjuta lause antud sõnadega.', [
        ['Ma õpin vahel sõnu.', 'iga päev, kümme sõna', 'Iga päev õpin kümme sõna.|Ma õpin iga päev kümme sõna.'],
        ['Ma kuulan mõnikord raadiot.', 'igal hommikul', 'Igal hommikul kuulan raadiot.|Ma kuulan igal hommikul raadiot.'],
        ['Ma räägin kellegagi eesti keeles.', 'kaks korda nädalas, Kati', 'Kaks korda nädalas räägin Katiga eesti keeles.|Ma räägin kaks korda nädalas Katiga eesti keeles.'],
        ['Ma tahan paremini kirjutada.', 'hakkan, igal õhtul', 'Igal õhtul hakkan kirjutama.|Ma hakkan igal õhtul kirjutama.'],
        ['Ma loen midagi eesti keeles.', 'nädalavahetusel, uudised', 'Nädalavahetusel loen eesti keeles uudiseid.|Nädalavahetusel loen uudiseid eesti keeles.'],
      ]),
      B.errorfix('069_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma tahan õppima eesti keelt.', 'Ma tahan eesti keelt õppida.|Ma tahan õppida eesti keelt.'], ['Igal laupäev ma kirjutan kirja.', 'Igal laupäeval kirjutan kirja.|Igal laupäeval ma kirjutan kirja.'], ['Ma pean rohkem harjutada.', 'Ma pean rohkem harjutama.'], ['Ma hakkan õppida iga päev.', 'Ma hakkan iga päev õppima.|Ma hakkan õppima iga päev.'], ['Ma tahan rääkida parem.', 'Ma tahan paremini rääkida.|Ma tahan rääkida paremini.'],
      ]),
      B.wordorder('069_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Pärast tööd õpin veerand tundi sõnu.', 'Igal laupäeval kirjutan õpetajale kirja.', 'Kõige raskem on mulle kirjutamine.', 'Pühapäeval ma puhkan.', 'Iga kuu lõpus teen proovitesti.',
      ]),
      TR('069_p_tr', ['Я хочу сдать экзамен в июне.', 'После работы я учу слова пятнадцать минут.', 'Каждую субботу я пишу письмо.', 'В воскресенье я отдыхаю.', 'Я начну читать новости.']),
      D('069_p_dict', ['Ma tahan teha eksami.', 'Pärast tööd õpin sõnu.', 'Igal laupäeval kirjutan kirja.', 'Õpetaja parandab vead.', 'Ma hakkan uudiseid lugema.']),
      B.planning('069_p_plan', 'Minu plaani mustand.', 'Kirjuta märksõnad.', ['Mis on minu eesmärk?', 'Mis on kõige raskem?', 'Mida teen iga päev?', 'Mida teen kaks korda nädalas?', 'Kuidas ma kontrollin?']),
      B.writing('069_p_write', 'Minu kahe nädala plaan.', 'Kirjuta 6–8 lauset. Kasuta vähemalt viit ajamarkerit.', [6, 8], ['iga päev', 'kaks korda nädalas', 'tahan', 'pean', 'kõige raskem'], 4),
      B.speaking('069_p_say', 'Võrdle plaane.', 'Räägi paarilisele oma plaanist. Paariline küsib.', ['Mis on sinu eesmärk?', 'Mida sa teed iga päev?', 'Kuidas sa kontrollid?'], [60, 90]),
      B.selfcheck('069_p_self', ['Ma valin õige vormi: tahan õppida, hakkan õppima.', 'Ma kasutan ajamarkereid õigesti.', 'Ma muudan üldise lause konkreetseks.', 'Ma kirjutan plaani mustandi.'], 'Plaan on valmis'),
    ],
    transfer: [
      B.text('069_t_situation', 'Uus olukord', 'Sinu sõbranna Jelena alustab kuu aja pärast uut tööd. Tööl peab ta eesti keelt rääkima. Tal on päevas ainult 20 minutit aega. Aita tal plaan teha.'),
      B.listening('069_t_listen', 'Jelena häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Jelena siin. Mul on üks palve.',
        'Ma alustan uuel töökohal esimesel novembril. Tööl räägivad kõik eesti keelt.',
        'Kõige raskem on mulle kuulamine. Inimesed räägivad nii kiiresti!',
        'Lugemine on lihtsam, ma loen iga päev uudiseid.',
        'Mul on kaks väikest last, seega vaba aega on vähe. Päevas on mul umbes kakskümmend minutit.',
        'Õhtul kella üheksast pool kümneni saan õppida.',
        'Kas sa saaksid mulle plaani teha? Kirjuta mulle e-kiri. Aitäh!',
      ], ['Jelena alustab uut tööd [novembris|esimesel novembril|1. novembril].', 'Talle on kõige raskem [kuulamine].', 'Iga päev loeb Jelena [uudiseid].', 'Jelenal on kaks väikest [last].', 'Päevas on tal umbes [kakskümmend|20] minutit.', 'Ta saab õppida [õhtul|õhtuti].']),
      B.gaps('069_t_gaps', 'Jelena plaan.', 'Täida plaan sobivate sõnadega. Kolm sõna jääb üle.', [
        '[Iga] päev kuulan bussis eesti raadiot.', 'Tööl [tahan] kolleegidega rohkem rääkida.', 'Õhtul [pean] kümme uut sõna kordama.', '[Kaks] korda nädalas vaatan eesti saadet.', 'Kõige [raskem] on kuulamine.', 'Kahe nädala pärast [saan] paremini aru.',
      ], ['iga', 'igal', 'tahan', 'pean', 'kaks', 'kord', 'raskem', 'raske', 'saan']),
      B.errorfix('069_t_fix', 'Paranda Jelena plaani.', 'Kirjuta lause õigesti.', [
        ['Iga õhtul ma kuulan raadiot.', 'Igal õhtul kuulan raadiot.|Igal õhtul ma kuulan raadiot.'], ['Ma tahan kuulama paremini.', 'Ma tahan paremini kuulata.|Ma tahan kuulata paremini.'], ['Ma pean vaadata eesti saateid.', 'Ma pean eesti saateid vaatama.|Ma pean vaatama eesti saateid.'], ['Kaks korda nädal ma räägin.', 'Kaks korda nädalas ma räägin.|Kaks korda nädalas räägin ma.'], ['Kõige raskem on kuulamise.', 'Kõige raskem on kuulamine.'],
      ]),
      B.wordorder('069_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Jelenal on päevas ainult kakskümmend minutit.', 'Igal õhtul kuulab ta eesti raadiot.', 'Nädalavahetusel vaatab ta eesti filmi.', 'Pühapäeval kontrollib ta oma plaani.', 'Kahe nädala pärast saab ta paremini aru.',
      ]),
      TR('069_t_tr', ['У меня мало свободного времени.', 'Каждый вечер я слушаю радио.', 'В выходные я смотрю эстонский фильм.', 'Через две недели я буду лучше понимать.', 'Самое трудное для меня — аудирование.']),
      D('069_t_dict', ['Mul on vähe aega.', 'Igal õhtul kuulan raadiot.', 'Kõige raskem on kuulamine.', 'Ma kordan kümme sõna.', 'Pühapäeval kontrollin plaani.']),
      B.planning('069_t_plan', 'Plaan Jelenale.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis on Jelena eesmärk?', 'Mida ta teeb iga päev?', 'Mida ta teeb nädalavahetusel?', 'Kuidas ta kuulamist harjutab?', 'Kuidas ta kontrollib?']),
      B.letter('069_t_letter', 'E-kiri Jelenale.', 'Kirjuta Jelenale kahe nädala plaan. Kasuta vähemalt viit ajamarkerit.', 'Tere, Jelena!', 'Edu sulle!', [80, 100]),
      B.rolecards('069_t_roles', 'Arutage plaani.', 'Rääkige 2–3 minutit.',
        'Sa oled Jelena. Ütle, mis on raske ja kui palju aega sul on.', 'Sa aitad Jelenat. Paku kolm konkreetset tegevust ja ajamarkerit.',
        ['Kõige raskem on…', 'Mul on ainult…', 'See on hea mõte.'], ['Iga päev võiksid…', 'Kaks korda nädalas…', 'Kuidas oleks, kui…?']),
      B.speaking('069_t_mono', 'Minu eesmärk.', 'Räägi 1–2 minutit oma keeleõppe eesmärgist ja plaanist.', ['Mis on sinu eesmärk?', 'Mis on sinu jaoks kõige raskem?', 'Mida sa teed iga päev?', 'Kuidas sa kontrollid, et läheb hästi?'], [60, 120]),
      B.rubric('069_t_rubric', 'Kontrolli oma kirja.', 'Märgi, mis on olemas.', ['Kirjas on eesmärk.', 'Kirjas on vähemalt viis ajamarkerit.', 'Iga tegevus on konkreetne: mida, millal, kui kaua.', 'Kirjas on kontroll: kuidas Jelena teab, et läheb hästi.', 'Kirjas on 80–100 sõna.']),
      B.selfcheck('069_t_self', ['Ma oskan kasutada plaani sõnu: eesmärk, harjutama, kordama.', 'Ma oskan häälsõnumist leida, mis on raske ja kui palju on aega.', 'Ma oskan kasutada tahan + da ja pean + ma plaanis.', 'Ma oskan kirjutada 80–100-sõnalise plaani viie ajamarkeriga.'], 'Plaan Jelenale'),
    ],
  },

  'a2-070': {
    title: 'Kontroll 14 — õppimine ja keel',
    canDo: 'Ma näitan kontrollis, et saan aru tunniplaanist ja õpetaja juhistest, küsin ise, kui ei saa aru, ja kirjutan oma õppeplaani (vähemalt 70%).',
    discover: [
      B.text('070_d_situation', 'Kordamine: kursuse viimane nädal', 'Anna kursus lõpeb. Viimasel nädalal on kordamine ja kontroll. Õpetaja Liis annab juhiseid kiiresti. Anna ei saa kõigest aru, aga nüüd ta teab, kuidas küsida.'),
      B.truefalse('070_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Anna kursus algab.', false], ['Viimasel nädalal on kontroll.', true], ['Õpetaja räägib aeglaselt.', false], ['Anna saab kõigest aru.', false], ['Anna teab, kuidas küsida.', true],
      ]),
      B.reading('070_d_read', 'Loe: Anna kursus.', 'Loe teksti ja vasta küsimustele.', 'Kolm kuud kursusel',
        'Anna käis kolm kuud eesti keele kursusel. Tunnid olid kaks korda nädalas, esmaspäeviti ja kolmapäeviti. Rühmas oli kaheksa õpilast. Nende emakeeled olid vene, ukraina, inglise ja hispaania keel. Alguses oli Annal raske. Ta ei saanud õpetajast aru ja kartis küsida. Siis õppis ta kolm lauset: „Palun korrake!”, „Mida see sõna tähendab?” ja „Kas te saaksite aeglasemalt rääkida?” Nüüd küsib ta julgelt. Anna puudus tunnist ainult kaks korda, sest ta oli haige. Pausil rääkisid õpilased omavahel eesti keeles. Kodus hakkas Anna iga päev lugema. Ta proovis ka sõnaraamatut vähem kasutada. Kursuse lõpus on test. Kui Anna saab hea hinde, saab ta tunnistuse. Järgmisel aastal tahab ta ülikoolis õppida.',
        [['Kui kaua Anna kursusel käis?', 'kolm kuud|3 kuud'], ['Mitu õpilast oli rühmas?', 'kaheksa|8'], ['Mida Anna alguses kartis?', 'küsida|ta kartis küsida'], ['Miks Anna kaks korda puudus?', 'ta oli haige|sest ta oli haige'], ['Mis keeles rääkisid õpilased pausil?', 'eesti keeles'], ['Mida Anna saab, kui test läheb hästi?', 'tunnistuse|tunnistus']]),
      B.notice('070_d_notice', 'Mooduli kokkuvõte', [
        'Kursus: **kursusel, kursusele, kursuselt**; **esmaspäeviti, kaks korda nädalas**', 'Ma ei saa aru: **Palun korrake! Mida see sõna tähendab? Kas te saaksite aeglasemalt rääkida?**', 'Palve: **korda — korrake, räägi — rääkige**', 'Infinitiiv: **tahan / proovin + da**, **pean / hakkan + ma**', 'Plaan: **iga päev, kaks korda nädalas, kuu pärast**',
      ], 'full'),
      B.dialogue('070_d_dialog', 'Tunnis.', 'Täida õpetaja ja Anna vestlus.', 'Õpetaja', 'Anna', [
        ['A', 'Palun tehke harjutus kolm leheküljel kakskümmend.'], ['B', 'Vabandust, palun [korrake]! Mis leheküljel?'], ['A', 'Leheküljel kakskümmend.'], ['B', 'Aitäh. Mida see sõna „tunnistus” [tähendab]?'],
        ['A', 'See on paber, mille saad kursuse lõpus.'], ['B', 'Selge. Kas te [saaksite] natuke aeglasemalt [rääkida]?'], ['A', 'Muidugi. Kas nüüd on [selge]?'], ['B', 'Jah, nüüd ma saan [aru]. Aitäh!'],
      ]),
      B.manymatch('070_d_strategy', 'Mida küsida?', 'Ühenda probleem ja küsimus.', ['Sa ei kuulnud hästi.', 'Õpetaja räägib liiga kiiresti.', 'Sa ei tea sõna tähendust.', 'Sa ei tea, kuidas üht sõna eesti keeles öelda.', 'Sa tahad näidet.'], ['Palun korrake!', 'Kas te saaksite aeglasemalt rääkida?', 'Mida see sõna tähendab?', 'Kuidas seda eesti keeles öeldakse?', 'Kas te saate näite tuua?'], 'full', 'g_use'),
      B.match('070_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kus sa eesti keelt õpid?', 'Keelekursusel.'], ['Kui tihti tunnid on?', 'Kaks korda nädalas.'], ['Mis su emakeel on?', 'Vene keel.'],
        ['Mitu õpilast on rühmas?', 'Kaheksa.'], ['Mida sa tahad õppida?', 'Ma tahan paremini rääkida.'], ['Mida sa hakkad kodus tegema?', 'Ma hakkan iga päev lugema.'],
      ], 'full', 'g_use'),
      B.gaps('070_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        'Ma lähen [kursusele] kell kuus.', 'Tunnid on [esmaspäeviti] ja kolmapäeviti.', 'Palun [korrake] aeglaselt!', 'Ma tahan eksami [sooritada].', 'Ma hakkan iga päev [lugema].', 'Mida see sõna [tähendab]?',
      ], ['kursusele', 'kursusel', 'esmaspäeviti', 'esmaspäev', 'korrake', 'kordama', 'sooritada', 'sooritama', 'lugema', 'lugeda', 'tähendab', 'tähendama']),
      B.wordforms('070_d_forms', 'Palve sina → teie.', 'Kirjuta palve teie-vormis.', [['korda!', 'teie', 'korrake'], ['räägi!', 'teie', 'rääkige'], ['seleta!', 'teie', 'seletage'], ['kirjuta!', 'teie', 'kirjutage'], ['näita!', 'teie', 'näidake'], ['oota!', 'teie', 'oodake']]),
      B.transformation('070_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma loen iga päev.', 'hakkan', 'Ma hakkan iga päev lugema.'], ['Ma räägin eesti keeles.', 'proovin', 'Ma proovin eesti keeles rääkida.|Ma proovin rääkida eesti keeles.'], ['Korda palun!', 'teie', 'Palun korrake!|Korrake palun!'],
        ['Ma käin kursusel.', 'kuhu?', 'Ma lähen kursusele.'], ['Ma õpin iga päev 20 minutit.', 'pean', 'Ma pean iga päev 20 minutit õppima.'],
      ]),
      B.errorfix('070_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma tahan õppima ülikoolis.', 'Ma tahan õppida ülikoolis.|Ma tahan ülikoolis õppida.'], ['Palun korda, õpetaja!', 'Palun korrake, õpetaja!'], ['Mida see sõna tähendama?', 'Mida see sõna tähendab?'],
        ['Ma lähen kursusel.', 'Ma lähen kursusele.'], ['Ma hakkan lugeda iga päev.', 'Ma hakkan iga päev lugema.|Ma hakkan lugema iga päev.'],
      ]),
      B.translation('070_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Повторите, пожалуйста!', 'Что значит это слово?', 'Вы не могли бы говорить медленнее?', 'Я хожу на курс два раза в неделю.', 'Я начну читать каждый день.']),
      B.dictation('070_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Palun korrake!', 'Mida see sõna tähendab?', 'Tunnid on kaks korda nädalas.', 'Ma tahan eksami sooritada.', 'Ma hakkan iga päev lugema.']),
      B.speaking('070_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele.', ['Kus ja kui tihti sa eesti keelt õpid?', 'Mida sa teed, kui sa ei saa aru?', 'Mida sa hakkad järgmisel kuul tegema?', 'Mis on sinu eesmärk?'], [60, 120]),
      B.writing('070_d_write', 'Minu kursus.', 'Kirjuta 5–7 lauset oma kursusest või õppimisest.', [5, 7], ['kursusel', 'tunnid', 'tahan', 'hakkan'], 2),
      B.selfcheck('070_d_self', ['Ma mäletan kursuse ja kooli sõnu.', 'Ma küsin, kui ma ei saa aru.', 'Ma kasutan tahan / proovin + da, pean / hakkan + ma.', 'Ma räägin oma õppimisest.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('070_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 14. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: what to say in class
      B.choice('070_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Õpetaja räägib liiga kiiresti. Mida ütled?', 'Kas te saaksite aeglasemalt rääkida?', 'Kas te saaksite kiiremini rääkida?', 'Kas te saaksite mulle helistada?'],
        ['Sa ei tea sõna „hinne” tähendust.', 'Mida tähendab sõna „hinne”?', 'Kus on sõna „hinne”?', 'Kes ütles sõna „hinne”?'],
        ['Sa jääd homme tunnist ära. Mida kirjutad õpetajale?', 'Kahjuks ma puudun homme tunnist.', 'Homme tulen ma tundi varem.', 'Homme on tund väga tore.'],
        ['Sa tuled tundi hiljem. Mida ütled?', 'Vabandust, et ma hilinesin!', 'Head pausi kõigile!', 'Palun korrake kõike!'],
        ['Sa ei kuulnud, mis on kodutöö. Mida küsid?', 'Mis on kodutöö?', 'Kus on minu kodu?', 'Kes on täna kodus?'],
      ], 'full', 'g_use'),
      // reading 2: a timetable notice
      B.reading('070_p_timetable', 'Lugemine 2. Tunniplaan.', 'Loe teadet ja vasta küsimustele.', 'Keelekool „Sõna” — A2 rühm, mai', [
        'Esmaspäev 18.00–19.30 — rääkimine, ruum 12, õpetaja Liis.', 'Kolmapäev 18.00–19.30 — grammatika, ruum 12, õpetaja Liis.', 'Neljapäev 17.00–18.00 — kuulamine arvutiklassis, ruum 5.', 'Laupäev 10.00–12.00 — keelekohvik raamatukogus (tasuta).',
        'Tähelepanu! 15. mail tundi ei ole, sest õpetaja on koolitusel. Selle asemel on tund reedel, 17. mail, kell 18. Proovieksam on 22. mail kell 17 ruumis 5. Võtke kaasa pastakas ja ID-kaart. Sõnaraamatut eksamil kasutada ei tohi. Kui te puudute, andke teada vähemalt päev enne. Pärast proovieksamit saate hinde ja õpetaja tagasiside. Kursuse lõpus saavad kõik õpilased tunnistuse.',
      ], [['Mis ruumis on grammatika?', '12|ruumis 12'], ['Kus on kuulamise tund?', 'arvutiklassis|ruumis 5'], ['Kui palju keelekohvik maksab?', 'tasuta|see on tasuta'], ['Miks 15. mail tundi ei ole?', 'õpetaja on koolitusel'], ['Millal on proovieksam?', '22. mail|22. mail kell 17|kahekümne teisel mail'], ['Mida ei tohi eksamil kasutada?', 'sõnaraamatut']]),
      // reading 3: signs at school
      B.match('070_p_signs', 'Lugemine 3. Kuhu minna?', 'Ühenda soov ja silt.', [
        ['Tahad kodutööd printida.', 'Printer — 1. korrus, 10 senti leht'], ['Tahad laenata raamatut.', 'Raamatukogu — E–R 10–18'], ['Tahad maksta kursuse eest.', 'Kantselei — arved ja tunnistused'],
        ['Tahad teha kuulamisharjutust.', 'Arvutiklass — ruum 5'], ['Tahad pausil kohvi juua.', 'Õpilaste kohvik — 2. korrus'], ['Tahad leida oma õpetajat.', 'Õpetajate tuba — ruum 8'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text
      B.reading('070_p_read', 'Lugemine 4. Kuidas keelt õppida?', 'Loe teksti. Vasta lühidalt.', 'Viis nõuannet',
        'Paljud täiskasvanud õpivad eesti keelt. Mõned käivad kursusel, teised õpivad üksi. Mis aitab kõige rohkem? Kõigepealt on vaja selget eesmärki. „Ma tahan õppida eesti keelt” ei ole hea eesmärk. Parem eesmärk on kuu pärast arstiga eesti keeles rääkida. Teiseks on tähtis harjutada iga päev. Viisteist minutit päevas on parem kui kaks tundi üks kord nädalas. Kolmandaks ära karda vigu. Kõik teevad vigu, ka eestlased. Kui sa ei saa aru, küsi uuesti. Eestlased aitavad hea meelega. Neljandaks kasuta keelt päris elus. Räägi poes ja apteegis eesti keeles. Loe kuulutusi ja vaata filme eesti subtiitritega. Ja lõpuks: kiida ennast! Iga uus sõna on väike võit.',
        [['Kui palju võiks iga päev harjutada?', 'viisteist minutit|15 minutit'], ['Kes teevad ka vigu?', 'eestlased|kõik|kõik, ka eestlased'], ['Mis subtiitritega võiks filme vaadata?', 'eesti subtiitritega|eesti'], ['Mida teha iga uue sõna eest?', 'ennast kiita|kiida ennast|kiita ennast']]),
      B.choice('070_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Milline eesmärk on hea?', 'kuu pärast arstiga rääkida', 'lihtsalt eesti keelt õppida', 'kaks tundi korraga õppida'], ['Mis on parem?', 'iga päev natuke', 'üks kord nädalas palju', 'ainult kursusel'],
        ['Mida teha, kui ei saa aru?', 'uuesti küsida', 'vait olla', 'vene keeles rääkida'], ['Kus saab keelt päris elus kasutada?', 'poes ja apteegis', 'ainult klassis', 'ainult kodus'],
        ['Mis on tekstis „väike võit”?', 'iga uus sõna', 'hea hinne', 'uus kursus'],
      ]),
      // reading 5: a letter with 8 option gaps
      B.cloze('070_p_cloze', 'Lugemine 5. Kiri õpetajale.', 'Vali igasse lünka sobiv sõna.', 'Tere, õpetaja Liis!', [
        'Kahjuks ma {*puudun|puudusin|puuduma} homme tunnist, sest mu tütar Mia on haige. Kas te {*saaksite|saate|saama} mulle kodutöö saata?',
        '',
        'Ma tahan grammatikat kodus {*korrata|kordama|kordan}. Järgmisel nädalal hakkan jälle tundides {*käima|käia|käin}.',
        '',
        'Mul on ka küsimus. Mida {*tähendab|tähendama|tähendada} sõna „tunnistus”? Kas me {*saame|saama|saada} selle kursuse lõpus?',
        '',
        'Ma proovin kõik ise {*teha|tegema|teen}. Ootan teie {*vastust|vastus|vastuse}! Lugupidamisega, Oksana',
      ]),
      // listening 1: the teacher's notice
      B.listening('070_p_listen', 'Kuulamine 1. Õpetaja teade.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head õpilased! Mina olen õpetaja Liis. Mul on teile paar teadet.', 'Proovieksam on kahekümne teisel mail kell viis.', 'Eksam kestab kaks tundi.', 'Kõigepealt on lugemine ja kuulamine, siis kirjutamine.',
        'Rääkimine on järgmisel päeval, paaris.', 'Sõnaraamatut kasutada ei tohi.', 'Kodutöö on harjutus neli leheküljel kolmkümmend.',
      ], ['Proovieksam on [22.|kahekümne teisel] mail.', 'Eksam algab kell [viis|5|17].', 'Eksam kestab [kaks|2] tundi.', 'Rääkimine on järgmisel [päeval].', 'Eksamil ei tohi kasutada [sõnaraamatut].', 'Kodutöö on leheküljel [kolmkümmend|30].']),
      // listening 2: registering for a course on the phone
      B.listening('070_p_listen2', 'Kuulamine 2. Registreerimine.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Keelekool Sõna, tere!', '— Tere! Ma tahan registreeruda B1 kursusele.', '— Hea küll. Mis teie nimi on?', '— Jaan Kask.', '— Kas te olete meie koolis varem õppinud?',
        '— Jah, ma lõpetasin A2 kursuse eelmisel kuul.', '— Väga hea. B1 kursus algab neljandal septembril.', '— Mis päevadel on tunnid?', '— Teisipäeviti ja neljapäeviti kell kuus õhtul.',
        '— Kui palju kursus maksab?', '— Kakssada kakskümmend eurot. Õpik on hinna sees.',
      ], ['Jaan tahab registreeruda [B1] kursusele.', 'Jaan lõpetas A2 kursuse eelmisel [kuul].', 'Kursus algab [4. septembril|neljandal septembril].', 'Tunnid on teisipäeviti ja [neljapäeviti].', 'Kursus maksab [220|kakssada kakskümmend] eurot.', 'Hinna sees on [õpik].']),
      B.gaps('070_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma käin [kursusel] (kursus) kaks korda nädalas.', 'Palun [rääkige] (rääkima, teie) aeglasemalt!', 'Ma tahan eksami [sooritada] (sooritama).', 'Ma proovin sõnad meelde [jätta] (jätma).', 'Tunnid on [neljapäeviti] (neljapäev).', 'Mida see sõna [tähendab] (tähendama)?', 'Me hakkame laupäeviti keelekohvikus [käima] (käima).',
      ]),
      B.errorfix('070_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Palun korda, õpetaja Liis!', 'Palun korrake, õpetaja Liis!'], ['Ma tahan õppima ülikoolis.', 'Ma tahan ülikoolis õppida.|Ma tahan õppida ülikoolis.'], ['Ma hakkan rääkida eesti keeles.', 'Ma hakkan eesti keeles rääkima.|Ma hakkan rääkima eesti keeles.'],
        ['Ma lähen kursusel.', 'Ma lähen kursusele.'], ['Tunnid on esmaspäevad.', 'Tunnid on esmaspäeviti.|Tunnid on esmaspäeval.'], ['Kas te saaksite aeglasemalt rääkima?', 'Kas te saaksite aeglasemalt rääkida?'],
      ]),
      B.transformation('070_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Korda palun!', 'teie', 'Korrake palun!|Palun korrake!'], ['Ma loen raamatut.', 'proovin', 'Ma proovin raamatut lugeda.'], ['Ma õpin eesti keelt.', 'hakkan', 'Ma hakkan eesti keelt õppima.'],
        ['Räägi aeglasemalt!', 'Kas te saaksite…?', 'Kas te saaksite aeglasemalt rääkida?'], ['Ma olen kursusel.', 'kuhu?', 'Ma lähen kursusele.'],
      ]),
      B.wordorder('070_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', ['Proovieksam on kahekümne teisel mail.', 'Sõnaraamatut kasutada ei tohi.', 'Kas te saaksite aeglasemalt rääkida?', 'Tunnid on teisipäeviti ja neljapäeviti.', 'Ma tahan registreeruda B1 kursusele.']),
      B.speaking('070_p_say', 'Räägi kuuldust.', 'Räägi paarilisele Jaani uuest kursusest.', ['Mis kursusele Jaan läheb?', 'Millal kursus algab?', 'Mis päevadel on tunnid?', 'Kui palju kursus maksab?'], [45, 90], ['Jaan läheb…', 'Kursus algab…', 'Tunnid on…']),
      B.selfcheck('070_p_self', ['Lugemine: leian tunniplaanist aja, ruumi ja muudatuse.', 'Lugemine: valin kirja lünka õige vormi.', 'Kuulamine: kirjutan õpetaja teatest kuupäeva ja kellaaja.', 'Kuulamine: saan aru registreerimise vestlusest.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('070_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil. Kui sa ei saa ülesandest aru, küsi õpetajalt eesti keeles.'),
      B.notice('070_t_card', 'Kuulutus', ['Keelekohvik „Räägime!” — eesti keel täiskasvanutele', 'Iga laupäev kell 11–13, Tartu raamatukogu, 2. korrus', 'Tasuta, registreerimine pole vajalik', 'Teemad: töö, pere, reisimine, vaba aeg', 'Info: telefon 5321 4567'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('070_t_info', 'Kirjutamine 1. Kutsu sõber.', 'Kutsu sõber keelekohvikusse. Kirjuta: kus, millal, hind ja mida seal tehakse.', 'Tere, Kati!', 'Kohtumiseni!', [25, 40]),
      B.planning('070_t_plan', 'Enne kirja.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis on sinu eesmärk?', 'Mida sa hakkad tegema?', 'Mida sa proovid?', 'Mida sa küsid õpetajalt?']),
      // writing 2: a letter, at least 30 words
      B.letter('070_t_letter', 'Kirjutamine 2. Kiri õpetajale.', 'Kirjuta õpetajale oma õppeplaanist: eesmärk, mida hakkad tegema, üks küsimus.', 'Tere, õpetaja!', 'Lugupidamisega', [30, 50]),
      B.writing('070_t_text', 'Kirjutamine 2 (teine valik). Minu kursus.', 'Kirjuta 4–6 lauset: kus ja kui tihti sa õpid, mis on raske.', [4, 6], ['kursusel', 'tunnid', 'raske'], 2),
      B.table('070_t_form', 'Kursuse registreerimine.', 'Täida keelekooli registreerimisvorm.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Emakeel | ', 'Telefon ja e-post | ', 'Mis tasemel sa oled? | ', 'Mis päevadel saad tundides käia? | ', 'Miks sa õpid eesti keelt? | ']),
      // speaking: getting to know, picture description (task 1), idea card and role play (task 2)
      B.speaking('070_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Mis su emakeel on?', 'Kus ja kui kaua sa eesti keelt õpid?', 'Mis on eesti keeles kõige raskem?'], [45, 60]),
      B.speaking('070_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: klass, raamatukogu või keelekohvik. Kirjelda üks minut.', ['Kus inimesed on?', 'Mida nad teevad?', 'Kes on õpetaja?', 'Mida nad õpivad?'], [60, 90], ['Pildil on…', 'Õpilased…', 'Õpetaja…']),
      B.rolecards('070_t_s1', 'Rääkimine 2. Ideekaart „Õppimine”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: kus õpib, kui tihti, mis on raske, mis aitab, eesmärk.', 'Vasta igale küsimusele 2–3 lausega.',
        ['Kus sa eesti keelt õpid?', 'Mis on sinu jaoks raske?', 'Mis on sinu eesmärk?'], ['Ma käin…', 'Raske on…', 'Ma tahan…']),
      B.rolecards('070_t_s2', 'Rääkimine 2. Rollimäng „Ma ei saa aru”.', 'A on õpetaja, B on õpilane. Siis vahetage.',
        'Oled õpetaja. Anna kiiresti kodutöö juhis: harjutus, lehekülg, tähtaeg. Kasuta üht uut sõna.', 'Oled õpilane. Sa ei saa juhisest aru. Küsi kolm korda, kuni kõik on selge.',
        ['Kodutöö on…', 'Tähtaeg on…', 'Kas nüüd on selge?'], ['Palun korrake!', 'Mida see sõna tähendab?', 'Kas te saaksite aeglasemalt rääkida?']),
      B.rubric('070_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Plaanis on eesmärk ja tegevused (tahan, hakkan, proovin).', 'Rollimängus küsib õpilane ise, kuni juhis on selge.', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 30–50 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('070_t_self', ['Ma kirjutan kuulutuse järgi sõbrale kutse.', 'Ma kirjutan õpetajale oma õppeplaani.', 'Ma küsin ise, kui ma juhisest aru ei saa.', 'Ma räägin oma õppimisest ideekaardi järgi.'], 'Moodul 14 on tehtud'),
    ],
  },
};
