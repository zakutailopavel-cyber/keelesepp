# B1 ja B2 kursuse tootmine

Omaniku ülesanne (2026-10-10): töölehtede konstruktoriga tuleb lõpetada B1 ja B2 kursus. Kursus peab olema didaktiliselt õige ja viima tulemuseni. Areng on järkjärguline, aga mitte igav ega ühetaoline. Samal ajal pannakse kirja, mis süsteemist puudu on (`docs/COURSE_SYSTEM_GAPS.md`).

## 1. Seis 2026-10-10

Lugemine production-andmebaasist; midagi ei muudetud.

| Kursus | Tunnid | Avasta | Harjuta | Kasuta |
| --- | --- | --- | --- | --- |
| B1 (`est-a2-b1-roadmap-v1`, `a2b1-001…090`) | 90 / 18 moodulit | 001–050 avaldatud | 001–005 | 001–005 |
| B2 (`est-b1-b2-roadmap-v1`, `b1b2-001…090`) | 90 / 18 moodulit | – | – | – |

Puudu on umbes 480 lehte:

- B1: Avasta 051–090, Harjuta ja Kasuta 006–090;
- B2: kõik kolm etappi 001–090.

## 2. Allikad

- Õppekava: `data/keelesepp-a2-b1-roadmap*.json` ja `data/keelesepp-b1-b2-roadmap*.json`. Igal tunnil on `levelStage`, `focus`, `practice` ja `success`. Need on normatiivsed: lehe eesmärk = `success`.
- Normid: `docs/CEFR_A2_B1_LEARNING_STANDARD.md`, `docs/DIDACTIC_ENGINE.md` (`didactics/levels.js`) ja EKI tasemesõnavara.
- Omaniku tööraamat „KeeleSepp A2 → B1, 52 tundi” (PDF, 216 lk, 10 moodulit + proovieksam) on materjalipank. Tekstid, olukorrad, harjutuste ideed ja pildistseenid võetakse sealt. ID-d ja tunnide järjekord jäävad õppekava omaks; 90 tunni struktuuri ei muudeta. Vastavus:

| Tööraamat | B1 õppekava |
| --- | --- |
| M01 Minu igapäevaelu (1–5) | M01 (001–005), M05 lihtminevik (021–025) |
| M02 Kodu ja liikumine (6–10) | M03 kodu ja linn (011–015) |
| M03 Inimesed ja vaba aeg (11–15) | M02 pere ja suhted (006–010), M04 kokkulepe (019) |
| M04 Töö ja õppimine (16–20) | M08 õppimine (036–040), M09 töö (041–045) |
| M05 Teenindus ja probleemid (21–25) | M06 toit ja teenindus (026–030), M11 raha ja ostlemine (051–055), M13 suhtlemine (061–065) |
| M06 Tervis ja eluviis (26–30) | M07 tervis (031–035), M13 tingiv kõneviis |
| M07 Reisid ja kogemused (31–35) | M10 reisimine (046–050), M14 minevik ja kogemused (066–070) |
| M08 Valikud ja arvamused (36–40) | M16 arvamus ja võrdlemine (076–080), M12 keskkond (056–060) |
| M09 Info ja meedia (41–45) | M17 lugemine ja kirjutamine (081–085) |
| M10 B1 praktika (46–50) + M11 proovieksam (51–52) | M17–M18 (081–090) |

## 3. Etappide roll

- **Avasta:**
  - teema kontekstis (tekst, dialoog, pilt);
  - sõnavara 3 vormiga ja tõlkega;
  - muster („Märka”);
  - esimene kontrollitud kasutus.
- **Harjuta** peab sisaldama kõiki nelja:
  - vormiülesanne (lüngad, sõnavormid, tabel, teisendus, etteütlus, tõlge);
  - tähendusülesanne (valik, õige/vale, paarid, sorteerimine, ristsõna, lugemine);
  - lause tasandi ülesanne (vea parandus, sõnajärg, teisendus);
  - suuline või kirjalik kasutus.
