// Visual briefs of b1b2 module 15; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 15,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures are kept
// and retargeted to the new lessons (no new pictures): fact / opinion / assumption cards → the headline game (071), the
// magnifier on the author's viewpoint → the opinion column (072), the argument chain → the influencer case (073), summary
// vs reaction → the wage news (074), the critical-reading toolbox → the module product „Minu meediamenüü” (075).
// Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by
// KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-071-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Igor"],
    // 2026-11-19 (v4): the same picture, retargeted from the storyline to the headline game
    scene: "Toimetuse laua ääres sorteerivad kaks toimetajat pealkirjade väiteid kolme hunnikusse. Kontrollitava fakti kaardil on kalender, arv ja allikas; hinnangu kaardil on emotsionaalne hüüumärk; oletuse kaardil on küsimärk ja tulevikunool.",
    accent: "the verified fact card with measured evidence",
    text: [],
    place: "071_d_vocab",
    learningJob: "eristada pealkirjas kontrollitavat fakti, hinnangut ja oletust nende keeleliste tunnuste järgi",
    alt: "Kaks toimetajat jagavad pealkirjade väited faktideks, hinnanguteks ja oletusteks.",
    caption: "Pilt 1. Fakt on kontrollitav, hinnang ütleb, mis on hea või halb, oletus ei ole veel kindel.",
    prompts: ["Millistesse hunnikutesse toimetajad väiteid sorteerivad?", "Mille järgi tunned pealkirjas ära hinnangu või oletuse?", "Too üks näide pealkirjast, mida sa viimati nägid: kas see oli fakt, hinnang või oletus?"],
  },
  {
    id: "b1b2-072-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Jüri"],
    // 2026-11-19 (v4): retargeted to the opinion column about comment sections
    scene: "Lugemisringis uurivad kaks lugejat arvamusloo autori seisukohta. Ühel tahvlil on rahulik elutuba, teisel lärmakas turuplats; luup ühendab korduva sõnavaliku, näited ja teksti rõhu autori järeldusega.",
    accent: "the magnifying glass connecting textual clues to the author's viewpoint",
    text: [],
    place: "072_d_open",
    learningJob: "järeldada autori seisukoht, toon ja eesmärk sõnavaliku, näidete ja rõhu põhjal",
    alt: "Kaks lugejat otsivad arvamusloost autori seisukohta näitavaid vihjeid.",
    caption: "Pilt 1. Autori seisukohta näitavad tema sõnavalik, näited ja see, mida ta rõhutab.",
    prompts: ["Mida võrdlevad kaks tahvlit?", "Kuidas aitavad sõnavalik ja näited leida autori seisukohta?", "Kas oled lugenud arvamuslugu, mille autor ei ütle oma arvamust otse? Too näide."],
  },
  {
    id: "b1b2-073-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Igor", "Liis"],
    // 2026-11-19 (v4): retargeted to the influencer case (claim, reason, evidence)
    scene: "Kaks inimest ehitavad tugeva argumendi neljast ühendatud plokist: selge väide, põhjus, konkreetne tõend ja vastuväite arvestamine. Kõrval laguneb nõrk väide, mida toetavad ainult kiitus ja ühe inimese kogemus.",
    accent: "the evidence block completing the strong argument chain",
    text: [],
    place: "073_d_pod",
    learningJob: "hinnata soovituse või reklaami väidet selle põhjuse ja tõendi järgi ning nõrka väidet ära tunda",
    alt: "Kaks inimest võrdlevad tugeva argumendi ahelat nõrga, ainult kiitusel põhineva väitega.",
    caption: "Pilt 1. Tugev väide toetub kontrollitavale tõendile, mitte ainult kiitusele.",
    prompts: ["Millistest neljast plokist koosneb tugev argument?", "Miks nõrk väide laguneb?", "Millise ploki puudumist märkad kõige sagedamini reklaamis või postituses?"],
  },
  {
    id: "b1b2-074-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-19 (v4): retargeted to the wage news (a summary that does not distort + a separate reaction)
    scene: "Kaks inimest jagavad uudise töötlemise kaheks etapiks. Esimesel neutraalsel kaardil tõstetakse pikast uudisest kolm põhimõtet lühikeseks kokkuvõtteks; teisel kaardil lisab lugeja eraldi oma nõustumise, põhjuse ja näite.",
    accent: "the clear divider between neutral summary and personal reaction",
    text: [],
    place: "074_d_text",
    learningJob: "eraldada uudise neutraalne kokkuvõte isiklikust põhjendatud reaktsioonist",
    alt: "Kaks inimest eraldavad uudise kokkuvõtte lugeja isiklikust reaktsioonist.",
    caption: "Pilt 1. Kõigepealt kokkuvõte, mis ei moonuta arve, seejärel eraldi oma reaktsioon.",
    prompts: ["Mis vahe on kahel kaardil?", "Miks peab kokkuvõte olema neutraalne ja oma arvamus eraldi?", "Võta lühidalt kokku üks uudis, mida oled hiljuti lugenud, ja lisa eraldi oma arvamus."],
  },
  {
    id: "b1b2-075-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Igor", "Jüri"],
    // 2026-11-19 (v4): retargeted to the module product „Minu meediamenüü”
    scene: "Pärast meediakontrolli vaatavad õppija ja õpetaja kriitilise lugemise tööriistakasti: pealkirja kontroll, autori vaatenurk, tõendi tugevus, kokkuvõte ja isiklik reaktsioon. Õppija valib igapäevase uudise jaoks ühe konkreetse harjutuse.",
    accent: "the selected daily critical-reading practice card",
    text: [],
    place: "075_t_product",
    learningJob: "valida oma meediamenüüsse igapäevane kriitilise lugemise harjutus",
    alt: "Õppija ja õpetaja valivad meediakontrolli järel igapäevase kriitilise lugemise harjutuse.",
    caption: "Pilt 1. Iga uudis annab võimaluse kriitilist lugemist harjutada.",
    prompts: ["Millised tööriistad on kriitilise lugemise kastis?", "Millise tööriista paned sina oma meediamenüüsse?", "Mida sa iga päev eesti keeles loed või kuulad ja millal?"],
  },
];
