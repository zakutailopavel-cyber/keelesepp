# KeeleSepp textbook visual style

Status: active visual contract  
Applies to: Worksheet Studio, Õpik export, Student Book / Workbook projections, future generator-produced visuals.  
Concrete house style, cast and generation rules: `docs/TEXTBOOK_ART_BIBLE.md` (owner choice 2026-10-07: flat line-art with one lime accent).

## 1. One system, three visual modes

The textbook does not force photos and illustrations to imitate one another. Consistency comes from one art direction and one page treatment.

### Photo
Use for:
- real people and social interaction;
- city, home, transport, shops and services;
- workplace and education;
- practical situations and functional documents.

Photo direction:
- natural light;
- contemporary Estonia / European everyday context;
- calm colour;
- natural expressions;
- one clear action;
- low visual clutter;
- no staged stock-photo smile;
- enough clean space for textbook composition.

### Editorial illustration
Use for:
- grammar and abstract meaning;
- emotions;
- comparison;
- dilemmas;
- humour;
- situations where simplification helps learning.

Illustration direction:
- clean adult editorial illustration;
- restrained outlines;
- soft texture;
- simple background;
- adult proportions;
- KeeleSepp-compatible restrained palette;
- no childish clipart;
- no glossy Pixar-like 3D.

### Infographic / schematic
Use for:
- grammar systems;
- timelines;
- processes;
- comparison;
- maps and routes;
- data and charts;
- functional information.

Direction:
- information first;
- minimal decoration;
- clear hierarchy;
- print-safe labels;
- same type hierarchy as worksheet pages.

## 2. Shared KeeleSepp treatment

Regardless of source mode:
- large rounded image frame;
- subtle border;
- minimal or no shadow;
- consistent crop behaviour;
- compact caption;
- navy / green / sand / soft blue / warm neutral visual family;
- adult and modern tone.

A photo, editorial illustration and infographic may look different in medium while still looking like one textbook because the framing, colour discipline, typography and didactic purpose stay consistent.

## 3. Every image needs a learning job

No decorative image-only blocks.

Every image must support at least one action:
- describe;
- compare;
- infer;
- choose;
- sequence;
- plan;
- explain;
- mediate;
- argue;
- solve a problem.

Bad:
> generic bus photo beside a transport text.

Good:
> bus-stop scene with timetable, delayed bus and three travellers; learner must infer the problem, choose an action and explain it.

## 4. Visual progression by level

### A2
Prefer:
- clear literal situations;
- one action;
- simple functional documents;
- obvious visual relationships.

Avoid:
- dense visual information;
- irony that is required for task success.

### B1
Add:
- multiple details;
- cause/effect;
- competing options;
- practical problem situations.

### B2
Add:
- visual argument;
- graph/data reading;
- conflicting sources;
- ambiguity;
- social/professional situations.

### C1
Add:
- complex infographics;
- source comparison;
- editorial/cartoon interpretation;
- nuance, stance and implicit meaning;
- professional and academic visual material.

## 5. Reuse and continuity

Within one module:
- recurring characters or locations may return;
- the same visual source may be revisited with a harder task;
- visual repetition should support lexical/grammar recycling.

Do not repeat the exact same page composition mechanically.

## 6. Õpik is the existing textbook surface

KeeleSepp already has the textbook assembler at:

`/library/worksheets/book`

This remains the textbook output surface.

It already:
- selects structured worksheets;
- orders them;
- creates a cover;
- creates a table of contents with page numbers;
- renders worksheet pages with running book page numbers;
- exports through PDF / print;
- keeps worksheets as the single source, so edits flow into the assembled book.

The A2→C1 textbook project must **extend this existing Õpik feature**, not create a separate book application.

## 7. Planned Õpik evolution

The existing book assembler should gradually gain:

1. curriculum / level / module filters;
2. one-click add whole module;
3. phase selection:
   - Student Book: Avasta + selected Kasuta;
   - Workbook: Harjuta + writing/retrieval;
   - Complete: all three phases;
4. module opener pages;
5. Korda / Kontroll / Projekt pages;
6. visual-style metadata and QA;
7. optional Teacher Book projection;
8. automatic contents grouping by module;
9. cover preset per level while staying in one KeeleSepp family.

The underlying worksheet documents remain authoritative.

## 8. Visual QA gate

Before a module is accepted into a textbook:
- no low-resolution visual;
- no visible watermark;
- no unrelated decorative image;
- no mixed random illustration style;
- no childish clipart;
- visual has a language-learning purpose;
- captions/labels print clearly;
- page remains balanced with no large accidental empty zone;
- recurring visuals are stylistically consistent.
