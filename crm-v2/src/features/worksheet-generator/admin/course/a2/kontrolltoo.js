// A2 course (A1 → A2), supplement „Kontrolltöö 1” (owner 2026-11-18, for an 8th-grade Russian-speaking learner at A1 → A2):
// a review pack before the school test „Kontrolltöö nr 1” in „Eesti keel teise keelena” (19.11). The teacher's list:
// lihtminevik, täisminevik, mitmuse omastav, vaatamisväärsused (minema kuhu, käima kus, tulema kust, soovitama mida) and
// küsimuste moodustamine. We do not have the school textbook, so the sheets cover the topics themselves. Not a module of
// the roadmap: one lesson, three sheets.
//   Avasta   theory sheet (meta.theory): a rule card + a small table with cells to fill per topic, a short check quiz
//   Harjuta  graded practice: forms → tense choice → plural genitive in a text → place cases → questions → a trip text → writing
//   Kasuta   „Proovitöö”: a mock school test, 35–40 min, 6 tasks × 8 = 48 points, every item closed and scored by the player
//            (`diagnostic: ['transfer']`: the phase is a measurement, quality.js skips the lesson-shape rules for it)
// The goals are the test's topics, so the player's result „Tulemus tunni eesmärkide kaupa” shows them one by one.
// No storyline characters (owner): neutral first person, a class trip, two neutral names in a postcard.
// Forms: the i-past olin, läksin, tulin, tegin, nägin, sõin, jõin; käima → käisin (si-past); the -nud form = the negative
// past. Mitmuse omastav from the singular partitive (-t → -te, -d / vowel → -de): laste, inimeste, kirikute, majade,
// muuseumide, turistide, sõprade, linnuste, losside; auto / pere are the known exceptions (autode, perede). Place names:
// Kadriorg – Kadrioru – Kadriorgu, Kadriorus, Kadriorust; Toompea – Toompeal – Toompead; Toomemägi – Toomemäel – Toomemäge;
// Teletorni / Teletornisse; Lennusadamasse – Lennusadamat; ERM-i / ERM-isse; Narva linnusesse – Narva linnust;
// Pärnu randa / rannasse. Short illatives are accepted with their long forms.
import { B, teach } from '../blocks.js';

export const MODULE = { id: 'a2-kontrolltoo-01', course: 'a2', title: 'Kontrolltöö 1 (kordamine)', level: 'A2', design: 'v2', template: 'v4', supplement: true };

const PHASE_LABELS = {
  discover: { label: '1 Teooria', slot: 1, subtitle: 'Loe reeglid läbi, täida tabelite lüngad ja kontrolli end.' },
  practice: { label: '2 Harjuta', slot: 2, subtitle: 'Harjuta kõiki kontrolltöö teemasi: kergemast raskemani.' },
  transfer: { label: '3 Proovitöö', slot: 3, subtitle: 'Proovi kontrolltööd: 35–40 minutit, 50 punkti.' },
};

