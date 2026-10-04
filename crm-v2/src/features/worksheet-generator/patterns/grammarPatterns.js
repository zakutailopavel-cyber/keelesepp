// Sentence patterns per grammar point. A pattern is a sentence frame with typed slots; the engine fills the slots from
// the Vabamorf lexicon (../lexicon). The `target` slot is what the learner produces: its exact form is the answer, and
// the `contrast` forms of the same word are the wrong options. Word choice is restricted per slot (tags, whitelists) so
// the generated sentences stay natural; anything that cannot be inflected is dropped by the engine, never guessed.
//
// Slot spec:
//   tags / anyTags / pos / lemmas / exclude — which lexicon words may fill the slot
//   form — a Vabamorf code ('sg in', 'sg p', …) or a place form ('where' | 'whereTo' | 'whereFrom')
//   person — for verbs: take the person from the subject slot named here
//   distinctFrom — never the same word as these slots
// Subject slot: { subject: ['ma', 'sa', …] } picks a personal pronoun and fixes the person for verbs.

export const SUBJECTS = Object.freeze({
  ma: { text: 'ma', code: 'n' }, sa: { text: 'sa', code: 'd' }, ta: { text: 'ta', code: 'b' },
  me: { text: 'me', code: 'me' }, te: { text: 'te', code: 'te' }, nad: { text: 'nad', code: 'vad' },
});

const PERSON_CODES = ['n', 'd', 'b', 'me', 'te', 'vad'];
const LOCAL = ['where', 'whereTo', 'whereFrom'];
const WORKPLACES = ['kool', 'pood', 'apteek', 'haigla', 'kohvik', 'restoran', 'raamatukogu', 'kontor', 'pank', 'hotell', 'ülikool', 'muuseum', 'teater', 'turg'];
const DESTINATIONS = [...WORKPLACES, 'kino', 'park', 'postkontor', 'jaam', 'linn', 'staadion', 'saar', 'maa', 'kodu', 'töö'];
const HOME_ADJECTIVES = ['suur', 'väike', 'ilus', 'uus', 'vana', 'mugav', 'vaikne', 'hele', 'tume', 'kallis', 'odav', 'puhas'];
const THING_ADJECTIVES = ['suur', 'väike', 'ilus', 'uus', 'vana', 'kallis', 'odav', 'mugav', 'valge', 'must', 'punane', 'sinine', 'roheline', 'kollane', 'hall', 'pruun'];
// things whose colour/size/price is natural to describe
const DESCRIBABLE_THINGS = ['kott', 'telefon', 'arvuti', 'rahakott', 'vihmavari', 'jope', 'müts', 'kleit', 'särk', 'sall', 'mantel', 'auto', 'jalgratas'];
const OWNED_THINGS = ['raamat', 'kott', 'telefon', 'võti', 'arvuti', 'rahakott', 'vihmavari', 'jope', 'müts', 'kleit', 'särk', 'sall', 'mantel', 'auto', 'jalgratas', 'vihik', 'pliiats', 'pilet', 'kaart'];
const FOODS_TO_EAT = ['leib', 'sai', 'juust', 'õun', 'banaan', 'apelsin', 'kartul', 'porgand', 'tomat', 'kurk', 'liha', 'kala', 'kana', 'vorst', 'muna', 'supp', 'puder', 'salat', 'kook', 'šokolaad', 'jäätis', 'riis', 'pirukas', 'võileib'];
const FOODS_TO_BUY = [...FOODS_TO_EAT.filter((lemma) => !['supp', 'puder', 'salat', 'võileib'].includes(lemma)), 'piim', 'kohv', 'tee', 'mahl', 'suhkur', 'sool', 'või'];
const DRINKS = ['piim', 'kohv', 'tee', 'vesi', 'mahl'];
const SURFACES = ['laud', 'riiul', 'tool', 'diivan', 'voodi', 'kapp', 'aken'];
const SMALL_THINGS = ['raamat', 'vihik', 'telefon', 'võti', 'kott', 'rahakott', 'pliiats', 'ajaleht', 'kiri'];
const SIBLINGS_AND_KIDS = ['õde', 'vend', 'poeg', 'tütar', 'laps', 'sõber', 'naaber', 'kolleeg'];

