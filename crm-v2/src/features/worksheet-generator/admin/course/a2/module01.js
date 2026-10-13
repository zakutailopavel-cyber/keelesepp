// A2 course (A1 → A2 roadmap), module 1 „A2 lähtepunkt ja eneseinfo”, lessons a2-001 … a2-005 (owner 2026-10-13: the
// old generated sheets had five short tasks each). Personal information and getting to know people: olema and the
// frequent verbs in the present (ma olen / ei ole, elan, töötan, õpin, räägin), questions (Mis su nimi on? Kust sa
// pärit oled? Kus sa elad?), numbers, dates, e-mail and the form. Harno A2 formats from the first module: a short
// listening with 1–2-word answers (read twice), a notice to read, a form, a message of 30–50 words, getting to know
// the examiner.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-01', course: 'a2', title: 'A2 lähtepunkt ja eneseinfo', level: 'A2' };

export const LESSONS = {
  'a2-001': {
    title: 'A2 lähtediagnostika',
    canDo: 'Ma räägin endast 5–6 lausega (nimi, vanus, kust ma pärit olen, kus elan, mis keeli räägin, mida teen) ja kirjutan endast 40–60-sõnalise teksti.',
    discover: [
      B.text('001_d_situation', 'Esimene tund', 'Täna algab eesti keele kursus. Klassis on kuus inimest. Õpetaja Kadri ütleb: „Tere tulemast! Palun rääkige natuke endast.” Olga alustab. Ta on natuke närvis, aga ta räägib aeglaselt ja selgelt.'),
      B.profiles('001_d_cards', 'Kes on kursusel?', 'Loe kaarte. Kirjuta lünka sobiv sõna.', [
        ['Olga', ['34 aastat vana', 'pärit Narvast', 'elab Tallinnas', 'raamatupidaja', 'räägib vene ja inglise keelt'], ['Olga [on] 34 aastat vana.', 'Ta on pärit [Narvast].', 'Ta [elab] Tallinnas.']],
        ['Markus', ['29 aastat vana', 'pärit Ukrainast', 'elab Tartus', 'programmeerija', 'räägib ukraina ja inglise keelt'], ['Markus on pärit [Ukrainast].', 'Ta elab [Tartus].', 'Ta [töötab] programmeerijana.']],
        ['Liis', ['22 aastat vana', 'pärit Lätist', 'elab Tallinnas', 'üliõpilane', 'räägib läti ja vene keelt'], ['Liis on [22] aastat vana.', 'Ta [õpib] ülikoolis.', 'Ta räägib läti ja vene [keelt].']],
      ]),
      B.vocab('001_d_vocab', 'Minu põhiinfo', ['nimi — имя', 'vanus — возраст', 'elukoht — место жительства', 'amet — профессия', 'keel — язык', 'kuupäev — дата', 'sündima — родиться', 'pärit olema — быть родом', 'kuulutus — объявление', 'küsimus — вопрос', 'aastat vana — лет (возраст)', 'emakeel — родной язык']),
      B.reading('001_d_read', 'Loe: Olga räägib endast.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Tere, mina olen Olga',
        'Tere! Minu nimi on Olga Ivanova. Ma olen 34 aastat vana. Ma olen pärit Narvast, aga praegu ma elan Tallinnas, Lasnamäel. Ma elan seal koos abikaasa ja pojaga. Minu poeg on kaheksa aastat vana ja ta käib eesti koolis. Ma töötan raamatupidajana väikeses firmas. Tööl räägin ma vene ja inglise keelt, aga minu kolleegid on eestlased. Seepärast ma õpin eesti keelt. Ma saan juba natuke aru, aga ma räägin veel aeglaselt. Minu emakeel on vene keel. Vabal ajal ma loen raamatuid ja käin pojaga ujumas. Laupäeviti käime me ka Narvas minu ema juures. Minu sünnipäev on kaheteistkümnendal mail. Ma tahan aasta pärast rääkida kolleegidega ainult eesti keeles. Siis ma tahan õppida ka ülikoolis. Minu abikaasa räägib eesti keelt hästi, ta aitab mind kodus. Õhtul me vaatame koos eesti filme.',
        [['Kust Olga pärit on?', 'Narvast|ta on pärit Narvast'], ['Kus Olga praegu elab?', 'Tallinnas|Lasnamäel|Tallinnas, Lasnamäel'], ['Kui vana on Olga poeg?', 'kaheksa aastat|8 aastat|kaheksa'], ['Kus Olga töötab?', 'väikeses firmas|firmas|ta töötab raamatupidajana'], ['Miks Olga õpib eesti keelt?', 'kolleegid on eestlased|sest tema kolleegid on eestlased'], ['Millal on Olga sünnipäev?', '12. mail|kaheteistkümnendal mail']]),
      B.truefalse('001_d_tf', 'Õige või vale?', 'Loe Olga teksti uuesti.', [
        ['Olga elab Narvas.', false], ['Olga emakeel on vene keel.', true], ['Olga poeg käib vene koolis.', false],
        ['Olga räägib veel aeglaselt.', true], ['Olga töötab õpetajana.', false],
      ]),
      B.notice('001_d_notice', 'Märka: olema', ['ma **olen** — ma **ei ole**', 'sa **oled** — sa **ei ole**', 'ta **on** — ta **ei ole**', 'me **oleme**, te **olete**, nad **on**', 'Ma **olen pärit** Narva**st**. (kust? → -st)', 'Ma **olen** 34 **aastat vana**.']),
      B.wordforms('001_d_forms', 'olema', 'Kirjuta olema õiges vormis.', [
        ['ma', 'olema', 'olen'], ['sa', 'olema', 'oled'], ['ta', 'olema', 'on'], ['me', 'olema', 'oleme'],
        ['te', 'olema', 'olete'], ['nad', 'olema', 'on'], ['ma (eitus)', 'olema', 'ei ole'],
      ]),
      B.match('001_d_match', 'Küsimus ja vastus', 'Ühenda küsimus ja vastus.', [
        ['Mis su nimi on?', 'Minu nimi on Olga.'], ['Kui vana sa oled?', 'Ma olen 34 aastat vana.'], ['Kust sa pärit oled?', 'Ma olen pärit Narvast.'],
        ['Kus sa elad?', 'Ma elan Tallinnas.'], ['Mis keeli sa räägid?', 'Ma räägin vene ja inglise keelt.'], ['Mida sa teed?', 'Ma töötan raamatupidajana.'],
      ]),
      B.gaps('001_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Minu [nimi] on Markus.', 'Ma olen [pärit] Ukrainast.', 'Ma [elan] Tartus.', 'Ma [töötan] programmeerijana.', 'Minu [emakeel] on ukraina keel.', 'Ma [räägin] ka inglise keelt.',
      ], ['nimi', 'pärit', 'elan', 'töötan', 'emakeel', 'räägin', 'vana', 'keelt']),
      B.wordorder('001_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma olen pärit Narvast.', 'Minu poeg käib eesti koolis.', 'Ma õpin eesti keelt.', 'Vabal ajal ma loen raamatuid.', 'Ma räägin veel aeglaselt.']),
      B.errorfix('001_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma olen pärit Narva.', 'Ma olen pärit Narvast.'], ['Ma elan Tallinn.', 'Ma elan Tallinnas.'], ['Ta olen raamatupidaja.', 'Ta on raamatupidaja.'],
        ['Minu nimi olen Olga.', 'Minu nimi on Olga.'], ['Ma räägin vene keel.', 'Ma räägin vene keelt.'], ['Me on pärit Lätist.', 'Me oleme pärit Lätist.'],
      ]),
      B.translation('001_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мне 30 лет.', 'Я из Тарту.', 'Я живу в Таллине.', 'Мой родной язык — русский.', 'Я работаю в фирме.']),
      B.speaking('001_d_say', 'Räägi endast.', 'Tutvusta ennast paarilisele. Räägi umbes üks minut.', [
        'Mis su nimi on?', 'Kust sa pärit oled ja kus sa elad?', 'Mida sa teed (töö või kool)?', 'Mis keeli sa räägid?', 'Miks sa õpid eesti keelt?',
      ], [45, 90], ['Minu nimi on…', 'Ma olen pärit …-st.', 'Ma elan …-s.', 'Ma räägin … keelt.']),
      B.writing('001_d_write', 'Mina', 'Kirjuta endast 5–7 lauset (40–60 sõna).', [5, 7], ['nimi', 'pärit', 'elan', 'räägin', 'õpin'], 3),
      B.selfcheck('001_d_self', ['Ma ütlen oma nime, vanuse ja kust ma pärit olen.', 'Ma tean olema vorme: olen, oled, on.', 'Ma saan aru lühikesest tekstist inimese kohta.', 'Ma kirjutan endast 40–60 sõna.'], 'Põhiinfo on käes'),
    ],
    practice: [
      B.tip('001_p_how', 'Lähtediagnostika', 'See leht näitab, mida sa juba oskad. Tee kõik ise, ilma abita. Kui sa ei tea, jäta lünk tühjaks: õpetaja näeb, mida harjutada.', 'full'),
      B.choice('001_p_polite', 'Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa tuled hommikul tundi. Mida sa ütled?', 'Tere hommikust!', 'Head ööd!', 'Head isu!'],
        ['Sa ei saa õpetajast aru. Mida sa ütled?', 'Palun korrake!', 'Palun võtke!', 'Pole viga!'],
        ['Sa lähed koju. Mida sa ütled?', 'Nägemist!', 'Tere tulemast!', 'Jõudu!'],
        ['Sõber annab sulle kohvi. Mida sa ütled?', 'Aitäh!', 'Vabandust!', 'Terviseks!'],
        ['Sa tuled tundi hiljem. Mida sa ütled?', 'Vabandust, et ma hilinen!', 'Meeldiv tutvuda!', 'Palun väga!'],
      ], 'full', 'g_use'),
      B.reading('001_p_ad', 'Lugemine. Kuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Eesti keele kursus algajatele',
        'Keelekool Sõna kutsub eesti keele kursusele! Kursus on täiskasvanutele, kes oskavad juba natuke eesti keelt. Kursus algab 15. septembril. Tunnid on esmaspäeviti ja kolmapäeviti kell 18.00–19.30. Kursus kestab kümme nädalat. Grupis on kuni kaksteist inimest. Hind on 180 eurot, õpik on hinna sees. Kursus toimub Tallinnas, Narva maanteel 7, teisel korrusel. Enne kursust on lühike test, et teada, mida sa juba oskad. Tundides räägime, loeme, kuulame ja kirjutame. Kursuse lõpus saad tunnistuse. Registreeri kuni 10. septembrini telefonil 5123 4567 või e-postiga info@keelekoolsona.ee.',
        [['Millal kursus algab?', '15. septembril|viieteistkümnendal septembril'], ['Mis päevadel on tunnid?', 'esmaspäeviti ja kolmapäeviti|esmaspäeval ja kolmapäeval'], ['Kui kaua kursus kestab?', 'kümme nädalat|10 nädalat'], ['Kui palju kursus maksab?', '180 eurot|sada kaheksakümmend eurot'], ['Kuidas saab registreerida?', 'telefonil või e-postiga|telefoni või e-postiga|telefonil|e-postiga']]),
      B.listening('001_p_listen', 'Kuulamine. Uus kursuslane.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Minu nimi on Jaan Kask.', 'Ma olen kakskümmend kuus aastat vana.', 'Ma olen pärit Pärnust, aga praegu ma elan Tallinnas.',
        'Ma töötan hotellis administraatorina.', 'Minu emakeel on eesti keel, aga ma räägin ka soome ja inglise keelt.',
        'Vabal ajal ma mängin korvpalli.', 'Minu telefoninumber on viis kaks, kolm neli, viis kuus, seitse kaheksa.',
      ], [
        'Jaan on [26|kakskümmend kuus] aastat vana.', 'Ta on pärit [Pärnust].', 'Praegu elab ta [Tallinnas].', 'Ta töötab [hotellis].',
        'Ta räägib ka soome ja [inglise] keelt.', 'Vabal ajal mängib ta [korvpalli].',
      ]),
      B.gaps('001_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Mina [olen] Liis. (olema)', 'Sa [oled] minu uus kolleeg. (olema)', 'Me [oleme] pärit Lätist. (olema)', 'Nad [elavad] Tartus. (elama)',
        'Ma [ei ole] õpetaja, ma olen üliõpilane. (olema, eitus)', 'Kas te [räägite] vene keelt? (rääkima)',
      ]),
      B.transformation('001_p_question', 'Küsi.', 'Kirjuta küsimus. Vastus on antud.', [
        ['Minu nimi on Liis.', 'Mis …?', 'Mis su nimi on?|Mis sinu nimi on?|Mis teie nimi on?'], ['Ma olen pärit Lätist.', 'Kust …?', 'Kust sa pärit oled?|Kust te pärit olete?|Kust sa oled pärit?'],
        ['Ma elan Tallinnas.', 'Kus …?', 'Kus sa elad?|Kus te elate?'], ['Ma olen 22 aastat vana.', 'Kui …?', 'Kui vana sa oled?|Kui vana te olete?'],
        ['Ma räägin läti ja vene keelt.', 'Mis keeli …?', 'Mis keeli sa räägid?|Mis keeli te räägite?'],
      ]),
      B.errorfix('001_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma on pärit Narvast.', 'Ma olen pärit Narvast.'], ['Ta olen 30 aastat vana.', 'Ta on 30 aastat vana.'], ['Ma olen pärit Narva.', 'Ma olen pärit Narvast.'],
        ['Ma elan Tallinn.', 'Ma elan Tallinnas.'], ['Ma ei olen õpetaja.', 'Ma ei ole õpetaja.'],
        ['Ta räägivad soome keelt.', 'Ta räägib soome keelt.'], ['Kus sa elab?', 'Kus sa elad?'],
      ]),
      B.wordorder('001_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kursus algab viieteistkümnendal septembril.', 'Tunnid on esmaspäeviti ja kolmapäeviti.', 'Grupis on kuni kaksteist inimest.', 'Enne kursust on lühike test.', 'Ma tahan registreerida kursusele.']),
      B.match('001_p_numbers', 'Numbrid sõnadega.', 'Ühenda number ja sõna.', [
        ['12', 'kaksteist'], ['15.', 'viieteistkümnes'], ['34', 'kolmkümmend neli'], ['180', 'sada kaheksakümmend'], ['26', 'kakskümmend kuus'], ['10', 'kümme'],
      ], 'full', 'g_vocab'),
      B.dictation('001_p_dict', 'Etteütlus. Numbrid ja kuupäevad.', 'Kuula ja kirjuta laused numbritega.', ['Ma olen 34 aastat vana.', 'Kursus algab 15. septembril.', 'Minu telefon on 5123 4567.', 'Tund algab kell 18.00.', 'Minu sünnipäev on 12. mail.'], 6),
      B.translation('001_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Меня зовут Анна.', 'Я из Нарвы.', 'Я живу в Таллине.', 'Я говорю по-русски и по-английски.', 'Я учу эстонский язык.', 'Мне 26 лет.', 'Курс начинается в понедельник.']),
      B.speaking('001_p_say', 'Tutvumine nagu eksamil.', 'Õpetaja küsib, sina vastad täislausega.', ['Mis teie nimi on?', 'Kust te pärit olete?', 'Kus te elate ja kellega?', 'Mida te teete?', 'Mida te vabal ajal teete?'], [45, 75]),
      B.writing('001_p_write', 'Kiri õpetajale.', 'Kirjuta õpetajale 4–6 lauset: kes sa oled ja mida tahad õppida.', [4, 6], ['olen', 'oskan', 'tahan', 'õppida'], 2),
      B.selfcheck('001_p_self', ['Ma saan aru kuulutusest: aeg, koht, hind.', 'Ma kuulen ja kirjutan nime, vanuse ja linna.', 'Ma küsin: Mis su nimi on? Kust sa pärit oled?', 'Ma kirjutan numbrid ja kuupäevad.'], 'Tean, mida harjutada'),
    ],
    transfer: [
      B.text('001_t_situation', 'Uus olukord', 'Sa tahad minna keelekooli kursusele. Enne kursust tuleb täita registreerimisvorm ja kirjutada õpetajale lühike kiri. Esimeses tunnis tutvustad ennast grupile.'),
      B.reading('001_t_school', 'Loe keelekooli kirja.', 'Loe kirja ja vasta küsimustele.', 'Tere tulemast keelekooli!',
        'Tere! Aitäh, et registreerisite meie kursusele. Teie grupp on A2-1. Esimene tund on esmaspäeval, 15. septembril kell 18.00, ruumis 204. Teie õpetaja on Kadri Mets. Palun võtke kaasa pass või ID-kaart, vihik ja pastakas. Enne esimest tundi täitke palun registreerimisvorm ja kirjutage õpetajale lühike kiri endast. Kirjutage, kust te pärit olete, kus te töötate ja miks te õpite eesti keelt. Esimeses tunnis tutvustab iga kursuslane ennast grupile. Pärast tundi on kohvipaus, kus saate rääkida teiste kursuslastega. Kui teil on küsimusi, helistage meile. Kohtumiseni! Keelekool Sõna',
        [['Mis grupis sa õpid?', 'A2-1'], ['Millal on esimene tund?', 'esmaspäeval kell 18.00|15. septembril kell 18.00|esmaspäeval, 15. septembril'], ['Mis ruumis on tund?', '204|ruumis 204'], ['Mida pead kaasa võtma?', 'pass või ID-kaart, vihik ja pastakas|passi, vihiku ja pastaka'], ['Mida pead kirjutama õpetajale?', 'lühikese kirja endast|kirja endast']]),
      B.table('001_t_form', 'Registreerimisvorm.', 'Täida vorm oma andmetega.', 'Andmed, Sinu vastus', ['Eesnimi | ', 'Perekonnanimi | ', 'Vanus | ', 'Kust pärit? | ', 'Elukoht (linn) | ', 'Emakeel | ', 'Mis keeli räägid? | ', 'Telefon | ']),
      B.planning('001_t_plan', 'Enne kirjutamist.', 'Mõtle läbi, mida kirjutad õpetajale.', ['Kes sa oled? (nimi, vanus, kust pärit)', 'Mida sa teed? (töö, kool)', 'Miks sa õpid eesti keelt?', 'Mida sa tahad kursusel õppida?'], 2),
      B.letter('001_t_letter', 'Kiri õpetajale.', 'Kirjuta õpetajale 40–60 sõna: tutvusta ennast ja ütle, miks sa õpid eesti keelt.', 'Tere, õpetaja!', 'Lugupidamisega', [40, 60]),
      B.speaking('001_t_intro', 'Esimene tund.', 'Tutvusta ennast grupile. Räägi umbes üks minut.', ['Mis su nimi on ja kust sa pärit oled?', 'Kus sa elad?', 'Mida sa teed?', 'Mis keeli sa räägid?', 'Miks sa õpid eesti keelt?'], [45, 90], ['Tere! Minu nimi on…', 'Ma olen pärit…', 'Ma õpin eesti keelt, sest…']),
      B.rolecards('001_t_roles', 'Paus kursusel.', 'Kohvipausil tutvute uue kursuslasega. Küsige ja vastake.', 'Oled uus kursuslane. Tutvusta ennast ja küsi teise inimese kohta: nimi, kust pärit, kus elab, mida teeb.', 'Oled kursusel juba teist nädalat. Vasta küsimustele ja küsi vastu.', ['Tere! Mina olen…', 'Kust sa pärit oled?', 'Mida sa teed?'], ['Meeldiv tutvuda!', 'Mina olen pärit…', 'Aga sina?']),
      B.writing('001_t_group', 'Sõnum grupile.', 'Kirjuta grupi vestlusesse 4–6 lauset: tervita, tutvusta ennast, küsi üks küsimus.', [4, 6], ['tere', 'olen', 'elan', 'kas'], 2),
      B.translation('001_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ваш новый студент.', 'Я учу эстонский, потому что живу в Эстонии.', 'Я работаю в магазине.', 'До встречи в понедельник!', 'Можно вопрос?']),
      B.rubric('001_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Vorm on täidetud: kõik andmed on olemas ja loetavad.', 'Kirjas on tervitus, info endast ja lõpp.', 'Laused on arusaadavad, olema ja tegusõnad on õiges vormis.', 'Suuline tutvustus: vähemalt viis lauset.']),
      B.selfcheck('001_t_self', ['Ma täidan registreerimisvormi.', 'Ma kirjutan õpetajale lühikese kirja endast.', 'Ma tutvustan ennast grupile.', 'Ma küsin teise inimese kohta.'], 'Valmis kursuseks'),
    ],
  },

  'a2-002': {
    title: 'Tutvumine ja viisakus',
    canDo: 'Ma tutvun uue inimesega 6–8 repliigiga dialoogis: tervitan, tutvustan ennast, küsin ja vastan, palun korrata ja jätan viisakalt hüvasti.',
    discover: [
      B.text('002_d_situation', 'Uus naaber', 'Laupäeva hommikul viib Markus prügi välja. Trepikojas kohtab ta uut naabrit. Naaber on noor naine, tal on käes suur kast. Markus tahab tutvuda, aga ta ei tea, kas öelda „sina” või „teie”.'),
      B.dialogue('002_d_dialog', 'Trepikojas.', 'Loe dialoogi. Täida lüngad.', 'Markus', 'Sofia', [
        ['A', 'Tere [hommikust]! Kas te olete uus naaber?'], ['B', 'Tere! Jah, ma kolisin eile. Minu [nimi] on Sofia.'], ['A', 'Väga [meeldiv]! Mina olen Markus. Ma elan korteris number viis.'],
        ['B', 'Vabandust, ma ei saanud [aru]. Palun korrake aeglaselt.'], ['A', 'Ma elan korteris number viis. Kas ma saan [aidata]? Kast on raske.'],
        ['B', 'Aitäh, väga lahke! Kas me võime öelda [sina]?'], ['A', 'Muidugi! Kust sa pärit oled?'], ['B', 'Ma olen pärit Ukrainast, Lvivist.'], ['A', 'Tore! Head [päeva] ja tere tulemast!'],
      ]),
      B.vocab('002_d_vocab', 'Tutvumine ja viisakus', ['tutvuma — знакомиться', 'tervitama — здороваться', 'palun — пожалуйста', 'aitäh — спасибо', 'vabandust — извините', 'meeldiv — приятно', 'nägemiseni — до свидания', 'kordama — повторять', 'aru saama — понимать', 'aeglaselt — медленно', 'sõber — друг', 'kolleeg — коллега']),
      B.notice('002_d_notice', 'Märka: sina või teie?', ['Sõbrale, lapsele, kolleegile: **sina** — Kust **sa** pärit **oled**?', 'Võõrale, vanemale inimesele: **teie** — Kust **te** pärit **olete**?', 'Ma ei saa aru: **Palun korrake!** **Palun rääkige aeglasemalt!**', 'Hüvastijätt: **Nägemist! Nägemiseni! Head päeva!**']),
      B.reading('002_d_read', 'Loe: Sofia kiri sõbrannale.', 'Loe kirja ja vasta küsimustele.', 'Uus kodu, uued naabrid',
        'Tere, Ira! Ma elan nüüd Tartus. Eile ma kolisin uude korterisse. Kast oli väga raske, aga naaber Markus aitas mind. Markus on väga viisakas. Ta küsis kõigepealt, kas ta võib öelda sina. Me rääkisime eesti keeles. Ma ei saanud kõigest aru ja ütlesin: „Palun korrake aeglaselt.” Markus kordas ja naeratas. Teisel korrusel elab vanem proua. Temaga ma räägin teie-vormis: „Tere päevast! Kuidas teil läheb?” Ta vastas: „Aitäh, hästi! Tere tulemast meie majja!” Täna ma küpsetan kooki ja viin naabritele. Kirjuta mulle, kuidas sul läheb! Sofia',
        [['Kes aitas Sofiat?', 'Markus|naaber Markus'], ['Mida Markus kõigepealt küsis?', 'kas ta võib öelda sina|kas võib öelda sina'], ['Mida Sofia ütles, kui ta ei saanud aru?', 'Palun korrake aeglaselt'], ['Kuidas Sofia räägib vanema prouaga?', 'teie-vormis|teie'], ['Mida Sofia täna teeb?', 'küpsetab kooki|ta küpsetab kooki ja viib naabritele']]),
      B.categorize('002_d_sort', 'Millal me seda ütleme?', 'Pane väljendid õigesse rühma.', [
        ['Tervitus', ['Tere!', 'Tere hommikust!', 'Tervist!']], ['Tänu', ['Aitäh!', 'Suur tänu!', 'Tänan!']], ['Vabandus', ['Vabandust!', 'Vabandage!', 'Andke andeks!']], ['Hüvastijätt', ['Nägemist!', 'Head aega!', 'Kohtumiseni!']],
      ]),
      B.match('002_d_match', 'Mida vastata?', 'Ühenda lause ja vastus.', [
        ['Meeldiv tutvuda!', 'Mul on ka väga meeldiv!'], ['Aitäh!', 'Palun väga!'], ['Vabandust!', 'Pole midagi.'],
        ['Kuidas läheb?', 'Aitäh, hästi!'], ['Head päeva!', 'Aitäh, samuti!'], ['Tere tulemast!', 'Aitäh!'],
      ]),
      B.choice('002_d_choice', 'Sina või teie?', 'Loe olukorda. Vali sobiv küsimus.', [
        ['Sa räägid uue kolleegiga. Ta on sinu vanune.', 'Kust sa pärit oled?', 'Kust te pärit olete, härra?', 'Kust nad pärit on?'],
        ['Sa räägid vanema naisega poe kassas.', 'Kas te maksate kaardiga?', 'Kas sa maksad kaardiga, sõber?', 'Kas ta maksab kaardiga?'],
        ['Sa küsid tänaval võõralt inimeselt teed.', 'Vabandage, kus on jaam?', 'Kuule, kus on jaam?', 'Tere, sõber, kus jaam?'],
        ['Sa räägid lapsega mänguväljakul.', 'Mis su nimi on?', 'Mis teie nimi on?', 'Mis tema nimi on?'],
      ], 'full', 'g_use'),
      B.gaps('002_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Vabandust, ma ei saa [aru].', 'Palun [korrake]!', 'Palun rääkige [aeglaselt].', 'Mul on väga [meeldiv] tutvuda.', '[Aitäh] abi eest!', 'Head päeva ja [nägemiseni]!',
      ], ['aru', 'korrake', 'aeglaselt', 'meeldiv', 'Aitäh', 'nägemiseni', 'tere', 'palun']),
      B.transformation('002_d_formal', 'Sina → teie.', 'Kirjuta lause viisakalt (teie).', [
        ['Kust sa pärit oled?', 'Kust te …?', 'Kust te pärit olete?|Kust te olete pärit?'], ['Kas sa räägid eesti keelt?', 'Kas te …?', 'Kas te räägite eesti keelt?'],
        ['Korda palun!', 'Palun …!', 'Palun korrake!'], ['Räägi aeglasemalt!', 'Palun …!', 'Palun rääkige aeglasemalt!'], ['Kus sa elad?', 'Kus te …?', 'Kus te elate?'],
      ]),
      B.errorfix('002_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Mul on meeldiv tutvuma.', 'Mul on meeldiv tutvuda.'], ['Vabandust, ma ei saan aru.', 'Vabandust, ma ei saa aru.'], ['Kust te pärit oled?', 'Kust te pärit olete?'],
        ['Palun korda, proua!', 'Palun korrake!'], ['Aitäh, ma olen hästi!', 'Aitäh, hästi!'], ['Tere õhtust! (hommikul)', 'Tere hommikust!'],
      ]),
      B.dictation('002_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Tere hommikust!', 'Mul on väga meeldiv tutvuda.', 'Palun rääkige aeglasemalt.', 'Kas me võime öelda sina?', 'Head päeva ja nägemiseni!'], 5),
      B.wordforms('002_d_forms', 'Palun teie-vormis.', 'Kirjuta viisakas palve (teie).', [['korda!', 'teie', 'korrake'], ['räägi!', 'teie', 'rääkige'], ['istu!', 'teie', 'istuge'], ['tule!', 'teie', 'tulge'], ['oota!', 'teie', 'oodake']]),
      B.speaking('002_d_say', 'Tutvume!', 'Tutvu paarilisega. Kasuta dialoogi väljendeid.', ['Tervita ja ütle oma nimi.', 'Küsi, kust ta pärit on.', 'Küsi, kus ta elab.', 'Palun tal korrata üks lause.', 'Jäta hüvasti.'], [60, 90], ['Tere! Mina olen…', 'Meeldiv tutvuda!', 'Palun korrake!']),
      B.translation('002_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Приятно познакомиться!', 'Извините, я не понимаю.', 'Повторите, пожалуйста.', 'Говорите медленнее, пожалуйста.', 'Спасибо, до свидания!']),
      B.writing('002_d_write', 'Kiri sõbrale.', 'Kirjuta sõbrale 5–7 lauset: kellega sa tutvusid ja mida te rääkisite.', [5, 7], ['tutvusin', 'nimi', 'pärit', 'meeldiv'], 2),
      B.selfcheck('002_d_self', ['Ma tervitan ja jätan hüvasti.', 'Ma tean, millal öelda sina ja millal teie.', 'Ma palun korrata, kui ma ei saa aru.', 'Ma tutvustan ennast uuele inimesele.'], 'Viisakas tutvuja'),
    ],
    practice: [
      B.crossword('002_p_cross', 'Viisakad sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Seda ütled, kui saad kingituse', 'aitäh'], ['Seda ütled, kui tuled hommikul tööle', 'tere'], ['Seda ütled, kui astud kellelegi jalale', 'vabandust'],
        ['Seda ütled, kui palud midagi', 'palun'], ['Inimene, kellega töötad', 'kolleeg'], ['Inimene, kes elab sinu kõrval', 'naaber'],
      ]),
      B.listening('002_p_listen', 'Kuulamine. Tutvumine peol.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Liis: Tere! Mina olen Liis. Ma olen Kati sõbranna.', 'Jaan: Tere, Liis! Meeldiv tutvuda. Mina olen Jaan, Kati kolleeg.',
        'Liis: Vabandust, kuidas teie nimi oli?', 'Jaan: Jaan. Ja võime öelda sina.', 'Liis: Hea küll! Kust sa pärit oled, Jaan?',
        'Jaan: Ma olen pärit Viljandist, aga elan Tartus.', 'Liis: Mina olen pärit Riiast. Ma õpin Tartu ülikoolis.', 'Jaan: Tore! Mida sa õpid?',
        'Liis: Ma õpin arstiks. Aga nüüd ma pean minema. Nägemiseni!', 'Jaan: Head õhtut, Liis!',
      ], [
        'Liis on Kati [sõbranna].', 'Jaan on Kati [kolleeg].', 'Jaan on pärit [Viljandist].', 'Jaan elab [Tartus].', 'Liis on pärit [Riiast].', 'Liis õpib [arstiks].',
      ]),
      B.choice('002_p_form', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Kust ___ pärit olete?', 'te', 'sa', 'ta'], ['Kas sa ___ vene keelt?', 'räägid', 'räägite', 'räägime'],
        ['Palun ___ aeglasemalt!', 'rääkige', 'räägin', 'räägib'], ['Mul on väga meeldiv ___.', 'tutvuda', 'tutvun', 'tutvume'],
        ['Vabandust, ma ei ___ aru.', 'saa', 'saan', 'saad'],
      ], 'full', 'g_notice'),
      B.transformation('002_p_formal', 'Ütle viisakalt (teie).', 'Muuda küsimus teie-vormi.', [
        ['Kust sa pärit oled?', 'Kust te …?', 'Kust te pärit olete?|Kust te olete pärit?'], ['Kus sa elad?', 'Kus te …?', 'Kus te elate?'],
        ['Mis keeli sa räägid?', 'Mis keeli te …?', 'Mis keeli te räägite?'], ['Kas sa saad aru?', 'Kas te …?', 'Kas te saate aru?'],
        ['Korda palun!', 'Palun …!', 'Palun korrake!'], ['Tule sisse!', 'Palun …!', 'Palun tulge sisse!'], ['Kas sa töötad siin?', 'Kas te …?', 'Kas te töötate siin?'],
      ]),
      B.errorfix('002_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kust te pärit oled?', 'Kust te pärit olete?'], ['Mul on meeldiv tutvuma.', 'Mul on meeldiv tutvuda.'], ['Vabandust, ma ei saan aru.', 'Vabandust, ma ei saa aru.'],
        ['Palun korda aeglaselt, härra!', 'Palun korrake aeglaselt!'], ['Aitäh, palun!', 'Aitäh! – Palun!|Palun väga!'],
        ['Kas teie oled uus kolleeg?', 'Kas teie olete uus kolleeg?'], ['Ma ei kuulnud, korrake palun mina.', 'Ma ei kuulnud, palun korrake.'],
      ]),
      B.dialogue('002_p_dialog', 'Uus kolleeg.', 'Täida dialoog sobivate sõnadega.', 'Viktor', 'Olga', [
        ['A', 'Tere! Kas teie olete meie uus [kolleeg]?'], ['B', 'Jah, tere! Mina olen Olga. Ma alustan täna.'], ['A', '[Meeldiv] tutvuda! Mina olen Viktor.'],
        ['B', 'Vabandust, ma ei [kuulnud]. Kuidas teie nimi oli?'], ['A', 'Viktor. Me võime öelda [sina].'], ['B', 'Hea küll. Kas sa töötad siin juba [kaua]?'],
        ['A', 'Kolm aastat. Kui sul on küsimusi, küsi julgelt!'], ['B', 'Suur [tänu]!'],
      ]),
      B.wordorder('002_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kas teie olete meie uus kolleeg?', 'Ma alustan täna tööd.', 'Kui sul on küsimusi, küsi julgelt.', 'Vabandust, kuidas teie nimi oli?']),
      B.wordforms('002_p_forms', 'sina → teie', 'Kirjuta tegusõna teie-vormis.', [['sa oled', 'te', 'olete'], ['sa elad', 'te', 'elate'], ['sa räägid', 'te', 'räägite'], ['sa saad', 'te', 'saate'], ['sa töötad', 'te', 'töötate'], ['sa õpid', 'te', 'õpite']]),
      B.dictation('002_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Mul on väga meeldiv tutvuda.', 'Palun rääkige aeglasemalt.', 'Vabandust, ma ei saa aru.', 'Kust te pärit olete?', 'Head päeva ja nägemiseni!'], 5),
      B.translation('002_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Вы наш новый коллега?', 'Можно на «ты»?', 'Как вас зовут?', 'Если есть вопросы, спрашивай.', 'Большое спасибо за помощь!']),
      B.manymatch('002_p_sit', 'Mida öelda?', 'Ühenda olukord ja lause.', ['Sa kohtad naabrit hommikul.', 'Kolleeg aitab sind.', 'Sa ei kuulnud nime.', 'Sa lähed õhtul töölt koju.', 'Sa tutvustad sõpra ülemusele.'], ['Tere hommikust!', 'Suur aitäh!', 'Vabandust, kuidas teie nimi oli?', 'Head õhtut! Homseni!', 'See on minu sõber Jaan.']),
      B.speaking('002_p_say', 'Kolm tutvumist.', 'Tutvu kolme inimesega. Vali iga kord sina või teie.', ['Uus kolleeg tööl (sinu vanune).', 'Uus naaber (vanem härra).', 'Lapsevanem lasteaias.'], [60, 120], ['Tere! Mina olen…', 'Meeldiv tutvuda!', 'Kust te pärit olete? / Kust sa pärit oled?']),
      B.writing('002_p_write', 'Sõnum uuele kolleegile.', 'Kirjuta uuele kolleegile 5–7 lauset: tervita, tutvusta ennast, paku abi.', [5, 7], ['tere', 'olen', 'meeldiv', 'aitan'], 2),
      B.selfcheck('002_p_self', ['Ma saan aru tutvumisvestlusest.', 'Ma kasutan teie-vormi: olete, elate, räägite.', 'Ma küsin uuesti, kui ma ei kuulnud.', 'Ma kirjutan kolleegile lühikese sõnumi.'], 'Suhtlen viisakalt'),
    ],
    transfer: [
      B.text('002_t_situation', 'Uus olukord', 'Sa alustad uuel töökohal. Esimesel päeval tutvustab ülemus sind kolleegidele. Lõunal istud laua taha, kus on kaks võõrast inimest. Pärast tööd kirjutad sõbrale, kuidas päev läks.'),
      B.reading('002_t_mail', 'Loe e-kirja.', 'Loe ülemuse kirja ja vasta küsimustele.', 'Tere tulemast meie meeskonda!',
        'Head kolleegid! Esmaspäeval alustab meie osakonnas uus töötaja Anna Tamm. Anna on pärit Pärnust ja ta räägib eesti, vene ja inglise keelt. Ta töötab klienditeenindajana. Anna istub teisel korrusel, akna juures, Jaani kõrval. Ta on varem töötanud hotellis administraatorina, nii et tal on palju kogemust. Esimesel päeval näitab Jaan talle kontorit ja arvutiprogramme. Palun tutvuge Annaga ja aidake teda esimesel nädalal. Rääkige temaga eesti keeles, aga aeglaselt. Lõuna on meil kell 12.30 köögis. Reedel on meil koosolek, seal tutvustab Anna ennast kõigile. Parimate soovidega, Kersti',
        [['Millal Anna alustab?', 'esmaspäeval'], ['Kust Anna pärit on?', 'Pärnust'], ['Mis keeli Anna räägib?', 'eesti, vene ja inglise keelt|eesti, vene ja inglise'], ['Kus Anna istub?', 'teisel korrusel|teisel korrusel, akna juures|akna juures'], ['Mis kell on lõuna?', '12.30|kell 12.30']]),
      B.listening('002_t_listen', 'Kuula ülemuse tutvustust.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head kolleegid! Täna alustab meil uus töötaja.', 'Tema nimi on Anna Tamm. Anna on pärit Pärnust.', 'Ta töötab klienditeenindajana ja istub teisel korrusel.',
        'Anna räägib eesti, vene ja inglise keelt.', 'Lõuna on täna kell pool üks köögis. Palun tutvuge Annaga ja aidake teda!', 'Reedel on koosolek kell kolm. Seal räägib Anna endast rohkem.',
      ], ['Uue töötaja nimi on Anna [Tamm].', 'Ta on pärit [Pärnust].', 'Ta töötab [klienditeenindajana].', 'Ta istub [teisel] korrusel.', 'Lõuna on [köögis].', 'Koosolek on [reedel] kell kolm.']),
      B.rolecards('002_t_roles', 'Lõunalauas.', 'Tutvuge lõunalauas. Üks on uus töötaja, teine on vana kolleeg.', 'Oled uus töötaja. Tervita, tutvusta ennast, küsi kolleegi nime ja ametit. Kui sa ei saa aru, palu korrata.', 'Töötad firmas kaua. Tervita uut kolleegi, küsi, kust ta pärit on ja kus ta elab. Paku abi.', ['Tere! Ma olen siin uus.', 'Vabandust, palun korrake!', 'Mis teie amet on?'], ['Tere tulemast!', 'Kust te pärit olete?', 'Kui vaja, ma aitan.']),
      B.speaking('002_t_intro', 'Tutvustus koosolekul.', 'Ülemus palub sul ennast tutvustada. Räägi kolleegidele umbes üks minut.', ['Kes sa oled ja kust sa pärit oled?', 'Mis keeli sa räägid?', 'Mida sa teed?', 'Mida sa vabal ajal teed?'], [45, 90]),
      B.planning('002_t_plan', 'Enne kirjutamist.', 'Mõtle, mida kirjutad sõbrale.', ['Kellega sa tutvusid?', 'Kust nad on pärit ja mida nad teevad?', 'Kuidas päev läks?'], 2),
      B.letter('002_t_write', 'Kiri sõbrale.', 'Kirjuta sõbrale 40–60 sõna oma esimesest tööpäevast ja uutest kolleegidest.', 'Tere!', 'Kallistades', [40, 60]),
      B.wordorder('002_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Täna oli minu esimene tööpäev.', 'Ülemus tutvustas mind kolleegidele.', 'Lõunal istusin uute kolleegidega.', 'Anna on pärit Pärnust.', 'Kõik olid väga viisakad.', 'Reedel on meil koosolek.']),
      B.dialogue('002_t_dialog', 'Telefonis.', 'Täida dialoog: uus kolleeg helistab sulle.', 'Kolleeg', 'Sina', [
        ['A', 'Tere! Siin Anna Tamm. Ma olen teie uus [kolleeg].'], ['B', 'Tere, Anna! Meeldiv [tutvuda]. Kuidas ma saan aidata?'], ['A', 'Vabandust, ma ei leia [kööki|lõunasööki]. Kus see on?'],
        ['B', 'Köök on teisel [korrusel], koridori lõpus.'], ['A', 'Palun [korrake], ma ei kuulnud hästi.'], ['B', 'Teisel korrusel, koridori lõpus.'], ['A', 'Suur [aitäh]!'], ['B', 'Palun väga! Head [isu]!'],
      ]),
      B.translation('002_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я здесь новенький.', 'Кем вы работаете?', 'Если нужно, я помогу.', 'Приятного аппетита!', 'Повторите, пожалуйста, медленнее.', 'До завтра!']),
      B.errorfix('002_t_fix', 'Paranda sõnum.', 'Sõbra sõnumis on vead. Kirjuta lause õigesti.', [
        ['Täna ma tutvun uus kolleeg.', 'Täna ma tutvusin uue kolleegiga.|Täna ma tutvun uue kolleegiga.'], ['Ta on pärit Pärnu.', 'Ta on pärit Pärnust.'], ['Ta räägivad kolm keelt.', 'Ta räägib kolme keelt.|Ta räägib kolm keelt.'],
        ['Meil on väga meeldiv!', 'Mul oli väga meeldiv!|Meil oli väga meeldiv!'], ['Homme ma näha sind.', 'Homme ma näen sind.'],
      ]),
      B.rubric('002_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Vestluses on tervitus, tutvustus, küsimused ja hüvastijätt.', 'Sina ja teie on õigesti valitud.', 'Kui ei saa aru, palub õpilane korrata.', 'Sõnumis on vähemalt viis arusaadavat lauset.']),
      B.selfcheck('002_t_self', ['Ma tutvun uute kolleegidega.', 'Ma tutvustan ennast koosolekul.', 'Ma saan aru lühikesest e-kirjast.', 'Ma kirjutan sõbrale oma päevast.'], 'Tutvumine õnnestus'),
    ],
  },

  'a2-003': {
    title: 'Olen, elan, räägin',
    canDo: 'Ma kasutan olevikus tegusõnu olema, elama, töötama, õppima ja rääkima jaatavas ja eitavas lauses ning ütlen endast 6 lauset ilma abita.',
    discover: [
      B.text('003_d_situation', 'Kolm inimest, üks maja', 'Ühes majas Tartus elavad Viktor, Kati ja Sofia. Viktor töötab bussijuhina. Kati õpib ülikoolis. Sofia ei tööta praegu, ta õpib eesti keelt. Õhtuti räägivad nad trepikojas.'),
      B.reading('003_d_read', 'Loe: Meie maja.', 'Loe teksti ja vasta küsimustele.', 'Kes siin elab?',
        'Viktor on 52 aastat vana. Ta elab esimesel korrusel koos naisega. Viktor töötab bussijuhina. Ta töötab hommikul vara ja õhtul on ta kodus. Kati elab teisel korrusel. Ta on üliõpilane, ta õpib ülikoolis meditsiini. Kati räägib eesti, inglise ja natuke saksa keelt. Sofia elab kolmandal korrusel koos tütrega. Sofia ei tööta praegu, sest ta õpib eesti keelt. Ta räägib ukraina, vene ja inglise keelt. Eesti keelt ta räägib veel natuke, aga ta õpib iga päev. Õhtul räägivad naabrid trepikojas eesti keeles. Viktor räägib aeglaselt ja Sofia saab temast hästi aru. Kati räägib kiiresti, aga ta kordab, kui Sofia palub.',
        [['Kus Viktor töötab?', 'bussijuhina|ta on bussijuht|ta töötab bussijuhina'], ['Mida Kati õpib?', 'meditsiini|ta õpib meditsiini'], ['Mis keeli Kati räägib?', 'eesti, inglise ja natuke saksa keelt|eesti, inglise ja saksa'], ['Miks Sofia praegu ei tööta?', 'ta õpib eesti keelt|sest ta õpib eesti keelt'], ['Kellega Sofia elab?', 'tütrega|koos tütrega'], ['Mis keeles naabrid õhtul räägivad?', 'eesti keeles']]),
      B.notice('003_d_notice', 'Märka: olevik', ['ma **elan**, sa **elad**, ta **elab**', 'me **elame**, te **elate**, nad **elavad**', 'Eitus: ma **ei ela**, sa **ei ela**, ta **ei ela** (ei + tüvi)', 'töötama → ma **töötan** / **ei tööta**', 'rääkima → ma **räägin** / **ei räägi**', 'õppima → ma **õpin** / **ei õpi**']),
      B.diagram('003_d_table', 'mind', { title: 'Tegusõna ja lõpud', instruction: 'Kirjuta puuduvad vormid.', center: 'elama', nodes: 'ma\n- [elan]\nsa\n- [elad]\nta\n- [elab]\nme\n- [elame]\nte\n- [elate]\nnad\n- [elavad]' }, 'full'),
      B.wordforms('003_d_forms', 'Pööra tegusõna.', 'Kirjuta tegusõna õiges vormis.', [
        ['töötama', 'ma', 'töötan'], ['õppima', 'sa', 'õpid'], ['rääkima', 'ta', 'räägib'], ['elama', 'me', 'elame'],
        ['õppima', 'te', 'õpite'], ['rääkima', 'nad', 'räägivad'], ['töötama', 'ma (eitus)', 'ei tööta'],
      ]),
      B.truefalse('003_d_tf', 'Õige või vale?', 'Loe teksti uuesti.', [
        ['Viktor töötab õhtul.', false], ['Kati õpib ülikoolis.', true], ['Sofia töötab praegu.', false], ['Sofia õpib eesti keelt iga päev.', true], ['Viktor elab üksi.', false],
      ]),
      B.match('003_d_match', 'Kes mida teeb?', 'Ühenda inimene ja lause.', [
        ['Viktor', 'töötab bussijuhina.'], ['Kati', 'õpib meditsiini.'], ['Sofia', 'ei tööta praegu.'], ['Naabrid', 'räägivad õhtul eesti keeles.'], ['Sofia tütar', 'elab emaga kolmandal korrusel.'],
      ], 'full', 'g_read'),
      B.gaps('003_d_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Viktor [töötab] bussijuhina. (töötama)', 'Kati [õpib] ülikoolis. (õppima)', 'Sofia [ei tööta] praegu. (töötama, eitus)', 'Me [elame] Tartus. (elama)', 'Kas te [räägite] eesti keelt? (rääkima)', 'Nad [elavad] samas majas. (elama)',
      ]),
      B.wordorder('003_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kati õpib ülikoolis meditsiini.', 'Viktor töötab hommikul vara.', 'Sofia ei tööta praegu.', 'Naabrid räägivad õhtul eesti keeles.']),
      B.transformation('003_d_neg', 'Ei ole nii!', 'Kirjuta eitav lause.', [
        ['Viktor töötab õhtul.', 'Viktor ei …', 'Viktor ei tööta õhtul.'], ['Kati elab esimesel korrusel.', 'Kati ei …', 'Kati ei ela esimesel korrusel.'],
        ['Sofia räägib soome keelt.', 'Sofia ei …', 'Sofia ei räägi soome keelt.'], ['Me õpime saksa keelt.', 'Me ei …', 'Me ei õpi saksa keelt.'], ['Ma olen bussijuht.', 'Ma ei …', 'Ma ei ole bussijuht.'],
      ]),
      B.translation('003_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я работаю в больнице.', 'Она учится в университете.', 'Мы живём в Тарту.', 'Он не говорит по-фински.', 'Вы говорите по-эстонски?']),
      B.dictation('003_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Viktor töötab bussijuhina.', 'Kati õpib ülikoolis.', 'Sofia ei tööta praegu.', 'Me elame samas majas.', 'Nad räägivad eesti keeles.'], 5),
      B.errorfix('003_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Viktor töötan bussijuhina.', 'Viktor töötab bussijuhina.'], ['Me elab Tartus.', 'Me elame Tartus.'], ['Kati ei õpib saksa keelt.', 'Kati ei õpi saksa keelt.'],
        ['Kas te räägid vene keelt?', 'Kas te räägite vene keelt?'], ['Nad õpib eesti keelt.', 'Nad õpivad eesti keelt.'], ['Sofia ei töötab.', 'Sofia ei tööta.'],
      ]),
      B.writing('003_d_write', 'Minu naabrid.', 'Kirjuta 5–6 lauset oma naabritest või perest.', [5, 6], ['elab', 'töötab', 'õpib', 'räägib'], 2),
      B.speaking('003_d_say', 'Räägi oma majast.', 'Räägi paarilisele oma naabritest või perest.', ['Kes elab sinu kõrval?', 'Kus ta töötab või õpib?', 'Mis keelt ta räägib?', 'Mida sina teed?'], [45, 90], ['Minu naaber elab…', 'Ta töötab…', 'Ta ei räägi…']),
      B.selfcheck('003_d_self', ['Ma tean elama, töötama, õppima, rääkima vorme.', 'Ma teen eituse: ma ei tööta, ta ei räägi.', 'Ma saan aru tekstist naabrite kohta.', 'Ma räägin oma naabritest.'], 'Tegusõnad liiguvad'),
    ],
    practice: [
      B.table('003_p_table', 'Täida tabel.', 'Kirjuta puuduvad vormid.', 'kes?, elama, töötama, õppima, rääkima', ['ma | [elan] | [töötan] | [õpin] | [räägin]', 'sa | [elad] | töötad | [õpid] | [räägid]', 'ta | elab | [töötab] | õpib | [räägib]', 'me | [elame] | [töötame] | [õpime] | räägime', 'nad | [elavad] | töötavad | [õpivad] | [räägivad]'], 'g_notice'),
      B.choice('003_p_choice', 'Vali õige vorm.', 'Vali lünka sobiv vorm.', [
        ['Minu vend ___ Soomes.', 'töötab', 'töötan', 'töötavad'], ['Kas sa ___ prantsuse keelt?', 'räägid', 'räägib', 'rääkima'],
        ['Me ___ eesti keelt kolm korda nädalas.', 'õpime', 'õpivad', 'õpite'], ['Kati ja Liis ___ ülikoolis.', 'õpivad', 'õpib', 'õpin'],
        ['Ma ___ täna tööl, ma olen haige.', 'ei ole', 'ei olen', 'ole ei'],
      ], 'full', 'g_notice'),
      B.transformation('003_p_neg', 'Ütle eitavalt.', 'Kirjuta lause eitavas vormis.', [
        ['Ma töötan pühapäeval.', 'Ma ei …', 'Ma ei tööta pühapäeval.'], ['Kati räägib soome keelt.', 'Kati ei …', 'Kati ei räägi soome keelt.'],
        ['Me elame kesklinnas.', 'Me ei …', 'Me ei ela kesklinnas.'], ['Viktor on kodus.', 'Viktor ei …', 'Viktor ei ole kodus.'],
        ['Nad õpivad hommikul.', 'Nad ei …', 'Nad ei õpi hommikul.'],
      ]),
      B.errorfix('003_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei töötan täna.', 'Ma ei tööta täna.'], ['Kati õpin ülikoolis.', 'Kati õpib ülikoolis.'], ['Nad elab Tartus.', 'Nad elavad Tartus.'],
        ['Kas te räägid eesti keelt?', 'Kas te räägite eesti keelt?'], ['Ma ei ole räägi vene keelt.', 'Ma ei räägi vene keelt.'],
        ['Me ei elame siin.', 'Me ei ela siin.'], ['Sa õpib hästi.', 'Sa õpid hästi.'],
      ]),
      B.categorize('003_p_sort', 'Jah või ei?', 'Pane laused rühma: jaatav või eitav lause.', [
        ['Jaatav lause', ['Ma töötan.', 'Ta õpib.', 'Me elame siin.']], ['Eitav lause', ['Ma ei tööta.', 'Ta ei õpi.', 'Me ei ela siin.']],
      ], 'full', 'g_notice'),
      B.listening('003_p_listen', 'Kuulamine. Sofia räägib.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Sofia. Ma elan Tartus, Annelinnas.', 'Ma ei tööta praegu, sest ma õpin eesti keelt.', 'Kursus on neli korda nädalas, hommikul kell üheksa.',
        'Minu tütar Mia käib lasteaias. Ta räägib juba eesti keelt paremini kui mina.', 'Minu mees töötab ehitusel. Ta ei räägi eesti keelt, ta räägib ainult ukraina ja vene keelt.',
      ], ['Sofia elab [Annelinnas|Tartus].', 'Kursus on [neli|4] korda nädalas.', 'Tund algab kell [üheksa|9].', 'Mia käib [lasteaias].', 'Sofia mees töötab [ehitusel].']),
      B.wordorder('003_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Sofia õpib eesti keelt hommikul.', 'Minu mees ei räägi eesti keelt.', 'Mia käib lasteaias.', 'Me elame Annelinnas.', 'Kas te töötate ehitusel?']),
      B.translation('003_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я не работаю, я учусь.', 'Моя дочь ходит в детский сад.', 'Мой муж работает на стройке.', 'Они живут в Тарту.', 'Вы говорите по-английски?']),
      B.gaps('003_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', ['Mia [käib] lasteaias. (käima)', 'Sofia mees [töötab] ehitusel. (töötama)', 'Me [elame] Annelinnas. (elama)', 'Sa [räägid] eesti keelt hästi. (rääkima)', 'Ma [ei õpi] täna. (õppima, eitus)', 'Te [olete] Sofia naabrid. (olema)']),
      B.dictation('003_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma elan Tartus.', 'Ma ei tööta praegu.', 'Kati õpib ülikoolis.', 'Kas te räägite eesti keelt?', 'Nad elavad samas majas.'], 5),
      B.speaking('003_p_chain', 'Ahelmäng.', 'Rääkige kordamööda. Iga inimene ütleb ühe lause endast ja ühe eelmise kohta.', ['Ma elan…, Viktor elab…', 'Ma töötan / õpin…, tema töötab / õpib…', 'Ma räägin…, tema ei räägi…'], [60, 120]),
      B.writing('003_p_write', 'Kuus lauset endast.', 'Kirjuta kuus lauset endast. Kasuta tegusõnu olema, elama, töötama, õppima, rääkima. Kaks lauset on eitavad.', [6, 6], ['elan', 'töötan', 'õpin', 'räägin', 'ei'], 4),
      B.selfcheck('003_p_self', ['Ma täidan tabeli: ma, sa, ta, me, te, nad.', 'Ma teen eituse ilma -n lõputa: ma ei tööta.', 'Ma kuulen vorme tekstis.', 'Ma kirjutan endast kuus lauset.'], 'Pööran tegusõnu'),
    ],
    transfer: [
      B.text('003_t_situation', 'Uus olukord', 'Sinu firma ajakiri kirjutab uutest töötajatest. Ajakirjanik saadab sulle küsimused. Ta tahab ka lühikest videot, kus sa räägid endast.'),
      B.reading('003_t_article', 'Loe artiklit.', 'Loe artiklit ja vasta küsimustele.', 'Meie uus kolleeg: Markus',
        'Markus on 29 aastat vana ja ta on pärit Ukrainast. Ta elab Tartus juba kaks aastat. Markus töötab meie firmas programmeerijana. Ta räägib ukraina, vene ja inglise keelt. Eesti keelt ta õpib õhtuti keelekoolis. „Ma ei räägi veel hästi, aga ma saan juba palju aru,” ütleb Markus. Tööl räägib ta kolleegidega inglise keeles, aga lõunal proovib ta rääkida eesti keeles. Kolleegid aitavad teda ja kordavad aeglaselt. Markus elab Tartus koos sõbraga. Vabal ajal ta mängib kitarri ja käib matkamas. Suvel tahab ta minna matkama Soomaale.',
        [['Kui kaua elab Markus Tartus?', 'kaks aastat|2 aastat'], ['Kus Markus töötab?', 'meie firmas|firmas|programmeerijana'], ['Millal Markus eesti keelt õpib?', 'õhtuti'], ['Mida Markus vabal ajal teeb?', 'mängib kitarri ja käib matkamas|mängib kitarri|käib matkamas']]),
      B.planning('003_t_plan', 'Vasta ajakirjanikule.', 'Kirjuta igale küsimusele lühike vastus.', ['Kust te pärit olete ja kus te elate?', 'Kus te töötate või õpite?', 'Mis keeli te räägite? Mis keelt te ei räägi?', 'Mida te vabal ajal teete?'], 2),
      B.writing('003_t_write', 'Tekst ajakirja.', 'Kirjuta endast 6–8 lauset ajakirja jaoks (nagu Markuse tekst).', [6, 8], ['olen', 'elan', 'töötan', 'õpin', 'räägin'], 3),
      B.speaking('003_t_video', 'Video kolleegidele.', 'Räägi endast üks minut. Kasuta vähemalt viit tegusõna.', ['Kes sa oled?', 'Kus sa elad ja töötad?', 'Mis keeli sa räägid ja mis keelt mitte?', 'Mida sa vabal ajal teed?'], [60, 90]),
      B.listening('003_t_listen', 'Kuula video tutvustust.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Kati. Ma olen kahekümne aastane.', 'Ma elan Tartus, ühiselamus.', 'Ma õpin ülikoolis meditsiini ja töötan nädalavahetusel apteegis.',
        'Ma räägin eesti, inglise ja natuke saksa keelt. Vene keelt ma ei räägi.', 'Vabal ajal ma ujun ja laulan kooris.',
      ], ['Kati elab [ühiselamus|Tartus].', 'Ta õpib [meditsiini].', 'Nädalavahetusel töötab ta [apteegis].', 'Kati ei räägi [vene] keelt.', 'Vabal ajal ta ujub ja [laulab].']),
      B.letter('003_t_letter', 'Kiri uuele kolleegile.', 'Kirjuta Markusele 40–60 sõna: tutvusta ennast ja küsi kaks küsimust tema kohta.', 'Tere, Markus!', 'Parimate soovidega', [40, 60]),
      B.rolecards('003_t_roles', 'Intervjuu.', 'Üks on ajakirjanik, teine uus töötaja.', 'Oled ajakirjanik. Küsi uuelt töötajalt viis küsimust: kus elab, kus töötab, mis keeli räägib, mida õpib, mida teeb vabal ajal.', 'Oled uus töötaja. Vasta täislausetega. Ütle vähemalt üks eitav lause.', ['Kus te elate?', 'Mis keeli te räägite?'], ['Ma elan…', 'Ma ei räägi…']),
      B.errorfix('003_t_fix', 'Kontrolli teksti.', 'Ajakirjanik tegi vead. Kirjuta lause õigesti.', [
        ['Markus elan Tartus.', 'Markus elab Tartus.'], ['Ta ei räägib eesti keelt hästi.', 'Ta ei räägi eesti keelt hästi.'], ['Markus töötavad programmeerijana.', 'Markus töötab programmeerijana.'],
        ['Ta õpin õhtuti.', 'Ta õpib õhtuti.'], ['Vabal ajal ta mängin kitarri.', 'Vabal ajal ta mängib kitarri.'],
      ]),
      B.transformation('003_t_about', 'Kirjuta kolleegist.', 'Muuda lause: mina → tema.', [
        ['Ma elan Tartus.', 'Ta …', 'Ta elab Tartus.'], ['Ma töötan firmas.', 'Ta …', 'Ta töötab firmas.'], ['Ma ei räägi soome keelt.', 'Ta ei …', 'Ta ei räägi soome keelt.'], ['Ma õpin eesti keelt.', 'Ta …', 'Ta õpib eesti keelt.'],
      ]),
      B.translation('003_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я живу в Тарту уже два года.', 'Я ещё плохо говорю по-эстонски.', 'Но я уже многое понимаю.', 'В свободное время я играю на гитаре.']),
      B.rubric('003_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tekstis on vähemalt kuus lauset endast.', 'Tegusõnad on õiges vormis (ma elan, ta töötab).', 'Eitus on õige (ma ei tööta).', 'Suuline tekst on arusaadav ja kestab umbes minuti.']),
      B.selfcheck('003_t_self', ['Ma vastan kirjalikele küsimustele endast.', 'Ma kirjutan endast ajakirja jaoks.', 'Ma räägin endast minuti.', 'Ma küsin ja vastan intervjuus.'], 'Räägin endast'),
    ],
  },

  'a2-004': {
    title: 'Isikuandmed ja lihtne ankeet',
    canDo: 'Ma täidan ankeedi oma andmetega (nimi, sünniaeg, aadress, telefon, e-post, kodakondsus) ja kirjutan 4–6-lauselise sõnumi oma andmetega.',
    discover: [
      B.text('004_d_situation', 'Raamatukogus', 'Olga tahab raamatukogust raamatuid laenutada. Raamatukoguhoidja annab talle ankeedi ja ütleb: „Palun täitke see vorm. Kirjutage trükitähtedega.”'),
      B.profiles('004_d_cards', 'Kelle kaart?', 'Loe isikukaarte ja kirjuta lünka andmed.', [
        ['Olga Ivanova', ['sündinud 12.05.1991', 'Lasnamäe 25-14, 13912 Tallinn', 'tel 5123 4567', 'olga.ivanova@mail.ee', 'Eesti kodanik'], ['Olga sünniaeg on [12.05.1991|12. mai 1991].', 'Tema postiindeks on [13912].']],
        ['Jaan Kask', ['sündinud 03.11.1999', 'Rüütli 8-3, 80010 Pärnu', 'tel 5566 7788', 'jaan.kask@gmail.com', 'Eesti kodanik'], ['Jaan elab [Pärnus].', 'Tema telefon on [5566 7788].']],
        ['Sofia Bondar', ['sündinud 27.08.1988', 'Annelinna 14-6, 50108 Tartu', 'tel 5321 9876', 'sofia.bondar@mail.ee', 'Ukraina kodanik'], ['Sofia on [Ukraina] kodanik.', 'Ta on sündinud [augustis].']],
      ]),
      B.vocab('004_d_vocab', 'Ankeedi sõnad', ['eesnimi — имя', 'perekonnanimi — фамилия', 'sünniaeg — дата рождения', 'aadress — адрес', 'sihtnumber — почтовый индекс', 'telefoninumber — номер телефона', 'e-post — эл. почта', 'kodakondsus — гражданство', 'sugu — пол', 'ankeet — анкета', 'täitma — заполнять', 'allkirjastama — подписывать']),
      B.notice('004_d_notice', 'Märka: kuupäev ja aadress', ['Kuupäev: **12.05.1991** = kaheteistkümnes mai tuhat üheksasada üheksakümmend üks', 'Ma olen sündinud **12. mail** (millal? → -l)', 'Aadress: tänav, maja number, korter: **Lasnamäe 25-14**', 'E-post: **olga.ivanova@mail.ee** — @ = ätt, . = punkt']),
      B.reading('004_d_read', 'Loe: Olga raamatukogus.', 'Loe teksti ja vasta küsimustele.', 'Lugejakaart',
        'Olga läheb laupäeval raamatukokku. Ta tahab laenutada kaks raamatut eesti keeles. Raamatukoguhoidja ütleb, et kõigepealt on vaja lugejakaarti. Olga täidab ankeedi. Ta kirjutab oma ees- ja perekonnanime, sünniaja, aadressi ja telefoninumbri. E-posti aadressi ta ütleb tähthaaval, sest nimi Ivanova on raske. Raamatukoguhoidja kontrollib ID-kaarti ja annab Olgale lugejakaardi. Kaart on tasuta. Raamatud peab tagasi tooma kolme nädala pärast. Olga on rõõmus: nüüd saab ta lugeda iga nädal uut raamatut. Tema poeg võtab ka ühe lasteraamatu. Raamatukogu on avatud iga päev kella kümnest kuueni.',
        [['Mida Olga raamatukogus tahab?', 'laenutada raamatuid|laenutada kaks raamatut'], ['Mida on kõigepealt vaja?', 'lugejakaarti|lugejakaart'], ['Mida Olga ankeeti kirjutab?', 'nime, sünniaja, aadressi ja telefoninumbri|nime, sünniaja, aadressi, telefoni'], ['Miks ütleb ta e-posti tähthaaval?', 'nimi Ivanova on raske|sest nimi on raske'], ['Millal peab raamatud tagasi tooma?', 'kolme nädala pärast']]),
      B.match('004_d_match', 'Mis andmed need on?', 'Ühenda andmed ja ankeedi rida.', [
        ['13912', 'sihtnumber'], ['5123 4567', 'telefoninumber'], ['olga.ivanova@mail.ee', 'e-post'], ['12.05.1991', 'sünniaeg'], ['Ivanova', 'perekonnanimi'], ['naine', 'sugu'],
      ]),
      B.choice('004_d_choice', 'Mis on õige?', 'Vali õige vastus.', [
        ['Kuidas loed: 25.03?', 'kahekümne viies märts', 'kakskümmend viis märts', 'viis kakskümmend märts'], ['Millal sa oled sündinud? (12. mai)', 'Ma olen sündinud 12. mail.', 'Ma olen sündinud 12. mai.', 'Ma olen sündinud 12. maisse.'],
        ['Mis on @?', 'ätt', 'punkt', 'kriips'], ['Kuhu kirjutad oma nime lõpus?', 'allkiri', 'sugu', 'sihtnumber'],
      ], 'full', 'g_vocab'),
      B.dictation('004_d_dict', 'Etteütlus. Numbrid.', 'Kuula ja kirjuta numbrid ja kuupäevad.', ['Minu telefon on 5123 4567.', 'Olen sündinud 12. mail 1991.', 'Minu sihtnumber on 13912.', 'Ma elan Lasnamäe 25, korter 14.', 'Minu e-post on olga.ivanova@mail.ee.'], 5),
      B.table('004_d_form', 'Täida Olga ankeet.', 'Kirjuta ankeeti Olga andmed (vaata kaarti).', 'Rida, Andmed', ['Eesnimi | [Olga]', 'Perekonnanimi | [Ivanova]', 'Sünniaeg | [12.05.1991]', 'Aadress | [Lasnamäe 25-14, Tallinn|Lasnamäe 25-14, 13912 Tallinn]', 'E-post | [olga.ivanova@mail.ee]'], 'g_read'),
      B.gaps('004_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Palun [täitke] ankeet.', 'Kirjutage oma [eesnimi] ja perekonnanimi.', 'Minu [kodakondsus] on Eesti.', 'Ankeedi lõppu pane oma [allkiri].', 'Minu [sünniaeg] on 3. november 1999.',
      ], ['täitke', 'eesnimi', 'kodakondsus', 'allkiri', 'sünniaeg', 'sugu']),
      B.translation('004_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Заполните, пожалуйста, анкету.', 'Пишите печатными буквами.', 'Моя фамилия Иванова.', 'Я родилась двенадцатого мая.', 'Мой адрес: Ласнамяэ 25-14.']),
      B.wordorder('004_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Olga täidab raamatukogus ankeedi.', 'Kaart on tasuta.', 'Raamatud peab tagasi tooma kolme nädala pärast.', 'Palun kirjutage trükitähtedega.', 'Raamatukoguhoidja kontrollib ID-kaarti.', 'Olga ütleb e-posti tähthaaval.']),
      B.errorfix('004_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma olen sündinud 12. mai.', 'Ma olen sündinud 12. mail.'], ['Minu eesnimi on Ivanova.', 'Minu perekonnanimi on Ivanova.'], ['Ma elan Lasnamäe 25-14, Tallinn.', 'Ma elan Lasnamäel, Lasnamäe 25-14, Tallinnas.|Ma elan aadressil Lasnamäe 25-14, Tallinn.'],
        ['Palun täida ankeet, proua.', 'Palun täitke ankeet.'], ['Minu e-post on olga ätt mail.', 'Minu e-post on olga ätt mail punkt ee.'], ['Kaart on tasuline.', 'Kaart on tasuta.'],
      ]),
      B.writing('004_d_write', 'Minu andmed.', 'Kirjuta oma andmed 5–6 lausega (nimi, sünniaeg, aadress, telefon, e-post).', [5, 6], ['nimi', 'sündinud', 'elan', 'telefon'], 2),
      B.speaking('004_d_say', 'Küsi andmeid.', 'Küsi paarilise andmeid ja kirjuta need üles. Siis vahetage.', ['Mis on teie perekonnanimi?', 'Mis on teie sünniaeg?', 'Mis on teie aadress?', 'Mis on teie telefoninumber?', 'Mis on teie e-posti aadress?'], [60, 120], ['Kas te saate tähthaaval öelda?', 'Palun korrake numbrit!']),
      B.selfcheck('004_d_self', ['Ma tean ankeedi sõnu.', 'Ma loen ja kirjutan kuupäeva ja telefoninumbri.', 'Ma ütlen oma e-posti aadressi.', 'Ma täidan ankeedi teise inimese kaardi järgi.'], 'Ankeet on selge'),
    ],
    practice: [
      B.listening('004_p_listen', 'Kuulamine. Registreerimine telefonis.', 'Õpetaja loeb vestluse kaks korda. Täida lüngad.', [
        'Administraator: Keelekool Sõna, tere!', 'Viktor: Tere! Ma tahan registreerida eesti keele kursusele.', 'Administraator: Hea küll. Mis on teie nimi?',
        'Viktor: Viktor Petrov. Petrov: P, E, T, R, O, V.', 'Administraator: Ja teie sünniaeg?', 'Viktor: Seitsmes juuni tuhat üheksasada seitsekümmend kaks.',
        'Administraator: Teie telefoninumber?', 'Viktor: Viis neli null, kaks kolm üks, kaheksa.', 'Administraator: Ja e-post?', 'Viktor: viktor punkt petrov ätt mail punkt ee.', 'Administraator: Aitäh! Kursus algab esmaspäeval kell kuus.',
      ], ['Perekonnanimi: [Petrov]', 'Sünniaeg: [07.06.1972|7. juuni 1972]', 'Telefon: [540 2318|5402318]', 'E-post: [viktor.petrov@mail.ee]', 'Kursus algab [esmaspäeval].']),
      B.wordforms('004_p_forms', 'Millal? (kuupäev)', 'Kirjuta, millal inimene on sündinud.', [
        ['mai', 'millal?', 'mail'], ['juuni', 'millal?', 'juunis'], ['august', 'millal?', 'augustis'], ['november', 'millal?', 'novembris'], ['märts', 'millal?', 'märtsis'],
      ]),
      B.transformation('004_p_sentence', 'Kirjuta lausena.', 'Kirjuta andmed täislausena.', [
        ['sünniaeg: 12. mai', 'Ma olen sündinud …', 'Ma olen sündinud 12. mail.|Ma olen sündinud kaheteistkümnendal mail.'], ['kodakondsus: Eesti', 'Ma olen …', 'Ma olen Eesti kodanik.'],
        ['elukoht: Tartu', 'Ma elan …', 'Ma elan Tartus.'], ['telefon: 5566 7788', 'Minu telefoninumber on …', 'Minu telefoninumber on 5566 7788.'],
      ]),
      B.errorfix('004_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma olen sündinud 12. mai.', 'Ma olen sündinud 12. mail.'], ['Ma elan Tartu.', 'Ma elan Tartus.'], ['Minu perekonnanimi on Olga.', 'Minu eesnimi on Olga.'],
        ['Palun täida ankeet, härra.', 'Palun täitke ankeet.'], ['Ma olen sündinud augustil.', 'Ma olen sündinud augustis.'],
      ]),
      B.categorize('004_p_sort', 'Mis rida see on?', 'Pane andmed õigesse rühma.', [
        ['Nimi', ['Sofia', 'Bondar', 'Kask']], ['Kuupäev', ['27.08.1988', '3. november', '12. mai']], ['Kontakt', ['5321 9876', 'sofia.bondar@mail.ee', 'Annelinna 14-6']],
      ], 'full', 'g_read'),
      B.manymatch('004_p_qa', 'Küsimus ankeedis.', 'Ühenda küsimus ja vastus.', ['Mis on teie eesnimi?', 'Millal te olete sündinud?', 'Kus te elate?', 'Mis on teie kodakondsus?', 'Kuidas teiega ühendust võtta?'], ['Sofia.', '27. augustil 1988.', 'Tartus, Annelinna 14-6.', 'Ukraina.', 'Telefonil 5321 9876.']),
      B.wordorder('004_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma olen sündinud augustis.', 'Palun kirjutage trükitähtedega.', 'Minu sihtnumber on 50108.', 'Pange lõppu oma allkiri.']),
      B.dictation('004_p_dict', 'Etteütlus. Andmed.', 'Kuula ja kirjuta andmed.', ['Minu nimi on Markus Koval.', 'Olen sündinud neljateistkümnendal veebruaril.', 'Minu aadress on Rüütli 8-3, Pärnu.', 'Minu telefon on 5566 7788.', 'Minu e-post on markus.koval@mail.ee.'], 5),
      B.translation('004_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eесti keeles.'.replace('eесti','eesti'), ['Я родился в ноябре.', 'Мой почтовый индекс 80010.', 'Скажите, пожалуйста, по буквам.', 'Где нужно поставить подпись?']),
      B.gaps('004_p_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', ['Palun [kirjutage] trükitähtedega.', 'Ankeedi lõppu pange oma [allkiri].', 'Minu [sihtnumber] on 50108.', 'Mis on teie [kodakondsus]?', 'Kas te ütlete nime [tähthaaval]?', 'Ma olen [sündinud] märtsis.'], ['kirjutage', 'allkiri', 'sihtnumber', 'kodakondsus', 'tähthaaval', 'sündinud', 'sugu']),
      B.crossword('004_p_cross', 'Ankeedi sõnad.', 'Kirjuta sõna vihje järgi.', [['Sinu nimi pärast eesnime', 'perekonnanimi'], ['Paber, mida täidad', 'ankeet'], ['Tänav, maja ja linn', 'aadress'], ['Nimi paberi lõpus', 'allkiri'], ['Numbrid enne linna nime aadressis', 'sihtnumber'], ['Mees või naine', 'sugu']]),
      B.reading('004_p_read', 'Loe: Hambaarsti kiri.', 'Loe kirja ja vasta küsimustele.', 'Teie aeg hambaarsti juures',
        'Lugupeetud Markus Koval! Teie aeg hambaarsti juures on esmaspäeval, 20. oktoobril kell 10.00. Palun tulge kümme minutit varem ja täitke ankeet. Ankeeti kirjutage oma nimi, sünniaeg, aadress, telefoninumber ja e-post. Kui te ei saa tulla, helistage meile vähemalt üks päev ette telefonil 742 1100. Võtke kaasa ID-kaart. Esimene visiit kestab umbes pool tundi. Arst vaatab teie hambad üle ja ütleb, kas on vaja ravi. Kliinik asub Rüütli tänaval 12, teisel korrusel. Parkida saab tasuta maja taga. Parimate soovidega, Hambaraviklinik Naeratus',
        [['Millal on Markuse aeg?', 'esmaspäeval, 20. oktoobril kell 10.00|20. oktoobril|esmaspäeval kell 10'], ['Mida peab enne tegema?', 'täitma ankeedi|täitke ankeet'], ['Mida tuleb ankeeti kirjutada?', 'nimi, sünniaeg, aadress, telefoninumber ja e-post|nime, sünniaja, aadressi, telefoni ja e-posti'], ['Mida teha, kui ei saa tulla?', 'helistada|helistage üks päev ette'], ['Mida võtta kaasa?', 'ID-kaart|ID-kaardi']]),
      B.writing('004_p_message', 'Sõnum õpetajale.', 'Õpetaja palub sinu kontaktandmeid. Kirjuta sõnum 4–6 lausega: nimi, sünniaeg, aadress, telefon, e-post.', [4, 6], ['nimi', 'sündinud', 'elan', 'telefon', 'e-post'], 3),
      B.speaking('004_p_say', 'Tähthaaval.', 'Ütle paarilisele oma perekonnanimi ja e-posti aadress tähthaaval. Paariline kirjutab.', ['Minu perekonnanimi on…: …', 'Minu e-post on…', 'Minu aadress on…', 'Minu sünniaeg on…'], [60, 120]),
      B.selfcheck('004_p_self', ['Ma kuulen ja kirjutan nime, kuupäeva ja numbri.', 'Ma ütlen: ma olen sündinud 12. mail / augustis.', 'Ma ütlen nime tähthaaval.', 'Ma kirjutan oma kontaktandmed sõnumisse.'], 'Andmed on õiged'),
    ],
    transfer: [
      B.text('004_t_situation', 'Uus olukord', 'Sinu laps alustab trennis. Treener saadab ankeedi ja palub sul kirjutada lühikese sõnumi: kes sa oled ja kuidas sinuga ühendust võtta.'),
      B.reading('004_t_info', 'Loe infot.', 'Loe spordiklubi teadet ja vasta küsimustele.', 'Spordiklubi Kalev: uued lapsed',
        'Tere tulemast spordiklubisse! Palun täitke ankeet ja tooge see esimesse trenni. Ankeeti kirjutage lapse ees- ja perekonnanimi, sünniaeg ja aadress. Kirjutage ka lapsevanema nimi, telefon ja e-post. Trenn on teisipäeviti ja neljapäeviti kell 17.00. Kuu tasu on 35 eurot. Esimesel korral võtke kaasa spordiriided, puhtad jalanõud ja veepudel. Lapsevanemad võivad esimeses trennis saalis olla. Kui laps on haige, saatke treenerile sõnum. Trenn kestab tund aega ja lõpeb kell 18.00. Lapsed treenivad kahes grupis: nooremad ja vanemad. Küsimuste korral helistage treener Mardile: 5899 1122.',
        [['Millal ankeet tuleb tuua?', 'esimesse trenni|esimeses trennis'], ['Mis lapse andmed on vaja?', 'nimi, sünniaeg ja aadress|ees- ja perekonnanimi, sünniaeg, aadress'], ['Mis päevadel on trenn?', 'teisipäeviti ja neljapäeviti'], ['Kui palju trenn kuus maksab?', '35 eurot|kolmkümmend viis eurot']]),
      B.table('004_t_form', 'Ankeet.', 'Täida ankeet: laps võib olla päris või väljamõeldud.', 'Andmed, Sinu vastus', ['Lapse ees- ja perekonnanimi | ', 'Lapse sünniaeg | ', 'Aadress ja sihtnumber | ', 'Lapsevanema nimi | ', 'Telefon | ', 'E-post | ']),
      B.letter('004_t_letter', 'Sõnum treenerile.', 'Kirjuta treenerile 30–50 sõna: tutvusta ennast ja oma last, anna kontaktandmed, küsi üks küsimus.', 'Tere, Mart!', 'Parimate soovidega', [30, 50]),
      B.listening('004_t_listen', 'Kuula treeneri häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin treener Mart spordiklubist Kalev.', 'Aitäh ankeedi eest! Teie laps on nüüd meie grupis.', 'Trenn on teisipäeval ja neljapäeval kell viis.',
        'Palun tooge kaasa spordiriided ja veepudel.', 'Esimene kuu maksab kolmkümmend viis eurot. Makske palun ülekandega.', 'Kui on küsimusi, helistage mulle. Kohtumiseni!',
      ], ['Trenn on teisipäeval ja [neljapäeval].', 'Trenn algab kell [viis|5|17].', 'Kaasa on vaja spordiriided ja [veepudel|vett].', 'Esimene kuu maksab [35|kolmkümmend viis] eurot.', 'Maksta tuleb [ülekandega].']),
      B.writing('004_t_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 5–6 lauset: kuhu sinu laps trenni läheb, millal ja mis see maksab.', [5, 6], ['trenn', 'kell', 'maksab', 'eurot'], 2),
      B.rolecards('004_t_roles', 'Telefonikõne.', 'Helista spordiklubisse ja registreeri laps.', 'Oled lapsevanem. Ütle lapse nimi (tähthaaval), sünniaeg ja oma telefon. Küsi trenni aega.', 'Oled treener. Küsi andmed ja kirjuta need üles. Kontrolli: palu korrata numbrit.', ['Ma tahan oma last registreerida.', 'Nimi on … : …'], ['Palun öelge tähthaaval.', 'Palun korrake numbrit.']),
      B.errorfix('004_t_fix', 'Kontrolli ankeeti.', 'Ankeedis on vead. Kirjuta õigesti.', [
        ['Laps on sündinud 3. novembrist.', 'Laps on sündinud 3. novembril.'], ['Ma elan Pärnu, Rüütli 8.', 'Ma elan Pärnus, Rüütli 8.'], ['Minu eesnimi on Kask.', 'Minu perekonnanimi on Kask.'], ['Palun helista mulle, treener.', 'Palun helistage mulle.'],
      ]),
      B.speaking('004_t_say', 'Räägi lapsest.', 'Treener küsib lapse kohta. Vasta täislausetega.', ['Mis lapse nimi on?', 'Kui vana ta on?', 'Kus te elate?', 'Kuidas teiega ühendust võtta?'], [45, 75]),
      B.dialogue('004_t_dialog', 'Esimeses trennis.', 'Täida dialoog treeneriga.', 'Treener', 'Lapsevanem', [
        ['A', 'Tere! Mina olen treener [Mart]. Kas te olete Mia ema?'], ['B', 'Jah, tere! Ma tõin [ankeedi].'], ['A', 'Aitäh! Kas siin on lapse [sünniaeg]?'],
        ['B', 'Jah, ja minu [telefoninumber] ja e-post ka.'], ['A', 'Väga hea. Trenn [lõpeb] kell kuus.'], ['B', 'Selge. [Aitäh] ja head trenni!'],
      ]),
      B.rubric('004_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ankeedis on kõik andmed ja need on loetavad.', 'Kuupäev ja aadress on õiges vormis.', 'Sõnumis on tervitus, info ja küsimus (30–50 sõna).', 'Telefonis on nimi ja number õigesti edasi antud.']),
      B.selfcheck('004_t_self', ['Ma loen spordiklubi teadet.', 'Ma täidan lapse ankeedi.', 'Ma kirjutan treenerile sõnumi.', 'Ma registreerin lapse telefonis.'], 'Ankeet saadetud'),
    ],
  },

  'a2-005': {
    title: 'Kontroll 1 — eneseinfo',
    canDo: 'Ma näitan kontrollis, et oskan rääkida ja kirjutada endast, täita ankeeti ning kasutada olema ja olevikuvorme (vähemalt 70%).',
    discover: [
      B.text('005_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: tutvumine, viisakad väljendid, olema ja olevik, kuupäevad ja ankeet.'),
      B.notice('005_d_notice', 'Mooduli kokkuvõte', ['Tutvumine: **Minu nimi on… Ma olen pärit …-st. Ma elan …-s.**', 'Viisakus: **palun, aitäh, vabandust, palun korrake**', 'Olevik: **ma elan / ei ela**, ta **töötab** / **ei tööta**', 'Sina ↔ teie: **kust sa pärit oled?** ↔ **kust te pärit olete?**', 'Kuupäev: **Ma olen sündinud 12. mail.**']),
      B.reading('005_d_read', 'Loe: Kooriseltsi uus liige.', 'Loe teksti ja vasta küsimustele.', 'Viktor laulab kooris',
        'Viktor on 52 aastat vana. Ta on pärit Narvast, aga elab Tartus juba kakskümmend aastat. Ta töötab bussijuhina. Viktor räägib vene ja eesti keelt, soome keelt ta ei räägi. Kaks kuud tagasi nägi ta kuulutust: kooriselts otsib uusi lauljaid. Viktor kirjutas seltsile sõnumi ja läks esimesse proovi. Seal tutvus ta Kati ja Sofiaga. Kati on üliõpilane, Sofia õpib eesti keelt. Nüüd laulavad nad koos igal kolmapäeval. Viktor ütleb: „Kooris ma õpin eesti keelt kõige paremini, sest me laulame ja räägime palju.”',
        [['Kus Viktor elab?', 'Tartus'], ['Mis keelt Viktor ei räägi?', 'soome keelt|soome'], ['Kuidas Viktor kooriseltsi leidis?', 'nägi kuulutust|kuulutusest'], ['Kellega ta proovis tutvus?', 'Kati ja Sofiaga|Kati ja Sofia'], ['Millal nad laulavad?', 'igal kolmapäeval|kolmapäeval']]),
      B.profiles('005_d_cards', 'Kes nad on?', 'Loe kaarte ja kirjuta lünka sobiv sõna.', [
        ['Kati', ['20 aastat vana', 'pärit Tartust', 'üliõpilane', 'räägib eesti ja inglise keelt'], ['Kati [on] pärit Tartust.', 'Ta [õpib] ülikoolis.']],
        ['Viktor', ['52 aastat vana', 'pärit Narvast', 'bussijuht', 'ei räägi soome keelt'], ['Viktor [töötab] bussijuhina.', 'Ta [ei räägi] soome keelt.']],
        ['Sofia', ['35 aastat vana', 'pärit Lvivist', 'õpib eesti keelt', 'sündinud augustis'], ['Sofia on [35] aastat vana.', 'Ta on sündinud [augustis].']],
      ]),
      B.manymatch('005_d_match', 'Mida öelda?', 'Ühenda olukord ja lause.', ['Sa ei saa aru.', 'Sa tutvud.', 'Sa astusid kellelegi jalale.', 'Sa saad abi.', 'Sa lähed ära.'], ['Palun korrake!', 'Meeldiv tutvuda!', 'Vabandust!', 'Suur aitäh!', 'Nägemiseni!'], 'full', 'g_use'),
      B.wordforms('005_d_forms', 'Olevik.', 'Kirjuta tegusõna õiges vormis.', [
        ['olema', 'te', 'olete'], ['elama', 'nad', 'elavad'], ['töötama', 'ma (eitus)', 'ei tööta'], ['õppima', 'ta', 'õpib'], ['rääkima', 'me', 'räägime'], ['olema', 'ta (eitus)', 'ei ole'],
      ]),
      B.transformation('005_d_trans', 'Küsi viisakalt.', 'Kirjuta küsimus teie-vormis.', [
        ['Mis su nimi on?', 'Mis teie …?', 'Mis teie nimi on?'], ['Kus sa elad?', 'Kus te …?', 'Kus te elate?'], ['Kust sa pärit oled?', 'Kust te …?', 'Kust te pärit olete?'], ['Mis keeli sa räägid?', 'Mis keeli te …?', 'Mis keeli te räägite?'],
        ['Mida sa teed?', 'Mida te …?', 'Mida te teete?'], ['Kas sa töötad?', 'Kas te …?', 'Kas te töötate?'],
      ]),
      B.errorfix('005_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma olen pärit Tartu.', 'Ma olen pärit Tartust.'], ['Ta ei töötab.', 'Ta ei tööta.'], ['Ma olen sündinud mai.', 'Ma olen sündinud mais.|Ma olen sündinud mail.'], ['Kust te pärit oled?', 'Kust te pärit olete?'],
      ]),
      B.translation('005_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Меня зовут Виктор.', 'Я из Нарвы, но живу в Тарту.', 'Я не говорю по-фински.', 'Повторите, пожалуйста.', 'Приятно познакомиться!', 'Я работаю водителем автобуса.']),
      B.crossword('005_d_cross', 'Mooduli sõnad.', 'Kirjuta sõna vihje järgi.', [['Seda ütled, kui ei saa aru: palun …', 'korrake'], ['Paber, kuhu kirjutad oma andmed', 'ankeet'], ['Sinu esimene keel', 'emakeel'], ['Tänav, maja ja linn', 'aadress'], ['Seda ütled tänuks', 'aitäh'], ['Kuupäev, millal oled sündinud', 'sünniaeg']]),
      B.gaps('005_d_gaps', 'Kordame vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', ['Ma [olen] pärit Narvast. (olema)', 'Kati [õpib] ülikoolis. (õppima)', 'Me [ei ela] Tallinnas. (elama, eitus)', 'Kas te [räägite] vene keelt? (rääkima)', 'Ma olen sündinud [augustis]. (august)', 'Nad [töötavad] koos. (töötama)']),
      B.wordorder('005_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Viktor elab Tartus juba kakskümmend aastat.', 'Ta nägi kuulutust kaks kuud tagasi.', 'Nüüd laulavad nad koos.', 'Kooris õpin ma eesti keelt.']),
      B.truefalse('005_d_tf', 'Õige või vale?', 'Loe Viktori teksti uuesti.', [['Viktor on pärit Tartust.', false], ['Viktor töötab bussijuhina.', true], ['Viktor räägib soome keelt.', false], ['Viktor tutvus proovis Kati ja Sofiaga.', true], ['Koor laulab igal reedel.', false]]),
      B.speaking('005_d_say', 'Proovieksam: tutvumine.', 'Vasta paarilise küsimustele, nagu eksami alguses.', ['Mis teie nimi on?', 'Kust te pärit olete?', 'Kus te elate?', 'Mida te teete?', 'Miks te õpite eesti keelt?'], [45, 75]),
      B.writing('005_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–7 lauset uuest tuttavast: nimi, kust pärit, kus elab, mida teeb.', [6, 7], ['on', 'elab', 'töötab', 'räägib'], 2),
      B.selfcheck('005_d_self', ['Ma kordasin tutvumist ja viisakust.', 'Ma pööran olema ja olevikuvorme.', 'Ma küsin teie-vormis.', 'Ma olen valmis kontrolliks.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('005_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      B.choice('005_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Uus kolleeg ütleb oma nime. Mida sa vastad?', 'Meeldiv tutvuda!', 'Head isu!', 'Jõudu tööle!'], ['Sa ei kuulnud telefoninumbrit. Mida sa ütled?', 'Palun korrake!', 'Palun võtke!', 'Pole viga!'],
        ['Sa lähed peolt koju. Mida sa ütled?', 'Aitäh, head ööd!', 'Tere tulemast!', 'Palun istuge!'], ['Vanem naine küsib teed. Kuidas sa alustad?', 'Teie peate minema otse.', 'Sa pead minema otse.', 'Nad peavad minema otse.'],
      ], 'full', 'g_use'),
      B.reading('005_p_ad', 'Lugemine 2. Kuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Otsime uusi liikmeid!',
        'Tartu kooriselts otsib uusi lauljaid! Proovid on kolmapäeviti kell 19.00 Raatuse koolis, aulas. Laulda võivad kõik vanuses 18–65. Eesti keelt ei pea hästi oskama, aga sa pead tahtma õppida. Me laulame eesti, vene ja inglise keeles. Esimene proov on tasuta, siis maksab kuu 15 eurot. Pärast proovi joome koos teed ja räägime eesti keeles. Nii õpid sa keelt ja leiad uusi sõpru. Kõik on väga sõbralikud. Suvel on meil kontsert Tartu laululaval. Registreeri e-postiga koor@tartulaul.ee. Kirjuta oma nimi, vanus ja telefon.',
        [['Mis päeval on proovid?', 'kolmapäeviti|kolmapäeval'], ['Kus on proovid?', 'Raatuse koolis'], ['Kes võivad laulda?', 'kõik vanuses 18–65|18–65-aastased'], ['Mis on esimese proovi hind?', 'tasuta|see on tasuta'], ['Mida pead e-kirja kirjutama?', 'nime, vanuse ja telefoni|nimi, vanus ja telefon']]),
      B.cloze('005_p_cloze', 'Lugemine 3. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kadri!', [
        'Minu nimi {*on|olen|oled} Sofia. Ma {*olen|on|olete} pärit Ukrainast, aga nüüd ma {*elan|elab|elavad} Tartus.',
        'Ma {*ei tööta|ei töötan|ei töötab} praegu, sest ma õpin eesti keelt. Minu tütar {*käib|käin|käivad} lasteaias.',
        'Kas {*te|sa|nad} saate mulle öelda, millal kursus algab? Minu telefon on 5321 9876. {*Aitäh|Vabandust|Tere}!',
      ]),
      B.reading('005_p_notice', 'Lugemine 4. Teade majas.', 'Loe teadet ja vasta küsimustele.', 'Head naabrid!',
        'Head naabrid! Meie majas elab nüüd uus pere: Sofia, tema mees ja tütar Mia. Nad on pärit Ukrainast ja elavad kolmandal korrusel. Sofia õpib eesti keelt ja räägib juba natuke. Laupäeval kell 15 on majas naabrite kohvipaus esimese korruse saalis. Palun tulge ja tutvuge uute naabritega! Kaasa võib võtta kooki või puuvilju. Tee ja kohvi pakub korteriühistu. Lastele on saalis mänguasjad ja joonistamise laud. Tulge julgelt kogu perega. Kui te ei saa tulla, võite Sofiale lihtsalt öelda trepikojas „Tere tulemast!”. Korteriühistu juhatus',
        [['Kes on uued naabrid?', 'Sofia, tema mees ja tütar Mia|Sofia pere'], ['Kus nad elavad?', 'kolmandal korrusel'], ['Millal on kohvipaus?', 'laupäeval kell 15|laupäeval'], ['Kus on kohvipaus?', 'esimese korruse saalis'], ['Mida võib kaasa võtta?', 'kooki või puuvilju']]),
      B.listening('005_p_listen', 'Kuulamine 1. Tutvustus.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Minu nimi on Anna Tamm.', 'Ma olen kakskümmend kaheksa aastat vana ja olen pärit Pärnust.', 'Praegu ma elan Tallinnas, Kalamajas.',
        'Ma töötan raamatukogus.', 'Ma räägin eesti, vene ja natuke saksa keelt.', 'Minu sünnipäev on kolmandal märtsil.', 'Vabal ajal ma joonistan ja käin kinos.',
      ], ['Anna on [28|kakskümmend kaheksa] aastat vana.', 'Ta on pärit [Pärnust].', 'Ta elab [Kalamajas|Tallinnas].', 'Ta töötab [raamatukogus].', 'Tema sünnipäev on [3. märtsil|kolmandal märtsil].', 'Vabal ajal ta [joonistab] ja käib kinos.']),
      B.listening('005_p_listen2', 'Kuulamine 2. Ankeet telefonis.', 'Õpetaja loeb vestluse kaks korda. Täida ankeet.', [
        '— Hambaraviklinik, tere!', '— Tere! Ma tahan registreerida. Minu nimi on Markus Koval.', '— Kas te ütlete perekonnanime tähthaaval?', '— K, O, V, A, L.',
        '— Mis on teie sünniaeg?', '— Neljateistkümnes veebruar tuhat üheksasada üheksakümmend kuus.', '— Ja teie telefoninumber?', '— Viis üks üks, neli kaks, kolm null.',
        '— Aitäh. Teie aeg on esmaspäeval kell kümme. Palun tulge kümme minutit varem.',
      ], ['Perekonnanimi: [Koval]', 'Sünniaeg: [14.02.1996|14. veebruar 1996]', 'Telefon: [511 4230|5114230]', 'Aeg: [esmaspäeval] kell kümme', 'Tulla [kümme|10] minutit varem']),
      B.gaps('005_p_mix', 'Keel. Kümme punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Mina [olen] Viktor. (olema)', 'Me [elame] Narvas. (elama)', 'Kati [õpib] ülikoolis. (õppima)', 'Kas te [räägite] inglise keelt? (rääkima)', 'Ma [ei tööta] täna. (töötama, eitus)',
      ]),
      B.gaps('005_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Nad [on] pärit Lätist. (olema)', 'Ma olen pärit [Tartust]. (Tartu)', 'Ma elan [Pärnus]. (Pärnu)', 'Ma olen sündinud [mais]. (mai)', 'Sa [oled] minu sõber. (olema)',
      ]),
      B.wordorder('005_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu tütar käib lasteaias.', 'Ma olen sündinud kolmandal märtsil.', 'Kas te saate mulle helistada?', 'Proovid on kolmapäeviti Raatuse koolis.']),
      B.errorfix('005_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei töötan.', 'Ma ei tööta.'], ['Ta on pärit Narva.', 'Ta on pärit Narvast.'], ['Kust te pärit oled?', 'Kust te pärit olete?'], ['Me elab Tartus.', 'Me elame Tartus.'],
      ]),
      B.writing('005_p_write', 'Kirjutamine. Sõnum.', 'Kirjuta kooriseltsile 4–6 lauset: kes sa oled ja miks tahad laulda.', [4, 6], ['olen', 'elan', 'tahan'], 2),
      B.translation('005_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Меня зовут Анна, я из Пярну.', 'Я не работаю, я учусь.', 'Повторите номер, пожалуйста.', 'Я родилась в марте.']),
      B.speaking('005_p_say', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis teie nimi on?', 'Kust te pärit olete ja kus te elate?', 'Mida te teete?', 'Mis keeli te räägite?', 'Mida te vabal ajal teete?'], [45, 75]),
      B.selfcheck('005_p_self', ['Ma saan aru kuulutusest ja lühikesest kirjast.', 'Ma kuulen nime, numbri ja kuupäeva.', 'Ma kasutan olevikuvorme õigesti.', 'Ma vastan küsimustele endast.'], 'Kontroll tehtud'),
    ],
    transfer: [
      B.text('005_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sa tahad minna kooriseltsi laulma. Täida ankeet, kirjuta seltsile sõnum ja tutvusta ennast esimeses proovis. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.table('005_t_form', 'Kirjutamine 1. Ankeet.', 'Täida kooriseltsi ankeet oma andmetega.', 'Andmed, Sinu vastus', ['Eesnimi | ', 'Perekonnanimi | ', 'Sünniaeg | ', 'Elukoht | ', 'Telefon | ', 'E-post | ', 'Mis keeli räägid? | ']),
      B.letter('005_t_letter', 'Kirjutamine 2. Sõnum.', 'Kirjuta seltsile 40–60 sõna: kes sa oled, miks tahad laulda, üks küsimus.', 'Tere!', 'Parimate soovidega', [40, 60]),
      B.listening('005_t_listen', 'Kuulamine. Kooriseltsi juht.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere tulemast, uued lauljad! Mina olen Liina, kooriseltsi juht.', 'Meie proovid on kolmapäeviti kell seitse.', 'Pausil joome teed ja räägime eesti keeles.',
        'Kuu tasu on viisteist eurot. Esimene proov on tasuta.', 'Suvel on meil kontsert Tartu laululaval. Kõik on oodatud!',
      ], ['Kooriseltsi juht on [Liina].', 'Proovid on kolmapäeviti kell [seitse|7|19].', 'Pausil joovad lauljad [teed].', 'Kuu tasu on [15|viisteist] eurot.', 'Suvel on [kontsert].']),
      B.planning('005_t_plan', 'Enne sõnumit.', 'Kirjuta märksõnad: mida sa seltsile kirjutad.', ['Kes sa oled?', 'Miks tahad laulda?', 'Mida küsid proovi kohta?'], 2),
      B.transformation('005_t_check', 'Kontrolli lauseid.', 'Kirjuta lause viisakalt (teie).', [['Kas sa saad mulle vastata?', 'Kas te …?', 'Kas te saate mulle vastata?'], ['Ütle palun, mis kell proov algab.', 'Öelge …', 'Öelge palun, mis kell proov algab.'], ['Tule kümme minutit varem!', 'Tulge …!', 'Tulge kümme minutit varem!'], ['Kirjuta mulle!', 'Kirjutage …!', 'Kirjutage mulle!']]),
      B.writing('005_t_write', 'Kirjutamine 3. Sõnum pärast proovi.', 'Kirjuta sõbrale 6–8 lauset: kus sa olid, kellega tutvusid ja mis sulle meeldis.', [6, 8], ['proov', 'tutvusin', 'meeldis'], 2),
      B.speaking('005_t_intro', 'Rääkimine 1. Tutvustus.', 'Esimene proov. Tutvusta ennast grupile umbes üks minut.', ['Kes sa oled ja kust sa pärit oled?', 'Kus sa elad ja mida sa teed?', 'Mis keeli sa räägid?', 'Miks sa tahad laulda?'], [60, 90]),
      B.rolecards('005_t_roles', 'Rääkimine 2. Dialoog.', 'Proovi pausil. Tutvuge ja küsige teineteiselt.', 'Oled uus laulja. Tutvusta ennast. Küsi teiselt nimi, kust ta pärit on ja kaua ta laulab. Kui ei saa aru, palu korrata.', 'Laulad kooris kaua. Võta uus liige vastu, küsi, kus ta elab ja mida ta teeb. Kasuta teie-vormi.', ['Meeldiv tutvuda!', 'Palun korrake!'], ['Tere tulemast!', 'Kus te elate?']),
      B.reading('005_t_reply', 'Lugemine. Seltsi vastus.', 'Loe kooriseltsi vastust ja vasta küsimustele.', 'Tere tulemast kooriseltsi!',
        'Tere! Aitäh sõnumi eest. Väga tore, et tahad meiega laulda! Esimene proov on kolmapäeval kell 19.00 Raatuse koolis, aulas. Tule palun kümme minutit varem, siis tutvustame sind teistele lauljatele. Noote ei ole vaja kaasa võtta, me anname need proovis. Võta kaasa vesi ja hea tuju! Proov kestab poolteist tundi, pausil joome teed ja tutvume. Riided võivad olla tavalised, eriline riietus ei ole vaja. Esimesel korral sa ainult kuulad ja laulad natuke kaasa. Kui sa ei saa tulla, kirjuta meile. Kohtumiseni! Kooriseltsi juht Liina',
        [['Kus on proov?', 'Raatuse koolis, aulas|Raatuse koolis|aulas'], ['Mis kell proov algab?', '19.00|kell seitse|kell 19.00'], ['Miks tulla kümme minutit varem?', 'tutvustamiseks|siis tutvustatakse sind teistele|tutvustame sind teistele lauljatele'], ['Mida tuleb kaasa võtta?', 'vesi ja hea tuju|vett'], ['Mida teha, kui ei saa tulla?', 'kirjutada|kirjuta meile']]),
      B.rubric('005_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Ankeet on täidetud ja andmed on õiged.', 'Sõnumis on tervitus, info endast, küsimus ja lõpp (40–60 sõna).', 'Olevik ja olema on õiges vormis.', 'Suuline tutvustus on arusaadav ja kestab umbes minuti.', 'Dialoogis küsib ja vastab õpilane, kasutab viisakaid väljendeid.']),
      B.selfcheck('005_t_self', ['Ma täidan ankeedi ilma abita.', 'Ma kirjutan 40–60-sõnalise sõnumi endast.', 'Ma tutvustan ennast grupile.', 'Ma pean lühikese tutvumisdialoogi.'], 'Moodul 1 on läbitud'),
    ],
  },
};
