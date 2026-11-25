// Visual briefs of b1b2 module 07; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-18 (task-based module 7,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex
// (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-031-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Sofia"],
    // 2026-11-18 (v4): the same picture, retargeted from „motivation in small steps” to the school path after grade 9:
    // a teenager with a backpack and an adult lay out the steps to a goal flag
    scene: "Teismeline seljakotiga ja täiskasvanu panevad laual kaartidest raja kokku: esimene samm on märgitud linnukesega, rada viib lipuga eesmärgini.",
    accent: "the small-step path towards the goal flag",
    text: [],
    place: "031_d_text",
    learningJob: "rääkida noore koolitee sammudest pärast põhikooli ja sellest, kes aitab otsustada",
    alt: "Teismeline ja täiskasvanu panevad laual kokku sammudest raja, mis viib lipuga eesmärgini.",
    caption: "Pilt 1. Samm-sammult: mis saab pärast 9. klassi?",
    prompts: ["Mida need kaks inimest laual teevad ja mis on raja lõpus?", "Milline võiks olla noore esimene samm pärast põhikooli: avatud uste päev, nõustaja või midagi muud?", "Kes aitas sinul 15-aastaselt otsustada ja kes aitab sinu peres praegu?"],
  },
  {
    id: "b1b2-032-avasta-1",
    // 2026-11-25 (v5): the input is one radio show; the picture moved to Harjuta (before the register task) so that no picture stands alone on an Avasta page
    phase: "practice",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Raamatukogu õppelaual on vasakul mitu korda avatud ja alla joonitud raamat, paremal suletud raamat ning küsimuskaartide komplekt, mille abil noor naine meenutab õpitut ilma vihjeta. Teine naine osutab küsimuskaartidelt edasi selgele tulemuse märgile.",
    accent: "the self-testing question-card set",
    text: [],
    place: "032_p_register",
    learningJob: "võrrelda ülelugemist ja enda kontrollimist ning öelda, kumb jätab rohkem meelde",
    alt: "Laual on alla joonitud raamat ja küsimuskaardid; üks inimene kontrollib end kaartidega.",
    caption: "Pilt 1. Raamat lahti või raamat kinni?",
    prompts: ["Mida teeb noor naine küsimuskaartidega ja miks on raamat kinni?", "Kumb aitab sinu arvates rohkem: üle lugeda või end kaartidega kontrollida? Kontrolli raadiost.", "Kuidas sina õpid sõnu: raamat lahti või kinni?"],
  },
  {
    id: "b1b2-033-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    // 2026-11-18 (v4): the old picture (an opinion piece on grades) did not serve a lesson on a new profession; the image
    // is reused from est-c1-041-kasuta-1 (career counselling: the bridge of transferable skills between two professions),
    // copied to this lesson's folder
    scene: "Karjäärinõustamisel paigutab naine oma senised oskused uue ameti kaardile. Laual on kaks kõrvutist oskuste rada ning nende vahel ülekantavate oskuste sild.",
    accent: "the bridge of transferable skills between the two career paths",
    text: [],
    place: "033_d_scheme",
    learningJob: "rääkida, milliseid oskusi saab vanast ametist uude kaasa võtta ja kes aitab ametit vahetada",
    alt: "Karjäärinõustaja ja klient ühendavad laual kahe ameti oskuste rajad sillaga.",
    caption: "Pilt 1. Mida saab vanast ametist uude kaasa võtta?",
    prompts: ["Mida need kaks inimest laual teevad ja mis on nende vahel olev sild?", "Millise oskuse saaks kassapidaja raamatupidaja töösse kaasa võtta?", "Millise oma oskuse võtaksid sina uude ametisse kaasa?"],
  },
  {
    id: "b1b2-034-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-18 (v4): the old picture (a library study corner proposal) did not serve a lesson on who pays for learning;
    // the image is reused from est-c1-031-kasuta-1 (time and money lead to training, then a schedule, a certificate and
    // results), copied to this lesson's folder
    scene: "Kaks töökaaslast vaatavad tahvlit: liivakell ja mündid viivad koolituseni ning sealt kalendri, tunnistuse ja tulemuseni. Mees märgib kalendrisse õppimise nädala.",
    accent: "the path from time and money to training and results",
    text: [],
    place: "034_d_listen",
    learningJob: "rääkida, kust tulevad õppimiseks aeg ja raha ning mida koolitus annab",
    alt: "Kaks inimest vaatavad tahvlit, kus aeg ja raha viivad koolituse, kalendri, tunnistuse ja tulemuseni.",
    caption: "Pilt 1. Aeg + raha = õppimine?",
    prompts: ["Mida tähendavad tahvlil liivakell ja mündid?", "Mida märgib mees kalendrisse ja kellega ta peab enne rääkima?", "Kust tuleksid sinu järgmise kursuse jaoks aeg ja raha?"],
  },
  {
    id: "b1b2-035-kasuta-1",
    // 2026-11-25 (v5): the control is one sheet (listening + writing); the picture opens the writing part, whose second
    // task is the same learning plan as a text
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Markus"],
    scene: "Koosolekul esitavad kaks inimest õppimise plaani. Tahvlil seostuvad vajaduse, sobiva aja, koolituse ja hilisema kasutamise sümbolid üheks rajaks; kuulajad istuvad laua taga.",
    accent: "the connected learning plan",
    text: [],
    place: "035_t_wpart",
    learningJob: "kirjutada oma õpitee järgmisest sammust: vajadus, aeg, õppimine ja kasu",
    alt: "Kaks inimest esitlevad koosolekul nelja sammuga õppimise plaani.",
    caption: "Pilt 1. Minu õpitee järgmine samm.",
    prompts: ["Mis neli sammu on tahvlil ja miks just selles järjekorras?", "Mida võiks lugeja sinu plaani kohta küsida?", "Mis on sinu plaanis esimene samm?"],
  },
];
