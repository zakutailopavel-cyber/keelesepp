# Агент C — исправления модулей 9–11 (B1-путь) и Avasta 9–10

Рабочая копия: `/Users/pavel/keelesepp-b1`, ветка `agent/b1-didactic-fixes`. Ничего не коммитил.

Файлы:
- `crm-v2/src/features/worksheet-generator/admin/course/b1/module09.js`
- `crm-v2/src/features/worksheet-generator/admin/course/b1/module10.js`
- `crm-v2/src/features/worksheet-generator/admin/course/b1/module11.js`
- `crm-v2/src/features/worksheet-generator/admin/avastaModule9.js`
- `crm-v2/src/features/worksheet-generator/admin/avastaModule10.js`

ID блоков, порядок и типы блоков, цели (`goal`) и заголовки, по которым Avasta-апгрейдер ищет блоки, не менялись.
Альтернативные ответы в errorfix и transformation я писал через «;». Движок делит ответ по `, ; \n`, поэтому «|» там не сработал бы.

---

## Модуль 09 — Töö ja ametid (041–045)

### Ключи (8)
- 041 · practice · 041_p_fix: «Ta peab kontrollida arveid» → принимаются оба порядка слов (`…arveid kontrollima; …kontrollima arveid`).
- 043 · practice · 043_p_dialog: «süsteemi [mõista]» → `[mõista|õppida|tundma õppida]`.
- 043 · transfer · 043_tx_trans: «Ma vajan abi» + vaja → ключ «Mul on vaja abi küsida» не следовал из исходной фразы. Исходная фраза теперь «Ma pean abi küsima».
- 044 · practice · 044_p_model: `[Sellepärast|Seepärast]`, `[sobin|sobiksin]`.
- 044 · practice · 044_p_dialog: `[rahulik|täpne|sõbralik|kannatlik]`, `[sobin|sobiksin]`, `[tööaeg|palk|töögraafik]`.
- 044 · practice · 044_p_read: «Mida Pavel ise küsis?» → добавлен вариант из текста «kas firmas on võimalik koolitusel käia».
- 044 · transfer · 044_t_read: «näide» → `näide|näidet|näite`.

### Эстонский (6)
- 042 · practice · 042_p_read: прямая речь без кавычек → «„Mulle meeldis suhelda klientidega,” ütleb Juri».
- 043 · practice · 043_p_read: «iga hommikul» → «**igal** hommikul». Исправлено и в тексте, и в вопросе.
- 041 · transfer · 041_tx_trans: «Tema ülesanne on dokumendid» → «Dokumendid on tema vastutusel». «See töö on mulle hea» → «See töö on mulle sobiv».
- 045 · transfer · 045_tx_trans: «Minu ülesanne on kassa» → «Kassa on minu vastutusel». «See töö on mulle hea» → «Ma olen selle töö jaoks õige inimene».

### Ложные ошибки в errorfix (4)
- 041 · practice · 041_p_fix: «Kokk töötab haiglas…» → «Arst…». Это ошибка содержания, а не языка. Заменено на «Õde hoolitseb patsiendid eest» → «…patsientide eest».
- 042 · practice · 042_p_fix: «Kõigepealt ma kontrollisin homme…» — исправить можно было несколькими способами. Заменено на «Eile ma kontrollin…» → «Eile kontrollisin ma…». Принимаются оба порядка слов.
- 042 · transfer · 042_tx_fix: «Mulle meeldis aidata külalisi eile» — грамматически правильно, ошибкой не является. Заменено на «Mulle meeldis külalisi aitama» → «…aidata».
- 044 · transfer · 044_tx_fix: «Minu tugevus on, et ma olen täpne näiteks» — исправить можно по-разному. Заменено на «Minu tugevus on täpne» → «…täpsus».

### Нерешаемые (3)
- 045 · practice · 045_p_mix: заголовок «Kümme punkti», а пунктов 8 → «Kaheksa punkti».
- 043 · practice · 043_p_table: инструкция «Kirjuta puuduv vorm», хотя обе формы уже даны → «Lõpeta näitelause: kirjuta verbi õige vorm».
- 042 · practice · 042_p_tense: в «Mulle … see töö väga» не было указания времени (подходит и meeldib) → «Eelmises töökohas … mulle töö väga», варианты meeldis / meeldib / meeldisin.

