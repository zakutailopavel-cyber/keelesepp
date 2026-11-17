// Visual briefs of b1b2 module 01; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-17 (task-based module 1, docs/COURSE_CAST.md);
// the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-001-avasta-1",
    phase: "discover",
    format: "diagram",
    cast: ["Anna", "Liis"],
    scene: "Õppija vaatab nelja oskusharu — igapäev, tööelu, kuulamine ja kirjutamine — ning õpetaja näitab, kuidas tulemusest saab õpitee (diagnostikarada lippudega).",
    accent: "the diagnostic compass",
    text: [],
    learningJob: "muuta B1 algdiagnostika nähtavaks oskuste ja õpieesmärkide kaardiks",
    alt: "Õppija vaatab nelja B1 oskust ja õpetaja näitab tulemuse põhjal rada edasi.",
    caption: "Pilt 1. Diagnostikarada: neli oskust ja tee edasi.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Milliseid nelja oskust pildil hinnatakse?", "Milline oskus on sinu jaoks praegu kõige tugevam ja milline kõige nõrgem?", "Rajal on lipud. Mis on sinu B2-tee esimene lipp ja kuhu sa tahad jõuda?"],
  },
  {
    id: "b1b2-002-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-17 (v4, round 3): the old day timeline did not serve a housework lesson; the image is reused from
    // est-c1-003-avasta-1 (same scene: a kitchen, the dishwasher and a chore table), copied to this lesson's folder
    scene: "Koduköögis seisavad naine ja mees nõudepesumasina juures ning hoiavad ühiste kodutööde tabelit. Mõttemullides arvab kumbki, et nõusid peseb tavaliselt tema; tabel teeb ütlemata ootuse selgeks kokkuleppeks.",
    accent: "the shared chore table that turns two different expectations into one agreement",
    text: [],
    learningJob: "kirjeldada, kes kodus mida teeb, märgata erinevaid ootusi ja põhjendada kodutööde jagamist sidesõnadega",
    alt: "Naine ja mees köögis kodutööde tabeliga; mõttemullides peseb kumbki nõusid ise.",
    caption: "Pilt 1. Kes meil nõusid peseb?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida kumbki mõttemullis arvab ja miks nad tabeli tegid?", "Kes peseb teie kodus nõusid ja kes koristab? Kas see on võrdselt jagatud?", "Kas kodutööde tabel aitab või tekitab tüli? Põhjenda sõnaga kuna või kuigi."],
  },
  {
    id: "b1b2-003-avasta-1",
    phase: "discover",
    format: "diagram",
    cast: ["Anna"],
    scene: "Nädalaplaan seob kolm eraldi ajamõistet: korduvad nooled sageduse, kalendripunkt aja ja pikkusriba kestuse jaoks.",
    accent: "the three-part time dial",
    text: [],
    learningJob: "eristada sagedust, toimumisaega ja kestust ning paigutada need lausesse",
    alt: "Sageduse, aja ja kestuse ikoonid kolmeks jagatud ajakettal.",
    caption: "Pilt 1. Minu nädal: kui tihti, millal, kui kaua?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida näitavad plaanis nooled, kalendripunkt ja riba?", "Ütle iga märgi kohta üks lause oma nädalast: kui tihti, millal, kui kaua.", "Kalendris on üks päev märgitud. Millise päeva jätaksid vabaks, kui töötaksid neli päeva nädalas?"],
  },
  {
    id: "b1b2-004-avasta-1",
    phase: "discover",
    format: "comparison",
    cast: ["Liis", "Markus"],
    scene: "Kaal võrdleb ühe inimese pikka haiglatööpäeva ja rahulikku nädalavahetust teise inimese paindliku argipäeva ning kiire nädalavahetuse fototööga.",
    accent: "the comparison balance",
    text: [],
    learningJob: "võrrelda argipäeva ja nädalavahetust, tuues välja sarnasuse, erinevuse ja eelistuse",
    alt: "Kaalul on ühe inimese haiglatöö ja puhkus ning teise inimese paindlik töö ja nädalavahetuse üritused.",
    caption: "Pilt 1. Kaks vastandlikku nädalarütmi.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kumma inimese nädalarütm on kiirem? Miks?", "Kumma inimese nädalavahetus on vabam? Võrdle: … on … kui …", "Kumma nädal sobiks sulle õppimiseks rohkem? Põhjenda."],
  },
  {
    id: "b1b2-005-avasta-1",
    phase: "discover",
    format: "comparison",
    cast: ["Anna", "Markus", "Liis", "Viktor", "Sofia"],
    scene: "Inimene liigub ülekoormatud telefonist ja rööprähklemisest rattasõidu, ühe tegevuse, sõprade ning sügava une poole.",
    accent: "the calm-life path",
    text: [],
    learningJob: "korrata sidusust, aega, sagedust ja võrdlust aeglase elu muutuse kaudu",
    alt: "Inimene vahetab kiirustava argipäeva rahulikuma liikumise, lugemise, suhtlemise ja une vastu.",
    caption: "Pilt 1. Kiirustamisest aeglasema eluni.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis muutub pildil vasakult paremale?", "Millised harjumused aitavad aeglasemalt elada?", "Mida sina oma päevas muudaksid, et vähem kiirustada?"],
  },
];
