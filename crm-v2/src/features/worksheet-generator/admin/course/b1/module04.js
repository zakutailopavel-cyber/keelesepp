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
      ], ['alates', 'kuni', 'kella', 'enne', 'pärast', 'umbes']),
      B.wordorder('016_p_order', 'Päev järjekorras.', 'Pane laused kokku.', [
        'Kõigepealt joon ma kohvi.', 'Siis vastan ma kirjadele.', 'Pärast lõunat on mul koosolek.', 'Lõpuks lähen ma koju.',
      ]),
      B.truefalse('016_p_sched', 'Vaata plaani.', 'Plaan: 9–12 koolitus, 12–13 lõuna, 13–16 klient. Õige või vale?', [
        ['Koolitus on enne lõunat.', true], ['Lõuna kestab kaks tundi.', false], ['Klient tuleb pärast lõunat.', true], ['Koolitus algab kell kümme.', false],
      ], 'half'),
      B.speaking('016_p_day', 'Minu homne päev.', 'Räägi oma homsest päevast. Kasuta 6 ajamarkerit.', [
        'Mis kell sa ärkad?', 'Mida teed kõigepealt?', 'Mis on päeva tähtsaim asi?', 'Mida teed pärast tööd?', 'Millal lõpuks puhkad?',
      ], [60, 90], ['kõigepealt', 'siis', 'pärast', 'enne', 'alates … kuni', 'lõpuks']),
      B.selfcheck('016_p_self', ['Ma ütlen kellaaega sõnadega.', 'Ma kasutan alates … kuni.', 'Ma panen päeva järjekorda.', 'Ma räägin homsest 6 ajamarkeriga.'], 'Päev on plaanis'),
    ],
    transfer: [
      B.reading('016_t_camp', 'Laagri päevakava.', 'Loe päevakava ja vasta.', 'Keelelaagri päev',
        'Tere tulemast keelelaagrisse! Äratus on kell pool kaheksa. Kõigepealt teeme kümme minutit võimlemist õues. Hommikusöök on alates kella kaheksast kuni pool üheksani. Seejärel algavad tunnid. Need kestavad kella kaheteistkümneni. Pärast lõunat on vaba aeg kuni kella kaheni. Siis läheme matkale või mängime sporti. Õhtusöök on kell kuus. Pärast õhtusööki on ühised mängud ja laulud. Lõpuks, kell kümme, on öörahu. Palun ära hiljem valjult räägi! Kui sul on küsimusi, mine laagri kontorisse. See on avatud alates kella üheksast kuni kella viieni. Telefoni võid kasutada ainult vabal ajal. Head laagrit!',
        [['Mis kell on äratus?', 'pool kaheksa|7.30'], ['Mida tehakse kõigepealt?', 'võimlemist|võimlemine'], ['Kui kaua kestavad tunnid?', 'kella kaheteistkümneni|kuni kella 12ni'], ['Mida tehakse pärast õhtusööki?', 'mängud ja laulud|mängitakse ja lauldakse'], ['Mis kell on öörahu?', 'kell kümme|22.00']]),
      B.text('016_t_situation', 'Uus olukord', 'Sa korraldad sõpradele väljasõidu maale. Pead tegema päevaplaani ja selle kõigile saatma.'),
      B.planning('016_t_plan', 'Väljasõidu plaan.', 'Mõtle läbi.', ['Mis kell ja kust te alustate?', 'Mida teete kõigepealt?', 'Millal on söök?', 'Mis kell tulete tagasi?']),
      B.writing('016_t_write', 'Päevaplaan sõpradele.', 'Kirjuta plaan 6–8 lausega. Kasuta vähemalt 6 ajamarkerit.', [6, 8], ['kõigepealt', 'siis', 'pärast', 'alates', 'kuni', 'lõpuks'], 5),
      B.rolecards('016_t_roles', 'Sõber küsib.', 'Sõber helistab ja küsib plaani kohta. Rääkige 2 minutit.',
        'Oled korraldaja. Selgita plaani. Vasta küsimustele.', 'Oled sõber. Küsi kellaaegade kohta. Ütle, et pead varem lahkuma.',
        ['Kõigepealt…', 'Alates … kuni…', 'Siis…'], ['Mis kell me alustame?', 'Millal on lõuna?', 'Ma pean kell viis lahkuma.']),
      B.selfcheck('016_t_self', ['Ma mõistan päevakava.', 'Ma koostan päevaplaani.', 'Ma kasutan 6 ajamarkerit.', 'Ma selgitan plaani telefonis.'], 'Korraldaja oskab'),
    ],
  },

  'a2b1-017': {
    title: 'Peab, võib ja saab',
    canDo: 'Ma valin peab, võib või saab vastavalt olukorra tähendusele vähemalt 8 juhul 10-st.',
    practice: [
      B.categorize('017_p_sort', 'Kohustus, luba või võimalus?', 'Sorteeri laused.', [
        ['Kohustus (peab)', ['Koolis peab kandma vahetusjalatseid.', 'Arve peab maksma reedeks.']], ['Luba (võib)', ['Siin võib istuda.', 'Sa võid tulla hiljem.']], ['Võimalus (saab)', ['Piletit saab osta veebis.', 'Bussiga saab kesklinna.']],
      ]),
      B.wordforms('017_p_inf', 'Õige infinitiiv.', 'Kirjuta tegusõna pärast modaalverbi.', [
        ['pean (minema)', 'ma-vorm', 'minema'], ['võib (istuma)', 'da-vorm', 'istuda'], ['saab (ostma)', 'da-vorm', 'osta'], ['pead (tulema)', 'ma-vorm', 'tulema'], ['võite (sööma)', 'da-vorm', 'süüa'], ['saad (lugema)', 'da-vorm', 'lugeda'],
      ]),
      B.choice('017_p_mean', 'Mida see tähendab?', 'Vali õige tähendus.', [
        ['„Täna ei pea tulema.”', 'Võid tulla, aga see pole kohustus.', 'Tulla on keelatud.', 'Pead kindlasti tulema.'],
        ['„Siin ei või suitsetada.”', 'See on keelatud.', 'See on kohustus.', 'See on hea mõte.'],
        ['„Seda saab teha veebis.”', 'Seda on võimalik teha internetis.', 'Seda peab tegema kontoris.', 'Seda ei tohi teha.'],
        ['„Sa võid minu autot kasutada.”', 'Ma luban sul autot kasutada.', 'Sa pead autoga sõitma.', 'Auto on katki.'],
      ], 'full', 'g_use'),
      B.errorfix('017_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma pean minna arsti juurde.', 'Ma pean minema arsti juurde.'], ['Siin võib istuma.', 'Siin võib istuda.'], ['Piletit saab ostma veebis.', 'Piletit saab osta veebis.'], ['Sa ei pead täna tulema.', 'Sa ei pea täna tulema.'],
      ]),
      B.speaking('017_p_rules', 'Reeglid.', 'Räägi oma kodu, kooli või töö reeglitest.', [
        'Mida peab seal tegema?', 'Mida võib teha?', 'Mida ei või teha?', 'Mida saab teha veebis?',
      ], [60, 90], ['Meil peab…', 'Seal võib…', 'Seal ei või…', 'Seda saab…']),
      B.selfcheck('017_p_self', ['Ma eristan kohustust, luba ja võimalust.', 'Ma tean: peab + ma, võib/saab + da.', 'Ma parandan modaalverbi vead.', 'Ma räägin reeglitest.'], 'Peab, võib, saab'),
    ],
    transfer: [
      B.text('017_t_situation', 'Uus olukord', 'Sinu majja kolib uus pere teisest riigist. Nad ei tea maja reegleid.'),
      B.reading('017_t_rules', 'Maja reeglid.', 'Loe teadet ja vasta.', 'Kase 12 elanikele',
        'Head elanikud! Tuletame meelde maja reegleid. Öörahu on kella kahekümne kahest kuni kella seitsmeni. Sel ajal ei või valjult muusikat kuulata. Prügi peab sorteerima: paber, plastik ja toidujäätmed on eri konteinerites. Jalgrattaid võib hoida keldris, aga mitte trepikojas. Koeraga peab trepikojas olema rihm. Saunat saab broneerida veebis või telefoni teel. Kui midagi on katki, peab sellest kohe teatama majahaldurile. Tema telefoninumber on trepikoja uksel. Hoovis võib lastega mängida, aga autosid ei või hoovis pesta. Aitäh, et hoiate meie maja korras! Teie majaühistu.',
        [['Millal on öörahu?', 'kella 22st kella 7ni|22.00–7.00'], ['Mida peab prügiga tegema?', 'sorteerima'], ['Kus võib jalgrattaid hoida?', 'keldris'], ['Kuidas saab saunat broneerida?', 'veebis või telefoni teel|veebis'], ['Kellele peab teatama, kui midagi on katki?', 'majahaldurile']]),
      B.rolecards('017_t_roles', 'Selgita reegleid.', 'Rääkige 2–3 minutit.',
        'Oled vana elanik. Selgita uuele naabrile 4 reeglit. Kasuta peab, võib, saab.', 'Oled uus naaber. Küsi reeglite kohta: prügi, ratas, koer, saun.',
        ['Siin peab…', 'Keldris võib…', 'Saunat saab…'], ['Kas siin võib…?', 'Kus ma saan…?', 'Mida ma pean tegema, kui…?']),
      B.writing('017_t_note', 'Teade trepikotta.', 'Kirjuta lühike sõbralik teade uutele elanikele. 5–7 lauset.', [5, 7], ['peab', 'võib', 'saab', 'ei või'], 3),
      B.speaking('017_t_compare', 'Siin ja mujal.', 'Võrdle reegleid Eestis ja mõnes teises riigis või kohas.', [
        'Mida peab Eestis tegema, mida mujal ei pea?', 'Mida võib siin, mida mujal ei või?', 'Milline reegel sulle meeldib?',
      ], [60, 90]),
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
      ], ['pean', 'on vaja', 'tahan', 'ei saa', 'ei pea'], 'half'),
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
      B.selfcheck('018_p_self', ['Ma eristan kohustust, vajadust ja soovi.', 'Ma panen ülesanded tähtsuse järjekorda.', 'Ma palun abi.', 'Ma põhjendan prioriteete.'], 'Tean, mis on tähtis'),
    ],
    transfer: [
      B.listening('018_t_voice', 'Ema häälsõnum.', 'Õpetaja loeb häälsõnumi. Täida lüngad.', [
        'Tere, kallis! Mul on täna õhtul koosolek ja ma jõuan koju alles kell kaheksa.', 'Palun too vend kella viieks trennist koju.', 'Sa ei pea süüa tegema, supp on külmkapis.', 'Aga sul on vaja poest leiba osta.', 'Koeraga peab enne pimedat jalutama.',
      ], ['Ema jõuab koju kell [kaheksa|8].', 'Venna peab tooma [trennist].', 'Süüa ei [pea] tegema.', 'Poest on vaja osta [leiba].', 'Koeraga peab jalutama enne [pimedat].']),
      B.text('018_t_situation', 'Uus olukord', 'Sul on homme väga kiire päev. Sõber palub abi kolimisel. Pead otsustama ja oma plaani selgitama.'),
      B.planning('018_t_plan', 'Minu homme.', 'Kirjuta homsed ülesanded tähtsuse järjekorras.', ['Mida ma pean kindlasti tegema?', 'Mida mul on vaja teha?', 'Mis võib oodata?', 'Kas ma saan sõpra aidata?']),
      B.letter('018_t_msg', 'Vasta sõbrale.', 'Selgita oma päeva. Ütle, millal saad aidata. 50–70 sõna.', 'Tere, Mart!', 'Kuni homseni!', [50, 70]),
      B.rolecards('018_t_roles', 'Kolleegid jagavad tööd.', 'Teil on 5 ülesannet ja vähe aega. Jagage need ära.',
        'Sul on kiire aruanne. Selgita, mida pead tegema ja mida ei saa teha.', 'Sul on rohkem aega. Paku abi ja küsi prioriteete.',
        ['Ma pean…', 'Mul ei ole aega…', 'Kõige kiirem on…'], ['Mida ma saan teha?', 'Mis on kõige tähtsam?', 'Ma võin…']),
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
      B.dialogue('019_p_phone', 'Telefonikõne.', 'Täida dialoog.', 'Liina', 'Arst', [
        ['A', 'Tere! Ma soovin [aega] hambaarsti juurde.'], ['B', 'Kas teile [sobib] teisipäeval kell kümme?'], ['A', '[Kahjuks] ei saa, mul on siis tööl koosolek.'],
        ['B', 'Aga kuidas [oleks] kolmapäeval kell neli?'], ['A', 'See [sobib] küll. Aitäh!'],
      ]),
      B.wordorder('019_p_order', 'Viisakas vastus.', 'Pane laused kokku.', [
        'Kas sulle sobib reedel kell viis?', 'Kahjuks ma ei saa reedel tulla.', 'Aga kuidas oleks laupäeva hommikul?', 'Sobib küll, lepime kokku.',
      ]),
      B.choice('019_p_react', 'Mis on viisakas?', 'Vali kõige parem vastus.', [
        ['„Kas sulle sobib homme kell kolm?” (sul on trenn)', 'Kahjuks ei saa, mul on trenn. Kas kell viis sobib?', 'Ei.', 'Ma ei taha sinuga kohtuda.'],
        ['„Kas saad mind kolimisel aidata?” (oled vaba)', 'Muidugi, mis kell ma tulen?', 'Ma ei tea.', 'Kahjuks ei saa.'],
        ['Sa pead kohtumise tühistama.', 'Vabandust, mul tuli midagi vahele. Kas saame teisel päeval kohtuda?', 'Ma ei tule.', 'Pole minu probleem.'],
        ['„Kuidas oleks pühapäeval?” (sobib)', 'Sobib küll! Kus kohtume?', 'Võib-olla, ma ei tea.', 'Ei sobi kunagi.'],
      ], 'full', 'g_use'),
      B.translation('019_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta viisakas lause.', ['Тебе подходит в среду в пять?', 'К сожалению, я не могу.', 'А как насчёт четверга?', 'Договорились!']),
      B.speaking('019_p_three', 'Kolm dialoogi.', 'Pidage paaris kolm lühikest kokkulepet: kino, arst, sõbra sünnipäev.', [
        'Mida sa pakud?', 'Miks esimene aeg ei sobi?', 'Milline on uus aeg?', 'Milline on kokkulepe?',
      ], [60, 120], ['Kas sulle sobib…?', 'Kahjuks ei saa, sest…', 'Aga kuidas oleks…?', 'Lepime kokku.']),
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
        ['„Laupäev mulle ei sobi.”', 'Mis päev sulle sobib?', 'Hästi, siis laupäeval.', 'Head aega!'],
        ['„Pühapäev sobib, aga alles kell kuus.”', 'Sobib, kohtume kell kuus.', 'Kell kuus on hommik.', 'Ma ei saa aru.'],
        ['„Kus me kohtume?”', 'Kino ees, kell kuus.', 'Kohtume.', 'Pühapäeval.'],
      ], 'full', 'g_use'),
      B.selfcheck('019_t_self', ['Ma planeerin oma nädala.', 'Ma pidasin 3 kõnet lõpuni.', 'Ma vabandan ja pakun uut aega kirjas.', 'Ma lõpetan kokkuleppe täpselt: aeg ja koht.'], 'Nädal on kokku lepitud'),
    ],
  },

  'a2b1-020': {
    title: 'Vahehindamine 1 — A2 baas',
    canDo: 'Ma lahendan igapäevaelu, pere, linna ja kohustuste ülesandeid iseseisvalt ning suhtlen arusaadavalt.',
    practice: [
      B.tip('020_p_how', 'Vahehindamise kordamine', 'See leht kordab moodulid 1–4. Tee kõik ilma abita, märgi kahtlased kohad küsimärgiga ja küsi neid õpetajalt.', 'full'),
      B.gaps('020_p_mix', 'Grammatika segamini.', 'Kirjuta õige vorm.', [
        'Ma lähen pärast tööd [apteeki] (apteek).', 'See on minu [venna] (vend) auto.', 'Sa [pead] arve täna maksma.', 'Siin [võib] istuda.', 'Ma tulen kell viis [töölt] (töö).', '[Tal on] pikad juuksed.',
      ]),
      B.errorfix('020_p_fix', 'Paranda viis viga.', 'Kirjuta laused õigesti.', [
        ['Ma pean minna koju.', 'Ma pean minema koju.'], ['Raamat on laud.', 'Raamat on laual.'], ['See on minu sõber auto.', 'See on minu sõbra auto.'], ['Ta on prillid.', 'Tal on prillid.'], ['Ma lähen kodus.', 'Ma lähen koju.'],
      ]),
      B.manymatch('020_p_topics', 'Mis teema?', 'Ühenda väljend ja teema. Mõni sobib mitmele.', ['Kas sulle sobib…?', 'Pööra vasakule.', 'Ta on hooliv.', 'Ma pean…', 'apteegis'], ['kokkulepe', 'linn', 'inimesed', 'kohustused']),
      B.reading('020_p_read', 'Loe ja vasta.', 'Loe tekst. Vasta lühidalt.', 'Liisi laupäev',
        'Liisi ärkab laupäeval kell kaheksa. Kõigepealt jookseb ta pargis. Siis sööb ta hommikust oma vanemate juures, sest nad elavad lähedal. Pärast hommikusööki peab Liisi minema postkontorisse ja apteeki. Lõuna ajal helistab sõbranna Kadri ja küsib, kas Liisi saab kell kolm kinno tulla. Kahjuks Liisi ei saa, sest ta peab venna lapsi hoidma. Ta pakub, et nad lähevad hoopis kell seitse. Kadrile see sobib. Enne kino läheb Liisi koju ja puhkab natuke. Õhtul kohtuvad nad kino ees. Film on naljakas ja pärast seda joovad nad kohvikus teed. Liisi jõuab koju alles kell üksteist.',
        [['Mida teeb Liisi kõigepealt?', 'jookseb pargis|jookseb'], ['Miks sööb ta vanemate juures?', 'nad elavad lähedal'], ['Kuhu peab Liisi minema?', 'postkontorisse ja apteeki'], ['Miks ei saa ta kell kolm?', 'ta peab venna lapsi hoidma|peab lapsi hoidma'], ['Mis kell nad kinno lähevad?', 'seitse|kell seitse|19.00']]),
      B.speaking('020_p_three', '3 minutit rääkimist.', 'Räägi 3 minutit: sina, sinu pere, sinu kodu ja nädal.', ['Kes sa oled ja kus elad?', 'Kes on sinu pere?', 'Milline on sinu kodu ja kodukoht?', 'Mida sa pead sel nädalal tegema?'], [90, 120]),
      B.selfcheck('020_p_self', ['Ma kordasin moodulid 1–4.', 'Ma märkisin kahtlased kohad.', 'Ma rääkisin 3 minutit.', 'Ma tean, mida enne vahehindamist korrata.'], 'Valmis vahehindamiseks'),
    ],
    transfer: [
      B.text('020_t_situation', 'Vahehindamine: kaks olukorda', 'Sa oled uus elanik väikeses linnas. Täna lahendad kaks igapäevast olukorda ja kirjutad kirja.'),
      B.rolecards('020_t_s1', '1. olukord: naaber ja kokkulepe.', 'Rääkige 2 minutit.',
        'Tutvusta ennast uuele naabrile. Leppige kokku ühine tegevus. Esimene aeg ei sobi.', 'Oled naaber. Küsi, kes ta on ja kellega elab. Paku ühist tegevust ja uut aega.',
        ['Minu nimi on…', 'Kas teile sobib…?'], ['Kellega te elate?', 'Kahjuks ei saa…', 'Aga kuidas oleks…?']),
      B.rolecards('020_t_s2', '2. olukord: linnas.', 'Rääkige 2 minutit.',
        'Sul on vaja apteeki ja postkontorisse. Küsi teed ja kellaaegu.', 'Oled kohalik. Juhata teed ja ütle, mis kell kohad on avatud.',
        ['Kuidas ma saan…?', 'Mis kell … sulgub?'], ['Mine…', 'See on avatud alates … kuni…']),
      B.letter('020_t_letter', 'Kiri sõbrale (80–100 sõna).', 'Kirjuta uuest kodust, linnast ja oma nädalast.', 'Tere!', 'Kirjuta mulle!', [80, 100]),
      B.speaking('020_t_mono', 'Monoloog: minu uus elu.', 'Räägi 2 minutit ilma tekstita.', ['Kus sa nüüd elad?', 'Milline on sinu kodu?', 'Mida sa linnas teed?', 'Mida sa pead järgmisel nädalal tegema?'], [90, 120]),
      B.rubric('020_t_rubric', 'Hindamise tingimused.', 'Märgi, mis on täidetud.', ['Kirjas on kodu, linn ja nädal.', 'Vähemalt 3 kohavormi (kus, kuhu, kust).', 'Vähemalt 2 modaalverbi (peab, võib, saab).', 'Vähemalt 4 ajamarkerit.', 'Mõlemas olukorras jõudsin kokkuleppe või lahenduseni.']),
      B.selfcheck('020_t_self', ['Ma lahendasin kaks olukorda.', 'Ma kirjutasin 80–100 sõna.', 'Ma kasutasin moodulite 1–4 keelt.', 'Ma tean oma tugevust ja nõrkust.'], 'A2 baas on käes'),
    ],
  },
};
