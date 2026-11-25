// Visual briefs of a2b1 module 09; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (041 six job cards for a guessing game,
// 042 an office board „who is where” with a message pad, 043 two job ads, 044 an interview card with the employer's five
// questions, „claim → example → link” and three questions to ask). They are line drawings the content agent made from
// hand-written SVG (not generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one
// lime accent, pale-lime blob, grey); Codex may redraw them from the same briefs. No people of the continuing story. Each
// picture stands directly above the task that uses it (`place` = that task's id), so the picture and its task share a
// page. The earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below; their files stay in
// public/ (b2-module-06.js reuses a2b1-045-avasta-1).
export default [
  {
    id: "a2b1-041-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Kuus ametikaarti kahes reas heleroheline laigu peal; esimese kaardi päis laimirohelisena. Iga kaart: päis ameti nimega, ikoon ja kolm rida. „KOKK” pann: „kus: köök”, „vastutab: toit”, „E–R 7–15”. „ÕDE” rist: „kus: haigla”, „hoolitseb: haiged”, „ka öösel”. „KULLER” pakk: „kus: auto”, „vastutab: pakid”, „ka laupäeval”. „RAAMATUPIDAJA” kalkulaator: „kus: kontor”, „tegeleb: arved”, „9–17”. „ÕPETAJA” tahvel: „kus: kool”, „tegeleb: lapsed”, „8–15”. „EHITAJA” kiiver: „kus: ehitus”, „vastutab: maja”, „7–16”. Lauseid ei ole: vormid (kokana, toidu eest, arvetega) teeb õppija ise.",
    accent: "the first card header",
    text: ["KOKK", "ÕDE", "KULLER", "RAAMATUPIDAJA", "ÕPETAJA", "EHITAJA", "kus: köök", "vastutab: toit", "E–R 7–15", "kus: haigla", "hoolitseb: haiged", "ka öösel", "kus: auto", "vastutab: pakid", "ka laupäeval", "kus: kontor", "tegeleb: arved", "9–17", "kus: kool", "tegeleb: lapsed", "8–15", "kus: ehitus", "vastutab: maja", "7–16"],
    learningJob: "mängida „Arva ära amet”: kirjeldada ametit nime ütlemata (töötab kokana, vastutab toidu eest, tegeleb arvetega, hoolitseb haigete eest) ja küsida, kuni paariline arvab ära; siis rääkida oma tööst",
    place: "041_t_doubt",
    alt: "Kuus ametit: kokk töötab köögis ja vastutab toidu eest, esmaspäevast reedeni 7–15; õde töötab haiglas ja hoolitseb haigete eest, ka öösel; kuller sõidab autoga ja vastutab pakkide eest, ka laupäeval; raamatupidaja töötab kontoris ja tegeleb arvetega, 9–17; õpetaja töötab koolis ja tegeleb lastega, 8–15; ehitaja töötab ehitusel ja vastutab maja eest, 7–16.",
    caption: "Kuus ametit.",
    prompts: ["Mille eest vastutab kokk?", "Kes töötab ka öösel?", "Milline amet sobiks sulle ja miks?"],
  },
  {
    id: "a2b1-042-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Kontori tahvel heleroheline laigu peal, laimirohelise päisega „KES KUS ON? · neljapäev”. Veerud: kes, kus? mida teeb?, tagasi. Read ikooniga: käepigistus „juhataja” „kliendiga kohtumas” „kell 13”; tass „raamatupidaja” „lõunal söömas” „kell 13.30”; kast „logistik” „laos kaupa kontrollimas” „kell 11”; rong „müügijuht” „Tartus koolitusel” „reedel”; kraadiklaas „IT-tugi” „haige” „esmaspäeval”. All telefon „Sõnum: kes? number? mida öelda?” ja tühi märkmeplokk kolme reaga.",
    accent: "the board header",
    text: ["KES KUS ON? · neljapäev", "kes", "kus? mida teeb?", "tagasi", "juhataja", "kliendiga kohtumas", "kell 13", "raamatupidaja", "lõunal söömas", "kell 13.30", "logistik", "laos kaupa kontrollimas", "kell 11", "müügijuht", "Tartus koolitusel", "reedel", "IT-tugi", "haige", "esmaspäeval", "Sõnum:", "kes? number? mida öelda?"],
    learningJob: "vastata töö juures telefonile: öelda tahvli järgi, kus kolleeg on ja millal ta tagasi tuleb (on kohtumas, on söömas, tuleb söömast, läks kontrollima), kirjutada sõnum üles ja reageerida helistaja varjatud infole (õpetaja kaardil)",
    place: "042_p_gap",
    alt: "Kontori tahvel, neljapäev: juhataja on kliendiga kohtumas, tagasi kell 13; raamatupidaja on lõunal söömas, tagasi kell 13.30; logistik on laos kaupa kontrollimas, tagasi kell 11; müügijuht on Tartus koolitusel, tagasi reedel; IT-tugi on haige, tagasi esmaspäeval. All on koht sõnumi jaoks: kes helistas, number, mida öelda.",
    caption: "Kes kus on?",
    prompts: ["Kus on raamatupidaja ja millal ta tagasi tuleb?", "Kes tuleb tagasi alles reedel?", "Keda sa täna tööl või koolis otsiksid?"],
  },
  {
    id: "a2b1-043-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Kaks töökuulutust kõrvuti heleroheline laigu peal. A, laimirohelise päisega „KOKA ABI”, „TÖÖPAKKUMINE · lasteaed Mesimumm”, pann: „E–R 7.00–15.30”, „köögikogemus: vähemalt 1 aasta”, „eesti keel: suhtlustase”, „pakume: tasuta lõuna, koolitus”, „CV + kiri 15. märtsiks”. B, valge päisega „KLIENDITEENINDAJA”, „TÖÖPAKKUMINE · spordikeskus Laine”, telefon: „vahetustega, ka laupäeval”, „vastad telefonile ja kirjadele”, „arvutioskus”, „pakume: tasuta ujula”, „CV + kiri 20. märtsiks”.",
    accent: "the header of ad A",
    text: ["KOKA ABI", "KLIENDITEENINDAJA", "TÖÖPAKKUMINE · lasteaed Mesimumm", "TÖÖPAKKUMINE · spordikeskus Laine", "E–R 7.00–15.30", "köögikogemus: vähemalt 1 aasta", "eesti keel: suhtlustase", "pakume: tasuta lõuna, koolitus", "CV + kiri 15. märtsiks", "vahetustega, ka laupäeval", "vastad telefonile ja kirjadele", "arvutioskus", "pakume: tasuta ujula", "CV + kiri 20. märtsiks", "A", "B"],
    learningJob: "kirjutada ühele kuulutusele 60–90-sõnaline kandideerimiskiri: millisele kohale kandideerin, mida olen harjunud tegema ja oskan teha (ma- või da-vorm), miks töö sobib ja millal saan alustada",
    place: "043_t_letter",
    alt: "Kaks töökuulutust. A: lasteaed Mesimumm otsib koka abi, esmaspäevast reedeni 7.00–15.30, vaja vähemalt aasta köögikogemust ja eesti keelt suhtlustasemel, pakutakse tasuta lõunat ja koolitust, CV ja kiri 15. märtsiks. B: spordikeskus Laine otsib klienditeenindajat, töö vahetustega ka laupäeval, vastab telefonile ja kirjadele, vaja arvutioskust, pakutakse tasuta ujulat, CV ja kiri 20. märtsiks.",
    caption: "Kaks töökuulutust.",
    prompts: ["Mida nõuab kuulutus A ja mida B?", "Mis on kummagi töö pluss?", "Kummale kohale sina kandideeriksid ja miks?"],
  },
  {
    id: "a2b1-044-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Töövestluse kaart heleroheline laigu peal, kolm kasti. Vasakul „TÖÖANDJA KÜSIB”: viis nummerdatud küsimust „Rääkige endast.”, „Kus te varem töötasite?”, „Mis on teie tugevus?”, „Mis on teie nõrkus?”, „Miks just meie?”. Paremal üleval „HEA VASTUS”: kolm ühendatud pilli „väide” „Olen täpne.”, laimiroheline „näide” „Näiteks …”, „seos” „Seepärast …”. Paremal all „KÜSI ISE”: „juhendaja?”, „vahetused?”, „katseaeg?” ja hall inimese siluett.",
    accent: "the „näide” pill",
    text: ["TÖÖANDJA KÜSIB", "1", "2", "3", "4", "5", "Rääkige endast.", "Kus te varem töötasite?", "Mis on teie tugevus?", "Mis on teie nõrkus?", "Miks just meie?", "HEA VASTUS", "väide", "Olen täpne.", "näide", "Näiteks …", "seos", "Seepärast …", "KÜSI ISE", "juhendaja?", "vahetused?", "katseaeg?"],
    learningJob: "teha paaris töövestlus: tööandja küsib viis küsimust, kandidaat vastab 3–4 lausega (väide, näide, seos), küsib ise kaks küsimust ja tööandja otsustab, kas võtab ta tööle",
    place: "044_t_job",
    alt: "Töövestluse kaart. Tööandja küsib: rääkige endast; kus te varem töötasite; mis on teie tugevus; mis on teie nõrkus; miks just meie. Hea vastus: väide („Olen täpne.”), näide („Näiteks …”), seos („Seepärast …”). Küsi ise: kes on juhendaja, kas töö on vahetustega, kui pikk on katseaeg.",
    caption: "Töövestlus.",
    prompts: ["Mida tööandja küsib?", "Millest koosneb hea vastus?", "Mida sina tööandjalt küsiksid?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-041-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Jaan", "Markus"],
    scene: "Kolm kõrvutatud töökohta näitavad administraatori telefonikõnet ja dokumente, koka toorainekontrolli ning autojuhi veoki ja kauba kontrolli.",
    accent: "the shared task checklist",
    text: [],
    learningJob: "siduda ametid nende tüüpiliste tööülesannete ja vastutusega",
    alt: "Liis, Jaan ja Markus täidavad administraatori, koka ja autojuhi tööülesandeid.",
    caption: "Pilt 1. Kolm ametit ja nende tööülesanded.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kellena inimesed pildil töötavad?", "Mille eest nad vastutavad?", "Kellena sina töötad või tahaksid töötada?"],
  },
  {
    id: "a2b1-042-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Anna", "Markus", "Liis", "Jaan"],
    scene: "Anna tööpäev liigub kiirest kliendikirjast tähtajalise ülesande ja koosoleku kaudu dokumentide, ootamatu kõne ning prioriteeditahvlini.",
    accent: "the final priority board",
    text: [],
    learningJob: "jutustada töökogemusest ajaliselt järjestatud tegevuste ja prioriteetide kaudu",
    alt: "Anna korrastab projektikoordinaatori kiire tööpäeva ülesanded prioriteeditahvlil.",
    caption: "Pilt 1. Anna tööpäeva järjestus ja prioriteedid.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus Anna igal pildil on ja mida ta seal teeb?", "Kuhu ta pärast läheb ja kust ta tuleb?", "Mis jäi sul eile tööl või koolis tegemata?"],
  },
  {
    id: "a2b1-043-avasta-1",
    phase: "discover",
    format: "diagram",
    cast: ["Anna", "Liis"],
    scene: "Anna ja Liis vaatavad sõnadeta administraatori töökuulutust, kus telefoni, kalendri, arvuti ja CV ikoonid eristavad ülesandeid ning nõudeid.",
    accent: "the send-CV card",
    text: [],
    learningJob: "seostada tööelu tegevused ma- ja da-infinitiivi kasutusega",
    alt: "Anna ja Liis uurivad administraatori töökuulutuse ülesandeid, nõudeid ja CV saatmist.",
    caption: "Pilt 1. Administraatori töökuulutus ja kandideerimine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida töökuulutus uuelt töötajalt nõuab?", "Mida peab kandidaat kirjas oma oskuste kohta kirjutama?", "Millisele kohale sina kandideeriksid ja miks?"],
  },
  {
    id: "a2b1-044-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Liis"],
    scene: "Liis intervjueerib Annat, kes toetab oma vastuseid piltidega klienditeenindusest, rahulikust probleemilahendusest ja arvutioskuse õppimisest.",
    accent: "the calm problem-solving evidence card",
    text: [],
    learningJob: "kujundada tööintervjuu vastuseid kogemuse, tugevuste ja motivatsiooni põhjal",
    alt: "Anna näitab Liisile tööintervjuul oma klienditeeninduse ja probleemilahenduse kogemust.",
    caption: "Pilt 1. Lihtne tööintervjuu koos näidetega.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kes on pildil töövestlusel?", "Mida kandidaat juhatajale räägib?", "Mis on sinu suurim tugevus?"],
  },
  {
    id: "a2b1-045-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Markus", "Liis", "Jaan"],
    scene: "Markus liigub klienditeeninduse töökuulutusest CV ja intervjuu kaudu kohvikutöö olukorrani, kus lahendab vale tellimuse.",
    accent: "the successful application path",
    text: [],
    learningJob: "koondada töökuulutuse, kogemuse, intervjuu ja klienditeeninduse tõendid",
    alt: "Markus kandideerib tööle ja näitab intervjuul, kuidas ta kliendiprobleemi lahendab.",
    caption: "Pilt 1. Tööellu kandideerimise terviklik rada.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis tööd inimesed pildil teevad?", "Kuidas nad end tunnevad?", "Kirjelda pilti kolme lausega."],
  },
];