- **Kasuta:**
  - uus olukord (alguses tekst, vihje, lugemine, kuulamine või dialoog);
  - vähemalt kaks eri tüüpi produktiivset ülesannet (rollikaardid, kiri, plaan, monoloog, postitus);
  - lõpus enesehinnang või rubriik.

Kontrollitunnid (iga 5. tund) on ehitatud nii:

- **Harjuta:** kordamisleht, ülesanded tehakse kõigepealt ilma abita;
- **Kasuta:** tervikülesanne rubriigiga.

## 4. Kvaliteedivärav (`admin/course/quality.js`, test `course.test.js`)

Leht avaldatakse ainult siis, kui:

1. konstruktori kontrollis (`analyzeWorksheet`) ei ole vigu;
2. taseme normides ei ole hoiatusi ja didaktiline skoor on ≥ 85 (`didacticCheck`):
   - lause pikkus;
   - teksti maht;
   - juhise pikkus;
   - kinniste ülesannete osakaal;
   - järjekord „kontrollitud → vaba”;
3. lehel on 6–10 plokki ja vähemalt 5 eri ülesandetüüpi; leht lõpeb enesehinnangu või rubriigiga;
4. etapp täidab oma rolli (§3);
5. vaheldus on tagatud:
   - tunni kolmel etapil on eri ülesannete jada;
   - mooduli sama etapi lehtedel ei ole sama jada;
   - naaberlehtedel on ≤ 75 % samu ülesandetüüpe.

## 5. Areng ilma igavuseta

- **Tase:**
  - `meta.level` = tunni `levelStage` (A2 → A2+ → A2+/B1- → B1- → B1; B2 kursusel B1 → B1+ → B1+/B2- → B2- → B2);
  - normid kasvavad koos tasemega: tekst 80–200 → 200–400 sõna, kiri 6–8 lauset → 100–180 sõna, kõne 1 → 3 minutit, sõnapank „jah” → „ei”.
- **Sõnavara:** mooduli põhisõnad tulevad tagasi järgmise mooduli Harjuta lehel. Kontrolltunnis uusi põhisõnu ei ole.
- **Vaheldus:**
  - ülesandetüübid roteeruvad (kvaliteedivärav);
  - tekstižanrid vahelduvad: kuulutus, sõnumid, teade, blogi, e-kiri, intervjuu, artikkel;
  - suhtlusolukorrad vahelduvad: naaber, infolaud, telefon, kliendi- ja ametiasutus;
  - mänguelemendid: ristsõna, „Arva ära, kes see on”, leitud asjad.
- **Õpilase mängud:** lemmiku teemamängud (`pet/petGames.js`) teevad igast avaldatud lehest automaatselt 4 minimängu.

## 6. Töövoog

1. Iga moodul on üks fail: `crm-v2/src/features/worksheet-generator/admin/course/<b1|b2>/moduleNN.js` ja rida failis `registry.js`.
2. Kontrollid:
   - `npx vitest run src/features/worksheet-generator/admin/course` — kvaliteedivärav;
   - eslint;
   - build.
3. Üks PR ühe või kahe mooduli kohta.
4. Pärast deploy'd avaldab omanik või admin: Õppevara → menüü → „Kursuse tootmine (B1, B2)”.
   - Seal vali moodul, vaata iga lehte („Vaata”) ja vajuta „Avalda tund”.
   - Olemasolev leht asendatakse ainult eraldi kinnitusega.
5. Pärast avaldamist kontrolli Õpilase vaates lehe murdumist.

## 7. Järjekord

1. **B1 Harjuta + Kasuta**, moodul haaval:
   - M02 ✓ (006–010, see PR);
   - seejärel M03…M10;
   - sealt edasi Avasta + Harjuta + Kasuta (M11–M18).
