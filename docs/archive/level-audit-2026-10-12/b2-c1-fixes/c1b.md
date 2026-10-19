# Отчёт c1b: курс C1, модули 04–06 (уроки est-c1-031…060)

Файлы (рабочая копия /Users/pavel/keelesepp-b2c1, ветка agent/b2-c1-fixes): `c1/module04.js`, `module04b.js`, `module05.js`, `module05b.js`, `module06.js`, `module06b.js`. Изменено 178 строк, удалено 182. Ничего не закоммичено. ID блоков, порядок блоков, их типы и поля `goal` не менялись.

## Ключи и допустимые варианты (11)
- 038 · practice · c1_038_p_gaps: «[jooksma] käima» → **jooksmas**.
- 040 · practice · c1_040_p_trans: ответ под меткой «-maks» не содержал формы на -maks, исправлено на «Parandamaks õppimise kvaliteeti, tuleks telefon … panna». Попутно исправлен падеж объекта: «soovitavad panna telefon» (с подлежащим нужно telefoni).
- 049 · discover · c1_049_d_gaps: добавлены варианты kasv|kasvamine и tõusu|tõusmise.
- 050 · practice · c1_050_p_gram: mure|muretsemine.
- 058 · practice · c1_058_p_gaps: mille|mida (määrama, законченное действие).
- 059 · discover · c1_059_d_gaps: добавлены варианты в 6 пропусков (Kuna|Sellepärast et, selleks et|et, Kuigi|Ehkki|Vaatamata sellele et, Juhul kui|Kui, mistõttu|nii et, Niipea kui|Kohe kui|Kui).
- 060 · discover c1_060_d_gram и practice c1_060_p_gram: добавлены варианты (Kuigi|Ehkki, mistõttu|nii et, kui|juhul kui, et|selleks et).
- 059 · practice · c1_059_p_tf: утверждение «Ta jäi haigeks, kuigi ta ei läinud tööle ega kohtunud kellegagi» было с ключом «false», хотя уступка там логична. Заменено на по-настоящему нелогичное («…kuigi oli külmas vihmas märjaks saanud»), ключ false. Это также относится к пункту «ложные ошибки».

## Эстонский язык (24)
- 038 · discover · c1_038_d_read: образец в самом тексте нарушал правило урока о des-форме («korrates sõnu …, jäävad need meelde»). Исправлено на «jätan need paremini meelde».
- 038 · practice · c1_038_p_order: «raadiot kuulates on mu hääldus paranenud» → «olen oma hääldust parandanud»; «keelekursuselt tunde andmast» → «keelekursusel».
- 038 · practice · c1_038_p_gaps: «sõnu korrates jäävad need» → «jätan need».
- 036: «kolme lauseline» / «kahe-kolme lauseline» → «kolmelauseline» / «kahe-kolmelauseline» (5 мест).
- 034 · practice · c1_034_p_tf: тавтология «väljamõeldud uuringu … välja mõelnud» переписана.
- 043 · discover · reading: «enamik … kirjutavad» → «kirjutab». 043 · transfer · c1_043_t_trans: убрана лишняя запятая перед «ja».
- 044 · reading, 060 · practice reading, 060 · c1_060_p_trans: «valmimad» (у valmis нет сравнительной степени) → «meelsamini valmis».
- 045 · reading: «eelistavad nõustuda …, kui riskida» → «eelistavad pigem nõustuda … kui riskida».
- 047 · reading: «üks juhatuse liikme ettepanek» → «ühe juhatuse liikme ettepanek».
- 048 · reading: «muudab teksti umbisikuliseks» → «isikupäratuks». 048 · practice · c1_048_p_order: убрана poolt-конструкция («mõlema poole poolt»), которую модуль 04 сам учит избегать.
- 050 · reading: «sai kõne kümnetelt» → «kõnesid».
- 051 · c1_051_d_letter: «mainige» → «maini» (обращение на «ты», как в остальном задании).
- 054 · c1_054_d_trans: «abivajadus hinnatakse» → «abivajadust hinnatakse».
- 056 · c1_056_t_fix: «iga uuest» → «igast uuest».
- 058 · transfer · c1_058_t_situation: «juhend, mida keegi ei saa aru» → «millest keegi aru ei saa».
- 058 · discover · c1_058_d_order: «iga hommikul» → «igal hommikul».
- 058 · reading: «milline» больше не подаётся как «более официальная» замена «mis»; добавлена рекомендация языковых нормировщиков.
- 059 · c1_059_t_order и c1_059_t_say: «möödust» → «mööndust».
- 060 · c1_060_p_vocab: «kõige suurem tõend» → «kõige tugevam». 060 · c1_060_p_gram: «Uuringud on vaatlusuuringud» → «Enamik uuringuid on vaatlusuuringud».

## Ложные ошибки (1)
- Только 059 p_tf (см. выше). Блоки errorfix в этих модулях — задания на переписывание («Konkreetsemaks», «Neutraalsemaks»), а не «Paranda viga». Во всех настоящих исправлениях ошибок (039, 040, 050, 059, 060 и др.) «неправильные» предложения действительно содержат ошибки. Конфликтов с правилом порядка слов после kuna/sest нет.

