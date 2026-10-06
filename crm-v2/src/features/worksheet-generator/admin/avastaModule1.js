const MODULE = 'A2 lähtepunkt ja igapäevaelu';

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
  'a2b1-001': {
    meta: {
      title: 'A2 lähtediagnostika',
      subtitle: 'Mida ma juba oskan ja mida tasub järgmisena arendada?',
      canDo: 'Ma saan aru igapäevasest tekstist ja kasutan tuttavaid vorme oma vastustes.',
      goals: {
        g_vocab: 'Õpilane seostab vähemalt 8 igapäevast sõna või väljendit sobiva tähenduse või olukorraga.',
        g_read: 'Õpilane leiab tekstist põhiinfo ja eristab peamist mõtet detailidest.',
        g_notice: 'Õpilane märkab oleviku, küsimuste ja sagedaste käändevormide põhimustreid.',
        g_use: 'Õpilane kasutab vähemalt 5 sihtvormi lühikestes kontrollitud lausetes.',
      },
    },
    additions: {
      vocab: block('a2b1_001_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Sõnavara kontekstis',
        words: 'ärkama, tööle minema, õppima, tavaliselt, mõnikord, pärast tööd, vabal ajal, küsimust esitama, vastama, kokku leppima',
        columns: '3',
      }, 'full'),
      general: block('a2b1_001_av_general', 'choice', 'sky', 'g_read', {
        title: 'Saa esmalt põhimõttest aru.',
        instruction: 'Vali iga küsimuse juures kõige sobivam vastus. Ära otsi veel kõiki detaile.',
        questions: [
          { q: 'Mis on teksti peamine eesmärk?', options: '*Anda üldpilt inimese igapäevaelust ja keelekasutusest.\nKirjeldada ainult üht tööpäeva.\nSelgitada keerulist grammatikareeglit.' },
          { q: 'Millist infot on kõige olulisem märgata?', options: '*Mida inimene teeb, millal ta seda teeb ja kuidas ta sellest räägib.\nKõiki numbreid tekstis.\nAinult tundmatuid sõnu.' },
          { q: 'Mida näitab hea vastus selles tunnis?', options: '*Õpilane saab küsimusest aru ja vastab oma sõnadega.\nÕpilane kordab teksti sõna-sõnalt.\nÕpilane kasutab võimalikult pikki lauseid.' },
        ],
      }),
      notice: block('a2b1_001_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka keelt.',
        lines: 'Ma elan Tallinnas. → kus? Tallinnas.\nMa lähen tööle kell kaheksa. → kuhu? tööle.\nMida sa tavaliselt õhtul teed? → küsisõna + sina + tegevus.\nMa tavaliselt loen, aga mõnikord vaatan filmi. → sagedussõna aitab harjumust kirjeldada.',
      }),
      controlled: block('a2b1_001_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Proovi ilma suure abita.',
        instruction: 'Täienda laused sobiva vormiga. Sõnapanka ei ole.',
        bank: '',
        showBank: 'no',
        sentences: 'Ma elan [Tallinnas|Tartus|Pärnus] ja töötan kesklinnas.\nHommikul ma tavaliselt [joon] kohvi või teed.\nPärast tööd ma [lähen] koju või trenni.\nMida sa õhtul tavaliselt [teed]?\nNädalavahetusel ma mõnikord [kohtun] sõpradega.',
      }, 'full'),
    },
  },
  'a2b1-002': {
    meta: {
      title: 'Minu päev ja kellaaeg',
      subtitle: 'Räägin oma tavalisest päevast selges järjekorras.',
      canDo: 'Ma räägin oma päevast 1,5–2 minutit ja kasutan vähemalt viit ajamarkerit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 igapäevase tegevuse ja aja väljendit sobivas kontekstis.',
        g_read: 'Õpilane leiab päevakirjeldusest tegevuste üldise järjekorra ja peamised ajad.',
        g_notice: 'Õpilane märkab, kuidas ajamäärus paikneb lause alguses või tegevuse lähedal.',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset lauset olevikus koos ajamarkeriga.',
      },
    },
    additions: {
      vocab: block('a2b1_002_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Päeva võtmesõnad',
        words: 'ärkama, üles tõusma, hommikusööki sööma, tööle minema, lõunat sööma, koju tulema, puhkama, trenni tegema, tavaliselt, enne, pärast, seejärel',
        columns: '3',
      }, 'full'),
      general: block('a2b1_002_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis on päevakirjelduse loogika?',
        instruction: 'Vali parim vastus.',
        questions: [
          { q: 'Mille järgi on tegevused kõige lihtsam järjestada?', options: '*Aja ja päevaosade järgi.\nTähestiku järgi.\nSõnade pikkuse järgi.' },
          { q: 'Milline lause aitab liikuda ühe tegevuse juurest järgmise juurde?', options: '*Pärast seda lähen tööle.\nTöö on oluline.\nMulle meeldib Tallinn.' },
          { q: 'Milline vastus on kõige sidusam?', options: '*Hommikul ärkan kell seitse. Seejärel söön hommikusööki ja pärast seda lähen tööle.\nÄrkan. Söön. Töö.\nKell seitse, töö, õhtu.' },
        ],
      }),
      notice: block('a2b1_002_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka: aeg aitab lauset korraldada.',
        lines: 'Hommikul ärkan ma kell seitse.\nMa ärkan tavaliselt kell seitse.\nPärast hommikusööki lähen tööle.\nÕhtul puhkan kodus või teen trenni.',
      }),
      controlled: block('a2b1_002_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ehita päev samm-sammult.',
        instruction: 'Täienda laused. Kasuta sõnapanka nii, et päev oleks loogilises järjekorras.',
        bank: 'hommikul, tavaliselt, pärast, seejärel, õhtul, enne',
        showBank: 'yes',
        sentences: 'Ma ärkan [tavaliselt] kell seitse.\n[Hommikul] söön hommikusööki.\n[Pärast] hommikusööki lähen tööle.\nLõuna ajal söön ja [seejärel] jätkan tööd.\n[Õhtul] tulen koju ja puhkan.\n[Enne] magamaminekut loen natuke.',
      }, 'full'),
    },
  },
  'a2b1-003': {
    meta: {
      title: 'Sagedus ja lihtne lausejärg',
      subtitle: 'Ütlen, kui tihti midagi teen, ja hoian lause selge.',
      canDo: 'Ma kasutan sagedussõnu ja moodustan arusaadavaid lihtlauseid õiges järjekorras.',
      goals: {
        g_vocab: 'Õpilane eristab ja kasutab vähemalt 6 sagedusmäärsõna.',
        g_read: 'Õpilane saab aru, milline tegevus toimub sageli, harva või mitte kunagi.',
        g_notice: 'Õpilane märkab sagedussõna tavalist kohta lihtlauses.',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset lauset sagedussõnaga.',
      },
    },
    additions: {
      vocab: block('a2b1_003_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kui tihti?',
        words: 'alati, peaaegu alati, tavaliselt, sageli, mõnikord, harva, peaaegu mitte kunagi, mitte kunagi',
        columns: '4',
      }, 'full'),
      general: block('a2b1_003_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mida sagedussõna meile ütleb?',
        instruction: 'Vali tähendus, mis sobib kõige paremini.',
        questions: [
          { q: 'Kui inimene ütleb „Ma käin sageli jala”, mida see tähendab?', options: '*Ta teeb seda paljudel päevadel, kuid mitte alati.\nTa ei tee seda kunagi.\nTa tegi seda ainult eile.' },
          { q: 'Milline sõna näitab kõige väiksemat sagedust?', options: '*mitte kunagi\nsageli\ntavaliselt' },
          { q: 'Milline lause räägib harjumusest?', options: '*Ma tavaliselt söön lõunat kell üks.\nMa sõin eile lõunat kell üks.\nSöö lõunat kell üks!' },
        ],
      }),
      notice: block('a2b1_003_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka lausejärge.',
        lines: 'Ma tavaliselt lähen tööle bussiga.\nHommikul lähen ma tavaliselt tööle bussiga.\nMa ei joo kunagi õhtul kohvi.\nMõnikord kohtun pärast tööd sõbraga.',
      }),
      controlled: block('a2b1_003_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali sobiv sagedus.',
        instruction: 'Täienda laused ühe sobiva sagedussõnaga. Mõnes lauses on mitu võimalikku vastust.',
        bank: 'alati, tavaliselt, sageli, mõnikord, harva, mitte kunagi',
        showBank: 'yes',
        sentences: 'Ma [tavaliselt|sageli] söön hommikusööki kodus.\nNädalavahetusel ma [mõnikord|sageli] magan kauem.\nMa [mitte kunagi] ei lähe magama kell kuus õhtul.\nPärast tööd ma [mõnikord|sageli] teen trenni.\nMa [harva|mõnikord] vaatan televiisorit hommikul.\nMa [alati|tavaliselt] pesen hommikul hambaid.',
      }, 'full'),
    },
  },
  'a2b1-004': {
    meta: {
      title: 'Minu nädal',
      subtitle: 'Seon nädalapäevad ja tegevused üheks loogiliseks jutuks.',
      canDo: 'Ma räägin oma nädalast 6–8 seotud lausega ja kasutan siduvaid ajaväljendeid.',
      goals: {
        g_vocab: 'Õpilane kasutab nädalapäevi ja vähemalt 6 nädalaplaani väljendit.',
        g_read: 'Õpilane leiab nädalakirjeldusest peamised tegevused ja võrdleb argipäeva nädalavahetusega.',
        g_notice: 'Õpilane märkab, kuidas siis, pärast seda, aga ja ja seovad lauseid.',
        g_use: 'Õpilane ühendab vähemalt 6 lühilauset sidusaks nädalakirjelduseks.',
      },
    },
    additions: {
      vocab: block('a2b1_004_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Nädalast rääkides',
        words: 'esmaspäeval, teisipäeval, kolmapäeval, neljapäeval, reedel, nädalavahetusel, tööpäev, vaba päev, siis, pärast seda, aga, tavaliselt',
        columns: '3',
      }, 'full'),
      general: block('a2b1_004_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb nädalajutu selgeks?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Mida kuulaja peab kõigepealt aru saama?', options: '*Mis päeval või millal tegevus toimub.\nKui pikk iga sõna on.\nMilline sõna on kõige raskem.' },
          { q: 'Milleks kasutatakse sõna „aga”?', options: '*Kahe erineva või vastanduva mõtte ühendamiseks.\nAinult aja ütlemiseks.\nKüsimuse alustamiseks.' },
          { q: 'Milline järjekord on loomulik?', options: '*Reedel lõpetan töö, pärast seda kohtun sõpradega ja nädalavahetusel puhkan.\nNädalavahetusel, esmaspäeval, pärast seda reedel.\nKohtun, reedel, puhkan, sest.' },
        ],
      }),
      notice: block('a2b1_004_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka siduvaid sõnu.',
        lines: 'Esmaspäeval töötan kaua, **aga** teisipäeval lõpetan varem.\nKolmapäeval käin trennis ja **pärast seda** lähen koju.\nReedel kohtun sõpradega, **siis** algab minu nädalavahetus.\nLaupäeval puhkan **ja** pühapäeval teen koduseid töid.',
      }),
      controlled: block('a2b1_004_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Seo nädal kokku.',
        instruction: 'Täienda laused siduva sõna või ajaväljendiga.',
        bank: 'esmaspäeval, pärast seda, aga, siis, nädalavahetusel, ja',
        showBank: 'yes',
        sentences: '[Esmaspäeval] alustan uut töönädalat.\nKolmapäeval käin trennis ja [pärast seda] lähen koju.\nNeljapäeval töötan kaua, [aga] reedel lõpetan varem.\nReedel kohtun sõpradega, [siis] lähen koju.\n[Nädalavahetusel] puhkan rohkem.\nLaupäeval teen süüa [ja] pühapäeval käin jalutamas.',
      }, 'full'),
    },
  },
  'a2b1-005': {
    meta: {
      title: 'Kontroll 1 — igapäevaelu',
      subtitle: 'Näitan, mida oskan igapäevaelust rääkides juba iseseisvalt kasutada.',
      canDo: 'Ma saan igapäevaelu teemal küsimustest aru ja vastan sidusalt ilma liigsete vihjeteta.',
      goals: {
        g_vocab: 'Õpilane tunneb ära igapäevaelu põhivara ja kasutab seda sobivas kontekstis.',
        g_read: 'Õpilane mõistab lühikese teksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane eristab oleviku, aja ja sageduse tüüpilisi keelemustreid.',
        g_use: 'Õpilane rakendab sihtvorme kontrollitud ülesandes vähemalt 70% täpsusega.',
      },
    },
    additions: {
      vocab: block('a2b1_005_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Enne kontrolli: võtmesõnad',
        words: 'hommikul, tavaliselt, sageli, mõnikord, pärast, enne, tööpäev, nädalavahetus, alustama, lõpetama, puhkama, kohtuma',
        columns: '3',
      }, 'full'),
      general: block('a2b1_005_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kontrolli teksti põhiideed.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis on teksti keskne teema?', options: '*Inimese igapäevane rütm ja harjumused.\nÜhe linna ajalugu.\nTöökoha reeglid.' },
          { q: 'Milline info aitab kõige paremini mõista inimese rutiini?', options: '*Millal ja kui sageli ta erinevaid tegevusi teeb.\nTema lemmikvärv.\nKõigi inimeste nimed.' },
          { q: 'Mida peab vastamisel tegema?', options: '*Valima tekstiga kooskõlas oleva mõtte.\nArvama, mida autor võiks mõelda.\nKasutama ainult väga pikki lauseid.' },
        ],
      }),
      notice: block('a2b1_005_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk mustritele.',
        lines: 'Hommikul **lähen** tööle. → olevik kirjeldab rutiini.\nMa **tavaliselt** söön lõunat kell üks. → sagedussõna täpsustab harjumust.\n**Pärast** tööd lähen koju. → ajasuhe seob tegevused.\n**Mida sa õhtul teed?** → küsisõna + tegija + tegevus.',
      }),
      controlled: block('a2b1_005_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa.',
        instruction: 'Täienda laused ilma sõnapangata. Kirjuta ainult vajalik sõna või vorm.',
        bank: '',
        showBank: 'no',
        sentences: 'Ma [tavaliselt] ärkan kell seitse.\nPärast hommikusööki ma [lähen] tööle.\nKolmapäeval ma mõnikord [teen] trenni.\nReedel lõpetan töö ja [pärast] seda kohtun sõbraga.\nMida sa nädalavahetusel tavaliselt [teed]?\nMa ei joo [kunagi] õhtul kohvi.',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');

const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return entry?.type === 'vocab';
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|üld|mõte|esmalt|aru)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|keelemudel|muster)/.test(title);
  if (category === 'controlled') return ['gaps', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(proovi|täienda|kontrollitud|vali|järjesta|moodusta|seo)/.test(title);
  return false;
});

