# Isiklik tööleht õpilase profiilist

## Olemasolev töövoog

- Ühised töölehed elavad `curriculumLessons` kogus. Õpetaja avaldab lehe konstruktoris ja määrab selle Õppevara kaudu ühele või mitmele õpilasele.
- Iga määramine loob õpilase `studentId`-ga eraldi `worksheetAssignments` dokumendi ja salvestab sinna töölehe hetktõmmise. Õpilane vastab sellele dokumendile; profiili „Tööd” näitab määratud, pooleli ja esitatud töid ning õpetaja tagasisidet.

## Isiklik tööleht

- Õpetaja alustab õpilase profiili nupust „Koosta tööleht” või „Tööd” vahekaardilt. Avaneb sama töölehe konstruktor.
- Salvestamine loob `studentWorksheetDrafts` dokumendi, mille `studentId` määratakse profiili järgi. Mustand on nähtav ainult töötajatele ja selle saab profiili „Tööd” vahekaardilt uuesti avada.
- „Määra õpilasele” avaldab ainult selle õpilase `worksheetAssignments` dokumendi. Isikliku lehe lähteandmeid ei kirjutata `curriculumLessons` kogusse ja seda ei lisata ühisesse Õppevarasse. Konstruktoris puuduvad kopeerimine, ühine plokimall ja mitmele õpilasele määramise nupp.
- Vastused, staatus, esitamine ja tagasiside kasutavad olemasolevat määramisteekonda. Avaldatud lehe hilisem muutmine ei asenda õpilase alustatud või esitatud tööd.
- Firestore reeglid keelavad õpilase ja lapsevanema juurdepääsu mustanditele; avaldatud määramist saab lugeda ainult selle õpilasega seotud konto või töötaja. Isikliku lehe üles laaditud pildid ja heli asuvad õpilasepõhises Storage kaustas.

## Väljalaske järjekord

Uued Firestore ja Storage reeglid tuleb avaldada koos rakenduse muudatusega. Seni kuvab profiil mustandite laadimisvea ning isiklikku töölehte ei saa salvestada. Seda haru ei ole liidetud ega avaldatud; päris õpilaste andmeid ei ole muudetud.
