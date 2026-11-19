// Visual briefs of b1b2 module 13; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 13,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. The same five pictures are kept
// and retargeted to the new lessons (no new pictures): the food-waste chain moved from 064 to 062 (food lesson) and the
// street-tree picture from 062 to 064 (heat lesson), the files were swapped with them. Briefs and pictures made by Codex
// (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-061-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Anna"],
    // 2026-11-19 (v4): the same picture, retargeted from the storyline to the learner's own bin
    scene: "Kortermaja prügimaja juures uurivad kaks naabrit skeemi: ühekordne pakend liigub segaprügisse, sealt prügilasse ja raisatud ressursini. Kõrval on eraldi biojäätmete konteiner, mis selle ahela katkestab.",
    accent: "the separate bio-waste container that breaks the waste chain",
    text: [],
    place: "061_d_open",
    learningJob: "kirjeldada, mis saab sorteerimata prügist ja mis muutub, kui jäätmed kogutakse eraldi",
    alt: "Kaks naabrit vaatavad prügimaja juures, kuidas segaprügi jõuab prügilasse ja kuidas biokonteiner ahela katkestab.",
    caption: "Pilt 1. Mis jääb sorteerimata, läheb prügilasse; mis kogutakse eraldi, muutub uueks.",
    prompts: ["Kuhu jõuab pildil pakend, mis jääb sorteerimata?", "Mis muutub, kui koored lähevad eraldi konteinerisse?", "Milline konteiner puudub sinu maja juures ja mida see muudaks?"],
  },
  {
    id: "b1b2-062-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-19 (v4): the former 064 picture (food-waste chain), moved to the food lesson; file swapped with the street trees
    scene: "Köögilaual analüüsivad kaks inimest toidu raiskamise ahelat: liiga suur ostukorv, riknenud toit, raisatud vesi ja energia ning prügila. Lahenduse poolel on ostunimekiri, õige hoidmine külmkapis ja ülejääkidest uus söök.",
    accent: "the meal made from usable leftovers",
    text: [],
    place: "062_d_chart",
    learningJob: "seletada toidu raiskamise põhjusi ja tagajärgi ning siduda lahendus põhjusega",
    alt: "Kaks inimest vaatavad köögis skeemi: ostukorvist ja riknenud toidust prügilani ning ostunimekirjast ülejääkide söögini.",
    caption: "Pilt 1. Liigsete ostude tõttu läheb toit raisku; tänu nimekirjale läheb raisku vähem.",
    prompts: ["Mis on pildil toidu raiskamise põhjus ja mis on tagajärg?", "Milline lahendus vastab millisele põhjusele?", "Mis sinu köögis kõige sagedamini raisku läheb ja mille tõttu?"],
  },
  {
    id: "b1b2-063-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Markus"],
    // 2026-11-19 (v4): the same picture, retargeted from a firm's green budget to weighing choices in the energy transition
    scene: "Koosolekul võrdlevad kaks inimest tahvlil nelja lahendust: päikesepaneelid, elektrirattad, energiasääst ja taimne toit. Tabel hindab iga lahendust mõju, hinna, aja ja mugavuse järgi.",
    accent: "the chosen high-impact combination on the evaluation matrix",
    text: [],
    place: "063_t_debate",
    learningJob: "võrrelda lahendusi mitme kriteeriumi järgi ja jõuda ühise seisukohani",
    alt: "Kaks inimest hindavad koosolekul tahvlil nelja lahendust mõju, hinna, aja ja mugavuse järgi.",
    caption: "Pilt 1. Iga lahendus maksab midagi: raha, aega või mugavust.",
    prompts: ["Mille järgi tabel lahendusi hindab?", "Mille järgi sina hindaksid Ida-Virumaa üleminekut: töökohad, hind, aeg või keskkond?", "Milline kriteerium on sinu arvates kõige tähtsam ja miks?"],
  },
  {
    id: "b1b2-064-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Liis", "Jüri"],
    // 2026-11-19 (v4): the former 062 picture (street trees), moved to the heat lesson; file swapped with the food-waste chain
    scene: "Linnatänaval näitavad nooled ahelat: maha võetud vana puu, kuum varjuta tänav ja päike ning lõpuks istutatud noor puu, mis tulevikus annab varju. Kaks linnaelanikku arutavad, mida tänav kuumaga vajab.",
    accent: "the newly planted tree as the long-term solution",
    text: [],
    place: "064_d_know",
    learningJob: "seletada, miks linnas on kuumalaine ajal palavam ja milline lahendus aitab pikas plaanis",
    alt: "Linnatänav, kus pärast vana puu mahavõtmist on kuum ja varjuta; tänava lõpus on istutatud noor puu.",
    caption: "Pilt 1. Ilma puudeta muutub tänav kuumaks; noor puu annab varju alles aastate pärast.",
    prompts: ["Miks on tänav pildi keskel nii palav?", "Mida muudab noor puu ja miks alles aastate pärast?", "Kus on sinu linnas kuumaga kõige raskem olla ja mis seal aitaks?"],
  },
  {
    id: "b1b2-065-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Igor", "Jüri"],
    // 2026-11-19 (v4): the same picture, retargeted to the learner's feedback after Kontroll 13
    scene: "Pärast mooduli kontrolli vaatavad õppija ja õpetaja tagasisidet: üks oskus on juba käes, teine vajab harjutamist. Tahvli kohal meenutab ahel, kuidas asi muutub prügiks, kui keegi sellest ei hooli.",
    accent: "the next practice step",
    text: [],
    place: "065_t_product",
    learningJob: "kasutada kontrolli tagasisidet, et valida järgmine harjutus",
    alt: "Õppija ja õpetaja vaatavad pärast kontrolli tahvlilt, mis on käes ja mida harjutada.",
    caption: "Pilt 1. Kontrolli tulemus näitab järgmise sammu.",
    prompts: ["Mis on pildil tahvli järgi juba käes ja mis vajab harjutamist?", "Millist oskust sina pärast seda moodulit kõige rohkem harjutaksid?", "Milline samm sinu kodu keskkonnaplaanis on kõige raskem?"],
  },
];
