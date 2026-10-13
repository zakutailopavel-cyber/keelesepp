# b2a — исправления B2-курса, модули 01–06 (уроки b1b2-001…030)

Файлы: `crm-v2/src/features/worksheet-generator/admin/course/b2/module01.js … module06.js` (worktree /Users/pavel/keelesepp-b2c1). Ничего не коммитил. id, порядок и типы блоков, `goal` не менял.

Общий принцип по порядку слов: прямой порядок после обстоятельства («Eile ma läksin…», «Sel juhul ma võtan bussi») больше нигде не считается ошибкой. Все такие пункты errorfix заменены настоящими ошибками, а в ключах, где возможны оба порядка, принимаются оба варианта (через «|»).

## Модуль 01 (001–005)

- **ключи**
  - 002 d `002_d_link`: добавлены варианты «Esmalt», «sest», «seejärel / siis».
  - 003 p `003_p_listen`: «iga õhtu | igal õhtul».
  - 004 d `004_d_read`: «arst | töötab arstina», «esmaspäeval ja teisipäeval», «igal kolmapäeva õhtul».
  - 004 d/p `004_d_fix`, `004_p_fix`: «kõige parem | parim»; «Võrreldes oma vennaga / õega…» (принимается и «minu»).
  - 004 p: «Kuigi …, ma tulen | tulen ma».
  - 004 p `004_p_read`: «iga teine | pooled».
  - 005 d/p: errorfix и transformation с «kuigi» принимают оба порядка слов.
  - 005 t: «kolme | kolm | 3».
- **эстонский**
  - 001 d `001_d_trans`: «näiteks iga päev kohtun» → «näiteks kohtun iga päev».
  - 002 d: «Minu eilne päev lugu» → «Minu eilse päeva lugu».
  - 002 t: «kinogi piletid» → «kinopiletid»; «ma ei veoda» → «ma ei vea».
  - 003 d: «pidada üks nädal ajapäevikut» → «ühe nädala jooksul».
  - 003 p: «peaaegu iga nädalavahetus» → «igal nädalavahetusel»; «Neli-päevane» → «Neljapäevane».
- **ложные ошибки**
  - 002 p `002_p_fix`: заменены 4 пункта (V2 и «kõigepealt» в конце) на «joon kohv», «Enne magama minema», «jõusaalis»; заголовок «Paranda viga.».
  - 002 t `002_t_fix`: заменены 3 пункта на «bussis», «film», «kodus».
  - 003 d/p, 003 t: «Neljapäeviti ma…», «Esmaspäeviti ma alustan…», «tund iga päev» заменены на «neljapäevati», «iga pühapäevaks», «kolm aastat tagasi», «kell kaheksa hommikust», «iga päeva».
  - 005 d/p: «Õhtuti ta loeb…», «kohvi kõigepealt», «kaks aastat juba» заменены на ошибки в объекте и времени.
  - 002 p wordorder: в инструкции больше нет абсолютного правила, теперь «kirjalikus tekstis tavaliselt».
- **нерешаемые**
  - 001 d `001_d_gaps`: «[ärkama] (ärkama)» → «Ma ei [ärganud] (ärkama) eile…».
  - 002 p: «loetakse (lugema)» → «(lugema, umbisikuline)».
  - 003 d: «[peaaegu kunagi]» без подсказки → «(почти никогда)».
  - 004 d `004_d_trans`: в исходной фразе уже стоял ülivõrre → «Reede on hea päev».
  - 004 p: «rahulikum (rahulik)» без сравнения → «…kui esmaspäeval».
- **угадываемые**
  - 004 t categorize: «Minu arvates…» в группе «Kokkuvõte» → «Eeltoodust järeldub, et…».
- **чтение** (переформулированы вопросы, ответ нельзя списать из текста)
  - 001 d (2 вопроса), 001 p, 001 t, 002 d, 002 t, 003 d, 003 p, 004 d, 004 p, 004 t, 005 p.
- **Harno**
  - 001 t и 003 t speaking: вместо «2 минуты как teemakaart» теперь формат Harno B2: 2 минуты подготовки, 1 минута речи, вопрос партнёра; длительность [60, 90].
  - 001 t rolecards: «Kust sa tulid?» → «Kus sa varem töötasid?».

