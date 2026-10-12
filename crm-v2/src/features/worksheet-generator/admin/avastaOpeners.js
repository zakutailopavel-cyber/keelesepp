// The opening of an Avasta sheet (owner 2026-10-12: the old opener was two personal questions with a fixed „right”
// answer — no activation, no context). CEFR standard „1 Avasta”: activation + first understanding. Each lesson gets a
// short mini-situation of its own (message thread, dialogue, notice, voice message) with the lesson's language, and
// five true/false statements about it. Different people than the main reading, so the reading stays new.
const block = (id, type, tone, goal, data, width = 'half') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });

export const OPENERS = {
  'a2b1-016': {
    heading: 'Sõnum kolleegilt',
    text: 'Tere, Kati! Homme on mul tihe päev. Kella üheksast kuni üheteistkümneni olen koosolekul. Pärast lõunat, umbes kella ühest, olen jälle laua taga. Kella kolmest kuni neljani pean ma arsti juurde minema. Kui sul on küsimus, helista enne kella üheksat või pärast nelja. — Peeter',
    statements: [['Peeter on hommikul kaks tundi koosolekul.', true], ['Peeter on kogu päeva kontoris.', false], ['Lõuna ajal ei ole Peeter laua taga.', true], ['Kell pool neli on Peeter arsti juures.', true], ['Kati võib Peetrile helistada kell kümme.', false]],
  },
  'a2b1-017': {
    heading: 'Silt ujula uksel',
    text: 'Ujulas peab enne basseini minekut duši all käima. Ujumismütsi peavad kandma kõik, kellel on pikad juuksed. Basseini ääres ei tohi joosta. Telefoni võib kasutada ainult riietusruumis. Lapsed kuni kümne aastani võivad ujuda ainult koos täiskasvanuga. Rätiku saab laenutada kassast kahe euro eest.',
    statements: [['Enne ujumist tuleb duši all käia.', true], ['Basseini ääres võib joosta.', false], ['Telefoniga võib basseini ääres pilti teha.', false], ['Kaheksa-aastane laps ei või üksi ujuda.', true], ['Rätiku saab ujulast tasu eest.', true]],
  },
  'a2b1-018': {
    heading: 'Märge külmkapi uksel',
    text: 'Siim, täna on vaja palju teha! Kõigepealt pead sa koera jalutama viima. Siis tuleb poest leiba ja piima osta. Kella neljaks pead sa vanaemale helistama, sest tal on sünnipäev. Nõusid ei pea pesema, ma pesen need õhtul ise. Kui jõuad, võid ka prügi välja viia. — Ema',
    statements: [['Siim peab kõigepealt koeraga jalutama.', true], ['Siim peab poest juustu ostma.', false], ['Vanaemal on täna sünnipäev.', true], ['Siim peab nõud ära pesema.', false], ['Prügi väljaviimine ei ole kohustuslik.', true]],
  },
  'a2b1-019': {
    heading: 'Sõnumid',
    text: 'Liis: Tere! Kas me saame reedel kell kuus kokku?\nJaan: Kahjuks reedel ei saa, mul on trenn. Kas laupäev sobib?\nLiis: Laupäeval olen ma maal. Aga kuidas oleks pühapäeval kell kaks?\nJaan: Pühapäev sobib väga hästi. Kus kohtume?\nLiis: Kohvikus „Mokka” raekoja platsi lähedal.\nJaan: Kokku lepitud! Näeme!',
    statements: [['Liis pakub kohtumist reedel.', true], ['Jaanil on reede õhtul trenn.', true], ['Laupäeval on Liis linnas.', false], ['Nad kohtuvad pühapäeval kell kaks.', true], ['Nad kohtuvad Jaani kodus.', false]],
  },
  'a2b1-020': {
    heading: 'Häälsõnum',
    text: 'Tere, siin on Kadri. Ma helistan hambaarsti kabinetist. Teie aeg on homme kell kümme, kuid arst on haige. Kas teile sobiks reede kell kolm? Kui see aeg ei sobi, helistage meile tagasi kella viieni. Kui me teilt vastust ei saa, jätame reede aja teile alles. Aitäh ja head päeva!',
    statements: [['Kadri helistab hambaarsti kabinetist.', true], ['Homme ei saa arst patsiente vastu võtta.', true], ['Uus aeg on reedel kell kümme.', false], ['Tagasi peab helistama kella viieni.', true], ['Kui patsient ei helista, kaob tema aeg ära.', false]],
  },
  'a2b1-021': {
    heading: 'Päevikust',
    text: 'Esmaspäeval ärkasin kell seitse. Jõin kohvi ja lugesin uudiseid. Siis sõitsin rattaga tööle, sest ilm oli ilus. Lõuna ajal sõin töökaaslastega salatit. Õhtul vaatasin filmi ja helistasin õele. Läksin magama juba kell kümme, sest olin väga väsinud.',
    statements: [['Kirjutaja ärkas esmaspäeval kell seitse.', true], ['Ta sõitis tööle bussiga.', false], ['Lõunat sõi ta üksi.', false], ['Õhtul helistas ta õele.', true], ['Ta läks magama hilja, sest film oli pikk.', false]],
  },
  'a2b1-022': {
    heading: 'Postitus sotsiaalmeedias',
    text: 'Eelmisel nädalal oli meil kiire! Esmaspäeval kolisime uude korterisse. Teisipäeval ostsime diivani ja laua. Kolmapäeval tulid sõbrad külla ja aitasid kappe kokku panna. Eile oli lõpuks rahulik päev: jalutasime pargis ja küpsetasime kooki. Täna hommikul jõime esimest korda kohvi uuel rõdul.',
    statements: [['Kolimine oli eelmisel esmaspäeval.', true], ['Nad ostsid uue voodi.', false], ['Sõbrad aitasid mööblit kokku panna.', true], ['Eile oli väga kiire päev.', false], ['Uues korteris on rõdu.', true]],
  },
  'a2b1-023': {
    heading: 'Sõbra sõnum',
    text: 'Kujuta ette, mis eile juhtus! Läksin hommikul poodi ja nägin seal meie vana õpetajat. Ta tundis mind kohe ära. Me rääkisime pool tundi. Siis tuli vihm ja ma sain märjaks, sest vihmavarju mul ei olnud. Koju jõudsin alles kell üks. Päev oli tore, aga külm!',
    statements: [['Kirjutaja nägi poes vana õpetajat.', true], ['Õpetaja ei tundnud teda ära.', false], ['Nad rääkisid umbes pool tundi.', true], ['Kirjutajal oli vihmavari kaasas.', false], ['Ta jõudis koju enne lõunat.', false]],
  },
  'a2b1-024': {
    heading: 'Lugu neljas lauses',
    text: 'Kõigepealt läks Toomas parki, et koeraga jalutada. Siis jooksis koer ühe orava järele ja kadus põõsastesse. Toomas otsis teda peaaegu tund aega ja küsis teistelt inimestelt abi. Lõpuks leidis üks tüdruk koera mänguväljaku juurest ja tõi ta Toomasele tagasi.',
    statements: [['Toomas läks parki koeraga.', true], ['Koer jooksis kassi järele.', false], ['Toomas otsis koera umbes tund aega.', true], ['Toomas leidis koera ise.', false], ['Koer oli mänguväljaku juures.', true]],
  },
  'a2b1-025': {
    heading: 'Kiri sõbrale',
    text: 'Tere, Mari! Eelmisel nädalal käisin lõpuks Tartus. Sõitsin sinna rongiga ja vaatasin teel aknast välja. Tartus külastasin teadusmuuseumi ja sõin väikeses kohvikus. Õhtul kohtusin vana sõbraga ja rääkisime kaua. Koju jõudsin alles hilja öösel, aga reis oli seda väärt. Kallistusi, Helen',
    statements: [['Helen käis Tartus eelmisel nädalal.', true], ['Ta sõitis Tartusse bussiga.', false], ['Ta käis Tartus muuseumis.', true], ['Õhtul oli Helen hotellis üksi.', false], ['Helen jõudis koju hilja.', true]],
  },
  'a2b1-026': {
    heading: 'Poenimekiri',
    text: 'Homme tulevad külalised, seega pean ostma: kaks pakki makarone, ühe purgi tomatikastet, pool kilo juustu, kuus tomatit ja ühe kurgi. Joogiks võtan kaks liitrit mahla. Magustoiduks ostan karbi jäätist. Leiba ei pea ostma, see on kodus olemas. Kokku võiks kõik maksta umbes kakskümmend eurot.',
    statements: [['Kirjutaja ostab kaks pakki makarone.', true], ['Ta ostab kilo juustu.', false], ['Joogiks ostab ta mahla.', true], ['Leib tuleb ka osta.', false], ['Ostud peaksid maksma umbes kakskümmend eurot.', true]],
  },
  'a2b1-027': {
    heading: 'Dialoog kohvikus',
    text: '— Tere! Mida te soovite?\n— Üks kohv piimaga ja üks tee, palun.\n— Kas soovite ka midagi süüa?\n— Jah, kaks juustusaia. Kas teil on ka midagi magusat?\n— Täna on meil õunakook.\n— Hästi, siis üks tükk õunakooki ka. Kas saab kaardiga maksta?\n— Muidugi. Kokku teeb üheksa eurot.',
    statements: [['Klient tellib kaks jooki.', true], ['Klient soovib kohvi ilma piimata.', false], ['Kohvikus on täna õunakook.', true], ['Klient maksab sularahas.', false], ['Kokku maksab tellimus üheksa eurot.', true]],
  },
  'a2b1-028': {
    heading: 'Retsept: pannkoogid',
    text: 'Pannkookide jaoks on vaja kaks muna, pool liitrit piima, kakssada grammi jahu, natuke suhkrut ja näputäis soola. Kõigepealt sega munad ja suhkur. Siis lisa piima ja jahu. Prae pannkooke kuumal pannil natukese õliga. Söö moosi või hapukoorega.',
    statements: [['Pannkookide jaoks on vaja kaks muna.', true], ['Piima on vaja üks liiter.', false], ['Kõigepealt segatakse munad ja suhkur.', true], ['Pannkooke praetakse ilma õlita.', false], ['Pannkooke võib süüa moosiga.', true]],
  },
  'a2b1-029': {
    heading: 'Dialoog restoranis',
    text: '— Vabandust, ma tellisin kanasalati, aga see on kalasalat.\n— Oi, vabandage väga! Ma toon kohe õige salati.\n— Aitäh. Ja minu sõbra supp on külm.\n— Ma soojendan selle kohe üles. Kas soovite vahepeal midagi juua?\n— Jah, palun kaks klaasi vett.\n— Muidugi. Täna on magustoit meie poolt tasuta.',
    statements: [['Klient sai vale salati.', true], ['Klient tellis kalasalati.', false], ['Sõbra supp oli liiga kuum.', false], ['Teenindaja vabandab ja parandab vea.', true], ['Magustoit on täna tasuta.', true]],
  },
  'a2b1-030': {
    heading: 'Arvustus internetis',
    text: 'Käisime eile sõbraga uues restoranis. Toit oli väga maitsev, eriti kalasupp. Kahjuks pidime pearooga ootama peaaegu tund aega. Teenindaja vabandas ja tõi meile tasuta kohvi. Hinnad on natuke kõrged, aga portsjonid on suured. Tuleme kindlasti tagasi, aga mitte väga kiirel päeval.',
    statements: [['Kirjutaja käis restoranis üksi.', false], ['Kalasupp oli väga hea.', true], ['Pearoog tuli kiiresti.', false], ['Teenindaja pakkus tasuta kohvi.', true], ['Kirjutaja tahab restorani tagasi minna.', true]],
  },
  'a2b1-031': {
    heading: 'Sõnum töökaaslasele',
    text: 'Tere, Anne! Ma ei tule täna tööle. Mul on öösest saati palavik ja kõht valutab. Ma lähen pärastlõunal arsti juurde. Kui homme on parem, siis tulen tööle, aga kindlasti ma seda veel ei tea. Palun ütle juhatajale, et koosolek tuleb ilma minuta pidada. Aitäh! Kaido',
    statements: [['Kaido on täna haige.', true], ['Kaidol valutab pea.', false], ['Kaido läheb arsti juurde.', true], ['Kaido tuleb homme kindlasti tööle.', false], ['Koosolek toimub ilma Kaidota.', true]],
  },
  'a2b1-032': {
    heading: 'Dialoog arsti juures',
    text: '— Mis teid häirib?\n— Mul on kolm päeva kurk valus ja ma köhin palju.\n— Kas teil on palavikku olnud?\n— Eile õhtul oli 38 kraadi.\n— Ma vaatan teie kurku. Jah, see on punane. Ma kirjutan teile ravimi. Võtke seda kolm korda päevas pärast sööki.\n— Kas ma võin tööle minna?\n— Parem on paar päeva kodus olla.',
    statements: [['Patsiendil on kurk valus.', true], ['Haigus algas eile.', false], ['Eile õhtul oli tal palavik.', true], ['Ravimit tuleb võtta enne sööki.', false], ['Arst soovitab paar päeva kodus puhata.', true]],
  },
  'a2b1-033': {
    heading: 'Nõuanded hea une jaoks',
    text: 'Mine magama iga päev samal ajal. Ära joo kohvi pärast kella nelja. Pane telefon tund aega enne magamaminekut ära. Hoia magamistuba jahe ja pime. Kui sa ei saa kaua magama jääda, tõuse üles ja loe raamatut. Ära söö õhtul väga hilja.',
    statements: [['Magama tuleks minna iga päev samal ajal.', true], ['Kohvi võib juua õhtul.', false], ['Telefon tuleb panna ära enne magamaminekut.', true], ['Magamistuba peaks olema soe ja valge.', false], ['Kui uni ei tule, võib raamatut lugeda.', true]],
  },
  'a2b1-034': {
    heading: 'Väike plaan',
    text: 'Sel kuul proovin ma kolme uut harjumust. Esiteks kõnnin iga päev vähemalt kolmkümmend minutit. Teiseks joon päeva jooksul rohkem vett ja vähem limonaadi. Kolmandaks lähen tööpäevadel magama hiljemalt kell üksteist. Kuu lõpus vaatan, mis mul õnnestus ja mis mitte.',
    statements: [['Kirjutaja proovib kolme uut harjumust.', true], ['Ta kõnnib iga päev vähemalt tund aega.', false], ['Ta tahab juua vähem limonaadi.', true], ['Nädalavahetusel läheb ta magama kell üksteist.', false], ['Kuu lõpus kontrollib ta oma tulemust.', true]],
  },
  'a2b1-035': {
    heading: 'Kiri perearstikeskusest',
    text: 'Lugupeetud patsient! Teie vereanalüüsi tulemused on valmis. Kõik näitajad on normis, ainult D-vitamiini on veidi vähe. Arst soovitab võtta D-vitamiini iga päev kolm kuud. Uus vereanalüüs on vaja teha jaanuaris. Aja saate broneerida telefonil või meie kodulehel.',
    statements: [['Vereanalüüsi tulemused on valmis.', true], ['Kõik näitajad on halvad.', false], ['Patsiendil on vähe D-vitamiini.', true], ['D-vitamiini tuleb võtta üks kuu.', false], ['Uue aja saab broneerida ka internetis.', true]],
  },
  'a2b1-036': {
    heading: 'Tunniplaan sõbrale',
    text: 'Minu teisipäev on päris pikk. Esimene tund on inglise keel, siis tuleb kaks tundi matemaatikat. Pärast lõunat on bioloogia, mis meeldib mulle kõige rohkem. Viimane tund on kehaline kasvatus ja see lõpeb kell neli. Pärast kooli lähen veel muusikakooli. Koju jõuan alles kell seitse.',
    statements: [['Teisipäeval on esimene tund inglise keel.', true], ['Matemaatikat on üks tund.', false], ['Kirjutajale meeldib bioloogia kõige rohkem.', true], ['Viimane tund lõpeb kell kolm.', false], ['Pärast kooli läheb ta muusikakooli.', true]],
  },
  'a2b1-037': {
    heading: 'Sõnum õpetajale',
    text: 'Tere, õpetaja! Ma tahan järgmisel nädalal eksamit teha, aga mul on veel raske kirjutada. Ma hakkan iga päev ühe teksti kirjutama. Kas te saaksite minu tekste kontrollida? Ma käin ka raamatukogus lugemas, sest kodus on liiga lärmakas. Aitäh, et aitate mind valmistuda! Olga',
    statements: [['Olga tahab järgmisel nädalal eksamit teha.', true], ['Kirjutamine on Olgale kerge.', false], ['Olga hakkab iga päev kirjutama.', true], ['Olga loeb kodus, sest seal on vaikne.', false], ['Olga palub õpetajal oma tekste kontrollida.', true]],
  },
  'a2b1-038': {
    heading: 'Kaks põhjust',
    text: 'Kuna mul on uus töö, pean ma eesti keelt paremini oskama. Ma õpin nüüd hommikuti, sest õhtul olen liiga väsinud. Bussis kuulan eestikeelseid taskuhäälinguid, kuna sõit kestab pool tundi. Nädalavahetusel ma ei õpi, sest siis olen perega. Selline plaan sobib mulle hästi.',
    statements: [['Kirjutajal on uus töö.', true], ['Ta õpib õhtuti, sest siis on tal aega.', false], ['Bussisõit kestab umbes pool tundi.', true], ['Nädalavahetusel õpib ta kõige rohkem.', false], ['Plaan sobib kirjutajale.', true]],
  },
  'a2b1-039': {
    heading: 'Foorumi küsimus ja vastus',
    text: 'Küsimus: Ma unustan uued sõnad kiiresti. Mida teha?\nVastus: Ära õpi korraga liiga palju sõnu. Võta päevas kümme sõna ja korda neid järgmisel päeval uuesti. Kirjuta iga sõnaga üks lause oma elust. Kasuta sõnakaarte telefonis, sest neid saab korrata ka bussis. Ja räägi uute sõnadega kellegagi.',
    statements: [['Küsijal on probleem sõnade meelespidamisega.', true], ['Vastaja soovitab õppida päevas sada sõna.', false], ['Sõnu tuleks järgmisel päeval korrata.', true], ['Iga sõnaga võiks kirjutada lause.', true], ['Sõnakaarte saab kasutada ainult kodus.', false]],
  },
  'a2b1-040': {
    heading: 'Sõnum kursusekaaslasele',
    text: 'Tere, Pille! Ma ei saanud eile tundi tulla, sest pidin kauem tööl olema. Kas sa saad mulle saata, mis oli kodutöö? Ma tahan selle enne reedet ära teha. Kui sul on aega, võiksime laupäeval koos korrata, kuna kontrolltöö on juba esmaspäeval. Aitäh! Kristel',
    statements: [['Kristel ei olnud eile tunnis.', true], ['Kristel oli haige.', false], ['Kristel tahab teha kodutöö enne reedet.', true], ['Kontrolltöö on laupäeval.', false], ['Kristel pakub koos kordamist.', true]],
  },
  'a2b1-041': {
    heading: 'Kes mida teeb?',
    text: 'Haiglas töötab palju inimesi. Õde mõõdab patsientide palavikku ja annab neile ravimeid. Arst vaatab patsiendid läbi ja paneb diagnoosi. Registraator vastab telefonile ja broneerib aegu. Koristaja hoiab palatid puhtana. Ilma nende kõigi koostööta haigla ei töötaks.',
    statements: [['Õde annab patsientidele ravimeid.', true], ['Registraator paneb diagnoosi.', false], ['Arst vaatab patsiendid läbi.', true], ['Koristaja vastab telefonile.', false], ['Haigla töö vajab koostööd.', true]],
  },
  'a2b1-042': {
    heading: 'Lühike CV-tekst',
    text: 'Olen töötanud viis aastat müüjana ja kaks aastat poe juhatajana. Müüjana teenindasin kliente ja korrastasin kaupa. Juhatajana koostasin töögraafikuid ja koolitasin uusi töötajaid. Oskan eesti, vene ja inglise keelt. Minu tugevad küljed on täpsus ja rahulik suhtlemine.',
    statements: [['Kirjutaja on töötanud müüjana viis aastat.', true], ['Juhatajana teenindas ta peamiselt kliente.', false], ['Ta koolitas uusi töötajaid.', true], ['Ta oskab kahte keelt.', false], ['Ta peab end täpseks inimeseks.', true]],
  },
  'a2b1-043': {
    heading: 'Töökuulutus',
    text: 'Kohvik „Päike” otsib teenindajat! Ootame, et oskad kliente sõbralikult teenindada ja oled valmis töötama ka nädalavahetusel. Eesti keelt on vaja rääkida igapäevasel tasemel. Kogemus ei ole kohustuslik, me õpetame. Kandideerimiseks saada lühike kiri ja kirjelda, miks tahad meie juures töötada.',
    statements: [['Kohvik otsib teenindajat.', true], ['Nädalavahetusel ei pea töötama.', false], ['Eesti keelt on tööks vaja.', true], ['Ilma kogemuseta ei saa kandideerida.', false], ['Kandidaat peab saatma lühikese kirja.', true]],
  },
  'a2b1-044': {
    heading: 'Intervjuu algus',
    text: '— Tere tulemast! Palun rääkige natuke endast.\n— Tere! Minu nimi on Igor. Olen töötanud kolm aastat laos.\n— Miks soovite meie juures töötada?\n— Mulle meeldib klientidega suhelda ja tahan proovida midagi uut.\n— Kas saate töötada ka õhtuti?\n— Jah, kolm õhtut nädalas sobib mulle hästi.',
    statements: [['Igor on töötanud laos.', true], ['Igor on töötanud klienditeeninduses viis aastat.', false], ['Igorile meeldib suhelda klientidega.', true], ['Igor ei saa õhtuti töötada.', false], ['Igorile sobib töötada kolm õhtut nädalas.', true]],
  },
  'a2b1-045': {
    heading: 'Vastus kandidaadile',
    text: 'Tere, Natalja! Täname teid kandideerimast klienditeenindaja kohale. Meile meeldis teie kiri ja kogemus. Kutsume teid vestlusele neljapäeval kell kümme. Palun võtke kaasa isikut tõendav dokument. Kui see aeg ei sobi, andke meile teada kolmapäeva lõunaks. Lugupidamisega, personalijuht Kärt',
    statements: [['Natalja kandideeris klienditeenindaja kohale.', true], ['Natalja kutsutakse vestlusele.', true], ['Vestlus on kolmapäeval.', false], ['Kaasa tuleb võtta isikut tõendav dokument.', true], ['Kui aeg ei sobi, võib sellest teatada reedel.', false]],
  },
  'a2b1-046': {
    heading: 'Bussijaama teadaanne',
    text: 'Tähelepanu! Kell 14.30 väljuv buss Pärnusse väljub täna perroonilt number neli. Buss Viljandisse hilineb umbes kakskümmend minutit. Pileteid saab osta automaadist või bussijuhilt, kuid bussijuhilt ostes on pilet kallim. Palume reisijatel võtta pagas kaasa ja mitte jätta seda järelevalveta.',
    statements: [['Pärnu buss väljub perroonilt neli.', true], ['Viljandi buss väljub õigel ajal.', false], ['Pileteid saab osta automaadist.', true], ['Bussijuhilt ostetud pilet on odavam.', false], ['Pagasit ei tohi jätta järelevalveta.', true]],
  },
  'a2b1-047': {
    heading: 'Sõnumid reisi kohta',
    text: 'Eva: Kas me sõidame Pärnusse rongi või autoga?\nKaarel: Autoga oleks kiirem, aga parkimine on kallis.\nEva: Rong on odavam ja saab teel lugeda.\nKaarel: Hästi, võtame rongi. Kas hotelli broneerime kaheks ööks?\nEva: Jah, reedest pühapäevani. Ma vaatan mere ääres midagi.\nKaarel: Super!',
    statements: [['Eva ja Kaarel plaanivad reisi Pärnusse.', true], ['Kaarel arvab, et parkimine on odav.', false], ['Nad otsustavad sõita rongiga.', true], ['Nad broneerivad hotelli üheks ööks.', false], ['Eva otsib hotelli mere ääres.', true]],
  },
  'a2b1-048': {
    heading: 'Reisipäevikust',
    text: 'Eelmisel suvel käisime perega Lätis. Sõitsime autoga ja peatusime kõigepealt Siguldas. Seal ronisime lossitorni ja sõime piknikku. Teisel päeval sõitsime Riiga ja jalutasime vanalinnas. Kahjuks sadas terve päeva vihma. Õhtul sõime ühes väikeses restoranis. Koju jõudsime väsinult, aga rahulolevalt.',
    statements: [['Pere käis Lätis eelmisel suvel.', true], ['Nad sõitsid Lätti rongiga.', false], ['Esimesena peatusid nad Siguldas.', true], ['Riias oli ilus päikeseline ilm.', false], ['Reis meeldis perele.', true]],
  },
  'a2b1-049': {
    heading: 'Sõnum lennujaamast',
    text: 'Ema, mu lend hilineb! Lennuk pidi väljuma kell kuus, aga nüüd väljub alles kell üheksa. Põhjus on tugev tuul. Lennufirma andis meile söögikupongid, nii et ma söön praegu lennujaamas. Tallinnasse jõuan umbes kell üksteist õhtul. Palun ära oota mind lennujaamas, võtan takso.',
    statements: [['Lend hilineb umbes kolm tundi.', true], ['Hilinemise põhjus on lumi.', false], ['Lennufirma andis reisijatele söögikupongid.', true], ['Ta jõuab Tallinnasse hommikul.', false], ['Ta läheb lennujaamast koju taksoga.', true]],
  },
  'a2b1-050': {
    heading: 'Kiri hotellile',
    text: 'Tere! Mul on teie hotellis broneering kolmeks ööks alates reedest. Kahjuks hilineb mu rong ja jõuan hotelli alles pärast südaööd. Kas keegi on siis vastuvõtus? Kui ei ole, kas saaksin võtme kuidagi teisiti kätte? Samuti soovin hommikusööki ainult laupäeval ja pühapäeval. Aitäh! Veronika',
    statements: [['Veronikal on broneering kolmeks ööks.', true], ['Veronika jõuab hotelli enne südaööd.', false], ['Ta küsib, kuidas võtme kätte saab.', true], ['Ta soovib hommikusööki igal hommikul.', false], ['Veronika sõidab hotelli rongiga.', true]],
  },
};

// [situation text block, five statements] for a lesson, or null when the lesson keeps its own opening
export function openerBlocks(lessonId) {
  const opener = OPENERS[lessonId];
  if (!opener) return null;
  const key = lessonId.replace(/[^a-z0-9]/gi, '_');
  return [
    // one line per message / reply: the text block makes a paragraph of each blank-line-separated part
    block(`${key}_av_situation`, 'text', 'cream', 'g_read', { heading: opener.heading, text: opener.text.replace(/\n/g, '\n\n') }, 'full'),
    block(`${key}_av_check`, 'truefalse', 'sky', 'g_read', {
      title: 'Loe olukorda. Kas väide on õige?',
      instruction: 'Märgi Õ, kui väide on õige, ja V, kui vale.',
      statements: opener.statements.map(([text, ok]) => ({ text, answer: ok ? 'true' : 'false' })),
    }),
  ];
}
