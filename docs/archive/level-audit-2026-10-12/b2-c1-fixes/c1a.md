# c1a — правки C1, модули 1–3 (est-c1-001…030)

Файлы: `crm-v2/src/features/worksheet-generator/admin/course/c1/module01.js, module01b.js, module02.js, module02b.js, module03.js, module03b.js` (worktree /Users/pavel/keelesepp-b2c1). Ничего не коммитил, базу не трогал. Id, порядок и типы блоков, `goal` не менял.

## Что изменено по урокам

### Ключи и противоречия с текстом
- 010 · transfer · c1_010_t_read: в отзыве Татьяне «X asemel Y» было перевёрнуто (выходило, что она писала правильную форму вместо ошибочной) → исправлено для «aruanne/aruande», «meeskonnast», «autoriga», «suhtluse vastu». «16 из 20 по грамматике» → «4 из 8» (в блоке грамматики 8 заданий).
- 010 · practice · c1_010_p_self и 020 p_self, 030 p_self: «16 punkti 20-st» → «11 punkti 14-st» (на листе 6 + 8 = 14 заданий).
- 020 · transfer · c1_020_t_read: «15 из 20» → «5 из 8»; «Moodul 3 käsitleb haridust» → модуль 3 про услуги, потребление и деньги.
- 030 · transfer · c1_030_t_read: «16 из 20» → «5 из 8».
- 016 · discover · c1_016_d_read: текст говорил «ни один источник не упоминает учителей и учеников», хотя выше были письмо учителей и обращение ученического совета → «три первых источника не упоминают…; эти голоса пришли позже». Вопрос 7, p_choice (4-й вопрос) и p_fix согласованы с этим.
- 019 · transfer · c1_019_t_draft / t_order: в тексте друга не было ошибок, о которых говорят правила («olukorda välja», «huvitatud») → в черновик внесены эти ошибки («raskesse olukorda välja», «huvitatud numbrite vastu»).
- 008 · discover · c1_008_d_fix: последняя строка была «правильно → правильно (õige)», хотя в инструкции сказано «в каждом предложении ошибка» → «Akna avati…» → «Aken avati…».
- 008 · practice · c1_008_p_tf: 5 из 6 утверждений были верными → «tehti otsuse» (false).
- 008 · transfer · c1_008_t_table: добавлен вариант «kuulutuse» (полный объект тоже правильный).
- Добавлены допустимые варианты через «|»: 002 p_gaps «mõnevõrra|pigem»; 016 p_gaps «seevastu|aga», «samas|kuid|ometi»; 023 p_gaps «tingimusel et|eeldusel et» (оба пропуска); таблицы 005 d_table/t_table, 008 d_table, 013 d_table, 023 d_table; 020 d_gram «tõttu|pärast».

### Эстонский язык
- 002 d_read: «mõlemad pooled mõnevõrra õigus» → «mõlemal poolel … õigus».
- 003 d_read: перевёрнутая конструкция «X asemel lausele Y» → «öelda X lause Y asemel».
- 005 d_read: «samuti umbes sama suured» → «ka umbes sama suured».
- 008 d_read: «mõtlema» убрано из списка глаголов «всегда с частичным объектом» (ср. «mõtles plaani välja») → «kahetsema».
- 009 d_read: «mõtlen sinust» больше не подаётся как ошибка; пример интерференции заменён на «aitan sulle → aitan sind»; добавлено, что «mida sa sellest mõtled?» спрашивает мнение. Вопрос 3, d_fix, t_table согласованы.
- 012 p_choice: «väliste ohu tõttu» → «välise ohu tõttu».
- 013 d_read: «avaruse keskele» → «väljaku keskele».
- 015 d_read: «seavad ohtu nii nemad ise» → «nii neid endid kui ka teisi».
- 018 t_order: «tuleb pöördelise tegusõna» → «pöördeline tegusõna».
- 019 d_read: «Vahet on peen» → «Vahe on peen»; несуществующий «EKI ühendsõnastik» → «Sõnaveeb» (и в 019 t_order).
- 021 d_read: «kliinikust, kes küsis» → «mis küsis»; 021 t_say: «kas klient on alati õigus» → «kas kliendil on alati õigus» (2 места).
- 023 d_read: «Lepi sõnul/kogemuse» → «Lepa» (4 места); d_gaps «teise poolt teavitada» → «teist poolt».
- 026 p_bank: «ning mainida ka» → «ning maini ka»; t_self «arutlesin … õiglusest» → «õigluse üle».
- 027 p_trans: исходное предложение «Laur on õigus» → «Lauril on õigus».
- 006 d_fix: в «нейтральном» эталоне было разговорное «nagunii» → убрано.

