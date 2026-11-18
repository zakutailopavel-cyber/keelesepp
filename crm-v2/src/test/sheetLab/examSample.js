// The e-exam's interactions in the sheet lab (docs/E_EXAM_ENGINE.md): /sheet-lab.html?set=eexam-w | eexam-l | eexam-r.
// The material is a short excerpt of KeeleSepp's own mock 1 (admin/course/b1/eeksam.js on the content branch), set up
// with the new options, so the engine can be seen and measured before the content agent switches the mock over.
// The recordings are the mock's files (public/audio/a2b1-ee1-l); without them the player shows that the file is missing.
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';

const meta = (title, subtitle) => ({ ...sampleDocument().meta, title, subtitle, level: 'B1', exam: 'E9', module: 'B1 proovieksam (e-eksami vormis)', canDo: '' });
const audio = (name) => ({ src: `/audio/a2b1-ee1-l/${name}.mp3`, name: `${name}.mp3` });
const block = (id, type, data, opts) => ({ id, type, width: 'full', span: 12, tone: { exampart: 'sky', examlisten: 'sky', examwriting: 'cream', chart: 'white', insertion: 'cream', cloze: 'cream', formtext: 'blue' }[type] || 'white', data, ...(opts ? { opts } : {}) });

const WRITING = [
  block('ee_w_part', 'exampart', { skill: 'W', exam: 'E9', part: 'I osa · Kirjutamine', minutes: 70, points: 20, tasks: 2, target: 60, lock: true, note: 'Kirjuta vastus kasti; sõnaloendur näitab, mitu sõna oled kirjutanud.' }),
  block('ee_w_1', 'examwriting', {
    title: '1. ülesanne. Vasta sõbra kirjale.', instruction: 'Loe ülesannet ja kirjuta selle järgi kõrvale kasti oma vastus.', genre: 'vastus', about: 'u 100 sõna',
    situation: 'Kujuta ette, et käisid eelmisel laupäeval oma linnas **muuseumiööl**. Sinu sõber Kris ei saanud tulla ja saatis sulle e-kirja. Vasta kõigile märkmetele.',
    letterSubject: 'Muuseumiöö',
    letter: [
      { text: 'Tere!' },
      { text: 'Kuulsin, et sa käisid laupäeval muuseumiööl. Kus sa käisid ja kellega?', note: 'Vastan' },
      { text: 'Mina pidin õega kodus olema. Ausalt öeldes ei saa ma aru, miks keegi tahab õhtul muuseumis käia. Muuseumid on ju igavad!', note: 'Pole sellega nõus!', side: 'left' },
      { text: 'Mis sulle kõige rohkem meeldis?', note: 'Vastan, mis oli kõige huvitavam' },
      { text: 'Järgmisel aastal tahaksin ka tulla. Mida sa mulle soovitad?', note: 'Annan kaks nõuannet', side: 'left' },
      { text: 'Kirjuta varsti! Kris' },
    ],
    points: '', opening: 'Tere, Kris!', closing: '', minWords: 80, maxWords: 120, lines: 12,
  }),
  block('ee_w_chart', 'chart', { chartTitle: 'Kuidas jõuad tavaliselt kooli või tööle?', kind: 'pie', unit: '%', series: '', rows: 'Bussi või trammiga | 34\nAutoga | 29\nJala | 26\nRatta või tõukerattaga | 11', source: 'Kohaliku ajalehe küsitlus, 1200 vastajat (väljamõeldud andmed)' }),
  block('ee_w_2', 'examwriting', {
    title: '2. ülesanne. Kirjuta kokkuvõte.', instruction: 'Loe ülesannet ja kirjuta kõrvale lahtrisse kokkuvõte.', genre: 'kokkuvote', about: 'u 160 sõna',
    situation: 'Kohalik ajaleht korraldas küsitluse, milles osales 1200 inimest. Kirjuta tulemuste põhjal tekst, milles', points: 'tee vastustest kokkuvõte;\nanalüüsi, miks nii paljud sõidavad autoga;\nkirjuta, kuidas sina eelistad liikuda ja miks;\narutle, kuidas võiks linn saada rohkem inimesi rattaga sõitma.',
    opening: '', closing: '', minWords: 130, maxWords: 190, lines: 16,
  }),
];

