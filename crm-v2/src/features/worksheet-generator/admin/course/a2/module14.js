// A2 course (A1 → A2 roadmap), module 14 „Õppimine, kool ja keel”, stage A2. New lessons a2-066, a2-067, a2-069
// (the other lessons of the module are already published). All three phases: Avasta → Harjuta → Kasuta.
// The course and the timetable (kus? kuhu? kust? with study words, esmaspäeviti, kaks korda nädalas), asking for help
// in Estonian (käskiv kõneviis sina / teie, „Kas te saaksite…?”) and a two-week study plan (tahan + da, pean / hakkan
// + ma, frequency markers). Cast: Anna, Viktor, Liis, Markus, Sofia, Jaan.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-14', course: 'a2', title: 'Õppimine, kool ja keel', level: 'A2' };

const TR = (id, rows) => B.translation(id, 'Tõlgi.', 'Kirjuta eesti keeles.', rows);
const D = (id, rows) => B.dictation(id, 'Etteütlus.', 'Kuula ja kirjuta laused.', rows);

export const LESSONS = {
  'a2-066': {
    title: 'Õppimine ja kursus',
    canDo: 'Ma räägin oma eesti keele kursusest vähemalt kuue lausega: kus ja millal on tunnid, mida me teeme ja miks ma õpin.',
    discover: [
      B.text('066_d_situation', 'Uus kursus', 'Anna kolis Tartusse. Ta töötab apteegis ja tahab eesti keelt paremini rääkida. Täna on tema esimene päev keelekursusel. Klassis on kaheksa õpilast. Õpetaja nimi on Tiina.'),
      B.truefalse('066_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Anna elab nüüd Tartus.', true], ['Anna töötab koolis.', false], ['Täna on Anna esimene tund.', true], ['Klassis on kümme õpilast.', false], ['Õpetaja nimi on Tiina.', true],
      ]),
      B.vocab('066_d_vocab', 'Kursuse sõnad', ['kursus — курс', 'tund — урок', 'õpetaja — учитель', 'õpilane — ученик', 'ülesanne — задание', 'kodutöö — домашнее задание', 'test — тест', 'oskus — умение, навык', 'tunniplaan — расписание', 'õpik — учебник', 'harjutama — упражняться', 'kestma — длиться']),
      B.reading('066_d_read', 'Loe: Anna kursus.', 'Loe tekst ja vasta küsimustele.', 'Minu keelekursus',
        'Ma käin eesti keele kursusel kaks korda nädalas. Tunnid on esmaspäeviti ja kolmapäeviti kella kuuest kella poole kaheksani. Kursus toimub keelekoolis kesklinnas. Ma lähen kursusele kohe pärast tööd. Meie õpetaja Tiina räägib tunnis ainult eesti keelt. Alguses oli see raske, aga nüüd saan juba palju aru. Tunnis loeme tekste, kuulame dialooge ja räägime paaris. Kodutöö on tavaliselt kirjutada lühike tekst. Iga kuu lõpus on test. Kõige raskem on minu jaoks kuulamine, sest inimesed räägivad kiiresti. Kõige rohkem meeldib mulle rääkimine. Minu pinginaaber on Viktor. Ta on pärit Ukrainast ja töötab laos. Viktor kirjutab väga hästi, aga räägib vähe. Mina räägin palju, aga teen kirjutades vigu. Nii me aitame teineteist. Kursus kestab neli kuud. Ma õpin eesti keelt, sest tahan tööl klientidega eesti keeles rääkida. Pärast tundi joome Viktoriga vahel kohvi.',
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
        'Anna käib iga nädal [kursusel].', 'Pärast tööd läheb ta [kursusele].', 'Kell pool kaheksa tuleb ta [kursuselt] koju.', 'Viktor on praegu [tunnis].', 'Kas sa tuled homme [tundi]?', 'Liis tuleb [tunnist] hilja koju.',
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
      B.text('066_t_situation', 'Uus olukord', 'Sinu kolleeg Jaan tahab ka eesti keelt õppida. Ta küsib sinu kursuse kohta. Loe keelekooli kuulutust ja aita teda.'),
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
      B.selfcheck('066_t_self', ['Ma oskan kasutada kursuse sõnu uues olukorras.', 'Ma oskan leida kuulutusest aja, hinna ja koha.', 'Ma oskan öelda, kus ja millal tund on: kursusel, tundi, esmaspäeviti.', 'Ma oskan kolleegile oma kursust tutvustada.'], 'Jaan tuleb ka'),
    ],
  },

  'a2-067': {
    title: 'Ma ei saa aru',
    canDo: 'Ma palun abi, kui ma ei saa aru, ja kasutan eesti keeles vähemalt nelja küsimust: palun korrake, mida tähendab…, kuidas öeldakse…, kas saate näite tuua.',
    discover: [
      B.text('067_d_situation', 'Esimene päev tööl', 'Viktor alustab tööd uues laos. Juhataja Liis selgitab tööd väga kiiresti. Viktor saab aru ainult pooltest sõnadest. Ta ei taha rääkida vene keeles. Ta küsib uuesti eesti keeles.'),
      B.truefalse('067_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Viktor on tööl esimest päeva.', true], ['Liis räägib aeglaselt.', false], ['Viktor saab pooltest sõnadest aru.', true], ['Viktor küsib vene keeles.', false], ['Liis on Viktori juhataja.', true],
      ]),
      B.vocab('067_d_vocab', 'Abi küsimise sõnad', ['aru saama — понимать', 'kordama — повторять', 'selgitama — объяснять', 'tähendama — значить', 'näide — пример', 'aeglaselt — медленно', 'valjemini — громче', 'ütlema — сказать', 'kirjutama — писать', 'näitama — показывать']),
      B.reading('067_d_read', 'Loe: Liis ja Viktor laos.', 'Loe dialoogi ja vasta küsimustele.', 'Laos',
        'Liis: Viktor, palun pane need kastid riiulile. Rasked kastid lähevad alla, kerged üles.\nViktor: Vabandust, ma ei saanud aru. Palun korrake aeglasemalt.\nLiis: Muidugi. Rasked kastid pane alumisele riiulile.\nViktor: Mida tähendab „alumine”?\nLiis: Alumine tähendab, et see on all, mitte üleval.\nViktor: Aa, selge. Aga mida ma pärast teen?\nLiis: Pärast kontrolli saatelehte.\nViktor: Kuidas seda sõna kirjutatakse?\nLiis: Saateleht, ühe sõnana. Siin on üks saateleht.\nViktor: Kas te saate näite tuua? Mida ma pean kontrollima?\nLiis: Vaata, siin on kirjas kümme kasti. Loe kastid üle. Kui kaste on kümme, on kõik korras.\nViktor: Nüüd saan aru. Aitäh, et te nii hästi selgitasite!\nLiis: Pole tänu väärt. Küsi alati, kui midagi on segane.',
        [['Kuhu peab Viktor rasked kastid panema?', 'alumisele riiulile|alla'], ['Miks palub Viktor korrata?', 'ta ei saanud aru'], ['Mis sõna Viktor alguses ei tea?', 'alumine'], ['Mida peab Viktor pärast tegema?', 'kontrollima saatelehte|lugema kastid üle'], ['Kuidas Liis näite toob?', 'ta näitab saatelehte|näitab, et seal on kümme kasti'], ['Kas Liis ütleb Viktorile „sina” või „teie”?', 'sina']]),
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
      B.text('067_t_situation', 'Uus olukord', 'Sofia alustab tööd uues kontoris. Kolleeg Markus selgitab talle arvutiprogrammi. Ta räägib kiiresti ja kasutab palju uusi sõnu.'),
      B.reading('067_t_read', 'Loe Sofia kirja.', 'Loe kirja ja vasta küsimustele.', 'Tere, Markus!',
        'Aitäh, et sa mulle täna programmi selgitasid. Kahjuks ma ei saanud kõigest aru, sest sa rääkisid väga kiiresti. Mul on mõned küsimused. Mida tähendab sõna „salvestama”? Kas see on sama mis „save”? Ma ei leidnud ka nuppu „Saada”. Kus see on? Ja kuidas öeldakse eesti keeles „отчёт”? Ma pean homme selle kirjutama. Kas sa saaksid mulle homme hommikul veel kord näidata? Ma tulen tööle kell kaheksa. Kui sul on aega, joome koos kohvi ja sa näitad mulle. Aitäh ette! Sofia',
        [['Miks ei saanud Sofia kõigest aru?', 'Markus rääkis kiiresti|ta rääkis väga kiiresti'], ['Millise sõna tähendust Sofia küsib?', 'salvestama'], ['Mida Sofia ei leidnud?', 'nuppu „Saada”|nuppu Saada|nuppu'], ['Millal peaks Markus uuesti näitama?', 'homme hommikul|homme kell kaheksa'], ['Mida Sofia pakub?', 'koos kohvi juua|kohvi'], ['Kas Sofia kirjutab viisakalt? Miks?', 'jah, ta tänab|jah, ta ütleb aitäh']]),
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
      B.rolecards('067_t_roles', 'Markus selgitab.', 'Rääkige 2–3 minutit. Siis vahetage rollid.',
        'Sa oled Markus. Selgita kiiresti, kuidas printerit kasutada. Kasuta raskeid sõnu.', 'Sa oled Sofia. Kasuta vähemalt nelja küsimust: kordamine, tähendus, sõna, näide.',
        ['Kõigepealt vajuta…', 'Siis vali…', 'Lõpuks…'], ['Palun korda.', 'Mida tähendab…?', 'Kuidas öeldakse…?', 'Kas sa saad näite tuua?']),
      B.letter('067_t_msg', 'Kiri õpetajale.', 'Sa ei saanud kodutööst aru. Kirjuta õpetajale ja küsi kolm küsimust.', 'Tere, õpetaja!', 'Tänan ette!', [30, 50]),
      B.speaking('067_t_mono', 'Minu nõuanded.', 'Räägi 1–2 minutit: mida teha, kui ei saa eesti keelest aru?', ['Kas sa küsid uuesti?', 'Millist küsimust kasutad kõige rohkem?', 'Kas sa kasutad telefoni sõnaraamatut?', 'Mis aitab sind kõige rohkem?'], [60, 120]),
      B.writing('067_t_write', 'Nõuanded uuele õpilasele.', 'Kirjuta 5–7 lauset: kuidas tunnis abi küsida.', [5, 7], ['palun korrake', 'mida tähendab', 'kuidas öeldakse', 'näide'], 3),
      B.selfcheck('067_t_self', ['Ma oskan kasutada abi küsimise sõnu: korrata, tähendab, näide.', 'Ma oskan leida kirjast, mida inimene ei mõistnud.', 'Ma oskan valida sina- või teie-vormi: korda / korrake.', 'Ma oskan vestluses kasutada nelja küsimust ilma vene keeleta.'], 'Ma ei jää vait'),
    ],
  },

  'a2-069': {
    title: 'Minu keeleõppe plaan',
    canDo: 'Ma kirjutan oma kahe nädala keeleõppe plaani 80–100 sõnaga ja kasutan vähemalt viit ajamarkerit (iga päev, kaks korda nädalas…).',
    discover: [
      B.text('069_d_situation', 'Liisi plaan', 'Liis õpib eesti keelt juba kaks aastat. Lugemisest saab ta hästi aru, aga rääkimine on raske. Kahe nädala pärast on tal tööintervjuu eesti keeles. Liis teeb endale plaani.'),
      B.truefalse('069_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Liis õpib eesti keelt kaks kuud.', false], ['Lugemine on Liisile lihtsam kui rääkimine.', true], ['Liisil on varsti tööintervjuu.', true], ['Intervjuu on vene keeles.', false], ['Liis teeb õppimiseks plaani.', true],
      ]),
      B.vocab('069_d_vocab', 'Plaani sõnad', ['plaan — план', 'eesmärk — цель', 'harjutama — тренировать', 'kordama — повторять', 'iga päev — каждый день', 'kaks korda nädalas — два раза в неделю', 'kõige raskem — самое трудное', 'paremini — лучше', 'hääldus — произношение', 'sõnavara — словарный запас', 'salvestama — записывать', 'kontrollima — проверять']),
      B.reading('069_d_read', 'Loe: Liisi plaan.', 'Loe plaani ja vasta küsimustele.', 'Minu kahe nädala plaan',
        'Minu eesmärk: kahe nädala pärast räägin tööintervjuul julgelt eesti keeles. Kõige raskem on minu jaoks rääkimine. Lugemine ja kirjutamine on lihtsamad. Seepärast tahan rohkem rääkida. Iga päev kordan kümme uut sõna. Hommikul bussis kuulan eesti raadiot kümme minutit. Kaks korda nädalas, teisipäeval ja reedel, räägin kolleeg Jaaniga eesti keeles. Me joome koos kohvi ja ta küsib minult intervjuu küsimusi. Igal õhtul loen ühe lühikese uudise. Siis räägin valjusti, millest see on. Nädalavahetusel salvestan oma häält telefoni. Ma kuulan, kuidas ma hääldan. Pühapäeval kontrollin, mida ma tegin. Kui ma ei teinud kõike, ma ei muretse, vaid jätkan. Pärast kahte nädalat tahan rääkida paremini ja kiiremini.',
        [['Mis on Liisi eesmärk?', 'rääkida intervjuul julgelt eesti keeles|rääkida intervjuul eesti keeles'], ['Miks tahab Liis rohkem rääkida?', 'rääkimine on kõige raskem|see on kõige raskem'], ['Mida teeb Liis iga päev?', 'kordab kümme sõna|kordab sõnu'], ['Kellega ja kui tihti räägib Liis eesti keeles?', 'Jaaniga kaks korda nädalas|kolleegiga kaks korda nädalas'], ['Miks salvestab Liis oma häält?', 'et kuulata, kuidas ta hääldab|et kontrollida hääldust'], ['Mida teeb Liis, kui ta ei teinud kõike?', 'ei muretse ja jätkab|jätkab']]),
      B.crossword('069_d_words', 'Plaani sõnad.', 'Kirjuta sõnad vihjete järgi.', [
        ['Mida sa tahad saavutada?', 'eesmärk'], ['Kuidas sa sõnu ütled.', 'hääldus'], ['Kõik sõnad, mida sa tead.', 'sõnavara'], ['Õpid uuesti, et mitte unustada.', 'kordama'], ['Paberil on kirjas, mida ja millal teed.', 'plaan'],
      ]),
      B.table('069_d_find', 'Leia tekstist.', 'Kirjuta tekstist ajamarker.', 'Kui tihti või millal?, Mida Liis teeb?', [
        '[iga päev] | kordab kümme uut sõna', '[hommikul bussis/hommikul] | kuulab raadiot', '[kaks korda nädalas] | räägib Jaaniga', '[igal õhtul] | loeb uudise', '[nädalavahetusel] | salvestab oma häält', '[pühapäeval] | kontrollib, mida tegi',
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
        ['Rääkimine', 'Kaks korda nädalas räägin Jaaniga.', 'Ma räägin vahel kellegagi.', 'Rääkimine on kõige raskem.'],
        ['Kuulamine', 'Igal hommikul kuulan bussis raadiot.', 'Ma kuulan, kui aega on.', 'Kuulamine on huvitav.'],
        ['Kontroll', 'Pühapäeval kontrollin, mida tegin.', 'Ma loodan, et kõik läheb hästi.', 'Ma ei kontrolli midagi.'],
      ], 'full', 'g_read'),
      B.wordorder('069_d_order', 'Pane plaan kokku.', 'Kirjuta laused õigesti.', [
        'Iga päev kordan kümme uut sõna.', 'Igal õhtul loen ühe lühikese uudise.', 'Kaks korda nädalas räägin Jaaniga.', 'Nädalavahetusel salvestan oma häält.', 'Kõige raskem on minu jaoks rääkimine.',
      ]),
      B.errorfix('069_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma tahan rääkima paremini.', 'Ma tahan paremini rääkida.|Ma tahan rääkida paremini.'], ['Ma pean kordada sõnad.', 'Ma pean sõnu kordama.|Ma pean sõnad kordama.'], ['Iga päeval ma loen.', 'Iga päev ma loen.|Iga päev loen ma.'], ['Kaks kord nädalas ma räägin.', 'Kaks korda nädalas ma räägin.|Kaks korda nädalas räägin ma.'], ['Ma hakkan lugeda uudiseid.', 'Ma hakkan uudiseid lugema.|Ma hakkan lugema uudiseid.'],
      ]),
      TR('069_d_tr', ['Каждый день я повторяю десять слов.', 'Два раза в неделю я говорю с коллегой.', 'Самое трудное — говорение.', 'Я хочу говорить лучше.', 'В воскресенье я проверяю план.']),
      D('069_d_dict', ['Iga päev kordan sõnu.', 'Igal õhtul loen uudise.', 'Kõige raskem on rääkimine.', 'Ma tahan rääkida paremini.', 'Pühapäeval kontrollin plaani.']),
      B.speaking('069_d_say', 'Kuidas sina õpid?', 'Räägi paarilisele, kuidas sa praegu eesti keelt õpid.', ['Mida sa teed iga päev?', 'Mida sa teed kaks korda nädalas?', 'Mis on sinu jaoks kõige raskem?'], [60, 120]),
      B.writing('069_d_write', 'Minu esimene plaan.', 'Kirjuta 6–8 lauset: mida ja kui tihti sa järgmisel nädalal õpid.', [6, 8], ['iga päev', 'kaks korda nädalas', 'tahan', 'pean'], 3),
      B.selfcheck('069_d_self', ['Ma leian tekstist ajamarkerid.', 'Ma tean: tahan + da, pean / hakkan + ma.', 'Ma eristan konkreetset ja üldist plaani.', 'Ma kirjutan oma esimese plaani.'], 'Plaan on alanud'),
    ],
    practice: [
      B.match('069_p_recall', 'Mäletad Liisi plaani?', 'Ühenda aeg ja tegevus.', [
        ['iga päev', 'kordab kümme sõna'], ['hommikul bussis', 'kuulab raadiot'], ['kaks korda nädalas', 'räägib Jaaniga'], ['igal õhtul', 'loeb uudise'], ['nädalavahetusel', 'salvestab oma häält'], ['pühapäeval', 'kontrollib plaani'],
      ], 'full', 'g_read'),
      B.wordforms('069_p_forms', 'Ma- või da-vorm?', 'Kirjuta tegusõna õiges vormis.', [
        ['lugema', 'tahan …', 'lugeda'], ['kuulama', 'pean …', 'kuulama'], ['vaatama', 'tahan …', 'vaadata'], ['kirjutama', 'hakkan …', 'kirjutama'], ['harjutama', 'tahan …', 'harjutada'], ['õppima', 'hakkan …', 'õppima'],
      ]),
      B.gaps('069_p_gaps', 'Kui tihti?', 'Täida lüngad. Kaks sõna jääb üle.', [
        'Ma kordan sõnu [iga] päev.', 'Ma räägin Sofiaga kaks [korda] nädalas.', '[Igal] õhtul loen uudiseid.', '[Nädalavahetusel] vaatan eesti filmi.', 'Test on [kord] kuus.', 'Ma käin tunnis [esmaspäeviti].',
      ], ['iga', 'igal', 'korda', 'kord', 'nädalavahetusel', 'nädalavahetus', 'esmaspäeviti', 'esmaspäev']),
      B.reading('069_p_read', 'Loe: Markuse plaan.', 'Loe tekst ja vasta küsimustele.', 'Markuse plaan',
        'Markus elab Narvas ja töötab bussijuhina. Ta tahab teha A2 eksami juuni alguses. Tal on vähe aega, sest ta töötab vahetustega. Seepärast tegi ta väga lihtsa plaani. Tööpäevadel kuulab ta bussis pausi ajal eesti raadiot. Pärast tööd õpib ta veerand tundi uusi sõnu telefonis. Kaks korda nädalas käib ta õhtul keelekursusel. Kõige raskem on talle kirjutamine. Seepärast kirjutab ta igal laupäeval ühe lühikese kirja oma õpetajale. Õpetaja parandab vead ja saadab kirja tagasi. Pühapäeval Markus puhkab ja ei õpi üldse. Iga kuu lõpus teeb ta proovitesti internetis. Viimases testis sai ta seitsekümmend punkti sajast.',
        [['Miks on Markusel vähe aega?', 'ta töötab vahetustega'], ['Mida teeb Markus pausi ajal?', 'kuulab raadiot|kuulab eesti raadiot'], ['Kui kaua õpib ta pärast tööd sõnu?', 'veerand tundi|15 minutit'], ['Mis on Markusele kõige raskem?', 'kirjutamine'], ['Mida ta selle vastu teeb?', 'kirjutab igal laupäeval kirja õpetajale|kirjutab kirja õpetajale'], ['Kui tihti teeb Markus proovitesti?', 'kord kuus|iga kuu lõpus']]),
      B.transformation('069_p_trans', 'Tee plaan konkreetseks.', 'Kirjuta lause antud sõnadega.', [
        ['Ma õpin vahel sõnu.', 'iga päev, kümme sõna', 'Iga päev õpin kümme sõna.|Ma õpin iga päev kümme sõna.'],
        ['Ma kuulan mõnikord raadiot.', 'igal hommikul', 'Igal hommikul kuulan raadiot.|Ma kuulan igal hommikul raadiot.'],
        ['Ma räägin kellegagi eesti keeles.', 'kaks korda nädalas, Jaan', 'Kaks korda nädalas räägin Jaaniga eesti keeles.|Ma räägin kaks korda nädalas Jaaniga eesti keeles.'],
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
      B.text('069_t_situation', 'Uus olukord', 'Sinu sõbranna Sofia alustab kuu aja pärast uut tööd. Tööl peab ta eesti keelt rääkima. Tal on päevas ainult 20 minutit aega. Aita tal plaan teha.'),
      B.listening('069_t_listen', 'Sofia häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Sofia siin. Mul on üks palve.',
        'Ma alustan uuel töökohal esimesel novembril. Tööl räägivad kõik eesti keelt.',
        'Kõige raskem on mulle kuulamine. Inimesed räägivad nii kiiresti!',
        'Lugemine on lihtsam, ma loen iga päev uudiseid.',
        'Mul on kaks väikest last, seega vaba aega on vähe. Päevas on mul umbes kakskümmend minutit.',
        'Õhtul kella üheksast pool kümneni saan õppida.',
        'Kas sa saaksid mulle plaani teha? Kirjuta mulle e-kiri. Aitäh!',
      ], ['Sofia alustab uut tööd [novembris|esimesel novembril|1. novembril].', 'Talle on kõige raskem [kuulamine].', 'Iga päev loeb Sofia [uudiseid].', 'Sofial on kaks väikest [last].', 'Päevas on tal umbes [kakskümmend|20] minutit.', 'Ta saab õppida [õhtul|õhtuti].']),
      B.gaps('069_t_gaps', 'Sofia plaan.', 'Täida plaan sobivate sõnadega. Kolm sõna jääb üle.', [
        '[Iga] päev kuulan bussis eesti raadiot.', 'Tööl [tahan] kolleegidega rohkem rääkida.', 'Õhtul [pean] kümme uut sõna kordama.', '[Kaks] korda nädalas vaatan eesti saadet.', 'Kõige [raskem] on kuulamine.', 'Kahe nädala pärast [saan] paremini aru.',
      ], ['iga', 'igal', 'tahan', 'pean', 'kaks', 'kord', 'raskem', 'raske', 'saan']),
      B.errorfix('069_t_fix', 'Paranda Sofia plaani.', 'Kirjuta lause õigesti.', [
        ['Iga õhtul ma kuulan raadiot.', 'Igal õhtul kuulan raadiot.|Igal õhtul ma kuulan raadiot.'], ['Ma tahan kuulama paremini.', 'Ma tahan paremini kuulata.|Ma tahan kuulata paremini.'], ['Ma pean vaadata eesti saateid.', 'Ma pean eesti saateid vaatama.|Ma pean vaatama eesti saateid.'], ['Kaks korda nädal ma räägin.', 'Kaks korda nädalas ma räägin.|Kaks korda nädalas räägin ma.'], ['Kõige raskem on kuulamise.', 'Kõige raskem on kuulamine.'],
      ]),
      B.wordorder('069_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Sofial on päevas ainult kakskümmend minutit.', 'Igal õhtul kuulab ta eesti raadiot.', 'Nädalavahetusel vaatab ta eesti filmi.', 'Pühapäeval kontrollib ta oma plaani.', 'Kahe nädala pärast saab ta paremini aru.',
      ]),
      TR('069_t_tr', ['У меня мало свободного времени.', 'Каждый вечер я слушаю радио.', 'В выходные я смотрю эстонский фильм.', 'Через две недели я буду лучше понимать.', 'Самое трудное для меня — аудирование.']),
      D('069_t_dict', ['Mul on vähe aega.', 'Igal õhtul kuulan raadiot.', 'Kõige raskem on kuulamine.', 'Ma kordan kümme sõna.', 'Pühapäeval kontrollin plaani.']),
      B.planning('069_t_plan', 'Plaan Sofiale.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis on Sofia eesmärk?', 'Mida ta teeb iga päev?', 'Mida ta teeb nädalavahetusel?', 'Kuidas ta kuulamist harjutab?', 'Kuidas ta kontrollib?']),
      B.letter('069_t_letter', 'E-kiri Sofiale.', 'Kirjuta Sofiale kahe nädala plaan. Kasuta vähemalt viit ajamarkerit.', 'Tere, Sofia!', 'Edu sulle!', [80, 100]),
      B.rolecards('069_t_roles', 'Arutage plaani.', 'Rääkige 2–3 minutit.',
        'Sa oled Sofia. Ütle, mis on raske ja kui palju aega sul on.', 'Sa aitad Sofiat. Paku kolm konkreetset tegevust ja ajamarkerit.',
        ['Kõige raskem on…', 'Mul on ainult…', 'See on hea mõte.'], ['Iga päev võiksid…', 'Kaks korda nädalas…', 'Kuidas oleks, kui…?']),
      B.speaking('069_t_mono', 'Minu eesmärk.', 'Räägi 1–2 minutit oma keeleõppe eesmärgist ja plaanist.', ['Mis on sinu eesmärk?', 'Mis on sinu jaoks kõige raskem?', 'Mida sa teed iga päev?', 'Kuidas sa kontrollid, et läheb hästi?'], [60, 120]),
      B.rubric('069_t_rubric', 'Kontrolli oma kirja.', 'Märgi, mis on olemas.', ['Kirjas on eesmärk.', 'Kirjas on vähemalt viis ajamarkerit.', 'Iga tegevus on konkreetne: mida, millal, kui kaua.', 'Kirjas on kontroll: kuidas Sofia teab, et läheb hästi.', 'Kirjas on 80–100 sõna.']),
      B.selfcheck('069_t_self', ['Ma oskan kasutada plaani sõnu: eesmärk, harjutama, kordama.', 'Ma oskan häälsõnumist leida, mis on raske ja kui palju on aega.', 'Ma oskan kasutada tahan + da ja pean + ma plaanis.', 'Ma oskan kirjutada 80–100-sõnalise plaani viie ajamarkeriga.'], 'Plaan Sofiale'),
    ],
  },
};