// Per grammar point: lesson-independent teaching metadata, written once (not per lesson).
const point = (label, contexts, successCriteria, speakingPrompt, writingPrompt, aliases = []) => ({ label, contexts, successCriteria, speakingPrompt, writingPrompt, aliases });

export const GRAMMAR_POINTS = Object.freeze({
  'olema-present': point('Olema ja sagedased tegusõnad olevikus',
    [['gp-present-home', 'Kus inimesed elavad?'], ['gp-present-work', 'Kus inimesed töötavad?'], ['gp-present-job', 'Kes on kes? Ametid']],
    'Ma kasutan tegusõna õiget pöördevormi: ma olen, sa elad, nad töötavad.',
    'Räägi, kus sina ja sinu lähedased elavad ja töötavad. Kasuta vähemalt viit eri pöördevormi.',
    'Kirjuta 6 lauset: kes sa oled, kus sa elad ja töötad ning kus elavad ja töötavad sinu lähedased.', ['olevik', 'pöördelõpud']),
  'genitive-possession': point('Omastav: kelle oma?',
    [['gp-gen-things', 'Minu pere asjad'], ['gp-gen-family', 'Pereliikmed ja nende töö'], ['gp-gen-lost', 'Kelle asi see on?']],
    'Ma ütlen omastavaga, kellele miski kuulub: minu venna kott, Toomase õde.',
    'Kirjelda viit asja ja ütle, kelle omad need on.',
    'Kirjuta 6 lauset oma pere liikmetest ja nende asjadest. Kasuta omastavat käänet.', ['genitiiv', 'omastav']),
  'local-cases': point('Kus? Kuhu? Kust? Kohakäänded',
    [['gp-loc-where', 'Kus keegi praegu on?'], ['gp-loc-moving', 'Kuhu ja kust inimesed liiguvad?'], ['gp-loc-origin', 'Kodulinn, reisid ja päritolu']],
    'Ma vastan küsimustele Kus? Kuhu? Kust? ja valin õige kohakäände: koolis, kooli, koolist; turul, turule, turult.',
    'Räägi, kus sa tavaliselt päeval oled, kuhu sa lähed ja kust sa tuled. Kasuta kõiki kolme küsimust.',
    'Kirjuta 6–8 lauset oma tavalisest päevast linnas: kus sa käid, kuhu lähed ja kust tuled.', ['kohakäänded', 'kus kuhu kust']),
  'local-inner': point('Kus? Kuhu? Kust? Sisekohakäänded',
    [['gp-lin-where', 'Kus keegi praegu on?'], ['gp-lin-moving', 'Kuhu ja kust inimesed liiguvad?'], ['gp-lin-origin', 'Kodulinn, reisid ja päritolu']],
    'Ma kasutan sisekohakäändeid: koolis, kooli või koolisse, koolist.',
    'Räägi, millistes kohtades sa sel nädalal käid: kus sa oled, kuhu lähed ja kust tuled.',
    'Kirjuta 6 lauset oma nädala kohtadest. Kasuta vorme -s, -sse ja -st.', ['seesütlev', 'sisseütlev', 'seestütlev']),
  'surface-local': point('Peal: laual, lauale, laualt',
    [['gp-surf-where', 'Kus asi on?'], ['gp-surf-put', 'Pane asi oma kohale'], ['gp-surf-take', 'Võta asi kaasa']],
    'Ma ütlen, kus asi asub, kuhu ma selle panen ja kust ma selle võtan: laual, lauale, laualt.',
    'Kirjelda oma tuba: mis asjad on laual, riiulil ja voodil? Nimeta vähemalt kuus asja.',
    'Kirjuta sõbrale juhis, kuhu ta peab sinu toas asjad panema. Kirjuta vähemalt viis lauset.', ['alalütlev', 'alaleütlev', 'alaltütlev']),
  'partitive-object': point('Osastav sihitis: söön, joon, ostan',
    [['gp-part-meal', 'Söögid ja joogid'], ['gp-part-shop', 'Poes'], ['gp-part-have', 'Mis mul on ja mida ei ole']],
    'Ma kasutan sihitist osastavas: söön putru, joon vett, ostan leiba, mul ei ole autot.',
    'Räägi, mida sa tavaliselt hommikul sööd ja jood ning mida ostad poest.',
    'Kirjuta ostunimekiri ja 5 lauset selle kohta, mida sa ostad ja mida sul kodus ei ole.', ['partitiiv', 'osastav']),
  'adjective-agreement': point('Omadussõna ühildumine',
    [['gp-adj-home', 'Minu kodu'], ['gp-adj-things', 'Minu asjad'], ['gp-adj-shop', 'Ostud']],
    'Ma ühildan omadussõna nimisõnaga: suur korter → suures korteris, uus telefon → uut telefoni.',
    'Kirjelda oma kodu ja kolme oma asja: milline see on?',
    'Kirjuta 6 lauset oma kodust ja asjadest. Kasuta vähemalt kuut omadussõna eri vormides.', ['omadussõna', 'ühildumine']),
  'numeral-partitive': point('Arvsõna + osastav: kaks venda',
    [['gp-num-family', 'Minu pere'], ['gp-num-bag', 'Mis on kotis?'], ['gp-num-shop', 'Poes ostmine']],
    'Ma kasutan arvsõna järel ainsuse osastavat: kaks last, kolm raamatut.',
    'Räägi, mitu õde, venda või last on sinul ja sinu sõpradel ning mitu asja on sinu kotis.',
    'Kirjuta 5 lauset: mitu inimest on sinu peres ja mitu asja on sinu toas.', ['arvsõna', 'osastav']),
  imperative: point('Käskiv kõneviis: mine, tule, võta, ära …',
    [['gp-imp-way', 'Tee ja liikumine'], ['gp-imp-home', 'Palve kodus'], ['gp-imp-polite', 'Juhised mitmele inimesele']],
    'Ma annan lühikesi juhiseid ja keelde käskiva kõneviisiga: mine, tule, võta, ära maga; minge, tulge.',
    'Anna sõbrale viis lühikest juhist, kuidas sinu juurde tulla. Kasuta ka vormi „ära …”.',
    'Kirjuta naabrile sõnum viie juhisega: mida ta peab sinu kodus tegema ja mida mitte.', ['käskiv', 'imperatiiv']),
  'modal-verbs': point('Pean, võin, saan, oskan, tohin',
    [['gp-mod-must', 'Mida ma pean tegema?'], ['gp-mod-can', 'Mida ma võin ja oskan?'], ['gp-mod-rules', 'Reeglid ja keelud']],
    'Ma kasutan õiget infinitiivi: pean töötama (ma-tegevusnimi), võin / saan / oskan / tohin töötada (da-tegevusnimi).',
    'Räägi, mida sa pead sel nädalal tegema, mida sa oskad hästi teha ja mida sa ei saa teha.',
    'Kirjuta 6 lauset oma töö- või koolipäevast: mida sa pead tegema ja mida sa võid teha.', ['tegevusnimi', 'modaalverbid']),
  'infinitive-want': point('Tahan teha, hakkan tegema',
    [['gp-inf-want', 'Minu soovid'], ['gp-inf-start', 'Mida ma hakkan tegema?'], ['gp-inf-try', 'Mida ma proovin teha?']],
    'Ma ütlen, mida ma tahan teha (da-tegevusnimi) ja mida ma hakkan tegema (ma-tegevusnimi).',
    'Räägi, mida sa tahad sel aastal õppida ja mida sa hakkad varsti tegema.',
    'Kirjuta 6 lauset oma plaanidest: mida tahad teha ja mida hakkad tegema.', ['tegevusnimi', 'tahan', 'hakkan']),
  meeldima: point('Mulle meeldib …',
    [['gp-like-hobby', 'Hobid'], ['gp-like-food', 'Lemmiktoit'], ['gp-like-others', 'Kellele mis meeldib?']],
    'Ma ütlen, mis mulle ja teistele meeldib: mulle meeldib ujuda, Marile meeldib kohv.',
    'Räägi, mis sulle vabal ajal meeldib teha ja mis sulle ei meeldi.',
    'Kirjuta 6 lauset oma ja oma sõbra hobidest. Kasuta vorme mulle meeldib ja talle ei meeldi.', ['meeldima', 'alaleütlev']),
  'mul-on': point('Mul on … / Mul valutab …',
    [['gp-mul-ill', 'Haige olemine'], ['gp-mul-pain', 'Mis valutab?'], ['gp-mul-need', 'Mida on vaja?']],
    'Ma räägin enesetundest: mul on palavik, mul valutab pea, Maril on vaja ravimit.',
    'Kujuta ette, et oled arsti juures: kirjelda kolme sümptomit ja ütle, mis valutab.',
    'Kirjuta õpetajale sõnum: miks sa ei saa tundi tulla ja kuidas sa end tunned.', ['alalütlev', 'enesetunne']),
  'past-simple': point('Lihtminevik: käisin, läksin, olin',
    [['gp-past-yesterday', 'Mis ma eile tegin?'], ['gp-past-others', 'Kes kuhu läks?'], ['gp-past-not', 'Mida ma ei teinud?']],
    'Ma räägin minevikust lihtminevikus: eile käisin poes, Mari läks tööle, ma ei läinud kinno.',
    'Räägi, mida sa eile tegid: kus sa käisid, kuhu läksid ja mida sa ei teinud.',
    'Kirjuta 6–8 lauset oma eelmisest nädalavahetusest. Kasuta sõnu eile, siis ja pärast seda.', ['minevik', 'lihtminevik']),
  'future-present': point('Homme teen … (olevik tuleviku tähenduses)',
    [['gp-fut-tomorrow', 'Homme'], ['gp-fut-next', 'Järgmisel nädalal'], ['gp-fut-plan', 'Plaanid']],
    'Ma räägin tulevikust olevikuvormiga: homme töötan kodus, järgmisel nädalal sõidab Mari Tartusse.',
    'Räägi oma järgmise nädala plaanidest. Kasuta sõnu homme, ülehomme ja järgmisel nädalal.',
    'Kirjuta sõbrale sõnum oma homsetest plaanidest. Kirjuta vähemalt viis lauset.', ['tulevik', 'olevik']),
  comparison: point('Võrdlus: soojem, parem, odavam',
    [['gp-cmp-weather', 'Ilm täna ja eile'], ['gp-cmp-shop', 'Poes valimine'], ['gp-cmp-people', 'Inimeste võrdlus']],
    'Ma võrdlen keskvõrdega: täna on soojem kui eile, see jope on odavam, Mari on noorem kui tema õde.',
    'Võrdle kahte linna, kahte asja ja kahte inimest. Kasuta keskvõrret ja sõna kui.',
    'Kirjuta 6 lauset, kus võrdled oma kodulinna ja mõnda teist linna.', ['keskvõrre', 'võrdlus']),
});

