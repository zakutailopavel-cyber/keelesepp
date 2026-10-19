# Исправления B1, часть A (модули 1–4: уроки a2b1-001…020)

Файлы (worktree /Users/pavel/keelesepp-b1):
- crm-v2/src/features/worksheet-generator/admin/module1ThreePhase.js
- crm-v2/src/features/worksheet-generator/admin/avastaModule1.js … avastaModule5.js
- crm-v2/src/features/worksheet-generator/admin/course/b1/module02.js, module03.js, module04.js

ID, порядок и типы блоков, поля `goal` не менялись. Ничего не коммитилось.

## Модуль 1: module1ThreePhase.js (001–005) и avastaModule1.js

**Ключи**
- 005 · practice · 005_p_fix: «kohtun ma sõber» → ключ был «sõpradega», стал «sõbraga» (в исходной фразе один друг). То же в 004 · practice · 004_p_fix.
- 003 · practice · 003_p_gaps: «Nädalavahetusel ma [sageli]…» и «…lähen ma [mõnikord] jala» — добавлены уточнения в контекст и допустимые варианты.
- 003 · practice · 003_p_dialogue: «Ma [tavaliselt] puhkan» → [tavaliselt|sageli|mõnikord].
- Avasta 002, 004, 005 (controlled): добавлены варианты там, где подходит несколько слов (tavaliselt|hommikul, pärast seda|siis, kunagi|mitte kunagi|tavaliselt и т. п.).

**Эстонский**
- 003 · discover · 003_d_order: «Ma ei vaata peaaegu kunagi televiisorit hommikul.» → «Hommikul ei vaata ma peaaegu kunagi televiisorit.». Также «Õhtul ma sageli loen» → «Õhtul loen ma sageli» (так же, как в notice).
- 003 · practice · 003_p_fix: ответ «Õhtul ma sageli loen» → «Õhtul loen ma sageli» (V2, совпадает с notice).
- 003 · practice · 003_p_gaps и Avasta 003: «Ma [mitte kunagi] ei lähe…» → «Ma ei lähe [mitte kunagi]…».
- 002 · transfer · 002_t_decide: вариант «tegin mõlemat korraga» (прошедшее время по ошибке) → «teen mõlemat korraga».
- 005 · discover · 005_d_read: в ключе добавлена запятая перед kui, плюс ещё один вариант ответа.

**Ложные ошибки (errorfix)**
- 002 · practice · 002_p_fix: «Ma ärkan kell seitse hommikul tavaliselt.» (это допустимый эстонский) → настоящая ошибка «Ma ärkan tavaliselt kella seitse.» → «…kell seitse.». Пункт «Enne magama ma loen» → «Enne magama loen natuke» → «Enne magamaminekut loen natuke».
- 004 · practice · 004_p_fix: «Pärast seda ma lähen trenni enne töö» (исправление меняло смысл) → «…kaua, sest teisipäeval lõpetan varem» → «…, aga…». «Pühapäeval pärast seda esmaspäev» → «Ma lähen trenni ja pärast see tulen koju» → «pärast seda».

**Нерешаемые**
- 001 · practice · 001_p_gaps: в инструкции сказано «muuda algvormi», но базовых форм не было. Добавлены (ärkama), (minema), (sööma) и т. д.
- 002 · practice · 002_p_gaps и 005 · practice · 005_p_mix: добавлены базовые формы. Для harva добавлен контекст «ainult paar korda kuus».

**Угадываемые**
- 004 · discover · 004_d_predict: абсурдные варианты («Nädal muutub lühemaks», «iga päev / mitte kunagi» на вопрос о двух тренировках). Правильный ответ был втрое длиннее остальных; дистракторы стали той же длины, но без связок или с неверной связкой.
- 004 · transfer · 004_t_decision («öösel kell kaks»), 005 · transfer · 005_t_infer («Ta ei tea, mis päev on reede»), 001 · transfer · 001_t_infer («Mis su nimi on?») заменены правдоподобными вариантами.
- Avasta 001–005, блок general: убраны «Tähestiku järgi», «Sõnade pikkuse järgi», «Ühe linna ajalugu», «Tema lemmikvärv», «Kohtun, reedel, puhkan, sest». У правильного ответа больше нет выделения по длине.
- Avasta 002, 004: в банки добавлено по 2 лишних слова.

