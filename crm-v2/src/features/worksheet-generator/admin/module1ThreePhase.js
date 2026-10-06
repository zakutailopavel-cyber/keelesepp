const MODULE = 'A2 lähtepunkt ja igapäevaelu';

const phaseMeta = Object.freeze({
  discover: { label: '1 Avasta', subtitle: 'Avasta teema kontekstis ja märka keelemustrit.' },
  practice: { label: '2 Harjuta', subtitle: 'Harjuta sihtvorme täpselt ja eri tüüpi ülesannetes.' },
  transfer: { label: '3 Kasuta', subtitle: 'Kasuta õpitut uues olukorras iseseisvalt.' },
});

const block = (id, type, tone, goal, data, width = 'full') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const vocab = (id, title, words, goal = 'g_vocab', width = 'full') =>
  block(id, 'vocab', 'cream', goal, { title, words, columns: '2' }, width);
const notice = (id, title, lines, goal = 'g_notice', width = 'half') =>
  block(id, 'notice', 'white', goal, { title, lines }, width);
const tip = (id, title, text, width = 'half') =>
  block(id, 'tip', 'white', '', { title, text }, width);
const choice = (id, title, instruction, questions, goal = 'g_read', width = 'half') =>
  block(id, 'choice', 'sky', goal, { title, instruction, questions }, width);
const gaps = (id, title, instruction, sentences, bank = '', showBank = 'no', goal = 'g_use', width = 'full') =>
  block(id, 'gaps', 'blue', goal, { title, instruction, sentences, bank, showBank }, width);
const reading = (id, title, passageTitle, passage, questions, goal = 'g_read') =>
  block(id, 'reading', 'cream', goal, { title, instruction: 'Loe tekst tervikuna. Seejärel vasta küsimustele oma sõnadega.', passageTitle, passage, questions, lineWidth: 'wide' }, 'full');
const speaking = (id, title, instruction, questions, minSec, maxSec, tipText = '', goal = 'g_use') =>
  block(id, 'speaking', 'green', goal, { title, instruction, questions, img: null, aspect: '4:3', bubble: '', tipTitle: tipText ? 'Kasuta:' : '', tipText, minSec, maxSec }, 'full');
const writing = (id, title, instruction, minSent, maxSent, keywords = '', minKeywords = 0, goal = 'g_use') =>
  block(id, 'writing', 'cream', goal, { title, instruction, lines: Math.max(7, maxSent), minSent, maxSent, keywords, minKeywords, img: null }, 'full');
const selfcheck = (id, items, stamp) =>
  block(id, 'selfcheck', 'sky', '', { title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '', items, stamp }, 'full');
const categorize = (id, title, instruction, groups, goal = 'g_use', width = 'full') =>
  block(id, 'categorize', 'peach', goal, { title, instruction, groups }, width);
const wordorder = (id, title, instruction, sentences, goal = 'g_use', width = 'full') =>
  block(id, 'wordorder', 'sky', goal, { title, instruction, sentences }, width);
const table = (id, title, instruction, headers, rows, goal = 'g_use') =>
  block(id, 'table', 'blue', goal, { title, instruction, headers, rows }, 'full');
const errorfix = (id, title, instruction, rows, goal = 'g_use', width = 'full') =>
  block(id, 'errorfix', 'peach', goal, { title, instruction, rows }, width);
const dialogue = (id, title, instruction, speakerA, speakerB, lines, goal = 'g_use') =>
  block(id, 'dialogue', 'green', goal, { title, instruction, speakerA, speakerB, lines }, 'full');
const match = (id, title, instruction, pairs, goal = 'g_vocab', width = 'full') =>
  block(id, 'match', 'peach', goal, { title, instruction, pairs }, width);
const clock = (id, title, instruction, items, goal = 'g_use') =>
  block(id, 'clock', 'blue', goal, { title, instruction, columns: '3', items }, 'full');

const CORE = {
  verbsA: [
    'ärkama – ärgata – ärkan — просыпаться',
    'tõusma – tõusta – tõusen — вставать',
    'sööma – süüa – söön — есть',
    'jooma – juua – joon — пить',
    'minema – minna – lähen — идти',
    'tulema – tulla – tulen — приходить',
  ].join(', '),
  verbsB: [
    'töötama – töötada – töötan — работать',
    'õppima – õppida – õpin — учиться',
    'puhkama – puhata – puhkan — отдыхать',
    'lugema – lugeda – loen — читать',
    'vaatama – vaadata – vaatan — смотреть',
    'kohtuma – kohtuda – kohtun — встречаться',
  ].join(', '),
  time: 'hommikul — утром, päeval — днём, õhtul — вечером, enne — до, pärast — после, siis — затем',
  freq: 'alati — всегда, tavaliselt — обычно, sageli — часто, mõnikord — иногда, harva — редко, mitte kunagi — никогда',
};

const baseMeta = {
  module: MODULE,
  level: 'A2',
  goals: {
    g_vocab: 'Õpilane kasutab mooduli põhivara korduvates igapäevaelu olukordades.',
    g_read: 'Õpilane mõistab tuttava igapäevateksti põhiideed, detaile ja lihtsaid põhjuseid.',
    g_notice: 'Õpilane märkab oleviku, ajamarkerite, sageduse ja lihtsa lausejärje põhimustreid.',
    g_use: 'Õpilane kasutab sihtkeelt lühikeses seotud kõnes ja kirjas.',
  },
};

