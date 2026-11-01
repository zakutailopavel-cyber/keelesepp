// A2 course, supplement „Suuline osa”: see ../suuline.js. No tingiv kõneviis at this level.
import { oralLesson } from '../suuline.js';

export const MODULE = { id: 'a2-suuline-01', course: 'a2', title: 'Suuline osa', level: 'A2', design: 'v2', supplement: true };

const LEVEL = {
  talk: '1 minut',
  seconds: [45, 120],
  links: { why: 'sest, sellepärast, kuna', example: 'näiteks, minu kodus, minu töökohas', end: 'seega, nii et, kokkuvõttes' },
  homework: { words: '60–80', instruction: 'Vali üks väide ja kirjuta: väide, selgitus, näide, järeldus.', sentences: [5, 10] },
};
const lesson = (id, spec) => oralLesson(id, LEVEL, spec);

export const LESSONS = {
  'a2-s01': lesson('s01', {
    title: 'Kodu ja elukoht',
    canDo: 'Ma ütlen oma arvamuse kodu ja elukoha kohta, selgitan seda ja toon näite.',
    model: ['Minu kodu on linna lähedal ja see on väga mugav.', 'See on mugav, sest bussiga sõidan tööle ainult 20 minutit.', 'Näiteks lähen õhtul sageli jalgsi poodi.', 'Seega ei ole mul autot vaja.'],
    claims: [
      { text: 'Väikeses linnas on hea elada.', q: ['miks on seal hea elada?', 'mida inimene seal iga päev teeb?', 'kellele see elu sobib?'], words: 'rahulik, loodus, lähedal', counter: 'Aga kas väikeses linnas on piisavalt tööd?' },
      { text: 'Oma kodu on parem kui üürikorter.', q: ['miks on oma kodu parem?', 'mida saab oma kodus teha?', 'mida inimene peab enne ostmist teadma?'], words: 'laen, remont, vaba', counter: 'Aga kui inimene tahab sageli elukohta vahetada?' },
      { text: 'Buss on parem kui auto.', words: 'odav, ummik, parkimine', counter: 'Aga kui inimene elab maal?' },
      { text: 'Head naabrid on väga tähtsad.', words: 'aitama, turvaline, tuttav', counter: 'Aga kui naabrid on väga lärmakad?' },
      { text: 'Kodus on kõige parem puhata.', counter: 'Aga kas reisil ei saa paremini puhata?' },
    ],
  }),
  'a2-s02': lesson('s02', {
    title: 'Töö ja õppimine',
    canDo: 'Ma ütlen oma arvamuse töö ja õppimise kohta, selgitan seda ja toon näite.',
    model: ['Kursusel on lihtsam õppida kui üksi.', 'See on lihtsam, sest õpetaja parandab vead kohe.', 'Näiteks ütles õpetaja mulle eile, kuidas üks raske sõna kõlab.', 'Seega õpin kursusel kiiremini.'],
    claims: [
      { text: 'Hommikul on kõige parem õppida.', q: ['miks on hommik hea aeg?', 'mida sa hommikul teed?', 'millal on sinu arvates parim aeg õppida?'], words: 'puhanud, vaikne, meelde jääma', counter: 'Aga kui inimene töötab hommikul?' },
      { text: 'Iga päev tasub eesti keeles rääkida.', q: ['miks on see kasulik?', 'kus ja kellega sa räägid?', 'mida keeleõppija võib täna proovida?'], words: 'julgus, viga, harjutama', counter: 'Aga kui inimesed vastavad sulle vene või inglise keeles?' },
      { text: 'Väike firma on parem töökoht kui suur firma.', words: 'kolleeg, palk, sõbralik', counter: 'Aga kas suures firmas ei ole palk parem?' },
      { text: 'Kodus on raske töötada.', words: 'kontor, lapsed, keskenduma', counter: 'Aga kas kodus ei ole aega rohkem?' },
      { text: 'Noored peavad suvel tööd tegema.', counter: 'Aga millal nad siis puhkavad?' },
    ],
  }),
  'a2-s03': lesson('s03', {
    title: 'Tervis ja vaba aeg',
    canDo: 'Ma ütlen oma arvamuse tervise ja vaba aja kohta, selgitan seda ja toon näite.',
    model: ['Jalutamine on väga kasulik.', 'See on kasulik, sest see on tasuta ja sobib kõigile.', 'Näiteks jalutan ma iga õhtu pool tundi pargis ja magan pärast paremini.', 'Seega tasub iga päev natuke jalutada.'],
    claims: [
      { text: 'Sport teeb tuju paremaks.', q: ['miks on pärast sporti parem tuju?', 'millist sporti sa teed või tead?', 'kui tihti tasub sporti teha?'], words: 'energia, väsinud, rõõmus', counter: 'Aga kui inimene ei armasta sporti?' },
      { text: 'Kodus on parem süüa kui restoranis.', q: ['miks on kodune toit parem?', 'mida sa kodus teed süüa?', 'millal võib ikka restorani minna?'], words: 'odavam, tervislik, värske', counter: 'Aga kui inimesel ei ole aega süüa teha?' },
      { text: 'Telefon võtab liiga palju aega.', words: 'sotsiaalmeedia, õhtu, unustama', counter: 'Aga kas telefon ei aita ka õppida?' },
      { text: 'Inimene peab öösel kaheksa tundi magama.', words: 'uni, väsimus, hommik', counter: 'Aga kui inimesele piisab kuuest tunnist?' },
      { text: 'Puhkus on parem Eestis kui välismaal.', counter: 'Aga kui Eestis on suvel külm ja vihmane?' },
    ],
  }),
  'a2-s04': lesson('s04', {
    title: 'Pere ja sõbrad',
    canDo: 'Ma ütlen oma arvamuse pere ja sõprade kohta, selgitan seda ja toon näite.',
    model: ['Perega koos söömine on tähtis.', 'See on tähtis, sest siis saame rääkida, kuidas päev läks.', 'Näiteks sööme me pühapäeval alati koos lõunat.', 'Seega hoiab ühine söök peret koos.'],
    claims: [
      { text: 'Suur pere on tore.', q: ['miks on suures peres hea?', 'millist suurt peret sa tead?', 'mis on suure pere juures raske?'], words: 'aitama, koos, lärm', counter: 'Aga kas suur pere ei ole väga kallis?' },
      { text: 'Vanavanemad on lastele väga tähtsad.', q: ['mida annavad vanavanemad lastele?', 'mida sinu vanavanemad tegid?', 'kuidas saavad lapsed neid aidata?'], words: 'aega, jutud, õpetama', counter: 'Aga kui vanavanemad elavad kaugel?' },
      { text: 'Lapsed peavad kodus aitama.', words: 'koristama, kohustus, õppima', counter: 'Aga kas lapsed ei pea rohkem õppima?' },
      { text: 'Hea sõber ütleb alati tõtt.', words: 'usaldama, solvuma, aus', counter: 'Aga kui tõde teeb sõbrale haiget?' },
      { text: 'Sünnipäeva on kõige parem tähistada kodus.', counter: 'Aga kui kodu on väike ja külalisi on palju?' },
    ],
  }),
  'a2-s05': lesson('s05', {
    title: 'Ostud ja teenused',
    canDo: 'Ma ütlen oma arvamuse ostude ja teenuste kohta, selgitan seda ja toon näite.',
    model: ['Nimekirjaga on parem poes käia.', 'See on parem, sest siis ei osta ma liiga palju.', 'Näiteks ostsin ma eile ainult viis asja ja maksin kümme eurot.', 'Seega aitab nimekiri raha kokku hoida.'],
    claims: [
      { text: 'Internetist on mugav osta.', q: ['miks on see mugav?', 'mida sa internetist ostad?', 'mida tasub enne ostmist kontrollida?'], words: 'kodust, kohale tooma, hind', counter: 'Aga kui asi ei sobi või on katki?' },
      { text: 'Turul on toit parem kui poes.', q: ['miks on toit turul parem?', 'mida seal osta saab?', 'kellele turg sobib?'], words: 'värske, kodumaine, kallis', counter: 'Aga kas turul ei ole toit palju kallim?' },
      { text: 'Sularaha ei ole enam vaja.', words: 'pangakaart, telefon, turvaline', counter: 'Aga mida teha, kui kaart ei tööta?' },
      { text: 'Kallis asi on tavaliselt parem kui odav.', words: 'kvaliteet, kaua, katki minema', counter: 'Aga kas odav asi ei ole mõnikord sama hea?' },
      { text: 'Reisida on kõige mugavam rongiga.', counter: 'Aga kui rong ei sõida sinu kodukohta?' },
    ],
  }),
};
