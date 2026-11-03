// The topic map of the B1 and B2 courses (docs/COURSE_DESIGN_COMMUNICATIVE.md §13, owner 2026-11-02: „учебник слишком
// углубляется в одну конкретную ситуацию … должен охватывать темы экзамена и использование языка шире”).
// Every module has one main topic and 1–3 secondary topics from the Harno exam list (harno.ee/eesti-keele-tasemeeksamid,
// the same 15 topics at B1 and B2); the B1 course also covers the B1 handbook's wider topics (media and current events,
// society incl. politics and law, culture, history, economy and work — docs/METHODOLOGY_STANDARD.md §6.2).
// `theme` is the broader theme the module's topic opener and its non-cast texts open (the cast may stay as a thread).
// academicValue.js `topicMapProblems` checks that every topic is a main or secondary topic of at least one module.

export const HARNO_TOPICS = Object.freeze({
  isikuandmed: 'isikuandmed',
  kodu: 'maja ja kodu',
  ymbruskond: 'ümbruskond',
  igapaevaelu: 'igapäevaelu',
  haridus: 'haridus',
  keel: 'keel',
  vabaaeg: 'vaba aeg ja meelelahutus',
  suhted: 'suhted',
  tervis: 'tervis',
  sisseostud: 'sisseostud',
  toit: 'söök ja jook',
  teenused: 'teenused',
  reisimine: 'reisimine',
  kohad: 'kohad',
  ilm: 'ilm',
});

// the B1 handbook's wider topics (METHODOLOGY_STANDARD §6.2); used by both courses, required at B1
export const WIDER_TOPICS = Object.freeze({
  meedia: 'meedia ja uudised',
  yhiskond: 'ühiskond (riik, poliitika, õigus)',
  kultuur: 'kultuur',
  ajalugu: 'ajalugu',
  majandus: 'töö ja majandus',
});

// the six topic areas of the English state exam (Harno, inglise keele riigieksami eristuskiri 2026/27; docs/
// COURSE_FINAL_SHAPE_EN_B2.md §3.1, §5): the English B2 course (enb2) has each as a main topic at least once
export const EN_STATE_TOPICS = Object.freeze({
  en_society: 'inimene ja ühiskond',
  en_environment: 'inimene ja keskkond',
  en_world: 'Eesti ja maailm',
  en_culture: 'kultuur ja looming',
  en_work: 'haridus ja töö',
  en_science: 'teadus ja tehnoloogia',
});

export const REQUIRED_TOPICS = Object.freeze({
  b1: [...Object.keys(HARNO_TOPICS), 'meedia', 'yhiskond', 'kultuur', 'ajalugu'],
  b2: [...Object.keys(HARNO_TOPICS)],
  enb2: [...Object.keys(EN_STATE_TOPICS)],
});

const m = (main, secondary, theme) => ({ main, secondary, theme });