## Модуль 02 (006–010)

- **ключи**
  - «raamatukokku | raamatukogusse», «panka | pangasse», «apteeki | apteegisse» — в diagram, wordforms, transformation и gaps (кроме table, где «|» ломает ячейку).
  - 006 d: в notice указаны параллельные формы.
  - 007 d: «konto | kontot avada»; «Tahaksin teada hinda».
  - 007 t: варианты для «tervisetõendi» и «aega».
  - 008 d `008_d_gaps`: «sest | kuna», «seetõttu | mistõttu».
  - 008 p: варианты для «kuna…, olin (ma)» и «toode vahetada».
  - 009 p, 010 p: «Sel juhul (ma) võtan…».
  - 010 p: «90% | üheksa kümnest».
  - 010 t: «ka laupäevadel | ka laupäeviti».
- **эстонский**
  - 006 d: «lähen pagariäri» → «pagariärisse» (в тексте, в вопросе и в диктанте).
  - 007 p: «Hindi päritolu» → «India päritolu».
  - 007 p / 010 p: «Mul on vaja pakki välja võtta» → «pakk välja võtta».
- **ложные ошибки**
  - 007 p: «aeg arstile» → «minna arsti juures».
  - 008 p: абсурдное «…töötada, sest.» → «ei saanud töötama».
  - 009 d / 009 p: «Sel juhul ma võtan bussi» → «jaama ees», «kinnos».
  - 009 t: «teise muuseumisse» (это правильная форма) → «teises muuseumis»; «Sel juhul me kohtume» → «kell seitse õhtu».
  - 010 d: «raamatukogusse» → «raamatukogus»; «Sel juhul ma võtan takso» → «laadija ei ole».
- **нерешаемые**
  - 009 t `009_t_plan`: «Marek jõuab kell 11» противоречило поздним сообщениям → «Marek jääb hiljaks».
  - 009 t вопрос «Mitu inimest…»: теперь «viis, võib-olla neli | 4–5».
- **угадываемые**
  - 007 p, 009 p, 010 p choice: абсурдные дистракторы («Pakk!», «Raha?», «See on skandaal!», «Okei, tšau» и т. п.) заменены правдоподобными. Они грамматически верны, но не подходят по регистру, смыслу или лицу (≈34 варианта).
  - 006 p truefalse: убран парный пункт про postipunkt, который выдавал ответ на соседний; вместо него «Apteek asub Rüütli tänaval panga vastas» (vale).
  - 007 t truefalse: «ainult kohale» → «kuu aja jooksul».
- **чтение** (переформулированы вопросы)
  - 006 d, 006 p, 006 t, 007 p, 007 t, 008 p, 008 t, 009 d, 009 p, 010 d, 010 p (2 вопроса), 010 t.
- **Harno**
  - 010 t: из заголовка убрано «(Harno B2 teemakaart)», так как речь по заданию длится 2–3 минуты.

## Модуль 03 (011–015)

- **ключи**
  - Варианты порядка слов в errorfix и transformation 011, 012, 015.
  - 012 d: «neljas | neljas riigis».
  - 013 d `013_d_line`: «kontrollis | oli kontrollinud» и т. д.
  - 013 p: «ta kolis eelmisel aastal», «ta oli juba magama jäänud».
  - 014 p: «oleme käinud | käime».
  - 015 t: «tasuta eksemplari».
- **эстонский**
  - 011 t: «Nüüd jõime koos teed juba mitu korda» → «Nüüd oleme … teed joonud» (это урок о временах).
  - 012 d: «kas talle on … mitte meeldinud» → «kas on midagi, mis talle ei ole meeldinud».
  - 012 p: «kahtkümmet last» → «kahtkümmend».
  - 012 t: «oleksid reisinud ja tead» → «teaksid»; «eelmisel jõulul» → «eelmistel jõuludel».
  - 013 d: «Miks olid … puudumine» → «oli»; «lukku lõhkunud» → «luku».
  - 015 d: «ootab Helgit jaama» → «jaamas».
- **факты**
  - 013 p: флаг на Pikk Hermann подняли не в 1988 году, а в «1989. aasta veebruaris» (в тексте и в вопросе).
  - 013 p: «kolmkümmend aastat» (1884 → 1918) → «üle kolmekümne aasta».
  - 013 p: заголовок «sai uue lipu tagasi» → «sai oma lipu tagasi».
