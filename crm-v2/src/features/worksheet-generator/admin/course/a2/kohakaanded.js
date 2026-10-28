// A2 course (A1 → A2), supplement „Kus? Kuhu? Kust? — kontroll” (owner 2026-10-26, for a weak 6th-grade learner): a short
// diagnostic check of the place cases, given now as a baseline and again in a month. Not a module of the roadmap.
// Two parallel versions with the same structure: a2-k01 (A, the baseline) and a2-k02 (B, the re-test a month later).
// Each version is one Harjuta sheet, about 10 minutes, every item closed and scored by the player:
//   task 1  küsisõna     8 items  choice Kus? / Kuhu? / Kust? for a question with its short answer   goal g_kus
//   task 2  sise / välis 8 items  choice of the inner or the outer form in the same direction         goal g_koht
//   task 3  õige lõpp    8 items  typed form of a given word, the question (kus? kuhu? kust?) given    goal g_lopp
// The three goals are the three sub-skills: the player's result „Tulemus tunni eesmärkide kaupa” shows N / 8 for each
// (engine/registry.js scoreDocument perGoal), so A and B are compared per sub-skill. Item plan (same in A and B):
//   task 1: Kus 3, Kuhu 3, Kust 2; answers mix inner, outer and the notebook words (kodus, peal, sisse, seest, juurde)
//   task 2: inner 4 / outer 4; Kus 3, Kuhu 3, Kust 2; the wrong option is the other type in the same direction
//   task 3: Kuhu 4 (koju + short illatives), Kust 2 (one outer, one inner), Kus 2 (one inner, one outer)
// Task 2 has two options: chance is 4 / 8, so 6 / 8 or more counts as known (docs/PROJECT_STATE.md entry).
// The short illative is expected; the long form (koolisse, poesse, toasse …) is correct Estonian and accepted, „koju”
// has no long form here. Forms checked with Vabamorf (EstNLTK synthesize, sg ill / adt / in / el / all / ad / abl).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-kohakaanded-01', course: 'a2', title: 'Kus? Kuhu? Kust? (kontroll)', level: 'A2', design: 'v2', template: 'v4', supplement: true };

const INTRO = 'Umbes 10 minutit. Tee üksi, ilma vihikuta. Kolm ülesannet, igas 8 lauset: 24 punkti.';

