// Matemaatika lai, 11. klass (owner 2026-11-17: the lai courses for grades 10–11; grade 10 is the ml10 program).
// Gümnaasiumi laia matemaatika kursused VI–X (GRÕK lisa 5 p 2.3.2; paigutus 11. klassi on meie otsus, vt
// docs/CURRICULUM_MATEMAATIKA_1_12.md): VI „Tõenäosus, statistika”, VII „Funktsioonid. Arvjadad”, VIII „Eksponent- ja
// logaritmfunktsioon”, IX „Trigonomeetrilised funktsioonid. Funktsiooni piirväärtus ja tuletis”, X „Tuletise
// rakendused”. Built step by step, deeper than kitsas11.js (binomial and normal distribution, confidence interval,
// inverse function, exp/log equations and inequalities, trig functions, limits, product/quotient/chain rules, full
// function investigation, optimisation). After every course a „Kordamine ja kontrolltöö” lesson whose third sheet is a
// 25-point test. Every task is our own.
// The lesson shape is the one of kitsas11.js (math/sheets.js builds three sheets per lesson); like lai12.js every theory
// line ends with *valemilehel* (on the lai valemileht) or *pähe* (to memorise), and every Russian hint says what is on
// the lai formula sheet (docs/MATH_RIIGIEKSAM_LAI.md „Valemileht (lai)”).
// Text is Markdown + $…$ formulas (KaTeX); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a drawing, an explanation);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
// Every graph gives a positive step and stepY.
const r = String.raw;

