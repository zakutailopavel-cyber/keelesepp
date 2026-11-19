// Visual briefs of b1b2 module 14; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 14,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures stay in
// their folders and are retargeted to the new lessons (no new pictures): 066 public-service access → the „where to turn”
// game, 067 three community initiatives → the volunteering choice, 068 rule icons → must / may / must not, 069 the
// proposal to the commission → the dark-road project, 070 the scheme → the module product. Briefs and pictures made by
// Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-066-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Olga", "Liis"],
    // 2026-11-19 (v4): the same picture, retargeted from the focus group to services that reach an old person at home
    scene: "Kaks elanikku võrdlevad kaardil perearsti, bussi, raamatukogu ja apteegi kättesaadavust linnas ja kauges maakodus. Pikk teekond perearstini näitab probleemi, mobiilne vastuvõtt toob teenuse inimeseni.",
    accent: "the mobile health-service stop near the rural home",
    text: [],
    place: "066_d_open",
    learningJob: "hinnata, kui kaugel on avalik teenus, ja arutada, millised teenused peaksid jõudma eaka inimese koju",
    alt: "Kaks elanikku vaatavad kaarti, kus perearst on maakodust kaugel ja mobiilne vastuvõtt tuleb inimesele lähemale.",
    caption: "Pilt 1. Abi peab jõudma inimeseni — eriti siis, kui ta ise enam kaugele ei jõua.",
    prompts: ["Milline teenus on pildil maakodust kõige kaugemal?", "Kuidas aitab teenus, mis tuleb inimese juurde koju?", "Milline teenus peaks sinu kodukohas eakale koju tulema ja miks?"],
  },
  {
    id: "b1b2-067-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Markus"],
    // 2026-11-19 (v4): the same picture, retargeted from the participatory budget to the learner's volunteering choice
    scene: "Kaks inimest võrdlevad kolme kogukonna algatust: noorte rulaparki, kogukonnaaeda ja turvalist mänguväljakut. Nad hindavad, kes saab kasu, kui palju aega vabatahtlikud panustavad ja mis jääb alles, ning panevad valitud ideele märgi.",
    accent: "the vote marker on the chosen community initiative",
    text: [],
    place: "067_t_gap",
    learningJob: "võrrelda vabatahtliku töö võimalusi aja ja kasu järgi ning valida endale sobiv",
    alt: "Kaks inimest valivad kolme kogukonna algatuse vahel ja panevad ühele märgi.",
    caption: "Pilt 1. Sobiv vabatahtlik töö sõltub sinu ajast, oskustest ja sellest, keda see aitab.",
    prompts: ["Mille järgi need kaks inimest algatusi võrdlevad?", "Millises algatuses osaleksid sina ja mille eest vastutaksid?", "Kui palju aega saaksid sina nädalas kogukonda panustada?"],
  },
  {
    id: "b1b2-068-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Igor"],
    // 2026-11-19 (v4): the same picture, retargeted from the house rules to must / may / must not in official rules
    scene: "Teadetetahvli ees eristavad kaks inimest nelja reegli liiki: kohustuslik, lubatud, keelatud ja mittekohustuslik. Iga liiki näitab selge ikoon ja erinev märgikuju.",
    accent: "the mandatory rule card",
    text: [],
    place: "068_d_know",
    learningJob: "eristada kohustust, luba, keeldu ja kohustuse puudumist (peab, võib, ei tohi, ei pea)",
    alt: "Kaks inimest vaatavad teadetetahvlit, kus kohustus, luba, keeld ja vabatahtlik asi on eri märkidega.",
    caption: "Pilt 1. „Ei pea” ja „ei tohi” ei ole sama: üks on vabadus, teine keeld.",
    prompts: ["Milline märk näitab pildil kohustust ja milline keeldu?", "Mis vahe on lausetel „ei pea tegema” ja „ei tohi teha”?", "Milline ametlik nõue on sinu elus praegu kõige tähtsam?"],
  },
  {
    id: "b1b2-069-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Jüri"],
    // 2026-11-19 (v4): the same picture, retargeted from the school street to the learner's own proposal
    scene: "Elanik esitleb valla komisjonile kohaliku probleemi lahendust. Tahvlil on probleem, kaks lahendust koos kulu- ja riskimärkidega ning valitud lahendus; komisjoni liige kuulab ja valmistab küsimust.",
    accent: "the selected solution on the board",
    text: [],
    place: "069_t_pitch",
    learningJob: "esitleda kohaliku probleemi lahendust, võrrelda kulu ja riski ning kaitsta valikut",
    alt: "Elanik esitleb komisjonile kahte lahendust ja oma valikut, komisjoni liige kuulab.",
    caption: "Pilt 1. Ettepanek, kus on hind ja risk, saab kiiremini vastuse.",
    prompts: ["Mis on tahvlil kahe lahenduse erinevus?", "Mida küsiksid komisjoni liikmena esitlejalt?", "Millise ettepaneku teeksid sina oma vallale ja mis see maksaks?"],
  },
  {
    id: "b1b2-070-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Jüri"],
    // 2026-11-19 (v4): the same picture, retargeted to the module product (the learner's guide to his home place)
    scene: "Pärast mooduli kontrolli selgitab õppija õpetajale skeemi, kus inimene, avalik teenus, kogukond ja reeglid on omavahel seotud; kõrval on järgmise harjutuse kaart.",
    accent: "the next-step card",
    text: [],
    place: "070_t_product",
    learningJob: "seostada avalik teenus, osalemine, reeglid ja ettepanek oma kodukoha teejuhiks",
    alt: "Õppija näitab skeemi, kus inimene, avalik teenus, kogukond ja reeglid on seotud.",
    caption: "Pilt 1. Kodukoha teejuht seob abi, osalemise, kohustused ja ettepaneku.",
    prompts: ["Kuidas on skeemil seotud inimene, teenus, kogukond ja reeglid?", "Mis on sinu kodukoha teejuhis kõige tähtsam rida?", "Mida soovitaksid uuele elanikule kõigepealt teha?"],
  },
];