const spec = {
  'a2b1-001': {
    title: 'A2 lähtediagnostika',
    canDo: 'Ma näitan, mida oskan igapäevaelu teemal juba iseseisvalt kasutada.',
    discover: [
      choice('001_d_start', 'Kiire enesehinnang', 'Vali vastus. See ei ole test, vaid lähtepunkt.', [
        { q: 'Kui lihtsalt räägid oma tavalisest päevast 5–6 lausega?', options: '*saan enamasti hakkama\nvajan mõnikord abi\nsee on praegu raske' },
        { q: 'Kas oskad küsida kellaaega ja vastata?', options: '*jah\nosaliselt\nveel mitte' },
        { q: 'Kas kasutad sõnu tavaliselt, sageli, mõnikord?', options: '*jah\nmõnda neist\npeaaegu mitte' },
        { q: 'Kas oskad öelda, mida tegid eile?', options: '*jah\nosaliselt\nveel mitte' },
        { q: 'Kas oskad kirjutada 5–6 seotud lauset endast?', options: '*jah\nosaliselt\nveel mitte' },
      ], 'g_read'),
      vocab('001_d_vocab', 'Põhisõnavara: 3 vormi + tõlge', `${CORE.verbsA}, ${CORE.verbsB}`),
      reading('001_d_read', 'Loe ja mõtle, mida tekst ütleb inimese harjumuste kohta.', 'Tavaline tööpäev',
        'Marta elab Tallinnas ja töötab väikeses kontoris. Tööpäevadel {{ärkab}} ta tavaliselt kell seitse. Kõigepealt joob ta vett ja sööb hommikusööki. Seejärel {{läheb}} ta bussiga tööle. Kontoris {{töötab}} Marta kella üheksast viieni. Lõuna ajal sööb ta kolleegidega ja mõnikord jalutab veidi. Pärast tööd {{tuleb}} ta koju, kuid kaks korda nädalas läheb ta trenni. Õhtul {{puhkab}} Marta tavaliselt kodus, loeb või vaatab filmi. Ta ütleb, et kiiretel päevadel on kõige raskem leida aega puhkamiseks. Nädalavahetusel kohtub ta sõpradega või külastab vanemaid.',
        'Mis on Marta päeva peamine rütm? [ta töötab päeval ja puhkab õhtul|töö päeval ja puhkus õhtul]\nMilline detail näitab, et kõik tööpäevad ei ole ühesugused? [mõnikord jalutab ja kaks korda nädalas läheb trenni|ta mõnikord jalutab või läheb trenni]\nMiks võib Marta õhtul kodus puhata? [päev võib olla kiire|tal on kiire tööpäev]\nKuidas erineb nädalavahetus tema tavalisest tööpäevast?\nMilline harjumus aitaks sinu arvates Martal paremini puhata?'),
      notice('001_d_notice', 'Keelemuster', 'Hommikul ärkan kell seitse.\nMa tavaliselt töötan päeval.\nPärast tööd lähen koju.\nÕhtul puhkan kodus.', 'g_notice', 'half'),
      tip('001_d_tip', 'Vihje: vasta täislausega', 'Ära vasta ainult ühe sõnaga. Lisa vähemalt tegevus + aeg või koht.', 'half'),
      table('001_d_table', 'Näita, milliseid vorme juba oskad.', 'Täida puuduvad vormid.', 'Tegusõna, da-vorm, mina-vorm', 'ärkama | [ärgata] | [ärkan]\nminema | [minna] | [lähen]\ntulema | [tulla] | [tulen]\nsööma | [süüa] | [söön]'),
      writing('001_d_write', 'Kirjuta endast.', 'Kirjuta 6–8 lauset oma tavalisest päevast. Kasuta vähemalt kolme ajamarkerit.', 6, 8, 'hommikul, tavaliselt, pärast, õhtul', 3),
      selfcheck('001_d_self', 'Ma sain tekstist põhiinfo aru.\nMa oskan kirjeldada oma päeva mitme lausega.\nMa tunnen osa põhisõnavarast kolmes vormis.\nMa tean, mida tahan esimesena parandada.\nMinu järgmine samm on selge.', 'Lähtepunkt on teada!'),
    ],
  },
  'a2b1-002': {
    title: 'Minu päev ja kellaaeg',
    canDo: 'Ma räägin oma tavalisest päevast 1,5–2 minutit ja kasutan vähemalt viit ajamarkerit.',
    discover: [
      clock('002_d_clock', 'Kellaaeg äratab teema.', 'Kirjuta, mis kell on.', [{ time: '07:00', extra: '' }, { time: '08:30', extra: '' }, { time: '12:00', extra: '' }, { time: '17:30', extra: '' }, { time: '22:00', extra: '' }]),
      vocab('002_d_vocab', 'Päeva tegevused: 3 vormi + tõlge', `${CORE.verbsA}, ${CORE.verbsB}, ${CORE.time}`),
      reading('002_d_read', 'Leia päeva loogika, mitte ainult kellaaegu.', 'Päev, mis ei ole päris ühesugune',
        'Riin {{ärkab}} tööpäevadel tavaliselt kell 6.45, kuid reedeti lubab ta endale kümme minutit rohkem und. Hommikul {{joob}} ta kõigepealt vett ja siis {{sööb}} hommikusööki. Kell 7.40 {{läheb}} Riin kodust välja. Ta {{töötab}} haiglas ja tema vahetus algab kell 8.30. Lõuna ajal sööb ta tavaliselt kolleegidega, aga kiirel päeval teeb ainult lühikese pausi. Pärast tööd {{tuleb}} Riin koju või läheb otse trenni. Õhtul {{puhkab}} ta, valmistab järgmise päeva asjad ette ja loeb natuke. Ta ütleb, et kõige olulisem on mitte teha kõiki õhtuseid tegevusi liiga hilja, sest siis on hommikul raskem ärgata.',
        'Milline osa Riini hommikust on peaaegu alati sama? [ta joob vett ja sööb hommikusööki|vesi ja hommikusöök]\nKuidas reede erineb teistest tööpäevadest? [ta magab kümme minutit kauem]\nMiks võib Riini lõunapaus mõnel päeval olla lühem? [päev on kiire|kiire tööpäeva tõttu]\nMilline harjumus aitab tal järgmist hommikut lihtsamaks teha?\nMis võiks juhtuda, kui ta teeb kõik õhtused tegevused väga hilja?'),
      notice('002_d_notice', 'Ajamäärus aitab kuulajal järge hoida.', 'Hommikul ärkan kell seitse.\nPärast hommikusööki lähen tööle.\nLõuna ajal teen pausi.\nÕhtul puhkan kodus.', 'g_notice', 'half'),
      tip('002_d_forms', 'Korduv sõnavara', 'ärkama – ärgata – ärkan — просыпаться\nminema – minna – lähen — идти\npuhkama – puhata – puhkan — отдыхать', 'half'),
      wordorder('002_d_order', 'Ehita selge lause.', 'Pane sõnad õigesse järjekorda.', 'Hommikul ärkan ma tavaliselt kell seitse.\nPärast hommikusööki lähen ma tööle.\nÕhtul puhkan ma kodus ja loen natuke.'),
      speaking('002_d_speak', 'Räägi oma päevast.', 'Räägi 1–2 minutit. Ära loe valmis teksti.', 'Mis kell ärkad?\nMida teed enne tööle või kooli minekut?\nMida teed lõuna ajal?\nMida teed pärast tööd?\nMida teed õhtul?', 80, 130, 'hommikul · enne · pärast · õhtul · siis'),
      selfcheck('002_d_self', 'Ma oskan öelda vähemalt viis kellaaega.\nMa kasutan vähemalt viit ajamarkerit.\nMa oskan päeva tegevusi järjekorda panna.\nMa kasutan tuttavaid verbe olevikus.', 'Päev on järjestatud!'),
    ],
  },
  'a2b1-003': {
    title: 'Sagedus ja lihtne lausejärg',
    canDo: 'Ma kasutan sagedussõnu ja hoian lihtlauses loomuliku sõnajärje.',
    discover: [
      categorize('003_d_scale', 'Sageduse skaala.', 'Paiguta väljendid tugevuse järgi.', [
        { name: '100–80%', words: 'alati, peaaegu alati' },
        { name: '70–40%', words: 'tavaliselt, sageli' },
        { name: '30–10%', words: 'mõnikord, harva' },
        { name: '0%', words: 'mitte kunagi' },
      ]),
      vocab('003_d_vocab', 'Korduv tegevus + sagedus', `${CORE.verbsB}, ${CORE.freq}`),
      reading('003_d_read', 'Loe ja tee järeldusi harjumuste kohta.', 'Kolm erinevat rutiini',
        'Kolm kolleegi räägivad pausil oma argipäevast. Marko {{töötab}} kodus ja {{joob}} tavaliselt hommikul kaks tassi kohvi. Ta {{läheb}} harva lõuna ajal välja, sest teeb enamasti ise süüa. Liisa {{töötab}} kontoris. Ta sõidab sageli bussiga, kuid hea ilmaga läheb mõnikord jala. Õhtuti {{loeb}} Liisa peaaegu alati enne magamaminekut. Sergei töötab vahetustega. Ta ei söö hommikusööki alati samal ajal ja kohtub sõpradega tööpäevadel harva. Nädalavahetusel teeb ta seda sagedamini. Kõigil kolmel on erinev päevakava, kuid nad ütlevad, et väikesed harjumused aitavad päeva paremini korraldada.',
        'Kes teeb lõunasöögi kõige tõenäolisemalt ise? [Marko]\nKelle transpordivalik sõltub ilmast? [Liisa]\nMiks ei ole Sergei hommikusöögi aeg alati sama? [ta töötab vahetustega|vahetustega töö tõttu]\nKes näib kasutavat kõige regulaarsemat õhtuharjumust? [Liisa]\nMilline väide sobib kõigi kolme kohta kõige paremini?'),
      notice('003_d_notice', 'Sagedussõna koht lauses', 'Ma tavaliselt töötan kodus.\nÕhtul loen ma sageli.\nMa ei käi peaaegu kunagi taksoga.\nNädalavahetusel kohtun sõpradega sagedamini.', 'g_notice', 'half'),
      tip('003_d_tip', 'Ära mõtle ainult protsendile', 'Sagedussõna peab sobima päris olukorda. Küsi endalt: kui tihti see tegelikult juhtub?', 'half'),
      wordorder('003_d_order', 'Taasta loomulik sõnajärg.', 'Pane sõnad õigesse järjekorda.', 'Ma tavaliselt joon hommikul kohvi.\nÕhtul ma sageli loen.\nNädalavahetusel kohtun ma mõnikord sõpradega.\nMa ei vaata peaaegu kunagi televiisorit hommikul.'),
      speaking('003_d_speak', 'Võrdle oma harjumusi.', 'Räägi vähemalt 90 sekundit.', 'Mida teed alati?\nMida teed tavaliselt?\nMida teed sageli?\nMida teed harva?\nMida ei tee peaaegu kunagi?', 90, 140, 'alati · tavaliselt · sageli · mõnikord · harva'),
      selfcheck('003_d_self', 'Ma eristan sagedussõnade tugevust.\nMa panen sagedussõna lausesse loomulikult.\nMa oskan võrrelda oma harjumusi.\nMa kasutan tuttavaid tegevusverbe uuesti.', 'Sagedus on kontrolli all!'),
    ],
  },
  'a2b1-004': {
    title: 'Minu nädal',
    canDo: 'Ma räägin oma nädalast 6–8 seotud lausega ja võrdlen tööpäeva nädalavahetusega.',
    discover: [
      vocab('004_d_vocab', 'Nädala tegevused: kordus + uued sidujad', `${CORE.verbsB}, ${CORE.time}, esmaspäeval — в понедельник, tööpäeval — в будний день, nädalavahetusel — на выходных`),
      choice('004_d_predict', 'Milline nädal tundub tasakaalus?', 'Vali parim selgitus.', [
        { q: 'Inimene töötab viis päeva ja ei puhka üldse. Mis võib olla probleem?', options: '*Tal võib olla raske taastuda.\nTal on kindlasti liiga palju vaba aega.\nNädal muutub lühemaks.' },
        { q: 'Kui trenn on teisipäeval ja neljapäeval, kui sageli see nädalas toimub?', options: '*kaks korda\niga päev\nmitte kunagi' },
        { q: 'Mis aitab nädalast rääkida sidusalt?', options: '*päevad + siis/pärast seda/aga\nainult tegevuste nimekiri\nainult kellaaeg' },
        { q: 'Miks võib nädalavahetus erineda tööpäevast?', options: '*kohustusi ja aega on teisiti\npäevad on lühemad\nkeel muutub' },
        { q: 'Milline vastus on seotud?', options: '*Esmaspäeval töötan kaua, aga teisipäeval lõpetan varem ja siis lähen trenni.\nEsmaspäev. Töö. Trenn.\nTöötan.' },
      ], 'g_read', 'full'),
      reading('004_d_read', 'Loe nädalast kui tervikust.', 'Nädal, kus kõik päevad ei ole ühesugused',
        'Arvo {{töötab}} esmaspäevast reedeni, kuid tema nädal ei ole iga päev sama. Esmaspäeval ja kolmapäeval jääb ta pärast tööd kauemaks kontorisse. Teisipäeval {{läheb}} ta varem koju ja siis trenni. Neljapäeva õhtul {{õpib}} Arvo eesti keelt. Reedel {{kohtub}} ta mõnikord sõpradega, sest järgmisel hommikul ei pea vara tõusma. Nädalavahetusel {{puhkab}} Arvo rohkem, aga teeb ka koduseid asju. Laupäeval käib ta poes ja valmistab järgmiseks nädalaks toitu. Pühapäeval loeb ta, jalutab või külastab vanemaid. Arvo ütleb, et talle meeldib, kui nädalas on nii kindlaid rutiine kui ka natuke vaba ruumi.',
        'Millistel päevadel jääb Arvo kauemaks tööle? [esmaspäeval ja kolmapäeval]\nMilline päev on seotud keeleõppega? [neljapäev]\nMiks võib Arvo reedel sõpradega kohtuda? [järgmisel hommikul ei pea vara tõusma]\nKuidas erineb nädalavahetus tema tööpäevadest?\nMida tähendab tekstis „vaba ruum” Arvo nädalaplaani kohta?'),
      notice('004_d_notice', 'Sidujad teevad nädalast loo.', 'Esmaspäeval töötan kaua, aga teisipäeval lõpetan varem.\nSiis lähen trenni.\nPärast seda tulen koju.\nNädalavahetusel puhkan rohkem.', 'g_notice', 'half'),
      tip('004_d_vocabtip', '3 vormi kordus', 'kohtuma – kohtuda – kohtun — встречаться\npuhkama – puhata – puhkan — отдыхать\nõppima – õppida – õpin — учиться', 'half'),
      categorize('004_d_cat', 'Jaga tegevused nädalaosade järgi.', 'Mõni tegevus võib sobida eri päeva, kuid vali kõige tõenäolisem.', [
        { name: 'Tööpäev', words: 'töötan, õpin, lähen tööle, teen trenni' },
        { name: 'Nädalavahetus', words: 'külastan vanemaid, puhkan kauem, kohtun sõpradega, teen koduseid asju' },
      ]),
      speaking('004_d_speak', 'Räägi oma nädalast.', 'Räägi vähemalt 90 sekundit. Võrdle üht tööpäeva ja nädalavahetust.', 'Mida teed esmaspäeval?\nMillal on sul kõige kiirem päev?\nMillal puhkad rohkem?\nMida teed nädalavahetusel?\nMis on tööpäeva ja nädalavahetuse suurim erinevus?', 90, 150, 'esmaspäeval · siis · pärast seda · aga · nädalavahetusel'),
      selfcheck('004_d_self', 'Ma kasutan nädalapäevi ja sidujaid.\nMa võrdlen tööpäeva ja nädalavahetust.\nMa räägin vähemalt 6 seotud lausega.\nMa kasutan varasemate tundide sõnavara uuesti.', 'Nädal on seotud jutuks!'),
    ],
  },
  'a2b1-005': {
    title: 'Kontroll 1 — igapäevaelu',
    canDo: 'Ma kirjeldan oma igapäevaelu iseseisvalt ning kasutan aega, sagedust ja olevikku piisavalt täpselt.',
    discover: [
      tip('005_d_rules', 'Kontrolltund', 'Selles tunnis uut põhisõnavara ei tule. Kõik ülesanded kasutavad eelmise nelja tunni materjali.', 'full'),
      categorize('005_d_recall', 'Aktiveeri enne kontrolli.', 'Jaga väljendid: tegevus / aeg / sagedus / siduja.', [
        { name: 'Tegevus', words: 'ärkan, töötan, puhkan, kohtun' },
        { name: 'Aeg', words: 'hommikul, pärast tööd, õhtul, nädalavahetusel' },
        { name: 'Sagedus', words: 'tavaliselt, sageli, mõnikord, harva' },
        { name: 'Siduja', words: 'ja, aga, siis, pärast seda' },
      ]),
      reading('005_d_read', 'Loe uus tekst. Küsimused ei korda teksti sõna-sõnalt.', 'Kuidas nädal päriselt välja näeb',
        'Eleri {{töötab}} esmaspäevast reedeni, kuid tema päevad on üsna erinevad. Kahel hommikul nädalas {{läheb}} ta enne tööd ujuma. Teistel päevadel {{ärkab}} ta veidi hiljem ja sööb rahulikult hommikusööki. Tööl teeb Eleri lõunapausi tavaliselt kell üks, kuid koosolekupäevadel sööb ta mõnikord hiljem. Pärast tööd {{tuleb}} ta enamasti koju. Teisipäeval õpib ta eesti keelt ja neljapäeval {{kohtub}} sõbraga. Reedel ei planeeri ta tavaliselt midagi kindlat. Nädalavahetusel {{puhkab}} Eleri rohkem, kuid pühapäeva õhtul vaatab ta järgmise nädala kalendri üle. Ta ütleb, et kindlad harjumused aitavad, aga liiga täpne plaan teeb teda närviliseks.',
        'Millised kaks hommikut erinevad tõenäoliselt teistest? [need hommikud kui ta läheb ujuma|ujumishommikud]\nMiks võib lõunaaeg muutuda? [koosolekute tõttu|koosolekupäevadel sööb hiljem]\nMilline nädalapäev on kõige vähem ette planeeritud? [reede]\nMida saab järeldada Eleri suhtumisest väga täpsesse plaani? [see teeb teda närviliseks|ta ei taha liiga täpset plaani]\nMilline tema harjumus aitab järgmise nädala jaoks valmistuda? [pühapäeva õhtul vaatab kalendri üle]'),
      choice('005_d_check', 'Keelekontroll 1.', 'Vali õige variant.', [
        { q: 'Ma ___ tavaliselt kell seitse.', options: '*ärkan\närkama\närkad' },
        { q: 'Pärast tööd ma ___ koju.', options: '*lähen\nläheb\nminna' },
        { q: 'Ma ___ joon õhtul kohvi, ainult vahel.', options: '*harva\nalati\nmitte kunagi' },
        { q: 'Õhtul ___ ma tavaliselt kodus.', options: '*puhkan\npuhata\npuhkab' },
        { q: 'Esmaspäeval töötan kaua, ___ teisipäeval lõpetan varem.', options: '*aga\npärast\nharva' },
      ], 'g_use', 'full'),
      table('005_d_forms', 'Keelekontroll 2: vormid.', 'Täida puuduvad vormid.', 'ma-vorm, da-vorm, mina-vorm', 'ärkama | [ärgata] | [ärkan]\nminema | [minna] | [lähen]\ntulema | [tulla] | [tulen]\npuhkama | [puhata] | [puhkan]\nkohtuma | [kohtuda] | [kohtun]'),
      speaking('005_d_speak', 'Suuline kontroll.', 'Räägi 2 minutit oma tavalisest nädalast.', 'Kirjelda üht tavalist tööpäeva.\nÜtle, mida teed sageli ja mida harva.\nVõrdle tööpäeva ja nädalavahetust.\nKasuta vähemalt nelja sidujat või ajamarkerit.', 100, 150),
      selfcheck('005_d_self', 'Ma sain tekstist aru ka siis, kui küsimus oli ümber sõnastatud.\nMa kasutasin olevikku piisavalt täpselt.\nMa kasutasin sagedussõnu ja ajamarkereid.\nMa rääkisin seotud lausetega.', 'Esimene kontroll on alanud!'),
    ],
  },
};

