# Исправления B1, модули 12–15 (a2b1-056…075) — исполнитель D

Файлы (только они): `crm-v2/src/features/worksheet-generator/admin/course/b1/module12.js`, `module13.js`, `module14.js`, `module15.js` в /Users/pavel/keelesepp-b1.
Без коммита и без записи в базу данных. id, порядок и типы блоков, `goal` и структура уроков не менялись.

## Главное решение: одно правило порядка слов на все 4 модуля

После `sellepärast / seetõttu / kahjuks / näiteks / esiteks / teiseks / seejärel / lõpuks / kui-lause`:
- если подлежащее — **местоимение** (`ma, me, ta…`), оба порядка допустимы («Sadas, sellepärast me jäime koju» = «… jäime me koju»). Такие предложения **больше нигде не считаются ошибкой**.
- если подлежащее — **существительное**, нормой остаётся V2 («Oli torm, seetõttu **oli kool** suletud»). Только такие предложения оставлены в «Paranda sõnajärg».
- `esiteks / teiseks` порядок вообще не проверяется: в письменной речи нормально «Esiteks, see on odavam».
- Правило так и записано в notice-блоках 058, 068, 073 («tavaliselt teisel kohal; asesõnaga võib ka …»). Образцы в текстах приведены к V2 с существительным.
- В 071 «saab minna / saame sõita» («смогу») больше не ошибка. Ошибкой считается только «saan minema / olen sõitma» в значении будущего. Notice 071 исправлен.

## Изменения по урокам

Формат: урок · блок: было → стало (почему).

