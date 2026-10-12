# Исправления B1, модули 05–08 + Avasta 6–8 (агент B)

Файлы, которые я менял (в /Users/pavel/keelesepp-b1):
- `crm-v2/src/features/worksheet-generator/admin/course/b1/module05.js`, `module06.js`, `module07.js`, `module08.js`;
- `crm-v2/src/features/worksheet-generator/admin/avastaModule6.js`, `avastaModule7.js`, `avastaModule8.js`.

Что не трогал: id, порядок и типы блоков, поля `goal`, структуру уроков. Коммитов не делал.

Общее решение по порядку слов после «kuna». Во всех образцах модуля 08 оставлен один порядок: после придаточного с kuna глагол идёт раньше подлежащего («Kuna mul oli kiire, ei tulnud ma tundi.»). Так теперь написано в диктантах 038 и 040 и в gaps 040. Порядок «…, ma ei tulnud» тоже допустим в эстонском, поэтому в errorfix он больше не считается ошибкой. Там, где ученик сам пишет предложение (transformation, errorfix), принимаются оба порядка через «|».

## Модуль 05

**Ключи**
- 021 · practice · 021_px_read: вопрос «Mida tegi Toomas kohvikus?» заменён вопросом к концу текста: «Mida ütles naaber järgmisel päeval?» → [vabandas müra pärast | et remont lõppeb varsti].
- 021 · transfer · 021_t_diary: вопрос «Mida Anni õhtul ei teinud? [ei vaadanud telerit]» был неоднозначным: она ещё и маме не позвонила. Новый вопрос: «Miks ei olnud Anni päevaga päris rahul?» → [ta ei helistanud emale…].
- 022 · practice · 022_p_order: siis и pärast seda подходят в обе лакуны. Теперь [Siis|Pärast seda] и [Pärast seda|Siis].
- 022 · practice · 022_px_past: добавлен вариант «Eile ei käinud ma trennis».
- 024 · practice · 024_p_flow: сидесловa без банка, подходит несколько. Добавлены варианты: [Alguses|Kõigepealt], [Kõigepealt|Siis|Seejärel] и т. д.
- 024 · transfer · 024_t_read: место находки было неоднозначным (köögilaud или riiul). Текст теперь говорит «leidis … köögilaualt ajalehe alt», ключ [köögilaualt|…].
- 025 · practice · 025_p_past: добавлен вариант «Eile ei tulnud ta».

**Эстонский**
- 022 · transfer · 022_tx_read: «tulime koju väsinud, aga õnnelikena» → «Olime väsinud, aga õnnelikud.»
- 023 · practice · 023_px_read: «tõi kaasa suure kooki» → «suure koogi»; «Me nägime … vanu pere fotosid» → «Me vaatasime … vanu perefotosid». Ключи вопросов подогнаны.

**Нерешаемые**
- 025 · practice · 025_p_15: заголовок «15 vormi» стоял над 11 формами → «11 vormi.»
- 021 · practice · 021_p_person: подсказка лица уже есть в поле prompt (tema, meie…). Находка аудита к текущему файлу не относится, менять не пришлось.

**Угадываемые**
- 022 · practice · 022_p_logic: дистракторы с неверным временем («homme lähen poodi», «ja homme on reede», «eile on ilus ilm») заменены на грамматически правильные, но нелогичные продолжения.
- 023 · transfer · 023_t_quiz: несуществующие слова «toi», «söime», «näggid» заменены настоящими неверными формами (tõid / toob, sõid / söösime, nägi / nägesid). Добавлены маркеры «eile», чтобы ответ был только один.
- 024 · transfer · 024_tx_link: в банке было ровно 5 слов на 5 лакун. Добавлены «homme» и «kõigepealt».
- 025 · practice · 025_p_q: убраны дистракторы, которые тоже подходили или были абсурдны: «Homme», «Eile», «Praegu», «Täna» (с «Täna» предложение было правильным). Вместо них правдоподобные сидесловa.

**Чтение** (вопросы на перефразирование, на вывод и к концу текста)
- 022 · practice · 022_px_read: «Mida Liisi järgmiseks nädalaks otsustas?»
- 022 · transfer · 022_tx_read: «Miks pidid vanemad pojale uued riided ostma?» вместо «Kus…? [Pärnus]».
- 023 · practice · 023_px_read: «Mida tegid ema ja isa järgmisel päeval?» вместо повторного «õde».
- 023 · transfer · 023_t_news: «Mis näitab, et Kihnu kalasupp oli populaarne?»
- 024 · practice · 024_px_read: «Mida jutustaja nüüd teisiti teeb?»
- 025 · practice · 025_px_read: «Kuidas tundis jutustaja end esimese päeva lõpus?» и «Mida jutustaja esimesel päeval veel ei teadnud?»
- 025 · transfer · 025_tx_read: «Mis on Anni ja Jaani lugudes ühist?»

