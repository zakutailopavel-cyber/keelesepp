const MODULE = 'Mina, pere ja suhted';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id,
  type,
  width,
  span: width === 'full' ? 12 : 6,
  tone,
  goal,
  data,
});

const SPECS = {
  'a2b1-006': {
    meta: {
      title: 'Pere ja lähedased',
      subtitle: 'Räägin oma perest ja lähedastest inimestest rohkem kui ühe lühikese lausega.',
      canDo: 'Ma tutvustan 4–5 lähedast inimest ja lisan igaühe kohta vähemalt ühe sisulise detaili.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 pere- ja suhtesõna sobivas kontekstis.',
        g_read: 'Õpilane leiab peretekstist inimeste seosed ja peamised detailid.',
        g_notice: 'Õpilane märkab kelle?-küsimust ja genitiivi kasutust kuuluvuse väljendamisel.',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset lauset oma pere või lähedaste kohta.',
      },
    },
    additions: {
      vocab: block('a2b1_006_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Pere ja lähedaste sõnavara',
        words: 'ema, isa, õde, vend, vanaema, vanaisa, abikaasa, elukaaslane, laps, sugulane, lähedane inimene, koos elama',
        columns: '3',
      }, 'full'),
      general: block('a2b1_006_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kes on kes?',
        instruction: 'Vali vastus, mis näitab kõige paremini, kas said tekstist üldiselt aru.',
        questions: [
          { q: 'Mis aitab pereteksti kõige paremini mõista?', options: '*Kes on omavahel seotud ja mida nende kohta öeldakse.\nKõigi inimeste täpne vanus.\nAinult nimed.' },
          { q: 'Milline lause annab suhtest rohkem infot?', options: '*Minu õde elab Tartus ja me räägime peaaegu iga päev.\nMul on õde.\nÕde on sõna.' },
          { q: 'Milline küsimus aitab seost täpsustada?', options: '*Kes ta sulle on?\nMis värvi on laud?\nMis kell buss tuleb?' },
        ],
      }),
      notice: block('a2b1_006_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka: kelle? ja kelle oma?',
        lines: 'See on **minu venna** auto. → kelle auto? venna auto.\n**Mu ema** töötab haiglas. → kelle ema? minu ema.\nMa lähen nädalavahetusel **vanaema juurde**. → kelle juurde? vanaema juurde.\nMeie peres elab viis inimest. → *meie* näitab kuuluvust.',
      }),
      controlled: block('a2b1_006_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Räägi perest täpsemalt.',
        instruction: 'Täienda laused sobiva vormiga.',
        bank: 'venna, õe, ema, vanaema, meie, lähedane',
        showBank: 'yes',
        sentences: 'See on minu [venna] tuba.\nMa räägin sageli oma [õega].\nMinu [ema] töötab koolis.\nPühapäeval läheme [vanaema] juurde.\n[Meie] peres armastatakse koos süüa teha.\nTa on mulle väga [lähedane] inimene.',
      }, 'full'),
    },
  },
  'a2b1-007': {
    meta: {
      title: 'Välimus ja iseloom',
      subtitle: 'Kirjeldan inimest täpselt ja lugupidavalt.',
      canDo: 'Ma kirjeldan inimese välimust ja iseloomu vähemalt 8 seotud lausega ning kasutan 10 teemakohast omadussõna.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 välimuse ja iseloomu omadussõna.',
        g_read: 'Õpilane eristab tekstis välimuse kirjeldust iseloomu kirjeldusest.',
        g_notice: 'Õpilane märkab omadussõna kasutust konstruktsioonides ta on…, tal on… ja üsna/väga/natuke.',
        g_use: 'Õpilane moodustab vähemalt 6 neutraalset ja loomulikku kirjeldavat lauset.',
      },
    },
    additions: {
      vocab: block('a2b1_007_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kirjeldavad sõnad',
        words: 'sõbralik, rahulik, energiline, avatud, tagasihoidlik, hooliv, naljakas, tõsine, pikk, lühikest kasvu, heledate juustega, tumedate juustega',
        columns: '3',
      }, 'full'),
      general: block('a2b1_007_av_general', 'choice', 'sky', 'g_read', {
        title: 'Välimus või iseloom?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Milline lause kirjeldab iseloomu?', options: '*Ta on väga rahulik ja hooliv.\nTal on tumedad juuksed.\nTa on 175 cm pikk.' },
          { q: 'Milline lause kirjeldab välimust neutraalselt?', options: '*Tal on lühikesed heledad juuksed.\nTa näeb imelik välja.\nTa on parem kui teised.' },
          { q: 'Miks kasutatakse sõnu üsna, väga ja natuke?', options: '*Et omaduse tugevust täpsustada.\nEt muuta lause minevikku.\nEt näidata omanikku.' },
        ],
      }),
      notice: block('a2b1_007_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kirjeldusmudeleid.',
        lines: '**Ta on** väga sõbralik ja üsna rahulik.\n**Tal on** lühikesed tumedad juuksed.\nTa on **natuke** tagasihoidlik, aga väga hooliv.\nEsimesel kohtumisel tundub ta tõsine, **aga** tegelikult teeb ta palju nalja.',
      }),
      controlled: block('a2b1_007_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Tee kirjeldus loomulikumaks.',
        instruction: 'Täienda laused sobiva sõna või väljendiga.',
        bank: 'on, tal on, väga, üsna, natuke, aga',
        showBank: 'yes',
        sentences: 'Ta [on] sõbralik ja avatud.\n[Tal on] lühikesed tumedad juuksed.\nTa on [väga|üsna] energiline.\nTa on [natuke] tagasihoidlik uute inimestega.\nTa tundub tõsine, [aga] räägib sõpradega palju.\nTa on [üsna|väga] rahulik ka keerulises olukorras.',
      }, 'full'),
    },
  },
  'a2b1-008': {
    meta: {
      title: 'Kelle? Kelle oma?',
      subtitle: 'Näitan, kellele inimene või ese kuulub.',
      canDo: 'Ma küsin ja vastan kuuluvuse kohta ning kasutan genitiivi õigesti vähemalt 8 juhul 10-st.',
      goals: {
        g_vocab: 'Õpilane kasutab omandit ja suhteid väljendavaid asesõnu ja nimisõnu.',
        g_read: 'Õpilane saab aru, kellele tekstis mainitud esemed või suhted kuuluvad.',
        g_notice: 'Õpilane tuletab näidetest genitiivi ja kelle oma? põhiskeemi.',
        g_use: 'Õpilane valib või moodustab õige genitiivivormi vähemalt 8 juhul 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_008_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kuuluvuse väljendid',
        words: 'minu, sinu, tema, meie, teie, nende, kelle?, kelle oma?, venna, õe, sõbra, õpetaja, lapse',
        columns: '4',
      }, 'full'),
      general: block('a2b1_008_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kellele mis kuulub?',
        instruction: 'Vali vorm, mis sobib tähendusega.',
        questions: [
          { q: '„See on Mari raamat.” Mida me teame?', options: '*Raamat kuulub Marile.\nMari loeb ainult koolis.\nRaamat on uus.' },
          { q: 'Milline küsimus sobib vastusele „See on minu venna oma”?', options: '*Kelle oma see on?\nKus see on?\nMillal see on?' },
          { q: 'Millises lauses on kuuluvus väljendatud loomulikult?', options: '*See on minu sõbra telefon.\nSee on minu sõber telefon.\nSee on sõber minu telefon.' },
        ],
      }),
      notice: block('a2b1_008_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka vormi.',
        lines: 'sõber → **sõbra** telefon\nõde → **õe** kott\nlaps → **lapse** jalgratas\nKelle telefon see on? — See on **minu venna oma**.',
      }),
      controlled: block('a2b1_008_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ava sulud õigesse vormi.',
        instruction: 'Kirjuta sulgudes olev sõna genitiivis.',
        bank: '',
        showBank: 'no',
        sentences: 'See on minu [sõbra] (sõber) auto.\nKus on [õpetaja] (õpetaja) raamat?\nMa nägin [õe] (õde) uut korterit.\nSee on [lapse] (laps) jalgratas.\nKas see on [venna] (vend) jope?\nMe ootame [ema] (ema) sõpra.',
      }, 'full'),
    },
  },
  'a2b1-009': {
    meta: {
      title: 'Koos veedetud aeg',
      subtitle: 'Räägin, mida me koos teeme ja miks see mulle oluline on.',
      canDo: 'Ma räägin 1,5–2 minutit ühest lähedasest inimesest ja meie ühistest tegevustest ning põhjendan vähemalt kahte eelistust.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 ühistegevuse ja suhte väljendit.',
        g_read: 'Õpilane leiab tekstist, mida inimesed koos teevad ja miks neile see meeldib.',
        g_notice: 'Õpilane märkab mustreid meeldib koos…, tavaliselt…, vahel… ja sest….',
        g_use: 'Õpilane täiendab vähemalt 6 lauset sobiva ühistegevuse või põhjendusega.',
      },
    },
    additions: {
      vocab: block('a2b1_009_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Koos olemise sõnad',
        words: 'koos aega veetma, jalutama, süüa tegema, külas käima, filmi vaatama, sporti tegema, rääkima, reisima, tavaliselt, vahel, sest, mõlemale meeldib',
        columns: '3',
      }, 'full'),
      general: block('a2b1_009_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mida suhetest räägitakse?',
        instruction: 'Vali kõige sisulisem vastus.',
        questions: [
          { q: 'Mis teeb ühistegevuse kirjelduse huvitavamaks?', options: '*Tegevus + kui tihti + miks see meeldib.\nAinult tegevuse nimi.\nAinult inimese vanus.' },
          { q: 'Milline lause põhjendab eelistust?', options: '*Me käime koos jalutamas, sest siis saame rahulikult rääkida.\nMe käime koos jalutamas.\nJalutamine on sõna.' },
          { q: 'Milline väljend näitab, et tegevus ei toimu alati?', options: '*vahel\nalati\nmitte kunagi' },
        ],
      }),
      notice: block('a2b1_009_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka, kuidas põhjus lisab tähendust.',
        lines: 'Mulle meeldib **koos vennaga süüa teha**.\nMe **tavaliselt** kohtume nädalavahetusel.\n**Vahel** läheme kinno või kohvikusse.\nMeile meeldib koos reisida, **sest** mõlemad armastame uusi kohti.',
      }),
      controlled: block('a2b1_009_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Lisa tegevus ja põhjus.',
        instruction: 'Täienda laused nii, et mõte oleks loomulik.',
        bank: 'koos, tavaliselt, vahel, sest, meeldib, räägime',
        showBank: 'yes',
        sentences: 'Me veedame nädalavahetusel aega [koos].\nMe [tavaliselt] sööme pühapäeval lõunat koos.\n[Vahel] läheme kinno või jalutama.\nMulle [meeldib] temaga süüa teha.\nMe kohtume sageli, [sest] elame lähestikku.\nKui jalutame, siis [räägime] rahulikult oma nädalast.',
      }, 'full'),
    },
  },
  'a2b1-010': {
    meta: {
      title: 'Kontroll 2 — pere ja suhted',
      subtitle: 'Näitan, et oskan inimesi kirjeldada, suhteid selgitada ja kuuluvusest rääkida.',
      canDo: 'Ma saan pere ja suhete teemalisest tekstist aru ning kasutan kirjeldusi ja kuuluvuse vorme iseseisvalt.',
      goals: {
        g_vocab: 'Õpilane tunneb ära ja kasutab pere, välimuse, iseloomu ja suhte põhivara.',
        g_read: 'Õpilane mõistab lühikese teksti põhiideed ja olulisi suhteid.',
        g_notice: 'Õpilane eristab kirjeldusmustreid ja genitiivi kuuluvuse väljendamisel.',
        g_use: 'Õpilane rakendab sihtvorme kontrollitud ülesandes vähemalt 70% täpsusega.',
      },
    },
    additions: {
      vocab: block('a2b1_010_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Enne kontrolli: võtmesõnad',
        words: 'lähedane, sugulane, sõbralik, hooliv, rahulik, energiline, koos, vahel, sest, kelle?, kelle oma?, sõbra, venna',
        columns: '3',
      }, 'full'),
      general: block('a2b1_010_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kontrolli põhiideed.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis on teksti keskne teema?', options: '*Inimeste suhted ja see, mida nende kohta teada saame.\nÜhe linna transport.\nTööpäeva kellaaeg.' },
          { q: 'Milline info aitab kõige paremini mõista inimeste suhet?', options: '*Kes nad teineteisele on ja mida nad koos teevad.\nNende kinganumber.\nIlmateade.' },
          { q: 'Milline detail näitab kuuluvust?', options: '*„See on mu õe kott.”\n„Ta on rahulik.”\n„Nad lähevad kinno.”' },
        ],
      }),
      notice: block('a2b1_010_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk mustritele.',
        lines: 'Ta **on** sõbralik ja rahulik. → iseloom.\n**Tal on** tumedad juuksed. → välimus.\nSee on minu **õe** kott. → genitiiv näitab kuuluvust.\nMeile meeldib koos jalutada, **sest** saame rääkida. → põhjus.',
      }),
      controlled: block('a2b1_010_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa.',
        instruction: 'Täienda laused ilma sõnapangata.',
        bank: '',
        showBank: 'no',
        sentences: 'Minu vend [on] väga rahulik.\n[Tal on] lühikesed tumedad juuksed.\nSee on minu [õe] (õde) telefon.\nMe kohtume sageli, [sest] elame samas linnas.\nMulle [meeldib] temaga koos süüa teha.\nSee on minu [sõbra] (sõber) auto.',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return entry?.type === 'vocab';
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|üld|kes on|välimus|kellele|suhe|aru)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|muster|vorm)/.test(title);
  if (category === 'controlled') return ['gaps', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(proovi|täienda|kontrollitud|vali|ava|räägi|tee)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function upgradeAvastaModule2Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 2.`);
  const original = Array.isArray(document?.blocks) ? document.blocks : [];
  let blocks = [...original];
  const added = [];
  const add = (category, item, position) => {
    if (hasCategory(blocks, category) || blocks.some((entry) => entry?.id === item.id)) return;
    if (blocks.length >= 9) throw new Error(`${lessonId}: Avasta sisaldab juba ${blocks.length} plokki ja ${category} puudub. Automaatne täiendamine peatati.`);
    blocks = insertAt(blocks, Math.max(0, Math.min(position(), blocks.length)), item);
    added.push(category);
  };
  add('vocab', spec.additions.vocab, () => Math.min(1, blocks.length));
  add('general', spec.additions.general, () => {
    const reading = blocks.findIndex((entry) => entry?.type === 'reading');
    return reading >= 0 ? reading + 1 : Math.min(2, blocks.length);
  });
  add('notice', spec.additions.notice, () => {
    const productive = blocks.findIndex((entry) => ['speaking', 'writing', 'selfcheck'].includes(entry?.type));
    return productive >= 0 ? productive : blocks.length;
  });
  add('controlled', spec.additions.controlled, () => {
    const productive = blocks.findIndex((entry) => ['speaking', 'writing', 'selfcheck'].includes(entry?.type));
    return productive >= 0 ? productive : blocks.length;
  });
  const selfcheck = blocks.filter((entry) => entry?.type === 'selfcheck');
  if (selfcheck.length === 1 && blocks.at(-1)?.type !== 'selfcheck') blocks = [...blocks.filter((entry) => entry?.type !== 'selfcheck'), selfcheck[0]];
  if (blocks.length < 7 || blocks.length > 9) throw new Error(`${lessonId}: pärast täiendamist on ${blocks.length} plokki; nõutud vahemik on 7–9.`);
  return {
    document: {
      ...document,
      meta: {
        ...(document?.meta || {}),
        title: spec.meta.title,
        subtitle: spec.meta.subtitle,
        level: 'B1',
        module: MODULE,
        canDo: spec.meta.canDo,
        goals: { ...(document?.meta?.goals || {}), ...spec.meta.goals },
      },
      blocks,
    },
    added,
    before: original.length,
    after: blocks.length,
  };
}

export const AVASTA_MODULE2_IDS = Object.freeze(Object.keys(SPECS));