export const LAI_11 = {
  id: 'ml11',
  title: 'Matemaatika lai: 11. klass',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '11. klass matemaatika lai',
  sheetLevel: 'Lai 11',
  minutes: 90,
  // the teacher's plan in mathCurriculum.js: a school course lesson of the lai track
  plan: 'course',
  track: 'lai',
  formulaSheetRu: 'лист формул lai (на нём тригонометрия, формулы приведения, таблица производных и таблица интегралов)',
  phases: {
    transfer: { label: '3 Kontrollülesanne', slot: 3, subtitle: 'Suurem ülesanne nagu kontrolltöös: kirjuta kogu lahenduskäik.' },
  },
  goal: 'Õpilane arvutab tõenäosusi ja jaotuste karakteristikuid, hindab usalduspiirkonda, uurib funktsioone ja jadasid, lahendab eksponent-, logaritm- ja trigonomeetrilisi võrrandeid ning kasutab tuletist funktsiooni uurimisel ja optimeerimisel.',
  lessons: [
    // ───────────── VI kursus „Tõenäosus, statistika” ─────────────
    {
      title: 'Sündmused ja tõenäosuse omadused',
      ru: 'События и свойства вероятности',
      course: 'VI',
      exam: 'Laia riigieksami I osa ülesanne 1 (5 p) on sageli tõenäosus; klassikaline ja geomeetriline tõenäosus on selle alus.',
      can: 'Õpilane arvutab klassikalise, geomeetrilise ja statistilise tõenäosuse ning kasutab vastandsündmust.',
      theory: [
        r`Kindel sündmus: $P=1$; võimatu sündmus: $P=0$; iga sündmuse korral $0\le P(A)\le1$ — *pähe*`,
        r`Klassikaline tõenäosus: $P(A)=\dfrac kn$ ($n$ — kõik võrdvõimalikud tulemused, $k$ — soodsad) — *pähe*`,
        r`Vastandsündmus: $P(\bar A)=1-P(A)$ — *pähe*`,
        r`Geomeetriline tõenäosus: $P(A)=\dfrac{\text{soodsa osa mõõt}}{\text{kogu piirkonna mõõt}}$ (pikkus, pindala, aeg) — *pähe*`,
        r`Statistiline tõenäosus: suure katsete arvu korral $P(A)\approx\dfrac{k}{n}$ (suhteline sagedus) — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai вероятности нет — все формулы темы учим наизусть.',
        'Вероятность = благоприятные / все равновозможные исходы; «хотя бы один» — через 1 − P.',
        'Геометрическая вероятность — отношение длин или площадей.',
      ],
      example: {
        task: 'Visatakse kahte täringut. Leia tõenäosus, et silmade summa on vähemalt 10.',
        steps: [
          r`Kõiki tulemusi on $n=6\cdot6=36$.`,
          r`Soodsad: summa 10 — $(4;6),(5;5),(6;4)$; summa 11 — $(5;6),(6;5)$; summa 12 — $(6;6)$. Kokku $k=6$.`,
          r`$P=\dfrac{6}{36}=\dfrac16\approx0{,}17$.`,
        ],
      },
      practice: [
        { title: 'Kaartidel on arvud 1–30. Võetakse juhuslikult üks kaart.', parts: [
          ['Leia tõenäosus, et arv jagub 4-ga.', 1, '7/30|0,23', r`$4,8,\dots,28$ — 7 arvu: $P=\dfrac{7}{30}\approx0{,}23$.`, 1],
          ['Leia tõenäosus, et arv on algarv.', 2, '1/3|0,33', r`$2,3,5,7,11,13,17,19,23,29$ — 10 arvu: $P=\dfrac{10}{30}=\dfrac13$.`, 2],
          ['Leia tõenäosus, et arv ei jagu 3-ga.', 1, '2/3|0,67', r`3-ga jaguvad 10 arvu: $P=1-\dfrac{10}{30}=\dfrac23$.`, 1],
        ] },
        { title: r`Lõigult $[0;8]$ valitakse juhuslik arv $x$.`, parts: [
          [r`Leia tõenäosus, et $x^2<9$.`, 2, '0,375|3/8', r`$0\le x<3$: $P=\dfrac38=0{,}375$.`, 2],
          [r`Leia tõenäosus, et $|x-4|\le1$.`, 2, '0,25|1/4', r`$3\le x\le5$, pikkus 2: $P=\dfrac28=0{,}25$.`, 2],
        ] },
        { title: 'Ruudu külg on 10 cm. Ruudu sees on ring raadiusega 3 cm. Ruudust valitakse juhuslik punkt.', parts: [
          ['Leia tõenäosus, et punkt on ringis (kahe kümnendkohani).', 2, '0,28|9π/100', r`$P=\dfrac{9\pi}{100}\approx0{,}28$`, 2],
          ['Leia tõenäosus, et punkt ei ole ringis.', 1, '0,72', r`$1-0{,}28=0{,}72$`, 1],
        ] },
        { title: 'Tehases kontrolliti 2000 lambipirni, neist 36 olid defektsed.', parts: [
          ['Leia defekti suhteline sagedus.', 1, '0,018', r`$\dfrac{36}{2000}=0{,}018$`, 1],
          ['Mitu defektset pirni on oodata 15 000 pirni hulgas?', 1, '270', r`$15\,000\cdot0{,}018=270$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Visatakse punast ja sinist täringut.', parts: [
        ['Leia tõenäosus, et punasel täringul on rohkem silmi kui sinisel.', 2, '5/12|0,42', r`Võrdseid paare on 6, ülejäänud 30 jagunevad pooleks: $k=15$, $P=\dfrac{15}{36}=\dfrac5{12}\approx0{,}42$.`, 2],
        ['Leia tõenäosus, et silmade summa jagub 3-ga.', 2, '1/3|0,33', r`Summa 3 (2 paari), 6 (5), 9 (4), 12 (1): $k=12$, $P=\dfrac{12}{36}=\dfrac13$.`, 2],
        ['Leia tõenäosus, et vähemalt ühel täringul on kuus.', 2, '11/36|0,31', r`Vastandsündmus „kuut ei ole”: $5\cdot5=25$ paari. $P=1-\dfrac{25}{36}=\dfrac{11}{36}\approx0{,}31$.`, 2],
        [r`Lõigult $[0;6]$ valitakse juhuslik arv $x$. Leia tõenäosus, et $x^2-5x+4<0$.`, 2, '0,5|1/2', r`$x^2-5x+4<0$, kui $1<x<4$; pikkus 3: $P=\dfrac36=0{,}5$.`, 2],
        ['Täringupaari visati 600 korda, summa 7 tuli 96 korda. Leia summa 7 suhteline sagedus.', 2, '0,16', r`$\dfrac{96}{600}=0{,}16$ — lähedane klassikalisele tõenäosusele $\dfrac{6}{36}\approx0{,}17$.`, 2],
      ] },
      self: ['Leian kõigi ja soodsate tulemuste arvu.', 'Kasutan vastandsündmust.', 'Arvutan geomeetrilise tõenäosuse pikkuste või pindalade suhtena.'],
    },
    {
      title: 'Permutatsioonid, variatsioonid ja kombinatsioonid',
      ru: 'Перестановки, размещения и сочетания',
      course: 'VI',
      exam: 'I osa ülesanne 1 (5 p): „valitakse juhuslikult 3 …” — kombinatsioonide arv on tõenäosuse ülesande sees.',
      can: 'Õpilane kasutab korrutamis- ja liitmisreeglit, eristab permutatsioone, variatsioone ja kombinatsioone ning leiab nende abil tõenäosuse.',
      theory: [
        r`Korrutamisreegel: $m$ ja $n$ valikut järjest — $m\cdot n$ võimalust; liitmisreegel: kas üks või teine — $m+n$ — *pähe*`,
        r`Permutatsioonid: $P_n=n!=1\cdot2\cdots n$, $\;0!=1$ — *pähe*`,
        r`Variatsioonid (järjekord on oluline): $A_n^k=\dfrac{n!}{(n-k)!}=n(n-1)\cdots(n-k+1)$ — *pähe*`,
        r`Kombinatsioonid (järjekord ei ole oluline): $C_n^k=\dfrac{n!}{k!\,(n-k)!}$, $\;C_n^k=C_n^{n-k}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai комбинаторики нет — n!, A и C учим наизусть.',
        'Порядок важен (места, должности, цифры числа) — размещения A; не важен (группа, набор) — сочетания C.',
        'На калькуляторе: nPr — размещения, nCr — сочетания.',
      ],
      example: {
        task: 'Finaalis jookseb 8 sportlast. Mitmel viisil saab jagada kuld-, hõbe- ja pronksmedali? Mitmel viisil saab valida 3 sportlast, kes pääsevad edasi?',
        steps: [
          r`Medalid on erinevad — järjekord on oluline: $A_8^3=8\cdot7\cdot6=336$.`,
          r`Edasipääsejate kolmikus järjekord ei ole oluline: $C_8^3=\dfrac{8\cdot7\cdot6}{3!}=56$.`,
          r`Kontroll: igas kolmikus saab medalid jagada $3!=6$ viisil: $56\cdot6=336$ ✓.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$A_7^2$`, 1, '42', r`$7\cdot6=42$`, 1],
          [r`$C_9^3$`, 1, '84', r`$\dfrac{9\cdot8\cdot7}{6}=84$`, 1],
          [r`$\dfrac{6!}{4!\cdot2!}$`, 1, '15', r`$\dfrac{720}{24\cdot2}=15$`, 1],
          [r`$C_{12}^{10}$`, 1, '66', r`$C_{12}^{10}=C_{12}^2=\dfrac{12\cdot11}{2}=66$`, 1],
        ] },
        { title: 'Numbritest 1, 2, 3, 4, 5 moodustatakse kolmekohalisi arve, numbrid ei kordu.', parts: [
          ['Mitu arvu saab moodustada?', 1, '60', r`$A_5^3=5\cdot4\cdot3=60$`, 1],
          ['Mitu neist on paarisarvud?', 2, '24', r`Viimane number 2 või 4 (2 võimalust), siis $4\cdot3$: $2\cdot4\cdot3=24$.`, 2],
          ['Mitu neist on suuremad kui 300?', 2, '36', r`Esimene number 3, 4 või 5: $3\cdot4\cdot3=36$.`, 2],
        ] },
        { title: 'Tasandil on 10 punkti, millest ükski kolm ei asetse ühel sirgel.', parts: [
          ['Mitu sirget saab tõmmata kahe punkti kaudu?', 1, '45', r`$C_{10}^2=45$`, 1],
          ['Mitu kolmnurka saab moodustada?', 1, '120', r`$C_{10}^3=\dfrac{10\cdot9\cdot8}{6}=120$`, 1],
        ] },
        { title: 'Klubis on 7 poissi ja 5 tüdrukut. Valitakse 4-liikmeline võistkond.', parts: [
          ['Mitmel viisil saab võistkonna valida?', 1, '495', r`$C_{12}^4=495$`, 1],
          ['Mitmel viisil, kui võistkonnas on täpselt 2 tüdrukut?', 2, '210', r`$C_5^2\cdot C_7^2=10\cdot21=210$`, 2],
          ['Mitmel viisil, kui võistkonnas on vähemalt üks tüdruk?', 2, '460', r`Kõigist lahutame „ainult poisid”: $495-C_7^4=495-35=460$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Loteriil on 20 piletit, neist 4 võidavad. Ostetakse 3 piletit.', parts: [
        ['Mitmel viisil saab 3 piletit valida?', 2, '1140', r`$C_{20}^3=\dfrac{20\cdot19\cdot18}{6}=1140$`, 2],
        ['Leia tõenäosus, et ükski pilet ei võida.', 2, '28/57|0,49', r`$\dfrac{C_{16}^3}{C_{20}^3}=\dfrac{560}{1140}=\dfrac{28}{57}\approx0{,}49$`, 2],
        ['Leia tõenäosus, et täpselt üks pilet võidab.', 3, '8/19|0,42', r`$\dfrac{C_4^1\cdot C_{16}^2}{1140}=\dfrac{4\cdot120}{1140}=\dfrac{8}{19}\approx0{,}42$`, 3],
        ['Leia tõenäosus, et vähemalt üks pilet võidab.', 3, '29/57|0,51', r`Vastandsündmus on „ükski ei võida”: $1-\dfrac{28}{57}=\dfrac{29}{57}\approx0{,}51$`, 2],
      ] },
      self: ['Eristan, kas järjekord on oluline.', 'Arvutan A ja C valemiga ja kalkulaatoriga.', 'Leian tõenäosuse kombinatsioonide abil.'],
    },
    {
      title: 'Sündmuste summa ja korrutis',
      ru: 'Сумма и произведение событий',
      course: 'VI',
      exam: 'I osa ülesanne 1: „mõlemad”, „vähemalt üks”, „täpselt üks” — korrutamis- ja liitmislause koos vastandsündmusega.',
      can: 'Õpilane leiab sündmuste summa ja korrutise tõenäosuse nii sõltumatute kui ka sõltuvate sündmuste korral.',
      theory: [
        r`Summa $A+B$: toimub vähemalt üks; korrutis $AB$: toimuvad mõlemad — *pähe*`,
        r`$P(A+B)=P(A)+P(B)-P(AB)$; välistavate sündmuste korral $P(A+B)=P(A)+P(B)$ — *pähe*`,
        r`Sõltumatud sündmused: $P(AB)=P(A)\cdot P(B)$ — *pähe*`,
        r`Sõltuvad sündmused: $P(AB)=P(A)\cdot P_A(B)$, kus $P_A(B)$ on $B$ tõenäosus, kui $A$ on juba toimunud — *pähe*`,
        r`Vähemalt üks: $P=1-P(\bar A)\cdot P(\bar B)\cdots$ (sõltumatud) — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этих формул нет — учим наизусть.',
        '«И» — умножаем, «или» — складываем (и вычитаем общую часть).',
        'Без возвращения шара вероятность второго шага меняется: 4/10, потом 3/9.',
      ],
      example: {
        task: 'Kaks laskurit lasevad üks kord. Esimene tabab tõenäosusega 0,8, teine 0,7. Leia tõenäosus, et märki tabavad mõlemad, vähemalt üks ja täpselt üks.',
        steps: [
          r`Mõlemad: $0{,}8\cdot0{,}7=0{,}56$.`,
          r`Vähemalt üks: $1-0{,}2\cdot0{,}3=0{,}94$.`,
          r`Täpselt üks: $0{,}8\cdot0{,}3+0{,}2\cdot0{,}7=0{,}24+0{,}14=0{,}38$.`,
        ],
      },
      practice: [
        { title: r`$P(A)=0{,}5$, $P(B)=0{,}4$ ja $P(AB)=0{,}2$.`, parts: [
          [r`Leia $P(A+B)$.`, 1, '0,7', r`$0{,}5+0{,}4-0{,}2=0{,}7$`, 1],
          ['Leia tõenäosus, et ei toimu kumbki sündmus.', 1, '0,3', r`$1-0{,}7=0{,}3$`, 1],
          [r`Leia $P(A)\cdot P(B)$. Kas $A$ ja $B$ on sõltumatud?`, 1, '0,2', r`$0{,}5\cdot0{,}4=0{,}2=P(AB)$ — sündmused on sõltumatud.`, 1],
        ] },
        { title: 'Urnis on 6 valget ja 4 musta kuuli. Võetakse järjest 2 kuuli tagasi panemata.', parts: [
          ['Leia tõenäosus, et mõlemad on mustad.', 1, '2/15|0,13', r`$\dfrac4{10}\cdot\dfrac39=\dfrac{2}{15}\approx0{,}13$`, 1],
          ['Leia tõenäosus, et esimene on valge ja teine must.', 1, '4/15|0,27', r`$\dfrac6{10}\cdot\dfrac49=\dfrac{4}{15}\approx0{,}27$`, 1],
          ['Leia tõenäosus, et kuulid on eri värvi.', 2, '8/15|0,53', r`Valge-must või must-valge: $2\cdot\dfrac{24}{90}=\dfrac{8}{15}\approx0{,}53$`, 2],
        ] },
        { title: 'Seadmes on kolm sõltumatut osa töökindlusega 0,9; 0,8 ja 0,95.', parts: [
          ['Leia tõenäosus, et töötavad kõik kolm osa.', 1, '0,684', r`$0{,}9\cdot0{,}8\cdot0{,}95=0{,}684$`, 1],
          ['Leia tõenäosus, et töötab vähemalt üks osa.', 2, '0,999', r`$1-0{,}1\cdot0{,}2\cdot0{,}05=1-0{,}001=0{,}999$`, 2],
        ] },
        { title: 'Münti visatakse 4 korda.', parts: [
          ['Leia tõenäosus, et kõik neli korda tuleb kull.', 1, '0,0625|1/16', r`$\left(\dfrac12\right)^4=\dfrac1{16}$`, 1],
          ['Leia tõenäosus, et vähemalt üks kord tuleb kiri.', 1, '0,9375|15/16', r`$1-\dfrac1{16}=\dfrac{15}{16}$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Õpilane sooritab kolm sõltumatut testi. Ta sooritab need tõenäosustega 0,9; 0,8 ja 0,7.', parts: [
        ['Leia tõenäosus, et ta sooritab kõik kolm testi.', 2, '0,504', r`$0{,}9\cdot0{,}8\cdot0{,}7=0{,}504$`, 2],
        ['Leia tõenäosus, et ta ei soorita ühtki testi.', 2, '0,006', r`$0{,}1\cdot0{,}2\cdot0{,}3=0{,}006$`, 2],
        ['Leia tõenäosus, et ta sooritab vähemalt ühe testi.', 2, '0,994', r`$1-0{,}006=0{,}994$`, 2],
        ['Leia tõenäosus, et ta sooritab täpselt kaks testi.', 4, '0,398', r`$0{,}9\cdot0{,}8\cdot0{,}3+0{,}9\cdot0{,}2\cdot0{,}7+0{,}1\cdot0{,}8\cdot0{,}7=0{,}216+0{,}126+0{,}056=0{,}398$`, 4],
      ] },
      self: ['Eristan summat ja korrutist.', 'Korrutan sõltumatute ja sõltuvate sündmuste tõenäosusi.', 'Leian „täpselt üks” ja „vähemalt üks” tõenäosuse.'],
    },
    {
      title: 'Juhuslik suurus ja selle arvkarakteristikud',
      ru: 'Случайная величина и её числовые характеристики',
      course: 'VI',
      exam: 'I osa ülesanne 1: jaotustabel, keskväärtus ja standardhälve; mõnikord ka „kas mäng on aus?”.',
      can: 'Õpilane koostab jaotustabeli ja jaotushulknurga ning arvutab keskväärtuse, dispersiooni ja standardhälbe.',
      theory: [
        r`Jaotustabel: väärtused $x_i$ ja tõenäosused $p_i$, $\;\sum p_i=1$; jaotushulknurk ühendab punktid $(x_i;p_i)$ — *pähe*`,
        r`Keskväärtus: $E(X)=x_1p_1+x_2p_2+\dots+x_np_n$ — *pähe*`,
        r`Dispersioon: $D(X)=\sum(x_i-E(X))^2p_i=E(X^2)-\big(E(X)\big)^2$ — *pähe*`,
        r`Standardhälve: $\sigma=\sqrt{D(X)}$; andmete korral $\sigma=\sqrt{\dfrac{\sum(x_i-\bar x)^2}{n}}$ — *pähe*`,
        r`Mood — kõige sagedasem väärtus; mediaan — järjestatud andmete keskmine liige — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этих формул нет — E(X), D(X) и σ учим наизусть.',
        'Сначала проверь, что сумма вероятностей равна 1.',
        'D(X) удобнее считать как E(X²) − (E(X))².',
      ],
      example: {
        task: r`Juhusliku suuruse $X$ jaotus: $x$: 0; 1; 2; 3, $\;p$: 0,1; 0,3; 0,4; 0,2. Leia $E(X)$, $D(X)$ ja $\sigma$.`,
        steps: [
          r`$E(X)=0\cdot0{,}1+1\cdot0{,}3+2\cdot0{,}4+3\cdot0{,}2=1{,}7$.`,
          r`$E(X^2)=0+0{,}3+1{,}6+1{,}8=3{,}7$; $\;D(X)=3{,}7-1{,}7^2=0{,}81$.`,
          r`$\sigma=\sqrt{0{,}81}=0{,}9$.`,
        ],
        graph: { fns: '', xmin: -0.5, xmax: 3.5, ymin: -0.05, ymax: 0.5, step: 1, stepY: 0.1, points: 'A(0; 0.1)\nB(1; 0.3)\nC(2; 0.4)\nD(3; 0.2)', segments: 'A-B\nB-C\nC-D', caption: 'jaotushulknurk: x — väärtus, y — tõenäosus' },
      },
      practice: [
        { title: r`Jaotus: $x$: 1; 2; 3; 4, $\;p$: 0,2; $a$; 0,3; 0,1.`, parts: [
          [r`Leia $a$.`, 1, '0,4', r`$0{,}2+a+0{,}3+0{,}1=1$, $a=0{,}4$`, 1],
          [r`Leia $E(X)$.`, 1, '2,3', r`$0{,}2+0{,}8+0{,}9+0{,}4=2{,}3$`, 1],
          ['Leia mood.', 1, '2', 'Suurim tõenäosus 0,4 on väärtusel 2.', 1],
        ] },
        { title: 'Mängus visatakse täringut. Kui tuleb kuus, võidad 5 €, muidu kaotad 1 €.', parts: [
          ['Leia võidu keskväärtus.', 2, '0', r`$E=5\cdot\dfrac16-1\cdot\dfrac56=0$ — mäng on aus.`, 2],
          ['Leia keskväärtus, kui kuue eest makstakse 8 €.', 1, '0,5|1/2', r`$\dfrac86-\dfrac56=0{,}5$ €`, 1],
        ] },
        { title: 'Andmed: 2; 4; 4; 5; 7; 8.', parts: [
          ['Leia aritmeetiline keskmine.', 1, '5', r`$\dfrac{30}{6}=5$`, 1],
          ['Leia mediaan ja mood.', 1, '4,5; 4', r`Mediaan $\dfrac{4+5}{2}=4{,}5$; mood 4.`, 1],
          ['Leia standardhälve.', 2, '2', r`$\sigma=\sqrt{\dfrac{9+1+1+0+4+9}{6}}=\sqrt4=2$`, 2],
        ] },
        { title: r`Jaotus: $x$: −1; 0; 2, $\;p$: 0,3; 0,5; 0,2.`, parts: [
          [r`Leia $E(X)$.`, 1, '0,1', r`$-0{,}3+0+0{,}4=0{,}1$`, 1],
          [r`Leia $\sigma$ kahe kümnendkohani.`, 2, '1,04', r`$E(X^2)=0{,}3+0{,}8=1{,}1$; $D=1{,}1-0{,}01=1{,}09$; $\sigma\approx1{,}04$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Karbis on 3 punast ja 2 valget kuuli. Võetakse korraga 2 kuuli. $X$ on punaste kuulide arv.`, grid: { xmin: -0.5, xmax: 3, ymin: 0, ymax: 0.8, step: 1, stepY: 0.1, blank: true }, parts: [
        [r`Leia $P(X=0)$, $P(X=1)$ ja $P(X=2)$.`, 3, '0,1; 0,6; 0,3', r`$C_5^2=10$: $P(0)=\dfrac{1}{10}$, $P(1)=\dfrac{3\cdot2}{10}=0{,}6$, $P(2)=\dfrac{3}{10}=0{,}3$.`, 3],
        [r`Leia $E(X)$.`, 2, '1,2', r`$0+0{,}6+0{,}6=1{,}2$`, 1],
        [r`Leia standardhälve $\sigma$.`, 3, '0,6', r`$E(X^2)=0{,}6+1{,}2=1{,}8$; $D=1{,}8-1{,}44=0{,}36$; $\sigma=0{,}6$`, 2],
        ['Joonesta jaotushulknurk.', 2, '', 'Punktid (0; 0,1), (1; 0,6), (2; 0,3), ühendatud lõikudega.', 0],
      ] },
      self: ['Koostan jaotustabeli ja kontrollin, et Σp = 1.', 'Arvutan E(X), D(X) ja σ.', 'Joonestan jaotushulknurga.'],
    },
    {
      title: 'Binoomjaotus',
      ru: 'Биномиальное распределение',
      course: 'VI',
      exam: 'I osa ülesanne 1: „visatakse 5 korda … leia tõenäosus, et täpselt 2 korda …” — Bernoulli valem.',
      can: 'Õpilane tunneb ära Bernoulli katseskeemi, arvutab binoomjaotuse tõenäosusi, keskväärtuse ja standardhälbe.',
      theory: [
        r`Bernoulli skeem: $n$ sõltumatut katset, igas „õnnestumine” tõenäosusega $p$, $q=1-p$ — *pähe*`,
        r`Täpselt $k$ õnnestumist: $P_n(k)=C_n^k\,p^k\,q^{\,n-k}$ — *pähe*`,
        r`Keskväärtus $E(X)=np$, standardhälve $\sigma=\sqrt{npq}$ — *pähe*`,
        r`„Vähemalt üks”: $P=1-q^n$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai формулы Бернулли нет — учим наизусть.',
        'Проверь условия: опыты независимы, вероятность успеха p одна и та же.',
        '«Не меньше 4 из 5» = P(4) + P(5).',
      ],
      example: {
        task: 'Testis on 5 küsimust, igal 4 vastusevarianti. Õpilane arvab kõik vastused. Leia tõenäosus, et täpselt 2 vastust on õiged, ja õigete vastuste keskväärtus.',
        steps: [
          r`$n=5$, $p=0{,}25$, $q=0{,}75$.`,
          r`$P_5(2)=C_5^2\cdot0{,}25^2\cdot0{,}75^3=10\cdot0{,}0625\cdot0{,}421875\approx0{,}26$.`,
          r`$E(X)=np=5\cdot0{,}25=1{,}25$.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 6, ymin: -0.05, ymax: 0.45, step: 1, stepY: 0.1, shade: '0.237; -0.3; 0.3\n0.396; 0.7; 1.3\n0.264; 1.7; 2.3\n0.088; 2.7; 3.3\n0.015; 3.7; 4.3\n0.001; 4.7; 5.3', caption: 'binoomjaotus n = 5, p = 0,25: x — õigete vastuste arv, y — tõenäosus' },
      },
      practice: [
        { title: 'Münti visatakse 4 korda.', parts: [
          ['Leia tõenäosus, et kull tuleb täpselt 2 korda.', 1, '0,375|3/8', r`$C_4^2\cdot0{,}5^4=\dfrac{6}{16}=0{,}375$`, 1],
          ['Leia tõenäosus, et kull tuleb 4 korda.', 1, '0,0625|1/16', r`$0{,}5^4=0{,}0625$`, 1],
        ] },
        { title: 'Korvpallur tabab vabaviske tõenäosusega 0,8. Ta viskab 5 korda.', parts: [
          ['Leia tõenäosus, et ta tabab täpselt 4 korda.', 1, '0,41', r`$C_5^4\cdot0{,}8^4\cdot0{,}2=5\cdot0{,}4096\cdot0{,}2\approx0{,}41$`, 1],
          ['Leia tõenäosus, et ta tabab kõik 5 korda.', 1, '0,33', r`$0{,}8^5\approx0{,}33$`, 1],
          ['Leia tõenäosus, et ta tabab vähemalt 4 korda.', 2, '0,74', r`$0{,}4096+0{,}32768\approx0{,}74$`, 2],
        ] },
        { title: 'Detail on praak tõenäosusega 0,1. Kontrollitakse 10 detaili.', parts: [
          ['Leia praakdetailide arvu keskväärtus ja standardhälve.', 2, '1; 0,95', r`$E=10\cdot0{,}1=1$; $\sigma=\sqrt{10\cdot0{,}1\cdot0{,}9}\approx0{,}95$`, 2],
          ['Leia tõenäosus, et praaki ei ole.', 1, '0,35', r`$0{,}9^{10}\approx0{,}35$`, 1],
        ] },
        { title: 'Täringut visatakse 6 korda.', parts: [
          ['Leia tõenäosus, et kuus tuleb täpselt üks kord.', 2, '0,4', r`$C_6^1\cdot\dfrac16\cdot\left(\dfrac56\right)^5=\left(\dfrac56\right)^5\approx0{,}40$`, 2],
          ['Leia tõenäosus, et kuus tuleb vähemalt üks kord.', 1, '0,67', r`$1-\left(\dfrac56\right)^6\approx0{,}67$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Buss hilineb igal tööpäeval tõenäosusega 0,2, päevad on sõltumatud. Vaadeldakse 5 tööpäeva; $X$ on hilinemiste arv.`, parts: [
        ['Leia tõenäosus, et buss ei hiline ühelgi päeval.', 2, '0,33', r`$0{,}8^5\approx0{,}33$`, 1],
        ['Leia tõenäosus, et buss hilineb täpselt 2 päeval.', 3, '0,2|0,20', r`$C_5^2\cdot0{,}2^2\cdot0{,}8^3=10\cdot0{,}04\cdot0{,}512=0{,}2048\approx0{,}20$`, 2],
        ['Leia tõenäosus, et buss hilineb vähemalt 2 päeval.', 3, '0,26', r`$P(1)=5\cdot0{,}2\cdot0{,}8^4=0{,}4096$; $1-0{,}32768-0{,}4096\approx0{,}26$`, 3],
        [r`Leia $E(X)$ ja $\sigma$.`, 2, '1; 0,89', r`$E=5\cdot0{,}2=1$; $\sigma=\sqrt{5\cdot0{,}2\cdot0{,}8}\approx0{,}89$`, 2],
      ] },
      self: ['Tunnen ära Bernoulli katseskeemi.', 'Arvutan P(k) valemiga.', 'Leian np ja √(npq).'],
    },
    {
      title: 'Normaaljaotus',
      ru: 'Нормальное распределение',
      course: 'VI',
      exam: 'I osa ülesanne 1: pikkus, mass, punktid on normaaljaotusega — reegel 68–95–99,7 ja standardiseerimine.',
      can: 'Õpilane kirjeldab normaaljaotuse kõverat, kasutab reeglit 68–95–99,7 ja leiab tõenäosuse standardiseeritud väärtuse abil.',
      theory: [
        r`Normaaljaotuse kõver on kellukesekujuline ja sümmeetriline keskväärtuse $\mu$ suhtes; laius sõltub $\sigma$-st — *pähe*`,
        r`Reegel: $\mu\pm\sigma$ sees $\approx68\%$, $\mu\pm2\sigma$ sees $\approx95\%$, $\mu\pm3\sigma$ sees $\approx99{,}7\%$ — *pähe*`,
        r`Standardiseerimine: $z=\dfrac{x-\mu}{\sigma}$; $\;P(X<x)=\Phi(z)$ (tabel antakse ülesandes) — *pähe*`,
        r`$\Phi(-z)=1-\Phi(z)$; $\;P(X>x)=1-\Phi(z)$; $\;P(\mu-z\sigma<X<\mu+z\sigma)=2\Phi(z)-1$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нормального распределения нет — правило 68–95–99,7 и z учим наизусть.',
        'z показывает, на сколько σ значение отличается от среднего.',
        'Кривая симметрична: вне μ ± 2σ около 5 %, с каждой стороны около 2,5 %.',
      ],
      example: {
        task: r`Õpilaste pikkus on normaaljaotusega, $\mu=170$ cm, $\sigma=8$ cm. Leia tõenäosus, et pikkus on 162–178 cm ja et pikkus on üle 186 cm.`,
        steps: [
          r`$162=\mu-\sigma$, $178=\mu+\sigma$: $P\approx0{,}68$.`,
          r`$z=\dfrac{186-170}{8}=2$: väljaspool $\mu\pm2\sigma$ on $\approx5\%$, ühel pool pool sellest.`,
          r`$P(X>186)\approx\dfrac{1-0{,}95}{2}=0{,}025$.`,
        ],
        graph: { fns: 'y = 0.4exp(-x^2/2)', xmin: -4, xmax: 4, ymin: -0.1, ymax: 0.5, step: 1, stepY: 0.1, shade: '0.4exp(-x^2/2); -1; 1', caption: 'standardiseeritud kõver: x — z-väärtus; varjutatud osa μ ± σ ≈ 68 %' },
      },
      practice: [
        { title: r`Testi punktid on normaaljaotusega, $\mu=60$, $\sigma=10$.`, parts: [
          [r`Leia $P(50<X<70)$.`, 1, '0,68', r`$\mu\pm\sigma$: $\approx0{,}68$`, 1],
          [r`Leia $P(40<X<80)$.`, 1, '0,95', r`$\mu\pm2\sigma$: $\approx0{,}95$`, 1],
          [r`Leia $P(X>80)$.`, 1, '0,025', r`$\dfrac{1-0{,}95}{2}=0{,}025$`, 1],
        ] },
        { title: r`Sama test. On teada, et $\Phi(1{,}5)=0{,}9332$.`, parts: [
          ['Leia 75 punkti z-väärtus.', 1, '1,5', r`$z=\dfrac{75-60}{10}=1{,}5$`, 1],
          [r`Leia $P(X<75)$ ja $P(X>75)$.`, 2, '0,93; 0,07', r`$P(X<75)=0{,}9332\approx0{,}93$; $P(X>75)=0{,}0668\approx0{,}07$`, 2],
        ] },
        { title: r`Pakkide mass on normaaljaotusega, $\mu=500$ g, $\sigma=4$ g.`, parts: [
          ['Leia tõenäosus, et pakk kaalub alla 492 g.', 2, '0,025', r`$492=\mu-2\sigma$: $P\approx\dfrac{1-0{,}95}{2}=0{,}025$`, 2],
          ['Mitu pakki 1000-st on oodata kergemad kui 492 g?', 1, '25', r`$1000\cdot0{,}025=25$`, 1],
        ] },
        { title: r`$\mu=20$, $\sigma=4$. On teada, et $\Phi(0{,}5)=0{,}6915$.`, parts: [
          [r`Leia $P(X<22)$.`, 1, '0,69', r`$z=0{,}5$: $P=0{,}6915\approx0{,}69$`, 1],
          [r`Leia $P(18<X<22)$.`, 2, '0,38', r`$2\cdot0{,}6915-1=0{,}383\approx0{,}38$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Õunte mass on normaaljaotusega, $\mu=150$ g, $\sigma=20$ g. On teada: $\Phi(1)=0{,}8413$, $\Phi(1{,}25)=0{,}8944$, $\Phi(2)=0{,}9772$.`, parts: [
        ['Leia 175-grammise õuna z-väärtus.', 2, '1,25', r`$z=\dfrac{175-150}{20}=1{,}25$`, 1],
        ['Leia tõenäosus, et õun kaalub alla 175 g.', 2, '0,89', r`$\Phi(1{,}25)=0{,}8944\approx0{,}89$`, 1],
        ['Leia tõenäosus, et õuna mass on 130–170 g.', 3, '0,68', r`$z=\pm1$: $2\cdot0{,}8413-1=0{,}6826\approx0{,}68$`, 2],
        ['Mitu õuna 2000-st kaalub eeldatavasti üle 190 g?', 3, '46|45,6', r`$z=2$: $P=1-0{,}9772=0{,}0228$; $2000\cdot0{,}0228\approx46$`, 3],
      ] },
      self: ['Kasutan reeglit 68–95–99,7.', 'Arvutan z-väärtuse.', 'Leian tõenäosuse Φ tabeli abil.'],
    },
    {
      title: 'Valim, üldkogum ja usalduspiirkond',
      ru: 'Выборка, генеральная совокупность и доверительный интервал',
      course: 'VI',
      exam: 'I osa ülesanne 1: „küsitleti 400 inimest … leia 95% usalduspiirkond” — keskmise või osakaalu hinnang.',
      can: 'Õpilane eristab valimit ja üldkogumit, arvutab keskmise standardvea ning keskmise ja osakaalu 95% usalduspiirkonna.',
      theory: [
        r`Üldkogum — kõik uuritavad objektid; valim — nende osa, mida mõõdetakse; valim peab olema esinduslik (juhuslik) — *pähe*`,
        r`Keskmise standardviga: $\dfrac{s}{\sqrt n}$, kus $s$ on valimi standardhälve — *pähe*`,
        r`Keskmise 95% usalduspiirkond: $\left(\bar x-1{,}96\dfrac{s}{\sqrt n};\;\bar x+1{,}96\dfrac{s}{\sqrt n}\right)$ — *pähe*`,
        r`Osakaalu 95% usalduspiirkond: $\hat p\pm1{,}96\sqrt{\dfrac{\hat p(1-\hat p)}{n}}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai доверительного интервала нет — 1,96 и формулы учим наизусть.',
        'Чем больше выборка, тем уже интервал: в 4 раза больше n — в 2 раза уже.',
        'Если проверяемое значение не попадает в интервал, утверждение сомнительно.',
      ],
      example: {
        task: 'Küsitleti 100 juhuslikku õpilast. Keskmine uneaeg oli 7,2 h, standardhälve 0,9 h. Leia keskmise 95% usalduspiirkond.',
        steps: [
          r`Standardviga $\dfrac{0{,}9}{\sqrt{100}}=0{,}09$.`,
          r`$1{,}96\cdot0{,}09\approx0{,}18$.`,
          r`$7{,}2\pm0{,}18$: usalduspiirkond $(7{,}02;\,7{,}38)$ tundi.`,
        ],
      },
      practice: [
        { title: r`Valimis $n=64$, $\bar x=50$, $s=8$.`, parts: [
          ['Leia keskmise standardviga.', 1, '1', r`$\dfrac{8}{\sqrt{64}}=1$`, 1],
          ['Leia 95% usalduspiirkond.', 2, '48,04; 51,96', r`$50\pm1{,}96$: $(48{,}04;\,51{,}96)$`, 2],
        ] },
        { title: 'Küsitleti 400 inimest, neist 240 toetas uut parki.', parts: [
          [r`Leia toetajate osakaal $\hat p$.`, 1, '0,6', r`$\dfrac{240}{400}=0{,}6$`, 1],
          ['Leia 95% usalduspiirkonna poollaius.', 2, '0,048|0,05', r`$1{,}96\sqrt{\dfrac{0{,}6\cdot0{,}4}{400}}=1{,}96\cdot0{,}0245\approx0{,}048$`, 2],
          ['Kirjuta usalduspiirkond.', 1, '0,55; 0,65', r`$0{,}6\pm0{,}048$: $(0{,}552;\,0{,}648)\approx(0{,}55;\,0{,}65)$`, 1],
        ] },
        { title: 'Valimi suurus.', parts: [
          ['Mitu korda kitseneb usalduspiirkond, kui valimit suurendada 4 korda?', 2, '2', r`Poollaius sisaldab $\dfrac{1}{\sqrt n}$: $\sqrt4=2$ korda kitsam.`, 2],
          ['Mitu korda tuleb valimit suurendada, et piirkond kitseneks 3 korda?', 1, '9', r`$\sqrt{k}=3$, $k=9$.`, 1],
        ] },
        { title: 'Valim: 12; 15; 11; 14; 13.', parts: [
          ['Leia keskmine.', 1, '13', r`$\dfrac{65}{5}=13$`, 1],
          ['Leia standardhälve kahe kümnendkohani.', 2, '1,41|√2', r`$\sqrt{\dfrac{1+4+4+1+0}{5}}=\sqrt2\approx1{,}41$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Tehase toodangust võeti 100 juhuslikku pakki. Nende keskmine mass oli 498 g, standardhälve 5 g. Pakile on kirjutatud „500 g”.', parts: [
        ['Mis on selles uuringus üldkogum ja mis valim?', 2, '', 'Üldkogum — kõik tehase pakid; valim — 100 juhuslikult võetud pakki.', 2],
        ['Leia keskmise standardviga.', 2, '0,5', r`$\dfrac{5}{\sqrt{100}}=0{,}5$`, 1],
        ['Leia keskmise massi 95% usalduspiirkond.', 3, '497,02; 498,98', r`$498\pm1{,}96\cdot0{,}5=498\pm0{,}98$: $(497{,}02;\,498{,}98)$ g`, 2],
        ['Kas valimi põhjal võib väita, et pakkide keskmine mass on 500 g? Vasta ei või võib.', 3, 'ei', r`500 g ei ole usalduspiirkonnas $(497{,}02;\,498{,}98)$ — pakid on keskmiselt kergemad.`, 2],
      ] },
      self: ['Eristan valimit ja üldkogumit.', 'Arvutan keskmise 95% usalduspiirkonna.', 'Arvutan osakaalu usalduspiirkonna.'],
    },
    {
      title: 'Hajuvusdiagramm ja korrelatsioonikordaja',
      ru: 'Диаграмма рассеяния и коэффициент корреляции',
      course: 'VI',
      exam: 'Statistika ülesanne: hajuvusdiagramm, korrelatsioonikordaja arvutamine ja tõlgendamine (ka tabelarvutuses).',
      can: 'Õpilane joonestab hajuvusdiagrammi, arvutab korrelatsioonikordaja ja tõlgendab seose suunda ning tugevust.',
      theory: [
        r`Hajuvusdiagramm: iga objekt on punkt $(x;y)$; punktipilve kuju näitab seost — *pähe*`,
        r`$r=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum(x_i-\bar x)^2\cdot\sum(y_i-\bar y)^2}}$ — *pähe*`,
        r`$-1\le r\le1$: märk näitab suunda, $|r|$ tugevust ($|r|\ge0{,}7$ tugev, $0{,}3$–$0{,}7$ keskmine, alla $0{,}3$ nõrk) — *pähe*`,
        r`Tabelarvutuses: KORREL (CORREL); korrelatsioon ei tõesta põhjuslikku seost — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai коэффициента корреляции нет — формулу учим наизусть.',
        'Считай по таблице: x − x̄, y − ȳ, их произведения и квадраты.',
        'r близко к 1 — сильная прямая связь, к −1 — сильная обратная.',
      ],
      example: {
        task: 'Andmed: (1; 2), (2; 3), (3; 5), (4; 4), (5; 6). Leia korrelatsioonikordaja.',
        steps: [
          r`$\bar x=3$, $\bar y=4$; $x-\bar x$: −2; −1; 0; 1; 2; $\;y-\bar y$: −2; −1; 1; 0; 2.`,
          r`$\sum(x-\bar x)(y-\bar y)=4+1+0+0+4=9$; $\sum(x-\bar x)^2=10$; $\sum(y-\bar y)^2=10$.`,
          r`$r=\dfrac{9}{\sqrt{10\cdot10}}=0{,}9$ — tugev positiivne seos.`,
        ],
        graph: { fns: '', xmin: 0, xmax: 6, ymin: 0, ymax: 7, step: 1, stepY: 1, points: 'A(1; 2)\nB(2; 3)\nC(3; 5)\nD(4; 4)\nE(5; 6)', caption: 'hajuvusdiagramm' },
      },
      practice: [
        { title: 'Andmed: (1; 5), (2; 3), (3; 1).', parts: [
          ['Leia korrelatsioonikordaja.', 2, '-1', r`$\bar x=2$, $\bar y=3$; $\sum=(-1)\cdot2+0+1\cdot(-2)=-4$; $\sqrt{2\cdot8}=4$; $r=-1$`, 2],
          ['Kirjelda seost.', 1, '', 'Täielik negatiivne seos: punktid on kahaneval sirgel.', 1],
        ] },
        { title: 'Andmed: (2; 10), (4; 14), (6; 15), (8; 21).', parts: [
          [r`Leia $\bar x$ ja $\bar y$.`, 1, '5; 15', r`$\bar x=\dfrac{20}{4}=5$; $\bar y=\dfrac{60}{4}=15$`, 1],
          ['Leia korrelatsioonikordaja kahe kümnendkohani.', 3, '0,97', r`$\sum=15+1+0+18=34$; $\sum(x-\bar x)^2=20$; $\sum(y-\bar y)^2=62$; $r=\dfrac{34}{\sqrt{1240}}\approx0{,}97$`, 3],
        ] },
        { title: 'Kolmes uuringus saadi r = 0,45; r = −0,83 ja r = 0,7.', parts: [
          ['Milline seos on kõige tugevam? Kirjuta r.', 1, '-0,83', r`$|-0{,}83|$ on suurim.`, 1],
          ['Milline seos on keskmise tugevusega? Kirjuta r.', 1, '0,45', r`$0{,}3\le0{,}45<0{,}7$.`, 1],
        ] },
        { title: 'Andmed: (1; 8), (2; 8), (3; 6), (4; 5), (5; 3).', parts: [
          ['Leia korrelatsioonikordaja kahe kümnendkohani.', 3, '-0,97', r`$\bar x=3$, $\bar y=6$; $\sum=-4-2+0-1-6=-13$; $\sum(x-\bar x)^2=10$, $\sum(y-\bar y)^2=18$; $r=\dfrac{-13}{\sqrt{180}}\approx-0{,}97$`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Õppimisele kulunud tunnid x ja testi punktid y: (1; 52), (2; 60), (3; 58), (4; 70), (5; 75).', grid: { xmin: 0, xmax: 6, ymin: 40, ymax: 80, step: 1, stepY: 5, blank: true }, parts: [
        ['Joonesta hajuvusdiagramm.', 2, '', 'Viis punkti, mis tõusevad paremale.', 0],
        [r`Leia $\bar x$ ja $\bar y$.`, 2, '3; 63', r`$\bar x=\dfrac{15}{5}=3$; $\bar y=\dfrac{315}{5}=63$`, 1],
        ['Leia korrelatsioonikordaja kahe kümnendkohani.', 4, '0,95', r`$y-\bar y$: −11; −3; −5; 7; 12. $\sum(x-\bar x)(y-\bar y)=22+3+0+7+24=56$; $\sum(x-\bar x)^2=10$; $\sum(y-\bar y)^2=348$; $r=\dfrac{56}{\sqrt{3480}}\approx0{,}95$`, 4],
        ['Kirjelda seose suunda ja tugevust.', 2, 'tugev positiivne|positiivne tugev', 'Tugev positiivne seos: rohkem õppinud said rohkem punkte.', 1],
      ] },
      self: ['Joonestan hajuvusdiagrammi.', 'Arvutan korrelatsioonikordaja tabeli abil.', 'Tõlgendan r märki ja suurust.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: VI kursus',
      ru: 'Повторение и контрольная работа: VI курс',
      course: 'VI',
      exam: 'VI kursuse teemad annavad laia riigieksami I osas tavaliselt ülesande 1 (5 p).',
      can: 'Õpilane lahendab VI kursuse ülesandeid iseseisvalt: tõenäosus, kombinatoorika, jaotused, usalduspiirkond ja korrelatsioon.',
      theory: [
        r`$P(A)=\dfrac kn$; $\;P(\bar A)=1-P(A)$; $\;P(A+B)=P(A)+P(B)-P(AB)$; $\;P(AB)=P(A)P(B)$ (sõltumatud) — *pähe*`,
        r`$P_n=n!$, $\;A_n^k=\dfrac{n!}{(n-k)!}$, $\;C_n^k=\dfrac{n!}{k!\,(n-k)!}$ — *pähe*`,
        r`$E(X)=\sum x_ip_i$, $\;D(X)=E(X^2)-E(X)^2$; binoomjaotus $P_n(k)=C_n^kp^kq^{n-k}$, $E=np$, $\sigma=\sqrt{npq}$ — *pähe*`,
        r`Normaaljaotus 68–95–99,7, $z=\dfrac{x-\mu}{\sigma}$; usalduspiirkond $\bar x\pm1{,}96\dfrac{s}{\sqrt n}$; $-1\le r\le1$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai ни одной формулы VI курса нет — повторяем всё наизусть.',
        'Перед контрольной проверь: где порядок важен (A), где нет (C).',
        'В ответах вероятности — дробью или десятичной с двумя знаками.',
      ],
      example: {
        task: 'Urnis on 5 punast ja 5 sinist kuuli. Võetakse 3 kuuli. Leia tõenäosus, et kõik on punased.',
        steps: [
          r`Kõik valikud: $C_{10}^3=120$; soodsad: $C_5^3=10$.`,
          r`$P=\dfrac{10}{120}=\dfrac1{12}\approx0{,}08$.`,
        ],
      },
      practice: [
        { title: 'Kombinatoorika.', parts: [
          [r`Arvuta $A_6^3$.`, 1, '120', r`$6\cdot5\cdot4=120$`, 1],
          [r`Arvuta $C_8^5$.`, 1, '56', r`$C_8^3=56$`, 1],
        ] },
        { title: 'Kaks sõltumatut sündmust: P(A) = 0,3 ja P(B) = 0,6.', parts: [
          ['Leia tõenäosus, et toimuvad mõlemad.', 1, '0,18', r`$0{,}3\cdot0{,}6=0{,}18$`, 1],
          ['Leia tõenäosus, et toimub vähemalt üks.', 1, '0,72', r`$1-0{,}7\cdot0{,}4=0{,}72$`, 1],
        ] },
        { title: 'Binoomjaotus: n = 3, p = 0,5.', parts: [
          ['Leia P(2).', 1, '0,375|3/8', r`$C_3^2\cdot0{,}5^3=\dfrac38$`, 1],
          ['Leia keskväärtus.', 1, '1,5', r`$3\cdot0{,}5=1{,}5$`, 1],
        ] },
        { title: 'Normaaljaotus ja valim.', parts: [
          [r`$\mu=50$, $\sigma=5$. Leia $P(45<X<55)$.`, 1, '0,68', r`$\mu\pm\sigma$: $0{,}68$`, 1],
          [r`$n=25$, $\bar x=40$, $s=5$. Leia usalduspiirkonna poollaius.`, 1, '1,96', r`$1{,}96\cdot\dfrac{5}{5}=1{,}96$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'VI kursus: tõenäosus ja statistika. Aega 45 minutit.', parts: [
        ['1. Visatakse kahte täringut. Leia tõenäosus, et silmade summa on 10.', 2, '1/12|0,08', r`$(4;6),(5;5),(6;4)$: $\dfrac{3}{36}=\dfrac1{12}$`, 1],
        [r`2. Arvuta $C_9^4$.`, 2, '126', r`$\dfrac{9\cdot8\cdot7\cdot6}{24}=126$`, 1],
        ['3. Mitmel viisil saab 6 inimest järjekorda seada?', 1, '720', r`$6!=720$`, 1],
        ['4. Mitmel viisil saab 10 õpilasest valida esimehe ja sekretäri?', 2, '90', r`$A_{10}^2=10\cdot9=90$`, 1],
        ['5. Sündmused A ja B on sõltumatud, P(A) = 0,6 ja P(B) = 0,5. Leia P(AB).', 2, '0,3', r`$0{,}6\cdot0{,}5=0{,}3$`, 1],
        ['6. Leia samade sündmuste korral P(A + B).', 2, '0,8', r`$0{,}6+0{,}5-0{,}3=0{,}8$`, 1],
        [r`7. Jaotus: $x$: 1; 2; 3, $p$: 0,5; 0,3; 0,2. Leia $E(X)$.`, 2, '1,7', r`$0{,}5+0{,}6+0{,}6=1{,}7$`, 1],
        ['8. Leia sama jaotuse standardhälve.', 3, '0,78', r`$E(X^2)=0{,}5+1{,}2+1{,}8=3{,}5$; $D=3{,}5-2{,}89=0{,}61$; $\sigma\approx0{,}78$`, 2],
        ['9. Münti visatakse 6 korda. Leia tõenäosus, et kull tuleb täpselt 3 korda.', 3, '0,31|5/16', r`$C_6^3\cdot0{,}5^6=\dfrac{20}{64}\approx0{,}31$`, 2],
        [r`10. IQ on normaaljaotusega, $\mu=100$, $\sigma=15$. Leia $P(70<X<130)$.`, 2, '0,95', r`$\mu\pm2\sigma$: $\approx0{,}95$`, 1],
        [r`11. $n=36$, $\bar x=20$, $s=6$. Leia keskmise 95% usalduspiirkond.`, 2, '18,04; 21,96', r`$20\pm1{,}96\cdot\dfrac{6}{6}$: $(18{,}04;\,21{,}96)$`, 1],
        ['12. Andmed (1; 3), (2; 5), (3; 7). Leia korrelatsioonikordaja.', 2, '1', r`Punktid on tõusval sirgel $y=2x+1$: $r=1$.`, 1],
      ] },
      self: ['Oskan VI kursuse kõiki ülesandetüüpe.', 'Valin õige kombinatoorika valemi.', 'Arvutan jaotuse karakteristikud ja usalduspiirkonna.'],
    },
    // ───────────── VII kursus „Funktsioonid. Arvjadad” ─────────────
    {
      title: 'Funktsioon, määramispiirkond ja nullkohad',
      ru: 'Функция, область определения и нули',
      course: 'VII',
      exam: 'II osa ülesanne 5 (10 p) algab funktsiooni määramispiirkonnast, nullkohtadest ning positiivsus- ja negatiivsuspiirkonnast.',
      can: 'Õpilane leiab funktsiooni määramis- ja muutumispiirkonna, nullkohad, positiivsus- ja negatiivsuspiirkonna ning loeb graafikult kasvamis- ja kahanemisvahemikud.',
      theory: [
        r`Funktsioon seab igale $x$-ile määramispiirkonnast $X$ vastavusse täpselt ühe $y$; kõik $y$-id moodustavad muutumispiirkonna $Y$ — *pähe*`,
        r`Määramispiirkond: nimetaja $\ne0$, paarisastme juuritav $\ge0$, logaritmitav $>0$ — *pähe*`,
        r`Nullkoht: $f(x)=0$; positiivsuspiirkond $X^+$: $f(x)>0$; negatiivsuspiirkond $X^-$: $f(x)<0$ — *pähe*`,
        r`Kasvav vahemikus: suurem $x$ annab suurema $f(x)$; kahanev: suurem $x$ annab väiksema $f(x)$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этих определений нет — учим наизусть.',
        'X⁺ и X⁻ находим методом интервалов: нули и точки разрыва делят ось на части.',
        'Область значений Y — это все значения y, которые функция принимает.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=x^3-4x$: leia nullkohad, $X^+$ ja $X^-$.`,
        steps: [
          r`$x^3-4x=x(x-2)(x+2)=0$: nullkohad $-2$; $0$; $2$.`,
          r`Märgid vahemikes: $(-\infty;-2)$ —, $(-2;0)$ +, $(0;2)$ —, $(2;\infty)$ +.`,
          r`$X^+=(-2;0)\cup(2;\infty)$; $\;X^-=(-\infty;-2)\cup(0;2)$.`,
        ],
        graph: { fns: 'y = x^3 - 4x', xmin: -3, xmax: 3, ymin: -5, ymax: 5, step: 1, stepY: 1, points: 'A(-2; 0)\nO(0; 0)\nB(2; 0)' },
      },
      practice: [
        { title: 'Leia määramispiirkond.', parts: [
          [r`$y=\sqrt{6-2x}$`, 1, '(-∞;3]|x<=3|x≤3', r`$6-2x\ge0$, $x\le3$.`, 1],
          [r`$y=\dfrac{1}{x^2-9}$`, 1, 'x≠±3|x≠-3; x≠3', r`$x^2\ne9$: $x\ne\pm3$.`, 1],
          [r`$y=\dfrac{\sqrt{x+4}}{x-1}$`, 2, '[-4;1)∪(1;∞)|x>=-4; x≠1|x≥-4; x≠1', r`$x+4\ge0$ ja $x\ne1$: $x\in[-4;1)\cup(1;\infty)$.`, 2],
        ] },
        { title: r`$f(x)=\dfrac{x-2}{x+3}$.`, parts: [
          ['Leia nullkoht.', 1, '2', r`Lugeja on 0, kui $x=2$.`, 1],
          [r`Leia $f(-2)$.`, 1, '-4', r`$\dfrac{-4}{1}=-4$`, 1],
          [r`Leia $X^+$.`, 2, '(-∞;-3)∪(2;∞)|x<-3 või x>2', r`Intervallmeetod: märgid $+$, $-$, $+$ punktidega $-3$ ja $2$.`, 2],
        ] },
        { title: r`$f(x)=-x^2+6x-5$.`, parts: [
          ['Leia nullkohad.', 1, '1; 5', r`$x^2-6x+5=0$: $x=1$, $x=5$.`, 1],
          ['Leia muutumispiirkond.', 1, '(-∞;4]|y<=4|y≤4', r`Haripunkt $x_0=3$, $f(3)=-9+18-5=4$; harud alla: $y\le4$.`, 1],
          ['Leia kasvamisvahemik.', 1, '(-∞;3)|x<3', 'Harud alla: kasvab haripunktist vasakul.', 1],
        ] },
        { title: 'Leia muutumispiirkond.', parts: [
          [r`$f(x)=2+\sqrt{x-1}$`, 1, '[2;∞)|y>=2|y≥2', r`$\sqrt{x-1}\ge0$, seega $y\ge2$.`, 1],
          [r`$f(x)=x^2+1$ lõigul $[-1;2]$`, 2, '[1;5]|1<=y<=5|1≤y≤5', r`Vähim $f(0)=1$, suurim $f(2)=5$: $Y=[1;5]$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-3x^2$.`, grid: { xmin: -2, xmax: 4, ymin: -5, ymax: 3, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia määramispiirkond.', 1, 'R|(-∞;∞)', 'Polünoom on määratud kõikjal.', 1],
        ['Leia nullkohad.', 2, '0; 3', r`$x^2(x-3)=0$: $x=0$, $x=3$.`, 1],
        [r`Leia $X^+$.`, 2, '(3;∞)|x>3', r`$x^2\ge0$, märk sõltub tegurist $x-3$: $f(x)>0$, kui $x>3$.`, 1],
        [r`Leia $X^-$.`, 2, '(-∞;0)∪(0;3)|x<3; x≠0', r`$f(x)<0$, kui $x<3$ ja $x\ne0$.`, 1],
        [r`Leia $f(-1)$.`, 1, '-4', r`$-1-3=-4$`, 1],
        ['Koosta väärtuste tabel ja joonesta graafik.', 2, '', 'Punktid (−1; −4), (0; 0), (1; −2), (2; −4), (3; 0), (4; 16 — väljaspool joonist).', 0],
      ] },
      self: ['Leian määramispiirkonna.', 'Leian nullkohad, X⁺ ja X⁻ intervallmeetodiga.', 'Leian muutumispiirkonna.'],
    },
    {
      title: 'Paaris- ja paaritud funktsioonid. Liitfunktsioon',
      ru: 'Чётные и нечётные функции. Сложная функция',
      course: 'VII',
      exam: 'Funktsiooni uurimise ülesandes (II osa 5) küsitakse paarsust; liitfunktsioon on aluseks liitfunktsiooni tuletisele.',
      can: 'Õpilane kontrollib funktsiooni paarsust, kasutab graafiku sümmeetriat ning koostab ja lahutab liitfunktsiooni.',
      theory: [
        r`Paarisfunktsioon: $f(-x)=f(x)$, graafik on sümmeetriline $y$-telje suhtes — *pähe*`,
        r`Paaritu funktsioon: $f(-x)=-f(x)$, graafik on sümmeetriline nullpunkti suhtes; kui $0\in X$, siis $f(0)=0$ — *pähe*`,
        r`Paarsust saab uurida ainult siis, kui määramispiirkond on sümmeetriline nullpunkti suhtes — *pähe*`,
        r`Liitfunktsioon: $y=f(g(x))$ — kõigepealt sisemine $g$, siis väline $f$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть только чётность sin, cos и tan; остальное учим наизусть.',
        'Подставь −x вместо x: получилось то же — чётная, получилось с минусом — нечётная.',
        'В сложной функции f(g(x)) сначала считаем внутреннюю g.',
      ],
      example: {
        task: r`Uuri funktsioonide $f(x)=x^4-2x^2$ ja $g(x)=x^3-x$ paarsust.`,
        steps: [
          r`$f(-x)=(-x)^4-2(-x)^2=x^4-2x^2=f(x)$ — paarisfunktsioon.`,
          r`$g(-x)=-x^3+x=-(x^3-x)=-g(x)$ — paaritu funktsioon.`,
          r`Joonisel: $f$ on sümmeetriline $y$-telje, $g$ nullpunkti suhtes.`,
        ],
        graph: { fns: 'y = x^4 - 2x^2\ny = x^3 - x', xmin: -2.5, xmax: 2.5, ymin: -2, ymax: 3, step: 0.5, stepY: 1, labelEvery: 2, caption: 'tumesinine: y = x⁴ − 2x² (paaris) · roheline: y = x³ − x (paaritu)' },
      },
      practice: [
        { title: 'Kas funktsioon on paaris, paaritu või kumbki? Kirjuta paaris, paaritu või kumbki.', parts: [
          [r`$y=x^4+3x^2$`, 1, 'paaris', r`$f(-x)=f(x)$`, 1],
          [r`$y=x^5-2x$`, 1, 'paaritu', r`$f(-x)=-x^5+2x=-f(x)$`, 1],
          [r`$y=x^3+1$`, 1, 'kumbki', r`$f(-x)=-x^3+1$ ei võrdu ei $f(x)$ ega $-f(x)$.`, 1],
          [r`$y=|x|+x^2$`, 1, 'paaris', r`$|-x|+(-x)^2=|x|+x^2$`, 1],
        ] },
        { title: r`Funktsioon $f$ on paaritu ja määratud kõikjal, $f(2)=5$.`, parts: [
          [r`Leia $f(-2)$.`, 1, '-5', r`$f(-2)=-f(2)=-5$`, 1],
          [r`Leia $f(0)$.`, 1, '0', r`$f(0)=-f(0)$, seega $f(0)=0$.`, 1],
        ] },
        { title: r`$f(x)=x^2+1$ ja $g(x)=2x-3$.`, parts: [
          [r`Leia $f(g(2))$.`, 1, '2', r`$g(2)=1$, $f(1)=2$`, 1],
          [r`Leia $g(f(2))$.`, 1, '7', r`$f(2)=5$, $g(5)=7$`, 1],
          [r`Kirjuta $f(g(x))$ lihtsustatud kujul.`, 2, '4x^2-12x+10|4x²-12x+10', r`$(2x-3)^2+1=4x^2-12x+10$`, 2],
        ] },
        { title: r`$h(x)=\sqrt{x^2+5}$.`, parts: [
          [r`Kirjuta sisemine funktsioon $g(x)$, kui $h(x)=\sqrt{g(x)}$.`, 1, 'x^2+5|x²+5', r`$g(x)=x^2+5$, väline $f(u)=\sqrt u$.`, 1],
          [r`Leia $h(2)$.`, 1, '3', r`$\sqrt{4+5}=3$`, 1],
          ['Kas h on paaris, paaritu või kumbki?', 1, 'paaris', r`$h(-x)=\sqrt{x^2+5}=h(x)$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on $f(x)=x^3-4x$ ja $g(x)=x^2-4$.`, parts: [
        ['Kas f on paaris, paaritu või kumbki?', 2, 'paaritu', r`$f(-x)=-x^3+4x=-f(x)$`, 1],
        ['Kas g on paaris, paaritu või kumbki?', 1, 'paaris', r`$g(-x)=x^2-4=g(x)$`, 1],
        ['Leia f nullkohad.', 2, '-2; 0; 2', r`$x(x-2)(x+2)=0$`, 1],
        [r`Leia $g(f(1))$.`, 2, '5', r`$f(1)=-3$, $g(-3)=9-4=5$`, 1],
        [r`Leia $f(g(0))$.`, 2, '-48', r`$g(0)=-4$, $f(-4)=-64+16=-48$`, 1],
        [r`Kas $h(x)=f(x)\cdot g(x)$ on paaris, paaritu või kumbki?`, 1, 'paaritu', r`$h(-x)=-f(x)\cdot g(x)=-h(x)$: paaritu korda paaris on paaritu.`, 1],
      ] },
      self: ['Kontrollin paarsust, asendades x → −x.', 'Kasutan graafiku sümmeetriat.', 'Koostan ja lahutan liitfunktsiooni.'],
    },
    {
      title: 'Graafikute teisendused',
      ru: 'Преобразования графиков',
      course: 'VII',
      exam: 'Funktsiooni ülesannetes tuleb põhifunktsiooni graafikust saada nihutatud või peegeldatud graafik ja selle omadused.',
      can: 'Õpilane saab põhifunktsiooni graafikust nihutatud, venitatud ja peegeldatud graafiku ning leiab selle omadused.',
      theory: [
        r`$y=f(x)+n$: nihe $n$ ühikut üles; $\;y=f(x-m)$: nihe $m$ ühikut paremale — *pähe*`,
        r`$y=-f(x)$: peegeldus $x$-telje suhtes; $\;y=f(-x)$: peegeldus $y$-telje suhtes — *pähe*`,
        r`$y=k\,f(x)$: venitus $y$-telje suunas $k$ korda; $\;y=f(kx)$: kokkusurumine $x$-telje suunas $k$ korda — *pähe*`,
        r`$y=|f(x)|$: graafiku osa allpool $x$-telge peegeldatakse üles — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai преобразований графиков нет — учим наизусть.',
        'f(x − 3) — сдвиг ВПРАВО на 3 (знак наоборот), f(x) + 3 — вверх на 3.',
        'Вершина параболы и асимптоты сдвигаются вместе с графиком.',
      ],
      example: {
        task: r`Kuidas saada parabooli $y=x^2$ graafikust funktsiooni $y=-(x-2)^2+3$ graafik? Leia haripunkt.`,
        steps: [
          r`$y=(x-2)^2$: nihe 2 ühikut paremale.`,
          r`$y=-(x-2)^2$: peegeldus $x$-telje suhtes; $\;+3$: nihe 3 ühikut üles.`,
          r`Haripunkt $(0;0)\to(2;3)$, harud alla.`,
        ],
        graph: { fns: 'y = x^2\ny = -(x - 2)^2 + 3', xmin: -3, xmax: 5, ymin: -4, ymax: 5, step: 1, stepY: 1, points: 'H(2; 3)', caption: 'tumesinine: y = x² · roheline: y = −(x − 2)² + 3' },
      },
      practice: [
        { title: r`Graafikut $y=\sqrt x$ nihutatakse 3 ühikut paremale ja 1 ühiku alla.`, parts: [
          ['Kirjuta uue funktsiooni valem.', 2, 'y=√(x-3)-1|√(x-3)-1|y=sqrt(x-3)-1', r`$y=\sqrt{x-3}-1$`, 1],
          ['Leia uue funktsiooni määramispiirkond.', 1, '[3;∞)|x>=3|x≥3', r`$x-3\ge0$`, 1],
        ] },
        { title: r`$f(x)=x^2-4x$.`, parts: [
          [r`Leia $f$ haripunkt.`, 1, '(2;-4)', r`$x_0=2$, $f(2)=-4$`, 1],
          [r`Leia funktsiooni $y=f(x+2)$ haripunkt.`, 1, '(0;-4)', 'Nihe 2 ühikut vasakule: (2; −4) → (0; −4).', 1],
          [r`Leia funktsiooni $y=f(x)+4$ nullkoht.`, 2, '2', r`$x^2-4x+4=(x-2)^2=0$: haripunkt nihkus $x$-teljele.`, 2],
        ] },
        { title: r`$y=\dfrac2{x-1}+3$.`, parts: [
          ['Leia asümptoodid.', 2, 'x=1; y=3', r`Hüperbool $y=\dfrac2x$ nihkus 1 paremale ja 3 üles: $x=1$, $y=3$.`, 2],
          [r`Leia $y$, kui $x=3$.`, 1, '4', r`$\dfrac22+3=4$`, 1],
        ] },
        { title: r`$y=|x^2-4|$.`, parts: [
          ['Leia nullkohad.', 1, '-2; 2', r`$x^2-4=0$`, 1],
          [r`Leia $y$, kui $x=0$.`, 1, '4', r`$|0-4|=4$ — negatiivne osa peegeldus üles.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on $f(x)=x^2$ ja $g(x)=-(x+1)^2+4$.`, grid: { xmin: -4, xmax: 3, ymin: -3, ymax: 5, step: 1, stepY: 1, blank: true }, parts: [
        ['Kirjelda, kuidas saada f graafikust g graafik.', 2, '', 'Nihe 1 ühiku vasakule, peegeldus x-telje suhtes, nihe 4 ühikut üles.', 2],
        ['Leia g haripunkt.', 2, '(-1;4)', 'Haripunkt (0; 0) → (−1; 4).', 1],
        ['Leia g nullkohad.', 2, '-3; 1', r`$(x+1)^2=4$, $x+1=\pm2$: $x=1$ või $x=-3$.`, 2],
        [r`Leia g positiivsuspiirkond $X^+$.`, 2, '(-3;1)|-3<x<1', 'Harud alla: nullkohtade vahel on g(x) > 0.', 1],
        ['Joonesta mõlema funktsiooni graafik.', 2, '', 'f: haripunkt (0; 0), harud üles; g: haripunkt (−1; 4), läbib (−3; 0) ja (1; 0).', 0],
      ] },
      self: ['Nihutan graafikut üles-alla ja vasakule-paremale.', 'Peegeldan graafikut telgede suhtes.', 'Leian teisendatud graafiku haripunkti ja asümptoodid.'],
    },
    {
      title: 'Aritmeetiline jada',
      ru: 'Арифметическая прогрессия',
      course: 'VII',
      exam: 'II osa ülesanne 6 (10 p) on sageli jada tekstülesanne: liikmete arv, summa, „mitmendast liikmest alates”.',
      can: 'Õpilane leiab aritmeetilise jada liikme, vahe ja summa ning lahendab nende abil tekstülesandeid.',
      theory: [
        r`Üldliige: $a_n=a_1+(n-1)d$; jada on kasvav, kui $d>0$, ja kahanev, kui $d<0$ — *pähe*`,
        r`Summa: $S_n=\dfrac{(a_1+a_n)\,n}{2}=\dfrac{(2a_1+(n-1)d)\,n}{2}$ — *pähe*`,
        r`Iga keskmine liige on naabrite aritmeetiline keskmine: $a_n=\dfrac{a_{n-1}+a_{n+1}}{2}$ — *pähe*`,
        r`Kaks tingimust → süsteem $a_1$ ja $d$ jaoks — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai формул прогрессий нет — учим наизусть.',
        'Два данных члена → система для a₁ и d.',
        '«Сколько членов нужно, чтобы сумма превысила …» — квадратное неравенство, n — натуральное.',
      ],
      example: {
        task: r`Aritmeetilises jadas $a_3=11$ ja $a_8=26$. Leia $a_1$, $d$ ja $S_{20}$.`,
        steps: [
          r`$a_8-a_3=5d=15$, $d=3$; $\;a_1=a_3-2d=5$.`,
          r`$a_{20}=5+19\cdot3=62$.`,
          r`$S_{20}=\dfrac{(5+62)\cdot20}{2}=670$.`,
        ],
        graph: { fns: '', xmin: 0, xmax: 6, ymin: 0, ymax: 20, step: 1, stepY: 2, labelEvery: 2, points: 'A(1; 5)\nB(2; 8)\nC(3; 11)\nD(4; 14)\nE(5; 17)', caption: 'aritmeetilise jada liikmed (n; aₙ) asuvad ühel sirgel' },
      },
      practice: [
        { title: 'Jada 7; 11; 15; …', parts: [
          [r`Leia $d$.`, 1, '4', r`$11-7=4$`, 1],
          [r`Leia $a_{25}$.`, 1, '103', r`$7+24\cdot4=103$`, 1],
          [r`Leia $S_{25}$.`, 1, '1375', r`$\dfrac{(7+103)\cdot25}{2}=1375$`, 1],
        ] },
        { title: r`Aritmeetilises jadas $a_1=-20$ ja $d=3$.`, parts: [
          ['Mitmes liige on esimene positiivne liige?', 2, '8', r`$-20+3(n-1)>0$, $n-1>6\tfrac23$, $n=8$; $a_8=1$.`, 2],
          ['Leia jada vähim osasumma.', 2, '-77', r`Liikmed $a_1,\dots,a_7$ on negatiivsed: $S_7=\dfrac{(-20-2)\cdot7}{2}=-77$.`, 2],
        ] },
        { title: 'Kolmekohalised arvud, mis jaguvad 7-ga.', parts: [
          ['Mitu sellist arvu on?', 2, '128', r`$105,112,\dots,994$: $\dfrac{994-105}{7}+1=128$`, 2],
          ['Leia nende summa.', 1, '70336', r`$\dfrac{(105+994)\cdot128}{2}=70\,336$`, 1],
        ] },
        { title: 'Saali esimeses reas on 20 kohta, iga järgmises 2 kohta rohkem. Ridu on 15.', parts: [
          ['Mitu kohta on viimases reas?', 1, '48', r`$20+14\cdot2=48$`, 1],
          ['Mitu kohta on saalis kokku?', 1, '510', r`$\dfrac{(20+48)\cdot15}{2}=510$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Aritmeetilises jadas $a_2+a_5=23$ ja $a_7-a_3=12$.`, parts: [
        [r`Leia vahe $d$.`, 2, '3', r`$a_7-a_3=4d=12$, $d=3$`, 1],
        [r`Leia $a_1$.`, 2, '4', r`$a_2+a_5=2a_1+5d=23$, $2a_1=8$, $a_1=4$`, 2],
        [r`Leia $a_{10}$.`, 1, '31', r`$4+9\cdot3=31$`, 1],
        [r`Leia $S_{10}$.`, 2, '175', r`$\dfrac{(4+31)\cdot10}{2}=175$`, 1],
        ['Mitu esimest liiget tuleb liita, et summa oleks suurem kui 500?', 3, '18', r`$\dfrac{(8+3(n-1))n}{2}>500$, $3n^2+5n-1000>0$, $n>17{,}4$. Kontroll: $S_{17}=476$, $S_{18}=531$. Vastus: 18 liiget.`, 3],
      ] },
      self: ['Kasutan üldliikme ja summa valemit.', 'Koostan süsteemi a₁ ja d leidmiseks.', 'Lahendan „mitu liiget” ülesande võrratusega.'],
    },
    {
      title: 'Geomeetriline jada ja hääbuv geomeetriline jada',
      ru: 'Геометрическая и бесконечно убывающая прогрессия',
      course: 'VII',
      exam: 'II osa ülesanne 6: geomeetriline jada ja hääbuva jada summa (ka perioodiline murd, põrkav pall, kujundite jada).',
      can: 'Õpilane leiab geomeetrilise jada liikme, teguri ja summa ning hääbuva geomeetrilise jada summa.',
      theory: [
        r`Üldliige: $b_n=b_1q^{\,n-1}$; $\;b_n^2=b_{n-1}\,b_{n+1}$ — *pähe*`,
        r`Summa: $S_n=\dfrac{b_1(q^n-1)}{q-1}$, $\;q\ne1$ — *pähe*`,
        r`Hääbuv jada $|q|<1$: $\;S=\dfrac{b_1}{1-q}$ — *pähe*`,
        r`Perioodiline murd on hääbuva jada summa: $0{,}(3)=0{,}3+0{,}03+\dots$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai формул прогрессий нет — учим наизусть.',
        'Бесконечная сумма существует только при |q| < 1.',
        'Мяч: путь вниз + путь вверх, поэтому после первого падения сумму удваиваем.',
      ],
      example: {
        task: r`Leia hääbuva geomeetrilise jada $16;\,8;\,4;\,\dots$ summa.`,
        steps: [
          r`$b_1=16$, $q=\dfrac12$.`,
          r`$S=\dfrac{16}{1-\frac12}=32$.`,
          r`Osasummad $16;\,24;\,28;\,30;\,31;\dots$ lähenevad arvule 32.`,
        ],
        graph: { fns: 'y = 32', xmin: 0, xmax: 6, ymin: 0, ymax: 36, step: 1, stepY: 4, labelEvery: 2, points: 'A(1; 16)\nB(2; 24)\nC(3; 28)\nD(4; 30)\nE(5; 31)', caption: 'osasummad Sₙ lähenevad summale S = 32' },
      },
      practice: [
        { title: 'Geomeetriline jada 2; 6; 18; …', parts: [
          [r`Leia $q$.`, 1, '3', r`$\dfrac62=3$`, 1],
          [r`Leia $b_6$.`, 1, '486', r`$2\cdot3^5=486$`, 1],
          [r`Leia $S_6$.`, 1, '728', r`$\dfrac{2(3^6-1)}{3-1}=728$`, 1],
        ] },
        { title: r`Geomeetrilises jadas $b_2=12$ ja $b_5=96$.`, parts: [
          [r`Leia $q$ ja $b_1$.`, 2, '2; 6', r`$q^3=\dfrac{96}{12}=8$, $q=2$, $b_1=6$`, 2],
          [r`Leia $S_7$.`, 1, '762', r`$6(2^7-1)=762$`, 1],
        ] },
        { title: 'Hääbuv jada.', parts: [
          [r`Leia jada $27;\,9;\,3;\,\dots$ summa.`, 1, '40,5|81/2', r`$\dfrac{27}{1-\frac13}=40{,}5$`, 1],
          [r`Kirjuta $0{,}(45)$ hariliku murruna.`, 2, '5/11', r`$\dfrac{0{,}45}{1-0{,}01}=\dfrac{45}{99}=\dfrac{5}{11}$`, 2],
        ] },
        { title: 'Pall kukub 10 m kõrguselt ja põrkab iga kord tagasi 3/5 eelmisest kõrgusest.', parts: [
          ['Kui kõrgele tõuseb pall pärast 3. põrget?', 1, '2,16', r`$10\cdot0{,}6^3=2{,}16$ m`, 1],
          ['Leia palli kogu teekond, kuni see jääb seisma.', 2, '40', r`$10+2\cdot\dfrac{6}{1-0{,}6}=10+30=40$ m`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Hääbuva geomeetrilise jada summa on 24 ja kahe esimese liikme summa on 18.`, parts: [
        [r`Koosta võrrandisüsteem $b_1$ ja $q$ leidmiseks.`, 2, '', r`$\dfrac{b_1}{1-q}=24$ ja $b_1(1+q)=18$.`, 2],
        [r`Leia $q$.`, 3, '0,5; -0,5|1/2; -1/2', r`$b_1=24(1-q)$: $24(1-q)(1+q)=18$, $1-q^2=\dfrac34$, $q=\pm\dfrac12$.`, 3],
        [r`Leia vastavad $b_1$.`, 3, '12; 36', r`$q=\dfrac12$: $b_1=12$; $\;q=-\dfrac12$: $b_1=36$.`, 2],
        [r`Leia positiivsete liikmetega jada $b_4$.`, 2, '1,5|3/2', r`$12\cdot\left(\dfrac12\right)^3=1{,}5$`, 1],
      ] },
      self: ['Leian geomeetrilise jada liikme ja summa.', 'Kasutan hääbuva jada summa valemit.', 'Kirjutan perioodilise murru hariliku murruna.'],
    },
    {
      title: 'Jada piirväärtus. Arvud π ja e',
      ru: 'Предел последовательности. Числа π и e',
      course: 'VII',
      exam: 'Jada piirväärtus on funktsiooni piirväärtuse ja tuletise alus; e ilmub eksponentmudelites ja tuletistes.',
      can: 'Õpilane leiab jada piirväärtuse, kasutab piirväärtuse omadusi ja teab arvude π ja e tähendust.',
      theory: [
        r`$\lim a_n=a$: alates mingist liikmest on $|a_n-a|$ väiksem kui iga ette antud positiivne arv — *pähe*`,
        r`$\lim\dfrac1n=0$; $\;\lim q^n=0$, kui $|q|<1$; summa, korrutise ja jagatise piirväärtus on piirväärtuste summa, korrutis ja jagatis — *pähe*`,
        r`Murru piirväärtus: jaga lugeja ja nimetaja $n$ kõrgeima astmega — *pähe*`,
        r`$e=\lim\left(1+\dfrac1n\right)^n\approx2{,}71828$; $\;\pi$ — ringjoone pikkuse ja läbimõõdu suhe $\approx3{,}14159$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai пределов нет — правила учим наизусть.',
        'Дробь: делим числитель и знаменатель на старшую степень n; 1/n, 1/n² → 0.',
        'Разность корней: умножаем на сопряжённое выражение.',
      ],
      example: {
        task: r`Leia $\lim\limits_{n\to\infty}\dfrac{2n+1}{n}$ ja kirjelda, kuidas jada liikmed piirväärtusele lähenevad.`,
        steps: [
          r`$\dfrac{2n+1}{n}=2+\dfrac1n$.`,
          r`$\dfrac1n\to0$, seega $\lim=2$.`,
          r`$a_1=3$, $a_2=2{,}5$, $a_4=2{,}25$, $a_8=2{,}125$ — liikmed lähenevad arvule 2 ülaltpoolt.`,
        ],
        graph: { fns: 'y = 2', xmin: 0, xmax: 9, ymin: 0, ymax: 3.5, step: 1, stepY: 0.5, points: 'A(1; 3)\nB(2; 2.5)\nC(3; 2.33)\nD(4; 2.25)\nE(6; 2.17)\nF(8; 2.13)', caption: 'aₙ = (2n + 1)/n läheneb arvule 2' },
      },
      practice: [
        { title: 'Leia piirväärtus.', parts: [
          [r`$\lim\dfrac{5n-1}{2n+3}$`, 1, '2,5|5/2', r`Jagame $n$-ga: $\dfrac{5-\frac1n}{2+\frac3n}\to\dfrac52$`, 1],
          [r`$\lim\dfrac{n+4}{n^2+1}$`, 1, '0', r`Jagame $n^2$-ga: $\dfrac{\frac1n+\frac4{n^2}}{1+\frac1{n^2}}\to0$`, 1],
          [r`$\lim\dfrac{2n^2-n}{1-4n^2}$`, 1, '-0,5|-1/2', r`$\dfrac{2}{-4}=-0{,}5$`, 1],
        ] },
        { title: r`$a_n=\dfrac{n+1}{n}$.`, parts: [
          [r`Leia $a_{10}$.`, 1, '1,1', r`$\dfrac{11}{10}$`, 1],
          [r`Alates mitmendast liikmest on $|a_n-1|<0{,}01$?`, 2, '101', r`$|a_n-1|=\dfrac1n<0{,}01$, $n>100$: alates 101. liikmest.`, 2],
        ] },
        { title: 'Leia piirväärtus.', parts: [
          [r`$\lim\left(\dfrac12\right)^n$`, 1, '0', r`$|q|<1$`, 1],
          [r`$\lim\dfrac{3^n+1}{3^n}$`, 1, '1', r`$1+\left(\dfrac13\right)^n\to1$`, 1],
          [r`$\lim\left(\sqrt{n^2+n}-n\right)$`, 2, '0,5|1/2', r`$\dfrac{n}{\sqrt{n^2+n}+n}=\dfrac{1}{\sqrt{1+\frac1n}+1}\to\dfrac12$`, 2],
        ] },
        { title: r`Arv $e$.`, parts: [
          [r`Arvuta $\left(1+\dfrac1{10}\right)^{10}$ kahe kümnendkohani.`, 1, '2,59', r`$1{,}1^{10}\approx2{,}59$`, 1],
          [r`Arvuta $\left(1+\dfrac1{1000}\right)^{1000}$ kahe kümnendkohani.`, 1, '2,72', r`$\approx2{,}717$ — lähedal arvule $e$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on jada $a_n=\dfrac{4n-3}{n+2}$.`, parts: [
        [r`Leia $a_1$ ja $a_{10}$.`, 2, '1/3; 37/12|0,33; 3,08', r`$a_1=\dfrac13$; $a_{10}=\dfrac{37}{12}\approx3{,}08$`, 1],
        [r`Leia $\lim a_n$.`, 2, '4', r`Jagame $n$-ga: $\dfrac{4-\frac3n}{1+\frac2n}\to4$`, 1],
        [r`Alates mitmendast liikmest on $|a_n-4|<0{,}1$?`, 3, '109', r`$a_n-4=\dfrac{-11}{n+2}$: $\dfrac{11}{n+2}<0{,}1$, $n+2>110$, $n>108$: alates 109. liikmest.`, 3],
        ['Kas jada on kasvav või kahanev?', 3, 'kasvav', r`$a_n=4-\dfrac{11}{n+2}$: $n$ kasvades $\dfrac{11}{n+2}$ kahaneb, seega $a_n$ kasvab.`, 2],
      ] },
      self: ['Leian murru piirväärtuse.', 'Leian, alates mitmendast liikmest on jada piirväärtusele lähedal.', 'Tean, mis on arvud π ja e.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: VII kursus',
      ru: 'Повторение и контрольная работа: VII курс',
      course: 'VII',
      exam: 'VII kursuse teemad annavad laia riigieksami II osa ülesande 6 (jadad, 10 p) ja osa ülesandest 5.',
      can: 'Õpilane lahendab VII kursuse ülesandeid iseseisvalt: funktsiooni omadused, graafikute teisendused, jadad ja piirväärtus.',
      theory: [
        r`Määramispiirkond, nullkohad, $X^+$, $X^-$; paaris $f(-x)=f(x)$, paaritu $f(-x)=-f(x)$ — *pähe*`,
        r`$y=f(x-m)+n$ — nihe $m$ paremale ja $n$ üles; $y=-f(x)$ — peegeldus $x$-telje suhtes — *pähe*`,
        r`$a_n=a_1+(n-1)d$, $S_n=\dfrac{(a_1+a_n)n}{2}$; $\;b_n=b_1q^{n-1}$, $S_n=\dfrac{b_1(q^n-1)}{q-1}$, $S=\dfrac{b_1}{1-q}$ — *pähe*`,
        r`$\lim\dfrac1n=0$; murru piirväärtus — jaga kõrgeima astmega — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai формул VII курса нет — повторяем всё наизусть.',
        'Проверь знак при сдвиге: f(x + 2) — влево.',
        'Для бесконечной суммы обязательно |q| < 1.',
      ],
      example: {
        task: r`Leia aritmeetilise jada $a_1$ ja $d$, kui $a_4=10$ ja $a_9=25$.`,
        steps: [
          r`$5d=15$, $d=3$.`,
          r`$a_1=10-3\cdot3=1$.`,
        ],
      },
      practice: [
        { title: 'Funktsioon.', parts: [
          [r`Leia funktsiooni $y=\sqrt{x+5}$ määramispiirkond.`, 1, '[-5;∞)|x>=-5|x≥-5', r`$x+5\ge0$`, 1],
          [r`Kas $y=x^3-x$ on paaris, paaritu või kumbki?`, 1, 'paaritu', r`$f(-x)=-f(x)$`, 1],
        ] },
        { title: 'Teisendused.', parts: [
          [r`Leia $y=(x+2)^2-1$ haripunkt.`, 1, '(-2;-1)', 'Nihe 2 vasakule ja 1 alla.', 1],
          [r`Leia $y=\dfrac1{x-4}$ vertikaalne asümptoot.`, 1, 'x=4|4', 'Nimetaja on 0, kui x = 4.', 1],
        ] },
        { title: 'Jadad.', parts: [
          [r`$a_1=3$, $d=2$. Leia $S_{10}$.`, 1, '120', r`$\dfrac{(6+18)\cdot10}{2}=120$`, 1],
          [r`$b_1=1$, $q=-2$. Leia $b_5$.`, 1, '16', r`$(-2)^4=16$`, 1],
        ] },
        { title: 'Piirväärtus.', parts: [
          [r`$\lim\dfrac{3n+1}{n}$`, 1, '3', r`$3+\dfrac1n\to3$`, 1],
          [r`Leia hääbuva jada $9;\,3;\,1;\dots$ summa.`, 1, '13,5|27/2', r`$\dfrac{9}{1-\frac13}=13{,}5$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'VII kursus: funktsioonid ja arvjadad. Aega 45 minutit.', parts: [
        [r`1. Leia funktsiooni $y=\sqrt{8-2x}$ määramispiirkond.`, 2, '(-∞;4]|x<=4|x≤4', r`$8-2x\ge0$, $x\le4$`, 1],
        [r`2. Kas $f(x)=x^4-x^2$ on paaris, paaritu või kumbki?`, 1, 'paaris', r`$f(-x)=f(x)$`, 1],
        [r`3. $f(x)=2x+1$, $g(x)=x^2$. Leia $f(g(3))$.`, 2, '19', r`$g(3)=9$, $f(9)=19$`, 1],
        [r`4. Leia funktsiooni $y=(x-3)^2-4$ nullkohad.`, 2, '1; 5', r`$(x-3)^2=4$, $x-3=\pm2$`, 1],
        ['5. Leia selle parabooli haripunkt.', 1, '(3;-4)', 'Nihe 3 paremale ja 4 alla.', 1],
        [r`6. Aritmeetilises jadas $a_1=4$ ja $d=5$. Leia $a_{12}$.`, 2, '59', r`$4+11\cdot5=59$`, 1],
        [r`7. Leia selle jada $S_{12}$.`, 2, '378', r`$\dfrac{(4+59)\cdot12}{2}=378$`, 1],
        [r`8. Geomeetrilises jadas $b_1=5$ ja $q=2$. Leia $b_6$.`, 2, '160', r`$5\cdot2^5=160$`, 1],
        [r`9. Leia selle jada $S_6$.`, 2, '315', r`$5(2^6-1)=315$`, 1],
        [r`10. Leia hääbuva jada $20;\,10;\,5;\,\dots$ summa.`, 2, '40', r`$\dfrac{20}{1-\frac12}=40$`, 1],
        [r`11. Leia $\lim\dfrac{6n^2+1}{3n^2-n}$.`, 2, '2', r`$\dfrac63=2$`, 1],
        [r`12. Leia $\lim\dfrac{2n+5}{n^2}$.`, 1, '0', r`Nimetaja aste on suurem: piirväärtus 0.`, 1],
        [r`13. $a_n=\dfrac{n-1}{n+1}$. Leia $a_5$.`, 2, '2/3|0,67', r`$\dfrac46=\dfrac23$`, 1],
        [r`14. Leia funktsiooni $y=\dfrac2{x+1}-3$ asümptoodid.`, 2, 'x=-1; y=-3', r`Nihe 1 vasakule ja 3 alla: $x=-1$, $y=-3$.`, 1],
      ] },
      self: ['Oskan VII kursuse kõiki ülesandetüüpe.', 'Teisendan graafikuid.', 'Lahendan jadade ülesandeid ja leian piirväärtusi.'],
    },
    // ───────────── VIII kursus „Eksponent- ja logaritmfunktsioon” ─────────────
    {
      title: 'Liitprotsendiline kasvamine ja kahanemine',
      ru: 'Сложные проценты: рост и убывание',
      course: 'VIII',
      exam: 'II osa ülesanne 11 (10 p): mudel kujul A·qᵗ — hoius, rahvaarv, väärtuse langus, „mitme aasta pärast”.',
      can: 'Õpilane koostab liitprotsendilise kasvamise ja kahanemise mudeli, arvutab lõppväärtuse ja leiab aja või protsendi.',
      theory: [
        r`Kasvamine $p\%$ perioodis: $K_n=K_0\left(1+\dfrac{p}{100}\right)^n$ — *pähe*`,
        r`Kahanemine $p\%$ perioodis: $K_n=K_0\left(1-\dfrac{p}{100}\right)^n$ — *pähe*`,
        r`Kasvukordaja $q=\dfrac{K_{n+1}}{K_n}$; protsent $p=(q-1)\cdot100$ — *pähe*`,
        r`Aeg: $q^n=\dfrac{K_n}{K_0}\Rightarrow n=\dfrac{\ln(K_n/K_0)}{\ln q}$; protsent: $q=\sqrt[n]{K_n/K_0}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai сложных процентов и логарифмов нет — учим наизусть.',
        'Рост на 4 % — умножаем на 1,04; падение на 12 % — на 0,88.',
        'Время находим логарифмом и округляем ВВЕРХ до целого периода.',
      ],
      example: {
        task: 'Hoiusele pannakse 5000 € liitintressiga 3,5% aastas. Kui suur on summa 6 aasta pärast?',
        steps: [
          r`$q=1{,}035$, $n=6$.`,
          r`$K_6=5000\cdot1{,}035^6\approx6146{,}28$ €.`,
          r`Intressi kogunes $\approx1146{,}28$ €.`,
        ],
        graph: { fns: 'y = 5000*1.035^x', xmin: 0, xmax: 20, ymin: 4000, ymax: 10000, step: 2, stepY: 1000, labelEvery: 2, points: 'P(6; 6146.28)', caption: 'K(t) = 5000 · 1,035ᵗ (x — aastad, y — eurod)' },
      },
      practice: [
        { title: 'Hoius 2000 € kasvab 4% aastas (liitintress).', parts: [
          ['Leia summa 5 aasta pärast.', 1, '2433,31', r`$2000\cdot1{,}04^5\approx2433{,}31$ €`, 1],
          ['Leia summa 10 aasta pärast.', 1, '2960,49', r`$2000\cdot1{,}04^{10}\approx2960{,}49$ €`, 1],
        ] },
        { title: 'Auto maksab 18 000 € ja kaotab igal aastal 12% väärtusest.', parts: [
          ['Leia auto väärtus 3 aasta pärast.', 1, '12266,5|12266,50', r`$18\,000\cdot0{,}88^3=12\,266{,}50$ €`, 1],
          ['Mitu protsenti väärtusest kaob kolme aastaga?', 2, '31,85', r`$1-0{,}88^3=0{,}318528$: $\approx31{,}85\%$`, 2],
        ] },
        { title: 'Linnas elab 40 000 inimest, rahvaarv kasvab 2% aastas.', parts: [
          ['Mitu elanikku on 5 aasta pärast?', 1, '44163', r`$40\,000\cdot1{,}02^5\approx44\,163$`, 1],
          ['Mitme aasta pärast ületab rahvaarv 50 000?', 2, '12', r`$1{,}02^n>1{,}25$, $n>\dfrac{\ln1{,}25}{\ln1{,}02}\approx11{,}3$: 12 aasta pärast.`, 2],
        ] },
        { title: 'Bakterite arv kahekordistub iga 3 tunniga. Alguses on 500 bakterit.', parts: [
          ['Mitu bakterit on 24 tunni pärast?', 1, '128000', r`$24:3=8$ kahekordistumist: $500\cdot2^8=128\,000$`, 1],
          ['Mitu protsenti kasvab bakterite arv ühes tunnis?', 2, '26|25,99', r`$q=2^{1/3}\approx1{,}2599$: $\approx26\%$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Hoiusele pannakse 8000 € liitintressiga 2,5% aastas.', parts: [
        ['Leia hoiuse suurus 4 aasta pärast.', 2, '8830,5|8830,50', r`$8000\cdot1{,}025^4\approx8830{,}50$ €`, 1],
        ['Kui palju intressi koguneb 4 aastaga?', 1, '830,5|830,50', r`$8830{,}50-8000=830{,}50$ €`, 1],
        ['Mitme aasta pärast ületab hoius 10 000 €?', 3, '10', r`$1{,}025^n>1{,}25$, $n>\dfrac{\ln1{,}25}{\ln1{,}025}\approx9{,}04$: 10 aasta pärast.`, 3],
        ['Milline aastaintress annaks 4 aastaga 9000 €? Vasta protsentides kahe kümnendkohani.', 4, '2,99', r`$q^4=\dfrac{9000}{8000}=1{,}125$, $q=\sqrt[4]{1{,}125}\approx1{,}0299$: $\approx2{,}99\%$`, 4],
      ] },
      self: ['Koostan liitprotsendilise mudeli.', 'Leian aja logaritmi abil.', 'Leian kasvuprotsendi juure abil.'],
    },
    {
      title: 'Eksponentfunktsioon',
      ru: 'Показательная функция',
      course: 'VIII',
      exam: 'Eksponentfunktsiooni graafik, asümptoot ja muutumispiirkond on II osa mudeliülesannete ja funktsiooni uurimise osa.',
      can: 'Õpilane kirjeldab eksponentfunktsiooni omadusi, joonestab ja teisendab selle graafikut ning leiab alust punkti järgi.',
      theory: [
        r`$y=a^x$, $a>0$, $a\ne1$: $X=\mathbb R$, $Y=(0;\infty)$, graafik läbib punkti $(0;1)$ — *pähe*`,
        r`$a>1$ — kasvav; $0<a<1$ — kahanev; asümptoot $y=0$ — *pähe*`,
        r`$y=e^x$, $e\approx2{,}718$ — naturaalne eksponentfunktsioon — *pähe*`,
        r`Astme reeglid: $a^xa^y=a^{x+y}$, $\dfrac{a^x}{a^y}=a^{x-y}$, $(a^x)^y=a^{xy}$, $a^{-x}=\dfrac1{a^x}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть только производная (aˣ)′ и (eˣ)′; свойства функции учим наизусть.',
        'aˣ всегда больше 0: график не пересекает ось x.',
        'График y = aˣ + c имеет асимптоту y = c.',
      ],
      example: {
        task: r`Võrdle funktsioone $y=2^x$ ja $y=\left(\dfrac12\right)^x$.`,
        steps: [
          r`Mõlemad läbivad punkti $(0;1)$, $Y=(0;\infty)$, asümptoot $y=0$.`,
          r`$2^x$ kasvab, $\left(\dfrac12\right)^x=2^{-x}$ kahaneb.`,
          r`Graafikud on sümmeetrilised $y$-telje suhtes.`,
        ],
        graph: { fns: 'y = 2^x\ny = 0.5^x', xmin: -3, xmax: 3, ymin: -1, ymax: 8, step: 1, stepY: 1, points: 'P(0; 1)', caption: 'tumesinine: y = 2ˣ · roheline: y = (1/2)ˣ' },
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$2^{-3}$`, 1, '0,125|1/8', r`$\dfrac18$`, 1],
          [r`$27^{\frac23}$`, 1, '9', r`$\left(\sqrt[3]{27}\right)^2=9$`, 1],
          [r`$e^{1{,}5}$ kahe kümnendkohani`, 1, '4,48', r`$\approx4{,}48$`, 1],
          [r`$\left(\dfrac13\right)^{-2}$`, 1, '9', r`$3^2=9$`, 1],
        ] },
        { title: r`$f(x)=3^x-9$.`, parts: [
          ['Leia nullkoht.', 1, '2', r`$3^x=9$, $x=2$`, 1],
          ['Leia muutumispiirkond.', 1, '(-9;∞)|y>-9', r`$3^x>0$, seega $y>-9$.`, 1],
          [r`Leia $f(0)$.`, 1, '-8', r`$1-9=-8$`, 1],
        ] },
        { title: 'Kas funktsioon on kasvav või kahanev?', parts: [
          [r`$y=0{,}7^x$`, 1, 'kahanev', r`$0<0{,}7<1$`, 1],
          [r`$y=\left(\dfrac54\right)^x$`, 1, 'kasvav', r`$\dfrac54>1$`, 1],
          [r`$y=e^{-x}$`, 1, 'kahanev', r`$e^{-x}=\left(\dfrac1e\right)^x$, $\dfrac1e<1$`, 1],
        ] },
        { title: r`Funktsiooni $y=a^x$ graafik läbib antud punkti. Leia $a$.`, parts: [
          [r`$(3;8)$`, 1, '2', r`$a^3=8$`, 1],
          [r`$(-2;9)$`, 1, '1/3|0,33', r`$a^{-2}=9$, $a^2=\dfrac19$, $a=\dfrac13$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=2^{x-1}-2$.`, grid: { xmin: -3, xmax: 5, ymin: -3, ymax: 7, step: 1, stepY: 1, blank: true }, parts: [
        [r`Leia $f(0)$.`, 1, '-1,5|-3/2', r`$2^{-1}-2=-1{,}5$`, 1],
        ['Leia nullkoht.', 2, '2', r`$2^{x-1}=2$, $x-1=1$, $x=2$`, 1],
        ['Leia horisontaalne asümptoot.', 2, 'y=-2|-2', r`$2^{x-1}\to0$, kui $x\to-\infty$: $y=-2$.`, 1],
        ['Leia muutumispiirkond.', 2, '(-2;∞)|y>-2', r`$2^{x-1}>0$`, 1],
        ['Joonesta graafik.', 3, '', 'y = 2ˣ nihutatud 1 paremale ja 2 alla: läbib (0; −1,5), (2; 0), (3; 2), (4; 6); asümptoot y = −2.', 0],
      ] },
      self: ['Tean eksponentfunktsiooni omadusi.', 'Leian asümptoodi ja muutumispiirkonna.', 'Joonestan nihutatud graafiku.'],
    },
    {
      title: 'Logaritm ja selle omadused',
      ru: 'Логарифм и его свойства',
      course: 'VIII',
      exam: 'Logaritmi omadused on vajalikud logaritmvõrrandites ja mudeliülesannetes (II osa 11).',
      can: 'Õpilane arvutab logaritme, kasutab logaritmi omadusi ja aluse vahetamise valemit.',
      theory: [
        r`$\log_ab=c\;\Leftrightarrow\;a^c=b$ ($a>0$, $a\ne1$, $b>0$); $\;\lg b=\log_{10}b$, $\;\ln b=\log_eb$ — *pähe*`,
        r`$\log_a(xy)=\log_ax+\log_ay$, $\;\log_a\dfrac xy=\log_ax-\log_ay$, $\;\log_ax^k=k\log_ax$ — *pähe*`,
        r`Aluse vahetamine: $\log_ab=\dfrac{\log_cb}{\log_ca}=\dfrac{\ln b}{\ln a}$ — *pähe*`,
        r`$a^{\log_ab}=b$, $\;\log_a1=0$, $\;\log_aa=1$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai свойств логарифма нет — учим наизусть.',
        'Логарифм — это показатель степени: log₂ 32 = 5, потому что 2⁵ = 32.',
        'На калькуляторе log₇ 50 = ln 50 / ln 7.',
      ],
      example: {
        task: r`Arvuta $\log_248-\log_23$ ja $\log_320$ (kahe kümnendkohani).`,
        steps: [
          r`$\log_248-\log_23=\log_2\dfrac{48}{3}=\log_216=4$.`,
          r`$\log_320=\dfrac{\ln20}{\ln3}\approx\dfrac{2{,}996}{1{,}099}\approx2{,}73$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$\log_232$`, 1, '5', r`$2^5=32$`, 1],
          [r`$\log_3\dfrac19$`, 1, '-2', r`$3^{-2}=\dfrac19$`, 1],
          [r`$\lg0{,}001$`, 1, '-3', r`$10^{-3}$`, 1],
          [r`$\ln e^4$`, 1, '4', r`$\log_ee^4=4$`, 1],
        ] },
        { title: 'Arvuta omaduste abil.', parts: [
          [r`$\log_64+\log_69$`, 1, '2', r`$\log_636=2$`, 1],
          [r`$2\log_510-\log_54$`, 1, '2', r`$\log_5\dfrac{100}{4}=\log_525=2$`, 1],
          [r`$\log_25\cdot\log_58$`, 2, '3', r`$\dfrac{\ln5}{\ln2}\cdot\dfrac{\ln8}{\ln5}=\log_28=3$`, 2],
        ] },
        { title: 'Arvuta kahe kümnendkohani.', parts: [
          [r`$\log_750$`, 1, '2,01', r`$\dfrac{\ln50}{\ln7}\approx2{,}01$`, 1],
          [r`$\log_{0{,}5}10$`, 1, '-3,32', r`$\dfrac{\ln10}{\ln0{,}5}\approx-3{,}32$`, 1],
        ] },
        { title: r`On teada, et $\log_23=a$. Avalda $a$ kaudu.`, parts: [
          [r`$\log_212$`, 1, '2+a|a+2', r`$\log_2(4\cdot3)=2+a$`, 1],
          [r`$\log_2\dfrac94$`, 2, '2a-2', r`$\log_29-\log_24=2a-2$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: 'Arvuta avaldiste väärtused ilma kalkulaatorita.', parts: [
        [r`$A=\log_354-\log_32+2^{\log_25}$`, 3, '8', r`$\log_3\dfrac{54}{2}=\log_327=3$; $2^{\log_25}=5$; $A=3+5=8$`, 3],
        [r`$B=\lg25+\lg4$`, 2, '2', r`$\lg100=2$`, 2],
      ] },
      self: ['Arvutan logaritmi definitsiooni järgi.', 'Kasutan logaritmi omadusi.', 'Vahetan logaritmi alust.'],
    },
    {
      title: 'Logaritmfunktsioon ja pöördfunktsioon',
      ru: 'Логарифмическая функция и обратная функция',
      course: 'VIII',
      exam: 'Pöördfunktsioon ja logaritmfunktsiooni määramispiirkond on funktsiooni uurimise ja logaritmvõrrandite alus.',
      can: 'Õpilane leiab pöördfunktsiooni, kirjeldab logaritmfunktsiooni omadusi ja leiab logaritmfunktsiooni määramispiirkonna.',
      theory: [
        r`Pöördfunktsioon: avalda $y=f(x)$-st $x$ ja vaheta $x$ ning $y$; graafikud on sümmeetrilised sirge $y=x$ suhtes — *pähe*`,
        r`Pöördfunktsioon on olemas, kui $f$ on rangelt monotoonne (iga $y$ vastab ühele $x$-ile) — *pähe*`,
        r`$y=\log_ax$ on funktsiooni $y=a^x$ pöördfunktsioon: $X=(0;\infty)$, $Y=\mathbb R$, läbib $(1;0)$ — *pähe*`,
        r`$a>1$ — kasvav; $0<a<1$ — kahanev; asümptoot $x=0$; määramispiirkond: logaritmitav $>0$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть только производная (logₐx)′ и (ln x)′; свойства функции учим наизусть.',
        'Обратная функция: выражаем x через y и меняем буквы местами.',
        'Под логарифмом всегда строго больше нуля.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=2x+4$ pöördfunktsioon ja võrdle graafikuid $y=2^x$ ning $y=\log_2x$.`,
        steps: [
          r`$y=2x+4\Rightarrow x=\dfrac{y-4}{2}$; vahetame tähed: $f^{-1}(x)=\dfrac{x-4}{2}$.`,
          r`$y=\log_2x$ on $y=2^x$ pöördfunktsioon: punkt $(1;2)$ läheb punktiks $(2;1)$.`,
          r`Graafikud on sümmeetrilised sirge $y=x$ suhtes.`,
        ],
        graph: { fns: 'y = 2^x\ny = ln(x)/ln(2)\ny = x', xmin: -3, xmax: 5, ymin: -3, ymax: 5, step: 1, stepY: 1, points: 'A(1; 2)\nB(2; 1)', caption: 'tumesinine: y = 2ˣ · roheline: y = log₂ x · kolmas: y = x' },
      },
      practice: [
        { title: 'Leia pöördfunktsioon.', parts: [
          [r`$y=3x-6$`, 1, 'y=(x+6)/3|(x+6)/3|y=x/3+2|x/3+2', r`$x=\dfrac{y+6}{3}$; $y=\dfrac{x+6}{3}$`, 1],
          [r`$y=x^3+1$`, 1, 'y=∛(x-1)|∛(x-1)|(x-1)^(1/3)', r`$x=\sqrt[3]{y-1}$; $y=\sqrt[3]{x-1}$`, 1],
          [r`$y=10^{x-2}$`, 2, 'y=2+lg x|2+lg x|lg x+2', r`$x-2=\lg y$; $y=2+\lg x$`, 2],
        ] },
        { title: 'Leia määramispiirkond.', parts: [
          [r`$y=\log_2(x-3)$`, 1, '(3;∞)|x>3', r`$x-3>0$`, 1],
          [r`$y=\ln(4-x^2)$`, 1, '(-2;2)|-2<x<2', r`$x^2<4$`, 1],
          [r`$y=\lg(x^2-5x)$`, 2, '(-∞;0)∪(5;∞)|x<0 või x>5', r`$x(x-5)>0$: $x<0$ või $x>5$.`, 2],
        ] },
        { title: r`$f(x)=\log_3(x+1)$.`, parts: [
          [r`Leia $f(8)$.`, 1, '2', r`$\log_39=2$`, 1],
          ['Leia nullkoht.', 1, '0', r`$x+1=1$`, 1],
          ['Leia pöördfunktsioon.', 1, 'y=3^x-1|3^x-1', r`$x+1=3^y$; $y=3^x-1$`, 1],
        ] },
        { title: 'Kas funktsioon on kasvav või kahanev?', parts: [
          [r`$y=\log_{0{,}5}x$`, 1, 'kahanev', r`$0<0{,}5<1$`, 1],
          [r`$y=\ln x$`, 1, 'kasvav', r`$e>1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=\log_2(x-1)+1$.`, grid: { xmin: -2, xmax: 6, ymin: -2, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia määramispiirkond.', 1, '(1;∞)|x>1', r`$x-1>0$`, 1],
        ['Leia nullkoht.', 2, '1,5|3/2', r`$\log_2(x-1)=-1$, $x-1=\dfrac12$, $x=1{,}5$`, 1],
        [r`Leia $f(5)$.`, 1, '3', r`$\log_24+1=3$`, 1],
        ['Leia pöördfunktsioon.', 3, 'y=2^(x-1)+1|2^(x-1)+1', r`$y-1=\log_2(x-1)$, $x-1=2^{y-1}$; $f^{-1}(x)=2^{x-1}+1$`, 2],
        [r`Joonesta $f$, selle pöördfunktsioon ja sirge $y=x$.`, 3, '', 'f läbib (1,5; 0), (2; 1), (3; 2), (5; 3); pöördfunktsioon läbib (0; 1,5), (1; 2), (2; 3), (3; 5); graafikud on sümmeetrilised sirge y = x suhtes.', 0],
      ] },
      self: ['Leian pöördfunktsiooni.', 'Tean logaritmfunktsiooni omadusi.', 'Leian logaritmfunktsiooni määramispiirkonna.'],
    },
    {
      title: 'Eksponentvõrrandid ja -võrratused',
      ru: 'Показательные уравнения и неравенства',
      course: 'VIII',
      exam: 'II osa ülesanne 11 (10 p): eksponentvõrrand asendusega või logaritmimisega, eksponentvõrratus.',
      can: 'Õpilane lahendab eksponentvõrrandeid ühele alusele viimise, asenduse ja logaritmimise teel ning eksponentvõrratusi.',
      theory: [
        r`$a^{f(x)}=a^{g(x)}\;\Leftrightarrow\;f(x)=g(x)$ — *pähe*`,
        r`$a^x=b\;(b>0)\;\Rightarrow\;x=\log_ab=\dfrac{\ln b}{\ln a}$ — *pähe*`,
        r`Asendus $t=a^x$, kusjuures $t>0$: negatiivne $t$ ei anna lahendit — *pähe*`,
        r`Võrratus $a^{f(x)}>a^{g(x)}$: kui $a>1$, siis $f(x)>g(x)$; kui $0<a<1$, siis märk pöördub: $f(x)<g(x)$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этих правил нет — учим наизусть.',
        '4ˣ = (2ˣ)²: замена t = 2ˣ даёт квадратное уравнение; t > 0.',
        'Основание меньше 1 — знак неравенства меняется.',
      ],
      example: {
        task: r`Lahenda võrrand $4^x-6\cdot2^x+8=0$.`,
        steps: [
          r`$t=2^x>0$: $\;t^2-6t+8=0$, $t=2$ või $t=4$.`,
          r`$2^x=2\Rightarrow x=1$; $\;2^x=4\Rightarrow x=2$.`,
          r`Vastus: $x=1$ või $x=2$ (graafiku nullkohad).`,
        ],
        graph: { fns: 'y = 4^x - 6*2^x + 8', xmin: -1, xmax: 3, ymin: -2, ymax: 6, step: 0.5, stepY: 1, labelEvery: 2, points: 'A(1; 0)\nB(2; 0)', caption: 'y = 4ˣ − 6 · 2ˣ + 8' },
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$3^{2x-1}=27$`, 1, '2', r`$2x-1=3$`, 1],
          [r`$5^{x^2-x}=25$`, 1, '2; -1', r`$x^2-x-2=0$`, 1],
          [r`$2^x=10$ (kahe kümnendkohani)`, 1, '3,32', r`$x=\dfrac{\ln10}{\ln2}\approx3{,}32$`, 1],
        ] },
        { title: 'Lahenda võrrand.', parts: [
          [r`$9^x-4\cdot3^x+3=0$`, 2, '0; 1', r`$t=3^x$: $t^2-4t+3=0$, $t=1$ või $t=3$: $x=0$ või $x=1$.`, 2],
          [r`$2^{x+2}+2^x=40$`, 2, '3', r`$2^x(4+1)=40$, $2^x=8$, $x=3$.`, 2],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$2^{x-3}>16$`, 1, '(7;∞)|x>7', r`$x-3>4$`, 1],
          [r`$\left(\dfrac13\right)^x\le9$`, 2, '[-2;∞)|x>=-2|x≥-2', r`$3^{-x}\le3^2$, $-x\le2$, $x\ge-2$`, 2],
        ] },
        { title: r`Lahenda võrrand $3^x=5^{x-1}$.`, parts: [
          ['Leia x kahe kümnendkohani.', 2, '3,15', r`$x\ln3=(x-1)\ln5$, $x(\ln5-\ln3)=\ln5$, $x=\dfrac{\ln5}{\ln\frac53}\approx3{,}15$`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Lahenda võrrandid ja võrratus.', parts: [
        [r`$4^x-3\cdot2^{x+1}-16=0$`, 4, '3', r`$t=2^x>0$: $t^2-6t-16=0$, $t=8$ või $t=-2$ (ei sobi). $2^x=8$, $x=3$.`, 4],
        [r`$0{,}5^{x^2-4}\ge\dfrac1{32}$`, 3, '[-3;3]|-3<=x<=3|-3≤x≤3', r`$0{,}5^{x^2-4}\ge0{,}5^5$; alus $<1$: $x^2-4\le5$, $x^2\le9$, $-3\le x\le3$.`, 3],
        [r`$7e^{0{,}2x}=21$ (kahe kümnendkohani)`, 3, '5,49|5ln3', r`$e^{0{,}2x}=3$, $0{,}2x=\ln3$, $x=5\ln3\approx5{,}49$`, 2],
      ] },
      self: ['Viin võrrandi ühele alusele.', 'Kasutan asendust t = aˣ > 0.', 'Pööran võrratuse märki, kui alus on alla 1.'],
    },
    {
      title: 'Logaritmvõrrandid ja -võrratused',
      ru: 'Логарифмические уравнения и неравенства',
      course: 'VIII',
      exam: 'II osa ülesanne 11 (10 p): logaritmvõrrand koos lahendite kontrolliga, logaritmvõrratus, logaritmiline mudel (detsibellid, pH).',
      can: 'Õpilane lahendab logaritmvõrrandeid ja -võrratusi, arvestab määramispiirkonda ja kontrollib lahendeid.',
      theory: [
        r`$\log_af(x)=\log_ag(x)\;\Leftrightarrow\;f(x)=g(x)$, kusjuures $f(x)>0$ ja $g(x)>0$ — *pähe*`,
        r`$\log_af(x)=c\;\Leftrightarrow\;f(x)=a^c$ — *pähe*`,
        r`Lahendid tuleb kontrollida: logaritmitav peab olema positiivne — *pähe*`,
        r`Võrratus: $a>1$ — märk säilib, $0<a<1$ — märk pöördub; lisaks logaritmitav $>0$ — *pähe*`,
        r`Asendus $t=\log_ax$ annab ruutvõrrandi — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai логарифмических правил нет — учим наизусть.',
        'Сначала область допустимых значений, потом решение, потом проверка.',
        'В неравенстве с основанием меньше 1 знак меняется.',
      ],
      example: {
        task: r`Lahenda võrrand $\lg(x+3)+\lg(x-3)=\lg7$.`,
        steps: [
          r`Määramispiirkond: $x>3$.`,
          r`$\lg\big((x+3)(x-3)\big)=\lg7$: $x^2-9=7$, $x=\pm4$.`,
          r`$x=-4$ ei sobi ($x>3$). Vastus: $x=4$.`,
        ],
        graph: { fns: 'y = log(x + 3) + log(x - 3)\ny = log(7)', xmin: 2, xmax: 8, ymin: -1, ymax: 2, step: 1, stepY: 0.5, points: 'P(4; 0.85)', caption: 'tumesinine: y = lg(x + 3) + lg(x − 3) · roheline: y = lg 7' },
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$\log_3(2x-1)=2$`, 1, '5', r`$2x-1=9$`, 1],
          [r`$\ln(x+2)=1$ (kahe kümnendkohani)`, 1, '0,72|e-2', r`$x+2=e$, $x=e-2\approx0{,}72$`, 1],
          [r`$\lg x=-2$`, 1, '0,01|1/100', r`$x=10^{-2}$`, 1],
        ] },
        { title: 'Lahenda võrrand ja kontrolli lahendeid.', parts: [
          [r`$\log_2x+\log_2(x-2)=3$`, 2, '4', r`$x(x-2)=8$, $x^2-2x-8=0$: $x=4$ või $x=-2$ (ei sobi).`, 2],
          [r`$\log_5(x^2-4x)=1$`, 2, '5; -1', r`$x^2-4x=5$: $x=5$ või $x=-1$; mõlemal $x^2-4x=5>0$.`, 2],
        ] },
        { title: r`Lahenda võrrand $\lg^2x-3\lg x+2=0$.`, parts: [
          [r`Leia $\lg x$ väärtused.`, 1, '1; 2', r`$t=\lg x$: $t^2-3t+2=0$`, 1],
          ['Leia x.', 1, '10; 100', r`$x=10$ või $x=100$`, 1],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$\log_2(x-1)<3$`, 2, '(1;9)|1<x<9', r`$0<x-1<8$`, 2],
          [r`$\log_{0{,}5}(x+2)\ge-1$`, 2, '(-2;0]|-2<x<=0|-2<x≤0', r`Alus $<1$: $0<x+2\le0{,}5^{-1}=2$, $-2<x\le0$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Lahenda ülesanded.', parts: [
        [r`Lahenda võrrand $\log_3(x+1)+\log_3(x+3)=1$.`, 4, '0', r`$(x+1)(x+3)=3$, $x^2+4x=0$: $x=0$ või $x=-4$. $x=-4$ ei sobi ($x+1<0$). Vastus: $x=0$.`, 4],
        [r`Lahenda võrratus $\lg(2x-4)\le\lg(x+1)$.`, 3, '(2;5]|2<x<=5|2<x≤5', r`$2x-4>0$: $x>2$; $2x-4\le x+1$: $x\le5$. Vastus: $2<x\le5$.`, 3],
        [r`Helitugevus detsibellides on $L=10\lg\dfrac{I}{I_0}$. Mitu detsibelli lisandub, kui heli intensiivsus $I$ kasvab 100 korda?`, 3, '20', r`$10\lg\dfrac{100I}{I_0}=10\left(2+\lg\dfrac I{I_0}\right)=20+L$: lisandub 20 dB.`, 2],
      ] },
      self: ['Leian logaritmvõrrandi määramispiirkonna.', 'Kontrollin lahendeid.', 'Lahendan logaritmvõrratuse.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: VIII kursus',
      ru: 'Повторение и контрольная работа: VIII курс',
      course: 'VIII',
      exam: 'VIII kursuse teemad annavad laia riigieksami II osa ülesande 11 (logaritmid ja mudelid, 10 p).',
      can: 'Õpilane lahendab VIII kursuse ülesandeid iseseisvalt: liitprotsent, eksponent- ja logaritmfunktsioon, pöördfunktsioon, võrrandid ja võrratused.',
      theory: [
        r`$K_n=K_0\left(1\pm\dfrac p{100}\right)^n$; $\;y=a^x$: $Y=(0;\infty)$; $\;y=\log_ax$: $X=(0;\infty)$ — *pähe*`,
        r`$\log_a(xy)=\log_ax+\log_ay$, $\;\log_ax^k=k\log_ax$, $\;\log_ab=\dfrac{\ln b}{\ln a}$ — *pähe*`,
        r`Pöördfunktsioon: avalda $x$ ja vaheta tähed; graafikud sümmeetrilised sirge $y=x$ suhtes — *pähe*`,
        r`Võrrandid: ühine alus, asendus $t=a^x>0$, kontroll; võrratustes alus $<1$ pöörab märgi — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai формул VIII курса нет (кроме производных) — повторяем наизусть.',
        'Проверь в каждом логарифмическом уравнении область определения.',
        'Время в задаче на проценты округляем вверх.',
      ],
      example: {
        task: r`Lahenda võrrand $\log_2(x+4)=3$.`,
        steps: [
          r`$x+4=2^3=8$.`,
          r`$x=4$; kontroll: $x+4=8>0$ ✓.`,
        ],
      },
      practice: [
        { title: 'Logaritmid.', parts: [
          [r`$\log_381$`, 1, '4', r`$3^4=81$`, 1],
          [r`$\lg20+\lg5$`, 1, '2', r`$\lg100$`, 1],
        ] },
        { title: 'Funktsioonid.', parts: [
          [r`Leia $y=e^x+2$ muutumispiirkond.`, 1, '(2;∞)|y>2', r`$e^x>0$`, 1],
          [r`Leia $y=5x-1$ pöördfunktsioon.`, 1, 'y=(x+1)/5|(x+1)/5|y=0,2x+0,2|0,2x+0,2', r`$x=\dfrac{y+1}{5}$`, 1],
        ] },
        { title: 'Võrrandid.', parts: [
          [r`$2^{x+1}=16$`, 1, '3', r`$x+1=4$`, 1],
          [r`$\log_3x=-1$`, 1, '1/3|0,33', r`$x=3^{-1}$`, 1],
        ] },
        { title: 'Protsendid.', parts: [
          ['1000 € kasvab 5% aastas. Leia summa 3 aasta pärast.', 1, '1157,63', r`$1000\cdot1{,}05^3=1157{,}625\approx1157{,}63$`, 1],
          ['Mitu protsenti on 3 aasta kogukasv?', 1, '15,76', r`$1{,}05^3-1\approx0{,}1576$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'VIII kursus: eksponent- ja logaritmfunktsioon. Aega 45 minutit.', parts: [
        ['1. 6000 € kasvab 3% aastas liitintressiga. Leia summa 5 aasta pärast.', 2, '6955,64', r`$6000\cdot1{,}03^5\approx6955{,}64$ €`, 1],
        ['2. 20 000-eurone auto kaotab igal aastal 15% väärtusest. Leia väärtus 2 aasta pärast.', 2, '14450', r`$20\,000\cdot0{,}85^2=14\,450$ €`, 1],
        [r`3. Arvuta $\log_264$.`, 1, '6', r`$2^6=64$`, 1],
        [r`4. Arvuta $\log_42+\log_48$.`, 2, '2', r`$\log_416=2$`, 1],
        [r`5. Arvuta $\log_530$ kahe kümnendkohani.`, 2, '2,11', r`$\dfrac{\ln30}{\ln5}\approx2{,}11$`, 1],
        [r`6. Leia funktsiooni $f(x)=3^x-3$ nullkoht.`, 1, '1', r`$3^x=3$`, 1],
        [r`7. Leia funktsiooni $y=2x-8$ pöördfunktsioon.`, 2, 'y=(x+8)/2|(x+8)/2|y=x/2+4|x/2+4|y=0,5x+4|0,5x+4', r`$x=\dfrac{y+8}{2}$`, 1],
        [r`8. Leia funktsiooni $y=\ln(x-2)$ määramispiirkond.`, 1, '(2;∞)|x>2', r`$x-2>0$`, 1],
        [r`9. Lahenda $2^{3x-1}=32$.`, 2, '2', r`$3x-1=5$`, 1],
        [r`10. Lahenda $25^x-6\cdot5^x+5=0$.`, 3, '0; 1', r`$t=5^x$: $t^2-6t+5=0$, $t=1$ või $t=5$.`, 2],
        [r`11. Lahenda $\left(\dfrac12\right)^x>8$.`, 2, '(-∞;-3)|x<-3', r`$2^{-x}>2^3$, $-x>3$`, 1],
        [r`12. Lahenda $\log_2(x+3)=4$.`, 2, '13', r`$x+3=16$`, 1],
        [r`13. Lahenda $\lg x+\lg(x-9)=1$.`, 3, '10', r`$x(x-9)=10$, $x^2-9x-10=0$: $x=10$ või $x=-1$ (ei sobi).`, 2],
      ] },
      self: ['Oskan VIII kursuse kõiki ülesandetüüpe.', 'Lahendan eksponent- ja logaritmvõrrandeid.', 'Kontrollin lahendeid määramispiirkonnaga.'],
    },
    // ───────────── IX kursus „Trigonomeetrilised funktsioonid. Funktsiooni piirväärtus ja tuletis” ─────────────
    {
      title: 'Siinus- ja koosinusfunktsioon, perioodilisus',
      ru: 'Синус и косинус как функции, периодичность',
      course: 'IX',
      exam: 'II osa ülesanne 8 (10 p): trigonomeetriline funktsioon radiaanides — periood, muutumispiirkond, nullkohad, graafik.',
      can: 'Õpilane kirjeldab siinus- ja koosinusfunktsiooni omadusi, leiab funktsiooni y = a sin(bx) + c amplituudi, perioodi ja muutumispiirkonna ning joonestab graafiku.',
      theory: [
        r`$\sin(-x)=-\sin x$, $\;\cos(-x)=\cos x$, $\;\sin(x+2\pi)=\sin x$, $\;\cos(x+2\pi)=\cos x$ — *valemilehel*`,
        r`Perioodiline funktsioon: $f(x+T)=f(x)$; $y=\sin x$ ja $y=\cos x$: $X=\mathbb R$, $Y=[-1;1]$, periood $2\pi$ — *pähe*`,
        r`$y=a\sin(bx)+c$: amplituud $|a|$, periood $\dfrac{2\pi}{|b|}$, $Y=[c-|a|;\,c+|a|]$ — *pähe*`,
        r`Nullkohad: $\sin x=0\Leftrightarrow x=\pi n$; $\;\cos x=0\Leftrightarrow x=\dfrac\pi2+\pi n$, $n\in\mathbb Z$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть чётность и периодичность sin, cos, tan и формулы приведения; период y = a sin(bx) учим наизусть.',
        'Период 2π/|b|: чем больше b, тем «чаще» волны.',
        'Аргумент — в радианах: π ≈ 3,14, π/2 ≈ 1,57.',
      ],
      example: {
        task: r`Uuri funktsiooni $y=3\cos2x$: amplituud, periood, muutumispiirkond ja maksimumkohad lõigul $[0;2\pi]$.`,
        steps: [
          r`Amplituud $3$, periood $\dfrac{2\pi}{2}=\pi$.`,
          r`$Y=[-3;3]$.`,
          r`Maksimum $3$, kui $\cos2x=1$: $2x=2\pi n$, $x=\pi n$; lõigul $[0;2\pi]$: $0$, $\pi$, $2\pi$.`,
        ],
        graph: { fns: 'y = 3cos(2x)', xmin: -0.5, xmax: 6.5, ymin: -3.5, ymax: 3.5, step: 0.5, stepY: 1, labelEvery: 2, points: 'A(0; 3)\nB(3.14; 3)\nC(6.28; 3)', caption: 'y = 3 cos 2x, periood π ≈ 3,14' },
      },
      practice: [
        { title: 'Leia periood.', parts: [
          [r`$y=\sin3x$`, 1, '2π/3|2,09', r`$\dfrac{2\pi}{3}$`, 1],
          [r`$y=\cos\dfrac x2$`, 1, '4π|12,57', r`$\dfrac{2\pi}{1/2}=4\pi$`, 1],
          [r`$y=5\sin(\pi x)$`, 1, '2', r`$\dfrac{2\pi}{\pi}=2$`, 1],
        ] },
        { title: 'Leia muutumispiirkond.', parts: [
          [r`$y=4\sin x-1$`, 1, '[-5;3]|-5<=y<=3|-5≤y≤3', r`$-4-1\le y\le4-1$`, 1],
          [r`$y=2-\cos x$`, 1, '[1;3]|1<=y<=3|1≤y≤3', r`$\cos x\in[-1;1]$: $y\in[1;3]$`, 1],
          [r`$y=\sin^2x$`, 1, '[0;1]|0<=y<=1|0≤y≤1', r`$0\le\sin^2x\le1$`, 1],
        ] },
        { title: 'Kas funktsioon on paaris, paaritu või kumbki?', parts: [
          [r`$y=x\sin x$`, 1, 'paaris', r`$(-x)\sin(-x)=x\sin x$`, 1],
          [r`$y=\sin x+\cos x$`, 1, 'kumbki', r`$-\sin x+\cos x$ ei võrdu ei $f(x)$ ega $-f(x)$.`, 1],
          [r`$y=\sin x\cos x$`, 1, 'paaritu', r`$\sin(-x)\cos(-x)=-\sin x\cos x$`, 1],
        ] },
        { title: r`Funktsioon $y=\sin x$ lõigul $[0;2\pi]$.`, parts: [
          ['Leia nullkohad.', 1, '0; π; 2π|0; 3,14; 6,28', r`$x=\pi n$: $0$, $\pi$, $2\pi$`, 1],
          ['Leia maksimumkoht.', 1, 'π/2|1,57', r`$\sin x=1$, kui $x=\dfrac\pi2$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=2\sin x+1$ lõigul $[0;2\pi]$.`, grid: { xmin: 0, xmax: 6.5, ymin: -1.5, ymax: 3.5, step: 0.5, stepY: 0.5, labelEvery: 2, blank: true }, parts: [
        ['Leia amplituud ja periood.', 2, '2; 2π|2; 6,28', r`Amplituud $2$, periood $2\pi$.`, 1],
        ['Leia muutumispiirkond.', 2, '[-1;3]|-1<=y<=3|-1≤y≤3', r`$-2+1\le f(x)\le2+1$`, 1],
        ['Leia maksimumkoht.', 2, 'π/2|1,57', r`$\sin x=1$: $x=\dfrac\pi2$, $f=3$.`, 1],
        ['Leia nullkohad.', 2, '7π/6; 11π/6|3,67; 5,76', r`$\sin x=-\dfrac12$: $x=\dfrac{7\pi}6$ või $x=\dfrac{11\pi}6$.`, 2],
        ['Joonesta graafik.', 2, '', 'Punktid (0; 1), (π/2; 3), (π; 1), (3π/2; −1), (2π; 1).', 0],
      ] },
      self: ['Leian amplituudi ja perioodi.', 'Leian muutumispiirkonna.', 'Joonestan siinusoidi radiaanides.'],
    },
    {
      title: 'Tangensfunktsioon ja arkusfunktsioonid',
      ru: 'Функция тангенс и аркфункции',
      course: 'IX',
      exam: 'Trigonomeetriliste võrrandite lahendamine vajab väärtusi arcsin, arccos, arctan ja tangensi omadusi (II osa 8).',
      can: 'Õpilane kirjeldab tangensfunktsiooni omadusi, leiab arkussiinuse, arkuskoosinuse ja arkustangensi väärtused ning lahendab võrrandi tan x = a ühes perioodis.',
      theory: [
        r`$\tan x=\dfrac{\sin x}{\cos x}$, $\;\tan(-x)=-\tan x$, $\;\tan(x+\pi)=\tan x$ — *valemilehel*`,
        r`$y=\tan x$: $x\ne\dfrac\pi2+\pi n$, $Y=\mathbb R$, kasvav igas vahemikus, asümptoodid $x=\dfrac\pi2+\pi n$ — *pähe*`,
        r`$\arcsin a\in\left[-\dfrac\pi2;\dfrac\pi2\right]$, $\;\arccos a\in[0;\pi]$, $\;\arctan a\in\left(-\dfrac\pi2;\dfrac\pi2\right)$ — *pähe*`,
        r`Täpsed väärtused: $\sin\dfrac\pi6=\dfrac12$, $\sin\dfrac\pi4=\dfrac{\sqrt2}2$, $\sin\dfrac\pi3=\dfrac{\sqrt3}2$, $\tan\dfrac\pi4=1$, $\tan\dfrac\pi3=\sqrt3$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть tan x = sin x / cos x и формулы приведения; точные значения и арк-функции учим наизусть.',
        'arccos отрицательного числа: arccos(−a) = π − arccos a.',
        'Тангенс не определён там, где cos x = 0 — там вертикальные асимптоты.',
      ],
      example: {
        task: r`Lahenda võrrand $\tan x=1$ vahemikus $\left(-\dfrac\pi2;\dfrac{3\pi}2\right)$.`,
        steps: [
          r`$\arctan1=\dfrac\pi4$.`,
          r`Periood on $\pi$: teine lahend $\dfrac\pi4+\pi=\dfrac{5\pi}4$.`,
          r`Vastus: $x=\dfrac\pi4\approx0{,}79$ või $x=\dfrac{5\pi}4\approx3{,}93$.`,
        ],
        graph: { fns: 'y = tan(x)\ny = 1', xmin: -1.5, xmax: 4.7, ymin: -4, ymax: 4, step: 0.5, stepY: 1, labelEvery: 2, points: 'A(0.79; 1)\nB(3.93; 1)', caption: 'tumesinine: y = tan x · roheline: y = 1' },
      },
      practice: [
        { title: 'Arvuta (radiaanides).', parts: [
          [r`$\arcsin\dfrac12$`, 1, 'π/6|0,52', r`$\sin\dfrac\pi6=\dfrac12$`, 1],
          [r`$\arccos\left(-\dfrac12\right)$`, 1, '2π/3|2,09', r`$\pi-\dfrac\pi3=\dfrac{2\pi}3$`, 1],
          [r`$\arctan\sqrt3$`, 1, 'π/3|1,05', r`$\tan\dfrac\pi3=\sqrt3$`, 1],
          [r`$\arcsin\left(-\dfrac{\sqrt2}2\right)$`, 1, '-π/4|-0,79', r`$\arcsin$ on paaritu: $-\dfrac\pi4$`, 1],
        ] },
        { title: 'Leia väärtus.', parts: [
          [r`$\tan\dfrac\pi4$`, 1, '1', 'Täpne väärtus.', 1],
          [r`$\tan\dfrac{5\pi}6$`, 1, '-√3/3|-0,58', r`$\tan\left(\pi-\dfrac\pi6\right)=-\tan\dfrac\pi6=-\dfrac{\sqrt3}3$`, 1],
          [r`$\tan\left(-\dfrac\pi3\right)$`, 1, '-√3|-1,73', r`$-\tan\dfrac\pi3$`, 1],
        ] },
        { title: r`$y=\tan2x$.`, parts: [
          ['Leia periood.', 1, 'π/2|1,57', r`$\dfrac{\pi}{2}$`, 1],
          ['Leia vähim positiivne x, kus funktsioon ei ole määratud.', 2, 'π/4|0,79', r`$2x=\dfrac\pi2$, $x=\dfrac\pi4$`, 2],
        ] },
        { title: 'Arvuta kalkulaatoriga radiaanides kahe kümnendkohani.', parts: [
          [r`$\arcsin0{,}3$`, 1, '0,3|0,30', r`$\approx0{,}30$`, 1],
          [r`$\arccos0{,}8$`, 1, '0,64', r`$\approx0{,}64$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on funktsioon $f(x)=\tan x$ vahemikus $\left(-\dfrac\pi2;\dfrac\pi2\right)$.`, parts: [
        [r`Leia $f\left(\dfrac\pi6\right)$.`, 1, '√3/3|0,58', r`$\tan\dfrac\pi6=\dfrac{\sqrt3}3$`, 1],
        [r`Leia $x$, kui $f(x)=-1$.`, 2, '-π/4|-0,79', r`$\arctan(-1)=-\dfrac\pi4$`, 1],
        [r`Lahenda võrratus $\tan x>1$ selles vahemikus.`, 2, '(π/4;π/2)|π/4<x<π/2', r`Tangens kasvab: $\dfrac\pi4<x<\dfrac\pi2$.`, 2],
      ] },
      self: ['Tean tangensfunktsiooni omadusi.', 'Leian arcsin, arccos ja arctan väärtused.', 'Kasutan täpseid väärtusi.'],
    },
    {
      title: 'Lihtsamad trigonomeetrilised võrrandid',
      ru: 'Простейшие тригонометрические уравнения',
      course: 'IX',
      exam: 'II osa ülesanne 8 (10 p): trigonomeetriline võrrand lõigul radiaanides, sageli kahekordse nurga valemiga.',
      can: 'Õpilane lahendab võrrandeid sin x = a, cos x = a ja tan x = a, kirjutab üldlahendi, valib lahendid lõigult ning lahendab ruutvõrrandiks taanduvaid võrrandeid.',
      theory: [
        r`$\sin x=a$ ($|a|\le1$): $x=(-1)^n\arcsin a+\pi n$ — *pähe*`,
        r`$\cos x=a$ ($|a|\le1$): $x=\pm\arccos a+2\pi n$ — *pähe*`,
        r`$\tan x=a$: $x=\arctan a+\pi n$; erijuhud $\sin x=0\Rightarrow x=\pi n$, $\cos x=0\Rightarrow x=\dfrac\pi2+\pi n$ — *pähe*`,
        r`$\sin2x=2\sin x\cos x$, $\;\cos2x=1-2\sin^2x=2\cos^2x-1$, $\;\sin^2x+\cos^2x=1$ — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть формулы двойного угла и sin² + cos² = 1; общие решения уравнений учим наизусть.',
        'Не делим на cos x — выносим его за скобки, иначе теряем корни.',
        'Корни на отрезке выбираем, подставляя n = 0, 1, …',
      ],
      example: {
        task: r`Lahenda võrrand $2\cos x-\sqrt3=0$ lõigul $[0;2\pi]$.`,
        steps: [
          r`$\cos x=\dfrac{\sqrt3}2$: $x=\pm\dfrac\pi6+2\pi n$.`,
          r`Lõigul $[0;2\pi]$: $x=\dfrac\pi6$ ja $x=2\pi-\dfrac\pi6=\dfrac{11\pi}6$.`,
          r`Kontroll graafikul: $y=\cos x$ lõikab sirget $y\approx0{,}87$ kaks korda.`,
        ],
        graph: { fns: 'y = cos(x)\ny = 0.866', xmin: -0.5, xmax: 6.5, ymin: -1.5, ymax: 1.5, step: 0.5, stepY: 0.5, labelEvery: 2, points: 'A(0.52; 0.87)\nB(5.76; 0.87)', caption: 'tumesinine: y = cos x · roheline: y = √3/2' },
      },
      practice: [
        { title: r`Lahenda võrrand lõigul $[0;2\pi]$.`, parts: [
          [r`$\sin x=\dfrac12$`, 1, 'π/6; 5π/6|0,52; 2,62', r`$x=\dfrac\pi6$ või $x=\pi-\dfrac\pi6$`, 1],
          [r`$\cos x=-1$`, 1, 'π|3,14', r`$x=\pi$`, 1],
          [r`$\tan x=-1$`, 1, '3π/4; 7π/4|2,36; 5,5', r`$x=-\dfrac\pi4+\pi n$: $\dfrac{3\pi}4$ ja $\dfrac{7\pi}4$`, 1],
        ] },
        { title: 'Kirjuta üldlahend.', parts: [
          [r`$\sin x=0$`, 1, 'πn|x=πn|nπ', r`$x=\pi n$, $n\in\mathbb Z$`, 1],
          [r`$\cos x=\dfrac12$`, 1, '±π/3+2πn|x=±π/3+2πn', r`$x=\pm\dfrac\pi3+2\pi n$`, 1],
        ] },
        { title: r`Lahenda võrrand $2\sin^2x-\sin x-1=0$ lõigul $[0;2\pi]$.`, parts: [
          [r`Leia $\sin x$ väärtused.`, 1, '1; -1/2|1; -0,5', r`$t=\sin x$: $2t^2-t-1=0$, $t=1$ või $t=-\dfrac12$.`, 1],
          ['Leia lahendid.', 2, 'π/2; 7π/6; 11π/6|1,57; 3,67; 5,76', r`$\sin x=1$: $\dfrac\pi2$; $\sin x=-\dfrac12$: $\dfrac{7\pi}6$, $\dfrac{11\pi}6$.`, 2],
        ] },
        { title: r`Lahenda võrrand $\sin2x=\cos x$ lõigul $[0;\pi]$.`, parts: [
          ['Leia lahendid.', 3, 'π/6; π/2; 5π/6|0,52; 1,57; 2,62', r`$2\sin x\cos x-\cos x=0$, $\cos x(2\sin x-1)=0$. $\cos x=0$: $\dfrac\pi2$; $\sin x=\dfrac12$: $\dfrac\pi6$, $\dfrac{5\pi}6$.`, 4],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Lahenda ülesanded.', parts: [
        [r`Lahenda võrrand $\cos2x+3\sin x=2$ lõigul $[0;2\pi]$.`, 5, 'π/6; π/2; 5π/6|0,52; 1,57; 2,62', r`$1-2\sin^2x+3\sin x-2=0$, $2\sin^2x-3\sin x+1=0$: $\sin x=1$ või $\sin x=\dfrac12$. Lahendid $\dfrac\pi6$, $\dfrac\pi2$, $\dfrac{5\pi}6$.`, 5],
        [r`Kirjuta võrrandi $\sqrt3\tan x=1$ üldlahend.`, 2, 'π/6+πn|x=π/6+πn', r`$\tan x=\dfrac1{\sqrt3}$: $x=\dfrac\pi6+\pi n$`, 2],
        [r`Lahenda võrratus $\sin x\ge\dfrac12$ lõigul $[0;2\pi]$.`, 3, '[π/6;5π/6]|π/6<=x<=5π/6|π/6≤x≤5π/6', r`Siinusoid on sirgest $y=\dfrac12$ kõrgemal lõigul $\left[\dfrac\pi6;\dfrac{5\pi}6\right]$.`, 2],
      ] },
      self: ['Kirjutan sin, cos ja tan võrrandi üldlahendi.', 'Valin lahendid antud lõigult.', 'Lahendan ruutvõrrandiks taanduva võrrandi.'],
    },
    {
      title: 'Funktsiooni piirväärtus ja pidevus',
      ru: 'Предел функции и непрерывность',
      course: 'IX',
      exam: 'Piirväärtus on tuletise definitsiooni alus; asümptoodid ja pidevus on funktsiooni täieliku uurimise osa (II osa 5).',
      can: 'Õpilane leiab funktsiooni piirväärtuse punktis ja lõpmatuses, kasutab piirväärtust sin x / x ning kontrollib funktsiooni pidevust.',
      theory: [
        r`$\lim\limits_{x\to a}f(x)=L$: kui $x$ läheneb arvule $a$, läheneb $f(x)$ arvule $L$ — *pähe*`,
        r`Kuju $\dfrac00$: tegurda ja taanda või korruta kaasavaldisega — *pähe*`,
        r`$x\to\infty$: jaga lugeja ja nimetaja $x$ kõrgeima astmega; $\;\lim\limits_{x\to0}\dfrac{\sin x}{x}=1$ — *pähe*`,
        r`Pidevus kohal $a$: $\lim\limits_{x\to a}f(x)=f(a)$; vertikaalne asümptoot $x=a$, kui $f(x)\to\pm\infty$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai пределов нет — правила учим наизусть.',
        '0/0 — раскладываем на множители и сокращаем.',
        'Непрерывность: предел равен значению функции в точке.',
      ],
      example: {
        task: r`Leia $\lim\limits_{x\to2}\dfrac{x^2-4}{x-2}$.`,
        steps: [
          r`Asendus annab $\dfrac00$.`,
          r`$\dfrac{(x-2)(x+2)}{x-2}=x+2$, kui $x\ne2$.`,
          r`$\lim\limits_{x\to2}(x+2)=4$. Graafik on sirge $y=x+2$, millel kohal $x=2$ on „auk”.`,
        ],
        graph: { fns: 'y = (x^2 - 4)/(x - 2)', xmin: -3, xmax: 4, ymin: -1, ymax: 7, step: 1, stepY: 1, points: 'P(2; 4)', caption: 'y = (x² − 4)/(x − 2): punktis (2; 4) funktsioon ei ole määratud' },
      },
      practice: [
        { title: 'Leia piirväärtus.', parts: [
          [r`$\lim\limits_{x\to3}(x^2+1)$`, 1, '10', r`Pidev funktsioon: $9+1=10$`, 1],
          [r`$\lim\limits_{x\to1}\dfrac{x^2-1}{x^2+x-2}$`, 1, '2/3|0,67', r`$\dfrac{(x-1)(x+1)}{(x-1)(x+2)}=\dfrac{x+1}{x+2}\to\dfrac23$`, 1],
          [r`$\lim\limits_{x\to0}\dfrac{\sqrt{x+9}-3}{x}$`, 2, '1/6|0,17', r`Korrutame kaasavaldisega: $\dfrac{x}{x(\sqrt{x+9}+3)}=\dfrac1{\sqrt{x+9}+3}\to\dfrac16$`, 2],
        ] },
        { title: 'Leia piirväärtus.', parts: [
          [r`$\lim\limits_{x\to\infty}\dfrac{3x^2-x}{x^2+5}$`, 1, '3', r`Jagame $x^2$-ga: $\dfrac{3-\frac1x}{1+\frac5{x^2}}\to3$`, 1],
          [r`$\lim\limits_{x\to\infty}\dfrac{2x+1}{x^2}$`, 1, '0', 'Nimetaja aste on suurem.', 1],
          [r`$\lim\limits_{x\to-\infty}\dfrac{x^3}{2x^3-1}$`, 1, '0,5|1/2', r`$\dfrac12$`, 1],
        ] },
        { title: 'Leia piirväärtus.', parts: [
          [r`$\lim\limits_{x\to0}\dfrac{\sin3x}{x}$`, 1, '3', r`$3\cdot\dfrac{\sin3x}{3x}\to3$`, 1],
          [r`$\lim\limits_{x\to0}\dfrac{\tan x}{x}$`, 1, '1', r`$\dfrac{\sin x}{x}\cdot\dfrac1{\cos x}\to1\cdot1$`, 1],
        ] },
        { title: 'Pidevus.', parts: [
          [r`$f(x)=x+a$, kui $x<1$, ja $f(x)=x^2+1$, kui $x\ge1$. Leia $a$, mille korral $f$ on pidev.`, 2, '1', r`$1+a=1^2+1$, $a=1$`, 2],
          [r`$f(x)=\dfrac{x^2-9}{x-3}$, kui $x\ne3$, ja $f(3)=k$. Leia $k$, mille korral $f$ on pidev.`, 1, '6', r`$\lim\limits_{x\to3}(x+3)=6$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=\dfrac{x^2-x-6}{x^2-9}$.`, parts: [
        ['Leia määramispiirkond.', 2, 'x≠±3|x≠-3; x≠3', r`$x^2-9\ne0$: $x\ne\pm3$`, 1],
        [r`Leia $\lim\limits_{x\to3}f(x)$.`, 3, '5/6|0,83', r`$\dfrac{(x-3)(x+2)}{(x-3)(x+3)}=\dfrac{x+2}{x+3}\to\dfrac56$`, 2],
        [r`Leia $\lim\limits_{x\to\infty}f(x)$.`, 2, '1', r`$\dfrac{1-\frac1x-\frac6{x^2}}{1-\frac9{x^2}}\to1$`, 1],
        ['Leia vertikaalne asümptoot.', 3, 'x=-3|-3', r`Kohal $x=-3$: $\dfrac{x+2}{x+3}\to\pm\infty$; kohal $x=3$ on ainult „auk”.`, 2],
      ] },
      self: ['Leian piirväärtuse kujul 0/0.', 'Leian piirväärtuse lõpmatuses.', 'Kontrollin pidevust ja leian asümptoodi.'],
    },
    {
      title: 'Funktsiooni muut ja tuletise mõiste',
      ru: 'Приращение функции и понятие производной',
      course: 'IX',
      exam: 'Tuletise geomeetriline ja füüsikaline tähendus on II osa ülesannete 5 ja 9 alus (puutuja, kiirus).',
      can: 'Õpilane leiab argumendi ja funktsiooni muudu, keskmise muutumise kiiruse, tuletise definitsiooni järgi ning kasutab tuletiste tabelit.',
      theory: [
        r`Muudud: $\Delta x$, $\;\Delta y=f(x+\Delta x)-f(x)$; keskmine muutumise kiirus $\dfrac{\Delta y}{\Delta x}$ — *pähe*`,
        r`Tuletis: $f'(x)=\lim\limits_{\Delta x\to0}\dfrac{\Delta y}{\Delta x}$ — *pähe*`,
        r`Geomeetriline tähendus: $f'(x_0)=\tan\alpha$ on puutuja tõus; füüsikaline: $v(t)=s'(t)$, $a(t)=v'(t)$ — *pähe*`,
        r`Tuletiste tabel: $(x^n)'=nx^{n-1}$, $(\sqrt x)'=\dfrac1{2\sqrt x}$, $(e^x)'=e^x$, $(\ln x)'=\dfrac1x$, $(\sin x)'=\cos x$, $(\cos x)'=-\sin x$ — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; определение производной и её смысл учим наизусть.',
        'Средняя скорость — Δy/Δx, мгновенная — предел при Δx → 0.',
        'Производная пути — скорость, производная скорости — ускорение.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^2$ tuletis kohal $x_0=1$ definitsiooni järgi.`,
        steps: [
          r`$\Delta y=(1+\Delta x)^2-1=2\Delta x+\Delta x^2$.`,
          r`$\dfrac{\Delta y}{\Delta x}=2+\Delta x$ — lõikaja tõus (lõik $AB$, kui $\Delta x=1$).`,
          r`$f'(1)=\lim\limits_{\Delta x\to0}(2+\Delta x)=2$ — puutuja $y=2x-1$ tõus.`,
        ],
        graph: { fns: 'y = x^2\ny = 2x - 1', xmin: -1, xmax: 3, ymin: -2, ymax: 6, step: 0.5, stepY: 1, labelEvery: 2, points: 'A(1; 1)\nB(2; 4)', segments: 'A-B', caption: 'tumesinine: y = x² · roheline: puutuja y = 2x − 1 · lõik AB: lõikaja' },
      },
      practice: [
        { title: r`$f(x)=3x^2$, $x_0=1$, $\Delta x=0{,}1$.`, parts: [
          [r`Leia $\Delta y$.`, 1, '0,63', r`$3\cdot1{,}1^2-3=3{,}63-3=0{,}63$`, 1],
          [r`Leia $\dfrac{\Delta y}{\Delta x}$.`, 1, '6,3', r`$\dfrac{0{,}63}{0{,}1}=6{,}3$`, 1],
          [r`Leia $f'(1)$ definitsiooni järgi.`, 2, '6', r`$\dfrac{3(1+\Delta x)^2-3}{\Delta x}=6+3\Delta x\to6$`, 2],
        ] },
        { title: r`$f(x)=x^2+3x$.`, parts: [
          [r`Leia $f'(x)$ definitsiooni järgi.`, 2, '2x+3', r`$\Delta y=2x\Delta x+\Delta x^2+3\Delta x$; $\dfrac{\Delta y}{\Delta x}=2x+\Delta x+3\to2x+3$`, 2],
          [r`Leia $f'(-1)$.`, 1, '1', r`$-2+3=1$`, 1],
        ] },
        { title: r`Keha teepikkus on $s(t)=5t^2+2t$ (m, s).`, parts: [
          [r`Leia kiirus $v(t)$.`, 1, 'v=10t+2|10t+2', r`$v(t)=s'(t)=10t+2$`, 1],
          [r`Leia $v(3)$.`, 1, '32', r`$30+2=32$ m/s`, 1],
          ['Leia keskmine kiirus ajavahemikus 1–3 s.', 1, '22', r`$\dfrac{s(3)-s(1)}{2}=\dfrac{51-7}{2}=22$ m/s`, 1],
        ] },
        { title: 'Leia tuletis tabeli abil.', parts: [
          [r`$(x^5)'$`, 1, '5x^4|5x⁴', r`$5x^4$`, 1],
          [r`$(\sqrt x)'$`, 1, '1/(2√x)|1/(2sqrt(x))', r`$\dfrac1{2\sqrt x}$`, 1],
          [r`$(\ln x)'$`, 1, '1/x', r`$\dfrac1x$`, 1],
          [r`$(\sin x)'$`, 1, 'cos x|cosx|cos(x)', r`$\cos x$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Keha liigub sirgjooneliselt, teepikkus $s(t)=t^3-6t^2+12$ (m, s).`, parts: [
        [r`Leia kiirus $v(t)$.`, 2, '3t^2-12t|3t²-12t', r`$v(t)=s'(t)=3t^2-12t$`, 2],
        [r`Leia $v(2)$.`, 1, '-12', r`$12-24=-12$ m/s`, 1],
        ['Millal on keha hetkeliselt paigal (t > 0)?', 2, '4', r`$3t(t-4)=0$, $t>0$: $t=4$ s`, 2],
      ] },
      self: ['Leian funktsiooni muudu ja keskmise kiiruse.', 'Leian tuletise definitsiooni järgi.', 'Tean tuletise geomeetrilist ja füüsikalist tähendust.'],
    },
    {
      title: 'Tuletise leidmise eeskirjad',
      ru: 'Правила нахождения производной',
      course: 'IX',
      exam: 'II osa ülesannetes 5 ja 9 on vaja korrutise ja jagatise tuletist (nt x·eˣ, (x² + 1)/(x − 2)).',
      can: 'Õpilane leiab summa, konstandiga korrutise, korrutise ja jagatise tuletise ning arvutab tuletise väärtuse punktis.',
      theory: [
        r`$(u\pm v)'=u'\pm v'$, $\;(cu)'=cu'$ — *pähe*`,
        r`Korrutis: $(uv)'=u'v+uv'$ — *pähe*`,
        r`Jagatis: $\left(\dfrac uv\right)'=\dfrac{u'v-uv'}{v^2}$ — *pähe*`,
        r`Põhifunktsioonide tuletised ($x^n$, $\dfrac1x$, $\sqrt x$, $a^x$, $e^x$, $\log_ax$, $\ln x$, $\sin x$, $\cos x$, $\tan x$) — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных, но правил произведения и частного нет — учим наизусть.',
        'Частное: «производная числителя на знаменатель минус числитель на производную знаменателя, делённое на квадрат знаменателя».',
        'Для f′(a) сначала найди f′(x), потом подставь a.',
      ],
      example: {
        task: r`Leia tuletised: $f(x)=x^2e^x$ ja $g(x)=\dfrac{2x+1}{x-1}$.`,
        steps: [
          r`$f'(x)=2x\cdot e^x+x^2\cdot e^x=e^x(x^2+2x)$.`,
          r`$g'(x)=\dfrac{2(x-1)-(2x+1)\cdot1}{(x-1)^2}=\dfrac{-3}{(x-1)^2}$.`,
        ],
      },
      practice: [
        { title: r`$f(x)=4x^3-2\sqrt x+\dfrac5x$.`, parts: [
          [r`Leia $f'(x)$.`, 2, '12x^2-1/√x-5/x^2|12x²-1/√x-5/x²', r`$12x^2-2\cdot\dfrac1{2\sqrt x}-\dfrac5{x^2}=12x^2-\dfrac1{\sqrt x}-\dfrac5{x^2}$`, 2],
          [r`Leia $f'(1)$.`, 1, '6', r`$12-1-5=6$`, 1],
        ] },
        { title: r`$f(x)=x\ln x$.`, parts: [
          [r`Leia $f'(x)$.`, 1, 'ln x+1|lnx+1|1+lnx', r`$1\cdot\ln x+x\cdot\dfrac1x=\ln x+1$`, 1],
          [r`Leia $f'(e)$.`, 1, '2', r`$1+1=2$`, 1],
        ] },
        { title: r`$f(x)=x^2\sin x$.`, parts: [
          [r`Leia $f'(x)$.`, 2, '2xsinx+x^2cosx|2x sin x+x² cos x|2xsinx+x²cosx', r`$2x\sin x+x^2\cos x$`, 2],
          [r`Leia $f'(\pi)$.`, 1, '-π^2|-π²|-9,87', r`$2\pi\cdot0+\pi^2\cdot(-1)=-\pi^2\approx-9{,}87$`, 1],
        ] },
        { title: r`$f(x)=\dfrac{x^2+1}{x-2}$.`, parts: [
          [r`Leia $f'(x)$.`, 2, '(x^2-4x-1)/(x-2)^2|(x²-4x-1)/(x-2)²', r`$\dfrac{2x(x-2)-(x^2+1)}{(x-2)^2}=\dfrac{x^2-4x-1}{(x-2)^2}$`, 2],
          [r`Leia $f'(3)$.`, 1, '-4', r`$\dfrac{9-12-1}{1}=-4$`, 1],
          [r`Leia $f'(0)$.`, 1, '-0,25|-1/4', r`$\dfrac{-1}{4}$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=(x+1)e^x$ ja $g(x)=\dfrac{x}{x^2+1}$.`, parts: [
        [r`Leia $f'(x)$.`, 3, '(x+2)e^x|e^x(x+2)|(x+2)eˣ|xe^x+2e^x', r`$1\cdot e^x+(x+1)e^x=(x+2)e^x$`, 2],
        [r`Leia $f'(0)$.`, 1, '2', r`$2\cdot e^0=2$`, 1],
        [r`Leia $g'(x)$.`, 3, '(1-x^2)/(x^2+1)^2|(1-x²)/(x²+1)²', r`$\dfrac{1\cdot(x^2+1)-x\cdot2x}{(x^2+1)^2}=\dfrac{1-x^2}{(x^2+1)^2}$`, 3],
        [r`Lahenda võrrand $g'(x)=0$.`, 3, '-1; 1', r`$1-x^2=0$: $x=\pm1$`, 2],
      ] },
      self: ['Kasutan summa ja konstandi reeglit.', 'Leian korrutise tuletise.', 'Leian jagatise tuletise.'],
    },
    {
      title: 'Liitfunktsiooni tuletis ja teine tuletis',
      ru: 'Производная сложной функции и вторая производная',
      course: 'IX',
      exam: 'Laia riigieksami tuletise ülesannetes on peaaegu alati liitfunktsioon (e^(−2x), ln(x² + 1), sin 2x); teine tuletis — kumerus ja kiirendus.',
      can: 'Õpilane leiab liitfunktsiooni tuletise ahelreegliga, teise tuletise ning kasutab neid kiiruse ja kiirenduse leidmisel.',
      theory: [
        r`Ahelreegel: $\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)$ — väline tuletis korda sisemine tuletis — *pähe*`,
        r`Näited: $(e^{kx})'=ke^{kx}$, $\;\big(\ln g(x)\big)'=\dfrac{g'(x)}{g(x)}$, $\;\big(g(x)^n\big)'=n\,g(x)^{n-1}g'(x)$ — *pähe*`,
        r`Teine tuletis: $f''(x)=\big(f'(x)\big)'$; kiirendus $a(t)=v'(t)=s''(t)$ — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; правило сложной функции учим наизусть.',
        'Сначала производная «внешней» функции (аргумент не трогаем), потом умножаем на производную «внутренней».',
        'Вторая производная — производная от первой.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=(3x^2-1)^4$ tuletis.`,
        steps: [
          r`Väline funktsioon $u^4$, sisemine $u=3x^2-1$.`,
          r`$f'(x)=4(3x^2-1)^3\cdot6x$.`,
          r`$f'(x)=24x(3x^2-1)^3$.`,
        ],
      },
      practice: [
        { title: 'Leia tuletis.', parts: [
          [r`$\big((2x+5)^6\big)'$`, 1, '12(2x+5)^5', r`$6(2x+5)^5\cdot2$`, 1],
          [r`$\left(\sqrt{x^2+9}\right)'$`, 1, 'x/√(x^2+9)|x/√(x²+9)', r`$\dfrac{1}{2\sqrt{x^2+9}}\cdot2x=\dfrac{x}{\sqrt{x^2+9}}$`, 1],
          [r`Leia $\left(\sqrt{x^2+9}\right)'$ väärtus kohal $x=4$.`, 1, '0,8|4/5', r`$\dfrac{4}{5}$`, 1],
        ] },
        { title: 'Leia tuletis.', parts: [
          [r`$\left(e^{3x}\right)'$`, 1, '3e^(3x)|3e^{3x}', r`$3e^{3x}$`, 1],
          [r`$\big(\ln(x^2+1)\big)'$`, 1, '2x/(x^2+1)|2x/(x²+1)', r`$\dfrac{2x}{x^2+1}$`, 1],
          [r`$(\sin2x)'$`, 1, '2cos(2x)|2cos2x', r`$\cos2x\cdot2$`, 1],
        ] },
        { title: r`$f(x)=x^4-2x^3$.`, parts: [
          [r`Leia $f''(x)$.`, 2, '12x^2-12x|12x²-12x', r`$f'=4x^3-6x^2$, $f''=12x^2-12x$`, 2],
          [r`Leia $f''(2)$.`, 1, '24', r`$48-24=24$`, 1],
        ] },
        { title: r`Teepikkus $s(t)=2t^3-3t^2+t$ (m, s).`, parts: [
          [r`Leia kiirus $v(2)$.`, 1, '13', r`$v=6t^2-6t+1$, $v(2)=24-12+1=13$ m/s`, 1],
          [r`Leia kiirendus $a(2)$.`, 1, '18', r`$a=12t-6$, $a(2)=18$ m/s²`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x\,e^{-2x}$.`, parts: [
        [r`Leia $f'(x)$.`, 3, '(1-2x)e^(-2x)|e^(-2x)(1-2x)|(1-2x)e^{-2x}', r`$1\cdot e^{-2x}+x\cdot(-2)e^{-2x}=(1-2x)e^{-2x}$`, 3],
        [r`Lahenda võrrand $f'(x)=0$.`, 2, '0,5|1/2', r`$e^{-2x}>0$, seega $1-2x=0$.`, 1],
        [r`Leia $f''(x)$.`, 3, '(4x-4)e^(-2x)|4(x-1)e^(-2x)|(4x-4)e^{-2x}', r`$-2e^{-2x}+(1-2x)(-2)e^{-2x}=(4x-4)e^{-2x}$`, 3],
        [r`Leia $f''(0{,}5)$ kahe kümnendkohani.`, 2, '-0,74|-2/e', r`$(2-4)e^{-1}=-\dfrac2e\approx-0{,}74$`, 1],
      ] },
      self: ['Eristan välist ja sisemist funktsiooni.', 'Kasutan ahelreeglit.', 'Leian teise tuletise ja kiirenduse.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: IX kursus',
      ru: 'Повторение и контрольная работа: IX курс',
      course: 'IX',
      exam: 'IX kursuse teemad annavad laia riigieksami II osa ülesande 8 (trigonomeetria radiaanides) ja tuletise osa ülesannetes 5 ja 9.',
      can: 'Õpilane lahendab IX kursuse ülesandeid iseseisvalt: trigonomeetrilised funktsioonid ja võrrandid, piirväärtus, tuletis ja selle eeskirjad.',
      theory: [
        r`Paarsus, perioodilisus, kahekordse nurga valemid; tuletiste tabel — *valemilehel*`,
        r`$y=a\sin(bx)+c$: periood $\dfrac{2\pi}{|b|}$; $\sin x=a$: $x=(-1)^n\arcsin a+\pi n$; $\cos x=a$: $x=\pm\arccos a+2\pi n$; $\tan x=a$: $x=\arctan a+\pi n$ — *pähe*`,
        r`$\dfrac00$ — tegurda; $x\to\infty$ — jaga kõrgeima astmega; $\lim\limits_{x\to0}\dfrac{\sin x}x=1$ — *pähe*`,
        r`$(uv)'=u'v+uv'$, $\left(\dfrac uv\right)'=\dfrac{u'v-uv'}{v^2}$, $\big(f(g(x))\big)'=f'(g(x))g'(x)$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть тригонометрия и таблица производных; правила дифференцирования и общие решения учим наизусть.',
        'В уравнениях на отрезке выпиши все корни из нужного промежутка.',
        'Производная сложной функции — не забудь умножить на внутреннюю производную.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=\cos(3x)$ tuletis kohal $x=\dfrac\pi6$.`,
        steps: [
          r`$f'(x)=-3\sin3x$.`,
          r`$f'\left(\dfrac\pi6\right)=-3\sin\dfrac\pi2=-3$.`,
        ],
      },
      practice: [
        { title: 'Trigonomeetria.', parts: [
          [r`Leia funktsiooni $y=\sin4x$ periood.`, 1, 'π/2|1,57', r`$\dfrac{2\pi}4$`, 1],
          [r`Lahenda $\sin x=1$ lõigul $[0;2\pi]$.`, 1, 'π/2|1,57', r`$x=\dfrac\pi2$`, 1],
        ] },
        { title: 'Piirväärtus.', parts: [
          [r`$\lim\limits_{x\to2}\dfrac{x^2-2x}{x-2}$`, 1, '2', r`$x\to2$`, 1],
          [r`$\lim\limits_{x\to\infty}\dfrac{4x+3}{2x}$`, 1, '2', r`$\dfrac42$`, 1],
        ] },
        { title: 'Tuletis.', parts: [
          [r`$(x^3+2x)'$`, 1, '3x^2+2|3x²+2', r`$3x^2+2$`, 1],
          [r`$\left(e^{-x}\right)'$`, 1, '-e^(-x)|-e^{-x}', r`$-e^{-x}$`, 1],
        ] },
        { title: 'Tuletise väärtus.', parts: [
          [r`$f(x)=x\cos x$. Leia $f'(0)$.`, 1, '1', r`$\cos x-x\sin x$; $f'(0)=1$`, 1],
          [r`$f(x)=\ln(2x)$. Leia $f'(1)$.`, 1, '1', r`$\dfrac{2}{2x}=\dfrac1x$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'IX kursus: trigonomeetrilised funktsioonid, piirväärtus ja tuletis. Aega 45 minutit.', parts: [
        [r`1. Leia funktsiooni $y=3\sin2x$ periood.`, 2, 'π|3,14', r`$\dfrac{2\pi}2=\pi$`, 1],
        ['2. Leia selle funktsiooni muutumispiirkond.', 1, '[-3;3]|-3<=y<=3|-3≤y≤3', 'Amplituud 3.', 1],
        [r`3. Lahenda $\cos x=-\dfrac12$ lõigul $[0;2\pi]$.`, 2, '2π/3; 4π/3|2,09; 4,19', r`$x=\pm\dfrac{2\pi}3+2\pi n$: $\dfrac{2\pi}3$ ja $\dfrac{4\pi}3$`, 1],
        [r`4. Kirjuta võrrandi $\tan x=\sqrt3$ üldlahend.`, 2, 'π/3+πn|x=π/3+πn', r`$x=\dfrac\pi3+\pi n$`, 1],
        [r`5. Leia $\lim\limits_{x\to1}\dfrac{x^2-1}{x-1}$.`, 2, '2', r`$x+1\to2$`, 1],
        [r`6. Leia $\lim\limits_{x\to\infty}\dfrac{5x^3+x}{2x^3-4}$.`, 2, '2,5|5/2', r`$\dfrac52$`, 1],
        [r`7. $f(x)=x^3-5x$. Leia $f'(2)$.`, 2, '7', r`$3x^2-5$; $12-5=7$`, 1],
        [r`8. Leia $(x^3e^x)'$ väärtus kohal $x=1$ kahe kümnendkohani.`, 2, '10,87|4e', r`$3x^2e^x+x^3e^x$; $4e\approx10{,}87$`, 1],
        [r`9. Leia $\left(\dfrac{x}{x+1}\right)'$ väärtus kohal $x=1$.`, 2, '0,25|1/4', r`$\dfrac{(x+1)-x}{(x+1)^2}=\dfrac1{(x+1)^2}$; $\dfrac14$`, 1],
        [r`10. Leia $\big((2x-1)^5\big)'$ väärtus kohal $x=1$.`, 2, '10', r`$10(2x-1)^4$; $10$`, 1],
        [r`11. Leia $\big(\ln(3x+1)\big)'$ väärtus kohal $x=0$.`, 2, '3', r`$\dfrac{3}{3x+1}$; $3$`, 1],
        [r`12. Teepikkus $s(t)=t^3-3t$. Leia kiirendus $a(2)$.`, 2, '12', r`$v=3t^2-3$, $a=6t$; $a(2)=12$`, 1],
        [r`13. $f(x)=\sin^2x$. Leia $f'\left(\dfrac\pi4\right)$.`, 2, '1', r`$2\sin x\cos x=\sin2x$; $\sin\dfrac\pi2=1$`, 1],
      ] },
      self: ['Oskan IX kursuse kõiki ülesandetüüpe.', 'Lahendan trigonomeetrilisi võrrandeid lõigul.', 'Leian tuletisi kõigi eeskirjadega.'],
    },
    // ───────────── X kursus „Tuletise rakendused” ─────────────
    {
      title: 'Puutuja võrrand',
      ru: 'Уравнение касательной',
      course: 'X',
      exam: 'II osa ülesanne 9 (10 p) algab sageli puutuja võrrandist: punktis, paralleelne antud sirgega, tõusunurk.',
      can: 'Õpilane koostab graafiku puutuja võrrandi antud punktis, leiab puutepunkti tõusu järgi ning arvutab puutuja tõusunurga.',
      theory: [
        r`Puutuja võrrand: $y-f(x_0)=f'(x_0)(x-x_0)$ — *pähe*`,
        r`Puutuja tõus $k=f'(x_0)=\tan\alpha$, kus $\alpha$ on tõusunurk — *pähe*`,
        r`Paralleelsed sirged: $k_1=k_2$; ristuvad sirged: $k_1k_2=-1$; horisontaalne puutuja: $f'(x_0)=0$ — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных, а уравнения касательной нет — учим наизусть.',
        'Нужны три числа: x₀, f(x₀) и f′(x₀).',
        'Касательная параллельна прямой — приравниваем f′(x) к её угловому коэффициенту.',
      ],
      example: {
        task: r`Koosta funktsiooni $f(x)=x^2-4x+3$ graafiku puutuja võrrand punktis $x_0=3$.`,
        steps: [
          r`$f(3)=9-12+3=0$; $\;f'(x)=2x-4$, $f'(3)=2$.`,
          r`$y-0=2(x-3)$.`,
          r`Puutuja: $y=2x-6$.`,
        ],
        graph: { fns: 'y = x^2 - 4x + 3\ny = 2x - 6', xmin: -1, xmax: 5, ymin: -3, ymax: 6, step: 1, stepY: 1, points: 'P(3; 0)', caption: 'tumesinine: y = x² − 4x + 3 · roheline: puutuja y = 2x − 6' },
      },
      practice: [
        { title: r`Koosta funktsiooni $f(x)=x^3$ graafiku puutuja võrrand.`, parts: [
          [r`Punktis $x_0=1$.`, 1, 'y=3x-2|3x-2', r`$f(1)=1$, $f'(1)=3$: $y-1=3(x-1)$`, 1],
          [r`Punktis $x_0=-1$.`, 1, 'y=3x+2|3x+2', r`$f(-1)=-1$, $f'(-1)=3$: $y+1=3(x+1)$`, 1],
        ] },
        { title: 'Koosta puutuja võrrand.', parts: [
          [r`$f(x)=e^x$, $x_0=0$`, 1, 'y=x+1|x+1', r`$f(0)=1$, $f'(0)=1$`, 1],
          [r`$f(x)=\ln x$, $x_0=1$`, 1, 'y=x-1|x-1', r`$f(1)=0$, $f'(1)=1$`, 1],
        ] },
        { title: r`$f(x)=x^2-2x$.`, parts: [
          [r`Koosta puutuja võrrand, mis on paralleelne sirgega $y=4x+1$.`, 2, 'y=4x-9|4x-9', r`$2x-2=4$, $x_0=3$, $f(3)=3$: $y-3=4(x-3)$`, 2],
          [r`Leia $x_0$, kus puutuja tõusunurk on $45^\circ$.`, 1, '1,5|3/2', r`$\tan45^\circ=1$: $2x-2=1$`, 1],
        ] },
        { title: r`$f(x)=\sqrt x$, $x_0=4$.`, parts: [
          ['Koosta puutuja võrrand.', 2, 'y=0,25x+1|0,25x+1|y=x/4+1|x/4+1', r`$f(4)=2$, $f'(x)=\dfrac1{2\sqrt x}$, $f'(4)=\dfrac14$: $y=\dfrac14x+1$`, 2],
          [r`Leia puutuja tõusunurk kraadides kahe kümnendkohani.`, 1, '14,04', r`$\tan\alpha=0{,}25$, $\alpha\approx14{,}04^\circ$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-3x$.`, parts: [
        [r`Koosta graafiku puutuja võrrand punktis $x_0=2$.`, 3, 'y=9x-16|9x-16', r`$f(2)=2$, $f'(x)=3x^2-3$, $f'(2)=9$: $y-2=9(x-2)$, $y=9x-16$`, 3],
        ['Leia punktid, kus puutuja on horisontaalne.', 3, '(1;-2); (-1;2)', r`$3x^2-3=0$, $x=\pm1$; $f(1)=-2$, $f(-1)=2$`, 2],
        ['Millises teises punktis on puutuja paralleelne eelmise puutujaga? Leia ka selle puutuja võrrand.', 4, '(-2;-2); y=9x+16', r`$3x^2-3=9$, $x=\pm2$; teine punkt $(-2;-2)$: $y+2=9(x+2)$, $y=9x+16$`, 4],
      ] },
      self: ['Koostan puutuja võrrandi punktis.', 'Leian puutepunkti antud tõusu järgi.', 'Seon tõusu ja tõusunurga.'],
    },
    {
      title: 'Kasvamine, kahanemine ja ekstreemumid',
      ru: 'Возрастание, убывание и экстремумы',
      course: 'X',
      exam: 'II osa ülesanne 5 (10 p): kriitilised punktid, ekstreemumid ning kasvamis- ja kahanemisvahemikud tuletise abil.',
      can: 'Õpilane leiab tuletise abil kriitilised punktid, kasvamis- ja kahanemisvahemikud ning ekstreemumid, kasutades ka teist tuletist.',
      theory: [
        r`$f'(x)>0$ vahemikus — $f$ kasvab; $f'(x)<0$ — $f$ kahaneb — *pähe*`,
        r`Kriitiline punkt: $f'(x)=0$ või $f'(x)$ puudub — *pähe*`,
        r`Märgimuutus $+\to-$: maksimum; $-\to+$: miinimum; märk ei muutu — ekstreemumit ei ole — *pähe*`,
        r`Teise tuletise tunnus: $f'(x_0)=0$ ja $f''(x_0)<0$ — maksimum, $f''(x_0)>0$ — miinimum — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; признаки экстремума учим наизусть.',
        'Экстремум — это точка (x; y): найди и x, и f(x).',
        'Знак производной проверяем, подставляя число из каждого промежутка.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^3-3x^2-9x+5$ ekstreemumid.`,
        steps: [
          r`$f'(x)=3x^2-6x-9=3(x-3)(x+1)$: kriitilised punktid $-1$ ja $3$.`,
          r`Märgid: $+$, $-$, $+$. Maksimum $f(-1)=-1-3+9+5=10$.`,
          r`Miinimum $f(3)=27-27-27+5=-22$. Vastus: max $(-1;10)$, min $(3;-22)$.`,
        ],
        graph: { fns: 'y = x^3 - 3x^2 - 9x + 5', xmin: -3, xmax: 5, ymin: -25, ymax: 15, step: 1, stepY: 5, points: 'M(-1; 10)\nN(3; -22)' },
      },
      practice: [
        { title: r`$f(x)=x^2-6x+1$.`, parts: [
          ['Leia kahanemisvahemik.', 1, '(-∞;3)|x<3', r`$f'(x)=2x-6<0$, kui $x<3$.`, 1],
          ['Leia miinimumpunkt.', 1, '(3;-8)', r`$f(3)=9-18+1=-8$`, 1],
        ] },
        { title: r`$f(x)=2x^3-3x^2$.`, parts: [
          ['Leia kriitilised punktid.', 1, '0; 1', r`$f'(x)=6x^2-6x=6x(x-1)$`, 1],
          ['Leia maksimumpunkt.', 1, '(0;0)', r`Märgimuutus $+\to-$ kohal $0$; $f(0)=0$`, 1],
          ['Leia miinimumpunkt.', 1, '(1;-1)', r`$f(1)=2-3=-1$`, 1],
        ] },
        { title: r`$f(x)=x\,e^x$.`, parts: [
          ['Leia miinimumpunkt.', 2, '(-1;-0,37)|(-1;-1/e)', r`$f'(x)=(x+1)e^x=0$, $x=-1$; $f(-1)=-\dfrac1e\approx-0{,}37$`, 2],
          ['Leia kasvamisvahemik.', 1, '(-1;∞)|x>-1', r`$f'(x)>0$, kui $x>-1$.`, 1],
        ] },
        { title: r`$f(x)=x+\dfrac4x$.`, parts: [
          ['Leia kriitilised punktid.', 1, '-2; 2', r`$f'(x)=1-\dfrac4{x^2}=0$, $x^2=4$`, 1],
          [r`Leia $f''(2)$ ja otsusta, kas kohal $x=2$ on maksimum või miinimum.`, 2, '1', r`$f''(x)=\dfrac8{x^3}$, $f''(2)=1>0$: miinimum $f(2)=4$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^4-8x^2$.`, parts: [
        [r`Leia $f'(x)$.`, 2, '4x^3-16x|4x³-16x', r`$4x^3-16x$`, 1],
        ['Leia kriitilised punktid.', 2, '-2; 0; 2', r`$4x(x^2-4)=0$`, 1],
        ['Leia miinimumpunktid.', 2, '(-2;-16); (2;-16)', r`$f(\pm2)=16-32=-16$; märgimuutus $-\to+$.`, 2],
        ['Leia maksimumpunkt.', 1, '(0;0)', r`Märgimuutus $+\to-$ kohal $0$.`, 1],
        ['Leia kasvamisvahemikud.', 3, '(-2;0); (2;∞)|(-2;0)∪(2;∞)', r`Märgid: $(-\infty;-2)$ —, $(-2;0)$ +, $(0;2)$ —, $(2;\infty)$ +.`, 2],
      ] },
      self: ['Leian kriitilised punktid.', 'Määran tuletise märgid vahemikes.', 'Kasutan teise tuletise tunnust.'],
    },
    {
      title: 'Kumerus, nõgusus ja käänupunkt',
      ru: 'Выпуклость, вогнутость и точка перегиба',
      course: 'X',
      exam: 'Funktsiooni täielikus uurimises (II osa 5) küsitakse käänupunkti ning kumerus- ja nõgususvahemikke.',
      can: 'Õpilane leiab teise tuletise abil graafiku kumerus- ja nõgususvahemikud ning käänupunktid.',
      theory: [
        r`$f''(x)<0$ vahemikus — graafik on kumer (kaar ülespoole, $\cap$) — *pähe*`,
        r`$f''(x)>0$ vahemikus — graafik on nõgus (kaar allapoole, $\cup$) — *pähe*`,
        r`Käänupunkt: $f''(x_0)=0$ (või puudub) ja $f''$ muudab märki; käänupunkt on $(x_0;f(x_0))$ — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; выпуклость и перегиб учим наизусть.',
        'В эстонской школе: kumer — f″ < 0 (дуга вверх, ∩), nõgus — f″ > 0 (дуга вниз, ∪).',
        'Точка перегиба — там, где f″ меняет знак.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^3-3x^2+2$ kumerus- ja nõgususvahemik ning käänupunkt.`,
        steps: [
          r`$f'(x)=3x^2-6x$, $\;f''(x)=6x-6$.`,
          r`$f''(x)<0$, kui $x<1$ — kumer; $f''(x)>0$, kui $x>1$ — nõgus.`,
          r`Käänupunkt: $f(1)=1-3+2=0$, seega $(1;0)$.`,
        ],
        graph: { fns: 'y = x^3 - 3x^2 + 2', xmin: -2, xmax: 4, ymin: -4, ymax: 4, step: 1, stepY: 1, points: 'K(1; 0)', caption: 'y = x³ − 3x² + 2: vasakul kumer, paremal nõgus, käänupunkt K' },
      },
      practice: [
        { title: r`$f(x)=x^3-6x^2+4$.`, parts: [
          ['Leia käänupunkt.', 2, '(2;-12)', r`$f''(x)=6x-12=0$, $x=2$; $f(2)=8-24+4=-12$`, 2],
          ['Leia kumerusvahemik.', 1, '(-∞;2)|x<2', r`$f''(x)<0$, kui $x<2$.`, 1],
        ] },
        { title: r`$f(x)=x^4-6x^2$.`, parts: [
          ['Leia käänupunktid.', 2, '(-1;-5); (1;-5)', r`$f''(x)=12x^2-12=0$, $x=\pm1$; $f(\pm1)=1-6=-5$`, 2],
          ['Leia nõgususvahemikud.', 2, '(-∞;-1)∪(1;∞)|x<-1 või x>1', r`$f''(x)>0$, kui $|x|>1$.`, 2],
        ] },
        { title: 'Kas graafik on kogu määramispiirkonnas kumer või nõgus?', parts: [
          [r`$y=e^x$`, 1, 'nõgus', r`$y''=e^x>0$`, 1],
          [r`$y=\ln x$`, 1, 'kumer', r`$y''=-\dfrac1{x^2}<0$`, 1],
        ] },
        { title: r`$f(x)=x^3+ax^2+1$.`, parts: [
          [r`Leia $a$, kui käänupunkt on kohal $x=2$.`, 2, '-6', r`$f''(x)=6x+2a$; $12+2a=0$, $a=-6$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=-x^3+3x^2+9x-2$.`, parts: [
        [r`Leia $f''(x)$.`, 2, '-6x+6|6-6x', r`$f'(x)=-3x^2+6x+9$, $f''(x)=-6x+6$`, 2],
        ['Leia käänupunkt.', 3, '(1;9)', r`$-6x+6=0$, $x=1$; $f(1)=-1+3+9-2=9$`, 2],
        ['Leia kumerusvahemik.', 2, '(1;∞)|x>1', r`$f''(x)<0$, kui $x>1$.`, 1],
        ['Leia nõgususvahemik.', 1, '(-∞;1)|x<1', r`$f''(x)>0$, kui $x<1$.`, 1],
        ['Leia puutuja tõus käänupunktis.', 2, '12', r`$f'(1)=-3+6+9=12$`, 1],
      ] },
      self: ['Leian teise tuletise.', 'Leian kumerus- ja nõgususvahemikud.', 'Leian käänupunkti koordinaadid.'],
    },
    {
      title: 'Polünoomi täielik uurimine ja graafik',
      ru: 'Полное исследование многочлена и график',
      course: 'X',
      exam: 'II osa ülesanne 5 (10 p): funktsiooni täielik uurimine (nullkohad, ekstreemumid, käänupunkt) ja graafiku skitseerimine.',
      can: 'Õpilane uurib polünoomfunktsiooni täielikult kava järgi ja joonestab selle graafiku.',
      theory: [
        r`Kava: 1) määramispiirkond, 2) nullkohad ja $y$-telje lõikepunkt, 3) paarsus — *pähe*`,
        r`4) $f'(x)$, kriitilised punktid, kasvamine, kahanemine, ekstreemumid — *pähe*`,
        r`5) $f''(x)$, kumerus, nõgusus, käänupunktid; 6) väärtuste tabel ja graafik — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; план исследования учим наизусть.',
        'Многочлен определён везде, асимптот нет.',
        'Сначала отметь на рисунке все найденные точки, потом соединяй плавной линией.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=x^3-3x+2$.`,
        steps: [
          r`$X=\mathbb R$; $f(x)=(x-1)^2(x+2)$: nullkohad $-2$ ja $1$; $f(0)=2$.`,
          r`$f'(x)=3x^2-3$: max $(-1;4)$, min $(1;0)$; kasvab $(-\infty;-1)$ ja $(1;\infty)$, kahaneb $(-1;1)$.`,
          r`$f''(x)=6x$: käänupunkt $(0;2)$; kumer $x<0$, nõgus $x>0$.`,
        ],
        graph: { fns: 'y = x^3 - 3x + 2', xmin: -3, xmax: 3, ymin: -2, ymax: 6, step: 1, stepY: 1, points: 'M(-1; 4)\nN(1; 0)\nK(0; 2)\nA(-2; 0)' },
      },
      practice: [
        { title: r`$f(x)=x^3-12x$.`, parts: [
          ['Leia nullkohad.', 1, '0; -2√3; 2√3|0; -3,46; 3,46', r`$x(x^2-12)=0$`, 1],
          ['Leia maksimumpunkt.', 1, '(-2;16)', r`$f'(x)=3x^2-12=0$, $x=\pm2$; $f(-2)=-8+24=16$`, 1],
          ['Leia miinimumpunkt.', 1, '(2;-16)', r`$f(2)=8-24=-16$`, 1],
        ] },
        { title: r`$f(x)=-x^3+3x^2$.`, parts: [
          ['Leia nullkohad.', 1, '0; 3', r`$x^2(3-x)=0$`, 1],
          ['Leia maksimumpunkt.', 1, '(2;4)', r`$f'(x)=-3x^2+6x=0$: $x=0$ või $2$; $f(2)=-8+12=4$, märgid $-\to+$ kohal 0 ja $+\to-$ kohal 2.`, 1],
          ['Leia miinimumpunkt.', 1, '(0;0)', r`$f(0)=0$`, 1],
        ] },
        { title: r`$f(x)=x^4-2x^2+1$.`, parts: [
          ['Kas f on paaris, paaritu või kumbki?', 1, 'paaris', r`$f(-x)=f(x)$`, 1],
          ['Leia miinimumpunktid.', 1, '(-1;0); (1;0)', r`$f'(x)=4x^3-4x=0$; $f(\pm1)=0$`, 1],
          ['Leia maksimumpunkt.', 1, '(0;1)', r`$f(0)=1$`, 1],
        ] },
        { title: r`$f(x)=3x^4-4x^3$.`, parts: [
          ['Leia ekstreemumpunkt.', 2, '(1;-1)', r`$f'(x)=12x^3-12x^2=12x^2(x-1)$; kohal $0$ märk ei muutu, kohal $1$ — $-\to+$: min $f(1)=-1$.`, 2],
          ['Leia käänupunktid.', 2, '(0;0); (2/3;-16/27)|(0;0); (0,67;-0,59)', r`$f''(x)=36x^2-24x=12x(3x-2)$: $x=0$ ja $x=\dfrac23$; $f\left(\dfrac23\right)=\dfrac{48}{81}-\dfrac{96}{81}=-\dfrac{16}{27}$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-6x^2+9x$.`, grid: { xmin: -1, xmax: 5, ymin: -2, ymax: 6, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia nullkohad.', 2, '0; 3', r`$x(x^2-6x+9)=x(x-3)^2=0$`, 1],
        ['Leia ekstreemumpunktid.', 3, '(1;4); (3;0)', r`$f'(x)=3x^2-12x+9=3(x-1)(x-3)$; max $f(1)=4$, min $f(3)=0$`, 3],
        ['Leia käänupunkt.', 2, '(2;2)', r`$f''(x)=6x-12=0$, $x=2$; $f(2)=8-24+18=2$`, 2],
        ['Joonesta graafik.', 3, '', 'Punktid (0; 0), max (1; 4), käänupunkt (2; 2), min (3; 0), (4; 4).', 0],
      ] },
      self: ['Uurin funktsiooni kava järgi.', 'Leian ekstreemumid ja käänupunkti.', 'Joonestan graafiku leitud punktide abil.'],
    },
    {
      title: 'Murd- ja eksponentfunktsiooni uurimine',
      ru: 'Исследование дробной и показательной функции',
      course: 'X',
      exam: 'Laia riigieksami funktsiooniülesandes on sageli murdfunktsioon või funktsioon eˣ / ln x-ga: asümptoodid ja ekstreemumid.',
      can: 'Õpilane leiab murd-, eksponent- ja logaritmfunktsiooni asümptoodid, ekstreemumid ja monotoonsusvahemikud.',
      theory: [
        r`Vertikaalne asümptoot $x=a$: $f(x)\to\pm\infty$, kui $x\to a$ (nimetaja nullkoht, mis ei taandu) — *pähe*`,
        r`Horisontaalne asümptoot $y=b$: $b=\lim\limits_{x\to\pm\infty}f(x)$ — *pähe*`,
        r`Uurimise kava on sama; kriitilisi punkte otsi ainult määramispiirkonnas — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; асимптоты учим наизусть.',
        'eˣ растёт быстрее любой степени: x·e⁻ˣ → 0 при x → ∞.',
        'Для дроби производную ищем по правилу частного.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=\dfrac{x}{x^2+1}$.`,
        steps: [
          r`$X=\mathbb R$; paaritu; nullkoht $0$; $\lim\limits_{x\to\pm\infty}f(x)=0$ — asümptoot $y=0$.`,
          r`$f'(x)=\dfrac{1-x^2}{(x^2+1)^2}$: kriitilised punktid $\pm1$.`,
          r`Max $(1;0{,}5)$, min $(-1;-0{,}5)$.`,
        ],
        graph: { fns: 'y = x/(x^2 + 1)', xmin: -5, xmax: 5, ymin: -1, ymax: 1, step: 1, stepY: 0.5, points: 'M(1; 0.5)\nN(-1; -0.5)' },
      },
      practice: [
        { title: r`$f(x)=\dfrac{2x+1}{x-1}$.`, parts: [
          ['Leia asümptoodid.', 2, 'x=1; y=2', r`Nimetaja on 0, kui $x=1$; $\lim\limits_{x\to\infty}f(x)=2$`, 2],
          [r`Leia $f'(x)$. Kas f kasvab või kahaneb?`, 2, 'kahanev|kahaneb', r`$f'(x)=\dfrac{2(x-1)-(2x+1)}{(x-1)^2}=\dfrac{-3}{(x-1)^2}<0$: kahaneb mõlemas vahemikus.`, 2],
        ] },
        { title: r`$f(x)=x\,e^{-x}$.`, parts: [
          ['Leia maksimumpunkt.', 2, '(1;0,37)|(1;1/e)', r`$f'(x)=(1-x)e^{-x}=0$, $x=1$; $f(1)=\dfrac1e\approx0{,}37$`, 2],
          [r`Leia horisontaalne asümptoot, kui $x\to\infty$.`, 1, 'y=0|0', r`$\dfrac{x}{e^x}\to0$`, 1],
        ] },
        { title: r`$f(x)=x^2e^x$.`, parts: [
          ['Leia kriitilised punktid.', 1, '-2; 0', r`$f'(x)=(x^2+2x)e^x=x(x+2)e^x$`, 1],
          ['Leia maksimumpunkt.', 2, '(-2;0,54)|(-2;4/e^2)', r`Märgid $+$, $-$, $+$: max $f(-2)=\dfrac4{e^2}\approx0{,}54$; min $(0;0)$`, 2],
        ] },
        { title: r`$f(x)=\dfrac{\ln x}{x}$.`, parts: [
          ['Leia maksimumpunkt.', 2, '(e;1/e)|(2,72;0,37)', r`$f'(x)=\dfrac{1-\ln x}{x^2}=0$, $x=e$; $f(e)=\dfrac1e$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=\dfrac{4x}{x^2+4}$.`, parts: [
        ['Kas f on paaris, paaritu või kumbki?', 2, 'paaritu', r`$X=\mathbb R$; $f(-x)=-f(x)$`, 1],
        [r`Leia $f'(x)$.`, 3, '(16-4x^2)/(x^2+4)^2|(16-4x²)/(x²+4)²|4(4-x^2)/(x^2+4)^2', r`$\dfrac{4(x^2+4)-4x\cdot2x}{(x^2+4)^2}=\dfrac{16-4x^2}{(x^2+4)^2}$`, 3],
        ['Leia ekstreemumpunktid.', 3, '(2;1); (-2;-1)', r`$x=\pm2$; märgid $-$, $+$, $-$: min $f(-2)=-1$, max $f(2)=1$`, 2],
        ['Leia horisontaalne asümptoot.', 2, 'y=0|0', r`$\lim\limits_{x\to\pm\infty}\dfrac{4x}{x^2+4}=0$`, 1],
      ] },
      self: ['Leian vertikaalse ja horisontaalse asümptoodi.', 'Leian murdfunktsiooni ekstreemumid.', 'Uurin funktsioone eˣ ja ln x-ga.'],
    },
    {
      title: 'Suurim ja vähim väärtus lõigul',
      ru: 'Наибольшее и наименьшее значение на отрезке',
      course: 'X',
      exam: 'II osa ülesannetes 5 ja 9 küsitakse suurimat ja vähimat väärtust lõigul — kriitilised punktid ja otspunktid.',
      can: 'Õpilane leiab funktsiooni suurima ja vähima väärtuse lõigul, võrreldes väärtusi kriitilistes punktides ja otspunktides.',
      theory: [
        r`Lõigul pidev funktsioon saavutab suurima ja vähima väärtuse — *pähe*`,
        r`Kava: leia kriitilised punktid, jäta alles lõigul asuvad, arvuta $f$ neis ja otspunktides, vali suurim ja vähim — *pähe*`,
        r`Suurim väärtus võib olla ka otspunktis, mitte maksimumpunktis — *pähe*`,
        r`Põhifunktsioonide tuletised — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; алгоритм учим наизусть.',
        'Не забудь концы отрезка — там часто и есть ответ.',
        'Критические точки вне отрезка не считаем.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^3-3x^2$ suurim ja vähim väärtus lõigul $[-1;4]$.`,
        steps: [
          r`$f'(x)=3x^2-6x=3x(x-2)$: kriitilised punktid $0$ ja $2$ (mõlemad lõigul).`,
          r`$f(-1)=-4$, $f(0)=0$, $f(2)=-4$, $f(4)=16$.`,
          r`Suurim väärtus $16$ (otspunktis $x=4$), vähim $-4$.`,
        ],
        graph: { fns: 'y = x^3 - 3x^2', xmin: -1.5, xmax: 4.5, ymin: -6, ymax: 18, step: 1, stepY: 2, labelEvery: 2, points: 'A(-1; -4)\nB(2; -4)\nC(4; 16)' },
      },
      practice: [
        { title: r`$f(x)=x^2-4x+1$ lõigul $[0;5]$.`, parts: [
          ['Leia vähim väärtus.', 1, '-3', r`$f'(x)=2x-4=0$, $x=2$; $f(2)=-3$`, 1],
          ['Leia suurim väärtus.', 1, '6', r`$f(0)=1$, $f(5)=6$`, 1],
        ] },
        { title: r`$f(x)=2x^3-6x$ lõigul $[0;2]$.`, parts: [
          ['Leia vähim väärtus.', 1, '-4', r`$f'(x)=6x^2-6=0$, $x=1$; $f(1)=-4$`, 1],
          ['Leia suurim väärtus.', 1, '4', r`$f(0)=0$, $f(2)=16-12=4$`, 1],
        ] },
        { title: r`$f(x)=x+\dfrac1x$ lõigul $\left[\dfrac12;3\right]$.`, parts: [
          ['Leia vähim väärtus.', 1, '2', r`$f'(x)=1-\dfrac1{x^2}=0$, $x=1$; $f(1)=2$`, 1],
          ['Leia suurim väärtus.', 2, '10/3|3,33', r`$f\left(\dfrac12\right)=2{,}5$, $f(3)=\dfrac{10}3$`, 2],
        ] },
        { title: r`$f(x)=\sin x+\cos x$ lõigul $[0;\pi]$.`, parts: [
          ['Leia suurim väärtus.', 2, '√2|1,41', r`$f'(x)=\cos x-\sin x=0$, $x=\dfrac\pi4$; $f\left(\dfrac\pi4\right)=\sqrt2$`, 2],
          ['Leia vähim väärtus.', 1, '-1', r`$f(0)=1$, $f(\pi)=-1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^4-2x^2+3$ lõigul $[-2;3]$.`, parts: [
        ['Leia kriitilised punktid.', 3, '-1; 0; 1', r`$f'(x)=4x^3-4x=4x(x-1)(x+1)$`, 2],
        ['Leia funktsiooni väärtused otspunktides.', 2, '11; 66', r`$f(-2)=16-8+3=11$; $f(3)=81-18+3=66$`, 2],
        ['Leia suurim väärtus.', 2, '66', r`Võrdleme: $11$, $2$, $3$, $2$, $66$.`, 1],
        ['Leia vähim väärtus.', 3, '2', r`$f(\pm1)=1-2+3=2$; $f(0)=3$.`, 2],
      ] },
      self: ['Leian kriitilised punktid lõigul.', 'Arvutan väärtused otspunktides.', 'Valin suurima ja vähima väärtuse.'],
    },
    {
      title: 'Optimeerimisülesanded',
      ru: 'Задачи на оптимизацию',
      course: 'X',
      exam: 'II osa ülesanne 9 või 10 (10 p): eluline või geomeetriline ekstreemumülesanne — suurim ruumala, vähim materjal, suurim kasum.',
      can: 'Õpilane koostab tekstist optimeeritava suuruse funktsiooni, leiab selle ekstreemumi tuletise abil ja kirjutab sisulise vastuse.',
      theory: [
        r`Tähista muutuja $x$ ja avalda optimeeritav suurus ühe muutuja funktsioonina — *pähe*`,
        r`Leia muutuja lubatud väärtused (määramispiirkond tekstist) — *pähe*`,
        r`Lahenda $f'(x)=0$, kontrolli märgimuutust või otspunkte — *pähe*`,
        r`Kirjuta vastus küsimusele (mõõtmed, ruumala, kasum) koos ühikuga — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; план решения и формулы фигур учим наизусть.',
        'Две переменные связаны условием — выражаем одну через другую.',
        'Проверь, что найденная точка — именно максимум (или минимум), и ответь на вопрос задачи.',
      ],
      example: {
        task: 'Ruudukujulisest plekist küljega 30 cm lõigatakse nurkadest välja võrdsed ruudud ja painutatakse kaaneta karp. Milline peab olema väljalõigatud ruudu külg, et karbi ruumala oleks suurim?',
        steps: [
          r`Ruudu külg $x$, $0<x<15$: $V(x)=x(30-2x)^2$.`,
          r`$V'(x)=(30-2x)^2-4x(30-2x)=(30-2x)(30-6x)=0$: $x=5$ ($x=15$ ei sobi).`,
          r`Märgimuutus $+\to-$: maksimum. $V(5)=5\cdot20^2=2000$ cm³. Vastus: 5 cm.`,
        ],
        graph: { fns: 'y = x*(30 - 2x)^2', xmin: -1, xmax: 16, ymin: -200, ymax: 2400, step: 1, stepY: 400, labelEvery: 2, points: 'M(5; 2000)', caption: 'V(x) = x(30 − 2x)²' },
      },
      practice: [
        { title: 'Kahe positiivse arvu summa on 20.', parts: [
          ['Leia arvud, mille korrutis on suurim.', 1, '10; 10', r`$P(x)=x(20-x)$, $P'(x)=20-2x=0$, $x=10$`, 1],
          ['Leia suurim korrutis.', 1, '100', r`$10\cdot10=100$`, 1],
        ] },
        { title: 'Ristkülikukujulise aia pindala on 800 m², üks külg on vastu müüri. Ülejäänud kolm külge piiratakse aiaga.', parts: [
          ['Leia müüriga risti oleva külje pikkus, mille korral aed on lühim.', 2, '20', r`$x$ — müüriga risti, $y=\dfrac{800}{x}$: $L=2x+\dfrac{800}{x}$, $L'=2-\dfrac{800}{x^2}=0$, $x=20$`, 2],
          ['Leia aia vähim pikkus.', 1, '80', r`$y=40$; $L=40+40=80$ m`, 1],
        ] },
        { title: r`Kaanega silindrilise purgi ruumala on $54\pi$ cm³. Leia mõõtmed, mille korral kulub kõige vähem plekki.`, parts: [
          ['Leia põhja raadius.', 2, '3', r`$h=\dfrac{54}{r^2}$; $S=2\pi r^2+2\pi rh=2\pi r^2+\dfrac{108\pi}{r}$; $S'=4\pi r-\dfrac{108\pi}{r^2}=0$, $r^3=27$, $r=3$`, 2],
          ['Leia kõrgus.', 1, '6', r`$h=\dfrac{54}{9}=6$ cm`, 1],
        ] },
        { title: r`Parabooli $y=x^2$ punktidest leia need, mis on punktile $A(0;2)$ kõige lähemal.`, parts: [
          ['Leia punktide y-koordinaat.', 2, '1,5|3/2', r`$d^2=x^2+(x^2-2)^2=x^4-3x^2+4$; $(d^2)'=4x^3-6x=0$: $x^2=1{,}5$, $y=1{,}5$`, 2],
          ['Leia vähim kaugus kahe kümnendkohani.', 1, '1,32|√7/2', r`$d^2=2{,}25-4{,}5+4=1{,}75$, $d=\sqrt{1{,}75}\approx1{,}32$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Ettevõtte kasum (tuhandetes eurodes) on $P(x)=-2x^3+30x^2-96x+50$, kus $x$ on toodangu maht tuhandetes tükkides, $0\le x\le10$.`, parts: [
        [r`Leia $P'(x)$.`, 2, '-6x^2+60x-96|-6x²+60x-96', r`$-6x^2+60x-96$`, 1],
        ['Leia kriitilised punktid.', 2, '2; 8', r`$-6(x^2-10x+16)=-6(x-2)(x-8)=0$`, 1],
        ['Mitu tuhat toodet tuleb toota, et kasum oleks suurim?', 1, '8', 'Kohal x = 8 märgimuutus + → −.', 1],
        ['Leia suurim kasum.', 3, '178', r`$P(8)=-1024+1920-768+50=178$; võrdleme otspunktidega: $P(0)=50$, $P(10)=90$. Suurim kasum 178 000 €.`, 2],
        ['Leia vähim kasum lõigul [0; 10].', 2, '-38', r`$P(2)=-16+120-192+50=-38$ (kahjum 38 000 €).`, 1],
      ] },
      self: ['Koostan tekstist funktsiooni.', 'Leian ekstreemumi ja kontrollin seda.', 'Kirjutan sisulise vastuse ühikuga.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: X kursus',
      ru: 'Повторение и контрольная работа: X курс',
      course: 'X',
      exam: 'X kursuse teemad annavad laia riigieksami II osa ülesanded 5 (funktsiooni uurimine) ja 9–10 (puutuja, optimeerimine).',
      can: 'Õpilane lahendab X kursuse ülesandeid iseseisvalt: puutuja, ekstreemumid, kumerus, funktsiooni uurimine, suurim ja vähim väärtus, optimeerimine.',
      theory: [
        r`$y-f(x_0)=f'(x_0)(x-x_0)$; paralleelne sirgega — sama tõus — *pähe*`,
        r`$f'>0$ kasvab, $f'<0$ kahaneb; märgimuutus $+\to-$ max, $-\to+$ min — *pähe*`,
        r`$f''<0$ kumer, $f''>0$ nõgus; käänupunktis $f''$ muudab märki — *pähe*`,
        r`Lõigul: võrdle kriitilisi punkte ja otspunkte; tuletiste tabel — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть таблица производных; правила применения производной учим наизусть.',
        'Экстремум — точка (x; y), а не только x.',
        'В задаче на оптимизацию сначала функция одной переменной.',
      ],
      example: {
        task: r`Leia funktsiooni $f(x)=x^2-2x$ graafiku puutuja punktis $x_0=2$.`,
        steps: [
          r`$f(2)=0$, $f'(x)=2x-2$, $f'(2)=2$.`,
          r`$y=2(x-2)=2x-4$.`,
        ],
      },
      practice: [
        { title: 'Puutuja.', parts: [
          [r`$f(x)=x^2$. Koosta puutuja võrrand punktis $x_0=-1$.`, 1, 'y=-2x-1|-2x-1', r`$f(-1)=1$, $f'(-1)=-2$`, 1],
          [r`$f(x)=e^{2x}$. Leia puutuja tõus kohal $x=0$.`, 1, '2', r`$2e^0=2$`, 1],
        ] },
        { title: 'Ekstreemumid.', parts: [
          [r`Leia funktsiooni $f(x)=x^2+4x$ miinimumpunkt.`, 1, '(-2;-4)', r`$2x+4=0$`, 1],
          [r`Leia funktsiooni $f(x)=-x^2+2x+3$ maksimum.`, 1, '4', r`$x=1$, $f(1)=4$`, 1],
        ] },
        { title: 'Kumerus.', parts: [
          [r`Leia funktsiooni $f(x)=x^3-6x^2$ käänupunkt.`, 1, '(2;-16)', r`$f''=6x-12$; $f(2)=8-24=-16$`, 1],
          [r`Kas $y=-x^2$ graafik on kumer või nõgus?`, 1, 'kumer', r`$y''=-2<0$`, 1],
        ] },
        { title: 'Lõigul.', parts: [
          [r`Leia $f(x)=x^2$ suurim väärtus lõigul $[-3;2]$.`, 1, '9', r`$f(-3)=9$, $f(2)=4$, $f(0)=0$`, 1],
          [r`Leia $f(x)=x^2$ vähim väärtus lõigul $[1;3]$.`, 1, '1', r`Haripunkt x = 0 ei ole lõigul: $f(1)=1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'X kursus: tuletise rakendused. Aega 45 minutit.', parts: [
        [r`1. Koosta funktsiooni $f(x)=x^2-3x$ graafiku puutuja võrrand punktis $x_0=1$.`, 3, 'y=-x-1|-x-1', r`$f(1)=-2$, $f'(x)=2x-3$, $f'(1)=-1$: $y+2=-(x-1)$, $y=-x-1$`, 2],
        ['2. Leia koht, kus selle funktsiooni puutuja on horisontaalne.', 2, '1,5|3/2', r`$2x-3=0$`, 1],
        [r`3. $g(x)=x^3-12x+1$. Leia kriitilised punktid.`, 2, '-2; 2', r`$3x^2-12=0$`, 1],
        ['4. Leia g maksimumpunkt.', 2, '(-2;17)', r`$g(-2)=-8+24+1=17$`, 1],
        ['5. Leia g miinimumpunkt.', 2, '(2;-15)', r`$g(2)=8-24+1=-15$`, 1],
        ['6. Leia g kahanemisvahemik.', 2, '(-2;2)|-2<x<2', r`$g'(x)<0$, kui $-2<x<2$.`, 1],
        [r`7. $h(x)=x^3-3x^2$. Leia käänupunkt.`, 2, '(1;-2)', r`$h''(x)=6x-6=0$, $h(1)=-2$`, 1],
        ['8. Leia h kumerusvahemik.', 2, '(-∞;1)|x<1', r`$h''(x)<0$, kui $x<1$.`, 1],
        [r`9. Leia funktsiooni $y=\dfrac{x+2}{x-1}$ asümptoodid.`, 2, 'x=1; y=1', r`$x=1$; $\lim\limits_{x\to\infty}y=1$`, 1],
        [r`10. Leia $f(x)=x^3-3x$ suurim väärtus lõigul $[0;2]$.`, 2, '2', r`$f(0)=0$, $f(1)=-2$, $f(2)=2$`, 1],
        ['11. Leia selle funktsiooni vähim väärtus samal lõigul.', 1, '-2', r`$f(1)=-2$`, 1],
        ['12. Ristküliku ümbermõõt on 40 cm. Leia suurim võimalik pindala.', 3, '100', r`$S(x)=x(20-x)$, $S'(x)=20-2x=0$, $x=10$: ruut, $S=100$ cm²`, 2],
      ] },
      self: ['Oskan X kursuse kõiki ülesandetüüpe.', 'Uurin funktsiooni tuletise abil.', 'Lahendan optimeerimisülesande.'],
    },
  ],
};
