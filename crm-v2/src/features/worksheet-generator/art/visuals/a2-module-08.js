// Visual briefs of A2 module 08 (lessons a2-036…040); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 + v6 (docs/METHODOLOGY_A2_V5.md, docs/METHODOLOGY_V6.md, 2026-11-26): one learning picture per teaching
// lesson (036–039), each carrying a task and standing on the same page as that task (`place`) — the library's week of 036
// is the survey before the booking message (vaba / kinni → Kas teile sobib kolmapäeval pärast kella nelja?), the six signs
// of 037 open Kasuta and plan the guide („what must, may, must not be done here?” — nouns in the base form → Siin ei tohi
// süüa), the four steps of 038 are what the learner tells a new neighbour in the teie form (Valige arst,
// täitke vorm …), the three people and three packages of 039 are the pair's decision within 45 €.
// Line drawings the content agent made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2,
// one lime accent each; Codex may redraw them from the same briefs. No cast character is drawn or named. The control (040)
// has no picture. The earlier cast scenes (Codex, built-in image generation) are in RETIRED below and their files stay in
// public/.
export default [
  {
    id: 'a2-036-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Nädala kalender raamis, veerud E T K N R. Rida ARVUTIABI: T 10.00 KINNI, 11.00 VABA, 13.00 KINNI; N 10.00 VABA, 12.00 KINNI, 13.30 VABA; teistel päevadel kriips. Rida RÜHMATUBA 15–17: E VABA, T KINNI, K VABA, N KINNI, R VABA. Rida EKSKURSIOON: R 16.00 VABA. VABA lahtrid laimirohelised, KINNI hallid. All legend: VABA = saab broneerida, KINNI.',
    accent: 'the title and the VABA cells',
    text: ['RAAMATUKOGU: SEE NÄDAL', 'E', 'T', 'K', 'N', 'R', 'ARVUTIABI', 'RÜHMATUBA', 'EKSKURSIOON', '10.00', '11.00', '12.00', '13.00', '13.30', '15–17', '16.00', 'VABA', 'KINNI', 'VABA = saab broneerida'],
    learningJob: 'küsitlus enne põhiülesannet: õppija küsib kahelt, mis aeg neile sobib (Kas teile sobib kolmapäeval pärast kella nelja?), ja vaatab kalendrist, millal rühmatuba on vaba (See on kinni, aga kolmapäeval on vaba); pildil on ainult kellaajad ja VABA / KINNI, lause koos aja vormiga teeb õppija ise; leitud aeg läheb sõnumisse raamatukogule',
    place: '036_t_cal',
    alt: 'Raamatukogu nädala kalender: arvutiabi teisipäeval kell 11 ja neljapäeval kell 10 ja 13.30 on vaba, teised ajad kinni; rühmatuba kell 15–17 on esmaspäeval, kolmapäeval ja reedel vaba, teisipäeval ja neljapäeval kinni; ekskursioon reedel kell 16.',
    caption: 'Raamatukogu: see nädal.',
    prompts: ['Millal on arvutiabi vaba?', 'Mis päeval on rühmatuba kinni?', 'Mis aeg sulle sobib?'],
  },
  {
    id: 'a2-037-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Kuus ruudukujulist silti kahes reas, igaühel number laimirohelises ringis ja üks sõna algvormis: 1 järjekorraautomaat ja pilet nr 17 — „number”; 2 ekraan „NR 17 → 4” — „ekraan”; 3 wifi märk — „wifi tasuta”; 4 pangakaart — „kaart”; 5 läbikriipsutatud taldrik toiduga — „söök”; 6 läbikriipsutatud helisev telefon — „telefon valjusti”. All küsimus „Mida siin peab tegema? Mida võib? Mida ei tohi?”.',
    accent: 'the title and the six sign numbers',
    text: ['TEENINDUSKESKUS: SILDID', '1', '2', '3', '4', '5', '6', '17', 'NR 17 → 4', 'number', 'ekraan', 'wifi tasuta', 'kaart', 'söök', 'telefon valjusti', 'Mida siin peab tegema? Mida võib? Mida ei tohi?'],
    learningJob: 'Kasuta algus ja juhendi plaan: õppija ütleb iga sildi kohta lause modaalverbiga (Kõigepealt peab võtma numbri. Peab ootama, kuni number tuleb ekraanile. Wifi võib kasutada tasuta. Maksta saab ainult kaardiga. Siin ei tohi süüa. Telefoniga ei tohi valjusti rääkida.) — pildil on ainult nimisõnad, ma- või da-vormi valib õppija ise; siis ütleb paar, mis reeglid on koolis samad ja mis teised (juhendi märksõnad)',
    place: '037_t_signs',
    alt: 'Teeninduskeskuse kuus silti: järjekorranumber, ekraan numbriga, tasuta wifi, maksmine kaardiga, söömine keelatud, valjusti telefoniga rääkimine keelatud.',
    caption: 'Teeninduskeskus: sildid.',
    prompts: ['Mida siin peab kõigepealt tegema?', 'Kuidas siin saab maksta?', 'Mida siin ei tohi teha?'],
  },
  {
    id: 'a2-038-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Neli raami, igaühel number laimirohelises ringis ja sina-käsk: 1 „vali arst” — kaks arstikaarti dr Tamm, dr Kask; 2 „täida vorm” — vorm lahtritega NIMI, ISIKUKOOD, AADRESS, TELEFON ja „A B C — trükitähed”; 3 „kirjuta alla” — ALLKIRI rida ja pliiats; 4 „anna vorm” — registraator laua taga, silt REGISTRATUUR. All riba „tasuta · vastus SMS-iga 2 nädala jooksul”.',
    accent: 'the title and the four step numbers',
    text: ['PEREARST: NELI SAMMU', '1', '2', '3', '4', 'vali arst', 'täida vorm', 'kirjuta alla', 'anna vorm', 'dr Tamm', 'dr Kask', 'NIMI', 'ISIKUKOOD', 'AADRESS', 'TELEFON', 'A B C — trükitähed', 'ALLKIRI', 'REGISTRATUUR', 'tasuta · vastus SMS-iga 2 nädala jooksul'],
    learningJob: 'põhiülesanne (esitlus): õppija räägib vanemale naabrile neli sammu teie-vormis — pildil on sina-käsk (vali, täida, kirjuta alla, anna), teie-vormi (valige, täitke, kirjutage alla, andke, ärge unustage) teeb õppija ise; naaber küsib, kas see maksab ja millal vastus tuleb (riba all)',
    place: '038_t_steps',
    alt: 'Neli sammu perearsti juurde registreerimiseks: vali arst (dr Tamm või dr Kask), täida vorm trükitähtedega (nimi, isikukood, aadress, telefon), kirjuta alla, anna vorm registratuuri; tasuta, vastus SMS-iga kahe nädala jooksul.',
    caption: 'Perearst: neli sammu.',
    prompts: ['Mida peab kõigepealt tegema?', 'Mida kirjutatakse vormi?', 'Millal tuleb vastus?'],
  },
  {
    id: 'a2-039-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Ülal kolm lihtsat inimest või rühma koos märksõnadega: VANAEMA (telefon käes) — helistab iga päev, pool tundi, internetti vähe; ÕPILANE (telefon) — vaatab videoid, internetti palju, helistab vähe; PERE (3) — ema, isa, poeg, kõik kasutavad palju internetti. Katkendjoon. All kolm paketikaarti: MINI 5 € kuus, 100 minutit, 5 GB; HEA 12 € kuus, kõned piiramatud, 30 GB; PERE 25 € kuus, 3 inimest, piiramatud + 50 GB. Kõige all riba „Kokku kuni 45 € kuus”.',
    accent: 'the title, the three package names and the budget bar',
    text: ['KOLM INIMEST, KOLM PAKETTI', 'VANAEMA', 'helistab iga päev', 'pool tundi', 'internetti vähe', 'ÕPILANE', 'vaatab videoid', 'internetti palju', 'helistab vähe', 'PERE (3)', 'ema, isa, poeg', 'kõik kasutavad', 'palju internetti', 'MINI', '5 € kuus', '100 minutit', '5 GB', 'HEA', '12 € kuus', 'kõned piiramatud', '30 GB', 'PERE', '25 € kuus', '3 inimest', 'piiramatud + 50 GB', 'Kokku kuni 45 € kuus'],
    learningJob: 'põhiülesanne (otsus paaris): A räägib vanaemast ja õpilasest, B perest; koos valivad nad igale paketi ja arvutavad, kas 45 eurost piisab (12 + 12 + 25 = 49 € on liiga palju → keegi saab Mini) — põhjendus da- ja ma-vormiga (vanaema tahab palju rääkida, õpilane hakkab maksma …)',
    place: '039_t_pick',
    alt: 'Kolm inimest: vanaema helistab iga päev pool tundi, õpilane vaatab palju videoid, kolmeliikmeline pere kasutab palju internetti. Kolm paketti: Mini 5 eurot (100 minutit, 5 GB), Hea 12 eurot (piiramatud kõned, 30 GB), Pere 25 eurot (3 inimest, piiramatud kõned ja 50 GB). Kokku kuni 45 eurot kuus.',
    caption: 'Kolm inimest, kolm paketti.',
    prompts: ['Mis pakett sobib vanaemale?', 'Kui palju maksavad kolm paketti kokku?', 'Mis paketi sina valid?'],
  },
];

