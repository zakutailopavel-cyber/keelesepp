// Visual briefs of a2b1 module 15; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v6 rewrite (2026-11-26): one learning visual per teaching lesson, each directly above the main task that
// uses it (`place`) so the picture and its task share a page — 071 a course ad for the phone call, 072 the new
// neighbour's four questions for the mediation message, 073 an idea card for plan A and plan B, 074 the action-plan
// template. Line drawings the content agent made from hand-written SVG (not generated) as working pictures in the palette
// of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent, pale-lime blob, grey); Codex may redraw them from the
// same briefs. No people of the continuing story; the earlier version of module 15 had no registered visuals.
export default [
  {
    id: 'a2b1-071-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „UUS AASTA – UUED KURSUSED” heleroheline laigu peal. Kolm valget kaarti: „Eesti keel B1 · õhturühm” (kell: T ja N kell 18.00; kalender: algus 13. jaanuar; laimiroheline ring 150 €), „Eesti keel B1 · laupäevarühm” (L kell 10.00–12.30; algus 7. veebruar; hall ring 160 €), „Keraamika · algajatele” (K kell 18.00; algus 15. jaanuar; hall ring 120 €). All valge riba: „Registreeru 20. detsembriks: soodustus –10 %”, telefoni ikoon „Helista: kursuste kantselei, E–R 9–17” ja „Kohti on vähe!”.',
    accent: 'the header and the price of the evening group the caller wants',
    text: ['UUS AASTA – UUED KURSUSED', 'Eesti keel B1', 'õhturühm', 'laupäevarühm', 'Keraamika', 'algajatele', 'T ja N kell 18.00', 'L kell 10.00–12.30', 'K kell 18.00', 'algus 13. jaanuar', 'algus 7. veebruar', 'algus 15. jaanuar', '150 €', '160 €', '120 €', 'Registreeru 20. detsembriks: soodustus –10 %', 'Helista: kursuste kantselei, E–R 9–17', 'Kohti on vähe!'],
    learningJob: 'helistada kuulutuse järgi kursusele: küsida alguse, päevade, hinna ja tähtaja kohta, öelda oma plaan tuleviku vormiga (kavatsen alustada, mulle sobib ainult õhturühm) ja leppida kokku teine võimalus, kui õhturühm on täis',
    place: '071_t_call',
    alt: 'Kuulutus „Uus aasta – uued kursused”: eesti keel B1 õhturühm teisipäeval ja neljapäeval kell 18, algus 13. jaanuar, 150 eurot; eesti keel B1 laupäevarühm kell 10–12.30, algus 7. veebruar, 160 eurot; keraamika algajatele kolmapäeval kell 18, algus 15. jaanuar, 120 eurot. Registreeru 20. detsembriks, soodustus 10 protsenti. Helista kursuste kantseleisse esmaspäevast reedeni 9–17. Kohti on vähe.',
    caption: 'Uus aasta – uued kursused.',
    prompts: ['Milline kursus sulle sobib ja miks?', 'Mida pead helistades küsima?', 'Mis ajaks tuleb registreeruda?'],
  },
  {
    id: 'a2b1-072-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „UUS NAABER KÜSIB” heleroheline laigu peal. Neli valget mullikest laimiroheliste numbritega: 1 „Kuidas peenart saada? Mis ajaks?”, 2 „Mida ma pean ise tegema? Iga päev?”, 3 „Kas koer ja lapsed võivad aeda tulla?”, 4 „Mida aias teha ei tohi?”. All lihtne laimirohelises särgis inimene (uus naaber), tema kõrval paber „AIA KORD” ridadega „hoolitsegu …?”, „pangu …?”, „ärgu segagu …?” ja „??”, paremal valge kast „Sinu vastus Igorile:” ridadega „Sa pead …”, „Sa võid …”, „Sa ei tohi …”, „Sa ei pea …”.',
    accent: 'the header, the numbers of the questions and the neighbour who did not understand',
    text: ['UUS NAABER KÜSIB', 'Kuidas peenart saada?', 'Mis ajaks?', 'Mida ma pean ise tegema?', 'Iga päev?', 'Kas koer ja lapsed võivad aeda tulla?', 'Mida aias teha ei tohi?', 'AIA KORD', 'hoolitsegu …?', 'pangu …?', 'ärgu segagu …?', 'Sinu vastus Igorile:', 'Sa pead …', 'Sa võid …', 'Sa ei tohi …', 'Sa ei pea …'],
    learningJob: 'kirjutada naabrile 60–80-sõnaline sõnum, mis vastab neljale küsimusele ja ütleb mööneva kõneviisi reeglid lihtsalt (peab, võib, ei tohi, ei pea, las + olevik) — vahendus',
    place: '072_t_med',
    alt: 'Uus naaber küsib neli asja: kuidas peenart saada ja mis ajaks; mida ta peab ise tegema, kas iga päev; kas koer ja lapsed võivad aeda tulla; mida aias teha ei tohi. Tema käes on aia kord, kus on arusaamatud sõnad hoolitsegu, pangu ja ärgu segagu. Kõrval on kast vastuseks Igorile: sa pead, sa võid, sa ei tohi, sa ei pea.',
    caption: 'Uus naaber küsib.',
    prompts: ['Millele naaber vastust ootab?', 'Kuidas ütled „hoolitsegu” lihtsalt?', 'Mida aias teha ei tohi?'],
  },
  {
    id: 'a2b1-073-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „NAABRITE LAUPÄEV · 12 inimest · 200 €” heleroheline laigu peal. Kuus valget kaarti ikooni ja allkirjaga: puud ja laudtee („matk rabas · buss 1 tund”), tekk ja puu („piknik pargis · linnas”), purjekas lainetel („paadisõit järvel · 150 €”), sammastega maja („muuseumipäev · tasuta”), grill ja maja („grillipidu · maja hoovis”), jalgratas, päike ja lained („rattasõit · mere äärde”). All valge riba: „Plaan A: ……”, „Kui ……, siis”, „Plaan B: ……”, „Kas sobib kõigile 12 naabrile?”.',
    accent: 'the header with the two conditions (12 people, 200 euros)',
    text: ['NAABRITE LAUPÄEV · 12 inimest · 200 €', 'matk rabas', 'buss 1 tund', 'piknik pargis', 'linnas', 'paadisõit järvel', '150 €', 'muuseumipäev', 'tasuta', 'grillipidu', 'maja hoovis', 'rattasõit', 'mere äärde', 'Plaan A: ……', 'Kui ……, siis', 'Plaan B: ……', 'Kas sobib kõigile 12 naabrile?'],
    learningJob: 'leppida paarilisega kokku naabrite laupäeva plaan A ja plaan B ning tingimus kui-lausega (Kui sajab, läheme muuseumi), arvestades eelarvet, 12 inimest ja õpetaja varjatud infot',
    place: '073_t_decide',
    alt: 'Ideekaart „Naabrite laupäev, 12 inimest, 200 eurot” kuue võimalusega: matk rabas (buss üks tund), piknik linna pargis, paadisõit järvel (150 eurot), muuseumipäev (tasuta), grillipidu maja hoovis, rattasõit mere äärde. All read: plaan A, kui …, siis, plaan B ja küsimus, kas see sobib kõigile 12 naabrile.',
    caption: 'Naabrite laupäev: plaan A ja plaan B.',
    prompts: ['Mis on teie plaan A ja miks?', 'Mis tingimusel valite plaani B?', 'Kas plaan sobib kõigile naabritele?'],
  },
  {
    id: 'a2b1-074-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „MINU TEGEVUSPLAAN” heleroheline laigu peal. Viis valget kaarti ikooni ja abireaga: märklaud laimirohelise keskpunktiga („EESMÄRK · mis ja mis ajaks?”), süda („MIKS? · selleks, et …”), trepp („SAMMUD · alates … · hiljemalt … · igal …”), vihmavari („PLAAN B · kui …, siis …”), kaks inimest („TOETAJA · kes aitab?”); iga kaardi all tühi rida. All valge riba „Ajajoon”: jaan, veebr, märts, apr, mai, juuni (esimene punkt laimiroheline) ja rida „1. samm: ……… hiljemalt ………”.',
    accent: 'the header and the centre of the target (the goal) with the first month',
    text: ['MINU TEGEVUSPLAAN', 'EESMÄRK', 'mis ja mis ajaks?', 'MIKS?', 'selleks, et …', 'SAMMUD', 'alates …', 'hiljemalt …', 'igal …', 'PLAAN B', 'kui …, siis …', 'TOETAJA', 'kes aitab?', 'Ajajoon', 'jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', '1. samm: ……… hiljemalt ………'],
    learningJob: 'kirjutada malli järgi oma tegevusplaan 80–100 sõnaga: viis osa, ajaväljendid õiges vormis (alates jaanuarist, kuni juunini, hiljemalt märtsiks, igal teisipäeval) ja plaan B kui-lausega',
    place: '074_t_plan',
    alt: 'Tegevusplaani mall viie osaga: eesmärk (mis ja mis ajaks), miks (selleks, et …), sammud (alates …, hiljemalt …, igal …), plaan B (kui …, siis …) ja toetaja (kes aitab). All ajajoon jaanuarist juunini ja rida esimesele sammule ja selle tähtajale.',
    caption: 'Minu tegevusplaan.',
    prompts: ['Mis on sinu eesmärk ja mis ajaks?', 'Millised on su esimesed sammud?', 'Mida teed, kui plaan ei õnnestu?'],
  },
];