export const LESSONS = {
  'a2-k01': {
    title: 'Kus? Kuhu? Kust? — kontroll A',
    canDo: 'Ma valin õige küsisõna (kus? kuhu? kust?) ja kirjutan kohasõna õige lõpuga: kodus, koju, kodust, kooli, poest, tööl.',
    // a diagnostic check: one short Harjuta sheet (~10 min), closed scored tasks (registry.js → meta.diagnostic + shortSheet)
    diagnostic: true,
    practice: [
      B.text('k01_p_intro', 'Kontroll A', INTRO),
      B.choice('k01_p_q', 'Kus? Kuhu? Kust?', 'Loe küsimust ja vastust. Vali õige küsisõna.', [
        ['„… sa praegu oled?” — „Kodus.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… sa pärast kooli lähed?” — „Trenni.”', 'Kuhu', 'Kus', 'Kust'],
        ['„… sa tuled?” — „Raamatukogust.”', 'Kust', 'Kus', 'Kuhu'],
        ['„… mu kott on?” — „Tooli peal.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… Mark jalgpalli mängib?” — „Staadionil.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… ema tuleb?” — „Turult.”', 'Kust', 'Kus', 'Kuhu'],
        ['„… me homme läheme?” — „Kinno.”', 'Kuhu', 'Kus', 'Kust'],
        ['„… sa õhtul sõidad?” — „Vanaema juurde.”', 'Kuhu', 'Kus', 'Kust'],
      ], 'full', 'g_kus'),
      B.choice('k01_p_io', 'Sees või peal?', 'Vali õige vorm.', [
        ['Isa ei ole kodus, ta on praegu …', 'tööl', 'töös'],
        ['Minu pall on …', 'kapis', 'kapil'],
        ['Pärast tundi läheme poistega …', 'staadionile', 'staadionisse'],
        ['Pane piim …!', 'külmkappi', 'külmkapile'],
        ['Mark tuli just …', 'poest', 'poelt'],
        ['Võta see raamat …', 'riiulilt', 'riiulist'],
        ['Laupäeval sõidame bussiga …', 'linna', 'linnale'],
        ['Lapsed mängivad korvpalli …', 'väljakul', 'väljakus'],
      ], 'full', 'g_koht'),
      B.gaps('k01_p_end', 'Kirjuta õige vorm.', 'Sõna ja küsimus on sulgudes. Kirjuta sõna lünka õige lõpuga.', [
        'Pärast trenni lähen kohe [koju] (kodu — kuhu?).',
        'Hommikul kell kaheksa lähen [kooli|koolisse] (kool — kuhu?).',
        'Mul on kõht tühi, ma lähen [poodi|poesse] (pood — kuhu?).',
        'Väljas on külm, tule [tuppa|toasse] (tuba — kuhu?)!',
        'Ema tuleb kell kuus [töölt] (töö — kust?).',
        'Ma läksin täna [kodust] (kodu — kust?) vara välja.',
        'Mu õde on praegu [klassis] (klass — kus?).',
        'Kass magab [diivanil] (diivan — kus?).',
      ], '', 'full', 'g_lopp'),
    ],
  },

  'a2-k02': {
    title: 'Kus? Kuhu? Kust? — kontroll B',
    canDo: 'Ma valin õige küsisõna (kus? kuhu? kust?) ja kirjutan kohasõna õige lõpuga: kodus, koju, kodust, parki, köögis, tööl.',
    // the parallel version for the re-test a month after a2-k01: same structure, other sentences
    diagnostic: true,
    practice: [
      B.text('k02_p_intro', 'Kontroll B', INTRO),
      B.choice('k02_p_q', 'Kus? Kuhu? Kust?', 'Loe küsimust ja vastust. Vali õige küsisõna.', [
        ['„… sa praegu oled?” — „Trennis.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… sa laupäeval lähed?” — „Randa.”', 'Kuhu', 'Kus', 'Kust'],
        ['„… sa nii hilja tuled?” — „Sõbra juurest.”', 'Kust', 'Kus', 'Kuhu'],
        ['„… mu telefon on?” — „Diivani peal.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… Liisa praegu on?” — „Poes.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… sa selle palli võtsid?” — „Kapi seest.”', 'Kust', 'Kus', 'Kuhu'],
        ['„… me pärast tunde läheme?” — „Staadionile.”', 'Kuhu', 'Kus', 'Kust'],
        ['„… sa mu kõrvaklapid panid?” — „Koti sisse.”', 'Kuhu', 'Kus', 'Kust'],
      ], 'full', 'g_kus'),
      B.choice('k02_p_io', 'Sees või peal?', 'Vali õige vorm.', [
        ['Õpetaja ei ole klassis, ta on praegu …', 'koosolekul', 'koosolekus'],
        ['Minu telefon on …', 'kotis', 'kotil'],
        ['Laupäeval läheme emaga …', 'turule', 'turgu'],
        ['Pane jope …!', 'kappi', 'kapile'],
        ['Liisa tuli just …', 'kinost', 'kinolt'],
        ['Võta oma telefon …', 'laualt', 'lauast'],
        ['Pärast tunde läheme … ujuma.', 'basseini', 'basseinile'],
        ['Poisid mängivad jalgpalli …', 'staadionil', 'staadionis'],
      ], 'full', 'g_koht'),
      B.gaps('k02_p_end', 'Kirjuta õige vorm.', 'Sõna ja küsimus on sulgudes. Kirjuta sõna lünka õige lõpuga.', [
        'Kell viis sõidan bussiga [koju] (kodu — kuhu?).',
        'Pärast kooli läheme koeraga [parki|pargisse] (park — kuhu?).',
        'Ema kutsub: „Tule [kööki|köögisse] (köök — kuhu?), söök on valmis!”',
        'Laupäeval sõidame isaga [linna|linnasse] (linn — kuhu?).',
        'Vend tuli just [väljakult] (väljak — kust?).',
        'Ma tulin täna [koolist] (kool — kust?) hilja.',
        'Ma kuulan [bussis] (buss — kus?) muusikat.',
        'Isa on praegu [tööl] (töö — kus?).',
      ], '', 'full', 'g_lopp'),
    ],
  },
};

