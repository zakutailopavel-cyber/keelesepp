# Õppematerjalide kvaliteedi audit

Kontrollitud: 2026-10-11, `main` 6987009. Kriteeriumid: [MATERIAL_QUALITY_CHECKLIST.md](MATERIAL_QUALITY_CHECKLIST.md). Genereeritud: `WRITE_MATERIAL_AUDIT=1 npx vitest run src/features/worksheet-generator/admin/course/materialAudit.test.js`.

Hõlmab kõiki lehti, mida repositoorium koodis toodab (A2 moodulid 1–10, B1 moodul 1, kursuse moodulid B1/B2/C1). CRM-is käsitsi tehtud ja ainult Firestore'is olevad lehed (nt Avasta 001–050 üleviidud versioonid) ei ole kaetud.

## Kokkuvõte: mitu % tundidest vastab (K4, J4: % moodulitest)

| Kriteerium | A2 | B1 | B2 | C1 |
|---|---:|---:|---:|---:|
| Moodulid / tunnid / lehed | 10 / 50 / 150 | 7 / 35 / 75 | 18 / 90 / 270 | 10 / 100 / 300 |
| A1 Neli osaoskust tunnis | 100% | 100% | 100% | 100% |
| A2 Paaris- või rühmatöö | 100% | 100% | 100% | 100% |
| A3 Teksti kasutatakse edasi | 100% | 100% | 100% | 100% |
| A5 Avasta algab olukorraga | 100% | 100% | 100% | 100% |
| J1 Kontrollitud → vaba | 100% | 91% | 100% | 100% |
| J2 Tugi loovülesandele | 100% | 100% | 100% | 100% |
| J3 Lühike selge tööjuhis | 100% | 100% | 100% | 97% |
| J5 Enesehinnang lehel | 100% | 100% | 100% | 100% |
| K1 Avatud ülesanne | 100% | 100% | 100% | 100% |
| K2 Pilt tunnis | 100% | 100% | 100% | 100% |
| K4 Ülesanne väljaspool klassi | 100% | 100% | 100% | 100% |
| J4 Diferentseerimine | 100% | 100% | 100% | 100% |

## Moodulite kaupa

### A2 moodul 1: A2 lähtepunkt ja eneseinfo (`a2-module-01`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 2: Pere, inimesed ja kirjeldamine (`a2-module-02`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 3: Päev, kell ja harjumused (`a2-module-03`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 4: Kodu ja ümbrus (`a2-module-04`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 5: Linn, kohad ja tee (`a2-module-05`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 6: Söök, jook ja kohvik (`a2-module-06`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 7: Pood, raha ja ostud (`a2-module-07`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 8: Teenused ja asjaajamine (`a2-module-08`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 9: Tervis ja kehahooldus (`a2-module-09`)

- Kõik automaatsed kriteeriumid täidetud.

### A2 moodul 10: Vaba aeg ja meelelahutus (`a2-module-10`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 moodul 1 (A2 → B1) (`b1-module-01`)

- Tunnid, kus kriteerium ei täitu: J1 3/5
  - `a2b1-001`: J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice
  - `a2b1-002`: J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice
  - `a2b1-005`: J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice

### B1 Mina, pere ja suhted (`a2b1-module-02`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 Kodu, kohad ja linn (`a2b1-module-03`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 Aeg, plaanid ja kohustused (`a2b1-module-04`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 Lihtminevik ja kogemused (`a2b1-module-05`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 Toit ja teenindus (`a2b1-module-06`)

- Kõik automaatsed kriteeriumid täidetud.

### B1 Tervis ja enesetunne (`a2b1-module-07`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Igapäevaelu ja B1 lähtepunkt (`b1b2-module-01`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Linn, teenused ja asjaajamine (`b1b2-module-02`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Minevik ja kogemused (`b1b2-module-03`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Sihitis, ma-/da-infinitiiv ja rektsioon (`b1b2-module-04`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Arvamus ja põhjendamine (`b1b2-module-05`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Tööelu (`b1b2-module-06`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Haridus ja õppimine (`b1b2-module-07`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Reisimine ja kultuur (`b1b2-module-08`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Tervis ja eluviis (`b1b2-module-09`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Suhted ja konfliktid (`b1b2-module-10`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Raha ja tarbimine (`b1b2-module-11`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Tehnoloogia ja sotsiaalmeedia (`b1b2-module-12`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Keskkond ja vastutustundlik elu (`b1b2-module-13`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Ühiskond ja avalikud teenused (`b1b2-module-14`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 Meedia, info ja kriitiline lugemine (`b1b2-module-15`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 B2 grammatika integratsioon (`b1b2-module-16`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 B2 kirjutamine (`b1b2-module-17`)

- Kõik automaatsed kriteeriumid täidetud.

### B2 B2 rääkimine ja lõpphindamine (`b1b2-module-18`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Eneseväljendus, identiteet ja suhted (`est-c1-module-01`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Kodu, kogukond ja linnakeskkond (`est-c1-module-02`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Teenused, tarbimine ja raha (`est-c1-module-03`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Haridus, õppimine ja info (`est-c1-module-04`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Töö, professionaalne suhtlus ja organisatsioon (`est-c1-module-05`)

- Tunnid, kus kriteerium ei täitu: J3 1/10
  - `est-c1-044`: J3 (practice) „Koosoleku väljendid.”: tööjuhis 21 sõna (kuni 20)

### C1 Tervis, heaolu ja sotsiaalne toimetulek (`est-c1-module-06`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Liikuvus, keskkond ja elukeskkonna areng (`est-c1-module-07`)

- Tunnid, kus kriteerium ei täitu: J3 1/10
  - `est-c1-066`: J3 (practice) „Arutelu väljendid.”: tööjuhis 22 sõna (kuni 20)

### C1 Kultuur, keel ja meedia (`est-c1-module-08`)

- Tunnid, kus kriteerium ei täitu: J3 1/10
  - `est-c1-076`: J3 (practice) „Konstruktiivsed väljendid.”: tööjuhis 22 sõna (kuni 20)

### C1 Ühiskond, institutsioonid ja avalik elu (`est-c1-module-09`)

- Kõik automaatsed kriteeriumid täidetud.

### C1 Teadus, tehnoloogia ja tulevik (`est-c1-module-10`)

- Kõik automaatsed kriteeriumid täidetud.