- **ложные ошибки**
  - 012 d: «Ma ei olnud kunagi Jaapanis» (грамматически возможно) → «Ma pole kunagi Jaapanis olin».
  - 013 t: «Selleks ajaks juhid olid…» (порядок слов) → «olid juhid rahunesid».
- **нерешаемые**
  - 012 p, 015 d, 015 p: в пропусках «[olete]», «[ei ole]» и т. п. не было подсказки → добавлено «(olema)» / «(olema, eitus)», 8 мест.
  - 013 t `013_t_line`: на ajajoon были времена 19.12, 19.15 и 19.50, которых нет в тексте → узлы взяты из текста.
  - 013 d: вопрос «Miks arvas koristaja…» без ответа в тексте → «Mida arvas koristaja maali kohta?».
- **угадываемые**
  - 012 p choice: дистрактор «lugesin eile» → «olin lugenud».
  - 014 d: банк 7 слов на 7 пропусков → 9 слов (2 лишних); добавлены синонимы в ключ.
- **чтение** (переформулированы вопросы)
  - 011 d, 011 p (2 вопроса), 011 t, 012 d, 012 p, 012 t, 013 p, 013 t, 014 p, 014 t, 015 d, 015 p (2 вопроса), 015 t.

## Модуль 04 (016–020)

- **ключи**
  - Варианты в 016 d, 017 d/p (порядок слов при инфинитиве), 018 p, 019 p, 020 d.
  - 020 d: «ei ole kahetsenud | kahetsenud».
- **эстонский**
  - 017 d: «kartsin kukkuda läbi» → «läbi kukkuda».
  - 017 d notice: убрана необъяснённая «*» у «aitan».
- **ложные ошибки**
  - 016 t: «Paluksin hüvitada tooli» (допустимо) → «ei saanud kätte kast numbriga 12».
  - 020 d: «raamatukogusse» → «raamatukogus».
  - 020 t: стилистическое «ja siis… ja siis» → «Ma pean minna koju».
- **нерешаемые**
  - Ответ стоял в подсказке: 016 d «[nõud] (nõud)» → «(nõu, mitmus)»; 016 p «[jäägid] (jäägid)» → «(jääk, mitmus)».
  - 017 d: последний пропуск был без подсказки и с неудачным «tuled kinno minema» → «kinno filmi [vaatama] (vaatama) … [jääma] (jääma)».
  - 018 p: «[inimesed]» без подсказки → «(inimene)».
  - 018 p crossword: «loobus» → в подсказке «eelmisel aastal».
  - 019 d table «Keelesihid» переделана целиком: в колонке sihitis — настоящие дополнения, в колонке rektsioon — управляемые слова из текста («ootama tehnikut», «küsitakse sinult», «ei ole sellest hoolinud», «loobuda reisist»).
  - 019 d gaps: «ei tööta [külmkapp] (külmkapp)» → «ei saanud [külmkappi] tööle».
  - 019 d transformation «Tehnik tuli? Ei.» → «Tehnik tuli, aga külmkapp on ikka katki (parandama)».
  - 020 d: «osta [maja] (maja)» → «müüa oma Tallinna [korteri] (korter)»; «[oled]» → «(olema)».
  - 016 p wordforms: «leib — käsk» → «jaatav käsk ainsuses (Osta …!)».
- **смысл**
  - 017 p: «Ma tahan poodi minna ja osta» → «Ma tahan minna poodi leiba ostma».
  - 017 t: «võid → pead» меняло смысл → «Sul on vaja elukoht registreerida → Sa pead elukoha registreerima».
  - 020 p: «Raamatukogu on mu lemmikkoht → Ma huvitun raamatukogust» → «Mind huvitab raamatukogu töö → Ma huvitun raamatukogu tööst».
- **обещание листа**
  - 020 p: «Lugemine (250–300 sõna)» — текст был 210 слов, добавлено около 50 слов (B1-норма 200–400).
- **угадываемые**
  - 019 t truefalse: «alati kahe päevaga» → «tavaliselt».