## Модуль 06

**Ключи**
- 027 · practice · 027_p_order: [soovite|sooviksite|tellite].
- 027 · transfer · 027_tx_dlg: [arved|arve].
- 028 · transfer · 028_tx_shop: «Ei, [piima|piim] on kodus»: допустимы оба варианта.
- 029 · practice · 029_px_polite: ключ «Kahjuks ma ei saa seda süüa» не следовал из исходной фразы «Ma ei taha seda». Исходная фраза теперь «Ma ei söö seda!», добавлен второй порядок слов. Ключ «meie toit» → «minu/mu toit», потому что в исходной фразе «mu».
- 030 · practice · 030_p_fix: принимаются «Kas saaksite arve tuua?» и «…tuua arve?».
- 030 · practice · 030_p_read: ключи подогнаны под исправленный текст (kanaprae, kalapraad).

**Эстонский**
- 027 · practice · 027_px_read: «Peeter võttis tomatisupi ja kanapraadi» → «kanaprae».
- 029 · practice · 029_p_problem: «Salatis on pähklid» → «pähkleid».
- 029 · practice · 029_px_read: «kuidas te sellised probleemid tulevikus lahendate» → «selliseid probleeme».
- 029 · transfer · 029_t_terms: «kella kümnest kuni kella kesköö» → «kella kümnest hommikul keskööni». Текст дополнен на 2 слова, чтобы не упасть ниже нормы A2+ в 120 слов.
- 030 · practice · 030_p_read: «tellis … kanapraadi» → «kanaprae»; «Kanapraadi asemel tõi kokk aga kalapraadi» → «Kanaprae asemel toodi aga kalapraad» (asemel требует генитива, и блюдо приносит не повар).
- 026 · transfer · 026_t_tips: «ei pea ostma kõike suurelt» → «ei pea kõike väga suurtes kogustes ostma».

**Нерешаемые**
- 026 · practice · 026_p_amount: «viilu → leiba» без числа → «kaks viilu».
- 027 · transfer · 027_t_roles: обещано три роли, а карточек две. Теперь «Kaks rolli: klient ja ettekandja». Клиент сам заказывает за коллегу, который не говорит по-эстонски. Посредничество через русский язык убрано.

**Угадываемые**
- 026 · practice · 026_p_cross: «Kollane puuvili ahvidele» → «Pikk kollane puuvili, mille koor visatakse ära».
- 027 · practice · 027_p_menu: дистрактор «kohvi» в вопросе про основное блюдо → «kanapraadi ja kohvi».
- 027 · practice · 027_px_phr, 029 · practice · 029_p_complaint, 029 · transfer · 029_tx_gaps: в банке было ровно столько слов, сколько лакун. Добавлено по 2 лишних слова.
- 029 · practice · 029_p_polite: убраны «Te petate mind!», «Viska see ära.», «Ma ei maksa.» и подобные. Теперь в каждом вопросе три правдоподобных варианта, которые отличаются степенью вежливости: просьба с «Vabandage, kas saaksite…», резкий приказ («Soojendage see ära.») или голая констатация («See taldrik on must.»).
- 029 · transfer · 029_tx_rule: «Pean helistama politseile», «Ootan nädala», «Pean maksma kaks korda» и т. п. заменены условиями из того же текста, которые подходят к другой ситуации. Например, бесплатная доставка — это правило для опоздания, а не для неверного заказа.
- 030 · transfer · 030_t_plan: «Ma ei kutsu teda», «Ei maksa üldse», «Sööme külmalt ja oleme vihased» заменены правдоподобными, но неверными решениями: kalasupp для вегетарианца, taimetoit при аллергии на молоко, одна общая arve.

**Чтение**
- 026 · practice · 026_px_read: «Mida ostis Marje, mis ei olnud nimekirjas?» (ответ надо вывести: мороженое).
- 026 · transfer · 026_t_tips: «Miks osta puu- ja köögiviljad alles peo päeval?»
- 027 · practice · 027_px_read: «Miks see kohvik neile sobib?»
- 027 · transfer · 027_t_review: «Mida autor teistele külastajatele soovitab?»
- 028 · practice · 028_px_read: «Mis on eestlaste toidulaual viimastel aastatel muutunud?» (несколько принимаемых ответов).
- 029 · practice · 029_px_read: «Mida Mart restoranilt kirja lõpus palub?»
- 030 · transfer · 030_tx_read: «Mida tuleb teha, kui inimeste arv muutub?»

