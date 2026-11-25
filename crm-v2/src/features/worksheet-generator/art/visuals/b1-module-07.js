// Visual briefs of a2b1 module 07; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (031 three days of an illness beside the
// doctor's note and the week's work, 032 a health centre's free times for one week, 033 two evenings on two clocks,
// 034 a 30-day habit tracker with notes for each week). They are line drawings the content agent made from hand-written
// SVG (not generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime
// accent, pale-lime blob, grey); Codex may redraw them from the same briefs. The people are made up and are not the
// continuing story's cast. Each picture stands directly above the task that uses it (`place` = that task's id), so the
// picture and its task share a page. The earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED
// below; their files stay in public/.
export default [
  {
    id: "a2b1-031-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kolm päevakaarti kõrvuti: ESMASPÄEV (termomeeter „37,2°”, kurgu ikoon „kurk valutab”), laimirohelise päisega TEISIPÄEV („38,9°”, „palavik”, „köha”), KOLMAPÄEV („38,0°”, „köha”, „nohu”). Paremal kaks kaarti: PEREARST „kodus reedeni”, „haigusleht”; TÖÖ: sülearvuti „N kell 10 koosolek”, „R: aruanne”. All riba: voodi „puhkus”, tass „soe tee”, telefon „juht?”. Lauseid pildil ei ole: mis muutus ja mida juhile öelda, sõnastab õppija ise.",
    accent: "the TEISIPÄEV header (the day the fever went high)",
    text: ["ESMASPÄEV", "TEISIPÄEV", "KOLMAPÄEV", "37,2°", "38,9°", "38,0°", "kurk valutab", "palavik", "köha", "nohu", "PEREARST", "kodus", "reedeni", "haigusleht", "TÖÖ", "N kell 10", "koosolek", "R: aruanne", "puhkus", "soe tee", "juht?"],
    learningJob: "jutustada kolme päeva järgi, mis muutus (kurk hakkas valutama, palavik läks kõrgeks, jäin haigeks), ja kirjutada juhile, kui kauaks jääd koju ja mis töö võib oodata või kes selle teeb",
    place: "031_t_letter",
    alt: "Esmaspäeval oli palavik 37,2 ja kurk valutas, teisipäeval 38,9, palavik ja köha, kolmapäeval 38,0, köha ja nohu. Perearst: kodus reedeni, haigusleht. Tööl on neljapäeval kell 10 koosolek ja reedel aruanne.",
    caption: "Minu kolm päeva.",
    prompts: ["Mis muutus esmaspäevast kolmapäevani?", "Mida perearst ütles?", "Mis töö võib oodata ja kes teeb ülejäänu?"],
  },
  {
    id: "a2b1-032-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Perearstikeskuse nädalatabel heleroheline laigu peal. Ülal „PEREARSTIKESKUS”, all „vabad ajad sel nädalal”. Veerud E, T, K, N, R; read „perearst” (täis, täis, täis, laimiroheline „8.20”, „10.00”) ja „pereõde” („14.00”, „9.40”, täis, täis, „13.00”); hallid kastid = täis. All telefon „registratuur: E–R 8–16” ja kaart „kaasa: ID-kaart”. Lauseid ei ole.",
    accent: "the doctor's free time on Thursday (8.20)",
    text: ["PEREARSTIKESKUS", "vabad ajad sel nädalal", "E", "T", "K", "N", "R", "perearst", "pereõde", "täis", "8.20", "10.00", "14.00", "9.40", "13.00", "registratuur: E–R 8–16", "kaasa: ID-kaart"],
    learningJob: "küsida telefonis aega, öelda, kuidas haigus on muutunud (köha muutus tugevamaks, läks hullemaks), ja reageerida, kui pildil vaba aeg tegelikult ei sobi või on juba kinni (varjatud info õpetaja kaardil)",
    place: "032_t_appt",
    alt: "Perearsti juures on esmaspäevast kolmapäevani kõik täis, vabad on neljapäeval kell 8.20 ja reedel kell 10.00; pereõe juures on vabad esmaspäeval 14.00, teisipäeval 9.40 ja reedel 13.00. Registratuur vastab esmaspäevast reedeni kella 8–16, kaasa tuleb võtta ID-kaart.",
    caption: "Perearstikeskuse nädal.",
    prompts: ["Millal on perearsti juures vaba aeg?", "Millal saab pereõe juurde?", "Mis aeg sobib sulle ja miks?"],
  },
  {
    id: "a2b1-033-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kaks veergu. Vasakul laimirohelise nimesildiga „ÕHTU A”: kellad ja ikoonid „21.00 kohv”, „22.30 arvuti”, „00.30 telefon voodis”, „07.00 väsinud” (kurb nägu). Paremal valge sildiga „ÕHTU B”: „19.30 jalutuskäik” (king), „21.00 taimetee” (aurav tass), „22.00 raamat”, „22.30 magama” (voodi). Lauseid ei ole: nõuanded sõnastab õppija ise.",
    accent: "the name badge ÕHTU A",
    text: ["ÕHTU A", "21.00", "kohv", "22.30", "arvuti", "00.30", "telefon voodis", "07.00", "väsinud", "ÕHTU B", "19.30", "jalutuskäik", "21.00", "taimetee", "22.00", "raamat", "22.30", "magama"],
    learningJob: "võrrelda kaht õhtut ja anda käskivas kõneviisis nõu (ära joo õhtul kohvi, pane telefon ära, mine varem magama, jaluta pärast tööd) ning leppida kokku nädala plaan",
    place: "033_t_advice",
    alt: "Õhtul A joob inimene kell 21 kohvi, kell 22.30 istub arvutis, kell pool üks vaatab voodis telefoni ja on hommikul kell 7 väsinud. Õhtul B käib ta kell 19.30 jalutamas, joob kell 21 taimeteed, loeb kell 22 raamatut ja läheb kell 22.30 magama.",
    caption: "Kaks õhtut.",
    prompts: ["Mida inimene õhtul A teeb?", "Mis on õhtul B teisiti?", "Mida sa soovitad inimesele A?"],
  },
  {
    id: "a2b1-034-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Harjumuste kalender laimirohelise päisega „MINU 30 PÄEVA”. Ülal „Harjumus:” ja kolm valikut ikooniga: trepp „trepist”, lained „ujumas”, komm „magusast loobuda”. Vasakul 30 ruutu (5 rida × 6), linnukesega peale päevade 10, 11 ja 12. Paremal neli märget: „1. nädal: raske, jalad valutasid”, „2. nädal: kolm päeva vahele”, „3. nädal: läks lihtsamaks”, „4. nädal: uni läks paremaks”.",
    accent: "the calendar header",
    text: ["MINU 30 PÄEVA", "Harjumus:", "trepist", "ujumas", "magusast loobuda", "1. nädal", "raske, jalad valutasid", "2. nädal", "kolm päeva vahele", "3. nädal", "läks lihtsamaks", "4. nädal", "uni läks paremaks"],
    learningJob: "valida harjumus ja kirjutada infolehte lugu, mis kuu ajaga muutus (hakkasin trepist käima, käin ujumas, loobusin magusast, läks lihtsamaks, uni läks paremaks)",
    place: "034_t_story",
    alt: "Harjumuste kalender kolmekümne päevaga: linnuke on igal päeval peale kolme päeva teisel nädalal. Märkmed: esimene nädal oli raske ja jalad valutasid, teisel nädalal jäi kolm päeva vahele, kolmandal läks lihtsamaks, neljandal läks uni paremaks.",
    caption: "Minu 30 päeva.",
    prompts: ["Mis harjumuse sa valid?", "Mis oli raske ja mis läks lihtsamaks?", "Mis kuu ajaga muutus?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-031-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna"],
    scene: "Kontoris on Annal kurguvalu, nohu, kuiv köha, peavalu ja väsimus; sümptomite ikoonid ning termomeeter aitavad tal enesetunnet kirjeldada enne koju minekut.",
    accent: "the symptom thermometer",
    text: [],
    learningJob: "tuvastada kehaosad ja sümptomid ning selgitada, miks Anna töölt koju läheb",
    alt: "Haige Anna kasutab taskurätti, hoiab kurku ja valmistub kontorist lahkuma.",
    caption: "Pilt 1. Anna kirjeldab halba enesetunnet.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kuidas inimene pildil end tunneb?", "Mis tal võib valutada ja miks?", "Mida sina teed, kui tunned end halvasti?"],
  },
  {
    id: "a2b1-032-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus"],
    scene: "Perearstikeskuses kuulab perearst dr Kersti Kask Markuse kopse, osutab sümptomite ajajoonele ning küsib köha, palaviku, nohu, ravimite ja allergia kohta.",
    accent: "the symptom timeline",
    text: [],
    learningJob: "esitada ja mõista küsimusi sümptomite alguse, kestuse, palaviku, ravimite ja allergia kohta ning järeldada soovitus",
    alt: "Perearst kuulab köhiva Markuse kopse ja uurib sümptomite ajalugu.",
    caption: "Pilt 1. Vestlus perearsti vastuvõtul.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kes on pildil ja kus nad on?", "Mida arst küsib ja mida patsient vastab?", "Kuidas sina arsti juurde aja broneerid?"],
  },
  {
    id: "a2b1-033-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus"],
    scene: "Väsinud Markus istub voodi kõrval ja Anna annab talle sõnadeta plaani abil nõu: pane telefon ära, joo vähem kohvi, jaluta, joo vett, loe ja maga.",
    accent: "the phone-away card",
    text: [],
    learningJob: "anda jaatavaid ja eitavaid käskiva kõneviisi nõuandeid ning põhjendada head unerutiini",
    alt: "Anna soovitab väsinud Markusel telefoni kõrvale panna ja unerutiini muuta.",
    caption: "Pilt 1. Nõuanded parema une jaoks.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis probleem inimesel pildil on?", "Millist nõu sa talle annaksid?", "Mis aitab sinul hästi magada?"],
  },
  {
    id: "a2b1-034-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Jaan"],
    scene: "Jaan muudab väikeste sammudega tööpäeva harjumusi: paneb telefoni enne und kõrvale, loeb, täidab veepudeli, tõuseb laua tagant ja jalutab pärast lõunat.",
    accent: "the reusable water bottle",
    text: [],
    learningJob: "võrrelda tervislikke ja ebatervislikke harjumusi ning valida realistlikud väikesed muutused",
    alt: "Jaan paneb telefoni ära, joob vett, tõuseb tööl püsti ja läheb jalutama.",
    caption: "Pilt 1. Väikesed tervislikud muutused tööpäevas.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Millised harjumused on pildil tervislikud?", "Mida inimene peaks muutma?", "Mis on sinu kõige tervislikum harjumus?"],
  },
  {
    id: "a2b1-035-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor", "Sofia", "Liis", "Markus"],
    scene: "Lõuna-Eesti reisil jääb Sofia haigeks; Viktor helistab tervisenõuandele, Anna märgib sümptomid ja võetud ravimi, Liis annab vett ning pildid näitavad kliiniku ja kiirabi valikuid.",
    accent: "the phone in Viktor's hand",
    text: [],
    learningJob: "kirjeldada sümptomeid ja kestust, küsida ning anda nõu ja valida, millal pöörduda abi saamiseks",
    alt: "Viktor küsib telefonis nõu haige Sofia kohta, teised aitavad sümptomeid kirjeldada.",
    caption: "Pilt 1. Haigestumine reisil ja abi küsimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimesed pildil teevad?", "Kuidas nad end tunnevad?", "Kirjelda pilti kolme lausega."],
  },
];