- **чтение** (переформулированы вопросы)
  - 016 d, 016 t, 017 d, 017 t, 018 d, 018 p, 018 t, 019 p, 019 t, 020 d, 020 t.

## Модуль 05 (021–025)

- **эстонский**
  - 021 d: «Merike teine argument» → «Merikese».
  - 021 p: «iga õhtul» → «igal õhtul»; «nõustusid enamik» → «nõustus enamik».
  - 023 t: «leida kompromiss» → «kompromissi».
  - 025 d: заголовок → «Kas peaksime sularahast loobuma?»; «igal kuu alguses» → «iga kuu alguses».
- **ключи**
  - 021 d choice: вопрос «Milline väljend näitab Merike kindlust? *ma leian» противоречил notice → «Millise väljendiga alustab Merike oma arvamust? *minu arvates».
  - Варианты добавлены в 021 p, 023 t, 024 p, 025 d/p.
- **ложные ошибки / не языковые**
  - 021 p: «Minu arvates koolivorm on hea» и «sest see on hea» → «kodutöö ei ole vaja», «koolivormi on hea».
  - 022 d и 022 t errorfix «Nõrk argument → tugev»: исходные фразы грамматически верны, а «правильный» ответ был одним из многих. Заменены на настоящие ошибки в аргументах: sihitis, падеж, «kuna…, seetõttu», da-инфинитив, форма прилагательного. Заголовок и инструкция обновлены.
  - 024 p: «Võrreldes autoga buss…», «Eelis on, et…» → «rohkem odav», «lähedalt».
  - 024 t: «Hotelli eelis on, et…», «Seevastu talus sõit…», «sest see on parem» → «spaad», «lühema», «tegevused on ühine».
  - 025 d: «Minu arvates sularaha on…», «sest see on hea» → «vajalikud», «elektrikatkestuse aeg».
- **угадываемые**
  - 021 p и 025 p choice «tugevam argument»: дистракторы вида «On raske, sest on raske» и «Mulle meeldivad pargid» заменены аргументами с изъяном: без причины, с нерелевантным примером, с круговым доводом. Длина у всех вариантов похожая (24 варианта).
  - 021 d choice: короткие дистракторы выровнены по длине.
  - Банки в инструкции, где слов было столько же, сколько пропусков (021 p, 022 d, 023 p, 024 d, 025 d): добавлено по 2 лишних слова, плюс синонимы в ключ.
  - 024 p choice: правильный вариант выдавала пометка «(lift)» — убрана.
  - 024 t: ответ «50 x 30 + 400 = 1900 eurot» → «1900 eurot | 1900».
  - 022 p transformation: ответ, начинавшийся с «Sest…», переписан полным предложением.
- **чтение** (переформулированы вопросы)
  - 021 t, 023 p, 024 d, 024 p, 025 p, 025 t.

## Модуль 06 (026–030)

- **ключи**
  - 026 d `026_d_gaps`: «[delegeerima]» → «[delegeerida]» (oskama + da), в банке тоже.
  - Варианты добавлены в 027 d/t, 029 p, 030 d/p.
- **эстонский**
  - 026 d: «detsembris oleks kõik töötajad» → «oleksid».
  - 028 t: «mõnusalt vihjanud» → «viisakalt».
  - 029 p: «iga töötajale» → «igale töötajale».
  - 026 d / 029 d: «B2-tasemel», «B2-arutelus» → «B1+-tasemel» (meta = B1+).
- **ложные ошибки**
  - 026 p: «delegeerib … kolleegile» (это верно) → «kolleegiga».
  - 027 t: «Loodan, et me teeme koostööd tulevikus» (верно) → «koostööga».
  - 028 p errorfix «Neutraalsemaks»: исходные фразы грамматически верны, а ответы — выдуманные факты. Заменён на 6 настоящих ошибок в нейтральных фразах: kolm keerulisemat, projekti, olukorda, kaks nädalat, neli muudatust, vastatud.
  - 029 p: «Samas hübriid ei sobi» и неполная фраза → «ametikohtale», «kontorit».
  - 030 d: «Sa oled alati laisk» → «õigel ajaga».
