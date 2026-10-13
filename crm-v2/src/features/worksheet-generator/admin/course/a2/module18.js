// A2 course (A1 → A2 roadmap), module 18 „Teated, juhised ja infost arusaamine” (a2-086…090), stage A2.
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min).
// 086 reads notices and ads (mis? kus? millal? kellele? mida teha?), 087 listens to public announcements (tähelepanu,
// hilineb, väljub, palume), 088 follows a step-by-step instruction (esmalt, seejärel, lõpuks; vajutage, sisestage,
// valige), 089 writes down short facts from what was heard (name, number, time, date, place). 090 „Kontroll 18” is the
// module check in Harno A2 formats: Harjuta = reading (three notices, signs, a ~150-word text, an instruction's order)
// and listening (announcements with 3 options, a dialogue with true/false, a voice message with 1–2-word answers),
// Kasuta = writing 1–2 and speaking (getting to know, picture, idea cards). The teacher reads every transcript twice.
// Grammar in function: palume + da-infinitive and the teie-imperative (086, 088), the ta-form of hilinema / väljuma /
// saabuma and kust? kuhu? kus? with ordinals (087), ordinals and dates in -l (089). Module 17 (plans, agreements)
// comes back in 086 Harjuta.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-18', course: 'a2', title: 'Teated, juhised ja infost arusaamine', level: 'A2' };

