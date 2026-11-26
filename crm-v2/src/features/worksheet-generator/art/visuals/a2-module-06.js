// Visual briefs of A2 module 06 (lessons a2-026…030); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 + v6 (docs/METHODOLOGY_A2_V5.md, docs/METHODOLOGY_V6.md, 2026-11-26): one learning picture per teaching
// lesson (026–029), each carrying a task and standing on the same page as that task (`place`) — the three fridges of 026
// are the guided „whose fridge?” task (foods in the base form → sööb liha, joob piima), the market stall of 027 the main
// role play with the price signs (the seller's hidden information changes them), the three customers of 028 the guided
// ordering (Ma soovin … / Palun mulle üks …), the order and the bill of 029 the error hunt (two errors, the right total).
// Line drawings the content agent made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2,
// one lime accent each; Codex may redraw them from the same briefs. No cast character is drawn or named. The control (030)
// has no picture. The earlier cast scenes (Codex, built-in image generation) are in RETIRED below and their files stay in
// public/.
export default [
  {
    id: 'a2-026-avasta-2',
    phase: 'discover',
    format: 'scene',
    cast: [],
    scene: 'Kolm avatud külmkappi kõrvuti, numbrid 1, 2, 3 ringis. Külmkapis 1: liha, munad, piimapakk (PIIM), veepudel; külmkapis 2: porgandid, õun, juustutükk, mahlapudel (MAHL); külmkapis 3: koogitükk, kala, moosipurk (MOOS), võipakk (VÕI). Iga toidu all sõna algvormis. All kolm inimesekaarti naeratava näoga: RASMUS sportlane; LEIDA, 70 armastab kooki; EVA ei söö liha.',
    accent: 'the title „KOLM KÜLMKAPPI: KELLE OMA?”',
    text: ['KOLM KÜLMKAPPI: KELLE OMA?', '1', '2', '3', 'liha', 'munad', 'piim', 'vesi', 'porgandid', 'õunad', 'juust', 'mahl', 'kook', 'kala', 'moos', 'või', 'PIIM', 'MAHL', 'MOOS', 'VÕI', 'RASMUS', 'sportlane', 'LEIDA, 70', 'armastab kooki', 'EVA', 'ei söö liha', 'Kes sööb liha? Kes sööb kooki? Kes ei söö liha?'],
    learningJob: 'juhendatud kasutus paaris: A räägib külmkappidest 1 ja 2 (Selle inimese külmkapis on … Ta sööb liha ja mune, joob piima), B arvab, kelle külmkapp see on; siis vastupidi külmkapiga 3 — pildil on toidud algvormis, osastava teeb õppija ise',
    place: '026_d_fridge',
    alt: 'Kolm külmkappi: esimeses liha, munad, piim ja vesi, teises porgandid, õunad, juust ja mahl, kolmandas kook, kala, moos ja või; all Rasmus (sportlane), Leida (70, armastab kooki) ja Eva (ei söö liha).',
    caption: 'Kolm külmkappi: kelle oma?',
    prompts: ['Mida sööb inimene 1?', 'Mida inimene 2 ei söö?', 'Kelle külmkapp on 3?'],
  },
  {
    id: 'a2-027-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Turulett varikatusega, kaks rida kaste. Igas kastis kaup, nimesilt ja hinnasilt: KARTULID 1 kg 0,80 €, PORGANDID 1 kg 1,00 €, KAPSAS 1 tk 1,00 €, MUNAD 10 tk 2,50 €, PIIM 1 l 1,20 €, LEIB 1 päts 2,00 €, MESI 1 purk 6,00 €, ÕUNAD 1 kg 1,50 €.',
    accent: 'the eight price signs',
    text: ['TURULETT: HINNAD', 'KARTULID', 'PORGANDID', 'KAPSAS', 'MUNAD', 'PIIM', 'LEIB', 'MESI', 'ÕUNAD', '1 kg 0,80 €', '1 kg 1,00 €', '1 tk 1,00 €', '10 tk 2,50 €', '1 l 1,20 €', '1 päts 2,00 €', '1 purk 6,00 €', '1 kg 1,50 €'],
    learningJob: 'põhiülesanne (rollimäng): ostja ostab nimekirja järgi 10 euro eest, ütleb koguse osastavaga (kilo kartuleid, pool kilo porgandeid, liiter piima) ja küsib hinda; müüja vastab siltide järgi, aga õpetaja varjatud info muudab olukorda (munad otsas, piim ainult pooleliitristes pudelites, kapsas kallim)',
    place: '027_t_market',
    alt: 'Turulett kaheksa kaubaga ja hinnasiltidega: kartulid, porgandid, kapsas, munad, piim, leib, mesi ja õunad.',
    caption: 'Turulett: mis maksab kui palju?',
    prompts: ['Kui palju maksab kilo kartuleid?', 'Mis on kõige kallim?', 'Mida sa ostad 10 euro eest?'],
  },
  {
    id: 'a2-028-avasta-2',
    phase: 'discover',
    format: 'scene',
    cast: [],
    scene: 'Kohviku lett all (LETT), selle taga kolm lihtsat klienti numbritega 1, 2, 3 rinnal; igaühe kohal mõttemull: 1 — teetass ja koogitükk (tee, õunakook); 2 — supikauss, leib ja läbikriipsutatud liha (seenesupp, leib, liha ei); 3 — kohvitass ja mahlapudel (kohv × 2, mahl).',
    accent: 'the title „KOLM KLIENTI: MIDA NAD SOOVIVAD?”',
    text: ['KOLM KLIENTI: MIDA NAD SOOVIVAD?', 'tee', 'õunakook', 'seenesupp', 'leib', 'liha ei', 'kohv × 2', 'mahl', 'MAHL', '1', '2', '3', 'LETT'],
    learningJob: 'juhendatud tellimine paaris: A tellib kolme kliendi eest (Palun mulle üks tee ja tükk õunakooki. Ma soovin seenesuppi ja leiba. Palun kaks tassi kohvi ja üks mahl), B on teenindaja ja ütleb hinna menüü järgi — pildil on algvorm, vormi valib õppija',
    place: '028_d_three',
    alt: 'Kolm klienti kohviku leti ees: esimene tahab teed ja õunakooki, teine seenesuppi ja leiba ilma lihata, kolmas kaks kohvi ja mahla.',
    caption: 'Kolm klienti: mida nad soovivad?',
    prompts: ['Mida soovib klient 1?', 'Mida klient 2 ei söö?', 'Mida sina tellid?'],
  },
  {
    id: 'a2-029-avasta-2',
    phase: 'discover',
    format: 'scene',
    cast: [],
    scene: 'Vasakul spiraaliga märkmik TELLIMUS · laud 5: 2 × seenesupp, 1 × kohv piimaga, 1 × tee ilma suhkruta, 1 × pannkoogid moosiga (all kauss, tass, pannkoogid). Paremal sakilise äärega arve KOHVIK LUMI · ARVE: Seenesupp 2 × 4,50 9,00; Kohv piimaga 2,20; Tee suhkruga 1,80; Pannkoogid moosiga 2 × 3,50 7,00; KOKKU 20,00 €. Vahel luup.',
    accent: 'the total line „KOKKU 20,00 €”',
    text: ['TELLIMUS JA ARVE: LEIA KAKS VIGA', 'TELLIMUS · laud 5', '2 × seenesupp', '1 × kohv piimaga', '1 × tee ilma suhkruta', '1 × pannkoogid moosiga', 'KOHVIK LUMI · ARVE', 'Seenesupp 2 × 4,50', '9,00', 'Kohv piimaga', '2,20', 'Tee suhkruga', '1,80', 'Pannkoogid moosiga 2 × 3,50', '7,00', 'KOKKU', '20,00 €'],
    learningJob: 'vigade otsimine: õppija võrdleb tellimust ja arvet, leiab kaks viga (tee suhkruga, aga tellitud ilma suhkruta; pannkooke kaks, tellitud üks) ja ütleb teenindajale ilma valmis fraasideta, mis on õige ja et õige summa on 16,50 €',
    place: '029_d_bill',
    alt: 'Tellimus: kaks seenesuppi, kohv piimaga, tee ilma suhkruta, üks pannkook moosiga. Arve: seenesupp 9 eurot, kohv 2,20, tee suhkruga 1,80, kaks pannkooki 7 eurot, kokku 20 eurot.',
    caption: 'Tellimus ja arve: leia kaks viga.',
    prompts: ['Mis on arvel teisiti kui tellimuses?', 'Mitu pannkooki on tellimuses?', 'Kui palju on õige summa?'],
  },
];

