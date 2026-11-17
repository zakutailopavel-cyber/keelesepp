// Visual briefs of b1b2 module 02; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-17 (task-based module 2, docs/COURSE_CAST.md);
// the `cast` field still records who the generated picture shows. The pictures were kept: each one already shows what the
// new lesson does (a town route for kus/kuhu/kust, three service desks for polite requests, the four steps of a complaint,
// a day re-planned after surprises, the services checkpoint route for the check); only their questions were retargeted.
// Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-006-avasta-1",
    phase: "discover",
    format: "map",
    cast: ["Anna", "Jaan", "Liis"],
    scene: "Naise teekond ühendab rongijaama, turu, pagariäri, jõe silla, raamatukogu ja kodu nii, et liikumine ning kohalolek on pildilt loetavad.",
    accent: "the city route line",
    text: [],
    learningJob: "eristada kuhu-, kus- ja kust-suunda linnas liikumise kaudu ja rääkida oma linnast",
    alt: "Naine liigub linnas rongijaamast turule, pagariärisse, raamatukokku ja koju.",
    caption: "Pilt 1. Üks päev linnas: kust, kuhu, kus?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kust naine tuleb, kuhu ta läheb ja kus ta on? Alusta: Kõigepealt tuleb ta rongist …", "Kus asub raamatukogu turu ja silla suhtes?", "Milline koht pildil on ka sinu linnas? Kuidas sinna kõige paremini jõuab?"],
  },
  {
    id: "b1b2-007-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Liis"],
    scene: "Naine alustab viisakat vestlust perearstikeskuses, tuvastab end pangas ja täpsustab dokumente linnavalitsuse teeninduslauas.",
    accent: "the polite request speech bubble",
    text: [],
    learningJob: "alustada, täpsustada ja lõpetada teenindusvestlus viisakalt, tingiva kõneviisiga",
    alt: "Naine räägib järjest perearstikeskuse, panga ja linnavalitsuse teenindajaga.",
    caption: "Pilt 1. Kolm lauda, kolm viisakat palvet.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus naine pildil on ja mida ta igas kohas ajab?", "Millises neist kohtadest on sul kõige raskem eesti keeles asju ajada? Miks?", "Kuidas sa alustaksid perearstikeskuses? Ütle üks lause tingivas kõneviisis (Kas ma saaksin …?)."],
  },
  {
    id: "b1b2-008-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Markus", "Liis"],
    scene: "Mees ehitab katkise jalgratta kaebuse neljas sammus: ostutõend, täpne probleem, varasem kontakt ja soovitud asendus või tagasimakse.",
    accent: "the requested-solution card",
    text: [],
    learningJob: "koostada rahulik ja täpne kaebus nelja sammuga ning siduda põhjus ja tagajärg",
    alt: "Mees näitab ostutšekki ja katkist jalgratast ning jõuab asenduse või raha tagasi soovini.",
    caption: "Pilt 1. Kaebuse neli sammu.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis on pildil neli sammu? Alusta: Kõigepealt näitab mees tšekki …", "Mis jalgrattaga juhtus ja mida mees seetõttu soovib?", "Kas sina oled kunagi kaevanud? Mis aitas probleemi lahendada?"],
  },
  {
    id: "b1b2-009-kasuta-1",
    phase: "transfer",
    format: "sequence",
    cast: ["Anna"],
    scene: "Naine teeb päeva ümber pärast muuseumi sulgemist, rongi hilinemist, vihmast terrassi ja toidusoovi, kuid säilitab õhtuse kontserdi.",
    accent: "the revised itinerary route",
    text: [],
    learningJob: "reageerida mitmele ootamatule muutusele, küsida üle ja pakkuda toimiv plaan B",
    alt: "Naine seab suletud muuseumi, hilinenud rongi, vihma ja toidusoovi järel päeva uude järjekorda.",
    caption: "Pilt 1. Neli muutust ja üks plaan B.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis läks pildil plaanist erinevalt? Nimeta neli muutust.", "Mida tegi naine iga kord selle asemel? Kasuta: Kui …, siis … / Sel juhul …", "Mis on sinu plaan B, kui vihm või hilinev rong rikub sinu päeva?"],
  },
  {
    id: "b1b2-010-avasta-1",
    phase: "discover",
    format: "map",
    cast: ["Liis"],
    scene: "Naine liigub kodust teenuskeskusse ja pakiautomaati ning leiab suletud ukse järel raamatukogus uue lahenduse.",
    accent: "the service-center building",
    text: [],
    learningJob: "korrata kohakäändeid, viisakat palvet, kaebust ja ootamatule olukorrale reageerimist",
    alt: "Naine käib teenuskeskuses ja pakiautomaadi juures ning leiab suletud asutuse järel raamatukogus abi.",
    caption: "Pilt 1. Linna teenuste kontrollrada.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kuhu naine pildil läheb ja kust ta tuleb?", "Mida ta teeb, kui uks on suletud? Mis on tema plaan B?", "Kas sinuga on juhtunud midagi sarnast? Kuidas sa lahenduse leidsid?"],
  },
];
