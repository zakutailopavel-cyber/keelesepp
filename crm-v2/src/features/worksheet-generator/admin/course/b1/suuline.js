// B1 course (A2 → B1), supplement „Suuline osa”: see ../suuline.js.
import { oralLesson } from '../suuline.js';

export const MODULE = { id: 'a2b1-suuline-01', course: 'b1', title: 'Suuline osa', level: 'B1', design: 'v2', supplement: true };

const LEVEL = {
  talk: '2 minutit',
  seconds: [120, 240],
  links: { why: 'sest, kuna, sellepärast, mistõttu', example: 'näiteks, minu kogemuse järgi, seda näitab see, et', end: 'seega, järelikult, kokkuvõttes' },
  homework: { words: '100–120', instruction: 'Vali üks väide ja kirjuta sidus tekst: väide, selgitus, üks konkreetne näide, järeldus.', sentences: [6, 12] },
};
const lesson = (id, spec) => oralLesson(id, LEVEL, spec);

export const LESSONS = {
  'a2b1-s01': lesson('s01', {
    title: 'Töö ja karjäär',
    canDo: 'Ma põhjendan oma arvamust töö teemal ja toon näite oma elust.',
    model: ['Uus töökoht nõuab alguses palju julgust.', 'Kõik on võõras: inimesed, reeglid ja töövahendid, mistõttu tundub esimene nädal raske.', 'Näiteks ei julgenud ma oma esimesel töönädalal kolleegidelt midagi küsida.', 'Seega tasub kohe alguses abi küsida, sest nii läheb sisseelamine kiiremini.'],
    claims: [
      { text: 'Hea kolleeg on tähtsam kui kõrge palk.', q: ['miks mõjutavad kolleegid töörõõmu?', 'milline olukord on sul meeles?', 'mille järgi tasub töökohta valida?'], words: 'õhkkond, töörõõm, koostöö', counter: 'Aga kui palgast ei jätku üüri maksmiseks?' },
      { text: 'Igaüks peaks vähemalt kord elus töökohta vahetama.', q: ['mida annab töökoha vahetus?', 'kes on seda teinud ja mis juhtus?', 'millal on õige aeg vahetada?'], words: 'kogemus, oskused, risk', counter: 'Aga kui inimene on oma töökohas õnnelik?' },
      { text: 'Uue töö leiab kõige kergemini tutvuste kaudu.', words: 'soovitus, kuulutus, usaldus', counter: 'Aga kui inimene on alles Eestisse kolinud?' },
      { text: 'Neljapäevane töönädal teeks inimesed õnnelikumaks.', words: 'vaba aeg, tootlikkus, stress', counter: 'Aga kes teeb siis ära sama palju tööd?' },
      { text: 'Kodust töötamine ei sobi kõigile.', counter: 'Aga kas see ei säästa inimese aega ja raha?' },
    ],
  }),
  'a2b1-s02': lesson('s02', {
    title: 'Õppimine ja keel',
    canDo: 'Ma põhjendan oma arvamust õppimise teemal ja toon näite oma elust.',
    model: ['Raamatute lugemine aitab keelt õppida.', 'Raamatus kohtame uusi sõnu ja näeme, kuidas neid lauses kasutatakse.', 'Näiteks õppisin ma ühest lasteraamatust palju igapäevaseid väljendeid.', 'Seega tasub alustada lihtsatest raamatutest.'],
    claims: [
      { text: 'Keelt õpib kõige paremini riigis, kus seda räägitakse.', q: ['miks on see tõhus?', 'milline olukord seda näitab?', 'mida saab teha, kui kohe sinna minna ei saa?'], words: 'igapäevane suhtlus, kuulma, julgus', counter: 'Aga miks mõned inimesed ei õpi keelt ka pärast kümmet aastat?' },
      { text: 'Õppimine ei lõpe kooliga.', q: ['miks peab täiskasvanu edasi õppima?', 'mida sina või su tuttav on hiljuti õppinud?', 'kuidas õppimiseks aega leida?'], words: 'täienduskoolitus, uued oskused, areng', counter: 'Aga kui inimesel pole pärast tööd enam jõudu?' },
      { text: 'Kodutööd on õpilastele kasulikud.', words: 'kordamine, iseseisvus, vaba aeg', counter: 'Aga kui laps istub kodutööde taga kolm tundi?' },
      { text: 'Vigade tegemine on õppimise tähtis osa.', words: 'julgema, parandama, meelde jääma', counter: 'Aga kas sagedased vead ei jää külge?' },
      { text: 'Internetist saab õppida sama hästi kui klassis.', counter: 'Aga kes hoiab siis õppija motivatsiooni?' },
    ],
  }),
  'a2b1-s03': lesson('s03', {
    title: 'Tervis ja eluviis',
    canDo: 'Ma põhjendan oma arvamust tervise teemal ja toon näite oma elust.',
    model: ['Uni on tervise jaoks sama tähtis kui toit.', 'Kui inimene magab liiga vähe, on tal raske keskenduda ja ta väsib kiiresti.', 'Näiteks teen ma pärast halba ööd töös rohkem vigu.', 'Seega tuleks minna õhtul õigel ajal magama.'],
    claims: [
      { text: 'Tervislik eluviis ei pea olema kallis.', q: ['miks arvatakse, et see on kallis?', 'mis on odav ja kasulik?', 'millest saab igaüks alustada?'], words: 'jalutamine, koduköök, spordiklubi', counter: 'Aga kas värske toit ei ole kallim kui kiirtoit?' },
      { text: 'Liiga palju tööd teeb inimese haigeks.', q: ['kuidas mõjub ületöötamine kehale?', 'milline olukord on sulle tuttav?', 'mida peaks inimene õigel ajal märkama?'], words: 'stress, läbipõlemine, puhkus', counter: 'Aga kui lisatööd on raha jaoks vaja?' },
      { text: 'Igaüks vastutab oma tervise eest ise.', words: 'arst, harjumused, ennetamine', counter: 'Aga kas riik ei pea ka midagi tegema?' },
      { text: 'Liikumine on parim ravim stressi vastu.', words: 'tuju, pinge, värske õhk', counter: 'Aga kui inimene on selleks liiga väsinud?' },
      { text: 'Kiirtoit tuleks koolide lähedusest ära viia.', counter: 'Aga kas noor ei peaks ise valima?' },
    ],
  }),
  'a2b1-s04': lesson('s04', {
    title: 'Keskkond ja linn',
    canDo: 'Ma põhjendan oma arvamust keskkonna teemal ja toon näite oma elust.',
    model: ['Prügi sorteerimine on lihtne viis keskkonda hoida.', 'See ei nõua palju aega, kuid vähendab prügi hulka.', 'Näiteks viib meie pere pakendid ja paberi eraldi konteineritesse.', 'Seega saab igaüks kodus midagi ära teha.'],
    claims: [
      { text: 'Linnades peaks olema vähem autosid.', q: ['mida annab linnale vähem autosid?', 'milline koht või tänav seda näitab?', 'mida tuleks autode asemel pakkuda?'], words: 'õhk, müra, kergliiklustee', counter: 'Aga kuidas jõuab tööle lapsevanem, kes viib lapsed lasteaeda?' },
      { text: 'Väikesed igapäevased harjumused aitavad loodust hoida.', q: ['miks on väikesed harjumused olulised?', 'mida sina või su pere teeb?', 'millest võiks täna alustada?'], words: 'kilekott, elekter, vesi', counter: 'Aga kas tehased ei saasta palju rohkem?' },
      { text: 'Asjade parandamine on parem kui uue ostmine.', words: 'jäätmed, töökoda, kokku hoidma', counter: 'Aga kui parandamine maksab peaaegu sama palju?' },
      { text: 'Maal elamine on linnast tervislikum.', words: 'looduse lähedal, teenused, vahemaa', counter: 'Aga kui arstini on viiskümmend kilomeetrit?' },
      { text: 'Ühistransport peaks olema kõigile tasuta.', counter: 'Aga kes selle eest siis maksab?' },
    ],
  }),
  'a2b1-s05': lesson('s05', {
    title: 'Tehnoloogia ja suhted',
    canDo: 'Ma põhjendan oma arvamust tehnoloogia teemal ja toon näite oma elust.',
    model: ['Videokõned on perekonna jaoks väga kasulikud.', 'Inimesed saavad üksteist näha ka siis, kui nad elavad eri riikides.', 'Näiteks räägin ma iga pühapäev videokõne kaudu oma emaga.', 'Seega aitab tehnoloogia lähedastega sidet hoida.'],
    claims: [
      { text: 'Telefon on muutnud perede suhtlemist.', q: ['mis on peres teistmoodi kui varem?', 'milline olukord on sulle tuttav?', 'millised reeglid võiksid aidata?'], words: 'õhtusöök, tähelepanu, sõnum', counter: 'Aga kas telefon ei hoia ka peret ühenduses?' },
      { text: 'Internetis ei saa tõelisi sõpru leida.', q: ['mis on sõpruses kõige tähtsam?', 'kas tead vastupidist lugu?', 'mida peab internetis ettevaatlikult tegema?'], words: 'usaldus, kohtumine, huvid', counter: 'Aga kui inimesel on samad huvid ja nad räägivad iga päev?' },
      { text: 'Lastel ei tohiks enne kümnendat eluaastat nutitelefoni olla.', words: 'turvalisus, sõltuvus, helistama', counter: 'Aga kuidas laps siis vanematele helistab?' },
      { text: 'Veebipoed ohustavad väikeseid poode.', words: 'hind, klienditeenindus, kesklinn', counter: 'Aga kas väike pood ei saa ka ise veebis müüa?' },
      { text: 'Reisimine muudab inimest avatumaks.', counter: 'Aga kas kõik reisijad tahavad midagi uut näha?' },
    ],
  }),
  'a2b1-s06': lesson('s06', {
    title: 'Raha ja tarbimine',
    canDo: 'Ma põhjendan oma arvamust raha teemal ja toon näite oma elust.',
    model: ['Eelarve aitab raha paremini kasutada.', 'Kui inimene kirjutab kulud üles, näeb ta kohe, kuhu tema raha kaob.', 'Näiteks märkasin ma, et kulutan kuus liiga palju väljas söömisele.', 'Seega tasub oma kulusid vähemalt üks kuu jälgida.'],
    claims: [
      { text: 'Lapsed peaksid juba koolieas raha kohta õppima.', q: ['mida peaks laps raha kohta teadma?', 'kuidas sind õpetati?', 'kes peaks seda õpetama?'], words: 'taskuraha, säästma, vastutus', counter: 'Aga kas lapsed ei peaks raha pärast mitte muretsema?' },
      { text: 'Laenu ei tohiks võtta asjade ostmiseks.', q: ['mis ohud on laenul?', 'kas tead sellist olukorda?', 'millal on laen mõistlik?'], words: 'intress, võlg, kodulaen', counter: 'Aga kui auto on tööl käimiseks hädavajalik?' },
      { text: 'Allahindlused panevad meid ostma asju, mida pole vaja.', words: 'reklaam, soodustus, kiusatus', counter: 'Aga kas allahindlusega ei saa ka päriselt raha kokku hoida?' },
      { text: 'Kasutatud asjade ostmine on tark otsus.', words: 'taaskasutus, kvaliteet, hind', counter: 'Aga kui asi läheb kohe katki?' },
      { text: 'Raha ei tee inimest õnnelikuks.', counter: 'Aga kas õnnelik saab olla ka siis, kui raha ei jätku üüriks?' },
    ],
  }),
  'a2b1-s07': lesson('s07', {
    title: 'Reisimine ja kultuur',
    canDo: 'Ma põhjendan oma arvamust reisimise teemal ja toon näite oma elust.',
    model: ['Võõra riigi kohta tasub enne reisi lugeda.', 'Siis saab inimene paremini aru kohalikest kommetest ega tee ebaviisakaid vigu.', 'Näiteks teadsin ma enne reisi, et selles riigis ei tohi templisse kingadega minna.', 'Seega muudab väike ettevalmistus reisi palju meeldivamaks.'],
    claims: [
      { text: 'Tuleks õppida paar lauset selle riigi keeles, kuhu sõidad.', q: ['mida muudavad paar lauset?', 'kas sul on selline kogemus?', 'mida tasub kõigepealt õppida?'], words: 'viisakus, kohalikud, tõlkerakendus', counter: 'Aga kas inglise keelest ei piisa?' },
      { text: 'Turistid rikuvad ilusaid kohti.', q: ['mis juhtub populaarse kohaga?', 'milline koht on sulle tuttav?', 'mida saab teha?'], words: 'prügi, rahvamass, hinnad', counter: 'Aga kas turistid ei too kohalikele tööd ja raha?' },
      { text: 'Reisida tuleks aeglaselt, mitte kiiresti.', words: 'puhkus, kohalik elu, ajakava', counter: 'Aga kui puhkust on ainult üks nädal?' },
      { text: 'Reisibüroo on parem kui ise reisi korraldamine.', words: 'hind, turvalisus, vabadus', counter: 'Aga kas ise korraldatud reis ei ole odavam?' },
      { text: 'Kõige rohkem õpid inimeste kohta siis, kui reisid nendega koos.', counter: 'Aga kas ühisel reisil ei teki ka tülisid?' },
    ],
  }),
  'a2b1-s08': lesson('s08', {
    title: 'Pere ja põlvkonnad',
    canDo: 'Ma põhjendan oma arvamust pere teemal ja toon näite oma elust.',
    model: ['Ühised pereõhtud hoiavad peret koos.', 'Argipäeval on kõigil kiire, mistõttu jääb tõeliseks vestluseks vähe aega.', 'Näiteks mängime me reedeti lauamänge ja räägime, kuidas nädal läks.', 'Seega tasub üks õhtu nädalas perele jätta.'],
    claims: [
      { text: 'Noored peaksid varakult vanemate juurest ära kolima.', q: ['mida annab oma elu?', 'kuidas see sinu peres oli?', 'millal on õige aeg?'], words: 'iseseisvus, üür, kohustused', counter: 'Aga kui üür on noore palga jaoks liiga kõrge?' },
      { text: 'Vanavanemad ei tohiks olla tasuta lapsehoidjad.', q: ['miks see võib olla probleem?', 'milline olukord on sulle tuttav?', 'kuidas pere saab kokku leppida?'], words: 'puhkus, kohustus, tänulikkus', counter: 'Aga kui vanavanemad ise tahavad lastega olla?' },
      { text: 'Põlvkonnad ei saa enam üksteisest aru.', words: 'tehnoloogia, väärtused, vestlus', counter: 'Aga kas ka varem ei olnud vanemate ja laste vahel vaidlusi?' },
      { text: 'Mõlemad vanemad peaksid lapsehoolduspuhkust kasutama.', words: 'isa, side lapsega, karjäär', counter: 'Aga kui ühe vanema palk on palju suurem?' },
      { text: 'Lemmikloom õpetab lapsele vastutust.', counter: 'Aga kes jalutab koeraga, kui lapsel kaob huvi?' },
    ],
  }),
  'a2b1-s09': lesson('s09', {
    title: 'Elu uues riigis',
    canDo: 'Ma põhjendan oma arvamust uues riigis elamise teemal ja toon näite.',
    model: ['Uues riigis aitab kohanemisel huviring.', 'Seal kohtub inimene teistega, kellel on samad huvid, mistõttu on keelt ja suhtlemist lihtsam harjutada.', 'Näiteks leidsin ma laulukoorist oma esimesed eesti sõbrad.', 'Seega ei tasu oodata, kuni keel on täiuslik.'],
    claims: [
      { text: 'Uude riiki kolides tuleb kõigepealt keel selgeks saada.', q: ['mida keel uues riigis annab?', 'milline olukord seda näitab?', 'mida teha, kui aega on vähe?'], words: 'töö, ametiasutus, kursus', counter: 'Aga kui kõigepealt on vaja raha teenida?' },
      { text: 'Kohalike kommetega tuleb arvestada.', q: ['miks on kombed olulised?', 'mis on sind Eestis üllatanud?', 'kus on piir enda ja võõra vahel?'], words: 'viisakus, üllatama, austus', counter: 'Aga kas oma kombeid peab siis unustama?' },
      { text: 'Lapsed kohanevad uue riigiga kergemini kui täiskasvanud.', words: 'kool, sõbrad, emakeel', counter: 'Aga kas lastel ei ole ka raske oma sõpradest lahkuda?' },
      { text: 'Oma kogukond võõrsil on kasulik.', words: 'tugi, nõuanne, eraldatus', counter: 'Aga kas ainult omadega suheldes ei jää keel õppimata?' },
      { text: 'Riik peaks uutele elanikele tasuta keelekursuse pakkuma.', counter: 'Aga kas õppija ei hinda rohkem seda, mille eest ta ise maksab?' },
    ],
  }),
  'a2b1-s10': lesson('s10', {
    title: 'Vaba aeg ja sport',
    canDo: 'Ma põhjendan oma arvamust vaba aja teemal ja toon näite oma elust.',
    model: ['Hobi aitab töömõtetest eemalduda.', 'Kui inimene teeb midagi, mis talle meeldib, unustab ta oma mured ja puhkab tõeliselt.', 'Näiteks ei mõtle ma aias töötades üldse tööle.', 'Seega tasub hobi jaoks aega leida ka kiirel ajal.'],
    claims: [
      { text: 'Inimesed ei oska enam puhata.', q: ['miks on puhkamine raske?', 'kuidas see sinu elus väljendub?', 'mida saaks teisiti teha?'], words: 'telefon, kiire elu, vaikus', counter: 'Aga kas telefoni vaatamine ei ole ka puhkus?' },
      { text: 'Võistlussport on lastele kasulik.', q: ['mida võistlemine õpetab?', 'kas tead sellist last?', 'mis võib minna halvasti?'], words: 'distsipliin, pinge, kaotama', counter: 'Aga kui pinge võtab lapselt spordirõõmu?' },
      { text: 'Raamatut ei asenda ükski film.', words: 'kujutlusvõime, ekraniseering, aeg', counter: 'Aga kas hea film ei tee keerulist lugu kättesaadavamaks?' },
      { text: 'Kontsert on parem kui muusika kuulamine kodus.', words: 'õhkkond, pilet, elamus', counter: 'Aga kui pilet maksab sada eurot?' },
      { text: 'Igas linnaosas peaks olema tasuta spordiväljak.', counter: 'Aga kes maksab selle ülalpidamise eest?' },
    ],
  }),
};