### Угадываемые (6 блоков)
- Добавлены банки слов с 2 лишними словами. Лишние слова — неправильная форма или другое слово:
  - 041_p_gaps (+ravib, ehitab);
  - 041_tx_gaps (+suhelda, juhiloa);
  - 044_p_model (+kontrollin, kogemus);
  - 045_tx_gaps (+kogemus, töötama).
- 044 · transfer · 044_t_check: убраны абсурдные дистракторы («Mina olen inimene», «Lihtsalt niisama», «Ma ei tea»). Все 5 пунктов переписаны: теперь это слабые, но реальные ответы одинаковой длины (без примера, «близко к дому», «мало платили», рассказ о семье вместо опыта).
- 042_p_tense: дистракторы стали той же формы (см. выше).

### Чтение (15 вопросов переписаны: нужно сопоставить или пересказать)
- 041_p_read ×2: «Kuidas Andrus eesti keelt õpib?», «Miks tahab Maria kursust teha?».
- 041_t_read ×1.
- 042_p_read ×2: сколько лет на складе (сопоставить годы), в скольких местах работал.
- 042_t_read ×1: сколько лет в Эстонии.
- 043_p_read ×2.
- 043_t_read ×2: почему важен язык; можно ли не работать в выходные.
- 044_p_read ×2: во сколько пришёл (9.50); что помогло.
- 044_t_read ×1.
- 045_p_read ×1.
- 045_t_read ×1: сколько дней в офисе.

---

## Модуль 10 — Reisimine ja transport (046–050)

### Ключи (7)
- **046 · transfer · 046_t_check: «Kus väljub rong? → *Balti jaamas» → «Kust väljub rong Tartusse? → Balti jaamast»**. Это критичная находка аудита. Дистракторы теперь тоже в исходном падеже: bussijaamast, lennujaamast.
- 046 · practice · 046_p_forms: подсказка «kuhu? (-sse)» вела к неверной форме, ведь ключ был «jaama». Подсказка теперь «kuhu?», принимаются jaama и jaamasse, lennujaama и lennujaamasse.
- 046 · transfer · 046_tx_gaps: `[sõida|mine]`, `[internetis|rongis]`.
- 049 · practice · 049_p_dialog: `[Millal|Mis kell]`.
- 049 · practice · 049_px_fix: добавлены приемлемые порядки слов.
- 049 · transfer · 049_tx_gaps: `[avatud|lahti]`.

### Эстонский (7)
- 046_t_read: «kaardiga maksmisega» → «Pileti saab osta trammis pangakaardiga».
- 048_t_read:
  - «istusin öörongi peale» → «istusin öörongi»;
  - «rääkis meile» → «mulle», потому что рассказчик путешествует один.
- 048_t_dialog: «Mis sa … ostsid?» → «Mida sa…».
- 049_p_problem: «Ühendus jäi maha» → «Jäin ümberistumisel bussist maha».
- 049_p_read: «ei läinud infoletti» → «infoleti juurde».
- 049_tx_fix: в «Ma jõuan koosolekul hiljaks» было две ошибки сразу → оставлена одна: «Ma jään koosolekul hiljaks» → «…koosolekule…».

### Ложные ошибки (2)
- 046_p_fix: «Rong saabub jaamasse» помечено как ошибка, но «jaamasse» допустимо. Заменено на «Ma ootan bussi peatusse» → «peatuses».
- 047_px_fix: «Kuna rong on mugavam, me valime rongi» — прямой порядок после придаточного не ошибка. Заменено на «Rong on rohkem mugav kui buss» → «mugavam». Это типичная калька.

### Нерешаемые (3)
- **046 · practice · 046_p_timetable**: таблица ссылалась на расписание, которого нет на листе. Теперь это «Sõiduplaan Tallinn–Narva» по тексту «Ilja sõit Narva» с того же листа: строки поезд и автобус, пропущены время и цена.
- 050_p_mix: «Kümme punkti», а пунктов 8 → «Kaheksa punkti».
- 046_tx_trans: «Ma sõidan sinna ja tagasi» → «Ma ostan edasi-tagasi pileti» — не перефраз. Исходная фраза теперь «Ma ostan pileti sinna ja tagasi».

