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
const SIBLINGS_AND_KIDS = ['õde', 'vend', 'poeg', 'tütar', 'laps', 'sõber', 'naaber', 'kolleeg'];

export const GRAMMAR_POINTS = Object.freeze({
  'olema-present': { label: 'Olema ja sagedased tegusõnad olevikus', lessons: ['a2-003'] },
  'genitive-possession': { label: 'Omastav: kelle oma?', lessons: ['a2-007'] },
  'local-cases': { label: 'Kus? Kuhu? Kust?', lessons: ['a2-017', 'a2-018', 'a2-021', 'a2-022'] },
  'partitive-object': { label: 'Osastav sihitis: söön, joon, ostan', lessons: ['a2-026', 'a2-027'] },
  'adjective-agreement': { label: 'Omadussõna ühildumine', lessons: ['a2-008', 'a2-016'] },
  'numeral-partitive': { label: 'Arvsõna + osastav: kaks venda', lessons: ['a2-027', 'a2-032'] },
});

export const PATTERNS = Object.freeze([
  // olema / present tense: the verb form agrees with the subject
  { id: 'present-elama-city', grammar: 'olema-present', text: '{s} {verb} {city}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta', 'me', 'te', 'nad'] }, verb: { lemmas: ['elama'], form: 'person', person: 's' }, city: { tags: ['city'], form: 'where' } } },
  { id: 'present-tootama-place', grammar: 'olema-present', text: '{s} {verb} {place}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta', 'me', 'te', 'nad'] }, verb: { lemmas: ['töötama'], form: 'person', person: 's' }, place: { lemmas: WORKPLACES, form: 'where' } } },
  { id: 'present-olema-profession', grammar: 'olema-present', text: '{s} {verb} {job}.', target: 'verb', contrast: PERSON_CODES,
    slots: { s: { subject: ['ma', 'sa', 'ta'] }, verb: { lemmas: ['olema'], form: 'person', person: 's' }, job: { tags: ['profession'], form: 'sg n' } } },

  // genitive: whose?
  { id: 'genitive-minu-family-thing', grammar: 'genitive-possession', text: 'See on minu {family} {thing}.', target: 'family', contrast: ['sg n', 'sg p', 'pl n'],
    slots: { family: { tags: ['family'], exclude: ['perekond', 'pere'], form: 'sg g' }, thing: { lemmas: OWNED_THINGS, form: 'sg n' } } },
  { id: 'genitive-name-family-works', grammar: 'genitive-possession', text: '{name} {family} töötab {place}.', target: 'name', contrast: ['sg n', 'sg p'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg g' }, family: { lemmas: ['õde', 'vend', 'ema', 'isa', 'tütar', 'poeg', 'abikaasa'], form: 'sg n' }, place: { lemmas: WORKPLACES, form: 'where' } } },
  { id: 'genitive-whose-thing', grammar: 'genitive-possession', text: 'Kelle {thing} see on? See on {name} {thing}.', target: 'name', contrast: ['sg n', 'sg p'],
    slots: { thing: { lemmas: OWNED_THINGS, form: 'sg n' }, name: { pos: 'name', tags: ['person'], form: 'sg g' } } },

  // local cases
  { id: 'local-is-at', grammar: 'local-cases', text: '{name} on praegu {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'where' } } },
  { id: 'local-goes-to', grammar: 'local-cases', text: '{name} läheb {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'whereTo' } } },
  { id: 'local-comes-from', grammar: 'local-cases', text: '{name} tuleb {place}.', target: 'place', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, place: { lemmas: DESTINATIONS, form: 'whereFrom' } } },
  { id: 'local-travel-city', grammar: 'local-cases', text: 'Homme sõidame {city}.', target: 'city', contrast: [...LOCAL, 'sg n'],
    slots: { city: { anyTags: ['city', 'country'], form: 'whereTo' } } },
  { id: 'local-from-country', grammar: 'local-cases', text: '{name} on pärit {country}.', target: 'country', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, country: { anyTags: ['country', 'city'], form: 'whereFrom' } } },
  { id: 'local-lives-city', grammar: 'local-cases', text: '{name} elab {city}.', target: 'city', contrast: [...LOCAL, 'sg n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, city: { anyTags: ['city', 'country'], form: 'where' } } },

  // partitive object
  { id: 'partitive-eat', grammar: 'partitive-object', text: '{s} {verb} hommikul {food}.', target: 'food', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { s: { subject: ['ma', 'ta'] }, verb: { lemmas: ['sööma'], form: 'person', person: 's' }, food: { lemmas: FOODS_TO_EAT, form: 'sg p' } } },
  { id: 'partitive-drink', grammar: 'partitive-object', text: '{name} joob õhtul {drink}.', target: 'drink', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, drink: { lemmas: DRINKS, form: 'sg p' } } },
  { id: 'partitive-buy-two', grammar: 'partitive-object', text: 'Ma ostan poest {food} ja {food2}.', target: 'food', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { food: { lemmas: FOODS_TO_BUY, form: 'sg p' }, food2: { lemmas: FOODS_TO_BUY, form: 'sg p', distinctFrom: ['food'] } } },
  { id: 'partitive-negation', grammar: 'partitive-object', text: 'Mul ei ole {thing}.', target: 'thing', contrast: ['sg n', 'sg g', 'pl n'],
    slots: { thing: { lemmas: OWNED_THINGS, form: 'sg p' } } },

  // adjective agreement
  { id: 'adjective-home', grammar: 'adjective-agreement', text: '{name} elab {adj} {home}.', target: 'adj', contrast: ['sg n', 'sg g', 'sg p'],
    slots: { name: { pos: 'name', tags: ['person'], form: 'sg n' }, adj: { lemmas: HOME_ADJECTIVES, form: 'sg in' }, home: { lemmas: ['korter', 'maja'], form: 'sg in' } } },
  { id: 'adjective-have', grammar: 'adjective-agreement', text: 'Mul on {adj} {thing}.', target: 'adj', contrast: ['sg g', 'sg p', 'sg in'],
    slots: { adj: { lemmas: THING_ADJECTIVES, form: 'sg n' }, thing: { lemmas: DESCRIBABLE_THINGS, form: 'sg n' } } },
  { id: 'adjective-want', grammar: 'adjective-agreement', text: 'Ma tahan osta {adj} {thing}.', target: 'adj', contrast: ['sg n', 'sg g'],
    slots: { adj: { lemmas: THING_ADJECTIVES, form: 'sg p' }, thing: { lemmas: DESCRIBABLE_THINGS, form: 'sg p' } } },

  // numeral + singular partitive
  { id: 'numeral-family', grammar: 'numeral-partitive', text: 'Mul on {number} {person}.', target: 'person', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'neli'] }, person: { lemmas: SIBLINGS_AND_KIDS, form: 'sg p' } } },
  { id: 'numeral-things', grammar: 'numeral-partitive', text: 'Kotis on {number} {thing}.', target: 'thing', contrast: ['sg n', 'pl n', 'pl p'],
    slots: { number: { fixed: ['kaks', 'kolm', 'viis'] }, thing: { lemmas: ['raamat', 'vihik', 'pliiats', 'õun', 'banaan', 'apelsin', 'pilet', 'kaart', 'pirukas', 'võileib'], form: 'sg p' } } },
]);
