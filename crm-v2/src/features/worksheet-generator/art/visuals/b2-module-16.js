// Visual briefs of b1b2 module 16; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 16,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. Four of the five pictures are kept
// and retargeted to the new lessons (no new pictures): the decision with conditions → 076 (the flat and the owner's
// conditions), the learner's time line → 077 (the „first time” story), the board with a decision, opinions and a
// compromise → 079 (the parents' meeting), the skill profile → 080. The rye-bread picture of the old 078 does not fit the
// pool lesson and is no longer registered (the file is in git history); a pool's house-rules board is an open order.
// Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by
// KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-076-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Markus"],
    // 2026-11-19 (v4): the same picture, retargeted from the storyline to the learner's flat and the owner's conditions
    scene: "Kaks inimest kaaluvad laua taga kodu valikut. Pildikaardid näitavad kõrgemat hinda, odavamat kodu kaugemal, uusi naabreid ja pere, kes saab võtmed; nooled seovad tingimused üheks otsuseks.",
    accent: "the connector path that joins the conditions into one decision",
    text: [],
    place: "076_t_call",
    learningJob: "siduda kodu valimise plussid, miinused ja tingimused liitlauseteks (kuigi, juhul kui, seetõttu)",
    alt: "Kaks inimest kaaluvad kodu valikut: hind, asukoht, naabrid ja võtmed on seotud üheks otsuseks.",
    caption: "Pilt 1. Kuigi üks kodu on kallim, võib see sobida — juhul kui tingimused on selged.",
    prompts: ["Mida inimesed pildil kaaluvad?", "Milline tingimus on pildil kõige tähtsam ja miks?", "Millise tingimusega oleksid sina nõus kallima või kaugema koduga?"],
  },
  {
    id: "b1b2-077-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Igor"],
    // 2026-11-19 (v4): the same picture, retargeted to the learner's own „first time” story
    scene: "Kohvikulauas jutustab naine sõbrale oma esimest aastat uues riigis. Pildiline ajajoon näitab saabumist kohvriga, õppimist, esimest vestlust kohvikus ja lõpuks enesekindlat esinemist.",
    accent: "the final confident speaking milestone on the time line",
    text: [],
    place: "077_t_contest",
    learningJob: "jutustada oma esimesest korrast nii, et iga etapp algab aja või kohaga ja tegusõna on teisel kohal",
    alt: "Naine jutustab sõbrale ajajoone abil oma esimesest aastast uues riigis.",
    caption: "Pilt 1. Esimesel päeval … Kuu aja pärast … Alles hiljem … — hea lugu liigub ajas.",
    prompts: ["Millised etapid on naise ajajoonel?", "Millega algaks sinu loo iga etapp (esimesel päeval, kuu aja pärast …)?", "Jutusta oma esimesest korrast kolme etapi kaudu."],
  },
  {
    id: "b1b2-079-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Markus"],
    // 2026-11-19 (v4): the same picture, retargeted from the paid car park to the learner's meeting: decision, voices, agreement
    scene: "Koosoleku järel vaatavad kaks inimest tahvlit: vasakul tehtud otsus, keskel eri inimeste arvamused ja küsimused, paremal kokkulepe, mis sobib mitmele poolele.",
    accent: "the agreement that joins two needs",
    text: [],
    place: "079_t_retell",
    learningJob: "anda edasi, mis koosolekul otsustati, kes mida arvas ja milline kokkulepe tehti",
    alt: "Kaks inimest vaatavad tahvlit, kus on otsus, eri arvamused ja kokkulepe.",
    caption: "Pilt 1. Mis otsustati, kes mida ütles ja milles lepiti kokku.",
    prompts: ["Mis on tahvlil otsus ja mis on arvamused?", "Kuidas annad edasi ühe inimese arvamuse (… sõnul)?", "Mida otsustati viimasel koosolekul, kus sina käisid?"],
  },
  {
    id: "b1b2-080-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Liis"],
    // 2026-11-19 (v4): the same picture, without names in the learner's text
    scene: "Pärast vahehindamist vaatavad õppija ja õpetaja oskuste profiili: lugemine on tugev, kirjutamine ja rääkimine vajavad veel harjutamist. Õppija märgib kalendrisse kaks konkreetset sammu enne kursuse viimast moodulit.",
    accent: "the two-step final-stage practice plan",
    text: [],
    place: "080_t_product",
    learningJob: "tõlgendada vahehindamise tulemust ja planeerida kaks järgmist sammu",
    alt: "Õppija ja õpetaja vaatavad oskuste profiili ja märgivad kalendrisse kaks harjutamise sammu.",
    caption: "Pilt 1. Vahehindamine näitab, mida enne viimast moodulit harjutada.",
    prompts: ["Millised oskused on pildil tugevad ja millised vajavad harjutamist?", "Milliseid kaht sammu märgib õppija kalendrisse?", "Milliseid kaht sammu planeerid sina enne kursuse viimast moodulit?"],
  },
];
