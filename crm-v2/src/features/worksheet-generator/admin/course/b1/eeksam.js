// B1 course (A2 → B1), supplement „B1 proovieksam (e-eksami vormis)”: mock 1 in the format of the new computer-based
// basic-school exam „eesti keel teise keelena” (EIS e-exam from spring 2027; format contract docs/EXAM_9KL_E_EKSAM.md,
// engine docs/E_EXAM_ENGINE.md).
// Owner 2026-11-18: „вот это новый экзамен который будет” + „и такие же задания сделай в курсе у нас, чтобы давать
// пробник B1 ученикам” — so the mock is a B1 mock for any B1 learner (teens and adults), not only for 9th-graders.
// One lesson per exam part, so a teacher assigns each part on its own day like the real exam:
//   a2b1-ee1-w  I osa  Kirjutamine          70 min, 2 tasks, 20 p (teacher marks: 2 × (sisu 0–5 + keel 0–5), E9W)
//   a2b1-ee1-l  II osa Kuulamine            50 min, 5 tasks / 35 items, 20 p (auto-checked, heard twice)
//   a2b1-ee1-r  III osa Lugemine ja struktuur 95 min, 7 tasks / 65 items, 40 p (auto-checked)
//   a2b1-ee1-s  Suuline osa — with the teacher, not on the computer (teacher card on every task, E9S)
// The written parts are exam sheets (`exam: 'E9'`): part header with the official minutes and a locking timer, item 0
// of every task solved (`opts.example`), the official item counts of Harno's sample test (35 + 65 scored items, item 0
// not counted), part points on the result. Every scored item, item 0 included, has its „why” (eeksamKey.js).
// Every text is written for KeeleSepp; nothing is copied from Harno. Real facts carry their source; the people in the
// recordings are invented.
// Listening: recorded with Neurokõne (tools/listening-audio/build.mjs, listeningAudio.json); after a transcript edit run
// it again. 1.3 has one recording for its eight clips. TODO (content): the audio tool now makes one file per clip when
// each question carries its spoken text `script` — split T13 per clip as docs/E_EXAM_ENGINE.md §2.1 says, then run
// `node tools/listening-audio/build.mjs --only a2b1-ee1-l:ee1_l_13`.
import { B, teach } from '../blocks.js';
import { RUBRIC_SCALES } from '../../../../worksheet-studio/engine/blocks/harnoScales.js';

export { EXPLAIN } from './eeksamKey.js';

export const MODULE = { id: 'a2b1-eeksam-01', course: 'b1', title: 'B1 proovieksam (e-eksami vormis)', level: 'B1', supplement: true };

const TITLE = 'B1 proovieksam (e-eksami vormis) 1';
// a part's sheet label in Õppevara (one sheet per lesson: the part itself)
const part = (label, subtitle) => ({ discover: { label, slot: 1, subtitle } });
// item 0 solved, greyed and never scored (on an exam sheet it is numbered 0)
const example = (block, more = {}) => ({ ...block, opts: { ...(block.opts || {}), example: true, ...more } });
// the e-exam's audio: heard twice, no pause or seeking, the second play starts 10 s after the first
const twice = (block) => ({ ...block, data: { ...block.data, plays: 2, lockPlays: true, playGap: 10 } });
// the part header: the official minutes and points of the 9th-grade e-exam (harnoScales E9), the timer locks the sheet at 0
const header = (id, skill, partName, note) => B.examPart(id, skill, { exam: 'E9', part: partName, target: 60, lock: true, note });

// the 9th-grade e-exam's writing scale (eristuskiri 2026/27 §6.1): task fulfilment and content 0–5 + language 0–5
export const rubric9 = (id, title, task) => {
  const b = B.rubricW2(id, title);
  return { ...b, data: { ...b.data, scale: 'E9W', instruction: `Kaks kriteeriumi, kumbki 0–5 punkti (e-eksami hindamisskaala). Ülesanne: ${task}.`, criteria: RUBRIC_SCALES.E9W.criteria } };
};

// ---------------------------------------------------------------- I osa · Kirjutamine
const withData = (block, data) => ({ ...block, data: { ...block.data, ...data } });
const WRITING = [
  header('ee1_w_part', 'W', 'I osa · Kirjutamine', 'Selles osas on kaks ülesannet. Kirjuta vastus kasti; sõnaloendur näitab, mitu sõna oled kirjutanud. Kui aeg saab läbi, salvestatakse sinu vastused ja osa suletakse. Teksti hindab õpetaja: kummagi ülesande eest sisu 0–5 ja keel 0–5 punkti.'),
  withData(B.examWriting('ee1_w_1', '1. ülesanne. Vasta sõbra kirjale.', 'Loe ülesannet ja kirjuta selle järgi kõrvale kasti oma vastus. Kasuta kõiki märkmeid.', 'vastus', {
    situation: 'Kujuta ette, et käisid eelmisel laupäeval oma linnas **muuseumiööl**: sel õhtul on paljud muuseumid hiliste õhtutundideni lahti ja pakuvad erilisi tegevusi. Sinu sõber Kris ei saanud tulla ja tahab nüüd teada, millised muljed sulle jäid. Loe tema kirja ja vasta sellele noolega näidatud märkmete järgi.',
    words: [80, 120], opening: 'Tere, Kris!',
  }), {
    about: 'u 100 sõna',
    letterSubject: 'Muuseumiöö',
    letter: [
      { text: 'Tere!' },
      { text: 'Kuulsin, et sa käisid laupäeval muuseumiööl. Kus sa käisid ja kellega?', note: 'Vastan' },
      { text: 'Mina pidin õega kodus olema. Ausalt öeldes ei saa ma aru, miks keegi tahab õhtul muuseumis käia. Muuseumid on ju igavad!', note: 'Pole sellega nõus!', side: 'left' },
      { text: 'Mis sulle kõige rohkem meeldis?', note: 'Vastan, mis oli kõige huvitavam' },
      { text: 'Järgmisel aastal tahaksin ka tulla. Mida sa mulle soovitad?', note: 'Annan kaks nõuannet', side: 'left' },
      { text: 'Kirjuta varsti! Kris' },
    ],
    points: '',
  }),
  B.chart('ee1_w_chart', 'Kuidas jõuad tavaliselt kooli või tööle?', { kind: 'pie', unit: '%', rows: ['Bussi või trammiga | 31', 'Autoga | 29', 'Jala | 26', 'Ratta või tõukerattaga | 11', 'Muul viisil | 3'], source: 'kohaliku ajalehe küsitlus, 1200 vastajat (väljamõeldud andmed)' }),
  withData(B.examWriting('ee1_w_2', '2. ülesanne. Kirjuta kokkuvõte.', 'Loe ülesannet ja kirjuta kõrvale lahtrisse kokkuvõte.', 'kokkuvote', {
    situation: 'Kohalik ajaleht korraldas küsitluse, milles osales 1200 inimest. Näed küsitluse tulemusi diagrammil. Kirjuta nende tulemuste põhjal tekst, milles',
    points: ['tee vastustest kokkuvõte;', 'analüüsi, miks nii paljud sõidavad autoga;', 'kirjuta, kuidas sina eelistad liikuda ja miks;', 'arutle, kuidas võiks linn saada rohkem inimesi rattaga sõitma.'],
    words: [130, 190],
  }), { about: 'u 160 sõna' }),
  rubric9('ee1_w_r1', 'Hindamine: 1. ülesanne (10 punkti).', 'vastus kõigile neljale märkmele, kirja vorm'),
  rubric9('ee1_w_r2', 'Hindamine: 2. ülesanne (10 punkti).', 'kokkuvõte, analüüs, oma eelistus ja ettepanek'),
];

