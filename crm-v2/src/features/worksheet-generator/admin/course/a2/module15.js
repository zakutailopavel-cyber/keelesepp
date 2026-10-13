// A2 course (A1 → A2 roadmap), module 15 „Suhted, külaskäik ja viisakus”, stage A2. All five lessons a2-071…a2-075
// (072 the polite request: palun + käsk, Kas sa saad…?, Kas te saaksite…?, Tahaksin…, Kas ma tohin…?). All three phases.
// A visit (Tule sisse! Võta istet! Kas soovid teed? — käskiv kõneviis, osastav pakkumises), agreeing and refusing
// with a reason and an alternative (kahjuks ei saa, sest…; Aga kuidas oleks…?), a short personal message (pöördumine,
// eesmärk, info, lõpp; Aitäh … eest!; sina / teie). 075 is the check in the Harno A2 exam format: Harjuta = reading
// and listening, Kasuta = writing and speaking. Module 14 („Kas te saaksite…?”, ajamarkerid) comes back.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-15', course: 'a2', title: 'Suhted, külaskäik ja viisakus', level: 'A2' };

const TR = (id, rows) => B.translation(id, 'Tõlgi.', 'Kirjuta eesti keeles.', rows);
const D = (id, rows) => B.dictation(id, 'Etteütlus.', 'Kuula ja kirjuta laused.', rows);

