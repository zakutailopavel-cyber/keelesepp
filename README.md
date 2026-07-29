# KeeleSepp — veebisait

Avalik sait +  CRM süsteem.

- `/` → Avalik koduleht
- `/haldus/` → CRM (õpetaja + õpilase kabinet)
- `/haldus-exercises/` → Õppevara (raamatukogu, õppekavad, ülesanded ja töölehtede loomine)
- `/live-classroom/` → Live Classroom (õpetaja privaatne töölaud + õpilase avalik õppestseen)

## Õppevara

Õpetaja näeb ühes raamatukogus olemasolevaid tunnikavasid, töölehti, harjutusi,
kodutöid, materjale ja kontrolltöid. Raamatukogu avaneb kaustadena:
aine → tase, klass või vanuserühm → õppekava või teema → materjalid. Otsing töötab
nii kogu raamatukogus kui ka avatud kausta sees. Puuduvate metaandmetega vanad
kirjed jäävad nähtavaks eraldi määramata kaustades.

Avatud kaust salvestatakse aadressi, seega lehe värskendamine ning brauseri tagasi- ja
edasi-nupud taastavad sama aine, taseme ja teema. Uued seosed kasutavad võimalusel
muutumatut `curriculumId` väärtust; vanad kirjed töötavad edasi teema nime alusel.

Interaktiivne tööleht määratakse õpilase töölehtede kabinetti. Harjutus või tavaline
materjal lisatakse kodutööna. Harjutuse lõpetamisel salvestatakse tulemus õpetajale
ja seotud kodutöö märgitakse tehtuks.

## Live Classroom

Esimene piiratud versioon võimaldab õpetajal luua ühe õpilasega tunni, avaldada juhiseid ja
interaktiivseid ülesandeid ning jagada teadlikult valitud brauseri vahekaarti või rakenduse akent.
Õpilane ei näe CRM-i, õpetaja märkmeid ega teisi õpilasi.

Klassiruum näitab õpetajale ja õpilasele teise osaleja kohalolekut. Interaktiivne ülesanne avaneb
õpilase avalikul laval eraldi ülesandeaknas ning vastus ilmub õpetaja vaates reaalajas.
Õpetaja saab materjali saata aktiivsesse enda klassiruumi otse õppevara kaardilt. Avalikule
lavale jõuab ainult piiratud õppestseen, mitte vastusevõti ega kogu materjali lähteandmed.

Lõpetatud Live Classroomi tunnid kuvatakse õpetajale õppevara vahekaardil **Tundide ajalugu**.
Iga uus avaldatud õppestseen salvestatakse muutmatu versioonina ning seotakse sama versiooni
õpilase vastustega. Vanad klassiruumid jäävad nähtavaks kuupäeva, osalejate ja kestusega ka siis,
kui nende detailne stseeniajalugu loodi enne selle funktsiooni kasutuselevõttu.

Enne laiemat kasutuselevõttu vajab ekraanijagamine TURN-serverit ja
kahe kasutajaga prooviperioodi eri võrkudes. Arenduse etapid ja turvapiirid on kirjeldatud failis
`NEXT_RELEASE_ROADMAP.md`.

Tehnilised piirid ja järkjärguline eraldamise plaan on failis `ARCHITECTURE.md`.

## Arendus

```bash
# Installi Vercel CLI
npm i -g vercel

# Käivita lokaalselt
vercel dev

# Deploi
vercel --prod
```

## Firestore reeglite avaldamine

Vercel avaldab veebiliidese, kuid ei avalda Firestore reegleid. Kui `firestore.rules` muutub,
tuleb pärast kontrollitud ühendamist avaldada ainult reeglid:

```bash
firebase deploy --only firestore:rules --project keelesepp-5136b
```

Kontrolli enne tootmiskeskkonna proovimist, et käsu lõpus kuvatakse
`released rules firestore.rules to cloud.firestore`.

Kui veebiversioon hakkab kasutama uut Firestore kollektsiooni, avalda kontrollitud lisavad
reeglid enne veebiversiooni ühendamist. Nii ei teki väljalaske ajal hetke, mil uus liides on
avatud, kuid vajalik kirjutus on veel keelatud.