// ---------------------------------------------------------------- II osa · Kuulamine
// 1.1 speakers ↔ statements A–I (examlisten mode 'speakers'): speaker 0 (Helen) is the solved example
const L11_CLAIMS = [
  'Ta loeb kõige rohkem bussis või rongis.',
  'Ta eelistab raamatuid kuulata, mitte lugeda.',
  'Tal ei ole praegu lugemiseks aega.',
  'Ta laenutab raamatuid raamatukogust.',
  'Ta loeb raamatuid koos oma lapsega.',
  'Tema arvates on lugemine igav.',
  'Ta kirjutab ise jutte.',
  'Ta loeb ainult eestikeelseid raamatuid, et keelt õppida.',
  'Ta käib lugemisringis.',
];
const T11 = [
  'Näidis.',
  'Helen: Ma ei osta peaaegu kunagi raamatuid. Miks peaksin? Meie kodu lähedal on väike raamatukogu ja seal on alati midagi huvitavat. Kui raamat on teises raamatukogus, tellin selle internetis ja saan paari päeva pärast kätte. Raha jääb alles ja kodus ei ole riiulid täis.',
  'Esimene kõneleja.',
  'Rasmus: Tööle ja tagasi sõidan kokku umbes poolteist tundi. Alguses vaatasin telefonis videoid, aga pea hakkas valutama. Nüüd on mul kotis alati raamat. Sõidu ajal saan nädalas läbi ühe paksu romaani. Kodus ma peaaegu ei loe, seal on muud tegemist.',
  'Teine kõneleja.',
  'Kadri: Igal õhtul enne magamaminekut loeme koos tütrega. Ta on seitsmeaastane ja hakkas just ise lugema, nii et loeme kordamööda: tema loeb ühe lehekülje, mina teise. Mõnikord jääb ta raamatu kõrval magama ja siis loen veel natuke iseendale.',
  'Kolmas kõneleja.',
  'Martin: Mul on düsleksia ja tähed hakkavad silme ees hüppama. Koolis oli see päris piinlik. Aga lood meeldivad mulle väga! Seepärast panen kõrvaklapid pähe ja kuulan audioraamatuid: jalutades, trennis, isegi nõusid pestes. Eelmisel aastal kuulasin läbi üle kolmekümne raamatu.',
  'Neljas kõneleja.',
  'Laura: Kord kuus saame kuue sõbrannaga kokku ühes kohvikus ja arutame raamatut, mille oleme kõik läbi lugenud. Raamatu valib iga kord keegi teine. Nii olen lugenud raamatuid, mida ma ise poest kunagi ei valiks. Vahel vaidleme päris tuliselt.',
  'Viies kõneleja.',
  'Toomas: Varem lugesin palju, eriti ulmet. Aga sel sügisel alustasin ülikoolis ja töötan õhtuti ka poes. Kui koju jõuan, olen nii väsinud, et jaksan ainult magama minna. Ootan suve, siis võtan riiulist jälle mõne raamatu.',
  'Kuues kõneleja.',
  'Grete: Mulle ei piisa sellest, et loen teiste lugusid. Juba kümneaastaselt hakkasin vihikusse oma lugusid kirjutama. Nüüd on mul blogi, kus avaldan iga nädal ühe lühijutu. Kõige toredam on see, kui lugejad kirjutavad, mis edasi peaks juhtuma.',
];
const L11 = B.examListen('ee1_l_11', '1.1. Kuula erinevate inimeste arvamusi sama teema kohta.', 'Otsusta, milline lause sobib kõnelejaga kokku. Kaks lauset jääb üle. Kõige esimene lünk on näidis ja see on juba täidetud. Kõnelõike kuuled kaks korda. *Vajuta lüngale ja vali sobiv vastus.*', 'choice', T11, [], 'g_listen');

