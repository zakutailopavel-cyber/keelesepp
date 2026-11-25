// Visual briefs of a2b1 module 05; images in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
// Methodology v5 rewrite (2026-11-25): one learning visual per teaching lesson (021 the team's week on a whiteboard with
// done / not done marks, 022 two weekends side by side, 023 a festival map with the learner's walk and times, 024 a
// four-picture story). They are line drawings the content agent made from hand-written SVG (not generated) as working
// pictures in the palette of TEXTBOOK_ART_BIBLE.md §2 (black line, white, one lime accent, pale-lime blob, grey); Codex
// may redraw them from the same briefs. The places and people are made up and are not the continuing story's cast. The
// earlier pictures (Codex, built-in image generation; cast scenes) are in RETIRED below; their files stay in public/.
export default [
  {
    id: "a2b1-021-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kontori valge tahvel, ülal laimiroheline riba pealkirjaga „MEIE NÄDAL”. Viis veergu E, T, K, N, R; igas veerus ikoon, üks sõna ja ringis märk: E inimene „uus kolleeg” linnukesega; T koosolekulaud toolidega „koosolek” ristiga; K printer „printer” linnukesega; N tort küünlaga „sünnipäev” linnukesega; R paber ridadega „aruanne” ristiga. Lauseid pildil ei ole: mis juhtus ja mis jäi tegemata, sõnastab õppija ise.",
    accent: "the board's title strip",
    text: ["MEIE NÄDAL", "E", "T", "K", "N", "R", "uus kolleeg", "koosolek", "printer", "sünnipäev", "aruanne"],
    learningJob: "muuta linnukesed ja ristid lihtminevikuks: mis juhtus ja mida tehti (uus kolleeg alustas, printer parandati, tähistasime sünnipäeva) ning mida ei tehtud (koosolek jäi ära, me ei lõpetanud aruannet) ja kirjutada sellest kaaslasele",
    place: "021_t_exit",
    alt: "Kontori tahvel „Meie nädal”: esmaspäeval uus kolleeg (tehtud), teisipäeval koosolek (ei toimunud), kolmapäeval printer (tehtud), neljapäeval sünnipäev (tehtud), reedel aruanne (tegemata).",
    caption: "Meie nädal.",
    prompts: ["Mis juhtus esmaspäeval ja kolmapäeval?", "Mida te ei teinud? Miks?", "Mida peab kaaslane kõigepealt teadma?"],
  },
  {
    id: "a2b1-022-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Kaks pikka rida, ülal veerud „LAUPÄEV hommik”, „LAUPÄEV päev”, „LAUPÄEV õhtu”, „PÜHAPÄEV”. Vasakul laimirohelised nimesildid TOOMAS ja KAIA. Toomase rida: saabas ja puu „matk rabas”, jalgratas „rattasõit”, noot „kontsert”, kaks tassi kandikul „sõbrad külas”. Kaia rida: voodi ja „z z” „pikk uni”, lahtine raamat „raamat”, auruga saunamaja „saun”, teetass „tee ja film”. Kellaaegu ega lauseid ei ole: jutustuse ja ajasõnad teeb õppija.",
    accent: "the name badges TOOMAS and KAIA",
    text: ["LAUPÄEV", "hommik", "päev", "õhtu", "PÜHAPÄEV", "TOOMAS", "KAIA", "matk rabas", "rattasõit", "kontsert", "sõbrad külas", "pikk uni", "raamat", "saun", "tee ja film"],
    learningJob: "jutustada kellegi nädalavahetus järjekorras, alustades lauset ajasõnaga ja pannes tegusõna teisele kohale (Laupäeva hommikul käis Toomas rabas matkamas, pärast seda sõitis ta rattaga), ning arutada, kumb nädalavahetus oli parem puhkus",
    place: "022_t_debate",
    alt: "Kaks nädalavahetust: Toomas käis laupäeva hommikul rabas, päeval sõitis rattaga, õhtul oli kontserdil ja pühapäeval olid sõbrad külas; Kaia magas kaua, luges raamatut, käis saunas ja pühapäeval jõi teed ning vaatas filmi.",
    caption: "Kaks nädalavahetust.",
    prompts: ["Mida tegi Toomas laupäeva hommikul ja mida pärast seda?", "Kuidas veetis nädalavahetuse Kaia?", "Kumb puhkas sinu meelest paremini? Miks?"],
  },
  {
    id: "a2b1-023-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Festivali kaart heleroheline laigu peal, pealkiri „FESTIVALI KAART”. Täpiline tee numbritega 1–5 ja kellaaegadega: 1 VÄRAV kaarega 13.00, 2 SÖÖGITELK 13.30 (telgi ees pink, pingil laimiroheline kott), 3 SUUR LAVA noodiga 14.30, 4 MÄNGUPLATS kiigega 15.30, 5 KÄSITÖÖ telk 16.30. Teest eemal paremal üleval INFOTELK i-tähega. Lauseid ei ole.",
    accent: "the bag on the bench in the food tent",
    text: ["FESTIVALI KAART", "1", "2", "3", "4", "5", "13.00", "13.30", "14.30", "15.30", "16.30", "VÄRAV", "SÖÖGITELK", "SUUR LAVA", "MÄNGUPLATS", "KÄSITÖÖ", "INFOTELK", "i"],
    learningJob: "jutustada telefonis oma tee festivalil lihtmineviku erandvormidega (tulin väravast sisse kell üks, läksin söögitelki, sõin, panin koti pingile, nägin kontserti) ja öelda, kus kott võis maha jääda",
    place: "023_t_office",
    alt: "Festivali kaart: tee väravast (kell 13.00) söögitelki (13.30, pingil roheline kott), suure lava juurde (14.30), mänguplatsile (15.30) ja käsitöötelki (16.30); eraldi infotelk.",
    caption: "Festivali kaart.",
    prompts: ["Kuhu sa kõigepealt läksid ja mis kell?", "Kus sa sõid ja mida sa laval nägid?", "Kus jäi sinu kott maha?"],
  },
  {
    id: "a2b1-024-kasuta-2",
    phase: "transfer",
    format: "scene",
    cast: [],
    scene: "Neli kasti numbrite ja kellaaegadega. 1 (8.00): inimene uksel, käes võtmed. 2 (8.30): POOD, riiul, ostukäru, põrandal valged võtmed. 3 (9.15): sama inimene suletud ukse ees, pea kohal suur küsimärk. 4 (9.30): naaber (valge kuju) annab inimesele laimirohelised võtmed, taga naabri uks. Sõnu ega lauseid ei ole peale „POOD”.",
    accent: "the keys in the last picture",
    text: ["1", "2", "3", "4", "8.00", "8.30", "9.15", "9.30", "POOD"],
    learningJob: "jutustada piltide järgi lugu nelja osaga (algus, probleem, mis edasi juhtus, lõpp) ja loo sõnadega (kõigepealt, äkki, õnneks, lõpuks, kui) ning kirjutada see võistlusele",
    place: "024_t_exit",
    alt: "Neli pilti: kell kaheksa lukustab inimene ukse, pool üheksa on ta poes ja võtmed kukuvad põrandale, veerand kümme seisab ta suletud ukse ees, pool kümme toob naaber talle võtmed.",
    caption: "Neli pilti.",
    prompts: ["Mis juhtus kõigepealt?", "Mida inimene äkki märkas?", "Kes aitas ja kuidas lugu lõppes?"],
  },
];

