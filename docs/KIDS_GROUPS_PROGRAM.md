# KeeleSepp lastele: pühapäevased grupid 5–6, 6–7 ja 8–9 a

Owner 2026-10-28: three Sunday groups (up to 5 children) with a full lesson plan, colouring pages, tracing and home tasks.
Source of truth in code: `crm-v2/src/features/worksheet-generator/admin/course/kids/program56.js`, `program67.js`, `program89.js` (content), `kids/sheets.js` (three sheets a lesson), `crm-v2/src/features/curriculum/kidsCurriculum.js` (Õppevara records and the teacher's plan minute by minute). Campaigns: `features/campaigns/kidsCampaigns.js`.
Sheets per lesson: 1 „Tunnis: uued sõnad” (chant, words with pictures), 2 „Tunnis: harjutame” (colouring by numbers, tracing, counting / letter hunt), 3 „Kodus vanemaga” (parents' note in Russian, colouring, tracing). For 8–9: 1 „Loeme”, 2 „Harjutame keelt”, 3 „Kirjutame ja räägime”.
Blocks used: `coloring`, `tracing`, `counting`, `letterhunt`, `readcard` (engine/blocks/kids.jsx); pictures `public/kids-art/*.svg` (`node scripts/kids-art.mjs`).

## Eelkool pühapäeviti (5–6-aastased) — 45 min, Eelkool 5–6 a

Goal: Laps saab aru lihtsatest korraldustest, ütleb enda kohta lihtsa lause, teab umbes 120 sõna, loeb kümneni ja tunneb tähti.

| # | Teema | Laps oskab | Sõnad |
|---|---|---|---|
| 1 | Tere! Mina olen … | Laps tervitab, ütleb oma nime ja jätab hüvasti. | tere, head aega, mina, poiss, tüdruk, ema, isa |
| 2 | Värvid | Laps nimetab kuus värvi ja leiab õige värvi pildilt. | punane, sinine, kollane, roheline, must, valge, õun, pall, banaan, päike, puu |
| 3 | Numbrid 1–10 | Laps loeb kümneni ja ütleb, mitu asja on pildil. | üks, kaks, kolm, neli, viis, kuus, seitse, kaheksa, üheksa, kümme |
| 4 | Minu pere | Laps nimetab pereliikmeid ja ütleb: „See on minu ema.” | ema, isa, vend, õde, vanaema, vanaisa, beebi |
| 5 | Mänguasjad | Laps nimetab mänguasju ja ütleb, mis talle meeldib. | pall, nukk, kaisukaru, auto, klotsid, rong, õhupall |
| 6 | Loomad | Laps nimetab koduloomi ja metsloomi ning ütleb, mis häält nad teevad. | koer, kass, kala, lind, jänes, karu, hiir, siga, kana |
| 7 | Toit | Laps nimetab toite ja ütleb, mis talle maitseb. | õun, banaan, pirn, leib, piim, juust, porgand, maasikas, muna, küpsis |
| 8 | Riided ja ilm | Laps nimetab riideid ja ütleb, mis ilm on. | müts, kindad, saapad, jope, püksid, kleit, sokid, vihm, päike, lumi |
| 9 | Minu keha | Laps nimetab kehaosi ja täidab korraldusi („Puuduta nina!”). | pea, silmad, nina, suu, kõrvad, käed, jalad, kõht, hambahari |
| 10 | Tähed ja häälikud: A, E, I, O, U | Laps tunneb täishäälikuid, leiab need sõna algusest ja kirjutab järele. | auto, ema, isa, õun, uks, orav, ilus |
| 11 | Tähed ja häälikud: Õ, Ä, Ö, Ü ja M, L, S | Laps tunneb eesti tähti Õ, Ä, Ö, Ü, loeb esimesi silpe (MA, LA, SA) ja kirjutab järele. | õun, jänes, öö, üks, maja, lill, sokk |
| 12 | Pidu: näitame, mida oskame | Laps esineb vanematele: tervitab, ütleb luuletuse ja nimetab sõnu piltide järgi. | tere, pere, loomad, toit, mänguasjad, värvid, täht, süda |

## Kooliks valmis pühapäeviti (6–7-aastased) — 60 min, Kooliks valmis 6–7 a

Goal: Laps loeb silpe ja lühikesi sõnu, kirjutab oma nime ja trükitähti, saab aru vähemalt 20 klassi korraldusest ja vastab tervete lausetega.

| # | Teema | Laps oskab | Sõnad |
|---|---|---|---|
| 1 | Kool ja klass | Laps nimetab klassi asju ja täidab korraldusi: istu, tõuse, kuula, vaata, kirjuta. | kool, õpetaja, laud, tool, pliiats, vihik, raamat, käärid, seljakott |
| 2 | Minu päev | Laps räägib oma päevast: hommikul ärkan, päeval mängin, õhtul magan. | hommik, päev, õhtu, öö, ärkan, söön, mängin, magan, pesen |
| 3 | Häälikud ja tähed: A, E, I, O, U | Laps eristab täishäälikuid, kuuleb neid sõna alguses ja kirjutab trükitähti. | auto, ema, isa, onu, uks, orav, ilus |
| 4 | M, L, S, T ja esimesed silbid | Laps loeb silpe MA, LA, SA, TA ja lühikesi sõnu: ema, isa, sai, maja, lill. | maja, lill, sai, sokk, tool, tasku |
| 5 | K, P, N, R ja sõnad | Laps loeb ja kirjutab kahesilbilisi sõnu: kala, pall, nukk, rong, karu. | kala, pall, nukk, rong, karu, kass, porgand |
| 6 | Eesti tähed Õ, Ä, Ö, Ü | Laps hääldab ja kirjutab õigesti Õ, Ä, Ö, Ü ning loeb sõnu õun, jänes, öö, üks. | õun, jänes, öö, üks, käärid, müts, sõber |
| 7 | Numbrid 1–20, pluss ja miinus | Laps loeb kahekümneni, ütleb „rohkem” ja „vähem” ning lahendab lihtsa ülesande. | üksteist, kaksteist, viisteist, kakskümmend, pluss, miinus, rohkem, vähem |
| 8 | Nädalapäevad: täna, homme, eile | Laps nimetab nädalapäevi ja ütleb, mis päev on täna. | esmaspäev, teisipäev, kolmapäev, neljapäev, reede, laupäev, pühapäev, täna, homme, eile |
| 9 | Aastaajad ja ilm | Laps nimetab aastaaegu ja kirjeldab ilma: talvel sajab lund, suvel on soe. | talv, kevad, suvi, sügis, lumi, vihm, soe, külm |
| 10 | Muinasjutt: Jänes ja porgand | Laps kuulab lühikest muinasjuttu, paneb pildid õigesse järjekorda ja jutustab lihtsate lausetega. | jänes, porgand, aed, karu, hiir, tõmbab, suur, väike |
| 11 | Pildi kirjeldamine | Laps kirjeldab pilti: pildil on maja, puu ja päike; maja on punane. | pildil on, maja, puu, päike, lill, koer, suur, väike |
| 12 | Minu esimene raamat | Laps teeb oma väikese raamatu (pilt + lause igal lehel) ja loeb selle vanematele ette. | raamat, pilt, lause, mina, minu pere, mulle meeldib |

## Eesti keel 2.–3. klassile pühapäeviti (8–9-aastased) — 60 min, 2.–3. klass 8–9 a

Goal: Laps loeb umbes 150-sõnalist teksti ja vastab küsimustele, kirjutab 5–7-lauselise jutu, kasutab küsisõnu ja lihtminevikku ning räägib minuti oma teemal.

| # | Teema | Laps oskab | Sõnad |
|---|---|---|---|
| 1 | Minu kool | Laps räägib oma koolist, klassist ja lemmikainest. | klass, õpetaja, klassivend, klassiõde, tund, vahetund, lemmikaine, matemaatika, kehaline kasvatus, söökla |
| 2 | Sõbrad ja mängud | Laps kirjeldab sõpra ja räägib, mida nad koos mängivad. | sõber, sõbrad, mängima, peitust, palli, lauamäng, õues, koos, naljakas, abivalmis |
| 3 | Minu hobid | Laps räägib oma hobidest: mulle meeldib …, ma käin … trennis. | hobi, trenn, ujuma, joonistama, tantsima, laulma, lugema, jalgpall, malet, harjutama |
| 4 | Linn ja tee kooli | Laps kirjeldab teed kooli ja küsib teed: kus? kuhu? kust? | tänav, ristmik, foor, buss, pood, park, otse, paremale, vasakule, lähedal |
| 5 | Loodus ja loomad | Laps kirjeldab metsaloomi: kus nad elavad ja mida nad söövad. | mets, orav, rebane, siil, põder, karu, pesa, urg, talveuni, pähklid |
| 6 | Jõulud ja talvepühad | Laps räägib, kuidas tema pere jõule tähistab, ja kirjutab lühikese jõulukaardi. | jõulud, kuusk, kingitus, jõuluvana, piparkook, küünal, ehtima, laulma, jõululaupäev, häid jõule |
| 7 | Raamatud ja lood | Laps jutustab loetud loo ümber: algus, keskpaik, lõpp. | raamat, muinasjutt, tegelane, algus, lõpp, kõigepealt, siis, lõpuks, raamatukogu, lugema |
| 8 | Söök ja tervis | Laps räägib tervislikust toidust ja oma päevamenüüst. | hommikusöök, lõuna, õhtusöök, puder, köögiviljad, puuviljad, tervislik, magus, vesi, trenn |
| 9 | Ilm ja aastaajad | Laps kirjeldab ilma ja räägib, mida ta eri aastaaegadel teeb. | ilm, temperatuur, kraadi, sajab, paistab, tuul, pilvine, libe, lumememm, kelgutama |
| 10 | Minu pere ja kodu | Laps kirjeldab oma peret ja kodu: mitu tuba, kus mis asub. | korter, maja, tuba, köök, elutuba, magamistuba, vannituba, rõdu, naabrid, kodu |
| 11 | Projekt: minu lemmikloom või hobi | Laps koostab plakati ja valmistab ette 1-minutilise esitluse. | projekt, plakat, esitlus, pilt, pealkiri, fakt, sest, aga, huvitav, tutvustama |
| 12 | Esitlus vanematele | Laps esitleb oma projekti vanematele, vastab küsimustele ja hindab oma edusamme. | esitlus, küsimus, vastus, publik, aplaus, tubli, õppisin, oskan, tänan, tunnistus |

## Production

- `curriculumLessons/k56-001…012, k67-001…012, k89-001…012` and their three sheets (published) — installed 2026-10-28 with create-only records.