### Ложные ошибки (errorfix)
- 001 p_fix: «kuuluvust kahe kultuuriga → kahte kultuuri» (спорно) → «huvitatud oma juurte vastu → juurtest»; эталон «tundsin end esialgu võõrana» → минимальная правка без нового смысла.
- 003 d_fix: «see on kohustus → kohustuslik» (оба верны) → «julgenud … välja ütlema → öelda»; «Kaudsus on alati halb» (не грамматика) → «tulenevad ootustele → ootustest».
- 004 p_fix: «sest et.» (обрывок) → «ettepanekut nõustuda → ettepanekuga»; во всех строках эталон = минимальная правка исходной фразы (раньше добавлялся новый смысл).
- 009 p_fix: эталоны сделаны минимальными; строки с подсказкой в скобках («(ma harjun praegu)», «(töötab edasi)») заменены на «tegelen … peale → küsimusega» и «hoolin, et → hoolitsen selle eest, et».
- 011 p_fix: «ei mõelnud kõrvalkuludest» (допустимо) → «ei pööranud kõrvalkulud tähelepanu → kõrvalkuludele».
- 012 d_fix: «Kogukond tekib iseenesest…» (содержание, не язык) → «seisid vastu linna plaani → plaanile»; остальные эталоны минимальные.
- 019 p_fix, 020 t_fix, 030 t_fix: эталоны = минимальная правка (исходные фразы удлинены, чтобы сохранить длину предложений C1).

### Нерешаемые
- 008 p_forms: 4 строки «raamat» без контекста → у каждой строки мини-контекст («lugesin … terve õhtu», «ostsin poest mõned …» и т. д.), так же для võti/küsimus/otsus.
- 012 p_forms: «panustama, -us → panus» (это не суффикс -us) → подсказка «nimisõna, millest tegusõna on tuletatud».
- 025 p_forms: «kahekordistuma, minevik (see)» (совпадает с существительным) → «lihtminevik (hind … aastaga)».
- 009 t_gaps: ответ выдавался в подсказке «[arv] (arv)» → «[vigade] (viga)».
- 010 d_gram: «[essee] (essee)» → «[artikli] (artikkel)».
- 019 p_tf: бессмысленное «jäi eile tööle koju» → «sai temast hea esinejana» (false).
- 020 d_gram: пропуск без слова в скобках → добавлено «(kaassõna)».
- 029 d_gaps: инструкция «sobivas kõneviisis» → «… või modaalses konstruktsioonis».
- 010 t_read, 020 t_read, 030 t_read: см. «Ключи» (числа баллов не совпадали с листом).

### Угадываемые
- choice без языка (абсурдные/короткие/грубые дистракторы) переписаны: по два правдоподобных варианта той же длины и регистра, отличающихся тем, что тренирует урок:
  - 002 p_choice (6 вопросов): слишком категорично / слишком уклончиво;
  - 004 p_choice (6): уступил / граница без «моста»;
  - 007 p_choice (6): без опоры / сдача позиции / оценка вместо аргумента;
  - 012 p_choice (6), 016 p_choice (6): чуть шире текста / смещённый акцент / перепутанные стороны (убрана грамматическая ошибка «vanemad on õigus» в дистракторе);
  - 014 d_choice (вопрос 6): убраны «ainult …»;
  - 018 p_choice (6): все варианты грамматичны (V2 соблюдён), различаются только темой/ремой;
  - 022 p_choice (6): разная степень уверенности; в 6-м — неполная конструкция «mida … seda»;
  - 024 d_choice (6): оценка / размыто / угроза / неразумный срок;
  - 026 p_choice (6): верно, но не просто / перевёрнуто / неверно о правилах;
  - 028 p_choice (6): все три варианта грамматичны и различаются только временем (убраны «… eile», «harjutasin homme»).
