# Course audit — 2026-10-12

Read-only audit of the published course (381 lessons, `curriculumLessons` + their `worksheets/{discover,practice,transfer}`) against `docs/CEFR_A2_B1_LEARNING_STANDARD.md`. Regenerate: `node tools/course-audit/export.cjs > raw.json && python3 tools/course-audit/audit.py raw.json` (read-only, owner's service account).

## Summary

| Level | Lessons | Without findings | Goal only in Russian | Missing sheets (lessons) | Avasta without text | Lessons with tasks < 4 items |
|---|---|---|---|---|---|---|
| A2 | 101 | 0 | 100 | 33 | 27 | 68 |
| B1 | 90 | 0 | 90 | 15 | 0 | 68 |
| B2 | 90 | 0 | 89 | 1 | 0 | 54 |
| C1 | 100 | 0 | 0 | 0 | 0 | 32 |

Plan findings: A2 has 20 assessment lessons out of 101 (every 5th lesson is a test); B2 lesson 35 is missing from the numbering; C1 has no success criteria (100/100); the most common Avasta block sequence repeats 28× in B1.

Checks: goal present and in Estonian; success criterion; all three sheets published; a learner goal (`meta.canDo`) on each sheet; ≥ 5 task blocks; no closed task with < 4 items (standard: ≥ 5); Avasta has a reading text or dialogue.

## Per lesson

### A2

| Lesson | Title | Findings |
|---|---|---|
| KkdAHYFdwT51J2OCPuv0 | Mina | нет цели; нет критерия успеха; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-001 | A2 lähtediagnostika | цель по-русски; Harjuta: задания <4 пунктов (2) |
| a2-002 | Tutvumine ja viisakus | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-003 | Olen, elan, räägin | цель по-русски; Avasta: задания <4 пунктов (3); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-004 | Isikuandmed ja lihtne ankeet | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-005 | Kontroll 1 — eneseinfo | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (2) |
| a2-006 | Pere ja lähedased | цель по-русски; Avasta: нет цели на листе; Avasta: 1 заданий; Avasta: задания <4 пунктов (1); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-007 | Kelle oma? Genitiiv | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (4) |
| a2-008 | Välimus ja iseloom | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-009 | Minu inimesed | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (4) |
| a2-010 | Kontroll 2 — pere ja inimesed | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2-011 | Minu päev | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (3) |
| a2-012 | Kellaaeg ja ajaväljendid | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-013 | Kui tihti? | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-014 | Minu nädal | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-015 | Kontroll 3 — päev ja aeg | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-016 | Minu kodu | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-017 | Kus? Kuhu? Kust? — sees | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-018 | Kus? Kuhu? Kust? — peal | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-019 | Korter ja naabruskond | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (4) |
| a2-020 | Kontroll 4 — kodu ja ümbrus | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2-021 | Kohad linnas | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (3) |
| a2-022 | Kuidas ma sinna saan? | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-023 | Käskiv kõneviis igapäevaselt | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (2) |
| a2-024 | Sildid, kaardid ja lahtiolekuajad | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2-025 | Kontroll 5 — linn ja tee | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2-026 | Toit ja joogid | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-027 | Kui palju? Partitiiv | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-028 | Kohvikus | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-029 | Tellimus ja arve | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-030 | Kontroll 6 — söök ja kohvik | цель по-русски; Avasta: задания <4 пунктов (2) |
| a2-031 | Poes ja kaubad | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (5) |
| a2-032 | Arvud, hinnad ja kogused | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (3) |
| a2-033 | Proovimine ja valimine | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (5) |
| a2-034 | Kviitung, kampaania ja tagastus | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (4) |
| a2-035 | Kontroll 7 — ostud ja raha | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2-036 | Aja broneerimine | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-037 | Pean, saan, võin, tohin | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-038 | Vormid ja juhised | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-039 | Telefon ja klienditeenindus | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2-040 | Kontroll 8 — teenused | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2-041 | Keha ja enesetunne | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (5) |
| a2-042 | Mul on… / Mul valutab… | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (4) |
| a2-043 | Arsti juures | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2-044 | Ravimiinfo ja vastuvõtuaeg | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-045 | Kontroll 9 — tervis | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-046 | Hobid ja vaba aeg | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-047 | Mulle meeldib… | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (3) |
| a2-048 | Kutse ja vastus | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (3) |
| a2-049 | Üritused ja piletid | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (3) |
| a2-050 | Kontroll 10 — vaba aeg | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2-051 | Ilm ja aastaajad | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (4) |
| a2-052 | Võrdlus: soojem, külmem | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (2) |
| a2-053 | Ilmateade | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-054 | Mida selga panna? | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2-055 | Kontroll 11 — ilm | цель по-русски; Avasta: задания <4 пунктов (2) |
| a2-056 | Transport ja pilet | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-057 | Sõiduplaan ja väljumine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-058 | Pileti ostmine ja küsimused | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-059 | Lihtminevik — teekond | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-060 | Kontroll 12 — reisimine | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-061 | Ametid ja töökoht | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-062 | Pean tegema, oskan teha | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-063 | Töögraafik ja lihtne töökuulutus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-064 | Tööpäeva juhised | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-065 | Kontroll 13 — töö | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-066 | Õppimine ja kursus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-067 | Ma ei saa aru | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-068 | Ma tahan õppida / hakkan õppima | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-069 | Minu keeleõppe plaan | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-070 | Kontroll 14 — õppimine ja keel | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (2) |
| a2-071 | Külla minek ja vastuvõtt | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-072 | Palve ja viisakas soov | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-073 | Nõustumine ja keeldumine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-074 | Sõnum sõbrale või tuttavale | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-075 | Kontroll 15 — suhted ja viisakus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-076 | Lihtminevik — põhivormid | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-077 | Mis eile juhtus? | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-078 | Lühike lugu minevikus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-079 | Kogemus: olen käinud | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-080 | Kontroll 16 — minevik | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-081 | Homme teen… | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-082 | Saame kokku | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-083 | Kui…, siis… | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-084 | Kokkuleppe kinnitamine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-085 | Kontroll 17 — plaanid | цель по-русски; Avasta: задания <4 пунктов (2); Avasta: нет текста/диалога; Harjuta: задания <4 пунктов (3) |
| a2-086 | Teade ja kuulutus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-087 | Avalik teadaanne | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-088 | Juhis samm-sammult | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-089 | Lühivastus kuuldu põhjal | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-090 | Kontroll 18 — info mõistmine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-091 | Teade, sõnum ja kutse | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-092 | Lihtne kirjeldus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-093 | A2 monoloog | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-094 | A2 dialoog ja olukord | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-095 | Kontroll 19 — kirjutamine ja rääkimine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-096 | A2 osaoskuste strateegiad | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-097 | A2 proovieksam 1 | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-098 | Veaparandus ja nõrk osaoskus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-099 | A2 proovieksam 2 | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2-100 | Kontroll 20 — A2 lõpphindamine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |

### B1

| Lesson | Title | Findings |
|---|---|---|
| a2b1-001 | A2 lähtediagnostika | цель по-русски; Harjuta: задания <4 пунктов (1); Kasuta: 4 заданий |
| a2b1-002 | Minu päev ja kellaaeg | цель по-русски; Avasta: задания <4 пунктов (1); Kasuta: 4 заданий |
| a2b1-003 | Sagedus ja lihtne lausejärg | цель по-русски; Avasta: задания <4 пунктов (1); Kasuta: 4 заданий |
| a2b1-004 | Minu nädal | цель по-русски; Avasta: задания <4 пунктов (1); Kasuta: 4 заданий |
| a2b1-005 | Kontroll 1 — igapäevaelu | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-006 | Pere ja lähedased | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-007 | Välimus ja iseloom | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-008 | Kelle? Kelle oma? | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-009 | Koos veedetud aeg | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2b1-010 | Kontroll 2 — pere ja suhted | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-011 | Minu kodu | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-012 | Kus? Kuhu? Kust? | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-013 | Kohad linnas | цель по-русски |
| a2b1-014 | Tee küsimine ja juhatamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-015 | Kontroll 3 — kodu ja linn | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-016 | Ajamäärused ja päevaplaan | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-017 | Peab, võib ja saab | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (2) |
| a2b1-018 | Mida ma pean tegema? | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-019 | Kokkulepe ja aja muutmine | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-020 | Vahehindamine 1 — A2 baas | цель по-русски; Avasta: задания <4 пунктов (2) |
| a2b1-021 | Lihtmineviku põhivormid | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-022 | Eile ja eelmisel nädalal | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-023 | I-lihtminevik ja sagedased erandid | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-024 | Lugu piltide järgi | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-025 | Kontroll 5 — lihtminevik | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (2) |
| a2b1-026 | Toiduained ja kogused | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-027 | Kohvikus ja restoranis | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-028 | Partitiiv toidu ja koguse juures | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-029 | Tellimusega on probleem | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-030 | Kontroll 6 — toit ja teenindus | цель по-русски; Avasta: задания <4 пунктов (2); Kasuta: задания <4 пунктов (1) |
| a2b1-031 | Keha ja sümptomid | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-032 | Arsti juures | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-033 | Nõuanded ja käskiv kõneviis | цель по-русски; Avasta: задания <4 пунктов (1); Kasuta: задания <4 пунктов (1) |
| a2b1-034 | Tervislikud harjumused | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-035 | Kontroll 7 — tervis | цель по-русски; Avasta: задания <4 пунктов (2) |
| a2b1-036 | Koolipäev ja õppeained | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-037 | ma- või da-infinitiiv? | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-038 | Sest ja kuna — põhjuse selgitamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-039 | Õppimisprobleem ja lahendus | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-040 | Vahehindamine 2 — A2+ | цель по-русски; Avasta: задания <4 пунктов (2) |
| a2b1-041 | Ametid ja tööülesanded | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-042 | Minu töökogemus | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-043 | ma-/da-infinitiiv tööelus | цель по-русски; Avasta: задания <4 пунктов (2); Kasuta: задания <4 пунктов (1) |
| a2b1-044 | Lihtne tööintervjuu | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-045 | Kontroll 9 — tööelu | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2b1-046 | Transport ja piletid | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-047 | Reisi planeerimine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-048 | Minevik reisil | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-049 | Ootamatu olukord reisil | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-050 | Kontroll 10 — reisimine | цель по-русски; Avasta: задания <4 пунктов (2); Harjuta: задания <4 пунктов (1) |
| a2b1-051 | Poes ja hinnad | цель по-русски; Harjuta: задания <4 пунктов (1) |
| a2b1-052 | Võrdlusaste | цель по-русски |
| a2b1-053 | Kauba tagastamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-054 | E-teenused ja maksmine | цель по-русски; Harjuta: задания <4 пунктов (1) |
| a2b1-055 | Kontroll 11 — raha ja ostlemine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-056 | Ilm ja aastaajad | цель по-русски; Harjuta: задания <4 пунктов (1) |
| a2b1-057 | Loodus ja tegevused | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-058 | Põhjus ja tagajärg | цель по-русски |
| a2b1-059 | Keskkonnasõbralik valik | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-060 | Vahehindamine 3 — B1- algus | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-061 | Palumine, ettepanek ja keeldumine | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-062 | Tingiv kõneviis viisakuses | цель по-русски |
| a2b1-063 | Konflikt ja kompromiss | цель по-русски |
| a2b1-064 | Ootamatu olukord | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-065 | Kontroll 13 — suhtlemine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-066 | Lihtminevik — pikem jutustus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| a2b1-067 | Täisminevik — minu kogemus | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-068 | Ajajoon ja jutustuse sidumine | цель по-русски |
| a2b1-069 | Meeldejääv kogemus | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| a2b1-070 | Kontroll 14 — minevik ja kogemus | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-071 | Tuleviku väljendamine | цель по-русски; Harjuta: задания <4 пунктов (1) |
| a2b1-072 | Soovid ja eesmärgid | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-073 | Kui…, siis… | цель по-русски |
| a2b1-074 | Plaani põhjendamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-075 | Kontroll 15 — tulevik ja plaanid | цель по-русски; Avasta: задания <4 пунктов (1) |
| a2b1-076 | Minu arvates… | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-077 | Võrdlemine ja valik | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-078 | Põhjus, näide ja järeldus | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-079 | Mini-arutelu | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-080 | Vahehindamine 4 — B1 valmisolek | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-081 | Funktsionaalne lugemine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-082 | E-kiri ja sõnum | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-083 | Arvamustekst B1 | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-084 | Info kirjeldamine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-085 | Kontroll 17 — lugemine ja kirjutamine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-086 | Pikem monoloog | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-087 | Dialoog ja küsimuste esitamine | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-088 | Probleemi lahendamine B1 | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-089 | B1 proovitund | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| a2b1-090 | Lõpphindamine — B1 | цель по-русски; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |

### B2

| Lesson | Title | Findings |
|---|---|---|
| Qaj1NCxfH2LeoeT6GHbM | LUGEMINE | нет цели; нет критерия успеха; Avasta: нет листа; Harjuta: нет листа; Kasuta: нет листа |
| b1b2-001 | Стартовая диагностика B1 | цель по-русски |
| b1b2-002 | Minu tavaline päev | цель по-русски |
| b1b2-003 | Aeg, sagedus ja lauseehitus | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-004 | Argipäev vs nädalavahetus | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-005 | Kontroll 1 — igapäevaelu | цель по-русски |
| b1b2-006 | Kus? Kuhu? Kust? | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-007 | Teeninduses ja ametiasutuses | цель по-русски |
| b1b2-008 | Kaebus ja probleem | цель по-русски; Avasta: задания <4 пунктов (1); Harjuta: задания <4 пунктов (1) |
| b1b2-009 | Ootamatu olukord linnas | цель по-русски |
| b1b2-010 | Kontroll 2 — linn ja teenused | цель по-русски |
| b1b2-011 | Lihtminevik — sündmus | цель по-русски |
| b1b2-012 | Täisminevik — kogemus | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-013 | Enneminevik ja ajajoon | цель по-русски |
| b1b2-014 | Meeldejääv kogemus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-015 | Kontroll 3 — minevik | цель по-русски |
| b1b2-016 | Täissihitis ja osasihitis | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-017 | ma- ja da-infinitiiv | цель по-русски |
| b1b2-018 | Tegusõna rektsioon | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-019 | Probleemi lahendamine grammatikaga | цель по-русски |
| b1b2-020 | Vahehindamine 1 — уроки 1–20 | цель по-русски |
| b1b2-021 | Seisukoha väljendamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-022 | Põhjus → näide → järeldus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-023 | Nõustumine ja mittenõustumine | цель по-русски |
| b1b2-024 | Kahe lahenduse võrdlemine | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-025 | Kontroll 5 — argumentatsioon | цель по-русски |
| b1b2-026 | Töökoht ja vastutus | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-027 | Hea töökoht | цель по-русски |
| b1b2-028 | Konflikt tööl | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-029 | Kaugtöö või kontor? | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-030 | Kontroll 6 — tööelu | цель по-русски |
| b1b2-031 | Õppimine ja motivatsioon | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-032 | Mis teeb õppimise tõhusaks? | цель по-русски; Harjuta: задания <4 пунктов (1); Kasuta: задания <4 пунктов (1) |
| b1b2-033 | Haridusteksti analüüs | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-034 | Ettepanek õppimise parandamiseks | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-036 | Reisi planeerimine | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-037 | Reis läks valesti | цель по-русски |
| b1b2-038 | Kultuurierinevused | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-039 | Reisikogemus ja hinnang | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-040 | Vahehindamine 2 — уроки 21–40 | цель по-русски |
| b1b2-041 | Tervislik eluviis | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-042 | Nõuanded ja tingiv kõneviis | цель по-русски |
| b1b2-043 | Stress ja töö-elu tasakaal | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-044 | Elustiili muutmise plaan | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-045 | Kontroll 9 — tervis ja eluviis | цель по-русски |
| b1b2-046 | Suhted ja iseloom | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-047 | Emotsioonide põhjendamine | цель по-русски |
| b1b2-048 | Kaudne kõne konfliktis | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-049 | Kompromissi leidmine | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-050 | Kontroll 10 — suhted | цель по-русски |
| b1b2-051 | Eelarve ja ostuotsus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-052 | Reklaami mõju | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-053 | Tarbijaprobleem | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-054 | Säästa või kulutada? | цель по-русски |
| b1b2-055 | Kontroll 11 — raha ja tarbimine | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-056 | Digiharjumused | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-057 | Tehisintellekt igapäevaelus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-058 | Umbisikuline tegumood | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-059 | Valeinfo ja allikad | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-060 | Vahehindamine 3 — уроки 41–60 | цель по-русски |
| b1b2-061 | Keskkonnaprobleemid | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-062 | Põhjus ja tagajärg | цель по-русски; Harjuta: задания <4 пунктов (1); Kasuta: задания <4 пунктов (1) |
| b1b2-063 | Keskkonnasõbralikud valikud | цель по-русски |
| b1b2-064 | Probleem ja lahendus | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-065 | Kontroll 13 — keskkond | цель по-русски |
| b1b2-066 | Avalikud teenused | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-067 | Kogukond ja osalemine | цель по-русски |
| b1b2-068 | Kohustus, võimalus ja piirang | цель по-русски; Kasuta: задания <4 пунктов (1) |
| b1b2-069 | Kohaliku probleemi lahendus | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-070 | Kontroll 14 — ühiskond | цель по-русски |
| b1b2-071 | Fakt või arvamus? | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-072 | Autori seisukoht | цель по-русски |
| b1b2-073 | Argumentide tugevus | цель по-русски; Avasta: задания <4 пунктов (1); Kasuta: задания <4 пунктов (1) |
| b1b2-074 | Teksti kokkuvõte ja reaktsioon | цель по-русски |
| b1b2-075 | Kontroll 15 — meedia ja info | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-076 | Liitlause ja sidendid | цель по-русски |
| b1b2-077 | Sõnajärg keerukamas lauses | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-078 | Kesksõnad ja des-vorm | цель по-русски; Harjuta: задания <4 пунктов (1); Kasuta: задания <4 пунктов (1) |
| b1b2-079 | Tingiv, umbisikuline ja kaudne kõne | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-080 | Vahehindamine 4 — уроки 61–80 | цель по-русски |
| b1b2-081 | Arvamusteksti struktuur | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-082 | Ametlik kiri ja taotlus | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-083 | Probleemilahendus-tekst | цель по-русски |
| b1b2-084 | Oma teksti parandamine | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-085 | Kontroll 17 — B2 kirjutamine | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-086 | Pikem monoloog | цель по-русски; Avasta: задания <4 пунктов (1) |
| b1b2-087 | Läbirääkimine ja kompromiss | цель по-русски; Harjuta: задания <4 пунктов (1) |
| b1b2-088 | Lugemine → rääkimine | цель по-русски |
| b1b2-089 | Täismahus B2 simulatsioon | цель по-русски |
| b1b2-090 | Lõpphindamine ja järgmine plaan | цель по-русски; Harjuta: задания <4 пунктов (1) |

### C1

| Lesson | Title | Findings |
|---|---|---|
| est-c1-001 | Mina kui vilunud keelekasutaja: identiteet ja enesepilt | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-002 | Väärtused, valikud ja prioriteedid | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-003 | Suhted, rollid ja ootused | нет критерия успеха |
| est-c1-004 | Konflikt, kompromiss ja piiride seadmine | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-005 | Emotsioonid, hoiakud ja varjatud tähendus | нет критерия успеха |
| est-c1-006 | Suhtlusstiil ja register | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-007 | Avalik eneseväljendus ja põhjendatud seisukoht | нет критерия успеха |
| est-c1-008 | Grammatika: Sihitis C1-tasemel | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-009 | Grammatika: Rektsioon ja käändevalik | нет критерия успеха |
| est-c1-010 | Mooduli 1 progressikontroll | нет критерия успеха |
| est-c1-011 | Eluasemevalikud ja elukvaliteet | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-012 | Naabruskond ja kogukond | нет критерия успеха |
| est-c1-013 | Linnaruum ja avalik ruum | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-014 | Kohalikud teenused ja teenuse kvaliteet | нет критерия успеха |
| est-c1-015 | Turvalisus ja kriisiolukorrad | нет критерия успеха |
| est-c1-016 | Kohaliku elu probleemide arutelu | нет критерия успеха |
| est-c1-017 | Ettepanek ja pöördumine omavalitsusele | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-018 | Grammatika: Sõnajärg ja infostruktuur | нет критерия успеха |
| est-c1-019 | Grammatika: Käänete keerukam kasutus | нет критерия успеха |
| est-c1-020 | Mooduli 2 progressikontroll | нет критерия успеха |
| est-c1-021 | Teenuse kvaliteet ja kliendikogemus | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-022 | Tarbimisotsused ja võrdlemine | нет критерия успеха |
| est-c1-023 | Lepingud, tingimused ja kohustused | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-024 | Kaebus, pretensioon ja vaidluse lahendamine | нет критерия успеха |
| est-c1-025 | Isiklik rahandus ja eelarveotsused | нет критерия успеха |
| est-c1-026 | Pangandus ja kindlustus | нет критерия успеха |
| est-c1-027 | Tarbimisühiskond ja vastutustundlik valik | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-028 | Grammatika: Ajavormid sidusas tekstis | нет критерия успеха |
| est-c1-029 | Grammatika: Kõneviisid ja modaalsus | нет критерия успеха |
| est-c1-030 | Mooduli 3 progressikontroll | нет критерия успеха |
| est-c1-031 | Elukestev õpe ja enesetäiendamine | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-032 | Õpistrateegiad ja enesejuhtimine | нет критерия успеха |
| est-c1-033 | Keeruka info lugemine | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-034 | Allikad, usaldusväärsus ja faktikontroll | нет критерия успеха |
| est-c1-035 | Kokkuvõte ja eri allikate süntees | нет критерия успеха |
| est-c1-036 | Loeng, konspekt ja suuline vahendamine | нет критерия успеха |
| est-c1-037 | Hariduse muutumine ja tulevikuoskused | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-038 | Grammatika: ma- ja da-infinitiiv ning käändelised vormid | нет критерия успеха |
| est-c1-039 | Grammatika: Kesksõnad ja lühendatud tarindid | нет критерия успеха |
| est-c1-040 | Mooduli 4 progressikontroll | нет критерия успеха |
| est-c1-041 | Karjäär, pädevused ja professionaalne identiteet | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-042 | Värbamine ja kvalifikatsioon | нет критерия успеха |
| est-c1-043 | Tööalane kirjalik suhtlus | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-044 | Koosolek ja otsustamine | нет критерия успеха |
| est-c1-045 | Läbirääkimised ja kompromiss | нет критерия успеха |
| est-c1-046 | Juhtimine, meeskond ja tagasiside | нет критерия успеха |
| est-c1-047 | Töökorraldus, muutused ja eetilised valikud | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-048 | Grammatika: Isikuline, umbisikuline ja passiivne väljendus | нет критерия успеха |
| est-c1-049 | Grammatika: Nominalisatsioon ja info tihendamine | нет критерия успеха |
| est-c1-050 | Mooduli 5 progressikontroll | нет критерия успеха |
| est-c1-051 | Tervishoiuteenused ja patsiendisuhtlus | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-052 | Eluviis, ennetus ja tervisekäitumine | нет критерия успеха |
| est-c1-053 | Vaimne heaolu ja koormus | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-054 | Sotsiaalne tugi ja hooldus | нет критерия успеха |
| est-c1-055 | Vananemine ja demograafilised muutused | нет критерия успеха |
| est-c1-056 | Avalik terviseinfo ja riskikommunikatsioon | нет критерия успеха |
| est-c1-057 | Tõend, arvamus ja põhjendamine terviseteemal | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-058 | Grammatika: Relatiivlaused ja viitamine | нет критерия успеха |
| est-c1-059 | Grammatika: Kõrvallausete süsteem ja lausestuse hierarhia | нет критерия успеха |
| est-c1-060 | Mooduli 6 progressikontroll | нет критерия успеха |
| est-c1-061 | Liikumisviisid ja igapäevane transport | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-062 | Reisimine, liikuvus ja ootamatud olukorrad | нет критерия успеха |
| est-c1-063 | Linn ja maa: elukeskkonna valikud | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-064 | Keskkond ja kliimamuutuse mõju | нет критерия успеха |
| est-c1-065 | Energia ja ressursside kasutamine | нет критерия успеха |
| est-c1-066 | Planeerimine ja avalik arutelu | нет критерия успеха |
| est-c1-067 | Kestlik lahendus ja tegevuskava | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-068 | Grammatika: Sidendid ja tekstisisesed seosed | нет критерия успеха |
| est-c1-069 | Grammatika: Määruslikud suhted, kaassõnad ja käänded | нет критерия успеха |
| est-c1-070 | Mooduli 7 progressikontroll | нет критерия успеха |
| est-c1-071 | Kultuuris osalemine ja kultuurikogemus | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-072 | Film, teater, kirjandus ja tõlgendus | нет критерия успеха |
| est-c1-073 | Keel, identiteet ja kuuluvus | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-074 | Mitmekeelne ühiskond ja vahendamine | нет критерия успеха |
| est-c1-075 | Meediažanrid ja sõnumi kujundamine | нет критерия успеха |
| est-c1-076 | Sotsiaalmeedia ja avalik diskursus | нет критерия успеха |
| est-c1-077 | Arvustus ja kultuuriline argument | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-078 | Grammatika: Kaudne kõne ja refereerimine | нет критерия успеха |
| est-c1-079 | Grammatika: Stiilivariandid ja paralleelvormid | нет критерия успеха |
| est-c1-080 | Mooduli 8 progressikontroll | нет критерия успеха |
| est-c1-081 | Avalikud institutsioonid ja teenused | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-082 | Õigused, kohustused ja reeglid | нет критерия успеха |
| est-c1-083 | Kodanikuosalus ja vabatahtlik tegevus | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-084 | Avalik otsustus ja huvide tasakaal | нет критерия успеха |
| est-c1-085 | Sotsiaalne sidusus ja mitmekesisus | нет критерия успеха |
| est-c1-086 | Kriisiinfo ja ametlik kommunikatsioon | нет критерия успеха |
| est-c1-087 | Debatt ja argumentide kaalumine | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-088 | Grammatika: Kirjavahemärgid keerukas lauses | нет критерия успеха |
| est-c1-089 | Grammatika: Viiteselgus, asesõnad ja tekstiline sidusus | нет критерия успеха |
| est-c1-090 | Mooduli 9 progressikontroll | нет критерия успеха |
| est-c1-091 | Teadus ja innovatsioon igapäevaelus | нет критерия успеха; Avasta: задания <4 пунктов (1) |
| est-c1-092 | Digitaalsed teenused ja tehisaru | нет критерия успеха |
| est-c1-093 | Andmed, statistika ja järeldused | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-094 | Töö ja hariduse tulevik | нет критерия успеха |
| est-c1-095 | Tehnoloogia ja eetilised dilemmad | нет критерия успеха |
| est-c1-096 | Tulevikustsenaariumid ja ebakindlus | нет критерия успеха |
| est-c1-097 | C1 avalik ettekanne ja süntees | нет критерия успеха; Harjuta: задания <4 пунктов (1) |
| est-c1-098 | Grammatika: Keeletäpsus ja veaparandus | нет критерия успеха |
| est-c1-099 | Grammatika: C1 grammatika tervikpilt | нет критерия успеха |
| est-c1-100 | Mooduli 10 progressikontroll | нет критерия успеха |
