// A2 course (A1 → A2 roadmap), module 14 „Õppimine, kool ja keel”, stage A2. All five lessons a2-066…a2-070
// (068 tahan / proovin + da, hakkan + ma; 070 the module check in the Harno A2 form). All three phases: Avasta → Harjuta → Kasuta.
// The course and the timetable (kus? kuhu? kust? with study words, esmaspäeviti, kaks korda nädalas), asking for help
// in Estonian (käskiv kõneviis sina / teie, „Kas te saaksite…?”) and a two-week study plan (tahan + da, pean / hakkan
// + ma, frequency markers). Cast: Anna, Viktor, Liis, Markus, Sofia, Jaan.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-14', course: 'a2', title: 'Õppimine, kool ja keel', level: 'A2', design: 'v2', template: 'v3' };

const TR = (id, rows) => B.translation(id, 'Tõlgi.', 'Kirjuta eesti keeles.', rows);
const D = (id, rows) => B.dictation(id, 'Etteütlus.', 'Kuula ja kirjuta laused.', rows);

export const LESSONS = {
  'a2-066': {
    title: 'Õppimine ja kursus',
    canDo: 'Ma räägin oma eesti keele kursusest vähemalt kuue lausega: kus ja millal on tunnid, mida me teeme ja miks ma õpin.',
    template: 'v3',
    discover: [
      B.text('066_d_situation', 'Uus kursus', 'Anna kolis Tallinna. Ta töötab kontoris ja tahab eesti keelt paremini rääkida. Täna on tema esimene päev keelekursusel. Klassis on kaheksa õpilast. Õpetaja nimi on Liis.'),
      B.reading('066_d_read', 'Loe: Anna kursus.', 'Loe tekst ja vasta küsimustele.', 'Minu keelekursus',
        'Ma käin eesti keele kursusel kaks korda nädalas. Tunnid on esmaspäeviti ja kolmapäeviti kella kuuest kella poole kaheksani. Kursus toimub keelekoolis kesklinnas. Ma lähen kursusele kohe pärast tööd. Meie õpetaja Liis räägib tunnis ainult eesti keelt. Alguses oli see raske, aga nüüd saan juba palju aru. Tunnis loeme tekste, kuulame dialooge ja räägime paaris. Kodutöö on tavaliselt kirjutada lühike tekst. Iga kuu lõpus on test. Kõige raskem on minu jaoks kuulamine, sest inimesed räägivad kiiresti. Kõige rohkem meeldib mulle rääkimine. Minu pinginaaber on Andrei. Ta on pärit Ukrainast ja töötab laos. Andrei kirjutab väga hästi, aga räägib vähe. Mina räägin palju, aga teen kirjutades vigu. Nii me aitame teineteist. Kursus kestab neli kuud. Ma õpin eesti keelt, sest tahan tööl klientidega eesti keeles rääkida. Pärast tundi joome Andreiga vahel kohvi.',
        [['Mitu korda nädalas on Annal tund?', 'kaks korda|kaks korda nädalas|2 korda'], ['Kui kaua kestab üks tund?', 'poolteist tundi|1,5 tundi|90 minutit'], ['Millal Anna kursusele läheb?', 'pärast tööd|kohe pärast tööd'], ['Mida õpilased tunnis teevad?', 'loevad, kuulavad ja räägivad|loevad tekste, kuulavad dialooge ja räägivad paaris'], ['Miks on kuulamine Annale raske?', 'inimesed räägivad kiiresti'], ['Miks Anna eesti keelt õpib?', 'tahab tööl klientidega eesti keeles rääkida|et tööl klientidega rääkida'], ['Kes on Anna õpetaja?', 'Liis'], ['Mis on tavaliselt kodutöö?', 'kirjutada lühike tekst|lühike tekst']]),
      B.table('066_d_find', 'Leia tekstist.', 'Kirjuta tekstist õige vorm.', 'Küsimus, Tekstis', [
        'Kus? (kursus) | [kursusel]', 'Kuhu? (kursus) | [kursusele]', 'Kus? (tund) | [tunnis]', 'Millal? (iga esmaspäev) | [esmaspäeviti]', 'Millal? (pärast + töö) | [pärast tööd]', 'Kui tihti? | [kaks korda nädalas]',
      ], 'g_notice'),
      B.notice('066_d_notice', 'Märka: kus? kuhu? kust?', [
        'Ma käin **kursusel** / **tunnis** / **koolis**. (kus?)', 'Ma lähen **kursusele** / **tundi** / **kooli**. (kuhu?)', 'Ma tulen **kursuselt** / **tunnist** / **koolist**. (kust?)', '**esmaspäeviti** = iga esmaspäev; **kaks korda nädalas**, **kord kuus**',
      ], 'full'),
      B.gaps('066_d_gaps', 'Minu kursus.', 'Täida lüngad. Kaks sõna jääb üle.', ['Ma käin eesti keele [kursusel].', 'Täna lähen ma [tundi] kell kuus.', 'Õpetaja annab meile [kodutöö].', 'Kuu lõpus on [test].', 'Tunnid on [esmaspäeviti] ja kolmapäeviti.', 'Kõige raskem [ülesanne] on kuulamine.', 'Kas sa oled praegu [tunnis]?', 'Pärast tööd lähen ma [kursusele].'], ['kursusel', 'kursusele', 'tundi', 'tunnis', 'kodutöö', 'test', 'esmaspäeviti', 'ülesanne', 'õpikut', 'kodus']),
      B.errorfix('066_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma käin eesti keele kursusele.', 'Ma käin eesti keele kursusel.'], ['Ma õpin eesti keel.', 'Ma õpin eesti keelt.'], ['Mul on tund kaks kord nädalas.', 'Mul on tund kaks korda nädalas.'], ['Ma lähen tunnis kell kuus.', 'Ma lähen tundi kell kuus.'], ['Kõige raske on kuulamine.', 'Kõige raskem on kuulamine.'], ['Pärast töö ma lähen kursusele.', 'Pärast tööd lähen ma kursusele.|Pärast tööd ma lähen kursusele.'], ['Ma tulen kursusel koju.', 'Ma tulen kursuselt koju.'], ['Õpetaja räägib tunnis ainult eesti keelt keeles.', 'Õpetaja räägib tunnis ainult eesti keelt.|Õpetaja räägib tunnis ainult eesti keeles.']]),
      TR('066_d_tr', ['Я хожу на курсы эстонского языка.', 'Уроки по понедельникам и средам.', 'После работы я иду на урок.', 'Самое трудное для меня — аудирование.', 'Курс длится четыре месяца.', 'Я иду на урок.', 'Я возвращаюсь с курсов в восемь.', 'Урок длится полтора часа.']),
      B.speaking('066_d_say', 'Minu õppimine.', 'Räägi paarilisele oma eesti keele õppimisest.', ['Kus ja millal sa eesti keelt õpid?', 'Mitu korda nädalas on sul tund?', 'Mis on kõige raskem?', 'Mida te tunnis teete?', 'Miks sa eesti keelt õpid?'], [60, 120], ['Ma käin kursusel…', 'Tunnid on…', 'Kõige raskem on…']),
      B.writing('066_d_write', 'Minu kursus.', 'Kirjuta 6–8 lauset oma eesti keele tundidest.', [6, 8], ['kursusel', 'tundi', 'kaks korda nädalas', 'kõige raskem'], 2),
    ],
    practice: [
      B.cloze('066_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Markuse kursus', [
        'Markus tahab eesti keelt paremini rääkida. Ta käib {*kursusel|kursusele|kursuselt} kaks korda nädalas.',
        '',
        'Tunnid on teisipäeviti ja {*neljapäeviti|neljapäev|neljapäevast} õhtul. Pärast {*tööd|töö|tööle} sõidab Markus kohe keelekooli.',
        '',
        'Tund {*kestab|kestis|kestma} poolteist tundi. Tunnis räägivad õpilased palju {*paaris|paari|paarist}.',
        '',
        'Kõige {*raskem|raske|raskemalt} on Markusele grammatika. Kodus kuulab ta podcaste ja kordab {*sõnu|sõnad|sõna}. Kuu lõpus kirjutab ta {*testi|test|testis}.',
      ], 'g_vocab'),
      B.listening('066_p_listen', 'Teade kursusel.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, head õpilased! Mul on teile mõned teated.',
        'Järgmisel nädalal on tunniplaan natuke teistsugune. Esmaspäeval tundi ei ole, sest koolis on remont.',
        'Tund on hoopis teisipäeval, samal ajal, kell kuus.',
        'Kolmapäeval kirjutame testi. Test kestab üks tund. Palun võtke kaasa pliiats ja õpik.',
        'Kodutöö on lugeda tekst leheküljel kakskümmend kaks.',
        'Reedel läheme koos raamatukokku. Kohtume raamatukogu ees kell viis.',
        'Kui te ei saa tulla, kirjutage mulle e-kiri. Aitäh ja head nädalat!',
      ], ['Esmaspäeval ei ole tundi, sest koolis on [remont].', 'Teisipäeval algab tund kell [kuus|6|18].', 'Kolmapäeval on [test|testi].', 'Kaasa tuleb võtta pliiats ja [õpik|õpiku].', 'Kodutöö on leheküljel [kakskümmend kaks|22].', 'Reedel kohtutakse raamatukogu [ees].', 'Kui ei saa tulla, tuleb saata [e-kiri|e-kirja].', 'Teisipäeval on tund [samal] ajal.']),
      B.formtext('066_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Sofia õpib', [
        'Sofia käib iga päev [ülikoolis] (ülikool).',
        '',
        'Esmaspäeviti läheb ta pärast loenguid [raamatukokku|raamatukogusse] (raamatukogu). [Raamatukogus] (raamatukogu) loeb ta eesti raamatuid.',
        '',
        'Kolmapäeviti läheb ta eesti keele [tundi] (tund). [Tunnist] (tund) tuleb ta koju kell kaheksa.',
        '',
        'Ta käib [kursusel] (kursus) juba pool aastat. [Laupäeviti] (laupäev) käib ta vestlusklubis. Kursus kestab neli [kuud] (kuu).',
      ], 'g_notice'),
      B.gaps('066_p_gaps', 'Kus, kuhu või kust?', 'Vali õige vorm. Üks sõna jääb üle.', ['Anna käib iga nädal [kursusel].', 'Pärast tööd läheb ta [kursusele].', 'Kell pool kaheksa tuleb ta [kursuselt] koju.', 'Andrei on praegu [tunnis].', 'Kas sa tuled homme [tundi]?', 'Liis tuleb [tunnist] hilja koju.', '[Mitu] korda nädalas on tunnid?', '[Kus] kursus toimub?'], ['kursusel', 'kursusele', 'kursuselt', 'tunnis', 'tundi', 'tunnist', 'kooli', 'mitu', 'kus', 'kui', 'kodutööd', 'millal', 'kell', 'kuhu', 'kodutöö']),
      B.choice('066_p_choice', 'Kui tihti?', 'Vali sobiv vastus.', [
        ['Tund on igal esmaspäeval ja neljapäeval. Kui tihti?', 'kaks korda nädalas', 'üks kord nädalas', 'iga päev'],
        ['Test on iga kuu lõpus. Kui tihti?', 'kord kuus', 'kaks korda kuus', 'kord aastas'],
        ['Markus õpib sõnu esmaspäevast pühapäevani. Kui tihti?', 'iga päev', 'nädalavahetusel', 'esmaspäeviti'],
        ['Sofia käib vestlusklubis ainult laupäeviti. Kui tihti?', 'kord nädalas', 'iga päev', 'kaks korda nädalas'],
        ['Tunnid on teisipäeviti ja reedeti. Millal?', 'teisipäeval ja reedel', 'teisipäevast reedeni', 'ainult reedel'],
        ['Kursus kestab septembrist detsembrini. Kui kaua?', 'neli kuud', 'neli nädalat', 'kaks kuud'], ['Liis õpib iga õhtu pool tundi sõnu. Kui tihti?', 'iga päev', 'kord nädalas', 'kord kuus'], ['Kursus kestab oktoobrist jaanuarini. Kui kaua?', 'neli kuud', 'neli päeva', 'kaks kuud']], 'full', 'g_vocab'),
      B.transformation('066_p_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Mul on tund igal esmaspäeval.', 'esmaspäeviti', 'Mul on tund esmaspäeviti.|Esmaspäeviti on mul tund.'],
        ['Ma käin tunnis esmaspäeval ja kolmapäeval.', 'kaks korda', 'Ma käin tunnis kaks korda nädalas.|Kaks korda nädalas käin ma tunnis.'],
        ['Tund algab kell kuus ja lõpeb kell pool kaheksa.', 'kestab', 'Tund kestab poolteist tundi.|Tund kestab kella kuuest kella poole kaheksani.'],
        ['Ma olin tunnis. Nüüd lähen koju.', 'tulen', 'Ma tulen tunnist.|Ma tulen tunnist koju.'],
        ['Kuulamine on väga raske. Teised osad on lihtsamad.', 'kõige raskem', 'Kõige raskem on kuulamine.|Kuulamine on kõige raskem.'], ['Mul on tund igal reedel.', 'reedeti', 'Mul on tund reedeti.|Reedeti on mul tund.'], ['Ma olin kursusel. Nüüd lähen koju.', 'tulen', 'Ma tulen kursuselt.|Ma tulen kursuselt koju.'], ['Lugemine on väga kerge. Teised osad on raskemad.', 'kõige kergem', 'Kõige kergem on lugemine.|Lugemine on kõige kergem.']]),
      B.wordorder('066_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Esmaspäeviti on mul eesti keele tund.', 'Kolmapäeval kirjutame testi.', 'Pärast tundi joome koos kohvi.', 'Kodutöö on lugeda üks tekst.', 'Kas sa tuled homme tundi?', 'Ma käin kursusel kaks korda nädalas.', 'Pärast tööd lähen ma tundi.', 'Tunnis räägime palju paaris.']),
      B.dictation('066_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma käin keelekursusel kaks korda nädalas.', 'Tund algab kell kuus.', 'Kodutöö on kirjutada lühike tekst.', 'Iga kuu lõpus on test.', 'Kõige raskem on minu jaoks kuulamine.', 'Pärast tööd lähen ma kohe tundi.', 'Kursus kestab neli kuud.', 'Kas sa tuled homme tundi?'], 8),
      B.speaking('066_p_say', 'Küsi paarilise kohta.', 'Küsi paariliselt tema õppimise kohta. Siis vahetage.', ['Kus sa eesti keelt õpid?', 'Mitu korda nädalas on sul tund?', 'Kui kaua üks tund kestab?', 'Mis on kodutöö?'], [60, 90]),
    ],
    transfer: [
      B.text('066_t_situation', 'Uus olukord', 'Sinu sõber Jaan tahab ka eesti keelt õppida. Ta küsib sinu kursuse kohta. Loe keelekooli kuulutust ja aita teda.'),
      B.reading('066_t_ad', 'Loe kuulutust.', 'Loe ja vasta küsimustele.', 'Keelekool „Sõna” kutsub!',
        'Uued eesti keele kursused algavad 2. oktoobril! A1 grupp õpib teisipäeviti ja neljapäeviti kell 10–11.30. A2 grupp õpib esmaspäeviti ja kolmapäeviti kell 18–19.30. Kursus kestab neli kuud ja maksab 240 eurot. Grupis on kuni kümme õpilast. Tundides räägime palju, sest rääkimine on kõige tähtsam. Iga nädal on väike kodutöö. Kursuse lõpus on test ja iga õpilane saab tunnistuse. Kui sa ei tea oma taset, tule enne kursust tasuta testile. Test on 25. septembril kell 17. Laupäeviti on raamatukogus vestlusklubi kõigile õpilastele. Registreeru meie kodulehel või helista numbril 5123 4567. Ootame sind!',
        [['Millal kursused algavad?', '2. oktoobril|teisel oktoobril'], ['Millises grupis saab õppida pärast tööd?', 'A2|A2 grupis'], ['Kui palju maksab kursus ühes kuus?', '60 eurot|kuuskümmend eurot'], ['Mida saab õpilane kursuse lõpus?', 'tunnistuse|tunnistus'], ['Mida peab tegema, kui sa ei tea oma taset?', 'tulema tasuta testile|tegema testi'], ['Kuidas saab registreeruda?', 'kodulehel või telefoniga|kodulehel|helistada'], ['Mitu õpilast on grupis?', 'kuni kümme|10|kümme'], ['Mis on kursusel kõige tähtsam?', 'rääkimine']]),
      B.gaps('066_t_gaps', 'Jaani küsimused.', 'Kirjuta küsimusse sobiv sõna. Kaks sõna jääb üle.', ['[Mitu] korda nädalas on tunnid?', '[Kus] kursus toimub?', '[Kui] palju kursus maksab?', 'Kas tunnis on palju [kodutööd]?', '[Millal] on tasuta test?', 'Mis [kell] tund algab?', '[Kuhu] ma pean testile tulema?', 'Kas [kodutöö] on iga nädal?'], ['mitu', 'kus', 'kui', 'kodutööd', 'millal', 'kell', 'kuhu', 'kodutöö', 'kes', 'tund']),
      B.table('066_t_form', 'Registreerimisvorm.', 'Täida vorm enda andmetega.', 'Küsimus, Sinu vastus', [
        'Ees- ja perekonnanimi | ', 'Telefon või e-post | ', 'Grupp (A1 või A2) | ', 'Millal sul on aega õppida? | ', 'Miks sa eesti keelt õpid? | ',
      ]),
      B.rolecards('066_t_roles', 'Jaan küsib kursuse kohta.', 'Rääkige 2–3 minutit. Siis vahetage rollid.',
        'Sa käid kursusel. Vasta Jaani küsimustele: millal, kus, kui kaua, mida tunnis teete.', 'Sa oled Jaan. Küsi vähemalt viis küsimust kursuse kohta.',
        ['Tunnid on…', 'Kursus kestab…', 'Tunnis me…'], ['Mitu korda nädalas…?', 'Kui palju see maksab?', 'Kas kodutöid on palju?']),
      B.speaking('066_t_mono', 'Minu kursus.', 'Räägi 1–2 minutit oma õppimisest.', ['Kus ja millal sa õpid?', 'Mida te tunnis teete?', 'Mis on kõige raskem ja miks?', 'Mis on sinu eesmärk?'], [60, 120]),
      B.letter('066_t_msg', 'Sõnum Jaanile.', 'Kirjuta Jaanile: millal ja kus on A2 kursus, kuidas registreeruda.', 'Tere, Jaan!', 'Edu!', [40, 60]),
      B.rubric('066_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on aeg, koht ja registreerimine (40–60 sõna).', 'Kus? kuhu? kust? ja ajasõnad on õigesti kasutatud.', 'Rollimängus küsitakse vähemalt viis küsimust.', 'Suuline tekst on 1–2 minutit ja arusaadav.']),
      B.selfcheck('066_t_self', ['Ma oskan kasutada kursuse sõnu uues olukorras.', 'Ma oskan leida kuulutusest aja, hinna ja koha.', 'Ma oskan öelda, kus ja millal tund on: kursusel, tundi, esmaspäeviti.', 'Ma oskan sõbrale oma kursust tutvustada.'], 'Jaan tuleb ka'),
    ],
  },

  'a2-067': {
    title: 'Ma ei saa aru',
    canDo: 'Ma palun abi, kui ma ei saa aru, ja kasutan eesti keeles vähemalt nelja küsimust: palun korrake, mida tähendab…, kuidas öeldakse…, kas saate näite tuua.',
    template: 'v3',
    discover: [
      B.text('067_d_situation', 'Esimene päev tööl', 'Andrei alustab tööd uues laos. Juhataja Mari selgitab tööd väga kiiresti. Andrei saab aru ainult pooltest sõnadest. Ta ei taha rääkida vene keeles. Ta küsib uuesti eesti keeles.'),
      B.truefalse('067_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Andrei on tööl esimest päeva.', true], ['Mari räägib aeglaselt.', false], ['Andrei saab pooltest sõnadest aru.', true], ['Andrei küsib vene keeles.', false], ['Mari on Andrei juhataja.', true], ['Mari selgitab tööd väga kiiresti.', true], ['Andrei töötab kontoris.', false], ['Andrei tahab rääkida eesti keeles.', true]]),
      B.reading('067_d_read', 'Loe: Mari ja Andrei laos.', 'Loe dialoogi ja vasta küsimustele.', 'Laos',
        'Mari: Andrei, palun pane need kastid riiulile. Rasked kastid lähevad alla, kerged üles.\nAndrei: Vabandust, ma ei saanud aru. Palun korrake aeglasemalt.\nMari: Muidugi. Rasked kastid pane alumisele riiulile.\nAndrei: Mida tähendab „alumine”?\nMari: Alumine tähendab, et see on all, mitte üleval.\nAndrei: Aa, selge. Aga mida ma pärast teen?\nMari: Pärast kontrolli saatelehte.\nAndrei: Kuidas seda sõna kirjutatakse?\nMari: Saateleht, ühe sõnana. Siin on üks saateleht.\nAndrei: Kas te saate näite tuua? Mida ma pean kontrollima?\nMari: Vaata, siin on kirjas kümme kasti. Loe kastid üle. Kui kaste on kümme, on kõik korras.\nAndrei: Nüüd saan aru. Aitäh, et te nii hästi selgitasite!\nMari: Pole tänu väärt. Küsi alati, kui midagi on segane.',
        [['Kuhu peab Andrei rasked kastid panema?', 'alumisele riiulile|alla'], ['Miks palub Andrei korrata?', 'ta ei saanud aru'], ['Mis sõna Andrei alguses ei tea?', 'alumine'], ['Mida peab Andrei pärast tegema?', 'kontrollima saatelehte|lugema kastid üle'], ['Kuidas Mari näite toob?', 'ta näitab saatelehte|näitab, et seal on kümme kasti'], ['Kas Mari ütleb Andreile „sina” või „teie”?', 'sina'], ['Mida tähendab „alumine”?', 'see on all|all, mitte üleval'], ['Mida peab Andrei pärast kontrollima?', 'saatelehte|saatelehe']]),
      B.notice('067_d_notice', 'Märka: sina või teie?', [
        'Sõbrale: **Korda**, palun! **Räägi** aeglasemalt!', 'Õpetajale, võõrale: **Korrake**, palun! **Rääkige** aeglasemalt!', 'kirjuta → **kirjutage**, selgita → **selgitage**, näita → **näidake**', 'Viisakam: **Kas te saaksite** korrata? (+ da-vorm)',
      ], 'full'),
      B.transformation('067_d_polite', 'Küsi viisakamalt.', 'Kirjuta küsimus „Kas te saaksite…?” abil.', [
        ['Korrake!', 'Kas te saaksite…?', 'Kas te saaksite korrata?'], ['Rääkige aeglasemalt!', 'Kas te saaksite…?', 'Kas te saaksite aeglasemalt rääkida?'], ['Tooge näide!', 'Kas te saaksite…?', 'Kas te saaksite näite tuua?'], ['Selgitage veel kord!', 'Kas te saaksite…?', 'Kas te saaksite veel kord selgitada?'], ['Kirjutage see sõna tahvlile!', 'Kas te saaksite…?', 'Kas te saaksite selle sõna tahvlile kirjutada?'], ['Selgita uuesti!', 'Kas sa saaksid…?', 'Kas sa saaksid uuesti selgitada?'], ['Näidake pildil!', 'Kas te saaksite…?', 'Kas te saaksite pildil näidata?'], ['Rääkige valjemini!', 'Kas te saaksite…?', 'Kas te saaksite valjemini rääkida?']]),
      B.errorfix('067_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma ei saan aru.', 'Ma ei saa aru.'], ['Kuidas ütleb eesti keeles „окно”?', 'Kuidas öeldakse eesti keeles „окно”?'], ['Palun räägige aeglasemalt.', 'Palun rääkige aeglasemalt.'], ['Kas te saate näide tuua?', 'Kas te saate näite tuua?'], ['Ma ei sain aru.', 'Ma ei saanud aru.'], ['Palun korrata.', 'Palun korrake.|Palun korda.'], ['Ma ei saa aru teie.', 'Ma ei saa teist aru.'], ['Kas te saaksite korrake?', 'Kas te saaksite korrata?']]),
      TR('067_p_tr', ['Я вас не понимаю.', 'Не могли бы вы повторить?', 'Как это пишется?', 'Покажите, пожалуйста.', 'Говори громче, пожалуйста!', 'Извините, я не всё понял.', 'Что значит слово «сохранить»?', 'Можешь показать мне ещё раз?']),
      B.speaking('067_d_say', 'Kuidas sa küsid?', 'Räägi paarilisele: mida sa teed, kui ei saa aru?', ['Mida sa ütled, kui inimene räägib kiiresti?', 'Kuidas sa küsid uue sõna kohta?', 'Kas sa küsid tööl või poes uuesti?', 'Kuidas sa küsid, kui ei tea, kuidas sõna kirjutatakse?', 'Kas sulle meeldib uuesti küsida? Miks?'], [45, 90]),
      B.writing('067_d_write', 'Minu küsimused.', 'Kirjuta 6–8 küsimust, mida saad tunnis õpetajale esitada.', [6, 8], ['korrake', 'tähendab', 'öeldakse', 'näite'], 3),
    ],
    practice: [
      B.listening('067_p_listen', 'Õpetaja juhised.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere hommikust! Täna kirjutame lühikese testi.',
        'Võtke palun pliiats ja paber. Telefonid pange kotti.',
        '— Vabandust, kas te saaksite korrata? Mida me võtame?',
        '— Pliiatsi ja paberi. Test kestab kakskümmend minutit.',
        'Esimeses ülesandes kuulate dialoogi kaks korda. Teises ülesandes loete teksti ja vastate küsimustele.',
        '— Mida tähendab „vastama”?',
        '— Vastama tähendab, et kirjutate vastuse. Näiteks: küsimus on „Kus sa elad?” ja vastus on „Tartus”.',
        'Kui te ei saa sõnast aru, tõstke käsi. Sõnaraamatut kasutada ei tohi. Edu!',
      ], ['Täna kirjutavad õpilased [testi|test].', 'Telefonid tuleb panna [kotti].', 'Test kestab [kakskümmend|20] minutit.', 'Esimeses ülesandes kuulatakse [dialoogi|dialoog].', 'Teises ülesandes loetakse [teksti|tekst].', 'Kui ei saa aru, tuleb tõsta [käsi|kätt].', '[Sõnaraamatut|Sõnaraamat] kasutada ei tohi.', 'Õpetaja selgitab, mida tähendab [vastama].']),
      B.cloze('067_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Olga uues töös', [
        'Olga alustab tööd uues firmas. Ülemus räägib kiiresti ja Olga ei {*saa|saan|saama} kõigest aru.',
        '',
        '„Vabandust, palun {*korrake|kordan|kordama},” ütleb Olga. „Ja kas te {*saaksite|saaksin|saan} natuke aeglasemalt rääkida?”',
        '',
        'Ülemus kasutab sõna „aruanne”. „Mida see sõna {*tähendab|tähenda|tähendama}?” küsib Olga. „Kuidas seda {*kirjutatakse|kirjutab|kirjutama}?”',
        '',
        'Ülemus naeratab ja {*näitab|näita|näitama} paberil: „Aruanne on tekst, kus on kõik numbrid.” Olga ütleb: „Aitäh, nüüd on {*selge|selgelt|selgus}! Kas te saate ka ühe {*näite|näide|näidet} tuua?”',
      ], 'g_vocab'),
      B.formtext('067_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Kuidas abi küsida', [
        'Anna küsib õpetajalt: „Palun [korrake] (kordama) see lause.”',
        '',
        '„Kas te saaksite natuke aeglasemalt [rääkida] (rääkima)?”',
        '',
        'Õpetaja ütleb klassile: „[Lugege] (lugema) teksti ja [vastake] (vastama) küsimustele.”',
        '',
        'Anna ütleb sõbrale: „[Kuula] (kuulama), see on hea laul! [Ütle] (ütlema) mulle, mida see sõna [tähendab] (tähendama). Ma ei [saanud] (saama) aru.”',
      ], 'g_notice'),
      B.dialogue('067_p_dialog', 'Telefonikõne.', 'Täida dialoog.', 'Anna', 'Registratuur', [
        ['B', 'Tere! Perearstikeskus, kuulan.'], ['A', 'Tere! Vabandust, ma ei [saanud] aru. Palun [korrake].'], ['B', 'Perearstikeskus. Kuidas saan aidata?'],
        ['A', 'Mul on vaja aega arsti juurde. Palun rääkige [aeglasemalt], ma õpin eesti keelt.'], ['B', 'Muidugi. Kas teil on saatekiri?'],
        ['A', 'Mida [tähendab] „saatekiri”?'], ['B', 'See on paber, mille annab teine arst. Teil seda vaja ei ole.'],
        ['A', 'Selge. Kas te [saaksite] aja sõnumiga saata?'], ['B', 'Jah, saadan kohe.'], ['A', 'Suur [aitäh]!'], ['B', 'Kas teil on veel [küsimusi]?'], ['A', 'Ei, nüüd on kõik [selge].']]),
      B.match('067_p_recall', 'Mäletad?', 'Ühenda küsimuse algus ja lõpp.', [
        ['Palun', 'korrake veel üks kord.'], ['Mida', 'tähendab see sõna?'], ['Kuidas öeldakse', 'eesti keeles „ручка”?'], ['Kas te saate', 'näite tuua?'], ['Kuidas seda', 'sõna kirjutatakse?'], ['Palun rääkige', 'natuke aeglasemalt.'], ['Ma ei', 'saanud aru.'], ['Palun kirjutage', 'see sõna tahvlile.']], 'full', 'g_use'),
      B.transformation('067_p_trans', 'Sõbrale või võõrale?', 'Kirjuta lause teise inimese jaoks.', [
        ['Korda, palun! (sõbrale)', 'võõrale', 'Korrake, palun!'], ['Rääkige aeglasemalt! (võõrale)', 'sõbrale', 'Räägi aeglasemalt!'], ['Näita, palun! (sõbrale)', 'võõrale', 'Näidake, palun!'], ['Kirjutage see üles! (võõrale)', 'sõbrale', 'Kirjuta see üles!'], ['Kas sa saad näite tuua? (sõbrale)', 'võõrale', 'Kas te saate näite tuua?|Kas te saaksite näite tuua?'], ['Selgita veel kord! (sõbrale)', 'võõrale', 'Selgitage veel kord!'], ['Oodake natuke! (võõrale)', 'sõbrale', 'Oota natuke!'], ['Kuula, palun! (sõbrale)', 'võõrale', 'Kuulake, palun!']]),
      B.wordorder('067_p_order', 'Pane küsimus kokku.', 'Kirjuta küsimused õigesti.', ['Kas te saaksite natuke aeglasemalt rääkida?', 'Mida see sõna eesti keeles tähendab?', 'Kuidas seda sõna kirjutatakse?', 'Kas te saate ühe näite tuua?', 'Kuidas öeldakse eesti keeles „ручка”?', 'Vabandust, ma ei saanud aru.', 'Palun rääkige natuke aeglasemalt.', 'Mida see sõna tähendab?']),
      D('067_p_dict', ['Palun rääkige valjemini.', 'Ma ei saa teist aru.', 'Kas te saaksite korrata?', 'Palun näidake pildil.', 'Kuidas seda kirjutatakse?', 'Vabandust, ma ei saanud aru.', 'Palun korrake.', 'Mida see sõna tähendab?']),
      B.speaking('067_p_say', 'Mängi läbi.', 'Paariline räägib kiiresti ja kasutab raskeid sõnu. Küsi.', ['Paariline räägib oma tööst.', 'Sina küsid: korda, tähendus, kirjapilt, näide.', 'Siis vahetage.', 'Küsi, kuidas mingit asja eesti keeles öeldakse.', 'Lõpuks täna paarilist.'], [60, 90], ['Palun korrake.', 'Mida tähendab…?', 'Kuidas seda kirjutatakse?']),
    ],
    transfer: [
      B.text('067_t_situation', 'Uus olukord', 'Anna alustab tööd uues kontoris. Kolleeg Siim selgitab talle arvutiprogrammi. Ta räägib kiiresti ja kasutab palju uusi sõnu.'),
      B.dictation('067_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma ei saanud kõigest aru.', 'Kas sa saaksid mulle uuesti näidata?', 'Mida tähendab sõna salvestama?', 'Palun kirjutage see paberile.', 'Kuidas öeldakse eesti keeles aruanne?', 'Sa rääkisid väga kiiresti.', 'Ma tulen tööle kell kaheksa.', 'Aitäh ette!'], 8),
      B.reading('067_t_read', 'Loe Anna kirja.', 'Loe kirja ja vasta küsimustele.', 'Tere, Siim!',
        'Aitäh, et sa mulle täna programmi selgitasid. Kahjuks ma ei saanud kõigest aru, sest sa rääkisid väga kiiresti. Mul on mõned küsimused. Mida tähendab sõna „salvestama”? Kas see on sama mis „save”? Ma ei leidnud ka nuppu „Saada”. Kus see on? Ja kuidas öeldakse eesti keeles „отчёт”? Ma pean homme selle kirjutama. Kas sa saaksid mulle homme hommikul veel kord näidata? Ma tulen tööle kell kaheksa. Kui sul on aega, joome koos kohvi ja sa näitad mulle. Aitäh ette! Anna',
        [['Miks ei saanud Anna kõigest aru?', 'Siim rääkis kiiresti|ta rääkis väga kiiresti'], ['Millise sõna tähendust Anna küsib?', 'salvestama'], ['Mida Anna ei leidnud?', 'nuppu „Saada”|nuppu Saada|nuppu'], ['Millal peaks Siim uuesti näitama?', 'homme hommikul|homme kell kaheksa'], ['Mida Anna pakub?', 'koos kohvi juua|kohvi'], ['Kas Anna kirjutab viisakalt? Miks?', 'jah, ta tänab|jah, ta ütleb aitäh'], ['Mis kell tuleb Anna tööle?', 'kell kaheksa|kaheksa'], ['Mida peab Anna homme kirjutama?', 'aruande|aruanne']]),
      B.rolecards('067_t_roles', 'Siim selgitab.', 'Rääkige 2–3 minutit. Siis vahetage rollid.',
        'Sa oled Siim. Selgita kiiresti, kuidas printerit kasutada. Kasuta raskeid sõnu.', 'Sa oled Anna. Kasuta vähemalt nelja küsimust: kordamine, tähendus, sõna, näide.',
        ['Kõigepealt vajuta…', 'Siis vali…', 'Lõpuks…'], ['Palun korda.', 'Mida tähendab…?', 'Kuidas öeldakse…?', 'Kas sa saad näite tuua?']),
      B.speaking('067_t_mono', 'Minu nõuanded.', 'Räägi 1–2 minutit: mida teha, kui ei saa eesti keelest aru?', ['Kas sa küsid uuesti?', 'Millist küsimust kasutad kõige rohkem?', 'Kas sa kasutad telefoni sõnaraamatut?', 'Mis aitab sind kõige rohkem?'], [60, 120]),
      B.letter('067_t_msg', 'Kiri õpetajale.', 'Sa ei saanud kodutööst aru. Kirjuta õpetajale ja küsi kolm küsimust.', 'Tere, õpetaja!', 'Tänan ette!', [40, 60]),
      B.writing('067_t_write', 'Nõuanded uuele õpilasele.', 'Kirjuta 5–7 lauset: kuidas tunnis abi küsida.', [5, 7], ['palun korrake', 'mida tähendab', 'kuidas öeldakse', 'näide'], 3),
      B.rubric('067_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on kolm selget küsimust (40–60 sõna).', 'Küsimused on õiged: palun korrake, mida tähendab, kuidas öeldakse.', 'Rollimängus kasutatakse vähemalt neli küsimust.', 'Suuline tekst annab vähemalt kolm nõuannet.']),
      B.selfcheck('067_t_self', ['Ma oskan kasutada abi küsimise sõnu: korrata, tähendab, näide.', 'Ma oskan leida kirjast, mida inimene ei mõistnud.', 'Ma oskan valida sina- või teie-vormi: korda / korrake.', 'Ma oskan vestluses kasutada nelja küsimust ilma vene keeleta.'], 'Ma ei jää vait'),
    ],
  },

  'a2-068': {
    title: 'Ma tahan õppida / hakkan õppima',
    canDo: 'Ma räägin oma õppimise eesmärgist ja plaanist mustritega tahan / proovin + da-vorm ja hakkan + ma-vorm ning moodustan vähemalt 8 sagedast ühendit 10-st õigesti.',
    template: 'v3',
    discover: [
      B.text('068_d_situation', 'Uued eesmärgid', 'Jaanuaris istuvad Anna ja Jaan kohvikus. Mõlemal on uus eesmärk: sooritada suvel A2 eksam. Anna ütleb: „Ma hakkan iga päev lugema.” Jaan naerab: „Mina proovin rääkida ainult eesti keeles!”'),
      B.reading('068_d_read', 'Loe: Anna plaan.', 'Loe teksti ja vasta küsimustele.', 'Minu eesmärk',
        'Minu eesmärk on sooritada juunis A2 eksam. Ma tahan eesti keeles paremini rääkida ja kirjutada. Tööl kontoris pean ma klientidega suhtlema. Mõnikord ma ei saa aru, mida nad küsivad. Seepärast hakkan ma iga päev eesti keelt õppima. Hommikul bussis hakkan kuulama eesti raadiot. Õhtul proovin lugeda lühikesi uudiseid. Uued sõnad kirjutan vihikusse. Ma unustan sõnad kiiresti. Seepärast proovin neid kohe lauses kasutada. Laupäeviti hakkan käima keelekohvikus. Seal saab rääkida eestlastega. Ma ei taha enam vigu karta. Ma tahan julgelt rääkida! Kuu pärast proovin teha proovieksami. Siis näen, mida pean veel harjutama.',
        [['Mis on Anna eesmärk?', 'sooritada A2 eksam|sooritada juunis A2 eksam|A2 eksam'], ['Miks on eesti keel tööl vajalik?', 'ta peab klientidega suhtlema|ta suhtleb klientidega'], ['Mida hakkab Anna bussis tegema?', 'kuulama eesti raadiot|kuulama raadiot'], ['Mida proovib Anna õhtul teha?', 'lugeda lühikesi uudiseid|lugeda uudiseid'], ['Kus saab Anna eestlastega rääkida?', 'keelekohvikus'], ['Mida teeb Anna kuu pärast?', 'proovieksami|ta teeb proovieksami'], ['Kuhu kirjutab Anna uued sõnad?', 'vihikusse'], ['Miks proovib Anna sõnu kohe lauses kasutada?', 'ta unustab sõnad kiiresti|sest ta unustab kiiresti']]),
      B.notice('068_d_notice', 'Märka: kolm mustrit', ['**tahan** + da: Ma tahan **rääkida**. Ma tahan eksami **sooritada**.', '**proovin** + da: Ma proovin **lugeda** uudiseid.', '**hakkan** + ma: Ma hakkan raadiot **kuulama**. (= alustan)', 'Meeles: **pean** + ma (pean harjutama), **oskan / saan** + da', 'hakkan = alustan; proovin = teen katse; tahan = mul on soov'], 'full'),
      B.wordforms('068_d_forms', 'da-vorm', 'Kirjuta tegusõna da-vormis.', [
        ['lugema', 'ma tahan …', 'lugeda'], ['kuulama', 'ma proovin …', 'kuulata'], ['kirjutama', 'ma tahan …', 'kirjutada'], ['rääkima', 'ma proovin …', 'rääkida'],
        ['sooritama', 'ma tahan eksami …', 'sooritada'], ['tegema', 'ma proovin …', 'teha'], ['jätma', 'ma proovin meelde …', 'jätta'], ['käima', 'ma tahan …', 'käia']]),
      B.gaps('068_d_gaps', 'Jaani plaan.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Jaan tahab eesti keeles julgemalt [rääkida] (rääkima).', 'Ta hakkab iga päev raadiot [kuulama] (kuulama).', 'Ta proovib uusi sõnu meelde [jätta] (jätma).', 'Õhtuti hakkab ta päevikut [kirjutama] (kirjutama).',
        'Ta tahab juunis eksami [sooritada] (sooritama).', 'Ta proovib tööl vähem vene keeles [rääkida] (rääkima).', 'Ta hakkab keelekohvikus [käima] (käima).', 'Ta tahab eesti raamatuid [lugeda] (lugema).']),
      B.transformation('068_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma loen iga päev.', 'hakkan', 'Ma hakkan iga päev lugema.'], ['Ma räägin eesti keeles.', 'proovin', 'Ma proovin eesti keeles rääkida.|Ma proovin rääkida eesti keeles.'], ['Ma sooritan eksami.', 'tahan', 'Ma tahan eksami sooritada.'],
        ['Ma kuulan raadiot.', 'hakkan', 'Ma hakkan raadiot kuulama.'], ['Ma kirjutan e-kirja eesti keeles.', 'proovin', 'Ma proovin e-kirja eesti keeles kirjutada.|Ma proovin kirjutada e-kirja eesti keeles.'], ['Ma jätan sõnad meelde.', 'tahan', 'Ma tahan sõnad meelde jätta.'], ['Ma käin keelekohvikus.', 'hakkan', 'Ma hakkan keelekohvikus käima.'], ['Ma vaatan eesti filme.', 'proovin', 'Ma proovin eesti filme vaadata.|Ma proovin vaadata eesti filme.']]),
      B.translation('068_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я начну читать каждый день.', 'Я попробую говорить по-эстонски.', 'Я хочу сдать экзамен.', 'Я быстро забываю слова.', 'Моя цель — говорить смелее.', 'Я начну ходить в языковое кафе.', 'Попробуй читать короткие книги.', 'Он хочет понимать соседей.']),
      B.speaking('068_d_say', 'Minu eesmärk.', 'Räägi paarilisele oma keeleõppe eesmärgist.', ['Mis on sinu eesmärk?', 'Mida sa hakkad tegema?', 'Mida sa proovid teha?', 'Mida sa tahad hästi osata?'], [60, 90], ['Ma tahan …-da.', 'Ma hakkan …-ma.', 'Ma proovin …-da.']),
      B.writing('068_d_write', 'Minu kolm eesmärki.', 'Kirjuta 6–8 lauset: mida sa tahad, hakkad ja proovid teha.', [6, 8], ['tahan', 'hakkan', 'proovin'], 3),
    ],
    practice: [
      B.cloze('068_p_cloze', 'Jaani sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Ma mõtlesin sinu plaani peale. Ka mina hakkan iga päev {*õppima|õppida|õpin}.',
        '',
        'Hommikul proovin uudiseid {*lugeda|lugema|loen}. Õhtul hakkan {*kuulama|kuulata|kuulan} eesti laule.',
        '',
        'Laupäeval tahan keelekohvikusse {*tulla|tulema|tulen}. Kas me {*saame|peame|hakkame} koos minna? Ma {*unustan|unustama|unustada} sõnad kiiresti, aga ma ei {*taha|tahan|tahtma} lõpetada.',
        '',
        'Minu eesmärk on suvel eksam {*sooritada|sooritama|sooritan}. Jaan',
      ], 'g_vocab'),
      B.reading('068_p_read', 'Loe: kolm õpilast.', 'Loe teksti ja vasta küsimustele.', 'Meie eesmärgid', [
        'Sofia: Minu eesmärk on rääkida ülikoolis ainult eesti keeles. Ma hakkan iga päev lõunal kursusekaaslastega eesti keeles rääkima. Õhtul proovin vaadata eesti seriaale. Nii kuulen palju uusi sõnu.',
        'Markus: Mina tahan kirjutada ilma vigadeta. Ma hakkan iga nädal kirjutama ühe lühikese teksti. Õpetaja kontrollib seda. Sõnad kirjutan kaartidele ja proovin need meelde jätta.',
        'Oksana: Minu tütar Mia käib eesti lasteaias. Ma tahan tema kasvatajaga ise rääkida. Ma hakkan käima keelekohvikus kaks korda nädalas. Ma proovin tütrega ka eesti raamatuid lugeda. Tütar on minu parim õpetaja!',
      ], [['Kus tahab Sofia eesti keelt rääkida?', 'ülikoolis'], ['Mida hakkab Sofia lõunal tegema?', 'kursusekaaslastega eesti keeles rääkima|eesti keeles rääkima'], ['Mida tahab Markus?', 'kirjutada ilma vigadeta'], ['Kes kontrollib Markuse teksti?', 'õpetaja'], ['Kellega tahab Oksana rääkida?', 'tütre kasvatajaga|Mia kasvatajaga|kasvatajaga'], ['Kui tihti hakkab Oksana keelekohvikus käima?', 'kaks korda nädalas'], ['Mida kirjutab Markus kaartidele?', 'sõnad|uued sõnad|sõnu'], ['Kes on Oksana parim õpetaja?', 'tütar|tema tütar|Mia']]),
      B.formtext('068_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Sofia plaan', [
        'Sofia [tahab] (tahtma) eesti keeles paremini [rääkida] (rääkima).',
        '',
        'Ta [hakkab] (hakkama) iga päev eesti raadiot kuulama. Ta proovib uusi sõnu meelde [jätta] (jätma).',
        '',
        'Ta [proovib] (proovima) ka lühikesi tekste [kirjutada] (kirjutama).',
        '',
        'Ta tahab juunis eksami [sooritada] (sooritama). Tema sõbrad [hakkavad] (hakkama) koos temaga õppima.',
      ], 'g_notice'),
      B.gaps('068_p_gaps', 'Viktori plaan.', 'Kirjuta sulgudes olev tegusõna ma- või da-vormis.', [
        'Viktor hakkab esmaspäeviti kursusel [käima] (käima).', 'Ta tahab naabritest paremini aru [saada] (saama).', 'Ta proovib iga päev ühte laulu [kuulata] (kuulama).', 'Poes hakkab ta müüjatega eesti keeles [rääkima] (rääkima).',
        'Ta proovib kümme sõna päevas meelde [jätta] (jätma).', 'Ta ei taha vanu sõnu [unustada] (unustama).', 'Aasta pärast tahab ta eksami [sooritada] (sooritama).', 'Ta hakkab iga päev ajalehte [lugema] (lugema).']),
      B.errorfix('068_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma hakkan lugeda iga päev.', 'Ma hakkan iga päev lugema.|Ma hakkan lugema iga päev.'], ['Ta tahab eksam sooritama.', 'Ta tahab eksami sooritada.'], ['Me proovime rääkima ainult eesti keeles.', 'Me proovime rääkida ainult eesti keeles.|Me proovime ainult eesti keeles rääkida.'], ['Nad hakkavad kursusel käia.', 'Nad hakkavad kursusel käima.'], ['Ma ei taha unustama sõnu.', 'Ma ei taha sõnu unustada.'], ['Ma lähen keelekohvikusse rääkida.', 'Ma lähen keelekohvikusse rääkima.'], ['Ma hakkan õppida eesti keelt.', 'Ma hakkan eesti keelt õppima.|Ma hakkan õppima eesti keelt.'], ['Ma tahan naabritest aru saama.', 'Ma tahan naabritest aru saada.']]),
      B.listening('068_p_listen', 'Kuulamine. Õpetaja nõuanded.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen õpetaja Liis.', 'Kui te tahate eksami sooritada, peate harjutama iga päev.', 'Hakake kuulama eesti raadiot vähemalt kümme minutit päevas.', 'Proovige lugeda lastele mõeldud raamatuid. Need on lihtsad.',
        'Uued sõnad kirjutage kaartidele.', 'Ärge kartke vigu teha. Vigadest me õpime!',
      ], ['Harjutada tuleb iga [päev].', 'Raadiot tuleb kuulata vähemalt [kümme|10] minutit päevas.', 'Lihtsad on lastele mõeldud [raamatud].', 'Uued sõnad tuleb kirjutada [kaartidele].', 'Vigu ei pea [kartma].', 'Vigadest me [õpime].', 'Õpetaja nimi on [Liis].', 'Eksami sooritamiseks tuleb harjutada iga [päev].']),
      B.wordorder('068_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma hakkan iga päev raadiot kuulama.', 'Ta proovib lugeda lihtsaid raamatuid.', 'Me tahame juunis eksami sooritada.', 'Sofia hakkab ülikoolis eesti keelt rääkima.', 'Ma proovin uued sõnad meelde jätta.', 'Ma hakkan käima keelekohvikus kaks korda nädalas.', 'Proovige lugeda lastele mõeldud raamatuid.', 'Ärge kartke vigu teha!']),
      B.dictation('068_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Hakake kuulama eesti raadiot iga päev.', 'Proovige lugeda lihtsaid raamatuid.', 'Ma hakkan käima keelekohvikus.', 'Ta tahab kirjutada ilma vigadeta.', 'Ärge kartke vigu teha.', 'Minu eesmärk on sooritada eksam.', 'Ma proovin uued sõnad meelde jätta.', 'Tütar on minu parim õpetaja.'], 8),
      B.speaking('068_p_say', 'Kes mida teeb?', 'Räägi tekstist: Sofia, Markuse ja Oksana plaanid.', ['Mida Sofia tahab?', 'Mida Markus hakkab tegema?', 'Mida Oksana proovib?', 'Kelle plaan sulle meeldib? Miks?'], [60, 90]),
    ],
    transfer: [
      B.text('068_t_situation', 'Uus olukord', 'Sinu naaber Viktor on pensionär. Ta tahab hakata eesti keelt õppima, aga ta ei tea, kust alustada. Aega tal on, aga raha on vähe. Raamatukogus on uus kuulutus. Aita Viktoril valida ja teha eesmärkide kaart.'),
      B.reading('068_t_ad', 'Loe raamatukogu kuulutust.', 'Loe kuulutust ja vasta küsimustele.', 'Õpi eesti keelt raamatukogus!',
        'Tartu linnaraamatukogu kutsub kõiki eesti keelt õppima! Esmaspäeviti kell 18 on keelekohvik. Seal saab rääkida eestlastega ja proovida uusi sõnu. Keelekohvik on tasuta. Kolmapäeviti kell 17 on raamatuklubi algajatele. Me loeme koos lühikesi raamatuid ja räägime neist. Raamatu saad raamatukogust. Reedeti kell 16 on filmiõhtu. Filmid on eesti keeles, eesti subtiitritega. Kui sa tahad õppida kodus, proovi meie veebikursust. Seal on igal nädalal uued harjutused. Veebikursus maksab 10 eurot kuus. Kõikidele üritustele tuleb registreeruda. Registreeru infoletis või telefonil. Tule ja hakka julgelt rääkima!',
        [['Mis päeval on keelekohvik?', 'esmaspäeviti|esmaspäeval'], ['Kui palju keelekohvik maksab?', 'tasuta|see on tasuta'], ['Kellele on raamatuklubi?', 'algajatele'], ['Mis keeles on filmide subtiitrid?', 'eesti keeles'], ['Kui palju maksab veebikursus?', '10 eurot kuus|kümme eurot kuus|10 eurot'], ['Kus saab registreeruda?', 'infoletis või telefonil|infoletis|telefonil'], ['Mis kell on filmiõhtu?', 'kell 16|reedeti kell 16|16'], ['Kust saab raamatuklubi raamatu?', 'raamatukogust']]),
      B.choice('068_t_choice', 'Mis sobib?', 'Vali igale inimesele sobiv võimalus.', [
        ['Viktor tahab rääkida, aga tal pole raha.', 'keelekohvik', 'veebikursus', 'filmiõhtu'], ['Liis armastab lugeda.', 'raamatuklubi', 'keelekohvik', 'filmiõhtu'],
        ['Jaan töötab õhtuti ja tahab õppida kodus.', 'veebikursus', 'raamatuklubi', 'keelekohvik'], ['Kati tahab vaadata filme eesti keeles.', 'filmiõhtu', 'raamatuklubi', 'veebikursus'],
        ['Olga on vaba ainult kolmapäeval.', 'raamatuklubi', 'keelekohvik', 'filmiõhtu'], ['Anna tahab esmaspäeva õhtul eestlastega rääkida.', 'keelekohvik', 'filmiõhtu', 'raamatuklubi'], ['Markus ei saa õhtuti kodust välja minna.', 'veebikursus', 'keelekohvik', 'raamatuklubi'], ['Sofia on vaba ainult reedel.', 'filmiõhtu', 'raamatuklubi', 'keelekohvik']], 'full', 'g_read'),
      B.rolecards('068_p_roles', 'Õppimise nõuanne.', 'A räägib probleemist, B annab nõu. Siis vahetage.',
        'Sul on keeleõppes probleem: sõnad, kuulamine või rääkimine. Räägi sellest.', 'Kuula ja anna kaks nõu: Proovi…! Hakka…!',
        ['Ma ei saa aru…', 'Ma unustan…', 'Mida ma pean tegema?'], ['Proovi …-da!', 'Hakka …-ma!', 'Mina hakkasin ka…']),
      B.speaking('068_t_say', 'Räägi grupile.', 'Räägi grupile oma eesmärgist ja plaanist 1–2 minutit.', ['Mis on sinu eesmärk?', 'Mida sa hakkad tegema?', 'Mida sa proovid?', 'Kuidas sa kontrollid?'], [60, 120]),
      B.letter('068_t_letter', 'Kiri Viktorile.', 'Kirjuta Viktorile 40–60 sõna: mis talle sobib ja miks.', 'Tere, Viktor!', 'Edu!', [40, 60]),
      B.writing('068_t_goal', 'Minu eesmärkide kaart.', 'Kirjuta oma eesmärgid 6–8 lausega: tahan, hakkan, proovin.', [6, 8], ['tahan', 'hakkan', 'proovin', 'eesmärk'], 3),
      B.rubric('068_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas Viktorile on valik ja põhjus (sest…).', 'tahan / proovin + da ja hakkan + ma on õiged.', 'Eesmärgid on konkreetsed: mida, millal, kui tihti.', 'Suuline plaan on selge ja kestab umbes minuti.']),
      B.selfcheck('068_t_self', ['Ma leian kuulutusest õppimise võimalused.', 'Ma valin sõbrale sobiva võimaluse ja põhjendan.', 'Ma kirjutan oma eesmärgid.', 'Ma räägin grupile oma plaanist.'], 'Plaan on tehtud'),
    ],
  },

  'a2-069': {
    title: 'Minu keeleõppe plaan',
    canDo: 'Ma kirjutan oma kahe nädala keeleõppe plaani 80–100 sõnaga ja kasutan vähemalt viit ajamarkerit (iga päev, kaks korda nädalas…).',
    template: 'v3',
    discover: [
      B.text('069_d_situation', 'Oksana plaan', 'Oksana õpib eesti keelt juba pool aastat. Lugemisest saab ta hästi aru, aga rääkimine on raske. Kahe nädala pärast on tal tööintervjuu eesti keeles. Oksana teeb endale plaani.'),
      B.truefalse('069_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Oksana õpib eesti keelt kaks kuud.', false], ['Lugemine on Oksanale lihtsam kui rääkimine.', true], ['Oksanal on varsti tööintervjuu.', true], ['Intervjuu on vene keeles.', false], ['Oksana teeb õppimiseks plaani.', true], ['Oksana teeb plaani kaheks nädalaks.', true], ['Rääkimine on Oksanale kõige lihtsam.', false], ['Oksana õpib eesti keelt pool aastat.', true]]),
      B.reading('069_d_read', 'Loe: Oksana plaan.', 'Loe plaani ja vasta küsimustele.', 'Minu kahe nädala plaan',
        'Minu eesmärk: kahe nädala pärast räägin tööintervjuul julgelt eesti keeles. Kõige raskem on minu jaoks rääkimine. Lugemine ja kirjutamine on lihtsamad. Seepärast tahan rohkem rääkida. Iga päev kordan kümme uut sõna. Hommikul bussis kuulan eesti raadiot kümme minutit. Kaks korda nädalas, teisipäeval ja reedel, räägin naabri Katiga eesti keeles. Me joome koos kohvi ja ta küsib minult intervjuu küsimusi. Igal õhtul loen ühe lühikese uudise. Siis räägin valjusti, millest see on. Nädalavahetusel salvestan oma häält telefoni. Ma kuulan, kuidas ma hääldan. Pühapäeval kontrollin, mida ma tegin. Kui ma ei teinud kõike, ma ei muretse, vaid jätkan. Pärast kahte nädalat tahan rääkida paremini ja kiiremini.',
        [['Mis on Oksana eesmärk?', 'rääkida intervjuul julgelt eesti keeles|rääkida intervjuul eesti keeles'], ['Miks tahab Oksana rohkem rääkida?', 'rääkimine on kõige raskem|see on kõige raskem'], ['Mida teeb Oksana iga päev?', 'kordab kümme sõna|kordab sõnu'], ['Kellega ja kui tihti räägib Oksana eesti keeles?', 'Katiga kaks korda nädalas|naabriga kaks korda nädalas|Katiga'], ['Miks salvestab Oksana oma häält?', 'et kuulata, kuidas ta hääldab|et kontrollida hääldust'], ['Mida teeb Oksana, kui ta ei teinud kõike?', 'ei muretse ja jätkab|jätkab'], ['Mida kuulab Oksana bussis?', 'eesti raadiot|raadiot'], ['Mida teeb Oksana pühapäeval?', 'kontrollib, mida ta tegi|kontrollib plaani|kontrollib']]),
      B.notice('069_d_notice', 'Märka: plaani laused', [
        '**tahan** + da: tahan **rääkida**, tahan **õppida**', '**pean / hakkan** + ma: pean **kordama**, hakkan **lugema**', '**iga päev**, **igal õhtul**, **kaks korda nädalas**, **nädalavahetusel**', '**Kõige raskem** on…, tahan rääkida **paremini**',
      ], 'full'),
      B.gaps('069_d_gaps', 'Tahan, pean või hakkan?', 'Kirjuta tegusõna õiges vormis.', [
        'Ma tahan paremini [rääkida] (rääkima).', 'Ma pean iga päev sõnu [kordama] (kordama).', 'Ma hakkan õhtuti uudiseid [lugema] (lugema).', 'Ma tahan eesti filme [vaadata] (vaatama).', 'Ma tahan iga päev raadiot [kuulata] (kuulama).', 'Ma pean rohkem [harjutama] (harjutama).', 'Ma tahan eesti keeles paremini [kirjutada] (kirjutama).', 'Ma hakkan nädalavahetusel oma häält [salvestama] (salvestama).']),
      B.errorfix('069_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma tahan rääkima paremini.', 'Ma tahan paremini rääkida.|Ma tahan rääkida paremini.'], ['Ma pean kordada sõnad.', 'Ma pean sõnu kordama.|Ma pean sõnad kordama.'], ['Iga päeval ma loen.', 'Iga päev ma loen.|Iga päev loen ma.'], ['Kaks kord nädalas ma räägin.', 'Kaks korda nädalas ma räägin.|Kaks korda nädalas räägin ma.'], ['Ma hakkan lugeda uudiseid.', 'Ma hakkan uudiseid lugema.|Ma hakkan lugema uudiseid.'], ['Ma tahan õppima eesti keelt.', 'Ma tahan eesti keelt õppida.|Ma tahan õppida eesti keelt.'], ['Igal laupäev ma kirjutan kirja.', 'Igal laupäeval kirjutan kirja.|Igal laupäeval ma kirjutan kirja.'], ['Ma pean rohkem harjutada.', 'Ma pean rohkem harjutama.']]),
      TR('069_d_tr', ['Каждый день я повторяю десять слов.', 'Два раза в неделю я говорю с соседкой.', 'Самое трудное — говорение.', 'Я хочу говорить лучше.', 'В воскресенье я проверяю план.', 'Я хочу сдать экзамен в июне.', 'После работы я учу слова пятнадцать минут.', 'Каждую субботу я пишу письмо.']),
      B.speaking('069_d_say', 'Kuidas sina õpid?', 'Räägi paarilisele, kuidas sa praegu eesti keelt õpid.', ['Mida sa teed iga päev?', 'Mida sa teed kaks korda nädalas?', 'Mis on sinu jaoks kõige raskem?', 'Mida sa teed nädalavahetusel?', 'Kuidas sa kontrollid oma õppimist?'], [60, 120]),
      B.writing('069_d_write', 'Minu esimene plaan.', 'Kirjuta 6–8 lauset: mida ja kui tihti sa järgmisel nädalal õpid.', [6, 8], ['iga päev', 'kaks korda nädalas', 'tahan', 'pean'], 3),
    ],
    practice: [
      B.reading('069_p_read', 'Loe: Sergei plaan.', 'Loe tekst ja vasta küsimustele.', 'Sergei plaan',
        'Sergei elab Narvas ja töötab bussijuhina. Ta tahab teha A2 eksami juuni alguses. Tal on vähe aega, sest ta töötab vahetustega. Seepärast tegi ta väga lihtsa plaani. Tööpäevadel kuulab ta bussis pausi ajal eesti raadiot. Pärast tööd õpib ta veerand tundi uusi sõnu telefonis. Kaks korda nädalas käib ta õhtul keelekursusel. Kõige raskem on talle kirjutamine. Seepärast kirjutab ta igal laupäeval ühe lühikese kirja oma õpetajale. Õpetaja parandab vead ja saadab kirja tagasi. Pühapäeval Sergei puhkab ja ei õpi üldse. Iga kuu lõpus teeb ta proovitesti internetis. Viimases testis sai ta seitsekümmend punkti sajast.',
        [['Miks on Sergeil vähe aega?', 'ta töötab vahetustega'], ['Mida teeb Sergei pausi ajal?', 'kuulab raadiot|kuulab eesti raadiot'], ['Kui kaua õpib ta pärast tööd sõnu?', 'veerand tundi|15 minutit'], ['Mis on Sergeile kõige raskem?', 'kirjutamine'], ['Mida ta selle vastu teeb?', 'kirjutab igal laupäeval kirja õpetajale|kirjutab kirja õpetajale'], ['Kui tihti teeb Sergei proovitesti?', 'kord kuus|iga kuu lõpus'], ['Kus Sergei elab?', 'Narvas'], ['Millal tahab Sergei eksami teha?', 'juuni alguses|juunis']]),
      B.cloze('069_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Sofia nädala plaan', [
        'Sofia tahab eesti keeles paremini {*kirjutada|kirjutama|kirjutab}. Seepärast tegi ta plaani.',
        '',
        '{*Iga|Igal|Igas} päev kirjutab ta päevikusse viis lauset. Kaks {*korda|kord|korral} nädalas saadab ta õpetajale kirja.',
        '',
        '{*Igal|Iga|Igas} õhtul loeb ta ühe lühikese uudise. {*Nädalavahetusel|Nädalavahetus|Nädalavahetuse} vaatab ta eesti filmi.',
        '',
        'Kõige {*raskem|raske|raskelt} on talle grammatika. Ta {*hakkab|tahab|proovib} iga päev grammatikat harjutama. Pühapäeval {*kontrollib|kontrollima|kontrolli} ta, mida ta tegi.',
      ], 'g_vocab'),
      B.formtext('069_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Oksana plaan', [
        'Minu eesmärk on [rääkida] (rääkima) intervjuul julgelt.',
        '',
        '[Igal] (iga) hommikul kuulan ma raadiot. Kaks [korda] (kord) nädalas räägin ma naabriga.',
        '',
        'Ma [pean] (pidama) iga päev sõnu kordama. [Nädalavahetusel] (nädalavahetus) salvestan ma oma häält.',
        '',
        'Kõige [raskem] (raske) on minu jaoks hääldus. Ma [tahan] (tahtma) seda rohkem [harjutada] (harjutama).',
      ], 'g_notice'),
      B.choice('069_p_choice', 'Sergei plaan.', 'Loe teksti uuesti. Vali õige vastus.', [['Mis tööd teeb Sergei?', 'Ta on bussijuht.', 'Ta on õpetaja.', 'Ta on kokk.'], ['Millal tahab Sergei eksami teha?', 'juuni alguses', 'mai lõpus', 'augustis'], ['Mida teeb Sergei bussis pausi ajal?', 'kuulab eesti raadiot', 'loeb raamatut', 'magab'], ['Kui kaua õpib ta pärast tööd sõnu?', 'veerand tundi', 'kaks tundi', 'viis minutit'], ['Mitu korda nädalas käib ta kursusel?', 'kaks korda', 'iga päev', 'kord kuus'], ['Mis on Sergeile kõige raskem?', 'kirjutamine', 'lugemine', 'kuulamine'], ['Kellele kirjutab ta igal laupäeval?', 'oma õpetajale', 'oma emale', 'oma ülemusele'], ['Kui tihti teeb ta proovitesti?', 'kord kuus', 'iga päev', 'kord aastas']], 'full', 'g_read'),
      B.gaps('069_p_gaps', 'Kui tihti?', 'Täida lüngad. Kaks sõna jääb üle.', ['Ma kordan sõnu [iga] päev.', 'Ma räägin Sofiaga kaks [korda] nädalas.', '[Igal] õhtul loen uudiseid.', '[Nädalavahetusel] vaatan eesti filmi.', 'Test on [kord] kuus.', 'Ma käin tunnis [esmaspäeviti].', 'Ma kirjutan õpetajale [igal] laupäeval.', 'Täna on [esmaspäev] ja mul on tund.'], ['iga', 'igal', 'korda', 'kord', 'nädalavahetusel', 'nädalavahetus', 'esmaspäeviti', 'esmaspäev', 'laupäev', 'iga kord']),
      B.transformation('069_p_trans', 'Tee plaan konkreetseks.', 'Kirjuta lause antud sõnadega.', [
        ['Ma õpin vahel sõnu.', 'iga päev, kümme sõna', 'Iga päev õpin kümme sõna.|Ma õpin iga päev kümme sõna.'],
        ['Ma kuulan mõnikord raadiot.', 'igal hommikul', 'Igal hommikul kuulan raadiot.|Ma kuulan igal hommikul raadiot.'],
        ['Ma räägin kellegagi eesti keeles.', 'kaks korda nädalas, Kati', 'Kaks korda nädalas räägin Katiga eesti keeles.|Ma räägin kaks korda nädalas Katiga eesti keeles.'],
        ['Ma tahan paremini kirjutada.', 'hakkan, igal õhtul', 'Igal õhtul hakkan kirjutama.|Ma hakkan igal õhtul kirjutama.'],
        ['Ma loen midagi eesti keeles.', 'nädalavahetusel, uudised', 'Nädalavahetusel loen eesti keeles uudiseid.|Nädalavahetusel loen uudiseid eesti keeles.'], ['Ma kirjutan vahel.', 'igal laupäeval, üks kiri', 'Igal laupäeval kirjutan ühe kirja.|Ma kirjutan igal laupäeval ühe kirja.'], ['Ma vaatan filme.', 'nädalavahetusel, eesti filmid', 'Nädalavahetusel vaatan eesti filme.|Ma vaatan nädalavahetusel eesti filme.'], ['Ma kordan sõnu.', 'igal õhtul, kümme minutit', 'Igal õhtul kordan kümme minutit sõnu.|Ma kordan igal õhtul kümme minutit sõnu.']]),
      B.wordorder('069_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Pärast tööd õpin veerand tundi sõnu.', 'Igal laupäeval kirjutan õpetajale kirja.', 'Kõige raskem on mulle kirjutamine.', 'Pühapäeval ma puhkan.', 'Iga kuu lõpus teen proovitesti.', 'Iga päev kordan kümme uut sõna.', 'Igal õhtul loen ühe lühikese uudise.', 'Kaks korda nädalas räägin Katiga.']),
      D('069_p_dict', ['Ma tahan teha eksami.', 'Pärast tööd õpin sõnu.', 'Igal laupäeval kirjutan kirja.', 'Õpetaja parandab vead.', 'Ma hakkan uudiseid lugema.', 'Iga päev kordan sõnu.', 'Igal õhtul loen uudise.', 'Kõige raskem on rääkimine.']),
      B.speaking('069_p_say', 'Võrdle plaane.', 'Räägi paarilisele oma plaanist. Paariline küsib.', ['Mis on sinu eesmärk?', 'Mida sa teed iga päev?', 'Kuidas sa kontrollid?'], [60, 90]),
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
      ], ['Jelena alustab uut tööd [novembris|esimesel novembril|1. novembril].', 'Talle on kõige raskem [kuulamine].', 'Iga päev loeb Jelena [uudiseid].', 'Jelenal on kaks väikest [last].', 'Päevas on tal umbes [kakskümmend|20] minutit.', 'Ta saab õppida [õhtul|õhtuti].', 'Jelena saab õppida kella [üheksast] pool kümneni.', 'Jelena palub kirjutada [e-kirja|e-kiri].']),
      B.gaps('069_t_gaps', 'Jelena plaan.', 'Täida plaan sobivate sõnadega. Kolm sõna jääb üle.', ['[Iga] päev kuulan bussis eesti raadiot.', 'Tööl [tahan] kolleegidega rohkem rääkida.', 'Õhtul [pean] kümme uut sõna kordama.', '[Kaks] korda nädalas vaatan eesti saadet.', 'Kõige [raskem] on kuulamine.', 'Kahe nädala pärast [saan] paremini aru.', '[Igal] nädalavahetusel vaatan ühe filmi.', 'Test on [kord] kuus.'], ['iga', 'igal', 'tahan', 'pean', 'kaks', 'kord', 'raskem', 'raske', 'saan', 'korda', 'vaatan']),
      B.planning('069_t_plan', 'Plaan Jelenale.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis on Jelena eesmärk?', 'Mida ta teeb iga päev?', 'Mida ta teeb nädalavahetusel?', 'Kuidas ta kuulamist harjutab?', 'Kuidas ta kontrollib?']),
      B.rolecards('069_t_roles', 'Arutage plaani.', 'Rääkige 2–3 minutit.',
        'Sa oled Jelena. Ütle, mis on raske ja kui palju aega sul on.', 'Sa aitad Jelenat. Paku kolm konkreetset tegevust ja ajamarkerit.',
        ['Kõige raskem on…', 'Mul on ainult…', 'See on hea mõte.'], ['Iga päev võiksid…', 'Kaks korda nädalas…', 'Kuidas oleks, kui…?']),
      B.speaking('069_t_mono', 'Minu eesmärk.', 'Räägi 1–2 minutit oma keeleõppe eesmärgist ja plaanist.', ['Mis on sinu eesmärk?', 'Mis on sinu jaoks kõige raskem?', 'Mida sa teed iga päev?', 'Kuidas sa kontrollid, et läheb hästi?'], [60, 120]),
      B.letter('069_t_letter', 'E-kiri Jelenale.', 'Kirjuta Jelenale kahe nädala plaan. Kasuta vähemalt viit ajamarkerit.', 'Tere, Jelena!', 'Edu sulle!', [80, 100]),
      B.rubric('069_t_rubric', 'Kontrolli oma kirja.', 'Märgi, mis on olemas.', ['Kirjas on eesmärk.', 'Kirjas on vähemalt viis ajamarkerit.', 'Iga tegevus on konkreetne: mida, millal, kui kaua.', 'Kirjas on kontroll: kuidas Jelena teab, et läheb hästi.', 'Kirjas on 80–100 sõna.']),
      B.selfcheck('069_t_self', ['Ma oskan kasutada plaani sõnu: eesmärk, harjutama, kordama.', 'Ma oskan häälsõnumist leida, mis on raske ja kui palju on aega.', 'Ma oskan kasutada tahan + da ja pean + ma plaanis.', 'Ma oskan kirjutada 80–100-sõnalise plaani viie ajamarkeriga.'], 'Plaan Jelenale'),
    ],
  },

  'a2-070': {
    title: 'Kontroll 14 — õppimine ja keel',
    assessment: true,
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
