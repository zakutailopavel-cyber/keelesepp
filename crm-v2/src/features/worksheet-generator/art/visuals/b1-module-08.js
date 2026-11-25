// Visual briefs of a2b1 module 08; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (036 a school's hobby-club table, 037 a
// learner's week with a goal and three notes, 038 three ways to learn on three cards, 039 a course attendance card with
// the missed lessons, the homework and the test). They are line drawings the content agent made from hand-written SVG
// (not generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent,
// pale-lime blob, grey); Codex may redraw them from the same briefs. No people of the continuing story. Each picture
// stands directly above the task that uses it (`place` = that task's id), so the picture and its task share a page. The
// earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below; their files stay in public/.
export default [
  {
    id: "a2b1-036-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kooli huviringide tabel heleroheline laigu peal, laimirohelise päisega „KOOLI HUVIRINGID”. Veerud: ring, päev, kell, vanus, hind. Read ikooniga: hammasratas „robootika” E 15.00 9–12 „20 € kuus”, pintsel „kunst” T 14.30 7–12 „tasuta”, malenupp „male” K 15.30 8–15 „tasuta”, noot „tants” N 16.00 7–10 „15 € kuus”, pall „korvpall” R 15.00 10–15 „10 € kuus”. All telefon „huvijuht: E–R 9–16” ja „kirja saab kuni reedeni”. Lauseid ei ole.",
    accent: "the table header",
    text: ["KOOLI HUVIRINGID", "ring", "päev", "kell", "vanus", "hind", "robootika", "kunst", "male", "tants", "korvpall", "E", "T", "K", "N", "R", "15.00", "14.30", "15.30", "16.00", "9–12", "7–12", "8–15", "7–10", "10–15", "20 € kuus", "tasuta", "15 € kuus", "10 € kuus", "huvijuht: E–R 9–16", "kirja saab kuni reedeni"],
    learningJob: "helistada huvijuhile, öelda, millest laps huvitub ja milles ta osaleda tahab (huvitub robootikast, osaleb tantsuringis), küsida päeva, kellaaega ja hinda ning reageerida, kui tabelis olev ring on täis või muutunud (varjatud info õpetaja kaardil)",
    place: "036_t_ring",
    alt: "Kooli huviringid: robootika esmaspäeval kell 15, 9–12-aastastele, 20 eurot kuus; kunst teisipäeval kell 14.30, tasuta; male kolmapäeval kell 15.30, tasuta; tants neljapäeval kell 16, 15 eurot kuus; korvpall reedel kell 15, 10 eurot kuus. Huvijuht vastab esmaspäevast reedeni kella 9–16, kirja saab kuni reedeni.",
    caption: "Kooli huviringid.",
    prompts: ["Millised ringid on tasuta?", "Mis ring sobib üheksa-aastasele lapsele?", "Millest sinu laps või sina huvitud?"],
  },
  {
    id: "a2b1-037-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Nädalaplaan „MINU ÕPPIMISNÄDAL” heleroheline laigu peal, paremal üleval laimirohelise sildiga „eesmärk: eksam mais”. Seitse päevaveergu hallide päistega E–P: raamat „kursus 18.00”, telefon „sõnad 15 min”, raadio „raadio bussis”, raamat „kursus 18.00”, „z z” „puhkus”, teler „film eesti keeles”, tass „keelekohvik 14.00”. All kolm märget: „pean: kodutöö iga nädal”, „tahan: julgemalt rääkida”, „raske: telefonis rääkida”.",
    accent: "the goal badge",
    text: ["MINU ÕPPIMISNÄDAL", "eesmärk: eksam mais", "E", "T", "K", "N", "R", "L", "P", "kursus", "18.00", "sõnad", "15 min", "raadio", "bussis", "puhkus", "film", "eesti keeles", "keelekohvik", "14.00", "pean:", "kodutöö iga nädal", "tahan:", "julgemalt rääkida", "raske:", "telefonis rääkida"],
    learningJob: "kirjutada sõbrale oma õppimisplaanist ja kasutada õiget vormi (pean tegema kodutööd, hakkan käima, tahan julgemalt rääkida, proovin kuulata, on raske telefonis rääkida)",
    place: "037_t_letter",
    alt: "Õppimisnädal: esmaspäeval ja neljapäeval kursus kell 18, teisipäeval 15 minutit sõnu, kolmapäeval raadio bussis, reedel puhkus, laupäeval film eesti keeles, pühapäeval keelekohvik kell 14. Eesmärk: eksam mais. Märkmed: pean tegema kodutööd iga nädal, tahan julgemalt rääkida, raske on telefonis rääkida.",
    caption: "Minu õppimisnädal.",
    prompts: ["Mida see õppija igal päeval teeb?", "Mida ta peab tegema ja mida tahab osata?", "Milline on sinu õppimisnädal?"],
  },
  {
    id: "a2b1-038-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kolm kaarti kõrvuti heleroheline laigu peal. „KURSUS”: tahvel ja kolm inimest, „2× nädalas”, „õpetaja ja rühm”, „+ reeglid”, „– kindel aeg”. „ÄPP”: telefon, „iga päev 15 min”, „üksi”, „+ bussis, pausil”, „– vähe rääkimist”. Laimirohelise päisega „KEELESÕBER”: kaks tassi ja kaks jutumulli, „1× nädalas”, „kohvik või veeb”, „+ päris vestlus”, „– tuleb leida”. Lauseid ei ole: põhjendused sõnastab õppija ise.",
    accent: "the KEELESÕBER header",
    text: ["KURSUS", "ÄPP", "KEELESÕBER", "2× nädalas", "õpetaja ja rühm", "+ reeglid", "– kindel aeg", "iga päev 15 min", "üksi", "+ bussis, pausil", "– vähe rääkimist", "1× nädalas", "kohvik või veeb", "+ päris vestlus", "– tuleb leida"],
    learningJob: "võrrelda kolme õppimisviisi ja põhjendada (sest, kuna, seepärast), mis sobib paarilisele ja endale, ning leppida kokku, mida järgmisel nädalal proovida",
    place: "038_t_choose",
    alt: "Kolm võimalust: kursus kaks korda nädalas õpetaja ja rühmaga — pluss reeglid, miinus kindel aeg; äpp iga päev 15 minutit üksi — pluss bussis ja pausil, miinus vähe rääkimist; keelesõber kord nädalas kohvikus või veebis — pluss päris vestlus, miinus tuleb leida.",
    caption: "Kolm võimalust.",
    prompts: ["Mis on iga võimaluse pluss ja miinus?", "Mis sobib inimesele, kellel on vähe aega?", "Mis sobib sulle ja miks?"],
  },
  {
    id: "a2b1-039-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kursuse kaart „EESTI KEELE KURSUS · 8 tundi” heleroheline laigu peal. Kaheksa ruutu: 1–3 linnuke, 4 ja 5 hall rist „haige”, 6 hall rist „tööreis”, 7 linnuke, 8 „?”. All kolm rida ikooniga: raamat „kodutöö: harjutused 20–25, reedeks”, tahvel „materjalid: kursuse lehel, 3. nädal”, kaks inimest „konsultatsioon: teisipäeval kell 17”. Laimirohelisel sildil „kontrolltöö: 2 nädala pärast”, paremal ümbrik „e-kiri õpetajale?”.",
    accent: "the test badge",
    text: ["EESTI KEELE KURSUS · 8 tundi", "1", "2", "3", "4", "5", "6", "7", "8", "haige", "tööreis", "kodutöö:", "harjutused 20–25, reedeks", "materjalid:", "kursuse lehel, 3. nädal", "konsultatsioon:", "teisipäeval kell 17", "kontrolltöö: 2 nädala pärast", "e-kiri õpetajale?"],
    learningJob: "kirjutada kursuse õpetajale viisakas e-kiri: miks puudusin tundidest (haiguse ja tööreisi pärast), mis jäi tegemata ja millist abi palun (Kas te saaksite …? Kas ma võiksin …?)",
    place: "039_t_reply",
    alt: "Kursuse kaheksast tunnist on 1.–3. ja 7. tehtud, 4. ja 5. jäid haiguse tõttu vahele, 6. tööreisi tõttu, 8. on veel ees. Kodutöö: harjutused 20–25 reedeks. Materjalid on kursuse lehel kolmanda nädala all. Konsultatsioon on teisipäeval kell 17. Kontrolltöö on kahe nädala pärast.",
    caption: "Minu kursus: mis jäi tegemata?",
    prompts: ["Mitmest tunnist õppija puudus ja miks?", "Mis tuleb järele teha?", "Millist abi sa õpetajalt paluksid?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-036-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Sofia ja Liis uurivad sõnadeta kolmapäevast tunniplaani, millel on eesti keele, matemaatika, ajaloo, lõuna, inglise keele kontrolliks valmistumise, kodutöö ja sõnavarakorduse ikoonid.",
    accent: "the mathematics card",
    text: [],
    learningJob: "kirjeldada õppeaineid, tunniplaani, ülesandeid, vahetunde ja kontrolltööks valmistumist",
    alt: "Sofia ja Liis vaatavad pika koolipäeva aineid ning ülesandeid.",
    caption: "Pilt 1. Kolmapäevane koolipäev ja õppeained.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis tund pildil käib?", "Mida õpilased teevad?", "Mis oli sinu lemmikaine koolis?"],
  },
  {
    id: "a2b1-037-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna koostab raamatukogus keeleeksami plaani, mille harud näitavad õppima minekut, sõnavara kordamist, kirjutamist, Liisiga rääkimist ja harjutustestide tegemist.",
    accent: "the speaking-practice branch",
    text: [],
    learningJob: "valida juhtverbi järgi ma- või da-infinitiiv ning selgitada mitme tegevusega õppimisplaani",
    alt: "Anna kavandab raamatukogus eksamiks õppimist ja Liisiga rääkimist.",
    caption: "Pilt 1. Keeleeksamiks õppimise tegevusplaan.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimene pildil peab tegema ja mida tahab?", "Kuidas ta õpib?", "Mida sina tahad eesti keeles osata?"],
  },
  {
    id: "a2b1-038-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna võrdleb väsitavat hilisõhtust õppimist varahommikuse sõnavarakorduse, nädalavahetuse kirjutamise ja õpetajalt näidete küsimisega; nooled seovad põhjused lahendustega.",
    accent: "the cause-and-result arrows",
    text: [],
    learningJob: "selgitada õppimisrutiini probleeme, motivatsiooni ja lahendusi sest- ja kuna-lausetega",
    alt: "Anna muudab hilisõhtuse õppimise hommikuseks ning küsib Liisilt abi.",
    caption: "Pilt 1. Põhjused, miks uus õppimisrutiin toimib paremini.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Miks need inimesed õpivad?", "Kus ja millal nad õpivad?", "Miks sina õpid eesti keelt?"],
  },
  {
    id: "a2b1-039-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Liis"],
    scene: "Markus selgitab Liisile, et jäi tunnist maha ega mõista uut grammatikat; Liis jagab töö kolmeks lühikeseks eri päevade harjutuskaardiks ja lisab õpetajale konkreetse küsimuse.",
    accent: "the three-card mini-plan",
    text: [],
    learningJob: "sõnastada õppimisprobleem, pakkuda jõukohaseid lahendusi ja koostada õpetajale konkreetne küsimus",
    alt: "Liis aitab Markuselt maha jäänud õppimise kolmeks väikeseks ülesandeks jagada.",
    caption: "Pilt 1. Õppimisprobleemile realistliku lahenduse leidmine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis mure on pildil õppijal?", "Mis võiks teda aidata?", "Millist nõu sa talle annaksid?"],
  },
  {
    id: "a2b1-040-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna jagab ülekoormatud õhtu nädalaplaanis ümber lühikeseks hommikuseks sõnavaraks, raamatukogus kirjutamiseks, Liisiga vestlemiseks, teadlikuks puhkuseks ja nädalavahetuse toiduostuks.",
    accent: "the revised schedule cells",
    text: [],
    learningJob: "ühendada aja, kohustuse, varasema kogemuse, põhjuse ja õppimisplaani keel ning hinnata plaani tasakaalu",
    alt: "Anna paigutab töö, õppimise, puhkuse ja ostud tasakaalustatud nädalaplaani.",
    caption: "Pilt 1. Anna uus tasakaalustatud nädalaplaan.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus inimesed pildil on?", "Mida nad õpivad või teevad?", "Kirjelda pilti kolme lausega."],
  },
];
