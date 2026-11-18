// Visual briefs of b1b2 module 10; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 10,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures are kept
// and retargeted to the new lessons (no new pictures). Briefs and pictures made by Codex (built-in image generation) per
// docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-046-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    // 2026-11-19 (v4): the same picture, retargeted from a selection committee to describing a friend for a landlady:
    // two people link a trait to the deed that proves it
    scene: "Kaks inimest võrdlevad laual kahte inimese kirjelduse kaarti. Kaartide kõrval on tegude tõendid: tähtajast kinnipidamine, teise aitamine, rahulik vestlus ja korralik plaan. Tahvlil ühendab joon omaduse tõendiga.",
    accent: "the trait-to-evidence connection board",
    text: [],
    place: "046_t_call",
    learningJob: "kirjeldada inimese iseloomu täpse omadussõnaga ja tõendada seda konkreetse teoga",
    alt: "Kaks inimest seovad laual omadused tegudega, mis neid tõendavad.",
    caption: "Pilt 1. Omadus vajab tõendit: mida inimene tegi?",
    prompts: ["Mida need kaks inimest laual teevad ja mida joon tahvlil ühendab?", "Milline tegu tõendab, et sinu sõber on usaldusväärne?", "Millise omaduse tõendaksid sina iseenda kohta ühe teoga?"],
  },
  {
    id: "b1b2-047-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Markus"],
    // 2026-11-19 (v4): retargeted from a work misunderstanding to money between friends: event → feeling → reaction
    scene: "Kaks inimest räägivad laua taga ühest arusaamatusest. Nende kohal on kolmeosaline skeem: vasakul sündmus (kalender), keskel tunne (kurb nägu) ja paremal reaktsioon (nimekiri järgmistest sammudest).",
    accent: "the cause-emotion-reaction chain",
    text: [],
    place: "047_d_feel",
    learningJob: "nimetada täpne tunne ning siduda see põhjuse ja sellele järgnenud reaktsiooniga",
    alt: "Kaks inimest laua taga; nende kohal skeem: sündmus, tunne ja reaktsioon.",
    caption: "Pilt 1. Sündmus → tunne → reaktsioon.",
    prompts: ["Mida näitab skeemi kolm osa?", "Mis oli Olesja loos sündmus, mis tunne ja mis reaktsioon?", "Too oma elust üks näide: mis juhtus, mida sa tundsid ja mida sa siis tegid?"],
  },
  {
    id: "b1b2-048-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Anna", "Jaan"],
    // 2026-11-19 (v4): the stairwell mediation now serves the noise dispute and its house chat
    scene: "Kortermaja trepikojas seisab vahendaja kahe naabri vahel ja kirjutab mõlema ütlused oma märkmikusse. Nooled liiguvad kummaltki naabrilt vahendaja poole, mitte otse teineteise poole. Trepi kõrval on jalgratas.",
    accent: "the mediator's neutral notes between two neighbours",
    text: [],
    place: "048_d_voice",
    learningJob: "kirjeldada, kuidas vahendaja annab mõlema poole sõnad erapooletult edasi",
    alt: "Trepikojas kirjutab vahendaja üles kahe naabri sõnad.",
    caption: "Pilt 1. Vahendaja annab sõnad edasi, aga ei mõista kohut.",
    prompts: ["Miks liiguvad nooled vahendaja poole, mitte otse teise naabri poole?", "Mida peaks vahendaja oma märkmikusse kirjutama ja mida mitte?", "Kas sinu majas on keegi, kes võiks olla hea vahendaja? Miks?"],
  },
  {
    id: "b1b2-049-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Jaan", "Sofia"],
    // 2026-11-19 (v4): the family holiday plan now serves the negotiation game „üks suvi, kolm soovi”
    scene: "Pere laua ääres osutavad kolm inimest kolmele soovikaardile: meri, matk ja linn. Laual olevale kaardile on joonistatud üks marsruut, mis ühendab kõik kolm soovi.",
    accent: "the balanced compromise itinerary",
    text: [],
    place: "049_t_cards",
    learningJob: "selgitada kolme osapoole huvisid ja koostada konkreetne kompromiss",
    alt: "Kolm pereliiget ühendavad mere, matka ja linna üheks suveplaaniks.",
    caption: "Pilt 1. Kolm soovi, üks plaan.",
    prompts: ["Mida iga pereliige tahab ja mis võiks olla tema tegelik huvi?", "Kuidas ühendab laual olev marsruut kõik kolm soovi?", "Millise kompromissi oled sina kunagi perega või sõpradega teinud?"],
  },
  {
    id: "b1b2-050-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Anna", "Markus"],
    scene: "Konfliktikoolitusel harjutavad kaks inimest juhendaja abiga. Kesksel rajal on neli sammu: kuulamine, tunde nimetamine, teise sõnade erapooletu edasiandmine ja kokkulepe käepigistusega.",
    accent: "the four-step conflict-resolution practice route",
    text: [],
    place: "050_t_product",
    learningJob: "rakendada kuulamist, tunnete põhjendamist, kaudset kõnet ja kompromissi ühe konflikti lahendamisel",
    alt: "Kaks inimest harjutavad juhendajaga konflikti lahendamise nelja sammu.",
    caption: "Pilt 1. Konflikti lahendamise neli sammu.",
    prompts: ["Millised on raja neli sammu?", "Millise sammu tegid sina oma kokkuleppe loos kõige paremini?", "Milline samm on sinu jaoks kõige raskem ja miks?"],
  },
];
