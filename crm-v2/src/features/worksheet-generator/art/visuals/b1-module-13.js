// Visual briefs of a2b1 module 13; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (061 a moving-day plan for the talk with a
// neighbour at the door, 062 a booking confirmation next to what the room really is for the call to the reception, 063 a
// house chat where a rumour grows for the story „Kuidas kuulujutt sündis”, 064 the whiteboard notes of a staff meeting for
// the letter to the absent manager). They are line drawings the content agent made from hand-written SVG (not
// generated) as working pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent,
// pale-lime blob, grey); Codex may redraw them from the same briefs. No people of the continuing story; the v2 sample of
// module 13 had no registered visuals.
// Each picture stands directly above the task that uses it (`place` = that task's id), so the picture and its task
// share a page.
export default [
  {
    id: "a2b1-061-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Laimirohelise päisega „LAUPÄEV · KOLIMISPÄEV · korter 12” heleroheline laigu peal. Selle all valge riba laimirohelise hoiatuskolmnurgaga: „Lift on remondis! Kõik käib trepist (4. korrus).” All suur valge kaart kuue reaga, igas kellaaeg, joonistatud ikoon ja tekst: 9.00 auto — „auto maja ette — parkimiskohta ei ole”; 10.00 diivan — „diivan 4. korrusele: 2 inimest, umbes 30 min”; 12.00 kastid — „12 kasti autost trepist üles”; 14.00 kaks last — „lapsed (4 ja 7): keegi võiks 2 tundi vaadata”; 16.00 koer — „koer on vaja jalutama viia”; 18.00 laimiroheline pitsalõik — „pitsa kõigile, kes aitasid!” (paksus kirjas).",
    accent: "the header, the warning triangle and the pizza slice",
    text: ["LAUPÄEV · KOLIMISPÄEV · korter 12", "Lift on remondis! Kõik käib trepist (4. korrus).", "9.00", "10.00", "12.00", "14.00", "16.00", "18.00", "auto maja ette — parkimiskohta ei ole", "diivan 4. korrusele: 2 inimest, umbes 30 min", "12 kasti autost trepist üles", "lapsed (4 ja 7): keegi võiks 2 tundi vaadata", "koer on vaja jalutama viia", "pitsa kõigile, kes aitasid!"],
    learningJob: "paluda naabrilt konkreetselt abi (mida, millal, kui kaua), reageerida tema viisakale keeldumisele uue ettepanekuga ja pakkuda midagi vastu: palub mul aidata, olen nõus aitama, kahjuks ma ei saa, aga …",
    place: "061_t_agree",
    alt: "Laupäev, kolimispäev, korter 12. Lift on remondis, kõik käib trepist neljandale korrusele. Kell 9 auto maja ette, parkimiskohta ei ole. Kell 10 diivan neljandale korrusele, vaja kaks inimest umbes 30 minutiks. Kell 12 kaksteist kasti autost trepist üles. Kell 14 lapsed, 4- ja 7-aastane, keegi võiks kaks tundi vaadata. Kell 16 on vaja koer jalutama viia. Kell 18 pitsa kõigile, kes aitasid.",
    caption: "Kolimispäev.",
    prompts: ["Millega vajab kolija abi ja millal?", "Mis on kõige raskem töö ja miks?", "Millega sina saaksid aidata ja millega mitte?"],
  },
  {
    id: "a2b1-062-kasuta-2",
    phase: "transfer",
    format: "comparison",
    cast: [],
    scene: "Kaks kaarti kõrvuti heleroheline laigu peal. Vasakul suur valge leht laimirohelise päisega „BRONEERINGU KINNITUS”, all „Hotell Rannakivi · Pärnu” ja seitse rida: „Saabumine: reede, 14. juuli, kell 15”; „Ööd: 2”; „Tuba: pere tuba, 2 + 2 last”; „Rõdu: merevaatega”; „Hommikusöök: hinnas”; „Parkimine: tasuta”; „Hind kokku: 238 €” (paksus kirjas). Paremal kitsam valge kaart „TOAS TEGELIKULT”: ristid „2 voodit”, „aken parkla poole”, „rõdu ei ole”, linnukesed „hommikusöök”, „parkimine”, all väikselt „reede kell 21.30”.",
    accent: "the header of the booking confirmation",
    text: ["BRONEERINGU KINNITUS", "Hotell Rannakivi · Pärnu", "Saabumine:", "reede, 14. juuli, kell 15", "Ööd:", "2", "Tuba:", "pere tuba, 2 + 2 last", "Rõdu:", "merevaatega", "Hommikusöök:", "hinnas", "Parkimine:", "tasuta", "Hind kokku:", "238 €", "TOAS TEGELIKULT", "2 voodit", "aken parkla poole", "rõdu ei ole", "hommikusöök", "parkimine", "reede kell 21.30"],
    learningJob: "helistada vastuvõttu ja öelda selgelt, mis broneeringus oli ja mis toas tegelikult on, ning paluda lahendust tingiva kõneviisiga (Kas te saaksite …? Kas oleks võimalik …? Ma sooviksin …)",
    place: "062_t_call",
    alt: "Broneeringu kinnitus, hotell Rannakivi, Pärnu. Saabumine reedel, 14. juulil kell 15, kaks ööd, pere tuba kahele täiskasvanule ja kahele lapsele, rõdu merevaatega, hommikusöök hinnas, parkimine tasuta, hind kokku 238 eurot. Toas tegelikult reede kell 21.30: ainult kaks voodit, aken parkla poole, rõdu ei ole; hommikusöök ja parkimine on korras.",
    caption: "Broneeringu kinnitus.",
    prompts: ["Mis on broneeringus ja mis on toas tegelikult?", "Mis on kõige suurem probleem?", "Mida sa vastuvõtus viisakalt paluksid?"],
  },
  {
    id: "a2b1-063-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Suur telefoni ekraan heleroheline laigu peal, laimirohelise päisega „Lille 5 · maja vestlus”. Kuus sõnumimulli vaheldumisi vasakul ja paremal, igaühel korteri number ja kellaaeg: „Korter 8 · 19.02 — Hoovis on suur auto ja kastid.” (kõrval joonistatud kaubik ja kastid); „Korter 6 · 19.05 — Kas keegi teab, mis toimub?”; „Korter 11 · 19.10 — Kuulsin, et 3. korteri proua olevat ära kolinud.”; „Korter 6 · 19.14 — Ta olevat korteri maha müünud!”; „Korter 9 · 19.20 — Uus omanik tegevat sinna hostelit.”; viimane laimiroheline mull „Korter 3 · 21.30 — Ma ei koli kuhugi! Poeg toob mulle uue diivani ja viib vana ära.”",
    accent: "the chat header and the last message (what really happened)",
    text: ["Lille 5 · maja vestlus", "Korter 8", "19.02", "Hoovis on suur auto ja kastid.", "Korter 6", "19.05", "Kas keegi teab, mis toimub?", "Korter 11", "19.10", "Kuulsin, et 3. korteri proua olevat ära kolinud.", "19.14", "Ta olevat korteri maha müünud!", "Korter 9", "19.20", "Uus omanik tegevat sinna hostelit.", "Korter 3", "21.30", "Ma ei koli kuhugi! Poeg toob mulle uue diivani ja viib vana ära."],
    learningJob: "kirjutada lugu „Kuidas kuulujutt sündis”: anda kuuldut edasi kaudse kõneviisiga (olevat kolinud, olevat müünud, tegevat), näidata, kuidas jutt levis, ja öelda kindla kõneviisiga, mis oli tegelikult",
    place: "063_t_tale",
    alt: "Lille 5 maja vestlus telefonis. Kell 19.02 korter 8: hoovis on suur auto ja kastid. Kell 19.05 korter 6: kas keegi teab, mis toimub? Kell 19.10 korter 11: kuulsin, et 3. korteri proua olevat ära kolinud. Kell 19.14 korter 6: ta olevat korteri maha müünud. Kell 19.20 korter 9: uus omanik tegevat sinna hostelit. Kell 21.30 korter 3: ma ei koli kuhugi, poeg toob mulle uue diivani ja viib vana ära.",
    caption: "Maja vestlus.",
    prompts: ["Mida vestluses räägiti?", "Kuidas jutt sõnumist sõnumisse muutus?", "Mis oli tegelikult ja mida oleks võinud teisiti teha?"],
  },
  {
    id: "a2b1-064-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Valge tahvel heleroheline laigu peal. Üleval suurelt „KOOSOLEK 28.04 · Müra kontoris”, joon, all „Juhataja on puhkusel — Eva kirjutab kokkuvõtte.” Vasakul pealkiri „ARVAMUSED” ja neli rida: „Kerli: ei saa keskenduda, 2 viga aruandes”; „Rasmus: 30 kõnet päevas, ei saa iga kord välja minna”; „Toomas: kõigile kõrvaklapid? ~100 € tk”; „Kerli: kõrvaklappidega valutab pea”. All laimiroheline kast „KOKKULEPE” nelja linnukesega: „kell 9–12 vaikne aeg · kõned koosolekuruumist”; „pärastlõunal: Kerli istub väikeses toas akna juures”; „proovime 2 nädalat → uus koosolek 12.05”; „küsida juhatajalt: 2 paari kõrvaklappe?”.",
    accent: "the agreement box",
    text: ["KOOSOLEK 28.04 · Müra kontoris", "Juhataja on puhkusel — Eva kirjutab kokkuvõtte.", "ARVAMUSED", "Kerli:", "ei saa keskenduda, 2 viga aruandes", "Rasmus:", "30 kõnet päevas, ei saa iga kord välja minna", "Toomas:", "kõigile kõrvaklapid? ~100 € tk", "kõrvaklappidega valutab pea", "KOKKULEPE", "kell 9–12 vaikne aeg · kõned koosolekuruumist", "pärastlõunal: Kerli istub väikeses toas akna juures", "proovime 2 nädalat → uus koosolek 12.05", "küsida juhatajalt: 2 paari kõrvaklappe?"],
    learningJob: "kirjutada juhatajale kiri koosoleku kohta: probleem, kes mida arvas (Kerli sõnul, Rasmuse arvates, Toomas pakkus, et), milles kokku lepiti ja kui kauaks, ning üks palve tingiva kõneviisiga",
    place: "064_t_mail",
    alt: "Koosolek 28. aprillil, müra kontoris. Juhataja on puhkusel, Eva kirjutab kokkuvõtte. Arvamused: Kerli ei saa keskenduda, tegi aruandes kaks viga; Rasmus helistab 30 korda päevas ega saa iga kord välja minna; Toomas pakub kõigile kõrvaklappe, umbes 100 eurot tükk; Kerlil valutab kõrvaklappidega pea. Kokkulepe: kell 9–12 vaikne aeg ja kõned koosolekuruumist; pärastlõunal istub Kerli väikeses toas akna juures; proovitakse kaks nädalat, uus koosolek 12. mail; juhatajalt küsitakse kaks paari kõrvaklappe.",
    caption: "Koosoleku märkmed.",
    prompts: ["Mis oli probleem ja kes mida arvas?", "Milles lepiti kokku ja kui kauaks?", "Mida tuleb juhatajalt paluda?"],
  },
];
