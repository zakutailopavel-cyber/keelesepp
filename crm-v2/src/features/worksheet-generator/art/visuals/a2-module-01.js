// Visual briefs of A2 module 01 (lessons a2-001…005); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 pilot (docs/METHODOLOGY_A2_V5.md, 2026-11-25): one learning picture per teaching lesson (002–004), each
// carrying the lesson's task — the name badges are the information gap of 002, the house is the picture description of
// 003 (Harno A2 speaking 1), the two cards are the error hunt before the role play of 004. They are line drawings the
// content agent made from hand-written SVG (not generated) in the palette of TEXTBOOK_ART_BIBLE.md §2; Codex may redraw
// them from the same briefs. No cast character is drawn or named: the module does not use the continuing story.
// The diagnostic (001) and the module control (005) are one sheet each without a picture: a picture with phrases would be
// a model, so the earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below and their files
// stay in public/.
export default [
  {
    id: 'a2-002-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Neli kursuse nimesilti (2 × 2), igal pea joonistus, nimi suurelt ja kolm rida: „pärit: …”, „elab: …”, „keeled: …” (Olga — Eesti, Narva / Tallinn / vene, eesti; Taras — Ukraina / Tartu / ukraina, inglise; Liene — Läti / Tallinn / läti, vene; Ahmed — Süüria / Pärnu / araabia, inglise). All kaks silti kõrvuti: „ÕPETAJALE, VÕÕRALE: TEIE” + „Kust te pärit olete?” ja „KURSUSEKAASLASELE: SINA” + „Kust sa pärit oled?”.',
    accent: 'the „TEIE” label',
    text: ['TERE! MINA OLEN', 'OLGA', 'TARAS', 'LIENE', 'AHMED', 'pärit', 'elab', 'keeled', 'ÕPETAJALE, VÕÕRALE: TEIE', 'KURSUSEKAASLASELE: SINA', 'Kust te pärit olete?', 'Kust sa pärit oled?'],
    learningJob: 'infolünk: õppija valib salaja ühe nimesildi, paariline küsib sina-vormis (kust? kus? mis keeli?) ja arvab, kes ta on; sildi algvormid (Läti, Tallinn) tuleb vastuses panna vormi (Lätist, Tallinnas)',
    place: '002_p_badges',
    alt: 'Neli nimesilti: Olga, Taras, Liene ja Ahmed, igaühel päritolu, elukoht ja keeled; all näide, kuidas küsida õpetajalt (teie) ja kursusekaaslaselt (sina).',
    caption: 'Kes ma olen? Neli nimesilti ja kaks küsimust.',
    prompts: ['Kust on Liene pärit? Kus ta elab?', 'Kes räägib inglise keelt?', 'Kuidas sa küsid õpetajalt ja kuidas kursusekaaslaselt?'],
  },
  {
    id: 'a2-003-harjuta-2',
    phase: 'practice',
    format: 'scene',
    cast: [],
    scene: 'Neljakorruselise maja läbilõige, korrused nummerdatud 1–4: 1) kokamütsiga mees segab pliidil potti; 2) naine istub laua taga sülearvutiga; 3) noormees istub laua taga, ees lahtine raamat ja vihik; 4) vanem naine istub tugitoolis ja loeb ajalehte, põrandal magab kass. Paremal postkastide tahvel: „1 Ahti Kask, 2 Mari Lepp, 3 Ivan Petrov, 4 Leida Saar”.',
    accent: "Mari's top (2nd floor)",
    text: ['POSTKASTID', '1 Ahti Kask', '2 Mari Lepp', '3 Ivan Petrov', '4 Leida Saar'],
    learningJob: 'pildi kirjeldus (Harno A2 rääkimise 1. ülesanne): ühendada postkasti nimi ja korrus, öelda olevikus, mida igaüks teeb (teeb süüa, töötab kodus, õpib, loeb) ja ühe eitava lausega, mida ta ei tee',
    place: '003_p_picture',
    alt: 'Maja neli korrust: esimesel teeb kokk süüa, teisel töötab naine sülearvutiga, kolmandal õpib noormees, neljandal loeb vanem naine ajalehte; kõrval postkastid nimedega.',
    caption: 'Meie maja: kes kus elab ja mida teeb?',
    prompts: ['Kes elab esimesel korrusel? Mida ta teeb?', 'Kes ei tööta? Kuidas sa seda näed?', 'Mida teeb Ivan? Mida ta ei tee?'],
  },
  {
    id: 'a2-004-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Vasakul kaart „MINU ANDMED” (pea joonistus; Eesnimi Liene, Perekonnanimi Ozola, Sünniaeg 21.03.1995, Telefon 5381 2246, E-post liene@post.ee), nool paremale kaardile „KEELEKOOLI NIMEKIRI” (Nimi Liene Osola, Sünniaeg 12.03.1995, Telefon 5381 2264, E-post liene@post.ee, Rühm A2, teisipäev). All õppija mullis „Vabandust, see ei ole õige!” ja sekretär mullis „Palun korrake!”. Vead ei ole märgitud: õppija leiab need ise.',
    accent: 'the list header „KEELEKOOLI NIMEKIRI”',
    text: ['MINU ANDMED', 'KEELEKOOLI NIMEKIRI', 'Liene', 'Ozola', 'Osola', '21.03.1995', '12.03.1995', '5381 2246', '5381 2264', 'Vabandust, see ei ole õige!', 'Palun korrake!'],
    learningJob: 'võrrelda kahte kaarti ja leida kolm viga (nimes üks täht, kuupäevas päev ja kuu vahetuses, telefonis kaks numbrit vahetuses), siis öelda: „Minu perekonnanimi on O-Z-O-L-A.” — enne rollimängu, kus vead on õppija enda andmetes',
    place: '004_t_fix',
    alt: 'Õppija kaardil on nimi Liene Ozola, sünniaeg 21.03.1995 ja telefon 5381 2246; keelekooli nimekirjas on Osola, 12.03.1995 ja 5381 2264.',
    caption: 'Leia kolm viga: minu andmed ja keelekooli nimekiri.',
    prompts: ['Mis on nimekirjas valesti? Leia kolm viga.', 'Ütle perekonnanimi tähthaaval.', 'Mida sa sekretärile ütled?'],
  },
];