const T13 = [
  'Näidis. Kuulete katkendit raadiouudisest.',
  'Diktor: Tartu linn avab järgmisel nädalal raudteejaama juures kaks uut rattaparklat. Linnavalitsuse sõnul jääb kohti aga ikkagi väheks, sest rongiga sõitjaid on kahe aastaga tunduvalt rohkem.',
  'Esimene lõik. Kuulete telefonisõnumit.',
  'Registraator: Tere! Siin Kase hambaravi. Teie aeg on homme kell üheksa, aga arst jäi haigeks. Saame teid vastu võtta reedel kell kaksteist või järgmisel teisipäeval kell kolm. Palun helistage meile tagasi ja öelge, kumb aeg sobib.',
  'Teine lõik. Kuulete teadaannet kaubanduskeskuses.',
  'Teadustaja: Lugupeetud külastajad! Teise korruse lifti parandatakse. Lapsevankri või ratastooliga palume kasutada lifti peasissekäigu juures. Vabandame ebamugavuste pärast.',
  'Kolmas lõik. Kuulete kahe sõbra vestlust.',
  'Liis: Kas sa lähed laupäeval kontserdile?',
  'Mart: Pilet on mul olemas, aga ma ei tea, kas saan minna. Vanaema tuleb külla ja ema tahab, et ma koju jääksin.',
  'Liis: Võib-olla tuleb vanaema ka kontserdile?',
  'Mart: Ha, ta on tõesti džässi fänn! Küsin temalt kohe.',
  'Neljas lõik. Kuulete ilmateadet.',
  'Diktor: Homme on pilves ilm. Lõuna-Eestis sajab hommikul lund, pärastlõunal muutub sadu lörtsiks. Saartel puhub tugev edelatuul. Õhutemperatuur on miinus kahest kuni pluss kahe kraadini. Autojuhtidel tasub arvestada libedate teedega.',
  'Viies lõik. Kuulete intervjuud noore ettevõtjaga.',
  'Ajakirjanik: Kuidas tekkis idee teha vanast riidest kotte?',
  'Mia: Vanaema andis mulle oma vana mantli. Ütlesin, et seda ei taha enam keegi kanda. Tema vastas: siis tee sellest midagi muud! Nii sündis esimene kott. Esimesel aastal müüsin sõpradele umbes sada kotti, nüüd on mul e-pood.',
  'Kuues lõik. Kuulete katkendit loengust.',
  'Lektor: Paljud arvavad, et öösel on hea õppida, sest on vaikne. Uuringud näitavad aga, et õpitu kinnistub mälus just une ajal. Kui jätad une vahele, unustad suure osa õpitust juba järgmisel päeval. Seepärast soovitan enne eksamit pigem korralikult magada kui hommikuni õppida.',
  'Seitsmes lõik. Kuulete raadioreklaami.',
  'Diktor: Kas sul on kapis riideid, mida sa enam ei kanna? Too need laupäeval kultuurimaja hoovi vahetusturule! Iga toodud asja eest saad märgi ja märgi eest võid võtta endale midagi teiste toodud asjadest. Raha ei ole vaja. Katkised riided palume koju jätta.',
];
const L13_SITUATIONS = ['Kuuled katkendit raadiouudisest.', 'Kuuled telefonisõnumit.', 'Kuuled teadaannet kaubanduskeskuses.', 'Kuuled kahe sõbra vestlust.', 'Kuuled ilmateadet.', 'Kuuled intervjuud noore ettevõtjaga.', 'Kuuled katkendit loengust.', 'Kuuled raadioreklaami.'];
const L13 = B.examListen('ee1_l_13', '1.3. Kuula kõnelõike ja vasta küsimustele.', 'Igale küsimusele on üks õige vastus. Kõige esimene kõnelõik on näidis ja selle vastus on juba märgitud. Iga lõiku kuuled kaks korda. *Vastamiseks vajuta nupule sobiva vastuse ees.*', 'choice', T13, [
  ['Mida arvab linnavalitsus uutest rattaparklatest?', 'Rattakohti on ikka liiga vähe.', 'Rattaparklad on liiga kallid.', 'Rongiga sõidetakse varasemast vähem.'],
  ['Miks helistati hambaravist patsiendile päev enne vastuvõttu?', 'Vastuvõtu aeg tuleb muuta.', 'Arve on maksmata.', 'Vastuvõtt algab varem.'],
  ['Mida palutakse lapsevankri või ratastooliga külastajatel teha?', 'Kasutada teist lifti.', 'Kasutada treppi.', 'Oodata, kuni lift korda saab.'],
  ['Mida otsustab Mart pärast sõbra küsimust teha?', 'Küsida vanaemalt, kas ta tahab kontserdile tulla.', 'Müüa oma pilet sõbrale.', 'Jääda kindlasti koju.'],
  ['Mis võib homme autojuhtidele kõige ohtlikum olla?', 'Libedad teed.', 'Tugev vihm.', 'Paks udu.'],
  ['Kust tuli Mial idee teha vanast riidest kotte?', 'Vanaema soovitas vanast riidest midagi uut teha.', 'Ta nägi poes sarnast kotti.', 'Ta õppis seda koolis.'],
  ['Mida soovitab lektor teha öösel enne eksamit?', 'Magada, mitte terve öö õppida.', 'Õppida, sest öösel on vaikne.', 'Korrata kõike veel kord hommikul.'],
  ['Kuidas toimib laupäevane vahetusturg kultuurimaja hoovis?', 'Toodud asja eest saab võtta mõne teise asja.', 'Riideid müüakse poole hinnaga.', 'Katkised riided parandatakse kohapeal.'],
], 'g_listen');

