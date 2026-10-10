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
      B.reading('011_px_read', 'Loe: Eliise uus tuba.', 'Loe tekst ja vasta täislausega.', 'Minu tuba on nüüd valmis',
        'Eelmisel kuul kolisin uude korterisse ja nüüd on minu tuba lõpuks valmis. Tuba ei ole suur, aga see on hele ja hubane. Akna all on kirjutuslaud ja laua peal on lamp ja arvuti. Laua kõrval seisab must tool. Voodi on ukse vastas ja voodi kohal on riiul raamatutega. Riidekapp on nurgas, ukse kõrval. Põrandal on pehme roheline vaip. Seinal on pildid minu perest ja sõpradest. Akna peal kasvavad kaks lille. Õhtul istun tugitoolis lambi all ja loen raamatut. See on minu lemmikkoht kogu korteris.',
        [['Milline on Eliise tuba?', 'hele ja hubane|väike, aga hele'], ['Mis on laua peal?', 'lamp ja arvuti'], ['Kus on voodi?', 'ukse vastas'], ['Kus on riidekapp?', 'nurgas, ukse kõrval|nurgas'], ['Mis on seinal?', 'pildid perest ja sõpradest|pildid'], ['Mis on Eliise lemmikkoht?', 'tugitool lambi all|tugitool']]),
      B.wordforms('011_px_forms', 'Kus? -s või -l?', 'Kirjuta kus-vorm.', [['kapp', 'kus?', 'kapis'], ['laud', 'kus?', 'laual'], ['tuba', 'kus?', 'toas'], ['sein', 'kus?', 'seinal'], ['köök', 'kus?', 'köögis'], ['põrand', 'kus?', 'põrandal'], ['riiul', 'kus?', 'riiulil'], ['esik', 'kus?', 'esikus']]),
      B.gaps('011_px_pos', 'Asukoha sõnad.', 'Vali sobiv sõna.', ['Lamp on laua [peal].', 'Kass magab voodi [all].', 'Tool on laua [kõrval].', 'Vaip on diivani [ees].', 'Riiul on ukse [taga].', 'Kapp on [nurgas].'], ['peal', 'all', 'kõrval', 'ees', 'taga', 'nurgas']),
      B.translation('011_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Книга лежит на столе.', 'Одежда в шкафу.', 'Лампа рядом с кроватью.', 'Под окном стоит стол.', 'В моей комнате есть диван.', 'Ковёр на полу.']),
      B.dictation('011_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu tuba on väike, aga hele.', 'Akna all on kirjutuslaud.', 'Voodi on ukse vastas.', 'Riidekapp on nurgas.', 'Seinal on pildid.', 'Põrandal on roheline vaip.']),
      B.writing('011_px_write', 'Minu tuba.', 'Kirjuta 7–9 lauset oma toast. Kasuta 6 asukohasõna.', [7, 9], ['peal', 'all', 'kõrval', 'ees', 'nurgas'], 4),
      B.speaking('011_px_dream', 'Unistuste kodu.', 'Räägi 1 minut oma unistuste kodust.', ['Kus see on?', 'Mitu tuba seal on?', 'Mis on sinu toas?'], [60, 90]),
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
      B.table('011_tx_compare', 'Võrdle kahte korterit.', 'Täida tabel kuulutuse ja oma kodu põhjal.', 'Mis?, Kuulutuse korter, Minu kodu', ['tubade arv | kaks | ', 'köök | väike, uus pliit | ', 'asukoht | Karlova, pood lähedal | ', 'hind | 550 eurot | ', 'lemmikloomad | lubatud | ']),
      B.speaking('011_tx_choose', 'Kas üüriksid?', 'Ütle 1–2 minutit, kas see korter sobiks sulle ja miks.', ['Mis on hea?', 'Mis ei sobi?', 'Mida sa veel küsiksid?'], [60, 120]),
      B.gaps('011_tx_sms', 'Sõnum sõbrale.', 'Täida sõnum sobiva vormiga.', ['Leidsin korteri! [Köögis] (köök) on uus pliit.', '[Elutoas] (elutuba) on suur aken.', 'Maja [kõrval] on pood.', 'Bussipeatus on maja [ees].', 'Tule laupäeval [külla]!'], ['köögis', 'elutoas', 'kõrval', 'ees', 'külla']),
      B.writing('011_tx_mail', 'Kiri omanikule.', 'Kirjuta korteri omanikule 8–10 lauset: kes sa oled, miks korter sobib, mida veel küsid.', [8, 10], ['korter', 'köök', 'lähedal', 'kas'], 3),
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
      B.reading('012_px_read', 'Loe: Anu päev linnas.', 'Loe ja vasta kus-, kuhu- või kust-vormiga.', 'Anu teisipäev',
        'Anu elab Mustamäel. Hommikul läheb ta kodust bussipeatusse ja sõidab kesklinna. Bussist väljub ta Vabaduse väljakul. Sealt kõnnib ta kontorisse, mis asub vanalinnas. Lõuna ajal läheb Anu kolleegidega kohvikusse. Pärast tööd käib ta poes ja ostab leiba ja piima. Siis läheb ta jõusaali, sest teisipäeviti on tal trenn. Jõusaalist tuleb ta kella kaheksa paiku koju. Kodus paneb ta toidu külmkappi ja istub diivanile. Õhtul helistab ta emale, kes elab Tartus. Ema küsib, millal Anu tuleb Tartusse külla. Anu lubab sõita sinna järgmisel laupäeval.',
        [['Kust Anu hommikul läheb?', 'kodust'], ['Kus Anu bussist väljub?', 'Vabaduse väljakul'], ['Kuhu läheb Anu lõuna ajal?', 'kohvikusse'], ['Kus Anu pärast tööd käib?', 'poes'], ['Kust tuleb Anu kella kaheksa paiku?', 'jõusaalist'], ['Kuhu paneb ta toidu?', 'külmkappi']]),
      B.gaps('012_px_three', 'Kus, kuhu või kust?', 'Kirjuta sõna õiges vormis.', ['Ma olen praegu [tööl] (töö).', 'Kell viis lähen [koju] (kodu).', 'Ta tuleb [poest] (pood).', 'Lapsed on [koolis] (kool).', 'Pane raamat [lauale] (laud).', 'Võta piim [külmkapist] (külmkapp).', 'Me sõidame [Tartusse] (Tartu).', 'Ta tuli [Soomest] (Soome).']),
      B.errorfix('012_px_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma lähen kodus.', 'Ma lähen koju.'], ['Ta on tööle.', 'Ta on tööl.'], ['Ma tulen poodi.', 'Ma tulen poest.'], ['Pane kott laual.', 'Pane kott lauale.'], ['Me elame Tallinnasse.', 'Me elame Tallinnas.']]),
      B.translation('012_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я иду домой.', 'Он на работе.', 'Мы едем в Тарту.', 'Возьми книгу со стола.', 'Она приходит из школы в три.']),
      B.writing('012_px_write', 'Minu teisipäev.', 'Kirjuta 7–9 lauset: kuhu sa lähed, kus oled, kust tuled.', [7, 9], ['lähen', 'olen', 'tulen', 'koju', 'kodust'], 4),
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
      B.manymatch('012_tx_verbs', 'Mis tegusõna?', 'Ühenda tegevus ja küsimus. Mõni sobib mitmega.', ['võtan', 'panen', 'viin', 'toon', 'jätan', 'otsin'], ['Kust?', 'Kuhu?', 'Kus?']),
      B.translation('012_tx_tr', 'Tõlgi korraldused.', 'Kirjuta eesti keeles.', ['Принеси стул из кухни.', 'Отнеси книги в гостиную.', 'Поставь лампу на стол.', 'Возьми ключи у соседа.']),
      B.rolecards('012_tx_roles', 'Kolimisfirma.', 'Rääkige 2–3 minutit.',
        'Oled korteri omanik. Selgita kolijatele, mida, kust ja kuhu viia.', 'Oled kolija. Küsi täpsustusi ja korda üle.',
        ['Viige … elutuppa.', 'Võtke … köögist.'], ['Kuhu me selle paneme?', 'Kust me selle võtame?', 'Kas see läheb magamistuppa?']),
      B.writing('012_tx_story', 'Minu kolimine.', 'Kirjuta 8–10 lauset ühest kolimisest (päris või välja mõeldud). Kasuta 6 kohavormi.', [8, 10], ['viisin', 'tõin', 'panin', 'kust', 'kuhu'], 3),
      B.speaking('012_tx_tell', 'Jutusta.', 'Räägi paarilisele 1–2 minutit oma kolimisest.', ['Kust sa kolisid?', 'Kuhu?', 'Mis oli kõige raskem?'], [60, 120]),
      B.gaps('012_tx_check', 'Kiire kontroll.', 'Kirjuta õige vorm.', ['Too tool [köögist] (köök).', 'Vii raamatud [tuppa] (tuba).', 'Lamp on [laual] (laud).', 'Võtmed on [naabri] juures.'], '', 'half'),
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
      B.reading('013_px_read', 'Loe: Danieli päev.', 'Loe ja vasta.', 'Danieli asjaajamised',
        'Daniel kolis hiljuti Pärnusse. Hommikul läheb ta linnavalitsusse, sest tal on vaja registreerida uus aadress. Seejärel otsib ta apteeki, et osta külmetuse vastu ravimit. Keskpäeval kohtub ta sõbraga raamatukogu ees. Nad söövad lähedal asuvas kohvikus ja lähevad siis turule. Turult ostab Daniel kartuleid ja õunu. Pärastlõunal läheb ta panka, sest ta soovib avada uue konto. Õhtul viib ta postkontorisse paki, mille ta saadab emale Narva. Kõige lõpuks läheb ta spordikeskusesse ujuma. Koju jõuab ta alles kell üheksa. Ta on väsinud, aga rahul, sest kõik asjad on tehtud.',
        [['Miks läheb Daniel linnavalitsusse?', 'registreerida uus aadress'], ['Mida ostab ta apteegist?', 'ravimit külmetuse vastu|ravimit'], ['Kus kohtub ta sõbraga?', 'raamatukogu ees'], ['Mida ta turult ostab?', 'kartuleid ja õunu'], ['Miks läheb ta panka?', 'avada uue konto|tahab avada konto'], ['Kuhu saadab ta paki?', 'emale Narva|Narva']]),
      B.table('013_px_where', 'Kus, kuhu, kust?', 'Kirjuta vormid.', 'koht, kus?, kuhu?, kust?', ['apteek | [apteegis] | [apteeki] | [apteegist]', 'pank | [pangas] | [panka] | [pangast]', 'pood | [poes] | [poodi] | [poest]', 'turg | [turul] | [turule] | [turult]']),
      B.translation('013_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я иду в аптеку.', 'Где здесь банк?', 'Я беру книги в библиотеке.', 'Она ждёт на автобусной остановке.', 'Мы идём в кафе.']),
      B.dictation('013_px_dict', 'Etteütlus.', 'Kuula ja kirjuta.', ['Hommikul läksin panka.', 'Apteegis ostsin ravimit.', 'Raamatukogus laenutasin raamatu.', 'Postkontoris saatsin paki.', 'Õhtul läksin spordikeskusesse.']),
      B.writing('013_px_write', 'Minu linn.', 'Kirjuta 7–9 lauset: millised kohad on sinu kodu lähedal ja mida seal teed.', [7, 9], ['lähedal', 'käin', 'ostan', 'apteek', 'pood'], 3),
      B.speaking('013_px_ask', 'Kus see on?', 'Küsi paariliselt, kus on tema linnas 5 kohta.', ['Kus on lähim apteek?', 'Kuhu sa lähed raha vahetama?', 'Kust sa ostad toitu?'], [60, 90]),
      B.gaps('013_px_go', 'Kuhu ma lähen?', 'Kirjuta koht kuhu-vormis.', ['Tahan raha vahetada. Lähen [panka] (pank).', 'Mul valutab pea. Lähen [apteeki] (apteek).', 'Tahan ujuda. Lähen [ujulasse] (ujula).', 'Pean paki saatma. Lähen [postkontorisse] (postkontor).'], '', 'half'),
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
      B.reading('013_tx_guide', 'Loe linnajuhti.', 'Loe ja vasta.', 'Uue elaniku meelespea',
        'Tere tulemast meie linna! Kõigepealt registreeri oma aadress linnavalitsuses või veebis. Linnavalitsus on avatud tööpäeviti kella kaheksast viieni. Perearsti valimiseks mine polikliinikusse Kesk tänaval. Raamatukogus saad tasuta lugemiskaardi, kui näitad isikutunnistust. Suurim toidupood on bussijaama kõrval ja see on avatud iga päev. Spordikeskuses on ujula ja jõusaal, uutele elanikele on esimene kuu poole hinnaga. Bussipilet maksab üks euro, kaardiga sõidad odavamalt. Küsimuste korral helista infonumbrile. Linna kodulehel on kaart, kus on kõik tähtsad kohad. Head elu uues kodus! Linnas on ka tasuta jalgrattad, mida saab kasutada pangakaardiga.',
        [['Kus saab aadressi registreerida?', 'linnavalitsuses või veebis'], ['Kus valida perearsti?', 'polikliinikus|polikliinikus Kesk tänaval'], ['Mida on vaja raamatukogu kaardi jaoks?', 'isikutunnistust'], ['Kus on suurim toidupood?', 'bussijaama kõrval'], ['Mis on uutele elanikele soodsam?', 'spordikeskus esimene kuu|spordikeskus']]),
      B.speaking('013_tx_tour', 'Linnaekskursioon.', 'Tutvusta grupile 1–2 minutiga oma linna 4 kohta.', ['Mis koht see on?', 'Kus see asub?', 'Mida seal teha saab?'], [60, 120]),
      B.translation('013_tx_tr', 'Tõlgi nõuanded.', 'Kirjuta eesti keeles.', ['Иди в поликлинику на улице Кеск.', 'Банк рядом с вокзалом.', 'В библиотеке можно взять книги бесплатно.', 'Магазин открыт каждый день.', 'Билет на автобус стоит один евро.']),
      B.writing('013_tx_memo', 'Minu linna meelespea.', 'Kirjuta uuele elanikule 8–10 lauset: kuhu minna ja mida seal teha.', [8, 10], ['mine', 'seal', 'lähedal', 'avatud'], 3),
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
      B.reading('014_px_read', 'Loe teekirjeldust.', 'Loe ja vasta.', 'Kuidas jõuda tervisekeskusesse?',
        'Tere! Kui tuled bussiga, välju peatuses Turu. Mine bussipeatusest otse kuni valgusfoorini. Seal pööra paremale ja ületa tee. Mine mööda Pikka tänavat umbes sada meetrit. Paremal näed apteeki. Pärast apteeki pööra vasakule. Tervisekeskus on suur valge maja panga kõrval. Sissepääs on maja tagant, parkla poolt. Kui jõuad raamatukoguni, oled läinud liiga kaugele. Siis mine tagasi ja pööra esimese tänava juures paremale. Kui eksid ära, helista registratuuri. Registratuur on avatud kella kaheksast kuni kella neljani. Palun tule kümme minutit varem ja võta kaasa isikutunnistus.',
        [['Millises peatuses tuleb väljuda?', 'Turu'], ['Kus tuleb esimest korda pöörata?', 'valgusfoori juures|valgusfoori juurest'], ['Mis on paremal Pikal tänaval?', 'apteek'], ['Mille kõrval on tervisekeskus?', 'panga kõrval'], ['Kust on sissepääs?', 'maja tagant|parkla poolt'], ['Mida teha, kui jõuad raamatukoguni?', 'mine tagasi|minna tagasi']]),
      B.gaps('014_px_route', 'Täida teejuhis.', 'Vali sobiv sõna.', ['[Mine] otse kuni ristmikuni.', 'Seal [pööra] vasakule.', '[Ületa] tee ülekäigurajal.', 'Pood on panga [vastas].', 'Apteek on [nurga] peal.', 'Jätka [kuni] sillani.'], ['mine', 'pööra', 'ületa', 'vastas', 'nurga', 'kuni']),
      B.wordorder('014_px_order', 'Pane juhis kokku.', 'Kirjuta laused õigesti.', ['Mine otse kuni valgusfoorini.', 'Pööra teise tänava juures paremale.', 'Pood on kohe pargi vastas.', 'Ületa tee ja jätka sada meetrit.']),
      B.translation('014_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Иди прямо.', 'Поверни налево у банка.', 'Перейди дорогу.', 'Аптека напротив парка.', 'Это далеко?']),
      B.writing('014_px_write', 'Tee minu koju.', 'Kirjuta 7–8 lauset: kuidas jõuda bussipeatusest sinu koju.', [7, 8], ['mine', 'pööra', 'kõrval', 'vastas'], 3),
      B.speaking('014_px_lost', 'Ma eksisin ära.', 'Paariline on eksinud. Juhata ta telefoni teel kooli.', ['Mida sa näed?', 'Kus sa praegu oled?', 'Kuhu pead minema?'], [60, 120]),
      B.match('014_px_signs', 'Märgid linnas.', 'Ühenda silt ja tähendus.', [['Väljapääs', 'siit saab välja'], ['Sissepääs', 'siit saab sisse'], ['Ülekäigurada', 'siin ületa tee'], ['Bussipeatus', 'siin oota bussi'], ['Parkla', 'siin pane auto']], 'half'),
      B.dictation('014_px_dict', 'Etteütlus.', 'Kuula ja kirjuta juhised.', ['Mine otse kuni ristmikuni.', 'Pööra vasakule.', 'Ületa tee.', 'Pood on pargi vastas.']),
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
      B.reading('014_tx_map', 'Loe ja vasta.', 'Loe turisti kirja ja vasta.', 'Kiri hotellile',
        'Tere! Me jõuame laupäeval kell kuus rongiga Tartusse. Meil on kaks suurt kohvrit ja väike laps. Kas hotell on rongijaamast kaugel? Kas peame võtma takso või saame minna jalgsi? Kui läheme jalgsi, palun kirjutage täpne tee. Samuti tahaksime teada, kus on lähim toidupood ja apteek. Pühapäeval plaanime külastada muuseumi ja jalutada jõe ääres. Kas muuseum on hotelli lähedal? Aitäh vastuse eest! Me oleme Tartus esimest korda ja ei tunne linna üldse. Meie laps on kaheaastane ja vajab vankrit. Parimate soovidega, Laura.',
        [['Kuidas Laura Tartusse jõuab?', 'rongiga'], ['Miks võib takso vaja olla?', 'kaks suurt kohvrit ja väike laps|kohvrid ja laps'], ['Mida Laura veel teada tahab?', 'kus on toidupood ja apteek|lähim pood ja apteek'], ['Mida nad pühapäeval teevad?', 'külastavad muuseumi ja jalutavad'], ['Kes kirja kirjutas?', 'Laura']]),
      B.letter('014_tx_reply', 'Vasta Laurale.', 'Oled hotelli töötaja. Selgita teed jaamast hotelli ja vasta küsimustele.', 'Tere, Laura!', 'Ootame teid!', [60, 80]),
      B.translation('014_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Как пройти к вокзалу?', 'Это недалеко, пять минут пешком.', 'Поверни направо у кафе.', 'Музей рядом с рекой.']),
      B.speaking('014_tx_guide', 'Giid.', 'Juhata grupp oma linnas 1–2 minutiga ühest kohast teise.', ['Kust alustame?', 'Kuhu läheme?', 'Mida teel näeme?'], [60, 120]),
      B.gaps('014_tx_gaps', 'Täida vastus.', 'Vali sobiv sõna.', ['Hotell on jaamast [umbes] viis minutit jalgsi.', 'Välju jaamast ja [pööra] paremale.', 'Hotell on jõe [ääres].', 'Pood on hotelli [kõrval].', 'Apteek on poe [vastas].', '[Mine] üle silla ja oled muuseumi juures.'], ['umbes', 'pööra', 'ääres', 'kõrval', 'vastas', 'mine']),
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
      B.reading('015_px_read', 'Loe ja vasta.', 'Loe tekst ja vasta.', 'Minu kodukoht',
        'Ma elan väikeses linnas mere ääres. Minu korter on kolmandal korrusel ja aknast näen sadamat. Kodu lähedal on pood, apteek ja raamatukogu. Kooli juurde kõnnin kümme minutit: kõigepealt mööda mereäärt, siis pööran pargi juures vasakule. Linnas ei ole suurt kaubanduskeskust, seetõttu sõidame laupäeviti bussiga naaberlinna. Suvel on meie linnas palju turiste, talvel on aga vaikne. Mulle meeldib siin elada, sest loodus on lähedal ja inimesed on sõbralikud. Tulevikus tahaksin elada maja kõrval, kus on oma aed. Aga praegu on minu korter mulle täpselt paras.',
        [['Kus linn asub?', 'mere ääres'], ['Mida näeb kirjutaja aknast?', 'sadamat'], ['Mis on kodu lähedal?', 'pood, apteek ja raamatukogu'], ['Kuidas kirjutaja kooli läheb?', 'jalgsi mööda mereäärt|kõnnib'], ['Miks sõidetakse naaberlinna?', 'linnas pole suurt kaubanduskeskust'], ['Miks kirjutajale linn meeldib?', 'loodus on lähedal ja inimesed sõbralikud']]),
      B.gaps('015_px_mix', 'Kümme vormi.', 'Kirjuta õige vorm.', ['Ma elan [Tallinnas] (Tallinn).', 'Homme sõidan [Tartusse] (Tartu).', 'Raamat on [laual] (laud).', 'Ta tuleb [tööle] (töö) kell üheksa.', 'Ma tulen [poest] (pood).', 'Lamp on voodi [kõrval].', '[Mine] otse ja pööra vasakule.', 'Pane piim [külmkappi] (külmkapp).']),
      B.translation('015_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я живу в центре города.', 'Около моего дома есть магазин.', 'Иди прямо до светофора.', 'Ключи на полке.']),
      B.writing('015_px_write', 'Minu kodukoht.', 'Kirjuta 8–10 lauset oma kodust ja kodukohast.', [8, 10], ['elan', 'lähedal', 'kõrval', 'lähen', 'sest'], 4),
      B.speaking('015_px_test', 'Suuline kordamine.', 'Vasta paarilise küsimustele 2 minutit.', ['Kus sa elad?', 'Kuidas jõuad koolist koju?', 'Mis on sinu toas?', 'Kuhu lähed nädalavahetusel?'], [90, 120]),
      B.errorfix('015_px_fix2', 'Paranda veel.', 'Kirjuta lause õigesti.', [['Ma elan Tartu.', 'Ma elan Tartus.'], ['Raamat on riiulile.', 'Raamat on riiulil.'], ['Mine otse ja pöörad vasakule.', 'Mine otse ja pööra vasakule.'], ['Ta tuleb kool.', 'Ta tuleb koolist.']]),
      B.dictation('015_px_dict', 'Etteütlus.', 'Kuula ja kirjuta.', ['Ma elan väikeses linnas.', 'Kodu lähedal on pood.', 'Kooli juurde kõnnin kümme minutit.', 'Pargi juures pööran vasakule.']),
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
      B.translation('015_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Приходи к нам в субботу.', 'Наш дом рядом с пекарней.', 'Напротив дома маленький парк.', 'Я живу на втором этаже.']),
      B.speaking('015_tx_mono', 'Minu kodukoht.', 'Räägi 2 minutit oma kodust ja kodukohast ilma tekstita.', ['Kus sa elad?', 'Milline on sinu kodu?', 'Mis on kodu lähedal?', 'Mis sulle seal meeldib?'], [90, 120]),
      B.writing('015_tx_plan', 'Ühine päev.', 'Kirjuta 8–10 lauset: mida te külalisega linnas teete ja kuhu lähete.', [8, 10], ['kõigepealt', 'siis', 'lähme', 'kus'], 3),
      B.selfcheck('015_t_self', ['Ma mõistan teekirjeldust.', 'Ma kirjutan kutse 70–90 sõnaga.', 'Ma kasutan kus-, kuhu- ja kust-vorme.', 'Ma juhatan telefonis teed.'], 'Moodul 3 tehtud'),
    ],
  },
};