### a2b1-056
- чтение · 056_d_read: «Mis on kolmapäeva hommikul? [udu]» → «Miks peavad autojuhid … ettevaatlikud olema?» (варианты); «Mis juhtub laupäeval?» → «Mis päeval on kõige soojem?» (надо сравнить дни)
- ключи · 056_d_gaps: «Homme läheb [soojemaks|külmemaks]»
- ключи · 056_p_read: добавлены варианты «suusatavad või uisutavad», «palju vihma ja on pime»
- чтение · 056_p_read: «Mis on juunis? [valged ööd]» → «Mitu tundi on detsembris valge? [seitse]» (9→16, надо посчитать)
- чтение · 056_t_read: «Mitu kraadi on laupäeva hommikul?» → «Mitu kraadi läheb hommikust lõunani soojemaks? [viis]»
- угадываемые · 056_t_check: «Matkame öösel», «suusad», «päikeseprillid ainult», «Ronime puu otsa» → правдоподобные (kell kaks, talvejope, rannalina, Seisame suure puu all)
- ключи · 056_tx_gaps: варианты äike|vihma|vihmahooge, kuiv|päikeseline, vihmajope|vahetusriided
- ложные ошибки · 056_tx_fix: «Laupäeval tuleb vihm kell kolm» (правильно) → «… kella kolm paiku» → «kella kolme paiku»
### a2b1-057
- чтение · 057_d_read: «Kuhu Liis sõitis? [Soomaale]» → «Kas Liis oli varem rabas käinud? [ei]» (вывод из «esimest korda»); «Mida oli rabas kuulda?» → «Kas Liisile matk meeldis? Kust sa seda tead?»
- ключи · 057_d_read «Miks laudteel» + «sest raba on märg»; 057_d_fix «Ta tuli tagasi rannast» добавлен как вариант
- ключи · 057_p_read: варианты для «tuleoht», «ühe öö»
- чтение · 057_p_read: «Miks on see hea puhkus? [tasuta ja tervislik]» → «Mida peab tegema, kui tahad telkida kellegi teise maal? [küsida omaniku luba]»
- нерешаемые · 057_p_gaps: «ühe [öö] (öö)» (ответ в подсказке) → «[ühe] (üks) öö»
- ложные ошибки · 057_p_fix: «igas kohas / Prügi jäta metsa / terve kuu» (исправление смысла, не языка) → «lõkkeplatsile→lõkkeplatsil», «kaasa võtma→võtta», «seened ja marjad→seeni ja marju»; + вариант «tagasi järvest»
- ключи/чтение · 057_t_read: «ka lastele|lastele», «inimesi on vähem»; «Kuidas saab Keila joale?» → «Kumba kohta saab minna ilma autota? [Keila joale]» (сравнить два текста)
- ложные ошибки · 057_tx_fix: «Pargis saab jalutada üks tund» (правильно) → «vana mõisa → vana mõis»; «Rabas saab bussiga → Rabasse ei saa» (менялся смысл) → «Rabas ei saa bussiga → Rabasse ei saa bussiga»
- нерешаемые · 057_tx_trans: «Seal on palju inimesi suvel» + ответ с новым содержанием → исходник дан двумя предложениями из текста
### a2b1-058 (правило порядка слов)
- ложные ошибки/единое правило · 058_d_notice: «tegusõna teisel kohal» → «tavaliselt teisel kohal; asesõnaga võib ka: … sellepärast me jäime koju»
- ложные ошибки · 058_p_fix: убраны 3 строки, где порядок с местоимением допустим («sellepärast me jäime koju», «me ei läinud», «meil oli pime») → строки с существительным-подлежащим (bussid jäid → jäid bussid; laevad jäid → jäid laevad; toad olid → olid toad)
- ложные ошибки · 058_tx_fix: то же, 4 строки с «me/ma» → külmkapp, autod, naaber, päästjad (V2 с существительным)
- эстонский/единообразие · образцы приведены к V2: 058_d_trans (jäime me, külmetas ta), 058_d_order (ei läinud me), 058_p_join (kukkusin ma), 058_p_read текст + 058_p_order («sellepärast ei helisenud äratuskell»), 058_t_dialog («sellepärast ei sõitnud bussid»)
- ключи · 058_d_gaps: заголовок «sest või sellepärast?», а ключ «seetõttu» — заголовок/инструкция называют все три слова; добавлены варианты sellepärast|seetõttu (банк не добавлен: проверка конструктора не принимает банк союзов на A2+)
- чтение · 058_d_read: «Kui kaua parandati liine?» → «Miks ei saanud inimesed süüa teha?» (pliit/elekter); варианты «kliimamuutus»
- чтение · 058_p_read: «Mida Ahmed õhtul ostis?» → «Miks ei sõltu Ahmed enam elektrist?»; вариант «paljud töötajad hilinesid»
- чтение · 058_t_read: «Mis kell elekter kadus?» → «Kumb oli tormi ajal kodus, Marina või Peeter?»; варианты к «taskulamp»
- нерешаемые · 058_tx_cross: подсказка «„selle pärast” koos» выдавала ответ → «sama mis „seetõttu”»
### a2b1-059
- чтение · 059_d_read: «Mis oli kõige raskem? [kohvi juua]» → «Miks oli isal kõige raskem?»; «Kui palju väiksem oli prügikott?» → «Kuidas pere nüüd raha säästab? [ostab vähem asju]»
- угадываемые · 059_d_choice: «põleta ära», «ainult mullivesi» → «jäta kappi seisma», «poest ostetud mullivesi»
- ложные ошибки · 059_d_fix: «sest et see on → sest konteinerid on kodu lähedal» и «kilekotid on hea → halvad» (правился смысл) → «kodu lähedalt → lähedal», «kilekotid on halb → halvad» (согласование); «Näiteks ma võtan… koti» принят как вариант
- ключи/чтение · 059_p_read: варианты к Kristjan/Martin; «Kui kaua Kristjan ootas?» → «Milles on kõik kolm nõus?» (главная мысль); «Mis on Martinil talvel?» (кривой вопрос) → «Mida Martin talvel teeb?»
- нерешаемые · 059_p_trans: «Ratas on tervislik. + sest → Ratas on hea, sest…» («hea» не из чего взять) → исходник «Ratas on hea. See on tervislik.»; + вариант «Näiteks ma sõidan bussiga.»
- эстонский · 059_px_dialog: «me oleme mõlemad õiged» → «meil mõlemal on õigus»
- ложные ошибки · 059_px_fix: «Näiteks ma sõidan rattaga» (правильно) → «Näiteks ma sõidan rattas → rattaga»
- чтение · 059_t_read: «Mis on majas probleem? [palju prügi]» → «Miks on rattad trepikojas probleem?»; «Mis on esimene ettepanek?» → «Mida teha, kui ei saa koosolekule tulla?»; варианты даты
- эстонский+угадываемые · 059_t_check: «vähe ratturid» → «vähe rattureid»; абсурдные варианты («Mulle meeldib sinine värv», «Naaber käskis», «Ma ei tea», «Kunagi», «Trepikojas öösel») → слабые, но правдоподобные аргументы; правильный вариант укорочен
- ключи · 059_tx_fix: вариант «Näiteks me viskame palju toitu ära.»
### a2b1-060
- чтение · 060_d_read: «Mida linn ehitas?» → «Kas kauplejate hirm läks tõeks? [ei / kliente tuli rohkem]»
- нерешаемые · 060_d_gaps: «[tõusma] (tõusma)» → «Mul on vaja homme vara [tõusta] (tõusma)»
- ложные ошибки/ключи · 060_d_fix: «Sadas, sellepärast me jäime koju» (допустимо) → «… matk jäi ära → jäi matk ära»; варианты порядка для «Eile läksin…», «Ma tahan õppida eesti keelt»
- нерешаемые · 060_p_mix: заголовок «Kümme punkti» при 8 пропусках → «Kaheksa punkti»; «[maksma] (maksma)» → «Arve tuleb homme [maksta]»; «(soe)» → «(soe, ülivõrre)», + «soojeim»
- ложные ошибки · 060_p_fix: «Kuna oli külm, me jäime koju» (допустимо) → «lapsed jäid → jäid lapsed»
- чтение · 060_p_read: «Mida Olga tegi oma keelega?» (кривой вопрос) → «Mida Olga tegi, et eesti keelt paremini osata?»; «Mida ta sügisel ostis?» → «Mis tööd tahab Olga tulevikus teha?»
- угадываемые · 060_p_check: «broneeringuid / ehitab maju / müüb riideid» (разные формы) → «teeb broneeringuid / müüb riideid / koristab tube»
- чтение · 060_t_read: «Mida linn teeb ettepanekuks?» → «Mis on linna ettepanek?»; «Mis kellani…? [kuueni]» → «Mitu tundi oleks kesklinn autovaba? [kaheksa]»; «Kus saab hääletada ja kui kaua?»
- угадываемые · 060_t_tf: «Kõik elanikud olid rahul» (kõik) → «Taksojuhid teenisid rohkem raha»
- ключи · 060_tx_trans: вариант «Eile ma hääletasin.»
- угадываемые · 060_tx_gaps: добавлен банк слов с 2 лишними (kuigi, teenisid)
### a2b1-061
- чтение · 061_d_read: «Mida Liis küsis?» → «Mitu korda ütles Markus „ei”?»; «Mida Markus pakkus?» → «Millal hoiab Markus Liisi lapsi? [teisipäeval]» (pakkus + Liis oli nõus)
- эстонский/угадываемые · 061_d_gaps: «Aitäh, [meeleldi]!» (неестественно) → «[Meeleldi], ma aitan sind!»; банк слов + 2 лишних
- ключи · 061_d_trans: «Palun anna mulle sool» как вариант (глагола ulatama в задании нет)
- ключи/чтение · 061_p_read: варианты к Peeter/Anna; «Millal on koristuspäev?» → «Kes ei tule laupäeval koristama? [Olga ja Anna]»
- ложные ошибки · 061_p_fix: «Kahjuks ma ei saa tulla sest…» → «Kahjuks ei saa ma…» (порядок после kahjuks — не ошибка) → «Kahjuks ma ei saa homme tulema → tulla» (оба порядка приняты); «Võib-olla teine kord» принят
- ключи · 061_px_trans: вариант «Kahjuks on mul endal autot vaja»
- эстонский · 061_t_read: «tahaksid, et ma mängin» → «et ma mängiksin»
- чтение · 061_t_read: «Kus on Jaan? [Tartus]» → «Mis päev sobib kõige rohkematele sõpradele? [reede]» (надо посчитать)
- угадываемые · 061_t_check: абсурдные ответы («Siis ma ei räägi sinuga», «Ära tule», «Too kaks», «Hea, et ei tule») → правдоподобные, но невежливые/неуместные реакции
- ключи · 061_tx_gaps: sobiks|sobib, võin|saan|võiksin
- ложные ошибки · 061_tx_fix: «Kas laupäev sobib sinule?» (правильно) → «sobib sind → sulle»; «Kahjuks ma ei saa tulla» принят как вариант; варианты порядка «tordi tuua / tuua tordi»
### a2b1-062
- ключи · 062_d_read: варианты «avada uus konto / konto avada», «raamatut eesti keele grammatikast»
- чтение · 062_d_read: «Millega tahtis ta maksta?» → «Miks olid Anna arvates inimesed sõbralikud? [ta oli ise viisakas]» (главная мысль)
- угадываемые · 062_d_choice: «Konto!», «Tee kohe!», «Andke aeg!» → пары изъявительное/повелительное к тем же глаголам («Ma tahan teed», «Kas teil on homme aega?», «Kas ma võin…»); заодно убрано неверное «Kas teil on aeg?»
- ложные ошибки · 062_d_fix: «See olekski tore» (правильная форма oleks+ki) → «See olema tore → oleks»
- ключи/чтение · 062_p_read: «kaheks ööks», «restorani»; «Mis kell on äratus?» → «Kui palju maksab kogu peatus? [180 eurot]» (2 × 90)
- ложные ошибки/эстонский · 062_p_fix: бессвязное «kas see maksaks palju on?» (две ошибки, ответ из двух предложений) → «Kui palju see maksaksin? → maksaks»; «See olekski hea» (правильно) → «Kas te saaksid… → saaksite»
- чтение · 062_t_read: «Kui suur on ettemaks?» → «Kui palju maksaksid kümne inimese menüü ja tort kokku? [400]»
- эстонский · 062_t_rubric «neli tingiva vormi» → «neli tingiva kõneviisi vormi»; 062_t_roles «Kahjuks reede on täis» → «Kahjuks on reede juba täis»; 062_tx_dict «Kas oleks võimalik kala?» → «… kala saada?»
- ключи · 062_tx_trans: варианты «tellida tordi», «Laupäev sobiks.» (без meile)
### a2b1-063
- чтение · 063_d_read: «Mis on probleem?» → «Miks on Viktor väga väsinud?» (связать две причины); варианты к «kõrvaklappidega», «kompromiss»
- нерешаемые · 063_d_match: «Võiksime kokku leppida» (lahendus) и «Kuidas oleks, kui…» (ettepanek) — по notice это один шаг 4, сопоставление неоднозначно → пара заменена на «Oi, vabandust, ma ei teadnud. — vabandus»
- угадываемые · 063_d_gaps: банк слов + 2 лишних
- нерешаемые · 063_d_trans: «Sa oled liiga vali! → … muusika on vali» и «Lõpeta! → … vaiksemalt mängida» (слов нет в исходнике) → «Sinu muusika on liiga vali!», «Mängi vaiksemalt!»
- эстонский · 063_p_match «ei koristat» → «ei korista»; 063_p_roles «ei koristata» → «ei korista»
- нерешаемые · 063_p_gaps: «[oluline] (oluline)» (ответ в подсказке) → «…, et köök [oleks|on] (olema) puhas»
- чтение · 063_p_read: «Kus nad õpivad? [ülikoolis]» → «Mitu päeva nädalas koristab Maria üksi? [kolm]»; варианты
- угадываемые · 063_p_choice: правильный ответ был вдвое длиннее, дистракторы-абсурд («Ma lahkun töölt», «Ma helistan politseisse») → одинаковой длины: вежливая просьба с tingiv против приказа/упрёка
- чтение · 063_t_read: «Millal tähistab Svetlana pere jõule?» → «Miks saab Svetlana jõululaupäeval töötada?»; варианты дат
- ключи · 063_tx_gaps: tahaksin|tahan|sooviksin, võiksin|saaksin|võin
- ключи · 063_tx_fix: строки без запятой в ответе («Ma saan sinust aru.»), «töötab jõulud» → «Svetlana võiks töötada jõuludel / jõulude ajal»
### a2b1-064
- эстонский · 064_d_read: вопрос «Mis sõita rongi asemel?» (ошибка) → заменён на «Mida arvas naine Natalja eesti keelest?»; «Millega Natalja sõita tahtis?» → «Kuidas Natalja lõpuks Tartusse sõitis? [bussiga]»; варианты к «korrata»
- угадываемые · 064_d_choice: «Räägi vene keeles!», «Ma lähen ära.», «Nojah.», «Kõik on halb» → варианты той же фразы с языковой ошибкой (saaksid/saaksite, aeglaselt rohkem/aeglasemalt, mis/millega, õige/õigesti, teist võimalust); инструкция «Vali õige lause.»
- ложные ошибки · 064_d_fix: «Kas ma saan õigesti aru? → sain» (обе формы допустимы) → «Mida tähendab see sõnat? → sõna»; вариант порядка «rääkida aeglasemalt»
- чтение · 064_p_read: «Mis kell oli Igori aeg?» → «Mitu tundi pidi Igor teist arsti ootama? [kolm]» (3 → 6); варианты «ta ei saanud aru»
- ключи · 064_p_fix: варианты «Kas on teine arst?», «Ma pean uuesti maksma?»
- чтение · 064_t_read: «Mis juhtus köögis?» → «Miks ei saa kohvik homme sooja toitu pakkuda?»; варианты к «esimene võimalus»
- угадываемые · 064_t_check: «mitte midagi», «kaob», «tulla öösel», «kirjutada lehte» → правдоподобные (ainult külma lauda / tagastatakse pooleldi / jääb kohvikule); вопрос «Kuidas küsida lisa?» → «Mida saab iga külaline tasuta? [kohvi]»
- ключи · 064_tx_trans: варианты «võiksite korrata», «Palun rääkige aeglasemalt», «teise kohviku»
### a2b1-065
- чтение · 065_d_read: «Mida juhataja palus?» → «Millal Peeter esitluse teeb? [esmaspäeval]» (договорённость, а не просьба); варианты
- эстонский · 065_d_gaps «Kas [oleks] võimalik soodustust?» → «… soodustust saada?»; то же в 065_d_dict
- ложные ошибки · 065_d_fix: «Kahjuks ma ei saa tulla sest…» → «Kahjuks ei saa ma…» (порядок не ошибка) → «Kas esitlus võiksin olla…? → võiks»; вариант «soodustust saada»
- нерешаемые · 065_p_mix: «Kümme punkti» при 8 пропусках → «Kaheksa punkti»
- ложные ошибки · 065_p_fix: строка с запятой и двумя частями → «Võib-olla mõni teine korda → kord»
- эстонский · 065_p_read: «Kas te saaksite mul aidata» → «mind aidata»; 065_px_order «saaksite mul diivanit tõsta aidata» → «saaksite mind diivani tõstmisel aidata»; «leppisime kokku pehmete susside osas» (калька) → «leppisime kokku, et kannan pehmeid susse»
- чтение · 065_p_read: «Mida Elena naabrilt palus?» → «Miks kõnnib Elena alles hilja õhtul? [tuleb töölt kell üheksa]»; варианты
- чтение · 065_t_read: «Mis kellani on lasteaed avatud?» → «Mitu tundi lühem on nüüd lasteaia päev? [ühe tunni]»; вариант «kirjalik luba»
- эстонский/логика · 065_t_roles: «Õpetaja keeldub» при роли «lasteaia juhataja» → «Juhataja keeldub»
- эстонский · 065_tx_gaps «Kas oleks võimalik pikem valverühm?» → «… valverühma pikendada?»; 065_tx_order «Kas oleks võimalik valverühm iga päev?» → «Kas valverühm võiks olla iga päev?»
- ложные ошибки/нерешаемые · 065_tx_fix: «… valverühm iga päev olema? → Kas valverühm võiks olla…» (ответ — другая конструкция) → «võiks olema → võiks olla»; «Kahjuks ma ei saa… sest töötan → Kahjuks ei saa ma…» → «ei saa kell kuus tulema → tulla» (оба порядка); «Ma sooviks registreerida» → с дополнением «last»
### a2b1-066
- эстонский/единое правило · 066_d_read «viimasel hetkel kala hüppas» → «viimasel hetkel hüppas kala» (V2 с существительным, как в errorfix этого же листа); то же в 066_d_dict
- чтение · 066_d_read: «Mis kell Jaan ärkas?» → «Kas mehed olid kurvad, et suur kala ära läks? [ei / nad naersid]» (вывод)
- ключи · 066_d_fix: принят «Õhtul nad tegid lõkke» (ошибка — время, не порядок)
- ключи/чтение · 066_p_read: варианты; «Kes teda aitas? [üks naine]» → «Kuidas jõudis jutustaja Olegi juurde? [taksoga]»
- угадываемые · 066_p_choice: «Ilm oli.», «Oli ilm halb ilm.», «Ma olin.», «Tunne oli.», «Lõpp.» (не предложения) → нормальные короткие предложения против развёрнутого
- ложные ошибки · 066_p_fix: строка «närvis sest … ei oska» (две ошибки, запятая) → «Ma ei oska tol ajal eesti keelt → ei osanud»; вариант «Kaheksa aastat tagasi ma tulin…»
- эстонский · 066_px_order «näitas mulle teed taksoni» → «teed taksopeatusesse»
- нерешаемые · 066_px_trans: «Ma olin närvis. + sest → … ei osanud keelt» (нового содержания нет в задании) → исходник «Ma olin närvis. Ma ei osanud keelt.»; «Sõber ootas → mind kuuma supiga» → исходник «Sõber ootas mind.» + варианты; варианты порядка
- чтение · 066_t_read: «Kuhu Helena pere sõitis?» → «Miks olid võileivad märjad?»
- ложные ошибки · 066_tx_fix: «Me sõime maasikad elutoas» (правильно: съели все) → «laotasime tekk → teki»; «See oli parim piknik kunagi oli» (бессвязно) → «kõige parim → kõige parem / parim»; вариант «Eelmisel suvel me plaanisime»
### a2b1-067
- ключи · 067_d_read: «Kus ei ole ta veel käinud? [Aafrikas]» — в тексте также «ei ole kunagi Jaapanis käinud» → добавлен Jaapanis
- чтение · 067_d_read: «Mis juhtus Tais?» → «Miks oli Mari Tais hirmul?»
- угадываемые · 067_d_choice: варианты «ei käinud … eile», «nägin … homme», «näen … eile» угадывались по слову времени → варианты, отличающиеся формой (ei olen / käima / on … näinud / nägenud / oleme / nägin)
- ложные ошибки · 067_d_fix: «Ma ei olnud veel Jaapanis käinud» (правильный давнопрошедший) → «… käima → käinud»; «ei ole käinud kunagi Aafrikas» (порядок допустим) → «Ma ei olen kunagi… → ei ole»; варианты порядка «Ma käisin eile Tartus»
- чтение/ключи · 067_p_read: «Mis Igoril kadus?» → «Kas Igor sai oma rahakoti tagasi? [jah]» (вывод); варианты «saunalava», «talisupelda»
- ложные ошибки/ключи · 067_p_fix: «oled kaotanud kunagi midagi» (порядок допустим) → «Kas sa oli… → oled»; принят «kuulsa inimesega kohtunud» (исходное предложение с kohtuma); варианты порядка «Möödunud kuul lendasin…»
- чтение · 067_t_read: «Mitmest riigist?» → «Mis juhtub pärast ankeedi saatmist? [vestlus]»
- ключи · 067_tx_trans: варианты порядка слов для всех 4 строк
### a2b1-068
- единое правило · 068_d_notice: «tegusõna teisel kohal» → «tavaliselt; asesõnaga võib ka»
- ложные ошибки · 068_p_fix: 3 строки с местоимением («Seejärel ta liitus», «Samal ajal ta sõi», «Alguses ta jooksis») → строки с существительным-подлежащим (Sofia, inimesed)
- ложные ошибки · 068_tx_fix: «Seejärel ma läksin», «Lõpuks ma tegin» (допустимо) → «Aasta hiljem minu töökoht muutus → muutus minu töökoht», «Pärast seda kõik läks → läks kõik»; варианты «Alguses ma ei osanud», «Esimesel korral kukkusin ma läbi»
- чтение · 068_d_read: «Kust kuhu pere kolis?» → «Miks pere hiljem naeris?»; варианты
- ключи · 068_d_gaps / 068_tx_gaps: «Pärast seda|Seejärel|Siis», «Hiljem|Seejärel|Siis» (несколько связок верны); 068_d_trans: варианты с «me» и порядком
- чтение · 068_p_read: «Millal Sofia hakkas jooksma?» → «Kas Sofia tahtis maratoni ajal alla anda? [jah]»
- чтение · 068_t_read: «Millal jutustaja Eestisse tuli?» → «Mitu korda tegi jutustaja A2 eksamit? [kaks]»
### a2b1-069
- чтение · 069_d_read: «Kes kutsus ta talisuplema?» → «Kas jutustaja käib praegu talisuplemas? [jah]»; варианты к «tundis pärast», «elu on lühike»
- угадываемые · 069_d_choice: «üllatunud rõõmust» (не форма-чувство) → «õnnelik»
- нерешаемые · 069_d_trans: «Ma karjusin + sest → vesi oli nii külm», «Me jõime teed → kuuma teed» (содержания нет в задании) → исходник «Ma karjusin. Vesi oli külm.»; варианты без «väga/kuuma»
- ложные ошибки · 069_d_fix: «Ma õppisin et…» (только запятая, автопроверка не различает) → «Ma olen õppisin palju → olen palju õppinud»; вариант «Eelmisel jaanuaril ma läksin»
- чтение/ключи · 069_p_read: «Millal see juhtus?» → «Kui kaua ootas jutustaja abi? [pool tundi]»; варианты к «hirmul», «Kes peatus?», «Mida mees palus?»
- чтение · 069_t_read: «Mis on võistluse teema?» (копия заголовка) → «Kas lugu võib kirjutada keelevigadega? [jah]»; варианты
- угадываемые · 069_t_check: правильный вариант был длиннее остальных («ei, lugu peab olema tõeline» / «ainult naljakas») → варианты одной длины
### a2b1-070
- эстонский · 070_d_read: «Mille üle on Viktor unistanud?» → «Millest on Viktor alati unistanud?» (unistama millest); 070_d_dict «unistanud õpetajaks saada» → «õpetajaks saamisest» (как в тексте)
- чтение · 070_d_read: «Millega ta kooli sõitis?» → «Kuidas Viktori esimene tund läks?»; варианты
- ложные ошибки · 070_d_fix: «Seejärel ta sõitis kooli» (допустимо) → «Seejärel Viktor sõitis → sõitis Viktor»; варианты порядка
- нерешаемые · 070_p_mix: «Kümme punkti» при 8 пропусках → «Kaheksa punkti»
- ложные ошибки · 070_p_fix: «Lõpuks me jõudsime koju» (допустимо) → «Lõpuks meie grupp jõudis → jõudis meie grupp»; варианты «mägedesse läinud», порядок
- чтение/ключи · 070_p_read: «Kus on jutustaja käinud?» → «Mitu korda on jutustaja Norras käinud? [üks kord]»; ключ «telk ja soe riietus; mõnikord…» (через «;» — не засчитывался) → варианты через «|»
- ключи · 070_t_read: «kahtekümmet» (ошибка) → «kahtkümmend|kakskümmend|20»; «Millal raamat ilmub?» → «Mida saab teha, kui ei taha lugu kirjutada? [kohtuda ja rääkida]»
- нерешаемые · 070_tx_trans: «Ma ei ole rabas. (kunagi) → … rabas käinud» → исходник «Ma ei käi rabas.»; варианты порядка слов
### a2b1-071
- ложные ошибки · 071_d_fix / 071_p_fix / 071_tx_fix: «Homme ma saan minna tööle», «Tütar saab minna kooli…», «Laupäeval me saame sõita…» (правильно: «смогу») → настоящая ошибка «saan minema / saab minema / saame sõitma»; приняты оба порядка слов с местоимением
- единое правило · 071_d_notice: «Tulevikku ei näita „saama” ega „olema”» → «… + ma-vorm (vale: saan minema, olen sõitma)» — чтобы не запрещать «saan minna»
- ложные ошибки · 071_d_fix: «hakkab käima kooli septembrist alates» (спорно) → «hakkab septembrist koolis käia → käima»
- эстонский · 071_d_read: «Millest hakkab Anna kursusel käima?» → «Mis ajast…?»
- чтение · 071_d_read: «Kuhu Anna esmaspäeval läheb?» → «Mis päeval on Annal kõige rohkem aega kodu jaoks? [reedel]»
- нерешаемые · 071_d_gaps: «[käima] (käima)» (ответ в подсказке) → «Septembrist [hakkan] (hakkama) ma kursusel käima»
- уровень · 071_d_forms: чистое спряжение hakkama (A1) → hakkama + ma-vorm («hakkama + ujuma, mina → hakkan ujuma»)
- ключи · 071_p_trans, 071_p_fix: варианты порядка слов
- чтение · 071_p_read: «Kus hakkab Viktor tööle?» → «Miks kolib Viktor Tartusse?»; варианты «rattaga», «uus elu on rahulikum»
- чтение · 071_t_read: «Kus ta ööbib?» → «Mitu ööd on Mariia Tallinnas? [kolm]»; варианты
- угадываемые · 071_t_check: «Magame kogu päeva», «Istume hotellis», «Ei söö midagi», «Läheme tööle» → реальные пункты программы не в то время; правильные варианты укорочены
### a2b1-072
- чтение/ключи · 072_d_read: «Kuhu ta soovib suvel minna?» → «Kas Oleg on varem poolmaratoni jooksnud? [ei]»; варианты к трём ответам
- нерешаемые · 072_d_sort: «Ma tahan olla tervem.» в группе «Põhjus» — это скорее цель → «Ma treenin, sest tahan olla tervem.»
- ключи · 072_d_trans: варианты «Minu eesmärk on teha eksam», «Ma loodan saada töö»
- ложные ошибки · 072_d_fix: «Selleks ma käin kursusel» (допустимо) → «Selleks Oleg käib → käib Oleg»; «Ma loodan saan eksami → … eksami tehtud» (в ответе было лишнее слово) → исходник с «tehtud»
- нерешаемые · 072_d_cross: подсказка «ma loodan → lootma» выдавала ответ → определение «ootan ja usun, et tuleb midagi head»
- чтение · 072_p_read: «Mis toimub igal aastal?» → «Miks tahab Kati vähem ületunde teha?»; варианты
- ключи · 072_p_gaps: plaanin|soovin|tahan, tähtis|oluline|vajalik
- ложные ошибки · 072_p_fix: «Selleks ma soovin koolitusele → … minna» (не хватало слова, порядок) → «Selleks soovin ma koolitusele minema → minna»; «Ma loodan et…» (только запятая) → «Ma loodan saama koha → saada»
- эстонский · 072_px_cross: «mis tahan saavutada» → «mida tahan saavutada»; «meeskonna juht → meeskonnajuht» (ответ в подсказке) → «inimene, kes juhib meeskonda»
- чтение · 072_t_read: «Mitu stipendiumi antakse?» → «Kas võid kandideerida, kui oled õppinud kolm kuud? [ei]»
- ключи · 072_tx_trans: варианты порядка
### a2b1-073
- единое правило · 073_d_notice: «tegusõna kohe» → «tavaliselt kohe; asesõnaga võib ka: …, me jääme koju»
- ложные ошибки · 073_d_fix: «Kui ilm on ilus, me sõidame randa» (допустимо) → «…, lapsed lähevad → lähevad lapsed»; «Kui sa tuleb, ma teen…» (две ошибки) → только «tuleb → tuled»; «Kui mul on aega siis ma helistan» (запятая + порядок) → «Kui mul olen aega → on aega»
- чтение/ключи · 073_p_read: «Kui palju maksab uus võti?» → «Mida teha, kui jutt toakaaslasega ei aita?»; варианты
- угадываемые · 073_p_choice: «maga koridoris», «peida nad tuppa», «helista politseisse», «osta uus» → другие правила из того же текста (надо помнить, какое правило к какому случаю)
- ложные ошибки · 073_p_fix: «Kui midagi läheb katki, sa kirjutad meile» (правильное предложение) → «midagi lähevad → läheb»; «Kui sul on probleem siis räägi» (только запятая) → «Kui sul on probleemi → probleem»
- чтение · 073_t_read: «Kus laager toimub?» → «Mitu ööd on lapsed laagris? [kaks]» (3.–5. mai); варианты
- ключи · 073_tx_gaps: kirjutage|kirjuta
- нерешаемые · 073_tx_fix: «Kui on külm pane jope → … pane jope selga» (в ответе новое слово) → «pane jope seljas → selga»
### a2b1-074
- чтение/ключи · 074_d_read: «Mitu inimest on teises rühmas?» → «Kui palju kallim on internetikursus? [50 eurot]» (250 − 200); варианты к «esimene põhjus», «kell kuus»
- ключи · 074_d_gaps: Sellepärast|Seepärast|Seetõttu
- ложные ошибки · 074_d_fix: «Esiteks mulle sobib aeg», «Teiseks rühm on väike» (после esiteks/teiseks порядок не строгий: «Esiteks, see on…» нормально), «Sellepärast ma valisin» (допустимо), «See on kallim aga mugavam» (только запятая) → «õhtune kursust → kursus», «väikesem → väiksem», «saab ma → saan ma», «valisin seda kursust → selle kursuse»
- нерешаемые · 074_d_cross: «selle pärast → sellepärast» (ответ в подсказке) → «sama mis „seetõttu”»
- нерешаемые · 074_p_trans: в ответах были слова, которых нет в задании («kui rong», «sobib mulle», «tund aega», «minu jaoks») → исходники дополнены / приняты ответы без лишних слов
- чтение/ключи · 074_p_read: «Mis on Hispaania miinus?» → «Kelle soov jääb täitmata? [naise]»; варианты
- угадываемые · 074_p_choice: «Hispaania on Hispaania», «Saaremaa on saar», «Lihtsalt», «Ma ei tea», «Vaatame» → факты из текста, которые не являются доводом (минусы других мест) и связки не той функции (esiteks / näiteks / sellepärast)
- угадываемые · 074_p_cross: «Hispaania / Saaremaa / Läti» (география, не язык) → odav, mõistlik, miinus
- ложные ошибки · 074_px_fix: «Esiteks Läti on odavam», «Sellepärast me valime», «Teiseks me saame» → «odavam kui Hispaaniat → Hispaania», «Sellepärast lapsed tahavad → tahavad lapsed», «saame sõitma → sõita»; вариант без «see»
- чтение/ключи · 074_t_read: «Kui pikk on proovikuu? [üks kuu]» → «Mis juhtub, kui kaugtöö ei toimi?»; варианты
- угадываемые · 074_t_check: «kohvikus» → «ainult kontoris»
- нерешаемые · 074_tx_trans: «Kodus on vaiksem kui kontoris. → тот же ответ» (ответ выдан) → исходник «Kodus on vaikne, kontoris on lärmakas.»; варианты порядка
### a2b1-075
- чтение/ключи · 075_d_read: «Kus Mihkel praegu töötab?» → «Kuidas saab Mihkel õppida ja samal ajal raha teenida? [töötab nädalavahetustel]»; варианты
- нерешаемые · 075_d_forms: «õppima → õppima» (ответ выдан), строки без признака формы → у каждой строки лицо/время или мини-контекст («eesmärk on … (da-vorm)», «kui homme … (olevik)»), строка «õppima, tema, olevik → õpib»
- ключи · 075_d_trans: варианты порядка
- нерешаемые · 075_p_mix: «Kümme punkti» при 8 пропусках → «Kaheksa punkti»
- ложные ошибки · 075_p_fix: «Teiseks rühm on väiksem» (порядок не строгий) → «odavam kui ülikooli → ülikool»; варианты
- чтение/ключи · 075_p_read: «Mida hakkab Tiina tegema?» → «Kes neist kolmest on kõige vanem? [Maret]»; варианты
- чтение · 075_t_read: «Mida teha, kui idee maksab üle 20 000?» → «Kas idee võib maksta kolmkümmend tuhat eurot? [jah, etappideks]»
- ключи · 075_tx_trans, 075_tx_gaps: варианты

