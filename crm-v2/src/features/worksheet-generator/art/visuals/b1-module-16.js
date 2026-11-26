// Visual briefs of a2b1 module 16; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v6 rewrite (2026-11-26): one learning visual per teaching lesson, each directly above the main task that
// uses it (`place`) so the picture and its task share a page — 076 the radio question with the certainty scale for the
// street interview, 077 the data card of two work arrangements for the recommendation, 078 five town topics and the
// four-part argument for the opinion piece, 079 the courtyard plan with three proposals and their prices for the
// residents' meeting. Diagrams the content agent made from hand-written SVG (not generated) as working pictures in the
// palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent, pale-lime blob, grey); Codex may redraw them
// from the same briefs. No people of the continuing story; the earlier version of module 16 had no registered visuals.
export default [
  {
    id: 'a2b1-076-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „RAADIO „PERE JA KOOL” KÜSIB” heleroheline laigu peal. Vasakul laimiroheline mikrofon, paremal valge kaart küsimusega „Mis vanuses võiks laps saada oma nutitelefoni? Miks?”. All rida „Kui kindel sa oled?” ja neli kaarti noolega skaalal kindel → ei ole kindel: „Ma olen kindel, et …” (laimiroheline), „Ma arvan, et …”, „Mulle tundub, et …”, „Ma kahtlen, kas …”. Rida „Vali roll:” kolme kaardiga (lapsevanem, vanavanem, õpetaja) ja all riba „Arvamus + põhjus (sest …, kuna …) + näide (näiteks meie peres …) · Minu arvates on …”.',
    accent: 'the header, the microphone and the most certain opinion phrase',
    text: ['RAADIO „PERE JA KOOL” KÜSIB', 'Mis vanuses võiks laps saada oma nutitelefoni? Miks?', 'Kui kindel sa oled?', 'Ma olen kindel, et …', 'Ma arvan, et …', 'Mulle tundub, et …', 'Ma kahtlen, kas …', 'kindel', 'ei ole kindel', 'Vali roll:', 'lapsevanem', 'vanavanem', 'õpetaja', 'Arvamus + põhjus (sest …, kuna …) + näide (näiteks meie peres …)', 'Minu arvates on …'],
    learningJob: 'anda raadioreporterile intervjuu: öelda arvamus koos kindlusega (olen kindel, et / mulle tundub, et / kahtlen, kas), põhjendada (sest, kuna) ja tuua näide oma rollis',
    place: '076_t_interview',
    alt: 'Raadio „Pere ja kool” küsib: mis vanuses võiks laps saada oma nutitelefoni ja miks? Skaala kindlast ebakindlani: ma olen kindel, et; ma arvan, et; mulle tundub, et; ma kahtlen, kas. Rollid: lapsevanem, vanavanem, õpetaja. All meelespea: arvamus, põhjus sõnadega sest või kuna ja näide.',
    caption: 'Raadio küsib: mis sa arvad?',
    prompts: ['Milline roll sulle sobib?', 'Kui kindel sa oma arvamuses oled?', 'Millise näite sa tood?'],
  },
  {
    id: 'a2b1-077-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „UUS TÖÖKORD MÄRTSIST: A VÕI B?” heleroheline laigu peal. Tabel kolme veeruga: hall „Mis?”, laimiroheline „Variant A · kontor + kodu”, valge „Variant B · kodus”. Read: Kontoris — 3 päeva nädalas / 1 päev kuus; Sõit tööle — ≈ 6 tundi nädalas / ≈ 1 tund kuus; Koosolekud — silmast silma / videos; Laudu kontoris — 25 / 10; Kulu firmale — 4000 € kuus / 2500 € kuus; Töötajate küsitlus — 58 % poolt / 42 % poolt. All valge riba „Sinu soovitus juhile: variant … , sest …”.',
    accent: 'the header and the column of variant A',
    text: ['UUS TÖÖKORD MÄRTSIST: A VÕI B?', 'Mis?', 'Variant A', 'kontor + kodu', 'Variant B', 'kodus', 'Kontoris', '3 päeva nädalas', '1 päev kuus', 'Sõit tööle', '≈ 6 tundi nädalas', '≈ 1 tund kuus', 'Koosolekud', 'silmast silma', 'videos', 'Laudu kontoris', '25', '10', 'Kulu firmale', '4000 € kuus', '2500 € kuus', 'Töötajate küsitlus', '58 % poolt', '42 % poolt', 'Sinu soovitus juhile: variant … , sest …'],
    learningJob: 'kirjutada juhile 70–90-sõnaline soovitus: võrrelda kahte varianti vähemalt kolme rea järgi (keskvõrre + kui, kõige, sama … kui, võrreldes, erinevalt) ja soovitada üht põhjusega',
    place: '077_t_report',
    alt: 'Uus töökord märtsist, variant A või B. Variant A: kontoris 3 päeva nädalas, sõit tööle umbes 6 tundi nädalas, koosolekud silmast silma, kontoris 25 lauda, kulu firmale 4000 eurot kuus, küsitluses 58 protsenti poolt. Variant B: kodus, kontoris 1 päev kuus, sõit umbes 1 tund kuus, koosolekud videos, 10 lauda, 2500 eurot kuus, 42 protsenti poolt.',
    caption: 'Kaks varianti: kumba soovitad?',
    prompts: ['Mis on variandi A eelis võrreldes variandiga B?', 'Kumb on firmale odavam?', 'Kumba sina soovitad ja miks?'],
  },
  {
    id: 'a2b1-078-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „LINNAOSA LEHT · ELANIK ARVAB” heleroheline laigu peal. Kuus kaarti kahes reas: „30 km/h kesklinnas” (laimiroheline), „tasuta bussid”, „uued rattateed”, „autovaba pühapäev”, „park parkla asemel” ja hall „Vali üks teema ja kirjuta 80–100 sõna”. All neli noolega ühendatud kaarti: „1 ARVAMUS · Minu arvates …”, „2 PÕHJUS · sest … / kuna …”, „3 NÄIDE · Näiteks juhtus …”, „4 JÄRELDUS · Seepärast / Seega …”. Kõige all valge riba „Pealkiri: ……” ja „Inimesed, kes … · tänav, mis … · naaber, kelle …”.',
    accent: 'the header and the topic of the listening (30 km/h)',
    text: ['LINNAOSA LEHT · ELANIK ARVAB', '30 km/h kesklinnas', 'tasuta bussid', 'uued rattateed', 'autovaba pühapäev', 'park parkla asemel', 'Vali üks teema', 'ja kirjuta 80–100 sõna', '1 ARVAMUS', 'Minu arvates …', '2 PÕHJUS', 'sest … / kuna …', '3 NÄIDE', 'Näiteks juhtus …', '4 JÄRELDUS', 'Seepärast / Seega …', 'Pealkiri: ……', 'Inimesed, kes … · tänav, mis … · naaber, kelle …'],
    learningJob: 'valida linnateema ja kirjutada linnaosa lehele 80–100-sõnaline arvamuslugu neljas osas (arvamus, põhjus, näide, järeldus) seepärast / seega + tegusõna ja ühe kes- või mis-lausega',
    place: '078_t_opinion',
    alt: 'Linnaosa leht, rubriik Elanik arvab. Viis teemat: 30 kilomeetrit tunnis kesklinnas, tasuta bussid, uued rattateed, autovaba pühapäev, park parkla asemel; vali üks ja kirjuta 80–100 sõna. Neli osa: arvamus (minu arvates), põhjus (sest, kuna), näide (näiteks juhtus), järeldus (seepärast, seega). All pealkirja rida ja näited kes-, mis- ja kelle-lausest.',
    caption: 'Elanik arvab: sinu teema.',
    prompts: ['Millise teema sa valid?', 'Mis on sinu põhjus ja näide?', 'Kuidas su järeldus algab?'],
  },
  {
    id: 'a2b1-079-kasuta-1',
    phase: 'transfer',
    format: 'diagram',
    cast: [],
    scene: 'Laimirohelise päisega „PARGI 5 HOOV · 8000 €” heleroheline laigu peal. Vasakul hoovi plaan: üleval hall riba „MAJA”, all hall ruut „liivakast + vana kiik”, katkendjoonega ruudud „muru” ja „prügikastid · tühi koht”. Paremal viis kaarti hindadega: „A Uus mänguväljak 6000 €”, „B 4 parkimiskohta 7000 €”, laimiroheline „C Väiksem mänguväljak 4000 €”, „+ rattakuur 3500 €”, „+ pink 500 €”. All valge riba „Teie kompromiss: …… kokku …… €”, „Minu tingimus on, et …”, „Olen osaliselt nõus, aga … · Kas me võiksime …?”.',
    accent: 'the header and the compromise proposal C',
    text: ['PARGI 5 HOOV · 8000 €', 'MAJA', 'liivakast', '+ vana kiik', 'muru', 'prügikastid · tühi koht', 'A Uus mänguväljak', '6000 €', 'B 4 parkimiskohta', '7000 €', 'C Väiksem mänguväljak', '4000 €', '+ rattakuur', '3500 €', '+ pink', '500 €', 'Teie kompromiss: …… kokku …… €', 'Minu tingimus on, et …', 'Olen osaliselt nõus, aga … · Kas me võiksime …?'],
    learningJob: 'leppida elanike koosolekul kokku üks kompromiss, mis mahub 8000 euro sisse ja arvestab mõlema poole tingimust ning õpetaja varjatud infot, öeldes arvamuse viisakalt tingivas kõneviisis',
    place: '079_t_debate',
    alt: 'Pargi 5 hoov, raha 8000 eurot. Hoovi plaanil on maja, liivakast vana kiigega, muru ning prügikastid ja tühi koht. Ettepanekud: A uus mänguväljak 6000 eurot, B neli parkimiskohta 7000 eurot, C väiksem mänguväljak 4000 eurot, lisaks rattakuur 3500 eurot ja pink 500 eurot. All read teie kompromissile ja selle hinnale ning lausealgused minu tingimus on, et; olen osaliselt nõus, aga; kas me võiksime.',
    caption: 'Pargi 5 hoov: mis on teie kompromiss?',
    prompts: ['Mida tahab sinu pool ja miks?', 'Mis mahub 8000 euro sisse?', 'Mis on sinu tingimus?'],
  },
];
