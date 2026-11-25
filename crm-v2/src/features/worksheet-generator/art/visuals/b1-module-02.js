// Visual briefs of a2b1 module 02; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (006 family tree, 007 four people, 008 three
// black bags, 009 three options). They are line drawings the content agent made from hand-written SVG (not generated) as
// working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent, pale-lime blob, grey);
// Codex may redraw them from the same briefs. The people are made up and are not the continuing story's cast. The
// earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below; their files stay in public/.
export default [
  {
    id: "a2b1-006-avasta-2",
    phase: "discover",
    format: "scene",
    cast: [],
    scene: "Sugupuu skeemina, kümme nimekaarti väikese näoikooniga: üleval Maria; teises reas Sergei = Olga ja Galina = Peeter (paarid topeltjoonega), mõlemad paarid on Maria laste rida; kolmandas reas Sergei ja Olga lapsed Tatjana ja Igor (Igor = Kristel) ning Galina ja Peetri tütar Lena; all Igori ja Kristeli poeg Mark. Tatjana kaart on esile tõstetud, all „(mina)”. Sugulussõnu (tädi, nõbu …) skeemil ei ole — need ütleb õppija ise.",
    accent: "Tatjana's card (mina)",
    text: ["Maria", "Sergei", "Olga", "Galina", "Peeter", "Tatjana", "Igor", "Kristel", "Lena", "Mark", "(mina)"],
    learningJob: "öelda sugulust kelle-vormiga skeemi järgi (Lena on Galina tütar, Galina on Tatjana isa õde = tädi, Mark on Igori poeg) ja küsida paariliselt „Kelle …?”",
    place: "006_d_tree",
    alt: "Sugupuu: vanaema Maria, tema lapsed Sergei ja Galina koos abikaasadega, lapselapsed Tatjana, Igor ja Lena ning Igori ja Kristeli poeg Mark.",
    caption: "Tatjana suguvõsa.",
    prompts: ["Kes on Galina Tatjanale?", "Kelle tütar on Lena? Kelle poeg on Mark?", "Joonista oma suguvõsa samamoodi ja näita paarilisele."],
  },
  {
    id: "a2b1-007-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Neli kõrvuti kaarti tähtedega A–D, igaühel vanema inimese rinnapilt, nimi ja kaks märksõna: A Vaike (prillid, lühikesed hallid juuksed) — „joonistab”, „kardab koeri”; B Toomas (suur habe) — „mängib malet”, „vaba E ja K”; C Helju (lokkis juuksed) — „küpsetab”, „vaba ainult L”; D Arvo (nokamüts) — „jalutab koeraga”, „vaba iga päev”. Keegi ei sobi perele täiesti: valik vajab põhjendust.",
    accent: "the letter badges A–D",
    text: ["A", "B", "C", "D", "Vaike", "Toomas", "Helju", "Arvo", "joonistab", "kardab koeri", "mängib malet", "vaba E ja K", "küpsetab", "vaba ainult L", "jalutab koeraga", "vaba iga päev"],
    learningJob: "kirjeldada inimest kes- ja kellel-lausetega nii, et paariline ta ära tunneb (naine, kellel on prillid; mees, kes mängib malet), ja valida põhjendusega, kes sobib kuulutuse perele",
    place: "007_t_choose",
    alt: "Neli vanemat inimest: prillidega Vaike joonistab, aga kardab koeri; habemega Toomas mängib malet; lokkis juustega Helju küpsetab; nokamütsiga Arvo jalutab koeraga.",
    caption: "Neli inimest, kes tahavad aidata.",
    prompts: ["Kirjelda üht inimest nime ütlemata: „See on mees, kellel …”", "Kes sobib perele, kus elab suur koer ja poiss armastab malet? Miks?", "Kes ei sobi ja miks?"],
  },
  {
    id: "a2b1-008-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Leitud asjade büroo riiul, üleval silt „LEITUD ASJAD”. Riiulil kolm musta kotti tähtedega A–C: A käekott, mille küljes ripub võtmehoidja väikese kassiga; B kott, millest paistab vihmavari; C seljakott, millel on valge täht. Lahtiolekuaegu pildil ei ole (need on töötaja varjatud info).",
    accent: "the letter badges A–C",
    text: ["LEITUD ASJAD", "A", "B", "C"],
    learningJob: "kirjeldada telefonis oma kotti mis-lausetega nii täpselt, et töötaja leiab õige (kott, mille küljes on kass; seljakott, millel on täht)",
    place: "008_t_lost",
    alt: "Leitud asjade riiulil on kolm musta kotti: kassiga võtmehoidjaga käekott, kott vihmavarjuga ja valge tähega seljakott.",
    caption: "Kolm musta kotti.",
    prompts: ["Mille poolest kotid erinevad?", "Milline kott on sinu oma? Kirjelda seda mille- või millel-lausega.", "Mida sa veel küsid, kui helistad büroosse?"],
  },
  {
    id: "a2b1-009-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kolm kõrvuti valikukaarti ikooniga, pealkirja ja kolme märksõnaga: RESTORAN (taldrik, kahvel, nuga) — kallis, palju lärmi, ei pea koristama; MAAMAJA (maja, puu, korstnast suits) — suur aed ja saun, kaugel linnast, toit tuleb ise teha; KODU (kortermaja) — odav, vähe ruumi, lähedal. Üleval esile tõstetud küsimus „Kus me peo teeme?”.",
    accent: "the question banner",
    text: ["Kus me peo teeme?", "RESTORAN", "kallis", "palju lärmi", "ei pea koristama", "MAAMAJA", "suur aed ja saun", "kaugel linnast", "toit tuleb ise teha", "KODU", "odav", "vähe ruumi", "lähedal"],
    learningJob: "võrrelda kolme võimalust, teha ettepanek ja põhjendada seda sest- või kuna-lausega ning leppida kokku (Võiksime teha peo maal, sest …; Kuna kodus on vähe ruumi, …)",
    place: "009_t_meet",
    alt: "Kolm võimalust peoks: restoran on kallis ja lärmakas, maamajas on aed ja saun, aga see on kaugel, kodu on odav, aga väike.",
    caption: "Kolm võimalust.",
    prompts: ["Mis on iga võimaluse pluss ja miinus?", "Mida sina pakud? Põhjenda sest- või kuna-lausega.", "Milline võimalus sobib sinu pere peole?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-006-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Jaan", "Viktor", "Sofia"],
    scene: "Tallinna korteris parandavad Jaan ja Viktor koos jalgratta ratast, Sofia katab samal ajal söögilauda ning Muki istub Jaani kõrval.",
    accent: "the bicycle wheel rim",
    text: [],
    learningJob: "järeldada, kes on üksteisele lähedased, kirjeldada inimesi ja nimetada nende ühiseid tegevusi",
    alt: "Jaan ja Viktor parandavad jalgratast, Sofia katab lauda ning Muki istub kõrval.",
    caption: "Pilt 1. Lähedased inimesed tegutsevad koos.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kes on pildil ja kes nad üksteisele võiksid olla?", "Mida pere pildil koos teeb?", "Mida teeb sinu pere koos?"],
  },
  {
    id: "a2b1-007-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus", "Liis", "Sofia", "Jaan"],
    scene: "Kontoris on kaustad maha kukkunud: Sofia ja Jaan aitavad neid kokku korjata, Markus toob suure kasti, Liis korraldab tööd ning Anna jälgib olukorda.",
    accent: "the box Markus carries",
    text: [],
    learningJob: "eristada välimuse ja iseloomu kirjeldusi ning põhjendada iseloomuomadusi nähtavate tegudega",
    alt: "Kontoris aitavad Sofia, Jaan ja Markus kaustu korrastada, Liis juhendab ning Anna vaatab.",
    caption: "Pilt 1. Iseloom avaldub inimese tegudes.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Milline on pildil inimeste välimus?", "Mida nende teod räägivad nende iseloomust?", "Kirjelda üht inimest pildilt kolme lausega."],
  },
  {
    id: "a2b1-008-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Viktor"],
    scene: "Pärast pargipiknikku uurivad Anna ja Viktor lauale jäänud jopet, termost, vihmavarju, mütsi, palli ja telefoni; Anna küsib telefoni omaniku kohta, Viktor osutab jope nimesildile.",
    accent: "the lost phone case",
    text: [],
    learningJob: "määrata esemete omanikud ning küsida ja vastata, kelle oma iga ese on",
    alt: "Anna ja Viktor uurivad piknikulauale jäänud asju ning otsivad nende omanikke.",
    caption: "Pilt 1. Kelle asjad jäid pärast piknikku lauale?",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis asjad jäid pärast piknikku lauale?", "Kelle asjad need võiksid olla ja miks sa nii arvad?", "Mida sina oled kunagi kuhugi unustanud?"],
  },
  {
    id: "a2b1-010-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Viktor", "Jaan"],
    scene: "Anna, Viktor ja Jaan valmistavad pere laua juures sünnipäevaüllatust: Anna hoiab kooki, Viktor vaatab fotoalbumit, Jaan toob joogid ning kell ja tööikoon näitavad hilisemaks muudetud aega.",
    accent: "the birthday cake",
    text: [],
    learningJob: "järeldada, kes mida teeb ja kellele album kuulub, kirjeldada iseloomu tegude kaudu ning selgitada plaani muutust",
    alt: "Anna toob koogi, Viktor vaatab perealbumit ja Jaan valmistab sünnipäevalaua joogid.",
    caption: "Pilt 1. Pere valmistab muudetud ajaga sünnipäevaüllatust.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida pere pildil ette valmistab?", "Kelle sünnipäev see võiks olla?", "Kuidas sinu pere sünnipäevi tähistab?"],
  },
];
