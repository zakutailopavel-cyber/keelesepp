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
        'Raamat on [laual] (laud).', 'Riided on [kapis] (kapp).', 'Kass magab [diivanil] (diivan).', 'Lamp on [akna] (aken) kõrval.', 'Pildid on [seinal] (sein).', 'Kingad on [esikus] (esik).',
      ], '', 'half'),
      B.diagram('011_p_plan', 'formula', { title: 'Asukoha valem.', instruction: 'Täida lüngad. Vaata näidet.', nodes: 'Mis? | Lamp\nOn | [on]\nKus? | diivani [kõrval]', note: 'Lamp on diivani kõrval. Vaip on laua all. Riiul on akna juures.' }),
      B.truefalse('011_p_room', 'Kas tähendus on sama?', 'Loe lauset. Kas järeldus noole järel on õige?', [
        ['Voodi on akna all. → Akna all on voodi.', true], ['Laud on voodi ees. → Voodi on laua taga.', true], ['Kapp on ukse kõrval. → Kapp on ukse taga.', false], ['Riiul on voodi kohal. → Riiul on voodi all.', false], ['Lamp on laua peal. → Lamp on laual.', true],
      ], 'half'),
      B.errorfix('011_p_fix', 'Paranda kirjeldus.', 'Kirjuta lause õigesti.', [
        ['Raamat on laud.', 'Raamat on laual.'], ['Kass on diivani kõrvale.', 'Kass on diivani kõrval.'], ['Minu tuba on suur aken.', 'Minu toas on suur aken.'], ['Riided on kapil sees.', 'Riided on kapis.'],
      ]),
      B.speaking('011_p_draw', 'Joonista ja räägi.', 'Paariline kirjeldab oma tuba. Sina joonistad. Siis vahetage.', [
        'Mis toas on?', 'Kus on voodi?', 'Mis on akna juures?', 'Mis on sinu lemmikkoht ja miks?',
      ], [60, 90], ['Toas on…', '… on … kõrval / ees / taga / all.', 'Minu lemmikkoht on…, sest…']),
      B.reading('011_px_read', 'Loe: Eliise uus tuba.', 'Loe tekst ja vasta täislausega.', 'Minu tuba on nüüd valmis',
        'Eelmisel kuul kolisin uude korterisse ja nüüd on minu tuba lõpuks valmis. Tuba ei ole suur, aga see on hele ja hubane. Akna all on kirjutuslaud ja laua peal on lamp ja arvuti. Laua kõrval seisab must tool. Voodi on ukse vastas ja voodi kohal on riiul raamatutega. Riidekapp on nurgas, ukse kõrval. Põrandal on pehme roheline vaip. Seinal on pildid minu perest ja sõpradest. Akna peal kasvavad kaks lille. Õhtul istun tugitoolis lambi all ja loen raamatut. See on minu lemmikkoht kogu korteris.',
        [['Milline on Eliise tuba?', 'hele ja hubane|väike, aga hele'], ['Mis on akna juures?', 'kirjutuslaud ja lilled|kirjutuslaud|lilled'], ['Kus on voodi?', 'ukse vastas'], ['Kus on riidekapp?', 'nurgas, ukse kõrval|nurgas'], ['Mis on seinal?', 'pildid perest ja sõpradest|pildid'], ['Mis on Eliise lemmikkoht?', 'tugitool lambi all|tugitool']]),
      B.wordforms('011_px_forms', 'Kus? -s või -l?', 'Kirjuta kus-vorm.', [['kapp', 'kus?', 'kapis'], ['laud', 'kus?', 'laual'], ['tuba', 'kus?', 'toas'], ['sein', 'kus?', 'seinal'], ['köök', 'kus?', 'köögis'], ['põrand', 'kus?', 'põrandal'], ['riiul', 'kus?', 'riiulil'], ['esik', 'kus?', 'esikus']]),
      B.gaps('011_px_pos', 'Asukoha sõnad.', 'Vali sobiv sõna.', ['Lamp on laua [peal].', 'Kass magab voodi [all].', 'Tool on laua [kõrval].', 'Vaip on diivani [ees|vastas].', 'Riiul on ukse [taga].', 'Kapp on [nurgas].'], ['peal', 'all', 'kõrval', 'ees', 'taga', 'nurgas', 'peale', 'nurka']),
      B.translation('011_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Книга лежит на столе.', 'Одежда в шкафу.', 'Лампа рядом с кроватью.', 'Под окном стоит стол.', 'В моей комнате есть диван.', 'Ковёр на полу.']),
      B.dictation('011_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu tuba on väike, aga hele.', 'Akna all on kirjutuslaud.', 'Voodi on ukse vastas.', 'Riidekapp on nurgas.', 'Seinal on pildid.', 'Põrandal on roheline vaip.']),
      B.writing('011_px_write', 'Minu tuba.', 'Kirjuta 7–9 lauset oma toast. Kasuta 6 asukohasõna.', [7, 9], ['peal', 'all', 'kõrval', 'ees', 'nurgas'], 4),
      B.speaking('011_px_dream', 'Unistuste kodu.', 'Räägi 1 minut oma unistuste kodust.', ['Kus see on?', 'Mitu tuba seal on?', 'Mis on sinu toas?'], [60, 90]),
      B.selfcheck('011_p_self', ['Ma tean 12 kodu sõna.', 'Ma ütlen, kus asi on: laual, kapis, kõrval.', 'Ma parandan asukoha vead.', 'Ma kirjeldan tuba nii, et teine joonistab.'], 'Minu tuba on sõnades'),
    ],
    transfer: [
      B.reading('011_t_ad', 'Üürikuulutus.', 'Loe kuulutus ja vasta küsimustele.', 'Üürile anda kahetoaline korter',
        'Anname üürile valgusküllase kahetoalise korteri Tartus, Karlova linnaosas. Korter on kolmandal korrusel, majas on lift. Esikus on suur riidekapp. Köök on väike, aga seal on uus pliit ja nõudepesumasin. Elutoas on diivan, raamaturiiul ja suur aken lõuna poole. Magamistoas on lai voodi ja kirjutuslaud akna all. Vannitoas on dušš ja pesumasin. Rõdu ei ole, aga hoovis on väike aed pinkidega. Maja kõrval on pood ja bussipeatus. Kesklinna sõidab buss kümme minutit, jalgsi jõuab sinna veerand tunniga. Hoovis on parkla ja jalgrattahoidla. Hind on 550 eurot kuus, kommunaalkulud lisaks. Internet on hinna sees. Naabrid on vaiksed ja sõbralikud. Talvel on need umbes 120 eurot. Lemmikloomad on lubatud, aga korteris ei tohi suitsetada. Korter on vaba alates esimesest novembrist. Helista õhtuti pärast kella kuut!',
        [['Mitu tuba korteris on?', 'kaks|2'], ['Mis on köögis uus?', 'pliit ja nõudepesumasin|pliit'], ['Kus on kirjutuslaud?', 'magamistoas akna all|akna all'], ['Mis on maja kõrval?', 'pood ja bussipeatus'], ['Kas koera võib kaasa võtta?', 'jah|jah, lemmikloomad on lubatud']]),
      B.choice('011_t_fit', 'Kas korter sobib?', 'Kes võiks selle korteri üürida? Vali.', [
        ['Annal on koer ja ta töötab kodus.', 'Sobib: loomad on lubatud ja on kirjutuslaud.', 'Ei sobi: loomad ei ole lubatud.', 'Ei sobi: korteris pole lauda.'],
        ['Peeter sõidab iga päev kesklinna.', 'Sobib: maja kõrval on bussipeatus.', 'Ei sobi: kesklinna sõidab buss üks tund.', 'Ei sobi: bussipeatus on kaugel.'],
        ['Liisal on kolm last.', 'Ilmselt ei sobi: korter on kahetoaline.', 'Sobib väga hästi: korter on suur.', 'Sobib: seal on kolm magamistuba.'],
        ['Marko tahab maksta alla 500 euro.', 'Ei sobi: hind on 550 eurot.', 'Sobib: hind on 450 eurot.', 'Sobib: kommunaalkulud on hinna sees.'],
        ['Tiit suitsetab ja tahab hommikul rõdul kohvi juua.', 'Ei sobi: suitsetada ei tohi ja rõdu pole.', 'Sobib: korteril on suur rõdu.', 'Sobib: suitsetamine on lubatud.'],
      ], 'full', 'g_read'),
      B.rolecards('011_t_call', 'Helista omanikule.', 'Üks on üürnik, teine korteri omanik. Rääkige 2 minutit.',
        'Sa otsid korterit. Küsi vähemalt 4 küsimust: tubade, mööbli ja asukoha kohta.', 'Sa annad korterit üürile. Vasta kuulutuse järgi. Küsi, kellega üürnik elab.',
        ['Kas köögis on…?', 'Kus asub…?', 'Kas maja lähedal on…?'], ['Jah, köögis on…', 'Magamistoas on…', 'Kellega te elate?']),
      B.planning('011_t_plan', 'Minu unistuste tuba.', 'Mõtle enne kirjutamist.', ['Mis tuba see on?', 'Mis mööbel seal on?', 'Kus mis asub?', 'Miks see tuba sulle meeldib?']),
      B.writing('011_t_write', 'Kirjelda unistuste tuba.', 'Kirjuta 6–8 lauset. Kasuta 6 asukohaväljendit.', [6, 8], ['kõrval', 'ees', 'juures', 'laual', 'sest'], 4),
      B.table('011_tx_compare', 'Võrdle kahte korterit.', 'Täida tabel kuulutuse ja oma kodu põhjal.', 'Mis?, Kuulutuse korter, Minu kodu', ['tubade arv | kaks | ', 'köök | väike, uus pliit | ', 'asukoht | Karlova, pood lähedal | ', 'hind | 550 eurot | ', 'lemmikloomad | lubatud | ']),
      B.speaking('011_tx_choose', 'Kas üüriksid?', 'Ütle 1–2 minutit, kas see korter sobiks sulle ja miks.', ['Mis on hea?', 'Mis ei sobi?', 'Mida sa veel küsiksid?'], [60, 120]),
      B.gaps('011_tx_sms', 'Sõnum sõbrale.', 'Täida sõnum sobiva vormiga.', ['Leidsin korteri! [Köögis] (köök) on uus pliit.', '[Elutoas] (elutuba) on suur aken.', 'Maja [kõrval] on pood.', 'Bussipeatus on maja [ees].', 'Tule laupäeval [külla]!'], ['köögis', 'kööki', 'elutoas', 'elutuppa', 'kõrval', 'kõrvale', 'ees', 'külla']),
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
        [['Kust Anu hommikul läheb?', 'kodust'], ['Kuhu sõidab Anu järgmisel laupäeval?', 'Tartusse|ema juurde Tartusse|ema juurde'], ['Kuhu läheb Anu lõuna ajal?', 'kohvikusse'], ['Kus Anu pärast tööd käib?', 'poes'], ['Kust tuleb Anu kella kaheksa paiku?', 'jõusaalist'], ['Kuhu paneb ta toidu?', 'külmkappi']]),
      B.gaps('012_px_three', 'Kus, kuhu või kust?', 'Kirjuta sõna õiges vormis.', ['Ma olen praegu [tööl] (töö).', 'Kell viis lähen [koju] (kodu).', 'Ta tuleb [poest] (pood).', 'Lapsed on [koolis] (kool).', 'Pane raamat [lauale] (laud).', 'Võta piim [külmkapist] (külmkapp).', 'Me sõidame [Tartusse] (Tartu).', 'Ta tuli [Soomest] (Soome).']),
      B.errorfix('012_px_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma lähen kodus.', 'Ma lähen koju.'], ['Ta on tööle.', 'Ta on tööl.'], ['Ma tulen poodi.', 'Ma tulen poest.'], ['Pane kott laual.', 'Pane kott lauale.'], ['Me elame Tallinnasse.', 'Me elame Tallinnas.']]),
      B.translation('012_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я иду домой.', 'Он на работе.', 'Мы едем в Тарту.', 'Возьми книгу со стола.', 'Она приходит из школы в три.']),
      B.writing('012_px_write', 'Minu teisipäev.', 'Kirjuta 7–9 lauset: kuhu sa lähed, kus oled, kust tuled.', [7, 9], ['lähen', 'olen', 'tulen', 'koju', 'kodust'], 4),
      B.selfcheck('012_p_self', ['Ma moodustan vormikolmiku.', 'Ma valin küsimuse tegusõna järgi.', 'Ma kirjutan kuulatud laused.', 'Ma annan 6 korraldust.'], 'Kus, kuhu, kust — selge'),
    ],
    transfer: [
      B.reading('012_t_story', 'Kolimispäev.', 'Loe lugu ja vasta küsimustele.', 'Kolisin uude koju',
        'Eelmisel laupäeval kolisin sõbraga uude korterisse. Hommikul pakkisin raamatud kastidesse ja panin riided suurde kotti. Kell kümme viisime kastid toast autosse. Uue maja juures võtsime kastid autost välja ja viisime need kolmandale korrusele. Lift ei töötanud, seetõttu pidime trepist üles minema. Köögis panime nõud kappi ja kohvimasina lauale. Hiljem tõime magamistoast lambi elutuppa. Õhtul olid peaaegu kõik asjad uues kodus. Olin väsinud, aga rõõmus. Esmaspäeval läksin uuest korterist tööle. Kolleeg küsis, kuidas kolimine läks. Vastasin: „Hästi, aga järgmine kord valin maja, kus lift töötab!”',
        [['Kust nad kastid autosse viisid?', 'toast'], ['Kuhu nad kastid viisid?', 'kolmandale korrusele'], ['Miks nad trepist läksid?', 'lift ei töötanud'], ['Mida tahab kirjutaja järgmisel kolimisel teisiti teha?', 'valida maja, kus lift töötab|valib maja, kus lift töötab|valida liftiga maja'], ['Kust nad lambi tõid?', 'magamistoast']]),
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
      B.gaps('012_tx_check', 'Kiire kontroll.', 'Kirjuta õige vorm.', ['Too tool [köögist] (köök).', 'Vii raamatud [tuppa] (tuba).', 'Lamp on [laual] (laud).', 'Võtmed on [naabri] (naaber) juures.'], '', 'half'),
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
      B.truefalse('013_p_sense', 'Kus Daniel käis?', 'Daniel kirjutab: „Hommikul käisin pangas, siis läksin apteeki. Raamatukokku ma täna ei jõudnud, lähen sinna homme.” Õige või vale?', [
        ['Daniel käis hommikul pangas.', true], ['Daniel laenutas täna raamatu.', false], ['Daniel käis apteegis enne panka.', false], ['Pärast panka läks Daniel apteeki.', true], ['Homme läheb Daniel raamatukokku.', true],
      ], 'half'),
      B.speaking('013_p_day', 'Minu asjaajamised.', 'Räägi 1 minut: kuhu lähed sel nädalal ja miks.', [
        'Kuhu sa lähed esmaspäeval?', 'Mida sa seal teed?', 'Kust sa ostad toitu?', 'Kus sa kohtud sõpradega?',
      ], [60, 90], ['Esmaspäeval lähen…, sest…', 'Seal ma…', 'Pärast seda…']),
      B.reading('013_px_read', 'Loe: Danieli päev.', 'Loe ja vasta.', 'Danieli asjaajamised',
        'Daniel kolis hiljuti Pärnusse. Hommikul läheb ta linnavalitsusse, sest tal on vaja registreerida uus aadress. Seejärel otsib ta apteeki, et osta külmetuse vastu ravimit. Keskpäeval kohtub ta sõbraga raamatukogu ees. Nad söövad lähedal asuvas kohvikus ja lähevad siis turule. Turult ostab Daniel kartuleid ja õunu. Pärastlõunal läheb ta panka, sest ta soovib avada uue konto. Õhtul viib ta postkontorisse paki, mille ta saadab emale Narva. Kõige lõpuks läheb ta spordikeskusesse ujuma. Koju jõuab ta alles kell üheksa. Ta on väsinud, aga rahul, sest kõik asjad on tehtud.',
        [['Miks läheb Daniel linnavalitsusse?', 'registreerida uus aadress'], ['Mida ostab ta apteegist?', 'ravimit külmetuse vastu|ravimit'], ['Mida teeb Daniel koos sõbraga?', 'söövad kohvikus ja lähevad turule|sööb kohvikus ja läheb turule|söövad kohvikus'], ['Mida ta turult ostab?', 'kartuleid ja õunu'], ['Miks läheb ta panka?', 'avada uue konto|tahab avada konto'], ['Kuhu saadab ta paki?', 'emale Narva|Narva']]),
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
        [['Kus saab aadressi registreerida?', 'linnavalitsuses või veebis'], ['Kus valida perearsti?', 'polikliinikus|polikliinikus Kesk tänaval'], ['Mida on vaja raamatukogu kaardi jaoks?', 'isikutunnistust'], ['Kas suurimas toidupoes saab käia ka pühapäeval?', 'jah|jah, see on avatud iga päev'], ['Mis on uutele elanikele soodsam?', 'spordikeskus esimene kuu|spordikeskus']]),
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
      B.match('014_p_signs', 'Juhis ja tähendus.', 'Ühenda väljend ja seletus.', [
        ['mine otse', 'ära pööra kuskile'], ['pööra paremale', 'mine parema käe poole'], ['ületa tee', 'mine teisele poole teed'], ['nurga peal', 'seal, kus kaks tänavat kokku saavad'], ['vastas', 'teisel pool teed, otse ees'], ['kuni ristmikuni', 'nii kaugele, kuni tänavad ristuvad'],
      ], 'half'),
      B.wordforms('014_p_imp', 'Käskiv kõneviis.', 'Kirjuta käsk: sõbrale sa-vorm, võõrale te-vorm.', [
        ['minema', 'sa-käsk', 'mine'], ['pöörama', 'sa-käsk', 'pööra'], ['ületama', 'sa-käsk', 'ületa'], ['jätkama', 'sa-käsk', 'jätka'], ['tulema', 'te-käsk', 'tulge'], ['sõitma', 'te-käsk', 'sõitke'], ['minema', 'te-käsk', 'minge'], ['pöörama', 'te-käsk', 'pöörake'],
      ]),
      B.diagram('014_p_flow', 'flow', { title: 'Tee apteeki.', instruction: 'Kirjuta puuduvad tegusõnad.', nodes: '[Mine] otse kuni valgusfoorini.\n[Pööra] paremale.\n[Ületa] tee.\nApteek on panga [kõrval].' }),
      B.errorfix('014_p_fix', 'Paranda juhis.', 'Kirjuta juhis õigesti.', [
        ['Mine otse ja pööra vasak.', 'Mine otse ja pööra vasakule.'], ['Pood on panga vastu.', 'Pood on panga vastas.'], ['Ületa teed ja minna paremale.', 'Ületa tee ja mine paremale.'], ['Apteek on nurga peale.', 'Apteek on nurga peal.'],
      ]),
      // Harno A2 listening: a phone call, read twice, answers of 1–2 words
      B.listening('014_p_listen', 'Kuula teed.', 'Õpetaja loeb telefonikõne kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Kati! Ma olen bussist väljas, aga ma ei leia raamatukogu.', '— Tere! Kus sa praegu oled?', '— Bussipeatuses Turu. Siin on suur toidupood.',
        '— Hästi. Mine poe juurest otse kuni ristmikuni. Seal on suur valge pank. Panga juures pööra vasakule.', '— Panga juures vasakule. Selge.',
        '— Siis ületa tee ülekäigurajal ja jätka umbes sada meetrit. Paremal näed kohvikut „Mesi”. Raamatukogu on kohviku vastas. See on kollane maja.',
        '— Kas see on kaugel?', '— Ei, umbes kümme minutit jalgsi.', '— Aga mis kell raamatukogu kinni läheb?',
        '— Täna on reede, nii et kell kuus. Laupäeval on see avatud ainult kella kolmeni.', '— Mu vend tuleb hiljem autoga. Kas seal on parkla?',
        '— Jah, parkla on maja taga. Sissepääs on Pargi tänavalt. Ma ootan sind raamatukogu ukse juures.', '— Aitäh! Ma tulen kohe. Varsti näeme!',
      ], ['Mine otse kuni [ristmikuni].', 'Panga juures pööra [vasakule].', 'Ületa tee ja jätka umbes [sada|100] meetrit.', 'Raamatukogu on [kohviku] vastas.', 'Täna läheb raamatukogu kinni kell [kuus|6|18].', 'Parkla on maja [taga].']),
      B.speaking('014_p_map', 'Kaardiga paaris.', 'Vali kaardil algus ja lõpp. Juhata paarilist 4–6 sammuga.', [
        'Kust sa alustad?', 'Kuhu sa lähed?', 'Kus pöörad?', 'Mis on sihtkoha kõrval või vastas?',
      ], [45, 90], ['Mine otse…', 'Pööra … juures…', 'See on … kõrval / vastas.']),
      B.reading('014_px_read', 'Loe teekirjeldust.', 'Loe ja vasta.', 'Kuidas jõuda tervisekeskusesse?',
        'Tere! Kui tuled bussiga, välju peatuses Turu. Mine bussipeatusest otse kuni valgusfoorini. Seal pööra paremale ja ületa tee. Mine mööda Pikka tänavat umbes sada meetrit. Paremal näed apteeki. Pärast apteeki pööra vasakule. Tervisekeskus on suur valge maja panga kõrval. Sissepääs on maja tagant, parkla poolt. Kui jõuad raamatukoguni, oled läinud liiga kaugele. Siis mine tagasi ja pööra esimese tänava juures paremale. Kui eksid ära, helista registratuuri. Registratuur on avatud kella kaheksast kuni kella neljani. Palun tule kümme minutit varem ja võta kaasa isikutunnistus.',
        [['Millises peatuses tuleb väljuda?', 'Turu'], ['Kus tuleb esimest korda pöörata?', 'valgusfoori juures|valgusfoori juurest'], ['Sinu aeg on kell kümme. Mis kell pead kohal olema?', '9.50|kell 9.50|kümme minutit enne kümmet|üheksa viiskümmend'], ['Mille kõrval on tervisekeskus?', 'panga kõrval'], ['Kust on sissepääs?', 'maja tagant|parkla poolt'], ['Mida teha, kui jõuad raamatukoguni?', 'mine tagasi|minna tagasi']]),
      B.gaps('014_px_route', 'Täida teejuhis.', 'Vali sobiv sõna.', ['[Mine] otse kuni ristmikuni.', 'Seal [pööra] vasakule.', '[Ületa] tee ülekäigurajal.', 'Pood on panga [vastas].', 'Apteek on [nurga] peal.', 'Jätka [kuni] sillani.'], ['mine', 'pööra', 'ületa', 'vastas', 'nurga', 'kuni', 'mööda', 'nurgal']),
      B.wordorder('014_px_order', 'Pane juhis kokku.', 'Kirjuta laused õigesti.', ['Mine otse kuni valgusfoorini.', 'Pööra teise tänava juures paremale.', 'Pood on kohe pargi vastas.', 'Ületa tee ja jätka sada meetrit.']),
      B.translation('014_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Иди прямо.', 'Поверни налево у банка.', 'Перейди дорогу.', 'Аптека напротив парка.', 'Это далеко?']),
      B.writing('014_px_write', 'Tee minu koju.', 'Kirjuta 7–8 lauset: kuidas jõuda bussipeatusest sinu koju.', [7, 8], ['mine', 'pööra', 'kõrval', 'vastas'], 3),
      B.speaking('014_px_lost', 'Ma eksisin ära.', 'Paariline on eksinud. Juhata ta telefoni teel kooli.', ['Mida sa näed?', 'Kus sa praegu oled?', 'Kuhu pead minema?'], [60, 120]),
      B.match('014_px_signs', 'Märgid linnas.', 'Ühenda silt ja tähendus.', [['Väljapääs', 'siit saab välja'], ['Sissepääs', 'siit saab sisse'], ['Ülekäigurada', 'siin saab teed ületada'], ['Bussipeatus', 'siin saab bussi oodata'], ['Parkla', 'siia saab auto parkida']], 'half'),
      B.dictation('014_px_dict', 'Etteütlus.', 'Kuula ja kirjuta juhised.', ['Mine otse kuni ristmikuni.', 'Pööra vasakule.', 'Ületa tee.', 'Pood on pargi vastas.']),
      B.selfcheck('014_p_self', ['Ma tean 8 juhise väljendit.', 'Ma moodustan sa- ja te-käsu.', 'Ma saan kuulatud teest aru.', 'Ma juhatan teed 4–6 sammuga.'], 'Tean teed'),
    ],
    transfer: [
      B.dialogue('014_t_tourist', 'Turist küsib teed.', 'Täida dialoog.', 'Turist', 'Sina', [
        ['A', 'Vabandage, kas te [oskate] öelda, kus on vanalinn?'], ['B', 'Muidugi. Minge otse kuni [ristmikuni].'], ['A', 'Ja siis?'],
        ['B', 'Siis [pöörake] paremale ja ületage tee.'], ['A', 'Kas see on [kaugel]?'], ['B', 'Ei, umbes kümme minutit jalgsi.'],
      ]),
      B.truefalse('014_t_check', 'Kas turist sai aru?', 'Loe dialoogi uuesti. Õige või vale?', [
        ['Turist otsib vanalinna.', true], ['Ristmikul tuleb pöörata vasakule.', false], ['Teel tuleb ületada tee.', true], ['Vanalinn on väga kaugel.', false],
      ], 'full'),
      B.rolecards('014_t_roles', 'Kohalik ja turist.', 'Rääkige. Seejärel vahetage algus- ja sihtkoht.',
        'Oled turist. Küsi teed kolme kohta. Küsi täpsustusi: kui kaugel, mille kõrval.', 'Oled kohalik. Juhata teed. Kasuta vähemalt 4 juhist ja üht maamärki.',
        ['Vabandage, kuidas ma saan…?', 'Kas see on kaugel?', 'Kas ma pööran siis…?'], ['Minge…', 'Pöörake…', 'See on … vastas.']),
      B.letter('014_t_mail', 'Kutse koju.', 'Kutsu sõber külla. Kirjuta tee bussipeatusest oma koju. 50–70 sõna.', 'Tere!', 'Ootan sind!', [50, 70]),
      B.speaking('014_t_voice', 'Häälsõnum kullerile.', 'Kuller ei leia sinu maja. Selgita 1 minutiga, kuidas tulla.', [
        'Kus kuller praegu on?', 'Kuhu ta peab minema?', 'Mis on sinu maja kõrval?', 'Mis korrusel sa elad?',
      ], [45, 75]),
      B.reading('014_tx_map', 'Loe ja vasta.', 'Loe turisti kirja ja vasta.', 'Kiri hotellile',
        'Tere! Me jõuame laupäeval kell kuus rongiga Tartusse. Meil on kaks suurt kohvrit ja väike laps. Kas hotell on rongijaamast kaugel? Kas peame võtma takso või saame minna jalgsi? Kui läheme jalgsi, palun kirjutage täpne tee. Samuti tahaksime teada, kus on lähim toidupood ja apteek. Pühapäeval plaanime külastada muuseumi ja jalutada jõe ääres. Kas muuseum on hotelli lähedal? Aitäh vastuse eest! Me oleme Tartus esimest korda ja ei tunne linna üldse. Meie laps on kaheaastane ja vajab vankrit. Parimate soovidega, Laura.',
        [['Kuidas Laura Tartusse jõuab?', 'rongiga'], ['Miks võib takso vaja olla?', 'kaks suurt kohvrit ja väike laps|kohvrid ja laps'], ['Mida Laura veel teada tahab?', 'kus on toidupood ja apteek|lähim pood ja apteek'], ['Mida nad pühapäeval teevad?', 'külastavad muuseumi ja jalutavad'], ['Kas Laura on varem Tartus käinud?', 'ei|ei, ta on Tartus esimest korda']]),
      B.letter('014_tx_reply', 'Vasta Laurale.', 'Oled hotelli töötaja. Selgita teed jaamast hotelli ja vasta küsimustele.', 'Tere, Laura!', 'Ootame teid!', [60, 80]),
      B.translation('014_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Как пройти к вокзалу?', 'Это недалеко, пять минут пешком.', 'Поверни направо у кафе.', 'Музей рядом с рекой.']),
      B.speaking('014_tx_guide', 'Giid.', 'Juhata grupp oma linnas 1–2 minutiga ühest kohast teise.', ['Kust alustame?', 'Kuhu läheme?', 'Mida teel näeme?'], [60, 120]),
      B.gaps('014_tx_gaps', 'Täida vastus.', 'Vali sobiv sõna.', ['Hotell on jaamast [umbes] viis minutit jalgsi.', 'Väljuge jaamast ja [pöörake] paremale.', 'Hotell on jõe [ääres].', 'Pood on hotelli [kõrval].', 'Apteek on poe [vastas].', '[Minge] üle silla ja olete muuseumi juures.'], ['umbes', 'pöörake', 'pööra', 'ääres', 'kõrval', 'vastas', 'minge', 'mine']),
      B.selfcheck('014_t_self', ['Ma küsin teed viisakalt.', 'Ma juhatan teed täpselt.', 'Ma kirjutan teekirjelduse.', 'Ma selgitan teed telefonis.'], 'Keegi ei eksi ära'),
    ],
  },

  // Kontroll 3 in the Harno A2 exam format: Harjuta = reading (tasks 1–5) and listening, Kasuta = writing (tasks 1–2)
  // and speaking (picture, idea card), on the module's topic home, places and town
  'a2b1-015': {
    title: 'Kontroll 3 — kodu ja linn',
    canDo: 'Ma saan kodu ja linna teemalisest tekstist aru ning kasutan Kus? Kuhu? Kust? vorme praktilises olukorras.',
    practice: [
      B.tip('015_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See leht on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: everyday phrases and politeness
      B.choice('015_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa otsid apteeki. Kuidas küsid võõralt?', 'Vabandage, kus on lähim apteek?', 'Kus apteek on? Ütle kiiresti!', 'Tere, kas te olete apteeker?'],
        ['Võõras küsib sinult teed, aga sa ei tea. Mida ütled?', 'Vabandust, ma ei ole siit kandist.', 'Muidugi, see on kohe nurga taga.', 'Pole tänu väärt, head teed!'],
        ['Naaber aitas sul kaste kanda. Mida ütled?', 'Suur aitäh, see oli väga lahke!', 'Palun väga, pole midagi!', 'Vabandust, et ma hiljaks jäin!'],
        ['Sa kutsud naabri oma uude koju. Mida ütled?', 'Tulge laupäeval meile kohvile!', 'Minge laupäeval koju puhkama!', 'Kas te kolite laupäeval ära?'],
        ['Bussis astusid kogemata kellelegi varbale. Mida ütled?', 'Oi, vabandust!', 'Palun väga!', 'Head aega!'],
        ['Sõber kolis uude korterisse. Mida ütled?', 'Palju õnne uue kodu puhul!', 'Head paranemist ja jõudu!', 'Kahju, et sul pole kodu!'],
      ]),
      // reading 2: three short ads, answers by letter or in 1–2 words
      B.reading('015_p_three', 'Lugemine 2. Kolm kuulutust.', 'Loe kolme kuulutust. Vasta kuulutuse tähega (A, B, C) või lühidalt.', 'Kodu otsin',
        'A. Üürile ühetoaline korter kesklinnas, teisel korrusel. Köök ja tuba on koos. Maja on vaikses tänavas ja pood on maja all. Sobib hästi üliõpilasele. Loomad ei ole lubatud. Hind on 380 eurot kuus.\n\nB. Müüa kolmetoaline korter Annelinnas, neljandal korrusel. Majas on lift. Kooli ja lasteaeda on viis minutit jalgsi. Korteril on suur rõdu ja kaks parkimiskohta. Hind kokkuleppel.\n\nC. Üürile väike maja linna serval. Majas on kaks tuba, saun ja suur aed. Aias saab grillida. Kesklinna sõidab buss pool tundi. Koer on teretulnud. Hind on 600 eurot kuus.',
        [['Millist kodu ei saa üürida, vaid tuleb osta?', 'B'], ['Kus saab elada koos koeraga?', 'C|majas'], ['Milline kodu on lastega perele kõige mugavam?', 'B'], ['Kus on köök ja tuba koos?', 'A'], ['Kui kaua sõidab majast kesklinna?', 'pool tundi|30 minutit'], ['Kus saab õues grillida?', 'C|majas|maja aias']]),
      // reading 3: signs and notices matched to what they mean
      B.match('015_p_signs', 'Lugemine 3. Mida silt tähendab?', 'Ühenda silt ja selle tähendus.', [
        ['Apteek: E–R 8–20, L 9–15, P suletud', 'Pühapäeval siit ravimit ei saa.'], ['Ujula: lapsed alla 7 aasta tasuta', 'Väike laps ujub ilma piletita.'],
        ['Raamatute tagastamise kast ukse kõrval', 'Raamatu saab tagasi tuua ka siis, kui uks on kinni.'], ['Parkla ainult elanikele', 'Külaline peab auto mujale panema.'],
        ['Remont! Lift ei tööta 1.–5. märtsini', 'Märtsi alguses tuleb minna trepist.'], ['Postkontor kolis: uus aadress Kesk 5', 'Pakki tuleb saata teisest kohast.'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text with 3-option questions
      B.reading('015_px_read', 'Lugemine 4. Minu kodukoht.', 'Loe tekst ja vasta lühidalt.', 'Minu kodukoht',
        'Ma elan väikeses linnas mere ääres. Minu korter on kolmandal korrusel ja aknast näen sadamat. Korter on väike, ainult kaks tuba, aga väga hele. Kodu lähedal on pood, apteek ja raamatukogu. Kooli juurde kõnnin kümme minutit. Kõigepealt lähen mööda mereäärt, siis pööran pargi juures vasakule. Linnas ei ole suurt kaubanduskeskust. Seetõttu sõidame laupäeviti bussiga naaberlinna. Bussiga kestab sõit pool tundi. Suvel on meie linnas palju turiste ja kohvikud on täis. Talvel on aga vaikne ja paljud kohvikud on kinni. Mulle meeldib siin elada, sest loodus on lähedal ja inimesed on sõbralikud. Naabrid aitavad alati, kui midagi on vaja. Ainult üks asi on halb: kino on meil ainult reedeti. Tulevikus tahaksin elada majas, kus on oma aed. Aga praegu on minu korter mulle täpselt paras.',
        [['Mis korrusel korter on?', 'kolmandal|kolmandal korrusel'], ['Mida näeb kirjutaja aknast?', 'sadamat'], ['Kui kaua kestab bussisõit naaberlinna?', 'pool tundi|30 minutit']]),
      B.choice('015_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Miks sõidab pere laupäeviti naaberlinna?', 'Kodulinnas pole suurt kaubanduskeskust.', 'Seal elavad nende sugulased.', 'Kodulinnas on liiga palju turiste.'],
        ['Kuidas läheb kirjutaja kooli?', 'jalgsi, mööda mereäärt', 'bussiga, pargi kõrvalt', 'rattaga, sadama kaudu'],
        ['Milline on linn talvel?', 'vaikne, paljud kohvikud on kinni', 'täis turiste', 'kohvikud on täis'],
        ['Mis on kirjutaja arvates halb?', 'Kino on ainult reedeti.', 'Naabrid ei aita.', 'Loodus on kaugel.'],
        ['Millises kodus tahaks kirjutaja tulevikus elada?', 'majas, kus on oma aed', 'suures korteris kesklinnas', 'korteris sadama lähedal'],
      ]),
      // reading 5: a personal letter with 8 option gaps
      B.cloze('015_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Mart!', [
        'Ma kolisin lõpuks uude {*korterisse|korteris|korterist}! See asub kesklinnas, Kase tänaval. Maja {*kõrval|kõrvale|kõrvalt} on väike park ja pagariäri. Hommikul ostan sealt värsket saia.',
        '',
        'Minu tuba on väike, aga hele. Voodi on akna {*all|alla|alt} ja kapp on nurgas. Korteris on ka väike rõdu. Tööle lähen nüüd jalgsi, sest töö on ainult kümne minuti {*kaugusel|kaugele|kaugelt}. Õhtul tulen {*töölt|tööle|tööl} koju läbi pargi.',
        '',
        'Laupäeval teen kodus väikese peo. Kas sa tuled ka? Bussiga saad {*jaamast|jaama|jaamas} otse meie maja ette. Kui sa maja ei leia, {*helista|helistab|helistama} mulle! Ootan sind {*külla|külas|külast}!',
        '',
        'Kallistusega, Eva',
      ]),
      // listening 3 of the A2 exam: an announcement, read twice, answers of 1–2 words
      B.listening('015_p_listen', 'Kuulamine 1. Raadioteade.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head kuulajad! Laupäeval on meie linnas linnapäev. Pidu algab kell kümme hommikul raekoja platsil. Kõigepealt mängib seal orkester.',
        'Kell üksteist algab laste jooksuvõistlus pargis. Lastele on pargis ka batuudid ja näomaalingud. Lõuna ajal saab turul süüa tasuta suppi. Võtke kaasa oma tass ja lusikas.',
        'Pärastlõunal on raamatukogus avatud uste päev. Seal saab vaadata vanu pilte meie linnast. Muuseum on sel päeval tasuta.',
        'Kell neli algab sadamas paadisõit. Pileti hind on viis eurot, lapsed sõidavad tasuta.',
        'Õhtul kell kaheksa algab platsil kontsert. Kui sajab vihma, on kontsert spordihallis. Peo lõpetab kell üksteist ilutulestik.',
        'Kesklinnas on laupäeval autoga sõitmine keelatud. Seepärast palume tulla jalgsi, rattaga või bussiga. Bussid sõidavad sel päeval iga kümne minuti järel.',
        'Täpsem info on linna kodulehel. Tulge kõik!',
      ], ['Pidu algab kell [kümme|10].', 'Laste jooksuvõistlus on [pargis].', 'Lõuna ajal saab turul tasuta [suppi].', 'Paadisõit algab [sadamas].', 'Täiskasvanu pilet maksab [viis|5] eurot.', 'Vihma korral on kontsert [spordihallis].', 'Bussid sõidavad iga [kümne|10] minuti järel.']),
      // a conversation (A2 listening 2 and 4), answers of 1–2 words
      B.listening('015_p_listen2', 'Kuulamine 2. Uus korter.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Jaan! Kuulsin, et sa kolisid.', '— Jah, eelmisel nädalal. Nüüd elan Supilinnas.', '— Kas korter on suur?',
        '— Ei ole, ainult kaks tuba. Aga köök on suur ja seal on palju valgust.', '— Mis korrusel sa elad?', '— Neljandal. Lifti kahjuks ei ole.',
        '— Oi! Kas sul on rõdu?', '— Jah, väike rõdu jõe poole. Hommikul joon seal kohvi.', '— Kui kaugel on sinu töö?',
        '— Tööle sõidan rattaga, see võtab viisteist minutit.', '— Ja pood?', '— Pood on kohe maja kõrval. Apteek on kahjuks kaugel, kesklinnas.',
        '— Kas naabrid on toredad?', '— Jah, all elab vana proua. Ta tõi mulle eile kooki.', '— Kas mööbel on juba olemas?', '— Voodi ja laud on olemas, diivanit veel ei ole.', '— Millal ma saan külla tulla?', '— Tule reedel õhtul. Ma teen sooja toitu.', '— Mida ma kaasa võtan?', '— Võta kaasa head tuju ja natuke leiba!',
      ], ['Jaan elab nüüd [Supilinnas].', 'Korteris on [kaks|2] tuba.', 'Korter on [neljandal] korrusel.', 'Rõdu on [jõe] poole.', 'Tööle sõidab Jaan [rattaga].', 'Sõber tuleb külla [reedel|reede õhtul].']),
      B.table('015_p_cases', 'Keeleosa. Kaheksa vormi.', 'Kirjuta puuduv vorm.', 'Kus?, Kuhu?, Kust?', [
        'poes | [poodi] | [poest]', '[tööl] | tööle | [töölt]', '[apteegis] | [apteeki] | apteegist', 'kodus | [koju] | [kodust]',
      ]),
      B.wordforms('015_p_forms', 'Keeleosa. Kus, kuhu või kust?', 'Kirjuta sõna küsimuse järgi.', [
        ['sadam', 'kuhu?', 'sadamasse'], ['park', 'kus?', 'pargis'], ['turg', 'kust?', 'turult'], ['raamatukogu', 'kuhu?', 'raamatukokku'], ['saun', 'kus?', 'saunas'], ['rõdu', 'kuhu?', 'rõdule'], ['jaam', 'kust?', 'jaamast'], ['maja', 'kus?', 'majas'],
      ]),
      B.errorfix('015_p_fix', 'Keeleosa. Leia viga.', 'Kirjuta lause õigesti.', [
        ['Ma lähen kodus.', 'Ma lähen koju.'], ['Raamat on riiulile.', 'Raamat on riiulil.'], ['Ta tuleb poodi.', 'Ta tuleb poest.'], ['Mine otse ja pööra parem.', 'Mine otse ja pööra paremale.'], ['Me elame Tartu.', 'Me elame Tartus.'],
      ]),
      B.speaking('015_p_retell', 'Räägi kuuldust.', 'Mida sa linnapäeval teeksid? Räägi paarilisele.', ['Kuhu sa läheksid kõigepealt?', 'Mida sa seal teeksid?', 'Kuidas sa kesklinna tuleksid?'], [45, 75], ['Kõigepealt läheksin…', 'Siis…', 'Ma tuleksin…, sest…']),
      B.selfcheck('015_p_self', ['Lugemine: valin olukorda sobiva viisaka lause.', 'Lugemine: leian kuulutusest ja sildilt vajaliku info.', 'Lugemine: valin kirja lünka õige kohavormi.', 'Kuulamine: kirjutan vastuse 1–2 sõnaga.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('015_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('015_t_card', 'Visiitkaart', ['Kolimisfirma „Kiire Kast”', 'Kolime kodusid ja kontoreid üle Eesti', 'Aadress: Tähe 12, Tartu', 'Avatud: E–L 8–18', 'Telefon: 5600 1234'], 'full', 'g_read'),
      // writing 1: information transfer (what, where, when, contact), at least 25 words
      B.letter('015_t_info', 'Kirjutamine 1. Soovita kolimisfirmat.', 'Sõber kolib. Kirjuta visiitkaardi põhjal: mis firma, kus, millal avatud, kontakt.', 'Tere, Mart! Sa kolid varsti.', 'Edu kolimisel!', [25, 40]),
      B.planning('015_t_plan', 'Enne kutset.', 'Mõtle läbi ja kirjuta märksõnad.', ['Kuhu sa kutsud?', 'Millal?', 'Kuidas sinu juurde tulla?', 'Mida te teete?']),
      // writing 2: an invitation, at least 30 words
      B.letter('015_t_letter', 'Kirjutamine 2. Kutse uude koju.', 'Kutsu sõber uude koju: millal, kuidas tulla, mida teete.', 'Tere!', 'Kohtumiseni!', [30, 50]),
      B.writing('015_tx_plan', 'Kirjutamine 2 (teine valik). Minu kodukoht.', 'Kirjuta 4–6 lauset: kus elad, mis on lähedal, mis sulle meeldib.', [4, 6], ['elan', 'lähedal', 'sest'], 2),
      B.table('015_t_form', 'Täida kolimisteade.', 'Sa kolid. Täida majahalduri ankeet.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Vana aadress | ', 'Uus korter (number, korrus) | ', 'Kolimise kuupäev | ', 'Kellega koos kolid? | ']),
      B.rubric('015_t_rubric', 'Kontrolli kirjutamist.', 'Märgi, mis on olemas.', ['Kirjutamine 1: mis firma, kus, millal, kontakt — vähemalt 25 sõna.', 'Kirjutamine 2: aeg, tee sinu koju, ühine tegevus — 30–50 sõna.', 'Vähemalt 2 kus-, 1 kuhu- ja 1 kust-vorm.', 'Laused on seotud: ja, aga, sest.', 'Rääkimises vastasin igale küsimusele kahe lausega.']),
      // speaking: getting to know, picture description (task 1), idea cards (task 2)
      B.speaking('015_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Kus sa elad?', 'Kas sa elad majas või korteris?', 'Mis on sinu kodu lähedal?', 'Kuidas sa tööle või kooli lähed?'], [45, 60]),
      B.speaking('015_tx_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab kummalegi erineva pildi: tuba või tänav. Kirjelda 1 minut.', ['Mis kohta pildil näed?', 'Mis kus asub?', 'Mida inimesed teevad?', 'Kas sulle meeldiks seal elada?'], [60, 90], ['Pildil on…', '… on … kõrval / ees / taga.', 'Inimesed…']),
      B.speaking('015_t_compare', 'Rääkimine 1. Võrdle pilte.', 'Võrdle oma pilti paarilise pildiga. Vasta õpetaja küsimustele.', ['Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kus sa tahaksid elada?', 'Miks?'], [60, 90]),
      B.rolecards('015_t_roles', 'Rääkimine 2. Ideekaart „Kodu”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel 5 küsimust märksõnade järgi: kodu suurus, toad, naabrid, mis on lähedal, unistuste kodu.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Kui suur on sinu kodu?', 'Mis on sinu kodu lähedal?', 'Milline on sinu unistuste kodu?'], ['Minu kodus on…', 'Kodu lähedal on…', 'Ma tahaksin elada…, sest…']),
      B.rolecards('015_t_city', 'Rääkimine 2. Ideekaart „Minu linn”.', 'Nüüd küsib B ja A vastab.',
        'Vasta igale küsimusele 2–3 lausega.', 'Küsi 5 küsimust märksõnade järgi: lemmikkoht, buss või ratas, poed, mida turistile näidata, mis puudub.',
        ['Minu lemmikkoht on…', 'Ma sõidan…', 'Turistile näitaksin…'], ['Mis on sinu lemmikkoht linnas?', 'Kuidas sa linnas liigud?', 'Mida linnas puudu on?']),
      B.selfcheck('015_t_self', ['Kirjutamine: kirjutan visiitkaardi põhjal 25–40 sõna.', 'Kirjutamine: kirjutan kutse 30–50 sõnaga.', 'Rääkimine: kirjeldan pilti 1 minut.', 'Rääkimine: küsin ja vastan ideekaardi järgi.'], 'Moodul 3 tehtud'),
    ],
  },
};
