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
      B.reading('006_p_read', 'Loe: Kati pere.', 'Loe tekst. Vasta täislausega.', 'Kati suur pere',
        'Kati on kahekümne viie aastane ja elab Tallinnas. Tema pere on suur. Kati vanemad elavad Pärnus. Ema on õpetaja ja isa töötab sadamas. Katil on kaks venda ja üks õde. Vanem vend Martin elab Soomes koos naise ja kahe lapsega. Noorem vend Rasmus õpib ülikoolis. Kati õde Liisa on temast kolm aastat noorem. Õed räägivad telefonis peaaegu iga päev. Suvel tuleb kogu pere vanaema juurde maale. Vanaema maja on väike, aga kõigil on seal hea olla. Kati arvab, et pere on tema jaoks kõige tähtsam.',
        [['Kus elavad Kati vanemad?', 'Pärnus'], ['Mis tööd teeb Kati ema?', 'ta on õpetaja|õpetaja'], ['Mitu õde-venda Katil on?', 'kolm|kaks venda ja üks õde'], ['Kus elab Martin?', 'Soomes'], ['Kui tihti räägivad õed telefonis?', 'peaaegu iga päev'], ['Kus pere suvel kohtub?', 'vanaema juures maal|maal']]),
      B.wordforms('006_p_gen2', 'Kelle? Omastav kääne.', 'Kirjuta sõna omastavas.', [
        ['ema', 'kelle?', 'ema'], ['isa', 'kelle?', 'isa'], ['vend', 'kelle?', 'venna'], ['õde', 'kelle?', 'õe'], ['tütar', 'kelle?', 'tütre'], ['poeg', 'kelle?', 'poja'], ['vanaema', 'kelle?', 'vanaema'], ['laps', 'kelle?', 'lapse'],
      ]),
      B.gaps('006_p_poss', 'Minu, sinu, tema…', 'Vali sobiv asesõna.', [
        'Mina olen Kati. See on [minu] pere.', 'Sina oled Martin. Kas see on [sinu] naine?', 'Liisal on koer. See on [tema] koer.', 'Meil on suur maja. See on [meie] maja.',
        'Teil on kaks last. Kas need on [teie] lapsed?', 'Neil on uus auto. See on [nende] auto.',
      ], ['minu', 'sinu', 'tema', 'meie', 'teie', 'nende']),
      B.transformation('006_p_who', 'Ütle teisiti.', 'Kirjuta lause sõnaga „minu”.', [
        ['Mul on vend. Ta elab Soomes.', 'Minu …', 'Minu vend elab Soomes.'], ['Mul on õde. Ta on õpetaja.', 'Minu …', 'Minu õde on õpetaja.'],
        ['Mul on vanaema. Ta elab maal.', 'Minu …', 'Minu vanaema elab maal.'], ['Mul on poeg. Ta käib koolis.', 'Minu …', 'Minu poeg käib koolis.'],
        ['Mul on onu. Ta töötab sadamas.', 'Minu …', 'Minu onu töötab sadamas.'], ['Mul on tütar. Ta on viieaastane.', 'Minu …', 'Minu tütar on viieaastane.'],
      ]),
      B.translation('006_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой брат живёт в Тарту.', 'Это машина моего отца.', 'У меня две сестры.', 'Мы часто ездим к бабушке.', 'Моя мама работает в школе.', 'Кто тебе этот человек?']),
      B.dictation('006_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu pere on suur.', 'Minu vanemad elavad Pärnus.', 'Mul on kaks venda ja üks õde.', 'Vanaema elab maal väikeses majas.', 'Suvel kohtub kogu pere.', 'Pere on minu jaoks väga tähtis.']),
      B.writing('006_p_write', 'Minu pere.', 'Kirjuta 6–8 lauset oma perest. Kasuta omastavat.', [6, 8], ['minu', 'elab', 'töötab', 'venna', 'õe'], 3),
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
      B.reading('006_t_profile', 'Loe tutvustust.', 'Uus kolleeg kirjutas endast. Loe ja vasta.', 'Tere, mina olen Mihkel!',
        'Tere! Mina olen Mihkel ja alustan sel nädalal teie meeskonnas. Ma olen pärit Tartust, aga nüüd elan Tallinnas koos abikaasa Kertuga. Kertu on arst ja töötab haiglas. Meil on kaks last. Tütar Mia on seitsmeaastane ja käib esimeses klassis. Poeg Oskar on kolmene ja käib lasteaias. Minu vanemad elavad endiselt Tartus. Nädalavahetusel sõidame tihti nende juurde. Minu isa on suur kalamees ja võtab lapsed sageli kaasa järvele. Vabal ajal mängin korvpalli ja käin lastega ujumas. Minu õde elab Tallinnas meie lähedal ja meie lapsed mängivad tihti koos. Ootan teiega tutvumist!',
        [['Kust on Mihkel pärit?', 'Tartust'], ['Kellega ta Tallinnas elab?', 'abikaasa Kertuga|naisega ja lastega'], ['Kui vana on Mia?', 'seitse|7'], ['Kus elavad Mihkli vanemad?', 'Tartus'], ['Mida teeb Mihkli isa lastega?', 'võtab nad järvele kaasa|läheb kalale']]),
      B.writing('006_t_answer', 'Vasta kolleegile.', 'Kirjuta Mihklile vastus: tutvusta oma peret. 6–8 lauset.', [6, 8], ['minu', 'meil on', 'elab', 'koos'], 3),
      B.speaking('006_t_photo', 'Fotoalbum.', 'Näita paarilisele 3 pereliikme pilti telefonist. Räägi igast 30 sekundit.', ['Kes ta sulle on?', 'Kus ta elab ja mida teeb?', 'Milline ta on?', 'Mida te koos teete?'], [90, 120], ['See on minu…', 'Ta elab…', 'Me tavaliselt…']),
      B.table('006_t_tree', 'Minu sugupuu.', 'Kirjuta oma lähedased tabelisse.', 'Kes?, Nimi, Kus elab?, Üks detail', ['ema | | |', 'isa | | |', 'õde või vend | | |', 'vanaema või vanaisa | | |', 'teine lähedane | | |']),
      B.rolecards('006_t_party', 'Sünnipäeval.', 'Sa oled sõbra sünnipäeval ja ei tunne kedagi. Rääkige 2–3 minutit.',
        'Tutvusta ennast ja oma peret. Küsi, kes on kellele kes.', 'Oled sünnipäevalapse õde. Tutvusta oma peret ja küsi külalise pere kohta.',
        ['Mina olen…', 'Kes sa sünnipäevalapsele oled?', 'Minu pere elab…'], ['Ma olen tema õde.', 'Kas sul on õdesid-vendi?', 'Kus su pere elab?']),
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
      B.reading('007_p_read', 'Loe: kolm sõpra.', 'Loe kirjeldusi. Vasta küsimustele.', 'Kolm sõpra, kolm iseloomu',
        'Anna, Toomas ja Kristi on sõbrad juba koolist saadik. Anna on pikk ja tal on lühikesed heledad juuksed. Ta on väga energiline ja räägib palju. Toomas on keskmist kasvu, tal on habe ja prillid. Ta on rahulik ja tagasihoidlik, aga väga tark. Kristi on lühikest kasvu ja tal on pikad tumedad juuksed. Ta on naljakas ja abivalmis. Kui keegi vajab abi, tuleb Kristi esimesena. Sõbrad on väga erinevad, aga neil on koos alati lõbus. Nädalavahetusel lähevad nad tihti matkama. Anna planeerib teekonna, Toomas võtab kaasa kaardi ja Kristi teeb kõigile võileibu.',
        [['Milline on Anna välimus?', 'pikk, lühikesed heledad juuksed|pikk'], ['Milline on Anna iseloom?', 'energiline|väga energiline'], ['Mis Toomasel on?', 'habe ja prillid'], ['Milline on Toomas?', 'rahulik ja tagasihoidlik|rahulik, tagasihoidlik ja tark'], ['Miks tuleb Kristi esimesena?', 'ta on abivalmis']]),
      B.wordforms('007_p_adj', 'Omadussõna mitmuses.', 'Kirjuta mitmuse vorm (tal on … juuksed).', [
        ['pikk', 'mitmus', 'pikad'], ['lühike', 'mitmus', 'lühikesed'], ['hele', 'mitmus', 'heledad'], ['tume', 'mitmus', 'tumedad'], ['lokkis', 'mitmus', 'lokkis'], ['sinine', 'mitmus', 'sinised'],
      ]),
      B.gaps('007_p_much', 'Natuke, üsna või väga?', 'Vali sobiv sõna. Mõtle tähendusele.', [
        'Ta naerab kogu aeg. Ta on [väga] naljakas.', 'Ta räägib uute inimestega vähe. Ta on [natuke] tagasihoidlik.', 'Ta on 190 cm pikk. Ta on [väga] pikk.',
        'Ta jookseb hommikuti, aga mitte iga päev. Ta on [üsna] sportlik.', 'Ta aitab vahel, kui aega on. Ta on [üsna] abivalmis.', 'Ta jääb mõnikord hiljaks. Ta on [natuke] hajameelne.',
      ], ['natuke', 'üsna', 'väga']),
      B.transformation('007_p_but', 'Ühenda „aga”-ga.', 'Tee kahest lausest üks lause.', [
        ['Ta on tagasihoidlik. Sõpradega räägib ta palju.', 'aga', 'Ta on tagasihoidlik, aga sõpradega räägib ta palju.'], ['Ta on noor. Ta on väga tark.', 'aga', 'Ta on noor, aga väga tark.'],
        ['Tal on tõsine nägu. Ta on naljakas.', 'aga', 'Tal on tõsine nägu, aga ta on naljakas.'], ['Ta on lühike. Ta mängib korvpalli.', 'aga', 'Ta on lühike, aga mängib korvpalli.'],
      ]),
      B.wordorder('007_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Minu õel on pikad tumedad juuksed.', 'Ta on väga sõbralik ja abivalmis.', 'Minu isa on natuke tõsine.', 'Meie õpetaja kannab alati prille.', 'Ta tundub vaikne, aga on naljakas.']),
      B.writing('007_p_write', 'Kirjelda sõpra.', 'Kirjuta 6–8 lauset: välimus, iseloom ja üks näide.', [6, 8], ['ta on', 'tal on', 'väga', 'aga', 'sest'], 3),
      B.translation('007_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['У него короткие тёмные волосы.', 'Она очень дружелюбная.', 'Мой брат немного стеснительный.', 'У неё голубые глаза.', 'Он спокойный, но весёлый.']),
      B.speaking('007_p_pic', 'Kirjelda pilti.', 'Õpetaja näitab kahe inimese pilti. Võrdle neid 1–2 minutit.', ['Milline on esimene inimene?', 'Milline on teine?', 'Mille poolest nad erinevad?', 'Kes on sulle sarnasem?'], [60, 120], ['Esimesel on…, teisel on…', 'Mõlemad on…']),
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
      B.manymatch('007_t_jobs', 'Milline iseloom sobib?', 'Ühenda töö ja sobivad omadused. Mitu vastust on võimalik.', ['lapsehoidja', 'müüja', 'arst', 'raamatupidaja', 'giid'], ['kannatlik', 'sõbralik', 'rahulik', 'täpne', 'avatud']),
      B.writing('007_t_wanted', 'Kirjuta kuulutus.', 'Sinu pere otsib koerale hoidjat. Kirjuta, millist inimest otsite. 5–7 lauset.', [5, 7], ['otsime', 'ta peab olema', 'sobib'], 2),
      B.speaking('007_t_famous', 'Kuulus inimene.', 'Kirjelda tuntud inimest 1 minutiga. Grupp arvab ära.', ['Milline ta välja näeb?', 'Milline ta iseloomult on?', 'Mida ta teeb?'], [60, 90], ['Tal on…', 'Ta on…', 'Ta on tuntud, sest…']),
      B.rolecards('007_t_meet', 'Kohtumine jaamas.', 'Sa pead jaamas vastu võtma inimese, keda sa ei tunne. Lepi telefonis kokku.',
        'Kirjelda ennast: välimus ja riided. Küsi, kuidas teist ära tunda.', 'Kirjelda ennast. Ütle, kus täpselt ootad.',
        ['Ma olen pikk ja mul on…', 'Mul on seljas…', 'Kuidas ma su ära tunnen?'], ['Mul on lühikesed juuksed.', 'Ma kannan prille.', 'Ootan kella all.']),
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
      B.reading('008_p_read', 'Loe: pärast peo lõppu.', 'Loe tekst ja leia omanikud.', 'Kelle asjad jäid maha?',
        'Laupäeval oli Sandra sünnipäev. Pidu oli tema korteris ja külalisi oli palju. Pühapäeva hommikul leidis Sandra korterist mitu asja. Esikus oli punane vihmavari. See on tema töökaaslase Kaja oma. Diivanil oli must müts. Sandra arvab, et see on venna sõbra oma. Köögilaual oli telefon, aga Sandra ei tea, kelle oma see on. Vannitoas oli kallis käekell. Selle peal oli nimi „Leo”. Leo on Sandra naabri poeg. Sandra kirjutas kõigile sõnumi ja ootas vastuseid. Kaja vastas kohe ja lubas õhtul vihmavarjule järele tulla.',
        [['Kelle oma on punane vihmavari?', 'Kaja oma|töökaaslase oma'], ['Kus oli must müts?', 'diivanil'], ['Kelle oma on müts Sandra arvates?', 'venna sõbra oma|venna sõbra'], ['Mida Sandra ei tea?', 'kelle oma on telefon'], ['Kes on Leo?', 'naabri poeg']]),
      B.gaps('008_p_gen', 'Ava sulud.', 'Kirjuta sõna omastavas.', [
        'See on [õpetaja] (õpetaja) laud.', 'Ma lähen [sõbra] (sõber) juurde.', 'Kas see on [naabri] (naaber) kass?', 'Me ootame [venna] (vend) perekonda.', '[Lapse] (laps) mänguasjad on põrandal.', 'See on [arsti] (arst) kabinet.', 'Kus on [Mari] (Mari) kott?', '[Ema] (ema) sõbranna tuleb külla.',
      ]),
      B.choice('008_p_q', 'Õige küsimus.', 'Vali küsimus, mis sobib vastusega.', [
        ['See on Mari kott.', 'Kelle kott see on?', 'Kus kott on?', 'Mis see on?'], ['Ei, see ei ole minu oma.', 'Kas see on sinu oma?', 'Kelle oma see on?', 'Kus see on?'],
        ['See kuulub mu vennale.', 'Kellele see kuulub?', 'Kes see on?', 'Millal see on?'], ['Need on nende lapsed.', 'Kelle lapsed need on?', 'Kus lapsed on?', 'Mitu last on?'],
        ['See on õpetaja oma.', 'Kelle oma see on?', 'Kes on õpetaja?', 'Mis see on?'],
      ], 'full', 'g_use'),
      B.translation('008_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это книга моего брата.', 'Чья это сумка?', 'Это не моё, это её.', 'Я иду к другу.', 'Это машина наших соседей.']),
      B.dialogue('008_p_dlg', 'Kelle oma?', 'Täida dialoog.', 'Õpetaja', 'Õpilane', [
        ['A', 'Kelle [vihik] see on? Laual on vihik ilma nimeta.'], ['B', 'See ei ole [minu] oma. Ma arvan, et see on Toomase oma.'], ['A', 'Toomas, kas see on [sinu] vihik?'],
        ['B', 'Ei, see on minu [õe] vihik. Ta käib ka siin koolis.'], ['A', 'Hästi, palun vii see talle.'],
      ]),
      B.writing('008_p_write', 'Minu toas.', 'Kirjuta 7–9 lauset: mis on sinu toas ja kelle omad need on.', [7, 9], ['minu', 'kelle', 'oma', 'venna', 'õe'], 3),
      B.errorfix('008_p_fix2', 'Veel vigu.', 'Kirjuta lause õigesti.', [['See on minu ema auto ja minu isa auto.', 'Need on minu ema ja isa autod.'], ['Kelle see on raamat?', 'Kelle raamat see on?'], ['See on teie oma? ', 'Kas see on teie oma?'], ['Ma võtsin sõber ratta.', 'Ma võtsin sõbra ratta.']]),
      B.speaking('008_p_class', 'Klassiruumis.', 'Võta 5 asja laualt ja küsi paariliselt, kelle omad need on.', ['Kelle oma see on?', 'Kas see on sinu oma?', 'Kelle pliiats see on?'], [60, 90]),
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
      B.reading('008_t_notice', 'Loe kuulutusi.', 'Loe kolme kuulutust ja vasta.', 'Kadunud ja leitud',
        'Kadunud: väike pruun koer nimega Muki. Muki on minu tütre lemmikloom. Ta kadus eile õhtul pargis. Palun helistage numbril 5555 1234. Leitud: sinine jalgratas Kase tänaval. Ratas seisis kolm päeva maja ees. Kas see on teie või teie lapse oma? Ratta korv on punane ja selle peal on kleebis. Küsige majahaldurilt. Kadunud: must rahakott bussis number kaheksa. Rahakotis on minu ema pilt ja pangakaart. Leidjale väike tänu! Kirjutage meile e-posti teel. Leitud: lapse punane müts mänguväljakul. Müts on nüüd lasteaia kontoris. Kelle laps on mütsi kaotanud?',
        [['Kelle lemmikloom on Muki?', 'kirjutaja tütre|tütre'], ['Kus Muki kadus?', 'pargis'], ['Kus seisis sinine jalgratas?', 'Kase tänaval maja ees|maja ees'], ['Kellelt tuleb ratta kohta küsida?', 'majahaldurilt'], ['Kelle pilt on rahakotis?', 'kirjutaja ema|ema']]),
      B.writing('008_t_ad', 'Kirjuta kuulutus.', 'Sa leidsid kellegi asja. Kirjuta kuulutus 5–6 lausega.', [5, 6], ['leidsin', 'kelle', 'oma', 'helistage'], 2),
      B.speaking('008_t_mine', 'Minu lemmikasi.', 'Räägi 1 minut ühest asjast, mis on sulle kallis.', ['Mis see on?', 'Kelle oma see enne oli?', 'Miks see on sulle tähtis?'], [60, 90]),
      B.rolecards('008_t_return', 'Asja tagastamine.', 'Sa leidsid naabri ukse eest paki. Rääkige 2 minutit.',
        'Sa leidsid paki. Küsi naabrilt, kas see on tema oma.', 'Oled naaber. Pakk ei ole sinu oma, aga sa tead, kelle oma see võib olla.',
        ['Vabandage, kas see pakk on teie oma?', 'Kelle oma see siis on?'], ['Ei, see ei ole minu oma.', 'See on ilmselt…', 'Tema korter on…']),
      B.translation('008_t_tr', 'Tõlgi sõnum.', 'Kirjuta eesti keeles.', ['Я нашёл твой телефон.', 'Это ключи твоей мамы?', 'Чья это собака?', 'Это не наша машина.']),
      B.gaps('008_t_msg', 'Sõnum naabrile.', 'Täida sõnum sobivate sõnadega.', ['Tere! Ma leidsin [teie] paki trepikojast.', 'Pakil on [teie] nimi.', 'Ma panin selle [minu] ukse juurde.', 'Kui te ei ole kodus, annan selle [teie] pojale.', 'Kas see [kott] on ka teie oma?'], ['teie', 'minu', 'kott']),
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
      B.writing('009_p_write', 'Meie nädalavahetus.', 'Kirjuta 8–10 lauset. Kasuta kahte sagedussõna ja sest.', [8, 10], ['tavaliselt', 'vahel', 'sest', 'koos'], 3),
      B.reading('009_p_read', 'Loe: meie pühapäevad.', 'Loe tekst ja vasta.', 'Pühapäev on pere päev',
        'Meie peres on pühapäev eriline päev. Hommikul magame kauem, sest nädala sees on kõigil kiire. Umbes kell kümme teeb isa pannkooke. Pärast hommikusööki läheme tavaliselt metsa jalutama. Vahel võtame kaasa ka vanaema koera. Lõuna ajal sööme koos vanaema juures, sest ta elab lähedal. Pärastlõunal mängime lauamänge või vaatame filmi. Mulle meeldivad need päevad väga, sest siis on kogu pere koos. Talvel käime ka uisutamas, aga suvel ujume järves. Õhtul helistame vanemale vennale, kes elab Saksamaal. Nii on ka tema natuke meie pühapäevas.',
        [['Miks pere pühapäeval kauem magab?', 'nädala sees on kiire|sest nädala sees on kõigil kiire'], ['Mida teeb isa kell kümme?', 'teeb pannkooke'], ['Mida pere pärast hommikusööki teeb?', 'läheb metsa jalutama|jalutab metsas'], ['Miks süüakse vanaema juures?', 'ta elab lähedal'], ['Mida pere talvel teeb?', 'käib uisutamas|uisutab']]),
      B.categorize('009_p_seasons', 'Millal mida teha?', 'Sorteeri tegevused.', [['Suvel', ['ujume', 'matkame', 'grillime']], ['Talvel', ['uisutame', 'suusatame', 'teeme lumememme']], ['Iga kord', ['räägime', 'sööme koos', 'naerame']]]),
      B.transformation('009_p_because', 'Lisa põhjus.', 'Ühenda laused sõnaga „sest”.', [
        ['Me kohtume harva. Me elame eri linnades.', 'sest', 'Me kohtume harva, sest elame eri linnades.'], ['Mulle meeldib matkata. Looduses on rahulik.', 'sest', 'Mulle meeldib matkata, sest looduses on rahulik.'],
        ['Me helistame iga päev. Me igatseme teineteist.', 'sest', 'Me helistame iga päev, sest igatseme teineteist.'], ['Me ei lähe täna välja. Ilm on halb.', 'sest', 'Me ei lähe täna välja, sest ilm on halb.'],
      ]),
      B.translation('009_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мы обычно встречаемся в субботу.', 'Иногда мы ходим в кино.', 'Мне нравится готовить с мамой.', 'Мы редко путешествуем, потому что мало времени.', 'Нам вместе всегда весело.']),
      B.speaking('009_p_habits', 'Pere harjumused.', 'Küsi paariliselt 5 küsimust tema pere harjumuste kohta.', ['Mida teete pühapäeval?', 'Kui tihti kohtute?', 'Mis teile koos meeldib?', 'Mida teete harva?'], [90, 120]),
      B.dictation('009_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Me kohtume tavaliselt laupäeval.', 'Vahel läheme koos kinno.', 'Mulle meeldib vennaga süüa teha.', 'Me jalutame, sest ilm on ilus.', 'Pühapäeval sööme vanaema juures.']),
      B.wordorder('009_p_order2', 'Veel lauseid.', 'Pane laused kokku.', ['Me reisime harva, sest aega on vähe.', 'Talvel käime perega suusatamas.', 'Õhtul mängime vahel lauamänge.']),
      B.gaps('009_p_fill', 'Täida tekst.', 'Vali sobiv sõna.', ['Me [veedame] palju aega koos.', 'Pühapäeval [sööme] vanaema juures lõunat.', 'Pärast lõunat [jalutame] pargis.', 'Õhtul [mängime] lauamänge.', 'Mulle meeldib see päev, [sest] kõik on koos.'], ['veedame', 'sööme', 'jalutame', 'mängime', 'sest']),
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
      B.writing('009_t_post', 'Postitus.', 'Kirjuta postitus fotole: kellega, kus, miks see oli tore. 7–8 lauset.', [7, 8], ['koos', 'sest', 'mulle meeldis'], 2),
      B.manymatch('009_t_who', 'Kellega mida teha?', 'Kellega sa teeksid mida? Mitu vastust on võimalik.', ['kinno minna', 'matkata', 'süüa teha', 'reisida', 'lauamänge mängida'], ['vanematega', 'sõpradega', 'õe või vennaga', 'üksi']),
      B.reading('009_t_poll', 'Loe küsitlust.', 'Loe küsitluse tulemusi ja vasta.', 'Kuidas eestlased koos aega veedavad?',
        'Ajakiri küsis tuhandelt inimeselt, kuidas nad pere ja sõpradega aega veedavad. Kõige populaarsem tegevus on koos söömine: seda teeb nädalavahetusel kaheksa inimest kümnest. Teisel kohal on jalutamine looduses. Noored eelistavad kino ja kontserte, vanemad inimesed aga aiatööd ja külaskäike. Pooled vastajad ütlesid, et nad tahaksid perega rohkem aega veeta. Suurim takistus on töö: paljud töötavad ka laupäeval. Ainult iga kümnes inimene ütles, et ta veedab vaba aega peamiselt üksi. Ajakirja arvates on koos veedetud aeg tervisele sama tähtis kui sport.',
        [['Mitmelt inimeselt küsiti?', 'tuhandelt|1000'], ['Mis on kõige populaarsem tegevus?', 'koos söömine'], ['Mida eelistavad noored?', 'kino ja kontserte'], ['Mis on suurim takistus?', 'töö'], ['Mitu inimest veedab vaba aega peamiselt üksi?', 'iga kümnes|kümme protsenti']]),
      B.writing('009_t_opinion', 'Sinu arvamus.', 'Kas sina veedad perega piisavalt aega? Kirjuta 6–8 lauset ja põhjenda.', [6, 8], ['sest', 'tavaliselt', 'vahel', 'tahaksin'], 3),
      B.translation('009_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Давай встретимся в субботу?', 'К сожалению, в субботу я не могу.', 'А как насчёт воскресенья?', 'Договорились, встретимся в пять.']),
      B.speaking('009_t_plan2', 'Esitle plaani.', 'Tutvusta grupile oma ühise laupäeva plaani 1–2 minutit.', ['Kellega?', 'Mida teete?', 'Miks just see?'], [60, 120]),
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
      B.wordforms('010_p_forms', 'Kümme vormi.', 'Kirjuta sõna omastavas.', [
        ['sõber', 'kelle?', 'sõbra'], ['naaber', 'kelle?', 'naabri'], ['õde', 'kelle?', 'õe'], ['laps', 'kelle?', 'lapse'], ['nemad', 'kelle?', 'nende'], ['tütar', 'kelle?', 'tütre'], ['poeg', 'kelle?', 'poja'], ['meie', 'kelle?', 'meie'],
      ]),
      B.choice('010_p_mix', 'Vali õige.', 'Vali sobiv variant.', [
        ['… on lühikesed juuksed.', 'Tal', 'Ta', 'Teda'], ['Ta … väga kannatlik.', 'on', 'tal on', 'oli on'], ['See on minu … auto.', 'venna', 'vend', 'vennale'],
        ['Me kohtume …, sest elame kaugel.', 'harva', 'alati', 'iga päev'], ['Ta on tagasihoidlik, … sõpradega räägib palju.', 'aga', 'sest', 'või'],
      ], 'full', 'g_use'),
      B.transformation('010_p_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Raamat kuulub õele.', 'See on …', 'See on õe raamat.'], ['Mul on vend. Ta on arst.', 'Minu …', 'Minu vend on arst.'], ['Ta naerab palju.', 'naljakas', 'Ta on naljakas.'], ['Me kohtume iga nädal.', 'tihti', 'Me kohtume tihti.'],
      ]),
      B.translation('010_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['У моей сестры длинные волосы.', 'Мой дедушка очень спокойный.', 'Это квартира наших родителей.', 'Мы часто гуляем вместе, потому что живём рядом.']),
      B.writing('010_p_write', 'Kordamise tekst.', 'Kirjuta 7–8 lauset ühest pereliikmest: välimus, iseloom, ühine aeg.', [7, 8], ['tal on', 'ta on', 'koos', 'sest'], 3),
      B.reading('010_p_read2', 'Loe sõnumit.', 'Loe sõnumit ja vasta.', 'Sõnum sõbrannalt',
        'Tere, Liina! Kas sa mäletad minu venda Markot? Ta tuleb järgmisel nädalal Tallinnasse ja otsib korterit. Marko on rahulik ja korralik, aga natuke tagasihoidlik. Tal on lühikesed tumedad juuksed ja habe. Ta töötab programmeerijana ja mängib vabal ajal kitarri. Ta on väga sõbralik ja aitab alati naabreid. Ta ei suitseta. Kas sinu naabri korter on veel vaba? Kui jah, siis anna palun naabri telefoninumber. Marko helistab talle ise. Ta tahaks elada kesklinna lähedal, sest tema töökoht on vanalinnas. Aitäh ja kohtumiseni laupäeval!',
        [['Kes tuleb Tallinnasse?', 'kirjutaja vend Marko|Marko'], ['Mida Marko otsib?', 'korterit'], ['Milline on Marko iseloom?', 'rahulik, korralik, natuke tagasihoidlik'], ['Mis tööd Marko teeb?', 'programmeerija'], ['Kelle telefoninumbrit kirjutaja küsib?', 'naabri']]),
      B.speaking('010_p_mono', 'Monoloog.', 'Räägi 1–2 minutit oma perest ilma tekstita.', ['Kes on sinu peres?', 'Milline keegi on?', 'Mida te koos teete?'], [60, 120]),
      B.selfcheck('010_p_self', ['Ma tegin ülesanded ilma abita.', 'Ma parandasin oma vead.', 'Ma tean, mida veel korrata.', 'Ma olen valmis Kasuta leheks.'], 'Kordamine tehtud'),
    ],
    transfer: [
      B.text('010_t_situation', 'Lõpuülesanne', 'Sinu sõber tuleb sinu perega tutvuma. Valmista ta ette: kes on kes, milline keegi on ja mida te koos teete.'),
      B.letter('010_t_letter', 'Kiri sõbrale (80–100 sõna).', 'Kirjuta: kes on sinu peres, milline keegi on ja mida te koos teete.', 'Tere!', 'Kohtumiseni!', [80, 100]),
      B.rubric('010_t_rubric', 'Kontrolli kirja.', 'Märgi, mis on olemas.', ['Vähemalt 4 inimest ja igaühe kohta detail.', 'Vähemalt 2 välimuse ja 2 iseloomu kirjeldust.', 'Vähemalt 2 kelle-vormi.', 'Vähemalt 1 sest-lause.', 'Kiri on 80–100 sõna.']),
      B.rolecards('010_t_roles', 'Dialoog: külaline tuleb.', 'Rääkige 2–3 minutit.',
        'Sinu sõber tuleb külla. Tutvusta peret ja lepi kokku, mida te koos teete.', 'Sa oled külaline. Küsi pere kohta ja paku ühist tegevust. Esimene aeg sulle ei sobi.',
        ['See on minu…', 'Ta on…', 'Kas sulle sobib…?'], ['Kes see on?', 'Milline ta on?', 'Kahjuks ma ei saa, sest…']),
      B.speaking('010_t_mono', 'Monoloog: inimene, kes on mulle tähtis.', 'Räägi 2 minutit ilma tekstita.', ['Kes ta on ja kuidas te tuttavaks saite?', 'Milline ta on?', 'Mida te koos teete?', 'Miks ta on sulle tähtis?'], [90, 120]),
      B.reading('010_t_read', 'Loe: pereportree.', 'Loe ajakirja lugu ja vasta.', 'Kolm põlvkonda ühe katuse all',
        'Tammede pere elab Viljandi lähedal suures talumajas. Majas elab kolm põlvkonda: vanavanemad, nende poeg Jaan koos naise Pillega ja kaks last. Vanaema Helgi on rõõmsameelne ja teeb kõigile süüa. Vanaisa Ants on vaikne, aga väga osav. Ta parandab kõike, mis katki läheb. Jaan ja Pille töötavad linnas ja sõidavad iga päev autoga tööle. Lapsed Mart ja Liis käivad külakoolis. Õhtuti söövad kõik koos suure laua taga. Pille ütleb, et koos elamine on vahel raske, aga lastele on see väga hea.',
        [['Kus elab Tammede pere?', 'Viljandi lähedal talumajas|talumajas'], ['Mitu põlvkonda majas elab?', 'kolm|3'], ['Milline on vanaema Helgi?', 'rõõmsameelne'], ['Mida teeb vanaisa Ants?', 'parandab kõike|parandab asju'], ['Mida arvab Pille koos elamisest?', 'vahel raske, aga lastele hea']]),
      B.speaking('010_t_compare', 'Võrdle peresid.', 'Võrdle Tammede peret oma perega 2–3 minutit.', ['Mis on sarnane?', 'Mis on erinev?', 'Kas sa tahaksid elada kolme põlvkonnaga?', 'Miks?'], [120, 180]),
      B.translation('010_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это мои родители.', 'Моя сестра очень весёлая.', 'У моего брата есть собака.', 'Мы часто ужинаем вместе.', 'Чья это куртка?', 'Мой дедушка немного серьёзный.']),
      B.dictation('010_t_dict', 'Etteütlus.', 'Kuula ja kirjuta.', ['Minu vanemad elavad maal.', 'Minu õde on väga abivalmis.', 'Tal on pikad heledad juuksed.', 'Me kohtume sageli, sest elame lähedal.', 'See on minu venna auto.']),
      B.gaps('010_t_gaps', 'Kontrolli vorme.', 'Kirjuta õige vorm.', ['See on minu [õe] (õde) kass.', '[Tal on] sinised silmad.', 'Me käime tihti [vanaema] (vanaema) juures.', 'Ta on [väga] sõbralik.', 'Kas see on [teie] (teie) laps?'], '', 'half'),
      B.selfcheck('010_t_self', ['Ma kirjutasin 70–90 sõna seotud kirja.', 'Ma kasutasin kirjeldusi ja kelle-vorme.', 'Ma pidasin dialoogi lõpuni.', 'Ma rääkisin 2 minutit.'], 'Moodul 2 tehtud'),
    ],
  },
};