const LISTENING = [
  header('ee1_l_part', 'L', 'II osa · Kuulamine', 'Selles osas on viis ülesannet ja 35 küsimust. Iga teksti kuuled kaks korda: esimesel korral märgi vastus, teisel korral kontrolli. Iga ülesande esimene küsimus (0) on näidis ja selle vastus on juba märgitud.'),
  twice(example({ ...L11, data: { ...L11.data, mode: 'speakers', topic: 'Mida arvavad inimesed lugemisest?', claims: L11_CLAIMS, questions: [], speakers: [
    { name: 'Helen', answer: 'D' }, { name: 'Rasmus', answer: 'A' }, { name: 'Kadri', answer: 'E' }, { name: 'Martin', answer: 'B' },
    { name: 'Laura', answer: 'I' }, { name: 'Toomas', answer: 'C' }, { name: 'Grete', answer: 'G' },
  ] } })),
  twice(example(B.examListen('ee1_l_12', '1.2. Kuula monoloogi ja vasta küsimustele.', 'Kuula, mida räägib vabatahtlik merepäästja Kertu. Igale küsimusele on ainult üks õige vastus. Monoloogi kuuled kaks korda. Kõige esimene küsimus (0) on näidis ja see on juba ära märgitud. *Vastamiseks vajuta nupule sobiva vastuse ees.*', 'choice', [
    'Tere! Minu nimi on Kertu ja ma olen vabatahtlik merepäästja Saaremaal. Päeval töötan raamatupidajana, aga umbes kaks korda kuus olen valves. See tähendab, et kui merel juhtub midagi, helistatakse mulle ja ma pean kümne minutiga sadamas olema.',
    'Merepäästjaks sain ma juhuslikult. Kuus aastat tagasi läksime sõbraga purjekaga merele ja ilm läks äkki halvaks. Mootor ei käivitunud ja me ei saanud ise kaldale. Meid tulid aitama vabatahtlikud päästjad. Kui olime kaldal, küsisin neilt, kas ka mina võiksin nendega liituda. Nad naersid ja ütlesid, et muidugi, aga enne tuleb palju õppida.',
    'Esimene aasta oli tõesti raske. Õppisime esmaabi, navigeerimist ja seda, kuidas inimest veest paati tõmmata. Kõige raskem oli minu jaoks ujumiskatse külmas vees. Vesi oli ainult kaheksa kraadi! Pärast seda katset ma enam merd ei kartnud.',
    'Meie meeskonnas on kaksteist inimest: õpetaja, kaks kalurit, poemüüja, üliõpilane ja isegi üks pensionär. Vanus ei ole tähtis. Tähtis on see, et inimene on terve ja jõuab valves olla.',
    'Kõige sagedamini aitame me kalureid ja paadisõitjaid, kelle mootor on katki läinud. Suvel tuleb ette ka seda, et lapsed on täispuhutava madratsiga liiga kaugele triivinud. Eelmisel aastal oli meil kokku nelikümmend väljakutset.',
    'Raha me selle töö eest ei saa. Paadi ja varustuse ostmiseks kogume annetusi ja küsime toetust vallalt. Minu pere pidi alguses harjuma sellega, et ma võin keset sünnipäeva äkki minema joosta. Nüüd on mu poeg kümneaastane ja ütleb uhkusega, et ema on päästja.',
    'Kui keegi tahaks meiega liituda, siis kõige tähtsam on soov aidata. Kõike muud saab õppida.',
  ], [
    ['Mis tööd teeb Kertu päeval?', 'Ta on raamatupidaja.', 'Ta on õpetaja.', 'Ta on kalur.'],
    ['Kui kiiresti peab Kertu valves olles sadamas olema?', 'Kümne minutiga.', 'Poole tunniga.', 'Viie minutiga.'],
    ['Miks otsustas Kertu kuus aastat tagasi merepäästjaks hakata?', 'Teda ennast oli kord merel päästetud.', 'Tema isa oli merepäästja.', 'Ta nägi ajalehes kuulutust.'],
    ['Mis oli Kertu jaoks esimesel õppeaastal kõige raskem?', 'Ujumiskatse külmas vees.', 'Esmaabi õppimine.', 'Navigeerimine kaardi järgi.'],
    ['Millised inimesed on Kertu kaheteistliikmelises meeskonnas?', 'Eri vanuse ja ametiga inimesed.', 'Ainult kalurid.', 'Ainult noored üliõpilased.'],
    ['Keda aitavad Saaremaa vabatahtlikud merepäästjad kõige sagedamini merel?', 'Kalureid ja paadisõitjaid, kelle mootor on rikkis.', 'Lapsi, kes ei oska ujuda.', 'Turiste, kes on metsa ära eksinud.'],
    ['Kust saavad päästjad raha paadi ja varustuse ostmiseks?', 'Annetustest ja valla toetusest.', 'Nad maksavad kõik ise.', 'Raha annab riik.'],
    ['Mida arvab Kertu kümneaastane poeg ema vabatahtlikust tööst?', 'Ta on uhke, et ema on päästja.', 'Ta tahab ka ise päästjaks saada.', 'Ta ei ole rahul, et ema on tihti ära.'],
  ], 'g_listen'))),
  twice(example({ ...L13, data: { ...L13.data, questions: L13.data.questions.map((q, i) => ({ situation: L13_SITUATIONS[i], ...q })) } })),
  twice(example(B.examListen('ee1_l_14', '1.4. Kuula intervjuud ja otsusta, kas väide on õige või vale.', 'Kuula raadiointervjuud talgupäeva korraldajaga. Näidis on tähistatud 0-ga. Intervjuud kuuled kaks korda. *Vastamiseks vajuta sobivale nupule.*', 'truefalse', [
    'Saatejuht: Tere tulemast saatesse! Täna on külas Anu, kes korraldab oma vallas talgupäeva juba kümnendat aastat. Anu, kuidas see kõik alguse sai?',
    'Anu: Eestis sai talgute laine alguse 2008. aastal, kui toimus suur koristusaktsioon „Teeme ära”. Ühel maipäeval tuli metsadest ja teeäärtest prügi korjama umbes viiskümmend tuhat inimest ja viie tunniga koguti kokku umbes kümme tuhat tonni prügi. Mina olin siis kaheteistaastane ja käisin koos isaga. Mäletan, et leidsime metsast isegi vana diivani.',
    'Saatejuht: Kas see oli ainult Eesti asi?',
    'Anu: Alguses küll, aga idee levis kiiresti. Nüüd toimub igal aastal septembris maailmakoristuspäev, mis sai samuti alguse Eestist. Selles on osalenud inimesed peaaegu kõikides maailma riikides.',
    'Saatejuht: Aga mida teete teie oma vallas?',
    'Anu: Meil on talgupäev igal kevadel. Prügi korjame üha vähem, sest metsad on palju puhtamad kui viisteist aastat tagasi. Nüüd teeme muid töid: parandame mänguväljakuid, istutame puid ja värvime külamaja.',
    'Saatejuht: Kes talgutele tuleb?',
    'Anu: Kõige rohkem tuleb peresid lastega. Teismelisi on vähem, aga see on muutumas, sest kool arvestab talgutel tehtud töö vabatahtliku töö tundide hulka. Mul on hea meel, et tulevad ka uued elanikud, kes on alles valda kolinud. Talgutel saavad nad naabritega tuttavaks.',
    'Saatejuht: Mis on talgute juures kõige raskem?',
    'Anu: Ilm. Kui sajab vihma, tuleb poole vähem inimesi. Ja muidugi tuleb kõik hästi planeerida: tööriistad, kindad, prügikotid ja söök.',
    'Saatejuht: Söök?',
    'Anu: Jah! Talgute lõpus on alati ühine supp. Ausalt öeldes tullakse vahel just supi pärast.',
  ], [
    ['Anu korraldab talgupäeva esimest korda.', false],
    ['2008. aasta koristuspäeval osales umbes viiskümmend tuhat inimest.', true],
    ['Anu käis esimesel suurel koristuspäeval koos oma isaga.', true],
    ['Maailmakoristuspäev toimub igal aastal mais.', false],
    ['Anu vallas korjatakse talgutel nüüd rohkem prügi kui varem.', false],
    ['Talgutel tehakse ka muid töid peale koristamise.', true],
    ['Kõige rohkem tuleb talgutele teismelisi.', false],
    ['Vihmase ilmaga tuleb talgutele vähem inimesi.', true],
  ], 'g_listen'))),
  twice(example(B.listening('ee1_l_15', '1.5. Kuula monoloogi ja kirjuta lünka sobiv sõna, sõnad või arv.', 'Esimene lünk (0) on näidis ja see on juba täidetud. Monoloogi kuuled kaks korda. *Vastamiseks vajuta lüngale ja kirjuta sobiv vastus.*', [
    'Tere! Olen matkajuht Joonas ja täna räägin teile Soomaa rahvuspargist. Soomaa asub Pärnumaal ja Viljandimaal ning rahvuspark loodi 1993. aastal.',
    'Soomaa on kuulus oma suurte soode ja rabade poolest, aga eriti tuntud on siinne viies aastaaeg. Nii nimetatakse aega kevadel, kui lumi sulab ja jõed tulevad üle kallaste. Siis saab mõnes kohas paadiga sõita seal, kus suvel kasvab heinamaa. Mõni pere jõuab siis koju ainult kanuuga.',
    'Kõige parem viis Soomaad tundma õppida on minna rabamatkale. Me jalutame laudteel, aga matkajad võivad proovida ka rabakingi. Need on laiad jalanõud, millega saab astuda pehmele samblale ja mitte sisse vajuda.',
    'Tavaline matk kestab umbes neli tundi ja selle pikkus on seitse kilomeetrit. Kaasa tasub võtta vihmajope, sest ilm muutub rabas kiiresti, ja kindlasti ka joogivett. Juunis ja juulis kulub ära sääsevastane vahend. Lastega peredele soovitame lühemat, kahekilomeetrist matka.',
    'Matkale tuleb end eelnevalt registreerida meie kodulehel. Ühes rühmas on kuni viisteist inimest. Kohtume külastuskeskuse parklas kell kümme hommikul.',
  ], [
    'Soomaa rahvuspark loodi [1993]. aastal.',
    'Soomaa on kuulus oma soode ja [rabade] poolest.',
    'Kevadel, kui lumi sulab, tulevad [jõed] üle kallaste.',
    'Mõni pere jõuab üleujutuse ajal koju ainult [kanuuga].',
    'Rabakingad on [laiad] jalanõud, millega ei vaju samblasse.',
    'Tavaline matk kestab umbes [neli|4] tundi.',
    'Matka pikkus on [seitse|7] kilomeetrit.',
    'Juunis ja juulis kulub matkal ära [sääsevastane] vahend.',
    'Ühes rühmas on kuni [viisteist|15] inimest.',
  ], 'g_listen'))),
];

