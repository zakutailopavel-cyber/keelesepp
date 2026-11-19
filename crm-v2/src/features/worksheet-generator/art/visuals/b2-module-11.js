// Visual briefs of b1b2 module 11; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 11,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures are kept
// and retargeted to the new lessons (no new pictures): the budget board moved from 055 to 051, the three washing machines
// from 051 to 054, the present-versus-future scale from 054 to 055 (files copied to the lesson folders, §7.1 rule 13).
// Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by
// KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-051-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Sofia"],
    // 2026-11-19 (v4): the first-apartment budget board, retargeted to finding a family's money leaks
    scene: "Kaks inimest vaatavad laua taga eelarvetahvlit. Hallid kaardid näitavad üüri, toitu, pesumasinat, lauda ja mängupuldiga ahvatlevat ostu; tahvlil jaguneb raha kolme veergu: püsikulud, ostud ja puutumata reserv. Üks inimene osutab tahvlile, teine mõtleb.",
    accent: "the three-column budget board",
    text: [],
    place: "051_t_help",
    learningJob: "jagada kulud püsikuludeks, ostudeks ja reserviks ning leida kulu, mis on pigem soov või leke",
    alt: "Kaks inimest vaatavad eelarvetahvlit, kus raha jaguneb püsikuludeks, ostudeks ja reserviks.",
    caption: "Pilt 1. Püsikulud, ostud ja reserv: kuhu raha läheb?",
    prompts: ["Millised kolm veergu on tahvlil ja mis kaardid nende kohal on?", "Milline kaartidel olev ost on sinu arvates vajadus ja milline pigem soov?", "Mis läheks sinu (või väljamõeldud pere) eelarves kolmandasse veergu — reservi?"],
  },
  {
    id: "b1b2-052-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Jaan"],
    // 2026-11-19 (v4): the same advertising-technique board, now beside the shopping-centre ads (feeling, clock, crowd)
    scene: "Üks inimene hoiab käes kaubamärgita telefonireklaami, teine näitab analüüsitahvlit. Tahvlil on kolm võtet ilma sõnadeta: tunne (naeratus ja süda), ajasurve (kiire kell) ja teiste eeskuju (rahvahulk).",
    accent: "the advertising-technique analysis board",
    text: [],
    place: "052_d_ads",
    learningJob: "tunda reklaamis ära tunde, ajasurve ja teiste eeskuju võte ning siduda see Black Friday pakkumistega",
    alt: "Üks inimene hoiab reklaami, teine näitab tahvlil kolme võtet: tunne, kell ja rahvahulk.",
    caption: "Pilt 1. Tunne, kell ja rahvahulk: kolm müügivõtet.",
    prompts: ["Milliseid kolme võtet tahvel näitab?", "Millist neist võtetest kuulsid kaubanduskeskuse reklaamides?", "Milline võte mõjub sulle kõige rohkem ja miks?"],
  },
  {
    id: "b1b2-053-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    // 2026-11-19 (v4): retargeted from a damaged sofa to a call with an e-shop's customer service
    scene: "Üks inimene räägib videokõnes klienditeenindajaga. Laual on kaup, ostudokument ja foto; kesksel kaardil on kolm seotud sammu: mis juhtus, mis on tõend ja mis on soovitud lahendus. Teenindaja osutab järgmisele sammule.",
    accent: "the three-step claim card",
    text: [],
    place: "053_t_call",
    learningJob: "esitada klienditeenindusele selge ja viisakas nõue: mis juhtus, mis on tõend ja mida palun",
    alt: "Inimene räägib videokõnes klienditeenindajaga; laual on kaup, ostudokument ja foto.",
    caption: "Pilt 1. Mis juhtus, mis on tõend ja mida ma palun?",
    prompts: ["Mis on kesksel kaardil kolm sammu?", "Milline dokument on sinu kõnes kõige tähtsam tõend?", "Kuidas ütled teenindajale viisakalt, aga kindlalt, mida sa palud?"],
  },
  {
    id: "b1b2-054-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-19 (v4): the three washing machines (formerly lesson 051) beside the four ways to pay for one
    scene: "Kodumasinapoes seisab kolm kaubamärgita pesumasinat. Kaks inimest mõtlevad. Hallid sümbolid näitavad ostuhinda, garantiid, elektri- ja veekulu ning pesukogust; kesksel kaardil on eelarve ja kvaliteedi kaal.",
    accent: "the price-and-quality comparison card",
    text: [],
    place: "054_d_offers",
    learningJob: "võrrelda ostu mitte ainult hinna, vaid ka garantii, kasutuskulu ja kogukulu järgi",
    alt: "Kaks inimest võrdlevad poes kolme pesumasinat; sümbolid näitavad hinda, garantiid ja kasutuskulu.",
    caption: "Pilt 1. Ostuhind ei ole veel kogukulu.",
    prompts: ["Milliseid kulusid peale ostuhinna sümbolid näitavad?", "Miks võib odav masin lõpuks kallis olla?", "Mille järgi valiksid sina pesumasina, kui raha on vähe?"],
  },
  {
    id: "b1b2-055-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Liis"],
    // 2026-11-19 (v4): the present-versus-future scale (formerly lesson 054) beside the exam discussion on a monthly budget
    scene: "Kaks inimest seisavad kaalu kahel pool. Vasakul kaardil on rahakott (raha kohe), paremal kasvav sääst ja taim (tuleviku turvalisus); keskel on kaal, mis võrdleb praegust vajadust ja pikaajalist kasu.",
    accent: "the present-versus-future decision scale",
    text: [],
    place: "055_t_debate",
    learningJob: "kaaluda raha kohe kasutamise ja säästmise plusse ning põhjendada oma seisukohta arutelus",
    alt: "Kaks inimest kaalu kahel pool: vasakul rahakott, paremal kasvav sääst.",
    caption: "Pilt 1. Kulutada täna või säästa homseks?",
    prompts: ["Mida näitab kaalu vasak ja parem pool?", "Kas eelarve pidamine aitab kaalu tasakaalus hoida? Miks?", "Kumb pool on sinu elus praegu raskem ja miks?"],
  },
];