- **нерешаемые**
  - 029 p listening: пропуск «Kumbki ei ole täiesti [vastu]…» — этого нет в тексте → «Pooldaja veedab säästetud aja [lastega]».
  - 030 d: пропуск резал слово («[paindlik]ku») → «[paindlikku]»; банк 8 на 8 → 10 слов.
  - 030 p transformation: «fakt» без данных → «fakt: sel kuul 5 korda».
  - 030 p selfcheck: «4 lünka 5-st» → «5 lünka 6-st» (в listening 6 пропусков).
  - 027 d: ответ совпадал с подсказкой «sama [tähtis] (tähtis)» → «Head kolleegid on sama [tähtsad]».
- **угадываемые**
  - 029 p choice: «Hübriid on lahe», «Ma ei tea» и т. п. заменены односторонними, но правдоподобными утверждениями (12 вариантов).
  - 028 d choice: «karistas Sandrat», «koondada üks töötaja» и т. п. → правдоподобные варианты.
  - 026 d, 029 d: к банкам добавлено по 2 лишних слова.
- **чтение** (переформулированы вопросы)
  - 026 d, 026 p, 026 t, 027 d, 027 p, 027 t, 028 t, 029 d, 029 p, 029 t, 030 d, 030 p, 030 t.

## Количество (приблизительно, по правкам)

| Вид правки | Сколько |
|---|---|
| ключи и варианты ответа | ≈ 75 |
| эстонские ошибки и факты в текстах | ≈ 30 |
| ложные ошибки в errorfix (заменённые пункты) | ≈ 55 |
| нерешаемые задания | ≈ 30 |
| угадываемые задания | ≈ 95 вариантов в 12 блоках choice / truefalse и 12 банков |
| чтение (переписанные вопросы) | ≈ 75 |

Всего около 310 точечных замен в 6 файлах (257 строк изменено).

## Не исправлено (нужна переработка, а не точечная правка)

1. **Длина текстов и форматы Harno.**
   - Тексты 200–300 слов, нет ни одного текста на 450–600 слов.
   - Нет чтения с выбором из 3–4 вариантов, сопоставления с абзацами и банка предложений с лишним.
   - Нужны новые блоки в контрольных уроках 005, 010, 015, 020, 025, 030. Это меняет состав листов и время.
2. **Грамматика B2 и B1+.** Нет kaudne kõneviis, umbisikuline во всех временах, lauselühendid и номинализаций — нужны новые уроки или листы.
3. **Повтор A2.** Таблицы местных падежей (006) и lihtminevik / täisminevik (011–012), а также ma- и da-инфинитив (017) по-прежнему занимают целые уроки. Их сжатие — это перестройка модуля.
4. **001 d «Hinda ennast» (choice с «правильным» ответом самооценки).** Нужен selfcheck или шкала без ключа, а тип блока менять нельзя.
5. **Аудио.** Всё аудирование — «õpetaja loeb», задания с однократным прослушиванием нет.
6. **Перевод с русского почти на каждом листе** (около 63 блоков) вместо перефразирования по-эстонски.
7. **Открытые transformation с одним ключом** («lisa näide / põhjus», «Tee elavamaks», 012 t, 014 p, 022 p). Правильных ответов много, нужна ручная проверка или другой тип задания.
8. **Мелочь в таблицах.** В table нельзя давать альтернативы через «|» (разделитель ячеек), поэтому «kino → [kinno]» и «apteek → [apteeki]» в 006 d принимают только одну форму.
9. **Повтор тем** (neljapäevane töönädal, kaugtöö — по 3 раза) остался.

## Проверки

- `npx vitest run src/features/worksheet-generator < /dev/null`:
  - **Test Files 1 failed | 47 passed (48); Tests 18 failed | 528 passed | 1 skipped (547).**
  - Из моих модулей падают только b1b2-module-02, -05 и -06, и только на списке `fixed`:
    - 02: did-choice-length 007_p, 010_p;
    - 05: did-choice-length 021_p, 025_p и didactic 021_p;
    - 06: did-choice-length 029_p.
  - Это исправленные проблемы, baseline обновит lead. Список `fresh` для модулей 01–06 пуст; 01, 03 и 04 проходят полностью.
  - Остальные 15 падений — модули b1b2-07+ и est-c1-*, это зона других агентов.
  - Тесты avastaModule проходят.
- `npx eslint …/b2/module01.js … module06.js` — без ошибок.