const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function upgradeAvastaModule1Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 1.`);
  const original = Array.isArray(document?.blocks) ? document.blocks : [];
  let blocks = [...original];
  const added = [];

  const add = (category, item, position) => {
    if (hasCategory(blocks, category) || blocks.some((entry) => entry?.id === item.id)) return;
    if (blocks.length >= 9) throw new Error(`${lessonId}: Avasta sisaldab juba ${blocks.length} plokki ja ${category} puudub. Automaatne täiendamine peatati, et mitte teha üle 9 ploki.`);
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
  if (selfcheck.length === 1 && blocks.at(-1)?.type !== 'selfcheck') {
    blocks = [...blocks.filter((entry) => entry?.type !== 'selfcheck'), selfcheck[0]];
  }

  if (blocks.length < 7 || blocks.length > 9) {
    throw new Error(`${lessonId}: pärast täiendamist on ${blocks.length} plokki; nõutud vahemik on 7–9.`);
  }

  const meta = {
    ...(document?.meta || {}),
    title: spec.meta.title,
    subtitle: spec.meta.subtitle,
    level: 'B1',
    module: MODULE,
    canDo: spec.meta.canDo,
    goals: { ...(document?.meta?.goals || {}), ...spec.meta.goals },
  };

  return {
    document: { ...document, meta, blocks },
    added,
    before: original.length,
    after: blocks.length,
  };
}

export const AVASTA_MODULE1_IDS = Object.freeze(Object.keys(SPECS));
export const AVASTA_MODULE1_SPECS = SPECS;