## Сколько исправлено (по блокам, ≈190 записей; в одной записи бывает 1–4 мелкие правки)

| Вид | Записей |
|---|---|
| ключи (неверный ключ, добавлены верные варианты через `|` или `;`) | ≈ 50 |
| эстонский (ошибки в текстах, вопросах, вариантах, моделях) | ≈ 24 |
| ложные ошибки в errorfix (правильное предложение помечено как ошибка, исправление смысла вместо языка, строка «только запятая») | ≈ 42 |
| нерешаемые (ответ в подсказке, нет формы в задании, в ответе слова, которых нет в задании, заголовок «Kümme punkti» при 8 пропусках, неоднозначное сопоставление) | ≈ 28 |
| угадываемые (абсурдные варианты, правильный вариант заметно длиннее, варианты разных форм, банк без лишних слов) | ≈ 25 |
| чтение (вопрос переписан так, чтобы надо было сравнить, посчитать или сделать вывод) | ≈ 60 (2–3 вопроса в каждом тексте; 60 текстов) |

Ключевые исправления эстонского из аудита сделаны все: «vähe ratturid → rattureid» (059), «ei koristat / ei koristata → ei korista» (063), «saaksite mul aidata → mind aidata» (065, оба блока), «Mille üle … unistanud → Millest» (070), ключ «kahtekümmet → kahtkümmend» (070). Также убраны как ложные ошибки «olekski» (062, 2 места), «Kas ma saan õigesti aru» (064), «Ma ei olnud veel Jaapanis käinud» (067), «saab minna» (071, 3 листа), «Pargis saab jalutada üks tund» (057), «Kahjuks ma ei saa…» (061, 065 — 3 места), «Kas laupäev sobib sinule» (061), «Me sõime maasikad» (066).

