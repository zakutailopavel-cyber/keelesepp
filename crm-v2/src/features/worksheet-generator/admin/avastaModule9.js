const MODULE = 'Töö ja ametid';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const SPECS = {
  'a2b1-041': {
    meta: {
      title: 'Ametid ja tööülesanded',
      subtitle: 'Räägin ametitest ja selgitan, mida inimesed tööl teevad.',
      canDo: 'Ma kirjeldan vähemalt nelja ametit ja nende põhiülesandeid 8–10 seotud lausega.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 12 ameti ja tööülesande sõna.',
        g_read: 'Õpilane leiab tekstist ameti, töökoha ja põhiülesanded.',
        g_notice: 'Õpilane märkab konstruktsioone töötab…, vastutab…, peab…, tegeleb….',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset lauset ameti ja tööülesannete kohta.',
      },
    },
    additions: {
      vocab: block('a2b1_041_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Ametid ja tööülesanded',
        words: 'õpetaja, klienditeenindaja, kokk, autojuht, ehitaja, müüja, raamatupidaja, administraator, arst, õde, programmeerija, koristaja, klientidega suhtlema, dokumente täitma, vastutama, kontrollima',
        columns: '4',
      }, 'full'),
      general: block('a2b1_041_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kes mida teeb?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Kes suhtleb iga päev klientidega?', options: '*klienditeenindaja\nehitaja\nkoristaja' },
          { q: 'Kes võib vastutada arvete ja numbrite eest?', options: '*raamatupidaja\nkokk\nautojuht' },
          { q: 'Milline lause kirjeldab tööülesannet?', options: '*Administraator vastab kirjadele ja telefonile.\nAdministraator on inimene.\nKontor on kesklinnas.' },
        ],
      }),
      notice: block('a2b1_041_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka töö kirjeldamise mustreid.',
        lines: 'Ta **töötab** koolis õpetajana.\nTa **tegeleb** klientide küsimustega.\nTa **vastutab** dokumentide eest.\nTa **peab** iga päev aruandeid kontrollima.',
      }),
      controlled: block('a2b1_041_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kirjelda ametit.',
        instruction: 'Täienda laused sobiva tegusõnaga.',
        bank: 'töötab, tegeleb, vastutab, suhtleb, kontrollib, peab',
        showBank: 'yes',
        sentences: 'Õpetaja [töötab] koolis.\nKlienditeenindaja [suhtleb] klientidega.\nRaamatupidaja [vastutab] arvete eest.\nAdministraator [tegeleb] dokumentide ja kõnedega.\nKokk [kontrollib] enne tööpäeva vajalikke toiduaineid.\nAutojuht [peab] järgima liiklusreegleid.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_041_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Milliseid ameteid sa hästi tunned?',
        instruction: 'Vali üks valdkond ja mõtle, milliseid tööülesandeid seal tehakse.',
        questions: [
          { q: 'Milline valdkond on sulle tuttavam?', options: '*teenindus\nharidus\ntransport\nkontoritöö' },
          { q: 'Mis kirjeldab tööd paremini?', options: '*konkreetsed ülesanded\nainult ametinimetus\nainult töökoha aadress' },
        ],
      }),
      reading: block('a2b1_041_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe kolme inimese tööst.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kolm erinevat tööpäeva',
        passage: 'Kadri töötab väikese ettevõtte administraatorina. Hommikul kontrollib ta e-kirju, vastab telefonile ja aitab klientidel leida õige inimese. Ta tegeleb ka dokumentidega ning paneb kalendrisse kohtumisi. Martin on kokk. Tema tööpäev algab varem, sest enne restorani avamist peab ta kontrollima toiduaineid ja valmistama ette köögi. Päeva jooksul valmistab ta toitu ning suhtleb teiste köögitöötajatega. Jaan töötab autojuhina. Ta viib kaupa erinevatesse kohtadesse, kontrollib enne sõitu autot ja peab täpselt jälgima aega. Kuigi nende tööpäevad on väga erinevad, on kõigil vaja vastutada oma ülesannete eest ja teha koostööd teiste inimestega. Kõik kolm ütlevad, et hea tööpäev sõltub sellest, kas info liigub kiiresti ja iga inimene teab oma rolli.',
        questions: 'Mis ametit peab Kadri? [administraator|administraatorina]\nMillega ta hommikul tegeleb? [kontrollib e-kirju ja vastab telefonile|e-kirjade ja telefoniga]\nMiks algab Martini tööpäev varem? [ta peab enne restorani avamist köögi ette valmistama|köögi ettevalmistamise pärast]\nMida Jaan enne sõitu kontrollib? [autot]\nMis on kõigil kolmel ühine? [nad peavad vastutama oma ülesannete eest ja tegema koostööd|vastutus ja koostöö]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_041_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Kirjelda nelja ametit.',
        instruction: 'Räägi 2 minutit. Iga ameti kohta ütle töökoht, põhiülesanne ja üks vastutus.',
        questions: 'Kus inimene töötab?\nMida ta tavaliselt teeb?\nKellega ta suhtleb?\nMille eest ta vastutab?\nMis võib olla selles töös raske?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'töötab · tegeleb · vastutab · peab · suhtleb',
        minSec: 100, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_041_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma nimetan vähemalt 12 ametit või tööga seotud sõna.\nMa oskan selgitada, mida inimene tööl teeb.\nMa oskan öelda, mille eest ta vastutab.\nMa kasutan töö kirjeldamisel vähemalt nelja erinevat tegusõna.\nJärgmises tunnis tahan oma tööpäevast täpsemalt rääkida.',
        stamp: 'Amet ja ülesanne on selged!',
      }, 'full'),
    },
  },

  'a2b1-042': {
    meta: {
      title: 'Minu tööpäev',
      subtitle: 'Kirjeldan tööpäeva järjekorda, ülesandeid ja prioriteete.',
      canDo: 'Ma räägin oma tööpäevast 2–3 minutit ja kasutan vähemalt kuut ajamarkerit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 tööpäeva ja ajaplaneerimise väljendit.',
        g_read: 'Õpilane leiab tekstist tööpäeva etapid, prioriteedid ja muutused.',
        g_notice: 'Õpilane märkab kõigepealt, seejärel, pärast seda, enne, kuni ja lõpuks kasutust.',
        g_use: 'Õpilane koostab vähemalt 8 seotud lausega tööpäeva kirjelduse.',
      },
    },
    additions: {
      vocab: block('a2b1_042_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Tööpäeva väljendid',
        words: 'tööpäev algab, tööpäev lõpeb, koosolek, tähtaeg, prioriteet, klient, kolleeg, paus, kõigepealt, seejärel, pärast seda, enne lõunat, päeva lõpus',
        columns: '3',
      }, 'full'),
      general: block('a2b1_042_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb tööpäeva kirjelduse selgeks?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Mis aitab ülesandeid järjestada?', options: '*ajamarkerid ja prioriteedid\nainult ametinimetused\nainult kellaaeg' },
          { q: 'Milline lause näitab prioriteeti?', options: '*Kõigepealt lõpetan kiire aruande.\nAruanne on dokument.\nKontor on suur.' },
          { q: 'Milline väljend sobib viimase tegevuse ette?', options: '*päeva lõpus\nkõigepealt\nenne lõunat' },
        ],
      }),
      notice: block('a2b1_042_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka tööpäeva järjestust.',
        lines: '**Kõigepealt** kontrollin e-kirju.\n**Seejärel** teen tähtsama ülesande.\n**Enne lõunat** on mul koosolek.\n**Pärast seda** vastan klientidele.\n**Päeva lõpus** vaatan homse plaani üle.',
      }),
      controlled: block('a2b1_042_av_controlled', 'wordorder', 'blue', 'g_use', {
        title: 'Pane tööpäev õigesse järjekorda.',
        instruction: 'Taasta laused.',
        sentences: 'Kõigepealt kontrollin hommikul e-kirju.\nSeejärel lõpetan tähtsa aruande.\nEnne lõunat on mul meeskonna koosolek.\nPärast seda vastan klientide küsimustele.\nPäeva lõpus panen kirja homsed ülesanded.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_042_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kuidas sinu tööpäev algab?',
        instruction: 'Vali enda jaoks kõige tavalisem variant.',
        questions: [
          { q: 'Mida teed tavaliselt esimesena?', options: '*vaatan e-kirju\nräägin kolleegidega\nalustan kohe põhiülesandega' },
          { q: 'Mis muudab päeva keeruliseks?', options: '*liiga palju kiireid ülesandeid\nkatkestused\nkoosolekud\nmitu asja korraga' },
        ],
      }),
      reading: block('a2b1_042_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe tööpäeva kirjeldust.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Anu kiire tööpäev',
        passage: 'Anu töötab projektikoordinaatorina. Tema tööpäev algab kell kaheksa kolmkümmend. Kõigepealt vaatab ta üle e-kirjad ja kontrollib, kas mõni klient ootab kiiret vastust. Seejärel teeb ta ühe tähtsa ülesande, mille tähtaeg on samal päeval. Enne lõunat toimub tavaliselt meeskonna koosolek. Seal räägitakse projektide seisust ja jagatakse uusi ülesandeid. Pärast lõunat suhtleb Anu klientidega ning valmistab ette dokumente. Mõnikord muutub plaan, sest tuleb kiire telefonikõne või uus probleem. Siis peab Anu otsustama, mis on kõige olulisem. Päeva lõpus kontrollib ta, millised ülesanded said tehtud, ja kirjutab üles järgmise päeva prioriteedid. Mõnikord jätab ta vähem kiire ülesande järgmisele päevale, et mitte kõike korraga teha. See aitab tal tööpäeva rahulikumalt lõpetada.',
        questions: 'Mis kell Anu tööpäev algab? [kell kaheksa kolmkümmend|8.30|08.30|8:30]\nMida ta kõigepealt kontrollib? [e-kirju ja kiireid kliendivastuseid|e-kirju]\nMillal toimub meeskonna koosolek? [enne lõunat]\nMiks plaan mõnikord muutub? [tuleb kiire telefonikõne või uus probleem|kiirete probleemide tõttu]\nMida teeb Anu päeva lõpus? [kontrollib tehtud ülesandeid ja kirjutab järgmise päeva prioriteedid üles|paneb homsed prioriteedid kirja]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_042_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma tööpäevast.',
        instruction: 'Räägi 2–3 minutit ja kasuta vähemalt kuut ajamarkerit.',
        questions: 'Mis kell sinu tööpäev algab?\nMida teed kõigepealt?\nMillised on sinu peamised ülesanded?\nMis toimub enne ja pärast lõunat?\nMis võib päeva jooksul muutuda?\nKuidas tööpäev lõpeb?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'kõigepealt · seejärel · enne lõunat · pärast seda · päeva lõpus',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_042_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan oma tööpäeva järjekorras kirjeldada.\nMa kasutan vähemalt kuut ajamarkerit.\nMa oskan nimetada prioriteete.\nMa oskan öelda, kuidas plaan päeva jooksul muutub.\nJärgmises tunnis tahan töökuulutust paremini mõista.',
        stamp: 'Tööpäev on selge!',
      }, 'full'),
    },
  },

  'a2b1-043': {
    meta: {
      title: 'Töökuulutus ja nõuded',
      subtitle: 'Mõistan töökuulutuse põhiinfot ja eristan nõudeid pakkumistest.',
      canDo: 'Ma leian töökuulutusest vähemalt 80% põhiinfost ja selgitan, kas töö mulle sobiks.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 töökuulutuse ja nõuete väljendit.',
        g_read: 'Õpilane leiab kuulutusest tööülesanded, nõuded, tööaja ja pakutavad tingimused.',
        g_notice: 'Õpilane eristab nõudeid ja tööandja pakkumisi väljendavaid fraase.',
        g_use: 'Õpilane hindab töökuulutust vähemalt 6 kriteeriumi põhjal.',
      },
    },
    additions: {
      vocab: block('a2b1_043_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Töökuulutuse sõnavara',
        words: 'tööülesanded, nõuded, kogemus, haridus, keeleoskus, arvutioskus, täistööaeg, osaline tööaeg, graafik, palk, pakume, ootame, kandideerima, CV',
        columns: '3',
      }, 'full'),
      general: block('a2b1_043_av_general', 'choice', 'sky', 'g_read', {
        title: 'Nõue või pakkumine?',
        instruction: 'Vali õige kategooria.',
        questions: [
          { q: '„Ootame head eesti keele oskust.”', options: '*nõue\npakkumine\ntööülesanne' },
          { q: '„Pakume paindlikku tööaega.”', options: '*pakkumine\nnõue\nametinimetus' },
          { q: '„Tööülesanne on klientide nõustamine.”', options: '*tööülesanne\npalk\nharidus' },
        ],
      }),
      notice: block('a2b1_043_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kuulutuse signaalsõnu.',
        lines: '**Ootame sinult** head suhtlemisoskust.\n**Nõutav** on eesti keele oskus.\n**Kasuks tuleb** varasem kogemus.\n**Pakume** väljaõpet ja paindlikku graafikut.\n**Tööülesanded:** klientide teenindamine ja dokumentide täitmine.',
      }),
      controlled: block('a2b1_043_av_controlled', 'categorize', 'blue', 'g_use', {
        title: 'Jaga info õigesse rühma.',
        instruction: 'Paiguta punktid töökuulutuse osa järgi.',
        groups: [
          { name: 'Nõuded', words: 'B1 eesti keel, hea suhtlemisoskus, arvuti kasutamise oskus' },
          { name: 'Tööülesanded', words: 'klientidele vastamine, dokumentide täitmine, broneeringute tegemine' },
          { name: 'Pakume', words: 'väljaõpe, paindlik graafik, toetav meeskond' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_043_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mida vaatad töökuulutuses esimesena?',
        instruction: 'Vali enda jaoks kõige olulisem.',
        questions: [
          { q: 'Mis info on sulle kõige tähtsam?', options: '*tööülesanded\npalk\ntööaeg\nnõuded' },
          { q: 'Mis võib kandideerimise otsust kõige rohkem mõjutada?', options: '*keelenõue\ngraafik\nasukoht\nkõik koos' },
        ],
      }),
      reading: block('a2b1_043_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe töökuulutust.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Otsime administraatorit',
        passage: 'Väike koolituskeskus otsib administraatorit, kes aitaks korraldada igapäevast tööd. Peamised tööülesanded on klientidele vastamine telefoni ja e-posti teel, tundide broneerimine, dokumentide korrastamine ning õpetajate toetamine. Ootame kandidaadilt head suhtlemisoskust, täpsust ja vähemalt B1-tasemel eesti keelt. Vajalik on ka oskus kasutada arvutit ja tavapäraseid kontoriprogramme. Varasem töökogemus teeninduses tuleb kasuks, kuid see ei ole kohustuslik. Töö on osalise koormusega ja graafikut saab osaliselt kokku leppida. Tööandja pakub väljaõpet, toetavat meeskonda ning võimalust hiljem töökoormust suurendada. Kandideerimiseks tuleb saata lühike CV ja paar lauset selle kohta, miks töö sind huvitab. Kuulutuses palutakse märkida ka võimalik tööle asumise aeg ning see, mitu õhtust vahetust kandidaat nädalas teha saab.',
        questions: 'Mis ametikohale inimest otsitakse? [administraatoriks|administraator]\nNimeta üks tööülesanne. [klientidele vastamine|tundide broneerimine|dokumentide korrastamine|õpetajate toetamine]\nMilline eesti keele tase on vajalik? [B1|B1-tase]\nKas varasem teeninduskogemus on kohustuslik? [ei]\nMida tuleb kandideerimiseks saata? [lühike CV ja paar lauset motivatsiooni kohta|CV ja paar lauset]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_043_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Kas see töö sobiks sulle?',
        instruction: 'Räägi 2 minutit ja hinda kuulutust vähemalt kuue kriteeriumi järgi.',
        questions: 'Kas tööülesanded sobivad sulle?\nKas keelenõue sobib?\nKas sul on vajalik arvutioskus?\nKas graafik sobib?\nMis sulle pakkumises meeldib?\nMis tekitab küsimusi?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'sobib / ei sobi · nõue · kasuks tuleb · pakume · mul on kogemus…',
        minSec: 100, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_043_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma leian kuulutusest tööülesanded.\nMa eristan nõudeid ja pakkumisi.\nMa saan aru tööaja ja koormuse infost.\nMa oskan öelda, kas töö mulle sobiks.\nJärgmises tunnis tahan endast töövestlusel rääkida.',
        stamp: 'Kuulutus on loetav!',
      }, 'full'),
    },
  },

  'a2b1-044': {
    meta: {
      title: 'Töövestlus — endast rääkimine',
      subtitle: 'Tutvustan oma kogemust, tugevusi ja motivatsiooni töövestlusel.',
      canDo: 'Ma vastan vähemalt kuuele tüüpilisele töövestluse küsimusele 2–4 lausega.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 kogemuse, tugevuste ja motivatsiooni väljendit.',
        g_read: 'Õpilane leiab töövestluse vastusest kogemuse, oskuse ja motivatsiooni.',
        g_notice: 'Õpilane märkab vastuse mudelit väide + näide + seos tööga.',
        g_use: 'Õpilane annab vähemalt 6 sisulist ja konkreetset töövestluse vastust.',
      },
    },
    additions: {
      vocab: block('a2b1_044_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Töövestluse fraasid',
        words: 'mul on kogemus…, olen töötanud…, minu tugevus on…, oskan…, mulle meeldib…, tahan areneda…, olen täpne, olen rahulik, õpin kiiresti, saan hästi hakkama…, sobin sellele tööle, sest…',
        columns: '2',
      }, 'full'),
      general: block('a2b1_044_av_general', 'choice', 'sky', 'g_read', {
        title: 'Milline vastus on tugevam?',
        instruction: 'Vali sisulisem töövestluse vastus.',
        questions: [
          { q: '„Mis on teie tugevus?”', options: '*Olen täpne ja toon alati tähtajad kalendrisse, et midagi ei ununeks.\nOlen hea.\nEi tea.' },
          { q: '„Miks soovite siin töötada?”', options: '*Töö sobib minu varasema teeninduskogemusega ja tahan selles valdkonnas areneda.\nSest tahan tööd.\nNiisama.' },
          { q: 'Mis muudab vastuse usutavamaks?', options: '*konkreetne näide\nväga pikk sõna\nüldine kiitus enda kohta' },
        ],
      }),
      notice: block('a2b1_044_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka tugeva vastuse mudelit.',
        lines: '**Väide:** Olen rahulik suhtleja.\n**Näide:** Eelmises töökohas lahendasin iga päev klientide küsimusi.\n**Seos:** Sellepärast sobib mulle töö, kus peab inimestega palju suhtlema.',
      }),
      controlled: block('a2b1_044_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ehita sisuline vastus.',
        instruction: 'Täienda vastused sobiva väljendiga.',
        bank: 'mul on kogemus, minu tugevus on, olen töötanud, oskan, tahan areneda, sobin',
        showBank: 'yes',
        sentences: '[Mul on kogemus] klienditeeninduses.\n[Olen töötanud] kaks aastat kohvikus.\n[Minu tugevus on] rahulik suhtlemine.\n[Oskan] kasutada tavapäraseid kontoriprogramme.\n[Tahan areneda] administratiivses töös.\nMa [sobin] sellele kohale, sest olen täpne ja õpin kiiresti.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_044_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis on töövestlusel raske?',
        instruction: 'Vali üks teema, millele tahaksid paremini vastata.',
        questions: [
          { q: 'Milline küsimus on raskem?', options: '*Rääkige endast.\nMis on teie tugevus?\nMiks soovite siin töötada?\nKõik on sarnased.' },
          { q: 'Mis aitab vastust parandada?', options: '*konkreetne näide\nväga pikk vastus\nõpitud tekst sõna-sõnalt' },
        ],
      }),
      reading: block('a2b1_044_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe töövestluse katkendit.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kandidaat vestlusel',
        passage: 'Intervjueerija palub Natalial lühidalt endast rääkida. Natalia ütleb, et tal on kolm aastat kogemust klienditeeninduses ja viimased kaks aastat töötas ta kohvikus. Seal suhtles ta iga päev klientidega, võttis tellimusi vastu ja lahendas lihtsaid probleeme. Natalia ütleb, et tema tugevus on rahulik suhtlemine, sest ka kiirel ajal suudab ta viisakaks jääda. Ta oskab kasutada arvutit ning õpib uusi programme kiiresti. Intervjueerija küsib, miks Natalia soovib administraatorina töötada. Natalia vastab, et tahab kasutada oma teeninduskogemust, kuid samal ajal õppida rohkem korraldus- ja kontoritööd. Ta lisab, et talle sobib töö, kus peab suhtlema nii klientide kui kolleegidega. Vastused on lühikesed, kuid iga väide on seotud konkreetse kogemuse või eesmärgiga.',
        questions: 'Kui palju klienditeeninduse kogemust Natalial on? [kolm aastat|3 aastat]\nKus ta viimased kaks aastat töötas? [kohvikus]\nMis on tema tugevus? [rahulik suhtlemine]\nMiks soovib ta administraatorina töötada? [tahab kasutada teeninduskogemust ja õppida korraldus- ning kontoritööd|tahab areneda kontoritöös]\nMiks on tema vastused tugevad? [iga väide on seotud konkreetse kogemuse või eesmärgiga|ta toob konkreetseid näiteid]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_044_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Töövestlus — 6 küsimust.',
        instruction: 'Vasta igale küsimusele 2–4 lausega. Lisa vähemalt kolm konkreetset näidet.',
        questions: 'Rääkige lühidalt endast.\nMilline varasem kogemus teil on?\nMis on teie tugevus?\nMillist oskust tahate arendada?\nMiks soovite sellele kohale kandideerida?\nMiks sobite sellele tööle?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Vastus:',
        tipText: 'väide → konkreetne näide → seos tööga',
        minSec: 150, maxSec: 240,
      }, 'full'),
      selfcheck: block('a2b1_044_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan endast lühidalt rääkida.\nMa oskan kirjeldada oma kogemust.\nMa oskan nimetada tugevuse ja tuua näite.\nMa oskan põhjendada, miks töö mind huvitab.\nMa vastan vähemalt kuuele küsimusele ilma valmis teksti lugemata.',
        stamp: 'Vestluse vastus on sisuline!',
      }, 'full'),
    },
  },

  'a2b1-045': {
    meta: {
      title: 'Kontroll 8 — töö ja ametid',
      subtitle: 'Näitan, et saan aru tööinfost ja oskan endast tööolukorras rääkida.',
      canDo: 'Ma mõistan töökuulutust, kirjeldan tööpäeva ja vastan töövestluse põhiküsimustele iseseisvalt.',
      goals: {
        g_vocab: 'Õpilane kasutab töö, ameti ja kandideerimise põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab töökuulutuse põhiinfot ja olulisi detaile.',
        g_notice: 'Õpilane rakendab töö kirjeldamise ja motivatsiooni põhjendamise põhimustreid.',
        g_use: 'Õpilane saavutab kontrollitud osas vähemalt 70% ja suulises osas vähemalt 60%.',
      },
    },
    additions: {
      vocab: block('a2b1_045_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri tööteema põhivara.',
        instruction: 'Paiguta väljendid õigesse rühma.',
        groups: [
          { name: 'Tööülesanne', words: 'klientidele vastamine, dokumentide täitmine, kontrollimine' },
          { name: 'Nõue', words: 'keeleoskus, kogemus, täpsus' },
          { name: 'Tugevus', words: 'rahulik suhtlemine, kiire õppimine, vastutustundlikkus' },
          { name: 'Pakkumine', words: 'väljaõpe, paindlik graafik, toetav meeskond' },
        ],
      }, 'full'),
      general: block('a2b1_045_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kontrolli põhiinfot.',
        instruction: 'Vali vastus teksti põhjal.',
        questions: [
          { q: 'Mis on tööandja peamine nõue?', options: '*sobiv suhtlemis- ja keeleoskus\nainult juhiluba\nainult kõrgharidus' },
          { q: 'Mida kandidaat peab töövestlusel näitama?', options: '*kogemust, tugevusi ja motivatsiooni\nainult oma nime\nainult tööaega' },
          { q: 'Mis teeb vastuse sisuliseks?', options: '*konkreetne näide\nväga pikk lause\nüldine „olen hea”' },
        ],
      }),
      notice: block('a2b1_045_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk tööteema mudelitele.',
        lines: 'Ma **töötan** administraatorina ja **vastutan** dokumentide eest.\nKuulutuses **oodatakse** B1 eesti keelt ja **pakutakse** väljaõpet.\n**Mul on kogemus** klienditeeninduses.\n**Sobiksin sellele tööle, sest** olen täpne ja suhtlen rahulikult.',
      }),
      controlled: block('a2b1_045_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Täienda sobiva sõna või vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Administraator [vastutab] dokumentide eest.\nKuulutuses [oodatakse] head suhtlemisoskust.\nTööandja [pakub] väljaõpet.\nMul [on] kaks aastat teeninduskogemust.\nMinu tugevus [on] rahulik suhtlemine.\nSobiksin sellele tööle, [sest] õpin kiiresti.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_045_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma vihjeteta.',
        instruction: 'Vali, mida tahad enda puhul eriti kontrollida.',
        questions: [
          { q: 'Mis osa on tugevam?', options: '*ametite kirjeldamine\ntöökuulutuse lugemine\ntöövestlus' },
          { q: 'Mis vajab rohkem harjutamist?', options: '*sõnavara\npõhjendamine\nspontaanne vastamine' },
        ],
      }),
      reading: block('a2b1_045_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe üks kord tervikuna ja vasta siis detailidele.',
        passageTitle: 'Kandideerimine klienditeenindajaks',
        passage: 'Ettevõte otsib klienditeenindajat, kelle põhiülesanne on vastata klientide küsimustele telefoni, e-posti ja vestluse kaudu. Kandidaadilt oodatakse vähemalt B1-tasemel eesti keelt, head arvutioskust ja rahulikku suhtlemist. Varasem teeninduskogemus on eelis, kuid tööandja pakub ka väljaõpet. Sergei loeb kuulutust ja otsustab kandideerida. Tal on kaks aastat kogemust kohvikus, kus ta suhtles iga päev erinevate klientidega. Töövestlusel räägib Sergei, et tema tugevus on rahulik probleemide lahendamine. Ta toob näite olukorrast, kus klient sai vale tellimuse ja tema aitas vea kiiresti parandada. Sergei ütleb ka, et tahab õppida rohkem arvutipõhiseid töövahendeid. Intervjueerijale meeldib, et Sergei vastused on konkreetsed ja seotud päris kogemusega. Vestluse lõpus küsib Sergei ka tööaja, väljaõppe ja meeskonna kohta, et paremini aru saada, kas ametikoht sobib talle pikemaks ajaks.',
        questions: 'Mis ametikohale inimest otsitakse? [klienditeenindajaks|klienditeenindaja]\nMilline eesti keele tase on nõutud? [B1|B1-tase]\nKui palju teeninduskogemust Sergeil on? [kaks aastat|2 aastat]\nMis on Sergei tugevus? [rahulik probleemide lahendamine]\nMida tahab ta juurde õppida? [arvutipõhiseid töövahendeid|arvutitöövahendeid]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_045_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — tööolukord.',
        instruction: 'Räägi 3 minutit: vali töökuulutus ja vasta töövestluse küsimustele.',
        questions: 'Mis töö see on?\nMillised on kolm peamist tööülesannet?\nMillised nõuded sul juba on?\nMilline kogemus sul on?\nMis on sinu tugevus?\nMiks sobiksid sellele tööle?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 150, maxSec: 210,
      }, 'full'),
      writing: block('a2b1_045_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — kandideerimissõnum.',
        instruction: 'Kirjuta 90–110 sõna: millisele tööle kandideerid, milline kogemus sul on ja miks sobid.',
        lines: 10, minSent: 8, maxSent: 12,
        keywords: 'kogemus, tugevus, oskan, sobin, sest',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_045_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma saan töökuulutuse põhiinfost aru.\nMa oskan tööülesandeid kirjeldada.\nMa oskan rääkida oma kogemusest ja tugevustest.\nMa oskan põhjendada, miks töö mulle sobib.\nJärgmises moodulis tahan tööalast suhtlust veel vabamalt kasutada.',
        stamp: 'Tööteema on kasutuses!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(amet|töö|kuulutus|vestlus|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(kes|mis teeb|nõue|vastus|kontrolli)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|viimane pilk)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(kirjelda|pane|jaga|ehita|kontrollitud)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule9Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 9.`);
  const blocks = [
    spec.seed.intro, spec.additions.vocab, spec.seed.reading, spec.additions.general,
    spec.additions.notice, spec.additions.controlled, spec.seed.productive,
    ...(spec.seed.writing ? [spec.seed.writing] : []), spec.seed.selfcheck,
  ];
  return {
    schema: 'keelesepp.worksheet/2',
    id: `ws_${lessonId}_discover`,
    meta: {
      title: spec.meta.title, subtitle: spec.meta.subtitle, level: 'B1', module: MODULE,
      canDo: spec.meta.canDo,
      badge: 'Avasta teema kontekstis ja proovi seda kohe kasutada.',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals: spec.meta.goals,
    },
    blocks,
  };
}

export function upgradeAvastaModule9Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 9.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule9Document(lessonId);
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
        title: spec.meta.title, subtitle: spec.meta.subtitle, level: 'B1', module: MODULE,
        canDo: spec.meta.canDo, goals: { ...(document?.meta?.goals || {}), ...spec.meta.goals },
      },
      blocks,
    },
    added, before: original.length, after: blocks.length, created: false,
  };
}

export const AVASTA_MODULE9_IDS = Object.freeze(Object.keys(SPECS));