// the teacher's key: the sub-skill and the reason of every item (registry.js withExplanations)
const Q = (dir, why) => `küsisõna: ${dir} — ${why}`;
const IO = (kind, why) => `sees või peal: ${kind} — ${why}`;
const END = (why) => `lõpp: ${why}`;
export const EXPLAIN = {
  k01_p_q: [
    Q('kus?', 'kodus = olen kohal'), Q('kuhu?', 'lähen → trenni'), Q('kust?', 'tulen → raamatukogust'), Q('kus?', 'peal = on kohal'),
    Q('kus?', 'mängib staadionil'), Q('kust?', 'tuleb → turult'), Q('kuhu?', 'läheme → kinno'), Q('kuhu?', 'juurde = kuhu'),
  ],
  k01_p_io: [
    IO('väliskohakääne -l', 'tööl, tööle, töölt'), IO('sisekohakääne -s', 'kapi sees'), IO('väliskohakääne -le', 'staadion on lahtine koht'),
    IO('sisekohakääne', 'külmkapi sisse: külmkappi'), IO('sisekohakääne -st', 'poe seest: poest'), IO('väliskohakääne -lt', 'riiuli pealt'),
    IO('sisekohakääne', 'linna sisse: linna'), IO('väliskohakääne -l', 'väljak on lahtine koht'),
  ],
  k01_p_end: [
    END('kodu → koju (kuhu?)'), END('kool → kooli (lühike sisseütlev; ka koolisse)'), END('pood → poodi (ka poesse)'),
    END('tuba → tuppa (ka toasse)'), END('töö → töölt (kust? väliskohakääne)'), END('kodu → kodust (kust?)'),
    END('klass → klassis (kus? sisekohakääne)'), END('diivan → diivanil (kus? väliskohakääne)'),
  ],
  k02_p_q: [
    Q('kus?', 'trennis = olen kohal'), Q('kuhu?', 'lähen → randa'), Q('kust?', 'juurest = kust'), Q('kus?', 'peal = on kohal'),
    Q('kus?', 'on poes'), Q('kust?', 'seest = kust'), Q('kuhu?', 'läheme → staadionile'), Q('kuhu?', 'sisse = kuhu'),
  ],
  k02_p_io: [
    IO('väliskohakääne -l', 'koosolekul'), IO('sisekohakääne -s', 'koti sees'), IO('väliskohakääne -le', 'turg on lahtine koht'),
    IO('sisekohakääne', 'kapi sisse: kappi'), IO('sisekohakääne -st', 'kino seest: kinost'), IO('väliskohakääne -lt', 'laua pealt'),
    IO('sisekohakääne', 'basseini sisse: basseini'), IO('väliskohakääne -l', 'staadion on lahtine koht'),
  ],
  k02_p_end: [
    END('kodu → koju (kuhu?)'), END('park → parki (lühike sisseütlev; ka pargisse)'), END('köök → kööki (ka köögisse)'),
    END('linn → linna (ka linnasse)'), END('väljak → väljakult (kust? väliskohakääne)'), END('kool → koolist (kust? sisekohakääne)'),
    END('buss → bussis (kus? sisekohakääne)'), END('töö → tööl (kus? väliskohakääne)'),
  ],
};
