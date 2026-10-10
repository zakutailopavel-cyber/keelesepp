# Õppematerjalide kvaliteedi audit

Kontrollitud: 2026-10-10, `main` 3ee4659. Kriteeriumid: [MATERIAL_QUALITY_CHECKLIST.md](MATERIAL_QUALITY_CHECKLIST.md). Genereeritud: `WRITE_MATERIAL_AUDIT=1 npx vitest run src/features/worksheet-generator/admin/course/materialAudit.test.js`.

Hõlmab kõiki lehti, mida repositoorium koodis toodab (A2 moodulid 1–10, B1 moodul 1, kursuse moodulid B1/B2/C1). CRM-is käsitsi tehtud ja ainult Firestore'is olevad lehed (nt Avasta 001–050 üleviidud versioonid) ei ole kaetud.

## Kokkuvõte: mitu % tundidest vastab (K4, J4: % moodulitest)

| Kriteerium | A2 | B1 | B2 | C1 |
|---|---:|---:|---:|---:|
| Moodulid / tunnid / lehed | 10 / 50 / 150 | 7 / 35 / 75 | 18 / 90 / 270 | 10 / 100 / 300 |
| A1 Neli osaoskust tunnis | 34% | 83% | 97% | 0% |
| A2 Paaris- või rühmatöö | 68% | 83% | 100% | 100% |
| A3 Teksti kasutatakse edasi | 100% | 100% | 100% | 100% |
| A5 Avasta algab olukorraga | 100% | 91% | 100% | 100% |
| J1 Kontrollitud → vaba | 100% | 91% | 100% | 100% |
| J2 Tugi loovülesandele | 100% | 100% | 100% | 100% |
| J3 Lühike selge tööjuhis | 100% | 100% | 100% | 97% |
| J5 Enesehinnang lehel | 0% | 100% | 100% | 100% |
| K1 Avatud ülesanne | 100% | 100% | 100% | 100% |
| K2 Pilt tunnis | 10% | 0% | 0% | 0% |
| K4 Ülesanne väljaspool klassi | 30% | 43% | 44% | 60% |
| J4 Diferentseerimine | 0% | 0% | 0% | 0% |

## Moodulite kaupa

### A2 moodul 1: A2 lähtepunkt ja eneseinfo (`a2-module-01`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 1/5, J5 5/5; moodul: K4, J4
  - `a2-001`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd
  - `a2-002`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine, kuulamine
  - `a2-003`: J5 lehel pole enesehinnangut ega rubriiki
  - `a2-004`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine
  - `a2-005`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine

### A2 moodul 2: Pere, inimesed ja kirjeldamine (`a2-module-02`)

- Tunnid, kus kriteerium ei täitu: A1 2/5, A2 2/5, J5 5/5, K2 5/5; moodul: J4
  - `a2-006`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-007`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-008`: J5 lehel pole enesehinnangut ega rubriiki · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-009`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine, kuulamine · K2 tunnis pole ühtki pilti
  - `a2-010`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti

### A2 moodul 3: Päev, kell ja harjumused (`a2-module-03`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 2/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-011`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-012`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-013`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti
  - `a2-014`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-015`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti

### A2 moodul 4: Kodu ja ümbrus (`a2-module-04`)

- Tunnid, kus kriteerium ei täitu: A1 2/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-016`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-017`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-018`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-019`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-020`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti

### A2 moodul 5: Linn, kohad ja tee (`a2-module-05`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 3/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-021`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-022`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-023`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-024`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-025`: J5 lehel pole enesehinnangut ega rubriiki · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti

### A2 moodul 6: Söök, jook ja kohvik (`a2-module-06`)

- Tunnid, kus kriteerium ei täitu: A1 2/5, A2 2/5, J5 5/5, K2 5/5; moodul: J4
  - `a2-026`: J5 lehel pole enesehinnangut ega rubriiki · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-027`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-028`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-029`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-030`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti

### A2 moodul 7: Pood, raha ja ostud (`a2-module-07`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 2/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-031`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti
  - `a2-032`: J5 lehel pole enesehinnangut ega rubriiki · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-033`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-034`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-035`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti

### A2 moodul 8: Teenused ja asjaajamine (`a2-module-08`)

- Tunnid, kus kriteerium ei täitu: A1 3/5, A2 2/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-036`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-037`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-038`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-039`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-040`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti

### A2 moodul 9: Tervis ja kehahooldus (`a2-module-09`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 1/5, J5 5/5, K2 5/5; moodul: J4
  - `a2-041`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-042`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti
  - `a2-043`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-044`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-045`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti

### A2 moodul 10: Vaba aeg ja meelelahutus (`a2-module-10`)

- Tunnid, kus kriteerium ei täitu: A1 4/5, A2 1/5, J5 5/5, K2 5/5; moodul: K4, J4
  - `a2-046`: J5 lehel pole enesehinnangut ega rubriiki · K2 tunnis pole ühtki pilti
  - `a2-047`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-048`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine, kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2-049`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2-050`: J5 lehel pole enesehinnangut ega rubriiki · A1 tunnis puudub: lugemine · K2 tunnis pole ühtki pilti

### B1 moodul 1 (A2 → B1) (`b1-module-01`)

- Tunnid, kus kriteerium ei täitu: A1 5/5, A2 5/5, A5 3/5, J1 3/5, K2 5/5; moodul: K4, J4
  - `a2b1-001`: A5 (discover) Avasta algab ülesandega „choice”, mitte olukorra või sissejuhatusega · J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd
  - `a2b1-002`: A5 (discover) Avasta algab ülesandega „clock”, mitte olukorra või sissejuhatusega · J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd
  - `a2b1-003`: A5 (discover) Avasta algab ülesandega „categorize”, mitte olukorra või sissejuhatusega · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2b1-004`: A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2b1-005`: J1 (transfer) kontrollitud harjutus vaba ülesande järel: choice · A1 tunnis puudub: kuulamine · A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti

### B1 Mina, pere ja suhted (`a2b1-module-02`)

- Tunnid, kus kriteerium ei täitu: A1 1/5, K2 5/5; moodul: J4
  - `a2b1-006`: K2 tunnis pole ühtki pilti
  - `a2b1-007`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `a2b1-008`: K2 tunnis pole ühtki pilti
  - `a2b1-009`: K2 tunnis pole ühtki pilti
  - `a2b1-010`: K2 tunnis pole ühtki pilti

### B1 Kodu, kohad ja linn (`a2b1-module-03`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `a2b1-011`: K2 tunnis pole ühtki pilti
  - `a2b1-012`: K2 tunnis pole ühtki pilti
  - `a2b1-013`: K2 tunnis pole ühtki pilti
  - `a2b1-014`: K2 tunnis pole ühtki pilti
  - `a2b1-015`: K2 tunnis pole ühtki pilti

### B1 Aeg, plaanid ja kohustused (`a2b1-module-04`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `a2b1-016`: K2 tunnis pole ühtki pilti
  - `a2b1-017`: K2 tunnis pole ühtki pilti
  - `a2b1-018`: K2 tunnis pole ühtki pilti
  - `a2b1-019`: K2 tunnis pole ühtki pilti
  - `a2b1-020`: K2 tunnis pole ühtki pilti

### B1 Lihtminevik ja kogemused (`a2b1-module-05`)

- Tunnid, kus kriteerium ei täitu: A2 1/5, K2 5/5; moodul: K4, J4
  - `a2b1-021`: K2 tunnis pole ühtki pilti
  - `a2b1-022`: K2 tunnis pole ühtki pilti
  - `a2b1-023`: K2 tunnis pole ühtki pilti
  - `a2b1-024`: A2 tunnis pole paaris- ega rühmatööd · K2 tunnis pole ühtki pilti
  - `a2b1-025`: K2 tunnis pole ühtki pilti

### B1 Toit ja teenindus (`a2b1-module-06`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `a2b1-026`: K2 tunnis pole ühtki pilti
  - `a2b1-027`: K2 tunnis pole ühtki pilti
  - `a2b1-028`: K2 tunnis pole ühtki pilti
  - `a2b1-029`: K2 tunnis pole ühtki pilti
  - `a2b1-030`: K2 tunnis pole ühtki pilti

### B1 Tervis ja enesetunne (`a2b1-module-07`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `a2b1-031`: K2 tunnis pole ühtki pilti
  - `a2b1-032`: K2 tunnis pole ühtki pilti
  - `a2b1-033`: K2 tunnis pole ühtki pilti
  - `a2b1-034`: K2 tunnis pole ühtki pilti
  - `a2b1-035`: K2 tunnis pole ühtki pilti

### B2 Igapäevaelu ja B1 lähtepunkt (`b1b2-module-01`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-001`: K2 tunnis pole ühtki pilti
  - `b1b2-002`: K2 tunnis pole ühtki pilti
  - `b1b2-003`: K2 tunnis pole ühtki pilti
  - `b1b2-004`: K2 tunnis pole ühtki pilti
  - `b1b2-005`: K2 tunnis pole ühtki pilti