## Avasta модулей 2–5 (avastaModule2–5.js)

**Модуль 2 (006–010)**
- угадываемые: 006 general «Õde on sõna.», «Mis värvi on laud?»; 009 «Jalutamine on sõna.»; 010 «Nende kinganumber», «Ilmateade». Вместо них правдоподобные варианты.
- 009: вопрос «ei toimu alati» был двусмысленным (mitte kunagi тоже «не всегда») → «toimub mõnikord, aga mitte alati».
- нерешаемые: 008 controlled «[ema] (ema)», «[õpetaja] (õpetaja)»: ответ совпадал с подсказкой → (tütar) → tütre, (naaber) → naabri.
- банки 006, 007, 009 расширены. В 009 добавлены варианты tavaliselt|vahel.

**Модуль 3 (011–015)**
- эстонский: notice 012 «Olen laual» → «Telefon on laual / Panen telefoni lauale / Võtan telefoni laualt». «Hommikul tulen kodust» → «lähen kodust välja». «turuplats» → «turg». «Rongi peale minekuks» → «Pean rongile jõudma, seega…».
- угадываемые: 011 general («Millal sa sündisid?», «Miks buss hilineb?»), 013 («turuplatsile/bussipeatusse»), 014 («Vaata ise», «Mis su lemmikvärv on?»).
- банки 011, 013, 014 дополнены неверными формами (lauale, kappi, apteegis, pangast, minge, vastas).

**Модуль 4 (016–020)**
- эстонский: 016 «alates kell üheksa kuni kell üksteist/viis» → «(alates) kella üheksast (kuni) kella …ni» в general, notice и controlled.
- эстонский: 017 «ei või» как запрет → «ei tohi» в vocab, notice (+ строка «ei pea ≠ ei tohi»), controlled, reading и speaking.
- ключи: 018 controlled: в банке было «mul on vaja», а в предложении уже стояло «Mul [on vaja]» → «[Mul on vaja]». В 020 controlled «Siin [võib|saab]».
- угадываемые: 019 general «Tere!» → правдоподобный отказ.
- банки 016, 017, 018 дополнены (enne, kell, pead, võid, võin, kohe).
- чтение: 016 (во сколько приходит в офис = kolmveerand üheksa; что делает с несрочными задачами), 017 (почему нельзя наушники; должен ли чистить все приборы), 018 (что вместо тренировки), 019 (где встречаются в четверг; формулировка «Millise uue aja pakub…»), 020 (почему не успевает к пяти).
- 020 vocab: «kõrvalt» → «kõrval».

**Модуль 5 (021–025)**
- эстонский: 023 «Mis on oleviku algvorm?» → «Mis on verbi algvorm?». Intro «Milline vorm tähendab „oli”? — olema minevik…» → «„Oli” on minevikuvorm. Mis on selle algvorm?». 024 wordorder «hiljem kui plaanis» → «hiljem kui plaanitud».
- угадываемые: 025 general «Kõik laused on küsimused», «Tekstis ei ole verbe» → «toimuvad praegu ja korduvad», «tulevikuplaanidest».
- чтение: 021 (что делал вечером, как помог коллеге), 022 (что решили сёстры), 023 (почему им теперь легче встречаться), 025 (сделал ли Oliver то, что планировал).

## module02.js (006–010)

**Ключи**
- 007_p_much: «[üsna|natuke] abivalmis».
- 009_p_freq: «[peaaegu kunagi|kunagi]».
- 009_t_chat: «[läheme|lähme]».
- 010_p_mixed: «[sest|kuna]».
- 010_t_gaps: «[väga|üsna|natuke]».

