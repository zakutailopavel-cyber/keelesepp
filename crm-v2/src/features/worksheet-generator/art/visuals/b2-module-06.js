// Visual briefs of b1b2 module 06; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-18 (task-based module 6 „Tööelu”,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex
// (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
// 2026-11-25 (methodology v5): the same pictures, each placed before the lesson's one input (028 moved from Kasuta to
// Avasta, 030 to the one control sheet before the speaking part); no new pictures ordered.
export default [
  {
    id: "b1b2-026-avasta-1",
    // v5 (2026-11-25): in Kasuta before the rubric (before the listening it stood alone on a page); the id keeps its old name
    phase: "transfer",
    format: "sequence",
    cast: ["Markus", "Liis", "Jaan"],
    // 2026-11-18 (v4): the old warehouse task board served the Tartu storyline, not a job search; the image is reused from
    // a2b1-045-avasta-1 (a worker reads a job ad, sends his CV, has an interview and starts in a café), copied here
    scene: "Töömehe riietes mees loeb kohviku töökuulutust, saadab arvutist CV, räägib töövestlusel ja teenindab lõpuks kohvikus klienti; nooled ühendavad sammud üheks teeks.",
    accent: "the path from the job ad to the first working day",
    text: [],
    place: "026_t_rubric",
    learningJob: "kirjeldada tööotsimise samme (kuulutus, CV, töövestlus, uus töö) ja oma teed tööni",
    alt: "Mees loeb töökuulutust, saadab CV, käib töövestlusel ja alustab kohvikus uut tööd.",
    caption: "Pilt 1. Kuulutusest esimese tööpäevani.",
    prompts: ["Mis on selle mehe teekonna neli sammu?", "Kellena ta enne töötas ja kelleks ta sai?", "Millise sammu oled sina juba teinud ja milline on veel ees?"],
  },
  {
    id: "b1b2-027-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Kaks inimest järjestavad laual hea töökoha kriteeriume: palk, juht, areng ja kolleegid on hallidel kaartidel, paindliku tööaja kaart (kodu ja kell) on esile tõstetud.",
    accent: "the flexible-work card with clock and home symbols",
    text: [],
    place: "027_d_contract",
    learningJob: "võrrelda tööpakkumise tingimusi ja öelda, mis on kõige olulisem",
    alt: "Kaks inimest järjestavad laual tööpakkumise kaarte: palk, juht, areng, kolleegid ja paindlik tööaeg.",
    caption: "Pilt 1. Mis on lepingus kõige olulisem?",
    prompts: ["Milliseid kaarte need kaks inimest laual järjestavad?", "Miks tõstab üks neist paindliku tööaja kõige kõrgemale?", "Milline kaart oleks sinu jaoks esimene ja milline viimane?"],
  },
  {
    id: "b1b2-028-kasuta-1",
    // v5 (2026-11-25): moved to Harjuta before the register task (chat → letter to the manager); the id keeps its old name
    phase: "practice",
    format: "scene",
    cast: ["Anna", "Markus"],
    scene: "Kontori rahulikus vestlusnurgas räägivad kaks kolleegi korduvast hilinemisest. Üks osutab laual olevale töökaustale, teine kuulab ja mõtleb; seinal on suur kell, laual tühi leht kokkuleppe jaoks.",
    accent: "the central wall clock",
    text: [],
    place: "028_p_register",
    learningJob: "rääkida tülist faktidega, küsida põhjust ja leppida kokku lahendus",
    alt: "Kaks kolleegi räägivad laua taga rahulikult; seinal on kell, laual töökaust ja tühi leht.",
    caption: "Pilt 1. Fakt, mitte süüdistus.",
    prompts: ["Mida näitavad kell ja töökaust laual?", "Mis sa arvad, mida mees praegu mõtleb?", "Mida kirjutaksid sina tühjale lehele kokkuleppeks?"],
  },
  {
    id: "b1b2-029-avasta-1",
    // v5 (2026-11-25): in Kasuta before the rubric (the idea card and the pitch); the id keeps its old name
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    // 2026-11-18 (v4): the old hybrid-work picture, retargeted to the own-business lesson: on the left someone works for
    // herself at home, on the right a person talks with an adviser; the calendar joins home and office
    scene: "Vasakul töötab naine kodus sülearvutiga, paremal räägib inimene laua taga nõustajaga; nende vahel on kalender kodu ja kontori sümbolitega.",
    accent: "the central home-and-office calendar",
    text: [],
    place: "029_t_rubric",
    learningJob: "kaaluda, kas ja kus oma oskusest väikest äri teha",
    alt: "Vasakul töötab naine kodus arvutiga, paremal räägib inimene nõustajaga; keskel on kalender kodu ja kontoriga.",
    caption: "Pilt 1. Kodus ise endale või kontoris kellelegi teisele?",
    prompts: ["Kes pildil töötab iseendale ja kes kellegi teise jaoks?", "Mida võiks paremal olev inimene nõustajalt küsida, kui ta tahab oma äri alustada?", "Kus sina oma väikest äri teeksid: kodus või mujal? Miks?"],
  },
  {
    id: "b1b2-030-kasuta-1",
    // v5 (2026-11-25): the control is one sheet (Avasta); the picture stands before the speaking part
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Anna"],
    scene: "Vestlusel räägib töötaja oma tööelust; nende vahel on tahvel kolme sümboliga: töövirn, kell ja kasvav taim.",
    accent: "the action-plan board",
    text: [],
    place: "030_t_spart",
    learningJob: "panna kokku oma tööelu kaart: kogemus, eesmärk, leping, tüli ja oma äri",
    alt: "Kaks inimest vestlevad; nende vahel on tahvel, millel on töövirn, kell ja kasvav taim.",
    caption: "Pilt 1. Minu tööelu kaart.",
    prompts: ["Mida võiksid tähendada töövirn, kell ja taim?", "Millest räägiksid sina sellel vestlusel esimesena?", "Mis on sinu tööelus järgmine samm?"],
  },
];