// ---------------------------------------------------------------- III osa · Lugemine ja keele struktuur
const layout = (block, value) => ({ ...block, data: { ...block.data, layout: value } });
const READING = [
  header('ee1_r_part', 'R', 'III osa · Lugemine ja keele struktuur', 'Selles osas on seitse ülesannet ja 65 küsimust: lugemine (2.1–2.4) ja keele struktuur (2.5–2.7). Iga ülesande näidis (0) on juba täidetud. Kui mõni lünk on raske, jäta see vahele ja tule hiljem tagasi.'),
  example(layout(B.bankText('ee1_r_21', '2.1. Täienda Sandra ja Eriku telefonivestlust.', 'Kaks vastust jääb üle. Esimene vastus on näidis ja see lünk on juba täidetud. *Vastamiseks vajuta sobivale vastusele ja tõsta see vastusekasti. Kui soovid vastust muuta, tõsta vastus tagasi ja asenda uuega.*', '', [
    '**Sandra:** Tere, Erik! Kas sul on hetk aega?',
    '',
    '**Erik:** [[Tere! On küll, istun just bussis ja sõidan koju. Mis juhtus?]]',
    '',
    '**Sandra:** Mõtlesin, et võiksime laupäeval matkama minna. Ilmateade lubab päikest.',
    '',
    '**Erik:** [[Hea mõte! Kuhu sa minna tahaksid?]]',
    '',
    '**Sandra:** Mulle meeldiks Viru raba. Sinna on Tallinnast umbes tunni tee.',
    '',
    '**Erik:** [[Viru raba on ilus, aga nädalavahetusel on seal väga palju inimesi.]]',
    '',
    '**Sandra:** Tõsi. Kas sul on parem ettepanek?',
    '',
    '**Erik:** [[Võiksime minna Pakri poolsaarele. Seal on kõrge pank ja meri.]]',
    '',
    '**Sandra:** Kõlab hästi! Aga kuidas me sinna saame? Mul ei ole autot.',
    '',
    '**Erik:** [[Paldiskisse saab rongiga ja sealt edasi jala.]]',
    '',
    '**Sandra:** Super. Mida ma kaasa peaksin võtma?',
    '',
    '**Erik:** [[Võta mugavad jalanõud, soe jope ja natuke süüa.]]',
    '',
    '**Sandra:** Selge. Kohtume siis laupäeval kell üheksa Balti jaamas!',
  ], ['Kahjuks olen laupäeval tööl ja ei saa kuhugi minna.', 'Sinna sõidab buss otse meie maja eest iga poole tunni tagant.']), 'chat')),
  example(layout(B.bankText('ee1_r_22', '2.2. Loe teksti ja täida lüngad.', 'Neli sõna jääb üle. Kõige esimene lünk on näidis ja selles on õige vastus juba märgitud. *Vali vastuste pangast lünka sobiv sõna. Vajuta sõna peale ja tõsta see lünka. Kui tahad vastust muuta, tõsta sõna panka tagasi.*', 'Eesti Rahva Muuseum', [
    'Eesti Rahva Muuseum [[asub]] Tartus. Muuseum loodi juba 1909. aastal, kui Eesti oli veel Vene [[impeeriumi]] osa. Muuseumi rajajad tahtsid koguda ja [[hoida]] seda, mis on eesti rahvale tähtis: rahvariideid, tööriistu, laule ja lugusid.',
    '',
    'Pikka aega ei olnud muuseumil oma [[maja]]. Kogud olid laiali eri hoonetes ja paljud esemed ei olnud külastajatele [[nähtavad]]. Uus hoone avati alles 2016. aasta sügisel. See asub Raadil, endise lennuvälja [[kõrval]], ja hoone katus tõuseb nagu stardirada taeva [[poole]].',
    '',
    'Muuseumis on kaks püsinäitust. Näitus „Kohtumised” räägib inimeste elust Eesti alal läbi [[tuhandete]] aastate. Teine näitus, „Uurali kaja”, tutvustab soome-ugri [[rahvaid]], kelle keeled on eesti keelega sugulased.',
    '',
    'Muuseum ei ole ainult vanade asjade [[jaoks]]. Seal toimuvad kontserdid, filmiõhtud ja töötoad, kus saab näiteks [[õppida]] vanu käsitöövõtteid. Paljud pered veedavad muuseumis terve päeva, sest vaadata on [[palju]].',
    '',
    'Kui te Tartusse satute, [[tasub]] muuseumi külastada. Arvestage aga sellega, et ühe päevaga ei jõua kõike [[näha]].',
    '',
    '*Allikas: Eesti Rahva Muuseum, erm.ee (muuseumi ajalugu, püsinäitused).*',
  ], ['impeeriumist', 'hoidma', 'näevad', 'kaugel']), 'chips')),
  B.text('ee1_r_23_text', '2.3. Loe artiklit.', [
    '**Kas me magame piisavalt?**',
    '',
    'Uni on sama tähtis kui toit ja liikumine. Ameerika Unemeditsiini Akadeemia soovitab 13–18-aastastele noortele 8–10 tundi und ööpäevas, täiskasvanutele aga vähemalt seitse tundi. Paljud magavad siiski vähem. Eriti noorte puhul ei ole põhjus ainult laiskus või halvad harjumused.',
    '',
    'Teismeeas muutub inimese sisemine kell. Unehormoon melatoniin hakkab organismis tekkima hiljem kui lapsepõlves, mistõttu tunneb noor end õhtul kaua erksana ja hommikul uimasena. Kui kool algab kell kaheksa, jääb uneaeg paratamatult lühikeseks. Mõnes riigis on seepärast koolipäeva algust nihutatud hilisemaks.',
    '',
    'Teine põhjus on ekraanid. Telefon voodis ei sega und ainult ereda valgusega. Sageli on probleem hoopis selles, et sotsiaalmeedia ja mängud on loodud nii, et neid on raske käest panna. „Veel üks video” muutub kergesti tunniks.',
    '',
    'Unepuudus mõjutab peaaegu kõike. Väsinud inimene keskendub halvemini, unustab kergemini ja ärritub kiiremini. Uuringute järgi saavad ka sportlased, kes magavad vähe, sagedamini vigastada. Paljud ei saa aru, et nende halb tuju või kehvem tulemus on seotud unega.',
    '',
    'Mida siis teha? Unearstid soovitavad minna magama ja ärgata iga päev umbes samal ajal, ka nädalavahetusel. Tund enne magamaminekut tasub ekraanid kõrvale panna ning magamistuba peaks olema jahe, pime ja vaikne. Kofeiiniga jooke, näiteks kohvi ja energiajooke, ei tohiks juua pärastlõunal.',
    '',
    'Nädalavahetusel kaua magamine aitab ainult natuke. Kui inimene magab laupäeval ja pühapäeval keskpäevani, on tal pühapäeva õhtul raske uinuda ja uus nädal algab jälle väsinult. Seega on parem magada iga päev piisavalt kui püüda magamata tunde hiljem tasa teha.',
    '',
    '*Allikas: American Academy of Sleep Medicine, soovitused laste ja noorte unele (2016) ning täiskasvanute unele (2015).*',
  ].join('\n')),
  example(B.choice('ee1_r_23', '2.3. Loe teksti ja selle kõrval olevaid küsimusi.', 'Otsusta, milline vastus on õige. Igale küsimusele on üks sobiv vastus. Kõigepealt on näidis ja see on juba ära märgitud.', [
    ['Mitu tundi und soovitatakse 13–18-aastastele noortele?', '8–10 tundi.', 'Vähemalt seitse tundi.', 'Kuni kuus tundi.'],
    ['Kui palju und soovitatakse täiskasvanutele?', 'Vähemalt seitse tundi.', '8–10 tundi.', 'Kuni kuus tundi.'],
    ['Miks on noortel õhtul raske magama jääda?', 'Unehormoon hakkab neil tekkima hiljem kui lastel.', 'Nad on laisad ja neil on halvad harjumused.', 'Nad joovad õhtul liiga palju vett.'],
    ['Mida on mõnes riigis tehtud?', 'Koolipäev algab hiljem.', 'Telefonid on koolis keelatud.', 'Koolipäev on lühem.'],
    ['Milles on ekraanide puhul sageli peamine probleem?', 'Neid on raske käest panna.', 'Nende valgus on liiga ere.', 'Need on liiga kallid.'],
    ['Mis juhtub sportlastega, kes magavad vähe?', 'Nad saavad sagedamini vigastada.', 'Nad jooksevad kiiremini.', 'Nad unustavad treeningu ära.'],
    ['Mida soovitavad unearstid?', 'Ärgata iga päev umbes samal ajal.', 'Magada nädalavahetusel kaua.', 'Juua õhtul tassi kohvi.'],
    ['Mis on artikli peamine mõte?', 'Parem on magada iga päev piisavalt kui hiljem und tasa teha.', 'Noored on unepuuduses ise süüdi.', 'Ekraanid on une ainus vaenlane.'],
  ], 'full', 'g_read')),
  example(layout(B.bankText('ee1_r_24', '2.4. Loe teksti ja pane tekstiosad lünkadesse.', 'Kaks tekstiosa jääb üle. Esimene lünk on näidis ja see on juba täidetud. *Vastamiseks tõsta teksti kõrvalt lünka sobiv tekstiosa. Kui tahad vastust muuta, tõsta see tagasi või asenda uuega.*', 'Minu laupäevad varjupaigas', [
    'Olin juba ammu tahtnud loomadega töötada, aga kodus meil lemmikloomi pidada ei saa, [[sest isal on kassiallergia]]. Seepärast otsustasin eelmisel kevadel minna vabatahtlikuks loomade varjupaika. Kirjutasin varjupaigale kirja ja juba järgmisel päeval [[helistati mulle tagasi]].',
    '',
    'Esimesel päeval võttis mind vastu Marika, [[kes töötab varjupaigas juba kümme aastat]]. Ta näitas mulle kõiki ruume ja selgitas, et koertega jalutamine ei ole nii lihtne, [[kui ma arvasin]]. Mõni koer tõmbab rihma nii kõvasti, et teda on raske kinni hoida.',
    '',
    'Minu esimene ülesanne oli puurid puhtaks teha. Ausalt öeldes ei olnud see üldse romantiline, [[aga keegi peab ka seda tegema]]. Pärast lõunat lubas Marika mul lõpuks [[minna jalutama vana koera Kustiga]]. Kusti oli väga rahulik ja kõndis minu kõrval, nagu oleksime [[olnud sõbrad terve elu]].',
    '',
    'Kõige rohkem üllatas mind see, [[kui palju inimesi varjupaika aitab]]. Üks tõi toitu, teine vanu tekke, kolmas oli tulnud koeri pildistama, [[et neile kiiremini uus kodu leida]]. Selgus, et ilusa pildiga koer leiab omaniku palju kiiremini.',
    '',
    'Õhtul koju jõudes olin väsinud, [[kuid väga õnnelik]]. Nüüd käin varjupaigas igal laupäeval. Kusti leidis kuu aega hiljem uue pere, [[mis tegi mind ühtaegu kurvaks ja rõõmsaks]].',
  ], ['et koerad ei vaja jalutamist', 'kuigi ma ei tahtnud sinna üldse minna']), 'chips')),
  // 2.5: the endings are dragged (or tapped) from the bank into the gap after each beginning, as in EIS
  example(withData(B.adsmatch('ee1_r_25', '2.5. Lõpeta laused.', 'Üks lause lõpp jääb üle. Esimene lause on näidis ja see on juba ära märgitud. *Vastamiseks vali vastuste pangast sobiv lause lõpp.*', [
    ['', 'sest bussipiletit ei ole enam vaja osta.'],
    ['', 'kus autojuht ei pruugi ratturit märgata.'],
    ['', 'kas ma ei karda autode vahel sõita.'],
    ['', 'mida ma eile poest ostsin.'],
    ['', 'kuigi vahemaa oli ainult kuus kilomeetrit.'],
    ['', 'kes elavad kooli või töö lähedal.'],
    ['', 'kuna märjana ei ole mõnus terve päev istuda.'],
    ['', 'et õhtul ei jaksanud ma trepist üles minna.'],
    ['', 'et inimesed julgeksid rohkem rattaga sõita.'],
    ['', 'sest pimedal ajal peab olema hästi nähtav.'],
    ['', 'et magan paremini ja tuju on parem.'],
    ['', 'et hakkan iga päev rattaga sõitma.'],
  ], [
    ['Eelmisel kevadel otsustasin, …', 'L'],
    ['Bussiga sõit võttis mul iga päev üle tunni, …', 'E'],
    ['Esimesel nädalal olid jalad nii väsinud, …', 'H'],
    ['Sõbrad küsisid, …', 'C'],
    ['Ostsin endale helkurvesti ja tugevad tuled, …', 'J'],
    ['Vihmase ilmaga sõidan ikka bussiga, …', 'G'],
    ['Kuu aja pärast märkasin, …', 'K'],
    ['Raha kulub nüüd vähem, …', 'A'],
    ['Linn võiks ehitada rohkem rattateid, …', 'I'],
    ['Kõige ohtlikum on ristmikul, …', 'B'],
    ['Soovitan rattaga sõitmist kõigile, …', 'F'],
  ], 'g_notice'), { layout: 'chips' })),
  example(B.cloze('ee1_r_26', '2.6. Loe teksti ja vali lünka sobiv sõna.', 'Esimene lünk on näidis ja seal on õige vastus ära valitud. *Vajuta lüngale, vali seejärel sobiv vastus ja vajuta sellele.*', 'Lahtede maa', [
    'Lahemaa rahvuspark {*asub|asuvad|asuma} Põhja-Eestis, Tallinnast umbes {*tunnise|tunni|tunniga} autosõidu kaugusel. Rahvuspark {*loodi|lõi|loob} 1971. aastal ja see oli Eesti {*esimene|esimest|esimesena} rahvuspark.',
    '',
    'Nimi Lahemaa tähendab lahtede maad, sest rannik on {*liigendatud|liigendama|liigendab} mitmeks poolsaareks ja laheks. Rahvuspargis on palju metsa, rabasid ja suuri rändrahne, {*mida|mis|kes} jää on kunagi Skandinaaviast kaasa toonud.',
    '',
    'Külastajaid {*meelitavad|meelitab|meelitama} ka vanad mõisad. Kõige tuntum neist on Palmse mõis, kus saab tutvuda {*mõisaeluga|mõisaelu|mõisaelus} 19. sajandil. Kui otsite rahulikumat kohta, {*minge|lähete|minna} Käsmu kaptenite külla.',
    '',
    'Rahvuspargis tuleb loodust {*hoida|hoidma|hoides}: prügi tuleb viia {*endaga|enda|endast} kaasa ja lõket võib teha ainult selleks ettenähtud kohtades.',
    '',
    '*Allikas: Keskkonnaamet, loodusegakoos.ee, „Lahemaa rahvuspark”.*',
  ], 'g_notice')),
  example(withData(B.formtext('ee1_r_27', '2.7. Loe teksti ja kirjuta lünka sõna õige vorm.', 'Igas lüngas on antud sõna algvorm; pane see sellisesse vormi, mis sobib teksti. Esimene lünk on näidis. *Vajuta lüngale ja kirjuta sinna sobiv vastus.*', 'Minu esimene palk', [
    'Eelmisel [suvel] (suvi) töötasin esimest korda päris tööl. Sain koha [kohvikus] (kohvik) mere ääres, kus pidin hommikuti [kohvi] (kohv) keetma ja laudu koristama. Töö algas kell seitse, nii et [ärkasin] (ärkama) iga päev kell kuus.',
    '',
    'Kõige raskem oli meeles pidada kõigi [klientide] (klient) soove. Kuu lõpus sain oma esimese [palga] (palk). Tundsin end päris [täiskasvanuna] (täiskasvanu).',
    '',
    'Osa rahast panin hoiukontole, sest unistan [uuest] (uus) jalgrattast. Ülejäänud raha eest ostsin [emale] (ema) lilled ja käisin sõpradega [kinos] (kino). Järgmisel suvel tahaksin jälle [töötada] (töötama), aga juba mõnes teises kohas.',
  ]), { hint: 'inside' })),
];