export const LESSONS = {
  'a2-kt01': {
    title: 'Kontrolltöö 1: minevik, mitmuse omastav, vaatamisväärsused',
    canDo: 'Ma kasutan lihtminevikku ja täisminevikku, moodustan mitmuse omastava, ütlen vaatamisväärsuse õiges vormis (kuhu? kus? kust? mida?) ja moodustan küsimusi.',
    phases: PHASE_LABELS,
    theory: ['discover'],
    shortSheet: ['practice'],
    diagnostic: ['transfer'],
    discover: [
      B.review('kt01_d_review', [
        ['Kus? Kuhu? Kust? — kodus, koju, kodust; Tallinnas, Tallinna, Tallinnast.', 'a2-k01'],
        ['Eile ma läksin, tulin, sõin. Täna ma lähen, tulen, söön.', 'a2-l05'],
        'Mitu? Arvu järel on ainsuse osastav: kaks maja, kolm muuseumi.',
      ]),
      B.vocab('kt01_d_vocab', 'Teema sõnad.', [
        'vaatamisväärsus — достопримечательность', 'vanalinn — старый город', 'linnus — крепость', 'torn — башня',
        'sadam — порт', 'plats — площадь', 'mägi — гора (холм)', 'rand — пляж', 'loss — дворец (замок)',
        'ekskursioon — экскурсия', 'soovitama — советовать', 'käima — бывать (съездить)',
      ]),
      B.reading('kt01_d_text', 'Lugu: kõik teemad koos.', 'Loe lühikest lugu. Vasta küsimustele lühidalt.', 'Laupäev Tallinnas', [
        'Eelmisel laupäeval sõitsime klassiga bussiga Tallinna. Kõigepealt läksime vanalinna. Raekoja platsil oli palju turiste. Giid rääkis meile linna ajaloost. Siis ronisime Toompeale. Sealt oli ilus vaade ja me vaatasime vanade majade punaseid katuseid. Ma tegin telefoniga palju pilte. Lõunat sõime ühes väikeses kohvikus. Pärast lõunat käisime Lennusadamas. Seal nägime vana allveelaeva. Õhtul tulime Tallinnast koju väsinud, aga rõõmsad.',
        '',
        'Ma olen Tallinnas juba mitu korda käinud, aga Teletornis ma ei ole veel käinud. Õpetaja soovitab Teletorni ja Kadriorgu. Kas sina oled seal käinud?',
      ], [
        ['Kuhu klass laupäeval sõitis?', 'Tallinna|Tallinnasse|nad sõitsid Tallinna|bussiga Tallinna'],
        ['Kus oli palju turiste?', 'Raekoja platsil|vanalinnas Raekoja platsil|vanalinnas'],
        ['Mida nad Lennusadamas nägid?', 'vana allveelaeva|allveelaeva|nad nägid vana allveelaeva'],
        ['Kus kirjutaja ei ole veel käinud?', 'Teletornis|ta ei ole veel Teletornis käinud'],
        ['Mida õpetaja soovitab?', 'Teletorni ja Kadriorgu|Kadriorgu ja Teletorni|Teletorni|Kadriorgu'],
      ]),
      B.notice('kt01_d_r1', '1. Lihtminevik (простое прошедшее время)', [
        'Lihtminevik: mis juhtus **eile, laupäeval, eelmisel aastal**. Küsimus: **Mida sa tegid?**',
        'Lõpud: ma **-sin**, sa **-sid**, ta **-s**, me **-sime**, te **-site**, nad **-sid**: ma ela**sin**, ta ela**s**, nad ela**sid**.',
        'Kui tüvi lõpeb kaashäälikuga, on ta-vormis **-is**: sõitma → ta sõit**is**, ostma → ta ost**is** (aga ma sõit**sin**, ma ost**sin**).',
        'Erandid (исключения, без **-s-**): olema → **olin**, tulema → **tulin**, tegema → **tegin**, nägema → **nägin**, sööma → **sõin**, jooma → **jõin**; minema → **läksin**.',
        'käima on tavaline: ma **käisin**, ta **käis**.',
        'Eitus: **ei + -nud**, kõigil isikutel sama: ma / ta / nad **ei elanud**, **ei käinud**, **ei läinud**, **ei tulnud**, **ei teinud**, **ei näinud**, **ei söönud**, **ei joonud**, **ei olnud**.',
        'Pärast „ei” ei ole -sin: **ma ei läinud** (mitte: ma ei läksin).',
        'По-русски: глагол меняется по лицам: ma läksin — я пошёл, nad läksid — они пошли. Отрицание одно для всех лиц: ei läinud — не пошёл / не пошли.',
      ], 'full', 'g_minevik'),
      B.table('kt01_d_t1', 'Tabel: lihtminevik.', 'Kontrolli end: kirjuta puuduvad vormid. Abi leiad reeglist.', 'Tegusõna, ma (eile), ta (eile), nad (eile), eitus', [
        'elama | elasin | elas | elasid | ei elanud',
        'sõitma | sõitsin | sõitis | sõitsid | ei sõitnud',
        'käima | käisin | [käis] | käisid | [ei käinud]',
        'olema | olin | oli | olid | ei olnud',
        'minema | läksin | läks | [läksid] | ei läinud',
        'tulema | [tulin] | tuli | tulid | ei tulnud',
        'tegema | tegin | tegi | tegid | ei teinud',
        'nägema | nägin | [nägi] | nägid | ei näinud',
        'sööma | sõin | sõi | sõid | [ei söönud]',
        'jooma | [jõin] | jõi | jõid | ei joonud',
      ], 'g_minevik'),
      B.notice('kt01_d_r2', '2. Täisminevik (перфект: опыт, результат)', [
        'Täisminevik = **olema + -nud**: ma **olen käinud**, sa **oled käinud**, ta **on käinud**, me **oleme käinud**, te **olete käinud**, nad **on käinud**.',
        'Eitus: **ei ole + -nud**: ma **ei ole käinud** (ka: ma pole käinud).',
        '-nud-vorm on sama nagu lihtmineviku eituses: ei läinud → olen **läinud**, ei näinud → olen **näinud**, ei söönud → olen **söönud**.',
        '**Lihtminevik**: aeg on teada: **eile, laupäeval, eelmisel suvel, 2024. aastal**. Ma **käisin** eile Tartus.',
        '**Täisminevik**: aeg ei ole tähtis, tähtis on kogemus: **kunagi, juba, veel mitte, mitu korda**. Kas sa **oled** kunagi Tartus **käinud**? Ma **ei ole** veel Narvas **käinud**.',
        'По-русски: täisminevik — «у меня есть такой опыт», «уже / ещё не». Kas sa oled … käinud? = Ты когда-нибудь был …?',
      ], 'full', 'g_minevik'),
      B.table('kt01_d_t2', 'Tabel: täisminevik.', 'Kontrolli end: kirjuta puuduv jaatav või eitav vorm.', 'Tegusõna, jaatav, eitav', [
        'käima | ma olen käinud | ma ei ole käinud',
        'nägema | ta on näinud | ta ei ole näinud',
        'sööma | me oleme söönud | [me ei ole söönud/me pole söönud]',
        'minema | nad on läinud | [nad ei ole läinud/nad pole läinud]',
        'olema | [sa oled olnud] | sa ei ole olnud',
      ], 'g_minevik'),
      B.notice('kt01_d_r3', '3. Mitmuse omastav (kelle? mille? — мн. число)', [
        'Mitmuse omastav vastab küsimusele **kelle? mille?**: maja**de**, las**te**, turisti**de**. Lõpp on **-de** või **-te**.',
        'Vaata **ainsuse osastavat** (mida?). Osastav lõpeb **täishäälikuga** → **+ de**: maja → maja**de**, kooli → kooli**de**, muuseumi → muuseumi**de**, parki → parki**de**.',
        'Osastav lõpeb **-d** → **+ e**: maad → maa**de**, tööd → töö**de**.',
        'Osastav lõpeb **-t** → **+ e**: last → las**te**, inimest → inimes**te**, raamatut → raamatu**te**, tänavat → tänava**te**.',
        'Kus kasutame? **Kaassõnaga**: majade **vahel**, laste **jaoks**, puude **all**, turistide **seas**. **Teise sõna ees**: linnade **nimed**, laste **mänguväljak**.',
        '**Arvu järel ei ole mitmuse omastavat**: kaks **maja**, kolm **muuseumi** (ainsuse osastav).',
        'NB! auto → auto**de**, pere → pere**de** (mitte -te).',
        'По-русски: majade vahel — между домами, laste jaoks — для детей, linnade nimed — названия городов.',
      ], 'full', 'g_omastav'),
      B.table('kt01_d_t3', 'Tabel: mitmuse omastav.', 'Kontrolli end: kirjuta mitmuse omastav. Vaata osastava lõppu.', 'Nimetav, Osastav (mida?), Mitmuse omastav, Näide', [
        'maja | maja | majade | majade vahel',
        'muuseum | muuseumi | muuseumide | muuseumide kõrval',
        'maa | maad | maade | Euroopa maade nimed',
        'laps | last | laste | laste jaoks',
        'turist | turisti | [turistide] | turistide seas',
        'kirik | kirikut | [kirikute] | vanade kirikute ees',
        'linn | linna | [linnade] | Eesti linnade nimed',
      ], 'g_omastav'),
      B.notice('kt01_d_r4', '4. Vaatamisväärsused: minema kuhu, käima kus, tulema kust, soovitama mida', [
        '**Vaatamisväärsus** = koht, mida turistid tahavad näha: Tallinna vanalinn, Toompea, Teletorn, Tartu Toomemägi, Narva linnus.',
        '**minema KUHU?** → **-sse / -le**: Ma lähen **Tartusse**, **Toompeale**. Lühike vorm: **Tallinna, vanalinna, Teletorni, muuseumi, Kadriorgu, randa**.',
        '**käima KUS?** → **-s / -l**: Ma käisin **Tartus**, **Teletornis**, **Toompeal**.',
        '**tulema KUST?** → **-st / -lt**: Me tulime **Tartust**, **Narvast**, **Toompealt**.',
        '**soovitama MIDA?** → osastav: Ma soovitan **Teletorni**, **vanalinna**, **Lennusadamat**, **Kadriorgu**, **Toomemäge**. Või: Ma soovitan **minna** Teletorni (+ kuhu?).',
        '**-s / -sse / -st**: linnad, majad, muuseumid (Tallinnas, Kumus). **-l / -le / -lt**: platsid, mäed, saared (Raekoja platsil, Toompeal, Saaremaal).',
        'По-русски: «я съездил в Таллинн» = **käisin Tallinnas** (где?), не „käisin Tallinna”. käima = побывать где-то и вернуться.',
      ], 'full', 'g_koht'),
      B.table('kt01_d_t4', 'Tabel: vaatamisväärsuste vormid.', 'Kontrolli end: kirjuta puuduvad vormid. Lühikese vormi kõrval on ka pikk vorm õige.', 'Vaatamisväärsus, Kuhu? (minema), Kus? (käima), Kust? (tulema), Mida? (soovitama)', [
        'Tallinna vanalinn | vanalinna (ka vanalinnasse) | vanalinnas | vanalinnast | vanalinna',
        'Raekoja plats | Raekoja platsile | Raekoja platsil | Raekoja platsilt | Raekoja platsi',
        'Toompea | Toompeale | Toompeal | Toompealt | Toompead',
        'Kadriorg | Kadriorgu | Kadriorus | Kadriorust | Kadriorgu',
        'Teletorn | Teletorni (ka Teletornisse) | Teletornis | Teletornist | Teletorni',
        'Lennusadam | Lennusadamasse | Lennusadamas | Lennusadamast | Lennusadamat',
        'Tartu Toomemägi | Toomemäele | Toomemäel | Toomemäelt | Toomemäge',
        'Eesti Rahva Muuseum (ERM) | ERM-i (ka ERM-isse) | ERM-is | ERM-ist | ERM-i',
        'Narva linnus | Narva linnusesse | Narva linnuses | [Narva linnusest] | [Narva linnust]',
        'Pärnu rand | Pärnu randa (ka rannasse) | [Pärnu rannas] | Pärnu rannast | [Pärnu randa]',
      ], 'g_koht'),
      B.notice('kt01_d_r5', '5. Küsimuste moodustamine', [
        '**Kas-küsimus** (ответ да / нет): **Kas** + alus + tegusõna: **Kas sa käisid Tartus?** — Jah, käisin. / Ei, ei käinud.',
        'Täisminevikus: **Kas sa oled kunagi Narvas käinud?** — Jah, olen. / Ei, ei ole.',
        '**Küsisõna** on lause alguses ja siis „kas” ei ole: **Kuhu sa läksid?** (mitte: Kas kuhu sa läksid?)',
        'Sõnajärg: küsisõna + tegusõna + alus: **Millal läks klass Tartusse?** Asesõnaga (sa, ta, te) on tavaline: **Millal sa Tartusse läksid?**',
        'Vastus ütleb, mis küsisõna on vaja: **Toompeale** → kuhu?, **Toompeal** → kus?, **Toompealt** → kust?, **eile** → millal?, **sõbraga** → kellega?, **sest …** → miks?',
      ], 'full', 'g_kysimus'),
      B.table('kt01_d_t5', 'Tabel: küsisõnad.', 'Loe näiteid. Pane tähele, et tegusõna on samas ajas nagu vastuses.', 'Küsisõna, По-русски, Näide', [
        'kes? | кто? | Kes käis Teletornis?',
        'mis? | что? (nimetav) | Mis on Eesti kõige kõrgem ehitis?',
        'mida? | что? (osastav) | Mida sa Lennusadamas nägid?',
        'kus? | где? | Kus sa eile käisid?',
        'kuhu? | куда? | Kuhu te laupäeval läksite?',
        'kust? | откуда? | Kust sa tulid?',
        'millal? | когда? | Millal sa Narvas käisid?',
        'miks? | почему? | Miks sa ei tulnud?',
        'kellega? | с кем? | Kellega sa Pärnusse sõitsid?',
      ], 'g_kysimus'),
      B.choice('kt01_d_check1', 'Kontrolli end: minevik ja mitmuse omastav.', 'Vali õige vastus.', [
        ['Eile ma … Tartus ja Toomemäel.', 'käisin', 'käis', 'olen käinud'],
        ['Laupäeval me ei … klassiga kinno.', 'läinud', 'läksime', 'läksid'],
        ['Kas sa … kunagi Narva linnuses käinud?', 'oled', 'olid', 'on'],
        ['Ma ei … veel kordagi Teletornis käinud.', 'ole', 'olnud', 'olen'],
        ['Eelmisel suvel me … Pärnu rannas.', 'olime', 'oleme olnud', 'oleme'],
        ['Vanalinnas jalutasime vanade … vahel.', 'majade', 'majad', 'maja'],
        ['Muuseumi teisel korrusel on kaks …', 'saali', 'saalide', 'saalid'],
        ['Mänguväljak on väikeste … jaoks.', 'laste', 'lapsed', 'last'],
      ], 'full', 'g_minevik'),
      B.choice('kt01_d_check2', 'Kontrolli end: kohad ja küsimused.', 'Vali õige vastus.', [
        ['Homme lähen sõbraga … (Toompea).', 'Toompeale', 'Toompeal', 'Toompealt'],
        ['Ma soovitan sulle Tallinnas …', 'Lennusadamat', 'Lennusadamas', 'Lennusadamasse'],
        ['Eile käisime perega … (Kadriorg).', 'Kadriorus', 'Kadriorgu', 'Kadriorust'],
        ['Buss tuleb … (Narva) kell kuus.', 'Narvast', 'Narvas', 'Narva'],
        ['„… sa eile tulid?” — „Narvast.”', 'Kust', 'Kus', 'Kuhu'],
        ['„… sa Pärnusse sõitsid?” — „Vanematega.”', 'Kellega', 'Kes', 'Millal'],
        ['„… sa nädalavahetusel käisid?” — „Teletornis.”', 'Kus', 'Kuhu', 'Kust'],
        ['„… sa eile ei tulnud?” — „Sest olin haige.”', 'Miks', 'Millal', 'Kes'],
      ], 'full', 'g_koht'),
      teach(B.speaking('kt01_d_talk', 'Minu reisid Eestis.', 'Vasta suuliselt täislausetega. Kasuta lihtminevikku ja täisminevikku.', [
        'Kus sa oled Eestis käinud?', 'Kuhu sa läksid eelmisel suvel?', 'Mida sa seal nägid ja tegid?',
        'Mida sa soovitad turistile Tallinnas või Narvas?', 'Kus sa ei ole veel käinud, aga tahad minna?',
      ], [60, 120], ['Ma olen … käinud.', 'Eelmisel suvel ma läksin …', 'Ma soovitan …']),
      'Üks-ühele: õpetaja küsib, õpilane vastab täislausega. Kui õpilane ütleb „käisin Tallinna”, kordab õpetaja õigesti: „Aa, sa käisid Tallinnas.” Siis küsib õpilane õpetajalt samad küsimused.'),
      B.selfcheck('kt01_d_self', [
        'Ma tean lihtmineviku lõppe ja erandeid: olin, läksin, tulin, tegin, nägin, sõin, jõin, käisin.',
        'Ma tean eitust: ei läinud, ei ole käinud.',
        'Ma tean, millal on täisminevik: kunagi, juba, veel mitte.',
        'Ma moodustan mitmuse omastava: majade, laste, turistide.',
        'Ma ütlen: lähen Toompeale, käisin Toompeal, tulin Toompealt, soovitan Toompead.',
        'Ma moodustan kas-küsimuse ja küsimuse küsisõnaga.',
      ], 'Teooria selge', 'Ma oskan …'),
    ],
    practice: [
      B.wordforms('kt01_p_forms', 'Lihtminevik: kirjuta vorm.', 'Kirjuta tegusõna lihtminevikus. Vihje ütleb, kes tegi; „ei” tähendab eitust.', [
        ['minema', 'ma', 'läksin'], ['tulema', 'me', 'tulime'], ['olema', 'nad', 'olid'], ['sööma', 'ta', 'sõi'],
        ['käima', 'te', 'käisite'], ['sõitma', 'ta', 'sõitis'], ['tegema', 'ma, ei', 'ei teinud'], ['jooma', 'nad, ei', 'ei joonud'],
      ], 'full', 'g_minevik'),
      B.crossword('kt01_p_cross', 'Ristsõna: -nud-vorm.', 'Kirjuta täismineviku -nud-vorm. Vastused lähevad ristsõnasse.', [
        ['Ma olen Tartus … (käima).', 'käinud'], ['Kas sa oled Teletorni … (nägema)?', 'näinud'], ['Me oleme Pärnus … (olema).', 'olnud'],
        ['Ta on juba koju … (minema).', 'läinud'], ['Nad on Narvast … (tulema).', 'tulnud'], ['Ma ei ole kunagi kama … (sööma).', 'söönud'],
        ['Kas te olete seda filmi … (vaatama)?', 'vaadanud'], ['Ma ei ole veel kodutööd … (tegema).', 'teinud'],
      ], 'full', 'g_minevik'),
      B.choice('kt01_p_tense', 'Eile või kunagi?', 'Vali lihtminevik või täisminevik. Vaata ajasõna: eile, laupäeval, 2023. aastal või kunagi, juba, veel.', [
        ['Eelmisel suvel me … Saaremaal.', 'käisime', 'oleme käinud', 'käime'],
        ['Kas sa … kunagi Narva linnuses?', 'oled käinud', 'käinud', 'ole käinud'],
        ['Eile õhtul me … Raekoja platsil.', 'jalutasime', 'oleme jalutanud', 'jalutame'],
        ['Ma … veel Tartu Toomemäel käinud.', 'ei ole', 'ei olnud', 'ei'],
        ['2023. aastal ma … esimest korda Pärnu rannas.', 'olin', 'olen olnud', 'olen'],
        ['Ma olen Kumus juba kaks korda …', 'käinud', 'käisin', 'käima'],
        ['Laupäeval nad … Narvast koju alles õhtul.', 'tulid', 'on tulnud', 'tulnud'],
        ['Mu vanaema … kunagi Teletornis käinud. Ta tahab minna.', 'ei ole', 'ei olnud', 'ei'],
      ], 'full', 'g_minevik'),
      B.formtext('kt01_p_plural', 'Mitmuse omastav tekstis.', 'Kirjuta sulgudes olev sõna mitmuse omastavas (kelle? mille?).', 'Jalutuskäik vanalinnas', [
        'Tallinna vanalinn on väga vana ja ilus. Kitsaste [tänavate] (tänav) ääres on värvilised majad. Vanade [majade] (maja) vahel on väikesed kohvikud ja poed.',
        '',
        'Suvel on Raekoja platsil palju inimesi. [Turistide] (turist) seas on soomlasi, sakslasi ja jaapanlasi. Talvel on platsil jõuluturg ja [laste] (laps) jaoks on seal karussell.',
        '',
        'Toompealt on näha [kirikute] (kirik) tornid ja punased katused. Giid rääkis meile vanade [linnuste] (linnus) ja [losside] (loss) ajaloost. Pärast ekskursiooni ostsime [sõprade] (sõber) jaoks magneteid.',
      ], 'g_omastav'),
      B.categorize('kt01_p_sort', 'Kuhu? Kus? Kust? Mida?', 'Pane vormid õigesse rühma. Mõtle, mis küsimusele vorm vastab.', [
        ['Kuhu? (ma lähen …)', ['Toompeale', 'Tartusse', 'Lennusadamasse', 'Saaremaale']],
        ['Kus? (ma käisin …)', ['Teletornis', 'Toomemäel', 'Narvas', 'Raekoja platsil']],
        ['Kust? (ma tulin …)', ['Tartust', 'Pärnu rannast', 'Toompealt', 'Kumust']],
        ['Mida? (ma soovitan …)', ['Lennusadamat', 'Narva linnust', 'Toomemäge', 'AHHAA keskust']],
      ], 'full', 'g_koht'),
      B.cloze('kt01_p_chat', 'Mis vorm sobib?', 'Loe sõnumeid. Vali igasse lünka sobiv vorm.', 'Sõnumid sõbrale', [
        '— Tere! Kus sa nädalavahetusel olid?',
        '',
        '— Me sõitsime perega {*Tartusse|Tartus|Tartust}. Laupäeval käisime {*Eesti Rahva Muuseumis|Eesti Rahva Muuseumi|Eesti Rahva Muuseumist}. Pärast seda läksime {*Toomemäele|Toomemäel|Toomemäelt} jalutama.',
        '',
        '— Lahe! Mina ei ole veel {*Tartus|Tartusse|Tartut} käinud. Mida sa soovitad?',
        '',
        '— Ma soovitan {*AHHAA keskust|AHHAA keskuses|AHHAA keskusesse}. See on teaduskeskus, seal on väga huvitav.',
        '',
        '— Aga Tallinnas? Mu onu tuleb homme {*Narvast|Narvas|Narva} ja tahab midagi näha.',
        '',
        '— Soovita talle {*Lennusadamat|Lennusadamas|Lennusadamasse}! Ja minge kindlasti {*Kadriorgu|Kadriorus|Kadrioru}, seal on ilus park ja loss.',
      ], 'g_koht'),
      B.transformation('kt01_p_ask', 'Küsi vastusele.', 'Kirjuta küsimus, millele lause vastab. Küsimuse algus on antud.', [
        ['Me läksime laupäeval Toompeale.', 'Kuhu te …?', 'Kuhu te laupäeval läksite?|Kuhu te läksite laupäeval?|Kuhu te läksite?|Kuhu te laupäeval läksite Toompeale?'],
        ['Ma käisin eile Teletornis.', 'Kus sa …?', 'Kus sa eile käisid?|Kus sa käisid eile?|Kus sa käisid?'],
        ['Nad tulid Narvast.', 'Kust nad …?', 'Kust nad tulid?'],
        ['Me käisime Lennusadamas eelmisel nädalal.', 'Millal te …?', 'Millal te Lennusadamas käisite?|Millal te käisite Lennusadamas?|Millal te käisite?'],
        ['Ma sõitsin Pärnusse vanematega.', 'Kellega sa …?', 'Kellega sa Pärnusse sõitsid?|Kellega sa sõitsid Pärnusse?|Kellega sa sõitsid?'],
        ['Ma soovitan Kadriorgu.', 'Mida sa …?', 'Mida sa soovitad?'],
        ['Jah, ma olen Narva linnuses käinud.', 'Kas sa …?', 'Kas sa oled Narva linnuses käinud?|Kas sa oled kunagi Narva linnuses käinud?'],
        ['Ma ei tulnud, sest olin haige.', 'Miks sa …?', 'Miks sa ei tulnud?'],
      ], 'full', 'g_kysimus'),
      B.reading('kt01_p_trip', 'Lugu reisist.', 'Loe lugu reisist. Vasta küsimustele lühidalt.', 'Reis Narva', [
        'Eelmisel suvel sõitsin isaga rongiga Tallinnast Narva. Sõit kestis peaaegu kolm tundi. Narvas elab minu vanaema. Ma olen Narvas mitu korda käinud, aga seekord käisime esimest korda Narva linnuses.',
        '',
        'Linnus on väga vana ja suur. Me ronisime Hermanni torni. Tornist nägime jõge ja teisel pool jõge Venemaad. Linnuse hoovis olid käsitööliste töökojad ja laste jaoks oli seal mänguväljak.',
        '',
        'Õhtul sõime vanaema juures pelmeene ja jõime teed. Järgmisel päeval jalutasime Narva jõe promenaadil. Pühapäeva õhtul tulime Narvast koju. Ma soovitan Narva linnust kõigile. Järgmine kord tahan minna Narva-Jõesuu randa.',
      ], [
        ['Kellega kirjutaja Narva sõitis?', 'isaga|ta sõitis isaga|isaga rongiga'],
        ['Kui kaua sõit kestis?', 'peaaegu kolm tundi|kolm tundi|3 tundi|peaaegu 3 tundi'],
        ['Kus nad seekord esimest korda käisid?', 'Narva linnuses|linnuses'],
        ['Mida nad tornist nägid?', 'jõge ja Venemaad|jõge|Venemaad|jõge ja teisel pool jõge Venemaad'],
        ['Kelle jaoks oli linnuses mänguväljak?', 'laste jaoks|lastele|laste'],
        ['Kuhu kirjutaja tahab järgmine kord minna?', 'Narva-Jõesuu randa|Narva-Jõesuu rannasse|randa'],
      ], 'g_read'),
      B.writing('kt01_p_write', 'Minu reis.', 'Kirjuta 6–8 lauset oma reisist. Kasuta lihtminevikku ja täisminevikku.', [6, 8], ['läksin', 'käisin', 'nägin', 'tulin', 'olen käinud', 'ei ole käinud', 'soovitan'], 3),
    ],
    transfer: [
      B.text('kt01_t_intro', 'Proovitöö: Kontrolltöö nr 1', 'Aega 35–40 minutit. Tee üksi, ilma vihiku ja õpikuta. Ülesandeid on 6, igas 8 punkti, kokku 48 punkti: iga õige vastus annab 1 punkti. Hinne: 43–48 p „5”, 36–42 p „4”, 24–35 p „3”, 10–23 p „2”, 0–9 p „1”.'),
      B.gaps('kt01_t_past', 'Lihtminevik ja eitus (8 p).', 'Kirjuta sulgudes olev tegusõna lihtminevikus. Pärast „ei” tuleb -nud-vorm.', [
        'Eelmisel laupäeval me [sõitsime] (sõitma) bussiga Tallinna.',
        'Kõigepealt ma [läksin] (minema) sõbraga vanalinna.',
        'Raekoja platsil me [nägime] (nägema) palju turiste.',
        'Lõunaks ma [sõin] (sööma) kohvikus suppi.',
        'Giid [tegi] (tegema) meile Toompeal ekskursiooni.',
        'Kumus me ei [käinud] (käima), sest aega ei olnud.',
        'Mu sõber ei [joonud] (jooma) kohvikus midagi.',
        'Nad ei [tulnud] (tulema) Tallinnast koju enne kella kaheksat.',
      ], '', 'full', 'g_minevik'),
      B.choice('kt01_t_tense', 'Lihtminevik või täisminevik? (8 p)', 'Vali õige vorm. Vaata ajasõna.', [
        ['Eile ma … Kadriorus.', 'käisin', 'olen käinud', 'käinud'],
        ['Kas sa … kunagi Saaremaal käinud?', 'oled', 'olid', 'on'],
        ['Ma ei … veel Teletornis käinud.', 'ole', 'olnud', 'olen'],
        ['2022. aastal me … Pärnus.', 'olime', 'oleme olnud', 'oleme'],
        ['Ma olen seda filmi juba kaks korda …', 'näinud', 'nägin', 'näen'],
        ['Eelmisel nädalal nad … Lennusadamasse.', 'läksid', 'on läinud', 'läinud'],
        ['Minu vend ei ole kunagi Narvas …', 'käinud', 'käis', 'käima'],
        ['Laupäeval me ei … Toompeal, sest sadas vihma.', 'käinud', 'käisime', 'ole käinud'],
      ], 'full', 'g_minevik'),
      B.table('kt01_t_plural', 'Mitmuse omastav (8 p).', 'Kirjuta mitmuse omastav (kelle? mille?). Näide: maja (osastav maja) → majade.', 'Ainsuse nimetav, Ainsuse osastav (mida?), Mitmuse omastav', [
        'linn | linna | [linnade]',
        'kool | kooli | [koolide]',
        'laps | last | [laste]',
        'turist | turisti | [turistide]',
        'kirik | kirikut | [kirikute]',
        'inimene | inimest | [inimeste]',
        'muuseum | muuseumi | [muuseumide/muuseumite]',
        'tänav | tänavat | [tänavate]',
      ], 'g_omastav'),
      B.gaps('kt01_t_sights', 'Vaatamisväärsused (8 p).', 'Kirjuta sõna õiges vormis. Sõna ja küsimus on sulgudes.', [
        'Homme lähen ma [Teletorni|Teletornisse] (Teletorn — kuhu?).',
        'Eile käisime klassiga [Toompeal] (Toompea — kus?).',
        'Mu sõber tuli just [Tartust] (Tartu — kust?).',
        'Ma soovitan sulle [Lennusadamat] (Lennusadam — mida?).',
        'Suvel sõidame [Saaremaale] (Saaremaa — kuhu?).',
        'Kas sa oled [Kadriorus] (Kadriorg — kus?) käinud?',
        'Turistid tulevad Raekoja [platsilt] (plats — kust?).',
        'Õpetaja soovitab [Toomemäge] (Toomemägi — mida?).',
      ], '', 'full', 'g_koht'),
      B.cloze('kt01_t_card', 'Postkaart (8 p).', 'Loe postkaarti. Vali igasse lünka sobiv vorm.', 'Tervitused Tartust!', [
        'Tere, Mari!',
        '',
        'Me oleme juba kaks päeva {*Tartus|Tartusse|Tartust}. Eile {*käisime|käime|oleme käinud} Eesti Rahva Muuseumis. Muuseum on väga suur ja moodne. Muuseumi kõrval on suur park ja {*laste|lapsed|lapsi} mänguväljak. Õhtul sõime ühes kohvikus pitsat.',
        '',
        'Täna hommikul oli ilm külm, aga päike paistis. Me ronisime {*Toomemäele|Toomemäel|Toomemäelt}. Seal on Toomkiriku varemed ja palju vanu puid. Ma {*ei ole|ei|olen} kunagi nii ilusat parki näinud! Pärast lõunat jalutasime vanade {*majade|majad|maju} vahel.',
        '',
        'Tartu on väga tore ja rahulik linn. Homme sõidame {*Tartust|Tartus|Tartusse} koju. Ma soovitan sulle {*AHHAA keskust|AHHAA keskuses|AHHAA keskusesse}, seal on väga lahe!',
        '',
        'Kallistan, Kati',
      ], 'g_koht'),
      B.transformation('kt01_t_ask', 'Kirjuta küsimus (8 p).', 'Kirjuta küsimus, millele lause vastab. Küsimuse algus on antud.', [
        ['Jah, ma käisin eelmisel nädalal Teletornis.', 'Kas sa …?', 'Kas sa käisid eelmisel nädalal Teletornis?|Kas sa eelmisel nädalal käisid Teletornis?|Kas sa käisid Teletornis?'],
        ['Jah, ma olen Saaremaal käinud.', 'Kas sa …?', 'Kas sa oled Saaremaal käinud?|Kas sa oled kunagi Saaremaal käinud?'],
        ['Me läksime pärast tunde Toompeale.', 'Kuhu te …?', 'Kuhu te pärast tunde läksite?|Kuhu te läksite pärast tunde?|Kuhu te läksite?'],
        ['Ma nägin Lennusadamas allveelaeva.', 'Mida sa …?', 'Mida sa Lennusadamas nägid?|Mida sa nägid Lennusadamas?|Mida sa nägid?'],
        ['Nad tulid Tartust eile õhtul.', 'Millal nad …?', 'Millal nad Tartust tulid?|Millal nad tulid Tartust?|Millal nad tulid?'],
        ['Ma käisin laupäeval Kumus.', 'Kus sa …?', 'Kus sa laupäeval käisid?|Kus sa käisid laupäeval?|Kus sa käisid?'],
        ['Ma sõitsin Narva oma vanaemaga.', 'Kellega sa …?', 'Kellega sa Narva sõitsid?|Kellega sa sõitsid Narva?|Kellega sa sõitsid?'],
        ['Ma jäin koju, sest ilm oli halb.', 'Miks sa …?', 'Miks sa koju jäid?|Miks sa jäid koju?'],
      ], 'full', 'g_kysimus'),
    ],
  },
};