### Угадываемые (6 блоков)
- 046_p_words: «эстонское слово ↔ русский перевод» (формат A1) → «слово ↔ эстонское определение».
- 046_p_gaps: банк + 2 лишних (perroonil, hilines).
- 047_p_plan: банк + 2 лишних (kuigi, aga), принимаются Siis / Pärast seda.
- 046_t_check: дистракторы «laevaga, jalgrattaga», «pärast sõitu» → правдоподобные.
- **047_p_why**: раньше логика угадывалась без языка («sest hommik on pime»). Переписано: варианты различаются только связкой (sest/kuna — причина, sellepärast — следствие) и формой глагола.
- 049_t_check: убраны «Karjun kassas», «Lähen jala Tallinnasse», «Ei tee midagi». Все 5 пунктов — правдоподобные, но неверные решения по тексту объявления, например «автобус в 6 утра → опоздаешь».

### Чтение (18 вопросов)
Во всех 10 текстах заменены 1–2 вопроса на вычисление или вывод:
- разница в цене;
- что приедет раньше;
- экономия трамвай / такси;
- стоимость Тарту на человека (55 €);
- зачем компромисс;
- длительность поездки в Ригу;
- сколько дней в Лапландии;
- что подруга Ольги сделала не так;
- сколько ждать следующий автобус;
- что бесплатно при утреннем автобусе;
- когда ушёл опоздавший поезд (9.57);
- сколько времени осталось до встречи;
- почему Маркус стоял и т. д.

---

## Модуль 11 — Raha, ostlemine ja teenused (051–055)

### Ключи (7)
- **051 · practice · 051_p_read: «Miks võttis Viktor tšeki? [garantii jaoks|ta maksis kaardiga]»** — причины нет в тексте, ключ придуман. Вопрос заменён: «Kui palju säästis Viktor maasikatelt? [ühe euro]».
- 051_d_gaps: `[soodustust|allahindlust]`, `[kaardiga|sularahas|sularahaga]`.
- 051_p_dialog: `[kitsad|väikesed]`, `[soodustust|allahindlust]`.
- 051_tx_gaps: `[sulgeme|suleme]`.
- 053_d_gaps: `[soovin|tahan|tahaksin|sooviksin]`.
- 054_d_gaps: `[kaardiga|sularahas|sularahaga]`.

### Эстонский (7)
- **051_p_read: «kinkidel» → «kingadel»**.
- **053_t_situation: «ei imeb» → «…ega ime hästi»**.
- **053_t_read: «Garantii kehtib kogu aja»** — фраза неверная и противоречит «garantii on kaks aastat». Теперь «kehtib kogu garantiiaja jooksul». Там же «läheb katki uuesti» → «läheb uuesti katki».
- 052_t_read: «viivad nad ära» → «viime ära», чтобы совпадало с последней фразой текста.
- 052_d_intro: убрано неверное утверждение «See on samm B1 poole» (сравнительная степень — это A2).
- 052_d_gaps: «soojem kui see» → «…kui minu vana jope».
- 055_d_cross: подсказка «vahetada raha tagasi saamiseks» (бессмысленная) → «viia ostetud asi poodi tagasi».

### Ложные ошибки (10)
- 051_d_fix и 051_p_fix: «See (jope) sobib minule» — правильно (длинная форма). Заменено на «sobib minu» → «mulle». «minule» тоже принимается.
- 051_d_fix: в «Kas on soodustus sellele?» порядок слов не ошибка → «Kas sellele on soodustus?» → «soodustust».
- 051_p_fix: «Kas on suuruses M seda?» → «Kas seda on suurus M?» → «suuruses M».
- 052_tx_fix:
  - «B kulutab vähem … kui A kulutab rohkem» → «vähem elekter» → «elektrit»;
  - «Ma soovitan B, sest ta on parem» (две правки сразу) → «Ma soovitan külmkapp B» → «külmkappi B».
- 053_p_fix:
  - «Suurus on väär» — «väär» правильное слово → «Kas ma saan seda vahetada suurem?» → «…suurema vastu»;
  - «Kas ma saan tagasi raha?» (порядок, не ошибка) → «oma rahad» → «oma raha».
