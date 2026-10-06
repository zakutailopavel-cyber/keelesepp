const MODULE = 'Toit ja teenindus';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const SPECS = {
  'a2b1-026': {
    meta: {
      title: 'Toiduained ja kogused',
      subtitle: 'Räägin toidust ja kogustest praktilistes ostuolukordades.',
      canDo: 'Ma nimetan vähemalt 15 toiduainet ja kasutan vähemalt kuut koguseväljendit.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 15 toiduainet ja 6 koguseväljendit.',
        g_read: 'Õpilane leiab ostunimekirjast ja tekstist vajalikud toiduained ning kogused.',
        g_notice: 'Õpilane märkab koguse + nimisõna konstruktsiooni tüüpilisi vorme.',
        g_use: 'Õpilane koostab vähemalt 8 korrektset ostufraasi kogusega.',
      },
    },
    additions: {
      vocab: block('a2b1_026_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Toit ja kogused',
        words: 'leib, piim, juust, muna, kartul, tomat, kurk, õun, banaan, kana, kala, riis, kilo, gramm, liiter, pakk, pudel, tükk, natuke, palju',
        columns: '4',
      }, 'full'),
      general: block('a2b1_026_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mida ostetakse ja kui palju?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Milline väljend näitab täpset kogust?', options: '*üks kilo kartuleid\nkartulid\npoes' },
          { q: 'Milline ühik sobib piimaga kõige loomulikumalt?', options: '*liiter\ntükk\nmeeter' },
          { q: 'Milline fraas sobib ostunimekirja?', options: '*kaks pakki riisi\nriis väga\nriisile kaks' },
        ],
      }),
      notice: block('a2b1_026_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka koguse väljendamist.',
        lines: 'üks **kilo kartuleid**\nkaks **liitrit piima**\nkolm **pakki riisi**\nviis **õuna**\nnatuke **juustu**',
      }),
      controlled: block('a2b1_026_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Koosta ostunimekiri.',
        instruction: 'Täienda fraasid sobiva koguse või ühikuga.',
        bank: 'kilo, liitrit, pakki, tükki, pudelit, natuke',
        showBank: 'yes',
        sentences: 'Ostan kaks [kilo] kartuleid.\nMul on vaja kolm [liitrit] piima.\nVõtan kaks [pakki] riisi.\nPalun neli [tükki] saia.\nOstan kaks [pudelit] vett.\nVajan [natuke] juustu.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_026_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mida ostad kõige sagedamini?',
        instruction: 'Vali enda jaoks kõige tavalisem variant.',
        questions: [
          { q: 'Mida ostad peaaegu iga nädal?', options: '*piimatooteid\npuu- ja köögivilju\nliha või kala\nkõike natuke' },
          { q: 'Kas kirjutad enne poodi nimekirja?', options: '*alati\nmõnikord\npeaaegu mitte kunagi' },
        ],
      }),
      reading: block('a2b1_026_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe ostuplaani.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Nädala ostud',
        passage: 'Liis teeb tavaliselt suurema toiduostu pühapäeval. Enne poodi minekut kontrollib ta külmkappi ja kirjutab nimekirja. Sel nädalal on tal vaja kaks liitrit piima, üks pakk võid, kümme muna ja umbes kilo kanafileed. Köögiviljadest ostab ta kaks kilo kartuleid, neli tomatit ja kaks kurki. Puuviljadest võtab Liis kuus õuna ja ühe kilo banaane. Lisaks on tal vaja kaks pakki riisi, üks pudel õli ja natuke juustu. Ta ei taha liiga palju osta, sest osa toidust läheb muidu halvaks. Poes võrdleb Liis pakendi suurust ja hinda ning valib koguse selle järgi, kui mitu päeva toit säilib.',
        questions: 'Mis päeval teeb Liis suurema toiduostu? [pühapäeval]\nMitu liitrit piima ta ostab? [kaks liitrit|2 liitrit|2]\nKui palju kanafileed tal vaja on? [umbes kilo|üks kilo|1 kilo]\nMitu õuna ta võtab? [kuus|6]\nMiks ta ei taha liiga palju osta? [toit võib halvaks minna|osa toidust läheb muidu halvaks]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_026_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Koosta oma ostunimekiri.',
        instruction: 'Räägi 1–2 minutit. Nimeta vähemalt 10 toodet ja kuus kogust.',
        questions: 'Mida sul järgmiseks kolmeks päevaks vaja on?\nKui palju piima või vett ostad?\nKui palju puu- või köögivilju vajad?\nKas ostad midagi pakiga või pudeliga?\nMida võtad ainult natuke?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta koguseid:',
        tipText: 'kilo · gramm · liiter · pakk · pudel · tükk · natuke',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_026_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma nimetan vähemalt 15 toiduainet.\nMa kasutan koguseühikuid õigesti.\nMa oskan koostada ostunimekirja.\nMa oskan öelda, kui palju midagi vajan.\nJärgmises tunnis tahan neid sõnu tellimisel kasutada.',
        stamp: 'Ostunimekiri on valmis!',
      }, 'full'),
    },
  },

  'a2b1-027': {
    meta: {
      title: 'Kohvikus ja restoranis',
      subtitle: 'Tellin toitu, täpsustan ja reageerin teenindaja küsimustele.',
      canDo: 'Ma viin läbi 3–4-minutilise teenindusdialoogi ning teen tellimuse iseseisvalt.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 restorani- ja tellimisväljendit.',
        g_read: 'Õpilane mõistab menüü- ja teenindusdialoogi põhiinfot.',
        g_notice: 'Õpilane märkab Soovin…, Palun mulle…, Kas selles on…?, Arve palun funktsioone.',
        g_use: 'Õpilane koostab vähemalt 6 sobivat kliendirepliiki.',
      },
    },
    additions: {
      vocab: block('a2b1_027_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Tellimise põhifraasid',
        words: 'Soovin…, Palun mulle…, Võtan…, Kas selles on…?, Kas saaks ilma…?, Mida te soovitate?, Joogiks…, Magustoiduks…, Kas kõik oli hästi?, Arve palun.',
        columns: '2',
      }, 'full'),
      general: block('a2b1_027_av_general', 'choice', 'sky', 'g_read', {
        title: 'Milline repliik sobib olukorda?',
        instruction: 'Vali kõige loomulikum vastus.',
        questions: [
          { q: 'Teenindaja küsib: „Mida teile joogiks?”', options: '*Palun üks mineraalvesi.\nMa olen kell kuus.\nSee on minu vend.' },
          { q: 'Tahad teada, kas toidus on pähkleid.', options: '*Kas selles on pähkleid?\nKas see on eile?\nKus on peatus?' },
          { q: 'Tahad maksta.', options: '*Arve palun.\nVeel üks laud.\nTere tulemast.' },
        ],
      }),
      notice: block('a2b1_027_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka viisakat tellimust.',
        lines: '**Soovin** päevapraadi.\n**Palun mulle** üks kohv.\n**Kas selles on** piima?\n**Kas saaks ilma** sibulata?\n**Arve palun.**',
      }),
      controlled: block('a2b1_027_av_controlled', 'dialogue', 'green', 'g_use', {
        title: 'Taasta tellimus.',
        instruction: 'Täida kliendi puuduvad repliigid.',
        speakerA: 'Teenindaja',
        speakerB: 'Klient',
        lines: [
          { who: 'A', text: 'Tere! Mida te soovite?' },
          { who: 'B', text: '[Soovin] kanapastat.' },
          { who: 'B', text: '[Kas selles on] pähkleid?' },
          { who: 'A', text: 'Ei ole. Mida joogiks?' },
          { who: 'B', text: '[Palun mulle] üks mineraalvesi.' },
          { who: 'B', text: 'Ja pärast [arve palun].' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_027_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kui sageli sööd väljas?',
        instruction: 'Vali enda jaoks sobiv variant.',
        questions: [
          { q: 'Kus tellid sagedamini?', options: '*kohvikus\nrestoranis\ntoidukohas kaasa' },
          { q: 'Mis on sinu jaoks tellimisel kõige olulisem?', options: '*hind\nkoostis\nkiirus\nmaitse' },
        ],
      }),
      reading: block('a2b1_027_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe teenindusolukorda.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Lõuna kohvikus',
        passage: 'Anna läheb töökaaslasega lõunale väikesesse kohvikusse. Teenindaja annab neile menüü ja küsib, mida nad soovivad juua. Anna tellib mineraalvee ning vaatab päevapakkumisi. Ta tahab võtta kanasalati, kuid küsib kõigepealt, kas kastmes on piima, sest ta ei soovi seda süüa. Teenindaja ütleb, et tavalises kastmes on koor, kuid salatit saab tellida ka ilma kastmeta. Anna valib selle variandi. Töökaaslane võtab supi ja leiva. Pärast sööki tellib Anna veel kohvi. Teenindaja küsib, kas kõik oli hästi. Anna vastab, et toit maitses hästi. Lõpuks paluvad nad arve eraldi ja maksavad kaardiga.',
        questions: 'Kellega Anna lõunale läheb? [töökaaslasega]\nMida Anna joogiks tellib? [mineraalvee|mineraalvett]\nMiks ta küsib kastme kohta? [ta ei soovi piima süüa|kastmes võib olla piima]\nKuidas ta salati tellib? [ilma kastmeta]\nKuidas nad maksavad? [kaardiga]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_027_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Tee täielik tellimus.',
        instruction: 'Räägi 2–3 minutit. Õpetaja on teenindaja.',
        questions: 'Tervita ja küsi menüü kohta.\nTelli põhiroog ja jook.\nKüsi vähemalt ühe koostisosa kohta.\nMuuda üht detaili tellimuses.\nReageeri küsimusele „Kas kõik oli hästi?”.\nKüsi lõpuks arvet.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta vähemalt nelja fraasi:',
        tipText: 'Soovin… · Palun mulle… · Kas selles on…? · Kas saaks ilma…? · Arve palun.',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_027_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan iseseisvalt tellimust alustada.\nMa oskan küsida koostisosade kohta.\nMa oskan muuta tellimuse üht detaili.\nMa oskan reageerida teenindaja küsimustele.\nMa oskan küsida arvet ja lõpetada dialoogi.',
        stamp: 'Tellimus õnnestus!',
      }, 'full'),
    },
  },

  'a2b1-028': {
    meta: {
      title: 'Partitiiv toidu ja koguse juures',
      subtitle: 'Kasutan osastavat pärast kogust ja sagedastes toidukonstruktsioonides.',
      canDo: 'Ma valin õige partitiivivormi vähemalt 8 juhul 10-st.',
      goals: {
        g_vocab: 'Õpilane kasutab tuttavat toidu- ja kogusesõnavara partitiiviga.',
        g_read: 'Õpilane tunneb tekstis ära koguse ja toidu tüüpilised partitiivikonstruktsioonid.',
        g_notice: 'Õpilane märkab palju/vähe + partitiiv ja mõõtühik + partitiiv mustreid.',
        g_use: 'Õpilane moodustab vähemalt 8 õiget partitiivivormi 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_028_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Koguse sõnad',
        words: 'palju, vähe, natuke, kilo, gramm, liiter, klaas, tass, pudel, pakk, tükk, portsjon',
        columns: '3',
      }, 'full'),
      general: block('a2b1_028_av_general', 'choice', 'sky', 'g_read', {
        title: 'Millal tuleb partitiiv?',
        instruction: 'Vali õige variant.',
        questions: [
          { q: 'Palju …', options: '*vett\nvesi\nvee' },
          { q: 'Kaks kilo …', options: '*kartuleid\nkartulid\nkartulite' },
          { q: 'Üks klaas …', options: '*mahla\nmahl\nmahlast' },
        ],
      }),
      notice: block('a2b1_028_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka partitiivi.',
        lines: 'palju **vett**\nvähe **suhkrut**\nkilo **kartuleid**\nklaas **mahla**\nkaks tükki **kooki**',
      }),
      controlled: block('a2b1_028_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ava sulud õigesse vormi.',
        instruction: 'Kirjuta sulgudes olev sõna partitiivis.',
        bank: '',
        showBank: 'no',
        sentences: 'Ostan kilo [kartuleid] (kartul).\nPalun kaks liitrit [piima] (piim).\nJoome klaasi [mahla] (mahl).\nRetseptis on natuke [suhkrut] (suhkur).\nLaual on palju [õunu] (õun).\nPalun kaks tükki [kooki] (kook).',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_028_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kuula oma keeletunnet.',
        instruction: 'Vali vorm, mis tundub loomulikum.',
        questions: [
          { q: 'Üks kilo …', options: '*kartuleid\nkartulid\nkartul' },
          { q: 'Natuke …', options: '*juustu\njuust\njuustust' },
        ],
      }),
      reading: block('a2b1_028_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe retsepti.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Lihtne õhtusöök neljale',
        passage: 'Mari valmistab õhtusööki neljale inimesele. Ta otsustab teha ahjukartuleid ja kanasalatit. Kartulite jaoks vajab ta umbes poolteist kilo kartuleid, natuke õli, soola ja pipart. Salati jaoks ostab Mari 500 grammi kanafileed, kaks tomatit, ühe kurgi ja natuke rohelist salatit. Kastmesse läheb üks klaas maitsestamata jogurtit ja natuke sidrunimahla. Joogiks ostab ta kaks liitrit mineraalvett. Magustoiduks tahab Mari pakkuda puuvilju, seega võtab ta kuus õuna ja neli banaani. Ta kontrollib kogused üle, sest liiga väike kogus ei jätku kõigile, aga liiga palju toitu võib üle jääda.',
        questions: 'Kui palju kartuleid Mari vajab? [umbes poolteist kilo|poolteist kilo]\nKui palju kanafileed ta ostab? [500 grammi|500 g]\nMitu tomatit läheb salatisse? [kaks|2]\nMida läheb kastmesse üks klaas? [maitsestamata jogurtit|jogurtit]\nKui palju mineraalvett ta ostab? [kaks liitrit|2 liitrit]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_028_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Kirjelda oma retsepti või ostukorvi.',
        instruction: 'Räägi 1–2 minutit. Kasuta vähemalt kuut koguse + partitiivi konstruktsiooni.',
        questions: 'Mida valmistad?\nKui palju põhitoorainet vajad?\nKui palju vedelikku kasutad?\nMida vajad ainult natuke?\nMida ostad mitu tükki?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'kilo…, liiter…, klaas…, palju…, vähe…, natuke…',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_028_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma märkan, millal koguse järel tuleb partitiiv.\nMa oskan kasutada palju, vähe ja natuke.\nMa oskan kasutada mõõtühikuid koos toidusõnadega.\nMa kasutan vähemalt kuut õiget konstruktsiooni.\nJärgmises tunnis tahan neid vorme probleemolukorras kasutada.',
        stamp: 'Kogused on kontrolli all!',
      }, 'full'),
    },
  },

  'a2b1-029': {
    meta: {
      title: 'Tellimusega on probleem',
      subtitle: 'Selgitan teeninduses probleemi ja palun sobivat lahendust.',
      canDo: 'Ma kirjeldan probleemi ja ütlen igas olukorras selgelt, millist lahendust soovin.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 8 kaebuse ja lahenduse väljendit.',
        g_read: 'Õpilane leiab teenindusolukorrast probleemi, põhjuse ja pakutud lahenduse.',
        g_notice: 'Õpilane märkab mustreid Ma tellisin…, aga sain… ja Kas saaksite…?.',
        g_use: 'Õpilane lahendab vähemalt 4 teenindusprobleemi sobiva repliigiga.',
      },
    },
    additions: {
      vocab: block('a2b1_029_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Probleem ja lahendus',
        words: 'Ma tellisin…, aga sain…, see on külm, see on vale, see puudub, arve on vale, Kas saaksite vahetada?, Kas saaksite tuua…?, Soovin uut…, Palun kontrollige arvet.',
        columns: '2',
      }, 'full'),
      general: block('a2b1_029_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis on hea kaebus?',
        instruction: 'Vali kõige sobivam variant.',
        questions: [
          { q: 'Kuidas probleemi kõige selgemalt kirjeldada?', options: '*Ma tellisin supi, aga sain salati.\nSee on halb.\nEi meeldi.' },
          { q: 'Milline fraas palub lahendust?', options: '*Kas saaksite selle ära vahetada?\nMiks te üldse töötate?\nSee on kohvik.' },
          { q: 'Mis aitab konflikti vältida?', options: '*konkreetne probleem ja viisakas soov\nväga vali hääl\nsolvamine' },
        ],
      }),
      notice: block('a2b1_029_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kaebuse struktuuri.',
        lines: '**Ma tellisin** kana, **aga sain** kala.\nSee toit **on külm**.\n**Kas saaksite** selle soojaks teha?\nArvel on üks vale jook. **Palun kontrollige arvet.**',
      }),
      controlled: block('a2b1_029_av_controlled', 'dialogue', 'green', 'g_use', {
        title: 'Taasta viisakas probleemidialoog.',
        instruction: 'Täida kliendi repliigid.',
        speakerA: 'Klient',
        speakerB: 'Teenindaja',
        lines: [
          { who: 'A', text: '[Ma tellisin] kana, aga sain kala.' },
          { who: 'B', text: 'Vabandust. Kas soovite uut rooga?' },
          { who: 'A', text: 'Jah, [kas saaksite] tuua kana?' },
          { who: 'B', text: 'Muidugi.' },
          { who: 'A', text: 'Ja palun [kontrollige arvet], seal on üks vale jook.' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_029_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kui tellimus on vale…',
        instruction: 'Vali, mida tavaliselt teed.',
        questions: [
          { q: 'Kui saad vale toidu, siis…', options: '*ütlen rahulikult teenindajale\nsöön alati ära\nlähen kohe ära' },
          { q: 'Mis on kõige tähtsam?', options: '*selgitada täpselt, mis on valesti\nolla võimalikult pahane\nrääkida kiiresti' },
        ],
      }),
      reading: block('a2b1_029_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe probleemolukorda.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Vale tellimus',
        passage: 'Marek tellib restoranis veiselihaburgeri ilma sibulata ja kõrvale friikartulid. Kui toit lauda jõuab, märkab ta, et burgeris on sibul ja friikartulite asemel on salat. Marek kutsub teenindaja ning ütleb rahulikult: „Vabandust, ma tellisin burgeri ilma sibulata, aga siin on sibul. Samuti tellisin friikartulid.” Teenindaja vabandab ja pakub, et köök teeb uue burgeri. Salati vahetab ta kohe friikartulite vastu. Mõne minuti pärast saab Marek õige tellimuse. Hiljem märkab ta arvel kahte limonaadi, kuigi jõi ainult ühe. Teenindaja kontrollib arvet ja parandab vea. Marek tänab, sest mõlemad probleemid lahendati kiiresti.',
        questions: 'Millise burgeri Marek tellis? [veiselihaburgeri ilma sibulata|burgeri ilma sibulata]\nMis oli burgeris valesti? [seal oli sibul|sibul]\nMida sai ta friikartulite asemel? [salati|salat]\nMis viga oli arvel? [seal oli kaks limonaadi|kaks limonaadi]\nKuidas olukord lõppes? [vead parandati|probleemid lahendati]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_029_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Lahenda neli olukorda.',
        instruction: 'Räägi 2–3 minutit. Õpetaja annab olukorra.',
        questions: 'Said vale joogi.\nToit on külm.\nÜks tellitud asi puudub.\nArvel on vale summa.\nIgas olukorras: kirjelda probleem + palu konkreetne lahendus.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'Ma tellisin…, aga sain… · See on… · Kas saaksite…? · Palun kontrollige…',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_029_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan probleemi täpselt kirjeldada.\nMa oskan võrrelda tellitut ja saadut.\nMa oskan viisakalt lahendust paluda.\nMa oskan arve viga selgitada.\nMa suudan jääda dialoogis selgeks ja rahulikuks.',
        stamp: 'Probleem sai lahenduse!',
      }, 'full'),
    },
  },

  'a2b1-030': {
    meta: {
      title: 'Kontroll 6 — toit ja teenindus',
      subtitle: 'Näitan, et oskan toidu, koguste, partitiivi ja teenindusolukordadega iseseisvalt toime tulla.',
      canDo: 'Ma teen tellimuse, kasutan koguseid ja lahendan lihtsa teenindusprobleemi iseseisvalt.',
      goals: {
        g_vocab: 'Õpilane kasutab toidu, koguse ja teeninduse põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab teenindusteksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane rakendab koguse + partitiivi ja teenindusfraaside põhimustreid.',
        g_use: 'Õpilane saavutab kontrollitud osas vähemalt 70% ja lahendab funktsionaalse dialoogi.',
      },
    },
    additions: {
      vocab: block('a2b1_030_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri põhivara.',
        instruction: 'Paiguta sõnad õigesse rühma.',
        groups: [
          { name: 'Kogus', words: 'kilo, liiter, pakk, natuke' },
          { name: 'Tellimine', words: 'soovin, palun mulle, arve palun, joogiks' },
          { name: 'Probleem', words: 'vale, külm, puudub, kontrollige' },
        ],
      }, 'full'),
      general: block('a2b1_030_av_general', 'choice', 'sky', 'g_read', {
        title: 'Põhiidee.',
        instruction: 'Vali vastus teksti põhjal.',
        questions: [
          { q: 'Mis on kliendi peamine eesmärk?', options: '*saada õige tellimus ja korrektne arve\nõppida retsepti pähe\nvahetada töökohta' },
          { q: 'Milline oskus on olukorras kõige tähtsam?', options: '*täpne ja viisakas suhtlus\nväga kiire kõne\nkeerulised sõnad' },
          { q: 'Milline grammatika on koguse juures oluline?', options: '*partitiiv\nkomparatiiv\ntingiv kõneviis' },
        ],
      }),
      notice: block('a2b1_030_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk mustritele.',
        lines: 'kaks kilo **kartuleid**\nüks klaas **mahla**\n**Soovin** päevapraadi.\n**Ma tellisin**, aga sain…\n**Kas saaksite** selle vahetada?',
      }),
      controlled: block('a2b1_030_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Täienda õige sõna või vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Palun kaks liitrit [piima] (piim).\nOstan kilo [õunu] (õun).\n[Soovin] päevapraadi ja vett.\nKas selles [on] pähkleid?\nMa tellisin supi, aga [sain] salati.\nKas [saaksite] arvet kontrollida?',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_030_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma abita.',
        instruction: 'Vali, mida tahad enda puhul eriti kontrollida.',
        questions: [
          { q: 'Milline osa vajab kõige rohkem tähelepanu?', options: '*kogused ja partitiiv\ntellimine\nprobleemolukord' },
          { q: 'Kas suudad tellida ilma valmis dialoogita?', options: '*jah\nosaliselt\nvajan veel tuge' },
        ],
      }),
      reading: block('a2b1_030_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe üks kord tervikuna ja vasta siis detailidele.',
        passageTitle: 'Lõuna, mis vajas parandamist',
        passage: 'Kristjan läheb lõunale uude bistroosse. Ta tellib tomatisupi, kanaprae ja ühe klaasi apelsinimahla. Teenindaja küsib, kas ta soovib prae kõrvale kartuleid või riisi. Kristjan valib riisi. Kui toit saabub, on supp õige, kuid kanaprae kõrval on kartulid. Kristjan selgitab, et tellis riisi. Teenindaja vabandab ja toob mõne minuti pärast õige lisandi. Söök maitseb hästi. Pärast sööki palub Kristjan arvet. Arvel on aga kaks klaasi mahla. Ta ütleb: „Vabandust, ma jõin ainult ühe mahla. Kas saaksite arvet kontrollida?” Teenindaja parandab vea. Kristjan maksab kaardiga ja lahkub rahulolevalt, sest probleemid lahendati viisakalt ja kiiresti.',
        questions: 'Mida Kristjan joogiks tellib? [ühe klaasi apelsinimahla|apelsinimahla]\nMillise lisandi ta valib? [riisi]\nMis oli praega valesti? [prae kõrval olid kartulid|sai kartulid riisi asemel]\nMis viga oli arvel? [seal oli kaks klaasi mahla|kaks mahla]\nKuidas Kristjan maksab? [kaardiga]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_030_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — teenindusolukord.',
        instruction: 'Räägi 2–3 minutit õpetajaga. Tee tellimus ja lahenda üks ootamatu probleem.',
        questions: 'Telli põhiroog ja jook.\nKüsi koostisosa kohta.\nKasuta üht koguseväljendit.\nReageeri valele tellimusele.\nPalu konkreetne lahendus.\nKüsi arvet.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 120, maxSec: 180,
      }, 'full'),
      writing: block('a2b1_030_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — lühike sõnum.',
        instruction: 'Kirjuta 8–10 lauset teenindusolukorrast, kus midagi läks valesti ja probleem lahendati.',
        lines: 9, minSent: 8, maxSent: 10,
        keywords: 'tellisin, sain, aga, kas saaksite, arve',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_030_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan kogust väljendada.\nMa kasutan partitiivi sagedastes toidukonstruktsioonides.\nMa oskan toitu ja jooki tellida.\nMa oskan probleemi kirjeldada ja lahendust paluda.\nJärgmises moodulis tahan teeninduskeelt veel vabamalt kasutada.',
        stamp: 'Teenindusolukord on hallatav!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(toit|kogus|fraas|probleem|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|milline|millal|mida)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|viimane pilk)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(koosta|taasta|ava|kontrollitud)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule6Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 6.`);
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

export function upgradeAvastaModule6Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 6.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule6Document(lessonId);
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
    added, before: original.length, after: blocks.length, created: false,
  };
}

export const AVASTA_MODULE6_IDS = Object.freeze(Object.keys(SPECS));
