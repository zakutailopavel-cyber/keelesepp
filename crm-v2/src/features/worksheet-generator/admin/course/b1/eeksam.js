// B1 course (A2 → B1), supplement „B1 proovieksam (e-eksami vormis)”: mock 1 in the format of the new computer-based
// basic-school exam „eesti keel teise keelena” (EIS e-exam from spring 2027; format contract docs/EXAM_9KL_E_EKSAM.md).
// Owner 2026-11-18: „вот это новый экзамен который будет” + „и такие же задания сделай в курсе у нас, чтобы давать
// пробник B1 ученикам” — so the mock is a B1 mock for any B1 learner (teens and adults), not only for 9th-graders.
// One lesson per exam part, so a teacher assigns each part on its own day like the real exam:
//   a2b1-ee1-w  I osa  Kirjutamine          70 min, 2 tasks, 20 p (teacher marks: 2 × (sisu 0–5 + keel 0–5))
//   a2b1-ee1-l  II osa Kuulamine            50 min, 5 tasks / 35 items, 20 p (auto-checked, „why” per item)
//   a2b1-ee1-r  III osa Lugemine ja struktuur 95 min, 7 tasks / 65 items, 40 p (auto-checked, „why” per item)
//   a2b1-ee1-s  Suuline osa — with the teacher, not on the computer (teacher card + rubric)
// Item counts as in Harno's sample test and the 2026/27 specification (35 + 65 items). Every text is written for
// KeeleSepp; nothing is copied from Harno. Real facts carry their source; the people in the recordings are invented.
// Where our engine lacks the e-exam interaction the closest block is used; EXAM_9KL_E_EKSAM.md §4 says which block each
// item waits for (drag from a bank, pictures of speakers, pie chart, exam timer, plays limit).
// Listening: recorded with Neurokõne (tools/listening-audio/build.mjs, listeningAudio.json); after a transcript edit run it again.
import { B, teach } from '../blocks.js';

export { EXPLAIN } from './eeksamKey.js';

export const MODULE = { id: 'a2b1-eeksam-01', course: 'b1', title: 'B1 proovieksam (e-eksami vormis)', level: 'B1', supplement: true };

const TITLE = 'B1 proovieksam (e-eksami vormis) 1';
// a part's sheet label in Õppevara (one sheet per lesson: the part itself)
const part = (label, subtitle) => ({ discover: { label, slot: 1, subtitle } });
// The e-exam shows every task's item 0 solved. Our solved example (block.opts.example) is against the B1 level norm
// (didacticCheck „example”), so item 0 stands solved in the instruction and is not an item of the block: the item counts
// are the e-exam's scored items (35 + 65). EXAM_9KL_E_EKSAM.md §4: „example item 0 in exam sheets”.

// the e-exam's matching with a letter per item (speakers ↔ statements A–I): a 3-option exam listening whose options
// are the letters, in their order; the statements stand above it (needs block „speaker match”, EXAM_9KL_E_EKSAM.md §4)
const LETTERS = 'ABCDEFGHIJ';
function letterListen(id, title, instruction, transcript, statements, rows) {
  const letters = LETTERS.slice(0, statements.length).split('');
  const block = B.examListen(id, title, instruction, 'choice', transcript, rows.map(([who]) => [who, 'A', 'B', 'C']), 'g_listen');
  // every speaker offers the same statements A–I in their order (the e-exam: a dropdown of letters beside the photo)
  const options = (answer) => letters.map((l, i) => `${l === answer ? '*' : ''}${l} — ${statements[i]}`).join('\n');
  return { ...block, opts: { keepOrder: true }, data: { ...block.data, questions: rows.map(([who, answer]) => ({ q: who, options: options(answer) })) } };
}

// the 9th-grade e-exam's writing scale (eristuskiri 2026/27 §6.1): task fulfilment and content 0–5 + language 0–5
export const rubric9 = (id, title, task) => {
  const b = B.rubricW2(id, title);
  return { ...b, data: { ...b.data, scale: 'custom', instruction: 'Kaks kriteeriumi, kumbki 0–5 punkti (e-eksami hindamisskaala).', criteria: [
    { name: `Ülesande täitmine ja sisu: ${task}`, max: 5, hint: 'kõik punktid on kirjas ja arendatud; pikkus vastab nõudele; vorm sobib' },
    { name: 'Keelekasutus', max: 5, hint: 'sõnavara, grammatika, õigekiri, lauseehitus, sidusus; vead ei sega mõistmist' },
  ] } };
};

