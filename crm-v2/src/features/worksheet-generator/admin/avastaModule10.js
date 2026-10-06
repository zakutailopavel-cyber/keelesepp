const MODULE = 'Reisimine ja transport';

const block = (id, type, tone, goal, data, width = 'half') => ({
  id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data,
});

const SPECS = {
  'a2b1-046': {
    meta: {
      title: 'Transport ja piletid',
      subtitle: 'Kasutan transpordi- ja piletisõnavara päris reisiteabes.',
      canDo: 'Ma saan aru põhilisest sõiduinfost ja küsin pileti või väljumise kohta vähemalt kolm täpsustust.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 12 transpordi ja pileti sõna.',
        g_read: 'Õpilane leiab sõiduinfost väljumise, saabumise, peatuse või perrooni ja hinna.',
        g_notice: 'Õpilane märkab mustreid väljub kell…, saabub kell…, pilet maksab…, ümber istuma.',
        g_use: 'Õpilane lahendab vähemalt 5 transpordiinfoga seotud küsimust õigesti.',
      },
    },
    additions: {
      vocab: block('a2b1_046_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Transport ja pilet',
        words: 'buss, rong, lennuk, tramm, peatus, jaam, perroon, pilet, üksikpilet, edasi-tagasi pilet, väljub, saabub, ümber istuma, hilineb, graafik, istekoht',
        columns: '4',
      }, 'full'),
      general: block('a2b1_046_av_general', 'choice', 'sky', 'g_read', {
        title: 'Leia sõidu põhiinfo.',
        instruction: 'Vali kõige sobivam vastus.',
        questions: [
          { q: 'Mida tähendab „rong väljub kell 14.20”?', options: '*rong alustab sõitu kell 14.20\nrong jõuab kohale kell 14.20\npilet maksab 14.20 eurot' },
          { q: 'Mida tähendab „saabub perroonile 3”?', options: '*rong jõuab kolmandale perroonile\npilet on kolmandas vagunis\nrong väljub kolme tunni pärast' },
          { q: 'Kui pead teise bussi peale minema, siis pead…', options: '*ümber istuma\npileti tagastama\njaamast väljuma' },
        ],
      }),
      notice: block('a2b1_046_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka sõiduinfo mustreid.',
        lines: 'Rong **väljub kell 14.20**.\nBuss **saabub kell 16.05**.\nPilet **maksab 12 eurot**.\nTartus tuleb **ümber istuda**.\nRong **hilineb 15 minutit**.',
      }),
      controlled: block('a2b1_046_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Täienda sõiduinfo.',
        instruction: 'Kasuta sobivat transpordisõna.',
        bank: 'väljub, saabub, perroon, pilet, ümber, hilineb',
        showBank: 'yes',
        sentences: 'Rong [väljub] Tallinnast kell 10.15.\nTartusse [saabub] rong kell 12.22.\nRong läheb [perroonilt] number 4.\nÜks [pilet] maksab 15 eurot.\nTapal tuleb [ümber] istuda.\nTäna rong [hilineb] kümme minutit.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_046_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Kuidas sa kõige sagedamini liigud?',
        instruction: 'Vali enda jaoks kõige tavalisem variant.',
        questions: [
          { q: 'Millist transporti kasutad sagedamini?', options: '*buss\nrong\nauto\nlennuk' },
          { q: 'Mida kontrollid enne pikemat sõitu?', options: '*väljumisaega\npileti hinda\npeatust või perrooni\nkõiki neid' },
        ],
      }),
      reading: block('a2b1_046_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe sõiduinfot.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Tallinnast Tartusse',
        passage: 'Kristi tahab laupäeval Tallinnast Tartusse sõita. Ta avab transpordirakenduse ja võrdleb kahte võimalust. Esimene rong väljub Balti jaamast kell 9.05 ja saabub Tartusse kell 11.18. Pilet maksab 18 eurot ning istekoha saab valida juba ostmise ajal. Teine rong väljub kell 10.12, kuid Tapal tuleb ümber istuda. Selle sõidu pilet on veidi odavam, 15 eurot, kuid kogu reis kestab peaaegu kolm tundi. Kristi valib esimese rongi, sest tahab varem Tartusse jõuda. Sõidupäeva hommikul kontrollib ta rakendusest veel kord perrooni ja väljumisaega. Rakendus näitab, et rong väljub perroonilt 6 ning praegu hilinemist ei ole. Kristi ostab pileti telefoni ja salvestab selle enne jaama minekut.',
        questions: 'Mis kell väljub esimene rong? [kell 9.05|9.05|09.05|9:05]\nKui palju maksab esimese rongi pilet? [18 eurot|18 €|18]\nKus tuleb teise rongiga ümber istuda? [Tapal|Tapa]\nMiks valib Kristi esimese rongi? [tahab varem Tartusse jõuda|esimene rong on kiirem]\nMilliselt perroonilt rong väljub? [perroonilt 6|6. perroonilt|6]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_046_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Osta pilet ja küsi infot.',
        instruction: 'Räägi 2 minutit. Õpetaja on kassapidaja või infolaua töötaja.',
        questions: 'Ütle sihtkoht.\nKüsi järgmist väljumisaega.\nKüsi hinda.\nKüsi, kas peab ümber istuma.\nKüsi perrooni või peatuse kohta.\nKinnita, millise pileti valid.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasulikud küsimused:',
        tipText: 'Mis kell väljub…? · Kui palju pilet maksab? · Kas pean ümber istuma? · Milliselt perroonilt?',
        minSec: 90, maxSec: 150,
      }, 'full'),
      selfcheck: block('a2b1_046_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma saan aru väljumis- ja saabumisajast.\nMa oskan küsida pileti hinda.\nMa saan aru, kas peab ümber istuma.\nMa oskan küsida perrooni või peatuse kohta.\nJärgmises tunnis tahan terve reisi ise planeerida.',
        stamp: 'Sõiduinfo on selge!',
      }, 'full'),
    },
  },

  'a2b1-047': {
    meta: {
      title: 'Reisi planeerimine',
      subtitle: 'Koostan reisi plaani ja põhjendan vähemalt kahte valikut.',
      canDo: 'Ma kirjeldan reisi 2–3 minutit, järjestan etapid ja põhjendan vähemalt kahte otsust.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 reisi planeerimise väljendit.',
        g_read: 'Õpilane leiab plaanist marsruudi, aja, eelarve ja valikute põhjused.',
        g_notice: 'Õpilane märkab kõigepealt, siis, pärast seda, sest ja sellepärast kasutust.',
        g_use: 'Õpilane koostab vähemalt 6-etapilise reisiplaani.',
      },
    },
    additions: {
      vocab: block('a2b1_047_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Reisi planeerimise sõnad',
        words: 'marsruut, sihtkoht, väljumine, saabumine, majutus, broneering, eelarve, pilet, kõigepealt, siis, pärast seda, lõpuks, sest, odavam, kiirem, mugavam',
        columns: '4',
      }, 'full'),
      general: block('a2b1_047_av_general', 'choice', 'sky', 'g_read', {
        title: 'Miks üks variant on parem?',
        instruction: 'Vali kõige sisulisem põhjendus.',
        questions: [
          { q: 'Miks valida rong bussi asemel?', options: '*Rong on kallim, aga jõuab tund varem kohale.\nRong on rong.\nSest jah.' },
          { q: 'Miks valida odavam hotell?', options: '*Et eelarves jääks rohkem raha tegevusteks.\nHotell on maja.\nSest odav.' },
          { q: 'Mida teeb hea reisiplaan?', options: '*seob marsruudi, aja ja põhjused\nloetleb ainult kohanimed\nannab ainult ühe kellaaja' },
        ],
      }),
      notice: block('a2b1_047_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka plaani ja põhjuse seost.',
        lines: '**Kõigepealt** sõidan bussiga jaama.\n**Siis** lähen rongiga Tartusse.\nValin hommikuse rongi, **sest** tahan varem kohale jõuda.\nHotell on kesklinnas, **sellepärast** ei pea õhtul taksot võtma.',
      }),
      controlled: block('a2b1_047_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Ehita reisiplaan.',
        instruction: 'Täienda plaan sobiva siduva väljendiga.',
        bank: 'kõigepealt, siis, pärast seda, sest, sellepärast, lõpuks',
        showBank: 'yes',
        sentences: '[Kõigepealt] kontrollin sõiduajad.\n[Siis] ostan pileti.\nValin varasema väljumise, [sest] tahan lõunaks kohal olla.\n[Pärast seda] broneerin majutuse.\nHotell on jaama lähedal ja [sellepärast] saan sinna jalgsi minna.\n[Lõpuks] kontrollin kogu plaani veel kord üle.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_047_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis on sinu jaoks reisil tähtsam?',
        instruction: 'Vali üks prioriteet.',
        questions: [
          { q: 'Mis mõjutab sinu valikut rohkem?', options: '*hind\naeg\nmugavus\notsene ühendus' },
          { q: 'Mida broneerid tavaliselt esimesena?', options: '*transpordi\nmajutuse\ntegevuse\noleneb reisist' },
        ],
      }),
      reading: block('a2b1_047_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe reisi plaani.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Kahepäevane reis Riiga',
        passage: 'Mihkel ja Laura tahavad novembris kaheks päevaks Riiga minna. Kõigepealt võrdlevad nad bussi ja lennukit. Lennuk on kiirem, kuid koos lennujaama sõidu ja kontrolliga ei säästa nad eriti palju aega. Buss on odavam ning väljub Tallinna kesklinnast, sellepärast valivad nad bussi. Nad ostavad edasi-tagasi piletid reede õhtuks ja pühapäeva pärastlõunaks. Seejärel otsivad nad majutust. Nad valivad väikese hotelli vanalinna lähedal, sest sealt saab paljudesse kohtadesse jalgsi minna. Laupäeval plaanivad nad kõigepealt vanalinnas jalutada, pärast seda turgu külastada ja õhtul restoranis süüa. Pühapäeval jätavad nad paar tundi vabaks, et plaan ei oleks liiga tihe. Enne reisi kontrollivad nad veel ilma ja busside täpsed väljumisajad.',
        questions: 'Miks nad ei vali lennukit? [see ei säästa eriti palju aega|lennuk ei säästa palju aega]\nMiks valivad nad bussi? [see on odavam ja väljub kesklinnast|buss on odavam ja väljub kesklinnast]\nKus asub hotell? [vanalinna lähedal]\nMida teevad nad laupäeval pärast jalutamist? [külastavad turgu|lähevad turule]\nMiks jätavad nad pühapäeval vaba aega? [et plaan ei oleks liiga tihe]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_047_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Planeeri 2-päevane reis.',
        instruction: 'Räägi 2–3 minutit. Põhjenda vähemalt kahte otsust.',
        questions: 'Kuhu lähed?\nMillise transpordi valid ja miks?\nMis kell või millal väljud?\nKus ööbid?\nMida teed esimesel päeval?\nMida teed teisel päeval?\nKui suur on ligikaudne eelarve?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta:',
        tipText: 'kõigepealt · siis · pärast seda · lõpuks · sest · sellepärast',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_047_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan reisi etapid järjekorda panna.\nMa oskan rääkida transpordist ja majutusest.\nMa oskan nimetada eelarvet või hinda.\nMa põhjendan vähemalt kahte valikut.\nJärgmises tunnis tahan minevikus reisist jutustada.',
        stamp: 'Reisiplaan on valmis!',
      }, 'full'),
    },
  },

  'a2b1-048': {
    meta: {
      title: 'Minevik reisil',
      subtitle: 'Jutustan toimunud reisist lihtminevikus ja hoian sündmused loogilises järjekorras.',
      canDo: 'Ma jutustan reisist 2–3 minutit ja kasutan vähemalt 8 korrektset lihtmineviku vormi.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 reisimise tegevusverbi minevikus.',
        g_read: 'Õpilane leiab reisiloost sündmuste järjekorra ja olulised detailid.',
        g_notice: 'Õpilane märkab sagedasi liikumisverbide ja erandverbide lihtmineviku vorme.',
        g_use: 'Õpilane kasutab vähemalt 8 õiget minevikuvormi 10-st.',
      },
    },
    additions: {
      vocab: block('a2b1_048_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Reis minevikus',
        words: 'läksin, tulin, sõitsin, jõudsin, väljus, saabus, ostsin, nägin, leidsin, kaotasin, ootasin, broneerisin, külastasin, jalutasin',
        columns: '3',
      }, 'full'),
      general: block('a2b1_048_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kas sündmus on minevikus?',
        instruction: 'Vali õige vorm.',
        questions: [
          { q: 'Eile ma … rongiga Tartusse.', options: '*sõitsin\nsõidan\nsõitma' },
          { q: 'Rong … jaama kell kümme.', options: '*saabus\nsaabub\nsaabuma' },
          { q: 'Me … vanalinnas palju huvitavaid kohti.', options: '*nägime\nnäeme\nnägema' },
        ],
      }),
      notice: block('a2b1_048_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka sagedasi minevikuvorme reisiloos.',
        lines: 'minema → **läksin**\ntulema → **tulin**\nsõitma → **sõitsin**\njõudma → **jõudsin**\nnägema → **nägin**\nostma → **ostsin**',
      }),
      controlled: block('a2b1_048_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Pane reis minevikku.',
        instruction: 'Kirjuta sulgudes olev verb lihtminevikus.',
        bank: '',
        showBank: 'no',
        sentences: 'Reedel [sõitsin] (sõitma) bussiga Riiga.\nJaama [jõudsin] (jõudma) veidi varem.\nMa [ostsin] (ostma) enne sõitu kohvi.\nBuss [väljus] (väljuma) õigel ajal.\nRiias [nägin] (nägema) mitut uut kohta.\nPühapäeval [tulin] (tulema) tagasi Tallinna.',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_048_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mõtle viimasele reisile.',
        instruction: 'Vali üks reis, millest võiksid jutustada.',
        questions: [
          { q: 'Millest räägiksid lihtsamalt?', options: '*viimasest linnareisist\nviimasest puhkusest\nühest bussisõidust\nkujuteldavast reisist' },
          { q: 'Mis aitab loo järjestada?', options: '*kõigepealt, siis, pärast seda\nainult kohanimed\nainult hinnad' },
        ],
      }),
      reading: block('a2b1_048_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe reisilugu.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Nädalavahetus Helsingis',
        passage: 'Eelmisel kuul sõitsid Mari ja tema sõber Helsingisse. Laupäeva hommikul jõudsid nad sadamasse varakult ja ostsid enne laevale minekut kohvi. Laev väljus õigel ajal ning Helsingisse saabusid nad enne keskpäeva. Kõigepealt läksid nad hotelli ja jätsid kotid sinna. Seejärel jalutasid nad kesklinnas ning külastasid üht muuseumi. Pärast seda sõid nad väikeses restoranis lõunat ja proovisid kohalikku kala. Õhtul läksid nad mere äärde jalutama, kuid ilm muutus külmaks ja nad tulid varem hotelli tagasi. Pühapäeval ostsid nad turult mõned kingitused ja jõid enne sadamasse minekut kohvi. Tagasisõidul oli meri rahulik ja nad puhkasid suure osa teest. Mari ütles, et lühike reis oli väsitav, kuid väga meeldiv.',
        questions: 'Kuhu Mari ja sõber sõitsid? [Helsingisse]\nMillal nad Helsingisse saabusid? [enne keskpäeva]\nMida tegid nad kõigepealt linnas? [läksid hotelli ja jätsid kotid sinna|läksid hotelli]\nMiks tulid nad õhtul varem hotelli tagasi? [ilm muutus külmaks|külma ilma tõttu]\nMida ostsid nad pühapäeval? [kingitusi|mõned kingitused]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_048_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Jutusta oma reisist.',
        instruction: 'Räägi 2–3 minutit. Kasuta vähemalt 8 lihtmineviku vormi.',
        questions: 'Kuhu läksid?\nKuidas sinna sõitsid?\nMillal jõudsid kohale?\nMida tegid kõigepealt?\nMida nägid või külastasid?\nKas midagi muutus plaanis?\nKuidas reis lõppes?',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta minevikku:',
        tipText: 'läksin · sõitsin · jõudsin · ostsin · nägin · tulin',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_048_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma hoian kogu loo minevikus.\nMa kasutan vähemalt 8 õiget minevikuvormi.\nMa seon sündmusi ajamarkeritega.\nMa oskan rääkida, mis reisil muutus.\nJärgmises tunnis tahan ootamatu probleemi lahendada.',
        stamp: 'Reisilugu on tervik!',
      }, 'full'),
    },
  },

  'a2b1-049': {
    meta: {
      title: 'Ootamatu olukord reisil',
      subtitle: 'Kirjeldan probleemi, küsin täpsustust ja leian alternatiivi.',
      canDo: 'Ma lahendan vähemalt kolm ootamatut reisisituatsiooni ilma teise keele abita.',
      goals: {
        g_vocab: 'Õpilane kasutab vähemalt 10 reisimise probleemi ja abi küsimise väljendit.',
        g_read: 'Õpilane leiab olukorrast probleemi, põhjuse ja võimaliku lahenduse.',
        g_notice: 'Õpilane märkab probleemi → täpsustav küsimus → alternatiiv → kokkulepe struktuuri.',
        g_use: 'Õpilane lahendab vähemalt 3 reisisituatsiooni nelja sammu abil.',
      },
    },
    additions: {
      vocab: block('a2b1_049_av_vocab', 'vocab', 'cream', 'g_vocab', {
        title: 'Probleem reisil',
        words: 'rong jäi hiljaks, buss jäi ära, pilet kadus, vale perroon, broneering puudub, ühendus jäi maha, Mis ma nüüd teen?, Kas on teine võimalus?, Millal järgmine väljub?, Kust ma abi saan?, Kas pilet kehtib?',
        columns: '2',
      }, 'full'),
      general: block('a2b1_049_av_general', 'choice', 'sky', 'g_read', {
        title: 'Mis on järgmine samm?',
        instruction: 'Vali kõige kasulikum vastus.',
        questions: [
          { q: 'Rong hilineb ja järgmine ühendus võib maha jääda.', options: '*küsin, kas on teine ühendus\nootan ilma infot küsimata\nostan kohe uue passi' },
          { q: 'Oled valel perroonil.', options: '*küsin, millisest perroonist rong tegelikult väljub\nlähen koju\nkustutan pileti' },
          { q: 'Mida peab hea lahendus sisaldama?', options: '*probleem + küsimus + alternatiiv\nainult kaebus\nainult „ei tea”' },
        ],
      }),
      notice: block('a2b1_049_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Märka nelja sammu.',
        lines: '1. **Probleem:** Minu rong jäi hiljaks.\n2. **Küsimus:** Millal järgmine rong väljub?\n3. **Alternatiiv:** Kas ma saan minna bussiga?\n4. **Kokkulepe:** Sobib, võtan järgmise bussi.',
      }),
      controlled: block('a2b1_049_av_controlled', 'dialogue', 'green', 'g_use', {
        title: 'Taasta abidialoog.',
        instruction: 'Täida reisija puuduvad repliigid.',
        speakerA: 'Reisija',
        speakerB: 'Infotöötaja',
        lines: [
          { who: 'A', text: 'Vabandust, minu [rong jäi hiljaks].' },
          { who: 'A', text: '[Millal järgmine rong väljub]?' },
          { who: 'B', text: 'Järgmine läheb kell 16.20.' },
          { who: 'A', text: '[Kas mu pilet kehtib] ka sellele rongile?' },
          { who: 'B', text: 'Jah, kehtib.' },
          { who: 'A', text: 'Selge, siis [võtan järgmise rongi].' },
        ],
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_049_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Mis võiks reisil valesti minna?',
        instruction: 'Vali olukord, mida oleks kõige raskem lahendada.',
        questions: [
          { q: 'Milline probleem tundub kõige keerulisem?', options: '*rong hilineb\npilet kaob\nvale perroon\nbroneering puudub' },
          { q: 'Mis aitab kõige rohkem?', options: '*täpne küsimus\nrahulik suhtlus\nalternatiivi otsimine\nkõik kolm' },
        ],
      }),
      reading: block('a2b1_049_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe ootamatut olukorda.',
        instruction: 'Loe ja vasta detailiküsimustele.',
        passageTitle: 'Ühendus jäi maha',
        passage: 'Sander sõidab Pärnust Tartusse ja peab Viljandis teise bussi peale ümber istuma. Esimene buss jääb teeolude tõttu kakskümmend minutit hiljaks. Kui Sander Viljandisse jõuab, on Tartu buss juba lahkunud. Ta läheb infoleti juurde ja selgitab olukorda. Töötaja kontrollib graafikut ning ütleb, et järgmine buss väljub tunni pärast. Sander küsib, kas tema olemasolev pilet kehtib ka järgmisele bussile. Selgub, et pilet tuleb ümber vormistada, kuid lisatasu maksma ei pea. Sander küsib veel, millisest peatusest järgmine buss väljub. Töötaja annab uue pileti ja näitab peatuse numbri. Sander jõuab Tartusse plaanitust hiljem, kuid tal ei ole vaja uut piletit osta. Ta saadab sõbrale sõnumi ja teatab uue saabumisaja.',
        questions: 'Kus pidi Sander ümber istuma? [Viljandis]\nMiks esimene buss hilines? [teeolude tõttu|teeolude pärast]\nKui kaua peab ta järgmist bussi ootama? [tunni|üks tund|1 tund]\nKas ta peab lisatasu maksma? [ei]\nMida infoleti töötaja talle annab? [uue pileti ja peatuse numbri|uue pileti]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_049_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Lahenda kolm reisisituatsiooni.',
        instruction: 'Räägi 2–3 minutit. Igas olukorras: kirjelda probleem, küsi täpsustust ja lepi lahendus kokku.',
        questions: 'Rong hilineb 30 minutit.\nSinu piletit ei leia.\nHotellis ei ole sinu broneeringut näha.\nLisa õpetaja antud ootamatu uus tingimus.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: 'Kasuta struktuuri:',
        tipText: 'probleem → täpsustav küsimus → alternatiiv → kokkulepe',
        minSec: 120, maxSec: 180,
      }, 'full'),
      selfcheck: block('a2b1_049_av_self', 'selfcheck', 'sky', '', {
        title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma oskan probleemi ühe-kahe lausega selgitada.\nMa küsin vähemalt ühe täpsustava küsimuse.\nMa oskan alternatiivi küsida või pakkuda.\nMa saan dialoogi lahendusega lõpetada.\nJärgmises tunnis tahan neid oskusi iseseisvalt kontrollida.',
        stamp: 'Ootamatu olukord on lahendatav!',
      }, 'full'),
    },
  },

  'a2b1-050': {
    meta: {
      title: 'Kontroll 10 — reisimine',
      subtitle: 'Näitan, et saan sõiduinfost aru, planeerin reisi ja lahendan probleemi teel.',
      canDo: 'Ma lahendan transpordi-, mineviku- ja reisisituatsiooni vähemalt 70% tasemel.',
      goals: {
        g_vocab: 'Õpilane kasutab transpordi ja reisimise põhivara ilma ulatusliku toeta.',
        g_read: 'Õpilane mõistab sõidu- või reisiteksti põhiideed ja olulisi detaile.',
        g_notice: 'Õpilane rakendab minevikuvorme ja reisi järjestavaid ajamarkereid.',
        g_use: 'Õpilane lahendab suulise reisisituatsiooni probleemist kokkuleppeni.',
      },
    },
    additions: {
      vocab: block('a2b1_050_av_vocab', 'categorize', 'peach', 'g_vocab', {
        title: 'Aktiveeri reisisõnavara.',
        instruction: 'Paiguta väljendid õigesse rühma.',
        groups: [
          { name: 'Sõiduinfo', words: 'väljub, saabub, perroon, ümber istuma' },
          { name: 'Minevik', words: 'sõitsin, jõudsin, nägin, ostsin' },
          { name: 'Probleem', words: 'hilineb, pilet kadus, vale perroon, broneering puudub' },
          { name: 'Lahendus', words: 'millal järgmine, kas pilet kehtib, teine võimalus, lepime kokku' },
        ],
      }, 'full'),
      general: block('a2b1_050_av_general', 'choice', 'sky', 'g_read', {
        title: 'Kontrolli põhiinfot.',
        instruction: 'Vali vastus ainult teksti põhjal.',
        questions: [
          { q: 'Mis on reisi peamine probleem?', options: '*ühendus muutub hilinemise tõttu\nreisija ei tea sihtkohta\npilet on liiga odav' },
          { q: 'Mida reisija peab tegema?', options: '*leidma alternatiivse ühenduse\nminema tagasi koju\nostma alati uue pileti' },
          { q: 'Milline oskus aitab olukorra lahendada?', options: '*täpsustava küsimuse esitamine\nainult ootamine\nvaikimine' },
        ],
      }),
      notice: block('a2b1_050_av_notice', 'notice', 'white', 'g_notice', {
        title: 'Viimane pilk võtmemustritele.',
        lines: 'Rong **väljub** kell 10.20 ja **saabub** kell 12.30.\nEile **sõitsin**, **jõudsin**, **nägin** ja **ostsin**.\nMinu rong jäi hiljaks. **Millal järgmine väljub?**\n**Kas mu pilet kehtib** ka järgmisele rongile?',
      }),
      controlled: block('a2b1_050_av_controlled', 'gaps', 'blue', 'g_use', {
        title: 'Kontrollitud osa ilma sõnapangata.',
        instruction: 'Täienda õige sõna või vormiga.',
        bank: '',
        showBank: 'no',
        sentences: 'Rong [väljub] kell 9.10.\nEile [sõitsin] (sõitma) Tartusse.\nJaama [jõudsin] (jõudma) õigel ajal.\nMinu buss [hilineb] 20 minutit.\nKas ma pean [ümber] istuma?\nMillal järgmine rong [väljub]?',
      }, 'full'),
    },
    seed: {
      intro: block('a2b1_050_av_intro', 'choice', 'peach', 'g_vocab', {
        title: 'Alusta ilma abita.',
        instruction: 'Vali, mida tahad enda puhul kontrollida.',
        questions: [
          { q: 'Mis osa on tugevam?', options: '*sõiduinfo\nreisi planeerimine\nminevikulugu\nprobleemi lahendamine' },
          { q: 'Mis vajab veel tuge?', options: '*sõnavara\ngrammatika\nküsimuste esitamine\nspontaanne dialoog' },
        ],
      }),
      reading: block('a2b1_050_av_reading', 'reading', 'cream', 'g_read', {
        title: 'Loe iseseisvalt.',
        instruction: 'Loe tekst läbi ja vasta detailidele.',
        passageTitle: 'Plaanimuutus teel Tartusse',
        passage: 'Karin plaanis laupäeval Tallinnast Tartusse sõita. Ta ostis pileti rongile, mis pidi väljuma kell 9.12 ja saabuma Tartusse enne keskpäeva. Jaama jõudes nägi Karin tabloolt, et rong hilineb tehnilise probleemi tõttu 45 minutit. Tal oli Tartus kell üks kohtumine ja ta kartis hiljaks jääda. Karin läks infoleti juurde ning küsis, kas on mõni kiirem alternatiiv. Töötaja leidis bussi, mis väljus lähedalasuvast bussijaamast kahekümne minuti pärast. Karin küsis, kas rongipileti saab tagastada. Töötaja selgitas, et saab küll ning näitas, kuidas seda rakenduses teha. Karin otsustas minna bussiga, sest nii jõudis ta Tartusse ainult kümme minutit plaanitust hiljem. Ta kirjutas kohtumise teisele osapoolele ja teatas uuest saabumisajast.',
        questions: 'Mis kell pidi rong väljuma? [kell 9.12|9.12|09.12|9:12]\nKui palju rong hilines? [45 minutit|45 min]\nMiks oli Karinil kiire? [tal oli kell üks kohtumine|kohtumine oli kell üks]\nMillise alternatiivi töötaja leidis? [bussi|bussi bussijaamast]\nKui palju plaanitust hiljem jõudis Karin Tartusse? [kümme minutit|10 minutit]',
        lineWidth: 'wide',
      }, 'full'),
      productive: block('a2b1_050_av_speaking', 'speaking', 'green', 'g_use', {
        title: 'Rääkimine — reisisituatsioon.',
        instruction: 'Räägi 3 minutit. Õpetaja annab marsruudi ja ootamatu probleemi.',
        questions: 'Selgita oma algset plaani.\nKirjelda probleemi.\nKüsi vähemalt kaks täpsustavat küsimust.\nPaku või vali alternatiiv.\nSelgita, miks see variant sobib.\nKinnita uus kokkulepe.',
        img: null, aspect: '4:3', bubble: '',
        tipTitle: '',
        tipText: '',
        minSec: 150, maxSec: 210,
      }, 'full'),
      writing: block('a2b1_050_av_writing', 'writing', 'cream', 'g_use', {
        title: 'Kirjutamine — 100 sõna.',
        instruction: 'Kirjuta sõnum reisiplaanist, mis muutus. Kirjelda algset plaani, probleemi, uut lahendust ja saabumisaega.',
        lines: 10, minSent: 8, maxSent: 12,
        keywords: 'väljus, hilines, seetõttu, järgmine, jõuan',
        minKeywords: 3,
        img: null,
      }, 'full'),
      selfcheck: block('a2b1_050_av_self', 'selfcheck', 'sky', '', {
        title: 'Väljumispilet.', titleMore: 'Kas ma oskan?', instruction: '',
        items: 'Ma saan sõiduinfost aru.\nMa oskan reisi järjestatud plaanina kirjeldada.\nMa kasutan lihtminevikku reisiloos.\nMa oskan ootamatus olukorras küsimusi esitada ja alternatiivi leida.\nJärgmises moodulis tahan valikuid veel täpsemalt võrrelda.',
        stamp: 'Reisimoodul on kontrollitud!',
      }, 'full'),
    },
  },
};