**Эстонский**
- 008 · transfer · 008_t_msg: «Ma panin selle [minu] ukse juurde» → «[oma]».
- 009_t_chat: «rannas jalutama» → «randa jalutama».
- 007_p_degree: «räägib vahel vähe, aga sõpradega palju» → «räägib võõrastega vähe…».
- 010_p_trans: «Ta naerab palju» → «naljakas» (смысл менялся) → «Ta räägib palju nalja».

**Ложные ошибки**
- 008_p_fix2: «See on minu ema auto ja minu isa auto» (правильно, а исправление делало из одной машины две) → «Ma elan minu vanemate juures» → «oma vanemate juures».
- 008_p_fix2: «See on teie oma?» (в речи допустимо) → «Need on tema» → «Need on tema omad».
- 010_p_fix: «Me alati sööme koos» (в разговорной речи допустимо) → «Me läheme pühapäeval vanaema juures» → «juurde».

**Нерешаемые**
- 010_p_mixed «Kümme punkti» при 6 пунктах → «Kuus punkti».
- 010_p_forms «Kümme vormi» при 8 → «Kaheksa vormi».
- «[teie] (teie)» → «(te)» в 010_p_mixed и 010_t_gaps.
- 010_t_self: «70–90 sõna» → «80–100 sõna» (как в задании и рубрике).

**Угадываемые**
- 006_t_reply: все 4 вопроса. Вместо «Mis kell on?», «Kus on pood?», «Head ööd!» теперь вежливые реакции другой функции или другого времени («Kuhu te homme lähete?»).
- 006_p_logic: тавтология «venna poeg = vennapoeg» → «õe tütar = vennatütar» (vale). Ложное утверждение с «alati» заменено.
- 007_p_degree: дистракторы теперь различаются степенью (natuke / ei ole), а не смыслом (laisk, närviline).
- 008_t_check: «Kask on puu», «Asi on kuuse all» заменены.
- 010_p_mix: «oli on» → «olen».
- Банки 006_p_poss, 008_t_msg (+ minu, nende, aga), 009_p_freq, 009_p_fill дополнены лишними словами.

**Чтение (вопросы на понимание вместо копирования)**
- 006_p_read: сколько детей у родителей Kati (4), сколько лет Liisa (22).
- 006_t_profile: зачем семья ездит в Tartu.
- 007_p_read: кто готовит в походе.
- 007_t_ad: сколько часов в день работа (4).
- 008_p_read: почему часы принадлежат Leo.
- 008_t_notice: как связаться с владельцем кошелька.
- 009_p_read: почему звонят брату.
- 009_t_poll: «Mitu vastajat…» = 100.
- 010_p_read: почему отец чинит сад.
- 010_p_read2: почему Marko хочет жить в центре.
- 010_t_read: сколько человек в доме (6).

## module03.js (011–015)

**Ключи**
- 015 · practice · 015_p_choose: «Ta tuleb kell viis …», ключ «*tööl» (ошибка; два ответа верны) → «Ta tuleb kell viis … koju.» *töölt / tööl / tööle.
- Добавлены варианты: 011_px_pos «[ees|vastas]», 015_px_mix «voodi [kõrval|juures|ees|taga]».

**Эстонский**
- 015_px_read: «elada maja kõrval, kus on oma aed» → «elada majas, kus on oma aed».
- 014: незнакомому туристу на «te» отвечали формой sa. В 014_t_tourist, 014_t_roles и 014_tx_gaps стало «Minge / Pöörake / ületage / Väljuge».
- 014_px_signs: «siin pane auto» → «siia saab auto parkida» и т. п.

**Ложные ошибки**
- 014_p_fix: «Lähed otse…» (допустимо) → «Mine otse ja pööra vasak.».
- 015_px_fix2: повтор пункта «Raamat on riiulile» с того же листа → «Pane raamat riiulil.» → «riiulile».