export const TOPIC_MAP = Object.freeze({
  b1: {
    'a2b1-module-01': m('igapaevaelu', ['isikuandmed', 'keel'], 'Päev Eestis: tööaeg, ajakasutus ja keeleõpe täiskasvanuna'),
    'a2b1-module-02': m('suhted', ['isikuandmed'], 'Pered Eestis: perekonnatüübid, nimed ja nimepäevad, põlvkonnad'),
    'a2b1-module-03': m('kodu', ['ymbruskond', 'kohad'], 'Kuidas Eestis elatakse: korter või maja, paneelmaja, linnaosad'),
    'a2b1-module-04': m('vabaaeg', ['igapaevaelu'], 'Aeg ja vaba aeg: huviringid, sport, rahvakalendri tähtpäevad'),
    'a2b1-module-05': m('kultuur', ['vabaaeg', 'ajalugu'], 'Kultuur ja meelelahutus: laulupidu, muuseumid, raamatud ja filmid'),
    'a2b1-module-06': m('toit', ['teenused'], 'Eesti toidukultuur: rukkileib, kama, hooajatoit, söömine väljas'),
    'a2b1-module-07': m('tervis', ['teenused'], 'Tervis Eestis: perearst, haigekassa, liikumine ja uni'),
    'a2b1-module-08': m('haridus', ['keel'], 'Eesti koolisüsteem ja elukestev õpe'),
    'a2b1-module-09': m('majandus', ['igapaevaelu', 'haridus'], 'Töö ja tööturg: ametid, palgad, töötukassa'),
    'a2b1-module-10': m('reisimine', ['kohad'], 'Reisimine Eestis ja Euroopas: ühistransport, saared, rahvuspargid'),
    'a2b1-module-11': m('sisseostud', ['teenused', 'majandus'], 'Raha ja tarbimine: hinnad, tarbija õigused, e-pood'),
    'a2b1-module-12': m('ilm', ['ymbruskond', 'kohad'], 'Eesti ilm ja loodus: aastaajad, rabad, kliima muutumine'),
    'a2b1-module-13': m('keel', ['suhted', 'ymbruskond'], 'Keel ja suhtlemine: keeled Eestis, viisakus, naabrisuhted'),
    'a2b1-module-14': m('ajalugu', ['kultuur', 'suhted'], 'Ajalugu elulugude kaudu: 20. sajandi Eesti, laulev revolutsioon, perelood'),
    'a2b1-module-15': m('yhiskond', ['haridus', 'majandus'], 'Tulevik ja ühiskond: e-riik, valimised, töö tulevik'),
    'a2b1-module-16': m('meedia', ['yhiskond', 'suhted'], 'Meedia ja uudised: kust saame infot, sotsiaalmeedia, lapsed ja ekraanid'),
    'a2b1-module-17': m('teenused', ['ymbruskond', 'isikuandmed'], 'Asjaajamine: teated, blanketid, eesti.ee ja avalikud teenused'),
    'a2b1-module-18': m('kultuur', ['vabaaeg', 'suhted'], 'Pühad ja tähtpäevad: kuidas Eestis tähistatakse'),
  },
  b2: {
    'b1b2-module-01': m('igapaevaelu', ['isikuandmed', 'keel'], 'Elurütm ja ajakasutus: mida näitavad uuringud'),
    'b1b2-module-02': m('teenused', ['kohad', 'ymbruskond'], 'Linn ja teenused: digiriik, linnaruum, asjaajamine'),
    'b1b2-module-03': m('toit', ['kultuur', 'ajalugu'], 'Toit ja toidukultuur: kuidas eestlaste toidulaud on muutunud'),
    'b1b2-module-04': m('kodu', ['ymbruskond'], 'Eluase: üürida või osta, renoveerimine, elamine maal ja linnas'),
    'b1b2-module-05': m('keel', ['yhiskond'], 'Keel ja identiteet: eesti keele tulevik, mitmekeelsus, keelepoliitika'),
    'b1b2-module-06': m('majandus', ['suhted', 'igapaevaelu'], 'Tööelu muutumine: kaugtöö, töö ja pere, tööturg'),
    'b1b2-module-07': m('haridus', ['keel'], 'Haridus: koolireformid, elukestev õpe, tehisintellekt koolis'),
    'b1b2-module-08': m('reisimine', ['kultuur', 'kohad'], 'Reisimine ja kultuurierinevused: turism, ületurism, kultuurišokk'),
    'b1b2-module-09': m('tervis', ['toit'], 'Tervis ja eluviis: toitumine, liikumine, vaimne tervis'),
    'b1b2-module-10': m('suhted', ['isikuandmed'], 'Suhted ja pere: põlvkonnad, üksindus, konfliktid'),
    'b1b2-module-11': m('sisseostud', ['majandus', 'teenused'], 'Raha ja tarbimine: säästmine, laenud, reklaam'),
    'b1b2-module-12': m('meedia', ['vabaaeg', 'yhiskond'], 'Tehnoloogia ja sotsiaalmeedia: tehisintellekt, ekraaniaeg, privaatsus'),
    'b1b2-module-13': m('ilm', ['ymbruskond', 'kohad'], 'Kliima, ilm ja keskkond: äärmuslik ilm, mets, energia'),
    'b1b2-module-14': m('yhiskond', ['teenused', 'ymbruskond'], 'Ühiskond: kohalik omavalitsus, kodanikuühiskond, osalemine'),
    'b1b2-module-15': m('meedia', ['yhiskond', 'keel'], 'Meedia ja kriitiline lugemine: valeinfo, ajakirjandus, allikad'),
    'b1b2-module-16': m('vabaaeg', ['kultuur'], 'Vaba aeg ja kultuurielu: festivalid, sport, lugemine, hobid'),
    'b1b2-module-17': m('kohad', ['ymbruskond', 'yhiskond'], 'Eesti piirkonnad: maa ja linn, Ida-Virumaa, saared, regionaalareng'),
    'b1b2-module-18': m('kultuur', ['ajalugu', 'isikuandmed'], 'Eesti lugu ja identiteet: ajalugu, traditsioonid, mina Eestis'),
  },
  // English B2 (docs/COURSE_FINAL_SHAPE_EN_B2.md §5): the state exam's topic areas, module by module
  enb2: {
    'en-b2-module-01': m('en_society', ['en_culture'], 'Identity and generations: generation labels, 1992 and the kroon, life stories, leaving home'),
  },
});

export const topicName = (key) => HARNO_TOPICS[key] || WIDER_TOPICS[key] || EN_STATE_TOPICS[key] || key;
