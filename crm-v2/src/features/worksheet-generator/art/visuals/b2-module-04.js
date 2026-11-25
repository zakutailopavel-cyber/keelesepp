// Visual briefs of b1b2 module 04; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-17 (task-based module 4, docs/COURSE_CAST.md);
// the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py. 2026-11-25 (methodology v5): the same pictures,
// each placed before the lesson's one input (019 moved from Kasuta to Avasta); the questions now prepare that input and
// the lesson's grammar (no new images).
export default [
  {
    id: "b1b2-016-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus"],
    // 2026-11-17 (v4): the old soup-bowl picture did not serve a renting lesson; the image is reused from
    // est-c1-023-kasuta-1 (the same scene: a flat handed back, a worn wall, a broken cupboard door and dark tile joints
    // beside the contract and move-in photos), copied to this lesson's folder
    scene: "Korteri üleandmisel võrdlevad üürnik ja üürileandja laual olevat üürilepingut sissekolimise fotodega. Kõrval on kolm kahjuikooni: kulunud sein, katkine kapiuks ja tumenenud vuugid; üks foto on esile tõstetud.",
    accent: "the decisive move-in photograph beside the contract",
    text: [],
    // v5 (2026-11-25): before the one input 016_d_text — the picture is the scheme „kulumine või kahju” drawn
    place: "016_d_text",
    learningJob: "eristada harilikku kulumist kahjust ja öelda, mis on korteris tehtud ja mis mitte",
    alt: "Kaks inimest võrdlevad üürilepingut ja fotosid; mullides on kulunud sein, katkine kapiuks ja tumedad vuugid.",
    caption: "Pilt 1. Võtmete üleandmine: mis on kulumine, mis kahju?",
    prompts: ["Mida need kaks inimest laual võrdlevad ja miks on sissekolimise foto tähtis?", "Milline kolmest murest on sinu arvates harilik kulumine ja milline kahju? Ütle: kapiuks tehti katki …, seina ei …", "Lugemise järel: mida oleks pidanud tegema sissekolimise päeval, et vaidlust ei tekiks?"],
  },
  {
    id: "b1b2-017-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Jaan"],
    // 2026-11-17 (v4, round 3: 017 moved from the doctor to a school note): the image is reused from est-c1-034-kasuta-1
    // (two parents compare a rumour on the phone with the school's official notice), copied to this lesson's folder
    scene: "Kaks lapsevanemat istuvad köögilaua taga: üks loeb telefonist vanemate vestluse sõnumit, teine hoiab käes kooli ametlikku teadet; nende vahel on linnuke, mis näitab, et nad kontrollivad infot.",
    accent: "the official school notice beside the rumour on the phone",
    text: [],
    // v5 (2026-11-25): before the scheme 017_d_scheme (official → plain), which prepares the one input 017_d_listen
    place: "017_d_scheme",
    learningJob: "eristada kooli ametlikku teadet kuulujutust ja seletada teate sisu pereliikmele",
    alt: "Kaks lapsevanemat võrdlevad telefoni sõnumit ja kooli ametlikku teadet.",
    caption: "Pilt 1. Mida kool täpselt kirjutas?",
    prompts: ["Mida need kaks inimest võrdlevad: telefoni sõnumit või kooli ametlikku teadet? Kumb on usaldusväärsem?", "Mida võib kooli teates olla kirjas? Ütle kaks lauset: on kohustatud …, on keelatud …", "Kuulamise järel: mida pidi isa õpetajalt üle küsima, sest teatest jäi see arusaamatuks?"],
  },

  {
    id: "b1b2-018-avasta-1",
    phase: "discover",
    format: "matching",
    cast: ["Liis", "Viktor"],
    scene: "Vabatahtlik aitab toiduabi kogumisel, õpetab eakale mehele arvutit ja istutab pargis puu; iga tegevus on seotud oma sümboliga.",
    accent: "the verb-case connector network",
    text: [],
    // v5 (2026-11-25): before the one input 018_d_text — three ways of joint activity, each with its verb
    place: "018_d_text",
    learningJob: "rääkida vabast ajast ja vabatahtlikust tööst õige rektsiooniga: osalema milles, aitama keda, tegelema millega",
    alt: "Vabatahtliku kolm tegevust: toiduabi, arvutiabi eakale ja puu istutamine pargis.",
    caption: "Pilt 1. Kolm viisi, kuidas vaba aega teistega jagada.",
    prompts: ["Millega inimene pildil kolmes kohas tegeleb? Keda ta aitab ja milles osaleb?", "Mida ta sellest saab? Ütle: ta pühendub …-le, ta suhtub …-sse …", "Lugemise järel: milline neist kolmest tegevusest sobiks tekstis kirjeldatud väsinud täiskasvanule ja miks?"],
  },
  {
    id: "b1b2-019-kasuta-1",
    // v5 (2026-11-25): moved to Avasta, before the one input 019_d_listen (the id keeps its old name: the file name)
    phase: "discover",
    format: "scene",
    cast: ["Sofia", "Viktor"],
    // 2026-11-17 (v4, round 3: 019 moved from lost documents to a cancelled trip): the image is reused from
    // est-c1-062-kasuta-1 (a cancelled train: a replacement bus, a bed and a message on a decision board), copied here
    scene: "Raudteejaamas on rong tühistatud. Noor naine osutab otsustustahvlil asendusbussile, mille kõrval on voodi (majutus) ja sõnumimull; eakas mees hoiab piletit.",
    accent: "the decision board: replacement bus, accommodation, message",
    text: [],
    place: "019_d_listen",
    learningJob: "koostada ärajäänud reisi korral samm-sammuline plaan B sihitise, tegevusnime ja rektsiooniga",
    alt: "Jaamas osutab noor naine eakale mehele asendusbussile; tahvlil on ka majutus ja sõnum.",
    caption: "Pilt 1. Rong jäi ära: asendusbuss, majutus, sõnum.",
    prompts: ["Mis jaamas juhtus ja mida tahvel pakub?", "Mida peab eakas mees nüüd tegema? Kasuta vorme: peab …, tuleb … alles hoida, pöörduma … poole.", "Kuulamise järel: mida soovitab nõustaja teha esimesena ja miks?"],
  },

  {
    id: "b1b2-020-avasta-1",
    phase: "discover",
    format: "map",
    cast: ["Anna", "Liis"],
    scene: "Kaks õppijat läbivad hindamisrajal sidusa loo, linnateenuste, mineviku ajajoone, sihitise, infinitiivi ja rektsiooni jaamad ning jõuavad harjutusplaanini.",
    accent: "the personalized revision route",
    text: [],
    learningJob: "muuta vahehindamise tulemused nähtavaks kordamisplaaniks",
    alt: "Kaks õppijat seovad kuus õpioskust üheks isiklikuks kordamisrajaks.",
    caption: "Pilt 1. Vahehindamise õpitee ja kordamisplaan.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Milliseid teemasid õppijad hindamisrajal kordavad?", "Milline jaam tundub sulle kõige raskem? Miks?", "Mida tahad enne vahehindamist veel harjutada?"],
  },
];
