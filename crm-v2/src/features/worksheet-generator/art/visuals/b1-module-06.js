// Visual briefs of a2b1 module 06; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (026 a fridge beside a pancake recipe for
// six, 027 a restaurant menu with vegetarian and nut marks, 028 two fridges and two bins on a Sunday, 029 the order
// receipt beside what came to the door). They are line drawings the content agent made from hand-written SVG (not
// generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent,
// pale-lime blob, grey); Codex may redraw them from the same briefs. The places and people are made up and are not the
// continuing story's cast. Each picture stands directly above the task that uses it (`place` = that task's id), so the
// picture and its task share a page. The earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED
// below; their files stay in public/.
export default [
  {
    id: "a2b1-026-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Vasakul lahtine külmkapp pealkirjaga „KÜLMKAPIS”, kolm riiulit: piimapudel „1 l piima”, kaks muna „2 muna”; pool võipakki „pool pakki võid”, juustutükk „natuke juustu”; moosipurk „1 purk moosi”. Paremal retseptikaart, laimiroheline päis „PANNKOOGID kuuele inimesele”, viis rida ikooni ja kogusega: „2 l piima”, „6 muna”, „1 kg jahu”, „1 pakk võid”, „2 purki moosi”; iga rea lõpus tühi ruut. Lauseid pildil ei ole: mida ja kui palju juurde osta, arvutab õppija ise.",
    accent: "the recipe card's header",
    text: ["KÜLMKAPIS", "1 l piima", "2 muna", "pool pakki võid", "natuke juustu", "1 purk moosi", "PANNKOOGID", "kuuele inimesele", "2 l piima", "6 muna", "1 kg jahu", "1 pakk võid", "2 purki moosi"],
    learningJob: "võrrelda külmkappi ja retsepti ning kirjutada kaaslasele, mida ja kui palju poest osta, koguse järel osastavaga (liiter piima, neli muna, kilo jahu, pool pakki võid, purk moosi)",
    place: "026_t_letter",
    alt: "Külmkapis on liiter piima, kaks muna, pool pakki võid, natuke juustu ja üks purk moosi; kuue inimese pannkoogiretseptis on vaja kaks liitrit piima, kuus muna, kilo jahu, paki võid ja kaks purki moosi.",
    caption: "Külmkapp ja retsept.",
    prompts: ["Mis külmkapis juba on?", "Mida on retsepti järgi vaja?", "Mida ja kui palju tuleb poest osta?"],
  },
  {
    id: "a2b1-027-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Restorani menüütahvel heleroheline laigu peal. Ülal „RESTORAN KASK”, all „E–L 12–22 · P suletud”. Kolm osa: SUPID (seljanka 6 €, kõrvitsasupp 5 € lehega), PRAED (kana riisiga 11 €, kala kartulitega 12 €, köögiviljavokk 10 € lehega), MAGUSTOIDUD (šokolaadikook 5 € laimirohelise pähkliga, jäätis 4 €). All selgitus: leht = taimetoit, pähkel = pähklid.",
    accent: "the nut mark beside the chocolate cake",
    text: ["RESTORAN KASK", "E–L 12–22 · P suletud", "SUPID", "seljanka", "kõrvitsasupp", "PRAED", "kana riisiga", "kala kartulitega", "köögiviljavokk", "MAGUSTOIDUD", "šokolaadikook", "jäätis", "6 €", "5 €", "11 €", "12 €", "10 €", "4 €", "taimetoit", "pähklid"],
    learningJob: "valida menüüst toit inimestele, kellel on oma soovid (taimetoit, pähkliallergia), ja küsida telefonis viisakalt laua, roogade ja koostise kohta (Ma sooviksin …, Kas teil on …?, magustoiduks, joogiks)",
    place: "027_t_call",
    alt: "Restorani Kask menüü: supid, praed ja magustoidud hindadega; kõrvitsasupp ja köögiviljavokk on taimetoit, šokolaadikoogis on pähklid; restoran on avatud esmaspäevast laupäevani kella 12–22.",
    caption: "Restorani menüü.",
    prompts: ["Mida saab tellida inimene, kes ei söö liha?", "Mida ei tohi tellida inimene, kellel on pähkliallergia?", "Mida sina tellid eelroaks, pearoaks ja magustoiduks?"],
  },
  {
    id: "a2b1-028-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kaks külmkappi kõrvuti. Vasakul laimirohelise nimesildiga „KODU A”, all „suur ost laupäeval”: täis külmkapp (supipott, kaks piimapudelit, kolm karpi, juust, viis tomatit, purk); kõrval prügikast, mille peal on leib ja kaks tomatit. Paremal „KODU B”, all „väike ost iga päev”: peaaegu tühi külmkapp (üks pudel, üks karp, kaks tomatit); kõrval nimekiri „E supp, T kala, K supp, N väljas” ja tühi prügikast. Lauseid ei ole.",
    accent: "the name badges KODU A and KODU B",
    text: ["KODU A", "suur ost laupäeval", "KODU B", "väike ost iga päev", "E supp", "T kala", "K supp", "N väljas"],
    learningJob: "võrrelda kahe kodu nädalat täis- ja osasihitisega (nad ostsid palju toitu, nad ei söönud leiba ära, nad viskasid leiva ja tomatid ära, nad sõid supi ära) ning arutada, kumb kodu raiskab vähem ja miks",
    place: "028_t_meeting",
    alt: "Kodu A ostab laupäeval palju: külmkapp on täis ja prügikastis on leib ja tomatid. Kodu B ostab iga päev vähe: külmkapp on peaaegu tühi, ukse kõrval on söögiplaan ja prügikast on tühi.",
    caption: "Kaks külmkappi pühapäeval.",
    prompts: ["Mida kodu A ära viskas? Miks?", "Mida kodu B teisiti teeb?", "Kumb kodu raiskab vähem toitu?"],
  },
  {
    id: "a2b1-029-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Vasakul tellimuse kviitung laimirohelise päisega „TELLIMUS nr 2417”: pitsa „2 pitsat”, salatikauss „1 salat”, klaas „2 mahla”; all „tellitud kell 18.30”, „kohal kell 19.15”, „kokku 32 €”. Paremal „UKSE TAGA”: silt „kell 20.10”, lahtises karbis üks pitsa, kõrval kolm lumehelvest (pitsa on külm), all „1 pitsa”. Lauseid ei ole: mis valesti läks, sõnastab õppija ise.",
    accent: "the receipt's header",
    text: ["TELLIMUS nr 2417", "2 pitsat", "1 salat", "2 mahla", "tellitud kell 18.30", "kohal kell 19.15", "kokku 32 €", "UKSE TAGA", "kell 20.10", "1 pitsa"],
    learningJob: "võrrelda tellitut ja saadut ning kirjutada firmale viisakas kaebus täis- ja osasihitisega (tellisin kaks pitsat, aga sain ainult ühe pitsa; salatit ja mahla ma ei saanud; toit tuli tund hiljem) ja öelda, mida soovid",
    place: "029_t_reply",
    alt: "Tellimuses on kaks pitsat, üks salat ja kaks mahla, kohale pidi toit jõudma kell 19.15; ukse taha tuli kell 20.10 ainult üks külm pitsa.",
    caption: "Mis tuli koju?",
    prompts: ["Mida tellimuses oli?", "Mida kuller tõi ja millal?", "Mida sa firmalt palud?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-026-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis"],
    scene: "Liis kontrollib avatud külmkappi ja koostab laual ostuplaani piima, või, munade, kana, kartulite, tomatite, kurkide, õunte, banaanide, riisi, õli ja juustuga.",
    accent: "the shopping basket",
    text: [],
    learningJob: "nimetada toiduaineid, valida sobivad kogused ning otsustada, kuidas vältida liigset ostmist",
    alt: "Liis võrdleb külmkapi sisu toidulaual olevate ostudega.",
    caption: "Pilt 1. Liis planeerib nädala toiduostu.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimesed pildil ostavad ja kui palju?", "Mis on nende ostukorvis?", "Mida sina ostad iga nädal?"],
  },
  {
    id: "a2b1-027-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus", "Jaan"],
    scene: "Väikeses kohvikus küsib Anna Jaanilt salatikastme piimasisalduse kohta ja Jaan pakub kastet eraldi; Markus vaatab menüüd ning kell tuletab meelde piiratud lõunaaega.",
    accent: "the salad bowl",
    text: [],
    learningJob: "valida viisakad tellimisfraasid, küsida koostisainete kohta, muuta tellimust ja paluda arvet",
    alt: "Anna täpsustab Jaani juures salati koostist ja palub kastme eraldi.",
    caption: "Pilt 1. Lõunatellimuse täpsustamine kohvikus.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimesed pildil tellivad?", "Kuidas ettekandja ja klient suhtlevad?", "Mida sina kohvikus tavaliselt tellid?"],
  },
  {
    id: "a2b1-028-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna"],
    scene: "Anna valmistab neljale inimesele kartuleid ja kanasalatit; laual on kana, tomatid, kurk, salat, jogurt, sidrun, vesi, puuviljad ja leib ning koguseid näitavad kaal, mõõdukann, pudel ja portsjoninõu.",
    accent: "the measuring glass",
    text: [],
    learningJob: "nimetada, mida ja kui palju on vaja, ning kasutada toidusõnu koguse järel osastavas käändes",
    alt: "Anna mõõdab nelja inimese õhtusöögi koostisosi.",
    caption: "Pilt 1. Õhtusöögi koostisosad ja kogused.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis toiduaineid näed pildil?", "Mida neist saab valmistada?", "Mida sina hommikul sööd ja mida mitte?"],
  },
  {
    id: "a2b1-029-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Jaan", "Anna"],
    scene: "Jaani kohvikus näitab Markus vale sibulaga burgerit ja salatit friikartulite asemel; Jaan toob parandatud roa ning Anna kontrollib arvel kahe joogi märki ühe klaasi kõrval.",
    accent: "the corrected plate",
    text: [],
    learningJob: "tuvastada tellimuse ja arve vead, esitada viisakas lahenduspalve ning kontrollida tulemust",
    alt: "Markus saab kohvikus vale roa ja Jaan vahetab selle õigeks.",
    caption: "Pilt 1. Vale tellimuse rahulik lahendamine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis probleem on pildil?", "Kuidas klient sellest viisakalt räägib?", "Mis lahendust sina sooviksid?"],
  },
  {
    id: "a2b1-030-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus", "Liis", "Viktor", "Sofia", "Jaan"],
    scene: "Anna korraldab kuuele inimesele restorani lõuna; Sofia vajab taimetoitu, Markus näitab piimaallergia märki, Jaan toob sobiva roa ning laual on eraldi maksmise kaardid.",
    accent: "the allergy-safe dish",
    text: [],
    learningJob: "valida sobiv toit ja kogused, selgitada erivajadusi, tellida viisakalt ning lahendada teenindusolukordi",
    alt: "Kuus inimest tellivad restorani lõuna, arvestades taimetoitu ja piimaallergiat.",
    caption: "Pilt 1. Ühine lõuna erinevate toiduvajadustega.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus inimesed pildil on ja mida nad teevad?", "Mida nad söövad või joovad?", "Kirjelda oma lemmikkohvikut."],
  },
];
