# KeeleSepp AI — the ChatGPT worksheet connector („KeeleSepp AI töölehed”)

Owner 2026-10-26: the owner photographs the textbooks; worksheets are built by ChatGPT with **our constructor**.
Claude keeps the platform; ChatGPT fills sheets.

## How it works

- Cloud Function `sheetBuilderApi` (`functions/sheet-builder-api.js`), OpenAPI at
  `https://us-central1-keelesepp-5136b.cloudfunctions.net/sheetBuilderApi/openapi.json`.
- A Custom GPT („Configure → Actions”) calls it with its own key (`Authorization: Bearer kss_…`).
- Endpoints:
  - `GET /guide`: the rules, phases, block list and a sample sheet.
  - `GET /blocks/{type}`: one block's filled example (data shape, answer syntax).
  - `GET /textbooks`, `GET /textbooks/{id}`: the owner's books (functions/textbooks.json) — chapters, grammar, pages,
    the nearest course lessons and `license` (`granted` = Õpik 1:1 allowed; `unconfirmed` = topics and ideas only).
  - `GET /lessons?level=&q=`: course lessons (only `roadmapManaged` / `curriculumId`).
  - `GET /lessons/{id}?phase=`: goal, language focus, sheet states, and the current sheet to improve.
  - `POST /check`: the constructor's own checks (`analyzeWorksheet`). Nothing is saved.
  - `POST /drafts`: saves the sheet as the lesson sheet's **draft**.
- Saving a draft (`POST /drafts`) works like the constructor's `persist`:
  - writes a new version: `worksheetDoc` + `worksheetVersions/<lesson>_<phase>_studio_v<N>` + `worksheetPhases` summary;
  - `publishedWorksheetDoc` is kept, so students keep seeing the published sheet;
  - `contentOrigin: { kind: 'gpt-connector', author: 'KeeleSepp AI', keyLabel, note }`, `updatedBy: gpt:<key>` and the
    version's `createdByName: "KeeleSepp AI"` mark the author (owner 2026-10-26: „с пометкой KeeleSepp AI”). The lesson
    constructor shows a „KeeleSepp AI” banner on such a draft until it is published.
  - A person opens the editor link from the answer and presses „Avalda”.
- Phases: `discover` (Avasta), `practice` (Harjuta), `transfer` (Kasuta), `opik` (the textbook sheet, 1:1 with the
  book, see the Õpik decision).
- Checks: `functions/generated/sheet-kit.cjs` is the constructor's block registry + `quality.js`, bundled from
  `crm-v2/src/features/worksheet-studio/sheetKit.js`.
  - **After changing blocks or checks run `cd crm-v2 && npm run build:sheet-kit`.**
  - `sheetKit.test.js` fails when the bundle is stale.
  - Then deploy `functions:sheetBuilderApi`.
- Keys:
  - stored in `sheetBuilderKeys/{sha256}` (no client access: firestore.rules catch-all);
  - CRM „Seaded → KeeleSepp AI töölehed” (administrators) creates a key (shown once), lists and revokes keys;
  - a revoked key stops at once.
- A key can read the course lessons and their sheets and write sheet drafts — nothing else: no students, finance,
  publishing or deleting.

## Setting up the GPT (owner, once)

1. ChatGPT → Explore GPTs → Create → Configure. Name: **„KeeleSepp AI”**.
2. Instructions: paste the text below.
3. Actions → Create new action → Import from URL: the `openapi.json` address above.
4. Authentication → API Key → Auth type **Bearer** → paste the key from CRM „Seaded → KeeleSepp AI töölehed → Loo uus võti”.
5. Privacy policy (needed only to publish the GPT publicly): `https://www.epkoolitus.ee/privaatsus.html`. Keep the GPT
   **private** (Only me), since the key writes into the CRM.

### Instructions text for the GPT

```
Sa oled KeeleSepp AI — KeeleSepa töölehtede koostaja. Räägi omanikuga vene keeles; õppijale nähtav tekst töölehel on eesti keeles.

Töö käik:
1. Kutsu alguses getGuide ja järgi selle reegleid (rules) ja dokumendi kuju (documentShape). Iga ploki täpse kuju ja
   vastuste süntaksi saad getBlock(type) kaudu — kasuta ainult neid plokitüüpe.
2. Leia tund: listLessons(level, q). Vaata getLesson(id): eesmärk, keelefookus, olemasolevad lehed. Kui leht on juba
   olemas ja omanik palub parandada, võta getLesson(id, phase) worksheetDoc ja paranda seda, ära alusta nullist.
3. Kui omanik saadab õpiku fotod: vaata getTextbooks / getTextbook, millise peatüki ja kursuse tunniga need leheküljed
   seotud on, ja kas license on "granted". Loe lehekülg täpselt, ära mõtle reegleid ega harjutusi välja; käsitsi
   kirjutatud vastuseid fotol ära kopeeri. Õpiku leht (phase "opik")
   kordab õpiku reeglit ja harjutusi 1:1 meie plokkidena; Avasta/Harjuta/Kasuta kasutavad õpikut alusena, kuid järgivad
   kolme faasi reegleid.
4. Kontrolli alati checkSheet-iga. Paranda kõik errors ja error-tasemel issues; arvesta warnings ja tips.
5. Salvesta saveDraft(lessonId, phase, worksheetDoc, note). note = allikas (nt „Minu Eesti A2 lk 38–39”).
6. Anna omanikule editorUrl: tema vaatab lehe konstruktoris üle ja vajutab „Avalda”. Sina ei avalda kunagi.

Ära lisa pilte (image-väljad jäävad tühjaks), ära kasuta Markdowni õppija tekstis, ära kirjuta õigeid vastuseid
õppijale nähtavasse juhisesse.
```

## Checks

- `functions/sheet-builder-emulator.integration.js` covers keys, guide, lessons, the refusal of a bad sheet, a draft
  that keeps the published sheet, versions, and revoking. It runs in the financial-core-emulator workflow.
- `crm-v2/src/features/worksheet-studio/sheetKit.test.js` checks that the bundle is fresh and the sheets are normalised.