## Модуль 07

**Ключи**
- 031 · practice · 031_p_fix: «Temal valutab hammas» тоже правильно, добавлено как вариант.
- 031 · transfer · 031_tx_trans, 035 · transfer · 035_tx_trans: добавлены варианты «tunnen end haigena», «kõrge palavik», «Homme jään ma koju».
- 035 · practice · 035_p_read: «…mida poeg oli söönud» добавлено как вариант ответа.

**Эстонский**
- 032 · transfer · 032_t_read: «Täiskasvanud võtavad üks tablett» → «ühe tableti»; «võtta pärast sööki ja juua klaasi veega» → «…koos klaasi veega».
- 032 · transfer · 032_tx_gaps: «Tablett võtke [pärast] sööki» → «Võtke tablett [pärast] sööki».
- 031 · transfer · 031_t_check: условие «Sa oled paremini.» → «Sa tunned end juba paremini.»
- 031 · transfer · 031_tx_trans: «Pea on haige.» → «Mul on peavalu.»; «Temperatuur on kõrge.» → «Mul on kõrge temperatuur.»
- 035 · transfer · 035_tx_trans: «Kõht on haige.» → «Tal on kõhuvalu.»
- 031 · practice · 031_px_order: «Mul valutab juba kaks päeva pea.» → «Mul valutab pea juba kaks päeva.»
- 033 · transfer · 033_tx_trans: «Sa peaksid arstile minema» → «arsti juurde minema».
- 034 · practice · 034_p_mean: «Ta liigub iga päev tunni.» → «tund aega».
- 034 · transfer · 034_t_read: «Mitu eestlast liigub…? [kolmandik]» → «Kui suur osa eestlastest…».
- 035 · transfer · 035_t_read: противоречие «Kõne maksab nagu tavaline kõne» / «Teenus on tasuta» → «Nõustamise eest eraldi maksma ei pea.»
- 035 · practice · 035_p_match: «nohu — nina on täis», «köha — kurk teeb häält» → понятные описания.

**Ложные ошибки**
- 032 · transfer · 032_tx_fix: пять пунктов исправляли содержание, а не язык («Tablett võtke enne sööki ja pärast sööki», «Hoidke ravimit lastele», «ootage nädal», «Jooge alkohol…», «Võtke ravim pärast kõlblikkusaega»). Вместо них настоящие ошибки урока: «Võtke üks tabletti», «Ärge joo» (вместо jooge), «Ärge hoidke ravim» (вместо ravimit), «pöörduge arstile» (вместо arsti poole), «Ärge võtke ravim».

**Нерешаемые**
- 031 · practice · 031_p_feel: «hea → hästi», «halb → halvasti» — это наречия, а не -na-форма. Заменены на «rõõmus → rõõmsana», «uimane → uimasena». Инструкция «kui-vormis» → «-na-vormis».
- 032 · transfer · 032_t_roles: «Kolm rolli», а карточек две → «Kaks rolli: arst ja abistaja, kes räägib naabri eest».
- 035 · practice · 035_p_mix: «Kümme punkti» над 8 лакунами → «Kaheksa punkti». Добавлена подсказка «(mina, olema)». Лакуна «[Kui kaua]» без подсказки → «Kui [kaua]».
- 035 · transfer · 035_tx_trans: «Ta peaks puhkama → Puhka!» меняло лицо, теперь «Sa peaksid puhkama → Puhka!». «Kui kaua see kestab? → Millal see algas?» менял вопрос, теперь «Valu on kestnud eilsest saadik. (algas) → Valu algas eile.»

**Угадываемые**
- 031 · practice · 031_p_body: соединение «эстонское слово ↔ русский перевод» частей тела (A1) заменено на «жалоба → часть тела» («Mul on raske neelata ja rääkida» → kurk и т. д.).
- 031 · transfer · 031_t_check: «Mul on igav.», «Head isu!», «Palju õnne!», «Ma olen hea.» заменены вариантами, которые отличаются ровно формой урока: «olen end» вместо «tunnen end», «parem» вместо «paremini», «Saa ruttu terve» вместо «terveks».
- 031 · practice · 031_p_con, 031 · transfer · 031_tx_gaps, 032 · practice · 032_p_q, 032 · transfer · 032_tx_gaps, 034 · practice · 034_p_should, 034 · transfer · 034_tx_gaps: в банке было ровно столько слов, сколько лакун. Добавлено по 2 правдоподобных лишних слова (valutavad, olen, terve, ühe, ära, peaksid…).

