# Täienduskoolitus: kursused, tunnistused ja EHIS-e tegevusnäitajad

Omaniku soov 2026-11-27: kool on EHIS-es täienduskoolitusasutus (E&P Koolituskeskus, majandustegevusteade 261556,
kehtib 22.02.2026, õppekavarühm „Keeleõpe”) ja peab iga aasta 31. märtsiks esitama eelmise kalendriaasta
tegevusnäitajad (täiskasvanute koolituse seadus § 8 lg 4). Andmed peavad olema CRM-is, mitte eraldi tabelis.

## Leht

`/taienduskoolitus` — „Kursused ja EHIS” (menüü „Inimesed”, ainult administraator).

- **Kursus** on kinnitatud õppekava üks läbiviimine: nimi, õppekava (A2, B1, B2, C1 või muu), maht akadeemilistes
  tundides (kontaktõpe + iseseisev töö), algus ja lõpp, koolitaja, grupp (valikuline), seis (käib / lõppenud / arhiiv).
- **Õppija** kursusel: nimi (seotud õpilase kaardiga või käsitsi), alustamise kuupäev, osalus %, lõputesti %,
  väljastatud dokument (tunnistus või tõend) koos numbri ja kuupäevaga.
- „Loe osalus tundidest” loeb seotud õppijate tunnimärked (`lessons`: `Toimunud` = osales, `Puudus_eta` / `Puudus_p`
  = puudus) kursuse kuupäevade vahel ja täidab osaluse ning tühja alustamiskuupäeva. Tunnimärkeid ei muudeta.
- Dokument: tunnistus, kui osalus ≥ 75 % ja lõputest ≥ 60 % (õppekavade lõpetamise tingimused); muidu tõend.
  Number on aasta kaupa jooksev (`2026-014`), tunnistustel ja tõenditel ühine (täienduskoolituse standard § 3 lg 8).
- **Aasta aruanne** arvestab kursusi, mis on seisus „Lõppenud” ja mille lõpu kuupäev on valitud aastas: alustanud
  õppijad, väljaantud tunnistused ja tõendid, kursused mahu järgi (kuni 8, 9–26, 27–80, 81–240, üle 240 ak t; maht =
  kontaktõpe + iseseisev töö), kursuste arv. „Kopeeri aruanne” annab arvud tekstina; EHIS-esse sisestab need inimene.

## Andmed

Kollektsioon `trainingCourses` (`firestore.rules` → `trainingCourseValid`): loeb, loob ja muudab ainult
administraator; autor ja loomise aeg ei muutu; kustutada ei saa (arhiiv). Väljad: `title`, `curriculum`,
`curriculumName`, `contactHours`, `independentHours`, `startDate`, `endDate`, `teacherName`, `groupId`, `status`,
`participants[]` (kuni 40: `studentId`, `name`, `startedOn`, `attendancePct`, `finalTestPct`, `document`,
`documentNumber`, `documentDate`; protsent −1 = teadmata), `notes`, `createdAt`, `createdByUid`, `createdByName`,
`updatedAt`.

Kood: `crm-v2/src/features/training/` (`trainingModel.js` — arvutused, `TrainingPage.jsx`), teenus
`services/firebase/trainingCourses.js`, reeglite test `functions/training-courses-rules-emulator.integration.js`.

## Piirangud

- Õppekavade mahud (`CURRICULA`) on koodis; kinnitatud õppekavade tekstid ei ole veel repositooriumis ega veebilehel.
- Tunnistuse PDF-i leht ei tee; number ja kuupäev on registris, dokument vormistatakse eraldi.
- Tunnistusele on vaja isikukoodi või sünniaega — seda välja õpilase kaardil veel ei ole.
- Alaealiste arvestamine tegevusnäitajates on ministeeriumiga täpsustamata; aruandesse lähevad kõik kursuse õppijad.
