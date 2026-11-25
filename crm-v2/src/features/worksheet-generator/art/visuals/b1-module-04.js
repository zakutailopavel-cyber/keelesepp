// Visual briefs of a2b1 module 04; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (016 two Saturdays on a time axis, 017 the
// kitchen rules board, 018 the week's to-do list with three boxes, 019 my week's calendar). They are line drawings the
// content agent made from hand-written SVG (not generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2
// (black line, white, one lime accent, pale-lime blob, grey); Codex may redraw them from the same briefs. The places and
// people are made up and are not the continuing story's cast. The earlier pictures (Codex, built-in image generation;
// cast scenes) are in RETIRED below; their files stay in public/.
export default [
  {
    id: "a2b1-016-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Laupäeva ajatelg kella üheksast kella üheksateistkümneni (tunninumbrid ja poolttunni kriipsud, kellaaegu kastidel ei ole). Rida A (laimirohelise tähega): hall kast „tööl” sülearvutiga 9–11 ja „pood” ostukäruga 14–15. Rida B: „lapse trenn” palliga 10–12.30 ja „vanaema juures” majakesega 16–18. All KULTUURIMAJA valged kastid samal teljel: meisterdamine 10.30–11.30, tantsutund 12–13, kokk 13.15–13.45, kontsert 15–16.30, koor 16.45–17.45 ning pikk riba „kohvik” 11–17. Paremal üleval väike kell.",
    accent: "the letter badges A and B",
    text: ["LAUPÄEV", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "A", "B", "tööl", "pood", "lapse trenn", "vanaema juures", "KULTUURI-", "MAJA", "meister-", "damine", "tantsu-", "tund", "kokk", "kontsert", "koor", "kohvik"],
    learningJob: "lugeda kellaaeg teljelt ja öelda see sõnadega (kella kaheteistkümnest kella üheni, kell veerand kaks, kestab poolteist tundi), leida kahe inimese ühine vaba aeg ja leppida kokku laupäeva plaan",
    place: "016_t_plan",
    alt: "Laupäeva ajatelg: A on kella üheksast üheteistkümneni tööl ja kella kahest kolmeni poes, B lapse trennis kella kümnest poole üheni ja vanaema juures kella neljast kuueni; all kultuurimaja meisterdamine, tantsutund, kokk, kontsert, koor ja kohvik.",
    caption: "Kaks laupäeva.",
    prompts: ["Kellast kellani on A tööl? Aga B lapse trennis?", "Mis kell algab kontsert ja kui kaua see kestab?", "Millal on teil mõlemal aega? Kuhu te läheksite?"],
  },
  {
    id: "a2b1-017-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kohviku köögi seinatahvel, ülal laimiroheline riba pealkirjaga „KÖÖGI REEGLID”. Kuus kaarti kahes reas: kell ja „7.00” — VAHETUS algab; pestavad käed ja veetilgad, linnuke — ENNE TÖÖD; telefon, rist ringis — KÖÖGIS; aurav tass, linnuke — KOHV JA TEE tasuta; põll, linnuke — PÕLL JA MÜTS iga päev; taldrik, nuga ja kahvel, rist ringis — LETI TAGA. Lauseid pildil ei ole: reegli sõnastab õppija ise.",
    accent: "the board's title strip",
    text: ["KÖÖGI REEGLID", "7.00", "VAHETUS", "algab", "ENNE TÖÖD", "KÖÖGIS", "KOHV JA TEE", "tasuta", "PÕLL JA MÜTS", "iga päev", "LETI TAGA"],
    learningJob: "muuta märgid reegliteks: kohustus (pead tulema kell seitse, pead käed pesema, pead kandma põlle), luba (võid kohvi juua) ja keeld (köögis ei tohi telefoni kasutada, leti taga ei tohi süüa) ning seletada neid sõbrale",
    place: "017_t_letter",
    alt: "Köögi reeglite tahvel: vahetus algab kell seitse, enne tööd pese käed, köögis telefon keelatud, kohv ja tee tasuta, põll ja müts iga päev, leti taga söömine keelatud.",
    caption: "Köögi reeglid.",
    prompts: ["Mis kell peab uus töötaja tulema?", "Mida ta peab tegema ja mida võib teha?", "Mida köögis ja leti taga teha ei tohi?"],
  },
  {
    id: "a2b1-018-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Vasakul külmkapi uks, magnetiga kinnitatud paber „NIMEKIRI”: kaheksa rida tühja ruuduga, ikooni ja kahe sõnaga — elektriarve (tähtaeg homme), kooli kiri (õpetaja ootab vastust), vanaema sünnipäev (laupäeval), garaaž (koristada), pesu (pesta), kino sõbraga (neljapäeval), aknad (pesta), auto ülevaatus (järgmisel kuul). Paremal kolm tühjade joontega kasti: TÄNA (laimiroheline päis), VÕIB OODATA ja JÄÄB ÄRA (hallid päised).",
    accent: "the header of the box TÄNA",
    text: ["NIMEKIRI", "elektriarve", "tähtaeg homme", "kooli kiri", "õpetaja ootab vastust", "vanaema sünnipäev", "laupäeval", "garaaž", "koristada", "pesu", "pesta", "kino sõbraga", "neljapäeval", "aknad", "auto ülevaatus", "järgmisel kuul", "TÄNA", "VÕIB OODATA", "JÄÄB ÄRA"],
    learningJob: "otsustada paarilisega, mis on täna kiire, mis võib oodata ja mis jääb ära, ning öelda see ühendverbidega (arve tuleb ära maksta, kirja peab läbi lugema, garaaži koristamise lükkame edasi, kino jääb ära)",
    place: "018_t_story",
    alt: "Külmkapi uksel nimekiri kaheksa kodutööga: elektriarve, kooli kiri, vanaema sünnipäev, garaaž, pesu, kino sõbraga, aknad, auto ülevaatus; kõrval kolm kasti: täna, võib oodata, jääb ära.",
    caption: "Nädala nimekiri.",
    prompts: ["Mis tuleb täna ära teha ja miks?", "Mida võib edasi lükata?", "Mis jääb ära ja millal te selle uuesti kokku lepite?"],
  },
  {
    id: "a2b1-019-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Nädala kalender „MINU NÄDAL”: veerud E, T, K, N, R, vasakul kellaajad 8–18. Hallid kastid: E TÖÖ 8–16; T TÖÖ 8–12 ja KURSUS 16–18; K TÖÖ 8–16; N TÖÖ 12–18; R TÖÖ 8–14. Neljapäeval kell 10–11 laimiroheline kast „arst” ristiga (aeg jäi ära). Paremal üleval väike kell.",
    accent: "the cancelled appointment card",
    text: ["MINU NÄDAL", "E", "T", "K", "N", "R", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "TÖÖ", "KURSUS", "arst"],
    learningJob: "teada oma vabu aegu ja telefonis reageerida ajale, mis ei sobi (kahjuks ma ei saa, sest olen tööl / kursusel), küsida ise teist aega (kas teil oleks midagi reedel pärast kahte?) ja leppida see kokku",
    place: "019_t_clinic",
    alt: "Nädala kalender: esmaspäeval ja kolmapäeval töö kella kaheksast neljani, teisipäeval töö hommikul ja kursus kella neljast kuueni, neljapäeval töö kella kaheteistkümnest kuueni ja ärajäänud arstiaeg kell kümme, reedel töö kella kaheksast kaheni.",
    caption: "Minu nädal.",
    prompts: ["Millal sa oled tööl ja millal kursusel?", "Millal sul on aega arsti juurde minna?", "Mida sa ütled, kui pakutud aeg ei sobi?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-016-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Sofia"],
    scene: "Anna ja Sofia järjestavad pika päevakavariba analoogkellade ning võimlemise, hommikusöögi, tundide, lõuna, vaba aja, matka, õhtusöögi, ühiste mängude ja öörahu ikoonidega.",
    accent: "the free-time gap",
    text: [],
    learningJob: "järjestada terve päev ning kirjeldada tegevusi väljenditega enne, pärast, kõigepealt, siis ja lõpuks",
    alt: "Anna ja Sofia vaatavad kellade ja tegevusikoonidega laagri päevakava.",
    caption: "Pilt 1. Keelelaagri päev algusest öörahuni.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis kell on pildil ja mida inimesed teevad?", "Mida nad teevad enne ja pärast seda?", "Mida sina teed tavaliselt sel kellaajal?"],
  },
  {
    id: "a2b1-017-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Liis"],
    scene: "Laos selgitab Liis Markusele ohutusreegleid: Markus kannab turvavesti ja kinniseid jalanõusid, kõrvaklapid on kapis, telefonikeeld ja tõstukirada on nähtavad ning töövorm ootab laual.",
    accent: "Markus's safety vest",
    text: [],
    learningJob: "järeldada pildilt, mida töötaja peab tegema, mida võib teha, mida ei või teha ja mida saab teha",
    alt: "Liis tutvustab Markusele lao ohutusreegleid ja töökorraldust.",
    caption: "Pilt 1. Uue töötaja reeglid laos.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis silte näed pildil?", "Mida seal peab, võib või ei tohi teha?", "Milline reegel on sinu kodus kõige tähtsam?"],
  },
  {
    id: "a2b1-018-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus"],
    scene: "Markus järjestab kolme tulpa päevased ülesandekaardid: autoteenindus, tähtis meil, apteek, veebikoosolek, arve, koristamine, trenn ja emale helistamine.",
    accent: "the urgent email card",
    text: [],
    learningJob: "seada kohustused ja soovid tähtsuse järjekorda, otsustada, mis võib oodata, ning selgitada oma valikut",
    alt: "Markus järjestab kiireid, hilisemaid ja edasi lükatavaid ülesandeid.",
    caption: "Pilt 1. Kiire päeva prioriteetide seadmine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimene pildil peab tegema?", "Mis on tema jaoks kõige kiirem?", "Mida sina pead täna kindlasti tegema?"],
  },
  {
    id: "a2b1-019-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Sofia"],
    scene: "Anna ja Sofia võrdlevad kohvikus kaht tühja kalendrit: üks kohtumisaeg on töö tõttu läbi kriipsutatud ning nool viib uue päeva esile tõstetud ajani, millega mõlemad nõustuvad.",
    accent: "the newly agreed calendar cell",
    text: [],
    learningJob: "leida ettepanek, keeldumine, alternatiiv ja kinnitatud kokkulepe ning sõnastada viisakas ajamuutus",
    alt: "Anna ja Sofia tühistavad ühe kohtumisaja ning lepivad kokku uue.",
    caption: "Pilt 1. Kohtumisaja viisakas muutmine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kes pildil kokku lepivad ja mida?", "Miks võib aeg muutuda?", "Kuidas sina ütled viisakalt, et aeg ei sobi?"],
  },
  {
    id: "a2b1-020-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Markus", "Liis", "Sofia"],
    scene: "Anna jälgib sõnadeta linnaplaanil keerulise päeva muudetud järjestust: kool, töökoosolek, apteek, sõnum abikaasale ja uuele ajale viidud kohtumine kohvikus.",
    accent: "the final revised route arrow",
    text: [],
    learningJob: "ühendada päevakava, kohustused, linnakohad ja muudetud kohtumisaeg ning selgitada, kuidas tähtsad asjad tehtud saavad",
    alt: "Anna kavandab ümber kiire päeva, kuhu mahuvad kool, töö, apteek ja kohtumine.",
    caption: "Pilt 1. Muudetud plaan keeruliseks neljapäevaks.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida pildil olevad inimesed planeerivad?", "Mis kell ja kus nad kohtuvad?", "Kuidas sina oma nädalat planeerid?"],
  },
];