const makePractice = (lessonId) => {
  const shared = {
    'a2b1-002': [
      table('002_p_table', 'Korda vorme enne lauseid.', 'Täida da-vorm ja mina-vorm.', 'ma-vorm, da-vorm, mina-vorm', 'ärkama | [ärgata] | [ärkan]\nsööma | [süüa] | [söön]\nminema | [minna] | [lähen]\ntulema | [tulla] | [tulen]\npuhkama | [puhata] | [puhkan]'),
      gaps('002_p_gaps', 'Lisa õige ajamarker ja vorm.', 'Mõtle nii ajale kui ka verbivormile.', 'Hommikul ma [ärkan] kell seitse.\n[Enne] tööle minekut söön hommikusööki.\n[Pärast] lõunat jätkan tööd.\nÕhtul ma [tulen] koju.\n[Enne] magamaminekut loen natuke.'),
      clock('002_p_clock', 'Ütle kellaaeg eri kujul.', 'Kirjuta kellaaeg.', [{ time: '06:45', extra: '' }, { time: '07:30', extra: 'pool kaheksa' }, { time: '08:15', extra: '' }, { time: '12:30', extra: 'pool üks' }, { time: '18:00', extra: '' }]),
      errorfix('002_p_fix', 'Paranda ajaga seotud vead.', 'Kirjuta terve lause õigesti.', [
        { wrong: 'Ma ärkan kell seitse hommikul tavaliselt.', answer: 'Ma ärkan tavaliselt hommikul kell seitse.' },
        { wrong: 'Pärast hommikusöök lähen tööle.', answer: 'Pärast hommikusööki lähen tööle.' },
        { wrong: 'Õhtul ma tuleb koju.', answer: 'Õhtul ma tulen koju.' },
        { wrong: 'Enne magama ma loen.', answer: 'Enne magamaminekut ma loen.' },
        { wrong: 'Lõunal ajal söön kolleegidega.', answer: 'Lõuna ajal söön kolleegidega.' },
      ]),
      dialogue('002_p_dialogue', 'Lepi päevaplaan kokku.', 'Täida ajad ja tegevused.', 'A', 'B', [
        { who: 'A', text: 'Mis kell sa homme [ärkad]?' },
        { who: 'B', text: 'Ma [ärkan] kell seitse.' },
        { who: 'A', text: 'Mida sa [pärast] tööd teed?' },
        { who: 'B', text: 'Pärast tööd ma [lähen] trenni.' },
      ]),
      writing('002_p_write', 'Minu tööpäev 7 lausega.', 'Kirjuta 7–9 lauset. Iga teine lause peab sisaldama aja- või järjekorramarkerit.', 7, 9, 'hommikul, enne, pärast, siis, õhtul', 4),
      selfcheck('002_p_self', 'Ma kasutan kellaaega täpselt.\nMa panen ajamääruse lausesse loomulikult.\nMa parandan tüüpilisi olevikuvigu.\nMa kirjutan päeva loogilises järjekorras.', 'Aeg toetab juttu!'),
    ],
    'a2b1-003': [
      match('003_p_match', 'Seo sagedus päris tähendusega.', 'Leia kõige lähem tähendus.', [
        { left: 'alati', right: 'iga kord' }, { left: 'tavaliselt', right: 'enamasti' }, { left: 'sageli', right: 'paljudel kordadel' }, { left: 'mõnikord', right: 'vahel' }, { left: 'harva', right: 'väga vähestel kordadel' },
      ]),
      errorfix('003_p_fix', 'Paranda sõnajärg.', 'Kirjuta terve lause loomulikult.', [
        { wrong: 'Ma joon kohvi tavaliselt hommikul alati.', answer: 'Ma joon tavaliselt hommikul kohvi.' },
        { wrong: 'Sageli ma tööle bussiga lähen.', answer: 'Sageli lähen ma tööle bussiga.' },
        { wrong: 'Ma mitte kunagi söön hilja.', answer: 'Ma ei söö mitte kunagi hilja.' },
        { wrong: 'Õhtul sageli ma loen.', answer: 'Õhtul ma sageli loen.' },
        { wrong: 'Mõnikord nädalavahetusel kohtun sõpradega ma.', answer: 'Mõnikord kohtun ma nädalavahetusel sõpradega.' },
      ]),
      gaps('003_p_gaps', 'Vali sagedus tähenduse järgi.', 'Sõnapangas on rohkem variante kui vaja.', 'Ma [tavaliselt] ärkan kell seitse, kuid vahel hiljem.\nMa [harva] joon õhtul kohvi, sest tahan hästi magada.\nNädalavahetusel ma [sageli] kohtun sõpradega.\nMa [mitte kunagi] ei lähe tööle keset ööd.\nKui ilm on hea, lähen ma [mõnikord] jala.', 'alati, tavaliselt, sageli, mõnikord, harva, mitte kunagi', 'yes'),
      table('003_p_table', 'Üks tegevus — mitu sagedust.', 'Kirjuta enda kohta sobiv lause.', 'Tegevus, Sagedus, Minu lause', 'trenni tegema | [sageli/harva/mõnikord] | \nkohvi jooma | [tavaliselt/harva/mõnikord] | \nsõpradega kohtuma | [sageli/harva/mõnikord] | \nlugema | [tavaliselt/sageli/harva] | '),
      dialogue('003_p_dialogue', 'Küsi täpsustav küsimus.', 'Täida puuduvad sagedussõnad.', 'A', 'B', [
        { who: 'A', text: 'Kui sageli sa pärast tööd [puhkad] kodus?' },
        { who: 'B', text: 'Ma [tavaliselt] puhkan kodus.' },
        { who: 'A', text: 'Kas sa [sageli] loed õhtul?' },
        { who: 'B', text: 'Jah, üsna [sageli].' },
      ]),
      speaking('003_p_speak', 'Ütle üks harjumus viiel viisil.', 'Vali üks tegevus ja muuda ainult sagedust. Selgita, kuidas tähendus muutub.', 'Näide tegevusest: trenni tegema / lugema / kohvi jooma.\nKasuta: alati, tavaliselt, sageli, mõnikord, harva.', 60, 100),
      selfcheck('003_p_self', 'Ma parandan sagedussõna koha lauses.\nMa eristan alati/tavaliselt/sageli/mõnikord/harva.\nMa oskan muuta lause tähendust ainult sagedussõna abil.\nMa ei sõltu ainult sõnapangast.', 'Lausejärg muutub automaatsemaks!'),
    ],
    'a2b1-004': [
      wordorder('004_p_order', 'Taasta seotud nädalajutt.', 'Pane laused loomulikku järjekorda.', 'Esmaspäeval töötan kaua, aga teisipäeval lõpetan varem.\nPärast tööd lähen trenni ja siis tulen koju.\nNeljapäeva õhtul õpin eesti keelt.\nNädalavahetusel puhkan rohkem ja kohtun sõpradega.'),
      errorfix('004_p_fix', 'Paranda sidumise vead.', 'Kirjuta terve lause õigesti.', [
        { wrong: 'Esmaspäeval töötan kaua siis teisipäeval puhkan.', answer: 'Esmaspäeval töötan kaua, aga teisipäeval puhkan.' },
        { wrong: 'Pärast seda ma lähen trenni enne töö.', answer: 'Pärast tööd lähen ma trenni.' },
        { wrong: 'Nädalavahetusel ma kohtun sageli sõber.', answer: 'Nädalavahetusel kohtun ma sageli sõpradega.' },
        { wrong: 'Reedel ma puhkan ja aga loen.', answer: 'Reedel ma puhkan ja loen.' },
        { wrong: 'Pühapäeval pärast seda esmaspäev.', answer: 'Pärast pühapäeva tuleb esmaspäev.' },
      ]),
      dialogue('004_p_dialogue', 'Võrdle kahte päeva.', 'Täida puuduvad sidujad ja tegevused.', 'A', 'B', [
        { who: 'A', text: 'Mida sa esmaspäeval pärast tööd [teed]?' },
        { who: 'B', text: 'Esmaspäeval ma [puhkan], aga teisipäeval lähen trenni.' },
        { who: 'A', text: 'Mida sa [nädalavahetusel] teed?' },
        { who: 'B', text: 'Siis ma tavaliselt [kohtun] sõpradega.' },
      ]),
      table('004_p_table', 'Ehita oma nädal.', 'Kirjuta iga päeva juurde üks tegevus ja üks siduv lause.', 'Päev, Põhitegevus, Seos järgmise päevaga', 'esmaspäev |  | \nteisipäev |  | \nkolmapäev |  | \nneljapäev |  | \nreede |  | \nnädalavahetus |  | '),
      speaking('004_p_speak', 'Räägi tabeli järgi ilma lauseid ette kirjutamata.', 'Räägi 2 minutit.', 'Kasuta vähemalt: aga, siis, pärast seda, nädalavahetusel.\nLisa üks võrdlus: tööpäeval…, aga nädalavahetusel…', 100, 150),
      writing('004_p_write', 'Minu nädal 8 lausega.', 'Kirjuta 8–10 seotud lauset. Vähemalt 4 lauses peab olema siduv väljend.', 8, 10, 'aga, siis, pärast seda, nädalavahetusel', 4),
      selfcheck('004_p_self', 'Ma seon päevad üheks jutuks.\nMa kasutan ja/aga/siis/pärast seda õigesti.\nMa võrdlen vähemalt kahte päeva.\nMa ei kirjuta ainult tegevuste nimekirja.', 'Nädal kõlab loomulikult!'),
    ],
    'a2b1-005': [
      errorfix('005_p_fix', 'Kontrolli tüüpilisi vigu.', 'Paranda ilma vihjeta.', [
        { wrong: 'Ma tavaliselt ärkab kell seitse.', answer: 'Ma tavaliselt ärkan kell seitse.' },
        { wrong: 'Pärast töö lähen koju.', answer: 'Pärast tööd lähen koju.' },
        { wrong: 'Ma harva ei joon kohvi.', answer: 'Ma joon harva kohvi.' },
        { wrong: 'Nädalavahetusel ma kohtun sõber.', answer: 'Nädalavahetusel kohtun ma sõpradega.' },
        { wrong: 'Esmaspäeval töötan kaua siis teisipäeval puhkan.', answer: 'Esmaspäeval töötan kaua, aga teisipäeval puhkan.' },
      ]),
      wordorder('005_p_order', 'Kontrolli sõnajärge.', 'Taasta laused.', 'Hommikul ärkan ma tavaliselt kell seitse.\nPärast tööd lähen ma mõnikord trenni.\nNädalavahetusel kohtun ma sageli sõpradega.\nÕhtul puhkan ma kodus ja loen.'),
      gaps('005_p_mix', 'Segakontroll.', 'Täienda õige vormi või sidujaga. Sõnapanka ei ole.', 'Ma tavaliselt [ärkan] kell seitse.\nPärast tööd [lähen] koju.\nMa [harva] joon õhtul kohvi.\nEsmaspäeval töötan kaua, [aga] teisipäeval lõpetan varem.\nNädalavahetusel ma mõnikord [kohtun] sõpradega.\nÕhtul [puhkan] kodus.'),
      writing('005_p_write', 'Kirjalik kontroll.', 'Kirjuta 70–90 sõna teemal „Minu tavaline nädal”. Kasuta vähemalt viit mooduli märksõna.', 8, 12, 'tavaliselt, sageli, pärast, aga, nädalavahetusel', 4),
      speaking('005_p_dialogue', 'Lühike dialoog õpetajaga.', 'Vasta spontaanselt. Õpetaja muudab vähemalt üht küsimust.', 'Mis kell su päev algab?\nMida teed pärast tööd?\nKui sageli teed trenni või liigud?\nMida teed nädalavahetusel?\nMis on sinu kõige kiirem päev?', 90, 150),
      selfcheck('005_p_self', 'Ma sain kontrollitud grammatikaosaga hakkama.\nMa kirjutasin seotud teksti.\nMa vastasin spontaanselt.\nMa tean, kas vajan korrigeerivat tundi.', 'Tulemus on nähtav!'),
      tip('005_p_threshold', 'Soovituslik lävend', 'Üldine tulemus 70%. Kui baasgrammatika jääb alla 60%, lisa korrigeeriv tund enne järgmise mooduli jätkamist.', 'full'),
    ],
  };
  if (lessonId === 'a2b1-001') return [
    match('001_p_match', 'Taasta tuttavad põhiverbid.', 'Ühenda 3 vormi venekeelse tähendusega.', [
      { left: 'ärkama – ärgata – ärkan', right: 'просыпаться' },
      { left: 'minema – minna – lähen', right: 'идти' },
      { left: 'tulema – tulla – tulen', right: 'приходить' },
      { left: 'puhkama – puhata – puhkan', right: 'отдыхать' },
      { left: 'kohtuma – kohtuda – kohtun', right: 'встречаться' },
    ]),
    categorize('001_p_cat', 'Sorteeri oma kindlus.', 'Paiguta tegevused: oskan hästi / vajan veel harjutamist.', [
      { name: 'Oskan hästi', words: 'ärkan, lähen, töötan, söön' },
      { name: 'Vajan veel harjutamist', words: 'kohtun, puhkan, loen, tulen' },
    ]),
    gaps('001_p_gaps', 'Vali vorm konteksti järgi.', 'Sõnapanka ei ole. Muuda vajadusel algvormi.', 'Hommikul ma [ärkan] kell seitse.\nPärast hommikusööki ma [lähen] tööle.\nLõuna ajal ma [söön] kolleegidega.\nÕhtul ma [tulen] koju.\nPärast tööd ma tavaliselt [puhkan].\nNädalavahetusel ma mõnikord [kohtun] sõpradega.'),
    errorfix('001_p_fix', 'Leia ja paranda tüüpiline A2 viga.', 'Kirjuta terve lause õigesti.', [
      { wrong: 'Hommikul mina ärkab kell seitse.', answer: 'Hommikul ma ärkan kell seitse.' },
      { wrong: 'Ma minen tööle kell kaheksa.', answer: 'Ma lähen tööle kell kaheksa.' },
      { wrong: 'Õhtul ma puhkan tavaliselt kodu.', answer: 'Õhtul ma puhkan tavaliselt kodus.' },
      { wrong: 'Pärast töö ma lähen trenni.', answer: 'Pärast tööd ma lähen trenni.' },
      { wrong: 'Mõnikord ma kohtun sõbrad.', answer: 'Mõnikord ma kohtun sõpradega.' },
    ]),
    writing('001_p_write', 'Paranda oma esimene tekst.', 'Kirjuta 6–8 lauset uuesti. Lisa üks sagedussõna ja üks siduv väljend.', 6, 8, 'tavaliselt, mõnikord, pärast, siis', 3),
    speaking('001_p_speak', 'Ütle sama ilma lugemata.', 'Räägi 1 minut oma tavalisest päevast.', 'Millal päev algab?\nMida teed hommikul?\nMida teed päeval?\nMida teed pärast tööd?\nMida teed õhtul?', 50, 90, 'hommikul · tavaliselt · pärast · õhtul'),
    selfcheck('001_p_self', 'Ma parandasin vähemalt kolm tüüpilist viga.\nMa kasutan põhiverbe olevikus.\nMa oskan vastata täislausega.\nMa tean, millised vormid vajavad veel kordamist.', 'Baas muutub kindlamaks!'),
  ];
  return shared[lessonId];
};