## Не исправлено (нужна переделка побольше)

1. **Автопроверка errorfix / transformation / wordforms ломается на запятой.** В движке (`worksheet-studio/engine/blocks/advanced.jsx`, `scoreRows` → `splitList`) ответ делится по `,` `;` и переводу строки. Поэтому любой ответ с запятой («Ma hilinesin, sest buss ei tulnud.», «Kui sajab, jääme koju.») никогда не засчитывается: ни правильный, ни неправильный. Ещё `norm` удаляет запятые, поэтому строки, где ошибка только в запятой, проверить нельзя совсем. В моих модулях таких ответов несколько десятков (вся тема sest / kui-lause). Где можно, я заменил строки «только запятая» на другие ошибки. Остальное надо чинить в движке, это не мои файлы. Например: делить варианты только по `;` или `|`, а запятые в `norm` сохранять для errorfix. Свои варианты ответа я разделял через `; `.
2. **meta.level = A2+ во всех листах**, а по роадмапу 061–075 — это B1-. Из-за этого проверка конструктора не даёт поднять говорение выше 120 с. Я пробовал: 064 practice 120–180 с (canDo «4 минуты»), 066 practice/transfer до 180 с (canDo «3 минуты»). Проверка вернула новые проблемы («tasemel A2+ sobib 60–120 s»), поэтому я откатил правку. Нужно сначала поднять уровень модулей 13–15 в MODULE.
3. **Уровень грамматики:** 056/057 — погода и kus/kuhu/kust (A1–A2). 066/067 — lihtminevik и täisminevik (A2). 071 — будущее через настоящее время (A1/A2). Enneminevik, kesksõnad, des-vorm, umbisikuline, kaudne kõne не вводятся нигде. Нужны новые уроки или блоки, локально это не исправить. В 071_d_forms я заменил только чистое спряжение hakkama на «hakkama + ma-vorm».
4. **Длина текстов и экзамен:** все тексты 120–150 слов. Нет текста на 200–300 слов, нет аудирования (listening), нет cloze с тремя вариантами внутри текста, нет сопоставления «ситуации ↔ объявления». Перевод с русского и диктант остались в каждом листе. В 067 Kasuta нет заполнения анкеты из 10 вопросов, а это формат Harno, письмо T1.
5. **Банки слов:** в 058_d_gaps я добавил банк союзов. Проверка конструктора на A2+ его не принимает: в банке повторяются слова, и их можно просто скопировать. Поэтому банк убран, вместо него в ключе даны варианты. Банки с лишними словами остались в 060_tx_gaps, 061_d_gaps и 063_d_gaps.
6. «uhke enda pärast → enda üle» (069, 070) оставлено как ошибка: по ÕS норма — «uhke kelle üle». Если методист считает «pärast» допустимым, строки надо заменить.
7. «Hommikul järvedel on udu → Hommikul on järvedel udu» (056_tx_fix) оставлено: два обстоятельства перед глаголом, V2 здесь нарушен.