// ---------------------------------------------------------------- Suuline osa (with the teacher)
const ORAL = [
  B.text('ee1_s_card', 'Suuline osa · tehakse koos õpetajaga', 'E-eksamil tehakse kirjalik osa arvutis, suuline osa aga **intervjueerijaga, mitte arvutis**. Proovieksamil on intervjueerija sinu õpetaja. Suuline osa kestab umbes **15 minutit** (päris eksamil paaris 24–26 minutit) ja annab **20 punkti**. Õpetaja salvestab või kuulab vastused ja hindab neid skaala järgi. Ettevalmistus: loe iga ülesande kaart läbi umbes 30 sekundiga ja vasta täislausetega.'),
  teach(B.speaking('ee1_s_intro', 'Sissejuhatus (2–3 minutit).', 'Õpetaja küsib sinult tavalisi küsimusi. Vasta igale 2–3 lausega.', ['Kuidas sa tavaliselt oma vaba aega veedad?', 'Kus sa elad ja mis sulle oma kodukohas meeldib?', 'Mida sa plaanid järgmisel aastal õppida või teha?', 'Kellega sa kõige sagedamini aega veedad?'], [120, 180]),
    'Õpetaja kaart: küsi küsimused rahulikult, ära paranda vigu. See osa ei anna eraldi punkte, aga mõjutab üldmuljet. Kui vastus on liiga lühike, küsi „Miks?” või „Räägi natuke rohkem”.'),
  teach(B.speaking('ee1_s_1', '1. ülesanne. Avalda arvamust.', 'Loe teemakaarti (30 sekundit). Ütle 3–4 lausega oma arvamus ja põhjenda seda. Too üks näide.', ['Teemakaart: „Igaüks peaks vähemalt korra elus tegema vabatahtlikku tööd.” Kas oled nõus? Miks?', 'Lisaküsimus: Millist vabatahtlikku tööd oled sina teinud või tahaksid teha?'], [90, 150]),
    'Õpetaja kaart: anna kaart, oota 30 sekundit, siis kuula vahele segamata. Kui õpilane lõpetab väga ruttu, küsi lisaküsimus. Hinda: kas on seisukoht, põhjus ja näide.'),
  teach(B.phoneCards('ee1_s_2', '2. ülesanne. Helista kuulutuse peale.', 'Loe oma kaarti. Õpilane helistab ja küsib kõik küsimused; õpetaja vastab vastuste kaardi järgi. Seejärel vahetage rolle uue kuulutusega.', 'Kuulutus: „Rattamatk Lõuna-Eestis. Kolm päeva, ööbimine telkides. Info telefonil.”', ['Sina oled huviline ja helistad.', ['Millal matk toimub?', 'Kui pikk on üks päevateekond?', 'Kui palju matk maksab ja mis on hinna sees?', 'Kas ratta saab rentida?', 'Mida peab kaasa võtma?']], ['Sina oled matkakorraldaja.', ['Matk: 14.–16. juuni', 'Päevas umbes 40 kilomeetrit', 'Hind 120 eurot: toit, telgikoht, juhendaja', 'Ratta rent 15 eurot päevas', 'Kaasa: magamiskott, vihmariided, kiiver']], [240, 300]),
    'Õpetaja kaart: õpetaja on vastaja. Teises voorus vahetage rollid: õpetaja helistab kuulutuse peale „Kitarritunnid algajatele” ja küsib aega, hinda, kohta, kestust ja seda, kas oma pill on vajalik; õpilane mõtleb vastused ise välja. Hinda, kas kõik küsimused on esitatud ja kas küsimused on õigesti moodustatud.'),
  teach(B.speaking('ee1_s_3', '3. ülesanne. Arutle ja otsusta.', 'Õpetaja annab teema. Räägi oma vaatenurgast, seejärel arutlete ja jõuate ühisele otsusele.', ['Teema: Kuidas võiks teie linn või vald saada rohkem inimesi rattaga sõitma?', 'Mõtle: rattateed, rattaparklad, ohutus, ilm, raha.', 'Poolt ja vastu: kas autodele tuleks kesklinnas parkimine tasuliseks muuta?', 'Lõpuks: leppige kokku üks kõige parem ettepanek ja põhjendage, miks.'], [240, 360]),
    'Õpetaja kaart: ole partner, kellel on vastupidine arvamus (näiteks „autoga on mugavam”). Anna õpilasele võimalus vastu vaielda ja küsi „Aga kui…?”. Ülesande lõpus peab olema üks selge ühine otsus.'),
  ((b) => ({ ...b, data: { ...b.data, scale: 'E9S', instruction: 'E-eksamil hindavad suulist osa kaks hindajat tervikuna skaalal 0–10; proovieksamil annab õpetaja mõlemad hinnangud (või hindab koos kolleegiga).', criteria: RUBRIC_SCALES.E9S.criteria } }))(B.rubricSpeaking('ee1_s_rubric', 'Hindamine: suuline osa (20 punkti).')),
];

