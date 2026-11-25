// Visual briefs of a2b1 module 11; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (051 a shop's price tags for buying a
// present within 60 euros, 052 two washing machines compared for advice to a friend, 053 an order and the parcel that
// came for the complaint to an e-shop, 054 a repair sheet for the call to the workshop manager). They are line drawings
// the content agent made from hand-written SVG (not generated) as working pictures in the palette of
// TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent, pale-lime blob, grey); Codex may redraw them from the
// same briefs. No people of the continuing story. Each picture stands directly above the task that uses it (`place` =
// that task's id), so the picture and its task share a page. Module 11 had no pictures before.
export default [
  {
    id: "a2b1-051-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Laimirohelise päisega „KODUPOOD · NÄDALA HINNAD” heleroheline laigu peal. Neli hinnasilti kahes reas, igaühel ikoon: sall „Sall” „30 €” (läbi kriipsutatud) „24 €” „−20 %” „värvid: hall, roheline”; kõrvaklapid „Kõrvaklapid” „40 €” (läbi kriipsutatud) „20 €” „poole hinnaga” „garantii 1 aasta”; kruus „Termokruus” „15 €” „2 tk = 25 €” „värvid: must, valge”; raamat „Raamat „Eesti köök”” „28 €” (läbi kriipsutatud) „25,20 €” „−10 %” „kingipakk tasuta”. All kast „Kliendikaardiga veel −5 % · kaart tasuta, vaja on telefoninumbrit” ja „Tagastamine 30 päeva jooksul ainult tšekiga”.",
    accent: "the shop header",
    text: ["KODUPOOD · NÄDALA HINNAD", "Sall", "30 €", "24 €", "−20 %", "värvid: hall, roheline", "Kõrvaklapid", "40 €", "20 €", "poole hinnaga", "garantii 1 aasta", "Termokruus", "15 €", "2 tk = 25 €", "värvid: must, valge", "Raamat „Eesti köök”", "28 €", "25,20 €", "−10 %", "kingipakk tasuta", "Kliendikaardiga veel −5 % · kaart tasuta, vaja on telefoninumbrit", "Tagastamine 30 päeva jooksul ainult tšekiga"],
    learningJob: "osta poes sõbrale kingitus 60 euro eest: küsida hinda, soodustust, värvi ja suurust (Kas seda on ka hallina?), arvutada, kui palju ost kokku teeb, ja reageerida müüja varjatud infole",
    place: "051_p_gap",
    alt: "Kodupoe nädala hinnad. Sall: 30 eurot, nüüd 24 eurot, 20 protsenti odavam, värvid hall ja roheline. Kõrvaklapid: 40 eurot, nüüd 20 eurot, poole hinnaga, garantii üks aasta. Termokruus 15 eurot, kaks tükki 25 eurot, värvid must ja valge. Raamat „Eesti köök”: 28 eurot, nüüd 25,20 eurot, 10 protsenti odavam, kingipakk tasuta. Kliendikaardiga veel 5 protsenti soodustust, kaart on tasuta, vaja on telefoninumbrit. Tagastamine 30 päeva jooksul ainult tšekiga.",
    caption: "Hinnasildid: Kodupood.",
    prompts: ["Mis on poole hinnaga?", "Mida saad osta 60 euro eest?", "Mida küsid müüjalt enne ostu?"],
  },
  {
    id: "a2b1-052-kasuta-2",
    phase: "transfer",
    format: "comparison",
    cast: [],
    scene: "Kaks kaarti kõrvuti heleroheline laigu peal: „LAINE” (laimiroheline päis) ja „VAHU”, igaühel pesumasina ikoon (Vahu oma suurem) ja seitse rida. LAINE: „hind: 380 €”, „pesu: 6 kg”, „laius: 40 cm”, „müra: valjem”, „elekter aastas: 60 €”, „garantii: 2 aastat”, „kohal: homme”. VAHU: „hind: 450 €”, „pesu: 8 kg”, „laius: 60 cm”, „müra: vaikne”, „elekter aastas: 40 €”, „garantii: 5 aastat”, „kohal: 2 nädala pärast”. All kast „Kohaletoomine tasuta · vana masina äravedu 15 €” ja „Kodutehnika e-pood”.",
    accent: "the header of the LAINE card",
    text: ["LAINE", "VAHU", "hind: 380 €", "pesu: 6 kg", "laius: 40 cm", "müra: valjem", "elekter aastas: 60 €", "garantii: 2 aastat", "kohal: homme", "hind: 450 €", "pesu: 8 kg", "laius: 60 cm", "müra: vaikne", "elekter aastas: 40 €", "garantii: 5 aastat", "kohal: 2 nädala pärast", "Kohaletoomine tasuta · vana masina äravedu 15 €", "Kodutehnika e-pood"],
    learningJob: "anda sõbrale nõu, kumba pesumasinat osta: võrrelda hinda, suurust, müra ja garantiid (Laine on Vahust 70 euro võrra odavam, Laine ei ole nii vaikne kui Vahu) ja põhjendada valikut",
    place: "052_t_advice",
    alt: "Kaks pesumasinat. Laine: 380 eurot, 6 kilo pesu, 40 sentimeetrit lai, valjem, elekter aastas 60 eurot, garantii 2 aastat, kohal homme. Vahu: 450 eurot, 8 kilo pesu, 60 sentimeetrit lai, vaikne, elekter aastas 40 eurot, garantii 5 aastat, kohal kahe nädala pärast. Kohaletoomine on tasuta, vana masina äravedu maksab 15 eurot.",
    caption: "Kaks pesumasinat.",
    prompts: ["Kumb on odavam ja kui palju võrra?", "Mille poolest on Vahu parem?", "Kumma sina sõbrale soovitad?"],
  },
  {
    id: "a2b1-053-kasuta-2",
    phase: "transfer",
    format: "comparison",
    cast: [],
    scene: "Kaks kaarti heleroheline laigu peal. Vasakul laimirohelise päisega „TELLIMUS nr 4127”: „Lastepood · 3. november”, „talvejope, roheline”, „suurus: 128”, „hind: 59 €”, „makstud kaardiga”, „kohal: 7. novembril”, all hall jope sildiga „128”. Paremal „PAKIS 7. novembril”: avatud karp, valge jope sildiga „110”, ristiga ring luku juures, „suurus 110, mitte 128”, „lukk on katki”. All kast „Tagastamine 14 päeva · vale toote saatmise eest maksab pood” ja „Vastame kirjadele 3 tööpäeva jooksul”.",
    accent: "the order header",
    text: ["TELLIMUS nr 4127", "Lastepood · 3. november", "talvejope, roheline", "suurus: 128", "hind: 59 €", "makstud kaardiga", "kohal: 7. novembril", "128", "PAKIS 7. novembril", "110", "suurus 110, mitte 128", "lukk on katki", "Tagastamine 14 päeva · vale toote saatmise eest maksab pood", "Vastame kirjadele 3 tööpäeva jooksul"],
    learningJob: "kirjutada e-poele 60–90-sõnaline kaebus ilma antud alguseta: mida ja millal tellis, mis on valesti ja mida soovib, kesksõnadega (tellitud jope, makstud raha, saadetud pakk)",
    place: "053_t_mail",
    alt: "Vasakul tellimus number 4127, Lastepood, 3. november: roheline talvejope suuruses 128, hind 59 eurot, makstud kaardiga, kohal 7. novembril. Paremal pakk, mis tuli 7. novembril: jope suuruses 110, mitte 128, ja lukk on katki. All: tagastamine 14 päeva, vale toote saatmise eest maksab pood, kirjadele vastatakse kolme tööpäeva jooksul.",
    caption: "Tellimus ja pakk.",
    prompts: ["Mida tellis klient ja mida ta sai?", "Kes maksab tagasisaatmise eest?", "Mida sina e-poelt soovid?"],
  },
  {
    id: "a2b1-054-kasuta-2",
    phase: "transfer",
    format: "diagram",
    cast: [],
    scene: "Remondileht heleroheline laigu peal, laimirohelise päisega „REMONDILEHT nr 2291 · töökoda Kiirabi”. Vasakul telefoni ikoon ja küsimärgiga veetilk. Paremal seitse rida: „Toode:” „telefon Nova 5, ostetud 12. märtsil”; „Garantii:” „2 aastat”; „1. remont, 2. okt:” „laadimispesa vahetatud, tasuta”; „2. pöördumine, 6. nov:” „telefon ei lae jälle”; „Töökoja otsus:” „niiskuskahjustus”; „Hind:” „89 € (ei ole garantii)”; „Pildid:” „ei ole lisatud”. All kast „Küsimused: tööpäeviti 9–17 · klienditeenindus ja juhataja”.",
    accent: "the repair sheet header",
    text: ["REMONDILEHT nr 2291 · töökoda Kiirabi", "?", "Toode:", "telefon Nova 5, ostetud 12. märtsil", "Garantii:", "2 aastat", "1. remont, 2. okt:", "laadimispesa vahetatud, tasuta", "2. pöördumine, 6. nov:", "telefon ei lae jälle", "Töökoja otsus:", "niiskuskahjustus", "Hind:", "89 € (ei ole garantii)", "Pildid:", "ei ole lisatud", "Küsimused: tööpäeviti 9–17 · klienditeenindus ja juhataja"],
    learningJob: "helistada töökoja juhatajale: rääkida faktidest remondilehe järgi, küsida tõendit (pildid, remondiakt) ja öelda selge soov viisaka, kuid kindla teie-käsuga (palun kontrollige uuesti, saatke pildid)",
    place: "054_t_call",
    alt: "Remondileht number 2291, töökoda Kiirabi. Toode: telefon Nova 5, ostetud 12. märtsil, garantii kaks aastat. Esimene remont 2. oktoobril: laadimispesa vahetati tasuta. Teine pöördumine 6. novembril: telefon ei lae jälle. Töökoja otsus: niiskuskahjustus, hind 89 eurot, garantii ei kehti. Pilte ei ole lisatud. Küsimused tööpäeviti 9–17.",
    caption: "Remondileht.",
    prompts: ["Millal telefon esimest korda parandati?", "Mida töökoda nüüd väidab?", "Mida sa töökojalt palud?"],
  },
];

// Module 11 had no pictures before the v5 rewrite.
export const RETIRED = [];