## Проверки

- `cd crm-v2 && npx vitest run src/features/worksheet-generator < /dev/null` → **Test Files 1 failed | 46 passed (47); Tests 9 failed | 528 passed | 1 skipped (538).**
  - Мои 4 падения (`a2b1-module-12/13/14/15 › passes the quality gate`) все на массиве `fixed` (`course.test.js:15`): там только исправленные проблемы, **новых (`fresh`) — 0**. Их надо убрать из baseline:
    - module-12: `a2b1-059|transfer|did-choice-length-059_t_check`, `a2b1-059|transfer|didactic`
    - module-13: `a2b1-063|practice|did-choice-length-063_p_choice`, `a2b1-063|practice|didactic`
    - module-14: `a2b1-069|discover|did-errorfix-none-069_d_fix`
    - module-15: `a2b1-071|transfer|did-choice-length-071_t_check`, `a2b1-072|practice|did-errorfix-none-072_p_fix`, `a2b1-073|practice|did-errorfix-none-073_p_fix`, `a2b1-074|discover|did-errorfix-none-074_d_fix`, `a2b1-074|practice|did-choice-length-074_p_choice`, `a2b1-074|transfer|did-transform-none-074_tx_trans`
  - Остальные 5 падений (module-02, 05, 06, 07, 08) — не мои файлы. Их сейчас правят другие исполнители.
  - Тесты «keeps answer keys inside the sheet» для модулей 12–15 и все тесты avastaModule проходят.
- `npx eslint` на 4 файла → без ошибок.
