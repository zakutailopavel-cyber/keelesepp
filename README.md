# KeeleSepp — veebisait

Avalik sait +  CRM süsteem.

- `/` → Avalik koduleht
- `/haldus/` → CRM (õpetaja + õpilase kabinet)
- `/haldus-exercises/` → Õppevara (raamatukogu, õppekavad, ülesanded ja töölehtede loomine)
- `/live-classroom/` → Live Classroom (õpetaja privaatne töölaud + õpilase avalik õppestseen)

## Kalender

CRM-i tunniplaanil on kuu-, nädala- ja päevavaade. Päevavaade kasutab 15-minutilist ajaskaalat
ning näitab tunni tegelikku kestust; samal ajal toimuvad eri õpetajate tunnid paiknevad kõrvuti.
Uue tunni loomisel seotakse kirje õpilase muutumatu ID-ga ning õpetaja või õpilase kattuv aeg
blokeeritakse.

Google Calendar ühendus impordib sündmusi KeeleSeppa kord tunnis. Uue kirjutamisloa kinnitanud
ühendus sünkroonib ka KeeleSepas loodud, teisaldatud, taastatud ja tühistatud individuaaltunnid
õpetaja enda põhikalendrisse. Varem ühendatud kontod jäävad turvaliselt režiimi
`Google → KeeleSepp`, kuni õpetaja kinnitab liideses ühekordse lisaloa.

KeeleSepa loodud Google'i sündmused kannavad privaatset päritolu-ID-d. Server võrdleb
sünkroonimisel ka sündmuse sisulist sõrmejälge, et sama muudatus ei liiguks lõputult kahe
süsteemi vahel. Edasilükatud kustutused jäävad serveripoolsesse järjekorda; OAuthi võtmeid ega
järjekorda brauser lugeda ei saa. Praegune konfliktipoliitika on viimase sünkroonitud muudatuse
võit; eraldi konfliktide kinnitamise vaade jääb järgmisse kalendriversiooni.

Korduva tunni avamisel saab õpetaja valida **Ainult see tund** või **Kogu sari**. Ühe tunni
ümbertõstmisel või tühistamisel jääb sarja mall muutmata: algne kuupäev lisatakse sarja
eranditesse ning konkreetne tund salvestatakse eraldi õpilasega seotud kirjena. Google
Calendar saab sarja `EXDATE` erandi ja vajadusel uue ühekordse sündmuse. Erandi kustutamisel
taastatakse sarja algne tund.

Kui õpetaja tõstab või tühistab ühe KeeleSepa sarja tunni otse Google Calendaris, impordib
käsitsi või tunnine sünkroonimine ainult selle erandi eraldi kirjena. Algne sarjakuupäev ja
õpilase muutumatu ID säilivad ning Google'is taastatud üksiktund eemaldab erandi KeeleSepast.

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

## Tööaeg ja juhi abi

KeeleSepp loendab õpetaja või administraatori aktiivset aega automaatselt CRM-is, õppevara
raamatukogus, kalendris, töölehe koostajas, oskuste kaardil ja Live Classroomis. Aega lisatakse
ainult siis, kui aken on nähtav, brauser fookuses ja kasutaja pole olnud üle viie minuti
tegevuseta. Klahve, hiire asukohta, ekraanipilti ega avatud andmete sisu ei salvestata.

Brauser saadab ainult kohaloleku südamelöögi; kestuse arvutab server enda kella järgi. Ühine
serveripoolne kohalolekuviit väldib mitme avatud vahekaardi aja topeltarvestust. Päeva koond
salvestatakse `staffProgramDays` kogusse ning palgaprognoos arvutatakse selle aktiivse aja ja
töötaja kehtiva tunnitasu järgi.

Töötaja võib lisaks alustada ja lõpetada tööpäeva CRM-i vaates **Tööaeg**. See käsitsi kinnitatav
tabell jääb tööpäeva märkuse, pausi ja administraatori kinnituse jaoks, kuid põhivaates kuvatakse
esimesena automaatselt mõõdetud aeg programmis.

Enne automaatse loenduse käivitamist, s.o enne 29.07.2026, saab vaade taastada eraldi
**ajaloolise hinnangu** olemasolevatest `activityLog` kirjetest. Kuni 15-minutilised tegevuste
vahed ühendatakse ning iga eraldiseisev tööblokk saab konservatiivse 5-minutilise algväärtuse.
Vaade näitab hinnangut päeva, töötaja, logikirjete arvu ja kindlustaseme kaupa. Hinnangut ei
kirjutata `staffProgramDays` täpse aja hulka ega käsitleta automaatselt kinnitatud palga alusena.

Tööpäeva loomine, lõpetamine, parandamine, kinnitamine, tagasilükkamine ja tunnitasu muutmine
käivad Cloud Functioni kaudu ning kirjutavad eraldi muutmatu auditi. Brauseril ei ole
`workSessions`, `workSessionOpen`, `workTimeAudit`, `staffProgramDays` ega
`staffProgramPresence` kogudesse kirjutamisõigust.

Vaade **Juhi abi** koondab tasumata tähtaja ületanud arved, hilinenud ülesanded, liiga kaua
avatud tööpäevad ja Google Calendari sünkroonimisvead. Sama reeglipõhine kontroll käivitub
serveris iga tund ja seda saab administraator ka käsitsi värskendada. Esimene versioon ei saada
kooli andmeid ühelegi välisele tehisintellekti API-le.

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

Tunni lõpetamisel lisab õpetaja kohustusliku kokkuvõtte, saavutatud eesmärgid ja soovi korral
järgmise kodutöö. Lõpetamine salvestab tunni kokkuvõtte, muutmatu lõpusündmuse ja kodutöö ühe
Firestore tehinguna. Tund jääb seotuks muutumatu õpilase ID-ga ning ilmub nii õpetaja
õpilasekaardile kui ka õpilase isiklikku kabinetti. Enne kokkuvõtete kasutuselevõttu lõpetatud
tunnid jäävad nähtavaks eraldi pärandolekuga.

Uue tunni lõpetamisel saab õpetaja valida saavutatud eesmärgid otse õpilase taseme õppekavast.
Eesmärgi stabiilne ID, nähtav nimetus ja seotud oskused jäävad tunni muutmatusse kokkuvõttesse.
Sama tehing tõstab kinnitatud oskused õpilase olemasolevas oskuste kaardis vähemalt 80%-ni,
ilma kõrgemat tulemust vähendamata. Vana v1 kokkuvõttevorming jääb reeglites loetavaks.

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