const makeTransfer = (lessonId) => {
  const shared = {
    'a2b1-002': [
      tip('002_t_case', 'Olukord muutub', 'Sul on homme tavalisest erinev päev: üks kohtumine algab kell 10.30 ja õhtul pead olema kodus kell 19.00.', 'full'),
      writing('002_t_plan', 'Koosta uus päevaplaan.', 'Kirjuta 8–10 lauset nii, et kõik tegevused mahuvad päeva sisse.', 8, 10, 'enne, pärast, siis, lõpuks', 3),
      speaking('002_t_explain', 'Selgita oma plaani teisele inimesele.', 'Räägi 2 minutit. Põhjenda vähemalt üht ajavalikut.', 'Millal päev algab?\nMida teed enne 10.30?\nMis juhtub pärast kohtumist?\nMillal jõuad koju?\nMida pead ajakavas muutma?', 100, 150),
      choice('002_t_decide', 'Vali kõige realistlikum lahendus.', 'Mõtle ajale ja järjekorrale.', [
        { q: 'Kohtumine algab kell 10.30 ja sõit kestab 30 minutit. Millal peaksid hiljemalt väljuma?', options: '*kell 10.00\nkell 10.30\nkell 11.00' },
        { q: 'Pead olema kodus kell 19.00 ja trenn lõpeb kell 18.45 teises linnaosas. Mis on mõistlik?', options: '*valin varasema trenni või jätan selle ära\njään kindlasti trenni lõpuni\nalustan trenni kell 19.00' },
        { q: 'Kui hommikul on kaks kiiret asja, mida teha?', options: '*panen need järjekorda\ntegin mõlemat korraga\nei vaata kella' },
        { q: 'Mida aitab sõna „pärast” kuulajal mõista?', options: '*mis juhtub hiljem\nmis juhtus eile\nkes tegevuse teeb' },
        { q: 'Milline päevakirjeldus on kõige selgem?', options: '*ajaliselt järjestatud ja seotud\njuhuslik tegevuste nimekiri\nainult kellaajad' },
      ], 'g_read', 'full'),
      selfcheck('002_t_self', 'Ma muutsin plaani uue info põhjal.\nMa kasutasin vähemalt viit ajamarkerit.\nMa põhjendasin vähemalt üht valikut.\nMa rääkisin ilma valmis tekstita.', 'Päevaplaan töötab!'),
    ],
    'a2b1-003': [
      tip('003_t_case', 'Väike uuring', 'Kujuta ette, et teed klassis harjumuste uuringu ja pead tulemused suuliselt kokku võtma.', 'full'),
      table('003_t_data', 'Kogu 5 vastust.', 'Õpetaja või kaaslane annab vastused. Märgi need tabelisse.', 'Tegevus, Sagedus, Märkus', 'hommikusööki sööma |  | \ntrenni tegema |  | \nlugema |  | \nsõpradega kohtuma |  | \nhilja magama minema |  | '),
      speaking('003_t_report', 'Tee uuringust kokkuvõte.', 'Räägi 2 minutit. Kasuta vähemalt viit erinevat sagedussõna.', 'Mis toimub kõige sagedamini?\nMis toimub harva?\nKas mõni tulemus üllatas sind?\nMilline harjumus tundub kõige kasulikum?', 100, 150),
      writing('003_t_write', 'Kirjuta uuringu kokkuvõte.', 'Kirjuta 7–9 lauset. Ära kirjuta lihtsalt tabelit ümber: tee vähemalt kaks järeldust.', 7, 9, 'alati, tavaliselt, sageli, mõnikord, harva', 4),
      notice('003_t_notice', 'Järeldus ei ole koopia.', 'Fakt: „3 inimest loeb sageli.”\nJäreldus: „Lugemine näib selles grupis üsna regulaarne harjumus.”', 'g_notice', 'full'),
      selfcheck('003_t_self', 'Ma kasutasin sagedussõnu päris info kirjeldamiseks.\nMa tegin vähemalt kaks järeldust.\nMa rääkisin seotud lausetega.\nMa ei kasutanud iga kord sama lausemalli.', 'Sagedus töötab päris suhtluses!'),
    ],
    'a2b1-004': [
      tip('004_t_scenario', 'Uus tingimus', 'Sinu nädalasse lisandus kolmapäeval kell 18 uus kohustus. Pead oma senist plaani muutma.', 'full'),
      choice('004_t_decision', 'Milline muudatus on loogiline?', 'Vali ja mõtle, miks.', [
        { q: 'Kui trenn oli kolmapäeval kell 18 ja uus kohustus on samal ajal, mida teha?', options: '*tõstan trenni teisele päevale\nteen mõlemat samal ajal\nei muuda midagi' },
        { q: 'Kui neljapäev on juba väga tihe, kuhu sobib trenn paremini?', options: '*teisipäevale või nädalavahetusele\nneljapäeval samasse aega\nöösel kell kaks' },
        { q: 'Mida peab kuulaja plaanimuutusest aru saama?', options: '*mis muutus ja miks\nainult uus kellaaeg\nainult vana plaan' },
        { q: 'Milline siduja näitab kontrasti?', options: '*aga\nja\npärast seda' },
        { q: 'Milline siduja näitab järgmist sammu?', options: '*siis\naga\nharva' },
      ], 'g_read', 'full'),
      writing('004_t_replan', 'Kirjuta uus nädalaplaan.', 'Kirjuta 8–10 lauset. Selgita vähemalt kahte muudatust ja põhjust.', 8, 10, 'aga, siis, pärast seda, sest', 4),
      speaking('004_t_explain', 'Selgita muutust teisele inimesele.', 'Räägi 2–3 minutit. Õpetaja küsib ühe ootamatu lisaküsimuse.', 'Milline oli vana plaan?\nMis uus kohustus tuli?\nMida muutsid?\nMiks valisid just selle lahenduse?\nKuidas nädal nüüd välja näeb?', 120, 180),
      notice('004_t_notice', 'Hea vastus sisaldab muutust + põhjust.', 'Vana plaan: kolmapäeval trenn.\nUus info: kell 18 kohtumine.\nLahendus: tõstan trenni teisipäevale, sest siis on õhtu vaba.', 'g_notice', 'full'),
      selfcheck('004_t_self', 'Ma muutsin plaani uue info põhjal.\nMa põhjendasin vähemalt kahte otsust.\nMa kasutasin sidujaid, mitte ainult lühilauseid.\nMa rääkisin ilma valmis skriptita.', 'Plaani saab paindlikult muuta!'),
    ],
    'a2b1-005': [
      tip('005_t_case', 'Lõppülesanne', 'Uus tuttav tahab teada, millal sinuga on lihtne kohtuda ja milline sinu nädal tavaliselt on.', 'full'),
      speaking('005_t_monologue', 'Räägi oma nädalast 2–3 minutit.', 'Räägi ilma küsimusi ette lugemata. Õpetaja esitab lõpus ühe täpsustava küsimuse.', 'Kirjelda tööpäeva rütmi.\nÜtle, mida teed sageli ja harva.\nVõrdle tööpäeva nädalavahetusega.\nSelgita, millal oleks sinuga kõige lihtsam kohtuda.', 120, 180),
      dialogue('005_t_agree', 'Lepi kohtumisaeg kokku.', 'Kasuta oma päris nädalaplaani.', 'Sina', 'Tuttav', [
        { who: 'A', text: 'Millal sa tavaliselt pärast tööd [vaba oled]?' },
        { who: 'B', text: 'Ma olen tavaliselt [teisipäeval] vaba.' },
        { who: 'A', text: 'Kas saame siis [kohtuda]?' },
        { who: 'B', text: 'Jah, sobib. Pärast seda ma [lähen] koju.' },
      ]),
      writing('005_t_message', 'Saada kokkuleppe sõnum.', 'Kirjuta 6–8 lauset: millal saad kohtuda, miks teised ajad ei sobi ja mida teed enne/pärast kohtumist.', 6, 8, 'tavaliselt, pärast, aga, siis', 3),
      choice('005_t_infer', 'Viimane mõistmiskontroll.', 'Vali kõige tugevam vastus.', [
        { q: 'Kui inimene ütleb „Reedel ei planeeri ma tavaliselt midagi”, mida võib järeldada?', options: '*Ta jätab reedeks rohkem paindlikkust.\nTa ei tea, mis päev on reede.\nTa töötab ainult reedel.' },
        { q: 'Kui „harva” asendada sõnaga „sageli”, mis muutub?', options: '*tegevuse sagedus\ntegevuse aeg minevikuks\nverbi isik' },
        { q: 'Miks on „aga” kasulik nädalast rääkides?', options: '*see näitab kontrasti kahe mõtte vahel\nsee ütleb kellaaega\nsee teeb verbi minevikuks' },
        { q: 'Milline vastus on A2 lõpus kõige tugevam?', options: '*6–8 seotud lauset tuttaval teemal\nüksik sõna\ntäiesti pähe õpitud pikk tekst' },
        { q: 'Kui baasgrammatika on väga ebakindel, mis on mõistlik järgmine samm?', options: '*teha korrigeeriv tund\nliikuda kohe raskema B1 juurde\nvältida grammatikat' },
      ], 'g_read', 'full'),
      selfcheck('005_t_self', 'Ma oskan oma nädalast iseseisvalt rääkida.\nMa kasutan olevikku, sagedust ja ajamarkereid.\nMa saan tuttavast tekstist aru ka ümber sõnastatud küsimuste korral.\nMa oskan järgmise mooduli jaoks oma nõrga koha nimetada.', 'Moodul 1 on kontrollitud!'),
    ],
  };
  if (lessonId === 'a2b1-001') return [
    tip('001_t_tip', 'Uus olukord', 'Kujuta ette, et tutvud uue õpetajaga. Ta ei tea sinust midagi.', 'full'),
    speaking('001_t_interview', 'Mini-intervjuu ilma valmis vastusteta.', 'Vasta 6 küsimusele. Iga vastus vähemalt üks täislause.', 'Mis kell sinu päev tavaliselt algab?\nMida teed hommikul?\nKus töötad või õpid?\nMida teed pärast tööd või kooli?\nKui sageli kohtud sõpradega?\nMida tahaksid eesti keeles paremini osata?', 90, 150),
    writing('001_t_message', 'Kirjuta õpetajale lühike tutvustus.', 'Kirjuta 7–9 lauset. Ära kopeeri eelmise ülesande küsimusi.', 7, 9, 'tavaliselt, pärast, mõnikord', 2),
    choice('001_t_infer', 'Vali sobiv jätk vastavalt mõttele.', 'Mõtle tähendusele, mitte ainult vormile.', [
      { q: 'Kui inimene ütleb „Ma töötan õhtuti”, mis võib tema päeva kohta tõenäoliselt kehtida?', options: '*Ta puhkab või teeb muid asju päeval.\nTa töötab ainult hommikul.\nTa ei tööta kunagi.' },
      { q: 'Kui inimene kohtub sõpradega harva, mida see tähendab?', options: '*Kohtumisi on vähe.\nKohtumisi on iga päev.\nKohtumisi pole võimalik planeerida.' },
      { q: 'Kui vastus on „Pärast tööd lähen trenni”, milline küsimus sobib?', options: '*Mida sa pärast tööd teed?\nMis su nimi on?\nKus sa elad?' },
      { q: 'Kui inimene ütleb „Ma tavaliselt loen, aga mõnikord vaatan filmi”, mida ta teeb sagedamini?', options: '*loeb\nvaatab filmi\nteeb mõlemat alati võrdselt' },
      { q: 'Milline vastus näitab kõige rohkem iseseisvat keelekasutust?', options: '*Hommikul ärkan kell seitse, siis söön ja pärast seda lähen tööle.\nKell seitse. Töö.\nHommikul.' },
    ], 'g_read', 'full'),
    selfcheck('001_t_self', 'Ma vastasin ilma valmis mudelita.\nMa ühendasin mitu lauset üheks jutuks.\nMa kasutasin vähemalt kolme mooduli sõna.\nMa oskan nimetada ühe tugeva ja ühe nõrga koha.', 'Diagnostika on lõpetatud!'),
  ];
  return shared[lessonId];
};

