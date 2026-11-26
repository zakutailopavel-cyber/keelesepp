// Visual briefs of A2 module 05 (lessons a2-021…025); images in crm-v2/public/textbook-art/a2/<lessonId>/<id>.webp.
// Methodology v5 + v6 (docs/METHODOLOGY_A2_V5.md, docs/METHODOLOGY_V6.md, 2026-11-26): one learning picture per teaching
// lesson (021–024), each carrying a task and standing on the same page as that task (`place`) — the week planner of 021 is
// the pair gap (place + object in the base form → kuhu? + -ma), the two half-maps of 022 the main information gap, the
// ticket machine of 023 the „guide a tourist” pair task (teie-vorm), the Saturday shop fronts of 024 the ranking task under
// opening hours (the bank is closed on Saturday). Line drawings the content agent made from hand-written SVG (not
// generated) in the palette of TEXTBOOK_ART_BIBLE.md §2, one lime accent each; Codex may redraw them from the same briefs.
// No cast character is drawn or named. The control (025) has no picture. The earlier cast scenes (Codex, built-in image
// generation) are in RETIRED below and their files stay in public/.
export default [
  {
    id: 'a2-021-avasta-2',
    phase: 'discover',
    format: 'scene',
    cast: [],
    scene: 'Nädalaplaan kuues kastis, kaks rida: ülemine rida E, T, K, alumine N, R, L (punktiirjoon ridade vahel, vasakul ringis A ja B). Igas kastis päeva täht ringis, lihtne maja koha nimega (POSTKONTOR, PANK, JUUKSUR, UJULA, APTEEK, KINO) ja ringis üks asi algvormis (pakk, raha, juuksed, vesi, rohi, film).',
    accent: 'the title „TOOMASE NÄDAL: KUHU JA MIKS?”',
    text: ['TOOMASE NÄDAL: KUHU JA MIKS?', 'E', 'T', 'K', 'N', 'R', 'L', 'A', 'B', 'POSTKONTOR', 'PANK', 'JUUKSUR', 'UJULA', 'APTEEK', 'KINO', 'pakk', 'raha', 'juuksed', 'vesi', 'rohi', 'film'],
    learningJob: 'infolünk: A näeb ainult ülemist rida, B alumist; nad ütlevad igast päevast lause kuhu-vormi ja -ma-tegevusnimega (Esmaspäeval läheb Toomas postkontorisse pakki saatma) ja kirjutavad paarilise päevad üles — pildil on koht ja asi algvormis, vorme ta ei anna',
    place: '021_d_toomas',
    alt: 'Toomase nädal: esmaspäeval postkontor ja pakk, teisipäeval pank ja raha, kolmapäeval juuksur ja käärid, neljapäeval ujula ja vesi, reedel apteek ja rohi, laupäeval kino ja film.',
    caption: 'Toomase nädal: kuhu ta läheb ja mida tegema?',
    prompts: ['Kuhu läheb Toomas esmaspäeval?', 'Mida ta teeb neljapäeval?', 'Kuhu sina sel nädalal lähed?'],
  },
  {
    id: 'a2-022-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Kaks sama linnakaarti kõrvuti (KAART A, KAART B): tänav alt üles, all bussipeatus BUSS (start), valgusfoor tänava vasakul, ristmik, jõgi ja sild, ülal kirik; vasakul park. Kuus kohakasti: kaardil A on nimega APTEEK (ristmiku ja valgusfoori vahel paremal), PANK (silla taga vasakul) ja KINO (kiriku kõrval), teised kolm on „?”; kaardil B on nimega POSTKONTOR (peatuse vastas), UJULA (pargi juures) ja RAAMATUKOGU (kiriku vastas), teised „?”.',
    accent: 'the place boxes each learner knows',
    text: ['KAKS KAARTI: KUS ON …? KÜSI JA JUHATA', 'KAART A', 'KAART B', 'APTEEK', 'PANK', 'KINO', 'POSTKONTOR', 'UJULA', 'RAAMATUKOGU', '?', 'BUSS', 'start', 'sild', 'jõgi', 'ristmik', 'valgusfoor', 'kirik', 'park'],
    learningJob: 'infolünk (mooduli põhiülesanne): kumbki näeb ainult oma kaarti ja küsib bussipeatusest teed kolme puuduva kohani (Vabandage, kuidas ma saan postkontorisse?); paariline juhatab (mine otse kuni ristmikuni, üle silla, kiriku vastas) ja küsija kirjutab koha oma kaardile; lõpus võrreldakse kaarte',
    place: '022_t_map',
    alt: 'Kaks linnakaarti: mõlemal bussipeatus, valgusfoor, ristmik, jõgi sillaga, kirik ja park; kaardil A on nimega apteek, pank ja kino, kaardil B postkontor, ujula ja raamatukogu, ülejäänud kohad on küsimärgiga.',
    caption: 'Kaart A ja kaart B: küsi ja juhata teed.',
    prompts: ['Kus on apteek?', 'Kuidas saab bussipeatusest raamatukokku?', 'Mis on kiriku vastas?'],
  },
  {
    id: 'a2-023-avasta-2',
    phase: 'discover',
    format: 'scene',
    cast: [],
    scene: 'Suur piletiautomaat esivaates: ekraanil sammud 1 (EST · ENG · RUS), 2 (nupp PILET), 3 (1 h või 24 h, „vali pilet”); all kaardipesa (4 pangakaart) ja piletipesa (5 pilet välja). Paremal hoiatussilt kolmnurgaga „kaart!”, vasakul hinnasilt „1 h = 2 €, 24 h = 5 €, ainult kaart”.',
    accent: 'the machine screen',
    text: ['PILETIAUTOMAAT: MIDA TEHA?', '1 EST · ENG · RUS', '2 PILET', '1 h', '24 h', '3 vali pilet', '4 pangakaart', '5 pilet välja', '!', 'kaart!', '1 h = 2 €', '24 h = 5 €', 'ainult kaart'],
    learningJob: 'juhised: A juhendab turisti teie-vormis viie käsuga pildi järjekorras (Valige keel. Vajutage „Pilet”. Valige pilet. Pange kaart. Võtke pilet.) ja ütleb hoiatussildi järgi keelu (Ärge unustage kaarti!); B näitab sõrmega pildil; vahetusel sina-vormis',
    place: '023_d_machine',
    alt: 'Piletiautomaat viie sammuga: keel, nupp Pilet, 1 tund või 24 tundi, pangakaart, pilet välja; kõrval hoiatussilt „kaart!” ja hinnad 2 ja 5 eurot.',
    caption: 'Piletiautomaat: mis järjekorras?',
    prompts: ['Mida teeb turist kõigepealt?', 'Mis maksab 24 tunni pilet?', 'Mida ei tohi unustada?'],
  },
  {
    id: 'a2-024-kasuta-2',
    phase: 'transfer',
    format: 'scene',
    cast: [],
    scene: 'Tänav viie majaga, igal nimesilt ja laupäeva lahtiolekuaja silt: POSTKONTOR L 10–14, TURG L 8–13, RAAMATUKOGU L 11–16, PANK L suletud, JUUKSUR L 10–15 (ovaalne silt „aeg 12.00”). Vasakul üleval kell 10.00, paremal kell 14.00.',
    accent: 'the five opening-hours signs',
    text: ['LAUPÄEV, KELL 10–14: MIS ON AVATUD?', 'POSTKONTOR', 'TURG', 'RAAMATUKOGU', 'PANK', 'JUUKSUR', 'L 10–14', 'L 8–13', 'L 11–16', 'L suletud', 'L 10–15', 'aeg 12.00', '10.00', '14.00'],
    learningJob: 'otsus paaris (järjesta ja vali): neli tundi, viis kohta, igaüks umbes pool tundi; sildi järgi tuleb panna kohad järjekorda (turg ja postkontor varakult, juuksur kell 12, raamatukogu avatakse kell 11) ja märgata, et pank on laupäeval suletud — see jääb esmaspäevaks',
    place: '024_t_route',
    alt: 'Viis maja laupäeval: postkontor 10–14, turg 8–13, raamatukogu 11–16, pank suletud, juuksur 10–15 ja aeg kell 12; kellad 10.00 ja 14.00.',
    caption: 'Laupäev, kella kümnest kaheni: mis järjekorras?',
    prompts: ['Mis on laupäeval suletud?', 'Mis kell turg sulgub?', 'Kuhu te lähete kõigepealt?'],
  },
];

