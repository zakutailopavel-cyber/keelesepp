// Mini-course „Käänded lauses” (course key `kaanded`, owner 2026-11-28: „мини курс на тему склонений слов в предложении …
// с примерами, схемами и заданиями на закрепление”). Six lessons for Russian-speaking learners at A2–B1, teens and adults:
// how the Estonian cases work in a sentence. Not a roadmap module (MODULE.supplement): a teacher assigns it to a learner
// who needs the cases explained, in any course. Each lesson has the three sheets:
//   Avasta  — „Mäletad?” (from lesson 2), the scheme picture (line art, crm-v2/public/textbook-art/kaanded/*.svg),
//             the „Märka!” rule box with a Russian contrast line, a table / grid with the forms, a short text and a
//             noticing task on it
//   Harjuta — the form task that produces the rule box's forms (formtext, base form in brackets, no answers printed),
//             choice, transformation or error fixing, and „Abi ja lisaväljakutse” (support and stretch)
//   Kasuta  — one communicative task (pair / picture / map, with Abikaart and Lisaväljakutse), „Kirjuta oma laused”,
//             the exit check (30 s of speech or 2 own sentences + 2 quick form items), the self-check with evidence and
//             the homework
// Lesson 6 ends with a mixed control of all six lessons: four parts, 8 + 10 + 6 + 6 = 30 points, one point an item.
// Recycling: every lesson's „Mäletad?” and exit / control reuse the forms of the earlier lessons (kodus, poodi, mul on,
// sõbraga …). Every answer form was checked with Vabamorf (EstNLTK synthesize) — docs/PROJECT_STATE.md entry 2026-11-28.
// Texts are original (KeeleSepa õppetekst); no textbook or Harno material. No dictation.
import { B, teach } from '../blocks.js';
import { exitCheck, homeTask } from '../stationBlocks.js';

export const MODULE = {
  id: 'kaanded-module-01',
  course: 'kaanded',
  title: 'Käänded lauses',
  level: 'A2',
  supplement: true,
  // a mini-course lesson is about 60 minutes in three short sheets (≈ 20 min each), not three 40–55 min sheets
  shortSheets: true,
  phases: {
    discover: { label: '1 Avasta', slot: 1, subtitle: 'Vaata skeemi ja leia reegel.' },
    practice: { label: '2 Harjuta', slot: 2, subtitle: 'Harjuta vorme lauses.' },
    transfer: { label: '3 Kasuta', slot: 3, subtitle: 'Räägi ja kirjuta endast.' },
  },
};

// ---------- helpers ----------
const ART = '/textbook-art/kaanded';
const SIZES = {
  '001-kaanded': [900, 750], '002-sihitis': [900, 700], '003-sees': [900, 580], '004-peal': [900, 640],
  '005-viis': [900, 560], '006-tegusona': [900, 600], '003-tuba': [900, 600], '004-linn': [900, 600],
};
const img = (file) => ({ src: `${ART}/${file}.svg`, width: SIZES[file][0], height: SIZES[file][1], focus: { x: 50, y: 50 }, aspect: 'orig' });
// the lesson's scheme: a text block with the line-art picture full width above the text (figureFloat.js)
const scheme = (id, heading, file, alt, text) => ({
  ...B.text(id, heading, text),
  data: { heading, text, figures: [{ mode: 'float', img: img(file), caption: '', alt, side: 'center', width: 100, at: 0, shape: 'rect', border: 'none', locked: false }] },
});
// v6 §0.3: the main task's type, „Abikaart” (2–3 sentence starters) and „Lisaväljakutse” (one line)
const aid = (block, support, stretch, taskType) => {
  const data = { ...block.data, support, stretch, taskType };
  if (block.type === 'speaking') Object.assign(data, { tipTitle: 'Abikaart (kui vaja):', tipText: [...support, `Lisaväljakutse: ${stretch}`].join('\n') });
  return { ...block, data };
};
// v6 §0.8: three success criteria rated 0–1–2 and one own sentence as evidence
const selfCheck = (id, criteria, stamp) => {
  const b = B.selfcheck(id, [...criteria.map((c) => `${c} (0 – 1 – 2)`), 'Minu lause tõendiks: …'], stamp, 'Ma oskan …');
  return { ...b, data: { ...b.data, instruction: 'Hinda iga punkti: 0, 1 või 2. Kirjuta üks oma lause.', criteria, evidence: true } };
};
// support and stretch for the form practice (v6 differentiation)
const help = (id, support, stretch) => B.tip(id, 'Abi ja lisaväljakutse', [`**Abi:** ${support}`, `**Lisaväljakutse:** ${stretch}`], 'full');
// a role card shows the Abikaart and Lisaväljakutse at the end of card B
const aidCard = (block) => ({ ...block, data: { ...block.data, roleB: `${block.data.roleB}\nAbikaart (kui vaja): ${block.data.support.join(' · ')}\nLisaväljakutse: ${block.data.stretch}` } });
const homework = (id, lines) => homeTask(B.phrasebank(id, [['Kodutöö', lines]]));
const review = (id, lines) => B.review(id, lines);
// short options side by side (engine block.opts.cols)
const cols3 = (block) => ({ ...block, opts: { ...(block.opts || {}), cols: 3 } });

