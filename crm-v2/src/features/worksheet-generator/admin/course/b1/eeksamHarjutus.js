// B1 course (A2 → B1): three short practice sheets of the e-exam task types (owner 2026-11-18: learners meet each type
// before the mock „B1 proovieksam (e-eksami vormis)”, eeksam.js). Each is a supplement placed in courseModules.b1.js
// right after the module where the blueprint's exam station of that part sits (docs/A2B1_COURSE_BLUEPRINT.md §8.3):
//   a2b1-ee-p-l  after module 7 (health and sport): listening — speakers ↔ statements, interview true / false, gaps
//   a2b1-ee-p-r  after module 11 (online shopping): reading and structure — chat replies from a list, dropdown cloze,
//                the word's right form from its base form
//   a2b1-ee-p-w  after module 12 (environment): writing — reply to a letter with notes (~100 words) and a summary of a
//                chart (~160 words)
// The modules themselves are not rebuilt. Every auto-checked item has its „why” (EXPLAIN below); the learner sees it after
// hand-in. Interactions the engine lacks are listed in docs/EXAM_9KL_E_EKSAM.md §4.
// Listening: recorded with Neurokõne (tools/listening-audio/build.mjs, listeningAudio.json); after a transcript edit run it again.
import { B } from '../blocks.js';
import { rubric9 } from './eeksam.js';

const sheet = (label, subtitle) => ({ discover: { label, slot: 1, subtitle } });
const LETTERS = 'ABCDEFGHIJ';
// speakers ↔ statements: a 3-option exam listening whose options are all the statements in their order (eeksam.js)
function speakerMatch(id, title, instruction, transcript, statements, rows) {
  const block = B.examListen(id, title, instruction, 'choice', transcript, rows.map(([q]) => [q, 'A', 'B', 'C']), 'g_listen');
  const options = (answer) => statements.map((s, i) => `${LETTERS[i] === answer ? '*' : ''}${LETTERS[i]} — ${s}`).join('\n');
  return { ...block, opts: { keepOrder: true }, data: { ...block.data, questions: rows.map(([q, answer]) => ({ q, options: options(answer) })) } };
}

