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
  'a2-s06': lesson('s06', {
    title: 'Toit ja söögikohad',
    canDo: 'Ma ütlen oma arvamuse toidu ja söögikohtade kohta, selgitan seda ja toon näite.',
    model: ['Hommikusöök on päeva kõige tähtsam söök.', 'See on tähtis, sest pärast seda on mul palju energiat.', 'Näiteks söön ma hommikul putru ja töötan rahulikult kuni lõunani.', 'Seega ei tasu hommikusööki ära jätta.'],
    claims: [
      { text: 'Kodus tehtud leib on parem kui poe leib.', q: ['miks on see parem?', 'kes sinu peres leiba teeb või ostab?', 'kas seda tasub ise teha?'], words: 'maitse, värske, aeg', counter: 'Aga kas leiva tegemine ei võta liiga palju aega?' },
      { text: 'Lõunat on parem süüa koos kolleegidega.', q: ['mida annab ühine lõuna?', 'kus ja kellega sa lõunat sööd?', 'millal on parem üksi süüa?'], words: 'rääkima, paus, söökla', counter: 'Aga kui inimene tahab lõunal puhata?' },
      { text: 'Lapsed peavad sööma seda, mida vanemad teevad.', words: 'köögivili, maiustused, harjuma', counter: 'Aga kui laps seda toitu üldse ei armasta?' },
      { text: 'Väike kohvik on parem kui suur restoran.', words: 'hubane, teenindaja, hind', counter: 'Aga kas suures restoranis ei ole valik parem?' },
      { text: 'Õhtul ei tohi hilja süüa.', counter: 'Aga kui inimene tuleb töölt alles kell üheksa?' },
    ],
  }),
  'a2-s07': lesson('s07', {
    title: 'Ilm ja aastaajad',
    canDo: 'Ma ütlen oma arvamuse ilma ja aastaaegade kohta, selgitan seda ja toon näite.',
    model: ['Sügis on väga ilus aastaaeg.', 'See on ilus, sest puud on kollased ja punased.', 'Näiteks käin ma oktoobris alati metsas jalutamas.', 'Seega ei ole sügis minu jaoks kurb aeg.'],
    claims: [
      { text: 'Suvi on aasta parim aeg.', q: ['miks on suvi hea?', 'mida sa suvel teed?', 'mis on suve juures halb?'], words: 'soe, puhkus, päike', counter: 'Aga kui suvel on liiga kuum?' },
      { text: 'Talvel on raske hommikul üles tõusta.', q: ['miks on see raske?', 'kuidas sinu talvine hommik välja näeb?', 'mis aitab?'], words: 'pime, külm, kohv', counter: 'Aga kas talvel ei ole ka ilusaid päevi?' },
      { text: 'Halba ilma ei ole, on ainult halvad riided.', words: 'jope, saapad, vihm', counter: 'Aga kui väljas on väga tugev torm?' },
      { text: 'Vihmase ilmaga on kõige parem kodus olla.', words: 'raamat, film, tee', counter: 'Aga kas vihmaga ei saa ka jalutada?' },
      { text: 'Lapsed peavad iga päev õues käima.', counter: 'Aga kui väljas on kakskümmend kraadi külma?' },
    ],
  }),
  'a2-s08': lesson('s08', {
    title: 'Reisimine',
    canDo: 'Ma ütlen oma arvamuse reisimise kohta, selgitan seda ja toon näite.',
    model: ['Väikese kohvriga on parem reisida.', 'See on parem, sest siis ei pea ma palju kandma.', 'Näiteks võtsin ma eelmisel suvel kaasa ainult väikese koti.', 'Seega oli reis palju mugavam.'],
    claims: [
      { text: 'Üksi on tore reisida.', q: ['miks on üksi tore?', 'kuhu saab üksi minna?', 'mis on üksi reisides raske?'], words: 'vaba, plaan, uued inimesed', counter: 'Aga kas koos ei ole lõbusam?' },
      { text: 'Enne reisi peab kõik täpselt planeerima.', q: ['miks on plaan vajalik?', 'mida sa enne reisi teed?', 'mis juhtub, kui plaani ei ole?'], words: 'pilet, hotell, kaart', counter: 'Aga kas ilma plaanita ei ole huvitavam?' },
      { text: 'Hotell on parem kui telk.', words: 'mugav, loodus, kallis', counter: 'Aga kas telgis ei ole loodus lähemal?' },
      { text: 'Lastega reisida on väga raske.', words: 'väsinud, mängud, pikk tee', counter: 'Aga kas lapsed ei õpi reisil palju uut?' },
      { text: 'Oma riiki peab enne tundma õppima kui teisi riike.', counter: 'Aga kui inimene tahab just kaugele minna?' },
    ],
  }),
  'a2-s09': lesson('s09', {
    title: 'Kool ja lapsed',
    canDo: 'Ma ütlen oma arvamuse kooli ja laste kohta, selgitan seda ja toon näite.',
    model: ['Koolivorm on lastele kasulik.', 'See on kasulik, sest siis ei pea lapsed riiete pärast muretsema.', 'Näiteks ei pea laps igal hommikul mõtlema, mida selga panna.', 'Seega jääb hommikul rohkem aega.'],
    claims: [
      { text: 'Lapsed peavad minema kooli jalgsi.', q: ['miks on see hea?', 'kuidas sina või su lapsed kooli läksid?', 'millal on auto siiski vajalik?'], words: 'tervis, iseseisev, kaugel', counter: 'Aga kui kool on väga kaugel?' },
      { text: 'Pikk suvevaheaeg on lastele hea.', q: ['miks on vaheaeg vajalik?', 'mida lapsed suvel teevad?', 'mida nad võivad unustada?'], words: 'puhkama, laager, unustama', counter: 'Aga kes on lastega, kui vanemad töötavad?' },
      { text: 'Telefon ei sobi kooli.', words: 'vahetund, tund, helistama', counter: 'Aga kuidas vanemad siis lapsele helistavad?' },
      { text: 'Muusikatund on sama tähtis kui matemaatika.', words: 'laulma, loovus, matemaatika', counter: 'Aga mida teha, kui lapsel ei ole muusika vastu huvi?' },
      { text: 'Lapsed peavad õppima mitut keelt.', counter: 'Aga kas see ei ole väikesele lapsele liiga raske?' },
    ],
  }),
  'a2-s10': lesson('s10', {
    title: 'Elu Eestis',
    canDo: 'Ma ütlen oma arvamuse elu kohta Eestis, selgitan seda ja toon näite.',
    model: ['Eestis on palju ilusat loodust.', 'See on hea, sest metsa ja mere äärde on lihtne minna.', 'Näiteks sõidan ma suvel sageli Pärnusse.', 'Seega saab siin hästi puhata.'],
    claims: [
      { text: 'Jaanipäev on Eesti kõige toredam püha.', q: ['miks on see püha tore?', 'mida inimesed sel päeval teevad?', 'kuidas sa ise tähistad?'], words: 'lõke, sõbrad, maal', counter: 'Aga kas jõulud ei ole tähtsamad?' },
      { text: 'Eestis on kõike mugav internetis teha.', q: ['mida saab internetis teha?', 'mida sina hiljuti internetis tegid?', 'mis on selle juures raske?'], words: 'pank, arst, ID-kaart', counter: 'Aga kuidas vanad inimesed sellega hakkama saavad?' },
      { text: 'Eestlased on alguses vaiksed, aga head sõbrad.', words: 'tutvuma, abi, aeg', counter: 'Aga kas kõik eestlased on vaiksed?' },
      { text: 'Tallinnas on parem elada kui maal.', words: 'töö, kool, loodus', counter: 'Aga kas Tallinnas ei ole elu väga kallis?' },
      { text: 'Eesti keelt on vaja igal pool.', counter: 'Aga kas Tallinnas ei saa ka vene ja inglise keeles hakkama?' },
    ],
  }),
};