### B2 Linn, teenused ja asjaajamine (`b1b2-module-02`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-006`: K2 tunnis pole ühtki pilti
  - `b1b2-007`: K2 tunnis pole ühtki pilti
  - `b1b2-008`: K2 tunnis pole ühtki pilti
  - `b1b2-009`: K2 tunnis pole ühtki pilti
  - `b1b2-010`: K2 tunnis pole ühtki pilti

### B2 Minevik ja kogemused (`b1b2-module-03`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-011`: K2 tunnis pole ühtki pilti
  - `b1b2-012`: K2 tunnis pole ühtki pilti
  - `b1b2-013`: K2 tunnis pole ühtki pilti
  - `b1b2-014`: K2 tunnis pole ühtki pilti
  - `b1b2-015`: K2 tunnis pole ühtki pilti

### B2 Sihitis, ma-/da-infinitiiv ja rektsioon (`b1b2-module-04`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-016`: K2 tunnis pole ühtki pilti
  - `b1b2-017`: K2 tunnis pole ühtki pilti
  - `b1b2-018`: K2 tunnis pole ühtki pilti
  - `b1b2-019`: K2 tunnis pole ühtki pilti
  - `b1b2-020`: K2 tunnis pole ühtki pilti

### B2 Arvamus ja põhjendamine (`b1b2-module-05`)

- Tunnid, kus kriteerium ei täitu: A1 1/5, K2 5/5; moodul: K4, J4
  - `b1b2-021`: K2 tunnis pole ühtki pilti
  - `b1b2-022`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `b1b2-023`: K2 tunnis pole ühtki pilti
  - `b1b2-024`: K2 tunnis pole ühtki pilti
  - `b1b2-025`: K2 tunnis pole ühtki pilti

### B2 Tööelu (`b1b2-module-06`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-026`: K2 tunnis pole ühtki pilti
  - `b1b2-027`: K2 tunnis pole ühtki pilti
  - `b1b2-028`: K2 tunnis pole ühtki pilti
  - `b1b2-029`: K2 tunnis pole ühtki pilti
  - `b1b2-030`: K2 tunnis pole ühtki pilti

### B2 Haridus ja õppimine (`b1b2-module-07`)

- Tunnid, kus kriteerium ei täitu: A1 1/5, K2 5/5; moodul: K4, J4
  - `b1b2-031`: K2 tunnis pole ühtki pilti
  - `b1b2-032`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `b1b2-033`: K2 tunnis pole ühtki pilti
  - `b1b2-034`: K2 tunnis pole ühtki pilti
  - `b1b2-035`: K2 tunnis pole ühtki pilti

### B2 Reisimine ja kultuur (`b1b2-module-08`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-036`: K2 tunnis pole ühtki pilti
  - `b1b2-037`: K2 tunnis pole ühtki pilti
  - `b1b2-038`: K2 tunnis pole ühtki pilti
  - `b1b2-039`: K2 tunnis pole ühtki pilti
  - `b1b2-040`: K2 tunnis pole ühtki pilti

### B2 Tervis ja eluviis (`b1b2-module-09`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-041`: K2 tunnis pole ühtki pilti
  - `b1b2-042`: K2 tunnis pole ühtki pilti
  - `b1b2-043`: K2 tunnis pole ühtki pilti
  - `b1b2-044`: K2 tunnis pole ühtki pilti
  - `b1b2-045`: K2 tunnis pole ühtki pilti

### B2 Suhted ja konfliktid (`b1b2-module-10`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-046`: K2 tunnis pole ühtki pilti
  - `b1b2-047`: K2 tunnis pole ühtki pilti
  - `b1b2-048`: K2 tunnis pole ühtki pilti
  - `b1b2-049`: K2 tunnis pole ühtki pilti
  - `b1b2-050`: K2 tunnis pole ühtki pilti

### B2 Raha ja tarbimine (`b1b2-module-11`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-051`: K2 tunnis pole ühtki pilti
  - `b1b2-052`: K2 tunnis pole ühtki pilti
  - `b1b2-053`: K2 tunnis pole ühtki pilti
  - `b1b2-054`: K2 tunnis pole ühtki pilti
  - `b1b2-055`: K2 tunnis pole ühtki pilti

### B2 Tehnoloogia ja sotsiaalmeedia (`b1b2-module-12`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-056`: K2 tunnis pole ühtki pilti
  - `b1b2-057`: K2 tunnis pole ühtki pilti
  - `b1b2-058`: K2 tunnis pole ühtki pilti
  - `b1b2-059`: K2 tunnis pole ühtki pilti
  - `b1b2-060`: K2 tunnis pole ühtki pilti

