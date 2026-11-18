// Visual briefs of b1b2 module 09; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 9,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures, retargeted
// to the new lessons (the food label, the pharmacy, movement or rest, the 8-week plan, the exam letter); no new picture was
// needed. Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by
// KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-041-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Jaan"],
    // 2026-11-19 (v4): the same picture (habit cards: sleep, water, food, a phone pause; the daily-walk card with an
    // arrow to energy), retargeted from a workplace health month to cause and effect before the chart summary
    scene: "Laual on hallid une, vee, toidu ja telefonipausi kaardid; üks inimene tõstab esile keskse igapäevase kõnni kaardi ja teine osutab sellelt energia ja parema enesetunde sümbolini viivale noolele.",
    accent: "the daily-walk habit card and its cause-effect arrow",
    text: [],
    place: "041_t_chart",
    learningJob: "siduda harjumus ja selle tagajärg (tänu millele, mille tõttu) enne kokkuvõtet joonisest",
    alt: "Laual on harjumuste kaardid; nool viib kõnni kaardilt energia ja parema enesetunde märgini.",
    caption: "Pilt 1. Harjumus → tagajärg.",
    prompts: ["Milliseid harjumusi kaardid laual näitavad?", "Mida näitab nool kõnni kaardilt energia märgini? Ütle see tänu-lausega.", "Milline sinu toiduharjumus mõjub sinu enesetundele kõige rohkem ja miks?"],
  },
  {
    id: "b1b2-042-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor"],
    // 2026-11-19 (v4): the same picture (a younger woman offers an older, tired man a choice card with three realistic
    // first steps), retargeted from neighbourly advice to the soft advice for an older relative in the info gap
    scene: "Kortermaja puhkenurgas kuulab noorem naine väsinud vanemat meest. Nende vahel on valikukaart kolme realistliku võimalusega ilma tekstita: lühike jalutuskäik, telefonikõne ja kohvilaud sõpradega. Naine pakub nõu avatud peopesaga, mees valib ise esimese sammu.",
    accent: "the gentle-advice choice card",
    text: [],
    place: "042_t_gap",
    learningJob: "anda vanemale pereliikmele pehmet nõu tingiva kõneviisiga ja jätta valik talle",
    alt: "Noorem naine pakub vanemale mehele kaardil kolm võimalust ja laseb tal ise valida.",
    caption: "Pilt 1. Pehme nõuanne jätab valiku.",
    prompts: ["Kuidas naine nõu annab: käsuga või pakkumisega? Mis seda näitab?", "Miks on hea, et valikuid on kolm?", "Mida ütleksid sina tädile, kes ei taha apteeki ise minna? Alusta: „Sa võiksid …”"],
  },
  {
    id: "b1b2-043-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-19 (v4): the same picture (a café corner: grey symbols of overload are gathered into one card of feasible
    // changes), retargeted from burnout at work to the compromise at the end of the movement-or-rest debate
    scene: "Vaikses kohvikunurgas räägivad kaks inimest väsimusest. Laual on hallid sümbolid pikkade päevade, hilise e-kirja ja kadunud vaba aja kohta; need koondatakse kesksele kaardile, kus on mõned teostatavad muudatused.",
    accent: "the feasible change-plan card",
    text: [],
    place: "043_t_debate",
    learningJob: "leida väitluse lõpus kompromiss: mida väsinud inimene pigem teeb ja millest loobub",
    alt: "Kaks inimest koondavad väsimuse põhjused laual ühele teostatavate muudatuste kaardile.",
    caption: "Pilt 1. Väsimusest kompromissini.",
    prompts: ["Mis väsitab laua ääres istuvat inimest? Mida sümbolid näitavad?", "Milline muudatus kaardil on kõige realistlikum? Ütle: „Pigem … kui …”", "Mis oleks sinu kompromiss trenni ja puhkuse vahel?"],
  },
  {
    id: "b1b2-044-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Jaan"],
    // 2026-11-19 (v4): the same picture (from long sitting, late nights and fast food a step-by-step route leads to
    // walking, regular sleep, home food and more energy), next to the radio interview on how a habit forms
    scene: "Nõustamislaua juures koostavad kaks inimest kolme kuu plaani. Hallid algseisu kaardid näitavad pikka istumist, hilist magamaminekut ja kiirtoitu; nende juurest viib samm-sammuline rada kõnni, regulaarse une ja koduse toiduni ning lõpuks energilisema enesetundeni.",
    accent: "the connected step-by-step lifestyle route",
    text: [],
    place: "044_d_radio",
    learningJob: "siduda algseis, eesmärk, väikesed sammud ja oodatav tulemus üheks plaaniks",
    alt: "Rada viib istumise, hilise une ja kiirtoidu kaartidelt väikeste sammude kaudu parema enesetundeni.",
    caption: "Pilt 1. Väikeste sammudega harjumuseni.",
    prompts: ["Milline on algseis ja milline on eesmärk pildil?", "Miks on rada jagatud väikesteks sammudeks? Kontrolli raadiost.", "Milline samm oleks sinu enda elus kõige raskem ja mis aitaks?"],
  },
  {
    id: "b1b2-045-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Jaan"],
    // 2026-11-19 (v4): the same picture (an editorial desk: a situation card and an answer card that fits the reader's
    // situation), next to the exam letter to the housing association
    scene: "Toimetuse laual arutavad kaks inimest lugejakirja. Hall olukorrakaart näitab inimese töö-, pere- ja kodukoormust; selle kõrval on keskne vastusekaart, mis ühendab kuulamise, ühe realistliku muudatuse ja selle põhjenduse.",
    accent: "the situation-specific response card",
    text: [],
    place: "045_t_letter",
    learningJob: "kirjutada kiri, mis arvestab adressaadi olukorda: seisukoht, põhjus, mure ja ettepanek",
    alt: "Kaks inimest koostavad laua taga vastust, mis sobib lugeja olukorraga.",
    caption: "Pilt 1. Hea kiri arvestab lugejaga.",
    prompts: ["Mida näitavad kaks kaarti laual?", "Mida peab hea kiri ühistu juhatusele sisaldama?", "Mis on sinu ettepanek oma maja hoovi jaoks?"],
  },
];
