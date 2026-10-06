const MODULE = 'Lihtminevik ja kogemused';

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
  'a2b1-021': {
    meta: {
      title: 'Lihtmineviku põhivormid',
      subtitle: 'Räägin lõpetatud tegevustest minevikus.',
      canDo: 'Ma moodustan sagedaste tegusõnade lihtmineviku vorme ja kasutan neid lühikeses jutustuses.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 sagedast tegevusverbi mineviku kontekstis.',
        g_read: 'Õpilane leiab tekstist lõpetatud minevikutegevused ja nende järjekorra.',
        g_notice: 'Õpilane märkab lihtmineviku -si- vormi ja eituse ei + nud/tud põhiskeemi.',
        g_use: 'Õpilane moodustab vähemalt 8 õiget lihtmineviku vormi 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_021_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Sagedased tegevused minevikus',
        words: 'töötama, õppima, helistama, vaatama, kuulama, ostma, küsima, vastama, lõpetama, alustama, kohtuma, puhkama',
        columns: '3',
      }, 'full'),
      general: block('a2b1_021_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis näitab minevikku?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Milline lause räägib lõpetatud tegevusest?', options: '*Eile töötasin kodus.\nTäna töötan kodus.\nHomme töötan kodus.' },
          { q: 'Milline sõna aitab sageli minevikku märgata?', options: '*eile\nvarsti\nhomme' },
          { q: 'Milline eitus sobib lihtminevikku?', options: '*ei töötanud\nei töötab\nei töötas' },
        ],
      }),
      notice: block('a2b1_021_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka lihtmineviku mustrit.',
        lines: 'töötan → **töötasin**\nvaatan → **vaatasin**\nküsin → **küsisin**\nMa **ei töötanud** eile õhtul. → eitus: ei + nud/tud vorm.',
      }),
      controlled: block('a2b1_021_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Muuda tegevus minevikku.',
        instruction: 'Kirjuta sulgudes olev verb lihtminevikus.',
        bank: '',
        showBank: 'no',
        sentences: 'Eile ma [töötasin] (töötama) kodus.\nÕhtul ma [vaatasin] (vaatama) filmi.\nHommikul ta [helistas] (helistama) arstile.\nMe [kohtusime] (kohtuma) kohvikus.\nNad [lõpetasid] (lõpetama) töö kell kuus.\nMa [ei töötanud] (mitte töötama) nädalavahetusel.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_021_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mõtle eilsele.',
        instruction: 'Vali tegevus, mida tegid eile kindlasti või tõenäoliselt.',
        questions: [
          { q: 'Mida sa eile pärast tööd või kooli tegid?', options: '*läksin koju\ntegin trenni\nkohtusin kellegagi' },
          { q: 'Milline sõna sobib eilse päeva jutustamiseks?', options: '*eile\nhomme\nvarsti' },
        ],
      }),
      reading: block('a2b1_021_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe eilse päeva lugu.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Martini teisipäev',
        passage: 'Eile oli Martinil üsna tavaline tööpäev. Ta ärkas kell seitse ja tegi kiiresti hommikusöögi. Seejärel sõitis ta bussiga tööle. Kontoris töötas Martin kõigepealt arvutis ja vastas mitmele kirjale. Enne lõunat helistas ta ühele kliendile ja lõpetas ühe väikese projekti. Kell kaksteist sõi ta kolleegidega lõunat. Pärast lõunat töötas ta veel kolm tundi. Ühel hetkel aitas ta kolleegi, kelle arvutis oli väike probleem. Kell viis läks Martin koju. Õhtul ei töötanud ta enam. Ta tegi süüa, vaatas ühe seriaali osa ja rääkis telefonis sõbraga. Enne magamaminekut luges ta natuke. Martin ütles, et päev ei olnud eriline, aga kõik vajalikud asjad said tehtud.',
        questions: 'Mis kell Martin ärkas? [kell seitse|seitse|7|07.00|7.00]\nKuidas ta tööle läks? [bussiga]\nMida ta enne lõunat lõpetas? [ühe väikese projekti|projekti]\nKellega ta lõunat sõi? [kolleegidega]\nKas ta töötas õhtul? [ei|ei töötanud]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_021_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma eilsest päevast.',
        instruction: 'Räägi 1–2 minutit. Kasuta vähemalt kuut lihtmineviku vormi.',
        questions: 'Mis kell sa ärkasid?\nKuhu sa läksid?\nMida sa päeval tegid?\nKellega sa rääkisid või kohtusid?\nMida sa õhtul tegid?\nMida sa eile ei teinud?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta minevikku:',
        tipText: 'töötasin, vaatasin, rääkisin, kohtusin, lõpetasin, ei töötanud',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_021_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma tunnen ära lihtmineviku.\nMa oskan moodustada sagedasi -si- vorme.\nMa oskan kasutada eitust *ei + nud/tud*.\nMa oskan rääkida eilsest päevast vähemalt 1 minuti.\nJärgmises tunnis tahan minevikujuttu pikemaks teha.',
        stamp: 'Minevik algab selgelt!',
      }, 'full'),
    },
  },
  'a2b1-022': {
    meta: {
      title: 'Eile ja eelmisel nädalal',
      subtitle: 'Seon minevikutegevused üheks loogiliseks jutuks.',
      canDo: 'Ma jutustan 8–10 lausega eilsest või eelmisest nädalast ja kasutan vähemalt nelja ajamarkerit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 mineviku ajamarkerit ja tegevusverbi.',
        g_read: 'Õpilane leiab minevikujutust sündmuste järjekorra.',
        g_notice: 'Õpilane märkab ajamarkerite rolli minevikujutu sidumisel.',
        g_use: 'Õpilane järjestab vähemalt 6 minevikutegevust loogiliseks jutuks.',
      },
    },
    additions: {
      vocab: block('a2b1_022_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Minevikujutu ajamarkerid',
        words: 'eile, üleeile, eelmisel nädalal, hommikul, lõuna ajal, pärast seda, siis, õhtul, lõpuks, kõigepealt',
        columns: '3',
      }, 'full'),
      general: block('a2b1_022_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb minevikujutu sidusaks?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Mis aitab sündmuste järjekorda näidata?', options: '*ajamarkerid nagu kõigepealt, siis, pärast seda\nainult nimed\nainult omadussõnad' },
          { q: 'Milline lause alustab minevikujuttu loomulikult?', options: '*Eile hommikul ärkasin tavalisest varem.\nHomme ärkan varem.\nPraegu ärkan.' },
          { q: 'Milline sõna sobib viimase sündmuse ette?', options: '*lõpuks\neelmisel nädalal\nenne' },
        ],
      }),
      notice: block('a2b1_022_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka jutustuse järjekorda.',
        lines: '**Eile hommikul** ärkasin varem.\n**Kõigepealt** käisin poes, **siis** läksin tööle.\n**Pärast seda** kohtusin sõbraga.\n**Lõpuks** tulin koju ja puhkasin.',
      }),
      controlled: block('a2b1_022_av_controlled', 'wordorder', 'blue', 'g_use', {
        title: 'Taasta loogilised laused.',
        instruction: 'Pane sõnad õigesse järjekorda.',
        sentences: 'Eile hommikul ärkasin kell seitse.\nKõigepealt käisin poes ja siis läksin tööle.\nPärast seda kohtusin ühe sõbraga.\nÕhtul tegin kodus süüa.\nLõpuks vaatasin filmi ja läksin magama.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_022_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis juhtus hiljuti?',
        instruction: 'Vali üks ajavahemik, millest võiksid rääkida.',
        questions: [
          { q: 'Millest on sul lihtsam jutustada?', options: '*eilsest päevast\neelmisest nädalavahetusest\neelmisest nädalast' },
          { q: 'Kui mitu sündmust mäletad selgelt?', options: '*2–3\n4–5\nrohkem kui 5' },
        ],
      }),
      reading: block('a2b1_022_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe nädalavahetuse lugu.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Katrini nädalavahetus',
        passage: 'Eelmisel nädalavahetusel oli Katrinil palju plaane. Laupäeva hommikul ärkas ta veidi hiljem ja sõi rahulikult hommikusööki. Kõigepealt koristas ta korteri. Siis läks ta turule, sest tahtis õhtuks värskeid toiduaineid osta. Pärast seda kohtus Katrin õega ja nad jõid koos kohvi. Nad rääkisid pikalt tööst ja suveplaanidest. Õhtul tegid nad kodus süüa ning vaatasid vana filmi. Pühapäeval Katrin ei kiirustanud. Hommikul käis ta pikalt jalutamas. Lõuna ajal helistas ta vanematele ja pärast kõnet luges raamatut. Õhtul valmistas ta ette järgmise nädala tööasjad. Lõpuks läks Katrin tavalisest varem magama, sest esmaspäeval pidi ta vara ärkama.',
        questions: 'Mida Katrin laupäeval kõigepealt tegi? [koristas korteri|korteri koristas]\nMiks ta turule läks? [tahtis värskeid toiduaineid osta|värskeid toiduaineid ostma]\nKellega ta kohvi jõi? [õega]\nMida ta pühapäeva hommikul tegi? [käis jalutamas|jalutas]\nMiks ta läks vara magama? [esmaspäeval pidi vara ärkama|pidi esmaspäeval vara ärkama]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_022_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Jutusta 8–10 lausega.',
        instruction: 'Räägi eilsest päevast või eelmisest nädalavahetusest.',
        questions: 'Millal lugu algas?\nMida tegid kõigepealt?\nMis juhtus siis?\nMida tegid pärast seda?\nKellega suhtlesid?\nKuidas päev või nädalavahetus lõppes?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta vähemalt nelja:',
        tipText: 'eile · kõigepealt · siis · pärast seda · õhtul · lõpuks',
        minSec: 90, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_022_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan jutustada minevikus vähemalt 8 lausega.\nMa kasutan ajamarkereid sündmuste järjestamiseks.\nMa hoian kogu loo minevikus.\nMa oskan loo selgelt lõpetada.\nJärgmises tunnis tahan paremini kasutada ebareeglipäraseid minevikuvorme.',
        stamp: 'Lugu liigub edasi!',
      }, 'full'),
    },
  },
  'a2b1-023': {
    meta: {
      title: 'I-lihtminevik ja sagedased erandid',
      subtitle: 'Kasutan sagedasi ebareeglipäraseid minevikuvorme.',
      canDo: 'Ma kasutan vähemalt 8 sagedast erandlikku lihtmineviku vormi õigesti.',
      goals: {
        g_vocab: 'Õpilane tunneb ära sagedased erandlikud minevikuvormid.',
        g_read: 'Õpilane mõistab tekstis sagedasi erandlikke minevikuvorme kontekstist.',
        g_notice: 'Õpilane seostab oleviku vormid tuli, läks, tegi, nägi, sõi, jõi, oli jne minevikutähendusega.',
        g_use: 'Õpilane kasutab vähemalt 8 sihtvormi 10-st õigesti.',
      },
    },
    additions: {
      vocab: block('a2b1_023_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Sagedased erandlikud vormid',
        words: 'tulema — tuli, minema — läks, tegema — tegi, nägema — nägi, sööma — sõi, jooma — jõi, olema — oli, saama — sai, jääma — jäi, viima — viis',
        columns: '2',
      }, 'full'),
      general: block('a2b1_023_av_general', 'choice', 'sky', 'g_read', {
        title: 'Tunne vorm ära.',
        instruction: 'Vali õige tähendus või algvorm.',
        questions: [
          { q: '„Ta läks eile arsti juurde.” Mis on verbi algvorm?', options: '*minema\ntulema\nnägema' },
          { q: '„Me sõime restoranis.” Mis tegevus see on?', options: '*sööma\njooma\nsaama' },
          { q: '„Mari nägi sõpra.” Mis on oleviku algvorm?', options: '*nägema\nviima\njääma' },
        ],
      }),
      notice: block('a2b1_023_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka: vorm muutub palju.',
        lines: 'tulema → **tuli**\nminema → **läks**\ntegema → **tegi**\nnägema → **nägi**\nsööma → **sõi** · jooma → **jõi** · olema → **oli**',
      }),
      controlled: block('a2b1_023_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali õige erandlik vorm.',
        instruction: 'Täienda laused sulgudes oleva verbi lihtmineviku vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Eile ta [läks] (minema) tööle jala.\nÕhtul ta [tuli] (tulema) hilja koju.\nMe [sõime] (sööma) koos õhtust.\nPärast sööki ta [jõi] (jooma) teed.\nMa [nägin] (nägema) poes vana sõpra.\nTa [tegi] (tegema) nädalavahetusel palju tööd.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_023_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Milline vorm tundub tuttav?',
        instruction: 'Vali minevikuvorm, mida oled juba kuulnud või kasutanud.',
        questions: [
          { q: 'Milline lause tundub loomulik?', options: '*Eile läksin tööle.\nEile minasin tööle.\nEile mineksin tööle.' },
          { q: 'Milline vorm tähendab „oli”?', options: '*olema minevik\nminema minevik\ntegema minevik' },
        ],
      }),
      reading: block('a2b1_023_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe lugu ja märka vorme.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Päev, mis läks teisiti',
        passage: 'Eile oli Rainil vaba päev. Hommikul läks ta turule ja nägi seal juhuslikult vana koolikaaslast. Nad rääkisid natuke ja jõid kohvikus kohvi. Rain sai teada, et sõber elab nüüd samas linnaosas. Nad leppisid kokku, et kohtuvad järgmisel nädalal uuesti. Pärast kohtumist läks Rain koju ja tegi lõunasööki. Ta sõi suppi ning jõi klaasi vett. Pärast sööki jäi ta mõneks ajaks diivanile raamatut lugema. Õhtul tuli tema õde külla ja nad vaatasid koos vanu fotosid. Rain nägi piltidel palju inimesi, keda polnud aastaid kohanud. Õhtu oli rahulik, aga päev tõi talle mitu ootamatut kohtumist ja mälestust.',
        questions: 'Kuhu Rain hommikul läks? [turule]\nKeda ta turul nägi? [vana koolikaaslast|koolikaaslast]\nMida nad kohvikus jõid? [kohvi]\nMida Rain lõunaks tegi? [lõunasööki|suppi]\nKes tuli õhtul külla? [tema õde|õde]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_023_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Kasuta erandlikke vorme loos.',
        instruction: 'Räägi 1–2 minutit ühest päevast. Kasuta vähemalt kuut sihtvormi.',
        questions: 'Kuhu sa läksid?\nKes tuli või kellega kohtusid?\nMida sa tegid?\nMida sõid või jõid?\nKeda või mida nägid?\nKuidas päev lõppes?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Sihtvormid:',
        tipText: 'läks · tuli · tegi · nägi · sõi · jõi · oli · sai',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_023_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma tunnen ära sagedased erandlikud minevikuvormid.\nMa seostan vormi õige algverbiga.\nMa kasutan vähemalt kuut erandlikku vormi oma loos.\nMa ei proovi kõiki verbe teha -si- vormiga.\nJärgmises tunnis tahan neid vorme kasutada pikemas loos.',
        stamp: 'Erandid muutuvad tuttavaks!',
      }, 'full'),
    },
  },
  'a2b1-024': {
    meta: {
      title: 'Lugu piltide järgi',
      subtitle: 'Ehitan loole selge alguse, arengu ja lõpu.',
      canDo: 'Ma jutustan 2–3 minutit järjestatud sündmustest ja kasutan lihtminevikku ning vähemalt nelja siduvat ajamarkerit.',
      goals: {
        g_vocab: 'Õpilane kasutab jutustamiseks tegevusverbe ja ajamarkereid.',
        g_read: 'Õpilane taastab loo loogilise sündmuste järjekorra.',
        g_notice: 'Õpilane märkab loo struktuuri alguses, siis, pärast seda, lõpuks.',
        g_use: 'Õpilane moodustab vähemalt 8 seotud minevikulauset.',
      },
    },
    additions: {
      vocab: block('a2b1_024_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Loo ehitamise sõnad',
        words: 'alguses, kõigepealt, siis, pärast seda, samal ajal, äkki, natuke hiljem, lõpuks, juhtus, otsustas, märkas, jõudis',
        columns: '3',
      }, 'full'),
      general: block('a2b1_024_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb loo tervikuks?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Mida peab kuulaja loo alguses teada saama?', options: '*Kes, kus ja millal.\nAinult lõpp.\nAinult üks verb.' },
          { q: 'Milleks kasutatakse väljendit „pärast seda”?', options: '*Järgmise sündmuse näitamiseks.\nTegelase nime muutmiseks.\nTuleviku väljendamiseks.' },
          { q: 'Mis teeb lõpu arusaadavaks?', options: '*Selge viimane sündmus või tulemus.\nUus tegelane ilma selgituseta.\nJuhuslik uus teema.' },
        ],
      }),
      notice: block('a2b1_024_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka loo struktuuri.',
        lines: '**Alguses** oli kõik tavaline.\n**Siis** juhtus midagi ootamatut.\n**Pärast seda** pidi tegelane otsustama, mida teha.\n**Lõpuks** leidis ta lahenduse ja läks koju.',
      }),
      controlled: block('a2b1_024_av_controlled', 'wordorder', 'blue', 'g_use', {
        title: 'Taasta sündmuste laused.',
        instruction: 'Pane sõnad õigesse järjekorda.',
        sentences: 'Alguses läks Karl hommikul poodi.\nSiis märkas ta tänaval kadunud koera.\nPärast seda helistas ta loomade varjupaika.\nNatuke hiljem tuli koera omanik kohale.\nLõpuks jõudis Karl koju palju hiljem kui plaanis.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_024_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis teeb loo huvitavaks?',
        instruction: 'Vali üks element, mida sulle meeldib loos kuulda.',
        questions: [
          { q: 'Milline lugu jääb paremini meelde?', options: '*loos juhtub midagi ootamatut\nkõik laused kordavad sama mõtet\nloo lõppu ei ole' },
          { q: 'Kas hea lugu vajab järjekorda?', options: '*jah\nei\nainult väga pikas tekstis' },
        ],
      }),
      reading: block('a2b1_024_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe ja kujuta stseenid ette.',
        instruction: 'Loe lugu. Mõtle iga lõigu juurde üks pilt.',
        passageTitle: 'Kadunud kott',
        passage: 'Laupäeva hommikul läks Laura turule. Alguses oli kõik tavaline: ta ostis puuvilju ja leiba ning rääkis tuttava müüjaga. Siis märkas Laura, et tema väike must kott ei olnud enam õlal. Ta vaatas kiiresti enda ümber, aga kotti ei näinud. Pärast seda läks Laura tagasi sama teed mööda ja küsis müüjatelt, kas keegi oli kotti märganud. Üks naine ütles, et nägi musta kotti kohviku juures. Laura kiirustas sinna. Kohvikus oli kott leti taga ja töötaja ootas selle omanikku. Lõpuks sai Laura koti tagasi. Kõik asjad olid alles. Ta tänas töötajat ja ostis endale suure kohvi, sest närviline hommik oli lõpuks hästi lõppenud.',
        questions: 'Kuhu Laura hommikul läks? [turule]\nMida ta kaotas? [musta koti|koti]\nKus oli üks naine kotti näinud? [kohviku juures]\nKus kott lõpuks oli? [kohvikus leti taga|leti taga]\nKuidas lugu lõppes? [Laura sai koti tagasi|ta sai koti tagasi]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_024_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Jutusta lugu 2–3 minutit.',
        instruction: 'Kasuta õpetaja pilte või mõtle oma nelja stseeni põhjal lugu.',
        questions: 'Kes on peategelane?\nKus ja millal lugu algab?\nMis juhtub kõigepealt?\nMis ootamatu asi juhtub?\nMida tegelane pärast seda teeb?\nKuidas lugu lõpuks lõpeb?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Seo lugu:',
        tipText: 'alguses · siis · pärast seda · natuke hiljem · lõpuks',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_024_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Minu lool on selge algus, areng ja lõpp.\nMa kasutan lihtminevikku järjepidevalt.\nMa kasutan vähemalt nelja ajamarkerit.\nMa lisan sündmustele vähemalt kaks detaili.\nJärgmises tunnis tahan oma minevikujuttu täpsemaks muuta.',
        stamp: 'Lugu on tervik!',
      }, 'full'),
    },
  },
  'a2b1-025': {
    meta: {
      title: 'Kontroll 5 — lihtminevik',
      subtitle: 'Näitan, et oskan minevikuvorme ja sidusat jutustamist iseseisvalt kasutada.',
      canDo: 'Ma moodustan sagedased minevikuvormid ja jutustan lõpetatud sündmusest selge ajaloogikaga.',
      goals: {
        g_vocab: 'Õpilane kasutab mineviku jutustamise põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab minevikuteksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane eristab regulaarseid ja sagedasi erandlikke lihtmineviku vorme.',
        g_use: 'Õpilane saavutab kontrollitud minevikuosas vähemalt 70% täpsuse.',
      },
    },
    additions: {
      vocab: block('a2b1_025_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Kiire aktiveerimine.',
        instruction: 'Paiguta vormid kahte gruppi.',
        groups: [
          { name: 'Tavaline -si- vorm', words: 'töötasin, vaatasin, küsisin, lõpetasin' },
          { name: 'Sagedane erand', words: 'läks, tuli, tegi, nägi, sõi, jõi' },
        ],
      }, 'full'),
      general: block('a2b1_025_av_general', 'choice', 'sky', 'g_read', {
        title: 'Põhiidee ja ajaloogika.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis teeb tekstist minevikujutu?', options: '*Sündmused on lõpetatud ja ajaliselt järjestatud.\nKõik laused on küsimused.\nTekstis ei ole verbe.' },
          { q: 'Milline sõna näitab selgelt loo lõppu?', options: '*lõpuks\neile\nhommikul' },
          { q: 'Milline vorm on erandlik?', options: '*läks\ntöötasin\nvaatasin' },
        ],
      }),
      notice: block('a2b1_025_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Kontrolli vormi enne iseseisvat osa.',
        lines: 'töötama → **töötasin**\nminema → **läksin**\ntegema → **tegin**\nMa **ei töötanud** eile.\nKõigepealt…, siis…, pärast seda…, lõpuks…',
      }),
      controlled: block('a2b1_025_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Kirjuta õige lihtmineviku vorm.',
        bank: '',
        showBank: 'no',
        sentences: 'Eile ma [töötasin] (töötama) kodus.\nPärast tööd [läksin] (minema) poodi.\nSeal [nägin] (nägema) vana tuttavat.\nMe [jõime] (jooma) koos kohvi.\nÕhtul [tegin] (tegema) süüa.\nMa [ei vaadanud] (mitte vaatama) televiisorit.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_025_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma vihjeteta.',
        instruction: 'Vali, millise minevikuoskuse tahad enda puhul kontrollida.',
        questions: [
          { q: 'Milline osa on sinu jaoks kõige olulisem?', options: '*verbivormid\najamarkerid\npikk jutustus' },
          { q: 'Kui kindlalt tunned erandlikke vorme?', options: '*kindlalt\nkeskmiselt\nvajan veel harjutamist' },
        ],
      }),
      reading: block('a2b1_025_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe üks kord tervikuna ja vasta siis detailidele.',
        passageTitle: 'Päev, mis muutis plaani',
        passage: 'Eelmisel reedel plaanis Oliver pärast tööd otse koju minna. Hommikul töötas ta tavaliselt ja lõpetas ühe suure ülesande. Lõuna ajal sai ta aga sõbralt sõnumi. Sõber kirjutas, et tal oli kaks kontserdipiletit ja üks inimene ei saanud tulla. Oliver mõtles natuke ja otsustas minna. Pärast tööd läks ta kiiresti koju, vahetas riided ja sõi midagi. Siis sõitis ta kesklinna. Kontserdil nägi Oliver veel kahte tuttavat, keda ta polnud ammu kohanud. Nad kuulasid muusikat ja rääkisid vaheajal. Oliver ostis enne viimast osa vett ja helistas korraks koju. Kontsert lõppes hilja. Lõpuks jõudis Oliver koju pärast südaööd. Ta oli väsinud, kuid ütles, et spontaanne plaan oli seda väärt.',
        questions: 'Mida Oliver alguses pärast tööd plaanis? [koju minna|otse koju minna]\nKellelt ta sõnumi sai? [sõbralt]\nMiks sõber talle kirjutas? [tal oli kaks kontserdipiletit ja üks inimene ei saanud tulla|tal oli vaba kontserdipilet]\nKeda Oliver kontserdil nägi? [kahte tuttavat|tuttavaid]\nMillal ta koju jõudis? [pärast südaööd]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_025_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — minevikulugu.',
        instruction: 'Räägi 2–3 minutit ühest päris või kujuteldavast päevast.',
        questions: 'Millal ja kus lugu algas?\nMida tegid kõigepealt?\nMis muutis sinu plaani?\nMida tegid pärast seda?\nKellega suhtlesid?\nKuidas lugu lõppes?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 120, maxSec: 180,
      }, 'full'),
      writing: block('a2b1_025_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — 90–110 sõna.',
        instruction: 'Kirjuta ühest päevast, kui midagi läks teisiti kui plaanis. Hoia kogu tekst minevikus.',
        lines: 10, minSent: 8, maxSent: 12,
        keywords: 'eile, kõigepealt, siis, pärast seda, lõpuks',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_025_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Mida ma nüüd oskan?', instruction: '',
        items: 'Ma moodustan sagedasi lihtmineviku vorme.\nMa kasutan sagedasi erandlikke vorme.\nMa oskan minevikujutu sündmusi järjestada.\nMa hoian jutustuse ajavormi stabiilsena.\nJärgmises moodulis tahan minevikku kasutada veel spontaansemalt.',
        stamp: 'Minevik on kasutuses!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(vorm|sõna|tegevus|ajamarker|aktiveer)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|mis näitab|mis teeb|tunne|aru)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|kontrolli vorm)/.test(title);
  if (category === 'controlled') return ['gaps', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(muuda|taasta|vali|kontrollitud)/.test(title);
  return false;
});

const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule5Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 5.`);
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

export function upgradeAvastaModule5Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 5.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule5Document(lessonId);
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

export const AVASTA_MODULE5_IDS = Object.freeze(Object.keys(SPECS));
