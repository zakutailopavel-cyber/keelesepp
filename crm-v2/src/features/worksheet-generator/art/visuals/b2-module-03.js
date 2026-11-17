// Visual briefs of b1b2 module 03; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// 2026-11-17 (design v4, task-based module 3): learner-facing text (alt, caption, prompts) without the course cast
// (docs/COURSE_CAST.md); the `cast` field still records who the picture shows. Three pictures are reused from other lessons
// because they fit the new lessons (docs/COURSE_DESIGN_STATIONS.md §7.13: reuse before ordering a new one), copied to this
// module's folders: 011 ← a2b1-010-avasta-1 (a family table with a cake and a photo album), 013 ← b1b2-077-kasuta-1 (a
// personal time line of the way to Estonian), 014 ← b1b2-058-avasta-1 (safety rules and a confirmation on a phone).
// 012 keeps its own picture (experiences vs one dated day). Briefs and pictures made by Codex (built-in image generation)
// per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-011-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Viktor", "Jaan"],
    // reused from a2b1-010-avasta-1 (2026-11-17): a family prepares a festive table, one looks at the family album
    scene: "Pere laua juures valmistatakse peolauda: üks toob kooki, teine vaatab vana fotoalbumit, kolmas toob joogid. Laud ja album seovad toidu pere mälestustega.",
    accent: "the birthday cake",
    text: [],
    learningJob: "meenutada oma pere peolauda ja jutustada lihtminevikus, mida pühade ajal söödi ja kes seda tegi",
    alt: "Pere katab peolauda: kook, joogid ja vana fotoalbum.",
    caption: "Pilt 1. Peolaud ja pere album.",
    place: "011_d_read",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida pere pildil ette valmistab ja miks on laual fotoalbum?", "Mis oli sinu lapsepõlve sünnipäeva- või pühadelaual? Kes selle tegi?", "Mis toit meenutab sulle kodu? Ütle kaks lauset lihtminevikus."],
  },
  {
    id: "b1b2-012-avasta-1",
    phase: "discover",
    format: "comparison",
    cast: ["Anna"],
    scene: "Ühe inimese üldised elu- ja reisikogemused on kõrvutatud ühe konkreetse mäkketõusu päeva ning tulemusega.",
    accent: "the bridge from experience to example",
    text: [],
    learningJob: "eristada ajata kogemust (olen käinud) ja kindlal ajal toimunud sündmust (käisin eelmisel suvel)",
    alt: "Inimese kogemused vasakul ja üks kindel matkapäev paremal.",
    caption: "Pilt 1. Kogemus ja üks kindel kord.",
    place: "012_d_radio",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida on see inimene elus teinud? Ütle täisminevikus: ta on …", "Mis juhtus sel ühel päeval mäel? Ütle lihtminevikus.", "Mida oled sina Eesti looduses juba kogenud ja millal see oli?"],
  },
  {
    id: "b1b2-013-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Igor"],
    // reused from b1b2-077-kasuta-1 (2026-11-17): a personal time line on the way to Estonian
    scene: "Raamatukogu keelekohvikus jutustab inimene ajajoone abil oma teest: saabumine Eestisse, kursus, vestlusring, esinemine. Iga etapp on ajajoonel oma kohal.",
    accent: "the final confident speaking milestone on the learning timeline",
    text: [],
    learningJob: "panna oma elu sündmused ajajoonele ja öelda enneminevikuga, mis oli juhtunud enne",
    alt: "Inimene jutustab ajajoone abil oma teest eesti keeleni.",
    caption: "Pilt 1. Elu ajajoon: mis oli enne, mis pärast.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Millised etapid on ajajoonel? Mis juhtus kõigepealt?", "Mis oli juba juhtunud, kui ta esimest korda esines?", "Milline oleks sinu ajajoone esimene ja viimane punkt?"],
  },
  {
    id: "b1b2-014-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Markus"],
    // reused from b1b2-058-avasta-1 (2026-11-17): safety rules on the wall, a confirmation on a phone
    scene: "Koolitusel osutab üks inimene seinal olevale turvareeglite skeemile; teine kinnitab telefonis sisselogimist. Pildil on küsimus: millal tohib kinnitada ja millal mitte.",
    accent: "the confirmation request on the phone",
    text: [],
    learningJob: "seostada telefonis kinnitamine pettuse riskiga ja jutustada oma veast või õppetunnist",
    alt: "Seinal on turvareeglid, üks inimene kinnitab telefonis päringut.",
    caption: "Pilt 1. Kas seda päringut tohib kinnitada?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimene telefonis kinnitab? Kas sina kinnitaksid päringut, mida sa ise ei alustanud?", "Milliseid turvareegleid sina järgid?", "Kas sa oled kunagi midagi kinnitanud või maksnud ja hiljem kahetsenud?"],
  },
];
