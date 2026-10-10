// B1 course (A2 → B1 roadmap), module 2 „Mina, pere ja suhted” (a2b1-006…010), stage A2.
// Harjuta + Kasuta for the published Avasta sheets: the same core words, the genitive (kelle?), on / tal on and
// sest-reasons are practised in different task types, then used in new situations. Material also from the
// KeeleSepp A2→B1 workbook, lessons 11–12 (Perekond ja suhted; Välimus ja iseloom).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2b1-module-02', course: 'b1', title: 'Mina, pere ja suhted', level: 'A2' };

export const LESSONS = {
  'a2b1-006': {
    title: 'Pere ja lähedased',
    canDo: 'Ma tutvustan 4–5 lähedast inimest ja lisan igaühe kohta vähemalt ühe sisulise detaili.',
    practice: [
      B.match('006_p_words', 'Kes on kes?', 'Ühenda sõna ja seletus.', [
        ['vanaema', 'ema või isa ema'], ['onu', 'ema või isa vend'], ['tädi', 'ema või isa õde'], ['õetütar', 'õe või venna tütar'],
        ['abikaasa', 'mees või naine abielus'], ['sugulane', 'pereliige laiemas mõttes'],
      ], 'half'),
      B.truefalse('006_p_logic', 'Pereloogika.', 'Mõtle ja vasta: õige või vale?', [
        ['Minu isa vend on minu onu.', true], ['Minu ema õde on minu vanaema.', false], ['Minu venna poeg on minu vennapoeg.', true],
        ['Abikaasa on alati vanem kui sina.', false], ['Minu vanaema poeg võib olla minu isa.', true],
      ]),
      B.gaps('006_p_gen', 'Kelle? Kasuta omastavat.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma elan koos [ema] (ema) ja [õega] (õde).', 'Pühapäeval läheme [vanaema] (vanaema) juurde.', 'See on minu [venna] (vend) jalgratas.',
        'Minu [isa] (isa) õde elab Pärnus.', 'Kas see on sinu [tädi] (tädi) koer?', 'Me tähistame [onu] (onu) sünnipäeva maal.',
      ]),
      B.wordorder('006_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Minu õde elab Tartus koos mehega.', 'Vanaisa parandab meiega jalgrattaid.', 'Me käime vanaema juures kaks korda kuus.', 'Minu parim sõber on mulle nagu vend.',
      ]),
      B.crossword('006_p_cross', 'Pere ristsõna.', 'Kirjuta sõna vihje järgi.', [
        ['Ema ja isa koos', 'vanemad'], ['Vanaema ja vanaisa koos', 'vanavanemad'], ['Minu ema ema', 'vanaema'], ['Poeg või tütar', 'laps'], ['Isa või ema', 'vanem'],
      ]),
      B.speaking('006_p_photo', 'Näita pilti ja räägi.', 'Kirjelda pere- või sõprade fotot. Räägi 1 minut.', [
        'Kes on pildil?', 'Kes ta sulle on?', 'Kus ja millal pilt tehti?', 'Mida te seal tegite?', 'Kellega sa kõige sagedamini suhtled?',
      ], [45, 90], ['Pildil on…', 'Vasakul on minu…', 'Ta on minu ema õde.', 'Me olime…']),
      B.selfcheck('006_p_self', ['Ma tean 10 pere sõna.', 'Ma ütlen, kes kellele on.', 'Ma kasutan omastavat: venna, õe, ema.', 'Ma räägin fotost 1 minuti.'], 'Pere sõnad on minu omad'),
    ],
    transfer: [
      B.text('006_t_situation', 'Uus olukord', 'Sa kolisid uude majja. Naaber kutsub sind kohvile ja tahab sinu perest rohkem teada.'),
      B.choice('006_t_reply', 'Sõbra vastus.', 'Sõber kirjutas tagasi. Vali sobiv reaktsioon.', [
        ['„Mu vanaema sai eile 90-aastaseks!”', 'Palju õnne talle!', 'Mis kell on?', 'Ma lähen poodi.'],
        ['„Mul sündis õetütar.”', 'Kui tore! Mis ta nimi on?', 'Väga kahju.', 'Kus on pood?'],
        ['„Mu vend kolis Soome.”', 'Kas sa igatsed teda?', 'Mul on kass.', 'Ma ei söö kala.'],
        ['„Me käisime perega matkal.”', 'Kuhu te läksite?', 'Kes sa oled?', 'Head ööd!'],
      ], 'full', 'g_use'),
      B.rolecards('006_t_roles', 'Naabrid tutvuvad.', 'Lugege oma rolli. Rääkige 2–3 minutit.',
        'Oled uus elanik. Tutvusta oma peret: vähemalt 4 inimest ja üks detail igaühe kohta. Küsi naabri pere kohta 2 küsimust.',
        'Oled naaber. Küsi uue elaniku pere kohta. Räägi ka oma lastest ja koerast.',
        ['Minu peres on…', 'Minu õde on…', 'Ta töötab…', 'Kas teil on lapsi?'], ['Kellega te siin elate?', 'Kas teie pere on suur?', 'Meil on kaks last.', 'See on meie koer Muki.']),
      B.planning('006_t_plan', 'Enne kirjutamist.', 'Vali 4 lähedast inimest. Kirjuta märksõnad.', ['Kes ta on?', 'Kus ta elab?', 'Mida ta teeb?', 'Mida te koos teete?']),
      B.writing('006_t_write', 'Kiri sõbrale välismaale.', 'Sõber küsib sinu pere kohta. Kirjuta 6–8 lauset.', [6, 8], ['minu', 'elab', 'koos', 'sest'], 3),
      B.selfcheck('006_t_self', ['Ma tutvustan peret ilma näidiseta.', 'Ma küsin teise inimese pere kohta.', 'Ma kirjutan kirja 6–8 lausega.', 'Ma reageerin sõbra uudisele.'], 'Tutvustan oma lähedasi'),
    ],
  },

  'a2b1-007': {
    title: 'Välimus ja iseloom',
    canDo: 'Ma kirjeldan inimese välimust ja iseloomu vähemalt 8 seotud lausega ning kasutan 10 teemakohast omadussõna.',
    practice: [
      B.categorize('007_p_sort', 'Välimus või iseloom?', 'Sorteeri sõnad kahte rühma.', [
        ['Välimus', ['pikk', 'lühike', 'heledate juustega', 'prillidega', 'habemega', 'sale']], ['Iseloom', ['sõbralik', 'rahulik', 'abivalmis', 'tagasihoidlik', 'naljakas', 'kannatlik']],
      ]),
      B.match('007_p_opposites', 'Leia vastand.', 'Ühenda vastandsõnad.', [
        ['pikk', 'lühike'], ['rahulik', 'närviline'], ['avatud', 'tagasihoidlik'], ['tõsine', 'naljakas'], ['noor', 'vana'], ['laisk', 'töökas'],
      ], 'half'),
      B.gaps('007_p_onTal', 'Ta on või tal on?', 'Vali sõnapangast õige algus.', [
        '[Ta on] väga sõbralik.', '[Tal on] pikad heledad juuksed.', '[Ta on] natuke tagasihoidlik.', '[Tal on] sinised silmad.', '[Ta on] keskmist kasvu.', '[Tal on] alati hea tuju.',
      ], ['ta on', 'tal on'], 'half'),
      B.errorfix('007_p_fix', 'Paranda kirjeldus.', 'Kirjuta lause õigesti.', [
        ['Ta on pikad juuksed.', 'Tal on pikad juuksed.'], ['Tal on väga sõbralik.', 'Ta on väga sõbralik.'], ['Minu õde on lühike juuksed.', 'Minu õel on lühikesed juuksed.'], ['Ta on prillid.', 'Tal on prillid.'],
      ]),
      B.choice('007_p_degree', 'Kui tugev on omadus?', 'Vali lause, mis sobib olukorraga.', [
        ['Mari naerab alati ja räägib palju nalja.', 'Ta on väga naljakas.', 'Ta on natuke naljakas.', 'Ta ei ole naljakas.'],
        ['Jaan räägib vahel vähe, aga sõpradega palju.', 'Ta on natuke tagasihoidlik.', 'Ta on väga avatud.', 'Ta on tõsine ja kuri.'],
        ['Kati aitab kõiki ja küsib, kuidas läheb.', 'Ta on väga hooliv.', 'Ta on laisk.', 'Ta on üsna närviline.'],
        ['Peeter ootab rahulikult ka tund aega.', 'Ta on väga kannatlik.', 'Ta on kiire ja närviline.', 'Ta on natuke laisk.'],
      ], 'full', 'g_vocab'),
      B.dialogue('007_p_dialog', 'Kes see on?', 'Täida dialoog sobivate sõnadega.', 'Liis', 'Omar', [
        ['A', 'Kes on see mees akna juures?'], ['B', 'See on meie uus õpetaja. [Tal on] habe ja prillid.'], ['A', 'Milline ta [on]?'],
        ['B', 'Ta on [rahulik] ja kannatlik. Ta ei karju kunagi.'], ['A', 'Ja kas ta on [naljakas]?'], ['B', 'Natuke. Ta räägib vahel nalja, aga tunnis on ta tõsine.'],
      ]),
      B.speaking('007_p_guess', 'Arva ära, kes see on.', 'Kirjelda tuntud inimest. Paariline arvab, kes see on.', [
        'Milline ta välja näeb?', 'Milline ta iseloomult on?', 'Mida ta teeb?', 'Miks inimesed teda tunnevad?',
      ], [45, 90], ['Ta on…', 'Tal on…', 'Iseloomult on ta…', 'Ta on natuke / üsna / väga…']),
      B.selfcheck('007_p_self', ['Ma eristan ta on ja tal on.', 'Ma tean 6 vastandpaari.', 'Ma täpsustan: natuke, üsna, väga.', 'Ma kirjeldan inimest nii, et teine arvab ära.'], 'Kirjeldan täpselt'),
    ],
    transfer: [
      B.reading('007_t_ad', 'Loe kuulutust.', 'Loe kuulutus ja vasta küsimustele.', 'Otsime lapsehoidjat',
        'Meie pere otsib lapsehoidjat kahele lapsele. Mia on viieaastane ja väga energiline. Ta armastab joonistada, laulda ja palju küsida. Kaspar on kaheksa. Ta on tagasihoidlik, aga väga tark. Ta mängib malet ja loeb palju. Uute inimestega on ta alguses vaikne, aga hiljem räägib palju. Otsime rahulikku ja kannatlikku inimest. Hea, kui oskad mängida õues ja lugeda raamatuid. Sa peaksid olema ka täpne, sest lapsed lähevad kell kuus trenni. Töö on kolm päeva nädalas pärast kooli, kella kolmest seitsmeni. Kirjuta meile ja räägi endast!',
        [['Mitu last peres on?', 'kaks|2'], ['Milline on Mia?', 'energiline|väga energiline'], ['Mida teeb Kaspar meelsasti?', 'mängib malet ja loeb|mängib malet|loeb'], ['Millist inimest pere otsib?', 'rahulikku ja kannatlikku|rahulik ja kannatlik'], ['Mitu päeva nädalas on töö?', 'kolm|3']]),
      B.planning('007_t_plan', 'Kas sobid?', 'Mõtle, miks sa sobid lapsehoidjaks.', ['Milline sa oled?', 'Mida sa oskad lastega teha?', 'Milline kogemus sul on?', 'Millal sul aega on?']),
      B.letter('007_t_letter', 'Vasta kuulutusele.', 'Kirjuta perele. Kirjelda ennast ja põhjenda, miks sobid.', 'Tere, Mia ja Kaspari pere!', 'Parimate soovidega', [60, 90]),
      B.rolecards('007_t_roles', 'Telefonikõne.', 'Rääkige 2 minutit. Seejärel vahetage rollid.',
        'Oled lapsehoidja. Ema helistab. Kirjelda ennast ja küsi laste kohta.', 'Oled laste ema. Küsi, milline lapsehoidja on ja mida ta lastega teeks.',
        ['Ma olen kannatlik, sest…', 'Mulle meeldib…', 'Milline on Kaspar?'], ['Milline te olete?', 'Mida te lastega teeksite?', 'Mia on väga energiline.']),
      B.speaking('007_t_compare', 'Võrdle ennast.', 'Kas sa sarnaned oma pereliikmega? Räägi 1 minut.', [
        'Kellega sa sarnaned välimuselt?', 'Kellega sa sarnaned iseloomult?', 'Mille poolest te erinete?',
      ], [45, 90], ['Me oleme mõlemad…', 'Tema on…, aga mina olen…', 'Välimuselt…']),
      B.selfcheck('007_t_self', ['Ma mõistan kuulutust.', 'Ma kirjeldan ennast töö jaoks.', 'Ma põhjendan, miks sobin.', 'Ma võrdlen ennast teisega.'], 'Kirjeldan ennast ja teisi'),
    ],
  },

  'a2b1-008': {
    title: 'Kelle? Kelle oma?',
    canDo: 'Ma küsin ja vastan kuuluvuse kohta ning kasutan genitiivi õigesti vähemalt 8 juhul 10-st.',
    practice: [
      B.table('008_p_table', 'Omastav vorm.', 'Kirjuta puuduv vorm.', 'nimetav, omastav (kelle?), näide', [
        'ema | [ema] | ema auto', 'õde | [õe] | õe tuba', 'vend | [venna] | venna ratas', 'sõber | [sõbra] | sõbra kass', 'laps | [lapse] | lapse mänguasi', 'õpetaja | [õpetaja] | õpetaja laud',
      ]),
      B.wordforms('008_p_pron', 'Kelle oma?', 'Kirjuta asesõna omastavas.', [
        ['mina', 'kelle?', 'minu'], ['sina', 'kelle?', 'sinu'], ['tema', 'kelle?', 'tema'], ['meie', 'kelle?', 'meie'], ['teie', 'kelle?', 'teie'], ['nemad', 'kelle?', 'nende'],
      ]),
      B.manymatch('008_p_owners', 'Kellele mis kuulub?', 'Ühenda ese ja omanik. Mõni omanik sobib mitu korda.',
        ['tööraamat', 'stetoskoop', 'mänguauto', 'võtmed', 'pall'], ['õpetaja', 'arst', 'laps', 'koristaja']),
      B.transformation('008_p_trans', 'Ütle teisiti.', 'Kirjuta lause kelle-vormiga.', [
        ['Raamat kuulub Marile.', 'See on …', 'See on Mari raamat.'], ['Jope kuulub minu vennale.', 'See on …', 'See on minu venna jope.'],
        ['Kass kuulub naabrile.', 'See on …', 'See on naabri kass.'], ['Auto kuulub meile.', 'See on …', 'See on meie auto.'],
      ]),
      B.errorfix('008_p_fix', 'Leia viga.', 'Kirjuta lause õigesti.', [
        ['See on minu vend auto.', 'See on minu venna auto.'], ['Kelle oma see kott on? — See on õde.', 'See on õe oma.'], ['Ma lähen sõber juurde.', 'Ma lähen sõbra juurde.'], ['See on nemad maja.', 'See on nende maja.'],
      ]),
      B.speaking('008_p_lost', 'Leitud asjad.', 'Õpetaja näitab asju. Küsi ja vasta paaris.', [
        'Kelle oma see on?', 'Kas see on sinu oma?', 'Kuidas sa tead?', 'Kellele me selle anname?',
      ], [45, 90], ['See on minu / sinu / tema oma.', 'See ei ole minu oma.', 'Ma arvan, et see on … oma, sest…']),
      B.selfcheck('008_p_self', ['Ma moodustan omastava 6 sõnast.', 'Ma tean minu, sinu, tema, meie, teie, nende.', 'Ma ütlen sama mõtte teisiti.', 'Ma küsin: kelle oma see on?'], 'Kelle? — tean!'),
    ],
    transfer: [
      B.listening('008_t_listen', 'Kuula teadet.', 'Õpetaja loeb teate. Täida lüngad.', [
        'Kooli infolauas on leitud asjad.', 'Esimene on sinine müts. See on ilmselt 2.b klassi õpilase oma.', 'Teine on must telefon. Telefonis on pilt koerast.',
        'Kolmas on õpetaja Kase vihmavari.', 'Asjad saab kätte reedeni infolauast.',
      ], ['Leitud on sinine [müts].', 'Müts on ilmselt 2.b klassi [õpilase] oma.', 'Telefonis on pilt [koerast].', 'Vihmavari on õpetaja [Kase] oma.', 'Asjad saab kätte [reedeni].']),
      B.choice('008_t_check', 'Kontrolli mõtet.', 'Vali õige vastus.', [
        ['„See on Kase oma.” Mis see tähendab?', 'Asi kuulub Kasele.', 'Kask on puu.', 'Asi on kuuse all.'],
        ['Mis küsimus sobib: „See on nende maja.”?', 'Kelle maja see on?', 'Kus maja on?', 'Mis värvi maja on?'],
        ['Mis on õige?', 'Ma lähen sõbra juurde.', 'Ma lähen sõber juurde.', 'Ma lähen sõbrale juurde.'],
        ['Mis on õige?', 'See on õe tuba.', 'See on õde tuba.', 'See on õel tuba.'],
      ], 'full', 'g_use'),
      B.text('008_t_situation', 'Uus olukord', 'Sa jätsid kooli või tööle oma asja. Pead kirjutama infolauale ja seda kirjeldama.'),
      B.writing('008_t_note', 'Teade infolauale.', 'Kirjuta 5–7 lauset: mis, milline, kelle oma, kust leida.', [5, 7], ['minu', 'oma', 'see on'], 2),
      B.rolecards('008_t_roles', 'Infolaua juures.', 'Rääkige. Üks on infolaua töötaja, teine kaotas asja.',
        'Sa kaotasid koti. Kirjelda seda ja tõesta, et see on sinu oma.', 'Sa töötad infolauas. Sul on kaks sarnast kotti. Küsi täpsustavaid küsimusi.',
        ['See on minu oma.', 'Kotis on minu õe…', 'Seal on minu nimi.'], ['Milline teie kott on?', 'Mis kotis on?', 'Kelle oma see siis on?']),
      B.selfcheck('008_t_self', ['Ma saan aru lühikesest teatest.', 'Ma kirjeldan oma asja.', 'Ma tõestan, et asi on minu oma.', 'Ma valin õige kelle-vormi.'], 'Asi leitud!'),
    ],
  },

  'a2b1-009': {
    title: 'Koos veedetud aeg',
    canDo: 'Ma räägin 1,5–2 minutit ühest lähedasest inimesest ja meie ühistest tegevustest ning põhjendan vähemalt kahte eelistust.',
    practice: [
      B.diagram('009_p_map', 'mind', { title: 'Mida me koos teeme?', instruction: 'Kirjuta puuduvad tegusõnad.', center: 'Koos', nodes: 'kodus\n- [teeme] süüa\n- vaatame filmi\nõues\n- [jalutame]\n- sõidame rattaga\nreisil\n- [ujume]\n- pildistame' }),
      B.match('009_p_why', 'Tegevus ja põhjus.', 'Ühenda lause algus ja põhjus.', [
        ['Me jalutame õhtuti,', 'sest siis saame rahulikult rääkida.'], ['Me teeme koos süüa,', 'sest mõlemale meeldib proovida uusi retsepte.'],
        ['Me käime harva kinos,', 'sest piletid on kallid.'], ['Me helistame iga päev,', 'sest elame eri linnades.'],
      ], 'half', 'g_use'),
      B.gaps('009_p_freq', 'Kui tihti?', 'Vali sobiv sõna. Iga sõna üks kord.', [
        'Me sööme pühapäeviti [alati] koos lõunat.', 'Me käime [tavaliselt] laupäeval poes.', '[Vahel] läheme kinno.', 'Me reisime [harva], sest aega on vähe.', 'Me ei tülitse [peaaegu kunagi].',
      ], ['alati', 'tavaliselt', 'vahel', 'harva', 'peaaegu kunagi'], 'half'),
      B.wordorder('009_p_order', 'Sõnajärg sagedusega.', 'Pane laused kokku.', [
        'Me käime tavaliselt laupäeval ujumas.', 'Vahel teeme vanaemaga pannkooke.', 'Mulle meeldib koos vennaga mängida.', 'Me jalutame õhtul, sest ilm on ilus.',
      ]),
      B.truefalse('009_p_text', 'Loe ja otsusta.', 'Loe lauset. Kas järeldus on õige?', [
        ['Me kohtume harva. → Me kohtume väga tihti.', false], ['Mulle meeldib temaga süüa teha. → Mul on temaga hea koos olla.', true],
        ['Me helistame iga päev. → Me suhtleme sageli.', true], ['Me ei käi kunagi koos kinos. → Me käime vahel kinos.', false],
      ], 'full'),
      B.writing('009_p_write', 'Meie nädalavahetus.', 'Kirjuta 5–7 lauset. Kasuta kahte sagedussõna ja sest.', [5, 7], ['tavaliselt', 'vahel', 'sest', 'koos'], 3),
      B.selfcheck('009_p_self', ['Ma nimetan 6 ühist tegevust.', 'Ma ütlen, kui tihti me midagi teeme.', 'Ma põhjendan sest-lausega.', 'Ma kirjutan seotud teksti.'], 'Meil on koos tore'),
    ],
    transfer: [
      B.dialogue('009_t_chat', 'Sõnumid nädalavahetuseks.', 'Loe sõnumeid ja täida lüngad.', 'Kadri', 'Mart', [
        ['A', 'Kas sul on [laupäeval] aega?'], ['B', 'Hommikul mitte, sest mul on trenn. [Aga] pärastlõunal olen vaba.'], ['A', 'Äkki [läheme] koos rannas jalutama?'],
        ['B', 'Hea mõte! [Kohtume] kell neli bussipeatuses?'], ['A', 'Sobib! Võtan kaasa termose.'],
      ]),
      B.planning('009_t_plan', 'Planeeri päev.', 'Vali lähedane inimene ja planeeri ühine laupäev.', ['Kellega?', 'Mida te teete?', 'Mis kell ja kus kohtute?', 'Miks just see tegevus?']),
      B.rolecards('009_t_roles', 'Lepi kokku.', 'Tehke kokkulepe. Esimene aeg ei sobi.',
        'Tee ettepanek ühiseks tegevuseks. Kui aeg ei sobi, paku uus aeg.', 'Sul on plaan juba olemas. Keeldu viisakalt ja paku muu tegevus.',
        ['Kas lähme…?', 'Äkki…?', 'Kas … sobib?'], ['Kahjuks ma ei saa, sest…', 'Aga kas…?', 'Sobib!']),
      B.speaking('009_t_story', 'Räägi tähtsast inimesest.', 'Räägi 1,5–2 minutit ilma tekstita.', [
        'Kes see inimene on?', 'Mida te tavaliselt koos teete?', 'Mida te teete vahel?', 'Miks see sulle meeldib?', 'Mida tahaksite koos veel teha?',
      ], [90, 120], ['Me tavaliselt…', 'Vahel me…', 'Mulle meeldib, sest…', 'Tahaksime kunagi…']),
      B.writing('009_t_post', 'Postitus.', 'Kirjuta lühike postitus fotole: kellega, kus, miks see oli tore. 5–6 lauset.', [5, 6], ['koos', 'sest', 'mulle meeldis'], 2),
      B.selfcheck('009_t_self', ['Ma mõistan sõnumivestlust.', 'Ma planeerin ühise päeva.', 'Ma lepin kokku uue aja.', 'Ma räägin 1,5 minutit ja põhjendan.'], 'Lepin kokku ja põhjendan'),
    ],
  },

  'a2b1-010': {
    title: 'Kontroll 2 — pere ja suhted',
    canDo: 'Ma saan pere ja suhete teemalisest tekstist aru ning kasutan kirjeldusi ja kuuluvuse vorme iseseisvalt.',
    practice: [
      B.tip('010_p_how', 'Kuidas seda lehte teha?', 'Tee kõigepealt ülesanded ilma abita. Seejärel kontrolli Avasta lehte ja paranda.', 'full'),
      B.gaps('010_p_mixed', 'Kümme punkti: vormid.', 'Kirjuta õige vorm. Sõnapanka ei ole.', [
        'See on minu [õe] (õde) telefon.', '[Tal on] lühikesed heledad juuksed.', 'Me läheme pühapäeval [vanaema] (vanaema) juurde.', 'Ta [on] väga kannatlik.',
        'Kas see on [teie] (teie) auto?', 'Me kohtume harva, [sest] elame kaugel.',
      ]),
      B.errorfix('010_p_fix', 'Paranda neli viga.', 'Kirjuta laused õigesti.', [
        ['Ta on sinised silmad.', 'Tal on sinised silmad.'], ['See on nemad koer.', 'See on nende koer.'], ['Ma räägin oma õde.', 'Ma räägin oma õega.'], ['Me alati sööme koos.', 'Me sööme alati koos.'],
      ]),
      B.categorize('010_p_words', 'Sõnavara kontroll.', 'Sorteeri sõnad.', [
        ['Pere', ['vanavanemad', 'abikaasa', 'õetütar', 'onu']], ['Välimus', ['habemega', 'sale', 'prillidega']], ['Iseloom', ['kannatlik', 'abivalmis', 'tagasihoidlik']], ['Sagedus', ['harva', 'vahel', 'tavaliselt']],
      ]),
      B.reading('010_p_read', 'Loe ja vasta.', 'Loe tekst. Vasta lühidalt.', 'Pühapäev vanaema juures',
        'Igal pühapäeval sõidab Liisa pere vanaema juurde maale. Sõit kestab tund aega. Vanaema on rõõmsameelne ja hooliv. Ta teeb alati pannkooke ja küsib, kuidas lastel koolis läheb. Liisa vend Robin on vaikne. Tal on uued prillid ja ta loeb palju. Isa parandab vanaema aeda, sest vanaisa ei saa enam rasket tööd teha. Ema ja vanaema räägivad köögis. Seekord tuli ka onu Peeter. Ta on naljakas ja tõi kaasa oma koera. Õhtul jalutasid kõik koos järve ääres. Liisale meeldivad need pühapäevad väga.',
        [['Kuhu pere pühapäeval sõidab?', 'vanaema juurde|maale'], ['Milline on vanaema?', 'rõõmsameelne ja hooliv'], ['Kelle prillid on uued?', 'Robini|Robini omad'], ['Kes tõi kaasa koera?', 'onu Peeter|Peeter'], ['Mida kõik õhtul tegid?', 'jalutasid järve ääres|jalutasid']]),
      B.speaking('010_p_pic', 'Kirjelda pilti.', 'Kirjelda perepilti 1 minut: kes, milline, mida teevad.', ['Kes on pildil?', 'Milline keegi on?', 'Mida nad teevad?', 'Mis on nende suhe?'], [60, 90], ['Pildil on…', 'Tal on…', 'Ta on…', 'Nad…']),
      B.selfcheck('010_p_self', ['Ma tegin ülesanded ilma abita.', 'Ma parandasin oma vead.', 'Ma tean, mida veel korrata.', 'Ma olen valmis Kasuta leheks.'], 'Kordamine tehtud'),
    ],
    transfer: [
      B.text('010_t_situation', 'Lõpuülesanne', 'Sinu sõber tuleb sinu perega tutvuma. Valmista ta ette: kes on kes, milline keegi on ja mida te koos teete.'),
      B.letter('010_t_letter', 'Kiri sõbrale (70–90 sõna).', 'Kirjuta: kes on sinu peres, milline keegi on ja mida te koos teete.', 'Tere!', 'Kohtumiseni!', [70, 90]),
      B.rubric('010_t_rubric', 'Kontrolli kirja.', 'Märgi, mis on olemas.', ['Vähemalt 4 inimest ja igaühe kohta detail.', 'Vähemalt 2 välimuse ja 2 iseloomu kirjeldust.', 'Vähemalt 2 kelle-vormi.', 'Vähemalt 1 sest-lause.', 'Kiri on 70–90 sõna.']),
      B.rolecards('010_t_roles', 'Dialoog: külaline tuleb.', 'Rääkige 2–3 minutit.',
        'Sinu sõber tuleb külla. Tutvusta peret ja lepi kokku, mida te koos teete.', 'Sa oled külaline. Küsi pere kohta ja paku ühist tegevust. Esimene aeg sulle ei sobi.',
        ['See on minu…', 'Ta on…', 'Kas sulle sobib…?'], ['Kes see on?', 'Milline ta on?', 'Kahjuks ma ei saa, sest…']),
      B.speaking('010_t_mono', 'Monoloog: inimene, kes on mulle tähtis.', 'Räägi 2 minutit ilma tekstita.', ['Kes ta on ja kuidas te tuttavaks saite?', 'Milline ta on?', 'Mida te koos teete?', 'Miks ta on sulle tähtis?'], [90, 120]),
      B.selfcheck('010_t_self', ['Ma kirjutasin 70–90 sõna seotud kirja.', 'Ma kasutasin kirjeldusi ja kelle-vorme.', 'Ma pidasin dialoogi lõpuni.', 'Ma rääkisin 2 minutit.'], 'Moodul 2 tehtud'),
    ],
  },
};
