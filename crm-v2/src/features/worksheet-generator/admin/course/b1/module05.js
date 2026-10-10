// B1 course (A2 → B1 roadmap), module 5 „Lihtminevik ja kogemused” (a2b1-021…025), stage A2+.
// Harjuta + Kasuta for the published Avasta sheets. Every past form is used at once in a story about a real or
// pictured event (roadmap: no form drilling on its own). Material from the KeeleSepp A2→B1 workbook, lessons 3–4
// (Eile, täna ja homme; Minu lugu: sündmused järjekorras — „Üks ootamatu hommik”, Mari's late morning).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2b1-module-05', course: 'b1', title: 'Lihtminevik ja kogemused', level: 'A2+' };

export const LESSONS = {
  'a2b1-021': {
    title: 'Lihtmineviku põhivormid',
    canDo: 'Ma moodustan sagedaste tegusõnade lihtmineviku vorme ja kasutan neid lühikeses jutustuses.',
    practice: [
      B.table('021_p_forms', 'Olevik → minevik.', 'Kirjuta lihtmineviku vorm.', 'olevik (ma), minevik (ma), eitus', [
        'töötan | [töötasin] | ei [töötanud]', 'vaatan | [vaatasin] | ei [vaadanud]', 'küsin | [küsisin] | ei [küsinud]', 'helistan | [helistasin] | ei [helistanud]', 'ostan | [ostsin] | ei [ostnud]', 'kohtun | [kohtusin] | ei [kohtunud]',
      ]),
      B.wordforms('021_p_person', 'Kes tegi?', 'Kirjuta vorm sulgudes oleva isiku jaoks.', [
        ['töötama', 'tema', 'töötas'], ['vaatama', 'meie', 'vaatasime'], ['küsima', 'sina', 'küsisid'], ['puhkama', 'nemad', 'puhkasid'], ['lõpetama', 'teie', 'lõpetasite'], ['alustama', 'mina', 'alustasin'],
      ]),
      B.match('021_p_answers', 'Küsimus ja vastus.', 'Ühenda küsimus ja sobiv vastus.', [
        ['Mida sa eile tegid?', 'Ma töötasin ja puhkasin.'], ['Kas sa helistasid emale?', 'Ei, ma ei helistanud.'], ['Kellega sa kohtusid?', 'Ma kohtusin vennaga.'],
        ['Mida te õhtul vaatasite?', 'Me vaatasime filmi.'], ['Kas nad ostsid piletid?', 'Jah, nad ostsid need veebist.'],
      ], 'full', 'g_use'),
      B.transformation('021_p_neg', 'Ütle eitavalt.', 'Kirjuta lause eitavas vormis.', [
        ['Ma töötasin eile.', 'eitus', 'Ma ei töötanud eile.'], ['Ta helistas mulle.', 'eitus', 'Ta ei helistanud mulle.'], ['Me ostsime leiba.', 'eitus', 'Me ei ostnud leiba.'],
        ['Nad vaatasid telerit.', 'eitus', 'Nad ei vaadanud telerit.'], ['Sa küsisid õigesti.', 'eitus', 'Sa ei küsinud õigesti.'],
      ]),
      B.truefalse('021_p_check', 'Kas vorm on õige?', 'Õige või vale?', [
        ['Eile ma töötasin kodus.', true], ['Ta ei helistas mulle.', false], ['Me kohtusime kohvikus.', true], ['Nad ostis uue auto.', false], ['Kas sa vaatasid filmi?', true],
      ], 'full'),
      B.speaking('021_p_yesterday', 'Mida sa eile tegid?', 'Vasta paarilisele täislausetega. Kasuta 6 erinevat tegusõna.', [
        'Mida sa hommikul tegid?', 'Kellega sa rääkisid või kohtusid?', 'Mida sa õhtul vaatasid või kuulasid?', 'Mida sa eile ei teinud?',
      ], [60, 90], ['Eile ma…', 'Ma ei…', 'Pärast seda ma…']),
      B.reading('021_px_read', 'Loe: Toomase laupäev.', 'Loe tekst ja vasta minevikus.', 'Laupäev, mis läks teisiti',
        'Eelmisel laupäeval ärkas Toomas juba kell seitse, kuigi ta tahtis kaua magada. Naaber puuris seina ja müra oli väga vali. Toomas tõusis üles, keetis kohvi ja vaatas aknast välja. Ilm oli ilus ja päike paistis. Ta otsustas minna rattaga mere äärde. Teel helistas ta sõbrale Andresele ja küsis, kas ta tahab kaasa tulla. Andres ütles, et tal on vaja korterit koristada, aga lubas tulla pärastlõunal. Mere ääres istus Toomas kohvikus ja luges ajalehte. Kell kaks saabus Andres ja nad jalutasid koos rannas. Õhtul ostsid nad poest kala ja grillisid Toomase rõdul. Toomas ütles hiljem, et see oli suve parim laupäev, kuigi see algas halvasti. Järgmisel päeval rääkis ta naabriga ja naaber vabandas müra pärast. Ta ütles, et remont lõppeb varsti.',
        [['Miks ärkas Toomas vara?', 'naaber puuris seina|müra oli vali'], ['Kuhu Toomas otsustas minna?', 'rattaga mere äärde|mere äärde'], ['Miks Andres kohe ei tulnud?', 'tal oli vaja korterit koristada'], ['Mida tegi Toomas kohvikus?', 'luges ajalehte'], ['Mida nad õhtul tegid?', 'grillisid kala rõdul|grillisid'], ['Kuidas Toomas päeva hindas?', 'suve parim laupäev']]),
      B.gaps('021_px_open', 'Ava sulud.', 'Kirjuta tegusõna lihtminevikus.', ['Eile ma [töötasin] (töötama) kodus.', 'Me [vaatasime] (vaatama) õhtul filmi.', 'Ta [helistas] (helistama) emale.', 'Sina [küsisid] (küsima) hea küsimuse.', 'Nad [ostsid] (ostma) uue auto.', 'Mina [lõpetasin] (lõpetama) töö kell viis.', 'Te [puhkasite] (puhkama) maal.', 'Me [kohtusime] (kohtuma) pargis.']),
      B.errorfix('021_px_fix', 'Paranda vorm.', 'Kirjuta lause õigesti.', [['Eile ma töötan kaua.', 'Eile ma töötasin kaua.'], ['Me ei vaatasime filmi.', 'Me ei vaadanud filmi.'], ['Ta helistasin mulle.', 'Ta helistas mulle.'], ['Nad ostis leiba.', 'Nad ostsid leiba.'], ['Kas sa küsis õpetajalt?', 'Kas sa küsisid õpetajalt?']]),
      B.translation('021_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера я работал дома.', 'Мы смотрели фильм.', 'Она не звонила мне.', 'Что ты делал в субботу?', 'Мы встретились в кафе.']),
      B.dictation('021_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eile ma töötasin kaua.', 'Õhtul vaatasime filmi.', 'Ta ei helistanud mulle.', 'Me kohtusime pargis.', 'Nad ostsid uue auto.', 'Ma lõpetasin töö kell viis.']),
      B.writing('021_px_write', 'Minu eilne päev.', 'Kirjuta 8–10 lauset eilsest päevast. Kasuta 8 tegusõna minevikus.', [8, 10], ['töötasin', 'kohtusin', 'vaatasin', 'ei'], 3),
      B.selfcheck('021_p_self', ['Ma moodustan -si- mineviku.', 'Ma kasutan eitust: ei + nud.', 'Ma vastan küsimusele minevikus.', 'Ma räägin eilsest 6 tegusõnaga.'], 'Minevik on käes'),
    ],
    transfer: [
      B.reading('021_t_diary', 'Loe päevikut.', 'Loe Anni päevikut ja vasta küsimustele.', 'Anni päevik, reede',
        'Täna oli pikk päev. Hommikul töötasin kodus, sest meie kontoris remonditi kööki. Kõigepealt vastasin kirjadele ja helistasin kahele kliendile. Kell kümme alustasin uut projekti. Lõuna ajal kohtusin sõbranna Piiaga. Me sõime suppi väikeses kohvikus ja rääkisime tema uuest tööst. Pärastlõunal õppisin kaks tundi hispaania keelt, sest suvel tahan Hispaaniasse sõita. Õhtul ostsin poest köögivilju ja tegin salatit. Ma ei vaadanud telerit, vaid kuulasin raadiot. Kell üksteist lõpetasin päeva ja läksin magama. Olin väsinud, aga rahul. Ainult üks asi jäi tegemata: ma ei helistanud emale, kuigi lubasin. Ema saatis mulle õhtul sõnumi ja küsis, kas kõik on korras. Vastasin talle lühidalt ja lubasin homme hommikul kindlasti helistada. Homme on laupäev ja mul on rohkem aega. Tahan emaga pikalt rääkida, sest me ei ole terve nädala kohtunud.',
        [['Miks Anni kodus töötas?', 'kontoris remonditi kööki|kontoris oli remont'], ['Mida ta tegi kõigepealt?', 'vastas kirjadele'], ['Kellega ta lõuna ajal kohtus?', 'Piiaga|sõbrannaga'], ['Miks ta hispaania keelt õppis?', 'suvel tahab Hispaaniasse sõita'], ['Mida Anni õhtul ei teinud?', 'ei vaadanud telerit']]),
      B.text('021_t_situation', 'Uus olukord', 'Sinu sõber oli nädala haige ja küsib, mida sa eile tegid. Kirjuta talle pikk sõnum.'),
      B.planning('021_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad.', ['Mida tegid hommikul?', 'Kellega kohtusid?', 'Mida tegid õhtul?', 'Mida sa ei jõudnud teha?']),
      B.writing('021_t_write', 'Sõnum sõbrale.', 'Kirjuta 6–8 lauset eilsest päevast. Kasuta ka eitust.', [6, 8], ['kõigepealt', 'siis', 'ei', 'pärast'], 3),
      B.rolecards('021_t_roles', 'Intervjuu.', 'Üks on ajakirjanik, teine kuulus inimene. Rääkige 2 minutit.',
        'Oled ajakirjanik. Küsi 6 küsimust: mida inimene eile tegi.', 'Oled kuulus inimene. Räägi oma eilsest päevast. Lisa üks naljakas detail.',
        ['Mida te hommikul tegite?', 'Kellega te kohtusite?', 'Kas te puhkasite ka?'], ['Hommikul ma…', 'Siis ma…', 'Ma ei…']),
      B.gaps('021_tx_q', 'Küsimused minevikus.', 'Kirjuta küsimus minevikus.', ['Mida sa eile [tegid] (tegema)?', 'Kellega sa [kohtusid] (kohtuma)?', 'Kas sa [helistasid] (helistama) emale?', 'Mida te õhtul [vaatasite] (vaatama)?', 'Kus nad [puhkasid] (puhkama)?']),
      B.speaking('021_tx_week', 'Kolleegi intervjuu.', 'Küsi kolleegilt 1–2 minutit tema eilse päeva kohta.', ['Mida sa eile tegid?', 'Kellega kohtusid?', 'Mis oli kõige toredam?'], [60, 120]),
      B.translation('021_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера я встретил старого друга.', 'Мы долго разговаривали.', 'Я не смотрел телевизор.', 'Вечером я читал книгу.', 'Что ты делала вчера?']),
      B.writing('021_tx_diary', 'Minu päevik.', 'Kirjuta päevikusse 8–10 lauset tänasest või eilsest päevast.', [8, 10], ['hommikul', 'siis', 'ei', 'õhtul'], 3),
      B.selfcheck('021_t_self', ['Ma mõistan päevikut minevikus.', 'Ma kirjutan eilsest 6–8 lauset.', 'Ma küsin ja vastan minevikus.', 'Ma kasutan eitust õigesti.'], 'Jutustan eilsest'),
    ],
  },

  'a2b1-022': {
    title: 'Eile ja eelmisel nädalal',
    canDo: 'Ma jutustan 8–10 lausega eilsest või eelmisest nädalast ja kasutan vähemalt nelja ajamarkerit.',
    practice: [
      B.categorize('022_p_time', 'Mis aeg see on?', 'Sorteeri ajamarkerid.', [
        ['Minevik', ['eile', 'üleeile', 'eelmisel nädalal', 'möödunud suvel', 'kaks päeva tagasi']], ['Olevik', ['täna', 'praegu', 'sel nädalal']], ['Tulevik', ['homme', 'järgmisel nädalal', 'ülehomme']],
      ]),
      B.diagram('022_p_line', 'timeline', { title: 'Minu eelmine nädal.', instruction: 'Kirjuta tegusõna lihtminevikus.', nodes: 'esmaspäeval | [töötasin] kaua\nkolmapäeval | [käisin] trennis\nreedel | [kohtusin] sõpradega\nlaupäeval | [puhkasin] maal\npühapäeval | [koristasin] kodu' }),
      B.gaps('022_p_order', 'Järjekord.', 'Vali sobiv sõna. Iga sõna üks kord.', [
        'Eile [hommikul] ärkasin kell seitse.', '[Kõigepealt] jõin kohvi.', '[Siis] sõitsin bussiga tööle.', '[Pärast seda] oli mul koosolek.', '[Lõuna ajal] sõin kolleegidega.', '[Lõpuks] tulin koju ja puhkasin.',
      ], ['hommikul', 'kõigepealt', 'siis', 'pärast seda', 'lõuna ajal', 'lõpuks', 'homme', 'praegu']),
      B.wordorder('022_p_words', 'Ajamarker lause alguses.', 'Pane lause kokku. Alusta ajamarkeriga.', [
        'Eelmisel nädalal käisin ma vanaema juures.', 'Eile õhtul vaatasime me filmi.', 'Üleeile kohtusin ma vana sõbraga.', 'Möödunud suvel puhkasime me Saaremaal.', 'Kaks päeva tagasi ostsin ma uued kingad.',
      ]),
      B.choice('022_p_logic', 'Mis on loogiline?', 'Vali sobiv jätk.', [
        ['Eile hommikul ärkasin hilja, …', 'seega jäin bussist maha.', 'seega olin väga vara tööl.', 'homme lähen poodi.'],
        ['Eelmisel nädalal olin haige, …', 'seepärast ei käinud ma tööl.', 'seepärast jooksin maratoni.', 'ja homme on reede.'],
        ['Kõigepealt ostsin piletid, …', 'siis läksin kinno.', 'siis ostsin piletid.', 'eile on ilus ilm.'],
        ['Laupäeval sadas vihma, …', 'nii et jäime koju.', 'nii et päevitasime rannas.', 'nii et homme sajab.'],
        ['Pärast koosolekut …', 'sõin kolleegidega lõunat.', 'algas koosolek.', 'ärkasin hommikul.'],
      ], 'full', 'g_use'),
      B.speaking('022_p_week', 'Minu eelmine nädal.', 'Räägi 8–10 lausega. Kasuta 4 ajamarkerit.', [
        'Mida tegid esmaspäeval?', 'Mis oli nädala tähtsaim sündmus?', 'Kellega kohtusid?', 'Mida tegid nädalavahetusel?',
      ], [60, 120], ['Esmaspäeval…', 'Pärast seda…', 'Nädalavahetusel…', 'Lõpuks…']),
      B.reading('022_px_read', 'Loe: eelmine nädal.', 'Loe ja vasta.', 'Liisi kiire nädal',
        'Eelmine nädal oli Liisi jaoks väga kiire. Esmaspäeval alustas ta uut projekti ja töötas hilja õhtuni. Teisipäeval käis ta pärast tööd hambaarsti juures, sest hammas valutas juba mitu päeva. Kolmapäeval oli tal vaba õhtu ja ta kohtus vana koolisõbraga kohvikus. Nad rääkisid kaks tundi ja naersid palju. Neljapäeval sadas terve päeva vihma ja Liisi jäi pärast tööd koju. Ta luges raamatut ja tegi suppi. Reedel läks ta kolleegidega kinno ja pärast seda sõid nad pitsat. Laupäeval sõitis ta vanematele külla maale. Pühapäeval puhkas ta lõpuks terve päeva ja valmistus uueks nädalaks. Õhtul kirjutas ta oma päevikusse, et nädal oli raske, aga huvitav. Ta otsustas, et järgmine nädal läheb rahulikumalt. Ta lubas endale, et läheb igal õhtul varem magama ja ei tööta enam nii hilja.',
        [['Mida tegi Liisi esmaspäeval?', 'alustas uut projekti|töötas hilja õhtuni'], ['Miks läks ta hambaarsti juurde?', 'hammas valutas'], ['Kellega kohtus ta kolmapäeval?', 'vana koolisõbraga'], ['Mida tegi ta neljapäeval?', 'jäi koju, luges ja tegi suppi'], ['Kuhu sõitis ta laupäeval?', 'vanematele külla maale|maale'], ['Mida tegi ta pühapäeval?', 'puhkas']]),
      B.table('022_px_week', 'Minu eelmine nädal.', 'Kirjuta igale päevale üks tegevus minevikus.', 'päev, mida ma tegin', ['esmaspäeval | ', 'teisipäeval | ', 'kolmapäeval | ', 'neljapäeval | ', 'reedel | ', 'nädalavahetusel | ']),
      B.transformation('022_px_past', 'Muuda minevikku.', 'Kirjuta lause minevikus antud sõnaga.', [['Ma lähen poodi.', 'eile', 'Eile läksin ma poodi.'], ['Me kohtume sõpradega.', 'eelmisel nädalal', 'Eelmisel nädalal kohtusime me sõpradega.'], ['Ta töötab kodus.', 'üleeile', 'Üleeile töötas ta kodus.'], ['Nad sõidavad maale.', 'möödunud suvel', 'Möödunud suvel sõitsid nad maale.'], ['Ma ei käi trennis.', 'eile', 'Eile ma ei käinud trennis.']]),
      B.translation('022_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['На прошлой неделе я был в Таллинне.', 'Позавчера мы ходили в театр.', 'Сначала мы поели, потом гуляли.', 'В конце концов я пошёл домой.', 'Прошлым летом мы отдыхали на море.']),
      B.dictation('022_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eelmisel nädalal oli mul kiire.', 'Esmaspäeval töötasin hilja.', 'Kolmapäeval kohtusin sõbraga.', 'Reedel läksime kinno.', 'Pühapäeval puhkasin.']),
      B.writing('022_px_write', 'Minu eelmine nädalavahetus.', 'Kirjuta 8–10 lauset. Kasuta vähemalt 5 ajamarkerit.', [8, 10], ['laupäeval', 'kõigepealt', 'siis', 'pärast seda', 'lõpuks'], 3),
      B.selfcheck('022_p_self', ['Ma eristan mineviku, oleviku ja tuleviku markereid.', 'Ma panen sündmused järjekorda.', 'Ma alustan lauset ajamarkeriga.', 'Ma räägin nädalast 8–10 lausega.'], 'Nädal jutustatud'),
    ],
    transfer: [
      B.listening('022_t_listen', 'Kuula Mardi lugu.', 'Õpetaja loeb loo kaks korda. Täida lüngad.', [
        'Eelmisel nädalal oli mul väga kiire.', 'Esmaspäeval ja teisipäeval töötasin hilja õhtuni.', 'Kolmapäeval käisin hambaarsti juures.', 'Reedel kohtusin vanade koolisõpradega restoranis.', 'Laupäeval sõitsime perega maale ja pühapäeval puhkasin terve päeva.',
      ], ['Esmaspäeval ja teisipäeval töötas ta [hilja õhtuni|õhtuni].', 'Kolmapäeval käis ta [hambaarsti] juures.', 'Reedel kohtus ta [koolisõpradega|sõpradega].', 'Laupäeval sõitis pere [maale].', 'Pühapäeval ta [puhkas].']),
      B.text('022_t_situation', 'Uus olukord', 'Sa tuled tööle pärast puhkust. Kolleeg küsib, kuidas puhkus läks.'),
      B.rolecards('022_t_roles', 'Kolleegid köögis.', 'Rääkige 2–3 minutit. Seejärel vahetage.',
        'Sa olid nädal puhkusel. Räägi, mida tegid päevade kaupa. Lisa üks probleem.', 'Sa olid tööl. Küsi puhkuse kohta. Räägi, mis tööl vahepeal juhtus.',
        ['Esmaspäeval me…', 'Kahjuks…', 'Lõpuks…'], ['Kuidas puhkus läks?', 'Mida te seal tegite?', 'Tööl juhtus…']),
      B.letter('022_t_mail', 'E-kiri sõbrale.', 'Kirjuta oma eelmisest nädalast. 70–90 sõna. Kasuta 4 ajamarkerit.', 'Tere, Kristi!', 'Kirjuta ka endast!', [70, 90]),
      B.speaking('022_t_best', 'Nädala parim hetk.', 'Räägi 1 minut: mis oli eelmise nädala parim hetk ja miks.', [
        'Millal see juhtus?', 'Kus sa olid?', 'Kellega?', 'Miks see oli parim?',
      ], [60, 90]),
      B.reading('022_tx_read', 'Loe kirja.', 'Loe sõbra kirja ja vasta.', 'Kiri Pärnust',
        'Tere, Kati! Eelmisel nädalal olime perega puhkusel Pärnus. Esmaspäeval sõitsime bussiga kohale ja otsisime üles meie väikese hotelli. Teisipäeval ja kolmapäeval oli ilm väga ilus ja me olime terve päeva rannas. Lapsed ujusid ja ehitasid liivalosse. Neljapäeval sadas vihma, seepärast käisime muuseumis ja veekeskuses. Reedel rentisime jalgrattad ja sõitsime mööda mereäärt. Õhtuti sõime erinevates restoranides. Kõige rohkem meeldis mulle kalasupp sadamakohvikus. Laupäeval tulime koju väsinud, aga õnnelikena. Kõige naljakam oli see, kui meie poeg kukkus jalgrattaga lompi. Ta oli märg, aga naeris kõige rohkem. Me pidime talle poest uued riided ostma. Järgmisel aastal tahame kindlasti uuesti Pärnusse minna, võib-olla isegi kaheks nädalaks. Lapsed küsivad juba praegu, millal me jälle randa läheme. Ka mina ootan seda väga. Kuidas sinu nädal läks? Kirjuta mulle! Sinu Maria',
        [['Kus Maria pere puhkas?', 'Pärnus'], ['Mida tegid lapsed rannas?', 'ujusid ja ehitasid liivalosse'], ['Miks käisid nad neljapäeval muuseumis?', 'sadas vihma'], ['Mida tegid nad reedel?', 'rentisid rattad ja sõitsid mööda mereäärt'], ['Mis meeldis Mariale kõige rohkem?', 'kalasupp sadamakohvikus|kalasupp']]),
      B.translation('022_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мы вернулись домой в субботу.', 'Погода была хорошая.', 'Мы каждый день купались.', 'Мне больше всего понравился музей.', 'Как прошла твоя неделя?']),
      B.writing('022_tx_reply', 'Vasta Mariale.', 'Kirjuta Mariale 8–10 lauset oma eelmisest nädalast.', [8, 10], ['eelmisel nädalal', 'esmaspäeval', 'pärast seda', 'lõpuks'], 3),
      B.selfcheck('022_t_self', ['Ma mõistan kuulatud lugu.', 'Ma räägin puhkusest päevade kaupa.', 'Ma kirjutan e-kirja 70–90 sõnaga.', 'Ma põhjendan, miks hetk oli parim.'], 'Nädal on kirjas'),
    ],
  },

  'a2b1-023': {
    title: 'I-lihtminevik ja sagedased erandid',
    canDo: 'Ma kasutan vähemalt 8 sagedast erandlikku lihtmineviku vormi õigesti.',
    practice: [
      B.match('023_p_pairs', 'Algvorm ja minevik.', 'Ühenda ma-tegevusnimi ja tema minevik.', [
        ['tulema', 'tuli'], ['minema', 'läks'], ['tegema', 'tegi'], ['nägema', 'nägi'], ['sööma', 'sõi'], ['jooma', 'jõi'], ['olema', 'oli'], ['saama', 'sai'],
      ], 'half'),
      B.crossword('023_p_cross', 'Mineviku ristsõna.', 'Kirjuta tema-vorm minevikus.', [
        ['minema (tema)', 'läks'], ['tooma (tema)', 'tõi'], ['viima (tema)', 'viis'], ['jääma (tema)', 'jäi'], ['saama (tema)', 'sai'],
      ]),
      B.gaps('023_p_story', 'Ava sulud.', 'Kirjuta tegusõna lihtminevikus.', [
        'Eile [tuli] (tulema) mu sõber külla.', 'Me [läksime] (minema) koos turule.', 'Seal me [nägime] (nägema) vana klassivenda.', 'Ta [tegi] (tegema) meile kohvi.', 'Me [sõime] (sööma) kooki ja [jõime] (jooma) mahla.', 'Õhtu [oli] (olema) väga tore.',
      ]),
      B.errorfix('023_p_fix', 'Paranda vorm.', 'Igas lauses on üks vale vorm.', [
        ['Eile ma minesin tööle.', 'Eile ma läksin tööle.'], ['Ta tulis koju hilja.', 'Ta tuli koju hilja.'], ['Me söösime pitsat.', 'Me sõime pitsat.'], ['Nad nägisid filmi.', 'Nad nägid filmi.'], ['Ma tegesin kodutööd.', 'Ma tegin kodutööd.'],
      ]),
      B.dictation('023_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', [
        'Eile tuli mu vend külla.', 'Me läksime kinno.', 'Ta sõi popkorni ja jõi limonaadi.', 'Film oli väga põnev.', 'Pärast seda jäi ta meie juurde ööseks.',
      ]),
      B.speaking('023_p_chain', 'Ketilugu.', 'Grupis: igaüks lisab loole ühe lause erandvormiga.', [
        'Algus: „Eile läks Mari metsa…”', 'Mida ta nägi?', 'Mida ta tegi?', 'Kes tuli?', 'Kuidas lugu lõppes?',
      ], [60, 120], ['läks', 'nägi', 'tegi', 'tuli', 'sai', 'jäi', 'oli']),
      B.reading('023_px_read', 'Loe: sünnipäev.', 'Loe ja leia erandvormid.', 'Ema sünnipäev',
        'Eelmisel pühapäeval oli minu ema sünnipäev. Hommikul tuli minu õde Tallinnast ja tõi kaasa suure kooki. Isa läks poodi ja ostis lilli. Mina tegin salatit ja vend tegi pilte. Kella kahe paiku tulid ka vanaema ja vanaisa. Me sõime kooki, jõime kohvi ja rääkisime palju. Ema sai kingituseks uue raamatu ja kaks teatripiletit. Ta oli väga õnnelik. Õhtul läksid vanavanemad koju, aga õde jäi meie juurde ööseks. Me nägime koos vanu pere fotosid ja naersime. Ühel pildil oli ema viieaastane ja tal oli suur punane müts. See oli väga tore päev ja ema ütles, et see oli tema parim sünnipäev. Järgmisel päeval läksid ema ja isa koos teatrisse. Neile meeldis etendus väga. Pärast teatrit jalutasid nad vanalinnas ja jõid kohvikus kakaod.',
        [['Kes tuli Tallinnast?', 'õde|minu õde'], ['Mida tõi õde kaasa?', 'suure koogi|kooki'], ['Mida tegi isa?', 'läks poodi ja ostis lilli'], ['Mis kingitused ema sai?', 'raamatu ja teatripiletid'], ['Kes jäi ööseks?', 'õde'], ['Mida nad õhtul vaatasid?', 'vanu fotosid']]),
      B.wordforms('023_px_forms', 'Ma-vorm minevikus.', 'Kirjuta mina-vorm lihtminevikus.', [['tulema', 'mina', 'tulin'], ['minema', 'mina', 'läksin'], ['tegema', 'mina', 'tegin'], ['nägema', 'mina', 'nägin'], ['sööma', 'mina', 'sõin'], ['jooma', 'mina', 'jõin'], ['olema', 'mina', 'olin'], ['saama', 'mina', 'sain']]),
      B.wordforms('023_px_neg', 'Eitus minevikus.', 'Kirjuta eitav vorm.', [['tulema', 'ei …', 'ei tulnud'], ['minema', 'ei …', 'ei läinud'], ['tegema', 'ei …', 'ei teinud'], ['nägema', 'ei …', 'ei näinud'], ['sööma', 'ei …', 'ei söönud'], ['jooma', 'ei …', 'ei joonud']]),
      B.translation('023_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера ко мне пришёл друг.', 'Мы пошли в кино.', 'Я ничего не ел утром.', 'Что ты видел в музее?', 'Она получила подарок.']),
      B.writing('023_px_write', 'Minu viimane pidu.', 'Kirjuta 8–10 lauset viimasest peost või sünnipäevast. Kasuta 6 erandvormi.', [8, 10], ['tuli', 'läksime', 'sõime', 'jõime', 'oli'], 3),
      B.dictation('023_px_dict2', 'Etteütlus 2.', 'Kuula ja kirjuta.', ['Õde tuli Tallinnast.', 'Isa läks poodi.', 'Me sõime kooki.', 'Ema sai raamatu.']),
      B.selfcheck('023_p_self', ['Ma tean 10 erandvormi.', 'Ma kasutan neid loos.', 'Ma parandan valed vormid.', 'Ma kirjutan kuulatud laused.'], 'Erandid ei hirmuta'),
    ],
    transfer: [
      B.text('023_t_situation', 'Uus olukord', 'Sinu linnas oli eelmisel laupäeval suur festival. Kohalik ajaleht kogub inimeste muljeid.'),
      B.reading('023_t_news', 'Loe muljeid.', 'Loe ja vasta küsimustele.', 'Festivalil käisid tuhanded',
        'Eelmisel laupäeval oli Tartus toidufestival. Hommikul tuli kesklinna palju inimesi. Marta läks festivalile koos lastega. „Lapsed nägid esimest korda tänavakunstnikke ja said näomaalingud,” rääkis ta. Jaan tegi festivalil vabatahtlikuna tööd. Ta tõi müüjatele vett ja viis prügi ära. „Ma sõin kolm erinevat suppi ja jõin kohalikku õunamahla,” naeris ta. Õhtul tuli kerge vihm, aga keegi ei läinud koju. Kontsert algas kell kaheksa ja lõppes alles keskööl. Korraldajad ütlesid, et festival oli edukam kui eelmisel aastal. Kokku käis festivalil umbes kakskümmend tuhat inimest. Kõige pikem järjekord oli Kihnu kalasupi juures. Mõned külastajad ootasid seal peaaegu tund aega. Pühapäeva hommikul koristasid vabatahtlikud kesklinna ja kella kümneks oli kõik jälle puhas. Järgmine festival toimub juba järgmise aasta mais. Marta ütles, et tuleb kindlasti jälle, sest lastele meeldis väga.',
        [['Mis festival see oli?', 'toidufestival'], ['Mida said Marta lapsed?', 'näomaalingud'], ['Mida Jaan tegi?', 'oli vabatahtlik|tõi vett ja viis prügi ära'], ['Mida Jaan sõi ja jõi?', 'suppi ja õunamahla'], ['Kas inimesed läksid vihma tõttu koju?', 'ei']]),
      B.choice('023_t_quiz', 'Kiire kontroll.', 'Vali õige vorm.', [
        ['Eile ma … kinos.', 'käisin', 'käin', 'käis'], ['Ta … mulle kingituse.', 'tõi', 'toob', 'toi'], ['Me … liiga palju kooki.', 'sõime', 'söime', 'söösime'],
        ['Nad … koju hilja.', 'jäid', 'jääsid', 'jäi'], ['Kas sa … teda?', 'nägid', 'näggid', 'nägesid'],
      ], 'full', 'g_use'),
      B.writing('023_t_write', 'Sinu mulje ajalehele.', 'Kirjuta 6–8 lauset ühest üritusest, kus käisid. Kasuta 5 erandvormi.', [6, 8], ['läksin', 'nägin', 'sõin', 'jõin', 'oli'], 4),
      B.rolecards('023_t_roles', 'Reporter tänaval.', 'Rääkige 2 minutit.',
        'Oled reporter. Küsi, kus inimene käis, mida nägi, sõi ja tegi.', 'Käisid nädalavahetusel üritusel. Vasta ja lisa üks üllatav detail.',
        ['Kus te käisite?', 'Mida te seal nägite?', 'Mis teile kõige rohkem meeldis?'], ['Ma läksin…', 'Ma nägin…', 'Kõige rohkem meeldis…']),
      B.gaps('023_tx_story', 'Lõpeta lugu.', 'Kirjuta tegusõna minevikus.', ['Eile [läksin] (minema) ma linna.', 'Seal [nägin] (nägema) vana sõpra.', 'Me [jõime] (jooma) koos kohvi.', 'Ta [tõi] (tooma) mulle kingituse.', 'Ma [sain] (saama) väga rõõmsaks.', 'Õhtul [jäin] (jääma) koju.']),
      B.speaking('023_tx_story2', 'Minu üritus.', 'Räägi 1–2 minutit üritusest, kus sa käisid.', ['Kus sa käisid?', 'Mida sa nägid?', 'Mida sõid ja jõid?'], [60, 120]),
      B.translation('023_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мы пошли на концерт.', 'Я видел много людей.', 'Мы ели мороженое.', 'Он не пришёл.', 'Вечер был отличный.']),
      B.writing('023_tx_post', 'Postitus.', 'Kirjuta 8–10 lauset postitus üritusest, kus käisid.', [8, 10], ['läksin', 'nägin', 'sõin', 'oli'], 3),
      B.selfcheck('023_t_self', ['Ma mõistan uudisteksti minevikus.', 'Ma kirjutan oma mulje.', 'Ma vastan reporteri küsimustele.', 'Ma kasutan erandvorme kõnes.'], 'Mulje on kirjas'),
    ],
  },

  'a2b1-024': {
    title: 'Lugu piltide järgi',
    canDo: 'Ma jutustan 2–3 minutit järjestatud sündmustest ja kasutan lihtminevikku ning vähemalt nelja siduvat ajamarkerit.',
    practice: [
      B.diagram('024_p_flow', 'flow', { title: 'Mari hiline hommik.', instruction: 'Kirjuta puuduv sidesõna.', nodes: '[Alguses] ärkas Mari pool tundi hiljem.\n[Kõigepealt] otsis ta telefoni.\n[Siis] märkas ta seda köögilaual.\n[Pärast seda] läks ta bussipeatusse.\n[Lõpuks] jõudis ta tööle.' }),
      B.gaps('024_p_open', 'Ava sulud.', 'Kirjuta tegusõna lihtminevikus.', [
        'Eile [ärkasin] (ärkama) ma tavalisest hiljem.', 'Bussipeatuses [märkasin] (märkama) ma, et rahakott puudub.', 'Ma [helistasin] (helistama) kohe vennale.', 'Vend [leidis] (leidma) rahakoti köögist.', 'Ta [tõi] (tooma) selle mulle kümne minutiga.', 'Pärast seda [jõudsin] (jõudma) ma tööle.',
      ]),
      B.errorfix('024_p_fix', 'Leia vale vorm.', 'Kirjuta lause õigesti.', [
        ['Eile ma kaotan rahakoti.', 'Eile ma kaotasin rahakoti.'], ['Kahjuks ta ei helistas mulle.', 'Kahjuks ta ei helistanud mulle.'], ['Seejärel me leidis pileti.', 'Seejärel me leidsime pileti.'],
        ['Lõpuks ma jõudis tööle.', 'Lõpuks ma jõudsin tööle.'], ['Pärast seda nad otsustasin koju minna.', 'Pärast seda nad otsustasid koju minna.'],
      ]),
      B.manymatch('024_p_feel', 'Tunded loos.', 'Mis tunne sobib? Mõni tunne sobib mitmele.', ['Buss sõitis ära.', 'Vend leidis rahakoti.', 'Jõudsin tööle hiljaks.', 'Koosolek algas hiljem.', 'Telefon oli kadunud.'], ['kurb', 'rõõmus', 'närviline', 'kergendunud']),
      B.wordorder('024_p_end', 'Loo lõpp.', 'Pane laused kokku.', [
        'Päeva lõpus otsustasin ma midagi muuta.', 'Nüüd kontrollin ma kotti juba kodus.', 'See kogemus õpetas mulle palju.', 'Õnneks lõppes kõik hästi.', 'Järgmisel päeval ärkasin ma õigel ajal.',
      ]),
      B.speaking('024_p_tell', 'Jutusta piltide järgi.', 'Õpetaja näitab pildiseeriat. Jutusta 2 minutit.', [
        'Kes on loo tegelane?', 'Mis juhtus alguses?', 'Mis oli probleem?', 'Kuidas tegelane tundis?', 'Kuidas lugu lõppes?',
      ], [90, 120], ['Alguses…', 'Äkki…', 'Õnneks…', 'Lõpuks…']),
      B.reading('024_px_read', 'Loe: kadunud võtmed.', 'Loe lugu ja pane sündmused järjekorda.', 'Võtmed külmkapis',
        'Möödunud reedel juhtus minuga midagi naljakat. Alguses oli kõik tavaline: ärkasin, sõin hommikust ja hakkasin tööle minema. Siis märkasin, et minu võtmed on kadunud. Kõigepealt otsisin neid jope taskust, aga seal neid ei olnud. Seejärel vaatasin koti läbi ja kontrollisin isegi diivani alt. Pool tundi otsisin ja olin juba väga närviline. Lõpuks helistasin tööle ja ütlesin, et jään hiljaks. Natuke hiljem tahtsin juua piima. Avasin külmkapi ja nägin, et võtmed olid seal piima kõrval! Ilmselt panin need sinna, kui eile õhtul toidu ära panin. Naersin kõva häälega ja läksin lõpuks tööle. Kolleegid naersid ka, kui ma neile lugu rääkisin. Nüüd panen võtmed alati ukse kõrval olevasse kaussi. Mu naine ostis selle kausi juba ammu, aga alles nüüd hakkasin seda kasutama.',
        [['Mis juhtus reedel?', 'võtmed kadusid|kaotas võtmed'], ['Kust otsis jutustaja kõigepealt?', 'jope taskust'], ['Kui kaua ta otsis?', 'pool tundi'], ['Kellele ta helistas?', 'tööle'], ['Kust võtmed leiti?', 'külmkapist|külmkapist piima kõrvalt'], ['Kuidas jutustaja reageeris?', 'naeris kõva häälega|naeris']]),
      B.wordorder('024_px_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Alguses oli kõik tavaline.', 'Siis märkasin, et võtmed on kadunud.', 'Pool tundi otsisin ma võtmeid.', 'Lõpuks leidsin need külmkapist.', 'Ma naersin kõva häälega.']),
      B.translation('024_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Сначала всё было хорошо.', 'Вдруг я заметил, что сумки нет.', 'К счастью, друг нашёл её.', 'В конце концов я пришёл домой.', 'Это был странный день.']),
      B.dictation('024_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Alguses oli kõik tavaline.', 'Siis märkasin, et võtmed on kadunud.', 'Ma otsisin pool tundi.', 'Lõpuks leidsin need külmkapist.', 'Ma naersin kõva häälega.']),
      B.writing('024_px_write', 'Minu naljakas lugu.', 'Kirjuta 8–10 lauset loost, mis juhtus sinuga. Kasuta 5 sidesõna.', [8, 10], ['alguses', 'siis', 'äkki', 'õnneks', 'lõpuks'], 3),
      B.selfcheck('024_p_self', ['Ma kasutan loos 4 sidesõna.', 'Ma moodustan lihtmineviku õigesti.', 'Ma lisan loole tunde.', 'Ma jutustan 2 minutit.'], 'Mul on lugu'),
    ],
    transfer: [
      B.reading('024_t_read', 'Loe lugu.', 'Loe kaks korda: kõigepealt mõte, siis detailid.', 'Üks ootamatu hommik',
        'Eelmisel teisipäeval ärkasin tavalisest varem, sest mul oli tööl tähtis koosolek. Alguses läks kõik hästi: sõin hommikust, jõin kohvi ja kontrollisin veel kord dokumente. Kell kaheksa panin jope selga ja läksin bussipeatusse. Äkki märkasin, et mu rahakott ei olnud kotis. Otsisin seda mitu minutit, aga ei leidnud. Kahjuks sõitis buss ära. Seejärel helistasin kodus olevale vennale ja palusin tal köögilauale ja riiulile vaadata. Õnneks leidis vend rahakoti just sealt. Ta tõi selle mulle kümne minutiga. Ma jõudsin tööle kakskümmend minutit hiljem. Helistasin kolleegile ja selgitasin olukorda. Koosolek algas õnneks veidi hiljem, nii et ma ei jäänud millestki olulisest ilma. Päeva lõpus otsustasin, et edaspidi kontrollin oma kotti juba kodus. See kogemus õpetas mulle, et tähtsad asjad tasub enne lahkumist üle vaadata.',
        [['Miks jutustaja varem ärkas?', 'tal oli tähtis koosolek|koosolek'], ['Mida ta bussipeatuses märkas?', 'rahakott ei olnud kotis|rahakott puudus'], ['Miks ta esimesest bussist maha jäi?', 'ta otsis rahakotti'], ['Kust vend rahakoti leidis?', 'köögilaualt'], ['Mida ta otsustas edaspidi teha?', 'kontrollida kotti kodus']]),
      B.text('024_t_situation', 'Uus olukord', 'Ajakiri korraldab konkurssi „Minu kõige ootamatum päev”. Parim lugu avaldatakse.'),
      B.planning('024_t_plan', 'Loo plaan.', 'Mõtle oma (või väljamõeldud) lugu läbi.', ['Alguses: kus, millal, kes?', 'Probleem: mis juhtus äkki?', 'Lahendus: kes aitas, mida tegid?', 'Lõpp: mida sa õppisid?']),
      B.writing('024_t_story', 'Kirjuta lugu.', 'Kirjuta 8–10 lauset. Kasuta sidesõnu ja tundeid.', [8, 10], ['alguses', 'äkki', 'õnneks', 'lõpuks'], 3),
      B.speaking('024_t_tell', 'Jutusta lugu.', 'Jutusta oma lugu 2–3 minutit ilma tekstita. Kuulajad esitavad 2 küsimust.', [
        'Mis juhtus?', 'Mida sa tundsid?', 'Kuidas probleem lahenes?', 'Mida sa õppisid?',
      ], [90, 120]),
      B.gaps('024_tx_link', 'Sidesõnad.', 'Vali sobiv sõna.', ['[Alguses] oli ilm ilus.', '[Äkki] hakkas sadama.', '[Õnneks] oli mul vihmavari.', '[Kahjuks] jäin bussist maha.', '[Lõpuks] jõudsin koju.'], ['alguses', 'äkki', 'õnneks', 'kahjuks', 'lõpuks']),
      B.translation('024_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вдруг пошёл дождь.', 'К сожалению, автобус уехал.', 'К счастью, друг меня подвёз.', 'Я опоздал на двадцать минут.', 'Этот опыт научил меня многому.']),
      B.writing('024_tx_story2', 'Teine lugu.', 'Kirjuta 8–10 lauset loo jätkust: mis juhtus järgmisel päeval?', [8, 10], ['järgmisel päeval', 'äkki', 'õnneks', 'lõpuks'], 3),
      B.translation('024_tx_tr2', 'Tõlgi veel.', 'Kirjuta eesti keeles.', ['Сначала я ничего не заметил.', 'Потом я позвонил брату.', 'Он быстро приехал.', 'Мы вместе посмеялись.', 'Всё закончилось хорошо.']),
      B.selfcheck('024_t_self', ['Ma mõistan lugu ja selle järjekorda.', 'Ma kirjutan oma loo 8–10 lausega.', 'Mul on algus, probleem ja lõpp.', 'Ma jutustan loo ilma tekstita.'], 'Jutustaja'),
    ],
  },

  'a2b1-025': {
    title: 'Kontroll 5 — lihtminevik',
    canDo: 'Ma moodustan sagedased minevikuvormid ja jutustan lõpetatud sündmusest selge ajaloogikaga.',
    practice: [
      B.tip('025_p_how', 'Kordamine', 'Tee kõik ilma abita. Märgi kahtlased vormid ja kontrolli neid moodulite 21–24 lehtedelt.', 'full'),
      B.table('025_p_15', '15 vormi.', 'Kirjuta ma-vorm lihtminevikus.', 'tegusõna, minevik (ma), tegusõna, minevik (ma)', [
        'tulema | [tulin] | töötama | [töötasin]', 'minema | [läksin] | helistama | [helistasin]', 'tegema | [tegin] | leidma | [leidsin]', 'nägema | [nägin] | jõudma | [jõudsin]', 'sööma | [sõin] | ostma | [ostsin]', 'olema | [olin] | | ',
      ]),
      B.transformation('025_p_past', 'Muuda minevikku.', 'Kirjuta lause lihtminevikus.', [
        ['Ma lähen tööle.', 'eile', 'Eile läksin ma tööle.'], ['Ta ei tule.', 'eile', 'Eile ta ei tulnud.'], ['Me sööme kala.', 'eile', 'Eile sõime me kala.'],
        ['Nad näevad filmi.', 'eile', 'Eile nägid nad filmi.'], ['Sa teed süüa.', 'eile', 'Eile tegid sa süüa.'],
      ]),
      B.choice('025_p_q', 'Ajaloogika.', 'Vali sobiv sidesõna.', [
        ['… ärkasin, siis jõin kohvi.', 'Kõigepealt', 'Lõpuks', 'Homme'], ['Buss sõitis ära. … tuli järgmine kümne minuti pärast.', 'Õnneks', 'Kahjuks', 'Eile'],
        ['Otsisin võtmeid kaua. … leidsin need taskust.', 'Lõpuks', 'Kõigepealt', 'Praegu'], ['Kõik oli hästi. … juhtus midagi ootamatut.', 'Äkki', 'Alguses', 'Täna'],
        ['Läksin poodi. … läksin koju.', 'Pärast seda', 'Enne seda', 'Alguses'],
      ], 'full', 'g_use'),
      B.categorize('025_p_sort', 'Milline minevikuvorm?', 'Sorteeri vormid.', [
        ['-si- minevik', ['töötasin', 'helistasin', 'küsisin', 'kohtusin']], ['i-minevik / erand', ['tuli', 'läks', 'sõi', 'nägi']], ['eitus', ['ei tulnud', 'ei läinud', 'ei töötanud']],
      ]),
      B.speaking('025_p_tell', 'Pildilugu.', 'Jutusta pildiseeria järgi 2 minutit.', ['Mis juhtus alguses?', 'Mis oli probleem?', 'Kuidas see lahenes?'], [90, 120]),
      B.reading('025_px_read', 'Loe ja vasta.', 'Loe tekst. Vasta minevikus.', 'Esimene tööpäev',
        'Eelmisel esmaspäeval oli minu esimene tööpäev uues firmas. Ma ärkasin kell kuus, sest olin väga närviline. Kõigepealt jõin kohvi ja sõin võileiva. Siis panin selga uue ülikonna ja läksin bussipeatusse. Buss tuli õigel ajal ja ma jõudsin kontorisse juba kell pool üheksa. Juhataja tutvustas mind kolleegidele ja näitas mulle kogu kontorit. Lõuna ajal sõime kolleegidega koos firma sööklas. Pärastlõunal sain esimese ülesande ja tegin selle kiiresti ära. Kella viie ajal läksin koju väsinud, aga õnnelik. Õhtul helistasin emale ja rääkisin talle kõigest. Ema ütles, et on minu üle uhke. Nüüd töötan seal juba kuu aega ja mulle meeldib see töö väga. Kolleegid on abivalmid ja juhataja on rahulik. Esimesel päeval ei teadnud ma veel, et leian sealt ka hea sõbra.',
        [['Miks jutustaja ärkas kell kuus?', 'ta oli närviline'], ['Mida ta hommikul sõi?', 'võileiva'], ['Millal ta kontorisse jõudis?', 'pool üheksa|8.30'], ['Mida juhataja tegi?', 'tutvustas kolleegidele ja näitas kontorit'], ['Kus nad lõunat sõid?', 'firma sööklas'], ['Kellele ta õhtul helistas?', 'emale']]),
      B.translation('025_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера я встал в шесть.', 'Сначала я выпил кофе.', 'Потом я поехал на работу.', 'Я не опоздал.', 'Вечером я позвонил маме.']),
      B.dictation('025_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eile ärkasin vara.', 'Kõigepealt jõin kohvi.', 'Siis läksin bussipeatusse.', 'Ma ei jäänud hiljaks.', 'Õhtul helistasin emale.']),
      B.writing('025_px_write', 'Kordamise tekst.', 'Kirjuta 8–10 lauset ühest tähtsast päevast. Kasuta erandvorme ja eitust.', [8, 10], ['läksin', 'tulin', 'ei', 'lõpuks'], 3),
      B.speaking('025_px_say', 'Suuline kordamine.', 'Räägi 1–2 minutit oma eelmisest nädalavahetusest.', ['Mida tegid laupäeval?', 'Kellega kohtusid?', 'Mida ei jõudnud teha?'], [60, 120]),
      B.wordorder('025_px_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Eelmisel esmaspäeval oli minu esimene tööpäev.', 'Ma jõudsin kontorisse kell pool üheksa.', 'Lõuna ajal sõime kolleegidega koos.']),
      B.selfcheck('025_p_self', ['Ma tegin ülesanded ilma abita.', 'Ma parandasin vead.', 'Ma tean, millised vormid on veel rasked.', 'Olen valmis Kasuta leheks.'], 'Kordamine tehtud'),
    ],
    transfer: [
      B.text('025_t_situation', 'Lõpuülesanne', 'Sa kirjutad oma keelekursuse blogisse postituse teemal „Päev, mida ma ei unusta”.'),
      B.planning('025_t_plan', 'Plaan.', 'Kirjuta märksõnad.', ['Millal ja kus?', 'Mis juhtus kõigepealt?', 'Mis oli kõige olulisem?', 'Kuidas päev lõppes?']),
      B.letter('025_t_post', 'Blogipostitus (90–110 sõna).', 'Kirjuta lugu lihtminevikus. Kasuta sidesõnu.', 'Päev, mida ma ei unusta', 'Kas sinuga on midagi sarnast juhtunud?', [90, 110]),
      B.rubric('025_t_rubric', 'Kontrolli postitust.', 'Märgi, mis on olemas.', ['Selge algus, keskpaik ja lõpp.', 'Vähemalt 10 tegusõna lihtminevikus.', 'Vähemalt 3 erandvormi.', 'Vähemalt 1 eitus minevikus.', 'Vähemalt 4 sidesõna.']),
      B.rolecards('025_t_roles', 'Kommentaarid.', 'Lugege paarilise postitust ja rääkige sellest.',
        'Jutusta oma lugu lühidalt. Vasta küsimustele.', 'Kuula. Küsi 3 täpsustavat küsimust ja räägi sarnasest kogemusest.',
        ['See juhtus…', 'Alguses…', 'Lõpuks…'], ['Mis siis juhtus?', 'Kuidas sa end tundsid?', 'Minuga juhtus kord…']),
      B.reading('025_tx_read', 'Loe teiste postitusi.', 'Loe kahte postitust ja vasta.', 'Päev, mida ma ei unusta',
        'Ann: Minu meeldejäävaim päev oli siis, kui ma esimest korda lennukiga lendasin. Olin kaheksa-aastane ja sõitsime perega Kreekasse. Alguses kartsin väga, aga siis vaatasin aknast pilvi ja unustasin hirmu. Jaan: Mina ei unusta kunagi päeva, kui sain juhiload. Eksami ajal sadas lund ja tee oli libe. Ma sõitsin väga ettevaatlikult ja eksamineerija ütles lõpus: „Palju õnne!” Õhtul tähistasime seda kogu perega restoranis. Mõlemad päevad olid alguses rasked, aga lõppesid hästi. Ann lendab nüüd igal aastal ja ei karda üldse. Jaan sõidab iga päev autoga tööle ja aitab vahel ka sõpradel kolida. Mõlemad ütlevad, et julgus tuleb kogemusega. Kirjuta ka sina oma lugu kommentaari ja räägi, mis päeva sa ei unusta! Parimad lood avaldame järgmisel kuul meie ajakirjas. Ootame sinu lugu!',
        [['Kuhu Anni pere sõitis?', 'Kreekasse'], ['Mida Ann alguses tundis?', 'hirmu|kartis'], ['Mille sai Jaan?', 'juhiload'], ['Milline oli ilm Jaani eksamil?', 'sadas lund, tee oli libe'], ['Kus Jaan tähistas?', 'restoranis']]),
      B.speaking('025_tx_tell', 'Jutusta oma lugu.', 'Jutusta 2 minutit oma meeldejäävast päevast ilma tekstita.', ['Millal see oli?', 'Mis juhtus?', 'Kuidas sa end tundsid?'], [60, 120]),
      B.translation('025_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это был мой первый полёт.', 'Сначала я боялся.', 'Потом я забыл о страхе.', 'Мы праздновали в ресторане.', 'Этот день я никогда не забуду.']),
      B.gaps('025_tx_gaps', 'Kontrolli vorme.', 'Kirjuta tegusõna minevikus.', ['Me [läksime] (minema) Kreekasse.', 'Ta [sai] (saama) juhiload.', 'Ma ei [kartnud] (kartma).', 'Nad [tähistasid] (tähistama) restoranis.', 'Ilm [oli] (olema) halb.']),
      B.writing('025_tx_comment', 'Kommentaar.', 'Kirjuta Annile või Jaanile kommentaar 8–10 lausega oma sarnasest kogemusest.', [8, 10], ['ka mina', 'alguses', 'kartsin', 'lõpuks'], 3),
      B.selfcheck('025_t_self', ['Ma kirjutasin 90–110 sõna.', 'Mu lool on selge ajaloogika.', 'Ma kasutasin erandvorme õigesti.', 'Ma küsisin teise loo kohta.'], 'Moodul 5 tehtud'),
    ],
  },
};
