# Textbooks in the course („Õpik” sheets)

Owner 2026-10-21: the school has the publisher's permission to use these textbooks with its own students. Textbook
content is not a separate module. A textbook's rule and exercises are copied 1:1 into a 4th sheet „Õpik” of the course
lesson that teaches the same grammar, next to Avasta / Harjuta / Kasuta. Those three sheets stay unchanged.

## How it works

- Data: `crm-v2/src/features/worksheet-generator/admin/course/textbook/<book>.json`, which holds the book (title,
  authors) and sheets `{ lessonId, title, pages, level, canDo, blocks }`. `textbook/index.js` builds the documents:
  - `id ws_<lesson>_opik`, which the generator never replaces;
  - `meta.phase opik`;
  - no author or source line on the sheet (owner 2026-10-21).
- Publishing: „Kursuse tootmine” → section „Õpik” → „Avalda” (with a confirmation). It writes
  `curriculumLessons/{lesson}/worksheets/opik` (role `focus`, slot 4) and the summary `worksheetPhases.opik`. Only the
  answer key is checked; the textbook's content is not measured against our lesson norms.
- Õppevara:
  - the chip „Õpik” appears only on lessons that have one, and is not counted in the filters or the module progress;
  - assignment offers it, unticked by default;
  - a single task can also be assigned;
  - the board and homework label it „Õpik”.
- Digitising rules:
  - 1:1, the same texts and order;
  - spelling of the book kept;
  - crossed-out wrong forms shown in red with ✗;
  - publisher audio and QR codes are not copied;
  - translations are teacher-reviewed;
  - our own answer keys are marked for a teacher check when the book has none.

## Books

### „Minu Eesti” — Inga Mangus, Merge Simmul

| Pages | Lesson | Sheet |
|-|-|-|
| 38, 40–41 (lihtminevik -SI-, ex. 7, 9) | a2b1-021 Lihtmineviku põhivormid | done (draft in code) |
| 39–41 (15 -I- verbs, minema, ex. 8, 10) | a2b1-023 I-lihtminevik ja sagedased erandid | done (draft in code) |
| 42–43 (Lõks: igatsema, võtma, paluma, harjuma; ex. 11–16) | b1b2-018 Tegusõna rektsioon | done (draft in code) |

### Grammar book (Russian explanations, 276 pp.) — Inga Mangus, Merge Simmul

