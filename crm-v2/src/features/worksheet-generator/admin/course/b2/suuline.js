// B2 course (B1 → B2), supplement „Suuline osa”: see ../suuline.js.
import { oralLesson } from '../suuline.js';

export const MODULE = { id: 'b1b2-suuline-01', course: 'b2', title: 'Suuline osa', level: 'B1+', design: 'v2', supplement: true };

const LEVEL = {
  talk: '2–3 minutit',
  seconds: [120, 240],
  links: { why: 'sest, kuna, mistõttu, nimelt, see tähendab, et', example: 'näiteks, seda näitab see, et, minu kogemuse järgi', end: 'seega, järelikult, kokkuvõttes, sellest järeldub, et' },
  homework: { words: '170–190', instruction: 'Vali üks väide ja kirjuta sidus tekst: pealkiri, väide, kaks selgitust koos konkreetse näitega, järeldus.', sentences: [8, 16] },
};
const lesson = (id, spec) => oralLesson(id, LEVEL, spec);

export const LESSONS = {
  'b1b2-s01': lesson('s01', {
    title: 'Töö ja ühiskond',
    canDo: 'Ma arendan väite selgeks mõttekäiguks töö teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Hea juht oskab oma meeskonda kuulata.', 'Töötajad näevad igapäevaseid probleeme kõige paremini, mistõttu jääb ilma nende arvamuseta oluline info kasutamata.', 'Näiteks muutus ühes logistikafirmas tööplaan alles siis tõhusaks, kui juht autojuhtidelt nõu küsis.', 'Järelikult ei ole kuulamine nõrkuse märk, vaid juhtimise osa.'],
    claims: [
      { text: 'Karjäär ei peaks olema elu tähtsaim eesmärk.', q: ['mida võib inimene karjääri nimel kaotada?', 'milline valik seda hästi näitab?', 'kuidas tasakaalu leida?'], words: 'prioriteedid, eneseteostus, ohverdama', counter: 'Aga kas töö ei anna paljudele inimestele elu mõtte?' },
      { text: 'Palk peaks olema kõigis ettevõtetes avalik.', q: ['mida muudaks avalik palk?', 'millises olukorras oleks sellest kasu?', 'mis tingimustel see toimiks?'], words: 'läbipaistvus, palgalõhe, kadedus', counter: 'Aga kas palk ei ole inimese eraasi?' },
      { text: 'Automatiseerimine võtab rohkem töökohti, kui see loob.', words: 'ümberõpe, tehisintellekt, tööturg', counter: 'Aga kas varasemad tehnoloogiad ei loonud lõpuks rohkem tööd?' },
      { text: 'Töö- ja eraelu tasakaal sõltub rohkem tööandjast kui töötajast.', words: 'ületunnid, paindlikkus, piire seadma', counter: 'Aga kas töötaja ei saa ise „ei” öelda?' },
      { text: 'Tööandja ei tohiks küsida, mida töötaja vabal ajal teeb.', counter: 'Aga kui see mõjutab firma mainet?' },
    ],
  }),
  'b1b2-s02': lesson('s02', {
    title: 'Haridus',
    canDo: 'Ma arendan väite selgeks mõttekäiguks hariduse teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Lugemisoskus on kogu õppimise alus.', 'Kes ei mõista keerulist teksti, sellel on raske omandada ka teisi aineid.', 'Näiteks ei lahenda õpilane matemaatikaülesannet, kui ta ei saa selle sõnastusest aru.', 'Seega peaks lugemisele pöörama tähelepanu igas õppeaines.'],
    claims: [
      { text: 'Hinded ei näita õpilase tegelikke teadmisi.', q: ['mida hinne tegelikult mõõdab?', 'milline olukord seda näitab?', 'millega võiks hindeid täiendada?'], words: 'pähe õppima, tagasiside, võrdlema', counter: 'Aga kuidas siis ülikool õpilasi valib?' },
      { text: 'Kõrgharidus ei ole enam edu tagatis.', q: ['mis on tööturul muutunud?', 'keda tead, kes on teise teed läinud?', 'mida tasub noorel enne valikut kaaluda?'], words: 'diplom, kutseõpe, kogemus', counter: 'Aga kas kõrgharidusega inimesed ei teeni keskmiselt rohkem?' },
      { text: 'Kool peaks õpetama rohkem praktilisi oskusi.', words: 'rahatarkus, õppekava, üldharidus', counter: 'Aga kas selle arvelt kaovad teised ained?' },
      { text: 'Õpetaja amet väärib suuremat tunnustust.', words: 'õpetajate puudus, palk, vastutus', counter: 'Aga kas kõrgem palk teeb õpetaja ka paremaks?' },
      { text: 'Mitmekeelne kool rikastab ühiskonda.', counter: 'Aga kas õpilaste emakeel ei jää siis tahaplaanile?' },
    ],
  }),
  'b1b2-s03': lesson('s03', {
    title: 'Keskkond',
    canDo: 'Ma arendan väite selgeks mõttekäiguks keskkonna teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Toidu raiskamine on üks suuremaid keskkonnaprobleeme.', 'Iga äraviskamine tähendab, et ka selle tootmiseks kulunud vesi ja energia läksid raisku.', 'Näiteks jääb paljudes kodudes leib kuivama, kuigi selle saaks sügavkülma panna.', 'Seega saab igaüks keskkonda aidata juba läbimõeldud ostudega.'],
    claims: [
      { text: 'Kliimamuutustega võitlemine on eelkõige riikide ja suurettevõtete vastutus.', q: ['kui suur on üksikisiku mõju?', 'milline otsus muudaks kõige rohkem?', 'mis jääb siiski inimese enda teha?'], words: 'heitkogused, seadus, tarbija', counter: 'Aga kes suurettevõtete tooteid ostab?' },
      { text: 'Lennureisid peaksid olema kallimad.', q: ['miks praegune hind ei ole aus?', 'kuidas muutuks reisimine?', 'mis oleks hea alternatiiv?'], words: 'keskkonnamaks, rong, odavlennud', counter: 'Aga kas reisimine jääb siis ainult rikastele?' },
      { text: 'Elektriautod ei lahenda linnade transpordiprobleeme.', words: 'ummikud, ühistransport, ruum', counter: 'Aga kas puhtam õhk ei ole juba suur võit?' },
      { text: 'Keskkonnateadlikkust tuleb õpetada juba lasteaias.', words: 'harjumused, eeskuju, vanemad', counter: 'Aga kas väike laps sellest üldse aru saab?' },
      { text: 'Rohepööre on majandusele rohkem võimalus kui koorem.', counter: 'Aga kes maksab kinni kõrgemad energiahinnad?' },
    ],
  }),
  'b1b2-s04': lesson('s04', {
    title: 'Meedia',
    canDo: 'Ma arendan väite selgeks mõttekäiguks meedia teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Ajakirjandusel on demokraatias asendamatu roll.', 'Just ajakirjanikud kontrollivad, kas võimulolijad täidavad oma lubadusi.', 'Näiteks on mitmed korruptsioonijuhtumid tulnud avalikuks tänu uurivale ajakirjandusele.', 'Järelikult on sõltumatu meedia ühiskonnale vajalik, isegi kui selle kriitika on ebamugav.'],
    claims: [
      { text: 'Uudistest ei saa enam maailmast objektiivset pilti.', q: ['mis mõjutab uudiste valikut?', 'milline uudis on sulle meelde jäänud?', 'kuidas saab lugeja end kaitsta?'], words: 'klikipealkiri, allikas, algoritm', counter: 'Aga kas varem oli uudistes tõesti rohkem objektiivsust?' },
      { text: 'Valeinfo levitajad peavad oma tegude eest vastutama.', q: ['millist kahju valeinfo teeb?', 'milline juhtum seda näitab?', 'kes peaks selle eest vastutama?'], words: 'sõnavabadus, kontrollima, trahv', counter: 'Aga kes otsustab, mis on valeinfo?' },
      { text: 'Reklaam mõjutab meie otsuseid rohkem, kui tunnistame.', words: 'alateadlik, sihtgrupp, mõjuisik', counter: 'Aga kas inimene ei vali lõpuks ikka ise?' },
      { text: 'Sotsiaalmeedia on muutnud poliitika pinnapealsemaks.', words: 'lühivideo, valimised, loosung', counter: 'Aga kas see ei too poliitika noortele lähemale?' },
      { text: 'Meediakriitikat tuleks õpetada koolis eraldi õppeainena.', counter: 'Aga kas seda ei saaks õpetada teiste ainete sees?' },
    ],
  }),
  'b1b2-s05': lesson('s05', {
    title: 'Kogukond ja ühiskond',
    canDo: 'Ma arendan väite selgeks mõttekäiguks ühiskonna teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Raamatukogu ei ole ainult raamatute koht.', 'Paljudes väikelinnades on see kujunenud kohaks, kus inimesed kohtuvad ja saavad tasuta internetti kasutada.', 'Näiteks käivad eakad raamatukogus arvutikursustel.', 'Seega täidab raamatukogu kogukonnas ka sotsiaalset rolli.'],
    claims: [
      { text: 'Tugev kohalik kogukond parandab inimese elukvaliteeti.', q: ['mida annab kogukond inimesele?', 'milline algatus on sulle tuttav?', 'kuidas uus elanik saab kaasa lüüa?'], words: 'turvatunne, algatus, naabrid', counter: 'Aga kui inimene hindab rohkem privaatsust?' },
      { text: 'Vanemaealised on tööturul alahinnatud.', q: ['milles nad on tugevad?', 'milline olukord seda näitab?', 'mida peaks tööandja muutma?'], words: 'kogemus, eelarvamus, ümberõpe', counter: 'Aga kas noored ei õpi uut tehnoloogiat kiiremini?' },
      { text: 'Maapiirkondade tühjenemist ei ole võimalik peatada.', words: 'töökohad, teenused, kaugtöö', counter: 'Aga kas kaugtöö ei too inimesi maale tagasi?' },
      { text: 'Vabatahtlik töö peaks olema koolis kohustuslik.', words: 'vastutustunne, kohustus, kogemus', counter: 'Aga kas sundus ei tee vabatahtlikust tööst vastandit?' },
      { text: 'Kakskeelsus on lapsele suur eelis.', counter: 'Aga kas laps ei jää siis kummaski keeles nõrgaks?' },
    ],
  }),
  'b1b2-s06': lesson('s06', {
    title: 'Tehnoloogia ja tehisintellekt',
    canDo: 'Ma arendan väite selgeks mõttekäiguks tehnoloogia teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Digitaalne allkiri on muutnud asjaajamise lihtsamaks.', 'Inimene ei pea enam ametiasutuses kohal käima, mistõttu säästab ta aega ja raha.', 'Näiteks saab Eestis lepingu allkirjastada ka teisest riigist.', 'Järelikult tasub kasulike digilahenduste kasutamist õpetada kõikidele põlvkondadele.'],
    claims: [
      { text: 'Tehisintellekt ei tohiks teha otsuseid inimeste asemel.', q: ['milliste otsuste puhul on see ohtlik?', 'milline olukord seda näitab?', 'kus jookseb piir?'], words: 'vastutus, algoritm, erapooletu', counter: 'Aga kas ka inimene ei tee otsustades vigu?' },
      { text: 'Andmete kogumine on liiga kõrge hind tasuta teenuste eest.', q: ['mida ettevõtted meie kohta teavad?', 'kuidas see igapäevaelus avaldub?', 'mida saab inimene ise teha?'], words: 'privaatsus, nõusolek, sihitud reklaam', counter: 'Aga kas enamik inimesi ei ole selle hinnaga rahul?' },
      { text: 'Õpilased peaksid õppima tehisintellekti kasutama, mitte seda vältima.', words: 'plagiaat, kriitiline mõtlemine, tööriist', counter: 'Aga kas õpilane siis ise enam mõtlema ei õpi?' },
      { text: 'Pidev kättesaadavus teeb inimesed väsinuks.', words: 'teavitus, piirid, puhkeaeg', counter: 'Aga kas see ei ole lihtsalt iga inimese enda valik?' },
      { text: 'Tehnoloogia suurendab ühiskonna ebavõrdsust.', counter: 'Aga kas internet ei ole teinud teadmised kõigile kättesaadavaks?' },
    ],
  }),
  'b1b2-s07': lesson('s07', {
    title: 'Tervis ja tervishoid',
    canDo: 'Ma arendan väite selgeks mõttekäiguks tervise teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Vaimne tervis väärib sama palju tähelepanu kui füüsiline.', 'Pikaajaline stress mõjutab nii töövõimet kui ka keha, kuid sellest räägitakse endiselt vähe.', 'Näiteks ei julge paljud töötajad öelda, et vajavad läbipõlemise tõttu puhkust.', 'Seega tuleks psühholoogi juures käimine muuta sama tavaliseks kui arstivisiit.'],
    claims: [
      { text: 'Ennetus on tervishoius tähtsam kui ravi.', q: ['miks ennetus end ära tasub?', 'milline näide seda kinnitab?', 'kes peaks selle eest maksma?'], words: 'sõeluuring, eluviis, kulud', counter: 'Aga kas haige inimene ei ole praegu olulisem?' },
      { text: 'Pikad järjekorrad arsti juurde õõnestavad usaldust riigi vastu.', q: ['millised on järjekordade tagajärjed?', 'milline olukord on sulle tuttav?', 'mis võiks olukorda parandada?'], words: 'eriarst, erakliinik, ebavõrdsus', counter: 'Aga kas tervishoiul on piisavalt raha, et seda muuta?' },
      { text: 'Suhkrumaks on õigustatud.', words: 'rasvumine, valikuvabadus, hind', counter: 'Aga kas riik tohib otsustada, mida inimene sööb?' },
      { text: 'Kaugkonsultatsioon ei asenda arsti vastuvõttu.', words: 'läbivaatus, maapiirkond, mugavus', counter: 'Aga kas maal elavale inimesele ei ole see parem kui mitte midagi?' },
      { text: 'Sportimise eest peaks saama maksusoodustust.', counter: 'Aga kas sellest ei võida peamiselt need, kes juba spordivad?' },
    ],
  }),
  'b1b2-s08': lesson('s08', {
    title: 'Majandus ja tarbimine',
    canDo: 'Ma arendan väite selgeks mõttekäiguks majanduse teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Kiirmood on keskkonnale kallis.', 'Odavaid riideid toodetakse suurtes kogustes, mistõttu kulub palju vett ja tekib palju jäätmeid.', 'Näiteks kannavad paljud inimesed odavat särki vaid paar korda.', 'Järelikult tasub osta vähem, aga paremaid riideid.'],
    claims: [
      { text: 'Väikeettevõtted on kohaliku elu selgroog.', q: ['mida annavad need piirkonnale?', 'milline ettevõte on sulle tuttav?', 'kuidas neid toetada?'], words: 'töökohad, kohalik toode, suurketid', counter: 'Aga kas suurketid ei paku odavamaid hindu?' },
      { text: 'Sularaha kaotamine oleks viga.', q: ['kellele sularaha on vajalik?', 'milline olukord seda näitab?', 'mis on digimaksete eelised?'], words: 'eakad, privaatsus, tõrge', counter: 'Aga kas sularaha ei soodusta varimajandust?' },
      { text: 'Kodu ostmine on noortele muutunud kättesaamatuks.', words: 'sissemakse, kinnisvarahind, üür', counter: 'Aga kas kodu peab üldse olema oma, mitte üüritud?' },
      { text: 'Reklaam lastele suunatud saadetes tuleks keelata.', words: 'mõjutatav, vanemad, sõnavabadus', counter: 'Aga kas vanemad ei peaks seda ise jälgima?' },
      { text: 'Neljapäevane töönädal tuleks majandusele kasuks.', counter: 'Aga kuidas see sobib haigla või poe tööga?' },
    ],
  }),
  'b1b2-s09': lesson('s09', {
    title: 'Kultuur ja keel',
    canDo: 'Ma arendan väite selgeks mõttekäiguks kultuuri teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Laulupidu on Eesti identiteedi tähtis osa.', 'See toob kokku eri põlvkonnad ja tuletab meelde ühist ajalugu.', 'Näiteks laulavad samal laval vanaema ja lapselaps.', 'Seega ei ole laulupidu pelgalt kontsert, vaid ühiskonda siduv sündmus.'],
    claims: [
      { text: 'Väikese rahva keel vajab seaduslikku kaitset.', q: ['mis ohustab väikest keelt?', 'milline valdkond seda näitab?', 'mida peaks riik tegema?'], words: 'keeleseadus, ingliskeelsus, teadus', counter: 'Aga kas seadusega saab inimeste keelekasutust muuta?' },
      { text: 'Kultuur peab olema riigi toetatud.', q: ['miks turg üksi ei piisa?', 'milline näide seda kinnitab?', 'kes otsustab, mida toetada?'], words: 'teater, toetus, maksumaksja', counter: 'Aga miks peab kõik selle eest maksma, kes teatris ei käi?' },
      { text: 'Ingliskeelsed laensõnad rikastavad eesti keelt, mitte ei ohusta seda.', words: 'laensõna, oma sõna, noored', counter: 'Aga kas eestikeelsed sõnad ei jää siis unustusse?' },
      { text: 'Ajaloo mälestusmärgid tuleb säilitada ka siis, kui need on vastuolulised.', words: 'mälu, kontekst, muuseum', counter: 'Aga kui mälestusmärk haavab paljusid inimesi?' },
      { text: 'Raamatute lugemine on tänapäeval eriti väärtuslik.', counter: 'Aga kas taskuhääling ei anna sama palju?' },
    ],
  }),
  'b1b2-s10': lesson('s10', {
    title: 'Ränne ja lõimumine',
    canDo: 'Ma arendan väite selgeks mõttekäiguks rände teemal: selgitan, toon näite ja teen järelduse.',
    model: ['Lõimumine algab kohtumistest, mitte seadustest.', 'Inimene hakkab end riigi osana tundma alles siis, kui tal on siin suhteid ja usaldust.', 'Näiteks aitab ühine koorilaul või spordivõistlus naabritel üksteist paremini tundma õppida.', 'Järelikult tuleks toetada neid kohti, kus eri taustaga inimesed saavad kokku.'],
    claims: [
      { text: 'Eesti majandus vajab välistööjõudu.', q: ['millistes valdkondades on puudus?', 'milline näide seda kinnitab?', 'millised tingimused peaksid kehtima?'], words: 'tööjõupuudus, rahvastik, palk', counter: 'Aga kas see ei hoia palku madalal?' },
      { text: 'Keeleoskus peaks olema töökoha eeltingimus.', q: ['milliste ametite puhul on see vältimatu?', 'milline olukord seda näitab?', 'mis saab siis, kui nõue on liiga range?'], words: 'klienditeenindus, ohutus, kursus', counter: 'Aga kas töökohal ei õpi keelt kiiremini?' },
      { text: 'Kodakondsus ei tohiks sõltuda ainult keeleeksamist.', words: 'lojaalsus, eksam, eakad', counter: 'Aga mis siis veel näitaks, et inimene on riigiga seotud?' },
      { text: 'Noorte lahkumine välismaale rikastab lõpuks ka kodumaad.', words: 'kogemus, ajude äravool, tagasipöördumine', counter: 'Aga kui nad kunagi tagasi ei tule?' },
      { text: 'Ühine kool on lõimumise parim tööriist.', counter: 'Aga kas õpetajaid ja õppematerjale jätkub?' },
    ],
  }),
};
