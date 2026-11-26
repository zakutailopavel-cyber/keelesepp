// Visual briefs of A2 module 07 (lessons a2-031…035); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 + v6 (docs/METHODOLOGY_A2_V5.md, docs/METHODOLOGY_V6.md, 2026-11-26): one learning picture per teaching
// lesson (031–034), each carrying a task and standing on the same page as that task (`place`) — the store's floors of 031
// are the guided „who looks for what, on which floor?” task (things in the base form → otsib sooja halli salli), the shop
// flyer of 032 is what the learner explains to a neighbour (mediation), the two jackets of 033 open Kasuta with the S1 corner and
// the comparatives (odavam, soojem, kas teil on suuremat?), the four frames of 034 are the picture story the learner writes.
// Line drawings the content agent made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2,
// one lime accent each; Codex may redraw them from the same briefs. No cast character is drawn or named. The control (035)
// has no picture. The earlier cast scenes (Codex, built-in image generation) are in RETIRED below and their files stay in
// public/.
export default [
  {
    id: 'a2-031-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Vasakul kolmekorruseline kaubamaja läbilõikes, katusega. 3. KORRUS · KODU: tass (sinine), lamp (valge), taldrik (valge); 2. KORRUS · RIIDED: sall (hall, soe), müts (punane), kindad (soojad); 1. KORRUS · TOIT: tee (hea), kohv, šokolaad; 1. korrusel LIFT. Iga asja all sõna algvormis ja omadussõna. Paremal kolm kliendikaarti lihtsa inimesega: KLIENT 1 — sall: soe, hall; KLIENT 2 — 2 × tass: sinine; KLIENT 3 — lamp: valge, tee: hea; igal kaardil „Mida ta otsib? Kus?”.',
    accent: 'the title „KAUBAMAJA TÄHT: KES MIDA OTSIB?” and the three floor labels',
    text: ['KAUBAMAJA TÄHT: KES MIDA OTSIB?', '3. KORRUS · KODU', '2. KORRUS · RIIDED', '1. KORRUS · TOIT', 'tass', 'sinine', 'lamp', 'valge', 'taldrik', 'sall', 'hall, soe', 'müts', 'punane', 'kindad', 'soojad', 'tee', 'hea', 'kohv', 'šokolaad', 'TEE', 'KOHV', 'LIFT', 'KLIENT 1', 'sall: soe, hall', 'KLIENT 2', '2 × tass: sinine', 'KLIENT 3', 'lamp: valge', 'tee: hea', 'Mida ta otsib? Kus?'],
    learningJob: 'juhendatud kasutus paaris: A ütleb klientide 1 ja 2 kohta, mida nad otsivad ja mis korrusel see on (Ta otsib sooja halli salli. See on teisel korrusel. Ta otsib kahte sinist tassi.), B kontrollib korrust; siis B klient 3 (Ta vajab valget lampi ja head teed) — pildil on algvorm, osastava teeb õppija ise',
    place: '031_p_floors',
    alt: 'Kaubamaja kolm korrust: kolmandal tass, lamp ja taldrik, teisel sall, müts ja kindad, esimesel tee, kohv ja šokolaad. Paremal kolm klienti: üks otsib sooja halli salli, teine kahte sinist tassi, kolmas valget lampi ja head teed.',
    caption: 'Kaubamaja Täht: kes mida otsib?',
    prompts: ['Mida otsib klient 1?', 'Mis korrusel on tassid?', 'Mida sina seal otsid?'],
  },
  {
    id: 'a2-032-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Poe reklaamleht raamis, pealkiri POOD PIHLAKAS: NÄDALA PAKKUMISED. Kuus kasti ikooniga, nime ja hinnasildiga: PIIM 1 l — 2 tk = 2 €; LEIB — 1,50 €; KOHV — 6 €; TALVEMÜTSID — kõik 10 € eest; MÄNGUASJAD — kuni −50 % · kuni 15 €; KLIENDIKAART — kohv −10 %. All riba „Ostad üle 20 € → 1 kg õunu tasuta!” ja lahtiolekuajad E–R 8–20 · L 9–16 · P suletud.',
    accent: 'the title and the six price tags',
    text: ['POOD PIHLAKAS: NÄDALA PAKKUMISED', 'PIIM 1 l', '2 tk = 2 €', 'LEIB', '1,50 €', 'KOHV', '6 €', 'TALVEMÜTSID', 'kõik 10 € eest', 'MÄNGUASJAD', 'kuni −50 % · kuni 15 €', 'KLIENDIKAART', 'kohv −10 %', 'Ostad üle 20 € → 1 kg õunu tasuta!', 'E–R 8–20 · L 9–16 · P suletud', 'PIIM', 'KOHV'],
    learningJob: 'põhiülesanne (vahendus): õppija seletab lehte telefonis naabrile Galinale, kes eesti keelt ei loe — valib ainult Galinale vajaliku (piim, leib, kohv, müts) ja ütleb selle arvu omastavaga (kaks pakki kahe euro eest, mütsid kümne euro eest, kohvil kümne protsendi soodustus) ning millal pood on lahti',
    place: '032_t_flyer',
    alt: 'Poe reklaamleht: piim kaks pakki kahe euro eest, leib 1,50, kohv 6 eurot, talvemütsid kümne euro eest, mänguasjad kuni poole odavamad, kliendikaardiga kohv kümme protsenti odavam; üle 20 euro ostuga kilo õunu tasuta; pood on lahti esmaspäevast reedeni 8–20, laupäeval 9–16, pühapäeval suletud.',
    caption: 'Pood Pihlakas: nädala pakkumised.',
    prompts: ['Mille eest saab talvemütsi?', 'Millal pood on lahti?', 'Mida saab tasuta?'],
  },
  {
    id: 'a2-033-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Kasutatud asjade pood: vasakul riidepuul kaks jopet ja nende all hinnakaardid — HALL JOPE 25 €, suurus L, kerge; MUST JOPE (triibuline) 40 €, suurus M, soe, peaaegu uus. Paremal proovikabiin eesriidega (PROOVIKABIIN), selle ees lihtne inimene ja mull „Liiga väike!”. All küsimus „Kumb jope on parem? Kumb on odavam?”.',
    accent: 'the title „POOD „UUS ELU”: KAKS JOPET” and the two price tags',
    text: ['POOD „UUS ELU”: KAKS JOPET', 'HALL JOPE', '25 €', 'suurus L', 'kerge', 'MUST JOPE', '40 €', 'suurus M', 'soe, peaaegu uus', 'PROOVIKABIIN', 'Liiga väike!', 'Kumb jope on parem? Kumb on odavam?'],
    learningJob: 'eksaminurk S1 (pildi kirjeldus ja teemaküsimused) ja võrdlus: õppija kirjeldab pilti umbes minuti ja võrdleb jopesid keskvõrdega (hall on odavam ja kergem, must on soojem ja kallim; Kas teil on suuremat?); see avab Kasuta ja annab hinnavõrdlusele näite',
    place: '033_p_picture',
    alt: 'Kaks jopet riidepuul: hall jope 25 eurot, suurus L, kerge; must jope 40 eurot, suurus M, soe ja peaaegu uus. Paremal proovikabiin, inimene ütleb: liiga väike.',
    caption: 'Kaks jopet: kumb on parem?',
    prompts: ['Kumb jope on odavam?', 'Kumb jope on soojem?', 'Mida ütleb inimene proovikabiinis?'],
  },
  {
    id: 'a2-034-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Neli raami, igaühel number ja kuupäev: 1 · 3.12 — jope riidepuul, hinnasilt 59 €, kviitung (KVIITUNG, jope 59 €, 3.12); 2 · 10.12 — sama jope, lukk on katki (sakiline joon), mull „Lukk katki!”; 3 · 12.12 — infolett (INFOLETT), letil kviitung ja kokku pandud jope (JOPE), silt „Vahetus 14 päeva jooksul”; 4 · 12.12 — uus jope ja suur linnuke, silt UUS JOPE.',
    accent: 'the title „MINU OSTULUGU: NELI PILTI” and the four frame labels',
    text: ['MINU OSTULUGU: NELI PILTI', '1 · 3.12', '2 · 10.12', '3 · 12.12', '4 · 12.12', '59 €', 'KVIITUNG', 'jope 59 €', '3.12', 'Lukk katki!', 'INFOLETT', 'JOPE', 'Vahetus', '14 päeva jooksul', 'UUS JOPE'],
    learningJob: 'põhiülesanne (pildilugu): õppija kirjutab pildi kõrval plaani (märksõnad iga raami kohta) ja selle järgi ilma antud alguse ja valmis lauseteta 30–45 sõna — millal ja mille eest ta jope ostis, mis juhtus, mida ta infoletis ütles ja mis oli kaasas (kviitungiga, kahe nädala jooksul), kuidas lugu lõppes',
    place: '034_t_plan',
    alt: 'Pildilugu neljas osas: 3. detsembril ostetud jope 59 eurot ja kviitung; 10. detsembril on lukk katki; 12. detsembril infoletis kviitung ja jope, vahetus 14 päeva jooksul; lõpuks uus jope.',
    caption: 'Minu ostulugu: neli pilti.',
    prompts: ['Millal ja mille eest ostis inimene jope?', 'Mis juhtus 10. detsembril?', 'Kuidas lugu lõppes?'],
  },
];

