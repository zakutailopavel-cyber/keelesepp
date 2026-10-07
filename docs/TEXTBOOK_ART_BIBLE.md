# KeeleSepp textbook art bible

Status: active visual contract (owner choice 2026-10-07)
Extends: `docs/TEXTBOOK_VISUAL_STYLE.md` (purpose rules, level progression, visual QA gate stay in force).
Applies to: every illustration in Avasta / Harjuta / Kasuta sheets and in Õpik.

## 1. The style in one sentence

Modern flat line-art: confident black outline, white figures, **one lime accent**, a soft lime blob behind the scene,
simple plants and floating objects (books, papers, icons) around it — friendly, adult, uncluttered.

Reference the owner picked: Pinterest-style "girl reading on a stack of books" line illustration (black line, white
fill, lime clothing and blob, grey secondary books, leafy plants at the base).

## 2. Palette (fixed)

| Role | Colour | Use |
|---|---|---|
| Line | `#1E1E1E` | all outlines, hair, dark trousers, screens |
| Paper | `#FFFFFF` | skin, most surfaces (skin is never coloured) |
| Accent | `#C9F03D` (lime) | ONE focus per image: the key person's clothing, the key object, leaves |
| Blob | `#E8F9B0` (pale lime) | one organic background shape behind the scene |
| Secondary | `#D9D9D9` (light grey) | second-level objects, other people's clothes |

No other colours, no gradients, no shading, no textures, no photographic detail. Text inside the image only when it is
the learning content (a timetable, a sign, a price tag) and then short, Estonian, legible.

## 3. Drawing rules

- Line weight uniform and bold (≈ 3 px at 1600 px width); rounded line caps.
- Adult proportions (not chibi, not children); simple faces: dot or closed-arc eyes, small nose line, short mouth line;
  glasses, beards, hats, headphones as identity marks.
- One clear action per person. The accent colour marks **what the task is about** (who has the problem, which object
  matters).
- Composition: blob centred behind the action; 2–3 small floating objects linked to the topic; a few leafy plants or
  a ground line at the base; generous white margin.
- Landscape 3:2 for scenes, square 1:1 for single objects/people, portrait 2:3 only for full-page openers.
- Background white (no transparent PNG halos); export WebP or PNG.

## 4. Recurring cast (same look in every lesson)

| Name | Age | Look (always) | Typical role |
|---|---|---|---|
| **Anna** | 28 | long dark hair, round glasses, lime top | main learner, new in Tallinn, office job |
| **Markus** | 34 | short hair, beard, work jacket | warehouse worker, practical problems |
| **Liis** | 45 | bob haircut, cardigan, lanyard | teacher / official / service desk |
| **Viktor** | 63 | hat, moustache, coat, walking stick optional | neighbour, older generation, pensioner |
| **Sofia** | 19 | ponytail, hoodie, backpack, headphones | student, young speaker, social media |
| **Jaan** | 38 | curly hair, apron or sweater, dog (Muki) | café owner / neighbour / father |

Rules: the cast returns across modules (lexical/visual recycling). A new extra person is drawn plainly in grey.
Names, ages and looks never change; clothes may change by situation but keep the identity mark.

## 5. Every image needs a learning job (from TEXTBOOK_VISUAL_STYLE §3)

Each visual brief states the task the image serves: describe, compare, infer, choose, sequence, plan, explain,
argue, solve. "Decorative" is not a job. Comic use (speech bubbles, a humorous twist) is allowed when the task uses it
("write what Viktor says"); empty bubbles are drawn empty.

## 6. Visual brief (written by the content agent)

Every sheet that needs a picture gets a brief in its content pack / production file:

```js
visuals: [{
  id: 'a2-036-avasta-1',            // <lessonId>-<phase>-<n>
  phase: 'discover',                // discover | practice | transfer
  format: 'scene',                  // scene (3:2) | object (1:1) | opener (2:3)
  cast: ['Anna', 'Viktor'],
  scene: 'Bus stop in Tallinn city centre at noon; timetable "Buss 5 · 12:10 · +15 min"; Anna calls work, Viktor checks his watch.',
  accent: "Anna's top and the timetable frame",
  text: ['Buss 5 · 12:10 · +15 min'],  // exact words that appear in the picture, or []
  learningJob: 'infer the problem and say what each person does',
  alt: 'Bussipeatus: buss hilineb 15 minutit, Anna helistab, Viktor vaatab kella.',
  caption: 'Pilt 1. Kesklinna bussipeatus kell 12.10.',
}]
```

## 7. Generation prompt (ChatGPT / Codex built-in image generation — no paid API)

Use the master prompt + the brief. Generate the cast sheet first (§4, one image with all six characters) and attach it
to every later request so faces stay the same.

```
Flat modern line-art illustration for an adult Estonian language textbook.
Style: bold uniform black outlines (#1E1E1E), white fills, white skin, ONE lime accent colour (#C9F03D) used only on
{accent}, one soft pale-lime organic blob (#E8F9B0) behind the scene, light grey (#D9D9D9) for secondary objects,
a few simple leafy plants and 2–3 small floating topic objects, generous white margin, no gradients, no shading,
no texture, no other colours. Adult proportions, simple friendly faces.
Characters (keep exactly as in the attached cast sheet): {cast descriptions}.
Scene: {scene}. Text in the image, exactly and only: {text}.
Format: {3:2 landscape | 1:1 square | 2:3 portrait}, white background.
```

## 8. Files and where they go

- Path: `crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp` (e.g. `a2/a2-036/a2-036-avasta-1.webp`);
  the sheet's image block uses `src: '/textbook-art/a2/a2-036/a2-036-avasta-1.webp'`, `alt` and `caption` from the brief.
- Size: longest side 1600 px, WebP quality ≈ 80, **≤ 150 KB** (line art compresses well).
- When a file cannot be committed (image made in a chat), upload it in the CRM constructor image block instead
  (Firebase Storage) and note the brief id in the caption field until the repo copy exists.
- Never commit stock photos, watermarked images or images of real identifiable people.

## 9. Acceptance (visual QA, extends TEXTBOOK_VISUAL_STYLE §8)

An image is accepted only if: palette matches §2 exactly (one accent), cast identity matches §4, the brief's text is
spelled exactly, the learning job is visible, no extra text/watermark/signature, line weight consistent with the
module's other images, size/path per §8. The owner approves the first image of every module before the rest.