- 054_d_fix: «Lõpuks logi sisse» (ошибка содержания) → «Logi sisse Smart-ID» → «Smart-ID-ga».
- 054_p_fix: «Kõigepealt kinnita, siis logi sisse» (содержание) → «Ma valin pakiautomaat» → «pakiautomaadi».

### Нерешаемые (5)
- 051_d_forms и 051_p_forms: «suurus S/M — mis suuruses? → suuruses S» — ответ был в подсказке. Теперь «väiksem / suurem suurus → väiksemas / suuremas suuruses».
- 053_d_trans и 053_p_polite: «See on halb» + kahjuks → «Kahjuks see ei tööta» — не перефраз. Исходная фраза теперь «See ei tööta!».
- 055_p_mix: «Kümme punkti», а пунктов 8 → «Kaheksa punkti».

### Угадываемые (2 блока, 8 пунктов)
- 053_t_check: «viskab ära / müüb uuesti», «poole raha / ei saa midagi», «öösel / pühapäeviti» → правдоподобные ответы, которые противоречат условиям.
- 054_t_check: все 5 пунктов. Убраны «Proovi kümme korda», «Helista sõbrale», «Ütle kood», «Proovi arvata». Теперь это реальные, но неверные действия, например «ütle ainult PIN1», «küsi koodi vestlusaknas».

### Чтение (17 вопросов)
Вопросы на вычисление или вывод:
- разница цен курток (81 €);
- как стирать;
- цена шарфа до скидки (30 €);
- телефон + наушники (400 €);
- Мустамяэ + билет (510 €);
- за сколько лет окупится холодильник B (~4 года);
- зачем хранить чек;
- почему Яан смог вернуть;
- почему нельзя вернуть пылесос по правилу 30 дней;
- зачем viitenumber;
- итог с доставкой (56 €) и экономия (4 €);
- цена дивана в e-poe (540 €);
- почему не первый тариф;
- что клиент получает сверх и т. д.

---

## Avasta 9 (`avastaModule9.js`)
- **Эстонский (2):**
  - 045 meta.title «Kontroll 8» → «**Kontroll 9** — töö ja ametid»;
  - 044 «toon tähtajad kalendrisse» → «panen tähtajad … kalendrisse».
- **Ключи (3):**
  - 041 controlled `[suhtleb|tegeleb]`;
  - 041 reading «administraatori ametit»;
  - 045 controlled `[oodatakse|nõutakse|eeldatakse]`, `[sest|kuna]`.
- **Угадываемые (6):**
  - 041 general q3 и 042 general q2: дистракторы «Administraator on inimene», «Aruanne on dokument» → правдоподобные (место, качество);
  - 044 general: «Olen hea / Ei tea / Niisama / väga pikk sõna» → слабые реальные ответы;
  - 045 general: «ainult juhiluba / ainult nime / vaikimine» → варианты по тексту (в том числе «kogemus on eelis» как ловушка);
  - банки слов 041 и 044 были 6 из 6 → +2 лишних.
- **Чтение (2):**
  - 043: подходит ли работа тому, кто хочет полный день (нет, osaline koormus);
  - 045: зачем Сергей спрашивает в конце.

## Avasta 10 (`avastaModule10.js`)
- **Нерешаемые (1):** 046 controlled — в банке «perroon», а ответ «perroonilt». Банк: perroonilt + лишние perroonil и piletit.
- **Эстонский (2):**
  - 049 «ühendus jäi maha» (в словаре и в заголовке текста) → «jäin bussist maha», «Järgmine buss oli juba läinud»;
  - 049 «millisest perroonist» → «milliselt perroonilt».
- **Ключи (2):**
  - 047 controlled Siis / Pärast seda — взаимозаменяемы;
  - 050 controlled `[väljub|saabub|läheb]`, `[hilineb|hilines]`.
- **Угадываемые (5):**
  - 046 general «pilet maksab 14.20 eurot»;
  - 047 general «Rong on rong / Sest jah / Hotell on maja»;
  - 049 general «uue passi / lähen koju / ei tea»;
  - 050 general «pilet on liiga odav / vaikimine» → правдоподобные дистракторы по тексту;
  - 047 банк +aga, kuigi.