// Retired from the sheets in the methodology v5 + v6 rewrite (2026-11-26): cast scenes that did not carry the lesson's
// task; module 7 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson
// needs them.
export const RETIRED = [
  {
    id: "a2-031-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Siiri"],
    scene: "Anna ja Siiri võrdlevad poes laual olevat kataloogi kolme igapäevase kaubaga: lamp, tass ja kott; nad osutavad eri valikutele.",
    accent: "Anna’s top",
    text: [],
    learningJob: "compare catalogue items and choose one suitable product",
    alt: "Anna ja Siiri valivad poe kataloogist sobivat kaupa.",
    caption: "Pilt 1. Kauba valimine kataloogist.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna ja Siiri vaatavad?", "Mis kaubad on kataloogis?", "Mida sina uude koju ostad?"],
  },
  {
    id: "a2-032-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Siiri"],
    scene: "Poe kassas asetab Markus letile kolm õuna ja kaks leiba; Siiri loendab kaupu ning näitab kassakuvarit ilma tekstita.",
    accent: "the three apples",
    text: [],
    learningJob: "state quantities, calculate a total and check the purchase at the till",
    alt: "Markus ja Siiri loendavad kassas kaupu ja kontrollivad ostu.",
    caption: "Pilt 1. Kogused ja hind kassas.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Markus letile paneb?", "Mida Siiri teeb?", "Kui palju maksavad kolm õuna ja kaks leiba?"],
  },
  {
    id: "a2-033-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Anna"],
    scene: "Riidepoe proovikabiini ees võrdleb Sofia kahte jopet, üht lühemat ja üht pikemat; Anna näitab, kumb paremini sobib.",
    accent: "Anna’s top",
    text: [],
    learningJob: "compare two clothing options and justify which one fits better",
    alt: "Sofia ja Anna võrdlevad riidepoes kahte jopet.",
    caption: "Pilt 1. Kahe variandi proovimine ja valimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia võrdleb?", "Kumb jope on pikem?", "Kumb jope sulle rohkem meeldib ja miks?"],
  },
  {
    id: "a2-034-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Viktor", "Siiri"],
    scene: "Viktor seisab poe teeninduslauas katkise veekeetja ja kviitungiga; Siiri kontrollib kviitungit ning näitab tagastuskasti.",
    accent: "the receipt",
    text: [],
    learningJob: "infer the return problem and explain what should happen next",
    alt: "Viktor näitab teeninduslauas katkist kaupa ja kviitungit.",
    caption: "Pilt 1. Kauba tagastamine kviitungiga.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Viktor käes hoiab?", "Mida Siiri kontrollib?", "Mida on vaja, kui sa tahad kaupa tagastada?"],
  },
  {
    id: "a2-035-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Siiri"],
    scene: "Anna toob poe teeninduslauda vale suurusega jope; Siiri hoiab kaht eri suurusega jopet ja aitab valida vahetuse.",
    accent: "Anna’s top",
    text: [],
    learningJob: "request a size exchange and choose the correct replacement",
    alt: "Anna vahetab teeninduslauas vale suurusega jopet.",
    caption: "Pilt 1. Suuruse vahetamine poes.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Miks Anna on teeninduslauas?", "Mida Siiri käes hoiab?", "Mida sa ütled, kui jope on liiga väike?"],
  },
];