// Why each answer is right: the learner sees it after hand-in (engine/mistakes.js), the teacher in the key. One line per
// key item, in the order the key lists them (courseSheet.js withExplanations; kontrolltoo.test.js checks the count).
const PAST = (why) => `lihtminevik: ${why}`;
const PERF = (why) => `täisminevik: ${why}`;
const GEN = (why) => `mitmuse omastav: ${why}`;
const PLACE = (why) => `koht: ${why}`;
const Q = (why) => `küsimus: ${why}`;
export const EXPLAIN = {
  kt01_d_text: [
    'sõitsime Tallinna — kuhu? lühike vorm Tallinna (ka Tallinnasse)',
    'Raekoja platsil — kus? plats on lahtine koht: -l',
    'nägime (mida?) vana allveelaeva — osastav',
    'ei ole veel käinud Teletornis — käima kus? -s',
    'soovitab (mida?) Teletorni ja Kadriorgu — osastav',
  ],
  kt01_d_t1: [
    PAST('tavaline tegusõna: -sin, -s, -sid; eitus ei elanud'), PAST('tüvi lõpeb kaashäälikuga: ta sõitis; eitus ei sõitnud'),
    PAST('käima on tavaline: ta käis; eitus ei + -nud: ei käinud'), PAST('olema on erand: olin, oli; ei olnud'),
    PAST('minema on erand: läksin, nad läksid; ei läinud'), PAST('tulema on erand, ilma -s-: ma tulin; ei tulnud'),
    PAST('tegema on erand: tegin, tegi; ei teinud'), PAST('nägema on erand: ta nägi; ei näinud'),
    PAST('sööma on erand: sõin, sõi; eitus ei söönud'), PAST('jooma on erand: ma jõin; ei joonud'),
  ],
  kt01_d_t2: [
    PERF('olen + -nud; eitus ei ole + -nud'), PERF('ta on näinud; ta ei ole näinud'), PERF('eitus ei ole + -nud: me ei ole söönud'),
    PERF('eitus ei ole + -nud: nad ei ole läinud'), PERF('olema + -nud: sa oled olnud'),
  ],
  kt01_d_t3: [
    GEN('osastav maja (täishäälik) + de → majade'), GEN('osastav muuseumi (täishäälik) + de → muuseumide'), GEN('osastav maad (-d) + e → maade'),
    GEN('osastav last (-t) + e → laste'), GEN('osastav turisti (täishäälik) + de → turistide'), GEN('osastav kirikut (-t) + e → kirikute'),
    GEN('osastav linna (täishäälik) + de → linnade'),
  ],
  kt01_d_t4: [
    PLACE('vanalinn: -sse / -s / -st; lühike vorm vanalinna'), PLACE('plats on lahtine koht: -le / -l / -lt'), PLACE('Toompea on mägi: -le / -l / -lt; osastav Toompead'),
    PLACE('Kadriorg → Kadriorgu, Kadriorus, Kadriorust (g kaob)'), PLACE('Teletorn: lühike vorm Teletorni'), PLACE('Lennusadam: -sse / -s / -st; osastav Lennusadamat'),
    PLACE('mägi → mäe: Toomemäele, Toomemäel, Toomemäelt; osastav Toomemäge'), PLACE('ERM: lühend + sidekriips + lõpp: ERM-is'),
    PLACE('kust? linnus → linnusest; soovitan mida? osastav → Narva linnust'), PLACE('kus? rand → rannas; soovitan mida? osastav → randa'),
  ],
  kt01_d_t5: [
    Q('kes? küsib inimest (alus)'), Q('mis? küsib asja (nimetav)'), Q('mida? küsib sihitist (osastav)'), Q('kus? vastus -s / -l'), Q('kuhu? vastus -sse / -le'),
    Q('kust? vastus -st / -lt'), Q('millal? vastus on aeg'), Q('miks? vastus algab „sest”'), Q('kellega? vastus -ga'),
  ],
  kt01_d_check1: [
    PAST('eile → lihtminevik, ma-vorm: käisin'), PAST('pärast „ei” tuleb -nud: ei läinud'), PERF('kunagi → täisminevik: sa oled käinud'),
    PERF('eitus: ma ei ole käinud'), PAST('eelmisel suvel = aeg on teada → olime'), GEN('kaassõna vahel: kelle? mille? → majade vahel'),
    GEN('arvu järel on ainsuse osastav: kaks saali'), GEN('kaassõna jaoks: last + e → laste jaoks'),
  ],
  kt01_d_check2: [
    PLACE('lähen kuhu? Toompea on mägi: -le → Toompeale'), PLACE('soovitan mida? osastav: Lennusadamat'), PLACE('käisime kus? → Kadriorus'),
    PLACE('tuleb kust? → Narvast'), Q('Narvast = kust?'), Q('vanematega = kellega?'), Q('Teletornis = kus?'), Q('sest … = miks?'),
  ],
  kt01_p_forms: [
    PAST('minema → ma läksin'), PAST('tulema → me tulime (erand, ilma -s-)'), PAST('olema → nad olid (erand)'), PAST('sööma → ta sõi (erand)'),
    PAST('käima → te käisite (tavaline -si-)'), PAST('sõitma: tüvi lõpeb kaashäälikuga → ta sõitis'),
    PAST('eitus: ei + -nud → ei teinud'), PAST('eitus: jooma → ei joonud'),
  ],
  kt01_p_tense: [
    PAST('eelmisel suvel = aeg on teada → lihtminevik'), PERF('kunagi = kogemus → täisminevik'), PAST('eile õhtul → lihtminevik'),
    PERF('veel (mitte) → täisminevik: ei ole käinud'), PAST('2023. aastal = aeg on teada → lihtminevik'), PERF('olen … juba kaks korda → täisminevik: käinud'),
    PAST('laupäeval → lihtminevik'), PERF('kunagi + praegu tahab minna → täisminevik: ei ole käinud'),
  ],
  kt01_p_plural: [
    GEN('ääres: tänavat (-t) + e → tänavate'), GEN('vahel: maja (täishäälik) + de → majade'), GEN('seas: turisti + de → turistide'),
    GEN('jaoks: last (-t) + e → laste'), GEN('kelle? mille? tornid: kirikut + e → kirikute'), GEN('ajaloost: linnust + e → linnuste'),
    GEN('lossi (täishäälik) + de → losside'), GEN('jaoks: sõpra + de → sõprade'),
  ],
  kt01_p_sort: [
    ...['Toompeale (-le)', 'Tartusse (-sse)', 'Lennusadamasse (-sse)', 'Saaremaale (-le)'].map((f) => PLACE(`${f} vastab küsimusele kuhu?`)),
    ...['Teletornis (-s)', 'Toomemäel (-l)', 'Narvas (-s)', 'Raekoja platsil (-l)'].map((f) => PLACE(`${f} vastab küsimusele kus?`)),
    ...['Tartust (-st)', 'Pärnu rannast (-st)', 'Toompealt (-lt)', 'Kumust (-st)'].map((f) => PLACE(`${f} vastab küsimusele kust?`)),
    ...['Lennusadamat', 'Narva linnust', 'Toomemäge', 'AHHAA keskust'].map((f) => PLACE(`${f} on osastav: soovitan mida?`)),
  ],
  kt01_p_chat: [
    PLACE('sõitsime kuhu? → Tartusse'), PLACE('käisime kus? → muuseumis'), PLACE('läksime kuhu? mägi: -le → Toomemäele'), PLACE('ei ole käinud kus? → Tartus'),
    PLACE('soovitan mida? osastav → AHHAA keskust'), PLACE('tuleb kust? → Narvast'), PLACE('soovita mida? osastav → Lennusadamat'), PLACE('minge kuhu? lühike vorm → Kadriorgu'),
  ],
  kt01_p_ask: [
    Q('Toompeale = kuhu?; küsisõna alguses, tegusõna samas ajas: läksite'), Q('Teletornis = kus?; käisid'), Q('Narvast = kust?; tulid'),
    Q('eelmisel nädalal = millal?; käisite'), Q('vanematega = kellega?; sõitsid'), Q('Kadriorgu (soovitan mida?) → mida?'),
    Q('jah-vastus → kas-küsimus; täisminevik: oled käinud'), Q('sest … = miks?; eitus jääb: ei tulnud'),
  ],
  kt01_p_trip: [
    'sõitsin isaga — kellega? -ga', 'kestis peaaegu kolm tundi', 'käisime (kus?) Narva linnuses — -s',
    'nägime (mida?) jõge ja Venemaad — osastav', 'laste jaoks — mitmuse omastav + jaoks', 'tahan minna (kuhu?) Narva-Jõesuu randa',
  ],
  kt01_t_past: [
    PAST('me → -sime: sõitsime'), PAST('minema → ma läksin'), PAST('nägema → me nägime (erand)'), PAST('sööma → ma sõin (erand)'),
    PAST('tegema → ta tegi (erand)'), PAST('pärast „ei” tuleb -nud: ei käinud'), PAST('pärast „ei” tuleb -nud: jooma → ei joonud'), PAST('pärast „ei” tuleb -nud: tulema → ei tulnud'),
  ],
  kt01_t_tense: [
    PAST('eile → lihtminevik'), PERF('kunagi → täisminevik: oled käinud'), PERF('veel (mitte) → ei ole käinud'), PAST('2022. aastal → lihtminevik'),
    PERF('olen … juba → -nud: näinud'), PAST('eelmisel nädalal → lihtminevik: läksid'), PERF('ei ole kunagi + -nud: käinud'), PAST('laupäeval → lihtmineviku eitus: ei käinud'),
  ],
  kt01_t_plural: [
    GEN('linna + de → linnade'), GEN('kooli + de → koolide'), GEN('last + e → laste'), GEN('turisti + de → turistide'), GEN('kirikut + e → kirikute'),
    GEN('inimest + e → inimeste'), GEN('muuseumi + de → muuseumide'), GEN('tänavat + e → tänavate'),
  ],
  kt01_t_sights: [
    PLACE('lähen kuhu? → Teletorni (ka Teletornisse)'), PLACE('käisime kus? mägi: -l → Toompeal'), PLACE('tuli kust? → Tartust'), PLACE('soovitan mida? osastav → Lennusadamat'),
    PLACE('sõidame kuhu? saar: -le → Saaremaale'), PLACE('käinud kus? → Kadriorus'), PLACE('tulevad kust? plats: -lt → platsilt'), PLACE('soovitab mida? osastav → Toomemäge'),
  ],
  kt01_t_card: [
    PLACE('oleme kus? → Tartus'), PAST('eile → lihtminevik: käisime'), GEN('kelle? mänguväljak → laste'), PLACE('ronisime kuhu? mägi: -le → Toomemäele'),
    PERF('kunagi → täisminevik, eitus: ei ole näinud'), GEN('vahel: kelle? mille? → majade'), PLACE('sõidame kust? → Tartust'), PLACE('soovitan mida? osastav → AHHAA keskust'),
  ],
  kt01_t_ask: [
    Q('jah-vastus → kas-küsimus: Kas sa käisid …?'), Q('jah-vastus täisminevikus → Kas sa oled … käinud?'), Q('Toompeale = kuhu?; läksite'),
    Q('allveelaeva (osastav) = mida?; nägid'), Q('eile õhtul = millal?; tulid'), Q('Kumus = kus?; käisid'),
    Q('vanaemaga = kellega?; sõitsid'), Q('sest … = miks?; jääma → sa jäid'),
  ],
};