// Retired from the sheets in the methodology v5 + v6 rewrite (2026-11-26): cast scenes that did not carry the lesson's
// task; module 6 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson
// needs them.
export const RETIRED = [
  {
    id: "a2-026-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Jaan"],
    scene: "Anna valib toidupoes ostukorvi puu- ja köögivilju, leiba ning piima; Jaan hoiab lihtsat ostunimekirja ilma tekstita.",
    accent: "Anna’s top",
    text: [],
    learningJob: "name foods and decide what belongs in the shopping basket",
    alt: "Anna ja Jaan valivad toidupoes igapäevaseid toite ja jooke.",
    caption: "Pilt 1. Toidu ja joogi valimine poes.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna korvi paneb?", "Mida Jaan käes hoiab?", "Mida sina poest kõige sagedamini ostad?"],
  },
  {
    id: "a2-027-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Jaan"],
    scene: "Jaani kohvikus tellib Sofia jooki; letil on üks tass, veekann ja klaas, Jaan näitab eri koguseid kätega.",
    accent: "the water glass",
    text: [],
    learningJob: "ask for and choose a suitable amount of a drink",
    alt: "Sofia tellib Jaani kohvikus sobiva koguse jooki.",
    caption: "Pilt 1. Kui palju jooki tellida?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia tellib?", "Mis on letil?", "Kui palju vett või kohvi sa päevas jood?"],
  },
  {
    id: "a2-028-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Jaan"],
    scene: "Jaani kohvikus istub Anna laua ääres, vaatab piltidega menüüd ja annab tellimuse; Jaan seisab märkmikuga laua kõrval.",
    accent: "Anna’s top",
    text: [],
    learningJob: "role-play ordering food and drink politely in a café",
    alt: "Anna esitab Jaanile kohvikus oma tellimuse.",
    caption: "Pilt 1. Tellimine kohvikus.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna menüüst valib?", "Mida Jaan märkmikku kirjutab?", "Mida sina kohvikus tellid?"],
  },
  {
    id: "a2-029-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Jaan"],
    scene: "Markus kontrollib kohvikulaual arvet ning võrdleb seda tassi ja taldrikuga; Jaan kuulab ja on valmis vea parandama.",
    accent: "the bill",
    text: [],
    learningJob: "check whether a café bill matches the order and explain a problem",
    alt: "Markus kontrollib kohvikus arvet koos Jaaniga.",
    caption: "Pilt 1. Tellimuse ja arve kontrollimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Markus kontrollib?", "Mis arvel võib olla valesti?", "Mida sa ütled, kui arvel on viga?"],
  },
  {
    id: "a2-030-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Jaan"],
    scene: "Sofia koostab Jaani kohvikus lihtsa piltmenüü kolmest roast ja kahest joogist; Jaan võrdleb valikuid leti taga.",
    accent: "the picture menu",
    text: [],
    learningJob: "choose a simple menu and explain the food and drink choices",
    alt: "Sofia ja Jaan koostavad kohvikule lihtsat menüüd.",
    caption: "Pilt 1. Lihtsa menüü koostamine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia menüüsse kirjutab?", "Mida Jaan võrdleb?", "Mis kolm rooga sina oma menüüsse paned?"],
  },
];