const CLAIMS = [
  'Ta loeb kõige rohkem bussis või rongis.', 'Ta eelistab raamatuid kuulata, mitte lugeda.', 'Tal ei ole praegu lugemiseks aega.', 'Ta laenutab raamatuid raamatukogust.',
  'Ta loeb raamatuid koos oma lapsega.', 'Tema arvates on lugemine igav.', 'Ta kirjutab ise jutte.', 'Ta loeb ainult eestikeelseid raamatuid, et keelt õppida.', 'Ta käib lugemisringis.',
];
const LISTENING = [
  block('ee_l_part', 'exampart', { skill: 'L', exam: 'E9', part: 'II osa · Kuulamine', minutes: 50, points: 20, tasks: 5, items: 35, target: 60, lock: true, note: 'Iga teksti kuuled kaks korda.' }),
  block('ee_l_11', 'examlisten', {
    title: '1.1. Kuula erinevate inimeste arvamusi.', instruction: 'Otsusta, milline lause sobib kõnelejaga kokku. Kaks lauset jääb üle. Kõige esimene lünk on näidis. *Vajuta lüngale ja vali sobiv vastus.*',
    mode: 'speakers', plays: 2, lockPlays: true, playGap: 10, audio: audio('ee1_l_11'), transcript: '', topic: 'Mida arvavad inimesed lugemisest?', claims: CLAIMS,
    speakers: [{ name: 'Helen', answer: 'D' }, { name: 'Rasmus', answer: 'A' }, { name: 'Kadri', answer: 'E' }, { name: 'Martin', answer: 'B' }, { name: 'Laura', answer: 'I' }, { name: 'Toomas', answer: 'C' }, { name: 'Grete', answer: 'G' }],
    explain: 'Helen laenutab raamatuid raamatukogust (D).\nRasmus loeb tööle sõites bussis (A).\nKadri loeb koos tütrega (E).\nMartin kuulab audioraamatuid (B).\nLaura käib lugemisringis (I).\nToomasel ei ole praegu aega (C).\nGrete kirjutab ise jutte (G).',
    questions: [], statements: [], pairs: [],
  }, { example: true }),
  block('ee_l_13', 'examlisten', {
    title: '1.3. Kuula kõnelõike ja vasta küsimustele.', instruction: 'Igale küsimusele on üks õige vastus. Kõige esimene kõnelõik on näidis. *Vastamiseks vajuta nupule sobiva vastuse ees.*',
    mode: 'choice', plays: 2, lockPlays: true, playGap: 10, audio: null, transcript: '',
    questions: [
      { situation: 'Kuuled katkendit raadiouudisest.', q: 'Mida arvab linnavalitsus rattakohtadest?', options: '*Neid on ikka liiga vähe.\nNeid on nüüd piisavalt.\nNeid ei ole vaja.' },
      { situation: 'Kuuled telefonisõnumit.', audio: audio('ee1_l_13'), q: 'Mida peab kuulaja tegema?', options: '*Helistama tagasi ja valima uue aja.\nTulema homme kell üheksa.\nOotama, kuni arst helistab.' },
      { situation: 'Kuuled teadaannet kaubanduskeskuses.', q: 'Mida palutakse lapsevankriga külastajatel teha?', options: '*Kasutada lifti peasissekäigu juures.\nOodata, kuni lift on parandatud.\nMinna trepist.' },
    ],
    statements: [], pairs: [],
  }, { example: true }),
  block('ee_l_14', 'examlisten', {
    title: '1.4. Kuula intervjuud: õige või vale?', instruction: 'Kuula intervjuud talgupäeva korraldajaga. Esimene väide on näidis.', mode: 'truefalse', plays: 2, lockPlays: true, audio: audio('ee1_l_14'), transcript: '',
    statements: [{ text: 'Anu korraldab talgupäeva esimest korda.', answer: 'false' }, { text: '2008. aasta koristuspäeval osales umbes viiskümmend tuhat inimest.', answer: 'true' }, { text: 'Maailmakoristuspäev toimub igal aastal mais.', answer: 'false' }, { text: 'Vihmase ilmaga tuleb talgutele vähem inimesi.', answer: 'true' }],
    questions: [], pairs: [],
  }, { example: true }),
];