// Retired from the sheets in the methodology v5 rewrite (2026-11-25): cast scenes that did not carry the new lessons'
// tasks; the files stay in public/textbook-art/b1/ and can return when a lesson needs them.
export const RETIRED = [
  {
    id: "a2b1-021-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Markus"],
    scene: "Markuse eilne päev kulgeb noolega ühendatud hetkedena: hommikusöök ja buss, arvutitöö ning telefonikõne kontoris, õhtune söögitegemine ja lugemine kodus.",
    accent: "the timeline",
    text: [],
    learningJob: "jutustada lihtminevikus, mida Markus eile tegi ja mida ta ei teinud",
    alt: "Markuse hommik, tööpäev ja õhtu moodustavad ühe ajaliselt järjestatud loo.",
    caption: "Pilt 1. Markuse tavaline eilne tööpäev.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimene pildil eile tegi?", "Mis kell see võis olla ja kus?", "Mida sina eile hommikul tegid?"],
  },
  {
    id: "a2b1-022-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Sofia", "Viktor", "Liis", "Jaan"],
    scene: "Anna meenutab noolega järjestatud nädalavahetust: korteri koristamine, turul käimine, Sofiaga kohvi joomine, jalutamine, lähedastele helistamine ja uue nädala ettevalmistamine.",
    accent: "the chronological arrows",
    text: [],
    learningJob: "järjestada hiljutised sündmused ja jutustada neist ajamarkeritega kõigepealt, siis, pärast seda ja lõpuks",
    alt: "Anna nädalavahetuse tegevused on kujutatud algusest lõpuni noolega ühendatud hetkedena.",
    caption: "Pilt 1. Anna meenutab eelmist nädalavahetust.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis juhtus pildil eelmisel nädalal?", "Mis järjekorras sündmused toimusid?", "Mis oli sinu eelmise nädala parim hetk?"],
  },
  {
    id: "a2b1-023-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Jaan", "Sofia", "Viktor", "Liis"],
    scene: "Tartu toidufestivalil veab Jaan vabatahtlikuna müüjatele vett, Sofia vaatab tänavakunstnikke ning kerge vihma ajal jätkub laval kontsert.",
    accent: "Jaan's volunteer cart",
    text: [],
    learningJob: "kirjeldada erandlike lihtminevikuvormidega, kes tuli, läks, tegi, nägi, sõi, jõi, sai, jäi ja viis",
    alt: "Jaan töötab vihmasel toidufestivalil vabatahtlikuna ja Sofia jälgib esinejaid.",
    caption: "Pilt 1. Sündmused Tartu toidufestivalil.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Kus inimesed pildil käisid ja mida nad nägid?", "Mida nad sõid ja jõid?", "Kus sina viimati festivalil käisid?"],
  },
  {
    id: "a2b1-024-avasta-1",
    phase: "discover",
    format: "scene",
    cast: ["Anna", "Jaan"],
    scene: "Turul märkab Anna, et väike kott on kadunud, pöördub tagasi puu- ja leivamüüjate juurde, küsib koti kohta ning leiab selle lõpuks kohvikuleti tagant.",
    accent: "the small lost bag",
    text: [],
    learningJob: "moodustada piltide põhjal terviklik minevikulugu, kasutada järjekorrasid ja kirjeldada muutuvat tunnet",
    alt: "Anna otsib turul kadunud kotti ja saab selle kohvikust tagasi.",
    caption: "Pilt 1. Kadunud koti lugu turul.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mis juhtus pildil kõigepealt ja mis siis?", "Mis oli loo probleem ja kuidas see lahenes?", "Mis ootamatu asi sinuga juhtus?"],
  },
  {
    id: "a2b1-025-kasuta-1",
    phase: "transfer",
    format: "scene",
    cast: ["Sofia", "Viktor", "Liis", "Markus"],
    scene: "Sofia meenutab esimest lennureisi: ta ootab närviliselt väravas, vaatab lennukiaknast pilvi ning kohtub pärast maandumist rõõmsalt Viktori, Liisi ja Markusega.",
    accent: "Sofia's travel backpack",
    text: [],
    learningJob: "jutustada meeldejäävast päevast lihtminevikus, säilitada sündmuste järjekord ning näidata, kuidas raske algus lõppes hästi",
    alt: "Sofia esialgne lennuhirm muutub reisi järel rõõmuks.",
    caption: "Pilt 1. Sofia esimene lennureis.",
    // the questions beside the picture (owner 2026-10-18)
    prompts: ["Mida inimene pildil kirjutab või räägib?", "Mis temaga eelmisel nädalal juhtus?", "Millest sina sõbrale kirjutaksid?"],
  },
];