// ---------------------------------------------------------------- listening, after module 7
const LISTEN = {
  MODULE: { id: 'a2b1-eeharjutus-07', course: 'b1', title: 'E-eksami harjutus: kuulamine', level: 'B1', supplement: true },
  LESSONS: {
    'a2b1-ee-p-l': {
      title: 'E-eksami ülesandetüübid: kuulamine',
      canDo: 'Ma tunnen e-eksami kolme kuulamisülesannet: sobitan kõneleja ja väite, otsustan, kas väide on õige või vale, ja kirjutan kuuldud sõna või arvu lünka.',
      shortSheet: true,
      goals: { g_listen: 'Õpilane saab aru, mida eri inimesed liikumisest räägivad, leiab intervjuust õiged ja valed väited ning kirjutab teatest arvud ja sõnad.', g_use: 'Õpilane räägib oma liikumisharjumustest ja põhjendab, mida tahaks muuta.' },
      phases: sheet('E-eksami harjutus · Kuulamine', 'Kolm e-eksami kuulamisülesannet enne proovieksamit; iga teksti kuuled kaks korda.'),
      discover: [
        B.text('eep_l_intro', 'E-eksami kuulamine: kolm ülesandetüüpi', 'E-eksami kuulamisosas on viis ülesannet. Siin proovid kolme: kõneleja ja väite sobitamine, õige või vale ning lünga täitmine kuuldu põhjal. Iga teksti kuuled kaks korda. Enne kuulamist loe küsimused läbi. Pärast esitamist näed vigu ja selgitusi.'),
        speakerMatch('eep_l_1', '1. Kuula, kuidas inimesed liiguvad.', 'Kuula viit inimest. Vali igale kõnelejale sobiv väide (A–G). Kaks väidet jääb üle. Kuuled kaks korda.', [
          'Esimene kõneleja.',
          'Piret: Kaks aastat tagasi ütles perearst, et mu vererõhk on liiga kõrge ja et ma peaksin rohkem liikuma. Alguses oli raske, aga nüüd käin kolm korda nädalas ujumas ja tunnen end palju paremini.',
          'Teine kõneleja.',
          'Andres: Mul ei ole aega jõusaali minna, sest lapsed on väikesed. Kui nad on magama jäänud, panen arvutis treeningvideo käima ja teen pool tundi harjutusi elutoa põrandal.',
          'Kolmas kõneleja.',
          'Kati: Meie koer Muri vajab palju liikumist. Hommikul ja õhtul kõnnime metsas vähemalt tund aega. Kui mul koera ei oleks, istuksin ma õhtuti ilmselt diivanil.',
          'Neljas kõneleja.',
          'Oskar: Mängin korvpalli juba kümme aastat ja meie võistkond on sel hooajal meistrivõistlustel kolmandal kohal. Trenn on viis korda nädalas, nii et vaba aega jääb vähe.',
          'Viies kõneleja.',
          'Laura: Üksi jooksma minnes leidsin alati mõne vabanduse. Siis leppisime sõbrannaga kokku, et jookseme koos igal teisipäeval ja neljapäeval. Kui üks tahab koju jääda, siis teine ei luba.',
        ], ['Ta sõidab tööle või kooli rattaga.', 'Ta hakkas liikuma arsti soovitusel.', 'Ta treenib koos sõbraga, et mitte loobuda.', 'Ta tegeleb võistlusspordiga.', 'Ta liigub peamiselt koeraga jalutades.', 'Talle ei meeldi üldse sportida.', 'Ta treenib kodus videote järgi.'], [
          ['Milline väide sobib esimese kõnelejaga, kelle nimi on Piret?', 'B'],
          ['Milline väide sobib teise kõnelejaga, kelle nimi on Andres?', 'G'],
          ['Milline väide sobib kolmanda kõnelejaga, kelle nimi on Kati?', 'E'],
          ['Milline väide sobib neljanda kõnelejaga, kelle nimi on Oskar?', 'D'],
          ['Milline väide sobib viienda kõnelejaga, kelle nimi on Laura?', 'C'],
        ]),
        B.examListen('eep_l_2', '2. Kuula intervjuud: õige või vale?', 'Kuula raadiointervjuud treeneriga. Otsusta, kas väide on õige või vale. Kuuled kaks korda.', 'truefalse', [
          'Saatejuht: Täna räägime treener Kristiinaga sellest, kui palju peaks inimene liikuma. Kristiina, kas on olemas mingi kindel reegel?',
          'Kristiina: Maailma Terviseorganisatsioon soovitab täiskasvanutele vähemalt sada viiskümmend minutit mõõdukat liikumist nädalas. See on näiteks pool tundi kiiret kõndi viiel päeval nädalas. Lastele ja noortele on soovitus suurem: keskmiselt vähemalt tund liikumist iga päev.',
          'Saatejuht: Tund päevas tundub noorte jaoks palju.',
          'Kristiina: Tegelikult mitte. Sinna hulka läheb ka jalgsi kooli minek, vahetunnis mängimine ja õhtune trenn. Tähtis on, et süda hakkaks kiiremini lööma.',
          'Saatejuht: Mis siis, kui inimene istub terve päeva arvuti taga?',
          'Kristiina: Siis soovitan iga tunni järel paar minutit püsti tõusta ja ringi käia. Pikk istumine on tervisele kahjulik ka siis, kui inimene õhtul trennis käib.',
          'Saatejuht: Kas jõusaal on parim koht alustamiseks?',
          'Kristiina: Ei pea olema. Kõige parem trenn on see, mis sulle meeldib. Kui sa jõusaali vihkad, ei käi sa seal kaua. Mõnele sobib tants, teisele matkamine.',
        ], [
          ['Maailma Terviseorganisatsioon soovitab täiskasvanutele vähemalt 150 minutit liikumist nädalas.', true],
          ['Noortele soovitatakse vähem liikumist kui täiskasvanutele.', false],
          ['Jalgsi kooli minekut ei loeta liikumise hulka.', false],
          ['Kristiina soovitab arvuti taga töötades iga tunni järel püsti tõusta.', true],
          ['Kristiina arvates peaks iga algaja kõigepealt jõusaali minema.', false],
        ], 'g_listen'),
        B.listening('eep_l_3', '3. Kuula teadet ja täida lüngad.', 'Kuula teadet heategevusjooksust ja kirjuta lünka sõna või arv. Kuuled kaks korda.', [
          'Tähelepanu! Laupäeval, kahekümnendal mail toimub Kase pargis heategevusjooks. Start antakse kell üksteist pargi peavärava juures. Valida saab kahe distantsi vahel: lapsed jooksevad ühe kilomeetri ja täiskasvanud viis kilomeetrit.',
          'Osalustasu on kümme eurot ja kogu raha läheb lastehaigla toetuseks. Registreeruda saab kuni neljapäeva õhtuni jooksu kodulehel. Igale lõpetajale anname medali ja sooja teed.',
          'Parkimiskohti on vähe, seepärast palume tulla jalgsi, rattaga või bussiga.',
        ], [
          'Heategevusjooks toimub laupäeval, [kahekümnendal|20.] mail.',
          'Jooksu start antakse kell [üksteist|11] pargi peavärava juures.',
          'Täiskasvanud jooksevad pargis [viis|5] kilomeetrit.',
          'Jooksu osalustasu on [kümme|10] eurot.',
          'Kogu raha läheb [lastehaigla] toetuseks.',
          'Jooksule saab registreeruda kuni [neljapäeva] õhtuni.',
        ], 'g_listen'),
        B.speaking('eep_l_talk', 'Räägi: kuidas sina liigud?', 'Räägi 1–2 minutit. Kellega viiest kõnelejast oled sa kõige sarnasem? Kas sa liigud piisavalt ja mida tahaksid muuta?', ['Kellega kõnelejatest oled sa kõige sarnasem ja miks?', 'Kui palju sa nädalas liigud?', 'Mida sa tahaksid oma liikumisharjumustes muuta?'], [90, 150]),
        B.rubric('eep_l_after', 'Pärast kuulamist: mis aitas?', 'Märgi, mida sa tegid.', ['Lugesin enne kuulamist küsimused ja väited läbi.', 'Esimesel kuulamisel märkisin vastuse, teisel kontrollisin.', 'Kirjutasin arvud kohe üles.']),
        B.selfcheck('eep_l_self', ['Leian, milline väide sobib kõnelejaga.', 'Otsustan intervjuu põhjal, kas väide on õige või vale.', 'Kirjutan kuuldud arvu või sõna lünka.'], 'E-eksami kuulamine'),
      ],
    },
  },
  EXPLAIN: {
    eep_l_1: [
      'Piret hakkas liikuma, sest perearst ütles, et vererõhk on kõrge (B).',
      'Andres teeb kodus arvutis oleva treeningvideo järgi harjutusi (G).',
      'Kati kõnnib iga päev koeraga metsas (E).',
      'Oskar mängib korvpalli ja tema võistkond on meistrivõistlustel kolmas: võistlussport (D).',
      'Laura jookseb koos sõbrannaga, et mitte vabandusi leida (C). Väited A ja F jäävad üle.',
    ],
    eep_l_2: [
      'Kristiina: „vähemalt sada viiskümmend minutit mõõdukat liikumist nädalas”: õige.',
      'Noortele on soovitus suurem: keskmiselt vähemalt tund iga päev: vale.',
      '„Sinna hulka läheb ka jalgsi kooli minek”: vale.',
      '„Soovitan iga tunni järel paar minutit püsti tõusta ja ringi käia”: õige.',
      '„Ei pea olema. Kõige parem trenn on see, mis sulle meeldib”: vale.',
    ],
    eep_l_3: [
      '„Laupäeval, kahekümnendal mail” — võid kirjutada ka 20.',
      '„Start antakse kell üksteist.”',
      '„Täiskasvanud viis kilomeetrit.” Üks kilomeeter on laste distants.',
      '„Osalustasu on kümme eurot.”',
      '„Kogu raha läheb lastehaigla toetuseks.” Mille toetuseks? — omastav: lastehaigla.',
      '„Registreeruda saab kuni neljapäeva õhtuni.” Kuni + omastav: neljapäeva.',
    ],
  },
};