- truefalse, где все ложные утверждения содержали «alati / ainult / kõik / täielikult»: переформулированы ложные утверждения в 014 p_tf (3), 015 d_tf (3), 024 p_tf (2), 025 d_tf (3). Ошибка теперь в причине, субъекте или степени.
- Банки слов «столько же слов, сколько пропусков»: добавлено по 2 правдоподобных лишних слова (и в инструкции «Kaks sõna jääb üle») — 001 p_gaps, 002 p_gaps, 002 t_gaps, 003 p_gaps, 004 p_gaps, 005 p_gaps, 006 p_gaps, 007 p_gaps, 010 p_vocab, 011 p_gaps, 012 t_gaps, 013 d_gaps, 013 p_gaps, 014 p_gaps, 015 t_gaps, 016 d_gaps, 016 p_gaps, 020 p_vocab, 021 p_gaps, 022 t_gaps, 023 d_gaps, 023 p_gaps, 024 p_gaps, 025 t_gaps, 026 d_gaps, 026 p_gaps, 030 p_vocab.

### Чтение
- 003 d_read Q1: «Mis on „nähtamatu leping”?» → «Miks nimetab Laur neid ootusi nähtamatuks lepinguks?» (с вариантами).
- 010 t_read Q1, 020 t_read Q1, 030 t_read Q1: «Mis on … tulemus? [79 protsenti]» → вопросы на вывод (оценка учителя, развитие, сильнейший рост) с вариантами ответа.
- 023 d_read Q3: «Kellel on tõendamiskohustus? [üürnikul]» → ситуативный вопрос (протечка у соседа), ответ надо перефразировать.
- 027 d_read: удалена фраза, где автор сам хвалит своё «честное самокритичное» окончание; Q7 теперь требует вывода об отношении автора.
- 009 d_read Q3 переписан вместе с новым примером интерференции.

## Количество
- ключи / противоречия: 14
- эстонский: 20
- ложные ошибки (errorfix, строки/блоки): 10 блоков (~30 строк)
- нерешаемые: 10
- угадываемые: 11 блоков choice (~61 вопрос), 4 блока truefalse (11 утверждений), 27 банков слов
- чтение: 7 вопросов (6 текстов)

## Не исправлено (нужна переработка)
- Длина письма (250–300 слов, в каждом листе) и монологов (240–300 с) выше Harno C1 (220–260 слов, доклад ~2 мин). Норма зашита в `levels.js` (C1 writing [250,400], speaking [240,420]); менять её и все 90 листов — вне моих файлов.
- Грамматические уроки 008, 009, 018, 019, 028, 029 по сути B1–B2 (дриллы на одно слово). Нужна переделка в редактуру текста ~250 слов и добавление настоящей грамматики C1 (lauselühendid, причастные обороты, mine-konstruktsioon). Также устные «Räägi … (lihtminevik)» в 028.
- Тексты для чтения 500–555 слов (Harno ~550–600), средняя длина предложения ниже нормы C1; 7 открытых вопросов вместо форматов Harno (12 утверждений ↔ 4 абзаца, пропуски-предложения, краткие ответы 1–4 слова).
- Нет аудирования, нет сводки по двум графикам (~180 слов) — нужны новые блоки/данные.
- Много личных жанров («Minu keeled ja mina», письма другу) — Harno C1 требует адресата-учреждение; это смена заданий, а не правка.
- 020 t_write и 010/030 t_write «Kiri iseendale (10–12 lauset)» — рефлексия уровня A2–B1, оставлена как метазадание.
- Переводы с русского (TR) оставлены; в 015 t_tr тривиальная строка «Скажу проще» заменена, остальные не трогал.

## Тесты
- `npx vitest run src/features/worksheet-generator` (повторный прогон после возобновления): Test Files 1 failed | 47 passed (48); Tests 14 failed | 532 passed | 1 skipped (547).
- 13 падений — в `course.test.js:15` (список `fixed`, то есть исправленные проблемы ушли из baseline). Одно падение в `course.test.js:13` (`fresh`) — в b1b2-module-02, это не мой файл (параллельная правка). В моих модулях est-c1-module-01/02/03 список `fresh` пуст. Для моих модулей в `fixed`: est-c1-module-01 — did-choice-length/didactic у 002, 004, 007 practice; module-02 — 012, 016 practice; module-03 — 026 practice. Остальные падения (b1b2-02/07/14/15, c1-04/05/07/08) — от параллельных правок в других файлах.
- avastaModule и все остальные файлы тестов прошли.
- `npx eslint` для 6 моих файлов — без ошибок.
- Промежуточно мои минимальные эталоны в 004 p_fix и 019 p_fix давали новую проблему «короткие предложения» (fresh); исправил удлинением исходных фраз — fresh снова пуст.