// Retired from the sheets in the methodology v5 + v6 rewrite (2026-11-26): cast scenes that did not carry the lesson's
// task; module 8 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson
// needs them.
export const RETIRED = [
  {
    id: "a2-036-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna räägib teeninduslauas Liisiga ja osutab telefoni kalendrile; Liis võrdleb aega oma lauakalendriga, et broneeringut muuta.",
    accent: "Anna’s top",
    text: [],
    learningJob: "request a new appointment and agree on a suitable time",
    alt: "Anna muudab Liisi juures broneeritud aega.",
    caption: "Pilt 1. Broneeringu aja muutmine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Anna Liisile näitab?", "Mida Liis võrdleb?", "Mida sa ütled, kui pakutud aeg ei sobi?"],
  },
  {
    id: "a2-037-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Liis"],
    scene: "Teenindusbüroos vaatab Markus nelja lihtsat reeglipilti: järjekorranumber, istekoht, telefon ja suletud uks; Liis selgitab, mida peab, saab, võib või ei tohi teha.",
    accent: "the queue-number ticket",
    text: [],
    learningJob: "classify office actions as required, possible, allowed or forbidden",
    alt: "Liis selgitab Markusele teenindusbüroo reegleid.",
    caption: "Pilt 1. Mida teenindusbüroos peab ja tohib teha?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis pilte Markus vaatab?", "Mida siin peab tegema ja mida ei tohi?", "Mis reeglid on sinu töökohas või koolis?"],
  },
  {
    id: "a2-038-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Liis"],
    scene: "Sofia täidab teeninduslauas blanketti; Liis osutab järgmisele tühjale väljale ja kõrval on nummerdatud pildijuhis ilma sõnadeta.",
    accent: "the form clipboard",
    text: [],
    learningJob: "sequence the steps for filling in and checking a form",
    alt: "Liis juhendab Sofiat blanketti täitma.",
    caption: "Pilt 1. Vormi täitmise juhis.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia täidab?", "Kuhu Liis osutab?", "Mis andmeid sa blanketti kirjutad?"],
  },
  {
    id: "a2-039-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Anna helistab klienditeenindusse, samal ajal istub Liis kõnekeskuses peakomplektiga ja suunab kõne teisele telefonile.",
    accent: "Anna’s top",
    text: [],
    learningJob: "identify why a call must be transferred and continue the service dialogue",
    alt: "Liis suunab Anna kõne klienditeeninduses edasi.",
    caption: "Pilt 1. Kõne suunamine klienditeeninduses.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kuhu Anna helistab?", "Mida Liis teeb?", "Mida sa ütled, kui helistad klienditeenindusse?"],
  },
  {
    id: "a2-040-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Viktor", "Liis"],
    scene: "Viktor on teeninduslauas telefoni, täidetava vormi ja kalendriga; Liis aitab tal valida, kas helistada, vorm täita või uus aeg broneerida.",
    accent: "the service form",
    text: [],
    learningJob: "choose the correct service action and explain the steps",
    alt: "Viktor lahendab Liisi abiga teenindusbüroos asjaajamise ülesannet.",
    caption: "Pilt 1. Teenuste kontrollülesanne.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis asjad on Viktori ees?", "Mida Liis aitab valida?", "Mida sina teed: helistad, täidad vormi või broneerid aja?"],
  },
];