export const LESSONS = {
  'a2b1-ee1-w': {
    title: `${TITLE} · I Kirjutamine`,
    canDo: 'Ma kirjutan e-eksami vormis vastuse sõbra kirjale (umbes 100 sõna) ja kokkuvõtte diagrammi põhjal (umbes 160 sõna) 70 minutiga.',
    // an exam sheet (meta.exam 'E9'): the part's own minutes and format, not the lesson norms (engine/examMode.js)
    assessment: true, exam: 'E9',
    goals: { g_use: 'Õpilane kirjutab vastuse kirjale, mis vastab igale märkmele, ja diagrammi põhjal kokkuvõtte koos analüüsi, oma eelistuse ja ettepanekuga.', g_notice: 'Õpilane kasutab kirjutades õigesti sidesõnu, sõnajärge ja arvude kirjeldamise väljendeid.' },
    phases: part('I osa · Kirjutamine (70 min)', 'Kaks kirjutamisülesannet arvutis, sõnaloenduriga. Hindab õpetaja: 20 punkti.'),
    discover: WRITING,
  },
  // the listening and reading parts: every exam item, item 0 included, is auto-checked with a „why” (eeksamKey.js)
  'a2b1-ee1-l': {
    title: `${TITLE} · II Kuulamine`,
    canDo: 'Ma saan aru arvamustest, monoloogist, lühikestest teadetest ja intervjuust ning kirjutan kuuldu põhjal lünka sõna või arvu.',
    assessment: true, exam: 'E9',
    goals: { g_listen: 'Õpilane saab aru kuulamistekstide põhimõttest ja detailidest (5 ülesannet, 35 küsimust) ning saab vähemalt 60 % õigeid vastuseid.' },
    phases: part('II osa · Kuulamine (50 min)', 'Viis kuulamisülesannet, 35 küsimust, iga tekst kaks korda: 20 punkti.'),
    discover: LISTENING,
  },
  'a2b1-ee1-r': {
    title: `${TITLE} · III Lugemine ja struktuur`,
    canDo: 'Ma loen e-eksami vormis vestlust, teabeteksti, artiklit ja jutustust ning valin, sobitan ja moodustan õigeid sõnavorme.',
    assessment: true, exam: 'E9',
    goals: { g_read: 'Õpilane mõistab tekstide põhimõtet, detaile ja tekstisiseseid seoseid (ülesanded 2.1–2.4, 35 küsimust).', g_notice: 'Õpilane valib ja moodustab õigeid sõnavorme ning sobitab lauseosi (ülesanded 2.5–2.7, 30 küsimust).' },
    phases: part('III osa · Lugemine ja keele struktuur (95 min)', 'Seitse ülesannet, 65 küsimust: lugemine 20 punkti, keele struktuur 20 punkti.'),
    discover: READING,
  },
  'a2b1-ee1-s': {
    title: `${TITLE} · Suuline osa`,
    canDo: 'Ma räägin endast, avaldan põhjendatud arvamust, küsin kuulutuse kohta infot ja arutlen, kuni jõuame ühisele otsusele.',
    oral: true,
    goals: { g_use: 'Õpilane räägib endast, avaldab ja põhjendab arvamust, küsib ja annab infot ning arutleb, kuni jõutakse ühisele otsusele.' },
    phases: part('Suuline osa (õpetajaga, umbes 15 min)', 'Tehakse koos õpetajaga, mitte arvutis: sissejuhatus ja kolm ülesannet, 20 punkti.'),
    discover: ORAL,
  },
};
