const MODULE = 'Aeg, plaanid ja kohustused';

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
  'a2b1-016': {
    meta: {
      title: 'Ajamäärused ja päevaplaan',
      subtitle: 'Räägin ajast, kestusest ja tegevuste järjekorrast.',
      canDo: 'Ma kirjeldan oma päevaplaani ja kasutan vähemalt kuut ajamarkerit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 aja ja päevaplaani väljendit.',
        g_read: 'Õpilane leiab päevaplaanist tegevuste järjekorra, algus- ja lõpuaja.',
        g_notice: 'Õpilane märkab alates… kuni…, enne, pärast, kõigepealt, siis ja lõpuks mustreid.',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset lauset aja ja tegevuste järjekorraga.',
      },
    },
    additions: {
      vocab: block('a2b1_016_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Aeg ja järjekord',
        words: 'kell…, alates…, kuni…, enne, pärast, kõigepealt, siis, seejärel, lõpuks, umbes, pool tundi, tund aega',
        columns: '3',
      }, 'full'),
      general: block('a2b1_016_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kuidas päevaplaanist aru saada?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Milline info näitab tegevuse kestust?', options: '*alates kell üheksa kuni kell üksteist\nhommikul\nsiis' },
          { q: 'Milline sõna näitab esimest sammu?', options: '*kõigepealt\nlõpuks\npärast' },
          { q: 'Milline sõna sobib viimase tegevuse ette?', options: '*lõpuks\nenne\nalates' },
        ],
      }),
      notice: block('a2b1_016_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka ajamustreid.',
        lines: 'Töötan **alates kell üheksa kuni kell viis**.\n**Kõigepealt** vastan kirjadele, **siis** teen tähtsamad ülesanded.\n**Pärast** lõunat on mul koosolek.\n**Lõpuks** kontrollin homset päevaplaani.',
      }),
      controlled: block('a2b1_016_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ehita loogiline päevaplaan.',
        instruction: 'Täienda laused sobiva ajamarkeriga.',
        bank: 'kõigepealt, alates, kuni, pärast, siis, lõpuks',
        showBank: 'yes',
        sentences: '[Kõigepealt] söön hommikusööki.\nTöötan [alates] kell üheksa [kuni] kell viis.\n[Pärast] lõunat on mul koosolek.\nKoosoleku järel teen ühe telefonikõne ja [siis] kirjutan aruande.\n[Lõpuks] vaatan üle homse plaani.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_016_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta oma päevast.',
        instruction: 'Vali vastus, mis sobib sinu tavalise päevaga kõige paremini.',
        questions: [
          { q: 'Millal sul on tavaliselt kõige kiirem aeg?', options: '*hommikul\npäeval\nõhtul' },
          { q: 'Kuidas sa oma päeva tavaliselt planeerid?', options: '*kalendris või telefonis\npeast\nei planeeri üldse' },
        ],
      }),
      reading: block('a2b1_016_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe päevaplaani.',
        instruction: 'Loe tekst läbi. Seejärel vasta detailiküsimustele.',
        passageTitle: 'Kristi tööpäev',
        passage: 'Kristi töötab väikeses ettevõttes. Tema tööpäev algab tavaliselt kell üheksa, kuid ta jõuab kontorisse umbes veerand tundi varem. Kõigepealt teeb ta kohvi ja vaatab üle päevaplaani. Alates kella üheksast kuni üheteistkümneni vastab ta kirjadele ja teeb keskendumist nõudvaid ülesandeid. Enne lõunat helistab ta klientidele. Kell kaksteist sööb Kristi koos kolleegidega lõunat. Pärast lõunat on tal sageli üks või kaks koosolekut. Umbes kell neli kontrollib ta, mis on veel tegemata, ja lõpetab tähtsamad asjad. Kui mõni ülesanne ei ole kiire, märgib ta selle järgmise päeva plaani. Tööpäev lõpeb kell viis. Siis läheb ta koju või trenni. Õhtul püüab ta tööasjadele enam mitte mõelda ja jätab telefoni mõneks ajaks kõrvale.',
        questions: 'Mis kell Kristi tööpäev tavaliselt algab? [kell üheksa|üheksa|9|9.00|09.00]\nMida ta teeb kõigepealt? [teeb kohvi ja vaatab üle päevaplaani|teeb kohvi|vaatab üle päevaplaani]\nMillal ta helistab klientidele? [enne lõunat]\nKellega ta lõunat sööb? [kolleegidega|koos kolleegidega]\nMis kell tööpäev lõpeb? [kell viis|viis|5|17.00|17]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_016_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma päevaplaanist.',
        instruction: 'Räägi 1–2 minutit. Kasuta vähemalt kuut ajamarkerit.',
        questions: 'Mis kell sinu päev tavaliselt algab?\nMida teed kõigepealt?\nMillal töötad või õpid?\nMida teed enne ja pärast lõunat?\nMis juhtub õhtul?\nMida teed lõpuks enne magamaminekut?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta kindlasti:',
        tipText: 'alates…, kuni…, kõigepealt, siis, pärast, lõpuks',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_016_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.',
        titleMore: 'Kas ma oskan?',
        instruction: '',
        items: 'Ma oskan öelda, millal tegevus algab ja lõpeb.\nMa oskan kasutada väljendeid *alates… kuni…*.\nMa oskan seostada tegevusi sõnadega *kõigepealt, siis, pärast, lõpuks*.\nMa oskan rääkida oma päevaplaanist vähemalt 1 minuti.\nJärgmises tunnis tahan paremini harjutada ühte ajaväljendit.',
        stamp: 'Plaan on selgem!',
      }, 'full'),
    },
  },
  'a2b1-017': {
    meta: {
      title: 'Peab, võib ja saab',
      subtitle: 'Eristan kohustust, luba ja võimalust.',
      canDo: 'Ma valin peab, võib või saab vastavalt olukorra tähendusele vähemalt 8 juhul 10-st.',
      goals: {
        g_vocab: 'Õpilane kasutab töö, kooli ja kodu reeglite põhivara.',
        g_read: 'Õpilane eristab tekstis kohustust, luba ja võimalust.',
        g_notice: 'Õpilane märkab peab + ma-infinitiiv ning võib/saab + da-infinitiiv mustreid.',
        g_use: 'Õpilane kasutab peab, võib ja saab õiges tähenduses vähemalt 8 kontekstis 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_017_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Reeglid ja võimalused',
        words: 'peab tegema, ei pea tegema, võib teha, ei või teha, saab teha, ei saa teha, reegel, luba, kohustus, võimalus',
        columns: '3',
      }, 'full'),
      general: block('a2b1_017_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis tähendus on tähtis?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: '„Tööl peab kandma turvajalatseid.”', options: '*kohustus\nluba\nvõimalus' },
          { q: '„Siin võib telefoni kasutada.”', options: '*luba\nkohustus\nkeeld' },
          { q: '„Seda saab teha internetis.”', options: '*võimalus\nkohustus\nkeeld' },
        ],
      }),
      notice: block('a2b1_017_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka vormi ja tähendust.',
        lines: 'Ma **pean minema** tööle. → peab + ma-infinitiiv.\nSiin **võib istuda**. → võib + da-infinitiiv.\nSeda **saab teha** veebis. → saab + da-infinitiiv.\nTäna **ei pea tulema** varem. → kohustust ei ole.',
      }),
      controlled: block('a2b1_017_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali peab, võib või saab.',
        instruction: 'Täienda laused tähenduse järgi.',
        bank: 'peab, võib, saab, ei pea, ei või, ei saa',
        showBank: 'yes',
        sentences: 'Raamatukogus [ei või] valjusti rääkida.\nArsti juurde [peab] aja kokku leppima.\nSelle avalduse [saab] internetis täita.\nPühapäeval [ei pea] tööle minema.\nSiin [võib] tasuta parkida kaks tundi.\nIlma paroolita [ei saa] kontole sisse logida.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_017_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis on sinu elus reegel?',
        instruction: 'Vali olukord ja mõtle, kas seal on kohustus, luba või võimalus.',
        questions: [
          { q: 'Kus on sul kõige rohkem reegleid?', options: '*tööl või koolis\nkodus\nliikluses' },
          { q: 'Milline sõna tähendab sinu jaoks kõige tugevamat kohustust?', options: '*peab\nvõib\nsaab' },
        ],
      }),
      reading: block('a2b1_017_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe uue töötaja juhiseid.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Esimene päev tööl',
        passage: 'Markus alustab uut tööd laos. Esimesel päeval selgitab juhataja talle põhireegleid. Töötaja peab kandma turvavesti ja kinniseid jalanõusid. Tööalal ei või kõrvaklappe kasutada, sest seal liiguvad tõstukid. Pausi ajal võib telefoni vaadata ja puhkeruumis saab tasuta kohvi teha. Kui Markus ei saa mõnest ülesandest aru, võib ta alati juhendajalt küsida. Tööpäeva lõpus peab ta oma töökoha korrastama, kuid ta ei pea ise kõiki seadmeid puhastama. Mõne dokumendi saab täita arvutis ja teised peab allkirjastama paberil. Enne töö alustamist võib ta oma isiklikud asjad lukustatavasse kappi panna. Markus märgib juhised üles, sest esimesel päeval on uut infot palju ja kõike korraga meelde jätta on raske.',
        questions: 'Mida Markus peab kandma? [turvavesti ja kinniseid jalanõusid|turvavesti|kinniseid jalanõusid]\nMida ei või tööalal kasutada? [kõrvaklappe]\nMillal võib telefoni vaadata? [pausi ajal|pausil]\nKellelt võib Markus abi küsida? [juhendajalt]\nMida peab ta tööpäeva lõpus tegema? [töökoha korrastama|oma töökoha korrastama]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_017_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Selgita kolme reeglit.',
        instruction: 'Räägi 1–2 minutit ühest kohast: kodu, töö, kool, trenn või liiklus.',
        questions: 'Mida seal peab tegema?\nMida seal ei pea tegema?\nMida võib teha?\nMida ei või teha?\nMida saab vajadusel teha?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta kolme tähendust:',
        tipText: 'kohustus: peab · luba: võib · võimalus: saab',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_017_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma eristan kohustust, luba ja võimalust.\nMa oskan kasutada *peab + ma-infinitiiv*.\nMa oskan kasutada *võib/saab + da-infinitiiv*.\nMa oskan kirjeldada vähemalt kolme reeglit.\nJärgmises tunnis tahan paremini harjutada üht modaalset konstruktsiooni.',
        stamp: 'Tähendus on paigas!',
      }, 'full'),
    },
  },
  'a2b1-018': {
    meta: {
      title: 'Mida ma pean tegema?',
      subtitle: 'Räägin kohustustest, vajadustest ja prioriteetidest.',
      canDo: 'Ma selgitan vähemalt viit kohustust ja kahte prioriteeti ning põhjendan, miks need on tähtsad.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 kohustuse, vajaduse ja prioriteedi väljendit.',
        g_read: 'Õpilane eristab tekstis kohustusi, soove ja takistusi.',
        g_notice: 'Õpilane märkab pean, ei pea, tahan, ei saa ja mul on vaja tähenduserinevusi.',
        g_use: 'Õpilane moodustab vähemalt 6 lauset oma kohustuste ja prioriteetide kohta.',
      },
    },
    additions: {
      vocab: block('a2b1_018_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kohustused ja prioriteedid',
        words: 'pean tegema, ei pea tegema, mul on vaja, tahan teha, ei saa teha, tähtis, kiire, enne, hiljem, prioriteet, abi küsima, edasi lükkama',
        columns: '3',
      }, 'full'),
      general: block('a2b1_018_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kohustus või soov?',
        instruction: 'Vali tähendus, mis sobib lausega.',
        questions: [
          { q: '„Mul on vaja arve täna ära maksta.”', options: '*vajadus\nlihtne soov\nluba' },
          { q: '„Ma tahan õhtul trenni minna.”', options: '*soov\nkohustus\nkeeld' },
          { q: '„Ma ei saa praegu helistada.”', options: '*takistus või võimatus\nkohustus\nluba' },
        ],
      }),
      notice: block('a2b1_018_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka, mida iga väljend tähendab.',
        lines: 'Ma **pean** täna aruande lõpetama. → kohustus.\nMul **on vaja** arstile helistada. → vajadus.\nMa **tahan** õhtul puhata. → soov.\nMa **ei saa** kell kolm kohtuda. → praegu pole võimalik.',
      }),
      controlled: block('a2b1_018_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Pane prioriteedid sõnadesse.',
        instruction: 'Täienda laused sobiva väljendiga.',
        bank: 'pean, ei pea, mul on vaja, tahan, ei saa, hiljem',
        showBank: 'yes',
        sentences: 'Täna [pean] lõpetama ühe tähtsa töö.\nMul [on vaja] enne õhtut poodi minna.\nSeda väikest ülesannet ma täna [ei pea] tegema.\nMa [tahan] õhtul perega aega veeta.\nKell kaks ma [ei saa] kohtuda.\nVähem kiire töö teen [hiljem].',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_018_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis ootab sind täna?',
        instruction: 'Vali variant, mis kirjeldab sinu tänast päeva kõige paremini.',
        questions: [
          { q: 'Kui palju sul täna kohustusi on?', options: '*vähe\numbes viis\nväga palju' },
          { q: 'Kuidas otsustad, mida teha esimesena?', options: '*vaatan, mis on kiire ja tähtis\nteen juhuslikult\nteen ainult meeldivaid asju' },
        ],
      }),
      reading: block('a2b1_018_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe Toomase nimekirja.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kõike ei jõua korraga',
        passage: 'Toomasel on täna palju tegemist. Hommikul peab ta viima auto teenindusse ja enne kella kümmet saatma ühe tähtsa töömeili. Tal on vaja ka apteegist ravim ära tuua. Lõuna ajal tahab ta kohtuda sõbraga, kuid ta ei saa pikalt kohvikus olla, sest kell kaks algab veebikoosolek. Õhtuks peab Toomas maksma elektriarve. Korteri koristamine ei ole täna nii kiire ja selle saab ta edasi lükata homsele. Pärast tööd tahab ta teha trenni, aga kui päev venib pikaks, võib ta trenni asemel lihtsalt jalutama minna. Lisaks peab ta õhtul emale helistama, kuid seda saab teha ka veidi hiljem. Toomas otsustab, et kõigepealt teeb ta ära need asjad, millel on kindel tähtaeg.',
        questions: 'Mida peab Toomas enne kella kümmet tegema? [saatma tähtsa töömeili|töömeili saatma|meili saatma]\nMida on tal vaja apteegist tuua? [ravim|ravim ära tuua]\nMiks ei saa ta kaua kohvikus olla? [kell kaks algab veebikoosolek|tal algab kell kaks veebikoosolek]\nMida saab ta homsele edasi lükata? [korteri koristamise|koristamise]\nMillised asjad teeb ta kõigepealt? [kindla tähtajaga asjad|need asjad millel on kindel tähtaeg]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_018_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma prioriteetidest.',
        instruction: 'Räägi 1–2 minutit. Nimeta vähemalt viis kohustust ja kaks prioriteeti.',
        questions: 'Mida sa täna pead tegema?\nMida sul on vaja teha?\nMida sa ei pea täna tegema?\nMida sa tahad teha?\nMida sa praegu ei saa teha?\nMillised kaks asja on kõige tähtsamad ja miks?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'pean · ei pea · mul on vaja · tahan · ei saa · kõige tähtsam on… sest…',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_018_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan rääkida oma kohustustest.\nMa eristan väljendeid *pean*, *mul on vaja* ja *tahan*.\nMa oskan öelda, mida ma praegu ei saa teha.\nMa oskan nimetada kaks prioriteeti ja neid põhjendada.\nJärgmises tunnis tahan harjutada oma plaani muutmist.',
        stamp: 'Prioriteedid on selged!',
      }, 'full'),
    },
  },
  'a2b1-019': {
    meta: {
      title: 'Kokkulepe ja aja muutmine',
      subtitle: 'Pakun aega, keeldun viisakalt ja leian alternatiivi.',
      canDo: 'Ma viin läbi kolm lühikest kokkuleppedialoogi, kus pakun aega, keeldun vajadusel ja pakun alternatiivi.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 kokkuleppe ja aja muutmise väljendit.',
        g_read: 'Õpilane leiab dialoogist algse aja, probleemi ja uue kokkuleppe.',
        g_notice: 'Õpilane märkab Kas sulle sobib…?, Kahjuks ei saa ja Aga kuidas oleks…? funktsioone.',
        g_use: 'Õpilane lõpetab vähemalt 3 kokkulepet sobiva alternatiiviga.',
      },
    },
    additions: {
      vocab: block('a2b1_019_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Kokkuleppe fraasid',
        words: 'Kas sulle sobib…?, Kas sa saad…?, Kahjuks ei saa., Mul on siis…, Aga kuidas oleks…?, Kas sobib hoopis…?, Sobib küll., Lepime kokku.',
        columns: '2',
      }, 'full'),
      general: block('a2b1_019_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kuidas hea kokkulepe töötab?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Mida teha, kui pakutud aeg ei sobi?', options: '*Keelduda viisakalt ja pakkuda alternatiiv.\nÖelda ainult „ei”.\nVestlus lõpetada.' },
          { q: 'Milline fraas pakub uut aega?', options: '*Aga kuidas oleks neljapäeval kell kuus?\nKahjuks ei saa.\nTere!' },
          { q: 'Milline vastus lõpetab kokkuleppe?', options: '*Sobib küll, lepime nii kokku.\nEks näis.\nVõib-olla kunagi.' },
        ],
      }),
      notice: block('a2b1_019_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kolme sammu.',
        lines: '1. **Kas sulle sobib** kolmapäeval kell viis? → ettepanek.\n2. **Kahjuks ei saa**, mul on siis trenn. → viisakas keeldumine + põhjus.\n3. **Aga kuidas oleks** neljapäeval kell kuus? → alternatiiv.\n**Sobib küll, lepime kokku.** → kokkulepe on valmis.',
      }),
      controlled: block('a2b1_019_av_controlled', 'dialogue', 'green', 'g_use', {
        title: 'Taasta kokkulepe.',
        instruction: 'Kirjuta puuduvad fraasid.',
        speakerA: 'Mari',
        speakerB: 'Jaan',
        lines: [
          { who: 'A', text: '[Kas sulle sobib] teisipäeval kell viis?' },
          { who: 'B', text: '[Kahjuks ei saa], mul on siis töö.' },
          { who: 'A', text: '[Aga kuidas oleks] kolmapäeval kell kuus?' },
          { who: 'B', text: 'Jah, [sobib küll].' },
          { who: 'A', text: 'Väga hea, [lepime kokku].' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_019_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kui plaan muutub…',
        instruction: 'Vali, mida sina tavaliselt teed.',
        questions: [
          { q: 'Kui kokkulepitud aeg ei sobi, mida teed?', options: '*pakun kohe uue aja\nütlen ainult „ei”\nlasen teisel ise arvata' },
          { q: 'Kus lepib tänapäeval kõige sagedamini aega kokku?', options: '*sõnumis või telefonis\nnäost näkku\nmõlemal viisil' },
        ],
      }),
      reading: block('a2b1_019_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe sõnumivahetust.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kohtumise aeg muutub',
        passage: 'Anu ja Sergei plaanisid kohtuda kolmapäeval kell 17 kohvikus. Teisipäeva õhtul saab Anu teada, et tal on kolmapäeval töökoosolek, mis lõpeb alles kell 17.30. Ta kirjutab Sergeile: „Kahjuks ei saa ma homme kell viis kohtuda. Mul on töökoosolek. Kas sulle sobiks kell pool seitse?” Sergei vastab, et õhtul on tal trenn ja pool seitse ei sobi. Ta pakub neljapäeva kell 18. Anu kontrollib kalendrit ja ütleb, et neljapäev sobib hästi. Nad lepivad kokku, et kohtuvad samas kohvikus kell kuus. Sergei küsib veel, kas sama laud akna juures sobib, ja Anu nõustub. Mõlemad kinnitavad uue aja sõnumiga, et hiljem ei tekiks segadust.',
        questions: 'Millal pidid nad alguses kohtuma? [kolmapäeval kell 17|kolmapäeval kell viis]\nMiks Anu ei saa algsel ajal tulla? [tal on töökoosolek|töökoosoleku pärast]\nMis aega Anu esimesena asemele pakub? [kell pool seitse|18.30|pool seitse]\nMiks see aeg Sergeile ei sobi? [tal on trenn|trenni pärast]\nMillal nad lõpuks kohtuvad? [neljapäeval kell 18|neljapäeval kell kuus]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_019_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Tee kolm kokkulepet.',
        instruction: 'Räägi 1–2 minutit. Lahenda kolm olukorda: arst, sõber ja töökohtumine.',
        questions: 'Paku esimene aeg.\nKujuta ette, et teine inimene ei saa.\nReageeri viisakalt.\nPaku uus aeg.\nKinnita lõplik kokkulepe.\nKasuta iga kord vähemalt üht põhjust.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasulikud fraasid:',
        tipText: 'Kas sulle sobib…? · Kahjuks ei saa. · Aga kuidas oleks…? · Sobib küll. · Lepime kokku.',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_019_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan pakkuda kohtumise aega.\nMa oskan viisakalt öelda, et aeg ei sobi.\nMa oskan anda lühikese põhjuse.\nMa oskan pakkuda alternatiivset aega ja kokkuleppe kinnitada.\nJärgmises tunnis tahan harjutada kiiremat spontaanset vastamist.',
        stamp: 'Kokkulepe tehtud!',
      }, 'full'),
    },
  },
  'a2b1-020': {
    meta: {
      title: 'Vahehindamine 1 — A2 baas',
      subtitle: 'Näitan iseseisvalt, mida oskan esimese 20 tunni teemadest kasutada.',
      canDo: 'Ma lahendan igapäevaelu, pere, linna ja kohustuste ülesandeid iseseisvalt ning suhtlen arusaadavalt.',
      goals: {
        g_vocab: 'Õpilane kasutab esimese 20 tunni põhivara ilma ulatusliku sõnapangata.',
        g_read: 'Õpilane mõistab B1-le ülemineku tasemel igapäevateksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane rakendab kohalikke käändeid, ajaväljendeid ja modaalmudeleid kontekstis.',
        g_use: 'Õpilane saavutab kontrollitud osas vähemalt 70% ning ükski võtmevaldkond ei jää alla 60%.',
      },
    },
    additions: {
      vocab: block('a2b1_020_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri sõnavara ilma tõlketa.',
        instruction: 'Paiguta sõnad teemade järgi. See on soojendus, mitte vihjete nimekiri järgmistele vastustele.',
        groups: [
          { name: 'Aeg', words: 'pärast, kõigepealt, lõpuks, tavaliselt' },
          { name: 'Pere ja suhted', words: 'lähedane, sugulane, hooliv, koos' },
          { name: 'Linn ja liikumine', words: 'apteek, raamatukogu, pööra, kõrvalt' },
          { name: 'Kohustus ja plaan', words: 'peab, võib, saab, kokkulepe' },
        ],
      }, 'full'),
      general: block('a2b1_020_av_general', 'choice', 'sky', 'g_read', {
        title: 'Põhiidee.',
        instruction: 'Vali vastus teksti põhjal. Ära kasuta kõrvalisi vihjeid.',
        questions: [
          { q: 'Mis on teksti peamine probleem?', options: '*Inimene peab ühe päeva jooksul mitu asja ümber planeerima.\nInimene tahab kolida teise riiki.\nInimene otsib uut töökohta.' },
          { q: 'Mis aitab tal päeva lahendada?', options: '*Ta seab prioriteedid ja lepib ajad ümber.\nTa jätab kõik tegemata.\nTa palub teistel kõik ära teha.' },
          { q: 'Milline oskus on tekstis kõige rohkem vajalik?', options: '*aja, koha ja kohustuste selge väljendamine\nainult välimuse kirjeldamine\nainult numbrite lugemine' },
        ],
      }),
      notice: block('a2b1_020_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Kontrolli mustreid enne iseseisvat osa.',
        lines: '**Kuhu?** lähen apteeki · **Kust?** tulen töölt.\nMa **pean minema**, aga ma **võin tulla** hiljem.\n**Kõigepealt** teen kiire töö, **pärast** lähen poodi.\nKahjuks ei saa kell viis. **Aga kuidas oleks** kell kuus?',
      }),
      controlled: block('a2b1_020_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Täienda ainult vajalik sõna või vorm. Vihjeid ei ole.',
        bank: '',
        showBank: 'no',
        sentences: 'Pärast tööd lähen [apteeki] (apteek).\nHommikul tulen [kodust] (kodu).\nTäna ma [pean] lõpetama tähtsa aruande.\nSiin [võib] parkida kaks tundi.\n[Kõigepealt] helistan arstile, siis lähen tööle.\nKahjuks ma kell viis [ei saa] kohtuda.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_020_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma abita.',
        instruction: 'Vali vastus kiiresti. Ära vaata varasemaid töölehti.',
        questions: [
          { q: 'Milline teema tundub sulle praegu kõige kindlam?', options: '*igapäevaelu ja aeg\npere ja suhted\nkodu ja linn\nkohustused ja kokkulepped' },
          { q: 'Millist osa tahad enda puhul eriti kontrollida?', options: '*grammatika\nlugemine\nrääkimine\nkirjutamine' },
        ],
      }),
      reading: block('a2b1_020_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe üks kord tervikuna, siis vasta detailidele.',
        passageTitle: 'Tihe neljapäev',
        passage: 'Neljapäev on Marile tavalisest keerulisem. Hommikul peab ta viima lapse kooli ja minema siis tööle. Kell kümme on tal koosolek. Lõuna ajal helistab Mari apteeki, sest tal on vaja retseptiravimit. Pärast tööd plaanib ta apteeki minna, kuid kolleeg palub tal jääda pooleks tunniks kauemaks. Mari kirjutab abikaasale ja küsib, kas tema saab lapse trennist ära tuua. Abikaasa nõustub. Kell viis pidi Mari kohtuma sõbraga, kuid nüüd ta ei jõua. Ta kirjutab: „Kahjuks ei saa ma kell viis tulla. Aga kuidas oleks kell kuus?” Sõbrale sobib uus aeg. Enne kohtumist jõuab Mari apteegist läbi ja lõpuks saavad kõik tähtsad asjad tehtud.',
        questions: 'Kuhu peab Mari hommikul lapse viima? [kooli]\nMis kell on Maril koosolek? [kell kümme|10|10.00|10:00]\nMiks ta helistab apteeki? [tal on vaja retseptiravimit|retseptiravimi pärast]\nKes toob lapse trennist ära? [abikaasa|Mari abikaasa]\nMis kell kohtub Mari lõpuks sõbraga? [kell kuus|6|18|18.00|18:00]\nKus käib Mari enne kohtumist? [apteegis|apteegist läbi]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_020_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — 3 minutit.',
        instruction: 'Räägi ühest kiirest päevast või lahenda õpetaja antud praktiline olukord. Ära loe valmis teksti.',
        questions: 'Kirjelda päeva algust ja järjekorda.\nNimeta vähemalt kaks kohustust.\nKasuta vähemalt üht Kus/Kuhu/Kust vormi.\nMuuda ühe kokkuleppe aega ja paku alternatiiv.\nSelgita vähemalt üht põhjust.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 150, maxSec: 210,
      }, 'full'),
      writing: block('a2b1_020_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — 80–100 sõna.',
        instruction: 'Kirjuta sõnum või lühike tekst päevast, kus plaan muutus. Selgita, mis juhtus, mida pidid tegema ja kuidas uue kokkuleppe tegid.',
        lines: 10, minSent: 8, maxSent: 12,
        keywords: 'kõigepealt, pärast, peab, ei saa, aga kuidas oleks, lõpuks',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_020_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Mida ma nüüd tean?', instruction: '',
        items: 'Ma sain tekstist põhiinfo ja detailid kätte.\nMa kasutasin kohavorme ilma pideva abita.\nMa eristasin kohustust, luba ja võimalust.\nMa sain kokkuleppe aega muuta ja alternatiivi pakkuda.\nJärgmise 20 tunni jaoks valin ühe oskuse, mida tahan teadlikult parandada.',
        stamp: 'Esimene etapp tehtud!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'match', 'categorize'].includes(entry?.type) && /(sõna|aeg|reegel|kohustus|fraas|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|kuidas|mis tähendus|kohustus|aru)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|muster)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(proovi|täienda|kontrollitud|vali|ehita|taasta|pane)/.test(title);
  return false;
});

const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule4Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 4.`);
  const blocks = [
    spec.seed.intro,
    spec.additions.vocab,
    spec.seed.reading,
    spec.additions.general,
    spec.additions.notice,
    spec.additions.controlled,
    spec.seed.productive,
    ...(spec.seed.writing ? [spec.seed.writing] : []),
    spec.seed.selfcheck,
  ];
  return {
    schema: 'keelesepp.worksheet/2',
    id: `ws_${lessonId}_discover`,
    meta: {
      title: spec.meta.title,
      subtitle: spec.meta.subtitle,
      level: 'B1',
      module: MODULE,
      canDo: spec.meta.canDo,
      badge: 'Avasta teema kontekstis ja proovi seda kohe kasutada.',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals: spec.meta.goals,
    },
    blocks,
  };
}

export function upgradeAvastaModule4Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 4.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule4Document(lessonId);
    return { document: created, added: ['full'], before: 0, after: created.blocks.length, created: true };
  }
  const original = document.blocks;
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
    created: false,
  };
}

export const AVASTA_MODULE4_IDS = Object.freeze(Object.keys(SPECS));