export const PATTERNS = Object.freeze([
  // olema / present tense: the verb form agrees with the subject
  { id: 'present-elama-city', context: 'gp-present-home', grammar: 'olema-present', text: '{s} {verb} {city}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta', 'me', 'te', 'nad'] }, verb: { lemmas: ['elama'], form: 'person', person: 's' }, city: { tags: ['city'], form: 'where' } } },
  { id: 'present-tootama-place', context: 'gp-present-work', grammar: 'olema-present', text: '{s} {verb} {place}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta', 'me', 'te', 'nad'] }, verb: { lemmas: ['töötama'], form: 'person', person: 's' }, place: { lemmas: WORKPLACES, form: 'where' } } },
  { id: 'present-olema-profession', context: 'gp-present-job', grammar: 'olema-present', text: '{s} {verb} {job}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta'] }, verb: { lemmas: ['olema'], form: 'person', person: 's' }, job: { tags: ['profession'], form: 'sg n' } } },

  // genitive: whose?
  { id: 'genitive-minu-family-thing', context: 'gp-gen-things', grammar: 'genitive-possession', text: 'See on minu {family} {thing}.', target: 'family', contrast: ['sg n', 'sg p', 'pl n'],
    slots: { family: { tags: ['family'], exclude: ['perekond', 'pere'], form: 'sg g' }, thing: { lemmas: OWNED_THINGS, form: 'sg n' } } },
  { id: 'genitive-name-family-works', context: 'gp-gen-family', grammar: 'genitive-possession', text: '{name} {family} töötab {place}.', target: 'name', contrast: ['sg n', 'sg p'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg g' }, family: { lemmas: ['õde', 'vend', 'ema', 'isa', 'tütar', 'poeg', 'abikaasa'], form: 'sg n' }, place: { lemmas: WORKPLACES, form: 'where' } } },
  { id: 'genitive-whose-thing', context: 'gp-gen-lost', grammar: 'genitive-possession', text: 'Kelle {thing} see on? See on {name} {thing}.', target: 'name', contrast: ['sg n', 'sg p'],
    slots: { thing: { lemmas: OWNED_THINGS, form: 'sg n' }, name: { pos: 'name', tags: ['person'], form: 'sg g' } } },

  // local cases
  { id: 'local-is-at', context: 'gp-loc-where', grammar: 'local-cases', text: '{name} on praegu {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'where' } } },
  { id: 'local-goes-to', context: 'gp-loc-moving', grammar: 'local-cases', text: '{name} läheb {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'whereTo' } } },
  { id: 'local-comes-from', context: 'gp-loc-moving', grammar: 'local-cases', text: '{name} tuleb {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'whereFrom' } } },
  { id: 'local-travel-city', context: 'gp-loc-origin', grammar: 'local-cases', text: 'Homme sõidame {city}.', target: 'city', contrast: [...LOCAL, 'sg n'],
    slots: { city: { anyTags: ['city', 'country'], form: 'whereTo' } } },
  { id: 'local-from-country', context: 'gp-loc-origin', grammar: 'local-cases', text: '{name} on pärit {country}.', target: 'country', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, country: { anyTags: ['country', 'city'], form: 'whereFrom' } } },
  { id: 'local-lives-city', context: 'gp-loc-origin', grammar: 'local-cases', text: '{name} elab {city}.', target: 'city', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, city: { anyTags: ['city', 'country'], form: 'where' } } },

  // partitive object
  { id: 'partitive-eat', context: 'gp-part-meal', grammar: 'partitive-object', text: '{s} {verb} hommikul {food}.', target: 'food', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { s: { subject: ['ma', 'ta'] }, verb: { lemmas: ['sööma'], form: 'person', person: 's' }, food: { lemmas: FOODS_TO_EAT, form: 'sg p' } } },
  { id: 'partitive-drink', context: 'gp-part-meal', grammar: 'partitive-object', text: '{name} joob õhtul {drink}.', target: 'drink', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, drink: { lemmas: DRINKS, form: 'sg p' } } },
  { id: 'partitive-buy-two', context: 'gp-part-shop', grammar: 'partitive-object', text: 'Ma ostan poest {food} ja {food2}.', target: 'food', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { food: { lemmas: FOODS_TO_BUY, form: 'sg p' }, food2: { lemmas: FOODS_TO_BUY, form: 'sg p', distinctFrom: ['food'] } } },
  { id: 'partitive-negation', context: 'gp-part-have', grammar: 'partitive-object', text: 'Mul ei ole {thing}.', target: 'thing', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { thing: { lemmas: OWNED_THINGS, form: 'sg p' } } },

  // adjective agreement
  { id: 'adjective-home', context: 'gp-adj-home', grammar: 'adjective-agreement', text: '{name} elab {adj} {home}.', target: 'adj', contrast: ['sg n', 'sg g', 'sg p'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, adj: { lemmas: HOME_ADJECTIVES, form: 'sg in' }, home: { lemmas: ['korter', 'maja'], form: 'sg in' } } },
  { id: 'adjective-have', context: 'gp-adj-things', grammar: 'adjective-agreement', text: 'Mul on {adj} {thing}.', target: 'adj', contrast: ['sg g', 'sg p', 'sg in'],
    slots: { adj: { lemmas: THING_ADJECTIVES, form: 'sg n' }, thing: { lemmas: DESCRIBABLE_THINGS, form: 'sg n' } } },
  { id: 'adjective-want', context: 'gp-adj-shop', grammar: 'adjective-agreement', text: 'Ma tahan osta {adj} {thing}.', target: 'adj', contrast: ['sg n', 'sg g'],
    slots: { adj: { lemmas: THING_ADJECTIVES, form: 'sg p' }, thing: { lemmas: DESCRIBABLE_THINGS, form: 'sg p' } } },

  // numeral + singular partitive
  { id: 'numeral-family', context: 'gp-num-family', grammar: 'numeral-partitive', text: 'Mul on {number} {person}.', target: 'person', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'neli'] }, person: { lemmas: SIBLINGS_AND_KIDS, form: 'sg p' } } },
  { id: 'numeral-shop', context: 'gp-num-shop', grammar: 'numeral-partitive', text: 'Ma ostan poest {number} {food}.', target: 'food', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'neli', 'viis'] }, food: { lemmas: ['õun', 'banaan', 'apelsin', 'tomat', 'kurk', 'muna', 'pirukas', 'võileib', 'porgand'], form: 'sg p' } } },
  { id: 'numeral-things', context: 'gp-num-bag', grammar: 'numeral-partitive', text: 'Kotis on {number} {thing}.', target: 'thing', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'viis'] }, thing: { lemmas: ['raamat', 'vihik', 'pliiats', 'õun', 'banaan', 'apelsin', 'pilet', 'kaart', 'pirukas', 'võileib'], form: 'sg p' } } },

  // peal: surfaces take the outer local cases
  { id: 'surface-is-on', context: 'gp-surf-where', grammar: 'surface-local', text: '{thing} on {surface}.', target: 'surface', contrast: ['sg in', 'sg all', 'sg abl', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg ad' } } },
  { id: 'surface-put', context: 'gp-surf-put', grammar: 'surface-local', text: 'Pane palun {thing} {surface}.', target: 'surface', contrast: ['sg ad', 'sg abl', 'sg ill', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg all' } } },
  { id: 'surface-take', context: 'gp-surf-take', grammar: 'surface-local', text: 'Võta palun {thing} {surface}.', target: 'surface', contrast: ['sg ad', 'sg all', 'sg el', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg abl' } } },

  // imperative
  { id: 'imp-go-place', context: 'gp-imp-way', grammar: 'imperative', text: 'Palun {verb} {place}.', target: 'verb', contrast: ['n', 'b', 'da', 'ge'],
    slots: { verb: { lemmas: ['minema', 'tulema'], form: 'o' }, place: { lemmas: DESTINATIONS, form: 'whereTo' } } },
  { id: 'imp-take-thing', context: 'gp-imp-home', grammar: 'imperative', text: '{verb} palun {thing}.', target: 'verb', contrast: ['n', 'b', 'da', 'ge'],
    slots: { verb: { lemmas: ['võtma', 'andma'], form: 'o' }, thing: { lemmas: SMALL_THINGS, form: 'sg n' } } },
  { id: 'imp-dont', context: 'gp-imp-home', grammar: 'imperative', text: 'Ära {verb} täna kaua.', target: 'verb', contrast: ['n', 'b', 'da', 'ma'],
    slots: { verb: { lemmas: ['magama', 'töötama', 'mängima', 'jalutama'], form: 'o' } } },
  { id: 'imp-plural', context: 'gp-imp-polite', grammar: 'imperative', text: '{verb} palun homme {place}.', target: 'verb', contrast: ['o', 'te', 'da'],
    slots: { verb: { lemmas: ['minema', 'tulema'], form: 'ge' }, place: { lemmas: DESTINATIONS, form: 'whereTo' } } },

  // modal verbs + infinitives
  { id: 'mod-must', context: 'gp-mod-must', grammar: 'modal-verbs', text: 'Ma pean täna {verb}.', target: 'verb', contrast: ['da', 'n', 'b'],
    slots: { verb: { lemmas: ['töötama', 'õppima', 'koristama', 'helistama', 'lugema', 'kirjutama'], form: 'ma' } } },
  { id: 'mod-may', context: 'gp-mod-can', grammar: 'modal-verbs', text: 'Kas ma võin siin {verb}?', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['istuma', 'ootama', 'helistama', 'maksma'], form: 'da' } } },
  { id: 'mod-can-skill', context: 'gp-mod-can', grammar: 'modal-verbs', text: 'Ma oskan hästi {verb}.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['ujuma', 'laulma', 'tantsima', 'jooksma'], form: 'da' } } },
  { id: 'mod-cannot', context: 'gp-mod-must', grammar: 'modal-verbs', text: 'Ma ei saa täna {verb}, sest ma olen haige.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['tulema', 'töötama', 'jooksma', 'ujuma'], form: 'da' } } },
  { id: 'mod-not-allowed', context: 'gp-mod-rules', grammar: 'modal-verbs', text: 'Siin ei tohi {verb}.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['istuma', 'ujuma', 'jooksma', 'mängima'], form: 'da' } } },

  // want / start + infinitive
  { id: 'inf-want', context: 'gp-inf-want', grammar: 'infinitive-want', text: 'Ma tahan õhtul {verb}.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['puhkama', 'lugema', 'jalutama', 'tantsima', 'ujuma', 'laulma', 'magama'], form: 'da' } } },
  { id: 'inf-start', context: 'gp-inf-start', grammar: 'infinitive-want', text: 'Ma hakkan homme {verb}.', target: 'verb', contrast: ['da', 'n', 'b'],
    slots: { verb: { lemmas: ['õppima', 'töötama', 'jooksma', 'ujuma'], form: 'ma' } } },
  { id: 'inf-try', context: 'gp-inf-try', grammar: 'infinitive-want', text: 'Ma proovin iga päev {verb}.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['jooksma', 'lugema', 'ujuma', 'õppima', 'kirjutama'], form: 'da' } } },

  // meeldima
  { id: 'like-hobby', context: 'gp-like-hobby', grammar: 'meeldima', text: 'Mulle meeldib {verb}.', target: 'verb', contrast: ['ma', 'n', 'b'],
    slots: { verb: { lemmas: ['laulma', 'tantsima', 'ujuma', 'lugema', 'jalutama', 'mängima', 'jooksma'], form: 'da' } } },
  { id: 'like-person-food', context: 'gp-like-others', grammar: 'meeldima', text: '{name} meeldib {food}.', target: 'name', contrast: ['sg n', 'sg ad', 'sg g'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg all' }, food: { lemmas: [...FOODS_TO_EAT, ...DRINKS], form: 'sg n' } } },
  { id: 'like-not-food', context: 'gp-like-food', grammar: 'meeldima', text: 'Mulle ei meeldi {food}.', target: 'food', contrast: ['sg p', 'sg g', 'pl n'],
    slots: { food: { lemmas: [...FOODS_TO_EAT, ...DRINKS], form: 'sg n' } } },

  // mul on / mul valutab
  { id: 'mul-symptom', context: 'gp-mul-ill', grammar: 'mul-on', text: '{name} on {symptom}.', target: 'name', contrast: ['sg n', 'sg all', 'sg g'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg ad' }, symptom: { lemmas: ['palavik', 'köha', 'nohu'], form: 'sg n' } } },
  { id: 'mul-pain', context: 'gp-mul-pain', grammar: 'mul-on', text: 'Mul valutab {body}.', target: 'body', contrast: ['sg p', 'sg g', 'pl n'],
    slots: { body: { lemmas: ['pea', 'kõht', 'hammas', 'selg', 'jalg', 'käsi', 'kõrv', 'silm'], form: 'sg n' } } },
  { id: 'mul-need', context: 'gp-mul-need', grammar: 'mul-on', text: '{name} on vaja {thing}.', target: 'thing', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg ad' }, thing: { lemmas: ['ravim', 'retsept', 'arst', 'vihmavari', 'pilet', 'võti'], form: 'sg p' } } },

  // simple past
  { id: 'past-went', context: 'gp-past-yesterday', grammar: 'past-simple', text: 'Eile {verb} {place}.', target: 'verb', contrast: ['n', 's', 'nud', 'ma'],
    slots: { verb: { lemmas: ['minema', 'sõitma'], form: 'sin' }, place: { lemmas: DESTINATIONS, form: 'whereTo' } } },
  { id: 'past-was', context: 'gp-past-yesterday', grammar: 'past-simple', text: 'Eile {verb} {place}.', target: 'verb', contrast: ['n', 's', 'nud', 'ma'],
    slots: { verb: { lemmas: ['olema', 'käima', 'töötama'], form: 'sin' }, place: { lemmas: WORKPLACES, form: 'where' } } },
  { id: 'past-third', context: 'gp-past-others', grammar: 'past-simple', text: '{name} {verb} eile {city}.', target: 'verb', contrast: ['b', 'sin', 'nud'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, verb: { lemmas: ['sõitma', 'minema'], form: 's' }, city: { tags: ['city'], form: 'whereTo' } } },
  { id: 'past-we', context: 'gp-past-others', grammar: 'past-simple', text: 'Eelmisel nädalal {verb} {place}.', target: 'verb', contrast: ['me', 'sin', 's'],
    slots: { verb: { lemmas: ['käima', 'olema'], form: 'sime' }, place: { lemmas: ['kino', 'teater', 'muuseum', 'park', 'restoran', 'kohvik'], form: 'where' } } },
  { id: 'past-negative', context: 'gp-past-not', grammar: 'past-simple', text: 'Eile ma ei {verb} {place}.', target: 'verb', contrast: ['s', 'sin', 'o'],
    slots: { verb: { lemmas: ['minema', 'tulema'], form: 'nud' }, place: { lemmas: ['kool', 'pood', 'kino', 'töö', 'trenn', 'kodu'], form: 'whereTo' } } },

  // present tense about the future
  { id: 'fut-tomorrow', context: 'gp-fut-tomorrow', grammar: 'future-present', text: 'Homme {verb} {place}.', target: 'verb', contrast: ['sin', 's', 'nud'],
    slots: { verb: { lemmas: ['töötama', 'olema'], form: 'n' }, place: { lemmas: ['kodu', 'kontor', 'kool', 'linn'], form: 'where' } } },
  { id: 'fut-next-week', context: 'gp-fut-next', grammar: 'future-present', text: 'Järgmisel nädalal {verb} {name} {city}.', target: 'verb', contrast: ['s', 'nud', 'n'],
    slots: { verb: { lemmas: ['sõitma', 'minema'], form: 'b' }, name: { pos: 'name', tags: ['person'], form: 'sg n' }, city: { anyTags: ['city', 'country'], form: 'whereTo' } } },
  { id: 'fut-plan', context: 'gp-fut-plan', grammar: 'future-present', text: 'Ülehomme {verb} me {place}.', target: 'verb', contrast: ['sime', 's', 'nud'],
    slots: { verb: { lemmas: ['käima'], form: 'me' }, place: { lemmas: ['kino', 'teater', 'muuseum', 'pood', 'turg', 'park'], form: 'where' } } },

  // comparison
  { id: 'cmp-weather', context: 'gp-cmp-weather', grammar: 'comparison', text: 'Täna on {adj} kui eile.', target: 'adj', contrast: ['sg n', 'sg p'],
    slots: { adj: { lemmas: ['soe', 'külm', 'kuum'], form: 'comparative' } } },
  { id: 'cmp-shop', context: 'gp-cmp-shop', grammar: 'comparison', text: 'See {thing} on {adj} kui eelmine.', target: 'adj', contrast: ['sg n', 'sg p', 'sg g'],
    slots: { thing: { lemmas: ['jope', 'mantel', 'kleit', 'särk', 'müts', 'sall', 'kott', 'telefon', 'arvuti'], form: 'sg n' }, adj: { lemmas: ['soe', 'odav', 'kallis', 'ilus', 'mugav', 'pikk', 'lühike', 'uus', 'suur', 'väike', 'hea', 'halb'], form: 'comparative' } } },
  { id: 'cmp-people', context: 'gp-cmp-people', grammar: 'comparison', text: '{name} on {adj} kui tema {family}.', target: 'adj', contrast: ['sg n', 'sg p', 'sg g'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, adj: { lemmas: ['noor', 'vana', 'pikk', 'lühike', 'tark'], form: 'comparative' }, family: { lemmas: ['õde', 'vend'], form: 'sg n' } } },
]);

// "Sees" lessons: the same local-case frames restricted to inner-case places (koolis / kooli / koolist).
const INNER_CONTEXT = { 'gp-loc-where': 'gp-lin-where', 'gp-loc-moving': 'gp-lin-moving', 'gp-loc-origin': 'gp-lin-origin' };
export const ALL_PATTERNS = Object.freeze([
  ...PATTERNS,
  ...PATTERNS.filter((pattern) => pattern.grammar === 'local-cases').map((pattern) => ({
    ...pattern,
    id: `${pattern.id}-inner`,
    grammar: 'local-inner',
    context: INNER_CONTEXT[pattern.context],
    slots: { ...pattern.slots, [pattern.target]: { ...pattern.slots[pattern.target], locative: 'in' } },
  })),
]);