// ---------------------------------------------------------------- reading and structure, after module 11
const READ = {
  MODULE: { id: 'a2b1-eeharjutus-11', course: 'b1', title: 'E-eksami harjutus: lugemine ja struktuur', level: 'B1', supplement: true },
  LESSONS: {
    'a2b1-ee-p-r': {
      title: 'E-eksami ülesandetüübid: lugemine ja keele struktuur',
      canDo: 'Ma tunnen e-eksami kolme lugemise ja keele struktuuri ülesannet: täiendan vestlust, valin lünka sobiva sõna ja moodustan algvormist õige vormi.',
      shortSheet: true,
      goals: { g_read: 'Õpilane mõistab klienditeeninduse vestlust ja internetiostu teksti ning valib vestlusesse sobiva repliigi.', g_notice: 'Õpilane valib ja moodustab teksti sobiva sõnavormi (kääne, pööre, tegevusnimi).' },
      phases: sheet('E-eksami harjutus · Lugemine ja struktuur', 'Kolm e-eksami lugemis- ja keeleülesannet enne proovieksamit.'),
      discover: [
        B.text('eep_r_intro', 'E-eksami lugemine ja keele struktuur: kolm ülesandetüüpi', 'E-eksami kolmandas osas on seitse ülesannet. Siin proovid kolme: vestluse täiendamine, valiklünktekst ja sõna õige vorm algvormi järgi. Loe enne lünkade täitmist terve tekst läbi. Pärast esitamist näed vigu ja selgitusi.'),
        B.bankText('eep_r_1', '1. Täienda vestlust.', 'Olga kirjutab e-poe klienditoele. Vali Olga repliigid loendist (A–G). Kaks repliiki jääb üle.', 'Kus on minu pakk?', [
          '**Teenindaja:** Tere! Siin Kodukauba e-poe klienditugi ja minu nimi on Kertu. Kuidas saan teid täna aidata?',
          '',
          '**Olga:** [[Tere! Tellisin eelmisel nädalal teie e-poest kohvimasina, aga see ei ole siiani kohale jõudnud.]]',
          '',
          '**Teenindaja:** Vabandame väga! Kas saaksite mulle öelda oma tellimuse numbri?',
          '',
          '**Olga:** [[Muidugi, minu tellimuse number on neli kaheksa kaks üks kolm.]]',
          '',
          '**Teenindaja:** Aitäh teile. Näen, et pakk on pakiautomaadis olnud juba kaks päeva. Kas te ei saanud selle kohta teadet?',
          '',
          '**Olga:** [[Ei saanud, kahjuks. Võib-olla läks teie sõnum kogemata rämpsposti.]]',
          '',
          '**Teenindaja:** Saadan teile ukse avamise koodi kohe uuesti. Pakk ootab automaadis veel viis päeva.',
          '',
          '**Olga:** [[Suurepärane, aitäh! Aga mis siis saab, kui see masin mulle üldse ei meeldi?]]',
          '',
          '**Teenindaja:** Internetist ostetud kauba saab 14 päeva jooksul tagastada ka siis, kui te ei ütle põhjust.',
          '',
          '**Olga:** [[Selge, siis ei pea ma praegu muretsema. Suur aitäh teile abi eest!]]',
        ], ['Ma tahan kohvimasina kohe poodi tagasi viia.', 'Kahjuks ma ei mäleta, mida ma tellisin.']),
        B.cloze('eep_r_2', '2. Vali lünka sobiv sõna.', 'Loe teksti ja vali igasse lünka sobiv sõna.', 'Turvaline ostmine internetis', [
          'Enne kui {*ostad|ostma|ostes} midagi tundmatust e-poest, kontrolli, kas poel on kontaktandmed ja aadress. Väga {*odav|odava|odavat} hind võib olla märk pettusest.',
          '',
          'Maksa ainult turvalises keskkonnas ja ära {*saada|saatma|saadad} kaardiandmeid e-kirjaga. Kui kaup ei ole selline nagu kirjelduses, {*võid|võima|võides} selle tagastada.',
          '',
          'Euroopa Liidus on ostjal õigus internetist ostetud kaubast 14 päeva jooksul {*taganeda|taganema|taganedes}. Probleemide korral saab abi Tarbijakaitse ja Tehnilise Järelevalve {*Ametist|Amet|Ametile}.',
          '',
          '*Allikas: Tarbijakaitse ja Tehnilise Järelevalve Amet, ttja.ee, „Internetist ostmine” ja „Taganemisõigus”.*',
        ], 'g_notice'),
        B.formtext('eep_r_3', '3. Kirjuta lünka sõna õige vorm.', 'Sulgudes on sõna algvorm. Kirjuta lünka see vorm, mis sobib teksti.', 'Minu esimene veebiost', [
          'Eelmisel kuul tellisin [internetist] (internet) endale uued jooksujalanõud. Valisin poe suuruste tabeli järgi õige [suuruse] (suurus). Pakk jõudis minu kodu lähedal asuvasse [pakiautomaati] (pakiautomaat) juba kahe [päevaga] (päev).',
          '',
          'Kahjuks olid jalanõud mulle natuke liiga [väikesed] (väike), nii et [tagastasin] (tagastama) need samasse pakiautomaati. Raha sain oma pangakontole tagasi ühe [nädala] (nädal) pärast.',
        ]),
        B.rubric('eep_r_after', 'Pärast ülesandeid: mis aitas?', 'Märgi, mida sa tegid.', ['Lugesin enne lünkade täitmist terve teksti läbi.', 'Kontrollisin, kas vastus sobib nii tähenduse kui ka vormi poolest.', 'Vestluses lugesin ka järgmise repliigi, enne kui vastuse valisin.']),
        B.selfcheck('eep_r_self', ['Valin vestlusesse repliigi, mis sobib eelmise ja järgmise lausega.', 'Valin lünka sõna õige vormi.', 'Moodustan algvormist teksti sobiva vormi.'], 'E-eksami lugemine'),
      ],
    },
  },
  EXPLAIN: {
    eep_r_1: [
      'Teenindaja küsib, kuidas aidata; järgmisena küsib ta tellimuse numbrit — Olga räägib tellimusest.',
      'Teenindaja küsis tellimuse numbrit: Olga ütleb numbri.',
      'Teenindaja küsis, kas Olga sai teate: vastus algab „Ei saanud” ja selgitab, miks.',
      'Järgmine repliik räägib tagastamisest: Olga küsib, mis saab siis, kui masin ei meeldi.',
      'Olga sai vastuse ja tänab. „Tahan kohe poodi tagasi viia” ei sobi, sest ta ei ole masinat veel näinud.',
    ],
    eep_r_2: [
      '„Enne kui ostad” — enne kui + pöördes tegusõna (sina-vorm).',
      '„Väga odav hind” — omadussõna ühildub nimisõnaga: hind (nimetav) → odav.',
      '„Ära saada” — käskiva kõneviisi eitus: ära + käskiv vorm saada.',
      '„Võid selle tagastada” — sina-vorm, sest tekst pöördub lugeja poole (kontrolli, maksa).',
      '„Õigus taganeda” — õigus + da-tegevusnimi.',
      '„Saab abi Ametist” — kust? Seestütlev: ametist.',
    ],
    eep_r_3: [
      'Kust tellisin? Seestütlev: internetist.',
      'Valisin mille? Täissihitis omastavas: suuruse.',
      'Kuhu jõudis? Sisseütlev: pakiautomaati.',
      'Mille jooksul? Kaasaütlev: kahe päevaga.',
      'Jalanõud (mitmus) olid väikesed: omadussõna ühildub mitmuse nimetavas.',
      'Minevik: tellisin, valisin → tagastasin.',
      'Ühe nädala pärast — kaassõna „pärast” eel omastav: nädala.',
    ],
  },
};

