# Mis süsteemist puudu on — kursuse tootmise käigus

Kursuse tootmise ajal (`docs/B1_B2_COURSE_PRODUCTION.md`) kirjutatakse siia, mida KeeleSepa süsteem vajaks, et B1 ja B2 kursus oleks parem. Iga kirje juures on mõju ja ettepanek. Märge ✓ tähendab, et puudujääk on lahendatud (koos PR-iga).

## Sisu ja didaktika

1. **Avasta 006–050 on ühe malli järgi.** Kõigil 45 lehel on sama jada: tekst → sõnavara → lugemine → valik → märka → lüngad → rääkimine → enesehinnang. Õpilase jaoks muutub see igavaks.
   - Ettepanek: kui Harjuta ja Kasuta on valmis, kirjutada Avasta lehed moodul haaval ümber sama kvaliteediväravaga (vaheldus, normid).
   - Omaniku luba on vaja, sest need lehed on avaldatud.
2. **Tase on lehel vale.** Avasta 006–050 kannavad `Tase: B1`, kuigi õppekava `levelStage` on A2 / A2+. Seetõttu kontrollib didaktiline kontroll neid liiga kõrgete normidega ja õpilane näeb vale taset.
   - Ettepanek: Avasta ümbertegemisel `meta.level = levelStage`.
3. ✓ (agent/b2-profiles) **Taseme profiilid puuduvad.** `levels.js`-is pole profiile B1+ ja B1+/B2-; `levelKey('B1+/B2-')` annab B2.
   - Mõju: B2 kursuse algus (B1+) saaks liiga ranged B2 normid.
   - Ettepanek: lisada profiil B1+ (lause ~14/24, tekst 250–500, kiri 120–200 sõna) enne B2 tootmist.
4. **Kuulamisel pole heli.** Kuulamisülesanded saavad praegu ainult õpetaja ettelugemise; konstruktor hoiatab.
   - Ettepanek: tasuta TTS kooli Macis (nt Piper eesti hääl või EKI Neurokõne, kui lubatud) → `listening.audio`.
5. **Sõnavara ringlus pole masinkontrollitav.** Mooduli põhisõnad ja nende naasmine järgmistes tundides on praegu ainult autori distsipliin.
   - Ettepanek: moodulifailis `CORE` loend ja kvaliteediväravas kontroll „≥ 60 % eelmise mooduli põhisõnadest esineb Harjuta lehtedel”.
6. **Pildid puuduvad.** Kursuse lehtedel pole pilte; omaniku tööraamatus on head stseenipildid (pood, arst, buss, kohvik, pere, ilm, 6-stseeni lehed).
   - Ettepanek: tööraamatu pildid `public/textbook-art/`-i koos lähteülesandega (`art/visuals`) ning `image` / `pictures` / `speaking.img` plokkidesse. Selleks on vaja omaniku nõusolekut pildifailide kasutamiseks.

## Konstruktor ja ülesandetüübid

7. **Ristsõnal pole ruudustikku.** Plokk „Ristsõna” näitab ainult vihjeid ja ridu, mitte päris ristsõna.
   - Ettepanek: automaatne ruudustik vastustest.
8. **Rollikaardid on hindamata.** Need jäävad ainult õpetaja hinnata ja õpilase vastus ei salvestu.
   - Ettepanek: lühike kirjalik „mida ma ütlesin” väli või häälsalvestus nagu plokis `speaking`.
9. **Avalikku eelvaadet pole.** Kursuse tootmise eelvaade on ainult adminile.
   - Ettepanek: õpetaja saaks enne avaldamist lehte kommenteerida.
