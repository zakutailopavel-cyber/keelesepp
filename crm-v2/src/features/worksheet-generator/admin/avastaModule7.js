const MODULE = 'Tervis ja enesetunne';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const SPECS = {
  'a2b1-031': {
    meta: {
      title: 'Keha ja sümptomid',
      subtitle: 'Kirjeldan enesetunnet ja sagedasi sümptomeid selgelt.',
      canDo: 'Ma kirjeldan vähemalt kuut sümptomit ja kasutan õigeid konstruktsioone.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 12 keha- ja sümptomisõna.',
        g_read: 'Õpilane leiab tekstist inimese põhisümptomid ja nende kestuse.',
        g_notice: 'Õpilane märkab konstruktsioone mul valutab…, mul on…, tunnen end….',
        g_use: 'Õpilane moodustab vähemalt 6 korrektset sümptomilauset.',
      },
    },
    additions: {
      vocab: block('a2b1_031_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Keha ja sümptomid',
        words: 'pea, kurk, kõht, selg, käsi, jalg, peavalu, kurguvalu, kõhuvalu, nohu, köha, palavik, nõrkus, väsimus, pearinglus',
        columns: '3',
      }, 'full'),
      general: block('a2b1_031_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mida inimene tunneb?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: '„Mul valutab kurk.” Mis sümptom see on?', options: '*kurguvalu\nseljavalu\nnohu' },
          { q: '„Mul on 38 kraadi.”', options: '*palavik\nköha\npeavalu' },
          { q: '„Tunnen end väga väsinuna.”', options: '*enesetunne\nasukoht\nkokkulepe' },
        ],
      }),
      notice: block('a2b1_031_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka kolme põhikonstruktsiooni.',
        lines: '**Mul valutab** pea / kurk / kõht.\n**Mul on** nohu / köha / palavik.\n**Tunnen end** halvasti / väsinuna / nõrgana.',
      }),
      controlled: block('a2b1_031_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kirjelda sümptomit.',
        instruction: 'Täienda laused sobiva vormiga.',
        bank: 'valutab, on, tunnen, köha, palavik, väsinuna',
        showBank: 'yes',
        sentences: 'Mul [valutab] pea.\nMul [on] tugev nohu.\nMul on kuiv [köha].\nÕhtul oli mul kõrge [palavik].\nMa [tunnen] end halvasti.\nPärast tööd tunnen end väga [väsinuna].',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_031_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kuidas sa tavaliselt enesetunnet kirjeldad?',
        instruction: 'Vali enda jaoks kõige tuttavam variant.',
        questions: [
          { q: 'Milline sümptom on sulle kõige tuttavam?', options: '*peavalu\nnohu või köha\nkõhuvalu\nseljavalu' },
          { q: 'Mida ütled esimesena, kui tunned end halvasti?', options: '*mis valutab\nkas mul on palavik\nkui kaua see kestab' },
        ],
      }),
      reading: block('a2b1_031_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe enesetunde kirjeldust.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Mari ei tunne end hästi',
        passage: 'Mari ärkas hommikul tavalisest varem, sest tal oli kurk valus ja nina kinni. Ta mõõtis palavikku ning termomeeter näitas 37,8 kraadi. Pea valutas natuke, kuid kõige rohkem häiris tugev nohu. Tööle minnes tundis Mari end väsinuna ja päeva jooksul tekkis ka kuiv köha. Lõuna ajal otsustas ta, et ei jää õhtuni tööle. Ta kirjutas juhile, et tunneb end halvasti, ja läks koju. Kodus jõi Mari sooja teed, puhkas ja mõõtis hiljem uuesti palavikku. Ta ei teinud trenni ega läinud õhtul sõpradega välja, kuigi see oli varem plaanis. Õhtul oli enesetunne natuke parem, kuid köha ja kurguvalu olid alles. Mari otsustas, et kui sümptomid hommikuks ei vähene, helistab ta perearstikeskusesse.',
        questions: 'Mis Maril hommikul valutas? [kurk]\nKui kõrge oli palavik? [37,8 kraadi|37.8 kraadi|37,8]\nMis sümptom tekkis päeva jooksul? [kuiv köha|köha]\nMiks ta läks varem koju? [tundis end halvasti|ta tundis end halvasti]\nMillal plaanib ta perearstikeskusesse helistada? [kui sümptomid hommikuks ei vähene|hommikul kui sümptomid ei vähene]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_031_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Kirjelda enesetunnet.',
        instruction: 'Räägi 1–2 minutit päris või kujuteldavast olukorrast.',
        questions: 'Mis sul valutab?\nKas sul on nohu, köha või palavik?\nKuidas sa end tunned?\nKui kaua sümptomid on kestnud?\nMida sa juba tegid?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'Mul valutab… · Mul on… · Tunnen end… · See algas…',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_031_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma nimetan vähemalt kuus sümptomit.\nMa kasutan konstruktsiooni *mul valutab…*.\nMa kasutan konstruktsiooni *mul on…*.\nMa oskan öelda, kuidas end tunnen.\nJärgmises tunnis tahan sümptomeid arstile selgitada.',
        stamp: 'Enesetunne on sõnades!',
      }, 'full'),
    },
  },

  'a2b1-032': {
    meta: {
      title: 'Arsti juures',
      subtitle: 'Selgitan probleemi ja vastan täpsustavatele küsimustele.',
      canDo: 'Ma annan arstile põhiinfo ja vastan vähemalt viiele täpsustavale küsimusele.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 arsti vastuvõtu ja sümptomite väljendit.',
        g_read: 'Õpilane leiab dialoogist sümptomite alguse, kestuse ja soovituse.',
        g_notice: 'Õpilane märkab küsimusi Kui kaua?, Millal algas?, Kas teil on…?.',
        g_use: 'Õpilane lõpetab vähemalt 5 arsti-patsiendi küsimus-vastuspaari.',
      },
    },
    additions: {
      vocab: block('a2b1_032_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Arsti vastuvõtu fraasid',
        words: 'Millal see algas?, Kui kaua see on kestnud?, Kas teil on palavik?, Kas köha on kuiv?, Mul on olnud…, See algas eile., Umbes kolm päeva., Võtan ravimeid., allergia, retsept',
        columns: '2',
      }, 'full'),
      general: block('a2b1_032_av_general', 'choice', 'sky', 'g_read', {
        title: 'Millist infot arst vajab?',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Miks küsib arst „Kui kaua?”', options: '*et teada sümptomi kestust\net teada aadressi\net teada töökohta' },
          { q: '„Millal algas?” küsib…', options: '*algusaega\nravimi hinda\npatsiendi nime' },
          { q: 'Milline vastus on piisavalt täpne?', options: '*See algas kolm päeva tagasi.\nNatuke aega.\nKunagi.' },
        ],
      }),
      notice: block('a2b1_032_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka täpsustavaid küsimusi.',
        lines: '**Millal see algas?** — Eile õhtul.\n**Kui kaua** teil on köha olnud? — Umbes kolm päeva.\n**Kas teil on** palavik? — Jah, eile oli 38 kraadi.\n**Kas te võtate** praegu ravimeid? — Ei võta.',
      }),
      controlled: block('a2b1_032_av_controlled', 'dialogue', 'green', 'g_use', {
        title: 'Taasta vastuvõtudialoog.',
        instruction: 'Täida puuduvad patsiendi vastused.',
        speakerA: 'Arst',
        speakerB: 'Patsient',
        lines: [
          { who: 'A', text: 'Millal kurguvalu algas?' },
          { who: 'B', text: 'See [algas eile õhtul].' },
          { who: 'A', text: 'Kui kaua teil köha on olnud?' },
          { who: 'B', text: '[Umbes kolm päeva].' },
          { who: 'A', text: 'Kas teil on palavik?' },
          { who: 'B', text: 'Jah, eile [oli 38 kraadi].' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_032_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis on arsti juures kõige raskem?',
        instruction: 'Vali enda jaoks sobiv variant.',
        questions: [
          { q: 'Mida on keerulisem öelda?', options: '*mis sümptom on\nkui kaua see kestab\nmillal see algas\nkõike on lihtne öelda' },
          { q: 'Kus on raskem suhelda?', options: '*telefonis aega broneerides\nvastuvõtul\nmõlemad on sarnased' },
        ],
      }),
      reading: block('a2b1_032_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe arsti vastuvõtu dialoogi.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Perearsti vastuvõtt',
        passage: 'Arst küsib Andreilt, mis teda häirib. Andrei ütleb, et tal on juba neli päeva köha ja nohu. Köha oli alguses kuiv, kuid täna hommikul muutus tugevamaks. Arst küsib, kas Andreil on olnud palavikku. Andrei vastab, et üleeile õhtul oli 38 kraadi, kuid täna palavikku ei ole. Samuti valutab tal natuke pea. Arst kuulab Andrei kopse ja vaatab kurku. Seejärel küsib ta, kas Andrei kasutab mõnda ravimit või kas tal on allergiaid. Andrei ütleb, et ravimeid ei võta ja teadaolevaid allergiaid ei ole. Arst soovitab paar päeva puhata, juua piisavalt vedelikku ja võtta vajadusel palavikualandajat. Kui enesetunne halveneb, peab Andrei uuesti ühendust võtma.',
        questions: 'Kui kaua Andreil köha on olnud? [neli päeva|4 päeva]\nMillal tal oli palavik? [üleeile õhtul]\nKas tal on täna palavik? [ei]\nMida arst kontrollib? [kopse ja kurku|kopse|kurku]\nMida peab Andrei tegema, kui enesetunne halveneb? [uuesti ühendust võtma|arstiga uuesti ühendust võtma]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_032_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Mängi patsiendi rolli.',
        instruction: 'Räägi 2–3 minutit. Õpetaja esitab vähemalt viis täpsustavat küsimust.',
        questions: 'Mis sind häirib?\nMillal see algas?\nKui kaua see kestnud on?\nKas sul on palavik?\nKas võtad ravimeid?\nKas sul on allergiaid?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Vasta täieliku infoga:',
        tipText: 'sümptom + algus + kestus + tugevus + muu oluline info',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_032_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan öelda, miks arsti juurde tulin.\nMa oskan öelda, millal sümptom algas.\nMa oskan öelda, kui kaua see on kestnud.\nMa oskan vastata vähemalt viiele täpsustavale küsimusele.\nJärgmises tunnis tahan paremini aru saada soovitustest.',
        stamp: 'Põhiinfo on olemas!',
      }, 'full'),
    },
  },

  'a2b1-033': {
    meta: {
      title: 'Nõuanded ja käskiv kõneviis',
      subtitle: 'Mõistan ja annan lihtsaid tervisenõuandeid.',
      canDo: 'Ma annan vähemalt viis sobivat nõuannet ja mõistan tüüpilisi juhiseid.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 sagedast tervisenõuande verbi ja väljendit.',
        g_read: 'Õpilane seostab sümptomid sobivate lihtsate soovitustega.',
        g_notice: 'Õpilane märkab käskiva kõneviisi vorme puhka, joo, võta ja ära….',
        g_use: 'Õpilane annab vähemalt 5 sobivat positiivset või negatiivset nõuannet.',
      },
    },
    additions: {
      vocab: block('a2b1_033_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Nõuande tegusõnad',
        words: 'puhka, joo, söö, võta, maga, helista, mõõda, ära mine, ära tee, ära joo, võiksid puhata, võiksid arstile helistada',
        columns: '3',
      }, 'full'),
      general: block('a2b1_033_av_general', 'choice', 'sky', 'g_read', {
        title: 'Milline nõuanne sobib?',
        instruction: 'Vali olukorrale kõige mõistlikum vastus.',
        questions: [
          { q: 'Sul on palavik ja nõrkus.', options: '*Puhka ja joo piisavalt.\nMine kohe trenni.\nÄra maga.' },
          { q: 'Kurguvalu on mitu päeva väga tugev.', options: '*Võiksid arstile helistada.\nJoo vähem.\nTee rohkem tööd.' },
          { q: 'Mida tähendab „Ära mine täna trenni”?', options: '*negatiivne soovitus\nluba\nminevik' },
        ],
      }),
      notice: block('a2b1_033_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka käskivat vormi.',
        lines: '**Puhka** täna kodus.\n**Joo** palju vett.\n**Võta** vajadusel ravim.\n**Ära mine** täna trenni.\nSa **võiksid** perearstile helistada.',
      }),
      controlled: block('a2b1_033_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Anna sobiv nõuanne.',
        instruction: 'Täienda laused sobiva käsu või soovitusega.',
        bank: 'puhka, joo, võta, ära mine, maga, helista',
        showBank: 'yes',
        sentences: 'Kui sul on palavik, [puhka] kodus.\nKurguvalu korral [joo] sooja teed.\nKui arst soovitas ravimit, [võta] seda juhendi järgi.\nKui tunned end halvasti, [ära mine] trenni.\nKui oled väga väsinud, [maga] piisavalt.\nKui sümptomid ei vähene, [helista] arstile.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_033_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Millist nõu kuuled kõige sagedamini?',
        instruction: 'Vali tuttavaim variant.',
        questions: [
          { q: 'Kui oled haige, mida sulle tavaliselt öeldakse?', options: '*puhka\njoo vett\nmaga rohkem\nkõiki neid' },
          { q: 'Kas nõuanne peab alati olema käsk?', options: '*ei, võib öelda ka „võiksid…”\njah, alati\nainult arsti juures' },
        ],
      }),
      reading: block('a2b1_033_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe soovitusi.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Mida teha külmetuse korral?',
        passage: 'Kui sul on kerge külmetus, ei pea sa alati kohe arsti juurde minema. Kõigepealt puhka rohkem ja joo piisavalt vett või sooja teed. Kui kurk on valus, võid juua sooja jooki ja vältida väga külmi jooke. Kui sul on palavik, mõõda seda paar korda päevas ning ära tee rasket trenni. Vajadusel võta palavikualandajat ainult vastavalt juhendile. Maga piisavalt, sest keha vajab taastumiseks aega. Kui võimalik, jää päevaks või kaheks rahulikuma režiimi juurde ja ära planeeri liiga palju tegevusi. Kui sümptomid muutuvad tugevamaks, palavik püsib mitu päeva või hingamine muutub raskeks, võta ühendust arstiga. Need soovitused on üldised ja ei asenda arsti nõuannet, kui olukord teeb sulle muret.',
        questions: 'Mida soovitatakse kõigepealt teha? [rohkem puhata ja piisavalt juua|puhata ja juua]\nMida tuleks kurguvalu korral vältida? [väga külmi jooke]\nMida ei soovitata palavikuga teha? [rasket trenni|trenni]\nMiks on uni oluline? [keha vajab taastumiseks aega|taastumiseks]\nMillal tuleks arstiga ühendust võtta? [kui sümptomid muutuvad tugevamaks või palavik püsib mitu päeva|kui sümptomid halvenevad]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_033_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Anna viis nõuannet.',
        instruction: 'Õpetaja nimetab sümptomi. Anna sobiv nõuanne ja üks asi, mida ei tohiks teha.',
        questions: 'peavalu\nkurguvalu\npalavik\nköha\nväsimus',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta eri vorme:',
        tipText: 'puhka · joo · võta · ära… · võiksid…',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_033_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma tunnen ära käskiva kõneviisi vorme.\nMa oskan anda positiivse soovituse.\nMa oskan anda negatiivse soovituse sõnaga *ära*.\nMa oskan kasutada pehmemat vormi *võiksid*.\nMa annan vähemalt viis sobivat tervisenõuannet.',
        stamp: 'Nõuanne on arusaadav!',
      }, 'full'),
    },
  },

  'a2b1-034': {
    meta: {
      title: 'Tervislikud harjumused',
      subtitle: 'Räägin harjumustest ja põhjendan, mis on tervisele kasulik või kahjulik.',
      canDo: 'Ma kirjeldan vähemalt kolme harjumust ja selgitan nende mõju lihtsate põhjustega.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 12 tervisliku eluviisi sõna ja väljendit.',
        g_read: 'Õpilane leiab tekstist harjumuse, mõju ja põhjuse.',
        g_notice: 'Õpilane märkab peaks, võiks, liiga palju/vähe, piisavalt ja sest mustreid.',
        g_use: 'Õpilane sõnastab vähemalt 3 harjumuse parandamise ettepanekut koos põhjusega.',
      },
    },
    additions: {
      vocab: block('a2b1_034_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Tervislike harjumuste sõnad',
        words: 'piisavalt magama, liikuma, värskes õhus olema, vett jooma, regulaarselt sööma, liiga palju istuma, liiga vähe magama, ekraaniaeg, stress, puhkus, harjumus, tasakaal',
        columns: '3',
      }, 'full'),
      general: block('a2b1_034_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kasulik või kahjulik?',
        instruction: 'Vali kõige sobivam hinnang.',
        questions: [
          { q: 'Magad igal ööl ainult viis tundi.', options: '*liiga vähe\npiisavalt\nliiga palju' },
          { q: 'Liigud iga päev vähemalt pool tundi.', options: '*hea harjumus\nhalb harjumus\nsee ei mõjuta midagi' },
          { q: 'Miks kasutatakse sõna „sest”?', options: '*põhjuse selgitamiseks\naja ütlemiseks\nkäskimiseks' },
        ],
      }),
      notice: block('a2b1_034_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka soovituse ja põhjuse mustrit.',
        lines: 'Ma **peaksin** rohkem liikuma.\nSa **võiksid** õhtul telefoni varem ära panna.\nMa magan **liiga vähe**.\nMa joon **piisavalt** vett.\nPeaksin varem magama minema, **sest** hommikul olen väsinud.',
      }),
      controlled: block('a2b1_034_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Paranda harjumust.',
        instruction: 'Täienda laused sobiva väljendiga.',
        bank: 'peaksin, võiksin, liiga palju, liiga vähe, piisavalt, sest',
        showBank: 'yes',
        sentences: 'Ma istun päeval [liiga palju].\nMa magan tööpäevadel [liiga vähe].\nMa joon tavaliselt [piisavalt] vett.\nMa [peaksin] õhtul varem magama minema.\nMa [võiksin] pärast tööd jalutada.\nTahan rohkem liikuda, [sest] see aitab mul paremini puhata.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_034_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Milline harjumus mõjutab sind kõige rohkem?',
        instruction: 'Vali üks, mida tahaksid hinnata.',
        questions: [
          { q: 'Mis vajab sul kõige rohkem tähelepanu?', options: '*uni\nliikumine\ntoitumine\npuhkus' },
          { q: 'Kas üks väike harjumus võib midagi muuta?', options: '*jah\nei\nainult siis, kui kõik korraga muutub' },
        ],
      }),
      reading: block('a2b1_034_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe harjumuste muutmisest.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Üks väike muutus korraga',
        passage: 'Rasmus töötab suure osa päevast arvuti taga. Õhtuks on ta sageli väsinud, kuigi füüsiliselt liigub vähe. Ta märkas, et magab tööpäevadel ainult umbes kuus tundi ja vaatab enne magamaminekut kaua telefoni. Samuti joob ta päeva jooksul liiga vähe vett. Rasmus otsustas mitte muuta kõike korraga. Kõigepealt paneb ta telefoni pool tundi enne magamaminekut kõrvale. Teiseks võtab ta tööle suurema veepudeli, et oleks lihtsam piisavalt juua. Kolmandaks tahab ta pärast lõunat kümme minutit jalutada. Nädalavahetusel proovib ta vähemalt ühe pikema jalutuskäigu teha ja tööpäeva jooksul tõuseb iga tunni järel korraks püsti. Ta loodab, et need väikesed harjumused aitavad tal paremini magada ja päeva jooksul rohkem energiat tunda.',
        questions: 'Kus Rasmus suure osa päevast töötab? [arvuti taga]\nKui palju ta tööpäevadel magab? [umbes kuus tundi|6 tundi]\nMida ta teeb enne magamaminekut liiga kaua? [vaatab telefoni|kasutab telefoni]\nMida võtab ta tööle kaasa? [suurema veepudeli|veepudeli]\nKui kaua tahab ta pärast lõunat jalutada? [kümme minutit|10 minutit]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_034_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Tee ühe harjumuse parandamise plaan.',
        instruction: 'Räägi 1–2 minutit.',
        questions: 'Milline sinu harjumus on juba hea?\nMilline harjumus võiks olla parem?\nKas teed midagi liiga palju või liiga vähe?\nMida peaksid muutma?\nMiks see oleks kasulik?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'peaksin · võiksin · liiga palju/vähe · piisavalt · sest',
        minSec: 60, maxSec: 120,
      }, 'full'),
      selfcheck: block('a2b1_034_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan kirjeldada oma harjumusi.\nMa oskan öelda, mida teen liiga palju või liiga vähe.\nMa oskan öelda, mida peaksin või võiksin muuta.\nMa oskan põhjendada oma mõtet sõnaga *sest*.\nMa valin ühe realistliku järgmise sammu.',
        stamp: 'Üks samm korraga!',
      }, 'full'),
    },
  },

  'a2b1-035': {
    meta: {
      title: 'Kontroll 7 — tervis',
      subtitle: 'Näitan, et oskan sümptomeid kirjeldada, juhiseid mõista ja nõu anda.',
      canDo: 'Ma lahendan terviseteemalise suhtlusolukorra iseseisvalt ja arusaadavalt.',
      goals: {
        g_vocab: 'Õpilane kasutab tervise ja enesetunde põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab lühikese terviseteksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane rakendab sümptomite, nõuannete ja käskiva kõneviisi põhimustreid.',
        g_use: 'Õpilane saavutab kontrollitud osas vähemalt 70% ja lahendab suulise olukorra ilma teise keele abita.',
      },
    },
    additions: {
      vocab: block('a2b1_035_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri põhivara.',
        instruction: 'Paiguta sõnad õigesse rühma.',
        groups: [
          { name: 'Sümptom', words: 'palavik, köha, nohu, peavalu' },
          { name: 'Nõuanne', words: 'puhka, joo, maga, ära mine' },
          { name: 'Arsti küsimus', words: 'millal algas, kui kaua, kas teil on, kas võtate' },
        ],
      }, 'full'),
      general: block('a2b1_035_av_general', 'choice', 'sky', 'g_read', {
        title: 'Põhiidee.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis on patsiendi peamine probleem?', options: '*mitu külmetuse sümptomit korraga\ntöökoha vahetus\nliikluse probleem' },
          { q: 'Mida arst kõigepealt täpsustab?', options: '*sümptomite algust ja kestust\npatsiendi lemmiktoitu\npuhkuse kuupäeva' },
          { q: 'Milline soovitus on tekstiga kooskõlas?', options: '*puhata ja piisavalt juua\nteha rasket trenni\nmagada vähem' },
        ],
      }),
      notice: block('a2b1_035_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk mustritele.',
        lines: '**Mul valutab** pea.\n**Mul on** palavik ja köha.\n**Kui kaua** see on kestnud?\n**Puhka** ja **joo** piisavalt.\n**Ära mine** trenni, kui tunned end halvasti.',
      }),
      controlled: block('a2b1_035_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Täienda õige sõna või vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Mul [valutab] kurk.\nMul [on] tugev köha.\nSee [algas] kolm päeva tagasi.\nKui sul on palavik, [puhka] kodus.\n[Ära mine] täna trenni.\nKui sümptomid ei vähene, [helista] arstile.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_035_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma abita.',
        instruction: 'Vali, millist osa tahad enda puhul eriti kontrollida.',
        questions: [
          { q: 'Mis tundub raskem?', options: '*sümptomite kirjeldamine\narsti küsimustele vastamine\nnõu andmine' },
          { q: 'Kas suudad terviseolukorra lahendada eesti keeles?', options: '*jah\nosaliselt\nvajan veel tuge' },
        ],
      }),
      reading: block('a2b1_035_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe üks kord tervikuna ja vasta siis detailidele.',
        passageTitle: 'Telefonikõne perearstikeskusesse',
        passage: 'Kaur helistab perearstikeskusesse, sest tunneb end juba mitu päeva halvasti. Tal on köha, nohu ja kerge palavik. Õde küsib, millal sümptomid algasid. Kaur vastab, et nohu algas neli päeva tagasi ja palavik tekkis eile õhtul. Samuti ütleb ta, et pea valutab natuke, kuid hingata saab normaalselt. Õde küsib, kas Kaur on võtnud mõnda ravimit. Kaur on võtnud ainult palavikualandajat. Ta lisab, et öösel magas halvasti, sest köha segas und. Õde soovitab tal kodus puhata, piisavalt juua ja palavikku jälgida. Ta ütleb ka, et Kaur võiks paar päeva raskemat füüsilist koormust vältida. Kui palavik tõuseb kõrgemaks või enesetunne halveneb, peab Kaur uuesti ühendust võtma. Vajadusel lepivad nad kokku arsti vastuvõtuaja.',
        questions: 'Miks Kaur helistab? [tunneb end mitu päeva halvasti|tal on köha nohu ja palavik]\nMillal nohu algas? [neli päeva tagasi|4 päeva tagasi]\nMillal palavik tekkis? [eile õhtul]\nMillist ravimit ta on võtnud? [palavikualandajat]\nMillal peab ta uuesti ühendust võtma? [kui palavik tõuseb või enesetunne halveneb|kui enesetunne halveneb]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_035_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — terviseolukord.',
        instruction: 'Räägi 2–3 minutit õpetajaga. Selgita sümptomeid ja vasta täpsustavatele küsimustele.',
        questions: 'Mis sind häirib?\nMillal see algas?\nKui kaua sümptomid kestnud on?\nKas sul on palavik?\nMida oled juba teinud?\nMillist nõuannet sa mõistad ja järgiksid?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 120, maxSec: 180,
      }, 'full'),
      writing: block('a2b1_035_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — lühike tervisesõnum.',
        instruction: 'Kirjuta 8–10 lauset oma enesetundest või kujuteldavast olukorrast ning lisa vähemalt kaks soovitust.',
        lines: 9, minSent: 8, maxSent: 10,
        keywords: 'valutab, palavik, algas, puhka, joo',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_035_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan kirjeldada vähemalt kuut sümptomit.\nMa oskan vastata arsti täpsustavatele küsimustele.\nMa mõistan tüüpilisi tervisenõuandeid.\nMa oskan anda lihtsaid soovitusi.\nJärgmises moodulis tahan pikemaid vastuseid veel paremini siduda.',
        stamp: 'Terviseolukord on hallatav!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(sümptom|tervis|nõu|fraas|harjumus|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|mida|millist|kasulik)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|viimane pilk)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(kirjelda|taasta|anna|paranda|kontrollitud)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule7Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 7.`);
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

export function upgradeAvastaModule7Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 7.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule7Document(lessonId);
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

export const AVASTA_MODULE7_IDS = Object.freeze(Object.keys(SPECS));
