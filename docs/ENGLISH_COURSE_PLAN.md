# KeeleSepp English: A1 → B1 (plan)

Owner request 2026-10-21: build an English course.

Owner decisions:
- by CEFR level, A1 → B1;
- task instructions in English, with a short Russian hint for hard rules on A1–A2;
- start with A2, module 1.

Today the school has 6 English learners: grades 6–8, A1–A2, teachers Anhelina Korotka, Yelyzaveta Lukiianchuk and
Jegor Fjodorov.

## Target: the Estonian basic school English exam (B1)

Source: Harno, „Lisa 8 Põhikooli inglise keele lõpueksami eristuskiri 26/27 õa” (projektid.edu.ee, Põhikooli
lõpueksamite materjalid 2027).

| Part | Time | Points | Tasks |
|-|-|-|-|
| Listening | written part, 105 min in total | 30 | 5 |
| Reading (≈1500 words of text in all) | | 40 | 6 |
| Writing | | 28 | 2 |
| Speaking | 20 min | 28 | 5 |

The tasks behind these numbers:
- **Listening** (each text played twice): multiple choice from 3 options, gap completion, matching.
- **Reading:**
  - multiple choice from 3 options;
  - matching headings or statements to paragraphs;
  - inserting removed sentences into the text;
  - a gap text with a word bank;
  - a gap text where the pupil forms the right word form.
- **Writing:**
  - a message, notice, report or description (100 words);
  - a description (100 words);
  - a blog post or article (120 words);
  - a personal letter or e-mail (120 words).
- **Speaking:** reading aloud, answering questions, describing a picture, forming questions, a voice message.

Vocabulary and grammar follow English Vocabulary Profile, English Grammar Profile and the British Council –
EAQUALS Core Inventory. Topics follow the national curriculum's foreign-language A topic areas: me and others; home,
my place and Estonia; school and work; free time; countries and cultures; daily life.

## Course shape

- **Levels:** A1 (40 lessons), A2 (50 lessons), B1 (50 lessons). Each level has modules of 5 lessons, and lesson 5 is a
  check in the exam's task types at that level.
- **Phases:** each lesson has Avasta / Harjuta / Kasuta sheets, like the Estonian courses.
- **Language:** instructions are in English. On A1–A2 a tip block gives the rule in one or two Russian sentences.
- **Teacher's key:** every task has an explanation (Õpetaja võti, in Russian for the teachers).
- **In the CRM:** subject „Inglise keel”, level „English A1 / A2 / B1”. Õppevara shows them as their own level chips,
  separate from the Estonian A2/B1, and the didactic norms read them as A1/A2/B1.

### A2 modules (draft)

1. **Me and my world:** present simple, adverbs of frequency, present continuous, describing people.
2. **Home and my town:** there is / are, prepositions of place, directions, comparatives.
3. **School and learning:** can / have to, past simple (regular), school subjects, timetables.
4. **Free time:** past simple (irregular), likes and dislikes + -ing, sports and hobbies.
5. **Food and health:** countable / uncountable, some / any, much / many, giving advice with should.
6. **Travel and holidays:** going to, future plans, transport, booking, postcards and e-mails.
7. **People and places:** superlatives, describing places, countries and cultures.
8. **Shopping and money:** prices, too / enough, comparing products, complaints.
9. **Media and technology:** present perfect (ever / never), online safety, short messages.
10. **A2 exam practice:** a full mock in the exam's task types.

### B1 modules (draft)

B1 is the level of the basic school exam itself. Tasks have 10 items, reading texts are 200–400 words, writing follows
the exam (an e-mail of 100–120 words and a short message of 40–60 words), speaking turns are about two minutes.

1. **People around me:** present simple / continuous and stative verbs, question forms, personality, adjective +
   preposition, -ed / -ing, relationship phrasal verbs, indirect questions and polite requests.
2. **Life stories:** past simple and past continuous, used to, time linkers, telling a story.
3. **Experiences:** present perfect (ever / never, just / already / yet, for / since) vs past simple.
4. **Plans and the future:** will, going to, present continuous for arrangements, first conditional.
5. **Free time and culture:** -ing / to-infinitive, comparatives and superlatives, reviews.
6. **Travel:** modals of obligation and advice (must, have to, should), travel problems, complaints.
7. **Health and lifestyle:** quantifiers, second conditional, giving advice.
8. **Technology and media:** the passive (present and past), online safety, opinions.
9. **Our world:** relative clauses, reported speech (statements), environment.
10. **B1 exam practice:** a full mock exam.

## What the system needs

- `MODULE.language: 'en'` puts `meta.language` on the sheets. Estonian-only checks (the EKI word lists) skip it;
  every other gate applies with the A1/A2/B1 norms.
- `COURSES.en` in admin/course/registry.js; module files in admin/course/en/a2/moduleNN.js.
- Curriculum records (`curriculumLessons/en-a2-NNN`, subject „Inglise keel”, level „English A2”) are a production
  write and need the owner's yes, like ek9.

## Status

- A2 modules 1–2 (en-a2-001…010) are built with their teacher keys, pass every gate and are published in Õppevara
  (2026-10-22).
- Listening: the course TTS is Estonian, so English transcripts are read by the teacher for now. English audio needs
  a TTS choice (a paid service needs the owner's yes).

- B1 module 1 (en-b1-001…005) is built with its teacher key and passes every gate (2026-10-22); not yet published.

## Next safe step

The owner's yes to publish B1 module 1; then B1 module 2 „Life stories”. A2 module 3 waits.
