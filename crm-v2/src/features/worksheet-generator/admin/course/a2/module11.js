// A2 course (A1 → A2 roadmap), module 11 „Ilm, aastaajad ja riided”, lessons a2-051 … a2-055. Weather and the
// seasons: weather adjectives in -ne (päikeseline, pilvine, vihmane, lumine, tuuline), sajab vihma / lund, puhub tuul,
// paistab päike, kevadel / suvel / sügisel / talvel; the comparative in -m + kui (soojem, külmem, parem, odavam kui);
// the weather forecast (temperatuur, kraadi sooja / külma, pluss / miinus, hommikul / öösel); advice on clothes with
// the sa-imperative (pane jope selga, võta vihmavari kaasa, ära unusta kindaid) and a reason with sest. Harno A2
// formats: forecasts to listen to with 1–2-word answers, a forecast and a message to read, a message of 30–50 words.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-11', course: 'a2', title: 'Ilm, aastaajad ja riided', level: 'A2' };

export const LESSONS = {
  'a2-051': {
    title: 'Ilm ja aastaajad',
    canDo: 'Ma kirjeldan tänast ilma 3–4 lausega (päikeseline, pilvine, sajab vihma, puhub tuul, on soe / külm) ja räägin oma lemmik aastaajast.',
    discover: [
      B.text('051_d_situation', 'Mis ilm täna on?', 'Esmaspäeva hommikul tuleb Jaan kursusele märjana. Õues sajab vihma ja puhub tugev tuul. Sofia vaatab aknast välja ja ütleb: „Eile paistis päike. Eesti ilm on huvitav!” Täna räägime ilmast ja aastaaegadest.'),
      B.vocab('051_d_vocab', 'Ilm ja aastaajad', ['ilm — погода', 'aastaaeg — время года', 'kevad — весна', 'suvi — лето', 'sügis — осень', 'talv — зима', 'päikeseline — солнечный', 'pilvine — облачный', 'vihmane — дождливый', 'lumine — снежный', 'tuuline — ветреный', 'soe — тёплый', 'külm — холодный', 'palav — жаркий']),
      B.reading('051_d_read', 'Loe: Neli aastaaega.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Neli aastaaega Eestis',
        'Eestis on neli aastaaega: kevad, suvi, sügis ja talv. Kevad algab märtsis. Kevadel läheb ilm iga päevaga soojemaks. Lumi sulab ja päike paistab rohkem. Aprillis on sageli tuuline ja jahe. Suvi on juunis, juulis ja augustis. Suvel on tavaliselt soe, umbes kakskümmend kraadi. Mõnikord on väga palav, isegi kolmkümmend kraadi. Päevad on pikad ja ööd on valged. Sügisel on ilm vihmane ja pilvine. Puudel on kollased ja punased lehed. Novembris on väga pime. Talv on detsembris, jaanuaris ja veebruaris. Talvel on külm ja sajab lund. Mõnikord on kakskümmend kraadi külma. Talvel on päevad lühikesed ja ööd pikad. Lapsed armastavad talve, sest siis saab suusatada ja kelgutada. Paljude eestlaste lemmik aastaaeg on suvi. Aga Sofia lemmik aastaaeg on sügis. Talle meeldivad värvilised puud ja vaikne vihm.',
        [['Millal algab kevad?', 'märtsis'], ['Mis ilm on aprillis?', 'tuuline ja jahe'], ['Kui soe on suvel tavaliselt?', 'umbes kakskümmend kraadi|20 kraadi|kakskümmend kraadi'], ['Mis ilm on sügisel?', 'vihmane ja pilvine'], ['Miks lapsed armastavad talve?', 'saab suusatada ja kelgutada|sest siis saab suusatada'], ['Mis on Sofia lemmik aastaaeg?', 'sügis']]),
      B.truefalse('051_d_tf', 'Õige või vale?', 'Loe teksti uuesti.', [
        ['Kevad algab Eestis märtsis.', true], ['Suvel on päevad lühikesed.', false], ['Sügisel on puudel kollased lehed.', true],
        ['Novembris on väga valge.', false], ['Talvel võib olla kakskümmend kraadi külma.', true],
      ]),
      B.notice('051_d_notice', 'Märka: kuidas rääkida ilmast?', ['**Täna on** päikeseline / pilvine / tuuline **ilm**.', '**Sajab** vihma / lund. **Puhub** tuul. **Paistab** päike.', '**On** soe / külm / palav. On kümme **kraadi sooja** / **külma**.', 'päike → päikese**line**, pilv → pilv**ine**, vihm → vihma**ne**', 'Millal? kevad**el**, suve**l**, sügise**l**, talve**l**']),
      B.categorize('051_d_sort', 'Mis aastaaeg?', 'Pane sõnad aastaaja juurde, mis neile kõige paremini sobib.', [
        ['Kevad', ['lumi sulab', 'märts', 'esimesed lilled']], ['Suvi', ['palav', 'valged ööd', 'juuli']], ['Sügis', ['kollased lehed', 'november', 'vihmane']], ['Talv', ['suusatama', 'jaanuar', 'sajab lund']],
      ]),
      B.match('051_d_match', 'Mis ilm on?', 'Ühenda lause ja sõna.', [
        ['Päike paistab terve päeva.', 'päikeseline'], ['Taevas on hall, päikest ei ole.', 'pilvine'], ['Sajab terve päeva vihma.', 'vihmane'],
        ['Kõik on valge, sajab lund.', 'lumine'], ['Tuul puhub väga tugevalt.', 'tuuline'], ['On kolmkümmend kraadi sooja.', 'palav'],
      ]),
      B.gaps('051_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Täna [sajab] vihma.', 'Mere ääres [puhub] tugev tuul.', 'Suvel [paistab] päike kaua.', 'Talvel on [külm].',
        'Juulis on ilm [palav].', 'Minu lemmik [aastaaeg] on kevad.',
      ], ['sajab', 'puhub', 'paistab', 'külm', 'palav', 'aastaaeg', 'pilv', 'lumi']),
      B.wordforms('051_d_forms', 'Nimisõnast omadussõna.', 'Kirjuta omadussõna: … ilm.', [
        ['päike', '… ilm', 'päikeseline'], ['pilv', '… ilm', 'pilvine'], ['vihm', '… ilm', 'vihmane'],
        ['lumi', '… ilm', 'lumine'], ['tuul', '… ilm', 'tuuline'], ['udu', '… ilm', 'udune'],
      ]),
      B.wordorder('051_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Täna on pilvine ilm.', 'Talvel sajab Eestis lund.', 'Mere ääres puhub tugev tuul.', 'Minu lemmik aastaaeg on suvi.', 'Kevadel läheb ilm soojemaks.']),
      B.errorfix('051_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Täna sajab vihm.', 'Täna sajab vihma.'], ['Talv on külm ja sajab lumi.', 'Talvel on külm ja sajab lund.'], ['Suves on palav.', 'Suvel on palav.'],
        ['Täna on päike ilm.', 'Täna on päikeseline ilm.'], ['On viis kraad sooja.', 'On viis kraadi sooja.'],
      ]),
      B.translation('051_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сегодня солнечная погода.', 'Идёт снег.', 'Летом обычно тепло.', 'Осенью часто идёт дождь.', 'Моё любимое время года — весна.']),
      B.dictation('051_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Täna on pilvine ja tuuline ilm.', 'Talvel sajab lund.', 'Suvel on kakskümmend kraadi sooja.', 'Sügisel sajab sageli vihma.', 'Minu lemmik aastaaeg on talv.'], 5),
      B.speaking('051_d_say', 'Ilm ja mina.', 'Räägi paarilisele ilmast umbes üks minut.', ['Mis ilm täna on?', 'Mis ilm oli eile?', 'Mis on sinu lemmik aastaaeg ja miks?', 'Mis ilm on sinu kodumaal talvel?'], [60, 90], ['Täna on … ilm.', 'Sajab … / Puhub …', 'Mulle meeldib …, sest …']),
      B.writing('051_d_write', 'Minu lemmik aastaaeg.', 'Kirjuta 5–7 lauset: mis ilm on sinu lemmik aastaajal ja mida sa siis teed.', [5, 7], ['ilm', 'soe', 'sajab', 'meeldib'], 2),
      B.selfcheck('051_d_self', ['Ma nimetan neli aastaaega ja nende ilma.', 'Ma ütlen: sajab vihma, puhub tuul, paistab päike.', 'Ma moodustan sõnu päikeseline, pilvine, vihmane.', 'Ma räägin oma lemmik aastaajast.'], 'Ilm on selge'),
    ],
    practice: [
      B.listening('051_p_listen', 'Kuulamine. Liisi aastaajad.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis ja ma räägin aastaaegadest.', 'Kevadel ma käin pargis jalutamas, sest siis on värske õhk.', 'Suvel on minu kodus Pärnus palav, tavaliselt kakskümmend viis kraadi.',
        'Sügis mulle ei meeldi, sest siis sajab palju vihma.', 'Talvel ma suusatan Otepääl. Seal on palju lund.', 'Minu lemmik kuu on juuli.',
      ], [
        'Kevadel jalutab Liis [pargis].', 'Liisi kodu on [Pärnus].', 'Suvel on seal tavaliselt [kakskümmend viis|25] kraadi.',
        'Sügisel sajab palju [vihma].', 'Talvel suusatab Liis [Otepääl].', 'Liisi lemmik kuu on [juuli].',
      ]),
      B.crossword('051_p_cross', 'Ilma sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Valge, sajab talvel', 'lumi'], ['Aastaaeg pärast talve', 'kevad'], ['Väga soe', 'palav'], ['Sellega mõõdame temperatuuri', 'kraad'], ['Hall taevas, päikest ei ole', 'pilvine'], ['Aastaaeg, kui puud on kollased', 'sügis'],
      ]),
      B.gaps('051_p_gaps', 'Millal?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        '[Talvel] on Eestis külm. (talv)', '[Suvel] me käime ujumas. (suvi)', '[Sügisel] sajab palju vihma. (sügis)',
        '[Kevadel] sulab lumi. (kevad)', 'Mis ilm on [jaanuaris]? (jaanuar)', 'Ööd on valged [juunis]. (juuni)',
      ]),
      B.transformation('051_p_trans', 'Ütle teisiti.', 'Kirjuta lause uue alguse järgi.', [
        ['Täna on vihmane ilm.', 'Täna sajab …', 'Täna sajab vihma.'], ['Täna on lumine ilm.', 'Täna sajab …', 'Täna sajab lund.'],
        ['Täna on tuuline ilm.', 'Täna puhub …', 'Täna puhub tuul.|Täna puhub tugev tuul.'], ['Täna on päikeseline ilm.', 'Täna paistab …', 'Täna paistab päike.'],
        ['Täna sajab vihma.', 'Täna on … ilm.', 'Täna on vihmane ilm.'],
      ]),
      B.choice('051_p_choice', 'Mis on loogiline?', 'Vali sobiv sõna.', [
        ['Juulis on Eestis tavaliselt ___.', 'soe', 'lumine', 'pakane'], ['Jaanuaris ___ sageli lund.', 'sajab', 'paistab', 'puhub'],
        ['Mere ääres on tihti ___.', 'tuuline', 'palav ja lumine', 'kuiv vihm'], ['Taevas on hall. Ilm on ___.', 'pilvine', 'päikeseline', 'palav'],
        ['Puud on kollased. On ___.', 'sügis', 'kevad', 'talv'],
      ], 'full', 'g_vocab'),
      B.wordorder('051_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Talvel suusatab Liis Otepääl.', 'Kevadel on värske õhk.', 'Sügisel sajab palju vihma.', 'Mis ilm täna on?', 'Juulis on tavaliselt palav.']),
      B.errorfix('051_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Talves on külm.', 'Talvel on külm.'], ['Täna paistab päikeseline.', 'Täna paistab päike.'], ['Sajab lumi.', 'Sajab lund.'],
        ['Täna on pilv ilm.', 'Täna on pilvine ilm.'], ['Suvel on kakskümmend kraadi soe.', 'Suvel on kakskümmend kraadi sooja.'], ['Puhub tugevat tuult.', 'Puhub tugev tuul.'],
      ]),
      B.table('051_p_table', 'Aastaajad minu kodus.', 'Kirjuta: mis ilm on sinu kodus ja mida sa siis teed.', 'Aastaaeg, Mis ilm?, Mida ma teen?', ['Kevad | | ', 'Suvi | | ', 'Sügis | | ', 'Talv | | ']),
      B.dictation('051_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kevadel sulab lumi.', 'Suvel on ööd valged.', 'Sügisel on puud kollased.', 'Talvel on pakane.', 'Täna paistab päike.'], 5),
      B.translation('051_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Какая сегодня погода?', 'Дует сильный ветер.', 'Зимой я катаюсь на лыжах.', 'Осень мне не нравится.', 'Летом жарко.', 'Весной тает снег.']),
      B.speaking('051_p_say', 'Küsi ilma kohta.', 'Küsi paariliselt tema kodumaa ilma kohta. Siis räägi grupile.', ['Mis ilm on sinu kodumaal suvel?', 'Kas talvel sajab lund?', 'Mis kuu on kõige külmem?', 'Mis on sinu lemmik aastaaeg?'], [60, 120], ['Tema kodus on suvel…', 'Talvel sajab…']),
      B.writing('051_p_write', 'Tänane ilm.', 'Kirjuta 5–7 lauset: mis ilm on täna ja eile, mida sa teed.', [5, 7], ['täna', 'eile', 'sajab', 'kraadi'], 2),
      B.selfcheck('051_p_self', ['Ma kuulen, mis ilm on eri aastaaegadel.', 'Ma ütlen: talvel, suvel, kevadel, sügisel.', 'Ma ütlen ilma kahel viisil: vihmane ilm / sajab vihma.', 'Ma kirjutan tänasest ilmast.'], 'Ilmasõnad on käes'),
    ],
    transfer: [
      B.text('051_t_situation', 'Uus olukord', 'On reede õhtu. Jaan ja Sofia tahavad nädalavahetusel midagi koos teha. Aknast on näha vihmapilvi, aga natuke paistab ka päike. Nad loevad ilmaennustust ja valivad tegevuse.'),
      B.reading('051_t_read', 'Loe ilmaennustust.', 'Loe teksti ja vasta küsimustele.', 'Nädalavahetuse ilm Tartus',
        'Siin on Tartu ilm nädalavahetuseks. Laupäeva hommikul on pilvine ja jahe, umbes kümme kraadi sooja. Lõuna paiku hakkab sadama vihma. Vihm sajab terve pärastlõuna. Puhub tugev tuul. Õhtul vihm lõpeb, aga on külm, ainult viis kraadi. Laupäeval on parem olla toas, näiteks muuseumis või kinos. Pühapäeval on palju parem ilm. Hommikul on natuke udune. Kella kümnest paistab päike. Päeval on kuni viisteist kraadi sooja. Tuul on nõrk. Õhtul on pilvine, aga vihma ei saja. Pühapäev on hea päev rattasõiduks või jalutuskäiguks. Järgmisel nädalal läheb ilm jälle külmemaks. Esmaspäeval võib sadada esimest lund. Siis on vaja sooja jopet ja mütsi.',
        [['Mis ilm on laupäeva hommikul?', 'pilvine ja jahe'], ['Millal hakkab laupäeval vihma sadama?', 'lõuna paiku|lõunal'], ['Kui soe on laupäeva õhtul?', 'viis kraadi|5 kraadi'], ['Mis kellast paistab pühapäeval päike?', 'kella kümnest|kümnest'], ['Mis võib sadada esmaspäeval?', 'lund|esimest lund']]),
      B.choice('051_t_choice', 'Mis päev sobib?', 'Loe ennustust. Vali sobiv aeg.', [
        ['Jaan tahab sõita rattaga. Millal?', 'pühapäeval päeval', 'laupäeva pärastlõunal', 'laupäeva õhtul'],
        ['Sofia tahab muuseumi minna. Millal sobib?', 'laupäeva pärastlõunal', 'esmaspäeva öösel', 'mitte kunagi'],
        ['Mia tahab pargis mängida. Millal?', 'pühapäeval', 'laupäeval', 'esmaspäeval'],
        ['Millal on vaja vihmavarju?', 'laupäeva pärastlõunal', 'pühapäeva päeval', 'pühapäeva õhtul'],
        ['Millal on kõige külmem?', 'laupäeva õhtul', 'pühapäeva päeval', 'laupäeva hommikul'],
      ]),
      B.table('051_t_table', 'Meie nädalavahetus.', 'Kirjuta tabelisse ilm ja sobiv tegevus.', 'Aeg, Ilm, Tegevus', ['Laupäeva hommik | | ', 'Laupäeva pärastlõuna | | ', 'Pühapäeva päev | | ', 'Pühapäeva õhtu | | ']),
      B.gaps('051_t_gaps', 'Sõnumi laused.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Laupäeval [sajab] vihma. (sadama)', 'Pühapäeval on [päikeseline] ilm. (päike)', 'Hommikul on natuke [udune]. (udu)',
        'Päeval on viisteist kraadi [sooja]. (soe)', 'Laupäeval [puhub] tugev tuul. (puhuma)', '[Pühapäeval] läheme rattaga sõitma. (pühapäev)',
      ]),
      B.errorfix('051_t_fix', 'Kontrolli sõnumit.', 'Sõnumis on vead. Kirjuta lause õigesti.', [
        ['Laupäeval sajab vihm.', 'Laupäeval sajab vihma.'], ['Pühapäeval on päike ilm.', 'Pühapäeval on päikeseline ilm.'], ['On viisteist kraadi soe.', 'On viisteist kraadi sooja.'],
        ['Esmaspäeval võib sadada lumi.', 'Esmaspäeval võib sadada lund.'], ['Talves ma suusatan.', 'Talvel ma suusatan.'],
      ]),
      B.planning('051_t_plan', 'Enne kirjutamist.', 'Mõtle läbi: mida te teete ja millal?', ['Mis ilm on laupäeval?', 'Mis ilm on pühapäeval?', 'Mida te laupäeval teete?', 'Mida te pühapäeval teete?'], 2),
      B.letter('051_t_letter', 'Sõnum sõbrale.', 'Kirjuta 30–50 sõna: milline ilm tuleb ja mida te teete.', 'Tere!', 'Kohtumiseni!', [30, 50]),
      B.rolecards('051_t_roles', 'Plaan ja ilm.', 'Leppige ilma järgi kokku, mida ja millal teha.', 'Oled Jaan. Sa tahad laupäeval sõita rattaga. Sa ei ole ennustust lugenud.', 'Oled Sofia. Sa lugesid ilmaennustust. Ütle, mis ilm tuleb, ja paku parem aeg.', ['Lähme laupäeval…', 'Mis ilm siis on?'], ['Laupäeval sajab…', 'Pühapäeval paistab…']),
      B.speaking('051_t_say', 'Ilm minu kodumaal.', 'Räägi grupile, mis ilm on sinu kodumaal ja Eestis.', ['Mis ilm on täna Eestis?', 'Mis ilm on praegu sinu kodumaal?', 'Mis aastaaeg on Eestis kõige raskem?', 'Mida sa siis teed?'], [60, 120]),
      B.writing('051_t_write', 'Postkaart.', 'Kirjuta sõbrale 5–6 lauset: mis ilm on Eestis sel nädalal.', [5, 6], ['ilm', 'kraadi', 'sajab', 'paistab'], 2),
      B.rubric('051_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on ilm, päev ja tegevus (30–50 sõna).', 'Ilmasõnad on õiged: sajab vihma, paistab päike, on … kraadi sooja.', 'Tegevus sobib ilmaga.', 'Paaristöös lepiti kokku päev ja tegevus.']),
      B.selfcheck('051_t_self', ['Ma loen nädalavahetuse ilmaennustust.', 'Ma valin ilma järgi sobiva tegevuse.', 'Ma kirjutan sõbrale ilmast ja plaanist.', 'Ma räägin oma kodumaa ilmast.'], 'Plaan on ilmaga kooskõlas'),
    ],
  },

  'a2-052': {
    title: 'Võrdlus: soojem, külmem',
    canDo: 'Ma võrdlen kahte päeva, linna või riideeset keskvõrdega (soojem, külmem, parem, odavam kui) ja valin parema variandi põhjusega.',
    discover: [
      B.text('052_d_situation', 'Tallinn või Tartu?', 'Anna elab Tallinnas, Viktor elab Tartus. Telefonis vaidlevad nad, kus on parem ilm. Anna ütleb: „Meil on täna soojem!” Viktor vastab: „Aga meil on päikest rohkem!”'),
      B.dialogue('052_d_dialog', 'Telefonis.', 'Loe dialoogi. Täida lüngad.', 'Anna', 'Viktor', [
        ['A', 'Tere, Viktor! Mis ilm Tartus on?'], ['B', 'Päike paistab, aga on külm. Ainult kolm kraadi [sooja].'], ['A', 'Tallinnas on [soojem], meil on kuus kraadi.'],
        ['B', 'Aga Tallinnas on alati [tuulisem] kui Tartus.'], ['A', 'See on tõsi. Mere ääres puhub tugev [tuul].'], ['B', 'Tartus on talvel [külmem], aga lund on rohkem.'],
        ['A', 'Mulle meeldib lumi. Talvel tulen ma teile [külla]!'],
      ]),
      B.vocab('052_d_vocab', 'Võrdlemine', ['võrdlema — сравнивать', 'kui — чем', 'soojem — теплее', 'külmem — холоднее', 'parem — лучше', 'halvem — хуже', 'suurem — больше', 'väiksem — меньше', 'odavam — дешевле', 'kallim — дороже', 'pikem — длиннее', 'lühem — короче', 'rohkem — больше', 'vähem — меньше']),
      B.reading('052_d_read', 'Loe: Kaks linna.', 'Loe teksti ja vasta küsimustele.', 'Tallinn ja Tartu',
        'Tallinn ja Tartu on Eesti kaks suurimat linna. Tallinn on suurem kui Tartu. Tallinnas elab umbes nelisada tuhat inimest, Tartus umbes sada tuhat. Tallinn on mere ääres. Seepärast on seal tuulisem. Talvel on Tallinnas tavaliselt soojem kui Tartus. Tartus on talv külmem ja lumi on kauem maas. Suvel on Tartus aga sageli palavam. Tartu on rahulikum linn. Seal on palju üliõpilasi. Korterid on Tartus odavamad kui Tallinnas. Ka kohvikus on kohv natuke odavam. Viktor ütleb, et Tartu on parem, sest seal on vaiksem. Anna arvab, et Tallinn on parem. Seal on rohkem tööd ja meri on lähedal. Kumb linn on sinu arvates parem?',
        [['Kumb linn on suurem?', 'Tallinn'], ['Miks on Tallinnas tuulisem?', 'Tallinn on mere ääres|sest see on mere ääres'], ['Kus on talvel külmem?', 'Tartus'], ['Kus on korterid odavamad?', 'Tartus'], ['Miks on Viktori arvates Tartu parem?', 'seal on vaiksem|sest seal on vaiksem'], ['Miks meeldib Annale Tallinn?', 'rohkem tööd ja meri on lähedal|seal on rohkem tööd']]),
      B.notice('052_d_notice', 'Märka: keskvõrre', ['soe → soo**ja** → soo**jem**; külm → külm**a** → külm**em**', 'odav → odav**a** → odav**am**; suur → suur**e** → suur**em**', '**hea → parem**, **halb → halvem** (erandid!)', 'Tallinn on suurem **kui** Tartu.', 'Täna on soojem **kui** eile.', 'Mitmus: korterid on odava**mad**.']),
      B.diagram('052_d_map', 'mind', { title: 'Keskvõrre', instruction: 'Kirjuta puuduvad vormid.', center: '-m', nodes: 'soe\n- [soojem]\nkülm\n- [külmem]\nsuur\n- [suurem]\nodav\n- [odavam]\nhea\n- [parem]\nhalb\n- [halvem]' }, 'full'),
      B.choice('052_d_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Täna on ___ kui eile.', 'soojem', 'soe', 'soojam'], ['Tallinn on suurem ___ Tartu.', 'kui', 'kas', 'nagu'],
        ['See jope on ___ kui too.', 'parem', 'heam', 'hea'], ['Talvel on päevad ___.', 'lühemad', 'lühem', 'lühikesed kui'],
        ['Tartus on korterid ___ kui Tallinnas.', 'odavamad', 'odavam', 'odav'],
      ], 'full', 'g_notice'),
      B.gaps('052_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Tallinn on [suurem] kui Tartu.', 'Talvel on Tartus [külmem] kui Tallinnas.', 'Tartus on korterid [odavamad].', 'Tallinnas on [rohkem] tööd.',
        'Täna on ilm [parem] kui eile.', 'Suvel on päevad [pikemad] kui talvel.',
      ], ['suurem', 'külmem', 'odavamad', 'rohkem', 'parem', 'pikemad', 'heam', 'väike']),
      B.transformation('052_d_trans', 'Võrdle.', 'Kirjuta üks lause sõnaga „kui”.', [
        ['Tallinn on suur. Tartu on väike.', 'Tallinn on …', 'Tallinn on suurem kui Tartu.'], ['Täna on soe. Eile oli külm.', 'Täna on …', 'Täna on soojem kui eile.'],
        ['See müts on odav. Too müts on kallis.', 'See müts on …', 'See müts on odavam kui too.'], ['Juuli on hea. November on halb.', 'Juuli on …', 'Juuli on parem kui november.'],
        ['Suvel on päevad pikad. Talvel on lühikesed.', 'Suvel on päevad …', 'Suvel on päevad pikemad kui talvel.'],
      ]),
      B.errorfix('052_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Täna on soem kui eile.', 'Täna on soojem kui eile.'], ['See jope on heam.', 'See jope on parem.'], ['Tallinn on suurem nagu Tartu.', 'Tallinn on suurem kui Tartu.'],
        ['Talvel on päevad lühem.', 'Talvel on päevad lühemad.'], ['Tartus on külmem kui Tallinn.', 'Tartus on külmem kui Tallinnas.'],
      ]),
      B.table('052_d_table', 'Leia tekstist.', 'Kirjuta, kumb linn. Vasta tekstist.', 'Väide, Tallinn või Tartu?', ['On suurem | [Tallinn]', 'On tuulisem | [Tallinn]', 'Talvel on külmem | [Tartu]', 'Korterid on odavamad | [Tartu]', 'On vaiksem | [Tartu]', 'On rohkem tööd | [Tallinn]']),
      B.wordorder('052_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Tallinn on suurem kui Tartu.', 'Tartus on talvel külmem.', 'Korterid on Tartus odavamad.', 'Täna on soojem kui eile.', 'Kumb linn on parem?']),
      B.dictation('052_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Täna on soojem kui eile.', 'Tallinn on suurem kui Tartu.', 'See jope on parem.', 'Talvel on päevad lühemad.', 'Tartus on korterid odavamad.'], 5),
      B.translation('052_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сегодня теплее, чем вчера.', 'Таллин больше, чем Тарту.', 'Эта куртка лучше.', 'Зимой дни короче.', 'В Тарту квартиры дешевле.']),
      B.speaking('052_d_say', 'Kumb on parem?', 'Võrdle paarilisega kahte linna või kahte aastaaega.', ['Kumb linn on suurem?', 'Kus on soojem või külmem?', 'Kus on elu odavam?', 'Kumb on sinu arvates parem ja miks?'], [60, 120], ['… on suurem kui …', 'Minu arvates on … parem, sest …']),
      B.writing('052_d_write', 'Kaks kohta.', 'Kirjuta 5–7 lauset: võrdle oma kodulinna ja Tallinna.', [5, 7], ['suurem', 'kui', 'soojem', 'parem'], 3),
      B.selfcheck('052_d_self', ['Ma moodustan keskvõrde: soojem, külmem, odavam.', 'Ma tean erandeid: parem, halvem.', 'Ma võrdlen sõnaga kui.', 'Ma ütlen, kumb on parem ja miks.'], 'Oskan võrrelda'),
    ],
    practice: [
      B.wordforms('052_p_forms', 'Keskvõrre.', 'Kirjuta keskvõrre.', [['soe', 'keskvõrre', 'soojem'], ['pikk', 'keskvõrre', 'pikem'], ['lühike', 'keskvõrre', 'lühem'], ['kallis', 'keskvõrre', 'kallim'], ['väike', 'keskvõrre', 'väiksem'], ['kerge', 'keskvõrre', 'kergem'], ['ilus', 'keskvõrre', 'ilusam'], ['halb', 'keskvõrre', 'halvem']]),
      B.gaps('052_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna keskvõrdes.', [
        'Täna on [külmem] kui eile. (külm)', 'See kleit on [ilusam] kui too. (ilus)', 'Suvel on päevad [pikemad]. (pikk)',
        'Vihmajope on [kergem] kui talvejope. (kerge)', 'Pärnus on suvel [soojem] kui Narvas. (soe)', 'Minu tuba on [väiksem] kui sinu tuba. (väike)',
      ]),
      B.listening('052_p_listen', 'Kuulamine. Kaks jopet.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Müüja: Tere! Kas saan aidata?', 'Markus: Tere! Ma otsin talvejopet. Kumb on parem, must või sinine?', 'Müüja: Must jope on soojem. See maksab sada eurot.',
        'Markus: Ja sinine?', 'Müüja: Sinine on odavam, kuuskümmend eurot. Aga see on õhem.', 'Markus: Talvel on Tartus väga külm. Ma võtan musta.',
      ], ['Markus otsib [talvejopet].', 'Must jope on [soojem].', 'Must jope maksab [sada|100] eurot.', 'Sinine jope on [odavam].', 'Sinine jope on ka [õhem].', 'Markus võtab [musta] jope.']),
      B.truefalse('052_p_tf', 'Õige või vale?', 'Kuula vestlust uuesti. Kas lause on õige?', [['Must jope on soojem kui sinine.', true], ['Sinine jope on kallim.', false], ['Must jope maksab sada eurot.', true], ['Sinine jope on paksem kui must.', false], ['Markus valib sinise jope.', false]]),
      B.choice('052_p_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Narvas on ___ kui Pärnus.', 'külmem', 'külm', 'külmam'], ['See kott on ___ kui too.', 'kergem', 'kerge', 'kergam'], ['Juuli on ___ kui november.', 'parem', 'heam', 'hea'],
        ['Talvejope on ___ kui vihmajope.', 'kallim', 'kallis', 'kallisem'], ['Minu korter on ___ kui sinu korter.', 'väiksem', 'väikem', 'väike'],
      ], 'full', 'g_notice'),
      B.categorize('052_p_sort', 'Mis on parem?', 'Mis on parem talvel, mis suvel? Sorteeri.', [
        ['Talvel on parem', ['soojem jope', 'paksemad sokid', 'pikemad püksid', 'suurem sall']], ['Suvel on parem', ['kergem kleit', 'lühemad püksid', 'õhem särk', 'väiksem kott']],
      ]),
      B.transformation('052_p_trans', 'Võrdle.', 'Kirjuta üks lause sõnaga „kui”.', [
        ['Must jope: 100 €. Sinine jope: 60 €.', 'Must jope on …', 'Must jope on kallim kui sinine.|Must jope on kallim kui sinine jope.'], ['Esmaspäeval +5 °C, teisipäeval +10 °C.', 'Teisipäeval on …', 'Teisipäeval on soojem kui esmaspäeval.'],
        ['Narva: −15 °C. Pärnu: −5 °C.', 'Narvas on …', 'Narvas on külmem kui Pärnus.'], ['Juunis on päev 19 tundi, detsembris 6.', 'Juunis on päevad …', 'Juunis on päevad pikemad kui detsembris.'],
        ['Kohv kohvikus: 3 €. Kohv kodus: 0,50 €.', 'Kodus on kohv …', 'Kodus on kohv odavam kui kohvikus.'],
      ]),
      B.errorfix('052_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['See jope on soem.', 'See jope on soojem.'], ['Narvas on külmem kui Pärnu.', 'Narvas on külmem kui Pärnus.'], ['Kleit on ilusem kui seelik.', 'Kleit on ilusam kui seelik.'],
        ['Täna on ilm halbem.', 'Täna on ilm halvem.'], ['Talvel on ööd pikem.', 'Talvel on ööd pikemad.'],
      ]),
      B.wordorder('052_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Must jope on soojem kui sinine.', 'Sinine jope on odavam.', 'Talvel on Tartus väga külm.', 'Täna on ilm parem kui eile.', 'Kumb jope on parem?']),
      B.dialogue('052_p_dialog', 'Poes.', 'Täida dialoog keskvõrdega.', 'Kati', 'Müüja', [
        ['A', 'Kas teil on [väiksem] müts? See on mulle liiga suur.'], ['B', 'Jah, palun. See on väiksem ja ka [soojem].'], ['A', 'Kas see on [kallim]?'],
        ['B', 'Ei, see on kaks eurot [odavam].'], ['A', 'Väga hea! Kas teil on ka [pikem] sall?'], ['B', 'Jah, see sall on pikem ja [pehmem].'],
      ]),
      B.dictation('052_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Must jope on soojem.', 'Sinine jope on odavam.', 'Narvas on külmem kui Pärnus.', 'Kumb on parem?', 'Suvel on päevad pikemad.', 'Kas teil on väiksem müts?'], 6),
      B.translation('052_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Чёрная куртка теплее.', 'Синяя дешевле, чем чёрная.', 'В Нарве холоднее, чем в Пярну.', 'Какая лучше?', 'У вас есть шапка поменьше?', 'Летом дни длиннее.']),
      B.speaking('052_p_say', 'Võrdle pilte või asju.', 'Võrdle paarilisega kahte asja klassis või kahte päeva.', ['Kumb on suurem või väiksem?', 'Kumb on odavam või kallim?', 'Kumb päev oli soojem?', 'Kumba sa valid ja miks?'], [60, 120], ['… on …-m kui …', 'Ma valin…, sest see on…']),
      B.writing('052_p_write', 'Võrdle kahte päeva.', 'Kirjuta 5–7 lauset: võrdle tänast ja eilset päeva.', [5, 7], ['soojem', 'külmem', 'kui', 'parem'], 3),
      B.selfcheck('052_p_self', ['Ma moodustan keskvõrde ka sõnadest pikk, kallis, väike.', 'Ma kuulen, mis on parem või odavam.', 'Ma võrdlen kahte asja sõnaga kui.', 'Ma ütlen poes: kas teil on väiksem…?'], 'Võrdlen kindlalt'),
    ],
    transfer: [
      B.text('052_t_situation', 'Uus olukord', 'Anna ja Viktor tahavad märtsis teha kolmepäevase reisi. Neil on kaks võimalust: Pärnu või Otepää. Nad võrdlevad ilma, hindu ja tegevusi. Sina aitad neil valida.'),
      B.reading('052_t_read', 'Loe infot.', 'Loe reisiinfot ja vasta küsimustele.', 'Pärnu või Otepää?',
        'Pärnu on mere ääres. Märtsis on seal umbes kaks kraadi sooja. Lund on vähe, aga mere ääres puhub tugev tuul. Pärnus on suur spaa, kus saab ujuda. Hotell maksab 70 eurot öö. Bussiga sõit Tallinnast kestab kaks tundi. Otepää on mägede vahel, Lõuna-Eestis. Märtsis on seal külmem, umbes viis kraadi külma. Lund on palju ja saab veel suusatada. Tuul on nõrgem kui Pärnus. Hotell maksab 55 eurot öö. Sõit Tallinnast kestab kolm ja pool tundi. Annale meeldib ujuda ja ta ei armasta külma. Viktor tahab suusatada ja raha on tal vähe.',
        [['Kus on märtsis soojem?', 'Pärnus'], ['Kus saab suusatada?', 'Otepääl'], ['Kus on hotell odavam?', 'Otepääl'], ['Kumb sõit on lühem?', 'Pärnusse|sõit Pärnusse'], ['Miks meeldib Annale Pärnu?', 'seal saab ujuda|ta ei armasta külma']]),
      B.table('052_t_table', 'Võrdlustabel.', 'Kirjuta tabelisse, kumb on parem ja miks.', 'Mida võrdleme?, Pärnu, Otepää, Kumb on parem?', ['Ilm | | | ', 'Hind | | | ', 'Sõit | | | ', 'Tegevused | | | ']),
      B.transformation('052_t_trans', 'Võrdle kohti.', 'Kirjuta üks lause sõnaga „kui”.', [
        ['Pärnu: +2 °C. Otepää: −5 °C.', 'Pärnus on …', 'Pärnus on soojem kui Otepääl.'], ['Pärnu: 70 €. Otepää: 55 €.', 'Otepää hotell on …', 'Otepää hotell on odavam kui Pärnu hotell.|Otepää hotell on odavam.'],
        ['Pärnu: 2 h. Otepää: 3,5 h.', 'Sõit Pärnusse on …', 'Sõit Pärnusse on lühem kui sõit Otepääle.|Sõit Pärnusse on lühem.'], ['Pärnu: tugev tuul. Otepää: nõrk tuul.', 'Pärnus on …', 'Pärnus on tuulisem kui Otepääl.'],
        ['Pärnu: vähe lund. Otepää: palju lund.', 'Otepääl on …', 'Otepääl on rohkem lund kui Pärnus.'],
      ]),
      B.wordorder('052_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Otepää hotell on odavam.', 'Pärnus on märtsis soojem.', 'Minu arvates on Pärnu parem.', 'Viktorile meeldib suusatada.', 'Sõit Otepääle on pikem.']),
      B.dialogue('052_t_dialog', 'Anna ja Viktor arutavad.', 'Täida dialoog sobivate sõnadega.', 'Anna', 'Viktor', [
        ['A', 'Pärnus on [soojem]. Ma ei taha külmetada.'], ['B', 'Aga Otepää hotell on [odavam].'], ['A', 'Pärnus saab spaas [ujuda].'],
        ['B', 'Otepääl saab [suusatada]. See on mulle tähtsam.'], ['A', 'Sõit Pärnusse on [lühem], ainult kaks tundi.'], ['B', 'Hea küll. Lähme seekord Pärnusse, järgmine kord [Otepääle].'],
      ]),
      B.planning('052_t_plan', 'Enne rääkimist.', 'Kirjuta kolm põhjust oma valiku kohta.', ['Kuhu sa lähed?', 'Esimene põhjus (ilm)', 'Teine põhjus (hind või sõit)', 'Kolmas põhjus (tegevus)'], 2),
      B.speaking('052_t_say', 'Minu valik.', 'Ütle grupile, kuhu Anna ja Viktor peaksid sõitma. Põhjenda.', ['Kuhu nad peaksid sõitma?', 'Kus on parem ilm?', 'Kus on odavam?', 'Mis on sinu arvates kõige tähtsam?'], [60, 120], ['Minu arvates on … parem, sest …', '… on odavam / soojem kui …']),
      B.writing('052_t_write', 'Nõuanne.', 'Kirjuta Annale ja Viktorile 5–7 lauset: kuhu sõita ja miks.', [5, 7], ['parem', 'kui', 'odavam', 'sest'], 3),
      B.rolecards('052_t_roles', 'Meie reis.', 'Te planeerite koos reisi. Leidke koht, mis sobib mõlemale.', 'Sulle meeldib soe ilm ja meri. Raha on sul piisavalt. Võrdle ja põhjenda.', 'Sulle meeldib talv ja lumi. Sul on vähe raha. Võrdle ja põhjenda.', ['Pärnus on soojem.', 'See on parem, sest…'], ['Otepää on odavam.', 'Aga Otepääl on rohkem lund.']),
      B.gaps('052_t_gaps', 'Nõuande laused.', 'Kirjuta sulgudes olev sõna keskvõrdes.', [
        'Pärnus on ilm [soojem]. (soe)', 'Otepää hotell on [odavam]. (odav)', 'Sõit Otepääle on [pikem]. (pikk)',
        'Pärnus on tuul [tugevam]. (tugev)', 'Minu arvates on Pärnu [parem]. (hea)', 'Otepääl on [külmem]. (külm)',
      ]),
      B.translation('052_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['В Пярну теплее, чем в Отепя.', 'Гостиница в Отепя дешевле.', 'По-моему, Пярну лучше.', 'Там больше снега.', 'Поездка в Пярну короче.']),
      B.rubric('052_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tekstis on vähemalt neli võrdlust sõnaga kui.', 'Keskvõrre on õige (ka parem, halvem).', 'Valik on põhjendatud vähemalt kahe põhjusega.', 'Paaristöös jõuti ühise otsuseni.']),
      B.selfcheck('052_t_self', ['Ma võrdlen kahte kohta: ilm, hind, sõit.', 'Ma täidan võrdlustabeli.', 'Ma soovitan kohta ja põhjendan.', 'Ma jõuan paarilisega kokkuleppele.'], 'Reis on valitud'),
    ],
  },

  'a2-053': {
    title: 'Ilmateade',
    canDo: 'Ma kuulan lühikest ilmateadet kaks korda ja kirjutan üles vähemalt 3 asja 4-st: temperatuuri, sademed, tuule ja aja (hommikul, päeval, öösel).',
    discover: [
      B.text('053_d_situation', 'Hommikul raadios', 'Kell on seitse hommikul. Sofia joob kohvi ja kuulab raadiot. Kohe tuleb ilmateade. Sofia tahab teada, kas võtta kaasa vihmavari ja mis riided selga panna.'),
      B.vocab('053_d_vocab', 'Ilmateade', ['ilmateade — прогноз погоды', 'temperatuur — температура', 'kraad — градус', 'pluss — плюс', 'miinus — минус', 'sadama — идти (о дожде, снеге)', 'puhuma — дуть', 'tugev — сильный', 'nõrk — слабый', 'pakane — мороз', 'hommikul — утром', 'päeval — днём', 'õhtul — вечером', 'öösel — ночью']),
      B.listening('053_d_listen', 'Kuula ilmateadet.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere hommikust! Mina olen Tarmo ja nüüd on ilmateade.', 'Täna hommikul on pilvine ja jahe, pluss kolm kraadi.', 'Päeval hakkab sadama vihma.',
        'Temperatuur tõuseb kuni kaheksa kraadini.', 'Puhub tugev tuul läänest.', 'Öösel on selge taevas ja külm, miinus kaks kraadi.',
      ], [
        'Hommikul on [pilvine] ja jahe.', 'Hommikul on pluss [kolm|3] kraadi.', 'Päeval hakkab sadama [vihma].',
        'Päeval on kuni [kaheksa|8] kraadi.', 'Puhub tugev [tuul].', 'Öösel on [miinus] kaks kraadi.',
      ]),
      B.table('053_d_table', 'Ilmateade tabelis.', 'Kuula uuesti ja täida tabel.', 'Aeg, Temperatuur, Ilm', ['Hommik | [+3|pluss kolm] | [pilvine|pilvine ja jahe]', 'Päev | [+8|kaheksa] | [vihm|sajab vihma]', 'Öö | [−2|miinus kaks] | [selge|külm]']),
      B.notice('053_d_notice', 'Märka: ilmateate keel', ['**Pluss** viis kraadi = viis kraadi **sooja**.', '**Miinus** viis kraadi = viis kraadi **külma**.', 'Temperatuur **tõuseb** ↑ / **langeb** ↓.', '**Sajab** vihma / lund. **Hakkab sadama.**', 'Puhub **tugev** / **nõrk** tuul.', 'hommiku**l**, päeva**l**, õhtu**l**, öö**sel**']),
      B.reading('053_d_read', 'Loe: Nädala ilm.', 'Loe ilmateadet ja vasta küsimustele.', 'Ilm järgmisel nädalal',
        'Esmaspäeval on päikeseline, aga külm. Päeval on null kraadi, öösel miinus viis. Esmaspäeva õhtul on taevas selge ja tähed paistavad. Teisipäeval tuleb idast pilvi. Õhtul hakkab sadama lund. Kolmapäeval sajab lund terve päeva. Teed on libedad, autojuhid peavad olema ettevaatlikud. Neljapäeval lumi lõpeb. Temperatuur langeb kuni miinus kümme kraadini. Puhub nõrk tuul. Reedel on pakane veel tugevam, öösel kuni miinus viisteist kraadi. Siis on parem olla kodus. Laupäeval läheb ilm soojemaks. Päeval on pluss üks kraad ja sajab lörtsi. Pühapäeval on pilvine, aga kuiv. Lapsed saavad pühapäeval kelgutada, sest lund on palju. Järgmisel nädalal tuleb jälle soojem ilm.',
        [['Mis ilm on esmaspäeval?', 'päikeseline ja külm|päikeseline'], ['Millal hakkab sadama lund?', 'teisipäeva õhtul|teisipäeval õhtul'], ['Miks peavad autojuhid kolmapäeval olema ettevaatlikud?', 'teed on libedad'], ['Kui külm on reedel öösel?', 'miinus viisteist kraadi|−15'], ['Mis ilm on pühapäeval?', 'pilvine, aga kuiv|pilvine ja kuiv']]),
      B.match('053_d_match', 'Mis see tähendab?', 'Ühenda ilmateate lause ja tähendus.', [
        ['Temperatuur tõuseb.', 'Läheb soojemaks.'], ['Temperatuur langeb.', 'Läheb külmemaks.'], ['On kõva pakane.', 'On väga külm.'],
        ['Taevas on selge.', 'Pilvi ei ole.'], ['Teed on libedad.', 'Autoga tuleb sõita aeglaselt.'], ['Sajab lörtsi.', 'Sajab vihma ja lund koos.'],
      ]),
      B.gaps('053_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Täna on pluss viis [kraadi].', 'Õhtul hakkab [sadama] vihma.', 'Läänest [puhub] tugev tuul.', 'Öösel on [miinus] kümme kraadi.',
        'Homme [tõuseb] temperatuur.', 'Jaanuaris on kõva [pakane].',
      ], ['kraadi', 'sadama', 'puhub', 'miinus', 'tõuseb', 'pakane', 'paistab', 'tuul']),
      B.wordforms('053_d_forms', 'Numbrid ilmateates.', 'Kirjuta number sõnadega.', [['+5', '… kraadi sooja', 'viis'], ['−12', 'miinus … kraadi', 'kaksteist'], ['+18', 'pluss … kraadi', 'kaheksateist'], ['−20', '… kraadi külma', 'kakskümmend'], ['+25', 'pluss … kraadi', 'kakskümmend viis'], ['0', '… kraadi', 'null']]),
      B.transformation('053_d_trans', 'Kirjuta lausena.', 'Kirjuta ilmateate info terve lausena.', [
        ['hommik, +4 °C', 'Hommikul on …', 'Hommikul on pluss neli kraadi.|Hommikul on neli kraadi sooja.'], ['öö, −8 °C', 'Öösel on …', 'Öösel on miinus kaheksa kraadi.|Öösel on kaheksa kraadi külma.'],
        ['päev, vihm', 'Päeval sajab …', 'Päeval sajab vihma.'], ['õhtu, lumi', 'Õhtul sajab …', 'Õhtul sajab lund.'], ['tuul, tugev', 'Puhub …', 'Puhub tugev tuul.'],
      ]),
      B.errorfix('053_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Täna on kolm kraad sooja.', 'Täna on kolm kraadi sooja.'], ['Öösel sajab lumi.', 'Öösel sajab lund.'], ['Temperatuur tõusub.', 'Temperatuur tõuseb.'],
        ['Ööl on miinus viis.', 'Öösel on miinus viis.'], ['Õhtul hakkab sadab vihma.', 'Õhtul hakkab sadama vihma.'],
      ]),
      B.wordorder('053_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Päeval hakkab sadama vihma.', 'Öösel on selge taevas.', 'Puhub tugev tuul läänest.', 'Temperatuur tõuseb kaheksa kraadini.', 'Teed on libedad.']),
      B.translation('053_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сегодня плюс пять градусов.', 'Ночью мороз.', 'Вечером пойдёт снег.', 'Дует сильный ветер.', 'Температура поднимается.']),
      B.dictation('053_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused numbritega.', ['Täna on +6 kraadi.', 'Öösel on −3 kraadi.', 'Puhub tugev tuul.', 'Õhtul hakkab sadama lund.', 'Homme on 10 kraadi sooja.'], 5),
      B.speaking('053_d_say', 'Mida võtta kaasa?', 'Kuulasid ilmateadet. Ütle paarilisele, mida täna kaasa võtta.', ['Mis ilm on hommikul?', 'Mis ilm on päeval?', 'Mida Sofia peab kaasa võtma?', 'Mis riided Sofia peaks selga panema?'], [60, 90], ['Päeval sajab…, seepärast…', 'On … kraadi.']),
      B.writing('053_d_write', 'Sõnum Sofiale.', 'Kirjuta Sofiale 4–6 lauset: mis ilm täna on ja mida kaasa võtta.', [4, 6], ['täna', 'kraadi', 'sajab', 'võta'], 2),
      B.selfcheck('053_d_self', ['Ma kuulen ilmateatest temperatuuri.', 'Ma kuulen, kas sajab ja kas puhub tuul.', 'Ma loen ja kirjutan pluss- ja miinuskraade.', 'Ma ütlen ilmateate järgi, mida kaasa võtta.'], 'Ilmateade on selge'),
    ],
    practice: [
      B.listening('053_p_listen', 'Kuulamine 1. Ilm Eestis.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere õhtust! Mina olen Maret ja räägin homsest ilmast.', 'Tallinnas on homme päikeseline, kuni kümme kraadi sooja.', 'Tartus on pilvine ja päeval sajab vihma.',
        'Pärnus puhub mere ääres tugev tuul.', 'Narvas on kõige külmem, ainult viis kraadi.', 'Öösel on kõikjal null kraadi. Head ööd!',
      ], ['Tallinnas on homme [päikeseline].', 'Tallinnas on kuni [kümme|10] kraadi.', 'Tartus sajab päeval [vihma].', 'Pärnus puhub tugev [tuul].', 'Kõige külmem on [Narvas].', 'Öösel on [null|0] kraadi.']),
      B.listening('053_p_listen2', 'Kuulamine 2. Häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Markus! Siin Kati.', 'Kuulasin ilmateadet. Homme on miinus kümme kraadi.', 'Hommikul sajab lund ja teed on libedad.',
        'Ära sõida autoga, võta parem buss.', 'Pane soojad saapad jalga. Näeme kell üheksa bussijaamas!',
      ], ['Homme on [miinus] kümme kraadi.', 'Hommikul sajab [lund].', 'Teed on [libedad].', 'Markus peab sõitma [bussiga].', 'Nad kohtuvad [bussijaamas].']),
      B.truefalse('053_p_tf', 'Õige või vale?', 'Kuulamine 1: kas lause on õige?', [['Tallinnas on homme vihmane ilm.', false], ['Tartus on pilvine.', true], ['Pärnus on tuuline.', true], ['Narvas on soojem kui Tallinnas.', false], ['Öösel on pluss viis kraadi.', false]]),
      B.table('053_p_table', 'Linnade ilm.', 'Kirjuta kuulamise 1 järgi linnade ilm.', 'Linn, Ilm, Temperatuur', ['Tallinn | [päikeseline] | [10 kraadi|+10]', 'Tartu | [pilvine|vihm] | —', 'Narva | — | [5 kraadi|+5]']),
      B.gaps('053_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Homme [sajab] lund. (sadama)', 'Õhtul hakkab vihma [sadama]. (sadama)', 'Tuul [puhub] mere poolt. (puhuma)',
        'Temperatuur [langeb] öösel. (langema)', 'Päike [paistab] terve päeva. (paistma)', 'Eile [sadas] palju vihma. (sadama, eile)',
      ]),
      B.errorfix('053_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Homme on viis kraad.', 'Homme on viis kraadi.'], ['Öösel sajab lumi.', 'Öösel sajab lund.'], ['Ööl on külm.', 'Öösel on külm.'],
        ['Hakkab sadab vihma.', 'Hakkab sadama vihma.'], ['On miinus kümme kraadi sooja.', 'On miinus kümme kraadi.|On kümme kraadi külma.'],
      ]),
      B.wordorder('053_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Homme on Tallinnas päikeseline.', 'Pärnus puhub tugev tuul.', 'Õhtul hakkab sadama vihma.', 'Öösel langeb temperatuur.']),
      B.transformation('053_p_trans', 'Kirjuta lausena.', 'Kirjuta ilmakaardi info terve lausena.', [
        ['Tallinn: päike', 'Tallinnas …', 'Tallinnas paistab päike.|Tallinnas on päikeseline.'], ['Tartu: vihm', 'Tartus sajab …', 'Tartus sajab vihma.'],
        ['Narva: +5 °C', 'Narvas on …', 'Narvas on pluss viis kraadi.|Narvas on viis kraadi sooja.'], ['Pärnu: tugev tuul', 'Pärnus puhub …', 'Pärnus puhub tugev tuul.'], ['öö: 0 °C', 'Öösel on …', 'Öösel on null kraadi.'],
      ]),
      B.categorize('053_p_sort', 'Soojem või külmem?', 'Mis tähendab soojemat, mis külmemat ilma? Sorteeri.', [
        ['Läheb soojemaks', ['temperatuur tõuseb', 'lumi sulab', 'pluss kakskümmend', 'tuleb kevad']], ['Läheb külmemaks', ['temperatuur langeb', 'tuleb pakane', 'miinus kümme', 'tuleb talv']],
      ]),
      B.dictation('053_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused numbritega.', ['Homme on −10 kraadi.', 'Tallinnas on +10 kraadi.', 'Narvas on ainult 5 kraadi.', 'Öösel on 0 kraadi.', 'Teed on libedad.'], 5),
      B.translation('053_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Завтра будет солнечно.', 'Ночью минус пять градусов.', 'Вечером пойдёт дождь.', 'Дороги скользкие.', 'Температура падает.', 'Завтра в Тарту будет облачно.']),
      B.rolecards('053_p_roles', 'Telefonis ilmast.', 'Üks teab ilmateadet, teine küsib. Siis vahetage.', 'Sa lugesid homset ilmateadet: Tartus +6, vihm, tugev tuul. Vasta sõbra küsimustele.', 'Sa tahad homme Tartusse sõita. Küsi temperatuuri, vihma ja tuule kohta.', ['Homme on…', 'Päeval sajab…'], ['Mis ilm homme on?', 'Kas sajab vihma?']),
      B.speaking('053_p_say', 'Homne ilm.', 'Ütle paarilisele homne ilm. Paariline kirjutab üles.', ['Mis ilm on homme hommikul?', 'Mis ilm on päeval?', 'Kui soe on öösel?', 'Kas on vaja vihmavarju?'], [60, 90], ['Homme hommikul on…', 'Päeval sajab… / paistab…']),
      B.writing('053_p_write', 'Homne ilm.', 'Kirjuta 5–7 lauset: homne ilm sinu linnas (hommik, päev, öö).', [5, 7], ['hommikul', 'päeval', 'öösel', 'kraadi'], 3),
      B.selfcheck('053_p_self', ['Ma kuulen ilmateatest linna ja temperatuuri.', 'Ma kuulen häälsõnumist, mida teha.', 'Ma kirjutan numbrid ja kraadid õigesti.', 'Ma küsin ja räägin homsest ilmast.'], 'Kuulan ilmateadet'),
    ],
    transfer: [
      B.text('053_t_situation', 'Uus olukord', 'Sinu kursuse grupil on oma raadiosaade. Täna oled sina ilmateate tegija. Sul on ilmakaart ja märksõnad. Sofia kuulab ja kirjutab üles, Liis küsib lisaküsimusi.'),
      B.table('053_t_map', 'Ilmakaart.', 'Kirjuta igale linnale üks lause ilmast.', 'Linn, Märgid kaardil, Sinu lause', ['Tallinn | ☀ +12, nõrk tuul | ', 'Tartu | ☁ +9, vihm õhtul | ', 'Pärnu | 🌬 +10, tugev tuul | ', 'Narva | ☁ +6, udu hommikul | ']),
      B.listening('053_t_listen', 'Kuula näidist.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Sofia ja nüüd on ilmateade.', 'Laupäeval on Lõuna-Eestis päikeseline ja soe.', 'Päeval on kuni kakskümmend kraadi.',
        'Saartel puhub tugev tuul.', 'Õhtul võib tulla äike. Võtke kaasa vihmavari!',
      ], ['Laupäeval on Lõuna-Eestis [päikeseline] ja soe.', 'Päeval on kuni [kakskümmend|20] kraadi.', 'Saartel puhub tugev [tuul].', 'Õhtul võib tulla [äike].', 'Kaasa tuleb võtta [vihmavari].']),
      B.reading('053_t_read', 'Loe raadio teksti.', 'Loe teise grupi ilmateadet ja vasta küsimustele.', 'Raadio „Keeletund”: ilm',
        'Head kuulajad! Nüüd on ilmateade. Täna hommikul on Ida-Eestis udu. Autojuhid, sõitke aeglaselt! Kella kümneks udu kaob. Päeval paistab päike, aga taevas on natuke pilvine. Temperatuur on üheksa kuni kaksteist kraadi. Kõige soojem on Pärnus, kõige külmem Narvas. Õhtul tuleb läänest vihm. Puhub tugev tuul, saartel kuni viisteist meetrit sekundis. Saartel ei ole hea päev paadiga sõita. Öösel on jahe, umbes kolm kraadi sooja. Homme on ilm parem: päike paistab ja tuul on nõrk. Päeval on kuni neliteist kraadi. See on hea päev jalutamiseks. Ülehomme võib jälle sadada. Järgmine ilmateade on kell kaksteist. Aitäh kuulamast!',
        [['Kus on hommikul udu?', 'Ida-Eestis'], ['Millal udu kaob?', 'kella kümneks|kell kümme'], ['Kust tuleb õhtul vihm?', 'läänest'], ['Kui soe on öösel?', 'umbes kolm kraadi|kolm kraadi sooja'], ['Miks on homme hea päev jalutamiseks?', 'päike paistab ja tuul on nõrk|ilm on parem']]),
      B.gaps('053_t_gaps', 'Ilmateate laused.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Hommikul on [udune]. (udu)', 'Päeval [paistab] päike. (paistma)', 'Õhtul hakkab [sadama] vihma. (sadama)',
        'Temperatuur on kümme [kraadi]. (kraad)', 'Öösel on [jahe]. (jahe)', 'Homme on ilm [parem]. (hea, keskvõrre)',
      ]),
      B.translation('053_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Утром туман.', 'Днём светит солнце.', 'Вечером с запада придёт дождь.', 'Завтра погода будет лучше.', 'Спасибо, что слушали!']),
      B.errorfix('053_t_fix', 'Kontrolli teksti.', 'Ilmateates on vead. Kirjuta lause õigesti.', [
        ['Hommikul on udu ilm.', 'Hommikul on udune ilm.|Hommikul on udu.'], ['Päeval paistab päikeseline.', 'Päeval paistab päike.'], ['Öösel on kolm kraad sooja.', 'Öösel on kolm kraadi sooja.'],
        ['Homme on ilm heam.', 'Homme on ilm parem.'], ['Õhtul tuleb vihm läänes.', 'Õhtul tuleb vihm läänest.'],
      ]),
      B.planning('053_t_plan', 'Enne saadet.', 'Kirjuta ilmateate plaan märksõnadega.', ['Tervitus ja nimi', 'Hommik: ilm ja temperatuur', 'Päev ja õhtu: sademed, tuul', 'Öö ja homme', 'Nõuanne kuulajale'], 2),
      B.writing('053_t_write', 'Minu ilmateade.', 'Kirjuta ilmakaardi järgi ilmateade 6–8 lausega.', [6, 8], ['hommikul', 'päeval', 'kraadi', 'puhub', 'sajab'], 3),
      B.speaking('053_t_say', 'Raadiosaade.', 'Loe oma ilmateade grupile ette nagu raadios.', ['Tervita kuulajaid ja ütle oma nimi.', 'Räägi hommiku, päeva ja öö ilmast.', 'Ütle temperatuur ja tuul.', 'Anna üks nõuanne.'], [60, 120], ['Tere! Mina olen … ja nüüd on ilmateade.', 'Aitäh kuulamast!']),
      B.rolecards('053_t_roles', 'Kuulaja helistab.', 'Kuulaja helistab raadiosse ja küsib ilma kohta.', 'Oled kuulaja. Sa tahad homme minna merele. Küsi tuule, vihma ja temperatuuri kohta.', 'Oled ilmateate tegija. Vasta oma ilmakaardi järgi. Anna nõu.', ['Kas homme puhub tugev tuul?', 'Mis kell vihm algab?'], ['Homme on…', 'Ma soovitan…']),
      B.rubric('053_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ilmateates on hommik, päev ja öö.', 'Temperatuur on õigesti öeldud (pluss / miinus, kraadi).', 'Sademed ja tuul on õiges vormis: sajab vihma, puhub tuul.', 'Suuline esitus on arusaadav, kuulaja saab infot üles kirjutada.']),
      B.selfcheck('053_t_self', ['Ma teen ilmakaardi järgi lühikese ilmateate.', 'Ma loen oma ilmateate ette selgelt.', 'Ma vastan kuulaja küsimustele ilma kohta.', 'Ma saan aru teise grupi ilmateatest.'], 'Raadio on eetris'),
    ],
  },

  'a2-054': {
    title: 'Mida selga panna?',
    canDo: 'Ma annan sõbrale ilma järgi 4 nõuannet riiete ja asjade kohta (pane jope selga, võta vihmavari kaasa, ära unusta mütsi) ja ütlen sõnaga sest, miks.',
    discover: [
      B.text('054_d_situation', 'Hommik enne lasteaeda', 'Kell on pool kaheksa. Mia seisab riidekapi ees. Ta tahab panna selga kerge kleidi. Aga aknast on näha, et sajab vihma ja puhub tuul. Oksana on Mia ema. Ta ulatab Miale jope.'),
      B.dialogue('054_d_dialog', 'Riidekapi ees.', 'Loe dialoogi. Täida lüngad.', 'Oksana', 'Mia', [
        ['A', 'Mia, vaata aknast välja! Väljas [sajab] vihma.'], ['B', 'Aga ma tahan seda kleiti [selga] panna!'], ['A', 'Pane kleit selga, aga võta ka [jope]. Täna on külm.'],
        ['B', 'Kas ma pean mütsi [pähe] panema?'], ['A', 'Jah, sest puhub tugev [tuul]. Ja pane kummikud jalga.'], ['B', 'Hea küll. Kas vihmavari on vaja ka [kaasa] võtta?'],
        ['A', 'Muidugi! Ära [unusta] vihmavarju!'],
      ]),
      B.vocab('054_d_vocab', 'Riided ja ilm', ['riided — одежда', 'jope — куртка', 'mantel — пальто', 'müts — шапка', 'sall — шарф', 'kindad — перчатки', 'saapad — сапоги', 'kummikud — резиновые сапоги', 'püksid — брюки', 'kleit — платье', 'vihmavari — зонт', 'selga panema — надевать', 'kaasa võtma — брать с собой', 'soovitama — советовать']),
      B.reading('054_d_read', 'Loe: Kooli kiri.', 'Loe õpetaja kirja ja vasta küsimustele.', 'Matk metsas reedel',
        'Head lapsevanemad! Reedel läheme kolmanda klassiga metsa matkama. Buss väljub koolist kell üheksa. Ilmateade lubab hommikuks viis kraadi sooja, aga päeval võib sadada vihma. Metsas on märg. Palun pange lapsele selga soe jope ja veekindlad püksid. Pange kummikud jalga, sest tavalised kingad saavad märjaks. Pange müts pähe ja kindad taskusse. Ärge pange lapsele selga uusi ja ilusaid riideid. Võtke kaasa ka kuivad sokid. Lõunaks teeme lõkke ja sööme koos. Võileiva ja joogi võtab laps kodust kaasa. Me tuleme kooli tagasi kell kaks. Kui sajab väga tugevalt, jääme kooli ja matk on järgmisel nädalal. Õpetaja Kadri',
        [['Mis kell buss väljub?', 'kell üheksa|üheksa'], ['Mis ilm on reedel päeval?', 'võib sadada vihma|vihmane'], ['Miks on vaja kummikuid?', 'kingad saavad märjaks|metsas on märg'], ['Mida ei tohi lapsele selga panna?', 'uusi ja ilusaid riideid|uusi riideid'], ['Mida laps kodust kaasa võtab?', 'võileiva ja joogi|võileib ja jook'], ['Mis juhtub, kui sajab väga tugevalt?', 'matk on järgmisel nädalal|jäädakse kooli']]),
      B.notice('054_d_notice', 'Märka: nõuanne', ['**Pane** jope **selga**! **Pane** müts **pähe**!', '**Pane** kindad **kätte**! **Pane** saapad **jalga**!', '**Võta** vihmavari **kaasa**!', '**Ära unusta** vihmavarju! (ära + osastav)', 'Pane soe jope selga, **sest** õhtul on külm.', 'Sõbrale: **pane**, **võta**; teile: **pange**, **võtke**']),
      B.categorize('054_d_sort', 'Kuhu?', 'Kuhu paned? Pane riided õigesse rühma.', [
        ['selga', ['jope', 'mantel', 'kampsun']], ['pähe', ['müts', 'kapuuts', 'nokamüts']], ['jalga', ['saapad', 'püksid', 'sokid']], ['kätte', ['kindad', 'labakindad', 'sõrmkindad']],
      ]),
      B.manymatch('054_d_advice', 'Ilm ja nõuanne.', 'Ühenda ilm ja sobiv nõuanne.', ['Sajab vihma.', 'On kakskümmend kraadi külma.', 'Väljas on palav.', 'Puhub tugev tuul.', 'Sajab lund ja on märg.'], ['Võta vihmavari kaasa!', 'Pane kindad kätte ja müts pähe!', 'Pane kerge kleit selga!', 'Pane jope selga ja sall kaela!', 'Pane saapad jalga!']),
      B.gaps('054_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Pane müts [pähe]!', 'Pane kindad [kätte]!', 'Võta vihmavari [kaasa]!', 'Pane soe jope [selga]!',
        'Pane saapad [jalga], sest on märg.', 'Ära [unusta] salli!',
      ], ['pähe', 'kätte', 'kaasa', 'selga', 'jalga', 'unusta', 'kaela', 'võta']),
      B.transformation('054_d_trans', 'Anna nõu.', 'Kirjuta nõuanne käskivas vormis.', [
        ['Sa pead mütsi pähe panema.', 'Pane …!', 'Pane müts pähe!'], ['Sa pead vihmavarju kaasa võtma.', 'Võta …!', 'Võta vihmavari kaasa!'],
        ['Sa ei tohi salli unustada.', 'Ära …!', 'Ära unusta salli!'], ['Sa pead kindad kätte panema.', 'Pane …!', 'Pane kindad kätte!'],
        ['Sa pead sooja jope selga panema.', 'Pane …!', 'Pane soe jope selga!'],
      ]),
      B.wordorder('054_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Pane soe jope selga!', 'Võta vihmavari kaasa!', 'Ära unusta kindaid!', 'Pane kummikud jalga, sest on märg.', 'Täna on vaja mütsi.']),
      B.errorfix('054_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Pane müts selga!', 'Pane müts pähe!'], ['Võtta vihmavari kaasa!', 'Võta vihmavari kaasa!'], ['Ära unusta vihmavari!', 'Ära unusta vihmavarju!'],
        ['Pane kindad jalga!', 'Pane kindad kätte!'], ['Pane jope, sest on külm.', 'Pane jope selga, sest on külm.'],
      ]),
      B.translation('054_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Надень шапку!', 'Возьми с собой зонт!', 'Не забудь перчатки!', 'Надень сапоги, потому что мокро.', 'Сегодня нужна тёплая куртка.']),
      B.dictation('054_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Täna sajab vihma ja puhub tuul.', 'Pane jope selga!', 'Metsas on märg.', 'Pane kummikud jalga.', 'Võtke kaasa kuivad sokid.'], 5),
      B.speaking('054_d_say', 'Anna nõu.', 'Paariline ütleb ilma. Sina annad kaks nõuannet ja põhjuse.', ['Sajab vihma ja on kümme kraadi.', 'On miinus viisteist kraadi.', 'On kakskümmend viis kraadi ja päike.', 'Puhub tugev tuul mere ääres.'], [60, 120], ['Pane … selga, sest …', 'Võta … kaasa!', 'Ära unusta …!']),
      B.writing('054_d_write', 'Sõnum sõbrale.', 'Sõber tuleb homme Tallinnasse. Kirjuta 4–6 lauset: mis ilm on ja mida panna selga.', [4, 6], ['pane', 'võta', 'sest', 'ära unusta'], 3),
      B.selfcheck('054_d_self', ['Ma nimetan riideid: jope, müts, sall, kindad, saapad.', 'Ma ütlen: pane selga / pähe / jalga / kätte.', 'Ma annan nõu: võta kaasa, ära unusta.', 'Ma ütlen põhjuse sõnaga sest.'], 'Riided on valitud'),
    ],
    practice: [
      B.listening('054_p_listen', 'Kuulamine. Ema nõuanded.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Oksana: Mia, homme on lasteaia matk. Kuulasin ilmateadet.', 'Oksana: Hommikul on ainult kaks kraadi sooja. Pane soe kampsun selga.',
        'Oksana: Päeval sajab vihma. Võta vihmavari kaasa.', 'Oksana: Metsas on märg. Pane kummikud jalga.', 'Oksana: Ja ära unusta võileiba!', 'Mia: Hea küll, emme. Aitäh!',
      ], ['Hommikul on [kaks|2] kraadi sooja.', 'Mia peab panema selga [kampsuni|soe kampsuni].', 'Päeval sajab [vihma].', 'Kaasa on vaja [vihmavari|vihmavarju].', 'Jalga peab panema [kummikud].', 'Mia ei tohi unustada [võileiba].']),
      B.wordforms('054_p_forms', 'Käskiv vorm.', 'Kirjuta käskiv vorm sõbrale (sina).', [['panema', 'sina', 'pane'], ['võtma', 'sina', 'võta'], ['unustama (eitus)', 'sina', 'ära unusta'], ['kandma', 'sina', 'kanna'], ['tulema', 'sina', 'tule'], ['minema', 'sina', 'mine']]),
      B.manymatch('054_p_where', 'Kuhu paned?', 'Ühenda riie ja koht.', ['müts', 'kindad', 'saapad', 'jope', 'sall'], ['pähe', 'kätte', 'jalga', 'selga', 'kaela']),
      B.gaps('054_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        '[Pane] müts pähe! (panema)', '[Võta] vihmavari kaasa! (võtma)', 'Ära unusta [salli]! (sall)',
        'Ära unusta [kindaid]! (kindad)', 'Pange lapsele kummikud [jalga]! (jalg)', 'Talvel [kannan] ma pikka mantlit. (kandma)',
      ]),
      B.choice('054_p_choice', 'Mis on hea nõuanne?', 'Loe ilma. Vali parim nõuanne.', [
        ['On miinus kakskümmend kraadi.', 'Pane soe mantel selga.', 'Pane kerge kleit selga.', 'Võta päikeseprillid.'],
        ['On kolmkümmend kraadi ja päike.', 'Pane müts pähe ja joo vett.', 'Pane kindad kätte.', 'Võta sall kaasa.'],
        ['Sajab vihma terve päeva.', 'Võta vihmavari kaasa.', 'Pane sandaalid jalga.', 'Ära võta jopet.'],
        ['Hommikul on külm, päeval soe.', 'Pane kampsun selga, siis saad selle ära võtta.', 'Pane talvemantel selga.', 'Mine ilma jopeta.'],
        ['Tee on libe.', 'Pane head saapad jalga.', 'Pane uued kingad jalga.', 'Jookse kiiresti.'],
      ], 'full', 'g_use'),
      B.errorfix('054_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Pane saapad pähe!', 'Pane saapad jalga!'], ['Ära unusta müts!', 'Ära unusta mütsi!'], ['Võtad vihmavari kaasa!', 'Võta vihmavari kaasa!'],
        ['Pange sall kätte!', 'Pange sall kaela!'], ['Ära pane kleit, sest on külm.', 'Ära pane kleiti selga, sest on külm.'],
      ]),
      B.wordorder('054_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Pane soe kampsun selga!', 'Metsas on märg.', 'Ära unusta võileiba!', 'Päeval sajab vihma.', 'Pane kummikud jalga!']),
      B.transformation('054_p_trans', 'Ütle põhjus.', 'Ühenda kaks lauset sõnaga „sest”.', [
        ['Pane müts pähe. On külm.', 'Pane müts pähe, …', 'Pane müts pähe, sest on külm.'], ['Võta vihmavari. Sajab vihma.', 'Võta vihmavari kaasa, …', 'Võta vihmavari kaasa, sest sajab vihma.'],
        ['Pane kummikud jalga. Metsas on märg.', 'Pane kummikud jalga, …', 'Pane kummikud jalga, sest metsas on märg.'], ['Võta kampsun. Õhtul on jahe.', 'Võta kampsun kaasa, …', 'Võta kampsun kaasa, sest õhtul on jahe.'],
        ['Pane sall kaela. Puhub tugev tuul.', 'Pane sall kaela, …', 'Pane sall kaela, sest puhub tugev tuul.'],
      ]),
      B.dictation('054_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Pane müts pähe!', 'Võta vihmavari kaasa!', 'Ära unusta kindaid!', 'Pane kummikud jalga, sest on märg.', 'Täna on vaja sooja jopet.'], 5),
      B.translation('054_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Надень тёплый свитер!', 'Не забудь бутерброд!', 'Наденьте ребёнку резиновые сапоги!', 'Зимой я ношу длинное пальто.', 'Шарф надевают на шею.']),
      B.rolecards('054_p_roles', 'Mida panna selga?', 'Üks küsib nõu, teine annab nõu ilma järgi.', 'Sa lähed homme jalgsi tööle, 3 km. Ilmateade: +2, tugev tuul, õhtul lumi. Küsi nõu.', 'Anna sõbrale vähemalt neli nõuannet ja ütle iga kord, miks.', ['Mida ma peaksin selga panema?', 'Kas vihmavari on vaja?'], ['Pane…, sest…', 'Ära unusta…!']),
      B.speaking('054_p_say', 'Mida sa täna kannad?', 'Räägi paarilisele, mida sa täna selga panid ja miks.', ['Mis ilm täna on?', 'Mida sa selga panid?', 'Mida sa kaasa võtsid?', 'Mida sa homme kannad?'], [60, 90], ['Panin selga…, sest…', 'Võtsin kaasa…']),
      B.writing('054_p_write', 'Nõuanded külalisele.', 'Sõber tuleb jaanuaris Eestisse. Kirjuta 5–7 lauset: mida kaasa võtta.', [5, 7], ['võta', 'pane', 'ära unusta', 'sest'], 3),
      B.selfcheck('054_p_self', ['Ma kuulen nõuandeid: mida selga panna.', 'Ma moodustan käskiva vormi: pane, võta, ära unusta.', 'Ma tean: müts pähe, kindad kätte, saapad jalga.', 'Ma annan neli nõuannet põhjusega.'], 'Annan head nõu'),
    ],
    transfer: [
      B.text('054_t_situation', 'Uus olukord', 'Sinu sõbranna Sofia lendab reedel Lapimaale, Soome põhja. Ta ei ole kunagi nii külmas kohas olnud. Ta saatis sulle sõnumi ja küsib nõu: mida kaasa võtta?'),
      B.reading('054_t_read', 'Loe Sofia sõnumit.', 'Loe sõnumit ja vasta küsimustele.', 'Sofia sõnum',
        'Tere! Reedel lendan Lapimaale. Seal on praegu miinus kakskümmend viis kraadi! Ma olen seal neli päeva. Laupäeval sõidame põhjapõtradega ja pühapäeval läheme suusatama. Õhtul tahame vaadata virmalisi. See tähendab, et peame olema mitu tundi õues. Mul on üks talvejope, aga see on vana ja õhuke. Mütsi mul on, aga kindaid ei ole. Saapad on mul ilusad, aga mitte väga soojad. Kas ma pean ostma uued riided? Mida veel kaasa võtta? Hotellis on saun ja bassein. Palun anna nõu! Ma olen natuke närvis. Sofia',
        [['Kui külm on Lapimaal?', 'miinus kakskümmend viis kraadi|−25'], ['Mida teeb Sofia pühapäeval?', 'läheb suusatama|suusatab'], ['Miks peavad nad õhtul õues olema?', 'nad tahavad vaadata virmalisi|virmalised'], ['Mis Sofial puudub?', 'kindad|kindaid ei ole'], ['Mis on hotellis?', 'saun ja bassein']]),
      B.table('054_t_list', 'Pakkimise nimekiri.', 'Kirjuta Sofiale, mida kaasa võtta ja miks.', 'Asi, Kas Sofial on?, Miks on vaja?', ['Soe jope | | ', 'Kindad | | ', 'Soojad saapad | | ', 'Ujumisriided | | ', 'Sall | | ']),
      B.gaps('054_t_gaps', 'Nõuande laused.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        '[Võta] kaasa soe jope! (võtma)', 'Osta uued [kindad]. (kindad)', 'Ära unusta [ujumisriideid]! (ujumisriided)',
        'Pane villased sokid [jalga]! (jalg)', 'Õues on [külmem] kui Eestis. (külm, keskvõrre)', 'Pane sall [kaela], sest tuul on tugev. (kael)',
      ]),
      B.transformation('054_t_trans', 'Anna nõu viisakalt.', 'Kirjuta nõuanne uue alguse järgi.', [
        ['Võta kindad!', 'Ma soovitan …', 'Ma soovitan võtta kindad.|Ma soovitan võtta kaasa kindad.'], ['Osta uued saapad!', 'Ma soovitan …', 'Ma soovitan osta uued saapad.'],
        ['Pane sall kaela!', 'Parem pane …', 'Parem pane sall kaela.'], ['Ära unusta mütsi!', 'Kindlasti …', 'Kindlasti võta müts kaasa.|Kindlasti ära unusta mütsi.'],
        ['Võta ujumisriided kaasa!', 'Ma soovitan …', 'Ma soovitan võtta kaasa ujumisriided.|Ma soovitan võtta ujumisriided.'],
      ]),
      B.planning('054_t_plan', 'Enne kirjutamist.', 'Kirjuta neli nõuannet ja põhjused märksõnadega.', ['Riided (selga)', 'Pea, käed, jalad', 'Muu (saun, bassein)', 'Rahusta Sofiat'], 2),
      B.letter('054_t_letter', 'Vastus Sofiale.', 'Kirjuta 30–50 sõna: vähemalt neli nõuannet ja põhjused.', 'Tere, Sofia!', 'Head reisi!', [30, 50]),
      B.speaking('054_t_say', 'Häälsõnum.', 'Salvesta Sofiale häälsõnum: mida selga panna ja kaasa võtta.', ['Tervita Sofiat.', 'Ütle, mida selga panna.', 'Ütle, mida kaasa võtta.', 'Ütle, mida mitte unustada.'], [60, 90], ['Pane…, sest…', 'Ära unusta…!']),
      B.rolecards('054_t_roles', 'Poes.', 'Sofia ostab poes talveriideid. Müüja annab nõu.', 'Oled Sofia. Sa vajad kindaid ja sooja jopet. Raha on 150 eurot. Küsi hinda ja nõu.', 'Oled müüja. Paku kahte jopet: soojem ja kallim, odavam ja õhem. Anna nõu.', ['Mul on vaja…', 'Kumb on soojem?'], ['See on soojem, aga kallim.', 'Ma soovitan…']),
      B.writing('054_t_write', 'Minu talveriided.', 'Kirjuta 5–6 lauset: mida sa ise Eesti talvel kannad ja miks.', [5, 6], ['kannan', 'selga', 'sest', 'külm'], 2),
      B.translation('054_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я советую купить тёплые сапоги.', 'Не забудь перчатки!', 'Там холоднее, чем в Эстонии.', 'Возьми с собой купальник.', 'Хорошей поездки!']),
      B.rubric('054_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on vähemalt neli nõuannet (30–50 sõna).', 'Igal nõuandel on põhjus sõnaga sest.', 'Käskiv vorm ja selga / pähe / jalga / kätte on õiged.', 'Häälsõnum on arusaadav ja viisakas.']),
      B.selfcheck('054_t_self', ['Ma loen sõbra sõnumit ja leian probleemi.', 'Ma koostan pakkimise nimekirja.', 'Ma annan kirjas ja suuliselt neli nõuannet.', 'Ma küsin poes nõu ja võrdlen.'], 'Sofia on reisiks valmis'),
    ],
  },

  'a2-055': {
    title: 'Kontroll 11 — ilm',
    canDo: 'Ma näitan kontrollis, et saan aru ilmateatest, kirjeldan ja võrdlen ilma ning annan ilma järgi nõu riiete kohta (vähemalt 70%).',
    discover: [
      B.text('055_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: ilm ja aastaajad, keskvõrre, ilmateade ning riided ja nõuanded.'),
      B.notice('055_d_notice', 'Mooduli kokkuvõte', ['Ilm: **Täna on pilvine. Sajab vihma. Puhub tuul. Paistab päike.**', 'Aastaajad: **kevadel, suvel, sügisel, talvel**', 'Võrdlus: **Täna on soojem kui eile. Hea → parem.**', 'Ilmateade: **pluss / miinus viis kraadi, öösel, temperatuur langeb**', 'Nõu: **Pane müts pähe! Võta vihmavari kaasa! Ära unusta kindaid!**']),
      B.reading('055_d_read', 'Loe: Viktori talv.', 'Loe teksti ja vasta küsimustele.', 'Viktor ja talv',
        'Viktor elab Tartus. Tema lemmik aastaaeg on talv. Talvel on Tartus külmem kui Tallinnas. Jaanuaris on tihti kakskümmend kraadi külma. Viktor ütleb, et külm ei ole probleem. Tähtis on, et riided on õiged. Ta paneb selga paksu jope ja kaks kampsunit. Pähe paneb ta villase mütsi ja kätte soojad kindad. Jalga paneb ta talvesaapad. Igal laupäeval läheb Viktor metsa suusatama. Enne kuulab ta alati ilmateadet. Kui sajab tugevat lund või puhub tugev tuul, jääb ta koju. Siis mängib ta malet. Viktori naine eelistab suve. Tema arvates on suvi palju parem, sest päevad on pikemad.',
        [['Kus on talvel külmem, Tartus või Tallinnas?', 'Tartus'], ['Mida paneb Viktor pähe?', 'villase mütsi|mütsi'], ['Mida paneb Viktor jalga?', 'talvesaapad|talvesaapaid'], ['Millal läheb Viktor suusatama?', 'igal laupäeval|laupäeviti'], ['Mida Viktor teeb, kui puhub tugev tuul?', 'jääb koju ja mängib malet|jääb koju'], ['Miks eelistab Viktori naine suve?', 'päevad on pikemad']]),
      B.categorize('055_d_sort', 'Mooduli sõnad.', 'Pane sõnad õigesse rühma.', [
        ['Ilm', ['pilvine', 'tuuline', 'udu', 'äike']], ['Riided', ['mantel', 'kindad', 'sall', 'kummikud']], ['Ilmateade', ['kraad', 'temperatuur', 'miinus', 'pakane']],
      ]),
      B.wordforms('055_d_forms', 'Kordame vorme.', 'Kirjuta sõna õiges vormis.', [['vihm', '… ilm (omadussõna)', 'vihmane'], ['soe', 'keskvõrre', 'soojem'], ['hea', 'keskvõrre', 'parem'], ['talv', 'millal?', 'talvel'], ['panema', 'käskiv (sina)', 'pane'], ['kraad', 'viis …', 'kraadi']]),
      B.transformation('055_d_trans', 'Ütle teisiti.', 'Kirjuta lause uue alguse järgi.', [
        ['Täna on vihmane ilm.', 'Täna sajab …', 'Täna sajab vihma.'], ['Täna +8, eile +3.', 'Täna on …', 'Täna on soojem kui eile.'],
        ['Sa pead mütsi pähe panema.', 'Pane …!', 'Pane müts pähe!'], ['öö, −6 °C', 'Öösel on …', 'Öösel on miinus kuus kraadi.|Öösel on kuus kraadi külma.'],
        ['Sa ei tohi vihmavarju unustada.', 'Ära …!', 'Ära unusta vihmavarju!'],
      ]),
      B.errorfix('055_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Täna sajab lumi.', 'Täna sajab lund.'], ['See jope on heam.', 'See jope on parem.'], ['Pane kindad jalga!', 'Pane kindad kätte!'], ['Suves on palav.', 'Suvel on palav.'],
      ]),
      B.match('055_d_match', 'Ilm ja nõuanne.', 'Ühenda ilm ja nõuanne.', [['Sajab vihma.', 'Võta vihmavari kaasa!'], ['On kõva pakane.', 'Pane soojad kindad kätte!'], ['On palav.', 'Pane kerge kleit selga!'], ['Tee on libe.', 'Pane head saapad jalga!'], ['Puhub tugev tuul.', 'Pane sall kaela!'], ['Õhtul on jahe.', 'Võta kampsun kaasa!']], 'full', 'g_use'),
      B.gaps('055_d_gaps', 'Kordame vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', ['Täna [puhub] tugev tuul. (puhuma)', 'Tartus on [külmem] kui Tallinnas. (külm)', 'Öösel on viis [kraadi] külma. (kraad)', '[Võta] vihmavari kaasa! (võtma)', 'Ära unusta [kindaid]! (kindad)', '[Sügisel] sajab palju vihma. (sügis)']),
      B.wordorder('055_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Talvel on Tartus külmem kui Tallinnas.', 'Igal laupäeval läheb Viktor suusatama.', 'Pane villane müts pähe!', 'Enne kuulab ta ilmateadet.']),
      B.truefalse('055_d_tf', 'Õige või vale?', 'Loe Viktori teksti uuesti.', [['Viktori lemmik aastaaeg on suvi.', false], ['Jaanuaris on Tartus tihti külm.', true], ['Viktor kuulab enne suusatamist ilmateadet.', true], ['Tugeva tuulega läheb Viktor metsa.', false], ['Viktori naisele meeldivad pikad päevad.', true]]),
      B.translation('055_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сегодня облачно и ветрено.', 'Сегодня теплее, чем вчера.', 'Ночью минус десять градусов.', 'Надень шапку!', 'Моё любимое время года — лето.', 'Возьми зонт с собой!']),
      B.dictation('055_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Täna on pilvine ja tuuline.', 'Öösel on −10 kraadi.', 'Tartus on külmem kui Tallinnas.', 'Võta vihmavari kaasa!', 'Ära unusta kindaid!'], 5),
      B.speaking('055_d_say', 'Proovieksam: ilm.', 'Vasta paarilise küsimustele, nagu eksamil.', ['Mis ilm täna on?', 'Mis on teie lemmik aastaaeg ja miks?', 'Kus on talvel külmem: Eestis või teie kodumaal?', 'Mida te talvel selga panete?'], [60, 90]),
      B.writing('055_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset: võrdle suve ja talve Eestis.', [6, 8], ['soojem', 'kui', 'sajab', 'pane'], 2),
      B.selfcheck('055_d_self', ['Ma kirjeldan ilma ja aastaaegu.', 'Ma võrdlen keskvõrdega.', 'Ma annan nõu riiete kohta.', 'Ma olen valmis kontrolliks.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('055_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      B.choice('055_p_signs', 'Lugemine 1. Mida see tähendab?', 'Vali, mida silt või teade tähendab.', [
        ['„Tähelepanu! Teed on libedad.”', 'Sõida aeglaselt.', 'Tee on suletud.', 'Tee on kuiv.'],
        ['„Homme +28 °C.”', 'Homme on palav.', 'Homme on pakane.', 'Homme sajab lund.'],
        ['„Tormihoiatus saartel.”', 'Saartel puhub väga tugev tuul.', 'Saartel on päikeseline.', 'Saartel on udu.'],
        ['„Riidehoid on tasuta.”', 'Jope võib jätta tasuta.', 'Jope maksab vähe.', 'Riideid müüakse odavalt.'],
        ['„Talvejoped –30%.”', 'Talvejoped on odavamad.', 'Talvejoped on kallimad.', 'Talvejopesid ei ole.'],
      ]),
      B.reading('055_p_read', 'Lugemine 2. Ilmateade.', 'Loe ilmateadet ja vasta küsimustele.', 'Ilm nädalavahetusel',
        'Reedel on Eestis pilvine. Päeval sajab vihma, eriti Lõuna-Eestis. Temperatuur on kuus kuni üheksa kraadi. Õhtul vihm lõpeb. Laupäeval tuleb põhjast külm õhk. Hommikul on miinus kaks kraadi ja teed on libedad. Päeval paistab päike, aga on külm, ainult kaks kraadi sooja. Saartel puhub tugev tuul. Pühapäeval on veel külmem. Öösel on kuni miinus kaheksa kraadi. Päeval võib sadada esimest lund. Lastele on see hea uudis, sest nad saavad kelgutada. Kõige külmem on Lõuna-Eestis, kõige soojem saartel. Kui sõidate autoga, olge ettevaatlikud. Autojuhid peaksid vahetama rehvid talverehvide vastu. Järgmisel nädalal on ilm jälle soojem.',
        [['Kus sajab reedel eriti palju vihma?', 'Lõuna-Eestis'], ['Kui külm on laupäeva hommikul?', 'miinus kaks kraadi|−2'], ['Mis ilm on laupäeval päeval?', 'päike paistab, aga on külm|päikeseline ja külm'], ['Mis võib pühapäeval sadada?', 'lund|esimest lund'], ['Mida peaksid autojuhid tegema?', 'vahetama rehvid|panema talverehvid']]),
      B.cloze('055_p_cloze', 'Lugemine 3. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kati!', [
        'Laupäeval on {*külm|külmem|külma} ilm, ainult kaks kraadi. Pühapäeval on veel {*külmem|külm|külmam}.',
        'Kui me läheme matkama, {*pane|panen|paneb} soe jope selga. Ära unusta {*kindaid|kindad|kinnas}!',
        'Hommikul on teed libedad, {*sest|aga|ja} öösel on miinus. Võta ka termos {*kaasa|selga|pähe}. Liis',
      ]),
      B.reading('055_p_shop', 'Lugemine 4. Kuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Spordipood Talveke',
        'Talv tuleb! Spordipoes Talveke on suur talvemüük. Kõik talvejoped on 30% odavamad. Sooja jope saab nüüd osta alates 49 eurost. Lastele on kindad ja mütsid kaks ühe hinnaga. Talvesaapad on 20% odavamad. Uus kaup on suusad. Suuski saab ka laenutada: üks päev maksab kümme eurot. Müük kestab 1. kuni 15. detsembrini. Pood on avatud iga päev kella kümnest kaheksani. Me asume kaubanduskeskuse teisel korrusel. Meie müüjad aitavad valida õiget suurust. Maksta saab sularahas ja kaardiga. Kauba saab tagastada 14 päeva jooksul. Kui ostad üle saja euro, saad tasuta termose. Tule varakult, sest head asjad lõpevad kiiresti!',
        [['Kui palju odavamad on talvejoped?', '30%|kolmkümmend protsenti'], ['Kui palju maksab suuskade laenutus päevas?', 'kümme eurot|10 eurot'], ['Millal müük lõpeb?', '15. detsembril|15. detsembrini'], ['Kus pood asub?', 'kaubanduskeskuse teisel korrusel|teisel korrusel'], ['Mida saab tasuta?', 'termose|termos']]),
      B.listening('055_p_listen', 'Kuulamine 1. Ilmateade.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere õhtust! Mina olen Tarmo ja nüüd on ilmateade.', 'Homme hommikul on udu, eriti Ida-Eestis.', 'Päeval on pilvine ja temperatuur on kuni viis kraadi.',
        'Õhtul hakkab sadama lörtsi.', 'Puhub tugev tuul põhjast.', 'Öösel langeb temperatuur kuni miinus neli kraadi.',
      ], ['Hommikul on [udu].', 'Udu on eriti [Ida-Eestis].', 'Päeval on kuni [viis|5] kraadi.', 'Õhtul hakkab sadama [lörtsi].', 'Tuul puhub [põhjast].', 'Öösel on [miinus] neli kraadi.']),
      B.listening('055_p_listen2', 'Kuulamine 2. Vestlus.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Oksana: Mia, kas sa oled valmis? Väljas on miinus kümme.', 'Mia: Jah! Mul on jope seljas ja müts peas.', 'Oksana: Aga kus on su kindad?',
        'Mia: Kindad on seljakotis.', 'Oksana: Pane need kätte. Ja võta sall ka, tuul on täna külmem kui eile.', 'Mia: Hea küll. Lähme!',
      ], ['Väljas on [miinus] kümme.', 'Mial on peas [müts].', 'Kindad on [seljakotis].', 'Oksana ütleb, et võta ka [sall].', 'Tuul on külmem kui [eile].']),
      B.gaps('055_p_mix', 'Keel. Viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Täna on [tuuline] ilm. (tuul)', 'Homme on [soojem] kui täna. (soe)', '[Talvel] sajab lund. (talv)', 'Öösel on kolm [kraadi] külma. (kraad)', '[Pane] kindad kätte! (panema)',
      ]),
      B.gaps('055_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'See jope on [parem] kui too. (hea)', 'Õhtul hakkab [sadama] vihma. (sadama)', 'Ära unusta [vihmavarju]! (vihmavari)', 'Pane müts [pähe]! (pea)', 'Suvel on päevad [pikemad]. (pikk)',
      ]),
      B.wordorder('055_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Homme on soojem kui täna.', 'Õhtul hakkab sadama lund.', 'Pane soe jope selga!', 'Kevadel sulab lumi.']),
      B.errorfix('055_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Täna sajab vihm.', 'Täna sajab vihma.'], ['Tallinn on suurem nagu Tartu.', 'Tallinn on suurem kui Tartu.'], ['Ära unusta müts!', 'Ära unusta mütsi!'], ['On kümme kraad sooja.', 'On kümme kraadi sooja.'],
      ]),
      B.translation('055_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Завтра будет холоднее.', 'Идёт снег.', 'Возьми шарф с собой!', 'Ночью минус четыре градуса.', 'Летом дни длиннее.']),
      B.writing('055_p_write', 'Kirjutamine. Sõnum.', 'Kirjuta Katile 4–6 lauset: mis ilm on laupäeval ja mida selga panna.', [4, 6], ['laupäeval', 'kraadi', 'pane'], 2),
      B.speaking('055_p_say', 'Rääkimine. Ilm.', 'Vasta õpetaja küsimustele, nagu eksamil.', ['Mis ilm täna on?', 'Mis ilm oli eile? Kas täna on soojem?', 'Mida te täna selga panite ja miks?', 'Mis on teie lemmik aastaaeg?'], [60, 90]),
      B.selfcheck('055_p_self', ['Ma saan aru ilmateatest ja kuulutusest.', 'Ma kuulen temperatuuri ja ilma.', 'Ma kasutan keskvõrret ja käskivat vormi õigesti.', 'Ma vastan küsimustele ilma kohta.'], 'Kontroll tehtud'),
    ],
    transfer: [
      B.text('055_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sinu sõber Markus tuleb järgmisel nädalal Tartusse. Ta küsib, mis ilm siin on ja mida kaasa võtta. Kirjuta talle, räägi ilmast ja anna nõu. Eesmärk on vähemalt 70%.'),
      B.reading('055_t_read', 'Lugemine. Markuse kiri.', 'Loe kirja ja vasta küsimustele.', 'Markuse kiri',
        'Tere! Ma tulen järgmisel teisipäeval Tartusse kolmeks päevaks. Mul on seal töö pärast koolitus. Kolmapäeva õhtul tahan minna jooksma, sest ma jooksen iga päev. Neljapäeval tahan näha linna ja muuseumi. Ma ei tea, mis ilm Tartus novembris on. Kas seal on juba lumi? Kas mul on vaja talvejopet või piisab sügisjopest? Mul on kaasas ainult väike kohver, sest ma sõidan bussiga. Palun kirjuta, mida kaasa võtta. Kas Tartus on külmem kui Tallinnas? Ma elan praegu Pärnus, siin on üsna soe. Aitäh! Markus',
        [['Millal Markus Tartusse tuleb?', 'järgmisel teisipäeval|teisipäeval'], ['Miks ta Tartusse tuleb?', 'koolitusele|tal on koolitus|töö pärast koolitusele'], ['Mida ta tahab kolmapäeva õhtul teha?', 'jooksma minna|joosta'], ['Miks on tal väike kohver?', 'ta sõidab bussiga|sest ta sõidab bussiga'], ['Kus Markus praegu elab?', 'Pärnus']]),
      B.listening('055_t_listen', 'Kuulamine. Tartu ilmateade.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Tarmo ja nüüd on Tartu ilm järgmiseks nädalaks.', 'Teisipäeval on pilvine ja kolm kraadi sooja.', 'Kolmapäeval sajab vihma ja puhub tugev tuul.',
        'Neljapäeval on päikeseline, aga külm, miinus kaks kraadi.', 'Lund veel ei ole. Head nädalat!',
      ], ['Teisipäeval on [pilvine].', 'Teisipäeval on [kolm|3] kraadi sooja.', 'Kolmapäeval sajab [vihma].', 'Neljapäeval on [miinus] kaks kraadi.', 'Lund veel [ei ole].']),
      B.table('055_t_table', 'Kirjutamine 1. Nõuanded.', 'Täida tabel: ilm ja nõuanne igaks päevaks.', 'Päev, Ilm, Nõuanne Markusele', ['Teisipäev | | ', 'Kolmapäev | | ', 'Neljapäev | | ']),
      B.errorfix('055_t_fix', 'Kontrolli lauseid.', 'Kirjuta lause õigesti.', [
        ['Tartus on külmem nagu Pärnus.', 'Tartus on külmem kui Pärnus.'], ['Kolmapäeval sajab vihm.', 'Kolmapäeval sajab vihma.'], ['Võtta soe jope!', 'Võta soe jope!'], ['Ära unusta müts!', 'Ära unusta mütsi!'],
      ]),
      B.planning('055_t_plan', 'Enne kirja.', 'Kirjuta märksõnad: mida sa Markusele kirjutad.', ['Mis ilm on Tartus?', 'Kas Tartus on külmem kui Pärnus?', 'Mida kaasa võtta ja miks?'], 2),
      B.letter('055_t_letter', 'Kirjutamine 2. Vastus Markusele.', 'Kirjuta 30–50 sõna: ilm, võrdlus, kaks nõuannet.', 'Tere, Markus!', 'Kohtumiseni!', [30, 50]),
      B.transformation('055_t_check', 'Kontrolli lauseid.', 'Kirjuta lause õigesti uue alguse järgi.', [
        ['Sa pead sooja jope võtma.', 'Võta …!', 'Võta soe jope kaasa!|Võta soe jope!'], ['Tartu: −2. Pärnu: +4.', 'Tartus on …', 'Tartus on külmem kui Pärnus.'],
        ['Kolmapäeval on vihmane ilm.', 'Kolmapäeval sajab …', 'Kolmapäeval sajab vihma.'], ['Sa ei tohi kindaid unustada.', 'Ära …!', 'Ära unusta kindaid!'],
      ]),
      B.writing('055_t_write', 'Kirjutamine 3. Minu aastaaeg.', 'Kirjuta 6–8 lauset: sinu lemmik aastaaeg, ilm ja riided.', [6, 8], ['aastaaeg', 'ilm', 'kannan', 'kui'], 3),
      B.speaking('055_t_say', 'Rääkimine 1. Ilm ja aastaajad.', 'Räägi umbes üks minut ilmast Eestis ja oma kodumaal.', ['Mis ilm on praegu Eestis?', 'Kus on talvel külmem?', 'Mis on sinu lemmik aastaaeg ja miks?', 'Mida sa talvel selga paned?'], [60, 90]),
      B.rolecards('055_t_roles', 'Rääkimine 2. Dialoog.', 'Markus helistab. Andke nõu ilma ja riiete kohta.', 'Oled Markus. Küsi Tartu ilma kohta, võrdle Pärnuga. Küsi, mida kaasa võtta jooksmiseks.', 'Oled Tartus. Räägi ilmateate järgi. Anna vähemalt kolm nõuannet põhjusega.', ['Kas Tartus on külmem?', 'Mida ma peaksin kaasa võtma?'], ['Jah, Tartus on…', 'Võta…, sest…']),
      B.rubric('055_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Tabelis on iga päeva ilm ja sobiv nõuanne.', 'Kirjas on ilm, võrdlus ja kaks nõuannet (30–50 sõna).', 'Keskvõrre, käskiv vorm ja ilmasõnad on õiges vormis.', 'Suuline tekst on arusaadav, umbes minut.', 'Dialoogis antakse nõu ja põhjendatakse.']),
      B.selfcheck('055_t_self', ['Ma kuulan ilmateadet ja kasutan infot.', 'Ma kirjutan kirja ilmast ja annan nõu.', 'Ma räägin ilmast ja aastaaegadest umbes minuti.', 'Ma annan telefonis nõu põhjusega.'], 'Moodul 11 on läbitud'),
    ],
  },
};
