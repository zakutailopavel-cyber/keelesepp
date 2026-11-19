// Visual briefs of b1b2 module 12; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (scene, alt, caption, prompts) without the course cast since 2026-11-19 (task-based module 12,
// docs/COURSE_CAST.md); the `cast` field still records who the generated picture shows. No new pictures: the same five
// files, three of them moved to the lesson whose task they fit (the security-rules board → 056, the post vs official
// source → 058, notifications on and off → 059). Briefs and pictures made by Codex (built-in image generation) per
// docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
export default [
  {
    id: "b1b2-056-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Markus"],
    // 2026-11-19 (v4): the picture of the old 058 (security rules at work), retargeted to the e-state quest: log in,
    // confirm on the phone, do not open the unknown attachment, the data stays locked
    scene: "Koolitusel osutab üks inimene tahvlil lihtsale skeemile: sisselogimine koodiga, kinnitus telefonis, tundmatu manus on läbi kriipsutatud ja andmed on lukus. Teine inimene kinnitab telefonis sisselogimist.",
    accent: "the two-step login confirmation on the phone",
    text: [],
    place: "056_t_cards",
    learningJob: "seletada samm-sammult, kuidas e-riigis sisse logitakse ja allkirjastatakse ning mida ei tehta",
    alt: "Tahvlil on skeem: sisselogimine, kinnitus telefonis, tundmatu manus läbi kriipsutatud ja lukus andmed; üks inimene kinnitab telefonis.",
    caption: "Pilt 1. Kuidas sisse logitakse ja mida ei tehta.",
    prompts: ["Milliseid samme näitab tahvli skeem?", "Millise PIN-koodiga logitakse sisse ja millisega allkirjastatakse?", "Mida sina oma naabrile kõigepealt seletaksid?"],
  },
  {
    id: "b1b2-057-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Liis", "Markus"],
    // 2026-11-19 (v4): the same picture, retargeted from a company meeting to the learner's own debate on AI rules
    scene: "Kaks inimest arutavad laua taga, millal võib kliendile vastata vestlusrobot. Skeem näitab lihtsa küsimuse kiiret automaatvastust, keerulise juhtumi riski ja privaatsuslukku; keskmisel kaardil annab robot keerulise juhtumi üle päris teenindajale.",
    accent: "the human-handoff responsibility card",
    text: [],
    place: "057_t_debate",
    learningJob: "võrrelda tehisintellekti kasu ja riske ning otsustada, millal peab vastutuse võtma inimene",
    alt: "Kaks inimest arutavad, millal vastab kliendile robot ja millal päris inimene.",
    caption: "Pilt 1. Masin aitab, vastutus jääb inimesele.",
    prompts: ["Mida näitab skeemi keskmine kaart?", "Millal sobib automaatvastus ja millal on vaja inimest?", "Kas sina eelistad suhelda vestlusroboti või inimesega? Miks?"],
  },
  {
    id: "b1b2-058-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Anna"],
    // 2026-11-19 (v4): the picture of the old 059, now beside the five posts the learner checks before sharing
    scene: "Raamatukogus kontrollivad kaks inimest telefonis levivat üllatavat postitust. Kõrvuti on anonüümse postituse kaart põleva hoone pildiga ja usaldusväärse ametliku allika kaart, millel on kuupäev, autor ja mitu kinnitust.",
    accent: "the verified reliable-source card",
    text: [],
    place: "058_t_posts",
    learningJob: "eristada tõendamata väidet kontrollitud faktist autori, kuupäeva ja teiste allikate järgi",
    alt: "Kaks inimest võrdlevad anonüümset postitust ja kontrollitud ametlikku allikat.",
    caption: "Pilt 1. Enne jagamist kontrolli autorit, kuupäeva ja teisi allikaid.",
    prompts: ["Mille poolest erinevad kaks kaarti pildil?", "Millise kolme asja järgi sa usaldusväärse allika ära tunned?", "Millist postitust oled sina viimati enne jagamist kontrollinud?"],
  },
  {
    id: "b1b2-059-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Anna"],
    // 2026-11-19 (v4): the picture of the old 056 (notifications vs a calm lunch), beside the notifications experiment
    scene: "Vasakul katkestavad telefoni teavitused kahe inimese lõunat ja nende und; keskel on hääletuks lülitatud telefon; paremal vestlevad samad inimesed rahulikult ja lõpetavad ühe ülesande.",
    accent: "the notifications-off phone",
    text: [],
    place: "059_t_more",
    learningJob: "seostada teavitused tähelepanu, une ja andmetega ning sõnastada oma eksperimendi reegel",
    alt: "Vasakul segavad teavitused lõunat ja und, paremal on telefon hääletu ja inimesed vestlevad rahulikult.",
    caption: "Pilt 1. Üks seade muudab päeva.",
    prompts: ["Mis muutub pildil pärast seda, kui teavitused on välja lülitatud?", "Milliseid teavitusi sina päriselt vajad?", "Mida su telefon teab sellest, millal ja kui kaua sa teda vaatad?"],
  },
  {
    id: "b1b2-060-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Olga", "Jüri"],
    scene: "Keelekursuse vahehindamise järel vaatavad õppija ja õpetaja koos arenguplaani. Hallid kaardid näitavad lugemist, kuulamist, kirjutamist ja suulist arutelu; õppija asetab kõige rohkem harjutamist vajava oskuse juurde konkreetse järgmise sammu kaardi.",
    accent: "the next-step learning plan card",
    text: [],
    place: "060_t_self",
    learningJob: "tõlgendada vahehindamise tagasisidet ja koostada järgmise kursuseosa arenguplaan",
    alt: "Õppija ja õpetaja koostavad vahehindamise tulemuste põhjal õppimise järgmise sammu.",
    caption: "Pilt 1. Tagasisidest sünnib konkreetne arenguplaan.",
    prompts: ["Mida vaatavad õppija ja õpetaja koos?", "Milline oskus vajab sinu arvates kõige rohkem harjutamist?", "Millise järgmise sammu valiksid sina oma keeleõppes?"],
  },
];