// ---------------------------------------------------------------- I osa · Kirjutamine
const WRITING = [
  B.text('ee1_w_intro', 'I osa · Kirjutamine', 'Selles osas on **kaks ülesannet**. Mõlema ülesande jaoks on aega kokku **70 minutit** ja osa eest saab kuni **20 punkti** (kumbki ülesanne 10 punkti: sisu 0–5 ja keel 0–5). Kirjuta vastus kasti; sõnaloendur näitab, mitu sõna oled kirjutanud. Esimene ülesanne on umbes 100 sõna, teine umbes 160 sõna. Jaga aeg nii: 25 minutit esimesele, 40 minutit teisele ja 5 minutit kontrollimiseks. Pärast esitamist hindab teksti õpetaja.'),
  B.examWriting('ee1_w_1', '1. ülesanne. Vasta sõbra kirjale.', 'Loe sõbra kirja ja märkmeid (→). Kirjuta vastus, milles vastad kõigile märkmetele. Teksti pikkus on umbes 100 sõna.', 'vastus', {
    situation: [
      'Kujuta ette, et käisid eelmisel laupäeval oma linnas **muuseumiööl**: sel õhtul on paljud muuseumid hiliste õhtutundideni lahti ja pakuvad erilisi tegevusi. Sinu sõber Kris ei saanud tulla ja saatis sulle e-kirja.',
      '',
      '> **Teema:** Muuseumiöö',
      '> Tere! Kuulsin, et sa käisid laupäeval muuseumiööl. Kus sa käisid ja kellega? **→ Vasta.**',
      '> Mina pidin õega kodus olema. Ausalt öeldes ei saa ma aru, miks keegi tahab õhtul muuseumis käia. Muuseumid on ju igavad! **→ Pole sellega nõus!**',
      '> Mis sulle kõige rohkem meeldis? **→ Vasta, mis oli kõige huvitavam.**',
      '> Järgmisel aastal tahaksin ka tulla. Mida sa mulle soovitad? **→ Anna kaks nõuannet.**',
      '> Kirjuta varsti! Kris',
    ],
    points: ['kus ja kellega sa muuseumiööl käisid', 'miks sa ei ole nõus, et muuseumid on igavad', 'mis oli kõige huvitavam', 'kaks nõuannet Krisile järgmiseks aastaks'],
    words: [80, 120], opening: 'Tere, Kris!',
  }),
  B.chart('ee1_w_chart', 'Kuidas jõuad tavaliselt kooli või tööle?', { kind: 'bar', unit: '%', rows: ['Bussi või trammiga | 31', 'Autoga | 29', 'Jala | 26', 'Ratta või tõukerattaga | 11', 'Muul viisil | 3'], source: 'linna kohaliku ajalehe küsitlus, 1200 vastajat (väljamõeldud andmed)' }),
  B.planning('ee1_w_plan', 'Mustand: plaan enne kirjutamist (ei hinnata).', 'Kirjuta 2. ülesande jaoks märksõnad. Plaan aitab hoida kõik neli punkti tekstis ja jagada teksti lõikudeks.', ['1. lõik: mida diagramm näitab? (kõige rohkem, kõige vähem, umbes kolmandik)', '2. lõik: miks sõidetakse autoga? (kaks põhjust)', '3. lõik: kuidas mina liigun ja miks?', '4. lõik: mida võiks linn teha? (üks-kaks ettepanekut)'], 2),
  B.examWriting('ee1_w_2', '2. ülesanne. Kirjuta kokkuvõte.', 'Loe ülesannet ja vaata diagrammi. Kirjuta tulemuste põhjal tekst. Teksti nõutav pikkus on umbes 160 sõna.', 'kokkuvote', {
    situation: 'Kohalik ajaleht korraldas küsitluse, milles osales 1200 inimest. Nad vastasid küsimusele „Kuidas jõuad tavaliselt kooli või tööle?”. Tulemused on diagrammil. Kirjuta tulemuste põhjal tekst, milles:',
    points: ['tee vastustest kokkuvõte;', 'analüüsi, miks nii paljud sõidavad autoga;', 'kirjuta, kuidas sina eelistad liikuda ja miks;', 'arutle, kuidas võiks linn saada rohkem inimesi rattaga sõitma.'],
    words: [130, 190],
  }),
  rubric9('ee1_w_r1', 'Hindamine: 1. ülesanne (10 punkti).', 'vastus kõigile neljale märkmele, kirja vorm'),
  rubric9('ee1_w_r2', 'Hindamine: 2. ülesanne (10 punkti).', 'kokkuvõte, analüüs, oma eelistus ja ettepanek'),
  B.rubric('ee1_w_check', 'Enne esitamist kontrolli.', 'Loe mõlemad tekstid veel kord läbi ja märgi, mis on tehtud.', ['Esimeses kirjas on pöördumine, vastus kõigile neljale märkmele ja lõputervitus.', 'Teises tekstis on kõik neli punkti, numbrid diagrammilt ja oma arvamus koos põhjusega.', 'Pikkus: umbes 100 ja umbes 160 sõna (sõnaloendur).', 'Tegusõna on lauses teisel kohal; pärast koma ja sidesõna (et, sest, kuigi) on lause õige.']),
  B.selfcheck('ee1_w_self', ['Oskan vastata sõbra kirjale nii, et vastan igale märkmele.', 'Oskan kirjeldada diagrammi arvudega (kolmandik, ligi pooled, kõige vähem).', 'Oskan oma arvamust põhjendada ja teha ettepaneku.'], 'Kirjutamine'),
];

