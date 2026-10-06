const MODULE = 'Kodu, kohad ja linn';

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
  'a2b1-011': {
    meta: {
      title: 'Minu kodu',
      subtitle: 'Kirjeldan oma kodu ja ütlen täpselt, kus asjad asuvad.',
      canDo: 'Ma kirjeldan üht tuba 6–8 seotud lausega ja kasutan vähemalt kuut ruumi- või asukohaväljendit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 kodu, toa ja mööbli sõna.',
        g_read: 'Õpilane leiab kodukirjeldusest ruumid, esemed ja nende asukohad.',
        g_notice: 'Õpilane märkab asukohamustreid laual, kapis, kõrval, ees ja taga.',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset asukohta kirjeldavat lauset.',
      },
    },
    additions: {
      vocab: block('a2b1_011_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kodu ja toa sõnavara',
        words: 'elutuba, magamistuba, köök, vannituba, esik, laud, kapp, riiul, voodi, diivan, akna kõrval, laua peal',
        columns: '3',
      }, 'full'),
      general: block('a2b1_011_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kuidas kodukirjeldusest aru saada?',
        instruction: 'Vali vastus, mis aitab ruumi kõige paremini ette kujutada.',
        questions: [
          { q: 'Milline info on toa kirjelduses kõige tähtsam?', options: '*Mis ruumis on ja kus asjad asuvad.\nKõigi esemete hind.\nAinult seinte värv.' },
          { q: 'Milline lause annab täpse asukoha?', options: '*Lamp on diivani kõrval.\nLamp on ilus.\nLamp maksab palju.' },
          { q: 'Milline küsimus aitab asukohta täpsustada?', options: '*Kus laud on?\nMillal sa sündisid?\nMiks buss hilineb?' },
        ],
      }),
      notice: block('a2b1_011_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka asukoha väljendeid.',
        lines: 'Raamat on **laual**.\nRiided on **kapis**.\nLamp on **diivani kõrval**.\nVaip on **laua ees** ja tugitool **akna juures**.',
      }),
      controlled: block('a2b1_011_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Pane asjad õigesse kohta.',
        instruction: 'Täienda laused sobiva asukohaväljendiga.',
        bank: 'laual, kapis, kõrval, ees, juures, seinal',
        showBank: 'yes',
        sentences: 'Arvuti on [laual].\nRiided on [kapis].\nLamp on voodi [kõrval].\nVaip on diivani [ees].\nTugitool on akna [juures].\nPilt on [seinal].',
      }, 'full'),
    },
  },
  'a2b1-012': {
    meta: {
      title: 'Kus? Kuhu? Kust?',
      subtitle: 'Eristan asukohta, liikumise sihtkohta ja lähtekohta.',
      canDo: 'Ma valin õige küsimuse ja kohavormi vähemalt 8 olukorras 10-st.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 sagedast kohta koos sobivate kohavormidega.',
        g_read: 'Õpilane saab aru, kas lause kirjeldab asukohta, liikumist sihtkohta või liikumist lähtekohast.',
        g_notice: 'Õpilane tuletab näidetest Kus? Kuhu? Kust? põhierinevuse.',
        g_use: 'Õpilane moodustab vähemalt 8 õiget kohavormi sagedastest sõnadest.',
      },
    },
    additions: {
      vocab: block('a2b1_012_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kolm küsimust, üks koht',
        words: 'koolis — kooli — koolist, poes — poodi — poest, tööl — tööle — töölt, kodus — koju — kodust, laual — lauale — laualt',
        columns: '2',
      }, 'full'),
      general: block('a2b1_012_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kus, kuhu või kust?',
        instruction: 'Vali küsimus, millele lause vastab.',
        questions: [
          { q: '„Ma olen praegu poes.”', options: '*Kus?\nKuhu?\nKust?' },
          { q: '„Ma lähen pärast tööd koju.”', options: '*Kuhu?\nKus?\nKust?' },
          { q: '„Ma tulen praegu koolist.”', options: '*Kust?\nKus?\nKuhu?' },
        ],
      }),
      notice: block('a2b1_012_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka liikumise suunda.',
        lines: '**Kus?** Olen koolis / tööl / laual.\n**Kuhu?** Lähen kooli / tööle / lauale.\n**Kust?** Tulen koolist / töölt / laualt.\nKüsimus muutub koos tegevusega: *olen* ≠ *lähen* ≠ *tulen*.',
      }),
      controlled: block('a2b1_012_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali õige kohavorm.',
        instruction: 'Täienda laused sulgudes oleva sõna õige vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Ma olen praegu [koolis] (kool).\nPärast tundi lähen [koju] (kodu).\nHommikul tulen [kodust] (kodu).\nTelefon on [laual] (laud).\nPane telefon [lauale] (laud).\nVõta telefon [laualt] (laud).',
      }, 'full'),
    },
  },
  'a2b1-013': {
    meta: {
      title: 'Kohad linnas',
      subtitle: 'Seostan linnakohad tüüpiliste tegevustega.',
      canDo: 'Ma nimetan vähemalt 12 linnakohta ja selgitan, mida neis tavaliselt tehakse.',
      goals: {
        g_vocab: 'Õpilane aktiveerib vähemalt 12 sagedast linnakohta.',
        g_read: 'Õpilane seostab tekstis koha selle funktsiooni või tegevusega.',
        g_notice: 'Õpilane märkab tüüpilisi mustreid kohas + tegevus ning vaja minna + kuhu.',
        g_use: 'Õpilane valib vähemalt 8 olukorras sobiva linnakoha ja kohavormi.',
      },
    },
    additions: {
      vocab: block('a2b1_013_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Linnas vajalikud kohad',
        words: 'pood, apteek, pank, raamatukogu, postkontor, jaam, bussipeatus, polikliinik, kohvik, turuplats, spordikeskus, linnavalitsus',
        columns: '3',
      }, 'full'),
      general: block('a2b1_013_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kuhu ma lähen?',
        instruction: 'Vali olukorrale kõige sobivam koht.',
        questions: [
          { q: 'Sul on vaja retseptiravimit kätte saada.', options: '*apteeki\nraamatukokku\nspordikeskusse' },
          { q: 'Tahad raamatu laenutada.', options: '*raamatukokku\npanka\njaama' },
          { q: 'Tahad saata paki.', options: '*postkontorisse\nkohvikusse\npolikliinikusse' },
          { q: 'Tahad võtta sularaha või rääkida kontost.', options: '*panka\nturuplatsile\nbussipeatusse' },
        ],
      }),
      notice: block('a2b1_013_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka koha ja tegevuse seost.',
        lines: 'Apteegis ostetakse ravimeid.\nRaamatukogus laenutatakse raamatuid.\nKui mul on vaja rahaasju korraldada, lähen panka.\nPärast tööd kohtun sõbraga kohvikus.',
      }),
      controlled: block('a2b1_013_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali koht konteksti järgi.',
        instruction: 'Täienda laused sobiva kohaga õiges vormis.',
        bank: 'apteeki, pangas, raamatukogust, postkontorisse, kohvikus, jaama',
        showBank: 'yes',
        sentences: 'Pean ravimi ostma, seega lähen [apteeki].\nMul on kohtumine [pangas].\nLaenutasin raamatu [raamatukogust].\nPean paki saatma, seega lähen [postkontorisse].\nKohtume pärast tööd [kohvikus].\nRongi peale minekuks lähen [jaama].',
      }, 'full'),
    },
  },
  'a2b1-014': {
    meta: {
      title: 'Tee küsimine ja juhatamine',
      subtitle: 'Küsin teed ja annan teisele inimesele selged juhised.',
      canDo: 'Ma annan vähemalt nelja järjestatud juhise abil arusaadava teekirjelduse.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 tee küsimise ja juhatamise väljendit.',
        g_read: 'Õpilane jälgib teekirjelduse samme õiges järjekorras.',
        g_notice: 'Õpilane märkab käskiva juhise põhivorme mine, pööra, ületa ja jätka.',
        g_use: 'Õpilane järjestab või täiendab vähemalt 6 juhist loogiliseks marsruudiks.',
      },
    },
    additions: {
      vocab: block('a2b1_014_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Teekirjelduse väljendid',
        words: 'mine otse, pööra paremale, pööra vasakule, ületa tee, mine üle silla, jätka kuni…, kõrval, vastas, lähedal, nurga peal',
        columns: '2',
      }, 'full'),
      general: block('a2b1_014_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb juhise arusaadavaks?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Milline juhis on kõige selgem?', options: '*Mine otse kaks kvartalit ja pööra siis paremale.\nMine sinna.\nVaata ise.' },
          { q: 'Milleks kasutatakse sõna „siis”?', options: '*Järgmise sammu näitamiseks.\nKoha omaniku näitamiseks.\nMineviku moodustamiseks.' },
          { q: 'Milline küsimus sobib tee küsimiseks?', options: '*Vabandust, kuidas ma saan raamatukokku?\nMis su lemmikvärv on?\nKui vana sa oled?' },
        ],
      }),
      notice: block('a2b1_014_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka juhise vormi.',
        lines: '**Mine** otse kuni ristmikuni.\n**Pööra** seal vasakule.\n**Ületa** tee ja **jätka** umbes 200 meetrit.\nApteek on paremal, panga **kõrval**.',
      }),
      controlled: block('a2b1_014_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Taasta juhis.',
        instruction: 'Täienda teekirjeldus nii, et marsruut oleks loogiline.',
        bank: 'mine, pööra, ületa, jätka, kõrval, siis',
        showBank: 'yes',
        sentences: '[Mine] otse kuni esimese ristmikuni.\n[Siis] pööra paremale.\n[Ületa] tee valgusfoori juures.\n[Jätka] otse umbes 100 meetrit.\n[Pööra] teise tänava juures vasakule.\nRaamatukogu on panga [kõrval].',
      }, 'full'),
    },
  },
  'a2b1-015': {
    meta: {
      title: 'Kontroll 3 — kodu ja linn',
      subtitle: 'Näitan, et oskan kirjeldada asukohta, liikumist ja teed.',
      canDo: 'Ma saan kodu ja linna teemalisest tekstist aru ning kasutan Kus? Kuhu? Kust? vorme praktilises olukorras.',
      goals: {
        g_vocab: 'Õpilane tunneb ära kodu, linnakohtade ja tee juhatamise põhivara.',
        g_read: 'Õpilane mõistab asukoha ja liikumise kohta antud põhiinfot ning detaile.',
        g_notice: 'Õpilane eristab Kus? Kuhu? Kust? mustreid ja juhise põhivorme.',
        g_use: 'Õpilane rakendab kohavorme ja teejuhiseid kontrollitud ülesandes vähemalt 70% täpsusega.',
      },
    },
    additions: {
      vocab: block('a2b1_015_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Enne kontrolli: võtmesõnad',
        words: 'laual, kapis, kõrval, kooli, koolist, tööle, töölt, apteek, raamatukogu, mine otse, pööra, ületa tee',
        columns: '3',
      }, 'full'),
      general: block('a2b1_015_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kontrolli põhiideed.',
        instruction: 'Vali vastus teksti või olukorra põhjal.',
        questions: [
          { q: '„Telefon on laual.” Millest lause räägib?', options: '*Asukohast.\nSihtkohast.\nLähtekohast.' },
          { q: '„Ma lähen apteeki.” Milline küsimus sobib?', options: '*Kuhu?\nKus?\nKust?' },
          { q: '„Pööra paremale ja mine otse.” Mis tüüpi keel see on?', options: '*Tee juhatamine.\nVälimuse kirjeldamine.\nPere tutvustamine.' },
        ],
      }),
      notice: block('a2b1_015_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk mustritele.',
        lines: 'Olen **koolis**. → Kus?\nLähen **kooli**. → Kuhu?\nTulen **koolist**. → Kust?\n**Mine** otse ja **pööra** teise tänava juures vasakule. → juhis.',
      }),
      controlled: block('a2b1_015_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa.',
        instruction: 'Täienda laused sobiva vormi või juhisega.',
        bank: '',
        showBank: 'no',
        sentences: 'Ma olen praegu [pangas] (pank).\nPärast seda lähen [apteeki] (apteek).\nTulen [raamatukogust] (raamatukogu).\nTelefon on [laual] (laud).\n[Mine] otse kuni ristmikuni.\nSeejärel [pööra] paremale.',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return entry?.type === 'vocab';
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|üld|kuidas|kuhu|mis teeb|kontrolli|aru)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|muster|vorm)/.test(title);
  if (category === 'controlled') return ['gaps', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(proovi|täienda|kontrollitud|vali|pane|taasta)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function upgradeAvastaModule3Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 3.`);
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

export const AVASTA_MODULE3_IDS = Object.freeze(Object.keys(SPECS));
