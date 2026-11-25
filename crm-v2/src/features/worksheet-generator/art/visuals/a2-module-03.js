// Visual briefs of A2 module 03 (lessons a2-011…015); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 (docs/METHODOLOGY_A2_V5.md, 2026-11-25): one learning picture per teaching lesson (011–014), each carrying
// the lesson's pair task and standing on the same page as that task (`place`) — the four neighbours' cards are the guessing
// game of 011 (ma ärkan / ta ärkab, hommikul, õhtul), the street's opening hours the phone role play of 012 (kella …st
// …ni), the three week charts the flatmate decision of 013 (kaks korda nädalas, mitte kunagi), the two planners the
// information gap of 014 (neljapäeval, laupäeval; each partner sees one planner). They are line drawings the content agent
// made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2; Codex may redraw them from the
// same briefs. No cast character is drawn or named. The module control (015) has no picture. The earlier cast scenes
// (Codex, built-in image generation) are in RETIRED below and their files stay in public/.
export default [
  {
    id: 'a2-011-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Maja nr 5 neli naabrit, neli kaarti kahes reas (pea joonistus, nimi suurelt, amet, siis neli rida): Ain, pagar — ärkab kell 3, tööl kell 4–13, õhtul loeb raamatut, magama kell 21; Tiina, õpetaja — ärkab kell 6, tööl kell 8–15, õhtul käib ujumas, magama kell 22; Tõnu, taksojuht — ärkab kell 11, tööl kell 15–24, õhtul sõidab taksoga, magama kell 1 öösel; Kati, üliõpilane — ärkab kell 6, ülikoolis kell 9–14, õhtul töötab kohvikus, magama kell 23.',
    accent: 'the title „MAJA NR 5: NELI NAABRIT”',
    text: ['MAJA NR 5: NELI NAABRIT', 'Ain', 'pagar', 'Tiina', 'õpetaja', 'Tõnu', 'taksojuht', 'Kati', 'üliõpilane', 'ärkab', 'tööl', 'ülikoolis', 'õhtul', 'magama', 'kell'],
    learningJob: 'äraarvamismäng: õppija valib salaja ühe naabri ja räägib tema päevast mina-vormis (Ma ärkan kell kolm. Õhtul ma loen.), paariline arvab; Tiina ja Kati ärkavad mõlemad kell kuus, nii et tuleb küsida ka töö või õhtu kohta',
    place: '011_p_roles',
    alt: 'Neli naabri kaarti: pagar Ain ärkab kell 3, õpetaja Tiina kell 6, taksojuht Tõnu kell 11 ja üliõpilane Kati kell 6; igal kaardil on tööaeg, õhtune tegevus ja magamamineku aeg.',
    caption: 'Maja nr 5: kes see on?',
    prompts: ['Kes ärkab kõige varem?', 'Kes töötab õhtul?', 'Kes läheb magama kõige hiljem?'],
  },
  {
    id: 'a2-012-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Neli maja ühel tänaval, igal silt, uks ja aken, aknal lahtiolekuajad: JUUKSUR „SIIL” — T–R 10–18, L 10–15, E, P suletud, lõuna 13.00–13.30; RAAMATUKOGU — E–R 11–19, L 11–16, P suletud; UJULA — E–P 7–22, iga päev; HAMBAKLIINIK — E–R 8–16, L, P suletud, tel 600 1234. All tänava joon.',
    accent: 'the title „MEIE TÄNAV: LAHTIOLEKUAJAD”',
    text: ['MEIE TÄNAV: LAHTIOLEKUAJAD', 'JUUKSUR „SIIL”', 'RAAMATUKOGU', 'UJULA', 'HAMBAKLIINIK', 'AVATUD', 'T–R 10–18', 'L 10–15', 'E, P suletud', 'lõuna 13.00–13.30', 'E–R 11–19', 'L 11–16', 'P suletud', 'E–P 7–22', 'iga päev', 'E–R 8–16', 'L, P suletud', 'tel 600 1234'],
    learningJob: 'rollimäng telefonis: helistaja saab tulla ainult pärast kella viit või laupäeval, loeb aknalt lahtiolekuajad ja lepib aja kokku (Mis kellast mis kellani te avatud olete? Kas kell pool kuus sobib?); hambakliinikusse ei saa ta õhtul ega laupäeval minna — tuleb öelda, miks',
    place: '012_p_club',
    alt: 'Tänaval on neli maja: juuksur Siil, raamatukogu, ujula ja hambakliinik; igaühe aknal on lahtiolekuajad.',
    caption: 'Meie tänav: mis kell on avatud?',
    prompts: ['Mis kellast mis kellani on raamatukogu laupäeval avatud?', 'Kas juuksur on esmaspäeval avatud?', 'Kuhu saab minna pühapäeval?'],
  },
  {
    id: 'a2-013-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Kolm kaarti kõrvuti (pea joonistus ja nimi), igal nädala tabel E T K N R L P ja neli rida linnukestega: Rein — koristab E, K, R; teeb süüa L; sõbrad külla mitte kunagi; käib trennis iga päev. Ülle — koristab L; teeb süüa iga päev; sõbrad külla R, L; käib trennis K. Mart — koristab E, N; teeb süüa T, R; sõbrad külla iga päev; käib trennis mitte kunagi.',
    accent: 'the title „KES SOBIB KORTERIKAASLASEKS?”',
    text: ['KES SOBIB KORTERIKAASLASEKS?', 'Rein', 'Ülle', 'Mart', 'E', 'T', 'K', 'N', 'R', 'L', 'P', 'koristab', 'teeb süüa', 'sõbrad külla', 'käib trennis'],
    learningJob: 'otsus paaris: linnukesed tuleb muuta sagedussõnadeks (Rein koristab kolm korda nädalas, Mardile tulevad sõbrad iga päev külla, Rein ei kutsu mitte kunagi sõpru) ja põhjendada, kes sobib Kerttule korterikaaslaseks',
    place: '013_p_roles',
    alt: 'Kolm nädala tabelit: Rein koristab kolm korda nädalas ja käib iga päev trennis, Ülle teeb iga päev süüa, Mardile tulevad sõbrad iga päev külla.',
    caption: 'Kolm inimest: kui tihti?',
    prompts: ['Kui tihti Rein koristab?', 'Kellele tulevad sõbrad iga päev külla?', 'Kes ei käi mitte kunagi trennis?'],
  },
  {
    id: 'a2-014-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Kaks nädala kalendrit kõrvuti, vahel hall joon. TOOMAS: E tööl 9–17, trenn 18–20; T tööl 9–17, ema juures 18–21; K tööl 9–17, kino kell 19; N tööl 9–17, õhtu vaba; R tööl 9–15, sõbrad külla kell 18; L koristab 9–12, vaba 12–16, pidu kell 17; P maal. KAIA: E tööl 10–17, kursus 18–20; T tööl 16–22; K tööl 16–22; N tööl 10–17, vaba alates kell 18; R sõidab Pärnusse; L tööl 10–14, vaba alates kell 14; P Pärnus.',
    accent: 'the title „KAKS KALENDRIT”',
    text: ['KAKS KALENDRIT', 'TOOMAS', 'KAIA', 'E', 'T', 'K', 'N', 'R', 'L', 'P', 'tööl', 'trenn', 'ema juures', 'kino kell 19', 'õhtu vaba', 'sõbrad külla kell 18', 'koristab', 'vaba', 'pidu kell 17', 'maal', 'kursus', 'vaba alates kell 18', 'sõidab Pärnusse', 'vaba alates kell 14', 'Pärnus'],
    learningJob: 'infolünk: üks vaatab ainult Toomase, teine ainult Kaia kalendrit; nad pakuvad ja keelduvad (Esmaspäeval ma ei saa, sest mul on trenn), kuni leiavad kaks ühist vaba aega — neljapäeva õhtu pärast kella kuut ja laupäev kella kahest neljani',
    place: '014_p_roles',
    alt: 'Toomase ja Kaia nädala kalendrid päevade kaupa esmaspäevast pühapäevani: töö, trenn, kursus, külalised ja vabad ajad.',
    caption: 'Kaks kalendrit: millal te mõlemad olete vabad?',
    prompts: ['Mis päeval on Toomasel trenn?', 'Millal on Kaia laupäeval vaba?', 'Millal saavad Toomas ja Kaia kohtuda?'],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the lesson's task;
// module 3 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2-011-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus"],
    scene: "Markuse tavaline tööpäev ühe selge järjestusena: ta paneb hommikul tööjope selga, kontrollib laos kaste ja lahkub õhtul koju.",
    accent: "Markus’s work jacket",
    text: [],
    learningJob: "sequence a normal workday from morning to evening",
    alt: "Markus alustab hommikul tööd laos ja läheb õhtul koju.",
    caption: "Pilt 1. Markuse tavaline tööpäev.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Markus hommikul teeb?", "Mida ta laos teeb?", "Mis kell sinu tööpäev algab ja lõpeb?"],
  },
  {
    id: "a2-012-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna helistab kontoris Liisile ja vaatab samal ajal lauakalendrit ning seinakella, et kohtumise aega kokku leppida.",
    accent: "Anna’s top",
    text: [],
    learningJob: "infer a suitable meeting time and say when and where they will meet",
    alt: "Anna lepib Liisiga telefoni teel kohtumise aega kokku.",
    caption: "Pilt 1. Kohtumise aeg telefoni teel.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kellele Anna helistab?", "Mis kell on seinakellal?", "Mis päev ja kell sulle kohtumiseks sobib?"],
  },
  {
    id: "a2-013-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Jaan"],
    scene: "Jaan teeb kodus tervislikke harjumusi: jalutab Mukiga, valib laualt veeklaasi ja paneb spordikoti ukse juurde.",
    accent: "the water glass",
    text: [],
    learningJob: "describe how often Jaan follows each healthy habit",
    alt: "Jaan jalutab Mukiga ja valmistub sportima.",
    caption: "Pilt 1. Jaani tervislikud harjumused.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Jaan Mukiga teeb?", "Mida Jaan joob?", "Mis head harjumused sul on? Kui tihti sa sporti teed?"],
  },
  {
    id: "a2-014-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna"],
    scene: "Anna planeerib köögilaua ääres oma nädalat; ees on avatud nädalaplaan ning kõrval tööarvuti, poekott ja spordikott.",
    accent: "Anna’s top",
    text: [],
    learningJob: "plan and describe a week using days and sequence words",
    alt: "Anna koostab laua ääres oma nädala plaani.",
    caption: "Pilt 1. Anna nädalaplaan.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna planeerib?", "Mis asjad on laual?", "Mida sina sel nädalal teed? Millal sa oled vaba?"],
  },
  {
    id: "a2-015-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Sofia ja Liis vaatavad keelekursuse nädalaplaani; Sofia osutab ühele päevale, Liis kontrollib kellaaega käekellalt.",
    accent: "the course-week planner",
    text: [],
    learningJob: "explain a course week and resolve a scheduling conflict",
    alt: "Sofia ja Liis võrdlevad kursuse nädalaplaani kellaaegadega.",
    caption: "Pilt 1. Keelekursuse nädala planeerimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia ja Liis vaatavad?", "Mis kell on Liisi käekellal?", "Millal on sinu eesti keele tund?"],
  },
];