// ---------------------------------------------------------------- II osa · Kuulamine
const L11_STATEMENTS = [
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

const LISTENING = [
  B.text('ee1_l_intro', 'II osa · Kuulamine', 'Selles osas on **viis ülesannet ja 35 küsimust**. Aega on **50 minutit** ja osa eest saab kuni **20 punkti**. Iga teksti kuuled **kaks korda**: esimesel korral märgi vastus, teisel korral kontrolli. Iga ülesande näidis (0) on lahendatud ülesande juhendis ja see on salvestisel esimesena. Pärast esitamist näed oma punkte, vigu ja seda, miks õige vastus on õige.'),
  B.rubric('ee1_l_before', 'Enne kuulamist: kuidas kuulata eksamil.', 'Loe need nipid läbi ja märgi, mida kavatsed teha.', ['Loen enne iga teksti küsimused ja vastusevariandid läbi ning jooni alla võtmesõnad.', 'Esimesel kuulamisel märgin vastuse, teisel kuulamisel kontrollin seda.', 'Numbrid, nimed ja arvud kirjutan kohe märkmetesse.', 'Kui vastus jääb kuulmata, lähen rahulikult edasi ja vastan teisel kuulamisel.']),
  letterListen('ee1_l_11', '1.1. Kuula erinevate inimeste arvamusi.', 'Mida arvavad inimesed lugemisest? Vali igale kõnelejale sobiv väide. Kaks väidet jääb üle. Näidis (0): Helen laenutab raamatuid (D). Kuuled kaks korda.', [
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
  ], L11_STATEMENTS, [['Milline väide sobib 1. kõnelejaga, kelle nimi on Rasmus?', 'A'], ['Milline väide sobib 2. kõnelejaga, kelle nimi on Kadri?', 'E'], ['Milline väide sobib 3. kõnelejaga, kelle nimi on Martin?', 'B'], ['Milline väide sobib 4. kõnelejaga, kelle nimi on Laura?', 'I'], ['Milline väide sobib 5. kõnelejaga, kelle nimi on Toomas?', 'C'], ['Milline väide sobib 6. kõnelejaga, kelle nimi on Grete?', 'G']]),
  B.examListen('ee1_l_12', '1.2. Kuula monoloogi ja vasta küsimustele.', 'Kuula vabatahtliku merepäästja Kertu juttu. Igale küsimusele on üks õige vastus. Kuuled kaks korda. Näidis (0): Kertu töötab päeval raamatupidajana.', 'choice', [
    'Tere! Minu nimi on Kertu ja ma olen vabatahtlik merepäästja Saaremaal. Päeval töötan raamatupidajana, aga umbes kaks korda kuus olen valves. See tähendab, et kui merel juhtub midagi, helistatakse mulle ja ma pean kümne minutiga sadamas olema.',
    'Merepäästjaks sain ma juhuslikult. Kuus aastat tagasi läksime sõbraga purjekaga merele ja ilm läks äkki halvaks. Mootor ei käivitunud ja me ei saanud ise kaldale. Meid tulid aitama vabatahtlikud päästjad. Kui olime kaldal, küsisin neilt, kas ka mina võiksin nendega liituda. Nad naersid ja ütlesid, et muidugi, aga enne tuleb palju õppida.',
    'Esimene aasta oli tõesti raske. Õppisime esmaabi, navigeerimist ja seda, kuidas inimest veest paati tõmmata. Kõige raskem oli minu jaoks ujumiskatse külmas vees. Vesi oli ainult kaheksa kraadi! Pärast seda katset ma enam merd ei kartnud.',
    'Meie meeskonnas on kaksteist inimest: õpetaja, kaks kalurit, poemüüja, üliõpilane ja isegi üks pensionär. Vanus ei ole tähtis. Tähtis on see, et inimene on terve ja jõuab valves olla.',
    'Kõige sagedamini aitame me kalureid ja paadisõitjaid, kelle mootor on katki läinud. Suvel tuleb ette ka seda, et lapsed on täispuhutava madratsiga liiga kaugele triivinud. Eelmisel aastal oli meil kokku nelikümmend väljakutset.',
    'Raha me selle töö eest ei saa. Paadi ja varustuse ostmiseks kogume annetusi ja küsime toetust vallalt. Minu pere pidi alguses harjuma sellega, et ma võin keset sünnipäeva äkki minema joosta. Nüüd on mu poeg kümneaastane ja ütleb uhkusega, et ema on päästja.',
    'Kui keegi tahaks meiega liituda, siis kõige tähtsam on soov aidata. Kõike muud saab õppida.',
  ], [
    ['Kui kiiresti peab Kertu valves olles sadamas olema?', 'Kümne minutiga.', 'Poole tunniga.', 'Viie minutiga.'],
    ['Miks otsustas Kertu kuus aastat tagasi merepäästjaks hakata?', 'Teda ennast oli kord merel päästetud.', 'Tema isa oli merepäästja.', 'Ta nägi ajalehes kuulutust.'],
    ['Mis oli Kertu jaoks esimesel õppeaastal kõige raskem?', 'Ujumiskatse külmas vees.', 'Esmaabi õppimine.', 'Navigeerimine kaardi järgi.'],
    ['Millised inimesed on Kertu kaheteistliikmelises meeskonnas?', 'Eri vanuse ja ametiga inimesed.', 'Ainult kalurid.', 'Ainult noored üliõpilased.'],
    ['Keda aitavad Saaremaa vabatahtlikud merepäästjad kõige sagedamini merel?', 'Kalureid ja paadisõitjaid, kelle mootor on rikkis.', 'Lapsi, kes ei oska ujuda.', 'Turiste, kes on metsa ära eksinud.'],
    ['Kust saavad päästjad raha paadi ja varustuse ostmiseks?', 'Annetustest ja valla toetusest.', 'Nad maksavad kõik ise.', 'Raha annab riik.'],
    ['Mida arvab Kertu kümneaastane poeg ema vabatahtlikust tööst?', 'Ta on uhke, et ema on päästja.', 'Ta tahab ka ise päästjaks saada.', 'Ta ei ole rahul, et ema on tihti ära.'],
  ], 'g_listen'),
  B.examListen('ee1_l_13', '1.3. Kuula kõnelõike ja vasta küsimustele.', 'Kuula seitset lühikest kõnelõiku. Igale küsimusele on üks õige vastus. Iga lõiku kuuled kaks korda. Näidis (0) on raadiouudis: linnavalitsuse arvates on rattakohti ikka **liiga vähe**.', 'choice', [
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
  ], [
    ['Miks helistati hambaravist patsiendile päev enne vastuvõttu?', 'Vastuvõtu aeg tuleb muuta.', 'Arve on maksmata.', 'Vastuvõtt algab varem.'],
    ['Mida palutakse lapsevankri või ratastooliga külastajatel teha?', 'Kasutada teist lifti.', 'Kasutada treppi.', 'Oodata, kuni lift korda saab.'],
    ['Mida otsustab Mart pärast sõbra küsimust teha?', 'Küsida vanaemalt, kas ta tahab kontserdile tulla.', 'Müüa oma pilet sõbrale.', 'Jääda kindlasti koju.'],
    ['Mis võib homme autojuhtidele kõige ohtlikum olla?', 'Libedad teed.', 'Tugev vihm.', 'Paks udu.'],
    ['Kust tuli Mial idee teha vanast riidest kotte?', 'Vanaema soovitas vanast riidest midagi uut teha.', 'Ta nägi poes sarnast kotti.', 'Ta õppis seda koolis.'],
    ['Mida soovitab lektor teha öösel enne eksamit?', 'Magada, mitte terve öö õppida.', 'Õppida, sest öösel on vaikne.', 'Korrata kõike veel kord hommikul.'],
    ['Kuidas toimib laupäevane vahetusturg kultuurimaja hoovis?', 'Toodud asja eest saab võtta mõne teise asja.', 'Riideid müüakse poole hinnaga.', 'Katkised riided parandatakse kohapeal.'],
  ], 'g_listen'),
  B.examListen('ee1_l_14', '1.4. Kuula intervjuud: õige või vale?', 'Kuula intervjuud talgupäeva korraldajaga. Kas väide on õige või vale? Kuuled kaks korda. Näidis (0): „Anu korraldab talgupäeva esimest korda.” — **vale**.', 'truefalse', [
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
    ['2008. aasta koristuspäeval osales umbes viiskümmend tuhat inimest.', true],
    ['Anu käis esimesel suurel koristuspäeval koos oma isaga.', true],
    ['Maailmakoristuspäev toimub igal aastal mais.', false],
    ['Anu vallas korjatakse talgutel nüüd rohkem prügi kui varem.', false],
    ['Talgutel tehakse ka muid töid peale koristamise.', true],
    ['Kõige rohkem tuleb talgutele teismelisi.', false],
    ['Vihmase ilmaga tuleb talgutele vähem inimesi.', true],
  ], 'g_listen'),
  B.listening('ee1_l_15', '1.5. Kuula monoloogi ja täida lüngad.', 'Kuula matkajuhti ja kirjuta lünka sobiv sõna või arv. Näidis (0): Soomaa rahvuspark loodi **1993**. aastal. Kuuled kaks korda.', [
  'Tere! Olen matkajuht Joonas ja täna räägin teile Soomaa rahvuspargist. Soomaa asub Pärnumaal ja Viljandimaal ning rahvuspark loodi 1993. aastal.',
  'Soomaa on kuulus oma suurte soode ja rabade poolest, aga eriti tuntud on siinne viies aastaaeg. Nii nimetatakse aega kevadel, kui lumi sulab ja jõed tulevad üle kallaste. Siis saab mõnes kohas paadiga sõita seal, kus suvel kasvab heinamaa. Mõni pere jõuab siis koju ainult kanuuga.',
  'Kõige parem viis Soomaad tundma õppida on minna rabamatkale. Me jalutame laudteel, aga matkajad võivad proovida ka rabakingi. Need on laiad jalanõud, millega saab astuda pehmele samblale ja mitte sisse vajuda.',
  'Tavaline matk kestab umbes neli tundi ja selle pikkus on seitse kilomeetrit. Kaasa tasub võtta vihmajope, sest ilm muutub rabas kiiresti, ja kindlasti ka joogivett. Juunis ja juulis kulub ära sääsevastane vahend. Lastega peredele soovitame lühemat, kahekilomeetrist matka.',
  'Matkale tuleb end eelnevalt registreerida meie kodulehel. Ühes rühmas on kuni viisteist inimest. Kohtume külastuskeskuse parklas kell kümme hommikul.',
], [
  'Soomaa on kuulus oma soode ja [rabade] poolest.',
  'Kevadel, kui lumi sulab, tulevad [jõed] üle kallaste.',
  'Mõni pere jõuab üleujutuse ajal koju ainult [kanuuga].',
  'Rabakingad on [laiad] jalanõud, millega ei vaju samblasse.',
  'Tavaline matk kestab umbes [neli|4] tundi.',
  'Matka pikkus on [seitse|7] kilomeetrit.',
  'Juunis ja juulis kulub matkal ära [sääsevastane] vahend.',
  'Ühes rühmas on kuni [viisteist|15] inimest.',
], 'g_listen'),
  B.planning('ee1_l_notes', 'Märkmed (ei hinnata).', 'Siia võid kuulamise ajal kirjutada märksõnu, numbreid ja nimesid.', ['1.1 ja 1.2', '1.3 ja 1.4', '1.5'], 3),
  B.rubric('ee1_l_after', 'Pärast kuulamist: mis aitas?', 'Märgi, mida sa kuulamise ajal tegid, ja kirjuta üks asi, mida järgmisel proovieksamil teisiti teed.', ['Lugesin enne igat teksti küsimused läbi.', 'Esimesel kuulamisel märkisin vastuse, teisel kontrollisin.', 'Kirjutasin numbrid ja nimed kohe üles.', 'Ühe kuulmata vastuse pärast ei jäänud ma kinni.']),
  B.selfcheck('ee1_l_self', ['Saan aru, mida eri inimesed ühe teema kohta arvavad.', 'Leian monoloogist ja intervjuust olulised detailid.', 'Kirjutan kuuldud sõna või arvu õigesti lünka.'], 'Kuulamine'),
];

// ---------------------------------------------------------------- III osa · Lugemine ja keele struktuur
const READING = [
  B.text('ee1_r_intro', 'III osa · Lugemine ja keele struktuur', 'Selles osas on **seitse ülesannet ja 65 küsimust**. Aega on **95 minutit** ja osa eest saab kuni **40 punkti**: lugemine (ülesanded 2.1–2.4) 20 punkti ja keele struktuur (2.5–2.7) 20 punkti. Iga ülesande näidis (0) on juba täidetud. Jaga aeg: umbes 13 minutit ülesande kohta ja 5 minutit lõpus kontrollimiseks. Kui mõni lünk on raske, jäta see vahele ja tule hiljem tagasi. Pärast esitamist näed oma punkte, vigu ja selgitusi.'),
  B.bankText('ee1_r_21', '2.1. Täienda telefonivestlust.', 'Sandra helistab sõbrale Erikule. Vali Eriku repliigid loendist (A–H) ja pane iga lünga juurde õige täht. Kaks repliiki jääb üle. Esimene repliik (0) on näidis.', 'Laupäevane plaan', [
    '**Sandra:** Tere, Erik! Kas sul on hetk aega?',
    '',
    '**Erik:** (0) *Tere! On küll, istun just bussis ja sõidan koju. Mis juhtus?*',
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
    '',
    '**Erik:** [[Sobib! Ostan rongipiletid juba täna ära.]]',
    '',
    '**Sandra:** Aitäh! Kuni laupäevani!',
  ], ['Kahjuks olen laupäeval tööl ja ei saa kuhugi minna.', 'Sinna sõidab buss otse meie maja eest iga poole tunni tagant.']),
  // the e-exam drags each word from the bank into the running text; here the text is one sentence a line and a tap puts
  // the bank word into the gap (needs „bank text with drag”, EXAM_9KL_E_EKSAM.md §4)
  B.gaps('ee1_r_22', '2.2. Loe teksti ja täida lüngad sõnapanga abil.', 'Loe teksti „Eesti Rahva Muuseum” ja vali sõnapangast igasse lünka sobiv sõna. Neli sõna jääb üle. Näidis (0) on esimeses lauses: muuseum **asub** Tartus.', [
    'Eesti Rahva Muuseum (0) **asub** Tartus. Muuseum loodi juba 1909. aastal, kui Eesti oli veel Vene [impeeriumi] osa.',
    'Muuseumi rajajad tahtsid koguda ja [hoida] seda, mis on eesti rahvale tähtis: rahvariideid, tööriistu, laule ja lugusid.',
    'Pikka aega ei olnud muuseumil oma [maja] ja paljud esemed ei olnud külastajatele nähtavad.',
    'Uus hoone avati alles 2016. aasta sügisel Raadil, endise lennuvälja [kõrval].',
    'Hoone katus tõuseb nagu stardirada taeva [poole].',
    'Püsinäitus „Kohtumised” räägib inimeste elust Eesti alal läbi [tuhandete] aastate.',
    'Teine püsinäitus, „Uurali kaja”, tutvustab soome-ugri [rahvaid], kelle keeled on eesti keelega sugulased.',
    'Muuseumis toimuvad ka kontserdid ja töötoad, kus saab näiteks [õppida] vanu käsitöövõtteid.',
    'Kui te Tartusse satute, [tasub] muuseumi kindlasti külastada.',
    'Arvestage aga sellega, et ühe päevaga ei jõua kõike [näha].',
  ], 'hoida, hoidma, impeeriumi, impeeriumist, kaugel, kõrval, maja, näevad, näha, poole, rahvaid, tasub, tuhandete, õppida', 'full', 'g_read'),
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
  B.choice('ee1_r_23', '2.3. Vali õige vastus.', 'Loe artiklit ja küsimusi. Igale küsimusele on üks õige vastus. Näidis (0): mitu tundi und soovitatakse 13–18-aastastele? — **8–10 tundi**.', [
    ['Kui palju und soovitatakse täiskasvanutele?', 'Vähemalt seitse tundi.', '8–10 tundi.', 'Kuni kuus tundi.'],
    ['Miks on noortel õhtul raske magama jääda?', 'Unehormoon hakkab neil tekkima hiljem kui lastel.', 'Nad on laisad ja neil on halvad harjumused.', 'Nad joovad õhtul liiga palju vett.'],
    ['Mida on mõnes riigis tehtud?', 'Koolipäev algab hiljem.', 'Telefonid on koolis keelatud.', 'Koolipäev on lühem.'],
    ['Milles on ekraanide puhul sageli peamine probleem?', 'Neid on raske käest panna.', 'Nende valgus on liiga ere.', 'Need on liiga kallid.'],
    ['Mis juhtub sportlastega, kes magavad vähe?', 'Nad saavad sagedamini vigastada.', 'Nad jooksevad kiiremini.', 'Nad unustavad treeningu ära.'],
    ['Mida soovitavad unearstid?', 'Ärgata iga päev umbes samal ajal.', 'Magada nädalavahetusel kaua.', 'Juua õhtul tassi kohvi.'],
    ['Milline peaks olema magamistuba?', 'Jahe, pime ja vaikne.', 'Soe ja valge.', 'Vaikne, aga valgustatud.'],
    ['Miks ei aita nädalavahetusel kaua magamine?', 'Pühapäeva õhtul on siis raske uinuda.', 'Nädalavahetusel on liiga palju tegemist.', 'Pikk uni teeb inimese haigeks.'],
    ['Mis on artikli peamine mõte?', 'Parem on magada iga päev piisavalt kui hiljem und tasa teha.', 'Noored on unepuuduses ise süüdi.', 'Ekraanid on une ainus vaenlane.'],
  ], 'full', 'g_read'),
  // the e-exam drags the text parts into the running text; here one sentence a line and a tap puts the part into the gap
  B.gaps('ee1_r_24', '2.4. Pane tekstiosad lünkadesse.', 'Loe jutustust „Minu laupäevad varjupaigas” ja vali loendist igasse lünka sobiv tekstiosa. Kaks tekstiosa jääb üle. Näidis (0) on esimeses lauses.', [
    'Olin juba ammu tahtnud loomadega töötada, aga kodus meil lemmikloomi pidada ei saa, (0) *sest isal on kassiallergia*. Kirjutasin loomade varjupaigale ja juba järgmisel päeval [helistati mulle tagasi].',
    'Esimesel päeval võttis mind vastu Marika, [kes töötab varjupaigas juba kümme aastat].',
    'Ta selgitas, et koertega jalutamine ei ole nii lihtne, [kui ma arvasin].',
    'Minu esimene ülesanne oli puurid puhtaks teha. See ei olnud üldse romantiline, [aga keegi peab ka seda tegema].',
    'Pärast lõunat lubas Marika mul lõpuks [minna jalutama vana koera Kustiga].',
    'Kusti kõndis rahulikult minu kõrval, nagu oleksime [olnud sõbrad terve elu].',
    'Kõige rohkem üllatas mind see, [kui palju inimesi varjupaika aitab].',
    'Üks tõi toitu, teine vanu tekke, kolmas tuli koeri pildistama, [et neile kiiremini uus kodu leida].',
    'Õhtul koju jõudes olin väsinud, [kuid väga õnnelik].',
    'Kusti leidis kuu aega hiljem uue pere, [mis tegi mind ühtaegu kurvaks ja rõõmsaks].',
  ], 'aga keegi peab ka seda tegema, et koerad ei vaja jalutamist, et neile kiiremini uus kodu leida, helistati mulle tagasi, kes töötab varjupaigas juba kümme aastat, kuid väga õnnelik, kui ma arvasin, kui palju inimesi varjupaika aitab, kuigi ma ei tahtnud sinna üldse minna, minna jalutama vana koera Kustiga, mis tegi mind ühtaegu kurvaks ja rõõmsaks, olnud sõbrad terve elu', 'full', 'g_read'),
  B.adsmatch('ee1_r_25', '2.5. Lõpeta laused.', 'Vali igale lause algusele sobiv lõpp (A–K). Üks lause lõpp jääb üle. Näidis (0): Eelmisel kevadel otsustasin, **et hakkan iga päev rattaga sõitma**.', [
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
  ], [
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
  ], 'g_notice'),
  B.cloze('ee1_r_26', '2.6. Vali lünka sobiv sõna.', 'Loe teksti ja vali igasse lünka sobiv sõna. Näidis (0) on juba täidetud.', 'Lahtede maa', [
    'Lahemaa rahvuspark (0) **asub** Põhja-Eestis, Tallinnast umbes {*tunnise|tunni|tunniga} autosõidu kaugusel. Rahvuspark {*loodi|lõi|loob} 1971. aastal ja see oli Eesti {*esimene|esimest|esimesena} rahvuspark.',
    '',
    'Nimi Lahemaa tähendab lahtede maad, sest rannik on {*liigendatud|liigendama|liigendab} mitmeks poolsaareks ja laheks. Rahvuspargis on palju metsa, rabasid ja suuri rändrahne, {*mida|mis|kes} jää on kunagi Skandinaaviast kaasa toonud.',
    '',
    'Külastajaid {*meelitavad|meelitab|meelitama} ka vanad mõisad. Kõige tuntum neist on Palmse mõis, kus saab tutvuda {*mõisaeluga|mõisaelu|mõisaelus} 19. sajandil. Kui otsite rahulikumat kohta, {*minge|lähete|minna} Käsmu kaptenite külla.',
    '',
    'Rahvuspargis tuleb loodust {*hoida|hoidma|hoides}: prügi tuleb viia {*endaga|enda|endast} kaasa ja lõket võib teha ainult selleks ettenähtud kohtades.',
    '',
    '*Allikas: Keskkonnaamet, loodusegakoos.ee, „Lahemaa rahvuspark”.*',
  ], 'g_notice'),
  B.formtext('ee1_r_27', '2.7. Kirjuta lünka sõna õige vorm.', 'Loe teksti ja kirjuta lünka sõna õige vorm. Sulgudes on sõna algvorm; pane see sellisesse vormi, mis sobib teksti. Näidis (0) on juba täidetud.', 'Minu esimene palk', [
    'Eelmisel (0) **suvel** (suvi) töötasin esimest korda päris tööl. Sain koha [kohvikus] (kohvik) mere ääres, kus pidin hommikuti [kohvi] (kohv) keetma ja laudu koristama. Töö algas kell seitse, nii et [ärkasin] (ärkama) iga päev kell kuus.',
    '',
    'Kõige raskem oli meeles pidada kõigi [klientide] (klient) soove. Kuu lõpus sain oma esimese [palga] (palk). Tundsin end päris [täiskasvanuna] (täiskasvanu).',
    '',
    'Osa rahast panin hoiukontole, sest unistan [uuest] (uus) jalgrattast. Ülejäänud raha eest ostsin [emale] (ema) lilled ja käisin sõpradega [kinos] (kino). Järgmisel suvel tahaksin jälle [töötada] (töötama), aga juba mõnes teises kohas.',
  ]),
  B.rubric('ee1_r_after', 'Pärast lugemisosa: mis aitas?', 'Märgi, mida sa tegid, ja kirjuta üks asi, mida järgmisel proovieksamil teisiti teed.', ['Lugesin enne lünkade täitmist terve teksti läbi.', 'Kontrollisin, kas valitud sõna vorm sobib lausesse (kääne, pööre).', 'Jagasin aja: umbes 13 minutit ülesande kohta.', 'Raske lünga jätsin vahele ja tulin selle juurde hiljem tagasi.']),
  B.selfcheck('ee1_r_self', ['Leian tekstist põhimõtte ja olulised detailid.', 'Valin lünka sõna, mis sobib nii tähenduse kui ka vormi poolest.', 'Moodustan algvormist teksti sobiva vormi.'], 'Lugemine ja struktuur'),
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
  B.rubricSpeaking('ee1_s_rubric', 'Hindamine: suuline osa (20 punkti).'),
];

export const LESSONS = {
  'a2b1-ee1-w': {
    title: `${TITLE} · I Kirjutamine`,
    canDo: 'Ma kirjutan e-eksami vormis vastuse sõbra kirjale (umbes 100 sõna) ja kokkuvõtte diagrammi põhjal (umbes 160 sõna) 70 minutiga.',
    // the sheet is the exam part: 70 minutes by the exam, not the lesson norm of the time estimate
    assessment: true, shortSheet: true,
    goals: { g_use: 'Õpilane kirjutab vastuse kirjale, mis vastab igale märkmele, ja diagrammi põhjal kokkuvõtte koos analüüsi, oma eelistuse ja ettepanekuga.', g_notice: 'Õpilane kasutab kirjutades õigesti sidesõnu, sõnajärge ja arvude kirjeldamise väljendeid.' },
    phases: part('I osa · Kirjutamine (70 min)', 'Kaks kirjutamisülesannet arvutis, sõnaloenduriga. Hindab õpetaja: 20 punkti.'),
    discover: WRITING,
  },
  // the listening and reading parts: every exam item is auto-checked with a „why” (eeksamKey.js); a strategy checklist,
  // a notes box and the self-check around them are not scored
  'a2b1-ee1-l': {
    title: `${TITLE} · II Kuulamine`,
    canDo: 'Ma saan aru arvamustest, monoloogist, lühikestest teadetest ja intervjuust ning kirjutan kuuldu põhjal lünka sõna või arvu.',
    assessment: true,
    goals: { g_listen: 'Õpilane saab aru kuulamistekstide põhimõttest ja detailidest (5 ülesannet, 35 küsimust) ning saab vähemalt 60 % õigeid vastuseid.' },
    phases: part('II osa · Kuulamine (50 min)', 'Viis kuulamisülesannet, 35 küsimust, iga tekst kaks korda: 20 punkti.'),
    discover: LISTENING,
  },
  'a2b1-ee1-r': {
    title: `${TITLE} · III Lugemine ja struktuur`,
    canDo: 'Ma loen e-eksami vormis vestlust, teabeteksti, artiklit ja jutustust ning valin, sobitan ja moodustan õigeid sõnavorme.',
    // the part takes the exam's 95 minutes; the time estimate does not count the article of 2.3 (a text block) and so
    // stays under the lesson norm of 40 minutes
    assessment: true, shortSheet: true,
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
