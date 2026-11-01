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
};
