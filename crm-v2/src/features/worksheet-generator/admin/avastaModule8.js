const MODULE = 'Õppimine ja kool';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const SPECS = {
  'a2b1-036': {
    meta: {
      title: 'Koolipäev ja õppeained',
      subtitle: 'Räägin oma õppepäevast, ainetest ja õppimise rutiinist.',
      canDo: 'Ma räägin õppimisest vähemalt 2 minutit ja kasutan vähemalt 12 teemakohast sõna.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 12 kooli ja õppimise sõna.',
        g_read: 'Õpilane leiab õppepäeva tekstist tunnid, ülesanded ja hinnangud.',
        g_notice: 'Õpilane märkab, kuidas väljendatakse eelistust, raskust ja põhjendust.',
        g_use: 'Õpilane moodustab vähemalt 8 seotud lauset oma õppimispäevast.',
      },
    },
    additions: {
      vocab: block('a2b1_036_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Õppimise võtmesõnad',
        words: 'õppeaine, tunniplaan, ülesanne, kodutöö, kontrolltöö, hinne, vahetund, õpetaja, klassikaaslane, õppima, kordama, harjutama, esitama, valmistuma',
        columns: '3',
      }, 'full'),
      general: block('a2b1_036_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis teeb õppepäeva kirjelduse selgeks?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Milline info on kõige olulisem?', options: '*mida õpitakse, mis on raske ja miks\nainult klassiruumi number\nainult päeva pikkus' },
          { q: 'Milline lause annab hinnangu?', options: '*Matemaatika on mulle keeruline, sest ülesanded nõuavad palju aega.\nMatemaatika on kell kümme.\nMatemaatika on aine.' },
          { q: 'Milline väljend näitab ettevalmistust?', options: '*valmistun kontrolltööks\nlähen bussiga\nolen sööklas' },
        ],
      }),
      notice: block('a2b1_036_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka, kuidas oma õppimist kirjeldada.',
        lines: 'Mulle **meeldib** ajalugu, sest teemad on huvitavad.\nMul on **raske** matemaatikas, kui ülesanne on pikk.\nMa **valmistun kontrolltööks** tavaliselt kaks päeva.\nPärast tundi **kordan** uusi sõnu.',
      }),
      controlled: block('a2b1_036_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kirjelda õppepäeva.',
        instruction: 'Täienda laused sobiva sõnaga.',
        bank: 'tunniplaan, ülesanne, kontrolltööks, kordan, keeruline, meeldib',
        showBank: 'yes',
        sentences: 'Hommikul vaatan üle [tunniplaani].\nEsimeses tunnis saime uue [ülesande].\nÕhtul valmistun homseks [kontrolltööks].\nPärast tundi [kordan] uusi sõnu.\nFüüsika on mulle üsna [keeruline].\nMulle [meeldib] ajalugu, sest seal saab palju arutada.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_036_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mõtle oma õppimispäevale.',
        instruction: 'Vali enda jaoks kõige sobivam variant.',
        questions: [
          { q: 'Milline tundub sulle kõige lihtsam?', options: '*keeled\nmatemaatika või loodusained\nühiskonnaained\nmuu' },
          { q: 'Millal õpid kõige paremini?', options: '*hommikul\npärastlõunal\nõhtul' },
        ],
      }),
      reading: block('a2b1_036_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe õppimispäeva kirjeldust.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kaisa kolmapäev',
        passage: 'Kaisa käib gümnaasiumis ja kolmapäev on tema kõige pikem koolipäev. Esimene tund algab kell kaheksa ja selleks on eesti keel. Seal loetakse teksti ning arutatakse uusi sõnu. Teises tunnis on matemaatika, mis on Kaisa jaoks kõige keerulisem aine. Ta saab ülesannetest tavaliselt aru, kuid vajab nende lahendamiseks rohkem aega. Pärast vahetundi on ajalugu, mis talle väga meeldib, sest õpetaja laseb palju arutada. Lõuna ajal sööb Kaisa koolis. Päeva viimases tunnis on inglise keel ja seal valmistutakse kontrolltööks. Pärast kooli läheb Kaisa koju, puhkab natuke ning teeb siis kodutööd. Õhtul kordab ta umbes kakskümmend minutit uusi sõnu, et järgmisel päeval oleks lihtsam.',
        questions: 'Mis on Kaisa esimene tund? [eesti keel]\nMilline aine on talle kõige keerulisem? [matemaatika]\nMiks talle ajalugu meeldib? [õpetaja laseb palju arutada|seal saab palju arutada]\nMilleks valmistutakse inglise keele tunnis? [kontrolltööks]\nKui kaua ta õhtul uusi sõnu kordab? [umbes kakskümmend minutit|20 minutit]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_036_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma õppimisest.',
        instruction: 'Räägi 2 minutit. Kasuta vähemalt 12 teemakohast sõna.',
        questions: 'Milline on sinu tüüpiline õppepäev?\nMillised ained või teemad on lihtsad?\nMis on keerulisem?\nKuidas valmistud kontrolltööks või testiks?\nMida teed pärast tundi?\nMis aitab sul paremini õppida?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'tunniplaan · ülesanne · kontrolltöö · kordama · harjutama · valmistuma',
        minSec: 100, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_036_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma kasutan vähemalt 12 õppimise sõna.\nMa oskan kirjeldada oma õppepäeva.\nMa oskan öelda, mis on lihtne või raske.\nMa oskan põhjendada, miks mulle mingi aine meeldib.\nJärgmises tunnis tahan infinitiivivorme paremini eristada.',
        stamp: 'Õppimispäev on sõnades!',
      }, 'full'),
    },
  },

  'a2b1-037': {
    meta: {
      title: 'ma- või da-infinitiiv?',
      subtitle: 'Valin sagedastes konstruktsioonides õige infinitiivivormi.',
      canDo: 'Ma valin ma- või da-infinitiivi õigesti vähemalt 8 juhul 10-st.',
      goals: {
        g_vocab: 'Õpilane kasutab õppimisega seotud sagedasi põhiverbe.',
        g_read: 'Õpilane tunneb tekstis ära ma- ja da-infinitiivi tüüpilised konstruktsioonid.',
        g_notice: 'Õpilane märkab pean/lähen + ma ning tahan/oskan/saan + da mustreid.',
        g_use: 'Õpilane valib õige infinitiivivormi vähemalt 8 kontekstis 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_037_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Sagedased verbipaarid',
        words: 'pean õppima, lähen õppima, hakkan õppima, tahan õppida, oskan kirjutada, saan korrata, meeldib lugeda, proovin rääkida',
        columns: '2',
      }, 'full'),
      general: block('a2b1_037_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kumb vorm sobib?',
        instruction: 'Vali õige variant.',
        questions: [
          { q: 'Ma pean täna …', options: '*õppima\nõppida\nõpin' },
          { q: 'Ma tahan rohkem …', options: '*rääkida\nrääkima\nräägin' },
          { q: 'Ma lähen raamatukokku …', options: '*õppima\nõppida\nõppisin' },
        ],
      }),
      notice: block('a2b1_037_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kahte põhimustrit.',
        lines: '**pean + ma** → pean õppima\n**lähen + ma** → lähen õppima\n**tahan + da** → tahan õppida\n**oskan + da** → oskan kirjutada\n**saan + da** → saan korrata',
      }),
      controlled: block('a2b1_037_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Vali õige infinitiiv.',
        instruction: 'Kirjuta sulgudes olev verb õiges vormis.',
        bank: '',
        showBank: 'no',
        sentences: 'Ma pean õhtul [õppima] (õppima).\nMa tahan paremini [rääkida] (rääkima).\nPärast kooli lähen raamatukokku [õppima] (õppima).\nMa oskan juba üsna hästi [kirjutada] (kirjutama).\nTäna saan uut teemat [korrata] (kordama).\nHomme hakkan eksamiks [valmistuma] (valmistuma).',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_037_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kuula oma keeletunnet.',
        instruction: 'Vali variant, mis tundub loomulikum.',
        questions: [
          { q: 'Ma tahan eesti keelt …', options: '*õppida\nõppima' },
          { q: 'Ma pean eesti keelt …', options: '*õppima\nõppida' },
        ],
      }),
      reading: block('a2b1_037_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe õppimisplaani.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kuidas Erik eksamiks valmistub',
        passage: 'Erikul on kahe nädala pärast keeleeksam. Ta teab, et peab iga päev natuke õppima, sest viimasel õhtul kõike korraga teha ei saa. Tööpäevadel läheb ta pärast tööd raamatukokku õppima. Kõigepealt tahab ta korrata sõnavara ja seejärel proovib kirjutada ühe lühikese teksti. Erik oskab grammatikaülesandeid üsna hästi teha, kuid rääkida tahab ta rohkem harjutada. Selleks saab ta kaks korda nädalas õpetajaga vestelda. Nädalavahetusel hakkab Erik tegema pikemaid harjutusteste. Kui ta mõnest reeglist aru ei saa, proovib ta näidete abil vastuse leida või küsib õpetajalt. Erik ei taha ainult testi läbida, vaid soovib õppida keelt päriselt kasutama.',
        questions: 'Millal on Erikul eksam? [kahe nädala pärast]\nKuhu ta pärast tööd läheb? [raamatukokku õppima|raamatukokku]\nMida tahab ta kõigepealt korrata? [sõnavara]\nMida tahab ta rohkem harjutada? [rääkimist|rääkida]\nMida hakkab ta nädalavahetusel tegema? [pikemaid harjutusteste|harjutusteste]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_037_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Räägi oma õppimisplaanist.',
        instruction: 'Räägi 1–2 minutit ja kasuta vähemalt kuut ma-/da-konstruktsiooni.',
        questions: 'Mida pead sel nädalal õppima?\nMida tahad paremini osata?\nKuhu lähed vajadusel õppima?\nMida saad iseseisvalt teha?\nMida hakkad homme harjutama?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta eri mustreid:',
        tipText: 'pean + ma · lähen + ma · tahan + da · oskan + da · saan + da',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_037_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma tean, millal kasutada *pean + ma*.\nMa tean, millal kasutada *lähen + ma*.\nMa tean, millal kasutada *tahan/oskan/saan + da*.\nMa kasutan neid oma õppimisplaanis.\nJärgmises tunnis tahan põhjuseid paremini selgitada.',
        stamp: 'Infinitiivivalik muutub selgemaks!',
      }, 'full'),
    },
  },

  'a2b1-038': {
    meta: {
      title: 'Sest ja kuna — põhjuse selgitamine',
      subtitle: 'Selgitan oma arvamuse või valiku põhjust täislausega.',
      canDo: 'Ma annan vähemalt viis täielikku vastust, milles põhjendan oma mõtet.',
      goals: {
        g_vocab: 'Õpilane kasutab õppimise, motivatsiooni ja raskuste põhivara.',
        g_read: 'Õpilane leiab tekstist põhjuse ja tulemuse seoseid.',
        g_notice: 'Õpilane märkab sest, kuna ja sellepärast et kasutust.',
        g_use: 'Õpilane ühendab vähemalt 6 mõttepaari terviklikuks põhjenduseks.',
      },
    },
    additions: {
      vocab: block('a2b1_038_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Põhjendamise väljendid',
        words: 'sest, kuna, sellepärast et, põhjus, aitab, segab, keskenduma, motivatsioon, keeruline, kasulik, huvitav, oluline',
        columns: '3',
      }, 'full'),
      general: block('a2b1_038_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kas põhjus on täielik?',
        instruction: 'Vali kõige parem vastus.',
        questions: [
          { q: 'Mulle meeldib õppida hommikul, sest…', options: '*siis suudan paremini keskenduda.\nhommikul.\nmeeldib.' },
          { q: 'Kuna mul on homme test, siis…', options: '*kordan täna materjali.\ntest.\neile.' },
          { q: 'Mida annab põhjendus?', options: '*selgitab, miks ma nii arvan või teen\nainult pikema lause\nmuudab aja minevikuks' },
        ],
      }),
      notice: block('a2b1_038_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka põhjuse seost.',
        lines: 'Mulle meeldib ajalugu, **sest** teemad on huvitavad.\n**Kuna** homme on test, kordan täna rohkem.\nMa õpin kodus, **sellepärast et** seal on vaiksem.\nPõhjendus vastab küsimusele **miks?**',
      }),
      controlled: block('a2b1_038_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ühenda mõte ja põhjus.',
        instruction: 'Täienda laused sobiva sidesõnaga.',
        bank: 'sest, kuna, sellepärast et',
        showBank: 'yes',
        sentences: 'Õpin hommikul, [sest] siis olen värskem.\n[Kuna] mul on homme kontrolltöö, kordan täna rohkem.\nMulle meeldib paaris töötada, [sest] saan mõtteid arutada.\nÕpin raamatukogus, [sellepärast et] seal on vaikne.\n[Kuna] uus teema on keeruline, küsin õpetajalt abi.\nTeen märkmeid, [sest] nii jääb info paremini meelde.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_038_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Miks sa õpid?',
        instruction: 'Vali üks põhjus, mis sobib sulle kõige paremini.',
        questions: [
          { q: 'Miks õpid eesti keelt?', options: '*töö jaoks\neksami jaoks\nigapäevaeluks\nmitmel põhjusel' },
          { q: 'Miks mõni teema on raske?', options: '*vähe harjutamist\nkeeruline sõnavara\nkiire tempo\nmuu põhjus' },
        ],
      }),
      reading: block('a2b1_038_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe motivatsioonist.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Miks Laura õpib teistmoodi',
        passage: 'Laura õppis varem tavaliselt hilja õhtul, sest päeval oli tal töö ja muud kohustused. Ta märkas aga, et pärast kella kümmet oli raske keskenduda. Sellepärast muutis ta oma rutiini. Nüüd ärkab Laura kaks korda nädalas veidi varem ja kordab hommikul uusi sõnu, kuna siis on tema pea värskem. Pikemaid tekste kirjutab ta nädalavahetusel, sest selleks vajab rohkem aega ja rahu. Kui mõni grammatikaosa tundub keeruline, küsib ta õpetajalt näiteid, kuna ainult reegli lugemisest talle ei piisa. Laura ütleb, et uus süsteem töötab paremini, sest ta ei proovi enam kõike korraga teha. Samuti on motivatsiooni rohkem, kuna ta näeb väikseid edusamme iga nädal.',
        questions: 'Miks Laura varem hilja õhtul õppis? [päeval oli tal töö ja muud kohustused|töö ja kohustuste pärast]\nMiks ta muutis rutiini? [õhtul oli raske keskenduda]\nMiks kordab ta sõnu hommikul? [siis on pea värskem|hommikul on ta värskem]\nMillal kirjutab ta pikemaid tekste? [nädalavahetusel]\nMiks on tal nüüd rohkem motivatsiooni? [ta näeb väikseid edusamme iga nädal|näeb edusamme]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_038_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Vasta viiele miks-küsimusele.',
        instruction: 'Räägi 1–2 minutit. Iga vastus peab sisaldama põhjust.',
        questions: 'Miks õpid eesti keelt?\nMiks on mõni teema sulle lihtne?\nMiks on mõni teema raske?\nMiks õpid just sel ajal või selles kohas?\nMiks tahad oma õppimisviisi muuta?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'sest · kuna · sellepärast et',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_038_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma vastan küsimusele *miks?* täislausega.\nMa kasutan sõna *sest*.\nMa oskan alustada põhjendust sõnaga *kuna*.\nMa oskan anda vähemalt viis selget põhjust.\nJärgmises tunnis tahan probleemi ja lahenduse paremini siduda.',
        stamp: 'Põhjus on selgelt öeldud!',
      }, 'full'),
    },
  },

  'a2b1-039': {
    meta: {
      title: 'Õppimisprobleem ja lahendus',
      subtitle: 'Kirjeldan õppimisraskust ja pakun realistliku lahenduse.',
      canDo: 'Ma sõnastan probleemi, selle põhjuse ja vähemalt ühe sobiva lahenduse.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 õppimisprobleemi ja lahenduse väljendit.',
        g_read: 'Õpilane leiab tekstist probleemi, põhjuse ja lahenduse.',
        g_notice: 'Õpilane märkab mul on raske…, ma ei saa aru…, võiksin…, mul on vaja… mustreid.',
        g_use: 'Õpilane lahendab vähemalt 4 õppimisolukorda sobiva ettepanekuga.',
      },
    },
    additions: {
      vocab: block('a2b1_039_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Probleemi ja lahenduse fraasid',
        words: 'mul on raske…, ma ei saa aru…, jäin teemast maha, mul pole piisavalt aega, mul on vaja abi, võiksin küsida, võiksin korrata, võiksin teha plaani, õpetajalt abi küsima, rohkem harjutama',
        columns: '2',
      }, 'full'),
      general: block('a2b1_039_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis on päris lahendus?',
        instruction: 'Vali kõige kasulikum variant.',
        questions: [
          { q: 'Sa ei saa uuest teemast aru.', options: '*küsin õpetajalt näidet ja harjutan uuesti\nignoreerin teemat\nütlen ainult „raske”' },
          { q: 'Sul pole kodutööks aega.', options: '*teen realistliku plaani ja alustan tähtsamast\nteen kõike korraga öösel\nei vaata ülesannet' },
          { q: 'Mida sisaldab hea vastus?', options: '*probleem + põhjus + lahendus\nainult probleem\nainult üks sõna' },
        ],
      }),
      notice: block('a2b1_039_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka probleemi-lahenduse mudelit.',
        lines: '**Mul on raske** pikast tekstist aru saada.\nMa **ei saa aru**, mida selles ülesandes teha.\nMul **on vaja** rohkem näiteid.\nMa **võiksin** õpetajalt abi küsida.\nMa võiksin seda teemat veel kord **harjutada**.',
      }),
      controlled: block('a2b1_039_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Paku lahendus.',
        instruction: 'Täienda laused sobiva väljendiga.',
        bank: 'mul on raske, ei saa aru, mul on vaja, võiksin, harjutada, abi küsida',
        showBank: 'yes',
        sentences: '[Mul on raske] uusi sõnu meelde jätta.\nMa [ei saa aru], mida selles ülesandes teha.\nMul [on vaja] rohkem aega.\nMa [võiksin] teha igaks päevaks väikese plaani.\nSeda grammatikat pean rohkem [harjutama].\nKui probleem jääb, saan õpetajalt [abi küsida].',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_039_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis segab õppimist kõige rohkem?',
        instruction: 'Vali üks tuttav probleem.',
        questions: [
          { q: 'Mis on sinu jaoks sagedasem?', options: '*vähe aega\nraske grammatika\nsõnad ei jää meelde\nkeeruline ülesanne' },
          { q: 'Mida teed tavaliselt esimesena?', options: '*proovin ise uuesti\nküsin abi\notsin näite\nteen väikese pausi' },
        ],
      }),
      reading: block('a2b1_039_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe probleemist ja lahendusest.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Mark ei jõua kõike teha',
        passage: 'Mark õpib eesti keelt kaks korda nädalas, kuid viimastel nädalatel on tal olnud tööl väga kiire. Ta jäi ühest tunnist puuduma ja tunneb nüüd, et ei saa uuest grammatikaosast hästi aru. Kodutöö võtab liiga kaua aega ning Mark hakkab mõtlema, et tal pole õppimiseks piisavalt aega. Õpetaja soovitab tal mitte proovida kõike ühe õhtuga teha. Kõigepealt võiks Mark vaadata üle puudutud tunni põhinäited. Seejärel võiks ta valida kolm lühikest harjutust ja teha neid eri päevadel. Kui mõni osa jääb endiselt segaseks, võiks ta saata õpetajale konkreetse küsimuse. Mark otsustab ka panna kalendrisse kolm 20-minutilist õppeaega nädalas. Nii muutub suur ülesanne väiksemateks sammudeks ja ta saab jälle järjepidevalt edasi liikuda.',
        questions: 'Miks Mark ühest tunnist puudus? [tööl oli väga kiire|töö pärast]\nMillest ta hästi aru ei saa? [uuest grammatikaosast|grammatikast]\nMida soovitab õpetaja kõigepealt teha? [vaadata üle põhinäited|puudutud tunni põhinäited üle vaadata]\nMitu lühikest harjutust võiks ta valida? [kolm|3]\nKui pikad õppeajad paneb Mark kalendrisse? [20 minutit|kakskümmend minutit]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_039_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Lahenda neli õppimisprobleemi.',
        instruction: 'Räägi 2 minutit. Iga kord: probleem → põhjus → lahendus.',
        questions: 'Sa ei saa ülesandest aru.\nJäid ühest teemast maha.\nSul on väga vähe aega.\nUued sõnad ei jää meelde.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'mul on raske… · ma ei saa aru… · mul on vaja… · võiksin…',
        minSec: 90, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_039_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan õppimisprobleemi selgelt nimetada.\nMa oskan öelda, miks probleem tekkis.\nMa oskan kasutada väljendit *mul on vaja…*.\nMa oskan pakkuda vähemalt üht lahendust sõnaga *võiksin*.\nJärgmises tunnis tahan neid oskusi iseseisvalt kasutada.',
        stamp: 'Probleemil on lahendus!',
      }, 'full'),
    },
  },

  'a2b1-040': {
    meta: {
      title: 'Vahehindamine 2 — A2+',
      subtitle: 'Näitan, et olen valmis pikemaks ja iseseisvamaks kõneks.',
      canDo: 'Ma lahendan lugemise, grammatika, kirjutamise ja suhtlusolukorra vähemalt 70% tasemel.',
      goals: {
        g_vocab: 'Õpilane kasutab A2+ põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab 180–220-sõnalise teksti põhiideed ja detaile.',
        g_notice: 'Õpilane rakendab lihtminevikku, partitiivi, ma-/da-infinitiivi ja põhjendamist kontekstis.',
        g_use: 'Õpilane saavutab kokku vähemalt 70% ning rääkimine ja grammatika ei jää alla 60%.',
      },
    },
    additions: {
      vocab: block('a2b1_040_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri A2+ põhivara.',
        instruction: 'Paiguta väljendid teemade järgi.',
        groups: [
          { name: 'Minevik', words: 'läks, tegi, pärast seda, lõpuks' },
          { name: 'Kogus', words: 'kilo, liiter, natuke, palju' },
          { name: 'Õppimine', words: 'pean õppima, tahan õppida, sest, võiksin' },
          { name: 'Suhtlus', words: 'kahjuks ei saa, kas saaksite, mul on vaja, lepime kokku' },
        ],
      }, 'full'),
      general: block('a2b1_040_av_general', 'choice', 'sky', 'g_read', {
        title: 'Põhiidee.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis on teksti keskne teema?', options: '*õppimise, töö ja igapäevaste kohustuste tasakaalustamine\nainult üks koolitund\nainult toidu ostmine' },
          { q: 'Mida peategelane muudab?', options: '*ta teeb realistlikuma plaani\nta lõpetab õppimise\nta vahetab linna' },
          { q: 'Milline oskus aitab tal kõige rohkem?', options: '*prioriteetide seadmine ja põhjendatud valikud\nväga kiire lugemine\nkeeruliste sõnade kasutamine' },
        ],
      }),
      notice: block('a2b1_040_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Kontrolli võtmemustreid.',
        lines: 'Eile **läksin** varem koju.\nMul on vaja kaks kilo **kartuleid**.\nMa **pean õppima**, aga tahan õhtul ka **puhata**.\nÕpin hommikul, **sest** siis keskendun paremini.\nMa **võiksin** teha väiksema plaani.',
      }),
      controlled: block('a2b1_040_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud grammatika.',
        instruction: 'Täienda ilma sõnapangata.',
        bank: '',
        showBank: 'no',
        sentences: 'Eile ma [läksin] (minema) raamatukokku.\nOstsin kilo [õunu] (õun).\nMa pean õhtul [õppima] (õppima).\nMa tahan paremini [rääkida] (rääkima).\nÕpin hommikul, [sest] siis olen värskem.\nKui aega on vähe, [võiksin] teha väiksema plaani.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_040_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta iseseisvalt.',
        instruction: 'Vali, mida tahad enda puhul eriti kontrollida.',
        questions: [
          { q: 'Mis osa tundub praegu tugevam?', options: '*lugemine\ngrammatika\nrääkimine\nkirjutamine' },
          { q: 'Mis vajab rohkem tähelepanu?', options: '*minevik\npartitiiv\nma-/da-infinitiiv\npõhjendamine' },
        ],
      }),
      reading: block('a2b1_040_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe tervikuna, siis vasta küsimustele.',
        passageTitle: 'Kuidas Anna oma nädala ümber korraldas',
        passage: 'Anna töötab täiskohaga ja õpib õhtuti eesti keelt. Eelmisel kuul tundis ta, et kohustusi oli liiga palju. Ta tuli töölt koju väsinuna, pidi tegema koduseid asju ning proovis alles hilja õhtul õppima hakata. Sellepärast jäi osa kodutöid tegemata ja uued sõnad ei jäänud hästi meelde. Ühel nädalavahetusel vaatas Anna oma kalendri üle. Ta otsustas, et ei pea igal õhtul pikka aega õppima. Nüüd kordab ta esmaspäeval ja kolmapäeval hommikul kakskümmend minutit sõnavara, sest siis on tal rohkem energiat. Teisipäeva õhtul läheb ta raamatukokku kirjutamist harjutama. Neljapäeval saab ta õpetajaga rääkida. Reedel puhkab Anna teadlikult. Toidu ostab ta laupäeval korraga mitmeks päevaks, et nädala sees aega säästa. Kui tööpäev venib pikaks, ei ürita ta kogu plaani päästa, vaid lükkab ühe väiksema ülesande edasi. Anna ütleb, et uus süsteem pole täiuslik, kuid ta jõuab nüüd sagedamini õppida ja tunneb vähem stressi.',
        questions: 'Miks jäi Annal osa kodutöid tegemata? [ta proovis liiga hilja õppida ja oli väsinud|kohustusi oli liiga palju]\nMillal kordab ta sõnavara? [esmaspäeval ja kolmapäeval hommikul]\nKuhu läheb ta teisipäeva õhtul? [raamatukokku]\nMiks ostab ta laupäeval toitu mitmeks päevaks? [et nädala sees aega säästa|aja säästmiseks]\nMida teeb ta siis, kui tööpäev venib pikaks? [lükkab ühe väiksema ülesande edasi|lükkab väiksema ülesande edasi]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_040_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — 3 minutit.',
        instruction: 'Räägi ühest õppimise või igapäevaelu probleemist ja sellest, kuidas seda lahendaksid.',
        questions: 'Kirjelda olukorda.\nMis juhtus varem?\nMis on praegu probleem?\nMida pead tegema?\nMida tahad teha?\nMida võiksid muuta ja miks?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 150, maxSec: 210,
      }, 'full'),
      writing: block('a2b1_040_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — 100–120 sõna.',
        instruction: 'Kirjuta õppimisest või igapäevaplaanist: probleem, põhjus, mida tegid varem ja mida kavatsed muuta.',
        lines: 11, minSent: 9, maxSent: 13,
        keywords: 'eile, pean, tahan, sest, võiksin, pärast',
        minKeywords: 4,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_040_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Kas olen valmis edasi liikuma?', instruction: '',
        items: 'Ma saan pikemast igapäevatekstist aru.\nMa kasutan lihtminevikku piisavalt stabiilselt.\nMa eristan sagedasi ma-/da-infinitiivi mustreid.\nMa oskan oma mõtet põhjendada.\nJärgmises etapis tahan vastuseid pikemaks ja sidusamaks teha.',
        stamp: 'A2+ etapp on kontrollitud!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(õpp|verb|põhj|probleem|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|kumb|kas põhjus|päris lahendus|mis teeb)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|kontrolli)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(kirjelda|vali|ühenda|paku|kontrollitud)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule8Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 8.`);
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

export function upgradeAvastaModule8Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 8.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule8Document(lessonId);
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

export const AVASTA_MODULE8_IDS = Object.freeze(Object.keys(SPECS));