### B2 Keskkond ja vastutustundlik elu (`b1b2-module-13`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-061`: K2 tunnis pole ühtki pilti
  - `b1b2-062`: K2 tunnis pole ühtki pilti
  - `b1b2-063`: K2 tunnis pole ühtki pilti
  - `b1b2-064`: K2 tunnis pole ühtki pilti
  - `b1b2-065`: K2 tunnis pole ühtki pilti

### B2 Ühiskond ja avalikud teenused (`b1b2-module-14`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: J4
  - `b1b2-066`: K2 tunnis pole ühtki pilti
  - `b1b2-067`: K2 tunnis pole ühtki pilti
  - `b1b2-068`: K2 tunnis pole ühtki pilti
  - `b1b2-069`: K2 tunnis pole ühtki pilti
  - `b1b2-070`: K2 tunnis pole ühtki pilti

### B2 Meedia, info ja kriitiline lugemine (`b1b2-module-15`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-071`: K2 tunnis pole ühtki pilti
  - `b1b2-072`: K2 tunnis pole ühtki pilti
  - `b1b2-073`: K2 tunnis pole ühtki pilti
  - `b1b2-074`: K2 tunnis pole ühtki pilti
  - `b1b2-075`: K2 tunnis pole ühtki pilti

### B2 B2 grammatika integratsioon (`b1b2-module-16`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-076`: K2 tunnis pole ühtki pilti
  - `b1b2-077`: K2 tunnis pole ühtki pilti
  - `b1b2-078`: K2 tunnis pole ühtki pilti
  - `b1b2-079`: K2 tunnis pole ühtki pilti
  - `b1b2-080`: K2 tunnis pole ühtki pilti

### B2 B2 kirjutamine (`b1b2-module-17`)

- Tunnid, kus kriteerium ei täitu: K2 5/5; moodul: K4, J4
  - `b1b2-081`: K2 tunnis pole ühtki pilti
  - `b1b2-082`: K2 tunnis pole ühtki pilti
  - `b1b2-083`: K2 tunnis pole ühtki pilti
  - `b1b2-084`: K2 tunnis pole ühtki pilti
  - `b1b2-085`: K2 tunnis pole ühtki pilti

### B2 B2 rääkimine ja lõpphindamine (`b1b2-module-18`)

- Tunnid, kus kriteerium ei täitu: A1 1/5, K2 5/5; moodul: J4
  - `b1b2-086`: K2 tunnis pole ühtki pilti
  - `b1b2-087`: K2 tunnis pole ühtki pilti
  - `b1b2-088`: K2 tunnis pole ühtki pilti
  - `b1b2-089`: K2 tunnis pole ühtki pilti
  - `b1b2-090`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti

### C1 Eneseväljendus, identiteet ja suhted (`est-c1-module-01`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: J4
  - `est-c1-001`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-002`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-003`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-004`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-005`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Kodu, kogukond ja linnakeskkond (`est-c1-module-02`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: J4
  - `est-c1-011`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-012`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-013`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-014`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-015`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Teenused, tarbimine ja raha (`est-c1-module-03`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: J4
  - `est-c1-021`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-022`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-023`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-024`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-025`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Haridus, õppimine ja info (`est-c1-module-04`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: K4, J4
  - `est-c1-031`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-032`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-033`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-034`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-035`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Töö, professionaalne suhtlus ja organisatsioon (`est-c1-module-05`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, J3 1/10, K2 10/10; moodul: K4, J4
  - `est-c1-041`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-042`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-043`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-044`: J3 (practice) „Koosoleku väljendid.”: tööjuhis 21 sõna (kuni 20) · A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-045`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Tervis, heaolu ja sotsiaalne toimetulek (`est-c1-module-06`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: K4, J4
  - `est-c1-051`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-052`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-053`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-054`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-055`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Liikuvus, keskkond ja elukeskkonna areng (`est-c1-module-07`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, J3 1/10, K2 10/10; moodul: J4
  - `est-c1-061`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-062`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-063`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-064`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-065`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Kultuur, keel ja meedia (`est-c1-module-08`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, J3 1/10, K2 10/10; moodul: K4, J4
  - `est-c1-071`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-072`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-073`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-074`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-075`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Ühiskond, institutsioonid ja avalik elu (`est-c1-module-09`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: J4
  - `est-c1-081`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-082`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-083`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-084`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-085`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

### C1 Teadus, tehnoloogia ja tulevik (`est-c1-module-10`)

- Tunnid, kus kriteerium ei täitu: A1 10/10, K2 10/10; moodul: J4
  - `est-c1-091`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-092`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-093`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-094`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - `est-c1-095`: A1 tunnis puudub: kuulamine · K2 tunnis pole ühtki pilti
  - … veel 5 tundi

