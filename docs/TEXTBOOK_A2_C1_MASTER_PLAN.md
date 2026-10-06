# KeeleSepp A2→C1 digital textbook master plan

Status: active architecture contract  
Owner goal: turn the existing curricula + Worksheet Studio into one coherent digital textbook system from A2 through C1.

## 1. Existing authoritative path

KeeleSepp already has four curriculum manifests. The textbook must reuse them instead of creating another competing roadmap:

| Target level | Existing path | Lessons | Modules | Manifest |
|---|---|---:|---:|---|
| A2 | A1→A2 | 100 | 20 | `data/keelesepp-a2-roadmap.json` |
| B1 | A2→B1 | 90 | 18 | `data/keelesepp-a2-b1-roadmap.json` |
| B2 | B1→B2 | 90 | 18 | `data/keelesepp-b1-b2-roadmap.json` |
| C1 | C1 course | 100 | 10 | `data/keelesepp-c1-curriculum.json` |

Total: **380 managed lessons**.

The textbook layer is a contract over these curricula. Stable lesson IDs, curriculum history and existing published worksheet versions are preserved.

## 2. Definition of a complete module

A module is not complete because five lesson rows exist.

Every textbook module eventually contains:

1. **Module opener**
   - communication goals;
   - grammar spine;
   - core vocabulary;
   - key situations;
   - final module project;
   - learner self-diagnostic.

2. **Lesson bundles**
   - Avasta;
   - Harjuta;
   - Kasuta;
   - teacher notes;
   - answer key;
   - homework / spaced retrieval.

3. **Korda**
   - mixed retrieval;
   - vocabulary from the current + earlier modules;
   - grammar interleaving;
   - short reading/listening.

4. **Kontroll**
   - separate evidence for reading, listening, speaking and writing;
   - language accuracy;
   - functional transfer;
   - level-appropriate threshold.

5. **Projekt**
   - one realistic task combining several skills;
   - at B1+ includes mediation;
   - at B2+ includes argumentation / source comparison;
   - at C1 includes synthesis or professional/academic production.

## 3. Complete lesson contract

Every normal lesson has three learner sheets:

### 1 Avasta
Meaningful input → comprehension → noticing → first use.

### 2 Harjuta
Retrieval → form/meaning contrast → transformation → repair → mixed recycling.

### 3 Kasuta
New situation → independent production → interaction/mediation → reflection.

A complete lesson additionally has:
- teacher notes;
- answer key;
- homework/retrieval task.

The three sheets reuse vocabulary and grammar but must not use one repeated worksheet template.

## 4. Level progression

### A2
Goal: understandable everyday independence.

Typical material:
- 80–160 word texts;
- 1–2 minute speaking;
- 40–90 word writing;
- high scaffolding;
- practical forms, schedules, menus, notices, simple dialogues.

### B1
Goal: connected independent language for everyday, work and study situations.

Typical material:
- 140–260 word texts;
- 2–4 minute speaking;
- 70–150 word writing;
- reasons, comparison, problem solving;
- mediation begins systematically.

### B2
Goal: argumentation, flexible interaction and processing more complex information.

Typical material:
- 220–420 word texts;
- 4–6 minute speaking;
- 140–260 word writing;
- source comparison;
- counterargument;
- register;
- mediation;
- graphs/data/functional documents.

### C1
Goal: precise, flexible, structured language use for complex professional, academic and social purposes.

Typical material:
- 350–700 word source texts;
- 5–10 minute structured speaking;
- 220–420 word writing;
- synthesis across sources;
- implicit meaning;
- nuance/register;
- complex mediation;
- professional and academic genres.

These ranges are authoring defaults, not hard CEFR laws.

## 5. Lexical syllabus

The textbook needs one vocabulary layer shared across curricula.

Every lexical entry should support:
- stable id;
- lemma;
- three learner forms;
- Russian translation;
- CEFR level;
- topic;
- part of speech;
- collocations;
- government / rektsioon;
- example;
- first active lesson;
- scheduled recycling lessons.

### Recycling rule

A core item should have at least five meaningful encounters:
1. receptive;
2. controlled;
3. productive;
4. later retrieval;
5. later module return.

The generator must distinguish:
- new;
- current-module recycled;
- previous-module recycled;
- long-gap retrieval.

## 6. Grammar syllabus

Create one grammar progression index independent of topic.

Every grammar target needs:
- id;
- first introduction level/lesson;
- controlled-practice lessons;
- automatic-use target level;
- prerequisite targets;
- common Russian-speaker errors;
- explanation model;
- contrast examples;
- later retrieval lessons.

Example:

`local-cases-kus-kuhu-kust`
- introduced: A2;
- controlled: A2;
- combined with motion verbs: A2+/B1;
- expected automatic use in narratives: B1;
- idiomatic/lexicalized use: B2.

