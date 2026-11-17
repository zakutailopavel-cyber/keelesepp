// Visual briefs of b1b2 module 04; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Learner-facing text (alt, caption, prompts) without the course cast since 2026-11-17 (task-based module 4, docs/COURSE_CAST.md);
// the `cast` field still records who the generated picture shows. Briefs and pictures made by Codex (built-in image generation) per docs/TEXTBOOK_ART_BIBLE.md, imported by KeeleSeppArt/import_art.py.
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
    place: "016_d_read",
    learningJob: "eristada harilikku kulumist kahjust ja öelda, mis on korteris tehtud ja mis mitte",
    alt: "Kaks inimest võrdlevad üürilepingut ja fotosid; mullides on kulunud sein, katkine kapiuks ja tumedad vuugid.",
    caption: "Pilt 1. Võtmete üleandmine: mis on kulumine, mis kahju?",
    prompts: ["Mida need kaks inimest laual võrdlevad ja miks on foto tähtis?", "Milline kolmest murest on sinu arvates harilik kulumine ja milline kahju?", "Mida sina enne võtmete üleandmist kindlasti ära teeksid?"],
  },
  {
    id: "b1b2-017-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Viktor", "Liis", "Anna"],
    // 2026-11-17 (v4): the old infinitive-fork picture did not serve a doctor's-visit lesson; the image is reused from
    // est-c1-051-kasuta-1 (a relative explains the doctor's words to an older man), copied to this lesson's folder
    scene: "Arsti vastuvõtul räägib eakas mees oma valust, noor naine seletab talle arsti juttu lihtsamalt ja arst kuulab. Laual on küsimuste leht, ravimikarp ja järgmiste sammude skeem ilma nähtava tekstita.",
    accent: "the three-question preparation card between patient and doctor",
    text: [],
    place: "017_d_talk",
    learningJob: "seletada arsti nõuandeid pereliikmele edasi ja kontrollida, kas ta sai aru",
    alt: "Arsti vastuvõtul seletab noor naine eakale mehele arsti juttu; laual on ravimikarp ja sammude skeem.",
    caption: "Pilt 1. Arsti juures: kes kellele mida seletab?",
    prompts: ["Kes on pildil arst, kes patsient ja kes seletab?", "Mida peab mees pärast vastuvõttu tegema? Arva laual oleva skeemi järgi.", "Kas sina oled kellelegi arsti juures tõlkinud või seletanud? Mis oli raske?"],
  },
  {
    id: "b1b2-018-avasta-1",
    phase: "discover",
    format: "matching",
    cast: ["Liis", "Viktor"],
    scene: "Vabatahtlik aitab toiduabi kogumisel, õpetab eakale mehele arvutit ja istutab pargis puu; iga tegevus on seotud oma sümboliga.",
    accent: "the verb-case connector network",
    text: [],
    place: "018_d_radio",
    learningJob: "rääkida vabast ajast ja vabatahtlikust tööst õige rektsiooniga: osalema milles, aitama keda, tegelema millega",
    alt: "Vabatahtliku kolm tegevust: toiduabi, arvutiabi eakale ja puu istutamine pargis.",
    caption: "Pilt 1. Kolm viisi, kuidas vaba aega teistega jagada.",
    prompts: ["Millega inimene pildil kolmes kohas tegeleb?", "Keda ta aitab ja milles ta osaleb?", "Milline neist kolmest sobiks sulle? Mille vastu sa ise huvi tunned?"],
  },
  {
    id: "b1b2-019-kasuta-1",
    phase: "transfer",
    format: "sequence",
    cast: ["Markus", "Liis"],
    scene: "Mees avastab enne reisi, et pass on kadunud, teatab kaotusest, pöördub teeninduslauda, saab ajutise dokumendi ja jõuab laevale.",
    accent: "the emergency solution route",
    text: [],
    place: "019_t_explain",
    learningJob: "koostada kadunud dokumendi korral samm-sammuline plaan sihitise, tegevusnime ja rektsiooniga",
    alt: "Mees lahendab kadunud passi probleemi samm-sammult ja jõuab uue dokumendiga laevale.",
    caption: "Pilt 1. Kadunud dokument: samm-sammult lahenduseni.",
    prompts: ["Mis probleem mehel enne reisi tekkis?", "Milliseid samme ta astus? Kasuta vorme: pidi …, pöördus … poole, teatas …", "Mis oleks sinu esimene samm, kui dokument kaoks?"],
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