for (const id of Object.keys(spec)) {
  spec[id].practice = makePractice(id);
  spec[id].transfer = makeTransfer(id);
}

export function module1VocabularyCycle() {
  return {
    core: [
      'ärkama – ärgata – ärkan — просыпаться',
      'sööma – süüa – söön — есть',
      'jooma – juua – joon — пить',
      'minema – minna – lähen — идти',
      'tulema – tulla – tulen — приходить',
      'töötama – töötada – töötan — работать',
      'õppima – õppida – õpin — учиться',
      'puhkama – puhata – puhkan — отдыхать',
      'lugema – lugeda – loen — читать',
      'kohtuma – kohtuda – kohtun — встречаться',
      'tavaliselt — обычно',
      'sageli — часто',
      'mõnikord — иногда',
      'harva — редко',
    ],
    grammar: 'olevik + lihtne lausejärg + ajamäärused + sagedus + ja/aga/siis/pärast seda',
    recycle: {
      'a2b1-001': 'diagnostika + 8–10 põhisõna',
      'a2b1-002': 'vähemalt 60% lesson 001 sõnavarast + ajamarkerid',
      'a2b1-003': 'vähemalt 70% põhisõnavarast + sagedus',
      'a2b1-004': 'vähemalt 75% põhisõnavarast + sidujad',
      'a2b1-005': '0 uut põhisõna; 85–100% mooduli sõnavara kontroll',
    },
  };
}

export function buildModule1Worksheet(lessonId, phase) {
  const lesson = spec[lessonId];
  if (!lesson) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 1.`);
  if (!phaseMeta[phase] || !lesson[phase]) throw new Error(`Etapp ${phase} ei ole toetatud.`);
  return {
    schema: 'keelesepp.worksheet/2',
    id: `ws_${lessonId}_${phase}`,
    meta: {
      ...baseMeta,
      title: lesson.title,
      subtitle: phaseMeta[phase].subtitle,
      canDo: lesson.canDo,
      phase,
      displayLabel: phaseMeta[phase].label,
      badge: 'KeeleSepp A2 → B1 · moodul 1',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
    },
    blocks: lesson[phase],
  };
}

export const MODULE1_LESSON_IDS = Object.freeze(Object.keys(spec));
export const MODULE1_PHASES = Object.freeze(['discover', 'practice', 'transfer']);
