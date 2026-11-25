// Visual briefs of a2b1 module 10; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (046 a Saturday timetable Tallinn → Tartu
// for the info-line call, 047 three ways to Riga with times, one-way prices and the budget, 048 a six-picture story for
// the story game, 049 a two-day plan for Pärnu for the letter to a friend). They are line drawings the content agent made
// from hand-written SVG (not generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line,
// white, one lime accent, pale-lime blob, grey); Codex may redraw them from the same briefs. No people of the continuing
// story. Each picture stands directly above the task that uses it (`place` = that task's id), so the picture and its task
// share a page. The earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below; their files
// stay in public/.
export default [
  {
    id: "a2b1-046-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Sõiduplaani tahvel heleroheline laigu peal, laimirohelise päisega „SÕIDUPLAAN · Tallinn → Tartu · laupäev”. Veerud: väljub, kust, ümberistumine, saabub Tartusse, hind. Neli rida ikooniga: rong „7.30” „Balti jaam” „otserong” „9.40” „12 €”; rong „8.05” „Balti jaam” „Tapal 8.55 → 9.05” „10.50” „9 €”; buss „9.00” „bussijaam” „otsebuss” „11.30” „10 €”; rong „10.30” „Balti jaam” „otserong” „12.40” „12 €”. All jalgratas „jalgratas rongis: + 2 €”, „jalgratas bussis: + 2 €, kui on ruumi” ja kast „Tapal: sama perroon, ümberistumiseks 10 minutit”.",
    accent: "the timetable header",
    text: ["SÕIDUPLAAN · Tallinn → Tartu · laupäev", "väljub", "kust", "ümberistumine", "saabub Tartusse", "hind", "7.30", "8.05", "9.00", "10.30", "Balti jaam", "bussijaam", "otserong", "otsebuss", "Tapal 8.55 → 9.05", "9.40", "10.50", "11.30", "12.40", "12 €", "9 €", "10 €", "jalgratas rongis: + 2 €", "jalgratas bussis: + 2 €, kui on ruumi", "Tapal: sama perroon,", "ümberistumiseks 10 minutit"],
    learningJob: "vastata reisiinfo telefonile: öelda sõiduplaani järgi, kust ja mis kell rong või buss väljub, kus tuleb ümber istuda ja millal see Tartusse jõuab (väljub Balti jaamast, istub ümber Tapal, saabub Tartusse), ja leida helistajale tema varjatud info järgi parim ühendus",
    place: "046_p_gap",
    alt: "Sõiduplaan, laupäev, Tallinnast Tartusse: otserong väljub Balti jaamast kell 7.30 ja saabub Tartusse 9.40, 12 eurot; rong väljub Balti jaamast 8.05, Tapal ümberistumine 8.55 → 9.05, saabub Tartusse 10.50, 9 eurot; otsebuss väljub bussijaamast 9.00 ja saabub 11.30, 10 eurot; otserong väljub Balti jaamast 10.30 ja saabub 12.40, 12 eurot. Jalgratas rongis maksab 2 eurot, bussis samuti 2 eurot, kui on ruumi. Tapal on sama perroon, ümberistumiseks on 10 minutit.",
    caption: "Sõiduplaan: Tallinn → Tartu.",
    prompts: ["Kust ja mis kell väljub kõige odavam rong?", "Kus tuleb ümber istuda?", "Millise ühenduse sina valiksid ja miks?"],
  },
  {
    id: "a2b1-047-kasuta-2",
    phase: "transfer",
    format: "comparison",
    cast: [],
    scene: "Kolm kaarti kõrvuti heleroheline laigu peal: „BUSS” (laimiroheline päis), „RONG”, „LENNUK”, igaühel ikoon ja neli rida. BUSS: „17.30 → 22.00”, „20 € (üks suund)”, „+ wifi, pistikupesa”, „– vähe ruumi”. RONG: „17.25 → 23.10”, „25 € (üks suund)”, „+ laud, saab töötada”, „– hilja kohal”. LENNUK: „18.45 → 19.45”, „60–120 € (üks suund)”, „+ kõige kiirem”, „– lennujaama 1 h enne”. All kast „Reede kell 17 → pühapäeva õhtu” ja „Eelarve: 100 € kahe peale, edasi-tagasi”.",
    accent: "the header of the BUSS card",
    text: ["BUSS", "RONG", "LENNUK", "17.30 → 22.00", "20 € (üks suund)", "+ wifi, pistikupesa", "– vähe ruumi", "17.25 → 23.10", "25 € (üks suund)", "+ laud, saab töötada", "– hilja kohal", "18.45 → 19.45", "60–120 € (üks suund)", "+ kõige kiirem", "– lennujaama 1 h enne", "Reede kell 17 → pühapäeva õhtu", "Eelarve: 100 € kahe peale, edasi-tagasi"],
    learningJob: "arutada paaris, millega sõita Riiga, võrrelda aega, hinda ja mugavust (odavam kui, kõige kiirem, eelistan rongi bussile, pigem … kui) ja jõuda eelarve piires ühe otsuseni",
    place: "047_t_agree",
    alt: "Kolm teed Riiga. Buss: reedel 17.30, kohal 22.00, 20 eurot üks suund, wifi ja pistikupesa, aga vähe ruumi. Rong: 17.25, kohal 23.10, 25 eurot üks suund, laud ja saab töötada, aga hilja kohal. Lennuk: 18.45, kohal 19.45, 60–120 eurot üks suund, kõige kiirem, aga lennujaama tuleb minna tund enne. Reis on reedel kell 17 kuni pühapäeva õhtuni, eelarve 100 eurot kahe peale edasi-tagasi.",
    caption: "Kolm teed Riiga.",
    prompts: ["Mis on kõige odavam ja mis kõige kiirem?", "Kas lennuk mahub eelarvesse?", "Mida sina eelistaksid ja miks?"],
  },
  {
    id: "a2b1-048-kasuta-2",
    phase: "transfer",
    format: "sequence",
    cast: [],
    scene: "Kuus nummerdatud pilti kahes reas heleroheline laigu peal, iga pildi all lühike allkiri. 1 „E kell 7.40”: inimene voodis, kell näitab 7.40. 2 „bussijaam kell 8.05” (laimiroheline taust): inimene perroonil, buss sõidab noolega minema, silt „8.00”. 3 „järgmine buss kell 10.00”: buss ja kell 10.00. 4 „Riia: vihm”: pilv ja vihm inimese kohal, läbi kriipsutatud vihmavari. 5 „muuseum”: muuseumihoone ja silt „E suletud”. 6 „õhtu”: noot ja kaks inimest.",
    accent: "the background of picture 2",
    text: ["1", "2", "3", "4", "5", "6", "E kell 7.40", "bussijaam kell 8.05", "8.00", "järgmine buss kell 10.00", "Riia: vihm", "muuseum", "E", "suletud", "õhtu"],
    learningJob: "jutustada pildilugu enneminevikuga: mis juhtus ja mis oli enne juhtunud (kui ta bussijaama jõudis, oli buss juba läinud; ta oli vihmavarju koju unustanud), siis jutustada oma reisist, mis läks teisiti",
    place: "048_t_live",
    alt: "Pildilugu kuues osas. 1: esmaspäeval kell 7.40 on inimene alles voodis. 2: kell 8.05 bussijaamas, kella kaheksane buss sõidab minema. 3: järgmine buss läheb kell 10.00. 4: Riias sajab vihma, vihmavarju ei ole. 5: muuseum, silt „E suletud”. 6: õhtul kontsert, kaks inimest kuulavad muusikat.",
    caption: "Pildilugu: reis Riiga.",
    prompts: ["Mis oli juhtunud, kui ta bussijaama jõudis?", "Mida ta oli koju unustanud?", "Mis on sinu reisil teisiti läinud?"],
  },
  {
    id: "a2b1-049-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Plaanikaart heleroheline laigu peal, laimirohelise päisega „KAKS PÄEVA PÄRNUS”. Vasakul kolm osa: „SÕIT” bussiga „Tallinn → Pärnu”, „buss 2 h · 10 € · iga tund”; „ÖÖBIMINE” majaga „hostel: 25 € öö”, „või minu juures (diivan)”; „HOIATUS”: „! esmaspäeval muuseum suletud”, „! vihma korral: veekeskus”, „! rannas vett ja päikesekreemi”. Paremal „LAUPÄEV”: lained „rand ja ujumine”, muul „jalutuskäik muulil”, maja „vanalinn, õhtusöök”; „PÜHAPÄEV”: „veekeskus või rannapark”, „kohvik, siis buss tagasi”.",
    accent: "the plan header",
    text: ["KAKS PÄEVA PÄRNUS", "SÕIT", "Tallinn → Pärnu", "buss 2 h · 10 € · iga tund", "ÖÖBIMINE", "hostel: 25 € öö", "või minu juures (diivan)", "HOIATUS", "! esmaspäeval muuseum suletud", "! vihma korral: veekeskus", "! rannas vett ja päikesekreemi", "LAUPÄEV", "rand ja ujumine", "jalutuskäik muulil", "vanalinn, õhtusöök", "PÜHAPÄEV", "veekeskus või rannapark", "kohvik, siis buss tagasi"],
    learningJob: "kirjutada sõbrale 60–90-sõnaline isiklik kiri kahe päeva plaaniga: kuidas ta sõidab, kus ööbib, mida teete ja üks nõuanne või hoiatus (soovitan sõita, tasub vaadata, ära unusta võtta)",
    place: "049_t_letter",
    alt: "Kaks päeva Pärnus. Sõit: buss Tallinnast Pärnusse kaks tundi, 10 eurot, iga tund. Ööbimine: hostel 25 eurot öö või minu juures diivanil. Hoiatus: esmaspäeval on muuseum suletud, vihma korral veekeskus, randa vett ja päikesekreemi. Laupäev: rand ja ujumine, jalutuskäik muulil, vanalinn ja õhtusöök. Pühapäev: veekeskus või rannapark, kohvik ja siis buss tagasi.",
    caption: "Kaks päeva Pärnus.",
    prompts: ["Kuidas Pärnusse sõita ja kus ööbida?", "Mida teha laupäeval ja mida pühapäeval?", "Mida soovitaksid sina sõbrale oma linnas?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-046-avasta-1",
    phase: "discover",
    format: "comparison",
    cast: ["Sofia"],
    scene: "Sofia võrdleb jaamas kahte Tallinna–Tartu rongi: otseühendust ja ümberistumisega varianti koos aja, istekoha ning platvormi märkidega.",
    accent: "the selected direct train option",
    text: [],
    learningJob: "võrrelda transpordiühendusi ning teha piletiostu otsus",
    alt: "Sofia valib kahe rongiühenduse vahel otserongi ja ostab telefoni kaudu pileti.",
    caption: "Pilt 1. Kahe rongiühenduse võrdlus.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus inimesed pildil on ja kuhu nad sõidavad?", "Kuidas nad pileti ostavad?", "Millega sina tavaliselt reisid?"],
  },
  {
    id: "a2b1-047-avasta-1",
    phase: "discover",
    format: "comparison",
    cast: ["Anna", "Markus"],
    scene: "Anna ja Markus kavandavad kahepäevast Riia-reisi, võrreldes bussi ja lennukit ning valides hotelli, turu, söögi ja vaba aja tegevuse.",
    accent: "the selected bus itinerary",
    text: [],
    learningJob: "koostada järjestatud reisiplaan transpordi, majutuse, tegevuste ja eelarve valikutest",
    alt: "Anna ja Markus valivad Riia-reisiks bussi ning kavandavad majutuse ja tegevused.",
    caption: "Pilt 1. Kahepäevase Riia-reisi plaan.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimesed pildil planeerivad?", "Mida nad võrdlevad ja miks?", "Kuhu sina tahaksid nädalavahetusel sõita?"],
  },
  {
    id: "a2b1-048-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Anna", "Sofia"],
    scene: "Anna ja Sofia Helsingi nädalavahetus kulgeb sadamast laevareisi ja hotelli kaudu vaatamisväärsuste, lõuna, turu ning tagasisõiduni.",
    accent: "the chronological travel line",
    text: [],
    learningJob: "jutustada möödunud reisist kronoloogilise sündmusterea abil",
    alt: "Anna ja Sofia meenutavad pildireana oma Helsingi laevareisi sündmusi.",
    caption: "Pilt 1. Helsingi-reisi sündmused minevikus.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus see inimene reisis ja mida ta nägi?", "Mida ta seal tegi?", "Räägi oma viimasest reisist."],
  },
  {
    id: "a2b1-049-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus", "Liis"],
    scene: "Hilinenud buss jätab Markuse Viljandis Tartu ühendusest maha; Liis väljastab talle uue pileti ja osutab õigele peatusele.",
    accent: "the replacement ticket",
    text: [],
    learningJob: "selgitada ootamatut reisiolukorda ning mõista pakutud lahendust",
    alt: "Liis annab ühendusbussist maha jäänud Markusele uue pileti ja näitab peatust.",
    caption: "Pilt 1. Mahajäänud ühendus ja uus pilet.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis probleem on pildil reisijal?", "Kellelt ta abi küsib?", "Mis juhtus sinuga kord reisil?"],
  },
  {
    id: "a2b1-050-avasta-1",
    phase: "discover",
    format: "sequence",
    cast: ["Sofia", "Liis"],
    scene: "Sofia hilinenud Tallinna–Tartu rongi olukord liigub infolaua kaudu alternatiivse bussi, tagasimakse ja telefoniteateni.",
    accent: "the alternative bus route",
    text: [],
    learningJob: "ühendada hilinemise teade, alternatiivne transport, tagasimakse ja reisijale saadetud sõnum",
    alt: "Liis aitab Sofial hilinenud rongi asemel bussi leida ning korraldab tagasimakse ja teate.",
    caption: "Pilt 1. Hilinenud rongi alternatiivne reisilahendus.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus inimesed pildil on?", "Millega nad sõidavad ja kuhu?", "Kirjelda pilti kolme lausega."],
  },
];