export const LESSONS = {
  // =====================================================================================================================
  'kaanded-001': {
    title: 'Mis on kääne ja milleks?',
    canDo: 'Ma tean, miks sõna lõpp muutub, tunnen 14 käänet ja nende küsimusi ning leian lausest käände.',
    discover: [
      teach(scheme('k1_d_scheme', 'Üks sõna, palju vorme', '001-kaanded', 'Skeem: sõna maja keskel; ümber neli kasti — kolm põhikäänet, sees (-sse, -s, -st), peal (-le, -l, -lt) ja viimased viis (-ks, -ni, -na, -ta, -ga).', [
        'Eesti keeles ei ole eessõnu nagu vene keeles «в», «из», «с». Sõna saab lõpu. Lõpp ütleb, kus, kuhu, kust, kellega või milleta.',
        'Vaata skeemi: üks sõna **maja** ja neliteist vormi. Igal vormil on oma küsimus.',
      ].join('\n\n')), 'Учитель (5 мин): покажите схему. Главная мысль урока: окончание делает работу русского предлога. Не учим 14 названий наизусть — учим вопросы (kus? kuhu? kust? kellega?). Названия падежей — для справки.'),
      B.notice('k1_d_notice', 'Märka! Lõpp teeb eessõna töö.', [
        'Iga kääne vastab ühele küsimusele: **kus?** → **majas**, **kust?** → **majast**, **kellega?** → **emaga**.',
        'Kolm põhikäänet: **nimetav** (kes? mis?), **omastav** (kelle? mille?), **osastav** (keda? mida?).',
        'Teised käänded: **omastav + lõpp**. laud → **laua** → **lauas**, **laualt**, **lauaga**. pood → **poe** → **poes**, **poest**.',
        'Sees: **-sse, -s, -st**. Peal: **-le, -l, -lt**. Viimased viis: **-ks, -ni, -na, -ta, -ga**.',
        'Vene keeles 6 падежей и предлоги: «в доме», «из дома», «с мамой». Eesti keeles 14 käänet ja lõpp: **majas**, **majast**, **emaga**. «Перед домом, под столом» = kaassõna + omastav: **maja ees**, **laua all**.',
      ], 'full'),
      teach(B.table('k1_d_table', '14 käänet: küsimus ja lõpp.', 'Kirjuta sõna laud vormid. Alus on laua.', 'Kääne, Küsimus, Lõpp, maja, laud', [
        'nimetav | kes? mis? | — | maja | laud',
        'omastav | kelle? mille? | — | maja | laua',
        'osastav | keda? mida? | -t, -d või — | maja | lauda',
        'sisseütlev | kuhu? (sisse) | -sse | majja, majasse | [lauasse]',
        'seesütlev | kus? (sees) | -s | majas | [lauas]',
        'seestütlev | kust? (seest) | -st | majast | [lauast]',
        'alaleütlev | kuhu? kellele? | -le | majale | [lauale]',
        'alalütlev | kus? kellel? | -l | majal | [laual]',
        'alaltütlev | kust? kellelt? | -lt | majalt | [laualt]',
        'saav | kelleks? milleks? | -ks | majaks | [lauaks]',
        'rajav | milleni? mis ajani? | -ni | majani | [lauani]',
        'olev | kellena? millena? | -na | majana | [lauana]',
        'ilmaütlev | kelleta? milleta? | -ta | majata | [lauata]',
        'kaasaütlev | kellega? millega? | -ga | majaga | [lauaga]',
      ], 'g_notice'), 'Учитель: первые три формы даны — их надо знать из словаря (laud, laua, lauda). Остальные 11 ученик строит сам: laua + окончание. Это главный «секрет» урока.'),
      B.reading('k1_d_text', 'Loe teksti.', 'Loe Anna päevast. Vasta lühidalt.', 'Anna esmaspäev', [
        'Esmaspäeval ärkab Anna kell seitse. Ta joob köögis kohvi ilma suhkruta. Siis sõidab ta bussiga tööle. Anna töö on kesklinnas, suures majas.',
        'Lõunal sööb ta kolleegiga sööklas. Pärast tööd läheb Anna poodi ja ostab leiba ja piima. Õhtul helistab ta emale. Ema elab Narvas ja töötab seal õpetajana. Kell kümme läheb Anna voodisse ja loeb raamatut.',
      ], [['Millega Anna tööle sõidab?', 'bussiga'], ['Kus on tema töö?', 'kesklinnas|suures majas|kesklinnas, suures majas'], ['Kellega ta lõunat sööb?', 'kolleegiga'], ['Kellele ta õhtul helistab?', 'emale']]),
      B.categorize('k1_d_find', 'Leia käänded tekstist.', 'Pane sõnad õigesse rühma.', [
        ['Kuhu?', ['tööle', 'poodi', 'voodisse']],
        ['Kus?', ['köögis', 'kesklinnas', 'sööklas']],
        ['Kellega? Millega?', ['bussiga', 'kolleegiga']],
        ['Kellena? Milleta?', ['õpetajana', 'suhkruta']],
      ], 'full', 'g_notice'),
    ],
    practice: [
      cols3(B.choice('k1_p_q', 'Mis on küsimus?', 'Vali küsimus paksu sõna kohta.', [
        ['Ma elan **Tartus**.', 'Kus?', 'Kuhu?', 'Kust?'],
        ['Me sõidame **Tartusse**.', 'Kuhu?', 'Kus?', 'Kust?'],
        ['Ta tuleb **Tartust**.', 'Kust?', 'Kus?', 'Kuhu?'],
        ['Ma räägin **sõbraga**.', 'Kellega?', 'Kellele?', 'Kelle?'],
        ['See on **sõbra** auto.', 'Kelle?', 'Kellega?', 'Keda?'],
        ['Ma ootan **sõpra**.', 'Keda?', 'Kelle?', 'Kellele?'],
        ['Ma annan **sõbrale** raamatu.', 'Kellele?', 'Kellel?', 'Kellelt?'],
        ['Ma joon teed **suhkruta**.', 'Milleta?', 'Millega?', 'Milleks?'],
      ], 'full', 'g_notice')),
      teach(B.wordforms('k1_p_forms', 'Omastav + lõpp.', 'Kirjuta vorm. Sulgudes on omastav.', [
        ['pood (poe)', 'kus? -s', 'poes'],
        ['pood (poe)', 'kust? -st', 'poest'],
        ['laud (laua)', 'kus? -l', 'laual'],
        ['sõber (sõbra)', 'kellega? -ga', 'sõbraga'],
        ['sõber (sõbra)', 'kellele? -le', 'sõbrale'],
        ['linn (linna)', 'kus? -s', 'linnas'],
        ['tuba (toa)', 'kust? -st', 'toast'],
        ['raamat (raamatu)', 'milleta? -ta', 'raamatuta'],
      ], 'full'), 'Учитель: если ученик пишет «poodis» или «tubast» — вернуть к правилу: окончание идёт к omastav (poe-, toa-), а не к nimetav.'),
      B.formtext('k1_p_text', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna õige lõpuga. Küsimus aitab.', 'Sõnum sõbrale', [
        'Tere, Mari!',
        'Ma olen praegu [Tartus] (Tartu, kus?). Hommikul sõitsin siia [bussiga] (buss, millega?). Bussis rääkisin ühe vana [naisega] (naine, kellega?). Ta tuli just [haiglast] (haigla, kust?).',
        'Nüüd istun [kohvikus] (kohvik, kus?) ja joon kohvi [suhkruta] (suhkur, milleta?). Õhtul lähen [teatrisse] (teater, kuhu?). Pühapäeval sõidan tagasi [koju] (kodu, kuhu?).',
        'Kallistan! Anna',
      ]),
      B.errorfix('k1_p_fix', 'Paranda viga.', 'Sõnal puudub lõpp. Kirjuta lause õigesti.', [
        ['Ma elan Tallinn.', 'Ma elan Tallinnas.'],
        ['Ma sõidan tööle buss.', 'Ma sõidan tööle bussiga.'],
        ['Ta tuleb kool.', 'Ta tuleb koolist.'],
        ['Ma lähen pood.', 'Ma lähen poodi.|Ma lähen poesse.'],
        ['Ma räägin ema.', 'Ma räägin emaga.'],
      ]),
      help('k1_p_help', 'leia kõigepealt küsimus (kus? kuhu? kust? kellega?), siis lõpp tabelist.', 'kirjuta 3 lauset sõnaga kool: kus? kust? kuhu? (koolis, koolist, kooli). Siis sama sõnaga pood.'),
    ],
    transfer: [
      teach(aid(B.speaking('k1_t_pair', 'Paaris: küsi ja vasta.', 'Küsi paarilt. Vasta täislausega.', [
        'Kus sa elad?', 'Kust sa pärit oled?', 'Millega sa tööle või kooli sõidad?', 'Kellega sa eesti keelt räägid?', 'Kuhu sa nädalavahetusel lähed?', 'Kellele sa tihti helistad?',
      ], [120, 240]), ['Ma elan …-s.', 'Ma olen pärit …-st.', 'Ma sõidan …-ga.'], 'küsi igale vastusele üks lisaküsimus: Kellega? Millal?', 'interview'),
      'Учитель: один на один — учитель партнёр. Записывайте ошибки только в окончаниях; после разговора 2 ошибки на доску, ученик сам исправляет.'),
      B.writing('k1_t_write', 'Kirjuta oma laused.', 'Kirjuta oma päevast 5 lauset. Kasuta viit eri küsimust.', [5, 5]),
      teach(exitCheck(B.speaking('k1_t_exit', 'Väljumine: 30 sekundit.', 'Räägi 30 sekundit: kus sa oled, kuhu lähed, kellega.', ['Kus sa praegu oled?', 'Kuhu sa pärast tundi lähed?', 'Kellega?'], [20, 40])), 'Учитель: засчитано, если в речи 3 разных падежа с верным окончанием.'),
      exitCheck(B.gaps('k1_t_exit_form', 'Kaks vormi.', 'Kirjuta sõna õige lõpuga.', ['Ma joon kohvi [piimaga] (piim, millega?).', 'Ma tulen [poest] (pood, kust?).'], '', 'full')),
      selfCheck('k1_t_self', ['Ma leian lausest küsimuse: kus, kuhu, kust, kellega', 'Ma tean: omastav + lõpp', 'Ma räägin endast eri käänetega'], 'Ma tean, mis on kääne!'),
      homework('k1_t_home', ['1. Kirjuta skeemi järgi sõna kool kõik 14 vormi.', '2. Leia oma telefonist üks eesti keele uudis või reklaam: kirjuta välja 5 sõna lõpuga ja nende küsimused.', '3. Harjuta → Käänded lauses, tund 1.']),
    ],
  },

  // =====================================================================================================================
  'kaanded-002': {
    title: 'Nimetav, omastav, osastav lauses',
    canDo: 'Ma leian lausest aluse, omaniku ja sihitise ning valin sihitisele õige käände: omastav või osastav.',
    discover: [
      review('k2_d_review', [['Kus sa elad? Kust sa pärit oled?', 'kaanded-001'], ['Millega sa täna tundi tulid? Kellega sa eesti keelt räägid?', 'kaanded-001']]),
      teach(scheme('k2_d_scheme', 'Terve asi või osa?', '002-sihitis', 'Otsustusskeem: neli küsimust — kas on „ei”, kas on arv või hulk, kas tegusõna on armastama või ootama, kas tegevus kestab. Jah viib osastavale, lõpus omastav: tegevus lõpeb, asi on terve.', [
        'Sihitis on see, mida tehakse: Ma ostan **leiva**. Ma ostan **leiba**. Mõlemad laused on õiged, aga tähendus on erinev.',
        'Mine skeemil ülevalt alla. Esimene „jah” annab vastuse.',
      ].join('\n\n')), 'Учитель: идите по схеме сверху вниз на двух примерах. Сравнение с русским видом глагола (купил / покупал) помогает, но не всегда совпадает — правило схемы важнее.'),
      B.notice('k2_d_notice', 'Märka! Kolm põhikäänet lauses.', [
        '**Nimetav** (kes? mis?) on alus: **Ema** loeb. **Raamat** on laual.',
        '**Omastav** (kelle? mille?) näitab omanikku ja käib kaassõnaga: **ema** raamat, **laua** all, **maja** ees.',
        '**Täissihitis**: tegevus lõpeb, asi on terve. Ma ostsin **leiva**. Ma lugesin **raamatu** läbi. Mitmuses nimetav: Ma ostsin **raamatud**.',
        '**Osasihitis** (osastav): tegevus kestab, ainult osa või eitus. Ma loen **raamatut**. Ma ostan **leiba**. Ma ei osta **leiba**.',
        'Alati osastav: arv ja hulk (kaks **raamatut**, palju **leiba**) ja tegusõnad **armastama, ootama, aitama, vajama**: Ma ootan **bussi**.',
        'Vene keeles: «я прочитал книгу» (всю) = Ma lugesin **raamatu** läbi; «я читал книгу» = Ma lugesin **raamatut**. Похоже на совершенный и несовершенный вид.',
      ], 'full'),
      B.table('k2_d_forms', 'Kolm vormi.', 'Kirjuta puuduvad vormid.', 'Nimetav (kes? mis?), Omastav (kelle? mille?), Osastav (keda? mida?)', [
        'raamat | raamatu | [raamatut]',
        'leib | leiva | [leiba]',
        'sõber | [sõbra] | sõpra',
        'auto | [auto] | [autot]',
        'võti | võtme | [võtit]',
        'pood | [poe] | poodi',
      ], 'g_notice'),
      B.reading('k2_d_text', 'Loe teksti.', 'Loe pere hommikust. Vasta lühidalt.', 'Pühapäeva hommik', [
        'Pühapäeva hommikul teeb isa süüa. Ta keedab kohvi ja praeb mune. Ema loeb ajalehte. Vanaema otsib oma prille, sest ta ei leia neid kuskilt. Lõpuks leiab Markus prillid diivani alt.',
        'Pärast sööki peseb isa nõud ära. Ema loeb ajalehe läbi ja paneb selle laua peale. Siis kirjutavad nad poenimekirja: kaks pakki piima, üks leib ja natuke juustu.',
      ], [['Mida isa keedab?', 'kohvi'], ['Mida vanaema otsib?', 'prille|oma prille'], ['Kust Markus prillid leiab?', 'diivani alt'], ['Mida ema loeb?', 'ajalehte']]),
      B.categorize('k2_d_sort', 'Terve või osa?', 'Pane tekstist sihitised õigesse rühma.', [
        ['Täissihitis: tegevus lõpeb', ['leiab prillid', 'peseb nõud ära', 'loeb ajalehe läbi']],
        ['Osasihitis: tegevus kestab, osa, eitus', ['keedab kohvi', 'praeb mune', 'otsib prille', 'ei leia neid']],
      ], 'full', 'g_notice'),
    ],
    practice: [
      cols3(B.choice('k2_p_choice', 'Täis või osa?', 'Vali õige vorm.', [
        ['Eile ostsin poest …', 'uue jope', 'uut jopet', 'uus jope'],
        ['Täna ma ei osta …', 'leiba', 'leiva', 'leib'],
        ['Mari kirjutab praegu …', 'luuletust', 'luuletuse', 'luuletus'],
        ['Lõpuks kirjutas Mari … valmis.', 'luuletuse', 'luuletust', 'luuletus'],
        ['Me ootame juba kümme minutit …', 'bussi', 'buss', 'bussiga'],
        ['Laual on kolm …', 'õuna', 'õun', 'õunad'],
        ['Ma armastan …', 'muusikat', 'muusika', 'muusikaga'],
        ['Isa parandas … ära.', 'auto', 'autot', 'autole'],
      ], 'full', 'g_notice')),
      teach(B.formtext('k2_p_text', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna sobivas käändes: omastav või osastav.', 'Anna vaba päev', [
        'Täna on Anna kodus. Hommikul jõi ta [kohvi] (kohv) ja luges [ajalehte] (ajaleht). Siis koristas ta [toa] (tuba) ära ja pesi [aknad] (aken) puhtaks.',
        'Pärast lõunat ostis ta poest [leiva] (leib), kaks [pudelit] (pudel) piima ja natuke [juustu] (juust). Kodus ei leidnud ta [võtit] (võti). Ta otsis seda kaua. Lõpuks leidis ta [võtme] (võti) koti põhjast.',
        'Õhtul ootas ta [sõpra] (sõber) külla.',
      ]), 'Учитель: на каждой ошибке — вопрос по схеме: есть «ei»? есть число? действие закончено? «aknad» — множественное число полного объекта = nimetav.'),
      B.transformation('k2_p_neg', 'Ütle eitavalt.', 'Kirjuta lause „ei”-ga.', [
        ['Ma ostsin leiva.', 'Ma ei …', 'Ma ei ostnud leiba.'],
        ['Mul on auto.', 'Mul ei …', 'Mul ei ole autot.|Mul pole autot.'],
        ['Ta jõi kohvi.', 'Ta ei …', 'Ta ei joonud kohvi.'],
        ['Me nägime Marit.', 'Me ei …', 'Me ei näinud Marit.'],
        ['Isa parandas auto ära.', 'Isa ei …', 'Isa ei parandanud autot ära.'],
        ['Ma lugesin raamatu läbi.', 'Ma ei …', 'Ma ei lugenud raamatut läbi.'],
      ]),
      help('k2_p_help', 'küsi endalt skeemi järgi: 1) Kas on „ei”? 2) Kas on arv või hulk? 3) Kas tegevus lõpeb ja asi on terve?', 'käsklauses on täissihitis nimetavas: Osta **leib**! Söö **supp** ära! Kirjuta kaks oma käsku.'),
    ],
    transfer: [
      teach(aidCard(aid(B.rolecards('k2_t_shop', 'Paaris: mida meil on, mida ei ole?', 'Planeerige õhtusöök. A vaatab külmkappi, B teeb poenimekirja.', 'A: Sa oled kodus ja vaatad külmkappi. Ütle, mis on ja mis ei ole.', 'B: Sa lähed poodi. Küsi ja kirjuta nimekiri.', ['Meil on veel …', 'Meil ei ole … (osastav!)', 'Me vajame kaks …'], ['Kas meil on …?', 'Mitu … ma ostan?', 'Ma ostan … ja …']),
      ['Meil ei ole leiba.', 'Me vajame kaks pakki piima.', 'Ma ostan juustu.'], 'lõpus ütle, mida sa ostsid: Ma ostsin leiva, … (täissihitis).', 'roleplay')),
      'Учитель: учитель — партнёр A. Цель — «ei ole + osastav» и «kaks + osastav». В конце ученик пересказывает, что купил: полный объект (ostsin leiva).'),
      B.writing('k2_t_write', 'Kirjuta oma laused.', 'Kirjuta eilsest päevast 6 lauset: 3 täis-, 3 osasihitisega.', [6, 6]),
      exitCheck(B.writing('k2_t_exit', 'Väljumine: kaks lauset.', 'Kirjuta: mida sa täna ostsid ja mida ei ostnud.', [2, 2])),
      exitCheck(B.gaps('k2_t_exit_form', 'Kaks vormi.', 'Kirjuta sõna õiges vormis.', ['Ma ei joo õhtul [kohvi] (kohv).', 'Ma lugesin eile [raamatu] (raamat) läbi.'], '', 'full')),
      selfCheck('k2_t_self', ['Ma leian lausest aluse ja sihitise', 'Ma valin skeemi järgi omastava või osastava', 'Eitusega kasutan osastavat'], 'Terve või osa — ma tean!'),
      homework('k2_t_home', ['1. Kirjuta oma poenimekiri: 5 asja arvuga (kaks pakki piima, kolm õuna …).', '2. Kirjuta 3 paari: Ma loen raamatut. — Ma lugesin raamatu läbi.', '3. Harjuta → Käänded lauses, tund 2.']),
    ],
  },

  // =====================================================================================================================
  'kaanded-003': {
    title: 'Sisekohakäänded: kuhu? kus? kust?',
    canDo: 'Ma ütlen, kuhu ma lähen, kus ma olen ja kust ma tulen: majja, majas, majast.',
    discover: [
      review('k3_d_review', [['Mida sa eile ostsid? Mida sa ei ostnud?', 'kaanded-002'], ['Kus sa elad? Kust sa pärit oled?', 'kaanded-001']]),
      teach(scheme('k3_d_scheme', 'Sees: kolm suunda', '003-sees', 'Kolm maja: nool läheb majja (kuhu? -sse), punkt on majas (kus? -s), nool tuleb majast välja (kust? -st).', [
        'Vaata noolt. Nool läheb sisse: **kuhu?** Punkt on sees: **kus?** Nool tuleb välja: **kust?**',
        'Need kolm käänet on sees-käänded: maja, kool, pood, tuba, linn, riik.',
      ].join('\n\n')), 'Учитель: покажите движение рукой: в дом — в доме — из дома. Ученик повторяет жест и форму. Короткие формы (majja, kooli, poodi, tuppa) — учить как слова.'),
      B.notice('k3_d_notice', 'Märka! Sees: -sse, -s, -st.', [
        '**Kuhu?** sisse: **-sse** — maja**sse**, kooli**sse**, kohviku**sse**. Lühike vorm: **majja**, **kooli**, **poodi**, **tuppa**, **linna**.',
        '**Kus?** sees: **-s** — **majas**, **koolis**, **poes**, **toas**, **linnas**.',
        '**Kust?** seest välja: **-st** — **majast**, **koolist**, **poest**, **toast**, **linnast**.',
        'Lõpp tuleb omastava külge: pood → poe → **poes**, **poest**. tuba → toa → **toas**, **toast**.',
        'Erand: kodu → **koju**, **kodus**, **kodust**.',
        'Vene keeles «в дом», «в доме», «из дома» — два предлога. Eesti keeles kolm lõppu ilma eessõnata: **majja**, **majas**, **majast**.',
      ], 'full'),
      B.table('k3_d_grid', 'Skeem 3 × 3.', 'Täida tabel: -sse, -s, -st.', 'Sõna (omastav), Kuhu? →, Kus? •, Kust? ←', [
        'maja (maja) | majja / majasse | majas | [majast]',
        'kool (kooli) | [kooli/koolisse] | [koolis] | koolist',
        'pood (poe) | poodi / poesse | [poes] | [poest]',
        'tuba (toa) | tuppa / toasse | [toas] | [toast]',
        'linn (linna) | [linna/linnasse] | [linnas] | [linnast]',
        'kodu (kodu) | koju | [kodus] | [kodust]',
      ], 'g_notice'),
      B.reading('k3_d_text', 'Loe teksti.', 'Loe Liisi laupäevast. Vasta lühidalt.', 'Laupäev linnas', [
        'Laupäeval sõidab Liis bussiga linna. Kõigepealt läheb ta raamatukokku ja viib raamatud tagasi. Raamatukogus on vaikne ja soe.',
        'Siis läheb ta poodi. Poes ostab ta kingituse, sest õhtul on sõbra sünnipäev. Poest läheb Liis kohvikusse ja joob tassi teed. Kell viis tuleb ta kohvikust välja ja sõidab koju. Kodus pakib ta kingituse ilusasse paberisse.',
      ], [['Kuhu Liis kõigepealt läheb?', 'raamatukokku|raamatukogusse'], ['Kus on vaikne ja soe?', 'raamatukogus'], ['Kust ta kell viis välja tuleb?', 'kohvikust']]),
      B.diagram('k3_d_route', 'flow', { title: 'Liisi tee.', instruction: 'Kirjuta tekstist puuduvad vormid.', nodes: 'bussiga [linna]\n[raamatukokku|raamatukogusse]\n[poodi|poesse]\n[kohvikusse]\ntagasi [koju]' }, 'full'),
    ],
    practice: [
      teach(B.formtext('k3_p_text', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna -sse, -s või -st lõpuga.', 'Esmaspäeva hommik', [
        'Kell seitse tulen [vannitoast] (vannituba) ja lähen [kööki|köögisse] (köök). [Köögis] (köök) keedan kohvi. Siis võtan [kapist] (kapp) puhta särgi.',
        'Kell kaheksa lähen [kodust] (kodu) välja. Lapsed lähevad [kooli|koolisse] (kool), mina lähen [kontorisse] (kontor). [Kontoris] (kontor) on täna palju tööd. Lõunal lähen [sööklasse] (söökla).',
        'Õhtul tulen [linnast] (linn) bussiga tagasi ja lähen kohe [sauna|saunasse] (saun).',
      ]), 'Учитель: обе формы kuhu? верны (kööki / köögisse, kooli / koolisse). Типичная ошибка — kuhu? вместо kus?: «Ma lähen koolis». Спросить: движение или место?'),
      B.transformation('k3_p_turn', 'Kus? → kuhu? → kust?', 'Muuda lauset. Kasuta antud algust.', [
        ['Ma olen poes.', 'Kuhu? Ma lähen …', 'Ma lähen poodi.|Ma lähen poesse.'],
        ['Ta on koolis.', 'Kust? Ta tuleb …', 'Ta tuleb koolist.'],
        ['Me oleme Tartus.', 'Kuhu? Me sõidame …', 'Me sõidame Tartusse.'],
        ['Kass on toas.', 'Kust? Kass tuleb …', 'Kass tuleb toast.'],
        ['Lapsed on õues.', 'Kuhu? Lapsed lähevad …', 'Lapsed lähevad õue.'],
        ['Isa on saunas.', 'Kust? Isa tuleb …', 'Isa tuleb saunast.'],
      ]),
      cols3(B.choice('k3_p_choice', 'Vali õige vorm.', 'Mõtle: liikumine või koht?', [
        ['Pane piim … tagasi!', 'külmkappi', 'külmkapis', 'külmkapist'],
        ['Kas sa oled praegu …?', 'kodus', 'koju', 'kodust'],
        ['Mul on külm, ma lähen …', 'tuppa', 'toas', 'toast'],
        ['Ma tulin just …, seal oli palju inimesi.', 'poest', 'poodi', 'poes'],
        ['Ta elab … juba kaks aastat.', 'Eestis', 'Eestisse', 'Eestist'],
        ['Mu vend kolis eelmisel aastal …', 'Soome', 'Soomes', 'Soomest'],
      ], 'full', 'g_notice')),
      help('k3_p_help', 'liikumine sisse — kuhu? (-sse); olen sees — kus? (-s); liikumine välja — kust? (-st).', 'kasuta lühikesi vorme: maja → majja, tuba → tuppa, pood → poodi, kool → kooli, Soome → Soome. Kirjuta 4 lauset.'),
    ],
    transfer: [
      scheme('k3_t_picture', 'Pilt: tuba', '003-tuba', 'Tuba: tüdruk tuleb köögist, kass on avatud kapis, laual on vaas lilledega ja kott, õun kukub kotist, laua all on karp raamatutega, poiss läheb vannituppa.', 'Vaata pilti. Kus asjad on? Kes kuhu läheb?'),
      teach(aid(B.speaking('k3_t_room', 'Paaris: kirjelda pilti.', 'A kirjeldab pilti, B ei vaata ja joonistab. Siis vahetage.', [
        'Kus on kass?', 'Mis on vaasis?', 'Mis on karbis?', 'Mis kukub kotist?', 'Kuhu poiss läheb?', 'Kust tüdruk tuleb?',
      ], [120, 240]), ['Kass on …-s.', '… kukub …-st välja.', 'Poiss läheb …-sse.'], 'ütle ka, kuhu iga asi tuleb panna: Pane raamatud riiulisse!', 'infogap'),
      'Учитель: один на один — ученик описывает, учитель рисует на доске (и наоборот). Если рисунок не совпал — значит, падеж был неточным. Ответы: kass on kapis, lilled on vaasis, raamatud on karbis, õun kukub kotist, poiss läheb vannituppa, tüdruk tuleb köögist.'),
      B.writing('k3_t_write', 'Kirjuta oma laused.', 'Kirjuta oma päevast 6 lauset: kuhu, kus, kust.', [6, 6], ['kodust', 'tööle', 'poodi', 'koju'], 0),
      exitCheck(B.writing('k3_t_exit', 'Väljumine: minu tee.', 'Kirjuta 2 lauset: kust sa täna tulid ja kuhu lähed.', [2, 2])),
      exitCheck(B.gaps('k3_t_exit_form', 'Kaks vormi.', 'Kirjuta sõna õige lõpuga.', ['Lähme õhtul [kinno|kinosse] (kino)!', 'Ema tuli [poest] (pood) koju.'], '', 'full')),
      selfCheck('k3_t_self', ['Ma eristan kuhu, kus ja kust', 'Ma tean lühikesi vorme: majja, kooli, tuppa, koju', 'Ma kirjeldan pilti sees-käänetega'], 'Sees, sisse, seest — selge!'),
      homework('k3_t_home', ['1. Joonista oma tuba ja kirjuta 5 lauset: kus mis on?', '2. Kirjuta oma nädalavahetuse tee: kodust … , siis … , lõpuks koju.', '3. Harjuta → Käänded lauses, tund 3.']),
    ],
  },

  // =====================================================================================================================
  'kaanded-004': {
    title: 'Väliskohakäänded: peal, inimene, aeg',
    canDo: 'Ma kasutan -le, -l, -lt: pinnal (laual), inimesega (emale, emalt), omamisel (mul on) ja ajas (esmaspäeval).',
    discover: [
      review('k4_d_review', [['Kuhu sa pärast tundi lähed? Kus sa õhtul oled?', 'kaanded-003'], ['Mida sul kodus ei ole?', 'kaanded-002']]),
      teach(scheme('k4_d_scheme', 'Peal: kolm suunda ja kolm tähendust', '004-peal', 'Kolm lauda: raamat kukub lauale (kuhu? -le), raamat on laual (kus? -l), raamat tuleb laualt (kust? -lt). All tabel: inimene, omamine, aeg, koht.', [
        'Väliskäänded on „peal” ja „juures”: laua peal = **laual**.',
        'Neid kasutame ka inimese (**emale**), omamise (**mul on**), aja (**esmaspäeval**) ja mõne koha kohta (**tööl**, **turul**).',
      ].join('\n\n')), 'Учитель: та же схема 3 × 3, что в уроке 3, но «на / у». Главное для русскоязычных: «у меня есть» = mul on (не «minul on» — тоже верно, но длиннее; не «mina on»).'),
      B.notice('k4_d_notice', 'Märka! Peal: -le, -l, -lt.', [
        '**Kuhu?** peale: **-le** — **lauale**, **tööle**, **turule**. **Kus?** peal: **-l** — **laual**, **tööl**, **turul**. **Kust?** pealt: **-lt** — **laualt**, **töölt**, **turult**.',
        'Inimene: Ma helistan **emale** (kellele?). **Emal** on auto (kellel?). Ma sain **emalt** kirja (kellelt?).',
        'Omamine: **Mul on** koer. **Sul ei ole** aega. **Õel on** kaks last. mina → **mulle, mul, minult**; sina → **sulle, sul, sinult**; tema → **talle, tal, temalt**.',
        'Aeg: **esmaspäeval**, **hommikul**, **õhtul**, **suvel**, **talvel**.',
        'Sees või peal? Hoone sees: **koolis**, **poes**, **haiglas**. Aga: **tööl**, **turul**, **staadionil**, **maal**, **Saaremaal**.',
        'Vene keeles «у меня есть» = **mul on**; «на работе» = **tööl**, «на рынке» = **turul**. Aga «на почте» = **postkontoris**: alati ei ole «на» = -l.',
      ], 'full'),
      B.table('k4_d_grid', 'Skeem 3 × 3: peal.', 'Täida tabel: -le, -l, -lt.', 'Sõna (omastav), Kuhu? →, Kus? •, Kust? ←', [
        'laud (laua) | lauale | laual | [laualt]',
        'töö (töö) | [tööle] | [tööl] | töölt',
        'turg (turu) | [turule] | turul | [turult]',
        'ema (ema) | [emale] | [emal] | [emalt]',
        'mina (minu) | mulle | [mul] | [minult]',
        'staadion (staadioni) | [staadionile] | [staadionil] | [staadionilt]',
      ], 'g_notice'),
      B.diagram('k4_d_vs', 'compare', { title: 'Sees või peal?', instruction: 'Vaata ja võrdle. Õpi parem veerg pähe.', left: 'Sees: -s', right: 'Peal / juures: -l', leftItems: 'koolis\npoes\nkontoris\npargis\nTallinnas', rightItems: 'tööl\nturul\nstaadionil\nmaal\nSaaremaal' }, 'full'),
      B.reading('k4_d_text', 'Loe sõnumit.', 'Loe Liisi sõnumit. Vasta lühidalt.', 'Sõnum emale', [
        'Tere, ema! Mul on täna vaba päev. Hommikul käisin turul ja ostsin kurke ja maasikaid. Turult läksin otse tööle, sest pidin ühe paberi ära viima.',
        'Tööl kohtasin kolleegi Peetrit. Peetril on uus auto! Ta viis mind autoga koju. Laupäeval sõidan Saaremaale. Kas sa saad mulle oma suure koti laenata? Ma tulen reedel sinu juurde. Musi! Liis',
      ], [['Kus Liis hommikul käis?', 'turul'], ['Kellel on uus auto?', 'Peetril|kolleegil'], ['Kuhu ta laupäeval sõidab?', 'Saaremaale'], ['Millal ta ema juurde tuleb?', 'reedel']]),
    ],
    practice: [
      teach(B.formtext('k4_p_text', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna -le, -l või -lt lõpuga.', 'Teisipäev', [
        '[Teisipäeval] (teisipäev) on mul palju tegemist. Kell kaheksa lähen [tööle] (töö). [Tööl] (töö) helistan [kliendile] (klient) ja saadan talle arve.',
        'Lõunal võtan [laualt] (laud) telefoni ja helistan [õele] (õde). [Õel] (õde) on täna sünnipäev! Pärast tööd lähen [turule] (turg) ja ostan lilli.',
        'Õhtul saan [sõbralt] (sõber) sõnumi: „Kas [sul] (sina) on homme aega?” Vastan: „[Kolmapäeval] (kolmapäev) mitte, aga [neljapäeval] (neljapäev) küll.”',
      ]), 'Учитель: обратите внимание на omastav: klient → kliendi-le, õde → õe-le, sõber → sõbra-lt. Ошибка «õdele» — частая.'),
      cols3(B.choice('k4_p_inout', 'Sees või peal?', 'Vali õige vorm.', [
        ['Isa on praegu …', 'tööl', 'töös', 'tööle'],
        ['Lapsed õpivad …', 'koolis', 'koolil', 'kooli'],
        ['Ma ostan köögivilju …', 'turult', 'turust', 'turgu'],
        ['Pane taldrikud …!', 'lauale', 'lauasse', 'laual'],
        ['Suvel elame …', 'maal', 'maas', 'maale'],
        ['Mu vanaema elab …', 'Hiiumaal', 'Hiiumaas', 'Hiiumaale'],
        ['Mu õde töötab …', 'haiglas', 'haiglal', 'haiglasse'],
        ['Poisid mängivad … jalgpalli.', 'staadionil', 'staadionis', 'staadionile'],
      ], 'full', 'g_notice')),
      B.transformation('k4_p_have', 'Mul on …', 'Kirjuta lause „on”-ga.', [
        ['mina + auto', 'Mul …', 'Mul on auto.'],
        ['õde + kaks last', 'Õel …', 'Õel on kaks last.'],
        ['Peeter + koer', 'Peetril …', 'Peetril on koer.'],
        ['sina + aega (ei)', 'Sul …', 'Sul ei ole aega.|Sul pole aega.'],
        ['meie + uus korter', 'Meil …', 'Meil on uus korter.'],
        ['tema + külm', 'Tal …', 'Tal on külm.|Temal on külm.'],
      ]),
      help('k4_p_help', 'peal, inimene, aeg ja omamine — -le, -l, -lt. Hoone sees — -sse, -s, -st.', 'kirjuta 4 lauset sõnadega mulle, mul, minult ja talle: Anna helistas mulle …'),
    ],
    transfer: [
      scheme('k4_t_picture', 'Kaart: väike linn', '004-linn', 'Linna kaart: kodu, kool, pood, turg, töö, park, raamatukogu, haigla, kino, staadion, bussijaam, kohvik; meres on saar. Turg, töö, staadion ja saar on rohelised.', 'Rohelised kohad: -le, -l, -lt (turule, turul, turult). Teised: -sse, -s, -st.'),
      teach(aid(B.speaking('k4_t_map', 'Paaris: minu päev linnas.', 'Vali kaardil 5 kohta. Räägi oma teest. Paariline näitab kaardil.', [
        'Kust sa hommikul lähed?', 'Kuhu sa kõigepealt lähed?', 'Kus sa lõunal oled?', 'Kust sa õhtul koju tuled?', 'Kellele sa päeval helistad?',
      ], [120, 240]), ['Hommikul lähen kodust …-le / …-sse.', 'Seal ma …', 'Siis lähen …-st / …-lt …'], 'kasuta ka aega ja inimest: Esmaspäeval helistan õele.', 'narrative'),
      'Учитель: роли можно поменять: учитель рассказывает маршрут, ученик водит пальцем по карте. Зелёные места на карте — внешние падежи (turul, tööl, staadionil, saarel).'),
      B.writing('k4_t_write', 'Kirjuta oma laused.', 'Kirjuta 6 lauset: mis sul on, kellele helistad, millal töötad.', [6, 6], ['mul on', 'helistan', 'esmaspäeval'], 0),
      teach(exitCheck(B.speaking('k4_t_exit', 'Väljumine: 30 sekundit.', 'Räägi 30 sekundit: mis sul on ja kellele täna helistad.', ['Mis sul on? Mida sul ei ole?', 'Kellele sa täna helistad?'], [20, 40])), 'Учитель: засчитано, если есть «mul on / mul ei ole + osastav» и одна форма на -le.'),
      exitCheck(B.gaps('k4_t_exit_form', 'Kaks vormi.', 'Kirjuta sõna õige lõpuga.', ['Ma sain [sõbralt] (sõber) kingituse.', 'Pane võtmed [lauale] (laud)!'], '', 'full')),
      selfCheck('k4_t_self', ['Ma kasutan -le, -l, -lt peal ja inimesega', 'Ma ütlen: mul on, sul ei ole', 'Ma tean: koolis, aga tööl ja turul'], 'Peal ja juures — selge!'),
      homework('k4_t_home', ['1. Kirjuta oma nädalast 5 lauset: esmaspäeval …, teisipäeval …', '2. Kirjuta 3 inimest: kellele sa helistad, kellelt saad sõnumeid, kellel on koer.', '3. Harjuta → Käänded lauses, tund 4.']),
    ],
  },

  // =====================================================================================================================
  'kaanded-005': {
    title: 'Viimased viis käänet',
    level: 'B1',
    canDo: 'Ma kasutan saavat, rajavat, olevat, ilmaütlevat ja kaasaütlevat käänet: arstiks, reedeni, arstina, suhkruta, sõbraga.',
    discover: [
      review('k5_d_review', [['Kellele sa eile helistasid? Mis sul täna kotis on?', 'kaanded-004'], ['Kust sa täna tulid? Kuhu sa õhtul lähed?', 'kaanded-003']]),
      teach(scheme('k5_d_scheme', 'Viis lõppu, viis tähendust', '005-viis', 'Viis kaarti: -ks väikesest saab suur (muutub), -ni nool lipuni (piir), -na inimene sildiga ARST (roll), -ta tass, suhkur läbi kriipsutatud (ilma), -ga kaks inimest koos.', [
        'Need viis käänet on lühikesed ja väga sagedased.',
        'Iga lõpu küsimus: **milleks?** **milleni?** **millena?** **milleta?** **millega?**',
      ].join('\n\n')), 'Учитель: для русскоязычных главная пара — -ks и -na (оба = творительный: стать врачом / работать врачом). -ks — изменение, -na — роль сейчас.'),
      B.notice('k5_d_notice', 'Märka! Viimased viis käänet.', [
        '**Saav -ks** (kelleks? milleks?) — muutumine: Ta **saab arstiks**. Ilm **muutub külmaks**. Mida sa **sünnipäevaks** tahad?',
        '**Rajav -ni** (milleni? mis ajani?) — piir: Ma töötan **kella viieni**. Buss sõidab **Tartuni**. **Esmaspäevast reedeni**.',
        '**Olev -na** (kellena? millena?) — roll: Ta töötab **arstina**. **Lapsena** elasin Narvas.',
        '**Ilmaütlev -ta** (kelleta? milleta?) — ilma: kohv **suhkruta**, **ilma vihmavarjuta**. Ma ei saa **sinuta** elada.',
        '**Kaasaütlev -ga** (kellega? millega?) — koos või abil: Ma tulen **sõbraga**. Ma sõidan **bussiga**.',
        'NB! -ni, -na, -ta, -ga: lõpp on ainult viimasel sõnal — **suure koeraga**, **uue autota**. Aga -ks mõlemal: **heaks sõbraks**.',
        'Vene keeles «стать врачом» ja «работать врачом» — üks падеж. Eesti keeles kaks: **saab arstiks** (muutus), **töötab arstina** (roll). «С другом» = **sõbraga**, «без сахара» = **suhkruta**.',
      ], 'full'),
      B.table('k5_d_table', 'Viis käänet ühe sõnaga.', 'Kirjuta puuduvad vormid.', 'Sõna (omastav), -ks, -ni, -na, -ta, -ga', [
        'sõber (sõbra) | sõbraks | [sõbrani] | sõbrana | [sõbrata] | [sõbraga]',
        'õpetaja (õpetaja) | [õpetajaks] | õpetajani | [õpetajana] | õpetajata | [õpetajaga]',
        'raha (raha) | [rahaks] | [rahani] | rahana | [rahata] | rahaga',
        'auto (auto) | [autoks] | autoni | [autona] | [autota] | [autoga]',
      ], 'g_notice'),
      B.reading('k5_d_text', 'Loe teksti.', 'Loe Tiinast. Vasta lühidalt.', 'Kuidas Tiinast sai kokk', [
        'Lapsena elas Tiina Narvas. Juba kaheksa-aastaselt küpsetas ta koos vanaemaga kooke. Kooli lõpus otsustas ta: „Ma tahan saada kokaks.” Ta õppis kolm aastat Tallinnas ja töötas samal ajal kohvikus ettekandjana.',
        'Nüüd töötab Tiina kokana väikeses restoranis. Restoran on avatud teisipäevast pühapäevani, kella üheteistkümnest kella kümneni õhtul. Tiina teeb suppi ilma lihata ja kooke suhkruta. Esmaspäeval puhkab ta ja sõidab rattaga mere äärde.',
      ], [['Kelleks Tiina tahtis saada?', 'kokaks'], ['Kellena ta nüüd töötab?', 'kokana'], ['Mis päevani restoran on avatud?', 'pühapäevani'], ['Millega ta esmaspäeval sõidab?', 'rattaga']]),
      B.match('k5_d_match', 'Mis tähendus?', 'Ühenda vorm tekstist ja tähendus.', [
        ['kokaks', 'saav: muutumine'],
        ['kokana', 'olev: roll'],
        ['pühapäevani', 'rajav: piir'],
        ['lihata', 'ilmaütlev: ilma'],
        ['rattaga', 'kaasaütlev: millega?'],
      ], 'full', 'g_notice'),
    ],
    practice: [
      teach(B.formtext('k5_p_text', 'Pane sõnad õigesse vormi.', 'Kirjuta sõna -ks, -ni, -na, -ta või -ga lõpuga.', 'Uus töö', [
        'Mart töötas viis aastat [bussijuhina] (bussijuht). Eelmisel aastal otsustas ta: „Ma tahan saada [programmeerijaks] (programmeerija).” Ta õppis õhtuti, sageli kella [kaheni] (kaks) öösel. Ilma [arvutita] (arvuti) see ei olnud võimalik. Ta õppis koos [sõbraga] (sõber).',
        'Nüüd töötab Mart [programmeerijana] (programmeerija) ühes firmas. Ta sõidab tööle [rattaga] (ratas). Töönädal kestab esmaspäevast [reedeni] (reede). Ta joob kohvi [piimata] (piim), aga [suhkruga] (suhkur). [Sünnipäevaks] (sünnipäev) sai ta naiselt uue arvuti.',
      ]), 'Учитель: kaks → kahe-ni, ratas → ratta-ga: снова omastav + окончание. Если ученик путает -ks и -na — вопрос: «изменение или роль?»'),
      cols3(B.choice('k5_p_choice', '-ks või -na?', 'Vali õige vorm.', [
        ['Liisa tahab saada …', 'arstiks', 'arstina', 'arstiga'],
        ['Ta töötab juba kaks aastat …', 'arstina', 'arstiks', 'arstita'],
        ['Ilm muutus öösel …', 'külmaks', 'külmana', 'külmani'],
        ['… olin ma väga häbelik.', 'Lapsena', 'Lapseks', 'Lapseni'],
        ['Mida sa … soovid?', 'jõuludeks', 'jõuludena', 'jõuludega'],
        ['Ma töötasin suvel kohvikus …', 'ettekandjana', 'ettekandjaks', 'ettekandjat'],
      ], 'full', 'g_notice')),
      B.transformation('k5_p_turn', 'Ütle ühe lausega.', 'Kasuta antud lõppu.', [
        ['Ma joon kohvi. Suhkrut ei ole.', '-ta: Ma joon kohvi …', 'Ma joon kohvi suhkruta.|Ma joon kohvi ilma suhkruta.'],
        ['Ma sõidan tööle. Mul on auto.', '-ga: Ma sõidan tööle …', 'Ma sõidan tööle autoga.'],
        ['Pood on lahti. Kell kaheksa pood suletakse.', '-ni: Pood on lahti …', 'Pood on lahti kella kaheksani.'],
        ['Mari ei olnud ema. Nüüd on ta ema.', '-ks: Mari sai …', 'Mari sai emaks.'],
        ['Ta töötab. Ta on giid.', '-na: Ta töötab …', 'Ta töötab giidina.'],
      ]),
      help('k5_p_help', '-ks = muutub / saab, -ni = kuni, -na = mis rollis, -ta = ilma, -ga = koos või millega.', 'kirjuta kaks lauset omadussõnaga: hea sõbraga (lõpp ainult lõpus) ja heaks sõbraks (lõpp mõlemal).'),
    ],
    transfer: [
      teach(aid(B.speaking('k5_t_talk', 'Paaris: töö ja unistused.', 'Küsi paarilt. Siis räägi grupile, mida ta ütles.', [
        'Kellena sa töötad või kelleks sa õpid?', 'Kelleks sa lapsena tahtsid saada?', 'Millega sa tööle või kooli sõidad?', 'Mis kellani sa tavaliselt töötad?', 'Milleta sa ei saa elada?', 'Mida sa sünnipäevaks soovid?',
      ], [120, 240]), ['Ma töötan …-na.', 'Lapsena tahtsin saada …-ks.', 'Ma ei saa elada …-ta.'], 'räägi paarilisest kolmandas isikus: Ta töötab …-na, ta tahab saada …-ks.', 'interview'),
      'Учитель: один на один учитель отвечает тоже — ученик пересказывает ответы учителя в 3-м лице. Отметить -ks / -na.'),
      B.writing('k5_t_write', 'Kirjuta oma laused.', 'Kirjuta endast 5 lauset: igas üks viiest lõpust.', [5, 5]),
      exitCheck(B.writing('k5_t_exit', 'Väljumine: minu unistus.', 'Kirjuta 2 lauset: kellena sa töötad ja kelleks tahad saada.', [2, 2])),
      exitCheck(B.gaps('k5_t_exit_form', 'Kaks vormi.', 'Kirjuta sõna õige lõpuga.', ['Ma joon teed [suhkruta] (suhkur).', 'Pood on avatud kella [kuueni] (kuus).'], '', 'full')),
      selfCheck('k5_t_self', ['Ma eristan -ks (muutus) ja -na (roll)', 'Ma kasutan -ni, -ta ja -ga', 'Ma räägin oma tööst ja unistustest'], 'Viis lõppu — käes!'),
      homework('k5_t_home', ['1. Kirjuta oma pere kohta 4 lauset: kellena keegi töötab, kelleks tahab saada.', '2. Kirjuta oma lemmikkohviku või poe lahtiolekuajad: … -st … -ni.', '3. Harjuta → Käänded lauses, tund 5.']),
    ],
  },

  // =====================================================================================================================
  'kaanded-006': {
    title: 'Kääne sõltub verbist. Kordamine ja kontroll',
    level: 'B1',
    canDo: 'Ma tean, millist käänet tegusõna nõuab (huvitub millestki, mõtleb millelegi, armastab keda), ja kasutan kõiki käändeid lauses.',
    discover: [
      review('k6_d_review', [['Kelleks sa tahtsid lapsena saada?', 'kaanded-005'], ['Kus ja kellega sa eile olid?', 'kaanded-004']]),
      teach(scheme('k6_d_scheme', 'Tegusõna valib käände', '006-tegusona', 'Skeem: vasakul tegusõnad, nool paremale käändeni: huvituma -st, mõtlema -le, armastama osastav, kohtuma -ga, saama -ks.', [
        'Mõni tegusõna tahab alati sama käänet. Õpi tegusõna koos küsimusega: **huvituma millest?**, **mõtlema millele?**',
        'Sõnaraamatus (Sõnaveeb) on see kirjas: huvituma *kellest/millest*.',
      ].join('\n\n')), 'Учитель: управление — это «слово + вопрос» как единица. Учим не «huvituma», а «huvituma millest». Русское управление часто другое — это главный источник ошибок.'),
      B.notice('k6_d_notice', 'Märka! Tegusõna valib käände.', [
        '**-st** (millest? kellest?): **huvituma** — Ma huvitun **muusikast**. **sõltuma** — See sõltub **ilmast**. **rääkima**, **unistama**, **aru saama** — Ma saan **küsimusest** aru.',
        '**-le** (millele? kellele?): **mõtlema** — Ma mõtlen **sulle**. **helistama** — Helista **emale**! **meeldima** — **Mulle** meeldib kohv. **vastama** — Vasta **küsimusele**!',
        '**osastav** (keda? mida?): **armastama** — Ma armastan **sind**. **ootama**, **aitama**, **vajama** — Ma vajan **abi**. **tänama** — Tänan **sind**!',
        '**-ga** (kellega? millega?): **kohtuma** — Ma kohtun **sõbraga**. **nõustuma** — Ma nõustun **sinuga**. **abielluma**, **harjuma**.',
        '**-ks** ja **-l**: **saama** — Ta sai **arstiks**. **osalema** — Ma osalen **koosolekul**.',
        'Vene keeles teine kääne: «интересоваться чем» → huvituma **millest**; «помогать кому» → aitama **keda**: Ma aitan **ema**, mitte „emale”.',
      ], 'full'),
      B.match('k6_d_match', 'Tegusõna ja küsimus.', 'Ühenda tegusõna ja küsimus.', [
        ['huvituma', 'millest?'],
        ['mõtlema', 'millele?'],
        ['armastama', 'keda?'],
        ['kohtuma', 'kellega?'],
        ['saama (arst)', 'kelleks?'],
        ['osalema', 'millel?'],
      ], 'full', 'g_notice'),
      B.reading('k6_d_text', 'Loe kirja.', 'Loe Andrei kirja. Vasta lühidalt.', 'Kiri sõbrale', [
        'Tere, Oleg! Kuidas sul läheb? Mul on uus töö ja ma olen sellega väga rahul. Ma töötan meeskonnas, kus kõik huvituvad tehnikast. Iga hommik kohtun kolleegidega köögis ja me räägime uudistest. Mu ülemus aitab mind palju ja ma tänan teda iga päev.',
        'Eile osalesin esimest korda koosolekul ja vastasin kõikidele küsimustele eesti keeles! Palju sõltub sellest, kas ma saan kõigest aru. Ma mõtlen tihti sulle ja meie ühisele reisile. Kas sa unistad ikka Islandist? Helista mulle! Sinu Andrei',
      ], [['Millest kolleegid huvituvad?', 'tehnikast'], ['Kellega ta hommikul kohtub?', 'kolleegidega'], ['Kus ta eile osales?', 'koosolekul'], ['Millest Oleg unistab?', 'Islandist']]),
      B.table('k6_d_find', 'Leia tekstist.', 'Kirjuta tekstist sõna, mis käib tegusõnaga.', 'Tegusõna, Sõna tekstist, Küsimus', [
        'huvituma | [tehnikast] | millest?',
        'kohtuma | [kolleegidega] | kellega?',
        'aitama | [mind] | keda?',
        'osalema | [koosolekul] | millel?',
        'mõtlema | [sulle] | kellele?',
        'unistama | [Islandist] | millest?',
      ], 'g_notice'),
    ],
    practice: [
      teach(B.formtext('k6_p_text', 'Pane sõnad õigesse vormi.', 'Tegusõna valib käände. Kirjuta sõna õiges vormis.', 'Minu nädal', [
        'Esmaspäeval helistasin [vanaemale] (vanaema). Ta rääkis mulle oma [aiast] (aed). Teisipäeval aitasin [naabrit] (naaber) — tema auto ei käivitunud. Kolmapäeval kohtusin [õpetajaga] (õpetaja) ja küsisin nõu.',
        'Neljapäeval osalesin [koosolekul] (koosolek). Reedel mõtlesin terve päeva [puhkusele] (puhkus). Ma unistan [päikesest] (päike) ja merest, aga kõik sõltub [ilmast] (ilm). Laupäeval ootasin [sõpra] (sõber) kaks tundi. Pühapäeval vastasin kõikidele [kirjadele] (kiri).',
      ]), 'Учитель: kirjadele — множественное число (kirja-de-le); если ученик пишет «kirjale», засчитать падеж, объяснить число.'),
      cols3(B.choice('k6_p_choice', 'Vali õige vorm.', 'Mõtle: mida tegusõna küsib?', [
        ['Ma huvitun …', 'ajaloost', 'ajalugu', 'ajaloole'],
        ['Aita palun …!', 'mind', 'mulle', 'minuga'],
        ['… meeldib jalgpall.', 'Pojale', 'Poeg', 'Poega'],
        ['Ma armastan …', 'sind', 'sulle', 'sinust'],
        ['Ta abiellus …', 'Peetriga', 'Peetrit', 'Peetrile'],
        ['Kas sa saad … aru?', 'küsimusest', 'küsimust', 'küsimusele'],
        ['Ma tänan … abi eest.', 'teid', 'teile', 'teiega'],
        ['Vasta palun …', 'küsimusele', 'küsimust', 'küsimusest'],
      ], 'full', 'g_notice')),
      B.errorfix('k6_p_fix', 'Paranda viga.', 'Siin on vene keele mõju. Kirjuta õigesti.', [
        ['Ma aitan emale.', 'Ma aitan ema.'],
        ['Ma huvitun muusikat.', 'Ma huvitun muusikast.'],
        ['Ma kohtun sõpra.', 'Ma kohtun sõbraga.'],
        ['Ta sai arst.', 'Ta sai arstiks.'],
        ['Ma helistan ema.', 'Ma helistan emale.'],
        ['Ma vajan sinu abiga.', 'Ma vajan sinu abi.'],
      ]),
      help('k6_p_help', 'õpi tegusõna koos küsimusega: huvituma millest, mõtlema millele, aitama keda, kohtuma kellega.', 'leia Sõnaveebist (sonaveeb.ee) veel kaks tegusõna, mis tahavad -st või -ga, ja kirjuta nendega lause.'),
    ],
    transfer: [
      teach(aid(B.speaking('k6_t_survey', 'Küsitlus: leia keegi, kes …', 'Küsi kolmelt inimeselt. Kirjuta üles nimi ja vastus.', [
        'Millest sa huvitud?', 'Millest sa unistad?', 'Kellele sa kõige tihedamini helistad?', 'Kellega sa nädalavahetusel kohtud?', 'Keda sa tihti aitad?', 'Millest sõltub sinu tuju?',
      ], [180, 300]), ['Ma huvitun …-st.', 'Ma helistan kõige tihedamini …-le.', 'Mu tuju sõltub …-st.'], 'lõpus räägi grupile: Kaks inimest huvituvad …-st, üks unistab …-st.', 'survey'),
      'Учитель: в индивидуальном уроке — ученик спрашивает учителя, потом вспоминает двух знакомых и отвечает за них. Итог — 3 предложения о группе.'),
      B.writing('k6_t_write', 'Kirjuta oma laused.', 'Kirjuta endast 6 lauset kuue tegusõnaga kastist.', [6, 6], ['huvituma', 'unistama', 'mõtlema', 'helistama', 'aitama', 'kohtuma', 'sõltuma', 'osalema'], 0),
      teach(B.text('k6_t_control', 'Kontroll: käänded lauses', [
        'Umbes 20 minutit, ilma vihikuta. Neli osa: 8 + 10 + 6 + 6 = **30 punkti**. Iga õige vastus on 1 punkt.',
        '**27–30** — väga hea · **21–26** — hea · **15–20** — korda tunde, kus tegid vigu · **alla 15** — korda tunde 1–6 õpetajaga.',
      ].join('\n\n')), 'Учитель: контроль охватывает все 6 уроков (части 1–4). После проверки — посмотрите, в каком уроке больше ошибок, и повторите его Harjuta-лист.'),
      cols3(B.choice('k6_t_c1', 'Osa 1. Vali õige vorm. (8 punkti)', 'Vali üks vastus.', [
        ['Ma elan … juba viis aastat.', 'Tallinnas', 'Tallinna', 'Tallinnast'],
        ['Ta tuli just … koju.', 'töölt', 'tööle', 'tööl'],
        ['Mul ei ole täna …', 'aega', 'aeg', 'aja'],
        ['Eile lugesin selle … läbi.', 'raamatu', 'raamatut', 'raamat'],
        ['Pärast kooli tahan saada …', 'juristiks', 'juristina', 'jurist'],
        ['Ma sõidan tööle …', 'rattaga', 'rattata', 'rattaks'],
        ['Ma huvitun …', 'spordist', 'sporti', 'spordile'],
        ['Pane lilled …!', 'vaasi', 'vaasis', 'vaasist'],
      ], 'full', 'g_notice')),
      B.formtext('k6_t_c2', 'Osa 2. Pane sõnad õigesse vormi. (10 punkti)', 'Kirjuta sõna õiges vormis.', 'Kiri vanaemale', [
        'Kallis vanaema! [Laupäeval] (laupäev) käisin [turul] (turg) ja ostsin [mett] (mesi). Turult läksin [raamatukokku|raamatukogusse] (raamatukogu). [Raamatukogus] (raamatukogu) kohtusin [Tiinaga] (Tiina). Ta töötab seal [juhatajana] (juhataja).',
        'Õhtul helistasin [isale] (isa). Homme sõidan [Tartusse] (Tartu) ja olen seal [pühapäevani] (pühapäev). Kallistan! Sinu Liis',
      ]),
      B.transformation('k6_t_c3', 'Osa 3. Muuda lauset. (6 punkti)', 'Kasuta antud algust.', [
        ['Ma olen kodus.', 'Ma lähen …', 'Ma lähen koju.'],
        ['Ta on tööl.', 'Ta tuleb …', 'Ta tuleb töölt.'],
        ['Ma ostsin piima.', 'Ma ei …', 'Ma ei ostnud piima.'],
        ['Mul on koer.', 'Mul ei …', 'Mul ei ole koera.|Mul pole koera.'],
        ['Mari on õpetaja.', 'Mari töötab …', 'Mari töötab õpetajana.'],
        ['Ma joon kohvi. Suhkrut ei ole.', 'Ma joon kohvi …', 'Ma joon kohvi suhkruta.|Ma joon kohvi ilma suhkruta.'],
      ]),
      B.errorfix('k6_t_c4', 'Osa 4. Paranda viga. (6 punkti)', 'Kirjuta lause õigesti.', [
        ['Ma lähen poes.', 'Ma lähen poodi.|Ma lähen poesse.'],
        ['Mina on auto.', 'Mul on auto.|Minul on auto.'],
        ['Ma ootan buss.', 'Ma ootan bussi.'],
        ['Ta helistab sõbra.', 'Ta helistab sõbrale.'],
        ['Ma kohtun õpetajat.', 'Ma kohtun õpetajaga.'],
        ['Me räägime filmi.', 'Me räägime filmist.'],
      ]),
      teach(exitCheck(B.speaking('k6_t_exit', 'Väljumine: 30 sekundit.', 'Räägi 30 sekundit: millest huvitud, kellega kohtud, millest unistad.', ['Millest sa huvitud?', 'Kellega sa sel nädalal kohtud?', 'Millest sa unistad?'], [20, 40])), 'Учитель: засчитано, если три глагола с верным управлением (-st, -ga, -st).'),
      selfCheck('k6_t_self', ['Ma õpin tegusõna koos küsimusega', 'Ma kasutan kõiki käändeid lauses', 'Kontrollis sain vähemalt 21 punkti'], 'Käänded lauses — tehtud!'),
      homework('k6_t_home', ['1. Paranda kontrolli vead ja kirjuta iga vea kohta üks uus õige lause.', '2. Tee endale kaardid: tegusõna + küsimus (huvituma millest?). Vähemalt 10 kaarti.', '3. Harjuta → Käänded lauses, tund 6.']),
    ],
  },
};