export const LESSONS = {
  'a2-071': {
    title: 'Külla minek ja vastuvõtt',
    canDo: 'Ma võtan külalise vastu või lähen ise külla ning pean 2–3-minutilise viisaka vestluse: tervitan, pakun või tänan ja lahkun.',
    discover: [
      B.text('071_d_situation', 'Külla', 'Anna kutsus naabri Markuse laupäeval endale külla. Markus on Anna juures esimest korda. Ta toob kaasa lilled. Anna on ise teinud õunakooki.'),
      B.truefalse('071_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Markus on Anna naaber.', true], ['Markus on Anna juures juba tihti käinud.', false], ['Markus toob kaasa kooki.', false], ['Anna on ise küpsetanud.', true], ['Külaskäik on laupäeval.', true],
      ]),
      B.vocab('071_d_vocab', 'Külaskäigu sõnad', ['külla minema — идти в гости', 'külas olema — быть в гостях', 'külaline — гость', 'võõrustaja — хозяин, хозяйка', 'kutsuma — приглашать', 'pakkuma — предлагать', 'Tule sisse! — Заходи!', 'Võta istet! — Садись!', 'Kas soovid…? — Хочешь…?', 'Tunne end nagu kodus! — Чувствуй себя как дома!', 'Aitäh kutsumast! — Спасибо за приглашение!', 'lahkuma — уходить']),
      B.reading('071_d_read', 'Loe: Markus Anna juures.', 'Loe dialoogi ja vasta küsimustele.', 'Külas',
        'Anna: Tere, Markus! Tule sisse!\nMarkus: Tere! Need lilled on sulle.\nAnna: Oi, kui ilusad! Aitäh! Võta jope ära ja võta istet.\nMarkus: Sul on väga hubane korter.\nAnna: Aitäh! Kas soovid teed või kohvi?\nMarkus: Kohvi, palun. Piimaga, aga ilma suhkruta.\nAnna: Võta ka kooki. Ma tegin ise õunakooki.\nMarkus: Mmm, väga maitsev! Kas sa annad mulle retsepti?\nAnna: Muidugi! Kas soovid veel ühe tüki?\nMarkus: Aitäh, aga rohkem ei jaksa. Olen täiesti täis.\n(Tund aega hiljem)\nMarkus: Oi, kell on juba kuus. Mul on aeg minna.\nAnna: Nii kiiresti? Aga hästi.\nMarkus: Aitäh kutsumast! Oli väga tore.\nAnna: Aitäh, et tulid! Tule jälle!\nMarkus: Järgmine kord tuled sina minu juurde.',
        [['Mida Markus Annale kingib?', 'lilled|lilli'], ['Millist kohvi Markus joob?', 'piimaga, ilma suhkruta|piimaga'], ['Miks Markus teist tükki kooki ei võta?', 'ta on täis|ta ei jaksa'], ['Miks Markus lahkub?', 'kell on juba kuus|tal on aeg minna'], ['Mida Markus lahkudes ütleb?', 'Aitäh kutsumast|Oli väga tore'], ['Kus on järgmine külaskäik?', 'Markuse juures|Markuse pool']]),
      B.categorize('071_d_find', 'Kes mida ütleb?', 'Sorteeri dialoogi laused.', [
        ['Võõrustaja', ['Tule sisse!', 'Võta istet!', 'Kas soovid teed või kohvi?', 'Tule jälle!']], ['Külaline', ['Need lilled on sulle.', 'Väga maitsev!', 'Mul on aeg minna.', 'Aitäh kutsumast!']],
      ], 'full', 'g_use'),
      B.notice('071_d_notice', 'Märka: pakkumine ja vastus', [
        '**Tule** sisse! **Võta** istet! **Võta** kooki! (sina)', '**Tulge** sisse! **Võtke** istet! (teie, võõrale)', 'Kas soovid **teed / kohvi / kooki**? (osastav)', 'Jah, palun. / Aitäh, **ei soovi**. / Aitäh, rohkem **ei jaksa**.',
      ], 'full'),
      B.wordforms('071_d_forms', 'Mida pakkuda?', 'Kirjuta sõna osastavas.', [
        ['tee', 'Kas soovid …?', 'teed'], ['kohv', 'Kas soovid …?', 'kohvi'], ['kook', 'Kas soovid …?', 'kooki'], ['vesi', 'Kas soovid …?', 'vett'], ['mahl', 'Kas soovid …?', 'mahla'], ['võileib', 'Kas soovid …?', 'võileiba'],
      ]),
      B.match('071_d_match', 'Pakkumine ja vastus.', 'Ühenda võõrustaja ja külalise lause.', [
        ['Tule sisse!', 'Aitäh! Kuhu ma jope panen?'], ['Kas soovid teed?', 'Jah, palun, natuke.'], ['Võta veel kooki!', 'Aitäh, rohkem ei jaksa.'], ['Tunne end nagu kodus!', 'Aitäh, sul on väga hubane.'], ['Kas sa juba lähed?', 'Jah, mul on aeg minna.'], ['Tule jälle!', 'Aitäh, hea meelega!'],
      ], 'full', 'g_use'),
      B.gaps('071_d_gaps', 'Võõrustaja ütleb.', 'Täida lüngad. Neli sõna jääb üle.', [
        '[Tule] sisse, Markus!', 'Võta jope ära ja võta [istet].', 'Kas soovid [teed] või kohvi?', 'Võta [kooki], see on värske!', 'Tunne end nagu [kodus]!', 'Aitäh, et [tulid]!',
      ], ['tule', 'tulge', 'istet', 'istuda', 'teed', 'tee', 'kooki', 'kook', 'kodus', 'tulid']),
      B.transformation('071_d_trans', 'Ütle võõrale.', 'Kirjuta lause teie-vormis.', [
        ['Tule sisse!', 'teie', 'Tulge sisse!'], ['Võta istet!', 'teie', 'Võtke istet!'], ['Kas soovid kohvi?', 'teie', 'Kas soovite kohvi?'], ['Tunne end nagu kodus!', 'teie', 'Tundke end nagu kodus!'], ['Tule jälle!', 'teie', 'Tulge jälle!'],
      ]),
      B.errorfix('071_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kas sa soovid tee?', 'Kas sa soovid teed?'], ['Võta istuda!', 'Võta istet!|Istu!'], ['Aitäh kutsuma!', 'Aitäh kutsumast!'], ['Ma lähen külas Annale.', 'Ma lähen Annale külla.|Ma lähen Anna juurde külla.'], ['Ma olin külla Markuse juures.', 'Ma olin külas Markuse juures.'],
      ]),
      B.wordorder('071_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Võta jope ära ja tule tuppa.', 'Kas soovid teed või kohvi?', 'Kohvi palun, aga ilma suhkruta.', 'Oi, kell on juba kuus.', 'Aitäh kutsumast, oli väga tore!',
      ]),
      TR('071_d_tr', ['Заходи!', 'Садись, пожалуйста.', 'Хочешь чаю или кофе?', 'Спасибо за приглашение!', 'Мне пора идти.']),
      D('071_d_dict', ['Tule sisse!', 'Võta istet.', 'Kas soovid kohvi?', 'Aitäh, rohkem ei jaksa.', 'Mul on aeg minna.']),
      B.speaking('071_d_say', 'Külaskäigud.', 'Räägi paarilisele oma külaskäikudest.', ['Kellele sa viimati külla läksid?', 'Mida sa kaasa viisid?', 'Mida sulle pakuti?'], [60, 90]),
      B.writing('071_d_write', 'Külaline tuleb.', 'Kirjuta 5–7 lauset: mida sa ütled ja pakud külalisele.', [5, 7], ['tule sisse', 'võta istet', 'kas soovid', 'aitäh'], 3),
      B.selfcheck('071_d_self', ['Ma tean 12 külaskäigu väljendit.', 'Ma pakun: Kas soovid teed?', 'Ma eristan: tule / tulge.', 'Ma ütlen, kui ma rohkem ei soovi.'], 'Uks on lahti'),
    ],
    practice: [
      B.choice('071_p_choice', 'Mida öelda?', 'Vali sobiv lause.', [
        ['Sõber tuleb uksest sisse.', 'Tere! Tule sisse!', 'Head aega! Tule jälle!', 'Aitäh kutsumast!'],
        ['Külaline ei taha rohkem kooki.', 'Aitäh, rohkem ei jaksa.', 'Võta veel kooki!', 'Kas soovid kooki?'],
        ['Võõrustaja tahab teada, mida külaline juua tahab.', 'Kas soovid teed või kohvi?', 'Kas sa oled näljane?', 'Võta istet, palun!'],
        ['Külaskäik on läbi, sa lahkud.', 'Aitäh kutsumast! Oli väga tore.', 'Tere tulemast! Tule sisse.', 'Kas soovid veel teed?'],
        ['Sa annad võõrustajale lilled.', 'Need on sulle.', 'Need on minu.', 'Võta istet.'],
        ['Külaline seisab esikus jopega.', 'Võta jope ära ja tule tuppa.', 'Mul on aeg minna.', 'Aitäh, et tulid!'],
      ], 'full', 'g_use'),
      B.wordforms('071_p_forms', 'Õige vorm.', 'Kirjuta sõna õiges vormis.', [
        ['kook', 'Võta veel …!', 'kooki'], ['šokolaad', 'Kas soovid …?', 'šokolaadi'], ['piim', 'Kohv … , palun.', 'piimaga'], ['suhkur', 'Tee ilma …, palun.', 'suhkruta'], ['sina', 'Need lilled on …', 'sulle; sinule'], ['Anna', 'Ma lähen … külla.', 'Annale'],
      ]),
      B.gaps('071_p_gaps', 'Sina või teie?', 'Võõrustaja räägib sõbra vanaemaga. Vali teie-vorm.', [
        '[Tulge] sisse, palun!', 'Palun [võtke] istet.', 'Kas te [soovite] teed või kohvi?', '[Tundke] end nagu kodus!', 'Aitäh, et te [tulite]!',
      ], ['tulge', 'tule', 'võtke', 'võta', 'soovite', 'soovid', 'tundke', 'tunne', 'tulite', 'tulid']),
      B.crossword('071_p_recall', 'Mäletad sõnu?', 'Kirjuta sõnad vihjete järgi.', [
        ['Inimene, kes tuleb külla.', 'külaline'], ['Inimene, kes võtab külalise vastu.', 'võõrustaja'], ['Ütled: Võta …!', 'istet'], ['Ütled lahkudes: Aitäh …!', 'kutsumast'], ['Külaline läheb ära.', 'lahkuma'],
      ]),
      B.listening('071_p_listen', 'Kutse telefonis.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Viktor! Liis siin.', '— Tere, Liis! Kuidas läheb?', '— Hästi, aitäh! Kuule, mul on laupäeval sünnipäev. Kas sa tuled mulle külla?',
        '— Muidugi tulen! Mis kell?', '— Kell kuus õhtul. Ma elan nüüd uues korteris, Tamme tänav kaksteist.', '— Mis korrusel?',
        '— Kolmandal korrusel. Uksekell ei tööta, palun helista mulle.', '— Selge. Mida ma kaasa võtan?', '— Mitte midagi! Ma teen ise süüa. Aga kui tahad, too mahla.',
        '— Hea küll. Kas ma võin oma õe ka kaasa võtta?', '— Muidugi, ta on oodatud!', '— Aitäh kutse eest! Laupäevani!',
      ], ['Liisil on laupäeval [sünnipäev].', 'Pidu algab kell [kuus|6|18].', 'Liis elab Tamme tänav [kaksteist|12].', 'Korter on [kolmandal] korrusel.', 'Uksekella asemel tuleb [helistada].', 'Viktor võib kaasa tuua [mahla|mahl].', 'Viktor tuleb koos [õega|oma õega].']),
      B.dialogue('071_p_dialog', 'Külas Sofia juures.', 'Täida dialoog.', 'Sofia', 'Jaan', [
        ['A', 'Tere, Jaan! [Tule] sisse!'], ['B', 'Tere! See [kook] on sulle. Ise küpsetasin.'], ['A', 'Aitäh! Võta [istet]. Kas soovid [teed] või kohvi?'],
        ['B', 'Teed, palun. Ilma suhkruta.'], ['A', 'Palun. [Tunne] end nagu kodus.'], ['B', 'Sul on väga ilus kodu!'],
        ['A', 'Aitäh! Kas soovid veel teed?'], ['B', 'Aitäh, ei [soovi]. Oi, kell on palju. Mul on aeg minna.'], ['A', 'Aitäh, et [tulid]!'],
      ]),
      B.transformation('071_p_neg', 'Ütle eitavalt.', 'Kirjuta eitav lause.', [
        ['Ma võtan koogi.', 'eitus', 'Ma ei võta kooki.'], ['Ma soovin kohvi.', 'eitus', 'Ma ei soovi kohvi.'], ['Ma tahan võileiba.', 'eitus', 'Ma ei taha võileiba.'], ['Ma joon tassi teed.', 'eitus', 'Ma ei joo teed.|Ma ei joo tassi teed.'], ['Ma tulen laupäeval.', 'eitus', 'Ma ei tule laupäeval.'],
      ]),
      B.errorfix('071_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kas soovid kohv?', 'Kas soovid kohvi?'], ['Ma tulen sinu külla.', 'Ma tulen sulle külla.|Ma tulen sinu juurde külla.'], ['Kohvi piimaga ja ilma suhkur.', 'Kohvi piimaga ja ilma suhkruta.'], ['Tänan kutsumise.', 'Tänan kutsumast.|Tänan kutsumise eest.'], ['Mul on aega minna.', 'Mul on aeg minna.'],
      ]),
      B.wordorder('071_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Kas ma võin oma õe kaasa võtta?', 'Uksekell ei tööta, palun helista.', 'Ma elan kolmandal korrusel.', 'Võta veel üks tükk kooki.', 'Aitäh, et sa tulid!',
      ]),
      TR('071_p_tr', ['Приходи ко мне в гости в субботу.', 'Кофе с молоком, без сахара.', 'Я больше не могу, спасибо.', 'Можно взять с собой сестру?', 'Приходите ещё!']),
      D('071_p_dict', ['Tulge sisse, palun!', 'Kas soovite teed?', 'Ma ei võta kooki.', 'Kohvi piimaga, palun.', 'Aitäh, et tulid!']),
      B.writing('071_p_write', 'Minu külaskäik.', 'Kirjuta 6–8 lauset: kellele läksid külla, mida tõid, mida pakuti.', [6, 8], ['külla', 'pakkus', 'soovisin', 'aitäh'], 3),
      B.speaking('071_p_say', 'Külas.', 'Mängige külaskäigu algus ja lõpp. Kasutage kuut fraasi.', ['Tervita ja kutsu sisse.', 'Paku juua ja süüa.', 'Lahku viisakalt.'], [60, 90], ['Tule sisse!', 'Kas soovid…?', 'Mul on aeg minna.']),
      B.selfcheck('071_p_self', ['Ma valin olukorda sobiva lause.', 'Ma kasutan osastavat: teed, kohvi, kooki.', 'Ma ütlen võõrale: tulge, võtke.', 'Ma saan aru kutsest telefonis.'], 'Külaline on oodatud'),
    ],
    transfer: [
      B.text('071_t_situation', 'Uus olukord', 'Kolleeg Jaan kutsus sind pühapäeval oma vanemate juurde maale. Sa ei tunne neid. Sa ei joo kohvi ja pead kell viis lahkuma.'),
      B.reading('071_t_read', 'Loe Jaani sõnumit.', 'Loe ja vasta küsimustele.', 'Jaani kutse',
        'Tere! Minu vanemad kutsuvad sind pühapäeval meile maale. Nad elavad Tartu lähedal Kõrveküla külas. Ma võin sind kell kaksteist bussijaamast peale võtta. Ema teeb lõunaks suppi ja küpsetab rabarberikooki. Isa tahab sulle näidata oma mesilasi ja aeda. Tal on üle kümne mesitaru. Mu vanemad räägivad ainult eesti keelt, aga nad räägivad aeglaselt. Ära karda, nad on väga sõbralikud. Kell viis viin sind tagasi linna, kui sul on vaja. Kingitust pole vaja tuua, aga ema armastab lilli. Kui sa ei saa tulla, anna palun reedeks teada. Ootame sind! Jaan',
        [['Kus elavad Jaani vanemad?', 'Tartu lähedal|maal|Kõrveküla külas'], ['Kuidas sa sinna saad?', 'Jaan võtab bussijaamast peale|Jaaniga'], ['Mida isa tahab näidata?', 'mesilasi|oma mesilasi'], ['Mida võiks emale kaasa viia?', 'lilli|lilled'], ['Mida pead tegema, kui sa ei saa tulla?', 'andma reedeks teada|teatama reedeks'], ['Miks on vanematega lihtne rääkida?', 'nad räägivad aeglaselt']]),
      B.table('071_t_polite', 'Ütle viisakamalt.', 'Kirjuta lause viisakalt. Sa räägid Jaani vanematega.', 'Lause, Viisakamalt', [
        'Kohvi ma ei taha. | [Aitäh, ma ei soovi kohvi./Aitäh, kohvi ma ei joo.]', 'Anna teed! | [Kas ma saaksin teed?/Kas tohib teed?]', 'Ma lähen nüüd. | [Mul on aeg minna./Kahjuks pean nüüd minema.]', 'Kook on hea. | [Kook on väga maitsev!]', 'Rohkem ei söö. | [Aitäh, rohkem ei jaksa.]',
      ], 'g_notice'),
      B.wordorder('071_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Aitäh, ma ei joo kohvi.', 'Kas ma saaksin tassi teed?', 'Teie kook on väga maitsev.', 'Kahjuks pean kell viis lahkuma.', 'Aitäh kutsumast, oli väga tore!',
      ]),
      TR('071_t_tr', ['Спасибо, я не пью кофе.', 'Можно мне чаю?', 'Ваш пирог очень вкусный.', 'К сожалению, мне нужно уйти в пять.', 'Спасибо за приглашение!']),
      D('071_t_dict', ['Tere, mina olen Jaani kolleeg.', 'Aitäh, ma ei joo kohvi.', 'Kas tohib teed?', 'Teie kodu on väga ilus.', 'Aitäh kutsumast!']),
      B.letter('071_t_reply', 'Vasta Jaanile.', 'Täna kutse eest. Ütle, et tuled, ja kirjuta kaks detaili.', 'Tere, Jaan!', 'Kohtumiseni!', [30, 50]),
      B.planning('071_t_plan', 'Enne külaskäiku.', 'Mõtle läbi ja kirjuta märksõnad.', ['Kuidas sa tervitad Jaani vanemaid?', 'Mida sa ütled, kui sulle pakutakse kohvi?', 'Mida sa küsid mesilaste kohta?', 'Kuidas sa viisakalt lahkud?']),
      B.rolecards('071_t_roles', 'Külas Jaani vanematel.', 'Rääkige 2–3 minutit. Kasutage teie-vormi.',
        'Sa oled Jaani ema või isa. Võta külaline vastu, paku süüa ja juua, küsi tema kohta.', 'Sa oled külaline. Sa ei joo kohvi. Kell viis jäta viisakalt hüvasti.',
        ['Tulge sisse!', 'Võtke istet!', 'Kas soovite…?'], ['Aitäh, ma ei joo kohvi. Kas tohib teed?', 'Väga maitsev!', 'Aitäh kutsumast!']),
      B.speaking('071_t_mono', 'Külaskäik minu maal.', 'Räägi 1–2 minutit: kuidas sinu kodumaal külla minnakse?', ['Kas külla minnakse kutsega või ilma?', 'Mida külaline kaasa toob?', 'Mida pakutakse?', 'Mis on Eestis teisiti?'], [60, 120]),
      B.writing('071_t_write', 'Tänukiri.', 'Kirjuta pärast külaskäiku Jaani vanematele 5–7 lauset.', [5, 7], ['aitäh', 'maitsev', 'tore', 'külla'], 3),
      B.selfcheck('071_t_self', ['Ma oskan kasutada külaskäigu väljendeid võõraste inimestega.', 'Ma oskan leida kutsest aja, koha ja selle, mida kaasa võtta.', 'Ma oskan pakkuda ja keelduda teie-vormis: Kas soovite…? Aitäh, ei soovi.', 'Ma oskan 2–3 minutit külas viisakalt vestelda ja lahkuda.'], 'Hea külaline'),
    ],
  },

  'a2-072': {
    title: 'Palve ja viisakas soov',
    canDo: 'Ma palun viisakalt abi kodus, tööl ja teeninduses (palun + käsk, Kas sa saad…?, Kas te saaksite…?, Tahaksin…, Kas ma tohin…?) ja muudan vähemalt 8 otsest lauset 10-st sobivaks palveks.',
    discover: [
      B.text('072_d_situation', 'Palun aita!', 'Laupäeval kolib Sofia uude korterisse. Tal on palju kaste ja vähe aega. Ta peab paluma abi sõbralt, naabrilt ja kolimisfirmalt. Igale inimesele räägib ta natuke erinevalt.'),
      B.vocab('072_d_vocab', 'Palve', ['palve — просьба', 'paluma — просить', 'palun — пожалуйста', 'abi — помощь', 'aitama — помогать', 'laenama — одалживать', 'ulatama — передавать', 'avama — открывать', 'sulgema — закрывать', 'tohtima (tohin) — сметь, можно', 'viisakas — вежливый', 'Tahaksin… — Я бы хотел(а)…'], '2'),
      B.reading('072_d_read', 'Loe: Sofia kolimispäev.', 'Loe teksti ja vasta küsimustele.', 'Kolimispäev', [
        'Laupäeva hommikul helistas Sofia kolimisfirmasse.', '„Tere! Tahaksin tellida auto kella kümneks. Kas te saaksite saata ka kaks meest?”', 'Töötaja vastas: „Muidugi, aga see maksab natuke rohkem.”',
        'Siis kirjutas Sofia sõbrale Jaanile: „Kas sa saad mulle oma auto laenata?”', 'Jaan vastas: „Autot ei saa, aga ma tulen ise appi.”',
        'Kell kümme tulid mehed. Sofia ütles: „Palun viige need kastid autosse. Olge ettevaatlikud, seal on klaasid.”', 'Trepikojas kohtas ta naabrit Viktorit: „Vabandust, kas te saaksite ukse lahti hoida?”', 'Viktor naeratas: „Hea meelega.”',
        'Uues korteris oli väga palav. Sofia palus Jaanil: „Ava palun aken!”', 'Õhtul olid kõik väsinud. Sofia küsis: „Kas ma tohin teile pitsa tellida?”', 'Kõik olid nõus. Sofia tänas kõiki abi eest.',
      ], [['Mida Sofia kolimisfirmast tellis?', 'auto ja kaks meest|auto'], ['Mida Sofia Jaanilt palus?', 'auto laenata|tema autot|autot'], ['Kuidas Jaan aitas?', 'ta tuli ise appi|tuli appi'], ['Miks pidid mehed ettevaatlikud olema?', 'kastides olid klaasid|seal on klaasid'], ['Mida palus Sofia naabril?', 'ukse lahti hoida|hoida ust lahti'], ['Mida Sofia õhtul pakkus?', 'pitsat|pitsa'], ['Miks palus Sofia akna avada?', 'oli palav|korteris oli palav']]),
      B.notice('072_d_notice', 'Märka: kuidas paluda?', ['Sõbrale: **Ava palun aken!** **Kas sa saad** mind **aidata**?', 'Võõrale: **Avage palun aken!** **Kas te saaksite** mind **aidata**?', 'Teeninduses: **Tahaksin** tellida auto. **Sooviksin** kohvi.', 'Luba: **Kas ma tohin / võin** siin istuda?', 'Vastus: **Hea meelega! Muidugi!** — **Kahjuks ei saa, sest…**'], 'full'),
      B.choice('072_d_choice', 'Mis sobib?', 'Loe olukorda. Vali sobiv palve.', [
        ['Bussis räägid võõra inimesega.', 'Kas te saaksite akna sulgeda?', 'Kas sa saad akna sulgeda?', 'Sa pead akna kohe sulgema.'],
        ['Kohvikus räägid teenindajaga.', 'Tahaksin ühe kohvi, palun.', 'Too mulle kohe kohvi.', 'Ma pean kohvi saama.'],
        ['Kirjutad uuele ülemusele.', 'Kas te saaksite mulle helistada?', 'Helista mulle kohe tagasi!', 'Kas sa helistad mulle?'],
        ['Tahad naabri telefoni kasutada.', 'Kas ma tohin teie telefoni kasutada?', 'Anna mulle oma telefon!', 'Ma võtan su telefoni.'],
        ['Sa ei kuulnud arsti küsimust.', 'Vabandust, kas te saaksite korrata?', 'Mis? Ütle uuesti!', 'Korda, ma ei kuulnud!'],
        ['Palud sõbralt pliiatsit.', 'Kas sa saad mulle pliiatsi ulatada?', 'Ulatage pliiats, härra!', 'Pliiats siia!'],
      ], 'full', 'g_use'),
      B.manymatch('072_d_match', 'Palve ja vastus.', 'Ühenda palve ja vastus.', ['Kas sa saad mind aidata?', 'Kas ma tohin akna avada?', 'Kas te saaksite ukse lahti hoida?', 'Palun ulata mulle sool!', 'Kas sa saad mulle 20 eurot laenata?'], ['Muidugi! Mis sul vaja on?', 'Jah, palun, siin on palav.', 'Jah, muidugi. Kas teil on palju kaste?', 'Palun, siin see on.', 'Kahjuks ei saa, mul pole raha.'], 'full', 'g_use'),
      B.transformation('072_d_trans', 'Ütle viisakamalt.', 'Muuda käsk viisakaks palveks.', [
        ['Ava aken!', 'Kas sa saad …?', 'Kas sa saad akna avada?'], ['Aita mind!', 'Kas te saaksite …?', 'Kas te saaksite mind aidata?'], ['Sulge uks!', 'Palun …!', 'Palun sulge uks!|Sulge palun uks!'],
        ['Ma võtan selle tooli.', 'Kas ma tohin …?', 'Kas ma tohin selle tooli võtta?'], ['Laena mulle raamatut!', 'Kas sa saad …?', 'Kas sa saad mulle raamatut laenata?|Kas sa saad mulle raamatu laenata?'], ['Ma tahan maksta.', 'Tahaksin …', 'Tahaksin maksta.'],
      ]),
      B.gaps('072_d_gaps', 'Täida palved.', 'Vali sõnapangast sobiv sõna. Kaks sõna jääb üle.', [
        '[Palun] ulata mulle leib.', 'Kas te [saaksite] mind homme aidata?', 'Kas ma [tohin] siin suitsetada?', '[Tahaksin] tellida laua kahele.', '[Vabandust], kas see koht on vaba?', 'Kas sa saad mulle oma auto [laenata]?',
      ], ['palun', 'saaksite', 'tohin', 'tahaksin', 'vabandust', 'laenata', 'saad', 'laenan']),
      B.crossword('072_d_cross', 'Palve sõnad.', 'Kirjuta sõna vihje järgi.', [['просьба', 'palve'], ['помощь', 'abi'], ['„sulgema” vastand', 'avama'], ['Kas ma … siin istuda? (= võin)', 'tohin'], ['Annan sõbrale raamatu, ta toob selle tagasi.', 'laenama'], ['вежливый', 'viisakas']]),
      B.translation('072_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Открой, пожалуйста, окно!', 'Вы не могли бы мне помочь?', 'Можно мне здесь сесть?', 'Я бы хотела заказать столик.', 'Ты можешь одолжить мне книгу?']),
      B.dictation('072_d_dict', 'Etteütlus.', 'Kuula ja kirjuta palved.', ['Ava palun aken!', 'Kas sa saad mind aidata?', 'Kas te saaksite ukse lahti hoida?', 'Kas ma tohin siin istuda?', 'Tahaksin ühe kohvi.']),
      B.speaking('072_d_say', 'Palu abi.', 'Palu paarilisel neli asja. Paariline vastab.', ['Palu sõbralt abi kolimisel.', 'Palu võõralt inimeselt ust lahti hoida.', 'Palu teenindajalt klaasi vett.', 'Küsi luba aken avada.'], [60, 90], ['Kas sa saad…?', 'Kas te saaksite…?', 'Kas ma tohin…?']),
      B.rolecards('072_d_roles', 'Naabri juures.', 'A palub naabrilt abi, B vastab. Siis vahetage.',
        'Sa kolid. Palu naabrilt kolm asja: hoida ust lahti, laenata tooli, aidata kasti tõsta.', 'Oled naaber. Ühele palvele vasta jah, ühele ei ja ütle põhjus.',
        ['Vabandust, kas te saaksite…?', 'Kas ma tohin…?', 'Suur aitäh!'], ['Hea meelega!', 'Kahjuks ei saa, sest…', 'Pole tänu väärt.']),
      B.writing('072_d_write', 'Kolm palvet.', 'Kirjuta kolm sõnumit: sõbrale, naabrile ja teenindajale (6–8 lauset).', [6, 8], ['palun', 'kas sa saad', 'kas te saaksite', 'tahaksin'], 2),
      B.selfcheck('072_d_self', ['Ma palun sõbralt: Kas sa saad…?', 'Ma palun võõralt: Kas te saaksite…?', 'Ma küsin luba: Kas ma tohin…?', 'Ma ütlen teeninduses: Tahaksin…'], 'Palun viisakalt'),
    ],
    practice: [
      B.table('072_p_forms', 'Kolm palvet.', 'Kirjuta puuduvad vormid.', 'Sina, Teie, Kas te saaksite…?', [
        'ava! | [avage] | Kas te saaksite [avada]?', 'aita! | [aidake] | Kas te saaksite [aidata]?', 'too! | [tooge] | Kas te saaksite [tuua]?',
        'oota! | [oodake] | Kas te saaksite [oodata]?', 'helista! | [helistage] | Kas te saaksite [helistada]?', 'ulata! | [ulatage] | Kas te saaksite [ulatada]?',
      ], 'g_notice'),
      B.match('072_p_where', 'Kus seda öeldakse?', 'Ühenda palve ja koht.', [
        ['Tahaksin broneerida toa kaheks ööks.', 'hotellis'], ['Kas te saaksite selle kingituseks pakkida?', 'poes'], ['Kas ma tohin siin pilti teha?', 'muuseumis'],
        ['Palun ulata mulle sool.', 'kodus laua taga'], ['Kas te saaksite mulle retsepti kirjutada?', 'arsti juures'], ['Tahaksin tellida takso lennujaama.', 'telefonis taksofirmaga'],
      ], 'full', 'g_vocab'),
      B.reading('072_p_read', 'Loe Liisi e-kirja.', 'Loe kirja ja vasta küsimustele.', 'Palved kolleegidele',
        'Head kolleegid! Järgmisel nädalal tuleb meile klient Soomest. See on meile väga tähtis klient. Mul on teile mõned palved. Kati, kas sa saaksid kolmapäevaks koosolekuruumi broneerida? Igor, palun kontrolli, kas projektor töötab. Anna, kas sa saad arve enne kolmapäeva valmis teha? Markus, kas sa saaksid kliendi lennujaamast ära tuua? Lend saabub kell 9.40. Palun ärge pange autot maja ette, seal parkida ei tohi. Kui kellelgi on küsimusi, kirjutage mulle. Kui te ei saa midagi teha, andke palun kohe teada. Aitäh teile! Liis',
        [['Kust klient tuleb?', 'Soomest'], ['Mida peab Kati broneerima?', 'koosolekuruumi'], ['Mida palub Liis Igoril?', 'kontrollida projektorit|kontrollida, kas projektor töötab'], ['Mida peab Anna valmis tegema?', 'arve|arve valmis'], ['Mis kell lend saabub?', '9.40|kell 9.40'], ['Kus ei tohi parkida?', 'maja ees|maja ette']]),
      B.truefalse('072_p_tf', 'Õige või vale?', 'Loe kirja uuesti.', [['Klient tuleb järgmisel nädalal.', true], ['Igor peab ruumi broneerima.', false], ['Markus toob kliendi lennujaamast.', true], ['Maja ees võib parkida.', false], ['Küsimused tuleb Liisile kirjutada.', true]]),
      B.gaps('072_p_gaps', 'Kirjuta õige vorm.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Kas te saaksite akna [sulgeda] (sulgema)?', 'Palun [oodake] (ootama, teie) siin!', 'Kas sa saad mulle pliiatsi [ulatada] (ulatama)?', 'Kas ma [tohin] (tohtima) siin istuda?',
        '[Tahaksin] (tahtma, viisakalt) üht kohvi.', 'Kas sa [saad] (saama) mind aidata?', 'Palun [helistage] (helistama, teie) homme!',
      ]),
      B.transformation('072_p_trans', 'Otse → viisakalt.', 'Kirjuta lause viisaka palvena.', [
        ['Too mulle vett!', 'Kas sa saad …?', 'Kas sa saad mulle vett tuua?'], ['Oodake siin!', 'Kas te saaksite …?', 'Kas te saaksite siin oodata?'], ['Ma suitsetan siin.', 'Kas ma tohin …?', 'Kas ma tohin siin suitsetada?'],
        ['Helistage mulle!', 'Kas te saaksite …?', 'Kas te saaksite mulle helistada?'], ['Laena mulle oma ratast!', 'Kas sa saad …?', 'Kas sa saad mulle oma ratast laenata?|Kas sa saad mulle oma ratta laenata?'],
      ]),
      B.errorfix('072_p_fix', 'Paranda viga.', 'Kirjuta palve õigesti.', [
        ['Kas te saaksite mind aitama?', 'Kas te saaksite mind aidata?'], ['Kas sa saad akna avada, härra Tamm?', 'Kas te saaksite akna avada, härra Tamm?|Kas te saate akna avada, härra Tamm?'], ['Kas ma tohin siin istuma?', 'Kas ma tohin siin istuda?'],
        ['Tahaksin üks kohv.', 'Tahaksin ühe kohvi.|Tahaksin üht kohvi.'], ['Palun tule sisse, proua Mets!', 'Palun tulge sisse, proua Mets!'], ['Kas sa saad mulle raha laenama?', 'Kas sa saad mulle raha laenata?'],
      ]),
      B.cloze('072_p_cloze', 'Sõnum naabrile.', 'Vali igasse lünka sobiv sõna.', 'Tere, härra Tamm!', [
        'Vabandust, et ma {*kirjutan|kirjuta|kirjutama} nii hilja. Homme tuleb meile kolimisauto.',
        '',
        'Kas te {*saaksite|saad|saama} oma auto teise kohta panna? Kolimisauto peab {*seisma|seista|seisab} maja ees kella kümnest kaheteistkümneni.',
        '',
        'Kas ma {*tohin|tohid|tohtima} teile homme hommikul helistada? Palun {*andke|anna|andma} teada, kui see ei sobi.',
        '',
        'Suur {*aitäh|palun|vabandust} abi eest! Sofia, korter 12',
      ]),
      B.dialogue('072_p_dialog', 'Kohvikus.', 'Täida Anna ja teenindaja vestlus.', 'Anna', 'Teenindaja', [
        ['A', 'Tere! [Tahaksin] ühe kohvi ja koogi, palun.'], ['B', 'Muidugi. Kas [soovite] kohvi piimaga?'], ['A', 'Jah, palun. Kas ma [tohin] istuda akna all?'], ['B', 'Jah, see laud on vaba.'],
        ['A', 'Kas te [saaksite] mulle ka klaasi vett tuua?'], ['B', 'Hea [meelega]!'], ['A', 'Ja kas ma saan kaardiga [maksta]?'], ['B', 'Muidugi.'],
      ]),
      B.wordorder('072_p_order', 'Pane palve kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kas te saaksite akna sulgeda?', 'Kas ma tohin siin istuda?', 'Tahaksin tellida laua kahele.', 'Palun andke kohe teada.', 'Kas sa saad mulle pliiatsi ulatada?']),
      B.translation('072_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta palve eesti keeles.', ['Вы не могли бы закрыть дверь?', 'Можно мне задать вопрос?', 'Я бы хотел заплатить.', 'Подай, пожалуйста, соль.', 'Ты можешь мне помочь завтра?']),
      B.speaking('072_p_say', 'Kolm olukorda.', 'Palu abi kolmes olukorras. Vali sina või teie.', ['Kolleeg: printer ei tööta.', 'Võõras tänaval: sa ei leia bussipeatust.', 'Kelner: sa tahad arvet.'], [60, 90], ['Kas sa saad…?', 'Vabandust, kas te saaksite…?', 'Tahaksin…']),
      B.letter('072_p_letter', 'Palve e-kirjas.', 'Kirjuta majahaldurile: mis on katki ja mida sa palud.', 'Tere!', 'Lugupidamisega', [30, 50]),
      B.selfcheck('072_p_self', ['Ma teen teie-vormi: avage, aidake, tooge.', 'Ma muudan käsu viisakaks palveks.', 'Ma leian kirjast, kes mida tegema peab.', 'Ma kirjutan viisaka palve e-kirjas.'], 'Palved on viisakad'),
    ],
    transfer: [
      B.text('072_t_situation', 'Uus olukord', 'Sa elad uues korteris esimest nädalat. Pesumasin ei tööta, internet on aeglane ja naaber kuulab öösel valju muusikat. Pead paluma abi korteriomanikult, naabrilt ja internetifirmalt.'),
      B.listening('072_t_listen', 'Kuula korteriomaniku sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Viktor, teie korteriomanik.', 'Sain teie kirja pesumasina kohta.', 'Kas te saaksite homme kell neli kodus olla? Siis tuleb meister.', 'Palun tehke pesumasina uks lahti ja võtke riided välja.',
        'Kas ma tohin meistrile anda teie telefoninumbri?', 'Interneti pärast palun helistage ise firmale. Number on lepingus.', 'Kui teil on veel küsimusi, kirjutage mulle. Head päeva!',
      ], ['Korteriomaniku nimi on [Viktor].', 'Meister tuleb homme kell [neli|4|16].', 'Enne peab pesumasinast välja võtma [riided].', 'Viktor tahab meistrile anda sinu [telefoninumbri|numbri].', 'Interneti pärast tuleb helistada [firmale|internetifirmale].', 'Firma number on [lepingus].']),
      B.categorize('072_t_sort', 'Kellele see palve sobib?', 'Pane palved õigesse rühma.', [
        ['Korteriomanikule (teie)', ['Kas te saaksite meistri saata?', 'Kas ma tohin seina värvida?']], ['Naabrile (sina)', ['Kas sa saad muusika vaiksemaks panna?', 'Kas sa saad mu lilli kasta?']], ['Internetifirmale', ['Tahaksin uut ruuterit.', 'Kas te saaksite kiirust kontrollida?']],
      ], 'full', 'g_use'),
      B.transformation('072_t_trans', 'Kirjuta viisakas palve.', 'Kirjuta lause antud alguse järgi.', [
        ['Saada meister!', 'Kas te saaksite …?', 'Kas te saaksite meistri saata?'], ['Pane muusika vaiksemaks!', 'Kas sa saad …?', 'Kas sa saad muusika vaiksemaks panna?'], ['Ma tahan uut ruuterit.', 'Tahaksin …', 'Tahaksin uut ruuterit.|Tahaksin uue ruuteri.'],
        ['Ma helistan teile õhtul.', 'Kas ma tohin …?', 'Kas ma tohin teile õhtul helistada?'], ['Kontrollige internetti!', 'Palun …', 'Palun kontrollige internetti!'],
      ]),
      B.errorfix('072_t_fix', 'Kontrolli kirja.', 'Kirjas on vead. Kirjuta lause õigesti.', [
        ['Kas te saaksite meister saata?', 'Kas te saaksite meistri saata?'], ['Kas sa saad muusika vaiksemaks panema?', 'Kas sa saad muusika vaiksemaks panna?'], ['Tahaksin teie homme helistada.', 'Tahaksin teile homme helistada.'],
        ['Kas ma tohin seina värvima?', 'Kas ma tohin seina värvida?'], ['Palun annab teada!', 'Palun andke teada!|Palun anna teada!'],
      ]),
      B.dictation('072_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas te saaksite meistri saata?', 'Tahaksin uut ruuterit.', 'Kas ma tohin teile helistada?', 'Palun andke teada.', 'Suur aitäh abi eest!']),
      B.translation('072_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Стиральная машина не работает.', 'Вы не могли бы прислать мастера?', 'Можно мне позвонить вам вечером?', 'Ты можешь сделать музыку тише?', 'Спасибо за помощь!']),
      B.planning('072_t_plan', 'Enne kirja.', 'Mõtle läbi ja kirjuta märksõnad.', ['Kellele sa kirjutad? Sina või teie?', 'Mis on probleem?', 'Mida sa palud?', 'Millal sul aega on?']),
      B.letter('072_t_letter', 'Kiri korteriomanikule.', 'Kirjuta Viktorile 40–60 sõna: vasta tema küsimustele ja palu veel üht asja.', 'Tere, Viktor!', 'Lugupidamisega', [40, 60]),
      B.writing('072_t_neighbour', 'Sõnum naabrile.', 'Kirjuta naabrile 4–6 lauset: palu viisakalt öösel vaiksem olla.', [4, 6], ['palun', 'kas sa saad', 'aitäh'], 2),
      B.rolecards('072_t_roles', 'Telefonis internetifirmaga.', 'A on klient, B on firma töötaja. Siis vahetage.',
        'Sinu internet on aeglane. Selgita probleemi ja palu abi. Küsi, millal meister tuleb.', 'Oled firma töötaja. Küsi aadressi ja paku meistri aega.',
        ['Tahaksin…', 'Kas te saaksite…?', 'Kas ma tohin…?'], ['Mis on teie aadress?', 'Kas teile sobib…?', 'Palun oodake hetk.']),
      B.speaking('072_t_say', 'Naabriga trepikojas.', 'Räägi naabriga: palu viisakalt ja paku midagi vastu.', ['Tervita naabrit.', 'Ütle, mis on probleem.', 'Palu viisakalt.', 'Täna ja jäta hüvasti.'], [45, 90]),
      B.rubric('072_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Palved on viisakad: palun, kas sa saad / kas te saaksite, tahaksin.', 'Sina ja teie on õigesti valitud.', 'Kirjas on probleem, palve ja aeg.', 'Telefonis küsib ja vastab õpilane selgelt.']),
      B.selfcheck('072_t_self', ['Ma saan aru korteriomaniku sõnumist.', 'Ma valin palvele sina või teie.', 'Ma kirjutan viisaka kirja ja sõnumi.', 'Ma palun telefonis abi.'], 'Abi on palutud'),
    ],
  },

  'a2-073': {
    title: 'Nõustumine ja keeldumine',
    canDo: 'Ma nõustun või keeldun viisakalt, ütlen põhjuse sõnaga „sest” ja pakun alternatiivi vähemalt kolmes dialoogis.',
    discover: [
      B.text('073_d_situation', 'Kiire nädal', 'Viktoril on sel nädalal palju tööd. Sõbrad kutsuvad teda kinno, sauna ja jalgpalli. Ta ei saa igale poole minna. Aga ta tahab vastata viisakalt.'),
      B.truefalse('073_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Viktoril on sel nädalal vähe tööd.', false], ['Sõbrad kutsuvad Viktorit kolme kohta.', true], ['Viktor saab igale poole minna.', false], ['Viktor tahab vastata viisakalt.', true], ['Üks kutse on kinno.', true],
      ]),
      B.vocab('073_d_vocab', 'Jah ja ei', ['nõustuma — соглашаться', 'keelduma — отказываться', 'sobib — подходит', 'muidugi — конечно', 'kahjuks — к сожалению', 'ma ei saa — я не могу', 'ma ei jõua — я не успею', 'sest — потому что', 'põhjus — причина', 'võib-olla — может быть', 'hea meelega — с удовольствием', 'Kuidas oleks…? — Как насчёт…?']),
      B.reading('073_d_read', 'Loe: Viktori sõnumid.', 'Loe sõnumeid ja vasta küsimustele.', 'Viktori telefon',
        'Liis: Tere, Viktor! Kas tuled reede õhtul kinno? Film algab kell seitse.\nViktor: Kahjuks ma ei saa, sest reedel töötan hilja. Aga kuidas oleks laupäeval?\nLiis: Laupäev sobib! Kohtume kino ees.\n\nJaan: Viktor, kas aitad mul pühapäeval kolida?\nViktor: Muidugi! Hea meelega. Mis kell?\nJaan: Kell kümme. Ma ostan pärast pitsat.\nViktor: Sobib, olen kohal.\n\nMarkus: Kas tuled teisipäeval jalgpalli mängima?\nViktor: Võib-olla. Ma ei tea veel, sest mu jalg valutab natuke.\nMarkus: Selge. Anna esmaspäeval teada.\nViktor: Hästi, kirjutan esmaspäeva õhtul.\n\nSofia: Viktor, kas tuled kolmapäeval meie sauna?\nViktor: Aitäh kutse eest, aga kolmapäeval ma tõesti ei jõua. Mul on eksam. Võib-olla teisel ajal?\nSofia: Muidugi, järgmisel nädalal!',
        [['Miks ei lähe Viktor reedel kinno?', 'ta töötab hilja|reedel töötab ta hilja'], ['Mis päeval lähevad Liis ja Viktor kinno?', 'laupäeval'], ['Kellega on Viktor kohe nõus?', 'Jaaniga|Jaan'], ['Miks ei tea Viktor, kas ta läheb jalgpalli?', 'jalg valutab|tal valutab jalg'], ['Mida Viktor kolmapäeval teeb?', 'tal on eksam|teeb eksamit'], ['Kellele pakub Viktor teist aega?', 'Liisile ja Sofiale|Liisile|Sofiale']]),
      B.table('073_d_find', 'Leia tekstist.', 'Kirjuta igasse ritta näide tekstist.', 'Mida Viktor teeb?, Lause tekstist', [
        'nõustub | [Muidugi! Hea meelega./Sobib, olen kohal.]', 'keeldub | [Kahjuks ma ei saa./Kolmapäeval ma tõesti ei jõua.]', 'ütleb põhjuse | [sest reedel töötan hilja/sest mu jalg valutab natuke/Mul on eksam.]', 'pakub teist aega | [Aga kuidas oleks laupäeval?/Võib-olla teisel ajal?]', 'ei tea veel | [Võib-olla. Ma ei tea veel.]',
      ], 'g_notice'),
      B.notice('073_d_notice', 'Märka: jah, ei ja põhjus', [
        'Jah: **Muidugi!** **Sobib!** **Hea meelega!**', 'Ei: **Kahjuks ma ei saa**, **sest** mul on…', 'Põhjus: **sest** + lause: sest ma **töötan** hilja', 'Teine aeg: **Aga kuidas oleks** laupäeval? **Võib-olla teisel ajal.**', '**ei saa** + da: ma ei saa **tulla**',
      ], 'full'),
      B.categorize('073_d_sort', 'Jah, ei või võib-olla?', 'Sorteeri vastused.', [
        ['Jah', ['Muidugi!', 'Sobib!', 'Hea meelega!']], ['Ei', ['Kahjuks ei saa.', 'See päev ei sobi.', 'Ma ei jõua.']], ['Võib-olla', ['Ma ei tea veel.', 'Võib-olla.', 'Annan homme teada.']],
      ], 'full', 'g_vocab'),
      B.match('073_d_match', 'Kutse ja vastus.', 'Ühenda küsimus ja sobiv vastus.', [
        ['Kas tuled reedel kinno?', 'Kahjuks ei saa, reedel töötan.'], ['Kas aitad mul kolida?', 'Muidugi, mis kell?'], ['Kas tuled jalgpalli?', 'Võib-olla, jalg valutab natuke.'], ['Kas kolmapäev sobib?', 'Ei sobi, aga neljapäev sobib.'], ['Kas sa tuled meie sauna?', 'Aitäh kutse eest! Hea meelega.'], ['Kas kohtume kell viis?', 'Viis on vara. Kuidas oleks kuus?'],
      ], 'full', 'g_use'),
      B.gaps('073_d_gaps', 'Täida vastused.', 'Kirjuta lünka sobiv sõna. Kolm sõna jääb üle.', [
        '[Kahjuks] ma ei saa tulla.', 'Ma ei saa, [sest] mul on trenn.', 'Laupäev [sobib] mulle hästi.', '[Muidugi] aitan sind!', 'Aga kuidas [oleks] pühapäeval?', 'Võib-olla teisel [ajal].',
      ], ['kahjuks', 'sest', 'sobib', 'sobi', 'muidugi', 'oleks', 'on', 'ajal', 'aeg']),
      B.choice('073_d_choice', 'Kas see on jah või ei?', 'Loe vastust. Mida inimene mõtleb?', [
        ['„Hea meelega! Mis kell?”', 'jah', 'ei', 'ei tea veel'], ['„Kahjuks ma ei jõua.”', 'ei', 'jah', 'ei tea veel'], ['„Annan homme teada.”', 'ei tea veel', 'jah', 'ei'], ['„Laupäev ei sobi, aga pühapäev sobib.”', 'ei, aga pakub teist päeva', 'jah, laupäeval', 'ei tea veel'], ['„Sobib, olen kohal.”', 'jah', 'ei', 'ei tea veel'],
      ], 'full', 'g_read'),
      B.wordorder('073_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Ma ei saa tulla, sest mul on trenn.', 'Kahjuks ma ei jõua, sest töötan hilja.', 'Aga kuidas oleks pühapäeva hommikul?', 'Laupäev sobib mulle väga hästi.', 'Võib-olla saame kokku järgmisel nädalal.',
      ]),
      B.errorfix('073_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei saan tulla.', 'Ma ei saa tulla.'], ['Ma ei saa tulema.', 'Ma ei saa tulla.'], ['Kahjuks ei sobib.', 'Kahjuks ei sobi.'], ['Ma ei tule, sest ma olen töö.', 'Ma ei tule, sest ma olen tööl.'], ['Kuidas oleks laupäev?', 'Kuidas oleks laupäeval?'],
      ]),
      B.dialogue('073_d_dialog', 'Kas tuled?', 'Täida dialoog.', 'Anna', 'Markus', [
        ['A', 'Markus, kas sa tuled homme meile õhtusöögile?'], ['B', '[Kahjuks] ma ei saa.'], ['A', 'Miks?'], ['B', 'Ma ei saa, [sest] mu ema on haige.'],
        ['A', 'Oi, kahju. Aga kuidas [oleks] laupäeval?'], ['B', 'Laupäev [sobib] hästi. Mis kell?'], ['A', 'Kell kuus.'], ['B', '[Hea] meelega!'],
      ]),
      D('073_d_dict', ['Kahjuks ma ei saa tulla.', 'Laupäev sobib mulle.', 'Ma ei tule, sest olen tööl.', 'Aga kuidas oleks pühapäeval?', 'Võib-olla teisel ajal.']),
      TR('073_d_tr', ['К сожалению, я не могу.', 'Суббота мне подходит.', 'Я не приду, потому что я на работе.', 'А как насчёт воскресенья?', 'Может быть, в другой раз.']),
      B.speaking('073_d_say', 'Jah või ei?', 'Paariline kutsub sind kolm korda. Vasta: jah, ei, võib-olla.', ['Kas tuled homme kinno?', 'Kas aitad mul kolida?', 'Kas tuled laupäeval sünnipäevale?'], [60, 120], ['Muidugi!', 'Kahjuks ei saa, sest…', 'Võib-olla…']),
      B.writing('073_d_write', 'Minu vastused.', 'Kirjuta kolm lühikest vastust: üks jah, üks ei, üks võib-olla.', [4, 6], ['muidugi', 'kahjuks', 'sest', 'võib-olla'], 3),
      B.selfcheck('073_d_self', ['Ma ütlen viisakalt jah ja ei.', 'Ma ütlen põhjuse sõnaga „sest”.', 'Ma pakun teist aega.', 'Ma tean: ei saa + da.'], 'Jah ja ei'),
    ],
    practice: [
      B.categorize('073_p_recall', 'Mäletad?', 'Sorteeri fraasid.', [
        ['Nõustumine', ['Muidugi!', 'Sobib!', 'Hea meelega!']], ['Keeldumine', ['Kahjuks ei saa.', 'Ma ei jõua.', 'See päev ei sobi.']], ['Teine aeg', ['Kuidas oleks reedel?', 'Võib-olla teisel ajal.', 'Äkki järgmisel nädalal?']],
      ], 'full', 'g_vocab'),
      B.wordforms('073_p_forms', 'Eitav vorm.', 'Kirjuta eitav vorm.', [
        ['ma saan', 'eitus', 'ma ei saa'], ['see sobib', 'eitus', 'see ei sobi'], ['ma jõuan', 'eitus', 'ma ei jõua'], ['ma tulen', 'eitus', 'ma ei tule'], ['ma tean', 'eitus', 'ma ei tea'], ['me saime', 'eitus (minevik)', 'me ei saanud'],
      ]),
      B.gaps('073_p_gaps', 'Da- või ma-vorm?', 'Vali õige vorm.', [
        'Kahjuks ma ei saa [tulla].', 'Ma pean reedel [töötama].', 'Kas sa saad mind [aidata]?', 'Ma ei jõua kinno [minna].', 'Mul on vaja täna [puhata].', 'Ma pean hommikul vara [ärkama].',
      ], ['tulla', 'tulema', 'töötama', 'töötada', 'aidata', 'aitama', 'minna', 'minema', 'puhata', 'puhkama', 'ärkama', 'ärgata']),
      B.manymatch('073_p_reasons', 'Miks ei saa?', 'Ühenda keeldumine ja põhjus.', [
        'Ma ei saa jalgpalli mängida,', 'Ma ei saa kinno tulla,', 'Ma ei saa sind jaamast peale võtta,', 'Ma ei saa sauna tulla,', 'Ma ei saa kolimisel aidata,',
      ], [
        'sest mu jalg valutab.', 'sest film algab liiga hilja.', 'sest mu auto on remondis.', 'sest mulle ei meeldi kuumus.', 'sest mul on selg haige.',
      ], 'full', 'g_use'),
      B.listening('073_p_listen', 'Kas Markus tuleb?', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Markus! Anna siin.', '— Tere, Anna!', '— Mul on kaks piletit teatrisse. Etendus on laupäeval kell seitse. Kas tuled?',
        '— Oi, aitäh! Aga kahjuks ma ei saa. Laupäeval on minu ema sünnipäev.', '— Ah nii. Kahju.', '— Aga mis etendus see on?',
        '— Komöödia. Seda mängitakse ka järgmisel nädalal.', '— Kuidas oleks järgmisel reedel? Ma ostan ise piletid.',
        '— Reedel ma ei saa, mul on trenn. Aga neljapäev sobib.', '— Sobib! Neljapäeval kell seitse.', '— Ja laupäeva piletid annan oma õele.', '— Väga hea mõte! Kohtume teatri ees.',
      ], ['Anna kutsub Markuse [teatrisse].', 'Markus ei saa laupäeval, sest on ema [sünnipäev].', 'Etendus on [komöödia].', 'Reedel on Annal [trenn].', 'Lõpuks lähevad nad teatrisse [neljapäeval].', 'Uued piletid ostab [Markus].', 'Laupäeva piletid annab Anna oma [õele].']),
      B.transformation('073_p_trans', 'Ühenda laused.', 'Kirjuta üks lause antud sõnaga.', [
        ['Ma ei tule. Mul on trenn.', 'sest', 'Ma ei tule, sest mul on trenn.'], ['Reede ei sobi. Laupäev sobib.', 'aga', 'Reede ei sobi, aga laupäev sobib.'], ['Ma ei saa aidata. Ma olen haige.', 'sest', 'Ma ei saa aidata, sest ma olen haige.'], ['Täna ei saa. Homme saan.', 'aga', 'Täna ei saa, aga homme saan.|Täna ma ei saa, aga homme saan.'], ['Ma tulen hea meelega. Mul on vaba päev.', 'sest', 'Ma tulen hea meelega, sest mul on vaba päev.'],
      ]),
      B.errorfix('073_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei saa, sest ma pean töötada.', 'Ma ei saa, sest ma pean töötama.'], ['Kahjuks ma ei jõuan.', 'Kahjuks ma ei jõua.'], ['Laupäeval sobib mulle.', 'Laupäev sobib mulle.|Laupäeval sobib mulle hästi.'], ['Ma ei tule, sest ma haige.', 'Ma ei tule, sest ma olen haige.'], ['Võib-olla teine aeg.', 'Võib-olla teisel ajal.|Võib-olla teine kord.'],
      ]),
      B.wordorder('073_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Kahjuks ma ei saa laupäeval tulla.', 'Laupäeval on minu ema sünnipäev.', 'Aga kuidas oleks järgmisel reedel?', 'Reedel ma ei saa, mul on trenn.', 'Neljapäev sobib mulle hästi.',
      ]),
      D('073_p_dict', ['Mul on kaks piletit teatrisse.', 'Kahjuks ma ei saa laupäeval.', 'Reedel on mul trenn.', 'Neljapäev sobib hästi.', 'Kohtume teatri ees.']),
      TR('073_p_tr', ['У меня два билета в театр.', 'В субботу день рождения моей мамы.', 'В пятницу я не могу, у меня тренировка.', 'Четверг подходит.', 'Встретимся у театра.']),
      B.rolecards('073_p_roles', 'Kolm kutset.', 'A kutsub kolm korda. B keeldub korra ja pakub teist aega.',
        'Kutsu paarilist: kinno, kolimisele appi, sünnipäevale. Küsi kellaaega.', 'Ütle üks kord jah, üks kord ei põhjusega, üks kord võib-olla.',
        ['Kas sa tuled…?', 'Kas sa saad…?', 'Aga kuidas oleks…?'], ['Hea meelega!', 'Kahjuks ei saa, sest…', 'Võib-olla, annan homme teada.']),
      B.speaking('073_p_say', 'Räägi kuuldust.', 'Räägi paarilisele, kuidas Anna ja Markus kokku leppisid.', ['Kuhu Anna Markuse kutsus?', 'Miks Markus laupäeval ei saanud?', 'Mis on uus päev?'], [45, 90]),
      B.writing('073_p_write', 'Muutunud plaan.', 'Kirjuta sõbrale 6–8 lauset: miks sa ei saa ja mis päev sobib.', [6, 8], ['kahjuks', 'sest', 'aga', 'kuidas oleks'], 3),
      B.selfcheck('073_p_self', ['Ma moodustan eituse: ma ei saa, see ei sobi.', 'Ma valin: ei saa tulla, pean töötama.', 'Ma ühendan laused: sest, aga.', 'Ma saan aru kokkuleppest telefonis.'], 'Kokkulepe on olemas'),
    ],
    transfer: [
      B.text('073_t_situation', 'Uus olukord', 'Sul on järgmisel nädalal kolm kutset ja palvet. Aega on ainult ühel õhtul. Loe sõnumeid ja vasta kõigile viisakalt.'),
      B.reading('073_t_read', 'Kolm sõnumit.', 'Loe sõnumeid. Vasta sõnumi tähega või lühidalt.', 'Sinu sõnumid',
        'A. Tere! Ma kolin reedel uude korterisse. Kas sa saaksid mind kella viiest aidata? Mul on palju raskeid kaste. Uus korter on teisel korrusel, lifti ei ole. Pärast teen pitsat ja ostan jooke. Jaan\n\nB. Tere, naaber! Ma sõidan neljapäeval kaheks päevaks Pärnusse. Kas sa saaksid mu kassi toita? Võti on postkastis. Kassi toit on köögis kapis. Kass sööb kaks korda päevas. Sofia\n\nC. Tere! Laupäeval on meie kursuse lõpupidu kohvikus „Kask”. Algus on kell kuus. Iga külaline toob kaasa ühe salati või koogi. Palun anna teada kolmapäevaks. Õpetaja Tiina',
        [['Kes vajab abi kolimisel?', 'A|Jaan'], ['Kuhu Sofia sõidab?', 'Pärnusse|Pärnu'], ['Kus on Sofia võti?', 'postkastis'], ['Mida peab peole kaasa võtma?', 'salati või koogi|salatit või kooki'], ['Millal pead õpetajale vastama?', 'kolmapäevaks'], ['Kes pakub pärast tööd süüa?', 'A|Jaan']]),
      B.choice('073_t_choice', 'Mis on viisakas?', 'Vali parim vastus.', [
        ['Ülemus küsib: „Kas saad laupäeval tööle tulla?” Sa ei saa.', 'Kahjuks ei saa, mul on pereüritus. Kas pühapäev sobib?', 'Ei saa, ma ei taha laupäeval töötada.', 'Muidugi, ma tulen laupäeval tööle.'],
        ['Naaber palub kassi toita. Sa oled vaba.', 'Muidugi, hea meelega aitan!', 'Kahjuks ei saa, ma olen ära.', 'Võib-olla, ma ei tea veel.'],
        ['Sõber kutsub kinno. Sa ei tea veel oma plaane.', 'Võib-olla, annan homme teada.', 'Hea meelega, tulen kindlasti!', 'Ei, ma ei taha kinno.'],
        ['Sõber pakub kohtumiseks kella kaheksat. See on liiga vara.', 'Kaheksa on vara. Kuidas oleks kümme?', 'Sobib, kell kaheksa on hea.', 'Ma ei tule nii vara.'],
        ['Kolleeg kutsub sünnipäevale, aga sa oled haige.', 'Aitäh kutse eest, aga ma olen haige.', 'Aitäh, ma tulen kindlasti!', 'Ma ei tule, mulle ei meeldi peod.'],
        ['Sa pead kokkulepitud kohtumise ära jätma.', 'Vabandust, mul tuli midagi vahele. Kas homme sobib?', 'Ma ei tule. Head aega.', 'Ma ei tea, võib-olla tulen.'],
      ], 'full', 'g_use'),
      B.cloze('073_t_cloze', 'Vastus õpetajale.', 'Vali igasse lünka sobiv sõna.', 'Tere, õpetaja Tiina!', [
        'Aitäh kutse {*eest|ees|eesse}! Ma tulen lõpupeole {*hea|heal|head} meelega. Ma võtan kaasa {*kartulisalati|kartulisalat|kartulisalatiga}.',
        'Kahjuks ma ei {*saa|saan|saama} tulla kell kuus, {*sest|aga|ja} ma töötan kella kuueni. Kas {*sobib|sobi|sobivad}, kui ma tulen pool tundi hiljem?',
        '',
        'Tervitades',
        'Viktor',
      ]),
      B.wordorder('073_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Muidugi, ma toidan su kassi.', 'Kahjuks ma ei saa reedel aidata.', 'Kas laupäeva hommik sobib?', 'Ma tulen peole hea meelega.', 'Ma võtan kaasa ühe salati.',
      ]),
      TR('073_t_tr', ['Конечно, я покормлю твою кошку.', 'К сожалению, в пятницу я не могу помочь.', 'Как насчёт субботы?', 'Я с удовольствием приду на праздник.', 'Спасибо за приглашение!']),
      D('073_t_dict', ['Muidugi aitan sind.', 'Kahjuks ma ei saa reedel.', 'Kuidas oleks laupäeval?', 'Ma tulen hea meelega.', 'Aitäh kutse eest!']),
      B.planning('073_t_plan', 'Sinu otsus.', 'Otsusta ja kirjuta märksõnad.', ['Millise kutse sa võtad vastu?', 'Millest sa keeldud? Miks?', 'Millist teist aega sa pakud?']),
      B.writing('073_t_write', 'Kolm vastust.', 'Vasta kõigile kolmele 2–3 lausega. Üks vastus on jah, üks ei.', [6, 9], ['muidugi', 'kahjuks', 'sest', 'kuidas oleks'], 3),
      B.rolecards('073_t_roles', 'Telefonikõne.', 'Rääkige 2 minutit. Siis vahetage rollid.',
        'Sa oled Jaan. Palu sõbralt abi kolimisel. Kui ta keeldub, küsi teist aega.', 'Sa ei saa reedel. Ütle põhjus ja paku teist aega.',
        ['Kas sa saaksid…?', 'Aga kuidas oleks…?'], ['Kahjuks ma ei saa, sest…', 'Aga ma saan…', 'Sobib!']),
      B.speaking('073_t_mono', 'Kas „ei” on raske?', 'Räägi 1–2 minutit.', ['Kas sa ütled kergesti „ei”?', 'Millal sa viimati keeldusid? Miks?', 'Kuidas keelduda viisakalt?'], [60, 120]),
      B.selfcheck('073_t_self', ['Ma oskan kasutada väljendeid muidugi, kahjuks, hea meelega uues olukorras.', 'Ma oskan leida sõnumitest, kes mida palub ja millal.', 'Ma oskan keelduda põhjusega: ei saa, sest…', 'Ma oskan keelduda nii, et vestlus jätkub, ja pakkuda teist aega.'], 'Viisakas ja aus'),
    ],
  },

  'a2-074': {
    title: 'Sõnum sõbrale või tuttavale',
    canDo: 'Ma kirjutan sõbrale või tuttavale 50–70-sõnalise sõnumi (kutse, tänu või aja muutmine), kus on eesmärk, vajalik info ja sobiv lõpp.',
    discover: [
      B.text('074_d_situation', 'Kolm sõnumit', 'Anna kirjutab täna kolm sõnumit: sõbrannale, naabrile ja kolleegile. Iga sõnum on erinev: kutse, tänu ja aja muutmine.'),
      B.truefalse('074_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Anna kirjutab täna ühe sõnumi.', false], ['Üks sõnum on naabrile.', true], ['Kõik sõnumid on kutsed.', false], ['Ühes sõnumis Anna tänab.', true], ['Anna kirjutab ka kolleegile.', true],
      ]),
      B.vocab('074_d_vocab', 'Sõnumi sõnad', ['sõnum — сообщение', 'kutse — приглашение', 'tänama — благодарить', 'Aitäh … eest! — Спасибо за…!', 'muutma — менять', 'edasi lükkama — переносить', 'teada andma — сообщать', 'Tervitades — С приветом', 'Kallistan — Обнимаю', 'Kohtumiseni! — До встречи!', 'Lugupidamisega — С уважением', 'adressaat — адресат']),
      B.reading('074_d_read', 'Loe Anna sõnumeid.', 'Loe sõnumeid ja vasta küsimustele.', 'Anna sõnumid',
        '1. Tere, Liis! Mul on laupäeval sünnipäev. Kutsun sind külla kell kuus. Tulevad ka Markus ja Sofia. Teen ise süüa, aga võid tuua magustoitu. Aadress on Tamme 12–5. Palun anna reedeks teada, kas tuled. Kallistan! Anna\n\n2. Tere, naaber! Suur aitäh abi eest! Sa aitasid mul eile kappi tuppa tuua. Üksi ma ei saanud seda teha. Ma küpsetasin sulle pirukaid. Toon need täna õhtul. Tervitades, Anna\n\n3. Tere, Jaan! Kahjuks ma ei saa homme kell kümme koosolekule tulla, sest mu laps on haige. Kas saaksime kohtumise neljapäevale lükata? Neljapäeval olen vaba terve päeva. Aruande saadan sulle täna õhtul e-kirjaga. Vabandust ja aitäh! Anna',
        [['Mis on esimese sõnumi eesmärk?', 'kutse|kutsuda külla|kutsuda sünnipäevale'], ['Mida võib Liis kaasa tuua?', 'magustoitu|magustoidu'], ['Mille eest Anna naabrit tänab?', 'abi eest|et ta aitas kappi tuppa tuua'], ['Miks ei saa Anna koosolekule tulla?', 'laps on haige|tema laps on haige'], ['Millise päeva Anna pakub?', 'neljapäeva|neljapäeval'], ['Millise sõnumi lõpp on kõige isiklikum?', 'esimese|1|Kallistan']]),
      B.table('074_d_find', 'Sõnumi osad.', 'Leia sõnumitest 1 ja 3 osad.', 'Osa, Sõnum 1, Sõnum 3', [
        'Pöördumine | [Tere, Liis!] | [Tere, Jaan!]', 'Eesmärk | [kutse/kutsun sind külla] | [aja muutmine/ei saa tulla]', 'Palve | [anna reedeks teada] | [lükata neljapäevale/kas saaksime kohtumise neljapäevale lükata]', 'Lõpp | [Kallistan!] | [Vabandust ja aitäh!]',
      ], 'g_notice'),
      B.notice('074_d_notice', 'Märka: sõnumi plaan', [
        '1. **Pöördumine**: Tere, Liis! / Tere, Jaan!', '2. **Eesmärk**: Kutsun sind… / Aitäh … **eest**! / Kahjuks ma ei saa…', '3. **Info**: millal? kus? mida kaasa võtta?', '4. **Palve või küsimus**: Palun anna teada… / Kas saaksime…?', '5. **Lõpp**: Kallistan! (sõber) / Tervitades (tuttav)',
      ], 'full'),
      B.crossword('074_d_words', 'Sõnumi sõnad.', 'Kirjuta sõnad vihjete järgi.', [
        ['Sõnum, kus sa kutsud külla.', 'kutse'], ['Lõpp parimale sõbrale.', 'kallistan'], ['Lõpp tuttavale.', 'tervitades'], ['Ütled aitäh.', 'tänama'], ['Inimene, kellele sa kirjutad.', 'adressaat'],
      ]),
      B.wordforms('074_d_forms', 'Aitäh … eest!', 'Kirjuta sõna õiges vormis.', [
        ['kingitus', 'Aitäh … eest!', 'kingituse'], ['lilled', 'Aitäh … eest!', 'lillede'], ['tore õhtu', 'Aitäh … eest!', 'toreda õhtu'], ['raamat', 'Aitäh … eest!', 'raamatu'], ['kook', 'Aitäh … eest!', 'koogi'], ['kutse', 'Aitäh … eest!', 'kutse'],
      ]),
      B.choice('074_d_choice', 'Kellele ja kuidas?', 'Vali sobiv lõpp või pöördumine.', [
        ['Sõnum parimale sõbrale. Lõpp:', 'Kallistan!', 'Lugupidamisega', 'Austusega'],
        ['E-kiri kooli direktorile. Lõpp:', 'Lugupidamisega', 'Kallistan!', 'Musi!'],
        ['Sõnum kolleegile. Lõpp:', 'Tervitades', 'Musi!', 'Kallistan sind kõvasti!'],
        ['Sõnum naabrile, keda sa hästi ei tunne. Pöördumine:', 'Tere, naaber!', 'Kallis kullake!', 'Hei, sõber!'],
        ['Sõnum sõbrale. Ta peab vastama. Mida kirjutad?', 'Palun anna teada!', 'Lugupidamisega', 'Aitäh tähelepanu eest!'],
      ], 'full', 'g_use'),
      B.gaps('074_d_gaps', 'Täida sõnum.', 'Kirjuta lünka sobiv sõna. Kolm sõna jääb üle.', [
        '[Tere], Markus!', 'Aitäh [kutse] eest!', '[Kahjuks] ma ei saa laupäeval tulla.', 'Kas [saaksime] kohtuda pühapäeval?', 'Palun anna [teada], kas sobib.', '[Kallistan]!',
      ], ['tere', 'kutse', 'kutsun', 'kahjuks', 'muidugi', 'saaksime', 'teada', 'teadma', 'kallistan']),
      B.transformation('074_d_trans', 'Aitäh … eest!', 'Ütle lühemalt sõnaga „eest”.', [
        ['Aitäh, et sa aitasid!', 'eest', 'Aitäh abi eest!'], ['Aitäh, et sa mind kutsusid!', 'eest', 'Aitäh kutse eest!'], ['Aitäh, et sa kinkisid raamatu!', 'eest', 'Aitäh raamatu eest!'], ['Aitäh, et sa tõid lilled!', 'eest', 'Aitäh lillede eest!'], ['Aitäh, et sa küpsetasid koogi!', 'eest', 'Aitäh koogi eest!'],
      ]),
      B.errorfix('074_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Aitäh kutsest!', 'Aitäh kutse eest!'], ['Aitäh sinu abi.', 'Aitäh sinu abi eest!|Aitäh abi eest!'], ['Ma kutsun sind minu sünnipäevale.', 'Ma kutsun sind oma sünnipäevale.'], ['Palun anna teadma.', 'Palun anna teada.'], ['Kas me saame kohtumine muuta?', 'Kas me saame kohtumist muuta?|Kas me saame kohtumise aega muuta?'],
      ]),
      TR('074_d_tr', ['Спасибо за приглашение!', 'Я приглашаю тебя на мой день рождения.', 'Сообщи, пожалуйста, придёшь ли ты.', 'Можем ли мы перенести встречу?', 'Обнимаю!']),
      D('074_d_dict', ['Kutsun sind külla.', 'Aitäh abi eest!', 'Palun anna teada.', 'Kas saaksime kohtumise lükata?', 'Kohtumiseni!']),
      B.speaking('074_d_say', 'Minu sõnumid.', 'Räägi paarilisele oma sõnumitest.', ['Kellele sa kõige tihedamini kirjutad?', 'Kas sa kirjutad eesti keeles?', 'Kuidas sa sõnumi lõpetad?'], [60, 120]),
      B.writing('074_d_write', 'Lühike kutse.', 'Kirjuta sõbrale kutse 4–6 lausega: kuhu, millal, mida võtta kaasa.', [4, 6], ['kutsun', 'kell', 'palun anna teada'], 2),
      B.selfcheck('074_d_self', ['Ma leian sõnumist pöördumise, eesmärgi ja lõpu.', 'Ma ütlen: Aitäh kingituse eest!', 'Ma valin lõpu: Kallistan / Tervitades.', 'Ma kirjutan lühikese kutse.'], 'Sõnum on loetud'),
    ],
    practice: [
      B.categorize('074_p_sort', 'Sõbrale või võõrale?', 'Sorteeri fraasid.', [
        ['Sõbrale', ['Hei!', 'Kallistan!', 'Kuidas läheb?', 'Kohtumiseni!']], ['Tuttavale või võõrale', ['Lugupeetud härra Tamm', 'Lugupidamisega', 'Kas te saaksite aidata?', 'Palun vastake.']],
      ], 'full', 'g_use'),
      B.wordforms('074_p_forms', 'Õige vorm.', 'Kirjuta sõna õiges vormis.', [
        ['laupäev', 'Kohtume … (millal?)', 'laupäeval'], ['pühapäev', 'Lükkame kohtumise … (millele?)', 'pühapäevale'], ['kink', 'Aitäh … eest!', 'kingi'], ['õhtusöök', 'Kutsun sind … (millele?)', 'õhtusöögile'], ['meie kodu', 'Tule … (kuhu?)', 'meie koju'], ['sünnipäev', 'Palju õnne …! (milleks?)', 'sünnipäevaks'],
      ]),
      B.gaps('074_p_gaps', 'Sina või teie?', 'Täida sõnum naabrile härra Tammele. Vali teie-vorm.', [
        'Tere, härra Tamm! Kas [teil] on laupäeval aega?', 'Ma [kutsun] teid meile kohvile.', 'Kas te [saaksite] tulla kell neli?', 'Palun [andke] teada, kas sobib.', '[Tervitades], Anna',
      ], ['teil', 'sul', 'kutsun', 'kutsud', 'saaksite', 'saaksid', 'andke', 'anna', 'tervitades', 'kallistan']),
      B.reading('074_p_read', 'Loe vestlust.', 'Loe sõnumeid ja vasta küsimustele.', 'Sofia ja Jaan',
        'Sofia (10.15): Tere, Jaan! Kas sa oled reede õhtul vaba? Meil on kodus väike pidu, sest Viktor kolib Tallinnasse.\nJaan (10.40): Tere! Reedel olen tööl kella seitsmeni. Mis kell pidu algab?\nSofia (10.42): Kell kuus. Aga tule pärast tööd, see sobib.\nJaan (10.45): Hästi! Kas ma pean midagi kaasa võtma?\nSofia (10.50): Kui saad, too leiba või salatit. Me teeme Viktorile ka väikese kingituse. Igaüks paneb viis eurot.\nJaan (11.05): Muidugi! Aitäh kutse eest! Kas aadress on sama?\nSofia (11.07): Ei, me elame nüüd Kase tänav 3. Uksekood on 1234.\nJaan (11.10): Selge. Kohtumiseni!',
        [['Miks Sofia peo teeb?', 'Viktor kolib Tallinnasse|Viktor kolib ära'], ['Miks tuleb Jaan hiljem?', 'ta on tööl kella seitsmeni|ta töötab'], ['Mida võib Jaan kaasa tuua?', 'leiba või salatit'], ['Kui palju raha paneb Jaan kingitusse?', 'viis eurot|5 eurot'], ['Kus Sofia nüüd elab?', 'Kase tänav 3|Kase tänaval'], ['Mitu minutit ootas Sofia Jaani esimest vastust?', '25|kakskümmend viis']]),
      B.transformation('074_p_trans', 'Kirjuta võõrale.', 'Muuda lause teie-vormiks.', [
        ['Kas sa tuled laupäeval?', 'teie', 'Kas te tulete laupäeval?'], ['Palun anna teada!', 'teie', 'Palun andke teada!'], ['Kas sul on aega?', 'teie', 'Kas teil on aega?'], ['Kutsun sind külla.', 'teie', 'Kutsun teid külla.'], ['Aitäh sulle!', 'teie', 'Aitäh teile!'],
      ]),
      B.errorfix('074_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Tere, härra Tamm! Kas sa tuled?', 'Tere, härra Tamm! Kas te tulete?'], ['Ma ootan sinu vastus.', 'Ma ootan sinu vastust.'], ['Palun andke mulle teadma.', 'Palun andke mulle teada.'], ['Ma kutsun teid meie juurde kohvi.', 'Ma kutsun teid meile kohvile.'], ['Vabandust, et ma ei saa tule.', 'Vabandust, et ma ei saa tulla.'],
      ]),
      B.wordorder('074_p_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Kas sa oled reede õhtul vaba?', 'Reedel olen tööl kella seitsmeni.', 'Kui saad, too leiba või salatit.', 'Me elame nüüd Kase tänaval.', 'Aitäh kutse eest, kohtumiseni!',
      ]),
      TR('074_p_tr', ['Ты свободен в пятницу вечером?', 'Приходи после работы.', 'Принеси, пожалуйста, хлеб.', 'Каждый даёт пять евро.', 'Код двери 1234.']),
      D('074_p_dict', ['Kas sa oled reedel vaba?', 'Tule pärast tööd.', 'Palun too leiba.', 'Aitäh kutse eest!', 'Kohtumiseni!']),
      B.planning('074_p_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad.', ['Kellele?', 'Mis on eesmärk?', 'Millal ja kus?', 'Mida sa palud?', 'Kuidas lõpetad?']),
      B.letter('074_p_letter', 'Kutse sõbrale.', 'Kutsu sõber laupäeval matkale. Kirjuta, kus, millal ja mida kaasa võtta.', 'Tere!', 'Kohtumiseni!', [50, 70]),
      B.speaking('074_p_say', 'Häälsõnum.', 'Jäta sõbrale häälsõnum: muuda kohtumise aega.', ['Miks sa ei saa?', 'Mis aeg sobib?', 'Palu vastust.'], [45, 60]),
      B.selfcheck('074_p_self', ['Ma eristan sõbra ja võõra fraase.', 'Ma kirjutan teie-vormis: andke, teil, teid.', 'Ma parandan sõnumi vead.', 'Ma kirjutan 50–70-sõnalise kutse.'], 'Sõnum on saadetud'),
    ],
    transfer: [
      B.text('074_t_situation', 'Uus olukord', 'Sul on väga kiire nädal. Pead kirjutama kolm sõnumit: tänu, aja muutmine ja kutse. Igal sõnumil on erinev adressaat.'),
      B.notice('074_t_cards', 'Sõnumikaardid', [
        'A. Tänu: Sofia kutsus sind eile õhtusöögile. Täna teda.', 'B. Aja muutmine: hambaarst dr Kask, neljapäeval kell 9. Sa ei saa. Küsi uut aega.', 'C. Kutse: sinu sünnipäev, laupäeval kell 18, sinu kodu. Kutsu kolleeg Markust.',
      ], 'full', 'g_read'),
      B.match('074_t_match', 'Mis sobib?', 'Ühenda sõnum ja sobiv lause.', [
        ['A. Sofiale, algus', 'Aitäh imelise õhtu eest!'], ['B. Dr Kasele, algus', 'Kas saaksin uue aja järgmisel nädalal?'], ['C. Markusele, algus', 'Kas sa tuled laupäeval minu sünnipäevale?'], ['A. Sofiale, lõpp', 'Kallistan!'], ['B. Dr Kasele, lõpp', 'Lugupidamisega'], ['C. Markusele, lõpp', 'Kohtumiseni!'],
      ], 'full', 'g_use'),
      B.errorfix('074_t_fix', 'Paranda Viktori sõnumit.', 'Kirjuta lause õigesti.', [
        ['Tere, doktor Kask! Kas sa saad mind aidata?', 'Tere, doktor Kask! Kas te saate mind aidata?'], ['Mul on aeg neljapäev kell üheksa.', 'Mul on aeg neljapäeval kell üheksa.'], ['Kahjuks ma ei saa tulema.', 'Kahjuks ma ei saa tulla.'], ['Kas on võimalik aeg järgmine nädal?', 'Kas on võimalik aeg järgmisel nädalal?'], ['Aitäh teie vastus.', 'Aitäh teie vastuse eest!|Aitäh vastuse eest!'],
      ]),
      B.wordorder('074_t_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Aitäh imelise õhtu eest!', 'Kahjuks ma ei saa neljapäeval tulla.', 'Kas saaksin uue aja järgmisel nädalal?', 'Kutsun sind laupäeval oma sünnipäevale.', 'Palun anna reedeks teada.',
      ]),
      TR('074_t_tr', ['Спасибо за чудесный вечер!', 'К сожалению, в четверг я не могу прийти.', 'Можно ли новое время на следующей неделе?', 'Приглашаю тебя на мой день рождения.', 'С уважением']),
      D('074_t_dict', ['Aitäh toreda õhtu eest!', 'Kahjuks ma ei saa tulla.', 'Kas saaksin uue aja?', 'Kutsun sind sünnipäevale.', 'Lugupidamisega']),
      B.letter('074_t_thanks', 'Sõnum A. Tänu.', 'Täna Sofiat. Kirjuta, mis meeldis, ja kutsu teda enda juurde.', 'Tere, Sofia!', 'Kallistan!', [50, 70]),
      B.letter('074_t_move', 'Sõnum B. Aja muutmine.', 'Kirjuta arstile: ütle põhjus ja küsi uut aega.', 'Tere, doktor Kask!', 'Lugupidamisega', [30, 50]),
      B.writing('074_t_invite', 'Sõnum C. Kutse.', 'Kutsu Markus sünnipäevale. Kirjuta 5–7 lauset: kus, millal, mida kaasa võtta.', [5, 7], ['kutsun', 'laupäeval', 'kell', 'anna teada'], 3),
      B.speaking('074_t_say', 'Häälsõnum Markusele.', 'Sa ei jõua kirjutada. Jäta Markusele häälsõnum kutsega.', ['Kes sa oled ja miks helistad?', 'Kus ja millal on pidu?', 'Mida Markus peab tegema?'], [45, 90]),
      B.rubric('074_t_rubric', 'Kontrolli oma sõnumeid.', 'Märgi, mis on olemas.', ['Igal sõnumil on õige pöördumine.', 'Eesmärk on kohe alguses selge.', 'Kirjas on vajalik info: millal, kus, mida.', 'Arstile kirjutan teie-vormis.', 'Lõpp sobib adressaadile.']),
      B.selfcheck('074_t_self', ['Ma oskan kasutada sõnumi väljendeid: Aitäh … eest!, Palun anna teada.', 'Ma oskan sõnumikaardilt leida, kellele ja mida kirjutada.', 'Ma oskan valida sina- või teie-vormi ja sobiva lõpu.', 'Ma oskan kirjutada kolm sõnumit: tänu, aja muutmine ja kutse.'], 'Kolm sõnumit valmis'),
    ],
  },

  // Kontroll 15 in the Harno A2 exam format (module 15): Avasta = review, Harjuta = reading (tasks 1–5) and
  // listening, Kasuta = writing (information transfer, message) and speaking (getting to know, picture, idea cards)
  'a2-075': {
    title: 'Kontroll 15 — suhted ja viisakus',
    canDo: 'Ma näitan kontrollis, et oskan külalist vastu võtta, viisakalt nõustuda või keelduda ja kirjutada lühikese isikliku sõnumi (vähemalt 70%).',
    discover: [
      B.text('075_d_situation', 'Kordamine: Viktor kolib', 'Viktor kolib Tallinnasse. Enne ärasõitu kutsub ta sõbrad oma koju. Liis tuleb, aga Jaan ei saa tulla. Jaan saadab Viktorile sõnumi.'),
      B.truefalse('075_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Viktor kolib Tartusse.', false], ['Viktor kutsub sõbrad külla.', true], ['Liis ei tule.', false], ['Jaan ei saa tulla.', true], ['Jaan kirjutab Viktorile.', true],
      ]),
      B.reading('075_d_read', 'Loe: Viktori ärasaatmine.', 'Loe tekst ja vasta küsimustele.', 'Viktori ärasaatmine',
        'Reede õhtul tulid Viktori juurde sõbrad. Kõigepealt tuli Liis. Ta tõi kaasa koogi ja kaardi. Viktor ütles: „Tule sisse! Võta istet!” Siis tulid Sofia ja Markus. Viktor pakkus kõigile teed ja võileibu. Markus ei joonud teed, sest talle ei meeldi tee. Ta palus vett. Jaan ei saanud tulla, sest tal oli öövahetus. Ta saatis sõnumi: „Kahjuks ma ei saa täna tulla. Kuidas oleks pühapäeval? Ma tahan sind rongile viia.” Viktor vastas: „Sobib! Rong läheb kell kümme.” Sõbrad rääkisid ja naersid kaua. Kell üksteist ütles Sofia: „Oi, kell on palju. Mul on aeg minna.” Kõik tänasid Viktorit. Liis ütles: „Aitäh kutsumast! Kirjuta meile Tallinnast!” Viktor oli natuke kurb, aga ka õnnelik.',
        [['Mida Liis kaasa tõi?', 'koogi ja kaardi|kooki ja kaarti'], ['Miks jõi Markus vett?', 'talle ei meeldi tee'], ['Miks Jaan ei tulnud?', 'tal oli öövahetus|ta oli tööl'], ['Mida Jaan pakkus?', 'viia Viktor pühapäeval rongile|pühapäeval rongile viia'], ['Kes lahkus esimesena ja mida ta ütles?', 'Sofia, Mul on aeg minna|Sofia'], ['Miks oli Viktor kurb?', 'ta kolib ära|ta lahkub sõprade juurest']]),
      B.table('075_d_find', 'Leia tekstist.', 'Kirjuta tekstist lause.', 'Mida inimene teeb?, Lause tekstist', [
        'võõrustaja kutsub sisse | [Tule sisse!]', 'keeldub põhjusega | [Kahjuks ma ei saa täna tulla./Jaan ei saanud tulla, sest tal oli öövahetus.]', 'pakub teist aega | [Kuidas oleks pühapäeval?]', 'nõustub | [Sobib!]', 'lahkub | [Mul on aeg minna.]', 'tänab | [Aitäh kutsumast!]',
      ], 'g_notice'),
      B.notice('075_d_notice', 'Mooduli kokkuvõte', [
        'Külas: **Tule sisse! Võta istet! Kas soovid teed?** — **Aitäh kutsumast!**', 'Jah / ei: **Hea meelega!** — **Kahjuks ei saa, sest…** — **Kuidas oleks…?**', 'Sõnum: **pöördumine → eesmärk → info → palve → lõpp**', 'Võõrale: **tulge, võtke, andke**; **Aitäh … eest!**',
      ], 'full'),
      B.categorize('075_d_sort', 'Mis olukord?', 'Sorteeri fraasid.', [
        ['Külas', ['Tule sisse!', 'Võta istet!', 'Aitäh kutsumast!']], ['Jah või ei', ['Hea meelega!', 'Kahjuks ei saa.', 'Kuidas oleks reedel?']], ['Sõnum', ['Palun anna teada.', 'Kallistan!', 'Lugupidamisega']],
      ], 'full', 'g_vocab'),
      B.match('075_d_match', 'Mida vastata?', 'Ühenda lause ja vastus.', [
        ['Kas soovid kohvi?', 'Aitäh, ma ei joo kohvi.'], ['Kas tuled laupäeval?', 'Kahjuks ei saa, mul on töö.'], ['Võta veel kooki!', 'Aitäh, rohkem ei jaksa.'], ['Kuidas oleks pühapäeval?', 'Sobib!'], ['Aitäh kutsumast!', 'Aitäh, et tulid!'],
      ], 'full', 'g_use'),
      B.gaps('075_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        'Kas soovid [teed] või kohvi?', 'Aitäh [kutse] eest!', 'Kahjuks ma ei saa [tulla].', 'Laupäev [sobib] mulle.', 'Palun [andke] teada, härra Tamm.', 'Tule meile [külla]!',
      ], ['teed', 'tee', 'kutse', 'kutsest', 'tulla', 'tulema', 'sobib', 'sobi', 'andke', 'anna', 'külla', 'külas']),
      B.transformation('075_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Tule sisse!', 'teie', 'Tulge sisse!'], ['Kas soovid kohvi?', 'teie', 'Kas soovite kohvi?'], ['Ma ei saa tulla. Mul on töö.', 'sest', 'Ma ei saa tulla, sest mul on töö.'], ['Reede ei sobi. Laupäev sobib.', 'aga', 'Reede ei sobi, aga laupäev sobib.'], ['Ma võtan koogi.', 'eitus', 'Ma ei võta kooki.'],
      ]),
      B.errorfix('075_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kas soovid tee?', 'Kas soovid teed?'], ['Ma ei saa tulema.', 'Ma ei saa tulla.'], ['Aitäh kutsest!', 'Aitäh kutse eest!'], ['Mul on aega minna.', 'Mul on aeg minna.'], ['Kuidas oleks pühapäev?', 'Kuidas oleks pühapäeval?'],
      ]),
      B.dialogue('075_d_dialog', 'Jaani sõnum.', 'Täida Jaani ja Viktori vestlus.', 'Jaan', 'Viktor', [
        ['A', '[Kahjuks] ma ei saa täna tulla, [sest] mul on öövahetus.'], ['B', 'Kahju! Aga ma saan aru.'], ['A', 'Aga kuidas [oleks] pühapäeval? Ma viin sind rongile.'],
        ['B', 'Pühapäev [sobib]! Rong läheb kell kümme.'], ['A', 'Hästi. Olen kell üheksa sinu juures.'], ['B', 'Suur [aitäh]! Kohtumiseni!'],
      ]),
      B.wordorder('075_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Liis tõi kaasa koogi ja kaardi.', 'Markus ei joonud teed.', 'Jaan ei saanud tulla, sest tal oli öövahetus.', 'Kuidas oleks pühapäeval?', 'Aitäh kutsumast, kirjuta meile!',
      ]),
      TR('075_d_tr', ['Заходи, садись!', 'Хочешь чаю?', 'К сожалению, я не могу, потому что работаю.', 'Как насчёт воскресенья?', 'Спасибо за приглашение!']),
      D('075_d_dict', ['Tule sisse ja võta istet.', 'Kahjuks ma ei saa tulla.', 'Kuidas oleks pühapäeval?', 'Aitäh kutsumast!', 'Palun anna teada.']),
      B.speaking('075_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele.', ['Kuidas sa külalist vastu võtad?', 'Kuidas sa viisakalt keeldud?', 'Kuidas sa sõnumi lõpetad?'], [60, 120]),
      B.writing('075_d_write', 'Teine põhjus.', 'Kirjuta Jaani sõnum ümber teise põhjusega. 4–6 lauset.', [4, 6], ['kahjuks', 'sest', 'kuidas oleks'], 2),
      B.selfcheck('075_d_self', ['Ma mäletan külaskäigu fraase.', 'Ma keeldun põhjusega ja pakun teist aega.', 'Ma tean sõnumi osi.', 'Ma parandan mooduli tüüpvead.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('075_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 15. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: politeness formulas
      B.choice('075_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Külaline tuleb uksest sisse. Mida ütled?', 'Tere tulemast! Tule sisse!', 'Head aega! Tule jälle!', 'Head isu! Võta veel!'],
        ['Võõrustaja pakub kooki, aga sa oled täis. Mida ütled?', 'Aitäh, aga rohkem ei jaksa.', 'Jah, palun, veel kaks tükki!', 'Ei, see kook ei ole hea.'],
        ['Sõber kutsub kinno, aga sul on trenn. Mida ütled?', 'Kahjuks ei saa, mul on trenn.', 'Hea meelega, ma tulen kohe!', 'Palju õnne, see on tore!'],
        ['Sa lahkud külast. Mida ütled võõrustajale?', 'Aitäh kutsumast! Oli väga tore.', 'Tere tulemast meile!', 'Võta istet ja tunne end hästi.'],
        ['Naaber aitas sul kappi tuua. Mida ütled?', 'Suur aitäh abi eest!', 'Palun, pole tänu väärt!', 'Vabandust, ma ei saanud aru.'],
        ['Sa kirjutad e-kirja koolijuhile. Kuidas lõpetad?', 'Lugupidamisega', 'Kallistan!', 'Musi-musi!'],
      ]),
      // reading 2: three short messages (~60 words each)
      B.reading('075_p_three', 'Lugemine 2. Kolm sõnumit.', 'Loe sõnumeid. Vasta sõnumi tähega (A, B, C) või lühidalt.', 'Kolm sõnumit',
        'A. Tere, Kati! Aitäh eilse õhtu eest! Sinu seenesupp oli väga maitsev. Kas sa saadad mulle retsepti? Järgmine kord tulete teie meile. Mu mees teeb hästi šašlõkki. Kas teile sobiks kahe nädala pärast laupäeval? Andke teada! Kallistan, Olga\n\nB. Tere, Peeter! Kahjuks ma ei saa homme kell kolm tulla. Mu tütar jäi haigeks ja ma pean temaga kodus olema. Kas saaksime kohtumise reedele lükata? Reedel olen vaba kogu päeva. Kui reede ei sobi, helista mulle. Vabandust! Tervitades, Andres\n\nC. Head naabrid! Laupäeval kell kaks on meie hoovis lastepidu. Seal on mängud, muusika ja jäätis. Iga pere võiks tuua ühe koogi või puuvilju. Palun andke teada, mitu last teil tuleb. Kirjutage numbrile 5512 3344. Ootame kõiki! Mari ja Toomas, korter 7',
        [['Kes tänab külaskäigu eest?', 'A|Olga'], ['Kes muudab kohtumise aega?', 'B|Andres'], ['Kes kutsub naabreid?', 'C|Mari ja Toomas'], ['Miks ei saa Andres homme tulla?', 'tütar on haige|tütar jäi haigeks'], ['Mida Olga Katilt palub?', 'retsepti|seenesupi retsepti'], ['Mida võiks iga pere peole tuua?', 'koogi või puuvilju|kooki või puuvilju']]),
      // reading 3: notices matched to what you need
      B.match('075_p_signs', 'Lugemine 3. Kuhu minna?', 'Ühenda soov ja koht.', [
        ['Tahad osta lilli pühapäeva hommikul.', 'Lillepood „Roos”: E–P 8–20'], ['Tahad tellida sünnipäevaks tordi.', 'Kohvik „Mesi”: tordid tellimisel 3 päeva ette'], ['Tahad kinkida sõbrale kinopileti.', 'Kino „Ekraan”: kinkekaardid kassas'],
        ['Tahad minna kümne sõbraga sööma.', 'Restoran „Laud”: üle 8 inimese — broneeri ette!'], ['Tahad saata kutse paberil.', 'Raamatupood: postkaardid ja ümbrikud'], ['Tahad teha lapsele sünnipäevapeo.', 'Mängutuba „Päike”: peod lastele'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text, short answers and 3-option questions
      B.reading('075_p_read', 'Lugemine 4. Külas Eesti peres.', 'Loe tekst. Vasta lühidalt.', 'Külas Eesti peres',
        'Kui eestlane kutsub sind külla, on see hea märk. Eestlased ei kutsu koju väga tihti, aga külalisi võetakse vastu soojalt. Tavaliselt lepitakse aeg kokku mõni päev ette. Ilma kutseta ei ole viisakas külla minna. Kaasa võiks võtta väikese kingituse: lilled, šokolaadi või veini. Lilli peaks olema paaritu arv, näiteks kolm või viis. Esikus võetakse kingad jalast. Paljudes kodudes antakse külalisele sussid. Laual on tavaliselt kohv või tee ja kook. Kui pakutakse süüa, on viisakas vähemalt natuke proovida. Kui sa rohkem ei taha, ütle lihtsalt aitäh. Eestlased ei räägi külas väga valjusti. Külaskäik ei kesta tavaliselt kaua, umbes kaks-kolm tundi. Lahkudes tänatakse võõrustajat. Järgmisel päeval võib saata ka lühikese tänusõnumi. Nii näitad, et sulle meeldis.',
        [['Mida võtab külaline esikus ära?', 'kingad|kingad jalast'], ['Kui kaua kestab külaskäik tavaliselt?', 'kaks-kolm tundi|2–3 tundi|umbes kaks-kolm tundi'], ['Mida võib saata järgmisel päeval?', 'tänusõnumi|lühikese tänusõnumi']]),
      B.choice('075_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Millal lepitakse külaskäigu aeg kokku?', 'mõni päev ette', 'samal päeval', 'kuu aega ette'],
        ['Mitu lille võiks kinkida?', 'viis', 'neli', 'kuus'],
        ['Mida antakse külalisele paljudes kodudes?', 'sussid', 'kingad', 'lilled'],
        ['Mida on viisakas teha, kui pakutakse süüa?', 'natuke proovida', 'kohe ära minna', 'öelda, et ei taha'],
        ['Kuidas eestlased külas räägivad?', 'mitte väga valjusti', 'väga valjusti', 'ainult inglise keeles'],
      ]),
      // reading 5: a personal letter with 8 option gaps
      B.cloze('075_p_cloze', 'Lugemine 5. Kiri sõbrannale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Ira!', [
        'Aitäh {*kutse|kutsest|kutsuma} eest! Ma tulen sinu sünnipäevale {*hea|head|heal} meelega. Kahjuks ma ei {*saa|saan|saanud} tulla kell viis, sest ma töötan kella kuueni.',
        '',
        'Kas {*sobib|sobi|sobivad}, kui ma tulen natuke hiljem, umbes seitsmeks? Ma võtan kaasa {*koogi|kook|koogiga}. Mu mees ei saa tulla, sest ta on {*Soomes|Soome|Soomest} tööl. Ta saadab sulle palju tervisi.',
        '',
        'Kas ma pean veel midagi {*tooma|tuua|toon}? Palun anna mulle {*teada|teadma|tean}!',
        '',
        'Kallistan, Jelena',
      ]),
      // listening 3 of the A2 exam: a voice message, answers of 1–2 words
      B.listening('075_p_listen', 'Kuulamine 1. Markuse häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Liis! Siin Markus. Meie peo kohta on paar asja.',
        'Pidu algab laupäeval kell seitse, mitte kell kuus.',
        'Me elame Kuuse tänav viisteist, korter kaksteist.',
        'Maja uks on lukus. Uksekood on kolm-viis-üks-üks.',
        'Me oleme neljandal korrusel. Lifti kahjuks ei ole.',
        'Kaasa ei pea midagi tooma. Aga kui tahad, võta salatit.',
        'Auto võid parkida maja taha. Seal on tasuta parkla.',
        'Kui sa ei leia maja, helista mulle. Näeme laupäeval!',
      ], ['Pidu algab kell [seitse|7|19].', 'Markus elab Kuuse tänav [viisteist|15].', 'Uksekood on [3511|kolm viis üks üks].', 'Korter on [neljandal] korrusel.', 'Kaasa võib võtta [salatit|salati].', 'Auto saab parkida maja [taha|taga].']),
      // a phone conversation (A2 listening 2 and 4), answers of 1–2 words
      B.listening('075_p_listen2', 'Kuulamine 2. Kutse matkale.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Sofia! Jaan siin.', '— Tere, Jaan! Kuidas läheb?', '— Hästi. Kuule, kas tuled pühapäeval meiega matkale? Läheme Soomaale.',
        '— Oi, kui tore! Aga kahjuks pühapäeval ma ei saa. Mu vanemad tulevad külla.', '— Kahju. Aga kuidas oleks järgmisel laupäeval?',
        '— Laupäev sobib. Mis kell te lähete?', '— Hommikul kell kaheksa. Me sõidame minu autoga.', '— Kas ma pean midagi kaasa võtma?',
        '— Võta kaasa vihmajope ja kummikud. Söögi teeb Liis.', '— Selge. Aitäh kutse eest!', '— Pole tänu väärt. Ma saadan sulle reedel sõnumi.',
      ], ['Jaan kutsub Sofiat [matkale].', 'Pühapäeval tulevad Sofiale külla [vanemad|tema vanemad].', 'Matk on järgmisel [laupäeval|laupäev].', 'Nad lähevad kell [kaheksa|8].', 'Kaasa tuleb võtta vihmajope ja [kummikud].', 'Süüa teeb [Liis].']),
      B.gaps('075_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kas soovite [kohvi] (kohv)?', 'Aitäh [kingituse] (kingitus) eest!', 'Ma ei saa [tulla] (tulema).', 'Palun [tulge] (tulema, teie) sisse!', 'Me läheme laupäeval [Annale] (Anna) külla.', 'Aitäh, ma ei võta [kooki] (kook).',
      ]),
      B.errorfix('075_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Aitäh kutsumise!', 'Aitäh kutsumast!|Aitäh kutsumise eest!'], ['Kas soovid tee?', 'Kas soovid teed?'], ['Ma ei saa tulema.', 'Ma ei saa tulla.'], ['Mul on aega minna.', 'Mul on aeg minna.'], ['Tere, härra Tamm! Kas sa tuled?', 'Tere, härra Tamm! Kas te tulete?'],
      ]),
      B.transformation('075_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Võta istet!', 'teie', 'Võtke istet!'], ['Ma ei tule. Mul on trenn.', 'sest', 'Ma ei tule, sest mul on trenn.'], ['Aitäh, et sa aitasid!', 'eest', 'Aitäh abi eest!'], ['Ma joon kohvi.', 'eitus', 'Ma ei joo kohvi.'], ['Kas sa tuled?', 'teie', 'Kas te tulete?'],
      ]),
      B.wordorder('075_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', [
        'Kahjuks ma ei saa pühapäeval tulla.', 'Mu vanemad tulevad külla.', 'Aga kuidas oleks järgmisel laupäeval?', 'Võta kaasa vihmajope ja kummikud.', 'Aitäh kutse eest!',
      ]),
      B.speaking('075_p_say', 'Räägi kuuldust.', 'Räägi paarilisele, kuidas Jaan ja Sofia kokku leppisid.', ['Kuhu Jaan Sofia kutsus?', 'Miks Sofia pühapäeval ei saanud?', 'Mis on uus aeg?', 'Mida peab kaasa võtma?'], [45, 90], ['Jaan kutsus…', 'Sofia ei saanud, sest…', 'Nad lähevad…']),
      B.selfcheck('075_p_self', ['Lugemine: valin olukorda sobiva viisaka lause.', 'Lugemine: leian sõnumist, sildilt ja tekstist vajaliku info.', 'Lugemine: valin kirja lünka õige vormi.', 'Kuulamine: kirjutan vastuse 1–2 sõnaga.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('075_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('075_t_card', 'Visiitkaart', ['Kohvik „Kodu” — peod ja sünnipäevad', 'Ruum kuni 20 külalisele, kook ja kohv hinnas', 'Aadress: Rüütli 8, Tartu', 'Avatud: teisipäevast pühapäevani 10–22', 'Broneerimine: telefon 5678 1234'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('075_t_info', 'Kirjutamine 1. Soovita kohvikut.', 'Sõber otsib kohta sünnipäevapeoks. Kirjuta: mis koht, kus, millal avatud, kuidas broneerida.', 'Tere, Maria!', 'Head pidu!', [25, 40]),
      B.planning('075_t_plan', 'Enne sõnumit.', 'Mõtle läbi ja kirjuta märksõnad.', ['Miks sa ei saa sünnipäevale tulla?', 'Mida sa sõbrale soovid?', 'Millist teist aega sa pakud?', 'Kuidas sa lõpetad?']),
      // writing 2: a message, at least 30 words
      B.letter('075_t_letter', 'Kirjutamine 2. Sõnum sõbrale.', 'Sa ei saa sõbra sünnipäevale minna. Vabanda, ütle põhjus, paku teist aega.', 'Tere, Kati!', 'Kallistan!', [30, 50]),
      B.writing('075_t_text', 'Kirjutamine 2 (teine valik). Minu viimane külaskäik.', 'Kirjuta 4–6 lauset: kellele läksid, mida tõid, mida tegite.', [4, 6], ['külla', 'kingitus', 'aitäh'], 2),
      B.table('075_t_form', 'Peo broneerimine.', 'Täida kohviku broneerimisvorm.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Telefon | ', 'Peo kuupäev ja kellaaeg | ', 'Mitu külalist tuleb? | ', 'Mida te soovite süüa ja juua? | ']),
      // speaking: getting to know, picture description (task 1), idea cards (task 2)
      B.speaking('075_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad ja kellega?', 'Kellele sa tihti külla lähed?', 'Kes sulle viimati külla tuli?'], [45, 60]),
      B.speaking('075_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: külaskäik, sünnipäev või pidu. Kirjelda üks minut.', ['Kes on pildil?', 'Kus nad on?', 'Mida nad teevad?', 'Mida nad söövad või joovad?'], [60, 90], ['Pildil on…', 'Vasakul / paremal…', 'Nad…']),
      B.speaking('075_t_compare', 'Rääkimine 1. Võrdle pilte.', 'Võrdle oma pilti paarilise pildiga. Vasta õpetaja küsimustele.', ['Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kumb pidu meeldib sulle rohkem?', 'Miks?'], [60, 90]),
      B.rolecards('075_t_s1', 'Rääkimine 2. Ideekaart „Külaskäik”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: kellele, kui tihti, kingitus, toit, kui kaua.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Kellele sa külla lähed?', 'Mida sa kaasa viid?', 'Mida sulle pakutakse?'], ['Ma lähen tihti…', 'Ma viin kaasa…', 'Tavaliselt pakutakse…']),
      B.rolecards('075_t_s2', 'Rääkimine 2. Ideekaart „Kutse”.', 'B kutsub, A keeldub ja pakub teist aega. Siis vahetage.',
        'Sa ei saa kutsutud ajal. Ütle põhjus ja paku teist aega.', 'Kutsu paarilist: kino, sünnipäev või matk. Ütle aeg ja koht.',
        ['Kahjuks ma ei saa, sest…', 'Aga kuidas oleks…?', 'Aitäh kutse eest!'], ['Kas sa tuled…?', 'Pidu algab kell…', 'Sobib!']),
      B.rubric('075_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Suhtlus on viisakas: pöördumine, tänu, sobiv lõpp, sina / teie.', 'Keel on arusaadav: laused on seotud (ja, aga, sest), vead ei sega.', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 30–50 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('075_t_self', ['Ma oskan kasutada mooduli väljendeid ilma sõnaraamatuta.', 'Ma oskan visiitkaardilt leida koha, aja ja kontakti.', 'Ma oskan kirjutada keeldumise põhjuse ja teise ajaga: ei saa, sest…; kuidas oleks…?', 'Ma oskan pilti kirjeldada ja ideekaardi järgi küsida ning vastata.'], 'Moodul 15 on tehtud'),
    ],
  },
};
