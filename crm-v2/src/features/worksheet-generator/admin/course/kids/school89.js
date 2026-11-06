// The full sheets of „Eesti keel 2.–3. klassile pühapäeviti (8–9-aastased)” (k89-001…012, owner 2026-11-06: the
// published sheets had 3 blocks each — „сделай каждый лист полным, чтобы учитель мог дать ученику”). One entry per
// lesson of PROGRAM_89 (same order); kids/sheets.js schoolLesson turns it into the three sheets:
//   1 Loeme             — before reading, words (forms + Russian), words with pictures (public/kids-art), the text with
//                         short answers, true / false, choice, the language box of the lesson's focus, a first use;
//   2 Harjutame keelt   — the rule to keep in mind, „Mäletad?”, 6–8 auto-checked exercises from easy to harder;
//   3 Kirjutame ja räägime — a model text, sentence starters, a plan, writing 5–7 sentences, one minute of speaking,
//                         the parents' note (Russian) and „Ma oskan”.
// Learners: 8–9-year-olds in an Estonian school (2.–3. klass), Estonian as a second language (mostly Russian at home).
// Texts grow from ~85 words (lesson 1) to ~150 (lesson 10–12). Facts in the texts are real (animals, Christmas Eve 24.12,
// cats sleep 12–16 h, dogs smell better than people); people and places of the stories are invented.
//
// Exercise entries: ex(key, type, title, instruction, items, { bank, goal }) — the block id is <lesson>_<phase>_<key>;
// items follow the B builder of the type (admin/course/blocks.js): gaps [sentences with [answer|variant]], choice
// [[question, right, wrong…]], match [[left, right]], wordforms [[base, prompt, answer]], transformation [[from, prompt,
// answer|variant]], errorfix [[wrong, right|variant]], categorize [[group, [items]]], wordorder [sentences], crossword
// [[clue, answer]], wordsearch [words], truefalse [[statement, true|false]]; 'coloring' uses the lesson's `color`.

const ex = (key, type, title, instruction, items = [], more = {}) => ({ key, type, title, instruction, items, ...more });
const ODD = 'Mis sõna ei sobi teistega? Vali see sõna.';