export const LESSONS = {
  'a2-086': {
    title: 'Teade ja kuulutus',
    canDo: 'Ma loen trepikoja, poe või kooli lühikest teadet ja leian sealt eesmärgi ning 2–3 olulist fakti: mis, kus, millal, kellele ja mida teha.',
    discover: [
      B.text('086_d_situation', 'Uus kodu, uued teated', 'Anna kolis eelmisel nädalal uude korterisse Kase tänaval. Trepikoja uksel on palju paberit: teade, kuulutused ja kutse. Anna loeb kõik hoolega läbi. Ta tahab teada, mis majas toimub.'),
      B.truefalse('086_d_tf', 'Mida sa arvad?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Anna elab uues kodus juba aasta.', false], ['Teated on trepikoja uksel.', true], ['Uksel on ainult üks paber.', false],
        ['Anna elab Kase tänaval.', true], ['Anna tahab teada, mis majas toimub.', true],
      ]),
      B.vocab('086_d_vocab', 'Teate sõnad', [
        'teade – teate – teadet — объявление, сообщение', 'kuulutus – kuulutuse – kuulutust — (частное) объявление', 'elanik – elaniku – elanikku — жилец',
        'trepikoda – trepikoja – trepikoda — подъезд', 'varuma – varuda – varun — запасать', 'kaduma – kaduda – kaon — пропадать',
        'registreeruma – registreeruda – registreerun — записываться', 'lisainfo – lisainfo – lisainfot — дополнительная информация',
        'tasuta — бесплатно', 'müüa — продаётся', 'palume — просим', 'osalemine – osalemise – osalemist — участие',
      ]),
      B.reading('086_d_read', 'Loe: teated trepikojas.', 'Loe neli teadet ja vasta küsimustele.', 'Kase 7 trepikoja uksel', [
        'A. Head elanikud! Teisipäeval, 14. mail kella 9–15 ei ole majas sooja vett. Torumees parandab keldris torusid. Palume vett varuda. Majaühistu',
        'B. Kadunud kass! Pühapäeva õhtul kadus meie hall kass Miisu. Tal on punane kaelarihm. Kui näete teda, helistage palun numbril 5512 3456. Liis, korter 8',
        'C. Müüa lapse jalgratas 6–9-aastasele. Ratas on heas korras ja sinist värvi. Hind on 40 eurot. Lisainfo: Markus, korter 3, tel 5678 1122.',
        'D. Eesti keele vestlusring raamatukogus igal neljapäeval kell 18. Osalemine on tasuta. Registreeru eelmisel päeval raamatukogu kodulehel. Tule julgelt!',
      ].join('\n\n'), [
        ['Miks ei ole teisipäeval sooja vett?', 'torumees parandab torusid|torusid parandatakse|keldris parandatakse torusid'],
        ['Mida peavad elanikud enne teisipäeva tegema?', 'vett varuma|vett varuda|vett valmis panema'],
        ['Mille järgi saab Miisu ära tunda?', 'punase kaelarihma järgi|tal on punane kaelarihm|hall kass punase kaelarihmaga'],
        ['Kellele sobib Markuse jalgratas?', 'lapsele|6–9-aastasele lapsele|väikesele lapsele'],
        ['Kui palju maksab vestlusring?', 'see on tasuta|tasuta|mitte midagi'],
        ['Vestlusring on neljapäeval. Millal tuleb registreeruda?', 'kolmapäeval|eelmisel päeval|kolmapäeval kodulehel'],
      ]),
      B.table('086_d_grid', 'Viis küsimust.', 'Leia teadetest A ja D vastused. Kirjuta lühidalt.', 'Küsimus, Teade A, Teade D', [
        'Mis? | [sooja vett ei ole/sooja vett pole/ei ole sooja vett] | [vestlusring/eesti keele vestlusring]',
        'Kus? | [majas/keldris] | [raamatukogus]',
        'Millal? | [teisipäeval/14. mail/teisipäeval kella 9–15] | [neljapäeval/igal neljapäeval/neljapäeval kell 18]',
        'Kellele? | [elanikele/majaelanikele] | [keeleõppijatele/kõigile]',
        'Mida peab tegema? | [vett varuma/varuma vett/vett varuda] | [registreeruma/registreeruda]',
      ], 'g_read'),
      B.notice('086_d_rule', 'Hea teade vastab viiele küsimusele.', [
        '**Mis?** sooja vett ei ole · vestlusring · müüa jalgratas',
        '**Kus?** majas · keldris · raamatukogus · korteris 3',
        '**Millal?** teisipäeval kella 9–15 · igal neljapäeval kell 18',
        '**Kellele?** Head elanikud! · lapsele 6–9 aastat',
        '**Mida peab tegema?** Palume vett **varuda**. **Helistage** palun! **Registreeru** kodulehel!',
        'Teates on palve või käsk: **palume + da-vorm** (palume varuda) või käskiv vorm (helista / **helistage**).',
      ], 'full'),
      B.match('086_d_aim', 'Miks teade kirjutati?', 'Ühenda teade ja selle eesmärk.', [
        ['Sooja vett ei ole', 'räägib muutusest majas'], ['Kadunud kass', 'palub abi'], ['Müüa jalgratas', 'pakub asja müüa'],
        ['Vestlusring raamatukogus', 'kutsub üritusele'], ['Ostan garaažikoha', 'otsib midagi osta'], ['Leitud võtmed', 'otsib asja omanikku'],
      ], 'full', 'g_read'),
      B.choice('086_d_do', 'Mida pead tegema?', 'Loe teadet. Vali, mida pead tegema.', [
        ['„Lift ei tööta. Palume kasutada treppi.”', 'minna trepist', 'oodata lifti', 'helistada liftimehele'],
        ['„Raamatukogu on 1.–5. juulini suletud. Raamatud saab panna kasti ukse kõrval.”', 'panna raamatud kasti', 'tuua raamatud 3. juulil', 'helistada raamatukokku'],
        ['„Pakk ootab teid postkontoris. Võtke kaasa isikutunnistus.”', 'võtta dokument kaasa', 'maksta paki eest', 'oodata kodus kullerit'],
        ['„Kooli koosolek on kolmapäeval. Kui te ei saa tulla, kirjutage õpetajale.”', 'kirjutada õpetajale, kui ei saa tulla', 'tulla kindlasti kolmapäeval kooli', 'helistada kooli direktorile'],
        ['„Laupäeval on hoovis koristuspäev. Rehad ja kotid saab majahaldurilt.”', 'küsida reha majahaldurilt', 'osta poest reha ja kotid', 'koristada üksi pühapäeval'],
      ], 'full', 'g_use'),
      B.gaps('086_d_first', 'Kirjuta teade lõpuni.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Palun [helistage] (helistama) numbril 5512 3456.', 'Palume vett [varuda] (varuma).', 'Kui leiate võtmed, [tooge] (tooma) need korterisse 5.',
        'Vestlusringi [registreeru|registreeruge] (registreeruma) kodulehel.', 'Palume uks kinni [panna] (panema).', 'Teisipäeval ei [ole] (olema) majas sooja vett.',
      ]),
      B.wordorder('086_d_order', 'Pane teade kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Pühapäeva õhtul kadus meie hall kass.', 'Palume teisipäeval vett varuda.', 'Osalemine on kõigile tasuta.', 'Lisainfot saab majahaldurilt.', 'Registreeru kodulehel eelmisel päeval.',
      ]),
      B.translation('086_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Продаётся велосипед.', 'Участие бесплатное.', 'Просим запастись водой.', 'Позвоните, пожалуйста, по номеру 5512 3456.', 'Дополнительная информация у управляющего домом.']),
      B.dictation('086_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Head elanikud!', 'Teisipäeval ei ole majas sooja vett.', 'Palume vett varuda.', 'Kadus hall kass.', 'Osalemine on tasuta.', 'Lisainfo telefonil 5678 1122.']),
      B.speaking('086_d_say', 'Teated minu majas.', 'Räägi paarilisele, mis teateid sinu majas või töökohas on.', [
        'Kus teated on: uksel, liftis või internetis?', 'Mis teade oli viimati?', 'Kellele see oli?', 'Mida pidi tegema?',
      ], [45, 75], ['Meie trepikojas on…', 'Viimati oli teade, et…', 'Palume…']),
      B.rolecards('086_d_roles', 'Trepikojas.', 'Anna ja naaber räägivad teadetest. Rääkige 2 minutit.',
        'Sa oled Anna. Sa oled majas uus. Küsi naabrilt teadete kohta: vesi, kass, vestlusring.', 'Sa oled naaber. Vasta Anna küsimustele. Ütle, mida peab tegema.',
        ['Mis päeval ei ole sooja vett?', 'Kelle kass kadus?', 'Kus vestlusring on?'], ['Teisipäeval…', 'Palume…', 'See on tasuta.']),
      B.writing('086_d_write', 'Minu esimene teade.', 'Sa kaotasid võtmed. Kirjuta trepikotta teade 6–7 lausega.', [6, 7], ['kadus', 'palun', 'helistage', 'korter'], 2),
      B.selfcheck('086_d_self', ['Ma leian teatest: mis, kus, millal, kellele.', 'Ma saan aru, mida teade palub teha.', 'Ma tean sõnu teade, kuulutus, tasuta, lisainfo.', 'Ma kirjutan lühikese teate.'], 'Teated on loetud'),
    ],
    practice: [
      B.match('086_p_recall', 'Mäletad?', 'Ühenda sõna ja seletus.', [
        ['tasuta', 'ei maksa midagi'], ['suletud', 'kinni, ei tööta'], ['lisainfo', 'rohkem infot'], ['elanik', 'inimene, kes elab majas'],
        ['varuma', 'panema midagi hilisemaks valmis'], ['registreeruma', 'panema oma nime kirja'],
      ], 'half'),
      B.notice('086_p_board', 'Teadetetahvel poes.', [
        '**A.** Apteek on remondi tõttu suletud 3.–7. märtsini. Lähim apteek on Pargi 2.',
        '**B.** Otsin lapsehoidjat kaheaastasele poisile. Kolm õhtut nädalas. Viktor, tel 5234 8899.',
        '**C.** Tasuta joogatund pargis pühapäeval kell 10. Võta kaasa matt!',
        '**D.** Leitud must rahakott bussipeatuses. Küsi poe kassast.',
        '**E.** Müüa vähe kasutatud diivan. Hind kokkuleppel. Sofia, tel 5345 1212.',
      ], 'full', 'g_read'),
      B.table('086_p_match', 'Kus on see info?', 'Loe teateid A–E. Kirjuta teate täht.', 'Info, Teade (A–E)', [
        'Siin saab sporti teha ilma rahata. | [C]', 'Siin pakutakse tööd. | [B]', 'Ravimeid saab praegu osta teises kohas. | [A]',
        'Kui kaotasid midagi, mine kassasse. | [D]', 'Hinna üle saab rääkida. | [E]',
      ], 'g_read'),
      B.choice('086_p_form', 'Mis vorm sobib?', 'Vali lausesse õige vorm.', [
        ['Palume uks kinni …', 'panna', 'pange', 'panema'],
        ['Kui leiate koera, … palun numbril 5512 3456.', 'helistage', 'helistada', 'helistama'],
        ['Majas ei ole kolmapäeval … vett.', 'sooja', 'soe', 'soojas'],
        ['Raamatukogu on … suletud.', 'esmaspäeval', 'esmaspäev', 'esmaspäevale'],
        ['Osalemiseks palume … kodulehel.', 'registreeruda', 'registreeruge', 'registreerub'],
        ['Lisainfot saab … käest.', 'majahalduri', 'majahaldur', 'majahaldurile'],
      ], 'full', 'g_notice'),
      B.wordforms('086_p_imp', 'Teate käsk: teie-vorm.', 'Kirjuta käskiv vorm (teie).', [
        ['helistama', 'teie', 'helistage'], ['tooma', 'teie', 'tooge'], ['võtma', 'teie', 'võtke'], ['tulema', 'teie', 'tulge'],
        ['panema', 'teie', 'pange'], ['kirjutama', 'teie', 'kirjutage'], ['registreeruma', 'teie', 'registreeruge'],
      ]),
      B.transformation('086_p_polite', 'Ütle viisakamalt.', 'Kirjuta lause sõnaga „palume”.', [
        ['Pange uks kinni!', 'Palume …', 'Palume uks kinni panna.'],
        ['Võtke kaasa isikutunnistus!', 'Palume …', 'Palume kaasa võtta isikutunnistus.|Palume võtta kaasa isikutunnistus.|Palume isikutunnistus kaasa võtta.'],
        ['Ärge suitsetage trepikojas!', 'Palume …', 'Palume trepikojas mitte suitsetada.|Palume mitte suitsetada trepikojas.'],
        ['Helistage majahaldurile!', 'Palume …', 'Palume helistada majahaldurile.|Palume majahaldurile helistada.'],
        ['Tooge raamatud tagasi!', 'Palume …', 'Palume raamatud tagasi tuua.|Palume tuua raamatud tagasi.'],
      ]),
      B.errorfix('086_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palume ei suitsetada.', 'Palume mitte suitsetada.'],
        ['Kontsert toimub laupäevas.', 'Kontsert toimub laupäeval.'],
        ['Pood on avatud kella üheksa kuni kella kuus.', 'Pood on avatud kella üheksast kella kuueni.|Pood on avatud kella üheksast kuni kella kuueni.'],
        ['Ärge parkige auto maja ees.', 'Ärge parkige autot maja ees.'],
        ['Kass kadus pühapäev õhtul.', 'Kass kadus pühapäeva õhtul.'],
      ]),
      // recycling module 17 (plans and agreements) inside a notice
      B.gaps('086_p_plan', 'Teade tulevikust.', 'Täida teade. Kaks sõna jääb üle.', [
        'Järgmisel nädalal [toimub] majas koosolek.', 'Me [kavatseme] hoovi ehitada uue mänguväljaku.', 'Koosolek [algab] kell kuus.',
        'Kui te ei saa tulla, [andke] sellest teada.', 'Siis [lepime] kokku uue aja.',
      ], ['toimub', 'kavatseme', 'algab', 'andke', 'lepime', 'lõpeb', 'tulge']),
      B.categorize('086_p_sort', 'Mis küsimus?', 'Sorteeri teate osad küsimuste järgi.', [
        ['Mis?', ['koosolek', 'remont', 'kirbuturg']], ['Millal?', ['igal neljapäeval', 'kella 9–15', 'järgmisel nädalal']],
        ['Kus?', ['keldris', 'raamatukogus', 'hoovis']], ['Mida teha?', ['palume registreeruda', 'helistage', 'võtke kaasa kindad']],
      ]),
      B.translation('086_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Аптека закрыта на ремонт.', 'Ищу няню для ребёнка.', 'Найден чёрный кошелёк.', 'Цена по договорённости.', 'Возьмите с собой коврик!']),
      B.wordorder('086_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Apteek on remondi tõttu suletud.', 'Võta joogatundi kaasa oma matt.', 'Rahakoti saab kätte poe kassast.', 'Diivani hind on kokkuleppel.', 'Palume teil registreeruda kodulehel.',
      ]),
      B.dictation('086_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Apteek on suletud.', 'Lähim apteek on Pargi tänaval.', 'Otsin lapsehoidjat.', 'Joogatund on tasuta.', 'Leitud must rahakott.', 'Hind kokkuleppel.']),
      B.rolecards('086_p_roles', 'Kõne kuulutuse peale.', 'A helistab Sofiale diivani pärast. Rääkige 2 minutit.',
        'Sa tahad osta diivanit. Küsi värvi, suurust, hinda ja aega.', 'Sa oled Sofia. Vasta küsimustele. Lepi kokku aeg, millal ostja tuleb.',
        ['Tere, ma helistan kuulutuse peale.', 'Mis värvi diivan on?', 'Kas ma saan homme tulla?'], ['Diivan on…', 'Hind on…', 'Lepime kokku…']),
      B.speaking('086_p_tell', 'Räägi naabrile.', 'Vali üks teade A–E. Räägi naabrile, mis seal on.', [
        'Mis teade see on?', 'Kus ja millal?', 'Kellele see on?', 'Mida peab tegema?',
      ], [45, 75], ['Poes on teade, et…', 'See on…', 'Kui sa tahad, pead…']),
      B.writing('086_p_write', 'Kirjuta kuulutus.', 'Kirjuta poe tahvlile kuulutus 6–8 lausega: müüd või otsid midagi.', [6, 8], ['müüa', 'hind', 'helistage', 'lisainfo'], 2),
      B.selfcheck('086_p_self', ['Ma leian teatest õige info.', 'Ma tean: palume + da-vorm, helistage, tooge.', 'Ma parandan teate vead.', 'Ma räägin teatest naabrile.'], 'Teade on selge'),
    ],
    transfer: [
      B.text('086_t_situation', 'Uus olukord', 'Jaan kolib kuu aja pärast Tartusse. Ta tahab müüa oma vana jalgratta. Jaan loeb poe teadetetahvlit ja kirjutab ka ise kuulutuse.'),
      B.reading('086_t_ads', 'Loe kuulutusi.', 'Loe kolme kuulutust. Vasta lühidalt.', 'Poe teadetetahvel', [
        'A. Kolime ja müüme kõik asjad! Laupäeval, 20. aprillil kell 10–14 on meie hoovis kirbuturg. Müüme mööblit, nõusid, raamatuid ja laste riideid. Hinnad on väga head. Kui sajab vihma, oleme garaažis. Lille 4, Viktor ja Sofia',
        'B. Otsin vana raamaturiiulit. Riiul võib olla väike, aga peab olema puidust. Maksan kuni 30 eurot. Saan ise järele tulla, mul on auto. Palun helista õhtuti pärast kella kuut. Markus, tel 5566 7788',
        'C. Lastele tasuta jalgrattakoolitus! Koolitus toimub mai alguses kooli staadionil. Laps peab olema 8–12-aastane. Kaasa tuleb võtta oma jalgratas ja kiiver. Registreeru kuni 25. aprillini kooli kodulehel. Kohti on ainult 20.',
      ].join('\n\n'), [
        ['Kus on kirbuturg, kui sajab vihma?', 'garaažis'],
        ['Mida tahab Markus osta?', 'raamaturiiulit|vana raamaturiiulit'],
        ['Millal võib Markusele helistada?', 'õhtuti pärast kuut|pärast kella kuut|õhtul'],
        ['Mida peab laps koolitusele kaasa võtma?', 'jalgratta ja kiivri|ratta ja kiivri'],
        ['Miks peab koolitusele kiiresti registreeruma?', 'kohti on ainult 20|kohti on vähe'],
      ]),
      B.truefalse('086_t_tf', 'Õige või vale?', 'Loe kuulutusi uuesti. Kas lause on õige või vale?', [
        ['Kirbuturg on pühapäeval.', false], ['Kirbuturul saab osta ka laste riideid.', true], ['Markus tuleb riiulile ise järele.', true],
        ['Markus maksab riiuli eest 50 eurot.', false], ['Jalgrattakoolitus maksab 20 eurot.', false], ['Kuueaastane laps ei saa koolitusele tulla.', true],
      ], 'full'),
      B.planning('086_t_plan', 'Enne kuulutust.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mida sa müüd?', 'Milline see on?', 'Mis on hind?', 'Kuidas sinuga ühendust võtta?']),
      B.letter('086_t_ad', 'Kirjuta kuulutus.', 'Jaan müüb jalgratta. Kirjuta kuulutus: mis, milline, hind, kontakt.', 'Müüa jalgratas!', 'Jaan, tel …', [30, 50]),
      B.writing('086_t_reply', 'Vasta Markusele.', 'Sul on vana riiul. Kirjuta Markusele SMS 4–6 lausega.', [4, 6], ['riiul', 'hind', 'aadress', 'kell'], 2),
      B.rolecards('086_t_call', 'Kõne kuulutuse peale.', 'A helistab kuulutuse peale. Rääkige 2 minutit.',
        'Sa oled Jaan. Sul on raamaturiiul. Helista Markusele ja paku riiulit.', 'Sa oled Markus. Küsi riiuli suuruse, hinna ja aja kohta.',
        ['Tere, ma helistan kuulutuse peale.', 'Riiul on…', 'Hind on…'], ['Kui suur riiul on?', 'Kas ma saan täna tulla?', 'Mis aadressil?']),
      B.table('086_t_form', 'Registreeri laps koolitusele.', 'Täida jalgrattakoolituse vorm.', 'Andmed, Sinu vastus', [
        'Lapse nimi | ', 'Lapse vanus | ', 'Vanema telefon | ', 'Kas lapsel on kiiver? | ', 'Mida laps juba oskab? | ',
      ]),
      B.translation('086_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Продаю велосипед, цена 50 евро.', 'Велосипед в хорошем состоянии.', 'Звоните вечером после шести.', 'Регистрация до 25 апреля.', 'Мест только двадцать.']),
      B.writing('086_t_lost', 'Leitud asi.', 'Leidsid hoovist lapse kiivri. Kirjuta trepikotta teade 4–6 lausega.', [4, 6], ['leitud', 'hoovis', 'palun', 'korter'], 2),
      B.speaking('086_t_say', 'Mis teadetetahvlil on?', 'Räägi sõbrale ühest kuulutusest 1 minut.', [
        'Mis kuulutus see on?', 'Kus ja millal?', 'Kellele see sobib?', 'Mida peab tegema?',
      ], [45, 75]),
      B.speaking('086_t_compare', 'Kus sina kuulutusi loed?', 'Räägi paarilisele: kus sa loed kuulutusi ja miks.', [
        'Kas sa loed kuulutusi poes või internetis?', 'Mida sa oled kuulutusega ostnud või müünud?', 'Mis on hea kuulutus?',
      ], [45, 75]),
      B.selfcheck('086_t_self', [
        'Ma oskan leida kuulutusest, mis, kus, millal ja kellele.', 'Ma oskan öelda, mida kuulutus palub teha.',
        'Ma oskan kasutada sõnu kuulutus, tasuta, lisainfo, müüa.', 'Ma oskan kirjutada kuulutuse 30–50 sõnaga: palume, helistage.',
      ], 'Kuulutus on üleval'),
    ],
  },

  'a2-087': {
    title: 'Avalik teadaanne',
    canDo: 'Ma kuulan jaamas, poes või lennujaamas lühikest teadaannet kaks korda ja saan aru vähemalt 3 asjast 4-st: mis muutus, kus, millal ja mida teha.',
    discover: [
      B.text('087_d_situation', 'Jaamas', 'Viktor sõidab reedel rongiga Tallinnast Tartusse. Ta on Balti jaamas ja ootab rongi. Äkki kuuleb ta valjuhääldist teadet. Viktor kuulab hoolega, sest teade on tema rongi kohta.'),
      B.truefalse('087_d_tf', 'Mida sa arvad?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Viktor sõidab Tartusse bussiga.', false], ['Viktor on Balti jaamas.', true], ['Teade tuleb valjuhääldist.', true],
        ['Viktor ei kuula teadet.', false], ['Teade on Viktori rongi kohta.', true],
      ]),
      B.vocab('087_d_vocab', 'Teadaande sõnad', [
        'tähelepanu — внимание', 'teadaanne – teadaande – teadaannet — (устное) объявление', 'hilinema – hilineda – hilinen — опаздывать',
        'väljuma – väljuda – väljun — отправляться; выходить', 'saabuma – saabuda – saabun — прибывать', 'muutus – muutuse – muutust — изменение',
        'perroon – perrooni – perrooni — перрон, платформа', 'järgmine – järgmise – järgmist — следующий', 'reisija – reisija – reisijat — пассажир',
        'ära jääma – ära jääda – jääb ära — отменяться', 'palume — просим', 'vabandame — приносим извинения',
      ]),
      B.reading('087_d_read', 'Loe: Viktor kuulab teadet.', 'Loe teksti ja vasta küsimustele.', 'Rong hilineb', [
        'Kell on 17.40. Viktor seisab Balti jaamas ja vaatab tablood. Tema rong Tartusse peab väljuma kell 17.52. Siis kuuleb ta teadet:',
        '„Tähelepanu! Rong Tallinn–Tartu hilineb kakskümmend minutit. Rong väljub kell 18.12. Tähelepanu! Muutus perroonil! Rong väljub kolmandalt perroonilt, mitte esimeselt. Vabandame!”',
        'Viktor helistab sõbrale Jaanile. Jaan ootab teda Tartu jaamas. „Mu rong hilineb,” ütleb Viktor. „Ma jõuan Tartusse umbes kell kaheksa.” Jaan vastab, et see pole probleem. Ta läheb vahepeal poodi.',
        'Siis kuuleb Viktor uut teadet: „Palun ärge jätke oma kotte üksi!” Viktor võtab oma koti ja läheb kohvikusse. Ta joob tassi kohvi. Kell kuus läheb ta kolmandale perroonile.',
      ].join('\n\n'), [
        ['Mis kell pidi rong algul väljuma?', '17.52|kell 17.52|kaheksa minutit enne kuut'],
        ['Kui palju rong hilineb?', 'kakskümmend minutit|20 minutit'],
        ['Mis muutus peale aja?', 'perroon|perroon muutus|rong väljub kolmandalt perroonilt'],
        ['Miks Viktor Jaanile helistab?', 'rong hilineb|ta jõuab hiljem|ta jõuab Tartusse hiljem'],
        ['Mida teeb Jaan, kui ta ootab?', 'läheb poodi|ta läheb poodi'],
        ['Miks võtab Viktor oma koti kaasa?', 'kotte ei tohi üksi jätta|teade palub kotte mitte üksi jätta|teade ütles nii'],
      ]),
      B.categorize('087_d_sort', 'Teadaande osad.', 'Sorteeri laused teadaande osadesse.', [
        ['Algus', ['Tähelepanu!', 'Head reisijad!']], ['Muutus', ['Rong hilineb 20 minutit.', 'Rong väljub kolmandalt perroonilt.', 'Buss number viis ei sõida.']],
        ['Palve', ['Palume reisijatel oodata.', 'Palun ärge jätke kotte üksi!']], ['Lõpp', ['Vabandame!', 'Aitäh!']],
      ], 'full', 'g_notice'),
      B.notice('087_d_rule', 'Teadaanne on lühike.', [
        '**1. Tähelepanu!** — kuula nüüd hoolega.',
        '**2. Mis muutus?** Rong **hilineb** 20 minutit. Buss **väljub** kell 18.12. Kontsert **jääb ära**.',
        '**3. Kus?** **kolmandalt** perroonilt (kust?) · **kolmandale** perroonile (kuhu?) · **järgmises** peatuses (kus?)',
        '**4. Mida teha?** **Palume** reisijatel oodata. **Palun ärge jätke** kotte üksi!',
        '**5. Vabandame!** / Aitäh!',
        'Teadaandes on tegusõna ta-vormis: hiline**b**, välju**b**, saabu**b**, alga**b**.',
      ], 'full'),
      B.listening('087_d_listen', 'Kuula kolme teadet.', 'Õpetaja loeb teated kaks korda. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu! Buss number seitse sõidab täna teist teed. Peatus Kesklinn on suletud. Järgmine peatus on Kaubamaja. Vabandame!',
        '2. Head kliendid! Pood suletakse viieteistkümne minuti pärast. Palume teil minna kassasse. Aitäh, et külastasite meid!',
        '3. Tähelepanu! Lennuk Riiga hilineb ühe tunni. Uus väljumise aeg on kell kaksteist kolmkümmend. Palume reisijatel oodata väravas number neli.',
      ], [
        'Buss number [seitse|7] sõidab teist teed.', 'Peatus [Kesklinn] on suletud.', 'Pood suletakse [viieteistkümne|15] minuti pärast.',
        'Kliendid peavad minema [kassasse|kassa juurde].', 'Lennuk Riiga hilineb [ühe tunni|tund|tunni].', 'Reisijad ootavad väravas number [neli|4].',
      ]),
      B.choice('087_d_act', 'Mida sa teed?', 'Loe teadet. Vali õige tegevus.', [
        ['„Rong väljub teiselt perroonilt.”', 'Lähen teisele perroonile.', 'Lähen esimesele perroonile.', 'Ootan järgmist rongi.'],
        ['„Buss number viis täna ei sõida.”', 'Võtan teise bussi või takso.', 'Ootan bussi number viis.', 'Ostan bussi number viis pileti.'],
        ['„Kontsert algab pool tundi hiljem.”', 'Mul on aega kohvi juua.', 'Pean kohe saali jooksma.', 'Kontserti täna ei ole.'],
        ['„Palume reisijatel piletid valmis panna.”', 'Võtan pileti kotist välja.', 'Ostan uue pileti.', 'Panen pileti kotti tagasi.'],
        ['„Järgmine peatus on Kaubamaja.”', 'Kui mul on vaja Kaubamajja, tõusen püsti.', 'Buss seisab Kaubamaja juures tund aega.', 'Kaubamaja on täna suletud.'],
      ], 'full', 'g_use'),
      B.wordforms('087_d_forms', 'Mida teeb rong?', 'Kirjuta tegusõna ta-vormis.', [
        ['hilinema', 'rong …', 'hilineb'], ['väljuma', 'buss …', 'väljub'], ['saabuma', 'lennuk …', 'saabub'],
        ['algama', 'kontsert …', 'algab'], ['muutuma', 'aeg …', 'muutub'], ['sulguma', 'pood …', 'sulgub'],
      ]),
      B.translation('087_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Внимание! Поезд опаздывает на десять минут.', 'Автобус отправляется с третьей платформы.', 'Следующая остановка — Кесклинн.', 'Просим пассажиров подождать.', 'Приносим извинения!']),
      B.dictation('087_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Tähelepanu!', 'Rong hilineb kakskümmend minutit.', 'Rong väljub kolmandalt perroonilt.', 'Järgmine peatus on Kaubamaja.', 'Palume reisijatel oodata.', 'Vabandame!']),
      B.speaking('087_d_say', 'Minu kogemus.', 'Räägi paarilisele ühest teadaandest, mida sa kuulsid.', [
        'Kus sa olid: jaamas, poes või lennujaamas?', 'Mida teade ütles?', 'Mida sa siis tegid?', 'Kas sa said kõigest aru?',
      ], [45, 75], ['Ma olin…', 'Teade ütles, et…', 'Siis ma…']),
      B.gaps('087_d_gaps', 'Täida teadaanne.', 'Kirjuta lünka sobiv sõna. Kaks sõna jääb üle.', [
        '[Tähelepanu]! Buss Tartusse hilineb.', 'Buss [hilineb] kümme minutit.', 'Buss [väljub] kell 15.10.', 'Buss väljub [kolmandalt] platvormilt.', '[Palume] reisijatel oodata.', '[Vabandame]!',
      ], ['tähelepanu', 'hilineb', 'väljub', 'kolmandalt', 'palume', 'vabandame', 'kolmandale', 'saabub']),
      B.rolecards('087_d_roles', 'Viktor helistab Jaanile.', 'Rääkige telefonis 2 minutit.',
        'Sa oled Viktor. Ütle, et rong hilineb. Ütle uus aeg ja millal jõuad.', 'Sa oled Jaan. Küsi aega ja ütle, kus sa ootad.',
        ['Mu rong hilineb…', 'Rong väljub kell…', 'Ma jõuan umbes…'], ['Mis kell sa jõuad?', 'Ma ootan sind…', 'Pole probleemi!']),
      B.writing('087_d_write', 'Sõnum sõbrale.', 'Sinu rong hilineb. Kirjuta sõbrale SMS 4–6 lausega.', [4, 6], ['hilineb', 'väljub', 'perroonilt', 'jõuan'], 2),
      B.selfcheck('087_d_self', ['Ma tean sõnu tähelepanu, hilineb, muutus, järgmine.', 'Ma saan aru, mis muutus: aeg, koht või buss.', 'Ma kirjutan teatest üles aja ja numbri.', 'Ma tean, mida pean pärast teadet tegema.'], 'Kuulan hoolega'),
    ],
    practice: [
      B.crossword('087_p_cross', 'Mäletad?', 'Kirjuta sõna vihje järgi.', [
        ['Inimene, kes sõidab rongi või bussiga', 'reisija'], ['Rong tuleb hiljem, ta …', 'hilineb'], ['Koht jaamas, kus rong seisab', 'perroon'],
        ['Teate esimene sõna: „…!”', 'tähelepanu'], ['Mitte see peatus, vaid …', 'järgmine'], ['Lennuk tuleb kohale, ta …', 'saabub'],
      ]),
      B.choice('087_p_where', 'Kust, kuhu või kus?', 'Vali lausesse õige vorm.', [
        ['Rong väljub … perroonilt.', 'teiselt', 'teisele', 'teisel'],
        ['Rong saabub … perroonile.', 'esimesele', 'esimeselt', 'esimesel'],
        ['Palume oodata … väravas.', 'neljandas', 'neljandasse', 'neljandast'],
        ['Rong hilineb kümme …', 'minutit', 'minut', 'minutiga'],
        ['Me väljume … peatuses.', 'järgmises', 'järgmisesse', 'järgmine'],
        ['Buss sõidab täna … teed.', 'teist', 'teine', 'teisel'],
      ], 'full', 'g_notice'),
      B.gaps('087_p_ann', 'Täida teadaanne.', 'Kirjuta lünka sobiv sõna. Kaks sõna jääb üle.', [
        '[Tähelepanu]! Teade rongi Tallinn–Narva kohta.', 'Rong [hilineb] viisteist minutit.', 'Rong [väljub] kell 9.15.',
        'Rong väljub teiselt [perroonilt].', '[Palume] reisijatel oodata ootesaalis.', '[Vabandame] hilinemise pärast!',
      ], ['tähelepanu', 'hilineb', 'väljub', 'perroonilt', 'palume', 'vabandame', 'saabub', 'perroonile']),
      // Harno A2 listening 1: short announcements, read twice
      B.listening('087_p_listen', 'Kuulamine: seitse lühikest teadet.', 'Õpetaja loeb iga teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        '1. Head reisijad! Rong Tartu suunas väljub kell kaheksa nelikümmend viis teiselt perroonilt.',
        '2. Tähelepanu! Buss number kaksteist ei sõida täna kesklinna. Palun kasutage bussi number kolmteist.',
        '3. Head kliendid! Täna on kõik puuviljad kolmkümmend protsenti odavamad. Pakkumine kehtib kella kaheksani.',
        '4. Tähelepanu! Raamatukogu suletakse kümne minuti pärast. Palume raamatud kohe laenutada.',
        '5. Lugupeetud külastajad! Kontsert algab pool tundi hiljem, kell kaheksa. Saali uksed avatakse kell pool kaheksa.',
        '6. Järgmine peatus on Vabaduse väljak. Palun väljuge tagumisest uksest.',
        '7. Tähelepanu! Lend Helsingisse jääb täna ära. Palume reisijatel minna infolauda.',
      ], [
        'Rong Tartusse väljub [teiselt] perroonilt.', 'Kesklinna saab bussiga number [kolmteist|13].', 'Puuviljad on [kolmkümmend|30] protsenti odavamad.',
        'Raamatukogu suletakse [kümne|10] minuti pärast.', 'Kontsert algab kell [kaheksa|8|20].', 'Bussist tuleb väljuda [tagumisest] uksest.',
        'Lennu reisijad lähevad [infolauda|infolaua juurde].',
      ]),
      B.choice('087_p_mc', 'Kuula uuesti. Vali õige vastus.', 'Vali iga teate kohta õige vastus.', [
        ['Teade 2: mida peab reisija tegema?', 'võtma teise bussi', 'ootama bussi number 12', 'minema jalgsi'],
        ['Teade 3: kui kaua on puuviljad odavamad?', 'kella kaheksani', 'terve nädala', 'kella kolmeni'],
        ['Teade 4: mida raamatukogu palub?', 'laenutada raamatud kohe', 'tulla homme tagasi', 'olla vaikselt'],
        ['Teade 5: mis muutus?', 'kontserdi algusaeg', 'kontserdi koht', 'pileti hind'],
        ['Teade 7: mis juhtub lennuga?', 'see jääb ära', 'see hilineb tunni', 'see väljub teisest väravast'],
      ]),
      B.transformation('087_p_trans', 'Teadaande keel.', 'Ütle sama mõte teadaande sõnaga.', [
        ['Rong tuleb kümme minutit hiljem.', 'hilineb', 'Rong hilineb kümme minutit.'],
        ['Buss läheb jaamast kell viis.', 'väljub', 'Buss väljub jaamast kell viis.'],
        ['Lennuk tuleb Tallinna kell kolm.', 'saabub', 'Lennuk saabub Tallinna kell kolm.'],
        ['Täna kontserti ei ole.', 'jääb ära', 'Kontsert jääb täna ära.|Täna jääb kontsert ära.'],
        ['Oodake, palun!', 'palume', 'Palume oodata.|Palume teil oodata.'],
      ]),
      B.errorfix('087_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Rong väljub teisel perroonil.', 'Rong väljub teiselt perroonilt.'],
        ['Buss hilineb kümme minut.', 'Buss hilineb kümme minutit.'],
        ['Palume reisijad oodata.', 'Palume reisijatel oodata.'],
        ['Lennuk saabub Tallinnas kell kolm.', 'Lennuk saabub Tallinna kell kolm.'],
        ['Kontsert algab pool tund hiljem.', 'Kontsert algab pool tundi hiljem.'],
      ]),
      // recycling 086: palume, tasuta, lisainfo
      B.dialogue('087_p_desk', 'Infolauas.', 'Täida dialoog.', 'Sofia', 'Infolaud', [
        ['A', 'Tere! Ma ei saanud teatest [aru]. Mis rongiga juhtus?'], ['B', 'Rong Tartusse [hilineb] kakskümmend minutit.'],
        ['A', 'Kas rong väljub samalt [perroonilt]?'], ['B', 'Ei, see väljub [kolmandalt] perroonilt.'],
        ['A', 'Kus ma saan vahepeal oodata?'], ['B', 'Ootesaal on teisel korrusel. Kohv on seal täna [tasuta].'],
      ]),
      B.translation('087_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Поезд прибывает на вторую платформу.', 'Концерт отменяется.', 'Следующая остановка — площадь Свободы.', 'Самолёт опаздывает на час.', 'Просим пассажиров пройти к выходу номер четыре.']),
      B.dictation('087_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Rong väljub teiselt perroonilt.', 'Lennuk saabub kell kolm.', 'Kontsert jääb täna ära.', 'Palume reisijatel oodata.', 'Järgmine peatus on Vabaduse väljak.', 'Vabandame hilinemise pärast!']),
      B.rolecards('087_p_roles', 'Jaamas.', 'A ei saanud teadaandest aru. B kordab. Rääkige 2 minutit.',
        'Sa oled reisija. Küsi kõrval seisjalt: mis muutus, mis kell ja kust rong väljub.', 'Sa kuulsid teadet: rong Narva hilineb 15 minutit, väljub 2. perroonilt.',
        ['Vabandust, mida teade ütles?', 'Mis kell rong väljub?', 'Kust perroonilt?'], ['Rong hilineb…', 'See väljub…', 'Palun!']),
      B.speaking('087_p_announce', 'Sina oled teadustaja.', 'Loe kaardilt info ja tee teadaanne. Paariline kirjutab üles.', [
        'Kaart 1: buss nr 3 · hilineb 15 min · peatus Turu', 'Kaart 2: pood · suletakse kell 21 · kassad avatud', 'Kaart 3: rong Pärnusse · 4. perroon · väljub 10.20',
      ], [45, 90], ['Tähelepanu!', '… hilineb …', 'Palume…', 'Vabandame!']),
      B.writing('087_p_write', 'Kirjuta teade tahvlile.', 'Bussijaamas on muutus. Kirjuta infotahvlile teade 5–6 lausega.', [5, 6], ['tähelepanu', 'väljub', 'hilineb', 'palume'], 2),
      B.selfcheck('087_p_self', ['Ma tean teadaande sõnu.', 'Ma tean: väljub teiselt perroonilt, saabub teisele perroonile.', 'Ma kirjutan kuuldust üles numbri ja aja.', 'Ma teen ise lühikese teadaande.'], 'Teadaanne on selge'),
    ],
    transfer: [
      B.text('087_t_situation', 'Uus olukord', 'Sofia lendab Tallinnast Londonisse. Lennujaamas on palju teadaandeid. Siis muutub tema lennu aeg ja värav. Sofia peab kiiresti otsustama, mida teha.'),
      B.reading('087_t_read', 'Loe: lennujaama info.', 'Loe lennujaama kodulehe infot ja vasta.', 'Info reisijale', [
        'Tere tulemast Tallinna lennujaama! Palume tulla lennujaama vähemalt kaks tundi enne lendu. Turvakontroll on teisel korrusel. Seal ei tohi kotis olla suuri pudeleid.',
        'Jälgige ekraane ja kuulake teadaandeid. Lennu aeg ja värav võivad muutuda. Pardale minek algab tavaliselt 40 minutit enne lendu. Värav suletakse 20 minutit enne lendu.',
        'Kui teie lend hilineb rohkem kui kaks tundi, saate infolauast tasuta kohvi ja võileiva. Kui lend jääb ära, minge kohe infolauda. Seal aidatakse teil uus lend leida.',
        'Palun ärge jätke oma kotte üksi! Kui leiate kellegi koti, öelge sellest töötajale.',
      ].join('\n\n'), [
        ['Millal tuleb lennujaama tulla?', 'kaks tundi enne lendu|vähemalt kaks tundi enne'],
        ['Mida ei tohi turvakontrollis kotis olla?', 'suuri pudeleid|suured pudelid'],
        ['Mis võib muutuda?', 'lennu aeg ja värav|aeg ja värav'],
        ['Millal värav suletakse?', '20 minutit enne lendu|kakskümmend minutit enne lendu'],
        ['Mida saab reisija, kui lend hilineb kolm tundi?', 'tasuta kohvi ja võileiva|kohvi ja võileiva'],
      ]),
      B.listening('087_t_air', 'Teated lennujaamas.', 'Õpetaja loeb teated kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu! Lend Londonisse hilineb nelikümmend minutit. Uus väljumise aeg on kell neliteist kakskümmend. Muutus väravas! Lend Londonisse väljub väravast number kaheksa, mitte väravast number kolm.',
        'Head reisijad! Palun ärge jätke oma kotte üksi.',
        'Tähelepanu! Lennu Londonisse reisijad, palun tulge väravasse number kaheksa. Pardale minek algab kell kolmteist viiskümmend. Palume passid ja pardakaardid valmis panna. Aitäh!',
      ], [
        'Lend hilineb [nelikümmend|40] minutit.', 'Uus väljumise aeg on kell [14.20|neliteist kakskümmend].', 'Lend väljub väravast number [kaheksa|8].',
        'Kotte ei tohi jätta [üksi].', 'Pardale minek algab kell [13.50|kolmteist viiskümmend].', 'Valmis tuleb panna pass ja [pardakaart|pardakaardid].',
      ]),
      B.table('087_t_info', 'Mis muutus?', 'Kirjuta tabelisse vana ja uus info.', 'Info, Enne, Nüüd', [
        'Väljumise aeg | 13.40 | [14.20]', 'Värav | [kolm/3] | [kaheksa/8]', 'Pardale minek | 13.10 | [13.50]',
      ], 'g_read'),
      B.choice('087_t_what', 'Mida Sofia teeb?', 'Vali Sofiale õige tegevus.', [
        ['Lend hilineb 40 minutit.', 'Sofia joob rahulikult kohvi.', 'Sofia jookseb kohe väravasse.', 'Sofia ostab uue pileti.'],
        ['Värav muutus: nüüd on see 8.', 'Sofia läheb väravasse number kaheksa.', 'Sofia ootab väravas number kolm.', 'Sofia läheb infolauda piletit ostma.'],
        ['Sofia ei saanud teatest aru.', 'Ta küsib infolauast.', 'Ta läheb koju.', 'Ta ei tee midagi.'],
        ['Pardale minek algab.', 'Ta võtab passi ja pardakaardi.', 'Ta paneb passi kotti.', 'Ta läheb poodi.'],
        ['Teade palub kotte mitte üksi jätta.', 'Sofia võtab koti kaasa.', 'Sofia jätab koti tooli peale.', 'Sofia annab koti võõrale.'],
      ], 'full', 'g_use'),
      B.letter('087_t_sms', 'Sõnum sõbrale.', 'Liis ootab sind Londonis. Kirjuta, mis muutus ja millal jõuad.', 'Tere, Liis!', 'Kohtumiseni!', [25, 40]),
      B.rolecards('087_t_desk', 'Infolauas.', 'A on reisija, B töötab infolauas. Rääkige 2 minutit.',
        'Sa ei saanud teatest aru. Küsi: aeg, värav, mida teha.', 'Sa töötad infolauas. Lend hilineb 40 minutit, värav on 8. Vasta viisakalt.',
        ['Vabandust, ma ei saanud teatest aru.', 'Mis kell lend väljub?', 'Kus on värav number…?'], ['Lend hilineb…', 'Palun minge…', 'Pardale minek algab…']),
      B.translation('087_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мой рейс опаздывает на сорок минут.', 'Выход изменился.', 'Посадка начинается в 13.50.', 'Где выход номер восемь?', 'Я приеду позже.']),
      B.rolecards('087_t_phone', 'Sofia helistab Liisile.', 'Rääkige telefonis 2 minutit.',
        'Sa oled Sofia. Ütle, et lend hilineb. Ütle uus aeg ja palu Liisil hiljem tulla.', 'Sa oled Liis. Küsi, mis kell lennuk saabub ja kus kohtute.',
        ['Mu lend hilineb…', 'Lennuk saabub umbes…', 'Kas sa saad…?'], ['Mis kell sa jõuad?', 'Kus me kohtume?', 'Selge, ma tulen…']),
      B.planning('087_t_plan', 'Enne teadaannet.', 'Sa töötad kaubanduskeskuses. Kirjuta märksõnad.', ['Kellele teade on?', 'Mis muutus?', 'Kus ja millal?', 'Mida inimesed peavad tegema?']),
      B.speaking('087_t_make', 'Tee ise teadaanne.', 'Tee kaubanduskeskuses üks teadaanne. Räägi 1 minut.', [
        'Pood suletakse varem: miks ja millal?', 'Kohvikus on täna allahindlus.', 'Parkla on suletud: kuhu minna?',
      ], [45, 75], ['Head kliendid!', 'Tähelepanu!', 'Palume…', 'Aitäh!']),
      B.writing('087_t_write', 'Teade kirjalikult.', 'Kirjuta oma teadaanne ka infotahvlile. 5–6 lauset.', [5, 6], ['tähelepanu', 'palume', 'muutus', 'vabandame'], 2),
      B.selfcheck('087_t_self', [
        'Ma oskan kuulata teadaannet ja kirjutada üles aja, värava ja numbri.', 'Ma oskan öelda, mis muutus ja mida pean tegema.',
        'Ma oskan kasutada sõnu hilineb, väljub, saabub, muutus.', 'Ma oskan teha lühikese teadaande ja küsida infolauast.',
      ], 'Lennujaamas ei eksi'),
    ],
  },

  'a2-088': {
    title: 'Juhis samm-sammult',
    canDo: 'Ma loen automaadi, kodulehe või masina lühikest juhist ja teen sammud õiges järjekorras ilma iga sõna tõlkimata.',
    discover: [
      B.text('088_d_situation', 'Pakiautomaadis', 'Markus tellis internetist uued kõrvaklapid. Telefoni tuli sõnum: pakk ootab pakiautomaadis. Markus ei ole automaati varem kasutanud. Ekraanil on juhis.'),
      B.truefalse('088_d_tf', 'Mida sa arvad?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Markus ostis kõrvaklapid poest.', false], ['Markus sai telefoni sõnumi.', true], ['Pakk on postkontoris.', false],
        ['Markus on pakiautomaati juba palju kasutanud.', false], ['Automaadi ekraanil on juhis.', true],
      ]),
      B.vocab('088_d_vocab', 'Juhise sõnad', [
        'esmalt — сначала', 'seejärel — затем', 'lõpuks — в конце', 'vajutama – vajutada – vajutan — нажимать', 'sisestama – sisestada – sisestan — вводить',
        'valima – valida – valin — выбирать', 'kinnitama – kinnitada – kinnitan — подтверждать', 'ekraan – ekraani – ekraani — экран',
        'nupp – nupu – nuppu — кнопка', 'kood – koodi – koodi — код', 'avanema – avaneda – avaneb — открываться', 'sulgema – sulgeda – sulgen — закрывать',
      ]),
      B.reading('088_d_read', 'Loe: juhis ja Markuse lugu.', 'Loe teksti ja vasta küsimustele.', 'Kuidas pakk kätte saada?', [
        'Juhis ekraanil:\n1. Esmalt vajutage nuppu „Võta pakk”.\n2. Seejärel valige keel: eesti, vene või inglise.\n3. Sisestage oma telefoninumber.\n4. Sisestage kood. Koodis on kuus numbrit. Kood on teie SMS-is.\n5. Vajutage „OK”. Uks avaneb.\n6. Lõpuks võtke pakk ja sulgege uks.',
        'Markus vajutab nuppu ja valib eesti keele. Ta sisestab telefoninumbri. Siis otsib ta telefonist koodi. Sõnum on vana ja Markus ei leia seda kohe. Ta proovib vale koodi. Ekraanil on punane kiri: „Vale kood!” Lõpuks leiab Markus õige sõnumi. Ta sisestab koodi ja vajutab „OK”. Väike uks avaneb. Markus võtab paki, aga unustab ukse lahti. Automaat piiksub. Markus naerab ja sulgeb ukse.',
      ].join('\n\n'), [
        ['Mida tuleb teha kõigepealt?', 'vajutada nuppu „Võta pakk”|vajutada nuppu|vajutada „Võta pakk”'],
        ['Kust saab koodi?', 'SMS-ist|sõnumist|telefonist'],
        ['Mitu numbrit on koodis?', 'kuus|6'],
        ['Miks on ekraanil punane kiri?', 'Markus sisestas vale koodi|kood oli vale|vale kood'],
        ['Mis juhtub pärast „OK” vajutamist?', 'uks avaneb|väike uks avaneb'],
        ['Miks automaat piiksub?', 'uks on lahti|Markus unustas ukse lahti|uks ei ole kinni'],
      ]),
      B.table('088_d_find', 'Leia juhisest tegusõnad.', 'Kirjuta juhise tegusõna ja selle ma-vorm.', 'Samm, Juhise sõna, ma-vorm', [
        '1. samm | [vajutage] | [vajutama]', '2. samm | [valige] | [valima]', '3. samm | [sisestage] | [sisestama]', '6. samm | [võtke] | [võtma]', '6. samm | [sulgege] | [sulgema]',
      ], 'g_notice'),
      B.notice('088_d_rule', 'Juhise keel: teie-vorm.', [
        '**Järjekord:** **Esmalt** … → **Seejärel** … → **Siis** … → **Lõpuks** …',
        '**da-vorm → teie-käsk:** valida → vali**ge** · sisestada → sisesta**ge** · panna → pan**ge** · võtta → võt**ke** · osta → ost**ke**',
        '**Keeld:** **ärge** + sama vorm: **Ärge unustage** koodi! **Ärge sulgege** akent!',
        '**Mida?** vajutage **nuppu** (osastav) · sisestage **kood** · võtke **pakk** (terve asi)',
        'Sõbrale ütled sa-vormis: **vajuta, vali, sisesta, võta**.',
      ], 'full'),
      B.match('088_d_pairs', 'Mis käib kokku?', 'Ühenda tegusõna ja sõna.', [
        ['sisestage', 'PIN-kood'], ['valige', 'keel'], ['vajutage', 'rohelist nuppu'], ['võtke', 'tšekk'], ['kinnitage', 'makse'], ['sulgege', 'uks'],
      ], 'half'),
      B.gaps('088_d_first', 'Kohvimasina juhis.', 'Täida juhis. Kaks sõna jääb üle.', [
        '[Esmalt] pange tass masina alla.', '[Seejärel] valige kohv: must kohv või latte.', 'Vajutage [nuppu] „Start”.',
        'Oodake, kuni masin [lõpetab].', '[Lõpuks] võtke tass ja nautige kohvi!',
      ], ['esmalt', 'seejärel', 'nuppu', 'lõpetab', 'lõpuks', 'nupp', 'alguses']),
      B.wordorder('088_d_order', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Esmalt valige oma keel.', 'Seejärel sisestage telefoninumber.', 'Vajutage rohelist nuppu.', 'Lõpuks võtke pakk välja.', 'Ärge unustage ust sulgeda.',
      ]),
      B.translation('088_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Сначала нажмите зелёную кнопку.', 'Затем выберите язык.', 'Введите код.', 'В конце закройте дверь.', 'Не забудьте чек!']),
      B.dictation('088_d_dict', 'Etteütlus.', 'Kuula ja kirjuta juhis.', ['Esmalt vajutage nuppu.', 'Seejärel valige keel.', 'Sisestage kood.', 'Uks avaneb.', 'Lõpuks võtke pakk.', 'Sulgege uks.']),
      B.speaking('088_d_say', 'Kuidas see käib?', 'Selgita paarilisele, kuidas kasutada veekeetjat või pesumasinat.', [
        'Mida teha esmalt?', 'Mida teha seejärel?', 'Mida teha lõpuks?', 'Mida ei tohi unustada?',
      ], [45, 75], ['Esmalt…', 'Seejärel…', 'Lõpuks…', 'Ära unusta…']),
      B.choice('088_d_mean', 'Mida ekraan ütleb?', 'Vali õige tähendus.', [
        ['„Vale kood!”', 'Kood ei sobi, proovi uuesti.', 'Kood on õige.', 'Automaat on katki.'],
        ['„Uks avaneb.”', 'Uks läheb lahti.', 'Uks läheb kinni.', 'Uks on katki.'],
        ['„Sulgege uks.”', 'Pange uks kinni.', 'Tehke uks lahti.', 'Oodake ukse juures.'],
        ['„Valige keel.”', 'Vajutage keele nimele.', 'Rääkige eesti keeles.', 'Kirjutage oma keel.'],
        ['„Sisestage kood.”', 'Kirjutage kood.', 'Öelge kood.', 'Unustage kood.'],
      ], 'full', 'g_vocab'),
      B.rolecards('088_d_roles', 'Markus aitab sõpra.', 'Sõber on pakiautomaadi juures. Rääkige telefonis 2 minutit.',
        'Sa oled Markus. Selgita sõbrale samm-sammult, kuidas pakk kätte saada.', 'Sa oled sõber. Sa ei leia koodi. Küsi iga sammu kohta.',
        ['Esmalt vajuta…', 'Seejärel vali…', 'Kood on sinu SMS-is.'], ['Mida ma nüüd teen?', 'Kus kood on?', 'Uks avanes!']),
      B.writing('088_d_write', 'Kirjuta juhis.', 'Kirjuta sõbrale juhis 5–6 sammuga: kuidas teed keeta.', [5, 6], ['esmalt', 'seejärel', 'lõpuks', 'pane'], 3),
      B.selfcheck('088_d_self', ['Ma tean sõnu esmalt, seejärel, lõpuks.', 'Ma leian juhisest tegusõnad: vajutage, sisestage, valige.', 'Ma saan aru, mida automaat palub.', 'Ma selgitan lühidalt, kuidas masin töötab.'], 'Samm-sammult'),
    ],
    practice: [
      B.match('088_p_recall', 'Mäletad?', 'Ühenda sõna ja tähendus.', [
        ['sisestama', 'kirjutama numbrid või tähed masinasse'], ['kinnitama', 'ütlema „jah”, vajutama „OK”'], ['esmalt', 'kõige alguses'],
        ['seejärel', 'pärast seda'], ['avanema', 'minema lahti'], ['ekraan', 'masina osa, kus on tekst'],
      ], 'half'),
      B.wordforms('088_p_imp', 'Juhise vorm.', 'Kirjuta käskiv vorm (teie).', [
        ['vajutama (vajutada)', 'teie', 'vajutage'], ['valima (valida)', 'teie', 'valige'], ['sisestama (sisestada)', 'teie', 'sisestage'], ['võtma (võtta)', 'teie', 'võtke'],
        ['ostma (osta)', 'teie', 'ostke'], ['panema (panna)', 'teie', 'pange'], ['sulgema (sulgeda)', 'teie', 'sulgege'], ['tulema (tulla)', 'teie', 'tulge'],
      ]),
      B.choice('088_p_form', 'Vali õige vorm.', 'Vali lausesse õige vorm.', [
        ['Palun … kaart terminali.', 'sisestage', 'sisestama', 'sisestate'],
        ['Ärge … PIN-koodi teistele!', 'öelge', 'ütlege', 'ütle'],
        ['… rohelist nuppu.', 'Vajutage', 'Vajutama', 'Vajutate'],
        ['Lõpuks võtke …', 'tšekk', 'tšeki', 'tšekile'],
        ['Esmalt … keel.', 'valige', 'valida', 'valite'],
        ['Ärge … ust lahti!', 'jätke', 'jätta', 'jätate'],
      ], 'full', 'g_notice'),
      B.table('088_p_order', 'Pane sammud järjekorda.', 'Pileti ostmine automaadist. Kirjuta sammu number (1–6).', 'Samm, Number', [
        'Valige pileti tüüp: tavapilet või sooduspilet. | [2]', 'Lõpuks võtke pilet ja tšekk. | [6]', 'Esmalt valige sihtkoht. | [1]',
        'Sisestage kaart ja PIN-kood. | [4]', 'Kontrollige hinda ekraanil. | [3]', 'Oodake, kuni automaat pileti trükib. | [5]',
      ], 'g_read'),
      B.transformation('088_p_sa', 'Sõbrale või võõrale?', 'Kirjuta juhis teie-vormis.', [
        ['Vajuta rohelist nuppu.', 'teie', 'Vajutage rohelist nuppu.'], ['Vali keel.', 'teie', 'Valige keel.'], ['Sisesta kood.', 'teie', 'Sisestage kood.'],
        ['Võta tšekk.', 'teie', 'Võtke tšekk.'], ['Ära unusta kaarti!', 'teie', 'Ärge unustage kaarti!'],
      ]),
      B.errorfix('088_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Vajutage roheline nupp.', 'Vajutage rohelist nuppu.'], ['Sisestage teie PIN-kood.', 'Sisestage oma PIN-kood.'],
        ['Ärge unustage kaardi võtta.', 'Ärge unustage kaarti võtta.'], ['Esmalt valige keelt.', 'Esmalt valige keel.'], ['Ärge sulgege ukse!', 'Ärge sulgege ust!'],
      ]),
      // recycling 086–087: suletud, helistage, hilineb
      B.gaps('088_p_mix', 'Teade ja juhis.', 'Täida laused. Kaks sõna jääb üle.', [
        'Tähelepanu! Pakiautomaat on täna [suletud] kella kümneni.', 'Kui automaat ei tööta, [helistage] numbril 1234.', 'Rong [hilineb], seega ostan pileti automaadist.',
        'Pileti ostmiseks [valige] esmalt sihtkoht.', 'Kui kood ei sobi, [proovige] uuesti.', 'Pakk ootab teid automaadis [seitse] päeva.',
      ], ['suletud', 'helistage', 'hilineb', 'valige', 'proovige', 'seitse', 'helistama', 'valida']),
      B.wordorder('088_p_wo', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Esmalt valige sihtkoht.', 'Seejärel sisestage oma kaart.', 'Ärge öelge PIN-koodi teistele.', 'Lõpuks võtke pilet ja tšekk.', 'Kontrollige hinda ekraanil.',
      ]),
      B.translation('088_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Выберите тип билета.', 'Вставьте карту и введите PIN-код.', 'Подождите, пока автомат напечатает билет.', 'Не оставляйте дверь открытой!', 'Подтвердите платёж.']),
      B.rolecards('088_p_roles', 'Automaadi juures.', 'A ei oska piletit osta. B aitab. Rääkige 2 minutit.',
        'Sa oled turist. Sa ei tea, kuidas automaat töötab. Küsi abi.', 'Sa aitad. Selgita samm-sammult teie-vormis.',
        ['Vabandust, kas te saaksite aidata?', 'Mida ma nüüd vajutan?', 'Kus on kaart?'], ['Esmalt valige…', 'Seejärel sisestage…', 'Lõpuks võtke…']),
      B.speaking('088_p_explain', 'Selgita vanaemale.', 'Vanaema tahab osta piletit automaadist. Selgita samm-sammult.', [
        'Mida ta teeb esmalt?', 'Mida seejärel?', 'Kuidas ta maksab?', 'Mida ta lõpuks võtab?',
      ], [60, 90], ['Esmalt vali…', 'Seejärel pane…', 'Lõpuks võta…']),
      B.dictation('088_p_dict', 'Etteütlus.', 'Kuula ja kirjuta juhis.', ['Esmalt valige keel.', 'Seejärel sisestage kood.', 'Vajutage rohelist nuppu.', 'Uks avaneb.', 'Lõpuks võtke pakk.', 'Ärge unustage ust sulgeda.']),
      B.writing('088_p_write', 'Minu juhis.', 'Kirjuta juhis 5–7 sammuga: kuidas osta piletit veebist.', [5, 7], ['esmalt', 'seejärel', 'valige', 'lõpuks'], 3),
      B.selfcheck('088_p_self', ['Ma moodustan teie-käsu: vajutage, võtke, pange.', 'Ma panen juhise sammud järjekorda.', 'Ma parandan juhise vead.', 'Ma selgitan juhist suuliselt.'], 'Juhis on selge'),
    ],
    transfer: [
      B.text('088_t_situation', 'Uus olukord', 'Liisi vanaema tahab perearsti juurde aega panna. Kliinikul on uus koduleht. Vanaema helistab Liisile ja küsib abi. Liis loeb juhist ja selgitab.'),
      B.reading('088_t_read', 'Loe juhist.', 'Loe kodulehe juhist ja vasta.', 'Kuidas broneerida aega perearsti juurde', [
        'Aega saab broneerida meie kodulehel. Esmalt vajutage üleval paremal nuppu „Broneeri aeg”. Seejärel valige oma arst. Kalendris on vabad ajad rohelised. Valige sobiv päev ja kellaaeg.',
        'Siis sisestage oma nimi, isikukood ja telefoninumber. Kontrollige andmed hoolega üle. Lõpuks vajutage nuppu „Kinnita”. Mõne minuti pärast saate SMS-i. Sõnumis on aeg ja kabineti number.',
        'Kui te ei saa tulla, tühistage aeg vähemalt üks päev varem. Seda saab teha samal kodulehel või telefoni teel. Palume tulla vastuvõtule kümme minutit varem.',
        'Kui teil on palavik, ärge tulge kliinikusse. Helistage siis pereõele numbril 742 1234. Pereõde vastab tööpäeviti kella kaheksast neljani.',
      ].join('\n\n'), [
        ['Mida tuleb teha kõigepealt?', 'vajutada nuppu „Broneeri aeg”|vajutada nuppu'],
        ['Mis värvi on vabad ajad?', 'rohelised|roheline'],
        ['Mida tuleb sisestada?', 'nimi, isikukood ja telefoninumber|nime, isikukoodi ja telefoninumbri'],
        ['Mis on SMS-is?', 'aeg ja kabineti number|aeg ja kabinet'],
        ['Millal tuleb aeg tühistada?', 'vähemalt üks päev varem|päev varem'],
        ['Mida peab tegema, kui on palavik?', 'helistama pereõele|helistama, mitte tulema'],
      ]),
      B.table('088_t_steps', 'Mis järjekorras?', 'Kirjuta kodulehe juhise sammud järjekorras (1–5).', 'Samm, Number', [
        'Sisestage nimi ja isikukood. | [3]', 'Vajutage „Broneeri aeg”. | [1]', 'Vajutage „Kinnita”. | [5]', 'Valige arst, päev ja kellaaeg. | [2]', 'Kontrollige andmed üle. | [4]',
      ], 'g_read'),
      B.choice('088_t_mean', 'Mida juhis tähendab?', 'Vali õige tähendus.', [
        ['„Kinnitage makse.”', 'Vajutage „Jah” või „OK”.', 'Makske uuesti.', 'Tühistage ost.'],
        ['„Ärge sulgege akent.”', 'Aken peab lahti jääma.', 'Pange aken kinni.', 'Avage uus aken.'],
        ['„Sisestage isikukood.”', 'Kirjutage oma isikukood.', 'Öelge isikukood valjult.', 'Võtke isikukood kaasa.'],
        ['„Valige sobiv aeg.”', 'Vajutage ajale, mis teile sobib.', 'Oodake, kuni aeg tuleb.', 'Kirjutage arstile kiri.'],
        ['„Tühistage aeg päev varem.”', 'Kui te ei tule, öelge päev ette.', 'Tulge päev varem kohale.', 'Broneerige kaks aega.'],
      ], 'full', 'g_vocab'),
      B.rolecards('088_t_call', 'Liis aitab vanaema.', 'Rääkige telefonis 2–3 minutit.',
        'Sa oled Liis. Selgita vanaemale juhist samm-sammult.', 'Sa oled vanaema. Sa ei leia nuppu. Küsi iga sammu kohta.',
        ['Esmalt vajuta…', 'Seejärel vali…', 'Lõpuks…'], ['Kus see nupp on?', 'Mida ma nüüd teen?', 'Kas ma pean midagi kirjutama?']),
      B.letter('088_t_msg', 'Sõnum vanaemale.', 'Kirjuta vanaemale lühike juhis: kuidas aega tühistada.', 'Kallis vanaema!', 'Kalli-kalli, Liis', [30, 50]),
      B.transformation('088_t_sa', 'Vanaemale sa-vormis.', 'Kirjuta kodulehe juhis vanaemale sa-vormis.', [
        ['Vajutage nuppu „Broneeri aeg”.', 'sina', 'Vajuta nuppu „Broneeri aeg”.'], ['Valige oma arst.', 'sina', 'Vali oma arst.'],
        ['Sisestage isikukood.', 'sina', 'Sisesta isikukood.'], ['Kontrollige andmed üle.', 'sina', 'Kontrolli andmed üle.'], ['Ärge tulge palavikuga.', 'sina', 'Ära tule palavikuga.'],
      ]),
      B.gaps('088_t_gaps', 'Printeri juhis.', 'Täida juhis. Kaks sõna jääb üle.', [
        '[Esmalt] lülitage printer sisse.', 'Seejärel [sisestage] oma kood.', '[Valige] dokument ja paberi suurus.', 'Vajutage rohelist [nuppu].', 'Oodake, kuni printer [lõpetab].', '[Lõpuks] võtke paberid.',
      ], ['esmalt', 'sisestage', 'valige', 'nuppu', 'lõpetab', 'lõpuks', 'nupp', 'sisestama']),
      B.dictation('088_t_dict', 'Etteütlus.', 'Kuula ja kirjuta juhis.', ['Esmalt vajutage nuppu.', 'Seejärel valige arst.', 'Sisestage oma isikukood.', 'Kontrollige andmed üle.', 'Lõpuks vajutage „Kinnita”.', 'Ärge tulge palavikuga.']),
      B.rolecards('088_t_colleague', 'Uus kolleeg.', 'B on tööl esimest päeva. A selgitab printerit. Rääkige 2 minutit.',
        'Sa töötad siin kaua. Selgita printerit samm-sammult.', 'Sa oled uus. Küsi, kuidas printida ja mida teha, kui printer ei tööta.',
        ['Esmalt lülita…', 'Seejärel sisesta…', 'Ära unusta…'], ['Kuidas ma printin?', 'Kus on kood?', 'Mida teha, kui paber on otsas?']),
      B.writing('088_t_write', 'Juhis uuele kolleegile.', 'Kirjuta juhis 6–8 sammuga: kuidas kasutada kohvimasinat või printerit.', [6, 8], ['esmalt', 'seejärel', 'lõpuks', 'ärge'], 3),
      B.speaking('088_t_say', 'Näita ja selgita.', 'Selgita paarilisele, kuidas teha midagi telefonis. Paariline teeb kaasa.', [
        'Mida avada esmalt?', 'Mida vajutada seejärel?', 'Mida sisestada?', 'Kuidas lõpetada?',
      ], [60, 90]),
      B.selfcheck('088_t_self', [
        'Ma oskan lugeda juhist ja teha sammud õiges järjekorras.', 'Ma oskan kasutada sõnu esmalt, seejärel, lõpuks, sisestage, kinnitage.',
        'Ma oskan kirjutada juhise teie-vormis: vajutage, sisestage, valige.', 'Ma oskan selgitada juhist telefonis.',
      ], 'Samm-sammult selge'),
    ],
  },

  'a2-089': {
    title: 'Lühivastus kuuldu põhjal',
    canDo: 'Ma kuulan telefonikõnet või häälsõnumit ja kirjutan õigesti üles vähemalt 8 fakti 10-st: nime, numbri, kellaaja, kuupäeva ja koha.',
    discover: [
      B.text('089_d_situation', 'Telefonikõne', 'Liisil on hambavalu. Ta helistab kliinikusse ja saab uue aja. Ta peab kiiresti üles kirjutama aja, kuupäeva ja kabineti. Liis ütleb: „Vabandust, kas te saaksite korrata?”'),
      B.truefalse('089_d_tf', 'Mida sa arvad?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Liisil valutab hammas.', true], ['Liis läheb kliinikusse ilma ajata.', false], ['Liis kirjutab info üles.', true],
        ['Liis saab kõigest kohe aru.', false], ['Liis palub korrata.', true],
      ]),
      B.vocab('089_d_vocab', 'Kõne sõnad', [
        'kuupäev – kuupäeva – kuupäeva — дата', 'kellaaeg – kellaaja – kellaaega — время', 'kabinet – kabineti – kabinetti — кабинет',
        'korrus – korruse – korrust — этаж', 'aadress – aadressi – aadressi — адрес', 'perekonnanimi – perekonnanime – perekonnanime — фамилия',
        'tähthaaval — по буквам', 'kordama – korrata – kordan — повторять', 'aeglasemalt — медленнее',
        'üles kirjutama – üles kirjutada – kirjutan üles — записывать', 'kolmas – kolmanda – kolmandat — третий', 'kahekümnes – kahekümnenda – kahekümnendat — двадцатый',
      ]),
      B.reading('089_d_read', 'Loe: Liis helistab.', 'Loe vestlust ja vasta küsimustele.', 'Hambakliiniku registratuur', [
        '— Tere! Hambakliinik, Sofia kuulab.', '— Tere! Minu nimi on Liis Tamm. Mul valutab hammas. Kas ma saaksin aja?',
        '— Kas teile sobib neljapäeval, kahekümne kolmandal mail?', '— Jah, sobib. Mis kell?', '— Kell neliteist kolmkümmend. Arst on doktor Kask.',
        '— Vabandust, kas te saaksite korrata? Mis kell?', '— Kell pool kolm. Kabinet on kolmandal korrusel, number kolmsada kaksteist.',
        '— Aitäh! Kas ma pean midagi kaasa võtma?', '— Võtke kaasa isikutunnistus. Palun öelge oma telefoninumber.', '— Viis-viis, üks-kaks, kolm-neli, viis-kuus.',
        '— Aitäh! Teile tuleb ka SMS. Kui te ei saa tulla, helistage meile päev varem.', '— Selge. Suur aitäh! Head päeva!',
      ], [
        ['Miks Liis helistab?', 'tal valutab hammas|hambavalu|ta tahab aega'],
        ['Mis kuupäeval on aeg?', '23. mail|kahekümne kolmandal mail|neljapäeval, 23. mail'],
        ['Mis kell on aeg?', '14.30|pool kolm|kell pool kolm'],
        ['Mitmendal korrusel on kabinet?', 'kolmandal|3.|kolmandal korrusel'],
        ['Mis on Liisi telefoninumber?', '5512 3456|55123456'],
        ['Miks palub Liis korrata?', 'ta ei saanud kellaajast aru|ta ei saanud aru|ta ei kuulnud kellaaega'],
      ]),
      B.table('089_d_note', 'Kuidas see kirjas on?', 'Leia vestlusest. Kirjuta numbritega.', 'Vestluses, Numbritega', [
        'kahekümne kolmandal mail | [23. mail/23.05/23. mai]', 'kell neliteist kolmkümmend | [14.30]', 'pool kolm | [14.30/2.30]',
        'kolmandal korrusel | [3. korrusel/3.]', 'kolmsada kaksteist | [312]',
      ], 'g_notice'),
      B.notice('089_d_rule', 'Kuupäev, kell ja number.', [
        '**Mitmes?** 1. esimene · 2. teine · 3. kolmas · 4. neljas · 5. viies · 10. kümnes · 20. kahekümnes · 23. kahekümne kolmas',
        '**Mis kuupäeval?** -l: kolmanda**l** mai**l**, kahekümnenda**l** märtsi**l** (kuu nimi ka -l)',
        '**Mis kell?** kell pool kolm = 14.30 · veerand neli = 15.15 · kolmveerand neli = 15.45',
        '**Telefoninumber:** loe paarikaupa: 55 12 34 56 → viis-viis, üks-kaks…',
        '**Nimi:** ütle tähthaaval: T nagu Toomas, A nagu Anna…',
        '**Kui ei saa aru:** Kas te saaksite korrata? · Palun aeglasemalt. · Kas ma sain õigesti aru: …?',
      ], 'full'),
      // Harno A2 listening 3: short answers of 1–2 words or a number
      B.listening('089_d_listen', 'Kirjuta üles.', 'Õpetaja loeb iga lõigu kaks korda. Kirjuta 1–2 sõna või number.', [
        '1. Tere, siin Viktor Saar. Minu telefoninumber on viis-kolm, neli-neli, kaks-üks, null-kaheksa.', '2. Koosolek toimub reedel, kolmandal oktoobril.',
        '3. Buss Pärnusse väljub kell seitseteist viisteist.', '4. Minu perekonnanimi on Kuusk. K-U-U-S-K.',
        '5. Kontor asub Pikal tänaval, maja number kaksteist, teisel korrusel.', '6. Pilet maksab kaksteist eurot viiskümmend senti.',
      ], [
        'Viktori telefoninumber on [53 44 21 08|53442108].', 'Koosolek on [3. oktoobril|kolmandal oktoobril].', 'Buss väljub kell [17.15|seitseteist viisteist].',
        'Perekonnanimi on [Kuusk].', 'Kontor on [teisel|2.] korrusel.', 'Pilet maksab [12.50|12,50] eurot.',
      ]),
      B.choice('089_d_check', 'Kuidas küsida?', 'Sa ei saanud aru. Vali sobiv küsimus.', [
        ['Sa ei kuulnud kellaaega.', 'Vabandust, mis kell?', 'Vabandust, mis kuupäeval?', 'Vabandust, kus see on?'],
        ['Inimene räägib väga kiiresti.', 'Kas te saaksite aeglasemalt rääkida?', 'Kas te saaksite valjemini laulda?', 'Kas te saaksite homme helistada?'],
        ['Sa ei tea, kuidas nime kirjutada.', 'Kas te saaksite nime tähthaaval öelda?', 'Kas teil on teine nimi ka?', 'Kas te saaksite kiiremini rääkida?'],
        ['Sa tahad numbrit kontrollida.', 'Kas ma sain õigesti aru: 5512 3456?', 'Kas teil on telefon?', 'Kas te helistate mulle?'],
        ['Sa ei kuulnud korrust.', 'Mitmendal korrusel kabinet on?', 'Mitu korrust majas on?', 'Mis tänaval kabinet on?'],
      ], 'full', 'g_use'),
      B.wordforms('089_d_ord', 'Mitmes?', 'Kirjuta järgarv sõnaga.', [
        ['1.', 'mitmes?', 'esimene'], ['2.', 'mitmes?', 'teine'], ['3.', 'mitmes?', 'kolmas'], ['5.', 'mitmes?', 'viies'],
        ['12.', 'mitmes?', 'kaheteistkümnes'], ['21.', 'mitmes?', 'kahekümne esimene'],
      ]),
      B.dictation('089_d_dict', 'Etteütlus: numbrid ja nimed.', 'Kuula ja kirjuta. Numbrid kirjuta numbritega.', ['Minu telefoninumber on 5123 4567.', 'Kohtume 15. juunil.', 'Rong väljub kell 8.45.', 'Kabinet on number 204.', 'Minu nimi on Jaan Mägi.', 'Aadress on Tamme 7.']),
      B.translation('089_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Повторите, пожалуйста.', 'Говорите медленнее, пожалуйста.', 'Встреча третьего мая.', 'Кабинет на втором этаже.', 'Как пишется ваша фамилия?']),
      B.speaking('089_d_say', 'Ütle tähthaaval.', 'Ütle oma nimi, väljamõeldud number ja sünnipäev. Paariline kirjutab.', [
        'Kuidas su nimi tähthaaval on?', 'Mis on su telefoninumber?', 'Mis kuupäeval on su sünnipäev?', 'Mis tänaval sa elad?',
      ], [45, 75], ['T nagu Toomas…', 'Minu number on…', 'Minu sünnipäev on … -l.']),
      B.gaps('089_d_gaps', 'Kirjuta sõnadega.', 'Kirjuta number sõnaga.', [
        'Täna on [kahekümnes] (20.) mai.', 'Liisi aeg on [kahekümne kolmandal] (23.) mail.', 'Kabinet on [kolmandal] (3.) korrusel.', 'Ma elan [teisel] (2.) korrusel.', 'Koosolek on [esimesel] (1.) juunil.', 'Kell on [pool] kolm (14.30).',
      ]),
      B.rolecards('089_d_roles', 'Registratuuris.', 'A helistab kliinikusse. B annab aja. Rääkige 2 minutit.',
        'Sa vajad aega arsti juurde. Kirjuta kõik üles ja palu üks kord korrata.', 'Sa töötad registratuuris. Paku kuupäev, kellaaeg, korrus ja kabinet.',
        ['Kas ma saaksin aja?', 'Vabandust, kas te saaksite korrata?', 'Kas ma sain õigesti aru: …?'], ['Kas teile sobib … -l?', 'Kell …', 'Kabinet on … korrusel.']),
      B.writing('089_d_write', 'Minu tähtsad kuupäevad.', 'Kirjuta 5–6 lauset: tähtsad kuupäevad ja kellaajad sel kuul.', [5, 6], ['kuupäeval', 'kell', 'korrusel', 'mail'], 2),
      B.selfcheck('089_d_self', ['Ma ütlen kuupäeva ja kellaaja sõnadega.', 'Ma kirjutan kuuldud numbri õigesti üles.', 'Ma palun korrata ja kontrollin infot.', 'Ma ütlen oma nime tähthaaval.'], 'Kõik on üles kirjutatud'),
    ],
    practice: [
      B.crossword('089_p_cross', 'Mäletad?', 'Kirjuta sõna vihje järgi.', [
        ['Päev ja kuu, näiteks 3. mai', 'kuupäev'], ['Ruum, kus arst töötab', 'kabinet'], ['Maja tasand: esimene, teine…', 'korrus'],
        ['„Kas te saaksite …?” — öelda uuesti', 'korrata'], ['Tänav ja maja number', 'aadress'], ['Mitte kiiremini, vaid …', 'aeglasemalt'],
      ]),
      B.choice('089_p_date', 'Mis vorm sobib?', 'Vali lausesse õige vorm.', [
        ['Koosolek on … mail.', 'viiendal', 'viies', 'viiendat'],
        ['Täna on … märts.', 'kahekümnes', 'kahekümnendal', 'kahekümnendat'],
        ['Kabinet on … korrusel.', 'teisel', 'teine', 'teisele'],
        ['Vastuvõtt on kella … kuni kella viieni.', 'kolmest', 'kolm', 'kolmele'],
        ['Mu sünnipäev on … jaanuaril.', 'esimesel', 'esimene', 'esimest'],
        ['Kohtume … tänaval.', 'Pikal', 'Pikk', 'Pikale'],
      ], 'full', 'g_notice'),
      B.gaps('089_p_gaps', 'Kirjuta sõnadega.', 'Kirjuta number sõnaga õiges vormis.', [
        'Koosolek on [kolmandal] (3.) märtsil.', 'Mu sünnipäev on [kahekümne esimesel] (21.) juunil.', 'Kabinet on [neljandal] (4.) korrusel.',
        'Täna on [kümnes] (10.) mai.', 'Arst võtab vastu kella [kaheksast] (8) kella kaheteistkümneni.', 'Me elame [teisel] (2.) korrusel.',
      ]),
      // Harno A2 listening 3: a monologue, 10 facts of 1–2 words
      B.listening('089_p_listen', 'Kümme fakti.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna või number.', [
        'Tere! Siin on Tartu keelekooli automaatvastaja. Kool on avatud esmaspäevast reedeni kella üheksast kella kuueni.',
        'Uued kursused algavad viieteistkümnendal septembril. Kursus kestab kümme nädalat.', 'Tunnid on teisipäeviti ja neljapäeviti kell pool kuus.',
        'Kursuse hind on sada kakskümmend eurot. Õpikud on hinna sees.', 'Registreerimiseks helistage numbril seitse-neli-kaks, kolm-üks, kaks-null. Või kirjutage meile e-kiri.',
        'Kursuse õpetaja on Anna Lepik. Lepik — L-E-P-I-K.', 'Kool asub Rüütli tänaval, maja number kaheksa, kolmandal korrusel. Klassi number on kolmsada viis.', 'Aitäh helistamast!',
      ], [
        'Kool on avatud kella üheksast kella [kuueni|6ni|18ni].', 'Kursused algavad [15. septembril|viieteistkümnendal septembril].', 'Kursus kestab [kümme|10] nädalat.',
        'Tunnid on teisipäeviti ja [neljapäeviti].', 'Tunnid algavad kell [pool kuus|17.30].', 'Kursus maksab [sada kakskümmend|120] eurot.',
        'Kooli telefoninumber on [742 3120|7423120].', 'Õpetaja perekonnanimi on [Lepik].', 'Kool asub [Rüütli] tänaval.', 'Klassi number on [305|kolmsada viis].',
      ]),
      B.truefalse('089_p_tf', 'Õige või vale?', 'Kuula teksti uuesti. Kas lause on õige või vale?', [
        ['Kool on laupäeval avatud.', false], ['Kursus kestab kümme nädalat.', true], ['Õpikud tuleb eraldi osta.', false],
        ['Registreeruda saab ka e-kirjaga.', true], ['Kool on teisel korrusel.', false],
      ]),
      B.transformation('089_p_trans', 'Kirjuta sõnadega.', 'Kirjuta lause uuesti. Numbrid kirjuta sõnadega.', [
        ['Kohtume 12.05.', 'mis kuupäeval?', 'Kohtume kaheteistkümnendal mail.'],
        ['Rong väljub 9.30.', 'mis kell?', 'Rong väljub kell pool kümme.|Rong väljub kell üheksa kolmkümmend.'],
        ['Kabinet on 2. korrusel.', 'mitmendal?', 'Kabinet on teisel korrusel.'],
        ['Pood on avatud 10–18.', 'mis kellast?', 'Pood on avatud kella kümnest kella kuueni.|Pood on avatud kella kümnest kuueni.'],
        ['Mu sünnipäev on 1.04.', 'mis kuupäeval?', 'Mu sünnipäev on esimesel aprillil.'],
      ]),
      B.errorfix('089_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kohtume kolmas mail.', 'Kohtume kolmandal mail.'], ['Sünnipäev on kahekümnendal märts.', 'Sünnipäev on kahekümnendal märtsil.'],
        ['Arst võtab vastu kell kolmest.', 'Arst võtab vastu kella kolmest.'], ['Kabinet on teisel korrus.', 'Kabinet on teisel korrusel.'],
        ['Ma kirjutan teie number üles.', 'Ma kirjutan teie numbri üles.'],
      ]),
      // recycling 086–088: palun öelge, helistage tagasi
      B.dialogue('089_p_phone', 'Sõnum kolleegile.', 'Täida dialoog.', 'Jaan', 'Klient', [
        ['B', 'Tere! Kas ma saaksin rääkida Markusega?'], ['A', 'Kahjuks on Markus koosolekul. Kas ma saan talle midagi [edasi] öelda?'],
        ['B', 'Jah. Palun [öelge], et helistas Olga Ivanova.'], ['A', 'Kas te saaksite nime [tähthaaval] öelda?'],
        ['B', 'I-V-A-N-O-V-A. Minu number on 5678 9012.'], ['A', 'Kas ma sain õigesti [aru]: 5678 9012?'], ['B', 'Jah. Markus võib mulle [tagasi] helistada enne kella viit.'],
      ]),
      B.translation('089_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Курсы начинаются пятнадцатого сентября.', 'Занятия в половине шестого.', 'Класс на третьем этаже.', 'Скажите, пожалуйста, по буквам.', 'Я правильно понял: 742 3120?']),
      B.writing('089_p_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale kursuse info 5–6 lausega: kuupäev, kell, hind, koht.', [5, 6], ['algab', 'kell', 'maksab', 'korrusel'], 3),
      B.rolecards('089_p_roles', 'Keelekooli telefon.', 'A helistab keelekooli. B vastab. Rääkige 2 minutit.',
        'Küsi kursuse algust, kellaaega, hinda ja aadressi. Kirjuta kõik üles.', 'Sa töötad keelekoolis. Vasta. Ütle õpetaja nimi tähthaaval.',
        ['Millal kursus algab?', 'Kui palju see maksab?', 'Kas te saaksite korrata?'], ['Kursus algab … -l.', 'Hind on…', 'Kool asub…']),
      B.speaking('089_p_spell', 'Dikteeri paarilisele.', 'Loe kaardilt info. Paariline kirjutab ja kordab üle.', [
        'Kaart A: Olga Petrova · 5234 1188 · 14. veebruar · kabinet 210', 'Kaart B: Jaan Mägi · 5876 3301 · 30. november · Pärnu maantee 15',
      ], [60, 90], ['Kas te saaksite korrata?', 'Kas ma sain õigesti aru: …?', 'Palun tähthaaval.']),
      B.dictation('089_p_dict', 'Etteütlus.', 'Kuula ja kirjuta. Numbrid kirjuta numbritega.', ['Kursus algab 15. septembril.', 'Tunnid on kell 17.30.', 'Kursus maksab 120 eurot.', 'Helistage numbril 742 3120.', 'Õpetaja nimi on Anna Lepik.', 'Klass on kolmandal korrusel.']),
      B.selfcheck('089_p_self', ['Ma moodustan järgarvu: kolmas, kolmandal.', 'Ma kirjutan kuuldust 8 fakti 10-st.', 'Ma parandan kuupäeva vead.', 'Ma dikteerin ja kontrollin infot.'], 'Numbrid on õiged'),
    ],
    transfer: [
      B.text('089_t_situation', 'Uus olukord', 'Sa töötad kontoris vastuvõtus. Kolleeg Markus on puhkusel. Talle jäetakse häälsõnumeid. Sina kirjutad kõik üles ja saadad Markusele.'),
      B.listening('089_t_msgs', 'Kolm häälsõnumit.', 'Õpetaja loeb iga sõnumi kaks korda. Kirjuta lünka 1–2 sõna või number.', [
        'Sõnum 1. Tere, Markus! Siin Anna Kivi raamatupidamisest. Arve on valmis. Palun helista mulle numbril viis-üks, kaks-kolm, neli-neli, null-seitse. Aitäh!',
        'Sõnum 2. Tere! Mina olen Sergei Orlov firmast Valgus. Me tahame kohtuda kolmapäeval, kahekümne teisel novembril, kell kümme. Kohtumine on meie kontoris Narva maanteel number kolmkümmend.',
        'Sõnum 3. Tere, siin Viktor. Koolituse aeg muutus. Uus kuupäev on neljas detsember. Koolitus algab kell üheksa ja toimub saalis number kaks.',
      ], [
        'Anna Kivi number on [51 23 44 07|51234407].', 'Arve on [valmis].', 'Sergei Orlovi firma nimi on [Valgus].',
        'Kohtumine on [22. novembril|kahekümne teisel novembril] kell kümme.', 'Kontor on Narva maanteel number [30|kolmkümmend].',
        'Koolituse uus kuupäev on [4. detsember|neljas detsember].', 'Koolitus toimub saalis number [kaks|2].',
      ]),
      B.choice('089_t_check', 'Kontrolli numbreid.', 'Kuula uuesti. Vali õige vastus.', [
        ['Anna Kivi number:', '51 23 44 07', '51 32 44 07', '51 23 40 47'], ['Kohtumise kuupäev:', '22. november', '12. november', '22. oktoober'],
        ['Kohtumise aeg:', 'kell 10', 'kell 12', 'kell 2'], ['Koolituse uus kuupäev:', '4. detsember', '14. detsember', '4. november'],
        ['Koolituse saal:', 'number 2', 'number 12', 'number 20'],
      ]),
      B.table('089_t_form', 'Sõnumite leht.', 'Kirjuta iga sõnumi kohta põhiinfo.', 'Kes helistas?, Mis asi?, Kuupäev või kell, Number või koht', [
        'Anna Kivi | | | ', 'Sergei Orlov | | | ', 'Viktor | | | ',
      ]),
      B.letter('089_t_mail', 'Kiri Markusele.', 'Kirjuta Markusele kolme sõnumi info. Nimed ja numbrid kirjuta täpselt.', 'Tere, Markus!', 'Ilusat puhkust!', [30, 50]),
      B.writing('089_t_sms', 'Vasta Sergeile.', 'Kirjuta Sergeile SMS: Markus on puhkusel. Paku uus kuupäev ja kellaaeg.', [5, 7], ['kahjuks', 'puhkusel', 'kas teile sobib', 'kell'], 2),
      B.dictation('089_t_dict', 'Etteütlus.', 'Kuula ja kirjuta. Numbrid kirjuta numbritega.', ['Helistas Anna Kivi.', 'Tema number on 5123 4407.', 'Kohtumine on 22. novembril kell 10.', 'Aadress on Narva maantee 30.', 'Koolitus on 4. detsembril.', 'Saal number 2.']),
      B.translation('089_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Звонила Анна Киви.', 'Перезвоните ей, пожалуйста.', 'Встреча двадцать второго ноября в десять.', 'Новая дата — четвёртое декабря.', 'Маркус в отпуске.']),
      B.planning('089_t_plan', 'Enne kirja.', 'Kirjuta märksõnad: mis on kõige tähtsam?', ['Kes helistas?', 'Mida ta tahab?', 'Mis kuupäev ja kell?', 'Mis number või koht?']),
      B.rolecards('089_t_call', 'Kõne vastuvõtus.', 'A helistab, B kirjutab info üles ja kordab üle.',
        'Sa oled klient. Ütle oma nimi, number, aeg ja koht. Räägi natuke kiiresti.', 'Sa töötad vastuvõtus. Kirjuta kõik üles. Palu korrata ja kontrolli.',
        ['Minu nimi on…', 'Minu number on…', 'Kohtume … -l kell …'], ['Kas te saaksite korrata?', 'Palun tähthaaval.', 'Kas ma sain õigesti aru: …?']),
      B.speaking('089_t_tell', 'Räägi edasi.', 'Kolleeg küsib, kes helistas. Räägi lühidalt kõigist kolmest sõnumist.', [
        'Kes helistas?', 'Mida ta tahtis?', 'Mis kuupäeval ja mis kell?', 'Kuhu tuleb helistada?',
      ], [60, 90], ['Helistas…', 'Ta palus…', 'Kohtumine on…']),
      B.selfcheck('089_t_self', [
        'Ma oskan kuulata sõnumit ja kirjutada üles nime, numbri, kuupäeva ja koha.', 'Ma oskan öelda kuupäeva ja kellaaja sõnadega: kahekümne teisel novembril.',
        'Ma oskan kasutada sõnu kabinet, korrus, tähthaaval, korrata.', 'Ma oskan paluda korrata, kontrollida ja sõnumi edasi anda.',
      ], 'Kõik on kirjas'),
    ],
  },

  // Kontroll 18 in the Harno A2 exam format: Avasta = retrieval of the module, Harjuta = reading (three notices, signs,
  // a ~150-word text, an instruction's order) and listening (announcements with 3 options, a dialogue with true/false,
  // a voice message with 1–2-word answers), Kasuta = writing 1–2 and speaking (getting to know, picture, idea cards)
  'a2-090': {
    title: 'Kontroll 18 — info mõistmine',
    canDo: 'Ma lahendan teadete, juhiste ja kuuldud info ülesanded iseseisvalt: vähemalt 70% kokku ning lugemises ja kuulamises eraldi vähemalt 65%.',
    discover: [
      B.text('090_d_intro', 'Enne kontrolli', 'Selles moodulis lugesid teateid ja juhiseid. Sa kuulasid teadaandeid ja sõnumeid. Täna kordad kõike. Järgmisel lehel on kontroll nagu Harno A2 eksamil.'),
      B.truefalse('090_d_tf', 'Mida ma mäletan?', 'Kas lause on õige või vale?', [
        ['Teates on tavaliselt info: mis, kus, millal, kellele.', true], ['„Palume vett varuda” tähendab, et vett ei ole vaja.', false],
        ['Rong, mis hilineb, tuleb hiljem.', true], ['„Seejärel” tähendab „kõige alguses”.', false], ['„Kahekümne kolmandal mail” on 23. mail.', true],
      ]),
      B.categorize('090_d_sort', 'Kuhu see kuulub?', 'Sorteeri sõnad ja väljendid.', [
        ['Teade ja kuulutus', ['müüa', 'tasuta', 'lisainfo', 'kadunud']], ['Teadaanne', ['tähelepanu', 'hilineb', 'perroon', 'vabandame']],
        ['Juhis', ['esmalt', 'vajutage', 'sisestage', 'lõpuks']], ['Telefonikõne', ['kuupäev', 'kabinet', 'tähthaaval', 'korrata']],
      ]),
      B.reading('090_d_read', 'Loe: Jaani nädal.', 'Loe teksti ja vasta küsimustele.', 'Infot on igal pool', [
        'Jaan märkab, et ta loeb ja kuulab iga päev palju infot. Esmaspäeval nägi ta trepikojas teadet. Kolmapäeval ei olnud majas elektrit, sest keldris tehti remonti. Jaan laadis telefoni juba teisipäeva õhtul täis.',
        'Kolmapäeva hommikul sõitis ta rongiga Tartusse. Jaamas kuulis ta teadaannet: rong hilineb kümme minutit. Jaan ostis vahepeal automaadist kohvi. Automaadil oli juhis: esmalt valige jook, seejärel makske kaardiga.',
        'Tartus oli tal koosolek. Sekretär helistas ja ütles kabineti numbri. Jaan kirjutas selle kohe üles: kabinet 214, teine korrus.',
        'Õhtul kuulas Jaan häälsõnumit. Ema palus helistada tagasi enne kella üheksat. Jaan helistas kell kaheksa. Ta mõtles: hea, et ma saan eesti keelest nii palju aru!',
      ].join('\n\n'), [
        ['Miks ei olnud kolmapäeval elektrit?', 'keldris tehti remonti|oli remont'],
        ['Miks laadis Jaan telefoni teisipäeval täis?', 'kolmapäeval ei olnud elektrit|elektrit ei olnud'],
        ['Mida ütles teadaanne jaamas?', 'rong hilineb kümme minutit|rong hilineb'],
        ['Kuidas sai automaadist kohvi maksta?', 'kaardiga'],
        ['Mitmendal korrusel oli kabinet?', 'teisel|2.|teisel korrusel'],
        ['Kas Jaan helistas emale õigel ajal? Miks?', 'jah, ta helistas kell kaheksa|jah, enne üheksat|jah'],
      ]),
      B.match('090_d_kind', 'Mis tekst see on?', 'Ühenda tekst ja tekstiliik.', [
        ['„Tähelepanu! Buss nr 5 täna ei sõida.”', 'teadaanne'], ['„Müüa jalgratas. Hind 40 €.”', 'kuulutus'], ['„Esmalt valige jook.”', 'juhis'],
        ['„Tere, siin ema. Helista mulle!”', 'häälsõnum'], ['„Kabinet 214, teine korrus”', 'märge telefonikõnest'],
      ], 'half', 'g_read'),
      B.gaps('090_d_mix', 'Kõik vormid.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Palun [helistage] (helistama) numbril 5512 3456.', 'Rong [väljub] (väljuma) kolmandalt perroonilt.', '[Valige] (valima) esmalt keel.',
        'Kohtume [viiendal] (5.) mail.', 'Palume uks kinni [panna] (panema).', 'Kabinet on [teisel] (2.) korrusel.',
      ]),
      B.listening('090_d_listen', 'Kuula ja kirjuta.', 'Õpetaja loeb iga lõigu kaks korda. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu! Buss Narva poole väljub kell kümme viisteist neljandalt platvormilt.', '2. Head kliendid! Kohvik on täna avatud kella kaheksani.',
        '3. Tere, siin Liis. Kohtume homme kell kuus kino ees.', '4. Esmalt sisestage kaart. Seejärel sisestage PIN-kood ja vajutage rohelist nuppu.',
      ], [
        'Buss väljub kell [10.15|kümme viisteist].', 'Buss väljub [neljandalt] platvormilt.', 'Kohvik on avatud kella [kaheksani|8ni|20ni].',
        'Liis ja sõber kohtuvad [kino] ees.', 'Pärast kaarti tuleb sisestada [PIN-kood].', 'Lõpuks tuleb vajutada [rohelist] nuppu.',
      ]),
      B.translation('090_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вход бесплатный.', 'Автобус опаздывает на пять минут.', 'Сначала выберите язык.', 'Повторите, пожалуйста, номер.', 'Встреча пятого мая.']),
      B.speaking('090_d_say', 'Mida ma oskan?', 'Räägi paarilisele, mida sa selles moodulis õppisid.', [
        'Mis teateid sa loed?', 'Kus sa kuuled teadaandeid?', 'Millise juhise järgi sa viimati midagi tegid?', 'Mida sa teed, kui ei saa aru?',
      ], [60, 90]),
      B.wordorder('090_d_wo', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Palume teisipäeval vett varuda.', 'Rong väljub kolmandalt perroonilt.', 'Esmalt valige oma keel.', 'Kabinet on teisel korrusel.', 'Kas te saaksite korrata?',
      ]),
      B.dictation('090_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Osalemine on tasuta.', 'Rong hilineb kümme minutit.', 'Seejärel sisestage kood.', 'Kohtume viiendal mail.', 'Kabinet on number 214.', 'Palun helistage tagasi.']),
      B.rolecards('090_d_roles', 'Kordame paaris.', 'A loeb kaardilt info, B kordab ja kirjutab üles. Siis vahetage.',
        'Kaart: teade — lift ei tööta 3.–5. juunini, kasutage treppi. Teadaanne — buss nr 8 hilineb 10 min.', 'Kaart: juhis — esmalt valige jook, seejärel makske kaardiga. Kõne — kabinet 214, teine korrus, kell 15.30.',
        ['Tähelepanu!', 'Palume…', 'Esmalt…'], ['Kas ma sain õigesti aru: …?', 'Palun korrake.', 'Mis kell?']),
      B.writing('090_d_write', 'Minu infonädal.', 'Kirjuta 5–7 lauset: mis teateid, juhiseid või sõnumeid sa sel nädalal nägid.', [5, 7], ['teade', 'juhis', 'sõnum', 'kell'], 2),
      B.selfcheck('090_d_self', ['Ma mäletan teadete ja juhiste sõnu.', 'Ma leian tekstist vajaliku info.', 'Ma kirjutan kuuldust üles aja ja numbri.', 'Ma kasutan vorme helistage, väljub, viiendal.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('090_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See on mooduli 18 kontroll nagu Harno A2 eksam: neli lugemisülesannet ja kolm kuulamisülesannet. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda. Edukas tulemus: kokku 70% ning lugemises ja kuulamises eraldi vähemalt 65%.', 'full'),
      // reading 1 (Harno A2 reading 2): three short notices, answers by letter or briefly
      B.reading('090_p_r1', 'Lugemine 1. Kolm teadet.', 'Loe teateid. Vasta tähega (A, B, C) või lühidalt.', 'Teated kooli kodulehel', [
        'A. Head lapsevanemad! Neljapäeval, 7. märtsil on koolis lastevanemate koosolek. Koosolek algab kell 18 aulas. Räägime kevadisest ekskursioonist ja uuest tunniplaanist. Kui te ei saa tulla, kirjutage klassijuhatajale. Pärast koosolekut saab õpetajatega ka eraldi rääkida. Kooli juhtkond',
        'B. Kooli söökla on 11.–15. märtsini remondi tõttu suletud. Sel ajal saavad õpilased lõunat kooli aulas. Lõuna on tavalisel ajal, kell 11.30–13.00. Palume õpilastel oma tass kaasa võtta. Vabandame! Söökla juhataja',
        'C. Raamatukogu otsib abilisi! Kas sulle meeldib lugeda ja lastega aega veeta? Otsime inimesi, kes loevad laupäeviti väikestele lastele muinasjutte. Kogemust ei ole vaja. Kirjuta raamatukoguhoidja Sofiale: sofia@raamat.ee. Ootame sind!',
      ].join('\n\n'), [
        ['Millises teates palutakse midagi kaasa võtta?', 'B'], ['Millises teates otsitakse inimesi?', 'C'], ['Millises teates räägitakse ekskursioonist?', 'A'],
        ['Kus lõunatavad õpilased remondi ajal?', 'aulas|kooli aulas'], ['Mida peab tegema lapsevanem, kes ei saa koosolekule tulla?', 'kirjutama klassijuhatajale|kirjutama õpetajale'],
        ['Kas raamatukogu abilisel peab olema kogemus?', 'ei|ei pea|kogemust ei ole vaja'],
      ]),
      // reading 2 (Harno A2 reading 3): signs matched to what they mean
      B.match('090_p_r2', 'Lugemine 2. Mida silt tähendab?', 'Ühenda silt ja selle tähendus.', [
        ['Lift remondis. Kasutage treppi.', 'Täna saab üles ainult jalgsi.'], ['Pakk on automaadis 7 päeva', 'Pakk tuleb ära võtta nädala jooksul.'],
        ['Arsti juurde ainult broneeritud ajaga', 'Ilma ajata arsti juurde ei saa.'], ['Ärge jätke kotte üksi!', 'Kott peab olema sinu juures.'],
        ['Värske leib iga päev kell 8', 'Hommikul saab osta sooja leiba.'], ['Ujula on suletud 1.–14. juulini', 'Juuli alguses ujuda ei saa.'],
      ], 'full', 'g_read'),
      // reading 3 (Harno A2 reading 4): a ~150-word text with 3-option questions
      B.reading('090_p_r3', 'Lugemine 3. Viktori esimene tööpäev.', 'Loe tekst. Vasta lühidalt.', 'Esimene päev uues kontoris', [
        'Viktor alustas esmaspäeval tööd uues kontoris. Hommikul sai ta personalijuhilt e-kirja. Kirjas oli juhis: esmalt tule kell üheksa vastuvõttu ja võta oma kaart. Seejärel mine kolmandale korrusele, kabinetti 305. Seal ootab sind kolleeg Liis.',
        'Viktor jõudis majja kümme minutit varem. Vastuvõtus ütles naine, et kaart ei ole veel valmis. Viktor pidi ootama kakskümmend minutit. Lõpuks sai ta kaardi ja läks lifti juurde. Liftil oli silt: „Lift ei tööta. Palume kasutada treppi.” Viktor läks trepist üles.',
        'Liis näitas talle kontorit, kööki ja printerit. Printeri kõrval oli juhis. Seal oli kirjas: „Sisestage kood ja vajutage rohelist nuppu.” Viktor proovis, aga printer ei töötanud. Liis naeris ja ütles, et kõigepealt tuleb printer sisse lülitada.',
        'Lõuna ajal kuulis Viktor teadaannet: „Tähelepanu! Kell kolm on köögis kohvipaus. Kõik on oodatud!” Viktor arvas, et tema esimene päev oli hea.',
      ].join('\n\n'), [
        ['Mis kell pidi Viktor vastuvõttu tulema?', 'üheksa|kell üheksa|9'], ['Mis kabinetis ootas Liis?', '305|kabinetis 305'], ['Kui kaua Viktor vastuvõtus ootas?', 'kakskümmend minutit|20 minutit'],
      ]),
      B.choice('090_p_r3mc', 'Lugemine 3. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Kust sai Viktor esimese juhise?', 'e-kirjast', 'teadaandest', 'Liisilt telefonis'],
        ['Miks pidi Viktor vastuvõtus ootama?', 'Tema kaart ei olnud veel valmis.', 'Ta tuli liiga vara.', 'Liis ei olnud veel tööl.'],
        ['Kuidas Viktor kolmandale korrusele jõudis?', 'trepist', 'liftiga', 'koos Liisiga liftiga'],
        ['Miks printer ei töötanud?', 'Printer ei olnud sisse lülitatud.', 'Viktor sisestas vale koodi.', 'Printer oli katki.'],
        ['Mis toimub kell kolm?', 'kohvipaus köögis', 'koosolek kabinetis 305', 'Viktori lõuna'],
      ]),
      // reading 4: an instruction's order
      B.table('090_p_r4', 'Lugemine 4. Juhis.', 'Pane pesumasina juhise sammud järjekorda (1–6).', 'Samm, Number', [
        'Valige programm, näiteks 40 kraadi. | [3]', 'Esmalt pange pesu masinasse. | [1]', 'Lõpuks võtke pesu välja ja sulgege uks. | [6]',
        'Seejärel pange pesupulber kasti. | [2]', 'Vajutage nuppu „Start”. | [4]', 'Oodake, kuni masin piiksub. | [5]',
      ], 'g_read'),
      // listening 1 (Harno A2 listening 1): short announcements, 3 options
      B.listening('090_p_l1', 'Kuulamine 1. Viis teadaannet.', 'Õpetaja loeb iga teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu! Rong Pärnusse väljub täna kell kaheksateist kakskümmend teiselt perroonilt.',
        '2. Head kliendid! Kauplus suletakse täna pool tundi varem, kell kaheksa. Palume teil minna kassadesse.',
        '3. Järgmine peatus on Raekoja plats. Bussi number kuus reisijad, palun vahetage siin bussi.',
        '4. Lugupeetud külastajad! Muuseumi kohvik on teisel korrusel. Täna on kohv kõigile tasuta.',
        '5. Tähelepanu! Lend Stockholmi hilineb pool tundi. Palume reisijatel oodata väravas number viis.',
      ], ['Rong Pärnusse väljub [teiselt] perroonilt.', 'Kauplus suletakse kell [kaheksa|8|20].', 'Reisijad peavad vahetama bussi peatuses [Raekoja plats].', 'Muuseumi kohvik on [teisel|2.] korrusel.', 'Lennu reisijad ootavad väravas number [viis|5].']),
      B.choice('090_p_l1mc', 'Kuulamine 1. Vali õige vastus.', 'Kuula teateid uuesti. Vali õige vastus.', [
        ['Teade 1: mis kell väljub rong?', '18.20', '8.20', '18.40'], ['Teade 2: mis muutus?', 'Pood suletakse varem.', 'Pood avatakse hiljem.', 'Kassad on suletud.'],
        ['Teade 3: mida peavad bussi number kuus reisijad tegema?', 'vahetama bussi', 'ostma uue pileti', 'jääma bussi'],
        ['Teade 4: mis on täna tasuta?', 'kohv', 'muuseumi pilet', 'kook'], ['Teade 5: kui palju lend hilineb?', 'pool tundi', 'viis minutit', 'poolteist tundi'],
      ]),
      // listening 2 (Harno A2 listening 2): a dialogue, true/false
      B.listening('090_p_l2', 'Kuulamine 2. Telefonikõne.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Jalgrattalaenutus, Jaan kuulab.', '— Tere! Mina olen Anna. Ma nägin teie kuulutust. Kas teil on laupäevaks kaks ratast vaba?',
        '— Jah, on küll. Üks ratas täiskasvanule ja üks lapsele?', '— Ei, kaks ratast täiskasvanutele. Ma tulen koos mehega.',
        '— Selge. Päev maksab viisteist eurot ühe ratta eest.', '— Kas kiivrid on hinna sees?', '— Jah, kiivrid on tasuta. Aga palun võtke kaasa isikutunnistus.',
        '— Mis kell te avate?', '— Laupäeval avame kell üheksa. Rattad tuleb tagasi tuua kella kuueks.', '— Kus te asute?',
        '— Me oleme Kalda tänaval, maja number neli, sadama kõrval.', '— Aitäh! Kas te broneerite rattad minu nimele?', '— Jah. Teie perekonnanimi?',
        '— Kask. K-A-S-K.', '— Väga hea. Laupäeval näeme!',
      ], ['Anna tahab laenutada [kaks|2] ratast.', 'Anna tuleb koos [mehega].', 'Laenutus asub [Kalda] tänaval.', 'Laenutus on [sadama] kõrval.', 'Anna perekonnanimi on [Kask].']),
      B.truefalse('090_p_l2tf', 'Kuulamine 2. Õige või vale?', 'Kuula vestlust. Kas lause on õige või vale?', [
        ['Anna tuleb koos lapsega.', false], ['Üks ratas maksab päevas 15 eurot.', true], ['Kiivri eest tuleb eraldi maksta.', false],
        ['Kaasa tuleb võtta isikutunnistus.', true], ['Laupäeval avatakse laenutus kell kümme.', false], ['Rattad tuleb tagasi tuua kella kuueks.', true],
      ], 'full'),
      // listening 3 (Harno A2 listening 3): a voice message, 1–2-word answers
      B.listening('090_p_l3', 'Kuulamine 3. Häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna või number.', [
        'Tere, Markus! Siin Sofia keelekoolist. Sinu eksam ei ole reedel, vaid esmaspäeval, kahekümne seitsmendal mail.', 'Eksam algab kell kümme, aga palun tule viisteist minutit varem.',
        'Eksam on Tallinnas, Mustamäe teel number neliteist, teisel korrusel, ruumis kakssada kuus.', 'Võta kaasa pass või ID-kaart ja sinine pastakas.',
        'Kui sul on küsimusi, helista mulle numbril viis-kaks, kolm-üks, kaheksa-kaheksa, null-üks. Edu!',
      ], [
        'Eksam on [esmaspäeval].', 'Kuupäev on [27. mail|kahekümne seitsmendal mail|27. mai].', 'Markus peab tulema [viisteist|15] minutit varem.',
        'Ruumi number on [206|kakssada kuus].', 'Pastakas peab olema [sinine].', 'Sofia telefoninumber on [52 31 88 01|52318801].',
      ]),
      // reading 5 (Harno A2 reading 5): a personal letter with 8 option gaps
      B.cloze('090_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Liis!', [
        'Aitäh kutse eest! Kahjuks ei saa ma reedel kontserdile {*tulla|tulema|tulen}. Mu rong Pärnust {*hilineb|hiline|hilinema} ja ma jõuan Tallinna alles kell üheksa.',
        '',
        'Kas sa tead, et reedene kontsert {*jääb|jäävad|jääma} üldse ära? Ma nägin teadet kontserdimaja {*kodulehel|koduleht|kodulehele}. Seal oli kirjas, et piletid saab tagasi anda {*kassas|kassa|kassast}.',
        '',
        'Uus kontsert on {*viiendal|viies|viiendat} juunil. Kui sa tahad, ostan ma piletid. Esmalt pean ma veebis {*registreeruma|registreeruda|registreerun}. Palun {*helista|helistama|helistad} mulle õhtul!',
        '',
        'Kallistan, Anna',
      ]),
      B.wordforms('090_p_forms', 'Keeleosa. Õige vorm.', 'Kirjuta sõna õiges vormis.', [
        ['panema', 'palume … (da-vorm)', 'panna'], ['vajutama', 'teie-käsk', 'vajutage'], ['väljuma', 'rong … (ta-vorm)', 'väljub'],
        ['kolmas', 'mis korrusel?', 'kolmandal'], ['perroon', 'kust? (teine …)', 'perroonilt'], ['viies', 'mis kuupäeval? (… mail)', 'viiendal'],
      ]),
      B.errorfix('090_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palume ei suitsetada trepikojas.', 'Palume trepikojas mitte suitsetada.|Palume mitte suitsetada trepikojas.'], ['Rong väljub kolmandal perroonil.', 'Rong väljub kolmandalt perroonilt.'],
        ['Vajutage roheline nupp.', 'Vajutage rohelist nuppu.'], ['Koosolek on viies mail.', 'Koosolek on viiendal mail.'],
        ['Buss hilineb kümme minut.', 'Buss hilineb kümme minutit.'], ['Kabinet on teisel korrus.', 'Kabinet on teisel korrusel.'],
      ]),
      B.speaking('090_p_say', 'Räägi kuuldust.', 'Räägi paarilisele, mida Anna ja Jaan kokku leppisid.', [
        'Mitu ratast ja mis päevaks?', 'Kui palju see maksab?', 'Mida tuleb kaasa võtta?', 'Kus ja mis kell?',
      ], [45, 75], ['Anna tahab…', 'Ratas maksab…', 'Nad leppisid kokku, et…']),
      B.selfcheck('090_p_self', ['Lugemine: leian teatest ja sildilt vajaliku info.', 'Lugemine: saan aru 150-sõnalisest tekstist ja juhise järjekorrast.', 'Kuulamine: valin teadaande järgi õige vastuse.', 'Kuulamine: kirjutan sõnumist üles numbri, aja ja koha.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('090_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamine ja rääkimine. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('090_t_card', 'Kuulutus', ['Joogatunnid algajatele!', 'Õpetaja: Liis Tamm', 'Kus: Pargi spordisaal, Pargi 3, Tartu', 'Millal: teisipäeviti ja reedeti kell 18–19', 'Esimene tund on tasuta!', 'Registreeru: tel 5566 1234 või liis@jooga.ee'], 'full', 'g_read'),
      // writing 1: information transfer (who, where, when, how to register), at least 25 words
      B.letter('090_t_info', 'Kirjutamine 1. Soovita sõbrale.', 'Sõber tahab joogat proovida. Kirjuta: kes, kus, millal, kuidas registreeruda.', 'Tere, Sofia!', 'Kohtumiseni trennis!', [25, 40]),
      B.table('090_t_form', 'Registreerimisvorm.', 'Täida joogatunni registreerimisvorm.', 'Andmed, Sinu vastus', [
        'Ees- ja perekonnanimi | ', 'Telefon | ', 'E-post | ', 'Mis päeval sa tuled? | ', 'Kas oled varem joogat teinud? | ',
      ]),
      B.planning('090_t_plan', 'Enne teadet.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis juhtub?', 'Kus ja millal?', 'Mida peavad naabrid tegema?', 'Kuidas sinuga ühendust võtta?']),
      // writing 2: a notice / message, at least 30 words
      B.letter('090_t_notice', 'Kirjutamine 2. Teade naabritele.', 'Sinu korteris on laupäeval remont ja müra. Kirjuta naabritele teade.', 'Head naabrid!', 'Aitäh mõistmise eest! Korter 12', [30, 50]),
      B.writing('090_t_alt', 'Kirjutamine 2 (teine valik). Juhis sõbrale.', 'Kirjuta 4–6 lauset: kuidas osta bussipiletit telefoniga.', [4, 6], ['esmalt', 'seejärel', 'vali', 'lõpuks'], 2),
      B.rubric('090_t_rubric', 'Hindamise tingimused.', 'Märgi, mis on täidetud.', [
        'Kirjutamine 1: kes, kus, millal, kuidas registreeruda — vähemalt 25 sõna.', 'Kirjutamine 2: mis, millal, mida naabrid teevad, kontakt — 30–50 sõna.',
        'Tekstis on palve või juhis: palume + da-vorm, helistage, vali.', 'Kuupäev, kellaaeg ja number on õiged.', 'Rääkimises küsisin, vastasin ja kontrollisin infot.',
      ]),
      // speaking: getting to know, picture description (task 1), idea cards (task 2)
      B.speaking('090_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', [
        'Mis su nimi on? Ütle perekonnanimi tähthaaval.', 'Kus sa elad?', 'Kus sa loed teateid: trepikojas, poes, internetis?', 'Mida sa teed, kui buss hilineb?',
      ], [45, 60]),
      B.speaking('090_t_pic', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: jaam, lennujaam või pakiautomaat. Kirjelda 1 minut.', [
        'Kus inimesed on?', 'Mida nad teevad?', 'Mis teadet nad võiksid kuulda?', 'Mis võiks edasi juhtuda?',
      ], [60, 90], ['Pildil on…', 'Inimesed ootavad…', 'Võib-olla rong hilineb…']),
      B.speaking('090_t_compare', 'Rääkimine 1. Võrdle pilte.', 'Võrdle oma pilti paarilise pildiga. Vasta õpetaja küsimustele.', [
        'Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kus sa ise tihti käid?', 'Miks?',
      ], [60, 90]),
      B.rolecards('090_t_card1', 'Rääkimine 2. Ideekaart „Teated ja info”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi 5 küsimust märksõnade järgi: teade majas, kuulutus, rong või buss, juhis, telefonikõne.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks näide.',
        ['Kas sa loed trepikoja teateid?', 'Kas sa oled midagi kuulutusega müünud?', 'Mida sa teed, kui rong hilineb?'], ['Jah, eelmisel nädalal oli teade…', 'Ma kuulan teadaannet ja…', 'Esmalt ma…']),
      B.rolecards('090_t_card2', 'Rääkimine 2. Ideekaart „Telefonis”.', 'Nüüd küsib B ja A vastab. B kirjutab info üles.',
        'Sa helistad keelekooli. Ütle oma nimi, number ja millal sul on aega.', 'Sa töötad keelekoolis. Küsi nime tähthaaval, numbrit ja aega. Kontrolli infot.',
        ['Minu nimi on…', 'Minu number on…', 'Mul on aega … -l.'], ['Kas te saaksite nime tähthaaval öelda?', 'Kas ma sain õigesti aru: …?', 'Kursus algab … -l kell …']),
      B.selfcheck('090_t_self', [
        'Ma oskan kirjutada kuulutuse põhjal sõbrale 25–40 sõna.', 'Ma oskan kirjutada naabritele teate 30–50 sõnaga.',
        'Ma oskan kirjeldada pilti ja rääkida teadetest ja juhistest.', 'Ma oskan telefonis küsida, kirjutada üles ja kontrollida infot.',
      ], 'Moodul 18 on käes'),
    ],
  },
};
