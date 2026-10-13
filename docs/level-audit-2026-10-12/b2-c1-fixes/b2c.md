# Курс B2 (b1b2-061…090, модули 13–18): исправления листов

Файлы: `crm-v2/src/features/worksheet-generator/admin/course/b2/module13.js … module18.js` (рабочая копия /Users/pavel/keelesepp-b2c1, без коммита).

Единое правило курса (принято по аудиту): после «seetõttu / selle tõttu» и после придаточного в начале фразы — инверсия (норма письменного языка); после «, mistõttu» нормативны ОБА порядка, поэтому он больше нигде не проверяется как ошибка и в ключах приняты оба варианта. «tänu sellele» при негативном следствии — ошибка; «selle tõttu» при позитивном — не ошибка. «mõtlema millele / millest» — оба нормативны. Порядок без инверсии после обстоятельства («Iga päev ma harjutan») подаётся как разговорный, а не как грубая ошибка.

## Счёт по видам

- ключи: 96
- эстонский: 25
- ложные ошибки: 25
- нерешаемые: 46
- угадываемые: 24
- чтение: 38
- всего правок: 254

## По урокам

### b1b2-061
**ключи**
- 061·discover·061_d_trans: «['Säästa vett!', 'näide', 'Ühe puuvillase särgi tootmiseks kulub 2500 liitrit vett.']» → «['Säästa vett!', 'näide → tagajärg', 'Ühe puuvillase särgi tootmiseks kulub 2500 liitrit vett, seetõttu tekib …» — эталон был просто фактом, без цепочки — дана цепочка причина → следствие
- 061·discover·061_d_trans: «['Ole roheline!', 'mõlemad tasandid', 'Vaja on nii isiklikke valikuid kui ka seadusi.']» → «['Ole roheline!', 'mõlemad tasandid', 'Kuna ettevõtted ja riik otsustavad pakendi ja saastamise hinna üle, on …» — эталон без причины — добавлена причина
- 061·practice·061_p_fix: «['Seetõttu me raiskame ressursse.', 'Seetõttu raiskame me ressursse.']» → «['Seetõttu me raiskame ressursse.', 'Seetõttu raiskame me ressursse. | Seetõttu raiskame ressursse.']» — добавлен допустимый вариант без местоимения
**нерешаемые**
- 061·practice·061_p_forms: «['keskkonnamõju', 'osastav', 'keskkonnamõju']» → «['keskkonnamõju', 'kaasaütlev', 'keskkonnamõjuga']» — ответ совпадал с исходной формой — дана другая форма
- 061·practice·061_p_fix: «['Kuna me ostame suured pakid, toit läheb halvaks.', 'Kuna me ostame suuri pakke, läheb toit halvaks.']» → «['Kuna me ostame suuri pakke, toit läheb halvaks.', 'Kuna me ostame suuri pakke, läheb toit halvaks.']» — в строке было две ошибки при инструкции «üks viga» — оставлена одна (порядок слов)
**чтение**
- 061·discover·061_d_read: «['Miks jõuab taaskasutatav materjal prügilasse?', 'kõiki jäätmeid ei sorteerita']» → «['Millisest probleemist algab autori arvates ahel? Põhjenda oma sõnadega.', 'tarbimisest: suurem tarbimine too…» — вопрос-копия заменён вопросом на вывод (начало цепочки)
- 061·discover·061_d_read: «['Miks on puuvilla kasvatavates riikides veepuudus?', 'ühe särgi jaoks kulub 2500 liitrit vett']» → «['Miks on puuvilla kasvatavates riikides veepuudus?', 'puuvilla kasvatamine vajab väga palju vett: ühe särgi j…» — ключ не отвечал на «почему» — дана причина
- 061·practice·061_p_read: «['Mida pere kuu jooksul tegi?', 'kaalus kõik jäätmed']» → «['Miks tulemus perekonda üllatas?', 'nad pidasid end keskkonnateadlikuks, kuid jäätmeid, eriti toidujäätmeid, …» — вопрос-копия → вопрос на совмещение двух мест текста
- 061·transfer·061_t_read: «['Kuidas otsus tehakse?', 'üldkoosolekul hääletusega']» → «['Miks võib maa-alune konteiner olla pikemas plaanis soodsam, kui esmapilgul tundub?', 'igakuine tasu on väiks…» — вопрос-копия → вопрос на вывод

### b1b2-062
**ключи**
- 062·discover·062_d_gaps: «'Kahjurid levivad, [sest] külm ei hävita neid.'» → «'Kahjurid levivad, [sest|kuna] külm ei hävita neid.'» — добавлен верный вариант kuna
- 062·discover·062_d_gaps: «'Eestisse jõudsid uued haigused. [Selle tõttu] hukkus palju saari.'» → «'Eestisse jõudsid uued haigused. [Selle tõttu|Seetõttu] hukkus palju saari.'» — добавлен верный вариант Seetõttu
- 062·discover·062_d_gaps: «'Vana puu võib kukkuda. [Seetõttu] eemaldatakse riskantsed puud.'» → «'Vana puu võib kukkuda. [Seetõttu|Selle tõttu] eemaldatakse riskantsed puud.'» — добавлен верный вариант Selle tõttu
- 062·practice·062_p_fix: «['Selle tõttu, et puud on haiged.', 'Selle tõttu, et puud on haiged, need lõigatakse maha.']» → «['Selle tõttu, et puud on haiged, need lõigatakse maha.', 'Selle tõttu, et puud on haiged, lõigatakse need mah…» — эталон сам нарушал правило инверсии после придаточного; исходная строка была обрывком
**эстонский**
- 062·discover·062_d_table: «selle tõttu | [negatiivne] tagajärg | lause algus» → «selle tõttu | [negatiivne] või neutraalne tagajärg | lause algus» — «selle tõttu» нейтрально, не только негативно — уточнено
**ложные ошибки**
- 062·discover·062_d_notice: «'Tagajärg samas lauses: **, mistõttu** + tegija + tegusõna: …, **mistõttu** üleujutusi on vähem.'» → «'Tagajärg samas lauses: **, mistõttu** — siin on õiged mõlemad sõnajärjed: …, **mistõttu** üleujutusi on vähem…» — единое правило курса: после mistõttu оба порядка нормативны (раньше модули 13, 16, 17 противоречили друг другу)
- 062·practice·062_p_fix: «['Tänu sellele õhk muutus saastatumaks.', 'Selle tõttu muutus õhk saastatumaks.']» → «['Tänu sellele muutus õhk saastatumaks.', 'Selle tõttu muutus õhk saastatumaks. | Seetõttu muutus õhk saastatu…» — было две ошибки (союз + порядок) — оставлена одна, добавлен вариант
- 062·transfer·062_t_fix: «['Tänu sellele kliendid kaoksid.', 'Selle tõttu kaoksid kliendid.']» → «['Tänu sellele kaoksid kliendid.', 'Selle tõttu kaoksid kliendid. | Seetõttu kaoksid kliendid.']» — было две ошибки — оставлена одна (tänu при негативном следствии)
- 062·transfer·062_t_fix: «['Parkimine on kallis, mistõttu elanikud on mures.', 'Parkimine on kallis, mistõttu on elanikud mures.']» → «['Parkimine on kallis. Mistõttu on elanikud mures.', 'Parkimine on kallis, mistõttu on elanikud mures. | Parki…» — нормативный порядок после mistõttu был выдан за ошибку — заменено реальной ошибкой (mistõttu в начале предложения), приняты оба порядка
- 062·transfer·062_t_fix: «['Selle tõttu õhk muutuks puhtamaks.', 'Tänu sellele muutuks õhk puhtamaks.']» → «['Tänu sellele õhk muutuks puhtamaks.', 'Tänu sellele muutuks õhk puhtamaks.']» — «selle tõttu» с позитивным следствием не ошибка (tõttu нейтрально), и было две ошибки — оставлена одна ошибка порядка
**нерешаемые**
- 062·discover·062_d_order: «'Puud hoiavad vihmavett, mistõttu üleujutusi on vähem.'» → «'Puud hoiavad vihmavett ja seetõttu on üleujutusi vähem.'» — после mistõttu оба порядка верны, задание на порядок слов было неоднозначным — заменено на seetõttu с инверсией
- 062·practice·062_p_fix: «['Teed on halvad, mistõttu kasutavad ratast vähem.', 'Teed on halvad, mistõttu kasutatakse ratast vähem.']» → «['Teed on halvad. Mistõttu kasutatakse ratast vähem.', 'Teed on halvad, mistõttu kasutatakse ratast vähem. | T…» — ошибка была не в союзе/порядке (как обещает инструкция) — заменена типичной ошибкой: mistõttu в начале нового предложения
- 062·practice·062_p_fix: «['Mistõttu linn ehitas rattateid.', 'Linn ehitas rattateid, mistõttu sõidab rohkem inimesi rattaga.']» → «['Linn ehitas rattateid, seetõttu rohkem inimesi sõidab rattaga.', 'Linn ehitas rattateid, seetõttu sõidab roh…» — ответ требовал придумать новое содержание — дана решаемая ошибка порядка после seetõttu
**чтение**
- 062·discover·062_d_read: «['Miks eemaldatakse riskantseid puid?', 'nad võivad tormis kukkuda']» → «['Miks soovitavad linnaplaneerijad arvestada puudega juba ehitusprojekti alguses?', 'uued puud ei asenda vanu …» — вопрос-копия → вопрос на совмещение информации
- 062·transfer·062_t_read: «['Millal saaks kaupu tuua?', 'kella kuuest kümneni hommikul']» → «['Kuidas püüab linnavalitsus ettevõtjate muresid leevendada? Nimeta kaks lahendust.', 'kaupu saab tuua hommiku…» — вопрос-копия → вопрос на совмещение

### b1b2-063
**нерешаемые**
- 063·discover·063_d_gaps: «'Soojustamine on suur [investeering] (investeering).'» → «'Soojustamine nõuab suurt [investeeringut] (investeering).'» — подсказка совпадала с ответом
- 063·practice·063_p_fix: «['Kuigi on kallim, aga see on parem.', 'Kuigi see on kallim, on selle mõju suurem.']» → «['Kuigi see on kallim, aga selle mõju on suurem.', 'Kuigi see on kallim, on selle mõju suurem.']» — две ошибки и новый смысл в ключе — оставлена одна типичная ошибка (kuigi … aga)
**чтение**
- 063·practice·063_p_read: «['Milline muutus on eksperdi arvates pikas perspektiivis suurima mõjuga?', 'Mägede pere soojustamine']» → «['Miks oli eksperdi arvates lühikeses perspektiivis suurim mõju Saarte muutusel, kuigi soojustamise mõju on su…» — вопрос-копия → вопрос на вывод
- 063·transfer·063_t_read: «['Mis on kaugtöö eelis?', 'ei maksa midagi, vähendab sõite']» → «['Kas kõik viis ettepanekut mahuksid korraga eelarvesse? Miks?', 'ei: kokku umbes 11 500 eurot, päikesepaneeli…» — вопрос-копия → вопрос на подсчёт и вывод

### b1b2-064
**ключи**
- 064·practice·064_p_trans: «'Sünteetilisi riideid pestakse sageli, mistõttu satub merre mikroplastikut.'» → «'Riideid pestakse, mistõttu satub merre mikroplastikut. | Riideid pestakse, mistõttu merre satub mikroplastiku…» — эталон добавлял слова, которых нет в задании; приняты оба порядка после mistõttu
- 064·practice·064_p_fix: «['Inimesed peavad lõpetama plastiku kasutamine.', 'Inimesed võiksid vähendada ühekordse plastiku kasutamist.']» → «['Inimesed peavad lõpetama plastiku kasutamine.', 'Inimesed võiksid vähendada ühekordse plastiku kasutamist. |…» — в ключе не было прямого исправления ошибки (kasutamise)
**эстонский**
- 064·practice·064_p_trans: «['Probleem on suur. Üks lahendus ei piisa.', 'seetõttu'» → «['Probleem on suur. Ühest lahendusest ei piisa.', 'seetõttu'» — исходное предложение было неграмматичным (piisama + seestütlev)
**нерешаемые**
- 064·transfer·064_t_gaps: «'Lahendustel on alati oma [hind] (hind) ja puudused.'» → «'Arvestage ka lahenduste [hinnaga] (hind) ja puudustega.'» — подсказка совпадала с ответом
- 064·transfer·064_t_fix: «['Tänu sellele mets on reostunud.', 'Selle tõttu on mets reostunud.']» → «['Tänu sellele on mets reostunud.', 'Selle tõttu on mets reostunud. | Seetõttu on mets reostunud.']» — было две ошибки — оставлена одна (tänu при негативе)
**чтение**
- 064·practice·064_p_read: «['Mida õpetaja kiitis?', 'oluline teema ja selge seisukoht']» → «['Milline Sergei esimese mustandi probleem oli grammatiline, mitte sisuline?', '„lõpetama plastiku kasutamine”…» — вопрос-копия → вопрос на различение
- 064·transfer·064_t_read: «['Miks ei avaldata anonüümseid kirju?', 'toimetus soovib päris nime ja kohta']» → «['Mida peaks tegema lugeja, kelle emakeel ei ole eesti keel, ja miks ta ei pea kartma?', 'kirjutama julgelt: t…» — ключ не отвечал на «почему» (в тексте причины нет) — вопрос заменён

### b1b2-065
**ключи**
- 065·discover·065_d_gram: «'Riiete hulk on kahekordistunud. [Selle tõttu] tekib palju jäätmeid.'» → «'Riiete hulk on kahekordistunud. [Selle tõttu|Seetõttu] tekib palju jäätmeid.'» — добавлен верный вариант
- 065·discover·065_d_gram: «'Seetõttu [ütlevad] eksperdid, et tuleb vähem osta.'» → «'Seetõttu [ütlevad|arvavad|leiavad|soovitavad] eksperdid, et tuleb vähem osta.'» — пропуск без подсказки — приняты все верные глаголы
- 065·discover·065_d_fix: «['Me peame lõpetama riiete ostmine.', 'Me võiksime osta vähem ja paremini.']» → «['Me peame lõpetama riiete ostmine.', 'Me peame lõpetama riiete ostmise.']» — ключ не исправлял ошибку, а менял смысл
- 065·practice·065_p_gramA: «'Tööajad on erinevad. [Selle tõttu] lähevad kokkulepped katki.'» → «'Tööajad on erinevad. [Selle tõttu|Seetõttu] lähevad kokkulepped katki.'» — добавлен верный вариант
- 065·practice·065_p_gramA: «'Seetõttu [tuleks] keskenduda sõitude vähendamisele.'» → «'Seetõttu [tuleks|tuleb] keskenduda sõitude vähendamisele.'» — добавлен верный вариант
- 065·practice·065_p_gramA: «'Kaugtöö ei sobi kõigile, [sest] müüja peab olema poes.'» → «'Kaugtöö ei sobi kõigile, [sest|kuna] müüja peab olema poes.'» — добавлен верный вариант
**эстонский**
- 065·practice·065_p_gramA: «'[Kuna] buss käib harva, on auto vajadus.'» → «'[Kuna] buss käib harva, on auto vajalik.'» — неестественная фраза «on auto vajadus»
**ложные ошибки**
- 065·discover·065_d_fix: «['Tänu sellele jäätmed kasvasid.', 'Selle tõttu kasvasid jäätmed.']» → «['Tänu sellele kasvasid jäätmed.', 'Selle tõttu kasvasid jäätmed. | Seetõttu kasvasid jäätmed.']» — было две ошибки — оставлена одна
- 065·discover·065_d_fix: «['Kiirmood on halb.', 'Kuna odavaid riideid kantakse vähe, kasvab tekstiilijäätmete hulk.']» → «['Kiirmoe tõttu tekib palju tekstiilijäätmed.', 'Kiirmoe tõttu tekib palju tekstiilijäätmeid.']» — правильное предложение было выдано за ошибку («Kirjuta lause õigesti») — заменено реальной ошибкой (palju + osastav)
**нерешаемые**
- 065·practice·065_p_gramB: «'Elektriautodel on väiksem [keskkonnamõju] (keskkonnamõju).'» → «'Elektriautot peetakse väiksema [keskkonnamõjuga] (keskkonnamõju) sõidukiks.'» — подсказка совпадала с ответом
- 065·practice·065_p_gramB: «'Laadimispunkte on maal [vähe] (vähe).'» → «'Maal ei ole piisavalt [laadimispunkte] (laadimispunkt).'» — подсказка совпадала с ответом
**чтение**
- 065·discover·065_d_read: «['Mida kohustab EL?', 'tekstiilijäätmeid eraldi koguma']» → «['Miks on kvaliteetne riie keskkonnale parem kui mitu odavat?', 'seda kantakse aastaid, odavad riided kaovad p…» — вопрос-копия → вопрос на вывод

### b1b2-066
**ключи**
- 066·practice·066_p_forms: «['järjekord', 'sisseütlev', 'järjekorda']» → «['järjekord', 'sisseütlev', 'järjekorda, järjekorrasse']» — добавлена вторая нормативная форма
- 066·practice·066_p_forms: «['lasteaed', 'mitmuse osastav', 'lasteaedu']» → «['lasteaed', 'mitmuse osastav', 'lasteaedu, lasteaiasid']» — добавлена вторая нормативная форма
**нерешаемые**
- 066·discover·066_d_gaps: «'Lasteaiakoha [järjekord] (järjekord) on aasta pikk.'» → «'Lasteaiakoha [järjekorras] (järjekord) tuleb oodata aasta.'» — подсказка совпадала с ответом
**чтение**
- 066·discover·066_d_read: «['Miks ei aita e-teenus kõiki?', 'kõigil ei ole arvutit ega oskusi']» → «['Miks ei piisa uuringu autorite sõnul sellest, et teenus on olemas? Too näide tekstist.', 'teenus peab jõudma…» — вопрос-копия → вопрос на вывод с примером
- 066·transfer·066_t_read: «['Kes aitavad küsimustikku täita?', 'raamatukogu töötajad']» → «['Kuidas püüab linn seekord saada rohkem vastuseid noortelt ja eakatelt?', 'õpilased saavad täita küsimustikku…» — ключ был неполным (помогают и соцработники, и классные руководители) — вопрос на совмещение
- 066·practice·066_p_read: «['Mida vastas vallavanem nõudebussi kohta?', 'arutatakse volikogu istungil']» → «['Millise elaniku mure saab vallavanema vastuse järgi kõige kindlamalt lahenduse? Miks?', 'Maria oma: uue last…» — вопрос-копия → вопрос на сравнение и вывод

### b1b2-067
**ключи**
- 067·discover·067_d_fix: «['Vabatahtlikud saavad kogemused ja sõbrad.', 'Vabatahtlikud saavad kogemust ja sõpru.']» → «['Vabatahtlikud saavad kogemused ja sõbrad.', 'Vabatahtlikud saavad kogemust ja sõpru. | Vabatahtlikud saavad …» — добавлен верный вариант
**эстонский**
- 067·discover·067_d_fix: «['Tänu algatus küla elab.', 'Tänu algatusele küla elab.']» → «['Tänu algatus elab küla edasi.', 'Tänu algatusele elab küla edasi.']» — эталон нарушал правило инверсии курса (Tänu algatusele küla elab)
- 067·practice·067_p_trans: «'Natalia panustab neli tundi kuus ja tänu sellele ring jätkub.'» → «'Natalia panustab neli tundi kuus ja tänu sellele ring jätkub. | Natalia panustab neli tundi kuus ja tänu sell…» — добавлен вариант с инверсией по правилу курса
**угадываемые**
- 067·practice·067_p_choice: «['Miks toetada toidupanka?', 'Igal nädalal saab abi 150 peret ja lapsed ei tule kooli tühja kõhuga.', 'Toidupa…» → «['Miks toetada toidupanka?', 'Igal nädalal saab abi 150 peret ja lapsed ei tule kooli tühja kõhuga.', 'Üks per…» — абсурдные короткие дистракторы → правдоподобные, но слабее (один случай, ссылка на авторитет)
- 067·practice·067_p_choice: «['Miks külaselts on oluline?', 'Kogukonnamaja tõttu kolis külla kaheksa uut peret.', 'Külaselts on tore.', 'Kü…» → «['Miks on külaselts oluline?', 'Pärast kogukonnamaja avamist on külla kolinud kaheksa uut peret.', 'Seltsi esi…» — то же; заодно порядок слов в вопросе (Miks on…)
- 067·practice·067_p_choice: «['Miks naabrite rühm?', 'Naabrid märkavad, kui eakas naaber pole mitu päeva väljas käinud.', 'Naabrid on sõbra…» → «['Miks naabrite rühm?', 'Naabrid märkavad, kui eakas naaber pole mitu päeva väljas käinud.', 'Rühmas on juba ü…» — то же
- 067·practice·067_p_choice: «['Miks talgud?', 'Ühe päevaga koristati metsast kaks tonni prügi.', 'Talgud on vajalikud.', 'Loodus on ilus.']» → «['Miks talgud?', 'Ühe päevaga koristati metsast kaks tonni prügi.', 'Talgutel osales ka vallavanem, kes kiitis…» — то же
- 067·practice·067_p_choice: «['Miks vabatahtlik töö noorele?', 'Noor saab kogemuse, mille saab kirjutada CV-sse.', 'Noored peaksid aitama.'…» → «['Miks vabatahtlik töö noorele?', 'Noor saab kogemuse, mille saab kirjutada CV-sse.', 'Minu sõbra poeg tegi va…» — то же
- 067·practice·067_p_choice: «['Miks laste lugemisring raamatukogus?', 'Pärast aasta osalemist loevad lapsed klassis paremini.', 'Lugemine o…» → «['Miks laste lugemisring raamatukogus?', 'Pärast aasta osalemist loevad lapsed klassis paremini.', 'Ringi juhi…» — то же
**чтение**
- 067·discover·067_d_read: «['Mida saavad noored vabatahtlikud?', 'kogemust ja sõpru']» → «['Miks ei osale kõik inimesed vabatahtlikus tegevuses ja mis aitaks neid takistusi vähendada?', 'ajapuudus, ei…» — вопрос-копия → вопрос на совмещение
- 067·transfer·067_t_read: «['Kes saavad hääletada?', 'üle 16-aastased linnaelanikud']» → «['Mis on kõigi kolme finalisti ühine nõrk koht?', 'kõik sõltuvad vabatahtlikest või järelhooldusest: noored ko…» — вопрос-копия → вопрос на вывод по всему тексту
- 067·practice·067_p_read: «['Kui palju aega see võtab?', 'umbes neli tundi kuus']» → «['Miks võib Natalia lugu julgustada inimesi, kes arvavad, et neil pole aega?', 'ka tema päev oli täis, kuid ri…» — вопрос-копия → вопрос на вывод

### b1b2-068
**ключи**
- 068·practice·068_p_fix: «['Sa pead sorteerida jäätmeid.', 'Sa pead jäätmeid sorteerima.']» → «['Sa pead sorteerida jäätmeid.', 'Sa pead jäätmeid sorteerima. | Sa pead sorteerima jäätmeid.']» — добавлен верный вариант порядка
- 068·practice·068_p_fix: «['Trepikojas ei tohi hoidma rattaid.', 'Trepikojas ei tohi rattaid hoida.']» → «['Trepikojas ei tohi hoidma rattaid.', 'Trepikojas ei tohi rattaid hoida. | Trepikojas ei tohi hoida rattaid.'…» — добавлен верный вариант порядка
- 068·practice·068_p_fix: «['Mul tuleb maksma trahvi.', 'Mul tuleb trahvi maksta.']» → «['Mul tuleb maksma trahvi.', 'Mul tuleb trahvi maksta. | Mul tuleb maksta trahvi.']» — добавлен верный вариант порядка
- 068·practice·068_p_fix: «['Kas ma võin parkima hoovis?', 'Kas ma võin hoovis parkida?']» → «['Kas ma võin parkima hoovis?', 'Kas ma võin hoovis parkida? | Kas ma võin parkida hoovis?']» — добавлен верный вариант порядка
**эстонский**
- 068·practice·068_p_choice: «['Niši võib jätta kaks vankrit.', 'See on lubatud.', 'See on kohustuslik.', 'See on keelatud.']» → «['Nišši võib jätta kaks vankrit.', 'See on lubatud.', 'See on kohustuslik.', 'See on keelatud.']» — ошибка падежа: niši → nišši (sisseütlev)
- 068·practice·068_p_read: «'vankri võib jätta niši, kõige rohkem kaks'» → «'vankri võib jätta esimese korruse nišši, korraga kõige rohkem kaks'» — ошибка падежа в ключе: niši → nišši
**нерешаемые**
- 068·practice·068_p_forms: «[['peab + sorteerima', 'ma-tegevusnimi', 'sorteerima'], ['tuleb + koristama', 'da-tegevusnimi', 'koristada'], …» → «[['sorteerida', 'Kõik elanikud peavad jäätmeid …', 'sorteerima'], ['koristama', 'Koera väljaheited tuleb hoovi…» — ответ совпадал с основой («peab + sorteerima → sorteerima»), а подсказка сама называла форму — теперь дан контекст и другая форма глагола, ученик выбирает ma/da сам
- 068·practice·068_p_forms: «'Kirjuta tegusõna õiges vormis (ma- või da-tegevusnimi).'» → «'Kirjuta tegusõna vormis, mida lause nõuab: ma- või da-tegevusnimi.'» — инструкция под новый формат
**угадываемые**
- 068·practice·068_p_choice: «['Lemmiklooma pidamiseks ei ole vaja luba.', 'Luba ei ole nõutav.', 'Lemmikloom on keelatud.', 'Luba on kohust…» → «['Lemmiklooma pidamiseks ei ole vaja luba.', 'Luba ei ole nõutav.', 'Loomast ei pea kellelegi teatama.', 'Luba…» — абсурдный дистрактор → правдоподобное неверное прочтение
- 068·practice·068_p_choice: «['Suitsetada tohib ainult hoovi otsas.', 'Mujal on keelatud.', 'Suitsetamine on kohustuslik.', 'Igal pool on l…» → «['Suitsetada tohib ainult hoovi otsas.', 'Mujal on keelatud.', 'Hoovis võib suitsetada igal pool.', 'Rõdul või…» — абсурдные дистракторы → правдоподобные
**чтение**
- 068·discover·068_d_read: «['Miks ei tohi parkida värava ette?', 'päästeautol peab olema ruumi']» → «['Millised kodukorra reeglid on seotud ohutusega? Too kaks näidet.', 'jalgrattad ja vankrid takistavad tuleohu…» — вопрос-копия → вопрос на совмещение
- 068·transfer·068_t_read: «['Miks ei saa lühiajalist üürimist keelata?', 'seadus ei luba']» → «['Miks pakub juhatus lühiajalise üürimise puhul kohustusi, mitte keeldu?', 'seadus ei luba ühistul seda täieli…» — вопрос-копия → вопрос на совмещение

### b1b2-069
**ключи**
- 069·practice·069_p_fix: «['Me soovitame kolmas lahendus.', 'Me soovitame kolmandat lahendust.']» → «['Me soovitame kolmas lahendus.', 'Me soovitame kolmandat lahendust. | Soovitame kolmandat lahendust.']» — добавлен вариант
- 069·practice·069_p_fix: «['Kaaludes kõik variandid valisime teise.', 'Kaalunud kõiki variante, valisime teise lahenduse.']» → «['Kaaludes kõik variandid valisime teise.', 'Kaalunud kõiki variante, valisime teise lahenduse. | Kaaludes kõi…» — верная des-форма (Kaaludes kõiki variante) не принималась
- 069·transfer·069_t_fix: «['See maksab umbes kümme tuhat euro.', 'See maksaks umbes kümme tuhat eurot.']» → «['See maksab umbes kümme tuhat euro.', 'See maksab umbes kümme tuhat eurot. | See maksaks umbes kümme tuhat eu…» — ключ требовал смены наклонения, которая не является исправлением ошибки
- 069·transfer·069_t_fix: «['Me oleme valmis aidata talgutel.', 'Me oleme valmis talgutel aitama.']» → «['Me oleme valmis aidata talgutel.', 'Me oleme valmis talgutel aitama. | Me oleme valmis aitama talgutel.']» — добавлен верный вариант
- 069·transfer·069_t_fix: «['Kaalunud kõik variandid, me valime teine.', 'Kaalunud kõiki variante, valime teise lahenduse.']» → «['Kaalunud kõik variandid, me valime teise.', 'Kaalunud kõiki variante, valime teise. | Kaalunud kõiki variant…» — в строке было три ошибки, ключ добавлял слово — оставлена одна ошибка, приняты варианты
**ложные ошибки**
- 069·transfer·069_t_fix: «['Elanikud võivad ise panustada oma aega.', 'Elanikud on valmis ise oma aega panustama.']» → «['Elanikud on valmis ise oma aega panustada.', 'Elanikud on valmis ise oma aega panustama.']» — правильное предложение было выдано за ошибку — заменено реальной ошибкой (valmis + ma-tegevusnimi)
**нерешаемые**
- 069·discover·069_d_gaps: «'Olen valmis ettepanekut [tutvustama] (tutvustama).'» → «'Olen valmis ettepanekut [tutvustama] (tutvustada).'» — подсказка совпадала с ответом — дана da-форма, нужна ma-форма после valmis
**чтение**
- 069·practice·069_p_read: «['Kuidas noored probleemi uurisid?', 'küsitlesid üle 200 noore']» → «['Miks võib noorte valikut nimetada pigem katseks kui lõplikuks lahenduseks?', 'teine lahendus näitab kiiresti…» — вопрос-копия → вопрос на вывод
- 069·transfer·069_t_read: «['Mitu eelmise aasta ideed on ellu viidud?', 'kuus']» → «['Miks toetas komisjon eaka proua ettepanekut ühehäälselt, kuigi see oli lühike?', 'see oli konkreetne ja liht…» — вопрос-копия (одно число) → вопрос на вывод

### b1b2-070
**ключи**
- 070·discover·070_d_gram: «'Avalikke teenuseid [tuleb] kõigile kättesaadavaks teha.'» → «'Avalikke teenuseid [tuleb|on vaja] kõigile kättesaadavaks teha.'» — добавлен верный вариант
- 070·discover·070_d_fix: «['Tuleb teavitama naabreid.', 'Naabreid tuleb teavitada.']» → «['Tuleb teavitama naabreid.', 'Naabreid tuleb teavitada. | Tuleb teavitada naabreid.']» — добавлен верный вариант
- 070·practice·070_p_gramA: «'Kogemus [tuleb] hiljem läbi mõelda.'» → «'Kogemus [tuleb|on vaja] hiljem läbi mõelda.'» — добавлен верный вариант
- 070·practice·070_p_gramB: «'Noored saavad [kogemusi] (kogemus).'» → «'Noored saavad [kogemusi|kogemust] (kogemus).'» — добавлен верный вариант
- 070·practice·070_p_trans: «['Vabatahtlik töö on kohustuslik.', 'peab', 'Õpilane peab tegema vabatahtlikku tööd.']» → «['Vabatahtlik töö on kohustuslik.', 'peab', 'Õpilane peab tegema vabatahtlikku tööd. | Õpilane peab vabatahtli…» — добавлены варианты
- 070·transfer·070_t_fix: «['Tuleb aitama naabrit.', 'Naabrit tuleb aidata.']» → «['Tuleb aitama naabrit.', 'Naabrit tuleb aidata. | Tuleb aidata naabrit.']» — добавлен верный вариант
**эстонский**
- 070·practice·070_p_trans: «['Kohustus ei ole.', 'ei pea', 'Õpilane ei pea vabatahtlikku tööd tegema.']» → «['Kohustust ei ole.', 'ei pea', 'Õpilane ei pea vabatahtlikku tööd tegema. | Vabatahtlikku tööd ei pea tegema.…» — ошибка в исходнике (Kohustus ei ole → Kohustust); добавлен вариант
**ложные ошибки**
- 070·discover·070_d_fix: «['Usaldus on oluline.', 'Usaldus on oluline, sest siis järgitakse reegleid vabatahtlikult.']» → «['Inimesed usaldavad päästeametile.', 'Inimesed usaldavad päästeametit.']» — правильное предложение было выдано за ошибку — заменено реальной ошибкой управления
- 070·transfer·070_t_fix: «['Vastutus on oluline.', 'Vastutus tähendab, et kui ma luban aidata, siis ma ka aitan.']» → «['Ma lubasin naabrile aidata.', 'Ma lubasin naabrit aidata.']» — правильное предложение было выдано за ошибку — заменено реальной ошибкой управления
- 070·transfer·070_t_fix: «['Koolid võiksid leida vahepealse lahenduse.', 'Koolid võiksid anda kogukonnatöö eest ainepunkte.']» → «['Vabatahtlikku tööd ei tohi tegema sunniviisiliselt.', 'Vabatahtlikku tööd ei tohi teha sunniviisiliselt.']» — правильное предложение было выдано за ошибку — заменено реальной ошибкой (ei tohi + da)
**нерешаемые**
- 070·discover·070_d_gram: «'Teenuse [kättesaadavus] erineb piirkonniti.'» → «'Teenuse [kättesaadavus] (kättesaadav) erineb piirkonniti.'» — пропуск без подсказки имел несколько ответов — дана основа
- 070·practice·070_p_gramB: «'Teenuse [kättesaadavus] (kättesaadavus) on oluline.'» → «'Omavalitsus peab hoolitsema teenuste [kättesaadavuse] (kättesaadavus) eest.'» — подсказка совпадала с ответом
- 070·practice·070_p_trans: «['See on keelatud.', 'ei tohi', 'Kogukonnatöö ei tohi muutuda tühjaks kohustuseks.']» → «['Kogukonnatöö muutumine tühjaks kohustuseks on lubamatu.', 'ei tohi', 'Kogukonnatöö ei tohi muutuda tühjaks k…» — в исходнике не было содержания ответа — дано полное исходное предложение
**чтение**
- 070·discover·070_d_read: «['Keda usaldavad eestlased kõige rohkem?', 'päästeametit, politseid, e-riiki']» → «['Miks võib kaasav eelarve suurendada usaldust ka nende inimeste seas, kelle idee ei võitnud?', 'nad on näinud…» — вопрос-копия → вопрос на вывод

### b1b2-071
**ключи**
- 071·discover·071_d_gaps: «'[Ilmselt] pingutasid töötajad rohkem, sest katse oli ajutine.'» → «'[Ilmselt|Võib-olla] pingutasid töötajad rohkem, sest katse oli ajutine.'» — добавлен верный вариант
- 071·discover·071_d_gaps: «'[Võib-olla] annab ülikooli uuring vastuse.'» → «'[Võib-olla|Ilmselt] annab ülikooli uuring vastuse.'» — добавлен верный вариант
- 071·discover·071_d_trans: «['Neljapäevane töönädal on kindlasti tulevik.', 'oletus', 'Võib-olla on neljapäevane töönädal tulevik.']» → «['Neljapäevane töönädal on kindlasti tulevik.', 'oletus', 'Võib-olla on neljapäevane töönädal tulevik. | Ilmse…» — добавлены верные варианты
- 071·discover·071_d_trans: «['Tootlikkus tõusis.', 'oletus', 'Tõenäoliselt tõusis tootlikkus.']» → «['Tootlikkus tõusis.', 'oletus', 'Tõenäoliselt tõusis tootlikkus. | Ilmselt tõusis tootlikkus. | Võib-olla tõu…» — добавлены верные варианты
**нерешаемые**
- 071·discover·071_d_trans: «['Tulemused olid head.', 'fakt', 'Kümme ettevõtet kaheteistkümnest jätkas.']» → «['Tulemused olid head.', 'fakt: mitu ettevõtet jätkas?', 'Kümme ettevõtet kaheteistkümnest otsustas jätkata. |…» — ответ не выводился из задания — в подсказке указано, какой факт нужен
- 071·practice·071_p_table: «B.table('071_p_table', 'Kümme väidet.'» → «B.table('071_p_table', 'Kaheksa väidet.'» — заголовок обещал 10 утверждений, в таблице 8
- 071·practice·071_p_gaps: «'Ministeeriumi [esindaja] (esindaja) sõnul jääb otsus koolidele.'» → «'Ministeeriumi [ametnike] (ametnik) sõnul jääb otsus koolidele.'» — подсказка совпадала с ответом
**угадываемые**
- 071·discover·071_d_gaps: «'Kirjuta sobiv sõna: kindlasti, ilmselt, väidetavalt, kahjuks, liiga, võib-olla.'» → «'Kirjuta sobiv sõna: kindlasti, ilmselt, väidetavalt, kahjuks, liiga, võib-olla, õnneks.'» — в банке было ровно столько слов, сколько пропусков — добавлено лишнее слово

### b1b2-072
**ключи**
- 072·discover·072_d_gaps: «'Autor [leiab], et vanalinn peab olema elamiseks.'» → «'Autor [leiab|rõhutab], et vanalinn peab olema elamiseks.'» — добавлен верный вариант
- 072·practice·072_p_trans: «'Mart leiab, et õpetaja peaks olema juhendaja.'» → «'Mart leiab, et õpetaja peaks olema juhendaja. | Mart leiab, et õpetaja peab olema juhendaja.'» — добавлен вариант, буквально повторяющий цитату
**нерешаемые**
- 072·transfer·072_t_gaps: «'Teksti [toon] (toon) on emotsionaalne.'» → «'Autor kirjutab emotsionaalses [toonis] (toon).'» — подсказка совпадала с ответом
- 072·transfer·072_t_gaps: «'Teksti [eesmärk] (eesmärk) on muuta suhtumist.'» → «'Autori [eesmärgiks] (eesmärk) on muuta täiskasvanute suhtumist.'» — подсказка совпадала с ответом
**угадываемые**
- 072·discover·072_d_choice: «['„Ametlikult nimetatakse seda arenguks.”', 'Autor ei pea seda arenguks.', 'Autor on arenguga rahul.', 'Autor …» → «['„Ametlikult nimetatakse seda arenguks.”', 'Autor ei pea seda arenguks.', 'Autor on arenguga rahul.', 'Autori…» — абсурдный дистрактор → правдоподобный
- 072·discover·072_d_choice: «['„Hiinas valmistatud „Eesti” villased sokid”', 'Suveniirid ei ole ehtsad.', 'Hiina sokid on kvaliteetsed.', '…» → «['„Hiinas valmistatud „Eesti” villased sokid”', 'Suveniirid ei ole ehtsad.', 'Eesti tootjad on viinud tootmise…» — то же
- 072·discover·072_d_choice: «['„Meie linnavalitsus on piirdunud ilusate kõnedega.”', 'Linnavalitsus ei ole midagi teinud.', 'Linnavalitsus …» → «['„Meie linnavalitsus on piirdunud ilusate kõnedega.”', 'Linnavalitsus räägib, kuid ei tegutse.', 'Linnavalits…» — дистрактор-противоположность → правдоподобные неверные прочтения
- 072·discover·072_d_choice: «['„jääb meile ainult ilus dekoratsioon”', 'Vanalinn on ilus, kuid tühi.', 'Vanalinna tuleb kaunistada.', 'Deko…» → «['„jääb meile ainult ilus dekoratsioon”', 'Vanalinn on ilus, kuid tühi.', 'Vanalinna tuleb rohkem kaunistada.'…» — то же
- 072·discover·072_d_gaps: «'Kirjuta sobiv tegusõna õiges vormis: leidma, rõhutama, kritiseerima, tooma, küsima, ootama.'» → «'Kirjuta sobiv tegusõna õiges vormis: leidma, rõhutama, kritiseerima, tooma, küsima, ootama, keelduma.'» — банк = числу пропусков — добавлено лишнее слово

### b1b2-073
**угадываемые**
- 073·discover·073_d_gaps: «'Kirjuta sobiv sõna: väide, põhjus, tõend, näide, vastuväide, üldistus.'» → «'Kirjuta sobiv sõna õiges vormis: väide, põhjus, tõend, näide, vastuväide, üldistus, järeldus.'» — банк = числу пропусков — добавлено лишнее слово; инструкция уточнена (нужна форма)
- 073·practice·073_p_choice: «['Teema: koolivormid', 'Koolivorm vähendab uuringute järgi riiete pärast kiusamist, mida näitas ka meie kooli …» → «['Teema: koolivormid', 'Uuringute järgi kiusatakse vormiga koolides riiete pärast harvem, seda näitas ka meie …» — дистракторы-оскорбления → нерелевантная статистика и обобщение по одному случаю (сила аргумента, а не «аргумент против оскорбления»)
- 073·practice·073_p_choice: «['Teema: tasuta ühistransport', 'Tallinnas suurenes pärast tasuta transporti bussisõitjate arv, kuid autode ar…» → «['Teema: tasuta ühistransport', 'Tallinnas suurenes pärast tasuta transporti bussisõitjate arv, kuid autode ar…» — то же
- 073·practice·073_p_choice: «['Teema: kodutööd', 'Uuringud näitavad, et algklassides on kodutööde mõju õppimisele väike.', 'Minu laps vihka…» → «['Teema: kodutööd', 'Uuringud näitavad, et algklassides on kodutööde mõju õppimisele väike.', 'Minu laps vihka…» — то же
- 073·practice·073_p_choice: «['Teema: suhkrumaks', 'Pärast suhkrumaksu vähenes mitmes riigis magusate jookide tarbimine kümme protsenti.', …» → «['Teema: suhkrumaks', 'Pärast suhkrumaksu vähenes mitmes riigis magusate jookide tarbimine kümme protsenti.', …» — то же
- 073·practice·073_p_choice: «['Teema: kaugtöö', 'Meie firma küsitluses ütles 70% töötajatest, et nad keskenduvad kodus paremini.', 'Kaugtöö…» → «['Teema: kaugtöö', 'Meie firma küsitluses ütles 70% töötajatest, et nad keskenduvad kodus paremini.', 'Minu ko…» — то же
- 073·practice·073_p_choice: «['Teema: koerad pargis', 'Lastevanemad kardavad, kuid aiaga ala lahendaks probleemi, nagu Tartus.', 'Koerad on…» → «['Teema: koerad pargis', 'Tartus vähenesid pärast aiaga koerte ala rajamist kaebused poole võrra.', 'Linnas on…» — то же

### b1b2-074
**ключи**
- 074·practice·074_p_trans: «['Teadlane: „Kasu saavad ainult varesed.”', 'väidab', 'Teadlane väidab, et kasu saavad peamiselt varesed.']» → «['Teadlane: „Kasu saavad peamiselt varesed ja tuvid.”', 'väidab', 'Teadlane väidab, et kasu saavad peamiselt v…» — цитата искажала текст (ainult), а ключ — цитату; согласовано с текстом
**эстонский**
- 074·discover·074_d_fix: «['Õpetajad on kindlasti õigus.', 'Õpetajad on mures, sest pikk lugemine arendab keskendumist.']» → «['Õpetajatel on kindlasti õigus.', 'Õpetajad on mures, sest pikk lugemine arendab keskendumist.']» — в строке была грамматическая ошибка (Õpetajad on õigus), которую ключ не исправлял — оставлена только оценочность

### b1b2-075
**ключи**
- 075·discover·075_d_gram: «'Uurijad [väidavad], et pealkirjad muutuvad emotsionaalsemaks.'» → «'Uurijad [väidavad|leiavad|arvavad|märgivad], et pealkirjad muutuvad emotsionaalsemaks.'» — пропуск без подсказки — приняты все верные глаголы
- 075·discover·075_d_gram: «'Endine peatoimetaja [tõi] välja ühe näite.'» → «'Endine peatoimetaja [tõi|toob] välja ühe näite.'» — добавлен верный вариант
- 075·discover·075_d_gram: «'See väide on [oletus], sest seda ei saa kontrollida.'» → «'See väide on [oletus], sest selles on sõna „ilmselt”.'» — ключ противоречил тому же листу (075_d_order: «hinnang, sest seda ei saa kontrollida») — критерий сделан однозначным
- 075·discover·075_d_gram: «'Kokkuvõttes ei tohi olla minu [hinnangut].'» → «'Kokkuvõttes ei tohi olla minu [hinnangut|arvamust].'» — добавлен верный вариант
**нерешаемые**
- 075·meta·canDo: «loen umbes 400-sõnalise teksti» → «loen umbes 300–350-sõnalise teksti» — canDo обещал 400 слов, в текстах 310–320
- 075·practice·075_p_read: «B.reading('075_p_read', 'Lugemine (umbes 400 sõna).'» → «B.reading('075_p_read', 'Lugemine (umbes 320 sõna).'» — заголовок обещал 400 слов, в тексте 317
- 075·practice·075_p_gram: «'Argument on [nõrk] (nõrk), kui puudub tõend.'» → «'Tõendita argumenti peetakse [nõrgaks] (nõrk).'» — подсказка совпадала с ответом

### b1b2-076
**ключи**
- 076·discover·076_d_gaps: «'[Kuigi] pealinnas on kõrgemad palgad, kolivad paljud väikelinna.'» → «'[Kuigi|Ehkki] pealinnas on kõrgemad palgad, kolivad paljud väikelinna.'» — kuigi/ehkki взаимозаменяемы — добавлен вариант
- 076·discover·076_d_gaps: «'[Ehkki] kaugtöö on tavaline, peavad paljud kontoris käima.'» → «'[Ehkki|Kuigi] kaugtöö on tavaline, peavad paljud kontoris käima.'» — то же
- 076·discover·076_d_trans: «'Hinnad tõusevad, mistõttu on kohalikel noortel raske kodu osta.'» → «'Hinnad tõusevad, mistõttu on kohalikel noortel raske kodu osta. | Hinnad tõusevad, mistõttu kohalikel noortel…» — единое правило: после mistõttu принимаются оба порядка
- 076·practice·076_p_trans: «'Lapsed käivad ise koolis, mistõttu ei pea neid sõidutama.'» → «'Lapsed käivad ise koolis, mistõttu ei pea neid sõidutama. | Lapsed käivad ise koolis, mistõttu neid ei pea sõ…» — то же
**эстонский**
- 076·discover·076_d_read: «on kolme toaline korter Viljandis» → «on kolmetoaline korter Viljandis» — орфография: kolmetoaline пишется слитно
- 076·transfer·076_t_order: «'Samal ajal kui kontor kasvab, tuleb Tallinnas käia.'» → «'Kuni kontor alles kasvab, tuleb kord kuus Tallinnas käia.'» — по смыслу нужно «пока (до тех пор)» — kuni
**ложные ошибки**
- 076·practice·076_p_fix: «['Maja on odav, mistõttu ostsid nad selle kohe ära.', 'Maja on odav, mistõttu nad ostsid selle kohe ära.']» → «['Kuna maja oli odav, nad ostsid selle kohe ära.', 'Kuna maja oli odav, ostsid nad selle kohe ära.']» — нормативный порядок после mistõttu был выдан за ошибку (противоречило модулю 13 и 076_d) — заменено бесспорной ошибкой
- 076·discover·076_d_notice: «'Tagajärg: **, mistõttu** + kõrvallause (tegija ette) · **Seetõttu** + TEGUSÕNA + tegija'» → «'Tagajärg: **, mistõttu** + kõrvallause (õiged on mõlemad: mistõttu **nad ostsid** / mistõttu **ostsid nad**) …» — единое правило курса для mistõttu (оба порядка нормативны)
**угадываемые**
- 076·discover·076_d_gaps: «'Kirjuta sobiv sidend: kuigi, ehkki, samal ajal kui, juhul kui, mistõttu, seetõttu.'» → «'Kirjuta sobiv sidend: kuigi, ehkki, samal ajal kui, juhul kui, mistõttu, seetõttu, sest.'» — банк = числу пропусков — добавлено лишнее слово

### b1b2-077
**ключи**
- 077·discover·077_d_fix: «['Hommikul ma kuulan raadiot autos.', 'Hommikul kuulan ma autos raadiot.']» → «['Hommikul ma kuulan raadiot autos.', 'Hommikul kuulan ma autos raadiot. | Hommikul kuulan ma raadiot autos.']» — ключ менял и второстепенный порядок — принят минимальный вариант
- 077·discover·077_d_fix: «['Õpetaja soovitab, et iga päev me harjutame.', 'Õpetaja soovitab, et me harjutaksime iga päev.']» → «['Õpetaja soovitab, et iga päev me harjutame.', 'Õpetaja soovitab, et me harjutaksime iga päev. | Õpetaja soov…» — ключ требовал ещё и смены наклонения — приняты варианты с исправленным порядком
- 077·practice·077_p_fix: «['Kolleegid ütlesid, et aitavad nad mind.', 'Kolleegid ütlesid, et nad aitavad mind.']» → «['Kolleegid ütlesid, et aitavad nad mind.', 'Kolleegid ütlesid, et nad aitavad mind. | Kolleegid ütlesid, et n…» — добавлен верный вариант
- 077·transfer·077_t_fix: «['Nüüd ma räägin tööl eesti keelt iga päev.', 'Nüüd räägin ma tööl iga päev eesti keelt.']» → «['Nüüd ma räägin tööl eesti keelt iga päev.', 'Nüüd räägin ma tööl iga päev eesti keelt. | Nüüd räägin ma tööl…» — принят минимальный верный вариант
**ложные ошибки**
- 077·discover·077_d_sort: «B.categorize('077_d_sort', 'Õige või vale sõnajärg?', 'Sorteeri laused.', [['Õige',» → «B.categorize('077_d_sort', 'Kirjakeele sõnajärg?', 'Sorteeri laused: neutraalne kirjakeel või viga / kõnekeeln…» — порядок без инверсии после обстоятельства не грубая ошибка — категории переименованы (кирьякеэль / ошибка или разговорный)
- 077·discover·077_d_sort: «['Vale', ['Seetõttu õpetajad soovitavad keelekohvikuid.'» → «['Viga või kõnekeelne', ['Seetõttu õpetajad soovitavad keelekohvikuid.'» — то же
- 077·discover·077_d_fix: «B.errorfix('077_d_fix', 'Paranda sõnajärg.', 'Igas lauses on sõnajärje viga.'» → «B.errorfix('077_d_fix', 'Paranda sõnajärg.', 'Kirjuta laused neutraalse kirjakeele sõnajärjega.'» — инструкция: речь о нормe письменного языка, не о «грубой ошибке»
- 077·practice·077_p_fix: «B.errorfix('077_p_fix', 'Igori vead.', 'Paranda sõnajärg.'» → «B.errorfix('077_p_fix', 'Igori vead.', 'Paranda sõnajärg nii, nagu see on neutraalses kirjakeeles.'» — то же, что 077_d_fix
- 077·transfer·077_t_fix: «['Müüja naeratas ja ta mind parandas.', 'Müüja naeratas ja parandas mind.']» → «['Kui ma ütlesin vale sõna, müüja naeratas.', 'Kui ma ütlesin vale sõna, naeratas müüja.']» — исходное предложение было допустимым — заменено реальной ошибкой порядка
- 077·transfer·077_t_fix: «['Ma soovitan, et algajad ei karda vigu.', 'Ma soovitan algajatel vigu mitte karta.']» → «['Kui sa teed vigu, sa õpid kiiremini.', 'Kui sa teed vigu, õpid sa kiiremini. | Kui sa teed vigu, õpid kiirem…» — ошибка была не в порядке слов (как требует инструкция), ключ менял конструкцию — заменено ошибкой порядка
- 077·discover·077_d_notice: «(mitte: Eile ma õppisin)'» → «(kõnekeeles kuuleb ka: Eile ma õppisin)'» — порядок без инверсии не грубая ошибка, а разговорный вариант
**нерешаемые**
- 077·discover·077_d_fix: «['Ta ütles, et vigu teevad kõik ei.', 'Ta ütles, et kõik teevad vigu.']» → «['Ta ütles, et teevad kõik vigu.', 'Ta ütles, et kõik teevad vigu. | Ta ütles, et vigu teevad kõik.']» — нереалистичная «сломанная» ошибка заменена реальной (инверсия в придаточном)
**чтение**
- 077·transfer·077_t_read: «['Kui kaua on keelekohvik tegutsenud?', 'kolm aastat']» → «['Miks ei pea autor kartma, et tema lugu on vigadega?', 'kohvik ei otsi täiuslikke tekste; toimetaja parandab …» — вопрос-копия → вопрос на совмещение

### b1b2-078
**ключи**
- 078·practice·078_p_fix: «['Noormees, lõpetatud ülikooli, õpib siin.', 'Ülikooli lõpetanud noormees õpib siin.']» → «['Noormees, lõpetatud ülikooli, õpib siin.', 'Ülikooli lõpetanud noormees õpib siin. | Noormees, kes on lõpeta…» — добавлен верный вариант
- 078·practice·078_p_fix: «['Kasutades vanad joonised valmistab ta osi.', 'Vanu jooniseid kasutades valmistab ta osi.']» → «['Kasutades vanad joonised valmistab ta osi.', 'Vanu jooniseid kasutades valmistab ta osi. | Kasutades vanu jo…» — принят вариант с исправлением только падежа
**эстонский**
- 078·discover·078_d_read: «köetakse kaskede puudega mitu tundi» → «köetakse kasepuudega mitu tundi» — неестественное «kaskede puudega» → kasepuudega
- 078·transfer·078_t_read: «Enne kuller saabumist kontrollib» → «Enne kulleri saabumist kontrollib» — ошибка падежа: kulleri
- 078·transfer·078_t_read: «Pakki üle andes saab klient automaatselt e-kirja, milles on jälgimisnumber.» → «Pakki kullerile üle andes märgi tellimus süsteemis saadetuks, siis saab klient automaatselt e-kirja, milles on…» — «висящий» des-оборот (Pakki üle andes saab klient…) — субъект des-формы должен совпадать с подлежащим
**нерешаемые**
- 078·practice·078_p_sort: «B.categorize('078_p_sort', 'Mis vorm?', 'Sorteeri tekstist leitud vormid.'» → «B.categorize('078_p_sort', 'Mis vorm?', 'Sorteeri vormid tähenduse järgi.'» — часть форм в тексте отсутствует — инструкция не ссылается на текст
**чтение**
- 078·transfer·078_t_read: «['Kellele on juhend mõeldud?', 'alustavatele töötajatele, kes tegelevad tellimustega']» → «['Miks tasub kiireloomulised tellimused töödelda hommikupoolikul?', 'pakid antakse kullerile kell neli; hiljem…» — вопрос-копия → вопрос на совмещение

### b1b2-079
**ключи**
- 079·discover·079_d_fix: «['Raamatukogu võidakse sulgema järgmisel aastal.', 'Raamatukogu võidakse järgmisel aastal sulgeda.']» → «['Raamatukogu võidakse sulgema järgmisel aastal.', 'Raamatukogu võidakse järgmisel aastal sulgeda. | Raamatuko…» — принят вариант с исправлением только формы
- 079·transfer·079_t_fix: «['Tiina sõnul otsus olevat tehtud.', 'Tiina sõnul olevat otsus tehtud ilma aruteluta.']» → «['Tiina sõnul otsus olevat tehtud.', 'Tiina sõnul olevat otsus tehtud. | Tiina sõnul olevat otsus tehtud ilma …» — ключ добавлял слова, которых нет в исходнике
- 079·transfer·079_t_fix: «['Jaan pakkus, et kasutatakse päevapõhine hind.', 'Jaan pakkus, et võiks kasutada päevapõhist hinda.']» → «['Jaan pakkus, et kasutatakse päevapõhine hind.', 'Jaan pakkus, et võiks kasutada päevapõhist hinda. | Jaan pa…» — приняты верные варианты
**нерешаемые**
- 079·practice·079_p_fix: «['Plaan olevat teada olnud kevadel on.', 'Plaan olevat olnud teada kevadel.']» → «['Plaan olevat oli teada kevadel.', 'Plaan olevat olnud teada kevadel.']» — «сломанная» строка заменена типичной ошибкой формы (olevat + nud)
**чтение**
- 079·discover·079_d_read: «['Kuidas lõplik otsus tehakse?', 'volikogu istungil pärast avalikku arutelu']» → «['Miks kasutab ajakirjanik elanike esindaja väite juures vormi „olevat”?', 'see on esindaja väide, mida ei ole…» — вопрос-копия → вопрос на понимание функции формы
- 079·practice·079_p_read: «['Mis on volikogu esimehe arvates kõige realistlikum?', 'koolimaja variant']» → «['Miks ei saa koolimaja varianti veel kohe valida, kuigi seda toetati kõige rohkem?', 'selle kulud tuleb veel …» — вопрос-копия → вопрос на совмещение
- 079·transfer·079_t_read: «['Mis on töötajate esindaja ülesanne?', 'koondada arvamused ühisesse kirja']» → «['Milline ettepanek aitaks nii Annet kui ka Tiinat ja miks?', 'erand või väiksem (päevapõhine) hind neile, kel…» — вопрос-копия → вопрос на совмещение

### b1b2-080
**ключи**
- 080·discover·080_d_gram: «'Rõõm kaob kiiresti, [mistõttu] tekib uus soov osta.'» → «'Rõõm kaob kiiresti, [mistõttu|seetõttu] tekib uus soov osta.'» — добавлен верный вариант
- 080·discover·080_d_gram: «'[Kuigi] idee tundub lihtne, on küsimus tõsine.'» → «'[Kuigi|Ehkki] idee tundub lihtne, on küsimus tõsine.'» — добавлен верный вариант
- 080·practice·080_p_gramA: «'[Kuigi] turism toob raha, väheneb elanike arv.'» → «'[Kuigi|Ehkki] turism toob raha, väheneb elanike arv.'» — добавлен верный вариант
- 080·practice·080_p_gramA: «'[Juhul kui] korterit üüritakse üle 30 öö, tuleb maksta trahvi.'» → «'[Juhul kui|Kui] korterit üüritakse üle 30 öö, tuleb maksta trahvi.'» — добавлен верный вариант
- 080·practice·080_p_trans: «['Linn kehtestas piirangu.', 'umbisikuline', 'Kehtestati piirang.']» → «['Linn kehtestas piirangu.', 'umbisikuline', 'Kehtestati piirang. | Piirang kehtestati.']» — добавлен верный вариант
- 080·transfer·080_t_fix: «['Seetõttu linn peaks piirama.', 'Seetõttu peaks linn üürimist piirama.']» → «['Seetõttu linn peaks piirama.', 'Seetõttu peaks linn piirama. | Seetõttu peaks linn üürimist piirama.']» — ключ добавлял слово
**эстонский**
- 080·discover·080_d_gram: «'Asju [hooldades] (hooldama, -des) kestavad need kauem.'» → «'Asju [hooldades] (hooldama, -des) pikendame nende eluiga.'» — «висящий» des-оборот (Asju hooldades kestavad need…) — исправлено
- 080·discover·080_d_fix: «['Asju parandavas kestavad need kauem.', 'Asju parandades kestavad need kauem.']» → «['Asju parandavas pikendame nende eluiga.', 'Asju parandades pikendame nende eluiga.']» — эталон сам содержал «висящий» des-оборот
- 080·transfer·080_t_fix: «['Kokkuvõtteks lühiajaline üürimine on probleem.', 'Kokkuvõttes on lühiajaline üürimine probleem, mida saab la…» → «['Kokkuvõtteks lühiajaline üürimine on probleem.', 'Kokkuvõtteks on lühiajaline üürimine probleem. | Kokkuvõtt…» — в ключе не хватало запятой перед des-оборотом и он добавлял содержание — дан минимальный верный ответ
**ложные ошибки**
- 080·transfer·080_t_fix: «['Kortereid ostnud ettevõtted ostavad praegu juurde.', 'Kortereid ostvad ettevõtted ostavad praegu juurde.']» → «['Eelmisel aastal ostev korter on juba välja üüritud.', 'Eelmisel aastal ostetud korter on juba välja üüritud.…» — правильное предложение было выдано за ошибку — заменено реальной ошибкой Марины (-v вместо -tud)
- 080·transfer·080_t_fix: «['Ma ei tea.', 'Hea küsimus. Ma pole sellele mõelnud, aga võib-olla oleks õiglane piir 60 ööd.']» → «['Kui ma oleksin linnapea, ma piiraksin üürimist.', 'Kui ma oleksin linnapea, piiraksin ma üürimist. | Kui ma …» — нормальная фраза была выдана за ошибку — заменено реальной ошибкой порядка
**нерешаемые**
- 080·meta·canDo: «loen 400–500-sõnalise teksti, räägin spontaanselt» → «loen umbes 300–350-sõnalise teksti, räägin spontaanselt» — canDo обещал 400–500 слов, в тексте 322
- 080·practice·080_p_read: «B.reading('080_p_read', 'Lugemine (400–500 sõna).'» → «B.reading('080_p_read', 'Lugemine (umbes 320 sõna).'» — заголовок обещал 400–500 слов, в тексте 322

### b1b2-081
**ключи**
- 081·practice·081_p_fix: «['Seega poed peaksid olema kinni.', 'Seega peaksid poed pühapäeval olema avatud lühemat aega.']» → «['Seega poed peaksid olema kinni.', 'Seega peaksid poed olema kinni. | Seega peaksid poed pühapäeval kinni ole…» — ключ менял смысл, не принимал прямое исправление порядка
- 081·transfer·081_t_fix: «['Seega kesklinn peaks olema autovaba.', 'Seega peaks kesklinn olema autovaba vähemalt nädalavahetustel.']» → «['Seega kesklinn peaks olema autovaba.', 'Seega peaks kesklinn olema autovaba. | Seega peaks kesklinn olema au…» — принято прямое исправление порядка
**угадываемые**
- 081·practice·081_p_gaps: «'Kirjuta sobiv sõna: arvates, põhjus, näiteks, tunnistada, kokkuvõttes, seetõttu.'» → «'Kirjuta sobiv sõna: arvates, põhjus, näiteks, tunnistada, kokkuvõttes, seetõttu, lisaks.'» — банк = числу пропусков — добавлено лишнее слово
**чтение**
- 081·practice·081_p_read: «['Millist vastuargumenti soovitas õpetaja?', 'inimesed, kes saavad poes käia ainult nädalavahetusel']» → «['Miks tundus Antoni tekst ühekülgne ja kuidas seda parandada?', 'vastuargument puudus; tuleks lisada lõik ini…» — вопрос-копия → вопрос на совмещение
- 081·transfer·081_t_read: «['Mis juhtus eelmise aasta ettepanekuga?', 'kesklinna rajati rattaparkla']» → «['Millistel tekstidel on õpetaja nõuannete järgi suurem võimalus võita?', 'neil, kus autor kirjeldab konkreets…» — вопрос-копия → вопрос на вывод

### b1b2-082
**эстонский**
- 082·discover·082_d_fix: «['Ok, aitäh.', 'Täname abi eest.']» → «['Ok, aitäh.', 'Tänan abi eest. | Aitäh abi eest!']» — пишет один человек — «Tänan», а не «Täname»
- 082·practice·082_p_sort: «'Jaanuse kiri (tõhusam võiks olla)'» → «'Jaanuse kiri (vähem tõhus)'» — неестественная формулировка категории
- 082·practice·082_p_listen: «Sooviksin muuta üürileping alates jaanuarist tähtajatuks» → «Sooviksin muuta üürilepingu alates jaanuarist tähtajatuks» — ошибка падежа объекта (üürilepingu)
- 082·practice·082_p_listen: «Lisaks palusin, kas oleks võimalik paigaldada köögis uus pliit» → «Lisaks küsisin, kas oleks võimalik paigaldada köögisse uus pliit» — palusin + kas → küsisin; paigaldama kuhu → köögisse
- 082·practice·082_p_listen: «'Ta palus köögis uut [pliiti].'» → «'Ta küsis köögisse uut [pliiti].'» — согласовано с исправленной транскрипцией
**чтение**
- 082·discover·082_d_read: «['Mis on tausta ülesanne?', 'selgitada, kes oled ja miks kirjutad']» → «['Miks on teemarida „Lepingu 1234 arve parandamine” parem kui „Küsimus”?', 'see ütleb kohe, millega on tegemis…» — вопрос-копия → вопрос на вывод
- 082·transfer·082_t_read: «['Kas grupi vahetamine maksab?', 'ei, see on tasuta']» → «['Millist gruppi võiks soovitada inimesele, kes töötab nädala sees ja ei karda kodutöid? Miks?', 'laupäevast i…» — вопрос-копия → вопрос на вывод

### b1b2-083
**ключи**
- 083·transfer·083_t_fix: «['Seetõttu noored ei tule keskusesse.', 'Seetõttu ei jõua äärealade noored keskusesse.']» → «['Seetõttu noored ei tule keskusesse.', 'Seetõttu ei tule noored keskusesse. | Seetõttu ei jõua äärealade noor…» — принято прямое исправление порядка
- 083·transfer·083_t_fix: «['Kokkuvõtteks noortel on vähe võimalusi.', 'Kokkuvõttes oleks esimene samm pikem lahtiolekuaeg, sest see on o…» → «['Kokkuvõtteks noortel on vähe võimalusi.', 'Kokkuvõtteks on noortel vähe võimalusi. | Kokkuvõttes oleks esime…» — принято прямое исправление порядка
**угадываемые**
- 083·discover·083_d_gaps: «'Kirjuta sobiv sõna: nõiaring, tagajärjed, vastu, vähendada, hinnangul, meetmest.'» → «'Kirjuta sobiv sõna: nõiaring, tagajärjed, vastu, vähendada, hinnangul, meetmest, põhjus.'» — банк = числу пропусков — добавлено лишнее слово

### b1b2-084
**ключи**
- 084·discover·084_d_fix: «['Ma pean õppida rohkem.', 'Ma pean rohkem õppima.']» → «['Ma pean õppida rohkem.', 'Ma pean rohkem õppima. | Ma pean õppima rohkem.']» — добавлен верный вариант
- 084·discover·084_d_fix: «['Ma tahan minema poodi.', 'Ma tahan poodi minna.']» → «['Ma tahan minema poodi.', 'Ma tahan poodi minna. | Ma tahan minna poodi.']» — добавлен верный вариант
- 084·practice·084_p_fix: «['Ma tahan rääkima sellest probleemist.', 'Ma tahan sellest probleemist rääkida.']» → «['Ma tahan rääkima sellest probleemist.', 'Ma tahan sellest probleemist rääkida. | Ma tahan rääkida sellest pr…» — добавлен верный вариант
- 084·practice·084_p_fix: «['Inimesed ei pea sõita tööle.', 'Inimesed ei pea tööle sõitma.']» → «['Inimesed ei pea sõita tööle.', 'Inimesed ei pea tööle sõitma. | Inimesed ei pea sõitma tööle.']» — добавлен верный вариант
**ложные ошибки**
- 084·practice·084_p_fix: «['Tööandjad peavad mõtlema sellest ja aitama töötajad.', 'Tööandjad peavad sellele mõtlema ja töötajaid aitama…» → «['Tööandjad peavad mõtlema sellest ja aitama töötajad.', 'Tööandjad peavad sellele mõtlema ja töötajaid aitama…» — mõtlema millestki тоже нормативно — не считается ошибкой, обязательна только правка töötajaid
**нерешаемые**
- 084·discover·084_d_sort: «'Tuleb teha seda kohe kirjutama.'» → «'Seda tuleb kohe kirjutama.'» — «сломанное» предложение заменено реальной ошибкой (tuleb + da)
- 084·discover·084_d_fix: «['Ma ei näinud seda filmi film.', 'Ma ei näinud seda filmi.']» → «['Ma ei näinud seda film.', 'Ma ei näinud seda filmi.']» — нереалистичная ошибка → типичная (объект в отрицании)
- 084·practice·084_p_forms: «['vajama + abi', 'osastav', 'abi']» → «['vajama + tugi', 'osastav', 'tuge']» — ответ совпадал с основой

### b1b2-085
**ключи**
- 085·discover·085_d_fix: «['Seetõttu linn peaks andma maad.', 'Seetõttu peaks linn maad andma.']» → «['Seetõttu linn peaks andma maad.', 'Seetõttu peaks linn maad andma. | Seetõttu peaks linn andma maad.']» — добавлен верный вариант
- 085·discover·085_d_fix: «['Inimesed peavad hoolitseda peenra eest.', 'Inimesed peavad peenra eest hoolitsema.']» → «['Inimesed peavad hoolitseda peenra eest.', 'Inimesed peavad peenra eest hoolitsema. | Inimesed peavad hoolits…» — добавлен верный вариант
- 085·practice·085_p_gram: «'[Kuigi] hilisem algus on kasulik, on sellel vastaseid.'» → «'[Kuigi|Ehkki] hilisem algus on kasulik, on sellel vastaseid.'» — добавлен верный вариант
- 085·practice·085_p_trans: «'Õpilased on väsinud, mistõttu nad õpivad halvemini.'» → «'Õpilased on väsinud, mistõttu nad õpivad halvemini. | Õpilased on väsinud, mistõttu õpivad nad halvemini.'» — единое правило: после mistõttu оба порядка
- 085·transfer·085_t_forms: «['keskenduma + õppimine', 'sisseütlev', 'õppimisse']» → «['keskenduma + õppimine', 'alaleütlev', 'õppimisele, õppimisse']» — норма keskenduma millele (õppimisele); второй вариант тоже принимается
- 085·transfer·085_t_fix: «['Kool peab hoolitsema õpilasi.', 'Kool peab õpilaste eest hoolitsema.']» → «['Kool peab hoolitsema õpilasi.', 'Kool peab õpilaste eest hoolitsema. | Kool peab hoolitsema õpilaste eest.']» — добавлен верный вариант
**эстонский**
- 085·discover·085_d_read: «anda aedadeks kruntide, mida» → «anda aedadeks krunte, mida» — ошибка падежа: krunte (osastav)
**ложные ошибки**
- 085·transfer·085_t_fix: «['Õpilased keskenduvad õppimisele paremini, kui nad magavad.', 'Õpilased keskenduvad paremini õppimisele, kui …» → «['Õpilased keskenduvad paremini õppimist.', 'Õpilased keskenduvad paremini õppimisele. | Õpilased keskenduvad …» — правильное предложение было выдано за ошибку — заменено реальной ошибкой управления
**чтение**
- 085·practice·085_p_read: «['Kui palju und teismelised vajavad?', 'üheksa tundi']» → «['Miks ei pruugi hilisem algus iseenesest unepuudust vähendada?', 'õpilased võivad lihtsalt hiljem magama minn…» — вопрос-копия → вопрос на вывод
- 085·transfer·085_t_read: «['Mis on Jelena tulemus?', '78 protsenti']» → «['Miks oli Jelena näide vennast hea, kuid mitte piisav?', 'muutis teksti elavaks ja usutavaks, kuid ei tõesta …» — вопрос-копия → вопрос на вывод

### b1b2-086
**ключи**
- 086·transfer·086_t_fix: «['Ma räägin täna minu hobi.', 'Täna räägin ma oma hobist.']» → «['Ma räägin täna minu hobi.', 'Täna räägin ma oma hobist. | Ma räägin täna oma hobist.']» — принят вариант без смены порядка
**нерешаемые**
- 086·discover·086_d_gaps: «'Kõige sagedasem viga on [loetelu] (loetelu).'» → «'Viktor esitas oma mõtted [loeteluna] (loetelu).'» — подсказка совпадала с ответом
- 086·transfer·086_t_talk: «B.speaking('086_t_talk', 'Viie minuti kõne.', 'Räägi 3–4 minutit märksõnade järgi. Ära loe teksti maha.'» → «B.speaking('086_t_talk', 'Viie minuti kõne.', 'Räägi 3–4 minutit märksõnade järgi; koos küsimustega kestab kõn…» — заголовок «Viie minuti kõne» противоречил «3–4 minutit» — согласовано
- 086·transfer·086_t_gaps: «'Avalik esinemine on [oskus] (oskus), mida vajame.'» → «'Paljud meist vajavad avaliku esinemise [oskust] (oskus).'» — подсказка совпадала с ответом
**чтение**
- 086·transfer·086_t_read: «['Kuidas suhtutakse eesti keelt teise keelena rääkivatesse?', 'oodatud, keegi ei paranda grammatikat']» → «['Miks sobib „viie minuti kõne” hästi ka kolleegile, kelle emakeel ei ole eesti keel?', 'seltskond on sõbralik…» — вопрос-копия → вопрос на совмещение

### b1b2-087
**ключи**
- 087·practice·087_p_fix: «['Sel juhul ma pakun teine lahendus.', 'Sel juhul pakun ma teise lahenduse.']» → «['Sel juhul ma pakun teine lahendus.', 'Sel juhul pakun ma teise lahenduse. | Sel juhul pakun teise lahenduse.…» — добавлен верный вариант
**ложные ошибки**
- 087·practice·087_p_fix: «['Kas sobib, kui alustaksime hiljem?', 'Kas sobiks, kui alustaksime hiljem?']» → «['Kas sobiks, kui alustama hiljem?', 'Kas sobiks, kui alustaksime hiljem?']» — «Kas sobib, kui alustaksime…» допустимо — заменено реальной ошибкой
**нерешаемые**
- 087·practice·087_p_forms: «['väheneks (vähenema, see)', 'tingiv', 'väheneks']» → «['vähenema (see)', 'tingiv', 'väheneks']» — ответ был дан в основе
**чтение**
- 087·practice·087_p_read: «['Kuidas Maarja kuulamist näitas?', 'võttis kõigi mured kokku']» → «['Miks muutis riigitoetuse info olukorda nii palju?', 'toetus kataks kuni 30% kuludest, kui ka pööning soojust…» — вопрос-копия → вопрос на совмещение
- 087·transfer·087_t_read: «['Miks on vaja varuplaani?', 'halva ilma korral']» → «['Miks ei sobiks Saaremaa ettepanek isegi siis, kui raha jaguks?', 'Tartus elavatele kolleegidele oleks see vä…» — вопрос-копия → вопрос на вывод

### b1b2-088
**нерешаемые**
- 088·meta·canDo: «Ma loen 400–500-sõnalise B2 teksti» → «Ma loen umbes 350-sõnalise B2 teksti» — canDo обещал 400–500 слов, в текстах 353–357
- 088·transfer·088_t_gaps: «'Koosoleku [kokkukutsumine] (kokkukutsumine) on lihtne.'» → «'Koosolekut on lihtne kokku [kutsuda] (kutsuma).'» — подсказка совпадала с ответом
- 088·transfer·088_t_gaps: «'Oluline on [tasakaal] (tasakaal).'» → «'Autor rõhutab [tasakaalu] (tasakaal) tähtsust.'» — подсказка совпадала с ответом
**чтение**
- 088·transfer·088_t_read: «['Mis on koosolekuvaba kolmapäev?', 'päev, mil koosolekuid ei toimu']» → «['Miks on koosoleku kutsujal kerge teiste aega raisata?', 'kokkukutsumine on lihtne ja ta ei maksa ise selle a…» — вопрос-копия → вопрос на вывод

### b1b2-089
**ключи**
- 089·discover·089_d_read: «neli teksti, mille pikkus on kolmsada kuni seitsesada sõna» → «neli teksti, mille pikkus on kakssada viiskümmend kuni kuussada sõna» — факты об экзамене Harno B2 исправлены (тексты 250–600 слов)
- 089·discover·089_d_read: «teine on arutlev tekst umbes sada kaheksakümmend kuni kakssada kakskümmend sõna» → «teine on arutlev tekst umbes sada kaheksakümmend sõna» — Harno: арутлус ~180 слов
- 089·discover·089_d_read: «Iga teksti kuulatakse kaks korda.» → «Enamikku tekste kuulatakse kaks korda, kuid esimese ülesande lühikesi tekste ainult üks kord.» — Harno: первое задание аудирования звучит один раз
- 089·discover·089_d_table: «3–4 teksti, [300–700] sõna» → «3–4 teksti, [250–600] sõna» — согласовано с исправленным текстом
- 089·discover·089_d_table: «kiri ~140 + arutlus [180–220]» → «kiri ~140 + arutlus ~[180]» — согласовано с Harno
- 089·discover·089_d_table: «intervjuud, uudised, [kaks] korda» → «intervjuud, uudised, [üks või kaks] korda» — согласовано с Harno
- 089·discover·089_d_gram: «'[Kuigi] eksam on pikk, on see jõukohane.'» → «'[Kuigi|Ehkki] eksam on pikk, on see jõukohane.'» — добавлен верный вариант
- 089·discover·089_d_fix: «['Seetõttu ma soovin muuta kuupäev.', 'Seetõttu soovin ma kuupäeva muuta.']» → «['Seetõttu ma soovin muuta kuupäev.', 'Seetõttu soovin ma kuupäeva muuta. | Seetõttu soovin ma muuta kuupäeva.…» — добавлен верный вариант
- 089·discover·089_d_fix: «['Ma pean minna haiglasse.', 'Ma pean haiglasse minema.']» → «['Ma pean minna haiglasse.', 'Ma pean haiglasse minema. | Ma pean minema haiglasse.']» — добавлен верный вариант
- 089·discover·089_d_fix: «['Kui on võimalik, ma tahaks tulla esmaspäeval.', 'Kui see on võimalik, tahaksin tulla esmaspäeval.']» → «['Kui on võimalik, ma tahaks tulla esmaspäeval.', 'Kui see on võimalik, tahaksin tulla esmaspäeval. | Kui on v…» — добавлены верные варианты
- 089·discover·089_d_fix: «['Ma ei saa tulla neljapäev.', 'Ma ei saa neljapäeval tulla.']» → «['Ma ei saa tulla neljapäev.', 'Ma ei saa neljapäeval tulla. | Ma ei saa tulla neljapäeval.']» — добавлен верный вариант
- 089·practice·089_p_gram: «'[Kuigi] pilet on tasuta, kasutavad paljud autot.'» → «'[Kuigi|Ehkki] pilet on tasuta, kasutavad paljud autot.'» — добавлен верный вариант
- 089·practice·089_p_trans: «'Tasuta ühistransport kehtestati 2013. aastal.'» → «'Tasuta ühistransport kehtestati 2013. aastal. | 2013. aastal kehtestati tasuta ühistransport. | Tasuta transp…» — добавлены верные варианты
- 089·transfer·089_t_fix: «['Linn peab mõtlema autojuhtidele.', 'Linn peab mõtlema autojuhtide peale.']» → «['Linn peab mõtlema autojuhid.', 'Linn peab mõtlema autojuhtidele. | Linn peab mõtlema autojuhtide peale.']» — нормативное «mõtlema autojuhtidele» было выдано за ошибку (противоречило модулю 17) — заменено реальной ошибкой
**эстонский**
- 089·practice·089_p_speaking: «„Kas linnas elamine on kallim kui väärt?”» → «„Kas linnas elamine on oma hinda väärt?”» — неестественная калька «kallim kui väärt»
**нерешаемые**
- 089·practice·089_p_gram: «'Autoga [sõitmine] (sõitmine) kesklinna võiks olla kallim.'» → «'Autoga kesklinna [sõitmist] (sõitmine) võiks teha kallimaks.'» — подсказка совпадала с ответом
- 089·practice·089_p_gram: «'Harjumaa elanikud peavad pileti eest [maksma] (maksma).'» → «'Harjumaa elanikud peavad pileti eest [maksma] (maksta).'» — подсказка совпадала с ответом — дана da-форма

### b1b2-090
**ключи**
- 090·discover·090_d_gram: «'[Kuigi] kursus lõpeb, jätkan õppimist.'» → «'[Kuigi|Ehkki] kursus lõpeb, jätkan õppimist.'» — добавлен верный вариант
- 090·practice·090_p_fix: «['Mul on vaja harjutama rääkimist.', 'Mul on vaja rääkimist harjutada.']» → «['Mul on vaja harjutama rääkimist.', 'Mul on vaja rääkimist harjutada. | Mul on vaja harjutada rääkimist.']» — добавлен верный вариант
- 090·practice·090_p_fix: «['Kui inimest oodatakse, ta õpiks meelsamini.', 'Kui inimest oodataks, õpiks ta meelsamini.']» → «['Kui inimest oodatakse, ta õpiks meelsamini.', 'Kui inimest oodataks, õpiks ta meelsamini. | Kui inimest ooda…» — принят второй верный вариант (оба глагола в изъявительном)
**эстонский**
- 090·discover·090_d_gram: «'Kui keelt ei [kasutata] (kasutama, umbisikuline), see ununeb.'» → «'Kui keelt ei [kasutata] (kasutama, umbisikuline), siis see ununeb.'» — основа сама нарушала правило курса о порядке после придаточного
**нерешаемые**
- 090·discover·090_d_gram: «'Eestikeelsete seriaalide [vaatamine] (vaatamine) aitab kuulata.'» → «'Eestikeelseid seriaale [vaadates] (vaatama, -des) harjutan kuulamist.'» — подсказка совпадала с ответом
- 090·discover·090_d_gram: «'Keel on [vahend] (vahend), mitte eksam.'» → «'Keelt tuleb näha [vahendina] (vahend), mitte eksamina.'» — подсказка совпадала с ответом
- 090·practice·090_p_fix: «['Eesti on mitmekeelne riik, kuigi riigikeel on ainult üks on.', 'Eesti on mitmekeelne riik, kuigi riigikeel o…» → «['Kuigi riigikeel on ainult üks, Eesti on mitmekeelne riik.', 'Kuigi riigikeel on ainult üks, on Eesti mitmeke…» — «сломанная» строка заменена типичной ошибкой порядка
**чтение**
- 090·practice·090_p_read: «['Kui suur osa Eesti elanikest räägib emakeelena muud keelt?', 'ligi kolmandik']» → «['Miks ei tähenda eesti keele õppimine koolis veel, et inimene seda kasutab?', 'kui igapäevaselt ei ole võimal…» — вопрос-копия → вопрос на вывод

## Не исправлено (нужна переработка, не локальная правка)

- **Длина текстов.** Все чтения 300–373 слова, средняя длина предложения 11–13 слов (профиль B1). Текста на 500–600 слов (Harno B2 Lugemine 1) нет ни одного. Я исправил только ложные обещания: заголовки и canDo 075, 080, 088 («400–500 слов») приведены к реальной длине. Удлинять тексты не стал: это новое содержание, а не правка.
- **Форматов Harno B2 нет.** Нет MC-вопросов к длинному тексту, утверждений к абзацам, cloze с 4 вариантами, вставки предложений с лишним. Для 065, 070, 075, 080, 085, 089, 090 нужны новые блоки (тип `cloze` уже есть в blocks.js). Это меняет состав блоков, а правила разрешают только точечные правки.
- **Аудирование.** В модуле 18 его нет совсем, а 089 «Täismahus B2 simulatsioon» без аудирования неполная. Остальные блоки аудирования — тексты по 65–96 слов, `audio: null`.
- **089/090 как пробный экзамен.** Монолог 3 минуты вместо Harno «1 мин после 2 мин подготовки», нет карточек аргументов A/B. «Keeleosa» в Harno отсутствует. 090 — самооценка без измеримой части. В 089 исправлены только факты в «Eksami kaart» (250–600 слов, арутлус ~180, первое аудирование один раз) и калька «kallim kui väärt».
- **Грамматическая ось модулей 13–14 ниже B2.** 062 — союзы причины (B1+), 068 — peab/tuleb/võib + ma/da (A2). Нужны задания на номинализацию, lauselühendid и регистр долженствования («on kohustatud», «tuleb tagada», «Rikkumise korral…»). Это новые блоки.
- **077 (инверсия V2) — уровень B1.** Я смягчил категоризацию («Kirjakeeles õige / Viga või kõnekeelne»), но перевести урок на порядок слов по информационной структуре — это переработка.
- **Полуофициальное письмо ~140 слов с выбором регистра (Harno Kirjutamine 1)** в модуле 17 не появилось. Письма в основном официальные, нужен новый блок в 082 или 085.
- **Открытые «rewrite»-задания в блоке errorfix** («Kirjuta lause B2 tasemel ümber», 064_p_fix, 081_p_fix, 083_p_fix, 086_d_fix и т. п.). Ответы там свободные, и автопроверка примет только эталон. Лучше перенести их в задание с ручной проверкой («Tee konkreetsemaks»), но для этого нужно менять тип блока.
- **Переводы и диктанты на контрольных листах** (формат B1) оставлены как есть.
- Канон `mistõttu` в лексиконе и генераторе я не проверял: эти файлы вне моей зоны.

## Проверки

- `npx eslint module13.js … module18.js` — без ошибок.
- `npx vitest run src/features/worksheet-generator` — Test Files: 1 failed | 47 passed (48); Tests: 16 failed | 530 passed | 1 skipped (547). Все 16 падений — в `course.test.js` (сравнение с baseline). По моим модулям:
  - b1b2-module-13, 16, 17, 18 — проходят;
  - b1b2-module-14 и 15 падают только на списке `fixed`: `b1b2-067|practice|did-choice-length-067_p_choice`, `b1b2-067|practice|didactic`, `b1b2-073|practice|did-choice-length-073_p_choice`, `b1b2-073|practice|didactic`. Это ИСПРАВЛЕННЫЕ проблемы (правильный ответ больше не выделяется длиной), baseline нужно перегенерировать;
  - новых проблем (`fresh`) в модулях 13–18 нет.
  
  Остальные 14 падений — в чужих модулях (b1b2-02, 05, 07, 09, est-c1-01…10), которые параллельно правят другие агенты. Тесты avastaModule проходят.
- Ничего не коммитилось, в базу данных ничего не записывалось.