2. **B2** kõik kolm etappi, M01…M18. Enne seda lisatakse `levels.js`-i profiil B1+ (vt puudujääke).

## 8. Valminud

Alates 2026-10-10 on iga leht 40–55 min (`didactics/timeEstimate.js`). Moodulid 2–6 on laiendatud (40–46 min lehe kohta).


| Moodul | Tunnid | Etapid | PR |
| --- | --- | --- | --- |
| B1 M02 Mina, pere ja suhted | 006–010 | Harjuta, Kasuta | #433 |
| B1 M03 Kodu, kohad ja linn | 011–015 | Harjuta, Kasuta | #434 |
| B1 M04 Aeg, plaanid ja kohustused | 016–020 | Harjuta, Kasuta | #434 |
| B1 M05 Lihtminevik ja kogemused | 021–025 | Harjuta, Kasuta | #435, laiendus agent/course-b1-expand-m05 |
| B1 M06 Toit ja teenindus | 026–030 | Harjuta, Kasuta | #435, laiendus agent/course-b1-expand-m05 |
| B1 M07 Tervis ja enesetunne | 031–035 | Harjuta, Kasuta | #448 |
| B2 M01 Igapäevaelu ja B1 lähtepunkt | b1b2-001–005 | Avasta, Harjuta, Kasuta | agent/course-b2-m01 |
| B2 M02 Linn, teenused ja asjaajamine | b1b2-006–010 | Avasta, Harjuta, Kasuta | agent/course-b2-m02 |
| B2 M03 Minevik ja kogemused | b1b2-011–015 | Avasta, Harjuta, Kasuta | agent/course-b2-m03 |
| B2 M04 Sihitis, ma-/da-infinitiiv ja rektsioon | b1b2-016–020 | Avasta, Harjuta, Kasuta | agent/course-b2-m04 |
| B2 M05 Arvamus ja põhjendamine | b1b2-021–025 | Avasta, Harjuta, Kasuta | agent/course-b2-m05 |
| B2 M06 Tööelu | b1b2-026–030 | Avasta, Harjuta, Kasuta | agent/course-b2-m06 |
| B2 M07 Haridus ja õppimine | b1b2-031–035 | Avasta, Harjuta, Kasuta | agent/course-b2-m07 |
| B2 M08 Reisimine ja kultuur | b1b2-036–040 | Avasta, Harjuta, Kasuta | agent/course-b2-m08 |
| B2 M09 Tervis ja eluviis | b1b2-041–045 | Avasta, Harjuta, Kasuta | agent/course-b2-m09 |
| B2 M10 Suhted ja konfliktid | b1b2-046–050 | Avasta, Harjuta, Kasuta | agent/course-b2-m10 |
| B2 M11 Raha ja tarbimine | b1b2-051–055 | Avasta, Harjuta, Kasuta | agent/course-b2-m11 |
| B2 M12 Tehnoloogia ja sotsiaalmeedia | b1b2-056–060 | Avasta, Harjuta, Kasuta | agent/course-b2-m12 |
| B2 M13 Keskkond ja vastutustundlik elu | b1b2-061–065 | Avasta, Harjuta, Kasuta | agent/course-b2-m13 |
| B2 M14 Ühiskond ja avalikud teenused | b1b2-066–070 | Avasta, Harjuta, Kasuta | agent/course-b2-m14 |
| B2 M15 Meedia, info ja kriitiline lugemine | b1b2-071–075 | Avasta, Harjuta, Kasuta | agent/course-b2-m15 |
| B2 M16 B2 grammatika integratsioon | b1b2-076–080 | Avasta, Harjuta, Kasuta | agent/course-b2-m16 |
| B2 M17 B2 kirjutamine | b1b2-081–085 | Avasta, Harjuta, Kasuta | agent/course-b2-m17 |
| B2 M18 B2 rääkimine ja lõpphindamine | b1b2-086–090 | Avasta, Harjuta, Kasuta | agent/course-b2-m18 |