// Retired from the sheets in the methodology v5 pilot (2026-11-25): cast scenes with ready phrases (a model before the
// diagnostic), a picture for a sheet the lesson no longer has, or a picture that did not carry the lesson's task. The files
// stay in public/textbook-art/a2/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: 'a2-001-avasta-1',
    phase: 'discover',
    format: 'scene',
    cast: ['Anna', 'Liis'],
    scene: 'Keelekeskuse vastuvõtt. Anna seisab leti ees ja tutvustab ennast; Liis kuulab ning hoiab avatud kursuseankeeti. Anna ütleb tervituse, Liis osutab ankeedi esimesele reale.',
    accent: "Anna's top",
    text: ['Tere! Mina olen Anna.'],
    learningJob: 'infer that Anna is introducing herself, then introduce yourself and identify what information Liis may ask for next',
    alt: 'Anna tutvustab end keelekeskuse vastuvõtus Liisile, kelle käes on kursuseankeet.',
    caption: 'Pilt 1. Anna tutvustab ennast keelekeskuses.',
    prompts: ['Kus Anna ja Liis on?', 'Mida Anna Liisile ütleb?', 'Mida sina ütled, kui tutvustad ennast uues kohas?'],
  },
  {
    id: 'a2-002-harjuta-1',
    phase: 'practice',
    format: 'scene',
    cast: ['Anna', 'Markus'],
    scene: 'Anna ja Markus kohtuvad esimest korda täiskasvanute keelekursuse vaheajal. Nad seisavad kohvilaua juures, tervitavad ja esitavad teineteisele lühikesi küsimusi.',
    accent: "Anna's top",
    text: ['Mis su nimi on?', 'Kust sa pärit oled?'],
    learningJob: 'choose a suitable reply and continue a six-to-eight-line introduction dialogue',
    alt: 'Anna ja Markus tutvuvad keelekursuse vaheajal ning küsivad nime ja päritolu.',
    caption: 'Pilt 2. Uued kursusekaaslased tutvuvad.',
    prompts: ['Kus Anna ja Markus kohtuvad?', 'Mida nad teineteiselt küsivad?', 'Mida sina küsid uuelt kursusekaaslaselt?'],
  },
  {
    id: 'a2-003-harjuta-1',
    phase: 'practice',
    format: 'scene',
    cast: ['Anna', 'Sofia', 'Jaan'],
    scene: 'Kolm selget kõrvutist miniolukorda ühe pildi sees: Anna töötab sülearvutiga kontoris, Sofia õpib avatud vihikuga, Jaan räägib kohvikus kliendiga. Iga inimene teeb ainult üht tegevust.',
    accent: "Anna's top",
    text: [],
    learningJob: 'describe each person with the correct present-tense verb and then make affirmative and negative sentences',
    alt: 'Anna töötab kontoris, Sofia õpib ning Jaan räägib kohvikus kliendiga.',
    caption: 'Pilt 3. Kes töötab, õpib või räägib?',
    prompts: ['Kes pildil töötab, kes õpib ja kes räägib kliendiga?', 'Kus need inimesed on?', 'Mida sina teed: töötad või õpid? Kus?'],
  },
  {
    id: 'a2-004-kasuta-1',
    phase: 'transfer',
    format: 'scene',
    cast: ['Sofia', 'Liis'],
    scene: 'Sofia täidab teeninduslaual lihtsat isikuandmete ankeeti, Liis kontrollib dokumenti. Laual on telefon ja ümbrik; nähtavad on ainult ankeedi lühikesed väljasildid.',
    accent: 'the form clipboard',
    text: ['Nimi', 'Sünniaeg', 'Telefon', 'E-post'],
    learningJob: 'transfer personal data from a profile card into the correct form fields and check numbers and spelling',
    alt: 'Sofia täidab Liisi juures ankeeti, kus küsitakse nime, sünniaega, telefoni ja e-posti.',
    caption: 'Pilt 4. Isikuandmete ankeedi täitmine.',
    prompts: ['Mida Sofia teeninduslaual täidab?', 'Mida Liis kontrollib?', 'Milliseid andmeid tuleb ankeeti kirjutada?'],
  },
  {
    id: 'a2-005-kasuta-1',
    phase: 'transfer',
    format: 'scene',
    cast: ['Anna', 'Markus'],
    scene: 'Kontrolltunni paarisülesanne. Anna ja Markus istuvad vastamisi väikese laua ääres; Anna tutvustab ennast ilma märkmeteta, Markus kuulab ja hoiab suletud kontrollkaarti. Laual on tühi ankeet ja pliiats.',
    accent: "Anna's top",
    text: [],
    learningJob: 'perform an independent introduction, ask one follow-up question and decide whether all key personal information was communicated',
    alt: 'Anna tutvustab ennast kontrolltunnis Markusele, kes kuulab ja valmistub lisaküsimuseks.',
    caption: 'Pilt 5. Iseseisev tutvumine kontrolltunnis.',
    prompts: ['Mida Anna ja Markus teevad?', 'Miks on Markusel kontrollkaart?', 'Kuidas sina ennast tutvustad, kui sul ei ole märkmeid?'],
  },
];
