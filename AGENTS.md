# KeeleSepp — juhised agentidele

See fail on kohustuslik lähtepunkt igale inimesele või AI-agendile, kes muudab KeeleSepa CRM-i.

## Enne töö alustamist

1. Kontrolli GitHubis värsket `main` haru ja kõiki avatud pull request'e. Vestlus, vana lokaalne koopia või kuupäevaga handoff ei ole autoriteetne hetkeseis.
2. Loe `docs/PROJECT_STATE.md`, `ARCHITECTURE.md` ja ülesandega seotud eridokumentatsioon.
3. Kontrolli tööpuud ning ära kirjuta üle teise haru või avatud PR-i tööd.
4. Sõnasta üks piiratud tulemus, lubatud failid, keelatud kõrvalmuudatused ja kontrollid.

## Ohutuspiirid

- Kasuta tavaliselt haru `agent/<lühike-nimi>` ja ava draft-PR.
- Agent ei ühenda PR-i ise.
- Ära tee production-deploy'd, production-andmebaasi migratsiooni, destruktiivset andmemuudatust ega tasulist väliskutset ilma omaniku konkreetse loata.
- Säilita olemasolevad muutumatud ID-d, auditijälg ja ajalooliste finants- ning õppeandmete tähendus.
- Ära ühenda samasse PR-i omavahel sõltumatuid kalendri-, finantsi-, Live Classroomi ja õppesisu muudatusi.

## Sisuagent (õppematerjalide tootmine)

Agent, kes loob õppetundide sisu (Avasta / Harjuta / Kasuta töölehed, sisupaketid, sõnavara), töötab ainult sisu
tsoonis. Liides ja arhitektuur on teise agendi töö.

Kohustuslik lugemine enne iga partiid, et töölehtede tase ei langeks:

1. `docs/CEFR_A2_B1_LEARNING_STANDARD.md` — tasemete progressioon (levelStage), kolme faasi nõuded, sõnavara
   kordamise reeglid, lugemise ja kontrollitud harjutuse raskus, mooduli grammatikatelg. Normatiivne.
2. `docs/TEXTBOOK_A2_C1_MASTER_PLAN.md` — mis kuulub täielikku moodulisse ja tunnipaketti; õpik kui väljund.
3. `docs/TEXTBOOK_VISUAL_STYLE.md` — visuaalne leping (foto / illustratsioon / skeem, lehe kujundus).
4. `docs/LESSON_SCENE_STANDARD.md` — stseenid ja pildid: eesmärgiga, mitte dekoratsioon.
5. `docs/WORKSHEET_GENERATOR_V1.md` ja `docs/GENERATOR_LEXICON.md` — generaator ja sõnavormid ilma AI-ta.
6. Taseme õppekava: `docs/A2_CURRICULUM_100.md` (A2), B1 õpitee `data/keelesepp-a2-b1-roadmap.json`,
   `docs/C1_CURRICULUM_240.md` (C1).

Lubatud failid: `crm-v2/src/features/worksheet-generator/production/*`, `factory/contentLibrary.js`,
`factory/factory.js` (pakettide märksõnad), `fixtures/*` ja nende testid; käsitsi töölehed CRM-is aadressil
`/library/lessons/<ID>/worksheets/<discover|practice|transfer>` („✎ Muuda lehte” → „Salvesta” → „Avalda”).

Keelatud: liides (Õppevara, konstruktor, kalender, finants, menüü), `routes.jsx`, `services/firebase/*`,
`firestore.rules`, `functions/*`, CSS; production-andmebaasi skriptiga kirjutamine või kustutamine; deploy;
B1 Harjuta/Kasuta ilma omaniku loata. Vajadus liidese järele kirjelda PR-is.

Töövoog: iga partii eraldi haru `agent/<nimi>` värskest `main`-ist, PR-ide virnas korraga kõige rohkem 2–3; enne
PR-i `cd crm-v2 && npx vitest run src/features/worksheet-generator` ilma vigadeta; üks lühike kirje
`docs/PROJECT_STATE.md`-s (konflikti korral jäta mõlemad kirjed).

## Dokumentatsioon on Definition of Done osa

Ülesanne ei ole valmis enne, kui teine agent saab jätkata ainult repositooriumi põhjal, ilma eelmist vestlust lugemata.

Iga sisulise muudatuse lõpus uuenda `docs/PROJECT_STATE.md` ja märgi vähemalt:

- viimati kontrollitud `main` commit ja kuupäev;
- aktiivne haru ning PR;
- eesmärk ja tegelikult valminud töö;
- muudetud failid, andmeobjektid, reeglid ja avalikud lepingud;
- käivitatud kontrollid koos täpse tulemusega;
- teadaolevad piirangud, riskid ja käsitsi väravad;
- lõpetamata töö;
- täpselt üks järgmine ohutu samm.

Kui muutub arhitektuur, andmeskeem, töövoog või pedagoogiline leping, uuenda ka vastavat eridokumenti. Adaptiivsete tundide puhul on selleks `docs/ADAPTIVE_LESSON_SYSTEM.md`.

Kuupäevaga `HANDOFF_*.md` failid on ajalooline arhiiv. Hetkeseisu allikas on alati `docs/PROJECT_STATE.md` koos värske GitHubi `main` haruga.

## Kohustuslik lõpetamisaruanne

PR-i või tööetapi aruandes esita:

1. tulemus;
2. muudetud failid;
3. testid ja muud kontrollid;
4. andme- ning turvariskid;
5. production'i või väliste teenuste kasutus;
6. PR-i olek;
7. järgmine ohutu samm.

Ära väida, et test, deploy või migratsioon õnnestus, kui seda tegelikult ei käivitatud ja kontrollitud.