const cleanText = (value) => String(value || '').toLocaleLowerCase('et-EE');
const hasCategory = (blocks, category) => blocks.some((entry) => {
  const title = cleanText(entry?.data?.title || entry?.data?.heading);
  if (category === 'vocab') return ['vocab', 'categorize'].includes(entry?.type) && /(transport|reis|probleem|aktiveeri)/.test(title);
  if (category === 'general') return ['choice', 'truefalse'].includes(entry?.type) && /(põhi|miks|minevik|järgmine|info)/.test(title);
  if (category === 'notice') return entry?.type === 'notice' || /(märka|viimane pilk)/.test(title);
  if (category === 'controlled') return ['gaps', 'dialogue', 'wordorder', 'wordforms', 'errorfix', 'categorize'].includes(entry?.type) && /(täienda|ehita|pane|taasta|kontrollitud)/.test(title);
  return false;
});
const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export function createAvastaModule10Document(lessonId) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 10.`);
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

export function upgradeAvastaModule10Document(lessonId, document) {
  const spec = SPECS[lessonId];
  if (!spec) throw new Error(`Tund ${lessonId} ei kuulu moodulisse 10.`);
  if (!document?.blocks?.length) {
    const created = createAvastaModule10Document(lessonId);
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

export const AVASTA_MODULE10_IDS = Object.freeze(Object.keys(SPECS));