**Чтение**
- 031 · practice · 031_p_read: «Mida otsustas Margit talveks teisiti teha?»
- 031 · transfer · 031_t_read: «Mida teeb Kati, kui homme ei ole parem?»
- 032 · practice · 032_p_read: «Mida peab patsient tegema, kui palavik ei lange?»
- 033 · practice · 033_p_read: вопрос «Miks ei aita antibiootikumid? [külmetuse vastu need ei aita]» повторял сам себя. Новый вопрос к концу текста: «Kuidas tuleb pärast haigust uuesti liikuma hakata?»
- 034 · practice · 034_p_read: «Mida Tõnu teistele soovitab?»

## Модуль 08

**Ключи**
- 037 · practice · 037_p_table: в столбце «Vorm» не было ключа. Добавлены [õppima], [puhata], [ujuma], [laulda], [lugema], [kirjutada].
- 037 · practice · 037_p_choice: ключ «Me hakkame kohe tööle tegema» → «tööd tegema». Дистракторы подогнаны.
- 038 · practice · 038_p_gaps, 038 · transfer · 038_t_dialog: в середине предложения правильны sest, kuna и sellepärast et. Добавлены все три варианта, в начале предложения остаётся только Kuna.
- 038 · practice · 038_p_join: принимаются оба порядка слов после kuna-придаточного и обратный порядок предложений.
- 036 · practice · 036_p_fix, 036 · transfer · 036_tx_trans, 037 · practice · 037_p_fix, 039 · practice · 039_p_fix, 040 · transfer · 040_tx_fix: добавлены варианты с другим допустимым порядком слов.
- 040 · transfer · 040_tx_tf: «Testi eest tuleb maksta — false» в тексте не подтверждается (о цене теста там ничего нет) → «Avatud uste päev on septembris — false».

**Эстонский**
- 037 · practice · 037_px_order: «autot juhtida õppida» → «autot juhtima õppida».
- 037 · transfer · 037_tx_trans: «Mulle on vaja õppida» → «Mul on vaja õppida». «Ma oskan lugeda → Ma tahan lugeda» меняло смысл → «Mul on soov lugeda → Ma tahan lugeda».
- 038 · practice · 038_p_say: «Miks sa joonud kohvi või teed?» → «Miks sa jood pigem kohvi või teed?»
- 038 · practice · 038_p_dict, 040 · practice · 040_p_dict, 040 · practice · 040_p_mix: «Kuna mul oli kiire, ma ei tulnud» → «…, ei tulnud ma tundi» (одна норма на весь модуль).
- 038 · transfer · 038_tx_order: «Kuna ma töötan palju, on kodutööd pikad» → «on kodutööd mulle liiga pikad».
- 039 · transfer · 039_tx_gaps: «Ma [jäin] kaks tundi vahele» → «Ma [jätsin] …». В банке «jäin» оставлено как дистрактор.
- 039 · transfer · 039_tx_dict: «Ma jäin kaks nädalat puudu» → «Ma puudusin kaks nädalat».

**Ложные ошибки**
- 038 · practice · 038_px_fix: «Kuna mul oli kiire, ma ei teinud…» и «Kuna ta on haige, ta ei tule» помечались как ошибки, но это допустимый эстонский. Заменены настоящими ошибками: двойная связка «Kuna …, sellepärast…» и «Sest» в начале предложения. Заголовок «Paranda sõnajärg» → «Paranda põhjuslause».
- 040 · practice · 040_p_fix: «Kuna ma olin haige, ma ei tulnud» → «Ma ostsin kilo õunad → õunu».
- 040 · transfer · 040_tx_fix: «Kuna mul oli vähe aega, ma õppisin…» → «Kuna …, sellepärast õppisin…». «Alguses on mul raske eile» (две ошибки, странная фраза) → «Eelmisel aastal on mul eesti keelega raske → oli».
- 037 · practice · 037_p_fix: «Lähme sööma lõunat» (это допустимый порядок слов) → «Lähme lõunat süüa → sööma».
- 039 · practice · 039_p_fix: «Ma jäin maha teemast» (допустимый порядок) → «Ma jäin teemas maha → teemast».

