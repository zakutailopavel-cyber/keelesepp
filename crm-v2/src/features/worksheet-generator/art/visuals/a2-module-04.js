// Visual briefs of A2 module 04 (lessons a2-016…020); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 (docs/METHODOLOGY_A2_V5.md, 2026-11-25): one learning picture per teaching lesson (016–019), each carrying
// the lesson's pair task and standing on the same page as that task (`place`) — two flat plans are the information gap of
// 016 (five differences: köögis on …), the house cross-section the „who is where, who goes where” task of 017 (köögis →
// keldrisse, keldrist), the room where everything is in the wrong place the instructions of 018 (põrandal → lauale), the
// map of two houses the flat decision of 019 (maja kõrval, pargi vastas, maja ees, maja taga). They are line drawings the
// content agent made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2; Codex may redraw them
// from the same briefs. No cast character is drawn or named. The module control (020) has no picture. The earlier cast
// scenes (Codex, built-in image generation) are in RETIRED below and their files stay in public/.
export default [
  {
    id: 'a2-016-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Kaks korteri plaani kõrvuti, igaühes kuus ruumi kolmes reas (köök, vannituba; elutuba, magamistuba; esik, rõdu), igas ruumis lihtne mööbli joonistus ja allkiri. KORTER A: köögis laud ja neli tooli, külmkapp; vannitoas vann; elutoas diivan ja teler; magamistoas voodi ja riidekapp; esikus nagi ja peegel; rõdul lilled. KORTER B: köögis laud ja kaks tooli, külmkapp; vannitoas dušš; elutoas diivan ja raamaturiiul; magamistoas voodi ja kirjutuslaud; esikus nagi ja peegel; rõdul jalgratas.',
    accent: 'the title „KAKS KORTERIT: LEIA 5 ERINEVUST”',
    text: ['KAKS KORTERIT: LEIA 5 ERINEVUST', 'KORTER A', 'KORTER B', 'KÖÖK', 'VANNITUBA', 'ELUTUBA', 'MAGAMISTUBA', 'ESIK', 'RÕDU', 'laud, 4 tooli', 'laud, 2 tooli', 'külmkapp', 'vann', 'dušš', 'diivan', 'teler', 'raamaturiiul', 'voodi', 'riidekapp', 'kirjutuslaud', 'nagi', 'peegel', 'lilled', 'jalgratas'],
    learningJob: 'infolünk: üks vaatab ainult korterit A, teine ainult korterit B; nad ütlevad, mis igas toas on (Köögis on laud ja neli tooli.), ja küsivad (Kas sinu vannitoas on ka vann?), kuni leiavad viis erinevust — esik on mõlemas sama',
    place: '016_p_roles',
    alt: 'Kahe korteri plaan: korteris A on köögis neli tooli, vannitoas vann, elutoas teler, magamistoas riidekapp ja rõdul lilled; korteris B on köögis kaks tooli, vannitoas dušš, elutoas raamaturiiul, magamistoas kirjutuslaud ja rõdul jalgratas.',
    caption: 'Kaks korterit: mis on erinev?',
    prompts: ['Mis on korteri A vannitoas?', 'Mis on korteri B rõdul?', 'Kumb korter sulle meeldib? Miks?'],
  },
  {
    id: 'a2-017-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Maja lõige: katus, kolm korrust. Ülemisel korrusel MAGAMISTUBA (poeg, voodi; mõttemull „kool”) ja VANNITUBA (isa, vann; mull „saun”); keskmisel KÖÖK (ema, külmkapp; mull „kelder”), ELUTUBA (vanaema, diivan; mull „aed”) ja ESIK (tütar, nagi; mull „pood”); all KELDER (kaks kasti, kass; mull „köök”). Inimesed on lihtsad joonfiguurid, nimi pea kõrval.',
    accent: 'the title „MEIE MAJA: KES KUS ON? KUHU TA LÄHEB?”',
    text: ['MEIE MAJA: KES KUS ON? KUHU TA LÄHEB?', 'MAGAMISTUBA', 'VANNITUBA', 'KÖÖK', 'ELUTUBA', 'ESIK', 'KELDER', 'poeg', 'isa', 'ema', 'vanaema', 'tütar', 'kass', 'kool', 'saun', 'kelder', 'aed', 'pood', 'köök'],
    learningJob: 'kus? kuhu? kust?: üks räägib pildi järgi (Ema on köögis. Ta läheb keldrisse. Kass tuleb keldrist ja läheb kööki.), teine katab pildi ja kirjutab; mullides on sõna algvormis, nii et õppija peab ise tegema kuhu-vormi (keldrisse, sauna, aeda, kooli, poodi, kööki)',
    place: '017_p_tell',
    alt: 'Maja lõige: poeg on magamistoas ja läheb kooli, isa vannitoas ja läheb sauna, ema köögis ja läheb keldrisse, vanaema elutoas ja läheb aeda, tütar esikus ja läheb poodi; kass tuleb keldrist kööki.',
    caption: 'Meie maja: kes kus on ja kuhu ta läheb?',
    prompts: ['Kus on vanaema?', 'Kuhu isa läheb?', 'Kust kass tuleb?'],
  },
  {
    id: 'a2-018-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Tuba pärast kolimist, kõik on valel kohal: seinal on ainult nael (pilt puudub), aknalaual on raamatud, riiul on tühi, ainult tass on riiulil; toolil on pilt, laual magab kass, põrandal on väike laualamp ja jope, voodil on lillepott, nagi ukse kõrval on tühi. Iga asja ja mööbli juures väike allkiri algvormis.',
    accent: 'the title „KÕIK ON VALEL KOHAL!”',
    text: ['KÕIK ON VALEL KOHAL!', 'sein', 'aken', 'raamatud', 'riiul', 'tass', 'tool', 'pilt', 'laud', 'kass', 'lamp', 'voodi', 'lill', 'jope', 'nagi', 'põrand'],
    learningJob: 'juhised: õppija ütleb, kus asi on ja kuhu see panna (Lamp on põrandal. Pane lamp lauale. Võta pilt toolilt ja pane seinale.), paariline kontrollib ja vaidleb vastu; jope läheb nagisse (sees) — kontrast -le ja -sse vahel',
    place: '018_p_roles',
    alt: 'Tuba, kus kõik on valel kohal: pilt on toolil, kass laual, lamp ja jope põrandal, lill voodil, raamatud aknal ja tass riiulil; sein ja nagi on tühjad.',
    caption: 'Kõik on valel kohal: kuhu need panna?',
    prompts: ['Kus on lamp?', 'Kuhu panna pilt?', 'Mis on sinu laual?'],
  },
  {
    id: 'a2-019-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Linnaosa kaart pealtvaates: pikk tänav ja ristuv tänav. Tänava ühel pool MAJA A (kõrval KOOL, taga LASTEAED) ja üle ristuva tänava MAJA B (kõrval POOD ja APTEEK, taga PARKLA P, ees bussipeatuse silt BUSS). Teisel pool tänavat: MAJA A vastas PARK puudega, MAJA B vastas KOHVIK.',
    accent: 'the title „KAKS MAJA: KUMB KORTER?”',
    text: ['KAKS MAJA: KUMB KORTER?', 'MAJA A', 'MAJA B', 'KOOL', 'LASTEAED', 'POOD', 'APTEEK', 'PARKLA P', 'BUSS', 'bussipeatus', 'PARK', 'KOHVIK'],
    learningJob: 'otsus paaris: üks tahab kooli ja parki lähedale (maja A: kooli kõrval, pargi vastas, lasteaed maja taga), teine bussipeatust, parklat ja poodi (maja B: peatus maja ees, parkla maja taga, pood maja kõrval); kaardilt tuleb öelda mille? + kõrval / vastas / ees / taga ja leppida kokku',
    place: '019_p_roles',
    alt: 'Kaart: maja A kõrval on kool, taga lasteaed ja vastas park; maja B kõrval on pood ja apteek, ees bussipeatus, taga parkla ja vastas kohvik.',
    caption: 'Kaks maja: mis on lähedal?',
    prompts: ['Mis on maja A vastas?', 'Kus on parkla?', 'Mis on sinu kodu lähedal?'],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the lesson's task;
// module 4 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2-016-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor"],
    scene: "Anna ja Viktor uurivad tühja korteri plaani; Anna osutab elutoale ja Viktor hoiab väikest mööbli paigutuse visandit.",
    accent: "Anna’s top",
    text: [],
    learningJob: "describe rooms and choose where furniture should go",
    alt: "Anna ja Viktor kavandavad korteris tubade ja mööbli paigutust.",
    caption: "Pilt 1. Korteri plaani arutamine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna ja Viktor vaatavad?", "Kuhu Anna osutab?", "Kuhu sina paneksid diivani ja laua?"],
  },
  {
    id: "a2-017-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia"],
    scene: "Sofia liigub kodus esikust kööki, võtab köögist tassi ja läheb tassiga elutuppa; kolm ruumi on selgelt eristatavad.",
    accent: "the cup in Sofia’s hand",
    text: [],
    learningJob: "say where Sofia is, where she goes and where she comes from",
    alt: "Sofia liigub kodus esikust kööki ja sealt elutuppa.",
    caption: "Pilt 1. Liikumine kodu ruumide vahel.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kust Sofia tuleb ja kuhu ta läheb?", "Mida Sofia köögist võtab?", "Kuhu sina hommikul kõigepealt lähed?"],
  },
  {
    id: "a2-018-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus"],
    scene: "Kontoris asetab Anna kausta lauale ja Markus võtab laualt telefoni; muud esemed on selgelt laua peal või laua kõrval.",
    accent: "Anna’s top",
    text: [],
    learningJob: "describe where objects are moved using table location forms",
    alt: "Anna paneb kausta lauale ja Markus võtab telefoni laualt.",
    caption: "Pilt 1. Asjad laual ja laua ümber.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna lauale paneb?", "Mida Markus laualt võtab?", "Mis on sinu laua peal?"],
  },
  {
    id: "a2-019-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor"],
    scene: "Anna ja Viktor seisavad Mustamäe kortermaja ees ning uurivad lihtsat naabruskonna kaarti; lähedal on bussipeatus, pood ja park.",
    accent: "Anna’s top",
    text: [],
    learningJob: "describe nearby places and explain a normal route from home",
    alt: "Anna ja Viktor vaatavad Mustamäe maja ees naabruskonna kaarti.",
    caption: "Pilt 1. Korter ja naabruskond Mustamäel.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus Anna ja Viktor seisavad?", "Mis on maja lähedal?", "Mis on sinu kodu lähedal?"],
  },
  {
    id: "a2-020-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna näitab Liisile Mustamäe korteri plaani ja naabruskonna kaarti; Liis osutab marsruudile majast bussipeatuseni.",
    accent: "Anna’s top",
    text: [],
    learningJob: "describe the home, nearby places and route as a review task",
    alt: "Anna ja Liis arutavad korterit ning teed bussipeatusesse.",
    caption: "Pilt 1. Kodu ja ümbruse kontrollülesanne.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna Liisile näitab?", "Kuidas saab majast bussipeatusse?", "Kuidas sina kodust tööle või kooli lähed?"],
  },
];
