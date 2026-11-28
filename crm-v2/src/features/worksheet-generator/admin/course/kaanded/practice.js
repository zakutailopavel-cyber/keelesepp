// „Käänded lauses” v2 (owner 2026-11-28 after the first publish: „заданий мало по каждой теме, очень”): the extra practice
// of the six lessons. module01.js puts these blocks into each Harjuta in the gradient recognise → choose → produce:
//   find (sort the forms) → match → choice (module01) → table → word forms → form texts → transformation → error fixing →
//   translation RU → ET (the teacher checks; the model key is in the teacher note) → „Abi ja lisaväljakutse” (module01)
// plus one example block for Avasta and a second speaking task for Kasuta. Every block has 8–12 items; later lessons
// recycle the earlier cases (osastav after „ei”, -s / -st / -sse, -le / -l / -lt, -ga). Every key was checked with
// Vabamorf (EstNLTK) like the v1 keys.
import { B, teach } from '../blocks.js';

const cols3 = (block) => ({ ...block, opts: { ...(block.opts || {}), cols: 3 } });
// translation RU → ET: a teacher-checked task; the model answers go into the teacher's note
const translate = (id, rows) => teach(B.translation(id, 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', rows.map(([ru]) => ru), 'full'),
  `Ключ (образец): ${rows.map(([, et], i) => `${i + 1}) ${et}`).join(' ')}`);
const examples = (id, title, headers, rows) => B.table(id, title, 'Loe näiteid. Märka lõppu.', headers, rows, 'g_notice');