**Нерешаемые**
- 011_p_where: «[voodi] (voodi)» → «[akna] (aken)».
- 011_p_room: заголовок «Vaata Eliise tuba» ссылался на картинку, которой нет → «Kas tähendus on sama?». Абсурдное «Vaip on laes» заменено.
- 012_tx_check: добавлено «(naaber)».
- 015_p_cases и 015_px_mix: «Kümme vormi» → «Kaheksa vormi».
- 015_px_mix: «[Mine] (minema)».

**Угадываемые**
- 011_t_fit: «Ei sobi: buss ei sõida», «Sobib: korter on tasuta» → неверные детали из объявления.
- 013_p_sense: «Ma laenutan pangast raamatu» (A1) → мини-текст Daniel и утверждения на понимание форм (pangas, apteeki, raamatukokku ei jõudnud).
- 014_p_signs: сопоставление с русским → эстонские толкования.
- Банки 011_px_pos, 011_tx_sms (+ kööki, elutuppa, kõrvale), 014_px_route, 014_tx_gaps (+ pööra/mine против pöörake/minge) дополнены.
- 014_p_imp: добавлены 4 строки te-käsk (tulge, sõitke, minge, pöörake), инструкция sa/te. Selfcheck обновлён.

**Чтение (вопросы на понимание вместо копирования)**
- 011_px_read: что у окна.
- 012_px_read: куда поедет в субботу (sinna → Tartusse).
- 012_t_story: что сделает иначе.
- 013_px_read: что делает с другом.
- 013_tx_guide: можно ли в магазин в воскресенье.
- 014_px_read: во сколько прийти на приём к 10 (9.50).
- 014_tx_map: была ли Laura в Tartu.
- 015_px_read: в каком доме хочет жить.
- 015_t_read: зачем в цветочный.

## module04.js (016–020)

**Эстонский / ei tohi**
- В уроке 017 запрет теперь выражен через «ei tohi»: 017_p_mean, 017_p_rules, текст 017_px_read и вопрос, 017_px_mod (+ ei pea как дистрактор), 017_px_write, 017_px_dict («Arve tuleb maksta reedeks»), 017_px_rules, текст 017_t_rules, 017_t_note, 017_t_compare, 017_tx_signs, 017_tx_rules2, selfcheck.
- 017_p_sort: добавлена группа «Keeld (ei tohi)».
- 017_tx_signs: дистракторы «Siin peab suitsetama» → «Siin ei pea suitsetama» (тренирует ei pea ≠ ei tohi).
- 020_t_s2: местный жителю-незнакомцу «Mine…» → «Minge…».
- 019_p_phone: собеседник «Arst» → «Registratuur».

**Нерешаемые и уровень**
- 016_px_times: время словами (A1) → часы работы с вывесок: «kella kaheksast kella kaheksani» (A2, elatiiv/terminatiiv). Варианты через «/», как требует таблица.
- 016_tx_time: «Kellaajad» → время внутри программы поездки (kell kaheksa, kella poole kümnest, kella seitsmeks).
- 016_px_join: инструкция «enne või pärast» не подходила к 4-му пункту → «Kasuta antud sõna».
- 020_p_mix: добавлены (pidama), (võima).
- 020_px_trans: «Ma olen kodus → Ma lähen koju» (смысл менялся) → «Apteek on avatud 9–18 → alates kella üheksast kuni kella kuueni».
- 020_tx_gaps: «maja [kõrval|lähedal|ees|taga|juures]».

**Угадываемые**
- 019_p_react: все 4 вопроса. Убраны «Ma ei taha sinuga kohtuda», «Pole minu probleem», «Ei sobi kunagi». Все варианты вежливые и различаются функцией, правильный ответ больше не выделяется длиной.
- 019_t_reply: все 4 вопроса. Убраны «Kell kuus on hommik», «Head aega!».
- 017_p_mean: «See on hea mõte» → «Seda ei pea tegema, aga võib».
- Банки 016_p_from, 016_tx_plan, 018_p_list, 018_px_need (повтор «uusi kingi» заменён), 018_tx_reply, 019_px_phr дополнены 2 лишними словами каждый.

