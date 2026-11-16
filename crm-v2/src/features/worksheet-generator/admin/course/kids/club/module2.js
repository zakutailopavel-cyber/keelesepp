// Vestlusklubi 10–12 a, moodul 2: Talv ja pühad (kids/club11.js composes the five modules; field reference there).
// Calendar: meeting 6 is the Christmas meeting (about 21 December); meetings 7–8 fall after the holidays (January),
// so the project meeting wishes „Head uut aastat!” and recycles „Mida sa jõuludeks said?”.
// Recycled from module 1: colours, family (vanaema in the phone call of meeting 7), „Mulle meeldib …”, prillid.

export const MODULE_2 = {
  title: 'Talv ja pühad',
  goal: 'Laps kirjeldab ilma ja riideid, räägib talvest, jõuludest ja sünnipäevast ning kutsub ja soovib.',
  lessons: [
    // ---------- 5 Riided ja ilm ----------
    {
      title: 'Riided ja ilm', ru: 'Одежда и погода',
      can: 'Laps kirjeldab ilma ja oma riideid ning ütleb, mida ta paneb selga.',
      focus: 'Täna on külm · Mul on seljas jope, peas müts, jalas saapad',
      words: [
        ['jope', 'куртка', 'jacket'], ['kleit', 'платье', 'dress'], ['särk', 'рубашка', 'shirt'], ['püksid', 'брюки', 'trousers'],
        ['sokid', 'носки', 'sock'], ['saapad', 'сапоги', 'boots'], ['müts', 'шапка', 'hat'], ['kindad', 'варежки, перчатки', 'mittens'],
        ['päike', 'солнце', 'sun'], ['vihm', 'дождь', 'rain'], ['vihmavari', 'зонт', 'umbrella'], ['lumi', 'снег', 'snowflake'],
      ],
      words2: [
        ['kampsun', 'свитер'], ['sall', 'шарф'], ['tuul', 'ветер'], ['kraad', 'градус'],
        ['pilvine', 'облачный'], ['jahe', 'прохладный'], ['libe', 'скользкий'], ['riietuma', 'одеваться'],
      ],
      phrases: [
        ['Mis ilm täna on?', 'Täna on külm ja sajab lund.'],
        ['Mis sul täna seljas on?', 'Mul on seljas sinine särk.'],
        ['Mis sul jalas on?', 'Mul on jalas mustad püksid ja sokid.'],
        ['Mida sa paned selga, kui sajab vihma?', 'Ma panen selga jope ja võtan vihmavarju kaasa.'],
        ['Mis sul talvel peas ja käes on?', 'Mul on peas müts ja käes kindad.'],
        ['Mis ilm sulle meeldib?', 'Mulle meeldib, kui paistab päike.'],
      ],
      frames: ['Kui on jahe, siis ma panen selga …', 'Mul on seljas …, aga mul ei ole …', 'Kui tee on libe, siis ma …', 'Minu arvates on … parem kui …, sest …'],
      questions: ['Mis ilm täna on?', 'Mis sul täna seljas on?', 'Mis värvi on sinu jope?', 'Mida sa paned selga, kui sajab vihma?', 'Mis sul talvel peas ja käes on?', 'Mis ilm sulle meeldib? Miks?', 'Miks on talvel vaja mütsi ja kindaid?', 'Kumb on parem, talv või suvi? Miks?'],
      find: ['kannab täna midagi sinist', 'kannab prille', 'kannab täna kampsunit', 'tuli täna klubisse saabastega', 'armastab vihma', 'armastab talve rohkem kui suve', 'ei kanna talvel mütsi', 'võtab vihmaga alati vihmavarju kaasa'],
      roles: ['Riidepoes', 'Ostja otsib uut talvejopet. Müüja teab, mis poes on.', [
        'Sa oled ostja. Sa otsid sinist või musta talvejopet, suurus 152. Sul on 50 eurot. Küsi ja otsusta: kas ostad?',
        ['Kas teil on sinist jopet?', 'Minu suurus on 152.', 'Kui palju see maksab?', 'Ma võtan selle. / Aitäh, ei.'],
      ], [
        'Sa oled müüja. Poes on: punane jope (152) — 35 €, sinine jope (ainult 140) — 40 €, must jope (152) — 55 €. Küsi ja paku.',
        ['Mis värvi jopet te soovite?', 'Mis suurus teil on?', 'Sinine jope on ainult suuruses 140.', 'See maksab … eurot.'],
      ]],
      pair: ['Ilm kahes linnas', 'Kaks sõpra elavad eri linnades ja räägivad telefonis homsest ilmast.', [
        'Sa elad Tallinnas. Homme on Tallinnas +2 kraadi, ilm on pilvine ja puhub tugev tuul. Küsi sõbralt: mitu kraadi on Tartus, mis ilm seal on ja mida ta paneb selga. Kirjuta vastused.',
        ['Mitu kraadi Tartus homme on?', 'Mis ilm seal on?', 'Mida sa paned selga?', 'Siin puhub tugev tuul.'],
      ], [
        'Sa elad Tartus. Homme on Tartus −6 kraadi, paistab päike, aga tee on libe. Küsi sõbralt: mitu kraadi on Tallinnas, kas seal sajab või puhub tuul ja mida ta paneb selga. Kirjuta vastused.',
        ['Mitu kraadi Tallinnas homme on?', 'Kas seal sajab või puhub tuul?', 'Mida sa paned selga?', 'Siin on tee libe.'],
      ]],
      extra: ['Ilmakaardid', 'Võta kaart ja ütle: „Täna on … kraadi ja …, ma panen selga …”', [
        ['Esmaspäev', ['☀️ päike', '+20 kraadi', 'soe', 'T-särk ja lühikesed püksid']],
        ['Teisipäev', ['🌧️ vihm', '+8 kraadi', 'jahe', 'jope ja vihmavari']],
        ['Kolmapäev', ['❄️ lumi', '−5 kraadi', 'külm', 'müts, kindad ja saapad']],
        ['Neljapäev', ['💨 tuul', '+3 kraadi', 'pilvine', 'soe jope ja sall']],
      ]],
      dialogue: [
        ['A', 'Mis [ilm] täna on?'], ['B', 'Täna on külm ja sajab [lund].'],
        ['A', 'Mida sa paned [selga]?'], ['B', 'Ma panen selga sooja jope, pähe mütsi ja kätte kindad.'],
        ['A', 'Mis värvi on sinu [müts]?'], ['B', 'Minu müts on punane.'],
      ],
      gaps: ['Täna on jahe, sellepärast panen selga sooja [kampsuni].', 'Väljas puhub tugev [tuul], sellepärast on väga külm.', 'Kui on külm, siis ma panen kaela [salli].', 'Täna on taevas hall ja ilm on [pilvine].', 'Talvel on tänav sageli [libe], nii et kõnni aeglaselt.'],
      bank: ['kampsuni', 'tuul', 'salli', 'pilvine', 'libe', 'kraadi'],
      // one natural order only
      order: ['Kas sul on külm?', 'Minu müts on punane.', 'Mul on külm, sest mul ei ole mütsi.', 'Kas sa tahad sooja teed?'],
      cross: [['куртка', 'jope'], ['свитер', 'kampsun'], ['солнце', 'päike'], ['ветер', 'tuul'], ['шарф', 'sall'], ['шапка', 'müts']],
      snack: ['Kas sul on külm? Kas sa tahad sooja teed?'],
      plan: ['Täna on … ilm.', 'Homme on … kraadi, sajab … / paistab päike.', 'Mul on täna seljas … ja jalas …', 'Kui on külm, siis ma panen selga …', 'Minu lemmikaastaaeg on …, sest …', 'Mulle meeldib, kui …'],
      talk: 'Ole ilmateadustaja: räägi umbes üks minut homsest ilmast ja ütle, mida selga panna.',
      game1: '«Одеваемся по погоде» (эстафета): две команды; для каждой — свой комплект карточек слов (лист 1 распечатать дважды), комплекты лежат на столах в другом конце класса. Учитель берёт карточку погоды (лист 1) и объявляет: «Täna on jahe ja puhub tuul!» Первый игрок каждой команды бежит, берёт 2–3 нужные карточки и, вернувшись, говорит: «Ma panen selga kampsuni ja kaela salli, sest puhub tuul!» Верная фраза — очко, карточки возвращаются на стол. 6–8 раундов; с 4-го раунда погоду объявляет ребёнок.',
      game2: 'Ролевая игра «Riidepoes»: все пары играют одновременно (8 мин) — у покупателя и продавца разные данные (цвет, размер, цена), договариваются, купит ли покупатель куртку; потом 2 пары показывают сценку, остальные отвечают учителю: «Kas ta ostis jope? Mis värvi? Kui palju see maksis?» Сценку можно повторить, поменявшись ролями.',
      home: 'Утром перед школой ребёнок говорит по-эстонски, какая погода и что он надевает: «Täna on külm, panen pähe mütsi ja kätte kindad».',
      self: ['Ma ütlen, mis ilm täna on.', 'Ma kirjeldan oma riideid: seljas, jalas, peas.', 'Ma ütlen, mida panna selga.'],
    },
    // ---------- 6 Talv ja jõulud (about 21 December) ----------
    {
      title: 'Talv ja jõulud', ru: 'Зима, Рождество и Новый год',
      can: 'Laps räägib talvest, jõuludest ja uuest aastast oma peres, soovib häid pühi ja ütleb, mida ta soovib.',
      focus: 'Häid jõule! · Mida sa jõuludeks soovid? — Ma soovin uut …',
      words: [
        ['talv', 'зима', 'snowflake'], ['lumememm', 'снеговик', 'snowman'], ['kuusk', 'ёлка', 'christmastree'], ['täht', 'звезда', 'star'],
        ['kingitus', 'подарок', 'gift'], ['piparkook', 'имбирное печенье', 'cookie'], ['müts', 'шапка', 'hat'], ['kindad', 'варежки, перчатки', 'mittens'],
        ['jõuluvana', 'Дед Мороз, Санта'], ['päkapikk', 'гномик, помощник Деда Мороза'], ['kelgutama', 'кататься на санках'], ['uisutama', 'кататься на коньках'],
      ],
      words2: [
        ['ehtima', 'украшать (ёлку)'], ['küpsetama', 'печь'], ['tähistama', 'праздновать'], ['suusatama', 'кататься на лыжах'],
        ['kaunistus', 'украшение'], ['ilutulestik', 'фейерверк'], ['kelk', 'санки'], ['pidulik', 'праздничный'],
      ],
      phrases: [
        ['Häid jõule!', 'Häid jõule ka sulle!'],
        ['Mida sa jõuludeks soovid?', 'Ma soovin uut raamatut.'],
        ['Mida te jõulude ajal teete?', 'Me ehime kuuse ja sööme koos.'],
        ['Mida sulle talvel meeldib teha?', 'Mulle meeldib kelgutada ja uisutada.'],
        ['Kas päkapikk toob sulle kommi?', 'Jah, ta paneb kommi sussi sisse.'],
        ['Head uut aastat!', 'Aitäh, sulle ka!'],
      ],
      frames: ['Kõigepealt me ehime …, siis me …', 'Minu pere tähistab …, sest …', 'Talvel meeldib mulle …, aga mulle ei meeldi …', 'Ma soovin jõuludeks …, sest …'],
      questions: ['Mida sulle talvel meeldib teha?', 'Kas sa oskad uisutada?', 'Mida sa jõuludeks soovid?', 'Kas sinu pere tähistab jõule või uut aastat?', 'Kus sa uut aastat tähistad?', 'Mida sinu pere pühade ajal sööb?', 'Miks lapsed ootavad jõule nii väga?', 'Kumb on parem, jõulud või uus aasta? Miks?'],
      find: ['oskab uisutada', 'käib talvel suusatamas', 'küpsetab kodus piparkooke', 'ehib kodus kuuske', 'paneb päkapikule sussi aknale', 'oskab mõnda jõululaulu', 'tähistab uut aastat vanaema juures', 'soovib jõuludeks raamatut'],
      roles: ['Jõuluvana külas', 'Jõuluvana tuli klubisse. Laps ütleb salmi ja saab kingituse.', [
        'Sa oled jõuluvana. Kotis on ainult uisud, raamat ja kelk. Küsi nime, vanust ja mida laps soovib. Kui seda kingitust ei ole, paku midagi muud. Palu salmi.',
        ['Tere, laps! Mis su nimi on?', 'Mida sa jõuludeks soovid?', 'Kas sa oskad mõnda salmi?', 'Mul on kotis …'],
      ], [
        'Sa oled laps. Sa soovid telefoni, aga sobib ka kelk või raamat. Ütle jõuluvanale salm (kaart „Salm jõuluvanale”) ja täna teda.',
        ['Tere, jõuluvana!', 'Minu nimi on … Ma olen … aastane.', 'Ma soovin …', 'Suur aitäh! Häid jõule!'],
      ]],
      pair: ['Pühad kahes peres', 'Kaks sõpra räägivad, kuidas nende pered pühi tähistavad.', [
        'Sinu pere tähistab jõule vanaema juures. Te ehite kuuse ja küpsetate piparkooke. Sa soovid kelku. Küsi sõbralt: mida tema pere tähistab, kus, mida nad teevad ja mida ta soovib.',
        ['Mida teie pere tähistab?', 'Kus te tähistate?', 'Mida te teete?', 'Mida sa soovid?'],
      ], [
        'Sinu pere tähistab uut aastat kodus. Te sööte pidulikku õhtusööki ja vaatate ilutulestikku. Sa soovid suuski. Küsi sõbralt: mida tema pere tähistab, kus, mida nad teevad ja mida ta soovib.',
        ['Kas te tähistate jõule või uut aastat?', 'Kas te olete kodus?', 'Mida te sööte ja teete?', 'Mis kingitust sa soovid?'],
      ]],
      extra: ['Jõulukaardid ja salm', 'Kirjuta kaardile soov ja loe see ette. Õpi salm jõuluvanale.', [
        ['Kaart sõbrale', ['Kallis …!', 'Häid jõule ja head uut aastat!', 'Soovin sulle …', 'Sinu …']],
        ['Kaart perele', ['Kallid ema ja isa!', 'Häid pühi!', 'Ma armastan teid!', 'Teie …']],
        ['Salm jõuluvanale', ['Lumi maas ja kuusk on toas,', 'jõuluvanal kott on kaasas.', 'Jõuluvana, tere-tere,', 'häid jõule kogu perele!']],
        ['Kiri jõuluvanale', ['Kallis jõuluvana!', 'Mina olen … Ma olen … aastane.', 'Sel aastal ma …', 'Ma soovin …']],
      ]],
      dialogue: [
        ['A', 'Mida sa [jõuludeks] soovid?'], ['B', 'Ma soovin uusi uiske. Ja sina?'],
        ['A', 'Mina soovin [raamatut]. Mida te jõulude ajal teete?'], ['B', 'Me [ehime] kuuse ja sööme koos.'],
        ['A', 'Häid [jõule]!'], ['B', 'Häid jõule ka sulle!'],
      ],
      gaps: ['Enne jõule me [ehime] kuuse ilusate kaunistustega.', 'Vanaema ja mina [küpsetame] köögis koos piparkooke.', 'Kell kaksteist öösel vaatame me koos [ilutulestikku].', 'Talvel meeldib mulle mäel [kelgutada] ja uisutada.', 'Meie pere [tähistab] jõule alati vanaema juures.'],
      bank: ['ehime', 'küpsetame', 'ilutulestikku', 'kelgutada', 'tähistab', 'pidulik'],
      order: ['Kas sa oskad uisutada?', 'Ma soovin uut raamatut.', 'Kas sa tahad piparkooki?', 'Ma ei saa uisutada, sest mul ei ole uiske.'],
      cross: [['зима', 'talv'], ['ёлка', 'kuusk'], ['санки', 'kelk'], ['украшение', 'kaunistus'], ['подарок', 'kingitus'], ['фейерверк', 'ilutulestik']],
      snack: ['Kas sa tahad piparkooki?', 'Head isu ja häid pühi!'],
      plan: ['Talvel meeldib mulle …', 'Jõulude või uue aasta ajal meie pere …', 'Me sööme …', 'Jõuluvana / päkapikk toob …', 'Ma soovin …', 'Häid jõule ja head uut aastat!'],
      talk: 'Räägi umbes üks minut: mida sa talvel teed, kuidas sinu pere jõule või uut aastat tähistab ja mida sa soovid.',
      game1: '«Мешок желаний» (цепочка): учитель пишет на доске формы подарков: uut raamatut / telefoni / mängu / palli, uusi uiske / kindaid, kelku, kommi. Дети сидят в кругу, по кругу идёт мешок (или шапка). Первый говорит: «Ma soovin jõuludeks uut telefoni.» Следующий сначала пересказывает соседа, потом говорит о себе: «Anna soovib uut telefoni. Mina soovin kelku.» Второй круг — без доски и с причиной: «… soovib kelku. Mina soovin suuski, sest mulle meeldib suusatada.»; третий — «чемпионы памяти» (желающие) называют желания всех: «Anna soovib telefoni, Mark soovib kelku …» Мешок дошёл до учителя — все хором: «Häid jõule!»',
      game2: '«Jõuluvana külas»: сначала все хором 2–3 раза читают salm с листа 1 (2 мин). Учитель — jõuluvana (шапка, мешок с тремя карточками-подарками: uisud, raamat, kelk). Каждый ребёнок подходит, говорит salm и просит подарок; если его нет в мешке — jõuluvana предлагает другой (6 мин). Затем пары играют по карточкам ролей, ребёнок-jõuluvana задаёт свои вопросы (7 мин). Открытки — дома (см. записку родителям).',
      home: 'Эстонская традиция: в декабре дети ставят тапочек на окно, и päkapikud (гномики) кладут туда конфету. Вместе подпишите открытку по-эстонски для бабушки, учителя или друга: «Kallis …! Häid jõule ja head uut aastat! Soovin sulle …» — ребёнок читает её вслух и рассказывает выученный в клубе стишок (salm).',
      self: ['Ma soovin: Häid jõule! Head uut aastat!', 'Ma räägin, mida meie pere pühade ajal teeb.', 'Ma ütlen: Ma soovin …', 'Ma ütlen jõuluvanale salmi.'],
    },
    // ---------- 7 Sünnipäev ja kingitused ----------
    {
      title: 'Sünnipäev ja kingitused', ru: 'День рождения и подарки',
      can: 'Laps kutsub sõbra sünnipäevale, soovib õnne, räägib kingitustest ja ütleb, mis kuus on tema sünnipäev.',
      focus: 'Minu sünnipäev on mais (kuu + -s) · Tule minu sünnipäevale! · Palju õnne!',
      words: [
        ['kook', 'торт', 'cake'], ['kingitus', 'подарок', 'gift'], ['õhupall', 'воздушный шар', 'balloons'], ['mäng', 'настольная игра', 'a2:mang'],
        ['raamat', 'книга', 'book'], ['lill', 'цветок', 'flower'], ['pall', 'мяч', 'ball'], ['seljakott', 'рюкзак', 'backpack'],
        ['sünnipäev', 'день рождения'], ['kutse', 'приглашение'], ['pidu', 'праздник, вечеринка'], ['küünal', 'свеча'],
      ],
      words2: [
        ['kutsuma', 'приглашать'], ['kinkima', 'дарить'], ['õnnitlema', 'поздравлять'], ['sündima', 'родиться'],
        ['puhuma', 'дуть, задувать'], ['külaline', 'гость'], ['üllatus', 'сюрприз'], ['rõõmus', 'радостный'],
      ],
      phrases: [
        ['Millal sinu sünnipäev on?', 'Minu sünnipäev on mais.'],
        ['Palju õnne sünnipäevaks!', 'Aitäh! Tule minu peole!'],
        ['Kas sa tuled minu sünnipäevale?', 'Jah, hea meelega! / Kahjuks ma ei saa.'],
        ['Mida sa sünnipäevaks soovid?', 'Ma soovin uut mängu.'],
        ['See on sulle!', 'Oi, aitäh! Väga ilus!'],
        ['Kui vanaks sa said?', 'Ma sain üksteist.'],
      ],
      frames: ['Ma kutsun oma peole …, sest …', 'Sõbrale ma kingin …, sest talle meeldib …', 'Kõigepealt me sööme kooki, siis …', 'Minu arvates on parim kingitus …, sest …'],
      questions: ['Mis kuus on sinu sünnipäev?', 'Mis ilm on sinu sünnipäeval tavaliselt?', 'Mis on kõige parem kingitus?', 'Mis kook sulle kõige rohkem maitseb?', 'Keda sa kutsud oma sünnipäevale?', 'Mida te peol teete?', 'Kumb on parem, pidu kodus või pidu väljas? Miks?', 'Mis on parem kingitus, raamat või mäng? Miks?'],
      find: ['sündis talvel', 'sündis samal kuul kui sina', 'sai jõuludeks raamatu', 'armastab šokolaadikooki', 'tähistab sünnipäeva kodus', 'käis sel kuul peol', 'teeb ise kingitusi', 'oskab laulda „Palju õnne”'],
      roles: ['Helistame vanaemale', 'Täna on vanaema sünnipäev. Lapselaps helistab talle. Istuge seljaga teineteise poole — see on telefon!', [
        'Sa oled lapselaps. Soovi vanaemale palju õnne. Küsi: kui vanaks ta sai, mis kingitusi ta sai ja mis kook tal on. Ütle: me tuleme pühapäeval kell kolm ja toome lilli.',
        ['Tere, vanaema! Palju õnne!', 'Kui vanaks sa said?', 'Mis kingitusi sa said?', 'Mis kook sul on?', 'Me tuleme pühapäeval kell kolm.'],
      ], [
        'Sa oled vanaema. Sa said täna 70. Sa said kingiks raamatu ja sooja salli. Sul on šokolaadikook. Küsi: millal lapsed külla tulevad ja kuidas koolis läheb.',
        ['Tere, kullake! Aitäh!', 'Ma sain seitsekümmend.', 'Ma sain raamatu ja salli.', 'Millal te külla tulete?', 'Kuidas koolis läheb?'],
      ]],
      pair: ['Kaks kutset', 'Mõlemad said kutse sünnipäevale, aga eri sõpradelt.', [
        'Sõber Mari kutsus sind sünnipäevale: laupäeval kell 14 Mari kodus, Pargi tänav 5. Mari saab 11 ja soovib raamatut. Küsi sõbralt tema kutse kohta: kes kutsus, millal, kus ja mida kinkida.',
        ['Kes sind kutsus?', 'Millal ja kus pidu on?', 'Kui vanaks ta saab?', 'Mida sa talle kingid?'],
      ], [
        'Sõber Jaan kutsus sind peole: pühapäeval kell 12 batuudikeskuses. Jaan saab 12 ja soovib palli. Küsi sõbralt tema kutse kohta: kes kutsus, millal, kus ja mida kinkida.',
        ['Kelle peole sa lähed?', 'Mis kell pidu algab?', 'Kus see on?', 'Mida ta soovib?'],
      ]],
      extra: ['Kutsed, õnnitlused ja kuud', 'Täida kaart ja anna sõbrale. Sõber loeb selle ette ja vastab. Kuude kaardid aitavad öelda: „Minu sünnipäev on …s.”', [
        ['KUTSE', ['Kallis …!', 'Tule minu sünnipäevale!', 'Millal: …', 'Kus: …']],
        ['KUTSE', ['Kallis …!', 'Tule minu peole!', 'Kell: …', 'Võta kaasa hea tuju!']],
        ['ÕNNITLUS', ['Palju õnne, …!', 'Soovin sulle …', 'Sinu …']],
        ['ÕNNITLUS', ['Palju õnne sünnipäevaks!', 'Ole terve ja rõõmus!', 'Sinu sõber …']],
        ['Kuud 1–6', ['jaanuar → jaanuaris', 'veebruar → veebruaris', 'märts → märtsis', 'aprill → aprillis', 'mai → mais', 'juuni → juunis']],
        ['Kuud 7–12', ['juuli → juulis', 'august → augustis', 'september → septembris', 'oktoober → oktoobris', 'november → novembris', 'detsember → detsembris']],
      ]],
      dialogue: [
        ['A', 'Millal sinu [sünnipäev] on?'], ['B', 'Laupäeval! Kas sa tuled minu [peole]?'],
        ['A', 'Jah, hea meelega! Mida sa [soovid]?'], ['B', 'Ma soovin uut raamatut.'],
        ['A', 'Palju [õnne]!'], ['B', 'Aitäh!'],
      ],
      gaps: ['Ma [kutsun] oma sünnipäevale kõik klassikaaslased.', 'Mina [sündisin] mais, aga minu vend sündis jaanuaris.', 'Sünnipäevalaps [puhub] koogil kõik küünlad ära.', 'Ära ütle emale midagi, kingitus on [üllatus]!', 'Mida sa oma parimale sõbrale sünnipäevaks [kingid]?'],
      bank: ['kutsun', 'sündisin', 'puhub', 'üllatus', 'kingid', 'külaline'],
      order: ['Palju õnne sünnipäevaks!', 'Mis kuus sa sündisid?', 'Kui vanaks sa said?', 'Ma ei saa tulla, sest mul on trenn.'],
      cross: [['торт', 'kook'], ['подарок', 'kingitus'], ['дарить', 'kinkima'], ['свеча', 'küünal'], ['гость', 'külaline'], ['сюрприз', 'üllatus']],
      snack: ['Kas sa tahad tükki kooki?', 'Jah, palun väikest tükki!'],
      plan: ['Minu sünnipäev on … (mis kuus?)', 'Siis on tavaliselt … ilm.', 'Ma kutsun …', 'Me sööme … ja teeme …', 'Ma soovin …', 'Kõige parem kingitus oli …'],
      talk: 'Räägi umbes üks minut oma sünnipäevast: mis kuus see on, kuidas sa seda tähistad, keda sa kutsud ja mida sa soovid.',
      game1: '«Календарь дней рождения»: дети ходят по классу и только по-эстонски спрашивают друг друга «Mis kuus sa sündisid?», затем молча встают в ряд от jaanuar до detsember (карточки «Kuud» с листа 1 — подсказка). Учитель проверяет ряд: каждый говорит «Ma sündisin …s», сосед повторяет «Tema sündis …s». Второй круг: в парах спрашивают о днях рождения родных («Mis kuus on sinu ema sünnipäev?») и рассказывают группе.',
      game2: 'Ролевая игра «Helistame vanaemale»: пары садятся спиной друг к другу («телефон»), все играют одновременно (6 мин), затем меняются ролями; 2 пары показывают звонок, класс отвечает учителю: «Kui vanaks vanaema sai? Mis kingitusi ta sai?» В конце каждый пишет на листочке приглашение по образцу KUTSE (лист 1), отдаёт соседу, тот читает его вслух и отвечает: «Aitäh, ma tulen!»',
      home: 'Вместе отметьте в календаре дни рождения родных и назовите их по-эстонски: «Ema sünnipäev on märtsis». Ребёнок подписывает поздравление родственнику: «Palju õnne sünnipäevaks! Soovin sulle …».',
      self: ['Ma ütlen, mis kuus on minu sünnipäev.', 'Ma kutsun sõbra peole.', 'Ma soovin palju õnne ja tänan kingituse eest.'],
    },
    // ---------- 8 Projekt: Klubi talvepidu (January) ----------
    {
      title: 'Projekt: Klubi talvepidu', ru: 'Проект «Зимний праздник клуба» и повторение',
      can: 'Laps valmistab koos teistega klubi talvepeo (kutse, menüü, mäng, esinemine), kordab mooduli sõnu ja esineb peol.',
      focus: 'Kordamine: Täna on külm · Tule meie peole! · Head uut aastat!',
      words: [
        ['talv', 'зима', 'snowflake'], ['lumememm', 'снеговик', 'snowman'], ['kuusk', 'ёлка', 'christmastree'], ['täht', 'звезда', 'star'],
        ['jope', 'куртка', 'jacket'], ['müts', 'шапка', 'hat'], ['kindad', 'варежки, перчатки', 'mittens'], ['kingitus', 'подарок', 'gift'],
        ['raamat', 'книга', 'book'], ['kook', 'торт', 'cake'], ['piparkook', 'имбирное печенье', 'cookie'], ['õhupall', 'воздушный шар', 'balloons'],
      ],
      words2: [
        ['korraldama', 'организовывать'], ['esinema', 'выступать'], ['kaunistama', 'украшать'], ['pakkuma', 'предлагать'],
        ['vaheaeg', 'каникулы'], ['luuletus', 'стихотворение'], ['järjekord', 'очерёдность, порядок'], ['lõbus', 'весёлый'],
      ],
      phrases: [
        ['Mis ilm täna on?', 'Täna on külm ja sajab lund.'],
        ['Mida sa paned selga?', 'Ma panen selga sooja jope.'],
        ['Tule meie talvepeole!', 'Aitäh, ma tulen hea meelega!'],
        ['Mida me peol teeme?', 'Me laulame, mängime ja sööme kooki.'],
        ['Mida sa jõuludeks said?', 'Ma sain uue raamatu.'],
        ['Kes esineb esimesena?', 'Mina! Ma loen salmi.'],
      ],
      frames: ['Vaheajal ma …, aga …', 'Ma pakun, et me …, sest …', 'Kõigepealt me kaunistame …, siis …', 'Minu arvates oli pidu …, sest …'],
      questions: ['Mis ilm täna on?', 'Mida sa talvel selga paned?', 'Mida sa jõuludeks said?', 'Mida sa vaheajal tegid?', 'Mis kuus on sinu sünnipäev?', 'Mida me peol teeme?', 'Mis oli sinu vaheajal kõige toredam? Miks?', 'Kas sulle meeldib peol esineda? Miks?'],
      find: ['oskab mõnda talvelaulu', 'tahab peol esineda', 'joonistab hästi', 'tegi vaheajal lumememme', 'käis vaheajal uisutamas', 'teab viis riietesõna', 'oskab öelda kõik kaksteist kuud', 'tahab teha kaunistusi'],
      roles: ['Peo korraldajad', 'Klubi teeb talvepeo. Kaks korraldajat lepivad kokku päeva, söögi ja mängu.', [
        'Sa oled korraldaja A. Sa tahad teha peo reedel kell 16. Sa tahad süüa pitsat ja mängida „Lumepalli”. Paku oma ideid, küsi teise arvamust ja leppige kokku.',
        ['Teeme peo reedel!', 'Me võiksime süüa pitsat.', 'Mängime „Lumepalli”!', 'Mis sa arvad?'],
      ], [
        'Sa oled korraldaja B. Reede sulle ei sobi: sul on trenn. Neljapäev sobib. Sa tahad süüa kooki ja piparkooke ja laulda talvelaulu. Ütle oma arvamus ja leppige kokku.',
        ['Reedel mulle ei sobi.', 'Kas neljapäeval sobib?', 'Ma pakun kooki ja piparkooke.', 'Olgu, lepime kokku!'],
      ]],
      pair: ['Vaheaja uudised', 'Vaheaeg on läbi. Kaks sõpra räägivad, mida nad vaheajal tegid.', [
        'Vaheajal sa käisid vanaemaga Otepääl suusatamas. Jõuludeks said sa uued uisud. Uue aasta öösel nägid sa ilutulestikku. Küsi sõbralt: kus ta oli, mida ta sai ja mida ta uue aasta öösel tegi.',
        ['Kus sa vaheajal olid?', 'Mida sa jõuludeks said?', 'Mida sa uue aasta öösel tegid?', 'Mina käisin …'],
      ], [
        'Vaheajal sa olid kodus ja tegid õues suure lumememme. Jõuludeks said sa lauamängu. Uue aasta öösel sa magasid! Küsi sõbralt: kus ta oli, mida ta sai ja mida ta uue aasta öösel tegi.',
        ['Kas sa olid vaheajal kodus?', 'Mis kingituse sa said?', 'Kas sa nägid ilutulestikku?', 'Mina tegin …'],
      ]],
      extra: ['Peo plaan', 'Iga rühm võtab ühe kaardi ja valmistab selle osa peoks ette.', [
        ['KUTSE', ['kellele?', 'millal? kus?', 'mida me teeme?', 'joonista pilt']],
        ['MENÜÜ', ['mida me sööme?', 'mida me joome?', 'kes mida toob?']],
        ['MÄNG', ['mis mäng?', 'reeglid kolme lausega', 'kes juhib?']],
        ['ESINEMINE', ['salm või laul', 'kes esineb?', 'mis järjekorras?']],
      ]],
      dialogue: [
        ['A', 'Teeme klubis talvepeo! Mis [päeval]?'], ['B', 'Neljapäeval! Mida me [sööme]?'],
        ['A', 'Piparkooke ja kooki. Mida me [mängime]?'], ['B', '„Lumepalli”! Ja me [laulame].'],
        ['A', 'Hea mõte! Kirjutame kutse.'], ['B', 'Jah, teeme!'],
      ],
      gaps: ['Me [korraldame] reedel klubis suure talvepeo.', 'Enne pidu me [kaunistame] klassi tähtede ja õhupallidega.', 'Mina [esinen] peol ja loen ühe salmi.', 'Talvepidu oli väga [lõbus], kõik naersid ja laulsid.', 'Head uut [aastat] ja palju rõõmu kõigile!'],
      bank: ['korraldame', 'kaunistame', 'esinen', 'lõbus', 'aastat', 'järjekord'],
      order: ['Tule meie talvepeole!', 'Ma sain uue raamatu.', 'Ma tulen peole, sest ma tahan esineda.', 'Aitäh, ma tulen!'],
      cross: [['зима', 'talv'], ['снеговик', 'lumememm'], ['каникулы', 'vaheaeg'], ['стихотворение', 'luuletus'], ['торт', 'kook'], ['весёлый', 'lõbus']],
      snack: ['Palun, võta piparkooke!', 'Kas sa tahad veel teed?'],
      plan: ['Meie pidu on … (päev, kell).', 'Me kutsume …', 'Me sööme ja joome …', 'Me mängime …', 'Mina esinen / teen …', 'Tulge kõik!'],
      talk: 'Räägi umbes üks minut klubi talvepeost: millal see on, mida te teete ja sööte ning mida sina teed. Või esine salmi või lauluga.',
      game1: '«Снежки-вопросы»: учитель заранее пишет вопросы с карточек встреч 5–7 на листочки и сминает их в «снежки». Дети стоят в кругу; кто поймал снежок — разворачивает, читает вопрос вслух, отвечает полным предложением и бросает снежок тому, кто ещё не отвечал. Второй круг: ребёнок сам задаёт вопрос тому, кому бросает.',
      game2: '«Готовим праздник»: сначала одна пара показывает роль «Peo korraldajad» (3 мин) — группа узнаёт день и меню. Затем группы по 2–3 ребёнка берут карточку плана (KUTSE, MENÜÜ, MÄNG, ESINEMINE) и делают свою часть на листе А3: приглашение с рисунком, меню, правила игры, порядок выступлений (12 мин). Вместо «минуты рассказа» — сам праздник (8 мин): каждая группа представляет свою часть по-эстонски, все играют в игру, желающие говорят salm. Плакаты остаются в классе.',
      home: 'Ребёнок рассказывает, как прошёл праздник клуба и что делал он сам. Повторите вместе слова модуля: погода и одежда, зимние праздники, день рождения. Спросите: «Mida sa jõuludeks said?» — ребёнок отвечает по-эстонски.',
      self: ['Ma räägin ilmast ja riietest.', 'Ma kutsun sõpru ja soovin head uut aastat.', 'Ma esinen teistele.'],
    },
  ],
};