**Нерешаемые**
- 040 · practice · 040_p_mix: «Kümme punkti» над 8 лакунами → «Kaheksa punkti».
- 036 · practice · 036_p_forms: подсказка формы («kus? (-s)» и т. д.) уже есть. Находка аудита к текущему файлу не относится.

**Угадываемые**
- 036 · transfer · 036_t_check: «Võta kaasa kodu», «Helista direktorile öösel», «Tunnid on raske» и т. п. заменены правдоподобными, но неверными по тексту вариантами (13.40, ruumis 210, ujumisriided).
- 038 · transfer · 038_t_check: «Tunnid on.», «Ma ei tea.», «Kursus on läbi.» и т. п. заменены. Теперь во всех трёх вариантах есть связка, но в неверных вариантах причина не подходит по смыслу.

**Чтение**
- 036 · transfer · 036_t_read: «Mitu tundi on lapsel esmaspäeval?» (надо посчитать) вместо «Kus on esimene tund?».
- 037 · practice · 037_p_read: «Kuidas on Olga suhtumine telefonikõnedesse muutunud?»
- 037 · transfer · 037_t_read: «Kui palju peab kodus harjutama?» (к концу текста).
- 038 · transfer · 038_t_read: «Mida õpetaja Kadri tagasiside põhjal muudab?»
- 039 · practice · 039_p_read: «Miks olid teised nõus aeglasemalt rääkima?»
- 039 · transfer · 039_t_read: «Mida peab õppija tegema, kui ta vajab kontrolltööks rohkem aega?»
- 040 · practice · 040_p_read: «Mida soovitab Sergei Andreile?»

## Avasta 6–8 (аудит их не покрывал, проверил сам)

**Ключи и нерешаемые**
- avasta 028 controlled и 030 controlled, avasta 040 controlled: подсказка «(õun)» / «(kartul)» в единственном числе при ответе во множественном → «(õunad)» / «(kartulid)».
- avasta 032 controlled (dialogue): лакуны были на целые свободные ответы («[Umbes kolm päeva]»), которые нельзя проверить. Теперь лакуны на глаголы с однозначным ответом: algas / olnud / oli / võta. Добавлена одна пара реплик про лекарства. Инструкция уточнена.
- avasta 036 controlled: в банке «tunniplaan, ülesanne», а ключ «tunniplaani, ülesande». Банк теперь в нужных формах, плюс 2 лишних слова.
- avasta 038 controlled: sest, kuna и sellepärast et все верны в середине предложения. Добавлены варианты, в инструкции сказано, что в начале предложения подходит только «kuna».
- avasta 039 controlled: в банке «harjutada», а ключ «[harjutama]» (pean + ma); «mul on vaja» при лакуне «Mul [on vaja]». Банк исправлен, «harjutada» и «abi küsima» оставлены как дистракторы.
- avasta 040 controlled: «[sest]» и «[võiksin]» стояли без подсказки. Добавлены варианты связки и подсказка «(võima, mina)».
- avasta 031 reading: «Mis Maril hommikul valutas? [kurk]», хотя в тексте болела и голова. Добавлены варианты.

**Эстонский**
- avasta 037 reading: «rääkida tahab ta rohkem harjutada» → «rääkimist tahab ta rohkem harjutada».
- avasta 039 reading: «jäi ühest tunnist puuduma» → «puudu».
- avasta 027 controlled: «Ja pärast [arve palun].» → «Aitäh, kõik oli hea. [Arve palun].»
- avasta 028 reading: вопрос «Mida läheb kastmesse üks klaas?» → «Mis läheb kastmesse?»

**Угадываемые** (блок «general» почти везде был «1 верный + 2 абсурдных»)
- avasta 026, 027, 029, 030, 031, 032, 033, 034, 035, 036, 038, 039, 040: заменены дистракторы вида «Ma olen kell kuus», «Miks te üldse töötate?», «solvamine», «vahetada töökohta», «et teada aadressi», «enesetunne / asukoht / kokkulepe», «Ära maga», «hommikul. / meeldib.», «ignoreerin teemat», «ainult toidu ostmine». Теперь варианты одного типа и отличаются формой урока (kaks pakki riisi / riis / paki; Puhka / Puhkad / Puhata; võiksid helistada / helistama; Ära mine / Ära lähe / Ei mine; peaksid liikuma / liikuda / peaks) или деталью текста (avasta 030, 035, 040 — вопросы теперь действительно «по тексту»).
- avasta 026, 031, 033, 034 controlled: в банке было ровно столько слов, сколько лакун. Добавлено по 2 лишних слова.

