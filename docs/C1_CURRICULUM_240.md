# C1 õppekava 240 akadeemilist tundi

## Eesmärk ja ulatus

KeeleSepa C1 õppekava on õpetaja töövahend vaates `Õppevara → Õppekavad → Eesti keel → C1`. Kursus sisaldab 240 akadeemilist tundi: 200 tundi kontaktõpet ja 40 tundi iseseisvat tööd. Kontaktõpe koosneb 100 järjestikusest kahetunnisest õppetunnist kümnes moodulis.

Õppekava lähteallikas on `KeeleSepp_C1_oppekava_240ak_tundi.docx`, versioon 21.09.2026. Repositooriumi skript `scripts/extract-c1-curriculum.py` loeb dokumendist moodulid, tunni pealkirjad, tüübid, fookused ja töölehepromtid ning väljastab ühe manifesti ja kümme moodulifaili kausta `data/`.

## Andmeleping

Manifest `data/keelesepp-c1-curriculum.json` määrab kursuse identiteedi, mahu ja moodulifailid. Iga tund sisaldab vähemalt järgmisi välju:

- stabiilne `id` ja `sourceKey`;
- järjestusnumber ja pealkiri;
- liik `theme`, `grammar` või `assessment`;
- kasutajale nähtav liik `Teema`, `Grammatika` või `Kontroll`;
- DOCX-ist pärinev fookus;
- tunni oma täielik tööleheprompt;
- kontaktõppe maht kaks akadeemilist tundi.

Kohustuslikud tervikkontrollid on 10 moodulit, 100 järjestikust tundi, 70 teematundi, 20 eraldiseisvat grammatikatundi ja 10 progressikontrolli. Iga moodul sisaldab seitset teematundi, kahte grammatikatundi ja üht progressikontrolli. Grammatikatundide sõnavara on neutraalne või segatud ning neid ei seota mooduli leksikaalse teemaga.

## Kasutajavoog

Kui õpetaja avab C1 taseme ja C1 kirjeid pole veel täielikult paigaldatud, suunab olemasolev `CurriculumView` ühe korra lehele `/haldus-c1-curriculum/`. Leht kontrollib õpetaja või administraatori õigust, valideerib kursuse koguarvud ja kirjutab 100 stabiilse ID-ga kirjet olemasolevasse `curriculumLessons` kollektsiooni. Korduv käivitamine kasutab `merge` kirjutust ja ei loo duplikaate.

Tunni kaardil ja avatud tunni vaates on nähtavad tunni liik, eesmärk, fookus ja täielik prompt. Õpetaja saab prompti kopeerida või valida `Kasuta prompti`. Viimane täidab olemasoleva `ws_prefill` lepingu ja avab `/haldus-worksheet/` AI vaate. C1 jaoks ei ole eraldi generaatorit ega uut püsikihti.

## Ohutus ja piirangud

Import ei muuda B1 ega B2 kirjeid, õpilasi, tunniplaani, CRM-i ega finantsandmeid. See ei loo õppija edenemist ega loe programmi avamist läbimiseks. Õppetunni tööleht jääb tavapärase õpetaja ülevaatuse ja salvestamise töövoo alla.

DOCX ei kuulu runtime'i sõltuvuste hulka. Andmefailide taastootmiseks peab arendajal olema sama lähtefail ning bundled Python runtime koos `python-docx` teegiga.
