// A2 course (A1 → A2 roadmap), module 16 „Minevik ja kogemused”, all five lessons a2-076…a2-080 (stage A2).
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min). 078 reads a short story in the past
// (who, where, when, what happened, why; the order of events), 079 brings the perfect only as the experience model
// („Kas sa oled kunagi … käinud?”) against the simple past with an exact time. 076 drills the simple past and ei + nud, 077
// tells a recent event in order, 080 is the module check in the Harno A2 form.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-16', course: 'a2', title: 'Minevik ja kogemused', level: 'A2', design: 'v2', template: 'v3' };

export const LESSONS = {
  'a2-076': {
    title: 'Lihtminevik — põhivormid',
    canDo: 'Ma moodustan sagedaste tegusõnade lihtmineviku jaatavas ja eitavas lauses (olin, tulin, läksin, tegin, sain, nägin; ei olnud) ja räägin oma eilsest päevast vähemalt 80% õigete vormidega.',
    template: 'v3',
    discover: [
      B.text('076_d_situation', 'Väsinud esmaspäev', 'Esmaspäeva hommikul on Markus tööl väga väsinud. Kolleeg Kati küsib: „Mida sa eile tegid?” Markus naerab. Pühapäev oli tal väga pikk päev.'),
      B.reading('076_d_read', 'Loe: Markuse pühapäev.', 'Loe teksti ja vasta küsimustele.', 'Pikk pühapäev',
        'Eile oli pühapäev. Ma ärkasin juba kell seitse, sest naabri koer haukus. Kõigepealt jõin kohvi ja sõin võileiba. Siis koristasin terve korteri. See võttis kaks tundi. Kell üksteist läksin poodi ja ostsin süüa. Lõunal tulid minu vanemad külla. Ma tegin suppi ja küpsetasin kooki. Me sõime ja rääkisime kaua. Pärast lõunat läksime koos parki. Seal nägime naabrit Viktorit ja tema koera. Õhtul tahtsin magada, aga sõber Jaan helistas. Ta kutsus mind jalgpalli vaatama. Ma läksin. Mäng oli huvitav, aga lõppes alles kell üksteist. Ma ei läinud magama kell kümme nagu tavaliselt. Koju jõudsin ma alles kell kaksteist. Ma ei saanud hästi magada. Täna olen ma väga väsinud.',
        [['Miks Markus ärkas kell seitse?', 'naabri koer haukus|koer haukus'], ['Kui kaua koristamine kestis?', 'kaks tundi'], ['Kes tulid lõunal külla?', 'tema vanemad|vanemad'], ['Keda nad pargis nägid?', 'naabrit Viktorit ja tema koera|Viktorit|naabrit'], ['Kuhu Jaan Markuse kutsus?', 'jalgpalli vaatama|jalgpalli'], ['Miks on Markus täna väsinud?', 'ta jõudis koju hilja|ta ei saanud hästi magada|ta läks hilja magama'], ['Mida Markus hommikul sõi?', 'võileiba|võileib'], ['Mida Markus lõunaks tegi?', 'suppi ja kooki|suppi']]),
      B.notice('076_d_notice', 'Märka: lihtminevik', ['Tavaline lõpp: ma ärka**sin**, ta ärka**s**; ma koristasin, ta koristas', '**-sin** / **-is**: ma ost**sin**, ta ost**is**; ma jõud**sin**, ta jõud**is**', 'Jäta meelde: **olin, tulin, läksin, tegin, sain, nägin, sõin, jõin**', 'Eitus: **ei** + **-nud**: ei **olnud**, ei **tulnud**, ei **läinud**, ei **teinud**, ei **saanud**', 'Eitus on kõigil sama: ma / sa / ta / me / te / nad **ei teinud**'], 'full'),
      B.gaps('076_d_gaps', 'Kati pühapäev.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', [
        'Kati [magas] (magama) kaua.', 'Ta [ärkas] (ärkama) alles kell kümme.', 'Hommikul [jõi] (jooma) ta teed.', 'Päeval [tegi] (tegema) ta kodutöid.',
        'Õhtul [sai] (saama) ta sõbralt kirja.', 'Ta [ei läinud] (minema, eitus) välja.', 'Ta [ei olnud] (olema, eitus) väsinud.', 'Õhtul [kirjutas] (kirjutama) ta emale.']),
      B.transformation('076_d_neg', 'Jah → ei.', 'Kirjuta lause eituses.', [
        ['Ma tegin kodutöö.', 'eitus', 'Ma ei teinud kodutööd.'], ['Ta tuli koju.', 'eitus', 'Ta ei tulnud koju.'], ['Me nägime filmi.', 'eitus', 'Me ei näinud filmi.'],
        ['Nad sõid kooki.', 'eitus', 'Nad ei söönud kooki.'], ['Ma olin väsinud.', 'eitus', 'Ma ei olnud väsinud.'], ['Sa ostsid leiba.', 'eitus', 'Sa ei ostnud leiba.'], ['Ta ostis leiba.', 'eitus', 'Ta ei ostnud leiba.'], ['Me jõime kohvi.', 'eitus', 'Me ei joonud kohvi.']]),
      B.errorfix('076_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Eile ma ei tegin midagi.', 'Eile ma ei teinud midagi.|Eile ei teinud ma midagi.'], ['Ta tulis hilja.', 'Ta tuli hilja.'], ['Me sõisime pitsat.', 'Me sõime pitsat.'], ['Nad ei läksid kinno.', 'Nad ei läinud kinno.'], ['Ma ostin leiba.', 'Ma ostsin leiba.'], ['Eile ma ei magasin hästi.', 'Eile ma ei maganud hästi.|Eile ei maganud ma hästi.'], ['Ta jõis teed.', 'Ta jõi teed.'], ['Nad tegisid süüa.', 'Nad tegid süüa.']]),
      B.translation('076_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Вчера я встал в семь.', 'Я убрал квартиру.', 'Мы не ходили в кино.', 'Она ничего не ела.', 'Я очень устал.', 'Вчера я спала долго.', 'Утром мы пили кофе.', 'Он не пришёл на работу.']),
      B.speaking('076_d_say', 'Mida sa eile tegid?', 'Räägi paarilisele oma eilsest päevast.', ['Mis kell sa ärkasid?', 'Mida sa sõid ja jõid?', 'Mida sa päeval tegid?', 'Mida sa eile ei teinud?', 'Mis kell sa magama läksid?'], [60, 90], ['Ma ärkasin…', 'Siis ma…', 'Ma ei…']),
      B.writing('076_d_write', 'Minu eilne päev.', 'Kirjuta 6–8 lauset oma eilsest päevast. Kasuta ka eitust.', [6, 8], ['ärkasin', 'tegin', 'läksin', 'ei'], 3),
    ],
    practice: [
      B.cloze('076_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Sofia laupäev', [
        'Laupäeval {*ärkas|ärkab|ärkama} Sofia hilja, alles kell kümme.',
        '',
        'Hommikul {*jõi|joob|jooma} ta kohvi ja {*luges|loeb|lugema} raamatut. Siis {*läks|läheb|minema} ta sõbrannaga linna.',
        '',
        'Nad {*käisid|käivad|käima} muuseumis ja {*sõid|söövad|sööma} kohvikus lõunat.',
        '',
        'Õhtul Sofia ei {*läinud|läks|lähe} välja. Ta {*oli|on|olema} väga väsinud ja läks vara magama.',
      ], 'g_vocab'),
      B.listening('076_p_listen', 'Kuulamine. Viktori eilne päev.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Viktor.', 'Eile oli ilus päev.', 'Ma ärkasin alles kell üheksa.', 'Hommikul jõin kohvi ja lugesin ajalehte.', 'Siis läksin poodi ja ostsin kala.',
        'Päeval tegin aias tööd. Ilm oli ilus.', 'Õhtul tulid naabrid külla. Me sõime kala ja rääkisime.', 'Ma ei vaadanud telerit. Ma läksin magama kell kümme.',
      ], ['Viktor ärkas kell [üheksa|9].', 'Hommikul luges ta [ajalehte].', 'Poest ostis ta [kala].', 'Päeval tegi ta tööd [aias].', 'Õhtul tulid külla [naabrid].', 'Viktor ei vaadanud [telerit].', 'Ta läks magama kell [kümme|10].', 'Hommikul jõi Viktor [kohvi].']),
      B.formtext('076_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', 'Jaani reede', [
        'Reedel [ärkas] (ärkama) Jaan kell kuus.',
        '',
        'Ta [jõi] (jooma) kohvi ja [läks] (minema) kohvikusse tööle.',
        '',
        'Lõunal [tuli] (tulema) palju kliente. Jaan [ei saanud] (saama, eitus) süüa.',
        '',
        'Õhtul ta [ei läinud] (minema, eitus) trenni. Ta [vaatas] (vaatama) kodus filmi ja [magas] (magama) hästi.',
      ], 'g_notice'),
      B.choice('076_p_choice', 'Vali õige vorm.', 'Vali lausesse sobiv tegusõna vorm.', [
        ['Eile ma ___ kaua.', 'magasin', 'magan', 'magas'], ['Me ___ eile restoranis.', 'sõime', 'sõid', 'sööme'], ['Kas sa ___ eile tööl?', 'olid', 'oli', 'olin'],
        ['Ta ei ___ eile kodus.', 'olnud', 'olin', 'oli'], ['Eelmisel nädalal nad ___ uue auto.', 'ostsid', 'ostis', 'ostavad'], ['Eile ma ei ___ midagi.', 'teinud', 'tegin', 'teen'], ['Kas te ___ eile kinos?', 'käisite', 'käisid', 'käime'], ['Ma ei ___ eile kohvi.', 'joonud', 'jõin', 'joon']], 'full', 'g_notice'),
      B.gaps('076_p_gaps', 'Ei, ma ei…', 'Kirjuta vastus eituses.', [
        'Kas sa tegid kodutöö? — Ei, ma [ei teinud].', 'Kas ta tuli tööle? — Ei, ta [ei tulnud].', 'Kas te nägite Annat? — Ei, me [ei näinud].', 'Kas nad said kirja? — Ei, nad [ei saanud].',
        'Kas sa läksid poodi? — Ei, ma [ei läinud].', 'Kas ta jõi kohvi? — Ei, ta [ei joonud].', 'Kas ta kirjutas kirja? — Ei, ta [ei kirjutanud].', 'Kas sa sõid hommikust? — Ei, ma [ei söönud].']),
      B.wordorder('076_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Eile ärkasin ma kell seitse.', 'Pärast tööd läksin ma poodi.', 'Õhtul ei vaadanud ma telerit.', 'Me sõime ja rääkisime kaua.', 'Kas sa said minu kirja kätte?', 'Eile olin ma kontoris kella kuueni.', 'Siis läksin ma bussiga koju.', 'Ma ei näinud juhataja arvutit.']),
      B.dictation('076_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eile oli ilus päev.', 'Ma ärkasin alles kell üheksa.', 'Päeval tegin aias tööd.', 'Naabrid tulid külla.', 'Ma ei vaadanud telerit.', 'Eile ärkasin ma kell seitse.', 'Siis koristasin ma korterit.', 'Lõunal tulid vanemad külla.']),
      B.dialogue('076_p_dialog', 'Esmaspäeva hommikul.', 'Täida Kati ja Markuse vestlus.', 'Kati', 'Markus', [
        ['A', 'Tere, Markus! Kuidas nädalavahetus [läks]?'], ['B', 'Hästi, aga ma olen väga [väsinud].'], ['A', 'Miks? Mida sa [tegid]?'], ['B', 'Laupäeval [koristasin] ja pühapäeval tulid vanemad külla.'],
        ['A', 'Kas te [käisite] ka väljas?'], ['B', 'Jah, me läksime parki. Õhtul [vaatasin] jalgpalli.'], ['A', 'Kas sa [magasid] hästi?'], ['B', 'Ei, ma ei [maganud] hästi.'],
      ]),
      B.speaking('076_p_say', 'Intervjuu: eile.', 'Küsi paarilisel viis küsimust tema eilse päeva kohta.', ['Mis kell sa ärkasid?', 'Mida sa sõid?', 'Kus sa olid?', 'Mida sa ei teinud?', 'Kas sa olid väsinud?'], [60, 90]),
    ],
    transfer: [
      B.text('076_t_situation', 'Uus olukord', 'Eile õhtul kadus kontorist juhataja sülearvuti. Täna küsib juhataja kõigilt töötajatelt: „Mida te eile tegite? Kus te olite?” Sina olid eile ka tööl.'),
      B.reading('076_t_read', 'Loe kolleegide vastuseid.', 'Loe vastuseid ja vasta küsimustele.', 'Kus te eile olite?', [
        'Pille: Eile olin tööl kella üheksast viieni. Lõunal sõin kohvikus. Kell viis läksin bussiga koju. Õhtul ma kontoris ei olnud. Ma vaatasin kodus filmi ja läksin vara magama.',
        'Anna: Mina lõpetasin töö kell kuus. Ma nägin, et juhataja kabineti uks oli lahti. Arvuti oli laual. Siis läksin ma trenni. Trennis olin kella kaheksani.',
        'Siim: Ma olin kontoris kella seitsmeni. Kell pool seitse tuli koristaja. Ta koristas ka juhataja kabinetti. Ma ei näinud, et keegi arvuti võttis. Kell seitse panin ukse lukku ja läksin koju.',
      ], [['Mis kell Pille koju läks?', 'kell viis|viis|5'], ['Mida Pille õhtul tegi?', 'vaatas filmi|vaatas kodus filmi'], ['Mida Anna kell kuus nägi?', 'arvuti oli laual|kabineti uks oli lahti'], ['Kuhu Anna pärast tööd läks?', 'trenni'], ['Kes oli kontoris kõige kauem?', 'Siim'], ['Kes tuli kell pool seitse?', 'koristaja'], ['Kus Pille lõunat sõi?', 'kohvikus'], ['Mis kell pani Siim ukse lukku?', 'kell seitse|seitse|7']]),
      B.transformation('076_t_trans', 'Juhataja küsib.', 'Kirjuta küsimus. Vastus on antud.', [
        ['Ma olin tööl.', 'Kus …?', 'Kus te olite?|Kus sa olid?'], ['Ma läksin kell viis koju.', 'Mis kell …?', 'Mis kell te koju läksite?|Mis kell sa koju läksid?'], ['Ma nägin arvutit laual.', 'Mida …?', 'Mida te nägite?|Mida sa nägid?'],
        ['Ma ei näinud kedagi.', 'Keda …?', 'Keda te nägite?|Keda sa nägid?'], ['Ma tegin aruannet.', 'Mida …?', 'Mida te tegite?|Mida sa tegid?'], ['Ma lõpetasin töö kell kuus.', 'Millal …?', 'Millal te töö lõpetasite?|Millal sa töö lõpetasid?'], ['Ma sõitsin koju bussiga.', 'Millega …?', 'Millega te koju sõitsite?|Millega sa koju sõitsid?'], ['Koristaja tuli kell pool seitse.', 'Millal …?', 'Millal koristaja tuli?']]),
      B.listening('076_t_listen', 'Kuula juhataja sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere kõigile! Siin Margit, teie juhataja.', 'Mul on hea uudis. Arvuti on leitud!', 'Eile õhtul koristas koristaja minu kabinetti.', 'Ta nägi arvutit laual ja pani selle kappi.', 'Vabandust kõigile! Täna toon ma tööle kooki.',
      ], ['Arvuti on [leitud].', 'Kabinetti koristas eile [koristaja].', 'Koristaja pani arvuti [kappi].', 'Juhataja toob täna [kooki].', 'Sõnumi jätab juhataja [Margit].', 'Margitil on hea [uudis].', 'Koristaja nägi arvutit [laual].', 'Margit ütleb kõigile [vabandust].']),
      B.rolecards('076_t_roles', 'Juhataja küsimused.', 'A on juhataja, B on töötaja. Siis vahetage.',
        'Oled juhataja. Küsi viis küsimust: kus, mis kell, mida tegi, keda nägi.', 'Oled töötaja. Vasta lihtminevikus. Kasuta ka eitust: ma ei olnud…',
        ['Kus te eile olite?', 'Mis kell te lahkusite?', 'Keda te nägite?'], ['Ma olin…', 'Ma lahkusin…', 'Ma ei näinud…']),
      B.speaking('076_t_say', 'Räägi lugu.', 'Räägi sõbrale, mis tööl juhtus. Kasuta lihtminevikku.', ['Mis kadus?', 'Mida juhataja küsis?', 'Mida sina eile tegid?', 'Kuidas lugu lõppes?'], [60, 120]),
      B.letter('076_t_letter', 'Kiri juhatajale.', 'Kirjuta juhatajale 40–60 sõna: mida sa eile tegid ja mida nägid.', 'Tere!', 'Lugupidamisega', [40, 60]),
      B.rubric('076_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Vastused on lihtminevikus: olin, tulin, läksin, tegin, nägin.', 'Eitus on õige: ei olnud, ei näinud, ei teinud.', 'Kirjas on aeg, koht ja tegevus.', 'Suuline lugu on arusaadav ja järjekorras.']),
      B.selfcheck('076_t_self', ['Ma saan aru, mida kolleegid eile tegid.', 'Ma vastan küsimustele lihtminevikus.', 'Ma ütlen, mida ma ei teinud.', 'Ma kirjutan juhatajale oma päevast.'], 'Alibi on olemas'),
    ],
  },

  'a2-077': {
    title: 'Mis eile juhtus?',
    canDo: 'Ma räägin hiljutisest sündmusest 8 seotud lausega õiges järjekorras (eile, kõigepealt, siis, pärast seda, äkki, lõpuks) ja vastan küsimustele detailide kohta.',
    template: 'v3',
    discover: [
      B.text('077_d_situation', 'Telefonikõne', 'Õhtul helistab Kristel sõbrannale Liisile. „Kas sa kuulsid, mis eile juhtus? Jaan kukkus rattaga!” Liis on ehmunud. Ta tahab kõike täpselt teada.'),
      B.choice('077_d_choice', 'Vali sobiv sõna.', 'Vali lünka sobiv ajasõna.', [
        ['Ma ärkasin kell seitse. ___ jõin kohvi.', 'Siis', 'Eile', 'Homme'], ['Ma kõndisin pargis. ___ hakkas sadama!', 'Äkki', 'Lõpuks', 'Kõigepealt'], ['___ läksin poodi, siis koju.', 'Kõigepealt', 'Lõpuks', 'Äkki'],
        ['Otsisin võtmeid kaks tundi. ___ leidsin need!', 'Lõpuks', 'Kõigepealt', 'Homme'], ['Kaotasin telefoni. ___ leidis naaber selle.', 'Õnneks', 'Kahjuks', 'Kõigepealt'], ['Läksin poodi, aga ___ oli see kinni.', 'kahjuks', 'õnneks', 'kõigepealt'], ['Ma jäin bussist maha. ___ tuli kohe järgmine buss.', 'Õnneks', 'Kahjuks', 'Kõigepealt'], ['Ma tahtsin ujuma minna, aga ___ oli bassein kinni.', 'kahjuks', 'õnneks', 'lõpuks']], 'full', 'g_notice'),
      B.reading('077_d_read', 'Loe: Jaani sõnum.', 'Loe sõnumit ja vasta küsimustele.', 'Head kolleegid!',
        'Head kolleegid! Täna ma tööle ei tule. Eile hommikul juhtus mul väike õnnetus. Ma sõitsin rattaga tööle. Pargi juures jooksis äkki tee peale suur koer. Ma pidurdasin, aga kukkusin. Kõigepealt ei saanud ma aru, mis juhtus. Siis tuli üks naine ja aitas mind üles. Pärast seda helistasin naisele Kristelile. Kristel viis mind arsti juurde. Arst tegi röntgeni. Õnneks ei ole käsi katki, aga see valutab. Ratas on ka natuke katki. Lõpuks tuli koera omanik. See oli suur üllatus. Ta oli minu vana koolivend Peeter! Ta maksab ratta parandamise eest. Homme tulen jälle tööle. Jaan',
        [['Miks Jaan täna tööle ei tule?', 'tal juhtus õnnetus|ta kukkus rattaga|käsi valutab'], ['Kus õnnetus juhtus?', 'pargi juures'], ['Kes aitas Jaani üles?', 'üks naine|naine'], ['Kellele Jaan helistas?', 'Kristelile|naisele|oma naisele|naisele Kristelile'], ['Mida arst ütles?', 'käsi ei ole katki'], ['Kes oli koera omanik?', 'Jaani vana koolivend|Peeter|tema koolivend Peeter'], ['Kes maksab ratta parandamise eest?', 'Peeter|koera omanik'], ['Mida arst tegi?', 'tegi röntgeni|röntgeni']]),
      B.notice('077_d_notice', 'Märka: kuidas lugu rääkida?', ['Algus: **Eile hommikul…** **Pargi juures…**', 'Järjekord: **kõigepealt → siis → pärast seda → lõpuks**', 'Ootamatu asi: **Äkki** jooksis koer tee peale.', 'Tunne: **Õnneks… / Kahjuks…** See oli suur **üllatus**!', 'Ajasõna järel on tegusõna: **Siis tuli** üks naine. (mitte: Siis üks naine tuli)'], 'full'),
      B.gaps('077_d_gaps', 'Täida lugu.', 'Vali sõnapangast sobiv sõna. Kaks sõna jääb üle.', ['Eile [juhtus] minuga naljakas lugu.', '[Kõigepealt] kaotasin bussis kindad.', 'Siis [kukkusin] trepil.', '[Pärast seda] jäin bussist maha.', '[Õnneks] tuli kohe uus buss.', '[Lõpuks] jõudsin tööle.', 'Ma loodan, et [homme] on parem päev.', 'Talvel ma [kukun] tihti libedal teel.'], ['juhtus', 'kõigepealt', 'kukkusin', 'pärast seda', 'õnneks', 'lõpuks', 'homme', 'kukun', 'eile', 'lõpus']),
      B.translation('077_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Что вчера случилось?', 'Сначала я потерял ключи.', 'Вдруг пошёл дождь.', 'После этого я позвонил другу.', 'Наконец я пришёл домой.', 'В прошлую пятницу у Софии был день рождения.', 'Вдруг включился свет.', 'Это был большой сюрприз!']),
      B.dictation('077_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Mis eile juhtus?', 'Äkki jooksis tee peale koer.', 'Kõigepealt helistas ta mulle.', 'Pärast seda läksime apteeki.', 'See oli suur üllatus.', 'Eile hommikul sõitis Jaan rattaga tööle.', 'Õnneks ei ole käsi katki.', 'Lõpuks tuli koera omanik.'], 8),
      B.speaking('077_d_say', 'Jutusta Jaani lugu.', 'Räägi Jaani lugu oma sõnadega. Kasuta ajasõnu.', ['Millal ja kus?', 'Mis juhtus kõigepealt?', 'Mis juhtus siis?', 'Kuidas lugu lõppes?'], [60, 90], ['eile hommikul', 'äkki', 'kõigepealt', 'lõpuks']),
      B.writing('077_d_write', 'Väike õnnetus.', 'Kirjuta 6–8 lauset: mis sinuga või sõbraga kord juhtus.', [6, 8], ['eile', 'kõigepealt', 'siis', 'lõpuks'], 3),
    ],
    practice: [
      B.reading('077_p_story', 'Loe: Sofia sünnipäev.', 'Loe lugu ja vasta küsimustele.', 'Üllatus', [
        'Eelmisel reedel oli Sofia sünnipäev. Hommikul oli ta natuke kurb, sest keegi ei õnnitlenud teda. Ülikoolis olid kursusekaaslased väga vaiksed. Lõunal sõi Sofia üksi.',
        'Õhtul helistas Markus: „Kas sa saad kell seitse kohvikusse tulla? Mul on üks küsimus.”',
        'Sofia läks kohvikusse. Kõigepealt oli kohvikus pime. Äkki läksid tuled põlema. Kõik sõbrad hüüdsid: „Palju õnne!”',
        'See oli suur üllatus! Siis tõi Anna lauale suure tordi. Pärast seda laulsid kõik. Sofia sai palju kingitusi. Kati andis talle raamatu, Jaan lilled. Lõpuks tantsisid nad kella üheni.',
      ], [['Miks oli Sofia hommikul kurb?', 'keegi ei õnnitlenud teda'], ['Kes helistas Sofiale õhtul?', 'Markus'], ['Mis kell pidi Sofia kohvikusse tulema?', 'kell seitse|seitse|7'], ['Mis juhtus, kui tuled põlema läksid?', 'kõik hüüdsid palju õnne|sõbrad hüüdsid palju õnne'], ['Mida Kati kinkis?', 'raamatu|raamatu'], ['Kui kaua nad tantsisid?', 'kella üheni|üheni'], ['Kellega sõi Sofia lõunat?', 'üksi|ta sõi üksi'], ['Mida Jaan kinkis?', 'lilled|lilli']]),
      B.cloze('077_p_cloze', 'Jaani tänukiri.', 'Vali igasse lünka sobiv sõna.', 'Tere, Peeter!', [
        'Aitäh, et sa eile mind {*aitasid|aitad|aitama}!',
        '',
        '{*Kõigepealt|Lõpuks|Homme} olin ma väga ehmunud, aga sa olid väga lahke. Sinu koer {*jooksis|jookseb|jooksma} väga kiiresti!',
        '',
        'Arst {*ütles|ütleb|ütlema}, et käsi ei ole katki. {*Õnneks|Kahjuks|Äkki} saan ma juba homme tööle minna.',
        '',
        'Ratas on parandamisel. Meister {*lubas|lubab|lubama} selle reedeks valmis teha. {*Pärast seda|Enne|Eile} saame kokku ja jalutame koos sinu koeraga. {*Tervitades|Lugupidamisega|Austusega}, Jaan',
      ], 'g_vocab'),
      B.formtext('077_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', 'Liisi õnnetu hommik', [
        'Eile hommikul [jäi] (jääma) Liis bussist maha.',
        '',
        'Kõigepealt ta [ootas] (ootama) järgmist bussi pool tundi. Siis [hakkas] (hakkama) sadama.',
        '',
        'Äkki [nägi] (nägema) ta, et vihmavari jäi koju. Pärast seda [helistas] (helistama) ta Annale.',
        '',
        'Anna [tuli] (tulema) autoga ja [viis] (viima) Liisi tööle. Lõpuks [jõudis] (jõudma) Liis tööle õigel ajal.',
      ], 'g_notice'),
      B.gaps('077_p_gaps', 'Kirjuta lihtminevikus.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', ['Eelmisel reedel [oli] (olema) Sofia sünnipäev.', 'Õhtul [helistas] (helistama) Markus.', 'Sofia [läks] (minema) kohvikusse.', 'Äkki [läksid] (minema) tuled põlema.', 'Anna [tõi] (tooma) suure tordi.', 'Kati [andis] (andma) talle raamatu.', 'Nad [tantsisid] (tantsima) kella üheni.', 'Kõigepealt buss ei [tulnud] (tulema).']),
      B.transformation('077_p_trans', 'Pane ajasõna ette.', 'Alusta lauset antud sõnaga.', [
        ['Sofia läks kohvikusse.', 'Siis …', 'Siis läks Sofia kohvikusse.'], ['Tuled läksid põlema.', 'Äkki …', 'Äkki läksid tuled põlema.'], ['Anna tõi tordi.', 'Pärast seda …', 'Pärast seda tõi Anna tordi.'],
        ['Nad tantsisid kella üheni.', 'Lõpuks …', 'Lõpuks tantsisid nad kella üheni.'], ['Ma kaotasin võtmed.', 'Eile …', 'Eile kaotasin ma võtmed.'], ['Naaber leidis need.', 'Õnneks …', 'Õnneks leidis naaber need.'], ['Ma leidsin rahakoti.', 'Lõpuks …', 'Lõpuks leidsin ma rahakoti.'], ['Hakkas sadama.', 'Äkki …', 'Äkki hakkas sadama.']]),
      B.errorfix('077_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Siis Sofia läks kohvikusse.', 'Siis läks Sofia kohvikusse.'], ['Äkki tuled läksid põlema.', 'Äkki läksid tuled põlema.'], ['Lõpuks me tantsime kella üheni.', 'Lõpuks tantsisime me kella üheni.|Lõpuks me tantsisime kella üheni.'], ['Eile ma kukun trepil.', 'Eile kukkusin ma trepil.|Eile ma kukkusin trepil.'], ['Pärast seda Jaan helistas Kristelile.', 'Pärast seda helistas Jaan Kristelile.'], ['Eile ma ei tulin peole.', 'Eile ma ei tulnud peole.|Eile ei tulnud ma peole.'], ['Kõigepealt buss ei tulnud ja ma ootan.', 'Kõigepealt buss ei tulnud ja ma ootasin.'], ['Siis ma läksin koju tagasi ja võtsin kingitus.', 'Siis läksin ma koju tagasi ja võtsin kingituse.|Siis ma läksin koju tagasi ja võtsin kingituse.']]),
      B.listening('077_d_listen', 'Kuula Liisi lugu.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis. Eile juhtus minuga üks üllatus.', 'Hommikul kaotasin oma rahakoti.', 'Kõigepealt otsisin seda kodus, aga ei leidnud.', 'Siis läksin poodi, kus ma eile käisin.',
        'Müüja ütles, et keegi tõi rahakoti tagasi.', 'Pärast seda helistasin sellele inimesele.', 'Lõpuks sain teada: see oli minu naaber Viktor!',
      ], ['Liis kaotas oma [rahakoti].', 'Kõigepealt otsis ta seda [kodus].', 'Siis läks ta [poodi].', 'Rahakoti tõi tagasi [Viktor|naaber Viktor|naaber].', 'Pärast seda Liis [helistas] sellele inimesele.', 'Liisiga juhtus eile üks [üllatus].', 'Liis käis eile [poes].', 'Rahakoti tõi tagasi Liisi [naaber].']),
      B.rolecards('077_p_roles', 'Mis sinuga juhtus?', 'A jutustab, B küsib detaile. Siis vahetage.',
        'Jutusta lühike lugu: kaotasid midagi või juhtus väike õnnetus.', 'Kuula ja küsi vähemalt neli detaili: millal, kus, miks, kuidas lõppes.',
        ['Eile…', 'Äkki…', 'Õnneks…'], ['Millal see juhtus?', 'Mida sa siis tegid?', 'Kuidas see lõppes?']),
      B.speaking('077_p_say', 'Sofia sünnipäev.', 'Jutusta Sofia sünnipäeva lugu. Kasuta ajasõnu.', ['Kuidas päev algas?', 'Mis juhtus õhtul?', 'Mis oli üllatus?', 'Kuidas õhtu lõppes?'], [60, 90]),
    ],
    transfer: [
      B.text('077_t_situation', 'Uus olukord', 'Eile oli Markuse sünnipäevapidu. Sina lubasid tulla kell seitse, aga sa ei jõudnud. Teel juhtus palju asju. Täna helistab Markus ja küsib: „Mis eile juhtus?”'),
      B.listening('077_t_listen', 'Kuula Markuse häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Markus.', 'Kus sa oled? Kell on juba kaheksa.', 'Kõik külalised on siin. Me ootame sind.', 'Anna tõi tordi ja Jaan tegi salatit.', 'Palun helista mulle, ma olen mures!',
      ], ['Kell on juba [kaheksa|8].', 'Kõik [külalised] on kohal.', 'Anna tõi [tordi].', 'Jaan tegi [salatit].', 'Markus on [mures].', 'Sõnumi jätab [Markus].', 'Markus küsib: kus sa [oled]?', 'Kõik [ootavad] sind.']),
      B.manymatch('077_t_match', 'Mis juhtus ja mis siis?', 'Ühenda sündmus ja tagajärg.', ['Buss ei tulnud.', 'Kingitus jäi koju.', 'Telefon sai tühjaks.', 'Sa jäid bussis magama.', 'Sa sõitsid lõpp-peatusse.', 'Sa jõudsid koju alles hilja.', 'Sa vabandasid Markuse ees.', 'Sa pakkusid uut aega.'], ['Sa pidid ootama pool tundi.', 'Sa läksid koju tagasi.', 'Sa ei saanud Markusele helistada.', 'Sa ei näinud oma peatust.', 'Sa ei jõudnud peole.', 'Sa olid väga väsinud.', 'Markus ei olnud enam kurb.', 'Te saite kokku järgmisel päeval.'], 'full', 'g_read'),
      B.wordorder('077_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Eile juhtus minuga palju asju.', 'Kõigepealt ei tulnud buss.', 'Pärast seda läksin ma koju tagasi.', 'Lõpuks jäin ma bussis magama.', 'Kas ma võin homme tulla?', 'Siis sai mu telefon tühjaks.', 'Õnneks ei olnud Markus kaua kurb.', 'Me saime kokku järgmisel päeval.']),
      B.speaking('077_t_call', 'Kõne Markusele.', 'Räägi Markusele 1–2 minutit, mis eile juhtus.', ['Vabanda.', 'Räägi lugu järjekorras.', 'Paku uut kohtumist.', 'Ütle, mis juhtus kõigepealt.', 'Ütle, kuidas lugu lõppes.'], [60, 120], ['kõigepealt', 'siis', 'äkki', 'lõpuks']),
      B.rolecards('077_t_roles', 'Markus küsib.', 'A on Markus, B räägib. Siis vahetage.',
        'Oled Markus. Sa oled natuke kurb. Küsi detaile: miks, mis kell, kus.', 'Räägi, mis eile juhtus. Vabanda ja paku uut aega.',
        ['Miks sa ei helistanud?', 'Mis kell see oli?', 'Ja mis siis juhtus?'], ['Kõigepealt…', 'Siis…', 'Vabandust, et…']),
      B.writing('077_t_write', 'Vabandussõnum.', 'Kirjuta Markusele 7–9 lauset: mis juhtus ja mida sa pakud.', [7, 9], ['vabandust', 'kõigepealt', 'siis', 'lõpuks'], 3),
      B.rubric('077_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Lugu on õiges järjekorras: kõigepealt, siis, pärast seda, lõpuks.', 'Tegusõnad on lihtminevikus ja ajasõna järel teisel kohal.', 'Sõnumis on vabandus, lugu ja uus pakkumine.', 'Kõnes vastab õpilane küsimustele detailidega.']),
      B.selfcheck('077_t_self', ['Ma teen märkmetest loo.', 'Ma räägin loo telefonis järjekorras.', 'Ma vastan küsimustele detailidega.', 'Ma kirjutan vabandussõnumi.'], 'Lugu on räägitud'),
    ],
  },

  'a2-078': {
    title: 'Lühike lugu minevikus',
    canDo: 'Ma loen 150–180-sõnalist lugu minevikus, vastan küsimustele kes, kus, millal, mis juhtus ja miks ning panen kuus sündmust õigesse järjekorda.',
    template: 'v3',
    discover: [
      B.text('078_d_intro', 'Liisi sõnum', 'Liis kirjutab õhtul sõbrannale Sofiale: „Täna oli kummaline päev! Ma unustasin oma koti bussi. Kotis olid rahakott, võtmed ja sülearvuti. Õnneks leidis bussijuht koti üles. Õhtul sain koti tagasi.”'),
      B.truefalse('078_d_tf', 'Mis juhtus?', 'Loe Liisi sõnumit. Õige või vale?', [
        ['Liis unustas koti bussi.', true], ['Kotis oli ainult telefon.', false], ['Koti leidis bussijuht.', true],
        ['Liis sai koti tagasi järgmisel päeval.', false], ['See juhtus täna.', true], ['Liis oli bussis väsinud.', true], ['Liis sõitis bussijaama taksoga.', true], ['Takso oli tasuta.', false]]),
      B.reading('078_d_read', 'Loe: kadunud kott.', 'Loe lugu ja vasta küsimustele.', 'Kadunud kott', [
        'Eelmisel reedel sõitis Liis pärast tööd bussiga koju. Ta oli väga väsinud, sest tööpäev oli pikk. Bussis luges ta telefonist uudiseid. Siis helistas tema ema ja nad rääkisid kaua. Äkki nägi Liis, et buss on juba tema peatuses. Ta hüppas kiiresti bussist välja.',
        'Kodu ukse ees otsis ta võtmeid, aga kotti ei olnud! Kott jäi bussi istmele. Kotis olid rahakott, võtmed ja töö sülearvuti. Liis ei saanud ilma võtmeteta koju minna. Ta oli väga mures. Õnneks oli telefon tal käes.',
        'Kõigepealt helistas ta bussifirmasse. Töötaja ütles, et bussijuht vaatab bussi lõpp-peatuses üle. Liis ootas naabri juures pool tundi. Naaber Viktor pakkus talle teed. Siis tuli bussifirmast sõnum: kott on leitud! Pärast seda sõitis Liis taksoga bussijaama. Takso maksis kaksteist eurot, aga Liis oli õnnelik. Bussijuht andis talle koti kätte. Kõik asjad olid alles. Liis tänas juhti ja ostis talle šokolaadi. Lõpuks jõudis ta koju alles kell kümme õhtul. Nüüd hoiab ta kotti bussis alati süles.',
      ], [
        ['Millal see lugu juhtus?', 'eelmisel reedel|reedel|reede õhtul'],
        ['Miks Liis oma peatust kohe ei märganud?', 'ta rääkis emaga telefonis|ta rääkis emaga|ema helistas'],
        ['Kus Liis märkas, et kotti ei ole?', 'kodu ukse ees|ukse ees'],
        ['Miks ei saanud Liis koju minna?', 'võtmed olid kotis|tal ei olnud võtmeid'],
        ['Kuhu Liis kõigepealt helistas?', 'bussifirmasse|bussifirmale'],
        ['Kuidas Liis bussijuhti tänas?', 'ostis talle šokolaadi|andis šokolaadi|šokolaadiga'], ['Kelle juures Liis ootas?', 'naabri juures|Viktori juures|naabri Viktori juures'], ['Kui palju takso maksis?', 'kaksteist eurot|12 eurot']]),
      B.notice('078_d_notice', 'Märka: kuidas lugu liigub?', ['**Kõigepealt** helistas ta bussifirmasse.', '**Siis** tuli sõnum.', '**Pärast seda** sõitis ta taksoga.', '**Lõpuks** jõudis ta koju.', '**Äkki** nägi Liis oma peatust.', '**Õnneks** oli telefon käes.'], 'full'),
      B.gaps('078_d_gaps', 'Markuse lugu.', 'Kirjuta sobiv sõna. Kaks sõna jääb üle.', ['[Laupäeval] läks Markus metsa seenele.', '[Kõigepealt] sõitis ta autoga metsa äärde.', '[Siis|Pärast seda] kõndis ta kaks tundi metsas.', '[Äkki] hakkas tugevalt sadama.', '[Õnneks] oli tal vihmajope kaasas.', '[Pärast seda|Siis] leidis ta palju seeni.', '[Lõpuks] jõudis ta õhtul koju.', '[Kahjuks] olid seened väga väikesed.'], ['laupäeval', 'kõigepealt', 'siis', 'äkki', 'õnneks', 'pärast seda', 'lõpuks', 'kahjuks', 'homme', 'eile']),
      B.errorfix('078_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Eile ma lähen kinno.', 'Eile läksin ma kinno.|Eile ma läksin kinno.'], ['Ta tulis koju hilja.', 'Ta tuli koju hilja.'], ['Me nägisime head filmi.', 'Me nägime head filmi.'], ['Ma ei leidsin võtmeid.', 'Ma ei leidnud võtmeid.'], ['Siis Liis helistas emale.', 'Siis helistas Liis emale.'], ['Eile Markus ärkas hilja.', 'Eile ärkas Markus hilja.'], ['Ta ei ärkasin õigel ajal.', 'Ta ei ärganud õigel ajal.'], ['Bussis ta märkas sokke.', 'Bussis märkas ta sokke.']]),
      B.translation('078_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера я забыла сумку в автобусе.', 'К счастью, водитель нашёл сумку.', 'Сначала я позвонила в фирму.', 'Потом я ждала полчаса.', 'Наконец я пришла домой.', 'Утром я проснулся слишком поздно.', 'К сожалению, автобус уже уехал.', 'Я позвонил начальнику.']),
      B.speaking('078_d_say', 'Jutusta lugu ümber.', 'Räägi Liisi lugu oma sõnadega. Kasuta loo plaani.', ['Kes? Kus? Millal?', 'Mis juhtus?', 'Mida Liis tegi?', 'Kuidas lugu lõppes?'], [60, 90], ['kõigepealt', 'siis', 'äkki', 'õnneks', 'lõpuks']),
      B.writing('078_d_write', 'Minu kummaline päev.', 'Kirjuta 6–8 lauset ühest päevast, kui midagi juhtus.', [6, 8], ['kõigepealt', 'siis', 'äkki', 'lõpuks'], 3),
    ],
    practice: [
      B.cloze('078_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Viktori kadunud prillid', [
        'Eile hommikul {*otsis|otsib|otsima} Viktor oma prille. Kõigepealt vaatas ta {*laual|laud|lauale}, siis köögis.',
        '',
        'Prille {*ei olnud|ei ole|ei oleks} kusagil. Viktor oli väga {*mures|mure|muresse}, sest ilma prillideta ta hästi ei näe.',
        '',
        '{*Siis|Eile|Homme} helistas ta Galinale. Galina naeris: „Vaata {*peeglisse|peegel|peeglis}!”',
        '',
        'Prillid olid Viktori peas! {*Õnneks|Kahjuks|Äkki} lõppes kõik hästi. Õhtul {*rääkis|räägib|rääkima} Viktor seda lugu naabritele.',
      ], 'g_vocab'),
      B.choice('078_p_forms', 'Vali õige vorm.', 'Vali lausesse sobiv tegusõna vorm.', [['Eile … Liis bussiga koju.', 'sõitis', 'sõidab', 'sõitma'], ['Eile õhtul … bussijuht koti.', 'leidis', 'leiab', 'leida'], ['Me … eile kaua telefonis.', 'rääkisime', 'räägime', 'rääkisid'], ['Kas sa … eile poes?', 'käisid', 'käid', 'käisime'], ['Eile … nad koju alles kell kümme.', 'jõudsid', 'jõuavad', 'jõudis'], ['Liis … eile oma peatust.', 'ei märganud', 'ei märka', 'ei märkas'], ['Milline pealkiri sobib loole kõige paremini?', 'Kott jäi bussi', 'Liisi uus töö', 'Ema sünnipäev'], ['Miks Liis kiiresti bussist välja hüppas?', 'Buss oli juba tema peatuses.', 'Bussis oli väga palav.', 'Ema ootas teda peatuses.']], 'full', 'g_notice'),
      B.formtext('078_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', 'Sofia unustas telefoni', [
        'Eelmisel nädalal [unustas] (unustama) Sofia oma telefoni bussi.',
        '',
        'Kõigepealt ta [ei märganud] (märkama, eitus) midagi. Kodus [otsis] (otsima) ta telefoni kaua.',
        '',
        'Siis [laenas] (laenama) ta naabri telefoni ja [helistas] (helistama) bussifirmasse.',
        '',
        'Õnneks [leidis] (leidma) bussijuht telefoni. Järgmisel päeval [sai] (saama) Sofia selle tagasi ja [tänas] (tänama) juhti.',
      ], 'g_notice'),
      B.gaps('078_p_gaps', 'Sofia reis.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', ['Eelmisel laupäeval [sõitis] (sõitma) Sofia rongiga Tartusse.', 'Rongis [luges] (lugema) ta raamatut.', 'Tartus [ootas] (ootama) teda vana sõbranna.', 'Nad [jõid] (jooma) kohvikus kohvi.', 'Õhtul [läksid] (minema) nad teatrisse.', 'Sofia [tuli] (tulema) koju alles pühapäeval.', 'Pühapäeval [läks] (minema) Jaan koeraga parki.', 'Koer [nägi] (nägema) oravat.']),
      B.reading('078_p_read', 'Loe: Markuse halb hommik.', 'Loe lugu ja vasta küsimustele.', 'Halb hommik', [
        'Teisipäeva hommikul ärkas Markus liiga hilja. Tema äratuskell ei helisenud, sest telefon oli tühi. Ta pani kiiresti riided selga ja jooksis bussipeatusse. Kahjuks sõitis buss just minema. Järgmine buss tuli alles kahekümne minuti pärast. Markus helistas oma ülemusele ja ütles, et jääb hiljaks. Ülemus vastas, et see ei ole probleem.',
        'Bussis märkas Markus, et tal on jalas eri värvi sokid. Üks oli must, teine sinine. Tööl naersid kolleegid tema üle, aga ka Markus ise naeris. Lõuna ajal ostis ta poest uued sokid. Õhtul laadis ta telefoni täis ja pani kella helisema kaks korda.',
      ], [
        ['Miks äratuskell ei helisenud?', 'telefon oli tühi'], ['Miks ei saanud Markus esimese bussiga sõita?', 'buss sõitis just minema|buss läks ära|ta jäi hiljaks'],
        ['Kui kaua ootas ta järgmist bussi?', 'kakskümmend minutit|20 minutit'], ['Mida Markus bussis märkas?', 'tal olid eri värvi sokid|sokid olid eri värvi'],
        ['Mida tegi Markus lõuna ajal?', 'ostis uued sokid'], ['Mida tegi Markus õhtul teisiti?', 'laadis telefoni täis|pani kella helisema kaks korda'], ['Mis värvi olid Markuse sokid?', 'must ja sinine|üks must, teine sinine'], ['Mida ülemus vastas?', 'see ei ole probleem|et see ei ole probleem']]),
      B.truefalse('078_p_tf', 'Õige või vale?', 'Loe Markuse lugu uuesti.', [
        ['Markus ärkas õigel ajal.', false], ['Markus helistas ülemusele.', true], ['Ülemus oli väga vihane.', false],
        ['Markuse sokid olid eri värvi.', true], ['Kolleegid naersid Markuse üle.', true], ['Järgmine buss tuli kahekümne minuti pärast.', true], ['Markus ostis lõunal uue telefoni.', false], ['Ka Markus ise naeris.', true]]),
      B.transformation('078_p_trans', 'Täna → eile.', 'Kirjuta lause minevikus.', [
        ['Täna ärkan ma vara.', 'Eile …', 'Eile ärkasin ma vara.|Eile ma ärkasin vara.'],
        ['Täna läheb ta bussiga tööle.', 'Eile …', 'Eile läks ta bussiga tööle.|Eile ta läks bussiga tööle.'],
        ['Täna ei helista ema.', 'Eile …', 'Eile ei helistanud ema.|Eile ema ei helistanud.'],
        ['Täna sööme kodus.', 'Eile …', 'Eile sõime kodus.|Eile me sõime kodus.'],
        ['Täna nad naeravad palju.', 'Eile …', 'Eile naersid nad palju.|Eile nad naersid palju.'], ['Täna ostan ma sokke.', 'Eile …', 'Eile ostsin ma sokke.|Eile ma ostsin sokke.'], ['Täna jookseb ta bussi peale.', 'Eile …', 'Eile jooksis ta bussi peale.|Eile ta jooksis bussi peale.'], ['Täna ei näe ma Liisi.', 'Eile …', 'Eile ei näinud ma Liisi.|Eile ma ei näinud Liisi.']]),
      B.dictation('078_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Markus ärkas liiga hilja.', 'Telefon oli tühi.', 'Buss sõitis just minema.', 'Ta helistas ülemusele.', 'Kolleegid naersid tema üle.', 'Õhtul laadis ta telefoni.', 'Eile juhtus midagi kummalist.', 'Liis unustas koti bussi.']),
      B.speaking('078_p_say', 'Mis sinuga juhtus?', 'Räägi paarilisele hommikust, kui kõik läks valesti.', ['Millal see oli?', 'Mis juhtus kõigepealt?', 'Mida sa tegid?', 'Kuidas päev lõppes?'], [60, 90], ['kõigepealt', 'kahjuks', 'siis', 'lõpuks']),
    ],
    transfer: [
      B.text('078_t_situation', 'Uus olukord', 'Kursusel on „Lugude õhtu”. Iga õpilane räägib ühe lühikese loo, mis temaga päriselt juhtus. Kõigepealt kuulad Jaani lugu. Siis valmistad ette oma loo.'),
      B.wordorder('078_t_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Eelmisel pühapäeval läksin ma parki.', 'Äkki jooksis koer metsa poole.', 'Kõigepealt otsisin ma teda üksi.', 'Õnneks helistas mulle üks naine.', 'Lõpuks lõppes kõik hästi.', 'Naine luges numbri koera kaelarihmalt.', 'Markus tuli appi ja me otsisime koos.', 'Nüüd hoian ma Mukit pargis rihma otsas.']),
      B.listening('078_t_listen', 'Kuula: Jaani lugu.', 'Õpetaja loeb loo kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Jaan. Ma räägin teile ühe loo.',
        'Eelmisel pühapäeval läksin oma koeraga parki. Koera nimi on Muki. Ilm oli ilus ja pargis oli palju inimesi.',
        'Ma võtsin Mukilt rihma ära. Äkki nägi Muki oravat ja jooksis metsa poole. Ma hüüdsin teda, aga ta ei tulnud tagasi.',
        'Kõigepealt otsisin teda üksi. Siis helistasin oma naabrile Markusele. Markus tuli appi ja me otsisime koos üks tund. Ma olin väga mures.',
        'Lõpuks helistas mulle üks võõras naine. Muki oli tema aias ja sõi kassi toitu! Naine luges minu numbrit koera kaelarihmalt.',
        'Õnneks lõppes kõik hästi. Nüüd hoian Mukit pargis alati rihma otsas.',
      ], [
        'Jaan läks eelmisel [pühapäeval] parki.', 'Muki jooksis ära, sest ta nägi [oravat].', 'Abi saamiseks helistas Jaan [naabrile|Markusele].',
        'Mehed otsisid koera [üks tund|tund aega|tund].', 'Lõpuks oli koer võõra naise [aias].', 'Naine leidis numbri koera [kaelarihmalt|kaelarihmast].', 'Jaani koera nimi on [Muki].', 'Muki sõi naise aias [kassi] toitu.']),
      B.speaking('078_t_tell', 'Lugude õhtu.', 'Jutusta grupile oma lugu 1–2 minutit.', ['Kes? Kus? Millal?', 'Mis juhtus?', 'Mida sa tegid?', 'Kuidas lugu lõppes?', 'Mida sa sellest õppisid?'], [60, 120], ['kõigepealt', 'siis', 'äkki', 'õnneks', 'lõpuks']),
      B.rolecards('078_t_roles', 'Kuulaja küsib.', 'A jutustab, B küsib. Siis vahetage.',
        'Jutusta oma lugu. Vasta igale küsimusele.', 'Kuula ja küsi vähemalt 4 küsimust.',
        ['Eelmisel nädalal…', 'Äkki…', 'Lõpuks…'], ['Millal see juhtus?', 'Kus sa olid?', 'Miks see juhtus?', 'Mida sa siis tegid?']),
      B.writing('078_t_write', 'Minu lugu kursuse lehele.', 'Kirjuta oma lugu 6–8 lausega.', [6, 8], ['kõigepealt', 'siis', 'äkki', 'lõpuks'], 3),
      B.letter('078_t_msg', 'Sõnum sõbrale.', 'Kirjuta sõbrale: mis eile juhtus, kus, kuidas see lõppes.', 'Tere, Sofia!', 'Kuidas sinul läheb?', [40, 60]),
      B.rubric('078_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Lool on algus, keskosa ja lõpp.', 'Tegusõnad on lihtminevikus, ka eitus (ei leidnud).', 'Ajasõnad näitavad järjekorda ja tegusõna on teisel kohal.', 'Kuulaja küsimustele vastatakse.']),
      B.selfcheck('078_t_self', ['Ma saan aru lühikesest kuuldud loost.', 'Ma teen oma loole plaani.', 'Ma jutustan loo 1–2 minutit.', 'Ma kirjutan loo 6–8 lausega.'], 'Lugu on räägitud'),
    ],
  },

  'a2-079': {
    title: 'Kogemus: olen käinud',
    canDo: 'Ma räägin oma kogemustest 4–5 mudeliga (olen käinud, olen näinud, olen proovinud, ei ole veel …) ja küsin kaaslaselt „Kas sa oled kunagi …?”.',
    template: 'v3',
    discover: [
      B.text('079_d_intro', 'Lõunapausil', 'Markus küsib uuelt kolleegilt Andreilt: „Kas sa oled kunagi Saaremaal käinud?” Andrei vastab: „Jah, olen käinud kaks korda. Viimati käisin seal eelmisel suvel. Aga talisuplust ma ei ole veel proovinud.”'),
      B.reading('079_d_read', 'Loe: lõunapausi jutt.', 'Loe vestlust ja vasta küsimustele.', 'Kas sa oled kunagi…?', [
        'Markus: Andrei, kas sa oled kunagi Saaremaal käinud?',
        'Andrei: Jah, olen käinud kaks korda. Viimati käisin seal eelmisel suvel.',
        'Markus: Mis sulle seal meeldis?',
        'Andrei: Meri ja vanad tuuleveskid. Seal sõin ma esimest korda suitsukala.',
        'Markus: Kas sa oled Kihnus ka käinud?',
        'Andrei: Ei, seal ma ei ole veel käinud. Aga ma tahan minna.',
        'Markus: Mina olen Kihnus käinud üks kord. See oli kümme aastat tagasi.',
        'Andrei: Kas sa oled talisuplust proovinud?',
        'Markus: Ei, mitte kunagi! Vesi on liiga külm. Aga mu õde Kersti on proovinud mitu korda.',
        'Andrei: Kas sa oled metsas hunti näinud?',
        'Markus: Ei ole. Aga ma olen näinud põtra. See oli väga suur!',
      ], [
        ['Mitu korda on Andrei Saaremaal käinud?', 'kaks korda|2 korda'],
        ['Millal käis Andrei viimati Saaremaal?', 'eelmisel suvel'],
        ['Mida proovis Andrei Saaremaal esimest korda?', 'suitsukala|ta sõi suitsukala'],
        ['Kas Andrei on Kihnus käinud?', 'ei|ei ole|ei, veel mitte'],
        ['Kes Markuse perest on talisuplust proovinud?', 'Kersti|tema õde|õde Kersti'],
        ['Millist looma on Markus metsas näinud?', 'põtra|põder'], ['Mis Andreile Saaremaal meeldis?', 'meri ja vanad tuuleveskid|meri|tuuleveskid'], ['Millal käis Markus Kihnus?', 'kümme aastat tagasi']]),
      B.notice('079_d_notice', 'Märka: kogemus või kindel aeg?', ['Kas sa **oled** kunagi Saaremaal **käinud**? — kogemus elus', 'Jah, **olen käinud** kaks korda.', 'Viimati **käisin** seal **eelmisel suvel**. — kindel aeg', 'Seal ma **ei ole** veel **käinud**.', 'Ma **olen näinud** põtra.'], 'full'),
      B.choice('079_d_choice', 'Kumb vorm?', 'Vali lausesse õige vorm.', [
        ['Kas sa oled kunagi Pariisis …?', 'käinud', 'käisid', 'käima'],
        ['Eelmisel aastal ma … Pariisis.', 'käisin', 'olen käinud', 'käinud'],
        ['Ma ei ole seda filmi veel …', 'näinud', 'nägin', 'näen'],
        ['Eile ma … seda filmi kinos.', 'nägin', 'olen näinud', 'näinud'],
        ['Kas te olete sushit …?', 'proovinud', 'proovisite', 'proovima'], ['Ma ei ole kunagi Soomes ___.', 'käinud', 'käisin', 'käin'], ['Kolm aastat tagasi me ___ Pärnus.', 'elasime', 'oleme elanud', 'elanud'], ['Kas Anna on juba koju ___?', 'jõudnud', 'jõudis', 'jõuab']], 'full', 'g_notice'),
      B.transformation('079_d_trans', 'Küsi kogemuse kohta.', 'Tee lausest küsimus „Kas sa oled kunagi …?”.', [
        ['Ma käisin Riias.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi Riias käinud?'],
        ['Ma nägin hunti.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi hunti näinud?'],
        ['Ma sõin suitsukala.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi suitsukala söönud?'],
        ['Ma proovisin talisuplust.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi talisuplust proovinud?'],
        ['Ma elasin maal.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi maal elanud?'], ['Ma lugesin seda raamatut.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi seda raamatut lugenud?'], ['Ma sõitsin hobusega.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi hobusega sõitnud?'], ['Ma ujusin meres.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi meres ujunud?']]),
      B.errorfix('079_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma ei olen Kihnus käinud.', 'Ma ei ole Kihnus käinud.'], ['Kas sa oled kunagi suitsukala sõid?', 'Kas sa oled kunagi suitsukala söönud?'], ['Eile ma olen näinud põtra.', 'Eile nägin ma põtra.|Eile ma nägin põtra.'], ['Ta on proovinud talisuplus.', 'Ta on proovinud talisuplust.'], ['Me oleme käinud Saaremaal eelmisel suvel.', 'Me käisime Saaremaal eelmisel suvel.|Eelmisel suvel käisime Saaremaal.'], ['Ma ei olen Soomes käinud.', 'Ma ei ole Soomes käinud.'], ['Kas sa oled kunagi Pariisis käisid?', 'Kas sa oled kunagi Pariisis käinud?'], ['Eelmisel aastal ma olen käinud Riias.', 'Eelmisel aastal käisin ma Riias.|Eelmisel aastal ma käisin Riias.']]),
      B.translation('079_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Ты когда-нибудь был в Тарту?', 'Я ещё не пробовал этот суп.', 'Я видел этот фильм два раза.', 'В прошлом году я был в Риге.', 'Мы никогда не жили в деревне.', 'Ты когда-нибудь ездил на лошади?', 'Я ещё не был в Латвии.', 'В прошлом году мы были в Риге.']),
      B.speaking('079_d_say', 'Kas sa oled kunagi…?', 'Küsi paarilisel 5 küsimust. Vasta ka ise.', ['Kas sa oled kunagi Saaremaal käinud?', 'Kas sa oled talisuplust proovinud?', 'Kas sa oled põtra näinud?', 'Kas sa oled maal elanud?', 'Kas sa oled lennukiga lennanud?'], [60, 90], ['Jah, olen … kaks korda.', 'Ei, veel mitte.', 'Ei, mitte kunagi.', 'Viimati … eelmisel aastal.']),
      B.writing('079_d_write', 'Minu kogemused.', 'Kirjuta 6–8 lauset: mida oled teinud ja mida veel mitte.', [6, 8], ['olen käinud', 'olen proovinud', 'ei ole veel', 'viimati'], 3),
    ],
    practice: [
      B.formtext('079_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Sofia kogemused', [
        'Sofia on Eestis [elanud] (elama) kaks aastat.',
        '',
        'Ta on Tallinnas ja Tartus [käinud] (käima) mitu korda, aga Saaremaal ta ei ole veel [käinud] (käima).',
        '',
        'Ta on [proovinud] (proovima) verivorsti, aga see talle ei [meeldinud] (meeldima).',
        '',
        'Eelmisel talvel [proovis] (proovima) ta esimest korda suusatamist. Ta on [näinud] (nägema) ka virmalisi, aga saunas ei ole ta kunagi [olnud] (olema).',
      ], 'g_notice'),
      B.cloze('079_p_cloze', 'Jaani kiri.', 'Vali igasse lünka sobiv sõna.', 'Tere, Viktor!', [
        'Aitäh kirja eest! Sa küsisid, kas ma olen kunagi Lõuna-Eestis {*käinud|käisin|käima}.',
        '',
        'Jah, olen! Eelmisel suvel {*käisin|olen käinud|käinud} Otepääl. Seal {*proovisin|proovinud|proovima} ma esimest korda kanuud.',
        '',
        'Aga Setomaal ma ei ole veel {*käinud|käisin|käi}. Kas sina {*oled|oli|olema} seal käinud?',
        '',
        'Ma olen {*kuulnud|kuulsin|kuulama}, et seal on väga ilus. Mu õde on seal kaks korda {*olnud|oli|olema}. Võib-olla {*läheme|läksime|oleme läinud} koos järgmisel suvel? Jaan',
      ], 'g_vocab'),
      B.wordforms('079_p_forms', 'nud-vorm.', 'Kirjuta tegusõna nud-vormis: ma olen …', [
        ['tegema', 'ma olen …', 'teinud'], ['jooma', 'ma olen …', 'joonud'], ['tulema', 'ma olen …', 'tulnud'],
        ['minema', 'ma olen …', 'läinud'], ['ujuma', 'ma olen …', 'ujunud'], ['sõitma', 'ma olen …', 'sõitnud'], ['lendama', 'ma olen …', 'lennanud'], ['magama', 'ma olen …', 'maganud']]),
      B.gaps('079_p_gaps', 'Kogemus või kindel aeg?', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Kas sa oled kunagi hobusega [sõitnud] (sõitma)?', 'Eelmisel suvel [sõitsin] (sõitma) ma esimest korda hobusega.', 'Ma ei ole veel Lätis [käinud] (käima).',
        '2020. aastal [käisime] (käima) me Riias.', 'Kas te olete seda kooki [proovinud] (proovima)?', 'Eile [proovisin] (proovima) ma uut kohvikut.', 'Kas sa oled kunagi telkis [maganud] (magama)?', 'Eelmisel nädalal [magasin] (magama) ma telkis.']),
      B.choice('079_p_choice', 'Kogemus või kindel aeg?', 'Vali lausesse õige vorm.', [['Ma ___ seda filmi juba kolm korda näinud.', 'olen', 'olin', 'oli'], ['Eile ___ ma kinos.', 'käisin', 'olen käinud', 'käinud'], ['Kas sa oled kunagi Narvas ___?', 'käinud', 'käisid', 'käid'], ['2019. aastal me ___ Saksamaal.', 'elasime', 'oleme elanud', 'elanud'], ['Ma ei ole veel sushit ___.', 'söönud', 'sõin', 'sööma'], ['Kaks päeva tagasi Anna ___ uue telefoni.', 'ostis', 'on ostnud', 'ostnud'], ['Kas te ___ juba lõunat söönud?', 'olete', 'olite', 'oleme'], ['Viimati ___ ma emale pühapäeval.', 'helistasin', 'olen helistanud', 'helistanud']], 'full', 'g_notice'),
      B.transformation('079_p_trans', 'Ütle kogemusena.', 'Kirjuta lause antud sõnadega.', [
        ['Ma sõin eile suitsukala.', 'ei ole veel', 'Ma ei ole veel suitsukala söönud.'],
        ['Ta käis 2018. aastal Londonis.', 'on käinud', 'Ta on Londonis käinud.'],
        ['Me proovisime eile talisuplust.', 'kunagi?', 'Kas te olete kunagi talisuplust proovinud?'],
        ['Anna luges selle raamatu läbi.', 'juba', 'Anna on selle raamatu juba läbi lugenud.'],
        ['Ma nägin seda filmi kolm korda.', 'olen … kolm korda', 'Ma olen seda filmi kolm korda näinud.'], ['Ma sõitsin eile rattaga.', 'ei ole kunagi', 'Ma ei ole kunagi rattaga sõitnud.'], ['Ta käis eelmisel aastal Riias.', 'on käinud', 'Ta on Riias käinud.'], ['Me nägime eile hunti.', 'kunagi?', 'Kas te olete kunagi hunti näinud?']]),
      B.wordorder('079_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Kas te olete kunagi Lätis käinud?', 'Ma olen hobusega sõitnud ainult üks kord.', 'Sofia ei ole veel Setomaal käinud.', 'Viimati käisime Riias kaks aastat tagasi.', 'Kas Anna on juba koju jõudnud?', 'Kas sa oled kunagi Saaremaal käinud?', 'Ma ei ole veel talisuplust proovinud.', 'Markus on Kihnus käinud üks kord.']),
      B.dictation('079_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas sa oled kunagi Lätis käinud?', 'Ma ei ole veel kanuud proovinud.', 'Eelmisel suvel käisin Otepääl.', 'Ta on seda filmi näinud.', 'Me oleme mitu korda Riias käinud.', 'Ma ei ole kunagi telkis maganud.', 'Kas sa oled kunagi Kihnus käinud?', 'Jah, olen käinud üks kord.']),
      B.speaking('079_p_say', 'Küsitluse tulemused.', 'Räägi klassile, mida said küsitlusest teada.', ['Kes on talisuplust proovinud?', 'Kes ei ole veel Saaremaal käinud?', 'Kes on telkis maganud ja millal?', 'Kes on hobusega sõitnud?', 'Mida sina ei ole veel teinud?'], [60, 90], ['Viktor on … proovinud.', 'Sofia ei ole veel…', 'Liis käis … eelmisel aastal.']),
    ],
    transfer: [
      B.text('079_t_situation', 'Uus olukord', 'Sa tahad suvel tööle turismiinfosse. Loe kuulutust. Siis valmistu vestluseks: juht Kaido küsib sinu kogemuste kohta.'),
      B.reading('079_t_read', 'Loe kuulutust.', 'Loe kuulutus ja vasta küsimustele.', 'Suvetöö turismiinfos', [
        'Tallinna vanalinna turismiinfo otsib suveks kahte töötajat. Töö kestab juunist augustini. Tööpäev on kella kümnest kella kuueni. Sinu ülesanne on aidata turiste ja vastata nende küsimustele. Sa räägid turistidega eesti, vene ja inglise keeles. Sa müüd ka kaarte ja pileteid.',
        'Kas sa oled varem klientidega töötanud? Kas sa oled vanalinnas palju käinud? Kas sa tunned Tallinna muuseume ja kohvikuid? Siis oled sa meile õige inimene! Turismi kogemus ei ole kohustuslik. Saada oma CV ja lühike kiri 15. maiks. Kirjuta, mida sa oled varem teinud ja miks see töö sulle sobib.',
      ], [
        ['Kui kaua suvetöö kestab?', 'juunist augustini|kolm kuud'], ['Mis keeltes peab töötaja rääkima?', 'eesti, vene ja inglise keeles|eesti, vene, inglise'],
        ['Mida teeb töötaja peale turistide aitamise?', 'müüb kaarte ja pileteid|müüb pileteid'], ['Kas turismi kogemus on vajalik?', 'ei|ei ole kohustuslik'],
        ['Mida peab kirjas kirjutama?', 'mida oled varem teinud ja miks töö sobib|mida oled teinud|miks töö sobib'], ['Mis kellani tööpäev kestab?', 'kella kuueni|kuueni|18'], ['Mis kuupäevaks tuleb CV saata?', '15. maiks']]),
      B.choice('079_t_answer', 'Mida vastata?', 'Kaido küsib. Vali sobiv vastus.', [
        ['Kas te olete varem klientidega töötanud?', 'Jah, olen töötanud kaks aastat poes.', 'Jah, ma töötan homme poes.', 'Ei, ma ei tööta poes homme.'],
        ['Kas te olete vanalinnas palju käinud?', 'Jah, olen seal mitu korda käinud.', 'Jah, ma käin seal homme.', 'Ei, vanalinn on kinni.'],
        ['Millal te viimati muuseumis käisite?', 'Eelmisel kuul käisin Kumus.', 'Olen käinud muuseumis.', 'Ma lähen muuseumi.'],
        ['Kas te olete pileteid müünud?', 'Ei, veel mitte, aga ma õpin kiiresti.', 'Ei, pilet on kallis.', 'Jah, ma ostan pileti.'],
        ['Kas te olete turistidega vene keeles rääkinud?', 'Jah, mitu korda.', 'Jah, homme kell kümme.', 'Ei, ma räägin praegu.'], ['Kas te olete kunagi turismiinfos töötanud?', 'Ei, veel mitte.', 'Jah, homme.', 'Ma töötan.'], ['Millal te viimati vanalinnas käisite?', 'Eelmisel nädalal.', 'Olen käinud.', 'Homme lähen.'], ['Kas te olete Kumus käinud?', 'Jah, mitu korda.', 'Jah, ma lähen sinna.', 'Ei, ma käin.']], 'full', 'g_use'),
      B.gaps('079_t_gaps', 'Minu kogemus.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Ma olen kolm aastat poes [töötanud] (töötama).', 'Eelmisel suvel [töötasin] (töötama) ma kohvikus.', 'Ma olen palju turistidega [rääkinud] (rääkima).',
        'Vanalinnas olen ma [käinud] (käima) mitu korda.', 'Ma ei ole veel pileteid [müünud] (müüma).', 'Mullu [aitasin] (aitama) ma laulupeol turiste.', 'Ma olen inglise keelt [õppinud] (õppima) kümme aastat.', 'Eile [käisin] (käima) ma vanalinnas.']),
      B.rolecards('079_t_roles', 'Töövestlus.', 'A on Kaido, B on kandidaat. Rääkige 3 minutit.',
        'Oled Kaido. Küsi 5 küsimust kandidaadi kogemuste kohta.', 'Oled kandidaat. Vasta ja lisa igale vastusele üks detail.',
        ['Kas te olete varem…?', 'Millal te…?', 'Kas te olete kunagi…?'], ['Jah, olen … töötanud.', 'Eelmisel suvel ma…', 'Veel mitte, aga…']),
      B.speaking('079_t_say', 'Räägi endast.', 'Räägi 1 minut oma kogemustest.', ['Kus oled töötanud?', 'Mida oled proovinud?', 'Mida sa veel ei ole teinud?', 'Mida sa tahaksid veel proovida?', 'Millal sa viimati midagi esimest korda tegid?'], [60, 90]),
      B.letter('079_t_letter', 'Kiri Kaidole.', 'Kirjuta: kes oled, mida oled teinud, miks töö sobib.', 'Tere, Kaido!', 'Lugupidamisega', [40, 60]),
      B.rubric('079_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on kes, kogemus ja põhjus (40–60 sõna).', 'olen + nud ja lihtminevik on õigesti kasutatud.', 'Töövestluses vastab kandidaat detailidega.', 'Suuline tekst kirjeldab vähemalt kolme kogemust.']),
      B.selfcheck('079_t_self', ['Ma saan aru töökuulutusest.', 'Ma räägin oma kogemustest töövestlusel.', 'Ma ütlen kindla aja lihtminevikus.', 'Ma kirjutan lühikese kirja.'], 'Kandidaat on valmis'),
    ],
  },

  'a2-080': {
    title: 'Kontroll 16 — minevik',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et kasutan lihtminevikku ja kogemuse vormi, saan aru lühikesest loost minevikus ning jutustan ja kirjutan loo, millel on algus, järjekord ja lõpp (vähemalt 70%).',
    discover: [
      B.text('080_d_situation', 'Kordamine: vanaema album', 'Pühapäeval vaatab Sofia koos vanaemaga vana fotoalbumit. Vanaema jutustab oma lapsepõlvest. Sofia kuulab ja küsib palju. Pärast kirjutab ta loo ülikooli ajalehte.'),
      B.truefalse('080_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Sofia vaatab fotoalbumit üksi.', false], ['Vanaema räägib oma lapsepõlvest.', true], ['Sofia ei küsi midagi.', false], ['Sofia kirjutab loo ajalehte.', true], ['See juhtub pühapäeval.', true],
      ]),
      B.vocab('080_d_vocab', 'Minevik ja mälestused', ['minevik — прошлое', 'möödunud — прошлый', 'aasta tagasi — год назад', 'lapsepõlv — детство', 'mäletama — помнить', 'sündima — родиться', 'kasvama — расти', 'mälestus — воспоминание', 'jutustama — рассказывать'], '2'),
      B.reading('080_d_read', 'Loe: vanaema lapsepõlv.', 'Loe teksti ja vasta küsimustele.', 'Vanaema Maie lugu',
        'Vanaema Maie sündis 1955. aastal Valgas. Ta kasvas suures peres, tal oli kolm venda. Nad elasid väikeses majas linna lähedal. Igal hommikul käis Maie jalgsi koolis. Kool oli kolme kilomeetri kaugusel. Talvel oli tee pime ja külm. Suvel aitasid lapsed vanaisa juures maal. Nad tõid lehmadele heina ja korjasid marju. Vanaema mäletab hästi ühte suve. Siis nägi ta esimest korda merd. Kogu pere sõitis rongiga Pärnusse. Lapsed ujusid terve päeva ja sõid jäätist. See oli tema lapsepõlve kõige ilusam mälestus. Pärast kooli õppis Maie Tartus õpetajaks. Ta töötas koolis nelikümmend aastat. Täna ütleb ta: „Elu oli raske, aga me olime õnnelikud.”',
        [['Millal ja kus vanaema sündis?', '1955. aastal Valgas|Valgas|1955'], ['Mitu venda tal oli?', 'kolm|3'], ['Kuidas Maie kooli käis?', 'jalgsi'], ['Mida lapsed suvel maal tegid?', 'tõid heina ja korjasid marju|korjasid marju|aitasid vanaisa'], ['Mis oli Maie kõige ilusam mälestus?', 'ta nägi esimest korda merd|reis Pärnusse|esimest korda meri'], ['Kellena Maie töötas?', 'õpetajana'], ['Kuhu sõitis pere rongiga?', 'Pärnusse']]),
      B.notice('080_d_notice', 'Mooduli kokkuvõte', [
        'Lihtminevik: **käisin, läksin, tulin, olin, tegin, nägin, sain**', 'Eitus: **ei** + -nud: **ei olnud, ei läinud, ei näinud**', 'Lugu: **kõigepealt → siis → pärast seda → äkki → lõpuks**', 'Kogemus: Kas sa **oled** kunagi … **käinud**? — **Olen käinud.** / **Ei ole käinud.**', 'Aeg: **aasta tagasi, lapsena, 1955. aastal, eelmisel suvel**',
      ], 'full'),
      B.wordforms('080_d_forms', 'Mineviku vormid.', 'Kirjuta tegusõna antud vormis.', [
        ['sündima', 'ta (minevik)', 'sündis'], ['kasvama', 'ta (minevik)', 'kasvas'], ['käima', 'me (minevik)', 'käisime'], ['tooma', 'nad (minevik)', 'tõid'],
        ['nägema', 'ma (eitus)', 'ei näinud'], ['ujuma', 'nad (minevik)', 'ujusid'], ['käima', 'ma (kogemus)', 'olen käinud'], ['nägema', 'ma (kogemus, eitus)', 'ei ole näinud'],
      ]),
      B.match('080_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kus sa sündisid?', 'Narvas.'], ['Kus sa lapsena elasid?', 'Väikeses külas.'], ['Mida sa lapsepõlvest mäletad?', 'Suvesid vanaema juures.'],
        ['Kas sa oled kunagi Saaremaal käinud?', 'Jah, olen käinud kaks korda.'], ['Millal sa seal viimati käisid?', 'Aasta tagasi.'], ['Mida sa eile tegid?', 'Ma koristasin.'],
      ], 'full', 'g_use'),
      B.gaps('080_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        'Ma [sündisin] Tartus.', 'Lapsena [elasime] maal.', 'Eile ma [ei läinud] tööle.', 'Kas sa [oled] kunagi Riias käinud?', '[Kõigepealt] sõime, siis tantsisime.', 'Aasta [tagasi] käisin Soomes.',
      ], ['sündisin', 'sünnin', 'elasime', 'elame', 'ei läinud', 'ei läksin', 'oled', 'olid', 'kõigepealt', 'lõpuks', 'tagasi', 'pärast']),
      B.errorfix('080_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Vanaema sündis Valgas ja kasvis seal.', 'Vanaema sündis Valgas ja kasvas seal.'], ['Ma ei mäletasin seda.', 'Ma ei mäletanud seda.'], ['Kas sa oled kunagi Pärnus käisid?', 'Kas sa oled kunagi Pärnus käinud?'],
        ['Eelmisel suvel ma olen käinud Soomes.', 'Eelmisel suvel käisin ma Soomes.|Eelmisel suvel ma käisin Soomes.'], ['Lapsed ujuisid terve päeva.', 'Lapsed ujusid terve päeva.'],
      ]),
      B.dialogue('080_d_dialog', 'Sofia küsib vanaemalt.', 'Täida Sofia ja vanaema vestlus.', 'Sofia', 'Vanaema', [
        ['A', 'Vanaema, kus sa [sündisid]?'], ['B', 'Valgas. Me [elasime] linna lähedal.'], ['A', 'Kas sa [käisid] bussiga koolis?'], ['B', 'Ei, ma [ei käinud] bussiga. Ma kõndisin.'],
        ['A', 'Mida sa kõige paremini [mäletad]?'], ['B', 'Esimest reisi mere äärde. See on mu kõige ilusam [mälestus].'],
      ]),
      B.cloze('080_d_cloze', 'Sofia lugu ajalehte.', 'Vali igasse lünka sobiv sõna.', 'Minu vanaema', [
        'Minu vanaema {*sündis|sünnib|sündinud} Valgas. Lapsena {*käis|käib|käinud} ta jalgsi koolis.',
        '',
        'Suvel {*aitasid|aitavad|aidanud} lapsed vanaisa juures maal. Ühel suvel {*nägi|näeb|näinud} ta esimest korda merd.',
        '',
        'Mina {*ei ole|ei olnud|ei olen} kunagi nii pikka teed jalgsi käinud. {*Lõpuks|Kõigepealt|Äkki} ütles vanaema: „Me olime õnnelikud.”',
      ]),
      B.translation('080_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я родилась в Нарве.', 'В детстве я жил в деревне.', 'Я этого не помню.', 'Ты когда-нибудь был в Риге?', 'Год назад мы ездили в Финляндию.']),
      B.dictation('080_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Vanaema sündis Valgas.', 'Ta kasvas suures peres.', 'Ma ei mäletanud seda.', 'Olen Saaremaal kaks korda käinud.', 'See oli ilus mälestus.']),
      B.speaking('080_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele.', ['Kus sa sündisid ja kasvasid?', 'Mida sa eile tegid?', 'Mis on sinu ilus lapsepõlve mälestus?', 'Kus sa oled kunagi käinud?'], [60, 120]),
      B.writing('080_d_write', 'Vanaema lugu.', 'Kirjuta vanaema loost 5–7 lauset oma sõnadega.', [5, 7], ['sündis', 'kasvas', 'käis', 'mäletab'], 2),
    ],
    practice: [
      B.tip('080_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 16. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: what to say
      B.choice('080_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõber tuli puhkuselt. Mida küsid?', 'Kuidas puhkus läks?', 'Kuhu sa homme lähed?', 'Mis kell rong läheb?'], ['Sõbral juhtus õnnetus. Mida ütled?', 'Oi, kahju! Kuidas sa ennast tunned?', 'Palju õnne, väga tore!', 'Head isu ja jõudu!'],
        ['Sa ei mäleta kolleegi nime. Mida ütled?', 'Vabandust, mis teie nimi oligi?', 'Tere, mina olen siin uus!', 'Head aega, kohtumiseni!'], ['Kolleeg räägib huvitavat lugu. Mida küsid?', 'Ja mis siis juhtus?', 'Mis kell praegu on?', 'Kus on tualett?'],
        ['Sõber küsib: „Kas oled Hiiumaal käinud?” Sa ei ole.', 'Ei, ma ei ole seal käinud.', 'Ei, ma ei käinud homme.', 'Jah, ma lähen sinna.'],
      ], 'full', 'g_use'),
      // reading 2: three postcards
      B.reading('080_p_three', 'Lugemine 2. Kolm postkaarti.', 'Loe postkaarte. Vasta tähega (A, B, C) või lühidalt.', 'Kolm postkaarti', [
        'A. Tere, Anna! Oleme juba nädal aega Kreetal. Ilm on väga palav. Eile käisime mägedes ja nägime vana kloostrit. Täna ujusime terve päeva. Tuleme koju laupäeval. Kallistan, Olga',
        'B. Tere, kolleegid! Saksamaal on külm ja vihmane. Konverents oli huvitav, aga väga pikk. Eile õhtul kaotasin hotellis võtme. Õnneks leidis koristaja selle üles. Kohtumiseni esmaspäeval! Igor',
        'C. Kallis vanaema! Laager on väga tore. Eile tegime lõket ja laulsime. Ma kukkusin jalgrattaga, aga ei saanud haiget. Söök on hea, aga ma igatsen sinu pannkooke! Sinu Mart',
      ], [['Kes on puhkusel soojas kohas?', 'A|Olga'], ['Kes oli tööreisil?', 'B|Igor'], ['Kes kirjutab laagrist?', 'C|Mart'], ['Mida Olga eile nägi?', 'vana kloostrit|kloostrit'], ['Kes leidis Igori võtme?', 'koristaja'], ['Mis juhtus Mardiga?', 'ta kukkus jalgrattaga|kukkus rattaga']]),
      // reading 3: notices
      B.match('080_p_signs', 'Lugemine 3. Kuhu pöörduda?', 'Ühenda olukord ja kuulutus.', [
        ['Sa kaotasid bussis vihmavarju.', 'Bussifirma: leitud asjad, Pärnu mnt 2'], ['Sa leidsid pargist võtmed.', 'Politsei infotelefon 612 3000'], ['Sinu koer jooksis eile ära.', 'Kadunud koer! Pruun, nimi Muki. Helista!'],
        ['Tahad müüa vana jalgratast.', 'Kuulutused: müün ja ostan'], ['Tahad kohata vanu klassikaaslasi.', 'Kokkutulek! 2010. aasta lõpetajad'], ['Kaotasid poes kindad.', 'Poe infolett: kaotatud asjad'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word story
      B.reading('080_p_read', 'Lugemine 4. Esimene töökoht.', 'Loe teksti. Vasta lühidalt.', 'Jaani esimene töö',
        'Jaan mäletab hästi oma esimest töökohta. See oli kakskümmend aastat tagasi. Ta oli siis kuusteist aastat vana. Suvel töötas ta Viljandis ühes väikeses kohvikus. Kõigepealt pidi ta nõusid pesema. Töö oli raske ja palk oli väike. Teisel nädalal juhtus õnnetus. Jaan kukkus köögis ja lõhkus kümme taldrikut. Ta oli väga mures. Ta arvas, et omanik saadab ta koju. Aga omanik naeris ja ütles: „Kõik teevad vigu.” Pärast seda õpetas omanik Jaanile kohvi tegemist. Augustis tegi Jaan juba ise kohvi ja teenindas kliente. Suve lõpus sai ta väikese preemia. Selle rahaga ostis ta oma esimese jalgratta. Nüüd on Jaanil oma kohvik Tallinnas. Ja tema kohvi on linna parim!',
        [['Kui vana oli Jaan esimesel töökohal?', 'kuusteist|16|kuusteist aastat'], ['Mitu taldrikut Jaan lõhkus?', 'kümme|10'], ['Mida Jaan preemia eest ostis?', 'oma esimese jalgratta|jalgratta'], ['Kus Jaan esimest korda töötas?', 'Viljandis|Viljandis kohvikus|kohvikus'], ['Kus on Jaani kohvik nüüd?', 'Tallinnas']]),
      B.choice('080_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Kus Jaan töötas?', 'kohvikus', 'koolis', 'bussis'], ['Mida pidi ta kõigepealt tegema?', 'nõusid pesema', 'kohvi tegema', 'kliente teenindama'],
        ['Mida Jaan arvas pärast õnnetust?', 'omanik saadab ta koju', 'omanik annab preemia', 'omanik on haige'], ['Mida omanik ütles?', 'kõik teevad vigu', 'mine kohe koju', 'osta uued taldrikud'],
        ['Mis on Jaanil nüüd?', 'oma kohvik', 'uus jalgratas', 'teine töö Viljandis'],
      ]),
      // reading 5: a letter with 8 option gaps
      B.cloze('080_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Sofia!', [
        'Aitäh, et sa eile {*helistasid|helistad|helistama}! Ma {*ei saanud|ei saa|ei sain} kohe vastata, sest olin kinos.',
        '',
        'Film {*oli|on|olnud} väga hea. Mulle {*meeldis|meeldib|meeldinud} see väga. Pärast filmi {*läksime|lähme|läinud} Annaga Jaani kohvikusse.',
        '',
        'Kas sa {*oled|olid|olla} kunagi seal käinud? Aasta {*tagasi|pärast|eest} töötas seal minu õde. {*Lõpuks|Kõigepealt|Äkki} jõudsin koju kell üksteist.',
        '',
        'Kas saame nädalavahetusel kokku? Kirjuta! Kallistan, Kati',
      ]),
      // listening 1: a monologue about childhood
      B.listening('080_p_listen', 'Kuulamine 1. Viktori lapsepõlv.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Viktor. Ma sündisin Narva lähedal.', 'Lapsena elasin vanavanematega maal.', 'Meil oli kaks lehma ja palju kanu.', 'Igal hommikul tõin ma kanadelt mune.',
        'Koolis käisin bussiga, sest kool oli kaugel.', 'Kaheteistkümneaastaselt kolisime linna, Narva.', 'Linnas oli kõik uus ja huvitav, aga ma igatsesin maad.',
      ], ['Viktor sündis [Narva] lähedal.', 'Lapsena elas ta [vanavanematega] maal.', 'Neil oli [kaks|2] lehma.', 'Hommikul tõi Viktor [mune].', 'Kooli sõitis ta [bussiga].', 'Narva kolisid nad, kui Viktor oli [12|kaksteist] aastat vana.']),
      // listening 2: a dialogue between two friends
      B.listening('080_p_listen2', 'Kuulamine 2. Kaks sõpra.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Markus! Kuidas nädalavahetus läks?', '— Tere, Anna! Väga hästi. Ma käisin Hiiumaal.', '— Oi! Kas sa oled seal varem käinud?', '— Ei, see oli esimene kord. Me sõitsime praamiga.',
        '— Mida te seal tegite?', '— Laupäeval käisime tuletornis. Pühapäeval sõitsime rattaga.', '— Kas ilm oli ilus?', '— Laupäeval oli päike, aga pühapäeval sadas vihma.',
        '— Kas sa tegid pilte?', '— Jah, palju. Ma näitan sulle homme.',
      ], ['Markus käis [Hiiumaal].', 'Ta oli seal [esimest] korda.', 'Saarele sõitsid nad [praamiga].', 'Laupäeval käisid nad [tuletornis].', 'Pühapäeval [sadas] vihma.', 'Pilte näitab Markus [homme].']),
      B.gaps('080_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Eile ma [koristasin] (koristama) kodu.', 'Ta [sündis] (sündima) 1990. aastal.', 'Me [ei läinud] (minema, eitus) kinno.', 'Kas sa oled kunagi Riias [käinud] (käima)?', 'Lapsena [kasvasin] (kasvama) ma maal.', 'Nad [tõid] (tooma) kingituse.', 'Eelmisel suvel [nägin] (nägema) ma esimest korda merd.',
      ]),
      B.errorfix('080_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Ma ei mäletasin tema nime.', 'Ma ei mäletanud tema nime.'], ['Eile ma olen käinud kinos.', 'Eile käisin ma kinos.|Eile ma käisin kinos.'], ['Siis ta tulis koju.', 'Siis tuli ta koju.'],
        ['Kas sa oled kunagi Hiiumaal käisid?', 'Kas sa oled kunagi Hiiumaal käinud?'], ['Lapsena me elas maal.', 'Lapsena me elasime maal.|Lapsena elasime me maal.'], ['Eile ta ei tulnud ja ei helistas.', 'Eile ta ei tulnud ja ei helistanud.'],
      ]),
      B.transformation('080_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Täna ma koristan.', 'Eile …', 'Eile ma koristasin.|Eile koristasin ma.'], ['Ma nägin seda filmi.', 'eitus', 'Ma ei näinud seda filmi.'], ['Ma käisin Riias.', 'kogemus: Ma olen …', 'Ma olen Riias käinud.'],
        ['Ta tuli koju.', 'Siis …', 'Siis tuli ta koju.'], ['Ma sõin hommikul putru.', 'küsimus: Mida…?', 'Mida sa hommikul sõid?'],
      ]),
      B.wordorder('080_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', ['Ma sündisin Narvas.', 'Lapsena elasin ma maal.', 'Kas sa oled kunagi Hiiumaal käinud?', 'Laupäeval käisime tuletornis.', 'Pühapäeval sadas vihma.']),
      B.speaking('080_p_say', 'Räägi kuuldust.', 'Räägi paarilisele Markuse nädalavahetusest.', ['Kus Markus käis?', 'Kas ta oli seal varem käinud?', 'Mida nad tegid?', 'Milline oli ilm?'], [45, 90], ['Markus käis…', 'Ta ei olnud…', 'Pühapäeval…']),
    ],
    transfer: [
      B.text('080_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('080_t_card', 'Kutse', ['Klassikokkutulek! Narva 6. kool, 2010. aasta lõpetajad', 'Millal: laupäeval, 14. juunil kell 17', 'Kus: kohvik „Mälestus”, Puškini 10, Narva', 'Hind: 25 €, söök on hinna sees', 'Registreeru kuni 1. juunini: telefon 5512 7788 (Olga)'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('080_t_info', 'Kirjutamine 1. Kutsu klassivenda.', 'Kirjuta vanale klassivennale kutse järgi: millal, kus, hind, kuidas registreeruda.', 'Tere, Dmitri!', 'Loodan sind näha!', [25, 40]),
      B.planning('080_t_plan', 'Enne lugu.', 'Mõtle läbi ja kirjuta märksõnad.', ['Millal ja kus see oli?', 'Kes olid seal?', 'Mis juhtus kõigepealt, siis, lõpuks?', 'Miks sa seda mäletad?']),
      // writing 2: a short story, 70–90 words (roadmap)
      B.letter('080_t_story', 'Kirjutamine 2. Minu mälestus.', 'Kirjuta Olgale 70–90 sõna: üks ilus mälestus kooliajast.', 'Kallis Olga!', 'Kohtumiseni kokkutulekul!', [70, 90]),
      B.writing('080_t_text', 'Kirjutamine 2 (teine valik). Minu eilne päev.', 'Kirjuta 6–8 lauset: mida sa eile tegid. Lool on algus ja lõpp.', [6, 8], ['kõigepealt', 'siis', 'lõpuks'], 2),
      B.table('080_t_form', 'Kokkutuleku registreerimine.', 'Täida registreerimise vorm.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Lõpetamise aasta | ', 'Telefon | ', 'Kas tuled üksi või kaaslasega? | ', 'Mida tahad kokkutulekul teha? | ']),
      // speaking: getting to know, picture description (task 1), idea card and role play (task 2)
      B.speaking('080_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa sündisid ja kasvasid?', 'Mida sa eile tegid?', 'Kus sa oled kunagi käinud?'], [45, 60]),
      B.speaking('080_t_mono', 'Rääkimine 1. Kirjelda vana fotot.', 'Õpetaja annab vana foto: pere, kool või puhkus. Kirjelda üks minut.', ['Kes on pildil?', 'Kus ja millal see võis olla?', 'Mida nad tegid?', 'Mida sina sellest ajast mäletad?'], [60, 90], ['Pildil on…', 'See oli…', 'Nad…']),
      B.rolecards('080_t_s1', 'Rääkimine 2. Ideekaart „Lapsepõlv”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: kus sündis, kus kasvas, kool, hobid, ilus mälestus.', 'Vasta igale küsimusele 2–3 lausega minevikus.',
        ['Kus sa sündisid?', 'Mida sa lapsena tegid?', 'Mida sa kõige paremini mäletad?'], ['Ma sündisin…', 'Lapsena ma…', 'Ma mäletan…']),
      B.rolecards('080_t_s2', 'Rääkimine 2. Rollimäng „Mis juhtus?”', 'A ei tulnud kokkusaamisele, B küsib. Siis vahetage.',
        'Sa ei tulnud eile kokku. Räägi järjekorras, mis juhtus. Vabanda.', 'Sa ootasid sõpra eile kaua. Küsi, mis juhtus ja miks ta ei helistanud.',
        ['Vabandust, eile…', 'Kõigepealt…', 'Lõpuks…'], ['Mis juhtus?', 'Miks sa ei helistanud?', 'Ja siis?']),
      B.rubric('080_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Lool on algus, järjekord ja lõpp (kõigepealt, siis, lõpuks).', 'Lihtminevik, eitus (ei olnud) ja kogemus (olen käinud) on õiged.', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 70–90 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('080_t_self', ['Ma kirjutan kutse järgi sõbrale info.', 'Ma kirjutan 70–90-sõnalise loo minevikus.', 'Ma kirjeldan vana fotot.', 'Ma jutustan, mis juhtus, ja vastan küsimustele.'], 'Moodul 16 on tehtud'),
    ],
  },
};
