// Matemaatika kitsas, 11. klass (owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”).
// Gümnaasiumi kitsa matemaatika kursused IV–VI (GRÕK lisa 5 p 2.2.2; paigutus 11. klassi on meie otsus, vt
// docs/CURRICULUM_MATEMAATIKA_1_12.md): IV „Tõenäosus ja statistika”, V „Funktsioonid”, VI „Jadad. Funktsiooni
// tuletis”. Built step by step from the basics, not exam-only; after every course a „Kordamine ja kontrolltöö” lesson
// whose third sheet is a 25-point test. Every task is our own.
// The lesson shape is the one of kitsas10.js (math/sheets.js builds three sheets per lesson):
// theory (formulas to know), a short Russian hint, a worked example (with a graph where it helps), four practice tasks
// with answers and worked solutions, one larger task (5 or 10 p; 25 p in a test lesson).
// Text is Markdown + $…$ formulas (KaTeX); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a drawing, an explanation);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
// Every graph gives a positive stepY (a stepY of 0 drew a grey band, hotfix 2026-11-16).
const r = String.raw;

export const KITSAS_11 = {
  id: 'mk11',
  title: 'Matemaatika kitsas: 11. klass',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '11. klass matemaatika kitsas',
  sheetLevel: 'Kitsas 11',
  minutes: 90,
  // the teacher's plan in mathCurriculum.js: a school course lesson, not exam prep
  plan: 'course',
  phases: {
    transfer: { label: '3 Kontrollülesanne', slot: 3, subtitle: 'Suurem ülesanne nagu kontrolltöös: kirjuta kogu lahenduskäik.' },
  },
  goal: 'Õpilane arvutab tõenäosusi ja kirjeldab andmeid, kasutab eksponent- ja logaritmfunktsiooni, lahendab jadade ülesandeid ning uurib funktsiooni tuletise abil.',
  lessons: [
    // ───────────── IV kursus „Tõenäosus ja statistika” ─────────────
    {
      title: 'Sündmused ja klassikaline tõenäosus',
      ru: 'События и классическая вероятность',
      course: 'IV',
      exam: 'Tõenäosuse ülesanne on peaaegu igal kitsa riigieksamil (I osa 5 p või II osa 10 p).',
      can: 'Õpilane eristab juhuslikku, kindlat ja võimatut sündmust, arvutab klassikalise ja statistilise tõenäosuse ning kasutab vastandsündmust.',
      theory: [
        r`Juhuslik sündmus võib katsel toimuda või mitte. Kindel sündmus toimub alati: $P=1$. Võimatu sündmus ei toimu kunagi: $P=0$.`,
        r`Klassikaline tõenäosus: $P(A)=\dfrac{k}{n}$, kus $n$ on kõigi võrdvõimalike tulemuste arv ja $k$ sündmusele $A$ soodsate tulemuste arv; $\;0\le P(A)\le1$.`,
        r`Vastandsündmus $\bar A$ („$A$ ei toimu”): $\;P(\bar A)=1-P(A)$.`,
        r`Statistiline tõenäosus: suure arvu katsete korral $P(A)\approx\dfrac{k}{n}$, kus $k$ on sündmuse toimumiste arv $n$ katses (suhteline sagedus).`,
      ],
      ru_hint: [
        'Вероятность = благоприятные исходы / все равновозможные исходы.',
        '«Хотя бы один», «не меньше» — часто проще через противоположное событие: 1 − P.',
        'Статистическая вероятность — это относительная частота при большом числе опытов.',
      ],
      example: {
        task: 'Visatakse kahte täringut. Kui suur on tõenäosus, et silmade summa on 9?',
        steps: [
          r`Kõiki võrdvõimalikke tulemusi on $n=6\cdot6=36$.`,
          r`Soodsad paarid: $(3;6)$, $(4;5)$, $(5;4)$, $(6;3)$ — $k=4$.`,
          r`$P=\dfrac{4}{36}=\dfrac19\approx0{,}11$.`,
        ],
      },
      practice: [
        { title: 'Täringut visatakse üks kord. Leia tõenäosus.', parts: [
          ['Tuleb paarisarv.', 1, '0,5|1/2', r`Soodsad $2,4,6$: $P=\dfrac36=0{,}5$.`, 1],
          ['Tuleb arv, mis on suurem kui 4.', 1, '1/3|0,33', r`Soodsad $5,6$: $P=\dfrac26=\dfrac13$.`, 1],
          ['Tuleb 7.', 1, '0', 'Sellist tahku ei ole: sündmus on võimatu, P = 0.', 1],
          ['Tuleb arv, mis on kuni 6.', 1, '1', 'Iga tulemus sobib: sündmus on kindel, P = 1.', 1],
        ] },
        { title: 'Karbis on 5 punast, 3 sinist ja 2 rohelist kuuli. Võetakse juhuslikult üks kuul.', parts: [
          ['Leia tõenäosus, et kuul on punane.', 1, '0,5|1/2', r`$P=\dfrac{5}{10}=0{,}5$`, 1],
          ['Leia tõenäosus, et kuul ei ole sinine.', 2, '0,7|7/10', r`$P(\bar S)=1-\dfrac{3}{10}=0{,}7$`],
          ['Leia tõenäosus, et kuul on kollane.', 1, '0', 'Kollaseid kuule ei ole: P = 0.', 1],
        ] },
        { title: 'Visatakse kahte münti.', parts: [
          ['Mitu võrdvõimalikku tulemust on?', 1, '4', r`$KK$, $KR$, $RK$, $RR$ ($K$ — kull, $R$ — kiri): $n=4$.`, 1],
          ['Leia tõenäosus, et tuleb kaks kulli.', 1, '0,25|1/4', r`$P=\dfrac14$`, 1],
          ['Leia tõenäosus, et tuleb vähemalt üks kiri.', 2, '0,75|3/4', r`Vastandsündmus on „kaks kulli”: $P=1-\dfrac14=\dfrac34$.`],
        ] },
        { title: 'Tehases kontrolliti 800 detaili, neist 12 olid praak.', parts: [
          ['Leia praagi suhteline sagedus.', 1, '0,015|3/200', r`$\dfrac{12}{800}=0{,}015$`, 1],
          ['Mitu praakdetaili on oodata 5000 detaili hulgas?', 2, '75', r`$5000\cdot0{,}015=75$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Visatakse kahte täringut.', parts: [
        ['Mitu võrdvõimalikku tulemust on?', 1, '36', r`$6\cdot6=36$`, 1],
        ['Leia tõenäosus, et silmade summa on 8.', 2, '5/36|0,14', r`$(2;6),(3;5),(4;4),(5;3),(6;2)$: $P=\dfrac{5}{36}\approx0{,}14$`, 2],
        ['Leia tõenäosus, et mõlemal täringul on sama arv.', 2, '1/6|0,17', r`Paarid $(1;1),\dots,(6;6)$ — 6 tükki: $P=\dfrac{6}{36}=\dfrac16$`, 2],
        ['Leia tõenäosus, et silmade summa on vähemalt 4.', 3, '11/12|0,92', r`Vastandsündmus: summa $\le3$, s.t $(1;1),(1;2),(2;1)$. $P=1-\dfrac{3}{36}=\dfrac{11}{12}\approx0{,}92$`, 3],
        ['Leia tõenäosus, et silmade korrutis on paaritu arv.', 2, '0,25|1/4', r`Korrutis on paaritu, kui mõlemad arvud on paaritud: $3\cdot3=9$ paari. $P=\dfrac{9}{36}=\dfrac14$`, 2],
      ] },
      self: ['Leian kõigi ja soodsate tulemuste arvu.', 'Kasutan vastandsündmust („vähemalt üks”).', 'Tean, et 0 ≤ P ≤ 1.'],
    },
    {
      title: 'Geomeetriline tõenäosus',
      ru: 'Геометрическая вероятность',
      course: 'IV',
      exam: 'Geomeetriline tõenäosus on riigieksamil harvem, aga ühendab tõenäosuse ja pindalad (ring, ruut, lõik).',
      can: 'Õpilane arvutab tõenäosuse lõigu pikkuste või kujundite pindalade suhtena.',
      theory: [
        r`Kui punkt valitakse juhuslikult piirkonnast $G$, siis $P(A)=\dfrac{\text{piirkonna }A\text{ mõõt}}{\text{piirkonna }G\text{ mõõt}}$ (pikkus, pindala, aeg).`,
        r`Lõigul: $P=\dfrac{\ell_A}{\ell_G}$; tasandil: $P=\dfrac{S_A}{S_G}$.`,
        r`Ring: $S=\pi r^2$; ruut: $S=a^2$; ristkülik: $S=ab$; rõngas: $S=\pi(R^2-r^2)$.`,
        r`Ühe punkti „mõõt” on $0$: tõenäosus tabada täpselt ühte punkti on $0$.`,
      ],
      ru_hint: [
        'Геометрическая вероятность — это отношение длин или площадей.',
        'Сначала найди площадь всей фигуры, потом площадь «благоприятной» части.',
        'Время ожидания тоже считаем как длину отрезка.',
      ],
      example: {
        task: r`Ruudu $ABCD$ külg on 4. Ruudu sees on ring raadiusega 1. Ruudust valitakse juhuslik punkt. Kui suur on tõenäosus, et see on ringi sees?`,
        steps: [
          r`Ruudu pindala $S_G=4^2=16$, ringi pindala $S_A=\pi\cdot1^2=\pi$.`,
          r`$P=\dfrac{\pi}{16}\approx0{,}20$.`,
        ],
        graph: { fns: 'y = 2 + sqrt(1 - (x - 2)^2)\ny = 2 - sqrt(1 - (x - 2)^2)', xmin: -1, xmax: 5, ymin: -1, ymax: 5, step: 1, stepY: 1, points: 'A(0; 0)\nB(4; 0)\nC(4; 4)\nD(0; 4)', segments: 'A-B\nB-C\nC-D\nD-A', caption: 'ruut 4 × 4 ja ring raadiusega 1' },
      },
      practice: [
        { title: r`Lõigul $[0;10]$ valitakse juhuslik punkt $x$.`, parts: [
          [r`Leia tõenäosus, et $x$ on lõigul $[2;5]$.`, 1, '0,3|3/10', r`$P=\dfrac{5-2}{10}=0{,}3$`, 1],
          [r`Leia tõenäosus, et $x>8$.`, 1, '0,2|1/5', r`$P=\dfrac{10-8}{10}=0{,}2$`, 1],
          [r`Leia tõenäosus, et $x=5$ täpselt.`, 1, '0', 'Ühe punkti pikkus on 0: P = 0.', 1],
        ] },
        { title: 'Buss väljub peatusest iga 15 minuti järel. Õpilane tuleb peatusesse juhuslikul ajal.', parts: [
          ['Leia tõenäosus, et ta ootab alla 5 minuti.', 2, '1/3|0,33', r`Soodne ajavahemik on 5 min 15-st: $P=\dfrac{5}{15}=\dfrac13$.`],
          ['Leia tõenäosus, et ta ootab üle 12 minuti.', 2, '0,2|1/5', r`$P=\dfrac{15-12}{15}=0{,}2$`],
        ] },
        { title: 'Märklaud on ring raadiusega 20 cm. Keskel on „kümme” — ring raadiusega 4 cm. Lask tabab märklauda juhuslikus kohas.', parts: [
          ['Leia tõenäosus tabada „kümmet”.', 2, '0,04|1/25', r`$P=\dfrac{\pi\cdot4^2}{\pi\cdot20^2}=\dfrac{16}{400}=0{,}04$`],
          ['Leia tõenäosus tabada rõngast, mille raadiused on 4 cm ja 10 cm.', 2, '0,21|21/100', r`$P=\dfrac{\pi(10^2-4^2)}{\pi\cdot20^2}=\dfrac{84}{400}=0{,}21$`],
        ] },
        { title: 'Ruudu külg on 10 cm, selle sees on ruut küljega 6 cm. Suurest ruudust valitakse juhuslik punkt.', parts: [
          ['Leia tõenäosus, et punkt on väikeses ruudus.', 1, '0,36|9/25', r`$P=\dfrac{36}{100}=0{,}36$`, 1],
          ['Leia tõenäosus, et punkt ei ole väikeses ruudus.', 1, '0,64|16/25', r`$P=1-0{,}36=0{,}64$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: 'Ristkülikukujulise aia mõõtmed on 20 m ja 30 m. Aias on ringikujuline lillepeenar läbimõõduga 10 m. Lumehelves langeb juhuslikku kohta aias.', parts: [
        ['Leia aia pindala.', 1, '600', r`$20\cdot30=600$ m²`, 1],
        ['Leia peenra pindala kahe kümnendkohani.', 2, '78,54|25π', r`$r=5$ m, $S=\pi\cdot5^2=25\pi\approx78{,}54$ m²`, 2],
        ['Leia tõenäosus, et helves langeb peenrale (kahe kümnendkohani).', 2, '0,13|π/24', r`$P=\dfrac{25\pi}{600}=\dfrac{\pi}{24}\approx0{,}13$`, 2],
      ] },
      self: ['Leian kogu piirkonna ja soodsa osa mõõdu.', 'Arvutan ringi ja rõnga pindala.', 'Tean, et ühe punkti tabamise tõenäosus on 0.'],
    },
    {
      title: 'Faktoriaal, permutatsioonid ja kombinatsioonid',
      ru: 'Факториал, перестановки и сочетания',
      course: 'IV',
      exam: 'Kombinatsioonide arv on riigieksamil tõenäosuse ülesande sees: „valitakse juhuslikult 3 …”.',
      can: 'Õpilane kasutab korrutamisreeglit, arvutab faktoriaali, permutatsioonide ja kombinatsioonide arvu ning tõenäosuse nende abil.',
      theory: [
        r`Korrutamisreegel: kui esimest valikut saab teha $m$ ja teist $n$ viisil, siis mõlemat koos $m\cdot n$ viisil.`,
        r`$n!=1\cdot2\cdot3\cdots n$; $\;0!=1$. Permutatsioonid (järjestused): $P_n=n!$`,
        r`Kombinatsioonid (järjekord ei ole oluline): $C_n^k=\dfrac{n!}{k!\,(n-k)!}$; $\;C_n^k=C_n^{n-k}$`,
        r`Kui järjekord on oluline (esimees, sekretär …): $n\cdot(n-1)\cdots(n-k+1)$ viisi.`,
      ],
      ru_hint: [
        'Порядок важен (места, должности) — умножаем n·(n−1)·…; порядок не важен (группа, набор) — сочетания C.',
        'C из n по k на калькуляторе: клавиша nCr.',
        '0! = 1 — это договорённость.',
      ],
      example: {
        task: 'Klassis on 25 õpilast. Mitmel viisil saab valida 3-liikmelise žürii? Mitmel viisil saab valida esimehe, sekretäri ja laekuri?',
        steps: [
          r`Žüriis on järjekord ükskõik: $C_{25}^3=\dfrac{25\cdot24\cdot23}{1\cdot2\cdot3}=2300$.`,
          r`Ametid on erinevad, järjekord on oluline: $25\cdot24\cdot23=13\,800$.`,
          r`Kontroll: igast žüriist saab ametid jagada $3!=6$ viisil: $2300\cdot6=13\,800$ ✓.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$5!$`, 1, '120', r`$1\cdot2\cdot3\cdot4\cdot5=120$`, 1],
          [r`$\dfrac{8!}{6!}$`, 1, '56', r`$\dfrac{8!}{6!}=7\cdot8=56$`, 1],
          [r`$C_6^2$`, 1, '15', r`$\dfrac{6\cdot5}{2}=15$`, 1],
          [r`$C_{10}^8$`, 1, '45', r`$C_{10}^8=C_{10}^2=\dfrac{10\cdot9}{2}=45$`, 1],
        ] },
        { title: 'Riiulile pannakse 6 erinevat raamatut.', parts: [
          ['Mitmel viisil saab need järjestada?', 1, '720', r`$6!=720$`, 1],
          ['Mitmel viisil, kui kaks kindlat raamatut peavad olema kõrvuti?', 2, '240', r`Seo need kaks üheks: $5!$ järjestust, paari sees $2!$: $5!\cdot2=240$.`],
        ] },
        { title: 'Korrutamisreegel.', parts: [
          ['Kohvikus on 5 suppi ja 4 praadi. Mitu erinevat lõunat (supp ja praad) saab valida?', 1, '20', r`$5\cdot4=20$`, 1],
          ['Mitu erinevat 4-kohalist PIN-koodi on (numbrid 0–9 võivad korduda)?', 1, '10000|10^4', r`$10^4=10\,000$`, 1],
        ] },
        { title: 'Klassis on 12 poissi ja 10 tüdrukut.', parts: [
          ['Mitmel viisil saab valida 2 õpilast?', 1, '231', r`$C_{22}^2=\dfrac{22\cdot21}{2}=231$`, 1],
          ['Mitmel viisil saab valida 2 poissi ja 2 tüdrukut?', 2, '2970', r`$C_{12}^2\cdot C_{10}^2=66\cdot45=2970$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Karbis on 10 kuuli: 4 punast ja 6 valget. Võetakse juhuslikult korraga 3 kuuli.', parts: [
        ['Mitmel viisil saab 3 kuuli valida?', 2, '120', r`$C_{10}^3=\dfrac{10\cdot9\cdot8}{6}=120$`, 2],
        ['Mitmel viisil saab valida 3 valget kuuli?', 2, '20', r`$C_6^3=\dfrac{6\cdot5\cdot4}{6}=20$`, 2],
        ['Leia tõenäosus, et kõik kolm kuuli on valged.', 2, '1/6|0,17', r`$P=\dfrac{20}{120}=\dfrac16\approx0{,}17$`, 2],
        ['Leia tõenäosus, et täpselt üks kuul on punane.', 2, '0,5|1/2', r`$\dfrac{C_4^1\cdot C_6^2}{120}=\dfrac{4\cdot15}{120}=0{,}5$`, 2],
        ['Leia tõenäosus, et vähemalt üks kuul on punane.', 2, '5/6|0,83', r`Vastandsündmus on „kõik valged”: $1-\dfrac16=\dfrac56\approx0{,}83$`, 2],
      ] },
      self: ['Eristan, kas järjekord on oluline.', 'Arvutan C_n^k valemiga ja kalkulaatoriga.', 'Kasutan kombinatsioone tõenäosuse leidmiseks.'],
    },
    {
      title: 'Sündmuste summa ja korrutis',
      ru: 'Сумма и произведение событий',
      course: 'IV',
      exam: 'Riigieksamil: „mõlemad”, „vähemalt üks”, „täpselt üks” — sõltumatute sündmuste korrutis ja vastandsündmus.',
      can: 'Õpilane leiab sündmuste summa ja korrutise tõenäosuse ning kasutab sõltumatute sündmuste korrutamisreeglit.',
      theory: [
        r`Summa $A+B$: toimub $A$ **või** $B$ (vähemalt üks). Korrutis $AB$: toimuvad **mõlemad**.`,
        r`Üldiselt $P(A+B)=P(A)+P(B)-P(AB)$; välistavate sündmuste korral $P(A+B)=P(A)+P(B)$.`,
        r`Sõltumatud sündmused: $P(AB)=P(A)\cdot P(B)$.`,
        r`„Vähemalt üks”: $P=1-P(\text{mitte ükski})$.`,
      ],
      ru_hint: [
        '«И» — умножаем (для независимых событий), «или» — складываем и вычитаем общее.',
        'Несовместные события не могут произойти вместе: P(AB) = 0.',
        '«Ровно один» = первый да и второй нет ИЛИ первый нет и второй да.',
      ],
      example: {
        task: 'Laskur tabab märki tõenäosusega 0,8. Ta laseb kaks korda (lasud on sõltumatud). Leia tõenäosus, et ta tabab mõlemal korral, täpselt ühel korral ja vähemalt ühel korral.',
        steps: [
          r`Mõlemal: $0{,}8\cdot0{,}8=0{,}64$.`,
          r`Täpselt ühel: $0{,}8\cdot0{,}2+0{,}2\cdot0{,}8=0{,}32$.`,
          r`Vähemalt ühel: $1-0{,}2\cdot0{,}2=0{,}96$. Kontroll: $0{,}64+0{,}32+0{,}04=1$ ✓.`,
        ],
      },
      practice: [
        { title: r`Visatakse täringut. $A$ — tuleb paarisarv, $B$ — tuleb vähemalt 5.`, parts: [
          [r`Leia $P(A)$.`, 1, '0,5|1/2', r`$\dfrac36=0{,}5$`, 1],
          [r`Leia $P(AB)$.`, 1, '1/6|0,17', r`Mõlemad: ainult $6$. $P=\dfrac16$.`, 1],
          [r`Leia $P(A+B)$.`, 2, '2/3|0,67', r`$\dfrac12+\dfrac13-\dfrac16=\dfrac23$ (soodsad $2,4,5,6$).`],
        ] },
        { title: r`$A$ ja $B$ on sõltumatud, $P(A)=0{,}7$ ja $P(B)=0{,}4$.`, parts: [
          [r`Leia $P(AB)$.`, 1, '0,28', r`$0{,}7\cdot0{,}4=0{,}28$`, 1],
          [r`Leia $P(A+B)$.`, 1, '0,82', r`$0{,}7+0{,}4-0{,}28=0{,}82$`, 1],
          ['Leia tõenäosus, et kumbki ei toimu.', 2, '0,18', r`$0{,}3\cdot0{,}6=0{,}18$ (kontroll: $1-0{,}82=0{,}18$)`],
        ] },
        { title: 'Münti visatakse kolm korda.', parts: [
          ['Leia tõenäosus, et tuleb kolm kulli.', 1, '0,125|1/8', r`$\left(\dfrac12\right)^3=\dfrac18$`, 1],
          ['Leia tõenäosus, et tuleb vähemalt üks kiri.', 2, '0,875|7/8', r`$1-\dfrac18=\dfrac78$`],
        ] },
        { title: 'Kaks seadet töötavad teineteisest sõltumatult. Rikke tõenäosus on esimesel 0,1 ja teisel 0,05.', parts: [
          ['Leia tõenäosus, et mõlemad töötavad.', 1, '0,855', r`$0{,}9\cdot0{,}95=0{,}855$`, 1],
          ['Leia tõenäosus, et vähemalt üks on rikkis.', 1, '0,145', r`$1-0{,}855=0{,}145$`, 1],
          ['Leia tõenäosus, et täpselt üks on rikkis.', 2, '0,14', r`$0{,}1\cdot0{,}95+0{,}9\cdot0{,}05=0{,}095+0{,}045=0{,}14$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Kaks korvpallurit viskavad kumbki ühe vabaviske. Esimene tabab tõenäosusega 0,7, teine 0,6; visked on sõltumatud.', parts: [
        ['Leia tõenäosus, et mõlemad tabavad.', 2, '0,42', r`$0{,}7\cdot0{,}6=0{,}42$`, 2],
        ['Leia tõenäosus, et kumbki ei taba.', 2, '0,12', r`$0{,}3\cdot0{,}4=0{,}12$`, 2],
        ['Leia tõenäosus, et vähemalt üks tabab.', 2, '0,88', r`$1-0{,}12=0{,}88$`, 2],
        ['Leia tõenäosus, et tabab täpselt üks.', 2, '0,46', r`$0{,}7\cdot0{,}4+0{,}3\cdot0{,}6=0{,}28+0{,}18=0{,}46$`, 2],
        ['Liida kolme eelmise juhu (mõlemad, kumbki ei, täpselt üks) tõenäosused. Mis tuleb?', 2, '1', r`$0{,}42+0{,}12+0{,}46=1$: need juhud katavad kõik võimalused ja välistavad üksteist.`, 2],
      ] },
      self: ['Eristan „ja” ning „või” sündmusi.', 'Korrutan sõltumatute sündmuste tõenäosused.', 'Leian „vähemalt ühe” vastandsündmuse kaudu.'],
    },
    {
      title: 'Juhuslik suurus, jaotustabel ja keskväärtus',
      ru: 'Случайная величина, таблица распределения и математическое ожидание',
      course: 'IV',
      exam: 'Jaotustabel ja keskväärtus on riigieksami tõenäosuse ülesande tavaline osa (10 p).',
      can: 'Õpilane koostab diskreetse juhusliku suuruse jaotustabeli, joonestab jaotushulknurga ja arvutab keskväärtuse.',
      theory: [
        r`Juhuslik suurus $X$ saab katses ühe väärtustest $x_1,x_2,\dots,x_n$ tõenäosustega $p_1,p_2,\dots,p_n$.`,
        r`Jaotustabelis $p_1+p_2+\dots+p_n=1$.`,
        r`Keskväärtus $E(X)=x_1p_1+x_2p_2+\dots+x_np_n$ — keskmine tulemus väga paljude katsete korral.`,
        r`Jaotushulknurk: punktid $(x_i;p_i)$, mis on ühendatud lõikudega.`,
      ],
      ru_hint: [
        'Таблица распределения: значения X и их вероятности; сумма вероятностей = 1.',
        'Математическое ожидание E(X) — «среднее» значение при многих повторениях.',
        'Если E(X) выигрыша меньше цены билета, игра в среднем убыточна.',
      ],
      example: {
        task: r`Visatakse kahte münti. $X$ — kullide arv. Koosta jaotustabel ja leia $E(X)$.`,
        steps: [
          r`$X=0$: $RR$, $p=\frac14$; $\;X=1$: $KR$ või $RK$, $p=\frac12$; $\;X=2$: $KK$, $p=\frac14$.`,
          r`Kontroll: $\frac14+\frac12+\frac14=1$ ✓.`,
          r`$E(X)=0\cdot\frac14+1\cdot\frac12+2\cdot\frac14=1$. Joonisel on jaotushulknurk.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 3, ymin: -0.25, ymax: 0.75, step: 1, stepY: 0.25, points: 'A(0; 0.25)\nB(1; 0.5)\nC(2; 0.25)', segments: 'A-B\nB-C', caption: 'jaotushulknurk: x — kullide arv, y — tõenäosus' },
      },
      practice: [
        { title: r`Juhusliku suuruse $X$ väärtused on $1,2,3,4$ tõenäosustega $0{,}1$; $0{,}3$; $a$; $0{,}2$.`, parts: [
          [r`Leia $a$.`, 1, '0,4', r`$1-(0{,}1+0{,}3+0{,}2)=0{,}4$`, 1],
          [r`Leia $E(X)$.`, 2, '2,7', r`$0{,}1+0{,}6+1{,}2+0{,}8=2{,}7$`],
          [r`Leia $P(X\ge3)$.`, 1, '0,6', r`$0{,}4+0{,}2=0{,}6$`, 1],
        ] },
        { title: 'Loteriis on 1000 piletit: üks võit 100 €, kümme võitu 20 € ja viiskümmend võitu 2 €, ülejäänud piletid ei võida.', parts: [
          ['Leia tõenäosus võita 20 €.', 1, '0,01|1/100', r`$\dfrac{10}{1000}=0{,}01$`, 1],
          ['Leia võidu keskväärtus eurodes.', 2, '0,4', r`$100\cdot0{,}001+20\cdot0{,}01+2\cdot0{,}05=0{,}1+0{,}2+0{,}1=0{,}4$`],
          ['Pilet maksab 1 €. Leia mängija keskmine tulemus ühe pileti kohta.', 1, '-0,6', r`$0{,}4-1=-0{,}6$ € — keskmiselt kaotus.`, 1],
        ] },
        { title: 'Täringumäng.', parts: [
          [r`$X$ on täringu silmade arv. Leia $E(X)$.`, 1, '3,5|7/2', r`$\dfrac{1+2+3+4+5+6}{6}=3{,}5$`, 1],
          ['Kui tuleb 6, võidad 5 €, muidu kaotad 1 €. Leia võidu keskväärtus.', 2, '0', r`$5\cdot\dfrac16+(-1)\cdot\dfrac56=0$ — mäng on aus.`],
        ] },
        { title: r`$X$ väärtused on $-2$, $0$ ja $3$ tõenäosustega $0{,}3$; $0{,}5$; $0{,}2$.`, parts: [
          [r`Leia $E(X)$.`, 2, '0', r`$-0{,}6+0+0{,}6=0$`],
          [r`Leia $P(X>0)$.`, 1, '0,2', r`Ainult $X=3$: $0{,}2$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Korvis on 3 punast ja 2 valget kuuli. Võetakse korraga 2 kuuli. $X$ on punaste kuulide arv.`, parts: [
        [r`Leia $P(X=0)$.`, 2, '0,1|1/10', r`$\dfrac{C_2^2}{C_5^2}=\dfrac{1}{10}$`, 2],
        [r`Leia $P(X=1)$.`, 2, '0,6|3/5', r`$\dfrac{C_3^1C_2^1}{10}=\dfrac{6}{10}$`, 2],
        [r`Leia $P(X=2)$.`, 2, '0,3|3/10', r`$\dfrac{C_3^2}{10}=\dfrac{3}{10}$; kontroll $0{,}1+0{,}6+0{,}3=1$ ✓`, 2],
        [r`Leia $E(X)$.`, 3, '1,2', r`$0\cdot0{,}1+1\cdot0{,}6+2\cdot0{,}3=1{,}2$`, 2],
        [r`Milline $X$ väärtus on kõige tõenäolisem?`, 1, '1', r`$P(X=1)=0{,}6$ on suurim.`, 1],
      ] },
      self: ['Koostan jaotustabeli ja kontrollin summat 1.', 'Arvutan keskväärtuse.', 'Joonestan jaotushulknurga.'],
    },
    {
      title: 'Keskmine, mood, mediaan, standardhälve ja normaaljaotus',
      ru: 'Среднее, мода, медиана, стандартное отклонение и нормальное распределение',
      course: 'IV',
      exam: 'Riigieksamil: andmete keskmine, mediaan, standardhälve ja kahe andmerea võrdlus.',
      can: 'Õpilane leiab andmete keskmise, moodi, mediaani ja standardhälbe ning kirjeldab normaaljaotust reegliga 68–95–99,7 %.',
      theory: [
        r`Aritmeetiline keskmine $\bar x=\dfrac{x_1+x_2+\dots+x_n}{n}$; mood — kõige sagedasem väärtus; mediaan — järjestatud rea keskmine liige (paarisarvu korral kahe keskmise keskmine).`,
        r`Standardhälve $\sigma=\sqrt{\dfrac{(x_1-\bar x)^2+\dots+(x_n-\bar x)^2}{n}}$ näitab, kui palju andmed keskmisest hajuvad.`,
        r`Normaaljaotus (kellukakujuline): umbes $68$ % väärtustest on vahemikus $\bar x\pm\sigma$, $95$ % vahemikus $\bar x\pm2\sigma$ ja $99{,}7$ % vahemikus $\bar x\pm3\sigma$.`,
      ],
      ru_hint: [
        'Медиану ищем только в упорядоченном ряду.',
        'Стандартное отклонение: отклонения от среднего, в квадрат, среднее, корень.',
        'Нормальное распределение: 68 % — в пределах одного σ от среднего, 95 % — двух σ.',
      ],
      example: {
        task: r`Andmed: $4$; $7$; $7$; $8$; $9$. Leia keskmine, mood, mediaan ja standardhälve.`,
        steps: [
          r`$\bar x=\dfrac{35}{5}=7$; mood $7$; mediaan (kolmas liige) $7$.`,
          r`Hälbed: $-3;0;0;1;2$; ruudud $9;0;0;1;4$, summa $14$.`,
          r`$\sigma=\sqrt{\dfrac{14}{5}}\approx1{,}67$.`,
          r`Kui andmed on normaaljaotusega, on umbes $68$ % väärtustest vahemikus $\bar x\pm\sigma$ (joonisel varjutatud, $\bar x=0$, $\sigma=1$).`,
        ],
        graph: { fns: 'y = 0.4exp(-x^2/2)', xmin: -4, xmax: 4, ymin: -0.1, ymax: 0.5, step: 1, stepY: 0.1, shade: '0.4exp(-x^2/2); -1; 1', caption: 'normaaljaotuse kõver; varjutatud osa x̄ ± σ ≈ 68 %' },
      },
      practice: [
        { title: r`Andmed: $3$; $5$; $5$; $6$; $8$; $9$.`, parts: [
          ['Leia keskmine.', 1, '6', r`$\dfrac{36}{6}=6$`, 1],
          ['Leia mood.', 1, '5', 'Kõige sagedasem väärtus on 5.', 1],
          ['Leia mediaan.', 1, '5,5', r`Keskmised liikmed $5$ ja $6$: $\dfrac{5+6}{2}=5{,}5$`, 1],
        ] },
        { title: r`Andmed: $2$; $4$; $4$; $4$; $5$; $5$; $7$; $9$.`, parts: [
          ['Leia keskmine.', 1, '5', r`$\dfrac{40}{8}=5$`, 1],
          ['Leia standardhälve.', 2, '2', r`Hälbed $-3;-1;-1;-1;0;0;2;4$, ruutude summa $9+1+1+1+0+0+4+16=32$; $\sigma=\sqrt{\dfrac{32}{8}}=2$`, 3],
        ] },
        { title: 'Kontrolltöö hinded: „2” sai 1, „3” sai 4, „4” sai 10 ja „5” sai 5 õpilast.', parts: [
          ['Leia keskmine hinne.', 2, '3,95', r`$\dfrac{2\cdot1+3\cdot4+4\cdot10+5\cdot5}{20}=\dfrac{79}{20}=3{,}95$`],
          ['Leia mood.', 1, '4', 'Kõige rohkem (10) on hindeid „4”.', 1],
          ['Leia mediaan.', 1, '4', r`$n=20$: 10. ja 11. hinne on mõlemad „4”.`, 1],
        ] },
        { title: 'Poiste pikkus on normaaljaotusega, keskmine 178 cm ja standardhälve 7 cm.', parts: [
          ['Millisesse vahemikku jääb umbes 68 % poistest?', 1, '171; 185|[171;185]', r`$178\pm7$: $171$ kuni $185$ cm.`, 1],
          ['Mitu protsenti poistest on umbes pikemad kui 192 cm?', 2, '2,5', r`$192=178+2\cdot7$. Väljaspool $\bar x\pm2\sigma$ on $5$ %, ülespoole pool sellest: $2{,}5$ %.`],
          ['Umbes mitu poissi 200-st on 171–185 cm pikad?', 1, '136', r`$0{,}68\cdot200=136$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Kahe õpilase viie testi punktid: Anna 12, 15, 14, 13, 16; Mart 8, 20, 11, 19, 12.', parts: [
        ['Leia Anna keskmine.', 1, '14', r`$\dfrac{70}{5}=14$`, 1],
        ['Leia Mardi keskmine.', 1, '14', r`$\dfrac{70}{5}=14$`, 1],
        ['Leia Anna standardhälve kahe kümnendkohani.', 3, '1,41|√2', r`Hälbed $-2;1;0;-1;2$, ruudud kokku $10$; $\sigma=\sqrt{\dfrac{10}{5}}=\sqrt2\approx1{,}41$`, 3],
        ['Leia Mardi standardhälve kahe kümnendkohani.', 3, '4,69|√22', r`Hälbed $-6;6;-3;5;-2$, ruudud kokku $36+36+9+25+4=110$; $\sigma=\sqrt{22}\approx4{,}69$`, 3],
        ['Kumma tulemused on stabiilsemad? Kirjuta nimi.', 2, 'Anna', 'Keskmised on võrdsed, Anna standardhälve on väiksem: tema tulemused hajuvad vähem.', 1],
      ] },
      self: ['Leian keskmise, moodi ja mediaani.', 'Arvutan standardhälbe samm-sammult.', 'Kasutan normaaljaotuse reeglit 68–95–99,7.'],
    },
    {
      title: 'Histogramm, valim ja üldkogum',
      ru: 'Гистограмма, выборка и генеральная совокупность',
      course: 'IV',
      exam: 'Riigieksamil on andmed sageli vahemikega tabelis või histogrammil; keskmine leitakse vahemike keskpunktide kaudu.',
      can: 'Õpilane eristab valimit ja üldkogumit, koostab vahemikega sagedustabeli, joonestab histogrammi ja sageduspolügooni ning leiab keskmise ja kumulatiivse sageduse.',
      theory: [
        r`Üldkogum — kõik uuritavad objektid; valim — nende osa, mida tegelikult uuritakse. Valim peab olema juhuslik ja esinduslik.`,
        r`Suhteline sagedus $=\dfrac{\text{sagedus}}{n}$; kumulatiivne (kogunev) sagedus on sageduste summa kuni antud vahemikuni. Jaotusfunktsioon $F(x)=P(X\le x)$ näitab kogunevat osa.`,
        r`Histogramm: tulbad kõrvuti, laius = vahemik, kõrgus = sagedus. Sageduspolügoon ühendab tulpade ülemiste servade keskpunktid.`,
        r`Vahemikega andmete keskmine: $\bar x\approx\dfrac{m_1f_1+m_2f_2+\dots}{n}$, kus $m_i$ on vahemiku keskpunkt ja $f_i$ sagedus.`,
      ],
      ru_hint: [
        'Выборка — часть генеральной совокупности; она должна быть случайной и представительной.',
        'Для интервалов берём середину интервала как его «значение».',
        'Накопленная частота — сумма частот до этого интервала включительно.',
      ],
      example: {
        task: 'Kooliteele kuluv aeg (min): 0–10 — 6 õpilast, 10–20 — 9, 20–30 — 4, 30–40 — 1. Joonesta histogramm ja leia keskmine aeg.',
        steps: [
          r`$n=6+9+4+1=20$. Vahemike keskpunktid: $5$; $15$; $25$; $35$.`,
          r`$\bar x\approx\dfrac{5\cdot6+15\cdot9+25\cdot4+35\cdot1}{20}=\dfrac{300}{20}=15$ min.`,
          r`Histogrammil on tulbad kõrgusega $6$; $9$; $4$; $1$, polügoon ühendab punktid $A$, $B$, $C$, $D$.`,
        ],
        graph: { fns: '', xmin: -5, xmax: 45, ymin: -1, ymax: 10, step: 5, stepY: 1, labelEvery: 2, shade: '6; 0; 10\n9; 10; 20\n4; 20; 30\n1; 30; 40', points: 'A(5; 6)\nB(15; 9)\nC(25; 4)\nD(35; 1)', segments: 'A-B\nB-C\nC-D', caption: 'histogramm ja sageduspolügoon: x — aeg (min), y — õpilaste arv' },
      },
      practice: [
        { title: 'Tallinna gümnaasiumiõpilaste seast küsitleti 400 õpilast; 140 neist käib trennis.', parts: [
          ['Kui suur on valim?', 1, '400', 'Küsitleti 400 õpilast: valimi maht on 400.', 1],
          ['Leia trennis käijate suhteline sagedus.', 1, '0,35|7/20', r`$\dfrac{140}{400}=0{,}35$`, 1],
          ['Hinda, mitu trennis käijat on 12 000 õpilase hulgas.', 1, '4200', r`$0{,}35\cdot12\,000=4200$`, 1],
          ['Kas valim oleks esinduslik, kui küsitletaks ainult ühe kooli õpilasi? Kirjuta jah või ei.', 1, 'ei', 'Üks kool ei esinda kõiki koole: valim ei ole juhuslik.', 0],
        ] },
        { title: '20 õpilase kaal (kg): 50–60 — 3, 60–70 — 8, 70–80 — 6, 80–90 — 3.', parts: [
          ['Leia vahemiku 60–70 suhteline sagedus.', 1, '0,4|2/5', r`$\dfrac{8}{20}=0{,}4$`, 1],
          ['Leia keskmine kaal.', 2, '69,5', r`$\dfrac{55\cdot3+65\cdot8+75\cdot6+85\cdot3}{20}=\dfrac{1390}{20}=69{,}5$ kg`],
          ['Mitu protsenti õpilastest kaalub vähemalt 70 kg?', 1, '45', r`$\dfrac{6+3}{20}=0{,}45=45$ %`, 1],
        ] },
        { title: 'Eelmise ülesande andmed: leia kumulatiivne suhteline sagedus.', parts: [
          ['Kui suur osa õpilastest kaalub alla 70 kg?', 1, '0,55|11/20', r`$\dfrac{3+8}{20}=0{,}55$`, 1],
          ['Kui suur osa õpilastest kaalub alla 80 kg?', 1, '0,85|17/20', r`$\dfrac{3+8+6}{20}=0{,}85$`, 1],
        ] },
        { title: 'Sageduspolügooni tipud on (5; 2), (15; 7), (25; 8) ja (35; 3) (vahemikud 0–10, 10–20, 20–30, 30–40).', parts: [
          ['Mitu andmet on kokku?', 1, '20', r`$2+7+8+3=20$`, 1],
          ['Millises vahemikus on kõige rohkem andmeid?', 1, '20-30|20–30', 'Suurim sagedus 8 on vahemikus 20–30.', 1],
          ['Leia keskmine.', 2, '21', r`$\dfrac{5\cdot2+15\cdot7+25\cdot8+35\cdot3}{20}=\dfrac{420}{20}=21$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: '30 õpilase kaugushüppe tulemused (m): 3,0–3,5 — 4 õpilast, 3,5–4,0 — 9, 4,0–4,5 — 11, 4,5–5,0 — 6.', grid: { xmin: 2.5, xmax: 5.5, ymin: -1, ymax: 12, step: 0.5, stepY: 1, blank: true }, parts: [
        ['Joonesta histogramm.', 3, '', 'Tulbad laiusega 0,5 m, kõrgused 4; 9; 11; 6; tulbad on kõrvuti.', 0],
        ['Leia keskmine tulemus kahe kümnendkohani.', 3, '4,07', r`$\dfrac{3{,}25\cdot4+3{,}75\cdot9+4{,}25\cdot11+4{,}75\cdot6}{30}=\dfrac{122}{30}\approx4{,}07$ m`, 3],
        ['Kui suur osa õpilastest hüppas vähemalt 4,0 m (kahe kümnendkohani)?', 2, '0,57|17/30', r`$\dfrac{11+6}{30}\approx0{,}57$`, 2],
        ['Kas need 30 ühe kooli õpilast on esinduslik valim kõigist Eesti gümnasistidest? Kirjuta jah või ei.', 2, 'ei', 'Valim on ühest koolist ja väike: see ei esinda kõiki gümnasiste.', 1],
      ] },
      self: ['Eristan valimit ja üldkogumit.', 'Joonestan histogrammi ja polügooni.', 'Leian vahemikega andmete keskmise.'],
    },
    {
      title: 'Kahe suuruse seos ja korrelatsioonikordaja',
      ru: 'Связь двух величин и коэффициент корреляции',
      course: 'IV',
      exam: 'Riigieksamil: hajuvusdiagrammi lugemine ja korrelatsioonikordaja tõlgendamine; arvutis leitakse kordaja funktsiooniga CORREL.',
      can: 'Õpilane joonestab hajuvusdiagrammi, arvutab ja tõlgendab korrelatsioonikordajat ning leiab selle tabelarvutuses.',
      theory: [
        r`Hajuvusdiagramm: iga andmepaar $(x;y)$ on punkt. Kui punktid tõusevad, on seos positiivne, kui langevad — negatiivne.`,
        r`Korrelatsioonikordaja $r=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum(x_i-\bar x)^2\cdot\sum(y_i-\bar y)^2}}$, $\;-1\le r\le1$.`,
        r`$|r|\ge0{,}7$ — tugev seos; $0{,}3\le|r|<0{,}7$ — keskmine; $|r|<0{,}3$ — nõrk. Märk näitab suunda.`,
        r`Tabelarvutuses: $\texttt{=CORREL(A2:A21;B2:B21)}$. Korrelatsioon ei tõesta põhjuslikku seost.`,
      ],
      ru_hint: [
        'r близко к 1 — сильная прямая связь, к −1 — сильная обратная, около 0 — связи почти нет.',
        'Корреляция не значит «причина»: оба явления могут зависеть от третьего.',
        'В таблице (Excel, LibreOffice, Google Sheets) — функция CORREL (по-эстонски KORREL).',
      ],
      example: {
        task: 'Õppimisele kulunud tunnid x ja testi punktid y: (1; 4), (2; 5), (3; 7), (4; 8), (5; 11). Leia korrelatsioonikordaja.',
        steps: [
          r`$\bar x=3$, $\bar y=7$. Hälbed: $x$: $-2;-1;0;1;2$; $\;y$: $-3;-2;0;1;4$.`,
          r`$\sum(x-\bar x)(y-\bar y)=6+2+0+1+8=17$; $\;\sum(x-\bar x)^2=10$; $\;\sum(y-\bar y)^2=30$.`,
          r`$r=\dfrac{17}{\sqrt{10\cdot30}}\approx0{,}98$ — tugev positiivne seos (joonisel trendijoon).`,
        ],
        graph: { fns: 'y = 1.7x + 1.9', xmin: 0, xmax: 6, ymin: 0, ymax: 12, step: 1, stepY: 1, points: 'A(1; 4)\nB(2; 5)\nC(3; 7)\nD(4; 8)\nE(5; 11)', caption: 'hajuvusdiagramm ja trendijoon' },
      },
      practice: [
        { title: 'Korrelatsioonikordaja tõlgendamine.', parts: [
          ['Kumb seos on tugevam: r = −0,85 või r = 0,6? Kirjuta see r.', 1, '-0,85', r`$|-0{,}85|>|0{,}6|$`, 1],
          ['Kas r = 1,3 on võimalik? Kirjuta jah või ei.', 1, 'ei', r`Alati $-1\le r\le1$.`, 0],
          ['Auto vanus ja hind: r = −0,8. Kas seos on positiivne või negatiivne?', 1, 'negatiivne', 'Märk on miinus: vanem auto on odavam.', 0],
        ] },
        { title: 'Andmepaarid: (1; 3), (2; 1), (3; 2), (4; 0).', parts: [
          [r`Leia $\bar x$ ja $\bar y$.`, 1, '2,5; 1,5', r`$\bar x=\dfrac{10}{4}=2{,}5$; $\;\bar y=\dfrac{6}{4}=1{,}5$`, 1],
          [r`Leia $\sum(x_i-\bar x)(y_i-\bar y)$.`, 2, '-4', r`$(-1{,}5)(1{,}5)+(-0{,}5)(-0{,}5)+(0{,}5)(0{,}5)+(1{,}5)(-1{,}5)=-2{,}25+0{,}25+0{,}25-2{,}25=-4$`],
          ['Leia korrelatsioonikordaja.', 2, '-0,8', r`$\sum(x-\bar x)^2=5$, $\sum(y-\bar y)^2=5$: $r=\dfrac{-4}{\sqrt{25}}=-0{,}8$`],
        ] },
        { title: 'Päeva temperatuuri ja müüdud jäätiste arvu korrelatsioonikordaja on 0,92.', parts: [
          ['Kas seos on tugev, keskmine või nõrk?', 1, 'tugev', r`$0{,}92\ge0{,}7$`, 0],
          ['Uppumiste arvu ja jäätise müügi kordaja on 0,7. Kas jäätis põhjustab uppumisi? Kirjuta jah või ei.', 1, 'ei', 'Mõlemad kasvavad soojal ajal: põhjus on kolmas suurus, ilm.', 0],
          ['Selgita, miks suur korrelatsioon ei tõesta põhjuslikku seost.', 2, '', 'Kaks suurust võivad muutuda koos juhuse või ühise põhjuse tõttu.', 2],
        ] },
        { title: 'Tabelarvutuses on x-väärtused lahtrites A2:A21 ja y-väärtused lahtrites B2:B21.', parts: [
          ['Mitu andmepaari on?', 1, '20', 'Read 2 kuni 21: 20 paari.', 1],
          ['Kirjuta valem korrelatsioonikordaja leidmiseks.', 1, '=CORREL(A2:A21;B2:B21)|=KORREL(A2:A21;B2:B21)|=CORREL(A2:A21,B2:B21)', r`$\texttt{=CORREL(A2:A21;B2:B21)}$ (eesti keeles KORREL).`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Päeva temperatuur x (°C) ja müüdud jäätised y: (10; 20), (15; 34), (20; 30), (25; 50), (30; 52).', grid: { xmin: 0, xmax: 35, ymin: 0, ymax: 60, step: 5, stepY: 10, blank: true }, parts: [
        ['Joonesta hajuvusdiagramm.', 2, '', 'Viis punkti; need tõusevad paremale.', 0],
        [r`Leia $\bar x$ ja $\bar y$.`, 2, '20; 37,2', r`$\bar x=\dfrac{100}{5}=20$; $\;\bar y=\dfrac{186}{5}=37{,}2$`, 2],
        ['Leia korrelatsioonikordaja kahe kümnendkohani.', 4, '0,93', r`$\sum(x-\bar x)(y-\bar y)=172+16+0+64+148=400$; $\sum(x-\bar x)^2=250$; $\sum(y-\bar y)^2=740{,}8$; $r=\dfrac{400}{\sqrt{250\cdot740{,}8}}\approx0{,}93$`, 4],
        ['Kirjelda seose tugevust ja suunda.', 2, 'tugev positiivne|positiivne tugev', r`$r\approx0{,}93$: tugev positiivne seos — soojemal päeval müüakse rohkem.`, 1],
      ] },
      self: ['Loen hajuvusdiagrammilt seose suuna.', 'Arvutan ja tõlgendan korrelatsioonikordajat.', 'Leian kordaja tabelarvutuses.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: IV kursus',
      ru: 'Повторение и контрольная работа: IV курс',
      course: 'IV',
      exam: 'IV kursuse teemad annavad riigieksamil tavaliselt ühe 5- või 10-punktilise ülesande.',
      can: 'Õpilane lahendab IV kursuse ülesandeid iseseisvalt: tõenäosus, kombinatoorika, jaotustabel, keskmised ja hajuvus, korrelatsioon.',
      theory: [
        r`$P(A)=\dfrac kn$; $\;P(\bar A)=1-P(A)$; $\;P(AB)=P(A)P(B)$ (sõltumatud); $\;P(A+B)=P(A)+P(B)-P(AB)$`,
        r`$n!$; $\;C_n^k=\dfrac{n!}{k!\,(n-k)!}$; geomeetriline tõenäosus — pikkuste või pindalade suhe.`,
        r`$E(X)=\sum x_ip_i$; $\;\bar x$, mood, mediaan; $\;\sigma=\sqrt{\dfrac{\sum(x_i-\bar x)^2}{n}}$`,
        r`Korrelatsioonikordaja $-1\le r\le1$: märk — suund, $|r|$ — tugevus.`,
      ],
      ru_hint: [
        'Сначала реши задания, в которых уверен, потом возвращайся к трудным.',
        'В задачах на вероятность пиши, что такое n и k.',
        'Проверь: вероятность всегда от 0 до 1.',
      ],
      example: {
        task: 'Karbis on 4 valget ja 2 musta kuuli. Võetakse korraga 2 kuuli. Leia tõenäosus, et need on eri värvi.',
        steps: [
          r`Kõiki valikuid $C_6^2=15$.`,
          r`Soodsad: üks valge ja üks must, $4\cdot2=8$.`,
          r`$P=\dfrac{8}{15}\approx0{,}53$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$C_7^3$`, 1, '35', r`$\dfrac{7\cdot6\cdot5}{6}=35$`, 1],
          [r`$\dfrac{6!}{4!}$`, 1, '30', r`$5\cdot6=30$`, 1],
        ] },
        { title: 'Täringut visatakse kaks korda.', parts: [
          ['Leia tõenäosus, et mõlemal korral tuleb 6.', 1, '1/36|0,03', r`$\dfrac16\cdot\dfrac16=\dfrac{1}{36}$`, 1],
          ['Leia tõenäosus, et vähemalt ühel korral tuleb 6.', 2, '11/36|0,31', r`$1-\left(\dfrac56\right)^2=\dfrac{11}{36}\approx0{,}31$`],
        ] },
        { title: r`Andmed: $5$; $6$; $6$; $8$; $10$.`, parts: [
          ['Leia keskmine.', 1, '7', r`$\dfrac{35}{5}=7$`, 1],
          ['Leia mediaan.', 1, '6', 'Kolmas liige on 6.', 1],
          ['Leia mood.', 1, '6', '6 esineb kaks korda.', 1],
        ] },
        { title: r`$X$ väärtused on $0$, $1$ ja $2$ tõenäosustega $0{,}5$; $0{,}3$; $0{,}2$. Leia $E(X)$.`, parts: [
          ['', 2, '0,7', r`$0+0{,}3+0{,}4=0{,}7$`],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'IV kursus: tõenäosus ja statistika. Aega 45 minutit.', parts: [
        ['1. Klassis on 20 õpilast, neist 8 kannab prille. Leia tõenäosus, et juhuslikult valitud õpilane kannab prille.', 2, '0,4|2/5', r`$\dfrac{8}{20}=0{,}4$`, 1],
        ['2. Mitmel viisil saab 15 inimese hulgast valida 3-liikmelise toimkonna?', 2, '455', r`$C_{15}^3=\dfrac{15\cdot14\cdot13}{6}=455$`, 1],
        ['3. Mitmel viisil saab järjestada 5 esinejat?', 2, '120', r`$5!=120$`, 1],
        [r`4. Lõigul $[0;8]$ valitakse juhuslik punkt. Leia tõenäosus, et see on lõigu keskpunktist kaugemal kui 3.`, 3, '0,25|1/4', r`Keskpunkt $4$; sobivad $[0;1)$ ja $(7;8]$, pikkus kokku $2$: $P=\dfrac28=0{,}25$`, 2],
        [r`5. $A$ ja $B$ on sõltumatud, $P(A)=0{,}6$, $P(B)=0{,}5$. Leia $P(A+B)$.`, 3, '0,8', r`$0{,}6+0{,}5-0{,}3=0{,}8$`, 2],
        ['6. Karbis on 5 punast ja 3 sinist kuuli. Võetakse korraga 2. Leia tõenäosus, et mõlemad on punased (kahe kümnendkohani).', 3, '5/14|0,36', r`$\dfrac{C_5^2}{C_8^2}=\dfrac{10}{28}\approx0{,}36$`, 2],
        [r`7. $X$ väärtused on $1;2;3;5$ tõenäosustega $0{,}2$; $0{,}4$; $a$; $0{,}1$. Leia $a$.`, 2, '0,3', r`$1-0{,}7=0{,}3$`, 1],
        [r`8. Leia $E(X)$.`, 2, '2,4', r`$0{,}2+0{,}8+0{,}9+0{,}5=2{,}4$`, 1],
        [r`9. Andmed: $6$; $8$; $9$; $10$; $12$. Leia keskmine.`, 1, '9', r`$\dfrac{45}{5}=9$`, 1],
        ['10. Leia nende andmete standardhälve.', 3, '2', r`Hälbed $-3;-1;0;1;3$, ruudud kokku $20$; $\sigma=\sqrt{4}=2$`, 2],
        ['11. Korrelatsioonikordaja on −0,9. Kirjelda seose tugevust ja suunda.', 2, 'tugev negatiivne|negatiivne tugev', r`$|r|\ge0{,}7$, märk miinus: tugev negatiivne seos.`, 1],
      ] },
      self: ['Oskan IV kursuse kõiki ülesandetüüpe.', 'Kirjutan iga sammu.', 'Kontrollin, et tõenäosus on 0 ja 1 vahel.'],
    },

    // ───────────── V kursus „Funktsioonid” ─────────────
    {
      title: 'Funktsiooni mõiste ja käigu uurimine',
      ru: 'Понятие функции и исследование её поведения',
      course: 'V',
      exam: 'Riigieksamil küsitakse peaaegu alati funktsiooni nullkohti, positiivsus- ja kasvamisvahemikke ning määramispiirkonda.',
      can: 'Õpilane leiab funktsiooni määramis- ja muutumispiirkonna, nullkohad, positiivsus- ja negatiivsuspiirkonna, kasvamis- ja kahanemisvahemiku ning ekstreemumid.',
      theory: [
        r`Funktsioon seab igale $x\in X$ vastavusse ühe $y=f(x)$. $X$ — määramispiirkond, $Y$ — muutumispiirkond.`,
        r`Määramispiirkond: nimetaja $\ne0$; ruutjuure all $\ge0$; logaritmi all $>0$.`,
        r`Nullkoht: $f(x)=0$. Positiivsuspiirkond $X^+$: $f(x)>0$; negatiivsuspiirkond $X^-$: $f(x)<0$.`,
        r`Kasvav: suurem $x$ annab suurema $y$; kahanev — väiksema. Maksimum- ja miinimumkohas muutub kasvamine kahanemiseks või vastupidi.`,
        r`Paarisfunktsioon: $f(-x)=f(x)$ (sümmeetriline $y$-telje suhtes); paaritu: $f(-x)=-f(x)$ (sümmeetriline nullpunkti suhtes).`,
      ],
      ru_hint: [
        'Область определения: на ноль не делим, под корнем ≥ 0, под логарифмом > 0.',
        'Нули функции — где график пересекает ось x.',
        'Промежутки возрастания и убывания пишем по оси x, а не по y.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=-x^2+2x+3$.`,
        steps: [
          r`$X=\mathbb R$. Nullkohad: $-x^2+2x+3=0\Rightarrow x^2-2x-3=0$: $x_1=-1$, $x_2=3$.`,
          r`Haripunkt $x_0=-\dfrac{b}{2a}=1$, $f(1)=4$: maksimum $4$, $Y=(-\infty;4]$.`,
          r`$X^+=(-1;3)$; $X^-=(-\infty;-1)\cup(3;\infty)$; kasvab $(-\infty;1)$, kahaneb $(1;\infty)$.`,
        ],
        graph: { fns: 'y = -x^2 + 2x + 3', xmin: -3, xmax: 5, ymin: -5, ymax: 5, step: 1, stepY: 1, points: 'A(-1; 0)\nB(3; 0)\nM(1; 4)' },
      },
      practice: [
        { title: 'Leia määramispiirkond.', parts: [
          [r`$f(x)=\sqrt{x-2}$`, 1, '[2;∞)|x>=2|x≥2', r`$x-2\ge0$: $x\ge2$.`, 1],
          [r`$g(x)=\dfrac{1}{x+4}$`, 1, 'x≠-4|x!=-4', r`$x+4\ne0$: $x\ne-4$.`, 1],
          [r`$h(x)=\dfrac{x+1}{x^2-9}$`, 2, 'x≠3; x≠-3|±3', r`$x^2-9\ne0$: $x\ne3$ ja $x\ne-3$.`],
        ] },
        { title: r`$f(x)=2x-6$.`, parts: [
          ['Leia nullkoht.', 1, '3', r`$2x-6=0$, $x=3$.`, 1],
          [r`Leia $X^+$.`, 1, '(3;∞)|x>3', r`$2x-6>0$: $x>3$.`, 1],
          [r`Leia $f(-1)$.`, 1, '-8', r`$-2-6=-8$`, 1],
        ] },
        { title: 'Kas funktsioon on paaris, paaritu või kumbki? Kirjuta paaris, paaritu või kumbki.', parts: [
          [r`$f(x)=x^4-x^2$`, 1, 'paaris', r`$f(-x)=x^4-x^2=f(x)$`, 1],
          [r`$g(x)=x^3+x$`, 1, 'paaritu', r`$g(-x)=-x^3-x=-g(x)$`, 1],
          [r`$h(x)=x^2+x$`, 1, 'kumbki', r`$h(-x)=x^2-x$ — ei võrdu ei $h(x)$ ega $-h(x)$.`, 1],
        ] },
        { title: r`$f(x)=x^2-4x$.`, parts: [
          ['Leia nullkohad.', 1, '0; 4', r`$x(x-4)=0$`, 1],
          ['Leia haripunkt.', 2, '(2;-4)', r`$x_0=2$, $f(2)=4-8=-4$`],
          ['Leia kahanemisvahemik.', 1, '(-∞;2)|x<2', r`$a>0$: kahaneb haripunktist vasakul.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^2-6x+5$.`, grid: { xmin: -1, xmax: 7, ymin: -5, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia nullkohad.', 2, '1; 5', r`$D=36-20=16$, $x=\dfrac{6\pm4}{2}$: $1$ ja $5$.`, 2],
        ['Leia haripunkt.', 2, '(3;-4)', r`$x_0=3$, $f(3)=9-18+5=-4$`, 2],
        [r`Leia negatiivsuspiirkond $X^-$.`, 2, '(1;5)|1<x<5', r`$a>0$: nullkohtade vahel on $f(x)<0$.`, 1],
        ['Leia kasvamisvahemik.', 2, '(3;∞)|x>3', 'Haripunktist paremal kasvab.', 1],
        ['Joonesta graafik.', 2, '', 'Parabool läbib punkte (1; 0), (5; 0), (0; 5), haripunkt (3; −4).', 0],
      ] },
      self: ['Leian määramispiirkonna.', 'Leian nullkohad, X⁺ ja X⁻.', 'Kirjutan kasvamis- ja kahanemisvahemiku.'],
    },
    {
      title: 'Lineaar-, ruut- ja pöördvõrdeline funktsioon',
      ru: 'Линейная, квадратичная функция и обратная пропорциональность',
      course: 'V',
      exam: 'Riigieksami II osas on sageli kahe funktsiooni (sirge, parabool, hüperbool) lõikepunktid ja tekstülesanne lineaarfunktsiooniga.',
      can: 'Õpilane koostab lineaarfunktsiooni valemi, leiab parabooli haripunkti, kasutab funktsiooni y = a/x ja nihutab graafikut.',
      theory: [
        r`$y=ax+b$: $a$ — tõus, $b$ — algordinaat (lõikepunkt $y$-teljega).`,
        r`$y=ax^2+bx+c$: haripunkt $x_0=-\dfrac{b}{2a}$; $a>0$ — harud üles, $a<0$ — alla.`,
        r`$y=\dfrac ax$ (pöördvõrdeline seos): hüperbool, asümptoodid on teljed; $a>0$ — I ja III veerand, $a<0$ — II ja IV veerand.`,
        r`Nihe: $y=f(x-m)+n$ — graafik nihkub $m$ ühikut paremale ja $n$ ühikut üles.`,
      ],
      ru_hint: [
        'Угловой коэффициент a — насколько растёт y, когда x растёт на 1.',
        'Вершина параболы: x₀ = −b/(2a), потом y₀ = f(x₀).',
        'Гипербола y = a/x не пересекает оси: x ≠ 0 и y ≠ 0.',
      ],
      example: {
        task: r`Leia hüperbooli $y=\dfrac2x$ ja sirge $y=x+1$ lõikepunktid.`,
        steps: [
          r`$\dfrac2x=x+1$, $x\ne0$: $\;x^2+x-2=0$.`,
          r`$x_1=1$, $x_2=-2$; $\;y_1=2$, $y_2=-1$.`,
          r`Lõikepunktid $A(1;2)$ ja $B(-2;-1)$.`,
        ],
        graph: { fns: 'y = 2/x\ny = x + 1', xmin: -4, xmax: 4, ymin: -4, ymax: 4, step: 1, stepY: 1, points: 'A(1; 2)\nB(-2; -1)' },
      },
      practice: [
        { title: 'Sirge läbib punkte (1; 5) ja (3; 9).', parts: [
          ['Koosta sirge võrrand.', 2, 'y=2x+3', r`$a=\dfrac{9-5}{3-1}=2$; $5=2+b$, $b=3$.`],
          [r`Leia $y$, kui $x=-4$.`, 1, '-5', r`$-8+3=-5$`, 1],
          ['Leia nullkoht.', 1, '-1,5|-3/2', r`$2x+3=0$, $x=-1{,}5$`, 1],
        ] },
        { title: r`$y=x^2-4x+1$.`, parts: [
          ['Leia haripunkt.', 2, '(2;-3)', r`$x_0=2$, $y_0=4-8+1=-3$`],
          ['Leia muutumispiirkond.', 1, '[-3;∞)|y>=-3|y≥-3', r`$a>0$: $y\ge-3$.`, 1],
          [r`Leia lõikepunkt $y$-teljega.`, 1, '(0;1)', r`$x=0$: $y=1$.`, 1],
        ] },
        { title: r`$f(x)=-\dfrac2x$.`, parts: [
          [r`Leia $f(4)$.`, 1, '-0,5|-1/2', r`$-\dfrac24=-0{,}5$`, 1],
          [r`Leia $x$, kui $f(x)=1$.`, 1, '-2', r`$-\dfrac2x=1$, $x=-2$.`, 1],
          ['Millistes veerandites on graafik?', 1, 'II ja IV|II; IV', r`$a=-2<0$: II ja IV veerand.`, 1],
        ] },
        { title: r`Parabooli $y=x^2$ nihutatakse 3 ühikut paremale ja 2 ühikut üles.`, parts: [
          ['Kirjuta uue parabooli võrrand.', 2, 'y=(x-3)^2+2|y=(x-3)²+2|y=x^2-6x+11|y=x²-6x+11', r`$y=(x-3)^2+2=x^2-6x+11$`],
          ['Leia uue parabooli haripunkt.', 1, '(3;2)', 'Haripunkt nihkub koos graafikuga: (0; 0) → (3; 2).', 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Takso A: alustasu 3 € ja 0,80 € iga kilomeetri eest. Takso B: alustasu ei ole, 1,60 € iga kilomeetri eest.', grid: { xmin: 0, xmax: 8, ymin: 0, ymax: 12, step: 1, stepY: 2, blank: true }, parts: [
        ['Kirjuta takso A sõidu hinna valem, kui sõidu pikkus on x km.', 2, 'y=0,8x+3|0,8x+3|f(x)=0,8x+3', r`$y=0{,}8x+3$`, 1],
        ['Kirjuta takso B sõidu hinna valem.', 1, 'y=1,6x|1,6x|g(x)=1,6x', r`$y=1{,}6x$`, 1],
        ['Mitme kilomeetri pikkuse sõidu hind on mõlemal taksol sama?', 3, '3,75', r`$0{,}8x+3=1{,}6x$, $0{,}8x=3$, $x=3{,}75$ km`, 2],
        ['Leia 10 km sõidu hind taksoga A ja taksoga B.', 2, '11; 16', r`A: $0{,}8\cdot10+3=11$ €; B: $1{,}6\cdot10=16$ €`, 2],
        ['Joonesta mõlema takso graafik lõigul 0–8 km.', 2, '', 'A läbib (0; 3) ja (5; 7); B läbib (0; 0) ja (5; 8); lõikepunkt (3,75; 6).', 0],
      ] },
      self: ['Koostan sirge võrrandi kahe punkti järgi.', 'Leian parabooli haripunkti.', 'Leian kahe graafiku lõikepunktid.'],
    },
    {
      title: 'Logaritm ja selle omadused',
      ru: 'Логарифм и его свойства',
      course: 'V',
      exam: 'Logaritmi reeglid on riigieksamil logaritmvõrrandites ja kasvuülesannetes (aja leidmine). Valemilehel neid ei ole.',
      can: 'Õpilane arvutab logaritmi definitsiooni järgi, kasutab logaritmi omadusi ja leiab logaritmi kalkulaatoriga.',
      theory: [
        r`$\log_a b=c\;\Leftrightarrow\;a^c=b$, kus $a>0$, $a\ne1$, $b>0$. $\;\lg b=\log_{10}b$, $\;\ln b=\log_e b$, $e\approx2{,}718$.`,
        r`$\log_a1=0$, $\;\log_aa=1$, $\;a^{\log_ab}=b$`,
        r`$\log_a(xy)=\log_ax+\log_ay$, $\;\log_a\dfrac xy=\log_ax-\log_ay$, $\;\log_ax^k=k\log_ax$`,
        r`Uus alus: $\log_ab=\dfrac{\ln b}{\ln a}=\dfrac{\lg b}{\lg a}$ (kalkulaatoriga).`,
      ],
      ru_hint: [
        'Логарифм — это показатель степени: log₂8 = 3, потому что 2³ = 8.',
        'Логарифм произведения = сумма логарифмов, частного — разность.',
        'На калькуляторе log₃50 = ln 50 / ln 3.',
      ],
      example: {
        task: r`Arvuta $\log_28+\log_3\dfrac19-\lg0{,}01$.`,
        steps: [
          r`$\log_28=3$, sest $2^3=8$.`,
          r`$\log_3\dfrac19=-2$, sest $3^{-2}=\dfrac19$; $\;\lg0{,}01=-2$, sest $10^{-2}=0{,}01$.`,
          r`$3+(-2)-(-2)=3$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$\log_232$`, 1, '5', r`$2^5=32$`, 1],
          [r`$\log_51$`, 1, '0', r`$5^0=1$`, 1],
          [r`$\lg1000$`, 1, '3', r`$10^3=1000$`, 1],
          [r`$\log_{\frac12}4$`, 1, '-2', r`$\left(\dfrac12\right)^{-2}=4$`, 1],
        ] },
        { title: 'Arvuta logaritmi omaduste abil.', parts: [
          [r`$\log_64+\log_69$`, 1, '2', r`$\log_636=2$`, 1],
          [r`$\log_354-\log_32$`, 1, '3', r`$\log_327=3$`, 1],
          [r`$2\lg5+\lg4$`, 2, '2', r`$\lg25+\lg4=\lg100=2$`],
        ] },
        { title: 'Arvuta kalkulaatoriga kahe kümnendkohani.', parts: [
          [r`$\log_210$`, 1, '3,32', r`$\dfrac{\ln10}{\ln2}\approx3{,}32$`, 1],
          [r`$\ln20$`, 1, '3,00|3', r`$\ln20\approx3{,}00$`, 1],
          [r`$\log_350$`, 1, '3,56', r`$\dfrac{\ln50}{\ln3}\approx3{,}56$`, 1],
        ] },
        { title: 'Leia x logaritmi definitsiooni abil.', parts: [
          [r`$\log_x49=2$`, 1, '7', r`$x^2=49$, $x>0$: $x=7$.`, 1],
          [r`$\log_2x=-3$`, 1, '0,125|1/8', r`$x=2^{-3}=\dfrac18$`, 1],
          [r`$\lg x=2{,}5$ (kahe kümnendkohani)`, 2, '316,23', r`$x=10^{2{,}5}\approx316{,}23$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Lahuse happelisust näitab $\mathrm{pH}=-\lg c$, kus $c$ on vesinikioonide kontsentratsioon (mol/l).`, parts: [
        [r`Leia pH, kui $c=10^{-4}$.`, 1, '4', r`$-\lg10^{-4}=4$`, 1],
        [r`Leia pH kahe kümnendkohani, kui $c=3\cdot10^{-6}$.`, 2, '5,52', r`$-\lg(3\cdot10^{-6})=6-\lg3\approx5{,}52$`, 2],
        ['Mitu korda on lahuse pH 3 kontsentratsioon suurem kui lahusel pH 5?', 2, '100', r`$\dfrac{10^{-3}}{10^{-5}}=10^2=100$`, 2],
      ] },
      self: ['Arvutan logaritmi definitsiooni järgi.', 'Kasutan logaritmi omadusi.', 'Leian logaritmi kalkulaatoriga uue aluse valemiga.'],
    },
    {
      title: 'Eksponent- ja logaritmfunktsioon',
      ru: 'Показательная и логарифмическая функции',
      course: 'V',
      exam: 'Riigieksamil: eksponentfunktsiooni graafik, kasvamine ja kahanemine ning mudelid y = a·bˣ.',
      can: 'Õpilane joonestab eksponent- ja logaritmfunktsiooni graafiku, kirjeldab nende omadusi ja arvutab nende väärtusi.',
      theory: [
        r`Eksponentfunktsioon $y=a^x$ ($a>0$, $a\ne1$): $X=\mathbb R$, $Y=(0;\infty)$, graafik läbib punkti $(0;1)$.`,
        r`$a>1$ — kasvab; $0<a<1$ — kahaneb. $x$-telg on asümptoot.`,
        r`Logaritmfunktsioon $y=\log_ax$: $X=(0;\infty)$, $Y=\mathbb R$, läbib punkti $(1;0)$; $y$-telg on asümptoot.`,
        r`$y=a^x$ ja $y=\log_ax$ on teineteise pöördfunktsioonid: graafikud on sümmeetrilised sirge $y=x$ suhtes.`,
      ],
      ru_hint: [
        'Показательная функция всегда положительна и проходит через (0; 1).',
        'Логарифмическая функция определена только при x > 0 и проходит через (1; 0).',
        'Графики aˣ и logₐx симметричны относительно прямой y = x.',
      ],
      example: {
        task: r`Joonesta funktsioonide $y=2^x$ ja $y=\log_2x$ graafikud.`,
        steps: [
          r`$y=2^x$: $(-1;\frac12)$, $(0;1)$, $(1;2)$, $(2;4)$.`,
          r`$y=\log_2x$: vaheta koordinaadid: $(\frac12;-1)$, $(1;0)$, $(2;1)$, $(4;2)$.`,
          r`Graafikud on sümmeetrilised sirge $y=x$ suhtes; $A(0;1)$ ja $B(1;0)$.`,
        ],
        graph: { fns: 'y = 2^x\ny = ln(x)/ln(2)\ny = x', xmin: -3, xmax: 5, ymin: -3, ymax: 5, step: 1, stepY: 1, points: 'A(0; 1)\nB(1; 0)', caption: 'tumesinine: y = 2ˣ · roheline: y = log₂ x · punane: y = x' },
      },
      practice: [
        { title: r`$f(x)=3^x$.`, parts: [
          [r`Leia $f(2)$.`, 1, '9', r`$3^2=9$`, 1],
          [r`Leia $f(-1)$.`, 1, '1/3|0,33', r`$3^{-1}=\dfrac13$`, 1],
          [r`Leia $x$, kui $f(x)=81$.`, 1, '4', r`$3^4=81$`, 1],
        ] },
        { title: 'Kas funktsioon on kasvav või kahanev? Kirjuta kasvav või kahanev.', parts: [
          [r`$y=0{,}5^x$`, 1, 'kahanev', r`$0<0{,}5<1$`, 1],
          [r`$y=\log_3x$`, 1, 'kasvav', r`$3>1$`, 1],
          [r`$y=\left(\dfrac54\right)^x$`, 1, 'kasvav', r`$\dfrac54>1$`, 1],
        ] },
        { title: r`$g(x)=\log_2x$.`, parts: [
          [r`Leia $g(16)$.`, 1, '4', r`$2^4=16$`, 1],
          [r`Leia $g\!\left(\frac14\right)$.`, 1, '-2', r`$2^{-2}=\dfrac14$`, 1],
          ['Leia määramispiirkond.', 1, '(0;∞)|x>0', 'Logaritmi all peab olema positiivne arv.', 1],
        ] },
        { title: 'Arvuta kalkulaatoriga kahe kümnendkohani.', parts: [
          [r`$e^2$`, 1, '7,39', r`$e^2\approx7{,}39$`, 1],
          [r`$e^{-1}$`, 1, '0,37', r`$\dfrac1e\approx0{,}37$`, 1],
          [r`$\ln e^5$`, 1, '5', r`$\ln e^5=5\ln e=5$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=2^x-4$.`, grid: { xmin: -4, xmax: 4, ymin: -5, ymax: 5, step: 1, stepY: 1, blank: true }, parts: [
        [r`Leia $f(0)$.`, 1, '-3', r`$1-4=-3$`, 1],
        ['Leia nullkoht.', 2, '2', r`$2^x=4$, $x=2$`, 2],
        ['Leia muutumispiirkond.', 2, '(-4;∞)|y>-4', r`$2^x>0$, seega $2^x-4>-4$.`, 1],
        ['Kirjuta asümptoodi võrrand.', 2, 'y=-4', r`Kui $x\to-\infty$, siis $2^x\to0$ ja $f(x)\to-4$.`, 1],
        ['Joonesta graafik.', 3, '', 'Graafik y = 2ˣ nihutatud 4 ühikut alla: (0; −3), (2; 0), (3; 4), asümptoot y = −4.', 0],
      ] },
      self: ['Joonestan graafiku y = aˣ.', 'Tean y = logₐx määramispiirkonda.', 'Eristan kasvavat ja kahanevat eksponentfunktsiooni.'],
    },
    {
      title: 'Eksponent- ja logaritmvõrrandid',
      ru: 'Показательные и логарифмические уравнения',
      course: 'V',
      exam: 'Lihtne eksponent- või logaritmvõrrand on riigieksami I osas (5 p); kasvuülesandes tuleb leida aeg logaritmi abil.',
      can: 'Õpilane lahendab lihtsamaid eksponent- ja logaritmvõrrandeid ning kontrollib logaritmvõrrandi lahendeid.',
      theory: [
        r`$a^{f(x)}=a^{g(x)}\;\Rightarrow\;f(x)=g(x)$ — vii mõlemad pooled ühele alusele.`,
        r`$a^x=b\;\Rightarrow\;x=\log_ab=\dfrac{\ln b}{\ln a}$.`,
        r`$\log_af(x)=c\;\Rightarrow\;f(x)=a^c$; $\;\log_af(x)=\log_ag(x)\;\Rightarrow\;f(x)=g(x)$. Kontrolli, et logaritmi all on positiivne arv.`,
        r`Asendus: $4^x=(2^x)^2$, tähista $t=2^x>0$ ja lahenda ruutvõrrand.`,
      ],
      ru_hint: [
        'Приводим обе части к одному основанию: 8 = 2³, 1/9 = 3⁻².',
        'Если к одному основанию не привести — логарифмируем: x = ln b / ln a.',
        'В логарифмическом уравнении обязательно проверяем корни.',
      ],
      example: {
        task: r`Lahenda $2^{x-1}=8$.`,
        steps: [
          r`$8=2^3$: $\;2^{x-1}=2^3$.`,
          r`$x-1=3$, $x=4$.`,
          r`Graafikul lõikuvad $y=2^{x-1}$ ja $y=8$ punktis $P(4;8)$.`,
        ],
        graph: { fns: 'y = 2^(x - 1)\ny = 8', xmin: -2, xmax: 6, ymin: -1, ymax: 10, step: 1, stepY: 2, points: 'P(4; 8)' },
      },
      practice: [
        { title: 'Lahenda.', parts: [
          [r`$5^x=125$`, 1, '3', r`$5^x=5^3$`, 1],
          [r`$2^{3x-1}=32$`, 1, '2', r`$3x-1=5$, $x=2$`, 1],
          [r`$\left(\dfrac13\right)^x=9$`, 1, '-2', r`$3^{-x}=3^2$, $x=-2$`, 1],
          [r`$4^x=8$`, 1, '1,5|3/2', r`$2^{2x}=2^3$, $x=1{,}5$`, 1],
        ] },
        { title: 'Lahenda kahe kümnendkohani.', parts: [
          [r`$3^x=20$`, 2, '2,73', r`$x=\dfrac{\ln20}{\ln3}\approx2{,}73$`],
          [r`$1{,}05^x=2$`, 2, '14,21', r`$x=\dfrac{\ln2}{\ln1{,}05}\approx14{,}21$`],
        ] },
        { title: 'Lahenda logaritmvõrrand.', parts: [
          [r`$\log_3x=4$`, 1, '81', r`$x=3^4=81$`, 1],
          [r`$\lg(2x-4)=1$`, 1, '7', r`$2x-4=10$, $x=7$`, 1],
          [r`$\log_2(x+1)+\log_2(x-1)=3$`, 2, '3', r`$\log_2(x^2-1)=3$, $x^2-1=8$, $x=\pm3$; $x=-3$ ei sobi ($x-1<0$).`, 3],
        ] },
        { title: 'Lahenda asendusega.', parts: [
          [r`$4^x-3\cdot2^x-4=0$`, 2, '2', r`$t=2^x$: $t^2-3t-4=0$, $t=4$ või $t=-1$ (ei sobi). $2^x=4$, $x=2$.`, 3],
          [r`$9^x-10\cdot3^x+9=0$`, 2, '0; 2', r`$t=3^x$: $t^2-10t+9=0$, $t=1$ või $t=9$: $x=0$ või $x=2$.`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Lahenda võrrandid.', parts: [
        [r`$2^{x+3}-2^x=56$`, 3, '3', r`$2^x(2^3-1)=56$, $7\cdot2^x=56$, $2^x=8$, $x=3$.`, 3],
        [r`$\lg(x+2)+\lg(x-1)=1$`, 4, '3', r`$(x+2)(x-1)=10$, $x^2+x-12=0$: $x=3$ või $x=-4$. Kontroll: $x=-4$ korral $x-1<0$ — ei sobi. Vastus $x=3$.`, 4],
        [r`$3\cdot5^x=75$`, 3, '2', r`$5^x=25=5^2$, $x=2$.`, 2],
      ] },
      self: ['Viin astmed ühele alusele.', 'Logaritmin, kui ühist alust ei ole.', 'Kontrollin logaritmvõrrandi lahendid.'],
    },
    {
      title: 'Liitprotsendiline kasvamine ja kahanemine',
      ru: 'Сложные проценты: рост и убывание',
      course: 'V',
      exam: 'Riigieksami II osa 10-punktiline ülesanne: hoius, laen, rahvaarv, auto väärtus, radioaktiivne lagunemine.',
      can: 'Õpilane arvutab liitprotsendilise kasvu ja kahanemise ning leiab aja logaritmi abil.',
      theory: [
        r`Kasv: $K_n=K_0\left(1+\dfrac{p}{100}\right)^n$; kahanemine: $K_n=K_0\left(1-\dfrac{p}{100}\right)^n$.`,
        r`$q=1\pm\dfrac{p}{100}$ on kasvutegur: $3$ % kasv $\Rightarrow q=1{,}03$; $15$ % kahanemine $\Rightarrow q=0{,}85$.`,
        r`Aja leidmine: $q^n=\dfrac{K_n}{K_0}\;\Rightarrow\;n=\dfrac{\ln(K_n/K_0)}{\ln q}$.`,
        r`Poolestusaeg $T$: aeg, mille jooksul kogus väheneb poole võrra: $q^T=0{,}5$.`,
      ],
      ru_hint: [
        'Сложный процент: каждый год умножаем на один и тот же множитель q.',
        'Рост на 3 % — q = 1,03; уменьшение на 15 % — q = 0,85.',
        'Время находим логарифмированием и округляем вверх до целого года, если спрашивают «через сколько лет».',
      ],
      example: {
        task: 'Hoiusele pannakse 1000 € intressiga 4 % aastas (intress liidetakse hoiusele). Kui suur on hoius 10 aasta pärast?',
        steps: [
          r`$q=1{,}04$, $\;K_{10}=1000\cdot1{,}04^{10}$.`,
          r`$1{,}04^{10}\approx1{,}4802$, $\;K_{10}\approx1480{,}24$ €.`,
          r`Graafikul on $y=1{,}04^x$ (tuhandetes eurodes), punkt $P(10;1{,}48)$.`,
        ],
        graph: { fns: 'y = 1.04^x', xmin: -1, xmax: 20, ymin: 0, ymax: 2.5, step: 2, stepY: 0.5, points: 'P(10; 1.48)', caption: 'hoius tuhandetes eurodes, x — aastad' },
      },
      practice: [
        { title: 'Hoiusele pannakse 2000 € intressiga 3 % aastas.', parts: [
          ['Kui suur on hoius 5 aasta pärast?', 2, '2318,55', r`$2000\cdot1{,}03^5\approx2318{,}55$ €`],
          ['Kui palju intressi on selleks ajaks kogunenud?', 1, '318,55', r`$2318{,}55-2000=318{,}55$ €`, 1],
        ] },
        { title: 'Auto maksab 20 000 € ja tema väärtus väheneb 15 % aastas.', parts: [
          ['Kui palju on auto väärt 3 aasta pärast?', 2, '12282,5', r`$20\,000\cdot0{,}85^3=12\,282{,}50$ €`],
          ['Mitu protsenti algväärtusest on siis järel (kahe kümnendkohani)?', 1, '61,41', r`$0{,}85^3=0{,}614125\approx61{,}41$ %`, 1],
        ] },
        { title: 'Linnas elab 50 000 inimest, elanike arv kasvab 2 % aastas.', parts: [
          ['Kirjuta kasvutegur.', 1, '1,02', r`$q=1+0{,}02=1{,}02$`, 1],
          ['Mitme täisaasta pärast ületab elanike arv 60 000?', 2, '10', r`$1{,}02^n>1{,}2$, $n>\dfrac{\ln1{,}2}{\ln1{,}02}\approx9{,}21$: 10 aasta pärast.`, 3],
        ] },
        { title: 'Protsendid järjest.', parts: [
          ['Hind tõuseb 10 % ja seejärel langeb 10 %. Mitu protsenti alghinnast on lõpphind?', 2, '99', r`$1{,}1\cdot0{,}9=0{,}99=99$ %`],
          ['Hind tõusis kaks korda järjest sama arvu protsentide võrra, kokku 21 %. Mitu protsenti oli üks tõus?', 2, '10', r`$q^2=1{,}21$, $q=1{,}1$: 10 %.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Radioaktiivse aine kogus väheneb igal aastal 6 %. Alguses on ainet 80 g.', parts: [
        ['Kirjuta valem aine koguse leidmiseks t aasta pärast.', 2, '80·0,94^t|80*0,94^t|m(t)=80·0,94^t|m=80·0,94^t', r`$m(t)=80\cdot0{,}94^t$`, 1],
        ['Kui palju ainet on järel 5 aasta pärast (kahe kümnendkohani)?', 2, '58,71', r`$80\cdot0{,}94^5\approx58{,}71$ g`, 2],
        ['Leia aine poolestusaeg aastates kahe kümnendkohani.', 3, '11,2|11,20', r`$0{,}94^T=0{,}5$, $T=\dfrac{\ln0{,}5}{\ln0{,}94}\approx11{,}20$ aastat`, 3],
        ['Mitme täisaasta pärast on ainet esimest korda alla 20 g?', 3, '23', r`$0{,}94^t<0{,}25$, $t>\dfrac{\ln0{,}25}{\ln0{,}94}\approx22{,}40$: 23 aasta pärast.`, 3],
      ] },
      self: ['Leian kasvuteguri q.', 'Arvutan koguse n aasta pärast.', 'Leian aja logaritmi abil.'],
    },
    {
      title: 'Trigonomeetrilised põhivõrrandid graafiku abil',
      ru: 'Простейшие тригонометрические уравнения с помощью графика',
      course: 'V',
      exam: 'Riigieksamil lahendatakse sin x = a või cos x = a lõigul [0°; 360°], sageli graafiku juures.',
      can: 'Õpilane lahendab võrrandeid sin x = a, cos x = a ja tan x = a lõigul [0°; 360°] graafiku ja kalkulaatori abil.',
      theory: [
        r`$\sin x=a$ ($|a|\le1$): $x_1=\sin^{-1}a$, $\;x_2=180^\circ-x_1$ (+ $k\cdot360^\circ$).`,
        r`$\cos x=a$ ($|a|\le1$): $x_1=\cos^{-1}a$, $\;x_2=360^\circ-x_1$ (+ $k\cdot360^\circ$).`,
        r`$\tan x=a$: $x_1=\tan^{-1}a$, $\;x_2=x_1+180^\circ$ (periood $180^\circ$).`,
        r`Graafiliselt: lahendid on graafikute $y=\sin x$ ja $y=a$ lõikepunktide $x$-koordinaadid. Kui $|a|>1$, lahendeid ei ole.`,
      ],
      ru_hint: [
        'На отрезке [0°; 360°] у sin x = a и cos x = a обычно два решения.',
        'Калькулятор даёт только одно — второе находим по формуле или по графику.',
        'Если |a| > 1, у sin x = a и cos x = a решений нет.',
      ],
      example: {
        task: r`Lahenda $\sin x=0{,}5$ lõigul $[0^\circ;360^\circ]$.`,
        steps: [
          r`$x_1=\sin^{-1}0{,}5=30^\circ$.`,
          r`$x_2=180^\circ-30^\circ=150^\circ$.`,
          r`Graafikul lõikab sirge $y=0{,}5$ sinusoidi punktides $A$ ja $B$.`,
        ],
        graph: { fns: 'y = sin(x)\ny = 0.5', angle: 'deg', xmin: 0, xmax: 360, ymin: -1.5, ymax: 1.5, step: 30, stepY: 0.5, labelEvery: 3, points: 'A(30; 0.5)\nB(150; 0.5)' },
      },
      practice: [
        { title: r`Lahenda lõigul $[0^\circ;360^\circ]$.`, parts: [
          [r`$\sin x=\dfrac{\sqrt2}{2}$`, 1, '45; 135', r`$45^\circ$ ja $180^\circ-45^\circ=135^\circ$`, 1],
          [r`$\cos x=0$`, 1, '90; 270', r`$90^\circ$ ja $360^\circ-90^\circ=270^\circ$`, 1],
          [r`$\tan x=1$`, 1, '45; 225', r`$45^\circ$ ja $45^\circ+180^\circ=225^\circ$`, 1],
        ] },
        { title: r`Lahenda lõigul $[0^\circ;360^\circ]$.`, parts: [
          [r`$\cos x=-0{,}5$`, 1, '120; 240', r`$\cos^{-1}(-0{,}5)=120^\circ$; $360^\circ-120^\circ=240^\circ$`, 1],
          [r`$\sin x=-1$`, 1, '270', 'Ainult üks lahend: 270°.', 1],
          [r`$2\cos x+\sqrt3=0$`, 2, '150; 210', r`$\cos x=-\dfrac{\sqrt3}{2}$: $150^\circ$ ja $210^\circ$.`],
        ] },
        { title: r`Lahenda lõigul $[0^\circ;360^\circ]$ kahe kümnendkohani.`, parts: [
          [r`$\sin x=0{,}3$`, 2, '17,46; 162,54', r`$\sin^{-1}0{,}3\approx17{,}46^\circ$; $180^\circ-17{,}46^\circ=162{,}54^\circ$`],
          [r`$\cos x=0{,}8$`, 2, '36,87; 323,13', r`$\cos^{-1}0{,}8\approx36{,}87^\circ$; $360^\circ-36{,}87^\circ=323{,}13^\circ$`],
        ] },
        { title: 'Lahendite arv.', parts: [
          [r`Mitu lahendit on võrrandil $\sin x=0{,}5$ lõigul $[0^\circ;720^\circ]$?`, 1, '4', r`$30^\circ$, $150^\circ$, $390^\circ$, $510^\circ$`, 1],
          [r`Mitu lahendit on võrrandil $\cos x=1{,}2$?`, 1, '0', r`$|\cos x|\le1$ — lahendeid ei ole.`, 1],
          [r`Lahenda $\tan x=-1$ lõigul $[0^\circ;360^\circ]$.`, 2, '135; 315', r`$\tan^{-1}(-1)=-45^\circ$; lõigul: $135^\circ$ ja $315^\circ$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=2\sin x$ ja $g(x)=1$ lõigul $[0^\circ;360^\circ]$.`, grid: { angle: 'deg', xmin: 0, xmax: 360, ymin: -2.5, ymax: 2.5, step: 30, stepY: 0.5, labelEvery: 3, blank: true }, parts: [
        ['Joonesta mõlema funktsiooni graafik.', 3, '', 'f: (0°; 0), (90°; 2), (180°; 0), (270°; −2), (360°; 0); g on sirge y = 1.', 0],
        [r`Lahenda võrrand $2\sin x=1$.`, 3, '30; 150', r`$\sin x=0{,}5$: $30^\circ$ ja $150^\circ$.`, 2],
        [r`Lahenda võrratus $2\sin x>1$.`, 2, '30<x<150|(30;150)', r`Graafik $f$ on sirgest $g$ kõrgemal lõigul $30^\circ<x<150^\circ$.`, 1],
        [r`Leia funktsiooni $f$ suurim väärtus.`, 1, '2', r`$\sin x\le1$, seega $2\sin x\le2$.`, 1],
        ['Millise x korral on f väärtus suurim?', 1, '90', r`$\sin90^\circ=1$`, 1],
      ] },
      self: ['Leian kalkulaatoriga esimese lahendi.', 'Leian teise lahendi valemi või graafiku abil.', 'Tean, millal lahendeid ei ole.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: V kursus',
      ru: 'Повторение и контрольная работа: V курс',
      course: 'V',
      exam: 'V kursuse teemad on riigieksamil mitmes ülesandes: funktsiooni uurimine, eksponent- ja logaritmvõrrand, liitprotsent.',
      can: 'Õpilane lahendab V kursuse ülesandeid iseseisvalt: funktsiooni uurimine, logaritmid, eksponent- ja logaritmvõrrandid, liitprotsent, trigonomeetrilised põhivõrrandid.',
      theory: [
        r`Määramispiirkond, nullkohad, $X^+$, $X^-$, kasvamine ja kahanemine; haripunkt $x_0=-\dfrac{b}{2a}$.`,
        r`$\log_ab=c\Leftrightarrow a^c=b$; $\;\log_a(xy)=\log_ax+\log_ay$; $\;\log_ab=\dfrac{\ln b}{\ln a}$`,
        r`$K_n=K_0q^n$; $\;n=\dfrac{\ln(K_n/K_0)}{\ln q}$`,
        r`$\sin x=a$: $x_2=180^\circ-x_1$; $\;\cos x=a$: $x_2=360^\circ-x_1$`,
      ],
      ru_hint: [
        'Сначала реши задания, в которых уверен, потом возвращайся к трудным.',
        'В логарифмическом уравнении проверь корни.',
        'Проценты: каждый год умножаем на q.',
      ],
      example: {
        task: r`Lahenda $\lg(x+3)+\lg x=1$.`,
        steps: [
          r`$\lg\big(x(x+3)\big)=1$, $\;x^2+3x=10$, $\;x^2+3x-10=0$.`,
          r`$x=2$ või $x=-5$.`,
          r`$x=-5$ korral $\lg(-5)$ ei ole määratud. Vastus: $x=2$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$\log_464$`, 1, '3', r`$4^3=64$`, 1],
          [r`$\log_212-\log_23$`, 1, '2', r`$\log_24=2$`, 1],
        ] },
        { title: 'Lahenda.', parts: [
          [r`$3^{2x-1}=27$`, 1, '2', r`$2x-1=3$, $x=2$`, 1],
          [r`$7^x=30$ (kahe kümnendkohani)`, 2, '1,75', r`$x=\dfrac{\ln30}{\ln7}\approx1{,}75$`],
        ] },
        { title: r`$f(x)=\sqrt{6-2x}$.`, parts: [
          ['Leia määramispiirkond.', 2, '(-∞;3]|x<=3|x≤3', r`$6-2x\ge0$: $x\le3$.`],
          [r`Leia $f(1)$.`, 1, '2', r`$\sqrt4=2$`, 1],
        ] },
        { title: r`Lahenda $\cos x=0{,}5$ lõigul $[0^\circ;360^\circ]$.`, parts: [
          ['', 2, '60; 300', r`$60^\circ$ ja $360^\circ-60^\circ=300^\circ$`],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'V kursus: funktsioonid. Aega 45 minutit.', parts: [
        [r`1. Arvuta $\log_381+\lg0{,}1$.`, 2, '3', r`$4+(-1)=3$`, 1],
        [r`2. Leia funktsiooni $f(x)=\dfrac{x+2}{x^2-4x}$ määramispiirkond: millised $x$ ei sobi?`, 2, '0; 4|x≠0; x≠4', r`$x(x-4)\ne0$: $x\ne0$ ja $x\ne4$.`, 1],
        [r`3. $g(x)=-x^2+4x$. Leia nullkohad.`, 2, '0; 4', r`$-x(x-4)=0$`, 1],
        ['4. Leia funktsiooni g haripunkt.', 1, '(2;4)', r`$x_0=2$, $g(2)=4$`, 1],
        ['5. Leia funktsiooni g kasvamisvahemik.', 1, '(-∞;2)|x<2', r`$a<0$: kasvab haripunktist vasakul.`, 1],
        [r`6. Lahenda $5^{x+1}=125$.`, 2, '2', r`$x+1=3$`, 1],
        [r`7. Lahenda $\log_2(3x-1)=3$.`, 3, '3', r`$3x-1=8$, $x=3$; kontroll: $3\cdot3-1=8>0$ ✓`, 2],
        [r`8. Lahenda $2^x=12$ kahe kümnendkohani.`, 3, '3,58|3,59', r`$x=\dfrac{\ln12}{\ln2}\approx3{,}58$`, 2],
        ['9. Hoiusele pannakse 5000 € intressiga 2,5 % aastas. Kui suur on hoius 8 aasta pärast?', 3, '6092,01|6092', r`$5000\cdot1{,}025^8\approx6092{,}01$ €`, 2],
        ['10. Mitme täisaasta pärast ületab see hoius 7000 €?', 3, '14', r`$1{,}025^n>1{,}4$, $n>\dfrac{\ln1{,}4}{\ln1{,}025}\approx13{,}63$: 14 aasta pärast.`, 2],
        [r`11. Lahenda $\sin x=-0{,}5$ lõigul $[0^\circ;360^\circ]$.`, 3, '210; 330', r`$\sin^{-1}(-0{,}5)=-30^\circ$; lõigul: $180^\circ+30^\circ=210^\circ$ ja $360^\circ-30^\circ=330^\circ$.`, 2],
      ] },
      self: ['Oskan V kursuse kõiki ülesandetüüpe.', 'Kontrollin logaritmvõrrandi lahendid.', 'Ümardan alles lõpus.'],
    },

    // ───────────── VI kursus „Jadad. Funktsiooni tuletis” ─────────────
    {
      title: 'Arvjada ja aritmeetiline jada',
      ru: 'Числовая последовательность и арифметическая прогрессия',
      course: 'VI',
      exam: 'Jadade ülesanne on riigieksamil tekstülesandena (istekohad, säästmine, treeningplaan), 5 või 10 p.',
      can: 'Õpilane leiab jada liikmeid üldliikme valemiga, aritmeetilise jada vahe, üldliikme ja esimese n liikme summa.',
      theory: [
        r`Arvjada: $a_1,a_2,a_3,\dots$; üldliige $a_n$ on valem, mis annab $n$-nda liikme.`,
        r`Aritmeetiline jada: $a_{n+1}=a_n+d$ ($d$ — vahe); $\;a_n=a_1+(n-1)d$.`,
        r`Summa: $S_n=\dfrac{(a_1+a_n)\,n}{2}=\dfrac{\big(2a_1+(n-1)d\big)\,n}{2}$.`,
        r`$d>0$ — kasvav jada; $d<0$ — kahanev jada.`,
      ],
      ru_hint: [
        'Арифметическая прогрессия: каждый следующий член больше на одно и то же число d.',
        'aₙ = a₁ + (n − 1)d — не забудь «n − 1».',
        'Сумма = (первый + последний) · количество / 2.',
      ],
      example: {
        task: r`Jada üldliige on $a_n=2n-1$. Kirjuta viis esimest liiget ja leia nende summa.`,
        steps: [
          r`$a_1=1$, $a_2=3$, $a_3=5$, $a_4=7$, $a_5=9$: aritmeetiline jada, $d=2$.`,
          r`$S_5=\dfrac{(1+9)\cdot5}{2}=25$.`,
          r`Jada graafik on üksikud punktid $(n;a_n)$.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 6, ymin: -1, ymax: 10, step: 1, stepY: 1, points: 'A(1; 1)\nB(2; 3)\nC(3; 5)\nD(4; 7)\nE(5; 9)', caption: 'jada aₙ = 2n − 1: x — n, y — aₙ' },
      },
      practice: [
        { title: r`Jada üldliige on $a_n=n^2-1$.`, parts: [
          [r`Leia $a_1$.`, 1, '0', r`$1-1=0$`, 1],
          [r`Leia $a_5$.`, 1, '24', r`$25-1=24$`, 1],
          ['Mitmes liige on 99?', 2, '10', r`$n^2-1=99$, $n^2=100$, $n=10$.`],
        ] },
        { title: r`Aritmeetilises jadas $a_1=3$ ja $d=4$.`, parts: [
          [r`Leia $a_{10}$.`, 1, '39', r`$3+9\cdot4=39$`, 1],
          [r`Leia $S_{10}$.`, 2, '210', r`$\dfrac{(3+39)\cdot10}{2}=210$`],
        ] },
        { title: r`Aritmeetilises jadas $a_3=10$ ja $a_7=22$.`, parts: [
          [r`Leia $d$.`, 2, '3', r`$a_7-a_3=4d=12$, $d=3$.`],
          [r`Leia $a_1$.`, 1, '4', r`$a_1=a_3-2d=10-6=4$`, 1],
        ] },
        { title: 'Arvuta summa.', parts: [
          [r`$1+2+3+\dots+100$`, 1, '5050', r`$\dfrac{(1+100)\cdot100}{2}=5050$`, 1],
          [r`$1+3+5+\dots+99$`, 2, '2500', r`$a_n=2n-1=99$, $n=50$; $\;S_{50}=\dfrac{(1+99)\cdot50}{2}=2500$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Vabaõhuteatri esimeses reas on 20 kohta, igas järgmises reas 3 kohta rohkem. Ridu on 15.', parts: [
        ['Mitu kohta on viimases reas?', 2, '62', r`$a_{15}=20+14\cdot3=62$`, 2],
        ['Mitu kohta on teatris kokku?', 3, '615', r`$S_{15}=\dfrac{(20+62)\cdot15}{2}=615$`, 2],
        ['Mitmes reas on 50 kohta?', 2, '11', r`$20+3(n-1)=50$, $n-1=10$, $n=11$.`, 2],
        ['Mitu esimest rida on vaja, et istuma mahuks vähemalt 300 inimest?', 3, '10', r`$S_n=\dfrac{(40+3(n-1))n}{2}\ge300$: $3n^2+37n-600\ge0$, $n\ge9{,}26$. Kontroll: $S_9=288$, $S_{10}=335$: 10 rida.`, 3],
      ] },
      self: ['Leian jada liikme üldliikme valemiga.', 'Kasutan valemit aₙ = a₁ + (n − 1)d.', 'Arvutan aritmeetilise jada summa.'],
    },
    {
      title: 'Geomeetriline jada',
      ru: 'Геометрическая прогрессия',
      course: 'VI',
      exam: 'Geomeetriline jada on riigieksamil seotud liitprotsendiga: igal sammul korrutatakse sama arvuga.',
      can: 'Õpilane leiab geomeetrilise jada teguri, üldliikme ja esimese n liikme summa ning lahendab tekstülesandeid.',
      theory: [
        r`Geomeetriline jada: $b_{n+1}=b_n\cdot q$ ($q$ — tegur, $q\ne0$); $\;b_n=b_1q^{n-1}$.`,
        r`Summa: $S_n=\dfrac{b_1(q^n-1)}{q-1}$, kui $q\ne1$.`,
        r`Liitprotsent on geomeetriline jada teguriga $q=1+\dfrac{p}{100}$.`,
      ],
      ru_hint: [
        'Геометрическая прогрессия: каждый следующий член в q раз больше.',
        'Знаменатель q = b₂ : b₁; общий член bₙ = b₁·qⁿ⁻¹.',
        'Если надо найти n — логарифмируем.',
      ],
      example: {
        task: 'Bakterite arv kahekordistub iga tunni järel. Esimesel tunnil on neid 1 tuhat. Mitu tuhat on neid 10. tunnil? Kui palju kokku esimese 10 tunni loendustes?',
        steps: [
          r`$b_1=1$, $q=2$: $\;b_{10}=1\cdot2^9=512$ tuhat.`,
          r`$S_{10}=\dfrac{1\cdot(2^{10}-1)}{2-1}=1023$ tuhat.`,
          r`Graafikul on punktid $(n;b_n)$: iga järgmine on kaks korda kõrgemal.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 6, ymin: -1, ymax: 17, step: 1, stepY: 2, points: 'A(1; 1)\nB(2; 2)\nC(3; 4)\nD(4; 8)\nE(5; 16)', caption: 'jada bₙ = 2ⁿ⁻¹' },
      },
      practice: [
        { title: r`Geomeetriline jada $2$; $6$; $18$; …`, parts: [
          [r`Leia $q$.`, 1, '3', r`$6:2=3$`, 1],
          [r`Leia $b_6$.`, 1, '486', r`$2\cdot3^5=486$`, 1],
          [r`Leia $S_5$.`, 2, '242', r`$\dfrac{2(3^5-1)}{3-1}=242$`],
        ] },
        { title: r`$b_1=64$ ja $q=\dfrac12$.`, parts: [
          [r`Leia $b_7$.`, 1, '1', r`$64\cdot\left(\dfrac12\right)^6=1$`, 1],
          [r`Leia $S_7$.`, 2, '127', r`$\dfrac{64\left(\left(\frac12\right)^7-1\right)}{\frac12-1}=128-1=127$`],
        ] },
        { title: r`Geomeetrilises jadas $b_2=6$ ja $b_4=54$ ($q>0$).`, parts: [
          [r`Leia $q$.`, 2, '3', r`$q^2=\dfrac{54}{6}=9$, $q=3$.`],
          [r`Leia $b_1$.`, 1, '2', r`$6:3=2$`, 1],
        ] },
        { title: r`Mitmes liige on jadas $5$; $10$; $20$; … arv $640$?`, parts: [
          ['', 2, '8', r`$5\cdot2^{n-1}=640$, $2^{n-1}=128=2^7$, $n=8$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Jooksja jooksis esimesel nädalal 10 km ja suurendab igal nädalal nädala distantsi 10 %.', parts: [
        ['Kirjuta jada tegur.', 1, '1,1', r`$q=1+0{,}1=1{,}1$`, 1],
        ['Mitu km jookseb ta 8. nädalal (kahe kümnendkohani)?', 3, '19,49', r`$b_8=10\cdot1{,}1^7\approx19{,}49$ km`, 2],
        ['Mitu km jookseb ta kokku 8 nädala jooksul (kahe kümnendkohani)?', 3, '114,36', r`$S_8=\dfrac{10(1{,}1^8-1)}{0{,}1}\approx114{,}36$ km`, 3],
        ['Mitmendal nädalal ületab nädala distants esimest korda 25 km?', 3, '11', r`$10\cdot1{,}1^{n-1}>25$, $n-1>\dfrac{\ln2{,}5}{\ln1{,}1}\approx9{,}61$, $n-1=10$: 11. nädalal.`, 3],
      ] },
      self: ['Leian teguri q.', 'Kasutan valemit bₙ = b₁qⁿ⁻¹.', 'Arvutan geomeetrilise jada summa.'],
    },
    {
      title: 'Tuletise mõiste ja geomeetriline tähendus',
      ru: 'Понятие производной и её геометрический смысл',
      course: 'VI',
      exam: 'Tuletis on kitsa riigieksami II osas peaaegu alati: puutuja, kiirus, ekstreemum.',
      can: 'Õpilane leiab funktsiooni muudu ja keskmise muutumise kiiruse ning selgitab tuletist kui puutuja tõusu ja hetkkiirust.',
      theory: [
        r`Argumendi muut $\Delta x$, funktsiooni muut $\Delta y=f(x+\Delta x)-f(x)$; keskmine muutumise kiirus $\dfrac{\Delta y}{\Delta x}$ — lõikaja tõus.`,
        r`Tuletis $f'(x)=\lim\limits_{\Delta x\to0}\dfrac{\Delta y}{\Delta x}$ — hetkeline muutumise kiirus.`,
        r`Geomeetriliselt: $f'(x_0)=k=\tan\alpha$ — puutuja tõus punktis $x_0$.`,
        r`Füüsikaliselt: kui $s(t)$ on teepikkus, siis $v(t)=s'(t)$ on kiirus.`,
      ],
      ru_hint: [
        'Средняя скорость изменения — наклон секущей; производная — наклон касательной.',
        'f\'(x₀) = tg α, где α — угол между касательной и осью x.',
        'Производная пути по времени — скорость.',
      ],
      example: {
        task: r`$f(x)=x^2$. Leia keskmine muutumise kiirus lõigul $[1;3]$ ja puutuja tõus punktis $x=1$.`,
        steps: [
          r`$\dfrac{\Delta y}{\Delta x}=\dfrac{9-1}{3-1}=4$ — lõikaja $AB$ tõus (sirge $y=4x-3$).`,
          r`$\dfrac{(1+\Delta x)^2-1}{\Delta x}=2+\Delta x\to2$: $\;f'(1)=2$.`,
          r`Puutuja punktis $A(1;1)$: $y=2x-1$.`,
        ],
        graph: { fns: 'y = x^2\ny = 4x - 3\ny = 2x - 1', xmin: -1, xmax: 4, ymin: -2, ymax: 10, step: 1, stepY: 2, points: 'A(1; 1)\nB(3; 9)', caption: 'tumesinine: y = x² · roheline: lõikaja AB · punane: puutuja punktis A' },
      },
      practice: [
        { title: r`$f(x)=x^2+1$.`, parts: [
          [r`Leia $\Delta y$, kui $x$ muutub $2$-st $2{,}5$-ni.`, 1, '2,25', r`$f(2{,}5)-f(2)=7{,}25-5=2{,}25$`, 1],
          ['Leia keskmine muutumise kiirus sellel lõigul.', 1, '4,5', r`$\dfrac{2{,}25}{0{,}5}=4{,}5$`, 1],
        ] },
        { title: r`$f(x)=3x^2$.`, parts: [
          [r`Leia definitsiooni abil $f'(x)$.`, 2, '6x', r`$\dfrac{3(x+\Delta x)^2-3x^2}{\Delta x}=6x+3\Delta x\to6x$`, 3],
          [r`Leia $f'(2)$.`, 1, '12', r`$6\cdot2=12$`, 1],
        ] },
        { title: r`Leia puutuja tõusunurk kraadides, kui $f'(x_0)$ on`, parts: [
          [r`$1$`, 1, '45', r`$\tan\alpha=1$, $\alpha=45^\circ$`, 1],
          [r`$\sqrt3$`, 1, '60', r`$\tan\alpha=\sqrt3$, $\alpha=60^\circ$`, 1],
          [r`$-1$`, 1, '135', r`$\tan\alpha=-1$, $\alpha=180^\circ-45^\circ=135^\circ$`, 1],
        ] },
        { title: r`Keha läbib aja $t$ (s) jooksul tee $s(t)=5t^2$ (m).`, parts: [
          [r`Leia keskmine kiirus ajavahemikus $[1;3]$.`, 1, '20', r`$\dfrac{45-5}{2}=20$ m/s`, 1],
          [r`Leia hetkkiirus ajal $t=3$.`, 2, '30', r`$s'(t)=10t$, $s'(3)=30$ m/s`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on funktsioon $f(x)=x^2-2x$.`, parts: [
        [r`Leia keskmine muutumise kiirus lõigul $[1;4]$.`, 2, '3', r`$\dfrac{f(4)-f(1)}{3}=\dfrac{8-(-1)}{3}=3$`, 2],
        [r`Leia $f'(3)$, kui $f'(x)=2x-2$.`, 2, '4', r`$6-2=4$`, 1],
        [r`Kas puutuja punktis $x=1$ on paralleelne $x$-teljega? Kirjuta jah või ei.`, 1, 'jah', r`$f'(1)=0$: puutuja tõus on 0.`, 0],
      ] },
      self: ['Leian keskmise muutumise kiiruse.', 'Selgitan tuletist kui puutuja tõusu.', 'Leian hetkkiiruse tuletise abil.'],
    },
    {
      title: 'Tuletiste leidmine tabeli abil',
      ru: 'Нахождение производных по таблице',
      course: 'VI',
      exam: 'Tuletiste tabel on kitsa riigieksami valemilehel; reeglid tuleb osata kasutada kiiresti ja vigadeta.',
      can: 'Õpilane leiab astme-, eksponent- ja logaritmfunktsiooni ning nende summa tuletise tabeli abil.',
      theory: [
        r`$(c)'=0$, $\;(x^n)'=nx^{n-1}$, $\;(e^x)'=e^x$, $\;(\ln x)'=\dfrac1x$`,
        r`$(cf)'=c\,f'$, $\;(f\pm g)'=f'\pm g'$`,
        r`Erijuhud: $(x)'=1$, $\;(\sqrt x)'=\dfrac{1}{2\sqrt x}$, $\;\left(\dfrac1x\right)'=-\dfrac{1}{x^2}$`,
        r`Juure ja murru tuletiseks kirjuta need astmena: $\sqrt x=x^{\frac12}$, $\dfrac1{x^2}=x^{-2}$.`,
      ],
      ru_hint: [
        'Степень: показатель вперёд, а сам показатель уменьшаем на 1.',
        'Производная константы = 0; число-множитель выносим.',
        'Корень и дробь сначала записываем как степень.',
      ],
      example: {
        task: r`$f(x)=2x^3-5x^2+4x-7$. Leia $f'(x)$ ja $f'(2)$.`,
        steps: [
          r`$f'(x)=2\cdot3x^2-5\cdot2x+4-0=6x^2-10x+4$.`,
          r`$f'(2)=24-20+4=8$.`,
        ],
      },
      practice: [
        { title: 'Leia tuletis.', parts: [
          [r`$(x^5)'$`, 1, '5x^4|5x⁴', r`$5x^4$`, 1],
          [r`$(3x^4-2x)'$`, 1, '12x^3-2|12x³-2', r`$12x^3-2$`, 1],
          [r`$(7)'$`, 1, '0', 'Konstandi tuletis on 0.', 1],
        ] },
        { title: 'Leia tuletis (kirjuta astmena).', parts: [
          [r`$(2\sqrt x)'$`, 1, '1/√x|1/sqrt(x)|x^(-1/2)', r`$2\cdot\dfrac{1}{2\sqrt x}=\dfrac1{\sqrt x}$`, 1],
          [r`$\left(\dfrac4x\right)'$`, 1, '-4/x^2|-4/x²|-4x^-2|-4x^(-2)', r`$4\cdot\left(-\dfrac1{x^2}\right)=-\dfrac4{x^2}$`, 1],
          [r`$(x^{-2})'$`, 1, '-2x^-3|-2x^(-3)|-2/x^3|-2/x³', r`$-2x^{-3}$`, 1],
        ] },
        { title: 'Leia tuletis.', parts: [
          [r`$(3e^x)'$`, 1, '3e^x|3eˣ', r`$3e^x$`, 1],
          [r`$(5\ln x)'$`, 1, '5/x', r`$\dfrac5x$`, 1],
          [r`$(e^x+x^2)'$`, 1, 'e^x+2x|2x+e^x', r`$e^x+2x$`, 1],
        ] },
        { title: r`$f(x)=x^3-3x^2$.`, parts: [
          [r`Leia $f'(x)$.`, 1, '3x^2-6x|3x²-6x', r`$3x^2-6x$`, 1],
          [r`Leia $f'(-1)$.`, 1, '9', r`$3+6=9$`, 1],
          [r`Lahenda $f'(x)=0$.`, 2, '0; 2', r`$3x(x-2)=0$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Keha liigub sirgjooneliselt, tema teepikkus on $s(t)=t^3-6t^2+15t$ (m), $t$ — aeg sekundites.`, parts: [
        [r`Leia kiiruse valem $v(t)=s'(t)$.`, 3, '3t^2-12t+15|3t²-12t+15', r`$v(t)=3t^2-12t+15$`, 2],
        [r`Leia kiirus ajal $t=1$.`, 2, '6', r`$3-12+15=6$ m/s`, 1],
        ['Millal on kiirus kõige väiksem?', 3, '2', r`$v(t)$ on ülespoole avanev parabool, haripunkt $t_0=\dfrac{12}{2\cdot3}=2$ s.`, 2],
        ['Leia vähim kiirus.', 2, '3', r`$v(2)=12-24+15=3$ m/s`, 1],
      ] },
      self: ['Kasutan astme tuletise valemit.', 'Leian eˣ ja ln x tuletise.', 'Kirjutan juure ja murru astmena.'],
    },
    {
      title: 'Puutuja võrrand',
      ru: 'Уравнение касательной',
      course: 'VI',
      exam: 'Puutuja võrrand on kitsa riigieksami II osa tavaline küsimus (3–4 p 10-punktilises ülesandes).',
      can: 'Õpilane koostab funktsiooni graafiku puutuja võrrandi antud punktis ja leiab puutepunkti, kui puutuja tõus on teada.',
      theory: [
        r`Puutuja punktis $x_0$: $\;y-f(x_0)=f'(x_0)\,(x-x_0)$.`,
        r`Samm-sammult: 1) $y_0=f(x_0)$; 2) $k=f'(x_0)$; 3) $y=kx+b$, kus $b=y_0-kx_0$.`,
        r`Paralleelsetel sirgetel on sama tõus: kui puutuja on paralleelne sirgega $y=kx+b$, siis $f'(x_0)=k$.`,
      ],
      ru_hint: [
        'Нужны три вещи: точка касания (x₀; f(x₀)), наклон k = f\'(x₀), потом уравнение прямой.',
        'Касательная параллельна прямой — значит, у них одинаковый наклон.',
        'Проверь: точка касания лежит на касательной.',
      ],
      example: {
        task: r`Koosta funktsiooni $f(x)=x^2-4x+5$ graafiku puutuja võrrand punktis $x_0=3$.`,
        steps: [
          r`$y_0=f(3)=9-12+5=2$: puutepunkt $P(3;2)$.`,
          r`$f'(x)=2x-4$, $\;k=f'(3)=2$.`,
          r`$y-2=2(x-3)$, $\;y=2x-4$.`,
        ],
        graph: { fns: 'y = x^2 - 4x + 5\ny = 2x - 4', xmin: -1, xmax: 5, ymin: -2, ymax: 8, step: 1, stepY: 1, points: 'P(3; 2)' },
      },
      practice: [
        { title: r`Koosta funktsiooni $f(x)=x^3$ puutuja võrrand.`, parts: [
          [r`punktis $x_0=1$`, 2, 'y=3x-2', r`$f(1)=1$, $f'(x)=3x^2$, $k=3$: $y-1=3(x-1)$, $y=3x-2$.`],
          [r`punktis $x_0=-1$`, 2, 'y=3x+2', r`$f(-1)=-1$, $k=3$: $y+1=3(x+1)$, $y=3x+2$.`],
        ] },
        { title: 'Koosta puutuja võrrand.', parts: [
          [r`$f(x)=e^x$, $x_0=0$`, 2, 'y=x+1', r`$f(0)=1$, $f'(0)=e^0=1$: $y=x+1$.`],
          [r`$f(x)=\ln x$, $x_0=1$`, 2, 'y=x-1', r`$f(1)=0$, $f'(1)=1$: $y=x-1$.`],
        ] },
        { title: r`Funktsiooni $f(x)=x^2-6x$ graafiku puutuja on paralleelne sirgega $y=2x-1$.`, parts: [
          ['Leia puutepunkt.', 2, '(4;-8)', r`$2x-6=2$, $x_0=4$, $f(4)=-8$.`],
          ['Koosta puutuja võrrand.', 2, 'y=2x-16', r`$y+8=2(x-4)$, $y=2x-16$.`],
        ] },
        { title: r`$f(x)=\dfrac4x$, $x_0=2$.`, parts: [
          ['Koosta puutuja võrrand.', 2, 'y=-x+4|y=4-x', r`$f(2)=2$, $f'(x)=-\dfrac4{x^2}$, $k=-1$: $y=-x+4$.`],
          ['Leia puutuja tõusunurk kraadides.', 1, '135', r`$\tan\alpha=-1$, $\alpha=135^\circ$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=-x^2+4x$.`, grid: { xmin: -1, xmax: 5, ymin: -2, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        [r`Leia $f'(x)$.`, 2, '-2x+4|4-2x', r`$f'(x)=-2x+4$`, 1],
        [r`Koosta puutuja võrrand punktis $x_0=1$.`, 3, 'y=2x+1', r`$f(1)=3$, $f'(1)=2$: $y-3=2(x-1)$, $y=2x+1$.`, 3],
        [r`Koosta puutuja võrrand punktis $x_0=3$.`, 3, 'y=-2x+9|y=9-2x', r`$f(3)=3$, $f'(3)=-2$: $y-3=-2(x-3)$, $y=-2x+9$.`, 3],
        ['Leia nende kahe puutuja lõikepunkt.', 2, '(2;5)', r`$2x+1=-2x+9$, $x=2$, $y=5$.`, 2],
      ] },
      self: ['Leian puutepunkti ja tõusu.', 'Koostan puutuja võrrandi.', 'Leian puutepunkti, kui tõus on antud.'],
    },
    {
      title: 'Kasvamine, kahanemine ja ekstreemum',
      ru: 'Возрастание, убывание и экстремум',
      course: 'VI',
      exam: 'Riigieksamil: funktsiooni kasvamis- ja kahanemisvahemikud ning ekstreemumid tuletise abil (II osa).',
      can: 'Õpilane leiab tuletise abil funktsiooni kriitilised punktid, kasvamis- ja kahanemisvahemikud ning ekstreemumid.',
      theory: [
        r`$f'(x)>0$ vahemikus — $f$ kasvab; $f'(x)<0$ — $f$ kahaneb.`,
        r`Kriitiline punkt: $f'(x)=0$.`,
        r`Kui $f'$ muudab märki $+\to-$, on maksimumkoht; $-\to+$ — miinimumkoht. Märgimuutuseta ei ole ekstreemumi.`,
        r`Ekstreemumkoht on $x$; ekstreemum (maksimum, miinimum) on $f(x)$.`,
      ],
      ru_hint: [
        'Ищем, где f\'(x) = 0, потом смотрим знак f\' слева и справа.',
        '«+ потом −» — максимум; «− потом +» — минимум.',
        'Точка экстремума — x, экстремум — значение функции y.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^3-3x^2$ ekstreemumid ning kasvamis- ja kahanemisvahemikud.`,
        steps: [
          r`$f'(x)=3x^2-6x=3x(x-2)$; kriitilised punktid $0$ ja $2$.`,
          r`Märgid: $(-\infty;0)$: $+$; $\;(0;2)$: $-$; $\;(2;\infty)$: $+$.`,
          r`Maksimum $f(0)=0$ — punkt $M(0;0)$; miinimum $f(2)=8-12=-4$ — punkt $N(2;-4)$.`,
          r`Kasvab $(-\infty;0)$ ja $(2;\infty)$, kahaneb $(0;2)$.`,
        ],
        graph: { fns: 'y = x^3 - 3x^2', xmin: -2, xmax: 4, ymin: -6, ymax: 4, step: 1, stepY: 1, points: 'M(0; 0)\nN(2; -4)' },
      },
      practice: [
        { title: r`$f(x)=x^2-8x+3$.`, parts: [
          [r`Leia $f'(x)$.`, 1, '2x-8', r`$2x-8$`, 1],
          ['Leia kriitiline punkt.', 1, '4', r`$2x-8=0$, $x=4$`, 1],
          ['Leia miinimum.', 1, '-13', r`$f(4)=16-32+3=-13$`, 1],
        ] },
        { title: r`$f(x)=2x^3-6x$.`, parts: [
          ['Leia maksimumkoht.', 1, '-1', r`$f'(x)=6x^2-6=0$, $x=\pm1$; $f'$ märgid $+,-,+$: maksimumkoht $-1$.`, 2],
          ['Leia miinimumkoht.', 1, '1', 'Märk muutub − → +.', 1],
          ['Leia maksimum ja miinimum (kirjuta mõlemad).', 2, '4; -4', r`$f(-1)=-2+6=4$; $\;f(1)=2-6=-4$`],
        ] },
        { title: r`$f(x)=x^3+3x$.`, parts: [
          ['Leia kasvamisvahemik.', 2, '(-∞;∞)|R|ℝ', r`$f'(x)=3x^2+3>0$ iga $x$ korral.`],
          ['Kas funktsioonil on ekstreemumeid? Kirjuta jah või ei.', 1, 'ei', r`$f'(x)\ne0$ — kriitilisi punkte ei ole.`, 0],
        ] },
        { title: r`$f(x)=x^4-2x^2$.`, parts: [
          ['Leia kriitilised punktid.', 2, '-1; 0; 1', r`$f'(x)=4x^3-4x=4x(x-1)(x+1)$`],
          ['Leia miinimum.', 1, '-1', r`$f(\pm1)=1-2=-1$`, 1],
          ['Leia maksimum.', 1, '0', r`$f'$ märgid: $-,+,-,+$; maksimumkoht $0$, $f(0)=0$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-6x^2+9x$.`, grid: { xmin: -1, xmax: 5, ymin: -2, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        [r`Leia $f'(x)$.`, 2, '3x^2-12x+9|3x²-12x+9', r`$3x^2-12x+9$`, 1],
        ['Leia kriitilised punktid.', 2, '1; 3', r`$3(x^2-4x+3)=0$: $x=1$ ja $x=3$.`, 2],
        ['Leia maksimumpunkt.', 2, '(1;4)', r`$f'$ märgid $+,-,+$; $f(1)=1-6+9=4$.`, 2],
        ['Leia miinimumpunkt.', 2, '(3;0)', r`$f(3)=27-54+27=0$`, 1],
        ['Leia kahanemisvahemik.', 2, '(1;3)|1<x<3', r`$f'(x)<0$, kui $1<x<3$.`, 1],
      ] },
      self: ['Leian kriitilised punktid.', 'Uurin tuletise märki.', 'Eristan ekstreemumkohta ja ekstreemumit.'],
    },
    {
      title: 'Polünoomi uurimine ja graafik',
      ru: 'Исследование многочлена и график',
      course: 'VI',
      exam: 'Riigieksami II osa 10-punktiline ülesanne: uuri funktsiooni ja joonesta graafik; lõigu suurim ja vähim väärtus.',
      can: 'Õpilane uurib polünoomfunktsiooni tuletise abil, joonestab graafiku ning leiab lõigu suurima ja vähima väärtuse.',
      theory: [
        r`Uurimise skeem: 1) $X$; 2) nullkohad; 3) lõikepunkt $y$-teljega; 4) $f'(x)$ ja kriitilised punktid; 5) kasvamine, kahanemine, ekstreemumid; 6) tabel ja graafik.`,
        r`Lõigu $[a;b]$ suurim ja vähim väärtus: arvuta $f$ otspunktides $a$, $b$ ja lõigul olevates kriitilistes punktides; vali suurim ja vähim.`,
        r`Kuupfunktsioon $y=ax^3+\dots$: $a>0$ — paremal üles, $a<0$ — paremal alla.`,
      ],
      ru_hint: [
        'Исследуем по схеме, ничего не пропуская: нули, f\', знаки, экстремумы, график.',
        'Наибольшее и наименьшее на отрезке: концы отрезка + критические точки внутри.',
        'Критическую точку вне отрезка не берём.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=-x^3+3x+2$ ja joonesta graafik.`,
        steps: [
          r`Nullkohad: $-x^3+3x+2=-(x+1)^2(x-2)$: $x=-1$ ja $x=2$. Lõikepunkt $y$-teljega $(0;2)$.`,
          r`$f'(x)=-3x^2+3=0$: $x=\pm1$. Märgid: $-,+,-$.`,
          r`Miinimum $f(-1)=0$ — punkt $A(-1;0)$; maksimum $f(1)=4$ — punkt $M(1;4)$.`,
          r`Kahaneb $(-\infty;-1)$ ja $(1;\infty)$, kasvab $(-1;1)$.`,
        ],
        graph: { fns: 'y = -x^3 + 3x + 2', xmin: -3, xmax: 3, ymin: -3, ymax: 6, step: 1, stepY: 1, points: 'A(-1; 0)\nB(2; 0)\nC(0; 2)\nM(1; 4)' },
      },
      practice: [
        { title: r`$f(x)=x^3-4x$.`, parts: [
          ['Leia nullkohad.', 1, '0; 2; -2', r`$x(x^2-4)=0$`, 1],
          ['Leia kriitilised punktid kahe kümnendkohani.', 2, '1,15; -1,15', r`$3x^2-4=0$, $x=\pm\dfrac{2}{\sqrt3}\approx\pm1{,}15$`],
          ['Leia maksimum kahe kümnendkohani.', 2, '3,08', r`$f\!\left(-\dfrac{2}{\sqrt3}\right)=-\dfrac{8}{3\sqrt3}+\dfrac{8}{\sqrt3}=\dfrac{16}{3\sqrt3}\approx3{,}08$`],
        ] },
        { title: r`$f(x)=x^2-4x+1$ lõigul $[0;5]$.`, parts: [
          ['Leia suurim väärtus.', 2, '6', r`$f(0)=1$, $f(2)=-3$, $f(5)=6$: suurim $6$.`],
          ['Leia vähim väärtus.', 1, '-3', r`Vähim $f(2)=-3$.`, 1],
        ] },
        { title: r`$f(x)=x^3-3x$ lõigul $[0;3]$.`, parts: [
          ['Leia suurim väärtus.', 2, '18', r`$f'(x)=3x^2-3=0$, lõigul $x=1$. $f(0)=0$, $f(1)=-2$, $f(3)=18$.`],
          ['Leia vähim väärtus.', 1, '-2', r`$f(1)=-2$`, 1],
        ] },
        { title: r`$f(x)=-x^3+3x^2$.`, parts: [
          ['Leia nullkohad.', 1, '0; 3', r`$-x^2(x-3)=0$`, 1],
          ['Leia maksimumpunkt.', 2, '(2;4)', r`$f'(x)=-3x^2+6x=0$: $x=0$ või $x=2$; märgid $-,+,-$; $f(2)=-8+12=4$.`],
          ['Leia miinimumpunkt.', 1, '(0;0)', r`$f(0)=0$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-3x+2$.`, grid: { xmin: -3, xmax: 3, ymin: -3, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia nullkohad.', 2, '1; -2', r`$f(1)=0$, seega $f(x)=(x-1)(x^2+x-2)=(x-1)^2(x+2)$: $x=1$ ja $x=-2$.`, 3],
        ['Leia kriitilised punktid.', 2, '-1; 1', r`$f'(x)=3x^2-3=0$`, 1],
        ['Leia maksimumpunkt.', 2, '(-1;4)', r`Märgid $+,-,+$; $f(-1)=-1+3+2=4$.`, 2],
        ['Leia miinimumpunkt.', 2, '(1;0)', r`$f(1)=1-3+2=0$`, 1],
        ['Joonesta graafik.', 2, '', 'Punktid (−2; 0), (−1; 4), (0; 2), (1; 0), (2; 4).', 0],
      ] },
      self: ['Uurin funktsiooni skeemi järgi.', 'Joonestan graafiku ekstreemumpunktide abil.', 'Leian lõigu suurima ja vähima väärtuse.'],
    },
    {
      title: 'Ekstreemumülesanded',
      ru: 'Задачи на экстремум',
      course: 'VI',
      exam: 'Ekstreemumülesanne on riigieksami II osa tekstülesanne: suurim pindala, vähim kulu, suurim kasum.',
      can: 'Õpilane koostab tekstülesande põhjal funktsiooni, leiab selle ekstreemumi tuletise abil ja vastab küsimusele.',
      theory: [
        r`1) Tähista muutuja $x$ ja kirjuta selle võimalikud väärtused.`,
        r`2) Avalda uuritav suurus (pindala, ruumala, kasum) funktsioonina $f(x)$.`,
        r`3) Leia $f'(x)$ ja lahenda $f'(x)=0$.`,
        r`4) Kontrolli märgimuutusega, et see on maksimum või miinimum; vasta küsimusele ühikuga.`,
      ],
      ru_hint: [
        'Главное — правильно составить функцию одной переменной.',
        'Проверь, что найденное x подходит по смыслу (длина > 0 и т. д.).',
        'Отвечай на вопрос задачи: иногда нужен не x, а площадь или прибыль.',
      ],
      example: {
        task: 'Ristküliku ümbermõõt on 20 m. Millised peavad olema küljed, et pindala oleks suurim?',
        steps: [
          r`Üks külg $x$, teine $10-x$, $\;0<x<10$. Pindala $S(x)=x(10-x)=10x-x^2$.`,
          r`$S'(x)=10-2x=0$, $x=5$; märgid $+,-$ — maksimum.`,
          r`Küljed $5$ m ja $5$ m (ruut), $S=25$ m² — punkt $M(5;25)$.`,
        ],
        graph: { fns: 'y = x(10 - x)', xmin: -1, xmax: 11, ymin: -2, ymax: 30, step: 1, stepY: 5, points: 'M(5; 25)', caption: 'pindala S(x) = x(10 − x)' },
      },
      practice: [
        { title: 'Kahe positiivse arvu summa on 12. Millal on nende korrutis suurim?', parts: [
          ['Leia need arvud.', 2, '6; 6', r`$P(x)=x(12-x)$, $P'(x)=12-2x=0$, $x=6$; teine arv $6$.`],
          ['Leia suurim korrutis.', 1, '36', r`$6\cdot6=36$`, 1],
        ] },
        { title: 'Maja seina äärde piiratakse 60 m võrguga ristkülikukujuline aed (sein on neljas külg).', parts: [
          ['Leia seinaga risti oleva külje pikkus, mille korral pindala on suurim.', 2, '15', r`$S(x)=x(60-2x)$, $S'(x)=60-4x=0$, $x=15$ m.`],
          ['Leia suurim pindala.', 1, '450', r`$15\cdot30=450$ m²`, 1],
        ] },
        { title: 'Ruudukujulise papitüki külg on 12 cm. Nurkadest lõigatakse välja ruudud küljega x ja servad murtakse üles: saadakse kaaneta karp.', parts: [
          ['Leia x, mille korral karbi ruumala on suurim.', 3, '2', r`$V(x)=x(12-2x)^2$, $0<x<6$. $V'(x)=(12-2x)(12-6x)=0$: $x=2$ ($x=6$ ei sobi).`, 4],
          ['Leia suurim ruumala.', 1, '128', r`$2\cdot8^2=128$ cm³`, 1],
        ] },
        { title: r`Leia funktsiooni $f(x)=x+\dfrac9x$ vähim väärtus, kui $x>0$.`, parts: [
          ['', 2, '6', r`$f'(x)=1-\dfrac9{x^2}=0$, $x=3$; märgid $-,+$: miinimum $f(3)=3+3=6$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Ettevõtte kasum on $K(x)=-x^3+6x^2+15x-20$ (tuhat eurot), kus $x$ on toodangu maht tuhandetes ühikutes, $0\le x\le8$.`, parts: [
        [r`Leia $K'(x)$.`, 2, '-3x^2+12x+15|-3x²+12x+15', r`$K'(x)=-3x^2+12x+15$`, 1],
        ['Leia toodangu maht, mille korral kasum on suurim.', 3, '5', r`$-3x^2+12x+15=0\Rightarrow x^2-4x-5=0$: $x=5$ ($x=-1$ ei sobi); märgid $+,-$ — maksimum.`, 3],
        ['Leia suurim kasum.', 3, '80', r`$K(5)=-125+150+75-20=80$ tuhat eurot. Otspunktides $K(0)=-20$, $K(8)=-28$ — väiksemad.`, 3],
        [r`Leia $K(8)$. Kas see on kasum või kahjum?`, 2, '-28', r`$K(8)=-512+384+120-20=-28$: kahjum 28 tuhat eurot.`, 1],
      ] },
      self: ['Koostan ühe muutuja funktsiooni.', 'Leian ekstreemumi tuletise abil.', 'Vastan ülesande küsimusele ühikuga.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: VI kursus',
      ru: 'Повторение и контрольная работа: VI курс',
      course: 'VI',
      exam: 'VI kursuse teemad on riigieksami II osas: jadad, puutuja, ekstreemum ja funktsiooni uurimine.',
      can: 'Õpilane lahendab VI kursuse ülesandeid iseseisvalt: aritmeetiline ja geomeetriline jada, tuletis, puutuja, ekstreemumid.',
      theory: [
        r`$a_n=a_1+(n-1)d$, $\;S_n=\dfrac{(a_1+a_n)n}{2}$; $\;b_n=b_1q^{n-1}$, $\;S_n=\dfrac{b_1(q^n-1)}{q-1}$`,
        r`$(x^n)'=nx^{n-1}$, $\;(e^x)'=e^x$, $\;(\ln x)'=\dfrac1x$, $\;(f\pm g)'=f'\pm g'$`,
        r`Puutuja: $y-f(x_0)=f'(x_0)(x-x_0)$`,
        r`Ekstreemum: $f'(x)=0$ ja märgimuutus $+\to-$ (max) või $-\to+$ (min).`,
      ],
      ru_hint: [
        'Сначала реши задания, в которых уверен, потом возвращайся к трудным.',
        'Пиши формулу, потом подставляй числа.',
        'В ответе на экстремум пиши и x, и значение функции.',
      ],
      example: {
        task: r`Koosta funktsiooni $f(x)=x^3-3x^2$ puutuja võrrand punktis $x_0=1$.`,
        steps: [
          r`$f(1)=1-3=-2$; $\;f'(x)=3x^2-6x$, $f'(1)=-3$.`,
          r`$y+2=-3(x-1)$, $\;y=-3x+1$.`,
        ],
      },
      practice: [
        { title: r`Aritmeetilises jadas $a_1=5$ ja $d=-2$.`, parts: [
          [r`Leia $a_{20}$.`, 1, '-33', r`$5+19\cdot(-2)=-33$`, 1],
          [r`Leia $S_{20}$.`, 1, '-280', r`$\dfrac{(5-33)\cdot20}{2}=-280$`, 1],
        ] },
        { title: r`Geomeetrilises jadas $b_1=81$ ja $q=\dfrac13$.`, parts: [
          [r`Leia $b_5$.`, 1, '1', r`$81\cdot\dfrac{1}{81}=1$`, 1],
          [r`Leia $S_5$.`, 2, '121', r`$\dfrac{81\left(1-\frac1{243}\right)}{1-\frac13}=121$ ($81+27+9+3+1$)`],
        ] },
        { title: 'Leia tuletis.', parts: [
          [r`$(4x^3-2x+1)'$`, 1, '12x^2-2|12x²-2', r`$12x^2-2$`, 1],
          [r`$(e^x-\ln x)'$`, 1, 'e^x-1/x|eˣ-1/x', r`$e^x-\dfrac1x$`, 1],
        ] },
        { title: r`$f(x)=x^2-6x+8$.`, parts: [
          ['Leia kriitiline punkt.', 1, '3', r`$2x-6=0$`, 1],
          ['Leia miinimum.', 1, '-1', r`$f(3)=9-18+8=-1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'VI kursus: jadad ja funktsiooni tuletis. Aega 45 minutit.', parts: [
        [r`1. Aritmeetilises jadas $a_1=7$ ja $a_6=22$. Leia $d$.`, 2, '3', r`$5d=15$, $d=3$`, 1],
        [r`2. Leia selle jada $S_{10}$.`, 2, '205', r`$\dfrac{(2\cdot7+9\cdot3)\cdot10}{2}=205$`, 1],
        [r`3. Geomeetriline jada $3$; $6$; $12$; … Leia $b_8$.`, 2, '384', r`$3\cdot2^7=384$`, 1],
        [r`4. Leia selle jada $S_8$.`, 2, '765', r`$\dfrac{3(2^8-1)}{2-1}=765$`, 1],
        [r`5. $f(x)=2x^3-3x^2+5$. Leia $f'(x)$.`, 2, '6x^2-6x|6x²-6x', r`$6x^2-6x$`, 1],
        [r`6. Leia $f'(2)$.`, 1, '12', r`$24-12=12$`, 1],
        [r`7. Koosta funktsiooni $f$ graafiku puutuja võrrand punktis $x_0=2$.`, 3, 'y=12x-15', r`$f(2)=16-12+5=9$; $y-9=12(x-2)$, $y=12x-15$`, 2],
        ['8. Leia funktsiooni f kriitilised punktid.', 2, '0; 1', r`$6x(x-1)=0$`, 1],
        ['9. Leia maksimumpunkt.', 2, '(0;5)', r`Märgid $+,-,+$; $f(0)=5$`, 1],
        ['10. Leia miinimumpunkt.', 2, '(1;4)', r`$f(1)=2-3+5=4$`, 1],
        ['11. Leia kahanemisvahemik.', 2, '(0;1)|0<x<1', r`$f'(x)<0$, kui $0<x<1$.`, 1],
        ['12. Ristküliku ümbermõõt on 36 cm. Leia suurim võimalik pindala.', 3, '81', r`$S(x)=x(18-x)$, $S'(x)=18-2x=0$, $x=9$: $S=81$ cm²`, 2],
      ] },
      self: ['Oskan VI kursuse kõiki ülesandetüüpe.', 'Koostan puutuja võrrandi.', 'Leian ekstreemumid tuletise abil.'],
    },
  ],
};
