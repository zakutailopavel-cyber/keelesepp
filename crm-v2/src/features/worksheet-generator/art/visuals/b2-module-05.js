// Visual briefs of b1b2 module 05; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-18 (task-based module 5, docs/COURSE_CAST.md);
// the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
// 2026-11-18 (v4): the module's topics changed (clock change, Christmas tree, screen time, the trip to work). Fitting existing
// pictures were copied into the lesson folders and retargeted; 022 (the Christmas tree debate) has no fitting picture yet,
// so it has none (a new brief needs the owner's order; the old „argument bridge” picture of the bus stop is removed).
// 2026-11-25 (methodology v5): the same pictures, each placed before the lesson's one input (023 moved from Kasuta to
// Avasta, 025 to the one control sheet before its writing 2); the questions now prepare that input and the lesson's
// language (no new images).
export default [
  {
    id: "b1b2-021-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // reused from a2b1-033-kasuta-1 (a tired man on his bed, a woman gives sleep advice in six icons), copied here: the
    // clock change lesson starts with the learner's own sleep
    scene: "Väsinud mees istub voodi serval tööriietes, käsi põse all. Naine annab talle sõnadeta plaani abil nõu: pane telefon ära, joo vähem kohvi, jaluta, joo vett, loe ja maga.",
    accent: "the phone-away card",
    text: [],
    // v5 (2026-11-25): before the one input 021_d_text (reading on the clock change)
    place: "021_d_text",
    learningJob: "rääkida, kuidas kella keeramine und mõjutab, ja öelda, kui kindel ollakse nõuande toimimises",
    alt: "Väsinud mees istub voodil, naine annab talle kuus nõuannet parema une jaoks.",
    caption: "Pilt 1. Esmaspäev pärast kella keeramist.",
    prompts: ["Miks on mees pildil sinu arvates nii väsinud? Kui kindel sa oled: kindlasti, ilmselt või võib-olla?", "Milline kuuest nõuandest aitaks pärast kella keeramist ilmselt, milline vaevalt? Ütle: vaevalt see aitab …", "Lugemise järel: kas teksti järgi võib öelda, et kella keeramine põhjustab infarkte? Mida tekst täpselt ütleb?"],
  },
  {
    id: "b1b2-023-kasuta-1",
    // v5 (2026-11-25): moved to Avasta, before the one input 023_d_text (the id keeps its old name: the file name)
    phase: "discover",
    format: "scene",
    cast: ["Jaan", "Sofia"],
    // reused from est-c1-037-kasuta-1 (two people weigh a phone ban; a compromise in the middle of the board), copied here:
    // the screen time case ends in a family compromise
    scene: "Kaks inimest kaaluvad telefonireegleid. Tahvlil on ühel pool keelu kasu, teisel pool turvalisus ja vajadus; keskel ühendab neid kompromiss: hoiukoht, telefonivaba aeg ja erand.",
    accent: "the compromise in the middle of the board",
    text: [],
    place: "023_d_text",
    learningJob: "tunnistada teise poole muret, vaielda viisakalt vastu ja pakkuda kompromissi",
    alt: "Kaks inimest arutavad tahvli ees telefonireegleid; keskel on kompromiss: hoiukast ja telefonivaba aeg.",
    caption: "Pilt 1. Keeld, vabadus või kompromiss?",
    prompts: ["Mis on tahvli vasakul ja mis paremal poolel?", "Milline lahendus on keskel ja miks on see kompromiss? Ütle: tõsi küll, keeld …, kuid …", "Lugemise järel: millise reegli paneks tekst sinu arvates tahvli keskele ja miks?"],
  },
  {
    id: "b1b2-024-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Jaan"],
    scene: "Pärnu lähedal kodu ees võrdlevad kaks inimest pere kahte liikumislahendust. Vasakul on lihtne auto, paremal bussipeatus ja buss; nende vahel seisab nelja kaaluvihiga võrdluskaal, mis tähistab hinda, aega, mugavust ja keskkonda ilma sõnadeta.",
    accent: "the four-weight comparison scale",
    text: [],
    // v5 (2026-11-25): before the one input 024_d_listen (the radio talk)
    place: "024_d_listen",
    learningJob: "võrrelda autot ja ühistransporti nelja kriteeriumi järgi ning põhjendada valikut",
    alt: "Kaks inimest võrdlevad kaalul auto ja bussi hinda, aega, mugavust ja keskkonnamõju.",
    caption: "Pilt 1. Auto või buss: mis kaalub rohkem?",
    prompts: ["Mida need kaks inimest kaalul võrdlevad?", "Mis on võrreldes bussiga auto eelis ja mis puudus? Ütle: mida …, seda …", "Kuulamise järel: mida peale kütuse kaalub liikuvusuurija sõnul auto kaalukausil?"],
  },
  {
    id: "b1b2-025-kasuta-1",
    // v5 (2026-11-25): the control is one sheet (Avasta); the picture stands before the writing part (topic 1 of writing 2)
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Markus"],
    scene: "Kohaliku noortekeskuse avalik arutelu. Kaks inimest võrdlevad kahte projekti: ühel pool on väike staadionimudel, teisel pool raamatukogumudel. Nende vahel on üks keskne otsustahvel nelja ühendatud sümboliga, mis meenutavad seisukohta, põhjust, näidet ja järeldust, kuid tahvlil ei ole sõnu.",
    accent: "the central argument decision board",
    text: [],
    place: "025_t_cold",
    learningJob: "valida spordihoone ja raamatukogu vahel ning kirjutada terviklik põhjendatud arutlus",
    alt: "Kaks inimest võrdlevad avalikul arutelul spordihoone ja raamatukogu projekti.",
    caption: "Pilt 1. Spordihall või raamatukogu?",
    prompts: ["Milliseid kahte projekti siin võrreldakse?", "Mis on võrreldes spordihalliga raamatukogu eelis?", "Kumma poolt sina hääletaksid ja miks?"],
  },
];