- **Чтение (4):**
  - 046: насколько дороже первый поезд;
  - 048: на чём ехали (laevaga — вывод);
  - 049: почему не пришлось покупать новый билет;
  - 050: что сделать с билетом на поезд.

---

## Итоги по видам

| Вид | 09 | 10 | 11 | Avasta 9 | Avasta 10 | Всего |
|---|---|---|---|---|---|---|
| ключи | 8 | 7 | 7 | 3 | 2 | **27** |
| эстонский | 6 | 7 | 7 | 2 | 2 | **24** |
| ложные ошибки | 4 | 2 | 10 | 0 | 0 | **16** |
| нерешаемые | 3 | 3 | 5 | 0 | 1 | **12** |
| угадываемые (блоков) | 6 | 6 | 2 | 6 | 5 | **25** |
| чтение (вопросов) | 15 | 18 | 17 | 2 | 4 | **56** |

---

## Не исправлено (нужна переработка или это вне моих файлов)

1. **Движок, проверка errorfix и transformation.** Функция `scoreRows` в `worksheet-studio/engine/blocks/advanced.jsx` делит ключ по запятой (`splitList`: `, ; \n`). Если в эталонном предложении есть запятая, оно разбивается на два обрывка, и полный правильный ответ ученика засчитывается как ошибка. Примеры:
   - «Valime rongi, sest rong on kiirem.»;
   - «Vabandust, millal buss väljub?»;
   - «Hotell on kesklinnas, sellepärast…».

   Затронуто много строк: 044_p_strong, 047_p_join, 049_p_polite, 050_tx_trans, 051–055 transformation и др. Исправлять нужно в движке: делить только по «;» или «|». Это вне моего списка файлов.
2. **Длина текстов.** Чтения по-прежнему 120–160 слов. До Harno B1 (200–300 слов в Kasuta, cloze с 3 вариантами, «ситуации ↔ объявления») нужно дописывать тексты и добавлять новые типы заданий. Это не локальная правка.
3. **Аудирования нет.** В каждом листе диктант из 5 коротких фраз и перевод с русского; в 048_t даже два перевода (048_t_tr и 048_tx_tr2). Замена на `listening` меняет типы блоков. По правилам задания это запрещено.
4. **Грамматическая ось на уровне A2.** Урок 048 целиком посвящён lihtminevik, 052 — võrdlusaste, 051 — «kolm eurot», вопросы в магазине. Аудит предлагает переделать 048 в «выбор времени (lihtminevik / täisminevik / enneminevik)», а 051–052 — в «сравнить и порекомендовать». Это смена учебной цели урока.
5. **meta.level** во всех трёх модулях = «A2+», а в роадмапе A2+/B1-. Поэтому самопроверка меряет листы по более низкому профилю. Решать это ведущему вместе с baseline.
6. Открытые трансформации с одним эталоном (044_p_strong «Tee vastus tugevamaks», 047_p_join) по сути творческие, но проверяются автоматически. Их лучше перевести на проверку учителем — это решение для движка или типа блока.
7. В Avasta нет картинок для idea-карточек (`img: null`), а говорение B1- короче нормы (60 с в Harjuta). Это шаблон, не локальная правка.

## Тесты

- `cd crm-v2 && npx vitest run src/features/worksheet-generator < /dev/null` — **47 файлов (46 прошли, 1 упал), 538 тестов: 530 прошли, 7 упали, 1 пропущен.**
  - Все 7 падений в `admin/course/course.test.js`, в модулях a2b1-module-02, 05, 06, 07, 08, 12, 13 — это файлы других агентов. Например, в 12 и 13 есть fresh-проблемы (a2b1-058 discover, банк 4 слова на 6 пропусков; 063 choice-length).
  - **По модулям 09, 10, 11 quality gate проходит: fresh = 0, fixed = 0.**
  - `avastaModule9.test.js` и `avastaModule10.test.js` проходят.
- До моих правок прогон был 47/47 файлов, 537 passed, 1 skipped.
- `npx eslint` по 5 моим файлам — без ошибок.