const READING = [
  block('ee_r_part', 'exampart', { skill: 'R', exam: 'E9', part: 'III osa · Lugemine ja keele struktuur', minutes: 95, points: 40, tasks: 7, items: 65, target: 60, lock: true, note: '' }),
  block('ee_r_21', 'insertion', {
    title: '2.1. Täienda telefonivestlust.', instruction: 'Sandra helistab sõbrale Erikule. Kaks vastust jääb üle. Esimene vastus on näidis. *Vastamiseks vajuta sobival vastusel ja tõsta see vastusekasti.*', passageTitle: '', layout: 'chat',
    passage: '**Sandra:** Tere, Erik! Kas sul on hetk aega?\n\n**Erik:** [[Tere! On küll, istun just bussis ja sõidan koju. Mis juhtus?]]\n\n**Sandra:** Mõtlesin, et võiksime laupäeval matkama minna. Ilmateade lubab päikest.\n\n**Erik:** [[Hea mõte! Kuhu sa minna tahaksid?]]\n\n**Sandra:** Mulle meeldiks Viru raba. Sinna on Tallinnast umbes tunni tee.\n\n**Erik:** [[Viru raba on ilus, aga nädalavahetusel on seal väga palju inimesi.]]\n\n**Sandra:** Tõsi. Kas sul on parem ettepanek?\n\n**Erik:** [[Võiksime minna Pakri poolsaarele. Seal on kõrge pank ja meri.]]\n\n**Sandra:** Super! Kohtume laupäeval kell üheksa Balti jaamas.',
    extra: 'Kahjuks olen laupäeval tööl ja ei saa kuhugi minna.\nSinna sõidab buss otse meie maja eest iga poole tunni tagant.',
  }, { example: true }),
  block('ee_r_22', 'insertion', {
    title: '2.2. Loe teksti ja täida lüngad.', instruction: 'Kolm sõna jääb üle. Kõige esimene lünk on näidis. *Vali vastuste pangast lünka sobiv sõna. Vajuta sõna peale ja tõsta see lünka.*', passageTitle: 'Eesti Rahva Muuseum', layout: 'chips',
    passage: 'Eesti Rahva Muuseum [[asub]] Tartus. Muuseum loodi juba 1909. aastal, kui Eesti oli veel Vene [[impeeriumi]] osa. Muuseumi rajajad tahtsid koguda ja [[hoida]] seda, mis on eesti rahvale tähtis.\n\nUus hoone avati alles 2016. aasta sügisel Raadil, endise lennuvälja [[kõrval]]. Hoone katus tõuseb nagu stardirada taeva [[poole]]. Püsinäitus „Kohtumised” räägib inimeste elust Eesti alal läbi [[tuhandete]] aastate.',
    extra: 'hoidma\nimpeeriumist\nkaugel',
  }, { example: true }),
  block('ee_r_24', 'insertion', {
    title: '2.4. Pane tekstiosad lünkadesse.', instruction: 'Üks tekstiosa jääb üle. Esimene lünk on näidis.', passageTitle: 'Minu laupäevad varjupaigas', layout: 'chips',
    passage: 'Kodus meil lemmikloomi pidada ei saa, [[sest isal on kassiallergia]]. Kirjutasin loomade varjupaigale ja juba järgmisel päeval [[helistati mulle tagasi]].\n\nEsimesel päeval võttis mind vastu Marika, [[kes töötab varjupaigas juba kümme aastat]]. Ta selgitas, et koertega jalutamine ei ole nii lihtne, [[kui ma arvasin]].',
    extra: 'kuigi ma ei tahtnud sinna üldse minna',
  }, { example: true }),
  block('ee_r_26', 'cloze', {
    title: '2.6. Vali lünka sobiv sõna.', instruction: 'Esimene lünk on näidis.', passageTitle: 'Lahtede maa',
    passage: 'Lahemaa rahvuspark {*asub|asuvad|asuma} Põhja-Eestis, Tallinnast umbes {*tunnise|tunni|tunniga} autosõidu kaugusel. Rahvuspark {*loodi|lõi|loob} 1971. aastal ja see oli Eesti {*esimene|esimest|esimesena} rahvuspark.',
  }, { example: true, keepOrder: true }),
  block('ee_r_27', 'formtext', {
    title: '2.7. Kirjuta lünka sõna õige vorm.', instruction: 'Igas lüngas on antud sõna algvorm. Esimene lünk on näidis. *Vajuta lüngale ja kirjuta sinna sobiv vastus.*', passageTitle: 'Minu esimene palk', hint: 'inside',
    passage: 'Eelmisel [suvel] (suvi) töötasin esimest korda päris tööl. Sain koha [kohvikus] (kohvik) mere ääres, kus pidin hommikuti [kohvi] (kohv) keetma. Töö algas kell seitse, nii et [ärkasin] (ärkama) iga päev kell kuus.',
  }, { example: true }),
];

export const examSheets = {
  'eexam-w': () => ({ ...sampleDocument(), id: 'lab-eexam-w', meta: meta('B1 proovieksam (e-eksami vormis) 1', 'I osa · Kirjutamine'), blocks: WRITING }),
  'eexam-l': () => ({ ...sampleDocument(), id: 'lab-eexam-l', meta: meta('B1 proovieksam (e-eksami vormis) 1', 'II osa · Kuulamine'), blocks: LISTENING }),
  'eexam-r': () => ({ ...sampleDocument(), id: 'lab-eexam-r', meta: meta('B1 proovieksam (e-eksami vormis) 1', 'III osa · Lugemine ja keele struktuur'), blocks: READING }),
};