// Retired from the sheets in the methodology v5 + v6 rewrite (2026-11-26): cast scenes that did not carry the lesson's
// task; module 5 uses no continuing-story cast. The files stay in public/textbook-art/a2/ and can return when a lesson
// needs them.
export const RETIRED = [
  {
    id: "a2-021-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Jaan"],
    scene: "Sofia veedab vaba päeva linnas: ta seisab Jaani kohviku ees ja vaatab kaarti, millel on raamatukogu, park ja kino lihtsate piltmärkidena.",
    accent: "the city map",
    text: [],
    learningJob: "name city places and choose what to do in each place",
    alt: "Sofia valib linnakaardilt kohti, kuhu vabal päeval minna.",
    caption: "Pilt 1. Vaba päev linnas.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus Sofia seisab?", "Mis kohad on kaardil?", "Kuhu sina oma linnas vabal päeval lähed?"],
  },
  {
    id: "a2-022-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Viktor"],
    scene: "Jaama juures selgitab Viktor Annale uut marsruuti raamatukokku; üks tee on tõkkega suletud ja Viktor osutab kaardil teisele teele.",
    accent: "Anna’s top",
    text: [],
    learningJob: "give step-by-step directions when the usual route is closed",
    alt: "Viktor näitab Annale jaamast raamatukokku uut teed.",
    caption: "Pilt 1. Muutunud marsruut linnas.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus Viktor ja Anna on?", "Miks nad ei saa otse minna?", "Kuidas sinu kodust jaama saab?"],
  },
  {
    id: "a2-023-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Markus", "Liis"],
    scene: "Markus seisab piletiautomaadi ees ja Liis näitab käega kasutamise järjekorda; automaadil on ainult lihtsad pildimärgid, mitte sõnad.",
    accent: "the ticket machine screen",
    text: [],
    learningJob: "sequence commands for using a ticket machine and add one prohibition",
    alt: "Liis juhendab Markust piletiautomaati kasutama.",
    caption: "Pilt 1. Piletiautomaadi kasutamise juhis.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Markus teeb?", "Mida Liis näitab?", "Mida peab automaadi juures kõigepealt tegema?"],
  },
  {
    id: "a2-024-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Viktor"],
    scene: "Teeninduskeskuse ukse juures uurivad Sofia ja Viktor lahtiolekuaja silti, kella ja korrusenooli; sildil on ainult kellasümbolid, mitte sõnad.",
    accent: "the opening-hours sign",
    text: [],
    learningJob: "infer whether the centre is open and locate the needed service",
    alt: "Sofia ja Viktor uurivad teeninduskeskuse lahtiolekuaega ja juhiseid.",
    caption: "Pilt 1. Teeninduskeskuse sildi lugemine.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida Sofia ja Viktor vaatavad?", "Mis kell on teeninduskeskus avatud?", "Mis kell sinu lähim pood avatud on?"],
  },
  {
    id: "a2-025-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Anna", "Markus"],
    scene: "Anna juhatab linnakaardiga Markust teeninduskeskusse; ta osutab ristmikule, Markus võrdleb suunda tänavasildiga.",
    accent: "Anna’s top",
    text: [],
    learningJob: "give clear city directions and check that the route is understood",
    alt: "Anna juhatab Markust kaardi järgi teeninduskeskusse.",
    caption: "Pilt 1. Linna ja tee kontrollülesanne.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kuhu Anna Markust juhatab?", "Mida Markus võrdleb?", "Kuidas jõuda sinu kodust lähima bussipeatuseni?"],
  },
];
