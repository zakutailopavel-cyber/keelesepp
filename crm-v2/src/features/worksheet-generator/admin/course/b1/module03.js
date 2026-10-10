// B1 course (A2 → B1 roadmap), module 3 „Kodu, kohad ja linn” (a2b1-011…015), stage A2.
// Harjuta + Kasuta for the published Avasta sheets. Kus? Kuhu? Kust? is practised through real places and movement
// (moving house, errands, routes), not abstract tables (roadmap). Module 2 words (pere, kelle?) come back in the
// situations. Material from the KeeleSepp A2→B1 workbook, lessons 6–9 (Minu kodu; Kolisin uude koju; Linnas: tee
// küsimine; Minu kodukoht).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2b1-module-03', course: 'b1', title: 'Kodu, kohad ja linn', level: 'A2' };

export const LESSONS = {
  'a2b1-011': {
    title: 'Minu kodu',
    canDo: 'Ma kirjeldan üht tuba 6–8 seotud lausega ja kasutan vähemalt kuut ruumi- või asukohaväljendit.',
    practice: [
      B.categorize('011_p_rooms', 'Mis on mis toas?', 'Sorteeri asjad tubadesse. Mõni asi sobib mitmesse.', [
        ['köök', ['pliit', 'külmkapp', 'kraanikauss']], ['vannituba', ['dušš', 'peegel', 'rätik']], ['magamistuba', ['voodi', 'riidekapp', 'öölamp']], ['elutuba', ['diivan', 'televiisor', 'vaip']],
      ]),
      B.gaps('011_p_where', 'Kus see on?', 'Kirjuta sõna õiges vormis (kus?).', [
        'Raamat on [laual] (laud).', 'Riided on [kapis] (kapp).', 'Kass magab [diivanil] (diivan).', 'Lamp on [voodi] (voodi) kõrval.', 'Pildid on [seinal] (sein).', 'Kingad on [esikus] (esik).',
      ], '', 'half'),
      B.diagram('011_p_plan', 'formula', { title: 'Asukoha valem.', instruction: 'Täida lüngad. Vaata näidet.', nodes: 'Mis? | Lamp\nOn | [on]\nKus? | diivani [kõrval]', note: 'Lamp on diivani kõrval. Vaip on laua all. Riiul on akna juures.' }),
      B.truefalse('011_p_room', 'Vaata Eliise tuba.', 'Loe kirjeldus. Kas lause on õige?', [
        ['Voodi on akna all. → Akna all on voodi.', true], ['Laud on voodi ees. → Voodi on laua taga.', true], ['Kapp on ukse kõrval. → Kapp on ukse peal.', false], ['Vaip on põrandal. → Vaip on laes.', false], ['Lamp on laua peal. → Lamp on laual.', true],
      ], 'half'),
      B.errorfix('011_p_fix', 'Paranda kirjeldus.', 'Kirjuta lause õigesti.', [
        ['Raamat on laud.', 'Raamat on laual.'], ['Kass on diivani kõrvale.', 'Kass on diivani kõrval.'], ['Minu tuba on suur aken.', 'Minu toas on suur aken.'], ['Riided on kapil sees.', 'Riided on kapis.'],
      ]),
      B.speaking('011_p_draw', 'Joonista ja räägi.', 'Paariline kirjeldab oma tuba. Sina joonistad. Siis vahetage.', [
        'Mis toas on?', 'Kus on voodi?', 'Mis on akna juures?', 'Mis on sinu lemmikkoht ja miks?',
      ], [60, 90], ['Toas on…', '… on … kõrval / ees / taga / all.', 'Minu lemmikkoht on…, sest…']),
      B.selfcheck('011_p_self', ['Ma tean 12 kodu sõna.', 'Ma ütlen, kus asi on: laual, kapis, kõrval.', 'Ma parandan asukoha vead.', 'Ma kirjeldan tuba nii, et teine joonistab.'], 'Minu tuba on sõnades'),
    ],
    transfer: [
      B.reading('011_t_ad', 'Üürikuulutus.', 'Loe kuulutus ja vasta küsimustele.', 'Üürile anda kahetoaline korter',
        'Anname üürile valgusküllase kahetoalise korteri Tartus, Karlovas. Korter on kolmandal korrusel. Esikus on suur riidekapp. Köök on väike, aga seal on uus pliit ja nõudepesumasin. Elutoas on diivan, raamaturiiul ja suur aken lõuna poole. Magamistoas on lai voodi ja kirjutuslaud akna all. Vannitoas on dušš ja pesumasin. Maja kõrval on pood ja bussipeatus. Kesklinna sõidab buss kümme minutit. Hoovis on parkla ja jalgrattahoidla. Hind on 550 eurot kuus, kommunaalkulud lisaks. Lemmikloomad on lubatud. Korter on vaba alates esimesest novembrist. Helista õhtuti pärast kella kuut!',
        [['Mitu tuba korteris on?', 'kaks|2'], ['Mis on köögis uus?', 'pliit ja nõudepesumasin|pliit'], ['Kus on kirjutuslaud?', 'magamistoas akna all|akna all'], ['Mis on maja kõrval?', 'pood ja bussipeatus'], ['Kas koera võib kaasa võtta?', 'jah|jah, lemmikloomad on lubatud']]),
      B.choice('011_t_fit', 'Kas korter sobib?', 'Kes võiks selle korteri üürida? Vali.', [
        ['Annal on koer ja ta töötab kodus.', 'Sobib: loomad on lubatud ja on kirjutuslaud.', 'Ei sobi: loomad ei ole lubatud.', 'Ei sobi: korteris pole lauda.'],
        ['Peeter sõidab iga päev kesklinna.', 'Sobib: maja kõrval on bussipeatus.', 'Ei sobi: buss ei sõida.', 'Ei sobi: korter on maal.'],
        ['Liisal on kolm last.', 'Ilmselt ei sobi: korter on kahetoaline.', 'Sobib väga hästi: korter on suur.', 'Sobib: seal on kolm magamistuba.'],
        ['Marko tahab maksta alla 500 euro.', 'Ei sobi: hind on 550 eurot.', 'Sobib: hind on 450 eurot.', 'Sobib: korter on tasuta.'],
      ], 'full', 'g_read'),
      B.rolecards('011_t_call', 'Helista omanikule.', 'Üks on üürnik, teine korteri omanik. Rääkige 2 minutit.',
        'Sa otsid korterit. Küsi vähemalt 4 küsimust: tubade, mööbli ja asukoha kohta.', 'Sa annad korterit üürile. Vasta kuulutuse järgi. Küsi, kellega üürnik elab.',
        ['Kas köögis on…?', 'Kus asub…?', 'Kas maja lähedal on…?'], ['Jah, köögis on…', 'Magamistoas on…', 'Kellega te elate?']),
      B.planning('011_t_plan', 'Minu unistuste tuba.', 'Mõtle enne kirjutamist.', ['Mis tuba see on?', 'Mis mööbel seal on?', 'Kus mis asub?', 'Miks see tuba sulle meeldib?']),
      B.writing('011_t_write', 'Kirjelda unistuste tuba.', 'Kirjuta 6–8 lauset. Kasuta 6 asukohaväljendit.', [6, 8], ['kõrval', 'ees', 'juures', 'laual', 'sest'], 4),
      B.selfcheck('011_t_self', ['Ma mõistan üürikuulutust.', 'Ma küsin korteri kohta telefonis.', 'Ma kirjeldan tuba 6–8 lausega.', 'Ma kasutan asukohaväljendeid õigesti.'], 'Leidsin kodu'),
    ],
  },

  'a2b1-012': {
    title: 'Kus? Kuhu? Kust?',
    canDo: 'Ma valin õige küsimuse ja kohavormi vähemalt 8 olukorras 10-st.',
    practice: [
      B.table('012_p_triples', 'Vormikolmikud.', 'Kirjuta puuduvad vormid.', 'Kus?, Kuhu?, Kust?', [
        'toas | [tuppa] | [toast]', '[köögis] | kööki | [köögist]', '[korteris] | [korterisse] | korterist', 'laual | [lauale] | [laualt]', '[riiulil] | riiulile | [riiulilt]', '[kodus] | koju | [kodust]',
      ]),
      B.choice('012_p_pick', 'Vali õige vorm.', 'Mõtle: kas oled kohal, lähed või tuled?', [
        ['Pärast tööd lähen …', 'koju', 'kodus', 'kodust'], ['Mobiiltelefon on …', 'laual', 'lauale', 'laualt'], ['Panen raamatu …', 'riiulile', 'riiulil', 'riiulilt'],
        ['Kell kaheksa lähen …', 'tööle', 'tööl', 'töölt'], ['Õhtul tulen …', 'töölt', 'tööle', 'tööl'], ['Võtan karbi …', 'kapilt', 'kapile', 'kapil'],
      ], 'full', 'g_use'),
      B.transformation('012_p_move', 'Pane liikuma.', 'Muuda lauset nagu näites.', [
        ['Raamat on laual.', 'Pane raamat …', 'Pane raamat lauale.'], ['Kast on esikus.', 'Vii kast …', 'Vii kast esikusse.'], ['Tool on köögis.', 'Too tool …', 'Too tool köögist.'], ['Ma olen kodus.', 'Ma lähen …', 'Ma lähen koju.'],
      ]),
      B.manymatch('012_p_verbs', 'Milline küsimus?', 'Ühenda tegusõna ja küsimus. Mõni sobib mitmega.', ['olen', 'elan', 'lähen', 'panen', 'tulen', 'võtan'], ['Kus?', 'Kuhu?', 'Kust?']),
      B.dictation('012_p_dict', 'Etteütlus: kolimine.', 'Kuula ja kirjuta laused.', [
        'Võta lamp magamistoast.', 'Vii see elutuppa.', 'Pane raamatud riiulile.', 'Too tool köögist.', 'Kast on veel esikus.',
      ]),
      B.speaking('012_p_orders', 'Juhata kolimist.', 'Anna paarilisele 6 korraldust: mida, kust ja kuhu viia.', [
        'Mida tuleb viia?', 'Kust selle võtad?', 'Kuhu selle viid?', 'Kuhu selle paned?',
      ], [45, 90], ['Võta … magamistoast.', 'Vii see elutuppa.', 'Pane see riiulile.']),
      B.selfcheck('012_p_self', ['Ma moodustan vormikolmiku.', 'Ma valin küsimuse tegusõna järgi.', 'Ma kirjutan kuulatud laused.', 'Ma annan 6 korraldust.'], 'Kus, kuhu, kust — selge'),
    ],
    transfer: [
      B.reading('012_t_story', 'Kolimispäev.', 'Loe lugu ja vasta küsimustele.', 'Kolisin uude koju',
        'Eelmisel laupäeval kolisin sõbraga uude korterisse. Hommikul pakkisin raamatud kastidesse ja panin riided suurde kotti. Kell kümme viisime kastid toast autosse. Uue maja juures võtsime kastid autost välja ja viisime need kolmandale korrusele. Lift ei töötanud, seetõttu pidime trepist üles minema. Köögis panime nõud kappi ja kohvimasina lauale. Hiljem tõime magamistoast lambi elutuppa. Õhtul olid peaaegu kõik asjad uues kodus. Olin väsinud, aga rõõmus. Esmaspäeval läksin uuest korterist tööle. Kolleeg küsis, kuidas kolimine läks. Vastasin: „Hästi, aga järgmine kord valin maja, kus lift töötab!”',
        [['Kust nad kastid autosse viisid?', 'toast'], ['Kuhu nad kastid viisid?', 'kolmandale korrusele'], ['Miks nad trepist läksid?', 'lift ei töötanud'], ['Kuhu panid nad kohvimasina?', 'lauale'], ['Kust nad lambi tõid?', 'magamistoast']]),
      B.text('012_t_situation', 'Uus olukord', 'Sinu sõber kolib ja sina aitad. Ta ei ole kodus. Ta saadab sulle sõnumi, mida teha.'),
      B.dialogue('012_t_chat', 'Sõbra sõnumid.', 'Loe ja täida lüngad õige vormiga.', 'Kristi', 'Sina', [
        ['A', 'Võtmed on naabri [juures]. Palun võta need sealt.'], ['B', 'Selge. Kas ma viin kastid kohe [korterisse]?'], ['A', 'Jah. Raamatud pane [elutuppa] riiulile.'],
        ['B', 'Ja kuhu ma panen nõud?'], ['A', '[Kööki] kappi, palun. Lambi too autost.'], ['B', 'Teen ära! Kui tuled [töölt], on kõik valmis.'],
      ]),
      B.writing('012_t_report', 'Vasta sõbrale.', 'Kirjuta 5–7 lauset: mida tegid, kust võtsid, kuhu viisid.', [5, 7], ['võtsin', 'viisin', 'panin', 'tõin'], 3),
      B.speaking('012_t_voice', 'Häälsõnum.', 'Salvesta 60–90 sekundit: kuhu asjad läksid ja kust neid leida.', [
        'Kus on raamatud?', 'Kuhu panid nõud?', 'Kust leiab sõber lambi?', 'Mis jäi veel autosse?',
      ], [60, 90]),
      B.selfcheck('012_t_self', ['Ma mõistan kolimise lugu.', 'Ma täidan sõnumid õigete vormidega.', 'Ma kirjutan, mida tegin.', 'Ma salvestasin häälsõnumi.'], 'Kolimine tehtud'),
    ],
  },

  'a2b1-013': {
    title: 'Kohad linnas',
    canDo: 'Ma nimetan vähemalt 12 linnakohta ja selgitan, mida neis tavaliselt tehakse.',
    practice: [
      B.match('013_p_places', 'Koht ja tegevus.', 'Ühenda koht ja tegevus.', [
        ['apteek', 'ostan ravimeid'], ['raamatukogu', 'laenutan raamatuid'], ['pank', 'korraldan rahaasju'], ['postkontor', 'saadan paki'], ['polikliinik', 'käin arsti juures'], ['jaam', 'ootan rongi'],
      ], 'half'),
      B.crossword('013_p_cross', 'Linna ristsõna.', 'Kirjuta koht vihje järgi.', [
        ['Siin ostad leiba ja piima.', 'pood'], ['Siin ootad bussi.', 'bussipeatus'], ['Siin ujud ja teed trenni.', 'spordikeskus'], ['Siin jood kohvi ja sööd kooki.', 'kohvik'], ['Siin registreerid oma aadressi.', 'linnavalitsus'],
      ]),
      B.gaps('013_p_go', 'Kuhu sa lähed?', 'Kirjuta koht õiges vormis (kuhu?).', [
        'Mul on peavalu. Lähen [apteeki] (apteek).', 'Tahan raamatut lugeda. Lähen [raamatukokku] (raamatukogu).', 'Pean paki saatma. Lähen [postkontorisse] (postkontor).', 'Rong väljub kell kaks. Lähen [jaama] (jaam).', 'Tahan ujuma minna. Lähen [spordikeskusesse] (spordikeskus).',
      ]),
      B.wordorder('013_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Hommikul lähen ma panka.', 'Pärast seda ostan apteegist ravimit.', 'Sõbraga kohtun raamatukogu ees.', 'Õhtul tulen spordikeskusest koju.',
      ]),
      B.truefalse('013_p_sense', 'Kas see on loogiline?', 'Õige või vale?', [
        ['Ma ostan apteegist ravimit.', true], ['Ma laenutan pangast raamatu.', false], ['Ma ootan bussipeatuses bussi.', true], ['Ma saadan kohvikust paki.', false], ['Ma käin polikliinikus arsti juures.', true],
      ], 'half'),
      B.speaking('013_p_day', 'Minu asjaajamised.', 'Räägi 1 minut: kuhu lähed sel nädalal ja miks.', [
        'Kuhu sa lähed esmaspäeval?', 'Mida sa seal teed?', 'Kust sa ostad toitu?', 'Kus sa kohtud sõpradega?',
      ], [60, 90], ['Esmaspäeval lähen…, sest…', 'Seal ma…', 'Pärast seda…']),
      B.selfcheck('013_p_self', ['Ma nimetan 12 linnakohta.', 'Ma tean, mida igas kohas tehakse.', 'Ma kasutan kuhu-vormi: apteeki, panka.', 'Ma räägin oma nädala asjaajamistest.'], 'Linn on tuttav'),
    ],
    transfer: [
      B.text('013_t_situation', 'Uus olukord', 'Sinu tuttav kolis just sinu linna. Ta ei tunne linna. Tal on palju asju ajada.'),
      B.manymatch('013_t_needs', 'Mida tal vaja on?', 'Kuhu peab tuttav minema? Mõni koht sobib mitmele vajadusele.',
        ['registreerida aadress', 'osta külmetusrohtu', 'avada pangakonto', 'saata ema sünnipäevaks pakk', 'leida sõpru ja trenni'], ['linnavalitsus', 'apteek', 'pank', 'postkontor', 'spordikeskus']),
      B.planning('013_t_plan', 'Tee plaan.', 'Pane tuttava päev järjekorda.', ['Kuhu ta läheb kõigepealt?', 'Kuhu siis?', 'Kus ta lõunat sööb?', 'Kuhu ta läheb viimasena?']),
      B.letter('013_t_mail', 'Kiri tuttavale.', 'Soovita, kuhu minna ja mida seal teha. Kirjuta 60–80 sõna.', 'Tere, Aleks!', 'Kohtume linnas!', [60, 80]),
      B.rolecards('013_t_roles', 'Telefonis.', 'Rääkige 2 minutit.',
        'Oled uus linnas. Küsi, kuhu minna: ravim, pakk, trenn.', 'Tunned linna hästi. Soovita kohti ja ütle, kus need on.',
        ['Kuhu ma pean minema, kui…?', 'Kus on lähim…?'], ['Mine…', 'See on … lähedal.', 'Seal saad…']),
      B.selfcheck('013_t_self', ['Ma seon vajaduse ja koha.', 'Ma teen päeva plaani.', 'Ma kirjutan soovitusi.', 'Ma annan telefonis nõu.'], 'Aitan linnas'),
    ],
  },

  'a2b1-014': {
    title: 'Tee küsimine ja juhatamine',
    canDo: 'Ma annan vähemalt nelja järjestatud juhise abil arusaadava teekirjelduse.',
    practice: [
      B.match('014_p_signs', 'Juhis ja tähendus.', 'Ühenda väljend ja vene keel.', [
        ['mine otse', 'иди прямо'], ['pööra paremale', 'поверни направо'], ['ületa tee', 'перейди дорогу'], ['nurga peal', 'на углу'], ['vastas', 'напротив'], ['kuni ristmikuni', 'до перекрёстка'],
      ], 'half'),
      B.wordforms('014_p_imp', 'Käskiv kõneviis.', 'Kirjuta sa-vormi käsk.', [
        ['minema', 'sa-käsk', 'mine'], ['pöörama', 'sa-käsk', 'pööra'], ['ületama', 'sa-käsk', 'ületa'], ['jätkama', 'sa-käsk', 'jätka'], ['tulema', 'sa-käsk', 'tule'], ['sõitma', 'sa-käsk', 'sõida'],
      ]),
      B.diagram('014_p_flow', 'flow', { title: 'Tee apteeki.', instruction: 'Kirjuta puuduvad tegusõnad.', nodes: '[Mine] otse kuni valgusfoorini.\n[Pööra] paremale.\n[Ületa] tee.\nApteek on panga [kõrval].' }),
      B.errorfix('014_p_fix', 'Paranda juhis.', 'Kirjuta juhis õigesti.', [
        ['Lähed otse ja pööra vasak.', 'Mine otse ja pööra vasakule.'], ['Pood on panga vastu.', 'Pood on panga vastas.'], ['Ületa teed ja minna paremale.', 'Ületa tee ja mine paremale.'], ['Apteek on nurga peale.', 'Apteek on nurga peal.'],
      ]),
      B.listening('014_p_listen', 'Kuula teed.', 'Õpetaja loeb teekirjelduse. Täida lüngad.', [
        'Vabandage, kuidas ma saan raamatukokku?', 'Mine siit otse kuni ristmikuni. Seal pööra vasakule.', 'Ületa tee ja jätka umbes sada meetrit.', 'Raamatukogu on paremal, kohviku vastas.',
      ], ['Mine otse kuni [ristmikuni].', 'Seal pööra [vasakule].', 'Ületa [tee].', 'Jätka umbes [sada|100] meetrit.', 'Raamatukogu on [kohviku] vastas.']),
      B.speaking('014_p_map', 'Kaardiga paaris.', 'Vali kaardil algus ja lõpp. Juhata paarilist 4–6 sammuga.', [
        'Kust sa alustad?', 'Kuhu sa lähed?', 'Kus pöörad?', 'Mis on sihtkoha kõrval või vastas?',
      ], [45, 90], ['Mine otse…', 'Pööra … juures…', 'See on … kõrval / vastas.']),
      B.selfcheck('014_p_self', ['Ma tean 8 juhise väljendit.', 'Ma moodustan sa-käsu.', 'Ma saan kuulatud teest aru.', 'Ma juhatan teed 4–6 sammuga.'], 'Tean teed'),
    ],
    transfer: [
      B.dialogue('014_t_tourist', 'Turist küsib teed.', 'Täida dialoog.', 'Turist', 'Sina', [
        ['A', 'Vabandage, kas te [oskate] öelda, kus on vanalinn?'], ['B', 'Muidugi. Mine otse kuni [ristmikuni].'], ['A', 'Ja siis?'],
        ['B', 'Siis [pööra] paremale ja ületa tee.'], ['A', 'Kas see on [kaugel]?'], ['B', 'Ei, umbes kümme minutit jalgsi.'],
      ]),
      B.truefalse('014_t_check', 'Kas turist sai aru?', 'Loe dialoogi uuesti. Õige või vale?', [
        ['Turist otsib vanalinna.', true], ['Ristmikul tuleb pöörata vasakule.', false], ['Teel tuleb ületada tee.', true], ['Vanalinn on väga kaugel.', false],
      ], 'full'),
      B.rolecards('014_t_roles', 'Kohalik ja turist.', 'Rääkige. Seejärel vahetage algus- ja sihtkoht.',
        'Oled turist. Küsi teed kolme kohta. Küsi täpsustusi: kui kaugel, mille kõrval.', 'Oled kohalik. Juhata teed. Kasuta vähemalt 4 juhist ja üht maamärki.',
        ['Vabandage, kuidas ma saan…?', 'Kas see on kaugel?', 'Kas ma pööran siis…?'], ['Mine…', 'Pööra…', 'See on … vastas.']),
      B.letter('014_t_mail', 'Kutse koju.', 'Kutsu sõber külla. Kirjuta tee bussipeatusest oma koju. 50–70 sõna.', 'Tere!', 'Ootan sind!', [50, 70]),
      B.speaking('014_t_voice', 'Häälsõnum kullerile.', 'Kuller ei leia sinu maja. Selgita 1 minutiga, kuidas tulla.', [
        'Kus kuller praegu on?', 'Kuhu ta peab minema?', 'Mis on sinu maja kõrval?', 'Mis korrusel sa elad?',
      ], [45, 75]),
      B.selfcheck('014_t_self', ['Ma küsin teed viisakalt.', 'Ma juhatan teed täpselt.', 'Ma kirjutan teekirjelduse.', 'Ma selgitan teed telefonis.'], 'Keegi ei eksi ära'),
    ],
  },

  'a2b1-015': {
    title: 'Kontroll 3 — kodu ja linn',
    canDo: 'Ma saan kodu ja linna teemalisest tekstist aru ning kasutan Kus? Kuhu? Kust? vorme praktilises olukorras.',
    practice: [
      B.tip('015_p_how', 'Kordamine', 'Tee kõigepealt ilma abita. Siis kontrolli Avasta ja Harjuta lehti ning paranda punase pliiatsiga.', 'full'),
      B.table('015_p_cases', 'Kümme vormi.', 'Kirjuta puuduv vorm.', 'Kus?, Kuhu?, Kust?', [
        'poes | [poodi] | [poest]', '[tööl] | tööle | [töölt]', '[apteegis] | [apteeki] | apteegist', 'kodus | [koju] | [kodust]',
      ]),
      B.choice('015_p_choose', 'Vali õige.', 'Vali sobiv vorm.', [
        ['Ma olen praegu …', 'raamatukogus', 'raamatukokku', 'raamatukogust'], ['Pane piim …', 'külmkappi', 'külmkapis', 'külmkapist'], ['Ta tuleb kell viis …', 'tööl', 'töölt', 'tööle'],
        ['Kuidas ma saan …?', 'jaama', 'jaamas', 'jaamast'], ['Lamp on laua …', 'kõrval', 'kõrvale', 'kõrvalt'],
      ], 'half', 'g_use'),
      B.errorfix('015_p_fix', 'Leia viga.', 'Kirjuta lause õigesti.', [
        ['Ma lähen kodus.', 'Ma lähen koju.'], ['Raamat on riiulile.', 'Raamat on riiulil.'], ['Ta tuleb poodi.', 'Ta tuleb poest.'], ['Mine otse ja pööra parem.', 'Mine otse ja pööra paremale.'],
      ]),
      B.match('015_p_words', 'Sõnavara.', 'Ühenda paarid.', [['laenutan raamatu', 'raamatukogus'], ['ostan ravimit', 'apteegis'], ['saadan paki', 'postkontoris'], ['ootan rongi', 'jaamas']], 'half'),
      B.speaking('015_p_room', 'Kirjelda tuba.', 'Kirjelda oma tuba 1 minut.', ['Mis toas on?', 'Kus mis asub?', 'Mida tahaksid muuta?'], [60, 90]),
      B.selfcheck('015_p_self', ['Ma tegin ülesanded ilma abita.', 'Ma parandasin vead.', 'Ma tean, mida korrata.', 'Olen valmis Kasuta leheks.'], 'Kordamine tehtud'),
    ],
    transfer: [
      B.reading('015_t_read', 'Loe: külaline tuleb.', 'Loe kiri ja vasta.', 'Tee Miia juurde',
        'Tere, Leo! Väga tore, et tuled laupäeval külla. Ma elan kesklinna servas, Kase tänaval. Kui tuled rongiga, välju jaamas ja mine otse kuni suure kohvikuni. Kohviku juures pööra vasakule. Ületa tee ja jätka umbes kakssada meetrit. Minu maja on pagariäri kõrval, väikese pargi vastas. Ma elan teisel korrusel, korter number viis. Kui sul on aega, mine enne lillepoodi jaama juures. Mu emal on laupäeval sünnipäev ja ta armastab tulpe! Kui sa ei leia maja, helista mulle. Ma tulen sulle pargi juurde vastu. Õhtul läheme koos jõe äärde jalutama.',
        [['Kus Miia elab?', 'kesklinna servas|Kase tänaval'], ['Kus peab Leo vasakule pöörama?', 'kohviku juures'], ['Mille kõrval on Miia maja?', 'pagariäri kõrval'], ['Mis on maja vastas?', 'väike park|park'], ['Kuhu soovitab Miia enne minna?', 'lillepoodi']]),
      B.planning('015_t_plan', 'Sinu kord.', 'Kutsu külaline oma koju. Mõtle läbi.', ['Kust ta tuleb?', 'Millised on teejuhised?', 'Milline on sinu kodu?', 'Mida te teete?']),
      B.letter('015_t_letter', 'Kutse (70–90 sõna).', 'Kirjuta: tee sinu koju, sinu kodu kirjeldus ja plaan.', 'Tere!', 'Kohtumiseni!', [70, 90]),
      B.rubric('015_t_rubric', 'Kontrolli kirja.', 'Märgi, mis on olemas.', ['Vähemalt 4 teejuhist.', 'Vähemalt 3 kus-, 2 kuhu- ja 1 kust-vormi.', 'Kodu kirjeldus 3 lausega.', 'Ühine plaan.', 'Kiri on 70–90 sõna.']),
      B.rolecards('015_t_roles', 'Külaline helistab.', 'Külaline on eksinud. Aidake tal kohale jõuda.',
        'Oled külaline. Ütle, kus sa oled ja mida näed.', 'Oled võõrustaja. Küsi, kus ta on, ja juhata ta oma koju.',
        ['Ma olen … juures.', 'Ma näen…', 'Kuhu ma nüüd lähen?'], ['Mida sa näed?', 'Mine…', 'Minu maja on … kõrval.']),
      B.selfcheck('015_t_self', ['Ma mõistan teekirjeldust.', 'Ma kirjutan kutse 70–90 sõnaga.', 'Ma kasutan kus-, kuhu- ja kust-vorme.', 'Ma juhatan telefonis teed.'], 'Moodul 3 tehtud'),
    ],
  },
};
