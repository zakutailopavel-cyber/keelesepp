export const CONTENT_LIBRARY_SCHEMA = 'keelesepp.generator-content-library/1';
export const CONTENT_LIBRARY_VERSION = 2;

const vocabulary = (id, rows) => rows.map(([key, word, translation, lexicalType, focusId]) => ({
  id: `${id}-v-${key}`, word, translation, lexicalType, focusIds: [focusId],
}));

const sentences = (id, rows) => rows.map(([key, focusId, contextId, text, difficulty = 1]) => ({
  id: `${id}-s-${key}`, focusIds: [focusId], contextIds: [contextId], difficulty, text, slots: {},
}));

const prompts = (id, prefix, rows) => rows.map(([key, focusId, contextId, text]) => ({
  id: `${id}-${prefix}-${key}`, focusIds: [focusId], contextIds: [contextId], text,
}));

export const REUSABLE_CONTENT_LIBRARY = Object.freeze({
  introduction: {
    id: 'introduction',
    focus: { id: 'introduction', type: 'communication', label: 'Tutvumine ja viisakus', patterns: ['Tere! Mina olen …', 'Meeldiv tutvuda.', 'Vabandust, kuidas?'], aliases: ['tutvumine', 'viisakus'] },
    vocabulary: vocabulary('introduction', [
      ['tere', 'tere', 'здравствуйте', 'phrase', 'introduction'],
      ['tutvuda', 'tutvuma', 'знакомиться', 'verb', 'introduction'],
      ['meeldiv', 'meeldiv', 'приятно', 'adjective', 'introduction'],
      ['palun', 'palun', 'пожалуйста', 'phrase', 'introduction'],
      ['aitah', 'aitäh', 'спасибо', 'phrase', 'introduction'],
      ['vabandust', 'vabandust', 'извините', 'phrase', 'introduction'],
    ]),
    contexts: [
      { id: 'intro-course', label: 'Esimene kord keelekursusel', tags: ['introduction'], names: ['Mari', 'Daria'], times: ['09:00', '12:30', '18:00'] },
      { id: 'intro-neighbour', label: 'Kohtumine uue naabriga', tags: ['introduction'], names: ['Jaan', 'Olga'], times: ['10:15', '15:00', '19:30'] },
      { id: 'intro-work', label: 'Uue kolleegiga tutvumine', tags: ['introduction'], names: ['Katrin', 'Andrei'], times: ['08:30', '13:00', '17:15'] },
    ],
    sentences: sentences('introduction', [
      ['1', 'introduction', 'intro-course', 'Tere! Mina olen Daria.'],
      ['2', 'introduction', 'intro-course', 'Meeldiv tutvuda! Mina olen Mari.'],
      ['3', 'introduction', 'intro-neighbour', 'Vabandust, kuidas teie nimi on?'],
      ['4', 'introduction', 'intro-neighbour', 'Tere tulemast meie majja!'],
      ['5', 'introduction', 'intro-work', 'Tere! Ma olen teie uus kolleeg.'],
      ['6', 'introduction', 'intro-work', 'Palun korrake oma nime aeglasemalt.'],
    ]),
    dialogues: [{ id: 'introduction-d-1', focusIds: ['introduction'], contextIds: ['intro-course'], speakers: ['A', 'B'], lines: [
      { who: 'A', text: 'Tere! Mina olen Ksenia. Mis teie [nimi] on?' },
      { who: 'B', text: 'Tere! Mina olen Martin. Meeldiv [tutvuda].' },
      { who: 'A', text: 'Meeldiv tutvuda!' },
    ] }],
    errorPairs: [
      { id: 'introduction-e-1', focusIds: ['introduction'], wrong: 'Tere, mina nimi on Olga.', correct: 'Tere, minu nimi on Olga.' },
      { id: 'introduction-e-2', focusIds: ['introduction'], wrong: 'Meeldiv tutvustan.', correct: 'Meeldiv tutvuda.' },
    ],
    translations: [
      { id: 'introduction-t-1', focusIds: ['introduction'], sourceLang: 'ru', source: 'Извините, как вас зовут?', target: 'Vabandust, mis teie nimi on?', alternatives: [] },
      { id: 'introduction-t-2', focusIds: ['introduction'], sourceLang: 'ru', source: 'Очень приятно познакомиться.', target: 'Väga meeldiv tutvuda.', alternatives: [] },
    ],
    speakingPrompts: prompts('introduction', 'sp', [['1', 'introduction', 'intro-course', 'Tutvusta ennast õpetajale ja küsi temalt vähemalt kolm küsimust.'], ['2', 'introduction', 'intro-work', 'Alusta vestlust uue kolleegiga, palu üht vastust korrata ja lõpeta vestlus viisakalt.']]),
    writingPrompts: prompts('introduction', 'wp', [['1', 'introduction', 'intro-course', 'Kirjuta 5–6 repliigiga tutvumisvestlus kahe kursuslase vahel.']]),
    successCriteria: ['Ma tutvustan ennast, küsin vestluspartnerilt põhiinfot ja kasutan viisakusväljendeid.'],
  },
  'basic-questions': {
    id: 'basic-questions',
    focus: { id: 'basic-questions', type: 'communication', label: 'Põhiküsimused ja täpsustamine', patterns: ['Mis su nimi on?', 'Kust sa pärit oled?', 'Mis keeli sa räägid?'], aliases: ['küsimused', 'täpsustamine'] },
    vocabulary: vocabulary('basic-questions', [
      ['mis', 'mis', 'что / какой', 'pronoun', 'basic-questions'],
      ['kus', 'kus', 'где', 'adverb', 'basic-questions'],
      ['kust', 'kust', 'откуда', 'adverb', 'basic-questions'],
      ['milline', 'milline', 'какой', 'pronoun', 'basic-questions'],
      ['kuidas', 'kuidas', 'как', 'adverb', 'basic-questions'],
    ]),
    contexts: [],
    sentences: sentences('basic-questions', [
      ['1', 'basic-questions', 'intro-course', 'Mis su nimi on?'],
      ['2', 'basic-questions', 'intro-course', 'Kust sa pärit oled?'],
      ['3', 'basic-questions', 'intro-work', 'Mis keeli sa räägid?'],
      ['4', 'basic-questions', 'intro-neighbour', 'Kus sa praegu elad?'],
      ['5', 'basic-questions', 'intro-work', 'Kuidas palun? Kas te võite korrata?'],
    ]),
    dialogues: [], errorPairs: [], translations: [], speakingPrompts: [], writingPrompts: [], successCriteria: [],
  },
  'olema-present': {
    id: 'olema-present',
    focus: { id: 'olema-present', type: 'grammar', label: 'Olema olevikus ja eitus', patterns: ['ma olen / ma ei ole', 'sa oled / sa ei ole', 'ta on / ta ei ole'], aliases: ['olema', 'eitus'] },
    vocabulary: vocabulary('olema-present', [
      ['olen', 'olen', 'я являюсь', 'verb', 'olema-present'],
      ['oled', 'oled', 'ты являешься', 'verb', 'olema-present'],
      ['on', 'on', 'он / она является', 'verb', 'olema-present'],
      ['ei-ole', 'ei ole', 'не является', 'verb', 'olema-present'],
    ]),
    contexts: [
      { id: 'verbs-profile', label: 'Minu lühike profiil', tags: ['profile'], names: ['Anna', 'Mihkel'], times: ['08:00', '13:00', '18:30'] },
      { id: 'verbs-class', label: 'Keeletunnis', tags: ['study'], names: ['Irina', 'Toomas'], times: ['09:15', '14:30', '19:00'] },
      { id: 'verbs-work', label: 'Töö ja igapäev', tags: ['work'], names: ['Sergei', 'Liis'], times: ['07:45', '12:00', '17:30'] },
    ],
    sentences: sentences('olema-present', [
      ['1', 'olema-present', 'verbs-profile', 'Ma olen Anna ja ma olen kolmkümmend aastat vana.'],
      ['2', 'olema-present', 'verbs-profile', 'Ma ei ole õpetaja, ma olen õpilane.'],
      ['3', 'olema-present', 'verbs-class', 'Kas sa oled täna tunnis?'],
      ['4', 'olema-present', 'verbs-class', 'Me oleme eesti keele kursusel.'],
      ['5', 'olema-present', 'verbs-work', 'Ta on praegu tööl.'],
    ]),
    dialogues: [],
    errorPairs: [{ id: 'olema-present-e-1', focusIds: ['olema-present'], wrong: 'Mina on õpilane.', correct: 'Mina olen õpilane.' }, { id: 'olema-present-e-2', focusIds: ['olema-present'], wrong: 'Ta ei on tööl.', correct: 'Ta ei ole tööl.' }],
    translations: [{ id: 'olema-present-t-1', focusIds: ['olema-present'], sourceLang: 'ru', source: 'Я не учитель, я ученик.', target: 'Ma ei ole õpetaja, ma olen õpilane.', alternatives: [] }, { id: 'olema-present-t-2', focusIds: ['olema-present'], sourceLang: 'ru', source: 'Мы сегодня на курсе.', target: 'Me oleme täna kursusel.', alternatives: [] }],
    speakingPrompts: [], writingPrompts: [], successCriteria: [],
  },
  'present-common-verbs': {
    id: 'present-common-verbs',
    focus: { id: 'present-common-verbs', type: 'grammar', label: 'Sagedased tegusõnad olevikus', patterns: ['ma elan', 'ma töötan', 'ma õpin', 'ma räägin'], aliases: ['olevik', 'mina-vorm'] },
    vocabulary: vocabulary('present-common-verbs', [
      ['elan', 'elan', 'я живу', 'verb', 'present-common-verbs'],
      ['tootan', 'töötan', 'я работаю', 'verb', 'present-common-verbs'],
      ['opin', 'õpin', 'я учусь', 'verb', 'present-common-verbs'],
      ['raagin', 'räägin', 'я говорю', 'verb', 'present-common-verbs'],
      ['armastan', 'armastan', 'я люблю', 'verb', 'present-common-verbs'],
    ]),
    contexts: [],
    sentences: sentences('present-common-verbs', [
      ['1', 'present-common-verbs', 'verbs-profile', 'Ma elan Tallinnas ja räägin vene keelt.'],
      ['2', 'present-common-verbs', 'verbs-class', 'Ma õpin õhtul eesti keelt.'],
      ['3', 'present-common-verbs', 'verbs-work', 'Ma töötan haiglas ja elan töökoha lähedal.'],
      ['4', 'present-common-verbs', 'verbs-profile', 'Minu sõber elab Tartus ja töötab koolis.'],
      ['5', 'present-common-verbs', 'verbs-class', 'Me räägime tunnis ainult eesti keelt.'],
    ]),
    dialogues: [{ id: 'present-common-verbs-d-1', focusIds: ['present-common-verbs'], contextIds: ['verbs-class'], speakers: ['Õpetaja', 'Õpilane'], lines: [{ who: 'Õpetaja', text: 'Kus sa [elad] ja mida sa teed?' }, { who: 'Õpilane', text: 'Ma elan Tallinnas, [töötan] poes ja õpin eesti keelt.' }] }],
    errorPairs: [{ id: 'present-common-verbs-e-1', focusIds: ['present-common-verbs'], wrong: 'Ma elad Tallinnas.', correct: 'Ma elan Tallinnas.' }, { id: 'present-common-verbs-e-2', focusIds: ['present-common-verbs'], wrong: 'Ta töötan koolis.', correct: 'Ta töötab koolis.' }],
    translations: [{ id: 'present-common-verbs-t-1', focusIds: ['present-common-verbs'], sourceLang: 'ru', source: 'Я живу в Таллинне и работаю в магазине.', target: 'Ma elan Tallinnas ja töötan poes.', alternatives: [] }, { id: 'present-common-verbs-t-2', focusIds: ['present-common-verbs'], sourceLang: 'ru', source: 'Она учит эстонский язык.', target: 'Ta õpib eesti keelt.', alternatives: [] }],
    speakingPrompts: prompts('present-common-verbs', 'sp', [['1', 'present-common-verbs', 'verbs-profile', 'Räägi kuue lausega, kus sa elad, töötad või õpid ja mis keeli sa räägid.']]),
    writingPrompts: prompts('present-common-verbs', 'wp', [['1', 'present-common-verbs', 'verbs-profile', 'Kirjuta 6–8 lauset endast. Kasuta vähemalt nelja erinevat oleviku tegusõna.']]),
    successCriteria: ['Ma kasutan olema-verbi ja sagedasi oleviku tegusõnu arusaadavalt enda kohta rääkides.'],
  },
  'personal-info': {
    id: 'personal-info',
    focus: { id: 'personal-info', type: 'communication', label: 'Isikuandmed ja ankeet', patterns: ['nimi', 'aadress', 'telefon', 'e-post'], aliases: ['isikuandmed', 'ankeet'] },
    vocabulary: vocabulary('personal-info', [
      ['nimi', 'nimi', 'имя', 'noun', 'personal-info'], ['aadress', 'aadress', 'адрес', 'noun', 'personal-info'], ['telefon', 'telefoninumber', 'номер телефона', 'noun', 'personal-info'], ['epost', 'e-posti aadress', 'электронная почта', 'noun', 'personal-info'], ['kodakondsus', 'kodakondsus', 'гражданство', 'noun', 'personal-info'], ['allkiri', 'allkiri', 'подпись', 'noun', 'personal-info'],
    ]),
    contexts: [
      { id: 'form-course', label: 'Keelekursuse ankeet', tags: ['form'], names: ['Anna', 'Maksim'], times: ['09:00', '13:30', '18:00'] },
      { id: 'form-library', label: 'Raamatukogu kasutajakaart', tags: ['form'], names: ['Jelena', 'Marko'], times: ['10:00', '14:15', '17:45'] },
      { id: 'form-message', label: 'Sõnum õpetajale', tags: ['message'], names: ['Sofia', 'Andres'], times: ['08:30', '12:00', '19:00'] },
    ],
    sentences: sentences('personal-info', [
      ['1', 'personal-info', 'form-course', 'Minu nimi on Anna Petrova.'], ['2', 'personal-info', 'form-course', 'Minu telefoninumber on 5550 1234.'], ['3', 'personal-info', 'form-library', 'Minu aadress on Pargi tänav 8–12.'], ['4', 'personal-info', 'form-library', 'Minu kodakondsus on Ukraina.'], ['5', 'personal-info', 'form-message', 'Minu e-posti aadress on anna@example.ee.'], ['6', 'personal-info', 'form-message', 'Palun saatke vastus minu e-posti aadressile.'],
    ]),
    dialogues: [{ id: 'personal-info-d-1', focusIds: ['personal-info'], contextIds: ['form-course'], speakers: ['Sekretär', 'Õppija'], lines: [{ who: 'Sekretär', text: 'Palun öelge oma [nimi] ja telefoninumber.' }, { who: 'Õppija', text: 'Minu nimi on Anna Petrova ja [number] on 5550 1234.' }] }],
    errorPairs: [], translations: [],
    speakingPrompts: prompts('personal-info', 'sp', [['1', 'personal-info', 'form-course', 'Vasta õpetaja küsimustele ja anna suuliselt viis isikuandmet.']]),
    writingPrompts: prompts('personal-info', 'wp', [['1', 'personal-info', 'form-message', 'Kirjuta õpetajale 4–6 lauset: kes sa oled, kuidas sinuga ühendust saada ja millal saad tunnis osaleda.']]),
    successCriteria: ['Ma täidan lihtsa ankeedi ja annan kõik vajalikud kontaktandmed arusaadavalt.'],
  },
  'numbers-dates': {
    id: 'numbers-dates',
    focus: { id: 'numbers-dates', type: 'communication', label: 'Arvud, kuupäevad ja kontaktandmed', patterns: ['sünniaeg', 'kuupäev', 'telefoninumber'], aliases: ['arvud', 'kuupäevad'] },
    vocabulary: vocabulary('numbers-dates', [
      ['sunniaeg', 'sünniaeg', 'дата рождения', 'noun', 'numbers-dates'], ['kuupaev', 'kuupäev', 'дата', 'noun', 'numbers-dates'], ['aasta', 'aasta', 'год', 'noun', 'numbers-dates'], ['kuu', 'kuu', 'месяц', 'noun', 'numbers-dates'], ['number', 'number', 'номер', 'noun', 'numbers-dates'],
    ]),
    contexts: [],
    sentences: sentences('numbers-dates', [
      ['1', 'numbers-dates', 'form-course', 'Minu sünniaeg on 5. juuli 1988.'], ['2', 'numbers-dates', 'form-library', 'Kaart kehtib kuni 31. detsembrini.'], ['3', 'numbers-dates', 'form-message', 'Tund algab 12. oktoobril kell 18.00.'], ['4', 'numbers-dates', 'form-course', 'Palun kirjutage kuupäev numbritega.'], ['5', 'numbers-dates', 'form-library', 'Kontrollige, kas telefoninumber on õige.'],
    ]),
    dialogues: [],
    errorPairs: [{ id: 'numbers-dates-e-1', focusIds: ['numbers-dates'], wrong: 'Minu sünniaeg on viis juuli.', correct: 'Minu sünniaeg on 5. juuli.' }, { id: 'numbers-dates-e-2', focusIds: ['numbers-dates'], wrong: 'Tund on kell kaheksateist null.', correct: 'Tund on kell kaheksateist.' }],
    translations: [{ id: 'numbers-dates-t-1', focusIds: ['numbers-dates'], sourceLang: 'ru', source: 'Моя дата рождения — 5 июля 1988 года.', target: 'Minu sünniaeg on 5. juuli 1988.', alternatives: [] }, { id: 'numbers-dates-t-2', focusIds: ['numbers-dates'], sourceLang: 'ru', source: 'Урок начинается 12 октября в 18 часов.', target: 'Tund algab 12. oktoobril kell 18.', alternatives: [] }],
    speakingPrompts: [], writingPrompts: [], successCriteria: [],
  },
  'family-relations': {
    id: 'family-relations',
    focus: { id: 'family-relations', type: 'communication', label: 'Pere ja lähedased', patterns: ['See on minu …', 'Kelle …?', 'Tal on …'], aliases: ['pere', 'lähedased', 'sugulased', 'kelle'] },
    vocabulary: vocabulary('family-relations', [
      ['ema', 'ema', 'мама', 'noun', 'family-relations'],
      ['isa', 'isa', 'папа', 'noun', 'family-relations'],
      ['ode', 'õde', 'сестра', 'noun', 'family-relations'],
      ['vend', 'vend', 'брат', 'noun', 'family-relations'],
      ['abikaasa', 'abikaasa', 'супруг / супруга', 'noun', 'family-relations'],
      ['tutar', 'tütar', 'дочь', 'noun', 'family-relations'],
      ['poeg', 'poeg', 'сын', 'noun', 'family-relations'],
      ['vanemad', 'vanemad', 'родители', 'noun', 'family-relations'],
      ['lapsed', 'lapsed', 'дети', 'noun', 'family-relations'],
      ['vanaema', 'vanaema', 'бабушка', 'noun', 'family-relations'],
      ['vanaisa', 'vanaisa', 'дедушка', 'noun', 'family-relations'],
      ['sugulane', 'sugulane', 'родственник', 'noun', 'family-relations'],
    ]),
    contexts: [
      { id: 'family-tree', label: 'Perekonna sugupuu', tags: ['family', 'relations'], names: ['Mari', 'Jüri', 'Katrin', 'Martin'], times: ['10:00', '14:00', '18:00'] },
      { id: 'family-photo', label: 'Perefoto kirjeldamine', tags: ['family', 'description'], names: ['Anna', 'Maksim', 'Sofia', 'Aleksandr'], times: ['09:30', '15:15', '19:00'] },
      { id: 'family-visit', label: 'Külaskäik lähedaste juurde', tags: ['family', 'visit'], names: ['Olga', 'Viktor', 'Daria', 'Nikita'], times: ['11:00', '16:30', '20:00'] },
    ],
    sentences: sentences('family-relations', [
      ['1', 'family-relations', 'family-tree', 'See on minu ema Mari ja see on minu isa Jüri.'],
      ['2', 'family-relations', 'family-tree', 'Minu õe nimi on Katrin ja minu venna nimi on Martin.'],
      ['3', 'family-relations', 'family-tree', 'Kelle tütar on Sofia? Sofia on Anna tütar.'],
      ['4', 'family-relations', 'family-tree', 'Minu vanematel on kolm last.'],
      ['5', 'family-relations', 'family-photo', 'Fotol on minu abikaasa ja meie kaks last.'],
      ['6', 'family-relations', 'family-photo', 'Minu vanaema istub vasakul ja vanaisa seisab tema kõrval.'],
      ['7', 'family-relations', 'family-photo', 'Minu vend on kolmkümmend aastat vana ja töötab õpetajana.'],
      ['8', 'family-relations', 'family-visit', 'Laupäeval läheme lastega vanaema juurde.'],
      ['9', 'family-relations', 'family-visit', 'Minu sugulased elavad Tartus.'],
      ['10', 'family-relations', 'family-visit', 'Kas sinu õde tuleb ka külla?'],
    ]),
    dialogues: [{ id: 'family-relations-d-1', focusIds: ['family-relations'], contextIds: ['family-photo'], speakers: ['A', 'B'], lines: [
      { who: 'A', text: 'Kes on sellel fotol?' },
      { who: 'B', text: 'See on minu [õde] Sofia ja tema kõrval on meie vend Maksim.' },
      { who: 'A', text: 'Kas neil on lapsi?' },
      { who: 'B', text: 'Sofial on üks [tütar], aga Maksimil lapsi ei ole.' },
    ] }],
    errorPairs: [
      { id: 'family-relations-e-1', focusIds: ['family-relations'], wrong: 'Minu õde nimi on Sofia.', correct: 'Minu õe nimi on Sofia.' },
      { id: 'family-relations-e-2', focusIds: ['family-relations'], wrong: 'Tal on kaks laps.', correct: 'Tal on kaks last.' },
    ],
    translations: [
      { id: 'family-relations-t-1', focusIds: ['family-relations'], sourceLang: 'ru', source: 'Это моя сестра, а рядом с ней — её муж.', target: 'See on minu õde ja tema kõrval on tema abikaasa.', alternatives: [] },
      { id: 'family-relations-t-2', focusIds: ['family-relations'], sourceLang: 'ru', source: 'У моих родителей трое детей.', target: 'Minu vanematel on kolm last.', alternatives: [] },
    ],
    speakingPrompts: prompts('family-relations', 'sp', [
      ['1', 'family-relations', 'family-tree', 'Tutvusta oma peret või väljamõeldud perekonda. Nimeta vähemalt neli inimest ja lisa igaühe kohta üks detail.'],
      ['2', 'family-relations', 'family-photo', 'Kirjelda perefotot: kes on pildil, kuidas nad on omavahel seotud ja mida nad teevad.'],
    ]),
    writingPrompts: prompts('family-relations', 'wp', [
      ['1', 'family-relations', 'family-visit', 'Kirjuta 6–8 lauset oma perest või lähedastest. Kasuta vähemalt kuut peresõna ja kahte kelle-vormi.'],
    ]),
    successCriteria: ['Ma nimetan peresuhteid ja lisan vähemalt nelja inimese kohta ühe arusaadava detaili.'],
  },
});

export const LESSON_CONTENT_BLUEPRINTS = Object.freeze({
  'a2-002': { packIds: ['introduction', 'basic-questions'], title: 'Tutvumine ja viisakus', lessonKind: 'communication' },
  'a2-003': { packIds: ['olema-present', 'present-common-verbs'], title: 'Olen, elan, räägin', lessonKind: 'grammar' },
  'a2-004': { packIds: ['personal-info', 'numbers-dates'], title: 'Isikuandmed ja lihtne ankeet', lessonKind: 'writing' },
  'a2-005': { packIds: ['introduction', 'basic-questions', 'olema-present', 'present-common-verbs', 'personal-info', 'numbers-dates'], title: 'Kontroll 1 — eneseinfo', lessonKind: 'assessment' },
  'a2-006': { packIds: ['family-relations'], title: 'Pere ja lähedased', lessonKind: 'vocabulary' },
});
