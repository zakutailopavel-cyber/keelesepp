// B1 course (A2 → B1 roadmap), module 4 „Aeg, plaanid ja kohustused” (a2b1-016…020), stage A2.
// Harjuta + Kasuta for the published Avasta sheets. Time markers, peab / võib / saab and agreements are used in real
// situations (house rules, to-do lists, moving an appointment), never mechanically (roadmap). Places (module 3) and
// people (module 2) come back. 020 is the first mid-term check (A2 base).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2b1-module-04', course: 'b1', title: 'Aeg, plaanid ja kohustused', level: 'A2' };

export const LESSONS = {
  'a2b1-016': {
    title: 'Ajamäärused ja päevaplaan',
    canDo: 'Ma kirjeldan oma päevaplaani ja kasutan vähemalt kuut ajamarkerit.',
    practice: [
      B.clock('016_p_clock', 'Mis kell?', 'Kirjuta kellaaeg sõnadega.', [
        { time: '07:15', extra: '' }, { time: '08:30', extra: '' }, { time: '12:45', extra: '' }, { time: '17:00', extra: '' }, { time: '21:30', extra: '' }, { time: '23:00', extra: '' },
      ]),
      B.diagram('016_p_line', 'timeline', { title: 'Kati tööpäev.', instruction: 'Kirjuta puuduv ajamarker.', nodes: '8.00 | [Kõigepealt] vastab ta kirjadele\n10.00 | [Siis] on koosolek\n12.30 | [Pärast] lõunat helistab ta klientidele\n17.00 | [Lõpuks] teeb homse plaani' }),
      B.gaps('016_p_from', 'Alates … kuni …', 'Täienda laused.', [
        'Pood on avatud [alates] kella üheksast [kuni] kella kaheksani.', 'Ma töötan [kella] kaheksast viieni.', '[Enne] tööd viin lapse lasteaeda.', '[Pärast] tööd lähen trenni.', 'Koosolek kestab [umbes] tund aega.',
      ], ['alates', 'kuni', 'kella', 'enne', 'pärast', 'umbes', 'lõpuks', 'kell']),
      B.wordorder('016_p_order', 'Päev järjekorras.', 'Pane laused kokku.', [
        'Kõigepealt joon ma kohvi.', 'Siis vastan ma kirjadele.', 'Pärast lõunat on mul koosolek.', 'Lõpuks lähen ma koju.',
      ]),
      B.truefalse('016_p_sched', 'Vaata plaani.', 'Plaan: 9–12 koolitus, 12–13 lõuna, 13–16 klient. Õige või vale?', [
        ['Koolitus on enne lõunat.', true], ['Lõuna kestab kaks tundi.', false], ['Klient tuleb pärast lõunat.', true], ['Koolitus algab kell kümme.', false],
      ], 'half'),
      B.speaking('016_p_day', 'Minu homne päev.', 'Räägi oma homsest päevast. Kasuta 6 ajamarkerit.', [
        'Mis kell sa ärkad?', 'Mida teed kõigepealt?', 'Mis on päeva tähtsaim asi?', 'Mida teed pärast tööd?', 'Millal lõpuks puhkad?',
      ], [60, 90], ['kõigepealt', 'siis', 'pärast', 'enne', 'alates … kuni', 'lõpuks']),
      B.reading('016_px_read', 'Loe: Kati tööpäev.', 'Loe tekst ja vasta.', 'Üks tavaline tööpäev',
        'Kati töötab raamatupidajana ja tema tööpäev on väga korrapärane. Ta ärkab kell kuus ja jookseb pool tundi pargis. Kõigepealt käib ta duši all, siis sööb hommikust. Kell kaheksa sõidab ta bussiga tööle. Tööl vastab ta kõigepealt kirjadele. Kella kümnest kaheteistkümneni on tal koosolek. Lõuna ajal sööb ta koos kolleegidega kohvikus. Pärast lõunat teeb ta arveid kuni kella viieni. Enne koju minekut kontrollib ta homset plaani. Õhtul teeb ta süüa ja vaatab uudiseid. Lõpuks, umbes kell kümme, läheb ta magama. Nädalavahetusel on tema päev hoopis teistsugune.',
        [['Mida teeb Kati enne hommikusööki?', 'jookseb pargis ja käib duši all|jookseb ja käib duši all|jookseb pargis'], ['Mida teeb ta kõigepealt tööl?', 'vastab kirjadele'], ['Kui kaua kestab koosolek?', 'kaks tundi|kella kümnest kaheteistkümneni'], ['Mida teeb ta pärast lõunat?', 'teeb arveid'], ['Mida teeb ta enne koju minekut?', 'kontrollib homset plaani'], ['Millal läheb ta magama?', 'umbes kell kümme|kell kümme']]),
      B.table('016_px_times', 'Lahtiolekuajad.', 'Loe silti ja kirjuta lause sõnadega: kella …st kella …ni.', 'silt, lause', ['Apteek 8–20 | Apteek on avatud [kella kaheksast kella kaheksani/kaheksast kaheksani]', 'Raamatukogu 10–18 | Raamatukogu on avatud [kella kümnest kella kuueni/kümnest kuueni]', 'Pank 9.30–17 | Pank on avatud [kella poole kümnest kella viieni/poole kümnest viieni]', 'Kohvik 7–23 | Kohvik on avatud [kella seitsmest kella üheteistkümneni/seitsmest üheteistkümneni]']),
      B.transformation('016_px_join', 'Ühenda laused.', 'Kasuta antud sõna.', [['Ma söön hommikust. Siis lähen tööle.', 'pärast', 'Pärast hommikusööki lähen tööle.'], ['Ma lähen magama. Enne seda loen.', 'enne', 'Enne magamaminekut loen.'], ['Ma lõpetan töö. Siis lähen trenni.', 'pärast', 'Pärast tööd lähen trenni.'], ['Ma joon kohvi. Siis vastan kirjadele.', 'kõigepealt … siis', 'Kõigepealt joon kohvi, siis vastan kirjadele.']]),
      B.translation('016_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я работаю с девяти до пяти.', 'Сначала я пью кофе.', 'После обеда у меня встреча.', 'В конце концов я иду домой.', 'Магазин открыт до восьми.']),
      B.writing('016_px_write', 'Minu tavaline päev.', 'Kirjuta 8–10 lauset. Kasuta 6 ajamarkerit.', [8, 10], ['kõigepealt', 'siis', 'pärast', 'enne', 'lõpuks', 'kell'], 5),
      B.speaking('016_px_say', 'Minu homne päev.', 'Räägi 1–2 minutit oma homsest päevast.', ['Mida teed kõigepealt?', 'Mis on päeva tähtsaim asi?', 'Millal puhkad?'], [60, 120]),
      B.dictation('016_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma ärkan kell seitse.', 'Kõigepealt joon kohvi.', 'Siis sõidan tööle.', 'Pärast lõunat on koosolek.', 'Ma töötan kella viieni.', 'Lõpuks lähen koju.']),
      B.selfcheck('016_p_self', ['Ma ütlen kellaaega sõnadega.', 'Ma kasutan alates … kuni: kella kaheksast kella viieni.', 'Ma panen päeva järjekorda.', 'Ma räägin homsest 6 ajamarkeriga.'], 'Päev on plaanis'),
    ],
    transfer: [
      B.reading('016_t_camp', 'Laagri päevakava.', 'Loe päevakava ja vasta.', 'Keelelaagri päev',
        'Tere tulemast keelelaagrisse! Äratus on kell pool kaheksa. Kõigepealt teeme kümme minutit võimlemist õues. Hommikusöök on alates kella kaheksast kuni pool üheksani. Seejärel algavad tunnid. Need kestavad kella kaheteistkümneni. Pärast lõunat on vaba aeg kuni kella kaheni. Siis läheme matkale või mängime sporti. Õhtusöök on kell kuus. Pärast õhtusööki on ühised mängud ja laulud. Lõpuks, kell kümme, on öörahu. Palun ära hiljem valjult räägi! Kui sul on küsimusi, mine laagri kontorisse. See on avatud alates kella üheksast kuni kella viieni. Telefoni võid kasutada ainult vabal ajal. Head laagrit!',
        [['Mis kell on äratus?', 'pool kaheksa|7.30'], ['Millal võib laagris telefoni kasutada?', 'vabal ajal|ainult vabal ajal|pärast lõunat kuni kella kaheni'], ['Kui kaua kestavad tunnid?', 'kella kaheteistkümneni|kuni kella 12ni|kolm ja pool tundi'], ['Mida tehakse pärast õhtusööki?', 'mängud ja laulud|mängitakse ja lauldakse'], ['Mis kell on öörahu?', 'kell kümme|22.00']]),
      B.text('016_t_situation', 'Uus olukord', 'Sa korraldad sõpradele väljasõidu maale. Pead tegema päevaplaani ja selle kõigile saatma.'),
      B.planning('016_t_plan', 'Väljasõidu plaan.', 'Mõtle läbi.', ['Mis kell ja kust te alustate?', 'Mida teete kõigepealt?', 'Millal on söök?', 'Mis kell tulete tagasi?']),
      B.writing('016_t_write', 'Päevaplaan sõpradele.', 'Kirjuta plaan 6–8 lausega. Kasuta vähemalt 6 ajamarkerit.', [6, 8], ['kõigepealt', 'siis', 'pärast', 'alates', 'kuni', 'lõpuks'], 5),
      B.rolecards('016_t_roles', 'Sõber küsib.', 'Sõber helistab ja küsib plaani kohta. Rääkige 2 minutit.',
        'Oled korraldaja. Selgita plaani. Vasta küsimustele.', 'Oled sõber. Küsi kellaaegade kohta. Ütle, et pead varem lahkuma.',
        ['Kõigepealt…', 'Alates … kuni…', 'Siis…'], ['Mis kell me alustame?', 'Millal on lõuna?', 'Ma pean kell viis lahkuma.']),
      B.gaps('016_tx_plan', 'Kava täitmine.', 'Täida kava sõnadega.', ['Kogunemine on bussijaamas [kell] kaheksa.', 'Sõit kestab [umbes] tund aega.', '[Kõigepealt] läheme matkarajale.', '[Pärast] matka on lõuna.', 'Ujuda saab [alates] kella kahest.', 'Tagasi sõidame [kell] seitse.'], ['kell', 'umbes', 'kõigepealt', 'pärast', 'alates', 'kuni', 'lõpuks']),
      B.speaking('016_tx_present', 'Esitle kava.', 'Tutvusta grupile väljasõidu kava 1–2 minutiga.', ['Millal ja kust alustame?', 'Mida teeme?', 'Millal tuleme tagasi?'], [60, 120]),
      B.translation('016_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Встречаемся в восемь на вокзале.', 'Поездка длится около часа.', 'После обеда идём купаться.', 'Возвращаемся в семь вечера.']),
      B.writing('016_tx_report', 'Kuidas päev läks?', 'Kirjuta pärast väljasõitu 8–10 lauset: mida tegite ja millal.', [8, 10], ['kõigepealt', 'siis', 'pärast', 'lõpuks'], 3),
      B.gaps('016_tx_time', 'Kava sõnadega.', 'Kirjuta kellaaeg sõnadega õiges vormis.', ['Buss väljub [kell kaheksa] (8.00).', 'Matk kestab [kella poole kümnest|poole kümnest] (9.30) kella kaheteistkümneni.', 'Ujuda saab alates [kella kahest|kahest] (14.00).', 'Koju jõuame [kella seitsmeks|seitsmeks] (19.00).'], '', 'half'),
      B.selfcheck('016_t_self', ['Ma mõistan päevakava.', 'Ma koostan päevaplaani.', 'Ma kasutan 6 ajamarkerit.', 'Ma selgitan plaani telefonis.'], 'Korraldaja oskab'),
    ],
  },

  'a2b1-017': {
    title: 'Peab, võib ja saab',
    canDo: 'Ma valin peab, võib või saab vastavalt olukorra tähendusele vähemalt 8 juhul 10-st.',
    practice: [
      B.categorize('017_p_sort', 'Kohustus, luba, võimalus või keeld?', 'Sorteeri laused.', [
        ['Kohustus (peab)', ['Koolis peab kandma vahetusjalatseid.', 'Arve peab maksma reedeks.']], ['Luba (võib)', ['Siin võib istuda.', 'Sa võid tulla hiljem.']], ['Võimalus (saab)', ['Piletit saab osta veebis.', 'Bussiga saab kesklinna.']], ['Keeld (ei tohi)', ['Siin ei tohi suitsetada.', 'Tunnis ei tohi telefoni kasutada.']],
      ]),
      B.wordforms('017_p_inf', 'Õige infinitiiv.', 'Kirjuta tegusõna pärast modaalverbi.', [
        ['pean (minema)', 'ma-vorm', 'minema'], ['võib (istuma)', 'da-vorm', 'istuda'], ['saab (ostma)', 'da-vorm', 'osta'], ['pead (tulema)', 'ma-vorm', 'tulema'], ['võite (sööma)', 'da-vorm', 'süüa'], ['saad (lugema)', 'da-vorm', 'lugeda'],
      ]),
      B.choice('017_p_mean', 'Mida see tähendab?', 'Vali õige tähendus.', [
        ['„Täna ei pea tulema.”', 'Võid tulla, aga see pole kohustus.', 'Tulla on keelatud.', 'Pead kindlasti tulema.'],
        ['„Siin ei tohi suitsetada.”', 'See on keelatud.', 'Seda ei pea tegema, aga võib.', 'See on soovitus, mitte reegel.'],
        ['„Seda saab teha veebis.”', 'Seda on võimalik teha internetis.', 'Seda peab tegema kontoris.', 'Seda ei tohi teha.'],
        ['„Sa võid minu autot kasutada.”', 'Ma luban sul autot kasutada.', 'Sa pead autoga sõitma.', 'Auto on katki.'],
      ], 'full', 'g_use'),
      B.errorfix('017_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma pean minna arsti juurde.', 'Ma pean minema arsti juurde.'], ['Siin võib istuma.', 'Siin võib istuda.'], ['Piletit saab ostma veebis.', 'Piletit saab osta veebis.'], ['Sa ei pead täna tulema.', 'Sa ei pea täna tulema.'],
      ]),
      B.speaking('017_p_rules', 'Reeglid.', 'Räägi oma kodu, kooli või töö reeglitest.', [
        'Mida peab seal tegema?', 'Mida võib teha?', 'Mida ei tohi teha?', 'Mida saab teha veebis?',
      ], [60, 90], ['Meil peab…', 'Seal võib…', 'Seal ei tohi…', 'Seda saab…']),
      B.reading('017_px_read', 'Loe: kooli kord.', 'Loe ja vasta.', 'Keelekooli reeglid',
        'Meie keelekoolis on mõned lihtsad reeglid. Tundi peab tulema õigel ajal. Kui jääd haigeks, pead sellest õpetajale kirjutama enne tunni algust. Klassis võib juua vett, aga süüa ei tohi. Telefoni võib kasutada ainult sõnaraamatuna. Kodutööd saab esitada veebis kuni pühapäeva õhtuni. Raamatukogust võib raamatuid koju laenutada kaheks nädalaks. Õpetajaga saab rääkida ka pärast tundi. Kursuse lõpus peab tegema testi. Kui test ei õnnestu, võib seda ühe korra uuesti teha. Kursuse lõpus saab iga õpilane tunnistuse. Küsimuste korral võib alati kirjutada kooli kontorisse.',
        [['Millal peab tundi tulema?', 'õigel ajal'], ['Mida peab tegema, kui jääd haigeks?', 'kirjutama õpetajale'], ['Mida klassis ei tohi teha?', 'süüa'], ['Kas kodutöö võib esitada ka esmaspäeval?', 'ei|ei, ainult pühapäeva õhtuni|ei, pühapäeva õhtuni'], ['Mitu korda võib testi uuesti teha?', 'ühe korra|üks kord']]),
      B.gaps('017_px_mod', 'Peab, võib või saab?', 'Täida lüngad.', ['Siin [ei tohi|ei või] suitsetada.', 'Piletit [saab] osta veebis.', 'Haiglas [peab] olema vaikne.', 'Sa [võid] tulla ka hiljem.', 'Arve [peab] ära maksma reedeks.', 'Bussiga [saab] kesklinna.'], ['peab', 'võib', 'saab', 'võid', 'ei tohi', 'ei pea']),
      B.transformation('017_px_neg', 'Ütle eitavalt.', 'Kirjuta eitav lause.', [['Sa pead täna tulema.', 'eitus', 'Sa ei pea täna tulema.'], ['Siin võib istuda.', 'eitus', 'Siin ei või istuda.'], ['Seda saab teha veebis.', 'eitus', 'Seda ei saa teha veebis.'], ['Ma pean ootama.', 'eitus', 'Ma ei pea ootama.']]),
      B.translation('017_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Здесь нельзя курить.', 'Я должен идти к врачу.', 'Билет можно купить онлайн.', 'Тебе не нужно приходить завтра.', 'Можно открыть окно?']),
      B.writing('017_px_write', 'Reeglid minu kodus.', 'Kirjuta 8–10 lauset: mida peab, võib ja ei tohi sinu kodus teha.', [8, 10], ['peab', 'võib', 'ei tohi', 'saab'], 3),
      B.dictation('017_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Siin ei tohi suitsetada.', 'Piletit saab osta veebis.', 'Ma pean homme tööle minema.', 'Sa võid tulla hiljem.', 'Arve tuleb maksta reedeks.', 'Telefoni ei tohi tunnis kasutada.']),
      B.speaking('017_px_rules', 'Kooli reeglid.', 'Räägi 1–2 minutit oma kooli või töö reeglitest.', ['Mida peab tegema?', 'Mida ei tohi teha?', 'Milline reegel on hea?'], [60, 120]),
      B.wordorder('017_px_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Klassis võib juua vett.', 'Kodutööd saab esitada veebis.', 'Kursuse lõpus peab tegema testi.']),
      B.selfcheck('017_p_self', ['Ma eristan kohustust, luba, võimalust ja keeldu.', 'Ma tean: peab + ma, võib/saab/tohib + da; ei pea ≠ ei tohi.', 'Ma parandan modaalverbi vead.', 'Ma räägin reeglitest.'], 'Peab, võib, saab'),
    ],
    transfer: [
      B.text('017_t_situation', 'Uus olukord', 'Sinu majja kolib uus pere teisest riigist. Nad ei tea maja reegleid.'),
      B.reading('017_t_rules', 'Maja reeglid.', 'Loe teadet ja vasta.', 'Kase 12 elanikele',
        'Head elanikud! Tuletame meelde maja reegleid. Öörahu on kella kahekümne kahest kuni kella seitsmeni. Sel ajal ei tohi valjult muusikat kuulata ega remonti teha. Prügi peab sorteerima: paber, plastik ja toidujäätmed on eri konteinerites. Prügikastid on maja taga. Vana mööblit ei tohi prügikastide juurde jätta. Jalgrattaid võib hoida keldris, aga mitte trepikojas. Koeraga peab trepikojas olema rihm. Saunat saab broneerida veebis või telefoni teel. Saun on avatud reedest pühapäevani. Pärast sauna palume ukse lukku panna. Kui midagi on katki, peab sellest kohe teatama majahaldurile. Tema telefoninumber on trepikoja uksel. Hoovis võib lastega mängida, aga autosid ei tohi hoovis pesta. Külalised saavad parkida maja taga. Kevadel on hoovis koristuspäev ja kõik elanikud on oodatud. Aitäh, et hoiate meie maja korras! Teie majaühistu.',
        [['Millal on öörahu?', 'kella 22st kella 7ni|22.00–7.00'], ['Mida peab prügiga tegema?', 'sorteerima'], ['Kas jalgratta võib jätta trepikotta?', 'ei|ei, ainult keldrisse|ei, rattaid hoitakse keldris'], ['Kuidas saab saunat broneerida?', 'veebis või telefoni teel|veebis'], ['Kellele peab teatama, kui midagi on katki?', 'majahaldurile']]),
      B.truefalse('017_t_rulestf', 'Õige või vale?', 'Loe teadet uuesti. Kas lause on õige või vale?', [
        ['Kell üheksa õhtul võib veel remonti teha.', true], ['Vana diivani võib jätta prügikastide juurde.', false], ['Saunas saab käia ka esmaspäeval.', false],
        ['Majahalduri numbri leiab trepikoja uksel.', true], ['Külaline võib auto parkida maja taha.', true], ['Hoovis võib autot pesta, kui lapsi ei ole.', false],
      ], 'full'),
      B.rolecards('017_t_roles', 'Selgita reegleid.', 'Rääkige 2–3 minutit.',
        'Oled vana elanik. Selgita uuele naabrile 4 reeglit. Kasuta peab, võib, saab.', 'Oled uus naaber. Küsi reeglite kohta: prügi, ratas, koer, saun.',
        ['Siin peab…', 'Keldris võib…', 'Saunat saab…'], ['Kas siin võib…?', 'Kus ma saan…?', 'Mida ma pean tegema, kui…?']),
      B.writing('017_t_note', 'Teade trepikotta.', 'Kirjuta lühike sõbralik teade uutele elanikele. 5–7 lauset.', [5, 7], ['peab', 'võib', 'saab', 'ei tohi'], 3),
      B.speaking('017_t_compare', 'Siin ja mujal.', 'Võrdle reegleid Eestis ja mõnes teises riigis või kohas.', [
        'Mida peab Eestis tegema, mida mujal ei pea?', 'Mida võib siin, mida mujal ei tohi?', 'Milline reegel sulle meeldib?',
      ], [60, 90]),
      B.choice('017_tx_signs', 'Mida silt tähendab?', 'Vali õige selgitus.', [['Koerad rihma otsas!', 'Koera peab hoidma rihmas.', 'Koeri ei tohi siia tuua.', 'Koera võib lahti lasta.'], ['Suitsetamine keelatud', 'Siin ei tohi suitsetada.', 'Siin ei pea suitsetama.', 'Siin võib suitsetada.'], ['Pilet osta automaadist', 'Piletit saab osta automaadist.', 'Piletit ei ole vaja.', 'Pileti peab ostma juhilt.'], ['Ära sööda parte', 'Parte ei tohi toita.', 'Parte ei pea toitma.', 'Parte võib toita.'], ['Vaikne tsoon', 'Siin peab olema vaikne.', 'Siin võib kõvasti rääkida.', 'Siin saab muusikat kuulata.'], ['Jalgrattaga sõitmine keelatud', 'Siin ei tohi rattaga sõita.', 'Siin ei pea rattaga sõitma.', 'Siin saab ratast laenutada.']], 'full', 'g_use'),
      B.letter('017_tx_letter', 'Kiri majahaldurile.', 'Küsi kirjas kolme reegli kohta, mida sa ei mõista.', 'Tere!', 'Lugupidamisega', [60, 80]),
      B.writing('017_tx_rules2', 'Meie maja reeglid.', 'Kirjuta 8–10 lauset oma maja või töökoha reeglitest.', [8, 10], ['peab', 'võib', 'ei tohi', 'saab'], 3),
      B.selfcheck('017_t_self', ['Ma mõistan maja reegleid.', 'Ma selgitan reegleid naabrile.', 'Ma kirjutan teate.', 'Ma võrdlen reegleid.'], 'Head naabrid'),
    ],
  },

  'a2b1-018': {
    title: 'Mida ma pean tegema?',
    canDo: 'Ma selgitan vähemalt viit kohustust ja kahte prioriteeti ning põhjendan, miks need on tähtsad.',
    practice: [
      B.match('018_p_mean', 'Mis see on?', 'Ühenda väljend ja tähendus.', [
        ['Ma pean…', 'kohustus'], ['Mul on vaja…', 'vajadus'], ['Ma tahan…', 'soov'], ['Ma ei saa…', 'ei ole võimalik'], ['Ma ei pea…', 'ei ole kohustust'],
      ], 'half'),
      B.gaps('018_p_list', 'Minu nimekiri.', 'Täienda laused.', [
        'Ma [pean] täna arve ära maksma.', 'Mul [on vaja] uusi kingi.', 'Ma [tahan] õhtul filmi vaadata.', 'Kahjuks ma [ei saa] homme tulla.', 'Laupäeval ma [ei pea] tööle minema.',
      ], ['pean', 'on vaja', 'tahan', 'ei saa', 'ei pea', 'võin', 'ei tohi'], 'half'),
      B.table('018_p_prio', 'Mis on kiire?', 'Kirjuta: kiire või võib oodata.', 'Ülesanne, Kiire või võib oodata?, Miks?', [
        'arve maksta täna | [kiire] | tähtaeg on täna', 'kapp korda teha | [võib oodata] | see ei ole tähtis', 'arstile helistada | [kiire] | hammas valutab', 'uus raamat osta | [võib oodata] | vana on veel pooleli',
      ]),
      B.transformation('018_p_say', 'Ütle teisiti.', 'Kirjuta sama mõte antud sõnaga.', [
        ['Mul on kohustus koosolekule minna.', 'pean', 'Ma pean koosolekule minema.'], ['Mul ei ole kohustust täna töötada.', 'ei pea', 'Ma ei pea täna töötama.'],
        ['Mul pole võimalik kell viis tulla.', 'ei saa', 'Ma ei saa kell viis tulla.'], ['Ma vajan abi.', 'on vaja', 'Mul on vaja abi.'],
      ]),
      B.dialogue('018_p_help', 'Palun abi.', 'Täida dialoog.', 'Maria', 'Toomas', [
        ['A', 'Toomas, mul on täna palju tööd. Kas sa [saad] mind aidata?'], ['B', 'Muidugi. Mida ma [pean] tegema?'], ['A', 'Mul on [vaja] pakk postkontorisse viia.'],
        ['B', 'Selge. Kas see on [kiire]?'], ['A', 'Jah, postkontor sulgub kell kuus.'], ['B', 'Pole probleemi, ma lähen kohe.'],
      ]),
      B.speaking('018_p_week', 'Minu nädala kohustused.', 'Räägi 5 kohustusest ja 2 prioriteedist.', [
        'Mida sa pead sel nädalal tegema?', 'Mis on kõige tähtsam?', 'Miks?', 'Mida sa ei pea tegema?', 'Mida sa tahaksid teha, kui aega on?',
      ], [60, 90], ['Kõige tähtsam on…, sest…', 'See võib oodata.', 'Mul on vaja…']),
      B.reading('018_px_read', 'Loe: Mardi nimekiri.', 'Loe ja vasta.', 'Mardi kiire nädal',
        'Mardil on sel nädalal väga palju teha. Esmaspäeval peab ta lõpetama tööl tähtsa aruande. Teisipäeval on tal vaja viia auto töökotta, sest pidurid ei tööta hästi. Kolmapäeval tahab ta minna sõbra sünnipäevale, aga ta ei tea veel, kas jõuab. Neljapäeval peab ta maksma üüri ja elektriarve. Reedel ei pea ta tööle minema, sest tal on puhkepäev. Siis tahab ta koristada korterit ja minna ujuma. Mart kirjutab kõik asjad paberile ja tõmbab tehtud asjad maha. Nii näeb ta kohe, mis on veel tegemata. Pühapäeval tahab ta lihtsalt puhata.',
        [['Mida peab Mart esmaspäeval tegema?', 'lõpetama aruande'], ['Miks on vaja auto töökotta viia?', 'pidurid ei tööta hästi'], ['Kas Mart läheb kolmapäeval kindlasti sõbra sünnipäevale?', 'ei|ei tea|ei, ta ei tea, kas jõuab'], ['Mida peab ta neljapäeval maksma?', 'üüri ja elektriarve'], ['Miks ei pea ta reedel tööle minema?', 'tal on puhkepäev']]),
      B.categorize('018_px_sort', 'Kohustus või soov?', 'Sorteeri Mardi asjad.', [['Peab', ['lõpetama aruande', 'maksma üüri', 'viima auto töökotta']], ['Tahab', ['minna sünnipäevale', 'minna ujuma']], ['Ei pea', ['minema reedel tööle']]]),
      B.gaps('018_px_need', 'Mul on vaja…', 'Täida laused.', ['Mul on [vaja] uus telefon osta.', 'Ma [pean] homme vara ärkama.', 'Ma [tahan] puhata.', 'Kahjuks ma [ei saa] tulla.', 'Sa [ei pea] muretsema.', 'Kas sul [on] abi vaja?'], ['vaja', 'pean', 'tahan', 'ei saa', 'ei pea', 'on', 'saan', 'ei tohi']),
      B.translation('018_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мне нужно позвонить врачу.', 'Я должен закончить отчёт.', 'Это может подождать.', 'Мне нужна помощь.', 'Что самое важное?']),
      B.writing('018_px_write', 'Minu nädal.', 'Kirjuta 8–10 lauset: mida pead, tahad ja ei pea sel nädalal tegema.', [8, 10], ['pean', 'tahan', 'ei pea', 'mul on vaja'], 3),
      B.dictation('018_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma pean täna arve maksma.', 'Mul on vaja uusi kingi.', 'Ma tahan õhtul puhata.', 'Kahjuks ma ei saa tulla.', 'See võib oodata.']),
      B.speaking('018_px_week', 'Minu kohustused.', 'Räägi 1–2 minutit, mida pead sel nädalal tegema.', ['Mis on kiire?', 'Mis võib oodata?', 'Kes sind aitab?'], [60, 120]),
      B.match('018_px_pairs', 'Mis sobib?', 'Ühenda lause algus ja lõpp.', [['Mul on vaja', 'arstile helistada.'], ['Ma pean', 'aruande lõpetama.'], ['Ma tahan', 'õhtul kinno minna.'], ['Ma ei saa', 'kell kolm tulla.'], ['Sa ei pea', 'muretsema.']], 'half', 'g_use'),
      B.selfcheck('018_p_self', ['Ma eristan kohustust, vajadust ja soovi.', 'Ma panen ülesanded tähtsuse järjekorda.', 'Ma palun abi.', 'Ma põhjendan prioriteete.'], 'Tean, mis on tähtis'),
    ],
    transfer: [
      // Harno A2 listening: a voice message, read twice, answers of 1–2 words
      B.listening('018_t_voice', 'Ema häälsõnum.', 'Õpetaja loeb häälsõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, kallis! Ema siin. Mul on täna õhtul tööl koosolek ja ma jõuan koju alles kell kaheksa. Isa on komandeeringus ja tuleb alles homme. Nii et täna oled sina kodus kõige vanem.',
        'Palun too vend kella viieks trennist koju. Trenn on täna spordihallis, mitte koolis.',
        'Sa ei pea süüa tegema. Supp on külmkapis, soojenda see lihtsalt üles.',
        'Aga sul on vaja poest leiba ja piima osta. Raha on köögilaual.',
        'Koeraga peab enne pimedat jalutama. Ära unusta võtit, see on ukse kõrval. Koera rihm on esikus kapi peal.',
        'Vanaema helistab umbes kell kuus. Ta tahab teada, kas me tuleme pühapäeval tema juurde. Ütle talle, et tuleme kella kaheteistkümneks.',
        'Kui midagi juhtub, saada mulle sõnum. Helistada ma koosoleku ajal ei saa. Aitäh, kallis!',
      ], ['Ema jõuab koju kell [kaheksa|8].', 'Vend on trennis [spordihallis].', 'Supp on [külmkapis].', 'Poest on vaja osta leiba ja [piima].', 'Raha on [köögilaual].', 'Vanaema helistab umbes kell [kuus|6].', 'Koosoleku ajal võib emale saata [sõnumi|sõnum].']),
      B.text('018_t_situation', 'Uus olukord', 'Sul on homme väga kiire päev. Sõber palub abi kolimisel. Pead otsustama ja oma plaani selgitama.'),
      B.planning('018_t_plan', 'Minu homme.', 'Kirjuta homsed ülesanded tähtsuse järjekorras.', ['Mida ma pean kindlasti tegema?', 'Mida mul on vaja teha?', 'Mis võib oodata?', 'Kas ma saan sõpra aidata?']),
      B.letter('018_t_msg', 'Vasta sõbrale.', 'Selgita oma päeva. Ütle, millal saad aidata. 50–70 sõna.', 'Tere, Mart!', 'Kuni homseni!', [50, 70]),
      B.rolecards('018_t_roles', 'Kolleegid jagavad tööd.', 'Teil on 5 ülesannet ja vähe aega. Jagage need ära.',
        'Sul on kiire aruanne. Selgita, mida pead tegema ja mida ei saa teha.', 'Sul on rohkem aega. Paku abi ja küsi prioriteete.',
        ['Ma pean…', 'Mul ei ole aega…', 'Kõige kiirem on…'], ['Mida ma saan teha?', 'Mis on kõige tähtsam?', 'Ma võin…']),
      B.gaps('018_tx_reply', 'Vastus emale.', 'Täida sõnum.', ['Tere, ema! Ma [toon] venna kella viieks koju.', 'Leiba ma [ostan] poest.', 'Süüa ma [ei pea] tegema, supp on olemas.', 'Koeraga [läheme] vennaga koos.', 'Kas [sul] on veel midagi vaja?'], ['toon', 'ostan', 'ei pea', 'läheme', 'sul', 'pean', 'sina']),
      B.speaking('018_tx_prio', 'Mis on tähtsam?', 'Selgita paariliselt 1–2 minutit oma homset päeva ja prioriteete.', ['Mis on kõige tähtsam?', 'Mis võib oodata?', 'Kus sa abi vajad?'], [60, 120]),
      B.writing('018_tx_list', 'Minu nädala plaan.', 'Kirjuta 8–10 lauset: mida pead, mida tahad ja mis võib oodata.', [8, 10], ['pean', 'tahan', 'mul on vaja', 'võib oodata'], 3),
      B.translation('018_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мне нужно забрать брата из школы.', 'Я не могу прийти в три.', 'Это не срочно.', 'Мне нужно купить хлеб.', 'Помоги мне, пожалуйста.']),
      B.rolecards('018_tx_help', 'Sõber palub abi.', 'Rääkige 2–3 minutit.',
        'Sul on homme kolimine ja palud sõbralt abi.', 'Sul on homme palju kohustusi. Selgita, mida pead tegema, ja paku teist aega.',
        ['Kas sa saad mind aidata?', 'Mul on vaja…'], ['Ma pean…', 'Kahjuks ma ei saa…', 'Aga ma saan…']),
      B.selfcheck('018_t_self', ['Ma mõistan häälsõnumit.', 'Ma panen ülesanded järjekorda.', 'Ma selgitan oma päeva kirjas.', 'Ma jagan tööd teisega.'], 'Kohustused on paigas'),
    ],
  },

  'a2b1-019': {
    title: 'Kokkulepe ja aja muutmine',
    canDo: 'Ma viin läbi kolm lühikest kokkuleppedialoogi, kus pakun aega, keeldun vajadusel ja pakun alternatiivi.',
    practice: [
      B.categorize('019_p_steps', 'Kolm sammu.', 'Sorteeri fraasid.', [
        ['Ettepanek', ['Kas sulle sobib…?', 'Kas sa saad…?', 'Äkki kohtume…?']], ['Keeldumine', ['Kahjuks ei saa.', 'Mul on siis trenn.', 'See päev ei sobi.']], ['Alternatiiv ja kokkulepe', ['Aga kuidas oleks…?', 'Sobib küll!', 'Lepime kokku.']],
      ]),
      B.dialogue('019_p_phone', 'Telefonikõne.', 'Täida dialoog.', 'Liina', 'Registratuur', [
        ['A', 'Tere! Ma soovin [aega] hambaarsti juurde.'], ['B', 'Kas teile [sobib] teisipäeval kell kümme?'], ['A', '[Kahjuks] ei saa, mul on siis tööl koosolek.'],
        ['B', 'Aga kuidas [oleks] kolmapäeval kell neli?'], ['A', 'See [sobib] küll. Aitäh!'],
      ]),
      B.wordorder('019_p_order', 'Viisakas vastus.', 'Pane laused kokku.', [
        'Kas sulle sobib reedel kell viis?', 'Kahjuks ma ei saa reedel tulla.', 'Aga kuidas oleks laupäeva hommikul?', 'Sobib küll, lepime kokku.',
      ]),
      B.choice('019_p_react', 'Mis on viisakas?', 'Vali kõige parem vastus.', [
        ['„Kas sulle sobib homme kell kolm?” (sul on trenn)', 'Kahjuks ei saa, mul on trenn. Kas kell viis sobib?', 'Jah, sobib küll, kohtume kell kolm trenni juures.', 'Kahjuks ei saa. Võib-olla mõni teine kord.'],
        ['„Kas saad mind kolimisel aidata?” (oled vaba)', 'Muidugi, mis kell ma tulen?', 'Kahjuks ei saa, mul on kiire.', 'Võib-olla, ma ei tea veel.'],
        ['Sa pead kohtumise tühistama.', 'Vabandust, mul tuli midagi vahele. Kas saame teisel päeval kohtuda?', 'Tere! Kohtume homme, nagu kokku leppisime, ootan sind.', 'Kas sa saad homme varem tulla, näiteks kell neli?'],
        ['„Kuidas oleks pühapäeval?” (sobib)', 'Sobib küll! Kus kohtume?', 'Kahjuks pühapäeval ei saa.', 'Võib-olla, ma ei tea veel.'],
      ], 'full', 'g_use'),
      B.translation('019_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta viisakas lause.', ['Тебе подходит в среду в пять?', 'К сожалению, я не могу.', 'А как насчёт четверга?', 'Договорились!']),
      B.speaking('019_p_three', 'Kolm dialoogi.', 'Pidage paaris kolm lühikest kokkulepet: kino, arst, sõbra sünnipäev.', [
        'Mida sa pakud?', 'Miks esimene aeg ei sobi?', 'Milline on uus aeg?', 'Milline on kokkulepe?',
      ], [60, 120], ['Kas sulle sobib…?', 'Kahjuks ei saa, sest…', 'Aga kuidas oleks…?', 'Lepime kokku.']),
      B.reading('019_px_read', 'Loe sõnumeid.', 'Loe vestlust ja vasta.', 'Millal kohtume?',
        'Kristi: Tere, Mart! Kas sul on reedel aega kinno minna? Mart: Reede õhtu ei sobi, mul on trenn. Aga kuidas oleks laupäeval? Kristi: Laupäeval lähen hommikul vanaema juurde. Kas õhtu sobib? Mart: Jah, õhtu sobib hästi. Mis kell film algab? Kristi: Film algab kell seitse, aga me võiksime enne süüa. Mart: Hea mõte! Kohtume kell kuus kino kõrval kohvikus. Kristi: Sobib! Ma ostan piletid ära. Mart: Super, kohtumiseni! Kristi: Ära unusta, et pärast filmi läheme Liisa sünnipäevale. Mart: Jah, mul on kingitus juba olemas.',
        [['Miks reede Mardile ei sobi?', 'tal on trenn'], ['Kuhu läheb Kristi laupäeva hommikul?', 'vanaema juurde'], ['Mis kell film algab?', 'seitse|19'], ['Kus nad kohtuvad?', 'kino kõrval kohvikus'], ['Mida nad enne filmi teevad?', 'söövad kohvikus|söövad|lähevad kohvikusse sööma']]),
      B.gaps('019_px_phr', 'Kokkuleppe fraasid.', 'Täida laused.', ['Kas sulle [sobib] reedel?', '[Kahjuks] ma ei saa.', 'Aga kuidas [oleks] laupäeval?', 'Sobib, [lepime] kokku.', 'Mul on siis [trenn].'], ['sobib', 'kahjuks', 'oleks', 'lepime', 'trenn', 'sobiks', 'kahju']),
      B.writing('019_px_write', 'Kutse sõbrale.', 'Kirjuta 7–9 lauset: kutsu sõber üritusele ja paku kaks aega.', [7, 9], ['kas sulle sobib', 'või', 'kahjuks', 'lepime'], 3),
      B.dictation('019_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas sulle sobib reedel?', 'Kahjuks ma ei saa.', 'Mul on siis trenn.', 'Aga kuidas oleks laupäeval?', 'Sobib, lepime kokku.', 'Kohtume kino ees.']),
      B.translation('019_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Тебе подходит в субботу?', 'К сожалению, в субботу я занят.', 'А как насчёт воскресенья?', 'Встретимся у кино.', 'Договорились!']),
      B.rolecards('019_px_roles', 'Kino või kohvik?', 'Leppige kokku ühine õhtu. Rääkige 2–3 minutit.',
        'Paku kino reedel. Kui ei sobi, paku teist päeva.', 'Reede ei sobi. Paku kohvikut ja muud aega.',
        ['Kas lähme…?', 'Kas sulle sobib…?'], ['Kahjuks…', 'Aga kuidas oleks…?', 'Sobib!']),
      B.selfcheck('019_p_self', ['Ma teen ettepaneku.', 'Ma keeldun viisakalt ja põhjendan.', 'Ma pakun uue aja.', 'Ma pidasin 3 dialoogi.'], 'Kokkulepe tehtud'),
    ],
    transfer: [
      B.text('019_t_situation', 'Uus olukord', 'Sinu nädal on täis. Kolm inimest tahavad sinuga kohtuda. Pead kõigiga kokku leppima.'),
      B.table('019_t_week', 'Minu nädal.', 'Kirjuta oma kalender. Jäta 3 vaba aega.', 'Päev, Hommik, Pärastlõuna, Õhtu', [
        'esmaspäev | | |', 'teisipäev | | |', 'kolmapäev | | |', 'neljapäev | | |', 'reede | | |',
      ]),
      B.rolecards('019_t_roles', 'Kolm kõnet.', 'Iga kõne: ettepanek, keeldumine, alternatiiv, kokkulepe.',
        'Sina helistad: 1) sõber kinno, 2) juuksur, 3) kolleeg koosolekule. Kasuta oma kalendrit.', 'Sina vastad. Esimene pakutud aeg ei sobi kunagi. Paku ise uus aeg.',
        ['Kas sulle sobib…?', 'Kas teil on vaba aega…?'], ['Kahjuks…', 'Aga kuidas oleks…?', 'Sobib, lepime kokku.']),
      B.writing('019_t_move', 'Sõnum: aeg muutub.', 'Sul tuli midagi vahele. Kirjuta sõbrale, vabanda ja paku uus aeg. 4–6 lauset.', [4, 6], ['vabandust', 'kahjuks', 'kuidas oleks', 'sobib'], 3),
      B.choice('019_t_reply', 'Kuidas vastata?', 'Sõber vastas. Vali sobiv jätk.', [
        ['„Laupäev mulle ei sobi.”', 'Mis päev sulle sobib?', 'Hästi, siis kohtume laupäeval.', 'Tore, et laupäev sobib!'],
        ['„Pühapäev sobib, aga alles kell kuus.”', 'Sobib, kohtume kell kuus.', 'Sobib, kohtume pühapäeval kell kolm.', 'Kahju, et pühapäev ei sobi.'],
        ['„Kus me kohtume?”', 'Kino ees, kell kuus.', 'Kell kuus, pühapäeval.', 'Kohtume kindlasti!'],
        ['„Kas võtame Liisa ka kaasa?”', 'Jah, hea mõte, kirjutan talle.', 'Ei, ma ei võta midagi süüa kaasa.', 'Jah, ma võtan piletid kaasa.'],
      ], 'full', 'g_use'),
      B.reading('019_tx_read', 'Loe teadet.', 'Loe arsti teadet ja vasta.', 'Aja muutmine',
        'Lugupeetud patsient! Teie aeg hambaarsti juurde oli homme kell kümme. Kahjuks on arst haige ja vastuvõttu ei toimu. Pakume uusi aegu: neljapäeval kell üheksa, reedel kell neliteist või järgmisel esmaspäeval kell kaksteist. Palun vastake sellele sõnumile ja valige sobiv aeg. Kui ükski aeg ei sobi, helistage registratuuri. Registratuur töötab tööpäeviti kella kaheksast viieni. Vabandame ebamugavuse pärast ja täname mõistva suhtumise eest! Uut aega saab valida ka meie kodulehel. Kui te uut aega ei vali, tühistame vastuvõtu kolme päeva pärast. Teie hambaraviklinik.',
        [['Miks vastuvõttu ei toimu?', 'arst on haige'], ['Mitu uut aega pakutakse?', 'kolm|3'], ['Mida patsient peab tegema?', 'valima aja ja vastama|vastama sõnumile'], ['Mida teha, kui aeg ei sobi?', 'helistada registratuuri'], ['Mis juhtub, kui patsient uut aega ei vali?', 'vastuvõtt tühistatakse kolme päeva pärast|vastuvõtt tühistatakse|aeg tühistatakse']]),
      B.letter('019_tx_answer', 'Vasta registratuurile.', 'Vali aeg ja selgita, miks teised ei sobi.', 'Tere!', 'Lugupidamisega', [50, 70]),
      B.writing('019_tx_week', 'Minu kokkulepped.', 'Kirjuta 8–10 lauset: millega leppisid sel nädalal kokku ja mida pidid muutma.', [8, 10], ['lepime kokku', 'kahjuks', 'sobib', 'muutsin'], 3),
      B.selfcheck('019_t_self', ['Ma planeerin oma nädala.', 'Ma pidasin 3 kõnet lõpuni.', 'Ma vabandan ja pakun uut aega kirjas.', 'Ma lõpetan kokkuleppe täpselt: aeg ja koht.'], 'Nädal on kokku lepitud'),
    ],
  },

  // Vahehindamine 1 in the Harno A2 exam format (modules 1–4): Harjuta = reading (tasks 1–5) and listening, Kasuta =
  // writing (information transfer, message) and speaking (getting to know, picture, idea cards)
  'a2b1-020': {
    title: 'Vahehindamine 1 — A2 baas',
    canDo: 'Ma lahendan igapäevaelu, pere, linna ja kohustuste ülesandeid iseseisvalt ning suhtlen arusaadavalt.',
    practice: [
      B.tip('020_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teemad on moodulitest 1–4. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: everyday phrases and politeness
      B.choice('020_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Kohtud hommikul kolleegiga. Mida ütled?', 'Tere hommikust!', 'Head ööd!', 'Head aega!'],
        ['Sa ei saanud aru, mida müüja ütles. Mida ütled?', 'Vabandust, kas te saaksite korrata?', 'Aitäh, kõik on selge!', 'Ei, ma ei taha midagi.'],
        ['Sa jääd koosolekule hiljaks. Mida kirjutad?', 'Vabandust, jään kümme minutit hiljaks.', 'Palju õnne, tulen kohe!', 'Aitäh, ma ei tule täna.'],
        ['Sõber pakub sulle kooki, aga sa ei taha. Mida ütled?', 'Aitäh, aga praegu ma ei soovi.', 'Jah, palun, veel üks tükk!', 'Head isu, võta veel!'],
        ['Sõber ütleb: „Mul on homme eksam.” Mida ütled?', 'Edu sulle!', 'Palju õnne sünnipäevaks!', 'Head paranemist!'],
        ['Telefonis küsitakse Annet. Anne on poes. Mida ütled?', 'Ta on praegu poes. Kas ütlen talle midagi?', 'Jah, mina olen Anne, kuulan.', 'Vabandust, te valisite vale numbri.'],
      ]),
      // reading 2: three short messages, answers by letter or in 1–2 words
      B.reading('020_p_three', 'Lugemine 2. Kolm sõnumit.', 'Loe kolme sõnumit. Vasta sõnumi tähega (A, B, C) või lühidalt.', 'Sõnumid Katile',
        'A. Tere, Kati! Kas sa saad homme minu lapsi hoida? Mul on kella kolmest arsti juures aeg. Tulen tagasi umbes kell viis. Lapsed on kodus ja süüa on külmkapis. Kui sa ei saa, palun kirjuta mulle täna õhtul. Anu\n\nB. Head naabrid! Laupäeval kell kümme on hoovis koristuspäev. Pärast koristamist joome koos kohvi ja sööme pirukaid. Palun võtke kaasa kindad. Reha ja kotid saab majahaldurilt. Majaühistu\n\nC. Kallis Kati! Ma ei saa reedel kinno tulla, sest pean kauem tööl olema. Kas laupäeva õhtu sobib? Film algab kell seitse. Kohtume kino ees. Piletid ostan mina. Mart',
        [['Kes palub abi?', 'A|Anu'], ['Kes tahab kokkulepet muuta?', 'C|Mart'], ['Mida peab koristuspäevale kaasa võtma?', 'kindad|kindaid'], ['Miks läheb Anu ära?', 'tal on arsti juures aeg|arsti juurde'], ['Mis kell film algab?', 'seitse|kell seitse|19']]),
      // reading 3: signs and notices matched to what they mean
      B.match('020_p_signs', 'Lugemine 3. Mida silt tähendab?', 'Ühenda silt ja selle tähendus.', [
        ['Raamatukogu: E–R 10–19, L 10–16', 'Laupäeval saab raamatuid laenutada kella neljani.'], ['Treeneriga trenn ainult broneerimisega', 'Enne trenni pead aja kinni panema.'],
        ['Bussis söömine keelatud', 'Bussis ei tohi süüa.'], ['Perearst: vastuvõtt ainult eelregistreerimisega', 'Arsti juurde ei saa minna ilma ajata.'],
        ['Pood remondi tõttu suletud 3.–10. mail', 'Mai alguses pood ei tööta.'], ['Pakk tuleb automaadist ära võtta 7 päeva jooksul', 'Pakk ootab sind üks nädal.'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text with 3-option questions
      B.reading('020_p_read', 'Lugemine 4. Liisi laupäev.', 'Loe tekst. Vasta lühidalt.', 'Liisi laupäev',
        'Liisi ärkab laupäeval kell kaheksa. Kõigepealt jookseb ta pargis pool tundi. Siis sööb ta hommikust oma vanemate juures, sest nad elavad samas majas. Pärast hommikusööki peab Liisi minema postkontorisse ja apteeki. Postkontoris ootab teda pakk õelt, kes elab Soomes. Apteegist ostab ta vanaemale ravimit. Lõuna ajal helistab sõbranna Kadri. Ta küsib, kas Liisi saab kell kolm kinno tulla. Kahjuks Liisi ei saa, sest ta peab venna lapsi hoidma. Ta pakub, et nad lähevad hoopis kell seitse. Kadrile see sobib. Venna lapsed on väga energilised ja tahavad kogu aeg mängida. Liisi läheb nendega mänguväljakule. Kell kuus tuleb vend lastele järele. Liisi läheb koju ja puhkab natuke. Õhtul kohtuvad sõbrannad kino ees. Film on naljakas ja pärast seda joovad nad kohvikus teed. Liisi jõuab koju alles kell üksteist.',
        [['Kui kaua Liisi jookseb?', 'pool tundi|30 minutit'], ['Kellelt on pakk?', 'õelt|Liisi õelt'], ['Mis kell tuleb vend lastele järele?', 'kuus|kell kuus|18']]),
      B.choice('020_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Miks sööb Liisi hommikust vanemate juures?', 'Nad elavad samas majas.', 'Tal endal pole kodus süüa.', 'Vanematel on sünnipäev.'],
        ['Kellele ostab Liisi apteegist ravimit?', 'vanaemale', 'õele', 'venna lastele'],
        ['Miks ei saa Liisi kell kolm kinno minna?', 'Ta hoiab venna lapsi.', 'Ta on postkontoris.', 'Ta jookseb pargis.'],
        ['Kes pakub kinno minekuks uue aja?', 'Liisi', 'Kadri', 'Liisi vend'],
        ['Mida teevad sõbrannad pärast filmi?', 'joovad kohvikus teed', 'lähevad mänguväljakule', 'söövad vanemate juures'],
      ]),
      // reading 5: a personal letter with 8 option gaps (forms of modules 1–4)
      B.cloze('020_p_cloze', 'Lugemine 5. Kiri sõbrannale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Olga!', [
        'Aitäh kutse eest! Sinu uus korter on kindlasti väga ilus. Kahjuks ma ei saa laupäeval {*tulla|tulema|tulen}. Mul on laupäeval {*venna|vend|vennale} pulm. Pulm on Pärnus ja me sõidame {*sinna|seal|sealt} juba reede õhtul. Vend on väga õnnelik ja kogu pere on elevil.',
        '',
        'Ma pean ka kingituse {*ostma|osta|ostan}, aga ma ei tea veel, mida osta. Pühapäeval {*tuleme|tulime|tuleb} Pärnust tagasi. Esmaspäeval olen jälle Tartus.',
        '',
        'Kas sulle sobib, kui ma tulen {*esmaspäeval|esmaspäev|esmaspäevani} pärast tööd? Ma lõpetan töö {*kell|kella|kellal} viis. Siis võin sinu {*juurde|juures|juurest} tulla umbes kell kuus. Kirjuta, kas see aeg sobib!',
        '',
        'Kallistan, Mari',
      ]),
      // listening 3 of the A2 exam: an announcement, read twice, answers of 1–2 words
      B.listening('020_p_listen', 'Kuulamine 1. Teade kursusel.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, head kursuslased! Palun kuulake hoolega. Mul on mõned tähtsad teated järgmiseks nädalaks.',
        'Esmaspäeval tundi ei toimu, sest õpetaja on koolitusel. Teisipäeval algab tund tavalisest varem, kell viis.',
        'Tund toimub seekord raamatukogu saalis, mitte klassis. Raamatukogu asub kooli kõrval, teisel korrusel. Saali uks on kohe trepi juures.',
        'Kolmapäeval on vahehindamine. Hindamine kestab kaks tundi. Palun võtke kaasa isikutunnistus ja pastakas. Telefoni ei tohi hindamise ajal kasutada. Kes ei saa tulla, peab õpetajale kirjutama.',
        'Neljapäeval läheme koos linnamuuseumi. Kohtume kell neli muuseumi ees. Pilet maksab kolm eurot, aga õpilastele on see tasuta. Muuseumis on meil giid, kes räägib lihtsas eesti keeles.',
        'Reedel saate hindamise tulemused e-posti teel. Kui teil on küsimusi, kirjutage kooli kontorisse. Kontor on avatud tööpäeviti kella üheksast neljani. Head nädalat!',
      ], ['Esmaspäeval on õpetaja [koolitusel].', 'Teisipäeval algab tund kell [viis|5|17].', 'Teisipäeval on tund raamatukogu [saalis].', 'Hindamisele tuleb kaasa võtta isikutunnistus ja [pastakas|pastaka].', 'Neljapäeval kohtutakse muuseumi [ees].', 'Õpilastele on muuseum [tasuta].', 'Hindamise tulemused tulevad [reedel].']),
      // a phone conversation (A2 listening 2 and 4), answers of 1–2 words
      B.listening('020_p_listen2', 'Kuulamine 2. Uus aeg.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Hambaarsti registratuur, kuulan.', '— Tere! Minu nimi on Olga Ivanova. Mul on aeg neljapäeval kell kümme.', '— Jah, ma näen. Mis juhtus?',
        '— Kahjuks ma ei saa neljapäeval tulla. Mul on tööl tähtis koosolek.', '— Selge. Kas reede sobib? Reedel on vaba aeg kell kaheksa.',
        '— Kell kaheksa on liiga vara, ma viin siis lapse lasteaeda. Kas pärastlõunal on midagi?', '— Reedel pärastlõunal kahjuks ei ole. Aga järgmisel esmaspäeval kell neli on vaba.',
        '— Esmaspäev kell neli sobib hästi.', '— Hästi. Siis on teie aeg esmaspäeval kell neli. Palun tulge kümme minutit varem.',
        '— Kas ma pean midagi kaasa võtma?', '— Võtke kaasa isikutunnistus. Kabinet on teisel korrusel, number kakskümmend üks.',
        '— Aitäh! Kuidas teie juurde bussiga saab?', '— Bussiga number viis. Peatus on kohe maja ees.', '— Suur aitäh! Head päeva!',
      ], ['Olga ei saa neljapäeval tulla, sest tal on [koosolek|tööl koosolek].', 'Kell kaheksa viib Olga lapse [lasteaeda].', 'Uus aeg on esmaspäeval kell [neli|4|16].', 'Olga peab tulema kümme minutit [varem].', 'Kabinet on [teisel] korrusel.', 'Arsti juurde sõidab buss number [viis|5].']),
      B.gaps('020_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma lähen pärast tööd [apteeki] (apteek).', 'See on minu [venna] (vend) auto.', 'Sa [pead] (pidama) arve täna maksma.', 'Siin [võib] (võima) istuda.', 'Ma tulen kell viis [töölt] (töö).', '[Tal on] pikad juuksed.',
      ]),
      B.errorfix('020_p_fix', 'Keeleosa. Paranda viis viga.', 'Kirjuta laused õigesti.', [
        ['Ma pean minna koju.', 'Ma pean minema koju.'], ['Raamat on laud.', 'Raamat on laual.'], ['See on minu sõber auto.', 'See on minu sõbra auto.'], ['Ta on prillid.', 'Tal on prillid.'], ['Ma lähen kodus.', 'Ma lähen koju.'],
      ]),
      B.transformation('020_px_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [['Apteek on avatud 9–18.', 'alates … kuni', 'Apteek on avatud alates kella üheksast kuni kella kuueni.'], ['Mul on kohustus tulla.', 'pean', 'Ma pean tulema.'], ['See on minu õe raamat.', 'kuulub', 'Raamat kuulub minu õele.'], ['Kell 10 ei sobi.', 'kahjuks', 'Kahjuks kell kümme ei sobi.']]),
      B.speaking('020_px_say', 'Räägi kuuldust.', 'Räägi paarilisele, kuidas Olga uue arstiaja sai.', ['Miks Olga helistas?', 'Miks reede ei sobinud?', 'Mis on uus aeg?', 'Kuidas ta arsti juurde jõuab?'], [60, 90], ['Olga ei saanud…, sest…', 'Uus aeg on…', 'Ta sõidab…']),
      B.selfcheck('020_p_self', ['Lugemine: valin olukorda sobiva viisaka lause.', 'Lugemine: leian sõnumist, sildilt ja tekstist vajaliku info.', 'Lugemine: valin kirja lünka õige vormi.', 'Kuulamine: kirjutan vastuse 1–2 sõnaga.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('020_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('020_t_card', 'Visiitkaart', ['Tiina Mets — eesti keele õpetaja', 'Keelekool „Sõna”, Riia 15, Tartu', 'Tunnid: esmaspäeval ja kolmapäeval kell 17–19', 'Telefon: 5345 6789'], 'full', 'g_read'),
      // writing 1: information transfer (who, where, when, contact), at least 25 words
      B.letter('020_t_info', 'Kirjutamine 1. Soovita õpetajat.', 'Sõber otsib eesti keele õpetajat. Kirjuta: kes, kus, millal, kuidas ühendust võtta.', 'Tere, Andrei!', 'Edu õppimisel!', [25, 40]),
      B.planning('020_t_plan', 'Enne sõnumit.', 'Mõtle läbi ja kirjuta märksõnad.', ['Kus sa rahakoti leidsid?', 'Milline rahakott on?', 'Kus see praegu on?', 'Millal ja kus sõber selle saab?']),
      // writing 2: a message, at least 30 words
      B.letter('020_t_letter', 'Kirjutamine 2. Sõnum sõbrale.', 'Leidsid sõbra rahakoti. Kirjuta: kus leidsid, milline see on, kuidas ta selle saab.', 'Tere!', 'Kirjuta mulle!', [30, 50]),
      B.writing('020_tx_text', 'Kirjutamine 2 (teine valik). Minu nädalavahetus.', 'Kirjuta 4–6 lauset: kus olid, mida tegid, mis meeldis.', [4, 6], ['laupäeval', 'pühapäeval', 'sest'], 2),
      B.table('020_t_form', 'Täida keelekursuse ankeet.', 'Kirjuta oma andmed.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Elukoht | ', 'Telefon või e-post | ', 'Millal sul on aega õppida? | ', 'Miks sa eesti keelt õpid? | ']),
      B.rubric('020_t_rubric', 'Hindamise tingimused.', 'Märgi, mis on täidetud.', ['Kirjutamine 1: kes, kus, millal, kontakt — vähemalt 25 sõna.', 'Kirjutamine 2: kus leidsid, milline, kuidas kätte saab — 30–50 sõna.', 'Kirjas on kohavormid (kus, kuhu, kust) ja modaalverb (pean, võin, saan).', 'Laused on seotud: ja, aga, sest.', 'Mõlemas rääkimisülesandes küsisin ja vastasin lõpuni.']),
      // speaking: getting to know, picture description (task 1), idea cards (task 2)
      B.speaking('020_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad ja kellega?', 'Mida sa teed tööl või koolis?', 'Mida sa pead sel nädalal tegema?'], [45, 60]),
      B.speaking('020_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab kummalegi erineva pildi: pere, kodu või linn. Kirjelda 1 minut.', ['Kes või mis on pildil?', 'Kus see on?', 'Mida inimesed teevad?', 'Mis kell või aastaaeg võiks olla?'], [60, 90], ['Pildil on…', 'Vasakul / paremal…', 'Nad…']),
      B.speaking('020_t_compare', 'Rääkimine 1. Võrdle pilte.', 'Võrdle oma pilti paarilise pildiga. Vasta õpetaja küsimustele.', ['Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kumb pilt meeldib sulle rohkem?', 'Miks?'], [60, 90]),
      B.rolecards('020_t_s1', 'Rääkimine 2. Ideekaart „Vaba aeg”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel 5 küsimust märksõnade järgi: hobi, kellega, kui tihti, kus, eelmine nädalavahetus.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Mis on sinu hobi?', 'Kellega sa seda teed?', 'Mida sa eelmisel nädalavahetusel tegid?'], ['Mulle meeldib…', 'Ma käin… kaks korda nädalas.', 'Eelmisel laupäeval ma…']),
      B.rolecards('020_t_s2', 'Rääkimine 2. Ideekaart „Linnas”.', 'Nüüd küsib B ja A vastab.',
        'Vasta igale küsimusele 2–3 lausega.', 'Küsi 5 küsimust märksõnade järgi: apteek, pood, buss, lahtiolekuajad, tee kodust kooli.',
        ['Apteek on…', 'Pood on avatud alates… kuni…', 'Kõigepealt lähen…'], ['Kus on lähim apteek?', 'Mis kell pood kinni läheb?', 'Kuidas sa kooli jõuad?']),
      B.selfcheck('020_t_self', ['Kirjutamine: kirjutan visiitkaardi põhjal 25–40 sõna.', 'Kirjutamine: kirjutan sõnumi 30–50 sõnaga.', 'Rääkimine: kirjeldan ja võrdlen pilte.', 'Rääkimine: küsin ja vastan ideekaardi järgi.'], 'A2 baas on käes'),
    ],
  },
};