export const SCHOOL_89 = [
  // ---------- 1 Minu kool — küsisõnad ----------
  {
    warm: ['Mis klassis sa käid?', 'Mis on sinu kooli nimi?', 'Mis sulle koolis kõige rohkem meeldib?'],
    vocab: [
      'klass – klassid — класс', 'õpetaja – õpetajad — учитель', 'klassivend – klassivennad — одноклассник',
      'klassiõde – klassiõed — одноклассница', 'tund – tunnid — урок', 'vahetund – vahetunnid — перемена',
      'lemmikaine – lemmikained — любимый предмет', 'matemaatika — математика', 'kehaline kasvatus — физкультура',
      'söökla – sööklad — столовая',
    ],
    pictures: ['Mis on koolikotis? Ühenda sõna ja pilt.', [['koolikott', 'backpack'], ['vihik', 'notebook'], ['pliiats', 'pencil'], ['raamat', 'book'], ['käärid', 'scissors'], ['kell', 'clock']]],
    reading: ['Mia kool', [
      'Mia on kaheksa-aastane. Ta käib teises klassis. Mia kool on suur ja valge. Koolis on palju klasse, söökla ja võimla. Tunnid algavad kell kaheksa.',
      'Mia klassis on kakskümmend õpilast. Nende õpetaja nimi on Kati. Kati on lahke ja rõõmsameelne. Mia kõrval istub tema klassivend Artur.',
      'Mia lemmikaine on kehaline kasvatus, sest talle meeldib joosta ja palli mängida. Matemaatika on Mia jaoks natuke raske, aga ta harjutab iga päev. Vahetunnil mängib Mia sõbrannaga õues. Kell kaksteist lähevad kõik sööklasse lõunat sööma. Pärast tunde läheb Mia trenni või koju.',
    ], [
      ['Mitmendas klassis Mia käib?', 'teises|teine|2'],
      ['Kes on Mia õpetaja?', 'Kati'],
      ['Millal algavad tunnid?', 'kaheksa|8'],
      ['Mis on Mia lemmikaine?', 'kehaline'],
      ['Kus sööb Mia lõunat?', 'söökla'],
    ]],
    truefalse: [
      ['Mia on üheksa-aastane.', false],
      ['Mia kool on suur ja valge.', true],
      ['Mia klassis on kakskümmend õpilast.', true],
      ['Artur on Mia õpetaja.', false],
      ['Vahetunnil mängib Mia õues.', true],
    ],
    choice: [
      ['Milline on õpetaja Kati?', 'lahke ja rõõmsameelne', 'range ja kuri', 'väga vana'],
      ['Mis on Miale raske?', 'matemaatika', 'joonistamine', 'muusika'],
      ['Kus sööb Mia lõunat?', 'sööklas', 'klassis', 'kodus'],
      ['Miks meeldib Miale kehaline kasvatus?', 'talle meeldib joosta ja palli mängida', 'seal ei anta kodutööd', 'Artur istub tema kõrval'],
    ],
    rule: [
      '**Kes?** — inimene: Kes on sinu õpetaja? — Kati.',
      '**Mis?** — asi: Mis on sinu lemmikaine? — Matemaatika.',
      '**Kus?** — koht: Kus on söökla? — Esimesel korrusel.',
      '**Millal?** — aeg: Millal algab tund? — Kell kaheksa.',
      '**Mitu?** — arv: Mitu õpilast on klassis? — Kakskümmend.',
      'Küsisõna on lause alguses. Lause lõpus on küsimärk **?**',
    ],
    ru: 'kes? — кто? · mis? — что? · kus? — где? · millal? — когда? · mitu? — сколько?',
    use: ex('use', 'match', 'Ühenda küsisõna ja vastus.', 'Mis vastus sobib küsisõnaga? Ühenda.', [
      ['Kes?', 'õpetaja Kati'], ['Mis?', 'matemaatika'], ['Kus?', 'sööklas'], ['Millal?', 'kell kaksteist'], ['Mitu?', 'kakskümmend'],
    ], { goal: 'g_notice' }),
    review: ['Kes on Mia õpetaja?', 'Mis on sinu lemmikaine?', 'Mida sa vahetunnil teed?'],
    practice: [
      ex('search', 'wordsearch', 'Leia kooli sõnad.', 'Leia ruudustikust kõik kuus sõna. Tee nende ümber ring.', ['klass', 'tund', 'söökla', 'õpetaja', 'vahetund', 'aine']),
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['tund', 'урок'], ['vahetund', 'перемена'], ['söökla', 'столовая'], ['õpetaja', 'учитель'], ['klassiõde', 'одноклассница'], ['lemmikaine', 'любимый предмет'],
      ]),
      ex('which', 'choice', 'Vali õige küsisõna.', 'Loe vastust. Milline küsisõna sobib?', [
        ['… algab vahetund? — Kell kümme.', 'Millal', 'Kus', 'Kes'],
        ['… on sinu klassivend? — Artur.', 'Kes', 'Mis', 'Mitu'],
        ['… on sinu koolikott? — Klassis.', 'Kus', 'Millal', 'Kes'],
        ['… tundi sul täna on? — Viis.', 'Mitu', 'Mis', 'Kus'],
        ['… on sinu lemmikaine? — Matemaatika.', 'Mis', 'Kes', 'Millal'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv küsisõna.', 'Vali sõna kastist. Üks sõna sobib kaks korda.', [
        '[Kes] on sinu õpetaja?', '[Mis] on sinu lemmikaine?', '[Kus] on söökla?', '[Millal] algab tund?', '[Mitu] õpilast on klassis?', '[Kus] sa elad?',
      ], { bank: 'kes, mis, kus, millal, mitu' }),
      ex('sort', 'categorize', 'Sorteeri vastused.', 'Millisele küsimusele vastab sõna? Kirjuta õigesse rühma.', [
        ['Kes?', ['õpetaja', 'klassivend', 'Mia']], ['Mis?', ['matemaatika', 'raamat', 'pall']], ['Kus?', ['sööklas', 'klassis', 'õues']], ['Millal?', ['hommikul', 'kell kaheksa', 'vahetunnil']],
      ], { goal: 'g_notice' }),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras. Esimene sõna algab suure tähega.', [
        'Mia käib teises klassis.', 'Vahetunnil mängime õues.', 'Kus on sinu klass?', 'Millal algab matemaatikatund?',
      ]),
      ex('ask', 'transformation', 'Kirjuta küsimus.', 'Vastus on antud. Kirjuta küsimus, mis algab küsisõnaga.', [
        ['Minu õpetaja on Kati.', 'Küsi: kes?', 'Kes on sinu õpetaja?'],
        ['Söökla on esimesel korrusel.', 'Küsi: kus?', 'Kus on söökla?'],
        ['Tund algab kell kaheksa.', 'Küsi: millal?', 'Millal algab tund?|Millal tund algab?'],
        ['Minu lemmikaine on joonistamine.', 'Küsi: mis?', 'Mis on sinu lemmikaine?'],
        ['Klassis on kakskümmend õpilast.', 'Küsi: mitu?', 'Mitu õpilast on klassis?|Mitu õpilast klassis on?'],
      ]),
    ],
    model: ['Minu kool', 'Minu nimi on Artur. Ma käin kolmandas klassis. Minu kool on Tallinnas. Minu õpetaja on Anna. Minu lemmikaine on matemaatika, sest mulle meeldib arvutada. Vahetunnil mängin klassivendadega õues.'],
    starters: ['Minu kool on …', 'Ma käin … klassis.', 'Minu õpetaja on …', 'Minu lemmikaine on …, sest …', 'Vahetunnil ma …', 'Koolis meeldib mulle …'],
    plan: ['Kus on sinu kool?', 'Mis klassis sa käid?', 'Kes on sinu õpetaja?', 'Mis on sinu lemmikaine? Miks?'],
    talk: ['Kus on sinu kool?', 'Mis klassis sa käid?', 'Kes on sinu õpetaja?', 'Mis on sinu lemmikaine? Miks?', 'Mida sa vahetunnil teed?', 'Lõpus küsi sõbralt kaks küsimust: kes? ja millal?'],
    self: ['Ma oskan küsida: kes? mis? kus? millal? mitu?', 'Ma oskan rääkida oma koolist ja klassist.', 'Ma kirjutasin oma koolist 5–7 lauset.'],
  },

  // ---------- 2 Sõbrad ja mängud — ainsus ja mitmus ----------
  {
    warm: ['Kes on sinu parim sõber?', 'Mida te koos mängite?', 'Kas sa mängid rohkem õues või toas?'],
    vocab: [
      'sõber – sõbrad — друг', 'mäng – mängud — игра', 'mängima – ma mängin — играть', 'peitust mängima — играть в прятки',
      'pall – pallid — мяч', 'lauamäng – lauamängud — настольная игра', 'õues — на улице', 'koos — вместе',
      'naljakas – naljakad — смешной', 'abivalmis — готовый помочь',
    ],
    pictures: ['Mänguasjad. Ühenda sõna ja pilt.', [['pall', 'ball'], ['nukk', 'doll'], ['klotsid', 'blocks'], ['auto', 'car'], ['koer', 'dog'], ['õhupallid', 'balloons']]],
    reading: ['Minu parim sõber', [
      'Minu parim sõber on Tom. Ta elab minu naabermajas. Tom on pikk ja tal on lühikesed heledad juuksed. Ta on naljakas ja abivalmis. Tal on ka väike õde Liisa. Me tunneme teineteist lasteaiast.',
      'Pärast kooli mängime sageli õues palli või peitust. Vahel mängivad meiega ka teised lapsed. Kui sajab vihma, mängime Tomi juures lauamänge. Tomil on koer Muki, kes mängib ka meiega.',
      'Laupäeviti sõidame koos rattaga pargis. Kord kukkusin rattalt maha ja Tom aitas mind. Ta on tõeline sõber! Ma loodan, et me jääme alati sõpradeks.',
    ], [
      ['Kus Tom elab?', 'naabermaja'],
      ['Kust nad teineteist tunnevad?', 'lasteaia'],
      ['Mida nad vihmaga mängivad?', 'lauamäng'],
      ['Mis on Tomi koera nimi?', 'Muki'],
      ['Millal nad rattaga sõidavad?', 'laupäev'],
    ]],
    truefalse: [
      ['Tom elab jutustaja naabermajas.', true],
      ['Tomil on pikad tumedad juuksed.', false],
      ['Nad tunnevad teineteist koolist.', false],
      ['Muki on Tomi koer.', true],
      ['Laupäeviti sõidavad nad koos rattaga.', true],
    ],
    choice: [
      ['Milline Tom on?', 'naljakas ja abivalmis', 'kuri ja laisk', 'väike ja vaikne'],
      ['Mida tegi Tom, kui jutustaja kukkus?', 'aitas teda', 'naeris', 'läks koju'],
      ['Kus nad pärast kooli mängivad?', 'õues', 'koolis', 'poes'],
      ['Miks on Tom tõeline sõber?', 'ta aitab, kui sõbral on raske', 'tal on koer', 'ta on pikk'],
    ],
    rule: [
      '**Üks** = ainsus: sõber, mäng, pall, poiss.',
      '**Palju** = mitmus. Mitmuse lõpus on **-d**: sõbrad, mängud, pallid, poisid.',
      'Vaata hoolega: sõber → sõbrad, poiss → poisid, laps → lapsed.',
      'Tegusõna muutub ka: poiss **mängib** → poisid **mängivad**.',
      'Pärast arvu ütleme teisiti: **kaks sõpra**, **kolm palli**.',
    ],
    ru: '-d в конце = много: sõbrad — друзья, mängud — игры. После числа: kaks sõpra — два друга.',
    use: ex('use', 'categorize', 'Üks või palju?', 'Kirjuta sõna õigesse rühma.', [
      ['Üks (ainsus)', ['sõber', 'mäng', 'pall', 'koer']], ['Palju (mitmus)', ['sõbrad', 'lauamängud', 'lapsed', 'juuksed']],
    ], { goal: 'g_notice' }),
    review: ['Kes on Tom?', 'Mida mängivad sõbrad vihmaga?', 'Mis on sinu lemmikaine? (1. tund)'],
    practice: [
      ex('match', 'match', 'Üks ja palju.', 'Ühenda ainsus ja mitmus.', [
        ['sõber', 'sõbrad'], ['mäng', 'mängud'], ['poiss', 'poisid'], ['laps', 'lapsed'], ['nukk', 'nukud'], ['auto', 'autod'],
      ], { goal: 'g_notice' }),
      ex('forms', 'wordforms', 'Kirjuta mitmus.', 'Üks → palju. Kirjuta sõna mitmuses.', [
        ['pall', 'palju', 'pallid'], ['tüdruk', 'palju', 'tüdrukud'], ['koer', 'palju', 'koerad'], ['klots', 'palju', 'klotsid'], ['õhupall', 'palju', 'õhupallid'], ['lauamäng', 'palju', 'lauamängud'],
      ]),
      ex('which', 'choice', 'Vali õige sõna.', 'Loe lause läbi. Kas on vaja ühte või palju?', [
        ['Tom ja Liisa on minu …', 'sõbrad', 'sõber', 'sõpra'],
        ['See punane … on minu.', 'pall', 'pallid', 'palli'],
        ['Kõik … jooksevad õue.', 'lapsed', 'laps', 'last'],
        ['Mul on uus …', 'lauamäng', 'lauamängud', 'lauamänge'],
        ['Minu sõbrad on …', 'naljakad', 'naljakas', 'naljakat'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'Mul on üks parim [sõber].', 'Tom ja Liisa on minu [sõbrad].', 'Mul on kaks head [sõpra].', 'Lapsed mängivad õues [palli].', 'Me mängime koos [peitust].', 'Meil on kodus palju [lauamänge].',
      ], { bank: 'sõber, sõbrad, sõpra, palli, peitust, lauamänge' }),
      ex('plural', 'transformation', 'Muuda mitmusesse.', 'Kirjuta lause nii, et neid on palju. Muuda ka tegusõna.', [
        ['Minu sõber on naljakas.', 'Minu sõbrad …', 'Minu sõbrad on naljakad.'],
        ['Poiss mängib palli.', 'Poisid …', 'Poisid mängivad palli.'],
        ['Tüdruk on abivalmis.', 'Tüdrukud …', 'Tüdrukud on abivalmis.'],
        ['Laps on õues.', 'Lapsed …', 'Lapsed on õues.'],
        ['Koer jookseb pargis.', 'Koerad …', 'Koerad jooksevad pargis.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Tom on minu parim sõber.', 'Me mängime õues palli.', 'Vihmaga mängime lauamänge.', 'Minu sõbrad on naljakad.',
      ]),
      ex('odd', 'choice', 'Mis ei sobi?', ODD, [
        ['sõbrad · mängud · poiss · pallid', 'poiss', 'sõbrad', 'mängud', 'pallid'],
        ['nukk · pall · klotsid · tund', 'tund', 'nukk', 'pall', 'klotsid'],
        ['peitust · palli · lauamänge · sööklat', 'sööklat', 'peitust', 'palli', 'lauamänge'],
      ]),
    ],
    model: ['Minu sõber Sofia', 'Minu parim sõber on Sofia. Ta on kaheksa-aastane. Sofial on pikad tumedad juuksed. Ta on naljakas ja abivalmis. Pärast kooli mängime koos õues palli. Vihmaga mängime Sofia juures lauamänge. Me oleme head sõbrad!'],
    starters: ['Minu parim sõber on …', 'Ta on …-aastane.', 'Tal on … juuksed.', 'Ta on … ja …', 'Pärast kooli mängime koos …', 'Mulle meeldib temaga mängida, sest …'],
    plan: ['Kes on sinu sõber?', 'Milline ta välja näeb?', 'Milline ta on?', 'Mida te koos mängite? Kus?'],
    talk: ['Mis on sinu sõbra nimi?', 'Kui vana ta on?', 'Milline ta välja näeb?', 'Milline ta on: naljakas, abivalmis …?', 'Mida te koos mängite?'],
    self: ['Ma tean: mitmuse lõpus on -d (sõbrad, mängud).', 'Ma oskan kirjeldada oma sõpra.', 'Ma kirjutasin oma sõbrast 5–7 lauset.'],
  },

  // ---------- 3 Minu hobid — mulle meeldib + da ----------
  {
    warm: ['Mis sulle meeldib teha pärast kooli?', 'Kas sa käid trennis või ringis?', 'Mis on sinu pere lemmikhobi?'],
    vocab: [
      'hobi – hobid — хобби', 'trenn – trennid — тренировка', 'ujuma – ujuda – ma ujun — плавать',
      'joonistama – joonistada – ma joonistan — рисовать', 'tantsima – tantsida – ma tantsin — танцевать',
      'laulma – laulda – ma laulan — петь', 'lugema – lugeda – ma loen — читать', 'jalgpall — футбол',
      'malet mängima — играть в шахматы', 'harjutama – harjutada – ma harjutan — упражняться',
    ],
    pictures: ['Mida on hobi jaoks vaja? Ühenda sõna ja pilt.', [['pall', 'ball'], ['raamat', 'book'], ['pliiats', 'pencil'], ['käärid', 'scissors']]],
    reading: ['Liisi hobid', [
      'Liisil on palju hobisid. Esmaspäeval ja kolmapäeval käib ta ujumistrennis. Talle meeldib vees olla ja kiiresti ujuda. Neljapäeval läheb Liisi kunstiringi, kus ta joonistab ja maalib. Kõige rohkem joonistab ta hobuseid ja koeri. Kodus meeldib talle lugeda raamatuid loomadest.',
      'Liisi vend Mark mängib jalgpalli. Ta käib jalgpallitrennis kolm korda nädalas ja harjutab iga päev õues palliga. Nende isale meeldib malet mängida ja ta õpetab ka lapsi. Emale meeldib laulda.',
      'Pühapäeviti tantsib kogu pere köögis muusika järgi. Ema ütleb, et see on pere kõige lõbusam hobi! Liisi tahab tulevikus proovida ka tantsutrenni.',
    ], [
      ['Millal käib Liisi ujumistrennis?', 'esmaspäev|kolmapäev'],
      ['Kuhu läheb Liisi neljapäeval?', 'kunstiring'],
      ['Mida meeldib Liisile kodus teha?', 'lugeda|loeb'],
      ['Mis on Marki hobi?', 'jalgpall'],
      ['Kes mängib malet?', 'isa'],
    ]],
    truefalse: [
      ['Liisile meeldib ujuda.', true],
      ['Liisi käib kunstiringis teisipäeval.', false],
      ['Mark mängib korvpalli.', false],
      ['Isa õpetab lastele malet.', true],
      ['Emale meeldib laulda.', true],
    ],
    choice: [
      ['Mis raamatuid loeb Liisi?', 'loomadest', 'autodest', 'kosmosest'],
      ['Kui tihti Mark harjutab?', 'iga päev', 'kord nädalas', 'ainult suvel'],
      ['Mida teeb kogu pere pühapäeviti?', 'tantsib köögis', 'ujub', 'mängib malet'],
      ['Miks on tantsimine pere kõige lõbusam hobi?', 'kogu pere teeb seda koos', 'see on kõige raskem', 'seda tehakse koolis'],
    ],
    rule: [
      '**Mulle meeldib** + tegevus **-da** vormis: Mulle meeldib **ujuda**. Mulle meeldib **joonistada**.',
      'ujuma → ujuda · joonistama → joonistada · tantsima → tantsida · lugema → lugeda · laulma → laulda',
      'Kellele meeldib? **Mulle, sulle, talle, emale, Liisile** meeldib …',
      'Ei meeldi: Mulle **ei meeldi** laulda.',
      'Trenn ja ring: Ma käin **ujumistrennis**. Liisi käib **kunstiringis**.',
    ],
    ru: 'Mulle meeldib ujuda = Мне нравится плавать. Глагол после meeldib — в форме на -da.',
    use: ex('use', 'gaps', 'Leia tekstist: mis meeldib?', 'Vali sõna kastist. Kontrolli tekstist.', [
      'Liisile meeldib kiiresti [ujuda].', 'Kodus meeldib talle [lugeda].', 'Isale meeldib malet [mängida].', 'Emale meeldib [laulda].',
    ], { bank: 'ujuda, lugeda, mängida, laulda' }),
    review: ['Mis on Marki hobi?', 'Mida meeldib Liisile kodus teha?', 'Kes on sinu parim sõber? (2. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda kaks vormi.', 'Ühenda ma-vorm ja da-vorm.', [
        ['ujuma', 'ujuda'], ['joonistama', 'joonistada'], ['tantsima', 'tantsida'], ['laulma', 'laulda'], ['lugema', 'lugeda'], ['mängima', 'mängida'],
      ], { goal: 'g_notice' }),
      ex('forms', 'wordforms', 'Kirjuta da-vorm.', 'Mulle meeldib … Kirjuta sõna da-vormis.', [
        ['harjutama', 'mulle meeldib …', 'harjutada'], ['maalima', 'mulle meeldib …', 'maalida'], ['meisterdama', 'mulle meeldib …', 'meisterdada'], ['kirjutama', 'mulle meeldib …', 'kirjutada'], ['õppima', 'mulle meeldib …', 'õppida'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'Mulle meeldib basseinis [ujuda].', 'Liisile meeldib [joonistada].', 'Markile meeldib jalgpalli [mängida].', 'Isale meeldib ajalehte [lugeda].', 'Mulle ei meeldi [laulda].', 'Sofiale meeldib muusika järgi [tantsida].',
      ], { bank: 'ujuda, joonistada, mängida, lugeda, laulda, tantsida' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Pärast „meeldib” tuleb da-vorm. Pärast „ma” on tegusõna lõpus -n (ma harjutan), pärast „ta” -b (ta mängib).', [
        ['Mulle meeldib …', 'tantsida', 'tantsin', 'tantsima'],
        ['Ma … iga päev.', 'harjutan', 'harjutada', 'harjutama'],
        ['Talle meeldib raamatuid …', 'lugeda', 'loen', 'lugema'],
        ['Kas sulle meeldib …?', 'laulda', 'laulan', 'laulma'],
        ['Mark … jalgpalli.', 'mängib', 'mängida', 'mängima'],
      ]),
      ex('like', 'transformation', 'Kirjuta: mulle meeldib …', 'Muuda lause. Alusta sõnadega „Mulle meeldib”.', [
        ['Ma ujun.', 'Mulle meeldib …', 'Mulle meeldib ujuda.'],
        ['Ma joonistan.', 'Mulle meeldib …', 'Mulle meeldib joonistada.'],
        ['Ma loen raamatuid.', 'Mulle meeldib …', 'Mulle meeldib lugeda raamatuid.|Mulle meeldib raamatuid lugeda.'],
        ['Ma mängin malet.', 'Mulle meeldib …', 'Mulle meeldib mängida malet.|Mulle meeldib malet mängida.'],
        ['Ma tantsin.', 'Mulle meeldib …', 'Mulle meeldib tantsida.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Mulle meeldib joonistada.', 'Ma käin ujumistrennis.', 'Isa õpetab meile malet.', 'Liisile meeldib raamatuid lugeda.',
      ]),
      ex('cross', 'crossword', 'Ristsõna: hobid.', 'Loe vihjet ja kirjuta sõna. Tegusõna kirjuta ma-vormis (näiteks: ujuma).', [
        ['Seda mängitakse palli ja väravaga.', 'jalgpall'], ['Seda teed pliiatsiga paberil.', 'joonistama'], ['Seda teed raamatuga.', 'lugema'],
        ['Seda teed muusika järgi.', 'tantsima'], ['Seda teed vees.', 'ujuma'], ['Seda teed häälega.', 'laulma'],
      ]),
    ],
    model: ['Minu hobid', 'Minu nimi on Daniel. Mul on kaks hobi. Mulle meeldib mängida jalgpalli. Ma käin jalgpallitrennis teisipäeval ja neljapäeval. Mulle meeldib ka joonistada. Kodus joonistan autosid ja loomi. Ma tahaksin õppida ka malet mängima.'],
    starters: ['Mulle meeldib …-da.', 'Ma käin …-trennis / …-ringis.', 'Trenn on … (mis päeval?).', 'Kodus meeldib mulle …', 'Mulle ei meeldi …', 'Ma tahaksin proovida …'],
    plan: ['Mis sulle meeldib teha?', 'Kus ja millal sa trennis käid?', 'Mida sa kodus teed?', 'Mida tahaksid proovida?'],
    talk: ['Mis sulle meeldib teha?', 'Kus ja millal sa trennis käid?', 'Kes sind õpetab?', 'Mida on selle hobi jaoks vaja?', 'Näita, kuidas seda tehakse.'],
    self: ['Ma oskan öelda: Mulle meeldib ujuda / joonistada / lugeda.', 'Ma tean da-vormi: ujuma → ujuda.', 'Ma oskan rääkida oma hobist.'],
  },

  // ---------- 4 Linn ja tee kooli — kus? kuhu? kust? ----------
  {
    warm: ['Kuidas sa kooli lähed: jala, bussiga või autoga?', 'Kui kaua tee kooli võtab?', 'Mida sa teel näed?'],
    vocab: [
      'tänav – tänavad — улица', 'ristmik – ristmikud — перекрёсток', 'foor – foorid — светофор', 'buss – bussid — автобус',
      'pood – poed — магазин', 'park – pargid — парк', 'otse — прямо', 'paremale — направо', 'vasakule — налево',
      'lähedal — близко',
    ],
    pictures: ['Mida näed teel? Ühenda sõna ja pilt.', [['auto', 'car'], ['rong', 'train'], ['maja', 'house'], ['puu', 'tree'], ['koolikott', 'backpack']]],
    reading: ['Karli tee kooli', [
      'Karl elab Mustamäel. Igal hommikul läheb ta kooli bussiga. Bussipeatus on kodu lähedal. Kõigepealt kõnnib ta kodust bussipeatusesse. Buss viib ta kesklinna. Bussis istub Karl akna all ja vaatab linna.',
      'Seal tuleb Karl bussist välja ja kõnnib otse mööda tänavat. Teel näeb ta palju autosid ja inimesi. Ristmikul ootab ta, kuni foor läheb roheliseks. Siis keerab ta paremale. Pargi kõrval on väike pood, kust Karl ostab vahel kukli. Kool on poe vastas.',
      'Karl on koolis tavaliselt kümme minutit enne tundi. Pärast kooli sõidab ta samamoodi koju tagasi. Talvel on tänav vahel libe ja siis kõnnib Karl aeglaselt.',
    ], [
      ['Kus Karl elab?', 'Mustamäe'],
      ['Millega Karl kooli sõidab?', 'bussi'],
      ['Kuhu viib buss Karli?', 'kesklinna'],
      ['Mida Karl ristmikul teeb?', 'ootab'],
      ['Kust ostab Karl vahel kukli?', 'poest|poes'],
    ]],
    truefalse: [
      ['Karl elab Mustamäel.', true],
      ['Karl läheb kooli jala.', false],
      ['Ristmikul keerab Karl vasakule.', false],
      ['Pood on pargi kõrval.', true],
      ['Karl jääb tavaliselt tundi hiljaks.', false],
    ],
    choice: [
      ['Kus istub Karl bussis?', 'akna all', 'ukse juures', 'juhi kõrval'],
      ['Kuhu keerab Karl ristmikul?', 'paremale', 'vasakule', 'tagasi'],
      ['Kus on kool?', 'poe vastas', 'pargis', 'Mustamäel'],
      ['Miks ootab Karl ristmikul?', 'foor ei ole veel roheline', 'buss on hiljaks jäänud', 'ta ootab sõpra'],
    ],
    rule: [
      '**Kus?** (где?) — lõpus **-s**: koolis, poes, pargis, bussis.',
      '**Kuhu?** (куда?) — kooli, poodi, parki, bussi. Võib ka **-sse**: koolisse, bussipeatusesse.',
      '**Kust?** (откуда?) — lõpus **-st**: koolist, poest, pargist, bussist.',
      'Näide: Ma olen **koolis**. Ma lähen **kooli**. Ma tulen **koolist**.',
      'Pea meeles: kodus — **koju** — kodust.',
    ],
    ru: 'kus? -s = где? · kuhu? = куда? · kust? -st = откуда? Ma lähen koju = Я иду домой.',
    use: ex('use', 'categorize', 'Kus? Kuhu? Kust?', 'Kirjuta iga sõna õigesse rühma.', [
      ['Kus?', ['koolis', 'poes', 'pargis']], ['Kuhu?', ['kooli', 'poodi', 'parki']], ['Kust?', ['koolist', 'poest', 'pargist']],
    ], { goal: 'g_notice' }),
    review: ['Kuidas Karl kooli läheb?', 'Kus on Karli kool?', 'Mis sulle meeldib teha? (3. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['otse', 'прямо'], ['paremale', 'направо'], ['vasakule', 'налево'], ['lähedal', 'близко'], ['ristmik', 'перекрёсток'], ['foor', 'светофор'],
      ]),
      ex('forms', 'wordforms', 'Kirjuta õige vorm.', 'Vaata küsimust: kus? kuhu? kust? Kirjuta sõna selles vormis.', [
        ['pood', 'kus?', 'poes'], ['park', 'kuhu?', 'parki, pargisse'], ['buss', 'kust?', 'bussist'], ['kool', 'kuhu?', 'kooli, koolisse'], ['kesklinn', 'kus?', 'kesklinnas'], ['kodu', 'kuhu?', 'koju'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Mõtle: kus? kuhu? kust?', [
        'Ma olen praegu [koolis].', 'Hommikul ma lähen [kooli|koolisse].', 'Pärast tunde ma tulen [koolist].', 'Karl ootab bussi [bussipeatuses].', 'Ema läheb leiba ostma [poodi|poesse].', 'Pärast kooli sõidab Karl [koju].',
      ], { bank: 'koolis, kooli, koolist, bussipeatuses, poodi, koju' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Sulgudes on sõna algvorm. Vali sobiv vorm.', [
        ['Ema on … (pood)', 'poes', 'poodi', 'poest'],
        ['Lapsed jooksevad … (park)', 'parki', 'pargis', 'pargist'],
        ['Ma tulen … välja. (buss)', 'bussist', 'bussis', 'bussi'],
        ['Vanaema elab … (kesklinn)', 'kesklinnas', 'kesklinna', 'kesklinnast'],
        ['Me läheme õhtul … (kodu)', 'koju', 'kodus', 'kodust'],
      ]),
      ex('answer', 'transformation', 'Vasta küsimusele.', 'Kasuta sulgudes olevat sõna õiges vormis. Vasta tervelt lausega.', [
        ['Kus sa oled? (pood)', 'Ma olen …', 'Ma olen poes.'],
        ['Kuhu sa lähed? (park)', 'Ma lähen …', 'Ma lähen parki.|Ma lähen pargisse.'],
        ['Kust sa tuled? (kool)', 'Ma tulen …', 'Ma tulen koolist.'],
        ['Kuhu buss sõidab? (kesklinn)', 'Buss sõidab …', 'Buss sõidab kesklinna.'],
      ]),
      ex('fix', 'errorfix', 'Leia ja paranda viga.', 'Igas lauses on üks vale sõna. Kirjuta lause õigesti.', [
        ['Ma lähen koolis.', 'Ma lähen kooli.|Ma lähen koolisse.'], ['Ema on poodi.', 'Ema on poes.'], ['Ma tulen pargis.', 'Ma tulen pargist.'], ['Karl sõidab kodus.', 'Karl sõidab koju.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Ristmikul keera paremale.', 'Kool on poe vastas.', 'Ma lähen kooli bussiga.', 'Pood on pargi kõrval.',
      ]),
    ],
    model: ['Minu tee kooli', 'Ma elan Lasnamäel. Hommikul lähen ma kooli jala. Kõigepealt kõnnin ma otse mööda tänavat. Ristmikul ootan, kuni foor läheb roheliseks. Siis keeran vasakule. Teel näen ma parki ja poodi. Minu kool on pargi lähedal.'],
    starters: ['Ma elan …', 'Ma lähen kooli … (jala / bussiga / autoga).', 'Kõigepealt …', 'Siis keeran … (paremale / vasakule).', 'Teel näen …', 'Minu kool on … lähedal.'],
    plan: ['Kus sa elad?', 'Kuidas sa kooli lähed?', 'Mida sa teel näed?', 'Kus on sinu kool?'],
    talk: ['Joonista oma tee kooli.', 'Näita joonisel: kust sa tuled, kuhu sa lähed?', 'Kasuta sõnu otse, paremale, vasakule.', 'Mängi sõbraga: üks juhatab teed, teine kõnnib.'],
    self: ['Ma oskan öelda: koolis — kooli — koolist.', 'Ma oskan juhatada teed: otse, paremale, vasakule.', 'Ma oskan kirjeldada oma teed kooli.'],
  },

  // ---------- 5 Loodus ja loomad — suur, suurem, kõige suurem ----------
  {
    warm: ['Milliseid metsaloomi sa tead?', 'Kas sa oled metsas mõnda looma näinud?', 'Mis loom on sinu arvates kõige kiirem?'],
    vocab: [
      'mets – metsad — лес', 'orav – oravad — белка', 'rebane – rebased — лиса', 'siil – siilid — ёж', 'põder – põdrad — лось',
      'karu – karud — медведь', 'pesa – pesad — гнездо', 'urg – urud — нора', 'talveund magama — впадать в спячку',
      'pähkel – pähklid — орех',
    ],
    pictures: ['Kes elab metsas? Ühenda sõna ja pilt.', [['karu', 'bear'], ['jänes', 'rabbit'], ['hiir', 'mouse'], ['lind', 'bird'], ['puu', 'tree']]],
    reading: ['Metsa loomad', [
      'Eesti metsades elab palju loomi. Orav elab puu otsas pesas. Ta on väike ja kiire ning sööb pähkleid, seemneid ja seeni. Sügisel peidab orav toitu talveks.',
      'Rebane elab urus. Ta on punakas ja tal on kohev saba. Rebane on suurem ja kiirem kui orav. Siil on väike ja okkaline. Ta sööb putukaid ja usse. Talvel magab siil talveund, nagu ka karu. Karu on suur ja tugev. Jänes on väga kiire ja tal on pikad kõrvad. Valgejänese karv muutub talveks valgeks.',
      'Põder on Eesti metsa kõige suurem loom. Tal on pikad jalad ja isasel põdral on suured sarved. Põder sööb oksi ja lehti. Metsas tuleb olla vaikselt, siis võib loomi näha.',
    ], [
      ['Kus elab orav?', 'pesa|puu'],
      ['Mida teeb orav sügisel?', 'peidab'],
      ['Kus elab rebane?', 'urus'],
      ['Mida sööb siil?', 'putuka|usse'],
      ['Kes on Eesti metsa kõige suurem loom?', 'põder'],
    ]],
    truefalse: [
      ['Orav elab urus.', false],
      ['Rebane on kiirem kui orav.', true],
      ['Siil on suur ja pehme.', false],
      ['Karu magab talvel talveund.', true],
      ['Põder sööb oksi ja lehti.', true],
    ],
    choice: [
      ['Milline on rebane?', 'punakas, tal on kohev saba','hall ja okkaline', 'must ja väike'],
      ['Kes magavad talvel talveund?', 'siil ja karu', 'orav ja rebane', 'põder ja orav'],
      ['Mis on isasel põdral?', 'suured sarved', 'kohev saba', 'okkad'],
      ['Miks peidab orav sügisel toitu?', 'talvel on raske toitu leida', 'ta ei taha süüa', 'rebane palub teda'],
    ],
    rule: [
      'Võrdleme kahte: **suur → suurem**, kiire → kiirem, pikk → pikem, raske → raskem.',
      'Pea meeles: väike → **väiksem**, lühike → **lühem**, tark → **targem**.',
      'Kahe võrdlemisel kasuta sõna **kui**: Rebane on suurem **kui** orav.',
      '**Kõige** = kõigist kõige rohkem: Põder on metsa **kõige suurem** loom.',
    ],
    ru: '-m = более: suurem — больше, kiirem — быстрее. kui = чем. kõige suurem = самый большой.',
    use: ex('use', 'gaps', 'Võrdle loomi.', 'Vali sõna kastist. Kontrolli tekstist.', [
      'Rebane on [suurem] kui orav.', 'Rebane on ka [kiirem] kui orav.', 'Hiir on veel [väiksem] kui orav.', 'Põder on metsa [kõige] suurem loom.',
    ], { bank: 'suurem, kiirem, väiksem, kõige' }),
    review: ['Kus elab rebane?', 'Mida sööb orav?', 'Kuidas sa kooli lähed? (4. tund)'],
    practice: [
      ex('match', 'match', 'Kes see on?', 'Ühenda loom ja lause.', [
        ['orav', 'elab puu otsas pesas'], ['rebane', 'elab urus'], ['siil', 'on väike ja okkaline'], ['põder', 'on metsa kõige suurem loom'], ['karu', 'on pruun ja tugev'],
      ]),
      ex('forms', 'wordforms', 'Kirjuta võrdlev vorm.', 'Kirjuta sõna -m vormis: suur → suurem.', [
        ['suur', 'võrdle', 'suurem'], ['kiire', 'võrdle', 'kiirem'], ['pikk', 'võrdle', 'pikem'], ['väike', 'võrdle', 'väiksem'], ['vana', 'võrdle', 'vanem'], ['tark', 'võrdle', 'targem'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'Karu on suur, aga põder on veel [suurem].', 'Siil on väike, aga hiir on veel [väiksem].', 'Siil on aeglane, aga rebane on palju [kiirem].', 'Põder on metsa [kõige] suurem loom.', 'Metsas tuleb olla [vaikselt].',
      ], { bank: 'suurem, väiksem, kiirem, kõige, vaikselt' }),
      ex('which', 'choice', 'Vali õige sõna.', 'Võrdle kahte looma. Mis sõna sobib?', [
        ['Põder on … kui rebane.', 'suurem', 'suur', 'kõige suur'],
        ['Orav on … kui karu.', 'väiksem', 'väikesem', 'väike'],
        ['Jänes on … kui siil.', 'kiirem', 'kiire', 'kiiresti'],
        ['Karu on … kui hiir.', 'raskem', 'raske', 'raskesti'],
        ['Isa on … kui mina.', 'vanem', 'vana', 'vanam'],
      ]),
      ex('compare', 'transformation', 'Võrdle. Kirjuta lause sõnaga „kui”.', 'Kirjuta: … on …-m kui …', [
        ['karu — orav (suur)', 'Kes on suurem?', 'Karu on suurem kui orav.'],
        ['rebane — siil (kiire)', 'Kes on kiirem?', 'Rebane on kiirem kui siil.'],
        ['hiir — jänes (väike)', 'Kes on väiksem?', 'Hiir on väiksem kui jänes.'],
        ['põder — rebane (pikk)', 'Kes on pikem?', 'Põder on pikem kui rebane.'],
      ]),
      ex('sort', 'categorize', 'Kes magab talvel?', 'Kirjuta looma nimi õigesse rühma.', [
        ['Magab talvel talveund', ['siil', 'karu']], ['Ei maga talvel talveund', ['orav', 'rebane', 'põder', 'jänes']],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Orav elab puu otsas.', 'Talvel magab karu.', 'Rebasel on kohev saba.', 'Põder on suurem kui karu.',
      ]),
      ex('search', 'wordsearch', 'Leia metsa sõnad.', 'Leia ruudustikust kõik kaheksa sõna.', ['orav', 'rebane', 'siil', 'põder', 'karu', 'mets', 'pesa', 'urg']),
    ],
    model: ['Siil', 'Siil on väike metsaloom. Ta elab metsas ja aias. Siil on pruun ja okkaline. Ta sööb putukaid, usse ja tigusid. Siil on väiksem kui rebane, aga suurem kui hiir. Talvel magab siil talveund. Mulle meeldib siil, sest ta on armas.'],
    starters: ['… on metsaloom.', 'Ta elab …', 'Ta on … (suur / väike / kiire).', 'Ta sööb …', 'Ta on …-m kui …', 'Talvel ta …', 'Mulle meeldib …, sest …'],
    plan: ['Mis loom see on?', 'Kus ta elab?', 'Mida ta sööb?', 'Milline ta on?', 'Mida ta talvel teeb?'],
    talk: ['Ära ütle looma nime!', 'Ütle, kus ta elab ja mida ta sööb.', 'Võrdle: ta on suurem / väiksem / kiirem kui …', 'Teised arvavad: kes see on?'],
    self: ['Ma oskan võrrelda: suur — suurem, väike — väiksem.', 'Ma oskan öelda: Karu on suurem kui orav.', 'Ma oskan rääkida ühest metsaloomast.'],
  },

  // ---------- 6 Jõulud ja talvepühad — lihtminevik ----------
  {
    warm: ['Kas teie pere tähistab jõule või uut aastat?', 'Mida sa talvepühadel teed?', 'Mis kingitust sa ootad?'],
    vocab: [
      'jõulud — Рождество', 'kuusk – kuused — ёлка', 'kingitus – kingitused — подарок', 'jõuluvana — Дед Мороз',
      'piparkook – piparkoogid — имбирное печенье', 'küünal – küünlad — свеча', 'ehtima – me ehtisime — украшать (мы украшали)',
      'laulma – me laulsime — петь (мы пели)', 'jõululaupäev — сочельник (24 декабря)', 'Häid jõule! — Счастливого Рождества!',
    ],
    pictures: ['Talvepühad. Ühenda sõna ja pilt.', [['kuusk', 'christmastree'], ['täht', 'star'], ['lumememm', 'snowman'], ['lumehelves', 'snowflake'], ['küpsis', 'cookie'], ['kindad', 'mittens']]],
    reading: ['Jõulud meie peres', [
      'Eesti peredes tähistatakse jõule 24. detsembril, jõululaupäeval. Eelmisel aastal tähistasime jõule vanaema juures. Vanaisa tõi metsast suure kuuse. Juba hommikul ehtisime kuuse. Panime kuuse otsa kuldse tähe ja okstele punased kuulid. Siis küpsetasime vanaemaga piparkooke. Köögis lõhnas väga hästi!',
      'Õhtul süütasime küünlad ja laulsime jõululaule. Jõuluvana tuli ka! Iga laps luges talle luuletuse ja sai kingituse. Mina sain uue raamatu ja vend sai lauamängu. Hiljem sõime koos jõuluõhtusööki. Vanaema tegi verivorsti ja hapukapsast, nagu Eestis jõulude ajal tavaks on. Mina aitasin lauda katta. Pärast sööki mängisime vennaga uut lauamängu. See oli väga ilus õhtu.',
      'Järgmisel päeval läksime õue ja tegime suure lumememme.',
    ], [
      ['Kus pere jõule tähistas?', 'vanaema'],
      ['Mis pandi kuuse otsa?', 'täh'],
      ['Mida küpsetati vanaemaga?', 'piparkook'],
      ['Mida luges iga laps jõuluvanale?', 'luuletus'],
      ['Mida tegid lapsed järgmisel päeval?', 'lumememm'],
    ]],
    truefalse: [
      ['Pere tähistas jõule kodus.', false],
      ['Kuusel olid punased kuulid.', true],
      ['Jõuluvana ei tulnud.', false],
      ['Jutustaja sai uue raamatu.', true],
      ['Jõululaupäev on 24. detsembril.', true],
    ],
    choice: [
      ['Mis värvi kuulid olid kuusel?', 'punased', 'sinised', 'kollased'],
      ['Mis kingituse sai vend?', 'lauamängu', 'uue raamatu', 'palli'],
      ['Mida tehti õhtul?', 'süüdati küünlad ja lauldi', 'mindi kinno', 'mängiti õues'],
      ['Miks lõhnas köögis väga hästi?', 'seal küpsetati piparkooke', 'seal oli kuusk', 'seal põlesid küünlad'],
    ],
    rule: [
      '**Lihtminevik** — mis juba juhtus: eile, eelmisel aastal.',
      'ma …-sin, me …-sime: mängisin – mängisime, laulsin – laulsime, küpsetasin – küpsetasime.',
      'ta …-s: ta mängis, ta laulis, ta küpsetas.',
      'Pea meeles: tulema → ta **tuli**, me **tulime** · saama → ma **sain**, me **saime** · sööma → me **sõime** · minema → me **läksime**.',
    ],
    ru: '-si- / -s = прошедшее время: me laulsime = мы пели, ta tuli = он пришёл.',
    use: ex('use', 'categorize', 'Täna või eile?', 'Kas see juhtub täna või juhtus eile? Kirjuta õigesse rühma.', [
      ['Täna', ['laulame', 'küpsetame', 'saame', 'sööme']], ['Eile', ['laulsime', 'küpsetasime', 'saime', 'sõime']],
    ], { goal: 'g_notice' }),
    review: ['Mida pere jõululaupäeva hommikul tegi?', 'Kes tuli õhtul?', 'Kes on metsa kõige suurem loom? (5. tund)'],
    practice: [
      ex('match', 'match', 'Täna ja eile.', 'Ühenda olevik ja lihtminevik.', [
        ['laulame', 'laulsime'], ['küpsetame', 'küpsetasime'], ['saame', 'saime'], ['sööme', 'sõime'], ['läheme', 'läksime'], ['tuleme', 'tulime'],
      ], { goal: 'g_notice' }),
      ex('forms', 'wordforms', 'Mida me eile tegime?', 'Kirjuta me-vorm lihtminevikus.', [
        ['mängima', 'eile me …', 'mängisime'], ['tegema', 'eile me …', 'tegime'], ['ootama', 'eile me …', 'ootasime'], ['lugema', 'eile me …', 'lugesime'], ['panema', 'eile me …', 'panime'], ['andma', 'eile me …', 'andsime'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'Eile me [ehtisime] kuuse.', 'Me [küpsetasime] piparkooke.', 'Õhtul me [laulsime] jõululaule.', 'Lapsed [said] kingitusi.', 'Jõuluvana [tuli] meile külla.', 'Pärast seda me [sõime] koos.',
      ], { bank: 'ehtisime, küpsetasime, laulsime, said, tuli, sõime' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Lause räägib minevikust. Vali lihtminevik.', [
        ['Eelmisel aastal me … jõule vanaema juures.', 'tähistasime', 'tähistame', 'tähistama'],
        ['Eile ma … kingituse.', 'sain', 'saan', 'saama'],
        ['Eile õhtul … jõuluvana meile.', 'tuli', 'tuleb', 'tulema'],
        ['Eile … vend palju piparkooke.', 'sõi', 'sööb', 'sööma'],
        ['Eile õhtul me … jõululaule.', 'laulsime', 'laulame', 'laulma'],
      ]),
      ex('past', 'transformation', 'Kirjuta lihtminevikus.', 'Alusta lauset sõnaga „Eile”. Muuda tegusõna.', [
        ['Me ehime kuuse.', 'Eile …', 'Eile me ehtisime kuuse.|Eile ehtisime me kuuse.|Eile ehtisime kuuse.'],
        ['Ma küpsetan piparkooke.', 'Eile …', 'Eile ma küpsetasin piparkooke.|Eile küpsetasin ma piparkooke.|Eile küpsetasin piparkooke.'],
        ['Me laulame jõululaule.', 'Eile …', 'Eile me laulsime jõululaule.|Eile laulsime me jõululaule.|Eile laulsime jõululaule.'],
        ['Jõuluvana tuleb meile.', 'Eile …', 'Eile tuli jõuluvana meile.|Eile tuli meile jõuluvana.'],
        ['Lapsed saavad kingitusi.', 'Eile …', 'Eile said lapsed kingitusi.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Me ehtisime kuuse.', 'Jõuluvana tõi kingitusi.', 'Häid jõule ja head uut aastat!', 'Õhtul süütasime küünlad.',
      ]),
      ex('color', 'coloring', 'Värvi kuusk numbrite järgi.', 'Vaata numbrit ja värvi selle värviga. Ütle värvi nimi eesti keeles.'),
    ],
    model: ['Jõulukaart vanaemale', 'Kallis vanaema!\nSoovin sulle häid jõule ja head uut aastat! Eile ehtisime emaga kuuse. Me küpsetasime ka piparkooke. Täna õhtul laulame jõululaule. Ma ootan sind külla!\nKallistustega\nSofia'],
    starters: ['Kallis …!', 'Soovin sulle häid jõule ja head uut aastat!', 'Eile me …-sime …', 'Jõulude ajal me …', 'Ma ootan …', 'Kallistustega …'],
    plan: ['Kellele sa kirjutad?', 'Mida sa soovid?', 'Mida te eile tegite?', 'Mida te jõulude ajal teete?'],
    talk: ['Kas teie pere tähistab jõule või uut aastat?', 'Mida te eelmisel aastal tegite?', 'Mis kingituse sa said?', 'Mis sulle talvepühade juures kõige rohkem meeldib?'],
    self: ['Ma oskan öelda, mida me tegime: ehtisime, küpsetasime, laulsime.', 'Ma tean: tulema → tuli, saama → sain.', 'Ma kirjutasin jõulukaardi.'],
  },

  // ---------- 7 Raamatud ja lood — kõigepealt, siis, pärast seda, lõpuks ----------
  {
    warm: ['Mis on sinu lemmikraamat?', 'Kas sa käid raamatukogus?', 'Milliseid muinasjutte sa tead?'],
    vocab: [
      'raamat – raamatud — книга', 'muinasjutt – muinasjutud — сказка', 'tegelane – tegelased — персонаж', 'algus — начало',
      'lõpp — конец', 'kõigepealt — сначала', 'siis — потом', 'lõpuks — в конце концов', 'raamatukogu – raamatukogud — библиотека',
      'lugema – lugeda – ma loen — читать',
    ],
    pictures: ['Mis on loos? Ühenda sõna ja pilt.', [['raamat', 'book'], ['õun', 'apple'], ['puu', 'tree'], ['karu', 'bear'], ['jänes', 'rabbit']]],
    reading: ['Väike siil ja suur õun', [
      'Ühel sügisel leidis väike siil vana õunapuu alt suure punase õuna. Kõigepealt tahtis ta õuna koju viia, aga õun oli liiga raske. Siis proovis siil õuna veeretada. Õun veeres mäest alla ja siil jooksis järele. Siil oli väsinud, aga ta ei andnud alla.',
      'Pärast seda jäi õun kännu taha kinni. Seal ootas juba orav. „See on minu õun!” ütles orav. „Aga mina leidsin selle!” ütles siil. Siil oli kurb ja orav oli vihane. Nad vaidlesid kaua.',
      'Lõpuks hakkas orav naerma. „Õun on suur. Jagame selle pooleks!” ütles ta. Nii said mõlemad süüa ja neist said head sõbrad. Järgmisel päeval tõi orav siilile pähkleid. Nüüd käivad nad koos metsas jalutamas.',
    ], [
      ['Mida leidis siil?', 'õun'],
      ['Miks ei saanud siil õuna koju viia?', 'raske'],
      ['Kuhu õun veeres?', 'alla'],
      ['Kes ootas kännu juures?', 'orav'],
      ['Kuidas lugu lõppes?', 'jaga|sõbrad|pooleks'],
    ]],
    truefalse: [
      ['Lugu toimus talvel.', false],
      ['Õun oli väike ja roheline.', false],
      ['Siil proovis õuna veeretada.', true],
      ['Orav ütles, et õun on tema oma.', true],
      ['Lõpuks said siil ja orav sõpradeks.', true],
    ],
    choice: [
      ['Mis aastaajal lugu toimus?', 'sügisel', 'talvel', 'kevadel'],
      ['Kuhu jäi õun kinni?', 'kännu taha', 'puu otsa', 'jõkke'],
      ['Kes on loo tegelased?', 'siil ja orav', 'siil ja karu', 'orav ja jänes'],
      ['Mida see lugu õpetab?', 'jagamine teeb sõbraks', 'ära mine metsa', 'õunad on rasked'],
    ],
    rule: [
      'Lugu läheb järjekorras: **kõigepealt** → **siis** → **pärast seda** → **lõpuks**.',
      'Kõigepealt = alguses. Lõpuks = päris lõpus.',
      'Pärast ajasõna tuleb kohe tegusõna: **Siis veeres** õun alla. **Lõpuks said** nad sõpradeks.',
      'Loos on **algus**, **keskpaik** ja **lõpp**. Loo inimesed ja loomad on **tegelased**.',
    ],
    ru: 'kõigepealt — сначала, siis — потом, pärast seda — после этого, lõpuks — в конце. После этих слов сразу идёт глагол.',
    use: ex('use', 'match', 'Mis juhtus? Ühenda.', 'Ühenda ajasõna ja see, mis loos juhtus.', [
      ['Kõigepealt', 'tahtis siil õuna koju viia.'], ['Siis', 'proovis siil õuna veeretada.'], ['Pärast seda', 'jäi õun kännu taha kinni.'], ['Lõpuks', 'jagasid nad õuna pooleks.'],
    ], { goal: 'g_notice' }),
    review: ['Kes leidis õuna?', 'Mida tegid siil ja orav lõpuks?', 'Mida te jõulude ajal tegite? (6. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['algus', 'начало'], ['lõpp', 'конец'], ['tegelane', 'персонаж'], ['muinasjutt', 'сказка'], ['raamatukogu', 'библиотека'], ['kõigepealt', 'сначала'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Lugu peab minema õiges järjekorras.', [
        '[Kõigepealt] leidis siil õuna.', '[Siis] veeretas ta õuna.', '[Pärast] seda jäi õun kinni.', '[Lõpuks] said nad sõpradeks.',
      ], { bank: 'kõigepealt, siis, pärast, lõpuks' }),
      ex('sort', 'categorize', 'Muinasjutt „Naeris”: algus, keskpaik või lõpp?', 'Loe lauset. Kirjuta see õigesse rühma.', [
        ['Algus', ['Vanaisa istutas aeda naeri.', 'Naeris kasvas väga suureks.']],
        ['Keskpaik', ['Vanaisa kutsus appi vanaema.', 'Siis tulid appi lapselaps, koer ja kass.']],
        ['Lõpp', ['Lõpuks tuli appi hiir.', 'Kõik koos tõmbasid naeri välja.']],
      ], { goal: 'g_read' }),
      ex('start', 'transformation', 'Alusta lauset ajasõnaga.', 'Kirjuta lause uuesti. Tegusõna tuleb kohe ajasõna järel.', [
        ['Siil leidis õuna. (kõigepealt)', 'Kõigepealt …', 'Kõigepealt leidis siil õuna.'],
        ['Õun veeres alla. (siis)', 'Siis …', 'Siis veeres õun alla.'],
        ['Orav tuli. (pärast seda)', 'Pärast seda …', 'Pärast seda tuli orav.'],
        ['Nad said sõpradeks. (lõpuks)', 'Lõpuks …', 'Lõpuks said nad sõpradeks.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Siil leidis suure õuna.', 'Õun veeres mäest alla.', 'Nad jagasid õuna pooleks.', 'Lõpuks said nad sõpradeks.',
      ]),
      ex('cross', 'crossword', 'Ristsõna: raamatud ja lood.', 'Loe vihjet ja kirjuta sõna.', [
        ['Lugu, kus loomad oskavad rääkida.', 'muinasjutt'], ['Seal saab raamatuid laenata.', 'raamatukogu'], ['Loo esimene osa.', 'algus'],
        ['Loo viimane osa.', 'lõpp'], ['Inimene või loom loos.', 'tegelane'], ['Seda loed.', 'raamat'],
      ]),
      ex('odd', 'choice', 'Mis ei sobi?', ODD, [
        ['algus · keskpaik · lõpp · õun', 'õun', 'algus', 'keskpaik', 'lõpp'],
        ['kõigepealt · siis · lõpuks · raamat', 'raamat', 'kõigepealt', 'siis', 'lõpuks'],
        ['orav · siil · jänes · raamatukogu', 'raamatukogu', 'orav', 'siil', 'jänes'],
      ]),
    ],
    model: ['Siil ja õun', 'Ühel päeval leidis siil suure õuna. Kõigepealt tahtis ta õuna koju viia. Siis veeres õun mäest alla. Pärast seda leidis õuna orav. Siil oli kurb. Lõpuks jagasid nad õuna pooleks. Nüüd on nad head sõbrad.'],
    starters: ['Minu lugu on …', 'Loo tegelased on …', 'Kõigepealt …', 'Siis …', 'Pärast seda …', 'Lõpuks …', 'Mulle meeldib see lugu, sest …'],
    plan: ['Mis on loo nimi?', 'Kes on tegelased?', 'Mis juhtus alguses?', 'Mis juhtus keskel?', 'Kuidas lugu lõppes?'],
    talk: ['Mis on sinu lemmikraamat või -muinasjutt?', 'Kes on tegelased?', 'Mis juhtus kõigepealt, siis ja lõpuks?', 'Miks sulle see lugu meeldib?'],
    self: ['Ma oskan jutustada lugu järjekorras: kõigepealt, siis, pärast seda, lõpuks.', 'Ma tean: pärast ajasõna tuleb tegusõna (Siis veeres õun).', 'Ma oskan rääkida oma lemmikraamatust.'],
  },

  // ---------- 8 Söök ja tervis — osastav (mida?) ----------
  {
    warm: ['Mida sa täna hommikul sõid?', 'Mis on sinu lemmiktoit?', 'Mis toit on tervislik?'],
    vocab: [
      'hommikusöök — завтрак', 'lõuna – lõunasöök — обед', 'õhtusöök — ужин', 'puder – ma söön putru — каша',
      'köögiviljad – köögivilju — овощи', 'puuviljad – puuvilju — фрукты', 'tervislik — полезный для здоровья',
      'magus — сладкий', 'vesi – ma joon vett — вода', 'trenn – trennid — тренировка',
    ],
    pictures: ['Toit ja jook. Ühenda sõna ja pilt.', [['leib', 'bread'], ['piim', 'milk'], ['juust', 'cheese'], ['muna', 'egg'], ['porgand', 'carrot'], ['banaan', 'banana'], ['pirn', 'pear'], ['maasikas', 'strawberry']]],
    reading: ['Tervislik päev', [
      'Robin on üheksa-aastane ja ta tahab olla terve ja tugev. Hommikul sööb ta putru ja joob klaasi piima. Vahel sööb ta ka võileiba juustuga. Ema ütleb, et hommikusöök annab jõudu kogu hommikuks.',
      'Koolis on lõunaks supp, leib ja salat. Robin ei armasta salatit, aga ta sööb selle ära, sest köögiviljad on tervislikud. Pärast kooli sööb ta õuna või banaani. Puu- ja köögiviljades on palju vitamiine. Õhtusöögiks teeb ema kala ja kartuleid. Pärast trenni on Robin väga näljane ja sööb kõik ära.',
      'Robin joob päeva jooksul palju vett. Limonaadi ta ei joo, sest selles on palju suhkrut. Kommi sööb ta ainult laupäeval. Robin käib kaks korda nädalas korvpallitrennis. Igal ööl magab ta kümme tundi. Arst ütles, et Robin on väga terve poiss.',
    ], [
      ['Mida sööb Robin hommikul?', 'putru'],
      ['Mis on koolis lõunaks?', 'supp|salat'],
      ['Mida sööb Robin pärast kooli?', 'õuna|banaani'],
      ['Miks ei joo Robin limonaadi?', 'suhkru|suhkur'],
      ['Mitu tundi Robin öösel magab?', 'kümme|10'],
    ]],
    truefalse: [
      ['Hommikul joob Robin piima.', true],
      ['Robin armastab salatit väga.', false],
      ['Õhtusöögiks teeb ema kala ja kartuleid.', true],
      ['Robin sööb kommi iga päev.', false],
      ['Robin käib korvpallitrennis.', true],
    ],
    choice: [
      ['Mida teeb ema õhtusöögiks?', 'kala ja kartuleid', 'putru', 'pannkooke'],
      ['Millal sööb Robin kommi?', 'ainult laupäeval', 'iga päev', 'hommikul'],
      ['Mida Robin joob päeva jooksul?', 'palju vett', 'limonaadi', 'kohvi'],
      ['Miks sööb Robin salati ära, kuigi ta seda ei armasta?', 'ta teab, et köögiviljad on tervislikud', 'salat on magus', 'tal ei ole muud süüa'],
    ],
    rule: [
      'Pärast sõnu **söön, joon, tahan, ostan** küsime **mida?** ja sõna muutub:',
      'leib → Ma söön **leiba**. · piim → Ma joon **piima**. · õun → Ma tahan **õuna**.',
      'Pea meeles: vesi → **vett** · puder → **putru** · supp → **suppi** · porgand → **porgandit**.',
      'Palju asju: kartulid → **kartuleid**, kommid → **komme**.',
    ],
    ru: 'После «ем, пью, хочу» отвечаем на вопрос mida? (что?) — слово меняется: leib → leiba, vesi → vett.',
    use: ex('use', 'gaps', 'Leia tekstist: mida?', 'Vali sõna kastist. Kontrolli tekstist.', [
      'Robin sööb hommikul [putru].', 'Ta joob klaasi [piima].', 'Pärast kooli sööb ta [õuna] või banaani.', 'Robin joob palju [vett].',
    ], { bank: 'putru, piima, õuna, vett' }),
    review: ['Mida sööb Robin hommikul?', 'Mitu tundi Robin magab?', 'Mis juhtus siili loos lõpuks? (7. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['hommikusöök', 'завтрак'], ['lõuna', 'обед'], ['õhtusöök', 'ужин'], ['köögiviljad', 'овощи'], ['puuviljad', 'фрукты'], ['magus', 'сладкий'],
      ]),
      ex('sort', 'categorize', 'Sorteeri toidud.', 'Kirjuta iga sõna õigesse rühma.', [
        ['Köögiviljad', ['porgand', 'kartul', 'kapsas', 'kurk']], ['Puuviljad', ['õun', 'banaan', 'pirn', 'apelsin']], ['Joogid', ['piim', 'vesi', 'mahl', 'tee']],
      ]),
      ex('forms', 'wordforms', 'Mida? Kirjuta õige vorm.', 'Ma söön / joon … Kirjuta sõna vastuseks küsimusele mida?', [
        ['leib', 'ma söön …', 'leiba'], ['piim', 'ma joon …', 'piima'], ['vesi', 'ma joon …', 'vett'], ['puder', 'ma söön …', 'putru'], ['juust', 'ma söön …', 'juustu'], ['supp', 'ma söön …', 'suppi'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'Hommikul ma söön [leiba].', 'Ma joon klaasi [piima].', 'Ma tahan punast [õuna].', 'Robin sööb [putru].', 'Ema praeb õhtuks [kala].', 'Lapsed joovad palju [vett].',
      ], { bank: 'leiba, piima, õuna, putru, kala, vett' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Mida? Vali sõna, mis sobib lausesse.', [
        ['Ma joon …', 'mahla', 'mahl'],
        ['Vend sööb …', 'suppi', 'supp'],
        ['Kas sa tahad …?', 'banaani', 'banaan'],
        ['Hommikul ma söön …', 'putru', 'puder'],
        ['Isa ostab poest …', 'juustu', 'juust'],
      ]),
      ex('fix', 'errorfix', 'Leia ja paranda viga.', 'Igas lauses on üks vale sõna. Kirjuta lause õigesti.', [
        ['Ma söön leib.', 'Ma söön leiba.'], ['Ta joob vesi.', 'Ta joob vett.'], ['Ma tahan banaan.', 'Ma tahan banaani.'], ['Me sööme puder.', 'Me sööme putru.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Hommikul söön ma putru.', 'Köögiviljad on tervislikud.', 'Ma joon palju vett.', 'Robin sööb pärast kooli õuna.',
      ]),
    ],
    model: ['Minu päeva menüü', 'Hommikul söön ma putru ja joon teed. Koolis söön lõunaks suppi ja leiba. Pärast kooli söön ma õuna või pirni. Õhtusöögiks teeb isa kana ja riisi. Ma joon päeva jooksul palju vett. Kommi söön ainult nädalavahetusel. Minu arvates on see tervislik menüü.'],
    starters: ['Hommikul söön ma … ja joon …', 'Lõunaks söön …', 'Pärast kooli söön …', 'Õhtusöögiks …', 'Ma ei söö palju …, sest …', '… on tervislik.'],
    plan: ['Mida sa sööd hommikul?', 'Mida sa sööd lõunal ja õhtul?', 'Mida sa jood?', 'Mis on tervislik?'],
    talk: ['Mis on sinu lemmiktoit?', 'Mida sa sööd hommikul, lõunal ja õhtul?', 'Mis on tervislik, mis ei ole?', 'Koosta tervisliku päeva menüü ja räägi sellest.'],
    self: ['Ma oskan öelda: ma söön leiba, joon piima, tahan õuna.', 'Ma tean: vesi → vett, puder → putru.', 'Ma oskan rääkida oma päeva menüüst.'],
  },

  // ---------- 9 Ilm ja aastaajad — talvel, eile, täna, homme ----------
  {
    warm: ['Milline ilm on täna?', 'Mis on sinu lemmikaastaeg?', 'Mida sa talvel õues teed?'],
    vocab: [
      'ilm — погода', 'temperatuur — температура', 'kraad – kümme kraadi — градус', 'sajab (vihma / lund) — идёт (дождь / снег)',
      'paistab (päike) — светит (солнце)', 'tuul – tuuled — ветер', 'pilvine — облачный', 'libe — скользкий',
      'lumememm – lumememmed — снеговик', 'kelgutama – ma kelgutan — кататься на санках',
    ],
    pictures: ['Ilm ja riided. Ühenda sõna ja pilt.', [['päike', 'sun'], ['vihm', 'rain'], ['lumehelves', 'snowflake'], ['vihmavari', 'umbrella'], ['lumememm', 'snowman'], ['kindad', 'mittens'], ['saapad', 'boots'], ['müts', 'hat']]],
    reading: ['Talvine päev', [
      'Täna on külm talvepäev. Õues on miinus kümme kraadi. Eile sadas palju lund ja kõik on valge. Lapsed panid selga soojad joped, pähe mütsid ja kätte kindad. Nad läksid mäele kelgutama. Mõned lapsed tegid lumememme ja panid talle porgandist nina.',
      'Tee peal oli libe ja Sander kukkus, aga ta ei saanud haiget. Pärast õues olemist jõid lapsed kodus kuuma teed. Õhtul vaatas Sander koos isaga ilmateadet. Homme lubab ilmateade veel rohkem lund. Talvel on päevad lühikesed ja ööd pikad.',
      'Sandri lemmikaastaeg on aga suvi. Suvel on soe ja päike paistab kaua. Siis ujub Sander järves ja sõidab rattaga. Kevadel sulab lumi ja puudele tulevad lehed. Siis tulevad soojadelt maadelt tagasi ka linnud. Kevad on Sandri ema lemmikaastaeg. Sügisel sajab sageli vihma ja puhub tugev tuul. Siis on vaja vihmavarju ja kummikuid.',
    ], [
      ['Mitu kraadi on täna õues?', 'kümme|10'],
      ['Mis juhtus eile?', 'sadas|lund'],
      ['Mida lapsed mäel tegid?', 'kelgut'],
      ['Millest tehti lumememme nina?', 'porgand'],
      ['Mis on Sandri lemmikaastaeg?', 'suvi'],
    ]],
    truefalse: [
      ['Täna on soe suvepäev.', false],
      ['Eile sadas palju lund.', true],
      ['Sander sai kukkudes haiget.', false],
      ['Suvel ujub Sander järves.', true],
      ['Sügisel sajab sageli vihma.', true],
    ],
    choice: [
      ['Mis juhtus Sandriga?', 'ta kukkus libedal teel', 'ta jäi haigeks', 'ta kaotas kinda'],
      ['Mida jõid lapsed kodus?', 'kuuma teed', 'külma piima', 'mahla'],
      ['Mida lubab ilmateade homseks?', 'veel rohkem lund', 'sooja ilma', 'vihma'],
      ['Miks panid lapsed selga soojad joped?', 'õues oli väga külm', 'nad said uued joped', 'neil oli trenn'],
    ],
    rule: [
      'Millal? Aastaajad: talv → **talvel**, kevad → **kevadel**, suvi → **suvel**, sügis → **sügisel**.',
      '**Eile** sadas lund (minevik). **Täna** sajab lund (olevik). **Homme** sajab ka lund.',
      'Ilm: on külm / soe / pilvine · sajab vihma / lund · paistab päike · puhub tuul.',
      'Minevikus: sajab → **sadas**, paistab → **paistis**, puhub → **puhus**, on → **oli**.',
    ],
    ru: 'talvel = зимой, suvel = летом, eile = вчера, täna = сегодня, homme = завтра. Eile sadas = вчера шёл.',
    use: ex('use', 'categorize', 'Eile või täna?', 'Vaata tegusõna. Kirjuta õigesse rühma.', [
      ['Eile (minevik)', ['sadas lund', 'oli libe', 'puhus tuul']], ['Täna (olevik)', ['sajab vihma', 'on külm', 'paistab päike']],
    ], { goal: 'g_notice' }),
    review: ['Mida lapsed mäel tegid?', 'Mis on Sandri lemmikaastaeg?', 'Mida sa täna hommikul sõid? (8. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['talvel', 'зимой'], ['kevadel', 'весной'], ['suvel', 'летом'], ['sügisel', 'осенью'], ['eile', 'вчера'], ['homme', 'завтра'],
      ]),
      ex('sort', 'categorize', 'Mis aastaajal?', 'Kirjuta iga lause õigesse rühma.', [
        ['Talvel', ['kelgutame', 'teeme lumememme']], ['Kevadel', ['sulab lumi', 'puudele tulevad lehed']], ['Suvel', ['ujume järves', 'on palav']], ['Sügisel', ['langevad lehed', 'algab kool']],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        '[Talvel] sajab lund.', '[Suvel] on soe ja me ujume.', '[Eile] sadas palju lund.', '[Homme] on päikeseline ilm.', '[Sügisel] langevad lehed.', '[Kevadel] sulab lumi.',
      ], { bank: 'talvel, suvel, eile, homme, sügisel, kevadel' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Eile = minevik, täna = olevik. Vali sobiv sõna.', [
        ['Eile … vihma.', 'sadas', 'sajab'],
        ['Täna … päike.', 'paistab', 'paistis'],
        ['Eile … tugev tuul.', 'puhus', 'puhub'],
        ['Täna on külm, aga eile … soe.', 'oli', 'on'],
        ['Eile me … mäel.', 'kelgutasime', 'kelgutame'],
      ]),
      ex('past', 'transformation', 'Täna → eile.', 'Kirjuta lause minevikus. Alusta sõnaga „Eile”.', [
        ['Täna sajab lund.', 'Eile …', 'Eile sadas lund.'],
        ['Täna paistab päike.', 'Eile …', 'Eile paistis päike.'],
        ['Täna on libe.', 'Eile …', 'Eile oli libe.'],
        ['Täna puhub tuul.', 'Eile …', 'Eile puhus tuul.'],
        ['Täna me kelgutame.', 'Eile …', 'Eile me kelgutasime.|Eile kelgutasime me.|Eile kelgutasime.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Täna on külm ilm.', 'Eile sadas palju lund.', 'Lapsed tegid lumememme.', 'Suvel on soe.',
      ]),
      ex('search', 'wordsearch', 'Leia ilma sõnad.', 'Leia ruudustikust kõik kaheksa sõna.', ['ilm', 'tuul', 'lumi', 'vihm', 'talv', 'suvi', 'kevad', 'sügis']),
    ],
    model: ['Minu lemmikaastaeg', 'Minu lemmikaastaeg on talv. Talvel on külm ja sajab lund. Õues on tihti miinus viis või kümme kraadi. Ma panen selga sooja jope, pähe mütsi ja kätte kindad. Me kelgutame vennaga mäel ja teeme lumememme. Eile tegime suure lumememme. Mulle meeldib talv, sest lumi on ilus.'],
    starters: ['Minu lemmikaastaeg on …', '…-l on … (soe / külm).', 'Siis sajab / paistab …', 'Ma panen selga …', '…-l me …', 'Mulle meeldib …, sest …'],
    plan: ['Mis on sinu lemmikaastaeg?', 'Milline on siis ilm?', 'Mida sa selga paned?', 'Mida sa siis teed?'],
    talk: ['Ole ilmateadustaja!', 'Milline on homme ilm: soe, külm, pilvine?', 'Mitu kraadi on?', 'Kas sajab vihma või lund? Kas paistab päike?', 'Mida peaks selga panema?'],
    talkTip: 'Näiteks: Homme on pilvine ja sajab lund. Õues on miinus viis kraadi. Pane selga soe jope!',
    self: ['Ma oskan öelda: talvel, kevadel, suvel, sügisel.', 'Ma oskan öelda: eile sadas, täna sajab.', 'Ma oskan kirjeldada ilma.'],
  },

  // ---------- 10 Minu pere ja kodu — omastav (kelle?) ----------
  {
    warm: ['Kas sa elad korteris või majas?', 'Mitu tuba teie kodus on?', 'Mis on sinu lemmikkoht kodus?'],
    vocab: [
      'korter – korterid — квартира', 'maja – majad — дом', 'tuba – toad — комната', 'köök – köögid — кухня', 'elutuba — гостиная',
      'magamistuba — спальня', 'vannituba — ванная', 'rõdu – rõdud — балкон', 'naaber – naabrid — сосед',
      'kodu – kodus – koju — дом (родной)',
    ],
    pictures: ['Pere ja kodu. Ühenda sõna ja pilt.', [['maja', 'house'], ['voodi', 'bed'], ['laud', 'table'], ['tool', 'chair'], ['ema', 'mother'], ['isa', 'father'], ['beebi', 'baby'], ['vanaema', 'grandmother']]],
    reading: ['Meie kodu', [
      'Minu nimi on Anna ja ma olen üheksa-aastane. Meie peres on neli inimest: ema, isa, mina ja minu väike vend Leo. Me elame kolmetoalises korteris neljandal korrusel. Meil on elutuba, magamistuba ja lastetuba.',
      'Lastetoas elame mina ja Leo. Toas on kaks voodit, kirjutuslaud ja suur riiul raamatutega. Leo voodi on akna all ja minu voodi on ukse kõrval. Riiuli peal on akvaarium kahe kalaga. Seinal on suur Eesti kaart. Köögis teeb isa tavaliselt hommikusöögi. Vannituba on väike, aga seal on suur peegel. Ema lemmikkoht on rõdu, kus kasvavad lilled.',
      'Elutoas on diivan ja televiisor. Õhtuti mängime seal koos lauamänge. Isa auto seisab maja ees. Meie naabrid on sõbralikud ja vahel toovad meile kooki. Meie all elab vanaproua Maie, kellel on kass Nurr. Mõnikord toon ma Maiele poest piima. Nädalavahetusel sõidame vanaema juurde maale. Vanaema majal on saun ja suur aed. Seal on ruumi palli mängida ja joosta.',
    ], [
      ['Mitu inimest on Anna peres?', 'neli|4'],
      ['Mitmendal korrusel pere elab?', 'neljanda|4'],
      ['Kus on Leo voodi?', 'akna'],
      ['Mis on ema lemmikkoht?', 'rõdu'],
      ['Mida pere õhtuti elutoas teeb?', 'lauamäng|mängi'],
    ]],
    truefalse: [
      ['Anna pere elab majas.', false],
      ['Isa teeb köögis hommikusöögi.', true],
      ['Rõdul kasvavad lilled.', true],
      ['Leo voodi on ukse kõrval.', false],
      ['Naabrid on sõbralikud.', true],
    ],
    choice: [
      ['Mitu tuba on korteris?', 'kolm', 'kaks', 'neli'],
      ['Mis on lastetoas?', 'kaks voodit, kirjutuslaud ja riiul', 'diivan ja televiisor', 'pliit ja külmkapp'],
      ['Mida toovad naabrid?', 'kooki', 'lilli', 'raamatuid'],
      ['Miks on lastetoas kaks voodit?', 'seal elavad Anna ja Leo', 'seal magab ka vanaema', 'seal on külalistetuba'],
    ],
    rule: [
      '**Kelle?** (чей?) — omanik on ees, asi on taga: **ema** tuba, **isa** auto, **Leo** voodi.',
      'Mõni sõna muutub: vend → **venna** auto · õde → **õe** nukk · koer → **koera** kauss · laps → **lapse** tuba.',
      'Minu, sinu, tema: **minu** tuba, **sinu** raamat, **tema** voodi.',
      'Need on **venna** mänguasjad. Kus on **kassi** mänguasi?',
    ],
    ru: 'ema tuba = комната мамы, venna auto = машина брата. Kelle? = чей? Сначала владелец, потом вещь.',
    use: ex('use', 'gaps', 'Kelle? Leia tekstist.', 'Vali sõna kastist. Kontrolli tekstist.', [
      '[Leo] voodi on akna all.', '[Isa] auto seisab maja ees.', '[Ema] lemmikkoht on rõdu.', '[Vanaema] majal on saun ja suur aed.',
    ], { bank: 'Leo, isa, ema, vanaema' }),
    review: ['Kus on Leo voodi?', 'Mida pere õhtuti teeb?', 'Milline ilm oli eile? (9. tund)'],
    practice: [
      ex('match', 'match', 'Mida me seal teeme?', 'Ühenda tuba ja lause.', [
        ['köök', 'Seal teeme süüa.'], ['magamistuba', 'Seal magame.'], ['vannituba', 'Seal peseme end.'], ['elutuba', 'Seal vaatame televiisorit.'], ['rõdu', 'Seal kasvavad lilled.'],
      ]),
      ex('forms', 'wordforms', 'Kelle? Kirjuta õige vorm.', 'Kirjuta sõna nii, et see vastab küsimusele kelle?', [
        ['vend', 'kelle auto?', 'venna'], ['õde', 'kelle nukk?', 'õe'], ['koer', 'kelle kauss?', 'koera'], ['kass', 'kelle mänguasi?', 'kassi'], ['laps', 'kelle voodi?', 'lapse'], ['sõber', 'kelle jalgratas?', 'sõbra'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        'See on [ema] tuba.', 'See on [isa] auto.', 'Need on [venna] mänguasjad.', '[Minu] kodu on hubane.', 'See on [õe] voodi.', 'Kus on [koera] kauss?',
      ], { bank: 'ema, isa, venna, minu, õe, koera' }),
      ex('which', 'choice', 'Vali õige vorm.', 'Kelle asi see on? Vali sobiv sõna.', [
        ['See on minu … raamat.', 'venna', 'vend', 'vennad'],
        ['Need on … mänguasjad.', 'lapse', 'laps', 'lapsed'],
        ['See on minu … nukk.', 'õe', 'õde', 'õed'],
        ['Kas see on … kauss?', 'kassi', 'kass', 'kassid'],
      ]),
      ex('whose', 'transformation', 'Kirjuta: see on kelle asi?', 'Kirjuta lause sõnadega „See on …” või „Need on …”.', [
        ['Isal on auto.', 'See on …', 'See on isa auto.'],
        ['Õel on nukk.', 'See on …', 'See on õe nukk.'],
        ['Koeral on kauss.', 'See on …', 'See on koera kauss.'],
        ['Vennal on mänguasjad.', 'Need on …', 'Need on venna mänguasjad.'],
      ]),
      ex('sort', 'categorize', 'Mis on kus?', 'Kirjuta iga sõna õigesse tuppa.', [
        ['Köögis', ['pliit', 'külmkapp']], ['Magamistoas', ['voodi', 'riidekapp']], ['Vannitoas', ['vann', 'peegel']], ['Elutoas', ['diivan', 'televiisor']],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Meie korter on neljandal korrusel.', 'Köögis teeb isa hommikusöögi.', 'Rõdul kasvavad lilled.', 'See on minu venna voodi.',
      ]),
      ex('cross', 'crossword', 'Ristsõna: kodu.', 'Loe vihjet ja kirjuta sõna.', [
        ['Siin teeme süüa.', 'köök'], ['Siin magame.', 'magamistuba'], ['Siin peseme end.', 'vannituba'],
        ['Kodu suures majas, kus elab palju peresid.', 'korter'], ['Inimesed, kes elavad meie kõrval.', 'naabrid'], ['Seal on värske õhk ja kasvavad lilled.', 'rõdu'],
      ]),
    ],
    model: ['Minu kodu', 'Ma elan koos ema, isa ja õega. Meie maja on Tartus. Majas on neli tuba ja suur köök. Minu tuba on teisel korrusel. Toas on voodi, laud ja riiul. Minu õe tuba on minu toa kõrval. Kõige rohkem meeldib mulle meie aed.'],
    starters: ['Ma elan … (korteris / majas).', 'Meie kodus on … tuba.', 'Minu toas on …', '… tuba on …', 'Minuga koos elavad …', 'Minu lemmikkoht on …, sest …'],
    plan: ['Kus sa elad?', 'Mitu tuba teie kodus on?', 'Milline on sinu tuba?', 'Kes elab sinuga koos?', 'Mis on sinu lemmikkoht?'],
    talk: ['Joonista oma kodu plaan.', 'Näita: siin on köök, siin on minu tuba …', 'Ütle, kelle tuba see on: ema ja isa tuba, venna tuba.', 'Mis on sinu lemmikkoht ja miks?'],
    self: ['Ma oskan öelda, kelle asi see on: ema tuba, venna auto.', 'Ma oskan nimetada tube: köök, elutuba, magamistuba.', 'Ma oskan kirjeldada oma kodu.'],
  },

  // ---------- 11 Projekt — ja, aga, sest, et ----------
  {
    warm: ['Mis on sinu lemmikloom või hobi?', 'Mida sa sellest juba tead?', 'Kas sa oled kunagi plakatit teinud?'],
    vocab: [
      'projekt – projektid — проект', 'plakat – plakatid — плакат', 'esitlus – esitlused — выступление', 'pilt – pildid — картинка',
      'pealkiri – pealkirjad — заголовок', 'fakt – faktid — факт', 'sest — потому что', 'aga — но', 'huvitav — интересный',
      'tutvustama – ma tutvustan — представлять',
    ],
    pictures: ['Mida on plakati jaoks vaja? Ühenda sõna ja pilt.', [['pliiats', 'pencil'], ['käärid', 'scissors'], ['raamat', 'book'], ['vihik', 'notebook']]],
    reading: ['Kuidas teha plakatit?', [
      'Kõigepealt vali teema, mis sulle väga meeldib, näiteks sinu koer või jalgpall. Kirjuta plakati ülaossa suurelt pealkiri. Siis kogu viis huvitavat fakti. Fakte võid leida raamatust või küsida õpetajalt ja vanematelt. Lisa plakatile pildid või joonistused. Kirjuta lühikesed laused, sest pikki lauseid on raske lugeda.',
      'Mia tegi plakati koertest. Tema pealkiri oli „Koer on inimese sõber”. Mia kirjutas, et koerad tunnevad lõhnu palju paremini kui inimesed. Koerad kuulevad ka väga hästi. Mia koer Pontu on väike, aga väga kiire. Ta oskab palli tuua ja käppa anda. Mia joonistas plakatile Pontu pildi ja kirjutas selle alla tema nime. Ta kirjutas ka, et koer vajab iga päev jalutamist.',
      'Lõpuks harjuta esitlust peegli ees või emaga. Räägi selgelt ja vaata kuulajaid. Kui keegi küsib küsimuse, vasta rahulikult. Pärast Mia esitlust küsis õpetaja: „Kui vana Pontu on?” Mia vastas, et Pontu on kaheaastane.',
    ], [
      ['Mida tuleb kõigepealt teha?', 'teema'],
      ['Mitu fakti tuleb koguda?', 'viis|5'],
      ['Kust võib fakte leida?', 'raamat|õpetaja|vanema'],
      ['Millest tegi Mia plakati?', 'koer'],
      ['Kus võib esitlust harjutada?', 'peegli|ema'],
    ]],
    truefalse: [
      ['Plakatil peab olema pealkiri.', true],
      ['Plakatile tuleb kirjutada pikad laused.', false],
      ['Mia tegi plakati kassidest.', false],
      ['Koerad tunnevad lõhnu paremini kui inimesed.', true],
      ['Esitluse ajal tuleb vaadata kuulajaid.', true],
    ],
    choice: [
      ['Mida peab plakatil olema?', 'pealkiri, faktid ja pildid', 'ainult pilt', 'pikk jutt'],
      ['Kuidas esitluse ajal rääkida?', 'selgelt ja kuulajaid vaadates', 'väga vaikselt', 'paberist lugedes'],
      ['Milline on Mia koer Pontu?', 'väike, aga väga kiire', 'suur ja aeglane', 'vana ja laisk'],
      ['Miks peavad laused plakatil olema lühikesed?', 'pikki lauseid on raske lugeda', 'paber on väike', 'õpetaja ei luba pikki lauseid'],
    ],
    rule: [
      '**ja** — liidab: Mul on kass **ja** koer.',
      '**aga** — vastandab: Kass on armas, **aga** ta kriimustab.',
      '**sest** — ütleb põhjuse: Mulle meeldib koer, **sest** ta on sõbralik.',
      '**et** — ütleb, mida tean või ütlen: Ma tean, **et** koerad kuulevad hästi.',
      'Enne sõnu **aga, sest, et** paneme koma.',
    ],
    ru: 'ja — и, aga — но, sest — потому что, et — что. Перед aga, sest, et ставим запятую.',
    use: ex('use', 'match', 'Ühenda lause algus ja lõpp.', 'Loe lause algust. Leia sobiv lõpp.', [
      ['Mul on kass', 'ja koer.'], ['Pontu on väike,', 'aga väga kiire.'], ['Kirjuta lühikesed laused,', 'sest pikki lauseid on raske lugeda.'], ['Mia kirjutas,', 'et koerad kuulevad hästi.'],
    ], { goal: 'g_notice' }),
    review: ['Mitu fakti tuleb plakatile kirjutada?', 'Millest tegi Mia plakati?', 'Kelle auto seisab maja ees? (10. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda eesti ja vene sõna.', 'Mis on see sõna vene keeles? Ühenda.', [
        ['plakat', 'плакат'], ['esitlus', 'выступление'], ['pealkiri', 'заголовок'], ['fakt', 'факт'], ['huvitav', 'интересный'], ['tutvustama', 'представлять'],
      ]),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Mõni sõna sobib kaks korda.', [
        'Mulle meeldib koer, [sest] ta on sõbralik.', 'Kass on armas, [aga] ta kriimustab.', 'Ma tean, [et] koerad nuusutavad hästi.', 'Mul on kass [ja] koer.', 'Ma harjutan esitlust, [sest] tahan rääkida selgelt.', 'Jalgpall on lõbus, [aga] trenn on raske.',
      ], { bank: 'sest, aga, et, ja' }),
      ex('which', 'choice', 'Vali sidesõna.', 'Mis sõna sobib kahe lauseosa vahele?', [
        ['Ma joonistan pildi … kirjutan pealkirja.', 'ja', 'sest', 'et'],
        ['Plakat on ilus, … sellel on vähe fakte.', 'aga', 'ja', 'et'],
        ['Ma valisin teemaks kassi, … mul on kodus kass.', 'sest', 'aga', 'et'],
        ['Õpetaja ütles, … esitlus oli hea.', 'et', 'aga', 'sest'],
      ]),
      ex('join', 'transformation', 'Liida kaks lauset üheks.', 'Kasuta sulgudes olevat sõna. Ära unusta koma.', [
        ['Mul on koer. Mul on kass. (ja)', 'Mul on …', 'Mul on koer ja kass.|Mul on koer ja mul on kass.'],
        ['Koer on suur. Ta on sõbralik. (aga)', 'Koer on suur, …', 'Koer on suur, aga ta on sõbralik.|Koer on suur, aga sõbralik.'],
        ['Mulle meeldib ujuda. Vesi on soe. (sest)', 'Mulle meeldib ujuda, …', 'Mulle meeldib ujuda, sest vesi on soe.'],
        ['Ma tean seda. Kassid magavad palju. (et)', 'Ma tean, …', 'Ma tean, et kassid magavad palju.'],
      ]),
      ex('fix', 'errorfix', 'Leia ja paranda viga.', 'Igas lauses on vale sidesõna. Kirjuta lause õigesti.', [
        ['Mulle meeldib koer, aga ta on sõbralik.', 'Mulle meeldib koer, sest ta on sõbralik.'], ['Mul on kass sest koer.', 'Mul on kass ja koer.'], ['Ma tean, sest koerad kuulevad hästi.', 'Ma tean, et koerad kuulevad hästi.'],
      ]),
      ex('sort', 'categorize', 'Mis sobib plakatile?', 'Kirjuta iga asi õigesse rühma.', [
        ['Sobib plakatile', ['suur pealkiri', 'pildid', 'huvitavad faktid', 'lühikesed laused']], ['Ei sobi plakatile', ['väga pikk tekst', 'väga väike kiri']],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Kirjuta suurelt pealkiri.', 'Lisa plakatile pildid.', 'Räägi selgelt ja vaata kuulajaid.', 'Pontu on väike, aga väga kiire.',
      ]),
    ],
    model: ['Plakat: minu kass Muri', 'Minu kass Muri on kolmeaastane. Kassid magavad palju, umbes 12–16 tundi päevas. Kass näeb pimedas paremini kui inimene. Kassid on puhtad, sest nad pesevad end ise. Muri on armas, aga vahel ta kriimustab. Ma tean, et kassid armastavad soojust.'],
    starters: ['Pealkiri: …', 'Minu lemmik… on …', '… on …, sest …', '… on …, aga …', 'Ma tean, et …', 'Huvitav fakt: …'],
    plan: ['Mis on sinu teema?', 'Mis on pealkiri?', 'Kirjuta viis fakti märksõnadega.', 'Mis pildid sa lisad?'],
    talk: ['Ütle teema ja pealkiri.', 'Räägi viis fakti.', 'Kasuta sõnu sest ja aga.', 'Lõpus küsi kuulajatelt üks küsimus.'],
    self: ['Ma oskan kasutada sõnu ja, aga, sest, et.', 'Ma tean: enne sõnu aga, sest, et on koma.', 'Minu plakati tekst ja pealkiri on valmis.'],
  },

  // ---------- 12 Esitlus vanematele — kordamine ----------
  {
    warm: ['Mis teema meeldis sulle kursusel kõige rohkem?', 'Mida sa nüüd eesti keeles oskad?', 'Kes tuleb sinu esitlust kuulama?'],
    vocab: [
      'esitlus – esitlused — выступление', 'küsimus – küsimused — вопрос', 'vastus – vastused — ответ', 'publik — зрители',
      'aplaus — аплодисменты', 'tubli — молодец', 'õppima – ma õppisin — учиться (я учился)', 'oskama – ma oskan — уметь (я умею)',
      'tänama – ma tänan — благодарить', 'tunnistus – tunnistused — грамота',
    ],
    pictures: ['Peopäev. Ühenda sõna ja pilt.', [['täht', 'star'], ['süda', 'heart'], ['raamat', 'book'], ['vihik', 'notebook'], ['õhupallid', 'balloons']]],
    reading: ['Mida me õppisime?', [
      'Kolme kuu jooksul õppisime pühapäeviti palju. Esimeses tunnis rääkisime oma koolist ja õpetajast. Lugesime lugusid koolist, sõpradest, loomadest ja jõuludest. Kirjutasime oma kodust, hobidest ja lemmikaastaajast. Õppisime küsima kes, mis, kus, millal ja mitu. Nüüd oskame rääkida ka sellest, mis juhtus eile.',
      'Iga pühapäev kordasime vanu sõnu ja õppisime uusi. Kõige raskem oli mõnikord leida õiget sõnavormi, aga me harjutasime palju. Kõige lõbusamad olid mängud ja jutud loomadest. Viimastes tundides tegi iga laps plakati oma lemmikloomast või hobist. Mõni laps rääkis koerast, mõni jalgpallist.',
      'Täna esitleme oma projekte vanematele. Kõigepealt räägib igaüks oma plakatist umbes ühe minuti. Siis küsivad vanemad küsimusi ja me vastame. Me räägime selgelt ja vaatame publikut. Pärast esitlust on aplaus. Lõpus saab iga laps tunnistuse. Oleme oma töö üle uhked! Täna on meie viimane tund. Pärast tunnistuste saamist sööme koos kooki ja ütleme õpetajale aitäh.',
    ], [
      ['Kui kaua lapsed õppisid?', 'kolm|3'],
      ['Mida oli mõnikord raske leida?', 'vormi'],
      ['Mida lapsed täna teevad?', 'esitle|projekt'],
      ['Kes küsivad küsimusi?', 'vanemad'],
      ['Mida saab iga laps lõpus?', 'tunnistus'],
    ]],
    truefalse: [
      ['Lapsed õppisid ühe nädala.', false],
      ['Lapsed lugesid lugusid loomadest.', true],
      ['Esitluse ajal vaatavad lapsed põrandat.', false],
      ['Pärast esitlust on aplaus.', true],
      ['Ainult parim laps saab tunnistuse.', false],
    ],
    choice: [
      ['Mida oskavad lapsed nüüd küsida?', 'kes, mis, kus, millal ja mitu', 'ainult kes', 'mitte midagi'],
      ['Kuidas lapsed räägivad?', 'selgelt', 'kiiresti ja vaikselt', 'vene keeles'],
      ['Mis oli kõige lõbusam?', 'mängud ja jutud loomadest', 'sõnavormid', 'kodutööd'],
      ['Kuidas lapsed end tunnevad?', 'uhkelt', 'kurvalt', 'vihaselt'],
    ],
    rule: [
      '**Küsisõnad:** kes? mis? kus? millal? mitu? — **Kus** on sinu kool?',
      '**Lihtminevik:** ma õppisin, me lugesime, me kirjutasime — **Eile ma lugesin** raamatut.',
      '**Sidesõnad:** ja, aga, sest, et — Mulle meeldib kool, **sest** seal on sõbrad.',
      'Esitluse lõpus ütle: **Aitäh, et kuulasite!**',
    ],
    ru: 'Повторяем: вопросительные слова, прошедшее время (-sin, -sime) и союзы ja, aga, sest, et.',
    use: ex('use', 'categorize', 'Mis sõna see on?', 'Kirjuta iga sõna õigesse rühma.', [
      ['Küsisõna', ['kes', 'millal', 'mitu']], ['Lihtminevik', ['õppisime', 'lugesime', 'kirjutasime']], ['Sidesõna', ['aga', 'sest', 'et']],
    ], { goal: 'g_notice' }),
    review: ['Mida lapsed kursusel õppisid?', 'Mida saab iga laps lõpus?', 'Mis on sinu plakati pealkiri? (11. tund)'],
    practice: [
      ex('match', 'match', 'Ühenda küsimus ja vastus.', 'Loe küsimust. Leia sobiv vastus.', [
        ['Kes on sinu parim sõber?', 'Minu parim sõber on Tom.'], ['Kus sa elad?', 'Ma elan Tallinnas.'], ['Millal sa ärkad?', 'Ma ärkan kell seitse.'], ['Mitu tuba teie kodus on?', 'Meie kodus on kolm tuba.'], ['Mis on sinu lemmikaine?', 'Minu lemmikaine on matemaatika.'],
      ], { goal: 'g_notice' }),
      ex('gaps', 'gaps', 'Kirjuta lünka sobiv sõna.', 'Vali sõna kastist. Iga sõna sobib üks kord.', [
        '[Kes] on sinu sõber?', 'Eile ma [lugesin] raamatut.', 'Mulle meeldib kool, [sest] seal on sõbrad.', 'Ma [oskan] nüüd rohkem eesti keelt.', '[Kus] on sinu kool?', 'Talvel me [kelgutasime] mäel.',
      ], { bank: 'kes, lugesin, sest, oskan, kus, kelgutasime' }),
      ex('which', 'choice', 'Kordame: vali õige sõna.', 'Iga lause kordab üht varasemat tundi.', [
        ['Eile me … jõululaule.', 'laulsime', 'laulame', 'laulma'],
        ['… sa elad? — Tallinnas.', 'Kus', 'Kes', 'Millal'],
        ['Ma ei läinud õue, … sadas vihma.', 'sest', 'aga', 'et'],
        ['Mulle meeldib …', 'lugeda', 'loen', 'lugema'],
        ['Hommikul ma söön …', 'putru', 'puder', 'pudru'],
      ]),
      ex('past', 'transformation', 'Kirjuta lihtminevikus.', 'Muuda tegusõna minevikku.', [
        ['Ma õpin uusi sõnu.', 'Eile …', 'Eile ma õppisin uusi sõnu.|Eile õppisin ma uusi sõnu.|Eile õppisin uusi sõnu.'],
        ['Me loeme lugusid.', 'Eile …', 'Eile me lugesime lugusid.|Eile lugesime me lugusid.|Eile lugesime lugusid.'],
        ['Me kirjutame plakati.', 'Eile …', 'Eile me kirjutasime plakati.|Eile kirjutasime me plakati.|Eile kirjutasime plakati.'],
        ['Ma räägin selgelt.', 'Eile …', 'Eile ma rääkisin selgelt.|Eile rääkisin ma selgelt.|Eile rääkisin selgelt.'],
      ]),
      ex('fix', 'errorfix', 'Leia ja paranda viga.', 'Igas lauses on üks viga. Need on vead, mida me kursusel harjutasime.', [
        ['Ma lähen koolis.', 'Ma lähen kooli.|Ma lähen koolisse.'], ['Ma söön leib.', 'Ma söön leiba.'], ['Mul on kaks sõber.', 'Mul on kaks sõpra.'], ['Mulle meeldib ujuma.', 'Mulle meeldib ujuda.'], ['Karu on suur kui orav.', 'Karu on suurem kui orav.'],
      ]),
      ex('order', 'wordorder', 'Pane sõnad järjekorda.', 'Kirjuta lause õiges järjekorras.', [
        'Täna esitlen oma projekti.', 'Ma õppisin palju uusi sõnu.', 'Aitäh, et kuulasite!', 'Mulle meeldis kursus väga.',
      ]),
      ex('search', 'wordsearch', 'Leia kursuse sõnad.', 'Leia ruudustikust kõik kaheksa sõna.', ['kool', 'sõber', 'hobi', 'mets', 'jõulud', 'ilm', 'kodu', 'raamat']),
    ],
    model: ['Mida ma õppisin', 'Ma käisin pühapäeviti eesti keele tunnis. Me lugesime palju lugusid. Kõige rohkem meeldis mulle lugu siilist ja õunast. Nüüd oskan ma rääkida oma koolist ja perest. Raske oli kirjutada pikki lugusid, aga nüüd oskan seda paremini. Ma tahan veel õppida, sest eesti keel on huvitav.'],
    starters: ['Kursusel ma õppisin …', 'Kõige rohkem meeldis mulle …, sest …', 'Nüüd ma oskan …', 'Raske oli …, aga …', 'Ma tahan veel õppida …'],
    plan: ['Mida sa õppisid?', 'Mis meeldis sulle kõige rohkem?', 'Mis oli raske?', 'Mida tahad veel õppida?'],
    talk: ['Tere! Minu nimi on … Minu projekt on …', 'Räägi viis fakti oma teemast.', 'Küsi: Kas teil on küsimusi?', 'Vasta ühele küsimusele.', 'Lõpus ütle: Aitäh, et kuulasite!'],
    self: ['Ma oskan esitleda oma projekti umbes ühe minuti.', 'Ma oskan vastata vanemate küsimustele.', 'Ma oskan kasutada küsisõnu, lihtminevikku ja sidesõnu.'],
  },
];