The map below comes from the table of contents (owner's photos 2026-10-21). „—” means the course has no lesson for the
topic yet; the owner decides whether to add one or attach it to the nearest lesson.

| Topic (book) | Pages | Course lesson(s) |
|-|-|-|
| 1.1 Vene nimede kirjutamine | 10 | — |
| 1.2 Nimetav (ainsus) | 11 | a2-003 — **done** (pp. 11) |
| 1.3 Nimetav (mitmus), see / need | 11–13 | a2-006 — **done** (pp. 11–13) |
| 1.4 Omastav (ainsus) | 13–15 | a2-007 — **done** (pp. 13–15) |
| 1.5 Omastav (mitmus) | 16–17 | a2b1-008 — **done** (pp. 16–17; ex. 2 has 5 words cut off in the photo, see PR) |
| 1.6 Kelle oma | 19 | a2-007, a2b1-008 |
| 1.7 Kätte, käes, käest; omastavaga eessõnad ja tagasõnad | 20 | a2b1-014, a2-022 |
| 1.8–1.9 Osastav (ainsus, mitmus) | 26–29 | a2-027, a2b1-028 |
| 1.10 Osastavaga eessõnad ja tagasõnad | 34 | — |
| 1.11 Tegusõnad + osastav | 36 | b1b2-018 |
| 1.12–1.13 Alalütlev; sõnad + alalütlev (emal on hea meel) | 41–44 | a2-018 |
| 1.14–1.17 Seesütlev; tegusõnad + seesütlev; kus?; kelle juures | 45–52 | a2-017, a2b1-012, b1b2-006 |
| 1.18–1.19 Alaleütlev; tegusõnad + alaleütlev | 53–55 | a2-018, b1b2-018 |
| 1.20–1.23 Sisseütlev; lühike vorm; tegusõnad + sisseütlev; kuhu? | 57–64 | a2-017, a2b1-012, b1b2-006 |
| 1.24 Kelle juurde | 64 | a2b1-012 |
| 1.25–1.26 Alaltütlev; tegusõnad + alaltütlev | 66–69 | a2-018, b1b2-018 |
| 1.27–1.30 Seestütlev; tegusõnad + seestütlev; kust?; kelle juurest | 71–82 | a2-017, b1b2-018 |
| 1.31 Saav (-ks) | 83 | — |
| 1.32 Rajav (-ni) | 87 | a2-012 (alates … kuni) |
| 1.33–1.34 Olev (-na); tegusõnad + olev | 89–91 | — |
| 1.35 Ilmaütlev (-ta) | 92 | a2-029 (ilma …) |
| 1.36–1.37 Kaasaütlev (-ga); tegusõnad + kaasaütlev | 94–97 | b1b2-018 |
| 1.38–1.39 Kõik käänded (tähendus, mitmus) | 100–106 | — |
| 2.1–2.4 Isikulised asesõnad (nimetav, omastav, osastav, kõik käänded) | 110–114 | a2-003, a2-007, a2b1-008 |
| 2.5 Küsiv-siduvad asesõnad | 116 | a2-009 |
| 2.6–2.8 Ise; see, need; keegi, miski | 118–121 | — |
| 3.1–3.2 Tegusõna; ma- ja da-infinitiiv | 123–126 | a2-037, a2b1-037, a2b1-043, b1b2-017 |
| 3.3–3.6 Kõneviisid; kindel kõneviis; olevik; olema | 132–135 | a2-001, a2-003 |
| 3.7–3.9 Minevik; lihtminevik (-si-, -i-) | 137–142 | a2b1-021, a2b1-023, a2-076, a2-059, b1b2-011 |
| 3.10 Täisminevik | 146 | a2b1-067, b1b2-012 |
| 3.11 Enneminevik | 150 | b1b2-013 |
| 3.12 Tingiv kõneviis | 153 | a2b1-062, b1b2-042 |
| 3.13 Käskiv kõneviis | 158 | a2-023, a2b1-033 |
| 3.14 Lõpetatud / lõpetamata tegevus | 162 | B2 module 4 (sihitis) |
| 3.15 -ma / -mas / -mast / -mata | 167 | — |
| 3.16, 3.22 Kesksõnad (-v, -tav, -nud, -tud) | 170, 190+ | b1b2-078 |
| 3.17–3.18 Umbisikuline tegumood | 175–182 | b1b2-058, b1b2-079 |
| 3.19 Modaalverbid | 184 | a2-037, a2b1-017 |
| 3.20 Ühend- ja väljendverbid | 186 | — |
| 3.21 -des / -tes / -es | 190 | b1b2-078 |
| 3.23 mine-vorm | — | — |
| 3.24 Liikumist näitavad tegusõnad | — | a2-059, a2b1-048 |
| 3.25 Tegusõnad ja käänded | — | b1b2-018 |
| 3.26 Segiminevad tegusõnad (lõppema – lõpetama) | — | — |
| 4.1–4.4 Omadussõna; käänded; võrdlusastmed | ~210–219 | a2b1-007, a2-052, a2b1-052, b1b2-004 |
| 5.1–5.6 Määrsõnad (koht, aeg, viis, hulk, võrdlus) | ~223–235 | a2b1-022, a2-077 (aeg); a2b1-052 (võrdlus); rest — |
| 6.1–6.3 Põhiarvsõnad, käänded | 238–242 | a2-032, a2-004 |
| 6.4 Kellaajad | 247 | a2-012, a2b1-002 |
| 6.5–6.7 Järgarvsõnad, kuupäevad | 249–255 | a2-004, a2-001 |
| 7.1 Küsisõnad | 258 | a2-002, a2-009 |
| 7.2 Sidesõnad | 265 | a2b1-038, a2-092 |
| 7.3 -gi / -ki | 268 | — |
| 7.4 Eitused (ei, pole, mitte) | 270 | a2-003 |
| 7.5 Abisõna ÄRA | 272 | a2-023 |
| 7.6 Nimisõna- ja omadussõnamoodustus | 273 | — |
| Grammatikatabelid | 276 | reference for every grammar lesson |

One lesson has one „Õpik” sheet. When two books (or two chapters) fit the same lesson, they go into that sheet one
after the other, each with its own source line.
