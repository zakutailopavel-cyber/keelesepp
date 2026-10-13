// B1 course (A2 → B1 roadmap), module 6 „Toit ja teenindus” (a2b1-026…030), stage A2+.
// Harjuta + Kasuta for the published Avasta sheets. The partitive after quantities is the grammar risk (roadmap): it is
// practised only on familiar food words, in shopping lists, recipes, orders and complaints. Past tense (module 5)
// comes back in the complaint („Ma tellisin…, aga sain…”).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2b1-module-06', course: 'b1', title: 'Toit ja teenindus', level: 'A2+' };

export const LESSONS = {
  'a2b1-026': {
    title: 'Toiduained ja kogused',
    canDo: 'Ma nimetan vähemalt 15 toiduainet ja kasutan vähemalt kuut koguseväljendit.',
    practice: [
      B.categorize('026_p_shop', 'Poe osakonnad.', 'Sorteeri toiduained osakondadesse.', [
        ['Piimatooted', ['piim', 'juust', 'jogurt', 'või']], ['Puu- ja köögiviljad', ['õun', 'tomat', 'kurk', 'kartul', 'banaan']], ['Liha ja kala', ['kana', 'kala', 'sink']], ['Kuivained', ['riis', 'jahu', 'suhkur', 'makaronid']],
      ]),
      B.match('026_p_amount', 'Kogus ja toode.', 'Mis kogus sobib? Ühenda.', [
        ['üks pudel', 'mineraalvett'], ['kaks pakki', 'võid'], ['kilo', 'kartuleid'], ['liiter', 'piima'], ['kümme', 'muna'], ['kaks viilu', 'leiba'],
      ], 'half', 'g_use'),
      B.gaps('026_p_list', 'Ostunimekiri.', 'Kirjuta toode õiges vormis.', [
        'kaks liitrit [piima] (piim)', 'üks kilo [kartuleid] (kartulid)', 'kolm pakki [riisi] (riis)', 'pool kilo [juustu] (juust)', 'natuke [suhkrut] (suhkur)', 'viis [õuna] (õun)',
      ], '', 'half'),
      B.crossword('026_p_cross', 'Toidu ristsõna.', 'Kirjuta sõna vihje järgi.', [
        ['Valge jook lehmalt', 'piim'], ['Seda küpsetatakse jahust', 'leib'], ['Punane köögivili salatis', 'tomat'], ['Pikk kollane puuvili, mille koor visatakse ära', 'banaan'], ['Lind, keda süüakse', 'kana'],
      ]),
      B.errorfix('026_p_fix', 'Paranda ostunimekiri.', 'Kirjuta õigesti.', [
        ['kaks liitrit piim', 'kaks liitrit piima'], ['üks kilo kartulid', 'üks kilo kartuleid'], ['kolm pakki riis', 'kolm pakki riisi'], ['natuke suhkur', 'natuke suhkrut'], ['viis õunad', 'viis õuna'],
      ]),
      B.truefalse('026_p_recipe', 'Pannkoogi retsept.', 'Retsept: 3 muna, pool liitrit piima, 250 g jahu, natuke soola. Õige või vale?', [
        ['Pannkookideks on vaja kolm muna.', true], ['Piima on vaja kaks liitrit.', false], ['Jahu on vaja 250 grammi.', true], ['Retseptis on palju suhkrut.', false], ['Soola pannakse natuke.', true],
      ]),
      B.speaking('026_p_fridge', 'Mis sinu külmkapis on?', 'Räägi 1 minut. Kasuta 6 koguseväljendit.', [
        'Mida sul on palju?', 'Mida on vähe?', 'Mida pead ostma?', 'Mida sa iga päev sööd?',
      ], [60, 90], ['Mul on palju…', 'Mul on vähe…', 'Pean ostma kilo…', 'Natuke…']),
      B.reading('026_px_read', 'Loe: poes käik.', 'Loe ja vasta.', 'Laupäevane poeskäik',
        'Igal laupäeval käib Marje perega suures toidupoes. Enne poodi minekut kirjutab ta nimekirja, sest muidu ostab ta liiga palju. Seekord oli nimekirjas kaks liitrit piima ja pätsike leiba. Veel oli vaja kilo kartuleid, pool kilo juustu, kümme muna ja natuke kohvi. Lapsed tahtsid ka banaane ja jäätist. Puuviljaosakonnas valis Marje kilo õunu ja kolm banaani. Lihaletist ostis ta kanafileed, sest õhtul tahtis ta teha kanasuppi. Kassas selgus, et ta unustas osta suhkrut. Mees läks tagasi ja tõi ühe paki. Kokku maksid nad kolmkümmend kaks eurot. Kodus pani Marje piima ja juustu külmkappi ning kartulid keldrisse. Ta oli rahul, sest seekord ei ostnud ta midagi üleliigset, välja arvatud jäätis. Õhtul tegi ta kanasuppi ja kogu pere sõi koos. Supp oli nii hea, et järgmisel päeval ei jäänud sellest midagi alles. Lapsed palusid, et ema teeks seda suppi iga nädal.',
        [['Miks kirjutab Marje nimekirja?', 'muidu ostab liiga palju'], ['Mida ostis Marje, mis ei olnud nimekirjas?', 'jäätist|jäätise|jäätis|lastele jäätist'], ['Mida tahtsid lapsed?', 'banaane ja jäätist'], ['Miks ostis Marje kanafileed?', 'tahtis teha kanasuppi'], ['Mida Marje unustas osta?', 'suhkrut'], ['Kui palju nad maksid?', 'kolmkümmend kaks eurot|32 eurot']]),
      B.gaps('026_px_part', 'Kogus + osastav.', 'Kirjuta toode õiges vormis.', ['kaks liitrit [piima] (piim)', 'kilo [õunu] (õunad)', 'pakk [kohvi] (kohv)', 'pool kilo [juustu] (juust)', 'kolm [banaani] (banaan)', 'natuke [soola] (sool)', 'pudel [vett] (vesi)', 'palju [köögivilju] (köögiviljad)']),
      B.wordforms('026_px_pl', 'Mitmuse osastav.', 'Kirjuta kilo + mitmuse osastav.', [['õun', 'kilo …', 'õunu'], ['kartul', 'kilo …', 'kartuleid'], ['tomat', 'kilo …', 'tomateid'], ['kurk', 'kilo …', 'kurke'], ['pirn', 'kilo …', 'pirne'], ['porgand', 'kilo …', 'porgandeid']]),
      B.translation('026_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Купи два литра молока.', 'Мне нужен килограмм картошки.', 'У нас мало сыра.', 'Дай мне немного соли.', 'Сколько стоит килограмм яблок?']),
      B.dictation('026_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ostsin kaks liitrit piima.', 'Kilo kartuleid maksab üks euro.', 'Meil on vähe juustu.', 'Palun natuke suhkrut.', 'Külmkapis on kümme muna.']),
      B.writing('026_px_write', 'Minu ostunimekiri.', 'Kirjuta 8–10 lauset: mida sa sel nädalal ostad ja kui palju.', [8, 10], ['kilo', 'liitrit', 'pakki', 'natuke', 'palju'], 3),
      B.selfcheck('026_p_self', ['Ma nimetan 15 toiduainet.', 'Ma kasutan 6 koguseväljendit.', 'Ma kirjutan ostunimekirja.', 'Ma mõistan retsepti.'], 'Külmkapp on täis'),
    ],
    transfer: [
      B.text('026_t_situation', 'Uus olukord', 'Sa korraldad sõbra sünnipäevapeo kümnele inimesele. Pead tegema menüü ja ostunimekirja.'),
      B.reading('026_t_tips', 'Loe nõuandeid.', 'Loe ja vasta küsimustele.', 'Kuidas planeerida peotoitu?',
        'Kui tuleb kümme külalist, ei pea kõike väga suurtes kogustes ostma. Kõigepealt mõtle, mida külalised söövad ja joovad. Kas keegi ei söö liha? Kas kellelgi on allergia? Ühe inimese kohta piisab tavaliselt umbes 300 grammist toidust ja pooleteisest liitrist joogist. Salatiks osta kilo tomateid, paar kurki ja natuke juustu. Leiba osta kaks pätsi. Kui teed suppi, on vaja umbes viis liitrit. Magustoiduks sobib kook või puuvili: kolm-neli kilo õunu ja banaane ongi piisav. Ära unusta vett! Lõpuks kontrolli, kas sul on piisavalt taldrikuid ja klaase. Kui külaliste hulgas on lapsi, osta ka mahla ja küpsiseid. Kuivaineid võid osta paar päeva varem. Puu- ja köögiviljad osta aga peo päeval, siis on need värsked. Kirjuta kõik paberile ja võta nimekiri poodi kaasa. Nii ei unusta sa midagi ega osta liiga palju. Hea plaan säästab raha ja aega.',
        [['Mida tuleb kõigepealt mõelda?', 'mida külalised söövad ja joovad'], ['Kui palju toitu on vaja ühe inimese kohta?', 'umbes 300 grammi|300 grammi'], ['Mida osta salatiks?', 'tomateid, kurki ja juustu|kilo tomateid, paar kurki ja natuke juustu'], ['Miks osta puu- ja köögiviljad alles peo päeval?', 'siis on need värsked|et need oleksid värsked'], ['Miks on hea plaan kasulik?', 'säästab raha ja aega']]),
      B.planning('026_t_plan', 'Peo menüü.', 'Planeeri menüü kümnele inimesele.', ['Mis on eelroog?', 'Mis on põhiroog?', 'Mis on magustoit?', 'Mida juuakse?']),
      B.writing('026_t_list', 'Ostunimekiri ja sõnum.', 'Kirjuta sõbrale, mida ja kui palju ta peab ostma. 6–8 lauset.', [6, 8], ['kilo', 'liitrit', 'pakki', 'natuke', 'palju'], 4),
      B.rolecards('026_t_roles', 'Turul.', 'Rääkige 2–3 minutit.',
        'Oled ostja. Osta peoks 4 toodet. Küsi hinda ja kogust.', 'Oled müüja. Paku tooteid, ütle hinnad. Ühte toodet ei ole.',
        ['Palun kilo…', 'Kui palju maksab…?', 'Kas teil on…?'], ['Kui palju te soovite?', 'See maksab…', 'Kahjuks … ei ole, aga on…']),
      B.gaps('026_tx_recipe', 'Retsept.', 'Täida retsept osastavaga.', ['Võta pool kilo [kartuleid] (kartulid).', 'Lisa kaks [sibulat] (sibul).', 'Vala potti kaks liitrit [vett] (vesi).', 'Lisa natuke [soola] (sool) ja [pipart] (pipar).', 'Lõpus lisa klaas [koort] (koor).']),
      B.writing('026_tx_menu', 'Peo kutse.', 'Kirjuta külalistele 8–10 lauset: mida süüakse ja mida igaüks kaasa võtab.', [8, 10], ['tooge', 'palun', 'natuke', 'pudel'], 3),
      B.speaking('026_tx_say', 'Peo plaan.', 'Selgita sõbrale 1–2 minutit peo menüüd ja ostunimekirja.', ['Mida pakume?', 'Mida ostame?', 'Kui palju?'], [60, 120]),
      B.translation('026_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мне нужен килограмм яблок.', 'Сколько стоит литр молока?', 'Дайте, пожалуйста, полкило сыра.', 'У вас есть свежий хлеб?', 'Это всё, спасибо.']),
      B.selfcheck('026_t_self', ['Ma mõistan nõuandeteksti.', 'Ma planeerin menüü.', 'Ma kirjutan koguseid õigesti.', 'Ma ostan turul.'], 'Pidu on planeeritud'),
    ],
  },

  'a2b1-027': {
    title: 'Kohvikus ja restoranis',
    canDo: 'Ma viin läbi 3–4-minutilise teenindusdialoogi ning teen tellimuse iseseisvalt.',
    practice: [
      B.categorize('027_p_who', 'Kes ütleb?', 'Sorteeri: klient või ettekandja?', [
        ['Klient', ['Soovin päevapraadi.', 'Kas selles on piima?', 'Arve palun.', 'Mida te soovitate?']], ['Ettekandja', ['Mida te soovite juua?', 'Kas kõik oli hästi?', 'Kas maksate kaardiga?', 'Toon kohe menüü.']],
      ]),
      B.dialogue('027_p_order', 'Tellimus.', 'Täida dialoog.', 'Ettekandja', 'Klient', [
        ['A', 'Tere õhtust! Mida te [soovite|sooviksite|tellite]?'], ['B', '[Palun] mulle tomatisupp ja kanapraad.'], ['A', 'Ja mida te [joogiks] võtate?'],
        ['B', 'Klaas mahla, palun. Kas kanapraes on [sibulat]?'], ['A', 'Jah, aga saame teha ka [ilma] sibulata.'], ['B', 'Väga hea, aitäh!'],
      ]),
      B.wordorder('027_p_polite', 'Viisakas lause.', 'Pane lause kokku.', [
        'Palun mulle üks tass kohvi.', 'Kas selles salatis on pähkleid?', 'Kas saaks ilma sibulata?', 'Mida te magustoiduks soovitate?', 'Kas ma saan kaardiga maksta?',
      ]),
      B.choice('027_p_menu', 'Vaata menüüd.', 'Menüü: supp 4 €, kanapraad 9 €, kalapraad 11 €, kook 4 €, kohv 2 €. Vali.', [
        ['Mis on kõige kallim?', 'kalapraad', 'kanapraad', 'kook'], ['Mis maksab sama palju kui supp?', 'kook', 'kohv', 'kalapraad'],
        ['Kui palju maksavad kanapraad ja kohv?', '11 eurot', '9 eurot', '13 eurot'], ['Sa ei söö liha. Mida võtad pearoaks?', 'kalapraadi', 'kanapraadi', 'kanapraadi ja kohvi'],
        ['Sul on 6 eurot. Mida saad osta?', 'supi ja kohvi', 'kalapraadi', 'kanapraadi'],
      ], 'full', 'g_use'),
      B.translation('027_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles viisakalt.', ['Мне, пожалуйста, суп дня.', 'В этом блюде есть молоко?', 'Можно без лука?', 'Счёт, пожалуйста.', 'Можно оплатить картой?']),
      B.speaking('027_p_roles', 'Restoranis.', 'Pidage 3-minutiline dialoog: tellimus, küsimus koostise kohta, arve.', [
        'Mida klient tellib?', 'Mida ta küsib koostise kohta?', 'Mida ettekandja soovitab?', 'Kuidas klient maksab?',
      ], [90, 120], ['Soovin…', 'Kas selles on…?', 'Mida te soovitate?', 'Arve palun.']),
      B.reading('027_px_read', 'Loe menüüd ja vestlust.', 'Loe ja vasta.', 'Lõuna kohvikus Kaneel',
        'Kohvikus Kaneel on päevamenüü. Eelroaks on tomatisupp või kõrvitsasupp. Pearoaks on kanapraad riisiga, ahjukala kartulitega või köögiviljaroog. Magustoiduks pakutakse kaneelirulli või jäätist. Lõunamenüü hind on üksteist eurot. Täna tulid kohvikusse Kadri ja tema kolleeg Peeter. Kadri tellis kõrvitsasupi ja köögiviljaroa, sest ta ei söö liha. Peeter võttis tomatisupi ja kanaprae. Ta küsis, kas praes on piima, sest tal on piimaallergia. Ettekandja kontrollis köögis ja ütles, et kaste on ilma piimata. Joogiks tellisid nad kaks klaasi õunamahla. Lõpuks palusid nad arve ja maksid kaardiga eraldi. Kadrile meeldis köögiviljaroog väga, aga Peetri arvates oli kanapraad natuke soolane. Ta ütles seda ettekandjale viisakalt. Ettekandja tänas tagasiside eest ja lubas kokale öelda. Järgmisel nädalal tahavad nad proovida ka kalarooga. Kohvik on neile meeldiv, sest see asub kontori lähedal.',
        [['Mis supid on menüüs?', 'tomatisupp ja kõrvitsasupp'], ['Kui palju maksab lõunamenüü?', 'üksteist eurot|11 eurot'], ['Miks tellis Kadri köögiviljaroa?', 'ta ei söö liha'], ['Mida Peeter küsis?', 'kas praes on piima'], ['Miks see kohvik neile sobib?', 'see asub kontori lähedal|asub kontori lähedal|kontori lähedal'], ['Kuidas nad maksid?', 'kaardiga eraldi']]),
      B.gaps('027_px_phr', 'Tellimuse fraasid.', 'Täida dialoog.', ['[Soovin] päevapraadi.', '[Palun] mulle klaas vett.', 'Kas [selles] on pähkleid?', 'Kas [saaks] ilma sibulata?', '[Joogiks] võtan mahla.', '[Arve] palun.'], ['soovin', 'palun', 'selles', 'saaks', 'joogiks', 'arve', 'soovite', 'arvet']),
      B.match('027_px_who', 'Küsimus ja vastus.', 'Ühenda ettekandja küsimus ja kliendi vastus.', [['Mida te soovite?', 'Tomatisuppi, palun.'], ['Mida te juua soovite?', 'Klaas vett.'], ['Kas kõik oli hästi?', 'Jah, väga maitsev.'], ['Kas maksate kaardiga?', 'Jah, kaardiga.'], ['Kas soovite magustoitu?', 'Ei, aitäh.']], 'full', 'g_use'),
      B.dictation('027_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Soovin päevapraadi.', 'Kas selles on piima?', 'Palun klaas vett.', 'Mida te soovitate?', 'Arve palun.']),
      B.writing('027_px_write', 'Minu lemmikkoht.', 'Kirjuta 8–10 lauset oma lemmikkohvikust või -restoranist.', [8, 10], ['tellin', 'tavaliselt', 'maitsev', 'hind'], 3),
      B.speaking('027_px_say', 'Telli lõuna.', 'Telli paarilisele (ettekandjale) 1–2 minutiga lõuna.', ['Mida soovid?', 'Kas selles on…?', 'Mida joogiks?'], [60, 120]),
      B.selfcheck('027_p_self', ['Ma tellin toitu viisakalt.', 'Ma küsin koostise kohta.', 'Ma mõistan menüüd ja hindu.', 'Ma pidasin 3-minutilise dialoogi.'], 'Head isu!'),
    ],
    transfer: [
      B.reading('027_t_review', 'Loe arvustust.', 'Loe kohviku arvustust ja vasta.', 'Uus kohvik vanalinnas',
        'Eelmisel nädalal avati vanalinnas uus kohvik „Kaneel”. Käisin seal reedel koos kolleegiga. Kohvik on väike, aga hubane, akende all on mugavad diivanid. Menüü ei ole pikk, kuid igaüks leiab midagi. Mina tellisin kõrvitsasupi ja kolleeg võttis kanasalati. Ettekandja oli väga sõbralik ja soovitas meile ka kohalikku õunamahla. Supp oli maitsev ja kuum, salat oli värske. Hinnad on keskmised: supp maksis viis eurot. Ainus miinus oli rahvas. Lõuna ajal oli seal väga palju inimesi. Me pidime vaba lauda kümme minutit ootama. Õnneks tõi ettekandja meile ootamise ajaks vett. Kohvikus saab maksta kaardiga, sularahaga ja telefoniga. Laupäeviti on kohvik avatud kauem, kella kümneni õhtul. Magustoiduks proovisime kaneelirulli, mis oli kohviku nime väärt. Kolleeg ostis neid veel kaks tükki koju kaasa. Soovitan kõigile, aga minge parem enne lõunat!',
        [['Mida autor teistele külastajatele soovitab?', 'minna enne lõunat|tulla enne lõunat|minna kohvikusse enne lõunat'], ['Mida autor tellis?', 'kõrvitsasupi|kõrvitsasuppi'], ['Mida ettekandja soovitas?', 'õunamahla|kohalikku õunamahla'], ['Mis oli miinus?', 'palju inimesi ja pidi ootama|pidi lauda ootama'], ['Mida nad magustoiduks proovisid?', 'kaneelirulli']]),
      B.text('027_t_situation', 'Uus olukord', 'Sa viid välismaa kolleegi lõunale. Ta ei räägi eesti keelt. Sina tellid mõlemale.'),
      B.rolecards('027_t_roles', 'Lõuna kolleegiga.', 'Rääkige 3–4 minutit. Kaks rolli: klient ja ettekandja.',
        'Oled klient. Tellid endale ja kolleegile, kes ei räägi eesti keelt. Kolleeg ei söö piimatooteid.', 'Oled ettekandja. Soovita päevapraadi, vasta koostise küsimustele, too arve.',
        ['Soovime…', 'Kas selles on piima?', 'Kas saaks ilma…?', 'Arve palun.'], ['Täna soovitan…', 'Selles on…', 'Kas maksate koos või eraldi?']),
      B.writing('027_t_mine', 'Kirjuta arvustus.', 'Kirjuta 6–8 lauset kohvikust või restoranist, kus käisid.', [6, 8], ['tellisin', 'maitsev', 'ettekandja', 'soovitan'], 3),
      B.speaking('027_t_recommend', 'Soovita kohta.', 'Soovita sõbrale oma lemmikkohvikut 1 minutiga.', [
        'Kus see on?', 'Mida seal tellida?', 'Millised on hinnad?', 'Miks see sulle meeldib?',
      ], [60, 90]),
      B.dialogue('027_tx_dlg', 'Telli kahele.', 'Täida vestlus.', 'Sina', 'Ettekandja', [
        ['A', 'Tere! Me [soovime] kahte lõunamenüüd.'], ['B', 'Muidugi. Milliseid suppe [soovite]?'], ['A', 'Mulle tomatisupp ja [kolleegile] kõrvitsasupp.'],
        ['B', 'Ja pearoaks?'], ['A', 'Kas kanapraes on [piima]? Kolleegil on allergia.'], ['B', 'Ei ole. Ja [joogiks]?'], ['A', 'Kaks klaasi mahla. Kas saame [arved|arve] eraldi?'],
      ]),
      B.translation('027_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мы хотим заказать обед.', 'Мой коллега не ест мясо.', 'В этом супе есть молоко?', 'Можно счёт отдельно?', 'Всё было очень вкусно.']),
      B.writing('027_tx_review2', 'Arvustus.', 'Kirjuta kohvikule 8–10 lauset arvustus: mida tellisid, mis meeldis ja mis mitte.', [8, 10], ['tellisin', 'maitsev', 'kahjuks', 'soovitan'], 3),
      B.speaking('027_tx_say', 'Restorani valik.', 'Arutage paaris 1–2 minutit, kuhu kolleegiga lõunale minna.', ['Mis sulle meeldib?', 'Kas seal on taimetoitu?', 'Kui palju see maksab?'], [60, 120]),
      B.selfcheck('027_t_self', ['Ma mõistan arvustust.', 'Ma tellin kahele inimesele.', 'Ma kirjutan arvustuse.', 'Ma soovitan kohta.'], 'Teenindus selge'),
    ],
  },

  'a2b1-028': {
    title: 'Partitiiv toidu ja koguse juures',
    canDo: 'Ma valin õige partitiivivormi vähemalt 8 juhul 10-st.',
    practice: [
      B.table('028_p_forms', 'Nimetav ja osastav.', 'Kirjuta osastav (mida?).', 'nimetav, osastav ainsus, osastav mitmus', [
        'piim | [piima] | –', 'vesi | [vett] | –', 'juust | [juustu] | –', 'õun | [õuna] | [õunu]', 'kartul | [kartulit] | [kartuleid]', 'muna | [muna] | [mune]',
      ]),
      B.choice('028_p_pick', 'Vali vorm.', 'Vali õige vorm.', [
        ['Ma joon palju …', 'vett', 'vesi', 'veega'], ['Palun kilo …', 'kartuleid', 'kartulid', 'kartul'], ['Ostsin kaks pudelit …', 'mahla', 'mahl', 'mahlad'],
        ['Kas sul on natuke …?', 'suhkrut', 'suhkur', 'suhkrud'], ['Ma tahan üht …', 'õuna', 'õun', 'õunu'],
      ], 'half', 'g_use'),
      B.gaps('028_p_open', 'Ava sulud.', 'Kirjuta sõna osastavas.', [
        'Hommikul söön ma [putru] (puder).', 'Kas sa jood [kohvi] (kohv) või [teed] (tee)?', 'Supis on palju [porgandeid] (porgandid).', 'Ma ei söö [liha] (liha).', 'Palun klaas [vett] (vesi).', 'Ostsin pool kilo [kala] (kala).',
      ]),
      B.errorfix('028_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma joon palju vesi.', 'Ma joon palju vett.'], ['Palun kaks liitrit piim.', 'Palun kaks liitrit piima.'], ['Ostsin kilo õunad.', 'Ostsin kilo õunu.'], ['Ma ei söö kala ja liha.', 'Ma ei söö kala ega liha.'], ['Lapsed söövad vähe juurvili.', 'Lapsed söövad vähe juurvilja.'],
      ]),
      B.transformation('028_p_neg', 'Eitav lause.', 'Kirjuta eitavalt. Mõtle: pärast ei tuleb osastav.', [
        ['Mul on leib.', 'eitus', 'Mul ei ole leiba.'], ['Ma ostsin juustu.', 'eitus', 'Ma ei ostnud juustu.'], ['Külmkapis on piim.', 'eitus', 'Külmkapis ei ole piima.'],
        ['Ta joob kohvi.', 'eitus', 'Ta ei joo kohvi.'], ['Meil on munad.', 'eitus', 'Meil ei ole mune.'],
      ]),
      B.speaking('028_p_habits', 'Minu toiduharjumused.', 'Räägi 1 minut. Kasuta vähemalt 6 osastavat vormi.', [
        'Mida sa hommikul sööd ja jood?', 'Mida sa ei söö?', 'Mida sa sööd palju, mida vähe?', 'Mida ostad iga nädal?',
      ], [60, 90], ['Ma joon palju…', 'Ma ei söö…', 'Ostan kilo…']),
      B.reading('028_px_read', 'Loe: toitumine.', 'Loe ja vasta.', 'Mida eestlased söövad?',
        'Eestlased söövad palju leiba, eriti musta rukkileiba. Hommikusöögiks süüakse tihti putru, võileiba või jogurtit. Lõunaks eelistavad paljud sooja toitu: suppi, kartuleid ja liha või kala. Suvel süüakse palju värskeid köögivilju ja marju. Metsast korjatakse mustikaid ja seeni. Eestlased joovad palju kohvi ja piima, teed juuakse vähem. Jõulude ajal süüakse verivorsti, hapukapsast ja seapraadi. Viimastel aastatel söövad noored rohkem riisi, pastat ja aasia toite. Paljud inimesed üritavad süüa vähem suhkrut ja rohkem puuvilju. Taimetoitlasi on Eestis järjest rohkem, eriti suuremates linnades. Poodides on nüüd palju taimset piima ja juustu. Paljud koolid pakuvad lastele iga päev ka taimetoitu. Arstid soovitavad süüa iga päev vähemalt viis portsjonit puu- ja köögivilju. Ka kala tuleks süüa vähemalt kaks korda nädalas. Kõige tähtsam on aga süüa mitmekesiselt ja mitte liiga palju.',
        [['Mis leiba eestlased armastavad?', 'musta rukkileiba|rukkileiba'], ['Mida süüakse hommikul?', 'putru, võileiba või jogurtit'], ['Mida korjatakse metsast?', 'mustikaid ja seeni'], ['Mis on eestlaste toidulaual viimastel aastatel muutunud?', 'noored söövad rohkem riisi, pastat ja aasia toite|taimetoitlasi on rohkem|süüakse vähem suhkrut|poodides on taimset piima ja juustu'], ['Mida süüakse jõuludel?', 'verivorsti, hapukapsast ja seapraadi'], ['Mida söövad noored rohkem?', 'riisi, pastat ja aasia toite']]),
      B.choice('028_px_pick2', 'Vali vorm.', 'Vali õige osastav.', [['Ma ei joo …', 'kohvi', 'kohv', 'kohvid'], ['Palun klaas …', 'vett', 'vesi', 'veega'], ['Ostsin kilo …', 'pirne', 'pirn', 'pirnid'], ['Supis on palju …', 'köögivilju', 'köögiviljad', 'köögivili'], ['Tal ei ole …', 'leiba', 'leib', 'leivad'], ['Kas sa sööd …?', 'liha', 'lihal', 'lihad']], 'full', 'g_use'),
      B.translation('028_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я не пью кофе.', 'В супе много овощей.', 'Купи немного хлеба.', 'Мы едим мало сахара.', 'У нас нет молока.']),
      B.dictation('028_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma joon palju vett.', 'Hommikul söön putru.', 'Ma ei söö liha.', 'Ostsin kilo õunu.', 'Külmkapis ei ole piima.']),
      B.writing('028_px_write', 'Minu toidupäev.', 'Kirjuta 8–10 lauset: mida sa eile sõid ja jõid. Kasuta osastavat.', [8, 10], ['sõin', 'jõin', 'natuke', 'palju', 'ei'], 3),
      B.selfcheck('028_p_self', ['Ma moodustan osastava 10 toidusõnast.', 'Ma kasutan osastavat pärast kogust.', 'Ma kasutan osastavat eituses.', 'Ma räägin oma toiduharjumustest.'], 'Partitiiv on sõber'),
    ],
    transfer: [
      B.listening('028_t_recipe', 'Kuula vanaema häälsõnumit.', 'Õpetaja loeb vanaema retsepti kaks korda. Täida lüngad.', [
        'Tere, kullake! Siin vanaema. Sa küsisid minu seenesupi retsepti. Kirjuta üles!', 'Supi jaoks on vaja pool kilo seeni.', 'Kõige paremad on metsaseened, aga sobivad ka poe šampinjonid.',
        'Lisaks vajad kolme kartulit, ühte sibulat ja ühte porgandit.', 'Kõigepealt prae sibul ja seened pannil võiga.', 'Siis pane potti kaks liitrit vett ja lisa tükeldatud kartulid ja porgand.',
        'Keeda umbes kakskümmend minutit, kuni kartulid on pehmed.', 'Seejärel pane seened ja sibul ka potti.', 'Lõpus lisa natuke koort ja soola. Kui tahad, võid lisada ka pipart ja tilli.',
        'Supp on valmis umbes pooles tunnis.', 'Supi kõrvale söö musta leiba. Võid peale panna ka natuke võid.', 'Kui supp jääb üle, pane see külmkappi. Järgmisel päeval on see veel maitsvam.', 'Laupäeval tulen teile külla ja proovin sinu suppi. Head isu!',
      ], ['Seeni on vaja pool [kilo].', 'Lisaks on vaja kolme [kartulit].', 'Sibul ja seened praetakse pannil [võiga|võis].', 'Potti pannakse kaks liitrit [vett].', 'Lõpus lisatakse natuke [koort] ja soola.', 'Supi kõrvale süüakse [leiba|musta leiba].', 'Vanaema tuleb külla [laupäeval].']),
      B.text('028_t_situation', 'Uus olukord', 'Sinu kodus on täna õhtul külalised. Külmkapis on vähe toitu. Sa kirjutad kaaslasele, mida poest tuua.'),
      B.writing('028_t_msg', 'Sõnum kaaslasele.', 'Kirjuta 6–8 lauset: mida on, mida ei ole ja kui palju osta.', [6, 8], ['ei ole', 'palju', 'natuke', 'kilo', 'pakki'], 4),
      B.rolecards('028_t_roles', 'Telefonis poest.', 'Rääkige 2 minutit.',
        'Oled poes. Helista ja küsi, mida täpselt osta ja kui palju.', 'Oled kodus. Ütle, mida on vaja. Üks toode on juba olemas.',
        ['Kui palju … osta?', 'Kas … on veel?'], ['Osta kilo…', 'Piima ei ole vaja, meil on.', 'Natuke…']),
      B.speaking('028_t_recipe2', 'Minu retsept.', 'Räägi 1–2 minutit oma lemmikroast: mida ja kui palju on vaja.', [
        'Mis roog see on?', 'Mida on vaja?', 'Kui palju?', 'Kuidas seda tehakse?',
      ], [60, 120]),
      B.gaps('028_tx_shop', 'Kõne poest.', 'Täida vestlus.', ['Kui palju [kartuleid] (kartulid) osta?', 'Võta kaks kilo [kartuleid] (kartulid).', 'Kas [piima] (piim) on veel vaja?', 'Ei, [piima|piim] (piim) on kodus.', 'Osta ka natuke [juustu] (juust).']),
      B.writing('028_tx_recipe2', 'Minu retsept.', 'Kirjuta oma lemmikroa retsept 8–10 lausega.', [8, 10], ['võta', 'lisa', 'natuke', 'kilo', 'liitrit'], 3),
      B.translation('028_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Купи два килограмма картошки.', 'Молоко есть дома.', 'Добавь немного соли.', 'Мне не нужен сыр.', 'Сколько воды нужно?']),
      B.speaking('028_tx_say', 'Minu toiduharjumused.', 'Räägi 1–2 minutit, mida sa tavaliselt sööd ja mida mitte.', ['Mida sööd hommikul?', 'Mida sa ei söö?', 'Mida ostad iga nädal?'], [60, 120]),
      B.wordorder('028_tx_order', 'Retsepti laused.', 'Pane laused kokku.', ['Võta pool kilo seeni.', 'Vala potti kaks liitrit vett.', 'Lisa lõpus natuke koort.', 'Söö supi kõrvale leiba.', 'Supp on valmis pooles tunnis.']),
      B.selfcheck('028_t_self', ['Ma mõistan kuulatud retsepti.', 'Ma kirjutan, mida osta.', 'Ma täpsustan koguseid telefonis.', 'Ma räägin oma retseptist.'], 'Kokk ja keeleõppija'),
    ],
  },

  'a2b1-029': {
    title: 'Tellimusega on probleem',
    canDo: 'Ma kirjeldan probleemi ja ütlen igas olukorras selgelt, millist lahendust soovin.',
    practice: [
      B.match('029_p_problem', 'Probleem ja lahendus.', 'Ühenda probleem ja sobiv palve.', [
        ['Supp on külm.', 'Kas saaksite selle soojendada?'], ['Ma tellisin kana, aga sain kala.', 'Kas saaksite tellimuse vahetada?'], ['Arvel on üks vale jook.', 'Palun kontrollige arvet.'],
        ['Salatis on pähkleid, aga mul on allergia.', 'Kas saaksite tuua uue salati ilma pähkliteta?'], ['Kahvel puudub.', 'Kas saaksite tuua kahvli?'],
      ], 'full', 'g_use'),
      B.gaps('029_p_complaint', 'Kaebuse ehitus.', 'Täienda laused.', [
        'Vabandage, [ma tellisin] kanapraadi, aga [sain] kalapraadi.', 'See toit on kahjuks [külm].', '[Kas saaksite] selle soojaks teha?', 'Arvel on viga, palun [kontrollige] seda.', 'Mul on pähkliallergia, [seepärast] ei saa ma seda süüa.',
      ], ['ma tellisin', 'sain', 'külm', 'kas saaksite', 'kontrollige', 'seepärast', 'saan', 'kontrollin']),
      B.choice('029_p_polite', 'Viisakas või ebaviisakas?', 'Vali kõige viisakam lause.', [
        ['Toit on külm.', 'Vabandage, kas saaksite selle soojendada?', 'Soojendage see ära.', 'Ma tahan sooja toitu.'],
        ['Arve on vale.', 'Vabandage, mulle tundub, et arvel on viga.', 'Teie arve on vale.', 'Parandage arve ära.'],
        ['Sain vale joogi.', 'Vabandust, ma tellisin teed, aga sain kohvi.', 'See ei ole minu jook.', 'Tooge mulle teed.'],
        ['Ootad toitu pool tundi.', 'Vabandage, kas meie tellimus tuleb varsti?', 'Kus meie toit on?', 'Me ootame juba pool tundi.'],
        ['Taldrik on must.', 'Vabandage, kas saaksin puhta taldriku?', 'Tooge puhas taldrik.', 'See taldrik on must.'],
      ], 'full', 'g_use'),
      B.wordorder('029_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Ma tellisin kanapraadi, aga sain kala.', 'Kas saaksite selle palun vahetada?', 'Supp on kahjuks täiesti külm.', 'Palun kontrollige arvet veel kord.', 'Aitäh, et lahendasite probleemi nii kiiresti.',
      ]),
      B.dialogue('029_p_dialog', 'Vale tellimus.', 'Täida dialoog.', 'Klient', 'Ettekandja', [
        ['A', 'Vabandage, ma [tellisin] tomatisuppi, aga see on seenesupp.'], ['B', 'Oi, vabandust! Ma [toon] kohe õige supi.'], ['A', 'Aitäh. Ja kas [saaksite] tuua ka leiba?'],
        ['B', 'Muidugi. Kas kõik [muu] on korras?'], ['A', 'Jah, aitäh, väga [kiire] teenindus!'],
      ]),
      B.speaking('029_p_scen', 'Neli probleemi.', 'Lahendage paaris neli olukorda: vale roog, külm toit, allergia, vale arve.', [
        'Mis on probleem?', 'Mida sa soovid?', 'Mida ettekandja pakub?', 'Kas lahendus sobib?',
      ], [90, 120], ['Ma tellisin…, aga sain…', 'Kas saaksite…?', 'Palun kontrollige…']),
      B.reading('029_px_read', 'Loe kaebust.', 'Loe kirja ja vasta.', 'Kiri restoranile',
        'Tere! Eile õhtul sõime teie restoranis koos sõpradega. Kahjuks oli meil mitu probleemi. Kõigepealt ootasime toitu peaaegu tund aega, kuigi restoranis ei olnud palju inimesi. Ma tellisin kalaroa, aga sain kanaroa. Kui ütlesin seda ettekandjale, vabandas ta ja tõi õige roa, aga see oli külm. Minu sõber tellis salati ilma pähkliteta, sest tal on allergia, aga salatis olid pähklid. Õnneks märkas ta seda enne söömist. Arvel oli ka üks vein, mida me ei tellinud. Ettekandja parandas arve kohe ja oli väga viisakas. Toit oli siiski maitsev ja koht on ilus. Palun öelge, kuidas te selliseid probleeme tulevikus lahendate. Me tahaksime teie juurde tagasi tulla, sest koht meeldis meile. Ootan teie vastust. Loodan, et järgmisel korral läheb kõik paremini. Lugupidamisega, Mati Kask',
        [['Mida Mati restoranilt kirja lõpus palub?', 'öelda, kuidas nad selliseid probleeme tulevikus lahendavad|vastust|vastata'], ['Mida Mati tellis ja mida sai?', 'kalaroa, aga sai kanaroa'], ['Mis oli õige roaga valesti?', 'see oli külm'], ['Miks oli salat ohtlik?', 'sõbral on pähkliallergia|salatis olid pähklid'], ['Mis oli arvel valesti?', 'vein, mida nad ei tellinud'], ['Mis oli restoranis hea?', 'toit oli maitsev ja koht ilus']]),
      B.transformation('029_px_polite', 'Ütle viisakamalt.', 'Kirjuta viisakas lause.', [['Tooge uus supp!', 'Kas saaksite…?', 'Kas saaksite tuua uue supi?'], ['Arve on vale!', 'mulle tundub', 'Mulle tundub, et arvel on viga.'], ['Ma ei söö seda!', 'kahjuks', 'Kahjuks ma ei saa seda süüa.|Kahjuks ei saa ma seda süüa.'], ['Vahetage see ära!', 'Kas saaksite…?', 'Kas saaksite selle vahetada?'], ['Kus mu toit on?', 'vabandage', 'Vabandage, kas minu toit tuleb varsti?|Vabandage, kas mu toit tuleb varsti?']]),
      B.translation('029_px_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я заказал рыбу, а получил курицу.', 'Суп холодный.', 'Не могли бы вы проверить счёт?', 'У меня аллергия на орехи.', 'Спасибо, что быстро решили проблему.']),
      B.dictation('029_px_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma tellisin kala, aga sain kana.', 'See supp on külm.', 'Kas saaksite selle vahetada?', 'Palun kontrollige arvet.', 'Aitäh abi eest.']),
      B.writing('029_px_write', 'Minu kaebus.', 'Kirjuta 8–10 lauset viisakas kaebus kohvikule.', [8, 10], ['ma tellisin', 'aga', 'kahjuks', 'kas saaksite'], 3),
      B.wordorder('029_px_order2', 'Viisakas kaebus.', 'Pane laused kokku.', ['Vabandage, see supp on külm.', 'Kas saaksite selle soojendada?', 'Palun kontrollige veel kord arvet.', 'Ma tellisin kala, aga sain kana.', 'Aitäh, et lahendasite probleemi.']),
      B.selfcheck('029_p_self', ['Ma kirjeldan probleemi selgelt.', 'Ma ütlen, mida soovin.', 'Ma olen viisakas ka probleemi korral.', 'Ma lahendan 4 olukorda.'], 'Probleem lahendatud'),
    ],
    transfer: [
      B.text('029_t_situation', 'Uus olukord', 'Tellisid toidu koju. Kuller tõi vale toidu ja üks jook puudus. Kirjuta teenindusse ja helista.'),
      B.reading('029_t_terms', 'Loe teenuse tingimusi.', 'Loe ja vasta.', 'Toidukulleri KKK',
        'Mida teha, kui tellimusega on probleem? Kui toit on vale või midagi puudub, kirjutage meile ühe tunni jooksul pärast tellimuse saamist. Lisage tellimuse number ja foto. Kui toit oli külm või hilines rohkem kui 30 minutit, saate järgmisel korral tasuta kohaletoomise. Kui toit oli vale, toome õige toidu kohe või tagastame raha kolme tööpäeva jooksul. Raha tagastame samale kaardile, millega te maksite. Allergiaprobleemide korral helistage kohe meie telefonile 600 1234. Me töötame iga päev kella kümnest hommikul keskööni. Kui kuller ei leia teie maja üles, helistab ta teile. Palun hoidke telefon tellimuse ajal lähedal ja kirjutage tellimusse ka korteri number ja ukse kood. Kui teid ei ole kodus, jätab kuller toidu ukse taha ainult teie loal. Täname, et kasutate meie teenust!',
        [['Millal tuleb probleemist kirjutada?', 'ühe tunni jooksul|tunni jooksul'], ['Mida tuleb kirjale lisada?', 'tellimuse number ja foto'], ['Mida saab, kui toit hilines 40 minutit?', 'tasuta kohaletoomise'], ['Kui kiiresti tagastatakse raha?', 'kolme tööpäeva jooksul'], ['Mida teha allergia korral?', 'helistada|helistada kohe']]),
      B.letter('029_t_mail', 'Kiri teenindusse.', 'Kirjelda probleemi ja ütle, millist lahendust soovid. 60–80 sõna.', 'Tere!', 'Lugupidamisega', [60, 80]),
      B.rolecards('029_t_roles', 'Telefonikõne teenindusse.', 'Rääkige 2–3 minutit.',
        'Sa said vale toidu ja jook puudus. Selgita ja nõua lahendust.', 'Oled teenindaja. Küsi tellimuse numbrit. Paku kaks lahendust.',
        ['Ma tellisin…, aga…', 'Ma soovin…', 'Kas saaksite…?'], ['Mis on teie tellimuse number?', 'Me võime…', 'Kas see sobib?']),
      B.speaking('029_t_story', 'Minu halb teeninduskogemus.', 'Räägi 1–2 minutit tõelisest või väljamõeldud loost.', [
        'Kus see juhtus?', 'Mis läks valesti?', 'Mida sa ütlesid?', 'Kuidas probleem lahenes?',
      ], [60, 120]),
      B.choice('029_tx_rule', 'Mida teha?', 'Vali tingimuste järgi õige vastus.', [['Toit hilines 45 minutit.', 'Saan järgmisel korral tasuta kohaletoomise.', 'Saan raha kolme tööpäeva jooksul tagasi.', 'Kuller toob kohe uue toidu.'], ['Toit oli vale.', 'Tuuakse õige toit või tagastatakse raha.', 'Saan järgmisel korral tasuta kohaletoomise.', 'Raha tagastatakse kuu aja jooksul.'], ['Kirjutan kaks tundi hiljem.', 'Kahjuks on hilja: tuleb kirjutada tunni jooksul.', 'See sobib, kui lisan foto.', 'See sobib, kui lisan tellimuse numbri.'], ['Mul on allergiline reaktsioon.', 'Helistan kohe numbrile 600 1234.', 'Kirjutan teenindusse ja lisan foto.', 'Ootan, kuni kuller helistab.'], ['Kuidas raha tagastatakse?', 'Samale kaardile kolme tööpäeva jooksul.', 'Samale kaardile ühe tunni jooksul.', 'Sularahas järgmise tellimusega.']], 'full', 'g_read'),
      B.translation('029_tx_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я получил не ту еду.', 'Не хватает одного напитка.', 'Номер моего заказа 4521.', 'Верните, пожалуйста, деньги.', 'Спасибо за помощь.']),
      B.writing('029_tx_mail2', 'Kiri kullerfirmale.', 'Kirjuta 8–10 lauset: mis juhtus, mida sa soovid, mis on tellimuse number.', [8, 10], ['tellisin', 'aga', 'palun', 'tellimuse number'], 3),
      B.gaps('029_tx_gaps', 'Kaebuse fraasid.', 'Täida laused.', ['Ma [tellisin] pitsa, aga sain burgeri.', '[Kahjuks] üks jook puudub.', 'Kas [saaksite] tuua õige toidu?', 'Minu tellimuse [number] on 4521.', '[Aitäh] kiire abi eest.'], ['tellisin', 'kahjuks', 'saaksite', 'number', 'aitäh', 'tellin', 'õnneks']),
      B.selfcheck('029_t_self', ['Ma mõistan teenuse tingimusi.', 'Ma kirjutan kaebuse.', 'Ma nõuan telefonis lahendust.', 'Ma jutustan teeninduskogemusest.'], 'Kaebus on viisakas'),
    ],
  },

  'a2b1-030': {
    title: 'Kontroll 6 — toit ja teenindus',
    canDo: 'Ma teen tellimuse, kasutan koguseid ja lahendan lihtsa teenindusprobleemi iseseisvalt.',
    // Harjuta = reading and listening in the A2 exam format, Kasuta = writing and speaking in the A2 exam format
    // (docs/HARNO_LEVEL_REQUIREMENTS.md, A2: reading 1–5, listening 1–3, writing 1–2, speaking 1–2)
    practice: [
      B.tip('030_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See leht on A2 eksami vormis: viisakad väljendid, teated, lühikesed ja pikem tekst, valiklünkadega kiri ja kaks kuulamist. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda.', 'full'),
      B.choice('030_p_etiq', 'Lugemine 1. Mida öelda?', 'Vali olukorda sobiv vastus.', [
        ['Ettekandja toob sulle supi.', 'Aitäh!', 'Palun väga!', 'Head aega!'],
        ['Sõber ütleb lõunal: „Head isu!”', 'Aitäh, sulle ka!', 'Pole tänu väärt!', 'Palun vabandust!'],
        ['Sa lükkasid kogemata kellegi klaasi ümber.', 'Vabandust!', 'Terviseks!', 'Jõudu!'],
        ['Kolleeg ütleb: „Aitäh kohvi eest!”', 'Pole tänu väärt.', 'Head isu.', 'Head aega.'],
        ['Sa tahad ettekandjat kutsuda.', 'Vabandage!', 'Kuule, sina!', 'Tere tulemast!'],
        ['Sa lahkud kohvikust.', 'Head päeva!', 'Tere tulemast!', 'Head isu!'],
        ['Sa tõstad pidulaual klaasi.', 'Terviseks!', 'Jõudu tööle!', 'Vabandust!'],
      ]),
      B.match('030_p_notices', 'Lugemine 2. Teated.', 'Loe teateid. Ühenda olukord ja sobiv teade.', [
        ['Sa tahad süüa pühapäeval kell 22.', 'Pitsabaar Napoli: iga päev 11–24.'],
        ['Sinu sõbral on gluteeniallergia.', 'Meil on ka gluteenivaba leib. Küsi teenindajalt!'],
        ['Sa tahad osta odavalt köögivilju.', 'Turul reedeti kõik köögiviljad –30%.'],
        ['Sa tahad tellida lõunasöögi kontorisse.', 'Toome lõuna tasuta kohale, kui tellid üle 20 € eest.'],
        ['Sa tahad sünnipäevaks suurt torti.', 'Tordid tellimisel: helista kaks päeva ette.'],
        ['Sa tahad hommikul kell seitse kohvi juua.', 'Kohvik Hommik: tööpäeviti avatud 6.30–15.'],
      ], 'full', 'g_read'),
      B.reading('030_p_three', 'Lugemine 3. Kolm inimest.', 'Loe kolme teksti. Kelle kohta lause käib? Kirjuta nimi.', 'Kus ja mida ma söön?',
        'Maria: Minu lemmikkoht on väike kohvik maja kõrval. Käin seal igal hommikul enne tööd. Tellin alati suure tassi kohvi piimaga ja saiakese. Teenindaja teab juba, mida ma soovin. Hinnad on odavad ja muusika on vaikne. Laupäeviti käin seal ka koos tütrega.\n\nOleg: Mina söön kõige meelsamini kodus. Restoranid on minu arvates liiga kallid. Nädalavahetusel teen perele ise süüa. Laupäeval küpsetan pitsat ja pühapäeval teen suure poti suppi. Lapsed aitavad mul köögivilju lõigata. Restoranis käime ainult sünnipäevadel, umbes kaks korda aastas.\n\nKristi: Mulle meeldib proovida uusi kohti. Eelmisel kuul käisin kolmes uues restoranis. Kõige rohkem meeldis mulle India restoran. Seal oli väga maitsev kanakarri, aga natuke liiga terav. Järgmisena tahan minna Jaapani restorani, sest sushi meeldib mulle väga. Tavaliselt lähen sinna koos kolleegidega pärast tööd.',
        [['Kes käib kohvikus iga päev?', 'Maria'], ['Kes teeb nädalavahetusel ise süüa?', 'Oleg'], ['Kes käis hiljuti mitmes uues kohas?', 'Kristi'], ['Kes arvab, et restoranis süüa on kallis?', 'Oleg'], ['Kes sõi midagi teravat?', 'Kristi'], ['Keda tunneb teenindaja juba hästi?', 'Maria']]),
      B.reading('030_p_read', 'Lugemine 4. Pikem tekst.', 'Loe tekst. Vasta lühidalt.', 'Lõuna, mis vajas parandamist',
        'Kristjan läks lõunale uude bistroosse. Bistroo asub kesklinnas, tema kontori lähedal. Ta tellis tomatisupi, kanaprae ja klaasi õunamahla. Supp tuli kiiresti, aga see oli leige. Kristjan palus ettekandjal suppi soojendada. Ettekandja vabandas ja tõi uue, kuuma supi. Ta oli noor ja natuke närviline, sest see oli tema esimene tööpäev. Kanaprae asemel toodi aga kalapraad. Kristjan ütles viisakalt: „Ma tellisin kanapraadi, aga sain kalapraadi.” Ettekandja vahetas toidu kümne minutiga. Arvel oli aga kaks klaasi mahla, kuigi Kristjan jõi ainult ühe. Ta palus arvet kontrollida. Lõpuks sai ta õige arve ja väikese kohvi tasuta. Kristjan kirjutas õhtul bistroo kohta hea arvustuse, sest probleemid lahendati kiiresti ja sõbralikult. Ta kirjutas, et vigu juhtub igal pool. Tähtis on see, kuidas teenindaja käitub. Järgmisel nädalal läks Kristjan sinna uuesti, seekord koos kolleegidega. Seekord oli kõik korras ja ettekandja naeratas.',
        [['Mis oli supiga valesti?', 'see oli leige|leige|supp oli leige'], ['Mida toodi kanaprae asemel?', 'kalapraad|kalaprae|kalapraadi'], ['Mis oli arvel valesti?', 'kaks klaasi mahla|arvel oli kaks klaasi mahla']]),
      B.choice('030_p_mc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali õige vastus.', [
        ['Mida Kristjan joogiks tellis?', 'klaasi õunamahla', 'tassi kohvi', 'pudeli vett'],
        ['Kuidas ettekandja supi probleemi lahendas?', 'tõi uue, kuuma supi', 'andis supi tasuta', 'soovitas teist suppi'],
        ['Miks oli ettekandja närviline?', 'see oli tema esimene tööpäev', 'klient oli väga vihane', 'köögis oli palju tööd'],
        ['Mida Kristjan lõpuks tasuta sai?', 'väikese kohvi', 'tüki kooki', 'teise supi'],
        ['Kellega läks Kristjan järgmisel nädalal bistroosse?', 'kolleegidega', 'oma naisega', 'üksinda'],
      ]),
      B.cloze('030_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Loe kirja. Vali igasse lünka üks sobiv sõna.', 'Tere, Mari!',
        'Laupäeval oli meil kodus suur pidu, sest mu mees sai viiekümneaastaseks. Külalisi oli kakskümmend, ka sinu vend ja tema naine. Reedel käisin poes ja ostsin kaks kilo {*kartuleid|kartulid|kartulite}, kolm pakki {*juustu|juust|juustud} ja palju {*köögivilju|köögiviljad|köögivili}. Vanaema tegi suure {*tordi|tort|torti}. Kahjuks unustasin osta {*leiba|leib|leivad}, aga naaber tõi meile kaks pätsi. Külalised sõid ja {*jõid|joovad|jõi} hommikuni. Kõige rohkem meeldis kõigile minu kartulisalat. Kaks sõbrannat küsisid isegi retsepti.\n\nPärast pidu ei olnud külmkapis enam {*midagi|keegi|mingi}. Järgmisel nädalal tahan sind meile {*õhtusöögile|õhtusöök|õhtusöögil} kutsuda. Ma teen seenesuppi ja küpsetan õunakooki. Kas sul on reedel aega?\n\nSinu Tiiu'),
      B.listening('030_p_listen', 'Kuulamine 1. Teade poes.', 'Õpetaja loeb teate kaks korda. Vasta 1–2 sõnaga.', [
        'Head kliendid! Tere tulemast meie toidupoodi. Palun kuulake tähelepanelikult.', 'Täna, reedel, on meil palju sooduspakkumisi.', 'Puu- ja köögiviljaosakonnas maksab kilo õunu ainult üks euro.', 'Värsked maasikad on täna kolmkümmend protsenti odavamad. Need on Eesti maasikad.',
        'Lihaletist saate osta kanafileed hinnaga viis eurot kilo.', 'Kui ostate kaks pakki kohvi, saate kolmanda paki tasuta.', 'Kalaletis on täna värske lõhe, mis tuli otse Saaremaalt.', 'Leivaosakonnas on kella viiest kõik saiakesed poole hinnaga. Ka must leib on täna soodsam.',
        'Meie kohvikus saate proovida uut kõrvitsasuppi. Esimene tass on tasuta!', 'Tuletame meelde, et laupäeval on pood avatud kella kaheksast kümneni õhtul.', 'Pühapäeval avame alles kell kümme ja suleme kell kaheksa.',
        'Kui teil on küsimusi, pöörduge infoleti poole peaukse juures.', 'Täname, et valisite meie poe, ja ilusat nädalavahetust!',
      ], ['Mis päev täna on? [reede|reedel]', 'Kui palju maksab kilo õunu? [üks euro|1 euro|1 €|euro]', 'Mis kala on täna värske? [lõhe]', 'Mis kellast on saiakesed odavamad? [kella viiest|viiest|kell viis|17]', 'Mida saab kohvikus tasuta proovida? [kõrvitsasuppi|suppi]', 'Mis kell avatakse pood pühapäeval? [kell kümme|kümme|10]', 'Kus on infolett? [peaukse juures|ukse juures]']),
      B.listening('030_p_dialog', 'Kuulamine 2. Kõne restorani.', 'Õpetaja loeb vestluse kaks korda. Täida lüngad.', [
        'Restoran: Restoran Kuldne Kala, tere!', 'Klient: Tere! Ma sooviksin laua broneerida.', 'Restoran: Mis päevaks ja mitmele inimesele?', 'Klient: Laupäevaks, kuuele inimesele. Kell seitse õhtul.',
        'Restoran: Hetk, ma vaatan. Kell seitse on kahjuks kõik lauad täis. Kas kell kaheksa sobib?', 'Klient: Jah, kaheksa sobib ka.', 'Restoran: Väga hea. Mis on teie nimi ja telefoninumber?', 'Klient: Ivan Ivanov, telefon 5512 3456.',
        'Restoran: Aitäh. Kas soovite lauda terrassil või saalis?', 'Klient: Saalis, palun. Õhtul on terrassil juba külm.', 'Klient: Ja üks küsimus: kas teil on ka taimetoitu? Minu tütar ei söö liha.',
        'Restoran: Jah, meil on köögiviljarisotto ja seenesupp.', 'Klient: Suurepärane! Kas autoga saab teie juurde parkida?', 'Restoran: Jah, maja taga on tasuta parkla.', 'Restoran: Kui jääte hiljaks, palun helistage meile.', 'Klient: Muidugi. Aitäh! Kohtumiseni laupäeval!',
      ], ['Klient broneerib laua [laupäevaks].', 'Laud on [kuuele|6] inimesele.', 'Kell seitse on kõik lauad [täis].', 'Laud on broneeritud kella [kaheksaks|8|kaheksa] õhtul.', 'Klient tahab istuda [saalis].', 'Kliendi tütar ei söö [liha].', 'Maja taga on tasuta [parkla].']),
      B.gaps('030_p_part', 'Kogused ja osastav.', 'Kirjuta õige vorm.', [
        'Palun kaks kilo [kartuleid] (kartulid).', 'Ma joon iga päev palju [vett] (vesi).', 'Külmkapis ei ole [piima] (piim).', 'Ostsin kolm pakki [riisi] (riis).', 'Lisa natuke [soola] (sool).', 'Kas sa tahad [teed] (tee)?',
      ]),
      B.errorfix('030_p_fix', 'Paranda vead.', 'Kirjuta laused õigesti.', [
        ['Palun liiter mahl.', 'Palun liiter mahla.'], ['Ma tellisin kana, aga ma saan kala.', 'Ma tellisin kana, aga sain kala.'], ['Ma ei söö liha ja kala.', 'Ma ei söö liha ega kala.'], ['Kas saaksite tooma arve?', 'Kas saaksite arve tuua?|Kas saaksite tuua arve?'], ['Mul ei ole leib.', 'Mul ei ole leiba.'],
      ]),
      B.transformation('030_p_neg', 'Ütle eitavalt.', 'Kirjuta lause eitavalt. Pärast „ei” tuleb osastav.', [
        ['Poes on värske kala.', 'eitus', 'Poes ei ole värsket kala.'], ['Ma tellisin kohvi.', 'eitus', 'Ma ei tellinud kohvi.'], ['Laual on suhkur.', 'eitus', 'Laual ei ole suhkrut.'],
        ['Meil on kartulid.', 'eitus', 'Meil ei ole kartuleid.'], ['Ettekandja tõi arve.', 'eitus', 'Ettekandja ei toonud arvet.'],
      ]),
      B.speaking('030_p_order', 'Kiire tellimus.', 'Telli paarilisele 1 minutiga lõuna: eelroog, pearoog, jook.', ['Mida soovid?', 'Kas selles on…?', 'Mida joogiks?'], [60, 90]),
      B.selfcheck('030_p_self', ['Lugemine: valin viisaka vastuse ja leian teadetest info.', 'Lugemine: vastan pikema teksti valikküsimustele.', 'Lugemine: valin kirjas õige koguse ja vormi.', 'Kuulamine: leian poe teatest ja kõnest vajaliku info.'], 'Eksamivorm proovitud'),
    ],
    transfer: [
      B.text('030_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'A2 eksami vormis: kaks kirjutamisülesannet ja suuline osa paaris. Kirjutamine 1 kasutab seda visiitkaarti: Kalle Kask, kokk ja omanik. Kohvik Kaneel, Rüütli 5, Tartu. Avatud esmaspäevast laupäevani 9–20, pühapäeval suletud. Tel 5566 7788, info@kaneel.ee.'),
      B.reading('030_tx_read', 'Loe restorani vastust.', 'Loe ja vasta.', 'Vastus broneeringule',
        'Tere! Täname broneeringu eest. Oleme reserveerinud teile laua kuuele inimesele reedeks kell kaksteist. Laud on akna all, kus on vaikne. Meie päevamenüüs on alati üks taimetoit ja üks piimavaba roog. Reedel pakume köögiviljarisotot ja ahjulõhet kartulitega. Mõlemad sobivad ka piimaallergiaga inimesele, kui palute ilma koorekastmeta. Kõik saavad maksta eraldi, kaardiga või sularahas. Palun andke teada, kui inimeste arv muutub. Kui jääte hiljaks, hoiame lauda viisteist minutit. Meie restoran asub kesklinnas, raekoja platsi lähedal. Parkimine on meie maja taga tasuta. Kui teil on küsimusi, helistage meile. Meie telefon on avatud iga päev kella kümnest õhtul kümneni. Kui soovite tellida ka tordi, andke sellest palun kaks päeva varem teada. Tort maksab kakskümmend eurot ja seda jätkub kümnele inimesele. Head isu juba ette! Ootame teid!',
        [['Mida tuleb teha, kui inimeste arv muutub?', 'anda restoranile teada|teatada restoranile|anda teada'], ['Mis kell on broneering?', 'kell kaksteist|12'], ['Mis roog on taimetoitlasele?', 'köögiviljarisotto'], ['Mida peab allergiaga inimene paluma?', 'ilma koorekastmeta'], ['Kui kaua hoitakse lauda?', 'viisteist minutit|15 minutit']]),
      B.categorize('030_tx_sort', 'Millal mida öelda?', 'Sorteeri fraasid.', [['Broneerimine', ['Soovin broneerida laua.', 'Mitmele inimesele?', 'Mis kellaks?']], ['Tellimine', ['Soovin päevapraadi.', 'Kas selles on piima?']], ['Maksmine', ['Kas maksame eraldi?', 'Arve palun.', 'Kas saab kaardiga?']]]),
      B.dictation('030_tx_dict', 'Etteütlus.', 'Kuula ja kirjuta.', ['Soovin broneerida laua kuuele.', 'Kas teil on taimetoitu?', 'Kas saame maksta eraldi?', 'Me jääme kümme minutit hiljaks.']),
      B.transformation('030_t_trans', 'Ütle viisakamalt.', 'Kirjuta viisakas lause antud sõnadega.', [
        ['Too mulle vett!', 'Palun…', 'Palun tooge mulle vett.|Palun too mulle vett.'], ['Ma tahan kohvi.', 'Sooviksin…', 'Sooviksin kohvi.|Ma sooviksin kohvi.'],
        ['Anna arve!', 'Kas saaksite…?', 'Kas saaksite arve tuua?|Kas saaksite tuua arve?'], ['Supp on külm!', 'Vabandage…', 'Vabandage, supp on külm.|Vabandage, aga supp on külm.'], ['Tule meile sööma!', 'Kas sa tuleksid…?', 'Kas sa tuleksid meile sööma?'],
      ]),
      B.errorfix('030_t_fix', 'Paranda kutse.', 'Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Tule reedel meile õhtusöök.', 'Tule reedel meile õhtusöögile.'], ['Ma teen kanapraad ja salatit.', 'Ma teen kanapraadi ja salatit.'], ['Palun too kaasa üks pudel mahl.', 'Palun too kaasa üks pudel mahla.'],
        ['Eelmisel korral sa tõid väga hea kook.', 'Eelmisel korral tõid sa väga hea koogi.|Eelmisel korral sa tõid väga hea koogi.'], ['Me ootame sind kell seitse õhtu.', 'Me ootame sind kell seitse õhtul.'],
      ]),
      B.letter('030_t_card', 'Kirjutamine 1. Visiitkaart (vähemalt 25 sõna).', 'Kirjuta sõbrale kohvikust ja kokast: kes, kus, millal avatud, kontakt.', 'Tere, Pille!', 'Head isu!', [25, 40]),
      B.letter('030_t_mail', 'Kirjutamine 2. Kutse õhtusöögile (vähemalt 30 sõna).', 'Kutsu sõber õhtusöögile: millal, kuhu, mida sööme, mida kaasa võtta.', 'Tere, Mari!', 'Ootan vastust!', [30, 50]),
      B.speaking('030_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele lühidalt, 2–3 lausega.', ['Kuidas sa ennast tutvustad?', 'Mida sa tavaliselt hommikul sööd?', 'Kas sa teed meelsasti süüa?', 'Mis on sinu lemmikkohvik ja miks?'], [60, 90]),
      B.speaking('030_t_picture', 'Rääkimine 1. Pildi kirjeldus.', 'Õpetaja annab pildi kohvikust või turust. Kirjelda seda 1 minut.', ['Kus inimesed on?', 'Mida nad ostavad või söövad?', 'Mis on laual või letil?', 'Kus sina tavaliselt toitu ostad?', 'Mida sa viimati kohvikus tellisid?'], [60, 90]),
      B.rolecards('030_t_idea', 'Rääkimine 2. Ideekaart „Toit”.', 'A küsib ideekaardi järgi, B vastab. Siis vahetage rollid.',
        'Ideekaart „Toit”: hommikusöök? lemmiktoit? kus sööd? kes teeb süüa? mida ei söö? restoran? Küsi 6 küsimust.', 'Vasta täislausega. Lisa igale vastusele üks põhjus või detail.',
        ['Mida sa hommikul sööd?', 'Mis on sinu lemmiktoit?', 'Kas sa käid tihti restoranis?'], ['Hommikul ma söön…', 'Mulle meeldib…, sest…', 'Ma ei söö…']),
      B.rolecards('030_t_book', 'Rääkimine 2. Uus kaart: laua broneerimine.', 'Helista restorani. Rääkige 2–3 minutit.',
        'Broneeri laud kuuele. Küsi taimetoidu ja piimavaba toidu kohta.', 'Oled restorani töötaja. Paku aega, küsi nime ja telefoni. Kirjelda kahte rooga.',
        ['Soovin broneerida laua…', 'Kas teil on taimetoitu?', 'Kas … on ilma piimata?'], ['Mis kellaks?', 'Mitmele inimesele?', 'Meil on…']),
      B.rubric('030_t_rubric', 'Kontrolli.', 'Märgi, mis on tehtud.', ['Kirjutamine 1: kes, kus, millal avatud, kontakt.', 'Kirjutamine 2: millal, kuhu, mida sööme, mida kaasa võtta.', 'Kirjutasin vähemalt 25 ja 30 sõna.', 'Kasutasin koguseid osastavaga.', 'Broneerisin laua ja küsisin toidu kohta.']),
      B.selfcheck('030_t_self', ['Kirjutamine: annan visiitkaardi info edasi.', 'Kirjutamine: kirjutan kutse 30–50 sõnaga.', 'Rääkimine: kirjeldan pilti ja vastan küsimustele.', 'Rääkimine: küsin ja vastan ideekaardi järgi.'], 'Moodul 6 tehtud'),
    ],
  },
};
