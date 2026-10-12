# Ülesanne sisuagendile (Codex): pildid piltülesannete jaoks

Kuupäev: 2026-10-12 · tellija: omanik („можешь кодексу дать задание чтобы делал картинки”) · koostas: Claude (liidese agent)

## Miks

Omanik tahab töölehti nagu trükitud õpikulehed (Pinterest'i näited): sõnad ↔ pildid A–L, maja lõige numbritega,
tegelaskaardid, „pilt + olukord + küsimus”. Konstruktoris on nüüd neli uut plokki (PR „picture blocks + compact”,
`crm-v2/src/features/worksheet-studio/engine/blocks/picture.jsx`), aga **ühelgi kursuse 885 lehel pole ühtki pilti**.
Sinu töö: pildid ja nende lähteülesanded.

## Kohustuslik lugemine

1. `AGENTS.md` (sisuagendi osa) — lubatud failid, harud, max 2–3 PR-i korraga.
2. `docs/TEXTBOOK_ART_BIBLE.md` — stiil (must joon, valge, üks laimiroheline aktsent), püsitegelased, pildi lähteülesanne,
   genereerimise juhis (**ChatGPT / Codexi sisseehitatud pildiloome, mitte tasuline API**), failide asukoht, aktsepteerimine.
3. `docs/TEXTBOOK_VISUAL_STYLE.md` — igal pildil on õppeülesanne, mitte kaunistus.

## Mida teha (järjekorras)

### 1. Tegelaste portreed (plokk „Tegelaskaardid”, `profiles`)

- 6 püsitegelast (Anna, Markus, Liis, Viktor, Sofia, Jaan), igaüks 1:1, pea ja õlad, valge taust.
- Fail: `crm-v2/public/textbook-art/cast/<nimi-väikeste-tähtedega>.webp`, 800 × 800 px, ≤ 60 KB.
- Lähteülesanded: `crm-v2/src/features/worksheet-generator/art/cast.js` (`export default [{ id: 'anna', name: 'Anna', alt, … }]`).
- **Omanik kinnitab esimese portree enne ülejäänuid.**

### 2. Sõnapildid (plokid „Sõnad ja pildid (A–L)” `picmatch` ja „Pildid” `pictures`, režiim „Kirjuta sõna pildi alla”)

- Üks ese / koht / tegevus pildil, 1:1, sama stiil, ilma tekstita.
- Alusta A2 moodulite 1–10 põhisõnavarast (`production/a2ModuleNN.js` → `*_CORE_VOCABULARY`, ~16 sõna moodulis):
  ainult sõnad, mida saab joonistada (nimisõnad, kohad, tegevused). Siis B1 moodulid 2–15.
- Fail: `crm-v2/public/textbook-art/words/<tase>/<sõna-ascii>.webp` (nt `words/a2/kook.webp` sõnale „köök”), 800 × 800 px, ≤ 60 KB.
- Nimekiri: `crm-v2/src/features/worksheet-generator/art/words/<tase>.js` —
  `export default [{ id: 'kook', word: 'köök', src: '/textbook-art/words/a2/kook.webp', alt: 'Köök: pliit, kraanikauss ja kapid.', lessonIds: ['a2-016'] }]`.

### 3. Märgistatavad stseenid (plokk „Märgi pildile”, `scenelabel`)

- Üks stseen mooduli kohta, 3:2, kus 6–10 eset on selgelt eraldi ja hästi nähtavad (maja lõige, köök, linnatänav,
  kohvik, arsti juures, rongijaam …). Pildil **pole numbreid ega teksti** — numbrid paneb plokk ise.
- Lähteülesandes lisaks `pins: [{ x, y, answer }]` (asukoht protsentides vasakult ja ülevalt, õige sõna).
- Fail ja lähteülesanne nagu piiblis §8 (`<lessonId>-<faas>-<n>`; `format: 'scene'`).

### 4. Olukorrapildid (plokk „Pilt ja olukord”, `picrows`)

- 4:3 väikesed stseenid ühe selge tegevusega, mis tekitavad küsimuse „miks?” / „mis edasi?” (nt Anna ostab kümme
  vihmavarju). Tase B1 ja kõrgemal: järeldamine ja põhjendamine.

### 5. Pildid lehtedele (pärast seda, kui PR „picture blocks + compact” on `main`-is)

- Lisa igasse tundi, kus see on õppeliselt mõistlik, üks piltülesanne (mitte kaunistus). Plokkide andmed:
  - `picmatch`: `{ title, instruction, columns: '4', aspect: '1:1', items: [{ word, img: { src } }] }` — 6–12 sõna;
  - `scenelabel`: `{ title, instruction, img: { src }, aspect: '3:2', bank: 'sõnad komaga + 1–2 segajat', showBank: 'yes', columns: '2', pins: [{ x, y, answer }] }`;
  - `profiles`: `{ title, instruction, columns: '3', people: [{ img: { src }, name, facts: 'rida\nrida', sentences: 'Anna [on] 28 aastat vana.' }] }`;
  - `picrows`: `{ title, instruction, lines: '2', rows: [{ img: { src }, text, question }] }`.
- Kursuse moodulites (`admin/course/<tase>/moduleNN.js`) lisa `blocks.js` abifunktsioonid uutele plokkidele.
- Pärast lisamist: `cd crm-v2 && npx vitest run src/features/worksheet-generator` ja kvaliteedi baas
  (`UPDATE_QUALITY_BASELINE=1 …`, kui see on `main`-is).

## Ära tee

- Tasuline pildi-API, varupildid, vesimärgid, päris inimeste näod — keelatud (piibel §8, AGENTS.md).
- Tekst pildil ainult siis, kui see on õppesisu (silt, hinnakiri), lühike ja eesti keeles.
- Liidese, CSS-i ja plokkide koodi ei muuda; vajadus kirjelda PR-is.

## Valmis, kui

- Iga fail on oma kohas, ≤ suuruse piiri, olemas `alt`; test kontrollib, et iga nimekirja kirje fail on olemas
  (laienda `art/textbookArt.test.js` või lisa `art/words.test.js`).
- Omanik on kinnitanud iga liigi esimese pildi.
- `docs/PROJECT_STATE.md` kirje: mitu pilti, millised moodulid, mis on veel tegemata.