export const MORE = {
  // ===================================================================================================================
  'kaanded-001': {
    examples: examples('k1_d_examples', 'Näited: üks sõna lauses.', 'Küsimus, Lause', [
      'kus? | Lapsed on **koolis**.', 'kuhu? | Hommikul lähen **kooli**.', 'kust? | Ema tuleb **koolist**.',
      'kellele? | Ma helistan **sõbrale**.', 'kellel? | **Sõbral** on uus auto.', 'kellelt? | Ma sain **sõbralt** kirja.',
      'kellega? | Ma lähen kinno **sõbraga**.', 'milleta? | Ma joon kohvi **suhkruta**.',
    ]),
    find: B.categorize('k1_p_find', 'Sorteeri vormid.', 'Pane iga sõna õige küsimuse alla.', [
      ['Kus?', ['koolis', 'laual', 'Tartus']],
      ['Kuhu?', ['koolisse', 'lauale', 'Tartusse']],
      ['Kust?', ['koolist', 'laualt', 'Tartust']],
      ['Kellega? Millega? Milleta?', ['emaga', 'bussiga', 'suhkruta']],
    ], 'full', 'g_notice'),
    match: B.match('k1_p_match', 'Lõpp ja küsimus.', 'Ühenda lõpp ja küsimus.', [
      ['-sse', 'kuhu? (sisse)'], ['-s', 'kus? (sees)'], ['-st', 'kust? (seest)'],
      ['-le', 'kuhu? kellele? (peale)'], ['-l', 'kus? kellel? (peal)'], ['-lt', 'kust? kellelt? (pealt)'],
      ['-ks', 'kelleks? milleks?'], ['-ni', 'milleni? mis ajani?'], ['-na', 'kellena? millena?'],
      ['-ta', 'kelleta? milleta?'], ['-ga', 'kellega? millega?'],
    ], 'full', 'g_notice'),
    table: B.table('k1_p_table', 'Omastav + lõpp.', 'Omastav on antud. Lisa lõpp.', 'Nimetav, Omastav, -s (kus?), -st (kust?), -ga (millega?)', [
      'kool | kooli | [koolis] | [koolist] | [kooliga]',
      'pood | poe | [poes] | [poest] | [poega]',
      'tuba | toa | [toas] | [toast] | [toaga]',
      'linn | linna | [linnas] | [linnast] | [linnaga]',
      'raamat | raamatu | [raamatus] | [raamatust] | [raamatuga]',
      'buss | bussi | [bussis] | [bussist] | [bussiga]',
      'laud | laua | [lauas] | [lauast] | [lauaga]',
      'kohvik | kohviku | [kohvikus] | [kohvikust] | [kohvikuga]',
    ], 'g_notice'),
    transformation: B.transformation('k1_p_transf', 'Uus küsimus, uus lõpp.', 'Kasuta antud algust.', [
      ['Ma olen koolis.', 'Kust? Ma tulen …', 'Ma tulen koolist.'],
      ['Raamat on laual.', 'Kuhu? Pane raamat …', 'Pane raamat lauale.'],
      ['Ma elan Tartus.', 'Kuhu? Ma sõidan …', 'Ma sõidan Tartusse.'],
      ['Ema on poes.', 'Kust? Ema tuleb …', 'Ema tuleb poest.'],
      ['Ma lähen kinno.', 'Kus? Ma olen …', 'Ma olen kinos.'],
      ['Sõber on bussis.', 'Kust? Sõber tuleb …', 'Sõber tuleb bussist.'],
      ['Ma räägin sõbraga.', 'Kellele? Ma helistan …', 'Ma helistan sõbrale.'],
      ['Kohv on suhkruga.', 'Milleta? Kohv on …', 'Kohv on suhkruta.'],
    ]),
    translation: translate('k1_p_tr', [
      ['Я живу в Таллине.', 'Ma elan Tallinnas.'], ['Я иду в магазин.', 'Ma lähen poodi. / Ma lähen poesse.'],
      ['Мама приходит из школы.', 'Ema tuleb koolist.'], ['Я пью чай без сахара.', 'Ma joon teed suhkruta.'],
      ['Я еду на автобусе.', 'Ma sõidan bussiga.'], ['Книга на столе.', 'Raamat on laual.'],
      ['Я звоню другу.', 'Ma helistan sõbrale.'], ['Мы сидим в кафе.', 'Me istume kohvikus.'],
    ]),
    speak2: teach(B.speaking('k1_t_game', 'Mäng: üks sõna, palju vorme.', 'Paariline ütleb sõna ja küsimuse. Sina ütled lause.', [
      'pood — kust?', 'kool — kuhu?', 'sõber — kellega?', 'buss — millega?', 'linn — kus?', 'ema — kellele?', 'kohv — milleta?', 'laud — kuhu?',
    ], [60, 120]), 'Учитель: быстрая игра 5 минут. Учитель называет слово и вопрос, ученик — предложение. Потом роли меняются.'),
  },

  // ===================================================================================================================
  'kaanded-002': {
    examples: examples('k2_d_pairs', 'Näited: osa või terve?', 'Osa: tegevus kestab (osastav), Terve: tegevus lõpeb (omastav)', [
      'Ma söön **suppi**. | Ma sõin **supi** ära.', 'Ma loen **raamatut**. | Ma lugesin **raamatu** läbi.',
      'Ta joob **piima**. | Ta jõi **piima** ära.', 'Me ehitame **maja**. | Me ehitasime **maja** valmis.',
      'Ma otsin **võtit**. | Ma leidsin **võtme**.', 'Ta kirjutab **luuletust**. | Ta kirjutas **luuletuse** valmis.',
    ]),
    findCase: cols3(B.choice('k2_p_case', 'Mis kääne?', 'Vali paksu sõna kääne.', [
      ['**Ema** loeb.', 'nimetav', 'omastav', 'osastav'],
      ['See on **ema** raamat.', 'omastav', 'nimetav', 'osastav'],
      ['Ma ootan **ema**.', 'osastav', 'nimetav', 'omastav'],
      ['**Laps** mängib õues.', 'nimetav', 'omastav', 'osastav'],
      ['Ma näen **last**.', 'osastav', 'nimetav', 'omastav'],
      ['**Lapse** nimi on Mia.', 'omastav', 'nimetav', 'osastav'],
      ['Ma ostsin **leiva**.', 'omastav', 'nimetav', 'osastav'],
      ['Ma söön **leiba**.', 'osastav', 'nimetav', 'omastav'],
      ['Kass on **laua** all.', 'omastav', 'nimetav', 'osastav'],
      ['**Raamatud** on kotis.', 'nimetav', 'omastav', 'osastav'],
    ], 'full', 'g_notice')),
    find: B.categorize('k2_p_sort', 'Terve või osa?', 'Pane laused õigesse rühma.', [
      ['Täissihitis: tegevus lõpeb', ['ostis leiva', 'leidis võtme', 'sõi supi ära', 'parandas auto ära', 'pesi akna puhtaks']],
      ['Osasihitis: kestab, osa, eitus', ['ostab leiba', 'ei leidnud võtit', 'sõi suppi', 'ootab bussi', 'armastab muusikat']],
    ], 'full', 'g_notice'),
    table: B.table('k2_p_forms', 'Kirjuta osastav.', 'Sageli: omastav + -t või sama vorm.', 'Nimetav, Omastav, Osastav (keda? mida?)', [
      'maja | maja | [maja]', 'kool | kooli | [kooli]', 'kass | kassi | [kassi]', 'auto | auto | [autot]', 'tee | tee | [teed]',
      'piim | piima | [piima]', 'õun | õuna | [õuna]', 'telefon | telefoni | [telefoni]', 'naine | naise | [naist]', 'õpilane | õpilase | [õpilast]',
    ], 'g_notice'),
    formtext2: B.formtext('k2_p_shop', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna sobivas käändes.', 'Poes', [
      'Laupäeval lähen poodi. Kõigepealt otsin [leiba] (leib). Ma võtan kaks [pätsi] (päts) leiba ja ühe [paki] (pakk) piima. Siis ostan kilo [juustu] (juust) ja natuke [vorsti] (vorst).',
      'Kassas pean kaua ootama [müüjat] (müüja). Ma maksan [arve] (arve) kaardiga ära. Kodus näen, et ma ei ostnud [suhkrut] (suhkur). Ma kirjutan [sõnumi] (sõnum) mehele: „Too palun suhkrut!” Õhtul söön [võileiba] (võileib) ja joon [teed] (tee).',
    ]),
    errorfix: B.errorfix('k2_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
      ['Ma ei osta leib.', 'Ma ei osta leiba.'], ['Mul on kaks auto.', 'Mul on kaks autot.'], ['Ma ootan buss.', 'Ma ootan bussi.'],
      ['Ma armastan muusika.', 'Ma armastan muusikat.'], ['Mul ei ole aeg.', 'Mul ei ole aega.|Mul pole aega.'], ['Laual on kolm õun.', 'Laual on kolm õuna.'],
      ['Ma lugesin raamatut läbi.', 'Ma lugesin raamatu läbi.'], ['Ema raamatu on laual.', 'Ema raamat on laual.'],
    ]),
    translation: translate('k2_p_tr', [
      ['У меня нет машины.', 'Mul ei ole autot. / Mul pole autot.'], ['Я жду автобус.', 'Ma ootan bussi.'], ['Я купил хлеб.', 'Ma ostsin leiva.'],
      ['Я пью кофе.', 'Ma joon kohvi.'], ['На столе три яблока.', 'Laual on kolm õuna.'], ['Это мамина книга.', 'See on ema raamat.'],
      ['Я прочитал книгу.', 'Ma lugesin raamatu läbi.'], ['Я люблю музыку.', 'Ma armastan muusikat.'],
    ]),
    speak2: teach(B.speaking('k2_t_yesterday', 'Paaris: mida sa eile tegid?', 'Küsi paarilt. Vasta täislausega.', [
      'Mida sa eile sõid?', 'Mida sa poest ostsid?', 'Mida sa lugesid või vaatasid?', 'Mida sa eile ei teinud?', 'Kas sa lõpetasid kõik tööd?', 'Keda sa eile nägid?',
    ], [60, 120]), 'Учитель: следить за полным объектом (ostsin leiva) и osastav после «ei» (ei teinud tööd).'),
  },

  // ===================================================================================================================
  'kaanded-003': {
    examples: examples('k3_d_examples', 'Näited: kuhu, kus, kust.', 'Kuhu?, Kus?, Kust?', [
      'Lähen **kooli**. | Olen **koolis**. | Tulen **koolist**.', 'Sõidan **Tartusse**. | Elan **Tartus**. | Tulen **Tartust**.',
      'Lähen **tuppa**. | Olen **toas**. | Tulen **toast**.', 'Lähen **poodi**. | Olen **poes**. | Tulen **poest**.',
      'Lähen **koju**. | Olen **kodus**. | Tulen **kodust**.', 'Panen **kappi**. | On **kapis**. | Võtan **kapist**.',
    ]),
    find: B.categorize('k3_p_find', 'Sorteeri vormid.', 'Kuhu, kus või kust?', [
      ['Kuhu? →', ['majja', 'kooli', 'tuppa', 'poodi']],
      ['Kus? •', ['majas', 'koolis', 'toas', 'poes']],
      ['Kust? ←', ['majast', 'koolist', 'toast', 'poest']],
    ], 'full', 'g_notice'),
    match: B.match('k3_p_match', 'Eesti ja vene keel.', 'Ühenda eesti vorm ja vene tõlge.', [
      ['majja', 'в дом'], ['majas', 'в доме'], ['majast', 'из дома'], ['kooli', 'в школу'], ['koolis', 'в школе'],
      ['koolist', 'из школы'], ['linna', 'в город'], ['linnas', 'в городе'], ['linnast', 'из города'],
    ], 'full', 'g_notice'),
    table: B.table('k3_p_grid', 'Veel üks 3 × 3.', 'Täida tabel: -sse, -s, -st.', 'Sõna (omastav), Kuhu?, Kus?, Kust?', [
      'kapp (kapi) | [kappi/kapisse] | [kapis] | [kapist]',
      'kott (koti) | [kotti/kotisse] | [kotis] | [kotist]',
      'auto (auto) | [autosse] | [autos] | [autost]',
      'buss (bussi) | [bussi/bussisse] | [bussis] | [bussist]',
      'kino (kino) | [kinno/kinosse] | [kinos] | [kinost]',
      'köök (köögi) | [kööki/köögisse] | [köögis] | [köögist]',
      'Eesti (Eesti) | [Eestisse] | [Eestis] | [Eestist]',
      'park (pargi) | [parki/pargisse] | [pargis] | [pargist]',
    ], 'g_notice'),
    wordforms: B.wordforms('k3_p_forms', 'Kirjuta vorm.', 'Sulgudes on omastav.', [
      ['raamatukogu (raamatukogu)', 'kus? -s', 'raamatukogus'], ['haigla (haigla)', 'kuhu? -sse', 'haiglasse'],
      ['teater (teatri)', 'kust? -st', 'teatrist'], ['kauplus (kaupluse)', 'kus? -s', 'kaupluses'],
      ['saun (sauna)', 'kust? -st', 'saunast'], ['Tallinn (Tallinna)', 'kuhu? -sse', 'Tallinnasse, Tallinna'],
      ['meri (mere)', 'kuhu? -sse', 'merre, meresse'], ['mets (metsa)', 'kus? -s', 'metsas'],
      ['Narva (Narva)', 'kust? -st', 'Narvast'], ['kohvik (kohviku)', 'kuhu? -sse', 'kohvikusse'],
    ], 'full'),
    errorfix: B.errorfix('k3_p_fix', 'Paranda viga.', 'Liikumine või koht? Kirjuta õigesti.', [
      ['Ma lähen koolis.', 'Ma lähen kooli.|Ma lähen koolisse.'], ['Ma elan Tartusse.', 'Ma elan Tartus.'], ['Ta tuleb poes.', 'Ta tuleb poest.'],
      ['Pane piim külmkapis!', 'Pane piim külmkappi!'], ['Ma olen kodu.', 'Ma olen kodus.'], ['Ma lähen kodusse.', 'Ma lähen koju.'],
      ['Lapsed on toasse.', 'Lapsed on toas.'], ['Ma tulen linnas.', 'Ma tulen linnast.'], ['Ma ei ostnud piim.', 'Ma ei ostnud piima.'],
    ]),
    translation: translate('k3_p_tr', [
      ['Я иду домой.', 'Ma lähen koju.'], ['Мы в кино.', 'Me oleme kinos.'], ['Он едет в Тарту.', 'Ta sõidab Tartusse.'],
      ['Она приехала из Нарвы.', 'Ta tuli Narvast.'], ['Положи книгу в сумку.', 'Pane raamat kotti. / Pane raamat kotisse.'], ['Кот в шкафу.', 'Kass on kapis.'],
      ['Дети идут в школу.', 'Lapsed lähevad kooli. / Lapsed lähevad koolisse.'], ['Мы ждём автобус.', 'Me ootame bussi.'],
    ]),
    speak2: teach(B.speaking('k3_t_where', 'Paaris: kus sa tavaliselt oled?', 'Küsi paarilt. Vasta täislausega.', [
      'Kus sa hommikul oled?', 'Kuhu sa lähed pärast tööd või kooli?', 'Kust sa toitu ostad?', 'Kus sa puhkad?', 'Kuhu sa suvel sõidad?', 'Kust sa pärit oled?',
    ], [60, 120]), 'Учитель: каждый ответ — с формой -sse / -s / -st или короткой формой (kooli, poodi, koju).'),
  },

  // ===================================================================================================================
  'kaanded-004': {
    examples: examples('k4_d_examples', 'Näited: -le, -l, -lt.', 'Tähendus, Kuhu? Kellele?, Kus? Kellel?, Kust? Kellelt?', [
      'koht | Lähen **turule**. | Olen **turul**. | Tulen **turult**.', 'pind | Pane **lauale**. | On **laual**. | Võta **laualt**.',
      'inimene | Helistan **emale**. | **Emal** on auto. | Sain **emalt** kirja.', 'omamine | — | **Mul on** koer. | —',
      'aeg | — | **esmaspäeval**, **õhtul**, **talvel** | —', 'saar | Sõidan **Saaremaale**. | Elan **Saaremaal**. | Tulen **Saaremaalt**.',
    ]),
    find: B.categorize('k4_p_find', 'Mis tähendus?', 'Pane vormid õigesse rühma.', [
      ['Koht või pind', ['laual', 'turule', 'tööl']],
      ['Inimene', ['emale', 'sõbralt', 'õele']],
      ['Omamine', ['mul on', 'sul ei ole', 'tal on']],
      ['Aeg', ['hommikul', 'esmaspäeval', 'talvel']],
    ], 'full', 'g_notice'),
    match: B.match('k4_p_match', 'Eesti ja vene keel.', 'Ühenda eesti vorm ja vene tõlge.', [
      ['mul on', 'у меня есть'], ['sul on', 'у тебя есть'], ['tal on', 'у него есть'], ['meil on', 'у нас есть'],
      ['mulle', 'мне'], ['minult', 'от меня'], ['emale', 'маме'], ['emalt', 'от мамы'], ['tööl', 'на работе'], ['turule', 'на рынок'],
    ], 'full', 'g_notice'),
    table: B.table('k4_p_grid', 'Veel üks 3 × 3.', 'Täida tabel: -le, -l, -lt.', 'Sõna (omastav), Kuhu? Kellele?, Kus? Kellel?, Kust? Kellelt?', [
      'põrand (põranda) | [põrandale] | [põrandal] | [põrandalt]',
      'sõber (sõbra) | [sõbrale] | [sõbral] | [sõbralt]',
      'õde (õe) | [õele] | [õel] | [õelt]',
      'tema (tema) | [talle/temale] | [tal/temal] | [temalt]',
      'sina (sinu) | [sulle/sinule] | [sul/sinul] | [sinult]',
      'meie (meie) | [meile] | [meil] | [meilt]',
      'tool (tooli) | [toolile] | [toolil] | [toolilt]',
      'saar (saare) | [saarele] | [saarel] | [saarelt]',
    ], 'g_notice'),
    wordforms: B.wordforms('k4_p_forms', 'Kirjuta vorm.', 'Sulgudes on omastav.', [
      ['esmaspäev (esmaspäeva)', 'millal? -l', 'esmaspäeval'], ['hommik (hommiku)', 'millal? -l', 'hommikul'],
      ['õhtu (õhtu)', 'millal? -l', 'õhtul'], ['suvi (suve)', 'millal? -l', 'suvel'], ['talv (talve)', 'millal? -l', 'talvel'],
      ['isa (isa)', 'kellele? -le', 'isale'], ['naaber (naabri)', 'kellelt? -lt', 'naabrilt'], ['õpetaja (õpetaja)', 'kellel? -l', 'õpetajal'],
      ['turg (turu)', 'kust? -lt', 'turult'], ['Saaremaa (Saaremaa)', 'kuhu? -le', 'Saaremaale'],
    ], 'full'),
    errorfix: B.errorfix('k4_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
      ['Mina on koer.', 'Mul on koer.|Minul on koer.'], ['Ma helistan ema.', 'Ma helistan emale.'], ['Isa on töös.', 'Isa on tööl.'],
      ['Esmaspäevas lähen tööle.', 'Esmaspäeval lähen tööle.'], ['Pane raamat laudale.', 'Pane raamat lauale.'], ['Ma sain kirja sõbrast.', 'Ma sain kirja sõbralt.'],
      ['Mul ei ole auto.', 'Mul ei ole autot.|Mul pole autot.'], ['Me elame suvel maas.', 'Me elame suvel maal.'],
    ]),
    translation: translate('k4_p_tr', [
      ['У меня есть брат.', 'Mul on vend.'], ['У неё нет времени.', 'Tal ei ole aega. / Tal pole aega.'], ['Я на работе.', 'Ma olen tööl.'],
      ['В понедельник я иду на рынок.', 'Esmaspäeval lähen turule.'], ['Дай маме книгу.', 'Anna emale raamat.'], ['Я получил письмо от друга.', 'Ma sain sõbralt kirja.'],
      ['Летом мы живём на Сааремаа.', 'Suvel elame Saaremaal.'], ['Возьми ключи со стола.', 'Võta võtmed laualt.'],
    ]),
    speak2: teach(B.speaking('k4_t_family', 'Paaris: minu pere ja sõbrad.', 'Küsi paarilt. Vasta täislausega.', [
      'Kellel su peres on auto?', 'Kellele sa sünnipäeval kingituse teed?', 'Kellelt sa tihti sõnumeid saad?', 'Mis sul kotis on?', 'Millal sul on vaba aega?', 'Mida sul kodus ei ole?',
    ], [60, 120]), 'Учитель: -le / -l / -lt с людьми и «mul ei ole + osastav» (повтор урока 2).'),
  },

  // ===================================================================================================================
  'kaanded-005': {
    examples: examples('k5_d_pairs', 'Näited: -ks või -na?', 'Muutub (-ks), Rollis (-na)', [
      'Ta saab **arstiks**. | Ta töötab **arstina**.', 'Ilm muutub **külmaks**. | **Lapsena** elasin Narvas.',
      'Ma kingin raamatu **sünnipäevaks**. | Ma töötan suvel **müüjana**.', 'Vesi muutub **jääks**. | Ta käis peol **jõuluvanana**.',
      'Mari sai **emaks**. | Ma kasutan seda tuba **kabinetina**.',
    ]),
    find: B.categorize('k5_p_find', 'Sorteeri vormid.', 'Pane iga vorm oma käände alla.', [
      ['saav -ks', ['arstiks', 'sünnipäevaks']], ['rajav -ni', ['reedeni', 'Tartuni']], ['olev -na', ['õpetajana', 'lapsena']],
      ['ilmaütlev -ta', ['suhkruta', 'rahata']], ['kaasaütlev -ga', ['bussiga', 'sõbraga']],
    ], 'full', 'g_notice'),
    match: B.match('k5_p_match', 'Eesti ja vene keel.', 'Ühenda eesti vorm ja vene tõlge.', [
      ['saab arstiks', 'станет врачом'], ['töötab arstina', 'работает врачом'], ['kella viieni', 'до пяти часов'], ['Tartuni', 'до Тарту'],
      ['bussiga', 'на автобусе'], ['sõbraga', 'с другом'], ['ilma rahata', 'без денег'], ['lapsena', 'в детстве'], ['sünnipäevaks', 'на день рождения'],
    ], 'full', 'g_notice'),
    table: B.table('k5_p_table', 'Kelleks? Kellena?', 'Kirjuta -ks ja -na vorm.', 'Sõna (omastav), saab …-ks, töötab …-na', [
      'arst (arsti) | [arstiks] | [arstina]', 'õpetaja (õpetaja) | [õpetajaks] | [õpetajana]', 'müüja (müüja) | [müüjaks] | [müüjana]',
      'juht (juhi) | [juhiks] | [juhina]', 'kokk (koka) | [kokaks] | [kokana]', 'giid (giidi) | [giidiks] | [giidina]',
      'ettekandja (ettekandja) | [ettekandjaks] | [ettekandjana]', 'juuksur (juuksuri) | [juuksuriks] | [juuksurina]',
    ], 'g_notice'),
    wordforms: B.wordforms('k5_p_forms', 'Kirjuta vorm.', 'Sulgudes on omastav.', [
      ['suhkur (suhkru)', 'milleta? -ta', 'suhkruta'], ['raha (raha)', 'milleta? -ta', 'rahata'], ['vihmavari (vihmavarju)', 'milleta? -ta', 'vihmavarjuta'],
      ['rong (rongi)', 'millega? -ga', 'rongiga'], ['ema (ema)', 'kellega? -ga', 'emaga'], ['pliiats (pliiatsi)', 'millega? -ga', 'pliiatsiga'],
      ['õhtu (õhtu)', 'mis ajani? -ni', 'õhtuni'], ['Pärnu (Pärnu)', 'milleni? -ni', 'Pärnuni'], ['jõulud (jõulude)', 'milleks? -ks', 'jõuludeks'],
      ['õpilane (õpilase)', 'kellena? -na', 'õpilasena'],
    ], 'full'),
    errorfix: B.errorfix('k5_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
      ['Ta tahab saada arstina.', 'Ta tahab saada arstiks.'], ['Ta töötab õpetajaks.', 'Ta töötab õpetajana.'], ['Ma joon kohvi ilma suhkur.', 'Ma joon kohvi ilma suhkruta.'],
      ['Ma sõidan buss.', 'Ma sõidan bussiga.'], ['Ma töötan kuni kell viis.', 'Ma töötan kella viieni.'], ['Ma tulin suurega koeraga.', 'Ma tulin suure koeraga.'],
      ['Ma räägin koos ema.', 'Ma räägin emaga.'], ['Ta sai hea arstiks.', 'Ta sai heaks arstiks.'],
    ]),
    translation: translate('k5_p_tr', [
      ['Я хочу стать врачом.', 'Ma tahan saada arstiks.'], ['Он работает учителем.', 'Ta töötab õpetajana.'],
      ['Магазин открыт до восьми.', 'Pood on avatud kella kaheksani. / Pood on lahti kella kaheksani.'], ['Я не могу жить без кофе.', 'Ma ei saa elada kohvita. / Ma ei saa elada ilma kohvita.'],
      ['Я еду с другом в Тарту.', 'Ma sõidan sõbraga Tartusse.'], ['В детстве я жил в Нарве.', 'Lapsena elasin Narvas.'],
      ['Что ты хочешь на Рождество?', 'Mida sa jõuludeks tahad? / Mida sa jõuludeks soovid?'], ['Погода стала тёплой.', 'Ilm muutus soojaks. / Ilm läks soojaks.'],
    ]),
    speak2: teach(B.speaking('k5_t_plan', 'Paaris: planeerime reisi.', 'Planeerige koos üks reis. Vastake täislausega.', [
      'Kuhu te sõidate?', 'Millega te sõidate?', 'Kellega te sõidate?', 'Mis päevani te seal olete?', 'Milleta te reisile ei lähe?', 'Mida te kingiks ostate?',
    ], [60, 120]), 'Учитель: в плане — -ga, -ni, -ta, -ks и повтор kuhu? (-sse / -le).'),
  },

  // ===================================================================================================================
  'kaanded-006': {
    examples: examples('k6_d_examples', 'Näited: vene ja eesti keel.', 'Vene keeles, Eesti keeles', [
      'интересоваться **чем** | huvituma **millest**: Ma huvitun **spordist**.', 'думать **о ком** | mõtlema **kellele**: Ma mõtlen **sulle**.',
      'помогать **кому** | aitama **keda**: Ma aitan **ema**.', 'звонить **кому** | helistama **kellele**: Helista **isale**!',
      'встречаться **с кем** | kohtuma **kellega**: Ma kohtun **sõbraga**.', 'зависеть **от чего** | sõltuma **millest**: See sõltub **ilmast**.',
      'участвовать **в чём** | osalema **millel**: Ma osalen **koosolekul**.', 'благодарить **кого** | tänama **keda**: Tänan **sind**!',
    ]),
    find: B.categorize('k6_p_find', 'Mis kääne?', 'Pane tegusõnad õige käände alla.', [
      ['-st (millest?)', ['huvituma', 'sõltuma', 'unistama']],
      ['-le (millele?)', ['helistama', 'vastama', 'meeldima']],
      ['osastav (keda? mida?)', ['armastama', 'ootama', 'aitama']],
      ['-ga (kellega?)', ['kohtuma', 'nõustuma', 'abielluma']],
    ], 'full', 'g_notice'),
    match: B.match('k6_p_match', 'Lõpeta lause.', 'Ühenda lause algus ja lõpp.', [
      ['Ma huvitun', 'spordist.'], ['Ma helistan', 'vennale.'], ['Ma armastan', 'oma koera.'], ['Ma kohtun', 'kolleegiga.'],
      ['Ta sai', 'õpetajaks.'], ['Ma osalen', 'koosolekul.'], ['See sõltub', 'ilmast.'], ['Ma vastan', 'kirjale.'],
      ['Ma ootan', 'rongi.'], ['Ma nõustun', 'sinuga.'],
    ], 'full', 'g_notice'),
    table: B.table('k6_p_table', 'Tegusõna ja sõna.', 'Kirjuta sõna õiges vormis.', 'Tegusõna, Sõna, Lause', [
      'huvituma | muusika | Ma huvitun [muusikast].', 'helistama | vend | Ma helistan [vennale].', 'aitama | naaber | Ma aitan [naabrit].',
      'kohtuma | sõber | Ma kohtun [sõbraga].', 'sõltuma | ilm | See sõltub [ilmast].', 'mõtlema | puhkus | Ma mõtlen [puhkusele].',
      'ootama | buss | Ma ootan [bussi].', 'osalema | koosolek | Ma osalen [koosolekul].', 'vastama | küsimus | Ma vastan [küsimusele].',
      'saama | arst | Ta sai [arstiks].',
    ], 'g_notice'),
    wordforms: B.wordforms('k6_p_forms', 'Kirjuta vorm.', 'Tegusõna küsib. Sulgudes on omastav.', [
      ['kino (kino)', 'huvituma millest?', 'kinost'], ['isa (isa)', 'helistama kellele?', 'isale'], ['õde (õe)', 'kohtuma kellega?', 'õega'],
      ['laps (lapse)', 'aitama keda?', 'last'], ['reis (reisi)', 'unistama millest?', 'reisist'], ['kiri (kirja)', 'vastama millele?', 'kirjale'],
      ['abi (abi)', 'vajama mida?', 'abi'], ['koosolek (koosoleku)', 'osalema millel?', 'koosolekul'], ['plaan (plaani)', 'nõustuma millega?', 'plaaniga'],
      ['tuju (tuju)', 'sõltuma millest?', 'tujust'],
    ], 'full'),
    transformation: B.transformation('k6_p_turn', 'Uus tegusõna, uus kääne.', 'Kasuta uut tegusõna. Sõna jääb samaks.', [
      ['Ma armastan muusikat.', 'huvituma: Ma huvitun …', 'Ma huvitun muusikast.'], ['Ma helistan sõbrale.', 'kohtuma: Ma kohtun …', 'Ma kohtun sõbraga.'],
      ['Ma ootan ema.', 'helistama: Ma helistan …', 'Ma helistan emale.'], ['Ma mõtlen reisile.', 'unistama: Ma unistan …', 'Ma unistan reisist.'],
      ['Ma räägin õpetajaga.', 'aitama: Ma aitan …', 'Ma aitan õpetajat.'], ['Ma vastan küsimusele.', 'aru saama: Ma saan … aru.', 'Ma saan küsimusest aru.'],
      ['Ma kohtun naabriga.', 'tänama: Ma tänan …', 'Ma tänan naabrit.'], ['Mulle meeldib sport.', 'huvituma: Ma huvitun …', 'Ma huvitun spordist.'],
    ]),
    translation: translate('k6_p_tr', [
      ['Я интересуюсь историей.', 'Ma huvitun ajaloost.'], ['Позвони отцу!', 'Helista isale!'], ['Я помогаю маме.', 'Ma aitan ema.'],
      ['Мы встречаемся с друзьями.', 'Me kohtume sõpradega.'], ['Это зависит от погоды.', 'See sõltub ilmast.'], ['Я думаю о тебе.', 'Ma mõtlen sulle. / Ma mõtlen sinule.'],
      ['Мне нравится музыка.', 'Mulle meeldib muusika.'], ['Он стал учителем.', 'Ta sai õpetajaks.'],
    ]),
    speak2: teach(B.speaking('k6_t_week', 'Räägi oma nädalast.', 'Räägi 1 minut. Kasuta 5 tegusõna kastist.', [
      'Kellega sa sel nädalal kohtusid?', 'Kellele sa helistasid?', 'Keda sa aitasid?', 'Millest sa unistad?', 'Millest sõltub sinu nädalavahetus?',
    ], [60, 120], ['huvituma, kohtuma, helistama, aitama, unistama, sõltuma, osalema']), 'Учитель: монолог 1 минута; считайте глаголы с верным управлением (цель — 5).'),
  },
};