The generator should know whether a target is **new**, **recycled**, or **assumed**.

## 7. Listening layer

A textbook-level system needs an audio bank, not isolated audio uploads.

Required genres by progression:
- short dialogue;
- announcement;
- voicemail;
- phone call;
- interview;
- service interaction;
- workplace conversation;
- radio/podcast extract;
- news;
- lecture/presentation extract.

Each source stores:
- level;
- transcript;
- duration;
- speaking rate;
- speakers;
- genre;
- target vocabulary;
- target grammar/functions;
- answer key;
- optional teacher-read fallback.

## 8. Visual/functional source layer

Images are instructional sources, not decoration.

Required source formats:
- photo;
- illustration / cartoon;
- map;
- timetable;
- menu;
- ticket;
- advertisement;
- form;
- chat;
- email;
- website/app screen mock;
- chart;
- infographic;
- workplace document.

A source should support a task such as compare, infer, choose, plan, explain or mediate.

## 9. Activity expansion

Existing Worksheet Studio already supports many families. To approach a real textbook, add first-class blocks for:

1. information gap;
2. sequencing / timeline;
3. ranking;
4. decision tree;
5. map route;
6. compare two sources;
7. chat simulation;
8. form filling;
9. data/graph interpretation;
10. structured mediation;
11. debate / counterargument cards;
12. branching problem scenario.

These should enter the activity planner with level limits and cognitive-load metadata so variation is systematic, not random.

## 10. Writing genres

### A2
- form;
- message;
- invitation;
- description;
- short personal email.

### B1
- request;
- complaint;
- opinion;
- story;
- practical email.

### B2
- argumentative text;
- formal email/letter;
- report;
- structured comparison;
- recommendation.

### C1
- synthesis;
- analytical essay;
- critique;
- formal position;
- professional proposal;
- summary from multiple sources.

Every genre needs:
model → noticing → useful language → planning → production → checklist/rubric.

## 11. Speaking progression

Track separately:
- monologue;
- interaction;
- clarification;
- negotiation;
- disagreement;
- compromise;
- presentation;
- response to counterargument.

The generator increases duration, independence and interaction pressure by level.

## 12. Teacher Book

Every lesson gets a teacher layer:

- lesson goal;
- previous knowledge;
- new vocabulary;
- recycled vocabulary;
- grammar target;
- typical errors;
- suggested explanation;
- lesson timing;
- answer key;
- acceptable alternative answers;
- support route;
- challenge route;
- homework;
- assessment evidence.

Target: a qualified teacher should be able to open a lesson and teach it with minimal extra preparation.

## 13. Student Book / Workbook projection

The underlying data remains one lesson system, but it can produce two projections:

### Student Book
- context/input;
- discovery;
- core vocabulary;
- grammar noticing;
- communication;
- projects.

### Workbook
- controlled grammar;
- vocabulary retrieval;
- writing;
- homework;
- revision.

CRM continues to use Avasta / Harjuta / Kasuta as the primary authoring and assignment model.

## 14. Adaptive textbook layer

Later phase:

For each learner track evidence by:
- vocabulary;
- grammar targets;
- reading;
- listening;
- speaking;
- writing;
- interaction;
- mediation.

A future planner may then adjust:
- support/core/challenge;
- recycled vocabulary;
- skill balance;
- corrective tasks.

It must never silently rewrite the curriculum sequence or historical lesson evidence.

## 15. Delivery phases

### Phase 1 — contract and consistency
- one A2→C1 textbook contract;
- vocabulary schema;
- grammar progression schema;
- diversity rules;
- module/lesson completeness rules.

### Phase 2 — A2 exemplar
- convert one complete A2 module to textbook quality;
- module opener + 5 × three phases + Korda + Kontroll + Projekt;
- teacher notes and keys;
- visual QA.

### Phase 3 — generator capabilities
- add missing high-value activity blocks;
- module-level variation planner;
- lexical spaced-return planner;
- grammar new/recycled/assumed state.

### Phase 4 — content production
- A2 modules;
- B1 modules;
- B2 modules;
- C1 modules.

### Phase 5 — listening + source bank
- structured audio;
- visual/functional source library;
- rights/provenance metadata.

### Phase 6 — adaptive layer
- learner evidence;
- retrieval scheduling;
- corrective lesson suggestions.

## 16. Immediate build order

The safest next build order is:

1. textbook contract in code + tests;
2. vocabulary and grammar progression schemas;
3. one full exemplar module;
4. missing activity blocks;
5. module-level generator;
6. scale content only after the exemplar passes visual and teaching review.

Do not mass-generate 380 × 3 sheets before the exemplar and schemas are stable.