## Нерешаемые задания (12)
- Ответ стоял в подсказке: 038 p_gaps «(tõusma)» → «(tõusma / tõusta)»; 040 d_gram «(kasutama / kasutada)»; 040 p_gram «(panema / panna)»; 038 d_trans — в двух строках исходное предложение уже содержало ответ (tegemast, magamas), исходники заменены.
- 039 · c1_039_p_forms: формы причастий давались без контекста, а ответы для nud/tud в местном, частичном и родительном падежах противоречили сами себе (ehitatud «seesütlev»). Теперь каждая строка — словосочетание с указанием падежа, в инструкцию добавлено правило о том, что nud/tud перед существительным не склоняются.
- «umbisikuline minevik» → «lihtminevik» (035, 047). Подсказки к tõus, kokkulepe (049) и prognoos (055) уточнены: «nimisõna (tulemus…)».
- 059: в d_forms строка «mööndus» неоднозначна с «ehkki» → «(kõige tavalisem)». В p_forms «sellest hoolimata» не начинает придаточное → «vaatamata sellele et».

## Угадываемые задания (41 блок)
- Абсурдные или слишком короткие дистракторы заменены на правдоподобные, той же формы и близкой длины, отличающиеся в тренируемом пункте. Всего 12 блоков choice: 032 p, 034 d, 036 p, 038 p (5 вариантов), 042 p, 044 d, 046 p, 048 p, 052 p, 054 d, 056 p, 058 p (Q6).
- Добавлено по 2 лишних слова в банки слов, где пропусков было столько же, сколько слов: 27 блоков gaps (031 p, 032 t, 033 d/p, 034 p, 035 t, 036 d/p, 040 p_vocab, 041 p, 042 t, 043 d/p, 044 p, 045 t, 046 d/p, 050 p_vocab, 051 p, 052 t, 053 d/p, 054 p, 055 t, 056 d/p, 060 p_vocab).
- В true/false переформулированы ложные утверждения со словами «kõik/ainult»: 035 d_tf, 044 p_tf.

## Чтение (40 вопросов)
- Переписано 1–2 вопроса на каждый текст: во всех reading-блоках уроков 031–060, включая контрольные и тексты с обратной связью 040, 050 и 060. Буквальные вопросы-перечисления заменены вопросами на вывод или сопоставление («Почему…», «Как подтверждает…», «Почему пример X вводит в заблуждение…»). В ответах указаны допустимые варианты через «|». Сами тексты не удлинялись.

## Прочее (п. 7, 6 правок)
- 038 · c1_038_d_letter: тема A2 «Minu nädal» → официальное описание курса C1 с теми же формами плюс -maks.
- 045 · c1_045_t_tr и 055 · c1_055_t_tr: перевод с русского заменён медиацией внутри эстонского языка (разговорная фраза → нейтральная фраза для отчёта или обращения). Тип блока translation сохранён. Неиспользуемая константа `TR` удалена из module05.js и module06.js.
- 040, 050, 060 · transfer · transformation: строки, которые повторяли исходники соседнего errorfix (а одна была с ошибкой), заменены новыми заданиями на парафраз и упрощение.

## Итого
Ключи и варианты — 11, эстонский язык — 24, ложные ошибки — 1 (входит в ключи), нерешаемые — 12, угадываемые — 41 блок, чтение — 40 вопросов, прочее — 6.

## Не исправлено (нужна переработка)
- Аудирования нет совсем (0 блоков listening). В 036 canDo обещает «kuulan», но дан только текст для чтения. Нужно TTS-аудио и задание вроде «10 põhimõtet», а не правка данных.
- Объёмы письма и говорения: письма 250–300 слов (у Harno 220–260), монологи 4–5 минут (у Harno 2). Это следует из норм `levels.js` и всего шаблона, поэтому менять нужно системно.
- Нет форматов Harno C1: 12 утверждений к 4 абзацам, 10 пропусков на уровне предложений, сводка по таблицам или графикам (~180 слов) в 055. Это требует новых блоков, а правила запрещают менять структуру.
- Грамматическая ось 038, 058, 059 остаётся на уровне B1–B2 (ma/da, kes/mis, kuna/kuigi). Ошибки исправлены, но перевод уроков на трудные для C1 зоны (падеж объекта, pruukima, juhtuma, фазовые конструкции) — это переработка.
- Большинство вопросов к чтению всё ещё буквальные (переписаны только 1–2 на текст). Средняя длина предложения 13–17 слов против нормы 19.
- Личные темы в главных продуктивных заданиях (058 d_letter «Minu tervise lugu», говорение в 051/053/055) оставлены.
- Метки формы в пропусках 048–050 («umbisikuline», «nimisõna») оставлены: без них появилось бы несколько верных ответов.
- Правильный вариант в данных choice всегда первый. По комментарию в blocks.js рендер перемешивает варианты; в интерфейсе это не проверялось.

## Проверки
- `npx eslint` на 6 файлов — без ошибок.
- `npx vitest run src/features/worksheet-generator`: 48 файлов (1 упал, 47 прошли), 547 тестов — 14 failed, 532 passed, 1 skipped.
  - В моих модулях упали 3 теста (est-c1-module-04/05/06), все только из-за списка `fixed`. Это исправленные проблемы did-choice-length и didactic: модуль 04 — 6 ключей (032 p, 034 d, 036 p), модуль 05 — 8 (042 p, 044 d, 046 p, 048 p), модуль 06 — 4 (052 p, 056 p). Новых проблем (`fresh`) — 0.
  - Остальные 11 падений — в модулях, которые параллельно правят другие агенты (b1b2-02/07/09/14/15, c1-01/02/03/07/08/09). Их файлы я не трогал.
  - Тесты avastaModule не упали. Baseline нужно пересобрать (это делает ведущий).
