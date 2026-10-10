# Õppematerjali kvaliteedi kontrollnimekiri

KeeleSepa töölehtede, tunnipakettide ja õpiku hindamise leping. Kehtib nii koodis toodetud lehtedele kui ka CRM-is
käsitsi tehtud lehtedele. Normatiivne koos [`CEFR_A2_B1_LEARNING_STANDARD.md`](CEFR_A2_B1_LEARNING_STANDARD.md)-ga:
see dokument ütleb, **milline** on hea materjal; CEFR-standard ütleb, **kui raske** see tasemel olema peab.

**Allikas ja autoriõigus.** Põhimõtted tuginevad Mare Kitsniku juhendile „Eesti keele kui teise keele
õppematerjalide koostamise ja hindamise juhend. Teemakokkuvõte” (Tartu Ülikool, RITA-ränne, HTM tellimus;
[PDF](https://sisu.ut.ee/wp-content/uploads/sites/265/oppematerjalide_koostamine_teemakokkuvote.pdf)). Siin on
kriteeriumid KeeleSepa jaoks oma sõnadega ümber kirjutatud ja seotud meie plokkide ning Avasta / Harjuta / Kasuta
ülesehitusega. Juhendi teksti ega tabeleid ei kopeerita.

## Kolm põhinõuet

Hea materjal on

1. **kaasahaarav (K)** — õppija tahab sellega tegeleda;
2. **aktiivne ja suhtluslik (A)** — õppija teeb ise ja suhtleb, mitte ei kuula passiivselt;
3. **jõukohane ja arendav (J)** — tasemele sobiv, viib sammhaaval edasi ja annab tuge.

Järjekord on teadlik: huvi ja aktiivsus on eeldus, ilma milleta ka tasemekohane materjal ei tööta.

## Kriteeriumid

„Auto” — kontrollib `crm-v2/src/features/worksheet-generator/admin/course/materialChecklist.js`
(nõuandev, ei blokeeri avaldamist). „Inimene” — vaatab üle autor või ülevaataja enne avaldamist.

### K — kaasahaarav

| Kood | Nõue | Mida see meil tähendab | Kontroll |
|---|---|---|---|
| K1 | Avatud ülesanne | Igas tunnis on vähemalt üks ülesanne, millel pole ühte õiget vastust (rääkimine, kirjutamine, rollikaardid, plaan). | Auto, tund |
| K2 | Pilt töötab ülesandes | Igas tunnis on vähemalt üks pilt, mida kasutatakse ülesandes (kirjelda, võrdle, arva), mitte ainult kaunistuseks. Pildi lähteülesanne: [`TEXTBOOK_ART_BIBLE.md`](TEXTBOOK_ART_BIBLE.md). | Auto (pilt olemas), inimene (pilt on funktsionaalne) |
| K3 | Huvitav ja ajakohane teema | Teema on täiskasvanud õppijale päriselus oluline; tekstis on midagi uut või üllatavat; olukord on tänapäevane. | Inimene |
| K4 | Väljaspool klassi | Igas moodulis on vähemalt üks ülesanne, mis viib keele päriselu (kodus, linnas, poes, veebis, eestlasega). | Auto, moodul |
| K5 | Autentne tekst | Lugemis- ja kuulamistekst näeb välja nagu päris tekst (kuulutus, kiri, sõnum, artikkel, intervjuu). Lihtsustatud tekst ei kõla kunstlikult ega kuhja üht grammatikavormi. | Inimene |
| K6 | Tekstiliikide vaheldus | Moodulis on eri žanreid: argitekst, ajakirjandus, poolametlik tekst, ilukirjandus. Autorid on eri inimesed. | Inimene |
| K7 | Emotsioon ja arvamus | Tekst või ülesanne paneb kaasa mõtlema, naerma, vaidlema või oma arvamust ütlema. Neutraalne ja tühi sisu on puudus. | Inimene |
| K8 | Kujundus | Ühtne stiil, selge liigendus, mugav nii paberil kui ekraanil ([`TEXTBOOK_VISUAL_STYLE.md`](TEXTBOOK_VISUAL_STYLE.md)). Pildid on stereotüüpideta. | Inimene |

### A — aktiivne ja suhtluslik

| Kood | Nõue | Mida see meil tähendab | Kontroll |
|---|---|---|---|
| A1 | Neli osaoskust | Tunni kolmes etapis kokku on lugemine (`reading`, `dialogue`), kuulamine (`listening`, `dictation`), rääkimine (`speaking`, `rolecards`) ja kirjutamine (`writing`, `guidedletter`). Moodulis on need ligikaudu tasakaalus. | Auto, tund |
| A2 | Paaris- või rühmatöö | Igas tunnis on vähemalt üks ülesanne paarilise või rühmaga (rollikaardid või juhis „küsige / arutage / rääkige paaris”). | Auto, tund |
| A3 | Tekstiga töötatakse mitu korda | Loetud või kuulatud tekst ei jää üksi: enne on häälestus, ajal ülesanne, pärast kasutatakse teemat rääkimises või kirjutamises. | Auto (hilisem kasutus), inimene (eel- ja järeltegevus) |
| A4 | Info- või arvamuslünk | Rääkimisülesandes on põhjus suhelda: partneril on infot, mida mina ei tea, või meil on eri arvamused. Õppija loob teksti ise, mitte ei loe valmisteksti ette. | Inimene |
| A5 | Häälestus tunni alguses | Avasta algab olukorra, pildi, lühiteksti või kerge häälestusega, mitte kohe testiga. | Auto, leht |
| A6 | Liikumine ja tegevus | Kohati vahetatakse paarilist, tõustakse, tehakse midagi valmis (plakat, esitlus, plaan). | Inimene |

### J — jõukohane ja arendav

| Kood | Nõue | Mida see meil tähendab | Kontroll |
|---|---|---|---|
| J1 | Kontrollitud → vaba | Lehel tulevad kontrollitud harjutused enne vabu ülesandeid; pärast vaba ülesannet ei tule enam lünka ega valikut (v.a enesehinnang). | Auto, leht |
| J2 | Tugi loovülesandele | Igal rääkimis- ja kirjutamisülesandel on tugi: fraasid, märksõnad, plaan või näide. | Auto, leht |
| J3 | Selge tööjuhis | Igal ülesandel on juhis; kontrollitud harjutuse juhis on kuni 20 sõna, tavakeeles, ilma terminiteta. Rääkimise ja kirjutamise juhis võib olla pikem, sest see kirjeldab olukorda. | Auto, leht |
| J4 | Diferentseerimine | Moodulis on lisaülesanne kiirematele või kergem variant aeglasematele. | Auto, moodul |
| J5 | Enesehinnang | Iga leht lõpeb enesehinnangu (`selfcheck`) või rubriigiga (`rubric`). | Auto, leht |
| J6 | Tasemekohane | Sõnavara, grammatika ja tekstide pikkus vastavad tasemele ning `levelStage`-ile ([`CEFR_A2_B1_LEARNING_STANDARD.md`](CEFR_A2_B1_LEARNING_STANDARD.md)); keerukus kasvab sujuvalt, ilma hüpeteta. | Olemasolev värav `quality.js` + inimene |
| J7 | Näited | Ülesande juures on näide või mustervastus, kui vorm on uus. | Inimene |
| J8 | Grammatika tähenduse ja funktsiooniga | Vormi õpetatakse koos sellega, mida see tähendab ja millal seda kasutatakse; grammatika on seotud tunni teema ja osaoskustega. | Inimene |
| J9 | Eesti ja maailm, väärtused | Teemad on nii Eesti- kui maailmakesksed, väärtustavad õppija päritolukultuuri ja on stereotüüpideta. | Inimene |
| J10 | Õppija tagasiside | Materjali hindavad ka seda katsetanud õppijad ja õpetajad, mitte ainult autor. | Inimene (CRM-is praegu tööriista pole) |

## Kuidas kasutada

- **Sisuagent ja autor:** enne partii PR-i loe see nimekiri läbi ja käivita audit. Uus partii ei tohi automaatsetes
  kriteeriumides olla halvem kui sama taseme senine tulemus.
- **Ülevaataja:** vaata „Inimene”-kriteeriumid vähemalt ühe tunni kolmel lehel moodulist.
- **Audit:** `cd crm-v2 && WRITE_MATERIAL_AUDIT=1 AUDIT_DATE=<kuupäev> AUDIT_COMMIT=<main sha> npx vitest run src/features/worksheet-generator/admin/course/materialAudit.test.js`
  kirjutab [`MATERIAL_QUALITY_AUDIT.md`](MATERIAL_QUALITY_AUDIT.md). Ilma `WRITE_MATERIAL_AUDIT`-ita test ainult
  kontrollib, et audit jookseb.
- **Kõva värav** jääb `admin/course/quality.js`-i. Automaatne kriteerium muudetakse väravaks ainult omaniku loal ja
  alles siis, kui senised lehed on parandatud.

## Tunniraam: kuidas lüngad täidetakse automaatselt (2026-10-11)

Iga koodis toodetud tund saab pärast autori lehti ühtse **tunniraami**
(`crm-v2/src/features/worksheet-generator/engine/lessonEnrichment.js`). Samm lisatakse ainult siis, kui tunnis seda
veel pole; midagi ei kustutata ja leht jääb `SHEET_MINUTES.max` (55 min) piiresse. Raami plokkide id algab `enr_`.

| Samm | Kriteerium | Mis lisatakse |
|---|---|---|
| Kuulamine | A1, A3 | `listening` tunni enda tekstist (lugemistekst, dialoog, olukord, näitelaused): 4–5 lauset, üks lünk lauses, `transcript` = laused. Harjutas, kui aega jätkub, muidu Avastas / Kasutas. Heli: konstruktoris „Loo heli” (TartuNLP Neurokõne) või õpetaja loeb. |
| Lugemine (A2) | A1 | Kui generaatori plaanis teksti polnud, saab Avasta profiili juhitud dialoogi (`generateTextbookLessonBundle`). |
| Paaristöö | A2 | Esimene rääkimisülesanne saab „Räägi paarilisega.”, muidu kirjutamine „loe oma tekst paarilisele ette”. |
| Häälestus | A5 | Avasta algab tunni teema ja paarilisega häälestusküsimusega, kui leht algas kohe ülesandega. |
| Enesehinnang | J5 | Lehele, kus pole `selfcheck` / `rubric`, etapi järgi 3 „Ma …” väidet. |
| Kiiremale | J4 | Kasuta viimasele vabale ülesandele tasemekohane lisarida („Kiiremale: …”). |
| Päriselus | K4 | Kasuta lõppu `planning` „Päriselus: tee see enne järgmist tundi.” tasemekohase päriseluülesandega. |
| Pilt | K2 | Tunnid ilma tellitud illustratsioonita saavad koodis joonistatud natüürmordi (`art/topicArt.js`, vt [`TEXTBOOK_ART_BIBLE.md`](TEXTBOOK_ART_BIBLE.md) §10). |

Rakendub: kursuse moodulid (`admin/course/registry.js` → `courseLessonSheets`), B1 moodul 1
(`admin/module1ThreePhase.js`) ja A2 generaator (`engine/generator.js` → `generateTextbookLessonBundle`, mida kasutavad
„Loo mustandid” ja A2 moodulite failid). Põhigeneraatori `generateLessonBundle` viie ülesande leping jääb samaks.
Kursuse värav `quality.js` mõõdab mitmekesisust ja naabrite sarnasust ainult autori ülesannetel (raam on igas tunnis sama).

Raam on miinimum, mitte asendus: sisuagent kirjutab parema kuulamisteksti, päris dialoogi või tellitud pildi, ja raami
samm jääb siis ise ära.