**Чтение**
- avasta 026: «Mida ja kui palju ostab Liis puuviljadest?» (надо соединить два факта).
- avasta 032: «Mida arst soovitab?» вместо «Kas tal on täna palavik? [ei]».
- avasta 034: «Miks võtab ta tööle suurema veepudeli?»

## Счёт по видам

| Вид | Модули 05–08 | Avasta 6–8 | Всего |
|---|---|---|---|
| ключи (включая добавленные варианты «\|») | 23 | 7 | 30 |
| эстонский | 31 | 4 | 35 |
| ложные ошибки (errorfix) | 11 пунктов в 6 блоках | — | 11 |
| нерешаемые / несоответствие заголовка | 8 | (входят в ключи) | 8 |
| угадываемые (дистракторы, банки) | 25 блоков | 17 блоков | 42 |
| чтение (новые вопросы на смысл, вывод, конец текста) | 31 | 3 | 34 |

Числа приблизительные: несколько правок относятся сразу к двум видам и посчитаны один раз.

## Не исправлено (нужна переработка крупнее локальной правки)

1. **Täisminevik в модуле 05** («Lihtminevik ja kogemused»). Ни одного задания нет, хотя тема опыта — это классический täisminevik («Olen käinud…»). Нужно добавить блок или переделать 024/025 на противопоставление lihtminevik ↔ täisminevik. Это новые блоки, то есть изменение структуры, поэтому не сделано.
2. **Длина текстов для чтения.** Почти все тексты держатся у нижней границы нормы A2+ (120–145 слов) и короче Harno B1 (200–300 слов, 6 вопросов с выбором из 3). Форматов Harno (9 ситуаций ↔ 6 объявлений, текст с 10 лакунами на выбор из 3, банк фраз с лишними) в модулях нет. Нужна отдельная партия: удлинить по одному тексту на модуль до 180–220 слов и добавить один экзаменационный формат.
3. **Аудирование.** В модулях 07 и 08 нет ни одного блока listening, в 05 и 06 по одному, везде `audio: null` (текст читает учитель). Нужна запись.
4. **Задания уровня A1–A2 в каждом листе** (перевод с русского, диктант, сборка предложения) не тронуты: это типы блоков, а менять их я не имел права. 036_p_words (школьная лексика с русским переводом) оставлен.
5. **Avasta meta.level = 'B1'** (`level: 'B1'` в createAvastaModuleNDocument и upgrade…) при этапе урока A2+. Это поле в коде, а не в содержании, и его, возможно, проверяют тесты. Вопрос для ведущего: показывать этап урока, а цель курса выводить отдельно.
6. **«Ma ei söö kala ja liha → ega»** (028_p_fix, 030_p_fix) оставлено как ошибка. По норме в отрицании предпочтительно «ega», но «ja» в разговорной речи встречается. Если владелец захочет быть строже к «ложным ошибкам», этот пункт можно заменить.
7. Поле `goal: 'g_form'` в 037_p_choice — нестандартный ключ цели (в уроке цели g_vocab / g_read / g_notice / g_use). По правилам поля goal не трогал.

## Тесты

- `npx vitest run src/features/worksheet-generator` из crm-v2: **Test Files 1 failed | 46 passed (47); Tests 7 failed | 530 passed | 1 skipped (538).**
  - Все 7 падений — тест качества курса (course.test.js) на сравнение с baseline.
  - В моих модулях 05, 06, 07 и 08 падает только массив `fixed`, то есть исправленные проблемы ушли из baseline. Ушли: 024 bank-extra, 027 и 029 bank-extra, 031, 032 и 034 bank-extra, 031 и 038 choice-length. Новых проблем (`fresh`) в моих модулях 0.
  - На промежуточном прогоне fresh-проблема была: 029 transfer, текст 118 слов < 120. Я её исправил, дописав 3 слова.
  - Падения в модулях 02, 12 и 13 относятся к файлам других агентов (fresh-проблема 058 discover в модуле 12; fixed в 02 и 13).
- Тесты avastaModule6/7/8: прошли (вместе с LessonWorksheetStudioPage 25 из 25 при отдельном запуске). LessonWorksheetStudioPage один раз упал при полном прогоне под нагрузкой и прошёл при отдельном запуске: это нестабильный тест, к моим файлам он не относится.
- `npx eslint` по 7 моим файлам: без ошибок.
