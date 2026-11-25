// Visual briefs of A2 module 02 (lessons a2-006…010); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 (docs/METHODOLOGY_A2_V5.md, 2026-11-25): one learning picture per teaching lesson (006–009), each carrying
// the lesson's pair task and standing on the same page as that task (`place`) — the family tree is the information gap of
// 006 (Kas sul on vend või õde? → kaks venda), the lost-property table the role play of 007 (Kelle … see on?), the bus
// station the picture description of 008 (Harno A2 speaking 1, and the listening's „Kerli's mother” is one of the six),
// the business cards the information transfer of 009 (Harno A2 writing 1). They are line drawings the content agent made
// from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2; Codex may redraw them from the same
// briefs. No cast character is drawn or named. The module control (010) has no picture. The earlier cast scenes (Codex,
// built-in image generation) are in RETIRED below and their files stay in public/.
export default [
  {
    id: 'a2-006-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Kase pere sugupuu kolmes reas, igal inimesel kaart (pea joonistus, nimi suurelt, vanus, linn, amet): üleval Maie (68, Tartu, pensionär) ja Ants (70, Tartu, pensionär); keskel nende lapsed Toomas (45, Tallinn, bussijuht) koos naise Kristiga (43, Tallinn, õpetaja) ja Kati (38, Pärnu, arst) koos koer Muriga; all Toomase ja Kristi lapsed Piia (16), Kaarel (12) ja Rasmus (8), kõik Tallinn, õpilane. Jooned näitavad, kes kelle laps on.',
    accent: 'the title „KASE PERE”',
    text: ['KASE PERE', 'Maie', 'Ants', 'Toomas', 'Kristi', 'Kati', 'Piia', 'Kaarel', 'Rasmus', 'koer Muri', 'aastat', 'Tartu', 'Tallinn', 'Pärnu', 'pensionär', 'bussijuht', 'õpetaja', 'arst', 'õpilane'],
    learningJob: 'infolünk: õppija valib salaja ühe inimese, paariline küsib „Kas sul on vend või õde? Kas sul on lapsi? Kus sa elad?” ja arvab; vastus nõuab vormi kaks venda, mul ei ole lapsi (Piial on kaks venda, Katil ei ole lapsi, Kaarlil ja Rasmusel on sama vastus — tuleb küsida vanust)',
    place: '006_p_tree',
    alt: 'Kase pere sugupuu: vanavanemad Maie ja Ants Tartus, nende lapsed Toomas (Tallinn, naine Kristi) ja Kati (Pärnu, koer Muri), Toomase ja Kristi lapsed Piia, Kaarel ja Rasmus.',
    caption: 'Kase pere: kes ma olen?',
    prompts: ['Mitu last on Toomasel ja Kristil?', 'Kellel ei ole lapsi?', 'Kes ütleb: „Mul on kaks venda”?'],
  },
  {
    id: 'a2-007-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Keelekooli kadunud asjade laud (pealt vaates), seitse nummerdatud asja: 1 sall nimesildiga „LUCÍA”, 2 must võti väikese palliga, 3 prillid, 4 müts tutiga, 5 vihik, kaanel „IGOR ORLOV”, 6 must kott, 7 telefon; paremal hall kast, kust asjad tulid. Kaks musta asja (võti ja kott), et õppija peab asja täpselt kirjeldama.',
    accent: 'the label „KADUNUD ASJAD”',
    text: ['KADUNUD ASJAD', 'LUCÍA', 'IGOR', 'ORLOV', '1', '2', '3', '4', '5', '6', '7'],
    learningJob: 'rollimäng administraatori laua juures: õppija valib salaja ühe asja ja kirjeldab seda (mis asi, milline, kelle kingitus), administraator küsib „Kelle … see on?”; nimesildid annavad omastava (Lucía sall, Igori vihik)',
    place: '007_p_desk',
    alt: 'Laual on seitse kadunud asja: sall nimesildiga Lucía, must võti palliga, prillid, müts, vihik nimega Igor Orlov, must kott ja telefon; kõrval hall kast.',
    caption: 'Kadunud asjad: kelle oma see on?',
    prompts: ['Kelle sall see on? Kelle vihik see on?', 'Mis asjad on mustad?', 'Mida sa ütled, kui otsid oma asja?'],
  },
  {
    id: 'a2-008-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Bussijaam, ülal silt „BUSSIJAAM · PÄRNU – TALLINN 14.00”. Kuus nummerdatud inimest reas: 1 pikk mees habemega, seljakott; 2 lühike naine pikkade juustega, pikk mantel, kott; 3 pikk naine pikkade juustega ja prillidega, pikk mantel, kohver; 4 väike laps; 5 lühike naine lühikeste hallide juustega, suured prillid, pikk mantel (lime), kott käes — Kerli ema; 6 lühike naine hallide juustega ja prillidega, lühike jope, kohver.',
    accent: "the long coat of person 5 (Kerli's mother)",
    text: ['BUSSIJAAM · PÄRNU – TALLINN 14.00', '1', '2', '3', '4', '5', '6'],
    learningJob: 'pildi kirjeldus (Harno A2 rääkimise 1. ülesanne): üks kirjeldab inimest (ta on lühike, tal on lühikesed hallid juuksed ja prillid, tal on seljas pikk mantel), teine arvab numbri; häälsõnumi järgi leida Kerli ema (5) ja öelda, miks 6 ei ole tema (lühike jope)',
    place: '008_t_roles',
    alt: 'Bussijaamas seisab kuus inimest: pikk habemega mees, lühike pikajuukseline naine, pikk prillidega naine, laps, lühike hallide juuste ja prillidega naine pikas mantlis ning teine lühike hallide juustega naine lühikeses jopes.',
    caption: 'Bussijaamas: kes on Kerli ema?',
    prompts: ['Kes pildil on Kerli ema? Miks sa nii arvad?', 'Milline on number 3?', 'Võrdle numbreid 5 ja 6.'],
  },
  {
    id: 'a2-009-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Kolm visiitkaarti: „Marta Kask — perearst — Mustamäe perearstikeskus — vastuvõtt E, K, R kell 9–15 — tel 5123 4567”; „Ahti Lepp — kokk — kohvik Pann, Tartu — avatud iga päev kell 8–16 — ahti@pann.ee”; „Irina Volkova — eesti keele õpetaja — Keelekool Sõna, Narva mnt 7 — tunnid T ja N kell 18 — tel 5345 6789”. All vasakul leht ja pastakas.',
    accent: 'the label „VISIITKAARDID”',
    text: ['VISIITKAARDID', 'Marta Kask', 'perearst', 'Mustamäe perearstikeskus', 'vastuvõtt E, K, R kell 9–15', 'tel 5123 4567', 'Ahti Lepp', 'kokk', 'kohvik Pann, Tartu', 'avatud iga päev kell 8–16', 'ahti@pann.ee', 'Irina Volkova', 'eesti keele õpetaja', 'Keelekool Sõna, Narva mnt 7', 'tunnid T ja N kell 18', 'tel 5345 6789'],
    learningJob: 'info ülekanne (Harno A2 kirjutamise 1. ülesanne): visiitkaardi märksõnadest 4–5 lauset ta-vormis — kes ta on, kus ta töötab, millal teda leiab, kuidas temaga ühendust võtta',
    place: '009_p_card',
    alt: 'Kolm visiitkaarti: perearst Marta Kask, kokk Ahti Lepp ja eesti keele õpetaja Irina Volkova; all leht ja pastakas.',
    caption: 'Visiitkaardid: kes, kus, millal, kuidas?',
    prompts: ['Kes on Ahti Lepp ja kus ta töötab?', 'Millal saab perearsti juurde minna?', 'Kuidas saab Irina Volkovaga ühendust võtta?'],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the lesson's task, and
// the continuing story now lives in one lesson only (006). The files stay in public/textbook-art/a2/ and can return when a
// lesson needs them.
export const RETIRED = [
  {
    id: "a2-006-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor"],
    scene: "Anna ja Viktor uurivad kodus lauale laotatud perekonna sugupuud; nad osutavad eri harudele ja võrdlevad sugulasi.",
    accent: "Anna’s top",
    text: [],
    learningJob: "identify family relationships and explain whose relative each person is",
    alt: "Anna ja Viktor uurivad koos laual olevat perekonna sugupuud.",
    caption: "Pilt 1. Perekonna sugupuu uurimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna ja Viktor laual vaatavad?", "Kellele Viktor osutab?", "Kes on sinu peres? Räägi kolmest inimesest."],
  },
  {
    id: "a2-007-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Keelekeskuse kadunud asjade laua juures hoiab Liis halli kasti, kus on sall, võti ja vihik; Sofia osutab vihikule ja püüab otsustada, kelle oma see on.",
    accent: "the lost-property box",
    text: [],
    learningJob: "infer who owns each lost object and answer with genitive forms",
    alt: "Sofia ja Liis uurivad kadunud asjade kastis salli, võtit ja vihikut.",
    caption: "Pilt 1. Kelle oma on kadunud asi?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis asjad on kastis?", "Kelle vihik see võib olla?", "Mida sina kaotasid? Kelle asju sa tihti leiad?"],
  },
  {
    id: "a2-008-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus"],
    scene: "Anna kirjeldab keelekursuse paaristöös üht inimest, Markus vaatab kolme lihtsat halli portreekaarti ja arvab, keda Anna kirjeldab.",
    accent: "Anna’s top",
    text: [],
    learningJob: "compare appearance and character clues and identify the described person",
    alt: "Anna kirjeldab inimest ja Markus valib kolme portree seast õige.",
    caption: "Pilt 1. Arva kirjelduse järgi ära, kes see on.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Keda Anna kirjeldab?", "Milline on inimene kaardil: pikk või lühike, hele või tume?", "Kirjelda üht pildil olevat inimest."],
  },
  {
    id: "a2-009-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Sofia koostab keelekeskuses oma lähedase profiili; laual on tühi profiilikaart, pliiats ja väike raamitud perefoto, Liis kuulab.",
    accent: "the profile card",
    text: [],
    learningJob: "use the picture to present a close person’s age, home and activity",
    alt: "Sofia tutvustab Liisile oma lähedase profiili.",
    caption: "Pilt 1. Lähedase inimese profiil.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia kirjutab?", "Kes võib olla fotol?", "Kellest sina kirjutaksid oma profiili?"],
  },
  {
    id: "a2-010-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Sofia"],
    scene: "Kaks sõpra kohtuvad pargis pingil; Anna kirjeldab tuttavat inimest käeliigutustega ja Sofia kuulab ning püüab inimese ära arvata.",
    accent: "Anna’s top",
    text: [],
    learningJob: "describe a friend’s appearance and personality and ask a follow-up question",
    alt: "Anna kirjeldab pargis Sofiale üht sõpra.",
    caption: "Pilt 1. Kaks sõpra räägivad inimestest.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus Anna ja Sofia on?", "Mida Anna käega näitab?", "Kirjelda tuttavat inimest nii, et paariline arvab ära, kes see on."],
  },
];