// ---------------------------------------------------------------- writing, after module 12
const WRITE = {
  MODULE: { id: 'a2b1-eeharjutus-12', course: 'b1', title: 'E-eksami harjutus: kirjutamine', level: 'B1', supplement: true },
  LESSONS: {
    'a2b1-ee-p-w': {
      title: 'E-eksami ülesandetüübid: kirjutamine',
      canDo: 'Ma kirjutan e-eksami vormis vastuse kirjale märkmete järgi ja kokkuvõtte diagrammi põhjal.',
      shortSheet: true,
      // teacher-marked writing only (two e-exam texts): nothing for the pet's auto-checked games (petGamesCourse.test.js)
      noGames: true,
      goals: { g_use: 'Õpilane vastab kirjale nii, et käsitleb iga märget, ja kirjutab diagrammi põhjal kokkuvõtte koos analüüsi, oma arvamuse ja ettepanekuga.', g_notice: 'Õpilane kasutab arvude kirjeldamise väljendeid (kõige rohkem, umbes pooled, vähem kui) ja sidesõnu.' },
      phases: sheet('E-eksami harjutus · Kirjutamine', 'Kaks e-eksami kirjutamisülesannet enne proovieksamit; sõnaloendur näitab pikkust.'),
      discover: [
        B.text('eep_w_intro', 'E-eksami kirjutamine: kaks ülesannet', 'E-eksamil kirjutad arvutis kaks teksti 70 minutiga. Esimene on vastus kirjale umbes 100 sõnaga: sõbra kirja kõrval on märkmed (→) ja igale märkmele tuleb vastata. Teine on umbes 160 sõna pikk kokkuvõte või arutlus, sageli diagrammi põhjal. Kumbki ülesanne annab kuni 10 punkti: sisu 0–5 ja keel 0–5.'),
        B.examWriting('eep_w_1', '1. Vasta sõbra kirjale.', 'Loe kirja ja märkmeid (→). Vasta kõigile märkmetele. Umbes 100 sõna.', 'vastus', {
          situation: [
            'Sinu sõber Mari kirjutas sulle.',
            '',
            '> **Teema:** Prügi sorteerimine',
            '> Tere! Meie majas pandi eile õue viis eri värvi prügikonteinerit. Kas teie kodus prügi sorteeritakse? **→ Vasta.**',
            '> Ausalt öeldes on sorteerimine minu arvates liiga tülikas ja aeganõudev. **→ Pole nõus!**',
            '> Mida sina teed, et prügi vähem tekiks? **→ Too kaks näidet.**',
            '> Laupäeval on meie linnaosas talgud. Kas tuled kaasa? **→ Vasta ja põhjenda.**',
            '> Mari',
          ],
          points: ['kas teie kodus prügi sorteeritakse', 'miks sa ei ole nõus, et sorteerimine on tülikas', 'kaks näidet, kuidas prügi vähem tekiks', 'kas tuled talgutele ja miks'],
          words: [80, 120], opening: 'Tere, Mari!',
        }),
        B.chart('eep_w_chart', 'Mida teete keskkonna heaks?', { kind: 'bar', unit: '%', rows: ['Sorteerin prügi | 72', 'Kasutan riidest kotti | 58', 'Ostan kasutatud asju | 34', 'Sõidan vähem autoga | 21', 'Ei tee midagi erilist | 9'], source: 'kooli keskkonnaringi küsitlus, 400 vastajat, võis valida mitu vastust (väljamõeldud andmed)' }),
        B.planning('eep_w_plan', 'Plaan enne kirjutamist (ei hinnata).', 'Kirjuta igaks lõiguks paar märksõna.', ['Mida diagramm näitab? (kõige rohkem, kõige vähem)', 'Miks teevad inimesed mõnda asja harvem?', 'Mida mina teen ja miks?', 'Mida võiks kool või linn teha?'], 2),
        B.examWriting('eep_w_2', '2. Kirjuta kokkuvõte.', 'Vaata diagrammi ja kirjuta selle põhjal tekst. Umbes 160 sõna.', 'kokkuvote', {
          situation: 'Kooli keskkonnaring küsis 400 inimeselt, mida nad keskkonna heaks teevad. Iga vastaja võis valida mitu vastust. Kirjuta tulemuste põhjal tekst, milles:',
          points: ['tee tulemustest kokkuvõte;', 'analüüsi, miks kasutatud asju ostetakse harvem kui prügi sorteeritakse;', 'kirjuta, mida sina keskkonna heaks teed;', 'arutle, kuidas saaks rohkem inimesi keskkonda hoidma.'],
          words: [130, 190],
        }),
        rubric9('eep_w_r2', 'Hindamine: kokkuvõte (10 punkti).', 'kokkuvõte, analüüs, oma tegevus ja ettepanek'),
        B.rubric('eep_w_check', 'Enne esitamist kontrolli.', 'Märgi, mis on tehtud.', ['Kirjas on vastus kõigile neljale märkmele.', 'Kokkuvõttes on numbrid diagrammilt ja oma arvamus koos põhjusega.', 'Pikkus on umbes 100 ja umbes 160 sõna.']),
        B.selfcheck('eep_w_self', ['Vastan kirjale nii, et käsitlen iga märget.', 'Kirjeldan diagrammi arvudega.', 'Põhjendan oma arvamust ja teen ettepaneku.'], 'E-eksami kirjutamine'),
      ],
    },
  },
};

export const E_EXAM_PRACTICE = [LISTEN, READ, WRITE];
export const E_EXAM_LISTENING = LISTEN;
export const E_EXAM_READING = READ;
export const E_EXAM_WRITING = WRITE;
