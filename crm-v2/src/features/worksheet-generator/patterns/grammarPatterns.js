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
    [['gp-num-family', 'Minu pere'], ['gp-num-bag', 'Mis on kotis?']],
    'Ma kasutan arvsõna järel ainsuse osastavat: kaks last, kolm raamatut.',
    'Räägi, mitu õde, venda või last on sinul ja sinu sõpradel ning mitu asja on sinu kotis.',
    'Kirjuta 5 lauset: mitu inimest on sinu peres ja mitu asja on sinu toas.', ['arvsõna', 'osastav']),
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
  { id: 'numeral-things', context: 'gp-num-bag', grammar: 'numeral-partitive', text: 'Kotis on {number} {thing}.', target: 'thing', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'viis'] }, thing: { lemmas: ['raamat', 'vihik', 'pliiats', 'õun', 'banaan', 'apelsin', 'pilet', 'kaart', 'pirukas', 'võileib'], form: 'sg p' } } },

  // peal: surfaces take the outer local cases
  { id: 'surface-is-on', context: 'gp-surf-where', grammar: 'surface-local', text: '{thing} on {surface}.', target: 'surface', contrast: ['sg in', 'sg all', 'sg abl', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg ad' } } },
  { id: 'surface-put', context: 'gp-surf-put', grammar: 'surface-local', text: 'Pane palun {thing} {surface}.', target: 'surface', contrast: ['sg ad', 'sg abl', 'sg ill', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg all' } } },
  { id: 'surface-take', context: 'gp-surf-take', grammar: 'surface-local', text: 'Võta palun {thing} {surface}.', target: 'surface', contrast: ['sg ad', 'sg all', 'sg el', 'sg n'],
    slots: { thing: { lemmas: SMALL_THINGS, form: 'sg n' }, surface: { lemmas: SURFACES, form: 'sg abl' } } },
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