**Чтение (вопросы на понимание вместо копирования)**
- 016_px_read: что до завтрака.
- 016_t_camp: когда можно телефон, длительность уроков (+ вариант «kolm ja pool tundi»).
- 017_px_read: можно ли сдать в понедельник.
- 017_t_rules: можно ли велосипед в подъезде.
- 018_px_read: пойдёт ли точно на день рождения.
- 019_px_read: что делают до фильма.
- 019_tx_read: что будет, если не выбрать время.
- 020_p_read: кто предложил новое время.
- 020_tx_read: почему не встаёт в субботу в 7.

## Количество (примерно, по пунктам)

| Вид | Сколько |
|---|---|
| ключи (неверный ключ, недостающие варианты, банк не совпадал с предложением) | ~26 |
| эстонский (формы, управление, порядок слов, sa/te, ei tohi) | ~40, из них ~15 в связке «ei tohi» |
| ложные ошибки в errorfix | 9 |
| нерешаемые (заголовки, ответ в подсказке, нет базовой формы, ссылка на несуществующие данные) | ~20 |
| угадываемые (абсурдные дистракторы, выделение по длине, банки 1:1) | ~45 вопросов с вариантами + 30 банков |
| чтение: переписано вопросов | ~42 (по 1–2 на текст) |

## Не исправлено (нужна переделка побольше)

1. Тексты для чтения 80–140 слов, а у Harno B1 самый длинный текст ~250+ слов. Нет форматов экзамена: gap-письмо с 3 вариантами, банк фраз с лишними, 9 ситуаций ↔ 6 объявлений. Нужны новые тексты, это не точечная правка.
2. 020 «Vahehindamine 1 — A2 baas» не похож на экзамен A2: нет визитки или переноса информации, нет письма с 8 пропусками по 3 варианта, нет аудирования с записью. Нужно спроектировать заново.
3. 016_p_clock (время словами, A1) остался: тип блока менять нельзя. Два других блока на время переделаны.
4. Модуль 5 / Avasta 021–025: нет täisminevik, хотя тема «kogemused». Нужен новый материал в уроки 024/025.
5. avastaModule5 · 023 · meta.goals.g_notice: написано «seostab **oleviku** vormid tuli, läks…», а это формы прошедшего времени. Не менял, потому что правило запрещает трогать goals. Нужно решение владельца.
6. Блоки «general» в Avasta модулей 1–2 метакогнитивные («Mis on teksti peamine eesmärk?») и не привязаны к конкретному тексту листа. Абсурд убран, но по-хорошему их нужно переписать под реальный текст.
7. В каждом листе остаются перевод с русского, диктант и сборка предложения (A1–A2). Это вопрос состава модуля.
8. Errorfix принимает только один правильный ответ: «Riided on kapis» засчитывается, а «kapi sees» нет. Это ограничение движка, а не данных.
9. В модуле 1 разговорный порядок «Ma tavaliselt töötan…» оставлен как допустимый: он присутствует в notice, и я не стал объявлять его ошибкой.
10. 018_p_prio: столбец «Miks?» отчасти подсказывает ответ. Оставил, потому что это задание на принятие решения по причине.

## Проверки

- `npx vitest run src/features/worksheet-generator`: Test Files 1 failed | 46 passed (47); Tests 7 failed | 530 passed | 1 skipped (538). Падает только course.test.js:
  - a2b1-module-02: только список `fixed` ["a2b1-009|practice|didactic"], то есть проблема из baseline исчезла. Это ожидаемо, нужно перегенерировать baseline.
  - a2b1-module-03 и a2b1-module-04 проходят без новых проблем.
  - Падения a2b1-module-05, 06, 07, 08, 12, 13 относятся к файлам других агентов (module05.js… module13.js), не к моим.
- Тесты avastaModule1–5 и module1ThreePhase: 6 файлов, 43 теста, все прошли.
- `npx eslint` по 9 моим файлам: ошибок нет.
